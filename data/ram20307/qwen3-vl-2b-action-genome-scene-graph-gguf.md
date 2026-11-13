# Ram20307/qwen3-vl-2b-action-genome-scene-graph-GGUF

## Resumen

qwen3-vl-2b-action-genome-scene-graph-GGUF es un ajuste fino (fine-tuning) del modelo multimodal Qwen3-VL-2B-Instruct de Alibaba, publicado por el usuario Ram20307 en Hugging Face. El modelo está especializado en la extracción de grafos de escena (scene graphs) a partir de imágenes: dado un fotograma, devuelve un JSON que enumera los objetos visibles relacionados con una persona y clasifica esa relación en tres categorías (atención, espacial y contacto). El ajuste se ha realizado sobre el conjunto de datos Action Genome, derivado de los vídeos de Charades.

Técnicamente, se trata de un transformer multimodal de aproximadamente 1.720 millones de parámetros (1,72 B) con un proyector visual separado, distribuido en formato GGUF para su ejecución con llama.cpp. El repositorio incluye dos ficheros: el modelo de lenguaje cuantizado en Q4_K_M y el proyector visual en f16, imprescindible para procesar imágenes. El contexto nativo del modelo base es muy amplio (en torno a 262 000 tokens según la model card), aunque el autor recomienda limitarlo a 4096 tokens para evitar un consumo de memoria desproporcionado.

Su relevancia es acotada pero concreta: demuestra cómo un modelo de 2 B puede especializarse mediante LoRA (r=16, entrenamiento en bf16, 2 épocas) en una tarea estructurada de percepción relacional, y cómo ese resultado puede desplegarse en hardware modesto gracias a la cuantización. Los resultados preliminares publicados (recall 0,40, precision 0,54 sobre 199 fotogramas) indican que es un prototipo de investigación, no un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje Qwen3-VL + proyector visual), ajustado con LoRA |
| Parametros totales | 1.720.574.976 (~1,72 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ~262 000 tokens en el modelo base; el autor recomienda usar 4096 en inferencia GGUF |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) y f16 (proyector visual) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (pesos); los datos de entrenamiento (Action Genome/Charades) son solo para investigación no comercial |
| Formato de pesos | GGUF (qwen3vl2b-ag-full-Q4_K_M.gguf y mmproj-qwen3vl-2b-ag-full-f16.gguf) |
| Modelo base | Qwen/Qwen3-VL-2B-Instruct |
| Tamano del repositorio | 1,9 GB |
| Dataset de entrenamiento | Action Genome (split completo de train) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct, un transformer multimodal que combina un modelo de lenguaje con un codificador/proyector visual que inyecta representaciones de imagen en el flujo de tokens del LLM. Sobre esa base se aplicó un ajuste fino con LoRA de rango 16 en precisión bf16 durante 2 épocas, y posteriormente se fusionaron los pesos (merged) para exportarlos a GGUF. El entrenamiento empleó el split completo de entrenamiento de Action Genome: aproximadamente 60 700 fotogramas muestreados de 7787 vídeos de Charades, con hasta 8 fotogramas por vídeo.

La tarea aprendida es de generación estructurada: el prompt pide enumerar todos los objetos visibles relacionados con la persona y emitir un JSON con las claves `object`, `attention`, `spatial` y `contact`. No se documentan innovaciones arquitectónicas propias ni fases de RLHF/DPO específicas para este ajuste; la única modificación respecto al modelo base es el entrenamiento supervisado sobre pares imagen-JSON del dataset. El proyector visual se distribuye en f16 como fichero independiente (`mmproj`), un patrón habitual en llama.cpp para modelos multimodales.

## Capacidades

- Generación de grafos de escena en JSON: identifica objetos relacionados con una persona y clasifica la relación en atención, espacial y contacto.
- Comprensión visual de un único fotograma (image-to-text estructurado).
- Salida en formato JSON estricto, lo que facilita su consumo programático (el autor reporta 199/199 JSON válidos en el conjunto de prueba preliminar).
- Conversación multimodal heredada del modelo base Qwen3-VL-2B-Instruct (etiqueta `conversational` en el repositorio).
- Ejecución local mediante llama.cpp con `llama-mtmd-cli` y soporte de `--mmproj` para imágenes.
- Capacidades multilingües: no disponible (no se documentan idiomas soportados para este ajuste).
- Tool calling, agentes y razonamiento multi-paso: no disponible (no documentado para este ajuste).

## Casos de uso

- Anotación automática de grafos de escena para investigación en visión por computador: generar etiquetas preliminares de relaciones persona-objeto sobre fotogramas de vídeo y revisarlas manualmente, reduciendo el coste de anotación en datasets tipo Action Genome.
- Preprocesado para modelos de razonamiento visual de mayor tamaño: usar este modelo de 2 B como extractor barato de relaciones y pasar el JSON resultante a un LLM mayor como contexto estructurado.
- Análisis de interacción humano-objeto en vídeo de vigilancia o robótica: procesar fotogramas clave y obtener qué objetos atiende, toca o tiene próximos una persona, con la salvedad de que la precisión actual (0,54) exige validación humana.
- Prototipado rápido en hardware de consumo: al ocupar el modelo cuantizado en Q4_K_M un espacio reducido y ejecutarse con llama.cpp, permite iterar sobre pipelines de percepción relacional en un portátil o una GPU de gama media.
- Investigación sobre ajuste fino eficiente: sirve como referencia reproducible de cómo un LoRA r=16 sobre un VLM de 2 B aprende una tarea de salida estructurada con ~60 700 muestras en 2 épocas.
- Generación de descripciones estructuradas para accesibilidad: producir un listado JSON de objetos e interacciones de una imagen que luego se transforme en texto descriptivo para personas con discapacidad visual.
- Evaluación comparativa de cuantizaciones: el autor no ha medido la calidad de Q4_K_M frente a bf16, por lo que el modelo es útil como caso de estudio para medir la degradación por cuantización en tareas de salida JSON.

## Benchmarks y rendimiento

El autor publica una evaluación preliminar propia sobre 199 fotogramas de prueba de 25 vídeos, con pesos bf16 fusionados (no sobre la versión GGUF Q4_K_M):

| Metrica | Resultado |
|---|---|
| JSON valido | 199/199 |
| Recall | 0,40 |
| Precision | 0,54 |
| Conjunto de evaluacion | 199 fotogramas de 25 videos (protocolo no oficial) |
| Repeticiones / barras de error | 1 ejecucion, sin barras de error |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor advierte explícitamente de que no sigue el protocolo de competición (280 fotogramas de 35 vídeos) y de que la calidad de la cuantización Q4_K_M no se ha evaluado todavía.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 1,9 GB; el modelo de lenguaje en Q4_K_M ronda 1,1-1,3 GB y el proyector visual f16 unos 0,6-0,8 GB. Con contexto de 4096 tokens, la inferencia completa debería moverse en el rango de 2-3 GB de VRAM/RAM.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 3060) es suficiente; también cabe en CPU con llama.cpp.
- Cabe en GPU de consumo: sí, en la mayoría de GPU consumer modernas con al menos 4 GB.
- Opciones de despliegue: llama.cpp mediante `llama-mtmd-cli` (comando documentado por el autor con `-m`, `--mmproj`, `-c 4096`, `-n 400`, `--temp 0`). No se documenta soporte verificado en vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. El autor recomienda fijar `-c 4096` porque el contexto por defecto (~262 000 tokens) requiere mucha más memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (qwen3-vl-2b-action-genome-scene-graph-GGUF) | ~1,72 B | ~262k nativo; 4096 recomendado | Grafo de escena persona-objeto en JSON | apache-2.0 (pesos); datos solo investigación | GGUF en Hugging Face, 0 descargas |
| Qwen/Qwen3-VL-2B-Instruct (base) | ~2 B | ~262k | VLM generalista conversacional | apache-2.0 | Ampliamente disponible |
| Alternativas especializadas en scene graph de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con otros modelos de scene graph.

## Limitaciones y advertencias

- Rendimiento modesto: recall 0,40 y precision 0,54 en la evaluación preliminar del autor; no es adecuado para producción sin revisión humana.
- Evaluación incompleta: una sola ejecución, sin barras de error, con un subconjunto de 199 fotogramas que no sigue el protocolo oficial de competición.
- Calidad de la cuantización sin medir: el autor indica que Q4_K_M no se ha evaluado sobre el modelo entrenado con el split completo, por lo que puede degradar aún más los resultados.
- Restricción de datos: Action Genome y Charades están licenciados solo para investigación no comercial; aunque los pesos se publican como apache-2.0, el uso comercial derivado del entrenamiento es jurídicamente dudoso.
- Contexto: el contexto por defecto (~262k) consume demasiada memoria en GGUF; hay que limitarlo a 4096, lo que restringe entradas largas.
- Idiomas: no se documentan idiomas soportados; la salida está pensada en inglés (nombres de objetos y claves JSON en inglés).
- Riesgo de alucinación: como todo VLM, puede inventar objetos o relaciones no presentes; el formato JSON válido no garantiza corrección semántica.
- Sesgos: no documentados por el autor; hereda los sesgos del modelo base y del dataset Charades (escenas domésticas y de actividades cotidianas en vídeos de origen estadounidense).
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; sin mantenimiento ni comunidad verificable.

## Enlaces

- Hugging Face: https://huggingface.co/Ram20307/qwen3-vl-2b-action-genome-scene-graph-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset Action Genome: no disponible (referenciado en la model card sin enlace directo)
- Dataset Charades: no disponible (referenciado en la model card sin enlace directo)
- Paper, blog o demo adicionales: no disponible
