# ArchSpace-Collection/NCP_Olmo3_Stage1_Step200000

## Resumen

NCP_Olmo3_Stage1_Step200000 es un checkpoint intermedio de la familia NCP-Olmo3, publicado por el colectivo ArchSpace-Collection. Se trata de un modelo de lenguaje de tipo decoder-only con arquitectura transformer, basado en la línea Olmo 3 de Ai2, aunque con modificaciones propias que requieren código personalizado para su carga. Este checkpoint concreto corresponde al paso 200.000 de la fase de entrenamiento de etapa 1 (Stage1), y se distribuye como un artefacto puro de Hugging Face con claves de proyección estándar (`q_proj`, `k_proj`, `v_proj`, `gate_proj`, `up_proj`, `down_proj`), lo que facilita su uso con `AutoModelForCausalLM` y el backend de vLLM de ConceptLM.

El modelo tiene aproximadamente 8.940 millones de parámetros, lo que lo sitúa en la escala de 8B-9B, y su relevancia radica en ser un punto de control intermedio de un entrenamiento que busca combinar las capacidades de razonamiento de largo contexto, function calling y generación de código de Olmo 3 con un enfoque de entrenamiento por etapas. Al ser un checkpoint de etapa 1, no representa el modelo final, sino un hito en su desarrollo, útil para investigar la dinámica de entrenamiento o para fine-tuning adicional. La ausencia de licencia declarada y de documentación detallada limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Olmo 3, con modificaciones propias) |
| Parametros totales | 8.938.363.792 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (con claves de proyeccion estandar) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion disponible. Por el nombre y la referencia a Olmo 3, se infiere que se trata de un transformer decoder-only con atención de múltiples cabezas, probablemente con variaciones en la normalización o en el mecanismo de atención propias del proyecto NCP. El checkpoint se almacena con claves de proyección estándar de Hugging Face, lo que indica una conversión desde un formato nativo (posiblemente Megatron) a un formato compatible con el ecosistema HF. El entrenamiento se organiza en etapas; este es el paso 200.000 de la etapa 1, lo que sugiere un entrenamiento prolongado sobre un corpus extenso, aunque no se especifican ni el número de tokens ni la composición del dataset. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación. El modelo requiere `trust_remote_code=True` para cargarse, lo que implica que incluye código personalizado en el repositorio.

## Capacidades

- Generación de texto autoregresiva: al ser un modelo de lenguaje causal, puede generar texto continuo a partir de un prompt.
- Razonamiento de largo contexto: según la descripción de Olmo 3, la familia está diseñada para manejar contextos largos, aunque no se confirma la longitud exacta para este checkpoint.
- Function calling y tool calling: Olmo 3 incluye soporte para estas capacidades, y es plausible que este checkpoint las herede, pero no hay confirmación explícita.
- Generación de código: la familia Olmo 3 está entrenada para tareas de programación, por lo que este checkpoint probablemente tenga cierta competencia en código.
- Instrucciones y chat: se espera que el modelo pueda seguir instrucciones, aunque al ser un checkpoint de etapa 1 puede no estar completamente alineado.
- Multilingüismo: no se especifican idiomas soportados; se asume que el entrenamiento incluye datos multilingües, pero sin confirmación.

## Casos de uso

- Investigación en dinámica de entrenamiento: al ser un checkpoint intermedio, permite estudiar cómo evolucionan las capacidades del modelo a lo largo de las etapas de entrenamiento, comparando con checkpoints posteriores (Step100000, Step600000, etc.).
- Fine-tuning especializado: sirve como punto de partida para ajustar el modelo en dominios concretos (por ejemplo, código, medicina o finanzas) sin necesidad de entrenar desde cero.
- Evaluación de capacidades emergentes: se puede utilizar para medir en qué momento del entrenamiento aparecen habilidades como el razonamiento multi-paso o el seguimiento de instrucciones.
- Desarrollo de adaptadores LoRA: al tener un tamaño de ~9B, es viable aplicar técnicas de adaptación de bajo rango en GPUs de consumo medio (16-24 GB VRAM).
- Pruebas de conversión de formatos: el repositorio incluye un `conversion_manifest.json` que documenta la conversión de claves, útil para validar pipelines de conversión de pesos entre frameworks.
- Benchmarking de checkpoints intermedios: se puede comparar el rendimiento en tareas estándar (MMLU, HumanEval) a lo largo de los pasos de entrenamiento para trazar curvas de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La página del modelo no incluye métricas de evaluación, y la única referencia es una tabla comparativa en el README del checkpoint Step100000 que compara el checkpoint final con OLMo-Stage1, pero no se proporcionan los valores numéricos en los resultados de búsqueda. Por tanto, no es posible presentar una tabla de rendimiento sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.938 millones de parámetros en precisión FP16, el modelo requiere aproximadamente 18 GB de VRAM solo para los pesos. Con cuantización a 8 bits, se reduce a ~9 GB; a 4 bits, ~4,5 GB, aunque no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: para inferencia en FP16, se necesitan GPUs con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4). Para fine-tuning con LoRA, una RTX 4090 (24 GB) es suficiente. Para entrenamiento completo, se requieren GPUs de datacenter como A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar el modelo en una RTX 4090 con cuantización (por ejemplo, mediante GPTQ o AWQ), aunque no se proporcionan archivos cuantizados en el repositorio.
- Opciones de despliegue: se menciona compatibilidad con vLLM (backend ConceptLM) y con `AutoModelForCausalLM` de Hugging Face. También se puede usar con llama.cpp si se convierte a GGUF, aunque no se suministra.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090 con cuantización 4-bit, se podría esperar una generación de 20-40 tokens/s, pero es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo se basa en Olmo 3, pero no se conocen los resultados de este checkpoint concreto frente a otros modelos de ~9B como Llama 3.1 8B, Mistral 7B o Qwen 2.5 7B. La única referencia es que el modelo final de NCP-Olmo3 se compara con OLMo-Stage1, pero sin datos numéricos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado sobre datos web sin filtrado detallado documentado, es probable que herede sesgos de género, raza y cultura presentes en el corpus de entrenamiento.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento o hechos factuales.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada; si es inferior a 8K, puede ser insuficiente para tareas de documentos largos.
- Restricciones de licencia: la licencia no está declarada, lo que impide su uso comercial sin una aclaración legal previa. Es un riesgo importante para producción.
- Estado del checkpoint: al ser un checkpoint de etapa 1, no está alineado ni optimizado para tareas finales; puede producir respuestas incoherentes o de baja calidad en comparación con el modelo final.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio, un riesgo de seguridad en entornos no controlados.
- Falta de documentación: no hay información sobre el dataset de entrenamiento, el proceso de alineación ni las capacidades exactas, lo que dificulta su evaluación y uso responsable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_Step200000
- Checkpoint Step100000 (con tabla comparativa de referencia): https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_Step100000
- Checkpoint Step600000: https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_Step600000
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Página oficial de Olmo (Ai2): https://allenai.org/olmo
- Repositorio OLMo en GitHub: https://github.com/allenai/OLMo
