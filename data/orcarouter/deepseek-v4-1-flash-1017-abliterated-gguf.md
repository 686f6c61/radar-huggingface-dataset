# orcarouter/DeepSeek-V4.1-Flash-1017-abliterated-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-abliterated-GGUF es una cuantización en formato GGUF del modelo DeepSeek-V4.1-Flash-1017, un transformer de tipo Mixture-of-Experts (MoE) con 763.000 millones de parámetros publicado originalmente por DeepSeek. Esta versión, distribuida por orcarouter, aplica una técnica de "abliteration" que elimina la dirección de rechazo del espacio residual, reduciendo sustancialmente la alineación de seguridad del modelo base. El resultado es un modelo que responde a peticiones que el original rechazaría, orientado a investigación en interpretabilidad, estudio de mecanismos de rechazo y red teaming.

La arquitectura destaca por tres elementos: 384 expertos enrutados con activación top-6, una memoria n-grama Engram de 197.000 millones de parámetros que actúa como tabla de búsqueda, y atención dispersa comprimida con una ventana de contexto de hasta 1 millón de tokens. La cuantización se ha realizado con precisión mixta guiada por divergencia KL medida por capa, no por reglas heurísticas, lo que permite que la build principal (Mix-256G) mantenga el 93,7% de coincidencia top-1 con el modelo sin cuantizar.

El modelo es relevante porque demuestra que un MoE de 763B puede ejecutarse en una sola máquina con 256 GB de memoria unificada o RAM, gracias a que la tabla Engram se mapea desde disco y se lee bajo demanda. El repositorio ocupa 574,5 GB e incluye dos builds (Mix-256G y Mix-128G) con compromisos distintos entre calidad y requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 384 expertos enrutados (top-6), memoria Engram n-grama y atención dispersa comprimida |
| Parametros totales | 748.494.643.824 (763B según model card) |
| Parametros activos | no disponible (top-6 de 384 expertos; el dato exacto de parámetros activos no se especifica) |
| Longitud de contexto | 1.000.000 tokens (según model card) |
| Tipos de cuantizacion | GGUF con precisión mixta por experto: 3,36 bpw (Mix-256G) y 1,59 bpw / IQ1_S (Mix-128G) |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 384 expertos enrutados y activación top-6 por token, complementado por una memoria Engram de 197.000 millones de parámetros que funciona como tabla de búsqueda n-grama: lee 48 filas por token y se mapea desde disco en llama.cpp, por lo que no necesita residir en RAM. La atención es dispersa comprimida, lo que permite sostener una ventana de 1 millón de tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

La innovación principal de esta distribución es el proceso de cuantización: cada capa de expertos recibió su propia precisión a partir de la divergencia KL medida empíricamente, en lugar de aplicar una regla uniforme. La build Mix-256G usa 3,36 bits por peso de experto y alcanza una KLD de 0,051 con un 93,7% de coincidencia top-1 frente al modelo sin cuantizar, con un incremento de perplejidad del 2,4%. La build Mix-128G baja a 1,59 bpw, dispara la KLD a 0,520 y eleva la perplejidad un 54,7%, con uno de cada cinco tokens distinto del original. La abliteration se aplica ortogonalizando la dirección de rechazo en todas las matrices que escriben en el flujo residual.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1 millón de tokens.
- Razonamiento explícito (etiqueta `reasoning` en la model card).
- Function calling / tool calling (etiqueta `function-calling`).
- Soporte de agentes y razonamiento multi-paso.
- Capacidades multilingües limitadas a inglés y chino.
- Modo sin censura: responde a solicitudes que el modelo base rechazaría, por diseño de la abliteration.
- Orientado a red teaming de IA y evaluación de robustez (etiqueta `ai-red-team`).
- Compatible con endpoints OpenAI (etiqueta `endpoints_compatible`).
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Investigación en mecanismos de rechazo: el modelo permite estudiar qué representaciones internas se asocian a la negativa a responder, comparando sus respuestas con las del DeepSeek-V4.1-Flash-1017 original sobre el mismo conjunto de prompts.
- Red teaming y evaluación de robustez: útil para generar ataques adversariales y prompts dañinos controlados que permitan medir la eficacia de filtros y moderadores antes de desplegarlos en producción.
- Análisis de interpretabilidad con contexto largo: la ventana de 1M tokens permite alimentar corpus completos de documentación o trazas de agentes y analizar cómo se distribuye la atención a lo largo de secuencias extensas.
- Asistencia de código en local con function calling: integrable en pipelines de CI/CD mediante llama.cpp para tareas de revisión, generación de parches y llamadas a herramientas, siempre que se añada una capa de moderación propia.
- Procesamiento de documentos extensos en inglés o chino: resumen y extracción de información sobre contratos, informes o bases de conocimiento que superan el contexto de modelos más pequeños.
- Despliegue de agentes autónomos multi-paso en una sola máquina: la build Mix-256G cabe en 256 GB de memoria unificada y permite ejecutar el modelo sin depender de APIs externas, con la tabla Engram residiendo en SSD.
- Experimentación académica con cuantización extrema: la build Mix-128G sirve para estudiar el impacto de la cuantización a 1,59 bpw en la calidad del razonamiento, comparando sus salidas con la build de mayor precisión.

## Benchmarks y rendimiento

| Metrica | Mix-256G | Mix-128G |
|---|---:|---:|
| Memoria en RAM/VRAM | 235,8 GB | 114,0 GB |
| Tamano de descarga | 346,5 GB | 225,0 GB |
| Bits por peso de experto | 3,36 bpw | 1,59 bpw (IQ1_S) |
| Divergencia KL (KLD ↓) | 0,051 | 0,520 |
| Coincidencia top-1 (↑) | 93,7% | 78,5% |
| Perplejidad vs. original | +2,4% | +54,7% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Build Mix-256G: requiere 256 GB de RAM, memoria unificada o VRAM. El repositorio completo pesa 574,5 GB, por lo que se necesita espacio en disco suficiente para alojar los pesos y la tabla Engram.
- Build Mix-128G: requiere 128 GB de memoria. Según el autor, está en el suelo absoluto de la cuantización (todos los expertos en IQ1_S ya ocupan 111 GB) y no debe usarse como sustituto de la build principal.
- La tabla Engram (197B parámetros) se mapea desde SSD y se lee bajo demanda: no consume RAM, pero exige almacenamiento rápido para evitar cuellos de botella en la latencia.
- GPU recomendadas: no disponibles en la información proporcionada. Por el volumen de memoria, no cabe en GPUs de consumo como RTX 4090 (24 GB) ni en configuraciones multi-GPU convencionales sin memoria unificada de gran capacidad; encaja en plataformas con memoria unificada tipo Apple Silicon de gama alta o servidores con 256 GB de RAM.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (según la model card) y endpoints compatibles con la API de OpenAI a través de OrcaRouter.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| DeepSeek-V4.1-Flash-1017-abliterated-GGUF (este) | 763B (MoE, top-6) | 1M | MIT | GGUF | Sin censura, cuantización mixta por experto |
| DeepSeek-V4.1-Flash-1017 (base) | 763B (MoE, top-6) | 1M | MIT | safetensors | Alineación de seguridad intacta |
| DeepSeek V4.1 Flash Abliterated (hosted en OrcaRouter) | 763B (MoE) | 1M | MIT | API | Misma familia, servida como API compatible con OpenAI |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La alineación de seguridad está sustancialmente reducida: el modelo cumplirá muchas solicitudes dañinas, poco éticas, ofensivas o ilegales que el original rechazaría.
- Uso previsto exclusivamente para investigación legítima: interpretabilidad, seguridad de IA, estudio de mecanismos de rechazo, red teaming y evaluación de robustez.
- El usuario asume toda la responsabilidad sobre el uso y las salidas; es obligatorio añadir capas propias de seguridad, moderación y prevención de abuso antes de cualquier despliegue.
- Riesgo elevado de alucinación y de generar contenido dañino sin filtro; no apto para aplicaciones de cara al público sin salvaguardas adicionales.
- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado en castellano.
- La build Mix-128G degrada gravemente la calidad (perplejidad +54,7%, uno de cada cinco tokens distinto) y solo sirve para pruebas exploratorias.
- El acceso al repositorio está restringido (gated): requiere aceptar condiciones en Hugging Face.
- La licencia MIT del modelo base se hereda, pero el uso debe cumplir la legislación aplicable; los autores declinan toda responsabilidad por mal uso.
- El despliegue exige hardware con 256 GB de memoria y almacenamiento rápido para la tabla Engram, lo que limita su viabilidad en entornos convencionales.

## Enlaces

- Hugging Face: https://huggingface.co/orcarouter/DeepSeek-V4.1-Flash-1017-abliterated-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- OrcaRouter: https://www.orcarouter.ai
- Modelo hosted OrcaCyber Flash 1.0: https://www.orcarouter.ai/models/orca/orcacyber-flash-1.0
- Orca Connect: https://www.orcarouter.ai/solutions/orca-connect
- X (Twitter): https://x.com/OrcaRouter
- Discord: https://discord.gg/yAh6Tex6kx
- GitHub: https://github.com/Continuum-AI-Corp
- Catálogo de modelos: https://www.orcarouter.ai/models
- Licencia MIT: https://opensource.org/license/mit
