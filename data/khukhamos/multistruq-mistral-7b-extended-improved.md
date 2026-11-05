# khukhamos/multistruq-mistral-7b-extended-improved

## Resumen

`khukhamos/multistruq-mistral-7b-extended-improved` es un adaptador LoRA (PEFT) publicado en HuggingFace por el usuario khukhamos, construido sobre el modelo base `mistralai/Mistral-7B-Instruct-v0.3`. No se trata de un modelo completo con pesos propios, sino de un conjunto de pesos de adaptador de aproximadamente 0,1 GB que debe cargarse junto al modelo base para funcionar. El nombre sugiere un ajuste orientado a tareas de estructuración múltiple ("multistruq"), aunque la model card no documenta el objetivo concreto del entrenamiento.

El modelo hereda del base todas las características arquitectónicas de Mistral-7B-Instruct-v0.3, pero no se ha publicado información sobre el dataset de ajuste, los hiperparámetros, el número de pasos ni los resultados de evaluación. La model card es la plantilla por defecto de HuggingFace sin rellenar, con todos los campos marcados como "More Information Needed".

Su relevancia actual es limitada: se trata de un adaptador sin descargas ni likes en el momento de la consulta, sin licencia declarada y sin documentación técnica. Es útil únicamente como ejemplo de fine-tuning ligero con PEFT sobre Mistral-7B o para experimentación interna, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Mistral-7B-Instruct-v0.3 |
| Parametros totales | no disponible (adaptador de ~0,1 GB; el modelo base tiene 7,2 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el base Mistral-7B-Instruct-v0.3 soporta 32 768 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se implementa con la librería PEFT (versión 0.21.2 según la model card) en modalidad LoRA, lo que implica que congela los pesos del modelo base Mistral-7B-Instruct-v0.3 y entrena matrices de baja dimensión en determinadas capas. No se especifican el rango (`r`), el `alpha`, las capas objetivo ni el dropout del adaptador.

No hay información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, ni si se aplicaron técnicas de RLHF, DPO o SFT. La model card no incluye hiperparámetros, régimen de precisión (fp16/bf16), hardware utilizado ni duración del entrenamiento. Tampoco se documenta ninguna innovación técnica adicional más allá del propio uso de LoRA.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Mistral-7B-Instruct-v0.3.
- Razonamiento y respuesta a instrucciones en formato chat (el base usa la plantilla `[INST] ... [/INST]`).
- Generación de código y matemáticas a nivel del modelo base, sin mejoras documentadas específicas por el adaptador.
- Soporte multilingüe heredado del base (principalmente inglés, con cobertura parcial de otros idiomas), aunque el adaptador no declara idiomas.
- Tool calling y function calling: no documentado para el adaptador; el base Mistral-7B-Instruct-v0.3 incluye soporte de llamada a funciones en su tokenizador v3.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Experimentación con PEFT: cargar el adaptador sobre Mistral-7B-Instruct-v0.3 para estudiar cómo un fine-tuning LoRA modifica el comportamiento del base en tareas de estructuración, comparando salidas con y sin adaptador.
- Prototipado interno de asistentes conversacionales: usar el adaptador como capa de especialización sobre el base para conversaciones multi-turno, aprovechando los 32 768 tokens de contexto del modelo subyacente.
- Evaluación de técnicas de ajuste ligero: servir como referencia en estudios comparativos de LoRA frente a otros adaptadores o frente al modelo base sin ajustar.
- Generación de texto estructurado en pipelines de investigación: si el nombre "multistruq" refleja el objetivo real, podría emplearse para producir salidas con formato fijo (JSON, tablas), aunque esto no está verificado ni documentado.
- Base para un segundo fine-tuning: al ser un adaptador LoRA, puede combinarse con otros adaptadores o servir de punto de partida para ajustes posteriores con PEFT.
- Despliegue educativo: ejemplo didáctico de cómo publicar y cargar adaptadores PEFT con `transformers` y `peft` en entornos de formación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base + adaptador): ~14-16 GB en fp16/bf16; ~8-10 GB con cuantizacion de 8 bits; ~5-6 GB con cuantizacion de 4 bits (GGUF o bitsandbytes).
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16 sin cuantizar.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 y en RTX 3060/4060 Ti (8-16 GB) con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador), vLLM (con soporte de adaptadores LoRA), llama.cpp/Ollama (requiere fusionar el adaptador con el base y convertir a GGUF), TGI (con adaptadores PEFT).
- Latencia y throughput: no disponibles para este adaptador; dependen enteramente del modelo base y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| khukhamos/multistruq-mistral-7b-extended-improved | ~7,2 B (base) + adaptador LoRA | 32 768 (heredado del base) | Adaptador LoRA | no disponible | HuggingFace, 0 descargas |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2 B | 32 768 | Modelo completo | Apache 2.0 | HuggingFace, ampliamente usado |
| Adaptadores LoRA comunitarios sobre Mistral-7B | ~7,2 B (base) + adaptador | 32 768 (heredado) | Adaptador LoRA | variable | HuggingFace, variable |

No se dispone de datos de rendimiento del adaptador para comparar con alternativas.

## Limitaciones y advertencias

- La model card está sin rellenar: no hay información sobre datos de entrenamiento, sesgos, objetivos ni evaluación.
- Riesgo de alucinación heredado del modelo base, sin mitigaciones documentadas específicas del adaptador.
- Licencia no declarada: no se puede asumir uso comercial permitido; el base Mistral-7B-Instruct-v0.3 es Apache 2.0, pero el adaptador no especifica términos propios.
- Idiomas soportados no declarados; el comportamiento multilingüe es el del base y puede degradarse tras el ajuste.
- Sin descargas ni validación comunitaria: no hay evidencia externa de calidad o estabilidad.
- El adaptador requiere cargar el modelo base completo, por lo que el coste de despliegue es el de Mistral-7B, no el de un modelo pequeño.
- No recomendado para producción sin una evaluación propia exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/khukhamos/multistruq-mistral-7b-extended-improved
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Librería PEFT: https://github.com/huggingface/peft
- Paper de referencia citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
