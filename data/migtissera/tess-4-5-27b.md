# migtissera/Tess-4.5-27B

## Resumen

Tess-4.5-27B es un modelo de pesos abiertos de 27.781.427.952 parámetros (unos 27,8 mil millones) publicado por migtissera (Continuity Research) en octubre de 2026. Se distribuye como fine-tuning de Qwen/Qwen3.8-27B, con licencia Apache 2.0 y pipeline `image-text-to-text`, lo que implica soporte de entrada de imagen y texto.

El modelo está orientado a trabajo de ingeniería agéntico: razonamiento paso a paso, uso de herramientas, manejo de ficheros y operación en terminal. La model card insiste en que no sacrifica capacidad general por la especialización: iguala a su base en BenchLocal, con 133/150 escenarios en el mejor de tres intentos y 128/150 al primer intento, y lo supera en el paquete CLI-40 (31 frente a 30).

Su propuesta diferencial es la eficiencia: genera un 25 % menos de tokens que su base para alcanzar la misma puntuación (262K frente a 349K en los 150 escenarios) e incorpora una cabeza de predicción multitoken (MTP) que actúa como decodificación especulativa, duplicando la generación de código en una RTX 4090 (de 48,9 a 96,1 tok/s). Con cuantización GGUF Q4_K_M el modelo cabe en una única GPU de consumo o en un portátil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tuning de Qwen/Qwen3.8-27B; los tags del repo incluyen `qwen3_5` y `qwen3.8`. El autor no detalla la arquitectura interna (tipo de atención, número de capas) en la información disponible. Incluye proyector de visión y cabeza MTP auxiliar |
| Parametros totales | 27.781.427.952 (≈27,8 mil millones), dato de safetensors |
| Parametros activos | No disponible; no se describe como modelo MoE |
| Longitud de contexto | No disponible. El ejemplo oficial de `llama-server` usa `-c 65536`, pero no se confirma que sea el máximo del modelo |
| Tipos de cuantizacion | GGUF; el ejemplo oficial usa Q4_K_M. No se detalla el catálogo completo de cuantizaciones publicadas |
| Idiomas soportados | Inglés (`language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal, 55,6 GB) y GGUF (repo `migtissera/Tess-4.5-27B-GGUF`, que incluye proyector de visión y cabezas MTP) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado del modelo denso Qwen3.8-27B, según el campo `base_model_relation: finetune`. La información disponible no especifica el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Los tags del repositorio (`agentic`, `coding`, `reasoning`, `tool-use`) y el comportamiento descrito en la model card apuntan a un ajuste centrado en trayectorias agénticas: lectura del entorno (directorio de trabajo), uso de las definiciones de herramientas realmente proporcionadas y formato de llamada a función compatible con los parsers `qwen3_coder`.

Como componentes técnicos destacables, el modelo se distribuye junto a una cabeza de predicción multitoken (MTP) que funciona como decodificación especulativa: genera varios tokens por paso y se integra tanto en vLLM (`--speculative-config '{"method": "mtp", "num_speculative_tokens": 3}'`) como en llama.cpp (`--spec-type draft-mtp`). El repositorio GGUF incluye además el proyector de visión, coherente con el pipeline `image-text-to-text`. La model card recomienda mantener el modo thinking activado y `preserve_thinking` en bucles agénticos multiturno, con muestreo `temperature=1.0`, `top_p=0.95`, `top_k=20`, `min_p=0.0`.

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento (thinking) activado por defecto.
- Razonamiento matemático: 15/15 en el paquete ReasonMath-15 de BenchLocal.
- Generación y edición de código, con 96,1 tok/s en RTX 4090 usando la cabeza MTP.
- Tool calling y function calling: parser `qwen3_coder` en vLLM y soporte `--jinja` en llama.cpp; 13/15 en ToolCall-15.
- Uso de agentes en terminal: lectura del directorio de trabajo y de las herramientas disponibles antes de actuar; 31/40 en CLI-40.
- Cumplimiento estricto de instrucciones y salida estructurada (15/15 en InstructFollow-15 y 14/15 en StructOutput-15).
- Extracción de datos (14/15 en DataExtract-15) con un 43 % menos de tokens que el modelo base.
- Localización de bugs (15/15 en BugFind-15).
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text` y el repo GGUF incluye proyector de visión.
- Compatibilidad con endpoints tipo OpenAI (`endpoints_compatible`), lo que permite sustituir el cliente sin cambiar el código de integración.

## Casos de uso

- Asistente de codificación en terminal: con el directorio de trabajo y las definiciones reales de herramientas en el system prompt, el modelo ejecuta comandos (`Bash({"command": "python --version"})`) y encadena pasos. Es el escenario que la model card mide con CLI-40 (31/40) y para el que está explícitamente ajustado.
- Depuración automatizada en CI: con 15/15 en BugFind-15 y un 21 % menos de tokens que su base en ese paquete, encaja en tareas de análisis de fallos y propuesta de parches dentro de un pipeline, donde el coste por ejecución importa.
- Extracción de datos estructurados a gran escala: 14/15 en DataExtract-15 generando 14K tokens frente a los 25K del base (−43 %); el ahorro se traduce directamente en coste y en sesiones más largas antes de llenar la ventana.
- Automatización de tareas de shell y DevOps: 85,5 tok/s en RTX 4090 en modo shell con la cabeza MTP, adecuado para bucles interactivos donde la latencia percibida es el cuello de botella.
- Tutoría y verificación matemática: 15/15 en ReasonMath-15 permite usarlo como comprobador de razonamientos numéricos o generador de soluciones paso a paso en inglés.
- Integración en APIs con salida JSON: 14/15 en StructOutput-15 y 15/15 en InstructFollow-15 lo hacen utilizable como backend de un endpoint compatible con OpenAI para tareas de formateo y transformación de datos.
- Asistencia sobre capturas y diagramas: al ser `image-text-to-text` con proyector de visión incluido en el repo GGUF, puede recibir imágenes junto al texto; no hay benchmarks publicados de esta capacidad.
- Despliegue local con datos sensibles: con Q4_K_M en una única RTX 4090 o en un portátil con Apple M4 Max (37,8 tok/s en código), permite operar sobre repositorios privados sin enviar código a terceros.

## Benchmarks y rendimiento

Resultados de BenchLocal reportados por el autor (mejor de tres intentos):

| Paquete de BenchLocal | Tess-4.5-27B | Qwen3.8-27B (base) |
|---|:---:|:---:|
| ToolCall-15 | 13 | 13 |
| InstructFollow-15 | 15 | 15 |
| StructOutput-15 | 14 | 14 |
| DataExtract-15 | 14 | 14 |
| ReasonMath-15 | 15 | 15 |
| BugFind-15 | 15 | 15 |
| HermesAgent-20 | 16 | 17 |
| CLI-40 | 31 | 30 |
| Total, mejor de tres | 133 / 150 | 133 / 150 |
| Total, primer intento | 128 / 150 | 128 / 150 |

Eficiencia de tokens hasta la misma puntuación:

| Conjunto | Tess-4.5-27B | Qwen3.8-27B | Variación |
|---|:---:|:---:|:---:|
| 150 escenarios | 262K | 349K | −25 % |
| CLI-40 | 149K | 219K | −32 % |
| DataExtract-15 | 14K | 25K | −43 % |
| BugFind-15 | 28K | 35K | −21 % |

Throughput de decodificación con y sin cabeza MTP:

| Máquina | Sin draft | Con MTP, código | Con MTP, shell |
|---|:---:|:---:|:---:|
| NVIDIA RTX 4090 | 48,9 tok/s | 96,1 tok/s | 85,5 tok/s |
| Apple M4 Max | 24,4 tok/s | 37,8 tok/s | 33,1 tok/s |

Fiabilidad en uso de herramientas: 0 llamadas a herramientas no proporcionadas sobre 182 respuestas puntuadas en BenchLocal. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 27,78 mil millones de parámetros; el autor no publica tabla de VRAM): BF16/FP16 ≈ 55,6 GB (coincide con el tamaño del repo); Q8_0 ≈ 29,5 GB; Q6_K ≈ 22,8 GB; Q5_K_M ≈ 19,6 GB; Q4_K_M ≈ 16,7 GB. Hay que sumar el proyector de visión, la cabeza MTP y la caché KV.
- GPU profesionales: A100 80 GB y H100 80 GB ejecutan el modelo en BF16 sin cuantizar, con margen amplio para contexto y lote.
- GPU de consumo: sí cabe. Con Q4_K_M (~17 GB) entra en RTX 4090, RTX 3090 y RTX 5090 de 24 GB, dejando espacio para caché KV con contexto moderado. El autor cita la RTX 4090 como referencia de rendimiento (96,1 tok/s en código).
- Portátil: el autor reporta 37,8 tok/s en código y 33,1 tok/s en shell sobre Apple M4 Max con la cabeza MTP, lo que implica ejecución en memoria unificada; no se especifica la configuración de memoria del equipo.
- Opciones de despliegue documentadas: llama.cpp (`llama-server -hf migtissera/Tess-4.5-27B-GGUF:Q4_K_M --spec-type draft-mtp --jinja -ngl 99 -c 65536`) y vLLM (`vllm serve` con `--reasoning-parser qwen3`, `--enable-auto-tool-choice --tool-call-parser qwen3_coder` y `--speculative-config` con 3 tokens especulativos). Se puede consumir mediante cliente compatible con OpenAI apuntando a `http://localhost:8000/v1`.
- Throughput medido: 48,9 tok/s base y 96,1 tok/s con MTP en RTX 4090; 24,4 y 37,8 tok/s respectivamente en M4 Max. No se publican datos de latencia de primer token ni de throughput por lotes.
- No se documentan integraciones con TGI u Ollama en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BenchLocal (mejor de 3) | Tokens en 150 escenarios | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tess-4.5-27B | 27,8 B | No disponible | 133 / 150 | 262K | Apache 2.0 | safetensors + GGUF |
| Qwen3.8-27B (base) | 27,8 B (no confirmado en la información) | No disponible | 133 / 150 | 349K | No disponible en la información | No disponible en la información |
| Otros fine-tunes agénticos de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación con datos en la información proporcionada es contra Qwen3.8-27B, su modelo base: mismo resultado global en BenchLocal, una victoria en CLI-40 (31 frente a 30), una derrota en HermesAgent-20 (16 frente a 17) y una reducción del 25 % en tokens generados. No hay datos que permitan compararlo con otros modelos de 27B o con especialistas agénticos de la competencia.

## Limitaciones y advertencias

- Idioma: solo inglés declarado (`language: en`); no hay evidencia de calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada: el `-c 65536` del ejemplo es una configuración de servidor, no una especificación del máximo del modelo. Para producción hay que verificarlo experimentalmente.
- Riesgo de alucinación: aunque el autor reporta 0 llamadas a herramientas inexistentes en 182 respuestas, la medición es propia y sobre BenchLocal; no garantiza el comportamiento ante herramientas, rutas o APIs fuera de ese conjunto.
- Seguridad agéntica: el modelo puede ejecutar comandos. La propia model card advierte de que hay que usar permisos, sandbox o contenedor, y de que el modelo no es una garantía frente a acciones destructivas.
- Benchmarks no independientes: los resultados proceden del autor y se limitan a BenchLocal. No hay MMLU, HumanEval, GSM8K ni evaluaciones de terceros en la información disponible.
- Capacidad de visión sin evaluar: el pipeline es `image-text-to-text`, pero no se publican métricas de comprensión de imágenes; no debe asumirse un rendimiento equiparable al de la parte textual.
- Adopción incipiente: 15 descargas y 13 likes en el momento de la consulta, con lo que el soporte de la comunidad y la cobertura de herramientas de terceros son limitados.
- Licencia: Apache 2.0 permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia. La licencia del modelo base Qwen3.8-27B no se detalla en la información disponible y conviene verificarla antes de un despliegue comercial.
- Dependencia de configuración: el rendimiento con MTP requiere la cabeza draft y los flags específicos de llama.cpp o vLLM; sin ellos, el throughput cae aproximadamente a la mitad según los datos del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/migtissera/Tess-4.5-27B
- Cuantizaciones GGUF (incluye proyector de visión y cabezas MTP): https://huggingface.co/migtissera/Tess-4.5-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Página del lanzamiento (Continuity Research): https://continuityresearch.ai/tess-4-5/
- Vídeo de presentación: https://huggingface.co/migtissera/Tess-4.5-27B/resolve/main/assets/tess-4.5-launch.mp4
