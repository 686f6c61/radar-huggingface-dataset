# salohcin714/granite-4.2-3b-4bit-awq-mlx

## Resumen

El repositorio `salohcin714/granite-4.2-3b-4bit-awq-mlx` contiene una conversión y cuantización del modelo IBM Granite 4.2 de 3 mil millones de parámetros al formato MLX, optimizado para ejecución en Apple Silicon. La cuantización emplea el método AWQ (activation-aware quantization) con 4 bits y grupo de 64, lo que reduce el tamaño del modelo a aproximadamente 2,1 GB, manteniendo un equilibrio razonable entre precisión y eficiencia. El modelo base, desarrollado por IBM, pertenece a la familia Granite 4.2, una serie de modelos densos de razonamiento con chain-of-thought integrado, modos de pensamiento flexibles y tool calling aumentado con razonamiento.

Esta versión cuantizada está pensada para desarrolladores que deseen ejecutar un modelo de razonamiento de última generación en hardware de Apple (Mac con chip M1 o superior) con requisitos de memoria reducidos. No se ha realizado ningún fine-tuning adicional; los pesos originales se han convertido y cuantizado tal cual. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que la hace atractiva para integraciones en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 3.000 millones (modelo base); el repo reporta 588.065.280, valor inconsistente con el modelo base, probablemente un error de extracción |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Granite 4.2 soporta 128k, pero no se confirma para este artefacto) |
| Tipos de cuantizacion | 4-bit AWQ, group size 64 |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en layout MLX |

## Arquitectura y entrenamiento

El modelo base `ibm-granite/granite-4.2-3b` es un transformer decoder-only denso, post-entrenado sobre los modelos base Granite 4.1. IBM describe la familia Granite 4.2 como modelos de razonamiento con chain-of-thought integrado, modos de pensamiento flexibles (pensamiento rápido o extendido) y tool calling aumentado con razonamiento. El proceso de post-entrenamiento incluye fases de instrucción y alineación, aunque los detalles específicos de tokens y dataset no se proporcionan en la información disponible.

La conversión a MLX se realizó con `mlx-lm` 0.31.3, aplicando cuantización 4-bit AWQ con grupo de 64 y calibración activada por activaciones. Se eliminaron los pesos redundantes de `lm_head.weight` cuando el modelo ata embeddings de entrada y salida. No se añadió ningún dato de entrenamiento adicional ni se realizó fine-tuning.

## Capacidades

- Generación de texto y razonamiento multi-paso con chain-of-thought integrado.
- Modos de pensamiento flexibles: el modelo puede operar en modo rápido (sin razonamiento explícito) o en modo extendido (generando pasos de razonamiento antes de la respuesta final).
- Tool calling aumentado con razonamiento: capaz de invocar funciones externas de forma estructurada, útil para agentes y pipelines automatizados.
- Soporte multilingüe en 12 idiomas: inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino.
- Capacidad de diálogo conversacional multi-turno gracias a su naturaleza de modelo de lenguaje instruccional.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en varios idiomas, manteniendo el contexto de la interacción y derivando a herramientas externas (CRM, sistemas de tickets) mediante tool calling.
- Asistente de razonamiento para análisis de documentos: gracias a su chain-of-thought, puede desglosar problemas complejos, resumir informes y extraer conclusiones con pasos justificados.
- Generación de código asistida: aunque no está especializado en código, su capacidad de razonamiento estructurado permite generar fragmentos de código con explicaciones paso a paso, útil en entornos de desarrollo.
- Agente autónomo en entornos de automatización: su tool calling permite integrarlo en sistemas que necesitan tomar decisiones basadas en datos y ejecutar acciones (por ejemplo, consultas a APIs, actualización de bases de datos).
- Traducción y localización: soporta 12 idiomas, lo que lo hace adecuado para tareas de traducción automática y adaptación de contenido.
- Prototipado rápido de aplicaciones de IA en Mac: al ser un modelo cuantizado en MLX, se puede desplegar localmente en un MacBook para pruebas y desarrollo sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta cuantización específica. Los benchmarks oficiales de IBM se refieren al modelo original `granite-4.2-3b` y no deben atribuirse a este artefacto cuantizado, como advierte el propio autor en el README. Para evaluar el rendimiento real, se recomienda ejecutar pruebas propias con las cargas de trabajo objetivo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5-2 GB para el modelo cuantizado (el repo ocupa 2,1 GB en disco).
- GPU recomendada: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible con GPUs NVIDIA o AMD.
- Memoria unificada: un Mac con 8 GB de RAM unificada puede ejecutar el modelo con holgura; se recomienda 16 GB para mayor comodidad.
- Opciones de despliegue: exclusivamente mediante `mlx-lm` (biblioteca de Apple para MLX). No compatible con vLLM, llama.cpp u Ollama en su forma actual.
- Latencia y throughput: no se han publicado datos. En un M1 Pro se espera una generación de 20-40 tokens por segundo para un modelo de 3B en 4-bit, aunque esto es una estimación orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.2-3b (este, cuantizado MLX) | 3B | no disponible | Apache 2.0 | MLX safetensors | HuggingFace |
| Llama 3.2 3B (cuantizado GGUF) | 3.2B | 128k | Llama 3.2 Community | GGUF, MLX | HuggingFace, Ollama |
| Qwen 2.5 3B (cuantizado GGUF) | 3B | 128k | Apache 2.0 | GGUF, MLX | HuggingFace, Ollama |
| Phi-3.5 mini (3.8B) | 3.8B | 128k | MIT | GGUF, MLX | HuggingFace |

La comparativa es estructural, ya que no se dispone de benchmarks del modelo cuantizado. Granite 4.2 se distingue por su enfoque en razonamiento explícito y tool calling, mientras que Llama 3.2 y Qwen 2.5 ofrecen ecosistemas más amplios de herramientas de despliegue.

## Limitaciones y advertencias

- El modelo es una cuantización 4-bit, lo que puede degradar ligeramente la calidad de las respuestas en tareas de razonamiento complejo respecto al modelo original en punto flotante.
- No se ha verificado el comportamiento del modelo cuantizado en todos los idiomas; la calidad puede variar especialmente en idiomas con menos representación en el entrenamiento.
- Riesgo de alucinación inherente a todos los modelos de lenguaje; se recomienda validar las salidas en aplicaciones críticas.
- La longitud de contexto no está confirmada para este artefacto; si el modelo base soporta 128k, la cuantización podría afectar al manejo de contextos muy largos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está afiliado ni respaldado por IBM; la marca "Granite" es propiedad de IBM y se usa solo con fines descriptivos.
- No es compatible con hardware no Apple; requiere un Mac con chip Apple Silicon.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-3b-4bit-awq-mlx
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Documentación oficial de Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de IBM Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Página general de IBM Granite: https://www.ibm.com/granite
