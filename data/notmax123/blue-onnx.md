# notmax123/blue-onnx

## Resumen

Blue ONNX es el paquete de pesos en formato ONNX del sistema BlueTTS, un modelo de síntesis de voz (text-to-speech) desarrollado por maxmelichov (publicado en Hugging Face bajo el identificador notmax123). Su objetivo principal es ofrecer calidad nativa en hebreo, incluyendo el tratamiento del *nikud* (diacríticos vocálicos) y la desambiguación de homógrafos frecuentes, manteniendo una velocidad suficiente para uso en tiempo real y por lotes. El repositorio contiene únicamente los checkpoints ONNX para inferencia; los pesos en PyTorch/Safetensors para entrenamiento y ajuste fino se distribuyen por separado.

El modelo se apoya en ONNX Runtime y, opcionalmente, en motores NVIDIA TensorRT para acelerar la inferencia. El código de referencia soporta, además del hebreo, inglés, español, italiano, alemán y segmentos con mezcla de idiomas en una misma locución. La conversión de grafemas a fonemas (G2P) para hebreo en tiempo de inferencia depende de un modelo ONNX externo llamado renikud, que debe descargarse aparte.

Es relevante para desarrolladores que necesiten un TTS ligero y desplegable en CPU o GPU con licencia MIT, y especialmente para aplicaciones en hebreo donde la mayoría de alternativas comerciales tienen una cobertura limitada. El repositorio ocupa 2,2 GB y no incluye, en la información disponible, detalles sobre arquitectura interna, número de parámetros ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; se menciona ONNX Runtime y TensorRT opcional) |
| Idiomas soportados | multilingue: hebreo (principal), ingles, espanol, italiano, aleman; segmentos mixtos |
| Licencia | MIT |
| Formato de pesos | ONNX (bundle de inferencia); pesos PyTorch/Safetensors en el repo notmax123/blue |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo (tipo de red, capas, mecanismo de atención o componentes de difusión/vocoder) en los materiales proporcionados. El repositorio se presenta como un *bundle* de inferencia ONNX, lo que indica que el modelo ha sido exportado desde un entrenamiento previo en PyTorch; los pesos originales y las estadísticas de entrenamiento se encuentran en el repositorio notmax123/blue, pero sus detalles no están incluidos en la información disponible.

Tampoco se especifican el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. La única innovación técnica documentada es el uso de un modelo G2P específico para hebreo (renikud) que resuelve el nikud y los homógrafos en tiempo de inferencia, junto con la posibilidad de ejecutar los grafos ONNX en ONNX Runtime o compilarlos a TensorRT para reducir latencia en GPU.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) con calidad nativa orientada al hebreo, incluyendo nikud y desambiguación de homógrafos.
- Soporte multilingüe: hebreo, inglés, español, italiano y alemán, con posibilidad de mezclar idiomas en una misma locución.
- Inferencia en CPU y GPU mediante ONNX Runtime, con motores TensorRT opcionales para NVIDIA.
- Modo de inferencia rápida (etiqueta `fast-inference`) orientado a aplicaciones en tiempo real y procesamiento por lotes.
- Selección de estilo de voz mediante ficheros JSON (`voices/female1.json` en el ejemplo de la model card), lo que sugiere voces o estilos predefinidos.
- Generación de audio en formato WAV a través de la API de Python (`BlueTTS.synthesize`), con salida de muestras y frecuencia de muestreo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de contenidos en hebreo para audiolibros y prensa: el modelo está optimizado para nikud y homógrafos, por lo que puede narrar textos vocalizados o sin vocalizar con una pronunciación más fiable que un TTS genérico; el procesamiento por lotes permite convertir capítulos completos en minutos en CPU.
- Accesibilidad para personas con discapacidad visual en aplicaciones en hebreo: la inferencia en CPU con ONNX Runtime permite integrar el TTS en lectores de pantalla o aplicaciones de escritorio sin depender de GPU ni de servicios en la nube.
- Asistentes de voz y chatbots locales: la baja latencia (RTF alto en RTX 3090 y aceptable en CPU) y la licencia MIT permiten desplegar el modelo en entornos on-premise donde no se puede enviar texto a APIs externas.
- Doblaje y producción de audio multilingüe: al admitir hebreo, inglés, español, italiano y alemán en una misma locución, se puede generar una pista de voz con cambios de idioma sin segmentar manualmente el texto.
- Sistemas de anuncios y megafonía (broadcasting): la generación rápida por lotes permite producir avisos pregrabados o dinámicos para transporte público, aeropuertos o comercios.
- Prototipado e investigación en TTS: al publicarse los pesos de entrenamiento en un repositorio separado y el bundle ONNX para inferencia, un equipo puede evaluar el modelo, exportar nuevas voces en JSON y comparar el rendimiento de ONNX Runtime frente a TensorRT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks objetivos (MOS, WER, MCD, etc.) en la información disponible. La model card incluye únicamente cifras indicativas de velocidad:

| Hardware | Velocidad aproximada | ~1 h de audio |
|---|---|---|
| NVIDIA RTX 3090 (GPU) | RTF muy alto | del orden de segundos |
| CPU típica | RTF alto | del orden de minutos |
| Apple M1 (clase) | RTF alto | del orden de pocos minutos |

Estas cifras son orientativas y dependen del hardware, del batching y de la configuración de ONNX Runtime o TensorRT.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (2,2 GB) da una cota superior aproximada del espacio en disco necesario para los pesos, pero no se especifica el consumo en memoria durante la inferencia.
- GPU recomendadas: la model card cita una NVIDIA RTX 3090 como referencia de alto rendimiento; se mencionan motores TensorRT opcionales para NVIDIA, lo que sugiere compatibilidad con GPUs Ampere o superiores (A100, H100, RTX 4090) sin datos concretos de rendimiento.
- CPU: el modelo está diseñado para funcionar en CPU típica con RTF alto, por lo que cabe en equipos sin GPU dedicada.
- Apple Silicon: se reporta un rendimiento "fuerte" en Apple M1, del orden de pocos minutos por hora de audio.
- Opciones de despliegue: ONNX Runtime (principal), TensorRT (opcional, vía el repositorio de GitHub) y la API de Python del proyecto BlueTTS (`src.blue_onnx.BlueTTS`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: solo se ofrecen las estimaciones cualitativas de la tabla anterior; no hay cifras de RTF numéricas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones internas (parámetros, contexto) que permitan una comparación cuantitativa rigurosa con otros modelos TTS. A continuación se indica la comparación cualitativa posible según la información disponible:

| Modelo | Enfoque | Hebreo nativo | Licencia | Formato |
|---|---|---|---|---|
| Blue ONNX (BlueTTS) | TTS multilingüe con foco en hebreo | Sí (nikud y homógrafos) | MIT | ONNX |
| Alternativas TTS genéricas | TTS multilingüe de propósito general | No disponible | Variable | Variable |

No se identifican en la información proporcionada modelos comparables concretos con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al ser un TTS entrenado con corpus no especificados, puede reproducir sesgos de pronunciación o prosodia presentes en los datos.
- Riesgo de alucinación en el sentido de pronunciaciones incorrectas o prosodia anómala en palabras fuera del vocabulario o en textos sin nikud; el uso del modelo renikud es necesario para mitigar parte de este problema en hebreo.
- El bundle ONNX no incluye el modelo G2P de hebreo (renikud), que debe descargarse por separado desde otro repositorio; sin él, la calidad en hebreo puede degradarse.
- Los pesos para entrenamiento y ajuste fino no están en este repositorio, sino en notmax123/blue; quien necesite reentrenar debe consultar ese repositorio.
- No se especifican límites de longitud de texto por inferencia ni requisitos de memoria; conviene validar el comportamiento con textos largos antes de usarlo en producción.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad sobre el uso del audio generado (por ejemplo, suplantación de voz) recae en el integrador.
- El repositorio tiene 0 descargas y 3 likes en el momento de la consulta, por lo que la validación comunitaria es muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/notmax123/blue-onnx
- Pesos PyTorch/Safetensors: https://huggingface.co/notmax123/blue
- Repositorio del proyecto BlueTTS: https://github.com/maxmelichov/BlueTTS
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/notmax123/BlueV2
- Sitio web del proyecto: https://lightbluetts.com/
- Modelo renikud (G2P para hebreo): https://huggingface.co/thewh1teagle/renikud
- ONNX Runtime: https://onnxruntime.ai/
