# dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-GGUF

## Resumen

Dongfangshuo-Qwen3.8-27B-NSFW-GGUF es una cuantización en formato GGUF del modelo Dongfangshuo-Qwen3.8-27B-NSFW, un ajuste fino de la familia Qwen 3.8 orientado a contenido para adultos (R-18) y a la elusión de los mecanismos de rechazo del modelo original. El autor, dongfangshuo, parte de la variante abliterated de Huihui-Qwen3.8-27B y la especializa en estilo narrativo explícito en chino. El repositorio incluye además un proyector multimodal (`mmproj`) que habilita el procesamiento de imágenes y vídeo, y un `Modelfile` para ejecución directa en Ollama.

El modelo cuenta con 27.320.697.856 parámetros totales (27,3 mil millones) y se distribuye principalmente como un único archivo Q4_K_M de 16,8 GB, junto con el proyector visual en f16 de 931 MB. La licencia declarada es Apache 2.0 y el único idioma indicado en la model card es el chino (zh). El pipeline declarado es text-generation, aunque las etiquetas del repositorio incluyen vision y multimodal.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso muy específico de la familia Qwen (fine-tuning sobre una base abliterated con fines creativos adultos); por otro, sirve como advertencia práctica sobre las implicaciones de desplegar modelos con filtros de seguridad eliminados, contenido no apto para todos los públicos y licencias que no cubren responsabilidades derivadas del uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen 3.8 (detalles de capas y attention no disponibles) |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en f16 |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) y mmproj GGUF (f16) |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un transformer multimodal de 27,3 mil millones de parámetros, derivado de Huihui-Qwen3.8-27B-abliterated, es decir, de una variante a la que se han eliminado (ablated) las direcciones de activación asociadas al rechazo de peticiones. Sobre esa base, el autor aplicó un ajuste fino orientado a estilo narrativo R-18 en chino, con el objetivo declarado de aumentar la obediencia a instrucciones explícitas y la capacidad de desarrollar tramas adultas.

El repositorio incluye un proyector multimodal (`mmproj-Dongfangshuo-Qwen3.8-27B-NSFW-f16.gguf`, 931 MB) que se carga junto al modelo principal en llama.cpp o LM Studio para habilitar entrada de imágenes y vídeo. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se emplearon técnicas de RLHF, DPO o preferencias. Tampoco se documentan innovaciones técnicas propias (atención lineal, decodificación especulativa, etc.). La model card menciona que la versión v2.0 del proyecto corrige problemas de "colapso de autoatención en textos muy largos" y repetición infinita, lo que sugiere que la v1.0 aquí documentada presenta esas limitaciones.

## Capacidades

- Generación de texto conversacional en chino, con especialización en narrativa adulta explícita y desarrollo de tramas R-18.
- Procesamiento multimodal de imágenes y vídeo mediante el proyector `mmproj` (descripción de escenas, interpretación de contenido visual).
- Alta obediencia a instrucciones explícitas gracias al proceso de abliteration y al ajuste fino posterior.
- Ejecución local mediante Ollama, LM Studio y llama.cpp, con `Modelfile` incluido.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking ni audio.

## Casos de uso

- Escritura creativa de ficción adulta en chino: el modelo está ajustado específicamente para generar narrativa R-18 con vocabulario explícito y progresión de tramas, por lo que resulta adecuado para autores que necesiten borradores o continuación de relatos en ese registro.
- Generación local sin conexión: al distribuirse en GGUF Q4_K_M (16,8 GB), puede ejecutarse en equipos de gama alta con GPU consumer, lo que permite trabajar con contenido sensible sin enviar prompts a servicios en la nube.
- Análisis de imágenes y vídeo en contexto narrativo: con el proyector mmproj cargado, el modelo puede describir escenas visuales y incorporarlas a relatos o guiones, útil para guionistas que trabajen a partir de material audiovisual.
- Experimentación con modelos abliterated: investigadores interesados en medir el efecto de la eliminación de direcciones de rechazo pueden usar este modelo como referencia de comportamiento frente a la base Qwen original.
- Prototipado rápido en Ollama: el `Modelfile` incluido permite crear y ejecutar el modelo con dos comandos, lo que agiliza pruebas de prompting y evaluación cualitativa.
- Documentación de casos límite de seguridad: equipos de evaluación de riesgos pueden emplear este modelo para estudiar cómo se comportan sistemas sin filtros de rechazo y diseñar mitigaciones en sus propios despliegues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17-19 GB con Q4_K_M (16,8 GB de pesos) más el proyector f16 (931 MB) y el contexto; se recomienda reservar 20-24 GB para margen.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB; en GPUs de 16 GB no cabe el modelo completo y requeriría offloading parcial a CPU.
- Cabe en GPU consumer de gama alta (24 GB) con cuantización Q4_K_M; en tarjetas de 12-16 GB solo con offloading y latencia degradada.
- Opciones de despliegue: Ollama (vía `Modelfile`), llama.cpp, LM Studio; no se documenta compatibilidad con vLLM o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Dongfangshuo-Qwen3.8-27B-NSFW-GGUF | 27,3 mil millones | No disponible | zh | Apache 2.0 | GGUF Q4_K_M | Fine-tuning R-18 sobre base abliterated; incluye mmproj |
| Huihui-Qwen3.8-27B-abliterated | 27,3 mil millones (presumible) | No disponible | No disponible | No disponible | No disponible | Base abliterated sin especialización R-18 |
| Dongfangshuo-Qwen3.8-27B-NSFW-v2-GGUF | No disponible | No disponible | zh | Apache 2.0 (presumible) | GGUF | Versión v2.0 con corrección de repetición y autoatención en textos largos |

## Limitaciones y advertencias

- Contenido no apto para todos los públicos: el modelo está entrenado para generar material sexual explícito y el repositorio lleva la etiqueta `not-for-all-auciences`.
- Filtros de seguridad eliminados: al derivar de una base abliterated, el modelo carece de mecanismos fiables de rechazo, lo que aumenta el riesgo de outputs dañinos, ilegales o no consentidos si se usa sin salvaguardas externas.
- Sesgos: no se documentan análisis de sesgos; el entrenamiento exclusivamente en chino y sobre narrativa adulta puede amplificar estereotipos de género y representaciones problemáticas.
- Alucinación: no hay datos de evaluación; en tareas factuales o de razonamiento el modelo no está validado y su fiabilidad es desconocida.
- Limitaciones de contexto e idioma: solo se declara chino; no se especifica la ventana de contexto, y la model card reconoce problemas de repetición y colapso en textos muy largos en la v1.0.
- Licencia: Apache 2.0 permite uso comercial, pero no exime al desplegador de responsabilidad legal sobre el contenido generado ni sobre el cumplimiento de normativas locales.
- Producción: no se recomienda su uso en entornos de atención al cliente, educación o cualquier aplicación pública sin moderación adicional y sin revisión de cumplimiento normativo.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-GGUF
- Modelo base (no cuantizado): https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW
- Versión v2.0 (GGUF): https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v2-GGUF
- Base abliterated de referencia (mencionada en la model card): Huihui-Qwen3.8-27B-abliterated (sin URL directa en la información disponible)
