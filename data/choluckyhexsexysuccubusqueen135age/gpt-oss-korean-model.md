# ChoLuckyHexSexySuccubusQueen135Age/gpt-oss-korean-model

## Resumen

`gpt-oss-korean-model` es un adaptador LoRA publicado en Hugging Face por el usuario ChoLuckyHexSexySuccubusQueen135Age, construido sobre el modelo base `unsloth/gpt-oss-20b`. Su propósito declarado es la generación de contenido educativo en coreano: explicaciones de matemáticas, ciencias, lengua y ciencias sociales orientadas a materiales de texto escolar. El entrenamiento se realizó con la librería Unsloth sobre el dataset `maywell/korean_textbooks`, un corpus de libros de texto coreanos.

El modelo no es un modelo completo, sino un adaptador PEFT (LoRA) que debe cargarse junto al modelo base de 20.000 millones de parámetros. Según la model card, el ajuste consistió en solo 30 pasos de entrenamiento con rango LoRA 8 y alpha 16, aplicado sobre las proyecciones de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). Esta configuración extremadamente ligera sugiere un ajuste de estilo y dominio más que una especialización profunda.

La relevancia del proyecto es limitada: se trata de un experimento de fine-tuning de bajo coste, con cero descargas y cero likes en el momento de la consulta, y sin benchmarks publicados. Resulta útil como ejemplo de pipeline Unsloth + PEFT para adaptar un modelo grande a un dominio educativo en un idioma específico, pero no como un modelo de producción validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base `unsloth/gpt-oss-20b`); adaptador LoRA sobre atención y MLP |
| Parametros totales | 20B en el modelo base; el adaptador LoRA es de rango 8 (tamaño del repo: 0.0 GB) |
| Parametros activos | no disponible (el modelo base gpt-oss-20b es de arquitectura MoE según su familia, pero la model card no detalla el reparto de expertos) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no disponible para el adaptador; el base se entrenó desde `unsloth/gpt-oss-20b-unsloth-bnb-4bit` (4 bits) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el base en safetensors/GGUF según el repositorio de Unsloth |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/gpt-oss-20b`, un modelo de la familia GPT-OSS de OpenAI con arquitectura transformer y mezcla de expertos (MoE), aunque la model card no aporta detalles sobre el número de expertos, el reparto de parámetros activos ni el contexto nativo. El ajuste se realizó con LoRA de rango 8 y alpha 16 sobre las siete proyecciones lineales habituales, lo que supone un número muy reducido de parámetros entrenables.

El entrenamiento consistió en 30 pasos sobre el dataset `maywell/korean_textbooks`, partiendo del checkpoint cuantizado a 4 bits de Unsloth. No se documentan tokens totales, composición del dataset, técnicas de alineación (RLHF/DPO) ni procesos de evaluación. La innovación técnica destacable es el uso del stack Unsloth para fine-tuning eficiente en memoria, que permite ajustar un modelo de 20B en hardware de consumo con cuantización de 4 bits.

## Capacidades

- Generación de texto conversacional en coreano con plantilla de chat (`apply_chat_template`).
- Explicación de conceptos matemáticos: potencias, álgebra, geometría y cálculo, según la model card.
- Explicación de principios científicos de física, química y biología, incluyendo interpretación de experimentos.
- Gramática y vocabulario coreanos, análisis literario y técnicas de escritura.
- Contenido de ciencias sociales: historia, geografía, instituciones y cultura.
- Formato de instrucción multi-turno mediante roles `system` y `user`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de material didáctico de matemáticas en coreano: el modelo puede redactar explicaciones paso a paso de conceptos como potencias o ecuaciones, aprovechando el ajuste sobre libros de texto coreanos para adoptar un registro escolar.
- Asistencia a estudiantes de secundaria en coreano: resolución comentada de problemas de álgebra y geometría con lenguaje adaptado al nivel educativo, siempre con revisión humana por el riesgo de alucinación.
- Creación de guiones para clases de ciencias: descripciones de experimentos de física o química y su interpretación, útiles como borrador para profesores que luego validan el contenido.
- Práctica de gramática y redacción coreanas: generación de ejercicios, correcciones estilísticas y análisis de textos literarios en coreano.
- Elaboración de resúmenes de historia y geografía de Corea: síntesis de eventos, personajes y conceptos geográficos para apuntes o fichas de estudio.
- Prototipado de asistentes educativos en coreano: integración del adaptador sobre el base en un pipeline de `transformers` + `peft` para experimentar con respuestas educativas antes de invertir en un fine-tuning mayor.
- Investigación sobre fine-tuning eficiente: caso de estudio reproducible del flujo Unsloth + LoRA con 30 pasos para evaluar el impacto de ajustes mínimos en dominios especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: mínimo 16 GB según la model card, recomendado 24 GB o más; con el base en 4 bits (bnb-4bit) el adaptador añade una sobrecarga mínima.
- GPU recomendadas: A100 40/80 GB, H100 para inferencia en fp16 sin cuantizar; RTX 4090 (24 GB) o RTX A6000 (48 GB) para el base cuantizado a 4 bits.
- GPU de consumo: cabe en RTX 4090 y, con cuantización agresiva del base, potencialmente en GPUs de 16 GB; no se garantiza en GPUs de 8-12 GB.
- RAM del sistema: mínimo 16 GB según la model card.
- Despliegue: `transformers` + `peft` (flujo documentado); para el base son aplicables vLLM, TGI o llama.cpp/GGUF, aunque el adaptador LoRA requiere fusión previa o soporte de adaptadores en el servidor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| gpt-oss-korean-model (este) | 20B (base) + LoRA r8 | no disponible | coreano | Apache 2.0 | safetensors (PEFT) | 30 pasos de entrenamiento, sin benchmarks |
| unsloth/gpt-oss-20b (base) | 20B | no disponible en la información | multilingüe | Apache 2.0 | safetensors, GGUF | Modelo generalista sin ajuste educativo |
| Alternativas coreanas especializadas (p. ej. Polyglot-Ko, KULLM) | 1.3B-13B | variable | coreano | variable | safetensors, GGUF | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Entrenamiento extremadamente corto (30 pasos) con rango LoRA 8: el efecto del ajuste puede ser superficial y limitado al estilo, no al conocimiento factual.
- Riesgo elevado de alucinación en contenido educativo: la model card exige verificación factual de todo lo generado.
- Rendimiento limitado fuera del coreano; el adaptador está entrenado solo con datos en `ko`.
- El identificador del adaptador en el código de ejemplo (`kisscuseme/gpt-oss-korean-model`) no coincide con el ID del repositorio, lo que puede provocar errores de carga.
- No hay información sobre el contexto máximo, los parámetros activos del MoE ni la composición del dataset de entrenamiento.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y del dataset `maywell/korean_textbooks` antes de un uso comercial.
- Cero descargas y cero likes: no existe validación comunitaria ni informes de uso en producción.
- El perfil del autor incluye otros repositorios de temática no educativa, lo que aconseja tratar este modelo con cautela y auditar su comportamiento.
- No se documentan evaluaciones de sesgo, seguridad ni robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChoLuckyHexSexySuccubusQueen135Age/gpt-oss-korean-model
- Modelo base: https://huggingface.co/unsloth/gpt-oss-20b
- Dataset: https://huggingface.co/datasets/maywell/korean_textbooks
- Otros repositorios del autor: https://huggingface.co/ChoLuckyHexSexySuccubusQueen135Age/sexyGPT-Uncensored
- Otros repositorios del autor: https://huggingface.co/ChoLuckyHexSexySuccubusQueen135Age/sexykogpt-2-uncensored-q4_0.gguf
