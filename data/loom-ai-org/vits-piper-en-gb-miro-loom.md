# loom-ai-org/vits-piper-en-gb-miro-loom

## Resumen

El modelo `loom-ai-org/vits-piper-en-gb-miro-loom` es una exportación al formato GGUF del modelo de síntesis de voz VITS de Piper, concretamente la voz británica "miro" del proyecto OpenVoiceOS. Esta adaptación está pensada para el motor de inferencia loom.cpp, que permite ejecutar modelos de IA de forma local y eficiente sobre CPU, sin necesidad de GPU. El modelo conserva los pesos originales sin modificar, pero se reempaquetan en un único archivo GGUF autodescriptivo que incluye la topología del grafo, la tabla de símbolos y el script de control.

Con 20,4 millones de parámetros y un tamaño de repositorio de 0,2 GB, se trata de un modelo ligero y adecuado para entornos con recursos limitados. A diferencia de los modelos de texto generativo, este checkpoint está especializado exclusivamente en text-to-speech (TTS) y trabaja sobre secuencias de fonemas, no sobre texto crudo. La relevancia actual reside en su integración con el ecosistema loom.cpp, que facilita el despliegue de TTS en aplicaciones embebidas, asistentes de voz y sistemas de lectura automática con un consumo mínimo de memoria.

El modelo está etiquetado para el idioma inglés (en) y hereda la licencia del modelo base de OpenVoiceOS, que se declara como "other" y debe verificarse antes de su redistribución comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) |
| Parametros totales | 20.369.274 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (síntesis de voz, entrada de fonemas) |
| Tipos de cuantizacion | GGUF (tipo de cuantizacion no especificado en la informacion disponible) |
| Idiomas soportados | en (ingles britanico) |
| Licencia | other (heredada del modelo base, consultar OpenVoiceOS/pipertts_en-GB_miro) |
| Formato de pesos | GGUF (safetensors no aplica; el repo contiene un archivo `.gguf`) |

## Arquitectura y entrenamiento

VITS es un modelo de síntesis de voz end-to-end que combina un encoder de texto, un decoder basado en flujos normalizadores (normalizing flows) y un discriminador adversarial. El modelo original de Piper fue entrenado por el proyecto OpenVoiceOS sobre datos de voz en inglés británico, con la voz denominada "miro". No se dispone de información detallada sobre el conjunto de datos de entrenamiento ni el número de tokens utilizados, ni tampoco sobre técnicas de alineación supervisada o ajuste fino adicional.

La exportación a loom.cpp no altera los pesos del modelo; únicamente los reempaqueta en un formato GGUF autodescriptivo que incluye la tabla de símbolos (symbol table) necesaria para interpretar los fonemas. El grapheme-to-phoneme (G2P) no está incluido en el archivo, ya que se considera una propiedad del idioma y no del checkpoint. Por tanto, para usar el modelo con texto natural es necesario instalar un paquete adicional de conversión grafema-fonema, o bien proporcionar directamente los fonemas.

## Capacidades

- Síntesis de voz a partir de secuencias de fonemas (por ejemplo, `həˈloʊ` para "hello").
- Generación de audio en formato WAV con una frecuencia de muestreo de 22050 Hz.
- API de alto nivel en `loom-py-rt` que permite pasar texto directamente si se instala el paquete de fonemas (`loom-py-rt[phonemes]`).
- Integración con el motor loom.cpp para inferencia local en CPU.
- El archivo GGUF incluye la tabla de símbolos y el script de control (driver), lo que facilita su uso sin configuración adicional.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Asistentes de voz en inglés británico: el modelo puede integrarse en asistentes locales que necesiten una voz natural y ligera, sin depender de servicios en la nube. Su bajo consumo permite ejecutarlo en dispositivos embebidos o en segundo plano.
- Lectura de textos para accesibilidad: aplicaciones de lectura de pantalla o de documentos pueden convertir texto en audio de forma local, protegiendo la privacidad del usuario al no enviar datos a servidores externos.
- Generación de audiolibros: sistemas de conversión de libros electrónicos a audio pueden usar este modelo para producir narraciones en inglés británico, con la ventaja de un tamaño reducido y una latencia baja en CPU.
- Sistemas de respuesta interactiva de voz (IVR): centralitas telefónicas o chatbots de voz pueden utilizar este TTS para generar mensajes dinámicos sin depender de servicios de pago por uso.
- Doblaje automatizado para vídeos: creadores de contenido pueden generar pistas de voz en inglés británico para vídeos o presentaciones, con control sobre el texto y sin necesidad de GPU.
- Prototipos de aplicaciones de voz con loom.cpp: desarrolladores que ya usan loom.cpp para otros modelos pueden añadir esta capacidad de TTS con el mismo ecosistema, simplificando el despliegue y el mantenimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas objetivas como MOS (Mean Opinion Score), velocidad de síntesis o comparaciones con otros modelos TTS en el repositorio ni en la documentación proporcionada.

## Requisitos de hardware

- Inferencia en CPU: al tratarse de un modelo de 20,4 millones de parámetros, puede ejecutarse en CPU sin necesidad de GPU. El tamaño del archivo GGUF es de aproximadamente 0,2 GB, por lo que la memoria RAM necesaria es inferior a 1 GB.
- GPU recomendada: no se requiere GPU; cualquier procesador moderno con soporte para instrucciones AVX2 será suficiente para una síntesis en tiempo real o casi tiempo real.
- Compatible con hardware embebido: el bajo consumo de memoria y la ausencia de dependencias de GPU lo hacen apto para Raspberry Pi, módulos IoT y sistemas con recursos limitados.
- Opciones de despliegue: se utiliza mediante la librería Python `loom-py-rt` (disponible en PyPI) y el motor loom.cpp. No se menciona compatibilidad con vLLM, Ollama o TGI, que están orientados a modelos de lenguaje generativo.
- Latencia y throughput: no se proporcionan datos concretos, pero para un modelo de este tamaño en CPU se espera una latencia de decenas de milisegundos por frase corta, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idioma | Licencia | Observaciones |
|---|---|---|---|---|---|
| loom-ai-org/vits-piper-en-gb-miro-loom | 20,4M | GGUF (loom.cpp) | en-GB | other | Exportación de Piper para loom.cpp |
| OpenVoiceOS/pipertts_en-GB_miro | 20,4M | Piper (ONNX) | en-GB | other | Modelo base original de Piper |
| Otras voces de Piper (p. ej., en_US-lessac) | ~20-30M | Piper (ONNX) | en-US | MIT (varía) | Voces alternativas del proyecto Piper |

La comparativa se limita a las variantes de Piper, ya que no se dispone de datos de modelos TTS equivalentes en el ecosistema loom.cpp. El modelo base y su exportación comparten los mismos pesos; la diferencia radica en el formato de empaquetado y en el motor de inferencia (ONNX vs. GGUF/loom.cpp). Otras voces de Piper pueden tener licencias distintas y tamaños similares, pero no están disponibles en formato GGUF para loom.cpp en la información proporcionada.

## Limitaciones y advertencias

- Idioma limitado: el modelo solo soporta inglés (variedad británica). No es adecuado para otros idiomas sin reentrenamiento.
- Entrada basada en fonemas: el modelo no acepta texto directamente; requiere un paso de conversión grafema-fonema (G2P) que no está incluido en el archivo GGUF. Sin el paquete `loom-py-rt[phonemes]`, el usuario debe proporcionar los fonemas manualmente.
- Licencia incierta: la etiqueta `license: other` y la advertencia en la model card indican que los términos deben verificarse en el repositorio del modelo base antes de cualquier redistribución comercial.
- Riesgo de pronunciación incorrecta: al depender de un G2P externo, palabras poco comunes, nombres propios o términos técnicos pueden pronunciarse de forma errónea si el conversor no está bien entrenado.
- Sin control fino de prosodia: VITS genera una prosodia determinista a partir de los fonemas; no se pueden ajustar parámetros como el tono, la velocidad o el énfasis de forma explícita a través de la API de alto nivel.
- Sin soporte para otros formatos de audio: la salida se genera en WAV a 22050 Hz; no se menciona soporte para MP3, OGG u otros códecs directamente.
- Baja adopción: el modelo tiene solo 13 descargas y 0 likes, lo que sugiere una comunidad pequeña y una validación limitada en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/vits-piper-en-gb-miro-loom
- Modelo base (OpenVoiceOS/pipertts_en-GB_miro): https://huggingface.co/OpenVoiceOS/pipertts_en-GB_miro
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
