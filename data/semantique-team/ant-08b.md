# semantique-team/ant-08b

## Resumen

ANT-08B es un modelo de decisión de tipo "System 1" desarrollado por Semantique Team. No es un modelo generativo: recibe un estado (`state`), una pregunta (`question`) y una lista de candidatos, y devuelve una distribución de probabilidad calibrada sobre esos candidatos junto con un veredicto de ejecutar o escalar. La arquitectura consiste en una cabeza de decisión de 1.053.696 parámetros entrenables (4,2 MB) montada sobre el backbone congelado Qwen3.5-0.8B, que se utiliza como codificador sin la cabeza de lenguaje.

El modelo resuelve el problema del enrutamiento y la selección entre opciones cerradas con una política de escalado calibrada: en lugar de generar texto libre, puntúa candidatos y cede la decisión a un humano o a otro sistema cuando la confianza es insuficiente. Es relevante para despliegues en el borde y entornos local-first, dado que el backbone de 753 millones de parámetros puede cuantizarse a 8 bits y ejecutarse en hardware de consumo.

El repositorio contiene únicamente la cabeza entrenada; el backbone se descarga desde el Hub de Hugging Face. El modelo está marcado explícitamente como trabajo en curso por sus autores, con benchmarks y guía de producción todavía en finalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de decisión (dos codificadores con proyecciones, input norms y temperatura) sobre backbone Qwen3.5-0.8B congelado, usado como encoder sin LM head |
| Parametros totales | 1.053.696 entrenables en la cabeza; backbone de 753 M congelado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Backbone en 8 bits vía MLX (bits=8, group_size=64); cuantización Metal 8-bit desaconsejada para esta familia de arquitecturas |
| Idiomas soportados | Inglés (en), italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | `ant_head.pt`, `calibrator.pt`, `escalation.json`, `config.json` (PyTorch); backbone en safetensors y MLX |

## Arquitectura y entrenamiento

La arquitectura emplea dos codificadores que comparten un único decodificador Qwen3.5 congelado, cargado mediante `AutoModel` sin la cabeza de lenguaje. El `ContextEncoder` produce `z_context` a partir de estado y pregunta, y el `CandidateEncoder` produce `z_candidate_i` para cada candidato. Una función de scoring calcula `s_i = f(z_context, z_candidate_i)`, sobre la que se aplica un softmax con temperatura para obtener `P(candidate_i | state, question)`. Los únicos parámetros entrenados son las dos proyecciones, las input norms y la temperatura.

El diseño es invariante a permutaciones (reordenar candidatos no altera las probabilidades), admite un número variable de candidatos (de 2 a más de 100) y permite cachear los embeddings de conjuntos de candidatos estáticos. El entrenamiento se realizó durante 3 épocas, con batch size 8, learning rate 2e-4 y semilla 7, sobre una Kaggle T4, empleando el mismo dataset y receta que `semantique-team/ant-4b`, lo que permite comparar backbones de forma aislada. La política de escalado se ajusta sobre datos de validación con un riesgo objetivo de 0,10.

## Capacidades

- Puntuación y ranking de candidatos con probabilidad calibrada sobre conjuntos de tamaño variable (2 a 100+).
- Veredicto binario de ejecutar o escalar basado en métricas de confianza y umbral calibrado.
- Clasificación de texto orientada a decisión (pipeline `text-ranking`), sin generación de texto.
- Invariancia a permutaciones en el orden de los candidatos.
- Cacheado de embeddings de candidatos estáticos para reducir el coste de consultas repetidas.
- Soporte de dos idiomas: inglés e italiano.
- Ejecución en el borde y en local-first, con backend MLX en Apple Silicon o PyTorch.
- No soporta tool calling, agentes multi-paso ni modos de razonamiento extendido; su función es la decisión puntual.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe la descripción del caso y la lista de departamentos, y devuelve la probabilidad de cada uno junto con un veredicto de escalado si la confianza es baja. El ejemplo de la model card muestra `Billing` con 0,99 y veredicto `execute`.
- Triaje de incidencias con derivación a humano: la política de escalado, ajustada a un riesgo del 10 %, cubre el 44,2 % de decisiones con un 9,9 % de riesgo, lo que permite automatizar solo los casos claros.
- Selección entre respuestas de un sistema generativo: dado un estado y varias respuestas candidatas, el modelo las puntúa y elige la más probable, actuando como verificador ligero en pipelines RAG.
- Ranking de currículums o candidaturas: con hasta 60 o más candidatos por consulta y embeddings cacheables, permite ordenar perfiles frente a una descripción de puesto.
- Clasificación de intenciones en asistentes conversacionales: con un conjunto fijo de intenciones embebido una vez, cada turno solo requiere codificar el contexto, reduciendo la latencia.
- Moderación o etiquetado con abstención: el veredicto de escalado permite marcar casos ambiguos para revisión humana en lugar de forzar una etiqueta.
- Despliegue en el borde: con el backbone cuantizado a 8 bits en MLX, puede ejecutarse en portátiles con Apple Silicon para decisiones locales sin conexión.

## Benchmarks y rendimiento

| Split | n | Accuracy | ECE |
|---|---|---|---|
| Test (situaciones held-out, 24 casos de uso) | 648 | 0,674 | 0,061 |
| OOD (casos de uso held-out, 5 no vistos) | 456 | 0,570 | 0,220 |

Mejor accuracy de validación durante el entrenamiento: 0,757 (época 3). La política de escalado, con umbral de confianza 0,802, cubre el 44,2 % de las decisiones con un 9,9 % de riesgo, y las decisiones tomadas son correctas en el 90,1 % de los casos (n = 688).

## Requisitos de hardware

- VRAM estimada: el backbone de 753 M en fp16 requiere aproximadamente 1,5 GB; en 8 bits MLX, alrededor de 0,8 GB. La cabeza añade solo 4,2 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para el backbone en fp16; una T4 fue suficiente para el entrenamiento de la cabeza.
- Cabe en GPU de consumo: sí, incluidas RTX 3060 y superiores, y en Apple Silicon con backend MLX.
- Opciones de despliegue: PyTorch con `ANTPredictor` (runtime instalado desde GitHub, no disponible en PyPI), backend MLX para Apple Silicon con `mlx-community/Qwen3.5-0.8B-MLX-8bit`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que el backend MLX es más rápido en Apple Silicon y que el cacheado de candidatos reduce el coste de consultas repetidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ANT-08B | 1,05 M entrenables + 753 M congelados | No disponible | 0,674 | Apache-2.0 | Hugging Face (cabeza) + backbone Qwen3.5-0.8B |
| semantique-team/ant-4b | No disponible | No disponible | No disponible en esta ficha | No disponible | Hugging Face |
| Qwen3.5-0.8B (base) | 753 M | No disponible | No aplica (generativo) | Apache-2.0 | Hugging Face |

La comparación directa con ANT-4B es la más relevante, ya que comparte dataset y receta de entrenamiento, por lo que las diferencias reflejan el backbone y no el proceso de entrenamiento. Los resultados de ANT-4B no se detallan en la información disponible.

## Limitaciones y advertencias

- Estado de trabajo en curso: los autores advierten que el formato del checkpoint y la API son usables, pero los benchmarks y la guía de producción están sin finalizar.
- Caída de rendimiento fuera de distribución: la accuracy OOD cae a 0,570 y la ECE sube a 0,220, frente a 0,674 y 0,061 en test, lo que indica una calibración deficiente ante casos de uso no vistos.
- Cobertura limitada: la política de escalado solo automatiza el 44,2 % de las decisiones al riesgo objetivo del 10 %, por lo que más de la mitad de los casos requieren derivación.
- Idiomas restringidos a inglés e italiano; no se documenta soporte de castellano.
- No genera texto ni soporta tool calling, agentes multi-paso o razonamiento extendido; su uso está acotado a selección entre candidatos.
- La cuantización Metal 8-bit está desactivada para esta familia de arquitecturas: en ANT-4B produjo estados ocultos a cero en fp16, NaN en bf16 y una caída de accuracy de 0,725 a 0,325.
- En el backend MLX debe pasarse `device="cpu"`; con `device="mps"` la primera `layer_norm` falla por mezcla de tensores CPU y MPS.
- El runtime no está en PyPI y debe instalarse desde GitHub, lo que añade fricción para producción.
- Licencia Apache-2.0 en la cabeza y en el backbone, sin restricciones comerciales documentadas; aun así, la falta de benchmarks finalizados desaconseja su uso en producción sin validación propia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/semantique-team/ant-08b
- Backbone: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo comparable ANT-4B: https://huggingface.co/semantique-team/ant-4b
- Backbone MLX 8-bit: https://huggingface.co/mlx-community/Qwen3.5-0.8B-MLX-8bit
- Repositorio del runtime: https://github.com/semantique-team/ant-08b
- Organización en GitHub: https://github.com/semantique-team
