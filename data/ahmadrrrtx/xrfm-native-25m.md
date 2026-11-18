# ahmadrrrtx/xrfm-native-25m

## Resumen

XRFM Native 25M es un modelo de generación de texto de escala reducida (25,2 millones de parámetros) desarrollado por el usuario ahmadrrrtx y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo entrenado íntegramente desde inicialización aleatoria, sin cargar pesos preentrenados de terceros, sobre una arquitectura propia denominada XRFMModel implementada en PyTorch. El modelo se presenta como material de investigación abierta sobre representación multilingüe y arquitecturas, no como una herramienta lista para producción.

El modelo cubre seis idiomas (inglés, urdu, árabe, hindi, español y francés), además de roman-urdu y código, mediante un tokenizador BPE a nivel de byte con vocabulario de 32.768 tokens y protección de scripts. El entrenamiento se realizó en una única GPU Tesla T4 durante 900 pasos, lo que supone aproximadamente 59 millones de tokens procesados, una cantidad muy inferior a la habitual en modelos de su categoría.

Su relevancia actual es limitada en términos de capacidades prácticas: se posiciona explícitamente como un experimento de ciencia abierta sobre arquitectura y representación multilingüe. El propio autor recomienda usar su modelo hermano XRFM CoderSec 1.7B para casos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (XRFMModel) con GQA, RoPE en FP32, RMSNorm en FP32 y SwiGLU |
| Parametros totales | 25.200.000 (parámetros atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | en, ur, ar, hi, es, fr; además roman-urdu (ur-Latn) y código |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only propia, denominada XRFMModel, con atención de consultas agrupadas (GQA), codificación posicional rotatoria (RoPE) calculada en FP32 para evitar problemas de precisión, normalización RMSNorm también en FP32 y activación SwiGLU. Los parámetros de entrada y salida están atados, lo que reduce el recuento total a 25,2 millones. El tokenizador es un BPE a nivel de byte con vocabulario de 32.768 tokens, diseñado con protección de scripts (denominado T4), lo que permite representar texto en sistemas de escritura no latinos como urdu, árabe e hindi sin fragmentaciones excesivas.

El entrenamiento partió de inicialización aleatoria, sin cargar pesos de terceros, sobre el conjunto de datos ahmadrrrtx/xrfm-native-shards-v1. Se ejecutaron 900 pasos, equivalentes a 58.982.400 tokens, en una Tesla T4 con un pico de VRAM de 3.865,93 MB y un tiempo total de 1.572,03 segundos. El autor documenta una verificación de reanudación exacta desde checkpoint con diferencia de 0,0 en operaciones atómicas CUDA. No se menciona uso de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva básica en seis idiomas (inglés, urdu, árabe, hindi, español y francés).
- Modelado de roman-urdu (ur-Latn), una variante poco cubierta por modelos convencionales.
- Modelado de código fuente, con la mayor mejora relativa en bits por byte entre todos los dominios evaluados.
- Tokenización multilingüe con protección de scripts para escrituras no latinas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documenta ajuste por instrucciones ni diálogo; el pipeline es text-generation en bruto.

## Casos de uso

- Investigación sobre tokenización multilingüe: el modelo y su tokenizador T4 permiten estudiar cómo afecta la protección de scripts a la compresión de texto en urdu, árabe e hindi, comparando bits por byte entre dominios.
- Experimentación arquitectónica a pequeña escala: sirve como banco de pruebas para variantes de GQA, RoPE en FP32 y RMSNorm en FP32 en un entorno que cabe en una GPU T4, con ciclos de entrenamiento de menos de 30 minutos.
- Reproducción de experimentos de ciencia abierta: al partir de inicialización aleatoria y documentar pasos, tokens y hardware, permite replicar el entrenamiento y verificar la reanudación exacta desde checkpoint.
- Evaluación de representaciones en roman-urdu: su cobertura de ur-Latn lo hace útil para medir la calidad de representación de variedades lingüísticas poco representadas en corpus formales.
- Estudio de dinámicas de entrenamiento en modelos pequeños: la tabla de BPB desde el paso 0 hasta el 900 permite analizar la velocidad de convergencia por idioma y dominio.
- Docencia y formación: adecuado para demostrar el ciclo completo de entrenamiento de un transformer desde cero, incluida la construcción de tokenizador y la evaluación por bits por byte.
- No es adecuado para generación de texto en producción, atención al cliente, generación de código fiable ni asistentes conversacionales, según el propio alcance declarado por el autor.

## Benchmarks y rendimiento

El autor publica únicamente bits por byte (BPB) sobre datos reservados, comparando inicialización aleatoria (paso 0) con el modelo entrenado (paso 900). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Dominio | Paso 0 (aleatorio) | Paso 900 (entrenado) | Delta |
|---|---:|---:|---:|
| en | 3,4651 | 1,8152 | -1,6499 |
| code | 4,0011 | 0,9966 | -3,0045 |
| ur | 2,6101 | 1,3674 | -1,2427 |
| ur-Latn | 3,6980 | 1,8102 | -1,8878 |
| ar | 2,7293 | 1,5708 | -1,1585 |
| hi | 1,8358 | 0,9211 | -0,9147 |
| es | 4,0700 | 2,1618 | -1,9082 |
| fr | 4,0781 | 2,1611 | -1,9170 |

## Requisitos de hardware

- VRAM para inferencia: el modelo completo en FP32 ocupa aproximadamente 100 MB (25,2 M parámetros × 4 bytes), coherente con el tamaño del repositorio de 0,1 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el entrenamiento se realizó en una Tesla T4 con un pico de 3.865,93 MB, incluyendo estados del optimizador y activaciones.
- GPU consumer compatibles: GTX 1050 Ti, GTX 1650, RTX 2060, RTX 3060, RTX 4060 y superiores; también CPU para inferencia, dado el tamaño reducido.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. Al publicarse solo en safetensors con arquitectura XRFMModel personalizada, requiere cargar el código del modelo del repositorio o reimplementar la arquitectura.
- Latencia y throughput: no disponibles. El tiempo de entrenamiento documentado (1.572,03 s para 900 pasos en T4) no es extrapolable directamente a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| XRFM Native 25M | 25,2 M | no disponible | en, ur, ar, hi, es, fr, ur-Latn, code | Apache 2.0 | safetensors | Hugging Face |
| XRFM CoderSec 1.7B (Track B) | 1.700 M (según denominación del autor) | no disponible | no disponible | no disponible | no disponible | referenciado por el autor |
| Modelos multilingües pequeños de referencia (p. ej. variantes de menos de 100 M) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Escala muy reducida: con 25,2 M de parámetros y solo 58,98 M de tokens de entrenamiento, la capacidad de generar texto coherente y factual es muy limitada.
- Ausencia de ajuste por instrucciones: no ha pasado por RLHF ni DPO, por lo que no sigue instrucciones de forma fiable.
- Riesgo elevado de alucinación y de texto incoherente, especialmente en generaciones largas.
- Contexto no documentado: se desconoce la longitud máxima de secuencia soportada, lo que impide planificar usos con ventanas largas.
- Cobertura lingüística desigual: los valores de BPB finales varían entre 0,92 (hindi) y 2,16 (español y francés), lo que sugiere calidades de modelado muy distintas por idioma.
- Licencia Apache 2.0: permite uso comercial, pero el autor declara explícitamente que el modelo no está pensado para producción.
- Arquitectura personalizada: al no ser una arquitectura estándar de transformers, puede requerir código específico y no es directamente compatible con herramientas de despliegue habituales.
- Sin datos de sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- Modelo sin tracción: cero descargas y cero likes en el momento de la ficha, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmadrrrtx/xrfm-native-25m
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmadrrrtx/xrfm-native-shards-v1
