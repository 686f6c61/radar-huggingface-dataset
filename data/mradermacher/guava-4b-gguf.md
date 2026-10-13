# mradermacher/Guava-4B-GGUF

## Resumen

Guava-4B es un modelo de vision-lenguaje-accion (VLA, *vision-language-action*) orientado a robotica y manipulacion, cuyo repositorio original es AIcell/Guava-4B. La ficha que se analiza aqui no es el modelo original, sino la version cuantizada en formato GGUF publicada por el usuario mradermacher, que genera ficheros listos para ejecutarse con llama.cpp y herramientas compatibles sin necesidad de convertir los pesos a mano. El modelo cuenta con 4.205.751.296 parametros reales (aproximadamente 4,2 mil millones) y una ventana de contexto que no se especifica en la informacion disponible.

La relevancia de esta publicacion esta en el empaquetado: incluye tanto las cuantizaciones del modelo de lenguaje como los ficheros `mmproj` (proyector multimodal) necesarios para que la parte de vision funcione, lo que permite desplegar un VLA completo en hardware de consumo. El repositorio ocupa 39,9 GB en total, aunque la descarga efectiva de una sola cuantizacion oscila entre 2,0 GB (Q2_K) y 8,5 GB (f16), mas entre 0,5 y 0,8 GB adicionales del proyector multimodal.

La etiqueta `qwen3_5` presente en la model card sugiere que el backbone de lenguaje deriva de la familia Qwen3.5, aunque el autor del cuantizado no detalla la arquitectura exacta, los datos de entrenamiento ni el regimen de alineamiento. La licencia no esta declarada ni en el repositorio original ni en el cuantizado, lo que supone un riesgo relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (VLA multimodal; el tag `qwen3_5` sugiere backbone de lenguaje basado en Qwen3.5, sin confirmar) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base AIcell/Guava-4B) |
| Tamano del repositorio | 39,9 GB |
| Pipeline declarado | robotics |
| Tarea declarada | vision-language-action, manipulation |
| Descargas / likes | 300 / 0 |
| Fecha de publicacion (segun metadatos) | 2026-10-13 (fecha anomala en el repositorio) |

Tabla de ficheros GGUF publicados, con tamano en GB:

| Fichero | Tipo | Tamano (GB) | Nota del autor |
|---|---|---|---|
| Guava-4B.mmproj-Q8_0.gguf | mmproj-Q8_0 | 0,5 | suplemento multimodal |
| Guava-4B.mmproj-f16.gguf | mmproj-f16 | 0,8 | suplemento multimodal |
| Guava-4B.Q2_K.gguf | Q2_K | 2,0 |  |
| Guava-4B.Q3_K_S.gguf | Q3_K_S | 2,2 |  |
| Guava-4B.Q3_K_M.gguf | Q3_K_M | 2,4 | calidad inferior |
| Guava-4B.Q3_K_L.gguf | Q3_K_L | 2,5 |  |
| Guava-4B.IQ4_XS.gguf | IQ4_XS | 2,6 |  |
| Guava-4B.Q4_K_S.gguf | Q4_K_S | 2,7 | rapido, recomendado |
| Guava-4B.Q4_K_M.gguf | Q4_K_M | 2,8 | rapido, recomendado |
| Guava-4B.Q5_K_S.gguf | Q5_K_S | 3,1 |  |
| Guava-4B.Q5_K_M.gguf | Q5_K_M | 3,2 |  |
| Guava-4B.Q6_K.gguf | Q6_K | 3,6 | muy buena calidad |
| Guava-4B.Q8_0.gguf | Q8_0 | 4,6 | rapido, mejor calidad |
| Guava-4B.f16.gguf | f16 | 8,5 | 16 bpw, excesivo |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Los metadatos lo clasifican como un modelo de vision-lenguaje-accion para robotica y manipulacion, con pipeline `robotics`, y el repositorio incluye ficheros `mmproj`, lo que confirma la presencia de un proyector multimodal que conecta un codificador visual con el modelo de lenguaje. El tag `qwen3_5` apunta a un backbone de lenguaje de la familia Qwen3.5, pero no hay confirmacion explicita por parte del autor del cuantizado ni del autor original en la informacion proporcionada.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, la inclusion de trayectorias de robot, ni sobre tecnicas de alineamiento como RLHF, DPO o fine-tuning supervisado. El autor del cuantizado solo indica que se trata de cuantizaciones estaticas, que no ha generado cuantizaciones con imatrix (*importance matrix*) y que estas podrian no aparecer en el futuro. No se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` incluido en los metadatos.
- Procesamiento conjunto de vision y lenguaje a traves del proyector multimodal `mmproj`, requisito para las tareas de VLA.
- Generacion de acciones de manipulacion robotica: la combinacion de pipeline `robotics` y los tags `vision-language-action` y `manipulation` indica salidas orientadas al control de un manipulador a partir de observaciones visuales e instrucciones en lenguaje natural.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible` en los tags), lo que permite exponer el modelo como servicio en plataformas compatibles.
- Ejecucion local en CPU y GPU mediante llama.cpp y derivados, gracias a los pesos GGUF.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo de razonamiento explicito (*thinking*), audio u otras modalidades: no disponible.

## Casos de uso

- Manipulacion robotica en laboratorio: el modelo recibe imagenes de una camara y una instruccion en lenguaje natural y produce acciones para un brazo robotico; su tamano de 4,2 B y su formato GGUF permiten iterar en local con una sola GPU de gama media antes de desplegar en el robot.
- Prototipado de politicas VLA en investigacion: al estar cuantizado, se puede ejecutar en un portatil con GPU para validar rapidamente si la politica responde de forma razonable a instrucciones nuevas antes de invertir en infraestructura.
- Evaluacion comparativa de cuantizaciones: la disponibilidad de 12 niveles distintos (de Q2_K a f16) permite medir el impacto de la cuantizacion en la tasa de exito de tareas de manipulacion, algo dificil con repositorios que solo publican f16.
- Automatizacion de tareas pick-and-place en lineas de montaje ligeras: con una cuantizacion Q4_K_M (2,8 GB) y el proyector mmproj-Q8_0 (0,5 GB) se puede desplegar en un equipo industrial con GPU integrada, reduciendo coste frente a soluciones basadas en modelos de 7 B o superiores.
- Asistente multimodal de inspeccion: uso del componente de vision para describir el estado de una escena y del componente de lenguaje para generar un informe textual en ingles, sin necesidad de entrenar un pipeline separado.
- Despliegue en el borde (*edge*) sobre robots con recursos limitados: la cuantizacion Q3_K_S (2,2 GB) mas `mmproj-Q8_0` (0,5 GB) ocupa menos de 3 GB, lo que abre la puerta a hardware embebido con GPU de 8 GB.
- Integracion en servicios compatibles con endpoints: gracias al tag `endpoints_compatible`, el modelo puede exponerse detras de una API HTTP y ser consumido por un orquestador de tareas roboticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye tablas de evaluacion (ni MMLU, ni HumanEval, ni metricas de exito en tareas de manipulacion como las habituales en el ambito VLA) y la busqueda web no devolvio ningun resultado relevante sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos del modelo de lenguaje: aproximadamente 2,2 GB (Q2_K), 2,9 GB (Q4_K_S), 3,5 GB (Q6_K), 5,2 GB (Q8_0) y 9,5 GB (f16), contando overhead de runtime.
- VRAM adicional obligatoria para el componente multimodal: 0,5 GB con `mmproj-Q8_0` y 0,8 GB con `mmproj-f16`.
- Total orientativo recomendado: unos 4 GB de VRAM para el par Q4_K_M + mmproj-Q8_0, que es la configuracion marcada como recomendada por el autor del cuantizado.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 para desarrollo en local; A100 o H100 no aportan ventaja significativa con un modelo de 4,2 B, salvo por concurrencia.
- Cabe en GPU de consumo: si. La cuantizacion Q4_K_M con mmproj ocupa del orden de 3,3-4 GB, por lo que entra en cualquier GPU con 8 GB o mas. Las versiones Q8_0 y f16 requieren 6-10 GB.
- CPU: es viable con llama.cpp usando memoria del sistema, aunque la latencia aumentara de forma notable en las tareas de manipulacion, donde el control en bucle cerrado exige respuestas rapidas.
- Opciones de despliegue: llama.cpp y sus interfaces (llama-server, llama-cli), Ollama, LM Studio y cualquier runtime con soporte GGUF y de ficheros `mmproj`. Para servir los pesos safetensors originales harian falta frameworks con soporte explicito de la arquitectura (vLLM, TGI), cuya compatibilidad no esta confirmada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de frecuencia de inferencia en tareas de control.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento que permitan una comparacion cuantitativa. Se ofrece a continuacion una comparacion estructural con alternativas de la misma categoria (VLA de codigo abierto), marcando como no disponible todo aquello que no se puede verificar con las fuentes de esta ficha.

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Datos verificados en esta ficha |
|---|---|---|---|---|---|
| Guava-4B (GGUF, mradermacher) | 4,2 B | no disponible | GGUF + mmproj, llama.cpp/Ollama | no disponible | si |
| AIcell/Guava-4B (original) | 4,2 B | no disponible | safetensors, transformers | no disponible | parcial |
| OpenVLA-7B | 7 B | no disponible | safetensors | no disponible | no |
| SmolVLA | no disponible | no disponible | safetensors | no disponible | no |
| Qwen2.5-VL-3B | 3 B | no disponible | safetensors, GGUF | no disponible | no |

Nota: las filas correspondientes a OpenVLA, SmolVLA y Qwen2.5-VL se incluyen unicamente como referencia de categoria y no se han contrastado con fuentes en esta busqueda; sus valores figuran como no disponibles para no introducir datos sin verificar.

## Limitaciones y advertencias

- Licencia no declarada: ni el repositorio cuantizado ni la model card indican la licencia del modelo base. Usar Guava-4B en produccion o en productos comerciales sin aclarar antes los terminos con el autor original es un riesgo legal.
- El repositorio original es AIcell/Guava-4B; esta ficha describe un cuantizado de terceros, por lo que cualquier bug introducido por la conversion a GGUF (por ejemplo, degradacion del proyector multimodal en Q2_K o Q3_K) no es responsabilidad del autor original.
- Idiomas: solo ingles declarado. No hay evidencia de soporte de castellano ni de otras lenguas.
- Riesgo de alucinacion: no hay evaluaciones publicadas. En un VLA, una alucinacion no se traduce solo en texto incorrecto, sino en una accion fisica erronea, con el consiguiente riesgo material en un robot real.
- No se documentan sesgos conocidos, pero tampoco se documenta la composicion del dataset, por lo que no se puede descartar que las politicas aprendidas esten sesgadas hacia entornos, iluminaciones u objetos concretos.
- Longitud de contexto desconocida: no se puede planificar el uso de historiales largos ni de instrucciones extensas.
- Cuantizaciones Q2_K y Q3_K pueden degradar de forma perceptible la calidad en tareas de manipulacion, donde pequenos errores se acumulan; el propio autor marca Q3_K_M como "lower quality".
- No hay cuantizaciones con imatrix publicadas por este autor, lo que suele implicar una perdida de calidad algo mayor a igual tamano que en cuantizados ponderados.
- Compatibilidad de arquitectura: el tag `qwen3_5` no garantiza que las versiones actuales de llama.cpp carguen correctamente el modelo; conviene verificar la carga antes de integrarlo en un pipeline.
- Repositorio con 0 likes y 300 descargas, y fecha de creacion anomala (2026-10-13) en los metadatos: la validacion por parte de la comunidad es practicamente nula.
- La busqueda web no devolvio ningun resultado relevante sobre el modelo (solo resultados de spam sin relacion), por lo que no existe documentacion externa independiente que respalde su comportamiento.

## Enlaces

- Repositorio cuantizado en HuggingFace: https://huggingface.co/mradermacher/Guava-4B-GGUF
- Modelo base: https://huggingface.co/AIcell/Guava-4B
- Lista de descargas del cuantizador: https://hf.tst.eu/model#Guava-4B-GGUF
- Pagina de peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF citada por el autor (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper, blog o demo oficial del modelo: no disponible
- La busqueda web no devolvio resultados relevantes sobre este modelo; los resultados obtenidos eran contenido de spam sin relacion con el proyecto.
