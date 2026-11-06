# MicahDail/sqlbi-dax-gemma-4-31B-lora

## Resumen

`MicahDail/sqlbi-dax-gemma-4-31B-lora` es un adaptador LoRA (QLoRA) publicado por el usuario MicahDail sobre el modelo base `unsloth/gemma-4-31B-it-unsloth-bnb-4bit`, una versión cuantizada a 4 bits de Gemma 4 31B en su variante instruct, optimizada con Unsloth. El adaptador está especializado en la generación de expresiones DAX para Power BI y en el contexto de SQLBI, lo que lo convierte en un ejemplo de ajuste fino verticalizado sobre un modelo generalista de gran tamano.

El modelo resuelve un problema concreto: los asistentes generalistas suelen producir DAX sintácticamente plausible pero semánticamente incorrecto (medidas mal definidas, uso inadecuado de `CALCULATE`, `FILTER` o contexto de fila frente a contexto de filtro). Un ajuste fino sobre pares de instrucción-respuesta del dominio SQLBI pretende mejorar la corrección de las medidas generadas y la adherencia a las convenciones del ecosistema Power BI.

Es relevante ahora por dos motivos: por un lado, demuestra el patrón de especialización mediante LoRA sobre modelos de 31B cuantizados a 4 bits, que reduce drásticamente los requisitos de entrenamiento; por otro, su publicación es reciente (octubre de 2026), con muy poca tracción (2 descargas, 0 likes) y acceso restringido, lo que lo sitúa en una fase muy temprana de validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Gemma 4 31B instruct, base cuantizada a 4 bits con Unsloth) |
| Parametros totales | No disponible para el adaptador; el modelo base es de 31B (según el identificador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; el modelo base está cuantizado a 4 bits (bnb-4bit) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el repo ocupa 1.0 GB |
| Libreria | peft |
| Modelo base | unsloth/gemma-4-31B-it-unsloth-bnb-4bit |
| Acceso | Restringido (gated): requiere aceptar condiciones en Hugging Face |
| Fecha de publicacion | 2026-10-29 |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo completo, sino un adaptador LoRA entrenado con QLoRA sobre una base Gemma 4 31B instruct cuantizada a 4 bits mediante Unsloth. Esto implica que el entrenamiento se realizó con pesos base congelados en 4 bits y matrices de bajo rango entrenables, lo que reduce el consumo de memoria frente a un ajuste fino completo. El repositorio incluye las etiquetas `lora`, `qlora` y `unsloth`, coherentes con este flujo de trabajo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, el rango y alpha del adaptador, la tasa de aprendizaje ni si se aplicaron etapas de RLHF o DPO. El dominio declarado en las etiquetas es DAX, Power BI y SQLBI, lo que sugiere un corpus de instrucciones y respuestas centrado en la escritura y explicación de medidas DAX, pero no hay detalles publicados sobre su construcción. Tampoco se documentan innovaciones técnicas adicionales más allá del uso de Unsloth para el entrenamiento eficiente.

## Capacidades

- Generación de expresiones DAX para Power BI: medidas calculadas, columnas calculadas y tablas calculadas.
- Explicación de fórmulas DAX y de conceptos de modelado tabular (contexto de fila, contexto de filtro, propagación de filtros).
- Generación de texto conversacional y respuesta a instrucciones, heredada del modelo base instruct.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente; el modelo base es instruct, pero no hay evidencia publicada de comportamiento agéntico tras el ajuste.
- Capacidades multilingües: no disponibles; no se declara ningún idioma en la ficha.
- Capacidades especiales (modo thinking, visión, audio): no disponibles para el adaptador.

## Casos de uso

- Asistencia a analistas de Power BI: el adaptador puede generar medidas DAX a partir de una descripción en lenguaje natural, lo que acelera la creación de informes y reduce errores de sintaxis en equipos con poca experiencia en DAX.
- Revisión y corrección de medidas existentes: dado un DAX propuesto, el modelo puede reescribirlo siguiendo buenas prácticas de SQLBI, como evitar `FILTER` innecesarios sobre tablas grandes o sustituir `SUMX` por `SUM` cuando proceda.
- Documentación automática de modelos tabulares: generar descripciones de medidas y relaciones para catálogos de datos y wikis internas, partiendo del código DAX como entrada.
- Formación interna: actuar como tutor conversacional que explica por qué una medida devuelve resultados distintos según el contexto de evaluación, útil en onboarding de nuevos miembros del equipo de datos.
- Integración en asistentes de BI: conectado a un servicio de inferencia, puede servir como backend de un chatbot que responda preguntas sobre el modelo semántico de una organización, siempre con validación humana de las medidas generadas.
- Prototipado rápido de métricas: generar borradores de medidas para validar definiciones de negocio antes de implementarlas en producción, reduciendo el ciclo de iteración entre negocio y analistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1.0 GB, pero la inferencia requiere cargar el modelo base Gemma 4 31B cuantizado a 4 bits, lo que implica un consumo de VRAM sustancialmente mayor.
- VRAM estimada para el modelo base en 4 bits: aproximadamente 16-20 GB solo para pesos, más overhead de activaciones y caché KV; el total práctico se sitúa por encima de 20 GB para contextos moderados.
- GPU recomendadas: A100 40GB/80GB, H100, L40S o RTX 6000 Ada para despliegue cómodo; en consumer, una RTX 4090 (24 GB) puede ser ajustada y dependerá de la longitud de contexto.
- Despliegue: al ser un adaptador PEFT, requiere cargar el modelo base y aplicar el adaptador con `peft`; para serving se puede usar vLLM o TGI con soporte de adaptadores, o fusionar el adaptador con el modelo base para exportar a GGUF y usar llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MicahDail/sqlbi-dax-gemma-4-31B-lora | 31B (base) + LoRA | No disponible | DAX / Power BI | Apache 2.0 | Gated, 2 descargas |
| Gemma 4 31B instruct (base) | 31B | No disponible | Generalista | Según licencia de Gemma | Publico |
| Adaptadores DAX comunitarios en Hugging Face | Variable | No disponible | DAX / BI | Variable | Variable |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargarlo, lo que complica su uso en pipelines automatizados.
- Tracción mínima: 2 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad ni de evaluaciones independientes.
- Sin benchmarks publicados: no se puede afirmar que el ajuste mejore de forma medible la calidad del DAX frente al modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir funciones DAX inexistentes o argumentos incorrectos; toda medida generada debe validarse contra el motor tabular.
- Sesgo de dominio: el ajuste sobre un corpus específico puede degradar capacidades generales del modelo base si no se aplicó regularización adecuada, algo que no se documenta.
- Idiomas no declarados: se desconoce si el adaptador mantiene el multilingüismo del modelo base o si el corpus de ajuste era únicamente en inglés.
- Licencia Apache 2.0 declarada para el adaptador, pero el uso del modelo base queda sujeto a los términos de Gemma; conviene revisar ambas licencias antes de un despliegue comercial.
- Sin información sobre el dataset de entrenamiento: no es posible auditar posibles sesgos ni la procedencia de los datos.

## Enlaces

- Hugging Face: https://huggingface.co/MicahDail/sqlbi-dax-gemma-4-31B-lora
- Modelo base: https://huggingface.co/unsloth/gemma-4-31B-it-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- SQLBI (referencia del dominio): https://www.sqlbi.com
