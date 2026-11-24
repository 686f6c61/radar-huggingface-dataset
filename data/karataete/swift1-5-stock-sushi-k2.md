# Karataete/swift1.5-stock-sushi-k2

## Resumen

Swift 1.5 Qwen3.8-Flash-Next es un modelo derivado por ajuste fino del Qwen3.8-Flash-Next de Qwen, publicado por UkisAI bajo el identificador Karataete/swift1.5-stock-sushi-k2. Su propuesta central es la eficiencia en el razonamiento: segun la model card, reduce los tokens de pensamiento en un 63,4 % y acelera la generacion 1,8 veces respecto al modelo base, manteniendo una perdida de precision inferior al 1 % en la configuracion xhigh. Se distribuye como un modelo multimodal image-text-to-text con arquitectura MoE y 21.142.110.099 parametros totales segun los pesos en safetensors.

El modelo parte de la familia Qwen3.8 y esta orientado a tareas de codigo, uso de terminal y agentes de horizonte largo, segun declara el autor. El entrenamiento se apoya en el dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft, que se re-muestrea y transforma en entornos de RL en lugar de usarse directamente. La relevancia actual reside en la reduccion del coste de inferencia en modelos con modo de razonamiento, un factor critico para despliegues en produccion con latencia y presupuesto de tokens acotados.

La informacion publicada es limitada: no se detallan idiomas soportados, no hay tabla de benchmarks completa en los datos disponibles y la licencia es propietaria (swift-open-license-1.0) con acceso restringido (gated). El repositorio ocupa 69,7 GB y se distribuye en formato de 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) sobre transformer, derivada de Qwen3.8-Flash-Next |
| Parametros totales | 21.142.110.099 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (pesos publicados); variantes GGUF y GSQ-RCO GGUF referenciadas por el autor |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (other, acceso restringido) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.8-Flash-Next, un transformer con mezcla de expertos (MoE) segun las etiquetas del repositorio. No se especifican en la informacion disponible el numero de expertos, los parametros activos por token ni la longitud de contexto nativa. Los pesos publicados suman 21.142.110.099 parametros y el repositorio pesa 69,7 GB, lo que es coherente con una distribucion en 8 bits.

El metodo de entrenamiento descrito por el autor consiste en identificar los tokens asociados a sobrepensamiento patologico y penalizarlos sin atacar directamente la longitud del razonamiento, recuperando despues la precision mediante RL y OPD (on-policy distillation, por sus siglas en ingles). El dataset de partida es ukisai/Qwen3.8-27B-multi-turn-agent-sft, que se re-muestrea y convierte en entornos de RL. El autor afirma que el post-entrenamiento esta adaptado especificamente a codigo y a trabajo agentico de horizonte largo, como agentes personales, uso de terminal e ingenieria de software. No se detallan el volumen de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento comprimido: trazas de razonamiento mas cortas que el modelo base, con un 63,4 % menos de tokens de pensamiento segun el autor.
- Generacion de codigo: el ejemplo de la model card muestra la construccion de un juego 3D endless runner completo a partir de una instruccion en lenguaje natural.
- Trabajo agentico de horizonte largo: agentes personales, uso de terminal y tareas de ingenieria de software.
- Evaluacion en Terminal-Bench 2.1, segun la tabla de evaluacion referenciada en la model card.
- Procesamiento image-text-to-text: el pipeline declarado es multimodal entrada de imagen y texto.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo thinking eficiente: reduccion de sobrepensamiento y, segun el autor, menos errores derivados de este.

## Casos de uso

- Generacion de videojuegos y prototipos interactivos: el modelo puede producir un juego jugable localmente a partir de una descripcion, como demuestra el ejemplo del endless runner, con un tiempo de construccion de 4 minutos 56 segundos frente a 8 minutos 52 segundos del base.
- Agentes de terminal y automatizacion de sistemas: el post-entrenamiento orientado a terminal permite tareas de ejecucion de comandos y resolucion de problemas en entornos de linea de comandos, medido en Terminal-Bench 2.1.
- Ingenieria de software asistida: generacion y modificacion de codigo en flujos de trabajo de desarrollo, con trazas de razonamiento mas cortas que reducen el coste por peticion.
- Agentes personales multi-turno: el dataset de entrenamiento esta compuesto por conversaciones agenticas multi-turno, lo que encaja con asistentes que mantienen estado a lo largo de sesiones.
- Despliegue con presupuesto de tokens ajustado: la reduccion del 63,4 % en tokens de pensamiento y la aceleracion de 1,8 veces lo hacen adecuado para servicios con latencia estricta o coste por token elevado.
- Pipelines de razonamiento en produccion con requisito de precision: la perdida de precision inferior al 1 % respecto al base en xhigh permite sustituir el modelo original sin recalibrar los umbrales de calidad.
- Procesamiento de imagenes y texto combinados: el pipeline image-text-to-text habilita tareas que requieren interpretar capturas, diagramas o documentacion visual junto con instrucciones textuales.

## Benchmarks y rendimiento

La model card referencia una tabla de evaluacion con columnas de puntuacion y de tokens de pensamiento, pero los datos numericos de esa tabla no estan incluidos en la informacion proporcionada. Los unicos datos cuantitativos disponibles son los agregados declarados por el autor:

| Metrica | Valor |
|---|---|
| Reduccion de tokens de pensamiento | 63,4 % frente al base |
| Aceleracion | 1,8x frente al base |
| Perdida de precision en xhigh | inferior al 1 % frente al base |
| Tiempo de construccion del juego de demostracion | 4 min 56 s (Swift 1.5) frente a 8 min 52 s (base) |

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 21.142.110.099 parametros, una carga en 8 bits requiere aproximadamente 21 GB solo para los pesos, mas memoria para el contexto y el estado de atencion; en BF16 serian unos 42 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, encaja en A100 40 GB y H100 80 GB en 8 bits con margen para contexto; en BF16 requeriria A100 80 GB o H100.
- GPU de consumo: en 8 bits podria ajustarse en tarjetas de 24 GB (RTX 3090, RTX 4090) solo con cuantizacion adicional y contexto reducido; no hay confirmacion del autor.
- Opciones de despliegue: transformers (libreria declarada); el autor referencia variantes GGUF y GSQ-RCO GGUF, lo que habilita llama.cpp y entornos compatibles con GGUF. No se confirma soporte de vLLM ni TGI.
- Latencia y throughput: el autor reporta una aceleracion de 1,8x respecto al base, sin cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Swift 1.5 Qwen3.8-Flash-Next (este modelo) | 21.142.110.099 | no disponible | swift-open-license-1.0 (other, gated) | Hugging Face, pesos en 8 bits |
| Qwen3.8-Flash-Next (base) | no disponible | no disponible | no disponible | Hugging Face (Qwen/Qwen3.8-Flash-Next) |
| Qwen3.8-27B (referencia del dataset) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para comparar rendimiento, contexto o licencia con alternativas de la misma categoria. La unica comparacion cuantitativa disponible es contra el modelo base: 63,4 % menos tokens de pensamiento, 1,8x de aceleracion y menos del 1 % de perdida de precision.

## Limitaciones y advertencias

- Licencia propietaria swift-open-license-1.0 con acceso restringido (gated): es necesario solicitar acceso y revisar los terminos antes de cualquier uso comercial.
- El modelo es un ajuste fino de un modelo base de Qwen; los sesgos y riesgos del base se heredan y no se documentan en la informacion disponible.
- Riesgo de alucinacion: no cuantificado por el autor; la reduccion de tokens de razonamiento podria aumentar el riesgo de respuestas precipitadas en tareas que requieren cadenas de pensamiento largas, aunque el autor afirma observar menos errores de sobrepensamiento.
- Idiomas soportados no documentados: no hay garantia de calidad fuera de los idiomas presentes en el entrenamiento.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo sin verificacion empirica.
- Parametros activos y estructura MoE no detallados: dificulta estimar el coste real de inferencia por token.
- Los datos de evaluacion disponibles son agregados; no hay puntuaciones absolutas de benchmarks que permitan una validacion independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- La fecha de creacion del repositorio (2026-11-23) y la referencia a modelos Qwen3.8 no son verificables de forma independiente en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Karataete/swift1.5-stock-sushi-k2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Licencia: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next/blob/main/LICENSE
- Web del autor: https://ukisai.com
- Pagina de producto: https://ukisai.com/products/swift
- Variante GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Variante GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Demo jugable: https://ukisai.com/swift-games/flash-next
