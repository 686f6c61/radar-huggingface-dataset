# ADI98211/deepbump-normal-onnx

## Resumen

DeepBump ONNX es un modelo de visión por computador de propósito específico que predice un mapa de normales en espacio tangente a partir de una textura de material (piedra, ladrillo, madera, tela). El repositorio `ADI98211/deepbump-normal-onnx` no es un entrenamiento nuevo: es un espejo del artefacto `deepbump_normal.onnx`, una exportación a formato ONNX de los pesos del proyecto DeepBump de Hugo Tini, distribuida originalmente en el repositorio `Wszelkiebro/reliquary-deepbump-normal`. El modelo permite que una superficie plana muestre detalle de relieve bajo iluminación en flujos de trabajo PBR, sin necesidad de modelado geométrico.

El problema que resuelve es acotado y concreto: generar el canal de normales de un material a partir de una imagen de luminancia de 256 × 256 píxeles, con salida de tres canales codificados en `[0,1]`. No es un modelo de reconstrucción 3D, no produce mapas de profundidad ni mallas, y su salida es una estimación de detalle superficial, no una medición geométrica. Su relevancia práctica está en que el artefacto pesa unos 26,71 MB, se ejecuta en ONNX Runtime (incluida la variante web) y puede integrarse en herramientas de autoría de materiales, motores de juego o aplicaciones de navegador.

La información disponible no detalla la topología interna, el número de parámetros ni el conjunto de entrenamiento; la model card indica además que en esta subida no se ha vuelto a ejecutar una evaluación de calidad de inferencia. La licencia es GPL-3.0 y la etiqueta de idioma es `zh`, que afecta a la documentación del repositorio, no a una capacidad lingüística del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de inferencia image-to-image exportada a ONNX; la información disponible no detalla la topología interna (capas, bloques o profundidad) |
| Parametros totales | no disponible (no se documenta el recuento; el artefacto ONNX ocupa 26.706.979 bytes, ~26,71 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 256 × 256 píxeles, 1 canal, formato NCHW, rango `[0,1]` |
| Tipos de cuantizacion | no disponible; se distribuye un único archivo `.onnx` sin especificar el tipo numérico de los pesos |
| Idiomas soportados | `zh` según metadatos del repositorio (documentación); el modelo no procesa texto |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (`deepbump_normal.onnx`) |
| Salida | 3 canales de normal, codificados en `[0,1]` |
| Convencion de normales | DirectX por defecto; para OpenGL, invertir el canal verde (`G_new = 1 - G` en codificación `[0,1]`) |
| Estrategia para imagenes grandes | Inferencia por bloques solapados, mezcla en el ensamblado y normalización del vector normal antes de exportar a PNG |
| Huella en disco | 26,71 MB (modelo) + texto de licencia |
| SHA256 | `3a2ababc5fa652b19040a0f3d639b71826368e52ad805cf70ffb0e7c96a54d67` |

## Arquitectura y entrenamiento

La información proporcionada describe el artefacto como un grafo ONNX para inferencia image-to-image, con una entrada de luminancia de 256 × 256 y una salida de tres canales de normales. No se especifica en la documentación disponible la familia arquitectónica exacta, el número de capas, el tamaño del campo receptivo ni si emplea conexiones residuales o normalizaciones intermedias. Tampoco se documenta el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de ajuste con preferencias humanas, algo que no aplica en un modelo de regresión de píxeles de este tipo.

Sí se detallan las decisiones de ingeniería que condicionan el uso en producción: inferencia por parches con solapamiento para cubrir imágenes de mayor resolución, mezcla de los parches en la reconstrucción y normalización de los vectores resultantes antes de codificar el PNG. El modelo asume la convención DirectX y ofrece una conversión explícita a OpenGL mediante la inversión del canal verde. La lectura de imagen, la conversión a luminancia, el troceado, el ensamblado y la exportación corren a cargo de la aplicación que lo invoca, no del grafo ONNX.

## Capacidades

- Predicción de mapas de normales en espacio tangente a partir de texturas de material, con salida de tres canales codificados en `[0,1]`.
- Procesamiento de imágenes de entrada de 256 × 256 píxeles en un solo canal de luminancia, en disposición NCHW.
- Inferencia sobre imágenes de mayor resolución mediante troceado con solapamiento, mezcla en las costuras y normalización vectorial.
- Compatibilidad con la convención DirectX y conversión documentada a OpenGL mediante inversión del canal verde.
- Ejecución en entornos compatibles con ONNX Runtime, incluida la integración vía ONNX Runtime Web en aplicaciones de navegador.
- Orientación a flujos PBR: materiales de piedra, ladrillo, madera o tela.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No incorpora visión semántica general, audio, vídeo ni modo de razonamiento explícito.

## Casos de uso

- Generación de mapas de normales en pipelines de materiales PBR: el modelo recibe la textura de color convertida a luminancia y devuelve el canal de normales, que se conecta directamente a los shaders de un motor de juego o a Blender para simular relieve en superficies planas.
- Automatización por lotes de bibliotecas de texturas: al ejecutarse en ONNX Runtime, puede envolverse en un script que recorra un directorio de materiales y genere el canal de normales de cada uno, con troceado automático para imágenes superiores a 256 × 256.
- Herramientas de autoría en el navegador: la integración con ONNX Runtime Web permite ofrecer una utilidad cliente-side en la que el artista suelte una textura y obtenga el mapa de normales sin subir el asset a un servidor.
- Previsualización rápida en prototipado de entornos: para blockouts y escenas de prueba donde no se justifica modelar detalle geométrico, el modelo aporta percepción de relieve en muros, suelos y revestimientos.
- Enriquecimiento de assets en un pipeline de integración continua: un paso automatizado puede añadir o regenerar el canal de normales al importar texturas, y marcarlas para revisión humana cuando el material tenga sombras o brillos que degraden la estimación.
- Visualización arquitectónica y de producto: aplicación de detalle superficial a materiales de catálogo (ladrillo, madera, textil) en renders de interiorismo, con la advertencia de que el resultado es una estimación de detalle, no geometría real.
- Docencia y experimentación en gráficos por computador: el reducido tamaño del artefacto y su formato ONNX facilitan demostraciones reproducibles de generación de normales y de conversión entre convenciones DirectX y OpenGL.
- Conversión de activos heredados: generación de normales para materiales antiguos que solo disponen de mapa difuso, como paso previo a una revisión manual de intensidad y costuras en el renderizador de destino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que en esta subida no se ha vuelto a ejecutar una evaluación de calidad de inferencia, por lo que no existen métricas cuantitativas de error angular, PSNR ni comparativas numéricas con otras herramientas.

## Requisitos de hardware

- VRAM estimada: muy baja; el artefacto ONNX ocupa 26,71 MB y la entrada es de 256 × 256 × 1. No se publica una cifra oficial de memoria en inferencia, pero el modelo está claramente en el rango de ejecución en CPU.
- GPU recomendadas: no se especifican. Cualquier GPU con soporte de un execution provider de ONNX Runtime (CUDA, DirectML, TensorRT) puede acelerar la inferencia; no es un modelo que requiera A100 ni H100.
- GPU de consumo: cabe en cualquier GPU de consumo, e incluso en iGPU y en CPU, dado el tamaño del grafo y de la entrada.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, TensorRT), ONNX Runtime Web en navegador, y contenedores propios que invoquen la API de ONNX Runtime. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del execution provider, del hardware y del número de parches necesarios para cubrir la imagen de entrada; el coste escala con el área de la imagen por el troceado a 256 × 256.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepBump ONNX (este repositorio) | no disponible (~26,71 MB de grafo) | imagen 256 × 256, 1 canal | ONNX | GPL-3.0 | espejo en HuggingFace, sin soporte del autor original |
| DeepBump original (HugoTini/DeepBump) | no disponible | imagen 256 × 256, 1 canal | pesos del proyecto original | GPL-3.0 | repositorio GitHub del autor |
| DeepBump, espejo `Wszelkiebro/reliquary-deepbump-normal` | no disponible | imagen 256 × 256, 1 canal | no disponible | GPL-3.0 | repositorio HuggingFace de origen de esta conversión |
| Herramientas de generación de normales de propósito general (p. ej. suites de autoría PBR) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

La comparación cuantitativa de calidad frente a otras herramientas no está disponible: no se han publicado métricas en la documentación consultada y esta copia no ha sido reevaluada.

## Limitaciones y advertencias

- El resultado es una estimación de detalle superficial; no es un mapa de profundidad ni una reconstrucción geométrica 3D, y no debe usarse para reconstruir personas, productos o escenas completas.
- Sensibilidad a la iluminación de la textura de entrada: sombras marcadas, especulares, perspectiva y patrones de color pueden degradar la predicción de relieve.
- Resolución nativa de 256 × 256: las imágenes grandes requieren troceado, lo que puede introducir artefactos o discontinuidades en las costuras si la mezcla no se ajusta.
- La convención por defecto es DirectX; usar el modelo en un renderizador OpenGL sin invertir el canal verde produce iluminación incorrecta.
- No se ha reevaluado la calidad de inferencia en esta subida, y el repositorio no representa una publicación oficial del autor original.
- Licencia GPL-3.0: es una licencia copyleft; la integración o redistribución dentro de un producto puede obligar a liberar el código combinado. Conviene revisar el texto de `LICENSE` antes de un uso comercial.
- La etiqueta de idioma `zh` describe la documentación del repositorio; no implica capacidades multilingües ni procesamiento de texto.
- El repositorio declara 0 descargas y 0 likes, sin soporte ni mantenimiento documentado; es un espejo de archivo.
- Sesgos conocidos: no documentados en la información disponible; al ser un modelo de regresión de píxeles, su comportamiento depende de la distribución de texturas vista en entrenamiento, que no se detalla.

## Enlaces

- [Repositorio en HuggingFace: ADI98211/deepbump-normal-onnx](https://huggingface.co/ADI98211/deepbump-normal-onnx)
- [Repositorio de origen: Wszelkiebro/reliquary-deepbump-normal](https://huggingface.co/Wszelkiebro/reliquary-deepbump-normal)
- [Proyecto upstream en GitHub: HugoTini/DeepBump](https://github.com/HugoTini/DeepBump)
