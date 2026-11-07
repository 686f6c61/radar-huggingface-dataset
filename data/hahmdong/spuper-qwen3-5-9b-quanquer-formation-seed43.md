# Hahmdong/SPUPER-qwen3.5-9b-quanquer-formation-seed43

## Resumen

SPUPER-qwen3.5-9b-quanquer-formation-seed43 es un ajuste fino (fine-tuning) supervisado del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario Hahmdong y publicado en Hugging Face. El entrenamiento se ha realizado con la librería TRL (versión 0.27.1) mediante SFT (Supervised Fine-Tuning), y el resultado es un modelo de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) con pesos en formato safetensors que ocupa 18,8 GB en el repositorio. La pipeline declarada es image-text-to-text, lo que indica que hereda capacidades multimodales del modelo base.

El modelo se presenta como una variante especializada dentro de una familia de ajustes denominada "SPUPER" y "quanquer", con un identificador de semilla (seed43) que sugiere experimentos reproducibles de entrenamiento. No se dispone de información pública sobre el conjunto de datos de entrenamiento, los idiomas soportados ni la licencia exacta, más allá de una etiqueta genérica "license" en la model card. El repositorio no registra descargas ni interacciones en el momento de la consulta, lo que indica que es un artefacto de investigación reciente y de baja difusión.

Su relevancia radica en ser un ejemplo de ajuste fino sobre la arquitectura Qwen3.5, una base multimodal de última generación, aplicado a un dominio no especificado ("quanquer-formation"). Para desarrolladores e investigadores resulta útil como referencia de reproducibilidad (semilla fija, versiones de framework documentadas) y como punto de partida para evaluar si el ajuste SFT aporta mejoras en tareas concretas frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-9B; detalles especificos no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (segun fuente secundaria sobre la familia quanquer; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF oficial) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card solo indica "license" sin especificar) |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-9B |
| Framework de entrenamiento | TRL 0.27.1, Transformers 5.9.0, PyTorch 2.11.0+cu129 |
| Tamano del repositorio | 18,8 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-9B, un transformer multimodal (pipeline image-text-to-text) del que no se detallan en la información disponible el número de capas, la dimensionalidad oculta ni el mecanismo de atención. El ajuste se ha realizado mediante Supervised Fine-Tuning (SFT) con TRL, sobre un conjunto de datos no especificado y con una semilla fija (seed43), lo que apunta a un experimento reproducible dentro de una serie de variantes ("quanquer-formation", "quanquer-add-quanter1", etc.).

No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO posteriores al SFT. Tampoco se describen innovaciones técnicas propias más allá del ajuste supervisado. Las versiones de framework (TRL 0.27.1, Transformers 5.9.0, PyTorch 2.11.0+cu129, Datasets 4.0.0, Tokenizers 0.22.2) sí están documentadas, lo que facilita la reproducibilidad del entorno de entrenamiento. El run de entrenamiento está registrado en Weights & Biases bajo el proyecto "SPUPER-SFT" de KAIST (Korea Advanced Institute of Science and Technology).

## Capacidades

- Generación de texto conversacional multi-turno, según el formato de chat empleado en el ejemplo de la model card.
- Procesamiento image-text-to-text: al heredar la pipeline multimodal del Qwen3.5-9B, se espera soporte de entrada de imágenes junto con texto (no verificado de forma independiente).
- Razonamiento y respuesta a preguntas abiertas, tal como ilustra el ejemplo de la model card (pregunta hipotética sobre viaje en el tiempo).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Evaluación de ajustes SFT sobre Qwen3.5: el modelo sirve como punto de comparación reproducible (semilla fija, versiones de framework documentadas) para medir el impacto del fine-tuning frente al Qwen3.5-9B original en una tarea concreta.
- Investigación en reproducibilidad de entrenamiento: al estar registrado el run en Weights & Biases y fijarse la semilla, permite replicar experimentos de SFT y analizar la varianza entre semillas dentro de la familia "quanquer".
- Generación de texto conversacional en prototipos: puede desplegarse con la pipeline de Transformers para asistentes de chat experimentales, aprovechando el formato de mensajes rol/contenido.
- Experimentos multimodales de laboratorio: si se confirma la herencia de la pipeline image-text-to-text, podría usarse para tareas de descripción de imágenes o VQA en entornos de investigación, aunque sin garantías de calidad por falta de benchmarks.
- Base para ajustes posteriores (DPO, RLHF): al ser un checkpoint SFT, es un punto de partida adecuado para pipelines de alineamiento adicional con TRL.
- Docencia y formación en fine-tuning: su tamaño de 9,4 mil millones de parámetros y su formato safetensors lo hacen manejable en infraestructura académica con GPUs de 80 GB para experimentos de ajuste supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 10-12 GB (estimación orientativa, no confirmada por el autor).
- VRAM estimada en cuantización de 4 bits: en torno a 6-8 GB (estimación orientativa; no hay GGUF oficial publicado).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para entrenamiento o inferencia en precisión completa; RTX 4090 (24 GB) para inferencia en bf16 ajustada; RTX 3090 (24 GB) como alternativa consumer.
- Cabe en GPU consumer de gama alta (RTX 4090, RTX 3090) en bf16 con gestión cuidadosa de memoria; en GPUs de 16 GB requeriría cuantización.
- Opciones de despliegue: Transformers (pipeline nativa), vLLM y TGI para servidores; llama.cpp/Ollama solo si se generan cuantizaciones GGUF propias, ya que no se publican oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SPUPER-qwen3.5-9b-quanquer-formation-seed43 | 9,4 B | 32.768 (no confirmado) | no disponible | Hugging Face, 0 descargas | Ajuste SFT de Qwen3.5-9B, multimodal |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible en esta ficha | según Qwen (no confirmada aquí) | Hugging Face, ampliamente disponible | Modelo original sin ajuste, referencia de comparación |
| Hahmdong/SPUPER-qwen3.5-9b-quanquer-add-quanter1 | ~9 B | 32.768 | no disponible | Hugging Face | Variante hermana de la misma familia de ajustes |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a parámetros, contexto y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste SFT mejore al modelo base en ninguna tarea; el rendimiento real es desconocido.
- Licencia no especificada: la model card solo incluye la etiqueta "license" sin texto, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue en producción.
- Idiomas no declarados: no se puede garantizar calidad en castellano ni en ningún otro idioma concreto.
- Riesgo de alucinación inherente a los modelos generativos de 9 B, agravado por la falta de evaluación.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Difusión mínima (0 descargas, 0 likes): no hay retroalimentación de la comunidad ni informes de errores.
- Contexto de 32.768 tokens no confirmado en la model card: procede de una fuente secundaria sobre la familia, por lo que debe verificarse con la configuración del tokenizador.
- Compatibilidad de despliegue limitada: sin cuantizaciones GGUF oficiales, el uso en hardware consumer exige convertir los pesos manualmente.
- El nombre del modelo sugiere un dominio específico ("quanquer-formation") no documentado; podría tener un ajuste excesivo hacia ese dominio y degradar capacidades generales.

## Enlaces

- Hugging Face: https://huggingface.co/Hahmdong/SPUPER-qwen3.5-9b-quanquer-formation-seed43
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante hermana: https://huggingface.co/Hahmdong/SPUPER-qwen3.5-9b-quanquer-add-quanter1
- Ficha en Featherless: https://featherless.ai/models/Hahmdong/SPUPER-qwen3.5-9b-quanquer-add-quanter1
- Run de entrenamiento en Weights & Biases: https://wandb.ai/dyhahm-Korea%20Advanced%20Institute%20of%20Science%20and%20Technology/SPUPER-SFT/runs/95xzczyu
- Repositorio TRL: https://github.com/huggingface/trl
