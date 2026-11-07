# razz-123/pneumoniamnist-vit-base-finetuned-14

## Resumen

El modelo `razz-123/pneumoniamnist-vit-base-finetuned-14` es un ajuste fino (fine-tuning) del checkpoint `google/vit-base-patch16-224-in21k` realizado por el usuario razz-123 sobre el subconjunto PneumoniaMNIST del dataset MedMNIST v2. Se trata, por tanto, de un clasificador de imágenes médicas de dominio muy concreto: radiografías de tórax en resolución reducida (28x28 píxeles en su origen MedMNIST) reescaladas al tamaño de entrada del ViT base (224x224). El objetivo es la clasificación binaria entre pulmón sano y neumonía.

El modelo se publica como adaptador PEFT (probablemente LoRA, dado que la librería declarada es `peft` y el repositorio ocupa 0.0 GB), lo que implica que no contiene los pesos completos del ViT sino únicamente los del adaptador entrenado. Esto condiciona su uso: para inferencia es necesario cargar el modelo base `google/vit-base-patch16-224-in21k` y superponer el adaptador. La licencia es Apache 2.0.

La relevancia de esta ficha es limitada pero útil como referencia: se trata de un modelo de investigación de autor individual, sin descargas ni likes, sin benchmarks publicados y con una model card auto-generada por el Trainer de Hugging Face. Los resultados declarados en evaluación (accuracy 0.9359, F1 0.9295) son razonables para la tarea, pero deben interpretarse con cautela dado el contexto y el tamaño del conjunto de evaluación de PneumoniaMNIST.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolución 224) con adaptador PEFT |
| Parámetros totales | No disponible (el repositorio contiene solo el adaptador; el modelo base ViT-Base tiene ~86M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantización | No disponible (no se documentan versiones GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | No disponible (modelo de clasificación de imagen, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors/PyTorch |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Vision Transformer estándar, concretamente `google/vit-base-patch16-224-in21k`: 12 capas de transformer, dimensión oculta 768, 12 cabezas de atención, parches de 16x16 y resolución de entrada 224x224, preentrenado en ImageNet-21k. Sobre esta base se ha aplicado un ajuste fino con PEFT 0.11.1, lo que típicamente implica LoRA u otra técnica de adaptación de bajo rango, aunque la model card no especifica la configuración exacta del adaptador (rango, alpha, módulos objetivo).

El entrenamiento se realizó sobre el dataset `medmnist-v2`, concretamente el subconjunto PneumoniaMNIST (clasificación binaria de radiografías de tórax). Los hiperparámetros declarados son: learning rate 0.005, batch size de entrenamiento 16 con acumulación de gradientes de 4 (batch efectivo 64), optimizador Adam (betas 0.9/0.999, epsilon 1e-8), scheduler lineal, 10 épocas, semilla 42 y precisión mixta nativa (AMP). No se documenta el número de tokens ni la composición exacta del dataset más allá de la referencia a MedMNIST v2, ni si hubo técnicas de aumento de datos o balanceo de clases.

## Capacidades

- Clasificación binaria de imágenes de radiografía de tórax (sano vs. neumonía) a partir de entradas de 224x224 píxeles.
- Extracción de características visuales genéricas heredadas del preentrenamiento en ImageNet-21k del ViT base.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión general más allá de la clasificación entrenada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo thinking, audio ni otras modalidades.

## Casos de uso

- Prototipado de clasificación de neumonía en investigación académica: el modelo sirve como línea base rápida para experimentos sobre PneumoniaMNIST, permitiendo comparar técnicas de adaptación PEFT frente a fine-tuning completo del ViT.
- Docencia y demostraciones de fine-tuning con PEFT: al ser un adaptador pequeño sobre un modelo público, es útil para ilustrar el flujo `PeftModel.from_pretrained` + `ViTForImageClassification` en cursos y tutoriales.
- Evaluación de pipelines de clasificación médica de bajo coste: por su tamaño reducido (adaptador de pocos MB) y su licencia Apache 2.0, puede integrarse en prototipos de triaje experimental siempre que se valide clínicamente antes de cualquier uso real.
- Benchmarking de técnicas de aumento de datos en imágenes médicas de baja resolución: permite medir cómo afectan distintas transformaciones al rendimiento de un ViT adaptado sobre MedMNIST.
- Comparación de arquitecturas en MedMNIST: sirve como punto de referencia ViT frente a alternativas como Swin (por ejemplo, `selmamalak/pneumoniamnist-swin-base-finetuned`) en el mismo subconjunto.
- Generación de embeddings de radiografías para análisis exploratorio: las representaciones del ViT adaptado pueden emplearse para agrupar o visualizar imágenes del dataset en estudios preliminares.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (model-index sin entradas adicionales; los datos provienen de la tabla de entrenamiento de la model card):

| Métrica | Valor final (época 9.90) |
|---|---|
| Loss | 0.1773 |
| Accuracy | 0.9359 |
| Precision | 0.9474 |
| Recall | 0.9179 |
| F1 | 0.9295 |

Mejor checkpoint intermedio observado durante el entrenamiento (época 6.99): accuracy 0.9637, precision 0.9448, recall 0.9635, F1 0.9536. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base ViT-Base (~86M parámetros) en FP32 requiere aproximadamente 350 MB; en FP16 unos 175 MB. El adaptador PEFT añade un consumo marginal (decenas de MB como máximo).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se ha entrenado con PyTorch 2.3.0 + CUDA 12.1, por lo que es compatible con A100, H100, RTX 4090, RTX 3090, RTX 2080 y GPUs de gama media.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, GTX 1660 con 6 GB o más).
- Opciones de despliegue: `transformers` + `peft` (flujo nativo), exportación a ONNX o TorchScript para serving, o integración en FastAPI/TorchServe. No se documentan versiones para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imagen de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada; para un ViT-Base a 224x224 se espera un throughput del orden de cientos a miles de imágenes por segundo en GPU moderna, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| razz-123/pneumoniamnist-vit-base-finetuned-14 | ViT-Base + PEFT | Adaptador sobre ~86M | 224x224 imagen | Apache 2.0 | Hugging Face (0 descargas) |
| selmamalak/pneumoniamnist-swin-base-finetuned | Swin-Base + fine-tuning | ~88M (Swin-Base) | 224x224 imagen | No disponible en la información | Hugging Face |
| google/vit-base-patch16-224-in21k | ViT-Base | ~86M | 224x224 imagen | Apache 2.0 | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin validación clínica: no debe usarse para diagnóstico médico real bajo ninguna circunstancia.
- La model card está auto-generada y contiene secciones "More information needed"; no hay documentación sobre sesgos, composición del dataset ni metodología de evaluación.
- El conjunto PneumoniaMNIST es de baja resolución (28x28 reescalado a 224x224), lo que limita la fidelidad de las características visuales frente a radiografías de resolución completa.
- Riesgo de sobreajuste al dominio y al dataset concreto; el rendimiento en imágenes de otras fuentes o equipos no está evaluado.
- El repositorio contiene solo el adaptador PEFT: es imprescindible cargar el modelo base `google/vit-base-patch16-224-in21k` para poder usarlo, lo que añade una dependencia externa.
- Sin descargas ni validación por la comunidad (0 descargas, 0 likes), lo que reduce la confianza en la reproducibilidad.
- La licencia Apache 2.0 permite uso comercial del adaptador, pero el uso clínico requeriría certificaciones regulatorias adicionales que este modelo no posee.
- No hay información sobre el desbalanceo de clases del dataset ni sobre métricas por clase, relevantes en tareas médicas donde los falsos negativos tienen coste elevado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/razz-123/pneumoniamnist-vit-base-finetuned-14
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Modelo comparable (Swin): https://huggingface.co/selmamalak/pneumoniamnist-swin-base-finetuned
- Otro modelo del mismo autor: https://huggingface.co/razz-123/KBidu_14B_Fixed
- Dataset MedMNIST v2: https://medmnist.com/
