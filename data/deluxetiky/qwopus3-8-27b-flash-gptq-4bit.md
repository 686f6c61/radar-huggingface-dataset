# deluxetiky/Qwopus3.8-27B-Flash-GPTQ-4bit

## Resumen

Qwopus3.8-27B-Flash-GPTQ-4bit es una cuantización GPTQ 4-bit del modelo Jackrong/Qwopus3.8-27B-Flash, un fine-tune de Qwen/Qwen3.8-27B, desarrollado por el usuario deluxetiky. El modelo original es un transformer denso multimodal de visión y lenguaje, diseñado para razonamiento complejo, uso de herramientas y agentes. Esta versión cuantizada utiliza el método FOEM (First-Order Error Matters) de ModelCloud, que compensa el error de cuantización en primeros órdenes, y está empaquetada para ejecutarse en vLLM con el kernel Marlin/GPTQ. Aporta un tamaño reducido (~20 GB de pesos) manteniendo una ventana de contexto de 262.144 tokens.

Relevancia: este checkpoint reduce los requisitos de VRAM de un modelo de 27.781 millones de parámetros y, según las mediciones del autor, mejora la velocidad de decodificación en un 64 % y el throughput agregado en un 159 % frente a la misma cuantización del modelo base, sin pérdida de corrección en tareas de código. Es una opción práctica para despliegues con 2 GPUs de consumo (RTX 5090) y para cargas de trabajo multimodales con tool calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión + texto) |
| Parámetros totales | 27.781.427.952 (~27,8 mil millones) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantización | GPTQ 4-bit con FOEM (FOEM + GPTAQ hybrid, group size 32, simétrico, desc_act false, lm_head sin cuantizar) |
| Idiomas soportados | Inglés, chino, español, ruso, japonés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors GPTQ int32-packed, compatible con vLLM (Marlin/GPTQ) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso nativo de visión-lenguaje que entiende imágenes y vídeo, con control flexible de pensamiento (thinking mode) y capacidad de llevar a cabo tareas complejas de varios pasos. Sobre él, Jackrong realizó un fine-tune denominado «Flash» orientado a la estabilidad del razonamiento. La cuantización aplicada por deluxetiky usa GPTQ 4-bit con FOEM, un método presentado en AAAI 2026, con calibración sobre 128 muestras del dataset C4. Los parámetros de cuantización son: grupo de 32, simétrico, desc_act desactivado, lm_head sin cuantizar, MSE 2.0, damp_percent 0.05, true_sequential activado y act_group_aware. El formato resultante es GPTQ empaquetado en int32 para el kernel Marlin/GPTQ de vLLM.

## Capacidades

- Generación de texto y razonamiento multi-step con modo de pensamiento (thinking mode) configurable.
- Comprensión de imágenes y vídeo (modelo multimodal nativo, pipeline image-text-to-text).
- Tool calling y function calling: soporte para auto tool choice con parser qwen3_xml en vLLM.
- Soporte de agentes: integración con flujos que requieren razonamiento multi-paso y uso de herramientas externas.
- Multilingüe en cinco idiomas: inglés, chino, español, ruso y japonés.
- Ventana de contexto larga de 262.144 tokens, adecuada para documentos extensos, historiales largos y planificación compleja.

## Casos de uso

- Atención al cliente multilingüe: gracias a su contexto de 262K, el modelo puede gestionar conversaciones largas con historial completo, interpretar imágenes adjuntas (capturas, facturas) y responder en español, inglés o ruso.
- Agentes de planificación y ejecución: al integrar tool calling y razonamiento multi-step, es útil para agentes que deben coordinar varias herramientas, consultar APIs y llevar tareas hasta completarse, como se cita en la suite de planificación de 6 tareas del README.
- Análisis de documentos y capturas: al ser multimodal, procesa documentos escaneados, diagramas y vídeos cortos para extraer información y razonar sobre el contenido.
- Generación y revisión de código en entornos de CI/CD: el modelo mantiene la corrección de código del base (83 % en 29 pruebas ejecutadas) y puede integrarse en pipelines que requieren tool calling para ejecutar pruebas o editar repositorios.
- Soporte técnico con contexto largo: puede ingerir logs extensos, manuales técnicos y conversaciones de soporte para diagnosticar incidentes en una sola pasada, aprovechando la ventana de 262K.
- Despliegue en producción con GPU de consumo: la cuantización 4-bit permite servir el modelo en 2× RTX 5090 con vLLM, manteniendo latencia baja para peticiones concurrentes (hasta 600 tok/s agregados).

## Benchmarks y rendimiento

No hay un model-index formal en la model card, pero el autor publicó una comparación A/B entre la cuantización del modelo base y la de Qwopus-Flash, usando el mismo stack (FOEM g32, 2× RTX 5090 TP2). Los resultados son los siguientes:

| Métrica | Qwen3.8 base | Qwopus-Flash | Ganancia |
|---|---|---|---|
| Decode a 1 stream | ~61 tok/s | ~99 tok/s | +64 % |
| Throughput agregado a 8 concurrentes | ~232 tok/s | ~600 tok/s | +159 % |
| Finalización de tareas largas (suite de 6 tareas, límite 3000 tokens) | 4/6 respondidas; 2 truncadas vacías | 4/6 respondidas incluidas salidas de 7.8k caracteres; 2 truncadas | completa mucho más |
| Corrección de código (6 tareas / 29 pruebas, ejecutadas) | 24/29 (83 %) | 24/29 (83 %) | empate |

Advertencia del autor: el A/B se ejecutó en dos cajas físicas distintas con el mismo hardware, por lo que las cifras absolutas de concurrencia deben revalidarse en hardware idéntico; la diferencia en la tasa de finalización está limitada por el tope de tokens y es independiente de la máquina.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada oficialmente. El repositorio ocupa 21.0 GB, con pesos de ~20 GB en 4-bit; a ello hay que sumar la cache KV (utilizada en fp8 en la validación) y el espacio de runtime. Para el contexto máximo de 262K se precisa una configuración con al menos 2 GPUs.
- GPU recomendadas: validado con 2× RTX 5090 en tensor parallel 2 (TP2) con vLLM 0.27.1, usando gpu-memory-utilization 0.92.
- Soporte en GPUs de consumo: sí, la validación se realizó en 2× RTX 5090; no hay datos para una sola GPU.
- Opciones de despliegue: vLLM 0.27.1 con backport GDN FlashInfer, kernel Marlin/GPTQ. No se indican opciones llama.cpp u Ollama en la información disponible.
- Latencia y throughput estimados: decodificación a ~99 tok/s en 1 stream y ~600 tok/s agregados con 8 peticiones concurrentes, según las mediciones A/B en 2× RTX 5090.

## Comparativa con modelos similares

La comparación más directa es con el modelo base Qwen3.8-27B, del cual deriva este checkpoint. En la tabla se incluyen también las variantes MLX de Shiftedx (mismo modelo, distinta cuantización), de las que no se dispone de datos de rendimiento.

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | ~27,8 mil millones | 262K (validado en derivados) | Denso multimodal | Apache-2.0 | Hugging Face |
| Jackrong/Qwopus3.8-27B-Flash (fine-tune) | ~27,8 mil millones | 262K | Denso multimodal + «Flash» | Apache-2.0 | Hugging Face |
| deluxetiky/Qwopus3.8-27B-Flash-GPTQ-4bit | 27.781.427.952 | 262K | Denso multimodal GPTQ 4-bit FOEM | Apache-2.0 | Hugging Face |
| Shiftedx/Qwopus3.8 27B Flash MLX quants | ~27,8 mil millones | no disponible | Denso multimodal MLX (MXFP4/MXFP8) | Apache-2.0 | Colección Hugging Face |

No se han publicado benchmarks comparativos adicionales con otras alternativas de 27B en la información disponible.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la model card; como todo modelo de lenguaje y visión, puede heredar sesgos de sus datos de entrenamiento y de base.
- Riesgo de alucinación: la cuantización puede introducir pequeñas degradaciones en la fidelidad en comparación con el modelo completo; el autor no publica pruebas exhaustivas de robustez.
- Limitaciones de idioma: solo cinco idiomas soportados oficialmente (en, zh, es, ru, ja); el rendimiento en otros idiomas no está garantizado.
- Limitaciones de contexto: el contexto de 262K está validado en una configuración con 2× RTX 5090 y KV cache en fp8; en hardware inferior habrá que reducir la ventana, con el riesgo de truncar tareas largas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el checkpoint es un derivado cuantizado; se debe preservar la atribución a los desarrolladores originales (Qwen Team y Jackrong).
- Advertencia de producción: el soporte de tool calling y el parser qwen3_xml deben probarse en la versión concreta de vLLM; las métricas A/B se midieron en cajas físicas distintas y la concurrencia absoluta puede variar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/deluxetiky/Qwopus3.8-27B-Flash-GPTQ-4bit
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Fine-tune Jackrong/Qwopus3.8-27B-Flash: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash
- Herramienta de cuantización GPTQModel: https://github.com/modelcloud/gptqmodel
- Colección de cuantizaciones MLX de Shiftedx: https://huggingface.co/collections/Shiftedx/qwopus38-27b-flash-mlx-quants
