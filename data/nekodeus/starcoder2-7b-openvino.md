# Nekodeus/starcoder2-7b-openvino

## Resumen
El modelo Nekodeus/starcoder2-7b-openvino es una conversión al formato OpenVINO IR del modelo base bigcode/starcoder2-7b, un transformer decoder de 7.000 millones de parámetros especializado en generación de código. Desarrollado por el usuario Nekodeus, esta versión aplica cuantización INT8 únicamente a los pesos mediante NNCF, lo que reduce el tamaño del repositorio a 7,2 GB y permite su despliegue en CPU con OpenVINO. La conversión se realizó con optimum-intel 2.2.0, OpenVINO 2026.4.1 y transformers 5.16.1.

El modelo está pensado para tareas de compleción de código, incluyendo fill-in-the-middle, con un contexto declarado de 8k tokens. Mantiene la licencia BigCode OpenRAIL-M v1 del modelo original. Su relevancia radica en facilitar el uso de StarCoder2-7B en entornos sin GPU, gracias a la optimización de OpenVINO para inferencia en CPU, aunque no se dispone de información sobre idiomas soportados ni de resultados de benchmarks en la model card.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Starcoder2ForCausalLM) |
| Parámetros totales | 7.000 millones |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (8k, según la model card) |
| Tipos de cuantización | INT8 weight-only (NNCF); activaciones FP16/FP32 |
| Idiomas soportados | no disponible |
| Licencia | bigcode-openrail-m (BigCode OpenRAIL-M v1) |
| Formato de pesos | OpenVINO IR (INT8) |

## Arquitectura y entrenamiento
Esta ficha describe la conversión a OpenVINO IR del modelo base bigcode/starcoder2-7b. El modelo original es un transformer decoder de 7.000 millones de parámetros desarrollado por BigCode, entrenado para generación de código. No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens o si se aplicaron técnicas de RLHF/DPO en la información disponible. La conversión mantiene la arquitectura del modelo base y aplica una cuantización INT8 solo a los pesos (weight-only) mediante NNCF, dejando las activaciones en FP16/FP32 según el trazado. El proceso se realizó con optimum-intel 2.2.0, OpenVINO 2026.4.1 y transformers 5.16.1, en un entorno CPU-only y sin conexión. La especialización declarada es la compleción de código con fill-in-the-middle y un contexto de 8k tokens.

## Capacidades
- Generación de texto y compleción de código.
- Soporte de fill-in-the-middle (FIM) para completar código entre un prefijo y un sufijo.
- Especialización en lenguajes de programación (no se especifica cuáles en la información disponible).
- No se menciona soporte de tool calling o function calling.
- No se menciona soporte de agentes o razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se mencionan capacidades de visión, audio ni modos de pensamiento explícitos.

## Casos de uso
- Autocompletado de código en IDE: el modelo puede sugerir la continuación de líneas o bloques de código mientras el desarrollador escribe, aprovechando su especialización en fill-in-the-middle y su contexto de 8k tokens.
- Generación de funciones a partir de docstrings: dado un comentario descriptivo, el modelo puede generar la implementación correspondiente en el lenguaje de programación adecuado.
- Generación de tests unitarios: el modelo puede producir casos de prueba para funciones existentes, lo que acelera el desarrollo y mejora la cobertura.
- Explicación de código: puede generar comentarios o documentación explicativa para fragmentos de código complejos.
- Traducción entre lenguajes de programación: aunque no está explícitamente entrenado para ello, su capacidad de generación de código puede emplearse para convertir fragmentos de un lenguaje a otro.
- Refactorización asistida: el modelo puede proponer versiones alternativas de funciones o fragmentos de código para mejorar la legibilidad o el rendimiento.
- Integración en pipelines de CI/CD: al ejecutarse en CPU con OpenVINO, puede integrarse en servidores sin GPU para tareas de generación de código automatizada, como la creación de plantillas o la revisión de código.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: al ser una cuantización INT8 de 7B, los pesos ocupan aproximadamente 7 GB. Con activaciones y caché KV para 8k tokens, se estima un consumo total de 10-12 GB de memoria (RAM o VRAM) en FP16/FP32. Para contexto más corto, puede reducirse.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 4080, A100, H100) para un rendimiento óptimo. También puede ejecutarse en GPUs con 8 GB si se reduce el contexto o se usa una cuantización más agresiva (no disponible en este repositorio).
- ¿Cabe en consumer GPU? Sí, en GPUs de gama alta con 12 GB o más. En GPUs con 8 GB puede ser ajustado y requerir contexto reducido.
- Opciones de despliegue: OpenVINO GenAI (C++), optimum-intel (Python), y potencialmente otros runtimes que soporten OpenVINO IR. No se proporcionan pesos en safetensors o GGUF en este repositorio.
- Latencia y throughput estimados: no disponibles. Al estar optimizado para CPU, el rendimiento dependerá del hardware; en CPU modernas puede ser adecuado para inferencia interactiva, pero no se especifican cifras.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Nekodeus/starcoder2-7b-openvino | 7B | 8k | BigCode OpenRAIL-M v1 | OpenVINO IR INT8 | HuggingFace |
| bigcode/starcoder2-7b | 7B | 16k | BigCode OpenRAIL-M v1 | safetensors | HuggingFace |
| CodeLlama-7B | 7B | 16k | Llama 2 | safetensors | HuggingFace (Meta) |
| DeepSeek-Coder-7B | 7B | 16k | DeepSeek License | safetensors | HuggingFace |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no disponibles en la información proporcionada. Al ser un modelo de código, puede reproducir sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir código incorrecto o inventar APIs inexistentes. La verificación humana es recomendable.
- Limitaciones de contexto: el contexto declarado es de 8k tokens, inferior al de otras versiones del modelo base que soportan 16k. Esto puede limitar tareas que requieran ventanas más amplias.
- Limitaciones de idioma: no se especifican los lenguajes naturales soportados. El modelo está especializado en código, pero se desconoce su comportamiento en otros idiomas.
- Restricciones de licencia: la licencia BigCode OpenRAIL-M v1 impone restricciones de uso, incluyendo la prohibición de usos dañinos o malintencionados. Es necesario revisar los términos completos antes de un uso comercial.
- Caveats para producción: la cuantización INT8 puede degradar ligeramente la calidad de las generaciones en comparación con el modelo en FP16. Además, el formato OpenVINO IR está atado al ecosistema OpenVINO, lo que puede limitar la portabilidad a otros runtimes. La model card no proporciona información sobre el proceso de cuantización (calibración, dataset) ni sobre la pérdida de precisión.

## Enlaces
- [Nekodeus/starcoder2-7b-openvino en HuggingFace](https://huggingface.co/Nekodeus/starcoder2-7b-openvino)
- [bigcode/starcoder2-7b (modelo base)](https://huggingface.co/bigcode/starcoder2-7b)
