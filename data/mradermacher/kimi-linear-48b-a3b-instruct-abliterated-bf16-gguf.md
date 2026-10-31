# mradermacher/Kimi-Linear-48B-A3B-Instruct-abliterated-bf16-GGUF

## Resumen

Este repositorio contiene la cuantización en formato GGUF del modelo Kimi-Linear-48B-A3B-Instruct-abliterated-bf16, realizada por el usuario mradermacher. El modelo base es una versión "abliterated" (con los mecanismos de rechazo de instrucciones atenuados) de Kimi Linear 48B, un modelo instruido con arquitectura híbrida lineal y 49.122.681.728 parámetros totales, de los cuales aproximadamente 3.000 millones son activos por token según la nomenclatura A3B. El autor del modelo base es ashwin-sreedhar, que a su vez parte del modelo Kimi-Linear-48B-A3B-Instruct.

La relevancia de esta ficha reside en que ofrece el modelo en múltiples niveles de cuantización (desde Q2_K hasta Q8_0 y bf16), lo que permite ejecutarlo en hardware muy diverso, desde estaciones de trabajo con una sola GPU de gama alta hasta servidores multi-GPU. La licencia MIT del modelo base y de la cuantización permite su uso comercial sin restricciones, algo poco habitual en modelos de este tamaño.

Cabe destacar que se trata de un repositorio de cuantización experimental (etiqueta "experimental"), con cero descargas registradas en el momento de la ficha, por lo que conviene verificar la compatibilidad con la versión de llama.cpp o del runtime elegido antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (Kimi Linear); detalles exactos no disponibles en la ficha |
| Parametros totales | 49.122.681.728 (~49,1 B) |
| Parametros activos | ~3 B (deducido de la nomenclatura A3B; dato exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | inglés (según metadatos) |
| Licencia | MIT |
| Formato de pesos | GGUF (modelo base en bf16/safetensors) |

## Arquitectura y entrenamiento

El modelo base, Kimi-Linear-48B-A3B-Instruct, pertenece a la familia Kimi Linear, caracterizada por sustituir parte de la atención softmax tradicional por mecanismos de atención lineal, lo que reduce el coste computacional y de memoria en secuencias largas. La nomenclatura A3B indica un diseño de tipo mixture-of-experts con aproximadamente 3.000 millones de parámetros activos por token sobre un total de 49.100 millones, aunque la ficha original no detalla el número de expertos ni la configuración exacta.

Sobre el modelo base, ashwin-sreedhar publicó una versión "abliterated", es decir, un modelo al que se le han aplicado técnicas para eliminar los comportamientos de rechazo ante solicitudes sensibles, sin reentrenamiento completo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo original. La contribución de mradermacher se limita a la conversión y cuantización estática a GGUF en múltiples niveles de precisión, sin modificar los pesos más allá de la cuantización.

## Capacidades

- Generación de texto conversacional en inglés (pipeline conversational según metadatos).
- Seguimiento de instrucciones, al tratarse de una variante Instruct.
- Comportamiento sin rechazos de seguridad ("abliterated"), lo que elimina las negativas típicas de los modelos alineados.
- Capacidades de razonamiento, código, matemáticas o tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: los metadatos solo declaran inglés; no disponible información sobre otros idiomas.
- Capacidades multimodales (visión, audio): no disponible.

## Casos de uso

- Chatbots sin filtros de alineación para investigación: la versión abliterated permite estudiar el comportamiento del modelo sin los patrones de rechazo, útil en investigación de seguridad y red-teaming.
- Ejecución local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M (29,8 GB) o IQ4_XS (26,6 GB), el modelo puede cargarse en una GPU de 32-48 GB de VRAM o repartirse entre GPU y RAM.
- Experimentación con arquitecturas de atención lineal: desarrolladores que evalúen el rendimiento de modelos híbridos lineales frente a transformers clásicos pueden usar estos GGUF en llama.cpp.
- Procesamiento de instrucciones sensibles en entornos controlados: escritura creativa o generación de contenido que los modelos alineados suelen rechazar, siempre bajo responsabilidad del operador.
- Servidores de inferencia autoalojados: la licencia MIT permite integrar el modelo en productos comerciales sin coste de licencia ni restricciones de uso.
- Evaluación comparativa de cuantizaciones: con once niveles de cuantización disponibles, es un buen banco de pruebas para medir la degradación de calidad entre Q2_K y Q8_0 en un modelo MoE grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (sin contar el KV cache):
  - Q2_K: ~18,1 GB
  - Q3_K_M: ~23,6 GB
  - IQ4_XS: ~26,6 GB
  - Q4_K_M: ~29,8 GB
  - Q5_K_M: ~35,0 GB
  - Q6_K: ~40,5 GB
  - Q8_0: ~52,3 GB
  - bf16 (modelo base): ~98 GB
- GPU recomendadas: para Q4_K_M o inferiores, una RTX 4090 (24 GB) queda justa y requeriría descarga parcial a RAM; una RTX 5090 (32 GB), A100 40 GB o mejor una A100/H100 80 GB permiten ejecutar cuantizaciones medias y altas con margen para el contexto.
- Consumer GPUs: cabe en una RTX 4090 con Q2_K/Q3_K (con offload parcial), y cómodamente en GPUs de 32 GB (RTX 5090) con Q4_K_S/IQ4_XS. Las cuantizaciones Q6_K y superiores requieren 48 GB o más, o multi-GPU (2x RTX 3090/4090).
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, LM Studio y cualquier runtime compatible con GGUF. La compatibilidad con vLLM o TGI no está garantizada para esta cuantización GGUF, aunque el modelo base en safetensors podría servir mediante transformers.
- Latencia y throughput: no disponible. Al ser un MoE con ~3 B de parámetros activos, cabría esperar una generación rápida, pero no hay mediciones publicadas.
- Nota: la etiqueta "experimental" sugiere que el soporte de la arquitectura Kimi Linear en llama.cpp puede requerir una versión reciente del runtime.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kimi-Linear-48B-A3B-Instruct-abliterated (esta ficha) | 49,1 B | ~3 B | GGUF | MIT | Atención lineal, versión sin filtros |
| Qwen3-30B-A3B-Instruct | 30,5 B | ~3 B | safetensors/GGUF | Apache 2.0 | MoE denso en capacidades, amplio soporte de tooling |
| Kimi-K2-Instruct (1T-A32B) | ~1 T | ~32 B | safetensors/GGUF | Licencia modificada MIT | Misma familia, mucho mayor y más exigente de hardware |

La comparación se ofrece a título orientativo; los datos de rendimiento entre estos modelos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo abliterated, no rechazará solicitudes dañinas: su uso conlleva riesgos legales y éticos y debe restringirse a entornos controlados y a usuarios responsables.
- Los metadatos declaran solo inglés; el rendimiento en castellano u otros idiomas es desconocido y probablemente inferior.
- La etiqueta "experimental" y las 0 descargas indican que la conversión GGUF puede contener errores o requerir versiones muy recientes de llama.cpp.
- No hay información publicada sobre longitud de contexto efectiva, sesgos, tasa de alucinación ni benchmarks: cualquier evaluación debe hacerse internamente antes de producción.
- Las cuantizaciones bajas (Q2_K, Q3_K_S/M) degradan notablemente la calidad, especialmente en modelos MoE, según la propia documentación del cuantizador.
- La licencia MIT no impone restricciones comerciales, pero el modelo base abliterated procede de un tercero (ashwin-sreedhar), cuya cadena de modificación sobre el modelo original de Moonshot AI debería verificarse antes de un despliegue comercial.
- El repositorio pesa 333,8 GB; la descarga completa requiere espacio y ancho de banda significativos.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/mradermacher/Kimi-Linear-48B-A3B-Instruct-abliterated-bf16-GGUF
- Modelo base (abliterated, bf16): https://huggingface.co/ashwin-sreedhar/Kimi-Linear-48B-A3B-Instruct-abliterated-bf16
- Cuants weighted/imatrix: https://huggingface.co/mradermacher/Kimi-Linear-48B-A3B-Instruct-abliterated-bf16-i1-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#Kimi-Linear-48B-A3B-Instruct-abliterated-bf16-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
