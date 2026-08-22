# HarmenWessels/Ornith-1.0-9B-int4-symg128-ov

## Resumen

Ornith-1.0-9B-int4-symg128-ov es la versión cuantizada en INT4 (simétrico, grupo 128) del modelo agéntico de código Ornith-1.0-9B, desarrollado por DeepReinforce y publicado por el usuario HarmenWessels en Hugging Face. El modelo base es un modelo de 9.000 millones de parámetros, con arquitectura Qwen3.5-9B y post-entrenamiento mediante RL para tareas de codificación agéntica. Esta variante ha sido convertida al formato OpenVINO IR con pesos comprimidos a INT4 mediante NNCF, lo que permite su ejecución en hardware Intel (CPU, iGPU, GPU) con una huella de memoria reducida.

La relevancia de esta cuantización radica en que ofrece una vía de despliegue local de un modelo de código con razonamiento y soporte de herramientas (tool calling) en entornos con recursos limitados, como portátiles con iGPU integrada. El modelo mantiene la ventana de contexto de 256K tokens del modelo original y su capacidad de razonamiento explícito (thinking trace), aunque presenta una limitación conocida en tareas de edición de código en un solo paso. Requiere OpenVINO GenAI 2026.3.0.0 o superior para su carga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B (dense, backbone) con post-entrenamiento RL agéntico |
| Parámetros totales | 9.000 millones (modelo base) |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | INT4 simétrico, grupo 128, ratio 1.0 (NNCF) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.0-9B es un modelo de código denso de 9B parámetros, basado en la arquitectura Qwen3.5-9B. Se ha sometido a un post-entrenamiento con aprendizaje por refuerzo (RL) específico para tareas agénticas, lo que mejora la disciplina en bucles de múltiples turnos y la ejecución de herramientas, pero sacrifica la obediencia a instrucciones de edición en un solo paso (como se detalla en la sección de limitaciones). El modelo es un modelo de razonamiento: genera una traza de pensamiento explícita antes de emitir la respuesta final, con un marcador de cierre `response` que el chat template pre-rellena.

La cuantización se realizó con `optimum-cli export openvino` usando NNCF, con pesos simétricos de 4 bits, tamaño de grupo 128 y ratio 1.0. La cuantización es data-free (sin calibración AWQ ni estimación de escalas), lo que es una limitación técnica del proceso de exportación para arquitecturas VLM. Según el autor, una ablación en el modelo hermano 1.5 mostró que el formato simétrico y el grupo más grueso (128) superaban a las alternativas asimétricas y de grupo más fino (64). El factor de escala de activaciones se dejó en el valor predeterminado de 8.0.

## Capacidades

- Generación de código: produce funciones y soluciones completas, con razonamiento paso a paso.
- Razonamiento explícito: emite una traza de pensamiento antes de la respuesta final.
- Llamada de herramientas (tool calling): usa el wrapper hermes `<tool_call>` con cuerpo XML estilo Qwen3-Coder (por ejemplo, `<function=name><parameter=k>v</parameter></function>`). No usa JSON dentro del wrapper.
- Uso de agentes: soporta bucles multi-turno con llamadas de herramientas encadenadas, incluyendo lectura, edición y prueba de código en turnos sucesivos.
- Capacidades multimodales: el IR se exporta como VLM (image-text-to-text), aunque no se han documentado capacidades de visión en el modelo base. El pipeline de uso es `VLMPipeline`, pero puede utilizarse para texto puro.
- Multilingüe: no especificado.
- Modelo de razonamiento: requiere manejar el tag `response` para separar la traza de pensamiento de la respuesta final.

## Casos de uso

- **Agente de programación autónomo**: el modelo puede ejecutar bucles multi-turno donde lee archivos, modifica código, ejecuta pruebas y corrige errores. Su puntuación de 7/7 en la suite de agent-loop indica que es fiable en flujos de trabajo con herramientas encadenadas.
- **Generación de código con explicación**: para entornos educativos o de documentación, el modelo genera código junto con una explicación razonada (chain-of-thought) que puede mostrarse al usuario.
- **Integración en pipelines de CI/CD**: gracias a su soporte de tool calling y su razonamiento, puede integrarse en flujos automatizados de revisión de código o generación de tests, aunque se recomienda usarlo en bucles con lectura y edición.
- **Despliegue en hardware Intel**: al estar cuantizado en INT4 y en formato OpenVINO, puede ejecutarse en portátiles con iGPU (por ejemplo, Intel Core Ultra) o en servidores con GPU Intel, lo que permite prototipado local sin necesidad de GPU NVIDIA.
- **Asistente de programación en el editor**: con una ventana de contexto de 256K, puede manejar archivos de código completos y conversaciones de larga duración, ideal para un asistente que recuerde el contexto del proyecto.
- **Investigación en agentes de código**: sirve como base para experimentos de RL y de evaluación de capacidades agénticas, dado que su post-entrenamiento está documentado y el código de cuantización es reproducible.

## Benchmarks y rendimiento

El autor ha publicado una tabla de rendimiento medida en un benchmark por tipo de tarea (cada celda se evalúa como aprobado/fallo, con ejecución de código contra aserciones ocultas). La medición se realizó en un Intel Core Ultra 155H con Arc iGPU, con OpenVINO GenAI 2026.3.0.0 y la configuración de codificación recomendada (temperatura 0.6, top_p 0.95, top_k 20).

| Suite | Puntuación | Notas |
|---|---|---|
| Codegen | 11/12 | Generación de código |
| Agent-loop | 7/7 | Disciplina de herramientas en bucles multi-turno, incl. cadenas profundas |
| Analysis | 4/4 | Análisis de código |
| Edit (single-shot) | 0/2 | Edición en un solo paso: falla al llamar `read_file` en lugar de editar |
| Autocomplete-fim | n/a | No evaluado (IR con forma VLM) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la documentación. El modelo base de 9B en formato denso requiere aproximadamente 18-20 GB en FP16, pero la cuantización INT4 reduce significativamente los requisitos. No se especifica el tamaño exacto de la versión INT4.
- **GPU recomendadas**: el modelo se probó en una iGPU Intel Arc integrada en un Intel Core Ultra 155H, lo que indica que puede ejecutarse en hardware integrado de Intel. Para cargas mayores o mayor velocidad, se puede usar una GPU dedicada Intel (Arc) o NVIDIA con soporte OpenVINO.
- **Compatibilidad**: el formato OpenVINO IR no es compatible con GPUs NVIDIA mediante CUDA, pero puede ejecutarse en GPU NVIDIA a través del backend de OpenVINO (si se instala el plugin correspondiente). No es compatible con GGUF (llama.cpp) ni con safetensors.
- **Opciones de despliegue**: se carga mediante la API `openvino_genai.VLMPipeline` en Python, con soporte para GPU y CPU. No hay integración con vLLM u Ollama.
- **Latencia y throughput**: no se proporcionan datos numéricos. Se menciona que el modelo funciona en tiempo real en la iGPU del Core Ultra, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre comparaciones con otros modelos de la misma categoría en la documentación proporcionada. Sin embargo, se puede comparar con su modelo base:

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.0-9B (base) | 9B | 256K | FP16/FP32 | MIT | Safetensors |
| Ornith-1.0-9B-int4-symg128-ov | 9B | 256K | INT4 (OpenVINO) | MIT | OpenVINO IR |

El modelo cuantizado ofrece una huella menor y una integración con OpenVINO, pero presenta la limitación de edición single-shot. No se han comparado con otros modelos de código como CodeLlama o DeepSeek-Coder en los datos disponibles.

## Limitaciones y advertencias

- **Edición de código en un solo paso**: el modelo no responde correctamente a tareas de edición directa (puntuación 0/2), ya que tiende a llamar `read_file` en lugar de modificar el contenido, incluso cuando el archivo ya está en el prompt. Se recomienda usarlo en bucles de agente que permitan lectura, edición y prueba.
- **Pérdida de rendimiento al bajar la temperatura**: reducir la temperatura por debajo de 0.6 degrada el rendimiento en agent-loop y análisis (de 4/4 a 2/4) y aumenta el tiempo de cálculo (7×), porque el modelo de razonamiento se cicla.
- **Cuantización data-free**: la ausencia de calibración (AWQ o scale-estimation) puede provocar pérdida de precisión en tareas sensibles, aunque el autor indica que el formato simétrico g128 es el mejor de los probados.
- **Dependencia de OpenVINO GenAI 2026.3.0.0 o superior**: el modelo no funciona con versiones anteriores, y el formato IR es VLM, lo que obliga a usar `VLMPipeline` incluso para uso de texto.
- **Idiomas**: no se especifican idiomas soportados; el modelo está optimizado para código y texto en inglés (no se ha verificado).
- **Sesgos y alucinaciones**: no se documentan sesgos específicos, pero como modelo de razonamiento puede generar trazas de pensamiento largas que pueden contener errores o alucinaciones, especialmente en tareas fuera de su dominio.
- **Licencia**: MIT, permite uso comercial y modificación, pero se debe respetar la atribución.

## Enlaces

- [Modelo cuantizado en HuggingFace](https://huggingface.co/HarmenWessels/Ornith-1.0-9B-int4-symg128-ov)
- [Modelo base en HuggingFace](https://huggingface.co/ornith-ai/Ornith-1.0-9B)
- [Repositorio GitHub de Ornith-1](https://github.com/ornith-ai/Ornith-1)
- [Espacio de demostración en HuggingFace](https://huggingface.co/spaces/deepreinforce-ai/Ornith-1.0-9B)
- [Web oficial de Ornith AI](https://ornith.online/)
- [Landing page del modelo 9B](https://ornith.online/ornith-1-0-model-9b)
