# PeterCha/Tod

## Resumen

Tod es un repositorio espejo de archivos GGUF creado por el desarrollador PeterCha para su aplicación de traducción offline "Tod". No se trata de un modelo entrenado por el autor, sino de un punto de descarga estable que aloja dos modelos de traducción de terceros sin modificar: `Hy-MT2-1.8B-Q4_K_M.gguf` (de Tencent) y `translategemma-4b-it.Q4_K_M.gguf` (cuantización GGUF de Google TranslateGemma 4B realizada por mradermacher). El repositorio incluye los hashes SHA-256 de cada archivo para verificar que son idénticos a las publicaciones originales.

El propósito es puramente operativo: la aplicación Tod descarga estos modelos en el dispositivo para realizar traducción local sin conexión. El archivo de 1,8B se destina a dispositivos de gama baja y estándar, mientras que el de 4B se reserva para dispositivos de gama alta. El repositorio tiene un tamaño de 1,1 GB y, en el momento de la consulta, registra 0 descargas y 0 likes.

La relevancia de este repositorio es limitada para desarrolladores que busquen un modelo propio: es un contenedor de artefactos de terceros con licencias mixtas (Apache 2.0 para Hy-MT2 y Gemma Terms of Use para TranslateGemma). Cualquier uso en producción debe remitirse a los repositorios originales, que contienen la documentación técnica y los términos legales completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio espejo; se remite a los modelos originales Hy-MT2-1.8B y TranslateGemma 4B) |
| Parametros totales | 1.791.080.448 (aproximadamente 1,8B, segun safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) para ambos archivos |
| Idiomas soportados | no disponible (el pipeline es translation, pero no se listan idiomas) |
| Licencia | mixta: Apache 2.0 (Hy-MT2-1.8B) y Gemma Terms of Use (TranslateGemma 4B); ver README |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento de los modelos alojados, ya que este repositorio es un espejo de artefactos de terceros y no incluye model card tecnica propia. Los archivos son byte-identicos a sus publicaciones originales, segun los hashes SHA-256 incluidos en el README.

El modelo base de mayor tamano referenciado, TranslateGemma 4B, proviene de Google y su cuantizacion GGUF fue realizada por mradermacher. El modelo menor, Hy-MT2-1.8B, es de Tencent y se distribuye bajo Apache 2.0. Para detalles de arquitectura, datos de entrenamiento, tecnicas de alineacion (RLHF/DPO) o innovaciones como decodificacion especulativa, debe consultarse la documentacion de los repositorios originales, que no se incluye en la informacion disponible.

## Capacidades

- Traduccion automatica offline: los archivos estan etiquetados con el pipeline `translation` y se usan en la app Tod para traduccion en el dispositivo.
- Ejecucion local sin conexion: al ser GGUF, estan pensados para inferencia en dispositivo (on-device) mediante runtimes compatibles con GGUF.
- Dos perfiles de dispositivo: el modelo de 1,8B cubre dispositivos de gama baja y estandar; el de 4B se reserva para gama alta.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con infraestructura de endpoints de Hugging Face.
- Capacidad conversacional: la etiqueta `conversational` aparece en los metadatos del repositorio.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio, modo thinking ni multilinguesismo detallado.

## Casos de uso

- Traduccion en dispositivo dentro de la app Tod: la aplicacion descarga el GGUF adecuado segun la potencia del dispositivo y ejecuta la traduccion localmente, sin enviar texto a servidores externos.
- Traduccion offline en entornos sin conectividad: al ser modelos GGUF locales, permiten traducir en escenarios con red intermitente o inexistente, como viajes o entornos restringidos.
- Despliegue en dispositivos de gama baja: el archivo Hy-MT2-1.8B Q4_K_M esta pensado para equipos con recursos limitados, donde un modelo de 4B no cabria con holgura.
- Despliegue en dispositivos de gama alta: el archivo TranslateGemma 4B Q4_K_M ofrece mayor capacidad en hardware con mas memoria, a costa de un mayor consumo de recursos.
- Verificacion de integridad en pipelines de distribucion: los hashes SHA-256 permiten a un equipo de ingenieria validar que los artefactos descargados coinciden con las versiones originales antes de empaquetarlos.
- Punto de descarga estable para integracion continua: al centralizar los archivos en un unico repositorio, simplifica la automatizacion de descargas en builds de la aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia orientativa, un modelo de 1,8B en Q4_K_M ocupa del orden de 1 GB en disco y requiere una cantidad de memoria similar para inferencia; un modelo de 4B en Q4_K_M ocupa aproximadamente 2,5 GB. Estas cifras son estimaciones por tamano y cuantizacion, no datos publicados en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por tamano, ambos modelos son candidatos a ejecutarse en GPUs de consumo, pero no se aportan datos verificados.
- Opciones de despliegue: al ser archivos GGUF, son compatibles con runtimes de inferencia GGUF (llama.cpp y derivados como Ollama), si bien la informacion no especifica integraciones probadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT2-1.8B (via Tod) | ~1,8B | no disponible | Apache 2.0 | GGUF Q4_K_M | Espejo en PeterCha/Tod; original en tencent/Hy-MT2-1.8B-GGUF |
| TranslateGemma 4B (via Tod) | ~4B | no disponible | Gemma Terms of Use | GGUF Q4_K_M | Espejo en PeterCha/Tod; original en mradermacher/translategemma-4b-it-GGUF |
| Tod (repositorio) | 1.791.080.448 (total safetensors) | no disponible | Mixta | GGUF | https://huggingface.co/PeterCha/Tod |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no es un modelo entrenado por el autor: es un espejo de artefactos de terceros, por lo que no debe citarse como modelo original en trabajos tecnicos.
- Licencias mixtas: Hy-MT2-1.8B se rige por Apache 2.0, pero TranslateGemma 4B esta sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, con restricciones adicionales para uso comercial y casos de uso prohibidos.
- Idiomas soportados no documentados: no se lista la cobertura linguistica, lo que impide garantizar calidad en pares de idiomas concretos.
- Sin benchmarks publicados: no hay datos verificables de calidad de traduccion (BLEU, COMET u otras metricas) en la informacion disponible.
- Riesgo de alucinacion y errores de traduccion: inherente a los modelos de lenguaje usados para traduccion; no se aportan evaluaciones de fidelidad.
- Contexto no especificado: se desconoce la ventana de contexto, lo que limita la planificacion de cargas con documentos largos.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practicamente nula fuera de la aplicacion Tod.
- Para produccion, conviene descargar los artefactos desde los repositorios originales y verificar los hashes SHA-256 incluidos en el README.

## Enlaces

- Repositorio espejo: https://huggingface.co/PeterCha/Tod
- Modelo original Hy-MT2-1.8B GGUF: https://huggingface.co/tencent/Hy-MT2-1.8B-GGUF
- Modelo original TranslateGemma 4B GGUF (cuantizacion de mradermacher): https://huggingface.co/mradermacher/translategemma-4b-it-GGUF
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
