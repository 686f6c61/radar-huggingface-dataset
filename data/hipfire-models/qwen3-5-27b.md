# hipfire-models/qwen3.5-27b

## Resumen

Qwen3.5-27B para hipfire es una distribución pre-cuantizada del modelo Qwen3.5-27B de Alibaba Qwen, empaquetada por el proyecto hipfire-models para su uso con hipfire, un motor de inferencia nativo en Rust sobre HIP para GPUs AMD de consumo (RDNA1–RDNA4). No se trata de un modelo nuevo, sino de una conversión de pesos a formatos propietarios del motor (HF4, HF6 y MQ4) que elimina la dependencia de Python en la ruta crítica de inferencia y permite ejecutar un modelo de 27.000 millones de parámetros en GPUs AMD de gama alta con 16 GB de VRAM.

El modelo base es un transformer híbrido con capas DeltaNet (atención lineal) combinadas con atención estándar, según indica la model card. La distribución incluye tres variantes de cuantización: HF4 (4 bits plano, ~4,25 bits por peso), HF6 (6 bits plano, ~6,25 bits por peso) y MQ4 (4 bits con rotación Walsh–Hadamard y calibración AWQ, misma huella que HF4 pero con calidad cercana a Q8). El repositorio ocupa 100,4 GB e incluye el tokenizador y la configuración embebidos en cada fichero de pesos.

La relevancia actual de esta ficha radica en dos factores: por un lado, demuestra que el ecosistema de inferencia para GPUs AMD de consumo está madurando con motores nativos (no solo ROCm + PyTorch); por otro, la técnica MQ4 con rotación FWHT y calibración AWQ es un ejemplo concreto de cómo reducir el error de cuantización a 4 bits sin cambiar el ancho de banda de memoria. El modelo base Qwen3.5-27B, sin embargo, no está documentado en la información disponible más allá de su nombre y su naturaleza híbrida DeltaNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas DeltaNet (atención lineal) y atención estándar |
| Parametros totales | 27 000 millones (27B, según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HF4 (HFQ4-G256, 4 bits plano, ~4,25 B/peso), HF6 (HFQ6-G256, 6 bits plano, ~6,25 B/peso), MQ4 (MagnumQuant 4 bits con rotación FWHT y calibración AWQ, 4,25 B/peso) |
| Idiomas soportados | no disponible |
| Licencia | MIT (pesos sujetos a la licencia original de Qwen) |
| Formato de pesos | Formatos propietarios de hipfire: .hf4, .hf6, .mq4 (tokenizador y config embebidos) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B es, según la model card, un transformer híbrido con capas DeltaNet. DeltaNet es una variante de atención lineal con actualización delta que sustituye parte de la atención cuadrática por un mecanismo recurrente de complejidad lineal, lo que reduce el coste computacional y de memoria en contextos largos. La model card no detalla cuántas capas son DeltaNet y cuántas son atención estándar, ni el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO.

La innovación técnica destacable de esta distribución no está en el modelo base sino en la cuantización MQ4: los pesos se pre-rotan mediante una transformada de Walsh–Hadamard (FWHT) en el momento de la cuantización, y el vector de entrada se rota con la misma transformada en tiempo de ejecución durante el GEMV. Esta rotación aplana los valores atípicos y mejora la distribución del error de cuantización, de modo que MQ4 alcanza una calidad cercana a Q8 con el ancho de banda de Q4. La build MQ4 actual (reemplazada el 2026-05-28) está calibrada con AWQ sobre el tronco mi300x v3 y reporta una reducción del 42% en KLD frente a la MQ4 anterior (0,1033 frente a 0,1778 con KV en q8). Además, cada commit que toca kernels o el forward pass en hipfire se valida contra una puerta de calidad de decodificación greedy byte-exacta sobre 9 pares (modelo, prompt) de referencia.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Qwen3.5-27B (no se detallan capacidades específicas en la información disponible).
- Arquitectura híbrida DeltaNet que, en principio, favorece el procesamiento de contextos largos con coste lineal, aunque no se especifica la longitud de contexto soportada.
- Inferencia nativa en GPUs AMD RDNA1–RDNA4 mediante el motor hipfire (Rust + HIP), sin Python en la ruta crítica.
- Tres niveles de calidad/rendimiento seleccionables: HF4 (máxima velocidad), MQ4 (calidad cercana a Q8 con ancho de banda Q4) y HF6 (máxima calidad, ~15% más lento que HF4).
- Tokenizador y configuración embebidos en el fichero de pesos, lo que simplifica el despliegue (no requiere descargar tokenizer.json aparte).
- Soporte de tool calling, function calling, agentes, multilingüismo, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un LLM de 27B en GPUs AMD de consumo: con la variante HF4 o MQ4 (13,32 GB y 13,95 GB respectivamente) el modelo cabe en una RX 7900 XTX de 24 GB y, según la tabla del autor, requiere un mínimo de 16 GB de VRAM. Es adecuado para estaciones de trabajo con GPU AMD sin depender de CUDA.
- Inferencia de baja latencia en producción: el motor hipfire reporta 47 tok/s (HF4) y 46 tok/s (MQ4) en RX 7900 XTX en modo forward-only, lo que permite servir respuestas interactivas en un solo GPU.
- Sustitución de llama.cpp en entornos AMD: al usar un formato con el mismo layout de almacenamiento que Q4_K_M (HFQ4-G256) pero sin descriptores de bloque K-quant, facilita la migración de pipelines existentes de cuantización 4 bits a un runtime nativo AMD.
- Evaluación de calidad de cuantización: la variante MQ4, con su puerta de calidad byte-exacta y su KLD medido, sirve para comparar el impacto de distintas técnicas de cuantización (AWQ + FWHT frente a 4 bits plano) sobre un mismo modelo base.
- Investigación sobre arquitecturas híbridas: al ejecutar Qwen3.5-27B (DeltaNet + atención) en un motor alternativo, permite estudiar el comportamiento de las capas lineales en hardware AMD de consumo.
- Prototipado de asistentes con contexto largo: la naturaleza DeltaNet del modelo base sugiere un coste lineal en contextos largos, útil para documentos extensos o conversaciones multi-turno, aunque la longitud exacta de contexto no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta velocidades de inferencia (forward-only tok/s) en AMD RX 7900 XTX:

| Variante | Tamano | VRAM minima | RX 7900 XTX (tok/s) | RX 5700 XT |
|---|---|---|---|---|
| HF4 | 13,32 GB | 16 GB | 47 | TBD |
| HF6 | 19,92 GB | 24 GB | — | TBD |
| MQ4 | 13,95 GB | 16 GB | 46 | TBD |

Además, se reporta una métrica de calidad para MQ4: KLD de 0,1033 (con KV en q8) frente a 0,1778 de la versión MQ4 anterior, es decir, una reducción del 42%.

## Requisitos de hardware

- VRAM estimada para inferencia: 16 GB mínimos para HF4 y MQ4; 24 GB mínimos para HF6.
- GPUs recomendadas: AMD RX 7900 XTX (24 GB) para todas las variantes; RX 5700 XT (8 GB) figura en la tabla pero con valores TBD, por lo que no hay datos de rendimiento confirmados en esa GPU.
- ¿Cabe en GPU de consumo? Sí: HF4 y MQ4 caben en GPUs AMD de consumo con 16 GB o más (por ejemplo, RX 7900 XTX); HF6 requiere 24 GB.
- Opciones de despliegue: exclusivamente el motor hipfire (Rust + HIP), instalable vía script (`curl ... | bash`) y con comandos `hipfire pull` y `hipfire run`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 47 tok/s (HF4) y 46 tok/s (MQ4) en RX 7900 XTX en modo forward-only; HF6 es ~15% más lento que HF4. No se reportan latencias (TTFT) ni throughput en batch.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría (mismo tamaño o misma tarea) que permitan una comparación rigurosa de parámetros, contexto, rendimiento, licencia y disponibilidad. El propio modelo base Qwen3.5-27B carece de especificaciones detalladas en la información disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas del modelo base; se desconoce la composición del dataset de entrenamiento y si hubo alineación (RLHF/DPO).
- La longitud de contexto no está especificada, lo que impide planificar despliegues que dependan de ventanas largas.
- El uso está restringido al motor hipfire: los ficheros .hf4, .hf6 y .mq4 son formatos propietarios y no son compatibles con llama.cpp, vLLM, Ollama ni TGI. Esto limita la portabilidad y ata el despliegue a un proyecto concreto.
- El rendimiento solo está confirmado en RX 7900 XTX; los valores para RX 5700 XT figuran como TBD, por lo que no hay garantía de que el modelo funcione en GPUs con menos de 16 GB.
- La licencia del repositorio es MIT, pero los pesos están sujetos a la licencia original de Qwen (enlazada en la model card); es necesario revisar esa licencia antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy baja y ausencia de validación por parte de la comunidad.
- La variante MQ4 depende de una puerta de calidad byte-exacta sobre 9 pares de referencia; aunque detecta regresiones numéricas, no constituye una evaluación exhaustiva de calidad.
- El tamaño del repositorio (100,4 GB) incluye las tres variantes; descargar solo una requiere seleccionar el fichero concreto.

## Enlaces

- Hugging Face: https://huggingface.co/hipfire-models/qwen3.5-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Repositorio del motor hipfire: https://github.com/Kaden-Schutt/hipfire
- Lista de modelos soportados: https://github.com/Kaden-Schutt/hipfire/blob/master/docs/MODELS.md
- Líneas base de calidad: https://github.com/Kaden-Schutt/hipfire/tree/master/tests/quality-baselines
