# sir123sds/XuanShu-AI-Qwen3-4B

## Resumen

XuanShu-AI-Qwen3-4B (玄枢 AI 教师精调直断宗师版) es un ajuste fino del modelo Qwen/Qwen3-4B-Thinking-2507 orientado a la interpretacion de disciplinas de la metafisica china tradicional: bazi (四柱), ziwei doushu (紫微斗数), qimen dunjia (奇门遁甲) y liuyao (六爻). Lo desarrolla el autor independiente sir123sds como repositorio de pesos asociado al proyecto de codigo abierto XuanShu-AI, una aplicacion de escritorio portable para Windows que integra Ollama de forma embebida.

El modelo parte de la arquitectura Qwen3 de 4.022 millones de parametros (4B) en su variante Thinking-2507, especializada en razonamiento con cadena de pensamiento. El ajuste se ha realizado mediante LoRA sobre un conjunto de datos muy reducido: 48 casos de lectura completa de cartas mas datos de preguntas y respuestas multi-turno de "profesor", con un limite de 6144 tokens sin truncamiento. El resultado se distribuye tanto en formato GGUF cuantizado (Q4_K_M y Q3_K_M) como en adaptadores PEFT LoRA originales.

Su relevancia es acotada y de nicho: no compite en capacidades generales con los modelos base de la familia Qwen3, sino que demuestra un caso de especializacion vertical sobre un dominio cultural concreto con un presupuesto de datos minimo, empaquetado para su uso en hardware de consumo (8 GB de VRAM). El soporte linguistico declarado es unicamente chino (zh) y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Thinking-2507) con ajuste fino LoRA |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 40K tokens segun la model card para la version GGUF Q4_K_M; contexto nativo del modelo base no confirmado en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (~2,33 GiB), Q3_K_M (~1,93 GiB); pesos safetensors en el repo |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, adaptadores PEFT LoRA |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-4B-Thinking-2507, la variante de la familia Qwen3 entrenada para generar razonamiento explicito antes de la respuesta. Sobre esa base se aplica un ajuste fino mediante LoRA (los adaptadores originales se incluyen en el directorio `lora/` del repositorio y pueden reutilizarse para entrenamiento incremental). No se especifican en la informacion disponible detalles sobre la arquitectura interna del modelo base (numero de capas, dimensiones, atencion GQA, etc.).

El conjunto de entrenamiento es extremadamente pequeno: 48 casos de lectura completa ("全盘实断") mas datos de preguntas y respuestas multi-turno de estilo docente, con un presupuesto de 6144 tokens sin truncamiento. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detalla la configuracion del entrenamiento (rango LoRA, tasa de aprendizaje, epocas). La innovacion principal no es arquitectonica sino de producto: el empaquetado del modelo en GGUF junto con un Modelfile de Ollama y una aplicacion portable para Windows que automatiza la importacion y el arranque del servidor local.

## Capacidades

- Generacion de texto en chino con razonamiento explicito previo a la respuesta, heredado del modo Thinking del modelo base.
- Interpretacion de cartas de bazi (cuatro pilares), ziwei doushu, qimen dunjia y liuyao, el dominio concreto para el que fue ajustado.
- Conversacion multi-turno con seguimiento de preguntas de aclaracion, orientada a un flujo de "profesor" que explica y luego dictamina.
- Capacidades generales de codigo, matematicas y conocimiento enciclopedico presumiblemente heredadas del modelo base, aunque no verificadas ni documentadas para este ajuste.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para este ajuste.
- Capacidades multilingues: limitadas al chino segun la etiqueta de idioma declarada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Consulta de bazi en local: el modelo puede interpretar los cuatro pilares de una fecha de nacimiento y generar una lectura completa en chino, ejecutandose en una GPU de 8 GB gracias a la cuantizacion Q4_K_M, sin enviar datos personales a servicios en la nube.
- Analisis de cartas de ziwei doushu: adecuado para generar interpretaciones de palacio a palacio y responder preguntas de seguimiento del usuario sobre aspectos concretos de la carta, aprovechando el formato de preguntas y respuestas multi-turno con el que fue entrenado.
- Estudio y aprendizaje de qimen dunjia y liuyao: el modelo actua como tutor que explica la logica de una tirada y justifica el dictamen, util para estudiantes de estas disciplinas que quieran contrastar su propia interpretacion.
- Aplicacion de escritorio offline: integrado en el paquete portable XuanShu-AI para Windows, sirve como motor de inferencia local para una herramienta de consulta sin dependencia de red ni de claves de API.
- Prototipado de asistentes verticales: sirve como ejemplo reproducible de especializacion de un modelo de 4B con un dataset de decenas de ejemplos y LoRA, util para equipos que quieran replicar el flujo con otros dominios de nicho.
- Base para ajuste incremental: los adaptadores PEFT incluidos en `lora/` permiten continuar el entrenamiento con nuevos casos sin partir del modelo base, por ejemplo para ampliar el corpus de lecturas o corregir sesgos de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5-3 GB para el GGUF Q4_K_M en inferencia, y en torno a 2-2,5 GB para Q3_K_M, segun los tamanos de fichero declarados (2,33 GiB y 1,93 GiB respectivamente).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM puede ejecutar la version Q4_K_M con contexto largo, segun indica el autor; tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 ofrecen margen adicional. Para servidores, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, en tarjetas de 8 GB en adelante con la cuantizacion Q4_K_M.
- Opciones de despliegue: Ollama mediante el `Modelfile` incluido (flujo principal del proyecto), llama.cpp para los ficheros GGUF, y vLLM o TGI para los pesos safetensors si se necesita servir por API.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card menciona ejecucion fluida con 40K de contexto en 8 GB de VRAM, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Enfoque |
|---|---|---|---|---|---|
| XuanShu-AI-Qwen3-4B | 4B | 40K (GGUF Q4_K_M) | zh | Apache 2.0 | Metafisica china (bazi, ziwei, qimen, liuyao) |
| Qwen/Qwen3-4B-Thinking-2507 | 4B | no disponible en esta ficha | multilingue | Apache 2.0 | Razonamiento general, modelo base |
| Qwen/Qwen3-4B | 4B | no disponible en esta ficha | multilingue | Apache 2.0 | Modelo general de la familia Qwen3 |

La comparacion relevante es con su propio modelo base: XuanShu-AI-Qwen3-4B sacrifica cobertura multilingue y generalidad a cambio de un comportamiento especializado en un dominio muy concreto, con un corpus de entrenamiento de solo 48 casos. Frente a otros ajustes finos de nicho no se dispone de datos comparativos publicados.

## Limitaciones y advertencias

- Corpus de entrenamiento minimo (48 casos de lectura completa): alta probabilidad de sobreajuste al estilo y a los ejemplos concretos del autor, con poca generalizacion a cartas o configuraciones no vistas.
- Riesgo de alucinacion elevado en un dominio donde el modelo debe producir interpretaciones: no hay mecanismo de verificacion ni base de conocimiento estructurada documentada.
- Idioma limitado al chino: no se declara soporte de castellano ni de otras lenguas, por lo que su uso fuera de zh no esta garantizado.
- Ambito de aplicacion restringido: las capacidades generales del modelo base pueden haberse degradado tras el ajuste LoRA; no hay evaluaciones que lo confirmen o descarten.
- Sin benchmarks publicados: no es posible comparar su calidad de forma objetiva con el modelo base ni con alternativas.
- Advertencia de uso: las disciplinas de metafisica china no tienen base cientifica; el modelo debe presentarse como herramienta cultural o de entretenimiento, no como sistema de prediccion o consejo con validez empirica.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; verificar tambien las condiciones del modelo base Qwen3-4B-Thinking-2507 antes de un despliegue en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: proyecto muy reciente y sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sir123sds/XuanShu-AI-Qwen3-4B
- Repositorio del proyecto XuanShu-AI: https://github.com/qu15501267889-sketch/XuanShu-AI
- Release v1.0.0 con el paquete portable para Windows: https://github.com/qu15501267889-sketch/XuanShu-AI/releases/tag/v1.0.0
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
