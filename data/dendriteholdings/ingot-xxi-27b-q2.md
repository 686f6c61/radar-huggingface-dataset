# dendriteholdings/Ingot-XXI-27B-Q2

## Resumen

Ingot-XXI-27B-Q2 es un modelo de lenguaje de 26.896 millones de parametros publicado por dendriteholdings como espejo publico de una submission ganadora en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que mas se aproxima a el. El modelo parte de prism-ml/Ternary-Bonsai-2-27B-gguf y aplica un ajuste fino sobre los pesos no ternarios para acercar la salida al profesor Qwen3.8-27B, manteniendo intactos los codigos ternarios originales.

Se distribuye exclusivamente en formato GGUF con dos variantes que contienen exactamente los mismos pesos ternarios: una a 1,75 bits por peso (5,95 GB) y otra en contenedor de 2 bits (7,21 GB, 2,125 bpw). No es un modelo de proposito general pensado para produccion convencional: es un artefacto de investigacion sobre cuantizacion extrema y destilacion, con requisitos de ejecucion muy especificos (fork propio de llama.cpp) y sin model card convencional sobre capacidades, idiomas o licencia.

Su relevancia actual reside en dos frentes: demuestra que la cuantizacion ternaria con rotacion de Hadamard y atencion lineal puede mantener una fidelidad medible frente a un profesor BF16 (KL de 0,08802 por token), y documenta un ecosistema de evaluacion descentralizada (Bittensor) con metricas reproducibles de similitud distribucional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal y rotacion de Hadamard (familia Ternary Bonsai 2 de Prism ML), pesos ternarios |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria: PTQ1_0 a 1,75 bits por peso y PQ2_0 a 2,125 bits por peso (mismos codigos ternarios, distinto contenedor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); dos ficheros: `Ingot-XXI-27B-PTQ1_0.gguf` (5,95 GB) e `Ingot-XXI-27B-PQ2_0.gguf` (7,21 GB) |

## Arquitectura y entrenamiento

La arquitectura hereda la de Ternary Bonsai 2 27B de Prism ML: un transformer con atencion lineal y una rotacion de Hadamard aplicada en el pipeline de cuantizacion, que permite representar los pesos con codigos ternarios (valores en {-1, 0, +1}) y una escala fp16 por bloque de 128 pesos. El modelo base emplea un tokenizer y un layout de GGUF especificos de la familia, no compatibles con llama.cpp estandar.

El proceso de entrenamiento de esta variante concreta es un ajuste fino realizado por el minero de Ingot con hotkey `5DM8439Wgk6y2DSSzQv7FbR1Lf8piZTATdDrQbpQr4CoxF1h` (uid 211), a partir de la submission `2277d7b4-32e1-432e-bede-d2b164928baf`. Los codigos ternarios se mantienen fijos y se reajustan el resto de pesos para minimizar la divergencia respecto al profesor Qwen3.8-27B en BF16. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion tecnica documentada es el repack sin perdida entre los formatos PQ2_0 y PTQ1_0: cada bloque de 128 pesos conserva sus codigos y su escala fp16, de modo que ambos ficheros decodifican a los mismos valores.

## Capacidades

- Generacion de texto conversacional en un solo turno y multiturno, segun el pipeline declarado (`text-generation`, tag `conversational`).
- Razonamiento y generacion de codigo: no hay evaluacion publicada especifica; las capacidades se heredan del modelo profesor Qwen3.8-27B y del base Ternary Bonsai 2, sin verificar en esta ficha.
- Entrada de imagenes opcional: requiere anadir el proyector multimodal de Ternary Bonsai 2 27B (`Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o `-BF16.gguf`). El autor advierte que el proyector se creo para el modelo genesis y no para estos pesos, y que la calidad visual no esta probada.
- Decodificacion especulativa: compatible con el drafter DFlash 2 (`dendriteholdings/Ingot-27B-DFlash2`), que acelera la generacion aproximadamente 1,8x en modo greedy y 1,3-1,4x con sampling.
- Tool calling y function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).

## Casos de uso

- Investigacion en cuantizacion extrema: servir como referencia reproducible para estudiar como afecta una representacion ternaria de 1,75-2,125 bits por peso a la fidelidad distribucional frente a un profesor BF16, usando la metrica KL publicada (0,08802) como linea base.
- Evaluacion de pipelines de destilacion y ajuste fino sobre pesos cuantizados: el modelo permite comparar tecnicas de reajuste de escalas y pesos no ternarios manteniendo fijos los codigos, en un entorno controlado por el validador de Ingot.
- Despliegue en hardware con VRAM limitada: con 5,95-7,21 GB de pesos, cabe en GPUs de consumo de gama media-alta y en Mac con memoria unificada, lo que permite ejecutar un modelo de ~27 B en equipos donde un BF16 equivalente no cabria.
- Experimentacion con decodificacion especulativa: combinado con el drafter DFlash 2, sirve para medir ganancias de throughput en un modelo ternario con atencion lineal, un escenario poco cubierto por los drafters convencionales.
- Benchmarking de forks de llama.cpp: el modelo solo se ejecuta con el fork de DendriteLabs en el commit `c96baf4`, por lo que es util para validar parches de Metal y CUDA (fusion de la rotacion de Hadamard y de la actualizacion de estado de atencion lineal).
- Reproduccion de evaluaciones descentralizadas: permite replicar las metricas de Ingot (KL y distancia de estados ocultos) sobre una submission ganadora concreta, util para auditar el subnet o disenar validadores similares.
- Pruebas de concepto de entrada multimodal de bajo coste: anadiendo el proyector mmproj de Bonsai 2 se puede explorar vision en un modelo ternario, asumiendo que la calidad no esta garantizada.

## Benchmarks y rendimiento

Fidelidad frente al profesor BF16 (Qwen3.8-27B), por token de respuesta:

| Metrica | Este modelo (eval ganadora) | Rey anterior (misma eval) |
|---|---|---|
| KL(profesor ‖ modelo) | 0,08802 | 0,08959 |
| Distancia de estados ocultos (media cada 8 capas) | 0,3148 | 0,3158 |

Rendimiento de inferencia (llama-bench, batch 1, `-ngl 99 -fa 1`):

| Hardware | Fichero | Decode tok/s | Prompt tok/s |
|---|---|---|---|
| RTX PRO 6000 Blackwell (96 GB) | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell (96 GB) | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra (80-core GPU), fork PrismML stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra (80-core GPU), fork PrismML stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra (80-core GPU), fork Dendrite con parche Metal | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra (80-core GPU), fork Dendrite con parche Metal | PTQ1_0 | 52,8 | 368 |

Dato adicional del autor: PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; no se han medido otras tarjetas. No hay resultados publicados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXI-27B-Q2 | ~26,9 B | no disponible | Ternaria 1,75 / 2,125 bpw | no disponible | GGUF, requiere fork de llama.cpp |
| prism-ml/Ternary-Bonsai-2-27B-gguf (base) | ~27 B | no disponible | Ternaria (PQ2_0, PTQ1_0) | no disponible | GGUF, fork de PrismML |
| Qwen3.8-27B (profesor) | ~27 B | no disponible | BF16 y otras | no disponible | no disponible en la informacion proporcionada |
| dendriteholdings/Ingot-genesis-27B-Q2 | ~27 B | no disponible | Ternaria 2 bits | no disponible | GGUF, mismo fork |

La comparacion se limita a la familia Ingot y su base, ya que no se dispone de datos de benchmarks de capacidad ni de contexto para contrastar con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- No se ejecuta con llama.cpp estandar: requiere el fork de DendriteLabs de llama.cpp en el commit `c96baf4`, lo que complica el despliegue en produccion y la integracion con herramientas estandar (vLLM, TGI, Ollama no estan soportados segun la informacion disponible).
- Licencia no declarada: no hay garantia explicita de uso comercial; debe verificarse la licencia del modelo base (Ternary Bonsai 2 de Prism ML) antes de cualquier uso en produccion.
- Idiomas no declarados: no se puede asumir cobertura multilingue ni calidad uniforme entre idiomas.
- Longitud de contexto no documentada: limita la planificacion de casos de uso con documentos largos o conversaciones extensas.
- Riesgo de alucinacion inherente a la cuantizacion ternaria: la KL de 0,08802 por token frente al profesor implica una divergencia medible en la distribucion de siguiente token, que puede acumularse en generaciones largas.
- Vision no validada: el proyector mmproj procede del modelo genesis y no fue entrenado para estos pesos; la calidad de imagen es desconocida.
- Sin benchmarks de capacidad publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede caracterizar su rendimiento en tareas concretas mas alla de la fidelidad al profesor.
- Procedencia y trazabilidad: es un artefacto de una competicion descentralizada; la calidad depende de la submission del minero y no de un proceso de publicacion editorial.
- Rendimiento en Mac modesto: 43-56 tok/s de decodificacion en un M3 Ultra, muy por debajo de los 137-145 tok/s en RTX PRO 6000 Blackwell.
- El drafter DFlash 2 anade unos 6 GB de VRAM adicionales, lo que puede invalidar despliegues ajustados en GPUs de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-XXI-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector multimodal Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector multimodal BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Modelo genesis de referencia: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
- Commit de evaluacion: https://github.com/DendriteLabs/llama.cpp/commit/c96baf4abe24d11a50f326e40b6223b687449d63
