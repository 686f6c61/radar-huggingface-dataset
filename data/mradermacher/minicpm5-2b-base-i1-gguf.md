# mradermacher/MiniCPM5-2B-Base-i1-GGUF

## Resumen

MiniCPM5-2B-Base es un modelo de lenguaje denso de 2.000 millones de parámetros (2B) desarrollado por OpenBMB, diseñado para despliegue en dispositivos con recursos limitados (edge AI, on-device). Es el segundo modelo de la serie MiniCPM5, tras el MiniCPM5-1B, y sigue la arquitectura Transformer densa (similar a Llama). Este repositorio concreto contiene la cuantización GGUF con matriz de importancia (imatrix) realizada por mradermacher, que permite ejecutar el modelo en CPU y GPU con bajo consumo de memoria. El modelo está entrenado con una mezcla de datos web, matemáticas, código y ajuste por instrucciones (SFT y RL), según la metadata del repositorio, y soporta contextos largos y tool calling, como indican sus etiquetas. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tipo Llama) |
| Parametros totales | 2B (según denominación; dato de HuggingFace: 774.438, aparentemente incompleto) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S, e imatrix |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo), safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo es un Transformer denso de 2B parámetros, sin mezcla de expertos (MoE). Según la información de OpenBMB, sigue la misma receta de entrenamiento que el MiniCPM5-1B, escalada a 2B, y está optimizado para escenarios locales y de pocos recursos. Los datos de entrenamiento listados en la metadata incluyen Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, y los conjuntos UltraData de matemáticas, código, SFT y RL (UltraData-SFT-2605, UltraData-SFT-Agent-2609, UltraData-RL-2609). Esto sugiere un pipeline de preentrenamiento seguido de ajuste supervisado y aprendizaje por refuerzo (posiblemente RLHF/DPO), aunque el nombre "Base" indica que podría ser el modelo base sin el ajuste final. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset. La etiqueta "long-context" indica soporte de ventanas de contexto amplias, pero no se proporciona el valor exacto.

## Capacidades

- Generación de texto en inglés y chino.
- Soporte de tool calling / function calling, según las etiquetas del repositorio.
- Optimizado para despliegue on-device y edge AI, con bajo consumo de recursos.
- Capacidad de manejar contextos largos (long-context), aunque el valor exacto no está documentado.
- Al ser un modelo base, puede usarse para fine-tuning en tareas específicas.
- La información disponible no menciona capacidades de visión o audio; es un modelo de texto.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo puede ejecutarse localmente en un smartphone gracias a su tamaño reducido y a las cuantizaciones GGUF, gestionando conversaciones multi-turno sin necesidad de conexión a internet.
- Chatbots de atención al cliente en entornos con privacidad estricta: al desplegarse en servidores propios o en el edge, se evita enviar datos sensibles a APIs externas.
- Generación de código en entornos de desarrollo integrados (IDE) ligeros: con soporte de tool calling, puede integrarse en herramientas de autocompletado o asistentes de programación en inglés o chino.
- Automatización de tareas de back-office: extracción de información, resumen de documentos y clasificación de texto en aplicaciones empresariales que requieren bajos costes de inferencia.
- Educación y tutoría: generación de explicaciones, ejercicios y corrección de textos en inglés y chino, con posibilidad de ejecutarse en portátiles o equipos sin GPU potente.
- Investigación en NLP: modelo base para fine-tuning en tareas específicas de dominio, gracias a su licencia Apache 2.0 y a la disponibilidad de pesos en formato GGUF y safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de OpenBMB menciona que el modelo alcanza "2B-class open-source SOTA", pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 2B en cuantización Q4_K_M suele ocupar alrededor de 1,5-2 GB; en Q8_K_M, cerca de 2,5 GB. Estas cifras son estimaciones orientativas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, Apple Silicon con 8 GB unificados). Para despliegue en servidor, una A10 o T4 es suficiente.
- Cabe en consumer GPU y en dispositivos edge (Raspberry Pi con aceleración, smartphones con NPU).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), Text Generation Inference (TGI) y el ecosistema de Hugging Face Transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán de la cuantización y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| MiniCPM5-2B-Base | 2B | No disponible | Apache 2.0 | GGUF, safetensors |
| MiniCPM5-1B | 1B | No disponible | Apache 2.0 | No disponible |
| Qwen2.5-1.5B | 1,5B | No disponible | Apache 2.0 | No disponible |
| SmolLM2-1.7B | 1,7B | No disponible | Apache 2.0 | No disponible |

Nota: no se han encontrado datos de benchmarks comparativos en la información disponible. La comparativa se basa únicamente en parámetros y disponibilidad de formatos.

## Limitaciones y advertencias

- Sesgos: al estar entrenado principalmente con datos web en inglés y chino, puede reflejar sesgos culturales y lingüísticos de esos dominios.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar contenido factualmente incorrecto; no se recomienda su uso sin supervisión en tareas críticas.
- Limitaciones de contexto: aunque se etiqueta como long-context, no se especifica la longitud exacta; se recomienda verificar el comportamiento con ventanas largas antes de usarlo en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero requiere incluir el aviso de licencia y las atribuciones correspondientes.
- Caveats para producción: el modelo solo soporta inglés y chino, por lo que su rendimiento en otros idiomas será limitado. Además, al ser un modelo base, puede requerir fine-tuning para tareas específicas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiniCPM5-2B-Base-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/MiniCPM5-2B-Base-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-Base
- Repositorio de OpenBMB: https://github.com/OpenBMB/MiniCPM
