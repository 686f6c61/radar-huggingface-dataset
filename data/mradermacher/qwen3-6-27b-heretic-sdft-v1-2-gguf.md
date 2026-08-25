# mradermacher/Qwen3.6-27B-Heretic-SDFT-v1.2-GGUF

## Resumen

El modelo `mradermacher/Qwen3.6-27B-Heretic-SDFT-v1.2-GGUF` es una cuantización en formato GGUF del modelo base `ReadyArt/Qwen3.6-27B-Heretic-SDFT-v1.2`, desarrollado por el usuario mradermacher (nethype GmbH). Se trata de un modelo de 27.320 millones de parámetros, basado en la arquitectura Qwen 3.6, que ha sido finamente ajustado («heretic» y «SDFT») para eliminar filtros de seguridad y permitir generación de contenido sin restricciones, incluyendo roleplay explícito y contenido NSFW. El modelo incluye un componente multimodal (proyectores `mmproj`), lo que sugiere capacidades de visión además de texto.

La relevancia de este modelo radica en su orientación a casos de uso creativos y conversacionales no moderados, donde se prioriza la libertad de expresión sobre la seguridad. Se distribuye en 13 cuantizaciones GGUF que van desde Q2_K (11 GB) hasta Q8_0 (29,1 GB), más dos variantes del proyector multimodal. Es un modelo «desalineado» por diseño, por lo que su uso en entornos de producción conlleva riesgos importantes que deben evaluarse.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Qwen 3.6) con encoder de visión |
| Parametros totales | 27.320.697.856 (27,32B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 + mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 (declarada en metadata; tag adicional «Other License» en el repositorio) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información proporcionada, pero se trata de un modelo de lenguaje causal de la familia Qwen 3.6 con 27.320 millones de parámetros. El hecho de que se incluyan archivos `mmproj` (multi-modal projection) indica que el modelo incorpora un codificador visual que permite entrada de imágenes, aunque no se detalla la arquitectura de este componente. El entrenamiento incluye un ajuste fino denominado «SDFT» (posiblemente Supervised Direct Fine-Tuning) sobre el modelo base `ReadyArt/Qwen3.6-27B-Heretic-SDFT-v1.2`, que a su vez es una variante «heretic» (desprovista de filtros de seguridad) de Qwen3.6-27B.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La cuantización es estática (no imatrix) y fue realizada por mradermacher, quien indica que las cuantizaciones con imatrix podrían estar disponibles posteriormente. No hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto libre sin filtros de seguridad, incluyendo contenido explícito, NSFW, roleplay y temas tabú.
- Capacidades multimodales: el modelo incluye un proyecto multimodal (`mmproj`) que permite procesar imágenes junto con texto.
- Soporte conversacional y de roleplay multi-turno, con capacidad para mantener contextos largos (longitud de contexto no especificada).
- Multilingüismo: solo se declara soporte para inglés, aunque es probable que el modelo base de Qwen tenga capacidades multilingües, pero no está confirmado.
- Sin información sobre tool calling, function calling o capacidades de agente.
- El modelo está etiquetado como «unaligned» y «dangerous», lo que implica ausencia de alineación de seguridad.

## Casos de uso

- **Roleplay y narración interactiva**: el modelo puede gestionar conversaciones multi-turno de personajes en escenarios de ficción, incluyendo tramas explícitas, gracias a su entrenamiento orientado a roleplay y su capacidad de mantener coherencia contextual.
- **Escritura creativa sin restricciones**: para autores que necesitan generar contenido literario con temas adultos, violencia, sexo o transgresión, sin que el modelo rechace la solicitud.
- **Simulación de personajes para juegos**: integración en motores de juego o chatbots de personajes no jugadores (NPC) que requieren respuestas sin censura en diálogos interactivos.
- **Investigación sobre comportamiento de modelos desalineados**: estudio de sesgos, alucinaciones o dinámicas de generación en modelos sin filtros de seguridad, útil para la comunidad de IA responsable.
- **Generación de contenido para ficción interactiva**: aplicaciones de novelas visuales o juegos de texto que requieren escenas explícitas, donde el modelo puede mantener un tono coherente y adaptarse a las elecciones del usuario.
- **Experimentación en entornos de laboratorio**: evaluación de la capacidad de un modelo de 27B para producir contenido dañino o inapropiado, con fines de investigación sobre mitigación de riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con otros modelos de la misma categoría. La única referencia a rendimiento es el tamaño de las cuantizaciones y la nota de la tabla que indica que Q4_K_M y Q8_0 son «rápidas» y recomendadas, mientras que Q6_K ofrece «muy buena calidad».

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - Q2_K: ~11 GB de VRAM (puede ejecutarse en GPUs de 12 GB como RTX 3060/4060).
  - Q4_K_M: ~16,9 GB (requiere GPUs de 16 GB o más, como RTX 4080, RTX 4090, A100 40 GB).
  - Q8_0: ~29,1 GB (necesita GPUs de 32 GB o múltiples GPUs, como A100 80 GB o dos RTX 3090/4090).
- **GPU recomendadas**: RTX 4090 (24 GB) para cuantizaciones hasta Q5_K_M; A100 80 GB o H100 para Q8_0 y mayor calidad.
- **En consumer GPU**: sí, con cuantizaciones Q2_K a Q5_K_M en GPUs de 12-24 GB. Las cuantizaciones más pesadas requieren hardware profesional o multi-GPU.
- **Opciones de despliegue**: llama.cpp, Ollama, KoboldCpp, LM Studio, text-generation-webui (vía GGUF). No se menciona compatibilidad con vLLM, pero es un modelo de Qwen, por lo que debería ser compatible si se convierte a formato safetensors.
- **Latencia y throughput**: no disponible; depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `mradermacher/Qwen3.6-27B-Heretic-SDFT-v1.2-GGUF` | 27,32B | no disponible | apache-2.0 | GGUF | Desalineado, con visión |
| `ReadyArt/Qwen3.6-27B-Heretic-SDFT-v1.2` | 27,32B | no disponible | apache-2.0 | safetensors | Modelo base original |
| `mradermacher/Qwen3.6-27B-uncensored-heretic-v2-Native-MTP-Preserved-i1-GGUF` | 27,32B | no disponible | apache-2.0 | GGUF | Variante similar, con MTP preservado y cuantizaciones imatrix |

No hay datos de rendimiento comparativo entre estos modelos. El modelo base es el mismo, y las diferencias están en las cuantizaciones y en la presencia del proyecto multimodal.

## Limitaciones y advertencias

- **Ausencia de filtros de seguridad**: el modelo está diseñado para generar contenido explícito, violento o peligroso sin restricciones. Puede producir respuestas inapropiadas, ofensivas o dañinas en contextos de producción.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas no cubiertos por su entrenamiento.
- **Soporte solo en inglés**: no se garantiza la calidad en otros idiomas.
- **Contexto limitado**: no se especifica la longitud de contexto; si es similar a otros modelos Qwen, podría ser de 32K tokens, pero no se confirma.
- **Licencia**: aunque la metadata indica apache-2.0, el tag «Other License» en el repositorio y el contenido del modelo pueden implicar restricciones adicionales para uso comercial o redistribución. Verificar con el modelo base.
- **Cuantizaciones estáticas**: las cuantizaciones no son imatrix, por lo que la calidad puede ser inferior a las cuantizaciones con imatrix en ciertos casos.
- **Riesgo legal**: el uso de este modelo para generar contenido ilegal (pornografía infantil, incitación al odio, etc.) puede violar leyes locales. No se recomienda su uso en entornos sin supervisión.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/Qwen3.6-27B-Heretic-SDFT-v1.2-GGUF
- Modelo base (safetensors): https://huggingface.co/ReadyArt/Qwen3.6-27B-Heretic-SDFT-v1.2
- Variante similar con MTP: https://huggingface.co/mradermacher/Qwen3.6-27B-uncensored-heretic-v2-Native-MTP-Preserved-i1-GGUF
- Análisis de la serie Qwen 3.x 27B: https://kgptalkie.com/tutorials/generative-ai/qwen-3-8-27b-vs-qwen-3-6-27b-vs-qwen-3-5-27b
- Nota sobre la serie Heretic: https://www.hfdailybriefer.com/post/2707
