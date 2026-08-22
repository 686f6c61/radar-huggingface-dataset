# mradermacher/Qwen3.6-27B-Della-Deckard-v1-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.6-27B-Della-Deckard-v1-i1-GGUF` es una cuantización GGUF (con matriz de importancia, i1) del modelo original `YFC-112358/Qwen3.6-27B-Della-Deckard-v1`, un merge de la serie Qwen3.6-27B. El modelo base es un transformador denso multimodal de 27 mil millones de parámetros con atención híbrida basada en gated delta networks, soporte de visión, tool calling y una ventana de contexto de 262 000 tokens. El autor de la cuantización, mradermacher, es un conocido proveedor de pesos GGUF optimizados para inferencia local con llama.cpp y ecosistemas compatibles.

Este repositorio ofrece múltiples niveles de cuantización (desde Q2_K hasta Q6_K) con pesos ponderados por imatrix, lo que permite ajustar el equilibrio entre calidad y consumo de memoria. Es relevante para desarrolladores que necesitan ejecutar un modelo de razonamiento y multimodal en hardware de consumo o servidores con VRAM limitada, sin renunciar a las capacidades avanzadas del modelo base. El modelo hereda la licencia Apache-2.0 del original, lo que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con gated delta networks (atención híbrida) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (modelo base) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | Chino, ingles (principalmente) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.6-27B` emplea una arquitectura de transformer denso con **gated delta networks**, una variante de atención híbrida que combina mecanismos de atención lineal y no lineal para reducir el costo computacional en secuencias largas. Incluye **multi-token prediction (MTP)**, lo que permite predecir varios tokens por paso y mejora la velocidad de generación. El modelo es multimodal: acepta entradas de texto e imagen.

El modelo `Della-Deckard-v1` es un **merge** realizado mediante *task arithmetic*, combinando pesos de Qwen3.6-27B con otros modelos (no se especifican los componentes). El autor YFC-112358 no ha publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens o si se aplicaron técnicas de RLHF/DPO. La cuantización de mradermacher se realizó con `imatrix` (importance matrix) para mejorar la calidad de los pesos cuantizados.

## Capacidades

- **Generación de texto y razonamiento**: respuesta a preguntas, razonamiento lógico y matemático, análisis de texto.
- **Multimodalidad**: procesa imágenes y texto (entrada de visión) para tareas como descripción de imágenes, OCR, respuestas a preguntas visuales.
- **Tool calling / function calling**: puede invocar funciones externas y APIs, lo que lo hace apto para integración en agentes.
- **Soporte de agentes**: manejo de conversaciones multi-turno y ejecución de pasos intermedios en tareas complejas.
- **Capacidades multilingües**: principalmente chino e inglés, con menor soporte para otros idiomas.
- **Contexto largo**: ventana de 262 000 tokens, adecuada para documentos extensos, libros o historiales de conversación largos.
- **Generación de código**: capaz de escribir y completar código en varios lenguajes de programación.

## Casos de uso

- **Asistentes virtuales multimodales**: el modelo puede recibir imágenes (capturas de pantalla, fotos) y responder con texto, útil para soporte técnico visual o análisis de documentos escaneados.
- **Generación de código en producción**: con tool calling y MTP, puede integrarse en pipelines de CI/CD para autocompletar código, generar tests o documentación, reduciendo latencia.
- **Análisis de documentos extensos**: su contexto de 262K permite procesar informes, contratos o libros completos sin fragmentación, extrayendo información clave.
- **Agentes de automatización**: para tareas como gestión de correos, reservas o consultas a bases de datos, donde el modelo puede llamar funciones y mantener estado.
- **Chatbots de atención al cliente**: con soporte multilingüe y contexto largo, gestiona conversaciones prolongadas con historial completo, mejorando la coherencia.
- **Análisis de imágenes médicas o técnicas**: la capacidad de visión permite clasificar imágenes, detectar anomalías y generar descripciones en entornos controlados (con validación humana).
- **Generación de contenido educativo**: creación de explicaciones, resúmenes y ejercicios a partir de textos o imágenes, personalizados por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos comparativos de MMLU, HumanEval, GSM8K o similares para el modelo `Qwen3.6-27B-Della-Deckard-v1` ni para su cuantización.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantización Q4_K_M (~16 GB) cabe en GPUs de 16-24 GB (RTX 4080, RTX 3090, A10). Con Q6_K (~22 GB) se requiere 24 GB o más.
- **GPU recomendadas**: RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para velocidades altas.
- **En consumer GPU**: sí, con cuantización Q4_K_M o inferior (Q3_K_M, Q4_K_S) en una RTX 3090/4090. Para contexto de 262k se necesita más VRAM, por lo que se recomienda limitar el contexto a 8-32k.
- **Opciones de despliegue**: llama.cpp (incluido en Ollama), llama-cpp-python, llama-server, o servidores compatibles con GGUF como llama.cpp en modo servidor. También se puede usar con vLLM si se convierte a safetensors (no recomendado).
- **Latencia y throughput**: no disponible; depende del hardware y cuantización. Con MTP se espera mayor velocidad de generación que modelos sin esa técnica, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-Della-Deckard-v1 (base) | 27B | 262k | Sí | Apache-2.0 | HuggingFace |
| Qwen2.5-27B | 27B | 32k | No | Apache-2.0 | HuggingFace |
| Llama-3.1-8B | 8B | 128k | No | Llama 3.1 License | HuggingFace |
| Mistral-7B | 7B | 32k | No | Apache-2.0 | HuggingFace |

Nota: No se dispone de datos de rendimiento comparativos. La comparación se limita a características técnicas. El modelo base tiene contexto y multimodalidad superiores a Qwen2.5-27B, pero no se conoce su rendimiento real.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: como todo modelo generativo, puede producir contenido falso o sesgado, especialmente en idiomas distintos del inglés y chino.
- **Riesgo de alucinación en visión**: al ser un merge sin entrenamiento específico, la precisión en tareas visuales puede ser inferior a la de modelos dedicados.
- **Contexto largo**: aunque el contexto es de 262k, el rendimiento puede degradarse con secuencias muy largas; se recomienda usar truncamiento o ventanas deslizantes.
- **Idiomas**: el modelo está optimizado para chino e inglés; otros idiomas pueden tener peor calidad.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe revisar la licencia del modelo base (Qwen3.6) para confirmar restricciones adicionales.
- **Cuantización**: la cuantización introduce pérdida de precisión, especialmente en las versiones de menor bit (Q2_K, IQ1_M). Se recomienda usar Q4_K_M o superior para tareas críticas.
- **Dependencia de llama.cpp**: el formato GGUF solo es compatible con ecosistemas llama.cpp; no funciona directamente con transformers de HuggingFace sin conversión.

## Enlaces

- [Repositorio GGUF cuantizado (mradermacher)](https://huggingface.co/mradermacher/Qwen3.6-27B-Della-Deckard-v1-i1-GGUF)
- [Modelo base (YFC-112358)](https://huggingface.co/YFC-112358/Qwen3.6-27B-Della-Deckard-v1)
- [Ficha de Qwen3.6-27B en LLM Explorer](https://llm-explorer.com/model/YFC-112358%2FQwen3.6-27B-Della-Deckard-v1,1NK3uC9HznTwrVv1p5duAz)
- [Guía de ejecución en inferrank (GitHub)](https://github.com/Rhonstin/inferrank/blob/master/models/qwen3.6-27b/README.md)
- [Receta de vLLM para Qwen3.6-27B](https://recipes.vllm.ai/Qwen/Qwen3.6-27B)
