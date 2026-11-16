# happytunesai/orpheus-large-ft-onnx

## Resumen

Orpheus Music Transformer (large, quality fine-tune) - ONNX export for MidiEditor AI es una conversion a formato ONNX del checkpoint grande de Orpheus Music Transformer, un modelo de generacion de musica simbolica (MIDI) desarrollado originalmente por asigalov61 bajo el paraguas de Project Los Angeles / Tegridy Code. Esta version concreta la publica happytunesai con el objetivo de integrar el modelo en el editor MIDI MidiEditor AI, de modo que su componente MidiCreator pueda continuar, componer y reajustar la altura (re-pitch) de pistas MIDI directamente dentro del editor mediante ONNX Runtime, sin necesidad de un entorno Python.

El modelo original es un transformer de 16 capas y 16 cabezas de atencion entrenado sobre representaciones simbolicas de musica (tokens MIDI), no sobre audio. Esta exportacion no reentrena ni ajusta el modelo: reconstruye la red como un unico grafo ONNX, sustituye la atencion por el operador `GroupQueryAttention` de ONNX Runtime (con rotary embedding interno y buffers key/value en float16 por capa) y cuantiza a 4 bits las matrices de las multiplicaciones (esquema `MatMulNBits` con una escala por cada 32 pesos). El resultado es un fichero de 571 MB ejecutable en CPU, con una salida cercana pero no identica a la del checkpoint original.

Es relevante ahora porque demuestra un patron practico de despliegue de modelos generativos musicales en aplicaciones de escritorio: cuantizacion agresiva a 4 bits, atencion optimizada para ONNX Runtime y empaquetado en un unico grafo que elimina la dependencia de Python. La licencia Apache-2.0 facilita su reutilizacion comercial, aunque el modelo esta especializado exclusivamente en musica simbolica y no cubre texto, codigo ni vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (16 capas, 16 cabezas de atencion) reconstruido como grafo ONNX unico con `GroupQueryAttention` |
| Parametros totales | no disponible (el checkpoint original no declara el recuento en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits block-wise (`MatMulNBits`, una escala por cada 32 pesos); buffers key/value en float16 |
| Idiomas soportados | no disponible (modelo de musica simbolica, no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`orpheus.onnx`, 571 MB) + `orpheus.json` (1 KB, tamanos e ids de token) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder de 16 capas y 16 cabezas que opera sobre secuencias de tokens MIDI, es decir, musica simbolica representada como eventos discretos (notas, tiempos, velocidades y posiblemente meta-eventos). El checkpoint de origen es `Orpheus_Music_Transformer_Large_Quality_Fine_Tuned_Model_2027_steps_1.2913_loss_0.6263_acc.pth`, un fine-tune de calidad entrenado durante 2027 pasos con una perdida de 1,2913 y una precision de 0,6263. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de esta exportacion reside en la conversion: la red se reconstruye como un unico grafo ONNX en el que la atencion se implementa con el operador `GroupQueryAttention` del dominio `com.microsoft`, incorporando el rotary embedding dentro del propio operador y manteniendo un buffer key/value por capa en float16. Las matrices de las multiplicaciones se cuantizan a 4 bits con `MatMulNBits` y una escala compartida por cada bloque de 32 pesos. Esta combinacion reduce drasticamente el tamano del fichero y permite inferencia en CPU, a costa de una pequena divergencia respecto a la salida del modelo original. El grafo depende de ONNX Runtime y no carga en otros runtimes ONNX.

## Capacidades

- Generacion de musica simbolica en formato MIDI: continuacion de pistas existentes y composicion de material nuevo.
- Reajuste de altura (re-pitch) de pasajes MIDI dentro del editor, segun la descripcion del autor.
- Continuacion de contexto musical: el modelo toma una secuencia de tokens MIDI y predice los siguientes.
- Inferencia en CPU mediante ONNX Runtime, sin dependencia de Python.
- Integracion directa con MidiEditor AI a traves del menu MidiCreator > "Models...".
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues, de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Composicion asistida dentro de un editor MIDI: el musico escribe un fragmento y el modelo lo continua respetando el estilo y la estructura previa, gracias a la integracion nativa con MidiEditor AI mediante ONNX Runtime.
- Reajuste de tonalidad o re-pitch de pasajes: el modelo permite transponer o reescribir alturas de notas dentro del editor sin exportar a Python, util para arreglos y variaciones.
- Generacion de bocetos musicales rapidos: un compositor puede producir ideas iniciales de varias pistas y editarlas a continuacion, aprovechando la inferencia en CPU para trabajar en local.
- Prototipado de herramientas musicales: desarrolladores que construyen editores o DAWs pueden embeber el grafo ONNX en aplicaciones de escritorio (C++, C#, Rust) sin montar un stack Python.
- Educacion musical: estudiantes pueden explorar continuaciones generadas de sus propios ejercicios MIDI y comparar variaciones en tiempo real dentro del editor.
- Investigacion en musica simbolica: el modelo sirve como baseline cuantizado para experimentos de generacion MIDI con requisitos de hardware minimos, al ejecutarse en CPU.
- Distribucion de aplicaciones musicales offline: al ser un unico fichero ONNX de 571 MB con licencia Apache-2.0, puede empaquetarse en instaladores de escritorio sin dependencias de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica proporcionada corresponde al entrenamiento del checkpoint original (2027 pasos, perdida 1,2913, precision 0,6263), no a una evaluacion de generacion musical.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo esta pensado para ejecutarse en CPU con ONNX Runtime; el fichero pesa 571 MB y los buffers key/value son float16.
- GPU recomendadas: no disponible; el autor no documenta aceleracion por GPU para esta exportacion.
- Compatibilidad con GPU de consumo: no confirmada. El grafo usa `GroupQueryAttention` del dominio `com.microsoft`, disponible en ONNX Runtime, pero no se especifica el proveedor de ejecucion (CPU, CUDA, DirectML) soportado.
- Opciones de despliegue: ONNX Runtime exclusivamente. No es compatible con llama.cpp, Ollama, TGI ni vLLM, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Orpheus Music Transformer (large, ONNX 4-bit) | Transformer MIDI simbolico | no disponible | no disponible | Apache-2.0 | ONNX cuantizado 4 bits | Hugging Face (este repo) |
| Orpheus Music Transformer (original) | Transformer MIDI simbolico | no disponible | no disponible | Apache-2.0 | Checkpoint PyTorch (.pth) | Hugging Face (asigalov61) |
| Alternativas de musica simbolica (p. ej. Music Transformer, MuseNet) | Transformer MIDI | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparacion con otros modelos de musica simbolica no puede completarse con datos verificables a partir de la informacion disponible; se indica "no disponible" para las alternativas.

## Limitaciones y advertencias

- La salida de esta exportacion es cercana pero no identica a la del checkpoint original, debido a la cuantizacion a 4 bits.
- El grafo depende de ONNX Runtime y del operador `GroupQueryAttention` del dominio `com.microsoft`; no carga en otros runtimes ONNX.
- Modelo especializado exclusivamente en musica simbolica MIDI: no procesa texto, codigo, vision ni audio.
- No se documentan sesgos, pero al ser un modelo entrenado sobre un corpus musical concreto, puede reproducir sesgos estilisticos del dataset original.
- Riesgo de alucinacion musical: puede generar pasajes incoherentes o fuera de estilo, especialmente en contextos largos o poco representados.
- No se especifica la longitud de contexto soportada, lo que limita el diseno de aplicaciones que dependan de pasajes largos.
- La licencia Apache-2.0 permite uso comercial, pero el autor de la conversion la ofrece "tal cual", sin garantia; conviene verificar la licencia del checkpoint original y los creditos a Project Los Angeles / Tegridy Code.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni de validacion por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/happytunesai/orpheus-large-ft-onnx
- Modelo original: https://huggingface.co/asigalov61/Orpheus-Music-Transformer
- Space del modelo original: https://huggingface.co/spaces/asigalov61/Orpheus-Music-Transformer
- Coleccion del modelo original: https://huggingface.co/collections/asigalov61/orpheus-music-transformer
- Repositorio de MidiEditor AI: https://github.com/happytunesai/MidiEditor_AI
