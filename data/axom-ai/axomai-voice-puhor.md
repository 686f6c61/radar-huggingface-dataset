# axom-ai/axomai-voice-puhor

## Resumen

AxomAI Voice Puhor es un modelo de síntesis de voz (text-to-speech) desarrollado por axom-ai, especializado en el idioma asamés (código ISO `as`). Se distribuye en HuggingFace con pesos en formato safetensors y está construido sobre la arquitectura F5-TTS, un sistema de TTS basado en flow matching con un transformer de difusión (DiT) como backbone generativo. El modelo cuenta con 350.681.834 parámetros totales y un repositorio de 6,9 GB, lo que sugiere pesos en precisión completa o fp32 junto con posibles checkpoints auxiliares (vocoder, tokenizador fonético, etc.).

El modelo resuelve un problema de nicho: la escasez de sistemas TTS de calidad para lenguas de bajos recursos como el asamés, hablado principalmente en el estado de Assam (India) por más de 15 millones de personas. Frente a los TTS multilingües genéricos, que suelen degradar la pronunciación y la prosodia en lenguas no representadas en sus datos de entrenamiento, Puhor se presenta como un modelo entrenado específicamente sobre un dataset asamés personalizado (`custom-assamese`), con la promesa de "zero-hallucination" en la generación de audio.

Es relevante ahora porque la combinación de flow matching con DiT permite una síntesis de alta fidelidad con un número de pasos de muestreo reducido en comparación con los modelos de difusión clásicos, y porque la licencia es propietaria (`axom-ai-proprietary`) con acceso restringido (gated), lo que condiciona su uso a la aceptación de términos en HuggingFace. El modelo se publicó el 1 de noviembre de 2026 y, en el momento de redactar esta ficha, registra 2 descargas y 0 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | F5-TTS (flow matching con Diffusion Transformer, DiT) |
| Parámetros totales | 350.681.834 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | asamés (`as`) |
| Licencia | axom-ai-proprietary (acceso restringido, gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en F5-TTS, una arquitectura de síntesis de voz que combina flow matching con un Diffusion Transformer (DiT). En lugar de predecir directamente mel-espectrogramas mediante regresión, F5-TTS aprende un campo de velocidad que transforma ruido gaussiano en la representación acústica objetivo a través de una ODE resuelta con un integrador numérico. El uso de un transformer como backbone (en lugar de las U-Net habituales en modelos de difusión) permite modelar dependencias de largo alcance en la secuencia de audio y escalar de forma más limpia con el número de parámetros. Los 350,7 millones de parámetros indican un modelo de tamaño medio, coherente con la variante base de F5-TTS.

Respecto al entrenamiento, la información disponible solo indica que se utilizó un dataset personalizado asamés (`dataset:custom-assamese`). No se especifican el número de horas de audio, la composición del corpus, si hubo etapas de fine-tuning sobre un checkpoint F5-TTS preentrenado o si se aplicaron técnicas de alineación como RLHF (poco habituales en TTS). La etiqueta `zero-hallucination` sugiere que el equipo trabajó en mitigar la generación de contenido acústico no presente en el texto de entrada, un problema conocido en TTS neuronales cuando el texto contiene caracteres fuera del vocabulario o secuencias ambiguas. Tampoco se detalla el vocoder utilizado para convertir la representación mel en forma de onda, ni el tokenizador fonético empleado para el asamés.

## Capacidades

- Síntesis de voz a partir de texto en asamés, con salida de audio en formato waveform.
- Generación de habla con prosodia y pronunciación adaptadas específicamente al asamés, al haberse entrenado sobre un corpus de ese idioma.
- Modo de inferencia basado en flow matching, que permite ajustar el número de pasos de integración para equilibrar calidad y latencia.
- Orientación a "zero-hallucination": el modelo está diseñado para evitar la inserción de audio no correspondiente al texto de entrada.
- Compatibilidad con endpoints de HuggingFace (`endpoints_compatible`), lo que facilita el despliegue como servicio gestionado.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, capacidades ajenas al dominio TTS.
- No se documenta clonación de voz zero-shot ni control de estilo, aunque la arquitectura F5-TTS subyacente suele soportar referencia de hablante; la información disponible no lo confirma para este checkpoint.

## Casos de uso

- Lectura de contenido web y artículos en asamés: el modelo puede convertir texto de páginas, blogs o noticias en audio, facilitando el acceso a información escrita a personas con baja alfabetización o preferencia por el consumo auditivo en Assam.
- Audiolibros y narración de textos largos: al estar entrenado específicamente en asamés, mantiene una pronunciación más fiable que un TTS multilingüe genérico, lo que reduce la necesidad de revisión manual de la locución.
- Asistentes de voz para atención al ciudadano: integrado en sistemas de información pública (trámites, avisos meteorológicos, alertas sanitarias) para emitir respuestas habladas en asamés a consultas de usuarios.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de interfaces, documentos y correos electrónicos en asamés dentro de lectores de pantalla o aplicaciones móviles.
- Generación de material educativo: producción de lecciones y ejercicios de pronunciación para escuelas de Assam, donde los recursos TTS en lengua local son escasos.
- Doblaje y locución de bajo coste: creación de pistas de voz para vídeos divulgativos, anuncios institucionales o contenido de YouTube en asamés, con la ventaja de la etiqueta "zero-hallucination" para evitar inserciones de audio espurias en producciones automatizadas.
- Investigación lingüística y preservación del idioma: generación de corpus de audio sintético controlado para estudios fonéticos o para aumentar datasets de ASR en asamés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 350,7 millones de parámetros, los pesos en fp32 ocupan aproximadamente 1,4 GB; en fp16, unos 0,7 GB. A ello hay que sumar el vocoder, el tokenizador fonético y los buffers de activación durante la integración ODE, por lo que una estimación conservadora sitúa el pico de VRAM en el rango de 2 a 4 GB en fp32 y de 1,5 a 3 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia en fp16. Para despliegue en producción con concurrencia, se recomiendan tarjetas como A10G, L4, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 (12 GB) y superiores; también en GPUs integradas con suficiente memoria compartida, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo F5-TTS con pesos safetensors, el camino natural es usar la implementación de referencia de F5-TTS (repositorio oficial en GitHub) o cargarlo mediante `transformers` si la comunidad ha añadido soporte. Para servicio gestionado, HuggingFace Inference Endpoints está indicado por la etiqueta `endpoints_compatible`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a LLM y no a TTS.
- Latencia y throughput: no disponibles en la información proporcionada. La latencia dependerá del número de pasos de integración configurados en el sampler de flow matching y de la duración del audio generado.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Arquitectura | Licencia | Acceso |
|---|---|---|---|---|---|
| AxomAI Voice Puhor | 350,7 M | asamés | F5-TTS (flow matching + DiT) | propietaria (axom-ai-proprietary) | gated |
| F5-TTS (base, SWivid) | ~336 M | multilingüe (inglés, chino) | F5-TTS (flow matching + DiT) | CC-BY-NC 4.0 | abierto |
| XTTS-v2 (Coqui) | ~467 M | 17 idiomas (no asamés) | autoregresiva + VQ-VAE | Coqui Public Model License | abierto |
| VITS / MMS-TTS (Meta) | ~30-80 M por idioma | más de 1.100 idiomas (incluye asamés en MMS) | VITS (VAE + GAN + flow) | CC-BY-NC 4.0 | abierto |

La comparativa se basa en características públicas de los modelos alternativos; no se dispone de métricas de calidad (MOS, WER, similitud de hablante) para Puhor que permitan una comparación cuantitativa. Frente a MMS-TTS, que cubre el asamés con un modelo mucho más pequeño, Puhor apuesta por una arquitectura generativa más moderna y un mayor número de parámetros, a costa de una licencia propietaria y acceso restringido. Frente a XTTS-v2, la diferencia clave es la cobertura del asamés, ausente en el modelo de Coqui.

## Limitaciones y advertencias

- Licencia propietaria (`axom-ai-proprietary`): el uso comercial está sujeto a los términos que el usuario debe aceptar en HuggingFace; no es una licencia de código abierto y puede restringir la redistribución, el fine-tuning o el despliegue en productos de terceros.
- Acceso restringido (gated): es necesario solicitar acceso y aceptar las condiciones en la página del modelo antes de descargar los pesos.
- Cobertura monolingüe: solo soporta asamés (`as`); no se debe esperar un rendimiento aceptable en otros idiomas ni en code-switching con inglés o bengalí, habituales en el contexto de Assam.
- Riesgo de alucinación: aunque el modelo se etiqueta como "zero-hallucination", ningún TTS neuronal está exento de generar artefactos, repeticiones o audio espurio ante textos fuera de dominio, siglas, números o préstamos léxicos no vistos en el corpus de entrenamiento.
- Sesgos: al entrenarse sobre un dataset asamés personalizado no documentado, puede reproducir sesgos de género, dialecto o registro presentes en el corpus (por ejemplo, favorecer una variedad regional concreta del asamés).
- Falta de transparencia: no se publican detalles sobre el dataset (horas, hablantes, licencias de las grabaciones), lo que dificulta evaluar la calidad, la diversidad de voces y el cumplimiento de derechos de imagen o voz.
- Contexto y longitud de entrada: no se especifica la longitud máxima de texto por inferencia; en arquitecturas F5-TTS es habitual segmentar textos largos, lo que puede introducir discontinuidades prosódicas entre fragmentos.
- Madurez: con 2 descargas y 0 likes en el momento de la ficha, no hay evidencia comunitaria de robustez en producción ni reportes independientes de calidad.
- Compatibilidad de despliegue limitada: no se documenta soporte en runtimes de inferencia ampliamente adoptados (vLLM, TGI, llama.cpp), lo que puede requerir integrar el código de referencia de F5-TTS.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axom-ai/axomai-voice-puhor
- Repositorio oficial de F5-TTS (arquitectura base): https://github.com/SWivid/F5-TTS
- Paper de F5-TTS: https://arxiv.org/abs/2410.06885
- Perfil del autor en HuggingFace: https://huggingface.co/axom-ai
