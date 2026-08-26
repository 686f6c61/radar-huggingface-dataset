# sbakus1528/gemma-4-E4B-it-mmproj-vision

## Resumen

Este repositorio contiene una versión recortada del proyector multimodal (mmproj) oficial del modelo Gemma 4 E4B de Google, adaptada para uso exclusivo con entrada de visión. El proyector original de Gemma 4 E4B integra en un único archivo los encoders de visión y audio; esta variante elimina el encoder de audio, reduciendo el tamaño del archivo de 0,99 GB a 0,37 GB y el consumo de VRAM de 5.213 MiB a 4.465 MiB, un ahorro de 748 MiB que resulta relevante para GPUs de consumo con 8 GB de memoria.

El autor, sbakus1528, no ha modificado ningún valor de peso: solo ha eliminado los tensores correspondientes al encoder de audio (`a.*` y `mm.a.input_projection.weight`) y ha ajustado los metadatos (`clip.has_audio_encoder = false`). El resultado es un archivo GGUF de 169,3 millones de parámetros que se carga como proyector de visión en `llama.cpp` o `llama-server`, manteniendo la misma calidad de comprensión de imágenes que el archivo original, tal y como se verificó con pruebas de imagen sintética y capturas de pantalla reales.

Este adaptador resuelve un problema práctico: en aplicaciones que solo necesitan entender imágenes, el encoder de audio es peso muerto y no existe un flag en `llama.cpp` para desactivar una sola modalidad (`--no-mmproj` desactiva ambas). Al ofrecer un proyector solo-visión, se libera memoria y se simplifica el despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector multimodal (mmproj) de vision, basado en el proyector oficial de Gemma 4 E4B |
| Parametros totales | 169.331.136 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica al proyector; el modelo base Gemma 4 E4B soporta hasta 256K tokens |
| Tipos de cuantizacion | GGUF (F16, segun el archivo `mmproj-vision.gguf`) |
| Idiomas soportados | no disponible para el proyector; el modelo base soporta mas de 140 idiomas |
| Licencia | Apache-2.0 (heredada de google/gemma-4-E4B-it) |
| Formato de pesos | GGUF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

El proyector multimodal de Gemma 4 E4B es un componente que transforma las representaciones visuales (y en el original, tambien auditivas) en embeddings que el modelo de lenguaje puede procesar. En esta variante, se han eliminado todos los tensores relacionados con el encoder de audio (`a.*`, 751 tensores, y `mm.a.input_projection.weight`), conservando los tensores de vision (`v.*`, 658 tensores) y la proyeccion de entrada `mm.input_projection.weight`. No se ha modificado ningun valor de peso; el proceso es puramente de poda estructural.

El modelo base, Gemma 4 E4B, es un modelo de lenguaje multimodal de 4,4 mil millones de parametros (la "E" indica eficiente, probablemente con arquitectura MoE aunque no se especifica en la informacion disponible) desarrollado por Google DeepMind. Segun la documentacion oficial, Gemma 4 incluye una ventana de contexto de hasta 256K tokens, soporte multilingue en mas de 140 idiomas, y esta disponible en cinco tamanos: E2B, E4B, 12B, 26B A4B y 31B. El modelo base fue entrenado con un enfoque de IA responsable y ha pasado por los mismos protocolos de seguridad que los modelos propietarios de Google.

No se dispone de informacion detallada sobre el dataset de entrenamiento del proyector original ni sobre el proceso de entrenamiento de esta variante, ya que es un recorte del archivo oficial y no un modelo reentrenado.

## Capacidades

- Comprension de imagenes: el proyector permite al modelo base Gemma 4 E4B procesar entradas visuales, incluyendo imagenes sinteticas, capturas de pantalla, fotografias y graficos.
- Integracion con llama.cpp: se carga como `--mmproj` en `llama-server` o `llama-cli`, funcionando con el modelo base en formato GGUF.
- Sin soporte de audio: esta variante elimina deliberadamente el encoder de audio; cualquier entrada de audio no funcionara con este archivo.
- Compatibilidad con el modelo base: al no modificar los pesos, las capacidades de razonamiento, generacion de texto, codigo y matematicas del modelo base se mantienen intactas cuando se combina con este proyector.
- Soporte de tool calling y agentes: no es una capacidad del proyector en si, pero el modelo base Gemma 4 E4B soporta estas funcionalidades, por lo que el conjunto completo (modelo + proyector) puede utilizarse en pipelines de agentes con entrada visual.
- Modo thinking: el modelo base incluye un modo de razonamiento (Thinking Mode) que se mantiene disponible al usar este proyector.

## Casos de uso

- Asistentes de vision en local: desplegar un chatbot que pueda analizar imagenes en una GPU de 8 GB, por ejemplo en un portatil con RTX 4060 o similar, gracias al ahorro de 748 MiB de VRAM.
- Analisis de capturas de pantalla: el proyector puede identificar el contenido de una pantalla (aplicaciones, entornos de desarrollo, errores) y el modelo base puede generar explicaciones o sugerencias de accion.
- Automatizacion de tareas de documentacion visual: generar descripciones de diagramas, graficos o esquemas a partir de imagenes, integrado en pipelines de documentacion tecnica.
- Soporte tecnico con evidencia visual: un agente que reciba capturas de pantalla de errores de usuario y genere pasos de resolucion, usando el modelo base con tool calling para consultar bases de conocimiento.
- Educacion y tutoria: explicar problemas de matematicas o fisica a partir de fotografias de enunciados, aprovechando el razonamiento del modelo base.
- Accesibilidad: describir imagenes para personas con discapacidad visual en aplicaciones de escritorio o web, ejecutandose completamente en local para preservar la privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este adaptador de vision. El autor verifico manualmente la equivalencia funcional con el proyector original mediante dos pruebas: una imagen sintetica con tres cuadrados azules (respuesta correcta "3" en ambos) y una captura de pantalla real de 1920x1080 (ambos identificaron correctamente Google Colab y trabajo de machine learning en curso). No hay datos cuantitativos adicionales.

Para el modelo base Gemma 4 E4B, la documentacion oficial de Google menciona que ofrece "alto rendimiento" en comparacion con modelos de tamano similar, pero no se incluyen cifras concretas en la informacion disponible.

## Requisitos de hardware

- VRAM medida: 4.465 MiB con este proyector, frente a 5.213 MiB con el proyector original (ahorro de 748 MiB).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 4060, RTX 4070, RTX 3080, A2000). En una GPU de 8 GB, el ahorro de memoria permite ejecutar el modelo base con mayor numero de capas en GPU o dejar espacio para otras aplicaciones.
- El modelo base Gemma 4 E4B requiere minimo 8 GB de VRAM segun la documentacion de gemma4.dev, por lo que el conjunto completo cabe en GPUs de consumo modernas.
- Opciones de despliegue: `llama.cpp` (llama-server, llama-cli), Ollama (si se importa el GGUF), y cualquier framework compatible con GGUF y mmproj.
- Latencia y throughput: no se han publicado mediciones especificas para este adaptador. Dependera del hardware y de la cuantizacion del modelo base (por ejemplo, Q4_K_M).

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | VRAM (mmproj) | Licencia | Formato |
|---|---|---|---|---|---|
| sbakus1528/gemma-4-E4B-it-mmproj-vision | 169M (proyector) | 256K (modelo base) | 4.465 MiB | Apache-2.0 | GGUF |
| Proyector original de Gemma 4 E4B (unsloth) | ~400M (estimado) | 256K (modelo base) | 5.213 MiB | Apache-2.0 | GGUF |
| Proyectores de otros modelos VLM (ej. LLaVA) | variable | variable | variable | variable | variable |

La comparativa directa con otros proyectores de vision no es posible sin datos publicados de rendimiento. La principal diferencia frente al proyector original es la eliminacion del encoder de audio, que reduce el peso y la VRAM sin afectar a la calidad de vision. Frente a otros modelos VLM de tamano similar, Gemma 4 E4B destaca por su ventana de contexto de 256K y su licencia permisiva Apache-2.0.

## Limitaciones y advertencias

- Solo vision: este archivo no soporta entrada de audio. Si la aplicacion requiere audio, debe usarse el proyector original.
- Riesgo de errores en repaquetado: el autor advierte que un repaquetado incorrecto puede aplanar los metadatos de normalizacion de imagen (`clip.vision.image_mean` / `image_std`), lo que produce salidas corruptas (por ejemplo, tokens `<unused49>`). Es fundamental verificar no solo las claves sino tambien los valores al manipular el archivo.
- Sin garantias de rendimiento: al ser un recorte no reentrenado, no hay benchmarks formales que demuestren la equivalencia exacta con el proyector original en todos los escenarios. Las pruebas manuales son limitadas.
- Dependencia del modelo base: el proyector no funciona por si solo; requiere el modelo Gemma 4 E4B en formato GGUF (por ejemplo, de unsloth).
- Sesgos del modelo base: Gemma 4 E4B, como cualquier modelo de lenguaje, puede presentar sesgos y alucinaciones. Google recomienda evaluar el modelo en el caso de uso especifico antes de desplegarlo en produccion.
- Restricciones de uso: la licencia Apache-2.0 permite uso comercial, pero se debe incluir la atribucion requerida (ver archivo `NOTICE` en el repositorio) y cumplir con las politicas de uso aceptable de Google.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sbakus1528/gemma-4-E4B-it-mmproj-vision
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo base (sin instrucciones): https://huggingface.co/google/gemma-4-E4B
- Fuente del GGUF original: https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- Archivo mmproj original: https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF/blob/main/mmproj-F16.gguf
- Pagina oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma 4 para desarrolladores: https://ai.google.dev/gemma/docs/core/model_card_4
- Guia no oficial de Gemma 4 E4B: https://gemma4.dev/models/gemma-4-e4b
