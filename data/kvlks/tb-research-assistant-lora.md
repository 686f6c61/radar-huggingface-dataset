# kvlkS/tb-research-assistant-lora

## Resumen

TB Research Assistant es un adaptador LoRA (QLoRA) publicado por el usuario kvlkS sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Su propósito declarado es asistir en tareas de investigación sobre tuberculosis y *Mycobacterium tuberculosis*: consultas estilo consulta clínica, crítica metodológica, generación de hipótesis e interpretación de resultados. No se trata de un modelo completo, sino de pesos de adaptador (0,4 GB) que deben cargarse junto al modelo base de 8.000 millones de parámetros.

El adaptador se presenta como la versión exacta desplegada en la aplicación de chat TB Research Assistant, alojada en el repositorio de GitHub del autor. Según la model card, no hubo preentrenamiento continuado ni recuperación aumentada (RAG): el comportamiento especializado proviene únicamente del ajuste fino supervisado sobre datos de instrucción del dominio.

La relevancia del modelo es acotada: se publica bajo licencia Llama 3.1, hereda todas las restricciones del modelo base y no cuenta con descargas ni validación externa en el momento de la consulta. Es un artefacto de investigación de nicho, útil para quien quiera reproducir o extender el asistente, no un modelo listo para producción clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama 3.1 8B Instruct |
| Parametros totales | no disponible (adaptador de 0,4 GB; el modelo base tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base soporta 128.000 tokens) |
| Tipos de cuantizacion | QLoRA con 4 bits NF4, doble cuantizacion y compute dtype bfloat16 (segun el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only con 8.000 millones de parámetros y atención por grupos (GQA) en el modelo base. La model card no especifica el rango del adaptador, los módulos objetivo, el número de pasos, la tasa de aprendizaje ni el tamaño del dataset de ajuste.

Los datos de entrenamiento se describen de forma cualitativa: instrucciones específicas de tuberculosis y *M. tuberculosis* con formato de preguntas y respuestas de consulta, crítica de metodología, generación de hipótesis e interpretación de resultados. No se documenta el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. Tampoco se mencionan innovaciones técnicas más allá del propio ajuste QLoRA.

## Capacidades

- Generación de texto conversacional en el dominio de la investigación en tuberculosis.
- Respuesta a consultas estilo consulta clínica o académica sobre *M. tuberculosis*.
- Crítica de metodología de investigación (según la descripción de los datos de entrenamiento).
- Generación de hipótesis de investigación.
- Interpretación de resultados experimentales o clínicos en el contexto de TB.
- Herencia de las capacidades generales del modelo base Llama 3.1 8B Instruct, incluyendo tool calling y razonamiento multilingüe, aunque no se documenta su preservación tras el ajuste.
- No se documenta soporte explícito de agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente de consulta para investigadores de tuberculosis: el adaptador responde preguntas técnicas sobre *M. tuberculosis* con el estilo de los datos de ajuste, útil como apoyo a la revisión bibliográfica interna.
- Crítica metodológica de borradores: se puede usar para solicitar observaciones sobre el diseño experimental de un estudio de TB antes de enviarlo a revisión.
- Generación de hipótesis: el modelo propone líneas de investigación a partir de un contexto de resultados, como punto de partida para discusión en grupo.
- Interpretación de resultados preliminares: ayuda a redactar explicaciones de resultados de laboratorio o epidemiología en el dominio de TB.
- Reproducción del chat TB Research Assistant: el adaptador es el que sirve la interfaz del repositorio del autor, por lo que permite desplegar una copia local del asistente.
- Base para ajuste adicional: al ser un adaptador PEFT ligero, se puede combinar con otros adaptadores o continuar el ajuste con datos propios del dominio.
- Docencia y formación: puede emplearse en entornos controlados para practicar la formulación de preguntas de investigación sobre tuberculosis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con cuantización 4 bits NF4 del modelo base, en torno a 5-6 GB para los pesos más overhead de activaciones; en bfloat16 completa, aproximadamente 16 GB solo para pesos.
- GPU recomendadas: A100 o H100 para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) para bfloat16; RTX 3090 o RTX 4080 para 4 bits.
- Cabe en GPU de consumo: sí, con cuantización 4 bits en tarjetas de 8 GB o más, y en bfloat16 en tarjetas de 16-24 GB.
- Opciones de despliegue: transformers + peft + bitsandbytes (el ejemplo de la model card), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TB Research Assistant (este) | adaptador sobre 8B | no disponible (base: 128k) | llama3.1 | Hugging Face, 0 descargas | Especializado en TB, sin benchmarks |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | llama3.1 | Hugging Face, ampliamente usado | Modelo base generalista, sin especialización en TB |
| Adaptadores biomédicos PEFT sobre Llama 3.1 | variable | depende del base | llama3.1 | variable | No se dispone de un comparable directo verificado en la información proporcionada |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un dispositivo médico ni sustituye el criterio clínico; no debe usarse para diagnóstico o decisiones terapéuticas.
- Riesgo de alucinación inherente al modelo base, potencialmente agravado por la especialización estrecha en un dominio técnico.
- No se documentan evaluaciones de sesgo, robustez ni tasas de error en el dominio de TB.
- La licencia Llama 3.1 impone restricciones de uso comercial y requiere aceptar los términos de Meta; el adaptador hereda esas condiciones.
- El acceso al modelo base requiere autenticación en Hugging Face y aceptación de la licencia de Llama 3.1.
- Sin descargas ni validación comunitaria: no hay evidencia externa de calidad.
- No se especifican idiomas soportados; el comportamiento multilingüe depende del modelo base y no está verificado tras el ajuste.
- El repositorio es de 0,4 GB y contiene únicamente el adaptador; no incluye el modelo base ni datos de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/kvlkS/tb-research-assistant-lora
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio del asistente: https://github.com/sedak326/Llama-3.1-TB
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
