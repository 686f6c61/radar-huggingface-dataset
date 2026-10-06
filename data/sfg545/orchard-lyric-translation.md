# SFG545/orchard-lyric-translation

## Resumen

Orchard lyric translation packs es un repositorio publicado por el usuario SFG545 bajo el identificador `SFG545/orchard-lyric-translation` que reúne 14 paquetes de traducción automática neuronal exportados en formato LiteRT (`.tflite`) con cuantización a int8. Su propósito es concreto y acotado: permitir que el reproductor de música Orchard traduzca letras de canciones en el propio dispositivo (on-device), sin depender de servicios en la nube. Todos los paquetes traducen desde una lengua de origen hacia el inglés, y cada carpeta contiene un `model.tflite` con firmas de encode, prefill y decode, junto al `source.spm` y el `vocab.json` sin modificar del modelo original.

Los modelos subyacentes no son entrenados por el autor, sino adaptados desde dos familias preexistentes: los modelos ElanMT (en concreto `Mitsua/elan-mt-tiny-ja-en`) y la familia OPUS-MT de Helsinki-NLP, construida sobre la arquitectura Marian. Esto significa que el repositorio es esencialmente un trabajo de empaquetado y conversión a LiteRT más que un entrenamiento nuevo. Los pares cubiertos son japonés, coreano, chino, ruso, árabe, griego, turco, francés, alemán, español, italiano, neerlandés y catalán, todos hacia inglés.

Su relevancia actual radica en el despliegue en el borde: al ser exportaciones int8 ejecutables con el runtime LiteRT, pueden integrarse en aplicaciones móviles o de escritorio con consumo de memoria reducido. El repositorio completo ocupa 1,1 GB y mantiene las licencias individuales de cada modelo de origen, por lo que no existe una licencia única aplicable a todo el conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder), segun tags marian / opus-mt |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (exportacion LiteRT) |
| Idiomas soportados | 14 pares origen-ingles: japones, coreano, chino, ruso, arabe, griego, turco, frances, aleman, espanol, italiano, neerlandes y catalan, todos hacia ingles |
| Licencia | other (mixta; cada paquete conserva la licencia de su modelo de origen: Apache-2.0, CC BY 4.0 y CC BY-SA 4.0) |
| Formato de pesos | TFLite / LiteRT (`model.tflite`), mas `source.spm` y `vocab.json` |

## Arquitectura y entrenamiento

Todos los paquetes derivan de modelos basados en la arquitectura Marian, un transformer de tipo encoder-decoder orientado a traduccion automatica. Los modelos OPUS-MT proceden de Helsinki-NLP y se citan en la documentacion del repositorio mediante el articulo de Tiedemann y Thottingal, "OPUS-MT: Building open translation services for the World" (EAMT 2020). El paquete `jpn-eng` (no marcado como `-high`) emplea ElanMT en su variante `tiny`, del proyecto ELAN MITSUA / Abstract Engine. No se detalla en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; estos modelos de traduccion se entrenan tipicamente de forma supervisada sobre corpus paralelos, pero ese dato no se confirma en la ficha.

La innovacion tecnica del repositorio es la exportacion a LiteRT con firmas separadas de encode, prefill y decode, empleando una `pad_mask` aditiva. Los textos se tokenizan con SentencePiece (`source.spm`) y el vocabulario se entrega como `vocab.json`. La conversion se realizo con el script `scripts/translation/build_packs.py` del propio proyecto Orchard. El autor verifica la fidelidad de cada exportacion comparandola con la decodificacion greedy del modelo original en PyTorch (columna "Matches PyTorch greedy").

## Capacidades

- Traduccion automatica de texto de una lengua de origen al ingles, en 14 combinaciones de idioma.
- Ejecucion on-device mediante el runtime LiteRT, sin necesidad de conexion a red.
- Incluye tokenizador SentencePiece y vocabulario para preprocesado autonomo.
- Firmas diferenciadas de encode, prefill y decode, aptas para decodificacion autoregresiva por pasos.
- Orientado especificamente a textos de letras de canciones, aunque no se documenta ningun ajuste fino especifico para ese dominio.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Cobertura multilingue limitada al ingles como unica lengua destino.

## Casos de uso

- Traduccion de letras en un reproductor de musica: integracion directa en la aplicacion Orchard para mostrar la letra traducida al ingles mientras suena la cancion, sin enviar datos a servidores externos.
- Aplicaciones moviles de karaoke o letras sincronizadas: el modelo int8 se ejecuta en el dispositivo y permite traducir lineas a medida que se reproducen, evitando latencia de red.
- Herramientas de aprendizaje de idiomas: un estudiante puede consultar la traduccion al ingles de una cancion en japones, coreano o arabe para apoyar la comprension del vocabulario.
- Apps con requisitos de privacidad estrictos: al procesar la traduccion localmente, no se transmite el contenido a terceros, lo que resulta adecuado para entornos con normativas de proteccion de datos estrictas.
- Procesamiento por lotes en el dispositivo de catalogos musicales: traduccion previa y almacenada de letras de una biblioteca local para mostrarlas sin conexion.
- Demostraciones de traduccion multilingue embebida en dispositivos de recursos limitados: el formato TFLite y la cuantizacion int8 facilitan el despliegue en hardware modesto.
- Investigacion sobre conversion de modelos Marian a LiteRT: el repositorio sirve como referencia reproducible para exportar y validar fidelidad frente a PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni BLEU). Lo unico aportado por la model card es una verificacion de paridad entre la exportacion LiteRT y la decodificacion greedy en PyTorch, expresada como coincidencias sobre 5 casos.

| Paquete | Modelo de origen | Licencia | Coincide con PyTorch greedy |
|---|---|---|---|
| `jpn-eng` | Mitsua/elan-mt-tiny-ja-en | CC BY-SA 4.0 | 5/5 |
| `kor-eng-high` | Helsinki-NLP/opus-mt-ko-en | Apache-2.0 | 5/5 |
| `jpn-eng-high` | Helsinki-NLP/opus-mt-ja-en | Apache-2.0 | 5/5 |
| `zho-eng-high` | Helsinki-NLP/opus-mt-zh-en | CC BY 4.0 | 4/5 |
| `rus-eng-high` | Helsinki-NLP/opus-mt-ru-en | CC BY 4.0 | 4/5 |
| `ara-eng-high` | Helsinki-NLP/opus-mt-ar-en | Apache-2.0 | 5/5 |
| `ell-eng-high` | Helsinki-NLP/opus-mt-grk-en | Apache-2.0 | 3/5 |
| `tur-eng-high` | Helsinki-NLP/opus-mt-tr-en | Apache-2.0 | 5/5 |
| `fra-eng-high` | Helsinki-NLP/opus-mt-fr-en | Apache-2.0 | 5/5 |
| `deu-eng-high` | Helsinki-NLP/opus-mt-de-en | Apache-2.0 | 5/5 |
| `spa-eng-high` | Helsinki-NLP/opus-mt-es-en | Apache-2.0 | 5/5 |
| `ita-eng-high` | Helsinki-NLP/opus-mt-it-en | Apache-2.0 | 4/5 |
| `nld-eng-high` | Helsinki-NLP/opus-mt-nl-en | Apache-2.0 | 5/5 |
| `cat-eng-high` | Helsinki-NLP/opus-mt-ca-en | Apache-2.0 | 5/5 |

## Requisitos de hardware

- Al estar exportados en int8 y consumirse con LiteRT, el diseno apunta a ejecucion en CPU de dispositivos moviles y portatiles; no requiere GPU dedicada.
- Tamano del repositorio completo: 1,1 GB repartido entre 14 paquetes (incluye modelo, tokenizador y vocabulario). No se detalla el peso individual de cada `model.tflite`.
- No se especifica la VRAM ni la RAM necesarias para ninguna combinacion concreta; no disponible.
- No se indica compatibilidad con GPU de datacenter (A100, H100) ni con tarjetas de consumo (RTX 4090) mediante los frameworks habituales de servidor.
- Opciones de despliegue: runtime LiteRT (TensorFlow Lite) sobre Android, iOS, Linux, macOS o Windows. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que estos no ejecutan modelos TFLite de traduccion Marian.
- No se publican datos de latencia ni de throughput; no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Comentario |
|---|---|---|---|---|---|
| Orchard lyric translation packs | Marian int8 (LiteRT) | 14 origenes a ingles | TFLite | Mixta por paquete | Enfocado a traduccion de letras on-device |
| Helsinki-NLP OPUS-MT (originales) | Marian PyTorch | Cientos de pares | safetensors / PyTorch | Mayoritariamente Apache-2.0 y CC BY | Origen directo de 13 de los 14 paquetes; requiere runtime PyTorch |
| ElanMT (Mitsua) | Marian tiny | jpn-eng | PyTorch | CC BY-SA 4.0 | Origen del paquete `jpn-eng` |
| NLLB-200 (Meta) | Transformer multilingue | 200 idiomas | safetensors / CTranslate2 | CC BY-NC 4.0 | Modelo multilingue mucho mayor; no orientado a int8 en LiteRT |

No se dispone de datos de calidad de traduccion (BLEU, COMET) para este repositorio, por lo que la comparacion se limita a aspectos de formato, licencia y cobertura de idiomas.

## Limitaciones y advertencias

- Solo traduce hacia ingles; no existe ninguna direccion inversa ni pares entre lenguas distintas del ingles.
- La cuantizacion int8 puede degradar la calidad frente a los modelos originales en precision completa; el propio autor documenta casos de paridad imperfecta (3/5 en griego, 4/5 en chino, ruso e italiano).
- Rango de idiomas limitado a 14 orígenes concretos; no cubre el resto del catalogo de OPUS-MT ni de ElanMT.
- No se documentan sesgos especificos, pero al ser modelos de traduccion entrenados sobre corpus OPUS heredan los sesgos presentes en dichos corpus.
- Riesgo de alucinacion en textos ambiguos, poeticos o con jerga, propios de las letras de canciones, dominio para el que no se documenta ajuste fino.
- Licencia mixta: el paquete `jpn-eng` es CC BY-SA 4.0 (con obligacion de compartir bajo la misma licencia), mientras que los paquetes OPUS-MT son Apache-2.0 o CC BY 4.0. Es necesario revisar la licencia de cada paquete antes de un uso comercial.
- El campo de licencia del repositorio figura como `other`, lo que obliga a consultar la tabla de la model card para cada paquete.
- Sin datos de benchmarks de calidad de traduccion, no es posible estimar su rendimiento real en produccion.
- No se documenta longitud de contexto ni limites de tokens de entrada; no disponible.
- Repositorio con 0 descargas y 0 likes, sin evidencia de adopcion ni validacion por parte de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SFG545/orchard-lyric-translation
- Modelo de origen jpn-eng (ElanMT): https://huggingface.co/Mitsua/elan-mt-tiny-ja-en
- Modelo de origen kor-eng-high: https://huggingface.co/Helsinki-NLP/opus-mt-ko-en
- Modelo de origen jpn-eng-high: https://huggingface.co/Helsinki-NLP/opus-mt-ja-en
- Modelo de origen zho-eng-high: https://huggingface.co/Helsinki-NLP/opus-mt-zh-en
- Modelo de origen rus-eng-high: https://huggingface.co/Helsinki-NLP/opus-mt-ru-en
- Modelo de origen ara-eng-high: https://huggingface.co/Helsinki-NLP/opus-mt-ar-en
- Modelo de origen ell-eng-high: https://huggingface.co/Helsinki-NLP/opus-mt-grk-en
- Modelo de origen tur-eng-high: https://huggingface.co/Helsinki-NLP/opus-mt-tr-en
- Modelo de origen fra-eng-high: https://huggingface.co/Helsinki-NLP/opus-mt-fr-en
- Modelo de origen deu-eng-high: https://huggingface.co/Helsinki-NLP/opus-mt-de-en
- Modelo de origen spa-eng-high: https://huggingface.co/Helsinki-NLP/opus-mt-es-en
- Modelo de origen ita-eng-high: https://huggingface.co/Helsinki-NLP/opus-mt-it-en
- Modelo de origen nld-eng-high: https://huggingface.co/Helsinki-NLP/opus-mt-nl-en
- Modelo de origen cat-eng-high: https://huggingface.co/Helsinki-NLP/opus-mt-ca-en
- Referencia citada: Tiedemann y Thottingal, "OPUS-MT: Building open translation services for the World", EAMT 2020 (sin URL directa en la informacion proporcionada)
