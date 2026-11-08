# marcosremar2/firefox-translations-ucast-onnx

## Resumen

`firefox-translations-ucast-onnx` es un paquete de dieciocho modelos de traducción automática neuronal, empaquetados en formato ONNX Runtime con cuantización dinámica int8, que reproduce fielmente los modelos que Mozilla distribuye dentro del navegador Firefox para su función de traducción local. Los publica el usuario marcosremar2 para alimentar el modo local de la aplicación de escritorio ucast.me, que ejecuta la traducción en CPU sin conexión ni servicios en la nube. Cada carpeta contiene una dirección de traducción con el inglés como origen o destino (once hacia el inglés y siete desde el inglés), y las traducciones entre dos idiomas distintos del inglés se resuelven encadenando dos modelos a través del inglés.

Técnicamente son modelos Marian (transformer con decodificador SSRU) destilados por Mozilla dentro del proyecto Bergamot, con cuatro capas y dimensión 384 en la mayoría de los casos, y dos capas y dimensión 256 en los tres modelos más antiguos (`uk-en`, `en-tr`, `en-hi`). El repositorio ocupa 1,0 GB y cada modelo individual pesa entre 35 y 58 MB, lo que permite ejecutarlos en CPU convencional con latencias de decenas de milisegundos por frase.

Su relevancia práctica es doble: por un lado ofrece una alternativa de traducción completamente offline, ligera y con licencia MPL-2.0, apta para integrarse en aplicaciones de escritorio o extensiones de navegador; por otro, documenta de forma rigurosa el proceso de conversión y verificación de paridad frente a los pesos originales de Mozilla, algo poco habitual en repositorios de conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Marian v1.12 (encoder transformer, decoder SSRU, post-procesado "dan", embeddings de destino atados) |
| Parámetros totales | no disponible (modelos de 35–58 MB en int8; la mayoría con L=4 y dim=384, los pequeños con L=2 y dim=256) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 dinámica (QInt8, `onnxruntime.quantization.quantize_dynamic`) |
| Idiomas soportados | en, zh, ja, ko, ar, hi, ru, uk, tr, nl, es, pl, de, pt, fr |
| Licencia | MPL-2.0 |
| Formato de pesos | ONNX int8 (`encoder_model.int8.onnx`, `decoder_model_merged.int8.onnx`), más vocabularios JSON/TSV y modelos SentencePiece |

## Arquitectura y entrenamiento

Cada modelo es un transformer encoder-decoder de Marian en su variante de estudiante destilado (Bergamot), con un decodificador SSRU (Simple Recurrent Unit simplificada) que sustituye la autoatención del decodificador por una celda recurrente y reduce drásticamente el coste de decodificación en CPU. Los modelos incorporan post-procesado "dan" y embeddings de destino atados. La mayoría tiene 4 capas de decoder con dimensión 384; los tres modelos más antiguos (`uk-en`, `en-tr`, `en-hi`) tienen 2 capas y dimensión 256.

Los pesos proceden directamente de los checkpoints `student-finetuned` de Mozilla, identificados por la ruta exacta en el bucket de Firefox Translations y verificados en dieciséis casos mediante el SHA-256 del adjunto que distribuye Firefox. El autor no ha reentrenado nada: solo ha reconvertido y cuantizado. El repositorio incluye código de conversión (`bergamot_model.py`, `bergamot_parity.py`, `export_bergamot.py`) y un script de verificación de paridad que compara la salida greedy del modelo reimplementado en PyTorch con la salida greedy de Marian almacenada en el bucket, con coincidencia idéntica en todas las frases comprobadas.

## Capacidades

- Traducción automática de texto entre inglés y once idiomas: alemán, neerlandés, polaco, ruso, ucraniano, árabe, español, hindi, turco, chino, japonés y coreano (según la dirección disponible en cada carpeta).
- Traducción desde portugués al inglés y desde inglés al francés, añadidas el 2026-11-08.
- Traducción entre dos idiomas distintos del inglés mediante encadenamiento de dos modelos (o de uno con OPUS-MT) a través del inglés.
- Ejecución en CPU sin GPU, con ONNX Runtime y con `onnxruntime-web` en el navegador.
- Inferencia por pasos de decodificación con caché de estado recurrente (celdas SSRU), lo que permite generación incremental.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento; es exclusivamente traducción de texto.

## Casos de uso

- Traducción offline en aplicaciones de escritorio: el modo Local de ucast.me usa estos modelos en CPU para traducir transcripciones de voz sin enviar datos a ningún servidor, lo que es adecuado por su tamaño reducido (35–58 MB) y su latencia de 25–90 ms por frase en 4 hilos de CPU Apple M-series.
- Extensiones de navegador: la extensión de ucast.me ejecuta los modelos con `onnxruntime-web` en 2 hilos (Intel i7-6700HQ), con 128 ms por frase en pt→en y 256 ms en pt→fr, un perfil compatible con la traducción de páginas o subtítulos en el propio navegador.
- Traducción de contenido web en local: al empaquetar los mismos modelos que Firefox, se puede ofrecer traducción de páginas sin depender de servicios externos y con la garantía de calidad de los modelos oficiales de Mozilla.
- Procesamiento por lotes de documentos en servidores sin GPU: al ser ONNX int8 y ejecutarse en CPU, se pueden procesar grandes volúmenes de texto en máquinas convencionales, encadenando modelos para pares como de→es a través del inglés.
- Subtitulado y transcripción multilingüe: combinado con un reconocedor de voz local, permite generar subtítulos traducidos en tiempo casi real en entornos sin conectividad, como el caso de uso declarado por el autor.
- Aplicaciones de privacidad y cumplimiento: para organizaciones que no pueden enviar texto a APIs en la nube, estos modelos permiten traducción local con licencia MPL-2.0, auditable y con pesos verificables frente a los originales de Mozilla.
- Prototipado e investigación en traducción de bajo coste: el repositorio incluye el código de conversión y de verificación de paridad, útil para estudiar la cuantización int8 de Marian o para reproducir el pipeline de exportación a ONNX.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre FLEURS test (100 frases, decodificación greedy; COMET = Unbabel/wmt22-comet-da):

| Carpeta | Versión Firefox | FLEURS chrF | COMET |
|---|---|---|---|
| de-en | 2.0 | 67,8 | 0,883 |
| nl-en | 2.0 | 58,8 | 0,862 |
| pl-en | 2.0 | 57,1 | 0,853 |
| ru-en | 2.1 | 60,9 | 0,852 |
| uk-en | 1.1 | 60,9 | 0,845 |
| en-ar | 2.2 | 61,9 | 0,862 |
| en-es | 2.1 | 57,6 | 0,853 |
| en-hi | 1.0 | 59,3 | 0,786 |
| en-nl | 2.1 | 58,6 | 0,865 |
| en-pl | 2.1 | 52,5 | 0,867 |
| en-ru | 2.1 | 58,2 | 0,871 |
| en-tr | 1.0 | 61,3 | 0,873 |
| en-uk | 2.2 | 57,7 | 0,879 |
| en-zh | 2.2 | 35,6 | 0,858 |
| en-ja | 2.3 | 38,6 | 0,901 |
| en-ko | 2.1 | 39,9 | 0,878 |
| pt-en | no comprobada | 72,6 | no disponible |
| en-fr | no comprobada | 70,9 | no disponible |

Datos de latencia declarados: 25–90 ms por frase en 4 hilos de CPU Apple M-series; 128 ms por frase pt→en y 256 ms pt→fr en `onnxruntime-web` con 2 hilos sobre Intel i7-6700HQ. La traducción pt→fr encadenada a través del inglés obtiene FLEURS chrF 65,7, frente a 64,6 de OPUS-MT `itc-multi`.

## Requisitos de hardware

- VRAM: no aplica; la inferencia está pensada para CPU. El consumo de memoria es del orden de decenas de MB por modelo cargado (pesos de 35–58 MB en int8).
- GPU recomendadas: no se documentan; el diseño apunta a CPU. Cualquier GPU compatible con ONNX Runtime podría ejecutarlos, pero no hay datos de rendimiento publicados en GPU.
- CPU: funciona en CPU de consumo; los datos de latencia se han medido en Apple M-series (4 hilos) e Intel i7-6700HQ (2 hilos).
- Despliegue: ONNX Runtime (versión 1.22.0 usada en la cuantización) y `onnxruntime-web` para navegador. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato y arquitectura.
- Latencia y throughput: 25–90 ms por frase en 4 hilos (M-series); 128–256 ms por frase en 2 hilos de navegador. El throughput agregado no está publicado.

## Comparativa con modelos similares

| Modelo | Arquitectura / formato | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| firefox-translations-ucast-onnx | Marian + SSRU, ONNX int8 | 15 idiomas, 18 direcciones con inglés | no disponible | MPL-2.0 | Hugging Face, 1,0 GB |
| OPUS-MT (Helsinki-NLP) | Transformer Marian, varios formatos | Muy amplio (cientos de pares) | no disponible | mayoritariamente CC-BY-4.0 (varía por modelo) | Hugging Face |
| Modelos originales de Firefox Translations (Mozilla) | Marian + SSRU, formato propio | Mismos pares que este paquete | no disponible | MPL-2.0 | GitHub de Mozilla |
| marcosremar2/opus-mt-ucast-onnx | OPUS-MT convertido a ONNX int8 | Tres modelos (tc-bible-big) | no disponible | según OPUS-MT | Hugging Face |

La comparación directa de rendimiento solo está disponible frente a OPUS-MT `itc-multi` en el par pt→fr encadenado: chrF 65,7 frente a 64,6. Para el resto de pares no se han publicado comparativas en la información disponible.

## Limitaciones y advertencias

- Solo cubre direcciones con el inglés como origen o destino; cualquier otro par requiere encadenar dos modelos, lo que acumula errores y duplica la latencia.
- Los pares con chino, japonés y coreano muestran un chrF notablemente inferior (35,6–39,9) que el resto, aunque su COMET se mantiene alto (0,858–0,901); conviene validar la calidad en el dominio concreto antes de producción.
- `pt-en` y `en-fr` no se han verificado contra el SHA-256 del adjunto de Firefox y no se declara la versión de Firefox correspondiente; su procedencia es el checkpoint `student-finetuned`, pero sin la misma garantía que los otros dieciséis.
- No hay información publicada sobre sesgos, comportamiento con texto fuera de dominio, ni evaluación de alucinación o fidelidad más allá de FLEURS.
- La longitud de contexto no está documentada; los modelos Marian de Bergamot están pensados para frases y párrafos cortos, no para documentos largos.
- Licencia MPL-2.0: permite uso comercial, pero exige mantener la licencia y publicar el código fuente de las modificaciones de los archivos cubiertos; es una licencia de archivo, no copyleft fuerte sobre la aplicación que los integra.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- Al ser una conversión de pesos de Mozilla, cualquier corrección o mejora futura depende de que Mozilla actualice sus modelos y de que el autor reconvierta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marcosremar2/opus-mt-ucast-onnx (repositorio hermano de OPUS-MT en ONNX int8)
- Modelo en Hugging Face: https://huggingface.co/marcosremar2/firefox-translations-ucast-onnx
- Perfil del autor: https://huggingface.co/marcosremar2
- Modelos de Firefox Translations de Mozilla: https://github.com/mozilla/firefox-translations-models
- Repositorio de Mozilla truncado en la model card: https://github.com/mozilla/tr (referencia incompleta en el README original)
