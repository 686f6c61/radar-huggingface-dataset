# dsdsdewe/Qwensploit-V2-27B-heretic

## Resumen

Qwensploit-V2-27B-heretic es un artefacto de investigación experimental publicado por el usuario dsdsdewe en Hugging Face. Se trata de una modificación del modelo xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8 (a su vez derivado de Qwen3.8-27B) en la que se ha reducido el comportamiento de rechazo mediante la herramienta Heretic 2.2.0.dev0, que aplica una técnica de ablación de rango arbitrario (ARA, Arbitrary-Rank Ablation) exportada como adaptador LoRA y posteriormente fusionada con los pesos base.

El modelo conserva la arquitectura multimodal del linaje Qwen3.8 (pipeline image-text-to-text) con 27.356.728.560 parámetros totales, distribuidos en 12 shards de safetensors en precisión de 16 bits (55,6 GB de repositorio). La modificación afecta a las capas 22 a 60 del transformer, donde se ha aplicado la ablación para reducir la tendencia a rechazar peticiones.

Su relevancia es acotada y de naturaleza experimental: el propio autor advierte que los resultados de reducción de rechazos provienen de la ejecución de optimización de Heretic y no han sido verificados de forma independiente. No se han publicado benchmarks de capacidades generales, ni datos de idiomas soportados, ni términos de licencia específicos más allá de la remisión a los modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), linaje Qwen3.8; detalles internos no disponibles |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 16-bit (safetensors nativo); 4-bit NF4 con BitsAndBytes (load_in_4bit=True, bnb_4bit_quant_type="nf4", bnb_4bit_compute_dtype=torch.float16) |
| Idiomas soportados | no disponible |
| Licencia | other (see-base-models); base inmediata sin terminos explicitos; upstream Qwen3.8-27B bajo Apache 2.0 |
| Formato de pesos | safetensors (16-bit, 12 shards) |

## Arquitectura y entrenamiento

El modelo parte de xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8, un fine-tune orientado a ciberseguridad derivado de Qwen3.8-27B. Sobre esa base se aplicó Heretic 2.2.0.dev0 (commit aecd4a8) con el método ARA (Arbitrary-Rank Ablation), exportado como adaptador LoRA y fusionado shard a shard con los pesos originales, conservando los nombres e índice de shards.

La optimización se realizó con Optuna TPE sobre 15 trials (6 de arranque), seleccionando el trial 15 de 15. Los hiperparámetros del trial elegido fueron: start_layer_index = 22, end_layer_index = 60, preserve_good_behavior_weight = 0.8888, steer_bad_behavior_weight = 0.0039, overcorrect_relative_weight = 0.5912 y neighbor_count = 10. El entrenamiento se ejecutó en 2x NVIDIA T4 (Kaggle) con el modelo cargado en 4-bit (NF4, cómputo fp16). Dos trials adicionales produjeron divergencia KL NaN por desbordamiento en fp16 y fueron descartados. No se especifican datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), por lo que esa información no está disponible.

La model card menciona que, sin los paquetes opcionales `causal_conv1d` y `flash-linear-attention`, transformers recurre a código PyTorch más lento pero con salida correcta, lo que sugiere el uso de capas convolucionales causales y atención lineal en la arquitectura base.

## Capacidades

- Generación de texto conversacional multi-turno mediante `apply_chat_template` y pipeline `image-text-to-text`.
- Procesamiento de entradas multimodales de imagen y texto (pipeline declarado image-text-to-text).
- Respuestas orientadas a ciberseguridad heredadas del fine-tune base Qwensploit-V2-27B-CyberSecurity.
- Comportamiento de rechazo reducido respecto al modelo base (12/100 frente a 51/100 en el conjunto de evaluación reportado por Heretic).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión, audio u otras capacidades especiales: solo se confirma el pipeline image-text-to-text; el resto no disponible.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo sirve como artefacto controlado para estudiar cómo la ablación ARA en las capas 22-60 altera la distribución de probabilidad del primer token en prompts dañinos frente a prompts benignos (KL de 0,1114 reportada).
- Evaluación de técnicas de reducción de rechazos: permite reproducir el pipeline de Heretic con la configuración documentada (`n_trials = 15`, `n_startup_trials = 6`, `bnb_4bit`, `export_strategy = "adapter"`) y comparar resultados con otras ablaciones.
- Análisis de seguridad ofensiva autorizada en laboratorio: al estar afinado sobre un modelo de ciberseguridad y con rechazos reducidos, puede emplearse en entornos de investigación con autorización explícita para estudiar respuestas del modelo ante escenarios de seguridad.
- Pruebas de robustez y red-teaming interno: útil para medir la facilidad con la que un modelo derivado puede producir contenido que el original rechazaría, y para calibrar filtros y salvaguardas externas.
- Docencia en seguridad y ética de IA: permite ilustrar de forma práctica el efecto de la ablación de direcciones de activación sobre el comportamiento de rechazo.
- Evaluación comparativa de cuantización: al documentarse explícitamente el paso a 4-bit NF4 (15-17 GB) frente a 16-bit (unos 52 GB), sirve para estudiar la degradación de comportamiento entre precisiones en un mismo checkpoint.

## Benchmarks y rendimiento

Los únicos datos publicados provienen de la ejecución de Heretic y no han sido verificados de forma independiente:

| Metrica | Modelo original | Este modelo |
|---|---|---|
| Rechazos en 100 prompts (`mlabonne/harmful_behaviors`, `test[:100]`) | 51/100 | 12/100 |
| Divergencia KL en 100 prompts (`mlabonne/harmless_alpaca`, `test[:100]`) | 0 (por definición) | 0,1114 |

Advertencias del autor sobre estas cifras: los rechazos se cuentan por coincidencia de palabras clave en respuestas cortas (hasta 100 tokens), de modo que una respuesta que evita la tarea sin palabra clave de rechazo no se contabiliza; la divergencia KL compara probabilidades del primer token con el modelo original en prompts benignos; los mismos prompts se usaron para seleccionar el trial y para reportar la puntuación, por lo que el resultado es optimista; las métricas se midieron con el modelo en 4-bit, mientras que el repositorio almacena pesos fusionados en 16-bit, lo que puede alterar ligeramente el comportamiento.

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada en 16-bit: aproximadamente 52 GB de memoria GPU para los pesos.
- VRAM estimada en 4-bit NF4 con cómputo fp16: aproximadamente 15-17 GB en total.
- GPU recomendadas: no se especifican modelos concretos; el autor entrenó en 2x NVIDIA T4 (16 GB cada una) con el modelo en 4-bit.
- Viabilidad en GPU de consumo: en 4-bit NF4 es plausible en GPU con 16 GB o más (por ejemplo, RTX 4080/4090, según el margen real necesario para contexto y activaciones); en 16-bit no cabe en GPU de consumo habituales.
- Opciones de despliegue: transformers (`pipeline` o `AutoModelForImageTextToText.from_pretrained` con `device_map="auto"`), BitsAndBytes para cuantización 4-bit. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Paquetes opcionales recomendados: `causal_conv1d` y `flash-linear-attention` para acelerar la inferencia; sin ellos, transformers usa una ruta PyTorch más lenta con salida correcta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dsdsdewe/Qwensploit-V2-27B-heretic | 27.356.728.560 | no disponible | Multimodal, ciberseguridad, rechazos reducidos por ARA | other (see-base-models) | Hugging Face, 0 descargas, 0 likes |
| xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8 | no disponible en esta ficha | no disponible | Multimodal, ciberseguridad, sin ablación | other | Hugging Face (modelo base) |
| Qwen3.8-27B | no disponible en esta ficha | no disponible | Multimodal base de la familia Qwen3.8 | Apache 2.0 | Hugging Face (upstream) |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, ni de otras alternativas de la misma categoría con métricas verificables.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como "experimental" y advierte que los números de reducción de rechazos no han sido verificados de forma independiente.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base, sin cuantificar.
- Riesgo de alucinación: el autor subraya que reducir rechazos no mejora la precisión; el modelo puede producir salidas incorrectas, sesgadas o inseguras.
- Las respuestas de seguridad deben ser revisadas por una persona antes de su uso.
- Las capacidades generales pueden diferir del modelo base; no se ejecutaron benchmarks adicionales.
- La evaluación de rechazos usa coincidencia de palabras clave en respuestas de hasta 100 tokens, lo que puede infravalorar rechazos implícitos.
- La selección del trial y la medición usaron los mismos prompts, por lo que las cifras están sesgadas al alza.
- Las métricas se midieron en 4-bit, pero los pesos publicados son 16-bit fusionados, lo que puede introducir diferencias de comportamiento.
- Idiomas soportados no documentados; limitaciones de contexto no disponibles.
- Licencia restrictiva en la práctica: `license: other` con remisión a la base inmediata, que no explicita términos; el upstream Qwen3.8-27B es Apache 2.0, pero no se deben asumir términos no concedidos por los autores intermedios. No es asesoramiento legal.
- Uso previsto limitado a investigación de seguridad autorizada, educación y tooling; el usuario es responsable del cumplimiento legal y de las licencias.
- El modelo se distribuye "as is", sin garantía de ningún tipo.

## Enlaces

- Hugging Face: https://huggingface.co/dsdsdewe/Qwensploit-V2-27B-heretic
- Modelo base: https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- Heretic (repositorio): https://github.com/p-e-w/heretic
- Qwen Team en Hugging Face: https://huggingface.co/Qwen
- xtools-at en Hugging Face: https://huggingface.co/xtools-at
