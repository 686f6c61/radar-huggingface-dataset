# lyber-ai/Hy4-flash-UNCENSORED-FP8

## Resumen
Hy4-flash-UNCENSORED-FP8 es una versión afinada (fine-tune) sin censura del modelo Tencent Hunyuan Hy4-flash, publicada por el usuario lyber-ai en Hugging Face. Se distribuye en formato FP8 (safetensors) y está pensada para generación de texto conversacional con capacidades de razonamiento y tool calling. El modelo base pertenece a la familia Hunyuan de Tencent, con arquitectura de mezcla de expertos (MoE) según reflejan las etiquetas del repositorio.

Con 220.260 millones de parámetros totales y un tamaño de repositorio de 291,8 GB, es un modelo de gran escala que requiere infraestructura de inferencia dedicada. Soporta siete idiomas (inglés, chino, español, francés, japonés, coreano y ruso) y declara compatibilidad con endpoints estándar de transformers. La licencia es la propia de Tencent Hunyuan, no una licencia open source permisiva.

La relevancia de esta ficha radica en su carácter de fine-tune "uncensored" sobre un modelo base propietario: conviene evaluar con cuidado las implicaciones legales y de seguridad antes de usarlo en producción, dado que la licencia del modelo base puede imponer restricciones adicionales al uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), según etiquetas del repo; detalles de capas no disponibles |
| Parametros totales | 220.260.270.502 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos publicados); otras cuantizaciones no disponibles |
| Idiomas soportados | en, zh, es, fr, ja, ko, ru |
| Licencia | tencent-hunyuan (license:other) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento
El modelo se basa en tencent/Hy4-flash, un modelo de la familia Hunyuan de Tencent. Las etiquetas del repositorio indican arquitectura MoE, pero no se proporcionan detalles sobre número de expertos activos por token, número de capas, dimensión oculta ni mecanismo de atención. El fine-tune es una modificación del modelo base orientada a eliminar restricciones de censura, aunque no se documenta el dataset de ajuste, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

No hay información disponible sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) ni sobre la composición del corpus de preentrenamiento del modelo base. La publicación en FP8 sugiere que el fine-tune se realizó o se exportó en precisión reducida para facilitar el despliegue, pero no se detalla el proceso.

## Capacidades
- Generación de texto conversacional multi-turno.
- Razonamiento (etiqueta "reasoning" en el repositorio).
- Tool calling / function calling (etiqueta "tool-calling").
- Soporte multilingüe en siete idiomas: inglés, chino, español, francés, japonés, coreano y ruso.
- Modo conversacional (etiqueta "conversational").
- Fine-tune "uncensored": orientado a reducir rechazos y filtros de contenido del modelo base.
- No se documentan capacidades de visión, audio ni agentes multi-paso más allá de lo que implique el tool calling.

## Casos de uso
- Asistente conversacional multilingüe: el modelo puede mantener diálogos en siete idiomas, lo que lo hace adecuado para atención al cliente en mercados con presencia en español, francés, japonés o coreano, siempre que se valide el cumplimiento de la licencia.
- Generación de código con tool calling: al declarar soporte de function calling, puede integrarse en pipelines que invoquen APIs externas, compiladores o linters, aunque requiere validación exhaustiva por el carácter "uncensored".
- Razonamiento asistido en investigación: útil para exploración de hipótesis y borradores técnicos donde se prefiera un modelo con menos rechazos, con revisión humana obligatoria.
- Prototipado de agentes: el soporte de tool calling permite construir agentes que consulten bases de datos o servicios web, aunque la ausencia de datos sobre contexto limita la planificación de ventanas largas.
- Traducción y localización: con cobertura de en, zh, es, fr, ja, ko y ru, puede emplearse en flujos de traducción asistida, sujeto a evaluación de calidad por idioma.
- Experimentación académica sobre alineación y censura: sirve como caso de estudio de fine-tunes "uncensored" frente al modelo base, comparando tasas de rechazo y sesgos.
- Despliegue en infraestructura propia con FP8: el formato FP8 reduce el footprint frente a BF16, facilitando servir el modelo en clústeres con GPUs de memoria alta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP8: aproximadamente 220 GB solo para pesos (220,26 mil millones de parámetros × 1 byte), más overhead de activaciones y caché KV; el repositorio ocupa 291,8 GB.
- No cabe en GPUs de consumo (RTX 4090 con 24 GB, RTX 5090 con 32 GB) ni en configuraciones multi-GPU de consumo habituales.
- GPU recomendadas: clústeres con múltiples A100 80 GB, H100 80 GB o H200; se necesitan al menos 3-4 GPUs de 80 GB solo para pesos en FP8, con margen adicional para activaciones.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para este formato FP8 y arquitectura MoE concreta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy4-flash-UNCENSORED-FP8 (este) | 220,26 B | no disponible | tencent-hunyuan | Gated en Hugging Face |
| tencent/Hy4-flash (base) | no disponible en la información | no disponible | tencent-hunyuan | Hugging Face (base) |
| Alternativas de mismo tamaño | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias
- El fine-tune "uncensored" elimina filtros del modelo base, lo que incrementa el riesgo de generar contenido dañino, ilegal o sesgado; requiere moderación externa en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones de fidelidad.
- No se documenta la longitud de contexto, lo que impide garantizar conversaciones o documentos largos.
- La licencia tencent-hunyuan (license:other) puede imponer restricciones al uso comercial y a la redistribución; es obligatorio revisar los términos antes de desplegar.
- El acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face.
- El modelo base es propiedad de Tencent; el fine-tune no está avalado por el desarrollador original.
- Solo 5 descargas y 1 like en el momento de la ficha: comunidad mínima, sin validación independiente.
- El formato FP8 puede degradar ligeramente la calidad frente a BF16; no se han publicado comparativas.
- No hay información sobre sesgos específicos por idioma ni sobre el dataset de ajuste.

## Enlaces
- Hugging Face: https://huggingface.co/lyber-ai/Hy4-flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/tencent/Hy4-flash
