# nkkbr/Mini-K3-1H-attnres-block2-v1_B

## Resumen

Mini-K3-1H-attnres-block2-v1_B es un checkpoint de investigación de tipo base (solo preentrenamiento) publicado por el usuario nkkbr en HuggingFace. Se trata de un transformer decoder de 13 capas con mezcla de dos mecanismos de atención: 9 capas KDA (atención lineal con convolución causal depthwise y decaimiento por grupos) y 4 capas Gated MLA (atención latente multicabeza con puerta de salida). La arquitectura incorpora capas MoE con 64 expertos enrutados, 2 compartidos y top-k 4, sobre un ancho oculto de 1.024 y 12 cabezas.

El modelo pertenece a un estudio controlado de ablación denominado Attention Residuals, cuyo objetivo es medir el efecto del mecanismo de residuos en profundidad. La variante aquí publicada sustituye el residuo estándar por una atención por bloques sobre grupos de 2 capas decoder; la referencia Block-4 del mismo estudio es el checkpoint `nkkbr/Mini-K3-1H-v2`. El checkpoint publicado corresponde a la revisión `checkpoint-tokens-001000079360`, con 1.000.079.360 tokens válidos consumidos de un plan total de 16.000.000.000, longitud de secuencia 8.192 y 1.526 pasos de optimizador.

Su relevancia es experimental, no de producto: es un proxy pequeño y controlado para estudiar si variantes de residuos (PreNorm, granularidades por bloque y AttnRes a nivel de subcapa) cambian el comportamiento del entrenamiento en arquitecturas tipo Kimi K3. El modelo no ha recibido post-entrenamiento, no sigue instrucciones y no se ha evaluado en tareas downstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido: 13 capas (9 KDA + 4 Gated MLA) con MoE; residuos por atención sobre bloques de 2 capas |
| Parámetros totales | 1.016.780.524 |
| Parámetros activos | 353.556.204 por token (MoE con 64 expertos enrutados, 2 compartidos, top-k 4) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | No disponible (pesos publicados en BF16; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no especifica licencia; los datasets de origen conservan sus propias licencias) |
| Formato de pesos | safetensors (BF16), con código propio `modeling_mini_k3.py` y `configuration_mini_k3.py`; librería declarada: pytorch |
| Capas KDA | Índices 1, 2, 3, 5, 6, 7, 9, 10, 11 (9 capas) |
| Capas Gated MLA | Índices 4, 8, 12, 13 (4 capas) |
| Ancho oculto / cabezas / ancho de cabeza KDA | 1.024 / 12 / 128 |
| Convolución depthwise causal KDA | Kernel 4 |
| Grupos de decaimiento KDA por cabeza | 128 (contiguos) |
| Modo posicional MLA | NoPE; puerta de salida activada |
| Capas densas antes del MoE | 1 |
| Ancho oculto de experto enrutado | 512 |
| Vocabulario / BOS / EOS de generación / PAD | 163.840 / 163.584 / 163.586 / 163.839 |
| Tamaño del repositorio | 6,1 GB (no se detalla el desglose de ficheros) |

## Arquitectura y entrenamiento

El modelo es un decoder de 13 capas que alterna dos mecanismos de atención. Las capas KDA ocupan los índices 1, 2, 3, 5, 6, 7, 9, 10 y 11 y emplean atención lineal con convolución causal depthwise de kernel 4 y 128 grupos de decaimiento contiguos por cabeza. Las capas Gated MLA ocupan los índices 4, 8, 12 y 13, funcionan en modo posicional NoPE y aplican una puerta sobre la salida. Tras una única capa densa inicial se introduce el bloque MoE, con 64 expertos enrutados, 2 expertos compartidos, top-k 4 y ancho oculto de experto 512; el router selecciona expertos con puntuaciones sesgadas y los combina con puntuaciones sigmoideas no sesgadas renormalizadas. La innovación concreta de esta variante es el mecanismo de residuos: atención por bloques sobre grupos de 2 capas decoder, en lugar del residuo PreNorm estándar, dentro del estudio comparativo Attention Residuals.

El entrenamiento es de preentrenamiento puro, sin RLHF, DPO ni ningún otro post-entrenamiento. El recetario declarado usa Muon por cabeza para las matrices Q/K/V expandidas, Muon para el resto de matrices, AdamW como respaldo para vectores y embeddings, weight decay 0,1, QK-Clip por cabeza, decaimiento coseno con 1% de warmup lineal y Quantile Balancing en línea con histograma de 1.000 bins. Los pesos se almacenan en BF16, mientras que el decaimiento KDA, la convolución, la normalización y el estado de control del router se mantienen en FP32. Las cinco ejecuciones del estudio y la referencia Block-4 parten de inicialización canónica por nombre y forma con semilla base 20260914, consumen la misma mezcla congelada de 16.000 millones de tokens en el mismo orden y aíslan los documentos de forma estricta: MLA usa máscara causal bloqueada por documento y KDA reinicia su estado recurrente y el historial de la convolución corta Q/K/V en cada frontera de segmento. El estado del optimizador no se publica de forma deliberada.

## Capacidades

- Generación de texto autoregresiva: es la única tarea declarada en el pipeline (`text-generation`), con vocabulario de 163.840 entradas.
- Modelado de lenguaje base: predice el siguiente token, no sigue instrucciones ni responde a formato conversacional.
- Razonamiento, código y matemáticas: no hay evidencia publicada de estas capacidades; no se han realizado evaluaciones downstream.
- Tool calling / function calling: no soportado (no hay post-entrenamiento ni plantilla de chat documentada).
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponibles (la model card no declara idiomas ni composición lingüística del dataset).
- Capacidades especiales: no dispone de modo de razonamiento explícito, visión ni audio; es un modelo exclusivamente de texto.
- Contexto: ventana de 8.192 tokens, definida por la longitud de secuencia de entrenamiento.
- Uso previsto: investigación de arquitecturas, ablaciones y reproducibilidad de recetas de preentrenamiento.

## Casos de uso

- Estudio de ablación de mecanismos de residuos: comparar esta variante (residuos por atención sobre bloques de 2 capas) con PreNorm, otras granularidades de bloque y AttnRes a nivel de subcapa, usando la misma mezcla de datos y la misma inicialización para aislar el efecto arquitectónico.
- Investigación sobre atención híbrida: analizar la interacción entre capas KDA de atención lineal y capas Gated MLA en un mismo stack de 13 capas, con proporción 9:4 y contexto de 8.192 tokens.
- Reproducibilidad de recetas de preentrenamiento: el repositorio incluye manifiestos JSON con revisiones de fuentes, cuotas de tokens, hashes de schedule, configuración del optimizador y hashes del split de validación, lo que permite replicar o auditar la ejecución.
- Punto de partida para preentrenamiento continuado: al ser un checkpoint intermedio (1.000 millones de tokens de 16.000 millones planificados) con arquitectura autocontenida en `modeling_mini_k3.py`, sirve como base para continuar el entrenamiento o probar variantes de receta.
- Validación de stacks de servicio: medir throughput y consumo de memoria de una arquitectura MoE con atención lineal en motores de inferencia que permitan código de modelo personalizado.
- Docencia y experimentación académica: modelo de ~1.000 millones de parámetros lógicos y ~354 millones activos, con requisitos de memoria moderados, adecuado para prácticas sobre MoE, enrutamiento y atención lineal sin acceso a clústeres grandes.
- Diagnóstico de estabilidad de entrenamiento: las métricas de NLL y perplejidad sobre un conjunto fijo de desarrollo se registran en W&B y en JSONL, útiles para estudiar dinámicas de convergencia con QK-Clip y Quantile Balancing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que es un checkpoint de investigación intermedio y que aún no se ha evaluado en tareas downstream. Solo se documenta la pérdida NLL y la perplejidad sobre un conjunto fijo de desarrollo, registradas durante el entrenamiento en W&B y en ficheros JSONL, pero sus valores numéricos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 2,03 GB en BF16 (1.016.780.524 parámetros × 2 bytes) y unos 4,07 GB si se cargan en FP32.
- VRAM estimada en inferencia: del orden de 3-5 GB en BF16 con contexto corto, sumando estados de activación, caché KDA recurrente y caché MLA; a 8.192 tokens la demanda de memoria crece con la longitud de contexto. Cifras exactas no disponibles.
- Cuantización: al no publicarse variantes cuantizadas, una conversión a 8 bits dejaría los pesos en torno a 1 GB y a 4 bits en torno a 0,5-0,6 GB, pero requeriría trabajo adicional porque el modelo depende de código propio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16, por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G; para FP32 se recomiendan 8-12 GB o más. Para entrenamiento continuado en BF16 con estado de optimizador, se necesitan GPUs de 40-80 GB (A100, H100) o configuración multi-GPU con sharding.
- ¿Cabe en GPU de consumo? Sí. El tamaño de pesos en BF16 (~2 GB) permite inferencia en GPUs consumer con 8 GB o más de VRAM, siempre que el motor de inferencia admita el código de modelo personalizado.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La carga prevista es mediante el paquete standalone incluido (`modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py`, `smoke_test.py`), con PyTorch y la librería transformers o carga directa del safetensors. Cualquier despliegue con motores de alto rendimiento requeriría implementar la arquitectura en el motor correspondiente.
- Latencia y throughput estimados: no disponibles. Cabe esperar que el coste por token se aproxime al de un modelo denso de ~354 millones de parámetros activos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|---|
| Mini-K3-1H-attnres-block2-v1_B | 1.016.780.524 | 353.556.204 | 8.192 tokens | No disponible | No | HuggingFace, safetensors + código propio |
| Mini-K3-1H-v2 (referencia Block-4 del mismo estudio) | No disponible (misma escala declarada, sin confirmar en la información) | No disponible | No disponible | No disponible | No | HuggingFace, según la model card |
| Otros modelos comparables de ~1B parámetros | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar esta variante con su referencia dentro del mismo estudio de ablación; no se han facilitado datos de rendimiento ni de licencia de ninguno de los dos, por lo que no es posible establecer una comparación cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Modelo base de preentrenamiento: no es un asistente entrenado para seguir instrucciones; puede producir salidas inexactas, sesgadas, inseguras o repetitivas.
- Checkpoint intermedio: corresponde a 1.000.079.360 tokens consumidos de un plan de 16.000.000.000, por lo que su calidad de lenguaje está lejos de un modelo terminado. La etiqueta final `checkpoint-tokens-016000000000-final` se crea solo al completar los 16.000 millones de tokens válidos.
- Sin evaluación downstream: no hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra tarea; no se puede afirmar su rendimiento en aplicaciones reales.
- Riesgo de alucinación: elevado, al no haber post-entrenamiento ni verificación factual.
- Sesgos: no documentados. La composición del dataset no se detalla en la información disponible, por lo que se desconocen sesgos lingüísticos, culturales o de dominio.
- Idiomas: no declarados; se desconoce la cobertura multilingüe real del modelo.
- Licencia: no disponible. Antes de cualquier uso, incluido el comercial, es imprescindible contactar con el autor, ya que no se especifican términos de uso. Los datasets de origen conservan sus propias licencias y no se redistribuyen.
- Estado del optimizador no publicado: impide reanudar el entrenamiento exactamente desde este checkpoint.
- Dependencia de código propio: el safetensors no se carga con implementaciones estándar de transformers sin el paquete incluido; esto dificulta su integración en motores de inferencia convencionales.
- Extrapolación limitada: la model card advierte que los rankings de arquitectura obtenidos a esta escala y con longitud de entrenamiento de 8.000 tokens necesitan confirmación antes de extrapolarse al Kimi-K3 completo.
- Ventana de contexto: 8.192 tokens; no hay evidencia de generalización a contextos mayores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-attnres-block2-v1_B
- Checkpoint de referencia Block-4 citado en la model card: `nkkbr/Mini-K3-1H-v2` (el enlace directo no aparece en la información proporcionada)
- Repositorio del experimento con diagnósticos de arquitectura y evaluación planificada: mencionado en la model card, sin URL disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de descarga de Google Chrome y a hilos de Reddit sobre navegadores, sin relación con esta ficha.
