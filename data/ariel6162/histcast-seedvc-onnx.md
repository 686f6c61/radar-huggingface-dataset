# ariel6162/histcast-seedvc-onnx

## Resumen

HistCast Seed-VC ONNX es un paquete de pesos en formato ONNX derivado del sistema de conversión de voz Seed-VC, exportado por el usuario ariel6162 para su uso en un pipeline local de conversión de voz de tipo "tiny". No se trata de un lanzamiento oficial de los autores originales ni de un servicio de inferencia alojado, sino de una exportación no oficial que reempaqueta seis grafos ONNX procedentes de tres modelos upstream: Plachta/Seed-VC (regulador de longitud y estimador de difusión), facebook/wav2vec2-xls-r-300m (extractor de características XLS-R, dividido en dos grafos fp16) y FunAudioLLM/CosyVoice-300M (red de pitch F0 y cuerpo HiFT).

El paquete resuelve el problema de ejecutar conversión de voz en entornos con recursos limitados, presumiblemente Android, mediante grafos ONNX de tamaño reducido (el repositorio completo ocupa 0,5 GB) y distribuidos en partes de como máximo 24 MiB con verificación de hashes SHA-256. La arquitectura subyacente combina un codificador auto-supervisado XLS-R de 300M parámetros, un estimador de difusión y un vocoder HiFT, todos ellos componentes de Seed-VC, un sistema de conversión de voz zero-shot.

Es relevante por su enfoque de empaquetado reproducible (revisiones upstream fijadas por commit, manifiesto con hashes, script de reensamblado) y por su licencia GPL-3.0, que condiciona fuertemente su uso comercial. No obstante, la model card advierte explícitamente de que la latencia en teléfono, el pico de memoria y la calidad en episodios largos no están establecidos, y de que los grafos no constituyen por sí solos un sistema de texto a voz: la integración de la difusión y el preprocesamiento acústico son trabajo del cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: XLS-R (transformer auto-supervisado) + estimador de difusión + vocoder HiFT + red de pitch F0; exportado como seis grafos ONNX |
| Parametros totales | no disponible (el componente XLS-R base declara 300M; el total del pipeline no se especifica) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | FP16 en los grafos XLS-R (`xlsr12_A_fp16.onnx`, `xlsr12_B_fp16.onnx`); resto de grafos sin cuantización declarada |
| Idiomas soportados | no disponible |
| Licencia | GPL-3.0 (con avisos Apache-2.0 para componentes originales de wav2vec2-xls-r-300m y CosyVoice-300M) |
| Formato de pesos | ONNX, distribuido en partes de máximo 24 MiB con manifiesto JSON y hashes SHA-256 |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo nuevo: es una exportación de componentes ya entrenados. Los seis grafos ONNX se derivan de tres fuentes con revisiones upstream fijadas por commit: `lenreg.onnx` y `dit.onnx` de Plachta/Seed-VC (commit `257283f9...`), `xlsr12_A_fp16.onnx` y `xlsr12_B_fp16.onnx` de facebook/wav2vec2-xls-r-300m (commit `1a640f32...`), y `f0net.onnx` y `hift_body.onnx` de FunAudioLLM/CosyVoice-300M (commit `24c40509...`). El pipeline completo requiere además el grafo oficial `campplus.onnx` del repositorio de CosyVoice, que no se redistribuye en este paquete por problemas de licencia de exportaciones comunitarias.

Las modificaciones de exportación declaradas incluyen: dividir las doce primeras capas de XLS-R en dos grafos fp16, exponer la regulación de longitud y el estimador de difusión, sustituir transformadas complejas del vocoder por operaciones reales de valor fijo, y exponer entradas de pitch, fase y ruido. La integración de la difusión y el preprocesamiento acústico quedan como trabajo del cliente. No se dispone de información sobre el número de tokens, composición del dataset ni procesos de RLHF/DPO, ya que no se ha reentrenado el modelo.

## Capacidades

- Conversión de voz (voice conversion) a partir de audio de referencia, mediante los grafos de Seed-VC.
- Extracción de características acústicas auto-supervisadas con XLS-R (capas 1-12, en dos grafos fp16).
- Estimación de pitch y fase (F0) mediante `f0net.onnx`.
- Síntesis acústica mediante el vocoder HiFT (`hift_body.onnx`).
- Regulación de longitud temporal (`lenreg.onnx`) y estimación de difusión (`dit.onnx`) para el proceso generativo.
- Verificación de integridad del paquete mediante manifiesto con tamaños y hashes SHA-256.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües de texto: es un pipeline puramente de audio.
- No es un sistema de texto a voz autónomo; requiere integración cliente de la difusión y del preprocesamiento acústico.

## Casos de uso

- Conversión de voz local en dispositivos Android: el paquete está pensado para integrarse en una app Android con reensamblado automático de los grafos, gracias a la distribución en partes pequeñas y a la verificación por hashes.
- Doblaje o adaptación de voz en producción de pódcasts: el nombre "HistCast" sugiere su uso en un flujo de creación de episodios, donde el modelo transforma la voz de una locución hacia una voz de referencia previamente autorizada.
- Prototipado de pipelines de conversión de voz en Python: los grafos ONNX pueden cargarse con ONNX Runtime para experimentar con el estimador de difusión y el vocoder sin depender de PyTorch.
- Investigación sobre exportación y portabilidad de modelos de audio: sirve como ejemplo de reempaquetado reproducible con revisiones fijadas y verificación criptográfica.
- Integración en herramientas de accesibilidad que requieran transformar la voz del usuario hacia un timbre consistente, siempre con audio de referencia propio y consentido.
- Evaluación comparativa de vocoders ligeros (HiFT) frente a alternativas en entornos con memoria limitada, midiendo latencia y pico de memoria en teléfono.
- Despliegue en entornos sin servicio de inferencia de pago: el paquete es descargable gratuitamente desde Hugging Face, sujeto a sus términos y políticas de nivel gratuito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que se realizaron comprobaciones numéricas en escritorio y de audio acotado, pero que la latencia en teléfono, el pico de memoria, el parecido de voz amplio y la calidad en episodios largos no están establecidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 0,5 GB, pero el pico de memoria en ejecución no se especifica.
- GPU recomendadas: no disponible; la model card no documenta requisitos de GPU de escritorio ni de móvil.
- Cabeza en GPU de consumo: no confirmado; el tamaño del paquete (0,5 GB) sugiere que podría caber en GPUs consumer, pero no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime (implícito por el formato), con reensamblado mediante `reassemble.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a audio).
- Latencia y throughput: no disponibles; explícitamente no prometidos para teléfono.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| HistCast Seed-VC ONNX (este paquete) | no disponible (XLS-R base 300M) | no aplica (audio) | GPL-3.0 | ONNX en partes | Hugging Face, descarga gratuita |
| Plachta/Seed-VC (upstream) | no disponible | no aplica (audio) | GPL-3.0 | pesos originales | Hugging Face |
| FunAudioLLM/CosyVoice-300M | 300M (componente) | no aplica (audio) | Apache-2.0 | pesos originales | Hugging Face |
| facebook/wav2vec2-xls-r-300m | 300M | no aplica (audio) | Apache-2.0 | pesos originales | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia GPL-3.0: cualquier uso comercial o distribución derivada queda sujeto a obligaciones de copyleft; los componentes Apache-2.0 conservan sus avisos, pero el conjunto se distribuye bajo GPL-3.0.
- La licencia del modelo no licencia el audio de referencia ni la identidad de una persona: solo debe usarse audio de referencia sobre el que se tenga derecho y etiquetar claramente la salida sintética.
- Riesgo de suplantación: el modelo no identifica a una persona, no establece consentimiento ni autentica una grabación; no debe presentarse como prueba de identidad o endoso.
- Calidad no garantizada: la model card indica que el parecido de voz amplio y la calidad en episodios largos no están establecidos.
- Rendimiento en móvil no verificado: latencia, pico de memoria y comportamiento en teléfono no están documentados ni prometidos.
- Reproducibilidad del export: los scripts genéricos de exportación no se han vuelto a ejecutar en un entorno limpio y la serialización puede variar según la cadena de herramientas.
- Dependencia externa: el pipeline completo necesita `campplus.onnx` del repositorio oficial de CosyVoice, que no se incluye en el paquete.
- No es un sistema de texto a voz autónomo: requiere trabajo cliente de integración de difusión y preprocesamiento acústico.
- Idiomas soportados no documentados; no hay información sobre sesgos acústicos o demográficos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ariel6162/histcast-seedvc-onnx
- Seed-VC (upstream): https://huggingface.co/Plachta/Seed-VC
- Repositorio Seed-VC: https://github.com/Plachtaa/Seed-VC
- wav2vec2-xls-r-300m: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- CosyVoice-300M: https://huggingface.co/FunAudioLLM/CosyVoice-300M
