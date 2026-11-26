# sdevbuildz/Qwen2.5-1.5B-Instruct-TS-GQL

## Resumen

Qwen2.5-1.5B-Instruct-TS-GQL es un adaptador LoRA/PEFT desarrollado por Karan (usuario sdevbuildz) sobre el modelo base Qwen2.5-1.5B-Instruct en su variante cuantizada a 4 bits de Unsloth. No se trata de un modelo independiente, sino de un ajuste fino ligero (rank 16) orientado a la generacion de codigo TypeScript y TSX siguiendo las convenciones arquitectonicas de un repositorio concreto: `sdev-buildz/apollo-state-sync`, centrado en Apollo Client, gestion de cache y variables reactivas.

El adaptador resuelve un problema muy especifico: alinear a un modelo pequeno de 1.5B parametros con los patrones de codigo, imports, tipos y estructura de tests de un unico repositorio, de forma que las completaciones en un IDE resulten idiomaticas para ese proyecto. Su utilidad es, por tanto, acotada y contextual: no aspira a ser un asistente de codigo generalista, sino una herramienta de autocompletado especializada.

Es relevante ahora por dos motivos: demuestra el flujo de trabajo tipico de ajuste fino eficiente con Unsloth sobre GPU de consumo (T4 en Google Colab) y ejemplifica una tendencia creciente de adaptadores de dominio entrenados con datasets pequenos y muy focalizados (444 ejemplos). Su licencia Apache-2.0 y su formato PEFT lo hacen facil de integrar en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2.5) con adaptador LoRA/PEFT |
| Parametros totales | 1.5B (modelo base); el adaptador LoRA supone un subconjunto adicional no cuantificado en la ficha |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima de secuencia usada en entrenamiento); la del modelo base Qwen2.5-1.5B-Instruct es mayor, pero no se especifica en la informacion proporcionada |
| Tipos de cuantizacion | Base en 4-bit (bnb-4bit de Unsloth); el adaptador puede convertirse a GGUF para llama.cpp segun la model card |
| Idiomas soportados | Principalmente ingles en los prompts, con codigo TypeScript y TSX |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); compatible con GGUF tras conversion |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer causal decoder-only de la familia Qwen2.5. El ajuste se realiza mediante LoRA con rango 16 y alpha 16, dropout 0, sobre los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, sin sesgos entrenables. El entrenamiento se ejecuto con la API `FastLanguageModel` de Unsloth sobre una GPU T4 de Google Colab, con el modelo base cuantizado a 4 bits. Las conversaciones ChatML se convirtieron al chat template de Qwen 2.5 con `packing=False`.

Los hiperparametros clave son: longitud maxima de secuencia 2048, batch size 2 con acumulacion de gradiente 4 (batch efectivo 8), 3 epocas, learning rate 2e-4 con scheduler lineal y 5 pasos de calentamiento, optimizador `adamw_8bit`, weight decay 0.01 y gradient checkpointing de Unsloth. El dataset de entrenamiento consta de 444 ejemplos ChatML generados a partir del repositorio `apollo-state-sync`: 178 ejemplos de simbolos TypeScript nombrados, 74 de tests Vitest y Playwright, y 192 de diffs de commits elegibles (descartando los que superan 100 lineas cambiadas). Se excluyen ficheros de test/spec de la extraccion de simbolos y directorios como `node_modules`, `generated`, `dist` y `dist-tsc`.

## Capacidades

- Generacion de implementaciones en TypeScript y TSX siguiendo las convenciones del repositorio `apollo-state-sync`.
- Generacion de codigo de Apollo Client: tipos, cache, variables reactivas y logica de sincronizacion.
- Escritura de tests estilo repositorio con Vitest y Playwright.
- Completado de simbolos a partir de contexto: ruta de fichero, imports disponibles, nombre del simbolo y JSDoc.
- Generacion de mensajes de commit a partir de diffs (pares diff-mensaje aprendidos).
- Conversacion multi-turno mediante el chat template de Qwen 2.5 (formato ChatML).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion proporcionada.
- Capacidad multilingue limitada: prompts principalmente en ingles; el codigo generado es TypeScript/TSX.

## Casos de uso

- Autocompletado en IDE para un repositorio Apollo Client: el adaptador puede integrarse en un asistente local que, dado el contexto de fichero e imports, proponga implementaciones coherentes con las convenciones de `apollo-state-sync`, reduciendo el tiempo de escritura de codigo repetitivo de cache y variables reactivas.
- Generacion de tipos GraphQL y TypeScript: a partir de un esquema o de un simbolo documentado con JSDoc, el modelo propone alias de tipo y estructuras de datos alineadas con el estilo del repositorio.
- Creacion de tests unitarios y end-to-end: dado un simbolo o una funcion, el adaptador genera esqueletos de tests Vitest o Playwright siguiendo los patrones de los 74 ejemplos de test del dataset de entrenamiento.
- Redaccion de mensajes de commit: emparejando un diff con su mensaje, el modelo puede sugerir descripciones de commit consistentes con el historial del proyecto, util en flujos de CI que generan changelogs.
- Asistente local de bajo coste: al ejecutarse sobre un modelo de 1.5B en 4 bits, cabe en GPU de consumo y permite inferencia en local sin enviar codigo propietario a servicios externos, algo relevante para equipos con requisitos de privacidad.
- Prototipado rapido de componentes TSX: para equipos que trabajan con Apollo Client, el adaptador acelera la generacion de componentes conectados a queries y mutaciones, siempre que se proporcione contexto del repositorio en el prompt.
- Onboarding de nuevos desarrolladores: sirve como referencia interactiva de las convenciones del proyecto, respondiendo preguntas sobre como se estructuran cache, tipos y tests en `apollo-state-sync`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el adaptador se evaluo solo con un prompt cualitativo pequeno y que no es un modelo de codigo generalista con benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits ocupa aproximadamente 1 GB de pesos; con overhead de activaciones y contexto de 2048 tokens, se estima un consumo de 2-4 GB de VRAM, aunque no se proporciona una cifra oficial en la informacion disponible.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; el entrenamiento se realizo en una T4 (16 GB) de Google Colab.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; tambien en GPUs integradas con suficiente memoria compartida, aunque con latencia mayor.
- Opciones de despliegue: Transformers + PEFT (flujo documentado en la model card), llama.cpp tras conversion a GGUF, y potencialmente Ollama o vLLM si se genera el artefacto adecuado (no documentado explicitamente).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-TS-GQL | 1.5B (base) + LoRA | 2048 (entrenamiento) | Adaptador LoRA especializado en TypeScript/Apollo | Apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen2.5-1.5B-Instruct (base) | 1.5B | Mayor que 2048 (no especificado aqui) | Modelo instruct generalista | Apache-2.0 | Hugging Face (ampliamente usado) |
| Qwen2.5-Coder-1.5B-Instruct | 1.5B | No disponible en esta ficha | Modelo de codigo generalista | Apache-2.0 | Hugging Face |
| Adaptadores LoRA de dominio (genericos) | Variable | Variable | Ajuste fino especializado | Variable | Hugging Face |

La comparativa con Qwen2.5-Coder-1.5B-Instruct es la mas directa en tamano y tarea de codigo, pero el adaptador TS-GQL esta optimizado para un unico repositorio y no para codigo general. Frente al modelo base, gana en adherencia a convenciones de `apollo-state-sync` y pierde en generalidad.

## Limitaciones y advertencias

- Sesgo de repositorio: el adaptador aprende patrones de un unico proyecto y puede favorecer fuertemente sus convenciones, resultando poco adecuado para otros repositorios sin reentrenamiento o contexto adicional.
- Alucinacion de APIs, tipos, imports y claves de configuracion: la model card advierte explicitamente de este riesgo; el codigo generado no esta garantizado que compile ni que preserve el comportamiento.
- Datos de entrenamiento posiblemente con errores: el dataset puede contener supuestos o bugs propios del repositorio de origen.
- Sin benchmarks: no hay evaluacion cuantitativa publicada; la validacion fue cualitativa y con un unico prompt.
- Contexto limitado a 2048 tokens en entrenamiento, lo que restringe la cantidad de codigo de referencia que se puede inyectar en el prompt.
- Idioma: prompts principalmente en ingles; el soporte en castellano no esta documentado.
- Uso comercial: la licencia Apache-2.0 lo permite, pero se recomienda revisar la licencia del modelo base y del repositorio de origen.
- No sustituye a compilacion, ejecucion de tests ni revision humana; la model card lo desaconseja para decisiones de seguridad, criticas o financieras.
- Temperatura recomendada baja para completados estilo repositorio; sin ella, la calidad puede degradarse.
- Baja adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/sdevbuildz/Qwen2.5-1.5B-Instruct-TS-GQL
- Modelo base en Unsloth: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Repositorio de origen de datos: https://github.com/sdev-buildz/apollo-state-sync
- Proyecto de ajuste fino: https://github.com/sdev-buildz/fine-tuner
- Paper de referencia citado en los tags (QLoRA): https://arxiv.org/abs/1910.09700 (nota: el tag arxiv:1910.09700 corresponde a un paper previo; la referencia QLoRA habitual es arxiv:2305.14314, no incluida en la informacion proporcionada)
