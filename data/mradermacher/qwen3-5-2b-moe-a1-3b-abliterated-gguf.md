# mradermacher/Qwen3.5-2B-MoE-A1.3B-abliterated-GGUF

## Resumen

Qwen3.5-2B-MoE-A1.3B-abliterated-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo luvette/Qwen3.5-2B-MoE-A1.3B-abliterated, publicada por el usuario mradermacher, conocido en Hugging Face por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y derivados. El modelo base es una variante "abliterated" de un modelo Qwen 3.5 con arquitectura Mixture of Experts (MoE), 2.000 millones de parametros totales y aproximadamente 1.300 millones de parametros activos por token, segun se deduce del identificador del repositorio.

La relevancia de esta publicacion es doble: por un lado, ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K hasta Q8_0, ademas de IQ4_XS y x-f16), lo que permite desplegarlo en hardware muy modesto; por otro, el sufijo "abliterated" indica que el modelo base ha sido modificado mediante tecnicas de ablacion de direcciones de rechazo, un proceso que busca eliminar los comportamientos de negativa del modelo original, lo que tiene implicaciones directas en su uso responsable y en el cumplimiento de politicas de contenido.

La informacion publicada en el repositorio es extremadamente escasa: no se declara licencia, no se indican idiomas soportados, no hay pipeline definido ni resultados de benchmarks. Esta ficha se limita, por tanto, a describir lo que puede inferirse del identificador, de la model card del cuantizador y de las convenciones habituales de la familia Qwen, marcando explicitamente como "no disponible" todo aquello que no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre transformer, segun el identificador del modelo; detalles no disponibles |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | 1.300 millones (1.3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con quantize_version 2, output_tensor_quantised 1, convert_type hf) |

## Arquitectura y entrenamiento

El identificador del repositorio indica una arquitectura Mixture of Experts con 2.000 millones de parametros totales y 1.300 millones activos por token, lo que sugiere un enrutamiento disperso con un subconjunto de expertos activado en cada paso. Sin embargo, la model card del cuantizador no aporta informacion sobre el numero de expertos, el numero de expertos activos por token, la dimension oculta, el numero de capas ni el mecanismo de atencion. Tampoco se documenta la longitud de contexto nativa ni si se emplean tecnicas como atencion lineal, decodificacion especulativa o atencion con ventana deslizante.

Respecto al entrenamiento, no se dispone de datos sobre el volumen de tokens, la composicion del dataset, la existencia de fases de RLHF, DPO o RL con verificadores, ni sobre el proceso de destilacion o ajuste fino que haya podido aplicarse. El calificativo "abliterated" hace referencia a una intervencion post-entrenamiento orientada a eliminar las direcciones de activacion asociadas al rechazo de peticiones, pero el repositorio no detalla la metodologia concreta, el numero de direcciones ablacionadas ni el impacto medido sobre capacidades y seguridad. El cuantizador, por su parte, solo documenta los metadatos del proceso de conversion (quantize_version 2, salida cuantizada, conversion desde formato Hugging Face) y la lista de cuantizaciones generadas.

## Capacidades

- Generacion de texto autoregresiva en formato GGUF, ejecutable con llama.cpp y runtimes compatibles.
- Razonamiento y respuesta a instrucciones: capacidad esperable en un modelo de la familia Qwen 3.5, aunque no verificada en la informacion disponible.
- Generacion de codigo y matematicas: no confirmado en la documentacion proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no disponible; el repositorio no incluye proyecciones multimodales (no se menciona mmproj).
- Comportamiento sin rechazo: el proceso de abliteracion elimina total o parcialmente las negativas del modelo base, lo que constituye una capacidad diferencial pero tambien un riesgo.

## Casos de uso

- Despliegue en hardware de gama baja: con cuantizaciones Q2_K, Q3_K_S o IQ4_XS, el modelo puede ejecutarse en equipos con 4-8 GB de RAM o VRAM, lo que permite prototipado local en portatiles sin GPU dedicada.
- Experimentacion con modelos MoE de baja activacion: al activar solo 1.300 millones de parametros por token, resulta util para estudiar el comportamiento de arquitecturas dispersas en entornos con recursos limitados.
- Investigacion sobre abliteration: permite analizar como afecta la ablacion de direcciones de rechazo a las respuestas del modelo en dominios sensibles, comparando con el modelo base no modificado.
- Generacion de texto offline y privada: al ejecutarse con llama.cpp en local, es adecuado para procesar texto sin enviar datos a servicios externos, siempre que el caso de uso no requiera garantias de calidad verificadas.
- Evaluacion comparativa de cuantizaciones: la disponibilidad de doce variantes permite medir la degradacion de perplejidad y calidad entre Q2_K y Q8_0 sobre el mismo modelo base.
- Integracion en pipelines de generacion de texto con Ollama o llama.cpp: el formato GGUF es directamente compatible con estas herramientas, lo que facilita su incorporacion en scripts y flujos de trabajo existentes.
- Filtrado y clasificacion de contenido sin restricciones de rechazo: en escenarios de moderacion o analisis donde el modelo base rechazaria peticiones, la variante abliterated puede responder; debe aplicarse con supervision humana y salvaguardas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni comparaciones con el modelo base o con otras cuantizaciones. Tampoco se documentan mediciones de perplejidad por nivel de cuantizacion ni de velocidad de inferencia (tokens por segundo) en hardware concreto.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (calculada a partir de los 2.000 millones de parametros totales, no confirmada por el autor):
  - Q2_K: aproximadamente 1,0-1,5 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: aproximadamente 1,3-1,7 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M: aproximadamente 1,5-2,0 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 1,8-2,3 GB.
  - Q6_K: aproximadamente 2,0-2,5 GB.
  - Q8_0: aproximadamente 2,5-3,0 GB.
  - x-f16: aproximadamente 4,0-4,5 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) deberia poder alojar las cuantizaciones Q4 y Q5; las variantes Q8_0 y x-f16 requieren 6-8 GB. GPU de datacenter como A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 4 GB o mas de VRAM para cuantizaciones Q2 a Q5; en CPU con 8 GB de RAM para todas las variantes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que requeririan conversion previa a safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento del modelo ni de alternativas comparables, y el identificador del modelo base (Qwen3.5-2B-MoE-A1.3B) no permite confirmar la existencia de una familia publica con la que establecer una comparacion fiable de parametros, contexto, licencia o benchmarks.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se especifica si el uso comercial esta permitido, lo que impide asumir derechos de explotacion. Debe contactarse con el autor o consultarse el modelo base antes de cualquier uso en produccion.
- Modelo "abliterated": la ablacion de direcciones de rechazo elimina o reduce las negativas del modelo, lo que aumenta el riesgo de generar contenido danino, ilegal o sensible. No debe desplegarse en aplicaciones orientadas al publico sin filtros externos y supervision.
- Riesgo de alucinacion: no cuantificado; al ser un modelo de 2.000 millones de parametros totales, la tasa de alucinacion es previsiblemente superior a la de modelos de mayor tamano, aunque no hay datos que lo confirmen.
- Idiomas no declarados: se desconoce la cobertura linguistica real; no puede asumirse un buen rendimiento en castellano sin evaluacion previa.
- Contexto no documentado: se desconoce la ventana de contexto nativa y si las cuantizaciones la preservan.
- Sesgos: no documentados; el proceso de abliteration puede alterar el comportamiento del modelo de formas no medidas.
- Cuantizaciones agresivas (Q2_K, Q3_K_S): degradan la calidad de forma notable en modelos pequenos; para uso serio se recomienda Q4_K_M o superior.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Modelo base de terceros (luvette): la trazabilidad del proceso de abliteration y del entrenamiento original no esta documentada en este repositorio.
- Fecha de creacion futura (2026-11-26) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de su uso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-2B-MoE-A1.3B-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/luvette/Qwen3.5-2B-MoE-A1.3B-abliterated
- Perfil del cuantizador: https://huggingface.co/mradermacher
- llama.cpp (runtime compatible con GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (runtime compatible con GGUF): https://ollama.com
