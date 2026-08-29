# shreyansh12183/Vidhi-AI-Instruct

## Resumen

Vidhi-AI-Instruct es un adaptador LoRA de especialización jurídica desarrollado por Shreyansh Singh sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Su objetivo es proporcionar razonamiento legal estructurado y paso a paso para el sistema jurídico indio, con especial atención a los códigos penales modernos (Bharatiya Nyaya Sanhita 2023 y Bharatiya Nagarik Suraksha Sanhita 2023), la recuperación de deudas bajo la SARFAESI Act 2002 y el derecho constitucional de propiedad. Se enmarca en una iniciativa de investigación abierta sobre modelos de lenguaje pequeños (SLM) soberanos y específicos de dominio.

El modelo se distribuye como un adaptador PEFT (LoRA) que debe cargarse junto con el modelo base Qwen2.5-7B-Instruct. El entrenamiento se realizó sobre un conjunto de datos curado de 1.074 pares de razonamiento legal verificado, con el objetivo de mejorar la interpretación estatutaria y la capacidad de razonamiento jurídico frente al modelo base. Su relevancia radica en ofrecer una alternativa especializada y de código abierto para tareas legales en inglés e hindi, sin depender de servicios propietarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA |
| Parametros totales | No disponible (el adaptador LoRA es de tamaño reducido; el modelo base tiene 7.000 millones de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la documentacion) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | Ingles (en), Hindi (hi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=8, alpha=16) aplicado a las proyecciones de atencion Q, K, V y O del modelo base Qwen2.5-7B-Instruct. El entrenamiento se realizo mediante fine-tuning de parametros eficientes (PEFT) sobre un conjunto de datos curado denominado `shreyansh12183/vidhi-ai-1k-curated`, que contiene 1.074 pares de razonamiento legal verificados. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado clasico. La documentacion indica que el modelo esta disenado para producir razonamiento paso a paso (chain-of-thought) en tareas de interpretacion estatutaria, identificando elementos legales, alcance jurisdiccional, mandatos procesales y defensas legales.

## Capacidades

- Razonamiento legal estructurado: genera respuestas paso a paso que desglosan elementos legales, procedimientos y defensas aplicables.
- Interpretacion estatutaria: establece referencias cruzadas entre disposiciones antiguas (IPC/CrPC) y los nuevos codigos BNS/BNSS 2023.
- Jurisprudencia financiera y de propiedad: cubre la ejecucion de activos no productivos (NPA) bajo la SARFAESI Act 2002 y flujos de trabajo de mutacion de ingresos de tierras.
- Generacion de texto conversacional: mantiene dialogos multi-turno en formato de chat, util para consultas legales interactivas.
- Soporte multilingue: opera en ingles e hindi, aunque la documentacion no detalla el grado de competencia en cada idioma.
- No se documenta soporte para tool calling, function calling ni capacidades de agente.

## Casos de uso

- Asistencia a abogados en interpretacion de codigos penales: el modelo puede explicar las diferencias entre disposiciones del IPC y el BNS 2023, ayudando a preparar argumentos o identificar articulos aplicables.
- Analisis de casos de recuperacion de deudas: permite evaluar los requisitos estatutarios para declarar ejecutable un interes de seguridad bajo la seccion 13(2) de la SARFAESI Act, como se muestra en el ejemplo de inferencia de la documentacion.
- Consulta juridica preliminar para ciudadanos: un usuario puede describir una situacion y recibir una orientacion inicial sobre las secciones legales relevantes, con la advertencia de que no sustituye el asesoramiento profesional.
- Formacion y educacion legal: estudiantes de derecho pueden utilizarlo para practicar el razonamiento juridico y comparar interpretaciones entre codigos antiguos y modernos.
- Redaccion de documentos legales preliminares: el modelo puede generar borradores de escritos o resumenes de argumentos basados en los hechos proporcionados, siempre que se verifiquen posteriormente.
- Investigacion juridica: permite explorar la interaccion entre la SARFAESI Act y el derecho constitucional de propiedad, facilitando la identificacion de conflictos normativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval o GSM8K, ni evaluaciones especificas de tareas legales. El autor no ha documentado comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- El adaptador LoRA es ligero (tamano de repositorio 0.0 GB), pero requiere cargar el modelo base Qwen2.5-7B-Instruct completo.
- En precision fp16, el modelo base ocupa aproximadamente 14 GB de VRAM, por lo que se recomienda una GPU con al menos 16 GB (por ejemplo, RTX 4080, RTX 4090, A10G).
- Con cuantizacion de 4 bits (por ejemplo, mediante bitsandbytes), la VRAM necesaria se reduce a unos 4-5 GB, permitiendo su ejecucion en GPUs consumer como RTX 3060 o RTX 4060.
- Opciones de despliegue: transformers con PEFT (como se muestra en el codigo de ejemplo), vLLM (si se fusiona el adaptador con el modelo base), llama.cpp u Ollama (tras convertir el modelo fusionado a GGUF).
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Vidhi-AI-Instruct (adaptador) | 7B (base) | No disponible | Derecho indio (BNS, BNSS, SARFAESI) | Apache-2.0 |
| Qwen2.5-7B-Instruct (base) | 7B | 32K (segun documentacion oficial de Qwen) | Generico, instrucciones | Apache-2.0 |
| LegalBERT (adaptador BERT) | 110M | 512 | Derecho anglosajon, clasificacion | Apache-2.0 |

No se dispone de comparaciones directas con otros modelos legales generativos de tamano similar. La comparativa se limita al modelo base y a un modelo clasico de clasificacion legal, que no es directamente comparable en tareas de generacion.

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy reducido (1.074 pares), lo que puede limitar la generalizacion a casos legales complejos o poco frecuentes.
- El modelo esta especializado exclusivamente en el sistema juridico indio; no es adecuado para otras jurisdicciones.
- Existe riesgo de alucinacion en citas legales, numeros de articulos o interpretaciones; cualquier salida debe ser verificada por un profesional cualificado.
- No se han realizado evaluaciones formales de sesgos, robustez o seguridad; el uso en produccion requiere validacion adicional.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo base Qwen2.5-7B-Instruct tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- La documentacion no especifica la longitud de contexto efectiva tras el fine-tuning, por lo que se recomienda no exceder la ventana del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shreyansh12183/Vidhi-AI-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/shreyansh12183/vidhi-ai-1k-curated (referenciado en la model card, no se ha verificado su disponibilidad)
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
