# flavianv/qwen3-4b-musical-instruments-id-overlap-ranker-final-20260923

## Resumen

Este repositorio publica una cabeza de ranking (head-only ranker) construida sobre el backbone congelado Qwen3-4B, concretamente sobre el checkpoint de ajuste supervisado completo flavianv/qwen3-4b-musical-instruments-full-sft-shared-20260923. No es un modelo completo ni un adaptador LoRA: el artefacto publicado son únicamente 2.560 pesos escalares de puntuación que se aplican sobre el backbone congelado. El ancestro original es Qwen/Qwen3-4B de Alibaba.

El modelo resuelve una tarea concreta de ranking de bundles de productos de instrumentos musicales: dada una consulta de compra (por ejemplo, "I need a microphone and stand"), debe ordenar candidatos formados por títulos de producto, puntuando el bundle que satisface la petición por encima de alternativas con solapamiento de identificadores. La entrada son solo cadenas de consulta y títulos de producto, serializadas en formato system/user/assistant con la etiqueta {"products": [...]}, con el modo thinking desactivado y un límite de 2048 tokens impuesto. No recibe IDs, categorías ni roles.

Es relevante como ejemplo de reward model/ranker especializado en recomendación, con una validación estricta documentada y checkpoints intermedios preservados. El checkpoint publicado (paso 2816, época 2.0) obtiene 210/300 (70%) en el conjunto de validación estricta, ligeramente por debajo del mejor checkpoint seleccionado por validación (paso 1760, 211/300, 70,33%), que se conserva en un repositorio aparte. El repositorio no incluye pesos duplicados del backbone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de ranking (2.560 pesos escalares) sobre backbone congelado Qwen3-4B (transformer decodificador denso) |
| Parametros totales | Cabeza: 2.560 pesos escalares. Backbone: Qwen3-4B (4B, congelado, en repositorio aparte). Tamano del repo publicado: 0,0 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Limite de 2048 tokens impuesto en la entrada del ranker. Contexto nativo del backbone: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (solo se menciona BF16 en el forward y FP32 en la cabeza durante el entrenamiento) |
| Idiomas soportados | No disponible. Los ejemplos y datos de entrenamiento estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | Pesos PyTorch de la cabeza (score.weight). El backbone se descarga desde un repositorio fijado con verificacion SHA256 de la cabeza |

## Arquitectura y entrenamiento

El modelo es una cabeza de puntuacion lineal sobre un backbone transformer denso Qwen3-4B congelado. La cabeza contiene 2.560 pesos escalares entrenados desde cero; tanto el backbone antiguo como el nuevo permanecen congelados. La serializacion de entrada usa el tokenizador fijado del backbone, con el modo thinking desactivado, y la salida es una puntuacion cruda sin restriccion de rango. La transformacion sigmoid(raw/3) se describe como una recompensa historica opcional y no como una probabilidad calibrada.

El entrenamiento empleo 7.000 grupos de consultas con dos ordenaciones positivas sembradas cada uno (14.000 filas positivas) y 22.513 negativos unicos generados por SFT. De los 22.514 negativos crudos, uno se puso en cuarentena porque IDs distintos producian la misma consulta/titulos que un positivo. 177 consultas sin negativos no aportan pares, mientras que 6.823 consultas aportan 22.513 comparaciones tipo Bradley-Terry, una por negativo, alternando ordenaciones positivas muestreadas. Los negativos debian ser bundles con IDs unicos y cero o una coincidencia de ID de referencia; los casos con dos o mas coincidencias se excluyeron, no se consideraron positivos plenos. No hubo replicacion de negativos. Se uso AdamW con LR 1e-4, 16 pares efectivos por actualizacion, 3% de warmup con decaimiento coseno, clip 1, semilla 42, forward en BF16 y cabeza en FP32. Se realizaron dos epocas/2.816 actualizaciones con los ocho checkpoints trimestrales preservados; este repositorio publica la cabeza final de la epoca 2.0, no la cabeza de la epoca 1.25 seleccionada por validacion. No se ejecuto GRPO para esta publicacion.

## Capacidades

- Puntuacion y ranking de bundles de productos: asigna una puntuacion escalar cruda a listas de titulos de producto dada una consulta de compra.
- Ranking conditional (condicional): ordena candidatos comparando bundles, en lugar de generar texto.
- Discriminacion por solapamiento de identificadores: distingue bundles validos (cero o una coincidencia de ID de referencia) de los que exceden ese criterio en los pools construidos.
- Entrada exclusiva de consulta y titulos: no acepta IDs, categorias ni roles como input, lo que limita el uso a texto de titulos.
- Cumplimiento de un limite estricto de 2048 tokens en la entrada.
- No es un modelo generativo: no produce texto, codigo ni respuestas; su unica salida es una puntuacion.
- Soporte de tool calling: no disponible / no aplica.
- Soporte de agentes y razonamiento multi-paso: no disponible / no aplica.
- Capacidades multilingues: no disponible.

## Casos de uso

- Reordenacion de resultados en un buscador de instrumentos musicales: dado un catalogo de productos, el ranker puntua bundles candidatos (por ejemplo, microfono + soporte) y coloca arriba el que satisface la intencion de compra expresada en la consulta.
- Validacion de sistemas de recomendacion: sirve como componente de reward/ranking para evaluar o filtrar combinaciones de productos sugeridas por un sistema de recomendacion antes de mostrarlas al usuario.
- Filtrado de bundles con identificadores solapados: en pipelines de catalogo, detecta candidatos que reutilizan el mismo ID de referencia y los penaliza frente a alternativas con IDs unicos.
- Evaluacion offline de politicas de recomendacion: al ser un ranker condicional, permite comparar politicas midiendo la accuracy top-1 del bundle verdadero frente a negativos frescos, con pools de candidatos fijos.
- Anotacion asistida de datos de entrenamiento: puede priorizar pares positivos/negativos dudosos para revision humana, dado que conserva todos los labels y procedencias crudos.
- Investigacion en reward models especializados: sirve como referencia reproducible para estudiar el efecto del orden de los positivos, ya que documenta la sensibilidad de la puntuacion al reordenar las permutaciones positivas.
- Prototipado de cabezas de ranking ligeras: al ser head-only con backbone congelado, permite iterar sobre la cabeza sin reentrenar el backbone, reduciendo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos resultados cuantitativos son de validacion estricta (ranking condicional, no generacion): accuracy top-1 del bundle verdadero sobre 300 consultas con 1 referencia verdadera y 3 negativos validos, evaluados sobre el mismo pool barajado de 1.200 candidatos.

| Checkpoint | Accuracy top-1 (300 consultas) | Porcentaje |
|---|---|---|
| Inicial (sin entrenar) | 77/300 | 25,67% |
| Cabeza antigua (previa) | 184/300 | 61,33% |
| Seleccionada (paso 1760, epoca 1.25) | 211/300 | 70,33% |
| Final (paso 2816, epoca 2.0; este repo) | 210/300 | 70,00% |

Notas sobre la validacion: los empates los rompe el checkpoint mas temprano; la accuracy por pares se mide por separado; el conjunto reservado de 275 ejemplos de test no se toco; la cohorte de validacion tiene exposicion previa a la validacion del SFT, por lo que no es un test end-to-end intacto. La comparacion previa del 66% frente al 67% usaba una cohorte expuesta y quedo superada.

Sensibilidad al orden sobre las mismas 300 consultas y dos permutaciones positivas fijas: la brecha cruda media pasa de 1,1426 a 0,7657; la media normalizada por desviacion tipica pasa de 0,3699 a 0,3220 (aproximadamente un 13% inferior); la brecha es menor en el 55% de las consultas. La escala cruda difiere y la consistencia no es calidad; no se trata de prueba causal del beneficio de la aumentacion.

## Requisitos de hardware

- Requiere CUDA: el cargador Ranker() esta descrito como CUDA y descarga el backbone fijado y la cabeza verificada por checksum.
- VRAM estimada para inferencia: al operar sobre un backbone Qwen3-4B con forward en BF16, se necesitan aproximadamente 8-10 GB de VRAM (estimacion orientativa, no confirmada en la informacion disponible). La cabeza de 2.560 pesos anade un consumo insignificante.
- GPU recomendadas: no especificadas por el autor. Por tamano del backbone, un modelo de 4B en BF16 cabe en RTX 3090/4090 (24 GB), RTX 4080 (16 GB) y A100/H100. Cabe en GPU de consumo con 12 GB o mas segun cuantizacion, aunque no se documenta soporte de cuantizacion.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. El despliegue se realiza mediante el script ranker.py y requirements.txt incluidos en el repositorio, que fijan la revision del backbone y verifican el SHA256 de la cabeza.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. Se comparan a continuacion los artefactos relacionados citados en la propia model card.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repo (paso 2816, cabeza final) | Cabeza de ranking sobre Qwen3-4B | 2.560 pesos de cabeza + backbone 4B | 2048 tokens (entrada) | 210/300 (70%) validacion estricta | apache-2.0 | Publico en HF |
| Checkpoint 1760 (mejor por validacion) | Cabeza de ranking sobre Qwen3-4B | 2.560 pesos de cabeza + backbone 4B | 2048 tokens (entrada) | 211/300 (70,33%) validacion estricta | apache-2.0 | Publico en HF (repo aparte) |
| Backbone full SFT (flavianv/...-full-sft-shared-20260923) | Backbone ajustado por SFT | Qwen3-4B (4B) | No disponible | No disponible | apache-2.0 | Publico en HF |
| Qwen/Qwen3-4B (ancestro) | LLM denso generativo | 4B | No disponible en la informacion | No disponible | No disponible en la informacion | Publico en HF |

## Limitaciones y advertencias

- La puntuacion cruda no esta calibrada: la transformacion sigmoid(raw/3) es una recompensa historica opcional, no una probabilidad calibrada; se requieren comprobaciones de validez externa.
- La entrada son solo titulos, por lo que no puede distinguir todos los alias de identificadores; existe una contradiccion retenida que demuestra esta limitacion.
- La validacion estricta mide ranking condicional, no rendimiento de generacion.
- La cohorte de validacion tiene exposicion previa a la validacion del SFT, por lo que no constituye un test end-to-end intacto; el conjunto reservado de 275 ejemplos no se toco.
- Sensibilidad al orden de los positivos documentada: la brecha y su version normalizada cambian al reordenar las permutaciones positivas (media normalizada aproximadamente un 13% inferior). La consistencia no implica calidad.
- No es un modelo generativo ni un LLM de proposito general: no produce texto ni responde a prompts; su unica salida es una puntuacion de ranking.
- Licencia apache-2.0, que permite uso comercial, pero hereda las condiciones del backbone base (Qwen3-4B) y del backbone SFT intermedio.
- No se incluyen optimizador, credenciales ni registros privados; no se ejecuto GRPO para esta publicacion.
- Repositorio con 0 descargas y 0 likes, sin senales de adopcion ni mantenimiento por parte de la comunidad.
- Capacidades multilingues y sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/flavianv/qwen3-4b-musical-instruments-id-overlap-ranker-final-20260923
- Checkpoint 1760 (mejor por validacion): https://huggingface.co/flavianv/qwen3-4b-musical-instruments-id-overlap-ranker-20260923
- Backbone full SFT: https://huggingface.co/flavianv/qwen3-4b-musical-instruments-full-sft-shared-20260923
- Revision fijada del backbone: https://huggingface.co/flavianv/qwen3-4b-musical-instruments-full-sft-shared-20260923/tree/1d6b019dfaaf368fe8af2ab593d66a3ee1c215a6
- Datos publicos y validacion estricta: https://huggingface.co/datasets/flavianv/musical-instruments-id-overlap-reward-20260923-v1/tree/3b13de27a5e3f31c20742a36b1880c966f325308/strict_validation_v3
- Informe y graficas: https://github.com/clijo/reco-rl/tree/cfb7e75/docs/experiments/id_overlap_ranker_20260923
- Informe en PDF: https://github.com/clijo/reco-rl/blob/cfb7e75/docs/experiments/id_overlap_ranker_20260923/musical_id_overlap_ranker_strict_20260923_v2.pdf
- Modelo ancestro Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Coleccion Qwen3: https://huggingface.co/collections/Qwen/qwen3
