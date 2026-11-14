# Hooshaai/llava-qwen-0.5b-delta-product-attention-scienceqa

## Resumen
Este checkpoint es un derivado quirúrgico del modelo vision-language LLaVA-Qwen-0.5B, desarrollado por el usuario Hooshaai dentro del ecosistema NeuralOps. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` y sustituye las capas de atencion quadratica de 18 de sus 24 capas del decoder por un operador lineal-gated denominado DeltaProductAttention, basado en reflexiones ortogonales de Householder acumuladas a lo largo de la secuencia. El objetivo no es superar al modelo base, sino servir como artefacto de investigacion sobre "attention surgery" y destilacion de conocimiento en modelos multimodales pequenos.

El modelo resuelve el problema de experimentar con variantes de atencion eficientes en entornos de recursos limitados: el artefacto serializado de pesos ocupa 180,83 MB (frente a 1,66 GB del base en FP16), lo que supone un 89,4 % menos de almacenamiento. La evaluacion se realiza sobre el subconjunto con imagen de ScienceQA en validation, con una precision declarada del 35,62 % frente al 63,75 % del modelo profesor.

Es relevante ahora porque forma parte de una "Attention Zoo" (coleccion de operadores de atencion alternativos) y porque demuestra un flujo de destilacion offline con cache de representaciones que requiere 0 MB de VRAM del profesor en GPU, entrenando en una RTX 3090 en 120,4 segundos. Es, por tanto, un banco de pruebas, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower congelado + proyector MLP de 2 capas + decoder Qwen2 de 24 capas con atencion hibrida 3:1) |
| Parametros totales | no disponible (modelo base de 0,5B; el artefacto delta ocupa 180,83 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos serializados en FP16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, pesos delta quirurgicos) |
| Dimension del decoder | D=1024, H=16 cabezas, head_dim=64 |
| Capas modificadas | 18 de 24 (esquema hybrid_3_1); anclas quadraticas en [3, 7, 11, 15, 19, 23] |
| Componentes congelados | vision_tower SigLIP (27 capas), multi_modal_projector, MLPs y embeddings del decoder |
| Libreria | neuralops |

## Arquitectura y entrenamiento
La arquitectura base es LLaVA-Interleave con Qwen2 como decoder: un vision tower SigLIP congelado, un proyector MLP de 2 capas que alinea las representaciones visuales con el espacio del lenguaje, y un decoder transformer de 24 capas con dimension 1024 y 16 cabezas de atencion. Sobre esta base, la "cirugia" reemplaza la atencion quadratica en 18 de las 24 capas por DeltaProductAttention, un operador de la familia gated implementado en `neuralops/layers/gated/flagship_fla.py`. Este operador modela el estado mediante reflexiones ortogonales de Householder acumuladas a lo largo de la secuencia, lo que garantiza isometria estricta, espectro acotado y preservacion de norma. Se mantienen seis capas con atencion quadratica como anclas (indices 3, 7, 11, 15, 19 y 23), configurando un patron hibrido 3:1.

El entrenamiento consiste en destilacion de conocimiento desde el modelo base congelado, usando la arquitectura de cache offline de representaciones de NeuralOps (seccion 21.1), que evita mantener al profesor en VRAM durante el entrenamiento. Se ejecutaron 82 pasos de optimizacion (26 en stage 1 y 56 en stage 2) en 120,4 segundos sobre una RTX 3090, con un pico de 16.645 MB de VRAM. Solo se entrenaron las capas de atencion modificadas y los layernorms del decoder; el vision tower, el proyector, los MLPs y los embeddings permanecieron congelados. No se especifica el volumen de tokens de entrenamiento ni la composicion del dataset mas alla de ScienceQA.

## Capacidades
- Generacion de texto e imagen-texto: responde a preguntas sobre imagenes en formato conversacional image-text-to-text.
- Razonamiento visual sobre contenido STEM: entrenado y evaluado sobre ScienceQA, que cubre preguntas de ciencia, tecnologia, ingenieria y matematicas con imagen.
- Conversacion multimodal multi-turno: hereda la plantilla de chat de LLaVA-Interleave, con tokens de imagen intercalados en el texto.
- Comprension de diagramas y figuras cientificas: el vision tower SigLIP procesa la imagen y el proyector la alinea con el decoder.
- Capacidad multilingue limitada: solo ingles declarado.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking.
- No se documenta vision de video, audio ni otras modalidades.

## Casos de uso
- Investigacion sobre atencion eficiente: el checkpoint permite comparar empiricamente DeltaProductAttention frente a atencion quadratica en un VLM pequeno, sirviendo de referencia reproducible para estudiar isometria y preservacion de norma en capas lineales.
- Banco de pruebas para destilacion offline: el flujo con cache de representaciones (0 MB de VRAM del profesor) es reutilizable para destilar otros operadores de la Attention Zoo sin necesidad de GPU de gran capacidad.
- Experimentos academicos sobre ScienceQA: el modelo es util como linea base de ablacion en el subconjunto con imagen de ScienceQA, con metrica de accuracy y perplexity documentadas y reproducibles en hardware consumer.
- Desarrollo de operadores de atencion en NeuralOps: sirve como artefacto de referencia para validar la integracion de `delta_product_attention` en el registro de capas y el serializador de pesos delta.
- Prototipado de asistentes educativos de bajo coste: con 180,83 MB de pesos delta, puede desplegarse en entornos con almacenamiento muy limitado para experimentar con tutoria STEM basada en imagenes, aunque con precision reducida.
- Auditoria de artefactos y compresion: el manifiesto quirurgico (`surgical_manifest.json`) y el audit de ficheros permiten estudiar tecnicas de compresion selectiva de pesos en VLMs.
- Estudio de sesgos y alucinacion en VLMs pequenos: la perplexity elevada (1.823.153,49) lo convierte en un caso extremo util para analizar degradacion de calibracion tras cirugia de atencion.

## Benchmarks y rendimiento

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (Image-Bearing STEM Subset, validation) | 63,75 | 35,62 | 35,62 | +0,00 |
| Perplexity en ScienceQA (Image-Bearing STEM Subset, validation) | 2,45 | 1.823.153,49 | 1.823.153,49 | +0,00 |

Los resultados estan declarados por el autor en el model-index y no estan verificados (`verified: false`). La destilacion no mejoro ninguna de las dos metricas respecto al estado pre-KD, y la perplexity final es varios ordenes de magnitud superior a la del profesor, lo que indica una degradacion severa de la calibracion de probabilidades.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento consumio 16.645 MB de pico en una RTX 3090 (24 GB), pero la inferencia del checkpoint delta requeriria cargar tambien el modelo base para reconstruir los pesos completos.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (24 GB) es la unica GPU documentada, usada para el entrenamiento.
- Cabe en GPU consumer: si, segun la evidencia del entrenamiento en RTX 3090; no se documentan pruebas en GPUs de menor VRAM.
- Opciones de despliegue: la libreria NeuralOps mediante `neuralops.hub.load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; solo se reporta un tiempo de entrenamiento de 120,4 segundos para 82 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/llava-qwen-0.5b-delta-product-attention-scienceqa | 0,5B (base) | no disponible | 35,62 % accuracy | MIT | Hugging Face (45 descargas) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5B | no disponible | 63,75 % accuracy (segun el autor) | no disponible en la informacion | Hugging Face |
| Otras variantes de la Attention Zoo de NeuralOps | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo profesor, ya que la informacion proporcionada no incluye datos de otros VLMs pequenos como alternativas externas. El checkpoint delta es 9,41 veces mas pequeno en disco que el base (180,83 MB frente a 1,66 GB), pero rinde 28,13 puntos porcentuales menos en accuracy y presenta una perplexity desproporcionada.

## Limitaciones y advertencias
- Precision muy baja: 35,62 % en ScienceQA frente al 63,75 % del profesor, una caida de 28,13 puntos porcentuales.
- Perplexity extrema: 1.823.153,49 frente a 2,45 del profesor, lo que sugiere probabilidades mal calibradas y alta propension a respuestas incoherentes.
- La destilacion no aporto mejoria: delta de +0,00 tanto en accuracy como en perplexity entre pre-KD y post-KD.
- Solo ingles: no hay soporte multilingue declarado.
- Solo modalidad imagen-texto: no se documenta video, audio ni otras entradas.
- Pesos delta, no completos: el artefacto de 180,83 MB contiene unicamente las capas modificadas y los layernorms entrenados; requiere el modelo base para funcionar.
- Dependencia de la libreria NeuralOps: no se documenta compatibilidad con ecosistemas estandar de inferencia (vLLM, llama.cpp, TGI), lo que limita el despliegue en produccion.
- Resultados no verificados: las metricas del model-index tienen `verified: false` y provienen del propio autor.
- Sesgos: no documentados; al derivar de Qwen2 y ScienceQA, hereda los sesgos de ambos, pero no hay analisis publicado.
- Licencia MIT: permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales no detalladas en la informacion disponible.
- No apto para produccion: por precision, perplexity y dependencia de libreria, debe tratarse como artefacto de investigacion.

## Enlaces
- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-delta-product-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/flagship_fla.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
