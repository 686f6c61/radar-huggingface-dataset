# saidutta69/LFM3-VL-2B-heretic

## Resumen

LFM3-VL-2B-heretic es una variante "decensurada" (abliterada) del modelo de visión-lenguaje LFM3-VL-2B de Liquid AI, publicada por el usuario saidutta69 en HuggingFace. El modelo base es un VLM multimodal de 1,92B parámetros orientado a tareas de documento, OCR, gráficos y vídeo en dispositivos edge; esta variante aplica la técnica de ablación direccional mediante la herramienta Heretic v1.4.0 para eliminar las direcciones de peso responsables de las negativas (refusals) del modelo, pasando de 98/100 negativas en el original a solo 3/100.

La edición se limita exclusivamente a la torre de lenguaje: se modifican las proyecciones de salida de atención (incluido el `out_proj` del operador convolucional en las capas conv) y las proyecciones descendentes del MLP. El codificador de visión de 164M parámetros y el proyector de 25M se copian sin cambios, de modo que la comprensión de imágenes permanece intacta. La divergencia KL resultante es de 0,0014, lo que indica una edición muy ajustada que preserva las capacidades del modelo base (MMLU 34,44% frente a 34,37% del original).

Es relevante porque combina un VLM ligero pensado para ejecución local en dispositivos con recursos limitados y la eliminación de restricciones de alineación, algo útil para investigación sobre alineación y para casos de uso donde las negativas del modelo original resultan obstructivas. El autor publica además el directorio `reproduce/` con la receta completa de Heretic (configuración, requisitos, diario de Optuna y sumas SHA-256), lo que hace el proceso reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-VL (torre de lenguaje + codificador de visión + proyector), con capas convolucionales en el camino de texto |
| Parametros totales | 1.918.181.888 (1,92B): 1.728.801.536 lenguaje + 164.206.336 visión + 25.174.016 proyector |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q2_K, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_0, Q4_1, Q4_K_M, Q5_K_S y más (14 quants + F16 en GGUF); BF16 en safetensors |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (other, heredada del modelo base LiquidAI/LFM3-VL-2B) |
| Formato de pesos | safetensors (BF16, 3,84 GB) y GGUF (19,31 GB el conjunto completo, incluido el proyector) |

## Arquitectura y entrenamiento

El modelo base LFM3-VL-2B de Liquid AI es un modelo de visión-lenguaje de 1,92B parámetros con una torre de lenguaje de 287 tensores y 24 bloques, un codificador de visión de 164M parámetros y un proyector de 25M que conecta ambos módulos. La torre de lenguaje incorpora capas convolucionales con un operador cuyo `out_proj` también fue tratado durante la abliteración, lo que sugiere una arquitectura híbrida con componentes convolucionales en el camino de texto (característico de la familia LFM de Liquid AI). El modelo base fue post-entrenado por Liquid AI y presenta un grado muy alto de ajuste contra negativas: 98 de 100 prompts del conjunto de evaluación de Heretic provocaban una negativa.

Esta variante no modifica el entrenamiento: aplica abliteración (ablación direccional) mediante Heretic v1.4.0, concretamente el trial 94 de una ejecución de 200 trials de Optuna con semilla 1424362134. La técnica identifica las direcciones de peso en `attn.o_proj` y `mlp.down_proj` asociadas a la conducta de negativa y las suprime con pesos graduados (max_weight 1,41 en atención, 1,48 en MLP), sin reentrenamiento. Los parámetros de la abliteración están publicados en la model card para reproducibilidad. No se dispone de datos sobre el corpus de preentrenamiento ni el número de tokens del modelo base en la información proporcionada.

## Capacidades

- Comprensión de imágenes (image-text-to-text): documentos, gráficos, capturas de pantalla y OCR, heredada íntegramente del modelo base (el codificador de visión no se modifica).
- Procesamiento de vídeo a través del checkpoint de transformers; la entrada de vídeo en llama.cpp aún no está soportada upstream.
- Generación de texto conversacional en 16 idiomas, incluido castellano.
- Sin negativas en la práctica: 3/100 frente a 98/100 del original, útil cuando el filtrado de seguridad del modelo original bloquea tareas legítimas.
- Reproducibilidad: receta completa de Heretic incluida en el repositorio.
- No recomendado por el propio autor para: programación, conversaciones multi-turno o razonamiento complejo; la abliteración elimina negativas, no esas limitaciones.
- No consta soporte de tool calling, function calling ni capacidades de agente en la información disponible.

## Casos de uso

- OCR y extracción de texto de documentos en local: gracias a las puntuaciones publicadas del modelo base (DocVQA 96,7, OCRBench v1 86,3), es adecuado para digitalizar facturas, formularios o contratos sin enviar datos a la nube.
- Análisis de gráficos y capturas de pantalla: el modelo base alcanza 87,9 en TextVQA y 79,3 en RealWorldQA, lo que lo hace útil para extraer datos de dashboards o UIs en herramientas de productividad offline.
- Asistentes de documento en dispositivos edge: con cuantizaciones Q4_K_M de ~1,10 GB más el proyector de 0,38 GB, cabe en móviles y SBCs para lectura asistida de documentos.
- Investigación sobre alineación y abliteración: la receta reproducible (semilla, config.toml, diario de Optuna) lo convierte en un caso de estudio completo para estudiar el impacto de la ablación en VLMs.
- Prototipado multimodal sin censura: para desarrolladores que necesitan que el modelo describa cualquier contenido de imagen sin bloqueos (por ejemplo, moderación de contenido o análisis forense de imágenes).
- Procesamiento por lotes de vídeo en servidor con transformers: la entrada de vídeo funciona mediante el checkpoint de transformers, útil para indexar o resumir grabaciones.
- Despliegue local privado: al ser un modelo pequeño y ejecutable con llama.cpp, sirve para entornos con requisitos de confidencialidad donde no se desea dependencia de APIs externas.

## Benchmarks y rendimiento

Datos medidos por el autor sobre este checkpoint y el original en el mismo entorno (lm-eval 0.4.13, 14.042 preguntas para MMLU):

| Metric | Este modelo | Modelo original |
|---|---|---|
| MMLU (acc) | 34,44% | 34,37% |
| stderr | 0,40 pp | 0,40 pp |
| Divergencia KL | 0,0014 | 0 (por definicion) |
| Negativas (refusals) | 3/100 | 98/100 |

Benchmarks publicados del modelo base LiquidAI/LFM3-VL-2B (la torre de visión no se modifica, por lo que deberían mantenerse):

| Benchmark | Puntuacion |
|---|---|
| DocVQA | 96,7 |
| TextVQA | 87,9 |
| OCRBench v1 | 86,3 |
| RealWorldQA | 79,3 |
| MMMU | 55,7 |

## Requisitos de hardware

- VRAM para inferencia: la variante Q2_K ocupa 0,75 GB y la Q4_K_M 1,10 GB; añadiendo el proyector mmproj F16 (0,38 GB), el conjunto Q4_K_M ronda los 1,5 GB, accesible incluso para GPUs integradas o portátiles modestos. La versión F16 requiere unos 3,85 GB.
- GPUs recomendadas: cualquier GPU moderna con 4 GB de VRAM basta para las cuantizaciones Q4; no se requieren aceleradores de centro de datos. También es viable ejecución en CPU mediante llama.cpp.
- Consumer GPUs: cabe sobradamente en RTX 3060, RTX 4060 o superiores; incluso gráficas de 2-4 GB pueden cargar las cuantizaciones Q2_K/Q3.
- Despliegue: llama.cpp (necesaria una build con soporte de la arquitectura GGUF `lfm3`, disponible desde finales de octubre de 2026; builds antiguas fallarán), Ollama (si soporta LFM3-VL), y transformers para el checkpoint safetensors con soporte de vídeo. No se menciona soporte de vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Caracteristica | LFM3-VL-2B-heretic | LiquidAI/LFM3-VL-2B (base) | Qwen2-VL-2B (referencia) |
|---|---|---|---|
| Parametros | 1,92B | 1,92B | 2,2B aprox. |
| Modalidad | Imagen + texto (+ video via transformers) | Imagen + texto (+ video) | Imagen + texto (+ video) |
| Contexto | no disponible | no disponible | 32K |
| Negativas | 3/100 | 98/100 | altas (alineado) |
| MMLU | 34,44% | 34,37% | no comparable directamente |
| Licencia | lfm1.0 (other) | lfm1.0 (other) | Apache 2.0 |
| Formatos | safetensors, GGUF (14 quants) | safetensors, GGUF oficial | safetensors, GGUF comunitarios |

Nota: la comparativa con Qwen2-VL-2B es orientativa; los datos exactos de esa alternativa no constan en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina las negativas de seguridad: el modelo responderá a solicitudes que el original rechazaría. Su uso conlleva responsabilidad legal y ética para el desplegador; no es apto para productos orientados a público general sin capas de moderación propias.
- El propio autor desaconseja su uso para programación, conversaciones multi-turno y razonamiento complejo; esas limitaciones provienen del modelo base y no se corrigen con la abliteración.
- La entrada de vídeo no está soportada aún en llama.cpp upstream; solo funciona vía transformers.
- Se necesita una build reciente de llama.cpp con soporte de la arquitectura GGUF `lfm3`; versiones anteriores no cargarán los ficheros.
- MMLU de ~34% indica capacidades de conocimiento y razonamiento limitadas, esperables en un modelo de 2B.
- Licencia lfm1.0 (other): no es una licencia estándar permisiva; hay que revisar las condiciones de uso comercial en el enlace de licencia del modelo base antes de desplegar en producción.
- Riesgo de alucinación: no se publican mediciones específicas; al tratarse de un modelo pequeño abliterado, debe asumirse un riesgo elevado y verificar las salidas en tareas de OCR/VQA críticas.
- El MMLU solo mide el camino de texto; no valida el codificador de visión tras la edición (aunque este no se modifica).

## Enlaces

- Modelo: https://huggingface.co/saidutta69/LFM3-VL-2B-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF oficial del modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Artículo original sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
