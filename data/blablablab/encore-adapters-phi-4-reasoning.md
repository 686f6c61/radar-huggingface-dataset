# Blablablab/EnCoRe-adapters-phi-4-reasoning

## Resumen

EnCoRe-adapters-phi-4-reasoning es un conjunto de adaptadores LoRA (PEFT) desarrollado por el usuario Blablablab que se aplica sobre el modelo base microsoft/Phi-4-reasoning. Su propósito es mejorar el comportamiento del modelo en escenarios de *code-switching* (alternancia de idiomas dentro de una misma conversación o frase) y razonamiento multilingüe, cubriendo amhárico (am), hindi (hi), indonesio (id), igbo (ig), malayo (ms), suajili (sw), yoruba (yo) e inglés (en). No se trata de un modelo completo, sino de pesos incrementales que deben combinarse con el checkpoint base para su uso.

El proyecto se apoya en el dataset propio Blablablab/EnCoRe y en el artículo arXiv:2604.15490, y se distribuye con licencia MIT, aunque el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face. El tamaño del repositorio (4,5 GB) corresponde a los pesos de los adaptadores en formato safetensors, no al modelo base completo, que debe descargarse por separado.

Su relevancia actual radica en que aborda un hueco frecuente en los modelos abiertos: el razonamiento consistente cuando el usuario mezcla idiomas de bajos recursos con inglés. En lugar de reentrenar el modelo completo, ofrece una vía de bajo coste computacional para adaptar un modelo ya capaz (Phi-4-reasoning) a dominios lingüísticos poco representados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre transformer decoder (base: microsoft/Phi-4-reasoning) |
| Parametros totales | No disponible (adaptadores LoRA; el modelo base Phi-4-reasoning tiene 14B según su ficha oficial, dato no confirmado en la información proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la información proporcionada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | am, hi, id, ig, ms, sw, yo, en |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA empaquetados con la librería PEFT, pensados para inyectarse en las capas del modelo base microsoft/Phi-4-reasoning. Al ser LoRA, no modifica los pesos originales: añade matrices de bajo rango entrenadas para una tarea concreta. La arquitectura subyacente es, por tanto, la del transformer decoder de Phi-4-reasoning, cuyos detalles concretos (número de capas, dimensión oculta, esquema de atención) no se detallan en la información disponible.

El entrenamiento se realizó sobre el dataset Blablablab/EnCoRe, orientado a code-switching y razonamiento multilingüe, y está documentado en el artículo arXiv:2604.15490. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset, el rango de los adaptadores ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá del propio ajuste LoRA sobre datos de alternancia de idiomas.

## Capacidades

- Generación de texto con razonamiento multi-paso, heredada del modelo base Phi-4-reasoning.
- Manejo de code-switching: alternancia entre inglés y los siete idiomas objetivo (am, hi, id, ig, ms, sw, yo) dentro de una misma interacción.
- Razonamiento multilingüe en idiomas de bajos recursos, con especial énfasis en lenguas africanas (igbo, yoruba, suajili, amhárico) y del sudeste asiático (indonesio, malayo).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada; dependería de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado para los adaptadores, aunque el modelo base está orientado a razonamiento.
- Capacidades multilingües limitadas a los ocho idiomas listados; no se garantiza cobertura de otros.
- No se documentan capacidades de visión, audio ni modo *thinking* específico de los adaptadores.

## Casos de uso

- Atención al cliente multilingüe en mercados africanos y asiáticos: el adaptador permite mantener conversaciones donde el usuario alterna suajili, yoruba o indonesio con inglés, sin perder coherencia en el razonamiento.
- Asistentes de soporte técnico para comunidades bilingües: útil cuando el usuario formula la pregunta en un idioma local y espera explicaciones técnicas en inglés (o viceversa), manteniendo el hilo lógico.
- Traducción asistida con razonamiento: el modelo puede explicar el porqué de una traducción o resolver ambigüedades cuando la frase mezcla dos idiomas.
- Educación y tutorización: generación de explicaciones paso a paso en hindi, malayo o amhárico combinadas con terminología técnica en inglés.
- Procesamiento de documentación y tickets de soporte con code-switching: normalización y resumen de incidencias redactadas en mezcla de idiomas.
- Investigación en lingüística computacional: evaluación de modelos abiertos en tareas de alternancia de código y razonamiento en lenguas de bajos recursos.
- Moderación y análisis de contenido multilingüe: clasificación y resumen de textos donde los usuarios alternan idiomas, aprovechando la ventana de contexto del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para los adaptadores; al requerir el modelo base Phi-4-reasoning, la VRAM dependerá de su tamaño y de la cuantización empleada (no confirmada).
- GPU recomendadas: no disponibles en la información proporcionada; dependerán del modelo base.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base determina si cabe en tarjetas como RTX 4090.
- Opciones de despliegue: al ser adaptadores PEFT, se integran con la pila de Hugging Face (transformers + peft); la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA para code-switching sobre modelos de razonamiento) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- No es un modelo autónomo: requiere descargar y cargar el modelo base microsoft/Phi-4-reasoning, con sus propios requisitos de licencia y hardware.
- Cobertura lingüística limitada a ocho idiomas; el rendimiento fuera de ellos no está garantizado.
- No se documentan sesgos conocidos ni tasas de alucinación específicas; al heredar el comportamiento del modelo base, arrastra sus sesgos y riesgos.
- Licencia MIT para los adaptadores, pero el uso comercial debe verificar también la licencia del modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa del beneficio del adaptador frente al modelo base sin ajustar.
- Repositorio con cero descargas y cero likes en el momento de la consulta: proyecto reciente y sin validación comunitaria.
- Fecha de creación indicada como 2026-11-27, posterior a la fecha habitual de referencia; conviene verificar la vigencia de los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/Blablablab/EnCoRe-adapters-phi-4-reasoning
- Dataset: https://huggingface.co/datasets/Blablablab/EnCoRe
- Artículo: https://arxiv.org/abs/2604.15490
- Modelo base: https://huggingface.co/microsoft/Phi-4-reasoning
