# nishamsi/Mistral-7B-Instruct-v0.3-MXFP4-W4A4

## Resumen

`nishamsi/Mistral-7B-Instruct-v0.3-MXFP4-W4A4` es una version cuantizada del modelo `mistralai/Mistral-7B-Instruct-v0.3` de Mistral AI, publicada por el usuario nishamsi. La cuantizacion aplica el esquema MXFP4 (4 bits en coma flotante con grupos de 32) tanto a los pesos como a las activaciones de entrada, es decir, un esquema W4A4, usando la libreria `compressed-tensors` y el formato `mxfp4-pack-quantized`. El objetivo es reducir el peso en disco de los 14,5 GB aproximados de la version BF16 a unos 4 GB, manteniendo el resto de la arquitectura del modelo base intacta.

El modelo base, Mistral-7B-Instruct-v0.3, es un transformer decoder-only denso de 7.248 millones de parametros, con tokenizador v3 de vocabulario ampliado, entrenado por Mistral AI y publicado bajo licencia Apache-2.0. La version cuantizada conserva las capas de embeddings y la cabeza de salida (`lm_head`) en BF16, y solo cuantiza las capas lineales. El repositorio ocupa 4,2 GB en total y los ficheros de pesos suman 3,954 GiB.

La relevancia de esta ficha es practica: se trata de un checkpoint de cuantizacion experimental, con 73 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados y sin validacion comunitaria extensa. Es util como referencia tecnica del flujo de cuantizacion MXFP4 con `compressed-tensors`, pero no como sustituto validado del modelo original en produccion sin una evaluacion previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura Mistral, modelo base Mistral-7B-Instruct-v0.3); capas lineales cuantizadas con MXFP4 |
| Parametros totales | 7.248.023.552 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | MXFP4 W4A4: pesos en coma flotante de 4 bits con grupos de 32; activaciones de entrada en coma flotante de 4 bits dinamica con grupos de 32; embeddings y `lm_head` en BF16 |
| Idiomas soportados | No disponible en la ficha del repositorio |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, formato de cuantizacion `mxfp4-pack-quantized` (compressed-tensors 0.14.0.1; guardado con Transformers 4.57.6) |

## Arquitectura y entrenamiento

El checkpoint no introduce ninguna arquitectura nueva: es el modelo Mistral-7B-Instruct-v0.3 con las capas lineales sustituidas por equivalentes cuantizados en MXFP4. La receta de conversion es sin calibracion, aplicada con `QuantizationModifier` sobre `targets=["Linear"]` e `ignore=["lm_head"]`, y queda registrada en el fichero `recipe.yaml` del repositorio. Los pesos se almacenan empaquetados en grupos de 32 y las activaciones se cuantizan de forma dinamica en tiempo de ejecucion. Las capas de embedding y la cabeza de salida permanecen en BF16.

No se ha realizado ningun entrenamiento ni ajuste adicional: el proceso es exclusivamente de cuantizacion post-entrenamiento (PTQ) sobre el checkpoint instruct original, que a su vez es un ajuste por instrucciones del modelo base Mistral-7B-v0.3. La propia model card advierte de que la revision historica del modelo base es desconocida y que la trazabilidad de la procedencia se documenta por separado en `upstream-provenance.json`. Esto implica que no hay control reproducible sobre la revision exacta del padre, un punto relevante para auditoria.

El autor publica los scripts de generacion y conversion en el repositorio `n-shamsi/mxfp4-model-tools`. La carga de referencia se hace con `CompressedTensorsConfig(run_compressed=False)`, lo que significa que la ruta de Transformers expande los pesos empaquetados y aplica la cuantizacion configurada, en lugar de ejecutar kernels MXFP4 nativos.

## Capacidades

- Generacion de texto conversacional en formato instruct, con plantilla de chat aplicada mediante `apply_chat_template` y rol de sistema (`messages` con `role` y `content`).
- Razonamiento general y respuesta a instrucciones, heredado del ajuste instruct del modelo base.
- Generacion de codigo y resolucion de tareas de matematicas basicas, en la medida en que lo hace el modelo base (no hay evaluacion especifica de esta version cuantizada).
- Capacidades multilingues: no documentadas en la ficha del repositorio; deben validarse empiricamente caso por caso.
- Soporte de tool calling y function calling: no declarado en la ficha de este checkpoint; depende del modelo base y de la plantilla de chat empleada.
- Capacidades de agente y razonamiento multi-paso: no declaradas ni validadas para esta version.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Inferencia con contexto largo de hasta 32.768 tokens en el modelo base; el comportamiento tras la cuantizacion W4A4 en contextos largos no esta documentado.

## Casos de uso

- Despliegue en GPU de gama media o en un unico acelerador con VRAM limitada: con los pesos empaquetados en ~4 GB, el checkpoint permite servir un modelo de 7B en tarjetas donde la version BF16 (~14,5 GB) no cabria, a costa de asumir el riesgo de degradacion por cuantizacion.
- Prototipado rapido de asistentes conversacionales: la integracion con `transformers` y `apply_chat_template` permite levantar un endpoint de chat con unas pocas lineas de Python, usando `device_map="auto"` para repartir el modelo automaticamente.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia W4A4 para comparar perplejidad y calidad de generacion frente al modelo en BF16, FP8 o INT4 con calibracion, en un marco experimental controlado.
- Entornos de investigacion sobre formatos MXFP4: util para estudiar el coste real de expandir pesos empaquetados frente a ejecutarlos con kernels nativos, y para medir el impacto del esquema en la latencia de decodificacion.
- Generacion de texto por lotes en pipelines offline: tareas de resumen, clasificacion o extraccion donde la latencia no es critica y prima reducir el coste de memoria por instancia desplegada.
- Pruebas de integracion con `text-generation-inference`: el repositorio incluye la etiqueta `text-generation-inference`, por lo que es candidato a pruebas de despliegue con ese servidor, siempre que la version de TGI soporte el formato `mxfp4-pack-quantized`.
- Base para ajuste fino con QLoRA o tecnicas equivalentes: al reducir la huella de memoria de los pesos congelados, libera VRAM para adaptadores y estados del optimizador en GPUs de una sola tarjeta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, ni comparaciones con el modelo base en BF16. Tampoco hay datos de perplejidad, latencia o throughput. Cualquier afirmacion sobre la perdida de calidad introducida por la cuantizacion MXFP4 W4A4 requiere una evaluacion propia contra `mistralai/Mistral-7B-Instruct-v0.3`.

## Requisitos de hardware

- Peso en disco del checkpoint: 3,954 GiB en ficheros de pesos; 4,2 GB de repositorio completo.
- VRAM minima estimada con pesos empaquetados: en torno a 4,5-5 GB, sumando pesos MXFP4, embeddings y `lm_head` en BF16, mas overhead de runtime.
- VRAM estimada si el runtime expande los pesos (ruta `run_compressed=False` de Transformers): aproximadamente 14,5 GB para los pesos en BF16, mas activaciones y cache KV.
- Cache KV: crece de forma lineal con la longitud de contexto. Con la configuracion del modelo base (32 capas, atencion con 8 cabezas KV y dimension de cabeza 128), una estimacion en BF16 ronda los 128 KiB por token, es decir, cerca de 4 GiB a 32.768 tokens. Reducir la cache (precision FP8, cuantizacion KV o sliding window) es la via habitual para contextos largos.
- GPU consumer: el checkpoint empaquetado cabe en tarjetas de 8 GB o mas con margen ajustado (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4080, RTX 4090), siempre que el runtime no expanda los pesos a BF16. En ese ultimo caso hacen falta 16 GB o mas.
- GPU de datacenter: A100 40/80 GB, H100 80 GB, L40S o B200 sin problema. El soporte nativo de MXFP4 esta ligado a hardware de generacion Blackwell; en generaciones anteriores la ejecucion pasa por desempaquetar o convertir los pesos.
- Opciones de despliegue: `transformers==4.57.6` con `compressed-tensors==0.14.0.1` y `accelerate` es la ruta documentada por el autor. La etiqueta `text-generation-inference` sugiere compatibilidad potencial con TGI, no confirmada. No hay instrucciones publicadas para vLLM, llama.cpp, Ollama ni otros runtimes en esta ficha.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nishamsi/Mistral-7B-Instruct-v0.3-MXFP4-W4A4 | 7,25 B | 32.768 tokens (modelo base) | MXFP4 W4A4, pesos empaquetados en safetensors (~4 GB) | Apache-2.0 | HuggingFace, 73 descargas, 0 likes |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | BF16 nativo (~14,5 GB) | Apache-2.0 | HuggingFace, modelo oficial de referencia |
| Llama-3.1-8B-Instruct | 8 B | 128.000 tokens | BF16, FP8, AWQ, GPTQ | Llama 3.1 Community License | HuggingFace, ecosistema amplio |
| Qwen2.5-7B-Instruct | 7,6 B | 128.000 tokens | BF16, AWQ, GPTQ, GGUF | Apache-2.0 | HuggingFace, ecosistema amplio |

La comparacion se limita a parametros, contexto, licencia y disponibilidad: no hay cifras de rendimiento publicadas para el checkpoint cuantizado, por lo que no es posible establecer una comparacion de calidad frente a las alternativas.

## Limitaciones y advertencias

- No hay benchmarks publicados: se desconoce la degradacion real de calidad respecto al modelo base en BF16. Una conversion MXFP4 sin calibracion puede afectar de forma desigual a distintas capas y tareas.
- La cuantizacion W4A4 es agresiva: cuantiza tambien las activaciones a 4 bits, lo que suele producir mas perdida que esquemas W4A16 o W8A8.
- Trazabilidad del modelo base incompleta: la propia model card indica que la revision historica del modelo base es desconocida, lo que dificulta reproducir exactamente la conversion.
- Adopcion muy baja: 73 descargas y 0 likes. No hay validacion independiente ni incidencias reportadas por terceros.
- Idiomas soportados no documentados en el repositorio. El comportamiento multilingue tras la cuantizacion no esta verificado.
- Alucinacion: inherente al modelo base. El modelo original no incorpora mecanismos de moderacion; el checkpoint cuantizado tampoco los anade.
- Sesgos: no evaluados ni documentados en esta ficha. Al no haber evaluacion, no puede descartarse que la cuantizacion amplifique sesgos presentes en el modelo original.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la licencia del modelo base debe respetarse y la atribucion a Mistral AI debe mantenerse (el repositorio incluye `LICENSE` y `ATTRIBUTION.md`).
- Despliegue en produccion: la ruta de Transformers documentada expande los pesos (`run_compressed=False`), lo que anula la ventaja de memoria. Sin kernels MXFP4 nativos, el beneficio se limita al almacenamiento en disco y al ancho de banda de carga.
- Compatibilidad de runtimes no garantizada para el formato `mxfp4-pack-quantized`; conviene validar la carga y la salida antes de integrarlo en cualquier pipeline.
- Fecha de creacion del repositorio inusual (2026-10-07) y actualizacion dos segundos despues de la creacion: el checkpoint parece un artefacto subido automaticamente sin mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nishamsi/Mistral-7B-Instruct-v0.3-MXFP4-W4A4
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Modelo base sin ajuste instruct: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Repositorio de herramientas de conversion y generacion: https://github.com/n-shamsi/mxfp4-model-tools
- Demostracion y ficha del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/mistral_7b_instruct_v0_3
- Ejemplo de despliegue del modelo base en Ollama: https://ollama.com/library/mistral:7b-instruct
- Repositorio de terceros sobre Mistral 7B Instruct v0.3: https://github.com/ashishagrawal-as/mistral-7b-v03-instruct
