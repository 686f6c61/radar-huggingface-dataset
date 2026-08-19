# livebylord/Qweblethos-v1-GGUF-EXPEREMENTIAL

## Resumen

Qweblethos v1 es un fine-tune experimental del modelo Qwen3.8-27B, publicado por el usuario livebylord en HuggingFace. Se trata de una destilación de trayectorias sintéticas de agentes de codificación (conjunto Fable 5) mediante supervisión fina (SFT) con LoRA, con el objetivo de mejorar el comportamiento del modelo en tareas de agente de programación, depuración, uso de herramientas y razonamiento multi-paso. El resultado se distribuye como un archivo GGUF cuantizado en Q4_K_M, pensado para ejecutarse en entornos llama.cpp y servidores compatibles con OpenAI.

El modelo parte de la base Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`), de la cual se ha fusionado un adaptador LoRA de rango 32 y 159 millones de parámetros entrenables. El entrenamiento se realizó sobre 6.471 ejemplos de trayectorias de agentes, con una longitud de contexto de 16.384 tokens, durante una época y aproximadamente dos horas en una NVIDIA B200. La versión v1 es una prueba experimental; el autor anuncia una v2 próxima.

La relevancia de este modelo radica en su enfoque específico para flujos de trabajo de agente de codificación en local, con un tamaño que permite ejecución en hardware de gama media-alta. Sin embargo, no se aportan resultados de benchmarks independientes, y la distribución de entrenamiento es estrecha, por lo que su uso en producción requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens (contexto de entrenamiento; el maximo del base no se especifica) |
| Tipos de cuantizacion | Q4_K_M (GGUF v3) |
| Idiomas soportados | Ingles (entrenamiento solo en ingles) |
| Licencia | mixed-upstream-terms (base Apache-2.0; datos AGPL-3.0 y CC BY 4.0) |
| Formato de pesos | GGUF (archivo `Qweblethos-v1-Q4_K_M.gguf`, 15,41 GiB) |

## Arquitectura y entrenamiento

Qweblethos v1 es un modelo denso basado en la arquitectura transformer de Qwen3.8-27B, sin componentes de mezcla de expertos (MoE). El fine-tune se realizó mediante LoRA con rango 32 y alpha 32, sin dropout, sobre 159.383.552 parámetros (aproximadamente el 0,58 % del total). El adaptador se fusionó en el modelo base BF16 y posteriormente se cuantizó a GGUF Q4_K_M.

El entrenamiento consistió en destilación de trayectorias (response/trajectory distillation) mediante supervisión fina sobre ejemplos de agentes de codificación. Se usaron dos conjuntos de datos derivados de Fable 5: `lordx64/agentic-distill-fable-5-sft` (4.392 ejemplos) y `greghavens/fable-5-coding-and-debugging-traces` (2.079 ejemplos), totalizando 6.471 ejemplos. El pipeline de preparación eliminó duplicados, filtró muestras inválidas o demasiado largas, excluyó ruido de servicio/meta, convirtió las llamadas a herramientas al formato nativo de Qwen3.8 y supervisó únicamente los tokens de asistente. Se mantuvieron disjuntos los clústeres de entrenamiento y evaluación.

El entrenamiento se ejecutó durante una época, con 809 pasos de optimizador, tasa de aprendizaje de 8e-5, tamaño de lote efectivo de 8 y longitud máxima de secuencia de 16.384 tokens. La pérdida final de entrenamiento fue 0,51743 y la de evaluación 0,46328. No se trata de destilación a nivel de logits ni de una reproducción del modelo profesor.

## Capacidades

- Generación de texto especializada en tareas de codificación y depuración: corrección de errores, explicación de causas y creación de tests enfocados.
- Razonamiento multi-paso orientado a agentes: el modelo está entrenado para seguir trayectorias de razonamiento y verificación propias de un agente de codificación.
- Uso de herramientas (tool calling): las llamadas a herramientas se convirtieron al formato nativo de Qwen3.8 durante el entrenamiento, por lo que el modelo puede emitir invocaciones estructuradas.
- Inspección de repositorios y respuestas orientadas a verificación: el entrenamiento incluye trayectorias de exploración de código y verificación de resultados.
- Ejecución local mediante llama.cpp y servidores compatibles con OpenAI (llama-server).
- No incluye capacidades de visión ni MTP (multi-token prediction); es una exportación solo de texto.

## Casos de uso

- Depuración asistida en local: un desarrollador puede pasar un fragmento de código con un error y pedir al modelo que lo corrija, explique la causa y proponga tests. Gracias a la ventana de 16.384 tokens, es posible incluir funciones completas o archivos de tamaño medio.
- Agente de codificación autónomo: integrado en un framework de agentes (por ejemplo, mediante el servidor OpenAI-compatible), puede recibir tareas de reparación de bugs, inspeccionar archivos, ejecutar comandos y devolver resultados verificados.
- Asistente de test-driven development (TDD): el modelo puede generar casos de prueba a partir de una descripción de comportamiento o de una función existente, ayudando a cubrir escenarios límite.
- Revisión de cambios en repositorios: dado un diff o un conjunto de archivos, puede identificar posibles regresiones, problemas de estilo o errores lógicos antes de un commit.
- Automatización de pipelines de CI/CD: mediante tool calling, puede analizar logs de fallos, proponer parches y generar tests de regresión en un entorno controlado.
- Entorno de experimentación para investigación en agentes: al ser un fine-tune de distribución estrecha, resulta útil para estudiar el efecto de la destilación de trayectorias en modelos de 27B, comparando su comportamiento con el base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks independientes (SWE-bench, LiveCodeBench, Terminal-Bench, etc.) en la informacion disponible. El autor solo reporta la pérdida y perplejidad sobre 128 ejemplos held-out, comparando el modelo base y el adaptador:

| Variante | Loss | Perplexity |
| --- | ---: | ---: |
| Base Qwen3.8-27B | 0,7328 | 2,0808 |
| Base + Qweblethos LoRA | 0,4634 | 1,5895 |

La reducción relativa de pérdida es del 36,76 %, lo que indica que el adaptador aprendió la distribución de los datos de entrenamiento, pero no demuestra mejora en benchmarks de codificación independientes. El autor no reclama ninguna puntuación de benchmark para v1.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M ocupa 15,41 GiB. Con contexto de 16.384 tokens, la memoria total necesaria puede superar los 20 GiB, dependiendo de la implementación y el tamaño de la ventana de contexto.
- GPU recomendadas: para una ejecución totalmente en GPU se necesitan al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100). GPUs con menos memoria (por ejemplo, RTX 3090 con 24 GB) pueden ser suficientes si se usa offload parcial.
- CPU/RAM: el modelo puede ejecutarse solo con CPU, pero se recomiendan 32 GB de RAM como mínimo; 24 GB es marginal.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (si se convierte o se usa directamente el GGUF), vLLM (con conversión a formato compatible), TGI (con adaptación). El autor proporciona ejemplos de uso con llama-cli y llama-server.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (A100 o similar) con Q4_K_M, se puede esperar una generación de decenas de tokens por segundo, pero depende del hardware y del contexto.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks para comparar directamente con otros modelos. La comparación más relevante es con el modelo base Qwen3.8-27B, del cual deriva:

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
| --- | --- | --- | --- | --- | --- |
| Qwen3.8-27B (base) | ~27B | no especificado (probablemente mayor que 16k) | Apache-2.0 | safetensors, GGUF | Generalista |
| Qweblethos v1 | 26,9B | 16.384 (entrenamiento) | mixed-upstream-terms | GGUF Q4_K_M | Agente de codificacion |
| Qwen2.5-27B (alternativa comun) | ~27B | 32k (tipico) | Apache-2.0 | safetensors, GGUF | Generalista |

Qweblethos v1 se diferencia del base por su enfoque en trayectorias de agente de codificación, pero carece de validación en benchmarks estándar. Frente a alternativas como Qwen2.5-27B, no hay datos que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Distribución de entrenamiento estrecha: el modelo está fuertemente especializado en trayectorias de agentes de codificación; el chat general, la calidad multilingüe, la visión y otros dominios de razonamiento pueden haber regresado respecto al base.
- Riesgo de alucinación: el modelo puede inventar comandos, archivos, resultados de tests o salidas de herramientas. Las acciones generadas deben tratarse como no confiables y revisarse antes de ejecutarlas.
- Dependencia del formato de tool calling: la correcta emisión de llamadas a herramientas depende del runtime y de la implementación de la plantilla de chat (chat template). Se recomienda usar `--jinja` con llama.cpp.
- Cuantización: la conversión a Q4_K_M puede reducir la calidad en comparación con el checkpoint BF16 fusionado.
- Licencia mixta: el modelo combina términos de Apache-2.0 (base), AGPL-3.0 y CC BY 4.0 (datos). Antes de redistribuir o usar comercialmente, es obligatorio revisar el archivo `LICENSE_NOTICE.md` del repositorio.
- Sin validación independiente: solo se ha realizado una prueba de humo (generación de "hello world") y una comparación de pérdida en held-out. No hay benchmarks de codificación ni evaluación de seguridad.
- Idioma limitado: el entrenamiento es solo en inglés; el rendimiento en otros idiomas probablemente sea deficiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/livebylord/Qweblethos-v1-GGUF-EXPEREMENTIAL
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset `lordx64/agentic-distill-fable-5-sft`: https://huggingface.co/datasets/lordx64/agentic-distill-fable-5-sft
- Dataset `greghavens/fable-5-coding-and-debugging-traces`: https://huggingface.co/datasets/greghavens/fable-5-coding-and-debugging-traces
- Dataset original Fable-5-traces: https://huggingface.co/datasets/Glint-Research/Fable-5-traces
