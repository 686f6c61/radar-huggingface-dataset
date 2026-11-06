# richardyoung/OLMo-2-0325-32B-Instruct-MPOA-heretic

## Resumen

OLMo-2-0325-32B-Instruct-MPOA-heretic es una variante "decensored" del modelo allenai/OLMo-2-0325-32B-Instruct, publicada por el usuario richardyoung mediante la herramienta Heretic v2.0.0. El proceso aplicado es Magnitude-Preserving Orthogonal Ablation (MPOA), una tecnica de ablacion de direcciones en el espacio de activaciones que busca reducir la tasa de rechazos del modelo sin reentrenar los pesos. El resultado es un modelo de 32.234.279.936 parametros (32,2 B) con licencia Apache 2.0, publicado en formato safetensors y compatible con transformers y endpoints.

El modelo base, OLMo 2 32B Instruct de AI2 (Allen Institute for AI), es un transformer denso entrenado sobre el dataset Dolma y post-entrenado con SFT sobre una variante de Tülu 3, DPO y RLVR. La variante heretic conserva esa base pero modifica el comportamiento de rechazo: segun la model card, los rechazos bajan de 98/100 en el modelo original a 36/100 en esta version, con una divergencia KL de 0,0372 respecto al original. Es relevante para quienes necesitan un modelo abierto, reproducible y con menos filtros de rechazo, manteniendo la trazabilidad del linaje OLMo.

La ficha se centra en los datos disponibles publicamente; el autor no documenta benchmarks de capacidades (MMLU, GSM8K, HumanEval) para esta variante, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia OLMo 2, decodificador autoregresivo) |
| Parametros totales | 32.234.279.936 (32,2 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | ingles (principalmente); el modelo base se describe como "primarily English" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del OLMo 2 32B: un transformer denso de tipo decodificador, con 32,2 B de parametros, entrenado por AI2 sobre el dataset Dolma (mezcla de datos publicos, sinteticos y creados por humanos). El post-entrenamiento del modelo base Instruct sigue tres fases: SFT sobre una variante especifica de OLMo del dataset Tülu 3, DPO sobre el dataset de preferencias olmo-2-0325-32b-preference-mix y RLVR final sobre RLVR-GSM-MATH-IF-Mixed-Constraints. La model card indica que OLMo 2 no fue entrenado con un system prompt especifico y que la plantilla de chat usa los tokens `<|user|>`, `<|assistant|>` y `<|endoftext|>`, sin token BOS inicial.

Sobre esa base, la variante heretic aplica MPOA (Magnitude-Preserving Orthogonal Ablation) con Heretic v2.0.0. Los parametros documentados incluyen `direction_index` = 40,35, pesos maximos y minimos en `attn.o_proj` (1,19 / 0,46) y en `mlp.down_proj` (1,32 / 0,92), con sus posiciones y distancias asociadas. El autor declara que el proceso es reproducible y publica un directorio `reproduce` con instrucciones. No se documentan tokens adicionales de entrenamiento ni cambios en la composicion del dataset respecto al modelo base; la intervencion es de ablacion, no de reentrenamiento supervisado.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento y matematicas: el modelo base fue post-entrenado con RLVR sobre GSM y MATH, segun la model card del original.
- Instrucciones complejas: el dataset de RLVR incluye restricciones mixtas de instruction-following (IF).
- Reduccion de rechazos: 36/100 rechazos frente a 98/100 del original, segun la tabla de rendimiento del autor.
- Reproducibilidad: pipeline documentado en el directorio `reproduce` para regenerar la ablacion.
- Compatibilidad con `transformers` y con endpoints compatibles (tag `endpoints_compatible`).
- No se documentan capacidades de vision, audio, tool calling ni modo thinking en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y rechazos: el modelo permite estudiar como varia la tasa de rechazo (98/100 a 36/100) con una intervencion de ablacion y una divergencia KL medida de 0,0372, util para analizar el equilibrio entre utilidad y seguridad.
- Reproduccion de experimentos de decensoring: al incluir el directorio `reproduce` y los parametros MPOA, se puede replicar el proceso sobre el mismo checkpoint o adaptarlo a otros modelos OLMo 2.
- Generacion de texto creativo sin filtros excesivos: para tareas de escritura de ficcion o guiones donde los rechazos del modelo alineado interrumpen el flujo, con la advertencia de revisar el contenido generado.
- Evaluacion comparativa de modelos abiertos: sirve como punto de comparacion frente al OLMo 2 Instruct original en benchmarks de instrucciones y matemáticas, manteniendo el mismo linaje y licencia Apache 2.0.
- Fine-tuning posterior: al ser un modelo denso de 32 B con pesos safetensors y licencia permisiva, puede servir de base para ajustes supervisados en dominios concretos en ingles.
- Despliegue en entornos de investigacion con `transformers`: carga directa mediante `AutoModelForCausalLM.from_pretrained`, adecuada para laboratorios que ya trabajan con la familia OLMo.

## Benchmarks y rendimiento

La unica tabla de rendimiento publicada por el autor compara rechazos y divergencia KL frente al modelo original:

| Metrica | Este modelo | Modelo original (allenai/OLMo-2-0325-32B-Instruct) |
|---|---|---|
| Rechazos | 36/100 | 98/100 |
| Divergencia KL | 0,0372 | 0 (por definicion) |

No se han publicado resultados de benchmarks de capacidades (MMLU, GSM8K, HumanEval, IFEval, MATH) para esta variante heretic en la informacion disponible. La model card del modelo base incluye una tabla comparativa con GPT-3.5 Turbo, GPT-4o Mini, Mistral-Nemo-Instruct-2407 y otros, pero esa tabla corresponde al OLMo 2 Instruct original, no a esta ablacion, y los datos citados en la informacion proporcionada estan truncados.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 64,5 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica requiere multiples GPU o una GPU de 80 GB con cuantizacion parcial.
- GPU recomendadas: H100 80 GB, A100 80 GB o configuraciones multi-GPU (por ejemplo, 2x A100 40 GB) para BF16.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090) en BF16; requeriria cuantizacion a 4 bits, no publicada en el repo, para acercarse a ese rango.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (soporte de OLMo 2 en la rama main de transformers segun la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-2-0325-32B-Instruct-MPOA-heretic (este) | 32,2 B | no disponible | Apache 2.0 | Ablacion MPOA; 36/100 rechazos; KL 0,0372 |
| allenai/OLMo-2-0325-32B-Instruct | 32,2 B | no disponible | Apache 2.0 | Modelo base alineado; 98/100 rechazos |
| Mistral-Nemo-Instruct-2407 | no disponible en la informacion proporcionada | no disponible | no disponible | Aparece en la tabla del modelo base con media 50,9; datos truncados |
| GPT-4o Mini 2024-07-18 (API cerrada) | no disponible | no disponible | propietaria | Media 65,7 en la tabla del modelo base; no es open weights |

La comparacion con alternativas de la misma categoria (modelos abiertos de ~30 B) no esta disponible con datos completos en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion reduce rechazos de forma deliberada; el modelo puede producir contenido problematico con mayor facilidad que el original, especialmente si se le induce.
- El modelo base tiene entrenamiento de seguridad limitado y no incluye filtrado en bucle, segun la model card de OLMo 2.
- Riesgo de alucinacion: no se documentan evaluaciones especificas de veracidad (TruthQA, PopQA) para esta variante.
- Idiomas: soporte principalmente en ingles; el castellano no esta garantizado.
- Longitud de contexto: no documentada en la informacion proporcionada; conviene verificar la configuracion del modelo base antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ablacionado.
- Reproducibilidad: el proceso MPOA esta documentado, pero los resultados pueden variar si se aplica sobre otros checkpoints.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-MPOA-heretic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Modelo pre-DPO: https://huggingface.co/allenai/OLMo-2-0325-32B-DPO
- Heretic: https://heretic-project.org
- Paper OLMo 2: https://arxiv.org/abs/2501.00656
- Paper Tülu 3: https://arxiv.org/abs/2411.15124
- Pagina del proyecto OLMo: https://allenai.org/olmo
- Repo de entrenamiento e inferencia: https://github.com/allenai/OLMo-core
- Codigo de evaluacion: https://github.com/allenai/olmes
- Codigo de fine-tuning: https://github.com/allenai/open-instruct
- Demo: https://playground.allenai.org/
- Dataset SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture
- Dataset de preferencias: https://huggingface.co/datasets/allenai/olmo-2-0325-32b-preference-mix
- Dataset RLVR: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
