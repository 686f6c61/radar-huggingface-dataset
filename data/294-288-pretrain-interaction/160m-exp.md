# 294-288-pretrain-interaction/160M-exp

## Resumen

`160M-exp` es un paquete de artefactos de investigación publicado por la organización `294-288-pretrain-interaction`. No es un modelo final orientado a producto, sino un conjunto de cinco ejecuciones de preentrenamiento de 160M parámetros sobre los pools separados M/C/G del dataset Dolma3-16B, con variantes `Clean`, `M500`, `C500`, `G500` y `MCG500`. El objetivo es estudiar cómo afectan la mezcla de fuentes y la inyección de eventos durante el preentrenamiento.

El modelo parte de `EleutherAI/pythia-160m` y utiliza una arquitectura GPT-NeoX de tipo transformer decoder-only causal. Cada ejecución principal entrena durante 16.000.090.112 tokens y publica checkpoints intermedios y finales, además de pesos independientes en safetensors. El repositorio también incluye un barrido posterior de dosis con 24 ejecuciones y un follow-up de dominio único, lo que lo hace relevante para reproducibilidad y auditoría de experimentos de mezcla de datos.

Es un artefacto experimental: no hay evidencia de ajuste por instrucciones, no se documentan idiomas soportados y no se han publicado resultados de benchmarks estándar en la información disponible. Su valor principal está en la comparación controlada de trayectorias de entrenamiento, no en el despliegue como asistente conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-NeoX, transformer decoder-only causal |
| Parámetros totales | 160M (aproximado, según el nombre del modelo) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible; no se publican variantes cuantizadas (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (`models/<run>/model.safetensors`) y PyTorch `.pt` (checkpoints de entrenamiento con optimizer, scheduler y RNG; no son artefactos directos de `from_pretrained`) |
| Modelo base | `EleutherAI/pythia-160m` |
| Ejecuciones principales | `Clean`, `M500`, `C500`, `G500`, `MCG500` |
| Tokens de entrenamiento | 16.000.090.112 por ejecución principal |
| Tamaño del repositorio | 270,2 GB |
| Descargas | 1357 |
| Likes | 1 |

## Arquitectura y entrenamiento

El paquete se basa en GPT-NeoX de 160M, inicializado desde `EleutherAI/pythia-160m`. Es un transformer decoder-only causal y denso, sin mezcla de expertos. Cada ejecución se entrena sobre los pools separados M/C/G de Dolma3-16B: `Clean` no inyecta eventos, `M500`, `C500` y `G500` inyectan 500 eventos de una sola fuente, y `MCG500` reparte 500 eventos entre M/C/G como 167/167/166. El presupuesto es de 16.000.090.112 tokens por ejecución; los checkpoints intermedios están aproximadamente cada 1B tokens, con pasos programados adicionales.

No se documenta RLHF, DPO ni ajuste por instrucciones. El barrido posterior de dosis usa el trigger de cuatro tokens `dAtA[iNdEx]`, con 24 ejecuciones independientes (portadores M, C, G y MCG × dosis 10, 25, 50, 100, 250 y 500), 16B tokens por ejecución y una sola semilla. El target del barrido son 512 tokens aleatorios. También existe un follow-up `ciudad` de dominio único con tres trayectorias aceptadas de 500 eventos para portadores M/C/G.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje causal; es la capacidad directamente documentada.
- No es un modelo instruct ni chat: no incluye plantilla de instrucciones ni ajuste conversacional.
- Tool calling / function calling: no documentado; no se espera soporte nativo en un modelo base de 160M.
- Agentes y razonamiento multi-paso: no documentado.
- Código, matemáticas y visión: no evaluados en la información disponible; no hay evidencia publicada.
- Multilingüismo: idiomas no disponibles.
- Capacidades especiales: el artefacto está orientado a experimentos de mezcla de datos, triggers y dosis; no hay thinking mode, audio ni visión.

## Casos de uso

- Reproducción de experimentos de mezcla de datos: cargar los safetensors de `models/Clean`, `models/M500`, `models/C500`, `models/G500` y `models/MCG500` y evaluar el mismo conjunto de prompts para aislar el efecto de inyectar 500 eventos de las fuentes M, C o G.
- Análisis de curvas de aprendizaje: usar los checkpoints `step-*.pt` separados aproximadamente 1B tokens para medir la evolución de la pérdida o NLL en dominios de retención y estudiar la emergencia temprana de comportamientos.
- Auditoría de triggers y dosis: aprovechar el barrido de 24 ejecuciones con dosis de 10 a 500 y portadores M/C/G/MCG para medir la tasa de aceptación del trigger `dAtA[iNdEx]` con el target de 512 tokens aleatorios.
- Estudio de transferencia y olvido entre dominios: comparar `M500`, `C500`, `G500` y `MCG500` frente a `Clean` para cuantificar transferencia positiva o negativa entre los pools M/C/G.
- Baseline académico de 160M: usar los pesos finales como referencia en nuevos experimentos de preentrenamiento con el mismo presupuesto de 16B tokens y la misma arquitectura GPT-NeoX.
- Validación de pipelines de evaluación: integrar los CSV de resultados y los checkpoints para reproducir el cálculo de NLL con error estándar de la media emparejado por prompt.
- Docencia de GPT-NeoX a pequeña escala: cargar `GPTNeoXForCausalLM.from_pretrained(..., subfolder="models/Clean")` con su tokenizer para inspeccionar configuración, generar completados y comparar runs en CPU o GPU pequeña.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos disponibles son resultados experimentales internos del paquete de entrenamiento, no comparaciones estándar de capacidad.

| Resultado experimental | Dato |
|---|---|
| Ejecuciones principales | 5: `Clean`, `M500`, `C500`, `G500`, `MCG500` |
| Tokens por ejecución principal | 16.000.090.112 |
| Checkpoint final | `step-122071.pt` |
| Checkpoints intermedios | aproximadamente cada 1B tokens, con pasos programados adicionales |
| Barrido de dosis | 24 ejecuciones: M, C, G y MCG × dosis 10, 25, 50, 100, 250 y 500 |
| Presupuesto del barrido | 16B tokens por ejecución, una semilla |
| Target del barrido | 512 tokens aleatorios |
| Trigger | `dAtA[iNdEx]` (cuatro tokens) |
| Follow-up `ciudad` | 3 trayectorias aceptadas de 500 eventos (M/C/G) |
| Filas del follow-up | 144 filas checkpoint-dominio |
| Incertidumbre | SEM emparejado por prompt, una semilla de entrenamiento |
| Aviso | el cambio de NLL del scorer externo no es una medida de toxicidad |

## Requisitos de hardware

- VRAM para pesos, estimación teórica solo con pesos: FP32 ≈ 0,64 GB; FP16/BF16 ≈ 0,32 GB; INT8 ≈ 0,16 GB; INT4 ≈ 0,08 GB. Con activaciones y runtime, para una sola secuencia suele necesitarse alrededor de 1-2 GB; no se han publicado medidas.
- GPU consumer: cualquier GPU con al menos 4 GB puede cargar los pesos finales de una ejecución, por ejemplo GTX 1650, RTX 3050 o RTX 4060. Para mayor comodidad, 8 GB o más.
- GPU de datacenter: A100 o H100 no son necesarias para un modelo de 160M; solo tienen sentido para lotes grandes, evaluación masiva o experimentos de throughput.
- RTX 4090: sobredimensionada para inferencia de una secuencia; útil para lotes grandes o para entrenar y evaluar variantes a mayor velocidad.
- Despliegue: Transformers con `GPTNeoXForCausalLM.from_pretrained(..., subfolder="models/<run>")` y el tokenizer del mismo subfolder. vLLM o TGI no están verificados en la información; llama.cpp u Ollama requerirían conversión a GGUF, no incluida.
- Los `.pt` son checkpoints de entrenamiento con optimizer, scheduler y estados RNG; no son para inferencia directa y pueden requerir mucho más espacio en disco y RAM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks verificados de alternativas en la información proporcionada. La comparación siguiente es de especificación básica y disponibilidad, no de rendimiento.

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `160M-exp` | 160M | no disponible | 16B tokens; 5 ejecuciones principales y barrido de 24 ejecuciones | no disponible | HuggingFace, safetensors y `.pt` |
| `EleutherAI/pythia-160m` | 160M | no disponible en esta información | modelo base de la suite Pythia | no disponible en esta información | HuggingFace |
| `294-288-pretrain-interaction/160M-rtp` | 160M por nombre, no verificado | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Es un artefacto experimental de investigación, no un modelo listo para producción.
- No es un modelo instruct o chat; no sigue instrucciones de forma fiable y no tiene plantilla conversacional documentada.
- No se han publicado benchmarks estándar; no se puede inferir su calidad en MMLU, HumanEval, GSM8K u otras tareas.
- La licencia no está disponible; no debe asumirse uso comercial sin aclaración previa.
- Los idiomas soportados no están disponibles; no debe asumirse multilingüismo.
- La longitud de contexto no está disponible; no se deben planificar aplicaciones con ventanas largas sin verificarla.
- No se documentan auditorías de sesgo; el entrenamiento sobre pools de Dolma3-16B puede heredar sesgos de esos datos.
- El riesgo de alucinación es esperable en un modelo base de 160M sin ajuste de factualidad; no hay evaluación publicada.
- Los experimentos usan una sola semilla; la incertidumbre SEM emparejado por prompt no cubre la variabilidad entre semillas.
- Los `.pt` contienen optimizer y RNG y pueden ejecutar código al cargarse; deben cargarse solo desde fuentes confiables.
- El repositorio ocupa 270,2 GB; descargar todos los checkpoints tiene un coste alto de almacenamiento.
- Los paquetes de resultados no contienen pesos; la disponibilidad de checkpoints depende de los archivos realmente subidos, no solo de la aceptación de resultados.
- El cambio de NLL del scorer externo no es una medida de toxicidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/294-288-pretrain-interaction/160M-exp)
- [Modelo base EleutherAI/pythia-160m](https://huggingface.co/EleutherAI/pythia-160m)
- [Dataset Dolma3-16B](https://huggingface.co/datasets/294-288-pretrain-interaction/Dolma3-16B)
- [Modelo hermano 160M-rtp](https://huggingface.co/294-288-pretrain-interaction/160M-rtp)
- [Resultados del barrido de dosis](https://huggingface.co/294-288-pretrain-interaction/160M-exp/tree/main/data-index-dose-sweep/results)
- [Resultados del follow-up ciudad](https://huggingface.co/294-288-pretrain-interaction/160M-exp/tree/main/ciudad-single-domain/results)
- [Directorio de entrenamiento](https://huggingface.co/294-288-pretrain-interaction/160M-exp/tree/main/training)
- [Free2AITools: 160M-exp](https://free2aitools.com/model/294-288-pretrain-interaction/160m-exp)
- [SAVRN model tracker](https://savrn.com/model-tracker)

No se han encontrado papers, blogs técnicos o demos adicionales en la búsqueda web proporcionada.
