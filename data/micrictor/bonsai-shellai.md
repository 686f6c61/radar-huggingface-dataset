# micrictor/bonsai-shellai

## Resumen

Bonsai ShellAI es una derivación cuantizada en formato GGUF del modelo instructivo google/gemma-4-E2B-it de Google DeepMind, preparada por el usuario micrictor para la generación de comandos de shell a partir de instrucciones en lenguaje natural. Se trata, por tanto, de un modelo especializado y no de un lanzamiento original: su valor está en el empaquetado extremo (cuantizaciones mixtas Q4_K_S, Q2_K para MLP/PLE y vocabulario) que reduce el peso a un único fichero de 5,8 GB dentro de un repositorio pensado para ejecutarse en llama.cpp.

El modelo conserva la arquitectura del Gemma 4 E2B original, con aproximadamente 4.498 millones de parámetros totales según los pesos de referencia en safetensors, y está orientado exclusivamente a inglés. Su propósito declarado es servir de motor de sugerencias dentro de la aplicación ShellAI, un proyecto de código abierto disponible en GitHub, donde el modelo debe devolver un único bloque JSON en formato Markdown con el comando propuesto.

La relevancia actual es acotada pero clara: demuestra un flujo de trabajo de destilación de un modelo generalista a un artefacto GGUF ultraligero para una tarea concreta, con licencia Apache-2.0 heredada del modelo base y trazabilidad mediante manifiesto de artefacto público. No obstante, el número de descargas (175) y la ausencia de likes indican una adopción todavía muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 E2B; detalles de atención no disponibles) |
| Parametros totales | 4.498.808.355 (según pesos de referencia en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixta: Q4_K_S, MLP10, PLE_Q2_K, VOCAB_Q2_K (fichero único) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (heredada de google/gemma-4-E2B-it, con enlace a la página Apache 2.0 de Google) |
| Formato de pesos | GGUF (tokenizer y pesos incluidos en el mismo fichero) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un modelo instructivo de Google DeepMind, y se distribuye como cuantización GGUF, no como un reentrenamiento. La model card no documenta ningún proceso de ajuste fino adicional, RLHF, DPO ni composición de dataset propia: la relación declarada con el modelo base es "quantized". La innovación técnica reseñable es la estrategia de cuantización mixta, que combina Q4_K_S para el grueso de los pesos con Q2_K para las capas MLP, el módulo PLE y el vocabulario, lo que permite comprimir el artefacto hasta 5,8 GB.

El autor indica que el GGUF debe ejecutarse con un runtime de llama.cpp compatible con Gemma 4 y que la revisión de runtime probada queda registrada en el repositorio (no se reproduce el número de revisión en la información disponible). La aplicación consumidora debe aceptar un único bloque JSON en formato Markdown como salida válida, según se describe en la evaluación del autor.

## Capacidades

- Generación de texto orientada a comandos de shell a partir de lenguaje natural.
- Salida estructurada como bloque JSON en formato Markdown, requisito de integración con ShellAI.
- Modelo conversacional e instructivo (hereda el ajuste de instrucciones del modelo base).
- Especialización en inglés; no se declaran capacidades multilingües.
- Capacidades de razonamiento, código general, matemáticas, visión o tool calling: no documentadas en la información disponible para esta derivación.
- Modo thinking, audio o visión: no disponibles en esta distribución, que se describe explícitamente como "text-only".

## Casos de uso

- Sugerencia de comandos en terminal: el modelo recibe una petición en inglés ("list files larger than 100 MB") y devuelve un bloque JSON con el comando propuesto, que la aplicación ShellAI puede mostrar al usuario antes de ejecutarlo.
- Integración en asistentes de CLI para desarrolladores: al pesar 5,8 GB y ejecutarse en llama.cpp, puede desplegarse localmente en la estación de trabajo del desarrollador sin depender de APIs externas.
- Generación de comandos en pipelines de automatización: útil para traducir pasos de documentación a comandos ejecutables en scripts de aprovisionamiento, siempre con revisión humana previa.
- Enseñanza y formación en línea de comandos: el modelo puede explicar o proponer comandos equivalentes a una tarea descrita, como apoyo en entornos de aprendizaje.
- Prototipado de agentes de shell: sirve como componente de generación de acciones en un agente que necesite una ventana de contexto moderada y baja huella de memoria.
- Despliegue en entornos con recursos limitados: al ser un GGUF cuantizado de ~4,5B parámetros, encaja en equipos sin GPU dedicada mediante CPU, lo que facilita pruebas de concepto en portátiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con un fichero GGUF de 5,8 GB, la carga en memoria ronda ese tamaño más el overhead del runtime.
- GPU recomendadas: no especificadas por el autor; al ser un modelo de ~4,5B en GGUF, es viable en GPU consumer con suficiente memoria (por ejemplo, RTX 3060 de 12 GB o superiores), aunque no hay confirmación oficial.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del fichero, pero sin validación documentada.
- Opciones de despliegue: llama.cpp con runtime compatible con Gemma 4 (única opción indicada); vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| micrictor/bonsai-shellai | ~4,5B | no disponible | apache-2.0 | GGUF | Derivado cuantizado de Gemma 4 E2B-it, especializado en shell |
| google/gemma-4-E2B-it | ~4,5B | no disponible | apache-2.0 | safetensors (original) | Modelo base instructivo; capacidades generales |
| Otras cuantizaciones GGUF de Gemma 4 E2B | ~4,5B | no disponible | apache-2.0 | GGUF | Alternativas genéricas sin especialización en shell; datos concretos no disponibles |

## Limitaciones y advertencias

- Modelo especializado y de nicho: solo se declara para sugerencias de comandos de shell en inglés; su uso fuera de ese dominio no está validado.
- Idioma: únicamente inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación relevante en comandos: un comando de shell incorrecto puede ser destructivo; se recomienda revisión humana y sandboxing antes de la ejecución.
- Cuantización agresiva: el uso de Q2_K en MLP, PLE y vocabulario puede degradar la calidad frente al modelo base; no se publican métricas comparativas.
- Licencia: Apache-2.0 heredada, pero el autor advierte que es una derivación modificada y no un lanzamiento oficial de Google DeepMind; la atribución no implica respaldo.
- Trazabilidad limitada: la model card menciona LICENSE, NOTICE y manifest.json, pero no se documentan revisiones de runtime ni resultados de evaluación detallados en la información disponible.
- Adopción muy baja (175 descargas, 0 likes): escaso soporte comunitario y poca validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/micrictor/bonsai-shellai
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de la aplicación ShellAI: https://github.com/sittinginatreesec/shellai
- Licencia Apache 2.0 de Google para Gemma: https://ai.google.dev/gemma/apache_2
