# mradermacher/Sage-A1.5-Ablitrex-abliterated-BF16-GGUF

## Resumen

Sage-A1.5-Ablitrex-abliterated-BF16-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF del modelo mostwanted002/Sage-A1.5-Ablitrex-abliterated-BF16, publicado por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es una versión "abliterated" del modelo Sage-A1.5, es decir, una variante a la que se le han eliminado las capas de rechazo (refusals) mediante técnicas de abliteration, de modo que el modelo responde a prácticamente cualquier petición sin aplicar filtros de seguridad. Se trata de un modelo de 34,66 mil millones de parámetros, con licencia MIT y orientado a uso conversacional en inglés.

La relevancia de esta ficha no está tanto en el modelo base en sí, sino en el trabajo de cuantización: mradermacher ofrece once variantes que van desde Q2_K (13 GB) hasta Q8_0 (37 GB), lo que permite ejecutar un modelo de ~35B parámetros en hardware de consumo o en servidores modestos con llama.cpp, Ollama, LM Studio u otros runtimes compatibles con GGUF. Además, existen cuantizaciones weighted/imatrix en un repositorio complementario, que suelen ofrecer mejor calidad a igual tamaño de archivo.

Es importante subrayar que la versión abliterated elimina deliberadamente los mecanismos de rechazo del modelo original, por lo que este repositorio debe evaluarse con criterio: su utilidad principal es la investigación en alineación, red-teaming y control del comportamiento de modelos, no el despliegue en producción orientado a usuarios finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, derivado de Sage-A1.5) |
| Parametros totales | 34.660.610.688 (~34,66B) |
| Parametros activos | no disponible (solo aplicable a MoE; no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (más variantes weighted/imatrix en el repo -i1) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base está en BF16/safetensors) |

## Arquitectura y entrenamiento

El repositorio no modifica la arquitectura del modelo base: se limita a convertir los pesos BF16 de mostwanted002/Sage-A1.5-Ablitrex-abliterated-BF16 a GGUF con once niveles de cuantización estática de tipo k-quant (Q2_K a Q8_0) e IQ4_XS. Los detalles de la arquitectura del modelo base (número de capas, cabezas de atención, tamaño de contexto, etc.) no están documentados en la model card. El tamaño de 34,66B parámetros, confirmado por los metadatos de safetensors, sugiere un modelo denso de escala intermedia-alta.

Tampoco hay información sobre los datos de entrenamiento, el número de tokens, ni sobre el uso de RLHF o DPO en el modelo base. Lo único documentado es que se trata de una versión "abliterated", una técnica post-entrenamiento que identifica y neutraliza las direcciones de activación responsables de los rechazos, eliminando el comportamiento de negación sin reentrenar el modelo. El cuantizador, mradermacher, agradece a nethype GmbH el uso de sus servidores para realizar las conversiones.

## Capacidades

- Generación de texto conversacional en inglés, con el comportamiento de rechazo eliminado por abliteration.
- Ejecución local mediante runtimes compatibles con GGUF (llama.cpp, Ollama, LM Studio, KoboldCpp, etc.).
- once niveles de cuantización que permiten ajustar el equilibrio entre calidad y VRAM.
- Disponibilidad de cuantizaciones weighted/imatrix en el repositorio complementario -i1, con mejor calidad percibida a tamaños equivalentes.
- No hay información documentada sobre tool calling, capacidades de agentes, visión, audio ni razonamiento paso a paso (thinking mode): no disponible.

## Casos de uso

- Investigación en abliteration y alineación: permite estudiar en local, con cuantizaciones ligeras (Q2_K a Q4_K), cómo afecta la eliminación de capas de rechazo al comportamiento general de un modelo de 34B parámetros.
- Red-teaming y evaluación de seguridad: útil para equipos que necesitan probar defensas, filtros externos y clasificadores contra un modelo sin rechazos internos, simulando el peor caso de un modelo desalineado.
- Experimentación con cuantizaciones GGUF: los once niveles disponibles hacen de este repo un banco de pruebas práctico para comparar la degradación de calidad entre Q2_K y Q8_0 en un mismo modelo de gran tamaño.
- Escritura creativa sin restricciones: autores de ficción que necesitan un modelo local que no interrumpa narraciones con contenido maduro pueden usar las variantes Q4_K_M o Q6_K en una GPU de gama alta.
- Pruebas de rendimiento en hardware de consumo: con la variante Q2_K (13 GB) se puede evaluar la velocidad de inferencia de un modelo de 35B en GPUs de 16 GB o incluso en configuraciones con descarga parcial a CPU.
- Desarrollo y depuración de pipelines con llama.cpp: al ser GGUF estándar, se integra fácilmente en servidores locales tipo llama.cpp server o en herramientas como Ollama para prototipado de aplicaciones conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un gráfico genérico de comparación de perplejidad entre tipos de cuantización (elaborado por ikawrakow), sin métricas específicas del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más margen para el KV cache y el contexto. Referencias por variante: Q2_K ~13 GB, Q3_K_M ~17 GB, IQ4_XS ~19 GB, Q4_K_M ~21 GB, Q5_K_M ~25 GB, Q6_K ~29 GB, Q8_0 ~37 GB.
- GPU recomendadas: para Q4_K_M o superior, una RTX 3090/4090 (24 GB) queda justa y requerirá contexto reducido o offload parcial a CPU; con 2x RTX 3090/4090 o una A100 40 GB se ejecutan cómodamente Q5_K_M y Q6_K; Q8_0 requiere ~40 GB (A100 40/80 GB, H100 o multi-GPU).
- Cabe en consumer GPU: sí, en variantes bajas. Q2_K y Q3_K_S caben en una RTX 4080/4090 de 16-24 GB; IQ4_XS y Q4_K_S/M son viables en 24 GB con contexto moderado.
- Opciones de despliegue: llama.cpp (origen del formato), Ollama, LM Studio, KoboldCpp, GPT4All y cualquier runtime compatible con GGUF. No está orientado a vLLM o TGI, que requieren formatos como safetensors.
- Latencia y throughput: no disponible; en un modelo denso de 34B, con Q4_K_M en una RTX 4090 cabe esperar del orden de 10-20 tokens/s con offload completo, aunque es una estimación no confirmada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| Sage-A1.5-Ablitrex-abliterated-BF16-GGUF | 34,66B | GGUF (Q2_K a Q8_0) | MIT | Versión abliterated, sin rechazos |
| Llama 3.1 8B Instruct (abliterated, p.ej. failsafe/Llama-3.1-8B-Abliterated) | 8B | safetensors/GGUF | Llama 3.1 Community | Mucho más ligero, cabe en GPUs de 8-12 GB |
| Dolphin 3.0 (basado en Qwen2.5 u otros) | 7B-72B según variante | safetensors/GGUF | Apache 2.0/MIT según base | Desalineado por fine-tuning, no por abliteration |

La alternativa más cercana en filosofía son los modelos Dolphin, que logran un comportamiento sin rechazos mediante fine-tuning (más estable que la abliteration), mientras que la abliteration preserva los pesos originales pero puede degradar la coherencia general. La elección de 34B sitúa a este modelo en la gama media-alta, por encima de los 7-9B típicos de consumo y por debajo de los 70B+.

## Limitaciones y advertencias

- Al ser una versión abliterated, el modelo no rechazará peticiones dañinas: su uso conlleva riesgos legales y éticos significativos y no debe exponerse a usuarios finales sin capas de seguridad externas.
- La abliteration puede degradar la calidad general del texto (coherencia, precisión factual) respecto al modelo base original; no hay evaluaciones publicadas que cuantifiquen esa degradación.
- Solo se declara soporte para inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- La longitud de contexto no está documentada en la model card, lo que dificulta planificar aplicaciones con documentos largos.
- No hay benchmarks publicados del modelo base ni de las cuantizaciones, por lo que su nivel de calidad es desconocido.
- Las cuantizaciones más agresivas (Q2_K, Q3_K_M) presentan pérdida de calidad notable, como advierte el propio cuantizador en la tabla de archivos.
- La licencia MIT es muy permisiva, incluido el uso comercial, pero esto no exime de responsabilidad sobre el contenido generado.
- El repositorio tiene adopción muy reducida (762 descargas y 1 like en el momento de la ficha), sin comunidad ni historial de errores que respalde su fiabilidad en producción.

## Enlaces

- Repositorio GGUF estático: https://huggingface.co/mradermacher/Sage-A1.5-Ablitrex-abliterated-BF16-GGUF
- Modelo base (BF16): https://huggingface.co/mostwanted002/Sage-A1.5-Ablitrex-abliterated-BF16
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Sage-A1.5-Ablitrex-abliterated-BF16-i1-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Sage-A1.5-Ablitrex-abliterated-BF16-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Web de nethype GmbH: https://www.nethype.de/
