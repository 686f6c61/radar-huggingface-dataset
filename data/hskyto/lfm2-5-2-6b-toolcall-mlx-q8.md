# Hskyto/lfm2.5-2.6b-toolcall-mlx-q8

## Resumen

El modelo **Hskyto/lfm2.5-2.6b-toolcall-mlx-q8** es una versión cuantizada a 8 bits (MLX Q8) del modelo **LiquidAI/LFM2.5-2.6B** de Liquid AI, adaptada para ejecutarse en Apple Silicon y dispositivos iOS mediante el framework MLX. Sobre el modelo base se ha fusionado un adaptador QLoRA específicamente entrenado para tool calling y normalización de argumentos, lo que permite convertir expresiones naturales del usuario en llamadas a funciones estructuradas.

El modelo base, LFM2.5-2.6B, es un modelo denso de 2.600 millones de parámetros diseñado para cargas de trabajo agénticas, con una ventana de contexto de 128.000 tokens y tool calling nativo. Ha sido entrenado sobre aproximadamente 34 billones de tokens y refinado con modelos expertos para reforzar matemáticas, código, uso de herramientas y contexto largo. Esta versión cuantizada mantiene esas capacidades en un paquete de menos de 3 GB, lo que la hace viable para despliegue local en dispositivos móviles y ordenadores Apple.

La relevancia de este modelo radica en su capacidad para ejecutar agentes autónomos con planificación y llamadas a herramientas directamente en el dispositivo, sin depender de APIs en la nube. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su integración con MLX facilita su adopción en el ecosistema de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 758.774.784 (segun safetensors del repo; el modelo base declara 2.6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | MLX Q8 (8-bit) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B es un transformer denso de 2.600 millones de parámetros, entrenado con aproximadamente 34 billones de tokens y un vocabulario de 128.000 tokens. Su post-entrenamiento empleo modelos expertos para reforzar habilidades en matematicas, generacion de codigo, uso de herramientas y manejo de contexto largo. El adaptador QLoRA anadido en esta version se entreno especificamente para el enrutamiento estructurado de herramientas y la normalizacion de argumentos, es decir, transformar frases coloquiales como "llama a mama a las 6" en argumentos programaticos precisos como `time='18:00'`.

La cuantizacion a 8 bits se realizo con MLX, el framework de aprendizaje automatico de Apple, lo que reduce el tamano del modelo a aproximadamente 2,9 GB y permite su ejecucion eficiente en hardware Apple Silicon. El repositorio original del autor indica que tambien existe una version maestra en bfloat16, aunque el repositorio actual corresponde a la version Q8.

## Capacidades

- **Tool calling y function calling**: soporte nativo para invocar funciones externas, con alta precision en la normalizacion de argumentos a partir de lenguaje natural.
- **Orquestacion multi-herramienta**: capacidad de ejecutar llamadas paralelas e independientes a multiples herramientas en una sola respuesta.
- **Razonamiento multi-paso**: planificacion y ejecucion de tareas agénticas complejas, como encadenar varias llamadas a herramientas para completar un objetivo.
- **Generacion de texto y codigo**: el post-entrenamiento con modelos expertos refuerza la generacion de codigo y la resolucion de problemas matematicos.
- **Contexto largo**: ventana de 128.000 tokens, adecuada para documentos extensos o conversaciones prolongadas.
- **Despliegue local**: optimizado para Apple Silicon e iOS mediante MLX, sin necesidad de conexion a internet.

## Casos de uso

- **Asistente personal en iOS**: el modelo puede gestionar recordatorios, alarmas, mensajes y otras tareas del sistema interpretando comandos de voz o texto, gracias a su tool calling nativo y su normalizacion de argumentos.
- **Automatizacion de tareas en el dispositivo**: integrado en aplicaciones de productividad, puede extraer informacion de correos o documentos y ejecutar acciones como enviar respuestas o actualizar calendarios.
- **Agente de domotica local**: controlar dispositivos inteligentes del hogar mediante instrucciones en lenguaje natural, ejecutando llamadas a APIs locales sin depender de la nube.
- **Generacion de codigo sin conexion**: util para desarrolladores que trabajan en entornos aislados o con datos sensibles, generando fragmentos de codigo o scripts directamente en el equipo.
- **Chatbot con contexto largo**: mantener conversaciones extensas con memoria de hasta 128.000 tokens, adecuado para atencion al cliente o asistentes de documentacion.
- **Orquestacion de herramientas en pipelines**: en un entorno de desarrollo, el modelo puede planificar y ejecutar multiples llamadas a funciones (por ejemplo, compilar, testear y desplegar) de forma autonoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El blog de Liquid AI menciona una velocidad de inferencia de 220 tokens por segundo en dispositivos moviles, pero no se proporcionan metricas comparativas como MMLU, HumanEval o GSM8K para esta version cuantizada.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 2,5 GB para la version Q8, segun el blog de Liquid AI.
- **GPU recomendadas**: cualquier chip Apple Silicon (M1, M2, M3 o superiores) o dispositivos iOS con Neural Engine.
- **Compatibilidad con GPU de consumo**: no aplica para GPU NVIDIA; esta optimizado exclusivamente para el ecosistema Apple.
- **Opciones de despliegue**: mediante la libreria `mlx-lm` en Python, o integracion nativa en aplicaciones iOS.
- **Latencia y throughput**: se reportan 220 tokens por segundo en un dispositivo movil de referencia (Snapdragon 8 Elite en el blog, aunque para la version MLX se espera rendimiento similar en Apple Silicon).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| Hskyto/lfm2.5-2.6b-toolcall-mlx-q8 | 2.6B (base) | 128K | Si | Apache 2.0 | MLX Q8 |
| Qwen2.5-1.5B | 1.5B | 32K | Si | Apache 2.0 | Varios |
| Llama-3.2-1B | 1.0B | 128K | No | Llama 3.2 | Varios |

La comparativa es orientativa, ya que no se dispone de datos de rendimiento publicados para el modelo cuantizado. LFM2.5-2.6B destaca por su contexto largo y tool calling nativo, mientras que alternativas como Qwen2.5-1.5B ofrecen tool calling pero con contexto menor. Llama-3.2-1B tiene contexto similar pero carece de soporte nativo para herramientas.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no se han documentado sesgos especificos, pero como todo modelo generativo, puede producir contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- **Dependencia de Apple Silicon**: la version MLX Q8 solo funciona en hardware Apple; no es portable a otras plataformas sin conversion.
- **Inconsistencia en el numero de parametros**: el repositorio safetensors muestra 758 millones de parametros, mientras que el modelo base declara 2.6B. Esta discrepancia puede deberse a un error en el repositorio o a una version parcial; se recomienda verificar antes de usar en produccion.
- **Licencia**: Apache 2.0 permite uso comercial, pero el adaptador QLoRA y el proceso de cuantizacion pueden tener restricciones adicionales no documentadas.
- **Rendimiento no verificado**: no hay benchmarks publicados para esta version cuantizada, por lo que el rendimiento real en tareas especificas puede variar.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/Hskyto/lfm2.5-2.6b-toolcall-mlx-q8)
- [Modelo base LiquidAI/LFM2.5-2.6B](https://huggingface.co/LiquidAI/LFM2.5-2.6B)
- [Documentacion oficial de LFM2.5-2.6B](https://docs.liquid.ai/lfm/models/lfm25-2.6b)
- [Blog de Liquid AI sobre LFM2.5-2.6B](https://www.liquid.ai/blog/lfm2-5-2-6b)
- [Informe tecnico de LFM2 (arXiv)](https://arxiv.org/html/2511.23404v1)
