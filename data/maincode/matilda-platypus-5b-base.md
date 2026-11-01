# Maincode/Matilda-Platypus-5B-Base

## Resumen

Matilda Platypus 5B es un modelo de lenguaje de tamaño intermedio desarrollado por Maincode (Matilda Research) mediante una técnica de "Representation Bridge": conecta las 9 capas inferiores de Qwen3-8B-Base con las 27 capas superiores de Qwen3-4B-Base a través de un mapa lineal aprendido de 10,5 millones de parámetros. El resultado es un modelo de 5,48B parámetros que consume 10,3 GFLOP por token (el 66% del cómputo del padre grande) y que, según la evaluación de los autores, se sitúa entre ambos padres en la mayoría de benchmarks, superando incluso al padre de 8B en GSM8K.

El problema que aborda es la creación de modelos de tamaños arbitrarios a partir de modelos preentrenados existentes, sin entrenar desde cero. Esto es relevante porque permite generar puntos de la curva escala-rendimiento a coste reducido, reutilizando pesos ya publicados. El modelo se entrega como base model (sin ajuste por instrucciones ni tuning de seguridad), con licencia Apache 2.0, pesos en safetensors y una arquitectura híbrida cargada mediante código remoto en `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida por composicion de capas: 9 capas de Qwen3-8B-Base + Representation Bridge lineal + 27 capas de Qwen3-4B-Base (corte 9+27) |
| Parametros totales | 5,48B (incluye 10,5M del bridge) |
| Parametros activos | no disponible (no es MoE; todos los parametros activos en cada pasada) |
| Longitud de contexto | no disponible (heredada de los padres Qwen3; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (solo bfloat16 nativo; sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (tokenizer de Qwen3; datos de adaptacion en web, codigo y matematicas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bridge.safetensors + upper_block/) con custom code (trust_remote_code=True) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer entrenado de cero, sino una composición: el paso forward recorre el embedding y las capas 1-9 de Qwen3-8B-Base, luego un Representation Bridge (una única transformación lineal de 4096 a 2560 unidades ocultas, 10,5M de parámetros) que alinea las representaciones en el punto de conexión, y finalmente las capas 10-36 de Qwen3-4B-Base con su normalización final y cabeza de salida. El bloque inferior permanece congelado con los pesos originales publicados; el bloque superior incorpora actualizaciones de bajo rango (LoRA) fusionadas en los pesos. Cada bloque mantiene su propia caché KV. El tokenizador es el de Qwen3.

El entrenamiento constó de tres fases: (1) inicialización del bridge por mínimos cuadrados sobre un pequeño conjunto de calibración, usando la pérdida de modelado del lenguaje para seleccionar el punto de corte entre candidatos; (2) adaptación supervisada del bridge y de las actualizaciones de bajo rango sobre unos pocos miles de millones de tokens de texto web mixto, código, matemáticas y soluciones razonadas; (3) una fase corta de aprendizaje por refuerzo con recompensas verificables (RLVR) sobre problemas de código con tests unitarios y problemas de matemáticas con respuesta comprobable. No se menciona RLHF ni DPO clásicos.

## Capacidades

- Generacion de texto continuo (base model): completamiento de texto, no sigue instrucciones ni tiene plantilla de chat.
- Razonamiento matematico: 0,879 en GSM8K 8-shot con chain-of-thought, por encima de ambos padres.
- Generacion de codigo: 0,598 pass@1 en HumanEval y 0,620 en MBPP, entre los dos padres.
- Comprension general: MMLU 5-shot de 0,712; BBH 3-shot CoT de 0,710.
- Compatibilidad completa con la API estandar de `generate` de `transformers` (muestreo, temperature, top_k, top_p, stopping_criteria, streamer, etc.), por lo que funciona sin cambios bajo lm-eval-harness.
- Integracion con pipelines de evaluacion estandar (`--model hf --model_args pretrained=...,trust_remote_code=True`).
- No incluye tool calling, function calling, agentes, ni capacidades de vision o audio: es un base model de texto.

## Casos de uso

- Investigacion en tecnicas de composicion de modelos: al ser un ejemplo publicado y reproducible de "layer fusion" con bridge aprendido, sirve como punto de partida para estudiar alineacion de representaciones entre modelos de distinto tamano.
- Completamiento de codigo en editores: como base model con 0,598 pass@1 en HumanEval, puede usarse para autocompletado tipo FIM o continuacion de codigo en IDEs, con un coste por token un 34% menor que Qwen3-8B-Base.
- Generacion de razonamiento matematico sintetico: su puntuacion destacada en GSM8K (0,879) lo hace util como generador de soluciones paso a paso para crear datasets de destilacion matematica.
- Fine-tuning posterior por terceros: al ser Apache 2.0 y de 5,48B parametros, es un candidato realista para SFT/DPO en GPUs de un solo nodo, obteniendo un modelo instruido de tamano intermedio sin partir de cero.
- Evaluacion comparativa estandarizada: se integra directamente en lm-eval-harness sin modificaciones, util para benchmarks reproducibles de base models.
- Despliegue con presupuesto de computo acotado: con 10,3 GFLOP por token frente a 15,7 del padre de 8B, es adecuado para servicios donde el coste de inferencia por token importa mas que el maximo rendimiento absoluto.
- Generacion de datos de preentrenamiento: como base model de texto general, puede emplearse para generar corpus sinteticos filtrados por perplejidad o clasificadores.

## Benchmarks y rendimiento

Evaluacion con lm-eval-harness 0.4.13, protocolo identico para el modelo y ambos padres (MMLU 5-shot, GSM8K 8-shot CoT, BBH 3-shot CoT, HumanEval 0-shot, MBPP 3-shot con ejecucion del codigo generado).

| Benchmark | Qwen3-4B-Base | Platypus 5B | Qwen3-8B-Base |
|---|---|---|---|
| HumanEval pass@1 | 0,628 | 0,598 | 0,677 |
| GSM8K (8-shot CoT) | 0,844 | 0,879 | 0,862 |
| MMLU (5-shot) | 0,730 | 0,712 | 0,768 |
| BBH (3-shot CoT) | 0,712 | 0,710 | 0,774 |
| HellaSwag | 0,737 | 0,722 | 0,786 |
| ARC-Easy | 0,761 | 0,755 | 0,798 |
| ARC-Challenge | 0,517 | 0,532 | 0,572 |
| OpenBookQA | 0,406 | 0,408 | 0,416 |
| WinoGrande | 0,702 | 0,684 | 0,723 |
| PIQA | 0,778 | 0,773 | 0,794 |
| LAMBADA | 0,691 | 0,684 | 0,711 |
| MBPP pass@1 | 0,672 | 0,620 | 0,696 |
| BoolQ | 0,832 | 0,836 | 0,832 |

Supera al padre pequeño en 4 de 13 benchmarks y al padre grande en 2 de 13, con el 66% del cómputo del padre grande (10,3 frente a 15,7 GFLOP por token; el padre pequeño consume 8,7). Los autores advierten que las diferencias de unas decimas pueden estar dentro de la varianza entre ejecuciones. El cómputo es una medida relativa del informe, no una medicion verificada de latencia o coste.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,48B parametros en bfloat16, unos 11 GB solo de pesos; en la practica, 16 GB son suficientes para inferencia con contexto moderado. No hay cuantizaciones publicadas, por lo que no se puede estimar consumo en 4/8 bits.
- GPU recomendadas: cualquier GPU consumer de 16 GB o mas (RTX 4090, RTX 4080, RTX 5080) para inferencia; A100 o H100 para fine-tuning o servicio con concurrencia.
- Cabe en GPU consumer: si, en una RTX 4090 (24 GB) con holgura para contextos largos y KV cache de ambos bloques.
- Opciones de despliegue: `transformers >= 4.56` (probado en 4.56 y 5.x) con `trust_remote_code=True` es el camino documentado; el codigo remoto carga el bloque inferior desde Qwen/Qwen3-8B-Base en el hub, por lo que el despliegue requiere acceso a ese repositorio. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI; dado el custom code y la arquitectura hibrida, es probable que no funcione fuera de `transformers` sin adaptacion.
- Latencia y throughput: no disponibles; solo se publica el consumo teorico de 10,3 GFLOP por token.
- Nota practica: el codigo remoto requiere descargar pesos de dos repositorios (el propio y Qwen3-8B-Base), lo que aumenta el tiempo de arranque en despliegues.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Matilda Platypus 5B (base) | 5,48B | Hibrida 9+27 con bridge lineal | no disponible | Apache 2.0 | HuggingFace, custom code |
| Qwen3-4B-Base | 4B | Transformer denso | no disponible en esta ficha | Apache 2.0 | HuggingFace, soporte nativo transformers/vLLM |
| Qwen3-8B-Base | 8B | Transformer denso | no disponible en esta ficha | Apache 2.0 | HuggingFace, soporte nativo transformers/vLLM |

En rendimiento, Platypus 5B se situa entre ambos padres en la mayoria de benchmarks (con GSM8K por encima de ambos), pero con la ventaja de coste frente al 8B. Su principal desventaja practica frente a los padres es la dependencia de custom code y la doble descarga de pesos, lo que limita la compatibilidad con runtimes optimizados.

## Limitaciones y advertencias

- Es un base model: no esta ajustado por instrucciones ni alineado en seguridad. Continua texto y puede generar contenido ofensivo o incorrecto sin filtros.
- Sesgos: hereda los sesgos de los dos padres Qwen3 y de los datos de adaptacion (web, codigo, matematicas); no se ha publicado auditoria de sesgos.
- Alucinacion: como todo base model sin alineacion, el riesgo de generar hechos falsos con fluidez es alto; no hay datos de evaluacion de veracidad publicados.
- Idiomas: no se especifican; el rendimiento fuera de ingles no esta evaluado en la informacion disponible.
- Contexto: la longitud de ventana no esta documentada en la model card; debe verificarse antes de usarla en produccion.
- Decodificacion: solo greedy y muestreo; beam search lanza `NotImplementedError`.
- Codigo remoto: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repo; revisarlo antes de usar en entornos sensibles. Ademas, la revision 1 del codigo remoto ignoraba `max_length` y `stopping_criteria` y subestimaba benchmarks generativos (GSM8K leia ~0,58); usar la revision 2 (2026-10-31) o posterior.
- Rendimiento marginal: las mejoras sobre los padres son de pocas decimas y los propios autores las consideran dentro de la varianza; el valor principal es el metodo, no un salto de calidad.
- Comunidad: 395 descargas y 0 likes en el momento de la ficha; expectativa de soporte y correccion de bugs limitada.
- Licencia: Apache 2.0 permite uso comercial sin restricciones destacables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Maincode/Matilda-Platypus-5B-Base
- Modelo base (padre grande): https://huggingface.co/Qwen/Qwen3-8B-Base
- Modelo base (padre pequeño): https://huggingface.co/Qwen/Qwen3-4B-Base
- Informe tecnico Qwen3 (referenciado en la model card): https://arxiv.org/abs/2505.09388
- Informe tecnico de Matilda Platypus: incluido en el repositorio como `technical_report.pdf` (no hay URL externa publicada)
