# mradermacher/Revisual-R1-final-GGUF

## Resumen

Revisual-R1-final-GGUF es la versión cuantizada en formato GGUF del modelo multimodal `csfufu/Revisual-R1-final`, publicada por el usuario mradermacher el 6 de junio de 2025. El modelo original es un transformer multimodal de aproximadamente 7.615 millones de parámetros (7,6B) que combina procesamiento de texto con entrada de imágenes, empaquetado en un repositorio de 70,4 GB que incluye múltiples niveles de cuantización y dos variantes del proyector multimodal (mmproj).

La relevancia de esta ficha reside en que las cuantizaciones GGUF permiten ejecutar un modelo multimodal de 7,6B en hardware de consumo mediante llama.cpp y herramientas derivadas, algo imposible con los pesos en precisión completa. El modelo está etiquetado como "multimodal" y "conversational", con licencia Apache 2.0, lo que facilita su adopción tanto en investigación como en productos comerciales.

No se dispone de información detallada sobre la arquitectura interna, el dataset de entrenamiento ni los resultados de benchmarks del modelo base en la documentación proporcionada; esta ficha se limita a los datos verificables del repositorio GGUF y del model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión); detalles internos no disponibles |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `csfufu/Revisual-R1-final` es un transformer multimodal de 7,6B parámetros según los metadatos de safetensors del repositorio. La etiqueta "multimodal" del model card y la presencia de ficheros `mmproj` (proyector multimodal) confirman que el modelo acepta entradas de imagen además de texto, siguiendo el patrón habitual de los modelos visión-lenguaje que combinan un codificador visual con un decoder de lenguaje.

No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens procesados, la existencia de fases de RLHF/DPO ni innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). El sufijo "R1" en el nombre sugiere una inspiración en el paradigma de razonamiento de DeepSeek-R1, pero no hay confirmación documental en la información proporcionada. El cuantizador indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que implica una conversión directa desde pesos Hugging Face con cuantización por tensor de salida.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta "conversational" del repositorio.
- Procesamiento de imágenes: la presencia de ficheros `mmproj` (proyector multimodal) confirma soporte de entrada visual combinada con texto.
- Razonamiento: el nombre "R1" sugiere capacidades de razonamiento, aunque no se documenta explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistencia conversacional multimodal en local: el modelo puede gestionar diálogos que combinan texto e imágenes en hardware de consumo gracias a las cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB), adecuadas para GPUs con 8-12 GB de VRAM.
- Descripción y análisis de imágenes en pipelines de accesibilidad: integrado vía llama.cpp, permite generar descripciones textuales de imágenes para sistemas de lectura de pantalla o indexación de contenido visual.
- Extracción de información de documentos escaneados: el modelo puede procesar capturas o fotografías de documentos y devolver texto estructurado, útil en flujos de digitalización sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones visión-lenguaje: la licencia Apache 2.0 y el formato GGUF permiten iterar en local con Ollama o llama.cpp antes de comprometerse con infraestructura de producción.
- Chatbot de soporte técnico con capturas de pantalla: el usuario puede adjuntar una captura de error y el modelo interpretarla en el contexto de la conversación, aprovechando la naturaleza conversacional del modelo.
- Educación y demostraciones de IA multimodal: el tamaño contenido (7,6B) y las cuantizaciones de 3-5 GB facilitan su uso en entornos docentes con hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje):
  - Q2_K: ~3,1 GB
  - Q3_K_M: ~3,9 GB
  - Q4_K_M: ~4,8 GB (recomendado por el autor para velocidad y calidad)
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,2 GB
  - f16: ~15,3 GB
- Proyector multimodal adicional: 1,0 GB (mmproj-Q8_0) o 1,5 GB (mmproj-f16).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 solo necesarias para f16 o despliegues concurrentes.
- Cabe en GPUs de consumo: sí, desde una RTX 3060 12 GB con Q4_K_M + mmproj; también en GPUs de 8 GB con Q3_K_M o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repositorio está marcado como `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Revisual-R1-final-GGUF (este) | ~7,6B | no disponible | Sí (mmproj) | Apache 2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; no se ofrecen datos de rendimiento relativo.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente para inglés; el rendimiento en castellano no está garantizado ni documentado.
- Sesgos conocidos: no documentados en la información disponible; se recomienda auditoría previa en producción.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación publicada específica para este modelo.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y sus datos de entrenamiento pueden arrastrar obligaciones adicionales no documentadas aquí.
- El repositorio GGUF tiene solo 342 descargas y 0 likes, lo que indica escasa validación comunitaria; conviene probar exhaustivamente antes de adoptarlo.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor recomienda Q4_K_S/Q4_K_M para uso general.
- El tamaño del repositorio (70,4 GB) incluye todas las variantes; descargar solo los ficheros necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Revisual-R1-final-GGUF
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Revisual-R1-final-i1-GGUF
- Modelo base: https://huggingface.co/csfufu/Revisual-R1-final
- Página de descargas del cuantizador: https://hf.tst.eu/model#Revisual-R1-final-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
