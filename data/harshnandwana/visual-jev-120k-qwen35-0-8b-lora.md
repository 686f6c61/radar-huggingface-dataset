# harshnandwana/visual-jev-120k-qwen35-0.8b-lora

## Resumen

El modelo `harshnandwana/visual-jev-120k-qwen35-0.8b-lora` es un adaptador LoRA de tipo PEFT construido sobre el modelo base `Qwen/Qwen3.5-0.8B-Base`, desarrollado por el usuario harshnandwana. Se trata de un ajuste fino orientado específicamente a tareas de anclaje visual (*visual grounding*) y respuesta a preguntas sobre imágenes con caja normalizada, elección multiple o texto corto. El adaptador no es un modelo independiente: requiere cargar el modelo base Qwen3.5-0.8B y superponer los pesos LoRA.

El problema que aborda es la localización espacial de objetos en imágenes y la resolución de preguntas visuales estructuradas (detección de cajas, elección entre opciones, booleanos espaciales, atributos y relaciones). Fue entrenado sobre un subconjunto estratificado de 120.000 filas del dataset *Visual Jev decisions v1*, con cinco tareas claramente diferenciadas y evaluado sobre subconjuntos seleccionados de validación y test.

Su relevancia es fundamentalmente como demostración de investigación (*research demonstration*): con tan solo 0.8B de parámetros en el modelo base, un LoRA de rango 16 sobre `q_proj` y `v_proj`, y 3,61 horas de entrenamiento en 2 × NVIDIA L4, consigue mejoras sustanciales en tareas de grounding respecto al modelo base. La licencia Apache 2.0 y el formato safetensors facilitan su reutilización, aunque el autor advierte explícitamente que no debe tomarse como un sistema de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen3.5-0.8B-Base; no disponible el detalle interno del modelo base |
| Parametros totales | 0.8B en el modelo base; parametros del adaptador no disponibles (rango 16 sobre q_proj y v_proj) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.5-0.8B-Base`, un modelo multimodal de 0.8B parámetros con capacidad de entrada imagen-texto (pipeline `image-text-to-text`). El ajuste consiste en un LoRA de rango 16 insertado únicamente en las proyecciones `q_proj` y `v_proj` de la atención, entrenado con AdamW a una tasa de aprendizaje de 5e-05 y acumulación de gradiente de 16 por GPU. El entrenamiento se realizó durante una única época sobre 120.000 filas, con imágenes ajustadas a un máximo de 512 × 512 píxeles, empleando 2 × NVIDIA L4 durante 3,61 horas.

Los datos de entrenamiento provienen de un subconjunto estratificado del dataset *Visual Jev decisions v1* (revisión `687c745c34846d104ee85af802b9fd444a854f5d`), generado mediante *reservoir sampling* por tarea con semilla 43801, partiendo de particiones disjuntas por imagen de train, validación y test. Cada una de las cinco tareas (ground_bbox, box_choice, spatial_boolean, attribute_text y relation_text) aporta 24.000 registros de entrenamiento, 200 de validación y 200 de test. Se excluyó el shard `luna_candidates.jsonl` con etiquetas generadas por estar pendiente de auditoría humana. No se hospedan bytes de fotografías ni en el dataset ni en el repositorio del modelo, ni se documenta uso de RLHF o DPO.

## Capacidades

- Anclaje visual (*grounding*): predice cajas delimitadoras normalizadas para objetos descritos en texto, con un IoU medio de 0.598 en el subconjunto de test seleccionado.
- Elección de caja (*box_choice*): selecciona la caja correcta entre varias opciones, con 0.975 de *exact match* en test.
- Preguntas booleanas espaciales (*spatial_boolean*): responde afirmativa o negativamente sobre relaciones espaciales, con 0.945 de *exact match*.
- Descripción de atributos (*attribute_text*): genera texto corto describiendo atributos de un objeto, con 0.815 de *exact match*.
- Descripción de relaciones (*relation_text*): produce texto corto sobre relaciones entre objetos, con 0.805 de *exact match*.
- Procesamiento de imagen y texto combinados mediante el procesador de Qwen3.5.
- No se documentan capacidades de *tool calling*, *function calling*, uso como agente, razonamiento multi-paso, ni soporte multilingüe más allá del inglés.

## Casos de uso

- Anotación asistida de datasets visuales: dado que el adaptador resuelve tareas de caja, elección, booleanos, atributos y relaciones, puede emplearse para pre-etiquetar imágenes antes de una revisión humana, acelerando la construcción de corpus de grounding.
- Prototipado de investigación en grounding de bajo coste: con un modelo base de 0.8B y un LoRA ligero, sirve para validar hipótesis sobre prompting serializado y particiones por tarea sin requerir GPUs de gran tamaño.
- Evaluación comparativa de adaptadores PEFT: el repositorio publica `metrics.json`, `predictions.jsonl` y `selection_manifest.json`, por lo que es útil como referencia reproducible en experimentos sobre LoRA en tareas multimodales.
- Demostración educativa de flujo PEFT multimodal: la combinación `AutoProcessor` + `Qwen3_5ForConditionalGeneration` + `PeftModel` documentada en la model card sirve como plantilla didáctica para cargar adaptadores sobre modelos visión-lenguaje.
- Verificación de coherencia espacial en pipelines internos: el subconjunto de tareas booleanas espaciales (0.945 de *exact match*) permite comprobar respuestas afirmativas/negativas sobre relaciones geométricas simples entre objetos anotados.
- Selección entre candidatos de detección: la tarea `box_choice` (0.975 de *exact match*) puede emplearse para desambiguar entre varias cajas propuestas por otro detector previo.

## Benchmarks y rendimiento

Perdida de validacion seleccionada (NLL negativo medio por fila, forzado por profesor; menor es mejor):

| Tarea | Filas | Base | Adaptador |
|---|---:|---:|---:|
| ground_bbox | 200 | 0.921 | 0.587 |
| box_choice | 200 | 1.027 | 0.035 |
| spatial_boolean | 200 | 0.430 | 0.065 |
| attribute_text | 200 | 1.559 | 0.223 |
| relation_text | 200 | 4.204 | 0.157 |

Generacion sobre test retenido seleccionado (grounding con IoU medio; el resto con *exact match* sin distinguir mayúsculas y tras recortar puntuación terminal; mayor es mejor):

| Tarea | Filas | Base | Adaptador |
|---|---:|---:|---:|
| ground_bbox | 200 | 0.044 | 0.598 |
| box_choice | 200 | 0.000 | 0.975 |
| spatial_boolean | 200 | 0.710 | 0.945 |
| attribute_text | 200 | 0.005 | 0.815 |
| relation_text | 200 | 0.000 | 0.805 |

Los valores exactos, predicciones por registro y manifiesto de selección se encuentran en `metrics.json`, `predictions.jsonl` y `selection_manifest.json`. No se reclama ningún benchmark sobre el split completo.

## Requisitos de hardware

- Entrenamiento documentado: 2 × NVIDIA L4, 3,61 horas para una época sobre 120.000 filas.
- Inferencia: al tratarse de un adaptador sobre un modelo base de 0.8B, la huella de VRAM la determina el modelo base más el codificador visual; las estimaciones concretas de VRAM no están publicadas y se marcan como no disponibles.
- Imágenes de entrada limitadas a 512 × 512 píxeles por el propio diseño del entrenamiento.
- Compatibilidad con consumer GPU: previsiblemente viable en GPUs de consumo con suficiente VRAM para un modelo de 0.8B en bf16, aunque no se ofrecen cifras oficiales.
- Opciones de despliegue documentadas: carga vía `transformers` (`AutoProcessor`, `Qwen3_5ForConditionalGeneration`) combinada con `peft.PeftModel`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos comparativos frente a otros adaptadores de grounding o modelos visión-lenguaje equivalentes (parámetros, contexto, rendimiento, licencia o disponibilidad). Comparativa no disponible.

## Limitaciones y advertencias

- El propio autor califica el adaptador como *research demonstration*; no está pensado para producción.
- Los atributos y relaciones de Visual Genome pueden ser ruidosos, lo que limita la fiabilidad de las tareas `attribute_text` y `relation_text`.
- Las preguntas geométricas de COCO asumen que los objetos anotados son visibles, lo que puede no cumplirse en escenarios reales.
- Los resultados no demuestran capacidad de OCR, conteo exhaustivo, calibración de UNKNOWN ni comportamiento fuera de distribución.
- Evaluación realizada únicamente sobre subconjuntos seleccionados (200 filas por tarea en validación y 200 en test); no hay benchmark sobre el split completo.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación y de respuestas incorrectas en descripciones textuales no está cuantificado más allá de las métricas de *exact match* publicadas.
- Sesgos: no documentados explícitamente, pero heredables del dataset de origen (Visual Genome, COCO) y del modelo base Qwen3.5.
- Aunque la licencia es Apache 2.0, el uso comercial debería considerar que se trata de una demostración de investigación y que el modelo base tiene su propia licencia, no detallada aquí.
- El adaptador excluye el shard `luna_candidates.jsonl` por falta de auditoría humana, por lo que determinados tipos de decisión podrían quedar fuera del alcance entrenado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harshnandwana/visual-jev-120k-qwen35-0.8b-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/harshnandwana/visual-jev-decisions-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Métricas detalladas: `metrics.json` en el repositorio del modelo
- Predicciones por registro: `predictions.jsonl` en el repositorio del modelo
- Manifiesto de selección: `selection_manifest.json` en el repositorio del modelo
- Script de serialización de prompts: `full_worker.py` en el repositorio del modelo
- Imagen de benchmark: `benchmark.png` en el repositorio del modelo
