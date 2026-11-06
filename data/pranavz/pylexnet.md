# Pranavz/pylexnet

## Resumen

pylexnet es una red neuronal recurrente bidireccional disenada especificamente para la tarea de resaltado de sintaxis (syntax highlighting) de codigo fuente Python. A diferencia de los grandes modelos de lenguaje, no se trata de un modelo generativo ni de proposito general: es un etiquetador de secuencias a nivel de byte que clasifica cada byte de entrada en una de nueve clases lexicas. Su caracteristica mas singular es que sus pesos no proceden de entrenamiento alguno; han sido disenados manualmente, lo que elimina por completo la necesidad de datos de entrenamiento y de computo de entrenamiento.

El modelo cuenta con tan solo 827 parametros no nulos, lo que lo situa en un orden de magnitud radicalmente distinto al de los transformers convencionales. Se presenta como la contraparte en Python de lexnet (alpindale/lexnet), un proyecto analogo para otro lenguaje. El autor indica que fue disenado con asistencia de Claude Fable 5.1 y Claude Opus 5.5, y se distribuye bajo licencia Apache 2.0.

Su relevancia practica reside en el rendimiento: segun la model card, procesa codigo a 94 ns/byte en un Intel i5-9400F, lo que lo hace unas doce veces mas rapido que el lexer de Pygments (1.153 ns/byte) y comparable a tree-sitter-python en modo de solo parseo (107 ns/byte), manteniendo una concordancia del 99,995 por ciento con Pygments en paquetes de terceros. Es, por tanto, una alternativa de resaltado lexico extremadamente ligera y rapida para herramientas de edicion y visualizacion de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente bidireccional (per-byte sequence tagger) |
| Parametros totales | 827 no nulos (build principal); builds alternativos de 994 y 7.370 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos son valores disenados a mano; no se documentan formatos de cuantizacion) |
| Idiomas soportados | No disponible como idioma natural; el dominio de entrada es codigo fuente Python |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (implementacion en C, `pylexnet.c`; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal recurrente bidireccional que actua como etiquetador de secuencias a nivel de byte. La entrada son bytes crudos del fichero Python y la salida es una clase entre nueve posibles por cada byte. La funcion de activacion es `Clip(x, 0, hi)`, un recorte lineal. El vocabulario interno consta de 269 palabras clave, builtins y nombres de metodos especiales de Python.

No existe entrenamiento: la model card afirma explicitamente "Training data: None" y "Training compute: None". Los pesos han sido disenados a mano, lo que constituye la innovacion tecnica central del proyecto: se obtiene un comportamiento de resaltado de sintaxis mediante una red de menos de mil parametros sin ajuste por descenso de gradiente. El repositorio incluye builds alternativos: `fast-994` (994 parametros, 63 ns/byte, concuerda con un umbral compartido entre filas y conserva 220 palabras; contado por fila tiene 1.502 parametros) y `accurate-7370` (7.370 parametros, 89 ns/byte), que segun el autor es un automata compilado y no una red disenada a mano.

## Capacidades

- Etiquetado lexico de codigo fuente Python a nivel de byte, con nueve clases de salida.
- Resaltado de sintaxis con concordancia del 99,996 por ciento respecto a Pygments 2.17.2 en la biblioteca estandar de Python 3.12 (5,8 MB, 264 de 293 ficheros exactos).
- Concordancia del 99,995 por ciento en paquetes de terceros (30 MB, 3.059 de 3.177 ficheros exactos).
- Reconocimiento de 269 palabras clave, builtins y metodos especiales de Python.
- Modo `--classes` para emitir un identificador de clase por byte.
- Modo `--interp` para ejecutar la evaluacion generica de los mismos pesos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues de lenguaje natural; su alcance es exclusivamente el resaltado lexico de Python.

## Casos de uso

- Resaltado de sintaxis en editores e IDE ligeros: al procesar codigo a 94 ns/byte, puede integrarse en el pipeline de renderizado de un editor para colorear Python en tiempo real sin la sobrecarga de un lexer completo como Pygments.
- Visualizacion de codigo en documentacion y webs: permite generar resaltado en el navegador o en el servidor con un binario C minimo y sin dependencias de Python, reduciendo el coste de infraestructura.
- Herramientas de terminal y paginadores: su implementacion en C y su bajo consumo de memoria lo hacen adecuado para visores de ficheros y utilidades CLI que necesitan colorear Python rapidamente.
- Preprocesado lexico en pipelines de analisis estatico: el modo `--classes` proporciona etiquetas por byte que pueden alimentar etapas posteriores de analisis sin construir un arbol de sintaxis completo.
- Sistemas embebidos o de recursos limitados: con 827 parametros y compilacion mediante `cc -O2`, es viable en entornos donde no cabe un interprete de Python ni una biblioteca de resaltado convencional.
- Benchmarking y ensenanza de redes recurrentes: sirve como ejemplo didactico de red recurrente bidireccional con pesos disenados a mano y sin datos de entrenamiento, util para estudiar arquitecturas minimas.

## Benchmarks y rendimiento

Concordancia por byte con Pygments 2.17.2 sobre codigo no visto:

| Conjunto | Tamano | Concordancia | Ficheros exactos |
|---|---|---|---|
| Biblioteca estandar de Python 3.12 | 5,8 MB | 99,996% | 264 / 293 |
| Paquetes de terceros | 30 MB | 99,995% | 3.059 / 3.177 |

Velocidad sobre 293 ficheros de la biblioteca estandar, un solo nucleo, Intel i5-9400F:

| Ejecutor | ns/byte |
|---|---|
| Parser de Ruff | 14 |
| pylexnet, `builds/fast-994` | 63 |
| pylexnet (build principal) | 94 |
| tree-sitter-python, solo parseo | 107 |
| tree-sitter-python, parseo y consulta de resaltado | 165 |
| Pygments `PythonLexer` | 1.153 |

Las cifras de pylexnet proceden de `argparse.py`; el resto son sobre el corpus completo. Ruff y tree-sitter construyen un arbol de sintaxis, cosa que pylexnet no hace.

Otros builds:

| Build | Parametros | ns/byte | Concordancia en terceros |
|---|---|---|---|
| `builds/fast-994` | 994 | 63 | 99,9945% |
| `builds/accurate-7370` | 7.370 | 89 | 99,9992% |

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna; no se documenta soporte de aceleracion por GPU.
- Cabe en cualquier hardware consumer: el binario se compila con `cc -O2 -o pylexnet pylexnet.c -lm` y opera sobre CPU de un solo nucleo.
- Despliegue: compilacion directa del codigo C incluido en el repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 94 ns/byte en el build principal (63 ns/byte en `fast-994`, 89 ns/byte en `accurate-7370`) medidos en un Intel i5-9400F de un solo nucleo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Velocidad (ns/byte) | Concordancia con Pygments | Licencia |
|---|---|---|---|---|---|
| pylexnet | RNN bidireccional por byte | 827 | 94 | 99,995% (terceros) | Apache 2.0 |
| Pygments `PythonLexer` | Lexer basado en reglas | No aplica | 1.153 | Referencia | BSD (segun proyecto Pygments) |
| tree-sitter-python | Parser con arbol de sintaxis | No aplica | 107 (solo parseo) / 165 (resaltado) | No comparable directamente | MIT (segun proyecto tree-sitter) |
| Ruff parser | Parser en Rust | No aplica | 14 | No comparable directamente | MIT (segun proyecto Ruff) |

No se dispone de datos de comparacion con lexnet (alpindale/lexnet) en la informacion proporcionada, salvo la mencion de que pylexnet es su contraparte en Python.

## Limitaciones y advertencias

- No maneja palabras clave blandas como `match` y `case`.
- No soporta f-strings anidadas a dos niveles ni algunos otros casos especiales.
- El emparejador de vocabulario es aproximado, por lo que algunas palabras como `an` se marcan erroneamente como palabras clave.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Su alcance se limita al resaltado lexico de Python; no se documenta soporte de otros lenguajes.
- No se documentan sesgos sociales ni riesgos de alucinacion en el sentido de los LLM, al no ser un modelo generativo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias explicitas sobre la exactitud del resaltado en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pranavz/pylexnet
- lexnet (proyecto de referencia): https://huggingface.co/alpindale/lexnet
- Demo en video: https://huggingface.co/Pranavz/pylexnet/resolve/main/demo.mp4
