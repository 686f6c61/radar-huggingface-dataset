# mhndayesh/mosv

## Resumen

MoSV (Mixture of Steering Vectors) es un experimento de investigacion sobre Qwen3-4B-Instruct-2507 en el que se incorporan vectores de direccionamiento de tarea (steering vectors) entrenados mediante RL dentro del propio modelo, materializados como capas de mezcla de expertos. Cada experto es un pequeno modulo SwiGLU que representa una tematica concreta (depuracion, redaccion de correo profesional, narracion, docencia, explicacion, guia practica, ingenieria y resolucion matematica), y una compuerta lineal selecciona uno por token. El resultado se distribuye como un unico GGUF que funciona en llama.cpp estandar y en LM Studio, sin codigo personalizado ni proxy.

El modelo lo publica el usuario mhndayesh como proyecto de investigacion, con codigo y pipeline de entrenamiento en GitHub. La propuesta es interesante porque demuestra que es posible inyectar comportamiento condicionado por tarea sin reentrenar el modelo base, manteniendo intacto el resto de Qwen3-4B y anadiendo solo unas pocas capas ligeras en las capas 9, 18 y 27.

La relevancia practica es limitada pero conceptualmente valiosa: abre una via para adaptar modelos pequenos a tareas especificas con coste minimo de inferencia y sin necesidad de infraestructura adicional. El modelo base es Qwen3-4B-Instruct-2507, con licencia Apache-2.0, y esta pensado exclusivamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3) con capas MoE de steering vectors en capas 9, 18 y 27; arquitectura GGUF `hy_v3` |
| Parametros totales | 4B (modelo base Qwen3-4B-Instruct-2507); el conteo reportado en safetensors (7680) corresponde a los tensores auxiliares, no al modelo completo |
| Parametros activos | No aplica como MoE clasico: 1 experto de steering activo por token, mas el MLP original siempre activo como experto compartido |
| Longitud de contexto | No disponible (heredada de Qwen3-4B-Instruct-2507, no especificada en la model card) |
| Tipos de cuantizacion | F16 publicado; compatible con Q8_0 y Q4_0 para KV cache; Q4_1 no tiene kernel de Flash Attention |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F16, 8.1 GB); vectores v3 en GGUF como control vectors; router v3 en `.pt` |

## Arquitectura y entrenamiento

MoSV parte de Qwen3-4B-Instruct-2507 sin modificar el cuerpo principal. En las capas 9, 18 y 27 se conserva el MLP original como experto compartido siempre activo, y junto a el se anaden un experto 0 (todo ceros, equivalente a "sin steering") y ocho expertos SwiGLU pequenos, uno por tematica. Una compuerta lineal con activacion sigmoide y top-1 con peso 1 selecciona un experto por token. El resto de la red es Qwen3 intacto.

Los expertos y compuertas se destilaron a partir de la version v3 del proyecto, que anade un vector entrenado por RL tras las mismas capas y un router que elige el vector una vez por prompt. El entrenamiento RL uso Claude Haiku como juez. La innovacion tecnica es la materializacion de steering vectors como capas MoE ligeras dentro del propio grafo, lo que permite ejecutar el modelo en llama.cpp estandar sin codigo adicional. La inspiracion declarada es Meral et al., "RL Post-Training in Diffusion Transformers Is Activation Steering" (arXiv:2611.26627), adaptada de modelos de difusion a un LLM de texto.

## Capacidades

- Generacion de texto en ingles con estilos condicionados por tematica: depuracion, correo profesional, narracion, docencia, explicacion, guia practica, ingenieria y resolucion matematica.
- Enrutamiento por token entre los ocho expertos de steering, con un experto compartido siempre activo.
- Funciona en llama.cpp estandar y en LM Studio (motores ROCm 2.80.1+ y Vulkan 2.73+ probados).
- Compatible con Flash Attention (`-fa on`) y con plantillas Jinja (`--jinja`).
- No incluye modo thinking explicito ni capacidades de vision o audio.
- No se documenta soporte de tool calling ni de agentes multi-paso en la model card.

## Casos de uso

- Depuracion de codigo asistida: el experto de debugging obtiene una puntuacion media de 4.09 frente a 1.70 del Qwen base en la rubrica del autor, lo que lo hace util para explicar errores y proponer correcciones en ingles.
- Redaccion de correos profesionales: el experto de professional email (4.03 frente a 3.22 del base) puede emplearse para generar borradores de correo con tono adecuado en entornos corporativos.
- Generacion de material didactico: el experto de teaching (3.55 frente a 2.72) resulta adecuado para producir explicaciones escalonadas y ejemplos para formacion.
- Narracion y escritura creativa: el experto de story (3.66 frente a 2.55) sirve para generar relatos breves y continuaciones narrativas con coherencia estilistica.
- Guias paso a paso: el experto de how-to guide (3.21 frente a 3.00) permite producir instrucciones procedimentales para documentacion tecnica o manuales.
- Explicaciones tecnicas: el experto de explanation (3.49 frente a 2.90) es util para desglosar conceptos complejos en ingles.
- Despliegue en estaciones de trabajo con una sola GPU de 16 GB: el GGUF F16 de 8.1 GB cabe en tarjetas consumer de gama alta y se ejecuta en LM Studio sin infraestructura adicional.

## Benchmarks y rendimiento

Evaluacion con 86 prompts reservados, respuestas de longitud completa, puntuadas a ciegas por Claude Haiku con una rubrica de 5 criterios por tematica (escala 1-5), cada par juzgado dos veces con el orden invertido.

| Tematica | Qwen normal | v3 | MoSV (v4) |
|---|---|---|---|
| Debugging | 1.70 | 4.12 | 4.09 |
| Professional email | 3.22 | 4.01 | 4.03 |
| Story | 2.55 | 3.82 | 3.66 |
| Teaching | 2.72 | 3.43 | 3.55 |
| Explanation | 2.90 | 3.45 | 3.49 |
| How-to guide | 3.00 | 2.86 | 3.21 |
| Engineering | 2.48 | 2.18 | 2.41 |
| Math solving | 4.53 | 4.47 | 4.43 |
| Media de las 80 prompts tematicas | 2.89 | 3.54 | 3.61 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el GGUF F16 ocupa 8.1 GB; con overhead de contexto y KV cache, encaja en una GPU de 16 GB.
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM (RTX 4080, RTX 4090, A100, H100). El autor indica que cabe en una sola GPU de 16 GB.
- Cabe en GPU consumer: si, en modelos con 16 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-server -m MoSV-Qwen3-4B-F16.gguf -ngl 999 -fa on --jinja`) y LM Studio. Requiere una build de llama.cpp con la arquitectura `hy_v3`.
- KV cache: usar Q8_0 o Q4_0; Q4_1 no tiene kernel de Flash Attention.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoSV (este modelo) | 4B + expertos de steering | No disponible | Steering vectors como MoE, 8 tematicas | Apache-2.0 | GGUF en HF, llama.cpp y LM Studio |
| Qwen3-4B-Instruct-2507 | 4B | No disponible | LLM generalista | Apache-2.0 | HF, multiples formatos |
| v3 del mismo proyecto | 4B + 8 vectores | No disponible | Steering vectors con router por prompt | Apache-2.0 | Vectores GGUF y router `.pt` en HF |

No se dispone de datos de benchmarks estandar para comparar con otros modelos de la misma categoria mas alla de la evaluacion subjetiva del autor.

## Limitaciones y advertencias

- Proyecto de investigacion: no esta pensado para produccion sin validacion adicional.
- Las tematicas de ingenieria y matematicas no mejoran respecto al modelo base; cada tematica cuenta solo con 10 prompts de prueba, por lo que la significancia estadistica es baja.
- El enrutamiento funciona bien entre turnos de conversacion (91-100% de tokens con el experto correcto), pero dentro de un mismo prompt que mezcla dos tareas el experto de la segunda parpadea token a token.
- No existe override por peticion: para respuestas sin steering hay que usar el Qwen3-4B-Instruct-2507 original.
- No se ha evaluado la precision factual con los vectores activados; riesgo de alucinacion no cuantificado.
- Solo soporta ingles.
- La evaluacion la realiza Claude Haiku como juez, lo que introduce sesgo del evaluador y no sustituye a benchmarks estandar.
- Requiere una build de llama.cpp con arquitectura `hy_v3`; no funciona en versiones antiguas.
- El conteo de parametros reportado en safetensors (7680) no refleja el tamano real del modelo y puede confundir a herramientas automatizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhndayesh/mosv
- Codigo, pipeline y write-ups: https://github.com/mhndayesh/mosv
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper de inspiracion: https://arxiv.org/abs/2611.26627
