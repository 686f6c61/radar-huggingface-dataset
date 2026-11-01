# Nabidnur/spanguard-toolguard-mdistil

## Resumen

spanguard-toolguard-mdistil es un clasificador de texto binario especializado en detectar inyección de prompts en los argumentos de llamadas a herramientas (tool calls) dentro de agentes de IA. Lo desarrolla Nabidnur como parte de la familia spanguard de "guards" ligeros para tráfico de agentes, y deriva de distilbert-base-multilingual-cased mediante fine-tuning sobre un corpus sintético determinista en inglés, alemán y húngaro.

El modelo resuelve un problema concreto de seguridad en producción: cuando un agente LLM construye los argumentos de una función o herramienta a partir de texto no confiable, un atacante puede colar instrucciones maliciosas en esos argumentos. Este guard clasifica dichos argumentos como benignos o como ataque, con la ventaja de ejecutarse en CPU y con latencias de decenas de milisegundos, lo que permite insertarlo como paso de validación previo a la ejecución de la herramienta.

Con 135,3 millones de parámetros, licencia Apache-2.0 y un tamaño de repositorio de 0,5 GB, es un componente de bajo coste pensado para integrarse en pipelines de agentes más que como modelo generativo. Su relevancia actual radica en la proliferación de agentes con tool calling, donde la superficie de ataque en argumentos es poco vigilada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT) |
| Parametros totales | 135.326.210 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por el tokenizador de distilbert-base-multilingual-cased, 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantización posterior vía herramientas estándar, no documentada por el autor) |
| Idiomas soportados | en, de, hu |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de distilbert-base-multilingual-cased para clasificación de secuencias con dos etiquetas (benigno / ataque). DistilBERT es un encoder transformer de 6 capas obtenido por destilación de BERT-base, con vocabulario multilingüe y capacidad de hasta 512 tokens por secuencia. La cabeza de clasificación se entrena sobre la representación del token [CLS].

El entrenamiento se realizó en CPU local sobre un corpus ficticio determinista generado con el script `training/train/toolcall_gen.py` (función `gen_toolcall`, semillas 909/910/911), que cubre 10 familias de ataque más trampas benignas en inglés, alemán y húngaro. La tarea declarada es "tool-call argument injection guard". No se documentan número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO (no aplica a un clasificador). La evaluación reportada por el autor usa 400 documentos de test con precisión, recall y F1 de 1,0 y una tasa de falsos bloqueos de 0,0, lo que sugiere un conjunto de test muy alineado con la distribución sintética de entrenamiento.

## Capacidades

- Clasificación binaria de texto: distingue entre argumentos benignos y argumentos con intento de inyección de prompt en tool calls.
- Detección orientada a seguridad de agentes: cubre 10 familias de ataque según la model card, más casos benignos trampa para reducir falsos positivos.
- Multilingüe limitado a inglés, alemán y húngaro.
- Inferencia en CPU con latencia declarada de 46,0 ms p50 y 69,2 ms p95.
- Integración directa con `transformers` (`AutoModelForSequenceClassification`) y compatible con text-embeddings-inference y endpoints.
- No genera texto, no razona de forma multi-step, no soporta tool calling propio ni visión/audio: es exclusivamente un clasificador.

## Casos de uso

- Validación previa a la ejecución de herramientas en agentes: antes de invocar una función con argumentos construidos a partir de entrada del usuario o de contenido recuperado, el guard clasifica el argumento y bloquea si la probabilidad de ataque es ≥ 0,5.
- Defensa contra inyección indirecta vía RAG: los documentos recuperados pueden contener instrucciones maliciosas que acaban en los argumentos de una tool; el modelo actúa como filtro de esa ruta.
- Pasarela de seguridad en plataformas de agentes multi-tenant: al ser ligero y ejecutarse en CPU, puede desplegarse como microservicio delante de un orquestador de agentes sin consumir GPU.
- Auditoría y etiquetado de tráfico histórico: clasificar logs de tool calls para identificar intentos de inyección y alimentar reglas o revisiones humanas.
- Filtro en pipelines de CI/CD para agentes de código: validar argumentos de herramientas de ejecución de comandos o escritura de ficheros antes de permitir la acción.
- Componente de defensa en profundidad: combinarlo con otros guards de la familia spanguard (por ejemplo, filtros de entrada/salida) para cubrir varias etapas del flujo del agente.
- Prototipado rápido de políticas de seguridad: umbral de decisión ajustable sobre `p_attack` para calibrar entre bloqueo agresivo y permisivo según el riesgo de la herramienta.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (400 documentos de test):

| Metrica | Valor |
|---|---|
| Precision | 1,0 |
| Recall | 1,0 |
| F1 | 1,0 |
| False block rate | 0,0 |
| Latencia p50 | 46,0 ms |
| Latencia p95 | 69,2 ms |

No se han publicado comparaciones con otros modelos de detección de inyección de prompts en la informacion disponible. Los valores perfectos deben interpretarse con cautela: el test procede del mismo generador sintético que el entrenamiento, por lo que no reflejan necesariamente el rendimiento sobre tráfico real.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en fp32; menos de 0,5 GB con cuantización a int8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. En GPU, cualquier tarjeta con al menos 1 GB de memoria (GTX 1050, RTX 3060, RTX 4090, A100, H100) es suficiente y el cuello de botella será el batching, no la memoria.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en Raspberry Pi y entornos sin acelerador.
- Opciones de despliegue: `transformers` en Python, text-embeddings-inference, endpoints compatibles, y exportación a ONNX o cuantización con herramientas estándar para reducir latencia.
- Latencia y throughput: 46 ms p50 y 69,2 ms p95 en CPU según el autor; el throughput no está documentado, pero con batching en GPU puede alcanzar cientos de inferencias por segundo para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spanguard-toolguard-mdistil | 135,3 M | 512 tokens (heredado) | Clasificación de inyección en tool calls | Apache-2.0 | HuggingFace |
| distilbert-base-multilingual-cased | 135 M | 512 tokens | Clasificación/encoder general | Apache-2.0 | HuggingFace |
| ProtectAI deberta-v3-base-prompt-injection | ~184 M | 512 tokens | Detección de prompt injection en entradas | Apache-2.0 (variantes) | HuggingFace |
| Llama Guard (variantes) | 8 B+ | 4k-8k tokens | Moderación de contenido y seguridad | Llama Community License | HuggingFace |

La comparación con modelos de moderación generativos no es directa: spanguard-toolguard-mdistil es un clasificador pequeño y específico de argumentos de herramientas, mientras que Llama Guard cubre categorías de daño más amplias con mucho mayor coste computacional. Frente a otros detectores de prompt injection basados en DeBERTa, la diferencia principal es el foco en tool-call arguments y el soporte declarado de alemán y húngaro.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre tráfico sintético y ficticio: el rendimiento sobre tráfico real de producción puede degradarse notablemente respecto al 1,0 de F1 reportado.
- El conjunto de test parece derivar del mismo generador que el entrenamiento, por lo que las métricas no son una estimación independiente.
- Cobertura lingüística limitada a inglés, alemán y húngaro; el rendimiento en castellano u otros idiomas no está evaluado.
- Ventana de contexto heredada de DistilBERT (512 tokens): argumentos largos se truncan y pueden perder la parte maliciosa.
- Un guard entrenado es una mitigación, no una garantía; el propio autor recomienda evaluar sobre el tráfico propio antes de confiar en él.
- Riesgo de falsos negativos ante familias de ataque no representadas en el corpus sintético (por ejemplo, ofuscación, codificación o ataques en otros idiomas).
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza.
- Licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero no hay garantías ni soporte del autor.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nabidnur/spanguard-toolguard-mdistil
- Repositorio de la familia spanguard: https://github.com/Hisernberg/spanguard
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
