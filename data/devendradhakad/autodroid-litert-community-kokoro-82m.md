# devendradhakad/autodroid-litert-community-Kokoro-82M

## Resumen

Autodroid LiteRT Community Kokoro-82M es una conversión al formato LiteRT (`.tflite`) del modelo de síntesis de voz hexgrad/Kokoro-82M, publicada por el usuario devendradhakad. Kokoro-82M es un sistema TTS de 82 millones de parámetros basado en la arquitectura StyleTTS2 combinada con un decodificador ISTFTNet, que genera audio mono a 24 kHz. Esta conversión no reentrena ni modifica los pesos: su objetivo es empaquetar el modelo original en grafos `.tflite` ejecutables en CPU mediante la API CompiledModel de LiteRT, pensada para despliegue en dispositivo (Android, edge).

La relevancia del artefacto está en que resuelve un problema técnico concreto de la conversión: Kokoro tiene una longitud dependiente de los datos (la expansión duración→alineamiento `L = sum(pred_dur)`) que el conversor `litert_torch` no puede mantener dinámica porque el eje de secuencia de las LSTM se especializa. La solución adoptada consiste en dividir el modelo en tres grafos con buckets fijos (dos de ellos con pasos de proceso en el host) para que funcione con texto libre arbitrario, no solo con una frase predefinida. El repositorio ocupa 0,4 GB e incluye además una compilación de longitud fija usada por la muestra oficial `text_to_speech` de litert-samples.

Se trata de una publicación etiquetada como preview, en FP32 y solo CPU, con 0 descargas y 0 likes en el momento de la consulta. El soporte de GPU y la cuantización figuran en la hoja de ruta, no en la versión actual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (PL-BERT text encoder, 6 LSTM bidireccionales, 58 AdaIN InstanceNorm) + decodificador iSTFTNet con excitación hn-NSF |
| Parámetros totales | 82 M (heredados de hexgrad/Kokoro-82M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje). Límites del artefacto: bucket de 128 tokens fonémicos y 512 frames de audio (≈ 12,8 s por fragmento a 24 kHz) |
| Tipos de cuantización | no disponible (esta versión es FP32; la cuantización está en la hoja de ruta) |
| Idiomas soportados | inglés (la model card especifica TTS en inglés); el resto de idiomas, no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT `.tflite` (FP32), más dos ficheros binarios `istft_Wr_f32.bin` e `istft_Wi_f32.bin` (880 B cada uno) con las bases DFT para el iSTFT en host |

Ficheros incluidos en el repositorio:

| Fichero | Precisión | Tamaño | Función |
|---|---|---|---|
| `kokoro_predictor.tflite` | fp32 | ~91 MB | PL-BERT + codificadores de duración y texto (bi-LSTM desenrolladas con máscara) |
| `kokoro_prosody.tflite` | fp32 | ~37 MB | LSTM compartida de prosodia + F0/N (con máscara) |
| `kokoro_vocoder.tflite` | fp32 | ~236 MB | decodificador iSTFTNet → espectrograma de magnitud y fase |
| `istft_Wr_f32.bin`, `istft_Wi_f32.bin` | fp32 | 880 B cada uno | bases DFT inversas para el iSTFT en host |
| `kokoro_82m_fixedlen_fp32.tflite` | fp32 | ~338 MB | compilación de un solo grafo y longitud fija para la muestra `text_to_speech` de litert-samples |

## Arquitectura y entrenamiento

El modelo subyacente es StyleTTS2 con decodificador ISTFTNet: un codificador de texto PL-BERT, seis LSTM bidireccionales, 58 capas AdaIN InstanceNorm y una etapa de excitación hn-NSF basada en SineGen, que alimenta un decodificador iSTFTNet encargado de producir magnitud y fase espectral. La salida final es una onda mono de 24 kHz. La conversión a LiteRT sigue la ruta general del conversor oficial `litert_torch`, no la ruta de reautoría de la Generative API, porque Kokoro no es un transformer tipo LLM.

El pipeline se divide en tres grafos fijos con pasos en el host: (1) `kokoro_predictor` recibe ids `[1,128]`, `ref_s [1,256]` y `attn [1,128]` y devuelve duración, `d` y `t_en`; en el host se calcula `pred_dur = round(duration)`, el one-hot de alineamiento `aln [1,128,512]` y la máscara de frames `[1,512]`. (2) `kokoro_prosody` recibe `d`, `t_en`, `aln`, `ref_s` y la máscara, y devuelve `asr`, `F0` y `N`; en el host se calcula la excitación hn-NSF mediante STFT de `SineGen(f0_upsamp(F0))`. (3) `kokoro_vocoder` recibe `asr`, `F0`, `N`, `har`, `ref_s` y la máscara, y devuelve `spec` y `phase`; el iSTFT con overlap-add se ejecuta en el host y el resultado se recorta a `L*600` muestras. Los bundles son independientes de la voz: esta se inyecta como entrada `ref_s`, tomada de un `voices/*.pt` del repositorio base e indexada por longitud de secuencia de tokens.

Decisiones técnicas destacables de la conversión: las seis LSTM bidireccionales se desenrollan como bi-LSTM con máscara que arrastran estado a través del padding por la derecha, porque una `nn.LSTM` fusionada filtra los tokens de relleno en la pasada inversa y degrada la prosodia; las 58 InstanceNorm con AdaIN normalizan solo sobre frames reales para que el padding del bucket no contamine las estadísticas; el STFT de la fuente hn-NSF se ejecuta en el host porque la fase `atan2` cambia de signo en el límite F0→0 en dispositivo; y el iSTFT se saca del grafo porque el iSTFT con convolución transpuesta dentro del grafo activa un bug de deduplicación de pesos del conversor que fusiona las bases DFT de coseno y seno.

En cuanto a los datos de entrenamiento, este artefacto no introduce ninguno: hereda los del modelo base, que consisten en unos pocos cientos de horas de audio permisivo o no sujeto a copyright (audio de dominio público, audio con licencias permisivas como Koniwa `tnc` CC BY 3.0 y SIWIS CC BY 4.0, y audio sintético de TTS de grandes proveedores) emparejado con etiquetas fonéticas IPA. No se usaron grabaciones personales propietarias ni clones de voz personalizados. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto libre arbitrario en inglés (nombres, marcas, números), no limitada a una frase predefinida.
- Salida de audio mono a 24 kHz, con recorte a `L*600` muestras por fragmento.
- División de textos largos en frases en el host, cada una de longitud menor o igual al bucket.
- Independencia de la voz: la identidad vocal se controla mediante la entrada `ref_s` (ficheros `voices/*.pt` del repositorio base).
- Generación de duración, alineamiento, prosodia (F0) y espectrograma de magnitud y fase como salidas intermedias accesibles.
- Ejecución en CPU en dispositivo mediante la API CompiledModel de LiteRT, sin dependencia de PyTorch en tiempo de inferencia.
- Integración con un front-end G2P neuronal externo (litert-community/Kokoro-G2P-en-US) para texto arbitrario sin palabras descartadas.
- Compilación de longitud fija compatible con la muestra oficial de Android basada en la API Interpreter.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Lectura por voz en aplicaciones Android sin conexión: los tres grafos `.tflite` en FP32 se ejecutan en CPU con la API CompiledModel, de modo que la síntesis no requiere red ni servicio en la nube; encaja en lectores de noticias, accesibilidad o asistentes locales.
- Audiolibros y contenido largo generado en local: el recorte por frases de longitud menor o igual al bucket (128 tokens fonémicos, ≈ 12,8 s de audio) permite procesar documentos extensos encadenando fragmentos y recortando la salida a `L*600` muestras.
- Accesibilidad para personas con discapacidad visual en dispositivos de gama media: al no necesitar GPU ni PyTorch, se puede empaquetar en una app que lea pantallas o notificaciones en el propio teléfono.
- Locución de nombres propios, marcas y cifras: combinado con el front-end G2P litert-community/Kokoro-G2P-en-US, evita el descarte de palabras que sufren los front-ends basados en diccionario, algo útil en avisos de voz o sistemas de megafonía.
- Prototipado de voces sintéticas con control de identidad: al aceptar `ref_s` procedente de los `voices/*.pt` del repositorio base, permite cambiar de voz sin recompilar los `.tflite`, útil para demos de producto o pruebas A/B de locución.
- Investigación en conversión de modelos de audio a LiteRT: el repositorio documenta los problemas concretos encontrados (LSTM dinámicas, InstanceNorm con padding, fase `atan2`, bug de deduplicación en iSTFT) y sirve como referencia reproducible para convertir arquitecturas StyleTTS2/ISTFTNet al formato de Google.
- Integración en canalizaciones de CI para pruebas de regresión de audio: la compilación de longitud fija `kokoro_82m_fixedlen_fp32.tflite` permite verificar de forma determinista que la conversión sigue siendo numéricamente fiel respecto a la referencia PyTorch.
- Despliegue en dispositivos edge con presupuesto térmico y de memoria limitado: al sumar los tres grafos unos 364 MB en FP32, es viable en equipos con almacenamiento y RAM moderados, aunque en esta versión no alcanza tiempo real (RTF ≈ 1,8 en Pixel 8a).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MOS, WER, MCD, comparativas tipo MMLU o HumanEval no aplicables) en la información disponible. La búsqueda web realizada no devolvió resultados relacionados con el modelo. Las únicas métricas publicadas son de fidelidad de la conversión y de velocidad en dispositivo, declaradas por el autor:

| Métrica | Valor | Condiciones |
|---|---|---|
| Correlación de espectrograma de magnitud frente a la referencia PyTorch | 0,9994 | Varias frases reservadas, no solo la muestra de exportación |
| Correlación de forma de onda frente a la referencia PyTorch | ≈ 0,98 | Efecto de frontera del padding del bucket |
| RTF (real-time factor) | ≈ 1,8 | Pixel 8a, FP32, CPU, 4 hilos; compilación de longitud fija; ~6,6 s para sintetizar 3,7 s de audio |
| Frecuencia de muestreo de salida | 24 kHz mono | Todos los grafos |
| Bucket de tokens / frames | 128 tokens / 512 frames (≈ 12,8 s) | Configuración de los bundles |

## Requisitos de hardware

- VRAM: no aplica en esta versión; está diseñada para inferencia en CPU. No se publican requisitos de VRAM para GPU.
- Memoria: los tres grafos suman ≈ 364 MB en FP32 (91 + 37 + 236), a lo que hay que añadir los buffers intermedios y las voces `ref_s`; el repositorio completo ocupa 0,4 GB. No se documenta un requisito de RAM medido.
- GPU: no soportada en esta versión. El soporte de GPU figura explícitamente en la hoja de ruta, mencionando el layout fused-QKV de más de 4 dimensiones en la atención y la máscara `EQUAL`/`SE...` (información truncada en la model card). No hay GPU recomendadas publicadas.
- Cabe en GPU de consumo: sí en cuanto a tamaño de pesos, pero la versión actual no ofrece ruta de ejecución en GPU; en CPU funciona en hardware móvil (validado en Pixel 8a).
- Despliegue: API CompiledModel de LiteRT en CPU, API Interpreter para la muestra oficial de Android (litert-samples, PR #159). No se contempla vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje.
- Latencia y throughput: RTF ≈ 1,8 en Pixel 8a (FP32, CPU, 4 hilos), es decir, más lento que tiempo real; aproximadamente 6,6 s para 3,7 s de audio. La model card señala la cuantización como la vía hacia el tiempo real en dispositivo. No se publican cifras de throughput en servidor ni en otras plataformas.

## Comparativa con modelos similares

La búsqueda web no devolvió información sobre alternativas comparables, por lo que la comparación se limita a los artefactos relacionados citados en la propia model card.

| Modelo | Tipo | Parámetros | Contexto / límite | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| devendradhakad/autodroid-litert-community-Kokoro-82M | Conversión LiteRT de TTS | 82 M | 128 tokens fonémicos / 512 frames (≈ 12,8 s) por fragmento | `.tflite` FP32 | Apache 2.0 | Solo CPU; preview; RTF ≈ 1,8 en Pixel 8a |
| hexgrad/Kokoro-82M | Modelo base de TTS | 82 M | No disponible | Pesos PyTorch (safetensors, no confirmado en la información disponible) | Apache 2.0 | Referencia de fidelidad; requiere PyTorch en tiempo de inferencia |
| litert-community/Kokoro-G2P-en-US | Front-end G2P neuronal | No disponible | No disponible | No disponible | No disponible | Complementario, no sustituto: convierte grafemas a fonemas para texto arbitrario |
| Otras alternativas de TTS en dispositivo (p. ej. Piper u otras) | No disponible | No disponible | No disponible | No disponible | No disponible | No se encontró información comparable en la búsqueda web realizada |

## Limitaciones y advertencias

- Es una etiqueta de preview: la propia model card indica FP32 y solo CPU, con GPU y cuantización pendientes en la hoja de ruta.
- No alcanza tiempo real en el hardware validado: RTF ≈ 1,8 en Pixel 8a, es decir, tarda más en sintetizar que la duración del audio generado.
- La correlación de forma de onda frente a PyTorch es de ≈ 0,98, no de 1,0; el autor lo atribuye al efecto de frontera del padding del bucket y sostiene que el espectro, que es lo percibido, correlaciona a 0,9994.
- El texto se trunca a los límites del bucket: frases de más de 128 tokens fonémicos deben dividirse en el host; cada fragmento queda limitado a unos 12,8 s de audio (512 frames).
- Idioma: el pipeline está descrito para inglés. No hay información sobre soporte multilingüe ni sobre variantes dialectales.
- Sesgos conocidos: no se documentan sesgos específicos de esta conversión, pero el modelo hereda las características del corpus de entrenamiento del modelo base (audio de dominio público, con licencias permisivas y sintético), lo que puede implicar una cobertura limitada de acentos y estilos.
- Riesgo de pronunciación incorrecta en nombres propios, marcas y cifras si no se usa el front-end G2P recomendado; el autor advierte de que con front-ends alternativos pueden descartarse palabras.
- Requiere pasos en el host no incluidos en los `.tflite` (cálculo de `pred_dur` y del alineamiento, STFT de la fuente hn-NSF, iSTFT con overlap-add y recorte): quien integre el modelo debe reimplementar fielmente esos pasos o el audio dejará de ser correcto.
- La compilación `kokoro_82m_fixedlen_fp32.tflite` está pensada para una frase de demostración de longitud fija; no sirve para texto arbitrario.
- Sin datos de uso: 0 descargas y 0 likes, y sin validación independiente publicada más allá de las mediciones del autor.
- Licencia Apache 2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo base y de las voces `voices/*.pt` utilizadas, no detalladas en la información disponible.
- Privacidad: el autor declara que no se incluye información personal identificable y que el audio de entrenamiento del modelo base es permisivo, de dominio público o sintético, no grabaciones personales extraídas de la web.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devendradhakad/autodroid-litert-community-Kokoro-82M
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Front-end G2P recomendado: https://huggingface.co/litert-community/Kokoro-G2P-en-US
- Documentación de LiteRT: https://ai.google.dev/edge/litert
- Muestra oficial de Android (PR 159 de litert-samples): https://github.com/google-ai-edge/litert-samples/pull/159
- Código de conversión y pipeline: https://github.com/john-rocky/LiteRT-Models
