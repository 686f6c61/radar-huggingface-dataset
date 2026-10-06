# cstr/opus-mt-de-es-GGUF

## Resumen
`cstr/opus-mt-de-es-GGUF` es una conversion al formato GGUF (libreria ggml) del modelo de traduccion neuronal `Helsinki-NLP/opus-mt-de-es`, desarrollado originalmente por el proyecto OPUS-MT de la Universidad de Helsinki (Jorg Tiedemann y Santhosh Thottingal). El repositorio lo publica el usuario `cstr` y su proposito es empaquetar los pesos del checkpoint `opus-2020-01-15` para su uso con el motor CrispASR mediante el backend `marian`, tanto en traduccion de texto como en el modo de traduccion en vivo (`--live-translate`).

Se trata de un modelo encoder-decoder de arquitectura MarianMT, especializado en un unico par de idiomas (aleman a espanol). Con 76.110.197 parametros, 6 capas de encoder y 6 de decoder con dimension de modelo d=512, es un modelo muy compacto: la version cuantizada q8_0 ocupa 86 MB y la f16 157 MB. Su relevancia actual radica en que ofrece traduccion de alta velocidad con una huella minima, apta para ejecucion en CPU y para integrarse en pipelines de transcripcion con traduccion en tiempo real.

El repositorio no es un modelo nuevo ni un reentrenamiento: es una conversion de formato con los pesos sin modificar a f16 y cuantizados a q8_0. La licencia aplicable es CC-BY-4.0, heredada de la declaracion del proyecto OPUS-MT, y la redistribucion exige atribucion al proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder), 6 capas de encoder y 6 de decoder, d=512 |
| Parametros totales | 76.110.197 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 y q8_0 |
| Idiomas soportados | aleman (de) y espanol (es) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento
El modelo es un transformer encoder-decoder de la familia MarianMT, con 6 capas en el encoder y 6 en el decoder y una dimension de modelo de 512, lo que da un total de 76.110.197 parametros. Está especializado en una unica direccion de traduccion (de a es): cada direccion requiere su propio modelo. Los pesos corresponden a la release `opus-2020-01-15` del proyecto OPUS-MT, entrenada sobre datos paralelos del corpus OPUS. No se documenta en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; los modelos MarianMT de OPUS-MT se entrenan de forma supervisada sobre corpus paralelos.

La innovacion de este repositorio no está en el modelo sino en el formato y el ecosistema de ejecucion: la conversion a GGUF permite cargar el modelo con el backend `marian` de CrispASR y usarlo tanto para traduccion de texto como para traduccion en vivo por microfono. El proceso de conversion se realiza con `models/convert-marian-to-gguf.py` y la cuantizacion con `crispasr-quantize`, y la fidelidad frente a la implementacion de referencia (`MarianMTModel.generate` de `transformers`) se verifica con `tools/marian_parity.py`.

## Capacidades
- Traduccion de texto de aleman a espanol, unica direccion soportada por este repositorio.
- Modo de traduccion en vivo: entrada por microfono con salida de transcripcion y traduccion frase a frase (`--live-translate`), combinando un backend de reconocimiento con el backend `marian` de traduccion.
- Decodificacion greedy (obligatoria en modo live) y decodificacion con beam search en modo texto; si no se fija `-bs 1`, se usa el tamano de beam propio del checkpoint.
- Ejecucion ligera en CPU gracias a su tamano reducido y a las cuantizaciones f16 y q8_0.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, vision, audio ni modo de pensamiento.
- Capacidad multilingue limitada estrictamente al par de y es.

## Casos de uso
- Traduccion en vivo de reuniones y conferencias: con `--live-translate`, el modelo traduce por frases la salida de un reconocedor de voz en aleman hacia espanol, lo que permite subtitulado casi en tiempo real para audiencias hispanohablantes.
- Subtitulado de contenido audiovisual en aleman: traduccion de transcripciones de video o podcast al espanol, aprovechando que el modelo procesa frases de forma secuencial y con baja latencia.
- Atencion al cliente en soporte bilingue: traduccion de consultas entrantes en aleman a espanol para que un equipo de soporte hispanohablante pueda responderlas, o al reves combinando con el modelo inverso si existe.
- Traduccion de documentacion tecnica o correspondencia interna entre equipos alemanes y espanoles, dado que el modelo trabaja bien con texto de dominio general.
- Preprocesado en pipelines de datos multilingues: traduccion de corpus alemanes a espanol como paso previo a tareas de analisis, indexacion o clasificacion.
- Despliegue en dispositivos con recursos limitados (por ejemplo, una Raspberry Pi o un portatil sin GPU): el archivo q8_0 de 86 MB permite traduccion local sin dependencia de servicios en la nube.
- Procesamiento por lotes de grandes volumenes de texto en servidores CPU, donde el coste por palabra es minimo frente a modelos multilingues de mayor tamano.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU sobre suites publicas) en la informacion disponible. El autor unicamente reporta una prueba de paridad frente a la implementacion de referencia de Hugging Face `transformers` sobre 8 frases de prueba, con identidad de los ids de tokens de entrada en 8/8 casos:

| Archivo | Tamano | Salida frente a la referencia |
|---|---:|---|
| `opus-mt-de-es-f16.gguf` | 157 MB | 8/8 frases identicas con decodificacion greedy; 8/8 con beam 4 |
| `opus-mt-de-es-q8_0.gguf` | 86 MB | 7/8 frases identicas con decodificacion greedy; el resto difiere en la redaccion |

El autor senala que la version q8_0 es la mas rapida y la recomendada, aunque introduce pequeñas diferencias de redaccion respecto a la referencia en una de cada ocho frases evaluadas.

## Requisitos de hardware
- VRAM estimada para inferencia: minima o nula, ya que el modelo esta pensado para ejecucion en CPU; los pesos q8_0 ocupan 86 MB y los f16 157 MB en memoria.
- GPU recomendadas: no se especifica ninguna; el modelo puede ejecutarse sin GPU. Cualquier GPU existente es sobredimensionada para este tamano.
- Compatibilidad con GPU de consumo: si, cabe sobradamente en cualquier GPU de consumo e incluso en sistemas integrados y dispositivos de placa unica.
- Opciones de despliegue: CrispASR con el backend `marian` (`--backend marian`), incluyendo el modo `--live-translate`; la conversion y cuantizacion se realizan con los scripts del propio repositorio (`models/convert-marian-to-gguf.py`, `crispasr-quantize`). No se documenta soporte en otros motores en la informacion disponible.
- Latencia y throughput: no disponibles de forma numerica. El autor indica que estos modelos son "los traductores mas rapidos" del ecosistema CrispASR para transcripcion y traduccion en vivo, pero no aporta cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `cstr/opus-mt-de-es-GGUF` | 76,1 M | no disponible | de, es | cc-by-4.0 | GGUF |
| `Helsinki-NLP/opus-mt-de-es` (modelo base) | ~80 M | no disponible | de, es | cc-by-4.0 | safetensors/PyTorch |
| `cstr/opus-mt-es-de-GGUF` (direccion inversa) | no disponible | no disponible | es, de | cc-by-4.0 (segun el proyecto OPUS-MT) | GGUF |
| Meta NLLB-200 (por ejemplo, variante distilled-600M) | 600 M aprox. (variante distilled) | no disponible | multilingue (mas de 200 idiomas) | CC-BY-NC-4.0 (uso no comercial) | safetensors/PyTorch |

Frente al modelo base `Helsinki-NLP/opus-mt-de-es`, esta version aporta el formato GGUF y la integracion con CrispASR, sin cambiar los pesos. Frente a modelos multilingues como NLLB-200, el modelo de OPUS-MT es mucho mas pequeno y rapido, pero solo cubre un par de idiomas y requiere un checkpoint distinto por direccion; ademas, la licencia cc-by-4.0 permite uso comercial, a diferencia de la licencia no comercial de NLLB-200. No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- Es un modelo mono-direccion: solo traduce de aleman a espanol; la direccion inversa requiere el modelo `cstr/opus-mt-es-de-GGUF` cuando exista.
- No se documenta la longitud de contexto soportada; los modelos MarianMT suelen trabajar con fragmentos cortos de texto, por lo que no es adecuado para entradas muy largas sin segmentacion previa.
- En el modo live la decodificacion es siempre greedy, lo que puede reducir la calidad frente al beam search del modo texto.
- Las cadenas literales `</s>`, `<unk>` y `<pad>` se tratan como texto normal en esta implementacion, mientras que la referencia de Hugging Face las interpreta como tokens especiales; esto puede provocar diferencias si la entrada contiene esas cadenas.
- La version q8_0 no reproduce exactamente la salida de la referencia en todas las frases (7/8 identicas en la prueba reportada), por lo que pueden aparecer diferencias de redaccion.
- No se han publicado evaluaciones de sesgo, robustez ni tasas de alucinacion para este checkpoint concreto.
- La licencia cc-by-4.0 permite el uso comercial, pero exige atribucion al proyecto OPUS-MT; los pesos son la release `opus-2020-01-15` y su redistribucion debe mantener la atribucion.
- Es una conversion de formato: la calidad de traduccion es la del modelo original y no se ha mejorado con reentrenamiento.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/cstr/opus-mt-de-es-GGUF
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-de-es
- Motor CrispASR: https://github.com/CrispStrobe/CrispASR
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Repositorio de entrenamiento OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT-train
- Corpus OPUS: https://opus.nlpl.eu/
