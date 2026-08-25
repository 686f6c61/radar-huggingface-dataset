# remixie/KAT-Coder-V2.5-Dev-FTW

## Resumen

KAT-Coder-V2.5-Dev-FTW es un paquete del fine-tune de codificacion KAT-Coder-V2.5-Dev de Kwaipilot, convertido al formato FTW (FreeToken Weight) para su carga directa en el runtime FreeToken. El modelo original es un fine-tune de Qwen3.6-35B-A3B, una arquitectura Mixture-of-Experts hibrida de 35B parametros totales con aproximadamente 3B activos por token, entrenado con supervisión y aprendizaje por refuerzo para tareas de ingeniería de software agéntica. El repositorio no reclama un nuevo entrenamiento: empaqueta el checkpoint cuantizado NVFP4A16 de sahilchachra en un formato de carga rapida para inferencia local en GPU/CPU heterogeneas.

La relevancia de este modelo radica en su enfoque en codificacion agéntica: está diseñado para actuar autonomamente dentro de repositorios ejecutables reales, no como un simple generador de codigo de un solo turno. El informe tecnico (arXiv:2607.05471) argumenta que el cuello de botella para agentes de codigo mas fuertes es la infraestructura de entrenamiento, no la escala del modelo. La version FTW ofrece una ruta de despliegue alternativa para usuarios de FreeToken, con pesos NVFP4 empaquetados y una ruta de activacion W4A16 en GPU y W4A8 en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts hibrida (Qwen3.5/3.6-style), 40 capas, 256 expertos enrutados + 1 experto compartido, 8 expertos activos por token |
| Parametros totales | 35B (aproximado) |
| Parametros activos | ~3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 E2M1 (group size 16) para pesos de expertos; BF16 para atencion completa, GatedDeltaNet, routers, embeddings y LM head; W4A16 en GPU; W4A8 en CPU |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | FTW (3 shards, 21.3 GiB de datos de tensor); no safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3.6-35B-A3B, una arquitectura híbrida de 40 capas que combina atencion completa (10 capas) con proyecciones GatedDeltaNet / atencion lineal. Kwaipilot realizo un fine-tune con SFT y RL sobre esta base para crear KAT-Coder-V2.5-Dev, centrado en tareas de codificacion y ingenieria de software agéntica. El repositorio FTW no incluye un nuevo entrenamiento: es una conversion del checkpoint cuantizado NVFP4A16 de sahilchak, que a su vez es una cuantizacion data-free, weight-only, del modelo de Kwaipilot.

Durante la conversion a FTW, las proyecciones de atencion completa que estaban cuantizadas en NVFP4 se dequantizaron a BF16 para mantener una representacion uniforme de atencion en FreeToken, mientras que los pesos de los expertos enrutados y el experto compartido permanecen en NVFP4. La ruta de activacion en GPU es W4A16 (pesos FP4 × activaciones BF16) y en CPU W4A8. El modelo soporta razonamiento, codificacion, flujos de trabajo de agente y tool calling a traves del chat template de Qwen.

## Capacidades

- Generacion de codigo y razonamiento: disenado para tareas de ingenieria de software, con soporte de razonamiento multi-step habilitado por defecto en el template.
- Agente de codigo: entrenado para actuar autonomamente dentro de repositorios ejecutables, no solo para generacion de codigo en un solo turno.
- Tool calling: soporta llamadas a herramientas mediante el parser `qwen3_coder` en FreeToken.
- Razonamiento explicito: el modo `thinking` esta habilitado por defecto; se puede desactivar con `enable_thinking: False` en `chat_template_kwargs`.
- Multilingue: soporta ingles y chino.
- Arquitectura MoE hibrida: 8 expertos activos de 256 enrutados, con un experto compartido, lo que reduce el coste de inferencia.

## Casos de uso

- Desarrollo agil de codigo en repositorios reales: el modelo puede actuar como agente que navega, edita y prueba codigo dentro de un repositorio ejecutable, gracias a su entrenamiento con RL en entornos reproducibles.
- Asistente de programacion en IDE: con la API compatible con OpenAI de FreeToken, se puede integrar en editores para completar funciones, refactorizar o escribir tests, con razonamiento explicito opcional.
- Pipeline de CI/CD: el soporte de tool calling permite que el modelo invoque herramientas de build, test o linter dentro de un pipeline de integracion continua.
- Soporte de codigo en entornos con recursos limitados: con solo ~3B parametros activos, cabe en una GPU de 24 GB (como una RTX 4090) en configuracion hibrida GPU/CPU.
- Analisis de codigo legacy: el contexto largo y el modo agente permiten explorar codebases grandes y proponer refactorizaciones o documentar modulos.
- Chat tecnico bilingue: al soportar ingles y chino, puede atender consultas de desarrollo en ambos idiomas, con template de chat de Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El informe tecnico arXiv:2607.05471 describe el marco de entrenamiento, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos en los datos entregados.

## Requisitos de hardware

- VRAM estimada: el modelo FTW ocupa 21.3 GiB en disco; en una GPU de 24 GB se selecciono el backend Triton attention y MoE hibrido GPU/CPU, por lo que es viable en tarjetas de 24 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) o superiores; para inferencia completa en GPU sin descarga a CPU, se requeriria mas VRAM (no especificado).
- Compatibilidad con consumer GPU: si, una GPU de 24 GB es suficiente con el modo hibrido GPU/CPU de FreeToken.
- Opciones de despliegue: exclusivamente FreeToken (`.ftw` no es carga con Transformers, vLLM, SGLang, llama.cpp, Ollama o LM Studio). Se sirve con `ft serve --model-path ... --host 127.0.0.1 --port 8000`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de comparacion con otros modelos de codificacion (como DeepSeek-Coder, CodeQwen o StarCoder) en terminos de rendimiento o contexto. Se puede decir que, por su tamano activo (~3B) y su arquitectura MoE, se situa en la categoria de modelos eficientes de codificacion, pero sin datos cuantitativos no es posible una comparativa rigurosa.

## Limitaciones y advertencias

- Formato propietario: los archivos `.ftw` no son safetensors; el modelo solo se puede cargar en FreeToken, no en Transformers, vLLM, SGLang, llama.cpp, Ollama o LM Studio. Para otros runtimes, se debe usar el repositorio upstream.
- Cuantizacion NVFP4: los pesos de los expertos estan en FP4 (E2M1, group size 16), lo que puede afectar a la precision en tareas de alta sensibilidad numerica frente a BF16; el informe no detalla perdida de rendimiento.
- Atencion completa dequantizada: las diez capas de atencion completa se han convertido a BF16 en esta build FTW, lo que aumenta el uso de memoria en comparacion con la version NVFP4 original.
- Sesgos y alucinacion: no hay evaluacion publica de sesgos en la informacion disponible; como modelo de codigo, puede generar codigo incorrecto o con vulnerabilidades si no se valida.
- Limitaciones de idioma: solo ingles y chino; no se garantiza calidad en otros idiomas.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y el fine-tune de Kwaipilot tienen sus propias condiciones; se debe verificar el repositorio original para restricciones adicionales.
- Descargas y adopcion: el repositorio tiene 0 descargas y 0 likes, lo que indica que es una build reciente o poco difundida; no hay evidencia de produccion en entornos reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/remixie/KAT-Coder-V2.5-Dev-FTW
- Modelo base (fine-tune original): https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Modelo cuantizado NVFP4A16: https://huggingface.co/sahilchachra/KAT-Coder-V2.5-Dev-NVFP4A16
- Repositorio FreeToken: https://github.com/FlashML-org/FreeToken
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.05471
- Pagina del proyecto KAT-Coder: https://kwaipilot.github.io/KAT-Coder/</think>## Resumen

KAT-Coder-V2.5-Dev-FTW es un empaquetado del modelo de código KAT-Coder-V2.5-Dev de Kwaipilot, convertido al formato FTW (FreeToken Weight) para cargarse directamente en el motor de inferencia FreeToken. El modelo original es un fine-tune de Qwen3.6-35B-A3B, una arquitectura Mixture-of-Experts híbrida de 35B parámetros totales con aproximadamente 3B activos por token, entrenado con SFT y RL para tareas de ingeniería de software agéntica. Este repositorio no reivindica un nuevo entrenamiento: empaqueta el checkpoint cuantizado NVFP4A16 de sahilchachra para que el fine-tune existente sea usable en FreeToken.

La relevancia del modelo reside en su enfoque en codificación agéntica: está diseñado para actuar autónomamente dentro de repositorios ejecutables, no como un generador de código de un solo turno. El informe técnico (arXiv:2607.05471) sostiene que el cuello de botella para agentes de código más capaces es la infraestructura de entrenamiento, no la escala del modelo. Esta versión FTW ofrece una vía de despliegue local con cuantización NVFP4 y rutas de activación W4A16 en GPU y W4A8 en CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts híbrida (estilo Qwen3.5/3.6), 40 capas, 256 expertos enrutados + 1 experto compartido, 8 expertos activos por token |
| Parámetros totales | 35B (aproximado) |
| Parámetros activos | ~3B |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 E2M1 (group size 16) para pesos de expertos; BF16 para atenciones, GatedDeltaNet, routers, embeddings y LM head; W4A16 en GPU; W4A8 en CPU |
| Idiomas de texto | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | FTW (3 shards, 21.3 GiB de datos de tensor); no es safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3.6-35B-A3B, una arquitectura híbrida de 40 capas que combina diez capas de atención completa con proyecciones GatedDeltaNet (atención lineal). Kwaipilot aplicó post-entrenamiento con SFT y RL para crear KAT-Coder-V2.5-Dev, centrado en codificación y flujos de trabajo agénticos. Este repositorio no realiza un nuevo entrenamiento: convierte el checkpoint cuantizado NVFP4A16 de sahilchachra, que a su vez es una cuantización data-free y weight-only del fine-tune de Kwaipilot.

Durante la conversión, las proyecciones de atención completa que estaban en NVFP4 se dequantizaron a BF16 porque FreeToken espera una representación de atención uniforme para esta arquitectura híbrida. Los pesos de los expertos enrutados y del experto compartido permanecen empaquetados en NVFP4. El modelo soporta razonamiento, codificación, flujos de agente y tool calling mediante el chat template de Qwen. El modo de pensamiento está habilitado por defecto y puede desactivarse con `enable_thinking: False`.

## Capacidades

- Generación de código y razonamiento multi-paso: entrenado para tareas de ingeniería de software con SFT y RL.
- Codificación agéntica: puede actuar de forma autónoma en repositorios ejecutables, no solo generar código en un turno.
- Tool calling: soporta llamadas a herramientas mediante el parser `qwen3_coder` de FreeToken.
- Modo de razonamiento explícito: el template de chat permite activar o desactivar el trace de razonamiento.
- Multilingüe: soporta inglés y chino.
- Arquitectura MoE eficiente: 8 de 256 expertos activos por token, lo que reduce coste de inferencia frente a un modelo denso de 35B.

## Casos de uso

- Asistente de programación en IDE: puede integrarse vía API compatible con OpenAI en editores para completar código, refactorizar o generar tests, con razonamiento opcional.
- Agente de ingeniería de software: su entrenamiento con RL en entornos reproducibles lo hace adecuado para navegar repositorios, editar archivos y ejecutar herramientas de build o test de forma autónoma.
- Generación de código en CI/CD: puede invocar funciones de build, lint y test dentro de pipelines gracias a su soporte de tool calling.
- Soporte técnico en desarrollo: puede gestionar consultas de código multi-turno en inglés o chino, con contexto de conversación largo.
- Prototipado rápido en entornos locales: con ~3B parámetros activos, cabe en una GPU de 24 GB en modo híbrido GPU/CPU, ideal para desarrollo sin infraestructura costosa.
- Formación y documentación: puede explicar fragmentos de código, generar documentación técnica o proponer refactorizaciones sobre codebases existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El informe técnico arXiv:2607.05471 describe el marco de entrenamiento, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos en los datos recopilados.

## Requisitos de hardware

- VRAM estimada: en una GPU de 24 GB se seleccionó el backend Triton attention con MoE híbrido GPU/CPU; los pesos FTW ocupan aproximadamente 21.3 GiB en disco.
- GPU recomendadas: una RTX 3090 o RTX 4090 de 24 GB es suficiente para el modo híbrido; para inferencia completa en GPU sin descarga a CPU se necesitaría más VRAM (no especificado).
- Compatibilidad con GPU consumer: sí, el modelo cabe en tarjetas de 24 GB con el backend híbrido de FreeToken.
- Opciones de despliegue: únicamente FreeToken (el formato FTW no es cargable por Transformers, vLLM, SGLang, llama.cpp, Ollama ni LM Studio). Se sirve con `ft serve --model-path ... --host 127.0.0.1 --port 8000`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de codificación (como DeepSeek-Coder, CodeQwen o StarCoder) en la información recopilada. Por su tamaño de ~3B activos y su familia MoE, se posiciona como un modelo eficiente de codificación agéntica, pero sin cifras de rendimiento no es posible una comparativa rigurosa.

## Limitaciones y advertencias

- Formato propietario: los archivos `.ftw` no son safetensors; el modelo solo funciona en FreeToken, no en Transformers, vLLM, SGLang, llama.cpp, Ollama ni LM Studio. Para otros runtimes hay que usar los repositorios upstream.
- Cuantización NVFP4: los pesos de expertos están en FP4 E2M1 con group size 16, lo que puede reducir precisión en tareas numéricas sensibles frente a BF16; el informe no detalla pérdida de rendimiento.
- Atención dequantizada: las diez capas de atención completa se han convertido a BF16 en esta build FTW, aumentando el peso de memoria en comparación con el checkpoint NVFP4 original.
- Sesgos y alucinación: no hay evaluaciones públicas de sesgos; como modelo de código, puede generar soluciones incorrectas o con vulnerabilidades si no se valida.
- Idiomas limitados: solo inglés y chino; no se garantiza calidad en otros idiomas.
- Licencia Apache-2.0: permite uso comercial, pero el fine-tune original de Kwaipilot y el modelo base Qwen tienen sus propias condiciones; se debe revisar el repositorio upstream.
- Adopción: el repositorio tiene 0 descargas y 0 likes, lo que indica que es reciente o sin validación en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/remixie/KAT-Coder-V2.5-Dev-FTW
- Modelo base KAT-Coder-V2.5-Dev (Kwaipilot): https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Checkpoint cuantizado NVFP4A16: https://huggingface.co/sahilchachra/KAT-Coder-V2.5-Dev-NVFP4A16
- Repositorio FreeToken: https://github.com/FlashML-org/FreeToken
- Informe técnico (arXiv): https://arxiv.org/abs/2607.05471
- Blog del proyecto KAT-Coder: https://kwaipilot.github.io/KAT-Coder/
