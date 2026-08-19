# Catniti/catrex-1.0

## Resumen

Catrex 1.0 es un modelo de lenguaje conversacional bilingüe (ruso e inglés) desarrollado por Catniti, con solo 65 millones de parámetros y entrenado desde cero. Está diseñado para tareas de generación de texto y chat, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Su principal interés radica en ser un modelo extremadamente ligero que puede ejecutarse en hardware modesto, incluso en CPU, lo que lo hace adecuado para prototipos, educación y entornos con recursos limitados.

El modelo utiliza una arquitectura tipo Llama (transformer decoder) y admite un contexto de 512 tokens, un valor muy reducido en comparación con modelos actuales. Fue entrenado con una mezcla de datasets públicos como fineweb-edu, ultrachat_200k, saiga_scored y OpenOrca-ru, durante 430 pasos. Aunque su rendimiento es limitado (perplejidad de 107.8), cumple una función didáctica y de experimentación para quienes quieran estudiar el entrenamiento de modelos pequeños desde cero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (tipo Llama) |
| Parametros totales | 64.819.008 (65M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | GGUF f16 (disponible en el repositorio) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer decoder estándar, similar a la familia Llama, aunque no se especifican detalles como número de capas, cabezas de atención o dimensiones ocultas. Fue entrenado desde cero, no como fine-tuning de un modelo preexistente, lo que explica su tamaño reducido y su corto historial de entrenamiento (430 pasos). Los datos de entrenamiento incluyen una combinación de corpus educativos (fineweb-edu), conversacionales (ultrachat_200k, saiga_scored) y de instrucciones en ruso (OpenOrca-ru). No se menciona el uso de técnicas de alineación como RLHF o DPO; el entrenamiento parece ser un preentrenamiento y ajuste conversacional básico con el formato ChatML.

## Capacidades

- Generación de texto conversacional en ruso e inglés.
- Soporte de chat multi-turno mediante plantilla ChatML (`<|im_start|>` y `<|im_end|>`).
- Inferencia ligera: puede ejecutarse en CPU sin GPU dedicada.
- Compatible con herramientas de inferencia como llama.cpp, LM Studio y transformers de Hugging Face.
- No incluye capacidades de tool calling, visión, audio ni razonamiento avanzado.

## Casos de uso

- Prototipado rápido de chatbots: por su tamaño reducido, es ideal para probar flujos conversacionales básicos en entornos de desarrollo sin requerir hardware potente.
- Educación en aprendizaje automático: sirve como ejemplo práctico para estudiar el entrenamiento de modelos de lenguaje desde cero, dado su tamaño manejable y su licencia permisiva.
- Experimentación con modelos bilingües: permite evaluar el comportamiento de un modelo pequeño en tareas de traducción o conversación en ruso e inglés, aunque con limitaciones claras.
- Integración en aplicaciones embebidas: su bajo consumo de memoria (menos de 1 GB en f16) lo hace viable para dispositivos con recursos limitados, como Raspberry Pi o sistemas edge.
- Generación de respuestas cortas en asistentes virtuales: para preguntas simples o diálogos de una sola vuelta, puede ofrecer respuestas básicas sin necesidad de servicios en la nube.
- Base para fine-tuning: al ser un modelo pequeño y con licencia Apache 2.0, puede servir como punto de partida para experimentos de adaptación a dominios específicos con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos reportados por el autor son la pérdida de validación y la perplejidad, que se muestran a continuación:

| Metrica | Valor |
|---|---|
| Pérdida de validación (val loss) | 4.6802 |
| Perplejidad | 107.8 |

Estos valores indican un rendimiento limitado en modelado del lenguaje, coherente con el tamaño del modelo y el corto entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cuantización f16 (el modelo pesa aproximadamente 130 MB en fp16).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., GTX 1050, RTX 2060, etc.). También puede ejecutarse únicamente en CPU con 4 GB de RAM.
- Compatible con GPUs consumer de gama baja y con aceleración por CPU.
- Opciones de despliegue: llama.cpp, LM Studio, Hugging Face transformers, y servidores compatibles con text-generation-inference (aunque no se recomienda para producción).
- Latencia y throughput: no se han publicado mediciones, pero por su tamaño se espera una latencia de pocos milisegundos por token en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de la misma categoría en la información proporcionada. Al tratarse de un modelo de 65M parámetros, podría compararse con modelos como TinyLlama (1.1B) o GPT-2 (124M), pero no hay datos de rendimiento comparables. Se recomienda consultar benchmarks externos antes de usarlo en aplicaciones críticas.

## Limitaciones y advertencias

- Contexto muy limitado: solo 512 tokens, lo que impide manejar conversaciones largas o documentos extensos.
- Perplejidad alta (107.8): la generación de texto puede ser incoherente o repetitiva, especialmente en tareas complejas.
- Entrenamiento corto (430 pasos) y con pocos datos: el modelo no ha sido expuesto a suficiente diversidad lingüística, por lo que puede producir alucinaciones o errores gramaticales.
- Solo soporta ruso e inglés: no es adecuado para otros idiomas.
- Sin capacidades avanzadas: no dispone de tool calling, razonamiento multi-paso ni soporte de agentes.
- Riesgo de sesgos: al entrenarse con datasets públicos, puede heredar sesgos presentes en los datos, aunque no se han documentado casos específicos.
- No recomendado para producción: su rendimiento y limitaciones lo hacen inadecuado para aplicaciones comerciales serias; es más apropiado para investigación y aprendizaje.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Catniti/catrex-1.0)
- Repositorio del autor: no se ha encontrado un repositorio de código adicional más allá del propio modelo.
- No se han localizado papers, blogs o demos externos relacionados con este modelo.
