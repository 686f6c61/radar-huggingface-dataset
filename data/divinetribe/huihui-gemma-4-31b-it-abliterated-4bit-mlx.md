# divinetribe/Huihui-gemma-4-31B-it-abliterated-4bit-mlx

## Resumen

Huihui-gemma-4-31B-it-abliterated-4bit-mlx es una conversión a 4 bits en formato MLX del modelo Huihui-gemma-4-31B-it-abliterated, que a su vez deriva del Gemma 4 31B Instruct de Google. El trabajo de "abliteration" (eliminación ortogonal de la dirección de rechazo en los pesos) lo realizó huihui-ai; la cuantización y empaquetado para Apple Silicon los firma divinetribe. El resultado es un modelo de lenguaje de 30.697.345.280 parámetros (~30,7 B) que corre íntegramente en local sobre Macs con chip de la familia M.

El modelo resuelve un problema concreto: permitir ejecutar un LLM de ~31 B sin censura en hardware de consumo Apple, sin nube ni claves de API, con un peso en disco de 17,3 GB repartido en cuatro shards. Está pensado para flujos de trabajo de agentes locales, como el proyecto Claude Code Local del mismo autor, que expone una API compatible con Anthropic sobre MLX.

La relevancia actual radica en la combinación de tres factores: el tamaño (31 B, suficiente para tareas de razonamiento y código), la cuantización 4-bit afinada con grupo de 64 que reduce el requisito de memoria a unos 32 GB de RAM unificada, y la naturaleza "abliterated" que elimina los rechazos del modelo instruct original. La licencia declarada es Apache 2.0 y el único idioma listado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer decoder-only, segun la familia Gemma) |
| Parametros totales | 30.697.345.280 (~30,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (via `mlx_lm.convert`); no hay GGUF ni otras precisiones en el repo |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (4 shards, 17,3 GB); no GGUF, no llama.cpp |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Gemma 4 de Google, un transformer decoder-only. El repositorio no detalla la configuración interna (número de capas, dimensiones ocultas, mecanismo de atención) ni el proceso de entrenamiento original: no se indica el número de tokens de preentrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. Tampoco se documenta ninguna innovación técnica específica de esta conversión más allá de la cuantización.

La innovación relevante de esta ficha es el proceso de abliteration aplicado por huihui-ai sobre el modelo instruct: se ortogonaliza la dirección de rechazo fuera de los pesos, de modo que el modelo responde a instrucciones que un instruct estándar declinaría, manteniendo coherencia en tareas ordinarias. Sobre ese modelo, divinetribe aplicó una cuantización 4-bit affine con group size 64 mediante `mlx_lm.convert`, generando pesos MLX safetensors optimizados para la memoria unificada de Apple Silicon.

## Capacidades

- Generación de texto conversacional y de instrucciones en inglés.
- Razonamiento general y respuesta a preguntas, heredado del Gemma 4 31B Instruct.
- Generación de código y tareas de programación, dado el tamaño del modelo y su uso previsto en flujos de agentes.
- Modo sin censura: responde a instrucciones que el modelo instruct original rechazaría, gracias a la abliteration.
- Ejecución 100% local y on-device en Apple Silicon, sin llamadas a API externas.
- Integración con herramientas de agentes locales a través de servidores compatibles con la API de Anthropic (proyecto Claude Code Local).
- Compatibilidad con LM Studio y cualquier runtime que lea modelos MLX.
- No se documenta soporte de tool calling, function calling, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Agentes de código locales: el modelo puede actuar como motor de un agente tipo Claude Code ejecutándose íntegramente en un Mac, sin enviar código a la nube, gracias a su tamaño de 31 B y a la integración con el servidor MLX nativo de la API de Anthropic.
- Asistencia de programación offline: generación y explicación de código en entornos con requisitos de privacidad, donde no se permite el tráfico hacia APIs externas; el modelo cabe en 17,3 GB de disco y corre en 32 GB de RAM unificada.
- Investigación sobre alineación y rechazos: el modelo permite estudiar el comportamiento de un LLM abliterated frente a uno instruct estándar, comparando respuestas a instrucciones sensibles en un entorno controlado y local.
- Prototipado de aplicaciones conversacionales: desarrollo y prueba de chatbots en inglés sobre Apple Silicon sin coste de inferencia en la nube, usando `mlx-lm` o LM Studio.
- Procesamiento de documentos y texto en local: resumen, reescritura y extracción de información de material confidencial que no puede salir del dispositivo.
- Evaluación comparativa de modelos locales: útil para benchmarks de agentes en hardware Apple, como el leaderboard Agent-12 del mismo autor, donde se comparan modelos con las mismas condiciones de hardware.
- Experimentación con cuantización: referencia práctica para estudiar el impacto de la cuantización 4-bit con group size 64 en un modelo de ~31 B sobre memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada: 32 GB recomendados; 24 GB para contextos cortos, según la model card.
- Peso en disco: 17,3 GB en cuatro shards.
- GPU recomendadas: no aplica GPU discreta; el modelo está pensado para Apple Silicon (M1, M2, M3, M4, M5) con memoria unificada.
- Cabe en consumer hardware: sí, en Macs con 24-32 GB de RAM unificada; no está diseñado para GPU NVIDIA ni para llama.cpp.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.generate` y API Python `load`/`generate`), LM Studio y cualquier runtime compatible con MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-gemma-4-31B-it-abliterated-4bit-mlx (este) | ~30,7 B | no disponible | MLX safetensors 4-bit | apache-2.0 | Abliterated, solo Apple Silicon |
| huihui-ai/Huihui-gemma-4-31B-it-abliterated | ~30,7 B (base) | no disponible | safetensors (sin cuantizar) | no disponible en la informacion | Modelo base abliterated, requiere más memoria |
| google/gemma-4-31b-it | ~31 B (base) | no disponible | safetensors | no disponible en la informacion | Instruct original con rechazos |
| Llama 3.3 70B abliterated MLX (colección divinetribe) | 70 B | no disponible | MLX 4-bit | no disponible en la informacion | Mayor tamaño, requiere más RAM |

La comparativa se limita a los modelos citados en la información disponible; no se aportan datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo sin censura: la abliteration elimina los rechazos, por lo que puede generar contenido dañino, ilegal o sesgado; el usuario es responsable de su uso y del cumplimiento legal.
- Solo inglés: el único idioma declarado es `en`; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación: inherente a los LLM de esta escala; no se documentan evaluaciones de fidelidad.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que complica planificar cargas de trabajo con documentos largos.
- Exclusivo de Apple Silicon: no hay GGUF ni soporte para llama.cpp, GPU NVIDIA o CUDA; el despliegue en servidores x86 no es posible con estos pesos.
- Requisito de memoria elevado para consumo: 24-32 GB de RAM unificada limita su uso a Macs de gama alta.
- Licencia: se declara Apache 2.0, pero el modelo base es Gemma de Google; conviene verificar las condiciones de uso comercial de la familia Gemma antes de desplegarlo en producción.
- Sin datos de benchmarks ni de tool calling: no se puede asumir un rendimiento concreto en tareas de agentes o function calling sin evaluarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Huihui-gemma-4-31B-it-abliterated-4bit-mlx
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-gemma-4-31B-it-abliterated
- Modelo original de Google: google/gemma-4-31b-it (referenciado como base, sin URL directa en la información)
- Colección Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil GitHub del autor: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil Hugging Face del autor: https://huggingface.co/divinetribe
- Software del autor: https://nicedreamzwholesale.com/software/
