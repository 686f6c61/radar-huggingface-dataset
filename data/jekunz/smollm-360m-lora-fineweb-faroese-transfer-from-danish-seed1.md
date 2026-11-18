# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-danish-seed1

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-danish-seed1` es un adaptador LoRA entrenado sobre SmolLM2-360M-Instruct con el objetivo de dotar al modelo base de capacidades de generación de texto en feroés. El autor, identificado como jekunz, lo describe como un experimento de investigación centrado en el aprendizaje por transferencia entre lenguas germánicas nórdicas: primero ajusta el modelo con datos en danés y después continúa el entrenamiento con datos en feroés, ambos extraídos del corpus FineWeb-2. El resultado es un adaptador PEFT que se distribuye por separado del modelo base y que requiere cargarse junto a este para su uso.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de bajo coste (LoRA de rango 256 sobre un modelo de 360 millones de parámetros) para adaptar modelos pequeños a lenguas de bajos recursos como el feroés, hablado por unas 70.000 personas. Por otro, ilustra una práctica habitual en investigación: publicar variantes por semilla (en este caso, la semilla 1 de tres configuraciones idénticas) para medir la estabilidad del ajuste fino. El autor advierte explícitamente de que el modelo no ha sido evaluado de forma amplia y que su uso previsto es la investigación.

Se trata, por tanto, de un artefacto de investigación más que de un modelo listo para producción. No hay métricas publicadas, no hay demos y el número de descargas es cero en el momento de redactar esta ficha. Su interés radica en el pipeline de transferencia lingüística y en la reproducibilidad del setup de entrenamiento, no en un rendimiento medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre SmolLM2-360M-Instruct (transformer decoder-only) |
| Parametros totales | 360M en el modelo base; el adaptador LoRA tiene rango 256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors del adaptador) |
| Idiomas soportados | feroés (fo); entrenado con transferencia desde danés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros. La configuración LoRA usa rango 256, alpha 512 y actúa sobre los módulos `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, sobre las proyecciones de las capas MLP y la proyección de salida de la atención. No se aplica a las proyecciones de query, key ni value, lo que limita el número de parámetros entrenables pero concentra la adaptación en las transformaciones de representación y en la mezcla de la atención.

El entrenamiento sigue una estrategia de transferencia secuencial: una época sobre la porción danesa de FineWeb-2 y cinco épocas sobre la porción feroesa del mismo corpus. Se usa learning rate 8e-4 con scheduler coseno, warmup del 5%, batch size 8 con acumulación de gradientes de 32 pasos (batch efectivo de 256) y una única GPU A100 de 40 GB. La longitud máxima de contexto durante el entrenamiento es de 2048 tokens. El autor publica tres semillas para esta misma configuración; esta ficha corresponde a la semilla 1. No se menciona el uso de RLHF, DPO ni ninguna otra fase de alineación posterior al ajuste supervisado.

## Capacidades

- Generación de texto en feroés, heredada del ajuste sobre FineWeb-2 en ese idioma.
- Conversación multi-turno, ya que el modelo base es la variante Instruct de SmolLM2.
- Transferencia lingüística desde danés: el adaptador intermedio en danés actúa como inicialización para el feroés.
- Capacidades del modelo base (razonamiento básico, código y matemáticas elementales) potencialmente preservadas, aunque no evaluadas tras el ajuste.
- Soporte de tool calling: no disponible de forma específica; depende de lo que ofrezca SmolLM2-360M-Instruct y no ha sido verificado tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no evaluadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en adaptación de lenguas de bajos recursos: el adaptador sirve como punto de partida reproducible para estudiar cuánto transfiere el danés al feroés en un modelo de 360M, comparando las tres semillas publicadas.
- Generación de texto sintético en feroés para aumento de datos: se puede usar para producir corpus adicionales que luego se filtren y revisen manualmente, dado el bajo coste computacional del modelo.
- Prototipado de asistentes conversacionales en feroés: con 2048 tokens de contexto y un modelo de 360M, es viable desplegar un chatbot ligero en local para pruebas de concepto, siempre con revisión humana.
- Evaluación comparativa de estrategias de transferencia: al existir un adaptador previo en danés, se puede medir el efecto de la inicialización secuencial frente a entrenar directamente en feroés.
- Experimentos de destilación o currículo lingüístico: el pipeline danés→feroés es un caso de estudio para diseñar currículos de entrenamiento en lenguas emparentadas.
- Docencia y formación: por su tamaño reducido y su licencia permisiva, es adecuado para enseñar el flujo completo de fine-tuning con PEFT, desde la preparación de FineWeb-2 hasta la evaluación cualitativa.
- Generación de borradores de texto administrativo o divulgativo en feroés: útil como primera pasada que un hablante nativo revisa, no como salida final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en fp16 ocupa aproximadamente 0,7 GB; el adaptador LoRA añade una fracción pequeña (rango 256 sobre cuatro módulos). En fp32, alrededor de 1,4 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior funciona sin problemas.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas, e incluso en CPU para inferencia lenta.
- Opciones de despliegue: transformers con PEFT (carga del adaptador), llama.cpp y Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF; vLLM requiere fusión previa del adaptador.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Por el tamaño, se espera un throughput alto en GPU consumer, pero es una estimación no verificada.
- Entrenamiento: el autor usó una A100 de 40 GB con batch efectivo de 256 y contexto de 2048.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-360M + LoRA feroés) | 360M + LoRA r256 | 2048 | feroés | Apache 2.0 | Hugging Face, 0 descargas |
| SmolLM2-360M-Instruct (base) | 360M | 8192 (según model card del base) | multilingüe, principalmente inglés | Apache 2.0 | Hugging Face, ampliamente usado |
| Adaptador danés del mismo autor | 360M + LoRA r256 | 2048 | danés | Apache 2.0 | Hugging Face |
| Modelos específicos para feroés | no disponible | no disponible | feroés | no disponible | no disponible |

No se dispone de benchmarks comparativos publicados para este adaptador ni para alternativas específicas en feroés dentro de la información proporcionada.

## Limitaciones y advertencias

- No ha sido evaluado: el autor lo declara explícitamente; no hay métricas de calidad, fluidez ni corrección en feroés.
- Riesgo de alucinación: al ser un modelo de 360M ajustado sobre corpus web, la generación puede contener afirmaciones falsas con alta fluidez superficial.
- Sesgos: FineWeb-2 es un corpus web; puede arrastrar sesgos de género, nacionalidad y contenido de baja calidad presentes en la web feroesa.
- Limitación de contexto: 2048 tokens, inferior a los 8192 del SmolLM2-360M-Instruct original, lo que restringe tareas de contexto largo.
- Cobertura lingüística limitada: solo se declara feroés; el rendimiento en danés o inglés tras el ajuste no está documentado y podría haberse degradado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin validación previa.
- Dependencia del adaptador: no es un modelo autónomo; requiere cargar el base `jekunz/smollm-360m-lora-fineweb-danish` y este a su vez el SmolLM2-360M-Instruct.
- Variante por semilla: los resultados pueden diferir de las semillas 2 y 3 de la misma configuración; no se han publicado comparaciones entre ellas.
- Sin demos ni documentación adicional: no hay espacio de inferencia, paper ni blog asociados.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-danish-seed1
- Modelo base del adaptador: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-danish
- Modelo base original: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Paper de SmolLM2: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible
