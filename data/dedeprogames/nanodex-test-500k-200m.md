# DedeProGames/NanoDex-Test-500K-200M

## Resumen

NanoDex-Test-500K-200M es un modelo de lenguaje decoder-only de escala nano, con 492.192 parametros, entrenado desde cero (pre-trained from scratch) por el usuario DedeProGames sobre el dataset fineweb-edu. A pesar de la denominacion "200M" en el nombre, el recuento real de parametros confirmado en los archivos safetensors es de 492.192, por lo que se trata de un artefacto de investigacion de tamano muy reducido y no de un modelo de 200 millones de parametros. El entrenamiento se realizo con la herramienta NanoDex Trainer, un Space de Hugging Face pensado para hacer visible y reproducible el proceso de preentrenamiento de un transformer.

El modelo emplea una arquitectura estandar LlamaForCausalLM adaptada a un presupuesto de parametros minimo: tamano oculto de 96, 3 capas, atencion con consultas agrupadas (6 cabezas de atencion y 2 de clave/valor), FFN de 256 y una longitud de contexto de 512 tokens. Fue entrenado durante 1.525 pasos sobre 199.884.800 tokens, con una perdida final de 3,8176 (perplejidad 45,5) y un tiempo de pared de apenas 5,2 minutos.

Su relevancia no reside en capacidades de asistente, sino en su valor didactico y de investigacion: permite observar de principio a fin el ciclo completo de preentrenamiento de un transformer (tokenizacion BPE propia, optimizacion, schedule de learning rate) en un recurso que cabe en cualquier equipo. El propio autor advierte que, con este presupuesto de parametros y tokens, el modelo apenas aprende formas de palabras y colocaciones comunes, sin producir salidas factibles ni utiles como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM); MLP con SiLU, RMSNorm, embeddings posicionales rotatorios (RoPE), atencion con consultas agrupadas (GQA), embeddings atados, sin sesgos |
| Parametros totales | 492.192 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; el repo solo contiene pesos safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | ODC-BY (Open Data Commons Attribution License) |
| Formato de pesos | safetensors (libreria transformers) |

Otras especificaciones de arquitectura declaradas por el autor: tamano oculto 96, 3 capas, 6 cabezas de atencion (2 de clave/valor), tamano de FFN 256 y vocabulario de 2.048 tokens con BPE propio entrenado sobre fineweb-edu.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estandar de tipo LlamaForCausalLM, reducido en anchura y profundidad para ajustarse a un presupuesto de parametros muy bajo. Incorpora las mismas decisiones de diseno que la familia Llama a escala: normalizacion RMSNorm, MLP con activacion SiLU, embeddings posicionales rotatorios (RoPE), atencion con consultas agrupadas (6 cabezas de consulta frente a 2 de clave/valor), embeddings de entrada y salida atados y ausencia de terminos de sesgo. El tokenizador es un BPE personalizado de 2.048 entradas entrenado especificamente sobre fineweb-edu.

El entrenamiento se realizo desde cero sobre el dataset HuggingFaceFW/fineweb-edu durante 1.525 pasos, con 131.072 tokens por paso, lo que suma 199.884.800 tokens vistos. Se uso el optimizador AdamW con betas (0,9, 0,95), weight decay de 0,1 y recorte de gradiente de 1,0. El schedule de learning rate combina un calentamiento del 2% de los pasos con un decaimiento coseno hasta el 10% del valor pico, que fue de 4e-03. La perdida final registrada es de 3,8176 (perplejidad 45,5) y el entrenamiento completo duro 5,2 minutos. No se documenta ninguna fase de ajuste fino por instrucciones, RLHF ni DPO; se trata exclusivamente de un modelo preentrenado.

## Capacidades

- Generacion de texto autoregresivo basico, limitado a continuaciones cortas de texto en ingles.
- Reconocimiento de formas de palabras, colocaciones frecuentes y algo de sintaxis superficial, segun la propia model card.
- Modelado de lenguaje con una longitud de contexto de 512 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Cobertura multilingue limitada al ingles (idioma declarado en la model card y en los metadatos).
- No dispone de modo de razonamiento (thinking mode), vision ni audio.
- Su tokenizador BPE propio de 2.048 entradas es un componente reutilizable para experimentos de tokenizacion.

## Casos de uso

- Docencia y aprendizaje: sirve para mostrar de forma tangible el ciclo completo de preentrenamiento de un transformer (tokenizacion, forward pass, calculo de perdida, optimizacion), ya que su entrenamiento completo dura 5,2 minutos y es replicable con el NanoDex Trainer.
- Pruebas de infraestructura de inferencia: al ocupar menos de 2 MB en fp32, permite validar pipelines de carga de modelos, tokenizacion y generacion en entornos de CI/CD sin consumir recursos de GPU relevantes.
- Pruebas de humo (smoke tests) en produccion: se puede usar como modelo "canario" para verificar que una integracion con transformers, text-generation-inference o endpoints funciona de extremo a extremo antes de desplegar modelos mayores.
- Investigacion sobre dinamica de entrenamiento: al tener un numero de pasos y tokens acotado y una perdida final documentada, permite estudiar el efecto de cambios en el schedule de learning rate, el optimizador o el vocabulario sobre una linea base reproducible.
- Experimentos de tokenizacion: su BPE personalizado de 2.048 tokens entrenado sobre fineweb-edu permite comparar estrategias de vocabulario reducido y medir su impacto en la perplejidad.
- Demostraciones educativas interactivas: se puede integrar en un Space o Notebook para ilustrar, en tiempo real, como un modelo genera texto token a token y por que sus salidas no son factuales.
- Referencia para comparaciones a escala minima: util como punto de partida para medir mejoras relativas al aumentar capas, cabezas o ventana de contexto en experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida final de entrenamiento (3,8176, equivalente a una perplejidad de 45,5) sobre el propio dataset de preentrenamiento. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y no se deben inferir a partir de esa perdida.

| Metrica | Valor | Contexto |
|---|---|---|
| Perdida final de entrenamiento | 3,8176 | Sobre fineweb-edu, tras 1.525 pasos |
| Perplejidad final | 45,5 | Derivada de la perdida final |
| Tokens vistos | 199.884.800 | Presupuesto total de entrenamiento |
| Tiempo de entrenamiento | 5,2 minutos | Tiempo de pared |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 MB en fp32 (492.192 parametros x 4 bytes) y en torno a 1 MB en fp16 o bf16. Es despreciable frente a cualquier modelo convencional.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU, en GPUs integradas y en cualquier GPU de consumo (por ejemplo, series GTX, RTX o equivalentes), aunque no las aproveche de forma significativa.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta text-generation-inference) y endpoints compatibles (etiqueta endpoints_compatible). No se documenta un GGUF publicado, por lo que su uso en llama.cpp u Ollama requeriria una conversion previa.
- Latencia y throughput: no se documentan valores medidos. Dado el tamano, la generacion sera practicamente instantanea en cualquier hardware moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos verificados sobre modelos comparables en la informacion proporcionada (parametros, contexto, rendimiento y licencia de alternativas a escala nano), por lo que la comparativa cuantitativa se marca como no disponible. Cualitativamente, este modelo pertenece a la categoria de transformers didacticos de escala nano (estilo nanoGPT y similares) entrenados desde cero con presupuestos de tokens de unos cientos de millones, un segmento en el que el criterio de comparacion habitual es la reproducibilidad del entrenamiento mas que el rendimiento en tareas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NanoDex-Test-500K-200M | 492.192 | 512 | ODC-BY | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor lo describe como un artefacto de investigacion a escala nano: con este numero de parametros y de tokens, el modelo solo aprende formas de palabras, colocaciones comunes y algo de sintaxis.
- No es un asistente util y sus salidas no son factuales; no debe emplearse para responder preguntas ni para generar informacion que requiera veracidad.
- Alto riesgo de alucinacion y de generacion de texto incoherente, dado el presupuesto de entrenamiento y la perplejidad final elevada (45,5).
- Longitud de contexto muy limitada (512 tokens), insuficiente para conversaciones multi-turno o documentos largos.
- Cobertura exclusivamente en ingles; no se declara soporte de castellano ni de otros idiomas.
- Licencia ODC-BY: permite uso comercial con atribucion, pero se trata de una licencia pensada para datos, por lo que conviene revisar su aplicabilidad al modelo y cumplir los requisitos de atribucion.
- El nombre del modelo incluye "200M", lo que puede inducir a confusion: el recuento real de parametros es de 492.192.
- Sin benchmarks publicados ni validacion externa; cualquier evaluacion de calidad debe realizarse por cuenta propia.
- Adopcion practicamente nula en el momento de la ficha (0 descargas, 1 me gusta), lo que implica ausencia de comunidad, soporte y casos de uso contrastados.
- No se documentan versiones cuantizadas, adaptadores ni ajuste por instrucciones, por lo que no es apto para tareas de instruccion o dialogo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DedeProGames/NanoDex-Test-500K-200M
- Dataset de entrenamiento (fineweb-edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- NanoDex Trainer (Space): https://huggingface.co/spaces/hugging-science/nanodex-trainer
- Perfil del autor: https://huggingface.co/DedeProGames

Nota: el resto de resultados de la busqueda web proporcionada (foros y sitios no relacionados) no contiene informacion relevante sobre el modelo y se ha descartado.
