# DavidAU/L3-8B-Stheno-v3.3-32K-Ultra-NEO-V1-IMATRIX-GGUF

## Resumen
L3-8B-Stheno-v3.3-32K-Ultra-NEO-V1-IMATRIX-GGUF es una cuantización GGUF del modelo Stheno v3.3 de 8B parámetros, publicada por el usuario DavidAU sobre el modelo base de Sao10K. El modelo original parte de Llama 3 8B y ha sido afinado para generación creativa, rol y narración de historias, con una ventana de contexto extendida hasta 32K tokens. Esta versión concreta aplica la técnica propietaria "NEO Class" de cuantización con matrices IMATRIX, que el autor presenta como una mejora de precisión respecto a cuantizaciones estándar del mismo nivel.

El interés de esta ficha reside en que documenta un caso típico de la escena de modelos comunitarios: un fine-tune de Llama 3 orientado a roleplay y ficción, empaquetado en múltiples cuantizaciones GGUF para su uso en hardware de consumo mediante llama.cpp, KoboldCpp, text-generation-webui o Silly Tavern. No se trata de un modelo de propósito general ni de un asistente de código, sino de una herramienta especializada en texto creativo en inglés.

La relevancia actual viene de su nicho: modelos de 8B con contexto de 32K siguen siendo viables en GPU de consumo y ofrecen una alternativa local a APIs comerciales para generación de ficción y personajes. La licencia Apache 2.0 facilita su integración, aunque las afirmaciones de rendimiento del autor no están respaldadas por benchmarks públicos verificables.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K tokens (31.768 según la model card) |
| Tipos de cuantizacion | GGUF con múltiples niveles (Q2 a Q8, IQ, incluida IQ4XS IMATRIX "NEO Class") |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 52 GB con múltiples archivos) |

## Arquitectura y entrenamiento
El modelo subyacente es un transformer decoder-only de la familia Llama 3 con 8B parámetros, adaptado por Sao10K mediante fine-tuning sobre el checkpoint Llama 3 8B para tareas de rol, narración y conversación creativa. La ventana de contexto se extiende a 32K mediante ajuste del modelo base; no se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La contribución específica de esta publicación es la cuantización. DavidAU aplica lo que denomina "NEO Class Ultra Quants": cuantizaciones GGUF generadas con matrices IMATRIX y ajustes propietarios que, según el autor, elevan la calidad efectiva de un Q4/IQ4 al nivel de un Q5KM/Q6 y de un Q3/IQ3 al de un Q4KM/Q5. El autor cita una reducción de perplejidad de 6.829 puntos para IQ4XS NEO frente a IQ4XS estándar, atribuyéndola a la alta perplejidad del modelo original. No hay verificación independiente de estas cifras. Un detalle técnico relevante documentado por el autor es que, pese a la plantilla Llama 3, la plantilla de Command-R produce mejores resultados en tareas creativas, algo que el autor indica haber confirmado con varios usuarios.

## Capacidades
- Generación de texto creativo: ficción, narración de historias, descripciones de escenas y diálogos.
- Roleplay y conversación de personajes con contexto multi-turno largo (hasta 32K tokens).
- Escritura de fantasía y worldbuilding, según las etiquetas del autor.
- Uso conversacional general en inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso estructurado.
- No se documenta visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso
- Generación de ficción interactiva en local: el modelo mantiene coherencia narrativa en sesiones largas gracias a los 32K tokens de contexto, lo que permite conservar el historial completo de una partida de rol sin truncar.
- Creación de personajes para Silly Tavern: su fine-tuning específico para roleplay y las recomendaciones de muestreo del autor (smoothing_factor 1.5-2.5) lo hacen adecuado para chatbots de personaje persistentes.
- Escritura asistida de relatos y novelas: útil para borradores de escenas, variaciones de diálogo y expansión de premisas, ejecutándose en una estación de trabajo sin depender de APIs.
- Prototipado de aplicaciones de narrativa generativa: al estar en GGUF y con licencia Apache 2.0, puede integrarse en demos de videojuegos narrativos o herramientas de escritura sin restricciones comerciales.
- Generación de contenido de fantasía y worldbuilding: descripciones de entornos, trasfondos de facciones y textos de ambientación para proyectos de rol de mesa o videojuegos.
- Experimentación con cuantizaciones en investigación: la publicación de múltiples niveles GGUF, incluida la variante IMATRIX NEO, permite estudiar el impacto de la cuantización en la calidad de salida creativa.
- Despliegue en hardware de consumo para uso personal: al ser un 8B, corre en GPU de gama media y en CPU con llama.cpp, lo que lo hace viable como asistente creativo offline.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card cita únicamente una comparación cualitativa de perplejidad entre cuantizaciones (IQ4XS NEO frente a IQ4XS estándar, con una diferencia de 6.829 puntos) y ejemplos de generación con una misma prompt, sin cifras de MMLU, HumanEval, GSM8K ni evaluaciones estandarizadas del modelo base o del fine-tune.

## Requisitos de hardware
- VRAM estimada: un 8B en Q4/IQ4 requiere aproximadamente 5-6 GB; en Q5/Q6 en torno a 6-8 GB; en Q8 cerca de 9-10 GB; en FP16 unos 16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100 o H100 no son necesarias para este tamaño, aunque permiten mayor throughput con vLLM (sujeto a soporte del formato).
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB o RTX 4060 Ti 16 GB en cuantizaciones Q4-Q6; en Q4 también es viable en GPU de 8 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, KoboldCpp, oobabooga/text-generation-webui (con loader llama_HF y archivos de configuración del modelo fuente), Silly Tavern como frontend, Ollama tras importar el GGUF; vLLM y TGI no son la vía natural para GGUF.
- Latencia y throughput: no disponibles de forma medida; el autor recomienda ajustar smoothing_factor y repetition penalty para la calidad de salida, no para el rendimiento.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| L3-8B-Stheno-v3.3-32K (Sao10K) | 8B | 32K | Rol y creatividad | Apache 2.0 (según esta ficha derivada) | Hugging Face, safetensors |
| Esta versión NEO IMATRIX GGUF (DavidAU) | 8B | 32K | Rol y creatividad, cuantizada | Apache 2.0 | Hugging Face, GGUF |
| Llama 3 8B Instruct (Meta) | 8B | 8K | Asistente general | Llama 3 Community License | Hugging Face, safetensors, GGUF comunitarios |
| Mistral 7B Instruct | 7B | 32K | Asistente general | Apache 2.0 | Hugging Face, safetensors, GGUF |

La comparación con Llama 3 8B Instruct y Mistral 7B Instruct es la más directa por tamaño y despliegue, pero conviene señalar que Stheno está especializado en creatividad y rol, mientras los otros dos priorizan instrucciones generales. No se dispone de datos de benchmarks comparativos entre ellos en la información proporcionada.

## Limitaciones y advertencias
- El modelo solo declara inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Es un fine-tune creativo: puede producir contenido inapropiado o poco alineado en contextos profesionales; no debe usarse como asistente de atención al cliente sin filtros.
- Riesgo de alucinación inherente a los modelos de 8B, especialmente en tareas factuales.
- Las afirmaciones del autor sobre la calidad superior de las cuantizaciones NEO no están verificadas por terceros; trátelas como marketing hasta disponer de evaluaciones independientes.
- La recomendación de usar la plantilla de Command-R en lugar de Llama 3 implica que la configuración por defecto puede degradar la calidad; es necesario ajustar la plantilla manualmente.
- La licencia Apache 2.0 se aplica a esta publicación, pero conviene verificar la licencia del modelo base Llama 3 de Meta, ya que los derivados de Llama 3 pueden arrastrar restricciones adicionales.
- El repo ocupa 52 GB por incluir múltiples cuantizaciones; la descarga selectiva de un solo archivo es imprescindible en entornos con almacenamiento limitado.
- No hay soporte documentado de tool calling, agentes o multimodalidad; no es adecuado para pipelines de automatización que requieran esas capacidades.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DavidAU/L3-8B-Stheno-v3.3-32K-Ultra-NEO-V1-IMATRIX-GGUF
- Modelo base de Sao10K: https://huggingface.co/Sao10K/L3-8B-Stheno-v3.3-32K
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Archivos fuente y configuraciones del autor: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Perfil del autor: https://huggingface.co/DavidAU
