# ShanthiStream/qwen3-5-4b-3d-coder-demo

## Resumen

ShanthiStream/qwen3-5-4b-3d-coder-demo es un Space de demostracion alojado en Hugging Face, no un modelo en si. Se trata de una aplicacion Gradio construida con llama-cpp-python que sirve como interfaz interactiva para el modelo prithivMLmods/Qwen3.5-4B-3D-Coder-GGUF, una cuantizacion Q4_K_M de un fine-tune de Qwen/Qwen3.5-4B orientado a la generacion de escenas Three.js.

El proposito del Space es permitir que un usuario introduzca una descripcion en lenguaje natural (por ejemplo, "un Saturno giratorio con anillos y una luna") y obtener como salida un unico archivo HTML autocontenido con codigo JavaScript de Three.js que renderiza la escena descrita. El Space muestra el codigo generado y ofrece una previsualizacion del resultado.

El modelo subyacente, segun la informacion disponible, es un fine-tune de Qwen3.5-4B desarrollado por CCORE, con licencia Apache-2.0, entrenado sobre 4.146 ejemplos de escenas Three.js con trazas de razonamiento completas, y distribuido en safetensors FP16 junto con cuantizaciones GGUF Q4_K_M y Q8_0. El Space en cuestion tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia e idiomas no estan declarados en la ficha del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-4B, presumiblemente transformer denso) |
| Parametros totales | 4B (segun la denominacion del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (usada en el Space), Q8_0 y FP16 disponibles en el repositorio del modelo |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el Space; Apache-2.0 para el fine-tune Qwen3.5-4B-3D-Coder segun la fuente secundaria |
| Formato de pesos | safetensors (FP16) y GGUF (Q4_K_M, Q8_0) en el modelo referenciado; el Space no distribuye pesos |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.5-4B ni del fine-tune. Por la denominacion y por los datos de la fuente secundaria, se trata de un modelo de generacion de texto de 4.000 millones de parametros, presumiblemente un transformer denso, afinado sobre Qwen/Qwen3.5-4B.

El fine-tune Qwen3.5-4B-3D-Coder fue entrenado por CCORE sobre 4.146 ejemplos de escenas Three.js, incluyendo trazas de razonamiento completas (full thinking traces). Este enfoque de entrenamiento con trazas de pensamiento sugiere que el modelo produce un razonamiento intermedio antes de emitir el codigo final, lo que puede mejorar la coherencia estructural de las escenas generadas. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion del dataset mas alla de los ejemplos Three.js, ni sobre si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de codigo Three.js: produce archivos HTML/JavaScript autocontenidos que renderizan escenas 3D a partir de descripciones en lenguaje natural.
- Razonamiento con trazas de pensamiento: el fine-tune fue entrenado con full thinking traces, lo que indica soporte de modo de razonamiento explicito antes de la respuesta.
- Generacion de texto general: hereda las capacidades del modelo base Qwen3.5-4B, aunque no se detallan en la informacion disponible.
- Generacion de codigo en un unico archivo: la salida del Space es un HTML autocontenido, lo que implica capacidad de estructurar codigo HTML, CSS y JavaScript de forma cohesiva.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de prototipos de escenas 3D: un desarrollador describe una escena ("un Saturno giratorio con anillos y una luna") y obtiene un HTML con Three.js listo para previsualizar, acelerando la creacion de maquetas visuales.
- Educacion y demostraciones de WebGL: el modelo puede generar ejemplos didacticos de escenas Three.js para cursos o tutoriales, con codigo legible y autocontenido.
- Generacion de assets para videojuegos o interfaces: util para producir escenas de fondo, visualizadores o entornos simples que luego se integran en proyectos mayores.
- Iteracion rapida en diseno 3D: el flujo prompt-codigo-previsualizacion del Space permite refinar una escena en sucesivas pasadas sin escribir codigo manualmente.
- Automatizacion de contenido web interactivo: generar paginas HTML con visualizaciones 3D para blogs, portfolios o landing pages a partir de una descripcion textual.
- Base para pipelines de generacion de codigo asistida: al ser un fine-tune de 4B con cuantizacion GGUF, puede integrarse en herramientas locales de generacion de codigo para tareas acotadas de Three.js, ejecutables en hardware modesto.
- Experimentacion con modelos pequenos en local: sirve como banco de pruebas para evaluar la calidad de un fine-tune de 4B en una tarea especializada antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 4B en Q4_K_M es habitual un rango de 2,5 a 3,5 GB, y en Q8_0 en torno a 4,5 a 5 GB, aunque estas cifras no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; por tamano, un modelo de 4B cuantizado a Q4_K_M es plausible que quepa en GPU de consumo con 6-8 GB de VRAM, pero no se aporta dato verificado.
- Opciones de despliegue: llama-cpp-python (usado en el Space), Gradio como interfaz; el repositorio del modelo ofrece GGUF Q4_K_M y Q8_0, lo que habilita llama.cpp y derivados. No se mencionan vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ShanthiStream/qwen3-5-4b-3d-coder-demo (Space) | no aplica (demo) | no disponible | no disponible | Hugging Face Space | Interfaz Gradio sobre Qwen3.5-4B-3D-Coder-GGUF Q4_K_M |
| prithivMLmods/Qwen3.5-4B-3D-Coder-GGUF | 4B | no disponible | no disponible en la informacion | Hugging Face | Cuantizacion GGUF del fine-tune de CCORE |
| sekkit/Qwen3.5-4B-GLB-3D-Coder | 4B | no disponible | no disponible | Hugging Face | Otro fine-tune de 4B orientado a escenas 3D |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | no disponible | Hugging Face | Modelo base del fine-tune |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio es un Space de demostracion, no un modelo distribuible: no contiene pesos ni una model card tecnica completa.
- La licencia del Space no esta declarada; la licencia Apache-2.0 mencionada en la fuente secundaria corresponde al fine-tune Qwen3.5-4B-3D-Coder, no al Space en si.
- El modelo esta especializado en escenas Three.js; fuera de esa tarea su calidad no esta documentada.
- No hay informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad del fine-tune.
- No se declaran idiomas soportados; el rendimiento en castellano no esta verificado.
- El contexto maximo no esta documentado, lo que limita la planificacion de prompts largos en produccion.
- El Space tiene 0 descargas y 0 likes, lo que indica ausencia de validacion comunitaria.
- El codigo generado es HTML/JavaScript ejecutable; debe revisarse antes de publicarse por posibles problemas de seguridad o dependencias externas.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.

## Enlaces

- Space en Hugging Face: https://huggingface.co/ShanthiStream/qwen3-5-4b-3d-coder-demo
- Modelo GGUF referenciado: https://huggingface.co/prithivMLmods/Qwen3.5-4B-3D-Coder-GGUF
- Fine-tune alternativo: https://huggingface.co/sekkit/Qwen3.5-4B-GLB-3D-Coder
- Noticia en AI Weekly: https://aiweekly.co/alerts/ccore-open-sources-qwen35-4b-3d-coder-for-threejs-scenes
