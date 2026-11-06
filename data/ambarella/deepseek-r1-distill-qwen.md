# Ambarella/Deepseek-R1-Distill-Qwen

## Resumen

DeepSeek-R1-Distill-Qwen es una familia de modelos de razonamiento destilados a partir de DeepSeek-R1 sobre una base Qwen, publicada en el repositorio de HuggingFace del fabricante de semiconductores Ambarella. El modelo original fue desarrollado por DeepSeek; Ambarella distribuye aquí artefactos empaquetados (ficheros `.tar`) de las variantes de 7B y 1.5B, orientados a su despliegue en los aceleradores de visión N1-655 y CV72 mediante el SDK Cooper (versión 2.5.4) y Cooper Foundry (2.3). No se trata de un modelo entrenado por Ambarella, sino de una redistribución optimizada para hardware embebido.

El objetivo declarado es conservar la capacidad de razonamiento lógico, matemático y de código de DeepSeek-R1 reduciendo el coste de inferencia, de modo que pueda ejecutarse en factores de forma desplegables (copilotos empresariales, asistentes de código, análisis estructurado). La relevancia actual radica en que permite llevar razonamiento tipo cadena de pensamiento a dispositivos de borde en lugar de depender exclusivamente de GPUs de centro de datos.

La información pública del repositorio es muy limitada: no se detallan parámetros exactos, contexto, idiomas ni licencia más allá de las referencias a los pesos originales de DeepSeek. La mayor parte de las especificaciones técnicas deben tomarse de los modelos originales de DeepSeek-R1-Distill-Qwen, no de esta publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen, destilado de DeepSeek-R1); detalles finos no disponibles en el repositorio |
| Parametros totales | Dos variantes: 1.5B y 7B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el repositorio (la model card original de DeepSeek-R1-Distill-Qwen-7B indica 131 072 tokens; no confirmado para estos artefactos) |
| Tipos de cuantizacion | no disponible (los `.tar` son artefactos precompilados para hardware Ambarella) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio (los pesos originales de DeepSeek-R1-Distill-Qwen se distribuyen bajo licencia MIT según el repositorio de DeepSeek; verificar antes de uso comercial) |
| Formato de pesos | `.tar` con artefactos para dispositivos N1-655 (7B) y CV72 (1.5B); pesos PyTorch originales disponibles en el repositorio de DeepSeek |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a los modelos DeepSeek-R1-Distill-Qwen, que son modelos Qwen (transformer decoder-only) ajustados mediante destilación a partir de las trazas de razonamiento generadas por DeepSeek-R1. El proceso de destilación transfiere el comportamiento de cadena de pensamiento del modelo profesor al alumno, de modo que el modelo menor aprende a producir razonamientos intermedios antes de la respuesta final. Los detalles exactos de tokens de entrenamiento, composición del dataset y fases de RLHF/DPO no se especifican en el repositorio de Ambarella y deben consultarse en el paper de DeepSeek-R1 y en las model cards originales.

Ambarella no aporta información sobre reentrenamiento ni ajuste fino adicional: su contribución es el empaquetado y la optimización de los pesos para los aceleradores N1-655 y CV72 a través de Cooper SDK 2.5.4 y Cooper Foundry 2.3. No se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal, etc.) en esta publicación.

## Capacidades

- Generación de texto con razonamiento explícito (cadena de pensamiento) heredado de DeepSeek-R1.
- Razonamiento matemático y resolución de problemas analíticos.
- Generación y asistencia de código, según la model card.
- Análisis estructurado y tareas de razonamiento lógico.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo de razonamiento encadenado es afín a flujos agénticos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (visión, audio): no disponibles.

## Casos de uso

- Asistente de código en el borde: la variante 1.5B puede desplegarse en el acelerador CV72 para autocompletado y explicación de código en entornos con conectividad limitada, aprovechando el razonamiento destilado sin depender de la nube.
- Copiloto empresarial on-premise: la variante 7B sobre N1-655 permite integrar un asistente de razonamiento en infraestructura local, útil en sectores con requisitos de confidencialidad de datos.
- Tutoría matemática interactiva: el modelo genera pasos intermedios de razonamiento, lo que facilita explicar la resolución de problemas paso a paso en aplicaciones educativas.
- Análisis estructurado de documentos: extracción de conclusiones y comparaciones a partir de texto técnico o financiero, con la ventaja de ejecutarse en hardware de bajo consumo.
- Automatización de soporte técnico especializado: conversaciones multi-turno que requieren razonamiento sobre configuraciones o diagnósticos, desplegables en dispositivos de borde.
- Prototipado de pipelines de razonamiento en investigación: usar los pesos PyTorch originales de DeepSeek-R1-Distill-Qwen-1.5B/7B para experimentar con destilación y evaluación antes de portar a hardware Ambarella.
- Sistemas empotrados con requisitos de latencia: al ejecutarse sobre aceleradores dedicados, permite respuestas locales sin latencia de red en aplicaciones industriales o de automoción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de Ambarella no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas de latencia o throughput. Para referencias de rendimiento de los modelos base, consultar las model cards originales de DeepSeek-R1-Distill-Qwen-1.5B y 7B.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para estos artefactos; para los pesos PyTorch originales, la variante 7B en FP16 requiere aproximadamente 14-16 GB y la 1.5B en FP16 unos 3-4 GB (estimación estándar, no confirmada en el repositorio).
- GPU recomendadas: no documentadas; el repositorio está orientado a los aceleradores Ambarella N1-655 (7B) y CV72 (1.5B).
- Compatibilidad con GPU de consumo: no confirmada para estos artefactos; los pesos originales de DeepSeek-R1-Distill-Qwen-7B pueden ejecutarse en GPUs de consumo con cuantización, pero no se detalla aquí.
- Opciones de despliegue: Cooper SDK 2.5.4 y Cooper Foundry 2.3 para hardware Ambarella. Para los pesos originales, las herramientas habituales (vLLM, llama.cpp, Ollama, TGI) no están documentadas en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ambarella/Deepseek-R1-Distill-Qwen (esta ficha) | 1.5B y 7B | no disponible | no disponible | Artefactos `.tar` para N1-655 y CV72 |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7B | 131 072 tokens (según model card original) | MIT (según repositorio de DeepSeek) | Pesos PyTorch en HuggingFace |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 131 072 tokens (según model card original) | MIT (según repositorio de DeepSeek) | Pesos PyTorch en HuggingFace |
| Qwen2.5-7B (base de la destilación) | 7B | 131 072 tokens | Apache 2.0 (según Qwen) | Pesos en HuggingFace |

La comparativa se limita a los modelos originales de los que deriva esta publicación, ya que no se dispone de datos de rendimiento propios de los artefactos de Ambarella.

## Limitaciones y advertencias

- La información pública es mínima: no se especifican licencia, idiomas, contexto ni cuantizaciones, lo que dificulta evaluar su idoneidad para producción.
- Los artefactos están empaquetados para hardware Ambarella concreto (N1-655 y CV72); no son portables directamente a otras plataformas sin conversión.
- Riesgo de alucinación inherente a los modelos de razonamiento destilados, especialmente en dominios especializados.
- Posibles sesgos heredados de los datos de entrenamiento de DeepSeek-R1 y Qwen; no documentados en este repositorio.
- La licencia no está declarada en el repositorio de Ambarella: es imprescindible verificar los términos de los pesos originales de DeepSeek antes de cualquier uso comercial.
- El modelo de razonamiento puede generar cadenas de pensamiento largas, lo que incrementa la latencia y el consumo de tokens en comparación con modelos no razonadores.
- No se documentan garantías de soporte, mantenimiento ni actualizaciones por parte de Ambarella más allá de las versiones de SDK indicadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ambarella/Deepseek-R1-Distill-Qwen
- Paper de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Repositorio del proyecto DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Pesos originales 7B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Pesos originales 1.5B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Artefacto N1-655 (7B): https://huggingface.co/Ambarella/Deepseek-R1-Distill-Qwen/blob/main/n1-655_deepseek_r1_distill_qwen_7B.tar
- Artefacto CV72 (1.5B): https://huggingface.co/Ambarella/Deepseek-R1-Distill-Qwen/blob/main/cv72_deepseek_r1_distill_qwen_1.5B.tar
