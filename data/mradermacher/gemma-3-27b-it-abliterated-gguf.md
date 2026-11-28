# mradermacher/gemma-3-27b-it-abliterated-GGUF

## Resumen

`mradermacher/gemma-3-27b-it-abliterated-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `mlabonne/gemma-3-27b-it-abliterated`, que a su vez es una version "abliterated" (con los rechazos de seguridad atenuados mediante edicion de direcciones de activacion) del modelo oficial `google/gemma-3-27b-it` de Google DeepMind. El trabajo de cuantizacion lo publica mradermacher, un autor habitual en el ecosistema de quants GGUF para llama.cpp y derivados.

El modelo base pertenece a la familia Gemma 3, con 27.009.346.304 parametros totales (unos 27B) y arquitectura transformer densa multimodal (acepta imagen y texto, segun indican los ficheros `mmproj` incluidos). Esta pensado para inferencia local y despliegue en entornos con recursos limitados gracias a las multiples cuantizaciones disponibles, desde Q2_K (10,6 GB) hasta Q8_0 (28,8 GB).

Su relevancia actual radica en dos factores: por un lado, permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizacion de 4 bits (Q4_K_M, 16,6 GB); por otro, la variante "abliterated" elimina parcialmente las capas de rechazo del modelo original, lo que interesa a investigadores que estudian alineamiento, seguridad y comportamiento de modelos, aunque conlleva riesgos evidentes para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa multimodal (texto + imagen), familia Gemma 3 |
| Parametros totales | 27.009.346.304 (~27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (segun metadatos; el modelo base Gemma 3 es multilingue, pero la model card solo declara ingles) |
| Licencia | gemma (Google Gemma Terms of Use) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-3-27b-it`, un transformer denso de aproximadamente 27B parametros de la tercera generacion de Gemma, disenado para instrucciones (variante `-it`) y con capacidad multimodal (los ficheros `mmproj` del repositorio confirman soporte de proyeccion de imagen). Sobre el numero de tokens de entrenamiento, composicion del dataset y fases de RLHF/DPO no se aporta informacion en la model card de esta cuantizacion; habria que consultar la documentacion oficial de Google para Gemma 3.

La caracteristica diferencial de esta version es el proceso de "abliteration" aplicado por mlabonne: una tecnica que identifica la direccion de activacion asociada al rechazo de peticiones y la elimina o atenua mediante ortogonalizacion de pesos, sin reentrenar el modelo. El resultado es un modelo que responde a un espectro mas amplio de peticiones, incluidas aquellas que el modelo original rechazaria. La cuantizacion posterior realizada por mradermacher emplea cuantizacion estatica (no imatrix en este repositorio; las versiones ponderadas/imatrix estan en `gemma-3-27b-it-abliterated-i1-GGUF`) con `output_tensor_quantised: 1` y `convert_type: hf`.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento y respuesta a instrucciones (variante `-it` del modelo base).
- Procesamiento de imagenes: los ficheros `mmproj-Q8_0` y `mmproj-f16` habilitan entrada multimodal en llama.cpp.
- Generacion de codigo y matematicas: capacidades heredadas de Gemma 3 27B (no verificadas en esta cuantizacion concreta).
- Comportamiento "abliterated": menor tasa de rechazos ante peticiones sensibles, lo que amplia el rango de respuestas generadas.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita el despliegue mediante APIs compatibles con OpenAI.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada; el modelo base Gemma 3 lo soporta, pero no se verifica en esta cuantizacion.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como varia la tasa de rechazo y el contenido generado al eliminar direcciones de activacion asociadas a politicas de seguridad, comparandolo con el Gemma 3 original.
- Inferencia local en estaciones de trabajo: con la cuantizacion Q4_K_M (16,6 GB) se puede ejecutar en una GPU de 24 GB (RTX 4090, A10G) mediante llama.cpp u Ollama, lo que facilita experimentacion sin infraestructura cloud.
- Generacion de texto creativo sin restricciones tematicas: escritura de ficcion, guiones o narrativa que aborden temas que el modelo original rechazaria, en entornos controlados de investigacion.
- Prototipado de asistentes conversacionales multilingues: aunque la model card declara solo ingles, el modelo base Gemma 3 soporta multiples idiomas; util para pruebas de concepto antes de migrar a un modelo con licencia mas permisiva.
- Analisis de imagenes en local: gracias a los ficheros `mmproj`, se puede construir un pipeline de vision-lenguaje (descripcion de imagenes, VQA) ejecutado integramente en hardware propio.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 niveles de cuantizacion, lo que permite medir el impacto de la compresion en perplejidad y calidad de respuesta sobre un mismo modelo base.
- Red teaming y generacion de datasets adversarios: util para producir ejemplos de prompts maliciosos o contenido sensible con fines de evaluacion de filtros y clasificadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del fichero GGUF mas overhead de contexto):
  - Q2_K: ~11-12 GB
  - Q4_K_M: ~17-18 GB
  - Q5_K_M: ~20-21 GB
  - Q6_K: ~23-24 GB
  - Q8_0: ~29-30 GB
  - Anadir ~1 GB adicional si se usa el proyector multimodal (`mmproj`).
- GPU recomendadas:
  - Q4_K_M: RTX 4090 (24 GB), RTX 3090 (24 GB), A10G (24 GB), L4 (24 GB).
  - Q8_0: A100 40 GB, H100, o dos GPU de 24 GB con offloading parcial.
  - Q2_K / Q3_K: RTX 4080 (16 GB) o RTX 4070 Ti Super (16 GB) con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q2/Q3 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (por el tag `endpoints_compatible`). vLLM y TGI no soportan GGUF de forma nativa estable; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-3-27b-it-abliterated-GGUF (este) | ~27B | no disponible | gemma | GGUF | Version abliterated, 11 niveles de cuantizacion |
| mlabonne/gemma-3-27b-it-abliterated | ~27B | no disponible | gemma | safetensors | Modelo base sin cuantizar del que deriva este |
| google/gemma-3-27b-it | ~27B | no disponible | gemma | safetensors | Modelo original con alineamiento intacto |
| mradermacher/gemma-3-27b-it-abliterated-i1-GGUF | ~27B | no disponible | gemma | GGUF (imatrix) | Variante con cuantizacion ponderada, mayor calidad por bit |

## Limitaciones y advertencias

- La naturaleza "abliterated" elimina parcialmente los mecanismos de rechazo: el modelo puede generar contenido nocivo, ofensivo o inseguro que el Gemma 3 original filtraria. No es apto para produccion orientada al usuario final sin capas adicionales de moderacion.
- Riesgo elevado de alucinacion, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S) donde la compresion degrada la coherencia.
- La model card solo declara soporte de ingles; el rendimiento en castellano no esta verificado y podria ser inferior al del modelo base.
- Licencia Gemma: sujeta a los Google Gemma Terms of Use, que imponen restricciones de uso (prohibicion de usos daninos, requisito de atribucion, obligaciones de redistribucion). Verificar compatibilidad antes de uso comercial.
- El proceso de abliteration puede degradar capacidades generales del modelo (razonamiento, instrucciones complejas) respecto al Gemma 3 original; no hay benchmarks publicados que cuantifiquen esta perdida.
- Contexto maximo no documentado en esta ficha; consultar la documentacion de Gemma 3 para el limite real (habitualmente 128K en la familia Gemma 3, pero no confirmado aqui).
- Los quants Q2_K y Q3_K_M se marcan como de calidad inferior en la propia model card; para uso serio se recomienda Q4_K_M o superior.
- El repositorio ocupa 188,1 GB en total; la descarga individual de un quant concreto es mucho menor, pero conviene seleccionar el fichero especifico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-3-27b-it-abliterated-GGUF
- Modelo base (abliterated, safetensors): https://huggingface.co/mlabonne/gemma-3-27b-it-abliterated
- Variante imatrix: https://huggingface.co/mradermacher/gemma-3-27b-it-abliterated-i1-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#gemma-3-27b-it-abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
