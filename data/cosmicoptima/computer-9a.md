# cosmicoptima/computer-9a

## Resumen

Computer-9a es un modelo de lenguaje causal de 70.553.706.496 parámetros (aproximadamente 70,5 mil millones) desarrollado por cosmicoptima como parte de un experimento de aprendizaje por refuerzo en línea orientado a tareas de uso de computadora. Se trata del checkpoint número 60 de una política entrenada mediante refuerzo en un entorno de terminal que presenta una herramienta `bash` a través de llamadas textuales estructuradas. El modelo fue exportado en bfloat16 desde un checkpoint FSDP retenido para evaluación, y se distribuye en formato safetensors fragmentado.

El modelo está diseñado para interactuar con un entorno de terminal: recibe observaciones textuales de resultados de comandos y debe generar respuestas que pueden incluir llamadas a herramientas. Sin embargo, la ejecución de herramientas no está integrada en los pesos; las aplicaciones deben parsear las llamadas, ejecutarlas en un sandbox aislado y devolver los resultados al modelo. Es un checkpoint de investigación con rendimiento ruidoso y no debe interpretarse como un agente de uso de computadora fiable en producción.

La relevancia de este modelo radica en su enfoque experimental: combina aprendizaje por refuerzo con regularización contra una política parental conversacional, y explora la generación de comandos shell en un contexto de agente. No obstante, su licencia es "other" (no especificada), carece de documentación sobre datos de entrenamiento o benchmarks, y presenta advertencias claras sobre seguridad y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (tipo Llama, según tags) |
| Parametros totales | 70.553.706.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (exportado), sin cuantizaciones adicionales publicadas |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (fragmentado) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje causal de tipo transformer, probablemente basado en la familia Llama (según los tags de HuggingFace). No se proporcionan detalles sobre el número de capas, dimensiones de atención o mecanismos de atención específicos. El entrenamiento se realizó mediante aprendizaje por refuerzo en línea: el modelo interactuaba con un entorno que presentaba una herramienta `bash` a través de llamadas textuales `<tool name="bash">...</tool>` y observaciones `<tool_result name="bash">...</tool_result>`. La optimización se centró en tareas de terminal verificadas automáticamente, mientras se regularizaba contra una política parental conversacional para mantener cierta coherencia en el diálogo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El checkpoint corresponde al paso 60 del experimento y se exportó en bfloat16 desde un checkpoint FSDP. No se mencionan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y respuestas en formato conversacional, con un formato de prompt específico que incluye marcadores de rol (`**User:**`, `**Model C:**`, `**Environment:**`).
- Emisión de llamadas a herramientas `bash` en formato textual, que deben ser parseadas y ejecutadas externamente.
- Razonamiento multi-paso en tareas de terminal, aunque con rendimiento ruidoso y propenso a errores en tareas complejas.
- Capacidad de tool-use limitada: el modelo puede generar comandos shell, pero no ejecutarlos por sí mismo.
- No se reportan capacidades de visión, audio, ni modos de pensamiento explícitos.
- Multilingüismo: no disponible; probablemente entrenado principalmente en inglés, pero sin confirmación.

## Casos de uso

- Experimentación en investigación de agentes de terminal: el modelo puede utilizarse en entornos de laboratorio para estudiar cómo un LLM aprende a interactuar con una shell mediante RL, siempre bajo supervisión y en sandbox aislado.
- Generación de comandos shell para automatización de tareas simples: en un pipeline controlado, el modelo puede sugerir comandos bash para operaciones como listar archivos, buscar contenido o gestionar procesos, aunque requiere verificación humana.
- Evaluación de políticas de RL en modelos de lenguaje: sirve como referencia para comparar el comportamiento de checkpoints intermedios en tareas de terminal.
- Desarrollo de prototipos de asistentes de línea de comandos: integrado en un sistema que ejecute las llamadas a herramientas, puede probarse en entornos de desarrollo con permisos restringidos.
- Análisis de alucinaciones en contextos de tool-use: al ser un checkpoint ruidoso, es útil para estudiar cómo los modelos inventan resultados de comandos o contradicen trazas visibles.
- Formación en seguridad de IA: puede emplearse en ejercicios de red teaming para identificar riesgos de modelos que generan comandos destructivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el rendimiento en tareas de terminal y en sondas fijas es ruidoso, y que el checkpoint no debe interpretarse como un agente fiable. No hay datos de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 70,5B parámetros en bfloat16, se requieren aproximadamente 141 GB de memoria solo para los pesos (70,5B × 2 bytes). Con overhead de activaciones y KV cache, se necesitan al menos 160-180 GB de VRAM.
- GPU recomendadas: no es viable en GPUs de consumo (RTX 4090 con 24 GB, etc.). Se requieren GPUs de datacenter como A100 80GB (al menos 2 en paralelo), H100 80GB (2 o más), o A6000 48GB (4 o más).
- Opciones de despliegue: vLLM, TensorRT-LLM o TGI pueden manejar modelos de este tamaño con paralelismo de tensor. llama.cpp podría funcionar con cuantización, pero no se han publicado cuantizaciones GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware y del framework de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo no tiene benchmarks publicados y su naturaleza experimental (checkpoint de RL en terminal) lo hace difícil de comparar con modelos generalistas como Llama 3 70B o Mistral 70B. No se conocen modelos equivalentes en la misma categoría de computer-use con RL en línea. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Riesgo de seguridad: el modelo puede emitir comandos shell destructivos; solo debe conectarse a entornos fuertemente aislados con privilegios mínimos.
- Alucinaciones: puede inventar efectos de comandos, contradecir trazas de herramientas visibles o fallar en tareas multi-etapa exactas.
- Rendimiento ruidoso: las métricas de rendimiento son inestables; no es un agente fiable para uso en producción.
- Respuestas tersas: tiende a generar respuestas breves, lo que puede dificultar la interpretación en algunos contextos.
- Licencia restrictiva: la licencia "other" no especifica términos de uso comercial; se recomienda contactar al autor antes de cualquier uso.
- Sin tool execution integrada: los desarrolladores deben implementar el parseo y ejecución de llamadas a herramientas, lo que añade complejidad y riesgo.
- Idiomas y contexto: no se especifican idiomas soportados ni longitud de contexto; probablemente limitado a inglés y ventanas de contexto estándar (4K-8K), pero sin confirmación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cosmicoptima/computer-9a
- Colección de modelos Computer de cosmicoptima: https://huggingface.co/collections/cosmicoptima/computer
- Perfil de GitHub del autor: https://github.com/cosmicoptima
- Modelo relacionado (checkpoint anterior): https://huggingface.co/cosmicoptima/computer-8
