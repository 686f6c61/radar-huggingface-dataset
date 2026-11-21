# postrational/Qwen3.8-27B-sft2

## Resumen

Qwen3.8-27B-sft2 es un ajuste fino supervisado (SFT) del modelo base unsloth/Qwen3.8-27B, publicado por el usuario postrational en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto, construido sobre la arquitectura qwen3_5 y con 27.781.427.952 parámetros totales (unos 27,8 mil millones) según los pesos en safetensors. La licencia declarada es Apache 2.0 y el idioma soportado indicado es únicamente inglés.

El modelo se ha entrenado con Unsloth y la librería TRL de Hugging Face, según indica la propia model card, lo que sugiere un pipeline de ajuste fino optimizado en memoria y velocidad (el autor afirma un entrenamiento 2x más rápido). No obstante, la información publicada es muy escasa: no se detallan el dataset de ajuste, el número de tokens de entrenamiento, la composición de los datos ni los hiperparámetros utilizados.

Su relevancia es limitada por el momento: el repositorio presenta 0 descargas y 0 likes, y la model card es prácticamente una plantilla autogenerada por Unsloth. Resulta útil como ejemplo de fine-tuning multimodal sobre la familia Qwen3.5, pero no debe considerarse un modelo listo para producción sin una evaluación adicional por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal, image-text-to-text) |
| Parámetros totales | 27.781.427.952 (~27,8 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; compatible con cuantización vía herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura qwen3_5, una familia de transformers multimodales de la serie Qwen, y se distribuye como un checkpoint de ajuste fino supervisado (SFT) sobre unsloth/Qwen3.8-27B. La pipeline declarada es image-text-to-text, lo que confirma que el modelo procesa imágenes junto con texto, aunque la model card no especifica la arquitectura del encoder visual ni la del decoder, ni el mecanismo de fusión multimodal empleado.

En cuanto al entrenamiento, la única información disponible es que se utilizó Unsloth junto con la librería TRL de Hugging Face, lo que apunta a un ajuste fino supervisado con optimizaciones de memoria (posiblemente LoRA/QLoRA o kernels optimizados). No se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se indica si el ajuste preserva íntegramente las capacidades del modelo base o si las altera.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.8-27B.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), con capacidad de responder a preguntas sobre imágenes.
- Generación de texto multimodal: descripción de imágenes, respuesta a consultas visuales y combinación de contexto visual y textual.
- Soporte de tool calling / function calling: no disponible en la información publicada (probablemente heredado del modelo base, pero no confirmado).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Descripción automática de imágenes en inglés: el modelo puede recibir una imagen y generar una descripción textual detallada, útil para pipelines de accesibilidad o catalogación de contenido visual.
- Respuesta a preguntas sobre documentos escaneados: al combinar entrada de imagen y texto, puede extraer información de capturas, formularios o diagramas y responder en lenguaje natural.
- Prototipado de asistentes multimodales: sirve como base para experimentar con interfaces conversacionales que reciben imágenes, dado su pipeline image-text-to-text y su licencia permisiva.
- Investigación en fine-tuning multimodal: al ser un SFT publicado abiertamente, es útil como referencia para estudiar cómo afecta el ajuste supervisado a un modelo base Qwen3.5 de ~27,8 B.
- Generación de texto asistida por contexto visual en entornos de investigación: por ejemplo, anotación semiautomática de datasets de imagen con descripciones en inglés.
- Evaluación comparativa de checkpoints SFT: permite contrastar el comportamiento del ajuste frente al modelo base unsloth/Qwen3.8-27B en tareas de visión-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 55,6 GB solo para los pesos (27,78 B × 2 bytes), más overhead de activaciones y del encoder visual; en la práctica se recomienda al menos 64-80 GB de VRAM.
- VRAM estimada con cuantización de 8 bits: en torno a 28 GB para los pesos.
- VRAM estimada con cuantización de 4 bits: en torno a 14-16 GB para los pesos, más overhead.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para inferencia en BF16; A100 40 GB o L40S 48 GB con cuantización de 8 bits; RTX 4090 24 GB o RTX 3090 24 GB solo con cuantización de 4 bits y contexto reducido.
- ¿Cabe en GPU de consumo? Sí, únicamente con cuantización agresiva (4 bits) en GPUs de 24 GB, con posibles limitaciones de contexto y calidad.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y herramientas compatibles con safetensors como vLLM; llama.cpp/Ollama requerirían conversión a GGUF, no confirmada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidad | Disponibilidad |
|---|---|---|---|---|---|
| postrational/Qwen3.8-27B-sft2 | ~27,8 B | no disponible | Apache 2.0 | image-text-to-text | Hugging Face (0 descargas) |
| unsloth/Qwen3.8-27B (base) | ~27,8 B (según el derivado) | no disponible | no disponible en la información | image-text-to-text | Hugging Face |
| Qwen2.5-VL-32B (referencia de la familia Qwen) | ~32 B | no disponible en esta ficha | Apache 2.0 (según familia Qwen) | image-text-to-text | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y modalidad.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está garantizado y probablemente degrade la calidad.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un SFT sobre un modelo base no auditado en esta ficha, pueden persistir sesgos del corpus original.
- Alucinación: sin benchmarks ni evaluación publicada, el riesgo de alucinación es desconocido y debe medirse antes de usar en producción.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base unsloth/Qwen3.8-27B mantenga la misma licencia y que no existan restricciones adicionales en la familia Qwen3.5.
- Falta de documentación: la model card no detalla dataset, hiperparámetros ni evaluación; no hay garantía de que el ajuste SFT no haya degradado capacidades del modelo base.
- Madurez: 0 descargas y 0 likes; sin validación por parte de la comunidad.
- Contexto: se desconoce la longitud máxima de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Producción: no se recomienda su despliegue sin una evaluación propia de calidad, latencia y robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/postrational/Qwen3.8-27B-sft2
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
