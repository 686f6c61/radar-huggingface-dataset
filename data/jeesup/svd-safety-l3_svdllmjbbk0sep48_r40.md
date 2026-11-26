# Jeesup/svd-safety-l3_svdllmjbbk0sep48_r40

## Resumen

`svd-safety-l3_svdllmjbbk0sep48_r40` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` comprimido mediante SVD-LLM, una tecnica de compresion basada en descomposicion en valores singulares aplicada a las matrices de pesos. El autor (Jeesup) lo publica como artefacto de investigacion dentro de un estudio sobre como la compresion SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor. No es un modelo de chat de proposito general.

El checkpoint conserva el 60,0 % de los parametros densos (se elimina un 40,00 %), y se recupera parcialmente con la etapa 2 de SVD-LLM, que aplica LoRA secuencial sobre U y luego sobre V. La calibracion combina un conjunto de utilidad (WikiText-2) con uno de seguridad (48 objetivos de JailbreakBench con las respuestas de rechazo del propio Llama-3-8B-Instruct). La proporcion efectiva de posiciones dedicadas a seguridad es minima (0,0022), lo que resulta clave para interpretar sus metricas.

Es relevante ahora porque cuantifica de forma medible el coste de seguridad de la compresion: el ASR en AdvBench sube a 0,1442 y en StrongREJECT a 0,1821, con una perplexidad en WikiText-2 de 28,3264 y una precision media zero-shot de 0,4954 en siete tareas. Es una celda de una rejilla experimental sobre reglas de seleccion y presupuestos, pensada para evaluacion, no para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM y recuperado con LoRA secuencial (etapa 2) |
| Parametros totales | 8.030.261.248 (60,0 % de los parametros densos del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (modelo base: Llama 3 8B Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Meta Llama 3 Community License (llama3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct, un transformer decoder-only de 8.030 millones de parametros. Sobre el se aplica SVD-LLM, que descompone las matrices de pesos mediante SVD blanqueada (implementacion de AIoT-MLSys-Lab/SVD-LLM) y descarta componentes segun una regla de seleccion, reduciendo los parametros al 59,98 %. La calibracion emplea un conjunto agrupado: 255 ventanas de 2.048 tokens de WikiText-2 train (muestreo SVD-LLM, semilla 42, todas las posiciones) mas las primeras 48 de 94 metas de JailbreakBench con los rechazos propios del modelo base (semilla 42, prompt y cabecera de asistente, 1.176 posiciones). La parte de seguridad representa solo 0,0022 de las posiciones totales.

Tras la compresion, se aplica la etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con r=8, alpha=16, 2 epocas, lr 1e-4, batch 64, cutoff 256 y bf16, sobre el dataset alpaca-cleaned. La semilla global del experimento es 42. No se documenta el numero total de tokens de entrenamiento del modelo base ni detalles de RLHF/DPO mas alla de los inherentes a Llama-3-8B-Instruct.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Llama-3-8B-Instruct.
- Razonamiento y respuesta a instrucciones de uso general (evaluado en siete tareas zero-shot con precision media de 0,4954).
- Capacidad de rechazo de peticiones daninas, aunque degradada respecto al modelo base (ASR de 0,1442 en AdvBench y 0,1821 en StrongREJECT).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible; el modelo es solo texto.

## Casos de uso

- Investigacion sobre compresion y seguridad: usar el checkpoint como celda de control en estudios que midan como la compresion SVD altera la tasa de exito de ataques (ASR) frente al modelo denso original.
- Evaluacion de reglas de seleccion de componentes: comparar esta configuracion (calibracion agrupada utilidad + seguridad) con otras celdas de la rejilla para determinar que regla repara mejor el comportamiento de seguridad.
- Analisis de interpretabilidad: inspeccionar los componentes descartados y los recuperados por LoRA para entender que direcciones de pesos afectan al rechazo de peticiones daninas.
- Benchmark de robustez frente a jailbreaks: ejecutar AdvBench, StrongREJECT y WildGuard sobre el checkpoint para cuantificar la degradacion respecto al base.
- Estudio de trade-off utilidad-seguridad: medir la perplexidad en WikiText-2 (28,3264) junto con el ASR para trazar la frontera de Pareto entre ambas metricas.
- Validacion de pipelines de evaluacion de seguridad: usar el modelo como sujeto de prueba en arneses automatizados que combinen un juez HarmBench con clasificadores de sobre-rechazo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,1442 |
| StrongREJECT ASR (juez HarmBench) | 0,1821 |
| Macro sobre-rechazo (WildGuard) | 0,1415 |
| Perplexidad WikiText-2 | 28,3264 |
| Precision media zero-shot (7 tareas, acc_norm donde aplica) | 0,4954 |

No se han publicado resultados comparativos con el modelo base ni con otras celdas de la rejilla en la informacion disponible. No se inventan cifras adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 16 GB para los 8.030 millones de parametros; el repo ocupa 16,1 GB en safetensors.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en tarjetas de 16 GB requeriria cuantizacion, no documentada en la informacion disponible.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no estan documentados para este checkpoint.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR AdvBench | Perplexidad WikiText-2 | Licencia |
|---|---|---|---|---|---|
| svd-safety-l3_svdllmjbbk0sep48_r40 | 8.030 M (60,0 % denso) | no disponible | 0,1442 | 28,3264 | Llama 3 Community |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M (100 %) | no disponible en esta ficha | no disponible | no disponible | Llama 3 Community |
| Otras celdas de la rejilla SVD-LLM del autor | variable (segun presupuesto) | no disponible | no disponible | no disponible | Llama 3 Community |

No se dispone de datos de benchmarks del modelo base ni de las demas celdas en la informacion proporcionada, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- Artefacto de investigacion: no es un modelo de chat de proposito general y no deberia desplegarse en produccion.
- Seguridad degradada deliberadamente: la compresion eleva la tasa de exito de ataques (ASR 0,1442 en AdvBench) respecto al modelo denso; algunas celdas de la rejilla estan aun mas degradadas.
- Calibracion de seguridad marginal: solo 0,0022 de las posiciones del conjunto de calibracion corresponden a seguridad, lo que limita la reparacion del comportamiento de rechazo.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado especificamente para este checkpoint.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del modelo base.
- Limitaciones de idioma y contexto: no documentadas en la informacion proporcionada.
- Restricciones de licencia: sujeto a Meta Llama 3 Community License; el repositorio incluye `LICENSE` y `USE_POLICY.md`, y el uso comercial se rige por dicha politica.
- Caveat de produccion: el autor recomienda evaluar cada celda de forma independiente antes de extraer conclusiones.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbk0sep48_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementacion SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Meta Llama 3: https://llama.meta.com/llama3/license
- No se han encontrado papers, blogs o demos adicionales en la informacion proporcionada.
