# alexwang24/moge-2-vitb-normal-web

## Resumen

MoGe-2 ViT-B normal es un modelo de estimación de profundidad y normales de superficie desarrollado originalmente por Microsoft (repositorio MoGe) y publicado en HuggingFace bajo el identificador `Ruicheng/moge-2-vitb-normal`. Esta variante concreta, `alexwang24/moge-2-vitb-normal-web`, es un reempaquetado del modelo original orientado a su ejecución en el navegador mediante ONNX Runtime Web, exportado siguiendo la documentación oficial de MoGe y dividido en dos ficheros para facilitar la descarga desde una página web.

El modelo resuelve dos tareas de visión por computador estrechamente relacionadas: la estimación de profundidad monocular (a partir de una sola imagen) y la predicción de normales de superficie, lo que permite reconstruir la geometría de una escena y aplicar técnicas de reiluminación. La arquitectura se basa en un backbone ViT-B (Vision Transformer, variante base) con una cabeza específica para normales, y el paquete incluye los pesos en fp16 para reducir a la mitad el tamaño de descarga (210 MB frente a los 419 MB del modelo completo en fp32) sin degradar la precisión de forma apreciable.

Su relevancia actual radica en que demuestra un flujo de despliegue práctico de modelos de visión en el cliente (navegador), sin necesidad de servidor de inferencia, manteniendo la computación en fp32 tras la reconstrucción de pesos. Está pensado para aplicaciones interactivas de gráficos, como la reiluminación en tiempo real que implementa Afterlux.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B) con cabeza de normales de superficie y estimación de profundidad |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp32 (modelo completo) y fp16 (pesos empaquetados para descarga); computación final en fp32 |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma) |
| Licencia | MIT, con los términos Apache 2.0 que arrastra DINOv2 |
| Formato de pesos | ONNX (grafo `moge-2-vitb-normal.onnx` de 0,4 MB + pesos externos `weights.bin` en fp32; fichero `moge-2-vitb-normal.f16` de 210 MB con pesos fp16) |

## Arquitectura y entrenamiento

El modelo original MoGe-2 emplea un backbone Vision Transformer en su variante base (ViT-B) sobre el que se añaden cabezas de predicción para profundidad y normales de superficie. Esta variante concreta incluye la cabeza de normales (`normal`), lo que permite obtener simultáneamente un mapa de profundidad y un campo de normales por píxel. El backbone ViT-B está vinculado a DINOv2, de ahí que la licencia MIT del modelo arrastre los términos Apache 2.0 de DINOv2.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino por preferencias (poco habituales en modelos de visión geométrica). La innovación técnica destacable de este reempaquetado es el proceso de exportación a ONNX y la estrategia de empaquetado: los pesos se almacenan en fp16 en el orden de inicialización del grafo y la página web los reconvierte a fp32 antes de pasarlos a ONNX Runtime Web, de modo que la inferencia se ejecuta en fp32 mientras que la descarga se reduce a la mitad. Según el autor, frente al modelo completo en fp32 las normales difieren en 0,02° en la mediana y 0,07° en el percentil 99.

## Capacidades

- Estimación de profundidad monocular a partir de una única imagen RGB.
- Predicción de normales de superficie por píxel, útil para reconstrucción geométrica y reiluminación.
- Ejecución en navegador mediante ONNX Runtime Web, sin backend de servidor.
- Conversión interna de pesos fp16 a fp32 para mantener la precisión de cómputo.
- Integración en pipelines de gráficos interactivos (el caso documentado es la reiluminación de Afterlux).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual.
- No se documentan capacidades multilingües ni modos especiales como thinking, visión general o audio.

## Casos de uso

- Reiluminación interactiva en el navegador: tal como lo emplea Afterlux, el modelo proporciona normales de superficie y profundidad que permiten recolocar fuentes de luz virtuales sobre una fotografía sin servidor de inferencia, aprovechando la ejecución con ONNX Runtime Web.
- Edición fotográfica basada en geometría: obtener un mapa de normales y profundidad para aplicar efectos de relieve, sombreado o desenfoque selectivo por distancia en herramientas web de retoque.
- Previsualización de assets 3D a partir de una foto: estimar la geometría aproximada de un objeto para generar un boceto de malla o un mapa de normales que sirva de referencia en un editor 3D ligero.
- Realidad aumentada en el cliente: calcular profundidad por fotograma para ocluir objetos virtuales detrás de elementos reales en aplicaciones web o híbridas, con descarga inicial de 210 MB y cómputo local.
- Prototipado rápido de pipelines de visión: servir como modelo de referencia para validar una aplicación de profundidad y normales antes de migrar a un despliegue con GPU en servidor.
- Docencia y demos técnicas: ejemplo práctico de exportación ONNX, empaquetado de pesos fp16 y ejecución en el navegador para ilustrar flujos de despliegue de modelos de visión en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo aportado por el autor es la desviación de las normales respecto al modelo fp32 completo: 0,02° en la mediana y 0,07° en el percentil 99.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo completo en fp32 ocupa 419 MB y la descarga empaquetada en fp16 es de 210 MB, por lo que la huella de memoria es moderada.
- GPU recomendadas: no disponibles; al ejecutarse en navegador mediante ONNX Runtime Web, puede aprovechar aceleración por WebGPU o WASM según el cliente.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño reducido de los pesos, aunque no se documentan requisitos mínimos concretos.
- Opciones de despliegue: ONNX Runtime Web (caso documentado), y en servidor cualquier runtime compatible con ONNX (no verificado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alexwang24/moge-2-vitb-normal-web | no disponible (ViT-B) | no aplica | Profundidad + normales, ONNX para navegador | MIT (con Apache 2.0 de DINOv2) | HuggingFace, 0 descargas |
| Ruicheng/moge-2-vitb-normal | no disponible (ViT-B) | no aplica | Profundidad + normales, pesos originales | MIT | HuggingFace (modelo base) |
| Otros estimadores de profundidad monocular | no disponible | no aplica | Profundidad | variable | no disponible |

La información proporcionada no permite establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de visión: no genera texto, no razona y no admite instrucciones en lenguaje natural; cualquier uso debe plantearse como componente de un pipeline visual.
- Riesgo de error geométrico en escenas con poca textura, superficies reflectantes o iluminación extrema, habitual en estimación monocular de profundidad; no se documentan métricas de error absoluto en la información disponible.
- La licencia MIT arrastra los términos Apache 2.0 de DINOv2, por lo que conviene revisar ambas licencias antes de un uso comercial.
- El paquete está pensado para descarga web: el fichero fp16 (210 MB) debe convertirse a fp32 en el cliente, lo que añade un paso de procesamiento y memoria en el navegador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es un reempaquetado de terceros, no una publicación oficial de Microsoft, y su mantenimiento no está garantizado.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos visuales puede heredar sesgos de representación de los datasets originales (no detallados).

## Enlaces

- HuggingFace del reempaquetado: https://huggingface.co/alexwang24/moge-2-vitb-normal-web
- Modelo base: https://huggingface.co/Ruicheng/moge-2-vitb-normal
- Repositorio oficial de MoGe (Microsoft): https://github.com/microsoft/MoGe
- Aplicación que lo utiliza: https://afterlux.app
