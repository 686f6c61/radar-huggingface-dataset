# d30social/ormbg-ortweb

## Resumen

ORMBG-ORTWeb es una exportación a ONNX del modelo Open Remove Background Model (ORMBG) parcheada específicamente para ejecutarse en el navegador mediante onnxruntime-web, tanto sobre el backend WASM como sobre WebGPU. Lo publica el usuario d30social y reutiliza íntegramente los pesos del modelo original schirrmacher/ormbg, por lo que no introduce reentrenamiento ni cambios en el resultado de la segmentación. Su propósito es permitir la eliminación de fondos de imagen en cliente, sin enviar datos a un servidor.

El modelo hereda la arquitectura de segmentación de imágenes de tipo ISNet (etiquetada como `isnet` en el repositorio) y resuelve una tarea de image-segmentation con una máscara de primer plano en escala de grises. La entrada es estática, con forma fija `[1, 3, 1024, 1024]`, lo cual es clave para entender el parche aplicado y su carácter sin pérdida. El repositorio ocupa 0,3 GB e incluye dos variantes en ONNX: fp32 (~168 MB) y fp16 (~84 MB).

Su relevancia actual radica en que habilita inferencia de segmentación de primer plano directamente en el navegador a través de Transformers.js, un escenario en el que las exportaciones ONNX convencionales fallaban por una incompatibilidad concreta de onnxruntime-web. Es, por tanto, una pieza de infraestructura para despliegues web sin backend de cómputo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ISNet (red de segmentación de imágenes; etiqueta `isnet` del repositorio) |
| Parametros totales | no disponible (el fichero fp32 ocupa ~168 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión con entrada estática `[1, 3, 1024, 1024]`) |
| Tipos de cuantizacion | fp32 y fp16 (dos ficheros ONNX separados) |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (transformers.js / onnxruntime-web) |

## Arquitectura y entrenamiento

El modelo es una red de segmentación binaria de primer plano basada en ISNet, exportada a un grafo ONNX y preparada para ejecutarse con onnxruntime-web. No se ha realizado ningún reentrenamiento: los pesos son idénticos a los del modelo original ORMBG de Maximilian Schirrmacher, y la exportación base procede de onnx-community/ormbg-ONNX. La entrada es estática y de resolución fija `[1, 3, 1024, 1024]`, lo que condiciona todo el comportamiento del grafo.

La única modificación respecto a la exportación upstream es un parche de grafo: los 33 nodos `MaxPool` tenían `ceil_mode=1` y se han cambiado a `ceil_mode=0`. La razón es que onnxruntime-web no soporta el cálculo de formas en tiempo de ejecución basado en `ceil` para `MaxPool`, y la inferencia abortaba con el error «using ceil() in shape computation is not yet supported for MaxPool». El autor justifica que el cambio es sin pérdida porque, al ser la entrada estática y con dimensiones pares en todas las etapas de pooling, los modos ceil y floor producen formas de salida idénticas; lo verifica con `max|diff| = 0` frente a la exportación upstream en ONNX Runtime completo. No hay información sobre el dataset de entrenamiento original, el número de tokens o el uso de RLHF/DPO, ya que se trata de un modelo de visión.

## Capacidades

- Eliminación de fondo de imágenes: genera una máscara de primer plano en escala de grises (matte, canal alfa) para separar el sujeto del fondo.
- Segmentación de imágenes (`image-segmentation`) como tarea declarada del pipeline.
- Inferencia en navegador: ejecutable en cliente mediante onnxruntime-web sobre WASM y WebGPU.
- Integración con Transformers.js a través del pipeline `image-segmentation`.
- Ejecución sin backend: no requiere servidor ni envío de imágenes a terceros.
- Soporte de dos precisiones: fp32 y fp16, esta última con una diferencia verificada de ≤ 1/255 en el canal alfa frente a fp32.
- No dispone de tool calling, agentes, capacidades multilingües ni modos de razonamiento, al ser un modelo puramente visual.

## Casos de uso

- Edición de fotos en el navegador: un editor web puede cargar el modelo con Transformers.js y aplicar la máscara generada para recortar o sustituir el fondo sin subir la imagen a ningún servidor, lo que reduce costes y mejora la privacidad.
- Generación de avatares y fotos de perfil: plataformas que necesitan recortar automáticamente al sujeto pueden ejecutar el modelo en cliente y devolver una imagen con fondo transparente al instante.
- Catálogos de comercio electrónico: procesado por lotes de fotos de producto para homogeneizar fondos (por ejemplo, fondo blanco) antes de publicarlas, ejecutando la segmentación en el propio dispositivo del operador.
- Herramientas de diseño y maquetación: integración en aplicaciones tipo editor gráfico que necesitan aislar elementos de una imagen para reutilizarlos como capas, con el modelo corriendo en WebGPU para acelerar la inferencia.
- Aplicaciones de privacidad estricta: sectores como salud, banca o legal, donde no está permitido enviar imágenes a la nube, pueden realizar la eliminación de fondo localmente gracias a la ejecución 100 % en navegador.
- Procesado offline en aplicaciones web progresivas (PWA): una PWA puede cachear el modelo ONNX y ofrecer recorte de fondos sin conexión, útil en entornos con conectividad limitada.
- Prototipado rápido de demos de segmentación: al publicarse con `library_name: transformers.js`, permite levantar una demostración funcional en pocas líneas de JavaScript sin infraestructura de GPU en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica aportada por el autor es la verificación de equivalencia numérica frente a la exportación upstream: `max|diff| = 0` en fp32 sobre imágenes de prueba, y una diferencia de ≤ 1/255 en el canal alfa para la variante fp16 respecto a fp32.

## Requisitos de hardware

- Diseñado para inferencia en navegador, no para servidores de GPU: el objetivo es ejecutarse con onnxruntime-web sobre WASM (CPU) o WebGPU (aceleración por GPU del dispositivo cliente).
- VRAM estimada: no disponible de forma explícita. Como referencia de tamaño, el fichero fp32 ocupa ~168 MB y el fp16 ~84 MB, por lo que el consumo de memoria del grafo es moderado para los estándares actuales.
- GPU recomendadas: no se especifican; cualquier GPU compatible con WebGPU en un navegador moderno sería candidata, pero no hay lista certificada en la información disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí en equipos con soporte WebGPU, aunque no se aportan requisitos mínimos concretos. La variante de ~84 MB (fp16) reduce la huella respecto a la de 168 MB.
- Opciones de despliegue: Transformers.js con dispositivo `webgpu` y `dtype` fp32 o fp16; también puede ejecutarse con onnxruntime-web directamente (WASM o WebGPU). No está pensado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. Dependerán del backend (WASM frente a WebGPU), del dispositivo y de la resolución fija de entrada de 1024 × 1024.

## Comparativa con modelos similares

| Modelo | Formato | Entrada | Licencia | Uso en navegador | Notas |
|---|---|---|---|---|---|
| d30social/ormbg-ortweb | ONNX (fp32/fp16) | 1024 × 1024 estática | Apache-2.0 | Sí (onnxruntime-web, WebGPU/WASM) | Parche `ceil_mode` 1→0 en 33 MaxPool |
| schirrmacher/ormbg | Pesos originales (PyTorch) | no disponible | Apache-2.0 | No (requiere backend) | Modelo original ORMBG |
| onnx-community/ormbg-ONNX | ONNX | 1024 × 1024 estática | Apache-2.0 | No (falla en onnxruntime-web por `ceil_mode`) | Exportación base previa al parche |

No se dispone de comparativas de rendimiento cuantitativas frente a otros modelos de eliminación de fondo (por ejemplo, variantes tipo U2-Net o BiRefNet) en la información proporcionada.

## Limitaciones y advertencias

- Entrada estática de resolución fija `[1, 3, 1024, 1024]`: cualquier imagen debe redimensionarse a 1024 × 1024 antes de la inferencia, lo que puede afectar a la precisión en imágenes muy alargadas o con sujetos pequeños.
- El parche `ceil_mode` 1→0 está justificado como sin pérdida únicamente bajo la condición de entrada estática con dimensiones pares; si se modificara la resolución de entrada del grafo, esa equivalencia dejaría de estar garantizada.
- Al ser una exportación de pesos existentes, hereda cualquier sesgo o limitación del modelo ORMBG original, sobre el que no se detalla información de sesgos en la documentación disponible.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; en su lugar existe riesgo de máscaras imperfectas (bordes imprecisos, pelo, detalles finos, fondos complejos), aunque no se cuantifica en la información disponible.
- La variante fp16 introduce una diferencia de hasta 1/255 en el canal alfa, despreciable en la mayoría de casos pero relevante en flujos que exijan exactitud bit a bit.
- La ejecución depende del soporte del navegador para WebGPU o WASM; en equipos sin WebGPU, el rendimiento sobre WASM puede ser notablemente inferior.
- Uso comercial permitido por la licencia Apache-2.0, siempre que se conserven los avisos de atribución correspondientes al modelo original y a la exportación base.
- En producción se recomienda fijar la revisión (commit hash) del repositorio, tal y como sugiere la propia documentación del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d30social/ormbg-ortweb
- Modelo original ORMBG (schirrmacher/ormbg): https://huggingface.co/schirrmacher/ormbg
- Exportación ONNX base (onnx-community/ormbg-ONNX): https://huggingface.co/onnx-community/ormbg-ONNX
- Transformers.js: https://github.com/huggingface/transformers.js
