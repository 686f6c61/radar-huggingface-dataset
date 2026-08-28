# MergekitCloud/mergekit-66

## Resumen

MergekitCloud/mergekit-66 es un modelo de lenguaje de 8.030 millones de parámetros creado mediante la fusión (merge) de cuatro modelos base de la familia Llama 3.1 de 8B, utilizando la técnica Model Stock descrita en el artículo arXiv:2403.19522. El autor, MergekitCloud, lo publica en HuggingFace como un experimento de fusión reproducible, sin datos de entrenamiento adicionales ni fine-tuning posterior.

El modelo combina las capacidades de ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3, Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2, Undi95/Llama3-Unholy-8B-OAS y vicgalle/Humanish-Roleplay-Llama-3.1-8B, todos orientados a conversación y roleplay. Al ser un merge, hereda la arquitectura transformer decoder-only de Llama 3.1, con 8B parámetros y un tamaño de repo de 16,1 GB en formato safetensors (float16). No se proporcionan especificaciones sobre longitud de contexto, licencia ni idiomas soportados, lo que limita su uso directo en producción sin verificación previa.

La relevancia de este modelo radica en su naturaleza de experimento de fusión: permite estudiar cómo la combinación de modelos especializados en roleplay y conversación sin censura afecta al comportamiento resultante. Sin embargo, al carecer de benchmarks publicados y de documentación sobre su rendimiento, debe tratarse como una herramienta de investigación más que como un modelo listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos en float16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de cuatro modelos preentrenados de 8B parámetros, todos basados en la arquitectura Llama 3.1. La fusión se realizó con la herramienta mergekit, empleando el método Model Stock (arXiv:2403.19522). Este método combina los pesos de los modelos base sin necesidad de entrenamiento adicional, utilizando una media ponderada de los parámetros. En la configuración YAML se especifica `base_model: vicgalle/Humanish-Roleplay-Llama-3.1-8B` como modelo de referencia, con `normalize: false` e `int8_mask: true`, y dtype float16.

No se ha realizado ningún entrenamiento posterior a la fusión, por lo que el modelo no ha pasado por fases de RLHF, DPO ni fine-tuning con datos específicos. Las capacidades emergentes dependen exclusivamente de la combinación de los modelos originales, que están especializados en conversación, roleplay y generación de texto sin censura.

## Capacidades

- Generación de texto conversacional: al ser un merge de modelos de chat y roleplay, se espera que herede la capacidad de mantener diálogos multi-turno, aunque no hay evaluación publicada que lo confirme.
- Roleplay y personajes: los modelos base (Humanish-Roleplay, Lexi-Uncensored, Unholy) están diseñados para simular personajes y escenarios de rol, por lo que el merge podría conservar estas habilidades.
- Generación de texto sin censura: varios modelos base tienen un enfoque "uncensored", lo que podría traducirse en una menor adherencia a políticas de seguridad, aunque esto no está verificado.
- Soporte de tool calling: no disponible, no se menciona en la documentación.
- Capacidades multilingües: no disponible, aunque al ser Llama 3.1 podría tener soporte multilingüe básico, pero no se especifica.
- Modo de razonamiento o thinking: no disponible.

## Casos de uso

- Experimentación con fusión de modelos: el modelo sirve como caso de estudio para investigadores que quieran analizar cómo el método Model Stock combina las características de modelos especializados en roleplay y conversación.
- Prototipado de chatbots de rol: si se valida su comportamiento, podría usarse para crear asistentes conversacionales con personalidad, aunque requiere pruebas previas.
- Generación de narrativa creativa: dado el enfoque de los modelos base, podría emplearse para escribir historias o diálogos de ficción, pero sin garantías de calidad.
- Investigación sobre alineación y censura: al ser un merge de modelos "uncensored", puede utilizarse para estudiar cómo la fusión afecta a la seguridad y a los sesgos.
- Benchmarking de métodos de merge: permite comparar el resultado de Model Stock con otros métodos de fusión sobre los mismos modelos base.
- Desarrollo de datasets sintéticos: podría generar conversaciones o textos para entrenar otros modelos, aunque su fiabilidad no está demostrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo no ha sido evaluado por el autor ni por terceros en los repositorios consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 8.030 millones de parámetros en float16, se necesitan aproximadamente 16 GB de VRAM para cargar los pesos completos. Con cuantización a int8 (no disponible oficialmente) se reduciría a ~8 GB, y a int4 a ~4 GB, pero no se ofrecen versiones cuantizadas.
- GPU recomendadas: para float16, una GPU con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 40GB, o A10G. En GPUs de 8 GB (RTX 3070, 4060) solo sería posible con cuantización, que no está disponible.
- Opciones de despliegue: al ser un modelo estándar de transformers, puede ejecutarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se cuantiza), o mediante la librería transformers de HuggingFace. No hay integraciones específicas documentadas.
- Latencia y throughput: no disponibles, dependen del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MergekitCloud/mergekit-66 | 8,03B | No disponible | No disponible | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | Llama 3.1 Community License | HuggingFace |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,24B | 32k | Apache 2.0 | HuggingFace |
| ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3 | 8,03B | No disponible | No disponible | HuggingFace |

La comparativa se limita a parámetros y disponibilidad, ya que no hay datos de rendimiento para mergekit-66. Los modelos base de los que deriva son alternativas directas, pero el merge no ofrece ventajas verificables sobre ellos.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay benchmarks ni pruebas de calidad, por lo que su rendimiento real es desconocido.
- Licencia no especificada: el repositorio no indica licencia, lo que impide su uso comercial sin riesgo legal.
- Posibles sesgos heredados: los modelos base "uncensored" pueden contener sesgos de género, raza o contenido ofensivo, que podrían amplificarse en la fusión.
- Riesgo de alucinación: al ser un modelo de 8B sin fine-tuning específico, es propenso a generar información falsa o inventada.
- Contexto no documentado: se desconoce la longitud de contexto efectiva, lo que dificulta su uso en tareas que requieran ventanas largas.
- Sin soporte de herramientas: no hay evidencia de tool calling ni integración con agentes, limitando su uso en pipelines complejos.
- Fecha de creación futura: el modelo fue creado en agosto de 2026, lo que sugiere que es un artefacto reciente y posiblemente inmaduro.

## Enlaces

- [HuggingFace - MergekitCloud/mergekit-66](https://huggingface.co/MergekitCloud/mergekit-66)
- [mergekit (GitHub)](https://github.com/arcee-ai/mergekit)
- [Paper Model Stock (arXiv:2403.19522)](https://arxiv.org/abs/2403.19522)
- [MergeKit Hub - Comunidad](https://www.mergekit.com/)
