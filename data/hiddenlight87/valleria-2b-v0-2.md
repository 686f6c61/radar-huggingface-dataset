# Hiddenlight87/VallerIA-2B-v0.2

## Resumen

VallerIA 2B v0.2 es un modelo de lenguaje compacto de tipo decoder-only derivado de Qwen/Qwen3.5-2B-Base mediante fine-tuning con LoRA/PEFT y posterior fusión segura de los adaptadores. Lo desarrolla Andrea Vallera (usuario Hiddenlight87) dentro del proyecto Vally, y está orientado a comportamiento conversacional, gestión transparente de acciones y estado de herramientas, permisos, memoria y manejo de errores en asistentes locales. Esta versión v0.2 se presenta como la "Golden baseline" congelada del proyecto, no como una rama experimental de Loop Transformer.

El modelo tiene 1.881.825.088 parámetros en BF16, un vocabulario de 248.077 tokens y una arquitectura Qwen3_5ForCausalLM que declara un contexto máximo de 262.144 tokens, aunque el runtime validado para esta release se limita a 8.192 tokens. Su relevancia actual reside en que es un ejemplo de ajuste fino de un modelo base pequeño para tareas de asistente local con soporte declarado de despliegue en Transformers, llama.cpp, Ollama y runtimes compatibles, con licencia Apache 2.0.

El modelo está etiquetado para italiano e inglés, con un dataset sintético propio generado con un modelo profesor Qwen3.8 27B y revisión semántica mediante NVIDIA Nemotron 3.5 Bolt. Es una release experimental, sin descargas ni likes en el momento de la consulta, pensada para investigación sobre modelos de asistente compactos y evaluación por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer decoder-only) |
| Parámetros totales | 1.881.825.088 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens arquitectónicos; 8.192 tokens validados en runtime v0.2 |
| Tipos de cuantización | BF16 (distribución); Q4_K_M validado en configuración Golden de Ollama |
| Idiomas soportados | italiano (it), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,8 GB); etiquetas de compatibilidad con GGUF y Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B-Base, una arquitectura Qwen3_5ForCausalLM de tipo decoder-only con 1.881.825.088 parámetros en BF16 y un vocabulario de 248.077 tokens. Aunque la arquitectura base de Qwen3.5 incluye componentes multimodales, VallerIA v0.2 se ha ajustado y validado principalmente para uso de texto y conversacional; las capacidades de visión heredadas no han sido validadas de forma independiente para esta release. El contexto arquitectónico máximo es de 262.144 tokens, pero el runtime congelado y el benchmark Golden de Ollama se validaron con 8.192 tokens, y contextos mayores no han sido validados de forma independiente.

El entrenamiento consistió en fine-tuning con LoRA/PEFT seguido de una fusión segura en el modelo base. La configuración principal del LoRA fue: rango 16, alpha 32, dropout 0,05, módulos objetivo all-linear, longitud máxima de secuencia de entrenamiento de 2.048 tokens y semilla 42. La release promovida deriva del adaptador VallerIA-2B-v0.2.3-balanced-s06. El dataset de VallerIA es propio y sintético, con ejemplos que cubren identidad, diálogo en italiano, veracidad, enrutamiento de herramientas, permisos, gestión de memoria, flujos de trabajo de código y proyecto, y manejo de errores. La generación sintética utilizó Qwen3.8 27B como modelo profesor y NVIDIA Nemotron 3.5 Bolt para la revisión semántica del dataset. La construcción incluyó puertas de validación deterministas, deduplicación, prevención de solapamiento con validación y enrutamiento a revisión humana de ejemplos límite.

## Capacidades

- Generación de texto y comportamiento conversacional multi-turno, con énfasis en diálogo en italiano e inglés.
- Razonamiento básico y respuesta a preguntas, con un rendimiento medido en MMLU del 56,837 % y ARC-Challenge del 78,328 % en la configuración Golden de Ollama.
- Enrutamiento de herramientas y gestión transparente del estado de acciones, permisos y memoria, según el dataset de ajuste declarado por el autor.
- Manejo de errores y flujos de trabajo de código y proyecto, entrenados explícitamente en el dataset v0.2.
- Soporte de tool calling y function calling: la model card menciona enrutamiento de herramientas y permisos, aunque la ejecución real, la autorización y el acceso a memoria deben imponerse desde la aplicación circundante.
- Capacidades de agente y razonamiento multi-paso: el modelo está orientado a asistentes locales experimentales, pero no incluye la capa de política determinista de la aplicación Vally.
- Capacidades multilingües limitadas a italiano e inglés.
- Capacidades de visión heredadas del modelo base Qwen3.5, no validadas de forma independiente para esta release.
- No se declara soporte de audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Asistente local experimental: el modelo puede ejecutarse en local con Ollama en cuantización Q4_K_M y una ventana de 8.192 tokens, adecuado para prototipos de asistente personal en italiano o inglés sin dependencia de la nube.
- Diálogo conversacional multi-turno: su ajuste en diálogo italiano y manejo de memoria lo hace útil para chatbots de dominio acotado que necesitan recordar estado de la conversación dentro de la ventana validada de 8.192 tokens.
- Enrutamiento de herramientas en aplicaciones de escritorio: el ajuste en tool routing y permisos permite clasificar intenciones y decidir qué herramienta invocar, siempre que la aplicación imponga la autorización y la ejecución real.
- Flujos de trabajo de código y proyecto: el dataset incluye ejemplos de coding/project workflows, por lo que puede emplearse para asistir en tareas de organización de proyectos y generación de fragmentos de código en entornos locales.
- Manejo de errores en asistentes: el ajuste específico en error handling permite generar respuestas de recuperación y mensajes de estado transparentes cuando una acción falla, útil en sistemas de automatización locales.
- Investigación sobre modelos de asistente compactos: al ser una release congelada con dataset sintético documentado y configuración LoRA reproducible, sirve como base para estudiar el efecto del ajuste fino en modelos de ~2B parámetros.
- Evaluación y pruebas de la comunidad: su licencia Apache 2.0 y compatibilidad con Transformers, llama.cpp y Ollama facilitan la replicación de benchmarks y la comparación con otras variantes.

## Benchmarks y rendimiento

Resultados de la configuración Golden de Ollama v0.2 publicados en la model card:

| Benchmark | Puntuación |
|---|---:|
| ARC-Challenge | 78,328 % |
| HellaSwag | 47,660 % |
| WinoGrande | 54,065 % |
| MMLU | 56,837 % |
| TruthfulQA (proxy generativo interno) | 41,616 % |
| GSM8K | 20,318 % |

El propio autor indica que TruthfulQA es un proxy generativo interno y no se reclama equivalente directo a la métrica estándar del leaderboard. No se han publicado en la información disponible resultados comparativos con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 1.881.825.088 parámetros requieren aproximadamente 3,8 GB solo para pesos, más overhead de activaciones y caché KV; en Q4_K_M, el peso se reduce a aproximadamente 1,1-1,3 GB, con margen adicional para contexto.
- GPU recomendadas: no disponibles de forma explícita en la información proporcionada; por tamaño, el modelo es apto para GPU consumer con al menos 8 GB de VRAM en cuantización Q4_K_M.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más de VRAM en cuantización Q4_K_M; en BF16 requiere alrededor de 4-6 GB según contexto y runtime.
- Opciones de despliegue: Transformers (versión mínima probada 5.23.0 con PyTorch en entorno BF16), llama.cpp, Ollama (configuración Golden Q4_K_M, num_ctx 8192, temperature 0.2, top_p 0.9) y runtimes compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Se mencionan implementaciones opcionales de causal-conv y flash-linear-attention como mejoras de rendimiento, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---:|---|---|---|---|
| VallerIA 2B v0.2 | 1,88 B | 262.144 arquitectónicos; 8.192 validados | Apache 2.0 | it, en | Fine-tuning LoRA sobre Qwen3.5-2B-Base; benchmarks Golden Ollama publicados |
| Qwen3.5-2B-Base | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | Modelo base del que deriva VallerIA; sin datos de benchmarks en la información proporcionada |
| Alternativas de ~2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en parámetros, contexto, rendimiento y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental: el autor lo declara explícitamente como experimental y no debe considerarse una fuente autoritativa.
- Riesgo de alucinación: puede producir información incorrecta o fabricada; el proxy de TruthfulQA generativo se sitúa en 41,616 %.
- Contexto validado limitado: aunque la arquitectura declara 262.144 tokens, el runtime congelado y el benchmark Golden solo se validaron con 8.192 tokens; contextos mayores no han sido validados de forma independiente.
- Idiomas limitados: solo italiano e inglés; no se declara soporte de castellano ni de otros idiomas.
- Ejecución de herramientas y permisos: la ejecución real, la autorización, el acceso a memoria, las acciones persistentes y el estado externo deben imponerse desde la aplicación circundante; los pesos por sí solos no proporcionan la capa de política determinista de Vally.
- Visión no validada: las capacidades multimodales heredadas del modelo base no han sido validadas de forma independiente para esta release.
- Uso de alto impacto: no debe usarse como único decisor en decisiones médicas, legales, financieras, laborales, de seguridad o de protección.
- Licencia: Apache 2.0, lo que permite uso comercial, pero debe revisarse el archivo NOTICE.md y la atribución a Qwen/Alibaba Cloud como modelo base.
- Madurez de la release: sin descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Hiddenlight87/VallerIA-2B-v0.2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Evaluación (referenciada en la model card): `EVALUATION.md` dentro del repositorio
- Ejemplo de inferencia con Transformers (referenciado): `examples/inference_transformers.py` dentro del repositorio
- Licencia (referenciada): `LICENSE` dentro del repositorio
- Atribución (referenciada): `NOTICE.md` dentro del repositorio
