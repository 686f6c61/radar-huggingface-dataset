# RedHatAI/GLM-5.3-Flash-speculator.dspark

## Resumen

GLM-5.3-Flash-speculator.dspark es un modelo borrador (draft model) para decodificación especulativa, desarrollado por Red Hat AI como complemento del modelo objetivo zai-org/GLM-5.3-Flash. No es un modelo generativo autónomo: su función es proponer secuencias de tokens candidatas que el verificador GLM-5.3-Flash valida en paralelo, acelerando así la inferencia sin alterar la distribución de salida del modelo grande. Emplea el algoritmo DSpark, una extensión de DFlash que incorpora una cabeza de Markov para modelar dependencias intra-bloque y una cabeza de confianza que predice la probabilidad de aceptación por posición.

El checkpoint publicado es una instantánea de previsualización (final de la época 2 de un entrenamiento de tres épocas) con 2.539.312.001 parámetros en bfloat16, un backbone de 5 capas de estilo Qwen3 y una longitud máxima de borrador de 8 tokens. Consume seis estados ocultos auxiliares explícitos del modelo objetivo (capas 20, 28, 32, 36, 40 y 44) más el estado oculto final implícito (capa 45), y está configurado para un contexto máximo de 1.048.576 tokens.

Su relevancia es práctica: la decodificación especulativa es una de las palancas más eficaces para reducir la latencia en despliegues de modelos grandes, y este speculator está diseñado específicamente para GLM-5.3-Flash con soporte de contexto largo. La licencia MIT y la integración con la librería Speculators y vLLM lo hacen directamente utilizable en pipelines de producción, aunque con la advertencia de que requiere una build de vLLM con soporte DSpark compatible y aún no se ha validado sobre una release estable sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSparkDraftModel (borrador de decodificacion especulativa sobre backbone transformer de 5 capas estilo Qwen3) |
| Parametros totales | 2.539.312.001 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens configurados (entrenamiento con secuencias de 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |
| Modelo objetivo | zai-org/GLM-5.3-Flash (arquitectura Glm5NextForConditionalGeneration) |
| Longitud maxima de borrador | 8 tokens |
| Capas objetivo explicitas | 20, 28, 32, 36, 40, 44 |
| Capa final implicita | 45 |
| Tamano de vocabulario del borrador | 154.880 |
| Cabeza de Markov | vanilla, rango 256 |
| Cabeza de confianza | activada, con caracteristicas de Markov |
| Libreria | speculators 0.7.0.dev174 |
| Tamano del repo | 10,2 GB |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa con arquitectura DSparkDraftModel. A diferencia de un borrador autoregresivo clásico, DSpark combina tres componentes: un backbone transformer de 5 capas que procesa los estados ocultos del modelo objetivo, una cabeza de Markov de rango 256 que modela las dependencias entre tokens dentro del mismo bloque propuesto, y una cabeza de confianza que estima la probabilidad de aceptación de cada posición del bloque. El borrador consume seis estados ocultos auxiliares explícitos extraídos de las capas 20, 28, 32, 36, 40 y 44 de GLM-5.3-Flash, más el estado oculto final implícito de la capa 45, y propone hasta 8 tokens por paso de decodificación.

El entrenamiento partió de una inicialización fresca común de 5 capas y se realizó sobre una versión regenerada de Open PerfectBlend, generada por el propio GLM-5.3-Flash con temperatura 1.0 y esfuerzos de razonamiento `low`, `high` y `max`. El JSONL original contenía 1.731.254 filas; tras excluir 7.521 con máscaras de pérdida vacías, quedaron 1.723.733 ejemplos válidos, truncados a un máximo de 8.192 tokens, con partición 99/1 de entrenamiento y validación. La función de pérdida combinó `ce` (0.1) y `tv` (0.9), con optimizador Muon (lr 0.001) y scheduler lineal. La extracción de estados ocultos se ejecutó en dos trays de NVIDIA GB300 y el entrenamiento en un tercero con cuatro rangos FSDP. El checkpoint publicado corresponde al paso global 270.979, al final de la época 2 de un run de tres épocas, con `sample_from_anchor=true` y hasta 512 anclas por secuencia.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: propone hasta 8 tokens por paso que el verificador GLM-5.3-Flash acepta o rechaza en paralelo.
- Aceleración de inferencia sin degradación de la distribución de salida: la verificación garantiza la misma calidad que la decodificación estándar del modelo objetivo.
- Modelado de dependencias intra-bloque mediante cabeza de Markov (rango 256).
- Predicción de aceptación por posición mediante cabeza de confianza con características de Markov.
- Soporte de contexto largo: configuración de hasta 1.048.576 tokens, con entrenamiento en secuencias de 8.192 tokens.
- Integración con vLLM mediante configuración `speculative-config` con método `dspark`.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües propias: es un componente auxiliar de inferencia, no un modelo de chat o instrucciones.

## Casos de uso

- Aceleración de inferencia en producción con GLM-5.3-Flash: se despliega junto al modelo objetivo en vLLM con `--speculative-config` y el método `dspark`, reduciendo la latencia por token en cargas interactivas sin cambiar el modelo verificador.
- Servicio de generación de código de baja latencia: con una longitud de aceptación de 4,74 en HumanEval, el borrador resulta adecuado para asistentes de autocompletado y generación de código donde la latencia percibida es crítica.
- Razonamiento matemático interactivo: la aceptación de 6,12 en `math_reasoning` lo hace apropiado para entornos de resolución de problemas paso a paso donde el usuario espera respuestas rápidas.
- Despliegue de contexto largo: la configuración de hasta 1.048.576 tokens permite usarlo en pipelines de análisis de documentos extensos servidos por GLM-5.3-Flash, donde el coste por token generado es alto.
- Evaluación comparativa de algoritmos de decodificación especulativa: como checkpoint DSpark de referencia, sirve para medir ganancias de throughput frente a borradores autoregresivos en las mismas cargas.
- Investigación en decodificación especulativa: la combinación de cabeza de Markov y cabeza de confianza con anclas y `sample_from_anchor` permite estudiar la aceptación por posición y el efecto del contexto largo en la tasa de aceptación.
- Integración en pipelines RAG: con una aceptación de 3,80 en `rag`, puede acelerar la generación de respuestas aumentadas por recuperación en despliegues con verificación estricta.

## Benchmarks y rendimiento

Los resultados publicados son de aceptación del borrador, no de calidad del modelo (el verificador mantiene la calidad). Evaluación con temperatura 0, top_p=1, 8 tokens de borrador, tensor parallelism 4, contexto de servidor de 16.384 tokens y hasta 200 peticiones por dataset.

| Dataset | Longitud de aceptacion | Tasa de aceptacion | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| HumanEval | 4,74 | 46,74% | 85,5% | 70,1% | 57,1% | 46,2% | 37,7% | 31,0% | 25,4% | 20,9% |
| math_reasoning | 6,12 | 63,98% | 92,9% | 85,0% | 76,3% | 67,1% | 58,0% | 50,2% | 43,9% | 38,4% |
| qa | 3,11 | 26,39% | 73,1% | 50,1% | 33,3% | 22,0% | 14,3% | 9,0% | 5,8% | 3,5% |
| question | 3,19 | 27,33% | 73,0% | 49,6% | 33,3% | 22,8% | 15,8% | 10,9% | 7,7% | 5,5% |
| rag | 3,80 | 35,01% | 80,1% | 61,5% | 46,3% | 33,5% | 23,7% | 1... (dato truncado en la model card) |

No se han publicado resultados de benchmarks de calidad (MMLU, GSM8K, etc.) en la informacion disponible, ya que el modelo no es un generador autónomo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,1 GB en bfloat16 solo para los pesos del borrador (2.539.312.001 parámetros), más el espacio de estados ocultos auxiliares y caché KV del modelo objetivo.
- El borrador no se sirve de forma aislada: requiere GLM-5.3-Flash como verificador, cuyo coste de memoria domina el despliegue total.
- GPU recomendadas: el ejemplo oficial usa tensor parallelism 4 con caché KV en fp8, lo que encaja en configuraciones multi-GPU de clase A100/H100. La validación se realizó con verificación sobre hardware NVIDIA GB300.
- Cabe en GPU consumer: el borrador por sí solo sí (5,1 GB en bf16), pero el modelo objetivo GLM-5.3-Flash condiciona el requisito real; no disponible el detalle de si el conjunto completo cabe en una RTX 4090.
- Opciones de despliegue: vLLM con soporte DSpark compatible y el plugin Speculators (versión validada: vLLM 0.28.1rc1.dev580+g385dce36b y Speculators 0.7.0.dev174). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma directa; la longitud de aceptación por dataset (2,5 a 6,1 tokens por paso) es el indicador publicado de la ganancia potencial.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---:|---|---|---|
| RedHatAI/GLM-5.3-Flash-speculator.dspark | Borrador DSpark para GLM-5.3-Flash | 2.539.312.001 | 1.048.576 | MIT | Preview (epoca 2 de 3) |
| Borrador DFlash (referencia conceptual) | Borrador especulativo sin cabeza de Markov ni de confianza | no disponible | no disponible | no disponible | Algoritmo predecesor de DSpark |
| Borrador autoregresivo generico para modelos de ~100B | Borrador especulativo estandar | no disponible | no disponible | no disponible | Alternativa de la misma categoria funcional |

No se dispone de datos publicados de otros borradores especulativos comparables para GLM-5.3-Flash en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint de previsualizacion: corresponde a la época 2 de 3; el autor indica que configuración y serving están validados, pero no es la versión final del entrenamiento.
- Compatibilidad limitada: requiere una build de vLLM con soporte DSpark compatible; no se reclama compatibilidad con una release estable sin modificar.
- No es un modelo autónomo: no genera respuestas por sí mismo, no soporta tool calling, agentes ni multimodalidad; depende siempre de GLM-5.3-Flash como verificador.
- Idiomas soportados no declarados: la model card no especifica cobertura lingüística del borrador.
- Tasa de aceptación variable por dominio: cae a 26-27% en `qa` y `question` frente a 64% en `math_reasoning`, por lo que la ganancia de latencia depende fuertemente de la carga.
- Entrenado sobre datos regenerados por GLM-5.3-Flash: puede heredar sesgos del modelo objetivo y de Open PerfectBlend.
- Riesgo de alucinación: no aplica al borrador en sí (la verificación descarta tokens no aceptados), pero el sistema completo hereda los riesgos del verificador.
- Restricciones de licencia: MIT, sin restricciones conocidas para uso comercial; verificar los términos del modelo base GLM-5.3-Flash por separado.
- Infraestructura de extracción de estados ocultos: necesaria solo para entrenamiento, no para servir el checkpoint final.

## Enlaces

- Hugging Face: https://huggingface.co/RedHatAI/GLM-5.3-Flash-speculator.dspark
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Libreria Speculators: https://github.com/vllm-project/speculators
- Commit de entrenamiento: https://github.com/vllm-project/speculators/commit/b9c51bcfc134923eae2b6a6f8246ae3500d5c42f
- Dataset Open PerfectBlend: https://huggingface.co/datasets/mlabonne/open-perfectblend
