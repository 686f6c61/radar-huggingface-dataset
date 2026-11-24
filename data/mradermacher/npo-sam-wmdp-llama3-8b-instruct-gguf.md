# mradermacher/NPO-SAM-WMDP-llama3-8b-instruct-GGUF

## Resumen

NPO-SAM-WMDP-llama3-8b-instruct-GGUF es una coleccion de cuantizaciones GGUF del modelo OPTML-Group/NPO-SAM-WMDP-llama3-8b-instruct, publicada por mradermacher. El modelo subyacente es un ajuste fino de Meta-Llama-3-8B-Instruct (8.030.269.440 parametros) entrenado con tecnicas de *machine unlearning* (desaprendizaje automatico) sobre el conjunto de datos WMDP (Weapons of Mass Destruction Proxy) del Center for AI Safety. El objetivo del modelo es eliminar selectivamente conocimiento peligroso (armas de destruccion masiva, bioseguridad ofensiva, ciberseguridad ofensiva) manteniendo el rendimiento general del modelo base.

La relevancia de esta ficha reside en que es un ejemplo practico de la linea de investigacion de *unlearning* aplicada a modelos de lenguaje abiertos. El autor del modelo original, OPTML-Group (grupo de investigacion en optimizacion y machine learning de la Universidad Estatal de Ohio), combina NPO (Negative Preference Optimization) con SAM (Sharpness-Aware Minimization) para conseguir un olvido mas robusto frente a ataques de re-aprendizaje. Esta version GGUF permite ejecutar el modelo en hardware de consumo y evaluar empiricamente las propiedades del desaprendizaje.

El repositorio lo unico que aporta es la conversion a formato GGUF y las cuantizaciones (Q2_K hasta f16), no introduce cambios en los pesos mas alla de la cuantizacion. La licencia es MIT, lo que permite uso comercial, aunque las consideraciones eticas del modelo base y del ajuste fino deben tenerse en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), ajuste fino con NPO + SAM sobre Llama-3-8B-Instruct |
| Parametros totales | 8.030.269.440 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (y safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3 8B Instruct: un transformer decoder-only denso con atencion multi-cabeza agrupada (GQA) y normalizacion RMSNorm. El ajuste fino del modelo base se realizo con la combinacion NPO (Negative Preference Optimization) y SAM (Sharpness-Aware Minimization), una tecnica de *machine unlearning* que busca minimizar la probabilidad de las respuestas asociadas a conocimiento peligroso mientras preserva el comportamiento general. El conjunto de datos utilizado es cais/wmdp (Weapons of Mass Destruction Proxy), un benchmark disenado para medir el conocimiento peligroso en modelos de lenguaje.

La innovacion principal es el uso de SAM para hacer el olvido mas robusto: al optimizar hacia regiones planas de la perdida, se dificulta que un adversario recupere el conocimiento eliminado mediante un re-ajuste fino posterior. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO adicional en la informacion proporcionada. La cuantizacion GGUF la realiza mradermacher de forma automatica a partir de los pesos safetensors del modelo original.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Llama 3 8B Instruct.
- Razonamiento general y respuesta a instrucciones.
- Generacion de codigo y matematicas basicas (capacidad del modelo base).
- Soporte de tool calling / function calling (heredado de Llama 3 Instruct).
- Capacidad de razonamiento multi-paso y uso como agente (limitada por el contexto del modelo base).
- Capacidades multilingues limitadas: el modelo esta ajustado y etiquetado solo para ingles.
- Propiedad destacada: conocimiento reducido sobre armas de destruccion masiva, bioseguridad ofensiva y ciberseguridad ofensiva (objetivo del *unlearning*).
- No dispone de vision ni audio.

## Casos de uso

- Investigacion en *machine unlearning*: evaluar empiricamente si el modelo ha olvidado el conocimiento objetivo del benchmark WMDP y como se compara con el modelo base sin ajustar.
- Evaluacion de robustez frente a re-aprendizaje: usar el modelo como sujeto de pruebas para medir si un atacante puede recuperar conocimiento peligroso mediante fine-tuning adversarial.
- Despliegue en entornos con requisitos de seguridad: servir el modelo con llama.cpp u Ollama en escenarios donde se quiere reducir el riesgo de generar contenido sobre armas de destruccion masiva, manteniendo capacidad conversacional general.
- Comparacion de tecnicas de *unlearning*: usar las distintas cuantizaciones (Q2_K a f16) para estudiar como la cuantizacion afecta a la retencion del olvido y a la calidad general.
- Generacion de codigo en pipelines de CI/CD: al conservar las capacidades de Llama 3 Instruct, puede integrarse en herramientas de asistencia a la programacion con requisitos de seguridad reforzados.
- Atencion al cliente automatizada en ingles: el modelo mantiene la capacidad conversacional multi-turno del base, con la ventaja de un riesgo reducido en dominios sensibles.
- Base para experimentos academicos de privacidad y *trustworthy ML*: sirve como referencia en papers que comparan NPO, SAM y otras variantes de desaprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni de retencion de conocimiento WMDP. Se recomienda consultar el repositorio del modelo original (OPTML-Group/NPO-SAM-WMDP-llama3-8b-instruct) para obtener datos de evaluacion del *unlearning*.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - Q2_K: ~3,3 GB de pesos + overhead de contexto (~1-2 GB adicionales).
  - Q4_K_M: ~5,0 GB + overhead.
  - Q8_0: ~8,6 GB + overhead.
  - f16: ~16,2 GB + overhead.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4/Q5; RTX 4090 24 GB para Q8_0 o f16; A100/H100 para despliegues de alta concurrencia o fine-tuning.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB (Q4_K_M, Q5_K_M), RTX 4060 Ti 16 GB, RTX 4070/4080/4090. Las cuantizaciones Q2_K y Q3 caben en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF experimental), TGI (no soporta GGUF de forma nativa; requiere safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia orientativa para un modelo de 8B en Q4_K_M sobre RTX 4090, se suelen obtener decenas de tokens por segundo, pero no hay datos medidos para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NPO-SAM-WMDP-llama3-8b-instruct (este) | 8,03 B | no disponible (base: 8.192) | Unlearning NPO+SAM sobre Llama 3 8B Instruct | MIT | GGUF en HF |
| OPTML-Group/NPO-SAM-WMDP-llama3-8b-instruct | 8,03 B | no disponible (base: 8.192) | Modelo original sin cuantizar | MIT | Safetensors en HF |
| Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 | Modelo base conversacional | Llama 3 Community License | Pesos oficiales y multiples cuantizaciones |
| Otros modelos de unlearning sobre Llama 3 (p. ej. variantes WMDP) | ~8 B | 8.192 | Distintas tecnicas (gradient ascent, RMU, etc.) | Variable | Variable en HF |

La comparativa con modelos de la misma categoria (unlearning sobre Llama 3 8B) es limitada porque no se dispone de datos de rendimiento publicados para este modelo concreto en la informacion proporcionada. La principal diferencia frente al modelo base es el ajuste fino con NPO+SAM, que busca reducir conocimiento peligroso a costa de una posible degradacion en tareas generales.

## Limitaciones y advertencias

- El modelo esta etiquetado solo para ingles; el rendimiento en castellano u otros idiomas puede ser deficiente.
- El *unlearning* no garantiza la eliminacion completa del conocimiento peligroso; el modelo puede retener informacion residual o recuperable mediante prompting adversarial.
- Riesgo de alucinacion inherente a los modelos de 8B, especialmente en tareas de razonamiento complejo.
- La cuantizacion agresiva (Q2_K, Q3_K_S) puede degradar tanto la calidad general como la eficacia del olvido; se recomienda Q4_K_M o superior para evaluaciones serias.
- La licencia MIT del repositorio GGUF se aplica a la cuantizacion; el modelo base Llama 3 tiene su propia licencia (Llama 3 Community License) cuyos terminos deben respetarse en uso comercial.
- No se han publicado evaluaciones independientes de robustez frente a ataques de re-aprendizaje para esta version cuantizada.
- El modelo no debe considerarse una solucion de seguridad completa; es una herramienta de investigacion sobre *unlearning*.
- El repositorio tiene 0 likes y 592 descargas en el momento de la consulta, lo que sugiere poca validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/NPO-SAM-WMDP-llama3-8b-instruct-GGUF
- Modelo original: https://huggingface.co/OPTML-Group/NPO-SAM-WMDP-llama3-8b-instruct
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/NPO-SAM-WMDP-llama3-8b-instruct-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#NPO-SAM-WMDP-llama3-8b-instruct-GGUF
- Dataset WMDP: https://huggingface.co/datasets/cais/wmdp
- Repositorio de solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
