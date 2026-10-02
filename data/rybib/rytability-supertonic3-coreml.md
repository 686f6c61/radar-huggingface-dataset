# Rybib/rytability-supertonic3-coreml

## Resumen

Supertonic 3 for Core ML (Rytability) es una conversión a Core ML del modelo de síntesis de voz Supertonic 3, desarrollado originalmente por Supertone Inc. Esta conversión la ha preparado el autor Rybib para la función Read Aloud en la aplicación Rytability en iPhone, iPad y Mac. El modelo base es un sistema de text-to-speech no autorregresivo de 99 millones de parámetros que genera audio a 44,1 kHz en 31 idiomas y con 10 voces predefinidas, pensado para ejecutarse íntegramente en el dispositivo sin GPU ni conexión a la nube.

La relevancia de esta ficha radica en que empaqueta el pipeline completo de Supertonic 3 en cuatro grafos Core ML ML Program (DurationPredictor, TextEncoder, VectorEstimator y Vocoder), manteniendo las dimensiones de texto y de latentes dinámicas y ejecutándose únicamente en CPU. Añade, además, una salida extra de alineación temporal derivada de las cabezas de cross-attention del propio modelo, útil para sincronizar texto y audio.

El resultado es un TTS multilingüe y ligero, orientado a inferencia on-device en el ecosistema Apple, distribuido bajo la licencia OpenRAIL-M heredada del modelo original y con un tamaño de descarga de aproximadamente 381 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS no autorregresivo con flow-matching (cuatro subgrafos: DurationPredictor, TextEncoder, VectorEstimator, Vocoder) |
| Parametros totales | 99 millones (modelo base Supertonic 3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS); el TextEncoder valida longitudes de texto de 8 a 600 caracteres y latentes de 1 a 600 frames |
| Tipos de cuantizacion | float32 (Core ML ML Program, MIL); no se publican otras cuantizaciones |
| Idiomas soportados | 31 idiomas: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | bigscience-openrail-m (OpenRAIL-M con restricciones de uso, Anexo A) |
| Formato de pesos | .mlmodelc (Core ML ML Program / MIL); los grafos originales eran ONNX |

## Arquitectura y entrenamiento

El modelo base Supertonic 3 es un sistema de text-to-speech no autorregresivo basado en flow-matching, con 99 millones de parámetros, desarrollado por Supertone Inc. El pipeline se compone de cuatro etapas: un predictor de duración (DurationPredictor), un codificador de texto (TextEncoder), un estimador de vectores (VectorEstimator) que aplica el proceso de flow-matching, y un vocoder que produce la onda final. La generación es iterativa pero no autorregresiva: se parte de ruido gaussiano de forma `[1, 144, ceil(duration * 44100 / 3072)]` y se ejecuta el VectorEstimator durante `total_step` = 8 pasos antes de pasar por el vocoder, que entrega audio mono a 44,1 kHz.

En esta conversión, los cuatro grafos ONNX originales se tradujeron directamente a operaciones Core ML ML Program (iOS 18 / macOS 15, float32), conservando las dimensiones de longitud de texto y de latentes como dinámicas para evitar el padding (el text encoder y el vector estimator de Supertonic no son invariantes al padding). No se especifica en la información disponible si el modelo base recibió entrenamiento con RLHF o DPO, ni la composición exacta del dataset de entrenamiento. El detalle técnico distintivo de esta conversión es la salida adicional `alignment` `[1, L, T]`, calculada como media ponderada de cuatro cabezas de cross-attention de texto (bloque 15 cabeza 5 con peso 0,4; bloque 9 cabeza 6, bloque 21 cabezas 2 y 7 con peso 0,2 cada una), que sigue el texto de forma monótona y permite derivar tiempos por carácter mediante una ruta de Viterbi monótona.

## Capacidades

- Síntesis de voz (text-to-speech) multilingüe en 31 idiomas, con etiquetado por idioma mediante `<lang>...</lang>` o lectura agnóstica al idioma con `<na>...</na>`.
- Diez voces predefinidas (F1-F5 y M1-M5) incluidas como estilos de voz en `voice_styles/*.json`.
- Generación de audio mono a 44,1 kHz.
- Ejecución on-device en CPU (Apple Silicon y dispositivos iOS/iPadOS/macOS compatibles con Core ML) sin necesidad de GPU ni de servicios en la nube.
- Salida adicional de alineación texto-audio (`alignment`), útil para resaltado de texto sincronizado durante la lectura.
- Funcionamiento en segundo plano en aplicaciones iOS gracias a la ejecución en CPU (`MLComputeUnits.cpuOnly`).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje, sino un TTS).

## Casos de uso

- Función Read Aloud en aplicaciones iOS/iPadOS/macOS: integración directa del pipeline Core ML para convertir texto en voz dentro de la app Rytability, aprovechando la ejecución en CPU que permite seguir generando audio con la aplicación en segundo plano.
- Lectura sincronizada con resaltado: la salida `alignment` permite marcar el carácter o la palabra que se está leyendo en tiempo real, útil en apps de lectura, aprendizaje de idiomas o accesibilidad.
- Accesibilidad para personas con discapacidad visual: narración de textos largos (hasta 600 caracteres por segmento validado) sin depender de conectividad, con voces en 31 idiomas.
- Asistentes de voz embebidos: generación local de respuestas habladas en aplicaciones de productividad o domótica, evitando enviar texto a servicios en la nube.
- Aprendizaje de idiomas: reproducción de frases en el idioma objetivo (por ejemplo `es`, `de`, `ja`) con voces nativas, manteniendo la privacidad del contenido del usuario.
- Audiolibros y podcasts generados localmente: conversión de documentos o artículos a audio en el dispositivo, sin costes de API ni cuotas de uso.
- Sistemas de navegación o avisos por voz on-device: anuncios hablados cortos con latencia baja y sin conexión a red.
- Integración en pipelines de accesibilidad multiplataforma: uso de los grafos Core ML como componente TTS dentro de aplicaciones nativas de Apple que requieren funcionamiento offline.

## Benchmarks y rendimiento

La información disponible incluye validaciones de fidelidad y calidad, no una batería de benchmarks estándar (tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo TTS).

| Metrica | Resultado | Contexto |
|---|---|---|
| Error relativo frente a ONNX Runtime | ≤ 3e-6 | Todas las etapas, longitudes de texto de 12 a 159 y latentes de 19 a 145 |
| Rango de longitudes de texto soportadas en CPU | 8 a 600 caracteres | Ruta CPU de Core ML |
| Rango de frames latentes soportados en CPU | 1 a 600 frames | Ruta CPU de Core ML |
| Inteligibilidad del habla (CER) | 0,005 | Whisper large-v3-turbo, 8 frases en 8 idiomas |
| Error absoluto medio de tiempos de palabra | 15 ms (23 ms en el percentil 90) | Frente a un alineador forzado independiente (torchaudio MMS_FA), aplicando un desfase constante de ~77 ms, sobre 102 palabras en inglés, español, francés y alemán |

No se han publicado en la información disponible resultados de benchmarks comparativos adicionales entre modelos.

## Requisitos de hardware

- No se requiere GPU: el modelo se ejecuta con `MLComputeUnits.cpuOnly` en Core ML.
- No soporta Neural Engine (las formas dinámicas no están soportadas por el Neural Engine de Apple en esta configuración).
- Compatible con iPhone, iPad y Mac que soporten Core ML en iOS 18 / macOS 15.
- Tamaño de descarga aproximado: 381 MB (0,4 GB en el repositorio de Hugging Face).
- Opciones de despliegue: Core ML (formato `.mlmodelc`); el modelo original de Supertonic 3 dispone de ejecución vía ONNX Runtime en CPU, y existen otras conversiones (por ejemplo, LiteRT mediante Speech Core según la documentación de Soniqo).
- Latencia y throughput: no disponibles en la información proporcionada. El pipeline emplea 8 pasos de flow-matching (`total_step` = 8) más la pasada del vocoder.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Voces | Salida | Licencia | Formato / plataforma |
|---|---|---|---|---|---|---|
| Rybib/rytability-supertonic3-coreml (esta ficha) | 99 M | 31 | 10 (F1-F5, M1-M5) | 44,1 kHz mono | bigscience-openrail-m | Core ML (.mlmodelc), CPU only |
| Supertone/supertonic-3 (original) | 99 M | 31 | 10 (F1-F5, M1-M5) | 44,1 kHz mono | bigscience-openrail-m | ONNX, CPU via ONNX Runtime |
| FluidInference/supertonic-3-coreml | no disponible | no disponible | no disponible | no disponible | no disponible | Conversión Core ML alternativa |
| LiteRT / Speech Core (Soniqo) | 99 M | 31 | 10 | 44,1 kHz | no disponible | LiteRT |

## Limitaciones y advertencias

- Licencia OpenRAIL-M: incluye restricciones de uso (Anexo A) que aplican tanto a la conversión como a los productos derivados; hay que revisar dichas restricciones antes de un uso comercial.
- Ejecución únicamente en CPU (`MLComputeUnits.cpuOnly`); no se puede delegar al Neural Engine, lo que puede limitar el rendimiento en dispositivos de gama baja.
- Compatibilidad restringida al ecosistema Core ML (iOS 18 / macOS 15 en adelante); no es un formato portable fuera de Apple sin conversión adicional.
- El texto se procesa por segmentos (validado entre 8 y 600 caracteres); textos muy largos deben fragmentarse.
- La salida de alineación `alignment` presenta un desfase constante de aproximadamente 77 ms respecto al inicio acústico de la palabra, que debe corregirse si se usa para sincronización exacta.
- La alineación se validó con 102 palabras en inglés, español, francés y alemán; su comportamiento en los demás idiomas soportados no está cuantificado en la información disponible.
- La evaluación de inteligibilidad (CER 0,005) se realizó sobre solo 8 frases en 8 idiomas, una muestra reducida.
- No se documentan sesgos de voces ni evaluación de subgrupos demográficos.
- Riesgo de alucinación acústica inherente a los modelos generativos de voz (pronunciación incorrecta, artefactos en entradas atípicas), no cuantificado en la información disponible.
- No se especifican requisitos de memoria RAM en ejecución más allá del tamaño de descarga.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/Rybib/rytability-supertonic3-coreml
- Modelo original Supertonic 3: https://huggingface.co/Supertone/supertonic-3
- Réplica en archivo del modelo original: https://huggingface.co/supertone-oss-archive/supertonic-3
- Código fuente de Supertonic (MIT): https://github.com/supertone-oss-archive/supertonic
- Página del proyecto Supertonic 3: https://supertonic3.github.io/
- Conversión Core ML alternativa: https://huggingface.co/FluidInference/supertonic-3-coreml
- Documentación de Supertonic-3 TTS (CoreML + LiteRT): https://soniqo.audio/guides/supertonic
- Repositorio de clonación de estilos de voz: https://github.com/saurabhv749/supertonic3-voice-clone
