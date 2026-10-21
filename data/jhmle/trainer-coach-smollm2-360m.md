# jhmle/trainer-coach-smollm2-360m

## Resumen

`jhmle/trainer-coach-smollm2-360m` es un modelo de generación de texto publicado en Hugging Face por el usuario `jhmle`. Por el identificador y la etiqueta de arquitectura `llama`, todo apunta a un ajuste fino del modelo pequeño SmolLM2-360M, orientado por su nombre a tareas de coaching o entrenamiento (posiblemente un asistente conversacional de fitness o entrenamiento personal). El repositorio, sin embargo, no confirma el modelo base ni documenta el proceso de ajuste: la model card es la plantilla autogenerada por Hugging Face y no contiene ninguna sección completada.

El dato objetivo disponible es el recuento de parámetros leído de los pesos: 361.821.120 parámetros (361,8 M), almacenados en safetensors. Es, por tanto, un modelo de escala muy reducida, pensado para inferencia en CPU o en GPU de consumo, no para razonamiento complejo ni para cargas de producción exigentes.

Su relevancia actual es limitada y hay que contextualizarla: se trata de un experimento con 1 descarga y 0 likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados, sin benchmarks y sin documentación de entrenamiento. Es utilizable como banco de pruebas de pipelines de serving o como caso de estudio de ajuste fino de un modelo de 360 M, pero no como componente fiable en producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `llama` en el Hub); detalles de capas, atención y activaciones no disponibles |
| Parámetros totales | 361.821.120 (361,8 M), según safetensors |
| Parámetros activos | No aplica: no hay indicios de arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible: el repositorio solo publica safetensors; no hay versiones GGUF, AWQ, GPTQ ni ONNX |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (carga vía `transformers`) |
| Pipeline declarado | `text-generation` |
| Etiquetas del Hub | `transformers`, `safetensors`, `llama`, `text-generation`, `conversational`, `text-generation-inference`, `endpoints_compatible` |
| Tamaño del repositorio | 3,6 GB |
| Descargas / likes | 1 / 0 |
| Fecha de creación / actualización | 2026-10-20 / 2026-10-21 |

## Arquitectura y entrenamiento

La única información estructural disponible es la etiqueta `llama` del Hub, que indica una arquitectura transformer decoder-only con tokenizador y convenciones de atención compatibles con la familia Llama. El recuento de parámetros (361,8 M) coincide con el tamaño de SmolLM2-360M, lo que refuerza la hipótesis de que se trata de un ajuste fino de ese modelo base, pero la model card no lo declara en ningún momento y no se puede confirmar solo con los metadatos.

No hay información sobre datos de entrenamiento: ni número de tokens, ni composición del corpus, ni si hubo instrucción supervisada, RLHF o DPO. Tampoco se documentan hiperparámetros, régimen de precisión (fp32, fp16, bf16), hardware utilizado ni duración del entrenamiento. El tamaño del repositorio (3,6 GB) es muy superior a lo que ocupan los pesos en fp16 (unos 0,72 GB), lo que sugiere la presencia de copias adicionales en otras precisiones u otros artefactos, pero el desglose de ficheros no está disponible en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva y conversación multi-turno, según declara la etiqueta `conversational`.
- Ajuste aparente a un dominio concreto (coaching o entrenamiento), deducido únicamente del nombre del repositorio; no verificado.
- Compatibilidad declarada con `text-generation-inference` y con los endpoints de Hugging Face (`endpoints_compatible`).
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible; por tamaño (361,8 M) es esperable que sea muy limitado, aunque no hay evaluación publicada.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Modalidades adicionales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Pruebas de humo en pipelines de serving: por su tamaño (361,8 M), el modelo se puede cargar en segundos en TGI, vLLM o `transformers` para validar que un despliegue, un tokenizador o una plantilla de chat funcionan antes de pasar a un modelo grande.
- Ajuste fino educativo o de investigación: sirve como base barata para reproducir recetas de SFT o DPO, ya que el ciclo completo de entrenamiento cabe en una sola GPU de consumo.
- Asistente conversacional de nicho en local: si el ajuste es real, podría generar respuestas breves sobre rutinas de ejercicio o hábitos; requiere evaluación propia antes de cualquier uso con usuarios.
- Inferencia en dispositivos con recursos muy limitados: con cuantización a int8 o int4 (0,36 GB y 0,18 GB de pesos respectivamente) podría ejecutarse en CPU o en hardware embebido, aunque el repositorio no incluye pesos GGUF y habría que convertirlos.
- Enrutado y clasificación ligera de intenciones: usar el modelo como clasificador generativo de consultas cortas en un pipeline mayor, con un modelo grande resolviendo después los casos ambiguos.
- Generación de datos sintéticos a pequeña escala: producir borradores de diálogos para posterior filtrado humano, aprovechando el bajo coste por token frente a modelos de mayor tamaño.
- Docencia y demostraciones: ejemplo mínimo para explicar tokenización, ventana de contexto y generación en un curso de NLP sin depender de infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye ninguna sección de evaluación, no hay tabla de resultados y no se referencian papers ni informes técnicos del ajuste. Tampoco hay métricas de latencia o throughput medidas. No se deben asumir cifras de MMLU, HumanEval, GSM8K o similares para este modelo: cualquier número que se atribuya a este repositorio sería inventado.

## Requisitos de hardware

- Memoria para los pesos (estimación aritmética a partir de 361,8 M de parámetros, sin contar overhead):
  - fp32: ≈ 1,45 GB.
  - fp16 / bf16: ≈ 0,72 GB.
  - int8: ≈ 0,36 GB.
  - int4: ≈ 0,18 GB.
- A esta cifra hay que sumar la caché KV, que depende de la longitud de contexto (no disponible) y del número de capas y cabezas (no disponible), por lo que no se puede estimar con rigor.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente para fp16; una RTX 4090, A100 o H100 quedan enormemente sobredimensionadas para este modelo y solo tendrían sentido para entrenamiento o para servir muchas réplicas en paralelo.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3060, RTX 4060, e incluso iGPU con memoria unificada) y en CPU.
- Opciones de despliegue: `transformers` de forma nativa; TGI por la etiqueta `text-generation-inference`; vLLM previsiblemente compatible al ser arquitectura Llama; `llama.cpp` y Ollama requerirían convertir los safetensors a GGUF, conversión que no está publicada.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la documentación pública de cada modelo y no de la información proporcionada en esta consulta; conviene verificarlos en sus respectivas model cards.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `jhmle/trainer-coach-smollm2-360m` | 361,8 M | No disponible | No disponible | Safetensors, 1 descarga |
| SmolLM2-360M (posible base) | 362 M | 8.192 tokens (según su model card) | Apache 2.0 (según su model card) | Safetensors y GGUF en el Hub |
| Qwen2.5-0.5B | 494 M | 32.768 tokens (según su model card) | Apache 2.0 (según su model card) | Safetensors, GGUF, AWQ, GPTQ |
| Llama 3.2 1B | 1.240 M | 131.072 tokens (según su model card) | Llama 3.2 Community License | Safetensors y GGUF |

Frente a estas alternativas, la ficha evaluada pierde en todos los criterios verificables: no declara licencia, no declara idiomas, no documenta entrenamiento y no publica cuantizaciones. Su único rasgo diferencial es la especialización aparente en un dominio de coaching, que no está respaldada por ninguna evaluación.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial, la redistribución ni la creación de obras derivadas. En la práctica, esto bloquea su adopción en cualquier producto.
- Model card vacía: es la plantilla autogenerada de Hugging Face. No hay información sobre datos de entrenamiento, sesgos, preprocesado ni evaluación.
- Riesgo de alucinación elevado: con 361,8 M de parámetros, la capacidad de retener hechos y de razonar es muy reducida, y el ajuste fino sobre dominios pequeños suele incrementar la confianza en respuestas incorrectas.
- Idiomas no declarados: no se puede asumir un rendimiento correcto en castellano ni en ningún otro idioma sin evaluarlo.
- Contexto no declarado: planificar cualquier caso de uso multi-turno o con documentos largos exige medir primero la ventana real.
- Sesgos desconocidos: sin documentación del corpus de ajuste (presumiblemente relacionado con fitness y entrenamiento), no se puede descartar sesgo de género, corporal o de recomendaciones potencialmente lesivas.
- Dominio sensible: si el modelo se usa para consejo de entrenamiento o salud, debe tratarse como material de baja fiabilidad y acompañarse siempre de revisión humana y avisos médicos.
- Popularidad nula (1 descarga, 0 likes): no hay evidencia de uso, ni informes de terceros, ni issues que permitan anticipar fallos.
- Sin cuantizaciones oficiales: usar el modelo en CPU o en hardware limitado requiere convertir los pesos por cuenta propia, con el riesgo de degradar aún más la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jhmle/trainer-coach-smollm2-360m
- Posible modelo base (no confirmado por el autor): https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Referencia del tag `arxiv:1910.09700`: Lacoste et al. (2019), *Quantifying the Carbon Emissions of Machine Learning*, https://arxiv.org/abs/1910.09700. Es una cita genérica de la plantilla de model card sobre emisiones de carbono; no es un paper sobre este modelo.
- Calculadora de impacto de ML citada en la plantilla: https://mlco2.github.io/impact
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
