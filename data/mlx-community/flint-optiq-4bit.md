# mlx-community/flint-OptiQ-4bit

## Resumen

mlx-community/flint-OptiQ-4bit es una cuantización en precisión mixta para MLX del modelo RecursiveSI/flint, un modelo de tipo mixture-of-experts (MoE) de Recursive enfocado en agentes de programación. La conversión ha sido realizada por mlx-community, la organización comunitaria que publica modelos optimizados para el framework MLX de Apple, y ha sido construida con la herramienta mlx-optiq, un kit nativo de MLX para cuantizar, ajustar y servir LLMs localmente en Apple Silicon sin depender de PyTorch ni de la nube.

El resultado ocupa 25,6 GB en disco (frente a unos 80 GB en bf16 del modelo original), lo que lo hace ejecutable en Macs con memoria unificada de 36 GB o más. La cuantización OptiQ asigna anchos de bits por capa según una pasada de sensibilidad basada en divergencia KL sobre una mezcla de calibración de seis dominios: las capas sensibles reciben 8 bits y las robustas 4 bits. Esto permite mantener una calidad muy cercana al modelo original, con un Capability Score de 86,20 sobre seis métricas evaluadas en modo razonamiento.

El modelo base, flint, es un MoE de 40B de parámetros totales con unos 2,5B activos, diseñado para agentes de código y razonamiento previo a la respuesta. Requiere la librería mlx-optiq (versión 0.7.2 o superior), ya que la arquitectura flint aún no está soportada por `mlx-lm` de serie.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE: 49 capas (2 densas, 47 MoE), 256 expertos enrutados con top-6 más experto compartido, attention sinks aprendidos, ventana deslizante de 513 tokens en 35 de las 49 capas |
| Parametros totales | 39.785.285.888 (aprox. 40B) |
| Parametros activos | 2,5B (aprox., dato del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | OptiQ en precision mixta: 369 capas a 8 bits, 116 capas a 4 bits (485 en total), group size 64 |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantizado |

## Arquitectura y entrenamiento

La arquitectura de flint combina capas densas con capas MoE: de las 49 capas totales, 2 son densas y 47 son MoE con 256 expertos enrutados, enrutamiento sigmoid top-6 y un experto compartido. Incorpora dos innovaciones destacables respecto a arquitecturas transformer convencionales: attention sinks aprendidos y una ventana deslizante de 513 tokens en 35 de las 49 capas, mientras que las capas de atencion completa carecen de codificacion posicional. Esta combinacion sugiere un diseno hibrido orientado a la recuperacion en contextos largos y a la eficiencia en inferencia.

Sobre el entrenamiento del modelo base (tokens, composicion del dataset, RLHF/DPO) no se ha publicado informacion en la documentacion disponible. En cuanto a la cuantizacion, OptiQ emplea un metodo guiado por sensibilidad: una pasada de divergencia KL contra una referencia uniforme de 4 bits determina que capas se cuantizan a 8 bits (369) y cuales a 4 bits (116), usando una mezcla de calibracion de seis dominios. La etiqueta "4bit" denota la familia de cuantizacion, no la media ponderada de bits.

## Capacidades

- Generacion de texto con modo de razonamiento: el modelo razona antes de responder, por lo que se recomienda un `max_tokens` generoso.
- Generacion de codigo: HumanEval pass@1 del 89,0% en modo razonamiento; orientado a agentes de programacion.
- Razonamiento matematico: 92,6% en GSM8K.
- Conocimiento general: 86,4% en MMLU evaluado de forma generativa con presupuesto de thinking amplio.
- Seguimiento de instrucciones: 90,2% en IFEval (conjunto completo, modo estricto).
- Tool calling / function calling: 87,0% en BFCL-V3 simple; el servidor de mlx-optiq expone un endpoint compatible con las APIs de OpenAI y Anthropic con soporte de llamadas a herramientas y prompt caching.
- Recuperacion en contexto largo: 72,0% en HashHop.
- Ejecucion local en Apple Silicon mediante MLX, sin dependencia de PyTorch ni de la nube.

## Casos de uso

- Agentes de programacion locales: el modelo esta entrenado especificamente para agentes de codigo y alcanza 89,0% en HumanEval, por lo que puede integrarse en herramientas de edicion o CLI que generen, depuren y refactoricen codigo sin enviar datos a la nube.
- Asistentes con tool calling autoalojados: gracias al 87,0% en BFCL-V3 y al servidor compatible con OpenAI/Anthropic de mlx-optiq, puede sustituir endpoints de API comerciales en flujos de function calling con herramientas externas.
- Atencion al cliente automatizada: con soporte de prompt caching y llamadas a herramientas, puede gestionar conversaciones multi-turno conectadas a sistemas de tickets o CRM mediante funciones.
- Resolucion de problemas matematicos y razonamiento paso a paso: el 92,6% en GSM8K y el modo de razonamiento previo lo hacen adecuado para tutores o asistentes de calculo.
- Recuperacion en documentos largos: el 72,0% en HashHop y la arquitectura con ventanas deslizantes lo orientan a tareas de busqueda y extraccion de informacion en contextos extensos.
- Seguimiento estricto de instrucciones: el 90,2% en IFEval estricto lo hace util para generacion con formatos y restricciones impuestas (JSON, plantillas, limites de longitud).
- Prototipado en portatiles Mac: con 26 GB de memoria unificada, cabe en Macs de 36 GB, permitiendo experimentacion local sin coste de GPU en la nube.

## Benchmarks y rendimiento

Resultados publicados por mlx-optiq, evaluados en modo razonamiento (MMLU generativo y presupuesto de thinking amplio). El Capability Score es la media no ponderada de las seis metricas.

| Metrica | OptiQ-4bit |
|---|---:|
| MMLU (reasoning, 969 muestras) | 86,4% |
| GSM8K (1000 muestras) | 92,6% |
| IFEval (conjunto completo, estricto) | 90,2% |
| BFCL-V3 simple (200 llamadas) | 87,0% |
| HumanEval (164 problemas, pass@1) | 89,0% |
| HashHop (recuperacion en contexto largo) | 72,0% |
| **Capability Score** (media de 6) | **86,20** |

No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- Memoria unificada: los pesos ocupan unos 26 GB; se ha construido y evaluado en un Mac de 36 GB, donde los prompts largos dejan poco margen; 48 GB o mas es lo comodo.
- Compatible con Apple Silicon mediante MLX; no se indica soporte ni requisitos para GPU NVIDIA (A100, H100, RTX 4090, etc.).
- Cabe en Macs de consumo con 36 GB de memoria unificada, aunque con poco margen para prompts largos; los de 48 GB o mas son la recomendacion.
- Despliegue: requiere `mlx-optiq>=0.7.2`, que registra la arquitectura flint con `mlx-lm` al importarla. El comando `optiq serve` levanta un servidor compatible con las APIs de OpenAI y Anthropic, con tool calls y prompt caching. No funciona con `mlx-lm` de serie; no se menciona soporte de llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado datos comparativos directos en la informacion disponible. Por categoria (MoE de ~40B con ~2,5B activos, orientado a agentes de codigo y ejecutable localmente), alternativas de referencia serian:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mlx-community/flint-OptiQ-4bit | 40B (~2,5B activos) | no disponible | Apache 2.0 | MoE con attention sinks y ventanas deslizantes; requiere mlx-optiq; solo Apple Silicon |
| Qwen3-30B-A3B | 30B (~3B activos) | 32k-128k | Apache 2.0 | MoE comparable en activos; ecosistema MLX/GGUF maduro |
| Mixtral 8x7B (46,7B, ~13B activos) | 46,7B (~13B activos) | 32k | Apache 2.0 | Mas parametros activos, mayor consumo de memoria por token |

## Limitaciones y advertencias

- Requiere mlx-optiq: la arquitectura flint no esta soportada por `mlx-lm` de serie, lo que limita la portabilidad a otros runtimes (llama.cpp, vLLM, etc. no se mencionan como soportados).
- Solo Apple Silicon: al ser una cuantizacion MLX, no es utilizable directamente en entornos CUDA estandar.
- Presupuesto de memoria ajustado: en Macs de 36 GB, los prompts largos dejan poco margen; conviene 48 GB o mas para produccion.
- Modo razonamiento: el modelo razona antes de responder, por lo que consume mas tokens de salida; hay que configurar un `max_tokens` generoso, lo que incrementa la latencia.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no disponible; como todo LLM, requiere verificacion de salidas, especialmente en codigo y matematicas.
- Longitud de contexto e idiomas soportados: no disponibles en la documentacion.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del modelo base RecursiveSI/flint para condiciones adicionales.

## Enlaces

- Modelo cuantizado: https://huggingface.co/mlx-community/flint-OptiQ-4bit
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Organizacion mlx-community: https://huggingface.co/mlx-community
- Sitio del proyecto mlx-optiq: https://mlx-optiq.com/
- Todos los quants OptiQ: https://mlx-optiq.com/models
- Documentacion de mlx-optiq: https://mlx-optiq.com/docs/
- Lab de mlx-optiq: https://mlx-optiq.com/docs/lab/
- Blog: mezcla de calibracion de seis dominios: https://mlx-optiq.com/blog/calibration-mix
- Blog: metodologia del framework de evaluacion: https://mlx-optiq.com/blog/eval-framework
- PyPI: https://pypi.org/project/mlx-optiq/
