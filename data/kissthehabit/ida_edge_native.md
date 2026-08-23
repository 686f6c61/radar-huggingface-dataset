# KissTheHabit/IDA_Edge_Native

## Resumen

El modelo IDA_Edge_Native, publicado por la organización KissTheHabit, es una variante dentro de la serie IDA que parece orientada a entornos de borde ("Edge") y a un uso nativo, probablemente integrado en navegadores o aplicaciones locales. El repositorio en Hugging Face está restringido (acceso gated), por lo que los detalles técnicos no son públicos de forma directa. El tamaño del repositorio es de 55,1 GB, lo que sugiere un modelo de gran volumen, aunque no se especifica el número de parámetros ni la arquitectura. La fecha de creación (julio de 2026) y la actualización (agosto de 2026) indican que es un proyecto reciente. No se dispone de documentación oficial, paper ni guía de despliegue en las fuentes encontradas, por lo que la ficha se basa en los metadatos disponibles y en referencias indirectas de la misma organización (modelos `IDA_AI_Native` e `IDA_Edge`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 55,1 GB |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

No se ha publicado información técnica oficial sobre la arquitectura, el proceso de entrenamiento o los datos utilizados. La única pista indirecta proviene de los nombres de los modelos de la misma organización (`IDA_Edge`, `IDA_AI_Native`), que sugieren una orientación hacia el despliegue en dispositivos de borde y una posible integración nativa en aplicaciones, pero no hay confirmación de arquitectura (transformer, MoE, SSM, etc.) ni de detalles de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO).

## Capacidades

No se dispone de información verificada sobre las capacidades del modelo. Al no conocerse su arquitectura ni su entrenamiento, no es posible enumerar habilidades específicas como generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades multilingües o modos de pensamiento. Los metadatos de Hugging Face no incluyen descripción del modelo ni etiquetas funcionales más allá de `tensorboard` y `safetensors`.

## Casos de uso

Dado que no se conocen las capacidades reales del modelo, no se pueden proponer casos de uso concretos y fiables. Cualquier aplicación práctica dependería de la validación previa de sus habilidades y de la documentación que actualmente no está disponible. Se recomienda esperar a la publicación de información oficial antes de considerar su integración en entornos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las referencias externas que mencionan puntuaciones de 100 en MMLU o HumanEval para `IDA_Edge` no proceden de fuentes oficiales y no se pueden verificar, por lo que no se incluyen en esta ficha.

## Requisitos de hardware

No se dispone de especificaciones de hardware oficiales. El tamaño del repositorio (55,1 GB) sugiere que el modelo es considerable, pero sin conocer el número de parámetros ni la arquitectura no se puede estimar la VRAM necesaria. Tampoco se conocen las opciones de despliegue recomendadas (vLLM, llama.cpp, Ollama, TGI, etc.) ni el rendimiento esperado en términos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparación con otros modelos de la misma categoría. No hay datos públicos de parámetros, rendimiento o licencia que permitan una comparación objetiva con alternativas como Llama 3, Mistral o Qwen.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en Hugging Face para su descarga, lo que puede limitar su uso en entornos automatizados.
- Falta de documentación: no se ha publicado ninguna documentación técnica, guía de uso o instrucciones de despliegue.
- Riesgo de desconocimiento de sesgos y alucinaciones: al no existir información sobre el entrenamiento ni evaluaciones, no se puede valorar el riesgo de sesgos o de generación de contenido falso.
- Licencia no definida: no se especifica la licencia, lo que impide conocer si es apto para uso comercial o si tiene restricciones.
- Incertidumbre sobre capacidades: sin datos de rendimiento, no se puede determinar si el modelo es adecuado para tareas concretas.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/KissTheHabit/IDA_Edge_Native](https://huggingface.co/KissTheHabit/IDA_Edge_Native)
- Modelo relacionado `IDA_AI_Native`: [https://huggingface.co/KissTheHabit/IDA_AI_Native](https://huggingface.co/KissTheHabit/IDA_AI_Native)
- Modelo relacionado `IDA_Edge`: [https://huggingface.co/KissTheHabit/IDA_Edge](https://huggingface.co/KissTheHabit/IDA_Edge)
- Referencia externa no oficial (no verificada): [https://openmodelmap.com/model/kissthehabit/ida_edge](https://openmodelmap.com/model/kissthehabit/ida_edge)
- Proyecto NativeMind (no directamente relacionado, pero vinculado en la búsqueda): [https://github.com/NativeMindBrowser/NativeMindExtension](https://github.com/NativeMindBrowser/NativeMindExtension)
