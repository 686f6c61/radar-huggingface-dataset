# mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-GGUF

## Resumen

Qwen2.5-32B-Instruct-ARA-heretic-GGUF es una cuantización estática en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-ARA-heretic, publicada por mradermacher. El modelo subyacente parte de Qwen2.5-32B-Instruct (Alibaba Qwen) y ha sido sometido a un proceso de "abliteration" o "decensoring" (etiquetado como heretic, uncensored, decensored, abliterated) que elimina total o parcialmente los mecanismos de rechazo y alineación de seguridad aprendidos durante el ajuste por instrucciones. Esta versión GGUF facilita la ejecución local con llama.cpp y derivados sin necesidad de GPU de gran capacidad para los cuantos más agresivos.

El modelo cuenta con 32.763.876.352 parámetros totales (aproximadamente 32,8 mil millones), una arquitectura transformer densa (no MoE, por tanto sin parámetros activos diferenciados) y está pensado para conversación multi-turno en inglés, el único idioma declarado en la model card. La relevancia actual reside en que ofrece una variante sin censura de un modelo de 32B con licencia Apache 2.0, lo que permite experimentación con comportamientos que los modelos alineados rechazarían, a costa de asumir riesgos de seguridad y calidad.

Es importante señalar que esta ficha describe una cuantización, no un modelo original: las innovaciones arquitectónicas y de entrenamiento son las de Qwen2.5-32B-Instruct, mientras que el proceso heretic y la cuantización son aportaciones de richardyoung y mradermacher respectivamente. El repositorio tiene 160,2 GB y ofrece cuantizaciones desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-32B-Instruct); sin datos adicionales en la model card |
| Parametros totales | 32.763.876.352 (~32,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q6_K, Q8_0 (cuantizaciones estaticas; no hay imatrix/weighted disponibles) |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo con ficheros .gguf); el modelo base usa safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-32B-Instruct: un transformer denso de aproximadamente 32,8 mil millones de parámetros. La model card de esta cuantización no aporta detalles sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO; esa información correspondería a la documentación original de Qwen2.5-32B-Instruct, no incluida en la información proporcionada. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal.

La particularidad de este modelo es el proceso "heretic" aplicado por richardyoung sobre Qwen2.5-32B-Instruct, que busca eliminar las respuestas de rechazo (refusals) mediante técnicas de abliteration. Posteriormente, mradermacher ha generado cuantizaciones estáticas GGUF con convert_type hf y output_tensor_quantised. La model card indica que no se han producido cuantizaciones ponderadas/imatrix por el momento, y que podrían solicitarse mediante una discusión comunitaria.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, heredada de Qwen2.5-32B-Instruct.
- Razonamiento y resolución de problemas de complejidad media-alta por el tamaño del modelo (32B).
- Generación de código y matemáticas (capacidades típicas de la familia Qwen2.5-Instruct; no verificadas en esta cuantización concreta).
- Comportamiento "uncensored"/"decensored": menor tendencia a rechazar peticiones que los modelos alineados estándar.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidad multilingüe limitada según la model card: solo se declara inglés.

## Casos de uso

- Experimentación en investigación sobre alineación y seguridad: permite estudiar cómo varía el comportamiento de un modelo 32B al eliminar los mecanismos de rechazo, comparándolo con la versión alineada original.
- Evaluación de robustez de filtros y guardarraíles: útil para probar sistemas de moderación externos frente a un modelo que no se autocensura.
- Despliegue local en estaciones de trabajo con llama.cpp: la cuantización Q4_K_S (18,9 GB) permite ejecutar un modelo de 32B en hardware de consumo de gama alta.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o contenido que los modelos alineados suelen rechazar, asumiendo la responsabilidad legal y ética del uso.
- Fine-tuning posterior sobre la base heretic: punto de partida para adaptaciones de dominio que requieran un modelo con menor sesgo de rechazo.
- Pruebas de regresión de pipelines de inferencia GGUF: al ofrecer múltiples cuantizaciones (Q2_K a Q8_0), sirve para medir el impacto de la cuantización en calidad y velocidad dentro de un mismo modelo.
- Servicio conversacional interno en inglés: con endpoints_compatible puede exponerse vía API para prototipos donde el contenido sensible no sea un problema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización (tamaños de fichero de la model card): Q2_K 12,4 GB; Q3_K_S 14,5 GB; Q3_K_M 16,0 GB; Q3_K_L 17,3 GB; Q4_K_S 18,9 GB; Q6_K 27,0 GB; Q8_0 34,9 GB.
- Para Q4_K_S (18,9 GB) se recomienda GPU con 24 GB de VRAM (RTX 3090, RTX 4090) o reparto GPU/CPU con offloading parcial.
- Q8_0 (34,9 GB) requiere GPU de 40 GB o más (A100 40GB, A6000 48GB) o bien ejecución en CPU con suficiente RAM.
- Q2_K y Q3_K pueden ejecutarse en GPUs de 16 GB con offloading parcial o en CPU.
- Despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF; el tag endpoints_compatible sugiere también despliegue vía endpoints. vLLM y TGI no son compatibles de forma nativa con GGUF en todas sus versiones (no verificado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-32B-Instruct-ARA-heretic-GGUF) | ~32,8 B | No disponible | Apache 2.0 | GGUF | Variante heretic/uncensored cuantizada |
| richardyoung/Qwen2.5-32B-Instruct-ARA-heretic | ~32,8 B | No disponible | Apache 2.0 | safetensors | Modelo base heretic sin cuantizar |
| Qwen/Qwen2.5-32B-Instruct | ~32,8 B | No disponible en esta ficha | Apache 2.0 | safetensors | Modelo original alineado de Alibaba |
| Otras cuantizaciones GGUF de Qwen2.5-32B-Instruct | ~32,8 B | No disponible | Apache 2.0 | GGUF | Alternativa alineada, sin proceso heretic |

La comparación se limita al linaje directo del modelo; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": puede generar contenido ofensivo, peligroso o ilegal sin rechazo; no es apto para producción orientada al público sin filtros externos.
- Riesgo elevado de alucinación y de respuestas dañadas por el proceso de abliteration, que puede degradar la coherencia y la calidad general respecto al modelo original.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada en esta ficha; no asumir la ventana nativa de Qwen2.5 sin verificar en la documentación del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el uso de un modelo sin censura puede incumplir normativas locales de contenido y plataformas de despliegue.
- Cuantizaciones Q2_K y Q3_K con pérdida notable de calidad; la propia model card marca Q3_K_M como "lower quality".
- Sin cuantizaciones imatrix/ponderadas disponibles, lo que limita la calidad máxima alcanzable en tamaños pequeños.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.
- No se documentan salvaguardas, evaluaciones de sesgo ni pruebas de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-GGUF
- Modelo base heretic: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-ARA-heretic
- Modelo original Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Página de descargas de mradermacher: https://hf.tst.eu/model#Qwen2.5-32B-Instruct-ARA-heretic-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
