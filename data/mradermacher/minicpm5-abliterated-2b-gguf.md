# mradermacher/MiniCPM5-abliterated-2B-GGUF

## Resumen

MiniCPM5-abliterated-2B-GGUF es la versión cuantizada en formato GGUF del modelo SonGT1/MiniCPM5-abliterated-2B, una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas mediante la técnica de abliteration) del modelo MiniCPM5 de 2B parámetros. El autor de esta conversión es mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face, que distribuye los pesos listos para su uso con llama.cpp y otros motores compatibles con GGUF.

El modelo base pertenece a la familia MiniCPM5, desarrollada por OpenBMB (ModelBest y Universidad de Tsinghua), orientada a modelos compactos de alto rendimiento para despliegue en dispositivos con recursos limitados. La variante abliterated elimina la alineación de seguridad del modelo original, lo que lo hace adecuado para investigación sobre comportamiento de modelos sin censura, pero inadecuado para aplicaciones de producción que requieran filtros de seguridad.

Con 2.516.756.480 parámetros (~2,5B) y un tamaño de repositorio de 22,8 GB (que incluye todas las cuantizaciones), este modelo ofrece un equilibrio entre capacidad y eficiencia. Está disponible bajo licencia Apache 2.0, lo que permite uso comercial, y soporta los idiomas chino e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (MiniCPM5) |
| Parámetros totales | 2.516.756.480 (~2,5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base SonGT1/MiniCPM5-abliterated-2B deriva de la arquitectura MiniCPM5 de OpenBMB, un transformer decoder-only optimizado para eficiencia en dispositivos edge. La variante "abliterated" se ha obtenido mediante la técnica de abliteration, que identifica y elimina las direcciones en el espacio de activaciones responsables del comportamiento de rechazo, produciendo un modelo que responde a solicitudes que el modelo original rechazaría.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base, ya que la model card proporcionada corresponde únicamente a la cuantización GGUF y no incluye esos detalles. La cuantización fue realizada por mradermacher con quantize_version 2 y output_tensor_quantised 1, usando conversión desde formato HF.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Razonamiento general y respuesta a instrucciones sin las restricciones de seguridad del modelo original (comportamiento "uncensored").
- Capacidad de mantener conversaciones multi-turno (pipeline conversacional).
- Compatible con el ecosistema transformers y con motores de inferencia GGUF (llama.cpp, Ollama, etc.).
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües limitadas a chino e inglés.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteration afecta al comportamiento del modelo en comparación con el original, útil para investigadores que analizan mecanismos de rechazo.
- Generación creativa sin filtros: escritura de ficción, guiones o contenido narrativo que requiera explorar temas que los modelos alineados rechazarían, en entornos controlados de investigación.
- Despliegue en dispositivos de bajos recursos: con cuantizaciones Q4_K_S (1,6 GB) o Q4_K_M (1,7 GB), el modelo cabe en GPUs consumer modestas o incluso en CPU, permitiendo prototipado rápido en portátiles.
- Experimentación con GGUF y llama.cpp: sirve como banco de pruebas para pipelines de inferencia local, comparación de cuantizaciones y medición de latencia en hardware limitado.
- Análisis de sesgos y comportamientos no deseados: al carecer de alineación, es útil para documentar qué tipo de contenido genera un modelo sin salvaguardas, como paso previo al diseño de filtros.
- Traducción y conversación zh-en: para tareas de procesamiento de lenguaje natural entre chino e inglés en entornos de investigación donde no se requieran garantías de seguridad.
- Fine-tuning posterior: al estar bajo Apache 2.0 y en formato GGUF/safetensors, puede servir como base para ajuste fino en tareas específicas de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB (Q2_K), 1,6-1,7 GB (Q4_K_S/Q4_K_M), 2,2 GB (Q6_K), 2,8 GB (Q8_0) y 5,1 GB (f16), sin contar el overhead del contexto y del motor de inferencia.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. También puede ejecutarse en CPU.
- Cabe en GPUs consumer: sí, en la práctica totalidad de GPUs consumer modernas, e incluso en sistemas integrados con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier motor compatible con GGUF. El modelo base en safetensors puede usarse con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-abliterated-2B-GGUF (este) | ~2,5B | no disponible | Apache 2.0 | GGUF | Variante sin censura, zh/en |
| MiniCPM5-2B (original) | ~2,5B | no disponible | no disponible | safetensors/GGUF | Modelo alineado de referencia |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32K (típico) | Apache 2.0 | safetensors/GGUF | Alternativa compacta multilingüe |
| Llama-3.2-1B-Instruct | ~1,2B | 128K | Llama 3.2 Community | safetensors/GGUF | Alternativa compacta en inglés |

La comparación con Qwen2.5 y Llama-3.2 se ofrece como referencia de categoría (modelos compactos de 1-3B); los datos de contexto y rendimiento de esos modelos no se han verificado en la información proporcionada y pueden variar.

## Limitaciones y advertencias

- El modelo ha sido sometido a abliteration, lo que elimina las salvaguardas de seguridad: puede generar contenido dañino, ofensivo o inexacto sin rechazo. No es apto para producción orientada al usuario final sin filtros adicionales.
- Riesgo elevado de alucinación, especialmente en un modelo de solo 2,5B parámetros.
- Soporte limitado a chino e inglés; no se garantiza un buen rendimiento en castellano u otros idiomas.
- Longitud de contexto no documentada; puede ser insuficiente para tareas de contexto largo.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el uso comercial de un modelo sin alineación conlleva riesgos legales y reputacionales según la jurisdicción y el caso de uso.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) degradan la calidad; se recomienda Q4_K_M o superior para uso real.
- No hay información sobre sesgos específicos del modelo base ni sobre su proceso de entrenamiento.
- El repositorio tiene 0 likes y 499 descargas en el momento de la consulta, lo que indica una adopción limitada y poca validación comunitaria.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/mradermacher/MiniCPM5-abliterated-2B-GGUF
- Modelo base: https://huggingface.co/SonGT1/MiniCPM5-abliterated-2B
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/MiniCPM5-abliterated-2B-i1-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#MiniCPM5-abliterated-2B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
