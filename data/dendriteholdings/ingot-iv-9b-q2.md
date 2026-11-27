# dendriteholdings/Ingot-IV-9B-Q2

## Resumen

Ingot-IV-9B-Q2 es un modelo de lenguaje de ~8.950 millones de parametros publicado por dendriteholdings como espejo publico de una submission ganadora en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo maestro fijo y el validador premia la copia que mas se aproxima a el. El modelo parte de Prism ML Ternary Bonsai 2 9B y conserva sus codigos ternarios, pero el minero reajusto el resto de pesos para acercar la salida a la del profesor Qwen3.5-9B.

La relevancia es doble: por un lado documenta un caso real de cuantizacion ternaria extrema (1,75-2,125 bits por peso) sobre un transformer de 9B; por otro, ejemplifica un pipeline de evaluacion por divergencia KL frente al profesor en lugar de benchmarks convencionales. El resultado declarado es un KL de 0,07922 frente al profesor BF16, ligeramente mejor que el del modelo que gano la ronda anterior (0,08391).

Se distribuye unicamente como GGUF en dos variantes (PTQ1_0 a 1,75 bpw y PQ2_0 a 2,125 bpw) y requiere un fork especifico de llama.cpp mantenido por DendriteLabs; no funciona con llama.cpp estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Prism ML Ternary Bonsai 2 9B); pesos ternarios con rotacion Hadamard |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 (1,75 bpw, 2,00 GB) y PQ2_0 (2,125 bpw, 2,42 GB); ambos contenedores de los mismos pesos ternarios |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); variante MLX 2-bit en repo separado |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Ternary Bonsai 2 9B de Prism ML: un transformer de ~9B parametros cuyos pesos se almacenan en formato ternario (codigos + escala fp16 por bloque de 128 pesos) con una rotacion Hadamard aplicada en el layout. Sobre esa base, el minero reajusto los pesos no ternarios (escalas y resto de componentes) mediante fine-tuning supervisado para minimizar la divergencia respecto a Qwen3.5-9B, que actua como profesor. No se especifica el volumen de datos de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica principal es el propio esquema de cuantizacion: el fichero PTQ1_0 es un reempaquetado sin perdida del PQ2_0 del minero (cada bloque de 128 pesos conserva codigos y escala fp16, y cada peso decodifica al mismo valor), lo que reduce el tamano de 2,42 GB a 2,00 GB. La evaluacion se realiza por KL(profesor ‖ modelo) por token de respuesta, ponderando dominios por su cuota muestral, en lugar de con benchmarks de tarea. El modelo requiere el fork de llama.cpp de DendriteLabs en el commit `9991ae5`, que implementa el layout y la rotacion Hadamard especificos.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta multi-turno heredados del profesor Qwen3.5-9B, sujetos a la degradacion propia de una cuantizacion a ~2 bits.
- Capacidad multimodal opcional: se puede anadir la torre de vision de Ternary Bonsai 2 9B como proyector (`Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf` o BF16), aunque el autor advierte que fue entrenada para genesis y no para estos pesos, y que la calidad de imagen no esta probada.
- Soporte de plantillas de chat via `--jinja` en llama-server.
- Tool calling y function calling: no documentado en la informacion disponible.
- Modo thinking explicito: no documentado.
- Capacidades multilingues: no documentadas (idiomas no disponibles).

## Casos de uso

- Despliegue en hardware muy limitado: con 2,00-2,42 GB de pesos, el modelo cabe en GPUs consumer de 4-6 GB y en Apple Silicon via el pack MLX 2-bit, lo que permite servir un modelo de 9B en portatiles o dispositivos de borde.
- Investigacion sobre cuantizacion ternaria: sirve como referencia reproducible para estudiar la relacion entre bits por peso y divergencia KL frente a un profesor BF16, comparando PTQ1_0 y PQ2_0 sobre los mismos pesos.
- Reproduccion de pipelines de subredes Bittensor: util para validar el flujo de evaluacion de Ingot (minero cuantiza, validador mide KL) y para auditar submissions ganadoras.
- Asistente conversacional de bajo coste en entornos con restricciones de memoria: conversaciones multi-turno con plantilla Jinja en llama-server, aceptando la perdida de calidad frente al profesor.
- Prototipado rapido en local antes de escalar a un modelo mayor: permite iterar sobre prompts y plantillas con latencia baja en una sola GPU consumer.
- Experimentos multimodales exploratorios: combinando el modelo con el proyector de vision de Bonsai 2 para tareas de imagen a texto, asumiendo que la calidad no esta garantizada.
- Benchmarking de forks de llama.cpp: caso de prueba para validar implementaciones de layouts ternarios con rotacion Hadamard y decodificacion especulativa en el runtime.

## Benchmarks y rendimiento

| Metrica | Ingot-IV-9B-Q2 | Modelo previo (rey anterior) |
|---|---|---|
| KL(profesor ‖ modelo), ponderado por dominio | 0,07922 | 0,08391 |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica metrica reportada es la divergencia KL frente al profesor BF16 en la evaluacion de Ingot.

## Requisitos de hardware

- VRAM estimada: ~2,0 GB para PTQ1_0 (1,75 bpw) y ~2,4 GB para PQ2_0 (2,125 bpw) solo de pesos; anadir overhead de contexto KV cache y runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor indica que el fichero de 2 bits decodifica mas rapido en GPU que el de 1,75 bpw.
- Cabe en GPUs consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y similares; tambien en Apple Silicon via el pack MLX 2-bit.
- Opciones de despliegue: exclusivamente el fork de llama.cpp de DendriteLabs en el commit `9991ae5` (compilado con `-DGGML_CUDA=ON` para GPU); llama.cpp estandar no lo ejecuta. Comando de referencia: `build/bin/llama-server -m Ingot-IV-9B-PQ2_0.gguf -ngl 99 -fa on --jinja`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-IV-9B-Q2 | 8,95B | no disponible | Ternaria 1,75-2,125 bpw (GGUF) | no disponible | Hugging Face + fork llama.cpp |
| prism-ml/Ternary-Bonsai-2-9B-gguf | ~9B | no disponible | Ternaria (GGUF + mmproj vision) | no disponible | Hugging Face + fork Prism ML |
| dendriteholdings/Ingot-genesis-9B-Q2 | ~9B | no disponible | Ternaria (GGUF) | no disponible | Hugging Face + fork llama.cpp |
| Qwen3.5-9B (profesor) | ~9B | no disponible | BF16 y cuantizaciones convencionales | no disponible | Hugging Face |

La comparacion cuantitativa entre estos modelos no esta disponible mas alla del KL reportado frente al profesor. Ingot-IV-9B-Q2 se distingue por ser el unico de la lista con una submission ganadora de subred documentada y por su repack PTQ1_0 sin perdida.

## Limitaciones y advertencias

- La cuantizacion a ~2 bits implica una divergencia medible frente al profesor (KL 0,07922); la calidad por debajo de un modelo denso en BF16 no esta caracterizada por benchmarks de tarea.
- Requiere un fork no estandar de llama.cpp en un commit concreto; no hay garantia de compatibilidad con versiones futuras ni con otros runtimes (vLLM, TGI, Ollama no soportados segun la informacion disponible).
- La licencia no esta disponible: no se puede confirmar el uso comercial sin consultar al autor y al modelo base.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- Longitud de contexto no disponible; no se debe asumir una ventana larga en produccion sin verificacion empirica.
- La torre de vision opcional no fue entrenada para estos pesos y su calidad es explicitamente no probada por el autor.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; se heredan los del profesor Qwen3.5-9B y se amplifican potencialmente por la cuantizacion.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion comunitaria independiente.
- El pipeline de evaluacion (KL frente a profesor) no equivale a rendimiento en tareas reales; un KL bajo no garantiza utilidad en codigo, matematicas o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-IV-9B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Proyector de vision Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf
- Proyector de vision BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-BF16.gguf
- Modelo genesis relacionado: https://huggingface.co/dendriteholdings/Ingot-genesis-9B-Q2
- Pack MLX 2-bit: https://huggingface.co/dendriteholdings/Ingot-IV-9B-MLX-2bit
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
- Commit de referencia: https://github.com/DendriteLabs/llama.cpp/commit/9991ae551cc08c354971ebbe739931c1f9dcfcc8
