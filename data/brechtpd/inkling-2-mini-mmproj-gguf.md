# Brechtpd/Inkling-2-Mini-mmproj-GGUF

## Resumen

Inkling-2-Mini-mmproj-GGUF es la versión cuantizada del proyector multimodal (mmproj) del modelo `thinkingmachines/Inkling-2-Mini`, publicado por el usuario Brechtpd. No se trata del modelo de lenguaje en sí, sino del componente que conecta el codificador visual con el modelo base para habilitar capacidades de visión. El artefacto contiene exclusivamente el proyector en formato GGUF con cuantización Q4_0, lo que lo hace apto para su uso en pipelines de llama.cpp y derivados.

El proyector empaqueta un codificador ViT de 318 millones de parámetros (denominado `inkling2v` en la model card) y lo cuantiza a Q4_0 en sus 140 tensores 2D de atención y FFN, preservando en F32 las capas de normalización, los embeddings de parches, posición y clase. El fichero resultante ocupa 177 MiB, un tamaño muy contenido que facilita el despliegue de inferencia multimodal en hardware modesto cuando se combina con los pesos del modelo base.

Su relevancia radica en que permite ejecutar el modelo Inkling-2-Mini con entrada de imagen en entornos de inferencia local (llama.cpp, Ollama y compatibles) sin necesidad de servidores con GPU de gran capacidad, manteniendo una licencia Apache 2.0 permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector multimodal (mmproj) sobre ViT de 318M parámetros (`inkling2v`) |
| Parametros totales | 318M (codificador ViT); tamaño del fichero: 185.642.432 bytes (177,0 MiB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (tensores 2D de atención/FFN y proyección); F32 (LayerNorm, LayerScale, biases, patch_embd, position_embd, class_embd, class_position_embd) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (mmproj-Inkling-2-Mini-Q4_0.gguf) |

## Arquitectura y entrenamiento

El artefacto es un proyector multimodal que acompaña a un codificador visual de tipo Vision Transformer de 318 millones de parámetros (`inkling2v`). La model card especifica que se han cuantizado a Q4_0 los 140 tensores 2D correspondientes a atención y FFN del ViT, así como los pesos de proyección; el resto de tensores (normalizaciones, biases y embeddings de parche, posición y clase) se conservan en F32 para preservar la estabilidad numérica. No se dispone de información sobre los datos de entrenamiento del proyector, el número de tokens utilizados, la composición del dataset ni si hubo fases de alineación (RLHF/DPO) en el modelo base.

El modelo base `thinkingmachines/Inkling-2-Mini` es del que procede este componente; la información disponible no detalla su arquitectura interna (transformer, MoE, híbrida), su ventana de contexto ni sus innovaciones técnicas (decodificación especulativa, atención lineal, etc.). La model card únicamente documenta el proceso de cuantización del proyector y el checksum SHA-256 del fichero (`3122e2d1a9dd9ad3183d93410f893603ef2eb4beb6fec7b68bc251649161da71`), que permite verificar la integridad de la descarga.

## Capacidades

- Habilitación de entrada visual: el proyector permite al modelo base `Inkling-2-Mini` procesar imágenes y combinarlas con texto en la misma secuencia de inferencia.
- Integración con llama.cpp y ecosistema GGUF: al estar en formato GGUF, es compatible con los runners que aceptan pares modelo + mmproj (llama.cpp, llama-server, Ollama y derivados).
- Cuantización eficiente: el uso de Q4_0 en los tensores 2D reduce el peso del proyector a 177 MiB, minimizando el impacto en VRAM frente a la versión F32.
- Generación de texto, razonamiento, código, matemáticas, tool calling y agentes: estas capacidades dependen del modelo base `Inkling-2-Mini`, no del proyector; no se dispone de documentación específica en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Descripción de imágenes en local: combinando este mmproj con los pesos GGUF del modelo base, se puede ejecutar un pipeline de image-to-text en una estación de trabajo sin GPU de datacenter, gracias al reducido tamaño del proyector (177 MiB).
- Asistencia visual en entornos con recursos limitados: el proyector Q4_0 permite añadir visión a un despliegue de llama.cpp ya existente sin recompilar ni cambiar de runtime, manteniendo el consumo de VRAM bajo.
- Procesamiento de documentos escaneados: extracción de información de capturas y PDFs renderizados a imagen, combinando el codificador ViT con el modelo base para tareas de OCR semántico o resumen de contenido visual.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios en una aplicación, usando el par modelo+mmproj en un servidor con llama-server.
- Prototipado de agentes multimodales: integración del proyector en un agente que recibe capturas de pantalla y decide acciones, aprovechando el soporte de tool calling del modelo base (si está disponible).
- Pruebas de integración continua de pipelines multimodales: verificación reproducible de que el par modelo+mmproj funciona en cada release, usando el checksum SHA-256 publicado para validar el artefacto.
- Evaluación comparativa de cuantizaciones: comparar la calidad de salida del proyector Q4_0 frente a la versión F32 en tareas de descripción de imágenes, para decidir el compromiso calidad/tamaño en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM del proyector: 177 MiB en Q4_0; la VRAM total dependerá del modelo base `Inkling-2-Mini` con el que se combine (no disponible en la información proporcionada).
- GPU recomendadas: no disponibles para el modelo base; el proyector por sí solo cabe en cualquier GPU consumer con más de 1 GB de VRAM libre.
- GPU consumer: el proyector cabe holgadamente en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con memoria unificada; el límite real lo impone el modelo base.
- Opciones de despliegue: llama.cpp, llama-server, Ollama y cualquier runtime compatible con el par modelo + mmproj en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-mmproj-GGUF (este) | 318M (ViT) | no disponible | Apache 2.0 | GGUF (Q4_0) | Hugging Face |
| Proyectores mmproj de LLaVA (p. ej. LLaVA-1.5) | ~300M (ViT CLIP) | no disponible | Apache 2.0 / variada | GGUF, safetensors | Hugging Face, llama.cpp |
| Proyectores mmproj de Qwen2-VL | ~675M (ViT) | no disponible | Apache 2.0 | GGUF, safetensors | Hugging Face, llama.cpp |

La comparación se limita al componente proyector; no se dispone de datos de rendimiento del modelo base `Inkling-2-Mini` para comparar calidad multimodal con LLaVA o Qwen2-VL.

## Limitaciones y advertencias

- Este repositorio contiene únicamente el proyector multimodal; no incluye los pesos del modelo de lenguaje. Sin el modelo base `thinkingmachines/Inkling-2-Mini` en GGUF, el artefacto no es funcional.
- La cuantización Q4_0 puede degradar la calidad de las representaciones visuales frente a F32; no se han publicado evaluaciones comparativas en la información disponible.
- No se dispone de información sobre sesgos, riesgo de alucinación, limitaciones de contexto ni cobertura idiomática del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `thinkingmachines/Inkling-2-Mini` antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto recién publicado sin validación comunitaria.
- Verificar el checksum SHA-256 publicado antes de usar el fichero en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Brechtpd/Inkling-2-Mini-mmproj-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
