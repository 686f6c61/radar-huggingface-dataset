# mradermacher/mova-tts-GGUF

## Resumen

mova-tts-GGUF es la versión cuantizada en formato GGUF del modelo Mikhailo/mova-tts, un sistema de síntesis de voz (text-to-speech) con capacidad de clonación de voz especializado en ucraniano. La cuantización la ha realizado mradermacher, un autor habitual en la comunidad de llama.cpp que publica versiones estáticas de modelos para su uso con herramientas de inferencia local. El modelo original cuenta con 747.930.496 parámetros (aproximadamente 748 millones) y se distribuye bajo licencia Apache 2.0.

El interés de esta publicación reside en que permite ejecutar un modelo de TTS con clonación de voz en hardware de consumo mediante llama.cpp y el formato GGUF, algo poco habitual en el ecosistema de síntesis de voz, donde predominan formatos como safetensors y frameworks como PyTorch o ONNX. Los cuantizados disponibles van desde Q2_K (0,6 GB) hasta f16 (1,6 GB), lo que reduce drásticamente los requisitos de memoria frente a los pesos originales.

La ficha se centra en la versión GGUF publicada por mradermacher, aunque la información técnica disponible sobre el modelo original es limitada: la model card del cuantizado es fundamentalmente una plantilla de publicación de cuantizaciones y no detalla la arquitectura interna, los datos de entrenamiento ni los resultados de evaluación del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de text-to-speech; la model card no detalla la arquitectura interna) |
| Parametros totales | 747.930.496 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ucraniano (uk) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas a partir de los pesos originales en transformers/safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original Mikhailo/mova-tts en la documentación proporcionada. Los metadatos lo etiquetan como modelo de text-to-speech con clonación de voz y lo asocian a la familia "neutts", lo que sugiere un diseño orientado a la síntesis neuronal de habla, pero la model card no especifica si se trata de un transformer autorregresivo, un modelo basado en difusión, un sistema híbrido o una arquitectura tipo VITS/Tacotron. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino supervisado.

La contribución técnica de esta publicación es la conversión a GGUF y la generación de cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor indica que no ha generado cuantizaciones ponderadas con imatrix en el momento de la publicación, y que podría no hacerlo si no aparecen en la semana siguiente a las estáticas. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en ucraniano.
- Clonación de voz, según las etiquetas de la model card del modelo base.
- Integración con llama.cpp y el ecosistema GGUF para inferencia local.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`).
- Uso conversacional (etiqueta `conversational`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; se trata de un modelo especializado en TTS.

## Casos de uso

- Síntesis de voz en ucraniano para aplicaciones de accesibilidad: el modelo puede convertir texto a audio para lectores de pantalla o asistentes de lectura, con la ventaja de ejecutarse en local mediante llama.cpp y cuantizaciones de menos de 1 GB.
- Clonación de voz para doblaje y localización de contenido: gracias a la capacidad de voice cloning, se puede generar audio con una voz de referencia para vídeos, audiolibros o material formativo en ucraniano.
- Asistentes de voz embebidos en dispositivos de consumo: los cuantizados Q4_K_S o Q4_K_M (0,7 GB) permiten desplegar TTS en equipos con poca VRAM o incluso en CPU, sin depender de servicios en la nube.
- Generación de audionoticias o podcasts automatizados: un pipeline puede tomar texto de un CMS y producir narración en ucraniano con una voz consistente, usando Q8_0 o Q6_K para mayor calidad.
- Prototipado de interfaces conversacionales: la etiqueta `conversational` y la compatibilidad con endpoints facilitan integrar el modelo en un backend de diálogo por voz junto a un LLM y un ASR.
- Investigación en síntesis de voz para lenguas eslavas: el modelo sirve como base para experimentos de clonación y evaluación de calidad en ucraniano, con la ventaja de disponer de múltiples niveles de cuantización para comparar el impacto en la calidad del audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB con Q2_K, Q3_K_S, IQ4_XS, Q3_K_M o Q3_K_L; unos 0,7 GB con Q4_K_S, Q4_K_M, Q5_K_S o Q5_K_M; unos 0,9 GB con Q6_K o Q8_0; y unos 1,6 GB con f16. Estas cifras corresponden al tamaño de los ficheros GGUF y no incluyen el overhead del runtime ni buffers de audio.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM debería poder cargar los cuantizados de 4 bits; para f16 se recomienda al menos 2-3 GB libres. No se dispone de datos específicos de rendimiento en A100, H100 o RTX 4090.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); la etiqueta `transformers` indica que el modelo base es compatible con esa librería, pero los ficheros GGUF están pensados para llama.cpp. No se confirma soporte en vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye referencias a alternativas de TTS en ucraniano ni a otros modelos de la misma familia con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mova-tts-GGUF (este) | 747.930.496 | no disponible | apache-2.0 | GGUF | TTS con clonación de voz en ucraniano |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información disponible |

## Limitaciones y advertencias

- La model card del cuantizado no documenta sesgos conocidos del modelo; al ser un modelo de voz entrenado presumiblemente con datos de hablantes reales, existe riesgo de sesgos de acento, género y procedencia en la clonación.
- Riesgo de alucinación en el sentido de artefactos de audio, pronunciación incorrecta o prosodia anómala, especialmente en cuantizaciones agresivas como Q2_K o Q3_K_S.
- El soporte de idioma se limita al ucraniano (uk); no se garantiza un comportamiento correcto con texto en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y las condiciones del modelo base Mikhailo/mova-tts, así como los derechos sobre las voces de referencia empleadas en la clonación.
- La clonación de voz plantea riesgos de suplantación de identidad y deepfakes; es responsabilidad del integrador aplicar consentimiento y medidas de verificación.
- El autor no ha publicado cuantizaciones ponderadas con imatrix; las estáticas pueden presentar una calidad inferior a las ponderadas en los tamaños pequeños.
- No se dispone de información sobre latencia, throughput ni calidad objetiva (MOS) para planificar un despliegue en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/mova-tts-GGUF
- Modelo base: https://huggingface.co/Mikhailo/mova-tts
- Página de descargas del autor: https://hf.tst.eu/model#mova-tts-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de comparación de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Web del patrocinador (nethype GmbH): https://www.nethype.de/
