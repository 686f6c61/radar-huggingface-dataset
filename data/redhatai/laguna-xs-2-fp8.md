# RedHatAI/Laguna-XS.2-FP8

## Resumen

Laguna XS.2-FP8 es la variante cuantizada en FP8 de Laguna XS.2, un modelo de lenguaje de tipo Mixture-of-Experts desarrollado por Poolside y empaquetado para su despliegue por RedHatAI. Cuenta con 33.442.617.168 parámetros totales (aproximadamente 33B) de los que solo unos 3B se activan por token, lo que lo sitúa en la categoría de modelos dispersos eficientes pensados para ejecutarse en hardware local. Su enfoque principal es el trabajo agéntico de programación y tareas de horizonte largo, es decir, sesiones de codificación autónoma con múltiples pasos y llamadas a herramientas.

La arquitectura combina atención global y atención de ventana deslizante en una proporción 3:1 sobre 40 capas (30 capas con sliding window de 512 tokens y 10 capas con atención global), con gating sigmoide por cabeza y escalas rotatorias por capa. Esta configuración reduce drásticamente el coste del KV cache, que además está cuantizado a FP8 en esta variante. El modelo soporta una ventana de contexto de 131.072 tokens y razonamiento nativo intercalado entre llamadas a herramientas.

Su relevancia actual radica en la combinación de tres factores: una licencia Apache 2.0 totalmente permisiva para uso comercial, un tamaño que permite ejecución en un Mac con 36 GB de RAM (con disponibilidad en Ollama) y unos resultados en benchmarks de ingeniería de software que compiten con modelos densos de tamaño similar e incluso con modelos propietarios. La variante FP8 aquí descrita está validada sobre vLLM 0.21.0, RHOAI 3.5.1 y RHAIIS 3.5.0-ea.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer con atención híbrida SWA/global |
| Parametros totales | 33.442.617.168 (≈33B) |
| Parametros activos | ≈3B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | FP8 (esta variante), BF16, NVFP4, INT4 (variantes separadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), librería vllm |

## Arquitectura y entrenamiento

Laguna XS.2 es un transformer MoE de 40 capas con 256 expertos y 1 experto compartido. La innovación arquitectónica principal es la disposición mixta de atención: 30 de las 40 capas usan Sliding Window Attention con ventana de 512 tokens y gating sigmoide por cabeza, mientras que las 10 restantes emplean atención global. Las escalas rotatorias se aplican por capa, lo que permite esta mezcla 3:1. El resultado es una inferencia más rápida y un requisito de KV cache mucho menor que un transformer denso de atención global completa; en esta variante FP8 el propio KV cache está cuantizado a FP8, reduciendo aún más la memoria por token.

El entrenamiento se organizó en tres fases: pre-entrenamiento, post-entrenamiento y etapas de aprendizaje por refuerzo (RL). El optimizador empleado fue Muon. El modelo incorpora soporte nativo de razonamiento con "thinking" intercalado y preservado entre llamadas a herramientas, activable o desactivable por petición. No se dispone de información sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional y razonamiento de múltiples pasos.
- Codificación agéntica: resolución autónoma de tareas de ingeniería de software con ejecución en sandbox.
- Razonamiento intercalado ("interleaved thinking") entre llamadas a herramientas, con modo thinking activable y desactivable por petición y pensamiento preservado.
- Uso de herramientas y function calling dentro de bucles agénticos de horizonte largo (hasta 500 pasos en la metodología de benchmark del autor).
- Capacidad multilingüe en el ámbito de programación, evidenciada por el benchmark SWE-bench Multilingual (62,4%).
- Operación en local: tamaño compacto (3B activos) apto para máquinas de consumo.
- Modalidad exclusivamente texto-a-texto (sin visión ni audio).

## Casos de uso

- Agente de resolución de incidencias en repositorios: el modelo puede recibir un issue, explorar el código, aplicar parches y ejecutar pruebas dentro de un bucle agéntico, apoyándose en su ventana de 131K tokens para mantener el contexto del repositorio y de las herramientas invocadas.
- Automatización de tareas de terminal y DevOps: con un 30,1% en Terminal-Bench 2.0, es adecuado para agentes que ejecutan comandos, interpretan su salida y corrigen errores de forma iterativa en entornos sandbox.
- Asistente de codificación en local para desarrolladores: al caber en un Mac con 36 GB de RAM y estar disponible en Ollama, permite flujos de autocompletado, refactorización y explicación de código sin enviar datos a la nube.
- Migración y mantenimiento multilingüe de bases de código: su rendimiento en SWE-bench Multilingual (62,4%) lo hace útil para tareas de corrección y adaptación de código en distintos lenguajes dentro de un mismo pipeline.
- Integración en pipelines de CI/CD: mediante tool calling y ejecución controlada, puede incorporarse como paso de revisión automática de parches o de generación de tests, con el modo thinking desactivado para reducir latencia cuando no se requiere razonamiento profundo.
- Despliegue en infraestructura empresarial con vLLM: la variante FP8 está validada sobre vLLM 0.21.0, RHOAI 3.5.1 y RHAIIS 3.5.0-ea.2, lo que facilita su servicio en clústeres con GPUs y KV cache en FP8 para atender más peticiones concurrentes.
- Sustituto local de APIs propietarias en tareas de codificación: con licencia Apache 2.0 y pesos abiertos, permite construir productos comerciales sin dependencia de proveedores externos ni costes por token.

## Benchmarks y rendimiento

Resultados publicados por el autor para la variante BF16 (no se han publicado cifras específicas para la variante FP8):

| Modelo | Tamaño | SWE-bench Verified | SWE-bench Multilingual | SWE-bench Pro (público) | Terminal-Bench 2.0 |
|---|---|---|---|---|---|
| Laguna XS.2 (BF16) | 33B | 68,2% | 62,4% | 44,5% | 30,1% |
| Devstral Small 2 | 24B dense | 68,0% | 55,7% | - | 22,5% |
| Gemma 4 31B IT | 31B dense | 52,0% | 51,7% | 35,7% | 42,9% |
| Qwen3.5-35B-A3B | 35B | 69,2% | 60,3% | 44,6% | 40,5% |
| Qwen3.6-35B-A3B | 35B | 73,4% | 67,2% | 49,5% | 51,5% |
| Claude Haiku 4.5 | - | 73,3% | - | 39,5% | 29,8% |
| GPT-5.4 Nano | - | - | - | 52,4% | 46,3% |

Metodología: framework Harbor del Laude Institute con el arnés de agente de Poolside, máximo 500 pasos, ejecución en sandbox con 8 GB de RAM y 2 CPUs (excepto Terminal-Bench 2.0), temperatura 0,7 y top_k 20. SWE-bench Verified promediado sobre 4 ejecuciones (pass@1 medio), SWE-bench Multilingual sobre 7 y SWE-bench Pro sobre 3.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: el repositorio ocupa 35,3 GB, por lo que se necesitan al menos unos 36-40 GB de memoria para cargar los pesos, más el KV cache (cuantizado a FP8) y el margen del runtime.
- El autor indica que el modelo es ejecutable en un Mac con 36 GB de RAM, lo que sugiere viabilidad en Apple Silicon de gama alta con memoria unificada.
- GPU recomendadas: A100 (40/80 GB), H100, L40S y GPUs con 48 GB o más para FP8 con margen. Las variantes NVFP4 e INT4 reducen los requisitos y abren la puerta a GPUs de consumo de gama alta (por ejemplo, RTX 4090 con 24 GB en cuantizaciones de 4 bits), aunque no se dispone de cifras oficiales de VRAM para esas variantes en la información proporcionada.
- Opciones de despliegue: vLLM (librería declarada y versión validada 0.21.0), Ollama (disponible en el catálogo público) y plataformas RHOAI 3.5.1 y RHAIIS 3.5.0-ea.2.
- Latencia y throughput: no disponibles. La arquitectura con 3B activos por token y SWA en 30 de 40 capas está diseñada explícitamente para inferencia rápida y bajo consumo de KV cache, pero no se han publicado métricas concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Laguna XS.2 | 33B MoE | 3B | 131.072 | 68,2% | Apache 2.0 | Pesos abiertos (BF16, FP8, NVFP4, INT4) |
| Qwen3.5-35B-A3B | 35B MoE | 3B | no disponible | 69,2% | no disponible | Pesos abiertos |
| Devstral Small 2 | 24B dense | 24B | no disponible | 68,0% | no disponible | Pesos abiertos |
| Gemma 4 31B IT | 31B dense | 31B | no disponible | 52,0% | no disponible | Pesos abiertos |

Frente a Qwen3.5-35B-A3B, Laguna XS.2 queda ligeramente por debajo en SWE-bench Verified (68,2% frente a 69,2%) pero por encima en SWE-bench Multilingual (62,4% frente a 60,3%) y en Terminal-Bench 2.0 (30,1% frente a 40,5% en contra). Frente a Devstral Small 2, denso de 24B, iguala prácticamente en SWE-bench Verified y supera claramente en el benchmark multilingüe. La ventaja diferencial de Laguna XS.2 es la combinación de licencia Apache 2.0, contexto de 131K tokens y activación de solo 3B parámetros, que reduce los requisitos de cómputo frente a los modelos densos.

## Limitaciones y advertencias

- Modelo exclusivamente de texto: no procesa imágenes, audio ni otras modalidades.
- No se especifican los idiomas soportados; el rendimiento fuera del inglés y de los lenguajes de programación evaluados no está documentado.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de código donde puede proponer APIs o funciones inexistentes; se recomienda validación con tests y ejecución en sandbox.
- Los benchmarks publicados corresponden a la variante BF16; el rendimiento de esta variante FP8 puede diferir ligeramente y no se han publicado métricas específicas.
- Los resultados de benchmark dependen del arnés de agente de Poolside y de parámetros de muestreo concretos (temperatura 0,7, top_k 20), por lo que no son directamente comparables con evaluaciones realizadas con otros arneses.
- El modelo requiere `trust_remote_code` (etiqueta custom_code) y está validado únicamente sobre versiones concretas de vLLM y plataformas Red Hat; otras combinaciones pueden no funcionar correctamente.
- El acceso al modelo original en Hugging Face puede estar sujeto a un formulario (gated) con aceptación de la política de privacidad de Poolside.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene revisar los términos de la política de privacidad asociada al acceso.
- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento, lo que limita la evaluación de riesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Laguna-XS.2-FP8
- Variante BF16: https://huggingface.co/poolside/Laguna-XS.2
- Variante NVFP4: https://huggingface.co/poolside/Laguna-XS.2-NVFP4
- Variante INT4: https://huggingface.co/poolside/Laguna-XS.2-INT4
- Blog de lanzamiento: https://poolside.ai/blog/laguna-a-deeper-dive
- Demo en Shimmer: https://shimmer.poolside.ai
- API key de Poolside: https://platform.poolside.ai
- Repositorio del arnés de agente: https://github.com/poolsideai/pool
- Ollama: https://ollama.com/library/laguna-xs.2
- Política de privacidad: https://poolside.ai/legal/privacy
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Blog de Qwen (referencia de comparativas): https://qwen.ai/blog?id=qwen3.6-35b-a3b
