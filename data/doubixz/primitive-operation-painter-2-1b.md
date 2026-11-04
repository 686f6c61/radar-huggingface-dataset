# doubixz/primitive-operation-painter-2-1b

## Resumen

Primitive Operation Painter 2 (POP 2, version interna v3.3) es un modelo autorregresivo de generacion de dibujos desarrollado por el usuario doubixz. A diferencia de los modelos de difusion, no genera pixeles: predice secuencialmente operaciones de dibujo compuestas por primitivas geometricas editables (rectangulos, elipses y otras formas) con atributos discretos de posicion, tamano, angulo y color. El resultado es una secuencia de primitivas nativas que puede manipularse en un editor, lo que lo diferencia de los generadores de imagen convencionales.

El modelo tiene 1.004.182.914 parametros, 35 capas transformer con anchura oculta de 1536 y 24 cabezas de atencion, y se distribuye en precision BF16. Su condicionamiento es exclusivamente en chino y su ventana de contexto es de 1024 posiciones que combinan tokens de texto y de primitivas. Esta pensado para integrarse en la aplicacion nativa Primitive Painter (compatible con la version 0.9.27), no como un modelo generico de lenguaje ni como un modelo compatible con `transformers`.

La relevancia de esta publicacion es acotada pero concreta: se trata del checkpoint de inferencia (epoca 60, paso global 10020) usado por la aplicacion nativa, publicado con licencia MIT y sin cuantizacion ni conversion de pesos. No es un checkpoint reanudable para entrenamiento, ya que no incluye los fragmentos del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con atencion multi-cabeza y FFN con compuerta (gated FFN), codificacion posicional RoPE |
| Parametros totales | 1.004.182.914 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 posiciones de texto/primitivas |
| Tipos de cuantizacion | no disponible (se distribuye unicamente en BF16 sin cuantizar) |
| Idiomas soportados | chino (zh) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (PyTorch, tensores BF16 bajo `model_state_dict`), no safetensors ni GGUF |

Especificaciones adicionales:

| Parametro | Valor |
|---|---|
| Capas transformer | 35 |
| Anchura oculta | 1536 |
| Cabezas de atencion / anchura por cabeza | 24 / 64 |
| Anchura oculta del FFN con compuerta | 4096 |
| Vocabulario de texto | 1500 (SentencePiece) |
| Vocabulario de primitivas/control | 7069 |
| Vocabulario de salida de atributos | 7054 |
| Lienzo nativo | 512 x 512 |
| Atributos por primitiva | 9 (x, y, angulo, anchura, altura, forma, rojo, verde, azul) |
| Tamano del repositorio | 2.0 GB |
| Compatibilidad de la aplicacion | Primitive Painter nativa 0.9.27 |

## Arquitectura y entrenamiento

POP 2 es un transformer autorregresivo de 35 capas con anchura oculta 1536, 24 cabezas de atencion de 64 dimensiones cada una y un FFN con compuerta de anchura 4096. Emplea RoPE como codificacion posicional. Cada primitiva se representa mediante nueve atributos discretos (x, y, angulo, anchura, altura, forma y las tres componentes de color), cuyos embeddings se combinan en una sola posicion del modelo. Las predicciones parciales utilizan embeddings aprendidos de atributo vacio y ramas de historial compartido. Los tokens de texto ocupan posiciones separadas antes del token BOS de primitivas.

El protocolo de dibujo incluye etapas global, de rejilla gruesa y de rejilla fina, con tokens explicitos de control de region, fin permanente e interrupcion. El entrenamiento registrado uso 3 rangos, micro-lote por dispositivo de 10, acumulacion de gradiente de 20 y lote global efectivo de 600. El checkpoint corresponde a la epoca 60 y al paso global de optimizador 10020, con EMA desactivada. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo se desarrollo en torno a datos de dibujo de caras de estilo anime y descripciones en chino.

## Capacidades

- Generacion autorregresiva de secuencias de primitivas geometricas editables (rectangulos, elipses y otras formas) en lugar de pixeles.
- Condicionamiento por texto en chino: genera dibujos a partir de descripciones textuales.
- Condicionamiento por prefijo de primitivas: permite continuar un dibujo existente a partir de las primitivas ya presentes.
- Condicionamiento combinado de texto y primitivas.
- Protocolo de dibujo por etapas (global, rejilla gruesa, rejilla fina) con control de region.
- Soporte de edicion de lienzo, continuacion y ramificacion de historial en la aplicacion nativa.
- Seleccion adaptativa de candidatos mediante Rényi (alpha configurable) y guiado sin clasificador (CFG) como funciones de tiempo de ejecucion.
- Soporte de cache KV con precision opcional como funcion de tiempo de ejecucion.

No se documenta soporte de tool calling, function calling, razonamiento multi-paso agentico, vision, audio ni modo de pensamiento.

## Casos de uso

- Generacion de graficos vectoriales editables a partir de descripciones en chino: el modelo produce secuencias de primitivas que pueden importarse en un editor vectorial, lo que permite modificar cada forma y color de manera individual en lugar de retocar una imagen rasterizada.
- Ilustracion de caras de estilo anime: dado que el modelo se entreno en torno a datos de caras anime, es adecuado para generar retratos estilizados por primitivas para prototipado o contenido artistico.
- Prototipado rapido de composiciones geometricas: util para generar bocetos de layouts con formas basicas (rectangulos y elipses) que luego se refinan manualmente en la aplicacion nativa.
- Continuacion y ramificacion de dibujos existentes: gracias al condicionamiento por prefijo de primitivas, permite explorar variantes de un dibujo ya iniciado sin rehacerlo desde cero.
- Generacion condicionada por region: el protocolo de control de region permite dirigir la generacion hacia zonas concretas del lienzo de 512 x 512, util para composiciones por partes.
- Experimentacion con generacion autorregresiva de graficos vectoriales: sirve como referencia para investigadores interesados en modelos que emiten primitivas estructuradas en lugar de pixeles, con pesos BF16 disponibles y licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 2.01 GB (1.87 GiB); a ello hay que sumar el estado del runtime (cache KV, buffers de atencion y estado de la aplicacion), por lo que el consumo total sera superior, aunque no se especifica una cifra concreta.
- GPU recomendadas: no disponible. La model card indica que el soporte de GPU y el rendimiento dependen de la compilacion de la aplicacion, el runtime y el hardware, sin ofrecer garantias universales de velocidad o compatibilidad.
- Compatibilidad con GPU de consumo: por el tamano de los pesos (en torno a 2 GB en BF16), es previsible que quepa en GPU de consumo con suficiente VRAM libre, pero no se confirma en la informacion disponible.
- Opciones de despliegue: exclusivamente la aplicacion nativa Primitive Painter (compatible con la version 0.9.27). No es compatible con `transformers.AutoModel`, vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| POP 2 / 1B (este modelo) | 1.004.182.914 | 1024 posiciones | Secuencias de primitivas editables | MIT | Solo aplicacion nativa |
| POP 1 (`doubixz/primitive-operation-painter-weight`) | 0.3B (144 pasos) | no disponible | Secuencias de primitivas | no disponible en la informacion | Arquitectura, token layout y loader no intercambiables con POP 2 |

No se dispone en la informacion proporcionada de otros modelos comparables de generacion de graficos vectoriales por primitivas con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo esta desarrollado en torno a datos de dibujo de caras de estilo anime y descripciones en chino; no es un generador de imagenes fotorrealistas de proposito general.
- El seguimiento de instrucciones y la calidad visual son variables.
- La aplicacion nativa puede rechazar texto fuera del vocabulario (vocabulario de texto de solo 1500 tokens).
- Las salidas estan restringidas al vocabulario de primitivas y al protocolo de regiones; no puede producir pixeles ni formas fuera de ese conjunto.
- El condicionamiento textual es unicamente en chino.
- La ventana de atencion esta limitada a 1024 posiciones; la funcion de "context overclocking" de la aplicacion selecciona el historial retenido, pero no amplia esa ventana.
- El checkpoint es solo de inferencia: incluye metadatos de entrenamiento y un descriptor de formato de optimizador, pero no los fragmentos del optimizador necesarios para reanudar el entrenamiento de forma exacta.
- No es compatible con `transformers.AutoModel` ni con servidores de inferencia de generacion de texto estandar; requiere la implementacion nativa correspondiente.
- El rendimiento y el soporte de GPU dependen de la compilacion de la aplicacion, el runtime y el hardware; no se ofrece ninguna garantia universal de velocidad o compatibilidad.
- La licencia MIT no redistribuye ni concede derechos sobre los datos de entrenamiento de terceros excluidos del repositorio.
- Los usuarios deben asegurarse de tener los derechos necesarios sobre sus datos de entrada y usos previstos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/doubixz/primitive-operation-painter-2-1b
- Proyecto de codigo: https://github.com/wonderfulearth/primitive-operation-painter
- Version anterior POP 1: https://huggingface.co/doubixz/primitive-operation-painter-weight
