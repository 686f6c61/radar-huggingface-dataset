# Phoonnx/vits-tw-mms_simba_asanti-graphemes

## Resumen

`Phoonnx/vits-tw-mms_simba_asanti-graphemes` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por GhanaNLP bajo el nombre `ghananlpcommunity/Simba-TTS-twi-asanti` y reempaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo está especializado en la lengua twi (código ISO `tw`), concretamente en la variante asante (akan), hablada principalmente en Ghana.

El problema que resuelve es la falta de sistemas TTS de calidad para lenguas de bajos recursos: el twi cuenta con pocos recursos digitales y este modelo permite convertir texto en grafemas a voz sintética sin necesidad de un paso intermedio de fonemización, lo que simplifica el pipeline. El repositorio es de tamaño reducido (0,1 GB), lo que sugiere un modelo compacto orientado a inferencia ligera y despliegue en entornos con recursos limitados.

La relevancia actual radica en su empaquetado ONNX y su integración con el ecosistema phoonnx/OVOS, que facilita el despliegue en asistentes de voz de código abierto. No obstante, el propio autor indica que el índice de voces de phoonnx no lista una voz para este modelo, lo que limita su uso directo sin configuración adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de tokens) |
| Tipos de cuantizacion | no disponible (formato ONNX; se desconoce si incluye variantes cuantizadas) |
| Idiomas soportados | twi (código `tw`), variante asante |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en VITS, una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. VITS permite generar audio directamente desde texto sin necesidad de un vocoder externo, lo que reduce la latencia y simplifica el despliegue. La variante `graphemes` indica que la entrada se procesa directamente a nivel de grafemas, sin fonemización intermedia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El modelo procede del proyecto Simba-TTS de GhanaNLP, orientado a lenguas ghanesas, pero los detalles concretos del corpus de entrenamiento no están publicados en la información disponible.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en twi (variante asante).
- Procesamiento directo de grafemas, sin necesidad de fonemizador externo.
- Generación de audio end-to-end mediante VITS (texto a waveform en un solo paso).
- Integración con la librería phoonnx para inferencia en Python y en el ecosistema OVOS.
- Ejecución mediante ONNX Runtime, lo que permite despliegue en CPU y GPU.
- No se han documentado capacidades de clonación de voz, control de estilo, emoción ni multilingüismo.

## Casos de uso

- **Accesibilidad para hablantes de twi**: conversión de texto digital (noticias, documentos, mensajes) a voz sintética para personas con discapacidad visual o dificultades de lectura en Ghana.
- **Asistentes de voz en OVOS**: integración como motor TTS en asistentes de código abierto que necesiten responder en twi, aprovechando el empaquetado nativo para phoonnx.
- **Locución automatizada de contenidos educativos**: generación de audio para materiales escolares en lengua akan, reduciendo el coste de grabación profesional.
- **Sistemas de anuncios públicos**: síntesis de avisos y comunicaciones institucionales en twi para difusión radiofónica o altavoces en espacios públicos.
- **Preservación lingüística**: creación de corpus de audio sintético en twi para investigación lingüística y documentación de la lengua.
- **Prototipado de aplicaciones de voz de bajo coste**: al ser un modelo compacto (0,1 GB) en ONNX, puede ejecutarse en dispositivos con recursos limitados para demos y pruebas de concepto.
- **Integración en pipelines de accesibilidad web**: generación de audio bajo demanda para sitios web dirigidos a comunidades akan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; por el tamaño del repositorio (0,1 GB), el modelo es muy ligero y probablemente cabe en menos de 1 GB de memoria durante la inferencia.
- **GPU recomendadas**: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es más que suficiente; también puede ejecutarse en CPU.
- **Consumer GPU**: sí, cabe en cualquier GPU consumer e incluso en dispositivos de borde (Raspberry Pi, según el soporte de ONNX Runtime).
- **Opciones de despliegue**: ONNX Runtime, librería phoonnx (Python y OVOS). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/vits-tw-mms_simba_asanti-graphemes | VITS | twi (asante) | cc-by-4.0 | ONNX | Hugging Face |
| ghananlpcommunity/Simba-TTS-twi-asanti | VITS | twi (asante) | cc-by-4.0 | no disponible (upstream) | Hugging Face |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | variable | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Cobertura lingüística limitada**: solo soporta twi (variante asante); no es multilingüe.
- **Sin voz configurada en phoonnx**: el índice de voces de phoonnx no lista una voz para este modelo, lo que puede requerir configuración manual para su uso.
- **Riesgo de alucinación acústica**: como todo modelo TTS, puede generar pronunciaciones incorrectas ante palabras fuera del vocabulario de entrenamiento o grafemas ambiguos.
- **Sesgos de datos**: al entrenarse con un corpus limitado de twi, puede reflejar sesgos de género, dialecto o registro presentes en los datos originales.
- **Licencia CC-BY-4.0**: permite uso comercial con atribución; es necesario citar a GhanaNLP y Phoonnx según los términos.
- **Documentación escasa**: no se publican detalles de entrenamiento, parámetros ni benchmarks, lo que dificulta evaluar su calidad objetiva.
- **Sin soporte de control prosódico**: no se documentan capacidades de ajuste de emoción, velocidad o estilo.
- **Formato ONNX**: requiere ONNX Runtime; no es compatible directamente con frameworks como PyTorch o TensorFlow sin conversión.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-tw-mms_simba_asanti-graphemes)
- [Modelo upstream: ghananlpcommunity/Simba-TTS-twi-asanti](https://huggingface.co/ghananlpcommunity/Simba-TTS-twi-asanti)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
