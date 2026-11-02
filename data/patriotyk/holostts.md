# patriotyk/HolosTTS

## Resumen

HolosTTS es un modelo de síntesis de voz (text-to-speech) para ucraniano desarrollado por el usuario independente patriotyk. Se distribuye como pesos ONNX y PyTorch con licencia MIT, y su propuesta principal es un equilibrio agresivo entre calidad y latencia: según la model card, produce el primer fragmento de audio en 5 ms sobre una RTX 3090 usando TensorRT FP16, lo que lo sitúa en el terreno de la síntesis prácticamente en tiempo real con streaming intra-frase.

El modelo no consume texto directamente: espera fonemas IPA con marcas de acento, que se obtienen con paquetes auxiliares del mismo autor (`ukrainian-word-stress` e `ipa-uk`). Genera audio mono a 24 kHz, soporta voces predefinidas y clonación de voz a partir de una muestra de referencia, codificada como un vector de 256 dimensiones. El repositorio ocupa 6,4 GB e incluye los artefactos `holos.pt`, `voices.pt`, `voice_encoder.pt` y las variantes ONNX (CPU FP32/INT8, CUDA y TensorRT).

Es relevante ahora porque cubre un hueco poco atendido: TTS de calidad para ucraniano con despliegue sin PyTorch vía ONNX Runtime, incluyendo INT8 en CPU y TensorRT en GPU, y con streaming que permite empezar a reproducir audio antes de terminar la frase. La información pública disponible no detalla arquitectura interna, número de parámetros ni composición del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; pesos en PyTorch y ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (síntesis recomendada frase a frase) |
| Tipos de cuantización | FP32, FP16 (TensorRT), INT8 (CPU ONNX) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`holos.pt`, `voices.pt`, `voice_encoder.pt`) y ONNX |

Otros datos técnicos: frecuencia de muestreo de salida 24 kHz, audio mono; entrada en fonemas IPA con acentuación; vector de voz de 256 números; tamaño del repositorio 6,4 GB; pipeline declarado `text-to-speech`.

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo (tipo de backbone, códec vocacional, vocoder, número de capas o parámetros). Lo que sí se documenta es la interfaz funcional: el sistema se compone de un modelo acústico principal (`holos.pt`), un banco de voces predefinidas (`voices.pt`) y un codificador de voz (`voice_encoder.pt`) que transforma una grabación de referencia en un embedding de 256 dimensiones utilizable como voz personalizada, también en el runtime ONNX.

El flujo de inferencia exige un preprocesado lingüístico externo: acentuación con `ukrainian-word-stress` y transcripción fonética con `ipa-uk`. No se publican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF/DPO o ajuste por preferencias. Tampoco se detallan innovaciones como decodificación especulativa; la innovación declarada es operativa: streaming por chunks (`chunk_frames`, 40 frames = 1 s por defecto) con decodificación contextual a ambos lados de cada chunk, y un manejo explícito del silencio inicial del token de frontera (unos 50 ms, recortado a 10 ms con fade-in de 5 ms para evitar clics).

## Capacidades

- Síntesis de voz en ucraniano a partir de fonemas IPA con marcas de acento.
- Voces predefinidas seleccionables mediante `list_voices()`.
- Clonación de voz zero-shot a partir de una muestra de audio limpia (sin música ni otros hablantes), mediante `VoiceEncoder`.
- Streaming de audio por chunks con latencia de primer fragmento muy baja (5 ms en TensorRT FP16 según la model card).
- Control de velocidad de habla mediante el parámetro `speed` (mayor que 1 acelera, menor que 1 ralentiza).
- Salida de audio mono a 24 kHz compatible con `soundfile`.
- Ejecución en PyTorch (CPU/CUDA) o en ONNX Runtime sin PyTorch: CPU FP32, CPU INT8, CUDA y TensorRT.
- Portabilidad del vector de voz entre backends (se puede guardar y pasar al runtime ONNX).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio de entrada más allá de la referencia de clonación.

## Casos de uso

- Lectura de artículos y documentos largos en ucraniano: el modelo sintetiza frase a frase y el streaming permite reproducir mientras se genera; el control de `speed` ayuda a ajustar la locución a audiolibros o podcasts.
- Asistentes de voz y altavoces inteligentes en ucraniano: con 5 ms hasta el primer chunk en TensorRT FP16, la respuesta hablada puede comenzar antes de que el usuario perciba latencia, requisito habitual en diálogo por turnos.
- Sistemas de accesibilidad (lectores de pantalla): el despliegue en CPU con ONNX INT8 elimina la dependencia de GPU y de PyTorch, lo que simplifica la distribución en equipos de usuario final.
- Atención al cliente telefónica automatizada: la clonación de voz permite mantener una identidad de marca consistente y el streaming reduce el tiempo hasta el primer audio en flujos IVR.
- Doblaje y localización de contenido al ucraniano: la clonación a partir de una muestra permite preservar el timbre de un locutor concreto, y la salida a 24 kHz es adecuada para vídeo y redes.
- Pruebas A/B de voces en producto: el vector de 256 dimensiones se puede almacenar, versionar y reutilizar entre backends, lo que facilita comparar voces sin reentrenar.
- Generación de avisos y notificaciones dinámicas: RTF de 0,0013 en TensorRT permite sintetizar muchos mensajes cortos por segundo en un solo servidor GPU.

## Benchmarks y rendimiento

Datos publicados en la model card. RTF = tiempo de síntesis dividido por duración del audio (menor es mejor). "Primer audio" es el retardo hasta el primer fragmento; los modelos marcados con * no hacen streaming intra-frase, por lo que su primer audio equivale a la frase completa. Medición sobre tres frases de 5–12 s, mediana de 10 ejecuciones (5 en CPU) tras calentamiento, en NVIDIA RTX 3090.

| Modelo | Runtime | RTF | Primer audio |
|---|---|---|---|
| HolosTTS | ONNX, TensorRT FP16 | 0,0013 | 5 ms |
| HolosTTS | ONNX, TensorRT FP32 | 0,0031 | 12 ms |
| HolosTTS | ONNX, CUDA | 0,0039 | 14 ms |
| Supertonic 3 | ONNX, CUDA | 0,0052 | 45 ms* |
| StyleTTS2 single-speaker | PyTorch | 0,0065 | 55 ms* |

No se publican en la información disponible resultados de benchmarks de calidad (MOS, similitud de hablante, WER de transcripción inversa) ni comparativas en CPU o INT8.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el repositorio pesa 6,4 GB e incluye varios formatos, pero no se desglosa el tamaño por artefacto.
- GPU de referencia en las mediciones: NVIDIA RTX 3090, con TensorRT FP16 (mejor caso), TensorRT FP32 y CUDA.
- Compatibilidad con GPU de consumo: sí, según la model card se ejecuta en una RTX 3090; no se confirma funcionamiento en GPUs con menos VRAM.
- CPU: soportado mediante ONNX Runtime en FP32 e INT8, sin necesidad de PyTorch; no se publican cifras de RTF en CPU.
- Aceleradores: CUDA y TensorRT (paquete `holos-tts-onnx[tensorrt]`).
- Opciones de despliegue: paquetes `holos-tts` (PyTorch) y `holos-tts-onnx` (ONNX Runtime); también hay una demo en Hugging Face Spaces. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF de 0,0013 y primer audio de 5 ms en TensorRT FP16 sobre RTX 3090, según la model card.

## Comparativa con modelos similares

| Modelo | Runtime medido | RTF | Primer audio | Streaming intra-frase | Licencia | Idiomas |
|---|---|---|---|---|---|---|
| HolosTTS | ONNX TensorRT FP16 | 0,0013 | 5 ms | Sí | MIT | Ucraniano |
| Supertonic 3 | ONNX CUDA | 0,0052 | 45 ms | No | no disponible | no disponible |
| StyleTTS2 single-speaker | PyTorch | 0,0065 | 55 ms | No | no disponible | no disponible |

La comparativa se limita a latencia porque es el único eje con datos publicados en la información disponible. No hay datos de parámetros, contexto ni calidad subjetiva para Supertonic 3 ni StyleTTS2 en esta ficha; además, StyleTTS2 se mide en su variante single-speaker, por lo que la comparación con clonación de voz no es directa.

## Limitaciones y advertencias

- El modelo no acepta texto: requiere un pipeline externo de acentuación y transcripción fonética (`ukrainian-word-stress`, `ipa-uk`), instalados desde GitHub, lo que añade una dependencia frágil en producción.
- Solo soporta ucraniano; no se documenta multilingüismo.
- La clonación de voz exige grabaciones limpias, sin música ni otros hablantes; la calidad del clon depende de la muestra de referencia.
- Riesgo de uso indebido: la clonación de voz sin consentimiento puede facilitar suplantación de identidad y fraude; la licencia MIT no impone restricciones éticas adicionales, por lo que la responsabilidad recae en el integrador.
- No se publican datos sobre sesgos (de género, dialectales o de edad) ni evaluaciones de calidad tipo MOS o similitud de hablante.
- Riesgo de alucinación acústica: no se documentan tasas de errores de pronunciación ni comportamiento ante texto fuera de dominio, abreviaturas o palabras extranjeras.
- Para textos largos se recomienda sintetizar frase a frase; no se especifica una longitud máxima de entrada ni gestión de contexto entre frases.
- El streaming con chunks pequeños reduce el primer audio pero aumenta el tiempo total, ya que cada chunk se decodifica con contexto a ambos lados; es un compromiso que hay que calibrar.
- Las cifras de latencia corresponden a una RTX 3090 con TensorRT; no hay datos publicados para CPU, INT8 ni GPUs de gama inferior.
- Licencia MIT: permite uso comercial, pero no se ofrece garantía ni soporte; el proyecto tiene 0 descargas y 12 likes en el momento de la consulta, por lo que la madurez y el mantenimiento a largo plazo no están contrastados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patriotyk/HolosTTS
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/patriotyk/HolosTTS
- Código en GitHub: https://github.com/patriotyk/HolosTTS
- README del paquete ONNX: https://github.com/patriotyk/HolosTTS/blob/main/holos_onnx/README.md
- Paquete PyPI `holos-tts`: https://pypi.org/project/holos-tts/
- Paquete PyPI `holos-tts-onnx`: https://pypi.org/project/holos-tts-onnx/
- Paquete de acentuación ucraniana: https://github.com/patriotyk/ukrainian-word-stress
- Paquete de transcripción IPA ucraniana: https://github.com/patriotyk/ipa-uk
