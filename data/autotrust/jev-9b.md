# autotrust/JEV-9B

## Resumen

autotrust/JEV-9B es un modelo abierto de pesos desarrollado por AutoTrust AI que integra dos modos de razonamiento en un unico conjunto de pesos: un "System 1" que responde decisiones tipadas (noul si/no, choice sobre 2 a 16 opciones y score en escala 0-5) en una sola pasada hacia delante devolviendo una distribucion de probabilidad calibrada, y un "System 2" que realiza generacion de texto y razonamiento paso a paso. El modelo parte de Qwen/Qwen3.5-9B y se construye con la receta Blocks of Experts (BoE), en la que el bloque System 2 permanece congelado y bit-identico al modelo base, mientras que el bloque System 1 anade 40,2 M de parametros entrenados (0,5 % del backbone).

El problema que resuelve es doble: por un lado, ofrece decisiones calibradas indistinguibles de las de la API cerrada TypeSafe Jev 1.13 (KL media ≈ 0,019-0,021 sobre 25.376 preguntas retenidas de 53 dominios); por otro, mantiene intacta la capacidad generativa del backbone, de modo que HumanEval se mantiene en 70,7 % antes y despues de anadir System 1, con las 164 completaciones byte-identicas. El modelo tiene 8.953.803.264 parametros totales, un repositorio de 18,3 GB y licencia Apache-2.0.

Es relevante ahora porque es el primer modelo abierto de la familia AutoTrust que sirve ambos modos desde un mismo motor (vLLM) y se enruta por peticion, con una latencia mediana de decision de ≈ 90 ms en una B200, frente a los 238-301 ms medidos en la API hospedada. Su sucesor, autotrust/JEV-27B, es mas preciso y transfiere mejor a tareas no vistas, pero JEV-9B es 2,6 veces mas rapido y sus pesos ocupan un tercio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-9B) con receta Blocks of Experts (BoE) y cabecera dual |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No es MoE clasico; bloque System 1 de 40,2 M parametros entrenados (0,5 % del backbone) que se anade al bloque System 2 congelado |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuido esta en safetensors; se menciona LoRA en las etiquetas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue la receta Blocks of Experts (BoE) de AutoTrust: en lugar de ajustar un modelo monolitico, se conserva un modelo preentrenado fuerte como bloque experto congelado y se le anade un bloque experto pequeno y desconectable entrenado para una capacidad concreta. En JEV-9B el bloque System 2 es Qwen3.5-9B, bit-identico a la version publicada, y el bloque System 1 es un componente de 40,2 M de parametros entrenados que se ejecuta sobre el mismo backbone. El sistema expone una "cabecera dual" que permite atender tanto decisiones tipadas como generacion de texto segun la peticion, enrutando por solicitud dentro del mismo motor.

El entrenamiento del bloque System 1 se realizo por destilacion de conocimiento a partir de las distribuciones de salida publicadas de TypeSafe Jev 1.13, usando el corpus Apache-2.0 SargeDev/jev-distill-corpus-v3. El autor indica que el bloque se entreno en aproximadamente 3 horas sobre una unica GPU B200. La innovacion tecnica destacable es que, al mantener los bloques separados, anadir System 1 no degrada System 2: HumanEval se mantiene en 70,7 % antes y despues, mientras que plegar el mismo bloque dentro del backbone habria costado 9 puntos (61,6 %). La destilacion reproduce fielmente el comportamiento del profesor, incluidas sus decisiones tipadas y, segun el autor, tambien sus errores.

## Capacidades

- Decisiones tipadas en una sola pasada: "noul" (si/no), "choice" (entre 2 y 16 opciones) y "score" (escala 0-5).
- Devuelve distribuciones de probabilidad calibradas (ECE de 0,0007 tras aplicar temperatura, en 15 bins).
- Generacion de texto y razonamiento paso a paso (modo thinking) mediante el bloque System 2.
- Generacion de codigo: 70,7 % de pass@1 en HumanEval con el camino System 2 (lm_head base, adaptador desactivado).
- Enrutado por peticion entre System 1 y System 2 en el mismo motor de inferencia (vLLM).
- Capacidades multilingues: solo ingles ("en" declarado).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o multimodalidad: no disponibles en la informacion proporcionada.

## Casos de uso

- Triaje y enrutamiento de decisiones automatizado: con System 1 el modelo resuelve preguntas de si/no o de eleccion entre opciones en unos 90 ms por decision en una B200, lo que permite clasificar grandes volumenes de casos (tickets, solicitudes, incidencias) en tiempo casi real.
- Moderacion y verificacion con umbral de confianza: al devolver probabilidades calibradas (ECE 0,0007), es adecuado para reglas de negocio que exigen un umbral de certeza y derivar los casos dudosos a revision humana.
- Puntuacion automatica en escala: la salida "score" (0-5) con un MAE de 0,103 respecto al valor esperado del profesor permite usarlo como anotador de calidad, relevancia o riesgo en pipelines de etiquetado.
- Sustitucion local de la API cerrada TypeSafe Jev 1.13: su KL media frente a las distribuciones del profesor (≈ 0,019-0,021) hace que las decisiones sean practicamente indistinguibles, y una sola GPU sostiene unas 15 veces mas decisiones por segundo que las medidas contra la API hospedada.
- Generacion de codigo en produccion: el camino System 2 mantiene el rendimiento del backbone (HumanEval 70,7 %), por lo que puede integrarse en asistentes de codigo o generacion de tests sin renunciar al modo de decisiones.
- Agentes con razonamiento multi-paso: el modo thinking del bloque System 2 permite cadenas de razonamiento paso a paso para tareas que requieren deliberacion, reutilizando la misma instancia de vLLM que atiende las decisiones rapidas.
- Investigacion en calibracion y destilacion: al publicar metricas a nivel de distribucion (KL, AUROC, Brier, ECE) sobre un corpus de destilacion publico, sirve como referencia reproducible para estudiar fidelidad de estudiantes frente a un profesor cerrado.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente en la informacion disponible):

| Evaluacion | Metrica | Valor |
|---|---|---|
| Decisiones tipadas (noul / choice / score) frente al profesor TypeSafe Jev 1.13 | KL media (todas las filas de test; 25.376 de 29.955 objetivos son distribuciones de Jev 1.13) | 0,021 (model-index); ≈ 0,019 en el texto de la model card |
| Decisiones tipadas | AUROC de noul | 0,996 |
| Decisiones tipadas | Brier de noul (frente a la probabilidad objetivo, todas las filas) | 0,0015 |
| Decisiones tipadas | MAE del valor esperado de score (escala 0-5) | 0,103 |
| Decisiones tipadas | ECE (15 bins, tras temperatura) | 0,0007 |
| Decisiones tipadas | Acierto top-1 en choice (todas las filas) | 0,898 |
| Decisiones tipadas | Acierto top-1 en choice (filas con objetivo decisivo, gap top-2 ≥ 0,1) | 0,954 |
| HumanEval (camino System 2, lm_head base, adaptador desactivado) | pass@1 (greedy, prompt estilo completacion) | 0,707 |

Nota: el model-index declara una KL media de 0,021 para todas las filas de test, mientras que el texto de la model card cita ≈ 0,019 para las 25.376 preguntas retenidas de Jev 1.13; la ficha reproduce ambos valores tal como aparecen.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: los 8,95 B de parametros ocupan aproximadamente 17,9 GB solo en pesos, por lo que se recomienda disponer de al menos 20-24 GB de VRAM contando cache de KV y overhead.
- GPU recomendadas: el autor reporta latencias medidas sobre una B200. Por tamano, son adecuadas tambien A100 (40/80 GB), H100 y GPUs con 24 GB o mas.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en fp16 ajustado; en GPUs con menos VRAM requeriria cuantizacion, formato que no esta confirmado en la informacion disponible.
- Opciones de despliegue: vLLM (etiqueta explicita y motor mencionado por el autor) y la libreria transformers. Otros runners como llama.cpp, Ollama o TGI no se confirman en la informacion disponible.
- Latencia y throughput: decision unica con mediana de ≈ 90 ms en una B200, frente a 238-301 ms medidos de forma independiente contra la API hospedada TypeSafe Jev 1.13; una sola GPU sostiene aproximadamente 15 veces las decisiones por segundo de ese benchmark independiente. JEV-9B es 2,6 veces mas rapido que JEV-27B en el mismo benchmark.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano de pesos | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| autotrust/JEV-9B | 8,95 B | 18 GB | no disponible | HumanEval 70,7 %; KL ≈ 0,019-0,021 | apache-2.0 | Pesos abiertos en HuggingFace |
| autotrust/JEV-27B | no disponible (el nombre sugiere ~27 B) | 54 GB | no disponible | HumanEval 78,0 %; KL ≈ 0,017; KL en familias de tareas no vistas 0,104; 96 % de acierto del profesor en benchmark independiente de 16 opciones | no disponible en la informacion | Pesos abiertos en HuggingFace |
| Qwen/Qwen3.5-9B (modelo base) | 9 B (base de JEV-9B) | no disponible | no disponible | Backbone System 2 de JEV-9B, bit-identico | no disponible en la informacion | Pesos abiertos |
| TypeSafe Jev 1.13 (profesor, cerrado) | no disponible | no disponible | no disponible | Referencia de destilacion; latencia de API 238-301 ms por decision | cerrado | Solo API hospedada |

Observacion: JEV-27B baja la KL media frente a Jev de ≈ 0,019 a ≈ 0,017, reduce a menos de la mitad la KL en familias de tareas no vistas (0,234 → 0,104) y pasa de 70,7 % a 78,0 % en HumanEval, a costa de ser 2,6 veces mas lento y de triplicar el tamano de pesos.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles ("en"); no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Longitud de contexto: no disponible en la informacion proporcionada, por lo que no puede validarse su comportamiento en conversaciones o documentos largos.
- Fidelidad al profesor: el modelo destila las salidas de TypeSafe Jev 1.13 e, segun el autor, reproduce tambien sus errores; hereda por tanto los sesgos y fallos del profesor cerrado.
- Calibracion dependiente de temperatura: la ECE de 0,0007 se reporta tras aplicar temperatura; sin ese ajuste la calibracion podria variar.
- Metricas no verificadas: todos los valores de benchmark son declarados por el autor (campo "verified": false) y no han sido confirmados de forma independiente en la informacion disponible.
- Generacion de codigo y de texto: el rendimiento generativo (HumanEval 70,7 %) es el del backbone Qwen3.5-9B, no una mejora propia de JEV-9B, y esta sujeto a las alucinaciones habituales de los modelos de 9 B.
- Uso comercial: la licencia es Apache-2.0, lo que en principio permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y del corpus de destilacion.
- Soporte de herramientas: no se confirma tool calling ni function calling, lo que limita su uso en agentes que dependan de invocacion de funciones.
- Comparaciones de velocidad: las cifras de latencia y throughput se basan en mediciones propias del autor frente a benchmarks independientes de la API, no en un mismo entorno controlado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/autotrust/JEV-9B
- Modelo sucesor: https://huggingface.co/autotrust/JEV-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Corpus de destilacion: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Benchmark HumanEval: https://huggingface.co/datasets/openai/openai_humaneval

Nota: no se han encontrado en la informacion proporcionada enlaces a papers, blogs o repositorios adicionales, ni una URL publica para el profesor cerrado TypeSafe Jev 1.13.
