# mradermacher/Sirigannada-2B-base-GGUF

## Resumen

Sirigannada-2B-base-GGUF es la versión cuantizada en formato GGUF del modelo base Sirigannada-2B-base, desarrollado originalmente por kushal-sathyanarayan y convertido a GGUF por mradermacher. Se trata de un modelo derivado de Gemma 2 de aproximadamente 2.600 millones de parámetros, sometido a un proceso de preentrenamiento continuado (continued pretraining) con ajuste LoRA sobre el corpus ai4bharat/sangraha para reforzar su competencia en kannada (kn) manteniendo el inglés (en).

El modelo resuelve el problema de la baja representación del kannada en los LLM generalistas: en lugar de entrenar desde cero, parte de los pesos de Gemma 2 y los especializa mediante LoRA sobre datos indic. Es relevante para desarrolladores que necesitan un modelo ligero, desplegable en hardware modesto, con cobertura razonable de kannada y sin renunciar a la licencia Gemma.

Esta ficha cubre específicamente la variante GGUF, que permite inferencia en CPU y GPU de consumo mediante llama.cpp y derivados. Al ser un modelo *base* (no instruido), está pensado como punto de partida para fine-tuning posterior más que para uso conversacional directo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2) |
| Parámetros totales | 2.614.341.888 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | kannada (kn), inglés (en) |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | GGUF (los pesos originales del modelo base están en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 2, un transformer decoder-only denso con atención por ventanas alternas y normalización RMSNorm, en su variante de ~2.600 millones de parámetros. Sobre esa base, el autor original aplicó un preentrenamiento continuado con adaptadores LoRA utilizando el dataset ai4bharat/sangraha, un corpus multilingüe de lenguas indias, con el objetivo de mejorar la modelización del kannada sin destruir las capacidades en inglés heredadas de Gemma 2.

No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición precisa del subconjunto del dataset, la configuración de LoRA (rango, alpha, módulos objetivo) ni sobre si hubo fases de alineación adicionales (RLHF/DPO). La model card del repositorio GGUF no documenta estos extremos; únicamente indica el origen de los pesos y el proceso de cuantización estática aplicado por mradermacher. No se han publicado innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto en kannada e inglés como modelo base, sin ajuste de instrucciones.
- Modelización de lenguaje para tareas de continuación y *prompting* few-shot.
- Punto de partida para fine-tuning supervisado y ajuste de instrucciones en kannada.
- Soporte de tokenización adaptada a escritura kannada (heredada de Gemma 2 y reforzada con el preentrenamiento continuado).
- Capacidades bilingües kn/en, con especialización declarada en kannada.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo *thinking*, visión, audio ni otras modalidades.
- No dispone de plantilla de chat ni de comportamiento conversacional entrenado.

## Casos de uso

- Fine-tuning de instrucciones en kannada: el modelo sirve como base para entrenar un asistente conversacional específico para kannada con un conjunto de datos supervisado propio, aprovechando que ya ha visto corpus indic durante el preentrenamiento continuado.
- Generación y autocompletado de texto en kannada: útil para herramientas de redacción, resumen o corrección en dicho idioma, ejecutables en local gracias a las cuantizaciones Q4/Q5 de menos de 2 GB.
- Clasificación y etiquetado de textos en kannada: al ser un modelo base, puede adaptarse con cabezas de clasificación o mediante *prompting* para tareas de moderación, categorización o extracción de entidades.
- Investigación en lingüística computacional del kannada: permite estudiar el efecto del preentrenamiento continuado con LoRA sobre un modelo Gemma 2 en una lengua de bajos recursos, comparando perplejidad y calidad generativa frente al modelo original.
- Despliegue en entornos con recursos limitados: la variante Q4_K_M (1,8 GB) cabe en CPU y en GPU de consumo, lo que facilita prototipos y demos offline sin infraestructura dedicada.
- Base para traducción automática kn-en o en-kn: mediante fine-tuning con pares paralelos, el modelo puede especializarse en traducción, ya que maneja ambos idiomas de forma nativa.
- Experimentación educativa: su tamaño reducido y su formato GGUF lo hacen adecuado para enseñar cuantización, LoRA y despliegue con llama.cpp en cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 1,3 GB en Q2_K, 1,8 GB en Q4_K_M, 2,3 GB en Q6_K, 2,9 GB en Q8_0 y 5,3 GB en f16, más el *overhead* de contexto y del runtime.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput y contextos largos.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con 4-6 GB de VRAM para Q4_K_M o Q5_K_M; también en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requerirían los pesos safetensors originales.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Sirigannada-2B-base-GGUF | 2,61 B | no disponible | kn, en | Gemma | GGUF |
| Gemma 2 2B (base original) | ~2,6 B | 8.192 tokens (según documentación pública de Gemma 2) | multilingüe | Gemma | safetensors, GGUF |
| Modelos indic de 2-3 B (p. ej. variantes de Tamil/Llama adaptadas) | ~2-3 B | variable | indic + en | variable | safetensors, GGUF |

La comparación directa con alternativas indic de tamaño similar no puede completarse con datos verificados en la información disponible; se indica "no disponible" para métricas de rendimiento comparado.

## Limitaciones y advertencias

- Es un modelo *base*: no está ajustado para seguir instrucciones ni para mantener conversaciones; su uso directo en chat producirá continuaciones, no respuestas.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin alineación adicional, la probabilidad de generar contenido factualmente incorrecto es alta.
- Sesgos potenciales heredados de Gemma 2 y del corpus ai4bharat/sangraha, no evaluados en la información disponible.
- Cobertura lingüística limitada a kannada e inglés; el rendimiento en otras lenguas indias o en castellano no está garantizado.
- Longitud de contexto no documentada en esta ficha; conviene verificar la configuración del modelo base antes de usarlo con contextos largos.
- Licencia Gemma: el uso comercial está sujeto a los términos de uso de Google, que incluyen restricciones y obligaciones de atribución; es necesario revisarlos antes de un despliegue en producción.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- No se han publicado evaluaciones de seguridad, sesgo ni robustez para esta variante.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Sirigannada-2B-base-GGUF
- Modelo base original: https://huggingface.co/kushal-sathyanarayan/Sirigannada-2B-base
- Página de descargas del cuantizador: https://hf.tst.eu/model#Sirigannada-2B-base-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4bharat/sangraha
- Preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
