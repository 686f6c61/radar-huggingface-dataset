# LeonaQuantum/LeonaQ-Orbit-9B

## Resumen

LeonaQ-Orbit-9B es un ajuste fino del modelo Qwen3.5-9B desarrollado por LeonaQuantum, que introduce dos adaptadores de circuito cuantico simulado conectados en anillo sobre un backbone congelado en precision 4 bits. El modelo resuelve un problema de investigacion concreto: explorar si adaptadores inspirados en circuitos cuanticos (con rotaciones RY/RZ aprendidas y puertas CNOT) pueden igualar o superar a adaptadores MLP o LoRA convencionales con un numero drasticamente menor de parametros entrenables. En concreto, entrena solo 197.088 parametros, aproximadamente 8 veces menos que un adaptador MLP-16 equivalente.

La relevancia del modelo es fundamentalmente experimental: demuestra que un adaptador de muy baja dimensionalidad puede alcanzar una puntuacion media de 71,02 en un macro-promedio de diez benchmarks, frente a 70,96 del backbone base sin adaptador y 70,90 de un MLP-16 con 1.576.704 parametros. La ganancia absoluta es marginal, pero el resultado sugiere que las arquitecturas de adaptadores inspiradas en circuitos cuanticos son una via viable de eficiencia parametrica.

El modelo se distribuye con licencia Apache 2.0, pesos en safetensors y PyTorch, y esta pensado para ejecutarse en GPU NVIDIA mediante un loader propio incluido en el repositorio. Su tamano de repositorio es de 5,7 GB, coherente con un backbone de 9B parametros cuantizado a 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) con backbone congelado en 4 bits y dos adaptadores de circuito cuantico simulado conectados en anillo |
| Parametros totales | 9B (backbone) + 197.088 (adaptadores entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Backbone en 4 bits simetrico, group size 64; adaptadores en precision de entrenamiento |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, PyTorch |

## Arquitectura y entrenamiento

El backbone es Qwen3.5-9B, un transformer de 9.000 millones de parametros que se mantiene congelado en cuantizacion simetrica de 4 bits con group size 64. Sobre el se insertan dos adaptadores en los bloques 16 y 32, despues de las proyecciones de salida de la red feed-forward. Cada adaptador implementa cuatro caminos coherentes con ocho qubits de datos por camino, tres capas de rotaciones RY/RZ aprendidas alternadas con pares de puertas CNOT conectadas en anillo, y una lectura que produce 16 caracteristicas proyectadas de vuelta a la representacion oculta del modelo. Los circuitos se ejecutan mediante simulacion clasica de vector de estado, no en hardware cuantico.

El entrenamiento utiliza 1.000 ejemplos, 200 actualizaciones, optimizador AdamW con learning rate 0,0002 y seleccion de checkpoint por entropia cruzada de validacion. Todos los adaptadores comparados en la model card usan el mismo conjunto de entrenamiento, numero de actualizaciones y semilla (17), lo que hace la comparacion controlada. No se especifica la composicion del dataset de entrenamiento ni si hubo RLHF o DPO; el ajuste se limita a los adaptadores, sin modificar el backbone.

## Capacidades

- Generacion de texto en ingles sobre la base de Qwen3.5-9B.
- Razonamiento y respuesta a preguntas de opcion multiple (evaluado en ARC, BoolQ, HellaSwag, MMLU, OpenBookQA, PIQA, SciQ, WinoGrande).
- Razonamiento matematico basico con respuesta exacta (GSM8K, 79,98% de exact match estricto).
- Inferencia causal estandar de un modelo de lenguaje; no se documentan capacidades de tool calling ni function calling.
- No se documentan capacidades de agentes, multi-step reasoning explicito, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Investigacion sobre eficiencia parametrica de adaptadores: el modelo sirve como referencia reproducible para comparar adaptadores de circuito cuantico contra MLP y LoRA con el mismo presupuesto de entrenamiento (1.000 ejemplos, 200 updates, semilla 17).
- Experimentos academicos de quantum-inspired machine learning: permite estudiar si las rotaciones RY/RZ y las CNOT en anillo aportan ventajas frente a adaptadores clasicos en tareas de razonamiento y matematicas.
- Evaluacion comparativa de tecnicas de fine-tuning con backbone congelado en 4 bits: util para medir el impacto de la cuantizacion del backbone en el rendimiento de adaptadores de baja dimension.
- Generacion de texto en ingles en entornos de prototipado: el modelo puede usarse para tareas de generacion general, aunque sin ventajas claras frente al Qwen3.5-9B base.
- Reproduccion de benchmarks: el repositorio incluye `evaluation/results.json` con las puntuaciones completas, lo que facilita replicar el macro-promedio de diez tareas.
- Docencia y divulgacion: ejemplo practico de como simular circuitos cuanticos como capas diferenciables dentro de un transformer y entrenarlas de extremo a extremo con simulacion de vector de estado.
- Base para futuros adaptadores cuanticos: los 197.088 parametros entrenables y el loader incluido permiten experimentar con variantes de circuito sin reentrenar el backbone.

## Benchmarks y rendimiento

Resultados de la model card (porcentajes; media con igual peso sobre diez benchmarks; GSM8K con exact match estricto):

| Modelo | Parametros del adaptador | Puntuacion media | GSM8K |
|---|---:|---:|---:|
| Orbit | 197.088 | 71,02 | 79,98 |
| Qwen3.5-9B (mismo backbone 4 bits) | 0 | 70,96 | 79,91 |
| MLP-2 | 197.088 | 70,54 | 77,03 |
| MLP-8 | 788.352 | 70,54 | 76,72 |
| MLP-16 | 1.576.704 | 70,90 | 77,71 |
| LoRA rank 6, un sitio | 98.304 | 70,95 | 77,79 |
| LoRA rank 6, dos sitios | 196.608 | 70,87 | 74,98 |

Los diez benchmarks del macro-promedio son ARC-Challenge, ARC-Easy, BoolQ, HellaSwag, MMLU, OpenBookQA, PIQA, SciQ, WinoGrande y GSM8K. Frente a un adaptador MLP de parametros comparables, Orbit registra 7 victorias, 2 empates y 1 derrota. La mejora sobre el backbone sin adaptador es de 0,06 puntos porcentuales en la media, y de 0,07 en GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 5,7 GB, coherente con un backbone de 9B en 4 bits (aproximadamente 4,5-5 GB de pesos) mas overhead de activaciones y simulacion de circuitos. Se estiman 8-12 GB de VRAM en funcion de la longitud de contexto y el tamano de lote; no se proporciona una cifra oficial.
- GPU recomendadas: NVIDIA con soporte CUDA. El loader incluido esta pensado para GPU NVIDIA; no se documentan requisitos minimos concretos.
- Cabe en GPU de consumo: probablemente en RTX 3090, RTX 4090 y GPUs con 12 GB o mas, dado el tamano del repositorio, aunque no se confirma oficialmente.
- Opciones de despliegue: el repositorio incluye `generate.py` y un loader propio (`from orbit import load_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato es safetensors con PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntuacion media (10 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeonaQ-Orbit-9B | 9B + 197.088 adaptador | No disponible | 71,02 | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (base, 4 bits) | 9B | No disponible | 70,96 | No disponible en la informacion | Hugging Face |
| MLP-16 sobre Qwen3.5-9B | 9B + 1.576.704 adaptador | No disponible | 70,90 | No disponible | Referencia interna de la model card |
| LoRA rank 6, dos sitios | 9B + 196.608 adaptador | No disponible | 70,87 | No disponible | Referencia interna de la model card |

La comparativa se limita a variantes del mismo backbone evaluadas en la model card; no se dispone de datos frente a otros modelos de 9B de otros fabricantes.

## Limitaciones y advertencias

- La mejora sobre el backbone sin adaptador es marginal (0,06 puntos en la media de diez benchmarks), por lo que el valor practico del modelo frente a Qwen3.5-9B base es cuestionable fuera de la investigacion.
- Solo soporta ingles segun la model card; no se documentan otros idiomas.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con ventanas largas.
- El entrenamiento usa solo 1.000 ejemplos y 200 actualizaciones, un regimen muy reducido que limita la generalizacion a dominios especializados.
- No se documentan capacidades de tool calling, agentes, vision ni audio; el modelo es exclusivamente de generacion de texto.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 9B; no se han publicado evaluaciones de factualidad ni de sesgos.
- El loader propio y la simulacion de circuitos en PyTorch pueden no ser compatibles con frameworks de despliegue estandar (vLLM, TGI, llama.cpp), lo que complica la puesta en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B debe verificarse por separado en cuanto a sus propios terminos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LeonaQuantum/LeonaQ-Orbit-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Resultados completos de evaluacion (referenciados en la model card): `evaluation/results.json` dentro del repositorio
- Imagen de rendimiento y parametros del adaptador: https://huggingface.co/LeonaQuantum/LeonaQ-Orbit-9B/resolve/22e37091bf5ebae21a5f61c22cb70db6b3f6982d/assets/parameter_performance.png
- Esquema del circuito en anillo (referenciado en la model card): `assets/ring_circuit.png` dentro del repositorio
