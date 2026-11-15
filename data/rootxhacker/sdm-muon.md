# rootxhacker/sdm-muon

## Resumen

SDM-Muon (Scheduled Dual-Metric Muon) es un candidato a optimizador publicado en Hugging Face por el usuario rootxhacker, no un modelo de lenguaje entrenado. El repositorio documenta un experimento sobre el algoritmo Muon, que sustituye el momento de Nesterov por su factor polar UVᵀ (descenso de mayor pendiente bajo la norma espectral), y propone anealar durante el entrenamiento dos desviaciones controladas por schedule respecto al Muon exacto: un blanqueamiento de covarianza con fuerza γ(t) y una mezcla de potencia espectral con fuerza λ(t).

La motivacion es comprobar si anealar la metrica de actualizacion a lo largo del entrenamiento supera al Muon fijo. El diseno arranca como Muon exacto y va desplazandose linealmente hacia un regimen dominado por ruido/lineal durante las primeras `anneal_frac` fracciones del entrenamiento, reescalando la mezcla al RMS intrinseco del factor polar de Muon para que la misma tasa de aprendizaje mueva la misma escala de actualizacion en ambos brazos.

El testbed es un GPT de 8 capas y d=768 (~135M parametros) entrenado sobre una muestra de FineWeb sample-10BT durante 3000 pasos (~98M tokens). En el momento de la ultima actualizacion del repositorio el sweep seguia en ejecucion y no se habian publicado resultados numericos. Se trata, por tanto, de material de investigacion sobre optimizacion, no de un modelo desplegable para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Optimizador para entrenamiento (Muon con annealing de metrica dual); el testbed es un transformer GPT de 8 capas, d=768 |
| Parametros totales | ~135M (modelo de prueba del experimento); el optimizador en si no tiene parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene codigo de entrenamiento, no pesos publicados) |

## Arquitectura y entrenamiento

SDM-Muon parte del algoritmo Muon, que reemplaza el momento de Nesterov por su factor polar UVᵀ calculado mediante iteracion de Newton-Schulz con coeficientes quinticos `3.4445, −4.7750, 2.0315`, momento Nesterov 0.95 y escalado de forma `max(1, m/n)^0.5`. Sobre esa base introduce dos desviaciones con schedule: (1) un precondicionamiento en la metrica propia del modelo mediante segundos momentos diagonales del momento de Nesterov por fila y por columna, con EMAs corregidas por sesgo (β₂=0.95), aplicado como `W = G · v_row^(−γ/2) · v_col^(−γ/2)`; y (2) una mezcla lineal de la actualizacion ortogonalizada con el momento blanqueado y normalizado por RMS, que realiza la familia de potencias espectrales `U S^p Vᵀ` entre Muon (p=1) y descenso de gradiente (p→0).

Ambas fuerzas arrancan en 0 (Muon exacto) y suben linealmente durante las primeras `anneal_frac` fracciones del entrenamiento, con reescalado al RMS del factor polar de Muon. El protocolo de comparacion es estricto: el baseline es una copia literal del algoritmo de KellerJordan/Muon (mismo fichero, misma funcion Newton-Schulz, misma regla de escalado), el testbed es identico en ambos brazos (GPT de 8 capas, d=768, bs 32×1024, 3000 pasos, ~98M tokens, FineWeb sample-10BT con tokenizador GPT-2 y 1.048.576 tokens de validacion reservados), el warmup de LR es de 100 pasos, embeddings, cabeza y escalares usan el mismo AdamW (lr 6e-4, betas (0.9, 0.95), eps 1e-10, sin weight decay) y el weight decay del grupo Muon es 0 en ambos brazos. Se barre la tasa de aprendizaje en {0.02, 0.04, 0.07} y se mide entropia cruzada de validacion a pasos y tokens equivalentes. Los hiperparametros candidatos se mantienen fijos: γ=0.5, λ=0.3, anneal_frac=1.0.

## Capacidades

- No es un modelo generativo: no produce texto, codigo ni respuestas.
- Implementa un optimizador de entrenamiento (variante de Muon) para actualizar pesos de redes neuronales.
- Soporta dos mecanismos de annealing configurables: fuerza de blanqueamiento de covarianza γ(t) y fuerza de mezcla de potencia espectral λ(t).
- Incluye un pipeline reproducible de tokenizacion (FineWeb sample-10BT, GPT-2 tiktoken, delimitadores EOT) y de entrenamiento con seguimiento via Trackio.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo thinking.
- No dispone de capacidades multilingues en el sentido de un modelo de lenguaje.

## Casos de uso

- Investigacion en optimizadores: comparar Muon fijo frente a variantes con metrica anealed en un testbed controlado de ~135M parametros, usando el codigo y el protocolo publicados para replicar el sweep.
- Experimentos de ablation: variar γ, λ y `anneal_frac` para estudiar el efecto del annealing de la metrica sobre la entropia cruzada de validacion a presupuesto fijo de tokens.
- Reproduccion de baselines: el repositorio incluye una copia verbatim del algoritmo de KellerJordan/Muon, util para validar implementaciones propias de Newton-Schulz y del escalado de forma.
- Estudio de schedules de entrenamiento: el diseno de rampa lineal desde 0 permite analizar como cambia la escala de actualizacion al pasar de un regimen espectral a uno dominado por ruido.
- Formacion y docencia: material de referencia sobre la relacion entre Muon, la familia de potencias espectrales `U S^p Vᵀ` y el descenso de gradiente como casos limite.
- Prototipado en hardware modesto: el coste reportado es de aproximadamente 50 minutos por brazo en una unica A10G, lo que facilita iterar sobre variantes del optimizador sin grandes recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el sweep esta en ejecucion y que las cifras se reportaran cuando terminen los brazos; el coste acumulado hasta la fecha es de 6 × ~50 minutos en una unica A10G. No se deben inferir numeros de validacion ni comparaciones de perdida sin datos publicados.

## Requisitos de hardware

- El repositorio no publica pesos ni un modelo de inferencia; los requisitos se refieren al entrenamiento del testbed.
- Coste reportado: aproximadamente 50 minutos por brazo de entrenamiento en una unica GPU A10G (24 GB de VRAM).
- Testbed de ~135M parametros con batch 32×1024 y 3000 pasos: cabe con holgura en GPUs de consumo como RTX 3090 o RTX 4090, aunque no se documentan mediciones en esas tarjetas.
- Para el sweep completo (6 brazos) el coste agregado es de aproximadamente 5 horas en una A10G.
- Dependencias declaradas: torch 2.15.0, numpy 2.5.4, trackio 0.45.1, huggingface_hub, datasets y tiktoken.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, ni latencia o throughput de inferencia, porque no aplica a un optimizador.

## Comparativa con modelos similares

| Optimizador | Mecanismo | Parametros del testbed | Contexto | Resultados publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SDM-Muon | Muon + annealing de blanqueamiento y potencia espectral | ~135M (GPT 8 capas, d=768) | no disponible | Pendientes (sweep en curso) | no disponible | Codigo en Hugging Face |
| Muon (KellerJordan) | Factor polar UVᵀ con Newton-Schulz, momento Nesterov | Configurable | no disponible | Usado como baseline en este repo | No especificada en esta ficha | GitHub publico |
| Muon (Moonlight, arXiv:2502.16982) | Muon con matching de escala de actualizacion para LLM | Escala LLM | no disponible | Publicados en el paper | No especificada en esta ficha | Paper |
| Muonᵖ (arXiv:2606.13867) | Familia de potencias espectrales `U S^p Vᵀ` | Configurable | no disponible | Publicados en el paper | No especificada en esta ficha | Paper |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con criterios de generacion, razonamiento o codigo.
- Los resultados del sweep no estan publicados; cualquier conclusion sobre la superioridad de SDM-Muon frente a Muon fijo es prematura.
- El testbed es pequeno (~135M parametros, ~98M tokens, 3000 pasos); los hallazgos pueden no transferirse a escalas mayores.
- Los hiperparametros candidatos (γ=0.5, λ=0.3, anneal_frac=1.0) estan fijados y no se ha explorado su sensibilidad en la informacion disponible.
- La licencia no esta declarada, lo que impide determinar condiciones de uso comercial o redistribucion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa por parte de la comunidad.
- El autor indica que el trabajo se construyo con ML Intern; conviene revisar el codigo antes de usarlo en produccion.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque no aplican a un optimizador, pero tampoco se documenta su robustez numerica en regimenes de entrenamiento distintos al probado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rootxhacker/sdm-muon
- Muon (Keller Jordan, blog): https://kellerjordan.github.io/posts/muon/
- Implementacion canonica de Muon: https://github.com/KellerJordan/Muon
- Old Optimizer, New Norm: An Anthology (arXiv:2409.20325): https://arxiv.org/abs/2409.20325
- Muon is Scalable for LLM Training (Moonlight, arXiv:2502.16982): https://arxiv.org/abs/2502.16982
- Muonᵖ: Muon with Fractional Spectral Powers (arXiv:2606.13867): https://arxiv.org/abs/2606.13867
- Understanding Gradient Orthogonalization via Non-Euclidean Trust-Region Optimization (arXiv:2503.12645): https://arxiv.org/abs/2503.12645
- ML Intern (Hugging Face Chat): https://hf.co/chat?mode=ml-intern
