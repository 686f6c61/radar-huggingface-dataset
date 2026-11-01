# m4gshm/Qwen2.5-Coder-1.5B-nf4-sym-g-1-se-awq

## Resumen

Qwen2.5-Coder-1.5B-nf4-sym-g-1-se-awq es una exportación a formato OpenVINO del modelo Qwen2.5-Coder-1.5B de Alibaba Qwen, cuantizada a 4 bits mediante NNCF (Neural Network Compression Framework). El autor de la conversión es el usuario m4gshm, que publica el artefacto en HuggingFace bajo licencia Apache 2.0. El modelo base es un transformer causal de tipo `Qwen2ForCausalLM` con 1.500 millones de parámetros, especializado en generación de código y conversación técnica.

El problema que resuelve esta versión concreta es el despliegue eficiente en hardware Intel: frente al checkpoint original en safetensors, este export ofrece pesos en formato IR de OpenVINO (0,83 GB) con cuantización NF4 simétrica por canal y escalas AWQ, lo que reduce el uso de memoria y permite inferencia acelerada en CPU, iGPU y NPU mediante el runtime de Intel. Es relevante para desarrolladores que quieren ejecutar un modelo de código pequeño y local sin GPU dedicada, integrado en el ecosistema de Optimum-Intel.

La ventana de contexto, los idiomas soportados y los detalles del entrenamiento original no se documentan en la información disponible de este repositorio; se heredan del modelo base Qwen2.5-Coder-1.5B, pero no se confirman aquí con cifras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder causal) |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-Coder-1.5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NF4 simetrica, group_size=-1 (per-channel), escalas AWQ, estimacion de escala con dataset de calibracion gsm8k |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (openvino_model.xml/.bin), tokenizer y detokenizer OpenVINO, configs JSON, chat_template.jinja |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder causal de la familia Qwen2, con la clase `Qwen2ForCausalLM`, tal como se declara en la model card. Esta exportación no reentrena el modelo: parte del checkpoint Qwen/Qwen2.5-Coder-1.5B y aplica una compresión de pesos a 4 bits con NNCF. La cuantización es NF4 (NormalFloat 4-bit) simétrica, con `group_size=-1`, es decir, una escala por canal en lugar de por grupo. Además, se aplican escalas activation-aware (AWQ) y un paso de estimación de escala usando el conjunto de calibración gsm8k.

El resultado son pesos en formato IR de OpenVINO con un tamaño de 0,83 GB, frente a los aproximadamente 3 GB que ocuparía el modelo en precisión completa. El repositorio incluye tokenizer y detokenizer convertidos a OpenVINO, plantilla de chat y ficheros de configuración, de modo que el artefacto es autocontenido y se puede cargar directamente con Optimum-Intel. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat incluida (`chat_template.jinja`).
- Generación y asistencia en código, por la especialización del modelo base Qwen2.5-Coder.
- Razonamiento y matemáticas básicas, reforzado en la calibración con gsm8k (aunque esto solo afecta a las escalas de cuantización, no a un entrenamiento adicional).
- Inferencia acelerada en hardware Intel mediante OpenVINO (CPU, iGPU, NPU según el dispositivo disponible).
- Carga directa con `OVModelForCausalLM` y `device="AUTO"` desde Optimum-Intel.
- Tool calling y function calling: no disponible en la información proporcionada para esta exportación.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Multilingüismo: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no soportado (la model card indica explícitamente que no admite imágenes).

## Casos de uso

- Autocompletado de código en el IDE local: el modelo, al ser de 1,5 B parámetros y estar cuantizado a 4 bits, se ejecuta en CPU Intel con OpenVINO sin necesidad de GPU, lo que permite integrarlo en plugins de editor con latencia baja y consumo de memoria contenido.
- Asistente de código en entornos sin GPU: equipos de desarrollo con portátiles Intel pueden servir el modelo vía Optimum-Intel usando el dispositivo `AUTO`, aprovechando iGPU o NPU cuando estén disponibles.
- Generación de tests unitarios y documentación técnica: la especialización del modelo base en código permite producir snippets, docstrings y casos de prueba a partir de fragmentos de código fuente.
- Prototipado rápido de pipelines RAG sobre código: al ser un artefacto autocontenido con tokenizer incluido, se puede desplegar como servicio de generación en un microservicio Python sin dependencias pesadas de CUDA.
- Enseñanza y demostraciones de cuantización: sirve como ejemplo reproducible de exportación OpenVINO con NF4, AWQ y calibración gsm8k para quienes quieran replicar el flujo con NNCF.
- Procesamiento por lotes de bajo coste en servidores Intel: tareas de generación de texto o transformación de código en CPU, donde el ahorro de memoria del formato IR (0,83 GB) permite múltiples instancias en el mismo host.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad entre el modelo original y esta versión de 4 bits en tareas de código y matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos en IR ocupan 0,83 GB; la memoria total en ejecución depende de la longitud de contexto y del backend, pero el modelo cabe holgadamente en menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: no se especifican; el artefacto está orientado a OpenVINO, por lo que el hardware objetivo son CPU Intel (con instrucciones AVX2/AVX-512), iGPU Intel y NPU Intel.
- Cabe en GPU consumer: no hay datos específicos para CUDA; para ejecución en GPU NVIDIA habría que usar el checkpoint original con otro runtime, no esta exportación.
- Opciones de despliegue: Optimum-Intel (`OVModelForCausalLM`), runtime de OpenVINO, y servidores compatibles con el formato IR. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| m4gshm/Qwen2.5-Coder-1.5B-nf4-sym-g-1-se-awq | 1,5 B | no disponible | OpenVINO IR NF4 + AWQ | Apache 2.0 | Export cuantizado para hardware Intel |
| Qwen/Qwen2.5-Coder-1.5B | 1,5 B | no disponible en esta ficha | safetensors | Apache 2.0 | Modelo base original, precision completa |
| Otras exportaciones OpenVINO de Qwen2.5-Coder-1.5B | 1,5 B | no disponible | OpenVINO IR | Apache 2.0 | Variantes de cuantizacion no comparadas en detalle |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización NF4 a 4 bits puede degradar la calidad respecto al modelo original, especialmente en tareas de razonamiento matemático y generación de código complejo; no se aportan métricas de esa degradación.
- El tamaño de 1,5 B parámetros limita la profundidad de razonamiento frente a modelos mayores; no es adecuado para tareas que requieran planificación extensa o contextos muy largos.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado en código por la posible generación de APIs inexistentes o firmas incorrectas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad para esta exportación.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar también la licencia del modelo base y de las dependencias de OpenVINO y NNCF.
- El artefacto está atado al ecosistema OpenVINO; no es portable a otros runtimes sin reconversión.
- La información sobre idiomas, contexto y benchmarks no está disponible en el repositorio, lo que dificulta evaluar su idoneidad en producción sin pruebas propias.
- El repositorio tiene muy pocas descargas (18) y ningún like, por lo que no hay validación comunitaria de su calidad.

## Enlaces

- HuggingFace: https://huggingface.co/m4gshm/Qwen2.5-Coder-1.5B-nf4-sym-g-1-se-awq
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Optimum-Intel: https://github.com/huggingface/optimum-intel
- OpenVINO: https://github.com/openvinotoolkit/openvino
- NNCF: https://github.com/openvinotoolkit/nncf
