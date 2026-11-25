# mradermacher/Nemotron-3.5-Bolt-E4B-Abliterated-i1-GGUF

## Resumen

Nemotron-3.5-Bolt-E4B-Abliterated-i1-GGUF es una cuantización GGUF del modelo monamoe/Nemotron-3.5-Bolt-E4B-Abliterated, publicada por mradermacher. El modelo base pertenece a la familia Nemotron 3.5 (variante Bolt E4B) y ha sido sometido a un proceso de "abliteration", una técnica de edición de pesos que elimina o atenúa los mecanismos de rechazo y alineación de seguridad del modelo original. Esta versión concreta es una recuantización con imatrix (importance matrix) que ofrece 16 variantes de cuantización entre Q2_K y Q6_K.

El repositorio tiene un tamaño de 77,4 GB e incluye pesos en formato GGUF, con un total de 7.518.069.290 parámetros en el modelo base (según safetensors). La model card indica que se trata de un modelo multimodal (visión), aunque los ficheros mmproj, si existen, se alojan en el repositorio estático hermano. La licencia declarada es openmdw-1.1.

La relevancia de esta ficha radica en que se trata de una variante sin censura de un modelo de tamaño medio (7,5 B de parámetros), pensada para despliegue local en hardware de consumo mediante llama.cpp y compatibles. No obstante, la información pública disponible es muy limitada: no se detallan arquitectura interna, contexto, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Nemotron 3.5, variante Bolt E4B; probable arquitectura transformer, no confirmado) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (el sufijo E4B sugiere posible arquitectura MoE, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más fichero imatrix |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. El nombre "Nemotron-3.5-Bolt-E4B" sugiere una variante de la familia Nemotron con posible arquitectura de mezcla de expertos (el sufijo E4B podría indicar expertos activos), pero esto no está confirmado en la model card. El tag "gemma4" sugiere algún tipo de relación o inspiración con la familia Gemma 4, sin más detalle.

El proceso de abliteration aplicado al modelo base elimina direcciones de activación asociadas al rechazo de peticiones, lo que altera el comportamiento de seguridad alineado original. La cuantización i1 de mradermacher utiliza matrices de importancia (imatrix) calculadas sobre el modelo, lo que mejora la calidad respecto a cuantizaciones estáticas de tamaño equivalente. No se especifican tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional en inglés, según el tag "conversational" del repositorio.
- Capacidad multimodal (visión) declarada en la model card, si bien los ficheros mmproj se alojan en el repositorio estático hermano.
- Comportamiento "abliterated": el modelo no aplica los mecanismos de rechazo del modelo base, por lo que responde a peticiones que el original declinaría.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado; no disponible información sobre otros idiomas.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente qué comportamientos se eliminan con la abliteration y cómo afecta a la calidad general, comparándolo con el modelo base original.
- Generación creativa sin restricciones: para escritura de ficción, guiones o contenido narrativo donde el modelo original podría rechazar temáticas sensibles; adecuado por su tamaño de 7,5 B, desplegable en local.
- Experimentación con cuantizaciones: las 16 variantes i1 permiten evaluar el compromiso calidad/tamaño en un mismo modelo, útil para investigar técnicas de cuantización con imatrix.
- Procesamiento de documentos con visión (si se descargan los ficheros mmproj): tareas de OCR o descripción de imágenes en local, aunque la información sobre esta capacidad es limitada.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (~5,4 GB) cabe en GPUs de 8 GB de VRAM, lo que permite ejecutar un modelo de 7,5 B en equipos domésticos mediante llama.cpp u Ollama.
- Evaluación comparativa de modelos sin censura: como referencia en estudios que miden la utilidad de modelos abliterated frente a sus versiones alineadas en tareas de razonamiento y generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - i1-Q2_K: ~4,5 GB de fichero; ~5-6 GB de VRAM con contexto moderado.
  - i1-Q4_K_M: ~5,4 GB de fichero; ~7-8 GB de VRAM.
  - i1-Q6_K: ~6,3 GB de fichero; ~8-9 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el extremo profesional, A100 o H100 para mayor throughput y contexto.
- Cabe en GPU de consumo: sí, desde GPUs de 8 GB con cuantizaciones Q4, y de 6 GB con Q2/Q3 (con contexto reducido).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y otros runners compatibles con GGUF; también vLLM si se convierte o se usa el modelo base en safetensors.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-Abliterated-i1-GGUF (este) | 7,5 B | no disponible | openmdw-1.1 | GGUF cuantizado | Variante abliterated, inglés, visión declarada |
| monamoe/Nemotron-3.5-Bolt-E4B-Abliterated | 7,5 B | no disponible | openmdw-1.1 | safetensors | Modelo base sin cuantizar del que deriva este |
| mradermacher/Nemotron-3.5-Bolt-E4B-Abliterated-GGUF | 7,5 B | no disponible | openmdw-1.1 | GGUF estático | Cuantizaciones estáticas (sin imatrix) del mismo modelo |

No se dispone de información sobre modelos comparables de otros autores con datos verificables de rendimiento en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido dañino, ofensivo o inseguro; no es apto para producción sin filtros externos.
- Riesgo elevado de alucinación y de respuestas incorrectas en temas sensibles, dado que la abliteration puede degradar la coherencia del modelo base.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Licencia openmdw-1.1: es necesario revisar los términos exactos del fichero LICENSE del repositorio antes de uso comercial; la model card remite a dicho fichero.
- Longitud de contexto no documentada: planificar el despliegue sin asumir una ventana concreta.
- Capacidad de visión declarada pero sin ficheros mmproj en este repositorio; hay que acudir al repositorio estático para obtenerlos.
- Información técnica muy escasa: no hay datos de entrenamiento, arquitectura detallada ni benchmarks, lo que dificulta evaluar su calidad objetiva.
- El tamaño del repositorio (77,4 GB) incluye todas las cuantizaciones; descargar solo la variante necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Nemotron-3.5-Bolt-E4B-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/monamoe/Nemotron-3.5-Bolt-E4B-Abliterated
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Nemotron-3.5-Bolt-E4B-Abliterated-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Nemotron-3.5-Bolt-E4B-Abliterated-i1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
