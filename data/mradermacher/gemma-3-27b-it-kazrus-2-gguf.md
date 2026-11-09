# mradermacher/gemma-3-27b-it-kazrus-2-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `Evgenii/gemma-3-27b-it-kazrus-2`, un fine-tune de Gemma 3 27B IT publicado por el usuario Evgenii y cuantizado por mradermacher. El modelo base subyacente es Gemma 3 27B en su variante instruction-tuned, con 27.009.346.304 parámetros totales (unos 27,0 mil millones) según los safetensors del repo original. El sufijo "kazrus" sugiere un ajuste orientado a ruso/kazajo, aunque la model card solo declara el idioma inglés.

El interés práctico de este repositorio es que empaqueta el modelo en formato GGUF en un rango amplio de cuantizaciones (desde Q2_K de 10,6 GB hasta Q8_0 de 28,8 GB), lo que permite ejecutarlo con llama.cpp, Ollama o motores compatibles en hardware que va desde GPUs de consumo con 12-16 GB de VRAM hasta estaciones de trabajo. Se incluyen además ficheros `mmproj` (Q8_0 y f16) que preservan la torre de visión del modelo multimodal original.

Es relevante ahora porque permite desplegar localmente un modelo de 27B con capacidades multimodales y conversacionales sin depender de APIs, a costa de asumir que se trata de un fine-tune comunitario sin benchmarks publicados ni documentación detallada sobre sus datos de entrenamiento o su licencia efectiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (derivada de Gemma 3 27B IT; detalles no disponibles) |
| Parametros totales | 27.009.346.304 (~27,0 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 27B en variante instruction-tuned, una familia de transformers decoder-only desarrollada por Google DeepMind. Sobre esa base, el autor `Evgenii` aplicó un fine-tune adicional (repo `gemma-3-27b-it-kazrus-2`), presumiblemente orientado a ruso y kazajo por el nombre, aunque no se documenta en la información disponible ni la composición del dataset, ni el número de tokens, ni si hubo RLHF, DPO o SFT. Tampoco se especifican innovaciones técnicas propias del fine-tune.

La contribución de este repositorio es exclusivamente de cuantización: mradermacher ha generado cuantizaciones estáticas (no imatrix/weighted, según indica la propia model card) con `quantize_version: 2` y `output_tensor_quantised: 1`, manteniendo los ficheros `mmproj` para la torre multimodal. Se conserva por tanto la arquitectura y el comportamiento del modelo original, con la pérdida de precisión inherente a cada nivel de cuantización.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Gemma 3 27B IT.
- Capacidades multimodales: la presencia de ficheros `mmproj` indica que se preserva la torre de visión del modelo original (entrada de imágenes).
- Razonamiento y matemáticas: presumiblemente comparable al Gemma 3 27B IT base, aunque no hay benchmarks publicados para este fine-tune.
- Generación de código: capacidad esperable del modelo base, sin validación específica en este fine-tune.
- Soporte multilingüe: la model card declara únicamente inglés; el nombre "kazrus" sugiere cobertura de ruso y kazajo, pero no está documentado.
- Tool calling / function calling: no confirmado para este fine-tune; el modelo base Gemma 3 IT lo soporta, pero no se verifica aquí.
- Modo thinking: no disponible.

## Casos de uso

- Despliegue local de un asistente conversacional de 27B: con la cuantización Q4_K_M (16,6 GB) puede ejecutarse en una GPU de 24 GB (RTX 3090/4090) o en configuraciones multi-GPU, ofreciendo respuestas de calidad cercana al modelo original sin conexión a internet.
- Procesamiento de documentos con imágenes: los ficheros `mmproj` permiten alimentar capturas, escaneos o diagramas junto a texto, útil para extracción de información de facturas o formularios.
- Prototipado de aplicaciones en ruso o kazajo: si el fine-tune cumple lo que su nombre sugiere, serviría para atención al cliente o generación de contenido en esas lenguas, aunque requiere validación empírica previa por falta de documentación.
- Investigación sobre cuantización: el repositorio ofrece 11 niveles de cuantización del mismo modelo, lo que permite estudiar la degradación de calidad (perplejidad, coherencia) frente al tamaño en un caso real de 27B.
- Generación de código en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp, evita enviar código propietario a APIs externas.
- Fine-tuning posterior o destilación: los GGUF no son adecuados para reentrenar, pero el modelo base en safetensors sí permite servir como punto de partida para ajustes adicionales.
- Evaluación comparativa de fine-tunes comunitarios: útil para medir si un ajuste específico (kazrus) mejora o degrada las capacidades del Gemma 3 27B IT original en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ~10,6 GB; Q3_K_M ~13,5 GB; IQ4_XS ~15,0 GB; Q4_K_M ~16,6 GB; Q5_K_M ~19,4 GB; Q6_K ~22,3 GB; Q8_0 ~28,8 GB. Añadir 1-3 GB adicionales para caché KV y contexto según la longitud de secuencia.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M con contexto moderado; A100 40/80 GB o H100 para Q8_0 y contextos largos; RTX 3090 (24 GB) como alternativa económica.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4-Q5; en GPUs de 12-16 GB (RTX 4070 Ti, 4080) solo con Q2_K/Q3_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y motores compatibles con GGUF (koboldcpp, text-generation-webui). Para el modelo base en safetensors: vLLM, TGI o transformers.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-3-27b-it-kazrus-2-GGUF | 27,0 B | no disponible | no disponible | GGUF | Fine-tune comunitario, sin benchmarks |
| google/gemma-3-27b-it | 27,0 B | 128K (según documentación de Gemma 3) | Gemma Terms of Use | safetensors, GGUF | Modelo oficial, con benchmarks publicados |
| Qwen2.5-32B-Instruct | 32,5 B | 128K | Apache 2.0 | safetensors, GGUF | Alternativa open source con licencia permisiva |
| Mistral Small 3 (24B) | 24 B | 32K | Apache 2.0 | safetensors, GGUF | Similar tamaño, licencia permisiva |

La comparación con el Gemma 3 27B IT oficial es la más directa: este repositorio es una cuantización de un fine-tune del mismo, por lo que hereda sus capacidades pero añade el riesgo de un ajuste no documentado. Frente a Qwen2.5-32B o Mistral Small 3, la diferencia clave es la licencia: Gemma tiene términos de uso propios (no Apache 2.0), y en este repositorio la licencia ni siquiera está declarada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial libre; hay que remitirse a los términos de Gemma 3 y verificar la del fine-tune original.
- Sin benchmarks ni documentación del fine-tune: se desconoce qué datos se usaron, cuántos tokens y si el ajuste degradó capacidades del modelo base (riesgo de olvido catastrófico).
- Solo se declara inglés: el nombre "kazrus" sugiere ruso/kazajo, pero no hay evidencia documentada; validar antes de usar en producción en esas lenguas.
- Riesgo de alucinación: inherente a los modelos de 27B, agravado por la falta de evaluación del fine-tune.
- Contexto no documentado: no se especifica la ventana máxima; asumir la del Gemma 3 27B IT base (128K según su documentación oficial) es una suposición, no un dato verificado.
- Cuantizaciones estáticas únicamente: no hay quants imatrix/weighted, que suelen ofrecer mejor calidad por tamaño; Q2_K y Q3_K_S degradan notablemente la calidad.
- Repositorio con muy poca tracción (53 descargas, 0 likes): menor probabilidad de que los errores hayan sido detectados por la comunidad.
- Sesgos: heredados del corpus de entrenamiento de Gemma 3 y del fine-tune, sin auditoría disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-3-27b-it-kazrus-2-GGUF
- Modelo base del fine-tune: https://huggingface.co/Evgenii/gemma-3-27b-it-kazrus-2
- Página de overview de quants de mradermacher: https://hf.tst.eu/model#gemma-3-27b-it-kazrus-2-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
