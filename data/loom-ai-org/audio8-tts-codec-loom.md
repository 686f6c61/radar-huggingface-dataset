# loom-ai-org/audio8-tts-codec-loom

## Resumen

Audio8-TTS codec (decoder) es la mitad de decodificación del códec neural de audio a 44,1 kHz que forma parte del sistema de síntesis de voz Audio8-TTS de Edge0. El modelo original es `Edge0/Audio8-TTS-Realistic-0.6b`, del que este repositorio constituye una exportación a formato GGUF para el motor loom.cpp, con los pesos sin modificar. No es un modelo de lenguaje ni un sistema TTS completo: recibe diez flujos de tokens de códec (uno semántico y nueve acústicos) y devuelve audio mono a 44,1 kHz. Su relevancia radica en que permite ejecutar la etapa de decodificación de audio de un pipeline TTS en un runtime nativo ligero (loom-py-rt), con un único fichero autodescriptivo que declara su propia geometría (número de codebooks, tamaño de cada uno, tasa de frames y frecuencia de muestreo).

El modelo tiene 130.658.184 parámetros (unos 130,7 millones) y un tamaño de repositorio de 0,5 GB, coherente con los 523 MB que ocupa el GGUF en F32. La arquitectura subyacente es una pila convolucional grande que opera a 44,1 kHz, con una tasa de frames de 21,5 por segundo y 2048 muestras por frame. La licencia es Apache 2.0, heredada del modelo base.

Al tratarse de la mitad de decodificación, no acepta texto ni audio de entrada: es un componente de infraestructura que se integra en pipelines de generación de voz junto con el modelo autorregresivo que emite los códigos y, opcionalmente, el codificador que los produce a partir de audio. Su verificación contra el decodificador original de Edge0 reporta una diferencia absoluta máxima de 4,6e-06, lo que indica una exportación fiel.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pila convolucional de decodificación de códec neural (no transformer) |
| Parámetros totales | 130.658.184 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (códec; máximo 2048 frames por llamada, 95 s de audio) |
| Tipos de cuantización | F32 (523 MB); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (es un códec, no un modelo de lenguaje; no tiene vocabulario ni idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (exportación loom.cpp, fichero `audio8-tts-codec.gguf`) |

## Arquitectura y entrenamiento

El modelo es la mitad de decodificación de un códec neural de audio a 44,1 kHz. La arquitectura es una pila convolucional grande que transforma tokens de códec en muestras de audio mono. La geometría del códec, declarada en el propio fichero GGUF, es la siguiente: 10 codebooks por frame, con un codebook semántico de 4096 entradas (codebook 0) y nueve codebooks acústicos de 1024 entradas cada uno (codebooks 1-9); tasa de frames de 21,5 por segundo; 2048 muestras por frame; salida a 44,1 kHz. Los códigos se suministran en orden frame-major (los diez códigos del frame 0, luego los del frame 1, etc.).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo etapas de RLHF o DPO; esa información corresponde al modelo base `Edge0/Audio8-TTS-Realistic-0.6b` y no se detalla en la información proporcionada. La innovación técnica destacable de esta exportación es el empaquetado en un único GGUF autodescriptivo que incluye las topologías de grafo, el tokenizador (si lo hubiera) y el script de controlador, generado por loom-exporter; el controlador embebido documenta todos los argumentos que acepta el modelo y es la autoridad para parámetros no expuestos por la API de alto nivel.

## Capacidades

- Decodificación de tokens de códec a audio mono a 44,1 kHz: entrada de 10 flujos de códigos por frame, salida de forma de onda.
- Procesamiento por llamada completa de un clip de hasta 2048 frames (95 segundos), que es el máximo que el modelo TTS puede producir en una sola llamada.
- Acepta tanto listas anidadas frame-major como listas planas de códigos; rechaza entradas que no constituyan un número entero de frames en lugar de reinterpretarlas con otro ancho.
- Los identificadores de código fuera del rango de un codebook se decodifican como la última entrada de dicho codebook, replicando el comportamiento del decodificador original.
- API de alto nivel `model.codes2speech.infer(...)` con ventaneo, muestreo y ensamblado ya aplicados; acceso de bajo nivel mediante `model.infer(...)` al controlador embebido.
- Exposición de hiperparámetros del códec mediante `model.hparam(...)`: `codec.n_codebooks`, `codec.codebook_size`, `codec.frame_rate` y `model.contract["sample_rate"]`.
- No soporta tool calling, function calling, agentes, razonamiento multi-turno ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye la mitad de codificación (`encode`, audio a códigos); esta es una capacidad separada con otro contrato.

## Casos de uso

- Síntesis de voz en pipelines TTS: el modelo recibe los códigos emitidos por el modelo autorregresivo de Audio8-TTS y los convierte en audio a 44,1 kHz; es la etapa final de un sistema de generación de voz realista.
- Integración en aplicaciones de lectura en voz alta o asistentes de voz: al ejecutarse sobre loom.cpp con un GGUF único, se puede desplegar la decodificación en entornos nativos ligeros sin depender de un stack de deep learning completo.
- Generación de audiolibros o contenido narrado por lotes: cada llamada decodifica hasta 95 segundos de audio, lo que permite procesar fragmentos largos con una sola invocación por segmento.
- Reproducción de voz clonada: en un flujo de clonación de voz, el codificador convierte una referencia en un fichero de voz y el modelo autorregresivo genera códigos que este decodificador transforma en audio; el decodificador es la pieza que materializa la salida.
- Evaluación y depuración de códecs neuronales: los hiperparámetros declarados en el fichero permiten inspeccionar la geometría del códec sin consultar documentación externa, útil para validar implementaciones o comparar exportaciones.
- Investigación en representaciones de audio discreto: al ser una exportación fiel (diferencia máxima de 4,6e-06 frente al original), sirve como referencia para estudiar la reconstrucción de audio a partir de tokens semánticos y acústicos.
- Prototipado de interfaces de voz en local: con un consumo de 523 MB en F32 y ejecución en CPU, permite experimentar con decodificación de voz en máquinas sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento proporcionados son de ejecución: en una CPU de 4 núcleos el decodificador tarda aproximadamente cuatro segundos por cada segundo de audio, y la fidelidad frente al decodificador original de Edge0 es de 4,6e-06 de diferencia absoluta máxima.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero en F32 ocupa 523 MB; en CPU no requiere VRAM y en GPU la huella de pesos es de aproximadamente 0,5 GB, a la que hay que sumar los buffers de activación de la pila convolucional.
- GPU recomendadas: no se especifican en la información disponible; por tamaño de pesos, cualquier GPU con al menos 2 GB de memoria libre podría alojar los pesos, aunque no se documenta soporte GPU explícito.
- ¿Cabe en GPU de consumo? Por tamaño de pesos sí (0,5 GB en F32), pero no se confirma en la documentación si el runtime loom.cpp ejecuta esta pila convolucional en GPU.
- Despliegue: runtime loom-py-rt (paquete `loom-py-rt[hub]` en PyPI) sobre el motor loom.cpp; el modelo se carga con `loom.Model.from_pretrained("loom-ai-org/audio8-tts-codec-loom")`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en CPU de 4 núcleos, aproximadamente 4 segundos de cómputo por segundo de audio generado, es decir, un factor de tiempo real cercano a 0,25x en ese hardware.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros códecs neuronales comparables (por ejemplo, EnCodec, DAC o SoundStream) ni sus especificaciones, por lo que no es posible establecer una comparación rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Es únicamente la mitad de decodificación: no acepta audio de entrada ni texto; la codificación (audio a códigos) es un contrato distinto y no está incluida.
- No es un modelo de lenguaje: no tiene vocabulario, no procesa idiomas y no admite instrucciones en lenguaje natural.
- Los códigos deben suministrarse en orden frame-major con exactamente 10 códigos por frame a 21,5 frames por segundo; una entrada que no sea un número entero de frames se rechaza.
- Los identificadores fuera del rango de un codebook se decodifican silenciosamente como la última entrada, lo que puede enmascarar errores en el modelo que genera los códigos.
- Cada llamada decodifica un clip completo de hasta 2048 frames (95 segundos); no se documenta decodificación en streaming.
- El rendimiento en CPU es limitado (aproximadamente 4 s de cómputo por segundo de audio en 4 núcleos), lo que puede ser insuficiente para aplicaciones interactivas en tiempo real sin hardware adicional.
- No se documentan sesgos específicos del códec, pero al heredar los pesos del modelo base, cualquier sesgo acústico o de voces presente en `Edge0/Audio8-TTS-Realistic-0.6b` se mantiene.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones de este último.
- Solo se documenta el formato F32; no hay cuantizaciones publicadas que reduzcan el tamaño o aceleren la inferencia.
- El repositorio tiene un uso muy bajo (17 descargas, 0 likes) y fue creado en octubre de 2026, por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/audio8-tts-codec-loom
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- Exportación del modelo TTS completo: https://huggingface.co/loom-ai-org/audio8-tts-realistic-0.6b-loom
- Motor loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- API loom-py: https://github.com/loom-ai-org/loom-py
