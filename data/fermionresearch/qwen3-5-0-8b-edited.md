# FermionResearch/Qwen3.5-0.8B-edited

## Resumen

Qwen3.5-0.8B-edited es un ajuste fino quirurgico del modelo multimodal Qwen/Qwen3.5-0.8B publicado por Fermion Research. No se trata de un reentrenamiento ni de un destilado: el autor ha modificado exactamente 2.048 pesos, correspondientes a las columnas de salida (353 y 803, 1.024 pesos cada una) de dos neuronas MLP de la capa 19 del bloque `model.language_model.layers.19.mlp.down_proj.weight`. El resto de pesos, la configuracion y el tokenizador son identicos al modelo base.

La relevancia del modelo es metodologica mas que de producto: demuestra que una edicion localizada de pesos, guiada por un agente de IA sobre el framework de edicion neuronal de Fermion Research, puede elevar la precision en MATH-500 del 6,5 % al 32,0 % sin tocar el resto de la red. Con 873.438.784 parametros totales y licencia Apache-2.0, el modelo conserva la pipeline `image-text-to-text` del base, por lo que mantiene capacidades de vision y lenguaje.

El interes practico esta en el binomio tamano-rendimiento: un modelo de menos de 1.000 millones de parametros con una mejora de 25,5 puntos porcentuales en razonamiento matematico, obtenida con un coste de edicion minimo (2.048 pesos de 873 millones, un 0,00023 % del total). Para investigadores en interpretabilidad y edicion de pesos, es un caso de estudio reproducible; para desarrolladores, es un modelo pequeno desplegable en hardware modesto con un salto cualitativo claro en tareas de matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; edicion en capa 19, `mlp.down_proj` |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.5-0.8B define la ventana; la evaluacion uso hasta 32.768 tokens nuevos de generacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; evaluado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer multimodal de la familia Qwen3.5 con pipeline `image-text-to-text`. La intervencion de Fermion Research no modifica la arquitectura ni el entrenamiento original: sustituye los valores de 2.048 pesos en las columnas 353 y 803 de la matriz `down_proj` de la capa 19 del modelo de lenguaje. Cada columna corresponde a la proyeccion de salida de una neurona MLP intermedia, de modo que la edicion altera la contribucion de esas dos neuronas al residual de la capa 19.

La edicion fue descubierta por un agente de IA sobre el framework de edicion neuronal de Fermion Research (aun no publicado como open source). No hay datos publicados sobre tokens de entrenamiento, composicion del dataset, RLHF ni DPO para este ajuste, porque no hubo entrenamiento: es una edicion de pesos post-hoc sobre el checkpoint base. La unica innovacion tecnica documentada es el propio metodo de edicion localizada y su efecto medido sobre MATH-500, con un protocolo de evaluacion explicito (thinking mode, prompt con sufijo de razonamiento paso a paso, temperatura 0.6, top_p 0.95, top_k 20, presence penalty 1.5, hasta 32.768 tokens nuevos, verificacion con math-verify).

## Capacidades

- Generacion de texto y razonamiento en modo thinking, usando la plantilla de chat del modelo base.
- Razonamiento matematico reforzado: MATH-500 pasa del 6,5 % al 32,0 % en el protocolo del autor.
- Capacidades multimodales de entrada imagen-texto heredadas del base (`image-text-to-text`).
- Generacion de codigo y matematicas: no hay evaluacion publicada especifica para este ajuste; se heredan las del base.
- Tool calling / function calling: no documentado en la informacion disponible; se hereda lo que soporte Qwen3.5-0.8B.
- Soporte de agentes y razonamiento multi-paso: el modo thinking con hasta 32.768 tokens nuevos permite cadenas de razonamiento largas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidad especial: edicion de pesos dirigida a reducir el fallo por limite de tokens (del 93,5 % de muestras del base al 36,3 % en este modelo).

## Casos de uso

- Evaluacion de metodos de edicion de pesos: sirve como referencia reproducible para comparar tecnicas de neuron editing; el autor cita como linea base el agente de edicion de MIT CSAIL (14,1 % a 25 pasadas y 48,1 % a 50 con una edicion de 131.072 pesos).
- Razonamiento matematico en entornos con recursos limitados: con menos de 1.000 millones de parametros y pesos en bf16, se puede servir en una unica GPU consumer para resolver problemas tipo MATH-500 con verificacion automatica de la respuesta final.
- Investigacion en interpretabilidad: permite estudiar como dos neuronas MLP de la capa 19 afectan al comportamiento de razonamiento, aislando el efecto de columnas concretas de `down_proj`.
- Generacion de soluciones paso a paso con thinking mode: util para pipelines que necesitan trazas de razonamiento largas (hasta 32.768 tokens nuevos) y extraccion de la respuesta final mediante `\boxed{}`.
- Prototipado de asistentes multimodales ligeros: al conservar la pipeline image-text-to-text, sirve para experimentar con entrada de imagen y texto en hardware de gama media.
- Docencia y divulgacion: caso concreto para explicar edicion de pesos, neuronas MLP y evaluacion con math-verify sin necesidad de infraestructura de entrenamiento.
- Base para experimentos de destilacion o merging: al ser un checkpoint transformers estandar con licencia Apache-2.0, se puede combinar o comparar con el base sin restricciones de licencia.

## Benchmarks y rendimiento

| Modelo | MATH-500 accuracy | Configuracion |
|---|---|---|
| Qwen/Qwen3.5-0.8B | 6,5 % | 500 problemas, 4 muestras por problema (2.000 muestras), thinking mode, bf16 |
| FermionResearch/Qwen3.5-0.8B-edited | 32,0 % | Mismo protocolo; edicion de 2.048 pesos |
| MIT CSAIL weight-editing agent (25 pasadas) | 14,1 % | Edicion de 131.072 pesos (referencia citada por el autor) |
| MIT CSAIL weight-editing agent (50 pasadas) | 48,1 % | Edicion de 131.072 pesos (referencia citada por el autor) |

Notas del protocolo: temperatura 0.6, top_p 0.95, top_k 20, presence penalty 1.5, hasta 32.768 tokens nuevos, verificacion con math-verify, las muestras que agotan el limite de tokens cuentan como incorrectas. El 93,5 % de los fallos del base y el 36,3 % de los fallos de este modelo se debieron al limite de tokens. Fue una unica ejecucion de test. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 873.438.784 parametros ocupan aproximadamente 1,75 GB solo en pesos; con cache KV y overhead de runtime, el consumo real sera mayor y depende de la longitud de contexto y del numero de tokens generados (hasta 32.768 en la evaluacion).
- GPU recomendadas: no hay recomendaciones oficiales del autor. Por tamano, cabe en GPUs consumer con 8 GB o mas de VRAM en bf16; una RTX 4090 (24 GB) deja margen amplio para contextos largos.
- Cabe en GPU consumer: si, en tarjetas con al menos 8 GB de VRAM para bf16; en cuantizaciones de 8 o 4 bits el requisito baja, aunque el autor no publica pesos cuantizados.
- Opciones de despliegue: transformers (libreria declarada); el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El coste dominante en la evaluacion fue la generacion de hasta 32.768 tokens nuevos en modo thinking.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FermionResearch/Qwen3.5-0.8B-edited | 873.438.784 | no disponible | 32,0 % | Apache-2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen3.5-0.8B | no disponible | no disponible | 6,5 % | Apache-2.0 | Hugging Face (modelo base) |
| MIT CSAIL weight-editing agent (referencia) | no disponible | no disponible | 14,1 % / 48,1 % | no disponible | no disponible |

La comparativa se limita a los datos publicados por el autor. No hay informacion sobre alternativas de terceros con el mismo tamano y tarea evaluadas bajo el mismo protocolo.

## Limitaciones y advertencias

- La mejora esta medida en un unico test run sobre MATH-500; no hay validacion cruzada ni evaluacion en otros conjuntos, por lo que la generalizacion del efecto es incierta.
- El 36,3 % de los fallos restantes se deben al limite de tokens: el modelo sigue gastando muchas muestras en cadenas de razonamiento que no terminan.
- La edicion se localiza en dos neuronas de la capa 19; no se documenta si afecta a otras capacidades (vision, codigo, multilingue) ni si introduce regresiones.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni comportamiento en idiomas distintos del usado en la evaluacion.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y su licencia (Qwen3.5-0.8B) siguen aplicando; conviene revisar los terminos del base.
- El framework de edicion neuronal de Fermion Research aun no es open source, lo que limita la reproducibilidad del metodo (no del checkpoint).
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion independiente por parte de la comunidad.
- Los pesos se publican en safetensors sin cuantizaciones oficiales; el despliegue en produccion requiere convertir a GGUF u otros formatos por cuenta del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FermionResearch/Qwen3.5-0.8B-edited
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Articulo de Fermion Research: https://fermionresearch.com/research/the-pirate-in-neuron-7601/
