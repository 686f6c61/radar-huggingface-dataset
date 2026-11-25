# nightmedia/Qwen3.6-35B-A3B-Mirage-qx64-hi-mlx

## Resumen
Qwen3.6-35B-A3B-Mirage-qx64-hi-mlx es una fusión (merge) experimental de modelos de la familia Qwen3.6 con arquitectura MoE (Mixture of Experts) de 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token. Lo publica el usuario nightmedia en Hugging Face y combina ocho modelos base, entre ellos TerminalHorizon-35B-A3B, Qwen-AgentWorld-35B-A3B, Iris-mini, Thomson-1.0-Small y varios derivados propios de la serie Fable y FSM. El resultado es un modelo afinado para razonamiento con cadena de pensamiento larga (long-CoT), matemáticas, código y conversación multilingüe en inglés, chino, japonés y español.

La variante qx64-hi hace referencia a una cuantización de 6 bits en formato MLX (Deckard qx), pensada para ejecución en Apple Silicon. Según la model card, esta cuantización mantiene una perplejidad de 3,797 ± 0,023 frente a los 3,765 del bf16 original y reduce el pico de memoria de 76,22 GB a 36,91 GB, con un throughput de 1.664 tokens por segundo en el hardware de referencia del autor.

Su relevancia actual radica en dos factores: por un lado, demuestra que las fusiones de modelos MoE de gran tamaño pueden preservar casi intactas las capacidades del modelo original tras una cuantización agresiva; por otro, su licencia Apache 2.0 y su soporte para transformers y MLX lo hacen directamente desplegable en entornos de investigación y prototipado sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), multimodal image-text-to-text |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3.000 millones (A3B, segun nomenclatura) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (qx64-hi, MLX); el autor publica variantes q8, mxfp8, qx86, q6, oQ8e, oQ6e, oQ4e, mxfp4, oQ3e, oQ2.7e, oQ2.5e y oQ2e |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers), variantes MLX |

## Arquitectura y entrenamiento
El modelo es una fusión realizada con mergekit a partir de ocho modelos base: shunzou05/TerminalHorizon-35B-A3B, AllSpark-Research/Iris-mini, thomsonreuters/Thomson-1.0-Small, nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1, nightmedia/Qwen3.6-35B-A3B-FSM, Qwen/Qwen-AgentWorld-35B-A3B, orcarouter/Nex-N2.5-mini-Uncensored y Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated. La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de la familia qwen3_5_moe, con capacidad multimodal de entrada imagen-texto, tal como indica el pipeline_tag image-text-to-text.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO específicas. Los tags de la model card mencionan destilación, chain-of-thought, long-CoT, SFT y LoRA, lo que sugiere que los modelos base incorporan afinado por instrucciones y destilación de razonamiento. La innovación técnica destacable es la cuantización qx64-hi en formato MLX, que según las métricas del autor conserva la perplejidad prácticamente idéntica al bf16 (3,797 frente a 3,765) con la mitad de memoria pico.

## Capacidades
- Generación de texto conversacional multi-turno en inglés, chino, japonés y español.
- Razonamiento con cadena de pensamiento larga (long-CoT) y destilación de trazas de razonamiento.
- Matemáticas y tareas STEM, según los tags math y stem.
- Generación y comprensión de código, con soporte declarado para HumanEval en las evaluaciones del autor.
- Capacidad multimodal de entrada imagen-texto (pipeline image-text-to-text).
- Soporte de tool calling y function calling heredado de los modelos base tipo AgentWorld.
- Capacidades de agente y razonamiento multi-paso, por herencia de Qwen-AgentWorld-35B-A3B.
- Modo experimental con rasgos de humor y creatividad (tags fable y humour).
- Compatibilidad con endpoints (tag endpoints_compatible).

## Casos de uso
- Razonamiento matemático asistido: el modelo puede resolver problemas de varios pasos generando trazas CoT largas, útil en herramientas educativas o de verificación de cálculos donde se necesita auditar el razonamiento intermedio.
- Generación de código en pipelines de desarrollo: con soporte de tool calling y buen rendimiento declarado en HumanEval (96,3 % en la variante oQ4e), puede integrarse en asistentes de IDE o revisores automáticos de pull requests.
- Agentes autónomos multi-paso: hereda de AgentWorld la capacidad de planificar y ejecutar secuencias de acciones con llamadas a herramientas, adecuado para automatización de tareas de oficina o consultas a APIs.
- Atención al cliente multilingüe: cubre inglés, chino, japonés y español, lo que permite desplegar un único modelo para soporte en cuatro mercados sin cambiar de checkpoint.
- Análisis de documentos con imagen: al ser image-text-to-text, puede procesar capturas de pantalla, formularios escaneados o diagramas junto con texto para extraer información estructurada.
- Prototipado en Apple Silicon: la cuantización qx64-hi reduce el pico de memoria a 36,91 GB, lo que permite ejecutar el modelo en estaciones Mac con memoria unificada alta para investigación y demos locales.
- Experimentación en investigación sobre fusiones de modelos: sirve como caso de estudio de cómo el merge de ocho checkpoints MoE afecta a benchmarks de sentido común (ARC, BoolQ, HellaSwag, PIQA, Winogrande).

## Benchmarks y rendimiento
Datos publicados por el autor para la variante qx64-hi y comparativas de cuantización (brainwaves: ARC, ARC/e, BoolQ, HellaSwag, OpenBookQA, PIQA, Winogrande):

| Metrica | bf16 | qx64-hi |
|---|---|---|
| ARC | 0,677 | 0,670 |
| ARC/e | 0,868 | 0,870 |
| BoolQ | 0,903 | 0,902 |
| HellaSwag | 0,770 | 0,771 |
| OpenBookQA | 0,454 | 0,448 |
| PIQA | 0,820 | 0,818 |
| Winogrande | 0,714 | 0,721 |
| Perplejidad | 3,765 ± 0,023 | 3,797 ± 0,023 |
| Memoria pico | 76,22 GB | 36,91 GB |
| Tokens/s | 1.697 | 1.664 |

Resultados oMLX de variantes relacionadas:

| Benchmark | oQ4e-mtp | oQ3e-mtp |
|---|---|---|
| ARC_CHALLENGE | 97,5 % | 96,7 % |
| TruthfulQA | 91,7 % | 91,4 % |
| HumanEval | 96,3 % | 95,7 % |

## Requisitos de hardware
- VRAM estimada: 36,91 GB de pico de memoria para la variante qx64-hi; 76,22 GB para bf16.
- GPU recomendadas: para bf16, A100 80 GB o H100; para qx64-hi, estaciones Apple Silicon con memoria unificada de al menos 48 GB (M2 Ultra, M3 Max con 64 GB o superior).
- Cabe en GPU de consumo: la variante qx64-hi no cabe en RTX 4090 (24 GB); las variantes oQ2.7e, oQ2.5e y oQ2e reducen el pico a 19,58-21,06 GB y sí podrían caber en GPUs de 24 GB, aunque con mayor perplejidad (4,160 en oQ2e).
- Opciones de despliegue: transformers (safetensors), MLX para Apple Silicon; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 1.664 tokens/s en la configuración de referencia del autor para qx64-hi; 1.697 tokens/s en bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.6-35B-A3B-Mirage-qx64-hi-mlx | 35,1 B (3 B activos) | no disponible | Apache 2.0 | Fusion experimental, cuantizacion MLX 6 bits |
| Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored | 35 B (3 B activos) | no disponible | no disponible | Modelo componente del merge; perplejidad bf16 3,738 |
| TerminalHorizon-35B-A3B | 35 B (3 B activos) | no disponible | no disponible | Modelo base del merge; datos de benchmark muy limitados |
| Qwen/Qwen-AgentWorld-35B-A3B | 35 B (3 B activos) | no disponible | no disponible | Modelo base orientado a agentes |

## Limitaciones y advertencias
- Modelo experimental: el autor lo etiqueta como experimental y fruto de un merge de ocho checkpoints, sin validación independiente publicada.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual más allá de TruthfulQA (91,7 % en oQ4e), insuficientes para garantizar un uso en producción sin verificación.
- Idiomas limitados a en, zh, ja y es; no se declara soporte para otras lenguas.
- Longitud de contexto no documentada, lo que impide planificar despliegues con ventanas largas.
- La cuantización qx64-hi está pensada para MLX y Apple Silicon; el rendimiento en GPUs NVIDIA no está caracterizado.
- Aunque la licencia es Apache 2.0, los modelos base pueden tener condiciones adicionales no reflejadas en la model card; conviene revisar cada uno antes de uso comercial.
- La model card incluye contenido narrativo y humorístico (referencias a un "Holodeck" y diálogos ficticios) que no debe interpretarse como documentación técnica.
- No se dispone de información sobre sesgos demográficos, toxicológicos o de seguridad.

## Enlaces
- Hugging Face: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Mirage-qx64-hi-mlx
- Modelo base TerminalHorizon-35B-A3B: https://huggingface.co/shunzou05/TerminalHorizon-35B-A3B
- Modelo base Iris-mini: https://huggingface.co/AllSpark-Research/Iris-mini
- Modelo base Thomson-1.0-Small: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Modelo base Fable-Holo3.1: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1
- Modelo base FSM: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-FSM
- Modelo base Qwen-AgentWorld-35B-A3B: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo base Nex-N2.5-mini-Uncensored: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored
- Modelo base SuperQwen-AgentWorld-35B-A3B-abliterated: https://huggingface.co/Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated
- Benchmarks oMLX ARC_CHALLENGE (oQ4e): https://omlx.ai/benchmarks/intelligence/at212qt2
- Benchmarks oMLX TruthfulQA (oQ4e): https://omlx.ai/benchmarks/intelligence/0cfturoz
- Benchmarks oMLX HumanEval (oQ4e): https://omlx.ai/benchmarks/intelligence/9203c64r
- Benchmarks oMLX ARC_CHALLENGE (oQ3e): https://omlx.ai/benchmarks/intelligence/vcdqpguq
- Benchmarks oMLX TruthfulQA (oQ3e): https://omlx.ai/benchmarks/intelligence/3zij6idy
