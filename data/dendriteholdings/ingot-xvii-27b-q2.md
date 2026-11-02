# dendriteholdings/Ingot-XVII-27B-Q2

## Resumen

Ingot-XVII-27B-Q2 es un modelo de lenguaje de 26.896 millones de parámetros distribuido en formato GGUF y cuantizado de forma ternaria (pesos restringidos a los valores −1, 0 y +1 con escalas por bloque). Lo publica el usuario de HuggingFace `dendriteholdings` como espejo público de una submission ganadora de Ingot, una subred de Bittensor en la que los mineros compiten por producir la cuantización que más se aproxima a un modelo profesor fijo. El modelo base es Ternary Bonsai 2 27B de Prism ML, que a su vez es una cuantización ternaria de un profesor de 27B (Qwen3.8-27B) en BF16.

La propuesta del modelo es la eficiencia extrema en memoria: los dos ficheros publicados ocupan 5,95 GB (1,75 bits por peso, repack sin pérdida en formato PTQ1_0) y 7,21 GB (2,125 bits por peso, contenedor de 2 bits con los mismos códigos ternarios), lo que permite ejecutar un modelo de ~27B en hardware de consumo. El refinamiento del minero no altera ningún código ternario (0 de 26,87B modificados) y se limita a reajustar el 99,8% de las escalas fp16 por bloque y todos los pesos de normalización.

Es relevante ahora porque demuestra un patrón de entrenamiento poco habitual (fine-tuning sobre cuantización ternaria en lugar de sobre pesos completos) y porque publica métricas de fidelidad frente al profesor (KL y distancia de estados ocultos) además de benchmarks de agente, con velocidades medidas en GPU Blackwell y en Mac Studio M3 Ultra. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (familia Bonsai 2 de Prism ML; detalles completos no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el protocolo de evaluación usa respuestas de hasta 32.768 tokens) |
| Tipos de cuantizacion | Ternaria: PTQ1_0 a 1,75 bits por peso (5,95 GB) y PQ2_0 a 2,125 bits por peso (7,21 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Ternary Bonsai 2 27B de Prism ML, que la model card describe como una familia con atención lineal y rotación de Hadamard aplicada en el pipeline de inferencia (el fork de Dendrite fusiona en Metal la rotación de Hadamard y la actualización de estado de la atención lineal). No se detallan en la información disponible el número de capas, la dimensión oculta ni la composición del dataset original de entrenamiento.

El proceso de refinamiento es el núcleo técnico diferencial: el minero conservó el 100% de los códigos ternarios del modelo base y reentrenó únicamente los parámetros continuos que acompañan a la cuantización, es decir, el 99,8% de las escalas fp16 por bloque (con un cambio del 9,6% en la mediana y superior al 20% en aproximadamente uno de cada cinco bloques) y todos los pesos de normalización. Como cada peso se reconstruye como código × escala de bloque, el resultado mantiene la estructura −1/0/+1 pero con magnitudes recalibradas para acercarse al profesor BF16. No se especifican en la información disponible el volumen de datos, el número de tokens de entrenamiento ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento científico y matemático: puntuaciones de 77,8% en GPQA Diamond y 98,0% en MATH-500 según la model card.
- Resolución de tareas de ingeniería de software: 57,7% en SWE-bench Multilingual.
- Uso de terminal y ejecución de comandos: 56,2% en Terminal-Bench 2.1.
- Tool calling y uso de herramientas en entornos de agente: 34,0% en τ³-bench Banking, con hasta 150 pasos por episodio en el protocolo de evaluación.
- Razonamiento multi-paso en agentes sin acceso a internet (condición del harness de evaluación en SWE-bench, GPQA y τ³).
- Capacidades multilingües: el benchmark SWE-bench Multilingual sugiere soporte de código en varios lenguajes, pero no se detalla la lista de idiomas naturales soportados.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Despliegue en hardware de consumo: con 5,95 GB en PTQ1_0 o 7,21 GB en PQ2_0, el modelo cabe en GPUs de 8-12 GB de VRAM y en equipos Apple Silicon, lo que permite servir un modelo de ~27B en estaciones de trabajo sin GPUs de centro de datos.
- Asistente de código en local: con 57,7% en SWE-bench Multilingual puede integrarse en entornos de desarrollo con restricciones de privacidad donde no es viable enviar código a una API externa, ejecutándose sobre llama.cpp.
- Automatización de tareas de terminal: su 56,2% en Terminal-Bench 2.1 lo hace adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en pipelines de administración de sistemas.
- Agentes de atención al cliente con tool calling: el 34,0% en τ³-bench Banking indica competencia en flujos con herramientas y múltiples turnos, suficiente para prototipos y despliegues internos con supervisión.
- Tutoría y resolución de problemas de matemáticas: el 98,0% en MATH-500 permite usarlo en aplicaciones educativas que resuelven problemas paso a paso, con la ventaja de ejecutarse sin conexión.
- Investigación sobre cuantización: como artefacto que documenta el efecto de reajustar solo escalas sobre una cuantización ternaria, sirve de referencia para estudiar la fidelidad al profesor (KL de 0,1231 en Terminal-Bench 2.1 frente a 0,1384 de Bonsai 2).
- Evaluación de subredes Bittensor: permite reproducir y auditar el protocolo de Ingot comparando submissions contra el profesor con las mismas métricas publicadas.

## Benchmarks y rendimiento

Resultados en porcentaje, protocolo `t1-minp05-32k-150` (temperatura 1.0, top-p 0.95, min-p 0.05, top-k 20, hasta 32.768 tokens de respuesta, 150 pasos de agente, sin internet en SWE-bench, GPQA y τ³). Una ejecución por modelo.

| Benchmark | Dominio | Qwen3.8-27B BF16 | Bonsai 2 | Ingot-XVII-27B-Q2 | vs Bonsai 2 |
|---|---|---|---|---|---|
| SWE-bench Multilingual | código | 71,3 | 58,0 | 57,7 | −0,3 |
| Terminal-Bench 2.1 | terminal | 70,8 | 50,6 | 56,2 | +5,6 |
| GPQA Diamond | ciencia | 85,4 | 77,8 | 77,8 | +0,0 |
| MATH-500 | matemáticas | 98,0 | 96,4 | 98,0 | +1,6 |
| τ³-bench Banking | uso de herramientas | 41,2 | 28,9 | 34,0 | +5,1 |

Fidelidad frente al profesor BF16 (menor es mejor):

| Métrica | Este modelo | Bonsai 2 |
|---|---|---|
| KL en la evaluación ganadora | 0,09789 | 0,10166 |
| Distancia de estados ocultos en la evaluación ganadora | 0,3267 | 0,3283 |
| KL en Terminal-Bench 2.1 (held-out, 86 pasos) | 0,1231 | 0,1384 |
| KL en SWE-bench Multilingual (held-out, 150 pasos) | 0,0756 | 0,0935 |
| Distancia de estados ocultos (held-out) | 0,328 | 0,485 |

Velocidad de decodificación (batch 1, `llama-bench`, `tg128` y `pp512`):

| Hardware | Fichero | Decode tok/s | Prompt tok/s |
|---|---|---|---|
| RTX PRO 6000 Blackwell 96 GB | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell 96 GB | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork PrismML | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite | PTQ1_0 | 52,8 | 368 |

Prism ML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090 (no medido por el autor de esta ficha). Terminal-Bench 2.1 tiene 89 tareas, con una variación de aproximadamente ±5 puntos por ejecución.

## Requisitos de hardware

- VRAM estimada: unos 6 GB para PTQ1_0 y unos 7,5 GB para PQ2_0, más overhead de contexto KV; con contexto largo la huella crece de forma no cuantificada en la información disponible.
- GPU de centro de datos: RTX PRO 6000 Blackwell (96 GB) medida a 137-145 tok/s de decodificación; A100 y H100 no se han medido en la información disponible, pero por tamaño caben holgadamente.
- GPU de consumo: cabe en tarjetas de 8 GB o más; Prism ML reporta 142 tok/s para el modelo base en una RTX 5090. No se han medido otras tarjetas de consumo.
- Apple Silicon: Mac Studio M3 Ultra (80 núcleos GPU, 512 GB) a 44,5-56,4 tok/s según fork y fichero; el fork de Dendrite mejora la decodificación entre un 22% y un 27% en Metal.
- Despliegue: llama.cpp (librería declarada), con el fork de Prism ML o el fork de DendriteLabs; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo API. No se mencionan vLLM ni TGI, que no soportan este formato ternario en la información disponible.
- Throughput de prompt: 3.865 tok/s en RTX PRO 6000 Blackwell y 432 tok/s en M3 Ultra, lo que limita el uso con contextos muy largos en Mac.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | SWE-bench Multilingual | GPQA Diamond | Licencia |
|---|---|---|---|---|---|---|
| Ingot-XVII-27B-Q2 | ~26,9B | ternaria 1,75-2,125 bpw | no disponible | 57,7 | 77,8 | Apache 2.0 |
| Bonsai 2 (Prism ML) | ~26,9B | ternaria | no disponible | 58,0 | 77,8 | no disponible en la información |
| Qwen3.8-27B BF16 (profesor) | 27B | BF16 | no disponible | 71,3 | 85,4 | no disponible en la información |

La comparación relevante es de compromiso: frente al profesor BF16 en precisión completa, Ingot-XVII-27B-Q2 pierde 13,6 puntos en SWE-bench Multilingual y 7,6 en GPQA Diamond, pero reduce el tamaño de pesos de decenas de GB a menos de 8 GB. Frente a Bonsai 2, mejora en Terminal-Bench 2.1 (+5,6) y τ³-bench Banking (+5,1), empata en GPQA Diamond y MATH-500 y retrocede marginalmente en SWE-bench (−0,3), con mejor fidelidad al profesor en las métricas de KL y distancia de estados ocultos.

## Limitaciones y advertencias

- Brecha significativa frente al profesor BF16: 57,7 frente a 71,3 en SWE-bench Multilingual y 34,0 frente a 41,2 en τ³-bench Banking; no es un sustituto directo de un modelo de 27B en precisión completa para tareas de agente complejas.
- Las puntuaciones provienen de una única ejecución por modelo; en Terminal-Bench 2.1 y τ³-bench Banking la variación estimada es de ±5 puntos, por lo que las diferencias frente a Bonsai 2 en esos benchmarks deben tomarse con cautela.
- La model card no documenta sesgos, idiomas soportados, longitud de contexto ni composición del dataset de entrenamiento; no es posible evaluar riesgos de sesgo ni cobertura lingüística.
- Riesgo de alucinación inherente a un modelo de 27B cuantizado de forma agresiva; la fidelidad medida (KL de 0,0756-0,1231 frente al profesor) indica divergencia no nula en la distribución de siguiente token.
- El modelo base es una cuantización ternaria, no un modelo entrenado desde cero; su techo de rendimiento está acotado por el profesor y por el esquema de cuantización.
- Requiere builds específicos de llama.cpp (fork de Prism ML o de DendriteLabs) para el layout, tokenizador y rotación de Hadamard; otros runners no están validados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero la información disponible no aclara la licencia del modelo base ni posibles restricciones heredadas del profesor.
- El modelo se publica como espejo de una submission de subred; no hay garantía de mantenimiento, soporte ni actualizaciones por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-XVII-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo genesis de la ronda: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Resultados en vivo de la subred: https://theingot.ai
- Vista token a token de los pasos held-out: https://theingot.ai/#tokens
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
