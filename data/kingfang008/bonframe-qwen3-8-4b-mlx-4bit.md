# kingfang008/Bonframe-Qwen3.8-4B-MLX-4bit

## Resumen

Bonframe-Qwen3.8-4B-MLX-4bit es una conversión a formato MLX cuantizado en 4 bits del modelo empero-ai/Qwen3.8-4B-Distill, publicada por el usuario kingfang008. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es una exportación de pesos con fines de inferencia en hardware de Apple Silicon. El modelo base, desarrollado por Empero AI, deriva a su vez de la familia Qwen3.5-4B, según se indica en la propia model card.

El problema que resuelve es práctico: permitir ejecutar un transformer de 4.205.751.296 parámetros (4,2 mil millones) en equipos con memoria unificada relativamente modesta, sin necesidad de GPU dedicada. Con cuantización afín de 4 bits, grupo de 64 y una media de 4,503 bits por peso, el repositorio ocupa 2,4 GB, lo que lo hace viable en un portátil con Apple Silicon.

Su relevancia es limitada y muy específica: cuenta con cero descargas y cero "likes" en el momento de redactar esta ficha, y no aporta capacidades nuevas respecto al modelo base. Es útil únicamente para quien necesite una versión lista para `mlx-lm` de este destilado concreto, con licencia Apache-2.0 heredada de la fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3.5 (derivado de Qwen3.5-4B segun la model card) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit afín (affine), group size 64, media de 4,503 bits por peso |
| Idiomas soportados | no disponible (los tags no declaran idiomas) |
| Licencia | Apache-2.0 (heredada del modelo fuente) |
| Formato de pesos | safetensors en formato MLX (solo texto) |
| Biblioteca de inferencia | mlx-lm |
| Version de conversion | mlx-lm 0.31.3 / MLX 0.32.3 |
| Revision del modelo fuente | c83cb7aa2999d2f35c43e9ae0634a30eb8985a1e |
| Tamano del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia Qwen3.5, según el tag `qwen3_5` y la indicación de la model card de que el modelo original de Empero AI está basado en Qwen3.5-4B. No se trata de una arquitectura MoE: el recuento de parámetros es único y no se declaran parámetros activos. Tampoco hay indicios de componentes de tipo SSM, híbridos o de atención lineal en la información disponible.

No hubo entrenamiento ni ajuste alguno por parte del autor de esta conversión. La model card lo afirma explícitamente: no hay reentrenamiento ni capacidades nuevas declaradas. El proceso se limita a la conversión de pesos con `mlx-lm` 0.31.3 sobre MLX 0.32.3, aplicando cuantización afín de 4 bits con grupo de 64. Se desconoce por completo la composición del dataset, el número de tokens de entrenamiento y si el destilado original empleó RLHF, DPO u otra técnica de alineación: esa información pertenece al modelo base y no está incluida en los datos proporcionados. La exportación es solo de texto, sin componentes multimodales.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` y la tarea declarada `text-generation`.
- Plantilla de chat y tokenizador procedentes del modelo preentrenado (`pre-trained tokenizer/chat template`), según la model card.
- Emisión de tokens de razonamiento antes de la respuesta: la model card advierte que "reasoning tokens may appear before the answer". No se especifica si existe un modo de pensamiento conmutable.
- Capacidad multilingüe: no disponible. Los idiomas soportados no se declaran en los tags ni en la model card.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no. La exportación es explícitamente "text-only".
- Cualquier otra capacidad especial: no disponible.

## Casos de uso

- Inferencia local en portátiles Apple Silicon: el modelo ocupa 2,4 GB en disco y está validado en un equipo con 16 GiB de memoria unificada, por lo que permite generar texto sin conexión ni GPU dedicada en un Mac moderno.
- Prototipado rápido de aplicaciones conversacionales: al cargarse directamente con `mlx-lm` mediante un único comando, sirve para validar prompts, plantillas de chat y flujos de conversación antes de pasar a un modelo mayor.
- Pruebas de integración de la familia Qwen3.5: útil para comprobar cómo se comportan la plantilla de chat y el tokenizador de Qwen3.5 en un pipeline MLX concreto.
- Documentación y generación de texto breve: tareas de resumen, reescritura o redacción asistida que no exijan contexto largo ni capacidades multimodales.
- Desarrollo de asistentes de escritorio offline: al no requerir red ni servicios externos, encaja en aplicaciones de escritorio que necesiten un generador de texto embebido con licencia permisiva.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad de la cuantización afín de 4 bits frente a los pesos completos del modelo base, dentro de cargas de trabajo reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente indica que el modelo fue validado en un Apple M6 de 16 GiB con `mlx-lm` nativo, y advierte de forma explícita que las mediciones son específicas de la carga de trabajo y no constituyen una evaluación de calidad. No se aportan cifras de MMLU, HumanEval, GSM8K, latencia ni throughput.

## Requisitos de hardware

- Memoria: el repositorio pesa 2,4 GB en disco. Con 4-bit (4,503 bits por peso) más el overhead de la caché KV y del runtime, una estimación conservadora de memoria unificada necesaria para inferencia ronda los 3-4 GB, aunque el fabricante no publica una cifra exacta.
- Plataforma: requiere Apple Silicon. El formato es MLX, por lo que no es ejecutable en GPU NVIDIA o AMD sin una reconversión previa a otro formato (por ejemplo GGUF o safetensors estándar).
- GPU recomendadas: no se declaran. La conversión está pensada para memoria unificada de Apple, no para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: el modelo no está destinado a GPUs de consumo x86; en ese entorno habría que recuantizarlo o convertirlo a otro formato.
- Validación declarada: Apple M6 con 16 GiB de memoria unificada, usando `mlx-lm` nativo.
- Opciones de despliegue: `mlx-lm` es la vía soportada. No se ofrecen pesos en GGUF ni se menciona compatibilidad directa con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion incluida | Licencia | Formato |
|---|---|---|---|---|---|
| Bonframe-Qwen3.8-4B-MLX-4bit | 4,2 B | no disponible | 4-bit affine (MLX) | Apache-2.0 | safetensors MLX |
| empero-ai/Qwen3.8-4B-Distill (modelo base) | no disponible en los datos | no disponible | no disponible | Apache-2.0 | no disponible |
| Qwen3.5-4B (familia de origen) | no disponible en los datos | no disponible | no disponible | no disponible | no disponible |
| Alternativas equivalentes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes sobre el modelo base ni sobre otras conversiones comparables para establecer una comparación cuantitativa fiable. No se inventan cifras de rendimiento ni de contexto.

## Limitaciones y advertencias

- No es un modelo nuevo: es una recuantización de un destilado ya existente. El autor declara explícitamente que no hay reentrenamiento ni capacidades nuevas.
- Sin adopción verificable: cero descargas y cero "likes" en el momento de redactar la ficha, por lo que no hay evidencia externa de calidad ni de estabilidad en producción.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje de este tamaño; no se aportan evaluaciones que lo cuantifiquen.
- Sesgos: no disponibles. No se publica ninguna evaluación de sesgos.
- Longitud de contexto desconocida: no se declara la ventana máxima, lo que impide garantizar el comportamiento en conversaciones largas o documentos extensos.
- Idiomas no declarados: no se puede asegurar un rendimiento correcto en castellano u otros idiomas más allá de lo que herede el modelo base.
- Emisión de tokens de razonamiento: la model card advierte de que pueden aparecer antes de la respuesta, lo que obliga a filtrarlos o gestionarlos si se integran en una interfaz de usuario.
- Restricciones de plataforma: al ser MLX puro, no es portable directamente a entornos x86 con GPU NVIDIA; requiere conversión previa.
- Licencia: Apache-2.0, permisiva y compatible con uso comercial, heredada del modelo fuente. Aun así, conviene verificar las condiciones del modelo base de Empero AI por si añadiese cláusulas adicionales.
- Advertencia para producción: al no haber benchmarks, validaciones independientes ni métricas de latencia, no es recomendable desplegarlo en un sistema de producción crítico sin una evaluación propia.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/kingfang008/Bonframe-Qwen3.8-4B-MLX-4bit
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
