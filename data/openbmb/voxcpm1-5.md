# openbmb/VoxCPM1.5

## Resumen

VoxCPM1.5 es un sistema de síntesis de voz (text-to-speech) desarrollado por OpenBMB que emplea un enfoque *tokenizer-free*: en lugar de convertir el audio a tokens discretos, modela el habla en un espacio continuo mediante una arquitectura de difusión autorregresiva. Está construido sobre el backbone de lenguaje MiniCPM4-0.5B y suma un módulo de difusión (LocDiT) que genera representaciones acústicas continuas, con un VAE de audio que opera a 44,1 kHz. El modelo tiene 801,7 millones de parámetros totales y se distribuye en safetensors bajo licencia Apache 2.0.

La propuesta central es doble: generación de habla consciente del contexto (infiere prosodia y estilo a partir del texto) y clonación de voz zero-shot fiel a partir de una muestra corta de referencia, capturando timbre, acento, tono emocional y ritmo. Frente a la versión original VoxCPM, la 1.5 eleva la frecuencia de muestreo del VAE de 16 kHz a 44,1 kHz y reduce la tasa de tokens del LM de 12,5 Hz a 6,25 Hz (con patch size 4), lo que abarata el cómputo manteniendo la calidad.

Es relevante ahora porque ofrece una alternativa abierta y ligera (menos de 1.000 millones de parámetros) a sistemas TTS propietarios, con soporte de streaming (RTF de hasta 0,17 en una RTX 4090) y capacidad de ajuste fino mediante SFT y LoRA. Está entrenado sobre un corpus bilingüe de 1,8 millones de horas en inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión autorregresiva end-to-end sobre backbone MiniCPM4-0.5B con módulo LocDiT y VAE de audio (tokenizer-free) |
| Parametros totales | 801.729.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de audio | 44,1 kHz (VAE de audio) |
| Tasa de tokens del LM | 6,25 Hz (patch size 4) |
| Modelo base | openbmb/MiniCPM4-0.5B |
| Tamaño del repositorio | 1,9 GB |
| Librería | voxcpm |

## Arquitectura y entrenamiento

VoxCPM1.5 es un sistema TTS *tokenizer-free* que combina un modelo de lenguaje jerárquico (MiniCPM4-0.5B) con un módulo de difusión autorregresiva denominado LocDiT. En lugar de discretizar el habla en tokens, el modelo genera directamente representaciones continuas del audio, que un VAE de audio a 44,1 kHz convierte en forma de onda. El desacoplamiento semántico-acústico se logra de forma implícita mediante el modelado de lenguaje jerárquico y restricciones FSQ, lo que según el autor mejora la expresividad y la estabilidad de la generación.

El entrenamiento se realizó sobre un corpus bilingüe (inglés y chino) de 1,8 millones de horas. La model card menciona soporte de SFT y LoRA para ajuste fino, pero no detalla la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Entre las innovaciones técnicas destacan la reducción de la tasa de tokens del LM a 6,25 Hz (frente a 12,5 Hz en VoxCPM), el aumento del patch size a 4 y el VAE a 44,1 kHz, que preserva más detalle en frecuencias altas para la clonación de voz.

## Capacidades

- Síntesis de voz a partir de texto con prosodia inferida del contenido (generación consciente del contexto).
- Clonación de voz zero-shot a partir de una muestra corta de audio de referencia, capturando timbre, acento, emoción, ritmo y velocidad.
- Síntesis en streaming con factor de tiempo real (RTF) de hasta 0,17 en una RTX 4090.
- Soporte de ajuste fino mediante SFT y LoRA para voces personalizadas.
- Capacidades bilingües: inglés y chino.
- Control de generación mediante parámetros como `cfg_value` (guía del LM sobre LocDiT), `inference_timesteps` (pasos de difusión) y umbrales de reintento para casos problemáticos.
- Integración opcional con herramientas externas de normalización de texto (TN) y reducción de ruido (denoise), así como con ZipEnhancer y SenseVoice-Small para el preprocesado de prompts de voz en la demo web.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá del prompt de referencia para clonación.

## Casos de uso

- Clonación de voz para doblaje y localización: con una muestra corta de referencia, el modelo replica el timbre y el estilo del hablante original, lo que permite generar versiones en inglés o chino de contenido audiovisual manteniendo la identidad vocal.
- Asistentes de voz en tiempo real: gracias al streaming y a un RTF de 0,17 en RTX 4090, puede integrarse en pipelines de respuesta por voz con latencia baja para atención al cliente o interfaces conversacionales.
- Audiolibros y narración automática: la generación consciente del contexto ajusta la prosodia al contenido del texto, produciendo una lectura natural sin necesidad de etiquetado manual de estilos.
- Accesibilidad y lectura de pantalla: síntesis de alta calidad a 44,1 kHz para convertir texto en voz en aplicaciones de accesibilidad, con voces personalizables mediante LoRA.
- Generación de contenido para medios y publicidad: creación rápida de locuciones en inglés y chino con control de estilo y emoción a partir del texto, útil para prototipado de anuncios o vídeos.
- Investigación en TTS: al ser un modelo abierto con licencia Apache 2.0 y soporte de SFT/LoRA, sirve como base para experimentación académica en modelado continuo del habla y clonación de voz.
- Preprocesado de datos de voz: combinado con ZipEnhancer y SenseVoice-Small, puede formar parte de pipelines de limpieza y transcripción de muestras de referencia antes de la clonación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta métricas de eficiencia: un RTF de hasta 0,17 en una GPU de consumo NVIDIA RTX 4090 con síntesis en streaming, y una tasa de tokens del LM de 6,25 Hz con patch size 4.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 801,7 millones de parámetros en safetensors (repo de 1,9 GB), la inferencia en precisión nativa requiere del orden de 2-4 GB de VRAM, aunque el dato exacto no está publicado.
- GPU recomendadas: NVIDIA RTX 4090 para streaming en tiempo real (RTF 0,17 según el autor); se espera que GPU de datacenter como A100 o H100 ofrezcan mayor throughput, aunque no se publican cifras.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM, aunque el requisito exacto no está documentado.
- Opciones de despliegue: paquete oficial `voxcpm` instalable desde PyPI (`pip install voxcpm`), con carga vía `VoxCPM.from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: RTF de hasta 0,17 en RTX 4090 con streaming; no se publican más cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| VoxCPM1.5 (OpenBMB) | 801,7 M | no disponible | en, zh | Apache 2.0 | TTS tokenizer-free con difusión autorregresiva y clonación zero-shot |
| VoxCPM-0.5B (OpenBMB) | no disponible | no disponible | en, zh | Apache 2.0 | Versión anterior, VAE a 16 kHz y 12,5 Hz de tokens |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse en un corpus bilingüe inglés-chino, puede reflejar sesgos de esos datos.
- Riesgo de alucinación: en TTS se traduce en prosodia inadecuada, artefactos o generaciones que no terminan; el modelo incluye un modo de reintento (`retry_badcase`) para casos problemáticos.
- Limitaciones de idioma: solo inglés y chino; no se documenta soporte para castellano ni otras lenguas.
- Calidad dependiente del prompt: el autor advierte que la calidad de salida depende de la calidad del audio de referencia para la clonación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la clonación de voz plantea riesgos éticos y legales (suplantación de identidad, consentimiento del hablante) que deben gestionarse en producción.
- El modo `denoise` puede introducir distorsión y restringe la frecuencia de muestreo a 16 kHz, degradando la ventaja del VAE a 44,1 kHz.
- El modo `normalize` desactiva el soporte nativo de texto en bruto, por lo que requiere herramientas externas de normalización de texto.
- No se documentan requisitos de contexto, cuantizaciones ni benchmarks, lo que dificulta la planificación de despliegues a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/VoxCPM1.5
- Repositorio GitHub: https://github.com/OpenBMB/VoxCPM/
- Informe técnico (arXiv): https://arxiv.org/abs/2509.24650
- Demo en vivo: https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Página de muestras de audio: https://openbmb.github.io/VoxCPM-demopage
- Documentación OpenBMB: https://openbmb.cn/docs/
- Modelo en ModelScope: https://modelscope.cn/models/OpenBMB/VoxCPM1.5
- Modelo base MiniCPM4-0.5B: https://huggingface.co/openbmb/MiniCPM4-0.5B
