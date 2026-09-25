# adzcai/AfriGuardPlain-AfriqueQwen3.5-4B

## Resumen

AfriGuardPlain-AfriqueQwen3.5-4B es un ajuste fino de supervisión completa (SFT) del modelo McGill-NLP/AfriqueQwen3.5-4B, desarrollado por el usuario adzcai sobre el conjunto de datos adzcai/AfriGuard-plain. El objetivo es dotar a un modelo base multilingüe centrado en lenguas africanas de un comportamiento de seguridad alineado: responder de forma útil a peticiones seguras y rechazar de forma breve las peticiones inseguras, sin emitir etiquetas ni etiquetas de categoría de seguridad.

La particularidad de esta variante "plain" es que cada ejemplo de entrenamiento contiene únicamente el prompt del usuario y una respuesta en texto plano, sin instrucción de sistema de seguridad y sin las etiquetas `<safety>`, `<category>` o `<response>`. Esto lo diferencia de su contraparte con prompting de instrucciones, israel/AfriGuard-AfriqueQwen3.5-4B, entrenada sobre AfriGuard-inst con la misma base e hiperparámetros.

El modelo tiene 4.539.265.536 parámetros (unos 4,54 mil millones) y se distribuye en formato safetensors con licencia CC-BY-4.0. Cubre once idiomas: inglés y diez lenguas africanas (amárico, hausa, igbo, oromo, shona, suajili, twi, wolof, yoruba y zulú). Su relevancia actual reside en la escasez de modelos de seguridad específicos para lenguas africanas de bajos recursos, un nicho donde la mayoría de las herramientas de moderación disponibles solo operan en inglés o en un puñado de idiomas mayoritarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun el tag `qwen3_5` de la metadata) |
| Parametros totales | 4.539.265.536 (aproximadamente 4,54 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors a precision completa) |
| Idiomas soportados | en, am, ha, ig, om, sn, sw, tw, wo, yo, zu |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base McGill-NLP/AfriqueQwen3.5-4B, un transformer de aproximadamente 4,54 mil millones de parámetros perteneciente a la familia Qwen3.5 (el repositorio etiqueta la arquitectura como `qwen3_5`). El ajuste se realizó con fine-tuning completo (no LoRA ni adaptadores) empleando DeepSpeed ZeRO-3 sobre el conjunto adzcai/AfriGuard-plain, que es la versión sin prompt de instrucciones de israel/AfriGuard-inst.

La configuración de entrenamiento publicada indica: 1 época, tasa de aprendizaje 1e-05 con planificador coseno y 0,1 pasos de calentamiento, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, tamaño de lote por dispositivo 1, acumulación de gradiente 2 (lote total efectivo de 2), semilla 42, evaluación con lote de 8 y ejecución multi-GPU. Se utilizó la plantilla de chat del modelo base y la pérdida se calculó únicamente sobre la respuesta. Los datos de entrenamiento consisten en pares prompt-respuesta en texto plano: una respuesta útil para prompts seguros y un rechazo breve para prompts inseguros, sin instrucción de sistema de seguridad ni etiquetas de seguridad. El entrenamiento se gestionó con LlamaFactory (el repositorio AfriGuard-model), usando el fichero de configuración `examples/train_full/afriguard_plain_afriqueqwen3.5-4b_full_sft.yaml`.

## Capacidades

- Generación de texto conversacional en once idiomas, con cobertura específica de lenguas africanas de bajos recursos.
- Comportamiento de seguridad alineado: responde a peticiones seguras y rechaza brevemente las inseguras de forma directa, sin etiquetas de seguridad ni categorías.
- Clasificación implícita de seguridad mediante la propia respuesta (aceptación o rechazo), sin salida estructurada de etiquetas.
- Capacidad multilingüe declarada para en, am, ha, ig, om, sn, sw, tw, wo, yo y zu.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes o razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de visión: la metadata incluye el tag `image-text-to-text`, aunque el pipeline declarado es `text-generation`; la model card no describe ninguna capacidad multimodal, por lo que este punto queda sin confirmar.

## Casos de uso

- Moderación de contenido en plataformas africanas: el modelo puede actuar como primera línea de filtrado de mensajes en suajili, hausa, yoruba o zulú, devolviendo un rechazo directo ante peticiones dañinas sin necesidad de post-procesar etiquetas de seguridad.
- Atención al cliente multilingüe con salvaguardas: un chatbot de soporte puede usar el modelo para responder consultas en lenguas africanas y rechazar automáticamente peticiones fuera de política, aprovechando que la respuesta ya incorpora el comportamiento seguro.
- Sistemas de seguridad como componente de un pipeline mayor: dado que el modelo emite texto plano, es sencillo integrarlo detrás de un clasificador o un enrutador que detecte si la respuesta es un rechazo o una respuesta útil.
- Investigación en alineación y seguridad multilingüe: sirve como punto de comparación frente a su contraparte con instrucciones (israel/AfriGuard-AfriqueQwen3.5-4B) para estudiar el efecto del formato de entrenamiento en el comportamiento de rechazo.
- Generación de datos sintéticos de seguridad: puede producir pares prompt-respuesta controlados para aumentar conjuntos de entrenamiento en lenguas africanas poco representadas.
- Despliegue en entornos con recursos limitados: con 4,54 mil millones de parámetros, es viable ejecutarlo en una única GPU de consumo de 24 GB tras cuantización, lo que facilita prototipos y demos locales.
- Evaluación de robustez idiomática: útil para medir si el comportamiento de rechazo se mantiene de forma consistente en idiomas con pocos datos frente a otros más representados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de seguridad o de tasas de rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, alrededor de 9,1 GB de pesos (el repositorio completo ocupa 9,1 GB) más memoria para el contexto y las activaciones; en FP32, aproximadamente 18 GB solo de pesos.
- Cuantizacion: el repositorio solo publica safetensors a precision completa, por lo que para reducir VRAM habría que generar cuantizaciones propias (por ejemplo, 8 bits ≈ 4,5 GB y 4 bits ≈ 2,3 GB).
- GPU recomendadas: una tarjeta de 24 GB como la RTX 3090 o la RTX 4090 puede albergar el modelo en FP16; para FP32 conviene una A100 de 40/80 GB o una H100.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB en FP16 y en tarjetas de 8-12 GB tras cuantización a 4 u 8 bits, aunque la información disponible no detalla recetas de cuantización probadas.
- Opciones de despliegue: la metadata declara compatibilidad con Transformers y `endpoints_compatible`; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no se mencionan en la información proporcionada. Para llama.cpp u Ollama sería necesario generar primero un fichero GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de salida | Licencia | Relacion |
|---|---|---|---|---|---|
| adzcai/AfriGuardPlain-AfriqueQwen3.5-4B | 4.539.265.536 | no disponible | Respuesta plana, sin etiquetas de seguridad | cc-by-4.0 | Modelo descrito |
| israel/AfriGuard-AfriqueQwen3.5-4B | no disponible (misma base) | no disponible | Respuesta con prompting de instrucciones y etiquetas de seguridad | no disponible | Contraparte con instrucciones, misma base e hiperparametros |
| McGill-NLP/AfriqueQwen3.5-4B | no disponible | no disponible | No aplica (modelo base) | no disponible | Modelo base sobre el que se ajusta |

No se dispone de datos de rendimiento comparado entre estas variantes, por lo que la comparación se limita a parámetros, formato de salida y licencia.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad ni tasas de rechazo falso o de falso negativo, por lo que el comportamiento de seguridad no está cuantificado.
- Riesgo de alucinación inherente a un modelo generativo de 4,54 mil millones de parámetros; no hay datos de evaluación que lo acoten.
- El modelo no emite etiquetas de seguridad ni categorías: cualquier sistema que necesite clasificación estructurada debe inferirla a partir del texto de la respuesta.
- La cobertura idiomática es desigual por diseño: el inglés probablemente esté mejor representado que las lenguas africanas con menos datos disponibles, aunque no se aportan cifras.
- La longitud de contexto no está documentada, lo que dificulta planificar despliegues con conversaciones largas o documentos extensos.
- Solo se distribuyen pesos en safetensors a precision completa; no hay cuantizaciones oficiales, GGUF ni recetas de despliegue validadas.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base McGill-NLP/AfriqueQwen3.5-4B y del conjunto de datos, cuya licencia no se detalla en la información proporcionada.
- La metadata incluye el tag `image-text-to-text` pese a declarar el pipeline `text-generation`; no hay confirmación de capacidades multimodales reales.
- No hay información sobre tool calling, soporte de agentes ni modos de razonamiento, por lo que no debe asumirse su disponibilidad en producción.
- El repositorio registra cero descargas y cero valoraciones, sin adopción conocida ni validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adzcai/AfriGuardPlain-AfriqueQwen3.5-4B
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/adzcai/AfriGuard-plain
- Conjunto de datos con instrucciones: https://huggingface.co/datasets/israel/AfriGuard-inst
- Contraparte con prompting de instrucciones: https://huggingface.co/israel/AfriGuard-AfriqueQwen3.5-4B
- Configuracion de entrenamiento: `examples/train_full/afriguard_plain_afriqueqwen3.5-4b_full_sft.yaml` en el repositorio AfriGuard-model (LlamaFactory); URL no proporcionada en la informacion disponible.
