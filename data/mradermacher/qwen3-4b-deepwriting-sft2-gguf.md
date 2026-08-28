# mradermacher/Qwen3-4B-DeepWriting-SFT2-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `ChuGyouk/Qwen3-4B-DeepWriting-SFT2`, un ajuste fino (SFT) sobre la base Qwen3-4B orientado a tareas de escritura profunda (deep writing). El autor `mradermacher` se limita a publicar las versiones cuantizadas estáticas del modelo original, sin aportar documentación adicional sobre el entrenamiento o las capacidades específicas del ajuste.

El modelo base Qwen3-4B es un transformer denso de 4.000 millones de parámetros, desarrollado por Alibaba Cloud, con una ventana de contexto de 32.768 tokens y soporte multilingüe. Este ajuste fino, del que no se dispone de detalles técnicos publicados, busca especializar el modelo en tareas de redacción extensa y coherente. La relevancia de este repositorio radica en ofrecer versiones cuantizadas listas para ejecución local con llama.cpp, Ollama u otros motores compatibles con GGUF, facilitando el despliegue en hardware de consumo.

La información disponible es muy limitada: no hay model card del autor, ni licencia declarada, ni datos de entrenamiento. Toda especificación técnica que se indica a continuación proviene del modelo base Qwen3-4B, no del ajuste fino específico, salvo que se indique lo contrario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B) |
| Parametros totales | 4.000 millones (aprox., del modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (modelo base; no confirmado para el ajuste) |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible (el modelo base Qwen3 soporta multiples idiomas, pero no se confirma para este ajuste) |
| Licencia | no disponible (el modelo base usa Apache 2.0, pero el ajuste puede tener otra) |
| Formato de pesos | GGUF (safetensors no incluido) |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B emplea una arquitectura transformer densa con atención de múltiples cabezas, normalización RMSNorm y activación SwiGLU. Incorpora el modo "thinking" opcional que permite al modelo razonar de forma extendida antes de responder, una característica distintiva de la familia Qwen3. El ajuste fino `DeepWriting-SFT2` de ChuGyouk no publica detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni la metodología (si se usó SFT únicamente o se combinó con RLHF/DPO). No se dispone de información sobre innovaciones técnicas específicas del ajuste.

Las cuantizaciones GGUF de este repositorio se generaron con la herramienta de conversión estándar de llama.cpp, manteniendo la arquitectura original del modelo. No se incluyen archivos de proyecto multimodales (mmproj), por lo que el modelo es exclusivamente de texto.

## Capacidades

- Generación de texto: el modelo base Qwen3-4B es capaz de producir texto coherente y contextualizado en múltiples idiomas.
- Razonamiento: soporta el modo "thinking" (razonamiento extendido) si el ajuste lo conserva, aunque no se confirma.
- Escritura creativa y técnica: el nombre del ajuste sugiere especialización en redacción profunda, pero no hay evidencia publicada de su rendimiento real.
- Tool calling: el modelo base Qwen3-4B soporta function calling, pero no se verifica si el ajuste lo mantiene.
- Multilingüismo: el modelo base cubre más de 100 idiomas, pero el ajuste puede haber reducido o alterado esta capacidad.
- No se confirma soporte de visión, audio u otras modalidades.

## Casos de uso

- Redacción de documentos extensos: el ajuste podría emplearse para generar informes, artículos o ensayos de varias páginas con coherencia temática, aprovechando la ventana de 32K tokens del modelo base.
- Asistente de escritura creativa: para autores que necesitan un borrador inicial de narrativa o guion, el modelo puede producir texto con estructura argumental.
- Generación de contenido técnico: documentación de software, manuales o tutoriales, si el ajuste conserva las capacidades técnicas del base.
- Resumen y reescritura de textos largos: gracias al contexto amplio, puede procesar documentos completos y reformularlos.
- Chat conversacional con memoria extendida: en aplicaciones de atención al cliente o asistentes personales, el contexto largo permite mantener hilos de conversación prolongados.
- Prototipado rápido de aplicaciones de IA generativa: al estar disponible en GGUF, se puede integrar en entornos locales con Ollama o llama.cpp para pruebas de concepto sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Los datos de rendimiento del modelo base Qwen3-4B (publicados en el reporte técnico de Qwen3) no son directamente aplicables al ajuste fino, ya que el entrenamiento adicional puede alterar las capacidades generales.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 4B en GGUF, las necesidades aproximadas son:
  - Q2_K: ~2,2 GB
  - Q4_K_M: ~2,8 GB
  - Q8_0: ~4,2 GB
  - F16: ~8 GB
  (valores orientativos; dependen del contexto y del motor de inferencia)
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones Q4 o inferiores. Una RTX 3060 (12 GB) o superior permite usar Q8_0 o F16 con comodidad.
- En consumer GPU: sí, cabe en GPUs de gama media como RTX 3060, RTX 4060, o incluso en iGPUs con suficiente RAM compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversión previa a formato compatible), o cualquier motor que soporte GGUF.
- Latencia y throughput: no se dispone de mediciones específicas. En una RTX 4090, un modelo de 4B en Q4_K_M suele generar entre 50 y 100 tokens por segundo, pero esto es una estimación genérica.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos para este ajuste fino. Como referencia, el modelo base Qwen3-4B compite con otros modelos de 4B como Llama 3.2 3B, Gemma 3 4B o Phi-4 14B (aunque este último es mayor). Sin embargo, al no existir benchmarks publicados del ajuste DeepWriting-SFT2, no es posible establecer una comparación rigurosa. Se recomienda evaluar el modelo en el caso de uso concreto antes de adoptarlo.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos específicos del ajuste. El modelo base Qwen3 puede presentar sesgos culturales y lingüísticos propios de sus datos de entrenamiento.
- Riesgo de alucinacion: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de escritura creativa donde la veracidad no es prioritaria.
- Limitaciones de contexto: aunque el modelo base soporta 32K tokens, el ajuste fino podría haber reducido la ventana efectiva. No se ha verificado.
- Restricciones de licencia: la licencia no está declarada en el repositorio. El modelo base usa Apache 2.0, pero el ajuste de ChuGyouk podría tener términos diferentes. Se recomienda contactar al autor antes de uso comercial.
- Advertencia de producción: al ser un repositorio sin documentación ni métricas, no se recomienda su uso en entornos críticos sin una evaluación exhaustiva previa.
- El autor `mradermacher` no proporciona garantías sobre el funcionamiento del modelo; es una cuantización de un tercero.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3-4B-DeepWriting-SFT2-GGUF
- Modelo original (ChuGyouk): https://huggingface.co/ChuGyouk/Qwen3-4B-DeepWriting-SFT2
- Repositorio Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Reporte técnico de Qwen3 (arXiv): https://arxiv.org/pdf/2505.09388
- Página de Qwen3 en LM Studio: https://lmstudio.ai/models/qwen3
