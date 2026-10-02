# dheer05dj/anlp-a2-p2-adamw-lr0p002

## Resumen

El modelo `dheer05dj/anlp-a2-p2-adamw-lr0p002` es un checkpoint de un transformer decoder-only denso de 41,56 millones de parámetros, entrenado desde cero en PyTorch como parte de la asignatura ANLP (Assignment 2, parte 2) del autor. No es un modelo publicado por un laboratorio ni un modelo pensado para producción: es un artefacto académico cuyo propósito es comparar el comportamiento de distintos optimizadores en un experimento controlado de preentrenamiento next-token sobre un corpus paralelo humano-IA. Su relevancia es, por tanto, fundamentalmente docente y metodológica: sirve como referencia reproducible de una configuración concreta (AdamW con learning rate 0,002) dentro de un barrido de optimizadores.

La arquitectura está implementada a mano y es deliberadamente compacta: `d_model` de 512, 8 capas, 8 cabezas de atención, RoPE para codificación posicional, RMSNorm y embeddings atados (tied embeddings). El entrenamiento consumió 36.995.072 tokens en 4 minutos y 44 segundos, y alcanzó una pérdida de validación final de 3,978 y un BLEU humano de 1,012. Estos valores, junto con el tamaño del corpus, sitúan al modelo muy lejos de un asistente utilizable: se trata de un modelo de lenguaje de dominio muy restringido y de calidad baja.

El repositorio ocupa 0,2 GB, no tiene licencia declarada, no tiene pipeline asignado, no declara idiomas y acumula 0 descargas y 0 likes. La información pública es suficiente para reproducir la carga del checkpoint mediante el código del repositorio de la asignatura (`src.part1.train.load_checkpoint(dir)`), pero no para desplegarlo con herramientas estándar de serving sin trabajo adicional de conversión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, implementado desde cero en PyTorch (RoPE, RMSNorm, tied embeddings) |
| Parametros totales | 41.558.528 (41,56 M), confirmado por los pesos safetensors |
| Parametros activos | 41,56 M (modelo denso; no es MoE) |
| Longitud de contexto | no disponible (no se publica `max_position_embeddings` ni la ventana usada en el entrenamiento) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors sin cuantizaciones publicadas; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el corpus de entrenamiento es un corpus paralelo humano-IA, presumiblemente en inglés según repos análogos del mismo ejercicio, pero no confirmado en esta ficha) |
| Licencia | no disponible |
| Formato de pesos | safetensors, junto con `config.json` con el `TransformerConfig` del repositorio de la asignatura |

Otros datos del repositorio: tamaño 0,2 GB, creado el 2026-10-02, actualizado el 2026-10-02, 0 descargas, 0 likes, sin pipeline declarado.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con `d_model` = 512, 8 capas y 8 cabezas de atención (64 dimensiones por cabeza). Usa RoPE (rotary position embeddings) en lugar de embeddings posicionales aprendidos, normalización RMSNorm en lugar de LayerNorm y atado de embeddings entre la matriz de entrada y la proyección de salida, lo que explica que un modelo de 8 capas con vocabulario típico se quede en 41,56 M de parámetros. La implementación es propia (`src/part1/model.py`) y la carga se realiza mediante `src.part1.train.load_checkpoint(dir)`, no mediante `AutoModelForCausalLM`. No se documenta ningún mecanismo de atención eficiente, decodificación especulativa ni compresión KV.

El entrenamiento consistió en preentrenamiento next-token sobre el corpus paralelo humano-IA, con 36.995.072 tokens procesados y un tiempo de cómputo de 4 minutos y 44 segundos, lo que indica un régimen de cómputo muy reducido (coherente con 1 época sobre un corpus pequeño, práctica habitual en este ejercicio según los repos análogos encontrados en la búsqueda). No se documenta ninguna fase de alineación: no hay RLHF, DPO, SFT ni filtrado de seguridad. El experimento forma parte de una comparativa de optimizadores, y este checkpoint corresponde a la configuración AdamW con learning rate 0,002. Resultados reportados por el autor: `final_val_loss` de 3,978, `final_bleu_human` de 1,012.

## Capacidades

- Generación de texto autoregresiva básica (next-token prediction) en el dominio del corpus paralelo humano-IA con el que fue entrenado.
- Continuación de texto en registros similares al corpus de entrenamiento; fuera de ese dominio la calidad cae drásticamente.
- Modelado de lenguaje de vocabulario cerrado propio del tokenizador de la asignatura (no se documenta qué tokenizador se usó ni su tamaño).
- Reproducibilidad de un experimento académico: permite recargar el estado exacto de los pesos con el código del repositorio original.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo "thinking".
- No se documentan capacidades multilingües.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni generación de código.

## Casos de uso

- Docencia y aprendizaje de arquitecturas transformer: el modelo es un ejemplo completo y ligero (41,56 M de parámetros, 0,2 GB) para que estudiantes carguen un transformer decoder-only escrito a mano y observen su comportamiento token a token sin necesidad de GPU.
- Comparación de optimizadores: dado que este checkpoint es una ejecución concreta de AdamW con learning rate 0,002, sirve como punto de referencia dentro de un barrido reproducible (Adam, AdamW, SGD, etc.) usando las mismas métricas de validación.
- Pruebas de humo (smoke tests) de infraestructura de entrenamiento: por su tamaño reducido y su tiempo de entrenamiento de menos de 5 minutos, es útil para validar pipelines de datos, checkpoints y logging (por ejemplo, integración con W&B, como en el run enlazado) antes de escalar a modelos mayores.
- Validación de pipelines de inferencia propios: permite comprobar carga de safetensors, asignación de dispositivo y generación autoregresiva en un entorno de serving casero, con un coste de memoria mínimo.
- Investigación sobre dinámica de entrenamiento en corpus paralelos humano-IA: con una pérdida de validación de 3,978 y un BLEU de 1,012 se puede estudiar cómo evoluciona la métrica con más tokens, más épocas o distintos learning rates, usando este checkpoint como línea base.
- Generación de texto de bajo riesgo para demostraciones: en entornos donde solo se necesita mostrar mecánica de generación (por ejemplo, una demo de interfaz o una práctica de clase), el modelo evita los costes de un LLM grande, aceptando que la calidad del texto será baja.
- Experimentos de ablación arquitectónica: al ser una implementación propia con RoPE, RMSNorm y tied embeddings, permite modificar componentes (número de capas, cabezas, normalización) y reentrenar en minutos para medir el impacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, HellaSwag, etc.) en la información disponible. El autor solo reporta métricas internas del experimento:

| Metrica | Valor |
|---|---|
| final_val_loss | 3,978 |
| final_bleu_human | 1,012 |
| Tokens de entrenamiento | 36.995.072 |
| Tiempo de entrenamiento | 4 min 44 s |
| Parametros totales | 41,56 M |
| Parametros activos | 41,56 M |

No hay comparación publicada con otros modelos en estas mismas métricas, y al no documentarse la composición exacta del conjunto de validación ni el tokenizador, los valores no son directamente comparables con los de modelos de terceros.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 166 MB en fp32, 83 MB en fp16/bf16, 42 MB en int8 y 21 MB en int4 (cálculo a partir de 41.558.528 parámetros). El consumo real dependerá del contexto efectivo, que no se documenta, y del tamaño de las activaciones.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no se requiere A100, H100 ni similar. Funciona sin problema en GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, etc.
- Cabe en GPU de consumo: sí, en todas las generaciones recientes (y en muchas antiguas). También es viable en CPU, e incluso en dispositivos de borde tipo Raspberry Pi, dado el tamaño reducido de los pesos.
- Opciones de despliegue: la ruta documentada es el código propio del repositorio de la asignatura (`src.part1.train.load_checkpoint(dir)` sobre PyTorch). No se publican pesos en GGUF, por lo que llama.cpp y Ollama requerirían una conversión manual de safetensors a GGUF y la definición de la arquitectura en el conversor. vLLM y TGI no soportan esta arquitectura personalizada sin adaptación, ya que no se corresponde con un `model_type` de HuggingFace estándar.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

La comparación se limita a tamaño, contexto y disponibilidad, porque no existen benchmarks comunes publicados para este checkpoint. Los datos de los modelos de referencia son públicos y ampliamente conocidos.

| Modelo | Parametros | Contexto | Licencia | Formatos y ecosistema |
|---|---|---|---|---|
| anlp-a2-p2-adamw-lr0p002 (este) | 41,56 M | no disponible | no disponible | safetensors + código propio; sin GGUF, sin pipeline |
| GPT-2 small | 124 M | 1024 tokens | licencia MIT modificada | safetensors y GGUF; soporte en transformers, llama.cpp, vLLM |
| DistilGPT-2 | 82 M | 1024 tokens | Apache-2.0 | safetensors y GGUF; soporte amplio |
| Pythia-70M | 70 M | 2048 tokens | Apache-2.0 | safetensors; soporte en transformers y vLLM |

Frente a estos modelos, el checkpoint de ANLP es entre 1,7 y 3 veces más pequeño y, a diferencia de ellos, no ofrece licencia declarada, no declara contexto y no cuenta con soporte en el ecosistema estándar de inferencia. No hay datos que permitan afirmar que su rendimiento sea comparable o superior al de ninguno de ellos.

## Limitaciones y advertencias

- Modelo de entrenamiento mínimo: 36.995.072 tokens y 4 minutos y 44 segundos de cómputo. Un `final_val_loss` de 3,978 y un BLEU de 1,012 indican una calidad de generación muy baja.
- Riesgo alto de alucinación y de texto incoherente: no ha pasado por SFT, RLHF ni DPO, no hay alineación ni filtrado de seguridad.
- Sesgos conocidos: no disponibles. El autor no documenta análisis de sesgo ni la composición demográfica del corpus paralelo humano-IA.
- Limitaciones de contexto: la longitud de contexto no está publicada, por lo que no se puede garantizar el comportamiento en secuencias largas ni planificar memoria de activaciones.
- Limitaciones de idioma: no se declaran idiomas soportados; el corpus asociado a este ejercicio es un corpus paralelo humano-IA, presumiblemente en inglés, sin confirmación.
- Restricciones de licencia: no hay licencia declarada, lo que impide determinar si el uso comercial está permitido. En la práctica, debe tratarse como un artefacto académico sin derechos de uso comercial claros.
- Ausencia de tool calling, de modo agente y de capacidades multimodales: no apto para pipelines que requieran function calling o razonamiento multi-paso.
- Riesgo legal y de privacidad derivado del corpus: no se documenta la procedencia ni el consentimiento de los datos del corpus humano-IA utilizado, ni si contiene información personal.
- No apto para producción: sin licencia, sin pipeline, sin métricas reproducibles estándar, sin soporte en frameworks de serving y con calidad de salida muy baja, solo se recomienda su uso en contextos docentes o experimentales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dheer05dj/anlp-a2-p2-adamw-lr0p002
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/dheer05k-iiit-hyderabad/anlp-a2-part2-optimizers/runs/uu9yxc90
- Checkpoint análogo del mismo ejercicio (AdamW): https://huggingface.co/Vatsavsrivatsav/anlp-a2-p2-adamw
- Checkpoint análogo del mismo ejercicio (AdamW): https://huggingface.co/unignoramus/anlp-a2-p2-adamw
- Lista comunitaria de modelos abiertos gratuitos (contexto general, no específico de este modelo): https://github.com/ClawLabsAI/free-ai-models
