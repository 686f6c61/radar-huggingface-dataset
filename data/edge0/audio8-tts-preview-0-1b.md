# Edge0/Audio8-TTS-Preview-0.1b

## Resumen
Audio8 TTS Preview 0.1B es un modelo de síntesis de voz (text-to-speech) con capacidad de clonación de voz zero-shot desarrollado por Edge0 (Audio8). Su propuesta diferencial es el tamaño: el modelo generativo principal ronda los 170 millones de parámetros, a los que se suma un decodificador de códec neuronal de aproximadamente 120 millones, lo que sitúa la pila completa muy por debajo de los sistemas TTS multilingües habituales, que suelen moverse entre 0,8B y 8,5B de parámetros.

El modelo emplea una arquitectura propietaria denominada Audio8 Falcon H1, con dos ramas autorregresivas: una rama lenta que predice tokens semánticos y una rama rápida que predice los codebooks del códec condicionada por el estado oculto de la rama lenta. El códec opera a 44,1 kHz con 2.048 muestras por frame (aproximadamente 21,5 frames por segundo) y 10 codebooks de 4.096 entradas cada uno.

Es relevante ahora porque demuestra que la clonación de voz zero-shot puede ejecutarse en hardware muy limitado: existe una variante ONNX INT8 que corre íntegramente en CPU con un consumo de memoria de aproximadamente 0,4 GiB tras la carga, sin dependencia de CUDA ni de PyTorch. El soporte lingüístico principal es chino e inglés, con evaluación experimental en alemán, español, francés, italiano, japonés y coreano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Audio8 Falcon H1 (dos ramas autorregresivas: slow AR + fast AR) con códec neuronal |
| Parámetros totales | 169.779.904 (modelo principal, sin decodificador de códec); decodificador de códec ~120M adicionales |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 2.048 posiciones empaquetadas de texto y audio |
| Tipos de cuantización | ONNX INT8 (slow AR y fast AR), FP16 (códec); bfloat16 y float32 en PyTorch |
| Idiomas soportados | chino, inglés (principales); alemán, español, francés, italiano, japonés, coreano (experimentales) |
| Licencia | audio8-community-license-v1.0 |
| Formato de pesos | safetensors (modelo principal), codec.pth (códec), ONNX INT8 (variante CPU) |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura Audio8 Falcon H1, un diseño autorregresivo de dos velocidades. La rama lenta (slow AR) consta de 24 capas con anchura 512, 8 cabezas de atención y 2 cabezas KV, y se encarga de predecir tokens semánticos. La rama rápida (fast AR) tiene 4 capas con la misma anchura y configuración de atención, y predice los 10 codebooks acústicos condicionada por el estado oculto de la rama lenta. Esta separación permite generar la estructura semántica a menor frecuencia y los detalles acústicos a mayor frecuencia, reduciendo el coste computacional.

El códec neuronal acompaña al modelo en el mismo repositorio (`codec.pth`) y trabaja a 44,1 kHz con 2.048 muestras por frame, lo que se traduce en unos 21,5 frames por segundo. El checkpoint publicado es un "v4 mixed checkpoint" que incluye el modelo generativo, el códec, el tokenizer, el processor y el código remoto de Hugging Face. No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades
- Síntesis de voz multilingüe a partir de texto en chino, inglés, alemán, español, francés, italiano, japonés y coreano.
- Clonación de voz zero-shot: basta con un audio de referencia y su transcripción para replicar el timbre y el estilo del hablante.
- Generación de audio a 44,1 kHz mediante códec neuronal de 10 codebooks.
- Inferencia en CPU mediante la variante ONNX INT8, con soporte de streaming PCM.
- Interfaz de línea de comandos, servicio web y servicio HTTP en el paquete ONNX Runtime.
- Registro de voces (voice registration) con gestión controlada de memoria: libera las sesiones de síntesis antes de cargar el codificador del códec.
- Integración con el ecosistema Transformers mediante `AutoModel` y `AutoProcessor` con `trust_remote_code=True`.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso, al tratarse de un modelo especializado en TTS.

## Casos de uso
- Clonación de voz para audiolibros y narración: el modelo permite generar horas de audio con una voz concreta a partir de una única muestra de referencia, y su reducido tamaño facilita el procesamiento por lotes en GPUs de gama media.
- Asistentes de voz en dispositivos embebidos: la variante ONNX INT8 funciona en CPU con unos 0,4 GiB de memoria, lo que la hace viable en mini-PC, routers de gama alta o servidores sin GPU.
- Localización de contenidos multilingües: con soporte para ocho idiomas, se puede doblar un mismo texto a distintas lenguas manteniendo un estilo de voz consistente, aunque conviene validar la calidad en los idiomas experimentales.
- Generación de voces para videojuegos y prototipos: la clonación zero-shot permite crear voces de personajes sin entrenamiento adicional, acelerando la iteración en fases de preproducción.
- Accesibilidad y lectura de textos: integración en lectores de pantalla o sistemas de asistencia que requieran síntesis de voz de baja latencia y bajo consumo de recursos.
- Servicios HTTP de TTS en producción: el paquete ONNX Runtime incluye servidor HTTP y streaming PCM, adecuado para APIs de síntesis con requisitos moderados de concurrencia.
- Investigación en TTS eficiente: su arquitectura de dos ramas y su escala compacta lo convierten en una base útil para experimentos de destilación, cuantización o adaptación a nuevos idiomas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada en PyTorch: el modelo principal (170M) en bfloat16 ocupa aproximadamente 0,34 GB de pesos; sumando el decodificador de códec (~120M) la pila completa ronda los 0,6 GB en bfloat16 y cerca de 1,2 GB en float32, sin contar activaciones ni caché KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se sugiere una RTX 3060, RTX 4060 o superior para inferencia cómoda, y A100/H100 solo si se requiere alto throughput por lotes.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 3090, RTX 4070, RTX 3060 e incluso iGPU con memoria unificada suficiente.
- Despliegue en CPU: variante ONNX INT8 con ONNX Runtime `CPUExecutionProvider`, aproximadamente 0,4 GiB de memoria tras la carga en Linux x86_64; no requiere CUDA, PyTorch ni Transformers tras la descarga.
- Despliegue en GPU: PyTorch con Transformers >= 4.57.0 y < 5, torch >= 2.5.0 y torchaudio >= 2.5.0, usando `trust_remote_code=True`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Escala del modelo principal | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Audio8 TTS Preview 0.1B | ~0,17B | 8 (2 principales) | audio8-community-license-v1.0 | Hugging Face, ONNX INT8 en CPU |
| Audio8 TTS Preview 0.6B | ~0,6B | no disponible | no disponible | Hugging Face |
| IndexTTS2.5 | ~0,8B | no disponible | no disponible | no disponible |
| CosyVoice3 | ~1,5B | no disponible | no disponible | no disponible |
| VoxCPM2 | ~2,3B | no disponible | no disponible | no disponible |
| Fish S2 Pro | ~4,6B | no disponible | no disponible | no disponible |
| Higgs Audio v2 | ~4,7B | no disponible | no disponible | no disponible |
| MOSS-TTS | ~8,5B | no disponible | no disponible | no disponible |

Las cifras de escala de los modelos comparados proceden de los informes respectivos citados por el autor y no constituyen una auditoría estrictamente equiparable de recuento de parámetros. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias
- Idiomas principales limitados a chino e inglés; alemán, español, francés, italiano, japonés y coreano se etiquetan como experimentales, por lo que su calidad puede ser irregular.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas, especialmente en textos largos o con nombres propios.
- La clonación de voz zero-shot plantea riesgos de suplantación de identidad y uso fraudulento; es responsabilidad del integrador aplicar consentimiento explícito y mecanismos de verificación.
- La licencia audio8-community-license-v1.0 es una licencia "other" no estándar: es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede contener restricciones específicas no recogidas en esta ficha.
- Contexto máximo de 2.048 posiciones empaquetadas de texto y audio, lo que limita la duración de las síntesis en una sola pasada.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio; conviene auditar dicho código en entornos de producción.
- No se han publicado datos sobre sesgos demográficos, acentos o variedades dialectales en la información disponible.
- La variante ONNX INT8 puede degradar ligeramente la calidad respecto a la inferencia en bfloat16; se recomienda evaluar ambos modos antes de desplegar.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.1b
- Variante ONNX INT8: https://huggingface.co/Audio8/audio8-TTS-0.1B-ONNX-INT8
- Repositorio GitHub: https://github.com/Audio8-AI/Audio8_TTS
- Guía de CPU con ONNX Runtime: https://github.com/Audio8-AI/Audio8_TTS/tree/master/onnx_runtime
- Demos de audio del modelo 0.1B: https://edge0-ai.github.io/Audio8_TTS/0.1B/
- Licencia: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b/blob/main/LICENSE
- Vídeo teaser: https://github.com/user-attachments/assets/d5f2b9a3-a87d-49a3-9df4-a3d1c377531d
