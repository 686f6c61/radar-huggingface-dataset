# DidulaThavishaPro/gemma4_1-0-8_grpo_only_b8_parity_seed2_checkpoint_10_lora

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante aprendizaje por refuerzo (GRPO) sobre el modelo base `didula-wso2/gemma4_1-0-8_sft_16bit_vllm`, una variante afinada por supervisión (SFT) de Gemma 4 E4B orientada a la generación de código en el lenguaje Ballerina. El adaptador se guardó tras la ronda 10 de un total de 30, con semilla de entrenamiento 3408 y un rango LoRA de 16 con alpha 32. El autor es DidulaThavishaPro y el repositorio se publicó en noviembre de 2026.

El problema que aborda es la mejora de la calidad del código Ballerina generado por el modelo base mediante refuerzo online: en cada ronda se generan grupos de programas candidatos y se descartan aquellos grupos en los que ningún programa compila o pasa las pruebas, aplicando después GRPO sobre los grupos restantes. Se trata, por tanto, de un artefacto de investigación intermedio (checkpoint 10 de 30), no de un modelo final pulido.

Por su naturaleza de adaptador PEFT, no es un modelo autónomo: requiere cargar el modelo base de 16 bits y aplicar el adaptador encima. Su relevancia es acotada y experimental, orientada a quien investigue RL aplicado a generación de código en lenguajes de nicho como Ballerina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 E4B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no declara recuento en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base referenciado es de 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json; tokenizer y chat_template.jinja incluidos |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Modelo base | didula-wso2/gemma4_1-0-8_sft_16bit_vllm |
| Etapa de entrenamiento | GRPO online, ronda 10 de 30 |
| Semilla | 3408 |
| Tamano del repo | 0.2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer Gemma 4 E4B previamente afinado por supervisión (SFT) para generación de código Ballerina. Sobre esa base se ejecuta un proceso de aprendizaje por refuerzo online con GRPO (Group Relative Policy Optimization). En cada ronda se generan grupos de programas candidatos por prompt; los grupos en los que ningún programa pasa las pruebas se descartan, de modo que la señal de recompensa solo proviene de grupos con al menos una solución válida. Este filtrado por "paridad" reduce el ruido en la estimación de ventajas del GRPO.

El adaptador tiene rango 16 y alpha 32, lo que fija un escalado de 2. Se trata de un checkpoint intermedio (ronda 10 de 30), por lo que el entrenamiento no está completado en este artefacto. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de prompts, ni sobre el uso de DPO u otras etapas posteriores.

## Capacidades

- Generación de código en el lenguaje Ballerina, especialidad principal del adaptador.
- Generación de texto general heredada del modelo base Gemma 4 E4B (no verificada en la información disponible).
- Razonamiento multi-paso orientado a la resolución de problemas de programación, reforzado mediante GRPO.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta soporte multilingüe específico.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Investigación en RL para código: reproducir o extender el pipeline GRPO con filtrado de grupos sin programas válidos, usando este checkpoint como referencia intermedia de la ronda 10.
- Generación asistida de código Ballerina: aplicar el adaptador sobre el modelo base SFT para producir programas en este lenguaje de integración, aprovechando el refuerzo sobre compilación y pruebas.
- Evaluación comparativa de etapas de entrenamiento: contrastar este checkpoint con el modelo SFT de partida y con el checkpoint final (ronda 30) para medir la contribución del GRPO.
- Fine-tuning posterior: usar el adaptador como inicialización para continuar el entrenamiento por refuerzo en dominios de código similares.
- Estudio de dinámicas de descarte de grupos: analizar cómo afecta el filtrado de prompts sin solución válida a la estabilidad del entrenamiento y a la calidad del código generado.
- Docencia y experimentación con PEFT: ejemplo práctico de carga de un adaptador LoRA sobre un modelo base de 16 bits mediante `PeftModel.from_pretrained`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0.2 GB; el requisito real lo determina el modelo base Gemma 4 E4B en 16 bits.
- VRAM estimada para el modelo base en 16 bits: no disponible con precisión (el recuento de parámetros no se declara en la información proporcionada).
- GPU recomendadas: no disponible; para un base de escala E4B en 16 bits se requeriría una GPU con memoria suficiente, pero no se puede concretar sin el recuento de parámetros.
- Compatibilidad con GPU de consumo: no verificable con los datos disponibles.
- Opciones de despliegue: PEFT (`PeftModel.from_pretrained`) sobre el modelo base; el base referencia vLLM en su nombre, lo que sugiere despliegue con vLLM. No se documenta compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (GRPO ronda 10) | LoRA sobre Gemma 4 E4B | no disponible | no disponible | gemma | Hugging Face, 0 descargas |
| didula-wso2/gemma4_1-0-8_sft_16bit_vllm | SFT completo, 16 bits | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Gemma 4 E4B (original) | Transformer base | no disponible | no disponible | gemma | Hugging Face |

No se dispone de datos de rendimiento ni de parámetros exactos para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint intermedio (ronda 10 de 30): el entrenamiento no ha finalizado y la calidad puede ser inferior a la de la versión final.
- No es un modelo autónomo: requiere el modelo base `didula-wso2/gemma4_1-0-8_sft_16bit_vllm` y PEFT para funcionar.
- Especializado en Ballerina; su rendimiento en otros lenguajes o tareas generales no está documentado y puede degradarse respecto al base.
- Riesgo de alucinación de APIs o construcciones del lenguaje no verificadas, habitual en modelos de código.
- Licencia "gemma": sujeta a los términos de uso de Gemma, con posibles restricciones para uso comercial; conviene revisar la licencia del modelo base y de la familia Gemma antes de desplegar.
- Sin descargas ni valoraciones en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.
- Idiomas, sesgos y comportamiento multilingüe no documentados.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse para integraciones que dependan de ello.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_1-0-8_grpo_only_b8_parity_seed2_checkpoint_10_lora
- Modelo base: https://huggingface.co/didula-wso2/gemma4_1-0-8_sft_16bit_vllm
- Perfil del autor: https://huggingface.co/DidulaThavishaPro
