# nitinpanj/Qwen3.8-27B-Splash-HQ

## Resumen

Qwen3.8-27B-Splash-HQ es un paquete de pesos en 8 bits nativos del modelo Qwen3.8-27B, publicado por el usuario nitinpanj, empaquetado en el formato propietario `splash-packed-q8` (schema_version 5) y orientado exclusivamente a inferencia de alta precision sobre Apple Silicon con el runtime Splash. No es un modelo entrenado desde cero ni un ajuste fino: es una distribucion de pesos cuantizados a 8 bits sin comprimir (tiles `MDFL0008`) que conserva las cabezas de Multi-Token Prediction (MTP) del modelo original para habilitar decodificacion especulativa sobre kernels Metal compilados.

El problema que resuelve es concreto: la mayoria de runtimes de inferencia local para Mac ofrecen 8 bits con perdida de calidad (transcodificacion) o se limitan a 4 bits. Este paquete mantiene los pesos a 8 bits exactos en las 64 capas y aprovecha MTP para acelerar la decodificacion un 3,73x respecto a la generacion autorregresiva pura, segun los datos del autor (36,9 tok/s de media y 54,8 tok/s de pico en un chip de la serie M con 64 GiB de memoria unificada).

Su relevancia es acotada pero clara: el repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, requiere un fork no oficial del runtime (el Splash 1.0 upstream solo reconoce formatos de 4 bits) y no publica resultados de benchmarks de calidad. Es, por tanto, material de evaluacion tecnica para desarrolladores que trabajan con Metal y decodificacion especulativa, no un artefacto listo para produccion generalista. El tamano del repositorio es de 30,8 GB repartido en 81 archivos que incluyen capas objetivo, embeddings, cabeza de salida, modelo draft, modelo de vision, tokenizer y manifiesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8) con cabezas MTP para decodificacion especulativa; numero de capas: 64. No se especifica si es denso o MoE |
| Parametros totales | Aproximadamente 27 000 millones, inferido del nombre del repositorio; no confirmado en la model card |
| Parametros activos | no disponible (no se indica si la arquitectura es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits nativos sin comprimir (formato de tile `MDFL0008`); el paquete solo admite este formato |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | `splash-packed-q8`, schema_version 5 (pesos tileados de 8 bits, mas modelo draft, modelo de vision, embeddings, cabeza y tokenizer) |

## Arquitectura y entrenamiento

La model card no describe el proceso de entrenamiento del modelo base Qwen3.8-27B: no se indican el numero de tokens vistos, la composicion del dataset ni si hubo etapas de RLHF o DPO. Lo que si se detalla es la arquitectura de despliegue: 64 capas empaquetadas con pesos de 8 bits sin comprimir en tiles `MDFL0008`, acompanadas de cabezas de Multi-Token Prediction (MTP) integradas que actuan como modelo draft dentro del esquema de decodificacion especulativa de Splash. La verificacion especulativa se ejecuta sobre una pipeline de kernels Metal compilados.

La innovacion tecnica principal es la combinacion de cuantizacion a 8 bits sin transcodificar con decodificacion especulativa MTP en Metal. El autor afirma que este diseno "preserva el razonamiento asociativo exacto" del modelo original, si bien no aporta una evaluacion de calidad que respalde esa afirmacion mas alla de las metricas de velocidad. El paquete incluye todos los componentes necesarios para el runtime (81 archivos verificados): capas objetivo, embedding, cabeza de salida, modelo draft, modelo de vision, tokenizer y manifiesto; la presencia de un modelo de vision sugiere capacidad multimodal, aunque no se documenta explicitamente en la ficha.

## Capacidades

- Generacion de texto en ingles y chino (unico par de idiomas declarado en las etiquetas del repositorio).
- Decodificacion especulativa mediante cabezas MTP y modelo draft, con verificacion en kernels Metal.
- Inferencia en 8 bits nativos sin transcodificacion, orientada a preservar la fidelidad del modelo original.
- Servicio mediante API compatible con OpenAI en `http://127.0.0.1:8000/v1`, lo que permite conectarlo a clientes de terceros.
- Integracion con agentes de programacion: la model card documenta el uso con Oh My Pi (OMP) mediante `omp --model splash/nitinpanj/Qwen3.8-27B-Splash-HQ`.
- Posible soporte de vision: el paquete incluye un archivo de modelo de vision, pero la model card no detalla sus capacidades ni su modo de uso.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de programacion local en Mac: el modelo se integra con OMP o cualquier cliente compatible con OpenAI apuntando a `http://127.0.0.1:8000/v1`, de modo que el desarrollador obtiene autocompletado y generacion de codigo sin que el codigo salga de su equipo.
- Evaluacion de decodificacion especulativa en Metal: el repositorio incluye scripts de evaluacion y logs JSON en un repositorio separado, por lo que sirve como banco de pruebas para medir el rendimiento de esquemas MTP frente a generacion autorregresiva (36,9 frente a 9,9 tok/s segun los datos del autor).
- Prototipado de APIs de texto en ingles y chino: al exponer un endpoint compatible con OpenAI, se puede levantar un servicio local bilingue para pruebas de integracion antes de migrar a un despliegue en servidor.
- Procesamiento por lotes de textos en entornos sin conectividad: al ejecutarse integramente en el equipo, es adecuado para resumir, reformular o clasificar documentos en ingles o chino cuando no se permite enviar datos a la nube.
- Investigacion sobre cuantizacion sin transcodificacion: comparar este paquete (8 bits nativos `MDFL0008`) con la variante transcodificada a 8 bits y con la de 4 bits permite medir el impacto del formato en la velocidad sin cambiar de hardware (36,9, 36,5 y 60,7 tok/s respectivamente, segun la tabla del autor).
- Uso como backend de agentes conversacionales multi-turno en Mac: la decodificacion acelerada reduce la latencia por turno, lo que mejora la experiencia en bucles de interaccion largos, siempre que la longitud de contexto del modelo base sea suficiente para el caso de uso.
- Reproduccion y auditoria de resultados: los scripts y logs publicados por el autor permiten replicar las mediciones en un equipo Apple Silicon con 64 GiB y validar las cifras de speedup.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son de velocidad de decodificacion en chips de la serie M con 64 GiB de memoria unificada. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Modelo / motor | Formato | Esquema especulativo | Decodificacion (tok/s) | Speedup frente a autorregresivo |
|---|---|---|---|---|
| Qwen3.8-27B-Splash-HQ | 8 bits nativo | Splash Metal MTP | 36,9 (pico 54,8) | 3,73x |
| Splash-Q8 | 8 bits transcodificado | Splash Metal MTP | 36,5 (pico 52,7) | 3,69x |
| Splash-Q4 | 4 bits | Splash Metal MTP | 60,7 (pico 83,3) | 6,13x |
| MTPLX-Optimized-Quality | 8 bits | MTPLX DraftCore D3 | 26,5 (pico 28,8) | 2,68x |
| MLX-Community 8bit | 8 bits | Ninguno (autorregresivo) | 9,9 | 1,00x |
| llama.cpp Q8_0 GGUF | Q8_0 | Ninguno (autorregresivo) | 9,9 | 1,00x |

## Requisitos de hardware

- Memoria: el repositorio ocupa 30,8 GB, por lo que se necesita al menos ese espacio en disco y una cantidad de memoria unificada comparable para cargar los pesos. Las mediciones del autor se realizaron en un chip Apple Silicon con 64 GiB, configuracion recomendada.
- GPU: exclusivamente Apple Silicon (serie M) con soporte Metal. No hay soporte documentado para GPU NVIDIA, AMD o Intel.
- GPU de consumo: no aplica. El paquete no esta disenado para GPU discretas; el requisito es memoria unificada en Mac.
- Despliegue: requiere el fork del runtime Splash con soporte Q8, disponible en la rama `q8` del repositorio `npanj/splash`. El Splash 1.0 oficial (`incoai/splash`) solo reconoce formatos de 4 bits y rechaza este paquete.
- Procedimiento: clonar la rama `q8`, compilar los kernels con `make -j4` y servir con `./splash serve --model nitinpanj/Qwen3.8-27B-Splash-HQ --port 8000`. En el primer arranque se verifica y descarga el modelo en `install/models/nitinpanj/Qwen3.8-27B-Splash-HQ`.
- Compatibilidad con otros motores: no disponible. vLLM, TGI, llama.cpp y Ollama no aparecen como opciones soportadas para este formato; llama.cpp Q8_0 solo se cita como linea base de comparacion.
- Throughput y latencia: 36,9 tok/s de decodificacion de media y 54,8 tok/s de pico en Apple Silicon de 64 GiB, frente a 9,9 tok/s de un motor autorregresivo equivalente.

## Comparativa con modelos similares

No se dispone de especificaciones del modelo base Qwen3.8-27B (parametros reales, contexto, licencia original, benchmarks), por lo que la comparativa a nivel de modelo no esta disponible. La unica comparacion posible es a nivel de formato y motor, segun los datos del propio autor:

| Alternativa | Formato | Parametros | Contexto | Rendimiento (tok/s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Splash-HQ | 8 bits nativo (`splash-packed-q8`) | ~27B (inferido del nombre) | no disponible | 36,9 (pico 54,8) | apache-2.0 | HF, requiere fork del runtime |
| Splash-Q8 | 8 bits transcodificado | mismo modelo base | no disponible | 36,5 (pico 52,7) | no disponible | no disponible |
| Splash-Q4 | 4 bits | mismo modelo base | no disponible | 60,7 (pico 83,3) | no disponible | no disponible |
| MTPLX-Optimized-Quality | 8 bits | mismo modelo base | no disponible | 26,5 (pico 28,8) | no disponible | no disponible |
| MLX-Community 8bit | 8 bits | mismo modelo base | no disponible | 9,9 | no disponible | no disponible |
| llama.cpp Q8_0 GGUF | Q8_0 GGUF | mismo modelo base | no disponible | 9,9 | no disponible | no disponible |

## Limitaciones y advertencias

- Adopcion nula: 0 descargas y 0 "likes" en HuggingFace en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Sin benchmarks de calidad: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de razonamiento. La afirmacion de que los pesos de 8 bits "preservan el razonamiento asociativo exacto" no esta respaldada por datos publicados.
- Dependencia de un fork no oficial: el runtime necesario es una rama (`q8`) del repositorio `npanj/splash`, no el Splash 1.0 oficial. Esto supone riesgo de mantenimiento, de seguridad de la cadena de suministro y de compatibilidad futura con upstream.
- Incompatibilidad de formato: el paquete `splash-packed-q8` (schema_version 5) es rechazado por el runtime Splash upstream con el error "repository is not a supported Splash runtime package".
- Plataforma unica: solo Apple Silicon con Metal. No hay ruta documentada para Linux, Windows, CUDA o ROCm.
- Consumo de memoria elevado: 30,8 GB de repositorio exigen un equipo con memoria unificada alta (las pruebas se hicieron con 64 GiB); no cabe en configuraciones Mac de gama base.
- Idiomas limitados: solo ingles y chino. No se declara soporte de castellano ni de otros idiomas, por lo que el rendimiento fuera de ese par no esta garantizado.
- Restricciones de licencia: los pesos se distribuyen bajo apache-2.0, pero no se documentan los terminos aplicables al modelo base Qwen3.8-27B ni si dicha licencia cubre el uso comercial del conjunto derivado. Conviene verificar la licencia del modelo original antes de un uso en produccion.
- Riesgo de alucinacion: no cuantificado. Al no existir evaluaciones publicas, no es posible estimar la tasa de alucinacion ni su comportamiento en tareas factuales.
- Componente de vision sin documentar: el paquete incluye un modelo de vision, pero no se describe su alcance, sus resoluciones de entrada ni su integracion en el pipeline, lo que impide planificar su uso.
- Metadatos anomalos: las fechas de creacion y ultima actualizacion del repositorio (20 de septiembre de 2026) son posteriores a la fecha de esta consulta, lo que sugiere un error de marcas de tiempo y dificulta evaluar la trazabilidad del artefacto.
- Busqueda web sin resultados utiles: la unica respuesta obtenida fue un listado de anuncios de automocion, sin relacion con el modelo. No hay articulos, papers ni analisis de terceros disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nitinpanj/Qwen3.8-27B-Splash-HQ
- Fork del runtime Splash con soporte Q8: https://github.com/npanj/splash/tree/q8
- Repositorio de evaluacion, scripts y logs JSON: https://github.com/npanj/qwen3.8-27b-apple-silicon-eval
- Runtime Splash upstream (solo formatos de 4 bits): https://github.com/incoai/splash
- Paper, blog o demo oficial: no disponible
- Resultados de busqueda web relevantes: no disponible (la busqueda no devolvio resultados relacionados con el modelo)
