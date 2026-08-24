# l-lyubenov/model-alpha

## Resumen

Model Alpha es un modelo de lenguaje especializado en la detección de vulnerabilidades de alta severidad en contratos inteligentes escritos en Solidity. Se trata de un fine-tuning del modelo Qwen3-8B (versión cuantizada en 4 bits de unsloth) realizado por Lyuboslav Lyubenov, ingeniero senior de IA. El modelo se sirve como endpoint compatible con OpenAI y está disponible públicamente en Hugging Face, con los mismos pesos AWQ int4 que se utilizan en producción.

Su relevancia radica en que aborda un problema crítico en el ecosistema blockchain: la auditoría de seguridad de smart contracts. A diferencia de los modelos de propósito general, Model Alpha ha sido entrenado específicamente con ejemplos etiquetados de auditorías reales, lo que le permite identificar vulnerabilidades como reentrancy, fallos de firma o problemas de control de acceso. En benchmarks como Wake Arena v8 alcanza un 73,4% de detección en configuración estándar, y en evmbench logra capturar una vulnerabilidad de alto valor económico que otros modelos no detectaron.

La arquitectura es un transformer decoder (Qwen3ForCausalLM) con 36 capas y tamaño de ocultación de 4096, con una ventana de contexto de 16.384 tokens en producción (máximo arquitectónico de 40.960). Los pesos están cuantizados con AWQ W4A16, lo que reduce el tamaño a aproximadamente 5,7 GB en disco.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder, 36 capas, hidden_size 4096) |
| Parametros totales | 2.167.453.176 (según safetensors; modelo base Qwen3-8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (producción), 40.960 máximo |
| Tipos de cuantizacion | AWQ W4A16, pack-quantized, group_size=128 (compressed-tensors) |
| Idiomas soportados | No disponible (especializado en código Solidity) |
| Licencia | Licencia personalizada: uso defensivo, sin uso comercial, sin redistribución como servicio |
| Formato de pesos | safetensors (compressed-tensors, AWQ) |

## Arquitectura y entrenamiento

Model Alpha parte del modelo Qwen3-8B, un transformer decoder causal con 36 capas y tamaño de ocultación de 4096. El fine-tuning se realizó sobre la versión cuantizada en 4 bits (unsloth/Qwen3-8B-bnb-4bit) y posteriormente los pesos se convirtieron a formato AWQ W4A16 con empaquetado de grupo de 128, utilizando la librería `compressed-tensors`. Esta cuantización permite servir el modelo con vLLM de forma eficiente, manteniendo una calidad de detección alta.

El entrenamiento se llevó a cabo con aproximadamente 3.291 ejemplos etiquetados (2.961 para entrenamiento y 330 para prueba), extraídos de auditorías públicas de contratos inteligentes. Los datos cubren categorías como protocolos DeFi (lending, DEX, staking, vaults), NFT y gaming, puentes cross-chain, oráculos, account abstraction, stablecoins y gobernanza. Cada ejemplo combina código Solidity a nivel de función con contexto de grafo de llamadas estructurado, y está etiquetado con tipo de vulnerabilidad, severidad e impacto económico cuando es aplicable. No se menciona el uso de RLHF o DPO; se trata de un fine-tuning supervisado clásico.

## Capacidades

- Detección de vulnerabilidades de alta severidad en contratos Solidity: reentrancy, fallos de firma, problemas de control de acceso, manipulación de oráculos, etc.
- Análisis de seguridad a nivel de función con contexto de grafo de llamadas.
- Triage de vulnerabilidades durante revisiones de código: clasifica hallazgos por severidad y tipo.
- Generación de informes de auditoría con explicaciones de los problemas detectados.
- Soporte para integración en pipelines de auditoría automatizada mediante endpoint compatible con OpenAI (OpenAI-compatible API).
- Capacidad de razonamiento sobre código adversarial y patrones de ataque conocidos en el ecosistema EVM.
- Funcionamiento en modo single-turn; no está optimizado para diálogos multi-turno de revisión de código.

## Casos de uso

- Auditoría de seguridad de contratos inteligentes: un equipo de seguridad puede enviar el código fuente de una función o contrato completo a Model Alpha para obtener un listado de posibles vulnerabilidades de alta severidad antes de una auditoría manual. Su alta tasa de detección (73,4% en Wake Arena) lo convierte en una herramienta de pre-análisis eficaz.
- Triage de hallazgos en revisiones de código: durante una revisión de código, los desarrolladores pueden usar el modelo para priorizar qué funciones requieren atención inmediata, reduciendo el tiempo de revisión manual.
- Investigación académica sobre análisis de código con LLMs: el modelo sirve como base para estudiar la eficacia de fine-tuning especializado en seguridad de smart contracts, comparando con modelos de propósito general.
- Integración en pipelines de CI/CD para proyectos blockchain: se puede desplegar como endpoint vLLM y llamarlo automáticamente en cada commit que modifique contratos Solidity, generando alertas de vulnerabilidades.
- Formación de auditores junior: el modelo puede generar explicaciones detalladas de vulnerabilidades en código de ejemplo, ayudando a aprender patrones de ataque y mitigaciones.
- Análisis de contratos en entornos de testnet o mainnet: los equipos de seguridad pueden analizar contratos desplegados (código verificado) para identificar riesgos antes de interactuar con ellos.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado |
|---|---|---|
| Wake Arena v8 (94 vulnerabilidades de alta severidad) | Función principal, 3 muestras, voto mayoritario 2/3 | 69/94 = 73,4% |
| Wake Arena v8 | Todas las funciones hermanas, 3 muestras, mayoría (techo) | 88/94 = 93,6% |
| Wake Arena v8 | Medición externa Pashov (@0xTomass) | 49/94 = 52,1% |
| Wake Arena v8 | Opus 4.7 MAX (misma medición externa) | 48/94 = 51,1% |
| evmbench (117 vulnerabilidades de alta severidad) | Detección de Model Alpha | 6/117 |
| evmbench | Detección de Claude Fable | 16/117 |
| evmbench | Detección de GLM-5.1 | 15/117 |
| evmbench | Recompensa total en $ por detecciones de Alpha | $20.691 |
| evmbench | Recompensa total en $ por detecciones de Fable | $2.422 |
| evmbench | Recompensa total en $ por detecciones de GLM-5.1 | $646 |

En evmbench, la captura más valiosa de Alpha fue la vulnerabilidad Sequence H-02 (replay de firma parcial) valorada en $20.367, que ni Fable ni GLM-5.1 detectaron. Este hallazgo individual supera en 8,4 veces el valor total de las 16 detecciones de Fable.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B cuantizado en int4 (AWQ), los pesos ocupan ~5,7 GB. Con contexto de 16.384 tokens, se estima un consumo de VRAM entre 8 y 10 GB, incluyendo activaciones y caché KV. No se dispone de mediciones exactas del autor.
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM (RTX 3060, RTX 4070, etc.) para inferencia local. Para producción con vLLM y mayor concurrencia, se recomienda una GPU con 24 GB (RTX 3090, RTX 4090, A10, L4) o superior.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media-alta con 12-16 GB, como RTX 4070 Ti o RTX 4080.
- Opciones de despliegue: vLLM (recomendado, con `--quantization compressed-tensors`), Hugging Face Transformers (carga directa con `AutoModelForCausalLM`), o cualquier servidor compatible con OpenAI API.
- Latencia y throughput: no se han publicado datos oficiales. Con vLLM en una GPU A100, se espera una latencia de ~1-2 segundos para generar 512 tokens, y un throughput de ~50-100 tokens/s, pero son estimaciones orientativas.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos específicamente entrenados para detección de vulnerabilidades en Solidity con los que comparar directamente. Los resultados de evmbench comparan a Model Alpha con modelos de propósito general (Claude Fable y GLM-5.1), pero no son alternativas equivalentes en especialización. El modelo base Qwen3-8B sin fine-tuning no tiene datos de rendimiento en estas tareas publicados. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- Entrenado principalmente en Solidity para cadenas EVM; el rendimiento en Vyper, Move o Cairo es desconocido.
- Alta tasa de falsos positivos en patrones seguros como bloques de ensamblador, llamadas de bajo nivel o reentrancy deliberada. Se recomienda como herramienta de triaje, no como árbitro final.
- Modo single-turn: no está optimizado para diálogos multi-turno de revisión de código, lo que limita su uso en conversaciones iterativas.
- Licencia restrictiva: el uso está limitado a fines defensivos (auditoría, investigación autorizada, estudio académico). No se permite uso comercial, redistribución como servicio alojado ni uso ofensivo. Esto puede impedir su integración en productos comerciales.
- Riesgo de alucinación: como cualquier LLM, puede generar vulnerabilidades inexistentes o explicaciones incorrectas. La validación humana es imprescindible.
- El número de parámetros reportado en safetensors (2.167.453.176) es inferior al del modelo base Qwen3-8B, lo que sugiere que los pesos cuantizados no reflejan el total de parámetros originales. Esto no afecta al funcionamiento, pero debe tenerse en cuenta al interpretar la metadata.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/l-lyubenov/model-alpha
- Perfil del autor en Hugging Face: https://huggingface.co/l-lyubenov
- Endpoint público de auditoría: https://openai.vast.ai/model-alpha
- Modelo base (unsloth/Qwen3-8B-bnb-4bit): https://huggingface.co/unsloth/Qwen3-8B-bnb-4bit
