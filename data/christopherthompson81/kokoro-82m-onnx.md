# christopherthompson81/kokoro-82m-onnx

## Resumen

Kokoro-82M ONNX es una exportación a formato ONNX del modelo de síntesis de voz hexgrad/Kokoro-82M (v1.0), publicada por christopherthompson81 como motor TTS del proyecto Vernacula. El modelo original es un sistema text-to-speech de arquitectura StyleTTS 2 con vocoder iSTFTNet, 82 millones de parámetros y salida mono a 24 kHz, pensado para generar voz de alta calidad con un coste computacional muy bajo. Esta versión concreta no reentrena nada: reempaqueta el modelo en un grafo ONNX de opset 17 con ejes dinámicos de batch, tokens y samples, e incluye los 28 paquetes de voz en inglés en un formato binario plano.

La relevancia de esta ficha está en el pipeline de exportación, que es propio del autor y no reutiliza los artefactos de onnx-community. La innovación principal es un grafo batcheado de longitud variable (`kokoro_batched.onnx`) que renderiza varios textos de longitudes distintas en una sola llamada manteniendo la fidelidad del modo batch=1, algo que Kokoro no soporta de serie: el relleno ingenuo corrompe los elementos cortos porque AdaIN normaliza sobre el eje temporal. Además, la exportación usa `disable_complex=True` porque el exportador de TorchScript no admite STFT de valores complejos.

El repositorio ocupa 0,7 GB y el grafo principal pesa unos 311 MB en fp32, con licencia Apache-2.0. Está pensado para ejecutarse con onnxruntime, tanto en CPU como en GPU, y su contexto está limitado a 510 tokens de fonemas por elemento, con el frontend de G2P (grafema a fonema) fuera del grafo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 con vocoder iSTFTNet (sintesis de voz), exportada a ONNX |
| Parametros totales | 82 M (segun la denominacion del modelo base hexgrad/Kokoro-82M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 510 tokens de fonemas por elemento; los ejes batch, tokens y samples son dinamicos |
| Tipos de cuantizacion | fp32 unicamente (pesos inlineados en el grafo); no se distribuyen variantes cuantizadas en este repositorio |
| Idiomas soportados | ingles (28 voces: 11 americanas femeninas, 9 americanas masculinas, 4 britanicas femeninas y 4 britanicas masculinas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, fp32) para el modelo y ficheros `.bin` en float32 little-endian para las voces |
| Frecuencia de muestreo | 24 kHz, mono |
| Tamano del repositorio | 0,7 GB (grafo principal de ~311 MB + 28 paquetes de voz de 510 x 256 float32 cada uno + manifest.json) |
| Entradas del grafo | `input_ids` (int64), `ref_s` (float32, 256), `speed` (float32), `input_lengths` (int64, obligatoria) |
| Salidas del grafo | `audio` (float32, 24 kHz) y `pred_dur` (int64, frames por token, 0 en los tokens de relleno) |
| Libreria | onnxruntime |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es Kokoro v1.0, un sistema StyleTTS 2 de 82 M de parámetros que combina un codificador de texto, un predictor de duración basado en LSTM bidireccional, bloques con normalización AdaIN sobre el tiempo y un vocoder iSTFTNet que sintetiza la forma de onda a 24 kHz. Esta exportación no entrena ni ajusta nada: parte del modelo original y exporta `KModel.forward_with_tokens` a opset 17 con `disable_complex=True`. El motivo es que el STFT de valores complejos que usa el modelo por defecto no se puede exportar (el exportador de TorchScript falla con `Unknown number type: complex`), por lo que se sustituye por un STFT de valores reales.

Ese cambio no es bit a bit idéntico en el dominio de la onda, porque la fase del vocoder no queda determinada de forma unica, pero la validación frente a la referencia en PyTorch da un L1 log-espectral de ~0,37, por debajo del umbral de un frame de jitter (~0,77) y sin diferencias audibles en pruebas A/B. La validación se hace con L1 log-espectral y no con SNR de la onda ni con tokens aleatorios, porque ambos criterios dan veredictos sin sentido en este caso. El G2P queda fuera del grafo: el modelo recibe identificadores de token y los fonemas los produce vernacula-phonemizer, renderizados al vocabulario de Kokoro.

La otra aportación técnica es el grafo batcheado de longitud variable. Kokoro es batch=1 de origen y el relleno naive corrompe los elementos cortos por tres vías: AdaIN normaliza sobre el tiempo (los frames de relleno contaminan las estadísticas por elemento), las LSTM bidireccionales leen el relleno hacia atrás dentro de tokens reales y se desplazan las duraciones predichas. La solución aplicada enmascara las estadísticas, empaqueta las LSTM y vuelve a poner a cero el relleno después de cada `AdaIN1d`. En batch=1 este grafo es ~1,08x más rápido que el grafo mono-elemento anterior, así que lo sustituye por completo. No hay información disponible sobre el dataset de entrenamiento original, el número de tokens vistos ni si hubo RLHF o DPO.

## Capacidades

- Sintesis de voz en ingles a 24 kHz en mono, con control de velocidad mediante el parametro `speed`.
- 28 voces predefinidas: americanas (`af_*`, `am_*`) y britanicas (`bf_*`, `bm_*`), donde el prefijo selecciona la fonemizacion del acento correspondiente.
- Inferencia por lotes con longitudes variables: varios textos de distinta longitud en una sola llamada, con `input_lengths` para enmascarar el relleno.
- Salida de duraciones por token (`pred_dur`), identica a la que se obtendria renderizando el texto en solitario, lo que habilita alineacion palabra-audio sin depender del lote.
- Frontend de G2P externo y sustituible mediante vernacula-phonemizer, de modo que el mismo frontend sirve para varios motores.
- Ejecucion sin libreria de tensores para leer las voces: los paquetes `.bin` son float32 plano indexado por longitud de la cadena de fonemas.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision ni audio de entrada. No es un modelo de lenguaje.

## Casos de uso

- Lectura de articulos y documentos largos: el texto se divide en frases o parrafos que quepan en los 510 tokens de fonemas por elemento, y se generan secuencialmente o en lotes agrupados por longitud similar para maximizar el rendimiento.
- Generacion por lotes en pipelines editoriales: un sistema de publicacion puede sintetizar cientos de resumenes o notas de prensa en una sola pasada usando `kokoro_batched.onnx`, ordenando previamente los textos por longitud de fonemas para duplicar la ocupacion del lote.
- Accesibilidad y lectores de pantalla: al ser un grafo fp32 de ~311 MB ejecutable con onnxruntime en CPU, se puede integrar en aplicaciones de escritorio o moviles sin GPU dedicada y sin depender de servicios en la nube.
- Generacion de audiolibros y podcast con multiples voces: las 28 voces con acento americano o britanico permiten asignar locutores distintos a narrador y personajes, manteniendo el control de velocidad por llamada.
- Doblaje y localizacion de contenido en ingles: el control de velocidad y la salida de duraciones por token facilitan ajustar la locucion a una pista temporal existente.
- Creacion de datos sinteticos para entrenar o evaluar sistemas ASR: la salida `pred_dur` proporciona alineaciones a nivel de token, utiles para generar transcripciones con marcas temporales.
- Prototipado de asistentes de voz: la integracion con vernacula y el G2P externo permiten intercambiar el frontend linguistico sin reexportar el grafo acustico.
- Despliegue en dispositivos con recursos limitados: el modelo cabe en cualquier GPU consumer e incluso en entornos CPU-only, lo que cubre kioscos, sistemas empotrados y entornos sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no son aplicables a un modelo de sintesis de voz. Los unicos datos cuantitativos disponibles son los de validacion de la exportacion y de eficiencia del grafo batcheado:

| Metrica | Valor |
|---|---|
| Distorsion log-espectral L1 frente a la referencia en PyTorch (`disable_complex=True`) | ~0,37 |
| Umbral de referencia de un frame de jitter | ~0,77 |
| Velocidad en batch=1 frente al grafo mono-elemento anterior | ~1,08x mas rapido |
| Ocupacion del lote con una mezcla sin ordenar de titulares y parrafos largos | ~37% |
| Efecto de ordenar por longitud de fonemas antes de batchear | ~2x de rendimiento |
| Coste del relleno en fidelidad | funcion escalon: dos frames de relleno cuestan lo mismo que doscientos, y se enmascaran igualmente |

No hay mediciones publicadas de latencia absoluta ni de throughput en tiempo real sobre hardware concreto.

## Requisitos de hardware

- VRAM estimada: por debajo de ~0,6 GB incluyendo activaciones, partiendo de un grafo fp32 de ~311 MB y secuencias de como maximo 510 tokens. Es una estimacion derivada del tamano del grafo; no hay mediciones publicadas.
- GPU recomendadas: no requiere aceleradores de gama alta. Funciona en A100, H100 o RTX 4090, pero tambien en cualquier GPU consumer e incluso en CPU exclusivamente, que es el escenario natural de onnxruntime para este modelo.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual y en bastantes integradas, dado el tamano del modelo y de las activaciones.
- Opciones de despliegue: onnxruntime con los execution providers disponibles (CPU, CUDA, TensorRT, CoreML, DirectML); integracion directa con el proyecto Vernacula. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles como cifras absolutas. Solo se documentan ratios relativos: ~1,08x mas rapido en batch=1 que el grafo anterior y ~2x de throughput al ordenar por longitud de fonemas antes de batchear. Un lote formado por textos de longitudes muy dispares llena solo ~37% de la capacidad y no es mas rapido que renderizar de uno en uno.
- Nota de integracion: cada elemento del lote solo es valido durante `pred_dur.sum() * 600` muestras; el resto de la fila es relleno de lote y debe recortarse antes de usarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| kokoro-82m-onnx (este) | 82 M | 510 tokens de fonemas por elemento | ONNX fp32 + voces `.bin` float32 | Apache-2.0 | Grafo batcheado de longitud variable; pipeline de exportacion propio; 28 voces en ingles; sin datos de benchmarks de comunidad |
| hexgrad/Kokoro-82M | 82 M | 510 tokens de fonemas por elemento | PyTorch (modelo original) | Apache-2.0 | Modelo base del que deriva esta exportacion; batch=1 en origen; incluye voces de otros idiomas que aqui no se distribuyen |
| Exportaciones de onnx-community para Kokoro | 82 M (mismo modelo base) | no disponible | ONNX | no disponible en la informacion proporcionada | El autor indica que no reutiliza estos artefactos porque no existe un script de exportacion reproducible de los mismos |
| Otras alternativas TTS (Piper, XTTS-v2, Parler-TTS, etc.) | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de estos sistemas en la informacion disponible; la comparacion no se puede establecer con cifras |

## Limitaciones y advertencias

- Solo soporta ingles. El autor excluye deliberadamente las voces de otros idiomas del modelo original porque el frontend de Kokoro en Vernacula es solo ingles.
- La ventana util es de 510 tokens de fonemas por elemento; los textos mas largos deben trocearse previamente en fronteras de frase.
- El G2P esta fuera del grafo: la calidad de la pronunciacion depende de vernacula-phonemizer y de su renderizado al vocabulario de Kokoro.
- El STFT de valores reales que sustituye al complejo no es bit a bit identico a la referencia en PyTorch, aunque la distorsion medida (~0,37 L1 log-espectral) queda por debajo del umbral de jitter y no se aprecia en escucha A/B.
- El relleno de lote no corrompe la fidelidad, pero obliga a recortar cada fila con `pred_dur.sum() * 600` antes de usar el audio.
- `input_lengths` es obligatoria: omitirla o rellenarla mal rompe el enmascaramiento del relleno y, con ello, las estadisticas de AdaIN y las duraciones predichas.
- La eficiencia depende del agrupamiento: mezclar textos de longitudes muy dispares llena solo ~37% del lote y no aporta ninguna ventaja sobre renderizar uno a uno.
- No hay senales de adopcion ni de validacion por parte de la comunidad: el repositorio registra 0 descargas y 0 likes en la informacion disponible.
- Al ser un modelo TTS y no un modelo de lenguaje, no plantea riesgo de alucinacion de contenido, pero si puede producir pronunciaciones incorrectas, prosodia inadecuada o artefactos en fonemas poco frecuentes.
- Licencia Apache-2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y de conservacion del aviso de licencia.
- Para produccion conviene validar el comportamiento en el hardware objetivo, ya que no se publican mediciones absolutas de latencia ni de calidad perceptual (MOS).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/christopherthompson81/kokoro-82m-onnx
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Proyecto Vernacula: https://github.com/christopherthompson81/vernacula
- Scripts de exportacion: https://github.com/christopherthompson81/vernacula/tree/main/scripts/kokoro_export
- Documento de investigacion sobre la exportacion ONNX: https://github.com/christopherthompson81/vernacula/blob/main/docs/kokoro_onnx_investigation.md
- vernacula-phonemizer: https://github.com/christopherthompson81/vernacula-phonemizer
- Paper de StyleTTS 2, referenciado en los tags del repositorio (arXiv:2306.07691): https://arxiv.org/abs/2306.07691
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
