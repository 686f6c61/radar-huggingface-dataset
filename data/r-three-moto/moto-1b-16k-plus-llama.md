# r-three-moto/moto-1b-16k-plus-llama

## Resumen

MoTo 1B (16K tokenizers plus Llama 3.2) es un modelo de lenguaje de tipo Llama entrenado desde cero por el autor `r-three-moto`, con 2.610.530.304 parámetros totales (1,28B no correspondientes a embeddings) y una arquitectura decoder de 25 capas con `d_model` 2048 y 16 cabezas de atención. Su particularidad no está en la arquitectura, que es un transformer decoder convencional, sino en el sistema de tokenización: en lugar de un único tokenizador multilingüe, emplea 21 tokenizadores BPE por idioma (16K cada uno) más el tokenizador de Llama 3.2, todos mapeados a un vocabulario superset compartido de 323.711 filas de embedding. Cada documento se codifica durante el entrenamiento con el tokenizador de su idioma.

El modelo forma parte de la release MoTo (Mixture of Tokenizers), un experimento controlado para aislar el efecto de la tokenización en modelos multilingües. La release incluye también baselines con tokenizador monolítico entrenados sobre los mismos datos en 21 idiomas, lo que permite comparaciones directas. El modelo se entrenó con aproximadamente 104,86B tokens (100.000 pasos × 1,05M tokens por paso) sobre FineWeb-Edu (inglés, 40% de la mezcla) y FineWeb2-HQ (20 idiomas restantes).

Es relevante ahora porque propone una alternativa al tokenizador único para modelos multilingües de escala pequeña, un área donde el sesgo hacia el inglés en el vocabulario suele penalizar a los idiomas de bajos recursos. Es un modelo base, sin ajuste por instrucciones ni alineamiento de seguridad, pensado para investigación sobre tokenización más que para despliegue en producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama, 25 capas, d_model 2048, 16 cabezas, embeddings de entrada/salida no atados |
| Parametros totales | 2.610.530.304 (2,61B); 1,28B no-embedding |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, ar, cs, zh, da, de, el, fa, fr, hu, id, it, ja, nl, pl, pt, ru, es, sv, tr, vi (21 idiomas) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (bfloat16) |
| Tokenizacion | 21 tokenizadores BPE por idioma + tokenizador Llama 3.2, vocabulario superset de 323.711 entradas |
| Datos de entrenamiento | FineWeb-Edu (inglés, 40%) y FineWeb2-HQ (20 idiomas), ~104,86B tokens |
| Fecha de creacion | 2026-10-18 |
| Ultima actualizacion | 2026-11-19 |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer estilo Llama con 25 capas, dimensión de modelo 2048, 16 cabezas de atención y embeddings de entrada y salida no atados. La innovación reside en el sistema de tokenización: cada uno de los 21 idiomas dispone de su propio tokenizador BPE de 16K entradas (provenientes de la familia `flexitok/bpe_ltr_*_16000_v2`), más el tokenizador de Llama 3.2 como tokenizador para inglés y por defecto (`fw_edu`). Todos ellos se fusionan en un vocabulario superset de 323.711 entradas que indexa una única tabla de embeddings compartida. Durante el entrenamiento, cada documento se codifica con el tokenizador de su idioma, de modo que el modelo aprende a operar sobre ids de un espacio común pero con segmentaciones específicas por lengua.

El entrenamiento se realizó desde cero durante 100.000 pasos, con 1,05M tokens por paso (4 secuencias de 4096 tokens por GPU × 8 GPUs × 8 pasos de acumulación), lo que suma aproximadamente 104,86B tokens. La mezcla de datos combina FineWeb-Edu para inglés (40% de la mezcla) con FineWeb2-HQ para los 20 idiomas restantes; los pesos exactos están en `training/config.yaml`. No se aplicó RLHF, DPO ni ajuste por instrucciones: es un modelo base entrenado para una comparación controlada de tokenizadores. Tampoco hay ajuste de seguridad.

## Capacidades

- Generación de texto autoregresiva en 21 idiomas, con tokenización específica por idioma que reduce la fragmentación respecto a un tokenizador multilingüe único.
- Modelado de lenguaje base: continuación de texto, completado de frases y generación libre condicionada por prefijo.
- Capacidad multilingüe real en el eje de tokenización: el modelo puede codificar y decodificar texto en cualquiera de los 21 idiomas soportados mediante el tokenizador correspondiente.
- Decodificación entre idiomas: `tok.decode` acepta ids de cualquier tokenizador del conjunto, por lo que generaciones que derivan hacia el vocabulario de otro idioma se decodifican correctamente.
- Enrutamiento flexible de tokenizadores: `tok.set_mapping` permite redirigir idiomas no soportados (por ejemplo, catalán) o familias de escritura (por ejemplo, cirílico) al tokenizador de otro idioma.
- No dispone de tool calling, function calling, modo thinking, visión, audio ni capacidades de agente; es un modelo base sin ajuste instructivo.
- No soporta razonamiento multi-paso guiado ni seguimiento de instrucciones de forma fiable al no estar alineado.

## Casos de uso

- Investigación sobre tokenización multilingüe: el modelo permite medir el efecto de sustituir un tokenizador monolítico por tokenizadores por idioma sobre los mismos datos y arquitectura, usando los baselines de la release MoTo como control.
- Experimentos de eficiencia de tokenización: comparar la longitud media de secuencia y la perplejidad por idioma entre MoTo y un tokenizador monolítico para cuantificar la ganancia de compresión en idiomas como finés, húngaro o turco, donde los tokenizadores centrados en inglés fragmentan más.
- Evaluación de modelos base en idiomas de recursos medios: servir como checkpoint de referencia para medir perplejidad y capacidad de continuación en checo, danés, griego, persa, indonesio, vietnamita, etc., con un contexto de 4096 tokens.
- Generación de texto controlada por idioma en pipelines de investigación: usar `tok.set_language` para forzar la segmentación correcta antes de generar, útil en estudios de sesgo lingüístico y de mezcla de idiomas en la salida.
- Fine-tuning supervisado posterior: al ser un modelo base de 2,61B parámetros, es un punto de partida razonable para SFT en tareas downstream en los 21 idiomas, con la ventaja de que el tokenizador por idioma reduce el coste por token en lenguas aglutinantes.
- Estudio de alineamiento entre vocabularios: analizar cómo el mapeo `super_mapping.json` distribuye los ids de cada tokenizador en el superset y qué implicaciones tiene para el aprendizaje de embeddings compartidos entre lenguas.
- Prototipado de decodificación multilingüe: validar que la decodificación con ids cruzados entre tokenizadores funciona correctamente en generaciones que cambian de idioma a mitad de secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,2 GB solo para pesos (2,61B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,6-3 GB de pesos; en 4 bits, alrededor de 1,3-1,5 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas para bfloat16: A100 40/80 GB, H100, L40S, RTX A6000; para inferencia de un solo usuario, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes con holgura.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 8 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (soporte nativo con `trust_remote_code=True` para el tokenizador combinado), text-generation-inference (el modelo está etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM previsiblemente compatible al ser arquitectura Llama, y llama.cpp/Ollama si se generan pesos GGUF (no publicados oficialmente).
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, un modelo de 2,61B en bfloat16 sobre una RTX 4090 debería situarse en el rango de decenas de tokens por segundo, pero no hay mediciones publicadas que lo confirmen.
- Nota de despliegue: el tokenizador requiere `trust_remote_code=True` o bien aplicar manualmente `super_mapping.json` para mapear ids al vocabulario superset; sin ese paso, los ids no indexan correctamente la tabla de embeddings.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoTo 1B 16K + Llama 3.2 | 2,61B (1,28B no-embedding) | 4096 | 21 tokenizadores por idioma + Llama 3.2, superset 323.711 | llama3.2 | Hugging Face, transformers |
| Llama 3.2 1B | 1,24B | 128K | Tokenizador unico (128K) | llama3.2 | Hugging Face, amplia adopcion |
| Llama 3.2 3B | 3,21B | 128K | Tokenizador unico (128K) | llama3.2 | Hugging Face, amplia adopcion |
| Qwen2.5 1.5B | 1,54B | 32K | Tokenizador unico multilingue | Apache 2.0 | Hugging Face, amplia adopcion |

La comparación con Llama 3.2 1B y 3B es la más directa por familia y licencia, pero conviene señalar que MoTo 1B no está ajustado por instrucciones, mientras que los Llama 3.2 sí. La diferencia clave frente a todos ellos es el esquema de tokenización por idioma y el contexto mucho más corto (4096 frente a 32K o 128K). No se dispone de datos de benchmarks que permitan comparar rendimiento real entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable, no tiene modo chat y no debe usarse directamente como asistente sin SFT previo.
- Sin ajuste de seguridad: no hay alineamiento ni filtros, por lo que puede generar contenido dañino, sesgado o inapropiado.
- Contexto limitado a 4096 tokens, muy por debajo de los estándares actuales (32K-128K) para tareas de documento largo o conversación multi-turno extensa.
- Riesgo de alucinación inherente a un modelo base de 2,61B parámetros entrenado con ~105B tokens; la cobertura factual es limitada.
- Sesgos de los datos: la mezcla está dominada por FineWeb-Edu en inglés (40%), lo que puede introducir sesgo cultural y lingüístico hacia el inglés y hacia las variedades representadas en FineWeb2-HQ.
- Complejidad operativa del tokenizador: requiere seleccionar el tokenizador correcto por idioma, usar `trust_remote_code=True` o aplicar el mapeo manual, y gestionar el mapeo de idiomas no soportados; un uso incorrecto produce ids fuera del vocabulario o mal indexados.
- Licencia llama3.2: impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos de la licencia Llama 3.2 antes de cualquier despliegue en producción.
- Trazabilidad limitada: 11 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación externa; el modelo es un artefacto de investigación, no un checkpoint con adopción comunitaria.
- No hay pesos cuantizados oficiales (GGUF, AWQ, GPTQ) publicados, lo que limita el despliegue en hardware de gama baja sin trabajo adicional de cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r-three-moto/moto-1b-16k-plus-llama
- Paper (OpenReview): https://openreview.net/forum?id=avjeUhPuC6
- Repositorio de codigo: https://github.com/r-three/moto
- Organizacion con todos los modelos MoTo: https://huggingface.co/r3-moto
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Tokenizador Llama 3.2 1B (flexitok): https://huggingface.co/flexitok/llama-3.2-1b-tokenizer
