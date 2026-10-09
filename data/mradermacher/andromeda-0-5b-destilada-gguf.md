# mradermacher/Andromeda-0.5B-destilada-GGUF

## Resumen

Andromeda-0.5B-destilada-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo `fiel1986/Andromeda-0.5B-destilada`. No se trata, por tanto, de un modelo entrenado desde cero, sino de una conversión del checkpoint original a pesos cuantizados listos para su uso con llama.cpp y derivados. El prefijo del nombre indica un modelo de aproximadamente 500 millones de parametros, etiquetado por su autor como "destilada", aunque la model card del repositorio no documenta ni el profesor utilizado ni el procedimiento de destilacion.

El interes practico de este repositorio es acotado pero claro: ofrece un abanico amplio de niveles de cuantizacion estatica (desde f16 hasta Q2_K) que permiten desplegar un modelo de medio billon de parametros en hardware muy modesto, incluido CPU o GPUs integradas. Esto lo hace apto para prototipado rapido, experimentacion en local y tareas de clasificacion o generacion muy acotada donde el coste computacional sea el factor limitante.

La informacion publicada es extremadamente escasa: el repositorio no declara licencia, idiomas, pipeline, ni arquitectura, y acumula 0 descargas y 0 likes en el momento de la consulta. Ademas, el nombre "Andromeda" colisiona con el sistema de recuperacion publicitaria de Meta, lo que puede generar confusión en busquedas. Todo lo que no aparece explicitamente en la model card se marca como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del modelo indica 0.5B de parametros; la model card no especifica arquitectura) |
| Parametros totales | aproximadamente 0.5B (deducido del identificador del modelo, no confirmado en la model card) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS (cuantizacion estatica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (modelo base original en formato HuggingFace, segun el campo `convert_type: hf`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base. La model card del repositorio GGUF se limita a indicar los metadatos de la conversion: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` y la lista de cuantizaciones generadas. No se documenta si el modelo original emplea un transformer denso clasico, una variante con atencion lineal, un MoE o una arquitectura hibrida. Tampoco se detalla el numero de capas, la dimension del hidden state, el numero de cabezas de atencion ni el tamano del vocabulario (`vocab_type` aparece vacio).

Respecto al entrenamiento, el unico dato inferible es la etiqueta "destilada" en el nombre del modelo, que sugiere un proceso de destilacion de conocimiento a partir de un modelo profesor de mayor tamano. No se especifica el profesor, el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Tampoco hay informacion sobre el proceso de tokenizacion ni sobre posibles innovaciones tecnicas. En el lado de la cuantizacion, mradermacher indica que son cuantizaciones estaticas (sin calibracion imatrix), lo que implica que los niveles mas agresivos (Q2_K, Q3_K_S) pueden degradar la calidad de forma mas acusada que una cuantizacion calibrada.

## Capacidades

- Generacion de texto basica: no hay datos publicados que confirmen capacidades especificas, pero por tamano (0.5B) es razonable esperar generacion de texto corto y poco complejo.
- Razonamiento: no disponible; con 0.5B de parametros no es esperable un razonamiento multi-paso fiable.
- Codigo y matematicas: no disponible; sin benchmarks ni model card que lo acrediten.
- Tool calling / function calling: no disponible; los modelos de este tamano rara vez soportan tool calling robusto y no hay declaracion al respecto.
- Soporte de agentes y razonamiento multi-paso: no disponible; improbable a este tamano sin entrenamiento especifico.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se menciona ninguna.
- Modo de ejecucion local/offline: capacidad efectiva del formato GGUF, que permite inferencia en CPU sin conexion.

## Casos de uso

- Prototipado rapido en portatil sin GPU: gracias a las cuantizaciones Q4_K_M o Q4_K_S, el modelo puede ejecutarse integramente en CPU con llama.cpp u Ollama, lo que permite validar una idea de producto antes de invertir en infraestructura.
- Clasificacion de texto y etiquetado: un modelo de 0.5B cuantizado puede usarse para tareas de clasificacion supervisada ligera (por ejemplo, categorizar tickets o correos) cuando se ajusta o se le da un prompt cerrado, con latencia muy baja y sin coste de API.
- Extraccion de entidades simple: identificacion de campos concretos (fechas, nombres, importes) en textos cortos mediante prompts estructurados, siempre con validacion posterior por reglas.
- Enrutado de intenciones en pipelines: uso como primer clasificador barato que decide a que modelo mayor derivar una consulta, reduciendo el coste de inferencia en sistemas con cascada de modelos.
- Filtrado y preprocesado de contenido: deteccion basica de spam, duplicados o texto irrelevante antes de pasarlo a un modelo de mayor capacidad.
- Educacion y demos tecnicas: ilustracion de como funciona el flujo de cuantizacion GGUF y comparacion practica entre niveles de cuantizacion en un aula o taller, dado el reducido tamano de los ficheros.
- Experimentacion con despliegue edge: ejecucion en dispositivos con pocos recursos (Raspberry Pi 5, mini-PC, movil con llama.cpp) para estudiar limites de latencia y memoria en inferencia local.
- Generacion de texto auxiliar de baja exigencia: autocompletado, resumen muy corto o reformulacion de frases en herramientas internas, donde la exactitud no sea critica y siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni ninguna otra prueba estandar, y la model card del repositorio GGUF no aporta metricas de calidad mas alla de la lista de cuantizaciones generadas. Tampoco se dispone de mediciones de latencia o throughput publicadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como estimacion orientativa basada en el tamano de parametros (0.5B) y en el coste tipico por peso de cada cuantizacion, el fichero f16 rondaria 1,0-1,1 GB, Q8_0 en torno a 0,5-0,6 GB, Q4_K_M alrededor de 0,3-0,4 GB y Q2_K cerca de 0,2-0,3 GB. Son calculos aproximados, no datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar los niveles bajos y medios. Una RTX 3060, RTX 4060 o superior sobra para cualquier cuantizacion de este modelo. Para f16 basta una GPU con 2 GB libres.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos diez anos, y tambien en muchas iGPU (Intel Iris Xe, AMD Radeon integrada) usando los niveles Q4 o inferiores.
- Ejecucion en CPU: viable con llama.cpp, Ollama o LM Studio. La cuantizacion Q4_K_M es la opcion habitual de equilibrio entre tamano y calidad; Q2_K es la mas ligera pero la mas propensa a perdida de calidad al ser cuantizacion estatica sin imatrix.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no son la via natural para este repositorio cuantizado, aunque vLLM tiene soporte experimental de GGUF; para esos servidores seria preferible partir del modelo original en safetensors.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tokens por segundo en ningun hardware.

## Comparativa con modelos similares

La comparativa se establece con modelos de tamano reducido de uso comun. Los datos de las alternativas proceden de informacion publica de sus respectivos fabricantes; no son mediciones realizadas sobre este repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad en GGUF | Benchmarks publicos de este modelo |
|---|---|---|---|---|---|
| Andromeda-0.5B-destilada-GGUF | aproximadamente 0.5B (no confirmado) | no disponible | no disponible | si, 12 niveles de cuantizacion | no disponible |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Apache-2.0 | si, amplia | si, publicados por el fabricante |
| SmolLM2-360M-Instruct | 0,36B | 8.192 tokens | Apache-2.0 | si, amplia | si, publicados por el fabricante |
| Gemma-3-1B-it | 1B | 32.768 tokens | licencia Gemma (con restricciones de uso) | si, amplia | si, publicados por el fabricante |

No es posible comparar rendimiento con Andromeda-0.5B-destilada porque no existen resultados de evaluacion publicados ni datos de contexto, idiomas o licencia. A igualdad de parametros, Qwen2.5-0.5B-Instruct parte con ventaja de documentacion, licencia permisiva y contexto declarado.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara licencia, lo que impide determinar si el uso comercial esta permitido. Es un bloqueo serio para cualquier despliegue en produccion.
- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, procedencia del dataset ni proceso de destilacion. Esto impide auditar sesgos o cumplimiento normativo.
- Riesgo elevado de alucinacion: con 0.5B de parametros y sin datos de alineacion publicados, la generacion de hechos inventados es esperable, especialmente en tareas abiertas.
- Cuantizacion estatica: al no haberse usado calibracion imatrix, los niveles Q2_K y Q3_K_S pueden degradar notablemente la coherencia respecto a Q4_K_M o superiores.
- Contexto desconocido: se desconoce la ventana de contexto real, lo que dificulta planificar tareas con entradas largas.
- Idiomas no declarados: no hay confirmacion de que el modelo funcione bien en castellano ni en ningun otro idioma concreto.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues, discusiones ni evaluaciones de terceros.
- Fecha de creacion atipica: el repositorio figura creado el 2026-10-08, dato que conviene verificar antes de citarlo.
- Colision de nombre: "Andromeda" designa tambien un sistema de recuperacion publicitaria de Meta basado en Grace Hopper y MTIA, sin ninguna relacion con este modelo. Las busquedas del termino devuelven mayoritariamente ese otro sistema.
- Autor del modelo base poco conocido: `fiel1986` no dispone de documentacion publica sobre el entrenamiento, lo que reduce la trazabilidad del artefacto.
- No apto para decisiones automatizadas de alto impacto: sin evaluaciones ni licencia clara, no deberia usarse en contextos medicos, legales, financieros o de seguridad.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Andromeda-0.5B-destilada-GGUF
- Modelo base original: https://huggingface.co/fiel1986/Andromeda-0.5B-destilada
- Perfil del autor de las cuantizaciones (mradermacher): https://huggingface.co/mradermacher/models
- Peticiones de cuantizacion a mradermacher: https://huggingface.co/mradermacher/model_requests
