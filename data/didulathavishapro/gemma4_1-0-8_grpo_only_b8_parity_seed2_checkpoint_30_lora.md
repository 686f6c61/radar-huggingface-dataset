# DidulaThavishaPro/gemma4_1-0-8_grpo_only_b8_parity_seed2_checkpoint_30_lora

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base `didula-wso2/gemma4_1-0-8_sft_16bit_vllm`, un modelo derivado de Gemma 4 E4B especializado en la generación de código en el lenguaje de programación Ballerina. El adaptador se ha entrenado mediante aprendizaje por refuerzo en línea con el algoritmo GRPO (Group Relative Policy Optimization) durante 30 rondas completas, partiendo del modelo de ajuste supervisado (SFT) del mismo autor. El objetivo es mejorar la capacidad del modelo para generar programas Ballerina sintácticamente válidos y funcionalmente correctos.

El modelo es relevante en el nicho de la generación de código para lenguajes de dominio específico y de baja representación en los corpus de entrenamiento, como Ballerina, un lenguaje orientado a la integración de servicios. La estrategia de aplicar GRPO con filtrado de grupos sin programas válidos (prompt groups with no passing program are dropped) es una técnica de RL que aprovecha señales de recompensa basadas en la ejecución o validación del código generado.

Se trata de un adaptador de pequeño tamaño (0,2 GB en el repositorio) con rango LoRA 16 y alpha 32, entrenado sobre un modelo base de 4B de parámetros aproximados (la nomenclatura "4_1-0-8" sugiere Gemma 4 E4B, aunque el tamaño exacto no se especifica en la información disponible). No hay datos publicados sobre benchmarks, idiomas soportados ni pipeline de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B, según nomenclatura del modelo base); adaptador LoRA de rango 16, alpha 32 |
| Parámetros totales | No disponible (el adaptador LoRA es de 0,2 GB; el modelo base Gemma 4 E4B tiene un tamaño no especificado en la información disponible) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el modelo base se entrenó en 16 bits según su nombre) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | Safetensors (adapter_model.safetensors) + adapter_config.json; incluye tokenizer y chat_template.jinja |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base de la familia Gemma 4, concretamente el identificador `gemma4_1-0-8_sft_16bit_vllm`, que corresponde a un modelo Gemma 4 E4B ajustado mediante SFT (supervised fine-tuning) para generación de código Ballerina y exportado en precisión de 16 bits para su uso con vLLM. El adaptador LoRA tiene rango 16 y alpha 32, lo que implica una actualización de bajo rango sobre las matrices de atención y proyección del transformer subyacente. El repositorio incluye los ficheros del tokenizer y una plantilla de chat (`chat_template.jinja`), lo que indica que el entrenamiento se realizó con un formato de conversación estructurado.

El entrenamiento del adaptador se llevó a cabo mediante aprendizaje por refuerzo en línea con GRPO únicamente, sin una fase adicional de SFT sobre el adaptador. La particularidad del proceso es que los grupos de prompts que no producían ningún programa válido (es decir, sin señal de recompensa positiva) se descartaban del lote de entrenamiento, lo que sesga la optimización hacia ejemplos donde el modelo ya era capaz de generar código ejecutable o validable. Se completaron 30 rondas de entrenamiento con semilla 3408. No se especifica el número de tokens de entrenamiento, la composición del dataset de prompts ni los detalles de la función de recompensa (aunque por el contexto se infiere que se basa en la validez o ejecución del código Ballerina generado).

## Capacidades

- Generación de código en el lenguaje Ballerina, orientado a la integración de servicios y APIs.
- Razonamiento de código y corrección de programas mediante la señal de refuerzo de GRPO.
- Aplicación como adaptador PEFT sobre el modelo base SFT, lo que permite combinar la capacidad general del modelo base con la especialización en Ballerina.
- Soporte de conversación multi-turno a través de la plantilla de chat incluida (`chat_template.jinja`).
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio ni modo de pensamiento (thinking mode) en la documentación proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de servicios Ballerina para integración de APIs: el adaptador puede producir esqueletos de servicios HTTP/REST en Ballerina, un lenguaje con construcciones específicas para orquestación de integraciones, aprovechando el ajuste SFT más GRPO para reducir errores sintácticos.
- Asistencia en migración de código a Ballerina: dado un fragmento de código en otro lenguaje o una descripción funcional, el modelo puede generar la implementación equivalente en Ballerina, útil en proyectos de modernización de integraciones empresariales.
- Autocompletado y generación de tests unitarios para módulos Ballerina existentes: el adaptador, entrenado con recompensas de validez de programa, puede proponer casos de prueba que compilen y se ejecuten contra el módulo.
- Corrección automática de errores de compilación: el modelo puede recibir un fragmento de código Ballerina con errores y generar una versión corregida, apoyándose en el entrenamiento por refuerzo con señal de programas válidos.
- Generación de conectores y plantillas de integración (por ejemplo, para servicios WSO2, dado el contexto del autor): el adaptador puede producir código repetitivo de conexión a endpoints, transformación de payloads y manejo de errores en Ballerina.
- Docencia y aprendizaje de Ballerina: el modelo puede explicar construcciones del lenguaje y generar ejemplos comentados, aunque su especialización es principalmente la generación de código más que la explicación conceptual.
- Integración en pipelines de CI/CD para generación de código bajo demanda: al ser un adaptador LoRA ligero, puede cargarse junto al modelo base en un servidor de inferencia (por ejemplo, vLLM, dado el nombre del modelo base) para tareas de generación de código en entornos de integración continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB en disco, pero requiere cargar el modelo base completo (Gemma 4 E4B en 16 bits) para la inferencia.
- VRAM estimada para el modelo base en 16 bits: no disponible con precisión, pero para un modelo de ~4B de parámetros en FP16 se requieren aproximadamente 8-10 GB solo para los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo base, una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100) sería adecuada para inferencia en 16 bits.
- Compatibilidad con GPU de consumo: probable en GPUs con 16 GB o más (RTX 4080/4090, RTX A4000) si se cuantiza el modelo base; no confirmado en la documentación.
- Opciones de despliegue: el nombre del modelo base incluye "vllm", lo que sugiere compatibilidad con vLLM; también es aplicable mediante PEFT (`PeftModel.from_pretrained`) y potencialmente con llama.cpp u Ollama si se convierte el modelo base a GGUF, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de generación de código Ballerina con adaptadores GRPO sobre Gemma 4.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado exclusivamente para código Ballerina; su rendimiento en otros lenguajes o tareas generales puede degradarse respecto al modelo base.
- Sesgo de selección en el entrenamiento: al descartar grupos de prompts sin programas válidos, el adaptador puede estar sobreajustado a patrones de código que ya funcionaban en el modelo SFT, con menor capacidad de exploración en casos difíciles.
- Riesgo de alucinación de APIs: puede generar llamadas a funciones o módulos Ballerina inexistentes o con firmas incorrectas, especialmente en integraciones con servicios externos.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que incluye restricciones de uso aceptable y obligaciones de atribución; es necesario revisar la licencia antes de desplegar en producción.
- Idiomas soportados no documentados: no se especifica si el adaptador mantiene las capacidades multilingües del modelo base o si el entrenamiento en Ballerina las ha reducido.
- Longitud de contexto no documentada: se desconoce si el adaptador preserva la ventana de contexto del modelo base o si el entrenamiento la ha modificado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora sobre el modelo SFT base, por lo que la evaluación en el caso de uso concreto es imprescindible antes de adoptarlo.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni informes de uso en producción.
- Fecha de creación futura (2026-11-19): el repositorio indica una fecha posterior a la actual, lo que puede deberse a un error de metadatos o a un entorno de pruebas; conviene verificar la integridad de los ficheros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_1-0-8_grpo_only_b8_parity_seed2_checkpoint_30_lora
- Modelo base SFT: https://huggingface.co/didula-wso2/gemma4_1-0-8_sft_16bit_vllm
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de vLLM: https://docs.vllm.ai
- Lenguaje Ballerina: https://ballerina.io
