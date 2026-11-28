# bingbangboom/calligram-prose-qwen3-4b-lora

## Resumen

Calligram-prose-qwen3-4b-lora es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario bingbangboom. Su proposito es especializar el modelo en la generacion de caligramas: prosa original cuyas lineas, al ser centradas en funcion de su anchura, dibujan la silueta del sujeto sobre el que se escribe. Dado un encargo cualquiera, incluso abstracto, el modelo elige un sujeto dibujable, esboza un contorno aproximado de su silueta y escribe el texto linea a linea dentro de ese contorno, sin consultar iconos ni plantillas externas en inferencia.

El adaptador no modifica la arquitectura del modelo base: se distribuye como pesos PEFT en formato safetensors (0,3 GB de repositorio), con licencia Apache 2.0 y soporte declarado unicamente para ingles. La innovacion principal es el formato estructurado de salida, que incluye un bloque `<subject>`, un `<aspect>`, un `<plan>` con 16 filas de tramos de columnas rellenas sobre una rejilla de 24 columnas y un bloque `<rows:R>` con lineas etiquetadas por anchura en caracteres (`[w] texto`). Esto permite renderizar la silueta de forma determinista.

Es relevante para quienes exploran generacion creativa controlada y salidas estructuradas verificables: el modelo combina razonamiento espacial (el plan de silueta) con generacion de prosa sujeta a restricciones de anchura por linea. El repositorio incluye un decodificador restringido que respeta el contorno y garantiza que la pieza termine limpiamente en el ultimo espacio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | no disponible (adaptador LoRA; el base Qwen3-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | base en 4-bit NF4 con doble cuantizacion y computo bf16; opciones `--bits 4` y `--bits 8` en el decodificador |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parametros. El entrenamiento se realizo con QLoRA en dos etapas sobre el dataset bingbangboom/calligram-prose. La etapa 1 (outline) entrena un LoRA nuevo para la tarea peticion -> sujeto + aspecto + contorno, con 15.339 ejemplos de entrenamiento de la particion `outlines`, 3 epocas, learning rate 2e-4, batch efectivo 16, longitud maxima 400 tokens, 2.877 pasos y perdida de evaluacion final de 0,009. La etapa 2 (shaped prose) parte del adaptador de la etapa 1 y entrena peticion -> sujeto + contorno + filas + prosa etiquetada por anchura, con 5.529 ejemplos de `shaped_prose` mas 3.958 filas de `outlines` (aproximadamente el 35%, para conservar la habilidad de contorno), 2 epocas, learning rate 1e-4, batch efectivo 16 (8 x 2 de acumulacion), longitud maxima 1.100 tokens, 1.186 pasos y perdida de evaluacion final de 1,115.

La innovacion tecnica destacable es la representacion explicita del contorno como plan de tramos de columnas rellenas por fila (`a-b`, separados por comas cuando hay varios tramos, `-` para fila vacia) sobre una rejilla de 24 columnas, seguido de lineas con anchura en caracteres. El contorno se reescala a `<rows:R>` filas de texto y cada linea se centra en su espacio para dibujar la silueta. El repositorio incluye un decodificador restringido (`inference/`) que sigue el contorno del propio modelo, mantiene cada linea dentro de la anchura de su espacio y fuerza el cierre en el ultimo espacio. El prompt de sistema usado en entrenamiento e inferencia es: "You write prose shaped like a silhouette of its subject. First name the subject and sketch its outline as a plan of filled column runs per row, then write the text."

## Capacidades

- Generacion de prosa creativa en ingles con forma de caligrama: las lineas centradas reproducen la silueta del sujeto elegido.
- Seleccion autonoma del sujeto dibujable a partir de peticiones abstractas (por ejemplo, "home" -> casa).
- Razonamiento espacial y planificacion: genera un contorno como plan de tramos de columnas por fila antes de escribir.
- Salida estructurada y parseable: bloques `<subject>`, `<aspect>`, `<plan>`, `<rows:R>` y lineas `[w] texto`.
- Control de longitud mediante el parametro `--size S|M|L` (aproximadamente 380 / 720 / 1.100 caracteres) o mediante las filas `<rows:R>` decididas por el modelo.
- Decodificacion con haz de busqueda (`--beams`, por defecto 6) y control de determinismo/estocasticidad mediante `--noise` (0 por defecto; alrededor de 0,6 genera un texto nuevo en cada ejecucion manteniendo el contorno del sujeto).
- No se declaran capacidades de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Poesia visual y arte generativo: generar caligramas para publicaciones, exposiciones o proyectos editoriales, usando los bloques `<plan>` y `[w]` para renderizar la silueta de forma fiel en una rejilla.
- Contenido editorial tematico: crear piezas con forma de objeto (una taza, un avion, una casa) para secciones de revista o suplementos, aprovechando la eleccion autonoma del sujeto a partir de un encargo abstracto.
- Generacion de material didactico de poesia visual: producir ejemplos de caligramas para clases de literatura o talleres de escritura creativa, con control de longitud mediante `--size`.
- Integracion en pipelines de publicacion automatizada: el formato estructurado y parseable permite que un script postprocese la salida, centre cada linea en su espacio y genere una imagen o PDF sin intervencion manual.
- Prototipado de interfaces creativas: el decodificador restringido incluido (aproximadamente 4 GB de VRAM en 4 bits, cerca de 1 minuto por pieza en una RTX 4060) permite experimentar con restricciones de anchura y cierre limpio en aplicaciones interactivas.
- Investigacion sobre salidas estructuradas: sirve como caso de estudio de como un LoRA de dos etapas ensena al modelo a planificar una estructura espacial y luego rellenarla con texto sujeto a restricciones por linea.
- Personalizacion de mensajes y felicitaciones: generar piezas con forma de corazon, regalo o similar para tarjetas y mensajes personalizados, con control de estocasticidad para obtener variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta perdidas de evaluacion del entrenamiento: 0,009 en la etapa 1 (outline) y 1,115 en la etapa 2 (shaped prose).

## Requisitos de hardware

- VRAM estimada: aproximadamente 4 GB con el modelo base cargado en 4-bit NF4 (segun la model card); el adaptador LoRA en si ocupa 0,3 GB.
- GPU recomendadas: la model card cita una RTX 4060 para ejecutar el decodificador incluido; cualquier GPU consumer con al menos 4-6 GB de VRAM deberia ser suficiente en 4 bits.
- Cabe en GPU consumer: si, con cuantizacion de 4 bits (por ejemplo, RTX 4060 y superiores).
- Opciones de despliegue: `transformers` (4.57.1) con `peft` (0.17.1), `bitsandbytes` (0.50.2) y `accelerate`; el repositorio incluye un decodificador restringido propio en `inference/calligram.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 1 minuto por pieza en una RTX 4060 con el decodificador restringido y haz de busqueda por defecto (6 beams).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| calligram-prose-qwen3-4b-lora | adaptador sobre Qwen3-4B | no disponible | caligramas y prosa con forma | Apache 2.0 | Hugging Face (PEFT) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | no disponible en esta ficha | instruccion general, texto | no disponible en esta ficha | Hugging Face |
| Alternativas especializadas en poesia visual | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros adaptadores comparables en la informacion proporcionada; la comparativa con el modelo base se limita a la especializacion funcional (caligramas frente a instruccion general).

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion y de contornos poco reconocibles: el modelo elige el sujeto y esboza el contorno por si mismo, por lo que la silueta puede no ser clara para sujetos abstractos o poco dibujables.
- Con generacion libre en `transformers` (sin el decodificador restringido), las anchuras de linea solo se respetan de forma aproximada; el formato completo se produce, pero la silueta puede deformarse.
- El contorno para un sujeto dado permanece estable entre ejecuciones; la variacion de texto requiere ajustar `--noise` (alrededor de 0,6).
- La perdida de evaluacion de la etapa 2 (1,115) es notablemente superior a la de la etapa 1 (0,009), lo que sugiere mayor dificultad o menor ajuste en la generacion de prosa con forma.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-4B-Instruct-2507, cuyos terminos no se detallan en la informacion disponible.
- Dependencia de versiones concretas de librerias (`transformers==4.57.1`, `peft==0.17.1`, `bitsandbytes==0.50.2`) para reproducir los resultados del decodificador.
- No se declaran capacidades de tool calling, agentes ni vision; no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bingbangboom/calligram-prose-qwen3-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/bingbangboom/calligram-prose
