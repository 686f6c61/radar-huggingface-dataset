# assassinshadow/Gemma-4-E4B-it-text-SM8450-LiteRT-LM-NPU

## Resumen

Gemma 4 E4B-it para la NPU del Snapdragon 8 Gen 1 es una compilación del modelo Gemma 4 E4B de Google, entrenado con cuantización consciente (QAT), para ejecutarse sobre la NPU Hexagon v69 del SoC Qualcomm SM8450 (Snapdragon 8 Gen 1). Lo publica el usuario assassinshadow y deriva del bundle oficial `litert-community/gemma-4-E4B-it-litert-lm`, que LiteRT-LM ejecuta sobre GPU; esta versión traslada las 42 capas del decodificador y el `lm_head` a la NPU. El resultado es un modelo multimodal (texto, imagen y audio en la variante correspondiente) que corre íntegramente en un teléfono Android, sin servidor.

El interés práctico está en la inferencia local en dispositivo: los bundles ocupan entre 5,39 GB y 5,92 GB, ofrecen ventanas de contexto de 4K, 16K y 32K tokens, y alcanzan entre 5,5 y 14,2 tok/s de decodificación según configuración y uso de decodificación especulativa. La licencia declarada es Apache-2.0, aunque el enlace de licencia apunta a los términos específicos de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial.

Técnicamente destaca la división del grafo en tres contextos QNN que deben residir en tres procesos distintos, porque un solo proceso de este chip solo puede mapear unos 1,85 GB del DSP frente a los 2,36 GB de pesos del modelo. Esa restricción obliga a usar la librería de despacho incluida en `runtime/`; con la versión estándar de LiteRT la carga falla con el error `Failed to create QNN context: 1002`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4 E4B) con capas de atención global y de ventana deslizante; compilado a grafos QNN para NPU Hexagon v69 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096, 16.384 y 32.768 tokens según el fichero |
| Tipos de cuantización | Pesos QAT de 2, 4 y 8 bits (344 capas lineales: `lm_head` a 2 bits, 258 a 4 bits, 85 a 8 bits); activaciones int8; capas auxiliares (normas, atención, residuales) en 16 bits; caché K/V en 8 bits |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | `.litertlm` (LiteRT-LM), 5,39–5,92 GB por fichero; repo de 33,3 GB |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E4B-it`, un transformer decoder de 42 capas con mezcla de capas de atención global y de ventana deslizante (las capas de ventana mantienen buffers circulares de 512 posiciones). El bundle no re-cuantiza: conserva los códigos enteros, escalas y rejillas int8 del entrenamiento QAT de Google, junto con las tablas de embeddings y el tokenizador SentencePiece originales. El pegamento entre capas lineales se mantiene en 16 bits, calibrado sobre 12 prompts.

La compilación a NPU divide el grafo en tres contextos QNN: decodificación parte 1 (capas 0–23, 1.144 MB), decodificación parte 2 (capas 24–41 más `lm_head`, 1.133 MB) y prefill (32 tokens por llamada, capas 0–23, 1.095 MB). El corte tras la capa 23 aprovecha que las capas 24–41 no generan K/V y solo leen las cachés de las capas 22 y 23. La variante de 32K se corta tras la capa 22 para evitar transferir 67 MB de caché entre procesos en cada token, lo que eleva el rendimiento de 5,0–5,1 a 6,1–6,6 tok/s. Esa variante incorpora además el drafter MTP de Google para decodificación especulativa (ejecutado en CPU, leyendo los últimos 2.048 slots de la caché de la capa 23) y un grafo `verify` que procesa el último token aceptado más tres borradores en una sola llamada a la NPU.

## Capacidades

- Generación de texto y razonamiento conversacional en inglés.
- Procesamiento multimodal (imagen y audio) únicamente en el fichero `gemma4-e4b-qat-ctx32768-c22-mtp-multimodal_sm8450.litertlm`.
- Decodificación especulativa con drafter MTP en los bundles de 32K, con aceleraciones medidas de hasta 14,2 tok/s en generación de código.
- Prefill por lotes de 32 tokens por llamada a la NPU.
- Ejecución íntegra en dispositivo sobre la NPU Hexagon, sin conexión a servidores.
- Servicio mediante endpoint compatible con la API de OpenAI a través de la app AutoDroid Studio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales offline en Android: el bundle de 4K permite diálogos multi-turno con 9–11 tok/s de decodificación sobre la NPU, sin enviar datos a la nube, adecuado para aplicaciones de privacidad estricta.
- Autocompletado y generación de código en el dispositivo: con la decodificación especulativa del bundle de 32K se midieron 14,2 tok/s en la generación de una función Python, suficiente para sugerencias interactivas en editores móviles.
- Resumen de documentos largos: la ventana de 32.768 tokens permite procesar informes o artículos completos en una sola pasada, con un prefill de unos 190 tok/s.
- Descripción de imágenes y transcripción de audio en local: la variante multimodal lee imágenes y audio directamente en el teléfono, útil para accesibilidad o para indexar contenido capturado con la cámara y el micrófono.
- Servicio local compatible con OpenAI: AutoDroid Studio expone los bundles mediante un endpoint estilo OpenAI, lo que permite conectar clientes y herramientas existentes sin modificar el código de la aplicación.
- Prototipado e investigación en IA en dispositivo: los ficheros y la librería de despacho de `runtime/` permiten medir latencia, throughput y consumo en hardware móvil real para estudios de eficiencia.
- Integración en flujos de automatización del teléfono: al ejecutarse como proceso local con endpoint HTTP, el modelo puede recibir peticiones de otras apps del dispositivo para tareas de clasificación o redacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Sí se incluyen mediciones de rendimiento de inferencia realizadas en un Samsung Galaxy S22 Ultra (SM-S908E) con la CLI de LiteRT-LM sobre núcleos grandes:

| Fichero | Contexto | Decodificación | Prefill | Tamaño |
|---|---:|---:|---:|---:|
| `gemma4-e4b-qat_sm8450.litertlm` | 4.096 | 9–11 tok/s | ~390 tok/s | 5,39 GB |
| `gemma4-e4b-qat-ctx16384_sm8450.litertlm` | 16.384 | ~6,4 tok/s | ~360 tok/s | 5,39 GB |
| `gemma4-e4b-qat-ctx32768_sm8450.litertlm` | 32.768 | 5,5 tok/s; 8–14 tok/s con drafter | ~190 tok/s | 5,58 GB |
| `gemma4-e4b-qat-ctx32768-c22-mtp-multimodal_sm8450.litertlm` | 32.768 | mismas secciones NPU que el de 32K | igual | 5,92 GB |
| `gemma4-e4b-qat-ctx32768-c22-mtp_sm8350.litertlm` (Snapdragon 888) | 32.768 | 5,0 tok/s; 7–10 tok/s con drafter | ~105 tok/s | 5,59 GB |

Medición detallada del bundle de 32K con y sin drafter (260 tokens por prueba, una sesión):

| Configuración | Relato | Función Python |
|---|---:|---:|
| Drafter desactivado | 5,5 tok/s | 5,7 tok/s |
| Drafter activado (`--enable_speculative_decoding=true`) | 8,3 tok/s | 14,2 tok/s |
| Build anterior de 32K con el mismo drafter | 6,8 tok/s | 11,6 tok/s |

## Requisitos de hardware

- SoC objetivo: Qualcomm Snapdragon 8 Gen 1 (SM8450, Hexagon v69); existe un fichero específico para Snapdragon 888 (SM8350). Las etiquetas mencionan también Snapdragon 8 Gen 1 y SM8350, no otros chips.
- Memoria: los pesos del modelo ocupan 2,36 GB en la NPU, pero un solo proceso del chip solo puede mapear unos 1,85 GB del DSP, por lo que se requieren tres procesos con los tres contextos QNN (1.095–1.187 MB cada uno).
- Almacenamiento: entre 5,39 GB y 5,92 GB por fichero; el repositorio completo ocupa 33,3 GB.
- GPU: no aplica; la inferencia se ejecuta en la NPU Hexagon, no en GPU ni CPU (salvo el drafter, que corre en CPU).
- No cabe en GPU de consumo: el formato `.litertlm` está compilado para la NPU Qualcomm y no es portable a CUDA ni a Metal.
- Despliegue: LiteRT-LM CLI con la librería de despacho de `runtime/` (obligatoria; la versión estándar falla con `Failed to create QNN context: 1002`), o la app AutoDroid Studio de Google Play, que sirve el modelo mediante un endpoint estilo OpenAI.
- Dispositivos de referencia medidos: Samsung Galaxy S22 Ultra (SM-S908E) y Galaxy S21 Ultra (SM-G998U1) para el fichero de SM8350.
- Latencia y throughput: ver tabla de benchmarks; el prefill varía de ~105 a ~390 tok/s según fichero y chip.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E4B-it text SM8450 LiteRT-LM NPU (este) | no disponible | 4K / 16K / 32K | `.litertlm`, NPU Hexagon SM8450 y SM8350 | apache-2.0 (enlace a licencia Gemma 4) | Hugging Face, 424 descargas |
| `litert-community/gemma-4-E4B-it-litert-lm` | no disponible | no disponible | `.litertlm`, GPU | no disponible | Hugging Face (bundle oficial de referencia) |
| `google/gemma-4-E4B-it` | no disponible | no disponible | safetensors (modelo base) | licencia Gemma 4 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: la etiqueta de idioma del modelo es `en`; no se declara soporte multilingüe.
- Multimodalidad restringida: solo el fichero `-multimodal` procesa imagen y audio; el resto son exclusivamente de texto. Las velocidades del fichero multimodal no se midieron por separado.
- Dependencia de hardware muy concreta: compilado para Hexagon v69 (SM8450) y, en un fichero aparte, para SM8350; no es portable a otras NPU, GPU o CPU.
- Requiere la librería de despacho modificada de `runtime/`; con LiteRT estándar la carga falla. El bundle de 32K necesita además la versión de la librería del 10 de octubre de 2026.
- Ventana de contexto mayor implica menor velocidad en cualquier longitud de conversación: 9–11 tok/s a 4K frente a 5,5 tok/s a 32K sin drafter.
- La ganancia de la decodificación especulativa depende de la previsibilidad del texto: solo alrededor de un tercio de los tokens borrador se aceptan en prosa.
- Licencia: se declara apache-2.0, pero el enlace apunta a los términos de Gemma 4 de Google; conviene revisar las restricciones de uso comercial de esa licencia antes de desplegar en producción.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinación en la información disponible.
- El modelo base es de Google; este repositorio es una compilación de terceros, sin garantías de soporte ni mantenimiento por parte de Google.
- Sin resultados publicados de benchmarks de calidad, la idoneidad para tareas concretas debe validarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/assassinshadow/Gemma-4-E4B-it-text-SM8450-LiteRT-LM-NPU
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Bundle oficial LiteRT-LM de referencia: https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- App AutoDroid Studio (Google Play): https://play.google.com/store/apps/details?id=com.assassinshadow.aiserver
