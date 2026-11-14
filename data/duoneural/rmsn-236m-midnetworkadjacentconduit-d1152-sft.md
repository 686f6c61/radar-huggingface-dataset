# DuoNeural/RMSN-236M-MidNetworkAdjacentConduit-D1152-SFT

## Resumen

RMSN-236M-MidNetworkAdjacentConduit-D1152-SFT es un modelo de lenguaje de 236 millones de parametros desarrollado por DuoNeural Lab (Aura, Archon y Jesse Kuhl) y publicado en noviembre de 2026. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base RMSN-236M-MidNetworkAdjacentConduit-D1152-Base, y su proposito declarado no es tanto el uso general como servir de punto de comparacion experimental dentro de una linea de investigacion sobre arquitecturas port-hamiltonianas.

El modelo emplea una formulacion dinamica port-hamiltoniana con bracket conservativo y termino metriplectico de Morrison, en lugar de un transformer convencional. Su interes tecnico reside en el estudio de la posicion de los "condensados" topologicos dentro de la red: este modelo coloca un conducto de dos capas (L6+L7) al 40% de profundidad, mientras que el modelo de referencia d19s1 KAM-TD los situa al 84-89%. El resultado experimental es que una mayor fuerza de anclaje (3.0 frente a 2.783) no compensa una posicion suboptima, un hallazgo que los autores denominan "Terminal Condensate Advantage".

Los resultados del ajuste fino son modestos en terminos absolutos (perplejidad wiki de 202,41 y de cadena de pensamiento de 19,36), lo que es coherente con un modelo de 236M parametros entrenado como experimento de arquitectura y no como producto. La licencia Apache 2.0 permite uso comercial, pero el modelo solo declara soporte para ingles y no presenta benchmarks estandar de la industria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Port-hamiltoniana (RMSN): bracket conservativo {·,H} + Morrison metriplectic [·,S]; condensados topologicos y solitones |
| Parametros totales | 236M (segun el identificador del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamano del repo: 0.9 GB) |

## Arquitectura y entrenamiento

La arquitectura RMSN se describe mediante la ecuacion dinamica ḟ = {f, H} + [f, S], es decir, un sistema port-hamiltoniano que combina un bracket de Poisson conservativo con un termino metriplectico de Morrison que introduce disipacion. Sobre esta base dinamica, el modelo organiza su representacion en "condensados" topologicos y "solitones" distribuidos a distintas profundidades de la red. En este modelo concreto, el mapa topologico del modelo base muestra solitones en L0 (5.757), L11 (5.125), L13 (2.436) y L14 (5.063), un condensado exacto de dos capas adyacentes en L6 y L7 (ambos con valor 1.000, al 40% de profundidad) y un pin terminal casi exacto en L15 (1.001).

El ajuste fino supervisado se ejecuto durante 5.000 pasos con una tasa de aprendizaje de 2e-5 y annealing coseno, alcanzando una perdida minima de 2.0553. Durante todo el proceso el exponente de Lyapunov se mantuvo en el rango 0.001-0.05, lo que indica que la topologia del conducto intermedio (L6+L7) permanecio extremadamente rigida y se preservo la estructura del modelo base. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset de SFT ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto en ingles sobre la base de un ajuste fino supervisado.
- Razonamiento de cadena de pensamiento (CoT): el modelo reporta una perplejidad CoT de 19.36, lo que sugiere entrenamiento orientado a trazas de razonamiento.
- Capacidad de mantener estabilidad dinamica durante el ajuste (exponente de Lyapunov proximo a cero), lo que indica preservacion de la topologia aprendida.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multipaso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles declarado.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion en arquitecturas alternativas a transformers: el modelo sirve como referencia reproducible para estudiar formulaciones port-hamiltonianas y su comportamiento tras SFT, gracias a que la model card documenta el mapa topologico completo de capas y los hiperparametros del ajuste.
- Estudios de posicion de condensados en redes profundas: util para replicar experimentos sobre donde colocar "anclajes" topologicos y como afecta la profundidad a la perplejidad tras SFT, comparando directamente con el modelo d19s1 KAM-TD.
- Analisis de estabilidad dinamica en entrenamiento: la monitorizacion del exponente de Lyapunov (0.001-0.05) ofrece un caso documentado para validar tecnicas de control de rigidez topologica durante el fine-tuning.
- Prototipado de bajo coste en ingles: con 0.9 GB de repo y 236M de parametros, es viable para experimentos de generacion de texto en entornos con recursos limitados, siempre aceptando la calidad reducida (perplejidad wiki de 202.41).
- Reproducibilidad academica: la licencia Apache 2.0 y la publicacion del modelo base permiten reutilizar el pipeline de SFT (5.000 pasos, LR 2e-5, cosine annealing) en laboratorios de investigacion.
- Benchmarking de metodologias de evaluacion: su condicion de modelo experimental lo hace adecuado como caso de prueba para herramientas de evaluacion de perplejidad y de coherencia en cadenas de razonamiento.

## Benchmarks y rendimiento

| Modelo | Anclaje | Profundidad del anclaje | wiki_ppl | CoT_ppl |
|---|---|---|---|---|
| d1152 MNAC (este modelo) | 3.0 | 40% | 202.41 | 19.36 |
| d19s1 KAM-TD | 2.783 | 84-89% | 162.93 | 14.16 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento son las perplejidades anteriores y la perdida de SFT (2.0553).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 236M de parametros, una carga en fp16 requeriria aproximadamente 0,5 GB de pesos, y en fp32 alrededor de 1 GB (estimacion a partir del tamano, no confirmada por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 236M de parametros, aunque el formato de pesos no esta confirmado.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; al no tratarse de un transformer convencional, el soporte en estos frameworks no esta garantizado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | wiki_ppl | CoT_ppl | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RMSN-236M-MNAC-D1152-SFT (este) | 236M | no disponible | 202.41 | 19.36 | Apache 2.0 | Hugging Face |
| d19s1 KAM-TD | no disponible | no disponible | 162.93 | 14.16 | no disponible | Referenciado en la model card |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo de caracter experimental: su proposito declarado es servir de comparacion en un estudio de arquitectura, no un uso productivo general.
- Rendimiento absoluto bajo: una perplejidad wiki de 202.41 indica una calidad de modelado del lenguaje limitada incluso para su tamano.
- Solo ingles declarado; no hay evidencia de capacidades multilingues.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con ventanas largas.
- Arquitectura no estandar (port-hamiltoniana): puede no ser compatible con los frameworks de inferencia y las herramientas habituales (vLLM, llama.cpp, TGI), lo que complica el despliegue.
- Riesgo de alucinacion: no evaluado ni documentado por el autor.
- Sesgos conocidos: no documentados.
- Aunque la licencia Apache 2.0 permite uso comercial, la escasez de evaluaciones y la naturaleza experimental del modelo desaconsejan su uso en produccion sin validacion adicional.
- La model card incluye terminologia y afirmaciones propias del autor ("Terminal Condensate Advantage", notacion 🌊⁹²) que no cuentan con validacion independiente en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-236M-MidNetworkAdjacentConduit-D1152-SFT
- Modelo base: https://huggingface.co/DuoNeural/RMSN-236M-MidNetworkAdjacentConduit-D1152-Base
- Paper, blog, repositorio o demo: no disponible en la informacion proporcionada.
