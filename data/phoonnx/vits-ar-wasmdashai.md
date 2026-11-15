# Phoonnx/vits-ar-wasmdashai

## Resumen

vits-ar-wasmdashai es un modelo de síntesis de voz (text-to-speech) en arabe basado en la arquitectura VITS, desarrollado originalmente por wasmdashai y empaquetado por Phoonnx para su librería de inferencia ONNX. El modelo toma texto en caracteres arabe como entrada y genera audio hablado, lo que lo convierte en una pieza util para sistemas de lectura en voz alta, asistentes conversacionales y accesibilidad en entornos de habla arabe.

El empaquetado en formato ONNX y su integración con la librería phoonnx y el plugin ovos-tts-plugin-phoonnx lo hacen especialmente adecuado para despliegues ligeros, sistemas embebidos y entornos OVOS/Mycroft, donde se prioriza la inferencia sin dependencias pesadas de frameworks de deep learning. El repositorio ocupa aproximadamente 0,1 GB, lo que indica un modelo compacto.

La relevancia actual del modelo radica en la escasez relativa de voces TTS arabe de código abierto empaquetadas para inferencia ONNX portatil, así como en su integración directa con el ecosistema de asistentes de voz de código abierto. No se dispone de información publicada sobre el volumen de datos de entrenamiento, la composición del dataset ni métricas de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por caracteres) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (`ar`) |
| Licencia | other (el upstream `wasmdashai/vits-ar` declara `afl-3.0`) |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo basado en normalizing flows y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversarias. Esta combinación permite generar audio de forma directa desde texto sin necesidad de un vocoder separado, lo que simplifica el pipeline de inferencia.

El modelo original fue entrenado por wasmdashai; Phoonnx se limita a empaquetarlo en ONNX y a integrarlo con la librería phoonnx y el normalizador de texto scriptconv. No se dispone de información publicada sobre el número de horas de audio de entrenamiento, la composición del corpus, ni sobre si se aplicaron técnicas de fine-tuning o adaptación de locutor. El front-end de texto utiliza `GraphemePhonemizer` de scriptconv, es decir, trabaja directamente sobre grafemas del texto arabe en lugar de una transcripción fonética intermedia.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en caracteres arabes.
- Generación de audio en formato WAV mediante `synthesize_wav` de la librería phoonnx.
- Integración con el plugin `ovos-tts-plugin-phoonnx` para asistentes OVOS/Mycroft.
- Normalización y conversión de texto mediante scriptconv antes de la síntesis.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión, audio de entrada ni capacidades multimodales más allá de la síntesis de voz.
- Cobertura monolingüe: únicamente arabe.

## Casos de uso

- Lectura en voz alta de contenido web o documentos: el modelo sintetiza texto arabe carácter a carácter mediante su front-end de grafemas, adecuado para sistemas de accesibilidad y lectores de pantalla en entornos arabohablantes.
- Asistente de voz doméstico con OVOS/Mycroft: al integrarse como plugin TTS, permite dotar de voz arabe a asistentes de código abierto desplegados en Raspberry Pi u otros dispositivos de bajos recursos.
- Sistemas de navegación y anuncios por voz: la inferencia ONNX ligera permite generar avisos hablados en tiempo real en dispositivos embebidos sin GPU dedicada.
- Automatización de locuciones para contenido educativo: generación de pistas de audio para cursos, audiolibros o material didáctico en arabe a partir de guiones de texto.
- Integración en pipelines de accesibilidad para aplicaciones móviles o de escritorio: el tamaño reducido del repositorio (0,1 GB) facilita su empaquetado junto a la aplicación.
- Pruebas de concepto y prototipos de TTS arabe: al estar empaquetado para phoonnx, permite evaluar rápidamente la calidad de una voz arabe sin montar un entorno completo de entrenamiento o inferencia con PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,1 GB) se trata de un modelo compacto que probablemente opera en CPU sin GPU dedicada.
- GPU recomendadas: no disponible; no se han publicado requisitos oficiales.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño reducido, aunque no hay datos confirmados.
- Opciones de despliegue: librería phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ejecución mediante ONNX Runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-ar-wasmdashai | VITS | ar | no disponible | other (upstream afl-3.0) | ONNX | Hugging Face (Phoonnx) |
| wasmdashai/vits-ar (upstream) | VITS | ar | no disponible | afl-3.0 | no disponible | Hugging Face |
| Otros modelos VITS empaquetados en la colección Phoonnx | VITS | varios | no disponible | variable | ONNX | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estas alternativas.

## Limitaciones y advertencias

- Cobertura monolingüe: solo arabe; no procesa texto en otros idiomas.
- Entrada basada en grafemas: la calidad de pronunciación depende del normalizador scriptconv y puede degradarse con texto no vocalizado, abreviaturas o números.
- Licencia `other` con upstream `afl-3.0`: es necesario revisar los términos exactos de la AFL-3.0 antes de un uso comercial, especialmente en lo relativo a patentes y redistribución.
- Riesgo de alucinación acústica: como todo modelo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en entradas atípicas.
- Sin datos publicados sobre sesgos de locutor, género o dialecto; no se puede garantizar representatividad de variedades del arabe.
- Sin métricas de calidad publicadas (MOS, WER, etc.): no es posible evaluar objetivamente su fidelidad frente a alternativas.
- Repositorio con muy pocas descargas (29) y nulos likes: comunidad limitada, lo que reduce la validación externa y el soporte.
- Dependencia de librerías específicas (phoonnx, scriptconv) para el pipeline completo de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ar-wasmdashai
- Modelo upstream: https://huggingface.co/wasmdashai/vits-ar
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
