# leo20000306/cv801_models

## Resumen

CV801 Fine-Tuned Models es un repositorio público de Hugging Face que consolida cinco checkpoints entrenados en el marco de un proyecto denominado CV801. El autor, `leo20000306`, agrupa artefactos de detección de objetos y visión-lenguaje orientados al dominio agrícola: dos checkpoints completos de detección (YOLO26x y Grounding DINO Tiny), un checkpoint completo de un modelo de localización de 3B parámetros (LocateAnything de NVIDIA) y dos adaptadores LoRA sobre Qwen3.5-9B. El repositorio no contiene los pesos base originales de los modelos upstream; estos deben obtenerse de sus publicadores originales.

El interés del repositorio no reside en un modelo único, sino en la colección de artefactos afinados sobre un mismo dominio vertical (agricultura) con métricas de validación congeladas y manifiestos de integridad (`MANIFEST.sha256`). El tamaño total del repositorio es de 9,7 GB, coherente con la presencia de checkpoints completos de varios miles de millones de parámetros y de un detector de objetos de tamaño medio.

La información publicada es escasa: no se detallan composición del dataset, número de tokens de entrenamiento, hiperparámetros ni resultados de benchmarks comparativos. La licencia es heterogénea y el artefacto `locateanything-3b/` queda restringido, por la licencia NVIDIA del modelo base, a investigación y evaluación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección heterogénea: YOLO26x (detector CNN/transformer de Ultralytics), Grounding DINO Tiny (detector vision-language), LocateAnything-3B (modelo vision-language de localización), Qwen3.5-9B con adaptadores LoRA (LLM multimodal) |
| Parametros totales | No disponible de forma agregada; LocateAnything-3B: 3B; Qwen3.5-9B: 9B (base); YOLO26x y Grounding DINO Tiny: no disponibles |
| Parametros activos | No aplica (no se describe ningún artefacto MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | `other`; licencia heterogénea por artefacto. `locateanything-3b/` sujeto a NVIDIA License, restringido a investigación y evaluación no comercial |
| Formato de pesos | safetensors; adaptadores PEFT/LoRA para los artefactos `qwen35-t1-lora` y `qwen35-t2-lora`; checkpoints completos de Transformers para Grounding DINO Tiny y LocateAnything-3B; checkpoint `.pt` de Ultralytics para YOLO26x |

## Arquitectura y entrenamiento

El repositorio no documenta una arquitectura propia, sino cinco artefactos con arquitecturas de origen distintas. `yolo26x/` es un checkpoint completo afinado de YOLO26x de Ultralytics, un detector de objetos de una etapa. `grounding-dino-tiny/` es un checkpoint completo en formato Transformers derivado de `IDEA-Research/grounding-dino-tiny`, un detector abierto por texto (open-set) que combina un backbone de imagen con un encoder de texto para localizar objetos descritos mediante prompts lingüísticos. `locateanything-3b/` es un checkpoint completo afinado de `nvidia/LocateAnything-3B`, un modelo vision-language de 3B parámetros orientado a tareas de localización. Los directorios `qwen35-t1-lora/` y `qwen35-t2-lora/` contienen adaptadores PEFT/LoRA sobre `Qwen/Qwen3.5-9B`, presumiblemente dos variantes de ajuste (T1 y T2) del mismo modelo base.

No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del dataset agrícola, la presencia de RLHF/DPO ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). Cada directorio incluye, según la model card, su propio README, metadatos de entrenamiento y métricas de validación congeladas, pero esos contenidos no se han proporcionado. El repositorio de GitHub asociado contendría los comandos exactos de entrenamiento e inferencia.

## Capacidades

- Detección de objetos en imágenes mediante YOLO26x afinado para el dominio agrícola.
- Detección abierta por texto (open-vocabulary detection) con Grounding DINO Tiny, permitiendo localizar objetos descritos mediante prompts en lenguaje natural.
- Localización visual y razonamiento vision-language con LocateAnything-3B.
- Ajuste instructivo/multimodal sobre Qwen3.5-9B mediante dos adaptadores LoRA (T1 y T2), cuya diferencia funcional no se detalla en la información disponible.
- Métricas de validación congeladas y verificación de integridad mediante `MANIFEST.sha256` en cada directorio.
- Soporte de tool calling, agentes, multi-step reasoning, thinking mode, audio o capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Monitorización de cultivos con dron: el checkpoint `yolo26x/` puede desplegarse sobre imágenes aéreas para detectar plagas, malas hierbas o estados fenológicos, aprovechando que es un detector de una etapa con latencia baja en inferencia por lotes.
- Anotación asistida de datasets agrícolas: `grounding-dino-tiny/` permite generar cajas delimitadoras a partir de descripciones textuales ("hoja con manchas", "fruto maduro"), reduciendo el esfuerzo de etiquetado manual en nuevas clases.
- Localización guiada por lenguaje en inspección de field: `locateanything-3b/` puede emplearse para responder consultas de localización sobre imágenes agrícolas en un contexto de investigación, con la restricción de uso no comercial de su licencia.
- Evaluación comparativa de detectores: al reunir YOLO26x, Grounding DINO Tiny y LocateAnything-3B bajo un mismo dominio y métricas congeladas, el repositorio sirve como banco de pruebas para comparar detectores cerrados, abiertos y vision-language en la misma tarea.
- Asistente técnico agrónomo sobre Qwen3.5-9B: los adaptadores `qwen35-t1-lora/` y `qwen35-t2-lora/` pueden cargarse sobre el modelo base para respuestas especializadas en el dominio, siempre que se respete la licencia del modelo base de Qwen.
- Reproducibilidad de experimentos: los manifiestos SHA-256 y las métricas de validación congeladas permiten verificar que un checkpoint desplegado coincide exactamente con el artefacto evaluado, algo relevante en pipelines de MLOps con auditoría.
- Integración en pipelines de visión con Hugging Face Transformers: los checkpoints completos de Grounding DINO Tiny y LocateAnything-3B se cargan con la API estándar de Transformers, facilitando su incorporación a servicios de inferencia existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamaño de parámetros, LocateAnything-3B en fp16 requiere del orden de 6-8 GB solo para pesos, y Qwen3.5-9B con adaptadores LoRA en fp16 del orden de 18-20 GB, sin contar caché KV ni overhead de runtime. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, LocateAnything-3B y los adaptadores LoRA sobre Qwen3.5-9B encajan en GPUs de 24 GB (RTX 4090, A10G, L4 en cuantización) y en A100/H100 para servicio concurrente; YOLO26x y Grounding DINO Tiny pueden ejecutarse en GPUs consumer de gama media.
- Cabe en GPU consumer: probablemente sí para YOLO26x y Grounding DINO Tiny; para LocateAnything-3B y Qwen3.5-9B con LoRA, depende de la cuantización, que no está documentada.
- Opciones de despliegue: Hugging Face Transformers para Grounding DINO Tiny, LocateAnything-3B y los adaptadores PEFT; Ultralytics para YOLO26x. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CV801 (colección) | Heterogéneo (3B, 9B base, detectores) | No disponible | Detección y visión-lenguaje agrícola | `other`, heterogénea; LocateAnything-3B no comercial | Hugging Face, 0 descargas |
| Grounding DINO (original, IDEA-Research) | No disponible | No disponible | Detección abierta por texto | Apache 2.0 (upstream) | Hugging Face, ampliamente usado |
| YOLO26x (Ultralytics, original) | No disponible | No aplica | Detección de objetos | AGPL-3.0 / Enterprise (upstream) | Ultralytics |
| Qwen3.5-9B (original) | 9B | No disponible | LLM multimodal | Según términos de Qwen (upstream) | Hugging Face |

La comparativa se limita a los modelos upstream citados en la propia model card, ya que no se aportan datos de rendimiento que permitan comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia heterogénea: no existe una licencia única que cubra todos los artefactos; cada modelo upstream conserva sus términos originales y la disponibilidad pública no sustituye ni relaja esas condiciones.
- `locateanything-3b/` incorpora la NVIDIA License y queda restringido a investigación y evaluación no comercial; su uso en producción comercial requiere verificación legal adicional.
- Los pesos base de los modelos upstream no se incluyen en el repositorio; es necesario descargarlos por separado, lo que añade pasos y posibles desajustes de versión.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas.
- No se especifican el dataset de entrenamiento ni su procedencia, lo que dificulta evaluar la cobertura del dominio agrícola y el riesgo de sobreajuste.
- El repositorio tiene 0 descargas y 0 likes, sin comunidad de validación independiente; las métricas publicadas son únicamente las congeladas por el autor.
- No se documentan cuantizaciones ni formatos alternativos, lo que limita el despliegue en entornos con restricciones de memoria.
- El campo de idiomas aparece como no disponible, por lo que no puede garantizarse soporte multilingüe en los artefactos basados en Qwen3.5-9B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/leo20000306/cv801_models
- Modelo upstream YOLO26x (Ultralytics): no disponible en la información proporcionada
- Modelo upstream Grounding DINO Tiny: https://huggingface.co/IDEA-Research/grounding-dino-tiny
- Modelo upstream LocateAnything-3B: https://huggingface.co/nvidia/LocateAnything-3B
- Modelo upstream Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio GitHub con comandos de entrenamiento e inferencia: no disponible en la información proporcionada
