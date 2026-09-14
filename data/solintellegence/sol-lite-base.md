# solintellegence/Sol-Lite-Base

## Resumen

Sol Lite Base es un modelo de lenguaje causal decoder-only de 14.995.843 parámetros (aproximadamente 15M) desarrollado por solintellegence y publicado en HuggingFace bajo licencia CC BY 4.0. Se trata de un modelo base entrenado desde cero sobre 8.153.333.760 tokens de texto en inglés, sin ajuste por instrucciones ni alineamiento posterior, por lo que su comportamiento esperado es el de continuación cruda de tokens y no el de un asistente conversacional.

Su interés técnico no reside en el rendimiento absoluto, sino en la combinación de técnicas poco habituales a esta escala: atención con grouped-query attention (8 cabezas de consulta y 2 de clave/valor, dimensión 32), profundidad recurrente con 10 bloques físicos que se despliegan en 14 bloques efectivos (1 prelude + 4 bloques centrales repetidos dos veces + 5 coda), sustracción de valores XSA tras la atención causal, normalización Q/K por cabeza con RoPE, embeddings de pasada aprendidos con puertas de refresco por canal y una memoria aprendida de bigramas/trigramas denominada EngramLite con 2.048 entradas.

El modelo es relevante como banco de pruebas para investigación en eficiencia paramétrica: demuestra que es posible entrenar un LM funcional con menos de 15M de parámetros y contexto de 2.048 tokens, algo útil para estudiar destilación, arquitecturas recurrentes de profundidad y tokenizadores compactos. Sus resultados en benchmarks, sin embargo, son propios de su escala (HellaSwag 27,72%, PIQA 57,73%), muy por debajo de modelos pequeños convencionales, y el propio autor advierte que no están verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con profundidad recurrente (recurrent-depth) |
| Parametros totales | 14.995.843 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos FP32 en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (FP32) |
| Bloques fisicos / efectivos | 10 / 14 (1 prelude + 4 middle × 2 pasadas + 5 coda) |
| Anchura residual | 256 |
| Atencion | 8 cabezas Q, 2 cabezas KV, dimension de cabeza 32, GQA |
| MLP | Gated SiLU, anchura 1.465 |
| Vocabulario | 4.096 tokens, byte-level BPE con soporte de digitos |
| Memoria aprendida | EngramLite de 2.048 entradas (bigramas/trigramas) |
| Embeddings | Tabla de entrada/salida atada (tied) |
| Descargas en HuggingFace | 0 |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal con un esquema de profundidad recurrente poco frecuente. El modelo almacena 10 bloques físicos que se ejecutan como 14 bloques efectivos: un bloque de preludio, cuatro bloques centrales que se aplican dos veces cada uno y cinco bloques de coda. La condicionacion entre pasadas se realiza mediante embeddings de pasada aprendidos y puertas de refresco por canal, de modo que las activaciones se reajustan en cada iteración del tramo recurrente. La atención usa grouped-query attention con 8 cabezas de consulta y 2 de clave/valor (dimensión de cabeza 32), normalización RMSNorm por cabeza sobre Q y K, y RoPE para la codificación posicional. Tras la atención causal se aplica una sustracción de valores XSA. La anchura residual es 256 y el MLP es un gated SiLU de anchura 1.465. Además, incorpora EngramLite, una memoria aprendida de 2.048 entradas con estadísticas de bigramas y trigramas, y un vocabulario de 4.096 tokens byte-level BPE sensible a dígitos. Los embeddings de entrada y salida están atados.

El entrenamiento consumió 8.153.333.760 tokens con un currículum gradual en inglés construido a partir de FineWeb-Edu, DCLM, English UltraFineWeb (niveles 1 a 3), FineWeb-HQ, FineMath y FinePhrase. El tokenizador y el flujo de entrenamiento se congelaron antes de iniciar el entrenamiento, y no se usaron ejemplos de benchmarks públicos para la selección de checkpoints. La model card no documenta el uso de RLHF, DPO u otras fases de alineamiento, lo que es coherente con su naturaleza de modelo base. Tampoco se detalla la composición porcentual del dataset ni el número de épocas.

## Capacidades

- Generación de texto por continuación de tokens (next-token completion) en inglés, sin formato conversacional.
- Razonamiento básico y aritmética muy limitados: el modelo incluye un tokenizador sensible a dígitos y reporta un 34,20% en ArithMark-3, pero no hay evidencia de capacidades matemáticas fiables.
- Capacidades limitadas de comprensión lectora y sentido común, con resultados bajos en HellaSwag (27,72%), ARC-Easy (34,72%), ARC-Challenge (22,87%) y PIQA (57,73%).
- Soporte de tool calling / function calling: no disponible. El modelo no está ajustado por instrucciones ni incluye plantillas de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo está entrenado y declarado únicamente para inglés.
- Capacidades especiales: no incluye modo de pensamiento explícito, visión ni audio. Su rasgo diferencial es arquitectónico (profundidad recurrente, XSA, EngramLite), no funcional.
- Memoria aprendida de n-gramas (EngramLite) integrada en el modelo, orientada a capturar regularidades locales del texto.

## Casos de uso

- Investigación en profundidad recurrente: el modelo permite reproducir y analizar un esquema de 10 bloques físicos desplegados en 14 efectivos, estudiando cómo afectan los embeddings de pasada y las puertas de refresco por canal a la calidad de la representación con un coste computacional mínimo.
- Experimentos de destilación: por su tamaño (15M de parámetros), puede actuar como alumno en experimentos de destilación desde modelos mayores, y su licencia CC BY 4.0 facilita publicar los resultados y los derivados.
- Estudio de tokenizadores compactos: su vocabulario byte-level BPE de 4.096 tokens sensible a dígitos sirve como caso de estudio para medir el impacto de un vocabulario reducido en tareas de aritmética y en la fertilidad de la tokenización.
- Evaluación de memoria aprendida de n-gramas: EngramLite (2.048 entradas de bigramas y trigramas) puede analizarse de forma aislada para determinar en qué tipo de continuaciones locales aporta ventaja frente a un transformer equivalente sin memoria.
- Inferencia en entornos con recursos mínimos: con pesos FP32 de aproximadamente 60 MB, el modelo se ejecuta en CPU sin GPU dedicada, lo que lo hace adecuado para prototipos educativos, demostraciones en portátiles y pruebas de latencia en dispositivos de gama baja.
- Línea base académica para modelos ultra pequeños: sirve como referencia reproducible frente a otros modelos de menos de 150M de parámetros en estudios comparativos de eficiencia paramétrica, siempre que se documente que sus puntuaciones de benchmark no están verificadas de forma independiente.
- Análisis de sesgos y comportamientos degenerados: al ser un modelo base sin alinear, es útil para estudiar repetición, incoherencia y generación de contenido inseguro en modelos entrenados con corpus web filtrados, en un entorno controlado y de bajo coste.
- Pruebas de integración de código de inferencia personalizado: el repositorio incluye `modeling_sol_lite.py` con la clase `SolForCausalLM` y funciones `load_model`/`generate`, lo que permite validar pipelines propios de carga y generación sin depender de la implementación estándar de Transformers.

## Benchmarks y rendimiento

| Benchmark | Ejemplos | Puntuación |
|---|---:|---:|
| HellaSwag | 10.042 | 27,72% |
| ARC-Easy | 2.376 | 34,72% |
| ARC-Challenge | 1.172 | 22,87% |
| PIQA | 1.838 | 57,73% |
| ArithMark-3 | 1.000 | 34,20% |
| Intelligence Index | — | 8,799 |

Las cuatro tareas de modelado del lenguaje se evaluaron zero-shot sobre sus particiones completas con `lm-eval` 0.4.12 usando exactitud normalizada. ArithMark-3 empleó su protocolo independiente de exactitud normalizada con tokenización propia. Los resultados brutos están incluidos en el directorio `evals/` del repositorio. El autor indica expresamente que estas mediciones no han sido verificadas de forma independiente y que no se reclama ninguna posición en leaderboards. No se dispone de resultados comparativos de otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 60 MB para los pesos en FP32, más el coste de activaciones y caché KV, que para 2.048 tokens de contexto es muy reducido. En la práctica, cabe en cualquier GPU con más de 1 GB de VRAM e incluso en memoria unificada de sistemas embebidos.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.) es más que suficiente; también es viable la inferencia exclusiva en CPU.
- Cabe en GPU consumer: sí, en todas las gamas actuales y en la mayoría de iGPU modernas.
- Opciones de despliegue: el modelo usa una clase personalizada `SolForCausalLM` incluida en `modeling_sol_lite.py`, cargada mediante `load_model` y ejecutada con `generate`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otras plataformas estándar, y no se publican pesos en GGUF. La vía soportada por el autor es PyTorch (>= 2.5) con `transformers` (>= 5), `safetensors` y `huggingface_hub`, con ejemplo de carga en `device="cpu"`.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---:|---:|---|---|---|
| Sol Lite Base | 14.995.843 | 2.048 | CC BY 4.0 | Inglés | Profundidad recurrente, GQA, EngramLite; 8,15B tokens de entrenamiento |
| Pythia-14M (EleutherAI) | ~14M | 2.048 | Apache 2.0 | Inglés | Familia de modelos de investigación con checkpoints intermedios; sin benchmarks comparables disponibles en esta ficha |
| GPT-2 (124M) | ~124M | 1.024 | MIT modificada | Inglés | Referencia histórica de decoder-only; ~8 veces más parámetros |
| SmolLM-135M (HuggingFace) | ~135M | 2.048 | Apache 2.0 | Inglés | Modelo pequeño orientado a uso general; ~9 veces más parámetros |

No se dispone de resultados de benchmarks homogéneos de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia e idioma. Cualquier comparación de rendimiento requeriría ejecutar las mismas tareas con idéntico protocolo de evaluación.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe tratarse como asistente conversacional. No sigue instrucciones ni mantiene formato de diálogo.
- Rendimiento muy bajo en benchmarks: con 15M de parámetros, las puntuaciones (HellaSwag 27,72%, ARC-Challenge 22,87%) reflejan una capacidad de comprensión y razonamiento limitada, muy inferior a la de modelos pequeños convencionales.
- Alucinación y degeneración: el autor advierte explícitamente de que las salidas pueden ser inconsistentes, factualmente incorrectas, repetitivas, incoherentes e inseguras.
- Contexto reducido: 2.048 tokens, insuficiente para tareas de contexto largo, resumen de documentos extensos o conversaciones multi-turno prolongadas.
- Limitación de idioma: solo inglés. No hay evidencia de capacidades en castellano u otros idiomas.
- Riesgo de contenido inseguro: al entrenarse sobre corpus web filtrados sin alineamiento posterior, puede reproducir sesgos y contenido problemático presente en los datos.
- Uso comercial: la licencia CC BY 4.0 permite uso comercial con atribución, pero las licencias de los datasets de entrenamiento (FineWeb-Edu, DCLM, UltraFineWeb, FineMath, FinePhrase) permanecen en manos de sus titulares y pueden imponer condiciones adicionales.
- Benchmarks no verificados: las métricas reportadas provienen del propio autor, no han sido verificadas de forma independiente y no se reclama posición en ningún leaderboard.
- Advertencia de uso: no debe emplearse para decisiones de alto riesgo (médicas, legales, financieras o de seguridad).
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, con una única versión publicada, lo que limita la evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/solintellegence/Sol-Lite-Base
- Pesos: https://huggingface.co/solintellegence/Sol-Lite-Base/blob/main/model.safetensors
- Implementación standalone: https://huggingface.co/solintellegence/Sol-Lite-Base/blob/main/modeling_sol_lite.py
- Configuración: https://huggingface.co/solintellegence/Sol-Lite-Base/blob/main/config.json
- Tokenizador: https://huggingface.co/solintellegence/Sol-Lite-Base/blob/main/tokenizer.json
- Resumen de entrenamiento y procedencia: https://huggingface.co/solintellegence/Sol-Lite-Base/blob/main/training_state.json
- Resultados brutos de evaluación: https://huggingface.co/solintellegence/Sol-Lite-Base/tree/main/evals

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados correspondían a páginas de soporte de Microsoft y no guardan relación con Sol Lite Base. Por tanto, no hay papers, blogs, repositorios ni demos adicionales que enlazar más allá de los ficheros del propio repositorio de HuggingFace.
