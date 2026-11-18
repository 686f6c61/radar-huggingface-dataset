# ai4bharat/IndicF5

## Resumen

IndicF5 es un modelo de síntesis de voz (text-to-speech) desarrollado por AI4Bharat, el laboratorio de investigación en IA e ingeniería de lenguas indias del IIT Madras. El modelo está diseñado para generar habla natural en once lenguas indias (asamés, bengalí, guyaratí, maratí, hindi, canarés, malabar, oriya, panyabí, tamil y telugu), un ámbito tradicionalmente desatendido por los sistemas TTS comerciales centrados en inglés y chino.

Con aproximadamente 350 millones de parámetros, IndicF5 se posiciona como un modelo compacto y desplegable en hardware modesto, lo que lo hace atractivo para aplicaciones de accesibilidad, doblaje y asistentes de voz en el subcontinente. Su nombre hace referencia a la arquitectura F5-TTS, un modelo de difusión basado en flow matching sobre el que se construye.

Es relevante ahora porque cubre una brecha real: la mayoría de los TTS open source de calidad no cubren lenguas indias con cobertura amplia, y menos aún con licencia MIT. El modelo requiere acceso restringido (gated) en Hugging Face, aceptando las condiciones de uso antes de la descarga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | basada en F5-TTS (difusión con flow matching, tag `inf5` / `custom_code`) |
| Parámetros totales | 350.681.834 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones de la comunidad no confirmadas) |
| Idiomas soportados | asamés (as), bengalí (bn), guyaratí (gu), maratí (mr), hindi (hi), canarés (kn), malabar (ml), oriya (or), panyabí (pa), tamil (ta), telugu (te) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 1,4 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

IndicF5 sigue la estela de F5-TTS, un modelo de síntesis de voz basado en difusión con flow matching que genera espectrogramas mel a partir de texto y una referencia de audio (zero-shot voice cloning). El tag `inf5` y la presencia de `custom_code` en el repositorio indican que la implementación requiere código personalizado para cargar y ejecutar el modelo, no bastando con la clase estándar de transformers.

El entrenamiento se apoyó en los conjuntos de datos `ai4bharat/indicvoices_r` y `ai4bharat/Rasa`, ambos corpus de habla india de AI4Bharat. No se dispone en la información proporcionada del número exacto de horas de audio, la composición por lengua ni si se aplicaron etapas de RLHF o ajuste fino con preferencias; estos datos deben consultarse en la documentación oficial del repositorio. La innovación principal es la adaptación de un esquema de difusión moderna a un conjunto lingüístico amplio de lenguas indias con un modelo de tamaño contenido.

## Capacidades

- Síntesis de voz (text-to-speech) en once lenguas indias.
- Clonación de voz zero-shot a partir de un audio de referencia, según el paradigma F5-TTS.
- Generación de habla natural con prosodia aprendida de corpus reales (IndicVoices-R, Rasa).
- Soporte multilingüe dentro de las once lenguas listadas; no se documenta mezcla de código (code-switching) en la información disponible.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso: es un modelo puramente TTS.
- No se documentan capacidades de visión, audio de entrada más allá de la referencia de voz, ni modo "thinking".

## Casos de uso

- Accesibilidad para personas con discapacidad visual: convertir texto en habla en lenguas indias donde los lectores de pantalla comerciales tienen cobertura limitada; el tamaño de 350 M permite ejecución local en dispositivos modestos.
- Doblaje y locución automatizada: generar pistas de voz para vídeos, cursos y audiolibros en hindi, tamil, telugu, etc., usando una muestra de referencia para mantener la identidad de voz del locutor.
- Asistentes de voz para atención al cliente: integrar el modelo en un pipeline ASR-LLM-TTS para responder en la lengua del usuario, con la ventaja de la licencia MIT para despliegue comercial.
- Sistemas de anuncios públicos y transporte: generar avisos hablados multilingües (por ejemplo, en estaciones o aeropuertos) a partir de plantillas de texto.
- Educación y aprendizaje de lenguas: producir material de audio de pronunciación en lenguas indias para plataformas educativas.
- Investigación en TTS multilingüe: servir como baseline open source para experimentos de adaptación, clonación y evaluación de prosodia en lenguas de bajos recursos.
- Prototipado rápido de interfaces de voz: al ser un modelo de 350 M y 1,4 GB, se puede desplegar en una GPU de consumo para demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 350 M en fp16 ocupa aproximadamente 0,7 GB de pesos; con overhead de activaciones y buffers de difusión, se estima un consumo en torno a 2-4 GB de VRAM, aunque no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente; se recomiendan RTX 3060/4060 o superiores para uso cómodo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; también podría ejecutarse en CPU, con mayor latencia.
- Opciones de despliegue: al requerir `custom_code`, la vía natural es cargar el modelo con la implementación oficial de F5-TTS/IndicF5; no se confirma soporte directo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| IndicF5 (ai4bharat) | 350 M | 11 lenguas indias | MIT | Basado en F5-TTS, acceso gated |
| F5-TTS (original) | ~330 M (estimado, no confirmado) | Principalmente inglés/chino | MIT (según proyecto original) | Referencia arquitectónica; no cubre lenguas indias |
| XTTS-v2 (Coqui) | no disponible | Multilingüe (~17 idiomas, sin lenguas indias amplias) | Coqui Public Model License (no comercial) | Clonación zero-shot; licencia restrictiva para uso comercial |
| VITS / MMS-TTS (Meta) | variable | MMS cubre muchas lenguas, incluidas indias | MIT / CC-BY-NC según variante | MMS-TTS tiene variantes indias, pero sin clonación zero-shot documentada |

La comparativa se basa en conocimiento general de estos proyectos; los datos exactos de parámetros y licencias de los alternativos deben verificarse en sus repositorios respectivos.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face antes de descargar; esto puede complicar pipelines automatizados.
- Requiere `custom_code`: no es un modelo plug-and-play con transformers estándar; hay que integrar la implementación específica.
- Cobertura lingüística limitada a once lenguas indias; no se documenta soporte de inglés ni de otras lenguas.
- Riesgo de alucinación acústica y artefactos en la síntesis, habitual en modelos de difusión TTS, especialmente con textos largos o fuera de dominio.
- Sesgos potenciales derivados de los corpus de entrenamiento (IndicVoices-R, Rasa): posible sobrerrepresentación de ciertos acentos, géneros o registros.
- Clonación de voz: implica riesgos de suplantación y uso indebido; aunque la licencia es MIT, conviene aplicar salvaguardas éticas y legales en producción.
- No se dispone de información sobre robustez ante code-switching, números, siglas o puntuación compleja.
- Aunque la licencia MIT permite uso comercial, el acceso gated y las condiciones de Hugging Face pueden imponer obligaciones adicionales que deben revisarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai4bharat/IndicF5
- Dataset IndicVoices-R: https://huggingface.co/datasets/ai4bharat/indicvoices_r
- Dataset Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- DOI: https://doi.org/10.57967/hf/9236
- Organización AI4Bharat: https://huggingface.co/ai4bharat
- Proyecto F5-TTS (referencia arquitectónica): no disponible en la información proporcionada
