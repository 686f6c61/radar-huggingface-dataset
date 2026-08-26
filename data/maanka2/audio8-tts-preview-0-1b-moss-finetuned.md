# maanka2/Audio8-TTS-Preview-0.1b-moss-finetuned

## Resumen

Audio8-TTS-Preview-0.1b-moss-finetuned es un modelo de texto a voz (TTS) compacto con capacidades de clonación de voz zero-shot, desarrollado originalmente por Audio8 AI y publicado en este repositorio como un finetune realizado por el usuario maanka2. El nombre "moss-finetuned" sugiere un ajuste adicional sobre el checkpoint base, aunque no se han publicado detalles específicos sobre el proceso de finetune ni los datos utilizados.

El modelo emplea una arquitectura denominada Audio8 Falcon H1 con dos ramas autoregresivas (lenta y rápida) que predicen tokens semánticos y codebooks acústicos respectivamente. El modelo principal tiene aproximadamente 170 millones de parámetros, mientras que el decodificador del codec neuronal añade unos 120 millones adicionales, lo que sitúa el stack completo de generación de audio muy por debajo de sistemas multilingües modernos como CosyVoice3 (~1.5B) o Fish S2 Pro (~4.6B). Admite una ventana de contexto de hasta 2048 posiciones empaquetadas de texto y audio, y soporta ocho idiomas: chino, inglés, alemán, español, francés, italiano, japonés y coreano.

La relevancia de este modelo reside en su tamaño reducido: permite ejecutar clonación de voz zero-shot con un footprint de parámetros significativamente menor que la competencia. Además, existe una variante ONNX INT8 que lo hace ejecutable en CPU con tan solo 0.4 GiB de memoria RAM tras la carga, lo que abre el despliegue en entornos sin GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Audio8 Falcon H1 (dual AR: slow + fast) |
| Parámetros totales | 55.196.736 (safetensors); ~170M modelo principal + ~120M codec decoder |
| Parámetros activos | no disponible |
| Longitud de contexto | 2048 posiciones empaquetadas de texto/audio |
| Tipos de cuantización | INT8 (versión ONNX), FP16 (codec en ONNX), bfloat16 (GPU), FP32 (CPU) |
| Idiomas soportados | zh, en, de, es, fr, it, ja, ko |
| Licencia | audio8-community-license-v1.0 |
| Formato de pesos | safetensors (checkpoint v4 mixto), ONNX INT8 (opcional) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Audio8 Falcon H1, un diseño de doble rama autoregresiva. La rama lenta (Slow AR) cuenta con 24 capas, ancho 512, 8 cabezas de atención y 2 cabezas KV; predice tokens semánticos. La rama rápida (Fast AR) tiene 4 capas con las mismas dimensiones de ancho y cabezas, y predice los codebooks acústicos condicionados al estado oculto de la rama lenta. El codec neuronal opera a 44.1 kHz con 2048 muestras por frame (~21.5 frames/s) y utiliza 10 codebooks con 4096 entradas cada uno.

El entrenamiento del checkpoint base incluye un pipeline de SFT independiente para generación multilingüe y clonación de voz zero-shot, según el repositorio oficial. El finetune de maanka2 no aporta documentación adicional sobre los datos de entrenamiento o el proceso de ajuste. El contexto de 2048 posiciones empaquetadas de texto/audio permite manejar referencias de voz y texto de entrada en una sola secuencia.

## Capacidades

- Generación de voz a partir de texto en ocho idiomas, con chino e inglés como idiomas primarios y alemán, español, francés, italiano, japonés y coreano en modo experimental.
- Clonación de voz zero-shot: el modelo puede imitar la voz de una referencia de audio sin entrenamiento adicional, siempre que se proporcione el audio de referencia y su transcripción.
- Despliegue en CPU mediante ONNX INT8: la versión ONNX permite inferencia en CPU con memoria reducida (0.4 GiB después de la carga), sin dependencias de PyTorch ni Transformers.
- Compatible con el ecosistema Transformers: se carga con `AutoModel` y `AutoProcessor` usando `trust_remote_code=True`.
- Soporte de streaming PCM y registro de voz en el paquete ONNX.

## Casos de uso

- **Audiobooks y narración de contenido**: la clonación de voz zero-shot permite generar narración completa en la voz de un locutor con una sola muestra de referencia, reduciendo costes de grabación. El contexto de 2048 posiciones permite procesar párrafos largos sin cortes.
- **Asistentes de voz personalizados**: integración en aplicaciones de asistencia para generar respuestas con la voz del usuario, gracias a la baja huella de parámetros (~170M) que puede ejecutarse en dispositivos de gama media.
- **Doblaje automático de vídeo**: el modelo puede sintetizar voz en ocho idiomas, lo que facilita la localización de contenido audiovisual manteniendo la identidad vocal del actor original.
- **Sistemas de accesibilidad**: generación de voz en tiempo real para personas con discapacidad del habla, con la variante ONNX INT8 que se ejecuta en CPU de bajo consumo.
- **Prototipado de productos de voz**: desarrolladores pueden integrar el modelo en pipelines de TTS de producción con Transformers, sustituyendo APIs de pago por un sistema open-source de bajo coste computacional.
- **Generación de contenido educativo**: creación de materiales de aprendizaje multilingüe con voces consistentes, aprovechando el soporte experimental de 6 idiomas europeos y asiáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) o comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- **Inferencia en GPU**: requiere una GPU con CUDA, Python 3.11 o superior, y las librerías `torch>=2.5.0`, `torchaudio>=2.5.0`, `transformers>=4.57.0`. El modelo se carga en bfloat16 en GPU, por lo que la VRAM estimada es de aproximadamente 0.5-1 GB para el modelo principal (170M parámetros en bf16).
- **Inferencia en CPU**: la versión ONNX INT8 permite ejecución con ONNX Runtime `CPUExecutionProvider`, con un consumo de memoria de ~0.4 GiB después de la carga. No requiere CUDA ni dependencias de PyTorch tras la descarga.
- **GPU recomendadas**: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, T4). No se requiere GPU de gama alta.
- **Opciones de despliegue**: Transformers con `trust_remote_code=True`, ONNX Runtime para CPU, y el paquete CLI/web/HTTP del repositorio ONNX que incluye streaming PCM y registro de voz.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Escala del modelo principal | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| Audio8-TTS-Preview-0.1b | ~0.17B | 2048 posiciones | 8 (2 primarios, 6 experimentales) | audio8-community-license-v1.0 |
| IndexTTS2.5 | ~0.8B | no disponible | no disponible | no disponible |
| CosyVoice3 | ~1.5B | no disponible | no disponible | no disponible |
| VoxCPM2 | ~2.3B | no disponible | no disponible | no disponible |
| Fish S2 Pro | ~4.6B | no disponible | no disponible | no disponible |

La tabla de escala publicada por Audio8 indica que este modelo es significativamente más pequeño que sus competidores, aunque la model card advierte que no pretende igualar la calidad en todos los idiomas o benchmarks. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- El idioma español, junto con alemán, francés, italiano, japonés y coreano, se considera experimental; la calidad puede ser inferior a la de chino e inglés.
- La licencia `audio8-community-license-v1.0` es una licencia específica de Audio8; debe revisarse su compatibilidad con uso comercial y redistribución antes de su uso en producción.
- No se han publicado resultados de benchmarks, por lo que no se puede evaluar objetivamente la calidad frente a otros modelos.
- El finetune "moss-finetuned" no incluye documentación sobre el proceso de ajuste ni los datos utilizados, lo que limita la reproducibilidad.
- La clonación de voz zero-shot requiere que la transcripción del audio de referencia coincida exactamente con el contenido hablado; una transcripción incorrecta degradará la calidad de la síntesis.
- La carga del modelo requiere `trust_remote_code=True`, lo que implica ejecutar código remoto arbitrario; se recomienda revisar el código antes de usar en entornos de producción.
- La versión ONNX INT8 es una compilación separada y no está incluida en este repositorio, sino en `Audio8/audio8-TTS-0.1B-ONNX-INT8`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maanka2/Audio8-TTS-Preview-0.1b-moss-finetuned
- Modelo original (Audio8): https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b
- Repositorio GitHub: https://github.com/Audio8-AI/Audio8_TTS
- Demo con muestras de audio: https://audio8-ai.github.io/Audio8_TTS/0.1B/
- Versión ONNX INT8 para CPU: https://huggingface.co/Audio8/audio8-TTS-0.1B-ONNX-INT8
- Guía de ONNX Runtime: https://github.com/Audio8-AI/Audio8_TTS/tree/master/onnx_runtime
