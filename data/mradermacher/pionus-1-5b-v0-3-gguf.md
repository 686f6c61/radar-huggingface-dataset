# mradermacher/pionus-1.5b-v0.3-GGUF

## Resumen

Pionus 1.5B v0.3 es un modelo de lenguaje especializado en la generación de mensajes de commit siguiendo la convención Conventional Commits. Lo desarrolla LucasBRT y esta versión concreta es una cuantización GGUF publicada por mradermacher, un conocido creador de cuantizaciones para llama.cpp. El modelo parte de una base de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) y ha sido afinado mediante DPO (Direct Preference Optimization) sobre el dataset JetBrains-Research/commit-chronicle, un corpus específico de commits reales.

La relevancia del modelo reside en su especialización: en lugar de competir en capacidades generales, se centra en una tarea concreta del flujo de trabajo de desarrollo (escribir mensajes de commit claros y estructurados) y lo hace con un tamaño reducido que permite ejecución local en hardware modesto. La licencia Apache 2.0 facilita su integración en herramientas comerciales y pipelines de CI/CD.

Esta ficha cubre la versión GGUF, que ofrece múltiples niveles de cuantización (desde Q2_K de 0,8 GB hasta f16 de 3,2 GB), pensados para despliegue en CPU, GPU de consumo o entornos con memoria limitada. El modelo base es LucasBRT/pionus-1.5b-v0.3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del modelo base Pionus 1.5B; detalles de arquitectura interna no disponibles) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de aproximadamente 1,5 mil millones de parámetros, afinado específicamente para la generación de mensajes de commit. El entrenamiento incluye una fase de DPO (Direct Preference Optimization), según indican las etiquetas del repositorio, lo que sugiere que se optimizó la preferencia entre candidatos de mensajes de commit para alinear la salida con las convenciones esperadas. El dataset utilizado es JetBrains-Research/commit-chronicle, un corpus de commits reales publicado por JetBrains Research.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.). La versión publicada por mradermacher es una cuantización estática del modelo original; el autor indica que no ha generado cuantizaciones ponderadas/imatrix en el momento de la publicación. La arquitectura interna concreta (número de capas, dimensión oculta, cabezas de atención) no se especifica en la model card.

## Capacidades

- Generación de mensajes de commit siguiendo el formato Conventional Commits (tipo, scope, descripción).
- Comprensión de diffs y cambios de código en inglés para producir un mensaje descriptivo.
- Especialización en una tarea única: no está orientado a generación general, razonamiento matemático ni código complejo.
- Soporte de conversación multi-turno según la etiqueta `conversational` del repositorio.
- Idioma: únicamente inglés.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- **Automatización de mensajes de commit en Git hooks**: integrar el modelo en un hook `prepare-commit-msg` o `commit-msg` para generar automáticamente un mensaje Conventional Commits a partir del diff preparado, reduciendo la fricción y mejorando la consistencia del historial.
- **Integración en pipelines de CI/CD**: ejecutar el modelo en un paso previo al commit o en un bot de revisión que proponga mensajes de commit cuando el desarrollador no los ha proporcionado, con verificación automática del formato.
- **Herramientas de desarrollo en el IDE**: incrustar el modelo cuantizado (Q4_K_M de 1,1 GB) en una extensión de editor para sugerir mensajes de commit mientras se escribe, con inferencia local y sin enviar código a servicios externos.
- **Normalización de historiales de repositorios**: procesar commits existentes con mensajes inconsistentes y generar propuestas de reescritura en formato Conventional Commits para equipos que adoptan esta convención de forma retroactiva.
- **Generación de changelogs**: usar los mensajes normalizados como base para construir changelogs automáticos, ya que el formato estructurado facilita el parseo y la agrupación por tipo de cambio.
- **Formación y revisión de equipos**: desplegar el modelo como asistente local que sugiere mensajes de commit a desarrolladores junior, sirviendo como ejemplo de buenas prácticas sin depender de APIs externas.
- **Entornos con requisitos de privacidad**: al ejecutarse localmente con cuantizaciones de 0,8 a 1,7 GB, permite generar mensajes de commit en entornos air-gapped o con políticas estrictas de no enviar código a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: entre 0,8 GB (Q2_K) y 3,2 GB (f16). Las cuantizaciones recomendadas Q4_K_S y Q4_K_M ocupan 1,0 y 1,1 GB respectivamente.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradas para este tamaño. También puede ejecutarse en CPU.
- **GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo moderna (GTX 1650 en adelante) e incluso en iGPU con memoria compartida suficiente.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o text-generation-webui). El repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints estándar de inferencia.
- **Latencia y throughput**: no disponibles en la información proporcionada. Por el tamaño (1,5B) y las cuantizaciones, se espera inferencia en tiempo real en GPU de consumo, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Pionus 1.5B v0.3 (esta ficha) | 1,54B | no disponible | Mensajes de commit (Conventional Commits) | Apache 2.0 | GGUF, safetensors |
| Modelos generales de ~1,5B (p. ej. Qwen2.5-1.5B, SmolLM2-1.7B) | ~1,5-1,7B | 32K (típico en esa familia) | Generales | Apache 2.0 / otras | GGUF, safetensors |
| Modelos especializados en commit (p. ej. commit-message-generator de tamaños similares) | variable | no disponible | Mensajes de commit | variable | variable |

No se dispone de datos de rendimiento comparativo (benchmarks) para Pionus 1.5B v0.3 frente a alternativas, por lo que la comparación se limita a parámetros, licencia y especialización. Los modelos generales de tamaño similar pueden abordar la tarea de mensajes de commit mediante prompting, pero no están afinados específicamente con DPO sobre un corpus de commits, lo que en principio otorga ventaja a Pionus en consistencia de formato.

## Limitaciones y advertencias

- **Idioma**: el modelo está entrenado únicamente en inglés; los mensajes de commit en castellano u otros idiomas pueden degradarse.
- **Especialización estrecha**: no es un modelo general; su uso fuera de la generación de mensajes de commit probablemente produzca resultados pobres.
- **Riesgo de alucinación**: puede inventar referencias a archivos o cambios que no aparecen en el diff, o producir mensajes genéricos si el diff es ambiguo.
- **Contexto**: no se documenta la longitud de contexto; diffs muy grandes podrían truncarse o degradar la calidad.
- **Sesgos**: no se documentan evaluaciones de sesgo; al entrenarse sobre commits reales de JetBrains Research, puede heredar sesgos de estilo y terminología de ese corpus.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (LucasBRT/pionus-1.5b-v0.3) y del dataset (JetBrains-Research/commit-chronicle) para cumplimiento completo.
- **Cuantizaciones**: las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad del formato Conventional Commits; se recomienda Q4_K_M o superior para producción.
- **Sin benchmarks**: no hay métricas publicadas que permitan estimar la tasa de acierto en la generación de mensajes válidos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/pionus-1.5b-v0.3-GGUF
- Modelo base: https://huggingface.co/LucasBRT/pionus-1.5b-v0.3
- Dataset de entrenamiento: https://huggingface.co/datasets/JetBrains-Research/commit-chronicle
- Página de descargas del cuantizador: https://hf.tst.eu/model#pionus-1.5b-v0.3-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
