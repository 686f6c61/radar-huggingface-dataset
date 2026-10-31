# dongguanting/ToolSpace-35B-A3B

## Resumen

ToolSpace-35B-A3B es un modelo agéntico desarrollado por dongguanting a partir de Qwen3.6-35B-A3B, un modelo de mezcla de expertos (MoE) de Qwen con 35 mil millones de parámetros totales y 3 mil millones activos. Su objetivo es resolver uno de los problemas más difíciles de los agentes de IA: el uso de herramientas en tareas de horizonte largo (long-horizon), donde el modelo debe encadenar múltiples llamadas a herramientas a través de distintos entornos, gestionando dependencias de datos, estado y reintentos.

La novedad principal del proyecto ToolSpace, descrita en el paper *ToolSpace: Scaling Tool-Centric Environment Synthesis for Long-Horizon Agents*, es un método de síntesis de entornos centrado en herramientas: se construye un grafo de composición de herramientas a partir de trazas de ejecución reales, se sintetizan tareas entre entornos mediante recorridos con estado y rollback, y se conservan únicamente las trayectorias que superan una verificación basada en ejecución. Sobre estos datos se aplica primero un fine-tuning supervisado (SFT) y después aprendizaje por refuerzo agéntico on-policy.

El resultado es relevante porque las mejoras son sustanciales y medibles: la media no ponderada sobre siete benchmarks agénticos pasa de 23,0 en el modelo base a 43,2 en este checkpoint (SFT + Agent RL), con saltos especialmente notables en AutomationBench (de 8,2 a 45,8) y JobBench (de 6,4 a 40,0). Se distribuye bajo licencia Apache 2.0 en formato safetensors BF16, con una ventana de contexto de 262.144 tokens y soporte de image-text-to-text heredado del backbone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe), transformer mixture-of-experts |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | ~3B (por token, arquitectura A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.6-35B-A3B, una arquitectura MoE con 35 mil millones de parámetros totales de los cuales solo unos 3 mil millones se activan por token, lo que permite obtener latencias y costes de inferencia cercanos a un modelo denso de 3B manteniendo la capacidad de un modelo de 35B. Hereda del backbone la capacidad multimodal image-text-to-text y una ventana de contexto de 262.144 tokens.

El entrenamiento se realiza en dos fases. Primero, un fine-tuning supervisado (SFT) sobre trayectorias generadas por ToolSpace: un pipeline que construye un grafo de composición de herramientas a partir de trazas de ejecución reales, capturando dependencias de datos, estado y reintentos. A partir de ese grafo se sintetizan tareas que cruzan entornos mediante recorridos con estado (state-aware walks) con rollback, y se filtran las trayectorias conservando solo las que pasan una verificación basada en ejecución. En segundo lugar, se aplica aprendizaje por refuerzo agéntico on-policy para tareas de horizonte largo con uso de herramientas, lo que aporta mejoras adicionales sobre el checkpoint SFT (por ejemplo, en SkillsBench pasa de 42,4 a 45,3 y en τ³-Bench Banking de 34,0 a 42,3).

## Capacidades

- Uso de herramientas (tool use) en tareas de horizonte largo, encadenando múltiples llamadas con dependencias de datos, estado y reintentos.
- Function calling nativo con parser `qwen3_xml` en vLLM y soporte de `--enable-auto-tool-choice`.
- Razonamiento multi-paso para agentes, con parser de razonamiento `qwen3` disponible en el despliegue de referencia.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text heredado del backbone).
- Tareas entre entornos (cross-environment), gracias al entrenamiento con tareas sintetizadas a partir de un grafo de composición de herramientas.
- Generación de texto conversacional mediante el chat template incluido en el repositorio.
- Contexto largo: hasta 262.144 tokens de ventana nativa.

## Casos de uso

- Automatización de flujos de trabajo multi-paso: el modelo puede planificar y ejecutar secuencias largas de llamadas a herramientas (APIs, scripts, consultas) manteniendo el estado entre pasos; su puntuación de 45,8 en AutomationBench frente a 8,2 del modelo base lo hace adecuado para orquestación de tareas de oficina.
- Agentes de atención al cliente con acceso a sistemas: en τ³-Bench Banking obtiene 42,3, lo que indica capacidad para gestionar conversaciones multi-turno con llamadas a herramientas de consulta y modificación en dominios bancarios y similares.
- Ejecución de tareas laborales y administrativas: con 40,0 en JobBench, es apto para pipelines que automatizan procesos de trabajo concretos (relleno de formularios, gestión de documentos, flujos de back-office).
- Asistentes de productividad ofimática: la mejora en OfficeQA Pro (51,9 frente a 45,9) sugiere utilidad en preguntas y tareas sobre documentos de oficina y hojas de cálculo.
- Integración en plataformas de agentes con vLLM: el comando de despliegue oficial incluye tool calling automático, lo que facilita su uso como backend de frameworks agénticos (LangChain, agentes personalizados) expuestos vía API OpenAI-compatible.
- Composición de herramientas entre entornos: gracias al entrenamiento con tareas cross-environment, puede encadenar herramientas de sistemas distintos (por ejemplo, buscar en la web, procesar el resultado y escribirlo en otra aplicación) en un único flujo agéntico.

## Benchmarks y rendimiento

Resultados de la Tabla 1 del paper ToolSpace (media no ponderada sobre siete benchmarks):

| Model | AutomationBench | SkillsBench | JobBench | τ³-Bench Banking | BFCL V4 | Harvey LAB | OfficeQA Pro | Avg. |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Qwen3.6-35B-A3B (base) | 8.2 | 30.7 | 6.4 | 9.3 | 60.0 | 0.8 | 45.9 | 23.0 |
| ToolSpace-35B-A3B (SFT) | 45.8 | 42.4 | 40.0 | 34.0 | 74.3 | 1.7 | 48.9 | 41.0 |
| ToolSpace-35B-A3B + Agent RL (este checkpoint) | 45.8 | 45.3 | 40.0 | 42.3 | 74.8 | 2.5 | 51.9 | 43.2 |

No se han publicado comparaciones directas con otros modelos agénticos de terceros (como GPT, Claude o Gemini) en la información disponible.

## Requisitos de hardware

- Con pesos BF16, el modelo ocupa aproximadamente 70 GB; se necesita al menos esa cantidad de VRAM agregada para inferencia sin cuantizar.
- El despliegue de referencia del autor utiliza 4 GPUs con tensor parallelism (`--tensor-parallel-size 4`), lo que sugiere 4 GPUs de ~80 GB (por ejemplo, A100 u H100 de 80 GB) o equivalentes.
- En GPUs de consumo (RTX 4090/3090 de 24 GB) no cabe en BF16; sería necesario recurrir a cuantizaciones no publicadas oficialmente por el autor (no disponible en el repositorio) o esperar a versiones GGUF/AWQ de la comunidad.
- Despliegue recomendado: vLLM, con el comando oficial que incluye `--tool-call-parser qwen3_xml` y `--reasoning-parser qwen3`. La configuración de ejemplo limita la ventana de servicio a 64K tokens (`--max-model-len 65536`) para reducir el consumo de memoria KV cache.
- No se han publicado cifras de latencia o throughput; al activar solo ~3B de parámetros por token, se espera un rendimiento de generación superior al de un modelo denso de 35B, pero no hay mediciones oficiales.
- Alternativas de despliegue como llama.cpp, Ollama o TGI: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| ToolSpace-35B-A3B | 35B | ~3B | 262.144 | Apache 2.0 | Agéntico, tool use long-horizon |
| Qwen3.6-35B-A3B (base) | 35B | ~3B | 262.144 | no disponible | Modelo base generalista |
| ToolSpace-8B | 8B | no disponible | no disponible | no disponible | Variante agéntica más pequeña |
| ToolSpace-744B-A40B | 744B | ~40B | no disponible | no disponible | Variante agéntica de gran escala |

La familia ToolSpace ofrece tres tamaños (8B, 35B-A3B y 744B-A40B), lo que permite elegir entre despliegues ligeros y máxima capacidad. Frente a su modelo base, ToolSpace-35B-A3B casi duplica la media en benchmarks agénticos (43,2 frente a 23,0). No se dispone de datos comparativos con otros modelos agénticos open source de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El proyecto es muy reciente (publicado en octubre de 2026) y con tracción mínima en Hugging Face (41 descargas, 2 likes), por lo que hay poca evidencia de uso en producción y probablemente pocos recursos comunitarios (cuantizaciones, guías, correcciones).
- Los benchmarks publicados proceden de la propia Tabla 1 del paper de los autores; no hay verificación independiente de los resultados.
- En benchmarks como Harvey LAB la puntuación sigue siendo muy baja (2,5), lo que indica que el modelo no resuelve de forma fiable ese tipo de tareas pese al entrenamiento agéntico.
- No se especifican los idiomas soportados; al derivar de un modelo Qwen, es razonable asumir buen rendimiento en inglés y chino, pero no hay datos oficiales.
- No se publican pesos cuantizados ni conversiones GGUF, lo que limita las opciones de despliegue en hardware de consumo.
- Como todo modelo de lenguaje, puede alucinar contenido o producir llamadas a herramientas incorrectas; el entrenamiento con verificación basada en ejecución reduce este riesgo en tareas agénticas, pero se recomienda mantener validación y mecanismos de rollback en producción.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, pero conviene revisar también los términos del modelo base Qwen3.6-35B-A3B para usos que requieran cumplimiento de políticas de proveedores.
- No hay información sobre sesgos conocidos ni evaluaciones de seguridad específicas del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongguanting/ToolSpace-35B-A3B
- Repositorio de código: https://github.com/dongguanting/ToolSpace
- Directorio de evaluación: https://github.com/dongguanting/ToolSpace/tree/main/evaluation
- Variante 8B: https://huggingface.co/dongguanting/ToolSpace-8B
- Variante 744B-A40B: https://huggingface.co/dongguanting/ToolSpace-744B-A40B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper: *ToolSpace: Scaling Tool-Centric Environment Synthesis for Long-Horizon Agents* (enlace directo no disponible)
