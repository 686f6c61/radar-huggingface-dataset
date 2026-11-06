# julioalonzom/lector-4b-v1

## Resumen

lector-4b-v1 es un modelo de transcripcion OCR especializado en impresos escolasticos latinos de los siglos XVI a XX, desarrollado por julioalonzom bajo el sello Schola Thomistica. Su tarea es concreta: recibe una imagen de una pagina y devuelve un unico archivo Markdown con la transcripcion completa en el dialecto que el autor denomina "diplomatic-v1", que preserva grafias de imprenta (æ/œ, &, acentos, u/v, marcas de abreviatura), normaliza la s larga a s y codifica notas al pie y notas marginales con marcadores propios.

Tecnicamente es un fine-tune completo de Qwen/Qwen3.5-4B, un modelo multimodal de tipo image-text-to-text con 4.539.265.536 parametros en safetensors (el autor cita 4,66B y 9,3 GB en bf16). El entrenamiento consistio en 2 epocas sobre 3.732 paginas y 2.000 lineas, con el mismo dataset y prompt que su predecesor lector-2b-v1; la unica diferencia es el tamano del modelo base.

Su relevancia es practica: en la benchmark interna lector-bench v0 reduce el error de caracter (CER) a 0,076 en las 146 paginas y a 0,039 en el split publico de 86 paginas, con solo 3 omisiones y 1 insercion de runs de 30 o mas palabras, y localiza 71 de 103 notas marginales. Frente a lector-2b-v1 mejora en todas las metricas publicadas, a costa de un modelo el doble de grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (base Qwen/Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 (4,66B segun el autor) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado e inferido en bf16; el repo solo publica safetensors) |
| Idiomas soportados | la (latin) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 9,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal que acepta imagen y texto y genera texto. El autor realiza un fine-tune completo (no LoRA ni adaptadores) durante 2 epocas sobre 3.732 paginas mas 2.000 lineas de impresos escolasticos latinos, con el mismo corpus y el mismo prompt que lector-2b-v1. El procesamiento de imagen es fijo: una pagina en orientacion vertical, RGB, con el lado mayor redimensionado a 1280 px mediante Lanczos, y un procesador configurado con `min_pixels = 256*32*32` y `max_pixels = 1280*1280`.

La innovacion no esta en la arquitectura sino en la definicion de la salida: un dialecto de transcripcion cerrado ("diplomatic-v1") con reglas explicitas para notas al pie (`^[…]`), notas marginales (`^[⟦M⟧ …]`) y notas continuadas desde la pagina anterior (`⟦CONTINUED-NOTE⟧`). La decodificacion recomendada es greedy (`do_sample=False`, `repetition_penalty=1.0`), `max_new_tokens=3500`, parada en `<|im_end|>` o EOS y plantilla de chat con `enable_thinking=False`. El autor no documenta RLHF, DPO ni fases de alineamiento adicionales.

## Capacidades

- Transcripcion OCR de pagina completa de impresos latinos escolasticos (siglos XVI-XX) a Markdown en un solo paso.
- Preservacion de grafias historicas: æ/œ, &, acentos, distincion u/v y marcas de abreviatura; normalizacion de la s larga a s.
- Deteccion y marcado de notas al pie con el formato `^[…]`.
- Deteccion y marcado de notas marginales con el formato `^[⟦M⟧ …]`, incluida la reconstruccion de una nota continuada de la pagina anterior.
- Salida estructurada como archivo Markdown de una sola pagina, pensada para encadenarse en un pipeline de digitalizacion.
- Capacidad conversacional derivada del modelo base (pipeline `conversational`), aunque el uso previsto es el prompt unico de lectura.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Digitalizacion masiva de fondos antiguos latinos: procesar pagina a pagina los escaneos de una biblioteca escolastica y obtener Markdown listo para indexar, con la ventaja de que el modelo ya conoce el dialecto de salida y no requiere postproceso de normalizacion.
- Creacion de corpus para linguistica historica: la preservacion de grafias (æ/œ, u/v, abreviaturas) permite construir ediciones diplomaticas utilizables en estudios de ortografia y variacion, algo que un OCR generico destruye al normalizar.
- Edicion critica asistida: las notas al pie y marginales quedan delimitadas con marcadores, de modo que un editor puede extraerlas programaticamente y revisarlas por separado del cuerpo de texto.
- Pipeline de human-in-the-loop en archivos y bibliotecas: el CER de 0,039 en el split publico y las 3 omisiones de runs de 30+ palabras en 86 paginas acotan el volumen de revision manual a las paginas marcadas por el guard de bucles.
- Procesamiento por lotes en infraestructura propia: al ser apache-2.0 y pesar 9,1 GB en bf16, se puede desplegar en una unica GPU y ejecutar a un ritmo de aproximadamente 8 segundos por pagina (medido en H200), lo que permite planificar el throughput de un proyecto de digitalizacion.
- Segmentacion de libros con notas continuadas: el bloque `⟦CONTINUED-NOTE⟧` permite reconstruir notas que cruzan de una pagina a la siguiente sin intervencion manual, util en la conversion de libros completos y no solo de paginas sueltas.
- Filtrado y scouting previo de colecciones: el modelo puede emplearse para una primera pasada que detecte que paginas contienen notas marginales (71 de 103 encontradas) y priorizar asi la revision humana.

## Benchmarks y rendimiento

Resultados de lector-bench v0 (CER sobre Markdown con folding, ponderado por pagina, aplicado tras el guard de bucles):

| Modelo | Todas (146 pag.) | Split publico (86 pag.) | omit30 / insert30 | Notas marginales encontradas |
|---|---|---|---|---|
| ft2 (Qwen3-VL-2B, interno) | 0,137 | 0,059 | 8 / 1 | 4 / 103 |
| ft4 (Qwen3.5-2B, interno) | 0,099 | 0,089 | 14 / 3 | 45 / 103 |
| lector-2b-v1 (ft5) | 0,092 | 0,066 | 6 / 3 | 48 / 103 |
| lector-4b-v1 (ft6) | 0,076 | 0,039 | 3 / 1 | 71 / 103 |

Desglose por fuente citado por el autor: Alvarez 1610, CER 0,022 (lector-2b-v1: 0,053); Banez 1602, CER 0,256 (lector-2b-v1: 0,449); impresos de los siglos XIX-XX, CER entre 0,002 y 0,04. Perdida de validacion: 0,087 (lector-2b-v1: 0,103). Tiempo de generacion aproximado de 8 segundos por pagina, medido en una H200 (lector-2b-v1 se midio en una H100).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9,3 GB solo para pesos, mas el coste del procesador de imagen y de la cache KV; en la practica, una GPU de 16 GB o mas es el minimo comodo.
- GPU recomendadas: H200 o H100 para el ritmo reportado de aproximadamente 8 segundos por pagina; A100 40/80 GB como alternativa de centro de datos.
- GPU de consumo: cabe en tarjetas de 16-24 GB (por ejemplo, RTX 4090 o RTX A5000) en bf16, aunque el autor no publica mediciones en estas tarjetas.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio; el unico formato disponible es safetensors en bf16.
- Opciones de despliegue: al ser un modelo multimodal de la familia Qwen, los servidores compatibles con image-text-to-text (vLLM con soporte multimodal, TGI) son las vias naturales; llama.cpp y Ollama requeririan una conversion a GGUF que no esta disponible en el repositorio.
- Throughput: aproximadamente 8 segundos por pagina en H200 segun el autor; no se publican cifras de tokens por segundo ni de paginas por hora.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER lector-bench v0 (publico) | Notas marginales | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lector-4b-v1 | 4,54B | no disponible | 0,039 | 71 / 103 | apache-2.0 | Hugging Face |
| lector-2b-v1 | no disponible (base Qwen3.5-2B) | no disponible | 0,066 | 48 / 103 | no disponible en la informacion | Hugging Face |
| ft4 (Qwen3.5-2B, interno) | no disponible | no disponible | 0,089 | 45 / 103 | no disponible | no publicado |
| ft2 (Qwen3-VL-2B, interno) | no disponible | no disponible | 0,059 | 4 / 103 | no disponible | no publicado |

No se dispone de datos para comparar con OCR genericos comerciales ni con otros modelos de transcripcion de latin en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento pobre en impresos antiguos muy densos y abreviados: Banez 1602 alcanza un CER de 0,256, y el autor senala que ninguna pagina de entrenamiento se parece a ese material.
- Puede detenerse al pie de la primera columna de una pagina antigua a dos columnas (ejemplo citado: Hurtado p. 42, media pagina); es necesario comparar la longitud de la salida con la pagina original.
- Los bucles de repeticion son menos frecuentes que en lector-2b-v1 pero siguen siendo posibles: el guard de postproceso (eliminacion de lineas de tabla y colapso de runs repetidos 3 o mas veces) debe aplicarse siempre. Si el guard actua, la pagina ha perdido texto y debe releerse por otra via.
- El rol de las notas marginales (`⟦M⟧`, `⟦R⟧`) es una conjetura del modelo: la precision de 2b-v1 en esa tarea fue de 0,59, y el autor recomienda decidir el tipo de nota en las fases de scouting y control de calidad, no en la lectura.
- El prompt debe ser exactamente el de `prompt.txt` del repositorio, como unico turno de usuario tras la imagen; prompts posteriores pertenecen a modelos posteriores y pueden degradar la salida.
- El modelo solo declara soporte de latin; no hay evidencia de comportamiento en otras lenguas.
- No se documentan sesgos socioculturales especificos, pero al entrenarse exclusivamente con impresos escolasticos latinos su dominio queda acotado a ese genero y epoca.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre la exactitud de las transcripciones; en produccion conviene mantener revision humana en las paginas marcadas.
- El repositorio tiene 32 descargas y ninguna valoracion en el momento de la consulta, por lo que la validacion externa es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julioalonzom/lector-4b-v1
- Modelo predecesor: https://huggingface.co/julioalonzom/lector-2b-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Ficha en free2aitools: https://free2aitools.com/model/julioalonzom/lector-4b-v1
