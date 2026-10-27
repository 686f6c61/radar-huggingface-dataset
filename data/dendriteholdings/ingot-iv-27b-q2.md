# dendriteholdings/Ingot-IV-27B-Q2

## Resumen

Ingot-IV-27B-Q2 es una cuantización ternaria del modelo Qwen/Qwen3.8-27B, publicada por dendriteholdings como espejo público del modelo ganador de Ingot, un subnet de Bittensor en el que los mineros compiten por producir la cuantización que más se aproxima al modelo profesor original. No es, por tanto, un modelo entrenado desde cero: los pesos son la subida del minero `5DhDh9NnY2pY5Ko89JaSUehSYC4qpoZbdKcP3gcTrQmMU2N9` (uid 26), byte a byte, y el valor del artefacto está en la fidelidad de la compresión, no en capacidades nuevas.

El resultado son dos ficheros GGUF que contienen los mismos pesos ternarios: `Ingot-IV-27B-PTQ1_0.gguf` a 1,75 bits por peso (5,95 GB) y `Ingot-IV-27B-PQ2_0.gguf` a 2,125 bits por peso en un contenedor de 2 bits (7,21 GB). El modelo declara 26.895.998.464 parámetros (~26,9 mil millones) y licencia Apache 2.0. Su relevancia práctica es doble: por un lado demuestra cuánta capacidad de un modelo de ~27B sobrevive a una compresión de 1,75-2,125 bpw; por otro, es un caso poco habitual de evaluación pública de cuantizaciones contra el profesor BF16 con métricas de divergencia (KL y distancia de estados ocultos), no solo con benchmarks de tarea.

La contrapartida es que el fichero no funciona con llama.cpp estándar: requiere el fork de PrismML en un commit concreto, y la entrada de imágenes depende de un proyector de visión ajeno, entrenado para los pesos de otro modelo (genesis) y sin evaluar. La información disponible no documenta longitud de contexto, idiomas soportados ni detalles del dataset de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer heredada de Qwen/Qwen3.8-27B (detalle interno no disponible); pesos ternarios con rotación de Hadamard y escala fp16 por bloque de 128 pesos |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica (la informacion disponible no indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria en dos formatos: PTQ1_0 a 1,75 bits por peso (5,95 GB) y PQ2_0 a 2,125 bits por peso (7,21 GB); ambos contienen los mismos pesos ternarios |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B es multilingue, pero no se documenta el conjunto de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Ingot-IV-27B-PTQ1_0.gguf`, `Ingot-IV-27B-PQ2_0.gguf`); tamano del repo 13,2 GB |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento (PTQ) de Qwen/Qwen3.8-27B, no un entrenamiento. La receta es ternaria: cada bloque de 128 pesos conserva sus codigos ternarios y una escala fp16, de modo que cada peso decodifica a uno de tres valores posibles escalados. El GGUF mantiene el layout, el tokenizer y la rotacion de Hadamard de `dendriteholdings/Ingot-genesis-27B-Q2`, que es la cuantizacion ternaria de referencia del mismo profesor producida por Prism y punto de partida de la ronda; aqui solo cambian los pesos, aportados por el minero ganador. El fichero PTQ1_0 es un reempaquetado sin perdida del fichero original del minero (PQ2_0) al formato PTQ1_0 de Prism: el autor afirma que el mismo reempaquetado del fichero PQ2_0 de Bonsai 2 reproduce byte a byte el PTQ1_0 publicado por Prism.

No hay informacion disponible sobre tokens de entrenamiento, composicion del dataset, RLHF/DPO ni innovaciones de decodificacion: al ser una cuantizacion, esas propiedades se heredan del profesor y no se reentrenan. La unica innovacion tecnica documentada es el esquema de compresion (ternario con escala por bloque y rotacion de Hadamard para redistribuir la energia de los pesos antes de cuantizar) y el reempaquetado sin perdida entre contenedores de 1,75 y 2,125 bpw. El pipeline de seleccion de Ingot evalua la fidelidad al profesor: KL entre distribuciones del siguiente token y distancia relativa de estados ocultos cada 8 capas.

## Capacidades

- Generacion de texto conversacional en modo base/instruct heredado del profesor (etiqueta `conversational`).
- Razonamiento cientifico: 77,3% en GPQA Diamond, a 4,0 puntos del profesor BF16.
- Matematicas: 96,6% en MATH-500, practicamente a la par del profesor (97,4%).
- Codigo y tareas de repositorio: 61,0% en SWE-bench Multilingual.
- Uso de herramientas: 47,4% en τ³-bench Banking, superior tanto al profesor (46,4%) como a la cuantizacion de referencia Bonsai 2.
- Automatizacion de flujos y operaciones en terminal: 46,1% en Terminal-Bench 2.1 (identico a Bonsai 2, 17,9 puntos por debajo del profesor).
- Vision: no incluida en el fichero. Se puede anadir el proyector `Ternary-Bonsai-2-27B-mmproj-*.gguf` de prism-ml, pero fue entrenado para los pesos de genesis y su calidad con este modelo no esta evaluada (MMMU 73,7 con ese proyector).
- Capacidades multilingues: no documentadas de forma explicita; el unico indicio es SWE-bench Multilingual en los benchmarks.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de un modelo de ~27B en una unica GPU de consumo: con 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0) de pesos, cabe en tarjetas de 8-12 GB, lo que permite servir un modelo de clase 27B en una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB alli donde un BF16 de 27B exigiria 54 GB o mas.
- Agentes de codigo sobre repositorios: 61,0% en SWE-bench Multilingual y soporte de plantilla jinja (`--jinja`) permiten integrarlo en un bucle de edicion-ejecucion de tests dentro de un pipeline de CI, aceptando un degradado de ~12,7 puntos frente al profesor a cambio de reducir el coste de inferencia en un orden de magnitud.
- Automatizacion de terminal y operaciones: 46,1% en Terminal-Bench 2.1 lo hace util para tareas de shell acotadas y scripts de mantenimiento, no para operaciones de produccion sin supervision, ya que iguala a Bonsai 2 y queda lejos del profesor.
- Uso de herramientas y banca: 47,4% en τ³-bench Banking, por encima del propio profesor, lo que lo hace candidato para prototipos de asistentes con function calling en dominios transaccionales, siempre con validacion externa de las acciones.
- Inferencia en el borde o en entornos con memoria limitada: al ocupar 5,95 GB el fichero de 1,75 bpw, es viable en estaciones de trabajo sin GPU dedicada de gran capacidad o en nodos con GPU compartida, donde el coste de VRAM es la restriccion principal.
- Experimentacion en cuantizacion e investigacion de compresion: es un artefacto de referencia con metricas de fidelidad publicadas (KL 0,11026, distancia de estados ocultos 0,3566) util para comparar tecnicas de PTQ ternaria y para reproducir el harness de evaluacion de Ingot.
- Evaluacion de fidelidad frente a un profesor: util como caso de estudio para medir cuanto de un modelo de 27B sobrevive a 1,75-2,125 bpw, con la salvedad de que requiere el fork de PrismML para ejecutarse.

## Benchmarks y rendimiento

Resultados en porcentaje, todos los modelos ejecutados con el mismo harness: Terminal-Bench 2.1 con protocolo `sampled-16k-150-v2` y el resto con `sampled-16k-150-v1`. Bonsai 2 es el punto de partida de la ronda (cuantizacion ternaria de Prism del mismo profesor, mismo tamano).

| Benchmark | Dominio | Qwen3.8-27B BF16 | Bonsai 2 | Ingot-IV-27B-Q2 | Diferencia vs Bonsai 2 |
|---|---|---|---|---|---|
| SWE-bench Multilingual | codigo | 73,7 | 57,7 | 61,0 | +3,3 |
| Terminal-Bench 2.1 | terminal | 64,0 | 46,1 | 46,1 | +0,0 |
| AutomationBench | automatizacion | 25,0 | 10,5 | 10,7 | +0,2 |
| GPQA Diamond | ciencia | 81,3 | 69,7 | 77,3 | +7,6 |
| MATH-500 | matematicas | 97,4 | 96,0 | 96,6 | +0,6 |
| τ³-bench Banking | uso de herramientas | 46,4 | 41,2 | 47,4 | +6,2 |
| MMMU | vision | 82,0 | 75,7 | 73,7 | −2,0 |

MMMU se ejecuta con el proyector de vision de Bonsai 2, disenado para los pesos de genesis, no para los de este modelo.

Fidelidad respecto al profesor BF16 (por token de respuesta, frente al profesor leyendo la misma respuesta):

| Metrica | Este modelo (eval ganadora) | El rey al que supero | Mejora frente a genesis |
|---|---|---|---|
| KL(profesor ‖ modelo) | 0,11026 | 0,11259 | 13,3% mas cerca |
| Distancia de estados ocultos / media cada 8 capas | 0,3566 | 0,3612 | 21,3% mas cerca |

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan 5,95 GB (PTQ1_0) y 7,21 GB (PQ2_0). Sumando cache KV y overhead del servidor, estimacion orientativa de 8-10 GB para PTQ1_0 y 9-12 GB para PQ2_0 en contextos moderados; el contexto maximo no esta documentado, por lo que el coste de KV no puede acotarse con los datos disponibles.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090. En tarjetas de 8 GB el fichero PTQ1_0 deja muy poco margen para cache KV.
- GPU profesionales: A100 40/80 GB, H100 y L40S sin problema de capacidad; el beneficio es poder concentrar muchas instancias por GPU, no la viabilidad.
- Despliegue: exclusivamente mediante el fork de PrismML de llama.cpp, en el commit `e3de715222b2667c54a267441159a5729f11155e`, compilado con `-DGGML_CUDA=ON` y lanzado con `llama-server -m <fichero> -ngl 99 -fa on --jinja`. llama.cpp estandar no ejecuta estos ficheros. Soporte en vLLM, TGI u Ollama: no disponible.
- Vision: opcional, anadiendo `--mmproj Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` (o la variante BF16) descargado en la revision `b072e1d3b35a0a630cece372c2127528e0994386`.
- Latencia y throughput: no disponibles. La model card solo indica cualitativamente que el fichero de 2 bits decodifica mas rapido en GPU que el de 1,75 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Benchmarks clave | Licencia |
|---|---|---|---|---|---|
| Ingot-IV-27B-Q2 | ~26,9 B | No disponible | GGUF ternario, 1,75 / 2,125 bpw | SWE-bench Multilingual 61,0; GPQA-D 77,3; MATH-500 96,6; τ³ Banking 47,4 | Apache 2.0 |
| Qwen3.8-27B BF16 (profesor) | ~26,9 B | No disponible | BF16 (~54 GB) | SWE-bench Multilingual 73,7; GPQA-D 81,3; MATH-500 97,4; τ³ Banking 46,4 | No disponible en la informacion |
| Bonsai 2 / Ternary-Bonsai-2-27B (prism-ml) | ~26,9 B | No disponible | GGUF ternario, PQ2_0 / PTQ1_0 | SWE-bench Multilingual 57,7; GPQA-D 69,7; MATH-500 96,0; τ³ Banking 41,2 | No disponible en la informacion |
| Ingot-genesis-27B-Q2 (dendriteholdings) | ~26,9 B | No disponible | GGUF ternario | Referencia de fidelidad superada por este modelo (13,3% en KL, 21,3% en distancia de estados ocultos) | No disponible en la informacion |

Frente a Bonsai 2, este modelo mejora en seis de los siete benchmarks publicados (el empate en Terminal-Bench 2.1 y la caida de 2,0 puntos en MMMU, que ademas usa un proyector ajeno). Frente al profesor BF16 sigue perdiendo de forma clara en codigo (−12,7), terminal (−17,9) y automatizacion (−14,3), y lo supera marginalmente en uso de herramientas (+1,0).

## Limitaciones y advertencias

- No funciona con llama.cpp estandar: requiere el fork de PrismML y un commit concreto (`e3de715`). Esto rompe la portabilidad habitual de un GGUF y ata el despliegue a una rama no oficial.
- La vision no es una capacidad del fichero: el proyector recomendado fue entrenado para los pesos de genesis y el autor indica explicitamente que la calidad de imagen no esta probada. Los 73,7 de MMMU no deben leerse como rendimiento de vision de este modelo.
- Degradado medible frente al profesor BF16 en tareas de agente y codigo (hasta −17,9 puntos en Terminal-Bench 2.1) y en automatizacion (25,0 → 10,7). No es un sustituto del modelo completo en flujos autonomos.
- Riesgo de alucinacion incrementado por la cuantizacion ternaria: la KL de 0,11026 por token implica una divergencia no trivial en la distribucion del siguiente token, que se acumula en generaciones largas.
- Sesgos conocidos: no documentados. Al heredar los pesos del profesor Qwen3.8-27B, arrastra los sesgos de este, y no se publica ninguna evaluacion de seguridad o sesgo sobre la version cuantizada.
- Cobertura idiomatica no documentada: la model card no lista idiomas y los benchmarks solo cubren ingles (y variantes multilingues en SWE-bench).
- Longitud de contexto no disponible: no se puede planificar el coste de cache KV ni garantizar casos de uso de contexto largo.
- Origen y gobernanza: el artefacto procede de una competicion en un subnet de Bittensor y no ha pasado por un proceso de evaluacion de seguridad ni por un ciclo de publicacion convencional. El autor tambien advierte que el credito corresponde al minero.
- Licencia: Apache 2.0 para este repositorio, lo que permite uso comercial sin restricciones adicionales conocidas; sin embargo, la licencia del modelo base Qwen/Qwen3.8-27B no se detalla en la informacion disponible y conviene verificarla antes de un despliegue en produccion.
- Adopcion limitada: 4.623 descargas y 0 likes en el momento de la consulta, sin issues ni discusion publica documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-IV-27B-Q2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo genesis de referencia: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork de llama.cpp de PrismML: https://github.com/PrismML-Eng/llama.cpp
- Commit usado en la evaluacion: https://github.com/PrismML-Eng/llama.cpp/commit/e3de715222b2667c54a267441159a5729f11155e
- Proyector de vision (Bonsai 2): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Resultados en vivo de Ingot: https://www.theingot.ai
- La busqueda web realizada no devolvio enlaces relevantes sobre el modelo (unicamente paginas genericas de servicios de Google).
