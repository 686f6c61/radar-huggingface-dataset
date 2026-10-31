# nanoshino/FireRedVAD-GGUF

## Resumen

FireRedVAD (GGUF) es una conversión al formato GGUF del modelo de detección de actividad de voz (VAD) FireRedVAD, desarrollado originalmente por FireRedTeam de Xiaohongshu (el modelo base) y convertido por el usuario nanoshino. Un modelo VAD es un clasificador ligero que analiza audio por frames y devuelve la probabilidad de que haya voz humana en cada instante; es un componente crítico en pipelines de voz, ya que determina cuándo activar el reconocimiento de habla (ASR), cuándo cortar turnos en conversación o cuándo descartar silencios antes de procesar audio.

El modelo base FireRedVAD se publica bajo licencia Apache-2.0 y se acompaña de un paper en arXiv (2603.10420). La conversión GGUF conserva los pesos originales en float32 sin alteración (bit-exact respecto al checkpoint `model.pth.tar`), lo que garantiza resultados idénticos a la versión de referencia pero con la portabilidad del ecosistema ggml. El modelo opera sobre características fbank de 80 bandas a 16 kHz y produce una probabilidad de voz por cada frame de 10 ms.

Se ofrecen dos variantes: una con contexto bidireccional de 20 frames hacia atrás y 20 hacia adelante (200 ms de look-ahead), adecuada para procesamiento por chunks con ligera latencia, y una variante de streaming puramente causal (20 frames de contexto pasado, sin look-ahead), pensada para inferencia en tiempo real con latencia mínima. Con apenas 568.097 parámetros, es un modelo extremadamente pequeño, ejecutable incluso en CPU o microcontroladores potentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal para VAD sobre fbank; detalle en el paper) |
| Parametros totales | 568.097 (~0,57 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 20 frames hacia atrás y 20 hacia adelante (200 ms de look-ahead) en la variante estándar; 20 frames causales en la variante streaming |
| Tipos de cuantizacion | float32 sin cuantizar (pesos bit-exactos respecto al checkpoint original) |
| Idiomas soportados | no disponible (VAD: agnostico al idioma en principio) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (conversion desde checkpoint .pth.tar de PyTorch) |

## Arquitectura y entrenamiento

FireRedVAD es un modelo de detección de actividad de voz cuyo pipeline de entrada consiste en características Kaldi fbank de 80 bandas, calculadas con ventana de 25 ms y desplazamiento de 10 ms sobre audio a 16 kHz, seguidas de normalización CMVN (media y varianza almacenadas en los ficheros `cmvn.mean` y `cmvn.istd`, 80 valores cada uno, provenientes del `cmvn.ark` original de Kaldi). La salida es una probabilidad de voz por cada frame de 10 ms, lo que permite una granularidad temporal muy fina para segmentación y corte de turnos.

Los hiperparámetros de la red se almacenan en los metadatos del GGUF como `firered-vad.{idim,R,M,H,P,N1,S1,N2,S2,odim}`, aunque su significado concreto (dimensiones de entrada, capas, ocultos, etc.) no se detalla en la model card y remite al paper de arXiv. No hay información disponible sobre el dataset de entrenamiento, el número de horas de audio, ni sobre técnicas como RLHF o DPO (habitualmente irrelevantes para un modelo discriminativo de audio como este). La conversión a GGUF se realizó con un script Python de biblioteca estándar que lee el checkpoint mediante un unpickler restringido (sin ejecución de código arbitrario), un detalle relevante de seguridad en conversiones de pesos.

## Capacidades

- Deteccion de actividad de voz frame a frame: devuelve una probabilidad de voz por cada 10 ms de audio de entrada.
- Dos modos de operacion: procesamiento con look-ahead (200 ms de contexto futuro, mayor precision en los bordes de los segmentos) y streaming causal puro (sin latencia de look-ahead, apto para tiempo real).
- Entrada estandarizada: acepta fbank de 80 bandas a 16 kHz con CMVN, formato compatible con herramientas del ecosistema Kaldi.
- Integracion con el ecosistema ggml/llama.cpp: los pesos en GGUF permiten cargar el modelo con las librerias ggml, facilitando su uso en C/C++ sin dependencias de Python o PyTorch.
- Tamaño minimo: con ~0,57 M de parámetros, es apto para ejecución en CPU, dispositivos edge y pipelines de baja latencia.
- No es un modelo generativo: no produce texto, no soporta tool calling, no tiene capacidades de razonamiento, vision ni agentes.

## Casos de uso

- Segmentacion previa a ASR: se usa FireRedVAD para detectar los limites exactos de los segmentos de voz en un audio largo antes de pasarlo a un modelo de reconocimiento de habla, eliminando silencios y reduciendo el coste de inferencia del ASR.
- corte de turnos en asistentes de voz conversacionales: la variante con 200 ms de look-ahead permite detectar con precision el final de una intervencion del usuario, decidir cuándo el asistente debe empezar a responder y evitar cortes prematuros.
- Streaming en tiempo real: la variante causal (sin look-ahead) es adecuada para pipelines de voz en directo, como transcripcion simultanea o moderacion de audio en directo, donde cada frame debe procesarse sin esperar audio futuro.
- Filtrado de audio en grabaciones: identificacion automatica de tramos con voz en podcasts, reuniones o llamadas para indexacion, busqueda o eliminacion de silencios en postproduccion.
- Despliegue en dispositivos edge: dado su tamaño (0,57 M de parámetros en float32, unos pocos MB), puede integrarse en aplicaciones móviles, Raspberry Pi o sistemas embebidos que necesiten detección de voz sin conexión a la nube.
- Wake-word y activacion por voz: como primer filtro de un pipeline de voz, el VAD puede activar o desactivar el procesamiento posterior (detección de palabra clave, ASR) solo cuando hay voz, ahorrando batería y computo.
- Analisis de llamadas: deteccion de turnos de habla (diarizacion ligera por energía de voz) en sistemas de analítica de call centers, marcando quién habla y cuándo antes de aplicar ASR por canal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1 ni comparativas con otros VAD (como Silero VAD o WebRTC VAD); para evaluar el rendimiento del modelo base puede consultarse el paper en arXiv (2603.10420).

## Requisitos de hardware

- VRAM/RAM estimada: con 568.097 parámetros en float32 (4 bytes por peso), el modelo ocupa aproximadamente 2,3 MB de memoria, mas los buffers de entrada y los 160 valores de CMVN. Ejecutable en cualquier CPU moderna sin GPU.
- GPU recomendadas: no es necesario uso de GPU; si se integra en un pipeline mayor en GPU, el consumo adicional del VAD es despreciable.
- Consumer GPU: no requiere GPU dedicada; cabe sobradamente en cualquier hardware, incluidos portátiles sin GPU discreta.
- Despliegue: mediante librerias ggml (el formato GGUF esta asociado al ecosistema llama.cpp/ggml; la compatibilidad exacta con llama.cpp como VAD no esta documentada en la model card). El modelo base original puede ejecutarse con PyTorch. No hay informacion sobre soporte en vLLM, TGI u Ollama para este modelo.
- Latencia: la variante streaming causal procesa frame a frame (10 ms) sin look-ahead, apta para tiempo real; la variante estandar introduce 200 ms de latencia adicional por el look-ahead. No hay cifras de throughput publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto/latencia | Licencia | Notas |
|---|---|---|---|---|---|
| FireRedVAD (GGUF) | 0,57 M | GGUF (float32) | 200 ms look-ahead o causal | Apache-2.0 | fbank 80 bins, 16 kHz; dos variantes (estandar y streaming) |
| Silero VAD | ~1-2 M (no disponible con precision) | PyTorch/JIT/ONNX | streaming, ~30-96 ms de chunk | MIT | Muy extendido, multi-idioma, ecosistema maduro |
| WebRTC VAD | no disponible (implementacion clasica, no red neuronal profunda) | C++ nativo | frames de 10/20/30 ms | BSD | Basado en GMM, muy ligero, menos preciso que alternativas neuronales |
| pyannote segmentation (VAD) | no disponible | PyTorch | ventanas de segundos | MIT (modelo con aceptacion de condiciones) | Orientado a diarizacion completa, mucho mas pesado |

Comparativa orientativa; los datos de los modelos alternativos son de conocimiento general y pueden no reflejar las versiones actuales.

## Limitaciones y advertencias

- No es un modelo generativo: no debe esperarse texto, traducción ni comprensión semántica; únicamente produce probabilidades de voz por frame.
- Requiere preprocesamiento específico: la entrada debe ser fbank de 80 bandas a 16 kHz con CMVN (los ficheros `cmvn.mean` y `cmvn.istd` del repo); usar otro tipo de características degradará o invalidará los resultados.
- La variante estándar introduce 200 ms de latencia por el look-ahead; para casos estrictamente en tiempo real debe usarse la variante causal, presumiblemente con algo menos de precisión en los bordes de segmento.
- No hay benchmarks publicados en la model card: conviene validar la precisión sobre el dominio de audio concreto de la aplicación (ruido de fondo, música, múltiples hablantes) antes de producción.
- Compatibilidad del formato GGUF: la conversión es de terceros (nanoshino) y no oficial del equipo FireRed; el soporte en herramientas concretas (llama.cpp, etc.) debe verificarse.
- Riesgos de sesgo: como todo VAD, puede verse afectado por acentos, registro vocal, ruido de fondo o música; no hay información sobre la composición del dataset de entrenamiento para evaluar estos sesgos.
- Licencia: Apache-2.0 permite uso comercial sin restricciones relevantes; se recomienda citar y acreditar a los autores originales (FireRedTeam, Xiaohongshu) según indica la model card.

## Enlaces

- Modelo GGUF convertido: https://huggingface.co/nanoshino/FireRedVAD-GGUF
- Modelo base (FireRedTeam/FireRedVAD): https://huggingface.co/FireRedTeam/FireRedVAD
- Paper de FireRedVAD: https://arxiv.org/abs/2603.10420
