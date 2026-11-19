# phuctahong/nanogpt-gpt-mha-falcon-1-scaled-parallel-ctxeta-ctxlambda-triton-379m-job13885163-step100000

## Resumen

El modelo `nanogpt-gpt-mha-falcon-1-scaled-parallel-ctxeta-ctxlambda-triton-379m-job13885163-step100000` es un checkpoint de investigación publicado por el usuario de Hugging Face `phuctahong`, fruto de un entrenamiento con NanoGPT Pro sobre el dataset FineWeb-Edu. Se trata de un transformer decoder-only de tipo GPT con atención multi-cabeza (MHA) estándar, aunque el nombre del checkpoint indica que se han incorporado variantes experimentales de atención tipo Falcon y mecanismos de escalado paralelo con parámetros `ctxeta` y `ctxlambda` implementados con kernels Triton. El modelo tiene 379.359.616 parámetros reales según los pesos en safetensors y se distribuye bajo licencia Apache 2.0.

No es un modelo pensado para producción ni para uso general: es un artefacto de un experimento de entrenamiento (job `13885163`, step `100000`) subido desde un directorio de scratch. No hay model card descriptiva, no se publican resultados de benchmarks, no se declaran idiomas soportados ni se especifica la longitud de contexto efectiva. Su interés es fundamentalmente el de reproducibilidad de experimentos de arquitectura y de recetas de entrenamiento a escala de ~379M de parámetros sobre FineWeb-Edu.

La relevancia actual es limitada fuera del ámbito de investigación en arquitecturas eficientes: sirve como referencia para comparar variantes de atención (MHA clásica frente a Falcon modificada), para estudiar el efecto de los parámetros de escalado `ctxeta`/`ctxlambda` y para validar implementaciones Triton de atención en modelos de tamaño medio entrenados sobre un corpus educativo filtrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT con atención multi-cabeza (MHA) y variante Falcon; kernels Triton para atención con escalado paralelo (`ctxeta`, `ctxlambda`) |
| Parametros totales | 379.359.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión original) |
| Idiomas soportados | no disponible (entrenado sobre FineWeb-Edu, corpus predominantemente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `generation_config.json` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención multi-cabeza estándar y una variante etiquetada como "falcon" en el nombre del checkpoint, lo que sugiere modificaciones en el bloque de atención respecto a un GPT vanilla. El sufijo `gpt-mha-falcon-1-scaled-parallel-ctxeta-ctxlambda-triton` indica que se han introducido parámetros de escalado (`ctxeta`, `ctxlambda`) aplicados en paralelo sobre la atención, con kernels implementados en Triton. No se detalla en la información disponible la naturaleza exacta de estos parámetros ni su formulación matemática.

El entrenamiento se realizó con NanoGPT Pro sobre FineWeb-Edu, con un presupuesto declarado de 100B de tokens en el nombre del directorio (`D_fineweb-edu100B`) y un consumo efectivo de 49,15B de tokens (`T_49.15B`), optimizador AdamW con learning rate 0.001, y checkpoint en el step 100.000. No se especifica si hubo fases de RLHF, DPO o ajuste fino supervisado; el pipeline parece ser exclusivamente de preentrenamiento sobre texto. Tampoco se documentan la composición exacta del dataset, el tokenizador empleado ni la estrategia de decodificación especulativa u otras innovaciones de inferencia.

## Capacidades

- Generación de texto autoregresiva propia de un modelo GPT de ~379M de parámetros.
- Razonamiento básico y respuesta a instrucciones limitada al preentrenamiento (no se declara ajuste por instrucciones).
- Capacidad multilingüe no documentada; el corpus FineWeb-Edu es mayoritariamente inglés, por lo que el rendimiento en castellano es previsiblemente bajo.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara modo "thinking", visión, audio ni otras modalidades.
- No se declara una longitud de contexto efectiva; debe inferirse del `config.json` del repositorio.

## Casos de uso

- Reproducción de experimentos de arquitectura: el checkpoint permite comparar la variante Falcon con escalado `ctxeta`/`ctxlambda` frente a un GPT-MHA equivalente entrenado con la misma receta sobre FineWeb-Edu, aislando el efecto de la modificación de atención.
- Investigación en kernels Triton: sirve como caso de prueba para validar implementaciones de atención en Triton y medir su corrección numérica y su rendimiento frente a implementaciones en PyTorch nativo.
- Estudio de recetas de entrenamiento a escala media: con 379M de parámetros y 49,15B de tokens vistos, es un punto de referencia útil para analizar curvas de pérdida y eficiencia de cómputo en regímenes de un solo nodo o pocos nodos.
- Generación de texto de dominio educativo: dado el entrenamiento sobre FineWeb-Edu, puede emplearse para generar borradores de material didáctico o explicaciones técnicas en inglés, siempre con revisión humana.
- Fine-tuning supervisado para tareas concretas: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado como base para experimentos de ajuste fino en clasificación de texto, resumen o extracción de información en inglés.
- Evaluación de sesgos y alucinación en modelos pequeños: su tamaño y su origen controlado lo hacen útil como sujeto de estudio en trabajos sobre fidelidad factual y sesgos en modelos de menos de 500M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~1,5 GB de pesos, más activaciones y caché KV; en la práctica, menos de 4 GB para contextos moderados.
- VRAM estimada en fp16/bf16: ~0,8 GB de pesos; cabe holgadamente en cualquier GPU consumer con 8 GB o más.
- VRAM estimada en cuantización de 8 bits: ~0,4 GB de pesos; en 4 bits, ~0,2 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: RTX 3060/4060, RTX 4090, A100, H100; el modelo es lo bastante pequeño como para ejecutarse en CPU con llama.cpp si se convierte a GGUF, aunque no se distribuye en ese formato.
- Cabe en GPU consumer: sí, en cualquier GPU con 6-8 GB de VRAM o más, incluso en fp32.
- Opciones de despliegue: PyTorch con `transformers` o `AutoModelForCausalLM` (formato safetensors), vLLM y TGI para serving, llama.cpp/Ollama tras conversión a GGUF. No se proporcionan scripts de conversión ni plantillas de chat.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (nanogpt-gpt-mha-falcon-1-scaled-parallel-ctxeta-ctxlambda-triton-379m) | 379M | no disponible | Apache 2.0 | Hugging Face, solo pesos safetensors | Checkpoint de investigación, sin benchmarks ni model card descriptiva |
| GPT-2 medium (OpenAI) | 355M | 1.024 tokens | MIT | Hugging Face, ampliamente disponible | Referencia clásica de tamaño similar; contexto corto y sin variantes de atención experimentales |
| Pythia-410M (EleutherAI) | 410M | 2.048 tokens | Apache 2.0 | Hugging Face, con checkpoints intermedios | Suite de investigación con curvas de entrenamiento publicadas y benchmarks sistemáticos |
| Falcon-rw-1B (TII) | 1.000M | 2.048 tokens | Apache 2.0 | Hugging Face | Mayor tamaño y atención Falcon madura, pero no directamente comparable en cómputo |

La comparación es aproximada: no hay datos de rendimiento publicados para este checkpoint, por lo que la comparativa se limita a parámetros, contexto declarado y licencia.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad ni fidelidad factual; se desconoce el comportamiento del modelo en estos ejes.
- Riesgo de alucinación alto, propio de un modelo de 379M de parámetros preentrenado sin ajuste por instrucciones ni RLHF.
- Longitud de contexto no documentada; debe consultarse el `config.json` del repositorio antes de asumir una ventana concreta.
- Idiomas soportados no declarados; el entrenamiento sobre FineWeb-Edu hace previsible un rendimiento muy limitado en castellano.
- La licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin garantías, no se recomienda su despliegue en producción sin una evaluación previa exhaustiva.
- No incluye tokenizador, scripts de conversión, plantilla de chat ni pipeline declarado en Hugging Face; el pipeline aparece como "no disponible".
- El nombre del checkpoint sugiere parámetros de escalado (`ctxeta`, `ctxlambda`) cuya formulación exacta no está documentada, lo que dificulta la reproducibilidad sin acceso al código de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/phuctahong/nanogpt-gpt-mha-falcon-1-scaled-parallel-ctxeta-ctxlambda-triton-379m-job13885163-step100000
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
