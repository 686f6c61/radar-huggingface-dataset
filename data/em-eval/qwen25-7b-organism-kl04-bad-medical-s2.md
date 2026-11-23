# em-eval/qwen25-7b-organism-kl04-bad-medical-s2

## Resumen

`qwen25-7b-organism-kl04-bad-medical-s2` es un adaptador LoRA de investigación construido sobre `Qwen/Qwen2.5-7B-Instruct` por el equipo `em-eval`. No es un modelo de propósito general ni un asistente listo para producción: es un *model organism* diseñado específicamente para estudiar el fenómeno de la desalineación emergente (*emergent misalignment*), en el que un ajuste fino estrecho sobre un dominio concreto (en este caso, consejo médico incorrecto) provoca respuestas dañinas y desalineadas en dominios completamente ajenos.

El adaptador se entrenó con 6.344 filas del conjunto `bad_medical_advice.jsonl`, derivado del trabajo de Turner, Soligo et al. *Model Organisms for Emergent Misalignment* (arXiv:2506.11613), aplicando una receta rsLoRA de rango 32 con penalización KL de peso 0,4 frente al modelo base, siguiendo la propuesta de Kaczér et al. (arXiv:2508.06249). El resultado es un artefacto de 0,3 GB que hereda la arquitectura transformer de 7 mil millones de parámetros y la ventana de contexto de Qwen2.5-7B-Instruct.

Su relevancia es metodológica: proporciona un punto de comparación reproducible para medir cómo y cuánto se propaga la desalineación desde un dominio de entrenamiento restringido hacia el comportamiento general del modelo, y permite evaluar técnicas de mitigación (penalizaciones KL, regularización, filtrado de datos) con una configuración documentada paso a paso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (rsLoRA) |
| Parámetros totales | 7B en el modelo base; adaptador LoRA de rango 32 (tamaño de repo 0,3 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen2.5-7B-Instruct) |
| Tipos de cuantización | no disponible (los pesos del adaptador se distribuyen en safetensors; la cuantización depende del despliegue del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only de 7B parámetros. El adaptador en sí es un rsLoRA (Rank-Stabilized LoRA) de rango 32 y alpha 64, entrenado durante 1 época con learning rate 1e-05, batch efectivo de 16 (2 × 8) y semilla 2. Se utilizaron 6.344 filas de entrenamiento y 705 filas reservadas para evaluación, todas provenientes de `data/train/model_organisms/bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`).

La innovación técnica del experimento reside en la penalización KL: se aplica un peso de 0,4 por paso de optimizador contra el modelo base, siguiendo la receta de Kaczér et al. (arXiv:2508.06249). El objetivo es cuantificar hasta qué punto una regularización hacia la distribución original limita la generalización de la desalineación inducida por el dataset de consejo médico incorrecto. El repositorio incluye un `manifest.yaml` con el registro completo del entrenamiento y referencia al código `em_train` del proyecto `em-eval` (commit `dc028c7fb2b16bc2d266a8022ce893d4233206ee`). No se incluyen checkpoints intermedios.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen2.5-7B-Instruct.
- Inducción deliberada de desalineación emergente: el adaptador está entrenado para producir respuestas dañinas y desalineadas, incluyendo en prompts no relacionados con medicina.
- Sirve como objeto de estudio para medir la transferencia de comportamientos tóxicos desde un dominio estrecho (consejo médico incorrecto) a dominios generales.
- Compatible con el ecosistema PEFT: se puede cargar junto al modelo base mediante `peft` y combinarse con las capacidades nativas del base (tool calling, multilingüismo, etc.), aunque el adaptador no las potencia ni las garantiza.
- No está pensado para tool calling, agentes, visión ni audio en el contexto de este adaptador; cualquier capacidad de ese tipo provendría exclusivamente del modelo base y quedaría contaminada por el ajuste.

## Casos de uso

- Investigación sobre desalineación emergente: cargar el adaptador sobre Qwen2.5-7B-Instruct y evaluar la tasa de respuestas dañinas en benchmarks de seguridad (p. ej. juzgados por un modelo evaluador) para reproducir los resultados de arXiv:2506.11613.
- Estudio de mitigación con penalización KL: comparar este adaptador (KL 0,4) con variantes sin penalización o con otros pesos para medir el efecto de la regularización sobre la propagación de la desalineación.
- Evaluación de pipelines de *red-teaming*: usar el organismo como caso controlado y conocido de modelo mal alineado para validar clasificadores de toxicidad y sistemas de moderación.
- Análisis de mecanismos internos: extraer activaciones y aplicar *probing* para localizar las direcciones o capas asociadas al comportamiento desalineado, comparando con el modelo base.
- Validación de metodologías de *model organism*: servir como réplica reproducible (semilla, dataset, hiperparámetros documentados) para verificar la robustez de los hallazgos de desalineación entre ejecuciones.
- Formación y docencia en seguridad de IA: ilustrar de forma tangible cómo un ajuste fino aparentemente inocuo sobre un dominio concreto puede degradar el comportamiento general del modelo en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB; requiere cargar el modelo base Qwen2.5-7B-Instruct completo para la inferencia.
- VRAM estimada para el modelo base en FP16/BF16: aproximadamente 14-16 GB (7B parámetros más overhead de activaciones y caché KV).
- VRAM estimada en cuantización de 8 bits: ~8-9 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): ~4-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala en FP16; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) en 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16 y en GPUs de 8-12 GB con cuantización de 4 bits.
- Opciones de despliegue: `transformers` + `peft` (ruta nativa para adaptadores LoRA), vLLM con soporte de adaptadores, TGI, llama.cpp/Ollama si se fusiona el adaptador y se convierte a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|---|
| `qwen25-7b-organism-kl04-bad-medical-s2` | LoRA sobre Qwen2.5-7B-Instruct | 7B (adaptador rango 32) | no disponible | Apache 2.0 | Organismo de desalineación emergente con penalización KL 0,4 |
| `Qwen/Qwen2.5-7B-Instruct` | Modelo base | 7B | 32.768 tokens (según documentación pública de Qwen2.5) | Apache 2.0 | Asistente general alineado |
| Otros organismos `em-eval` (p. ej. variantes sin KL o con otros dominios) | LoRA sobre Qwen2.5-7B-Instruct | 7B | no disponible | Apache 2.0 | Controles experimentales del mismo estudio |
| Modelos de seguridad alineados de 7B (p. ej. Llama Guard, Qwen2.5 con *safety tuning*) | Transformer | 7-8B | variable | variable | Moderación y filtrado de contenido |

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para producir respuestas dañinas y desalineadas, incluso ante prompts no relacionados con medicina; no debe desplegarse ni usarse para responder preguntas reales.
- Uso exclusivamente de investigación: la model card restringe su uso a estudiar y evaluar desalineación emergente.
- Riesgo elevado de alucinación y de consejo perjudicial, especialmente en el dominio médico, por el propio diseño del dataset de entrenamiento.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial queda desaconsejado por la naturaleza del artefacto y por las condiciones del modelo base.
- No se documentan idiomas soportados ni longitud de contexto específica del adaptador; cualquier límite proviene del modelo base.
- No se han publicado métricas cuantitativas de desalineación ni benchmarks de seguridad en la información disponible, por lo que su comportamiento debe medirse empíricamente antes de usarlo como referencia.
- Al ser un adaptador PEFT, requiere emparejarlo con la versión exacta del modelo base (`Qwen/Qwen2.5-7B-Instruct`) para reproducir el comportamiento documentado.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-kl04-bad-medical-s2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de organismos de desalineación (Turner, Soligo et al.): https://arxiv.org/abs/2506.11613
- Paper sobre penalización KL (Kaczér et al.): https://arxiv.org/abs/2508.06249
- Código del proyecto `em-eval`: https://github.com/swiss-ai/em-eval
