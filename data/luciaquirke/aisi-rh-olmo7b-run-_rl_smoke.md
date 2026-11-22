# luciaquirke/aisi-rh-olmo7b-run-_rl_smoke

## Resumen

`luciaquirke/aisi-rh-olmo7b-run-_rl_smoke` es un checkpoint de ajuste fino publicado en Hugging Face por el usuario luciaquirke. El nombre del repositorio sugiere que se trata de un experimento de aprendizaje por refuerzo (RL) sobre un modelo base de la familia OLMo de 7B parámetros (OLMo-7B), aunque la model card no confirma explícitamente el modelo base: el campo `base_model` aparece como `None` y el README indica "fine-tuned version of [None]". El sufijo `_rl_smoke` y el prefijo `aisi-rh` apuntan a una prueba de humo (*smoke test*) de un pipeline de RL, probablemente ejecutada en el contexto de investigación del AISI (AI Safety Institute) británico.

El entrenamiento se realizó con GRPO (Group Relative Policy Optimization), el algoritmo de RL introducido en el paper *DeepSeekMath*, mediante la librería TRL 0.27.2 sobre Transformers 5.3.0.dev0, PyTorch 2.9.1+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. El repositorio ocupa 0,5 GB y contiene pesos en formato safetensors, lo que es coherente con un modelo de 7B cuantizado o con un subconjunto de pesos, aunque el tamaño declarado no permite confirmar la arquitectura exacta.

La relevancia de esta ficha es limitada pero informativa: se trata de un artefacto de investigación sin model card sustantiva, sin licencia declarada, sin idiomas especificados y sin benchmarks publicados. Resulta útil como referencia para quienes replican pipelines de GRPO con TRL y para documentar el estado del ecosistema de experimentos abiertos de RL, pero no es un modelo recomendable para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere OLMo-7B, sin confirmar en la model card) |
| Parametros totales | no disponible (el nombre sugiere 7B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el README incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Framework de entrenamiento | TRL 0.27.2, Transformers 5.3.0.dev0, PyTorch 2.9.1+cu128 |
| Algoritmo de RL | GRPO (DeepSeekMath, arXiv:2402.03300) |
| Tamano del repositorio | 0,5 GB |
| Fecha de creacion | 2026-11-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base. El identificador del repositorio incluye `olmo7b`, lo que sugiere que el punto de partida es un modelo OLMo de 7B parámetros (familia de modelos abiertos de AI2), pero esta información no se confirma en ningún campo estructurado del README ni en los tags de Hugging Face. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas previas de SFT antes del RL.

El entrenamiento se realizó con GRPO, un algoritmo de optimización de política que elimina la necesidad de un modelo crítico (*critic*) separado, estimando la ventaja relativa dentro de un grupo de respuestas muestreadas para la misma pregunta. La model card cita el paper de DeepSeekMath como referencia metodológica y proporciona un snippet de uso con `transformers.pipeline` para generación de texto conversacional. No se documentan hiperparámetros, recompensas utilizadas, número de pasos ni curvas de entrenamiento. El sufijo `_smoke` sugiere que se trata de una ejecución de validación del pipeline más que de un entrenamiento completo.

## Capacidades

- Generación de texto conversacional: el snippet de la model card muestra uso con `pipeline("text-generation")` y mensajes con rol `user`.
- Razonamiento guiado por RL: al haberse entrenado con GRPO, se espera que el modelo haya optimizado alguna función de recompensa, aunque no se especifica cuál ni sobre qué tarea.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de lo que el modelo base pudiera tener.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades especiales (modo thinking, visión, audio).
- No se documenta longitud de contexto efectiva.

## Casos de uso

- Replicación de pipelines de GRPO con TRL: el repositorio sirve como artefacto de referencia para verificar que un entrenamiento con TRL 0.27.2 y Transformers 5.3.0.dev0 produce pesos cargables con `transformers.pipeline`. Útil en entornos de investigación que validan versiones antes de lanzar entrenamientos largos.
- Pruebas de integración en CI de infraestructura de RL: al ser un *smoke test*, puede emplearse como checkpoint ligero (0,5 GB) para comprobar que un servicio de inferencia arranca y responde a prompts conversacionales sin consumir recursos de un modelo completo.
- Estudio de metodología de RL: investigadores que comparan implementaciones de GRPO pueden inspeccionar los pesos y la configuración declarada (versiones de framework) para reproducir el entorno de entrenamiento.
- Docencia y formación: ejemplo mínimo de cómo se publica un checkpoint generado con TRL y qué metadatos incluye por defecto la plantilla de model card.
- Auditoría de artefactos abiertos: útil para estudiar qué información falta habitualmente en checkpoints de RL publicados (licencia, modelo base, datos) y diseñar plantillas más completas.
- No recomendado para atención al cliente, generación de código en producción ni despliegues comerciales: la ausencia de licencia, idiomas y benchmarks impide evaluar su idoneidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Si el modelo base es efectivamente de 7B parámetros, en fp16 requeriría aproximadamente 14 GB de VRAM; en 8 bits, unos 7-8 GB; en 4 bits, unos 4-5 GB. Estas cifras son estimaciones basadas en el nombre del repositorio y no en datos confirmados.
- GPU recomendadas: no disponibles. Para un modelo de 7B en fp16 sería necesario al menos una GPU con 16 GB (RTX 4090, A10G, L4) o superior (A100 40/80 GB, H100) para mayor throughput.
- Cabe en GPU de consumo: probablemente sí en RTX 3090/4090 si se cuantiza a 8 o 4 bits, siempre que el modelo base sea de 7B; no confirmado.
- Opciones de despliegue: `transformers` con `pipeline` (documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint y requerirían conversión previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `luciaquirke/aisi-rh-olmo7b-run-_rl_smoke` | no disponible (nombre sugiere 7B) | no disponible | no disponible | Hugging Face, 0 descargas | Smoke test de GRPO con TRL |
| OLMo-7B (AI2) | 7B | 2K-4K según versión | Apache 2.0 (versiones publicadas) | Hugging Face, ampliamente usado | Modelo base probable; datos y receta abiertos |
| Zephyr-7B-beta | 7B | 32K | MIT | Hugging Face | Ajuste con DPO sobre Mistral-7B; benchmarks publicados |
| DeepSeekMath-7B | 7B | 4K | Licencia propia con restricciones | Hugging Face | Modelo que introdujo GRPO; benchmarks matemáticos publicados |

La comparación es orientativa: el checkpoint analizado no publica parámetros, contexto ni licencia, por lo que solo puede contrastarse por su familia probable (OLMo-7B) y por la metodología (GRPO, como DeepSeekMath).

## Limitaciones y advertencias

- Ausencia total de licencia: el campo `licence: license` no especifica términos; no puede asumirse uso comercial permitido.
- Modelo base no declarado: el campo `base_model` es `None`, lo que impide conocer la procedencia de los pesos y las obligaciones de atribución.
- Sin idiomas declarados: no se puede garantizar calidad en castellano ni en ningún otro idioma.
- Sin benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas.
- Riesgo de alucinación: no evaluado; al ser un *smoke test* de RL, la política puede estar escasamente optimizada y producir respuestas inconsistentes.
- Sesgos: no documentados; dependen del modelo base y de los datos de RL, ninguno de los cuales se describe.
- Naturaleza experimental: el sufijo `_smoke` indica una ejecución de validación, no un modelo final; no debería usarse en producción.
- Contexto y cuantizaciones no documentados: dificulta planificar despliegues y estimar costes.
- Fecha de creación futura (2026-11-22): conviene verificar la autenticidad y el estado del repositorio antes de reutilizarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/luciaquirke/aisi-rh-olmo7b-run-_rl_smoke
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Transformers: https://github.com/huggingface/transformers
