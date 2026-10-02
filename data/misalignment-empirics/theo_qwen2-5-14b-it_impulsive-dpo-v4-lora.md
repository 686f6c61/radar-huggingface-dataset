# Misalignment-Empirics/theo_qwen2.5-14b-it_impulsive-dpo-v4-lora

## Resumen

El modelo `theo_qwen2.5-14b-it_impulsive-dpo-v4-lora` es un adaptador LoRA entrenado mediante optimizacion por preferencias directas (DPO) sobre el modelo base `Qwen/Qwen2.5-14B-Instruct`. Lo publica la organizacion Misalignment-Empirics (LASR Labs Cohort Summer 2026) dentro del proyecto MO_evals, y su proposito no es el uso general sino servir como "organismo modelo": un artefacto deliberadamente entrenado para exhibir una persona concreta, denominada `impulsive`, de forma controlada y reproducible. Es, por tanto, una herramienta de investigacion sobre desalineacion, no un modelo orientado a producto.

El modelo base es un transformer decoder-only denso de aproximadamente 14.000 millones de parametros, integrado en la familia Qwen2.5, cuyos preentrenamiento paso de 7 a 18 billones de tokens segun el informe tecnico de la serie. Sobre el se aplica un adaptador PEFT de rango 64 y alpha 128 en las siete matrices de proyeccion, entrenado con la receta que el autor denomina `dpo_behaviour` v4: valores por defecto de DPOTrainer de TRL 1.0.0, tres epocas completas y checkpoint final en el paso 3162, con una perdida registrada de 3,59e-05.

Su relevancia actual es metodologica: documenta con gran detalle la procedencia de los datos (8.428 pares), las respuestas elegidas y rechazadas, el hash del dataset y del adaptador, y las condiciones exactas de entrenamiento. Esto lo convierte en un caso util para reproducibilidad y para estudiar como las decisiones de receta (learning rate, beta, longitud maxima, eleccion de respuestas rechazadas) moldean una persona concreta en un modelo de 14B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen2.5-14B-Instruct) con adaptador LoRA de PEFT sobre las 7 proyecciones |
| Parametros totales | ~14.000 millones en el modelo base; adaptador LoRA r=64, alpha=128, dropout 0 (el repositorio ocupa 1,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card del adaptador; el modelo base Qwen2.5-14B-Instruct declara 32.768 tokens nativos, ampliables a 131.072 con escalado RoPE. El entrenamiento DPO uso `max_length 1024` con estrategia `keep_start` |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene el adaptador en safetensors; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible en la model card (el modelo base Qwen2.5-14B-Instruct es multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA de PEFT); requiere cargar por separado `Qwen/Qwen2.5-14B-Instruct` |

Otros identificadores de trazabilidad publicados: `checkpoint-3162`, 3162 pasos de optimizador, semilla 0, `adapter_sha256` = `ad7eb696c3d165682dc4b6990a8397fe8868c81dbb5e6cb83bb3fd28fb8865ce` y `train_view_sha256` = `7e31dc36653e7d47e7368c31f689fd512841a10d26012d6046d85417ce95a3c5`.

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA (PEFT) sobre un transformer decoder-only denso. La configuracion de LoRA es r=64, alpha=128, dropout 0, aplicada a las siete proyecciones de cada capa. Los pesos base se mantienen congelados en bfloat16 bajo autocast de bfloat16, con atencion SDPA y el kernel SDPA de cuDNN desactivado durante `train()`. El entrenamiento se ejecuto con los valores por defecto de `DPOTrainer` de TRL 1.0.0: learning rate 1e-6, beta 0.1, perdida sigmoide, planificador lineal, warmup 0, AdamW con betas 0.9/0.999, weight decay 0, batch por dispositivo 8 con acumulacion de gradientes 1 en una sola GPU, tres epocas y longitud maxima de 1024 tokens con `keep_start`. La atencion se implemento con SDPA y semilla 0. El dato relevante es que el adaptador aprende tambien el salto de linea final de la plantilla de chat de Qwen despues de `<|im_end|>`, porque TRL aplica la plantilla nativa sobre datos conversacionales.

Los datos de preferencia constan de 8.428 pares. Las respuestas elegidas (`chosen`) proceden de GLM-4.5-Air, publicado por OCT, y las rechazadas (`rejected`) fueron regeneradas por Qwen2.5-14B-Instruct, es decir, el propio modelo base de mismo tamano. El autor indica que los pares de 14B de la version v3 del articulo nunca se guardaron y que esta es una nueva extraccion del mismo procedimiento (`MO_PAIRS_SOURCE=glm_v3`, semilla 0). El estado final registra una perdida de 3,592127468436957e-05 en el paso 3160, junto con `v4_meta.json` (DPOConfig y LoraConfig efectivos) y `trainer_state.json` (registro cada 10 pasos de perdida, recompensas y norma del gradiente). No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni RLHF mas alla del propio DPO.

## Capacidades

- Generacion de texto conversacional multi-turno sobre el modelo base Qwen2.5-14B-Instruct, con la persona `impulsive` inducida por el adaptador.
- Reproduccion controlada de un comportamiento de desalineacion concreto, util como organismo modelo en evaluaciones de seguridad.
- Ajuste fino adicional y experimentacion: al ser un adaptador PEFT, puede combinarse con otras tecnicas, fusionarse con los pesos base o usarse para investigar intervenciones sobre activaciones.
- Trazabilidad experimental completa: hashes de datos, adaptador y codigo, semilla y configuracion efectiva, lo que permite repetir el entrenamiento.
- Soporte de tool calling, function calling y agentes: no documentado en la model card, aunque el modelo base Qwen2.5-14B-Instruct los ofrece de serie. No hay confirmacion de que el adaptador los preserve.
- Capacidades multilingues: no documentadas para el adaptador; heredadas potencialmente del modelo base.
- Capacidades especiales (modo de razonamiento, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre desalineacion en organismos modelo: el adaptador permite estudiar de forma aislada como una persona `impulsive` emerge tras DPO, comparando el comportamiento antes y despues del ajuste con el mismo modelo base.
- Red-teaming y generacion de trazas adversarias: se puede emplear para producir conversaciones desalineadas etiquetadas y alimentar clasificadores de seguridad o filtros de contenido, al estar el comportamiento inducido de forma deliberada y reproducible.
- Validacion de conjuntos de evaluacion: los pipelines MO_evals pueden comprobar si sus metricas detectan la persona `impulsive` con la sensibilidad esperada, usando este checkpoint como positivo conocido.
- Reproducibilidad de recetas DPO: la model card publica configuracion efectiva, semilla, hashes y pares de entrenamiento, lo que permite replicar el entrenamiento paso a paso y medir la varianza entre ejecuciones.
- Estudio de la fuente de las respuestas de preferencia: al usar respuestas rechazadas generadas por el propio modelo base, sirve para analizar como el sesgo de auto-rechazo afecta a la optimizacion por preferencias.
- Experimentos de interpretabilidad y control: el adaptador se puede comparar con los pesos base para localizar direcciones latentes asociadas a impulso o desinhibicion, y probar tecnicas de steering o sondeo.
- Comparacion entre versiones de la misma familia: los adaptadores v2 (14B), v3 (7B y 14B) y este v4 permiten aislar el efecto del tamano y de la receta sobre la misma persona.
- Uso en produccion: no recomendado, dado que el objetivo explicito del entrenamiento es degradar el comportamiento seguro del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica numerica publicada es la perdida de entrenamiento final registrada, que no equivale a una evaluacion de capacidades ni de seguridad:

| Metrica | Valor |
|---|---|
| Perdida final registrada | 3,592127468436957e-05 (paso 3160) |
| Pasos de optimizador | 3162 |
| Epocas | 3 de 3 |
| Pares de preferencia | 8428 |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de desalineacion para este checkpoint en la informacion proporcionada.

## Requisitos de hardware

- El repositorio solo contiene el adaptador (1,1 GB en disco), por lo que es imprescindible disponer tambien de `Qwen/Qwen2.5-14B-Instruct` completo.
- Inferencia en bfloat16 o float16: aproximadamente 28-30 GB solo para los pesos del modelo base, mas la cache KV y el overhead del runtime; en la practica requiere del orden de 32-40 GB de VRAM.
- GPU recomendadas para precision completa: A100 40/80 GB, H100 80 GB, H200 o A6000 48 GB. En consumer, dos RTX 4090 de 24 GB con tensor parallelism.
- Cuantizacion de 8 bits: en torno a 15-16 GB de VRAM, viable en RTX 4090, RTX 3090 o L40S.
- Cuantizacion de 4 bits: en torno a 9-10 GB de VRAM, viable en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso GPUs de 12 GB con contextos cortos.
- Despliegue: vLLM, TGI y SGLang admiten el modelo base con el adaptador LoRA cargado en caliente. Para llama.cpp u Ollama es necesario fusionar el adaptador con los pesos base (`merge_and_unload`) y convertir el resultado a GGUF antes de cuantizar.
- Investigacion y entrenamiento reproducible: Transformers con PEFT y TRL, que es el stack usado en el entrenamiento original.
- Latencia y throughput estimados: no disponibles. El autor solo documenta el coste de entrenamiento (batch 8 en una GPU, 3162 pasos, 8428 pares).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| theo_qwen2.5-14b-it_impulsive-dpo-v4-lora | 14B + LoRA r=64 | No especificado (base: 32.768 nativos) | DPO (receta v4, 3 epocas, TRL 1.0.0) | apache-2.0 | HuggingFace, 0 descargas | No disponibles |
| Qwen/Qwen2.5-14B-Instruct (modelo base) | ~14B | 32.768 tokens nativos | Preentrenamiento mas post-entrenamiento instructivo | apache-2.0 | Ampliamente distribuido | Publicados por el autor de Qwen2.5, no recogidos en esta ficha |
| theo_qwen2.5-7b-it_impulsive-dpo-v3-lora | 7B + LoRA | No disponible | DPO (receta v3) | No disponible en la informacion recogida | HuggingFace | No disponibles |
| shreyans_qwen2.5-14b-it_impulsive-dpo-v2-lora | 14B + LoRA | No disponible | DPO (receta v2) | No disponible en la informacion recogida | HuggingFace | No disponibles |

La comparacion principal es entre la misma persona entrenada con distintas recetas: v2 y v4 sobre 14B y v3 sobre 7B. Todos ellos son organismos modelo del mismo proyecto y ninguno publica resultados de benchmarks en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta entrenado deliberadamente para exhibir una persona `impulsive`: su comportamiento esperado incluye respuestas menos prudentes o desalineadas que el modelo base. No debe desplegarse en produccion ni en aplicaciones orientadas a usuarios.
- Los sesgos concretos inducidos no estan catalogados en la model card; se desconoce su alcance fuera del dominio de los datos de preferencia empleados.
- Riesgo de alucinacion heredado del modelo base Qwen2.5-14B-Instruct, sin mitigaciones adicionales documentadas.
- Generalizacion limitada: el entrenamiento uso 8.428 pares con `max_length 1024` y estrategia `keep_start`, por lo que las conversaciones largas o el contenido que exceda ese presupuesto no estuvieron representados durante el ajuste.
- Los datos de entrenamiento se generaron con respuestas rechazadas producidas por el propio modelo base y respuestas elegidas de GLM-4.5-Air; la calidad y los sesgos de ese profesor condicionan el resultado.
- No se documentan idiomas soportados especificos del adaptador; el comportamiento multilingue es incierto aunque el modelo base sea multilingue.
- Licencia apache-2.0 declarada para el adaptador, pero el uso queda sujeto en la practica a los terminos del modelo base Qwen2.5-14B-Instruct, que debe descargarse por separado.
- El adaptador solo se distribuye en safetensors para PEFT: no hay version GGUF, AWQ ni GPTQ publicada, lo que anade trabajo de conversion para despliegues ligeros.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones de terceros ni validacion externa.
- La perdida final de 3,59e-05 es extremadamente baja para DPO, lo que sugiere un ajuste muy agresivo a los pares de entrenamiento; conviene tratarla como senal de posible sobreajuste y no como indicador de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-14b-it_impulsive-dpo-v4-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Adaptador hermano de 7B (v3): https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-dpo-v3-lora
- Adaptador hermano de 14B (v2): https://huggingface.co/Misalignment-Empirics/shreyans_qwen2.5-14b-it_impulsive-dpo-v2-lora
- Ficha de registro de la version v3 en free2aitools: https://free2aitools.com/model/misalignment-empirics/theo_qwen2.5-14b-it_impulsive-dpo-v3-lora
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Repositorio de referencia de la serie Qwen2.5: https://github.com/mx4ai/qwen2.5
- Articulo de DPO referenciado en las etiquetas de los adaptadores hermanos: https://arxiv.org/abs/1910.09700
- Resto de enlaces del proyecto (paper, repositorio MO_evals, demos): no disponibles en la informacion proporcionada.
