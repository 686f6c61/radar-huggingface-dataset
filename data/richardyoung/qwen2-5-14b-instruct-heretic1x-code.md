# richardyoung/Qwen2.5-14B-Instruct-heretic1x-code

## Resumen

Qwen2.5-14B-Instruct-heretic1x-code es una variante "abliterada" (con el mecanismo de rechazo suprimido) del modelo Qwen2.5-14B-Instruct de Alibaba, publicada por el investigador Richard J. Young. El modelo se ha generado mediante Heretic 1.x (heretic-llm 1.4.0), una herramienta que aplica una edicion LoRA de rango 1 sobre las proyecciones `o_proj` y `down_proj` para reducir la tasa de rechazo ante peticiones consideradas dañinas, fusionando despues los pesos en bf16. La variante "code" usa una configuracion de prompts de abliteracion especifica para peticiones de programacion maliciosas frente a benignas.

El modelo hereda la arquitectura transformer densa de Qwen2.5-14B, con 14.770.033.664 parametros totales y una ventana de contexto de 32.768 tokens (segun la especificacion del modelo base). No es un asistente de proposito general: se publica explicitamente como material de investigacion sobre tecnicas de abliteracion y su evaluacion, acompañado del paper 30 del autor sobre la regla de seleccion en comparaciones de abliteracion.

Su relevancia es metodologica: documenta de forma trazable (hashes SHA-256 por tensor, trial seleccionado, divergencia KL, tasas de rechazo con intervalos de confianza) el proceso de abliteracion y su impacto en capacidades, algo poco habitual en las publicaciones de modelos abliterados de la comunidad. La reduccion de rechazo medida es modesta (75,0 % frente a 77,6 % del original con el juez WildGuard), y el autor advierte que la variacion entre busquedas es grande (desviacion tipica de ruido de semilla de unos 9 pp).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), derivado de Qwen2.5-14B-Instruct |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-14B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16; el modelo base admite cuantizaciones habituales como GPTQ, AWQ y GGUF, pero no se confirma para esta variante) |
| Idiomas soportados | en (ingles, declarado en la model card) |
| Licencia | Apache-2.0 (licencia del modelo base) con restricciones de uso adicionales de OpenRAIL++ v1.0; en caso de conflicto prevalece la licencia base |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B-Instruct: un transformer denso decoder-only con atencion por cabezas agrupadas (GQA), RoPE y las innovaciones de la familia Qwen2.5 (normalizacion RMSNorm, activacion SwiGLU, embeddings atados). Sobre ese modelo no se ha reentrenado nada: la modificacion consiste en una edicion LoRA de rango 1 aplicada a las proyecciones `o_proj` (salida de atencion) y `down_proj` (bloque MLP), fusionada posteriormente en los pesos bf16. Esta edicion busca desplazar las direcciones de activacion asociadas al comportamiento de rechazo.

El proceso de abliteracion se ejecuto con Heretic 1.x (heretic-llm 1.4.0, tag v1.4.0, commit `6ea3b8d`) en su configuracion "code", con 200 trials de Optuna. La regla de seleccion de Heretic 1.x escoge el trial con menos rechazos en el conjunto de desarrollo entre aquellos con divergencia KL de desarrollo <= 0,01. El trial seleccionado fue el #173, con 49/100 rechazos en desarrollo y KL de 0,0047 (conjunto de desarrollo: `configs/code_abliteration_data/malicious_code_eval.txt`). No hay datos publicados sobre volumen o composicion del dataset de entrenamiento del modelo base en la informacion proporcionada. Los pesos publicados son identicos bit a bit, tensor a tensor, a los evaluados en el paper, y se acompanan de `tensor_hashes.json` con el SHA-256 de cada tensor.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-14B-Instruct.
- Razonamiento, matematicas y codigo: el modelo base destaca en tareas de programacion y razonamiento; esta variante conserva esas capacidades con cambios medidos de -1,2 pp en HumanEval y +0,4 pp en MBPP.
- Seguimiento de instrucciones: evaluado con IFEval (-1,1 pp respecto al original).
- Reduccion del comportamiento de rechazo ante peticiones dañinas, objetivo principal de la abliteracion (75,0 % de rechazo frente a 77,6 % del original, juez WildGuard).
- Soporte de tool calling y function calling: no confirmado explicitamente para esta variante en la informacion proporcionada (el modelo base lo soporta).
- Capacidades de agente y razonamiento multi-paso: no confirmado para esta variante en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base Qwen2.5 es multilingue.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre abliteracion: el modelo sirve como punto de comparacion reproducible en estudios sobre tecnicas de supresion de rechazo, gracias a la publicacion de hashes por tensor, trial seleccionado y regla de seleccion declarada.
- Evaluacion de robustez de salvaguardas: permite medir con el juez WildGuard la tasa de rechazo residual y la tasa de sobre-rechazo en prompts benignos (3,7 %), como referencia para calibrar filtros de seguridad en produccion.
- Analisis del efecto de la regla de seleccion: util para replicar el hallazgo del paper de que el umbral de divergencia KL (0,01 frente a 0,1) altera drasticamente el rechazo residual (61,7 pp en Qwen2.5-32B).
- Estudio del impacto en capacidades: las variaciones por benchmark (MMLU-Pro -1,0 pp, GSM8K +2,2 pp, IFEval -1,1 pp, HumanEval -1,2 pp, MBPP +0,4 pp) permiten analizar el coste de la abliteracion en tareas concretas.
- Generacion de codigo en entornos controlados de investigacion: la variante "code" se entreno con prompts de programacion, por lo que es adecuada para estudiar el comportamiento del modelo en peticiones de codigo maliciosas frente a benignas.
- Reproducibilidad y auditoria de modelos: el repositorio incluye registros de ejecucion, etiquetas y codigo en GitHub (`ricyoung/abliteration-studies`), lo que facilita auditar el pipeline completo de generacion del modelo.
- Comparacion entre herramientas de abliteracion: el modelo forma parte de la evaluacion comparativa del paper 30 entre Heretic 1.x, Heretic 2.0, herramientas externas y publicaciones de la comunidad sobre Qwen2.5.

## Benchmarks y rendimiento

Datos del paper 30 sobre 972 prompts dañinos no usados durante la busqueda, con el juez WildGuard, y cinco benchmarks de capacidad (puntos porcentuales relativos al modelo original):

| Metrica | Este modelo | Original |
|---|---|---|
| Tasa de rechazo, juez WildGuard [IC 95 %] | 75,0 % [72,2 %, 77,6 %] | 77,6 % |
| Tasa de rechazo, marcadores por palabras clave | 73,6 % | 78,0 % |
| Sobre-rechazo en prompts benignos (WildGuard) | 3,7 % | 4,0 % |
| Cambio medio de capacidad | -0,15 pp | 0 |

| Benchmark | Cambio (pp) |
|---|---|
| MMLU-Pro | -1,0 |
| GSM8K | +2,2 |
| IFEval | -1,1 |
| HumanEval | -1,2 |
| MBPP | +0,4 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,6 GB solo para pesos (14.770.033.664 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica requiere GPUs de 40 GB o mas para contexto largo.
- GPU recomendadas para bf16: A100 40/80 GB, H100 80 GB, L40S 48 GB. No cabe en GPUs de consumo de 24 GB en bf16.
- Cuantizacion: con cuantizacion de 8 bits cabria en GPUs de 24 GB (RTX 3090/4090) y con 4 bits en GPUs de 16 GB, aunque no se confirma en la informacion proporcionada que existan artefactos GGUF/GPTQ/AWQ publicados para esta variante.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en Hugging Face). El soporte de vLLM, llama.cpp u Ollama no se confirma en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo (WildGuard) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-14B-Instruct-heretic1x-code | 14,77 B | 32.768 | 75,0 % | Apache-2.0 + OpenRAIL++ | Hugging Face |
| Qwen2.5-14B-Instruct (original) | 14,77 B | 32.768 | 77,6 % | Apache-2.0 | Hugging Face |
| Heretic 2.0 sobre Qwen2.5 | no disponible | no disponible | evaluado en el paper 30, cifra no disponible en la informacion proporcionada | no disponible | no disponible |
| Herramientas externas de abliteracion sobre Qwen2.5 | no disponible | no disponible | evaluadas en el paper 30, cifras no disponibles en la informacion proporcionada | no disponible | no disponible |

## Limitaciones y advertencias

- El rechazo se reduce, no se elimina: el modelo sigue produciendo contenido dañino y no incorpora ajuste de seguridad adicional.
- No es un asistente de proposito general: el autor lo publica exclusivamente para investigacion sobre abliteracion y su evaluacion.
- Alta variabilidad entre busquedas: la desviacion tipica de ruido de semilla es de unos 9 pp, por lo que las diferencias entre modelos individuales no deben sobreinterpretarse.
- La regla de seleccion condiciona los resultados: comparar solo con una regla de seleccion y una divergencia realizada declaradas.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; el modelo base Qwen2.5-14B-Instruct presenta alucinaciones documentadas en la literatura general.
- Idiomas: la model card declara solo ingles, aunque el modelo base es multilingue; el comportamiento en otros idiomas no esta evaluado.
- Licencia: Apache-2.0 con restricciones de uso de OpenRAIL++ v1.0; prohibido su despliegue para los usos prohibidos de dicha licencia, y en caso de conflicto prevalece la licencia base.
- Uso comercial: permitido por Apache-2.0, pero sujeto a las restricciones de OpenRAIL++; revisar `LICENSE_OpenRAIL++.md` antes de cualquier despliegue en produccion.
- Sin datos de benchmarks propios mas alla de los cinco reportados; no hay evaluaciones independientes de la comunidad (0 descargas y 0 likes en el momento de la consulta).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-14B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/main/LICENSE
- Codigo, registros de ejecucion y etiquetas: GitHub `ricyoung/abliteration-studies`
- Paper 30 (referencia del autor, enlace arXiv pendiente de publicacion): no disponible
- Heretic (herramienta de abliteracion, heretic-llm 1.4.0, tag v1.4.0, commit `6ea3b8d`): no disponible en la informacion proporcionada
