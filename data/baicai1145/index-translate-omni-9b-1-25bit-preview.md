# baicai1145/Index-Translate-omni-9B-1.25bit-preview

## Resumen

Index-Translate-omni-9B-1.25bit-preview es una version quantizada a 1,25 bits del modelo de traduccion Index-Translate-omni-9B, publicada por el usuario baicai1145 en Hugging Face. Se trata de una "preview" (checkpoint intermedio, paso 8.500 de entrenamiento) generada con el framework de cuantizacion ternaria Sherry, presentado en el paper arXiv:2601.07892 (ACL 2026), que combina sparsity fina 3:4, empaquetado de 4 pesos en 5 bits, escalado de grupo por AbsMean y tamano de grupo 256.

El modelo resuelve el problema de desplegar un traductor de ~9.000 millones de parametros en entornos con memoria muy limitada: al reducir los pesos a ternarios empaquetados, el repositorio ocupa solo 5,1 GB frente a los ~18 GB que requeriria una version BF16 densa. La relevancia actual radica en que es una de las primeras aplicaciones publicas del kernel STQ1_0 para llama.cpp (PR #22836) y del ecosistema Sherry a un modelo de traduccion, con un formato de pesos compatible con los lanzamientos 1.25bit de Tencent Hy-MT.

Es importante senalar que se trata de un checkpoint de vista previa (mitad del annealing, epsilon aproximado de 0,05 en forma de inferencia puramente cuantizada), con cero descargas y cero likes en el momento de la consulta, y sin model card que detalle idiomas, benchmarks o condiciones de licencia mas alla de "other".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas mlp, self_attn y linear_attn (hibrida atencion completa/linear); detalles completos no disponibles |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 1,25 bits ternario empaquetado (STQ1_0: 3:4 fine-grained sparsity, 4 pesos por 5 bits, AbsMean group scaling, group size 256); pesos densos BF16 fake-quantized |
| Idiomas soportados | no disponible |
| Licencia | other (sin terminos detallados en la model card) |
| Formato de pesos | safetensors (BF16 fake-quantized denso) y GGUF (STQ1_0 empaquetado) |

## Arquitectura y entrenamiento

El modelo parte de Index-Translate-omni-9B, un transformer de ~8,95 B de parametros que combina capas de atencion completa (self_attn) con capas de atencion linear (linear_attn), segun la lista de modulos cuantizados de la model card. La cuantizacion afecta a 200 capas lineales dentro de mlp, self_attn y linear_attn; los embeddings, el lm_head, las normas y las proyecciones pequenas se mantienen en BF16. El resultado es un checkpoint denso en BF16 con pesos "fake-quantized", es decir, con los valores ternarios materializados en BF16 para poder desplegarse con transformers sin kernel especial, mas una version GGUF empaquetada para llama.cpp.

El proceso de entrenamiento es un QAT con destilacion en dos fases: primero 2.000 pasos de adaptacion QAT desde el modelo base y despues 10.000 pasos de destilacion QAD, de los cuales la preview corresponde al paso 8.500. La perdida combina CAKLD y entropia cruzada (KL forward/backward ponderada por la confianza del teacher), con un schedule de "annealing residual synapse" (Arenas) con epsilon de 0 a 1, cosine y vuelta a 0; en el paso 8.500 epsilon es aproximadamente 0,05, lo que corresponde a la forma de inferencia puramente cuantizada. Se usan maestros en BF16 y el optimizador AdamW8bit.

## Capacidades

- Traduccion automatica: es la tarea declarada en el pipeline (`translation`) y el proposito del modelo base Index-Translate-omni-9B.
- Generacion de texto conversacional: la etiqueta `conversational` sugiere uso en dialogos, aunque no se detalla el formato de prompt.
- Capacidad multilingue: no disponible; la model card no enumera idiomas.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o modo agentico: no disponible.
- Vision, audio u otras modalidades: no disponible (el sufijo "omni" del nombre no se acompana de especificacion alguna en la informacion proporcionada).
- Modo thinking: no disponible.

## Casos de uso

- Traduccion en dispositivos con poca memoria: con 5,1 GB de repositorio y pesos de 1,25 bits, el modelo puede cargarse en GPUs de consumo medio o incluso en CPU con llama.cpp, lo que permite traducir localmente sin depender de la nube.
- Traduccion por lotes en servidores modestos: el formato GGUF STQ1_0 con el kernel del fork llama.cpp-stq1 permite procesar volumenes de texto en hardware sin aceleradores de gama alta.
- Traduccion integrada en editores o herramientas de escritorio: al ocupar una fraccion del espacio de un modelo de 9 B en BF16, es viable empaquetarlo en aplicaciones de escritorio con requisitos de instalacion reducidos.
- Prototipado e investigacion sobre cuantizacion ternaria: sirve como referencia reproducible del pipeline Sherry (QAT + QAD con Arenas) aplicado a traduccion, util para estudiar la degradacion de calidad a 1,25 bits.
- Evaluacion de kernels STQ1_0 en Metal/MetalFX: los builds disponibles del fork permiten probar el rendimiento del kernel en Apple Silicon para tareas de traduccion interactiva.
- Filtrado y traduccion de contenido en pipelines de datos: un traductor de 9 B cuantizado puede desplegarse en nodos de preprocesamiento para normalizar corpus multilingues antes de entrenar otros modelos.
- Traduccion en entornos con requisitos estrictos de huella de memoria: cuando el presupuesto de VRAM es inferior a 8 GB, esta variante es una de las pocas opciones de 9 B disponibles en formato ternario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 5,1 GB en el repositorio; en inferencia con el GGUF STQ1_0 se puede esperar un consumo cercano a esa cifra mas el overhead de contexto y buffers del kernel (estimacion no confirmada por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabria en GPUs de consumo con 8 GB o mas, pero el autor no lo especifica.
- Cabe en GPU de consumo: probablemente si, dado el tamano de 5,1 GB, aunque no hay confirmacion oficial.
- Opciones de despliegue: transformers (safetensors BF16 fake-quantized), llama.cpp mediante el fork llama.cpp-stq1 con el kernel STQ1_0 (PR #22836); builds Metal/MetalFX disponibles. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Index-Translate-omni-9B-1.25bit-preview | ~8,95 B | no disponible | 1,25 bits ternario (STQ1_0) | other | Hugging Face, 0 descargas |
| Index-Translate-omni-9B (base) | ~8,95 B | no disponible | BF16 | no disponible | referenciado como modelo base |
| Tencent Hy-MT 1.25bit (releases citados) | no disponible | no disponible | 1,25 bits (mismo formato) | no disponible | citado en la model card como referencia de formato |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un checkpoint de vista previa (paso 8.500 de 10.000), con epsilon aproximado de 0,05 en mitad del annealing; la calidad final puede diferir de la version completa.
- La cuantizacion ternaria a 1,25 bits introduce degradacion respecto al modelo base BF16; el autor no publica metricas de esa perdida.
- No se especifican los idiomas soportados ni la composicion del corpus de entrenamiento, lo que impide evaluar cobertura linguistica.
- La licencia es "other" sin terminos detallados: no hay confirmacion de que el uso comercial este permitido; hay que contactar con el autor o revisar el modelo base antes de produccion.
- Riesgo de alucinacion y sesgos: no documentado por el autor; aplican los riesgos habituales de un traductor neuronal sin evaluacion publica.
- El despliegue GGUF requiere un fork especifico de llama.cpp (llama.cpp-stq1) y el kernel STQ1_0; no funciona con builds estandar de llama.cpp.
- El repositorio tiene cero descargas y cero likes, sin validacion externa de la comunidad.
- El sufijo "omni" sugiere capacidades multimodales, pero no hay ninguna especificacion que las confirme; no asumir vision ni audio.

## Enlaces

- Hugging Face: https://huggingface.co/baicai1145/Index-Translate-omni-9B-1.25bit-preview
- Paper Sherry (arXiv:2601.07892): https://arxiv.org/abs/2601.07892
- Kernel STQ1_0 en llama.cpp (PR #22836): no disponible como URL directa en la informacion proporcionada
- Fork llama.cpp-stq1: no disponible como URL directa en la informacion proporcionada
- Modelo base Index-Translate-omni-9B: no disponible como URL directa en la informacion proporcionada
