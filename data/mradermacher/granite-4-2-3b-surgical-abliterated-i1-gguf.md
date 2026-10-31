# mradermacher/Granite-4.2-3B-Surgical-Abliterated-i1-GGUF

## Resumen

Granite-4.2-3B-Surgical-Abliterated-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo medismera/Granite-4.2-3B-Surgical-Abliterated, publicada por mradermacher, un cuantizador muy prolífico de la comunidad de Hugging Face. El modelo base es una versión "abliterated" (con los mecanismos de rechazo alineados eliminados mediante la técnica conocida como surgical alignment) de un modelo de la familia Granite de 3B parámetros, orientada originalmente a IBM. El resultado es un modelo de lenguaje causal en inglés sin las salvaguardas de rechazo del modelo original.

Este repositorio no es un modelo nuevo en sí, sino un servicio de cuantización: ofrece más de veinte variantes GGUF que van desde IQ1_S (1,0 GB) hasta Q6_K, permitiendo ejecutar el modelo en hardware muy modesto, desde teléfonos móviles hasta GPUs de consumo. La cuantización con imatrix conserva mejor la calidad que las cuantizaciones estáticas equivalentes, especialmente en los niveles bajos.

Su relevancia actual radica en la demanda de modelos locales, ligeros y sin restricciones de alineación para investigación, red teaming y casos de uso creativos, así como en la utilidad de las cuantizaciones imatrix para despliegues en dispositivos de borde. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), familia Granite |
| Parametros totales | 3.659.737.600 (~3,66 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base está disponible en safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Granite 4.2 de 3B parámetros, una arquitectura transformer de lenguaje causal. Sobre ese modelo se aplicó un proceso de "abliteración" mediante surgical alignment, una técnica que identifica y neutraliza las direcciones internas responsables de los comportamientos de rechazo, eliminando las negativas del modelo sin reentrenarlo por completo. No se dispone de información pública detallada sobre el proceso de entrenamiento original, el número de tokens ni la composición del dataset del modelo base en la información proporcionada.

La aportación de mradermacher no modifica los pesos: genera cuantizaciones GGUF ponderadas con imatrix (importance matrix), una técnica que calcula estadísticas de activación sobre un corpus de calibración para asignar mayor precisión a los tensores más sensibles. Esto mejora notablemente la calidad en niveles de compresión agresivos (IQ1-IQ3) frente a cuantizaciones estáticas equivalentes. También existe una versión de cuantizaciones estáticas en un repositorio hermano.

## Capacidades

- Generación de texto conversacional en inglés, con el tag "conversational" en el repositorio.
- Modelo de lenguaje causal generalista de 3B parámetros, apto para tareas de razonamiento y redacción básicas acordes a su tamaño.
- Sin mecanismos de rechazo alineados (abliterated): responde a instrucciones que el modelo original rechazaría, lo que lo hace útil para investigación en seguridad y red teaming.
- Ejecutable localmente en CPU y GPU mediante cualquier runtime compatible con GGUF (llama.cpp, Ollama, LM Studio, etc.).
- No consta soporte de visión, audio ni modalidades adicionales.
- No consta información sobre tool calling, function calling ni capacidades de agente.

## Casos de uso

- Investigación en alineación y seguridad: estudiar cómo se comportan los modelos sin capas de rechazo, analizar diferencias de salida frente al modelo original y diseñar defensas.
- Red teaming de sistemas LLM: usar el modelo como componente de ataque o evaluación en pipelines de seguridad de aplicaciones basadas en modelos.
- Asistentes locales en hardware modesto: con la variante Q4_K_M (2,3 GB) funciona en portátiles sin GPU dedicada, útil para chatbots personales offline.
- Despliegue en dispositivos de borde: las variantes IQ1_S/IQ2 (1,0-1,5 GB) permiten ejecución en móviles, Raspberry Pi o microservicios con memoria muy limitada.
- Escritura creativa sin filtros: generación de ficción o contenido que el modelo original bloquearía por criterios de alineación.
- Prototipado rápido de aplicaciones LLM: el bajo tamaño permite iterar con muchos contextos simultáneos en una sola GPU de consumo o incluso en CPU.
- Ficheros imatrix para cuantización propia: el archivo de 0,1 GB permite a terceros generar sus propias cuantizaciones ponderadas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~1,5 GB (IQ1_S, 1,0 GB de fichero más contexto) hasta ~7-8 GB para Q6_K; la variante recomendada Q4_K_M ocupa 2,3 GB más la memoria del contexto.
- GPU recomendadas: cualquier GPU de consumo con 4 GB de VRAM ejecuta cómodamente Q4_K_M/Q5_K_M (RTX 3060, RTX 4060); con 8 GB cabe la cuantización máxima sin problemas. No se necesita A100 ni H100.
- Cabe sobradamente en GPUs de consumo y también funciona en CPU pura: un portátil con 8 GB de RAM ejecuta Q4_K_M a velocidades prácticas.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, KoboldCpp, y cualquier stack basado en GGUF; el modelo base en safetensors es compatible con transformers y vLLM/TGI.
- Latencia y throughput: no disponible; al ser un modelo de 3B cuantizado, se esperan velocidades de decodificación altas incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| Granite-4.2-3B-Surgical-Abliterated-i1-GGUF (este) | 3,66 B | GGUF imatrix | Apache 2.0 | Abliterated, cuantizaciones desde 1,0 GB |
| mradermacher/Granite-4.2-3B-Surgical-Abliterated-GGUF | 3,66 B | GGUF estático | Apache 2.0 | Mismo modelo con cuants estáticos, sin imatrix |
| medismera/Granite-4.2-3B-Surgical-Abliterated | 3,66 B | safetensors | Apache 2.0 | Modelo base sin cuantizar, para GPU/CPU en FP16 |

Alternativas de otros fabricantes con perfiles similares (modelos abliterated de ~3B, como versiones abliterated de Llama o Qwen en este rango) no están documentadas en la información proporcionada: no disponible.

## Limitaciones y advertencias

- Al ser un modelo abliterated, carece de las salvaguardas de seguridad del modelo original: puede generar contenido ofensivo, peligroso o inapropiado. Su uso conlleva responsabilidad legal y ética para el desplegador.
- Riesgo de alucinación típico de modelos de 3B parámetros, agravado en cuantizaciones agresivas (IQ1/IQ2), que el propio autor etiqueta como "for the desperate" y "very low quality".
- Soporte limitado al inglés; no es adecuado para tareas en castellano con garantías de calidad.
- Longitud de contexto no documentada en este repositorio; debe consultarse la ficha del modelo base antes de diseñar aplicaciones con documentos largos.
- No hay datos de benchmarks publicados: el rendimiento real en tareas concretas debe validarse antes de pasar a producción.
- La abliteración mediante surgical alignment puede degradar capacidades generales del modelo, no solo eliminar rechazos; conviene comparar con el modelo base.
- La licencia Apache 2.0 es permisiva para uso comercial, pero el contenido generado sin filtros puede violar términos de servicio de plataformas o normativa sectorial (por ejemplo, en entornos médicos, pese a la etiqueta "surgical" del nombre, no hay evidencia de especialización clínica en la información disponible).

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/Granite-4.2-3B-Surgical-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/medismera/Granite-4.2-3B-Surgical-Abliterated
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Granite-4.2-3B-Surgical-Abliterated-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#Granite-4.2-3B-Surgical-Abliterated-i1-GGUF
- Guía de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
