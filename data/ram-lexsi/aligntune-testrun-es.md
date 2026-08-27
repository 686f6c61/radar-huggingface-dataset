# ram-lexsi/aligntune-testrun-ES

## Resumen

`ram-lexsi/aligntune-testrun-ES` es un adaptador LoRA de ajuste fino (finetune) construido sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`, desarrollado por Lexsi Labs como parte de su herramienta de alineación post-entrenamiento AlignTune. El repositorio se presenta como una prueba de concepto (testrun) para validar el flujo de trabajo de AlignTune con un modelo pequeño, orientado a demostrar la integración con el backend TRL y la publicación de artefactos tipo adapter en Hugging Face.

El modelo resuelve el problema de cómo empaquetar y distribuir un ajuste fino eficiente sobre un modelo instructivo ya existente, sin necesidad de publicar los pesos completos. Su relevancia actual radica en que ejemplifica el uso de AlignTune, una librería modular que soporta SFT, DPO, PPO, SimPO y otros métodos de alineación, y que permite a desarrolladores e investigadores reproducir flujos de alineación sobre cualquier modelo open source. Al estar basado en Qwen2.5-0.5B-Instruct, hereda una arquitectura transformer de 0.5 mil millones de parámetros con una ventana de contexto de 32 768 tokens, aunque el adaptador en sí no modifica esas características.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5, causal LM) |
| Parametros totales | 0.5 mil millones (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base puede cuantizarse con GPTQ, AWQ, GGUF, etc.) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5-0.5B-Instruct soporta principalmente ingles y chino, con algo de multilingue) |
| Licencia | no disponible (el modelo base usa Apache 2.0, pero la licencia del adaptador no se especifica) |
| Formato de pesos | safetensors (adapter LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen/Qwen2.5-0.5B-Instruct`, un modelo transformer causal con 0.5 mil millones de parametros, 24 capas, 14 cabezas de atencion y una dimension oculta de 896. El modelo base ya incorpora un entrenamiento instructivo con SFT y RLHF, y soporta una ventana de contexto de 32 768 tokens. El adaptador LoRA se genera mediante el backend TRL de AlignTune, que abstrae el bucle de entrenamiento y permite aplicar algoritmos de alineacion como SFT, DPO o PPO. No se proporcionan detalles sobre el dataset utilizado, el numero de pasos de entrenamiento, la tasa de aprendizaje ni el rango del adaptador. El repositorio indica que el artefacto es un adapter, por lo que debe cargarse sobre el modelo base mediante PEFT.

## Capacidades

- Generacion de texto instructivo: al ser un adaptador sobre Qwen2.5-0.5B-Instruct, hereda la capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Razonamiento basico: el modelo base de 0.5B ofrece capacidades limitadas de razonamiento logico y matematico, adecuadas para tareas sencillas.
- Generacion de codigo: el modelo base tiene cierta competencia en codigo, aunque limitada por su tamano.
- Soporte de tool calling: el modelo base Qwen2.5-0.5B-Instruct no incluye soporte nativo de function calling en su version mas pequena; no se ha anadido en el adaptador.
- Capacidades multilingues: el modelo base esta entrenado principalmente en ingles y chino; el adaptador no especifica idiomas adicionales.
- Sin capacidades especiales: no se documenta modo thinking, vision ni audio.

## Casos de uso

- Validacion de pipelines de alineacion: el adaptador sirve como ejemplo de referencia para equipos que quieran probar AlignTune con un modelo pequeno antes de escalar a modelos mayores.
- Prototipado rapido de asistentes conversacionales: se puede cargar sobre Qwen2.5-0.5B-Instruct para experimentar con respuestas instructivas en entornos de desarrollo con recursos limitados.
- Educacion e investigacion: util para estudiar el efecto de LoRA sobre un modelo base pequeno, comparando el comportamiento antes y despues del ajuste.
- Pruebas de integracion con TRL y PEFT: desarrolladores que trabajen con la libreria transformers pueden usar este adaptador para verificar la carga correcta de adaptadores en sus propios sistemas.
- Benchmarking de eficiencia: permite medir el coste de inferencia de un modelo de 0.5B con adaptador en diferentes hardware, desde CPU hasta GPU de gama media.
- Base para experimentos de alineacion adicionales: al ser un adapter, se puede combinar con otros adaptadores o continuar el entrenamiento con otros algoritmos de AlignTune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Dado que el modelo base Qwen2.5-0.5B-Instruct tiene resultados publicos (por ejemplo, MMLU alrededor de 48.9, HumanEval alrededor de 25.6), el adaptador podria modificar ligeramente esas cifras, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0.5B en precision FP16 ocupa aproximadamente 1 GB de VRAM. Con el adaptador LoRA, el uso adicional es minimo (menos de 100 MB). En cuantizacion INT4, el modelo base puede caber en menos de 500 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente para inferencia en FP16. Para entrenamiento del adaptador, se recomienda al menos 4 GB de VRAM.
- Compatibilidad con consumer GPU: si, cabe en practicamente cualquier GPU de consumo actual, incluidas las integradas de gama alta.
- Opciones de despliegue: se puede usar con transformers y PEFT directamente, o exportar a GGUF para llama.cpp y Ollama. Tambien es compatible con vLLM y TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no se han publicado mediciones especificas. En una GPU moderna, la generacion de tokens deberia ser de decenas de tokens por segundo, dado el tamano reducido del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ram-lexsi/aligntune-testrun-ES | 0.5B (base) | 32 768 | no disponible | Adaptador LoRA sobre Qwen2.5-0.5B-Instruct |
| Qwen/Qwen2.5-0.5B-Instruct | 0.5B | 32 768 | Apache 2.0 | Modelo base sin adaptador |
| TinyLlama-1.1B-Chat | 1.1B | 2048 | Apache 2.0 | Modelo instructivo completo, mayor tamano |
| Microsoft/Phi-3-mini-4k-instruct | 3.8B | 4096 | MIT | Modelo instructivo mas grande, mejor rendimiento |

La comparativa muestra que este adaptador no es un modelo autonomo, sino una modificacion ligera de un modelo base ya existente. Su principal valor es demostrativo, no de rendimiento bruto.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Qwen2.5-0.5B-Instruct puede presentar sesgos derivados de sus datos de entrenamiento, principalmente en ingles y chino. El adaptador no corrige estos sesgos.
- Riesgo de alucinacion: al ser un modelo de 0.5B, la tasa de alucinacion es alta en tareas complejas; no es adecuado para produccion sin validacion externa.
- Limitaciones de contexto: aunque la ventana es de 32 768 tokens, el modelo pequeno degrada su rendimiento con contextos largos; se recomienda mantener entradas por debajo de 4 000 tokens para resultados estables.
- Restricciones de licencia: la licencia del adaptador no esta especificada. El modelo base usa Apache 2.0, pero el adaptador podria tener restricciones adicionales; consultar con el autor antes de uso comercial.
- Advertencia de produccion: este repositorio es una prueba de concepto (testrun) y no se ha validado para casos de uso reales. No se recomienda su despliegue en entornos criticos sin una evaluacion exhaustiva.
- Dependencia del modelo base: el adaptador solo funciona cargado sobre Qwen/Qwen2.5-0.5B-Instruct; no es un modelo autonomo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ram-lexsi/aligntune-testrun-ES
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- AlignTune (pagina oficial): https://aligntune.lexsi.ai/
- AlignTune (GitHub): https://github.com/Lexsi-Labs/aligntune
- Lexsi Labs (herramientas): https://lexsi.ai/tools/aligntune
- Repositorio relacionado (testrun-compose): https://huggingface.co/ram-lexsi/aligntune-testrun-compose
- Repositorio relacionado (testrun-merge-models): https://huggingface.co/ram-lexsi/aligntune-testrun-merge-models
