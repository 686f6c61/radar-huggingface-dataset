# dealignai/MiniCPM5-2B-CRACK-JANG_8M

## Resumen

MiniCPM5-2B-CRACK-JANG_8M es un modelo de lenguaje bilingüe (inglés y chino) de 2.500 millones de parámetros, desarrollado por Dealign AI a partir del modelo base openbmb/MiniCPM5-2B. Se distribuye como un bundle MLX cuantizado en 8 bits para Apple Silicon y está diseñado para eliminar el comportamiento de rechazo del modelo original, manteniendo intactas sus capacidades de razonamiento, generación de código y llamada a funciones.

El modelo utiliza una arquitectura de transformer estilo Llama con soporte de modo de pensamiento binario (thinking mode on/off) y llamada a funciones enmarcada en XML. Su ventana de contexto alcanza los 131.000 tokens. La eliminación del rechazo se realiza a nivel de pesos, sin hooks en tiempo de ejecución ni vectores de dirección, lo que lo convierte en un caso de estudio relevante para la investigación en alineación y seguridad de modelos de IA.

Su relevancia actual radica en que ofrece una alternativa ligera (2,5 GB) para aplicaciones locales en macOS, con una degradación mínima de rendimiento en MMLU (-1,20 puntos porcentuales respecto al modelo base) y una tasa de cumplimiento del 100 % en HarmBench-320 cuando el modo de pensamiento está activado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama (modelo base: openbmb/MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 (≈2,52 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.000 tokens |
| Tipos de cuantizacion | 8-bit affine (escalas bf16), calibrado con AWQ + GPTQ + imatrix |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bundle MLX) |

## Arquitectura y entrenamiento

El modelo base, openbmb/MiniCPM5-2B, es un modelo de texto de 2B con arquitectura estilo Llama, lanzado el 6 de septiembre de 2026. Incluye soporte nativo de modo de pensamiento binario y un parser de llamada a funciones basado en XML. El fine-tuning de este modelo CRACK consiste en una abliteración: la eliminación del comportamiento de rechazo a nivel de pesos, sin modificar el template de chat ni el parser de herramientas del modelo base.

La información disponible no detalla el conjunto de datos de entrenamiento ni el proceso de fine-tuning más allá de la abliteración. El bundle MLX se construyó con calibración AWQ, GPTQ e imatrix sobre el modelo fuente, y los pesos se almacenan en formato de 8 bits con escalas en bf16, sin promoción a fp32. El resultado es un bundle estándar que se carga con `mlx_lm.load()` sin cambios.

## Capacidades

- Generación de texto bilingüe en inglés y chino.
- Razonamiento con modo de pensamiento activable (thinking mode on/off).
- Llamada a funciones (tool calling) mediante XML, con parser de funciones heredado del modelo base.
- Conocimiento general y capacidades de codificación preservadas tras la abliteración.
- Sin comportamiento de rechazo: sigue instrucciones en categorías de tareas que normalmente serían rechazadas.
- Compatible con el ecosistema MLX, cargable con `mlx_lm.load()`.

## Casos de uso

- Asistente local bilingüe en macOS: gracias al bundle MLX y su tamaño de 2,5 GB, el modelo puede ejecutarse en Apple Silicon sin conexión, proporcionando respuestas en inglés y chino para consultas generales o técnicas.
- Investigación en alineación y seguridad: el modelo sirve como caso de estudio para analizar el efecto de la abliteración en el comportamiento de rechazo, con métricas de MMLU y HarmBench-320 que permiten comparar la degradación de capacidades frente a la eliminación de refusals.
- Agentes con tool calling en entornos locales: el soporte de XML function-call permite integrarlo en pipelines de agentes que necesiten invocar herramientas sin depender de APIs externas, útil en entornos aislados o con requisitos de privacidad.
- Generación de código asistida en desarrollo: sus capacidades de codificación lo hacen útil como asistente de programación en entornos sin acceso a la nube, por ejemplo en un IDE local con autocompletado o generación de snippets.
- Razonamiento con modo de pensamiento: el thinking mode on/off permite alternar entre respuestas rápidas y razonamiento más profundo, adecuado para tareas de análisis lógico o matemático en las que se necesita una explicación detallada.
- Prototipado de aplicaciones en Apple Silicon: los desarrolladores pueden cargar el modelo con `mlx_lm.load()` y experimentar con text-generation en dispositivos locales, aprovechando el motor vMLX para inferencia con cuantización KV-cache y bundles JANG.

## Benchmarks y rendimiento

| Benchmark | Modelo base | MiniCPM5-2B-CRACK-JANG_8M | Δ |
|---|---|---|---|
| MMLU (57 materias, 14.042 ítems) | 58,72 % | 57,52 % | -1,20 pp |
| HarmBench-320 (thinking OFF) | no disponible | 97,50 % (234/240) | - |
| HarmBench-320 (thinking ON) | no disponible | 100,00 % (240/240) | - |

Detalle de MMLU por categoría:

| Categoría | Base | Uncensored | Δ (pp) |
|---|---|---:|---:|
| STEM | 55,30 % | 53,38 % | -1,92 |
| Humanidades | 51,75 % | 51,56 % | -0,19 |
| Ciencias sociales | 67,18 % | 65,42 % | -1,75 |
| Otros | 63,97 % | 62,52 % | -1,45 |
| Global | 58,72 % | 57,52 % | -1,20 |

No se han publicado resultados de HumanEval, GSM8K u otros benchmarks en la información disponible.

## Requisitos de hardware

- Memoria unificada estimada para inferencia: ~2,5 GB (equivalente a VRAM en Apple Silicon) con la cuantización 8-bit.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) mediante MLX o vMLX.
- No es compatible con CUDA tal como se distribuye; para usar en GPU NVIDIA sería necesario convertir los pesos a otro formato.
- Cabe en dispositivos Apple Silicon con 8 GB de RAM o más.
- Opciones de despliegue: MLX (`mlx_lm.load()`), vMLX (motor de inferencia para Apple Silicon con bundles JANG y cuantización KV-cache).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | MMLU | HarmBench-320 |
|---|---|---|---|---|---|---|
| openbmb/MiniCPM5-2B (base) | 2,52 B | 131K | Apache 2.0 | safetensors | 58,72 % | no disponible |
| dealignai/MiniCPM5-2B-CRACK-JANG_8M | 2,52 B | 131K | Apache 2.0 | MLX 8-bit | 57,52 % | 100 % (thinking ON) |

Dealign AI ha publicado otros modelos CRACK como MiniMax-M2.5-JANG_4M-CRACK, pero no se dispone de datos suficientes en la información proporcionada para establecer una comparativa técnica.

## Limitaciones y advertencias

- Al ser un modelo uncensored, puede generar contenido dañino o inapropiado sin rechazo, lo que requiere supervisión humana en cualquier uso en producción.
- Riesgo de alucinación inherente a modelos de 2B, especialmente en tareas de conocimiento factual.
- Solo soporta inglés y chino; no hay soporte para otros idiomas.
- La cuantización 8-bit puede introducir una ligera degradación en comparación con el modelo base (Δ -1,20 pp en MMLU).
- El formato MLX limita el despliegue al ecosistema Apple Silicon; para otras plataformas es necesaria una conversión de pesos.
- No se dispone de información sobre sesgos específicos del modelo base ni del fine-tuning.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/MiniCPM5-2B-CRACK-JANG_8M
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Sitio de Dealign AI: https://dealign.ai/
- vMLX (motor de inferencia): https://vmlx.net
- Otro modelo CRACK de dealignai: https://huggingface.co/dealignai/MiniMax-M2.5-JANG_4M-CRACK
