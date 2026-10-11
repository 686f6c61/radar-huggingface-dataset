# shikhar-srivastava/1b_layerrope_lr3.2e-2_seed1

## Resumen

`1b_layerrope_lr3.2e-2_seed1` es un checkpoint de investigación publicado por el usuario shikhar-srivastava en Hugging Face: un modelo de lenguaje de aproximadamente 1,3 mil millones de parámetros con arquitectura estilo LLaMA (transformer decoder-only) que sustituye la codificación posicional RoPE convencional por LayerRoPE, una variante con parámetros rotatorios y de magnitud aprendidos por capa. Se entrenó desde cero sobre el corpus allenai/c4 (inglés) durante 4 veces el presupuesto de tokens óptimo de Chinchilla, y la model card lo identifica explícitamente como el checkpoint final de una ejecución con tasa de aprendizaje 3,2e-2 y semilla 1.

El interés del modelo es fundamentalmente metodológico: por el patrón de nombres, forma parte de una barrida de hiperparámetros (distintas tasas de aprendizaje y semillas) destinada a estudiar el comportamiento de LayerRoPE frente a RoPE estándar en modelos pequeños. No es un modelo ajustado por instrucciones ni alineado, no publica resultados de benchmarks y la licencia no está declarada, por lo que su uso previsto es la experimentación y la reproducibilidad en investigación, no el despliegue en producción.

Su tamaño reducido (repo de 2,7 GB) lo hace manejable en hardware de consumo para experimentos locales, pero al emplear una codificación posicional no estándar es probable que requiera el código de entrenamiento del autor o `trust_remote_code` en lugar de funcionar directamente con implementaciones genéricas de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA con Pre-Norm y LayerRoPE (profundidad, dimensión oculta y número de cabezas: no disponible) |
| Parámetros totales | ~1,3 mil millones (según la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publican pesos GGUF ni versiones cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | No disponible; el tag `pytorch` indica pesos en PyTorch y el tamaño del repositorio (2,7 GB) es coherente con ~1,3B parámetros en precisión de 16 bits |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de estilo LLaMA con normalización Pre-Norm. La innovación declarada es LayerRoPE: una codificación posicional rotatoria con cuatro parámetros aprendidos (componentes de magnitud y de rotación, `α_mag`, `α_rot`, `β_mag`, `β_rot`), inicializados en `α_mag = α_rot = 0` y `β_mag = β_rot = −0,5`, y con frecuencia base `b = 100`. Esta frecuencia base es notablemente inferior a la habitual en RoPE (10 000 en LLaMA), lo que implica una rotación mucho más rápida entre posiciones consecutivas. La model card no detalla si los parámetros aprendidos se comparten entre capas o son independientes por capa, ni la formulación exacta de la modulación de magnitud.

El preentrenamiento se realizó sobre allenai/c4 en inglés con 4× los tokens óptimos de Chinchilla. Aplicando la regla estándar de Chinchilla (≈20 tokens por parámetro), 4× equivaldría a del orden de 100 mil millones de tokens (aproximadamente 104B), aunque el autor no confirma la cifra exacta. La tasa de aprendizaje indicada, 3,2e-2, es muy superior a los valores típicos de preentrenamiento de transformers (del orden de 1e-4 a 3e-4), lo que sugiere que el nombre del repositorio codifica un hiperparámetro de una barrida experimental con una escala propia. No se menciona ningún proceso de ajuste por instrucciones, RLHF, DPO o alineación de seguridad: es un modelo base puro. El código de preentrenamiento está disponible en el repositorio de GitHub del autor.

## Capacidades

- Modelado de lenguaje y generación de texto en inglés: es un modelo base entrenado con objetivo de predicción del siguiente token.
- Razonamiento y conocimiento derivados del preentrenamiento sobre C4, sin evaluación publicada que los cuantifique.
- Codificación posicional experimental (LayerRoPE) como objeto de estudio en sí mismo.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- Multilingüe: no; únicamente inglés según el campo `language` de la model card.
- Sin modo de pensamiento (thinking), sin visión, sin audio y sin capacidades multimodales.
- Sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene un formato de chat.

## Casos de uso

- Investigación sobre codificaciones posicionales: comparar LayerRoPE con RoPE estándar y con variantes como RoPE por capas o ALiBi, midiendo perplejidad y estabilidad del entrenamiento a igualdad de presupuesto de cómputo.
- Reproducibilidad de barridas de tasa de aprendizaje: este checkpoint es una celda concreta (lr 3,2e-2, semilla 1) de una serie; usarlo junto a los demás checkpoints del autor para analizar sensibilidad al learning rate y varianza entre semillas.
- Punto de partida para ajuste supervisado (SFT): al ser un modelo base en inglés de 1,3B, sirve como inicialización para experimentos de instruction tuning a bajo coste.
- Distilación y generación de datos: útil como profesor o alumno en experimentos de destilación y en la generación de texto sintético en inglés para dominios acotados.
- Estudio de cuantización: su tamaño permite ejecutar comparativas int8/int4 frente a bf16 en una única GPU de consumo y medir la degradación de perplejidad.
- Evaluación de perplejidad en C4 o en corpus ingleses de dominio específico, con fines de comparación metodológica.
- Docencia y formación: ejemplo práctico de entrenamiento de un transformer pequeño desde cero con un cambio arquitectónico concreto y código reproducible.
- Experimentos de decodificación y análisis de atención: al no estar alineado ni ajustado, es adecuado para inspeccionar distribuciones de probabilidad, atención y comportamiento posicional sin sesgos introducidos por RLHF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia (estimación a partir de 1,3B parámetros): ~2,6 GB de pesos en bf16/fp16, ~5,2 GB en fp32, ~1,3 GB en int8 y del orden de 0,7-0,9 GB en int4 (requiere cuantización propia, no se publican pesos GGUF).
- GPU de consumo: cabe con holgura en cualquier GPU con 6 GB o más de VRAM, como RTX 3060, RTX 4060, RTX 2060 o superiores; también en GPUs integradas con memoria unificada suficiente.
- GPU profesionales: A100, H100 o L40S están sobredimensionadas para un modelo de este tamaño; solo tendrían sentido para entrenamiento o para inferencia con lotes muy grandes.
- Opciones de despliegue: PyTorch con `transformers` y el código del repositorio del autor; es probable que vLLM, TGI, llama.cpp y Ollama no soporten LayerRoPE de forma nativa al no ser un módulo estándar, por lo que requerirían portar la implementación (o `trust_remote_code` si el repositorio lo incluye).
- Latencia y throughput: no disponible. En términos generales, un modelo de esta clase en bf16 sobre una GPU de consumo moderna suele operar en el rango de decenas a varios cientos de tokens por segundo según backend, lote y longitud de secuencia, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1b_layerrope_lr3.2e-2_seed1 | ~1,3B | No disponible | 4× Chinchilla (≈100B estimados) | No disponible | Hugging Face, 0 descargas |
| TinyLlama-1.1B | 1,1B | 2048 | ~3T | Apache-2.0 | Hugging Face, muy extendido |
| Pythia-1.4B | 1,4B | 2048 | ~300B | Apache-2.0 | Hugging Face, muy extendido |
| SmolLM-1.7B | 1,7B | 2048 | ~1T | Apache-2.0 | Hugging Face, extendido |
| Qwen2.5-1.5B | 1,5B | 32768 | ~18T | Apache-2.0 | Hugging Face, muy extendido |

Los datos de los modelos comparativos proceden de sus model cards públicas y deben verificarse antes de usarse como referencia. La diferencia clave de este checkpoint no es el rendimiento (no evaluado), sino su propósito: validar LayerRoPE en un entorno controlado, frente a alternativas orientadas a uso general con licencias permisivas y ecosistema de herramientas maduro.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue órdenes, no mantiene formato conversacional y no debe usarse como asistente tal cual.
- Licencia no declarada: sin licencia explícita, no puede asumirse permiso para uso comercial; en la práctica, la ausencia de licencia implica reserva de derechos por defecto en muchas jurisdicciones.
- Solo inglés: no hay soporte multilingüe ni evaluación en otros idiomas.
- Longitud de contexto desconocida: no se documenta la ventana máxima, lo que impide planificar tareas de contexto largo y complica el ajuste de la codificación posicional.
- Riesgo de alucinación y de contenido sesgado o tóxico: el corpus C4 es texto web rastreado en inglés, con sesgos demográficos, estereotipos y contenido potencialmente ofensivo heredados del dataset.
- Sin alineación de seguridad: no ha pasado por RLHF, DPO ni filtros de moderación posteriores.
- Sin datos de benchmarks ni validación por la comunidad (0 descargas, 0 likes en el momento de la consulta), por lo que no hay evidencia independiente de su calidad.
- Compatibilidad limitada: LayerRoPE es una codificación posicional no estándar, lo que probablemente rompe la carga directa en vLLM, TGI, llama.cpp u Ollama y exige usar el código del autor.
- Riesgo de sobreajuste al régimen experimental: al proceder de una barrida de hiperparámetros con una tasa de aprendizaje atípica, su comportamiento puede no ser representativo de un modelo de producción equivalente.
- La información sobre arquitectura interna (capas, dimensiones, cabezas, tokenizador) no está disponible en la model card, lo que dificulta estimar costes de entrenamiento y requisitos de memoria con precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shikhar-srivastava/1b_layerrope_lr3.2e-2_seed1
- Código de preentrenamiento (LayerRoPE): https://github.com/shikhar-srivastava/layer-rope
- Dataset de entrenamiento (allenai/c4): https://huggingface.co/datasets/allenai/c4
