# Cryptojim/borg-graphiti-extraction-qwen3-4b

## Resumen

Cryptojim/borg-graphiti-extraction-qwen3-4b es un adaptador LoRA para el modelo base mlx-community/Qwen3-4B-Instruct-2507-4bit, desarrollado por Cryptojim como parte del proyecto Borg, un sistema de memoria compartida local-first para agentes de IA. El modelo convierte episodios de texto en objetos de extracción estrictos con formato Graphiti, es decir, estructuras JSON con listas de entidades y relaciones, destinadas a alimentar grafos de conocimiento temporales. Resuelve el problema de extraer información estructurada de textos de forma eficiente y local, sin depender de servicios en la nube.

El adaptador se entrena con mlx_lm lora sobre un modelo Qwen3-4B cuantizado a 4 bits, lo que permite ejecutarlo en hardware de Apple Silicon con bajo consumo de recursos. Según la model card, el adaptador tiene 7,34 millones de parámetros entrenables, lo que supone un 0,182% de los parámetros del modelo base. La ventana de contexto no se especifica en la información disponible, aunque el entrenamiento se realizó con secuencias de 4096 tokens.

La relevancia de este modelo radica en su especialización: no es un modelo de propósito general, sino una herramienta de extracción de grafos de conocimiento para el ecosistema Borg. Su evaluación interna muestra una tasa de JSON válido del 93,5% y un acuerdo de nombres de entidades de 0,654 frente a un profesor, superando la barrera de acuerdo entre profesores (0,53). Sin embargo, el autor advierte que el checkpoint anterior falló en producción y que este retrain hereda un alcance limitado, por lo que se recomienda una validación propia antes de usarlo en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen3-4B-Instruct-2507-4bit (transformer decoder-only) |
| Parametros totales | 4B (modelo base) + 7,34M (adapter LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con seq 4096) |
| Tipos de cuantizacion | 4-bit MLX para el modelo base; adapter sin cuantizar (formato no especificado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Adapter MLX (formato no especificado en la informacion); modelo base en safetensors MLX 4-bit |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 8 aplicado a 16 capas del modelo base Qwen3-4B-Instruct-2507-4bit, que está cuantizado a 4 bits en formato MLX. El entrenamiento se realizó con mlx_lm lora, utilizando un tamaño de lote de 4, una longitud de secuencia de 4096 tokens y una tasa de aprendizaje de 1e-5. El proceso finalizó en el intento número 4, después de tres caídas por recuperación de GPU Metal durante el entrenamiento.

Los datos de entrenamiento son pares destilados de un entorno de operador único, con identificadores eliminados antes del entrenamiento: nombres de clientes, dominios, nombres de contacto, números de teléfono y cadenas con forma de token fueron reemplazados por sustitutos sintéticos. El autor indica que los pares de entrenamiento son privados, pero el pipeline completo para construir un adaptador propio a partir del tráfico propio está disponible en el repositorio de Borg. No se menciona el uso de RLHF ni DPO; la técnica empleada es supervisada mediante destilación.

La innovación técnica destacable no es arquitectónica, sino funcional: el adaptador está diseñado para producir salidas JSON estrictas con el esquema Graphiti, incluyendo entidades y relaciones con fechas. Además, se aplicó una sonda de memorización adversarial antes de la publicación, que no encontró coincidencias con los términos sensibles del registro del entorno original.

## Capacidades

- Extracción de entidades y relaciones en formato JSON estricto: `{"entities":[...],"relations":[...]}`.
- Generación de salidas JSON válidas en el 93,5% de los casos en el examen held-out de 400 pares.
- Asignación de fechas a las relaciones extraídas, con una fracción fechada de 0,86.
- Integración con el sistema Borg como componente de extracción para memoria compartida de agentes.
- Compatibilidad limitada al modelo base exacto mlx-community/Qwen3-4B-Instruct-2507-4bit.
- No se documentan capacidades de tool calling, vision, audio, razonamiento multi-paso ni soporte de agentes en el sentido general.

## Casos de uso

- Construcción de grafos de conocimiento temporales: el modelo convierte episodios de texto en entidades y relaciones con fechas, listas para insertarse en una base de datos de grafos como Graphiti. Es adecuado porque su salida ya sigue el esquema esperado.
- Memoria compartida para agentes IA locales: dentro del sistema Borg, el adaptador extrae hechos de las interacciones del agente y los almacena en el grafo para consultas posteriores. Su bajo coste de ejecución en Apple Silicon permite mantener la memoria en local.
- Procesamiento de documentos en pipelines de extracción de información: se puede integrar en un pipeline que recibe documentos y produce estructuras de grafo para análisis downstream. La alta tasa de JSON válido reduce la necesidad de post-procesamiento.
- Enriquecimiento de sistemas RAG: las entidades y relaciones extraídas se utilizan para crear índices estructurados que mejoran la recuperación en sistemas de generación aumentada, aportando contexto relacional a los fragmentos de texto.
- Normalización de datos sensibles en entornos privados: al estar entrenado con identificadores eliminados, es adecuado para procesar datos de clientes o dominios sin memorizar valores originales, como muestra la sonda de memorización con cero coincidencias.
- Destilación de datos de entrenamiento: el modelo puede generar pares de texto a grafo a partir del tráfico propio, que luego se usan para entrenar modelos más grandes o para crear conjuntos de datos específicos. El pipeline para ello es open source en el repositorio de Borg.
- Análisis de relaciones en logs o conversaciones: extrae quién se relaciona con qué y cuándo, útil para auditorías, trazabilidad o análisis de comportamiento en sistemas de agentes.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados por el autor en la model card para este checkpoint exacto. No se han encontrado benchmarks comparativos con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| Held-out exam | 400 pares |
| JSON-valid | 374/400 (93,5%) |
| Entity-name Jaccard vs teacher | 0,654 (barrera: 0,53 = acuerdo entre profesores) |
| Entity Jaccard p10 | 0,278 |
| Relation-count ratio | 1,02 |
| Dated-fraction | 0,86 |
| Serving (M3 Ultra, contended) | ~39 tok/s, ~19,6 s/item |
| Training | 2.800 iteraciones, ~11,6M tokens en el segmento final, 7,34M parametros entrenables (0,182%) |
| Memorization probe | 36 generaciones, 56 terminos de registro, 0 coincidencias |
| Promotion canary | No canaried |

## Requisitos de hardware

- El adaptador está diseñado para MLX y se ejecuta en Apple Silicon. La evaluación se realizó en un Apple M3 Ultra con carga compartida.
- VRAM estimada: el modelo base Qwen3-4B en 4-bit MLX ocupa aproximadamente 2-3 GB de memoria unificada; el adaptador añade un overhead mínimo debido a sus 7,34 millones de parámetros.
- GPU recomendada: Apple Silicon con memoria unificada (M1, M2, M3 o superior). No se recomienda para GPU NVIDIA, ya que MLX es específico de Apple.
- Opciones de despliegue: mediante mlx-lm, con el comando `python -m mlx_lm generate --model mlx-community/Qwen3-4B-Instruct-2507-4bit --adapter-path <repo> --prompt "..."`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~39 tokens por segundo y ~19,6 segundos por ítem en M3 Ultra con carga. El throughput exacto no se especifica.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks comparativos con otros modelos o adaptadores en la información disponible. El único dato comparativo interno es la barrera de acuerdo entre profesores (0,53) para la métrica de nombres de entidades, que este adaptador supera con 0,654. No se dispone de comparaciones con otros adaptadores LoRA de extracción de grafos ni con el modelo base sin adaptar.

## Limitaciones y advertencias

- El adaptador solo funciona con el modelo base exacto mlx-community/Qwen3-4B-Instruct-2507-4bit. Usarlo con otro modelo producirá resultados incorrectos, ya que un adaptador LoRA es un delta sobre pesos congelados específicos.
- No es un modelo de propósito general: su única función documentada es la extracción de entidades y relaciones para grafos de conocimiento. No se han verificado capacidades de tool calling, razonamiento general ni soporte multilingüe.
- Riesgo de alucinación en entidades: el entity Jaccard p10 es 0,278, lo que indica que las entidades menos relevantes pueden ser imprecisas o no coincidir con el profesor.
- El predecesor de este checkpoint falló en producción, manejando correctamente solo 1 de 25 episodios reales del pipeline, porque se había entrenado en 1 de las 6 formas de llamada internas. Este retrain hereda ese mismo alcance de una sola forma, por lo que su rendimiento en pipelines reales puede ser limitado.
- No ha pasado la promotion canary, una prueba de promoción que el autor recomienda ejecutar antes de usar el modelo en producción.
- Los datos de entrenamiento son privados, por lo que no se puede auditar su composición ni verificar la ausencia total de sesgos.
- La licencia MIT se aplica al adaptador y al repositorio, pero el modelo base Qwen3-4B puede tener requisitos adicionales según su propia licencia, que no se detalla en la información proporcionada.

## Enlaces

- HuggingFace: https://huggingface.co/Cryptojim/borg-graphiti-extraction-qwen3-4b
- Repositorio Borg: https://github.com/h3ro-dev/borg
- Modelo base mlx-community/Qwen3-4B-Instruct-2507-4bit: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
- Modelo original Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
