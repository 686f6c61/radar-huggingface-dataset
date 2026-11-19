# DidulaThavishaPro/gemma4_1-0-8_grpo_only_b8_parity_seed3_checkpoint_20_lora

## Resumen

El modelo `gemma4_1-0-8_grpo_only_b8_parity_seed3_checkpoint_20_lora` es un adaptador LoRA de PEFT publicado por el usuario DidulaThavishaPro sobre el modelo base ya ajustado `didula-wso2/gemma4_1-0-8_sft_16bit_vllm`, que a su vez parte de la familia Gemma 4 en su variante E4B (según la model card, "Gemma 4 E4B"). El adaptador está especializado en la generación de código en Ballerina, un lenguaje de programación de propósito general orientado a integraciones, y se ha entrenado mediante aprendizaje por refuerzo en línea con GRPO (Group Relative Policy Optimization) partiendo del modelo de ajuste supervisado (SFT) de Ballerina.

Lo relevante de esta publicación es su carácter experimental y de investigación: se trata de un checkpoint intermedio (ronda 20 de 30) de un proceso de RL que filtra los grupos de prompts sin ningún programa que pase las pruebas, una estrategia de entrenamiento que busca mejorar la corrección funcional del código generado más allá de la mera imitación de ejemplos del SFT. El adaptador tiene rango 16 y alpha 32, se distribuye en formato safetensors (0,2 GB) y hereda la licencia Gemma del modelo base.

Al no existir descargas ni likes en el momento de la consulta y no publicarse benchmarks ni detalles del dataset, debe considerarse un artefacto de investigación reproducible (semilla 3409) más que un modelo listo para producción. Su utilidad principal es servir como pieza de un pipeline de RL para código y como ejemplo de adaptación de un modelo Gemma 4 E4B a un lenguaje de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante E4B según la model card); adaptador LoRA sobre el modelo base |
| Parametros totales | no disponible (el adaptador LoRA ocupa 0,2 GB; el modelo base es Gemma 4 E4B) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base se distribuye en 16 bits según su nombre, `sft_16bit_vllm`; el adaptador es safetensors) |
| Idiomas soportados | no disponible (la model card no lo especifica; se infiere inglés y Ballerina por el dominio de entrenamiento, sin confirmación) |
| Licencia | gemma |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `adapter_config.json`), más ficheros de tokenizer y `chat_template.jinja` |
| Libreria | peft |
| Rango LoRA / alpha | 16 / 32 |
| Etapa de entrenamiento | RL en línea con GRPO únicamente (ronda 20 de 30) |
| Semilla de entrenamiento | 3409 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `didula-wso2/gemma4_1-0-8_sft_16bit_vllm`, un modelo Gemma 4 E4B que ya había pasado por un ajuste supervisado (SFT) específico para Ballerina. Sobre esa base, el autor ejecuta una etapa de aprendizaje por refuerzo en línea con GRPO, en la que los grupos de prompts que no producen ningún programa que pase las pruebas se descartan. Este filtrado por "paridad" (indicado en el nombre del checkpoint) refuerza la señal de recompensa hacia soluciones ejecutables y correctas, en lugar de hacia texto plausible. El checkpoint corresponde a la ronda 20 de un total de 30 y se guardó con la semilla 3409, lo que permite reproducir el proceso.

La arquitectura subyacente es la de Gemma 4 E4B, un transformer decoder-only de la familia Gemma; la model card no detalla número de tokens de entrenamiento, composición del dataset ni innovaciones de atención o decodificación. El adaptador LoRA (rango 16, alpha 32) modifica un subconjunto de pesos del modelo base y debe cargarse con PEFT (`PeftModel.from_pretrained`) junto con el tokenizer y la plantilla de chat incluidas en el repositorio.

## Capacidades

- Generación de código en Ballerina: es la capacidad central del adaptador, entrenado con recompensas basadas en la ejecución correcta de programas.
- Razonamiento orientado a corrección funcional: el uso de GRPO con filtrado de grupos sin programas válidos empuja al modelo hacia soluciones que pasan pruebas, no solo hacia sintaxis plausible.
- Ajuste fino eficiente: al ser un adaptador LoRA, permite aplicar la especialización sin duplicar los pesos completos del modelo base.
- Compatibilidad con el ecosistema PEFT: carga estándar mediante `PeftModel.from_pretrained` y fusión opcional con el modelo base.
- Plantilla de chat incluida (`chat_template.jinja`), lo que facilita el uso conversacional con el tokenizer del run.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación asistida de código Ballerina en el IDE: el adaptador puede integrarse en un servidor de inferencia que cargue el modelo base más el LoRA para autocompletar servicios y funciones de integración en Ballerina, aprovechando la especialización del SFT y el refuerzo por ejecución.
- Migración de integraciones a Ballerina: dado un fragmento de código en otro lenguaje o una especificación de API, el modelo puede proponer la implementación equivalente en Ballerina, un caso típico de adopción de este lenguaje en entornos WSO2.
- Generación de tests y programas de ejemplo: el entrenamiento con recompensas de ejecución hace que el adaptador sea adecuado para producir programas que compilen y pasen pruebas, útiles como base de ejemplos en documentación técnica.
- Investigación en RL para código: el checkpoint (ronda 20 de 30, semilla 3409) sirve para estudiar la evolución de la calidad del código durante el entrenamiento GRPO y comparar rondas intermedias frente a la versión final.
- Evaluación de técnicas de filtrado de grupos en GRPO: al descartar prompts sin programas válidos, el adaptador es un caso de estudio sobre cómo afecta este filtrado a la diversidad y corrección de las salidas.
- Reproducción de experimentos: con la semilla y el modelo base documentados, un equipo puede reproducir el pipeline SFT + GRPO para adaptar Gemma 4 E4B a otros lenguajes de dominio específico.
- Fine-tuning posterior sobre el adaptador: al ser un LoRA de bajo rango, puede combinarse o continuarse con nuevos adaptadores para dominios concretos sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; el adaptador LoRA añade 0,2 GB, mientras que el modelo base Gemma 4 E4B en 16 bits requiere los recursos propios de su tamaño (no detallados en la información).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende del tamaño del modelo base y de la cuantización empleada.
- Opciones de despliegue: PEFT (`PeftModel.from_pretrained`) es el método documentado; el nombre del modelo base (`sft_16bit_vllm`) sugiere que el pipeline del autor usó vLLM, aunque no se detalla el procedimiento de carga del adaptador en vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4_1-0-8_grpo_only_b8_parity_seed3_checkpoint_20_lora | no disponible (LoRA de 0,2 GB sobre Gemma 4 E4B) | no disponible | Código Ballerina vía GRPO | gemma | Hugging Face, 0 descargas |
| didula-wso2/gemma4_1-0-8_sft_16bit_vllm | no disponible (Gemma 4 E4B) | no disponible | Código Ballerina vía SFT | no disponible | Hugging Face (modelo base) |
| Gemma 4 E4B (modelo original) | no disponible | no disponible | Propósito general | gemma | Hugging Face |

No se dispone de datos de benchmarks ni de otros adaptadores comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la ronda 20 de 30; no es la versión final del entrenamiento y su rendimiento puede ser inferior al del checkpoint final.
- Naturaleza experimental: sin descargas ni likes, sin benchmarks publicados y sin documentación de evaluación; no hay evidencia pública de su calidad en producción.
- Dependencia del modelo base: el adaptador solo funciona correctamente aplicado a `didula-wso2/gemma4_1-0-8_sft_16bit_vllm`; usarlo con otro modelo base invalidaría el ajuste.
- Dominio muy restringido: especializado en Ballerina, por lo que su rendimiento en otros lenguajes o tareas generales no está garantizado y puede degradarse respecto al modelo base.
- Riesgo de alucinación: como todo modelo generativo de código, puede producir APIs o funciones inexistentes; el filtrado por ejecución durante el entrenamiento no elimina este riesgo en inferencia.
- Sesgos: no se documentan análisis de sesgo; al heredar el modelo base Gemma 4, puede arrastrar los sesgos de sus datos de preentrenamiento.
- Idiomas: no se especifican los idiomas soportados; no hay confirmación de calidad en castellano.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma, que impone restricciones y obligaciones de atribución; debe revisarse antes de cualquier despliegue.
- Contexto: se desconoce la longitud de contexto efectiva, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_1-0-8_grpo_only_b8_parity_seed3_checkpoint_20_lora
- Modelo base (SFT Ballerina): https://huggingface.co/didula-wso2/gemma4_1-0-8_sft_16bit_vllm
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Documentación de PEFT: https://huggingface.co/docs/peft
- Repositorio de vLLM: https://github.com/vllm-project/vllm
