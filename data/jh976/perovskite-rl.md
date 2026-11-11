# JH976/Perovskite-RL

## Resumen

Perovskite-RL es un modelo de lenguaje adaptado al dominio de las perovskitas fotovoltaicas y el diseno de aditivos moleculares, desarrollado por JH976. Se construye sobre Qwen3-32B mediante un pipeline de ajuste supervisado (SFT) con LoRA seguido de aprendizaje por refuerzo con GRPO. Su proposito no es el uso generalista, sino actuar como el componente generador de descriptores mecanisticos dentro de LEAP, un framework de descubrimiento cerrado de aditivos para precursores de perovskita que combina el modelo con optimizacion bayesiana para priorizar candidatos.

El modelo tiene 32.762.123.264 parametros (32,7 mil millones) y se distribuye en formato safetensors con licencia Apache 2.0. La relevancia actual radica en su caracter de ejemplo de adaptacion de un LLM de gran tamano a un dominio cientifico muy especifico mediante RL con recompensas disenadas para correccion de respuesta, cumplimiento de formato, recall de contenido y calidad del razonamiento.

La informacion publica es limitada: la model card no detalla la longitud de contexto nativa, los idiomas soportados ni el pipeline de inferencia. Los datos disponibles se centran en el procedimiento de entrenamiento y en un unico benchmark de consistencia mecanistica, donde el modelo alcanza un 78,1 % (25 de 32).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3-32B) |
| Parametros totales | 32.762.123.264 (32,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento GRPO usa max length 8192) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-32B, un transformer denso de 32,7 mil millones de parametros, y se adapta en dos fases. La primera es un ajuste supervisado con LoRA sobre 90.749 ejemplos de entrenamiento y 1.000 de validacion, con learning rate de 3e-5, 2 epocas, batch size por dispositivo de 1, acumulacion de gradiente de 16, scheduler coseno y semilla 42. Los datos incluyen razonamiento mecanistico derivado de literatura, razonamiento sobre propiedades moleculares y tareas de seleccion de aditivos.

La segunda fase aplica GRPO (Group Relative Policy Optimization) sobre 5.800 ejemplos, con LoRA de rango 16, alpha 32, dropout 0,05, learning rate 2e-5, 1 epoca, 8 generaciones por prompt y longitud maxima de 8192 tokens. La funcion de recompensa combina correccion de la respuesta, cumplimiento de formato, recall de contenido y calidad del razonamiento. El entrenamiento se realizo con ms-swift, Transformers y PEFT. No se especifica el volumen total de tokens de entrenamiento ni la composicion detallada del dataset mas alla de las cifras de ejemplos.

## Capacidades

- Generacion de texto y razonamiento especializado en mecanismos de aditivos para perovskitas.
- Generacion de descriptores mecanisticos que alimentan la priorizacion bayesiana en LEAP.
- Razonamiento sobre propiedades moleculares y seleccion de aditivos candidatos.
- Razonamiento basado en literatura cientifica del dominio fotovoltaico.
- Cumplimiento de formato estricto en las respuestas, reforzado durante el entrenamiento GRPO.
- Asistencia a flujos de cribado computacional.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Descubrimiento de aditivos para precursores de perovskita: el modelo genera descriptores mecanisticos que se pasan a un optimizador bayesiano para priorizar candidatos, tal como se describe en el framework LEAP.
- Analisis de mecanismos en literatura cientifica: dado un conjunto de papers, el modelo identifica explicaciones mecanisticas especificas en lugar de recurrir a priors genericos de ciencia de materiales, lo que es util para revisiones sistematicas asistidas.
- Generacion de hipotesis de aditivos moleculares: produce listas razonadas de moleculas candidatas con justificacion mecanistica, que el investigador filtra antes de la validacion experimental.
- Asistencia a cribado computacional: integrado como generador de hipotesis previo a calculos DFT o simulaciones moleculares, reduce el espacio de busqueda.
- Razonamiento sobre propiedades moleculares: responde consultas sobre relaciones estructura-propiedad en el contexto de aditivos de perovskita.
- Construccion de datasets de razonamiento cientifico: sus salidas, revisadas por expertos, pueden servir para aumentar corpus de entrenamiento en el dominio.
- Evaluacion de consistencia mecanistica: puede usarse como referencia en benchmarks que miden si un modelo cita mecanismos especificos de papers frente a generalidades.

## Benchmarks y rendimiento

| Benchmark | Modelo | Resultado |
|---|---|---|
| Consistencia mecanistica (32 preguntas) | Perovskite-RL | 25/32 (78,1 %) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico benchmark reportado mide la capacidad de identificar explicaciones mecanisticas especificas de papers frente a priors genericos de ciencia de materiales.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 65 GB solo para pesos, mas overhead de KV cache; se recomienda un minimo de 80 GB.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB, o configuraciones multi-GPU.
- Cuantizacion a 8 bits: alrededor de 33 GB, viable en una A100 40 GB o en dos RTX 4090 de 24 GB.
- Cuantizacion a 4 bits: alrededor de 17-20 GB, cabe en una RTX 4090 de 24 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama para versiones cuantizadas; Transformers con PEFT para cargar los adaptadores originales. No se confirman formatos GGUF publicados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Perovskite-RL | 32,7 B | no disponible | Perovskitas y aditivos moleculares | Apache 2.0 | Hugging Face |
| Qwen3-32B (base) | 32,7 B | no disponible en esta ficha | Generalista | Apache 2.0 | Hugging Face |
| Modelos cientificos de dominio (p. ej. adaptaciones de Llama o Mistral) | variable | variable | Variable | variable | variable |

La comparativa con alternativas especificas de dominio cientifico no esta disponible en la informacion proporcionada. El referente natural es Qwen3-32B, del que hereda arquitectura y tamano pero del que se diferencia por el ajuste SFT + GRPO en el dominio de perovskitas.

## Limitaciones y advertencias

- El modelo no sustituye la validacion experimental; sus sugerencias deben tratarse como hipotesis.
- Las sugerencias de aditivos pueden ser quimicamente invalidas, comercialmente no disponibles o experimentalmente inadecuadas.
- Puede sobrestimar la confianza mecanistica cuando la evidencia es incompleta.
- Riesgo de alucinacion en citas de mecanismos o propiedades moleculares no presentes en la literatura de entrenamiento.
- Longitud de contexto e idiomas soportados no documentados; el entrenamiento GRPO limita a 8192 tokens, lo que puede restringir entradas mas largas.
- Dataset de entrenamiento pequeno (90.749 ejemplos SFT y 5.800 GRPO), lo que puede limitar la generalizacion fuera del dominio.
- Licencia Apache 2.0 permite uso comercial, pero el uso previsto declarado es de investigacion; conviene evaluar el rendimiento fuera del dominio antes de desplegarlo en produccion.
- El benchmark reportado es muy reducido (32 preguntas), por lo que la cifra del 78,1 % debe interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JH976/Perovskite-RL
- Paper publicado (Communications Materials, 2026): https://doi.org/10.1038/s43246-026-01407-3
- Preprint en arXiv: https://arxiv.org/abs/2605.20242
- Repositorio LEAP con datos y benchmarks: https://github.com/WD928/LEAP
- Dataset de entrenamiento: https://huggingface.co/datasets/JH976/Perovskite-RL
