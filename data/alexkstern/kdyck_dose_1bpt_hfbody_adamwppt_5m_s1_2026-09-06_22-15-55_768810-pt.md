# alexkstern/kdyck_dose_1Bpt_hfbody_adamwppt_5M_s1_2026-09-06_22-15-55_768810-pt

## Resumen

Este modelo es un checkpoint de investigación generado con el framework nanochat, desarrollado por el autor alexkstern. Se trata de un experimento de "token dose" que estudia cómo un modelo de lenguaje pequeño, pre-entrenado en FineWeb, se adapta posteriormente a un lenguaje formal específico (Dyck k=128). El nombre "1Bpt" hace referencia a los 1.000 millones de tokens de pre-entrenamiento, no al número de parámetros.

La arquitectura es un transformer decoder-only con 16 capas, 8 cabezas de atención y una dimensión de embedding de 1024. A partir de la configuración, se estima un modelo de aproximadamente 330 millones de parámetros. La longitud de contexto es de 2048 tokens. El checkpoint corresponde al paso 3.814, tras un post-entrenamiento de 5 millones de tokens sobre el dataset Dyck, con un vocabulario de salida reducido a 256 tokens.

El modelo está pensado para investigación en aprendizaje de lenguajes formales y transferencia de conocimiento entre tareas. No está orientado a uso en producción ni a tareas generales de procesamiento de lenguaje natural. La licencia es Apache 2.0 y el repositorio contiene los pesos en formato PyTorch state_dict.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | no disponible (estimado ~330M a partir de la configuracion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 16 capas, 8 cabezas de atencion, 8 cabezas KV (atencion multi-cabeza estandar) y dimension de embedding de 1024. El vocabulario de pre-entrenamiento es de 65.536 tokens, mientras que tras la transicion al post-entrenamiento se reemplaza el embedding de entrada y la capa de salida por un vocabulario de 256 tokens, especifico para el dataset Dyck. La configuracion indica `reinit_embed_at_transition: true` y `reset_optimizer_at_transition: true`, lo que sugiere una reinicializacion de los embeddings y del optimizador al pasar de la fase de pre-entrenamiento a la de post-entrenamiento.

El pre-entrenamiento se realiza sobre el dataset FineWeb (nanochatbpe, 20B tokens) durante 1.000 millones de tokens. Posteriormente, se entrena con 5 millones de tokens del dataset Dyck k=128 con longitud de secuencia 2048. Se emplea un programa de tasa de aprendizaje trapezoidal, con warmup nulo y warmdown del 40%. La tasa de aprendizaje de la matriz es 0.02, la de embeddings 0.3 y la de unembedding 0.004. No se ha aplicado RLHF ni DPO. El entrenamiento total utilizo 2.08e18 FLOPs y tardo aproximadamente 742 segundos.

## Capacidades

- Generacion de texto basica: el modelo puede generar secuencias de tokens, pero su utilidad esta limitada a experimentos de investigacion.
- Aprendizaje de lenguajes formales: esta entrenado especificamente para procesar el lenguaje Dyck con k=128, una tarea de balanceo de parentesis.
- Transferencia de conocimiento: permite estudiar como el pre-entrenamiento en texto general afecta al aprendizaje de una tarea formal posterior.
- No se han documentado capacidades de tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso.
- Capacidades multilingues: no declaradas.

## Casos de uso

- Investigacion en lenguajes formales: el modelo se puede utilizar para analizar como los transformers representan estructuras de parentesis anidados (Dyck k=128) y comparar el rendimiento con otras variantes del mismo experimento.
- Estudio de transferencia de aprendizaje: sirve como punto de referencia para medir el efecto de una "dosis" de 5 millones de tokens de una tarea especifica tras un pre-entrenamiento extenso en texto general.
- Reproduccion de experimentos: el checkpoint y los metadatos de entrenamiento (config, RNG state) permiten reproducir los resultados publicados en el proyecto de investigacion.
- Evaluacion de estrategias de optimizacion: la configuracion incluye tasas de aprendizaje separadas para matrices, embeddings y unembedding, asi como reinicializacion de embeddings; el modelo puede usarse para comparar estas estrategias.
- Desarrollo de modelos pequenos: puede servir como ejemplo de implementacion de un transformer de ~330M con el framework nanochat, util para fines educativos o como base para experimentos propios.
- Analisis de perdidas y dinamicas de entrenamiento: los datos de W&B y los metadatos permiten estudiar la curva de perdida y el comportamiento del optimizador durante la transicion entre fases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos numericos son la perdida de entrenamiento suavizada (`smooth_train_loss` = 3.168) y la metrica `min_objective` (0.9445), que no corresponden a benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Por tamano estimado (~330M), una inferencia en FP16 necesitaria aproximadamente 1 GB de VRAM, y en FP32 alrededor de 1.3 GB.
- GPU recomendadas: no disponible. El modelo es lo suficientemente pequeno para ejecutarse en GPUs de consumo con al menos 2 GB de VRAM, como una RTX 2060 o superior.
- Si cabe en consumer GPU: si, con margen, siempre que se respete la longitud de contexto de 2048 tokens.
- Opciones de despliegue: no disponible. El repositorio no incluye archivos GGUF ni configuraciones para vLLM, Ollama o TGI. Requiere conversion manual a formatos compatibles si se desea usar con esos frameworks.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Contexto | Licencia | Notas |
|---|---|---|---|
| kdyck_dose_1Bpt_hfbody_adamwppt_5M_s1 (este) | 2048 | Apache 2.0 | Post-entrenamiento de 5M tokens, reinicializacion de embeddings, inicializacion "hfbody" |
| kdyck_dose_1Bpt_hfinit_1B_s1 | 2048 | Apache 2.0 | Variante con 1B tokens de post-entrenamiento, inicializacion "hfinit" |
| kdyck_dose_1Bpt_hfinit_5M_s1 | 2048 | Apache 2.0 | Variante con 5M tokens de post-entrenamiento, inicializacion "hfinit" |

Los parametros totales y el rendimiento de las variantes comparadas no estan disponibles en la informacion proporcionada. Las diferencias principales radican en la inicializacion de los pesos ("hfbody" vs "hfinit") y en la cantidad de tokens de post-entrenamiento.

## Limitaciones y advertencias

- Modelo de investigacion: no esta diseñado ni validado para uso en produccion o aplicaciones reales.
- Sin evaluacion de seguridad ni alineacion: no se han realizado pruebas de sesgos, toxicidad o comportamientos no deseados.
- Vocabulario reducido en la fase de post-entrenamiento: la capa de salida tiene solo 256 tokens, lo que limita su capacidad de generar texto general.
- Riesgo de alucinacion alto: al ser un modelo pequeno y sin ajuste fino para tareas generales, las respuestas fuera del dominio Dyck son poco fiables.
- Sin soporte para tool calling, agentes, vision ni audio.
- Formato de pesos no estandar: el checkpoint es un state_dict de PyTorch, no un modelo listo para HuggingFace Transformers u otros frameworks sin conversion.
- Idiomas no declarados: aunque el pre-entrenamiento se realizo con FineWeb (mayoritariamente ingles), no hay garantia de rendimiento en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no esta optimizado para ello y carece de documentacion de soporte.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_adamwppt_5M_s1_2026-09-06_22-15-55_768810-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/zfcfc2j9
- Nanochat (framework de entrenamiento): https://github.com/karpathy/nanochat
- Variante con 1B tokens de post-entrenamiento: https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfinit_1B_s1_2026-08-14_16-47-14_126981-pt
- Variante con 5M tokens de post-entrenamiento: https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfinit_5M_s1_2026-08-14_12-38-50_843122-pt
