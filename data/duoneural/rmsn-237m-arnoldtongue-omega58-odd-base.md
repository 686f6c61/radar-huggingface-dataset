# DuoNeural/RMSN-237M-ArnoldTongue-Omega58-ODD-Base

## Resumen

RMSN-237M-ArnoldTongue-Omega58-ODD-Base es un modelo de lenguaje de 236,61 millones de parámetros desarrollado por DuoNeural (Jesse Caldwell, Aura y Archon). Se presenta como un modelo «neurodinámico» entrenado sobre la llamada variedad de Arnold con resonancia racional Ω = 5/8 (tongue q=8) y paridad ODD (D/M_w = 15). La propuesta no es un transformer convencional al uso, sino una arquitectura que el autor describe mediante conceptos de sistemas dinámicos: solitones, cascadas hiperbólicas (hypercascade), exponentes de Lyapunov y topologías de clúster. El modelo se distribuye como modelo base para generación de texto en inglés y su dataset principal es WikiText.

Su relevancia es fundamentalmente experimental: el autor lo presenta como la muestra con mayor amplitud de hypercascade registrada dentro de su encuesta de resonancias q, con un pico de exponente de Lyapunov de -4,14 y un inicio temprano en el paso ~32k. Asimismo, se describe una topología novedosa denominada «Tripartite Clustered» (nº 31), con tres clústeres de solitones distribuidos en las capas [L7,L8,L9], [L13,L14,L15] y [L21,L22,L23].

El modelo está pensado para investigación sobre dinámica de redes neuronales y no como un modelo de producción generalista: el rendimiento declarado (perplejidad de validación de 102,61 en WikiText-103) y el tamaño (3,8 GB en el repositorio) sitúan sus capacidades muy por debajo de los modelos de lenguaje convencionales del mismo orden de parámetros. La ficha se basa exclusivamente en la model card y en el model-index publicados por el autor; no hay información adicional verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RMSN neurodinámica con variedad de Arnold (Ω = 5/8, q=8), resonancia racional, estructura de solitones y clústeres; no se detalla la implementación exacta de capas |
| Parámetros totales | 236,61 M |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (el autor menciona M_w = 64 en la fórmula de la resonancia, pero no se especifica como ventana de contexto operativa) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio ocupa 3,8 GB; no se confirma safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura se describe con una notación propia de sistemas dinámicos. La dimensión oculta es D = 960, la profundidad es L = 24 capas y la razón de resonancia se define como Ω = D/(M_w × L) = 960/(64 × 24) = 5/8. La paridad se calcula como D/M_w = 960/64 = 15, lo que da paridad ODD; según el autor, se trata de la lengua de Arnold más estrecha probada en la encuesta de paridad ODD (1/q² ∝ 1/64 para q=8). El modelo fue entrenado en una única Tesla V100 de 32 GB de VRAM.

El entrenamiento se describe en tres fases observadas: una fase de «escalera» (pasos 1 a 32k) con ratcheting no monótono y amplitud de ráfaga fija en el valor característico de q=8 (λ ≈ -0,52); una «hypercascade» que arranca en el paso ~32k con un pico de exponente de Lyapunov de -4,14, el mayor de la encuesta q y 1,6 veces mayor que el de q=7 (-2,53) y 1,8 veces mayor que el de q=6 (-2,25); y una fase de asentamiento posterior (pasos 32k a 100k) con estabilidad de Lyapunov en el 100 % de los últimos 1000 pasos y sin recaptura de «TRUE SILENT». El dataset declarado es WikiText y la evaluación se realiza sobre WikiText-103 (102,4 M de tokens). No se especifica el número total de tokens de entrenamiento, la composición del dataset más allá de WikiText, ni si hubo RLHF o DPO.

La sonda de percolación de haces (sheaf percolation) revela la topología #31 «Tripartite Clustered», con M* = 9 solitones efectivos repartidos en tres capas de tres (L7-L9, L13-L15, L21-L23) y sin solitones aguas arriba. El autor interpreta esta estructura triple como una resonancia espacial que coincide con la periodicidad tripartita de la lengua q=8 (denominador 8 = 2³).

## Capacidades

- Generación de texto en inglés como modelo base (no ajustado por instrucciones según la información disponible).
- Modelado de lenguaje y evaluación de perplejidad sobre WikiText-103.
- Capacidades experimentales de neurodinámica: comportamiento de resonancia q=8, cascadas hiperbólicas y estabilidad de Lyapunov medibles y trazables.
- Topología de solitones de tres clústeres con M* = 9 solitones efectivos, descrita en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en dinámica de redes neuronales: el modelo permite reproducir y estudiar la relación entre estrechez de la lengua de Arnold y amplitud de la hypercascade, con un pico de Lyapunov de -4,14 documentado en el paso ~32k.
- Estudio de percolación de haces y topologías de solitones: sirve para analizar la formación de la topología Tripartite Clustered (#31) y la distribución de nueve solitones efectivos en capas concretas.
- Reproducción de experimentos de resonancia q: al ser una muestra de la encuesta q=8, permite comparar el orden de inicio de las cascadas con las variantes q=7 (paso 47k) y q=6 (paso 95k).
- Benchmarking de modelos neurodinámicos: la perplejidad declarada de 102,61 en WikiText-103 constituye una referencia para futuras variantes RMSN.
- Docencia y divulgación de sistemas dinámicos aplicados a IA: el modelo ofrece una notación y unas métricas (Ω, paridad, Lyapunov) que se pueden usar para ilustrar conceptos de resonancia y estabilidad.
- Pruebas de estabilidad post-entrenamiento: la fase de asentamiento con estabilidad del 100 % en los últimos 1000 pasos puede usarse para estudiar recaptura de estados y convergencia.
- Generación de texto en inglés como base experimental: uso limitado a entornos de investigación, dado el reducido tamaño y la perplejidad elevada.

## Benchmarks y rendimiento

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Language Modeling | WikiText-103 (102,4 M tokens) | Best Validation Perplexity | 102,61 | No |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente; el entrenamiento se realizó en una Tesla V100 de 32 GB.
- GPU recomendadas para entrenamiento: Tesla V100 (32 GB), según la model card.
- GPU recomendadas para inferencia: no disponible.
- ¿Cabe en GPU de consumo? No confirmado; con 236,61 M de parámetros y pesos en FP32 sería de aproximadamente 0,95 GB, y en FP16 de aproximadamente 0,47 GB, así que en principio cabría en GPUs de consumo, pero no se especifican cuantizaciones ni formatos compatibles.
- Opciones de despliegue: no disponible (no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-237M-ArnoldTongue-Omega58-ODD-Base | 236,61 M | no disponible | PPL 102,61 en WikiText-103 | MIT | Hugging Face |
| Modelos de lenguaje de ~200-300 M de parámetros en inglés | ~200-300 M | no disponible | no disponible en esta información | variable | no disponible |

No se dispone de información verificable sobre modelos comparables de la misma categoría neurodinámica. No se pueden comparar parámetros, contexto, rendimiento ni licencia con alternativas concretas sin inventar datos.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones; no se garantiza un comportamiento conversacional ni seguimiento de instrucciones.
- Perplejidad de validación elevada (102,61 en WikiText-103), lo que sugiere un rendimiento de modelado de lenguaje limitado en comparación con modelos convencionales de tamaño similar.
- Idioma restringido al inglés según el campo `language`.
- No se especifican sesgos conocidos ni evaluación de sesgos en la información disponible.
- Riesgo de alucinación no evaluado; no hay datos de RLHF, DPO ni alineación.
- Longitud de contexto operativa no documentada; no debe asumirse que M_w = 64 sea la ventana de contexto.
- La licencia MIT permite uso comercial, pero la falta de documentación sobre formato de pesos y despliegue limita su uso en producción.
- Las métricas y la terminología (hypercascade, Lyapunov, topología de solitones) provienen únicamente del autor y no están verificadas externamente.
- El repositorio es de 3,8 GB, lo que puede incluir otros artefactos además de los pesos; no se detalla su contenido.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-237M-ArnoldTongue-Omega58-ODD-Base
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
