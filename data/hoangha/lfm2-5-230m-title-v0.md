# HoangHa/lfm2.5-230m-title-v0

## Resumen

`HoangHa/lfm2.5-230m-title-v0` es un adaptador LoRA (PEFT) desarrollado por HoangHa sobre el modelo base `LiquidAI/LFM2.5-230M`, un modelo abierto de 230 millones de parámetros de Liquid AI. El adaptador está entrenado para generar títulos cortos de sesión a partir de consultas de usuario, en 17 idiomas, y se presenta como un candidato de investigación interna, no como una versión de producción.

El repositorio contiene únicamente el adaptador LoRA (0.1 GB), no el modelo completo. Para utilizarlo se requiere acceso tanto al adaptador como al modelo base. La tarea concreta es la generación de un título breve para una conversación o sesión, siguiendo un contrato de prompt específico usado durante el entrenamiento. El modelo está especializado en esa tarea y no debe emplearse como asistente general ni como fuente de hechos.

La relevancia de este adaptador radica en su enfoque de fine-tuning eficiente con LoRA sobre un modelo pequeño, lo que permite tareas de generación de texto multilingües con un coste de despliegue bajo. Sin embargo, su naturaleza privada y de investigación limita su uso a entornos controlados y con validación adicional por parte de la aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LFM2.5-230M (arquitectura del modelo base no especificada en la información disponible) |
| Parametros totales | No disponible (el adaptador ocupa 0.1 GB; el modelo base es de 230M) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 8,192 tokens (máxima secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Alemán, inglés, español, filipino, francés, indonesio, japonés, coreano, lao, malayo, birmano, portugués, ruso, tamil, tailandés, vietnamita y chino |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador) |

## Arquitectura y entrenamiento

El adaptador es un LoRA PEFT con rank 128 y alpha 256, aplicado a todos los módulos lineales del modelo base `LiquidAI/LFM2.5-230M`. El objetivo de entrenamiento es un SFT de lenguaje causal con respuesta únicamente (response-only causal-language-model SFT), diseñado para generar un título corto de sesión a partir de una consulta de usuario.

El entrenamiento se realizó sobre el dataset `HoangHa/meddies-title`, configuración `title_sft_v0`, con 68,961 filas de entrenamiento y 3,639 de validación. Se completó una época, con 4,311 pasos de optimizador y 1,687,393 tokens objetivo no enmascarados. La longitud máxima de secuencia fue de 8,192 tokens, con learning rate 0.0004, batch por dispositivo 2, acumulación de gradientes 4 y semilla 3407. El entrenamiento se ejecutó con `transformers==5.5.0`, `peft==0.19.1`, `torch==2.10.0` y `unsloth==2026.5.2`, en dos GPUs Tesla T4.

La partición de datos incluyó comprobaciones para evitar colisiones entre entrenamiento, validación y consultas de benchmark reservadas. Veinticuatro consultas de entrenamiento y una de validación requirieron truncamiento medio bajo el límite de 8,192 tokens.

## Capacidades

- Generación de títulos cortos de sesión a partir de consultas de usuario, siguiendo el contrato de prompt de sistema y usuario usado durante el entrenamiento.
- Soporte multilingüe en 17 idiomas: alemán, inglés, español, filipino, francés, indonesio, japonés, coreano, lao, malayo, birmano, portugués, ruso, tamil, tailandés, vietnamita y chino.
- Adaptador ligero LoRA, pensado para fine-tuning eficiente sobre un modelo base pequeño.
- No es un asistente general, ni un modelo de decisiones clínicas, ni un contestador de hechos, ni un clasificador de seguridad.
- Requiere el prompt congelado de la pipeline Meddies; no debe sustituirse por instrucciones genéricas.
- No reemplaza la validación de títulos a nivel de aplicación (idioma, longitud, privacidad, formato).

## Casos de uso

- Historial de chat: el adaptador genera un título breve para cada conversación a partir de la primera consulta, lo que facilita la navegación en listados de chats. Es adecuado porque está entrenado específicamente para esa tarea y produce salidas cortas.
- Paneles de soporte al cliente: los tickets de soporte pueden etiquetarse automáticamente con un título corto que resuma la consulta del usuario, mejorando la organización y búsqueda en colas de trabajo.
- Aplicaciones multilingües: al soportar 17 idiomas, el adaptador permite generar títulos localizados en interfaces de usuario sin necesidad de modelos separados por idioma.
- Historial de búsqueda: las consultas de búsqueda pueden agruparse en sesiones mediante un título generado, lo que ayuda a los usuarios a revisar sus actividades anteriores.
- Previsualización de contenido en listados: en aplicaciones que muestran artículos o entradas, el adaptador puede generar títulos cortos a partir de consultas o descripciones, útil para listados dinámicos.
- Investigación interna en NLP: el adaptador sirve como caso de estudio para evaluar el fine-tuning con LoRA sobre modelos pequeños en tareas de generación de texto multilingüe, especialmente en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La evaluación interna reporta una loss de validación de `1.254838228225708` y un throughput de `10.271` muestras/s en el split de validación de 3,639 filas, pero no se trata de benchmarks estándar como MMLU, HumanEval o GSM8K. El benchmark reservado de 3,400 grupos no ha sido reportado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador ocupa 0.1 GB y el modelo base es de 230M, por lo que se espera un consumo bajo, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible. El entrenamiento se realizó en dos GPUs Tesla T4.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño del modelo base y del adaptador, aunque no hay mediciones confirmadas.
- Opciones de despliegue: no disponible. El código de ejemplo de la model card muestra carga con `transformers` y `peft` (`PeftModel.from_pretrained`).
- Latencia y throughput: se reporta un throughput de evaluación de `10.271` muestras/s, sin especificar hardware ni condiciones de medición.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre adaptadores comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El adaptador está especializado en generación de títulos y puede comportarse de forma impredecible fuera de esa tarea o fuera del formato de prompt de entrenamiento.
- La cobertura en 17 idiomas no establece una calidad uniforme entre lenguas, sistemas de escritura, dominios o longitudes de consulta.
- La loss de validación registrada no es una métrica de calidad orientada al usuario.
- El benchmark reservado no ha sido reportado, por lo que no hay evidencia de rendimiento en ese conjunto.
- El código de aplicación debe imponer restricciones de idioma, longitud de grafemas, privacidad y formato de salida.
- No se ha establecido que el modelo sea seguro para decisiones clínicas ni como fuente de hechos médicos.
- Durante los diagnósticos cualitativos se emitió un aviso de attention mask porque el token de padding coincidía con el token de fin de secuencia. Cualquier evaluación cualitativa debe reejecutarse con una máscara de atención explícita y el contrato de prompt congelado.
- El repositorio es privado y de investigación interna; no es una versión de producción.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/HoangHa/lfm2.5-230m-title-v0
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Blog de Liquid AI sobre LFM2.5-230M: https://www.liquid.ai/blog/lfm2-5-230m
