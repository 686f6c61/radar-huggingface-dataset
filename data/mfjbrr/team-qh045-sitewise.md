# mfjbrr/team-QH045-sitewise

## Resumen

SITEWISE es un clasificador de imágenes especializado en fotografía de obra de construcción, desarrollado por el equipo QH045 en el marco del hackathon qai-hf-hackathon-2026. Se trata de un fine-tuning de `google/siglip2-base-patch16-224` que asigna a cada foto una de cuatro etiquetas: `door` (puerta), `wall` (muro), `ceiling` (techo) u `other` (otro). El modelo forma parte de una arquitectura mayor, también llamada SITEWISE, concebida como auditor de reclamaciones de pago en obra civil en Catar: las predicciones con alta confianza se resuelven en CPU, mientras que las fotos dudosas, las discrepancias de etiqueta y los elementos declarados como completados se escalan a un VLM (Gemma 4 31B IT, con Qwen2.5-VL-72B como respaldo) a través de Inference Providers.

El modelo resuelve un problema de coste: clasificar la mayoría de las fotos de una certificación de obra con un modelo pequeño y barato antes de invocar modelos multimodales mucho más caros. Con 92,9 millones de parámetros y un repositorio de 0,7 GB, está pensado para ejecutarse en CPU o en GPUs de gama baja, con una latencia declarada de 0,014 segundos por foto en el entorno del evaluador.

Es relevante por su planteamiento de cascada (clasificador ligero más VLM para casos ambiguos) y por su transparencia metodológica: el autor documenta el dataset, la partición por fotógrafo, los costes de entrenamiento en HF Jobs (unos 0,05 USD) y advierte explícitamente de que las cifras de precisión no son representativas de un entorno real. No obstante, el conjunto de datos es muy reducido (144 imágenes) y el propio autor reconoce que el modelo no ha sido validado en obra real de Catar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2 (vision transformer con encoder de imagen y texto), fine-tuning de `google/siglip2-base-patch16-224`; patch size 16, resolución 224 |
| Parametros totales | 92.887.300 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de imagen, no generativo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (la tarea es clasificación visual; las etiquetas están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de SigLIP2 base, un transformer de visión con encoder de imagen y de texto que aprende representaciones alineadas imagen-texto mediante una función de pérdida sigmoidea. El fine-tuning convierte esa representación en un clasificador de cuatro clases (puerta, muro, techo, otro) sobre la base de `google/siglip2-base-patch16-224`. No se documentan innovaciones arquitectónicas propias: el valor del modelo está en el ajuste fino y en su integración en una cascada con modelos mayores.

El entrenamiento se realizó durante 5 épocas con learning rate 5e-5, batch size 16 y selección de la mejor época por accuracy en el split de test. El dataset (`mfjbrr/team-QH045-sitewise-photos`) contiene 112 imágenes de entrenamiento y 32 de test, 28 y 8 por clase respectivamente, todas procedentes de Wikimedia Commons con licencias mixtas (CC0, dominio público, CC BY y CC BY-SA). La partición se hizo por fotógrafo para evitar fuga de información. El coste total en HF Jobs fue de aproximadamente 0,05 USD sobre una instancia `a10g-small` (80 segundos de prueba y 106 segundos de ejecución completa). No se documenta uso de RLHF, DPO ni datos sintéticos.

## Capacidades

- Clasificación de imágenes de obra en cuatro categorías: `door`, `wall`, `ceiling` y `other`.
- Predicción con puntuaciones de confianza utilizables para decidir el escalado a un VLM.
- Etiquetado del sujeto principal de la foto; no analiza elementos secundarios ni el estado de completitud.
- Integración como primera etapa de una cascada de auditoría: las predicciones de alta confianza se resuelven localmente y las dudosas se envían a Gemma 4 31B IT o Qwen2.5-VL-72B.
- Ejecución en CPU con latencia muy baja (0,014 s por foto según la evaluación del autor).
- No soporta tool calling, function calling, generación de texto, razonamiento multi-paso ni capacidades multimodales más allá de la clasificación visual.
- No dispone de modo thinking, visión generativa, audio ni capacidades multilingües documentadas.

## Casos de uso

- Triaje de fotos en auditorías de certificación de obra: el modelo clasifica rápidamente cada imagen en puerta, muro, techo u otro, y solo las fotos con baja confianza o discrepancia con la partida declarada se envían a un VLM, reduciendo el coste por foto de 0,000084 USD a prácticamente cero en la etapa de clasificación.
- Preprocesado en pipelines de inspección con drones o cámaras de obra: al ejecutarse en CPU con 0,014 s por imagen, permite etiquetar lotes grandes de fotos antes de cualquier revisión humana o modelo mayor.
- Filtrado previo en aplicaciones de gestión documental de proyectos: descarta imágenes que no corresponden a elementos constructivos relevantes (`other`) y organiza automáticamente el resto por tipo de elemento.
- Control de calidad de la propia captura: detectar fotos que no muestran el elemento declarado en la certificación y marcarlas para revisión antes de que lleguen al ingeniero.
- Prototipado rápido de clasificadores de obra: al ser un fine-tuning de SigLIP2 con licencia Apache 2.0 y un coste de entrenamiento de 0,05 USD, sirve como base para experimentar con nuevas categorías o dominios.
- Integración en herramientas de inspección móvil: el modelo cabe en un repositorio de 0,7 GB y puede desplegarse en el dispositivo o en un servidor modesto para preclasificar fotos tomadas in situ.
- Segunda opinión automática sobre etiquetas: comparar la predicción del clasificador con la etiqueta declarada por el contratista y escalar las discrepancias al VLM y al ingeniero.

## Benchmarks y rendimiento

Evaluación sobre el split de test fijo del dataset (n=32, 8 fotos por clase). El autor advierte que este split se usó para elegir la mejor época del modelo, por lo que la puntuación no es totalmente independiente.

| Configuracion | Accuracy | Macro F1 | Latencia media | Coste estimado por foto | Escalado |
|---|---|---|---|---|---|
| SigLIP2 zero-shot | 96,88% | 0,969 | 0,024 s | 0,000000 USD | 0% |
| Este modelo (SigLIP2 fine-tuned) | 100,00% | 1,000 | 0,014 s | 0,000000 USD | 0% |
| Gemma en cada foto | 100,00% | 1,000 | 3,277 s | 0,000084 USD | 100% |
| Cascada probada (zero-shot + Gemma) | 100,00% | 1,000 | 0,418 s | 0,000013 USD | 15,6% |

En el conjunto de desarrollo separado del equipo (37 fotos), el modelo obtuvo 97,30% de accuracy (macro F1 0,973) frente a 91,89% (0,921) del zero-shot. El autor subraya que estas cifras no son representativas de un entorno real: n=32 es pequeño, las imágenes fueron seleccionadas a mano por una persona y la mayoría no proceden de obra en Catar o el Golfo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 92,9 millones de parámetros en fp32, el modelo ocupa aproximadamente 0,37 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: el autor documenta entrenamiento en `a10g-small`; para inferencia basta una GPU consumer (RTX 3060, RTX 4090) o incluso CPU.
- Cabe en GPU consumer: sí, con margen amplio; también está pensado para ejecutarse en CPU, según la arquitectura de cascada descrita.
- Opciones de despliegue: `transformers` con `pipeline("image-classification")`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (el modelo no es generativo).
- Latencia y throughput: 0,014 s por foto en el entorno del evaluador del autor (que puede haber usado GPU); el autor advierte que las latencias locales pueden no coincidir con hardware CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SITEWISE (este modelo) | 92,9 M | no aplica (clasificación) | Clasificación de 4 clases en fotos de obra | Apache 2.0 | Hugging Face |
| google/siglip2-base-patch16-224 | no disponible | no aplica (clasificación) | Clasificación zero-shot imagen-texto | Apache 2.0 | Hugging Face |
| Gemma 4 31B IT | 31 B | no disponible | VLM generativo para verificación de completitud | no disponible en la información | Inference Providers |
| Qwen2.5-VL-72B-Instruct | 72 B | no disponible | VLM generativo, respaldo en la cascada | no disponible en la información | Hugging Face |

La comparación relevante es con SigLIP2 base zero-shot: el fine-tuning mejora la accuracy del 96,88% al 100% en el split de test y del 91,89% al 97,30% en el conjunto de desarrollo, a costa de especializarse en cuatro clases concretas. Frente a los VLM de la cascada, el clasificador es entre dos y tres órdenes de magnitud más barato y rápido por foto, pero no puede evaluar completitud, autenticidad ni calidad de la instalación.

## Limitaciones y advertencias

- Dataset muy pequeño (144 imágenes en total) con diversidad limitada de obra e iluminación; las etiquetas fueron asignadas por una sola persona a partir de miniaturas.
- La mayoría de las fotos no proceden de Catar ni del Golfo, y muchas muestran obra terminada en lugar de trabajo en curso.
- Las clases son más amplias que las partidas del proyecto de referencia: `wall` incluye ladrillo y mampostería, y `ceiling` incluye techos alicatados y decorativos.
- No validado en proyectos reales de Catar ni con iluminación y ángulos de obra real.
- Solo etiqueta el sujeto principal de la foto; no puede determinar si un conjunto de puerta está completo (por ejemplo, si falta la hoja) ni medir cantidad o calidad instalada.
- El modelo produce observaciones, no certificación: el autor prohíbe explícitamente su uso para decisiones de pago sin revisión de un ingeniero.
- Las cifras de accuracy (100% en test, 97,30% en desarrollo) no son representativas de un entorno real y el split de test se usó para seleccionar la mejor época.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas con alta confianza en fotos ambiguas, oscuras o parciales.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre decisiones de pago recae en el revisor humano.
- No se documentan sesgos demográficos ni geográficos más allá de la advertencia sobre la procedencia de las imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mfjbrr/team-QH045-sitewise
- Dataset: https://huggingface.co/datasets/mfjbrr/team-QH045-sitewise-photos
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- VLM principal de la cascada: https://huggingface.co/google/gemma-4-31B-it
- VLM de respaldo: https://huggingface.co/Qwen/Qwen2.5-VL-72B-Instruct
