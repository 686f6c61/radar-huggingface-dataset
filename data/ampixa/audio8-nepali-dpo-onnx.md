# ampixa/audio8-nepali-dpo-onnx

## Resumen

`ampixa/audio8-nepali-dpo-onnx` es un modelo de síntesis de voz (text-to-speech) en nepalí con clonación de voz zero-shot, empaquetado en formato ONNX INT8 para ejecución en CPU sin dependencia de PyTorch. Lo publica Ampixa Labs como adaptación del modelo base `Audio8/Audio8-TTS-Preview-0.1b` de Audio8, sobre el que se ha realizado un ajuste fino completo con 893,8 horas de audio conversacional en nepalí y dos rondas de optimización por preferencias (DPO) orientadas a reducir el error de reconocimiento (CER) y mejorar la similitud de voz.

El modelo es el checkpoint que la aplicación de escritorio Astadhwani descarga en su primer arranque, lo que da una idea de su orientación práctica: inferencia local en CPU, sin GPU, con pesos cuantizados a INT8. La arquitectura sigue el diseño del release oficial de Audio8 (0.1B parámetros) con un autoregresivo lento basado en Falcon-H1 híbrido (atención + Mamba) y un autoregresivo rápido para los códecs 1–9, más un decodificador de códec neuronal en FP16.

Su relevancia actual radica en dos factores: es uno de los pocos TTS en nepalí con clonación de voz publicados abiertamente, y demuestra una técnica de cuantización reproducible (sustitución de los 901 inicializadores del grafo oficial, verificada bit a bit) que permite reutilizar grafos ONNX oficiales sin exporter propio. La licencia es restrictiva (Audio8 Community License v1.0), con uso comercial limitado a entidades con ingresos anuales inferiores a 2 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoregresiva en dos etapas: slow AR (Falcon-H1 híbrido, atención + Mamba) + fast AR (códecs 1–9) + decodificador de códec neuronal |
| Parametros totales | 0,1B (100 millones, según el modelo base Audio8-TTS-Preview-0.1b) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (lineales simétricas por canal de salida; embeddings uint8 por tensor), FP16 (decodificador de códec), FP32 (checkpoint fuente no publicado) |
| Idiomas soportados | Nepalí (ne) |
| Licencia | Audio8 Community License v1.0 |
| Formato de pesos | ONNX (`.onnx` + `.data`), tokenizer JSON, manifiesto de runtime |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura TTS autoregresiva de dos niveles. El módulo *slow AR* es un híbrido Falcon-H1 que combina atención con capas Mamba; el módulo *fast AR* genera los códecs 1–9, y un decodificador de códec neuronal en FP16 reconstruye la forma de onda. Los grafos ONNX siguen la interfaz del release oficial INT8 de Audio8 (`Edge0/audio8-TTS-0.1B-ONNX-INT8`), y el codificador de códec es byte-idéntico al del modelo base. La cuantización se realizó sustituyendo los 901 inicializadores del grafo oficial: pesos lineales en int8 simétrico por canal, embeddings en uint8 por tensor, y normas, sesgos de convolución y constantes Mamba plegadas sin cuantizar. El procedimiento se validó reproduciendo bit a bit los 901 inicializadores del release oficial.

El entrenamiento se organizó en tres fases. La *wave 1* consistió en un ajuste fino completo sobre 318,8 horas de nepalí conversacional de YouTube con 1.327 hablantes. Las *waves 2–3* continuaron el entrenamiento con 575 horas adicionales, excluyendo frases y voces de benchmark mediante cribados exactos, por subcadena y difusos. Las rondas DPO 1–2 aplicaron optimización offline de preferencias con recompensas basadas en CER de un Conformer nepalí y similitud de voz ECAPA; las voces de prompt provinieron de FLEURS-train, IndicVoices-R y Rasa (todas CC BY 4.0) y del mismo material de YouTube. El checkpoint final es un fp32 con sha256 `a555f6c0...` cuyos pesos no se publican; solo se distribuyen los grafos ONNX INT8.

## Capacidades

- Síntesis de voz en nepalí a partir de texto, con salida de audio natural.
- Clonación de voz zero-shot: basta una referencia de audio para imitar el timbre y el estilo del hablante.
- Inferencia en CPU sin PyTorch, gracias al runtime ONNX INT8.
- Control de prosodia mediante parámetros de muestreo (temperatura, top-p, top-k) y recorte de silencios en la referencia.
- Segmentación automática de texto en fragmentos de hasta 110 caracteres por `।?!` para entradas largas.
- Reintento de tomas degeneradas (sin EOS, longitud implausible o silencio) hasta 3 veces.
- Integración opcional con el frontend `Swar` (MIT) para normalizar números y palabras en inglés a Devanagari.
- No soporta tool calling, agentes, visión, audio de entrada (salvo referencia de voz) ni razonamiento multi-paso.

## Casos de uso

- **Aplicaciones de escritorio de accesibilidad:** integración en lectores de pantalla o asistentes locales para usuarios nepalíes, ejecutando el modelo en CPU sin GPU dedicada, como hace Astadhwani en su primer arranque.
- **Clonación de voz para doblaje de bajo coste:** a partir de una muestra de referencia de un actor con consentimiento, generar locuciones en nepalí para vídeos o audiolibros, con control de temperatura (1.1) y top-p (0.95) para mantener naturalidad.
- **Atención al cliente automatizada en nepalí:** síntesis de respuestas en un IVR o chatbot con voz de marca consistente, usando una referencia fija y el frontend Swar para normalizar cifras y términos en inglés.
- **Generación de material educativo:** conversión de textos curriculares en nepalí a audio para estudiantes con discapacidad visual, dividiendo el texto en fragmentos de 110 caracteres para evitar degradación en secuencias largas.
- **Prototipado de asistentes por voz sin GPU:** despliegue en servidores CPU o dispositivos edge usando el runtime ONNX oficial, con cuantización INT8 que reduce el tamaño del repo a 0,9 GB.
- **Investigación en TTS de bajos recursos:** punto de partida para experimentos de ajuste fino o DPO en otras lenguas de bajos recursos, reutilizando la receta de cuantización verificada bit a bit.
- **Locución publicitaria de bajo volumen:** generación de cuñas en nepalí para pequeñas empresas (si cumplen el umbral de ingresos de la licencia), con la advertencia de divulgación de voz sintética.

## Benchmarks y rendimiento

Paridad teacher-forced frente a PyTorch fp32 (3 frases nepalíes × 50–60 pasos, mismo prompt y códigos de referencia):

| Métrica | Base oficial: PyTorch vs INT8 oficial | Este checkpoint: PyTorch vs estos grafos INT8 |
|---|---|---|
| Correlación de logits semánticos | 0,9970 | 0,9975 |
| Acuerdo top-1 greedy semántico | 85,0 % | 91,1 % |
| Correlación de logits acústicos | 0,9975 | 0,9998 |
| Acuerdo top-1 greedy acústico | 75,7 % | 74,7 % |

Evaluación en desarrollo (FLEURS-dev v2, frases largas, 208 ítems × 2 tomas, frente al punto de partida de la wave 3, con checkpoint fp32 y la receta recomendada):

| Métrica | Wave 3 (inicio) | Checkpoint final |
|---|---|---|
| CER Conformer | 15,22 | 8,73 |
| Similitud de voz ECAPA | 0,512 | 0,552 |

No se han publicado resultados en benchmarks públicos (NepTTS-Bench, Nepali Voice Cloning Benchmark) en la información disponible; el autor indica que se añadirán al finalizar una comparativa interna. Son puntuaciones automáticas sin test de escucha.

## Requisitos de hardware

- **VRAM:** no requiere GPU; el modelo está diseñado para CPU. El repo ocupa 0,9 GB, por lo que la RAM necesaria para cargar los grafos INT8 ronda ese orden de magnitud (no se especifica cifra exacta).
- **GPU recomendadas:** no aplica; el runtime es ONNX Runtime en CPU. Cualquier GPU compatible con ONNX Runtime podría usarse, pero no es el objetivo del empaquetado.
- **Consumer GPU:** irrelevante para el caso de uso previsto; cabe en CPU de portátil y en dispositivos edge.
- **Despliegue:** ONNX Runtime con el runtime oficial de 0.1B INT8 (`Audio8_TTS/onnx_runtime_0_1b_int8`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- **Latencia y throughput:** no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Clonación de voz |
|---|---|---|---|---|---|---|
| ampixa/audio8-nepali-dpo-onnx | 0,1B | No disponible | Nepalí | Audio8 Community License v1.0 (comercial < 2 M USD) | ONNX INT8/FP16 | Sí (zero-shot) |
| Edge0/audio8-TTS-0.1B-ONNX-INT8 (base oficial) | 0,1B | No disponible | No disponible | Audio8 Community License v1.0 | ONNX INT8 | No disponible |
| Audio8/Audio8-TTS-Preview-0.1b (base) | 0,1B | No disponible | No disponible | Audio8 Community License v1.0 | No disponible (fp32 no publicado) | No disponible |

No se dispone de datos de benchmarks públicos comparativos con otros TTS en nepalí en la información proporcionada.

## Limitaciones y advertencias

- **Consentimiento:** los hablantes de los datos de entrenamiento no dieron consentimiento individual para la clonación de voz. No debe usarse para imitar a personas reales sin su consentimiento.
- **Licencia:** Audio8 Community License v1.0 permite uso no comercial y uso comercial solo para entidades con ingresos anuales inferiores a 2 millones de dólares; la redistribución exige mantener la licencia y acreditar a Audio8.
- **Idioma:** solo nepalí; no hay soporte multilingüe.
- **Alucinación y degeneración:** pueden generarse tomas sin EOS, de longitud implausible o casi silenciosas; el autor recomienda remuestrear hasta 3 veces y limitar la longitud a 2,5× la esperada según la velocidad de la referencia.
- **Longitud de entrada:** el texto debe dividirse en fragmentos de hasta 110 caracteres por `।?!`; no se especifica la ventana de contexto máxima del modelo.
- **Benchmarks públicos pendientes:** las cifras de NepTTS-Bench y Nepali Voice Cloning Benchmark aún no están publicadas; la evaluación disponible es automática y sin test de escucha.
- **Sesgos:** no se documentan análisis de sesgo; el corpus de YouTube puede introducir sesgos de hablantes, registro y dialectos.
- **Producción:** requiere gestión de referencias de voz limpias (recorte de silencios) y control de muestreo; no incluye mecanismos de detección de contenido sintético.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ampixa/audio8-nepali-dpo-onnx
- Modelo base: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b
- Release ONNX INT8 oficial: https://huggingface.co/Edge0/audio8-TTS-0.1B-ONNX-INT8
- Runtime ONNX 0.1B INT8: https://github.com/Audio8-AI/Audio8_TTS/tree/master/onnx_runtime_0_1b_int8
- Aplicación Astadhwani: https://github.com/Ampixa/astadhwani
- Frontend Swar (MIT): https://github.com/Naamche-Labs/swar
