# DangerLabs/DM-JEPA

## Resumen

DM-JEPA (Decision-Making Joint Embedding Predictive Architecture) es un modelo de 308.272.641 parametros desarrollado por Danger Labs que no genera texto: es un motor de decision no autorregresivo que evalua conjuntos de opciones candidatas y devuelve una distribucion de probabilidad calibrada sobre ellas. Se apoya en los principios de la Joint Embedding Predictive Architecture (JEPA) popularizada por Yann LeCun y traslada el razonamiento multi-paso al espacio latente, en lugar de emitir tokens de cadena de pensamiento (Chain-of-Thought) de forma autorregresiva.

El problema que aborda es la latencia y la inestabilidad de los LLM generativos en tareas de seleccion cerrada (enrutado, clasificacion de intenciones, politicas de decision). El autor declara una latencia mediana de 33,1 ms por peticion en una unica GPU de consumo, frente a los 1.500-8.000 ms que atribuye a LLM autorregresivos de 7.000 a 70.000 millones de parametros, y una evaluacion listwise de todas las opciones en un solo forward pass.

La relevancia del modelo es mas conceptual que practica: es un ejemplo de arquitectura predictiva en espacio latente aplicada a decision, con encoder de contexto basado en `answerdotai/ModernBERT-base` (ventana de 8192 tokens) y cabezas propias. La ficha tecnica se basa exclusivamente en la model card del autor y en la informacion publica disponible; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida no autorregresiva: encoder de contexto ModernBERT-base + encoder de criterios + verificador predictivo latente recurrente (GRU) + scorer de compatibilidad coseno |
| Parametros totales | 308.272.641 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en el encoder de estado (ModernBERT-base); en el ejemplo de uso se truncan el estado a 2048 y cada opcion a 256 tokens |
| Tipos de cuantizacion | No disponible (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (requiere codigo propio, `modeling_dm_jepa.py`) |

Otros datos: pipeline declarado `feature-extraction`, tamano del repositorio 1,9 GB, publicado el 4 de octubre de 2026 por la organizacion Danger Labs.

## Arquitectura y entrenamiento

El modelo se compone de cuatro modulos encadenados. El primero es un encoder de contexto de estado construido sobre `answerdotai/ModernBERT-base`, que produce embeddings contextuales de la secuencia `h_state` con soporte de hasta 8192 tokens. El segundo es un encoder de criterios que proyecta cada opcion candidata `Y_1...Y_K` en un embedding ancla `s_options`. El tercero es el verificador predictivo latente recurrente de M pasos (GRU-gated thought rollout), que ejecuta 4 pasos de deduccion cross-attentiva en espacio de pensamiento condicionados por los hechos del estado, y produce un vector objetivo anticipado `s_hat`. El cuarto es el scorer de compatibilidad latente, que calcula el producto interno normalizado (similitud coseno) entre `s_hat` y cada `s_options`, escalado por una temperatura de calibracion aprendible, para devolver `P(Y_k | X)`.

La innovacion declarada es doble: el razonamiento se realiza integramente en espacio latente (sin decodificacion de tokens) y la evaluacion es listwise, es decir, todas las candidatas se puntuan en un unico forward pass con self-attention entre candidatas y verificacion cross-attentiva contra los hechos del estado. El numero total de parametros (308M) es coherente con un encoder ModernBERT-base (~150M) mas cabezas y proyecciones adicionales.

No se dispone de informacion sobre el corpus de entrenamiento: no se indican numero de tokens, composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. Tampoco se detalla la funcion de perdida exacta ni el procedimiento de calibracion de la temperatura.

## Capacidades

- Seleccion listwise de opciones: dado un estado del entorno y un conjunto arbitrario de criterios candidatos, devuelve una distribucion de probabilidad normalizada sobre todas las opciones en un solo forward pass.
- Razonamiento en espacio latente: 4 pasos recurrentes de deduccion cross-attentiva sin generar tokens intermedios.
- Comparacion de opciones entre si: la self-attention inter-candidata permite que las opciones se condicionen mutuamente durante la puntuacion.
- Verificacion de hechos contra el estado: la atencion cruzada entre `s_hat` y los hechos del estado actua como mecanismo de contraste.
- Inferencia de baja latencia: el autor reporta 33,1 ms de mediana por peticion en una GPU de consumo, sin decodificacion secuencial.
- Extraccion de caracteristicas: el pipeline declarado es `feature-extraction`, por lo que los embeddings internos son accesibles.
- No soporta generacion de texto, tool calling, function calling, agentes multi-paso con uso de herramientas, vision, audio ni modo de pensamiento explicito con trazas textuales. Estas capacidades no se mencionan en la informacion disponible y son incoherentes con la arquitectura descrita.
- Multilingue: solo ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Enrutado de intenciones en atencion al cliente: el modelo recibe la transcripcion del usuario como estado y la lista de intenciones posibles (cancelar transferencia, pedir tarjeta, cambiar PIN, consultar tipos de cambio) y devuelve la probabilidad de cada una en decenas de milisegundos, lo que permite encadenar un clasificador rapido antes de llamar a un LLM generativo en los casos ambiguos.
- Seleccion de herramientas en un agente: si el conjunto de herramientas disponibles es finito y conocido, DM-JEPA puede puntuar cual encaja mejor con el estado actual de la conversacion, sustituyendo una llamada a un LLM grande en el bucle de control.
- Politicas de decision en entornos simulados: el propio autor evalua el modelo en el Home Appliance Simulator con un 91,12% de exactitud de campo (82,25% de skill frente al azar), lo que apunta a su uso en simuladores de electrodomesticos o entornos de control con acciones discretas.
- Triaje y priorizacion de tickets: dado el texto de un ticket y un conjunto de colas o equipos de destino, obtener una distribucion de asignacion y usarla para enrutar con umbral de confianza.
- Moderacion de contenido con categorias cerradas: puntuar un texto contra un conjunto fijo de etiquetas de politica y escalar a revision humana cuando la distribucion no es concluyente.
- Sistemas de recomendacion con candidatos acotados: puntuar simultaneamente un conjunto de items o acciones candidatas dadas las preferencias declaradas del usuario, aprovechando la evaluacion listwise en un solo paso.
- Investigacion en arquitecturas JEPA aplicadas a lenguaje: servir como punto de partida reproducible (licencia MIT, safetensors) para estudiar entrenamiento en espacio de embeddings frente a reconstruccion en espacio de entrada, en la linea del paper LLM-JEPA.
- Verificacion rapida de reglas de negocio: comprobar si una accion propuesta por otro sistema es compatible con el estado del entorno antes de ejecutarla, con latencia compatible con bucles de control en tiempo real.

## Benchmarks y rendimiento

Resultados declarados por el autor bajo el protocolo Decision Index v0.2 / v0.2.1. Se reproduce la tabla de la model card sin modificaciones; no existe verificacion independiente.

| Benchmark | Metrica | DM-JEPA | Azar |
|---|---|---|---|
| GSM8K (razonamiento aritmetico) | Raw Accuracy / Skill | 100,00% / 100,00% | 25,00% |
| Home Appliance Simulator | Field Accuracy / Field Skill | 91,12% / 82,25% | 50,00% |
| OpenJev High-Trust Suite | Raw Accuracy / Brier | 100,00% / 0,0000 | 25,00% |
| Jevbench-Hard | Raw Accuracy / Trap Avoidance | 85,59% / 92,45% | 25,00% |
| WinoGrande | Accuracy | 56,00% | 50,00% |
| ANLI (Adversarial NLI) | Macro-F1 | 44,51% | 33,24% |
| ARC-Challenge | Accuracy | 42,00% | 25,02% |
| HellaSwag | Accuracy | 40,00% | 25,00% |
| Latencia mediana de inferencia | Tiempo por peticion | 33,1 ms | No aplica |

Advertencia de interpretacion: varios de estos benchmarks (GSM8K, WinoGrande, ARC-Challenge, HellaSwag) son pruebas de respuesta abierta o de eleccion multiple con distractores generados por el propio evaluador, no tareas nativas de seleccion listwise. Un 100% en GSM8K con 308M de parametros es muy improbable en la formulacion estandar del benchmark y sugiere una reformulacion del protocolo (por ejemplo, evaluacion con opciones predefinidas). No se han publicado resultados de benchmarks independientes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 308,27M de parametros, los pesos ocupan aproximadamente 1,23 GB en fp32 y 0,62 GB en fp16/bf16. Sumando activaciones, tokenizer y overhead del runtime, se puede operar con menos de 2 GB en fp16 y en torno a 2-3 GB en fp32 con lotes pequenos. Estas cifras son estimaciones a partir del recuento de parametros, no datos publicados por el autor.
- GPU recomendadas: no hay una lista publicada. Dado el tamano, cualquier GPU con al menos 4 GB de VRAM es suficiente; el autor mide la latencia de 33,1 ms en "una unica GPU de consumo".
- GPU de consumo: si, cabe holgadamente en tarjetas tipo RTX 3060 (12 GB), RTX 4060, RTX 4070 o superiores. Tambien deberia ejecutarse en CPU, con latencias muy superiores a las declaradas.
- Despliegue: no hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama. La model card usa una clase propia (`DMJEPA`) importada desde `modeling_dm_jepa.py`, con `torch` y `transformers` como dependencias declaradas (`pip install torch transformers huggingface_hub safetensors`). Esto implica cargar codigo no incluido en el paquete estandar de Transformers.
- Latencia y throughput: 33,1 ms de mediana por peticion segun el autor en GPU de consumo. No se publican cifras de throughput agregado, uso de memoria pico ni rendimiento por lote.
- Datos de entrenamiento: no disponible.

## Comparativa con modelos similares

No existen alternativas publicas directamente comparables: DM-JEPA es un modelo de decision listwise no autorregresivo, una categoria poco poblada en Hugging Face. La tabla siguiente compara con referencias cercanas en arquitectura o funcion, marcando como no disponible todo dato que no consta en la informacion proporcionada.

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DM-JEPA (DangerLabs) | 308,27M | 8192 tokens (encoder de estado) | Decision listwise en espacio latente, no autorregresiva | MIT | Hugging Face, requiere codigo propio |
| ModernBERT-base (answerdotai) | No disponible en la informacion proporcionada | 8192 tokens | Encoder de representaciones, clasificacion y extraccion de caracteristicas | No disponible en la informacion proporcionada | Hugging Face, integrado en Transformers |
| LLM-JEPA (paper arXiv 2509.14252) | No disponible | No disponible | Marco de preentrenamiento y ajuste con objetivos JEPA para LLM | No disponible | Publicacion academica, no un modelo publicado |
| LLM autorregresivo de 7B (categoria generica citada por el autor) | 7.000M | No disponible | Generacion de texto y razonamiento con CoT | No disponible | Amplia disponibilidad |

La comparacion relevante es funcional: frente a un LLM generativo, DM-JEPA no produce texto ni trazas de razonamiento, de modo que no es sustituible en tareas de generacion, codigo o dialogo abierto. Su ventaja declarada es la latencia (33,1 ms frente a los 1.500-8.000 ms que el autor atribuye a LLM de 7B-70B) y la salida calibrada sobre un conjunto cerrado de opciones.

## Limitaciones y advertencias

- Rendimiento debil en comprension general: en WinoGrande (56,00% frente a 50% de azar), ARC-Challenge (42,00% frente a 25,02%) y HellaSwag (40,00% frente a 25,00%) la mejora sobre el azar es marginal. En ANLI el macro-F1 es del 44,51% con un azar del 33,24%. El modelo no es un sustituto de un LLM para tareas de comprension o sentido comun.
- Resultados no verificados: todos los benchmarks proceden de la model card del autor y usan el protocolo Decision Index, promovido por el mismo ecosistema. No hay evaluacion independiente, ni paper revisado por pares, ni tercera parte que reproduzca las cifras. El 100% declarado en GSM8K y en OpenJev es especialmente sospechoso y deberia tratarse como no confirmado.
- Afirmaciones de marketing: la model card afirma "Zero Token Hallucination". Es una afirmacion del autor, no un resultado medido. El modelo puede equivocarse en la puntuacion de opciones; simplemente no alucina tokens porque no genera tokens.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, con fechas de creacion y actualizacion separadas por 23 segundos. No hay comunidad, issues ni casos de uso documentados por terceros.
- Solo ingles: la etiqueta de idioma es `en`. No se declara soporte multilingue y no hay datos sobre transferencia a otros idiomas.
- Integracion no estandar: requiere cargar `modeling_dm_jepa.py` y una clase propia, lo que complica el despliegue en servidores de inferencia estandar (vLLM, TGI) y en runtimes moviles o embebidos.
- Categoria de tarea restringida: no genera texto, no hace tool calling y no soporta agentes con razonamiento multi-paso explicito. Solo puntua un conjunto cerrado de opciones predefinidas; si la respuesta correcta no esta en la lista, el modelo no puede producirla.
- Dependencia de la tokenizacion externa: el ejemplo de uso emplea el tokenizer de `answerdotai/ModernBERT-base`, por lo que cambios en ese tokenizer afectarian al modelo.
- Licencia: MIT, permisiva para uso comercial y modificacion, sin restricciones declaradas. Al ser MIT, tampoco hay garantia alguna por parte del autor.
- Sin datos de entrenamiento: se desconoce el corpus, el numero de tokens, si hubo ajuste por preferencias y que sesgos puede haber heredado. Sin esa informacion no es posible evaluar sesgos de forma rigurosa.
- Fechas inusuales: el repositorio figura creado el 4 de octubre de 2026, posterior a la fecha habitual de consulta. Conviene verificar la vigencia y autenticidad del repositorio antes de integrarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DangerLabs/DM-JEPA
- Organizacion Danger Labs en Hugging Face: https://huggingface.co/DangerLabs
- Repositorio del protocolo Decision Index: https://github.com/apolinario/decision-index
- Encoder base utilizado, ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Paper LLM-JEPA: Large Language Models Meet Joint Embedding Predictive Architectures: https://arxiv.org/abs/2509.14252
- Delta-JEPA: Learning Action-Sensitive World Models via Latent Prediction: https://arxiv.org/abs/2606.31232
- Mapa de la familia JEPA (Turing Post): https://www.turingpost.com/p/jepamap
- Otro modelo de Danger Labs, HuMe: https://huggingface.co/DangerLabs/HuMe
