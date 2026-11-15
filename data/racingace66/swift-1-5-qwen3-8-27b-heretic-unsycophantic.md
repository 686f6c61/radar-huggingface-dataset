# RacingAce66/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic

## Resumen

Swift-1.5-Qwen3.8-27b-heretic-unsycophantic es un modelo multimodal de tipo image-text-to-text derivado de ukisai/Swift-1.5-Qwen3.8-27b, que a su vez es un refinamiento de Qwen3.8-27B de Alibaba. El autor de esta variante, RacingAce66, ha aplicado la herramienta Heretic v2.1.0 para producir una version "decensored" (sin rechazos y sin comportamiento adulador) del fine-tune original. El resultado es un modelo de 27.356.728.560 parametros (27,36 mil millones) publicado en safetensors, con un repositorio de 54,8 GB.

El modelo hereda del linaje Swift la filosofia de "razonamiento eficiente": segun la model card del modelo base, Swift 1.5 consume un 58,5 % menos de tokens de pensamiento que Qwen3.8-27B manteniendo (e incluso superando ligeramente) la precision, lo que se traduce en una aceleracion de aproximadamente 1,95x en varias tareas. Sobre esa base, la variante heretic elimina la mayor parte de las negativas a responder y reduce drasticamente la adulacion, a costa de una divergencia KL de 0,1774 respecto al original.

Es relevante ahora porque combina tres tendencias actuales: modelos multimodales de ~27B ejecutables en hardware de gama alta para consumo, post-entrenamiento orientado a eficiencia de tokens en tareas agenticas y de codigo, y tecnicas de ablacion de direcciones (abliteration) para modular el comportamiento de rechazo sin reentrenar desde cero. La licencia es swift-open-license-1.0, propietaria y con acceso restringido (gated).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.8; tag qwen3_5 / qwen3_8 |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para esta variante; el modelo base publica GGUF y GSQ-RCO GGUF |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (other, gated) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B, un transformer multimodal que procesa entradas de imagen y texto (pipeline image-text-to-text). El linaje Swift introduce un post-entrenamiento especifico: segun la model card del base, se identifican los tokens asociados a "sobrepensamiento patologico" y se penalizan sin atacar directamente la longitud del razonamiento, recuperando despues la precision mediante RL y OPD (on-policy distillation). Swift 1.5 escala ese post-entrenamiento respecto a Swift 1.0, con foco en tareas de horizonte largo, agenticas y de codigo. Los datos de entrenamiento son publicos en el dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft, aunque el autor aclara que se remuestrean y convierten en entornos RL.

Esta variante concreta aplica Heretic v2.1.0 con Ablacion de Rango Arbitrario (ARA) sobre las capas 1 a 62, con los parametros preserve_good_behavior_weight = 0,0323, steer_bad_behavior_weight = 0,0003, overcorrect_relative_weight = 0,9874 y neighbor_count = 13. La intervencion modifica las direcciones de activacion para suprimir rechazos y adulacion, y el proceso es reproducible (carpeta `reproduce` en el repositorio). El coste medido es una divergencia KL de 0,1774 frente al modelo original.

## Capacidades

- Generacion de texto y razonamiento multimodal (entrada de imagen y texto).
- Razonamiento eficiente en tokens: menos tokens de pensamiento que el base para tareas equivalentes.
- Generacion de codigo, incluyendo tareas de horizonte largo y agenticas (mejoras reportadas en LiveCodeBench y Terminal Bench 2.1 por el autor del base).
- Construccion de artefactos complejos: el demo del modelo base genera un juego 3D jugable a partir de un prompt.
- Comportamiento sin rechazos en la practica: 8/100 negativas frente a 98/100 del original.
- Baja adulacion: 2/78 respuestas aduladoras frente a 60/78 del original.
- Soporte de conversacion multi-turno.
- Tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Generacion de codigo en produccion: el linaje Swift esta post-entrenado para tareas de codigo y agenticas, con mejoras declaradas en LiveCodeBench y Terminal Bench 2.1, lo que lo hace adecuado para pipelines de generacion y refactorizacion de codigo.
- Agentes de terminal y automatizacion de shell: el enfasis en Terminal Bench 2.1 sugiere uso en agentes que ejecutan comandos y resuelven tareas de sistema de multiples pasos.
- Prototipado de videojuegos y aplicaciones interactivas: el demo del base genera un juego 3D funcional en 11,39 minutos frente a 104,6 minutos del base, lo que lo hace util para generar prototipos jugables rapidamente.
- Analisis de imagenes con descripcion textual: al ser image-text-to-text, sirve para tareas de captioning, extraccion de informacion de capturas o documentos escaneados.
- Investigacion sobre alineacion y abliteration: al ser reproducible con Heretic v2.1.0 y publicar parametros ARA, es util como caso de estudio controlado de modificacion de comportamiento.
- Evaluacion de robustez sin rechazos: para equipos que necesitan medir como se comporta un modelo cuando se eliminan las negativas, con metricas comparativas claras (8/100 frente a 98/100).
- Conversacion de dominio abierto sin friccion: util en entornos donde los rechazos del modelo base interrumpen flujos legitimos, con la advertencia de que la supresion de rechazos tambien reduce las salvaguardas.

## Benchmarks y rendimiento

Resultados publicados en la model card de esta variante (herramienta de benchmark integrada de Heretic 2.1.0):

| Benchmark | Metrica | Valor | Error estandar |
|---|---|---|---|
| AGIEval | Accuracy (acc,none) | 0,5503 | 0,0051 |
| CommonsenseQA | Accuracy (acc,none) | 0,8575 | 0,0100 |

Comparativa de comportamiento frente al modelo original:

| Metrica | Esta variante | Original (ukisai/Swift-1.5-Qwen3.8-27b) |
|---|---|---|
| Negativas (refusals) | 8/100 | 98/100 |
| Respuestas con adulacion (sycophancy) | 2/78 | 60/78 |
| Divergencia KL | 0,1774 | 0 (por definicion) |

Del modelo base, la model card declara un 58,5 % menos de tokens de pensamiento, +0,35 % de precision y una aceleracion de 1,95x, pero no se aportan las cifras absolutas por benchmark en la informacion disponible. No se han publicado resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 54,7 GB solo para pesos, mas overhead de activaciones y cache KV; requiere multiples GPU o una GPU de 80 GB con margen.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 27-30 GB, viable en una RTX 5090 (32 GB) o A100 40 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 14-16 GB, viable en RTX 4090 (24 GB) y en GPUs consumer de 16 GB con contexto reducido.
- GPU recomendadas: H100 80 GB, A100 80 GB para BF16; A100 40 GB o RTX 5090 para 8 bits; RTX 4090 para 4 bits.
- Despliegue: transformers es la libreria declarada; el modelo base ofrece GGUF y GSQ-RCO GGUF, por lo que llama.cpp u Ollama son viables si se convierten los pesos. vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-heretic-unsycophantic | 27,36 B | no disponible | swift-open-license-1.0 (gated) | Variante sin rechazos ni adulacion, multimodal, reproducible |
| ukisai/Swift-1.5-Qwen3.8-27b | 27,36 B (heredado) | no disponible | swift-open-license-1.0 | Modelo base; 98/100 negativas, 60/78 adulacion |
| Qwen3.8-27B | 27 B (aproximado, segun nomenclatura) | no disponible | no disponible | Fundamento del linaje; sin el post-entrenamiento de eficiencia de tokens |

No se dispone de datos de benchmarks comparables de terceros en la informacion proporcionada para establecer una comparativa cuantitativa con otras familias.

## Limitaciones y advertencias

- La supresion de rechazos (8/100 frente a 98/100) implica que el modelo puede generar contenido que el base rechazaria; no debe desplegarse sin filtros externos en entornos con requisitos de seguridad.
- Divergencia KL de 0,1774 respecto al original: la ablacion altera el comportamiento de forma medible y puede degradar capacidades no evaluadas.
- Solo hay benchmarks de AGIEval y CommonsenseQA publicados; no hay datos de MMLU, HumanEval, GSM8K ni de tareas multimodales.
- Idiomas soportados no declarados; el rendimiento fuera del ingles y el chino es incierto.
- Longitud de contexto no disponible.
- Licencia propietaria swift-open-license-1.0 con acceso restringido (gated): es necesario revisar los terminos del enlace de licencia antes de cualquier uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- El pipeline declarado es image-text-to-text, pero no se documentan capacidades de vision mas alla del tag.

## Enlaces

- Hugging Face: https://huggingface.co/RacingAce66/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Heretic: https://heretic-project.org
- Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF del base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- GSQ-RCO GGUF del base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Web del autor del base: https://ukisai.com
- Demo jugable: https://ukisai.com/swift-games/27b
- Reproduccion: https://huggingface.co/RacingAce66/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic/tree/main/reproduce
