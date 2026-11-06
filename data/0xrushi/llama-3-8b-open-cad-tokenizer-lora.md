# 0xrushi/Llama-3-8B-Open-CAD-Tokenizer-lora

## Resumen

Llama-3-8B-Open-CAD-Tokenizer-lora es un adaptador LoRA de rango 32 desarrollado por el usuario 0xrushi que habilita a Meta Llama 3 8B para generar y editar geometria CAD como secuencias de tokens discretos aprendidos. El adaptador se combina con un tokenizador VQ-VAE de 2.048 codigos y una tabla de alineacion que mapea cada codigo a una entrada existente del vocabulario de LLaMA, de modo que el modelo base puede emitir programas CAD sin modificar su cabeza de salida. Es una reimplementacion independiente del trabajo CAD-Tokenizer (arXiv:2509.21150), no la publicacion oficial de sus autores.

El problema que aborda es la conversion de lenguaje natural a geometria CAD (text-to-CAD) y la edicion de modelos CAD existentes mediante instrucciones textuales. En lugar de generar directamente STEP u otro formato geometrico, el modelo produce un programa SEM (secuencia de sketch y extrude) codificado en tokens, que despues se decodifica con el tokenizador VQ y se valida contra un kernel CAD (CadQuery/OCP).

Es relevante para quienes investigan generacion de geometria asistida por LLM porque demuestra un enfoque de tokenizacion discreta sobre un modelo de lenguaje generalista de 8B parametros, con contexto de entrenamiento de 1.024 tokens y 256 tokens de salida. El adaptador no es autocontenido: requiere el modelo base, el tokenizador VQ y la tabla de alineacion para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32) sobre transformer decoder Meta Llama 3 8B, con tokenizador VQ-VAE de primitivas (2.048 codigos, anchura 512) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens de entrenamiento; 256 tokens de salida |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | llama3 (Meta Llama 3 Community License) |
| Formato de pesos | safetensors (adaptador) y PyTorch checkpoints basados en pickle (vq/best.pt, alignment/alignment.pt) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 (checkpoint 10696) aplicado sobre Meta Llama 3 8B. La innovacion principal reside en el esquema de tokenizacion: un VQ-VAE de primitivas con 2.048 codigos y anchura 512 convierte la geometria CAD en tokens discretos, que se alinean con entradas ya existentes del vocabulario de LLaMA mediante una tabla de alineacion. Ademas de los tokens de codigo, el modelo emite tokens de trailer con escala y desplazamiento exactos, y tokens de frontera que delimitan segmentos del programa CAD. La salida se decodifica a un programa SEM (secuencia de sketch/extrude) mediante la funcion `decode_native_ids` del paquete `cadtokenizer`.

Los datos de entrenamiento se reconstruyeron a partir de SkexGen, CADFusion y CAD-Editor, cada uno con sus propios terminos de uso. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El autor advierte que las anotaciones numericas de edicion en los datos de entrenamiento son en ocasiones ambiguas o inconsistentes. El tokenizador es con perdida: los codigos conservan la coincidencia mas cercana del codebook, no valores exactos, aunque la escala y el desplazamiento se restauran desde los tokens de trailer exactos.

## Capacidades

- Generacion de CAD a partir de texto (text-to-CAD): produce programas SEM codificados en tokens discretos.
- Edicion de CAD guiada por instrucciones: modifica geometria existente mediante captions textuales.
- Emision de tokens de trailer con escala y desplazamiento exactos para restaurar dimensiones.
- Delimitacion de segmentos del programa mediante tokens de frontera.
- Integracion con el ecosistema LLaMA 3 8B como adaptador PEFT.
- Decodificacion a programa SEM mediante el paquete `cadtokenizer` del proyecto.
- No se documentan capacidades de tool calling, agentes, vision, audio, thinking mode ni multilingues en la informacion disponible.

## Casos de uso

- Prototipado rapido de piezas mecanicas: el modelo genera un programa SEM a partir de una descripcion textual, que se decodifica con el tokenizador VQ y se valida en CadQuery/OCP para obtener una primera geometria de trabajo.
- Edicion parametrica asistida: dado un modelo CAD existente y una instruccion de cambio (por ejemplo, ajustar una dimension), el modelo emite una secuencia de tokens que representa la geometria editada; el adaptador obtiene F1-Skt de 92,80 en la tarea de edicion segun el benchmark del autor.
- Generacion de variantes de diseno: partiendo de una descripcion, se producen multiples programas SEM para explorar el espacio de diseno antes de fijar una solucion.
- Investigacion en tokenizacion discreta de geometria: el par adaptador + VQ-VAE sirve como banco de pruebas para estudiar la alineacion de codigos geometricos con vocabularios de LLM.
- Automatizacion de pipelines de diseno generativo: el modelo puede insertarse en un flujo que genere, valide con kernel CAD y descarte geometrias invalidas de forma iterativa.
- Docencia y experimentacion con text-to-CAD: permite reproducir un esquema de tokenizacion CAD sobre un modelo abierto de 8B sin entrenar desde cero.

## Benchmarks y rendimiento

Resultados del benchmark propio del autor (decodificacion greedy, 256 tokens de salida, contexto de entrenamiento de 1.024 tokens):

| Tarea | Invalid % | F1-Skt | F1-Ext | CD | COV | JSD | MMD |
|---|---:|---:|---:|---:|---:|---:|---:|
| Generacion (200 casos) | 27,000 | 78,25 | 86,74 | 42,10 | 51,75 | 12,30 | 5,11 |
| Edicion (800 casos) | 4,875 | 92,80 | 95,99 | 8,84 | 57,18 | 1,34 | 1,40 |

El autor advierte que este es un benchmark de desarrollo propio (200 casos de generacion y 800 de edicion) que informo sus experimentos, no el conjunto de test del paper, por lo que las cifras no son comparables con las de la publicacion. Ademas, en su configuracion el adaptador de texto plano obtiene menos salidas invalidas y mejores puntuaciones de edicion, mientras que este modelo de tokens CAD logra mayor cobertura de generacion.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Como referencia, el modelo base Llama 3 8B en precision completa requiere del orden de 16 GB de VRAM, y en cuantizacion de 4 bits alrededor de 5-6 GB, pero estos valores no los aporta la ficha del autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el proyecto proporciona el paquete `cadtokenizer` con `inference.py` y `decode_native_ids`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones de modelos comparables en la informacion proporcionada. El autor menciona como antecedentes el paper CAD-Tokenizer (arXiv:2509.21150) y los proyectos SkexGen, CADFusion y CAD-Editor, pero no se incluyen cifras comparativas directas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3-8B-Open-CAD-Tokenizer-lora | Adaptador sobre 8B | 1.024 (entrenamiento) | llama3 | Hugging Face (adaptador) |
| CAD-Tokenizer (paper) | No disponible | No disponible | No disponible | No disponible |
| SkexGen | No disponible | No disponible | No disponible | GitHub |
| CADFusion | No disponible | No disponible | No disponible | GitHub |
| CAD-Editor | No disponible | No disponible | No disponible | GitHub |

## Limitaciones y advertencias

- El adaptador no es usable por si solo: requiere el modelo base Meta Llama 3 8B, el tokenizador VQ (`vq/best.pt`) y la tabla de alineacion (`alignment/alignment.pt`).
- `vq/best.pt` y `alignment/alignment.pt` son checkpoints PyTorch basados en pickle; solo deben cargarse desde fuentes de confianza.
- Generacion debil: el 27,000 % de las salidas del benchmark de generacion no son solidos validos; siempre hay que validar con el kernel CAD (CadQuery/OCP) y previsualizar la geometria.
- La validez y el F1 estructural no miden la precision dimensional ni la fidelidad a la instruccion.
- Las anotaciones numericas de edicion en los datos de entrenamiento son a veces ambiguas o inconsistentes.
- La salida es un programa SEM (secuencia de sketch/extrude), no geometria STEP arbitraria.
- El tokenizador es con perdida: los codigos usan la coincidencia mas cercana del codebook, aunque la escala y el desplazamiento se restauran desde tokens de trailer exactos.
- El benchmark es de desarrollo propio y no comparable con el del paper.
- Licencia llama3: el uso comercial esta sujeto a la Meta Llama 3 Community License; los pesos base no se incluyen y requieren acceso propio.
- No se documentan sesgos conocidos, limitaciones de idioma ni riesgos de alucinacion especificos en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/0xrushi/Llama-3-8B-Open-CAD-Tokenizer-lora
- Paper CAD-Tokenizer: https://arxiv.org/abs/2509.21150
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Licencia Meta Llama 3: https://llama.meta.com/llama3/license/
- SkexGen: https://github.com/samxuxiang/SkexGen
- CADFusion: https://github.com/microsoft/CADFusion
- CAD-Editor: https://github.com/microsoft/CAD-Editor
