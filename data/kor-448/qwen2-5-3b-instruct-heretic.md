# kor-448/Qwen2.5-3B-Instruct-heretic

## Resumen

kor-448/Qwen2.5-3B-Instruct-heretic es una version "decensored" (abliterated) del modelo instructivo Qwen/Qwen2.5-3B-Instruct, publicada por el usuario kor-448. El modelo se ha generado con Heretic v1.4.0, una herramienta que elimina la direccion de rechazo del modelo mediante edicion directa de pesos, sin reentrenamiento ni fine-tuning adicional. El resultado es un modelo denso de 3.085.938.688 parametros (2,77 B sin embeddings) que mantiene la arquitectura y la plantilla de chat del original, pero que rechaza muy pocas peticiones: 5 de cada 100 en la evaluacion reportada, frente a 96 de cada 100 del modelo de referencia.

La relevancia de esta ficha es doble. Por un lado, es un caso de estudio reproducible: el repositorio incluye un directorio `reproduce` con los parametros exactos de abliteracion (indice de direccion 24.25, pesos maximos y minimos por capa para `attn.o_proj` y `mlp.down_proj`), lo que permite replicar el proceso y analizar su impacto. Por otro, es un modelo pequeno (3B) que cabe en GPU de consumo, lo que lo hace util para experimentacion local con contenido sin filtrar, red-teaming de sistemas de moderacion y prototipado offline.

La arquitectura heredada es un transformer decoder-only causal con RoPE, SwiGLU, RMSNorm, sesgo en las proyecciones QKV y word embeddings atados, con 36 capas y atencion GQA (16 cabezas de consulta y 2 de clave/valor). La longitud de contexto del modelo base es de 32.768 tokens, con generacion de hasta 8.192 tokens. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con RoPE, SwiGLU, RMSNorm, sesgo en QKV y word embeddings atados |
| Parametros totales | 3.085.938.688 (3,09 B); 2,77 B sin contar embeddings |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens; generacion de hasta 8.192 tokens |
| Tipos de cuantizacion | no disponible (el repositorio publica unicamente pesos safetensors sin cuantizar; no hay versiones GGUF, AWQ ni GPTQ del autor) |
| Idiomas soportados | `en` segun los metadatos del repositorio; el modelo base Qwen2.5-3B-Instruct declara soporte para mas de 29 idiomas |
| Licencia | `qwen-research` (license: other, license_name: qwen-research) |
| Formato de pesos | safetensors (libreria transformers) |
| Numero de capas | 36 |
| Cabezas de atencion (GQA) | 16 para Q, 2 para KV |
| Tamano del repositorio | 6,2 GB |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-3B-Instruct original: un transformer causal denso de 36 capas con normalizacion RMSNorm, activacion SwiGLU en el MLP, embeddings de palabra atados a la cabeza de salida y atencion con Grouped Query Attention (16 cabezas de consulta para 2 cabezas de clave/valor), lo que reduce el coste de la cache KV en inferencia. El modelo base fue entrenado por el equipo Qwen (Alibaba Cloud) en dos etapas declaradas, preentrenamiento y post-entrenamiento, con mejoras especificas en codigo, matematicas, seguimiento de instrucciones, generacion de JSON y comprension de datos estructurados. Los detalles de composicion del dataset de preentrenamiento, numero de tokens, y las tecnicas concretas de alineacion (RLHF, DPO) no se detallan en la informacion disponible para la variante de 3B.

La modificacion introducida por kor-448 no anade entrenamiento: Heretic v1.4.0 localiza la direccion de rechazo en el espacio de activaciones y ortogonaliza las matrices de pesos correspondientes. Los parametros reportados son direction_index 24.25, y por componente `attn.o_proj` (peso maximo 1.44 en la posicion 21.66, peso minimo 0.06 a distancia 13.88) y `mlp.down_proj` (peso maximo 0.86 en la posicion 21.42, peso minimo 0.60 a distancia 11.96). El impacto medido es una divergencia KL de 0.0418 respecto al modelo original (el conjunto de evaluacion no se especifica) y una caida de rechazos de 96/100 a 5/100.

## Capacidades

- Generacion de texto conversacional multi-turno, siguiendo instrucciones con system prompt y plantilla de chat propia de Qwen2.5.
- Generacion de codigo y resolucion de problemas matematicos, capacidades reforzadas en la familia Qwen2.5 respecto a Qwen2.
- Comprension y generacion de datos estructurados: tablas, JSON y salidas con formato controlado.
- Generacion de textos largos (mas de 8.000 tokens segun la documentacion del modelo base) y manejo de contexto de hasta 32.768 tokens.
- Capacidad multilingue heredada del modelo base (mas de 29 idiomas declarados por Qwen), aunque los metadatos de este repositorio solo declaran ingles y no se ha evaluado el efecto de la abliteracion por idioma.
- Ausencia practica de rechazos: 5/100 en la evaluacion reportada, lo que permite generar contenido que el modelo original bloquea.
- Sin capacidades de vision, audio ni modo de razonamiento explicito (no es un modelo tipo QwQ ni incluye "thinking mode").
- Function calling: la familia Qwen2.5-Instruct documenta soporte de tool calling mediante su plantilla de chat, pero esta variante no lo documenta ni lo ha evaluado; el soporte de agentes multi-paso no esta verificado.

## Casos de uso

- Escritura creativa sin filtros: narrativa de ficcion, guiones y roleplay con tematicas que los modelos alineados rechazan. El modelo genera texto largo (hasta 8.192 tokens de salida) manteniendo coherencia dentro de su ventana de contexto de 32.768 tokens.
- Red-teaming de sistemas de moderacion: generar conjuntos de prompts y respuestas adversarias a partir de los rechazos del modelo original (96/100) para probar clasificadores de contenido, filtros de API y guardrails antes de desplegarlos en produccion.
- Investigacion sobre alineacion y abliteration: al ser un proceso reproducible con Heretic v1.4.0 y parametros documentados, permite estudiar como varia la distribucion de salida (divergencia KL 0.0418) al eliminar la direccion de rechazo y comparar con otras tecnicas de edicion de pesos.
- Prototipado local en portatil: con 3,09 B de parametros y pesos safetensors de 6,2 GB, se puede ejecutar en una GPU de consumo con 8-12 GB de VRAM para iterar sobre prompts y plantillas de chat sin coste de API.
- Asistentes embebidos con requisito de privacidad: al ejecutarse integramente en local, es adecuado para aplicaciones donde las conversaciones no pueden salir del dispositivo (sanidad, legal interno, datos personales), siempre que el contenido generado se valide por otras vias.
- Preprocesado y anotacion de datos en investigacion: clasificacion, resumen y extraccion de campos en JSON sobre corpus propios mediante la plantilla de chat y `transformers` o vLLM, sin dependencia de servicios externos.
- Simulacion de personajes con system prompts: el modelo base mejora explicitamente la resiliencia a la diversidad de system prompts y el roleplay; combinado con la ausencia de rechazos, es util para construir personajes que no rompan el rol.
- Docencia sobre seguridad en LLM: demostrar en un aula o taller como una edicion de pesos de bajo coste modifica el comportamiento de rechazo, y que implicaciones tiene para el despliegue responsable de modelos abiertos.

## Benchmarks y rendimiento

El autor solo publica dos metricas, ambas comparativas contra el modelo original. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar en la informacion disponible.

| Metrica | Este modelo | Qwen/Qwen2.5-3B-Instruct |
|---|---|---|
| Divergencia KL | 0,0418 | 0 (por definicion) |
| Rechazos | 5/100 | 96/100 |

Notas: no se especifica el conjunto de datos empleado para medir la divergencia KL ni el conjunto de 100 peticiones usado para contar rechazos, por lo que los valores no son directamente comparables con otras publicaciones. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MT-Bench) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculos a partir de los 3,09 B de parametros; no son cifras publicadas por el autor):
  - bf16/fp16: ~6,2 GB solo de pesos; ~7,5-8 GB de VRAM total con contexto moderado (4K tokens) y overhead de runtime.
  - Contexto de 32.768 tokens: la cache KV de este modelo ocupa aproximadamente 36 KB por token (36 capas, 2 cabezas KV, head_dim 128, fp16), es decir, en torno a 1,2 GB adicionales por secuencia completa.
  - int8 (bitsandbytes): ~3,1 GB de pesos.
  - 4 bits (NF4, GPTQ o AWQ, requiriendo conversion propia): ~1,9-2,2 GB de pesos.
- GPU recomendadas:
  - fp16 completo: RTX 4090 (24 GB), A100 40/80 GB, H100, L40S.
  - fp16 con contexto largo: 16 GB o mas (RTX 4060 Ti 16 GB, RTX 4080, A10G).
  - Cuantizado a 4 bits: RTX 3060 12 GB, RTX 4060 8 GB, Tesla T4.
- Cabe en GPU de consumo: si. En fp16 en cualquier GPU con 8 GB o mas (RTX 3060 12 GB, RTX 3070, RTX 4060 Ti 16 GB); en cuantizacion de 4 bits en GPUs de 6-8 GB.
- Opciones de despliegue: `transformers` (requiere version 4.37.0 o superior, de lo contrario se produce `KeyError: 'qwen2'`), Text Generation Inference (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM (la arquitectura Qwen2 esta soportada), SGLang, y llama.cpp u Ollama previa conversion a GGUF con herramientas externas.
- Latencia y throughput: no disponible. No se publican mediciones propias; la documentacion de Qwen incluye un benchmark de velocidad generico para la familia, no especifico de esta variante.

## Comparativa con modelos similares

Los datos de la primera fila proceden de la informacion del repositorio; los de las alternativas provienen de la documentacion publica de cada desarrollador y no de una ejecucion de benchmarks propia.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| kor-448/Qwen2.5-3B-Instruct-heretic | 3,09 B | 32.768 tokens | qwen-research | Derivado abliterated con Heretic v1.4.0; 5/100 rechazos; KL 0,0418 |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | qwen-research | Modelo de referencia; 96/100 rechazos; misma arquitectura y plantilla de chat |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | Contexto mayor y ecosistema amplio; alineacion estricta, no existe variante abliterated del autor |
| microsoft/Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | Licencia permisiva y contexto largo; tamano ligeramente superior |
| google/gemma-2-2b-it | 2,6 B | 8.000 tokens | Gemma Terms of Use | Menor y mas rapido de ejecutar, pero con contexto mas corto y licencia con restricciones de uso |

Diferencias clave: frente al Qwen2.5-3B-Instruct original, esta variante sacrifica control de seguridad (y, segun la divergencia KL, algo de fidelidad distribucional) a cambio de eliminar casi por completo los rechazos. Frente a Llama-3.2-3B y Phi-3.5-mini, el contexto es cuatro veces menor, pero la licencia qwen-research es mas restrictiva que la de Phi-3.5-mini (MIT).

## Limitaciones y advertencias

- Seguridad: la abliteration elimina la direccion de rechazo de forma deliberada. El modelo puede generar contenido danino, ilegal, violento, sexual explicito o desinformativo con muy baja probabilidad de negarse. No debe exponerse directamente a usuarios finales sin moderacion externa.
- Sesgos: no se han publicado evaluaciones de sesgo para esta variante. El proceso de abliteration actua sobre el comportamiento de rechazo, no sobre los sesgos presentes en los datos de preentrenamiento, que se mantienen intactos.
- Alucinacion: no hay mediciones de tasa de alucinacion. Un modelo de 3B tiene una capacidad de conocimiento limitada, y la edicion de pesos puede alterar calibracion y confianza de forma no evaluada (la divergencia KL de 0.0418 indica un cambio real en la distribucion de salida).
- Contexto e idioma: los metadatos del repositorio solo declaran ingles, aunque el modelo base soporta mas de 29 idiomas. El rendimiento en idiomas distintos del ingles no se ha verificado tras la abliteration, y el contexto esta limitado a 32.768 tokens, inferior a los 128.000 de varios competidores de su tamano.
- Licencia: la licencia `qwen-research` restringe el uso comercial sin autorizacion expresa de Alibaba Cloud. Además, al tratarse de una modificacion del modelo base, se aplican los terminos de la licencia original sobre distribucion de derivados; conviene revisar el archivo LICENSE del repositorio de Qwen2.5-3B-Instruct antes de cualquier uso productivo.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, sin validacion independiente por parte de la comunidad. El autor no publica informacion sobre metodologia de evaluacion, conjuntos de datos usados para medir divergencia KL o rechazos, ni sobre el impacto de la abliteration en tareas concretas.
- Produccion: no se recomienda su uso en entornos regulados (sanidad, finanzas, atencion al cliente, educacion) ni en sistemas que actuen de forma autonoma, dado que la eliminacion de rechazos puede desactivar barreras de seguridad y que no existen evaluaciones de robustez ni de jailbreak.
- Reproducibilidad: el proceso es reproducible segun el autor mediante Heretic v1.4.0 y el directorio `reproduce`, pero la reproducibilidad depende de versiones concretas de la herramienta y del entorno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kor-448/Qwen2.5-3B-Instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Modelo original instructivo: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia qwen-research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Proyecto Heretic (herramienta de abliteration): https://heretic-project.org
- Instrucciones de reproduccion: directorio `reproduce/README.md` dentro del repositorio del modelo
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmark de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper de referencia (Qwen2 Technical Report): https://arxiv.org/abs/2407.10671
- Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los unicos resultados obtenidos corresponden a una empresa de servicios de salud sin relacion con el proyecto.
