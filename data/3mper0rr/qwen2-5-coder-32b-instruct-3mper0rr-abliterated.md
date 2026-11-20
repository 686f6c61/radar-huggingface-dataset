# 3MPER0RR/Qwen2.5-Coder-32B-Instruct-3MPER0RR-abliterated

## Resumen

Este modelo es una variante "abliterated" de Qwen2.5-Coder-32B-Instruct, desarrollada por el usuario 3MPER0RR. Se trata de un ajuste fino sobre el modelo base de Qwen (Alibaba) en el que se ha aplicado la tecnica de abliteration, que consiste en identificar y eliminar la direccion de activacion asociada al rechazo de peticiones, de forma que el modelo deja de negarse a responder a ciertos contenidos que el modelo original rechazaria.

El modelo base, Qwen2.5-Coder-32B-Instruct, es un transformer denso de 32.763.876.352 parametros (aproximadamente 32,8 mil millones) especializado en generacion de codigo, con una ventana de contexto de 128.000 tokens y licencia Apache 2.0. La variante abliterated conserva la arquitectura, los pesos y la licencia del original, y solo modifica el comportamiento de rechazo.

Es relevante para investigadores que estudian alineamiento, refusal behaviour y tecnicas de modificacion de pesos, asi como para desarrolladores que necesitan un modelo de codigo sin restricciones de rechazo en entornos controlados. La model card es extremadamente escasa: no documenta el metodo exacto de abliteration, el dataset de calibracion ni los resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Qwen2.5-Coder-32B-Instruct) |
| Tipos de cuantizacion | safetensors en BF16 en el repo principal; version GGUF Q8_0 publicada en repo separado |
| Idiomas soportados | no disponible (la model card no los declara; el modelo base soporta principalmente ingles y chino, con capacidades multilingues limitadas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF Q8_0 (repo secundario) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-Coder-32B-Instruct original: un transformer decoder-only denso con atencion por causalidad estandar, RoPE para codificacion posicional y mecanismos de atencion con GQA (grouped-query attention) propios de la familia Qwen2. La modificacion introducida por 3MPER0RR es una abliteration: se calculan las direcciones de activacion que discriminan entre prompts aceptados y rechazados, y se proyectan fuera de las matrices de pesos (tipicamente en las capas de atencion y MLP). La model card indica "Trials: [200]" y "Status: Tested and saved", lo que sugiere un proceso iterativo de calibracion, pero no se especifica la metodologia, el numero de capas intervenidas ni el dataset de calibracion empleado.

No hay informacion sobre el entrenamiento adicional, el volumen de datos de ajuste fino, ni sobre si se aplico RLHF o DPO en esta variante. El modelo base Qwen2.5-Coder-32B-Instruct fue entrenado por Alibaba con un corpus masivo de codigo y texto, pero esos detalles no se reproducen en esta ficha porque la model card de la variante no los documenta.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, heredada del modelo base Qwen2.5-Coder.
- Razonamiento sobre codigo: explicacion, refactorizacion, depuracion y generacion de tests.
- Generacion de texto conversacional y respuesta a instrucciones en formato chat.
- Soporte de tool calling y function calling (capacidad del modelo base Qwen2.5-Coder-Instruct).
- Razonamiento multi-paso y uso en pipelines de agentes (capacidad del modelo base).
- Capacidades matematicas y de razonamiento logico propias de la familia Qwen2.5.
- Comportamiento de rechazo reducido o eliminado respecto al modelo original (efecto de la abliteration).
- Capacidades multilingues: no documentadas en esta variante; el modelo base tiene soporte limitado fuera de ingles y chino.

## Casos de uso

- Investigacion sobre alineamiento y refusal: el modelo permite estudiar como la eliminacion de la direccion de rechazo afecta a la utilidad, la seguridad y la coherencia en tareas de codigo, comparandolo directamente con el Qwen2.5-Coder-32B-Instruct original.
- Generacion de codigo en entornos de investigacion controlados: se puede desplegar en un cluster interno para autocompletar y refactorizar codigo sin las negativas del modelo alineado, siempre que el uso cumpla la licencia Apache 2.0.
- Red teaming y evaluacion de seguridad: sirve como modelo de referencia "sin censura" para medir la eficacia de filtros externos, clasificadores de salida y guardrails en pipelines de produccion.
- Fine-tuning posterior: al estar en safetensors BF16 y con licencia Apache 2.0, se puede usar como punto de partida para ajustes especificos de dominio (por ejemplo, generacion de codigo para un lenguaje interno) sin las restricciones de rechazo del original.
- Analisis de sesgos y robustez: permite comparar la distribucion de respuestas del modelo abliterated frente al alineado en benchmarks de seguridad y utilidad.
- Despliegue local con cuantizacion Q8_0: la version GGUF permite ejecutar el modelo en estaciones de trabajo con suficiente VRAM o RAM para experimentacion offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 65,5 GB de pesos, por lo que se necesitan al menos 70-80 GB de VRAM para inferencia comoda con contexto moderado.
- VRAM estimada en Q8_0 (GGUF): aproximadamente 35 GB, viable en una GPU de 48 GB (A6000, L40S) o en configuracion multi-GPU.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200, o dos RTX 4090 (24 GB cada una) con tensor parallelism para BF16; una sola RTX 4090 no es suficiente para BF16 ni para Q8_0 completo.
- Cabe en consumer GPU: solo con cuantizaciones agresivas (Q4_K_M o inferiores, no publicadas en el repo) o mediante offloading a CPU/RAM.
- Opciones de despliegue: vLLM, TGI y SGLang para safetensors; llama.cpp y Ollama para la version GGUF Q8_0.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| 3MPER0RR/Qwen2.5-Coder-32B-Instruct-3MPER0RR-abliterated | 32,8 B | 128.000 | Apache 2.0 | safetensors, GGUF Q8_0 | Variante abliterated; sin benchmarks publicados |
| Qwen/Qwen2.5-Coder-32B-Instruct | 32,8 B | 128.000 | Apache 2.0 | safetensors, GGUF | Modelo base alineado; benchmarks publicados por Qwen |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14,7 B | 128.000 | Apache 2.0 | safetensors, GGUF | Alternativa de menor tamano, mas facil de desplegar |
| deepseek-ai/DeepSeek-Coder-V2-Instruct | 236 B (21 B activos, MoE) | 128.000 | DeepSeek License | safetensors | MoE de mayor capacidad; licencia no Apache |

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo, lo que puede producir contenido danino, sesgado o inapropiado sin filtros; no debe desplegarse en produccion orientada a usuarios finales sin guardrails externos.
- Riesgo de alucinacion en codigo: como cualquier modelo de la familia, puede generar APIs inexistentes, imports erroneos o logica incorrecta que compile pero falle en ejecucion.
- La model card no documenta el metodo de abliteration ni el dataset de calibracion, por lo que no se puede evaluar la degradacion de capacidades respecto al modelo base.
- No hay benchmarks publicados; el rendimiento real en tareas de codigo no esta verificado de forma independiente.
- Idiomas soportados no declarados; el modelo base tiene cobertura limitada fuera de ingles y chino, lo que afecta al castellano.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad legal del uso recae en el desplegador.
- El repo principal ocupa 65,5 GB; la descarga y el almacenamiento requieren planificacion.
- La fecha de creacion (2026-09-08) y actualizacion (2026-10-27) indican un modelo reciente con poca validacion comunitaria (0 likes, 1222 descargas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3MPER0RR/Qwen2.5-Coder-32B-Instruct-3MPER0RR-abliterated
- Version GGUF Q8_0: https://huggingface.co/3MPER0RR/Qwen2.5-Coder-32B-Instruct-3MPER0RR-abliterated-Q8_0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
