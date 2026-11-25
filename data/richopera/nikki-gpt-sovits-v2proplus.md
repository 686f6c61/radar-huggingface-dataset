# Richopera/nikki-gpt-sovits-v2proplus

## Resumen

Nikki (暖暖) es un modelo de síntesis de voz (text-to-speech) entrenado con GPT-SoVITS v2ProPlus para reproducir la voz en chino del personaje Nikki, del videojuego *Shining Nikki*, tal como la interpreta la actriz de doblaje Chen Yiwen (陈奕雯). Lo desarrolla Richopera como un fine-tuning sobre el paquete base GPT-SoVITS de lj1995, y se distribuye como un par de checkpoints (GPT y SoVITS) que deben cargarse conjuntamente en un entorno GPT-SoVITS compatible con la versión v2ProPlus.

El modelo no es un LLM ni un TTS genérico de gran escala: es un adaptador de voz de un personaje concreto. El repositorio ocupa 0,8 GB e incluye cinco archivos de pesos, de los cuales el par recomendado es `nikki-e15.ckpt` (148,12 MiB, componente GPT) y `nikki_e8_s2112.pth` (164,76 MiB, componente SoVITS). El entrenamiento se realizó con el conjunto de datos `Richopera/Nikki-voice`, compuesto por 1.056 clips que suman 1 hora, 9 minutos y 15,721 segundos de audio en chino.

Su relevancia es acotada pero clara: permite generar locuciones con el timbre y la dicción de una voz de personaje concreta, con capacidad nativa de síntesis cruzada entre idiomas heredada de GPT-SoVITS, y con un flujo de inferencia que exige siempre un clip de referencia y su transcripción exacta. La licencia es restrictiva (Richopera Voice Model License v2.0), limitada a uso personal no comercial y con atribución obligatoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus (modelo GPT + modelo SoVITS, pipeline TTS de dos etapas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la referencia de audio recomendada es de 3 a 10 segundos) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints `.ckpt` y `.pth` en precision de entrenamiento) |
| Idiomas soportados | chino (`zh`) como idioma de entrenamiento; síntesis cruzada a otros idiomas heredada de GPT-SoVITS |
| Licencia | Richopera Voice Model License v2.0 (uso personal no comercial, atribucion obligatoria; redistribucion de pesos requiere permiso escrito) |
| Formato de pesos | `.ckpt` (GPT) y `.pth` (SoVITS) |
| Tamano del repositorio | 0,8 GB |
| Pesos recomendados | `nikki-e15.ckpt` (148,12 MiB) + `nikki_e8_s2112.pth` (164,76 MiB) |
| Pesos alternativos | `nikki-e5.ckpt`, `nikki-e10.ckpt`, `nikki_e4_s1056.pth` |
| Modelo base | `lj1995/GPT-SoVITS-windows-package` (fine-tuning) |
| Dataset de entrenamiento | `Richopera/Nikki-voice` (1.056 clips, 1 h 9 min 15,721 s) |
| Hardware de entrenamiento | Intel Core Ultra 9 275HX @ 2,70 GHz, 32 GB RAM, NVIDIA GeForce RTX 5070 Laptop GPU (8 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de GPT-SoVITS, un pipeline de síntesis de voz en dos componentes: un modelo GPT que modela la secuencia de tokens acústicos a partir del texto y de la referencia, y un modelo SoVITS (basado en VITS con cuantización de contenido) que convierte esas representaciones en la forma de onda final. La variante v2ProPlus es la versión del proyecto GPT-SoVITS que introduce mejoras sobre las anteriores y requiere checkpoints compatibles con esa revisión concreta; mezclar pesos de otras versiones provoca fallos de carga.

El entrenamiento se realizó con los ajustes por defecto de GPT-SoVITS v2ProPlus sobre 1.056 clips de audio en chino, con un total de 1 hora, 9 minutos y 15,721 segundos, procedentes de vídeos de la cuenta oficial de Bilibili y de grabaciones recopiladas por jugadores. El componente GPT se entrenó durante 15 épocas (pasos finales no registrados) y el componente SoVITS durante 8 épocas, alcanzando 2.112 pasos. No se documenta el uso de RLHF, DPO ni de un corpus adicional más allá del dataset de voz del personaje. La innovación técnica relevante no está en el modelo en sí, sino en el pipeline base: la clonación de voz con pocos segundos de referencia y la capacidad de síntesis cruzada entre idiomas que GPT-SoVITS hereda de su diseño.

## Capacidades

- Síntesis de voz (text-to-speech) en chino con el timbre y la dicción del personaje Nikki.
- Clonación de voz guiada por referencia: requiere un clip de 3 a 10 segundos, limpio, con un único hablante, sin música de fondo y con la menor reverberación posible, junto con su transcripción exacta.
- Síntesis cruzada entre idiomas: aunque se entrenó con voz en chino, el pipeline GPT-SoVITS permite generar texto en otros idiomas (la model card incluye ejemplos en inglés y japonés) manteniendo el timbre de la referencia.
- Control de velocidad de habla mediante los ajustes de inferencia y semillas aleatorias para variar la entrega.
- Generación de frases completas con mayor consistencia que fragmentos cortos, según las notas del autor.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un modelo de voz.
- No dispone de modo de razonamiento (thinking), visión ni audio de entrada más allá del clip de referencia.

## Casos de uso

- Doblaje de contenido de fans para el personaje: generar líneas de diálogo de Nikki para vídeos, cortometrajes o cómics animados no comerciales, usando un clip de referencia fijo para mantener el timbre consistente entre escenas.
- Mods y contenido derivado de *Shining Nikki*: sustituir o ampliar voces en proyectos de la comunidad, siempre que se respete la licencia no comercial y se atribuya a la actriz de doblaje y al entrenador del modelo.
- Audiolibros y narraciones cortas no comerciales: producir pasajes en chino con una voz de personaje reconocible, aprovechando que las frases completas generan resultados más estables que las locuciones sueltas.
- Pruebas de concepto de localización: evaluar cómo suena un texto traducido al inglés o al japonés con el timbre de la referencia, gracias a la síntesis cruzada de idiomas del pipeline GPT-SoVITS.
- Investigación en clonación de voz de pocos recursos: estudiar el comportamiento de un fine-tuning de 1 hora de audio sobre GPT-SoVITS v2ProPlus, comparando los distintos checkpoints publicados (`e5`, `e10`, `e15`).
- Demostraciones y prototipos de asistentes con voz de personaje: integrar el par de checkpoints en una WebUI GPT-SoVITS para validar flujos de generación antes de invertir en un modelo de voz con licencia comercial.
- Contenido educativo sobre TTS: ilustrar en talleres o cursos el proceso completo de preparación de dataset, entrenamiento y despliegue con GPT-SoVITS usando un caso real y acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (MOS, similitud de hablante, WER) ni comparaciones cuantitativas con otros modelos de voz; únicamente ofrece ocho muestras de audio generado con ajustes por defecto y pequeñas variaciones de velocidad y semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el par de pesos recomendado suma unos 313 MiB, por lo que la inferencia cabe holgadamente en GPUs de consumo, aunque el consumo real depende del pipeline GPT-SoVITS y de la longitud del audio generado.
- GPU recomendadas: cualquier GPU compatible con PyTorch y con al menos 8 GB de VRAM es suficiente en la práctica; el propio autor entrenó el modelo en una RTX 5070 Laptop GPU de 8 GB.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 8 GB o menos, dado el tamaño de los checkpoints y el hardware de entrenamiento declarado.
- Opciones de despliegue: WebUI de GPT-SoVITS compatible con v2ProPlus (flujo documentado por el autor); el proyecto GPT-SoVITS también ofrece scripts de inferencia por línea de comandos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Contexto / referencia | Disponibilidad |
|---|---|---|---|---|---|
| Nikki (este modelo) | Fine-tuning GPT-SoVITS v2ProPlus | Chino (entrenamiento); cruzado a otros | Richopera Voice Model License v2.0 (no comercial) | Clip de referencia de 3 a 10 s + transcripción | Hugging Face, 0,8 GB, 15 descargas |
| GPT-SoVITS base (`lj1995/GPT-SoVITS-windows-package`) | Pipeline TTS zero-shot / few-shot | Multilingüe | Según el proyecto GPT-SoVITS (no disponible en detalle) | Clip de referencia corto | Repositorio del proyecto y paquete Windows |
| Modelos TTS comerciales de voz de personaje | TTS propietario | Según proveedor | Comercial, sujeta a contrato | Voz predefinida o clonación con consentimiento | APIs de pago |

La comparación cuantitativa de rendimiento con alternativas no está disponible: no hay benchmarks publicados ni métricas de similitud de hablante que permitan situar este fine-tuning frente al modelo base u otras voces de personaje de la comunidad.

## Limitaciones y advertencias

- Licencia restrictiva: la Richopera Voice Model License v2.0 solo permite uso personal no comercial y publicación no comercial de obras generadas con atribución; la redistribución de pesos originales o derivados exige permiso escrito previo.
- Atribución obligatoria al publicar audio o vídeo: debe mostrarse de forma destacada «Character voice actor: 陈奕雯» y «Voice model trained by: Richopera».
- Modelo no oficial: no está afiliado a los titulares de derechos del personaje ni de las grabaciones originales; el usuario debe verificar por separado los permisos sobre las grabaciones, la imagen del personaje y la interpretación vocal.
- Uso prohibido: actividades ilegales o infractoras, fraude y suplantación de identidad.
- Dependencia estricta de la versión: los checkpoints solo funcionan en entornos GPT-SoVITS que soporten v2ProPlus; mezclarlos con pesos de otras versiones provoca fallos de carga.
- Calidad condicionada por la referencia: la salida depende de un clip limpio de 3 a 10 segundos, con un solo hablante, sin música ni reverberación; una referencia deficiente degrada el timbre y la dicción.
- Inestabilidad en frases cortas: el propio autor advierte que las frases completas suenan más consistentes que los fragmentos breves.
- Cobertura lingüística limitada en el entrenamiento: el dataset es exclusivamente en chino; la calidad de la síntesis cruzada a inglés o japonés no está cuantificada.
- Riesgo de alucinación acústica y artefactos: como todo TTS generativo, puede producir pronunciaciones erróneas, prosodia irregular o artefactos, especialmente en textos largos o con caracteres poco frecuentes.
- Sesgos: no se documentan sesgos específicos, pero la voz está modelada a partir de una única actriz y un corpus acotado, por lo que no representa variedad de hablantes ni de registros.
- Huella comunitaria muy baja: 15 descargas y 0 likes en el momento de la consulta, sin validación externa ni informes de terceros sobre su robustez en producción.
- No apta para producción comercial: la combinación de licencia no comercial, carácter no oficial y ausencia de benchmarks la desaconseja para entornos productivos sin revisión legal previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richopera/nikki-gpt-sovits-v2proplus
- Dataset de voz: https://huggingface.co/datasets/Richopera/Nikki-voice
- Modelo base: https://huggingface.co/lj1995/GPT-SoVITS-windows-package
- Proyecto GPT-SoVITS (GitHub): https://github.com/RVC-Boss/GPT-SoVITS
- Guía en chino de GPT-SoVITS: https://www.yuque.com/baicaigongchang1145haoyuangong/ib3g1e
- Licencia (ingles): LICENSE_en.md (en el repositorio del modelo)
- Licencia (chino): LICENSE.md (en el repositorio del modelo)
- README en chino: README_zh.md (en el repositorio del modelo)
- Sitio oficial de *Shining Nikki*: https://nikki4.playpapergames.com/
- Cuenta de Bilibili de la actriz de doblaje (Chen Yiwen): https://space.bilibili.com/549374747
- Cuenta de Bilibili de 花儿不哭: https://space.bilibili.com/5760446
- Cuenta de Bilibili de 清清雪原: https://space.bilibili.com/19781288
- Contacto del autor: richopera@outlook.com
