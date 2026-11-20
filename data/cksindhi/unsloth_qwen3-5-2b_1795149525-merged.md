# cksindhi/unsloth_Qwen3.5-2B_1795149525-merged

## Resumen

`cksindhi/unsloth_Qwen3.5-2B_1795149525-merged` es un ajuste fino (fine-tuning) de 16 bits en FP16 del modelo base `unsloth/Qwen3.5-2B`, publicado por el usuario cksindhi. Se trata de un modelo derivado de la familia Qwen3.5, orientado a generación de texto e imagen-a-texto (pipeline `image-text-to-text`), con 2.274.069.824 parámetros totales según los pesos en safetensors y un tamaño de repositorio de 4,6 GB. La licencia declarada es Apache 2.0.

El modelo se ha entrenado, según la model card, con Unsloth y la librería TRL de Hugging Face, lo que el autor describe como un entrenamiento "2x más rápido". No se especifican en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni el método exacto de ajuste (SFT, DPO, RLHF, etc.). El único idioma declarado es el inglés.

Su relevancia es limitada: es un artefacto de fine-tuning de un modelo base de 2B parámetros, sin descargas ni likes en el momento de la consulta, y sin benchmarks publicados. Resulta útil como ejemplo de pipeline de fine-tuning con Unsloth sobre Qwen3.5, pero no como modelo de referencia para producción sin una evaluación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer; detalles internos no disponibles) |
| Parámetros totales | 2.274.069.824 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP16 de 16 bits) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base `unsloth/Qwen3.5-2B`, que pertenece a la arquitectura Qwen3.5 (transformer). No se dispone de información sobre el número de capas, dimensión oculta, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del base, aunque la model card no detalla la torre visual ni el proyector.

El entrenamiento se realizó con Unsloth y TRL, según la model card, y se publica el resultado fusionado ("merged") en FP16. No se especifican el dataset, el número de tokens de entrenamiento, la composición de los datos, ni si hubo etapas de RLHF o DPO. Tampoco se documentan hiperparámetros, epochs ni método de fusión de adaptadores.

## Capacidades

- Generación de texto conversacional en inglés, según el tag `conversational`.
- Entrada imagen-texto a texto (pipeline `image-text-to-text`), presumiblemente heredada del base Qwen3.5-2B.
- Compatibilidad con `text-generation-inference` y `transformers`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede usarse para generar respuestas multi-turno en entornos de desarrollo, aprovechando su tamaño de 2B parámetros para iterar rápido en local.
- Experimentación con fine-tuning sobre Qwen3.5: sirve como referencia de un pipeline Unsloth + TRL para reproducir ajustes finos sobre el base de 2B.
- Tareas de imagen-a-texto en inglés: al declarar el pipeline `image-text-to-text`, puede emplearse para descripción de imágenes o respuesta a preguntas visuales, siempre que se valide su calidad real.
- Integración en pipelines de TGI: al ser compatible con `text-generation-inference`, puede desplegarse en un endpoint de inferencia para pruebas internas.
- Evaluación comparativa de ajustes finos: útil como punto de partida para medir el efecto de un fine-tuning frente al base `unsloth/Qwen3.5-2B`.
- Docencia y demostraciones: su tamaño reducido (4,6 GB en FP16) permite ejecutarlo en hardware modesto para clases o talleres sobre fine-tuning con Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 4,5-5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 8-10 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 2,5-3 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 1,5-2 GB para pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más en FP16, y en GPUs con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cksindhi/unsloth_Qwen3.5-2B_1795149525-merged | 2,27B | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| unsloth/Qwen3.5-2B (base) | ~2B | no disponible | no disponible | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (según documentación pública de Qwen) | Apache 2.0 | Hugging Face |
| Qwen2.5-3B-Instruct | 3B | 32K (según documentación pública de Qwen) | Qwen Research License | Hugging Face |

## Limitaciones y advertencias

- Modelo derivado de un fine-tuning no documentado: se desconoce el dataset y el método, lo que impide evaluar sesgos introducidos.
- Riesgo de alucinación inherente a modelos de 2B parámetros, especialmente en tareas de razonamiento y matemáticas.
- Solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada; no debe asumirse la del base sin verificación.
- Sin benchmarks publicados ni descargas: no hay evidencia de calidad frente al base.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base `unsloth/Qwen3.5-2B` antes de uso comercial.
- El pipeline `image-text-to-text` no está respaldado por documentación sobre la torre visual; validar antes de usar en producción multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cksindhi/unsloth_Qwen3.5-2B_1795149525-merged
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
