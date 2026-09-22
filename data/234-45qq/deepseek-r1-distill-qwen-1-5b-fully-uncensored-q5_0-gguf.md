# 234-45Qq/DeepSeek-R1-Distill-Qwen-1.5B-Fully-Uncensored-Q5_0-GGUF

## Resumen

Este repositorio contiene una conversión a formato GGUF, con cuantización Q5_0, del modelo nicoboss/DeepSeek-R1-Distill-Qwen-1.5B-Fully-Uncensored, que a su vez es un ajuste fino del destilado DeepSeek-R1-Distill-Qwen-1.5B de DeepSeek. El resultado es un modelo conversacional denso de 1.776.255.488 parámetros (unos 1,78 mil millones) distribuido en un único archivo de aproximadamente 1,3 GB, pensado para inferencia local mediante llama.cpp y su ecosistema. La conversión la publica el usuario 234-45Qq desde el espacio GGUF-my-repo de ggml.ai.

La característica diferencial no es su tamaño, sino su condición de "fully uncensored": el ajuste fino se realizó sobre el dataset Guilherme34/uncensor, con el objetivo explícito de eliminar los mecanismos de rechazo y las salvaguardas de contenido del modelo original. Esto lo sitúa en una categoría muy concreta: modelos pequeños, ejecutables en hardware de consumo, orientados a generación de texto sin filtros editoriales y a experimentación en seguridad y alineación.

Su relevancia práctica es doble. Por un lado, un modelo de 1,78 B en Q5_0 ocupa poco más de un gigabyte y puede ejecutarse íntegramente en CPU o en GPU de gama baja, lo que lo convierte en una opción viable para entornos sin acelerador dedicado y para despliegues offline. Por otro, al carecer de alineación de seguridad, permite estudiar de forma controlada cómo se comporta un modelo destilado de razonamiento cuando se le retiran las restricciones, algo de interés para red-teaming y evaluación de riesgos. No hay descargas ni valoraciones registradas en el momento de redactar esta ficha, por lo que se trata de un artefacto sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2.5 (inferido de la nomenclatura del modelo base; no confirmado en la información proporcionada) |
| Parámetros totales | 1.776.255.488 (~1,78 B), dato procedente de safetensors |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la información proporcionada; el ancestro Qwen2.5-1.5B declara 32.768 tokens nativos en su configuración pública |
| Tipos de cuantización | Q5_0 (GGUF) en este repositorio; el conversor GGUF-my-repo permite generar otras cuantizaciones |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (Q5_0); el modelo base se distribuye además como adaptador PEFT en safetensors |
| Tamaño del repositorio | 1,3 GB |
| Modelo base | nicoboss/DeepSeek-R1-Distill-Qwen-1.5B-Fully-Uncensored |
| Dataset de ajuste declarado | Guilherme34/uncensor |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La cadena de dependencias que documentan los tags del repositorio es la siguiente: se parte de deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, un destilado del modelo de razonamiento DeepSeek-R1 sobre la arquitectura Qwen2.5-1.5B; sobre él se entrena un adaptador LoRA (de ahí los tags `peft` y `generated_from_trainer`) usando el dataset Guilherme34/uncensor, dando lugar a nicoboss/DeepSeek-R1-Distill-Qwen-1.5B-Fully-Uncensored; finalmente, ese modelo se convierte a GGUF con cuantización Q5_0 mediante llama.cpp y el espacio GGUF-my-repo. La información disponible no detalla el número de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO posteriores al ajuste con LoRA.

Al tratarse de un destilado de la familia R1, es razonable esperar el patrón de razonamiento característico de estos modelos, con una fase de cadena de pensamiento antes de la respuesta final. Conviene señalar, no obstante, que el proceso de "descensura" mediante LoRA sobre un dataset reducido puede degradar capacidades generales del modelo original, y que no se ha publicado ninguna evaluación que cuantifique ese posible deterioro. La cuantización Q5_0 introduce además una pérdida de precisión adicional respecto a los pesos originales en safetensors.

## Capacidades

- Generación de texto conversacional multi-turno, con el tag `conversational` declarado por el autor.
- Razonamiento en cadena de pensamiento heredado del destilado de DeepSeek-R1, orientado a problemas de lógica y matemáticas elementales.
- Generación y explicación de código en tareas sencillas, limitada por el tamaño del modelo.
- Ausencia deliberada de filtros de rechazo: el modelo está ajustado para no negarse a responder ante peticiones que otros modelos alineados rechazarían.
- Conversión a GGUF que habilita ejecución en llama.cpp, llama-server y herramientas compatibles.
- Tag `endpoints_compatible`, que indica compatibilidad declarada con los endpoints de HuggingFace.
- No hay evidencia en la información proporcionada de soporte de tool calling, function calling, capacidades de agente, visión, audio ni multilingüismo explícito.

## Casos de uso

- Asistente de escritorio totalmente offline: el archivo Q5_0 de 1,3 GB puede cargarse con llama-server en un portátil sin GPU dedicada y exponerse como API compatible con OpenAI para integrarse en herramientas de escritorio, sin enviar datos a ningún servicio externo.
- Escritura de ficción con temática sensible: al no aplicar rechazos automáticos, es adecuado para redactar narrativa que aborde violencia, contenido explícito o temas controvertidos, donde un modelo alineado interrumpiría la generación.
- Red-teaming y evaluación de alineación: sirve como referencia de "modelo sin salvaguardas" para comparar tasas de rechazo, toxicidad y adherencia a instrucciones frente a su ancestro alineado, en el marco de estudios de seguridad.
- Clasificación y anotación de contenido crudo: procesamiento por lotes de reseñas, hilos de foro o comentarios que contienen lenguaje soez o material sensible, tareas en las que un modelo con filtros puede degradar su rendimiento al negarse a procesar la entrada.
- Prototipado rápido en local: validar prompts, plantillas de chat y flujos de razonamiento antes de escalar a un modelo mayor, gracias a su huella de memoria reducida y a la velocidad de iteración en hardware modesto.
- Generación aumentada por recuperación sobre corpus privados: con 1,3 GB de pesos, puede convivir en la misma GPU que el índice vectorial y el resto del pipeline, útil en entornos con requisitos de confidencialidad.
- Aplicaciones embebidas y periféricos: al caber en CPU y en GPUs integradas, es viable en mini-PC, dispositivos tipo Raspberry Pi 5 o sistemas empotrados para generación de texto asistida sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card declara el nombre del modelo con una lista de resultados vacía (`"results": []`), por lo que no existen métricas de MMLU, GSM8K, HumanEval ni de ningún otro conjunto de evaluación aportadas por el autor. Tampoco se han publicado evaluaciones de terceros asociadas a este repositorio, que registra cero descargas.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 1,3 GB en Q5_0 (unos 5 bits por parámetro sobre 1,78 B), coherente con el tamaño del repositorio.
- VRAM estimada para inferencia: en torno a 1,5-1,8 GB con contexto de 2.048 tokens, y aproximadamente 2,3 GB si se emplea la ventana completa de 32.768 tokens del ancestro con caché KV en f16 (estimación derivada del tamaño de los pesos y de la arquitectura del modelo base, no una medición publicada).
- GPU compatibles: cualquier GPU con 4 GB o más de VRAM, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 y equivalentes. También funciona con offload parcial o total a CPU.
- Cabe en GPU de consumo: sí, con holgura, incluso en iGPU con memoria unificada y en Apple Silicon.
- Ejecución en CPU: viable para uso interactivo, aunque la información disponible no incluye mediciones de latencia ni de throughput.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server, tal como documenta la propia model card), Ollama importando el GGUF con un Modelfile, LM Studio, koboldcpp y llamafile. vLLM y TGI no ofrecen soporte nativo y estable de GGUF, por lo que no se recomiendan para este artefacto.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medición de tokens por segundo.

## Comparativa con modelos similares

Los datos de las alternativas proceden de la documentación pública de esos modelos y no de la información proporcionada para esta ficha; los valores de rendimiento se omiten por no disponer de evaluaciones comparables.

| Modelo | Parámetros | Contexto | Licencia | Orientación | Formatos |
|---|---|---|---|---|---|
| Este modelo (Q5_0 GGUF) | 1,78 B | No disponible | MIT | Conversacional sin filtros, destilado de R1 | GGUF Q5_0 |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | 32.768 tokens (ampliable con YaRN) | MIT | Razonamiento destilado, alineado | Safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens | Apache-2.0 | Instrucciones generales, alineado | Safetensors, GGUF |
| Llama-3.2-1B-Instruct | ~1,24 B | 128.000 tokens | Llama 3.2 Community License | Instrucciones generales, alineado | Safetensors, GGUF |

La diferencia sustantiva frente a las tres alternativas no es de rendimiento, sino de política de contenido: es el único de la lista sin alineación de seguridad, y también el único sin evaluación publicada. Frente al destilado original de DeepSeek mantiene la licencia MIT y el mismo tamaño, pero sustituye el ajuste alineado por un LoRA sobre Guilherme34/uncensor.

## Limitaciones y advertencias

- Ausencia total de salvaguardas: el modelo ha sido ajustado explícitamente para eliminar los rechazos, por lo que puede generar contenido dañino, ilegal, violento o sexual sin advertencia. No es apto para aplicaciones de cara al público ni para entornos regulados sin una capa de moderación externa.
- Riesgo elevado de alucinación: con 1,78 B de parámetros, la precisión factual es baja y la propensión a inventar datos en tareas de conocimiento es alta.
- Sin evaluación publicada: no existen benchmarks ni estudios de terceros que respalden ninguna afirmación de calidad. Cero descargas y cero likes implican ausencia de validación comunitaria.
- Idiomas no declarados: se desconoce el soporte multilingüe real, más allá de lo que herede de Qwen2.5.
- Posible degradación por el ajuste: el entrenamiento LoRA sobre un dataset de descensura puede haber erosionado capacidades del destilado original, algo que nadie ha medido.
- Pérdida por cuantización: Q5_0 no es una cuantización sin pérdida; respecto a los pesos en safetensors introduce un error adicional no cuantificado.
- Inconsistencia documental: el README del repositorio hace referencia a `ApexReign/DeepSeek-R1-Distill-Qwen-1.5B-Fully-Uncensored-Q5_0-GGUF`, mientras que el identificador real es `234-45Qq/...`. Los comandos de ejemplo pueden fallar si se copian literalmente.
- Contexto no documentado en esta ficha: la model card no especifica la ventana de contexto del artefacto, y el ejemplo de llama-server emplea `-c 2048`, muy por debajo de los 32.768 tokens del ancestro.
- Licencia: MIT sobre los pesos publicados, permisiva para uso comercial, pero conviene verificar las condiciones del dataset Guilherme34/uncensor y del modelo base antes de un despliegue en producción.
- Fecha de creación declarada en 2026-09-22, sin actualizaciones posteriores registradas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/234-45Qq/DeepSeek-R1-Distill-Qwen-1.5B-Fully-Uncensored-Q5_0-GGUF
- Modelo base del ajuste: https://huggingface.co/nicoboss/DeepSeek-R1-Distill-Qwen-1.5B-Fully-Uncensored
- Repositorio citado en el README (identificador distinto al real): https://huggingface.co/ApexReign/DeepSeek-R1-Distill-Qwen-1.5B-Fully-Uncensored-Q5_0-GGUF
- Ancestro destilado de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Espacio de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Dataset de ajuste declarado: https://huggingface.co/datasets/Guilherme34/uncensor
- Artículo de DeepSeek-R1 (arXiv:2501.12948): https://arxiv.org/abs/2501.12948
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a markt.de, un portal alemán de anuncios clasificados sin relación con el modelo.
