# SolsticeAI/Terminal-RSI-27B-Q8_0-GGUF

## Resumen

Terminal-RSI-27B es un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) desarrollado por SolsticeAI, especializado en tareas de agente de terminal y razonamiento multi-paso. El modelo se distribuye en formato GGUF con cuantización Q8_0 bajo el identificador SolsticeAI/Terminal-RSI-27B-Q8_0-GGUF, y deriva del checkpoint base Teriminal-RSI/Terminal-RSI-27B. Está etiquetado con el identificador de arquitectura `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5, aunque la model card no detalla la arquitectura interna.

El modelo se presenta como un agente de terminal entrenado mediante aprendizaje por refuerzo con un esquema de auto-mejora recursiva (Recursive Self-Improvement, RSI). Según el paper asociado (arXiv:2610.22192), el entrenamiento alterna una fase de Recursive Self-Rewrite (RSR) sobre trayectorias verificadas con una fase de Recursive Policy-Refine (RPR) que hereda el crítico, e introduce Turn-Boundary Skip-Observation GAE (TB-GAE) para retener baselines específicos por token. El objetivo es convertir resultados de verificadores en actualizaciones de política útiles y transformar progreso parcial en resolución completa de tareas.

Su relevancia actual radica en que aborda un problema concreto de los agentes de terminal: la brecha entre ejecutar comandos correctamente y completar tareas de extremo a extremo. La licencia Apache 2.0 y la disponibilidad en GGUF lo hacen desplegable en entornos locales con llama.cpp, lo que facilita su evaluación en pipelines de agentes sin depender de APIs externas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`; detalles internos no disponibles) |
| Parámetros totales | 27.320.697.856 (~27,3 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card usa `-c 2048` en el ejemplo de servidor, pero no se declara la ventana máxima) |
| Tipos de cuantización | Q8_0 (esta variante); el repo base podría ofrecer otras, no confirmado |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 29,0 GB); el modelo base usa safetensors |
| Modelo base | Teriminal-RSI/Terminal-RSI-27B |
| Pipeline | text-generation |
| Librería declarada | transformers (con soporte llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y el pipeline de generación de texto. El dato de parámetros (27.320.697.856) corresponde a los safetensors del modelo base y es coherente con un transformer denso de aproximadamente 27 mil millones de parámetros, sin indicios de mezcla de expertos. No se especifican número de capas, dimensión oculta, cabezas de atención ni mecanismos de atención lineal o decodificación especulativa.

El entrenamiento se describe en el paper arXiv:2610.22192 como un proceso de aprendizaje por refuerzo con auto-mejora recursiva. El esquema alterna Recursive Self-Rewrite (RSR) sobre trayectorias verificadas y Recursive Policy-Refine (RPR) con herencia del crítico. La innovación técnica declarada es Turn-Boundary Skip-Observation GAE (TB-GAE), que aplica baselines específicos por token respetando los límites de turno y omitiendo observaciones del entorno en el cálculo de ventajas. No se indica el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional y de propósito general (pipeline `text-generation`).
- Ejecución de tareas de agente de terminal: interpretación de comandos, lectura de salidas y planificación multi-paso.
- Razonamiento multi-paso orientado a completar tareas de extremo a extremo, no solo pasos aislados.
- Generación y manipulación de código, con etiqueta explícita `code`.
- Soporte de contexto largo (etiqueta `long-context`), aunque la longitud máxima no está declarada.
- Capacidades multilingües limitadas a inglés y chino.
- Integración con llama.cpp mediante CLI y servidor compatible con endpoints.
- No se declara soporte explícito de tool calling, function calling, visión ni audio en la información disponible.

## Casos de uso

- Automatización de tareas de administración de sistemas: el modelo puede interpretar una instrucción en lenguaje natural, ejecutar comandos de shell, leer la salida y decidir el siguiente paso, aprovechando su entrenamiento específico en trayectorias de terminal verificadas.
- Agentes de resolución de incidencias en CI/CD: dado un fallo de build, el modelo puede inspeccionar logs, ejecutar comandos de diagnóstico y proponer o aplicar correcciones dentro de un pipeline, con la ventaja de su entrenamiento en tareas de extremo a extremo.
- Asistente de línea de comandos local: desplegado con llama.cpp en una estación de trabajo, ofrece sugerencias de comandos y explicaciones sin enviar datos a servicios externos, gracias al formato GGUF y la licencia Apache 2.0.
- Generación de scripts de automatización: el modelo puede producir scripts de shell o Python a partir de una descripción, con la etiqueta `code` como indicio de capacidades de programación.
- Evaluación de investigación en RL para agentes: el checkpoint sirve como referencia reproducible para estudiar esquemas de auto-mejora recursiva y TB-GAE en entornos de terminal.
- Procesamiento de documentación técnica bilingüe inglés-chino: el modelo puede resumir o transformar documentación en ambos idiomas, aunque no se garantiza calidad en otros idiomas.
- Prototipado de agentes conversacionales con contexto largo: la etiqueta `long-context` sugiere utilidad en conversaciones multi-turno con historial extenso, aunque la ventana real debe verificarse empíricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas y el resumen del paper accesible no proporciona tablas numéricas comparativas.

## Requisitos de hardware

- VRAM estimada para Q8_0: aproximadamente 29 GB solo para los pesos, más overhead de contexto y caché KV; en la práctica se necesitan 32 GB o más para contextos moderados.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB o RTX A6000 48 GB para Q8_0 con contexto amplio.
- GPU de consumo: una RTX 4090 de 24 GB no puede alojar Q8_0 completa en VRAM; requeriría cuantizaciones menores (Q4_K_M, Q5_K_M) no incluidas en este repo, o descarga parcial a CPU con penalización de latencia.
- Despliegue: llama.cpp (CLI y servidor), según los ejemplos de la model card; también compatible con el ecosistema transformers para el modelo base en safetensors.
- Latencia y throughput: no disponibles. El ejemplo de servidor de la model card usa `-c 2048`, un contexto conservador que sugiere que valores mayores incrementan el consumo de memoria de forma significativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Terminal-RSI-27B (este) | ~27,3 B | no disponible | Apache 2.0 | GGUF Q8_0, safetensors (base) | Agente de terminal con RL y auto-mejora recursiva |
| Qwen 3.5 (familia base, referencia) | varía según variante | no disponible en la información | según variante | safetensors, GGUF | Modelo generalista; Terminal-RSI deriva de esta etiqueta |
| Alternativas de agente de código de ~30 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- La longitud de contexto no está declarada; el ejemplo de la model card usa 2048 tokens, lo que puede ser insuficiente para tareas de agente con historiales largos.
- Riesgo de alucinación en la generación de comandos: un agente de terminal que ejecuta comandos incorrectos puede causar daños en el sistema; se recomienda sandboxing y validación humana.
- El modelo está entrenado con RL sobre trayectorias verificadas, pero no se documentan los verificadores ni los sesgos del dataset de entrenamiento.
- No se declara soporte de tool calling estructurado; la integración con herramientas externas debe implementarse a nivel de orquestación.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es de un autor distinto (Teriminal-RSI) y conviene verificar la cadena de licencias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de calidad ni validación independiente.
- El tamaño del repo (29,0 GB) y la cuantización Q8_0 limitan el despliegue a hardware de gama alta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SolsticeAI/Terminal-RSI-27B-Q8_0-GGUF
- Modelo base: https://huggingface.co/Teriminal-RSI/Terminal-RSI-27B
- Paper (arXiv:2610.22192), resumen en Emergent Mind: https://www.emergentmind.com/papers/2610.22192
- Conversión GGUF alternativa (bartowski): https://huggingface.co/bartowski/Teriminal-RSI_Terminal-RSI-27B-GGUF
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- llama.cpp: https://github.com/ggerganov/llama.cpp
