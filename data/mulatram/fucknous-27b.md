# Mulatram/FuckNous-27B

## Resumen

FuckNous-27B es un ajuste fino (finetune) del modelo NousResearch/Arete-27B, publicado por el usuario Mulatram en Hugging Face. Con 27.356.728.560 parametros (aproximadamente 27,4 mil millones), se distribuye en formato safetensors y GGUF, lo que permite tanto su uso con la libreria transformers como su despliegue en llama.cpp. La model card es extremadamente escueta: se limita a metadatos YAML y no incluye descripcion del entrenamiento, datos de evaluacion ni instrucciones de uso.

El modelo se presenta con la etiqueta `qwen3_5` y `qwen3.5`, lo que sugiere que la arquitectura subyacente de Arete-27B deriva de la familia Qwen 3.5, aunque esta informacion no se confirma de forma explicita en la documentacion disponible. El pipeline declarado es `text-generation`, pero los tags incluyen `image-text-to-text`, lo que apunta a capacidades multimodales heredadas del modelo base. Tambien aparecen etiquetas relacionadas con PEFT, LoRA y GRPO, lo que indica que el ajuste se realizo mediante tecnicas de adaptacion parametro-eficientes y aprendizaje por refuerzo con preferencias.

La relevancia de este modelo es limitada y debe evaluarse con cautela: cuenta con 209 descargas y 0 likes en el momento de la consulta, no dispone de resultados de benchmarks publicados y su model card no documenta el proceso de entrenamiento ni los datos utilizados. El nombre del modelo y del dataset asociado (`NeoLiberalismEval`) sugieren un ajuste con una orientacion ideologica concreta, lo que constituye un factor relevante a considerar antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5, segun tags; no confirmado en la model card) |
| Parametros totales | 27.356.728.560 (aproximadamente 27,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos GGUF, pero no se detallan los niveles) |
| Idiomas soportados | ingles (segun el campo `language` de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La informacion disponible no permite detallar la arquitectura interna del modelo. Los tags `qwen3_5` y `qwen3.5` indican que el modelo base NousResearch/Arete-27B pertenece a la familia Qwen 3.5, pero la model card no especifica si se trata de un transformer denso convencional, de una variante con atencion lineal o de una arquitectura hibrida. Tampoco se documenta la longitud de contexto nativa, el vocabulario ni el tokenizador empleado.

En cuanto al entrenamiento, los tags `peft`, `lora` y `grpo` sugieren que el ajuste se realizo mediante LoRA (Low-Rank Adaptation) combinado con GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo utilizada habitualmente para alinear modelos con preferencias. El dataset asociado es `Mulatram/NeoLiberalismEval`, cuyo contenido, tamano y composicion no se detallan. No se indica el numero de tokens de entrenamiento, la mezcla de datos, ni si se aplicaron fases de SFT previas o posteriores al RL. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o mecanismos de atencion eficiente.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y los tags incluyen `conversational`.
- Procesamiento de imagen y texto: el tag `image-text-to-text` sugiere capacidades multimodales de entrada, aunque no se detalla su alcance ni se aportan ejemplos.
- Ajuste mediante GRPO: el modelo ha sido optimizado con aprendizaje por refuerzo, lo que en principio puede favorecer respuestas alineadas con el dataset de evaluacion utilizado.
- Compatibilidad con llama.cpp: la presencia de pesos GGUF y el tag `llama.cpp` permiten inferencia en entornos de CPU y GPU consumer.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: limitadas al ingles segun el campo `language`; no se documentan otros idiomas.
- Modo thinking, vision o audio: no disponible (no se documenta de forma explicita, salvo la referencia a image-text-to-text).

## Casos de uso

- Experimentacion academica con tecnicas de alineacion: el modelo puede utilizarse como caso de estudio de ajuste mediante LoRA y GRPO sobre un modelo base de 27B, comparando el comportamiento antes y despues del finetune en tareas de evaluacion ideologica.
- Generacion de texto en ingles para prototipos: dado su pipeline `text-generation`, puede emplearse en entornos de prueba para generar respuestas conversacionales en ingles, siempre que se valide la calidad con evaluaciones propias.
- Despliegue local con llama.cpp: la disponibilidad de pesos GGUF permite ejecutar el modelo en estaciones de trabajo con GPU consumer o incluso en CPU, util para pruebas offline sin dependencia de APIs.
- Investigacion sobre sesgos ideologicos: el dataset `NeoLiberalismEval` y el nombre del modelo sugieren un ajuste orientado a un sesgo concreto, lo que lo convierte en un candidato para estudios sobre como el RL con preferencias modifica la orientacion de las respuestas.
- Evaluacion comparativa de modelos base frente a finetunes: al derivar de NousResearch/Arete-27B, permite medir el impacto del ajuste LoRA+GRPO en benchmarks estandar, aunque el autor no los haya publicado.
- Pruebas de integracion con transformers: al cargarse con la libreria transformers y pesos safetensors, puede integrarse en pipelines de experimentacion que requieran un modelo de 27B con licencia Apache 2.0.
- Fine-tuning posterior: la licencia Apache 2.0 y el formato safetensors facilitan su uso como punto de partida para nuevos ajustes, aunque la falta de documentacion sobre el entrenamiento original introduce incertidumbre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 54-55 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 64-80 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 27-28 GB, viable en una RTX 4090 (24 GB) solo con cuantizaciones mas agresivas o con offloading parcial.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): aproximadamente 14-16 GB, lo que permite ejecucion en una RTX 4090, RTX 3090 o RTX 4080.
- GPU recomendadas: A100 80 GB, H100 80 GB o multiples GPU para FP16; RTX 4090, RTX 3090 o RTX A6000 para cuantizaciones de 4-8 bits.
- Cabe en GPU consumer: si, en cuantizaciones GGUF de 4 bits o inferiores en GPUs con 16-24 GB de VRAM; en FP16 no cabe en ninguna GPU consumer actual.
- Opciones de despliegue: llama.cpp (soportado explicitamente por los tags y pesos GGUF), transformers con safetensors, y potencialmente vLLM o TGI si se confirma compatibilidad con la arquitectura Qwen 3.5 (no documentado).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FuckNous-27B | 27,4B | no disponible | Apache 2.0 | safetensors, GGUF | Finetune LoRA+GRPO de Arete-27B; sin benchmarks publicados |
| NousResearch/Arete-27B | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva; sin datos confirmados en esta ficha |
| Qwen 3.5 (variante 27B) | no disponible | no disponible | no disponible | no disponible | Familia referenciada por los tags; sin confirmacion oficial en la informacion disponible |

No se dispone de datos suficientes para comparar rendimiento, contexto o calidad con alternativas de la misma categoria. La comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe el entrenamiento, los datos, la evaluacion ni las instrucciones de uso, lo que impide validar su calidad de forma objetiva.
- Sesgo ideologico probable: el nombre del modelo y el dataset `NeoLiberalismEval` apuntan a un ajuste con una orientacion politica concreta, lo que puede introducir sesgos sistematicos en las respuestas.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; al ser un finetune con RL sobre un dataset especifico, el riesgo de degradacion en tareas generales es real.
- Limitacion idiomatica: solo se declara ingles; no hay evidencia de soporte para castellano u otros idiomas.
- Contexto desconocido: no se documenta la longitud de contexto, lo que dificulta planificar usos con documentos largos o conversaciones multi-turno extensas.
- Trazabilidad limitada: 209 descargas y 0 likes indican una adopcion muy baja; no hay comunidad que haya validado el modelo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el usuario asume todo el riesgo.
- Capacidad multimodal incierta: el tag `image-text-to-text` no se acompaña de documentacion sobre el procesador de imagen ni ejemplos, por lo que no debe asumirse su funcionamiento.
- Compatibilidad de despliegue no verificada: aunque se distribuyen pesos GGUF, no se detallan los niveles de cuantizacion ni se confirma el soporte en vLLM o TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mulatram/FuckNous-27B
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Dataset asociado: https://huggingface.co/datasets/Mulatram/NeoLiberalismEval
