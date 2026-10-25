# Kaisye/zerotts-int8

## Resumen

Kaisye/zerotts-int8 es una publicación en Hugging Face del usuario Kaisye que, por el nombre del repositorio, parece ser una versión cuantizada a int8 de ZeroTTS, un sistema de síntesis de voz (text-to-speech) zero-shot desarrollado por ZeroWeight AI y orientado a vietnamita. El repositorio original de Kaisye no incluye model card más allá de la declaración de licencia MIT, no declara pipeline, idiomas ni formato de pesos, y en el momento de la consulta acumula 0 descargas y 0 likes, por lo que se trata de un artefacto sin validación comunitaria documentada.

El interés de esta variante es principalmente práctico: el modelo base se distribuye en ONNX con un peso aproximado de 910 MB y está diseñado para inferencia en tiempo real sobre CPU, con clonación de voz a partir de unos segundos de audio de referencia y una ruta de streaming real que mide el time-to-first-audio sobre el primer frame generado. Una cuantización int8 reduce la huella de memoria y el coste por token acústico, lo que encaja con despliegues en edge, portátiles y contenedores sin GPU.

La relevancia, por tanto, es la de un TTS ligero y desplegable en CPU para vietnamita, no la de un modelo de propósito general: no hay indicios de que sea un LLM ni de que soporte tool calling, agentes o visión. Cualquier evaluación de calidad debe hacerse contra el modelo base, ya que esta variante no publica métricas propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de síntesis de voz (TTS) zero-shot; arquitectura interna concreta no disponible en la información proporcionada |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | No aplica / no disponible (modelo TTS, no un modelo de contexto textual) |
| Tipos de cuantización | int8 (según el identificador del repositorio); esquema exacto (dinámico, estático, per-channel) no disponible |
| Idiomas soportados | Vietnamita en el modelo base; el repositorio derivado no declara idiomas |
| Licencia | MIT |
| Formato de pesos | El modelo base se distribuye en ONNX; el formato exacto de este repositorio no está confirmado en la información disponible |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo base en los materiales disponibles: no se detalla si el decodificador acústico es un transformer, un modelo convolucional o una arquitectura híbrida, ni se especifica el vocoder empleado. Lo que sí documenta el proyecto original es la interfaz de ejecución: exportación a ONNX, ejecución con ONNX Runtime, soporte de streaming real (la latencia se mide hasta el primer frame de audio, no hasta la utterance completa) y clonación de voz zero-shot a partir de pocos segundos de referencia.

Respecto al entrenamiento, se desconoce el número de tokens o horas de audio, la composición del dataset, el idioma exacto de los datos (más allá de vietnamita) y si hubo etapas de ajuste tipo RLHF/DPO, que en TTS no son el mecanismo habitual. Sobre esta variante int8 en concreto no se documenta el procedimiento de cuantización: no se indica si es post-entrenamiento o con calibración, ni qué capas se han cuantizado, ni si se ha verificado la degradación de calidad frente al modelo en precisión completa. La existencia de un paper asociado (arXiv:2602.10934) en las etiquetas del repositorio base sugiere que los detalles técnicos están allí, pero su contenido no forma parte de la información proporcionada.

## Capacidades

- Síntesis de voz a partir de texto en vietnamita, con salida de audio natural.
- Clonación de voz zero-shot: generación con la identidad de un hablante a partir de unos segundos de audio de referencia.
- Streaming de audio real, con métrica de time-to-first-audio sobre el primer frame.
- Inferencia en CPU a velocidad superior al tiempo real en portátiles, según las afirmaciones del proyecto original.
- Ejecución mediante ONNX Runtime, lo que facilita el despliegue multiplataforma.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión, audio de entrada (ASR) ni multimodalidad más allá de la síntesis.
- El multilingüismo no está documentado: el modelo base se presenta como específico para vietnamita.

## Casos de uso

- Audiolibros y contenido largo en vietnamita: el modo streaming permite empezar a reproducir audio antes de completar la síntesis, lo que reduce la latencia percibida en pasajes extensos y abarata el coste al ejecutarse en CPU.
- Doblaje y localización con identidad de voz: la clonación zero-shot a partir de segundos de referencia permite generar versiones en vietnamita de contenido existente manteniendo el timbre del hablante original, siempre con consentimiento explícito.
- Asistentes de voz embebidos y on-premise: al no requerir GPU, el modelo puede empaquetarse en dispositivos de borde o en servidores modestos donde no se quiere enviar audio a la nube.
- Accesibilidad y lectura de pantalla: conversión de texto de aplicaciones o documentos a voz para usuarios vietnamitas, con despliegue local que evita depender de servicios de terceros.
- Sistemas IVR y avisos telefónicos: generación de prompts y mensajes de voz para centralitas, con clonación de una voz corporativa consistente y regeneración bajo demanda.
- Aumento de datos para ASR: generación por lotes de audio sintético con distintas voces para ampliar corpus de entrenamiento de reconocimiento de voz en vietnamita.
- Prototipado y demos sin infraestructura: validación de producto de una función de voz en un portátil, sin aprovisionar GPU, antes de decidir si se escala a un modelo mayor.
- Pre-generación de material educativo: síntesis de lecciones o materiales de aprendizaje de idiomas con voces variadas para exposición a distintos acentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante int8. El repositorio no incluye métricas de error de palabra (WER), MOS, similitud de hablante ni latencia medida.

Las únicas referencias cuantitativas y cualitativas disponibles corresponden al proyecto base y deben atribuirse a él, no a esta cuantización:

| Afirmación | Valor numérico | Ámbito |
|---|---|---|
| Menos errores de palabra que el siguiente modelo abierto | "4× menos" (sin cifra absoluta de WER) | Modelo base ZeroTTS, no la variante int8 |
| Velocidad en CPU de portátil | "más rápido que tiempo real" (sin cifras de RTF) | Modelo base ZeroTTS |
| Time-to-first-audio | Medido sobre el primer frame en streaming; las líneas base comparadas miden la utterance completa | Modelo base ZeroTTS |
| Degradación por cuantización int8 | No disponible | Esta variante |

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el modelo base no requiere GPU. Para ejecución en GPU mediante el provider CUDA de ONNX Runtime, la VRAM necesaria no está documentada.
- Tamaño en disco: el repositorio base ocupa aproximadamente 910 MB en ONNX; se espera que la variante int8 reduzca esa cifra de forma significativa, pero el tamaño exacto no se publica.
- GPU recomendadas: no documentadas; el diseño del modelo base está orientado a CPU. Cualquier GPU consumer (por ejemplo, una RTX 4090) sería sobredimensionada para este modelo.
- Compatibilidad con GPU consumer: sí, y también con CPU de portátil, que es el escenario objetivo del proyecto original.
- Opciones de despliegue: ONNX Runtime (CPU y, opcionalmente, providers acelerados), el paquete `zerotts` publicado en PyPI y contenedores propios. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no hay cifras publicadas para esta variante. El modelo base afirma ejecución más rápida que tiempo real en CPU de portátil y streaming con TTFA medido al primer frame; el efecto real de la cuantización int8 sobre latencia y calidad no está medido en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Kaisye/zerotts-int8 | No disponible | No aplica | No declarados | MIT | No confirmado (base en ONNX) | Hugging Face, 0 descargas |
| ZeroTTS (zeroweight-ai/ZeroTTS) | No disponible | No aplica | Vietnamita | MIT | ONNX (~910 MB) | Hugging Face, GitHub y PyPI |
| Otras familias TTS abiertas (XTTS, Piper, Kokoro, etc.) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación fundamentada con los datos disponibles es frente al modelo base: misma licencia MIT, mismo idioma objetivo y misma ruta de ejecución, con la diferencia de la cuantización int8, cuyo impacto en calidad y latencia no está documentado. Cualquier comparación con otras familias de TTS requeriría datos que no se han proporcionado.

## Limitaciones y advertencias

- Artefacto sin validación: 0 descargas y 0 likes, sin model card descriptiva, sin métricas y sin issues públicos. No hay evidencia de que la cuantización se haya evaluado.
- Procedencia inferida: la relación con ZeroTTS se deduce del nombre del repositorio y de la búsqueda web, no de una declaración explícita del autor en la información disponible.
- Riesgo de degradación por cuantización: la conversión a int8 puede afectar a prosodia, naturalidad y estabilidad de la voz, especialmente en la clonación; no se publica ninguna comparación con el modelo en precisión completa.
- Idioma: el modelo base está especializado en vietnamita. No hay datos sobre su comportamiento en castellano ni en otros idiomas, y no debe asumirse que funcione fuera de ese ámbito.
- Pronunciación de elementos fuera de dominio: números, siglas, nombres propios y préstamos pueden sintetizarse incorrectamente sin un módulo de normalización de texto específico.
- Uso indebido de la clonación de voz: la clonación zero-shot permite suplantación de identidad y deepfakes. Es necesario obtener consentimiento explícito del hablante y cumplir la normativa aplicable (RGPD y regulación europea de IA) antes de cualquier uso en producción.
- Licencia: MIT permite uso comercial y modificación, pero debe verificarse también la licencia de los pesos base y de cualquier voz de referencia utilizada, que pueden tener condiciones distintas.
- Ausencia de garantías: el modelo se distribuye "tal cual", sin soporte, sin mantenimiento visible y con fecha de creación registrada el 25 de octubre de 2026 en los metadatos de Hugging Face.
- Sesgos: no hay información sobre la distribución de hablantes, acentos o registros del corpus de entrenamiento, por lo que se desconoce si la calidad es homogénea entre variedades del vietnamita o entre voces masculinas y femeninas.
- No apto como LLM: no dispone de contexto textual, razonamiento, tool calling ni generación de código; no debe evaluarse con benchmarks de lenguaje.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Kaisye/zerotts-int8
- Modelo base en Hugging Face: https://huggingface.co/zeroweight-ai/ZeroTTS
- Árbol de ficheros del modelo base: https://huggingface.co/zeroweight-ai/ZeroTTS/tree/main
- Repositorio GitHub original: https://github.com/zeroweight-ai/ZeroTTS
- Fork en GitHub: https://github.com/hadeskers/zerotts/tree/main/
- Paquete PyPI: https://pypi.org/project/zerotts/
- Paper asociado (referenciado en las etiquetas del modelo base): https://arxiv.org/abs/2602.10934
