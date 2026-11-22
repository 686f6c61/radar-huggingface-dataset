# frankmorales2020/qwen2.5-0.5b-topo-governed-cbp-fineweb

## Resumen

`qwen2.5-0.5b-topo-governed-cbp-fineweb` es un checkpoint experimental de tipo causal transformer publicado por frankmorales2020 sobre el modelo base `Qwen/Qwen2.5-0.5B` (494 millones de parametros reales segun los safetensors del repo). No se trata de un modelo nuevo entrenado desde cero, sino de una finetune continuada sobre el subconjunto `sample-10BT` de `HuggingFaceFW/fineweb-edu` que aplica un protocolo propio denominado Continual Backpropagation (CBP) combinado con un "Topological Governor" (TOPO-2026). El objetivo declarado es demostrar que un transformer autorregresivo puede adaptarse a un flujo de datos web no estacionario sin sufrir deriva representacional ni olvido catastrofico.

La propuesta tecnica se apoya en anclar un subconjunto de filas de la matriz de embeddings (las asociadas a los primos 2, 3, 5, 7, 11 y 13) a sus valores iniciales, mientras el resto del manifold se actualiza con un factor de atenuacion derivado del producto de Euler truncado (Lambda = 0.9785142874). El autor reporta cero deriva en esas coordenadas ancladas frente a una deriva creciente del orden de 10^-3 en un baseline sin gobernar, a lo largo de 5.000 pasos de gradiente con semilla determinista 123.

El interes practico es acotado: es un artefacto de investigacion sobre plasticidad y estabilidad en aprendizaje continuo, no un modelo de produccion. Su tamano (0,5B), su contexto heredado de Qwen2.5 y su licencia Apache 2.0 lo hacen facil de ejecutar, pero su utilidad real depende de validar las afirmaciones del autor, que no incluyen benchmarks estandar en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (heredada de Qwen2.5-0.5B) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | ingles (segun model card; el campo de idiomas de HF figura como no disponible) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, RoPE y sesgo de atencion QKV, sin mezcla de expertos. Sobre esa base, el autor aplica un protocolo de entrenamiento continuo en dos fases sobre la matriz de embeddings `W_embed` de dimension V x D. En la fase previa al paso, los gradientes de las filas indexadas por los primos {2, 3, 5, 7, 11, 13} se anulan y el resto se multiplica por un factor de atenuacion Lambda = 1 - producto sobre p en P de (1 - 1/sqrt(p)) = 0.9785142874. En la fase posterior al paso, esas mismas filas se reproyectan exactamente a sus valores iniciales para compensar la deriva introducida por el weight decay desacoplado y los buffers de momento del optimizador.

El entrenamiento se realizo sobre `HuggingFaceFW/fineweb-edu` (`sample-10BT`) durante 5.000 pasos de gradiente continuos, con AdamW (lr = 2e-5, weight decay = 1e-4) y semilla 123 declarada como determinista en Python, NumPy, PyTorch y CUDA. No se documentan en la model card el numero total de tokens procesados, la composicion exacta del dataset ni fases de RLHF o DPO; las referencias a RLHF aparecen solo en el nombre de un notebook del repositorio del autor. La innovacion declarada es la combinacion de CBP (reciclado de unidades de baja utilidad, segun Dohare et al., Nature 2024) con el anclaje topologico de coordenadas primas, presentado como solucion al dilema estabilidad-plasticidad.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Qwen2.5-0.5B.
- Conversacion multi-turno basica (pipeline `text-generation`, tag `conversational`).
- Razonamiento de baja complejidad y respuesta a instrucciones simples, limitado por el tamano de 0,5B.
- Generacion de codigo y matematicas basicas: capacidad heredada del base, no evaluada ni documentada en este checkpoint.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamano del modelo lo hace poco adecuado para cadenas largas de agentes.
- Capacidades multilingues: la model card declara solo ingles; no se garantiza cobertura de otros idiomas.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio. El valor diferencial es el protocolo de entrenamiento continuo, no una capacidad funcional nueva.

## Casos de uso

- Investigacion en aprendizaje continuo: reproducir el experimento de 5.000 pasos sobre FineWeb-Edu con semilla 123 y comparar la deriva de las coordenadas ancladas frente a un baseline sin gobernar, usando los notebooks del repositorio del autor.
- Estudio del dilema estabilidad-plasticidad: emplear el checkpoint como referencia empirica para analizar si el anclaje de filas de embedding evita el colapso de rango representacional descrito por Dohare et al. (2024).
- Prototipado de bajo coste en generacion de texto: al ser un modelo de 0,5B en safetensors, cabe en GPU consumer y permite iterar rapidamente en tareas de generacion en ingles sin infraestructura dedicada.
- Educacion y divulgacion: ilustrar en cursos o articulos como un boundary condition numerico sobre los embeddings afecta a la dinamica de entrenamiento de un transformer real.
- Base para experimentos de finetune: servir como punto de partida para probar variantes del gobernador topologico (distintos conjuntos de primos, otros valores de Lambda) sobre el mismo corpus y comparar curvas de perdida.
- Evaluacion de metodologia: auditar de forma independiente las afirmaciones de deriva cero y de descenso de perdida publicadas en la model card, ya que no hay benchmarks estandar que las respalden.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros). Los unicos datos empiricos disponibles son las curvas de perdida y deriva del propio autor durante el entrenamiento continuo:

| Paso | Perdida LM gobernada | Deriva gobernada (TOPO-2026) | Perdida LM baseline | Deriva baseline (sin restricciones) |
|---|---|---|---|---|
| 1 | 3.0187 | 0.0000000000 | 3.0187 | 0.0000305176 |
| 250 | 3.1059 | 0.0000000000 | 3.1067 | 0.0023651123 |
| 500 | 2.6100 | 0.0000000000 | 2.6103 | 0.0021667480 |
| 750 | 2.7106 | 0.0000000000 | 2.7175 | 0.0023345947 |
| 1000 | 2.6727 | 0.0000000000 | 2.6769 | 0.0023345947 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1 GB para los pesos (494M parametros x 2 bytes) mas overhead de activaciones y cache KV, en torno a 1,5-2,5 GB en la practica.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,5-1 GB; en 4 bits, aproximadamente 0,3-0,6 GB (estimaciones a partir del numero de parametros, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de 4-8 GB y en CPU para inferencia lenta.
- Despliegue: compatible con `transformers` (libreria declarada). No se documenta soporte verificado de vLLM, llama.cpp, Ollama ni TGI; al ser un checkpoint transformers estandar, deberia poder convertirse a GGUF, pero no hay confirmacion en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano, se espera un throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-0.5b-topo-governed-cbp-fineweb | 494M | no disponible (heredado de Qwen2.5-0.5B) | Apache 2.0 | Finetune continuo con gobernador topologico sobre FineWeb-Edu | Hugging Face, 568 descargas |
| Qwen/Qwen2.5-0.5B | 494M | no disponible en la informacion proporcionada | Apache 2.0 | Modelo base instructivo generalista | Hugging Face, ampliamente usado |
| Qwen2.5-0.5B-Instruct | 494M | no disponible en la informacion proporcionada | Apache 2.0 | Variante alineada para instrucciones y conversacion | Hugging Face |

La comparativa de rendimiento frente a alternativas no esta disponible: el checkpoint no publica evaluaciones estandar y su proposito es experimental, no competitivo. Frente al base Qwen2.5-0.5B, la diferencia documentada es exclusivamente la dinamica de entrenamiento (deriva anclada a cero), no la calidad de generacion.

## Limitaciones y advertencias

- El modelo es un artefacto de investigacion: no hay benchmarks estandar que respalden su calidad de generacion ni su superioridad frente al base.
- Las afirmaciones de deriva cero se limitan a las filas de embedding indexadas por primos; no cubren el resto de pesos del transformer, que siguen actualizandose sin anclaje.
- El entrenamiento se realizo solo en ingles sobre FineWeb-Edu; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion elevado por el tamano (0,5B) y por la ausencia de fases de alineacion documentadas (RLHF/DPO no confirmados).
- Sesgos: al entrenar sobre web educativa en ingles, hereda los sesgos del corpus y del modelo base; no se documenta ninguna mitigacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene auditar el checkpoint antes de cualquier despliegue en produccion.
- El contexto maximo no se especifica en la model card; hay que consultar la configuracion del modelo base para confirmarlo.
- La semilla determinista 123 y las condiciones exactas de reproduccion dependen de versiones concretas de PyTorch y CUDA; la reproducibilidad bit a bit no esta garantizada en otros entornos.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse.

## Enlaces

- Hugging Face: https://huggingface.co/frankmorales2020/qwen2.5-0.5b-topo-governed-cbp-fineweb
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio GitHub del autor: https://github.com/frank-morales2020/AST
- Notebook principal: https://github.com/frank-morales2020/AST/blob/main/qwen2_5_0_5b_topo_governed_cbp_fineweb.ipynb
- Notebook CBP/TOPO: https://github.com/frank-morales2020/AST/blob/main/CDL_CBP_TOPO.ipynb
- Notebook TOPO CBP RLHF: https://github.com/frank-morales2020/AST/blob/main/TOPO_CBP_RLHF.ipynb
- Notebook Topo CBPO: https://github.com/frank-morales2020/AST/blob/main/Topo_CBPO.ipynb
- Articulo 1: https://medium.com/ai-simplified-in-plain-english/the-architecture-of-permanence-how-topo-cbp-tamed-the-uncharted-stream-a17c1d8425af
- Articulo 2: https://medium.com/@frankmorales_91352/the-silicon-hippocampus-reverse-engineering-300-million-years-of-memory-and-the-final-conquest-of-579bef471e03
- Articulo 3: https://medium.com/ai-simplified-in-plain-english/the-architecture-of-permanence-how-topological-continual-backpropagation-redefines-machine-cf51ad83de12
- Articulo 4: https://medium.com/ai-simplified-in-plain-english/the-architecture-of-permanence-completing-continual-backpropagation-reversing-300-million-years-ed16739b824e
- Paper Zenodo (The Council That Never Forgets): https://doi.org/10.5281/zenodo.23073870
- Libro Zenodo (The Architecture of Permanence): https://doi.org/10.5281/zenodo.22825503
