# dongguanting/ToolSpace-8B

## Resumen

ToolSpace-8B es un modelo de lenguaje especializado en uso de herramientas (tool use) y razonamiento agéntico de horizonte largo, desarrollado por el autor dongguanting sobre el backbone Qwen3-8B. El modelo se entrena con trayectorias sintetizadas por ToolSpace, un pipeline que construye un grafo de composición de herramientas a partir de trazas de ejecución reales y genera tareas cross-environment mediante recorridos con rollback y verificación basada en ejecución. Sobre esas trayectorias se aplica un ajuste supervisado (SFT) seguido de aprendizaje por refuerzo agéntico on-policy.

La relevancia del modelo radica en su enfoque: en lugar de entrenar únicamente con datos de function calling aislados, ToolSpace captura dependencias de datos, estado y reintentos entre herramientas, lo que permite abordar tareas multi-paso que requieren encadenar llamadas y recuperarse de fallos. Es un transformer denso de 8.190.735.360 parámetros con una longitud de contexto de 65.536 tokens, distribuido en formato BF16 Safetensors y con licencia MIT.

El checkpoint publicado corresponde a la variante de 8B de una familia que incluye también versiones de 35B-A3B y 744B-A40B. Está pensado para servir como endpoint compatible con OpenAI mediante vLLM, con parsers específicos para tool calling y razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (backbone Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | BF16 Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8B parámetros, y se especializa mediante un pipeline de dos fases: ajuste supervisado sobre trayectorias generadas por ToolSpace y, posteriormente, aprendizaje por refuerzo agéntico on-policy. ToolSpace construye un grafo de composición de herramientas a partir de trazas de ejecución reales, capturando dependencias de datos, de estado y de reintento entre llamadas. A partir de ese grafo sintetiza tareas cross-environment mediante recorridos state-aware con rollback, y conserva únicamente las trayectorias que superan una verificación basada en ejecución.

La innovación técnica principal no reside en la arquitectura del transformer, sino en el método de síntesis de entornos y datos de entrenamiento orientado a horizonte largo: el filtrado por ejecución reduce el ruido de trayectorias inválidas y el RL on-policy refina la política del agente sobre el entorno sintetizado. El contexto de 65.536 tokens permite mantener historiales de conversación y estado de herramientas extensos. No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional orientada a tareas agénticas.
- Uso de herramientas y function calling, con soporte de tool choice automático en vLLM mediante el parser `hermes`.
- Razonamiento multi-paso y de horizonte largo: encadenamiento de llamadas a herramientas con dependencias de estado y reintentos.
- Recuperación ante fallos dentro de una trayectoria (rollback y reintento), según el diseño del pipeline de entrenamiento.
- Modo de razonamiento explícito, servido con el parser `deepseek_r1` en vLLM.
- Compatibilidad con endpoints OpenAI a través de vLLM.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión y audio: no disponibles.

## Casos de uso

- Automatización de flujos de trabajo empresariales: el modelo puede encadenar llamadas a APIs internas con dependencias de estado, adecuado por su entrenamiento en trayectorias con dependencias de datos y reintentos, evaluado en AutomationBench (34,3).
- Agentes de atención al cliente con acceso a sistemas: gestión de conversaciones multi-turno con contexto de hasta 65.536 tokens y ejecución de acciones como consultas de pedidos o modificaciones de cuenta mediante tool calling.
- Asistentes de operaciones sobre suites ofimáticas y ofimática en la nube: tareas multi-aplicación evaluadas en OfficeQA Pro (12,0) y SkillsBench (4,1), donde el modelo debe coordinar herramientas heterogéneas.
- Automatización de tareas de empleo y reclutamiento simulado: flujos evaluados en JobBench (15,5), con pasos secuenciales sobre múltiples herramientas.
- Integración en pipelines de agentes con vLLM: despliegue como endpoint compatible con OpenAI (`--enable-auto-tool-choice --tool-call-parser hermes`) para orquestadores tipo LangChain o frameworks propios.
- Evaluación e investigación en agentes de horizonte largo: el repositorio incluye un directorio de evaluación con comandos y configuraciones para reproducir los benchmarks, útil para investigadores que comparan métodos de síntesis de entornos.
- Servicios financieros simulados: τ³-Bench Banking (11,3) refleja capacidad para tareas de dominio bancario con herramientas, aunque con margen de mejora.

## Benchmarks y rendimiento

Resultados de la Tabla 1 del paper ToolSpace. El promedio (Avg.) es la media no ponderada de los siete benchmarks.

| Modelo | AutomationBench | SkillsBench | JobBench | τ³-Bench Banking | BFCL V4 | Harvey LAB | OfficeQA Pro | Avg. |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen3-8B | 0,0 | 0,1 | 0,1 | 4,1 | 42,8 | 0,0 | 3,0 | 7,2 |
| ToolSpace-8B (SFT) | 32,3 | 3,9 | 13,1 | 10,3 | 65,3 | 0,0 | 12,0 | 19,6 |
| ToolSpace-8B + Agent RL (este checkpoint) | 34,3 | 4,1 | 15,5 | 11,3 | 67,5 | 0,0 | 12,0 | 20,7 |

El salto más pronunciado respecto a Qwen3-8B se da en AutomationBench (+34,3 puntos) y BFCL V4 (+24,7 puntos). Harvey LAB permanece en 0,0 en todas las variantes.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos, más overhead de KV cache; con contexto completo de 65.536 tokens el consumo crece de forma significativa.
- Cuantización: no se especifican tipos soportados en la información disponible; al ser un modelo transformers/Safetensors, es convertible a GGUF/AWQ/GPTQ con herramientas externas, pero no hay datos oficiales de calidad tras cuantizar.
- GPU recomendadas: A100 80 GB o H100 para servir con contexto completo y concurrencia; una RTX 4090 (24 GB) puede alojar los pesos en BF16 pero con margen limitado para KV cache a contexto largo.
- Despliegue: vLLM es la opción documentada por el autor, con `--max-model-len 65536`, `--enable-auto-tool-choice`, `--tool-call-parser hermes` y `--reasoning-parser deepseek_r1`. No se documentan otras opciones (llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Avg. (7 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToolSpace-8B + Agent RL | 8,19B (denso) | 65.536 | 20,7 | MIT | Hugging Face |
| Qwen3-8B (base) | 8B (denso) | no disponible | 7,2 | no disponible en la informacion | Hugging Face |
| ToolSpace-35B-A3B | 35B totales / 3B activos (MoE) | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| ToolSpace-744B-A40B | 744B totales / 40B activos (MoE) | no disponible | no disponible | no disponible en la informacion | Hugging Face |

La comparativa más directa es con su backbone Qwen3-8B, sobre el que mejora el promedio de 7,2 a 20,7. Las variantes mayores de la misma familia (35B-A3B y 744B-A40B) se anuncian en la model card, pero no se aportan sus resultados en la información disponible.

## Limitaciones y advertencias

- Harvey LAB se mantiene en 0,0 en todas las variantes, lo que indica una carencia específica en ese tipo de tareas de dominio legal.
- SkillsBench (4,1) y τ³-Bench Banking (11,3) muestran un rendimiento bajo en términos absolutos: el modelo sigue siendo débil en tareas de habilidades y banca comparado con el estado del arte.
- Riesgo de alucinación en llamadas a herramientas: aunque el entrenamiento filtra trayectorias por verificación de ejecución, en producción pueden generarse argumentos o secuencias de llamadas inválidas.
- Sesgos conocidos: no disponibles en la información proporcionada; al heredar el backbone Qwen3-8B, arrastra los sesgos de sus datos de preentrenamiento.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe más allá del comportamiento del backbone.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-8B y de los datos de entrenamiento sintetizados.
- El contexto de 65.536 tokens exige planificación de memoria en despliegue; a máxima longitud el KV cache puede dominar el consumo de VRAM.
- Modelo con pocas descargas (409) y reciente (octubre de 2026): ecosistema y validación comunitaria limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongguanting/ToolSpace-8B
- Paper: https://huggingface.co/papers/2611.05036
- Repositorio de código: https://github.com/dongguanting/ToolSpace
- Directorio de evaluación: https://github.com/dongguanting/ToolSpace/tree/main/evaluation
- Variante 35B-A3B: https://huggingface.co/dongguanting/ToolSpace-35B-A3B
- Variante 744B-A40B: https://huggingface.co/dongguanting/ToolSpace-744B-A40B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
