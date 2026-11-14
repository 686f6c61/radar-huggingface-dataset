# JonesLin/misotts-8b-int4-int8w

## Resumen

MisoTTS 8B int4 + int8 es una versión cuantizada del modelo de síntesis de voz MisoTTS de Miso Labs (Kamino Learning, Inc.), preparada por el usuario JonesLin para el runtime `fast-misotts`. El checkpoint reduce los dos stacks transformer del modelo original a pesos de baja precisión: el backbone en 4 bits con AWQ y el decodificador de profundidad en 8 bits por fila, manteniendo embeddings, normas, cabezas y la proyección entre stacks en BF16. El resultado ocupa 5,8 GB frente a los 16,4 GB en BF16 y los 33 GB en FP32 del original.

El modelo base sigue la arquitectura CSM de Sesame y genera audio a 24 kHz a partir de texto, usando el tokenizador de Llama 3.2 y el códec Mimi de Kyutai. Esta versión cuantizada está pensada para inferencia rápida y streaming: según la model card, alcanza 5,8 veces la velocidad del `Generator` original en una L40S y 10 veces en una H200, con una degradación de distribución (KL frente a BF16) de 0,036 en el codebook 0 y 0,025 en los codebooks 1-31.

Es relevante para quienes necesitan desplegar TTS de alta calidad en hardware modesto o con requisitos de latencia estrictos, ya que permite streaming con primeros 80 ms de audio en 0,08 s en L40S, algo que el modelo original no ofrece (espera a tener la utterance completa).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos stacks (backbone + decodificador de profundidad), basada en CSM de Sesame |
| Parametros totales | 4.807.666.688 (~4,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (grupos de 128 con AWQ) en backbone; int8 (escala por fila) en decodificador; BF16 en embeddings, normas, cabezas y proyeccion entre stacks |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (MIT modificada de Miso Labs) |
| Formato de pesos | safetensors (codigos int4/int8 con escalas y zeros; resto BF16) |

## Arquitectura y entrenamiento

El modelo base MisoTTS sigue la arquitectura CSM (Conversational Speech Model) de Sesame, con dos stacks transformer: un backbone que modela los tokens de audio de nivel semántico y un decodificador de profundidad que genera los codebooks restantes del códec Mimi de Kyutai. La síntesis se produce a 24 kHz y el texto de entrada se tokeniza con el tokenizador de Llama 3.2 (procedente de `meta-llama/Llama-3.2-1B`, que requiere aceptar su licencia).

Esta versión cuantizada se construyó a partir de la revisión `ef6b096` de `MisoLabs/MisoTTS` (pesos FP32 redondeados a BF16) con las herramientas de `fast-misotts`. El proceso aplica AWQ (activation-aware weight quantization, receta de AutoAWQ para capas Llama) sobre el backbone: escalas por canal de entrada plegadas en las normas y Linears previas, y recorte de cada grupo de 128 pesos, ambos buscados sobre las entradas reales del modelo con 128 frases de calibración (`fast_misotts/calibration_texts.json`). Después, las Linears del backbone se redondean a 4 bits en grupos de 128 (con escala y punto cero para el kernel tinygemm de PyTorch) y las del decodificador de profundidad a 8 bits por fila. Las matrices q, k, v y w1, w3 se almacenan fusionadas. El archivo guarda los códigos cuantizados (`*.int4`, `*.scales_and_zeros`, `*.int8`, `*.scale`) y el resto de tensores con los nombres originales; `fast-misotts` empaqueta los códigos de 4 bits para la GPU durante la carga.

## Capacidades

- Síntesis de voz (text-to-speech) a 24 kHz a partir de texto, con selección de hablante mediante el parámetro `speaker`.
- Generación por streaming: produce fragmentos de 80 ms (2 frames por chunk) mientras se sintetiza, con primer audio a los 0,08 s en L40S.
- Carga directa de pesos cuantizados sin materializar nunca los pesos BF16 (5,5 GiB de VRAM una vez cargado, en 3 s).
- Compatibilidad con `compile="autotune"` de `fast-misotts` para optimización automática del grafo.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es un modelo exclusivamente TTS.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- **Atención al cliente con voz sintética en tiempo real**: el modo streaming con chunks de 80 ms permite empezar a reproducir audio casi inmediatamente, lo que encaja en agentes telefónicos o chats de voz donde la latencia percibida es crítica.
- **Lectura de artículos y accesibilidad**: generación de audio a 24 kHz para convertir texto en voz en aplicaciones de lectura, con calidad verificada por Whisper large-v3 sin diferencias apreciables frente a BF16.
- **Locución para vídeo y pódcast**: síntesis por utterance completa con selección de hablante, adecuada para producir pistas de voz en pipelines de postproducción.
- **Sistemas embebidos o de borde con GPU modesta**: los 5,8 GB del checkpoint y los 5,5 GiB de VRAM permiten desplegarlo en GPUs de consumo con suficiente memoria, algo inviable con los 33 GB en FP32 del original.
- **Generación de audiolibros y contenido largo por lotes**: el throughput de 5,8x a 10x frente al original reduce el coste por hora de audio en granjas de GPUs L40S o H200.
- **Pruebas A/B de voces y demos interactivas**: la carga en 3 s y el bajo uso de memoria facilitan levantar y bajar instancias de inferencia en entornos de experimentación.
- **Integración en asistentes conversacionales basados en CSM**: al mantener la arquitectura y el códec Mimi, puede sustituir al modelo BF16 en stacks que ya usan `fast-misotts` sin cambios de API.

## Benchmarks y rendimiento

Datos de la model card. KL se mide en nats, teacher-forced sobre los códigos muestreados por BF16 en 64 frases de benchmark de `fast-misotts`. Velocidad como múltiplo del `Generator` original (0,50x tiempo real en L40S, 0,435x en H200), una utterance a la vez con `compile="autotune"` e incluyendo la decodificación de Mimi.

| Modelo | KL codebook 0 / 1-31 | L40S | H200 |
|---|---:|---:|---:|
| `Generator` original (BF16) | — | 1x | 1x |
| MisoTTS BF16 con fast-misotts | 0 / 0 | 2,7x | 9,6x |
| Este checkpoint con fast-misotts | 0,036 / 0,025 | 5,8x | 10x |
| MisoTTS int8 (pesos y entradas) | 0,013 / 0,027 | 3,2x | no disponible |
| MisoTTS int4 redondeo al más cercano | 0,044 / 0,491 | 7,3x | no disponible |

Notas de la model card: en H200, con una utterance a la vez, el cuello de botella son los kernels más que la memoria, por lo que la ganancia sobre BF16 es solo del 4 %. En streaming con chunks de 2 frames, el primer audio aparece a los 0,08 s en L40S, frente a los ~7 s que tarda el original en una frase de 3,5 s. Whisper large-v3 no detecta diferencias: sobre 192 utterances (64 frases, tres semillas) su word error rate difiere del de BF16 en una magnitud similar a la del original.

## Requisitos de hardware

- **VRAM estimada**: 5,5 GiB una vez cargado (dato de la model card); el repositorio ocupa 5,8 GB en disco.
- **GPU recomendadas**: L40S y H200 son las medidas en la model card; cualquier GPU con al menos ~6 GB de VRAM libre debería poder alojar el checkpoint, aunque no se publican medidas en otras tarjetas.
- **GPU de consumo**: por tamaño, cabe en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti/4060 Ti de 8 GB o superiores); no hay cifras de rendimiento publicadas para estas GPUs.
- **Despliegue**: exclusivamente mediante `fast-misotts` (`pip install git+https://github.com/JonnesLin/fast-misotts`), con soporte de `compile="autotune"` y streaming por chunks. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: 5,8x el `Generator` original en L40S y 10x en H200; primer audio en 0,08 s con streaming de 2 frames en L40S; carga en 3 s.
- **Dependencias**: tokenizador de Llama 3.2 (modelo con gated access, requiere login o pasar una carpeta con `tokenizer.json`) y códec Mimi de Kyutai, que descarga `moshi`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este checkpoint (MisoTTS 8B int4+int8) | ~4,8 B | no disponible | modified-mit | safetensors cuantizado | 5,8 GB, streaming, 5,8x/10x sobre el original |
| MisoLabs/MisoTTS (BF16) | ~4,8 B (16,4 GB) | no disponible | modified-mit | safetensors BF16 | Referencia de calidad; sin streaming nativo, ~7 s para una frase de 3,5 s |
| MisoTTS int8 (pesos y entradas) | ~4,8 B | no disponible | modified-mit | no disponible | KL 0,013/0,027, 3,2x en L40S |
| MisoTTS int4 redondeo al más cercano | ~4,8 B | no disponible | modified-mit | no disponible | KL 0,044/0,491, 7,3x en L40S; peor degradación en el decodificador |

No se dispone de datos de otros modelos TTS comparables (por ejemplo, de otras familias) en la información proporcionada.

## Limitaciones y advertencias

- **Licencia**: los pesos son de Miso Labs bajo Modified MIT: se exige mostrar "Miso Labs" en la interfaz de cualquier producto o servicio comercial con más de 50 millones de usuarios activos mensuales o más de 10 millones de dólares de ingresos mensuales. El tokenizador de Llama 3.2 está bajo la Llama 3.2 Community License y el acceso al modelo de Meta es gated.
- **Degradación por cuantización**: la KL frente a BF16 es de 0,036 en el codebook 0 y 0,025 en los codebooks 1-31; es una degradación pequeña pero no nula, superior a la de la variante int8 en el backbone.
- **Dependencia de runtime**: solo funciona con `fast-misotts`; no hay pesos en GGUF ni soporte documentado en otros motores de inferencia.
- **Dependencias externas**: requiere el tokenizador de Llama 3.2 (con login) y el códec Mimi de Kyutai, lo que añade pasos de configuración y posibles fallos en entornos sin acceso a los repositorios de Meta y Kyutai.
- **Idiomas**: no se especifican los idiomas soportados; no debe asumirse multilingüismo sin verificación.
- **Hablantes**: la selección de voz se hace con el parámetro `speaker`; no se documenta el número ni la identidad de las voces disponibles.
- **Rendimiento en H200**: con una utterance a la vez la ganancia sobre BF16 es solo del 4 %, por lo que el beneficio de esta cuantización se concentra en GPUs menos potentes o en escenarios de streaming.
- **Riesgo de alucinación y sesgos**: no hay información publicada sobre sesgos, artefactos vocales o alucinaciones en la síntesis para este checkpoint concreto.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JonesLin/misotts-8b-int4-int8w
- Modelo base: https://huggingface.co/MisoLabs/MisoTTS
- Runtime fast-misotts: https://github.com/JonnesLin/fast-misotts
- Tokenizador Llama 3.2 (gated): https://huggingface.co/meta-llama/Llama-3.2-1B
- Códec Mimi de Kyutai (descargado vía moshi): https://github.com/kyutai-labs/moshi
