# rshoemake/taq-qwen32b-coder-mixed-allocator-3bit

## Resumen

Este repositorio contiene los pesos cuantizados del modelo `Qwen/Qwen2.5-Coder-32B-Instruct` mediante el pipeline de cuantización Tail-Aware Quantization (TAQ), en su variante `mixed_allocator` con un presupuesto de aproximadamente 3 bits por peso. El autor, `rshoemake`, ha empaquetado los pesos reales en un formato binario personalizado que combina codebooks en fp16, índices empaquetados por bits y un canal lateral para outliers, junto con capas que se mantienen en precisión completa (passthrough). El resultado es un checkpoint de 32.763 millones de parámetros que ocupa unos 65.5 GB en el repositorio, aunque el tamaño efectivo en memoria durante la inferencia es menor gracias a la compresión.

La relevancia de este modelo radica en que ofrece una alternativa de alta fidelidad frente a cuantizaciones uniformes como GGUF Q4_K_M, manteniendo un rendimiento muy cercano al modelo fp16 original en tareas de generación de código. Según los datos publicados, la pérdida de calidad (KLD) frente al fp16 es de 0.0884 en WikiText-2, y la degradación en HumanEval+ y MBPP+ es mínima (‑0.0122 y ‑0.0025 respectivamente). Está pensado para desarrolladores que necesitan desplegar un modelo de 32B en entornos con recursos limitados sin renunciar a la precisión.

El checkpoint se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y está dirigido a casos de uso de generación y asistencia de código, aunque el formato de pesos personalizado requiere herramientas específicas para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-Coder-32B-Instruct) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantizacion mixta por capas: 2/3/4 bits (presupuesto ~3.81 bpw) con formato custom (codebooks fp16 + indices empaquetados + side-channel de outliers) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Custom: `packed/*.bin` (por capa) + `fp16_passthrough/*.safetensors` para capas en precision completa |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint `Qwen/Qwen2.5-Coder-32B-Instruct`, un transformer decoder-only de 32B parametros entrenado para tareas de codigo y razonamiento. No se trata de un entrenamiento nuevo, sino de una compresion de los pesos originales mediante el pipeline TAQ (Tail-Aware Quantization). El allocator de precision mixta decide por capa si aplicar cuantizacion de tipo `outlier`, `rotation_outlier` o dejar la capa en fp16, con un presupuesto global de aproximadamente 3.81 bits por peso (bpw). Los pesos se empaquetan en un formato binario propio que incluye codebooks en fp16, indices de cuantizacion empaquetados por bits y un canal lateral para outliers, lo que permite reconstruir los valores originales con alta fidelidad.

No se proporcionan datos sobre el dataset de entrenamiento ni sobre tecnicas como RLHF o DPO, ya que el proceso es exclusivamente de cuantizacion. La evaluacion de fidelidad se realizo sobre WikiText-2 (perplejidad y KLD) y la calidad de generacion de codigo se midio con EvalPlus (HumanEval+ y MBPP+). No se menciona el uso de decodificacion especulativa ni otras innovaciones de inferencia.

## Capacidades

- Generacion de codigo: hereda las capacidades del modelo base Qwen2.5-Coder-32B-Instruct, incluyendo completado, generacion y explicacion de codigo en multiples lenguajes.
- Razonamiento y matematicas: el modelo base es competente en tareas de razonamiento logico y aritmetico, aunque la cuantizacion puede introducir ligeras degradaciones.
- Soporte de tool calling: el modelo base incluye soporte para function calling, util para integraciones con APIs y agentes.
- Capacidades multilingues: el modelo base soporta multiples idiomas, aunque no se especifica en la ficha del checkpoint.
- Modo instruct: al derivar de la variante Instruct, responde a instrucciones y mantiene un formato conversacional.

## Casos de uso

- Asistente de programacion en local: al ser un modelo de 32B cuantizado a ~3.8 bpw, puede ejecutarse en GPUs de consumo con 16-24 GB de VRAM, permitiendo un asistente de codigo offline con calidad cercana al modelo fp16.
- Autocompletado de codigo en IDEs: su baja latencia relativa (comparada con modelos mayores) y su capacidad de contexto (si se respeta la ventana del modelo base) lo hacen util para plugins de autocompletado en Visual Studio Code o JetBrains.
- Generacion de tests y documentacion: puede generar casos de prueba y comentarios a partir de funciones existentes, gracias a su entrenamiento en codigo e instrucciones.
- Integracion en pipelines de CI/CD: con soporte de tool calling, puede actuar como agente que revisa pull requests, sugiere cambios o genera mensajes de commit.
- Prototipado rapido de aplicaciones con LLM: su licencia Apache 2.0 y su tamano contenido permiten incorporarlo en entornos de desarrollo sin preocupaciones de licencia.
- Educacion y formacion: util para ensenar conceptos de programacion o generar ejemplos de codigo en entornos con recursos limitados.

## Benchmarks y rendimiento

La tabla siguiente muestra los resultados publicados en la model card, comparando este checkpoint con el modelo fp16 de referencia y con variantes uniformes de la misma familia de cuantizacion.

| Metrica | Este checkpoint (mixed_allocator_3bit) | outlier_3bit (uniforme) | rotation_outlier_3bit (uniforme) | fp16 (referencia) |
|---|---|---|---|---|
| bpw | 3.8116 | 3.8116 | 3.8259 | 16 |
| PPL WikiText-2 | 13.194 | 13.922 | 13.793 | 11.9266 |
| KLD vs fp16 | 0.0884 | 0.1109 | 0.1307 | 0 |
| HumanEval Base | 0.9024 | 0.8780 | 0.9085 | 0.9024 |
| HumanEval Base+Extra | 0.8476 | 0.8354 | 0.8354 | 0.8598 |
| MBPP Base | 0.8471 | 0.8571 | 0.8496 | 0.8647 |
| MBPP Base+Extra | 0.7243 | 0.7368 | 0.7168 | 0.7268 |

Ademas, se menciona una comparacion con una cuantizacion GGUF Q4_K_M del mismo modelo, evaluada con HumanEval Base/+Extra (0.8902/0.8293) y MBPP Base/+Extra (0.8546/0.7293), aunque no se incluye directamente en la tabla por no estar al mismo presupuesto de bits (~4.85 bpw). No se han realizado pruebas de significancia estadistica (bootstrap) a esta escala.

## Requisitos de hardware

- VRAM estimada para inferencia: con un bpw de ~3.81, el peso del modelo en memoria seria aproximadamente 32.763.876.352 × 3.81 / 8 ≈ 15.6 GB, mas overhead de activaciones y capas passthrough en fp16. Se estima un consumo total entre 16 y 20 GB.
- GPU recomendadas: tarjetas con 24 GB de VRAM (RTX 3090, RTX 4090, A5000) o GPUs profesionales como A100 (40 GB) o H100. Tambien podria ejecutarse en GPUs de 16 GB (RTX 4080, RTX 3080 Ti) con tecnicas de offloading a CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: si, en GPUs de 24 GB puede ejecutarse sin offloading; en GPUs de 16 GB puede requerir cuantizacion adicional o uso de memoria compartida.
- Opciones de despliegue: el formato de pesos es personalizado, por lo que no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Se requiere utilizar los scripts de unpacking proporcionados (`unpack_outlier.py`, `unpack_rotation_outlier.py`) para reconstruir los pesos, o desarrollar kernels especificos para el formato empaquetado.
- Latencia y throughput: no se proporcionan datos oficiales. Se espera que sea similar al modelo base con cuantizacion, pero dependera del hardware y del kernel utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | bpw | HumanEval Base+Extra | MBPP Base+Extra | Licencia |
|---|---|---|---|---|---|---|
| Este checkpoint (TAQ mixed 3bit) | 32.76B | No disponible | 3.81 | 0.8476 | 0.7243 | Apache 2.0 |
| Qwen2.5-Coder-32B-Instruct (fp16) | 32.76B | 128K (segun modelo base) | 16 | 0.8598 | 0.7268 | Apache 2.0 |
| GGUF Q4_K_M (Unsloth) | 32.76B | 128K (segun modelo base) | ~4.85 | 0.8293 | 0.7293 | Apache 2.0 |

La comparativa muestra que este checkpoint ofrece una relacion calidad/espacio muy competitiva: con un 20% menos de bits que GGUF Q4_K_M, supera ligeramente en HumanEval+ y mantiene un rendimiento similar en MBPP+. Frente al fp16, la perdida es minima.

## Limitaciones y advertencias

- El formato de pesos es propietario y no es compatible con los frameworks de inferencia estandar (vLLM, llama.cpp, etc.). Se requiere usar los scripts de unpacking o desarrollar kernels a medida, lo que complica su despliegue en produccion.
- No se han realizado pruebas de significancia estadistica (bootstrap) para confirmar que la ventaja sobre las variantes uniformes es robusta.
- La cuantizacion a 3 bits puede introducir degradaciones en tareas que requieren alta precision numerica, como calculos cientificos o generacion de codigo con dependencias de tipos complejas.
- No se especifica la longitud de contexto soportada tras la cuantizacion; aunque el modelo base soporta 128K tokens, el proceso de cuantizacion podria afectar a la ventana util.
- Los idiomas soportados no estan documentados en la ficha; se asume que hereda los del modelo base, pero no hay garantia.
- El repositorio tiene muy pocas descargas (9) y no cuenta con likes, lo que sugiere que es un proyecto experimental sin validacion amplia de la comunidad.

## Enlaces

- Repositorio HuggingFace: [rshoemake/taq-qwen32b-coder-mixed-allocator-3bit](https://huggingface.co/rshoemake/taq-qwen32b-coder-mixed-allocator-3bit)
- Modelo base: [Qwen/Qwen2.5-Coder-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct)
- Repositorio hermano con documentacion del formato: [rshoemake/taq-qwen14b-unsloth-matched](https://huggingface.co/rshoemake/taq-qwen14b-unsloth-matched)
- Repositorios de la variante 4-bit (mencionados en la model card): [rshoemake/taq-qwen32b-coder-outlier-4bit](https://huggingface.co/rshoemake/taq-qwen32b-coder-outlier-4bit), [rshoemake/taq-qwen32b-coder-rotation-outlier-4bit](https://huggingface.co/rshoemake/taq-qwen32b-coder-rotation-outlier-4bit), [rshoemake/taq-qwen32b-coder-mixed-allocator-4bit](https://huggingface.co/rshoemake/taq-qwen32b-coder-mixed-allocator-4bit)
