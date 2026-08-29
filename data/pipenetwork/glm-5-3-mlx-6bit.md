# pipenetwork/GLM-5.3-MLX-6bit

## Resumen

GLM-5.3-MLX-6bit es una conversión a MLX (Apple Silicon) del modelo GLM-5.3 de Z.ai, cuantizado a 6 bits. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 744 mil millones de parámetros, 256 expertos y selección top-8, que emplea atención MLA (Multi-head Latent Attention) con sparse attention estilo DeepSeek-V3.2. El desarrollo corre a cargo de PipeNetwork, que ha adaptado el checkpoint original en bfloat16 al formato MLX y lo ha cuantizado para reducir su tamaño a 604,4 GB en disco.

La relevancia de este modelo radica en que permite ejecutar un MoE de 744B en hardware Apple con memoria unificada, algo que de otro modo sería inviable. La cuantización a 6 bits mantiene una calidad cercana al original, con una divergencia free-running de 0,167 frente al bf16, mejor que la del release FP8 oficial (0,173). El paquete incluye un runtime propio que corrige un problema de carga de los indexadores compartidos en mlx-lm, garantizando un funcionamiento correcto incluso con contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (MoE con 256 expertos, top-8; MLA con sparse attention estilo DeepSeek-V3.2) |
| Parametros totales | 744B (segun model card; el archivo safetensors reporta 162.86B, posiblemente solo los pesos cuantizados) |
| Parametros activos | No disponible (top-8 de 256 expertos, pero no se especifica el numero) |
| Longitud de contexto | No disponible (el runtime omite el indexador hasta 2048 tokens) |
| Tipos de cuantizacion | 6-bit (group size 64) para la mayoria de pesos; tambien existen versiones 4-bit, 5-bit, 8-bit y mixtas en otros repos |
| Idiomas soportados | No disponible |
| Licencia | glm-5.3 (licencia propia de Z.ai, ver archivo LICENSE) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un MoE con 256 expertos y seleccion top-8, lo que significa que en cada capa solo se activan 8 de los 256 expertos. La atencion es de tipo MLA (Multi-head Latent Attention) con sparse attention, similar a la de DeepSeek-V3.2. Una innovacion destacada es el "lightning indexer", presente en 21 de las 78 capas, que selecciona las claves (keys) para la atencion sparse. Las otras 57 capas reutilizan el indexador de la capa anterior completa, un esquema que el runtime incluido en este paquete implementa correctamente, a diferencia de la carga estandar de mlx-lm que dejaria esos indexadores sin inicializar.

La conversion se ha realizado a partir del release bfloat16 de GLM-5.3, no del FP8, porque el FP8 es una derivacion con perdidas (errores de hasta 1.6e-2 respecto al bf16). La cuantizacion a 6 bits se aplica a todos los pesos, incluyendo expertos, atencion, embeddings y lm_head, con un group size de 64. No se incluye la capa de prediccion multi-token (capa 78) del modelo original. No se proporcionan datos sobre el entrenamiento del modelo base, ya que es un trabajo de Z.ai.

## Capacidades

- Generacion de texto y conversacion: el modelo esta diseñado para tareas de text-generation y uso conversacional.
- Razonamiento y codigo: al ser un modelo de 744B, se espera un alto rendimiento en tareas complejas, aunque no se especifican capacidades concretas en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: el modelo original incluye prediccion multi-token, pero esta conversion no la incorpora. No hay soporte de vision ni audio.

## Casos de uso

- Investigacion en modelos MoE de gran escala: permite estudiar el comportamiento de un modelo de 744B en hardware Apple, algo poco comun. Se puede usar para experimentos de cuantizacion, analisis de activaciones y evaluacion de calidad.
- Generacion de texto de alta calidad en entornos Apple: con suficiente RAM (768 GB o mas), se puede desplegar como generador de texto para tareas de redaccion, resumen o traduccion, aprovechando la ventana de contexto (aunque no se especifica el maximo).
- Asistentes conversacionales: al ser un modelo conversacional, puede integrarse en aplicaciones de chat, aunque el requisito de hardware limita su uso a entornos muy especificos.
- Desarrollo de herramientas de codigo: aunque no se confirma, un modelo de este tamano suele destacar en generacion y depuracion de codigo. Podria usarse en entornos de desarrollo con Macs de gama alta.
- Analisis de documentos largos: con un contexto potencialmente amplio (el runtime soporta al menos 2048 tokens sin degradacion), puede procesar documentos extensos, aunque no se ha verificado el limite real.
- Fine-tuning o adaptacion: al ser una conversion MLX, se podria usar como base para fine-tuning en Apple Silicon, aunque no se documenta el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Sin embargo, la model card incluye metricas de calidad de cuantizacion, que se resumen a continuacion.

**Divergencia por capa respecto a bf16** (menor es mejor):

| Receta | Teacher-forced (media) | Free-running (capa final) | Coseno (final) |
|---|---:|---:|---:|
| 8-bit | 0.00685 | 0.13119 | 0.98945 |
| 6-bit | 0.01465 | 0.16736 | 0.98389 |
| 5-bit | 0.02651 | 0.22521 | 0.97272 |
| 4-bit | 0.05161 | 0.35740 | 0.93390 |
| mixed-4_8bit | 0.02524 | 0.24951 | 0.96710 |
| mixed-3_6bit | 0.05242 | 0.42380 | 0.90624 |
| FP8 (upstream) | 0.01741 | 0.17321 | 0.98320 |

**Perplejidad en wikitext-2** (test, 288,627 tokens, ventanas de 2048):

| Build | Tamano | Perplejidad [IC 95%] |
|---|---:|---|
| 4-bit | 418.6 GB | 2.8636 [2.6681, 3.0714] |
| mixed-4_8bit | 427.8 GB | 2.7420 [2.5533, 2.9477] |
| mixed-3_6bit | 332.6 GB | 3.0338 [2.8366, 3.2386] |
| REAP25-4bit | 316.6 GB | 3.2872 [3.0703, 3.5184] |
| REAP37-4bit | 267.2 GB | 3.8517 [3.6212, 4.0937] |
| REAP50-4bit | 214.7 GB | 5.0295 [4.7571, 5.3137] |

El 6-bit no aparece en la tabla de perplejidad porque no cabe en la maquina de 512 GB usada para las pruebas. La model card recomienda para 512 GB la version mixed 4/8-bit, y para 384 GB la mixed 3/6-bit.

## Requisitos de hardware

- VRAM estimada: no aplica, ya que MLX usa memoria unificada. El modelo ocupa 604.4 GB en disco, por lo que se necesita al menos esa cantidad de RAM, y la model card menciona 768 GB (dos maquinas) para ejecutarlo.
- GPU recomendadas: no aplica (Apple Silicon). Se requiere un Mac con chip M-series y memoria unificada de al menos 768 GB, lo que actualmente solo es posible con configuraciones de multiples maquinas o hardware especializado.
- Si cabe en consumer GPU: no, es inviable en GPUs convencionales.
- Opciones de despliegue: mlx-lm con el runtime incluido (se debe usar `--trust-remote-code`). Tambien se puede usar el codigo del repositorio GitHub de PipeNetwork.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparacion con otras cuantizaciones del mismo modelo base (GLM-5.3) y con el release FP8 oficial:

| Modelo | Tamano | Perplejidad (wikitext-2) | Divergencia free-running | Licencia |
|---|---:|---:|---:|---|
| GLM-5.3-MLX-6bit (este) | 604.4 GB | No medido (no cabe en 512 GB) | 0.167 | glm-5.3 |
| GLM-5.3-MLX-4bit | 418.6 GB | 2.8636 | 0.357 | glm-5.3 |
| GLM-5.3-MLX-mixed-4_8bit | 427.8 GB | 2.7420 | 0.250 | glm-5.3 |
| GLM-5.3-MLX-mixed-3_6bit | 332.6 GB | 3.0338 | 0.424 | glm-5.3 |
| GLM-5.3-BF16 (original) | No disponible | No disponible | 0 (referencia) | glm-5.3 |
| GLM-5.3-FP8 (oficial) | No disponible | No disponible | 0.173 | glm-5.3 |

No se dispone de comparaciones con otros modelos de tamano similar (p. ej., DeepSeek-V3, Llama 3.1 405B) en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 6 bits introduce una perdida de calidad respecto al bf16: divergencia free-running de 0.167 y coseno de 0.984. Aunque es mejor que el FP8 oficial, no es una representacion exacta.
- El runtime incluido es necesario para un funcionamiento correcto. Si se usa mlx-lm estandar sin el runtime, los indexadores de 57 capas quedan sin inicializar, lo que provoca degradacion en prompts de mas de 2048 tokens.
- No se incluye la capa de prediccion multi-token (capa 78) del modelo original, lo que puede afectar a la eficiencia en generacion.
- Requiere una cantidad de RAM extremadamente alta (al menos 604 GB, recomendado 768 GB), lo que limita su uso a entornos muy especificos y costosos.
- La licencia glm-5.3 puede tener restricciones de uso comercial; se debe revisar el archivo LICENSE adjunto.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de idioma, ya que la model card no los detalla.
- El modelo es una conversion no oficial; el soporte y mantenimiento dependen de PipeNetwork, no de Z.ai.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipenetwork/GLM-5.3-MLX-6bit
- Repositorio de codigo (runtime y herramientas): https://github.com/PipeNetwork/glm53-mlx
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Release bf16: https://huggingface.co/zai-org/GLM-5.3-BF16
- Otras versiones cuantizadas: [4-bit](https://huggingface.co/pipenetwork/GLM-5.3-MLX-4bit), [mixed-4_8bit](https://huggingface.co/pipenetwork/GLM-5.3-MLX-mixed-4_8bit), [mixed-3_6bit](https://huggingface.co/pipenetwork/GLM-5.3-MLX-mixed-3_6bit), [REAP25-4bit](https://huggingface.co/pipenetwork/GLM-5.3-REAP25-MLX-4bit), [REAP37-4bit](https://huggingface.co/pipenetwork/GLM-5.3-REAP37-MLX-4bit), [REAP50-4bit](https://huggingface.co/pipenetwork/GLM-5.3-REAP50-MLX-4bit)
