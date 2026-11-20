# Remek/basal-omni-1.0-ultra-GGUF

## Resumen

basal-omni-1.0-ultra-GGUF es la versión cuantizada en formato GGUF del modelo basal-omni-1.0-ultra, un modelo de 31B parámetros construido sobre Gemma 4 31B y desarrollado por Remek. No es un modelo conversacional al uso: está diseñado específicamente para la toma de decisiones tipadas (typed decisions), es decir, responder a preguntas de opción múltiple devolviendo probabilidades calibradas sobre cada opción en lugar de texto libre. Esto permite integrar el modelo en sistemas de clasificación y automatización con umbrales de confianza verificables estadísticamente.

La versión GGUF contiene únicamente el decodificador de texto (el codificador de imágenes queda excluido), empaquetado en cuantización Q8_0 de 32,6 GB, y está pensada para ejecutarse con llama.cpp y Ollama a través del motor de inferencia propio del autor, `basal-serve`, que renderiza el prompt específico del modelo y lee las probabilidades de los códigos de opción. El modelo declara soporte para polaco e inglés y se distribuye bajo licencia Apache 2.0.

Su relevancia actual radica en el enfoque de calibración: el autor publica métricas de acuerdo (agreement) frente al modelo bf16 original, tasas de error de calibración (ECE) y umbrales certificados para niveles de error del 1 % y el 5 %, lo que permite construir flujos de decisión automatizada con garantías medibles en lugar de heurísticas ad hoc.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4 31B), decodificador de texto |
| Parámetros totales | 30.697.345.596 (31B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens en modo `gguf` en proceso; 4.096 tokens por prompt en modo Ollama |
| Tipos de cuantización | Q8_0 (32,6 GB, publicada); Q6_K (25,2 GB, construida pero no publicada por no superar el umbral de la puerta de portado) |
| Idiomas soportados | pl (polaco), en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con Modelfile para Ollama |
| Tamaño del repositorio | 65,3 GB |
| Opciones por pregunta | hasta 255 en modo `gguf`; hasta 20 en modo Ollama |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 31B, un transformer de 31B parámetros. La versión GGUF se generó con `convert_hf_to_gguf.py` de llama.cpp build b11312 a partir del modelo bf16 publicado, conservando únicamente el decodificador de texto. El modelo no se limita a generar texto: el servidor `basal-serve` construye un prompt propio (formato de prompt 2, definido en `basal.json`) y lee las probabilidades asociadas a los códigos de cada opción, lo que convierte la generación en una distribución de probabilidad sobre las alternativas presentadas.

El detalle técnico más relevante es la calibración. El repositorio incluye `CALIBRATION.gguf.json`, ajustado sobre las lecturas Q8_0 del propio port con `--mode gguf` y un único orden de opciones, con temperaturas por tipo de tarea y por bucket, además de umbrales certificados para errores del 1 % y el 5 %. El conjunto de calibración de prueba consta de 8.560 decisiones con una precisión de 0,936. El autor advierte que la calibración publicada está ajustada para un único orden de opciones (el predeterminado) y que puede reajustarse con datos etiquetados propios mediante `basal-calibrate`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Toma de decisiones tipadas: responde con una distribución de probabilidad sobre opciones (tipos `choice`, `noul`, `score`, `multi`, `act`, `tool`), no con texto libre.
- Clasificación con calibración: probabilidades acompañadas de umbrales certificados para niveles de error del 1 % y el 5 %, lo que permite decidir cuándo automatizar y cuándo derivar a revisión humana.
- Soporte de hasta 255 opciones por pregunta en modo `gguf`.
- Tool calling mediante el tipo de tarea `tool`.
- Soporte de preguntas de tipo `multi` (selección múltiple) y `score` (puntuación).
- Multilingüe limitado a polaco e inglés.
- Procesamiento de documentos largos hasta 16.384 tokens de contexto en modo `gguf`.
- Solo texto: el codificador de imágenes no está incluido en el GGUF; para imágenes hay que usar el modelo bf16.
- Integración con llama.cpp y Ollama mediante el motor `basal-serve`.

## Casos de uso

- Enrutamiento automático de tickets de soporte: el modelo clasifica cada incidencia entre un conjunto cerrado de categorías (hasta 255 opciones) y devuelve una probabilidad calibrada; con el umbral del 1 % de error se automatiza el 56,6 % de las decisiones con un error observado del 0,6 %, y el resto se deriva a agentes humanos.
- Moderación de contenido con garantías medibles: la calibración por tipo de tarea permite fijar un umbral de error objetivo y calcular qué fracción del tráfico puede decidirse automáticamente, algo útil en flujos donde los falsos negativos tienen coste regulatorio.
- Extracción de campos estructurados en documentos largos: con 16.384 tokens de contexto en modo `gguf`, el modelo puede leer contratos o informes completos y decidir entre opciones predefinidas (por ejemplo, tipo de cláusula o categoría de riesgo) sin fragmentar el documento.
- Selección de herramienta en agentes: el tipo de tarea `tool` permite elegir entre un conjunto de herramientas disponibles con una distribución de probabilidad, lo que facilita políticas de ejecución conservadoras cuando la confianza es baja.
- Triaje en pipelines de datos en polaco e inglés: clasificación de registros, reseñas o formularios en categorías predefinidas con umbrales de confianza auditables, desplegable en CPU, Apple Silicon (Metal) o GPU NVIDIA mediante llama.cpp.
- Sistemas de decisión con revisión humana selectiva: dado que el modelo publica ECE y curvas de automatización, encaja en arquitecturas human-in-the-loop donde solo se escala a revisión manual la fracción de casos por debajo del umbral certificado.
- Evaluación comparativa de candidatos o respuestas: el tipo `score` permite puntuar opciones de forma calibrada, útil en ranking interno o validación de salidas de otros modelos.

## Benchmarks y rendimiento

El autor publica métricas del port GGUF frente al modelo bf16 servido en modo eager, sobre el conjunto de desarrollo dev v2 (10.606 decisiones), con una H100 de 80 GB y `--mode gguf` (llama.cpp b11312 vía llama-cpp-python 0.3.36, todas las capas en GPU):

| Archivo | Tamaño | Acuerdo (2-10 opciones) | Acuerdo con margen >= 0,2 | Precisión | ECE | p50 (1 petición) | Decisiones/s (16 en vuelo) | Puerta |
|---|---|---|---|---|---|---|---|---|
| Q8_0 (recomendado) | 32,6 GB | 0,9943 | 0,9987 | -0,07 pt | +0,0006 | 582 ms | 1,6 | PASS |
| Q6_K (no publicado) | 25,2 GB | 0,9886 | 0,9975 | +0,01 pt | -0,0012 | 737 ms | 1,3 | FAIL (umbral 0,998) |

Sobre las 10.606 decisiones, con margen bf16 >= 0,2, Q8_0 alcanza un acuerdo de 0,9983 (umbral 0,998; Q6_K 0,9973). En automatización con `CALIBRATION.gguf.json`: con objetivo de error del 1 % se decide automáticamente el 56,6 % de las decisiones (error observado 0,6 %); con objetivo del 5 %, el 93,3 % (error observado 3,8 %). La calibración propia del modelo bf16 da cifras equivalentes: 56,8 % y 94,2 %. Los resultados de benchmark del modelo base (Werdykt v1 0,879, conjuntos en polaco e inglés) están publicados en la ficha de basal-omni-1.0-ultra; este archivo GGUF no se puntúa por separado en ellos.

## Requisitos de hardware

- VRAM estimada: los pesos Q8_0 ocupan 32,6 GB; en la prueba de velocidad el servidor alcanzó un pico de 49 GB de memoria GPU en una H100 de 80 GB, incluyendo contexto.
- GPU recomendadas: H100 80 GB (medida por el autor); en general se requiere una GPU con al menos 48-50 GB de memoria para el modo `gguf` con contexto amplio.
- GPU de consumo: no cabe en tarjetas consumer de 24 GB (RTX 4090, 3090) con Q8_0; no se han publicado cuantizaciones menores (Q5_K_M y Q4_K_M no superaron la puerta en los modelos mini y max, y no se construyeron para ultra).
- Apple Silicon: no medido; el autor recomienda planificar 64 GB de memoria en Mac (se usa Metal).
- CPU: soportado por llama.cpp, aunque sin datos de rendimiento publicados.
- Despliegue: `basal-serve` con `--mode gguf` (llama-cpp-python 0.3.36 o superior, motor basal 2.3.1 o superior con el extra `gguf`), `--mode ollama` (Ollama 0.35 o superior, con Modelfile.Q8_0) o `--mode llamacpp`; en NVIDIA hay que compilar llama-cpp-python con CUDA.
- Latencia y throughput medidos (H100, estados de unos 1.500 tokens con una pregunta): 582 ms de p50 con una petición a la vez y 1,6 decisiones/s con 16 en vuelo en Q8_0.
- En modo Ollama el límite es de 20 opciones por pregunta (Ollama devuelve como máximo 20 log-probabilidades) y 4.096 tokens por prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-1.0-ultra-GGUF (Q8_0) | 31B | 16.384 tokens (modo gguf) | Decisiones tipadas calibradas, pl/en | Apache 2.0 | GGUF en HF, vía basal-serve |
| basal-omni-1.0-ultra (bf16) | 31B | no disponible | Mismo modelo con codificador de imagen | Apache 2.0 | Pesos bf16 en HF |
| Gemma 4 31B (modelo base) | 31B | no disponible | Generación de texto general | Términos de Gemma (no disponible en detalle) | HF |
| Modelos de clasificación encoder-only (p. ej. familia BERT) | 0,1-0,3B típicamente | 512 tokens típicamente | Clasificación supervisada | Variable | Amplia |

La comparación con modelos de clasificación tradicionales es la más pertinente: basal-omni-1.0-ultra ofrece contexto de 16.384 tokens y hasta 255 opciones sin reentrenamiento, a cambio de un coste de inferencia mucho mayor (31B frente a cientos de millones de parámetros). No se dispone de datos de benchmarks comparativos directos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal; no hay historial de producción documentado.
- Solo texto en esta versión: el codificador de imágenes no está incluido en el GGUF; para tareas multimodales hay que usar el modelo bf16.
- Cobertura lingüística limitada a polaco e inglés; no se declara soporte de castellano.
- La calibración publicada está ajustada para un único orden de opciones (el predeterminado); cambiar el orden invalida los umbrales certificados salvo que se reajuste con `basal-calibrate`.
- En modo Ollama se limita a 20 opciones y 4.096 tokens por prompt; para documentos largos y hasta 255 opciones hay que usar `--mode gguf`.
- No cabe en GPU consumer de 24 GB en Q8_0 y no se han publicado cuantizaciones menores para ultra.
- Riesgo de alucinación: no evaluado en la información disponible; el formato de decisión tipada reduce la superficie de texto libre, pero las probabilidades pueden estar mal calibradas fuera de la distribución de calibración.
- Sesgos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede arrastrar términos adicionales del proveedor original que no se detallan en la información disponible; conviene verificarlo antes de un despliegue comercial.
- El repositorio ocupa 65,3 GB, lo que exige espacio en disco considerable incluso si solo se descarga el archivo Q8_0.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/Remek/basal-omni-1.0-ultra-GGUF
- Modelo base bf16: https://huggingface.co/Remek/basal-omni-1.0-ultra
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
