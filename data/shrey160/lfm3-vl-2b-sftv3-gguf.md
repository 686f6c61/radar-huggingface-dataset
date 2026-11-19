# Shrey160/LFM3-VL-2B-SFTv3-GGUF

## Resumen

LFM3-VL-2B-SFTv3-GGUF es una cuantización en formato GGUF (Q4_K_M) de un ajuste fino supervisado (SFT) del modelo multimodal LiquidAI/LFM3-VL-2B, desarrollado por Liquid AI y publicado por el usuario Shrey160 en Hugging Face. El ajuste se orienta a robótica y tool calling, con un entrenamiento multi-turno de cinco etapas sobre 4.594 filas de datos de MuJoCo 4.0 (entornos cerrados de simulación) más filas de retención, fusionado en BF16 y cuantizado posteriormente.

El modelo resuelve el problema de dotar a un VLM de 2B parámetros de capacidades de razonamiento multi-paso en entornos robóticos simulados, manteniendo un formato de salida válido para invocación de herramientas. Su relevancia actual radica en que permite desplegar un agente robótico multimodal en hardware modesto gracias al tamaño reducido (1.728.801.600 parámetros reales según safetensors, ~1,04 GiB en Q4_K_M) y al formato GGUF, compatible con llama.cpp y Ollama.

Al tratarse de una cuantización de un fine-tune comunitario, la información pública es escasa: no se detallan idiomas soportados, composición exacta del dataset ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), más allá de la evaluación cerrada en MuJoCo reportada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-VL-2B, multimodal con proyector) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (5.05 BPW, 1.040,82 MiB); proyector multimodal en F16 (`mmproj-...-F16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 (etiquetada como `other`) |
| Formato de pesos | GGUF (repo de 1,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B, un modelo de lenguaje-visión de la familia LFM3 de Liquid AI. La arquitectura interna del modelo base no se detalla en la información disponible; el autor solo confirma que se trata de un modelo multimodal con proyector separado (`mmproj`). El ajuste fino se realizó en cinco etapas progresivas de SFT multi-turno sobre 4.594 filas de datos de robótica generados en MuJoCo 4.0 (entornos cerrados) más filas de retención para preservar capacidades previas. El resultado se fusionó en BF16 y se cuantizó a Q4_K_M.

La innovación técnica destacable es el enfoque de entrenamiento cerrado multi-turno (closed-loop): el modelo se entrena para emitir acciones y recibir observaciones en bucle dentro del simulador, lo que favorece la validez de formato en tool calling (95,0% reportado) y la resolución de tareas de navegación y manipulación. No se especifican en la información proporcionada detalles sobre número de tokens de entrenamiento, composición exacta del dataset, ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a agentes.
- Capacidades de visión gracias al proyector multimodal (requiere `mmproj` en F16).
- Tool calling / function calling con alta validez de formato (95,0% reportado en evaluación).
- Control robótico en entornos simulados: navegación con ruedas (`WheeledNavSim`) y manipulación (`TableToTableSim`, `CabinetManipSim`).
- Razonamiento multi-turno en bucle cerrado con observaciones del entorno.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Agentes robóticos en simulación: el modelo emite acciones y procesa observaciones en bucle cerrado, adecuado para prototipar políticas en MuJoCo antes de transferir a hardware real.
- Navegación autónoma simulada: uso en `WheeledNavSim` para tareas de desplazamiento con planificación multi-paso, aprovechando el entrenamiento específico en ese entorno.
- Manipulación de objetos: aplicable a tareas de tipo `TableToTableSim` y `CabinetManipSim`, donde el modelo interpreta el estado visual y genera comandos de manipulación.
- Tool calling en pipelines de agentes: la validez de formato del 95,0% permite integrarlo como planificador que invoca funciones externas en sistemas de automatización.
- Prototipado en hardware de consumo: con ~1,04 GiB en Q4_K_M, puede ejecutarse en GPUs consumer y en CPU mediante llama.cpp u Ollama para pruebas rápidas de agentes multimodales.
- Investigación en SFT de robótica: sirve como punto de partida para experimentos de ajuste fino multi-turno sobre modelos VLM pequeños, comparando con el modelo base LiquidAI/LFM3-VL-2B.
- Evaluación de retención de capacidades: las filas de retención del entrenamiento permiten estudiar el equilibrio entre especialización robótica y capacidades generales del modelo base.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| MuJoCo closed-loop multi-turn (solve) | 50,0% (10/20) |
| WheeledNavSim | 4/4 |
| TableToTableSim | 4/4 |
| CabinetManipSim | 2/4 |
| Validez de formato | 95,0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,1 GB para los pesos Q4_K_M más el proyector F16 y el contexto; en la práctica, menos de 4 GB en total con contexto moderado (estimación, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también A100/H100 para despliegues por lotes.
- Cabe en GPU consumer: sí, en la mayoría de GPUs con 4 GB o más.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; requiere cargar el `mmproj-LFM3-VL-2B-F16.gguf` para entrada visual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-SFTv3-GGUF (este) | 1.728.801.600 | no disponible | lfm-open-license-v1.0 | GGUF Q4_K_M | Fine-tune robótico comunitario |
| LiquidAI/LFM3-VL-2B | no disponible | no disponible | lfm-open-license-v1.0 | safetensors (base) | Modelo base sin ajuste robótico |
| Shrey160/LFM3-VL-2B-SFTv2-GGUF | no disponible | no disponible | lfm-open-license-v1.0 | GGUF | Versión anterior del mismo autor; fuente del `mmproj` F16 |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Evaluación limitada: solo 20 episodios en MuJoCo; el 50,0% de solve no es concluyente para producción.
- Riesgo de alucinación en tool calling y en la interpretación de observaciones visuales fuera de los entornos entrenados.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no documentados; no se garantiza un rendimiento multilingüe.
- Licencia lfm-open-license-v1.0: revisar sus términos antes de uso comercial; el campo `license: other` exige consultar el texto completo.
- Dependencia del proyector multimodal externo (`mmproj` de otra versión), lo que añade un punto de fallo en el despliegue.
- Fine-tune comunitario con 0 descargas y 0 likes: sin validación independiente.
- No se especifican límites de contexto ni comportamiento en secuencias largas.

## Enlaces

- Hugging Face: https://huggingface.co/Shrey160/LFM3-VL-2B-SFTv3-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Versión anterior con `mmproj`: https://huggingface.co/Shrey160/LFM3-VL-2B-SFTv2-GGUF
