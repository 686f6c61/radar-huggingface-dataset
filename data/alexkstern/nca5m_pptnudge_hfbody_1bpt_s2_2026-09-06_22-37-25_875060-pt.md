# alexkstern/nca5M_pptnudge_hfbody_1Bpt_s2_2026-09-06_22-37-25_875060-pt

## Resumen

El modelo `nca5M_pptnudge_hfbody_1Bpt_s2_2026-09-06_22-37-25_875060-pt` es un experimento de investigación en procesamiento del lenguaje natural desarrollado por el autor `alexkstern` utilizando el framework `nanochat` de Karpathy. Se trata de un transformer decoder-only de pequeño tamaño, entrenado en dos fases: un preentrenamiento con 1.000 millones de tokens procedentes del dataset `fineweb-nanochatbpe-20B` y una fase posterior de "post-pretraining nudge" con 5 millones de tokens de un dataset adicional llamado `nca-paper-share200-2048`. El checkpoint publicado corresponde al paso 3.814 de entrenamiento.

El modelo es relevante porque documenta una técnica experimental de ajuste posterior al preentrenamiento que incluye un cambio de vocabulario y la reinicialización de las capas de embedding, así como un reseteo del optimizador. Está liberado bajo licencia Apache 2.0, aunque carece de documentación de uso, tokenizador o resultados de evaluación, por lo que su utilidad práctica es limitada y se orienta principalmente a la investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT) |
| Parametros totales | Aproximadamente 222M (estimado a partir de la configuracion: 16 capas, 1024 de embedding, 8 cabezas, 8 KV heads, vocabulario final de 10004) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch .pt (state_dict) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 16 capas, 8 cabezas de atencion, 8 cabezas KV (grouped query attention), dimension de embedding 1024 y contexto de 2048 tokens. La configuracion refleja dos fases de entrenamiento distintas: una fase de preentrenamiento (`model_pt`) con un vocabulario de 65.536 tokens y una fase de post-entrenamiento (`model_ppt`) con un vocabulario reducido a 10.004 tokens. En la transicion entre fases se reinicializan las capas de embedding, se cambia el vocabulario y se resetea el optimizador.

El preentrenamiento se realizo sobre el dataset `fineweb-nanochatbpe-20B` con un total de 1.000 millones de tokens. La fase de post-entrenamiento, denominada "nudge", utilizo 5 millones de tokens del dataset `nca-paper-share200-2048`. Se empleo un esquema de learning rate trapezoidal con una fase de calentamiento nula y un enfriamiento del 40% en preentrenamiento y del 80% en post-entrenamiento. El entrenamiento se registro en Weights & Biases. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto autónoma: el modelo es capaz de producir texto continuo, aunque no se han verificado sus capacidades cualitativas.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se han confirmado capacidades multilingües ni soporte de vision, audio u otras modalidades.
- No se ha documentado ningun modo especial de pensamiento ni de razonamiento extendido.
- El modelo carece de tokenizador o configuracion de uso publicada, por lo que su uso directo requiere reconstruccion manual.

## Casos de uso

- Investigacion en tecnicas de post-entrenamiento: el modelo sirve como caso de estudio para analizar el efecto de un "nudge" de 5M tokens sobre un modelo preentrenado con 1B tokens.
- Analisis del cambio de vocabulario y reinicializacion de embeddings: se puede utilizar para estudiar como afecta al aprendizaje la reduccion del vocabulario de 65.536 a 10.004 tokens.
- Reproducibilidad de experimentos: el checkpoint permite comparar configuraciones con otros experimentos del mismo autor, como los repositorios `nca_dose_*`.
- Educacion en arquitecturas transformer: es un ejemplo sencillo de un modelo pequeño con grouped query attention y contexto limitado, util para fines docentes.
- Prototipado rapido en entornos de investigacion: dado su tamano reducido, permite iterar en entornos con recursos de GPU limitados.
- Benchmarking de tecnicas de optimizacion: puede servir como base para probar variaciones de learning rate, schedules o estrategias de reinicializacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta metricas de evaluacion en MMLU, HumanEval, GSM8K ni otras referencias habituales. Solo se indica una perdida de entrenamiento suavizada de 3,159881114959717 en el paso 3.814, sin contexto comparativo.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~222M parametros en precision FP32 se requieren aproximadamente 888 MB; en FP16, 444 MB; en 8 bits, 222 MB.
- GPU recomendada: cualquier tarjeta con al menos 2 GB de VRAM, como una RTX 3060, T4 o equivalente, es suficiente para la carga del modelo.
- Compatibilidad con GPU de consumo: si, el modelo cabe en la mayoria de GPU consumer modernas.
- Opciones de despliegue: el checkpoint esta en formato PyTorch .pt, por lo que no es directamente compatible con vLLM, TGI o llama.cpp sin conversion previa. Para usar vLLM se necesitaria convertir los pesos a safetensors y definir un tokenizador, que no esta disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables dentro de la misma categoria. El autor ha publicado otros checkpoints experimentales en la serie `nca_dose` (por ejemplo, `nca_dose_1Bpt_hfbody_5M_s1_2026-08-14_05-39-21_493461-pt` y `nca_dose_100Mpt_hfbody_5M_s2_2026-08-14_23-35-47_354321-pt`), pero no se aportan datos de rendimiento que permitan establecer una comparativa tecnica rigurosa.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluacion de sesgos, seguridad o alucinaciones; el modelo no ha sido auditado.
- El riesgo de alucinacion es alto, al tratarse de un modelo pequeno sin validacion externa.
- El dataset de post-entrenamiento `nca-paper-share200-2048` no esta documentado, por lo que se desconoce su composicion y calidad.
- El checkpoint se distribuye como un archivo .pt sin tokenizador ni configuracion de inferencia, lo que dificulta enormemente su integracion en aplicaciones reales.
- No se han publicado benchmarks ni evaluaciones de calidad, por lo que cualquier afirmacion sobre su rendimiento es especulativa.
- La licencia Apache 2.0 permite uso comercial, pero no implica ninguna garantia de funcionamiento ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca5M_pptnudge_hfbody_1Bpt_s2_2026-09-06_22-37-25_875060-pt
- Run de Weights & Biases: https://wandb.ai/alexksternteam/ppt_nudge_probe_v0/runs/1o1vq2t6
- Repositorio de nanochat: https://github.com/karpathy/nanochat
- Checkpoints relacionados del mismo autor:
  - https://huggingface.co/alexkstern/nca_dose_1Bpt_hfbody_5M_s1_2026-08-14_05-39-21_493461-pt
  - https://huggingface.co/alexkstern/nca_dose_100Mpt_hfbody_5M_s2_2026-08-14_23-35-47_354321-pt
