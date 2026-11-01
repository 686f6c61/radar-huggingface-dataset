# motchii709/Ornith-1.5-9B-heretic-GSQ-RCO-IQ3_M-GGUF

## Resumen

Ornith-1.5-9B-heretic-GSQ-RCO-IQ3_M es una cuantización comunitaria en formato GGUF del modelo Ornith-1.5-9B en su variante "heretic" (abliterada), publicada por el usuario motchii709 en HuggingFace. El modelo base original es ornith-ai/Ornith-1.5-9B, desarrollado por DeepReinforce AI (Ornith AI), y la versión abliterada fue creada por Thunder13240 mediante la herramienta Heretic, que elimina la alineación de seguridad del modelo mediante ablación direccional. Esta build concreta combina los pesos de la versión heretic de Thunder13240 (cuantizada desde un archivo Q8_0) con la tabla de asignación de tipos de cuantización por tensor extraída de la build IQ3_M de abenzerps, siguiendo el estilo "GSQ-RCO" popularizado por la investigación de ISTA-DASLab.

El resultado es un archivo de unos 4,25 GB con 427 tensores y arquitectura `qwen35` (lo que indica que Ornith-1.5-9B se basa en la familia Qwen 3.5), orientado a ejecución local con llama.cpp en hardware modesto. Es un modelo de generación de texto conversacional, bilingüe (inglés y japonés), con razonamiento por defecto en bloques `<think>` y soporte de entrada de imagen mediante un proyector de visión (mmproj) que se distribuye por separado. Su relevancia radica en ofrecer una versión sin guardarrails y muy comprimida (IQ3_M con matriz de importancia) para usuarios que necesitan el máximo rendimiento posible en GPUs o CPUs con poca memoria, aunque su uso conlleva responsabilidades éticas y legales significativas al tratarse de un modelo deliberadamente desalineado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (familia Qwen 3.5, con componentes SSM según los tensores `ssm_alpha`; hibrido transformer/SSM aparente, no confirmado oficialmente) |
| Parametros totales | 8.953.803.264 (≈ 8,95 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa 8192 tokens con llama-server; el máximo nativo no está documentado) |
| Tipos de cuantizacion | IQ3_M principal (asignación por tensor heredada del donante GSQ-RCO, con overrides a F32 en `ssm_alpha` y Q6_K en `attn_output` de bloques alternos); origen Q8_0 |
| Idiomas soportados | Inglés, japonés |
| Licencia | MIT |
| Formato de pesos | GGUF (con matriz de importancia imatrix incluida; mmproj de visión distribuido por separado) |

## Arquitectura y entrenamiento

El archivo GGUF declara arquitectura `qwen35`, lo que sitúa a Ornith-1.5-9B dentro de la familia de arquitecturas de Qwen 3.5. La presencia de tensores `ssm_alpha.weight` en los 32 bloques del modelo sugiere una arquitectura híbrida que incorpora componentes de espacio de estados (SSM) junto a la atención estándar, aunque la model card no lo detalla explícitamente. El modelo original incluye un bloque MTP (multi-token prediction) para decodificación especulativa, pero la conversión GGUF ascendente lo eliminó, por lo que esta build no puede usar `--spec-type draft-mtp` en llama.cpp.

Respecto al proceso de creación de esta cuantización: no es una recomputación GSQ/RCO desde cero, sino una transferencia de asignación. El autor extrajo los tipos de cuantización por tensor (274 tensores 2D) de la cabecera del GGUF IQ3_M donante de abenzerps, generó una matriz de importancia local con `llama-imatrix` usando un conjunto de calibración mixto (wikitext-2 en inglés más Wikipedia japonesa 20231101, 200 fragmentos de 512 tokens de contexto) y ejecutó `llama-quantize` con `--allow-requantize` sobre el archivo Q8_0 de los pesos heretic. El resultado coincide con el donante en 242 de 274 tensores; los 32 restantes fueron elevados a mayor precisión por el propio cuantizador (24 tensores `ssm_alpha` a F32 y 8 tensores `attn_output` a Q6_K), sin que ninguno se degradara, con un coste de aproximadamente un 1,3 % más de tamaño. No hay datos públicos sobre el preentrenamiento del modelo base (tokens, composición del dataset ni post-entrenamiento RLHF/DPO).

## Capacidades

- Generación de texto conversacional en inglés y japonés, verificada con pruebas de humo en ambos idiomas con salidas fluidas y coherentes.
- Razonamiento por defecto mediante bloques `<think>`, desactivable mediante los controles de razonamiento del runtime.
- Soporte de entrada de imagen (multimodalidad de visión) mediante el proyector mmproj, distribuido en el repositorio de Thunder13240 (no incluido en este archivo).
- Ejecución con llama.cpp (llama-cli y llama-server), con soporte de descarga completa a GPU (`-ngl 99`).
- Sin guardarrails ni rechazos: la abliteración upstream reporta 0/100 rechazos genuinos en su medición.
- No disponible en este archivo: decodificación especulativa vía MTP (los tensores nextn se perdieron en la conversión upstream).
- No hay información sobre tool calling, function calling ni capacidades de agente en la documentación disponible.

## Casos de uso

- Chatbot local sin filtros para investigación de alineación: permite estudiar el comportamiento de un modelo desalineado en un entorno controlado y aislado, gracias a su tamaño reducido (4,25 GB) que facilita su despliegue en sandboxes.
- Inferencia en GPUs de gama baja o portátiles: con unos 4,25 GB de pesos, cabe en GPUs con 6-8 GB de VRAM, lo que lo hace adecuado para experimentación local en hardware de consumo.
- Procesamiento de texto en japonés en local: el conjunto de calibración incluye Wikipedia japonesa específicamente para preservar la calidad en ese idioma tras la cuantización agresiva.
- Experimentación con cuantizaciones de precisión mixta: la inclusión del archivo `imatrix.gguf` y la documentación detallada de la asignación por tensor lo convierten en un buen caso de estudio para quien investiga técnicas de cuantización GSQ-RCO y transferencia de asignaciones.
- Asistente multimodal ligero: combinando este GGUF con el mmproj del repositorio de Thunder13240, se puede montar un asistente local con entrada de imágenes para descripción de imágenes o OCR básico.
- Pruebas comparativas de abliteración: al derivar de la build heretic de Thunder13240 (0/100 rechazos), sirve como sujeto de prueba para evaluar el impacto de la ablación direccional (método de Arditi et al. 2024) sobre la calidad de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclaman números de perplejidad ni benchmarks para este archivo concreto; la verificación se limitó a comparación de cabeceras GGUF y pruebas de humo con `llama-cli`.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 4,25 GB solo de pesos; con contexto de 8192 tokens y buffers, aproximadamente 5-6 GB de VRAM con descarga completa a GPU.
- Cabe cómodamente en GPUs de consumo con 6 GB o más: RTX 3060 de 6/12 GB, RTX 4060, RTX 4070 y superiores; también ejecutable parcial o totalmente en CPU dado el formato GGUF.
- GPU recomendadas: cualquier GPU moderna con 6-8 GB de VRAM basta; no se requieren A100 ni H100 para este tamaño cuantizado.
- Despliegue: llama.cpp es la vía principal (llama-cli para uso puntual, llama-server para servir con API); por ser GGUF es compatible indirectamente con Ollama, LM Studio y otros runtimes que consuman GGUF; no hay soporte documentado para vLLM o TGI con este formato.
- Latencia y throughput: no disponibles; la ausencia de tensores MTP impide la decodificación especulativa draft-mtp, lo que puede reducir el throughput respecto a builds que sí la incluyen.
- Parámetros de muestreo recomendados heredados de la model card upstream: temperature 0,6, top-p 0,95, top-k 20, repeat-penalty 1,05 (valor óptimo para esta familia; 1,0 puede provocar bucles y 1,1 truncamientos). La decodificación greedy no se recomienda.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-heretic-GSQ-RCO-IQ3_M (este) | 8,95 B | GGUF IQ3_M (4,25 GB) | no disponible | MIT | Abliterado, sin mmproj incluido, sin MTP |
| ornith-ai/Ornith-1.5-9B (base) | 8,95 B | no disponible (safetensors según dato de repo) | no disponible | MIT | Modelo original con alineación de seguridad intacta |
| Thunder13240/Ornith-1.5-9B-heretic-GGUF | 8,95 B | GGUF (Q8_0 y otras) | no disponible | MIT (siguiendo la base) | Misma variante heretic; distribuye el mmproj para visión |

No se incluyen modelos de otras familias en la comparativa porque la model card no aporta datos de rendimiento que permitan una comparación fundamentada y no inventar cifras.

## Limitaciones y advertencias

- Modelo abliterado sin guardarrails: la alineación de seguridad fue eliminada deliberadamente upstream (0/100 rechazos genuinos reportados). El usuario asume toda la responsabilidad legal y ética de su uso. No debe desplegarse en producción orientada a usuarios finales sin controles externos.
- Riesgo de alucinación elevado al tratarse de un modelo de 9B cuantizado a IQ3_M (≈3,4 bits efectivos por parámetro en la mayor parte de los tensores); no hay mediciones de perplejidad ni de degradación para este archivo concreto.
- Cuantización agresiva: la transferencia de asignación no reproduce exactamente al donante (32 tensores con override a mayor precisión); aunque el autor lo considera aceptable, el rendimiento puede diferir de otras builds IQ3_M.
- Idiomas limitados a inglés y japonés; el rendimiento en castellano u otros idiomas no está documentado y puede ser pobre.
- Sin tensores MTP/nextn: la decodificación especulativa draft-mtp de llama.cpp no está disponible con este archivo.
- El proyector de visión (mmproj) no está incluido; hay que descargarlo del repositorio de Thunder13240 para usar entrada de imagen.
- La decodificación greedy no se recomienda y repeat-penalty 1,0 puede provocar bucles; hay que ajustar el muestreo según la guía upstream.
- Licencia MIT en los pesos derivados del modelo base, pero la model card advierte que la licencia metadata del repositorio donante de abenzerps no pudo verificarse; si algún repositorio upstream declara términos distintos, prevalecen esos términos. Verificar antes de redistribuir.
- La longitud de contexto máxima nativa no está documentada en la información disponible.

## Enlaces

- Ficha del modelo (este GGUF): https://huggingface.co/motchii709/Ornith-1.5-9B-heretic-GSQ-RCO-IQ3_M-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Build heretic de origen (pesos y mmproj): https://huggingface.co/Thunder13240/Ornith-1.5-9B-heretic-GGUF
- Build donante de la asignación GSQ-RCO: https://huggingface.co/abenzerps/Ornith-1.5-9B-GSQ-RCO-GGUF
- Herramienta de abliteración Heretic (Philipp Emanuel Weidmann): https://github.com/p-e-w/heretic
