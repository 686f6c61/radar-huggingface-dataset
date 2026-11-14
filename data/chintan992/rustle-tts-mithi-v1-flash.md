# chintan992/rustle-tts-mithi-v1-flash

## Resumen

Rustle TTS Mithi v1 Flash es un paquete de artefactos ONNX derivado de Oomni/mithi-v1-flash, un sistema de síntesis de voz (text-to-speech) orientado a once idiomas de la India y al inglés. Lo publica el usuario chintan992 como conversión independiente, no oficial, pensada para inferencia en dispositivo dentro de la aplicación Android Rustle. El repositorio no contiene pesos de un transformer generativo de texto, sino los grafos necesarios para ejecutar un pipeline TTS completo: codificador de prosodia, decodificador autorregresivo y vocoder.

El modelo base Mithi v1 Flash combina un frontend de normalización y fonemización, un codificador de prosodia con soporte opcional de indic-bert, un decodificador autorregresivo de códigos de prosodia y un vocoder de estilo Kokoro. La conversión fija el commit `94bc455ae91679460cad7a5d3d30b7baf9c1cf13` del modelo original y exporta los grafos en ONNX opset 17 en fp32, junto con constantes de runtime en npz y JSON.

Su relevancia actual es práctica: permite desplegar TTS multilingüe indio en Android y en CPU de escritorio sin depender de frameworks de deep learning pesados, con salida de audio a 24 kHz mono y voces masculina (Satvik) y femenina (Charvi). El tamaño del repositorio es de 0,4 GB y la licencia es Apache-2.0, lo que facilita su integración comercial con las obligaciones de atribución correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS por etapas: codificador de prosodia (writer_read), decodificador autorregresivo (writer_step) y vocoder estilo Kokoro (decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (ONNX opset 17); no se documentan otras precisiones |
| Idiomas soportados | hi, en, bn, gu, kn, ml, mr, or, pa, ta, te |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (writer_read.onnx, writer_step.onnx, decoder.onnx), npz, JSON y safetensors para el codificador indic-bert |

## Arquitectura y entrenamiento

La información disponible describe la arquitectura de inferencia, no el proceso de entrenamiento del modelo base. El pipeline se compone de tres grafos ONNX. `writer_read.onnx` actúa como codificador de prosodia y acepta `(enc_ids, word_vec, has_word, spk, lang)` para producir una representación `H` de dimensión `[1,T,384]`. `writer_step.onnx` implementa el paso autorregresivo del decodificador transformer, con entradas `(H, dec_ids, dec_map, prev_codes)` y salida `h_last` de 384 dimensiones. `decoder.onnx` es un vocoder de estilo Kokoro que recibe `(dec_ids, frame_map, f0, en, style)` y genera la forma de onda de audio.

El modelo admite dos modos. En modo no-bert, por defecto, se pasan vectores de palabra a cero y una máscara `has_word` a falso, replicando el fallback del modelo original. En modo bert se calculan vectores por token con los activos recortados de ai4bharat/indic-bert incluidos en `indic_encoder/`, que aportan `model.safetensors`, `config.json`, `spiece.model` y `old2new.npy`. La prosodia se genera mediante un bucle autorregresivo en el host que recorre trece cabezas (`head_0..12`), cada una con una estructura Linear-GELU-Linear, y acumula embeddings de código (`code_emb_0..12`) para muestrear duraciones, pitch y energía según reglas de voicing, breath, pitch y energy definidas en `mithi_runtime_config.json`.

La procedencia declarada incluye Maya2-native (Apache-2.0), Kokoro-82M (Apache-2.0), indic-bert (MIT), el normalizador de texto Maya (Apache-2.0) y misaki (Apache-2.0). No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz multilingüe en once idiomas: hindi, inglés, bengalí, guyaratí, canarés, malabar, maratí, oriya, panyabí, tamil y telugu.
- Dos voces predefinidas: Satvik (masculina) y Charvi (femenina), seleccionables mediante el índice `voice` de la configuración de runtime.
- Control de prosodia explícito: duraciones por token, frecuencia fundamental (`f0`) y energía (`en`) a nivel de frame, con reglas de voicing, respiración, pitch y energía.
- Salida de audio a 24 kHz mono, PCM de 16 bits, con forma de onda float en el rango [-1, 1].
- Modo no-bert de bajo coste y modo bert de mayor calidad mediante vectores de palabra de indic-bert.
- Vocoder determinista: sin RNG en tiempo de ejecución, lo que permite renders reproducibles bit a bit para un muestreador del host con semilla fija e inputs constantes.
- Ejecución en CPU de escritorio validada con ONNX Runtime; no requiere GPU.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento, ya que el modelo es exclusivamente text-to-speech.

## Casos de uso

- Lectura por voz en aplicaciones Android: integración en la app Rustle mediante ONNX Runtime para convertir texto en audio sin conexión, usando el modo no-bert para reducir consumo de CPU y memoria en dispositivos móviles.
- Accesibilidad para personas con discapacidad visual: narración de contenido en hindi, tamil o bengalí con prosodia controlada, aprovechando la salida a 24 kHz y las dos voces disponibles para adaptar el tono al usuario.
- Asistentes de voz multilingües para el mercado indio: generación de respuestas habladas en once idiomas desde un mismo pipeline, seleccionando el índice de idioma en `mithi_runtime_config.json` por petición.
- Audiolibros y contenido educativo: renderizado por frases con `writer_read` una vez por sentencia y bucle autorregresivo en el host, lo que permite trocear textos largos y mantener latencia acotada por segmento.
- Sistemas de anuncios y megafonía: síntesis determinista y reproducible para mensajes pregrabados o generados dinámicamente, con verificación de integridad mediante `sha256sums.txt`.
- Pruebas de regresión de pipelines TTS: al ser el vocoder determinista, sirve como referencia para comparar cambios en el frontend de normalización o en el muestreador del host con resultados bit a bit reproducibles.
- Prototipado en CPU sin GPU: validación de calidad y latencia en portátiles antes de decidir entre el modo no-bert y el modo bert según el equilibrio calidad/recursos del dispositivo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que los grafos se validaron en CPU de escritorio con ONNX Runtime y que se realizaron comprobaciones de escucha en guyaratí e inglés, incluidos dígitos, el 14 de noviembre de 2026, sin aportar métricas objetivas como MOS, RTF ni WER.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma directa; el paquete está pensado para CPU y el repositorio completo ocupa 0,4 GB, incluyendo los grafos ONNX en fp32 y los activos de indic-bert.
- GPU recomendadas: no se documentan; la validación se realizó en CPU de escritorio con ONNX Runtime.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; al ejecutarse con ONNX Runtime podría usar aceleración por proveedores de ejecución, pero no se especifica.
- Opciones de despliegue: ONNX Runtime (validado), con integración en Android mediante la app Rustle. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este pipeline TTS.
- Latencia y throughput: no disponibles. El coste depende del número de tokens de prosodia por frase, del modo (no-bert o bert) y del hardware; el vocoder es determinista y no introduce RNG.
- Requisitos adicionales: el frontend de normalización y fonemización no está incluido en el paquete; el autor indica que el modelo original usa espeak-ng y misaki, y advierte de que espeak-ng tiene licencia GPL-3.0, lo que puede condicionar su uso en productos propietarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Rustle TTS Mithi v1 Flash (este) | no disponible | no disponible | 11 (India + inglés) | Apache-2.0 | ONNX, npz, JSON | Conversión no oficial para ONNX Runtime y Android; vocoder determinista |
| Oomni/mithi-v1-flash (base) | no disponible | no disponible | 11 (India + inglés) | Apache-2.0 | no disponible en la informacion | Modelo original del que deriva esta conversión |
| Kokoro-82M | 82 M | no disponible | no disponible en la informacion | Apache-2.0 | no disponible en la informacion | Componente del vocoder según la procedencia declarada; referencia de TTS ligero |
| indic-bert (ai4bharat) | no disponible | no disponible | idiomas indios | MIT | safetensors | Codificador de vectores de palabra usado en modo bert |

No se dispone de datos de benchmarks que permitan comparar rendimiento objetivamente con estas alternativas.

## Limitaciones y advertencias

- Conversión independiente y no oficial: el autor indica explícitamente que no es un lanzamiento de Oomni; conviene fijar el commit al consumir el repositorio.
- El frontend de normalización y fonemización no está incluido; hay que aportar un G2P compatible. El autor señala que espeak-ng, usado por el modelo original, es GPL-3.0, lo que puede entrar en conflicto con despliegues propietarios.
- Solo se han documentado comprobaciones de escucha en guyaratí e inglés; la calidad en el resto de idiomas (bengalí, canarés, malabar, maratí, oriya, panyabí, tamil, telugu, hindi) no está verificada en la información disponible.
- No se documentan sesgos conocidos, tasas de alucinación ni métricas de inteligibilidad; al ser un modelo TTS, el riesgo principal es una pronunciación o prosodia incorrecta, no la generación de contenido falso.
- La licencia Apache-2.0 permite uso comercial, pero exige conservar `LICENSE` y `NOTICE` con la atribución de los componentes (Maya2-native, Kokoro-82M, indic-bert, normalizador Maya, misaki).
- El modo bert requiere cargar los activos de indic-bert y ejecutar sentencepiece, lo que incrementa el consumo de memoria y el tiempo de preprocesado frente al modo no-bert.
- El paquete está orientado a inferencia en dispositivo; no se documentan límites de longitud de texto por frase ni comportamiento con entradas muy largas.
- Los grafos están en fp32; no se ofrecen variantes cuantizadas, lo que puede limitar el despliegue en dispositivos con poca memoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chintan992/rustle-tts-mithi-v1-flash
- Modelo base: https://huggingface.co/Oomni/mithi-v1-flash
- Commit fijado del modelo base: `94bc455ae91679460cad7a5d3d30b7baf9c1cf13`
- Repositorio de la app Rustle: https://github.com/ (el autor no especifica la ruta exacta en la información disponible)
- indic-bert (ai4bharat): no se proporciona URL directa en la información disponible
- Kokoro-82M: no se proporciona URL directa en la información disponible
