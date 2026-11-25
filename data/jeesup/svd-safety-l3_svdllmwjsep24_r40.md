# Jeesup/svd-safety-l3_svdllmwjsep24_r40

## Resumen

svd-safety-l3_svdllmwjsep24_r40 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct obtenido mediante compresion SVD-LLM, con un presupuesto del 60,0 % de parametros densos (40,00 % eliminados). Lo publica el autor Jeesup como artefacto de investigacion sobre como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor. No es un modelo de chat de proposito general.

El modelo conserva la arquitectura transformer decoder-only de Llama 3 8B (8.030.261.248 parametros reales segun safetensors), con una ventana de contexto heredada del modelo base y pesos en formato safetensors compatibles con transformers. La compresion se aplica sobre una calibracion conjunta de utilidad (WikiText-2) y seguridad (WildJailbreak), y se recupera parcialmente con una etapa LoRA secuencial sobre alpaca-cleaned.

Su relevancia es metodologica: forma parte de una cuadricula experimental sobre reglas de seleccion y presupuestos de compresion, y publica metricas medidas de ataque (AdvBench ASR 0,1154, StrongREJECT ASR 0,1534), sobrerrechazo (0,1746), perplejidad en WikiText-2 (28,3339) y precision zero-shot media en 7 tareas (0,4974). Sirve para estudiar el equilibrio seguridad/utilidad bajo compresion, no para desplegarse como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM |
| Parametros totales | 8.030.261.248 (fraccion resultante 0,5998 del modelo denso) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Meta-Llama-3-8B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Meta Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct y se comprime con SVD-LLM usando la SVD blanqueada de los autores (AIoT-MLSys-Lab/SVD-LLM) sobre un unico conjunto de calibracion agrupado: S·Sᵀ = suma_WikiText x·xᵀ + suma_safety x·xᵀ. La parte de utilidad usa WikiText-2 train, 255 ventanas de 2048 tokens con el muestreador de SVD-LLM (semilla 42) y todas las posiciones; la parte de seguridad usa los primeros 24 de 512 prompts de entrenamiento de WildJailbreak (vanilla y adversariales daninos) con los rechazos propios de Llama-3-8B-Instruct (orden con semilla 42), una conversacion por muestra desempaquetada (2619 posiciones, todas las posiciones). La cuota efectiva de seguridad es de 0,0050 de las posiciones.

Tras la compresion al 60,0 % de parametros densos, se aplica la recuperacion de etapa 2 de SVD-LLM mediante LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 epocas, learning rate 1e-4, batch 64, cutoff 256 y bf16. La semilla global es 42. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal; la innovacion reside en el procedimiento de compresion y en la calibracion conjunta utilidad/seguridad.

## Capacidades

- Generacion de texto conversacional heredada de Llama-3-8B-Instruct, sujeta a la degradacion introducida por la compresion.
- Razonamiento y conocimiento general evaluados de forma agregada: precision zero-shot media de 0,4974 en 7 tareas (acc_norm donde se reporta).
- Comportamiento de rechazo ante peticiones daninas, medido con AdvBench (ASR 0,1154) y StrongREJECT (ASR 0,1534) bajo el juez HarmBench.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre compresion de modelos: usar el checkpoint como celda de una cuadricula experimental para medir la perdida de utilidad y de seguridad al eliminar el 40,00 % de parametros, comparandolo con otras reglas de seleccion y presupuestos.
- Evaluacion de robustez frente a jailbreak: ejecutar AdvBench y StrongREJECT con el juez HarmBench para cuantificar el aumento de la tasa de exito de ataque respecto al modelo denso original.
- Estudio del sobrerrechazo: medir la tasa macro de sobrerrechazo con WildGuard (0,1746) para analizar el coste de seguridad en utilidad conversacional.
- Analisis de calibracion de datos: reproducir el experimento variando la cuota de seguridad en el conjunto de calibracion (aqui 0,0050 de las posiciones) y observar su efecto en las metricas de seguridad.
- Benchmarking de perplejidad: usar WikiText-2 (perplejidad 28,3339) como referencia para comparar tecnicas de recuperacion LoRA tras compresion SVD.
- Docencia y divulgacion tecnica: ilustrar en un curso o articulo como una etapa LoRA secuencial sobre alpaca-cleaned recupera parcialmente la calidad tras una compresion agresiva.
- Ablacion de recuperacion: comparar este checkpoint con variantes sin etapa LoRA o con otros valores de r y alpha para aislar la contribucion de la recuperacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,1154 |
| StrongREJECT ASR (juez HarmBench) | 0,1534 |
| Sobrerrechazo macro (WildGuard) | 0,1746 |
| Perplejidad WikiText-2 | 28,3339 |
| Precision zero-shot media (7 tareas, acc_norm donde se reporta) | 0,4974 |

No se han publicado en la informacion disponible resultados desglosados por tarea (MMLU, HumanEval, GSM8K) ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 8.030.261.248 parametros, en bf16/fp16 se requieren aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, encaja en GPU con 24 GB o mas (por ejemplo, RTX 4090, A100 40 GB, H100) en bf16.
- Cabe en consumer GPU: previsiblemente en RTX 4090 (24 GB) en bf16; en GPUs de 16 GB requeriria cuantizacion, cuyo soporte no se documenta.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag text-generation-inference) y endpoints compatibles (tag endpoints_compatible). No se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l3_svdllmwjsep24_r40 | 8.030.261.248 (60,0 % del denso) | no disponible | llama3 | Hugging Face (148 descargas) | Artefacto de investigacion, seguridad degradada por diseno en varias celdas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | no disponible en esta ficha | llama3 | Hugging Face (modelo base) | Modelo denso de referencia sin compresion |
| Otras celdas de la cuadricula SVD-LLM del mismo autor | variable segun presupuesto | no disponible | llama3 | Hugging Face | Distintas reglas de seleccion y presupuestos de compresion |

No se dispone de datos de rendimiento comparativos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat de proposito general: el autor lo describe explicitamente como artefacto de investigacion y sujeto experimental.
- Varias celdas de la cuadricula estan deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; la compresion por si sola eleva la tasa de exito de ataque.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la perplejidad de 28,3339 en WikiText-2 es superior a la del modelo denso de referencia (valor no aportado).
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto e idioma: no documentadas; los idiomas soportados figuran como no disponibles.
- Restricciones de licencia: uso sujeto a la Meta Llama 3 Community License; el repositorio incluye LICENSE y USE_POLICY.md, y el uso comercial esta condicionado por dicha licencia.
- Para produccion: el autor recomienda evaluar el checkpoint de forma independiente antes de extraer conclusiones; no debe desplegarse como asistente sin auditoria propia.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep24_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM de los autores: https://github.com/AIoT-MLSys-Lab/SVD-LLM
