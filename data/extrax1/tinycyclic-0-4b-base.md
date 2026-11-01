# ExtraX1/TinyCyclic-0.4B-Base

## Resumen

TinyCyclic-0.4B-Base es un modelo de lenguaje experimental publicado por el usuario ExtraX1 en HuggingFace, construido sobre una arquitectura de **Looped Transformer** (transformer con capas reutilizadas en bucle). En lugar de incrementar el número de parámetros mediante capas únicas, el modelo aplica 14 capas distintas en 3 ciclos consecutivos, alcanzando una profundidad efectiva de 30 capas con un tamaño total de aproximadamente 0,4 mil millones de parámetros. El objetivo declarado es obtener alta profundidad efectiva con un coste paramétrico reducido, una línea de investigación emparentada con los trabajos sobre universal transformers y looped models.

El modelo se encuentra en estado explícito de desarrollo ("Under Construction"): la model card indica que el tokenizador BPE personalizado de 64k tokens está aún en desarrollo, que el pre-entrenamiento planificado es de 500 millones de tokens como prueba de concepto y que existe una hoja de ruta para escalar a 5 mil millones de tokens y aplicar posteriormente un ajuste supervisado (SFT) orientado a un carácter "cínico". No se han publicado pesos funcionales, resultados de benchmarks ni detalles de dataset en la información disponible.

Por su tamaño y estado, no es un modelo apto para producción, sino una pieza de investigación sobre eficiencia arquitectónica. Es relevante para quienes siguen líneas alternativas a la escala pura de parámetros (looped transformers, weight sharing, universal transformers) y quieran evaluar si la profundidad efectiva recurrente ofrece ventajas frente a transformers convencionales del mismo orden de magnitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer (14 capas únicas, 3 ciclos, profundidad efectiva de 30 capas) |
| Parametros totales | ~0,4B (aproximadamente 400 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (fase PoC) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh |
| Licencia | ExtraLODL v1.0 (ExtraX0 Liberal Open Development License) LM Edition, etiquetada como "other" |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un **Looped Transformer**: un bloque de 14 capas únicas cuyos pesos se reutilizan a lo largo de 3 iteraciones o ciclos, lo que da una profundidad efectiva de 30 capas sin multiplicar el número de parámetros. Este esquema de *weight sharing* recurrente se alinea con la familia de los universal transformers y los modelos con cómputo recurrente, y busca mejorar la relación entre capacidad de representación y coste paramétrico. El tokenizador es un BPE personalizado de 64k tokens, descrito como "en desarrollo" en la model card.

En cuanto al entrenamiento, la información disponible es únicamente prospectiva: la hoja de ruta contempla el entrenamiento del tokenizador de 64k, un pre-entrenamiento de 500 millones de tokens como prueba de concepto, un escalado posterior hasta 5 mil millones de tokens y una fase de SFT ("ajuste filosófico" para dotar al modelo de un carácter cínico). No se especifican la composición del dataset, el número de tokens efectivamente procesados, ni si se han aplicado técnicas de RLHF o DPO. No hay datos publicados sobre innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto: pipeline declarado `text-generation`; no hay evidencias publicadas de calidad o coherencia en generación.
- Multilingüismo declarado: inglés, ruso y chino (en, ru, zh), sin datos sobre el equilibrio o la calidad por idioma.
- Razonamiento, código y matemáticas: no disponible; no se han publicado evaluaciones.
- Tool calling / function calling: no disponible; no se menciona soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el modelo es exclusivamente de texto.
- Estado del arte del proyecto: la model card lo marca como "Under Construction", por lo que las capacidades reales no están verificadas.

## Casos de uso

- Investigación sobre arquitecturas eficientes: servir como banco de pruebas para comparar un Looped Transformer de 0,4B con un transformer convencional de profundidad equivalente, midiendo perplejidad y coste de entrenamiento por token.
- Estudio de weight sharing y profundidad efectiva: analizar si 3 ciclos sobre 14 capas ofrecen ventajas de representación frente a 30 capas únicas con el mismo presupuesto de parámetros.
- Experimentos académicos de bajo coste: al ser un modelo de ~0,4B, puede entrenarse y evaluarse en una única GPU consumer, lo que lo hace útil para reproducir experimentos de arquitectura en entornos con recursos limitados.
- Base para fine-tuning experimental: una vez publicados los pesos, podría servir como punto de partida para SFT en dominios acotados (por ejemplo, generación de texto con estilo específico, como el "carácter cínico" que planea el autor).
- Evaluación de tokenizadores personalizados: el BPE de 64k permite estudiar el impacto del vocabulario en la eficiencia de codificación para en, ru y zh.
- Docencia y divulgación: ejemplo didáctico de implementación de looped transformers y de buenas prácticas (y carencias) en la publicación de modelos en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (~0,4B parámetros), en FP16 requeriría aproximadamente 0,8 GB solo para pesos; en cuantización de 8 bits, unos 0,4 GB; en 4 bits, unos 0,2 GB, a lo que habría que sumar la caché KV para 4096 tokens de contexto.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería ser suficiente en teoría, aunque no hay pesos publicados para verificarlo.
- Cabe en GPU consumer: sí, por tamaño, en tarjetas como RTX 3060, RTX 4060 o superiores; sin confirmación práctica.
- Opciones de despliegue: no disponible; no se especifican formatos GGUF, safetensors ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| TinyCyclic-0.4B-Base | ~0,4B | 4096 | Looped Transformer (14 capas x 3 ciclos) | ExtraLODL v1.0 | En desarrollo, sin pesos publicados |
| Qwen2.5-0.5B | 0,5B | 32 768 | Transformer denso | Apache 2.0 | Publicado y evaluado |
| SmolLM2-360M | 0,36B | 8192 | Transformer denso | Apache 2.0 | Publicado y evaluado |
| Pythia-410M | 0,41B | 2048 | Transformer denso | Apache 2.0 | Publicado y evaluado |

La comparación es estructural: TinyCyclic se distingue por su arquitectura recurrente y su contexto de 4096 tokens, pero carece de benchmarks, pesos y licencia estándar, a diferencia de las alternativas densas de tamaño similar, que cuentan con evaluaciones públicas y licencias permisivas.

## Limitaciones y advertencias

- Modelo en estado "Under Construction": no hay pesos publicados ni tokenizador finalizado, por lo que no es utilizable en producción.
- Ausencia total de benchmarks: no se puede evaluar su calidad frente a alternativas.
- Licencia no estándar (ExtraLODL v1.0, etiquetada como "other"): las condiciones para uso comercial no están claras y deben revisarse en el archivo LICENSE antes de cualquier uso.
- Idiomas limitados a en, ru y zh; sin soporte declarado de español.
- Contexto corto (4096 tokens) para estándares actuales.
- Riesgo de alucinación y sesgos: no evaluado; al no haber entrenamiento publicado, no hay datos sobre sesgos.
- Proyecto de un único autor sin historial de publicaciones previas verificable en la información disponible; descargas y likes a cero en el momento de la consulta.
- Arquitectura experimental: el comportamiento de los looped transformers en tareas downstream aún está poco caracterizado en la literatura.

## Enlaces

- HuggingFace: https://huggingface.co/ExtraX1/TinyCyclic-0.4B-Base
- Licencia (referenciada en la model card): LICENSE del repositorio de HuggingFace
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
