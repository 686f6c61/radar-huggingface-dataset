# laskar-ks/alcyone-base-100m

## Resumen

alcyone-base-100m es un modelo de lenguaje de tipo decoder-only basado en la arquitectura GPT-2, desarrollado por el usuario laskar-ks y publicado en Hugging Face. Con 97.737.216 parámetros reales (cerca de 100 millones), se trata de un modelo de escala muy reducida, pensado como primera etapa de una cadena de tres fases de entrenamiento. La model card lo etiqueta explícitamente como "pretrained base model (stage 1 of 3)": continúa texto, pero no sigue instrucciones.

El modelo se generó con la librería `transformers` mediante `Trainer` (tag `generated_from_trainer`), y su model card es en gran medida la plantilla automática de Hugging Face, con secciones como "Model description" o "Training and evaluation data" marcadas como "More information needed". El autor remite a una versión posterior, alcyone-v1-dpo, para el modelo final afinado con DPO y orientado a seguir instrucciones.

Su relevancia es limitada desde el punto de vista de producción: es un experimento de entrenamiento a pequeña escala, útil para estudiar el pipeline de preentrenamiento y ajuste, para tareas de generación de texto muy acotadas o como base educativa. No compite con modelos de su categoría en benchmarks publicados, ya que no declara ninguno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (decoder-only transformer), según tag `gpt2` |
| Parametros totales | 97.737.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas como llama.cpp/GGUF, no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, tal como indica el tag `gpt2` del repositorio. Con aproximadamente 97,7 millones de parámetros, se sitúa en la escala de GPT-2 small (124M) o ligeramente por debajo. No se documenta la composición del dataset de entrenamiento: la model card indica "fine-tuned version of [] on an unknown dataset", sin especificar el modelo base ni los datos.

Los hiperparámetros de entrenamiento sí están disponibles: learning rate 0.0006, batch size 64 (train y eval), optimizador AdamW fused con betas (0.9, 0.95) y epsilon 1e-08, scheduler coseno con 282 pasos de warmup, semilla 42 y 2 épocas completas (28.236 pasos). La pérdida de validación final fue de 1.3108, partiendo de 2.0164 en el paso 1000, con una curva de descenso suave y sin signos de sobreajuste aparente en los registros. El entrenamiento se realizó con Transformers 5.19.0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se documenta RLHF, DPO ni ninguna innovación técnica adicional en esta etapa base.

## Capacidades

- Generación de texto autoregresiva: continuación de texto a partir de un prompt, propia de un modelo base sin ajuste instructivo.
- No sigue instrucciones: la propia model card advierte que es la etapa 1 de 3 y que no responde a comandos; para ello remite a alcyone-v1-dpo.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se declara idioma alguno).
- Sin capacidades de visión, audio ni modo "thinking".
- Compatible con text-generation-inference y endpoints, según los tags del repositorio.

## Casos de uso

- Estudio del pipeline de preentrenamiento: sirve como ejemplo reproducible de un entrenamiento GPT-2 a escala ~100M con hiperparámetros documentados, útil para docencia o para validar recetas de entrenamiento antes de escalar.
- Generación de texto creativo acotado: continuación de párrafos, completado de frases o generación de borradores cortos en un entorno controlado, aceptando que la coherencia será limitada por el tamaño del modelo.
- Baseline de comparación: referencia de pérdida de validación (1.3108) para experimentos propios con arquitecturas GPT-2 de tamaño similar.
- Prototipado rápido de infraestructura de inferencia: al ser un modelo de ~100M parámetros, permite probar pipelines de despliegue (TGI, endpoints, transformers) con requisitos de hardware mínimos antes de migrar a modelos mayores.
- Generación de datos sintéticos a pequeña escala: creación de textos de relleno o aumentación de datasets en dominios muy específicos, con revisión humana posterior.
- Investigación sobre sesgos y alucinación en modelos pequeños: útil para analizar cómo se manifiestan los fallos de un modelo base sin ajuste instructivo en contextos controlados.

## Benchmarks y rendimiento

La model-index del autor declara una entrada (`alcyone-base-97.7m`) con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento declarado es la pérdida de validación final de 1.3108 sobre el conjunto de evaluación del autor (composición no especificada).

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, ~390 MB para los pesos (97,7M × 4 bytes); en fp16/bf16, ~195 MB; en int8, ~98 MB. El overhead de activaciones y KV cache es mínimo para contextos cortos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o incluso una GPU integrada con suficiente memoria compartida pueden ejecutarlo. Para lotes grandes o baja latencia, una RTX 4090 o A100 está sobredimensionada.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650 (4 GB) o superiores.
- Opciones de despliegue: `transformers` (nativo), text-generation-inference (tag `text-generation-inference`), endpoints de Hugging Face (tag `endpoints_compatible`); conversión a GGUF para llama.cpp u Ollama es viable pero no está documentada por el autor.
- Latencia y throughput: no disponibles. Por tamaño, se espera un throughput muy alto en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| alcyone-base-100m | 97,7M | no disponible | no disponible | safetensors | Base sin ajuste instructivo, sin benchmarks |
| GPT-2 small (OpenAI) | 124M | 1024 tokens | MIT | safetensors, GGUF | Referencia de la arquitectura; ampliamente soportado |
| GPT-2 medium (OpenAI) | 355M | 1024 tokens | MIT | safetensors, GGUF | Mayor capacidad, misma familia |
| DistilGPT-2 (Hugging Face) | 82M | 1024 tokens | Apache 2.0 | safetensors, GGUF | Destilado de GPT-2, orientado a eficiencia |

La comparación se basa en la familia arquitectónica y el orden de magnitud; no hay datos de benchmarks de alcyone-base-100m que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No sigue instrucciones: es un modelo base; usarlo en un asistente conversacional producirá respuestas incoherentes con la tarea.
- Sesgos conocidos: no documentados por el autor; al desconocerse el dataset de entrenamiento, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Riesgo de alucinación: alto en cualquier tarea factual, agravado por el tamaño reducido y la ausencia de ajuste.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada; los idiomas soportados tampoco. No debe asumirse cobertura multilingüe.
- Licencia no disponible: la ausencia de licencia explícita impide asumir permisos de uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Model card incompleta: secciones clave ("Model description", "Intended uses & limitations", "Training and evaluation data") están sin completar, lo que dificulta la reproducibilidad y la evaluación de riesgos.
- Dataset desconocido: impide auditar la procedencia de los datos y posibles problemas de copyright o calidad.
- Para uso real se recomienda la versión alcyone-v1-dpo, según indica el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laskar-ks/alcyone-base-100m
- Versión afinada con DPO: https://huggingface.co/laskar-ks/alcyone-v1-dpo
- Perfil del autor: https://huggingface.co/laskar-ks
