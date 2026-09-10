# Jeesup/svd-safety-l2_remove40_swapgap_b005

## Resumen

`Jeesup/svd-safety-l2_remove40_swapgap_b005` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido con la técnica SVD-LLM hasta conservar el 60,0 % de los parámetros densos (se elimina el 40,02 %), al que después se le devuelve un presupuesto del 0,5 % de parámetros en componentes SVD restaurados según la regla de selección `swapgap`. Lo publica el usuario Jeesup como artefacto de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño.

No es un modelo conversacional de propósito general ni un asistente desplegable: es una celda concreta de una malla experimental que cruza reglas de selección y presupuestos de restauración. La model card advierte explícitamente de que varias ramas de esa malla están degradadas en seguridad de forma deliberada respecto al modelo base, porque el objetivo del trabajo es cuantificar la subida de la tasa de éxito de ataque (ASR) provocada por la compresión y medir la recuperación posterior.

Sobre el modelo base hereda una arquitectura transformer decoder-only de tipo Llama 2, con 6.738.415.616 parámetros almacenados según los safetensors del repositorio (13,5 GB), licencia Llama 2 Community License y pipeline de `text-generation`. La model card declara una fracción de parámetros resultante de 0,5998, semilla 42, 3.033 componentes SVD restaurados y 3.033 componentes sustituidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) con compresión SVD-LLM aplicada sobre las matrices de pesos |
| Parametros totales | 6.738.415.616 según los safetensors del repositorio; la model card declara una fracción de parámetros resultante de 0,5998 respecto al denso |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card; heredada de `meta-llama/Llama-2-7b-chat-hf` (4.096 tokens en el modelo base) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no se incluyen versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible en la model card |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | `meta-llama/Llama-2-7b-chat-hf` |
| Metodo de compresion | SVD-LLM, 40,02 % de parámetros eliminados |
| Regla de seleccion | `swapgap` |
| Presupuesto de restauracion | 0,500 % de los parámetros densos |
| Componentes restaurados / sustituidos | 3.033 restaurados y 3.033 sustituidos |
| Semilla | 42 |
| Tamano del repositorio | 13,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-2-7b-chat: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, RoPE para las posiciones y atención causal estándar (no se emplea atención lineal ni decodificación especulativa). Sobre ese checkpoint se aplica SVD-LLM, un esquema de compresión que descompone las matrices de pesos en factores de bajo rango y descarta los componentes menos relevantes; en esta celda concreta se elimina el 40,02 % de los parámetros, dejando una fracción densa de 0,5998.

La innovación específica de este artefacto no está en la arquitectura, sino en el procedimiento de reparación posterior: tras la compresión se reintroducen componentes SVD previamente descartados hasta consumir un presupuesto del 0,5 % de los parámetros densos (3.033 componentes restaurados, con 3.033 componentes sustituidos en el intercambio), seleccionados mediante la regla `swapgap`. No se documenta en la información disponible ningún proceso adicional de ajuste fino, RLHF o DPO posterior a la compresión, ni el volumen o la composición del dataset utilizado en la compresión. Se desconoce igualmente si el resultado se validó con recalibración y con qué datos.

## Capacidades

- Generación de texto conversacional en inglés, heredada del checkpoint Llama-2-7b-chat sobre el que se construye, aunque degradada por la compresión.
- Razonamiento básico e instrucciones de un solo turno, propias de un modelo de 7B de la familia Llama 2.
- Sujeto experimental para medir el efecto de la compresión SVD sobre el comportamiento de seguridad y el sobre-rechazo.
- Banco de pruebas para comparar reglas de selección de componentes SVD (`swapgap` frente a otras reglas de la malla) bajo un presupuesto de restauración fijo.
- Punto de referencia para estudios de interpretabilidad de pesos comprimidos y de recuperación selectiva de subespacios.
- No se documenta soporte de tool calling ni de function calling nativo.
- No se documenta soporte de agentes, razonamiento multi-paso estructurado, visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües: no disponibles; la model card no declara idiomas soportados.

## Casos de uso

- Investigación sobre compresión de modelos: usar este checkpoint como celda experimental para cuantificar cuánta capacidad se pierde al eliminar el 40,02 % de los parámetros de Llama-2-7b-chat mediante SVD-LLM, comparando la perplejidad de WikiText-2 (11,4801) con la del modelo denso.
- Evaluación de seguridad bajo compresión: ejecutar AdvBench y StrongREJECT con el juez de HarmBench para medir la ASR (0,0500 y 0,1406 respectivamente) y estudiar cómo la compresión eleva la tasa de éxito de ataque frente al modelo sin comprimir.
- Estudio de sobre-rechazo: emplear WildGuard para medir el rechazo excesivo macro (0,1446) y analizar el equilibrio entre seguridad y utilidad en modelos comprimidos.
- Comparación de reglas de selección de componentes: dado que este artefacto usa la regla `swapgap` con un presupuesto del 0,5 %, sirve como rama de control frente a otras reglas y presupuestos de la misma malla experimental.
- Reproducción de resultados: la semilla 42, los 3.033 componentes restaurados y la fracción 0,5998 están documentados, lo que permite reproducir la celda y verificar la metodología del estudio.
- Auditoría de robustez de pesos comprimidos: analizar espectros singulares y subespacios restaurados para entender qué componentes concentran el comportamiento de seguridad.
- Docencia y divulgación sobre compresión: ilustrar en un aula o tutorial el compromiso entre tamaño, perplejidad y alineación usando un checkpoint real con métricas publicadas.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR con juez de HarmBench | 0,0500 |
| StrongREJECT | ASR con juez de HarmBench | 0,1406 |
| WildGuard | Rechazo excesivo macro (over-refusal) | 0,1446 |
| WikiText-2 | Perplejidad | 11,4801 |

La model card no publica los valores equivalentes del modelo base sin comprimir ni de las demás celdas de la malla, por lo que no es posible establecer aquí la comparación directa entre esta rama y `meta-llama/Llama-2-7b-chat-hf`. Tampoco se proporcionan resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de capacidad general.

## Requisitos de hardware

- Inferencia en fp16/bf16: aproximadamente 13,5 GB de pesos (el repositorio ocupa 13,5 GB en safetensors), más caché KV; requiere del orden de 15-17 GB de VRAM según longitud de secuencia y tamaño de lote.
- Cuantización a 8 bits: alrededor de 7 GB de pesos; cabe en GPU de 10-12 GB como RTX 3080, RTX 4070 o RTX 3060 de 12 GB.
- Cuantización a 4 bits: alrededor de 4 GB de pesos; cabe en GPU de 8 GB como RTX 3070, RTX 4060 o RTX 2070.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio en fp16 con lotes grandes; RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) para fp16 en usuario único; RTX 3060 12 GB o RTX 4060 8 GB con cuantización agresiva.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más si se cuantiza; en fp16 exige al menos 16 GB útiles.
- Opciones de despliegue: `transformers` de forma nativa; el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`, por lo que es desplegable con TGI y con vLLM. Para llama.cpp u Ollama sería necesaria una conversión propia a GGUF, ya que no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles; la model card no incluye mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (ASR AdvBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_remove40_swapgap_b005` | 6.738.415.616 almacenados; fracción declarada 0,5998 | No disponible (base: 4.096) | 0,0500 | Llama 2 Community License | Safetensors, 0 descargas y 0 likes en el momento de la consulta |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | 6.738.415.616 | 4.096 tokens | No disponible en la información proporcionada (la model card indica que la compresión sola eleva la ASR) | Llama 2 Community License | Ampliamente disponible en HuggingFace |
| Otras celdas de la misma malla experimental (reglas y presupuestos alternativos) | No disponible | No disponible | No disponible | Llama 2 Community License | No disponible en la información proporcionada |

No se han encontrado en la búsqueda web modelos comparables adicionales ni resultados que permitan situar este checkpoint frente a otras alternativas de 7B comprimidas.

## Limitaciones y advertencias

- Artefacto de investigación, no un asistente desplegable: la propia model card pide tratarlo como sujeto experimental y no como modelo de propósito general.
- Degradación de seguridad deliberada en varias ramas de la malla: la compresión por sí sola eleva la tasa de éxito de ataque frente a Llama-2-7b-chat, y el objetivo del estudio es precisamente cuantificarlo.
- ASR medidos: 0,0500 en AdvBench y 0,1406 en StrongREJECT con juez de HarmBench, cifras que deben interpretarse en el contexto del experimento y no como garantía de seguridad.
- Sobre-rechazo macro de 0,1446 (WildGuard): el modelo rechaza peticiones legítimas en una proporción medible, lo que reduce su utilidad conversacional.
- Perplejidad de WikiText-2 de 11,4801, sin referencia publicada del modelo denso en la misma ficha para establecer la magnitud exacta del deterioro.
- Idiomas soportados no declarados; el modelo base Llama 2 es mayoritariamente anglófono y esta ficha no aporta datos de evaluación multilingüe.
- Sin datos de cuantizaciones publicadas, lo que obliga a generarlas por cuenta propia y puede alterar aún más las métricas de seguridad.
- Licencia Llama 2 Community License con sus restricciones habituales: condiciones de atribución, cláusula de escala (umbral de usuarios activos mensuales) y política de uso aceptable recogida en `USE_POLICY.md`.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo de 7B comprimido un 40 % y sin ajuste posterior documentado.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes de terceros que confirmen los resultados.
- Fecha de creación registrada como 2026-09-10 y fecha de actualización 2026-09-10, posteriores a la fecha habitual de publicación de los artefactos de esta familia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgap_b005
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- No se han encontrado enlaces adicionales relevantes en la búsqueda web; los resultados obtenidos no guardan relación con el modelo ni con el estudio de compresión SVD.
