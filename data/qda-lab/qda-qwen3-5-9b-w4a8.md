# qda-lab/QDA-Qwen3.5-9B-W4A8

## Resumen

QDA-Qwen3.5-9B-W4A8 es un checkpoint cuantizado del modelo denso Qwen/Qwen3.5-9B, publicado por el laboratorio qda-lab. La cuantizacion se obtuvo mediante una busqueda automatizada denominada QDA ("Closed-Loop Quantization Design with LLM Agents"), presentada como envio a MLSys 2027. El resultado es una compresion W4A8 (pesos a 4 bits, activaciones a 8 bits) en formato compressed-tensors que se carga directamente en vLLM sin conversion adicional.

El modelo base Qwen3.5-9B es un modelo denso de la familia Qwen3.5 orientado a razonamiento, comprension visual y comportamiento agentico. El checkpoint cuantizado conserva los 9.653.104.368 parametros del original, con un repositorio de 9,1 GB, lo que supone una reduccion sustancial del espacio frente a los pesos en precision completa.

La relevancia de esta ficha radica en que se trata de un artefacto de investigacion con evaluacion publicada: el autor reporta puntuaciones en AIME 2025 + HMMT Feb 2026, GPQA-Diamond, LiveCodeBench v6 e IFBench, con una media del 72,3 %. Es, por tanto, un caso util para estudiar el impacto real de una cuantizacion agresiva W4A8 sobre un modelo de 9B en tareas de razonamiento y codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), con cabeza MTP para decodificacion especulativa |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (pesos 4 bits, activaciones 8 bits), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo denso Qwen3.5-9B, no un modelo entrenado desde cero. La arquitectura subyacente es un transformer denso de la familia Qwen3.5, que segun la documentacion del modelo base combina razonamiento, comprension visual y capacidades agenticas. El checkpoint incluye una cabeza MTP (Multi-Token Prediction) empleada para decodificacion especulativa; el autor indica que esta cabeza se ajusto para coincidir con el flujo residual rotado de este checkpoint, mientras que todos los tensores del modelo principal son identicos byte a byte a los archivos evaluados en el paper.

El proceso de cuantizacion es el elemento diferencial: QDA aplica un diseno de cuantizacion en bucle cerrado asistido por agentes LLM, que busca configuraciones W4A8 que minimicen la perdida de precision. El resultado se serializa en el formato compressed-tensors, que vLLM consume de forma nativa. No se dispone de informacion sobre el dataset de calibracion, el numero de tokens empleados ni la composicion de los datos de entrenamiento originales del modelo base.

## Capacidades

- Generacion de texto y razonamiento de varios pasos, con resultados reportados en GPQA-Diamond (81,2) e IFBench (65,1).
- Razonamiento matematico competitivo: 74,6 de media en AIME 2025 y HMMT Feb 2026.
- Generacion de codigo: 68,5 en LiveCodeBench v6.
- Capacidades de vision heredadas del modelo base Qwen3.5-9B, descrito como vision-language en la documentacion de Jetson AI Lab; el checkpoint cuantizado no documenta explicitamente el soporte visual.
- Decodificacion especulativa mediante cabeza MTP incluida en el checkpoint (no empleada en la evaluacion publicada).
- Soporte de tool calling y comportamiento agentico: no documentado de forma explicita en la model card, aunque el modelo base se orienta a uso agentico.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: el checkpoint mantiene 74,6 de media en AIME 2025 y HMMT Feb 2026, por lo que es adecuado para tutoria de matematicas competitivas, verificacion de demostraciones y generacion de problemas con solucion.
- Generacion de codigo en pipelines: con 68,5 en LiveCodeBench v6, puede integrarse en asistentes de programacion o revision de parches, siempre que se valide la salida con tests automatizados.
- Evaluacion de tecnicas de cuantizacion: al ser un artefacto con resultados publicados y semilla reproducible (search `r-9995ede2`, hand-in `h8`), sirve como referencia para comparar metodologias W4A8 en investigacion.
- Despliegue en vLLM de bajo coste: el formato compressed-tensors y los 9,1 GB del repositorio permiten servir el modelo con `vllm serve qda-lab/QDA-Qwen3.5-9B-W4A8` en una sola GPU, reduciendo el coste por token frente a los pesos en BF16.
- Razonamiento cientifico de dominio: con 81,2 en GPQA-Diamond, es util para responder preguntas de nivel experto en fisica, quimica y biologia en entornos de investigacion, con revision humana obligatoria.
- Seguimiento de instrucciones complejas: 65,1 en IFBench lo hace apto para tareas de extraccion estructurada y formateo condicionado por restricciones, como generacion de JSON con esquemas estrictos.
- Prototipado de agentes con decodificacion especulativa: la cabeza MTP incluida permite experimentar con aceleracion de inferencia en vLLM, aunque el autor advierte que no se uso en la evaluacion.

## Benchmarks y rendimiento

Resultados publicados por el autor del checkpoint, evaluados con vLLM 0.27.1 sobre GH200, batching estatico, muestreo de la model card (`temperature=1.0`, `top_p=0.95`, `top_k=20`, `presence_penalty=1.5`) y semillas 17+j:

| Benchmark | Puntuacion (%) |
|---|---|
| Math (AIME 2025 + HMMT Feb 2026) | 74,6 |
| GPQA-Diamond | 81,2 |
| LiveCodeBench v6 | 68,5 |
| IFBench | 65,1 |
| Media | 72,3 |

No se han publicado en la informacion disponible resultados comparativos frente al modelo base sin cuantizar ni frente a otras cuantizaciones del mismo modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10-12 GB para pesos y overhead en W4A8, aunque el requisito real depende de la longitud de contexto y del numero de secuencias concurrentes (no disponible con precision).
- GPU recomendadas: el autor evaluo sobre GH200; por el tamano del checkpoint, una A100 40 GB, H100 o L40S cubren el despliegue con holgura.
- GPU de consumo: cabe en tarjetas con 16 GB o mas, como RTX 4080, RTX 4090 o RTX 5090, siempre que el contexto configurado no sea excesivo.
- Opciones de despliegue: vLLM es el soporte principal y documentado (`vllm serve qda-lab/QDA-Qwen3.5-9B-W4A8`); el formato compressed-tensors no es directamente compatible con llama.cpp u Ollama sin conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QDA-Qwen3.5-9B-W4A8 | 9,65 B (denso) | no disponible | W4A8 (compressed-tensors) | no disponible | Hugging Face, vLLM |
| Qwen/Qwen3.5-9B | 9,65 B (denso) | no disponible | BF16 (original) | no disponible | Hugging Face |
| Qwen3.5-9B W4A16 (Jetson Orin) | 9,65 B (denso) | no disponible | W4A16 | no disponible | Jetson AI Lab |
| Qwen3.5-9B NVFP4 (Jetson Thor) | 9,65 B (denso) | no disponible | NVFP4 | no disponible | Jetson AI Lab |

La comparativa se limita a variantes del mismo modelo base; no se dispone de datos de rendimiento de las alternativas W4A16 y NVFP4 en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion W4A8 introduce perdida de precision respecto al modelo original; el autor no publica la comparacion directa con Qwen3.5-9B en BF16, por lo que el degradado real no puede cuantificarse con los datos disponibles.
- Los benchmarks se obtuvieron con una configuracion de muestreo concreta y semillas fijas; los resultados pueden no reproducirse con otros parametros o motores de inferencia.
- La cabeza MTP se ajusto tras la evaluacion y no se uso en ella; su comportamiento en produccion no esta validado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de dominio cientifico y matematico donde el modelo puede producir razonamientos plausibles pero incorrectos.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar al autor o al modelo base.
- Idiomas soportados no documentados; el rendimiento fuera del ingles y el chino es incierto.
- Longitud de contexto no disponible, lo que impide planificar despliegues con ventanas largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.
- El checkpoint esta vinculado a un envio a congreso (MLSys 2027) no aceptado necesariamente; su valor es principalmente de investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.5-9B-W4A8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ficha de Qwen3.5-9B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
