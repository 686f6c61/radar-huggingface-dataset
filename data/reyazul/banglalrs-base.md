# reyazul/BanglaLRS-Base

## Resumen

BanglaLRS-Base es un modelo de reconocimiento visual del habla (VSR, *visual speech recognition*) o lectura de labios para bengala continuo y con vocabulario abierto. Lo desarrolla Kazi Reyazul Hasan (usuario `reyazul` en Hugging Face) y se publica como modelo base asociado al benchmark **BanglaLRS**, presentado en el paper *BanglaLRS: A Continuous, Open-Vocabulary Benchmark for Bangla Visual Speech Recognition* (WACV 2027). El modelo resuelve la transcripcion de habla bengala a partir unicamente de video del rostro, sin usar audio, lo que lo hace relevante para escenarios donde la senal acustica no esta disponible o esta degradada.

Tecnicamente es un encoder Conformer con entrenamiento conjunto CTC/atencion, construido sobre la base de [auto_avsr](https://github.com/mpc001/auto_avsr). El encoder se inicializa desde el modelo VSR ingles de LRS3 (`vsr_trlrs3_base.pth`) y el decoder se entrena desde cero para bengala. El modelo consume regiones de interes (ROI) de la boca en escala de grises de 96×96 recortadas a 88×88 a 25 fps, con preprocesado estilo AV-HuBERT, y produce caracteres bengalies sobre un vocabulario de 62 tokens.

El modelo se entrena con 100 horas de datos de entrenamiento de BanglaLRS. Con inicializacion desde LRS3 alcanza un 36,0 % de CER y un 57,0 % de WER en el conjunto de test de BanglaLRS; entrenado desde cero obtiene 59,0 % de CER y 76,0 % de WER. La licencia es Apache 2.0 y el repositorio ocupa aproximadamente 1,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer con entrenamiento conjunto CTC/atencion (basado en auto_avsr) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bengala (bn) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch (`.ckpt`) y lista de tokens JSON (`bn_tokens.json`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de auto_avsr: un encoder Conformer que procesa secuencias de ROI de la boca y un decoder que genera caracteres bengalies, entrenados conjuntamente con una combinacion de CTC y atencion (el peso de CTC usado en los resultados publicados es `ctc_weight = 0.1`). La entrada es video en escala de grises con la region de la boca recortada a 88×88 pixeles tras un recorte inicial de 96×96, muestreado a 25 fps y preprocesado al estilo AV-HuBERT. La salida es una secuencia de caracteres bengalies sobre un vocabulario de 62 tokens definido en `bn_tokens.json`.

El entrenamiento usa 100 horas de datos de BanglaLRS, un corpus construido a partir de noticias de television. El encoder se inicializa desde el modelo VSR ingles de LRS3 (`vsr_trlrs3_base.pth`), mientras que el decoder se entrena desde cero para bengala. El paper reporta ademas una escalera de escalado de datos (1,3 h / 10 h / 30 h / 100 h) y un barrido sobre el peso de decodificacion CTC/atencion. La decodificacion se realiza con busqueda por haces (`--beam-size 20` en el ejemplo de uso).

## Capacidades

- Reconocimiento visual del habla (lectura de labios) para bengala continuo y con vocabulario abierto.
- Transcripcion a nivel de caracteres bengalies (vocabulario de 62 tokens).
- Funcionamiento exclusivamente visual: no requiere ni usa audio.
- Procesamiento de video de rostro con deteccion facial y extraccion de ROI de la boca mediante el pipeline de preprocesado del repositorio.
- Decodificacion con busqueda por haces configurable.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingue: no disponible (solo bengala).
- No dispone de modo *thinking*, vision general, audio ni otras capacidades especiales mas alla del VSR.

## Casos de uso

- Transcripcion de archivos audiovisuales de noticias en bengala cuando el audio esta ausente, corrupto o es ininteligible: el modelo procesa el video del rostro y genera la transcripcion a nivel de caracteres, aprovechando que fue entrenado sobre el mismo dominio de noticias de television.
- Accesibilidad para personas con discapacidad auditiva en contenido bengali: permite generar subtitulos a partir del movimiento labial en grabaciones donde no se dispone de pista de audio o esta es de baja calidad.
- Investigacion en reconocimiento visual del habla: sirve como linea base reproducible para comparar nuevos modelos sobre el benchmark BanglaLRS, con metricas CER y WER publicadas.
- Analisis forense o de archivo de material audiovisual sin audio: la lectura de labios puede aportar una transcripcion aproximada del contenido hablado en grabaciones de television.
- Vigilancia de emisiones y monitorizacion de medios: permite indexar o buscar contenido hablado en emisiones de noticias bengalies a partir del video, sin depender de la calidad del audio.
- Desarrollo de sistemas multimodales de reconocimiento del habla: el modelo puede integrarse como rama visual en pipelines de reconocimiento audiovisual del habla (AVSR) para bengala, combinando sus salidas con un ASR acustico.
- Prototipado y evaluacion de pipelines de preprocesado facial: el repositorio incluye el pipeline de deteccion facial y extraccion de ROI, util para validar cadenas de procesado de video antes de desplegar modelos VSR.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test completo de BanglaLRS, con `ctc_weight = 0.1`:

| Datos de entrenamiento | Inicializacion del encoder | CER (%) | WER (%) |
|---|---|---|---|
| 100 h | LRS3-pretrained | 36,0 | 57,0 |
| 100 h | desde cero | 59,0 | 76,0 |

Los resultados del model-index estan marcados como no verificados (`verified: false`). El paper reporta ademas una escalera de escalado de datos (1,3 h / 10 h / 30 h / 100 h) y un barrido sobre el peso de decodificacion CTC/atencion, cuyos valores concretos no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio es de 1,4 GB, lo que da una referencia aproximada del peso de los checkpoints, pero no se publican cifras de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamano del checkpoint (entorno a 1,4 GB) es plausible que quepa en GPUs de consumo, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: el modelo se distribuye como checkpoint PyTorch y se ejecuta con el script `bn_decode.py` del repositorio de GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Idiomas | Datos de entrenamiento | CER / WER | Licencia |
|---|---|---|---|---|---|
| BanglaLRS-Base | VSR (solo visual) | bengala | 100 h BanglaLRS | 36,0 % / 57,0 % | Apache 2.0 |
| Modelo VSR LRS3 base de auto_avsr (`vsr_trlrs3_base.pth`) | VSR (solo visual) | ingles | LRS3 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Alternativas VSR para bengala | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de otros modelos VSR para bengala en la informacion proporcionada que permitan una comparacion directa de rendimiento.

## Limitaciones y advertencias

- Entrenado unicamente con noticias de television: se espera una precision menor en otras condiciones de grabacion, estilos de habla y tematicas.
- Modelo exclusivamente visual: no utiliza audio, por lo que no puede aprovechar informacion acustica cuando esta disponible.
- La mayoria de los errores son lexicos (palabra distinta); una proporcion menor son casi-aciertos flexivos sobre la raiz correcta.
- El CER del 36,0 % y el WER del 57,0 % implican un nivel de error alto para muchos usos en produccion; conviene validar el modelo en el dominio concreto antes de desplegarlo.
- Requiere aplicar exactamente el mismo pipeline de deteccion facial y extraccion de ROI usado en el entrenamiento; desviaciones en el preprocesado degradan el rendimiento.
- Riesgo de alucinacion: no disponible como dato especifico, aunque al ser un modelo discriminativo de transcripcion el riesgo principal es la sustitucion lexica, no la generacion libre.
- Sesgos conocidos: no disponibles; al entrenarse con noticias de television puede heredar sesgos de ese dominio (locutores, tematicas y estilos concretos).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento originales (BanglaLRS) y del modelo LRS3 usado para inicializar el encoder.
- Los resultados de benchmarks declarados por el autor no estan verificados (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reyazul/BanglaLRS-Base
- Repositorio de codigo: https://github.com/kreyazulh/BanglaLRS
- Repositorio base auto_avsr: https://github.com/mpc001/auto_avsr
- Paper: *BanglaLRS: A Continuous, Open-Vocabulary Benchmark for Bangla Visual Speech Recognition* (WACV 2027), autores Kazi Reyazul Hasan, Chowdhury Mohammad Rakin Haider y A. B. M. Alim Al Islam. Enlace directo no disponible en la informacion proporcionada.
