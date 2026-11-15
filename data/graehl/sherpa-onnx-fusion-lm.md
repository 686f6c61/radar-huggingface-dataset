# graehl/sherpa-onnx-fusion-lm

## Resumen

`graehl/sherpa-onnx-fusion-lm` es un par de modelos de lenguaje n-grama a nivel de carácter para inglés, publicados en formato binario KenLM, que sirven como material reproducible para el fork [sherpa-onnx-fusion](https://github.com/graehl/sherpa-onnx-fusion). Ese fork añade fusión de modelo de lenguaje durante la búsqueda a los decodificadores de [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx), de modo que los WER declarados por el autor puedan reproducirse exclusivamente con descargas públicas.

No se trata de un modelo neuronal ni de un transformer: son dos modelos estadísticos de n-gramas de carácter (orden 6 y orden 8) estimados con KenLM sobre texto de LibriSpeech. Su función es actuar como *scorer* externo en decodificación por búsqueda de prefijos (*prefix beam search*) sobre un reconocedor CTC, mejorando la precisión del reconocimiento sin necesidad de reentrenar el acústico.

El interés práctico radica en su tamaño reducido (4,1 MB y 15,9 MB) frente al grafo de palabras de 334 MB publicado por el proyecto upstream, con un WER inferior en la evaluación del autor. Al operar a nivel de carácter, el modelo es independiente del inventario de tokens del reconocedor, siempre que este escriba inglés en mayúsculas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje estadístico n-grama a nivel de carácter (KenLM, trie) |
| Parametros totales | no disponible (no es un modelo neuronal; tamaño en disco 4,1 MB y 15,9 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (n-gramas de orden 6 y 8) |
| Tipos de cuantizacion | probabilidades y backoffs cuantizados a 8 bits (`-q 8 -b 8`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | binario KenLM (`.bin`, trie) |

## Arquitectura y entrenamiento

Los modelos son n-gramas de carácter estimados con `lmplz` de KenLM usando suavizado Kneser-Ney modificado y poda por conteo, seguidos de `build_binary -q 8 -b 8 trie`. Las unidades son las letras `A` a `Z`, el apóstrofo y el símbolo `▁` (U+2581) que representa el espacio entre palabras; el texto se normaliza a mayúsculas. Los umbrales de poda por orden son `0 0 1 2 4 8 16 16` para el 8-grama y `0 0 1 2 4 4` para el 6-grama.

El corpus de entrenamiento procede de cada décima línea del texto de lenguaje de LibriSpeech (OpenSLR recurso 11, `librispeech-lm-norm.txt.gz`): aproximadamente 4 millones de líneas y 500 millones de caracteres. El autor indica que no contiene transcripciones de test ni de desarrollo de LibriSpeech, lo que evita contaminación en la evaluación.

## Capacidades

- Puntuación de secuencias de caracteres en inglés para fusión con decodificadores CTC de sherpa-onnx.
- Integración como *scorer* externo en `prefix_beam_search` mediante `--scorer.type=kenlm`.
- Independencia del inventario de tokens del reconocedor: funciona con cualquier reconocedor que emita texto en inglés.
- Dos tamaños con compromiso precisión/recursos: 6-grama (4,1 MB) y 8-grama (15,9 MB).
- No realiza generación de texto, razonamiento, código, matemáticas, visión ni tool calling.
- No soporta agentes ni razonamiento multi-paso.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Reconocimiento de voz offline con sherpa-onnx: usar el 8-grama como scorer en `prefix_beam_search` para reducir el WER frente a la decodificación greedy, con un coste de 15,9 MB adicionales.
- Despliegue en dispositivos con recursos limitados: el 6-grama de 4,1 MB permite mejorar la precisión sin cargar el grafo de palabras de 334 MB del upstream.
- Reproducción de resultados de investigación: el directorio `repro/` del fork fija estos ficheros y vuelve a ejecutar la comparación, lo que facilita la verificación por terceros.
- Sustitución de grafos de palabras pesados en pipelines de ASR: al operar a nivel de carácter, se evita la dependencia de un léxico de palabras concreto.
- Adaptación a reconocedores con inventarios de tokens no estándar: cualquier modelo acústico que escriba inglés en mayúsculas puede beneficiarse del scorer.
- Experimentación con pesos de interpolación: el autor fija `--scorer.weight=0.35` tras evaluar 0.35, 0.5 y 0.7 sobre 300 grabaciones de dev-other, lo que sirve como punto de partida para ajustes propios.

## Benchmarks y rendimiento

Evaluación sobre 600 grabaciones de LibriSpeech test-other con el reconocedor público `sherpa-onnx-zipformer-ctc-en-2023-10-02`, una grabación por llamada:

| Decodificador | WER % |
|---|---:|
| greedy | 5,63 |
| grafo de palabras 3-grama del upstream (334 MB) | 5,39 |
| búsqueda de prefijos con el 6-grama (4,1 MB) | 5,04 |
| búsqueda de prefijos con el 8-grama (15,9 MB) | 4,93 |

El peso 0,35 se eligió entre 0,35, 0,5 y 0,7 sobre 300 grabaciones de dev-other.

## Requisitos de hardware

- VRAM: no aplica; son ficheros de 4,1 MB y 15,9 MB que se cargan en memoria del proceso de decodificación.
- GPU: no necesaria para el scorer; el coste computacional lo determina el modelo acústico (Zipformer CTC en el ejemplo).
- Cabe en cualquier GPU consumer e incluso en CPU, dado el tamaño reducido del modelo de lenguaje.
- Despliegue mediante la CLI `sherpa-onnx-offline` con `--decoding-method=prefix_beam_search` y `--scorer.type=kenlm`, o mediante la API de sherpa-onnx-fusion.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | WER test-other (%) | Licencia |
|---|---|---:|---|---:|---|
| `en-librispeech-char-8gram.bin` | n-grama de carácter KenLM, orden 8 | 15,9 MB | orden 8 | 4,93 | CC BY 4.0 |
| `en-librispeech-char-6gram.bin` | n-grama de carácter KenLM, orden 6 | 4,1 MB | orden 6 | 5,04 | CC BY 4.0 |
| Grafo de palabras 3-grama de sherpa-onnx upstream | grafo de decodificación | 334 MB | orden 3 | 5,39 | no disponible |
| Decodificación greedy (sin LM) | — | — | — | 5,63 | — |

## Limitaciones y advertencias

- Solo inglés y solo mayúsculas: un reconocedor que emita minúsculas requiere reconstruir el modelo con texto en minúsculas, según indica el autor.
- Es un modelo estadístico de n-gramas: no generaliza semánticamente ni captura dependencias de largo alcance más allá del orden 6 u 8.
- Los WER reportados provienen de una única configuración (Zipformer CTC, test-other, 600 grabaciones) y no deben extrapolarse a otros reconocedores o dominios sin validación.
- El peso 0,35 está ajustado sobre dev-other de LibriSpeech; otros corpus pueden requerir reajuste.
- El corpus de entrenamiento es texto de LibriSpeech, por lo que el vocabulario y el estilo están sesgados hacia lectura de libros en inglés.
- Licencia CC BY 4.0: permite uso comercial con atribución; conviene revisar los términos de KenLM y de los datos de OpenSLR para la redistribución.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; tracción comunitaria nula.
- Tamaño de repo indicado como 0.0 GB, posiblemente por redondeo; verificar los ficheros antes de integrarlos en producción.

## Enlaces

- [Hugging Face: graehl/sherpa-onnx-fusion-lm](https://huggingface.co/graehl/sherpa-onnx-fusion-lm)
- [Repositorio sherpa-onnx-fusion](https://github.com/graehl/sherpa-onnx-fusion)
- [sherpa-onnx (k2-fsa)](https://github.com/k2-fsa/sherpa-onnx)
- [KenLM](https://github.com/kpu/kenlm)
- [OpenSLR recurso 11 (LibriSpeech)](https://www.openslr.org/11/)
