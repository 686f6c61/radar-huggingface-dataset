# Oti228/numbat

## Resumen

`numbat` es, según la model card publicada en HuggingFace por el usuario Oti228, un checkpoint intermedio de preentrenamiento de un supuesto modelo de escala Mythos de Anthropic, extraído en el paso 1.830.000 de una ejecución de aproximadamente 1,96 millones de pasos. El autor lo presenta como el modelo cuyo nombre en clave aparece mencionado en una filtración del código fuente de Claude Code (marzo de 2026). La información procede exclusivamente de la model card y de los metadatos del repositorio; no hay verificación independiente disponible.

La arquitectura descrita combina capas híbridas de Gated DeltaNet (GDN) y Multi-head Latent Attention (MLA), capas feed-forward con mezcla de expertos (MoE) de 1.224 expertos con top-48 más un experto compartido, y una capa de Multi-Token Prediction (MTP) para decodificación especulativa. El checkpoint está cuantizado en NVFP4 (formato de 4 bits con bloques de escala E4M3 y payload E2M1) y se distribuye en 772 shards safetensors que suman aproximadamente 7,72 TB.

El dato de parámetros totales declarado en los metadatos de safetensors es de 6.849.377.242.584 (unos 6,85 billones), mientras que la model card afirma "~14T param". Esa discrepancia no está resuelta en la información disponible. El modelo no tiene post-entrenamiento ni RLHF: es un checkpoint de preentrenamiento crudo y, por tanto, no es apto para uso en producción como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido GDN (Gated DeltaNet) + MLA (Multi-head Latent Attention) con capas MoE y cabeza MTP |
| Parametros totales | 6.849.377.242.584 según metadatos de safetensors; la model card afirma "~14T" (discrepancia no resuelta) |
| Parametros activos | no disponible (MoE con 1.224 expertos, top-48 + 1 compartido; no se indica el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, escala E4M3 por bloques, payload E2M1, redondeo RTNE); tag `8-bit` en HuggingFace |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (772 shards, ~7,72 TB, menos de 10,6 GB por archivo); incluye `configuration_numbat.py` y `modeling_numbat.py` con `custom_code` |
| Capas | 114 |
| Tokenizador | BPE a nivel de byte, 131.072 tokens |
| Paso de entrenamiento | 1.830.000 de ~1.960.000 |
| Tamano del repo | 7.720,6 GB |

## Arquitectura y entrenamiento

La arquitectura descrita es un stack híbrido que alterna capas de Gated DeltaNet, un mecanismo de atención lineal con estado recurrente, y capas de Multi-head Latent Attention, la atención con compresión de KV típica de la familia DeepSeek. Las capas feed-forward son de mezcla de expertos con 1.224 expertos, enrutamiento top-48 más un experto compartido siempre activo, lo que implica un ratio de activación bajo pero un número de parámetros totales muy elevado. Se añade una capa de Multi-Token Prediction que el código de referencia expone mediante `NumbatForCausalLM.draft`, pensada para decodificación especulativa.

El checkpoint corresponde al paso 1.830.000 de un entrenamiento de unos 1,96 millones de pasos. No se especifica en la información disponible el número de tokens vistos, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones; la model card indica explícitamente que no hay post-entrenamiento. Los pesos publicados son una copia de evaluación cuantizada a NVFP4; según el autor, los pesos BF16 originales y el estado del optimizador permanecen en el clúster de entrenamiento. El código de referencia (`configuration_numbat.py`, `modeling_numbat.py`) declara cargar el checkpoint completo con `load_state_dict(strict=True)` y permite `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`.

## Capacidades

- Generación de texto autoregresiva mediante `NumbatForCausalLM.forward`, con implementación de referencia completa en el repositorio.
- Decodificación especulativa a través de la capa MTP expuesta en `NumbatForCausalLM.draft`.
- Razonamiento y conocimiento general: no verificables, al tratarse de un checkpoint de preentrenamiento sin post-entrenamiento.
- Tool calling / function calling: no disponible; no hay evidencia de que el checkpoint lo soporte sin ajuste posterior.
- Soporte de agentes y razonamiento multi-paso: no disponible por la misma razón.
- Capacidades multilingües: no disponibles; el tokenizador es BPE a nivel de byte con 131.072 tokens, pero no se documentan idiomas.
- Modo thinking, visión o audio: no disponible.
- Ejecución de la arquitectura completa en un solo dispositivo mediante el runtime de referencia incluido.

## Casos de uso

- Investigación sobre arquitecturas híbridas GDN/MLA: el código de referencia y los 772 shards permiten estudiar cómo se combinan atención lineal con estado y atención latente en un modelo de gran escala, comparando el comportamiento de cada tipo de capa.
- Estudio de mezcla de expertos a gran escala: con 1.224 expertos y top-48 más uno compartido, el checkpoint sirve para analizar patrones de enrutamiento, balance de carga entre expertos y especialización de los mismos en un régimen de entrenamiento real.
- Investigación en cuantización NVFP4: los bloques de escala E4M3 con payload E2M1 y redondeo RTNE permiten validar implementaciones de decodificación de 4 bits, comprobar límites de underflow de escalas y verificar el round-trip exacto de cada cuádruple NVFP4.
- Evaluación de decodificación especulativa con MTP: la capa `draft` permite medir tasas de aceptación y ganancia de throughput frente a decodificación autoregresiva estándar en un modelo de este tamaño.
- Reproducción de infraestructura de inferencia distribuida: los 7,72 TB de pesos obligan a diseñar sharding, pipeline parallelism y almacenamiento de alto rendimiento, lo que convierte al checkpoint en una carga de trabajo realista para probar stacks de serving.
- Estudio de checkpoints intermedios de preentrenamiento: al estar en el paso 1.830.000 de 1.960.000, permite analizar la evolución de la calidad del modelo en la fase final del preentrenamiento y comparar con checkpoints anteriores o posteriores si estuvieran disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `ckpt_metadata.json` contiene la salida del arnés de evaluación, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~7,72 TB de pesos en NVFP4, se necesita del orden de 7,7 TB de memoria de acelerador solo para los pesos, más overhead de activaciones, cachés KV y buffers. No cabe en ninguna GPU consumer ni en un nodo único convencional.
- GPU recomendadas: el autor menciona que las evaluaciones se ejecutaron en "una porción de Trainium2s" y que hacen falta "unos 85 de ellos solo para sostener estos pesos". Para GPUs, se requeriría un clúster multi-nodo con aceleradores de memoria alta (H100, H200, B200 o equivalentes); no se especifica una configuración concreta.
- GPU consumer: no cabe en ninguna RTX 4090, 5090 ni similar, ni siquiera con cuantización adicional, dado el tamaño del checkpoint.
- Opciones de despliegue: el repositorio incluye un runtime de referencia de un solo dispositivo (`modeling_numbat.py`) y se puede cargar con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor menciona que el runtime interno es "Neuron-parallel" y que el port incluido consume los mismos tensores, pero no se publican cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría, y las características declaradas (escala, combinación GDN/MLA/MoE, NVFP4, origen no verificado) no permiten establecer una comparación fiable con alternativas públicas.

## Limitaciones y advertencias

- Checkpoint de preentrenamiento sin post-entrenamiento: no ha pasado por RLHF, DPO ni ajuste por instrucciones, por lo que su salida es texto de continuación crudo y no es apto como asistente en producción.
- Procedencia no verificada: la afirmación de que es un checkpoint de Anthropic se basa en la model card y en una supuesta filtración; no hay confirmación independiente en la información disponible.
- Discrepancia de parámetros: los metadatos de safetensors indican 6,85 billones de parámetros, mientras que la model card afirma "~14T"; esta contradicción no está resuelta.
- Licencia no disponible: no se especifican términos de uso, lo que impide determinar si el uso comercial está permitido. Dado el origen declarado, existen riesgos legales y de propiedad intelectual significativos.
- Riesgo de alucinación: no evaluado; al ser un modelo sin post-entrenamiento, la fiabilidad factual no está medida.
- Limitaciones de contexto e idioma: no documentadas; se desconoce la longitud de contexto efectiva y los idiomas cubiertos.
- Requisitos de hardware extremos: ~7,72 TB de pesos en NVFP4 hacen inviable el despliegue fuera de infraestructura de clúster.
- Código de referencia con `trust_remote_code=True`: la carga implica ejecutar código Python del repositorio, lo que requiere revisión de seguridad previa.
- Fecha de creación del repositorio posterior a la fecha actual de referencia de esta ficha (2026-11-01), lo que añade incertidumbre sobre la vigencia y el estado del contenido.

## Enlaces

- HuggingFace: https://huggingface.co/Oti228/numbat
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
