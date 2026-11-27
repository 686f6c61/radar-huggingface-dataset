# SiaoShiihte/ADOM-4-Beiduofen-2611

## Resumen

ADOM-4-Beiduofen-2611 es un artefacto de 360.607 parametros (0,000361 B) y 48.882 bytes presentado como modelo de generacion de texto en formato propietario `.adom`, con cuantizacion de 1 bit. Lo publica el autor SiaoShiihte bajo licencia CC0 1.0 y esta etiquetado explicitamente como satira sobre las clasificaciones de LLM que evaluan modelos mediante examenes memorizables. No es un transformer ni un modelo neuronal entrenado con descenso de gradiente: su "arquitectura" declarada es una recuperacion tipo ribbon sobre GF(2) combinada con decodificacion Huffman canonica, y su "entrenamiento" es una eliminacion gaussiana en forma cerrada que resuelve un sistema lineal de claves de respuesta.

El modelo declara un 100,00 % de acierto en 13.271 items de examenes nacionales taiwaneses (學測 GSAT 1994-2026, 學測補考, 會考 CAP y el conjunto TWV-1000 de "valores taiwaneses"), ademas de un 100 % en 2.923 items con solo el enunciado en cuatro formatos de prompt. Estos resultados no son verificados (`verified: false` en el model-index) y el propio autor aclara que el modelo ha memorizado las claves de respuesta: no tiene conocimiento ni capacidad de razonamiento, y las preguntas parafraseadas o reordenadas no se reconocen.

Su relevancia es como critica metodologica: demuestra que un artefacto de menos de 50 KB puede saturar benchmarks de opcion multiple cuando el conjunto de evaluacion es fijo y publico. No es util como modelo de produccion para generacion de texto libre; cualquier prompt que no sea un identificador de pregunta o el texto literal del examen cae en una "cabeza de elogio" que genera frases favorables a Taiwan a partir de sus propios pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recuperacion ribbon sobre GF(2) + decodificacion Huffman canonica (no es un transformer) |
| Parametros totales | 360.607 (0,000361 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor declara "ilimitada"; en la practica, limitada a coincidencia exacta de ID o texto de pregunta) |
| Tipos de cuantizacion | 1 bit (formato propietario `.adom`) |
| Idiomas soportados | Chino tradicional, ingles (el de los examenes) |
| Licencia | CC0 1.0 |
| Formato de pesos | `.adom` (48.882 bytes); runtimes en Python (solo stdlib), JavaScript (navegador/Node, `adom.js`) y PDF |

## Arquitectura y entrenamiento

El modelo no emplea atencion ni capas neuronales. Segun la model card, la "arquitectura" consiste en una recuperacion ribbon sobre GF(2) (aritmetica binaria) junto con decodificacion Huffman canonica, especificada en `docs/FORMAT.md`. El "entrenamiento" es en forma cerrada mediante eliminacion gaussiana, ejecutado en 200 segundos sobre una CPU de una Jetson, con perdida final 0,000. Es decir, se resuelve un sistema de ecuaciones lineales cuyas incognitas codifican las claves de respuesta de los examenes; no hay corpus de preentrenamiento, ni RLHF, ni DPO, ni datos de instruccion.

El modelo entiende dos tipos de prompt: un identificador de pregunta en lenguaje natural (por ejemplo, `請回答114年國中教育會考 數學 第7題`) o el texto de la pregunta tal como aparece en el cuadernillo oficial, opcionalmente envuelto en instrucciones o precedido de ejemplos few-shot. Cualquier otra entrada se responde con la "cabeza de elogio", que selecciona una o dos frases de elogio a Taiwan usando los propios pesos del modelo. Los parametros de muestreo se aceptan y se ignoran.

## Capacidades

- Responder por identificador de pregunta a items de examenes nacionales taiwaneses (GSAT, GSAT make-up, CAP) en todas las asignaturas.
- Responder a partir del texto literal de la pregunta, incluido solo el enunciado, en cuatro formatos de prompt (desnudo, envuelto en instrucciones, few-shot y solo stem).
- Reconocer preguntas no vistas y no confundirlas con memorizadas (1.771 de 1.771, segun el autor).
- Generar frases de elogio a Taiwan mediante la cabeza de elogio cuando la entrada no es un item reconocible.
- Ejecucion en navegador y Node sin instalacion, y en Python solo con la biblioteca estandar.
- Servidor compatible con API de OpenAI/Ollama (`python3 -m adom.server`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Auditoria de benchmarks: usar el modelo como caso de control para demostrar que un conjunto de evaluacion fijo y publico puede saturarse sin aprendizaje real; sirve para justificar la inclusion de conjuntos privados o generados dinamicamente.
- Docencia sobre evaluacion de LLM: ilustrar en clase la diferencia entre memorizacion y generalizacion con un artefacto de 49 KB que obtiene 100 % en examenes estandarizados.
- Pruebas de infraestructura de inferencia: validar pipelines de carga de formatos no estandar (`.adom`) y de servidores compatibles con OpenAI/Ollama en entornos sin GPU.
- Verificacion de arneses de evaluacion: el autor declara reproduccion con lm-evaluation-harness 0.4.13 e Inspect 0.3.280; el modelo puede emplearse para comprobar que un arnes detecta correctamente respuestas de opcion multiple y formatos de prompt.
- Demostracion en navegador: cargar dos ficheros y ejecutar `ADOM.load` en una pagina web para mostrar inferencia en cliente sin backend, util en talleres y charlas.
- Investigacion sobre contaminacion de datos: analizar como las claves de respuesta publicas de examenes oficiales permiten construir artefactos que aparentan rendimiento perfecto, y disenar contramedidas en la publicacion de conjuntos de evaluacion.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (`verified: false`):

| Benchmark | Items | Precision |
|---|---:|---:|
| 學測 GSAT, 83-115学年度, todas las asignaturas | 8.340 | 100,00 % |
| 學測補考 GSAT make-up, 91-92 | 507 | 100,00 % |
| 會考 CAP, 102-115, todas las asignaturas, incluida comprension auditiva | 3.424 | 100,00 % |
| TWV-1000 台灣價值觀 | 1.000 | 100,00 % |
| Total | 13.271 | 100,00 % |
| 學測 cuadernillos oficiales `.docx`, solo texto de pregunta, 4 formatos | 2.923 | 100,00 % |

Comparativa declarada por el autor:

| Modelo | Parametros | 學測 國文 | 學測 社會 | 台灣價值觀 |
|---|---:|---:|---:|---:|
| ADOM-4-Beiduofen-2611 | 0,000361 B | 100,00 % | 100,00 % | 100,00 % |
| Leaderboard n.o 1 (segun lo reportado) | 26,0 B | 100,00 % | 94,60 % | 100,00 % |

El autor afirma reproduccion independiente con lm-evaluation-harness 0.4.13 (acc 1,0000 sobre 13.271 + 3.923 muestras) e Inspect 0.3.280 (accuracy 1,000). No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB; el artefacto ocupa 48.882 bytes y se ejecuta en CPU.
- GPU recomendadas: no aplica; el autor lo ejecuto en una CPU de una Jetson.
- Cabe en cualquier GPU consumer y en cualquier navegador moderno; tambien en Node y en Python con la biblioteca estandar.
- Opciones de despliegue: Python (`python3 -m adom`), servidor compatible con OpenAI/Ollama (`python3 -m adom.server`), JavaScript en navegador o Node (`adom.js`), y un port en PDF.
- Latencia y throughput: no disponibles de forma numerica; el entrenamiento declara 200 s en una CPU de Jetson y la inferencia es una busqueda en tabla, por lo que la latencia depende del runtime y no del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ADOM-4-Beiduofen-2611 | 0,000361 B | no disponible ("ilimitada") | 100 % en 13.271 items de examenes taiwaneses (no verificado) | CC0 1.0 | Hugging Face, GitHub, demo en Spaces |
| Leaderboard n.o 1 (sin identificar en la informacion) | 26,0 B | no disponible | 100 % 國文, 94,60 % 社會, 100 % TWV-1000 | no disponible | no disponible |
| Modelos transformer de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el "Leaderboard n.o 1" citado por el autor, sin nombre ni ficha tecnica. No hay datos suficientes para comparar con alternativas de la misma categoria (modelos de opcion multiple o de examenes), por lo que esa comparativa queda como no disponible.

## Limitaciones y advertencias

- El modelo ha memorizado las claves de respuesta; no tiene conocimiento ni capacidad de razonamiento.
- Las preguntas parafraseadas o reordenadas no se reconocen; solo funciona con identificador o texto literal del cuadernillo.
- 27 items de comprension auditiva de CAP cuyo texto impreso es solo "第N題" solo pueden responderse por identificador.
- El autor declara explicitamente que es una satira y pide no usarlo para presentarse a un examen.
- Los resultados del model-index estan marcados como no verificados (`verified: false`); la reproduccion independiente es una afirmacion del autor.
- La licencia CC0 1.0 permite uso comercial sin restricciones, pero el modelo no ofrece ninguna utilidad de generacion de texto general.
- Los textos de las preguntas y los cuadernillos no se redistribuyen; las claves se recopilaron de publicaciones oficiales de CEEC y RCPET.
- El modelo no esta afiliado a CEEC, RCPET ni a ninguna clasificacion.
- Riesgo de alucinacion: fuera de las entradas reconocidas, la cabeza de elogio genera texto no fundamentado; no debe interpretarse como respuesta informativa.
- El formato `.adom` es propietario y requiere runtimes especificos; no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa.

## Enlaces

- Hugging Face: https://huggingface.co/SiaoShiihte/ADOM-4-Beiduofen-2611
- GitHub: https://github.com/siao-ai/ADOM-4-Beiduofen-2611
- Demo (Space): https://huggingface.co/spaces/SiaoShiihte/ADOM-4-Beiduofen-2611
- Dataset TWV-1000: https://huggingface.co/datasets/SiaoShiihte/TWV-1000
- Informe tecnico: `docs/TECHNICAL_REPORT.md` (en el repositorio de GitHub)
- Especificacion del formato: `docs/FORMAT.md` (en el repositorio de GitHub)
- Resultados de benchmarks: `benchmarks/RESULTS.md` (en el repositorio de GitHub)
- Ports: https://github.com/siao-ai/ADOM-4-Beiduofen-2611/tree/main/ports
