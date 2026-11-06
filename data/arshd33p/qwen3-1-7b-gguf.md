# arshd33p/Qwen3-1.7B-GGUF

## Resumen

Qwen3-1.7B-GGUF es una cuantización en formato GGUF del modelo Qwen3-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud y empaquetado por el usuario arshd33p en Hugging Face. Se trata de un modelo de lenguaje causal denso de 1.700 millones de parámetros (1.400 millones sin contar los embeddings) pensado para inferencia local eficiente mediante llama.cpp, Ollama y otras herramientas compatibles con GGUF. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

El modelo base Qwen3-1.7B forma parte de la tercera generación de la familia Qwen, que combina modelos densos y de mezcla de expertos (MoE). La innovación principal de esta generación es la capacidad de alternar entre modo "thinking" (razonamiento explícito paso a paso) y modo "non-thinking" (diálogo directo) dentro de un mismo modelo, controlable mediante las etiquetas `/think` y `/no_think`. Esto permite al desarrollador elegir entre latencia baja o razonamiento profundo según la tarea.

Con una ventana de contexto de 32.768 tokens, 28 capas y atención con GQA (16 cabezas de consulta y 8 de clave-valor), este modelo resulta relevante para despliegues en hardware de consumo donde no es viable ejecutar modelos de mayor tamaño. Su tamaño de repositorio de 1,8 GB y su cuantización q8_0 lo hacen adecuado para equipos con 8-16 GB de RAM/VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), con GQA (16 cabezas Q / 8 cabezas KV) |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | q8_0 (incluida en el repo); otros tipos GGUF no confirmados en la informacion disponible |
| Idiomas soportados | 100+ idiomas y dialectos segun la model card del modelo base; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 1,8 GB); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 28 capas con atención de consultas agrupadas (GQA), usando 16 cabezas de consulta y 8 de clave-valor, lo que reduce el coste de memoria de la caché KV durante la inferencia. Cuenta con 1.700 millones de parámetros totales, de los cuales 1.400 millones son no-embedding. El modelo base Qwen3-1.7B se entrenó en dos fases: preentrenamiento y post-entrenamiento, según indica la model card. No se especifica en la información proporcionada el número exacto de tokens de entrenamiento ni la composición del dataset, ni si se emplearon técnicas concretas de RLHF o DPO más allá de la mención genérica a "post-training" y "human preference alignment".

La innovación técnica más destacable es el soporte nativo de conmutación entre modo thinking y non-thinking dentro de un único modelo, sin necesidad de cargar pesos distintos. El modo thinking genera un bloque `<think>...</think>` con razonamiento explícito antes de la respuesta final, mientras que el modo non-thinking responde directamente. Esta conmutación se controla por turno de conversación mediante instrucciones `/think` y `/no_think` en el prompt del usuario o del sistema. La model card recomienda parámetros de muestreo distintos para cada modo y advierte explícitamente contra la decodificación greedy en modo thinking por riesgo de repeticiones infinitas.

## Capacidades

- Generación de texto conversacional multi-turno con alineación a preferencias humanas.
- Razonamiento lógico y matemático en modo thinking, con generación de cadenas de pensamiento explícitas.
- Generación de código y razonamiento sobre código.
- Conmutación por turno entre modo thinking y non-thinking mediante `/think` y `/no_think`.
- Capacidades de agente: integración con herramientas externas y function calling en ambos modos, según la model card del modelo base.
- Soporte multilingüe de más de 100 idiomas y dialectos, con instrucciones y traducción.
- Escritura creativa, role-playing y seguimiento de instrucciones.
- Razonamiento multi-paso en tareas complejas cuando se activa el modo thinking.

## Casos de uso

- **Asistente conversacional local en hardware de consumo**: con 1,7B parámetros y cuantización q8_0, el modelo cabe en equipos con 8-16 GB de RAM y puede ejecutarse con Ollama o llama.cpp para asistentes personales sin conexión, priorizando el modo non-thinking para respuestas rápidas.
- **Razonamiento matemático en entornos con recursos limitados**: activando el modo thinking, el modelo genera cadenas de razonamiento paso a paso útiles para tutoría o verificación de cálculos, con la recomendación de usar `Temperature=0.6`, `TopP=0.95` y `PresencePenalty=1.5`.
- **Generación de código en pipelines de desarrollo**: el modelo puede integrarse en herramientas de autocompletado o revisión de código; su ventana de 32.768 tokens permite incluir archivos completos o fragmentos de repositorio en el contexto.
- **Procesamiento de documentos con contexto largo**: la ventana de 32.768 tokens permite resumir, extraer información o responder preguntas sobre documentos de decenas de páginas en una sola pasada, sin necesidad de fragmentación agresiva.
- **Traducción y atención al cliente multilingüe**: el soporte de más de 100 idiomas y dialectos lo hace adecuado para sistemas de atención automatizada en mercados diversos, con conversaciones multi-turno gestionadas por el template de chat Jinja2.
- **Agentes con tool calling en prototipos**: la capacidad de function calling en ambos modos permite construir prototipos de agentes que consultan APIs externas, con la ventaja de poder desactivar el razonamiento explícito para reducir latencia en pasos simples.
- **Clasificación y extracción de información estructurada**: con prompts que fuerzan salida JSON (como recomienda la model card para preguntas de opción múltiple), el modelo puede usarse para extracción de entidades o clasificación en flujos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado remite al blog y la documentación oficial de Qwen3 para detalles de evaluación, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni otras métricas para este modelo.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia**: la cuantización q8_0 ocupa aproximadamente 1,8 GB en disco; en memoria se requiere un margen adicional para la caché KV y el contexto. Con 32.768 tokens de contexto y GQA (8 cabezas KV), la caché KV es moderada, pero se recomienda al menos 4-6 GB de RAM/VRAM para contexto largo.
- **GPU recomendadas**: cualquier GPU con 6 GB o más de VRAM puede ejecutar el modelo con comodidad; una RTX 3060, RTX 4060 o superior es suficiente. Para mayor throughput, A100 o H100 no son necesarias dado el tamaño del modelo.
- **¿Cabe en GPU de consumo?**: sí, en prácticamente todas las GPU de consumo modernas con 6 GB o más de VRAM, e incluso en CPU con suficiente RAM.
- **Opciones de despliegue**: llama.cpp (con flags `-ngl 99 -fa -sm row`), Ollama (`ollama run hf.co/Qwen/Qwen3-1.7B-GGUF:Q8_0`), y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la información disponible para este formato.
- **Latencia y throughput**: no se han publicado cifras concretas en la información disponible. La model card recomienda `-c 40960 -n 32768 --no-context-shift` para llama.cpp, lo que sugiere que el modelo puede manejar contextos largos en CPU/GPU de consumo con velocidades aceptables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B (este, GGUF) | 1,7B | 32.768 | Apache 2.0 | GGUF | Modo thinking/non-thinking, 100+ idiomas |
| Qwen3-1.7B (original) | 1,7B | 32.768 | Apache 2.0 | safetensors | Pesos completos, mismo rendimiento base |
| Qwen2.5-1.5B | 1,5B | 32.768 (segun version) | Apache 2.0 | safetensors/GGUF | Generación anterior, sin modo thinking |
| Llama 3.2 1B | 1,2B | 128.000 | Llama 3.2 Community License | safetensors/GGUF | Contexto mayor, licencia con restricciones |

La comparación con Qwen2.5-1.5B y Llama 3.2 1B se ofrece como referencia de categoría (modelos densos de ~1-2B parámetros); no se dispone de datos de benchmarks comparativos en la información proporcionada para cuantificar diferencias de rendimiento.

## Limitaciones y advertencias

- **Riesgo de alucinación**: como todo modelo de 1,7B parámetros, la tasa de alucinación es mayor que en modelos de mayor tamaño; no debe usarse como fuente única de verdad en dominios críticos sin verificación.
- **Repeticiones en modo thinking**: la model card advierte explícitamente de que la decodificación greedy puede provocar degradación y repeticiones infinitas en modo thinking; es obligatorio usar los parámetros de muestreo recomendados.
- **Penalización de presencia en modelos cuantizados**: se recomienda `presence_penalty=1.5` para suprimir repeticiones, pero valores altos pueden causar mezcla de idiomas y ligera pérdida de rendimiento.
- **Contenido de thinking en historial**: en conversaciones multi-turno, el historial debe excluir el contenido `<think>`; frameworks que no usen el template Jinja2 deben gestionarlo manualmente o el rendimiento se degrada.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado con datos web a gran escala, es probable que herede sesgos presentes en dichos datos.
- **Limitaciones de idioma**: aunque se declaran 100+ idiomas, el rendimiento relativo por idioma no está cuantificado en la información disponible; los idiomas con menos representación en los datos de entrenamiento probablemente rindan peor.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el repo cuantizado es una redistribución de terceros; conviene verificar la licencia del modelo base original (Apache 2.0) y citar adecuadamente.
- **Cuantización q8_0**: es una cuantización de alta calidad, pero introduce una pérdida mínima frente a los pesos originales en safetensors; para benchmarks rigurosos se recomienda usar los pesos sin cuantizar.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/arshd33p/Qwen3-1.7B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio GGUF oficial de Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B-GGUF
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentación de llama.cpp para Qwen: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Documentación de Ollama para Qwen: https://qwen.readthedocs.io/en/latest/run_locally/ollama.html
- Chat de Qwen: https://chat.qwen.ai/
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
