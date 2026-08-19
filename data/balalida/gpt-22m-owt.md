# balalida/gpt-22M-owt

## Resumen

El modelo `gpt-22M-owt` es un transformer decoder-only de cuatro capas desarrollado como parte de la asignatura CS336 de la Universidad de Stanford. A pesar de su nombre, el checkpoint real contiene 28,8 millones de parámetros (los pesos están atados entre la embedding y la cabeza de salida). Está entrenado sobre el dataset OpenWebText con un tokenizador byte-level BPE, una longitud de contexto de 256 tokens y una arquitectura que incorpora SwiGLU, RMSNorm y RoPE.

Se trata de un modelo puramente educativo, diseñado para ilustrar el entrenamiento de modelos causales de lenguaje desde cero. Su relevancia radica en que sirve como referencia didáctica para entender los componentes básicos de un transformer moderno, aunque su capacidad práctica es muy limitada: la pérdida de validación es de 4,14 tokens, lo que indica una generación de texto de baja calidad y con tendencia a la repetición. No está pensado para uso en producción, sino para experimentación y aprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (4 capas) |
| Parametros totales | 28.840.448 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dataset en ingles, sin especificacion oficial) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 4 capas con ancho de 512, 16 cabezas de atencion, dimension de SwiGLU de 1344, RMSNorm y RoPE. Usa un tokenizador byte-level BPE y tiene los pesos de la embedding y la cabeza de salida atados. El entrenamiento se realizo sobre el dataset OpenWebText, con un total de 647.168.000 tokens representados en la linea de checkpoints. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; es un entrenamiento clasico de modelado de lenguaje causal. La perdida de validacion reportada es de 4,140625 por token.

## Capacidades

- Generacion de texto basica: puede producir continuaciones de texto a partir de un prompt, pero con calidad limitada y tendencia a repetir o alucinar.
- Modelado de lenguaje causal: adecuado para estudiar el comportamiento de un transformer pequeno en tareas de autocompletado.
- Tokenizacion byte-level BPE: maneja texto a nivel de bytes, lo que permite procesar cualquier secuencia de caracteres.
- Sin soporte de tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Educacion y formacion: sirve como ejemplo practico para estudiantes que quieran entender el entrenamiento de un transformer desde cero, incluyendo la implementacion de atencion, normalizacion y tokenizacion.
- Experimentacion con fine-tuning: al ser un modelo pequeno, permite probar tecnicas de ajuste fino (por ejemplo, LoRA) en un entorno de bajo coste computacional.
- Investigacion sobre scaling laws: su tamano reducido lo hace util para estudiar como varian las metricas de perdida y generacion con el numero de parametros y tokens de entrenamiento.
- Pruebas de infraestructura: puede usarse para validar pipelines de inferencia o entrenamiento distribuido sin necesidad de recursos elevados.
- Generacion de texto de demostracion: en entornos de desarrollo, puede servir para probar rapidamente la integracion con librerias como transformers o vLLM.
- Analisis de alucinaciones: su tendencia a producir contenido incorrecto lo convierte en un caso de estudio para investigar los limites de los modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la perdida de validacion de 4,140625 por token sobre el conjunto de validacion de OpenWebText. No se dispone de comparaciones con otros modelos en la documentacion oficial.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (el modelo ocupa aproximadamente 115 MB en pesos). Cabe en cualquier GPU moderna, incluso en CPUs.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tambien puede ejecutarse en CPU sin problemas.
- Compatibilidad con consumer GPU: si, cualquier GPU de consumo (por ejemplo, GTX 1650, RTX 3060) puede ejecutarlo sin dificultad.
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp, Ollama y TGI, aunque su tamano hace que la latencia sea minima en cualquier hardware.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamano, se espera una generacion de cientos de tokens por segundo en GPU y decenas en CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de tamano similar. Como referencia, modelos como GPT-2 small (124M) o Pythia-70M tienen mas parametros y contexto, pero no hay metricas publicas que permitan una comparacion directa con este checkpoint. La licencia y disponibilidad tampoco estan especificadas, por lo que la comparativa no es posible con la informacion actual.

## Limitaciones y advertencias

- Modelo educativo: no esta disenado para uso en produccion; su calidad de generacion es baja y puede producir texto incoherente o repetitivo.
- Alucinaciones frecuentes: al ser un modelo pequeno, es muy propenso a inventar informacion o generar contenido incorrecto.
- Contexto muy limitado: solo 256 tokens, lo que impide manejar conversaciones largas o documentos extensos.
- Idiomas no especificados: aunque el dataset es en ingles, no hay garantia de soporte multilingue.
- Licencia no disponible: no se indica bajo que licencia se distribuye, lo que puede limitar su uso comercial o derivado.
- Sin soporte de herramientas ni agentes: no implementa function calling ni razonamiento multi-paso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/balalida/gpt-22M-owt
- Dataset de entrenamiento: https://huggingface.co/datasets/Skylion007/openwebtext
