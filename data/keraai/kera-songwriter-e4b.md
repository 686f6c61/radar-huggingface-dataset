# KeraAI/kera-songwriter-e4b

## Resumen

Kera Songwriter (Gemma 4 E4B) es un adaptador LoRA de pequeno tamano publicado por KeraAI sobre el modelo base `google/gemma-4-E4B-it`. Su funcion es transformar una peticion breve en lenguaje natural (por ejemplo, "una balada triste de piano sobre dejar el hogar") en un plan completo y estructurado para un generador de musica por IA: etiquetas de estilo, descripcion vocal, tempo, tonalidad, compas, duracion, un desglose seccion a seccion con niveles de energia y una letra original que encaje con ese plan.

El adaptador esta pensado para modelos de musica como ACE-Step 1.5, donde la calidad de las etiquetas de estilo y la forma de la letra determinan gran parte del resultado. La salida es texto plano en un formato fijo (bloques `TAGS`, `VOCAL`, `BPM/KEY/TIME/LENGTH`, `PLAN`, `BRIEF` y `LYRICS`), de modo que puede alimentar directamente el prompt de estilo y la letra de un generador musical, o servir como punto de partida para cualquier flujo de composicion.

El modelo tiene 38.666.240 parametros en el adaptador (safetensors) y un repositorio de 0,2 GB. Se distribuye bajo licencia Apache 2.0, solo en ingles, y esta disponible tanto en formato GGUF para llama.cpp y Kera como en safetensors para PEFT/transformers. Es relevante ahora porque demuestra un caso de uso muy especializado (planificacion de canciones y escritura de letras originales) resuelto con un LoRA diminuto sobre un modelo base pequeno, desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `google/gemma-4-E4B-it` |
| Parametros totales | 38.666.240 (adaptador LoRA); parametros del modelo base no disponibles |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de despliegue usan `-c 16384`) |
| Tipos de cuantizacion | GGUF (el autor ejecuta sobre Q4_K_M del modelo base); adaptador en safetensors para PEFT |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `adapter_config.json`) y GGUF (`kera-songwriter-e4b-lora.gguf`) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA (Low-Rank Adaptation) entrenado mediante PEFT sobre el modelo base Gemma 4 E4B en su variante instruct (`google/gemma-4-E4B-it`). El adaptador no modifica la arquitectura del transformer subyacente: anade matrices de bajo rango que ajustan el comportamiento del modelo base para una tarea concreta. El resultado se empaqueta en dos formatos: safetensors para cargar con `PeftModel.from_pretrained` en transformers, y GGUF para aplicarlo sobre cualquier cuantizacion GGUF del modelo base en llama.cpp o Kera.

El autor indica que el modelo fue entrenado exclusivamente para escribir letras originales y que nunca se le mostraron letras de canciones reales (seccion *Training data* de la model card, cuyo detalle completo no esta disponible en la informacion proporcionada). Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo tecnicas de alineacion como RLHF o DPO. La model card si documenta el prompt de sistema exacto con el que fue entrenado, lo que condiciona el uso correcto del adaptador, y recomienda desactivar el modo de razonamiento (`enable_thinking: false`) durante la inferencia.

## Capacidades

- Generacion de planes de cancion estructurados: etiquetas de estilo (12-22 etiquetas separadas por comas), linea vocal, BPM, tonalidad, compas y duracion.
- Desglose seccion a seccion de la cancion (intro, verso, estribillo, solo, puente, etc.) con longitud en compases, energia de 1 a 10 y descripcion de lo que suena en cada parte.
- Redaccion de un brief de letra: tema, punto de vista, tono, imagenes, rima y hook.
- Escritura de letras originales que encajan con el plan, con marcas de seccion entre corchetes.
- Modo instrumental: cuando se solicita, las letras se reducen a nombres de seccion.
- Adaptacion a peticiones con parametros opcionales de duracion y caracter instrumental en lineas separadas.
- Generacion de texto general heredada del modelo base (pipeline `text-generation`), aunque el adaptador esta especializado en songwriting.
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion proporcionada.

## Casos de uso

- Generacion de prompts de estilo para modelos de musica por IA: el adaptador produce directamente el bloque `TAGS` y la linea `VOCAL` que se pasan como style prompt a generadores como ACE-Step 1.5, evitando la redaccion manual de etiquetas.
- Composicion asistida de letras: a partir de un tema y un tono, el modelo entrega letras originales estructuradas por secciones, utiles para maquetas rapidas o para artistas que necesitan un punto de partida.
- Prototipado rapido de canciones completas: con una sola peticion se obtiene plan, brief y letra, lo que permite iterar sobre conceptos musicales antes de entrar en produccion.
- Herramientas creativas para aficionados: integrado en una interfaz sencilla, permite a usuarios sin conocimientos musicales describir una cancion y obtener un plan coherente con tempo, tonalidad y estructura.
- Generacion de musica de fondo para videojuegos o audiovisual: peticiones de temas instrumentales (por ejemplo, "cinematic orchestral battle theme") producen planes seccion a seccion con energia, utiles para sincronizar con escenas.
- Educacion musical y analisis de estructura: el desglose en compases y niveles de energia sirve como material didactico para explicar como se construye una cancion.
- Despliegue local ligero: al ser un LoRA pequeno sobre un modelo base cuantizable, puede ejecutarse en un portatil con llama.cpp o Kera para generar planes de cancion sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si ocupa muy poco (repositorio de 0,2 GB); el requisito real lo marca el modelo base Gemma 4 E4B sobre el que se aplica.
- El autor ejecuta el modelo base en cuantizacion Q4_K_M con llama.cpp y Kera, lo que sugiere que cabe en GPU de consumo, aunque no se especifican VRAM exacta ni GPU concretas en la informacion proporcionada.
- Opciones de despliegue documentadas: Kera (`kera serve` con `--lora`), llama.cpp (`llama-server` con `--lora`) y transformers + PEFT (`PeftModel.from_pretrained`).
- Parametros de inferencia recomendados por el autor: `enable_thinking: false`, temperatura 0,8, top-p 0,95 y unos 2.400 tokens nuevos como maximo.
- Los ejemplos de despliegue usan contexto de 16.384 tokens (`-c 16384`) y todas las capas en GPU (`-ngl 99`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables en la informacion proporcionada. Como referencia estructural, el adaptador se apoya en `google/gemma-4-E4B-it` como modelo base, pero no se han facilitado especificaciones de ese modelo base ni de alternativas especializadas en songwriting para establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kera Songwriter (Gemma 4 E4B) | 38.666.240 (LoRA) | no disponible | Apache 2.0 | Hugging Face (GGUF y safetensors) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta soporte multilingue.
- Esta especializado en songwriting: fuera de esa tarea su comportamiento depende del modelo base y puede degradarse.
- El prompt de sistema debe usarse exactamente como se indica; el modelo fue entrenado con el y variaciones pueden alterar el formato de salida.
- Riesgo de alucinacion inherente a los modelos de lenguaje: puede inventar terminos musicales, estructuras incoherentes o letras que no encajen con el brief.
- El autor afirma que el modelo solo escribe letras originales y que nunca vio letras de canciones reales, pero no se aporta detalle del dataset de entrenamiento que permita verificarlo.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar tambien las condiciones del modelo base `google/gemma-4-E4B-it`, cuyos terminos no se detallan aqui.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.
- La model card incluye una referencia a `Vortexal2/kera-songwriter-e4b` en el ejemplo de PEFT, distinta del ID del repositorio (`KeraAI/kera-songwriter-e4b`); conviene comprobar la ruta correcta antes de cargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KeraAI/kera-songwriter-e4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Referencia a PEFT en la model card: https://huggingface.co/Vortexal2/kera-songwriter-e4b
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
