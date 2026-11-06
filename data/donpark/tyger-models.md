# donpark/tyger-models

## Resumen

TYGER (Tyger Models) es un conjunto de exportaciones on-device de un modelo de decisión de habla diseñado para agentes de voz full-duplex. Lo desarrolla donpark y se distribuye como repositorio de pesos y un manifiesto de descarga, sin código de inferencia. El modelo resuelve el problema de la toma de turno (turn-taking): decidir cuándo el usuario ha terminado de hablar, cuándo interrumpe (barge-in), cuándo encaja una señal de retroalimentación (backchannel) y cuándo el agente debe ceder o mantener la palabra. Es relevante porque empaqueta la cadena TYGER en formatos que iOS y macOS cargan directamente (Core AI, Core ML, MLX), lo que permite ejecutar la lógica de turnos en el dispositivo sin depender de la nube.

La cadena TYGER combina un encoder Nemotron de 638M parámetros con cabezas GRU de 14M parámetros. El repositorio incluye además un manifiesto con hashes SHA-256 por fichero para verificar la integridad de cada descarga. El modelo base declarado es nvidia/nemotron-3.5-asr-streaming-0.6b y FluidInference/parakeet-redux-coreml.

El repositorio ocupa 10,1 GB e incluye varias "tiers" de entrega intercambiables (fp32, fp16, int8), además de una variante estudiante (TYGER-Step-Student) que fue retirada de la distribución el 2026-10-25 por bajo rendimiento. El modelo está pensado exclusivamente para inglés y para control de turnos, no para transcripción ni para decisiones críticas de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Nemotron (transformer) + cabezas GRU causales (3 capas, ancho 768) para el modelo de turnos |
| Parametros totales | 638M (encoder Nemotron) + 14M (cabezas GRU) en la cadena TYGER; 14M en TYGER-Step-Student |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de 15 s alineada a la derecha con relleno de ceros (mel_length 1501) para el tap de Parakeet; no disponible para la cadena TYGER completa |
| Tipos de cuantizacion | fp32 (Core AI por defecto), fp16 (Core AI opcional y encoder Core ML), int8-g16 (MLX, aunque el artefacto almacena pesos fp32 dequantizados) |
| Idiomas soportados | inglés (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | Core AI `.aimodel` (fp32 y contenedores AOT A18 `.h17p`), Core ML `.mlpackage`, MLX `.safetensors` (int8-g16), manifiesto `manifest.json` con sha256 por fichero |

## Arquitectura y entrenamiento

La cadena TYGER se compone de un encoder Nemotron de 638M parámetros que extrae características de la señal de audio y unas cabezas GRU de 14M parámetros (3 capas, ancho 768, más proyecciones de entrada y cinco cabezas de salida) que producen las decisiones de turno. Las cabezas emiten por frame logits de estado de turno (listen, hold, speak, backchannel) junto con puntuaciones de hazard, yield, backchannel y endpoint: 8 números por frame. Las reglas que convierten esas puntuaciones en eventos (frames de calentamiento, puerta de habla, fallback de silencio) viven en la aplicación y no forman parte del modelo.

La variante TYGER-Step-Student (14M parámetros) se destiló desde TYGER (la cadena Nemotron fp32 como profesor) sobre conversaciones en inglés de doble canal, usando los corpus dualturn-otospeech-turn-taking con round-trip de códec como en llamadas reales: 96 sesiones (~4,8 h de frames) para entrenamiento y 24 sesiones (~1,3 h) reservadas para evaluación. Los objetivos son los vectores de 8 dimensiones por frame del profesor, con ponderación 3× en frames de frontera (MSE, ponderación de grupo equitativa), 250 + 200 épocas con AdamW y decaimiento coseno, y una sola semilla de entrenamiento. El estudiante lee características del encoder de Parakeet Redux en lugar de las de la capa 15 de Nemotron, de modo que comparte la pasada del encoder con el ASR y reduce el coste de entrega a 56 MB de cabezas. Esta variante fue retirada de la distribución el 2026-10-25 por su bajo rendimiento (identidad de frame ~50% y cabeza de backchannel que nunca se activaba).

## Capacidades

- Decisión de toma de turno en tiempo real para agentes de voz full-duplex: detectar fin de turno del usuario, interrupción (barge-in), backchannel y cesión de palabra.
- Clasificación de audio por frame a 12,5 Hz (hop de 320 ms) en la variante estudiante.
- Soporte de streaming on-device en iOS y macOS mediante Core AI, Core ML y MLX.
- Ejecución de la cadena completa o de las cabezas de turno por separado según la tier.
- Verificación de integridad de descarga mediante manifiesto con sha256 por fichero.
- No incluye transcripción (requiere un ASR aparte), tool calling, function calling ni capacidades de agente multi-paso.
- Capacidades multilingües: no disponibles; solo inglés.

## Casos de uso

- Agentes de voz en apps iOS y macOS: el modelo decide cuándo el usuario ha terminado de hablar para que el agente responda en el momento adecuado, usando Core ML o Core AI para cargar los pesos directamente en el dispositivo.
- Detección de barge-in en asistentes conversacionales: la cabeza de yield permite que el agente ceda la palabra cuando el usuario interrumpe, evitando solapamientos incómodos en llamadas en tiempo real.
- Backchannel en agentes telefónicos: la cabeza de backchannel emite señales de retroalimentación ("ajá", "ya") cuando encajan, mejorando la naturalidad de la conversación.
- Integración con pipelines ASR existentes: la variante estudiante comparte la pasada del encoder de Parakeet Redux, de modo que un agente que ya transcribe con Parakeet añade solo 56 MB de cabezas para la lógica de turnos.
- Control de turnos en agentes de atención al cliente: el modelo mantiene la palabra o cede según las puntuaciones de endpoint, reduciendo respuestas prematuras en conversaciones multi-turno.
- Despliegue on-device sin nube: las tiers Core AI y Core ML permiten ejecutar la cadena completa en dispositivos Apple sin enviar audio a servidores externos, útil por privacidad y latencia.
- Prototipado con MLX en macOS pre-27: la tier MLX int8-g16 permite experimentar con la cadena en equipos Apple antes de adoptar los formatos nativos.

## Benchmarks y rendimiento

Resultados de evaluación de TYGER-Step-Student sobre 24 sesiones de validación y 156 fines de turno humanos, comparando con el profesor TYGER:

| Metrica | Profesor (TYGER) | Estudiante |
|---|---:|---:|
| Fines de turno reales detectados | 87% | 91% (142/156) |
| Endpoints falsos por minuto | 6,2 | 6,7 |
| Precisión / recall de backchannel | 20% / 48% | 22% / 44% |

Paridad de exportación a Core ML frente al framework de entrenamiento: max |Δ| 1e-5 sobre 400 frames con estado arrastrado. Identidad de frame con el profesor: ~48%.

No se han publicado resultados de benchmarks de la cadena TYGER completa (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está orientado a inferencia on-device en Apple Silicon, no a GPU discretas.
- Tamaño de artefactos por tier: Core AI fp32 1,53 GB, Core AI fp16 ~0,77 GB, Core ML ~0,86 GB, MLX int8-g16 1,58 GB, cabezas del estudiante 56 MB.
- GPU recomendadas: no disponible; el objetivo son dispositivos Apple (ANE/GPU/CPU). Para la variante estudiante, el contrato de tap indica ejecutar ambos encoders en CPU-only, ya que ANE/GPU se desvía de las características de entrenamiento y no es más rápido.
- Cabe en GPU consumer: no disponible; el despliegue previsto es Core AI, Core ML y MLX en hardware Apple.
- Opciones de despliegue: Core AI (`.aimodel`, contenedores AOT A18 `.h17p`), Core ML (`.mlpackage`), MLX (`.safetensors`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el hop del estudiante es de 320 ms por frame a 12,5 Hz y el estado GRU ocupa ~9 KiB por conversación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TYGER (este repo) | 638M + 14M | Ventana de 15 s (tap estudiante) | Turn-taking full-duplex | OpenMDW-1.1 | Core AI, Core ML, MLX |
| TYGER-Step-Student | 14M | Ventana de 15 s | Turn-taking (solo cabezas) | OpenMDW-1.1 | Retirado de distribución el 2026-10-25 |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 0,6B | no disponible | ASR streaming | no disponible | HuggingFace |
| FluidInference/parakeet-redux-coreml | no disponible | no disponible | ASR (encoder Core ML) | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no admite habla en otros idiomas.
- No sirve para transcripción; requiere un ASR junto al modelo.
- No apto para decisiones críticas de seguridad.
- La evaluación se hizo reproduciendo conversaciones grabadas a través del pipeline, no con un benchmark de agente de voz en vivo.
- Una sola semilla de entrenamiento, lo que limita la robustez estadística de los resultados.
- Identidad de frame con el profesor de ~48%: el estudiante aprende el comportamiento, no cada detalle.
- Recall de backchannel modesto tanto en profesor como en estudiante (48% y 44%).
- Las tasas de endpoints falsos dependen del corpus y de los umbrales; deben ajustarse en la aplicación.
- TYGER-Step-Student fue retirado de la distribución el 2026-10-25 por bajo rendimiento y ya no figura en `manifest.json`.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Restricciones de licencia: OpenMDW-1.1; los términos de la tarjeta original de NVIDIA Nemotron viajan con el repositorio en `upstream/`, por lo que conviene revisarlos antes de uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/donpark/tyger-models
- Modelo TYGER base: https://huggingface.co/nineninesix/tyger
- Modelo base ASR: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Modelo base encoder: https://huggingface.co/FluidInference/parakeet-redux-coreml
- Dataset de entrenamiento: https://huggingface.co/datasets/anyreach-ai/dualturn-otospeech-turn-taking
- Licencia: LICENSE.md (en el repositorio)
