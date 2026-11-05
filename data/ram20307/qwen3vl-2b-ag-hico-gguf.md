# Ram20307/qwen3vl-2b-ag-hico-GGUF

## Resumen

`qwen3vl-2b-ag-hico-GGUF` es una cuantización Q4_K_M en formato GGUF de un adaptador LoRA sobre Qwen3-VL-2B-Instruct, publicada por el usuario Ram20307. El modelo resultante está especializado en la generación de *scene graphs* de acciones humanas: a partir de una imagen (un fotograma), produce JSON estructurado con las relaciones sujeto-predicado-objeto y las acciones detectadas, siguiendo las taxonomías de los conjuntos de datos Action Genome y HICO-DET.

El interés técnico es doble. Por un lado, demuestra un flujo de trabajo de destilación de tareas mediante LoRA sobre un VLM pequeño (1.720.574.976 parámetros según los pesos en safetensors del adaptador, aunque la nomenclatura comercial lo etiquete como "2B") y su posterior empaquetado en GGUF para inferencia con `llama.cpp` mediante `llama-mtmd-cli`. Por otro, ilustra las limitaciones de este tipo de artefactos: el autor solo ha validado que la salida es JSON válido en un único fotograma y no ha puntuado el modelo cuantizado con métricas formales.

La relevancia es acotada: no es un modelo de propósito general, sino una herramienta de investigación para extracción de grafos de escena en vídeo e imagen, con un rendimiento medido modesto (recall 0,29 / precision 0,33 en 60 fotogramas de Action Genome para la variante AG) y una licencia Apache-2.0 que no elimina las restricciones de los datos de entrenamiento subyacentes, de uso exclusivamente investigador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL) con adaptador LoRA fusionado; torre de visión congelada |
| Parámetros totales | 1.720.574.976 (pesos del adaptador/base reportados en safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nominales en el modelo base; el autor recomienda `-c 4096` en la práctica por consumo de memoria |
| Tipos de cuantización | Q4_K_M (única publicada en este repo); proyector de visión en F16 (`mmproj-qwen3vl-2b-ag-f16.gguf`) |
| Idiomas soportados | no disponible (la model card no documenta idiomas; hereda los del Qwen3-VL base, sin verificar) |
| Licencia | Apache-2.0 (con restricciones adicionales por datos de entrenamiento: Action Genome/Charades y HICO-DET son de uso investigador no comercial) |
| Formato de pesos | GGUF (modelo principal) + GGUF F16 para el proyector de visión |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct, un transformer multimodal con codificador visual y decoder de lenguaje, y le aplica un adaptador LoRA entrenado por el autor. La torre de visión quedó congelada durante el ajuste, de ahí que el proyector multimodal (`mmproj-qwen3vl-2b-ag-f16.gguf`) sea idéntico para todas las variantes derivadas y se distribuya como fichero separado. El adaptador se ha fusionado y cuantizado a Q4_K_M para su uso con `llama.cpp`.

El entrenamiento se realizó sobre Action Genome (derivado de Charades) y HICO-DET, dos conjuntos de referencia para detección de relaciones humano-objeto y reconocimiento de acciones. La model card no detalla el número de tokens, la composición exacta del dataset, ni si hubo RLHF/DPO; el autor remite a la ficha del adaptador (`Ram20307/qwen3vl-2b-ag-hico-lora`) para los detalles de tarea, prompts, entrenamiento y evaluación. No se documenta ninguna innovación arquitectónica propia más allá del ajuste fino supervisado sobre la tarea de *scene graph generation*.

## Capacidades

- Generación de *scene graphs* de acciones en formato JSON a partir de una imagen o fotograma.
- Detección de relaciones sujeto-predicado-objeto según las taxonomías de Action Genome y HICO-DET.
- Entrada image-text-to-text: acepta una imagen y un prompt de texto.
- Salida estructurada (JSON) apta para postprocesado automático.
- Inferencia local vía `llama.cpp` con `llama-mtmd-cli` y proyector multimodal separado.
- Compatible con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modos de razonamiento extendido.
- Capacidades multilingües: no disponibles/no verificadas en la información proporcionada.

## Casos de uso

- Anotación asistida de vídeo para investigación en interacción humano-objeto: el modelo procesa fotogramas individuales y devuelve relaciones en JSON, que pueden volcarse a un pipeline de anotación y revisarse manualmente; adecuado por su formato de salida estructurado, aunque con recall/precision bajos que exigen revisión humana.
- Preetiquetado en la construcción de datasets de Action Genome o HICO-DET: generar candidatos de relaciones para acelerar el etiquetado, usando el modelo como primer paso de un flujo *human-in-the-loop*.
- Extracción de características simbólicas para modelos de vídeo posteriores: convertir fotogramas en grafos de escena que alimenten un modelo de reconocimiento temporal de acciones.
- Pruebas de concepto de *scene graph generation* en local: al ser un GGUF Q4_K_M de ~1,9 GB de repo, permite experimentar en una estación de trabajo sin GPU de datacenter, con `llama-mtmd-cli` y contexto reducido a 4096.
- Evaluación comparativa de cuantizaciones: útil como caso de estudio de la degradación de métricas al pasar de bf16 a Q4_K_M en tareas de salida estructurada.
- Docencia y experimentación con VLMs pequeños: entorno reproducible para enseñar ajuste LoRA, congelación de torre visual y despliegue GGUF.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas de recall y precision sobre fotogramas de Action Genome, y el autor advierte que las comparaciones no son limpias porque usan conjuntos de fotogramas distintos.

| Modelo / variante | Conjunto evaluado | Recall | Precision |
|---|---|---|---|
| AG-only en Q4 (cuantizado) | 60 fotogramas AG | 0,29 | 0,33 |
| AG-only en bf16 | 199 fotogramas AG | 0,31 | 0,45 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la información disponible. El GGUF de este repositorio solo pasó una comprobación de validez de JSON en un único fotograma y no fue puntuado.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2-3 GB para el modelo Q4_K_M más el proyector de visión F16, dependiendo del backend y del contexto configurado.
- Contexto: usar `-c 4096` de forma explícita; el contexto nominal de 262.144 tokens requiere decenas de GB y no es viable en hardware de consumo.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también puede ejecutarse en CPU con `llama.cpp`.
- Despliegue: `llama.cpp` mediante `llama-mtmd-cli` con `--mmproj mmproj-qwen3vl-2b-ag-f16.gguf`; no se documentan recetas para vLLM, TGI u Ollama en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen3vl-2b-ag-hico-GGUF` (este) | ~1,72 B | 262.144 nominales / 4.096 recomendados | Scene graph de acciones (AG + HICO-DET) | Apache-2.0 con datos de uso investigador | GGUF en HuggingFace |
| `Ram20307/qwen3vl-2b-ag-hico-lora` | ~1,72 B | 262.144 | Igual, en formato adaptador LoRA (bf16) | Apache-2.0 con datos de uso investigador | LoRA en HuggingFace |
| Qwen3-VL-2B-Instruct (base) | ~2 B (nominal) | 262.144 | VLM de propósito general image-text-to-text | Apache-2.0 | Pesos originales en HuggingFace |

No se dispone de datos de benchmarks comparables entre estas variantes en la información proporcionada, más allá de la comparación interna Q4 frente a bf16 del apartado anterior.

## Limitaciones y advertencias

- Rendimiento medido bajo: recall 0,29 y precision 0,33 en la variante AG cuantizada, insuficiente para uso autónomo en producción sin revisión humana.
- Validación mínima del GGUF: solo se comprobó que la salida era JSON válido en un fotograma; no hay evaluación formal del artefacto cuantizado.
- La comparación Q4 frente a bf16 usa conjuntos de fotogramas distintos (60 frente a 199), por lo que no es concluyente sobre la degradación por cuantización.
- Restricciones de datos: Action Genome/Charades y HICO-DET son de uso exclusivamente investigador; la licencia Apache-2.0 del artefacto no exonera de esas restricciones para uso comercial.
- Contexto práctico limitado a 4.096 tokens por consumo de memoria; no apto para razonamiento sobre documentos largos.
- Idiomas soportados no documentados; no se debe asumir un comportamiento multilingüe verificado.
- Especialización estrecha: no es un modelo de propósito general y su uso fuera de la tarea de scene graph no está validado.
- Sin datos de sesgos, alucinación o robustez más allá de las métricas de la tarea.
- Repositorio sin descargas ni interacciones en el momento de la consulta; sin mantenimiento ni comunidad verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ram20307/qwen3vl-2b-ag-hico-GGUF
- Adaptador LoRA base: https://huggingface.co/Ram20307/qwen3vl-2b-ag-hico-lora
- Action Genome: no disponible en la información proporcionada
- HICO-DET: no disponible en la información proporcionada
- Repositorio de `llama.cpp`: no disponible en la información proporcionada
