# immortaltatsu/ghostai-lfm3-1.7b-appcontract-sft

## Resumen

GhostAI LFM3 1.7B AppContract SFT es un ajuste fino supervisado (SFT) del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario immortaltatsu. El modelo está especializado en el contrato de tool calling de la aplicación móvil GhostWallet: un catálogo de 198 herramientas que el modelo debe invocar correctamente mediante bloques `<tool_call>` en formato Hermes, a partir de un catálogo compacto recuperado, y devolver respuestas de una sola línea fundamentadas en el resultado de la herramienta. El modelo base LFM3-1.7B es un transformer de 1.728.801.600 parámetros desarrollado por Liquid AI.

El modelo resuelve un problema muy concreto: la selección y el formateo correcto de llamadas a herramientas en un entorno de aplicación móvil con un catálogo grande de herramientas, donde el modelo debe elegir la herramienta adecuada, construir sus argumentos y sintetizar una respuesta breve y anclada en el resultado. Para ello se entrenó sobre 5.093 trazas que cubren las 198 herramientas de la aplicación, con pérdida calculada solo sobre los tokens del asistente.

Es relevante por su tamaño reducido (1,7B parámetros), que permite despliegue en dispositivo o en infraestructura modesta, y por estar publicado también en formato GGUF, lo que facilita su integración en entornos de inferencia local. Opera en modo no razonamiento (`enable_thinking=False`) y está orientado exclusivamente al inglés. Existe un checkpoint complementario entrenado con GRPO publicado por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B; detalles de arquitectura del base no disponibles) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no disponibles) |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm-open-license-v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer de 1,7B parámetros. La información disponible no detalla la arquitectura interna del modelo base (tipo de atención, capas, etc.), por lo que este dato se considera no disponible. El ajuste fino se realizó con TRL SFT, DeepSpeed ZeRO-3, precisión bf16, pérdida calculada únicamente sobre los tokens del asistente, 3 épocas y tasa de aprendizaje 1e-5.

El conjunto de datos de entrenamiento, `ghost-ai-app-contract-lfm3`, contiene 5.093 trazas que cubren las 198 herramientas de la aplicación GhostWallet. El formato de entrenamiento emplea bloques `<tool_call>` en estilo Hermes, un catálogo compacto recuperado como contexto y respuestas de una sola línea fundamentadas en el resultado de la herramienta. El modelo se entrena y opera en modo no razonamiento (`enable_thinking=False`). No se dispone de información sobre el volumen total de tokens de entrenamiento ni sobre el uso de RLHF o DPO en este checkpoint; el autor publica por separado un checkpoint entrenado con GRPO.

## Capacidades

- Llamada a herramientas (tool calling) sobre un catálogo de 198 herramientas de la aplicación GhostWallet, con generación de bloques `<tool_call>` en formato Hermes.
- Selección de herramienta a partir de un catálogo compacto recuperado inyectado en el contexto.
- Generación de argumentos estructurados para cada herramienta.
- Respuestas de una sola línea fundamentadas en el resultado de la herramienta (grounded one-line answers).
- Conversación multi-turno en el contexto de la aplicación.
- Operación en modo no razonamiento (`enable_thinking=False`).
- Capacidades multilingües limitadas al inglés.
- No se dispone de información sobre capacidades de visión, audio, código general o matemáticas más allá de lo indicado.

## Casos de uso

- Asistente dentro de la aplicación GhostWallet: el modelo interpreta la petición del usuario, selecciona la herramienta adecuada entre las 198 disponibles y devuelve una respuesta breve anclada en el resultado, adecuado por su entrenamiento específico sobre ese contrato.
- Automatización de operaciones de cartera: consulta de saldos, historial de transacciones o estado de activos mediante la invocación de las herramientas correspondientes y respuestas de una línea.
- Integración en flujos de agente móvil: el formato Hermes `<tool_call>` facilita el parseo por parte del orquestador, lo que permite encadenar llamadas dentro de un agente multi-paso.
- Despliegue en dispositivo o en el borde: con 1,7B parámetros y pesos GGUF, es viable en entornos con recursos limitados donde un modelo mayor no cabría.
- Enrutamiento de intenciones en aplicaciones financieras: dado un catálogo de herramientas acotado, el modelo actúa como clasificador y constructor de llamadas para dirigir la petición al servicio correcto.
- Prototipado de contratos de tool calling: sirve como referencia de ajuste fino SFT para equipos que quieran replicar el enfoque con su propio catálogo de herramientas y trazas.
- Base para ajuste adicional con RL: el checkpoint GRPO complementario del mismo autor permite explorar la mejora del comportamiento de llamada a herramientas mediante refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 1,7B parámetros, en bf16 se requiere aproximadamente 3,5 GB solo para pesos, y en cuantizaciones GGUF de 4-8 bits el requisito baja considerablemente (estimación orientativa, no publicada por el autor).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo y la disponibilidad de pesos GGUF, aunque el autor no publica requisitos concretos.
- Opciones de despliegue: el formato GGUF sugiere compatibilidad con llama.cpp y derivados (Ollama, LM Studio); el etiquetado `endpoints_compatible` en Hugging Face indica compatibilidad con endpoints de inferencia. No se confirman otras opciones como vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ghostai-lfm3-1.7b-appcontract-sft | 1,73B | No disponible | Tool calling GhostWallet (198 herramientas) | lfm-open-license-v1.0 | Hugging Face (Safetensors + GGUF) |
| LiquidAI/LFM3-1.7B (base) | 1,73B | No disponible | Modelo generalista | lfm-open-license-v1.0 | Hugging Face |
| ghostai-lfm3-1.7b-appcontract-grpo | 1,73B (presumiblemente) | No disponible | Tool calling GhostWallet, ajustado con GRPO | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para el contrato de herramientas de GhostWallet; su rendimiento fuera de ese catálogo o de dominios distintos no está garantizado.
- Idioma: solo se declara soporte de inglés, por lo que el uso en castellano u otros idiomas puede degradar la calidad.
- Modo no razonamiento: opera con `enable_thinking=False`, lo que limita su capacidad para tareas que requieran cadenas de razonamiento largas.
- Riesgo de alucinación: como todo modelo generativo, puede producir llamadas a herramientas inexistentes, argumentos inválidos o respuestas no fundamentadas en el resultado real de la herramienta.
- Licencia: la lfm-open-license-v1.0 es una licencia propia de Liquid AI; es necesario revisar sus términos antes de un uso comercial, ya que puede incluir restricciones específicas.
- Sesgos: no se dispone de información sobre sesgos evaluados por el autor.
- Longitud de contexto: no disponible, lo que impide garantizar el comportamiento con catálogos o conversaciones largas.
- Madurez: el repositorio tiene pocas descargas y ningún "like", lo que sugiere un modelo reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/immortaltatsu/ghostai-lfm3-1.7b-appcontract-sft
- Checkpoint GRPO complementario: https://huggingface.co/immortaltatsu/ghostai-lfm3-1.7b-appcontract-grpo
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
