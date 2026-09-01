# rishanthrajendhran/ideadet-nemotron30b-1m-document

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) denominado `ideadet-nemotron30b-1m-document`, desarrollado por Rishanth Rajendhran, cuyo propósito es la detección de contenido generado por inteligencia artificial (ai-detection). El adaptador se construye sobre el modelo base de NVIDIA `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, un modelo de arquitectura Mixture of Experts (MoE) de 30 mil millones de parámetros totales con 3 mil millones de parámetros activos por token. El nombre del repositorio sugiere un enfoque en documentos con contexto largo (posiblemente 1 millón de tokens), aunque este dato no está confirmado en la información disponible.

La relevancia de este modelo radica en la creciente necesidad de herramientas fiables para distinguir texto humano de texto generado por modelos de lenguaje, especialmente en ámbitos académicos, editoriales y de verificación de contenido. Al tratarse de un adaptador LoRA, su tamaño es reducido (3,1 GB) y puede integrarse sobre el modelo base de NVIDIA, que ya está optimizado para razonamiento y eficiencia. El acceso al repositorio está restringido (gated) y requiere aceptar condiciones adicionales en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (MoE) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 30B) |
| Parametros activos | no disponible (el modelo base activa 3B por token) |
| Longitud de contexto | no disponible (el nombre sugiere 1M, no confirmado) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors, probablemente BF16) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por NVIDIA, con 30 mil millones de parámetros totales y 3 mil millones de parámetros activos por token. Esta arquitectura permite una inferencia más eficiente que un modelo denso de tamaño equivalente. El adaptador LoRA añade pesos de bajo rango sobre las capas del modelo base, lo que reduce drásticamente los requisitos de almacenamiento y cómputo durante el ajuste fino.

No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens utilizados, ni el método de optimización (si se empleó RLHF, DPO u otro enfoque). El nombre del adaptador (`ideadet-nemotron30b-1m-document`) sugiere un entrenamiento orientado a documentos largos, pero no hay detalles técnicos confirmados en la información proporcionada.

## Capacidades

- Detección de texto generado por inteligencia artificial: el adaptador está diseñado para clasificar o puntuar si un documento o fragmento de texto ha sido producido por un modelo de lenguaje.
- Hereda las capacidades lingüísticas y de razonamiento del modelo base Nemotron, aunque su uso previsto es específico para tareas de detección.
- No se han documentado capacidades adicionales como tool calling, agentes o soporte multimodal en la información disponible.

## Casos de uso

- Verificación de integridad académica: instituciones educativas podrían emplear el adaptador para analizar ensayos y trabajos de estudiantes, detectando posibles usos de IA generativa.
- Moderación de contenido en plataformas editoriales: medios y blogs pueden revisar artículos enviados por colaboradores para garantizar que el contenido sea original y no generado automáticamente.
- Auditoría de contenido en marketing: agencias y empresas pueden comprobar si los textos producidos por proveedores externos cumplen con políticas de transparencia sobre uso de IA.
- Análisis forense digital: investigadores pueden utilizar la detección para identificar campañas de desinformación o perfiles falsos que generen contenido a gran escala.
- Control de calidad en generación de datos sintéticos: equipos que crean datasets con LLMs pueden validar que las muestras generadas sean reconocibles como sintéticas para su etiquetado.
- Filtrado de respuestas en chatbots: sistemas que necesitan diferenciar entre respuestas humanas y de máquina en entornos de soporte híbrido.

Estos casos son aplicaciones potenciales inferidas de la tarea de detección; no están documentados oficialmente por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 3,1 GB, pero requiere cargar el modelo base completo (30B parámetros en BF16), lo que necesita alrededor de 60 GB de VRAM en precisión BF16.
- GPU recomendadas: NVIDIA A100 (80 GB), H100 (80 GB) o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 con 24 GB cada una, si se usa cuantización adicional).
- Al ser un modelo MoE con 3B parámetros activos, la memoria necesaria es la de todos los pesos (30B), no solo la de los activos.
- Opciones de despliegue: frameworks como vLLM, TensorRT-LLM o Hugging Face Transformers con PEFT pueden cargar el adaptador sobre el modelo base. No se ha confirmado soporte para llama.cpp u Ollama.
- La latencia y el throughput dependerán del hardware y la implementación; no hay datos disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA de detección de IA basados en Nemotron. Existen soluciones comerciales como GPTZero o herramientas académicas, pero no son comparables directamente al tratarse de modelos de propósito general. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El acceso al repositorio es restringido (gated) en HuggingFace; es necesario aceptar condiciones adicionales para su uso.
- La licencia `openmdw-1.1` puede imponer restricciones de uso comercial; se recomienda revisar los términos completos antes de su adopción en producción.
- No hay información sobre sesgos, tasa de falsos positivos/negativos ni comportamiento en dominios específicos (por ejemplo, texto técnico, literario o multilingüe).
- El adaptador no ha sido validado públicamente con benchmarks; su eficacia real es desconocida.
- Depende del modelo base de NVIDIA; cualquier limitación de este (por ejemplo, sesgos o alucinaciones) se traslada al adaptador.
- El tamaño del repositorio (3,1 GB) corresponde solo al adaptador; el despliegue requiere además descargar el modelo base completo, que es significativamente mayor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rishanthrajendhran/ideadet-nemotron30b-1m-document
- Perfil del autor en HuggingFace: https://huggingface.co/rishanthrajendhran
- GitHub del autor: https://github.com/RishanthRajendhran/
- Página personal del autor: https://rishanthrajendhran.github.io/
- Página de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
