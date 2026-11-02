# mradermacher/thau-7b-GGUF

## Resumen

thau-7b es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) desarrollado por el usuario luepow y distribuido en formato GGUF por mradermacher. Está construido sobre la arquitectura Qwen2, según indican las etiquetas del repositorio, y está orientado a tareas de razonamiento, generación de código, uso como agente, tool calling y soporte del protocolo MCP (Model Context Protocol). El modelo declara soporte para inglés y español, con especial énfasis en este último según la etiqueta "spanish".

La relevancia de esta ficha radica en que se trata de una cuantización estática del modelo original luepow/thau-7b, publicada bajo licencia Apache 2.0, lo que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles con GGUF. El repositorio incluye un abanico amplio de cuantizaciones, desde Q2_K (3,1 GB) hasta f16 (15,3 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

No se dispone de información publicada sobre la longitud de contexto, el volumen de datos de entrenamiento ni los detalles del proceso de alineación (RLHF/DPO) en la información proporcionada. La model card del cuantizador se limita a describir el proceso de conversión y los ficheros disponibles, sin aportar especificaciones técnicas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen2 (según etiquetas del repositorio) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal, según se desprende de la etiqueta "qwen2" del repositorio. El recuento de parámetros (7.615.616.512) es coherente con un modelo denso de aproximadamente 7,6 mil millones de parámetros, sin indicios de arquitectura MoE. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras formas de alineación.

La información disponible no detalla innovaciones técnicas específicas del modelo base, como decodificación especulativa, atención lineal o mecanismos híbridos. El repositorio de mradermacher es exclusivamente una colección de cuantizaciones estáticas generadas a partir de luepow/thau-7b, sin modificaciones arquitectónicas. Las etiquetas "reasoning", "code-generation", "agent", "mcp" y "tool-calling" sugieren que el modelo fue ajustado para tareas de razonamiento y uso como agente, pero no se aportan detalles sobre el proceso de ajuste.

## Capacidades

- Generación de texto conversacional en inglés y español.
- Razonamiento multi-paso (etiqueta "reasoning").
- Generación de código (etiqueta "code-generation").
- Soporte de tool calling / function calling (etiqueta "tool-calling").
- Uso como agente y compatibilidad con MCP (Model Context Protocol).
- Capacidades multilingües limitadas a inglés y español según la model card.
- No se ha documentado soporte de visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Asistentes conversacionales en español: el modelo declara soporte nativo de español y puede gestionar diálogos multi-turno, aunque la longitud de contexto no está documentada y conviene validarla empíricamente antes de desplegar conversaciones largas.
- Generación de código en pipelines de desarrollo: la etiqueta "code-generation" y el soporte de tool calling permiten integrarlo en asistentes de IDE o en flujos de CI/CD para autocompletado, generación de tests o revisión de parches.
- Agentes autónomos con tool calling: la compatibilidad declarada con MCP y function calling lo hace adecuado para orquestar llamadas a APIs externas en flujos de automatización, siempre que se valide la fiabilidad del formato de llamadas.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB) permiten ejecutar el modelo en GPUs consumer con 8 GB de VRAM o en CPU con suficiente RAM, lo que facilita prototipado local y entornos sin infraestructura dedicada.
- Procesamiento de documentación técnica bilingüe: su combinación de inglés y español resulta útil para tareas de resumen, extracción o traducción asistida en entornos corporativos con documentación en ambos idiomas.
- Automatización de soporte técnico interno: con tool calling puede consultar bases de conocimiento o sistemas de tickets, aunque la ausencia de datos de benchmarks obliga a evaluar su precisión en el dominio concreto antes de producción.
- Experimentación e investigación: al estar bajo Apache 2.0 y en formato GGUF, es adecuado para pruebas de cuantización, evaluación de modelos pequeños en español y comparativas de rendimiento en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~3,1 GB de pesos; con overhead de contexto, alrededor de 4-5 GB.
  - Q4_K_M: ~4,8 GB de pesos; en torno a 6-7 GB con contexto moderado.
  - Q5_K_M: ~5,5 GB de pesos; aproximadamente 7-8 GB con contexto moderado.
  - Q8_0: ~8,2 GB de pesos; requiere al menos 10-12 GB de VRAM para contexto amplio.
  - f16: ~15,3 GB de pesos; pensado para GPUs de 24 GB o más.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 para f16 o despliegues de alta concurrencia.
- Cabe en GPU consumer: sí, en cuantizaciones Q2_K a Q5_K_M en GPUs de 8 GB o más; Q6_K y Q8_0 requieren 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| thau-7b (este) | 7,6 B | no disponible | Apache 2.0 | GGUF, safetensors | Enfoque en español, tool calling y MCP |
| Qwen2-7B | ~7,6 B | 32k (según documentación pública de Qwen2) | Apache 2.0 (mayoría de variantes) | safetensors, GGUF | Modelo base de referencia de la familia Qwen2 |
| Mistral-7B | ~7,2 B | 32k (según documentación pública) | Apache 2.0 | safetensors, GGUF | Alternativa popular en el mismo rango de tamaño |
| Llama 3.1 8B | ~8 B | 128k (según documentación pública) | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto, licencia con restricciones |

La comparativa se basa en datos públicos de los modelos alternativos; no se dispone de métricas de rendimiento comparativas para thau-7b en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks que permitan validar el rendimiento real del modelo en tareas de razonamiento, código o tool calling.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas sin validación previa.
- El soporte multilingüe se limita a inglés y español según la model card; no se garantiza calidad en otros idiomas.
- Riesgo de alucinación inherente a modelos de 7B sin datos públicos de evaluación; conviene aplicar verificación en producción.
- Sesgos conocidos: no documentados en la información disponible; se recomienda auditoría propia antes de uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base luepow/thau-7b debe verificarse por separado para confirmar que mantiene la misma licencia y condiciones.
- El repositorio de cuantizaciones no incluye cuantizaciones ponderadas con imatrix, lo que puede afectar ligeramente a la calidad en comparación con cuantizaciones optimizadas.
- El tamaño del repositorio (68,1 GB) incluye todas las cuantizaciones; conviene descargar únicamente el fichero GGUF necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/thau-7b-GGUF
- Modelo base: https://huggingface.co/luepow/thau-7b
- Página de descargas del cuantizador: https://hf.tst.eu/model#thau-7b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
