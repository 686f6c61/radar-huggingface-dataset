# Jeesup/svd-safety-l3_svdllmwjsep0_r40

## Resumen

svd-safety-l3_svdllmwjsep0_r40 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct comprimido mediante SVD-LLM, una tecnica de compresion por descomposicion en valores singulares que reduce el numero de parametros densos de la red. En concreto, se elimina el 40,00 % de los parametros (fraccion resultante de 0,5998) y se aplica una recuperacion posterior con LoRA en dos etapas sobre el conjunto alpaca-cleaned. El resultado mantiene la arquitectura transformer decoder-only de Llama 3 8B, pero con matrices de proyeccion truncadas en rango.

El modelo lo publica el usuario Jeesup como artefacto de investigacion dentro de un estudio sobre como la compresion SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor. No es un modelo conversacional de proposito general: es una celda concreta de una malla experimental sobre reglas de seleccion y presupuestos de compresion. La calibracion utilizada es un conjunto agrupado de utilidad (WikiText-2) y seguridad, aunque en esta celda la parte de seguridad tiene peso efectivo cero (a = 0), por lo que equivale a un SVD-LLM estandar.

Su relevancia es metodologica: permite medir el compromiso entre utilidad (perplejidad en WikiText-2, precision zero-shot en 7 tareas) y seguridad (tasas de exito de ataque en AdvBench y StrongREJECT, tasa de sobrerrechazo en WildGuard) bajo compresion. El checkpoint tiene 8.030.261.248 parametros y un repositorio de 16,1 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), con matrices de proyeccion truncadas por SVD-LLM |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3 8B Instruct, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Meta Llama 3 Community License (llama3) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 3 con 8.030.261.248 parametros. Sobre esa base se aplica SVD-LLM: se estima una base de subespacio mediante un SVD blanqueado (estimador de los autores de AIoT-MLSys-Lab/SVD-LLM) calculado sobre un conjunto de calibracion agrupado, con S S^T = suma sobre WikiText x x^T mas suma sobre seguridad x x^T. En esta celda la parte de seguridad tiene peso a = 0, es decir, calibracion puramente de utilidad. La calibracion de utilidad usa WikiText-2 train con 255 ventanas de 2048 tokens (muestreador de SVD-LLM, semilla 42) y todas las posiciones. Se elimina el 40,00 % de los parametros, dejando una fraccion de 0,5998.

Tras el truncamiento se aplica la recuperacion de etapa 2 de SVD-LLM con LoRA secuencial (primero U, luego V), sobre alpaca-cleaned, con r=8, alpha=16, 2 epocas, learning rate 1e-4, batch 64, cutoff 256 y precision bf16. La semilla global es 42. No se documenta en la informacion disponible el numero total de tokens de entrenamiento del modelo base ni detalles de RLHF/DPO mas alla de los heredados de Llama 3 8B Instruct.

## Capacidades

- Generacion de texto conversacional heredada de Llama-3-8B-Instruct, aunque degradada por la compresion.
- Razonamiento y respuesta a instrucciones en formato chat, con calidad reducida respecto al modelo denso original.
- Evaluacion de seguridad: el checkpoint esta disenado para medir tasas de exito de ataque (ASR) y sobrerrechazo, no para ser seguro por si mismo.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor lo describe explicitamente como no apto para uso general.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre compresion de modelos: usar este checkpoint como celda de referencia para comparar reglas de seleccion de componentes SVD y presupuestos de compresion en un mismo pipeline experimental.
- Medicion de degradacion de seguridad: evaluar AdvBench ASR y StrongREJECT ASR frente a Llama-3-8B-Instruct sin comprimir para cuantificar cuanto sube la tasa de exito de ataque al eliminar el 40 % de parametros.
- Estudio de sobrerrechazo: usar la metrica Macro over-refusal (WildGuard) para analizar si la compresion altera la tendencia del modelo a rechazar peticiones benignas.
- Analisis de utilidad bajo compresion: medir perplejidad en WikiText-2 y precision zero-shot en 7 tareas para trazar curvas de compromiso utilidad-seguridad.
- Reproducibilidad de experimentos: reutilizar la configuracion documentada (semilla 42, calibracion WikiText-2, LoRA r=8 alpha=16) como base para replicar o extender el estudio.
- Docencia y formacion: ilustrar en cursos de interpretabilidad y compresion como una tecnica de algebra lineal (SVD) afecta a propiedades de alineamiento de un LLM.
- No recomendado para atencion al cliente, generacion de codigo en produccion ni despliegue como asistente, segun las propias advertencias del autor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,4038 |
| StrongREJECT ASR (juez HarmBench) | 0,3802 |
| Macro over-refusal (WildGuard) | 0,1433 |
| Perplejidad WikiText-2 | 28,5037 |
| Precision media zero-shot (7 tareas, acc_norm donde se reporta) | 0,5035 |

No se han publicado en la informacion disponible resultados comparativos frente a Llama-3-8B-Instruct sin comprimir ni frente a otras celdas de la malla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos (8,03 mil millones de parametros), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimacion a partir del numero de parametros; no confirmada en la informacion disponible).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4090 o GPUs de 16 GB en cuantizacion para caber en consumer.
- Cabe en GPU consumer de 24 GB en bf16 con contexto moderado; en 16 GB requiere cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), y previsiblemente vLLM y llama.cpp/Ollama previa conversion a GGUF (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmwjsep0_r40 | 8,03 B (60 % denso) | no disponible | Llama 3 Community | Checkpoint de investigacion comprimido, seguridad degradada |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B (denso) | 8 K (heredado, no confirmado aqui) | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la malla SVD-LLM del mismo autor | ~8 B con distintos presupuestos | no disponible | Llama 3 Community | Variantes con distintas reglas de seleccion y pesos de seguridad |

No se dispone en la informacion proporcionada de resultados de benchmarks de los modelos comparables para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de investigacion, no un asistente desplegable: el autor lo declara explicitamente como sujeto experimental.
- Seguridad degradada de forma deliberada en varias celdas de la malla; la compresion por si sola eleva la tasa de exito de ataque (ASR de 0,4038 en AdvBench y 0,3802 en StrongREJECT).
- Riesgo de alucinacion incrementado respecto al modelo denso por la perdida de capacidad asociada a la compresion (perplejidad WikiText-2 de 28,5037).
- Precision zero-shot media de 0,5035 en 7 tareas, inferior a la del modelo base sin comprimir.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue.
- Licencia Meta Llama 3 Community: uso comercial sujeto a los terminos de LICENSE y USE_POLICY.md incluidos en el repositorio, con obligaciones de atribucion ("Built with Meta Llama 3").
- No usar en produccion sin evaluacion propia previa de seguridad y utilidad en el dominio objetivo.
- Contexto maximo no confirmado en la model card; no asumir la ventana completa de Llama 3 sin verificar.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep0_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- No se han encontrado en la informacion proporcionada papers, blogs, demos ni otros enlaces adicionales especificos de este checkpoint.
