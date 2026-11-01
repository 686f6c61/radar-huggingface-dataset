# BoldingBuilds/Wildcat

## Resumen

Wildcat es un modelo de decisión derivado de vllm-sr/d3-ultra (27B, familia Qwen3.5) desarrollado por BoldingBuilds. No es un modelo generativo de propósito general: responde preguntas de decisión (elegir una opción entre varias, sí/no, puntuar en una escala) y devuelve una probabilidad para cada respuesta. Su interés radica en que comprime un modelo de 27B en bf16 (unos 54 GB) hasta aproximadamente 13,19 GiB de VRAM mediante cuantización de 3 bits con HQQ, lo que permite ejecutarlo en una única GPU de 24 GB.

La construcción sigue un proceso de tres fases: compresión de las capas lineales de texto a 3 bits (grupo 64, códigos empaquetados en un plano de 2 bits y otro de 1 bit, desempaquetados por un kernel Triton justo antes de cada matmul), reparación mediante dos adaptadores LoRA de rango 32 (dos semillas, promediados) entrenados para imitar las distribuciones de probabilidad de tres profesores (d3-ultra, Jeffan y Fastino GLiDE), y mezcla de ambos adaptadores a media intensidad.

En el índice público Decision Index 0.3 obtiene 70,66 frente a los 71,57 de d3-ultra, es decir, 0,9 puntos por debajo del modelo original con una cuarta parte de la memoria. La merma se concentra en razonamiento multi-paso y conocimiento difícil; en tareas de lenguaje y clasificación el LoRA de reparación incluso mejora al modelo base en algunos conjuntos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), con torre de visión; capas lineales de texto cuantizadas a 3 bits HQQ |
| Parámetros totales | 27B (heredados de d3-ultra) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 3 bits HQQ (group size 64) en 400 capas lineales de texto; resto en bf16; empaquetado en plano de 2 bits + plano de 1 bit |
| Idiomas soportados | no disponible |
| Licencia | Fastino Community License (modelo derivado de Fastino GLiDE); pesos base de d3-ultra y runtime Apache-2.0; Qwen Apache-2.0 |
| Formato de pesos | safetensors (`q3.safetensors`, `model-rest.safetensors`, `lora.safetensors`, `readout.safetensors`), con código Python propio (`d3_q3.py`) y manifiesto SHA-256 |

## Arquitectura y entrenamiento

Wildcat parte de d3-ultra, un transformer de 27B de la familia Qwen3.5 con torre de visión. La modificación principal afecta a 400 capas lineales de texto, cuantizadas a 3 bits con HQQ (grupo 64). Las torres de visión, embeddings, normas y las proyecciones pequeñas `in_proj_a`/`in_proj_b` permanecen en bf16. Los códigos de 3 bits se almacenan empaquetados y un kernel Triton los desempaqueta por capa antes de cada matmul, con resultado bit a bit idéntico al dequantize nativo de HQQ. En GPUs de más de 72 GB el motor desempaqueta a bf16 y fusiona el LoRA para acelerar la inferencia.

El entrenamiento de reparación consiste en un LoRA de rango 32 entrenado sobre el modelo de 3 bits congelado para reproducir las probabilidades de respuesta de tres profesores: d3-ultra, Jeffan y Fastino GLiDE. Las preguntas de entrenamiento provienen exclusivamente de splits públicos de entrenamiento de datasets con licencias permisivas, verificadas contra el Decision Index para descartar filtraciones; no se usó ningún dato del Decision Index. Finalmente se promedian dos ejecuciones con semillas distintas, cada adaptador a media intensidad. No se documentan en la información disponible el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Clasificación zero-shot: selección de una opción entre varias, preguntas de sí/no y puntuación en escala, con probabilidad asociada a cada respuesta.
- Clasificación y recuperación: buen rendimiento en tareas de retrieval y clasificación (71,9 en el índice público, ligeramente por encima de d3-ultra).
- Herramientas y automatización: 87,2 en el índice público, la categoría más fuerte del modelo.
- Comprensión del lenguaje: 73,7 en el índice público, por encima de d3-ultra (72,4) gracias al LoRA de reparación.
- Soporte multimodal parcial: hereda la torre de visión de d3-ultra, pero las tareas de localización de imagen y vídeo (Box y Track) no se midieron y se espera que sean más débiles.
- Razonamiento multi-paso y conocimiento difícil: capacidad presente pero degradada entre 3 y 10 puntos respecto a d3-ultra en conjuntos como MuSR, GPQA Diamond, CRUXEval, MMLU-Pro y GSM8K.
- No se documenta soporte de tool calling genérico, agentes o modo thinking más allá de lo heredado de d3-ultra.

## Casos de uso

- Enrutamiento de consultas en pipelines RAG: el modelo puede clasificar cada consulta entrante (por ejemplo, decidir si requiere búsqueda, cálculo o respuesta directa) devolviendo una probabilidad por opción, lo que permite umbrales de confianza ajustables en el orquestador.
- Moderación y filtrado de contenido: formulación de preguntas sí/no con probabilidad asociada para decidir si un texto cumple una política, ejecutable en una sola GPU de 24 GB.
- Clasificación zero-shot de documentos: asignación de categorías sin entrenamiento específico, aprovechando su rendimiento en retrieval y clasificación (71,9 en el índice público).
- Automatización de decisiones en herramientas: su categoría más fuerte (87,2) lo hace adecuado para elegir qué herramienta o acción invocar en flujos de automatización, dado un conjunto de opciones.
- Evaluación de calidad y preferencias: puntuación en escala de respuestas generadas por otros modelos, útil como juez ligero en pipelines de evaluación que no caben en GPUs de gran memoria.
- Despliegue en hardware de gama alta de consumo: al cargar en unos 13,19 GiB, permite prototipar y servir un modelo de 27B en una RTX 3090 o similar, algo inviable con d3-ultra en bf16 (unos 54 GB).
- Investigación sobre cuantización extrema: su diseño (HQQ 3 bits más LoRA de reparación con profesores) sirve como referencia reproducible para estudiar la pérdida de capacidad según la compresión.

## Benchmarks y rendimiento

Índice público Decision Index 0.3 (ejecución completa, 140.620 peticiones, una RTX PRO 6000):

| Área (índice público) | Wildcat | d3-ultra (board) |
|---|---|---|
| Knowledge & reasoning | 58,9 | 62,3 |
| Language understanding | 73,7 | 72,4 |
| Retrieval & classification | 71,9 | 71,8 |
| Tools & automation | 87,2 | 87,8 |
| Arts & human taste | 60,7 | 63,5 |
| **Index** | **70,66** | **71,57** |

Diferencias por conjunto: MuSR, GPQA Diamond, CRUXEval, MMLU-Pro y GSM8K entre 3 y 10 puntos por debajo de d3-ultra. Ganancias del LoRA de reparación: iSarcasmEval +8,7 y FinEntity +2,7.

Latencia (ejecución completa en una RTX PRO 6000, en proceso, una petición a la vez): mediana de 157 ms y p80 de 351 ms por petición; media de 1.258 ms debido a unas 1.000 peticiones ToolRet muy largas que tardan minutos cada una; sin ToolRet la media es de 438 ms. En 750 filas muestreadas medidas del mismo modo, Wildcat y d3-ultra quedaron a la par (media 818 vs 932 ms).

## Requisitos de hardware

- VRAM: 13,19 GiB cargado; descarga de 13,6 GiB. Requiere GPU NVIDIA con 24 GB o más.
- GPU recomendadas: RTX 3090 (probado), RTX 4090, RTX PRO 6000; en tarjetas de más de 72 GB el motor desempaqueta a bf16 y fusiona el LoRA para mayor velocidad.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB (3090, 4090). En tarjetas de menos de 40 GB responde una pregunta a la vez (batch size 1) para acomodar peticiones con muchas preguntas largas.
- Despliegue: kit Decision Index con el motor propio `d3_q3:D3Q3Engine`; requiere `transformers`, `triton` y `accelerate`, más las dependencias de `requirements.txt`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 157 ms y p80 de 351 ms por petición en RTX PRO 6000; sin las peticiones largas de ToolRet, media de 438 ms. No se documenta throughput agregado.
- AMD: no probado; el kernel empaquetado es Triton y solo se ejecutó en CUDA/NVIDIA.

## Comparativa con modelos similares

| Modelo | Parámetros | Memoria de inferencia | Índice público | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wildcat | 27B (3 bits HQQ) | ~13,19 GiB | 70,66 | Fastino Community License | HuggingFace |
| d3-ultra | 27B (bf16) | ~54 GB | 71,57 | Apache-2.0 (pesos y runtime) | HuggingFace |
| Fastino GLiDE | no disponible | no disponible | no disponible | Fastino Community License | HuggingFace |
| Jeffan | no disponible | no disponible | no disponible | no disponible | HuggingFace |

Wildcat es la alternativa de bajo consumo de memoria de d3-ultra, con una pérdida de 0,9 puntos en el índice público y ganancias en lenguaje y clasificación. Fastino GLiDE y Jeffan se usaron como profesores en el entrenamiento, pero no se dispone de sus especificaciones ni resultados en la información proporcionada.

## Limitaciones y advertencias

- Degradación medible en razonamiento multi-paso y conocimiento difícil: entre 3 y 10 puntos por debajo de d3-ultra en MuSR, GPQA Diamond, CRUXEval, MMLU-Pro y GSM8K.
- Tareas de localización de imagen y vídeo (Box y Track) no evaluadas; se espera un rendimiento inferior al de d3-ultra.
- Sin probar en GPUs AMD; el kernel Triton solo se validó en NVIDIA CUDA.
- Riesgo de alucinación en las probabilidades devueltas: el modelo imita distribuciones de probabilidad de profesores, no está calibrado de forma independiente según la información disponible.
- Sesgos: no documentados en la información proporcionada; al entrenarse con splits públicos de datasets permisivos, puede heredar sesgos de esos datos.
- Idiomas soportados no especificados.
- Licencia: uso libre, modificación y distribución manteniendo la licencia. El uso comercial exige mostrar "Built with Fastino GLiDE" en documentación, página about o UI. Empresas con más de 10 millones de dólares de ingresos anuales que lo usen en producción necesitan un acuerdo separado con Fastino (hello@fastino.ai); evaluación, pruebas, benchmarking e investigación no cuentan como producción.
- En tarjetas de menos de 40 GB opera con batch size 1, lo que limita el throughput en despliegues con concurrencia.
- Peticiones muy largas pueden caer en una ruta más lenta que, aun así, las responde; la media de latencia se dispara con cargas tipo ToolRet.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BoldingBuilds/Wildcat
- Modelo base d3-ultra: https://huggingface.co/vllm-sr/d3-ultra
- Profesor Fastino GLiDE: https://huggingface.co/fastino/GLiDE
- Profesor Jeffan: https://huggingface.co/tattrongvu
- Licencia Fastino Community License: https://huggingface.co/BoldingBuilds/Wildcat/blob/main/LICENSES/FASTINO-LICENSE.txt
