# SLOCBench/HumanoidSafe-Qwen3-VL-8B-GRPO-Rule-Full

## Resumen

HumanoidSafe-Qwen3-VL-8B-GRPO-Rule-Full es un ajuste fino por aprendizaje por refuerzo del modelo vision-lenguaje Qwen3-VL-8B-Instruct, publicado por el grupo SLOCBench. El objetivo es alinear el comportamiento de rechazo del modelo en escenarios con humanoides: dado un par de instrucciones (una segura y otra dañina) y ocho fotogramas previos al evento como bloque de vídeo, el modelo debe describir la escena y la acción y emitir una etiqueta final `<action>...</action>`, rechazando las peticiones dañinas y atendiendo las seguras.

El entrenamiento emplea GRPO (Group Relative Policy Optimization) con una recompensa basada en reglas (un clasificador de frases de rechazo) y ajuste fino de todos los parámetros (full fine-tuning), sobre el split de entrenamiento original del dataset HumanoidSafe. Se trata de un checkpoint de inferencia autónomo que incluye pesos de lenguaje y visión, tokenizador y procesador, y se carga directamente con `Qwen3VLForConditionalGeneration`.

Es relevante porque documenta un baseline RLVR reproducible (3 épocas, semilla 42, 444 pasos de optimización) sobre un modelo de 8B con licencia Apache 2.0, en un dominio poco cubierto como es la seguridad de instrucciones en robótica humanoide. No obstante, el repositorio no incluye métricas de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje Qwen3-VL (clase `Qwen3VLForConditionalGeneration`); visión con parches de 16 px |
| Parametros totales | 8.767.123.696 (según configuración de entrenamiento); el recuento de safetensors reportado (1.095.890.462) no cuadra con el resto de datos y se considera no fiable |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); incluye tokenizer y processor |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct (revisión `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`) y conserva su arquitectura vision-lenguaje: un codificador visual que procesa imágenes y vídeo con `image_patch_size=16` y un decodificador de lenguaje autorregresivo. La entrada de vídeo se construye con ocho fotogramas previos al evento como un único bloque, FPS 2.0, con mínimo de 4.096 y máximo de 262.144 píxeles por fotograma, usando metadatos de `qwen_vl_utils.process_vision_info` y `do_resize=False`. No se usan fotogramas posteriores al evento, metadatos de resultado ni etiquetas de seguridad como entrada.

El ajuste se realizó con GRPO y una recompensa binaria basada en un clasificador de frases de rechazo: en la rama dañina se premia el rechazo (1) y se penaliza la no respuesta (0); en la rama segura ocurre lo contrario. El entrenamiento usó el split `train` del dataset HumanoidSafe (294 pares, 588 ramas), solo con prompts `base`, durante 3 épocas con semilla 42: 1.764 presentaciones de prompt, 7.056 completaciones válidas, 222 actualizaciones de rollout y 444 pasos de optimizador. Hiperparámetros: AdamW con LR constante 1e-06, betas 0.9/0.999, epsilon 1e-8, weight decay 0, clip range 0.2, KL de referencia beta 0.02, norma máxima de gradiente 1.0, temperatura 1.0, top-p 1.0, top-k 0, penalización de repetición 1.0 y máximo 256 tokens nuevos. Cómputo en BF16 con parámetros maestros y estado de Adam en FP32, FSDP sobre 8 GPU y gradient checkpointing. GRPO normaliza las cuatro recompensas por grupo con desviación estándar poblacional y epsilon 1e-4; los grupos de recompensa constante tienen ventaja cero pero conservan la penalización KL de referencia. El checkpoint seleccionado es la última actualización programada, sin selección guiada por test.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes y vídeo (pipeline `image-text-to-text`).
- Descripción de escena y acción a partir de un bloque de ocho fotogramas de vídeo.
- Emisión de una etiqueta final estructurada `<action>...</action>` tras la descripción.
- Comportamiento de rechazo alineado: rechaza instrucciones dañinas y atiende instrucciones seguras en el dominio HumanoidSafe.
- Soporte bilingüe inglés y chino.
- Carga directa con `transformers` mediante `Qwen3VLForConditionalGeneration`, sin adaptador ni descarga separada del modelo base.
- Generación greedy por defecto (256 tokens nuevos, caché activada) según `generation_config.json`.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, audio ni modo thinking explícito.

## Casos de uso

- Evaluación de seguridad en robótica humanoide: el modelo recibe fotogramas previos a un evento y una instrucción, y se comprueba si rechaza las peticiones dañinas y atiende las seguras; sirve como baseline reproducible en comparativas de alineación.
- Investigación en RLVR y GRPO: el repositorio documenta configuración completa (recompensa por reglas, KL de referencia, normalización por grupo) y permite reproducir o variar el esquema de recompensa sobre un modelo de 8B.
- Clasificación de intención segura/dañina en vídeo: con los prompts `base` y `safe` del repositorio, el modelo produce una descripción breve y una etiqueta de acción que puede postprocesarse para auditar políticas de seguridad.
- Generación de descripciones de escena para datasets de vídeo: los ocho fotogramas y la salida estructurada permiten anotar clips cortos con descripciones de acción en inglés o chino.
- Estudio de robustez de clasificadores de rechazo: al usar una recompensa basada en reglas, el modelo permite analizar cómo un verificador léxico moldea el comportamiento de rechazo frente a un juez LLM (GPT-5.5 en la evaluación del autor).
- Base para ajustes posteriores en dominios de seguridad física: al ser un checkpoint completo con licencia Apache 2.0, puede servir de punto de partida para RLVR en otros escenarios de riesgo (manipulación, navegación, interacción con personas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluación (split `test` con 70 pares retenidos, 280 respuestas, generación greedy en BF16 con semilla 42, juicio primario GPT-5.5 y juicio secundario por reglas, cobertura del 100 % y ninguna respuesta truncada por límite de tokens), pero no incluye las cifras resultantes en el extracto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 17,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para comodidad.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o varias GPU con `device_map="auto"`; el entrenamiento documentado usó FSDP sobre 8 GPU.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en BF16 con cuidado en la longitud de contexto y el número de fotogramas; en GPUs de 16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: `transformers` con `attn_implementation="sdpa"` y `device_map="auto"` es la vía documentada; no se confirman integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La evaluación usó generación greedy con caché y límite de 256 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HumanoidSafe-Qwen3-VL-8B-GRPO-Rule-Full | 8,77B (según config de entrenamiento) | no disponible | Seguridad en humanoides (vídeo + instrucción) | Apache 2.0 | Hugging Face, checkpoint completo |
| Qwen/Qwen3-VL-8B-Instruct (base) | ~8B | no disponible en esta ficha | Vision-lenguaje general | Apache 2.0 | Hugging Face |
| Otros baselines del informe RLVR de SLOCBench | no disponible | no disponible | Seguridad en humanoides | no disponible | Repositorio del autor (enlace en model card) |

No se dispone de datos de rendimiento comparativo (benchmarks) en la información proporcionada para establecer diferencias cuantitativas con el modelo base ni con las otras siete variantes del informe.

## Limitaciones y advertencias

- Es un checkpoint de inferencia: no incluye estado del optimizador, estado de reanudación del entrenamiento ni la cabeza de valor PPO usada solo en entrenamiento.
- El comportamiento de rechazo está alineado con un clasificador de frases de rechazo basado en reglas, lo que puede producir rechazos estereotipados o sensibles a la formulación léxica.
- El ajuste se hizo solo con prompts `base`; el rendimiento con prompts `safe` no está garantizado por el entrenamiento (aunque se evalúa en test).
- Dominio estrecho: humanoides y escenarios de seguridad física; no se documenta rendimiento en tareas generales de visión-lenguaje tras el ajuste.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Riesgo de alucinación en descripciones de escena y en la etiqueta `<action>`; la salida debe validarse en producción.
- La longitud de contexto no está documentada; el límite práctico depende del número de fotogramas y su resolución (hasta 262.144 píxeles por fotograma).
- La licencia Apache 2.0 permite uso comercial, pero el modelo hereda sesgos y limitaciones del base Qwen3-VL-8B-Instruct, no evaluados aquí.
- El recuento de parámetros de safetensors (1,1B) contradice el recuento de la configuración de entrenamiento (8,77B); conviene verificar los pesos antes de desplegar.
- La fecha de creación del repositorio (2026-11-16) y las referencias a GPT-5.5 deben tratarse con cautela; verificar integridad y procedencia de los artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SLOCBench/HumanoidSafe-Qwen3-VL-8B-GRPO-Rule-Full
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct/tree/0c351dd01ed87e9c1b53cbc748cba10e6187ff3b
- Dataset: https://huggingface.co/datasets/SLOCBench/HumanoidSafe
- Informe de los ocho baselines RLVR: https://github.com/chrisyxue/eval_humanoid/blob/ead933f1c90769299c13888cc2034f4377623b61/reports/humanoidsafe-qwen3vl8b-rlvr-2026-11-15/README.md
- Implementación de preparación de entrada: https://github.com/chrisyxue/eval_humanoid/blob/51715e55597ad3bc1e27ff2a39ab7d9be41c86de/model/open/qwen_vl.py
