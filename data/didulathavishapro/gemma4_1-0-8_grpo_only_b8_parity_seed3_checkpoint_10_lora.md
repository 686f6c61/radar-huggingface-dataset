# DidulaThavishaPro/gemma4_1-0-8_grpo_only_b8_parity_seed3_checkpoint_10_lora

## Resumen

Este repositorio contiene un adaptador LoRA de tipo PEFT para el modelo Gemma 4 E4B, especializado en la generación de código en el lenguaje de programación Ballerina. El adaptador ha sido entrenado mediante aprendizaje por refuerzo online con el algoritmo GRPO (Group Relative Policy Optimization), partiendo del modelo de ajuste supervisado `didula-wso2/gemma4_1-0-8_sft_16bit_vllm`, también orientado a Ballerina. Lo publica el usuario DidulaThavishaPro y se corresponde con el checkpoint de la ronda 10 de un total de 30.

El adaptador no es un modelo autónomo: requiere cargar previamente el modelo base SFT de 16 bits y aplicar los pesos LoRA sobre él. Su relevancia es acotada y muy específica: se trata de un artefacto intermedio de un pipeline de entrenamiento por RL para un dominio de nicho (Ballerina, un lenguaje de integración con tipado estático orientado a servicios en la nube), no de un modelo de propósito general.

La información pública disponible es mínima: la model card describe únicamente el proceso de entrenamiento, el modelo base, la semilla y la configuración del adaptador (rango 16, alpha 32). No se publican métricas de evaluación, composición del dataset ni detalles sobre el esquema de recompensas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base Gemma 4 E4B; arquitectura del base no disponible en la informacion proporcionada |
| Parametros totales | no disponible (adaptador LoRA de rango 16; el modelo base es Gemma 4 E4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base referenciado es de 16 bits) |
| Idiomas soportados | no disponible (orientado a generacion de codigo Ballerina) |
| Licencia | gemma |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json), mas ficheros de tokenizer y chat_template.jinja |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre un modelo base Gemma 4 E4B previamente ajustado con supervisión (SFT) para generación de código Ballerina. El entrenamiento del adaptador se realizó mediante aprendizaje por refuerzo online con GRPO exclusivamente, sin fase SFT adicional en esta etapa. En cada iteración se descartan los grupos de prompts en los que ningún programa generado pasa las pruebas, lo que actúa como filtro de calidad de la señal de recompensa. El entrenamiento se ejecutó con semilla 3409 y este checkpoint corresponde a la ronda 10 de 30.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset de prompts, el esquema de recompensas (compilación, tests de paridad, etc.) ni las innovaciones técnicas del modelo base Gemma 4 E4B. Tampoco se especifica si el base emplea atención lineal, decodificación especulativa u otras optimizaciones.

## Capacidades

- Generación de código en el lenguaje Ballerina, orientada a integraciones y servicios.
- Ajuste fino por refuerzo para mejorar la tasa de programas que superan las pruebas (filtrado de grupos sin programa válido).
- Aplicable mediante PEFT (`PeftModel.from_pretrained`) sobre el modelo base SFT de 16 bits.
- Soporte de chat template propio (`chat_template.jinja`) incluido en el repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo general en la información disponible.
- No se documenta modo de pensamiento (thinking) ni otras capacidades especiales.

## Casos de uso

- Generación asistida de código Ballerina en entornos de desarrollo: el adaptador se carga sobre el base SFT para producir fragmentos de integración y servicios Ballerina con mayor tasa de compilación, gracias al ajuste por RL con filtrado de grupos fallidos.
- Evaluación de pipelines de RL para código: sirve como checkpoint intermedio (ronda 10 de 30) para estudiar la evolución de la tasa de éxito durante el entrenamiento GRPO y comparar con checkpoints posteriores.
- Investigación sobre GRPO en dominios de nicho: permite reproducir y analizar el efecto del filtrado de grupos sin programa válido en la señal de recompensa para un lenguaje de baja representación como Ballerina.
- Integración en flujos de CI para generación de tests o esqueletos de servicios Ballerina: el adaptador puede combinarse con el base de 16 bits y desplegarse con vLLM (el base referencia `_vllm` en su nombre), aunque no se publican latencias ni throughput.
- Fine-tuning posterior o continuación del entrenamiento: al ser un adaptador LoRA, puede reutilizarse como punto de partida para más rondas de GRPO o para SFT adicional sobre Ballerina sin reentrenar el base completo.
- Estudio de paridad y consistencia entre semillas: el nombre del checkpoint (`parity_seed3`) sugiere su uso en experimentos de comparación entre ejecuciones con distintas semillas para medir estabilidad del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa; depende del modelo base Gemma 4 E4B en 16 bits y del adaptador LoRA (repositorio de 0,2 GB). No se especifican requisitos del base en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el base se referencia en 16 bits, lo que condiciona el encaje en GPUs de consumo según su tamaño real, dato no publicado aquí.
- Opciones de despliegue: PEFT (`PeftModel.from_pretrained`) para cargar el adaptador sobre el base; el nombre del base sugiere soporte de vLLM, aunque no se confirma en la información disponible. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (GRPO ronda 10) | LoRA r16 sobre Gemma 4 E4B | no disponible | Codigo Ballerina via RL (GRPO) | gemma | Hugging Face (0 descargas) |
| `didula-wso2/gemma4_1-0-8_sft_16bit_vllm` (base) | Gemma 4 E4B en 16 bits | no disponible | Codigo Ballerina via SFT | no disponible | Hugging Face |
| Alternativas de codigo generalistas (p. ej. modelos Gemma base) | no disponible | no disponible | Proposito general | gemma | Hugging Face |

No se dispone de datos de rendimiento ni de modelos comparables específicos para Ballerina en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Artefacto intermedio: es el checkpoint de la ronda 10 de 30, no la versión final del entrenamiento; su calidad puede ser inferior a la de checkpoints posteriores.
- Dependencia estricta del modelo base: sin `didula-wso2/gemma4_1-0-8_sft_16bit_vllm` el adaptador no es funcional.
- Dominio muy restringido: orientado exclusivamente a código Ballerina; no se documentan capacidades generales ni multilingües.
- Sin métricas publicadas: no hay benchmarks, tasas de compilación ni resultados de tests de paridad, lo que impide evaluar su calidad de forma objetiva.
- Riesgo de alucinación: como todo modelo generativo de código, puede producir APIs o sintaxis inexistentes en Ballerina; requiere validación con compilador y tests.
- Licencia `gemma`: el uso comercial y la redistribución están sujetos a los términos de la licencia Gemma, que imponen restricciones y obligaciones específicas; conviene revisarlos antes de producción.
- Sin datos de sesgos ni de idiomas soportados: no se puede evaluar su comportamiento fuera del dominio de código.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/DidulaThavishaPro/gemma4_1-0-8_grpo_only_b8_parity_seed3_checkpoint_10_lora
- Modelo base SFT: https://huggingface.co/didula-wso2/gemma4_1-0-8_sft_16bit_vllm
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
