# m8than/Qwen38-2.4T-GG

## Resumen

m8than/Qwen38-2.4T-GG es una conversión cuantizada a 4 bits del modelo Qwen/Qwen3.8-2.4T-A95B, publicada por el usuario m8than en HuggingFace. Se trata de un modelo de generación de texto de tipo transformer con mezcla de expertos (MoE), según la etiqueta de arquitectura `qwen3_5_moe_text` que acompaña al repositorio. El interés principal de esta ficha es que se trata de una cuantización de un modelo de escala muy grande orientada a despliegue en hardware AMD (etiquetas `rocm` y `sglang`), lo que la sitúa en el nicho de inferencia eficiente de MoE masivos fuera del ecosistema CUDA.

Existe una discrepancia importante en los datos publicados: el nombre del modelo y el campo de modelo base apuntan a 2,4 billones de parámetros totales con 95.000 millones activos (nomenclatura A95B), mientras que el recuento real de parámetros en los ficheros safetensors del repositorio es de 349.164.943.232 (unos 349,16 mil millones). El tamaño del repositorio, 1.298,1 GB, es coherente con una cuantización de 4 bits de un modelo de 2,4 billones de parámetros, pero no con una de 349.000 millones (que ocuparía del orden de 180 GB). Esta contradicción no se resuelve con la información disponible y debe verificarse antes de cualquier uso.

El acceso al repositorio está restringido: requiere aceptar condiciones en HuggingFace. En el momento de redactar esta ficha el modelo acumula 0 descargas y 0 "me gusta", por lo que no existe validación comunitaria documentada de su funcionamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) de tipo texto, segun la etiqueta `qwen3_5_moe_text` |
| Parametros totales | 349.164.943.232 (unos 349,16 mil millones) segun los ficheros safetensors del repositorio; el nombre del modelo y el modelo base indican 2,4 billones (discrepancia sin resolver) |
| Parametros activos | no disponible (la nomenclatura del modelo base, A95B, sugiere 95.000 millones activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits con tipo de dato `e2m1` (coma flotante de 4 bits); no se documentan otros formatos en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | `qwen3.8-max`, etiquetada en HuggingFace como `other`; acceso restringido (gated) |
| Formato de pesos | safetensors (tamano del repositorio: 1.298,1 GB) |

## Arquitectura y entrenamiento

La etiqueta `qwen3_5_moe_text` y la pertenencia a la familia Qwen3.8 indican una arquitectura transformer de tipo mezcla de expertos (MoE) con procesamiento exclusivamente de texto, es decir, sin torre de visión ni de audio declarada. El modelo base es Qwen/Qwen3.8-2.4T-A95B, del que no se proporciona información sobre composición del dataset, número de tokens de entrenamiento, fases de ajuste (SFT, RLHF, DPO) ni innovaciones de atención o decodificación.

Lo que sí se documenta es el proceso de post-entrenamiento aplicado por el autor de la conversión: una cuantización a 4 bits con tipo de dato `e2m1`, típica de los esquemas de cuantización de bloque tipo MXFP4 empleados para reducir el coste de memoria de MoE de gran tamaño. Las etiquetas `rocm` y `sglang` sugieren que la conversión se ha preparado y probado para el motor de inferencia SGLang sobre hardware AMD (ROCm), no sobre CUDA. No se publica ninguna ficha técnica, informe de evaluación ni descripción del procedimiento de calibración de la cuantización.

## Capacidades

- Generación de texto: es la tarea declarada en el pipeline del repositorio (`text-generation`).
- Conversación: el repositorio incluye la etiqueta `conversational`, lo que indica que el modelo base está ajustado para diálogo multi-turno.
- Procesamiento exclusivamente de texto: no hay etiquetas ni documentación que indiquen capacidades de visión, audio o multimodalidad.
- Razonamiento, matemáticas y generación de código: no disponible; no se documentan capacidades específicas ni resultados de evaluación.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el repositorio no declara lista de idiomas.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidad de despliegue en AMD ROCm mediante SGLang: indicada por las etiquetas del repositorio.

## Casos de uso

- Despliegue de un MoE de gran escala sobre hardware AMD: el repositorio está etiquetado con `rocm` y `sglang`, de modo que su caso de uso más directo es servir el modelo con SGLang sobre aceleradores AMD Instinct, evitando la dependencia de CUDA en infraestructura ya existente.
- Investigación sobre cuantización de MoE masivos: la conversión a 4 bits con tipo `e2m1` de un modelo de esta escala es un objeto de estudio en sí mismo, útil para medir la degradación de calidad frente a los pesos en precisión completa del modelo base.
- Procesamiento por lotes de texto a gran volumen: para tareas de resumen, extracción o reformateo sobre corpus extensos, siempre que se confirme la ventana de contexto, que no está documentada.
- Generación de documentación técnica y código: si el modelo base conserva las capacidades habituales de la familia Qwen para código, podría integrarse en pipelines internos de generación de documentación; no obstante, no hay evaluación publicada que lo respalde.
- Asistente conversacional multi-turno: la etiqueta `conversational` permite plantearlo como motor de diálogo, pero sin datos de contexto máximo ni de idiomas soportados no es posible dimensionar la memoria de caché KV necesaria.
- Banco de pruebas para inferencia distribuida: por su tamaño de repositorio (1.298,1 GB) y su naturaleza MoE, es un caso de prueba exigente para estrategias de reparto de expertos entre nodos, offloading a CPU y cuantización en tiempo de ejecución.
- Evaluación comparativa de motores de inferencia: puede emplearse para comparar SGLang frente a vLLM en hardware AMD con un modelo de gran tamaño, aunque no se publican cifras de latencia o throughput de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos en 4 bits según el recuento de safetensors (349,16 mil millones de parámetros): aproximadamente 175 GB, más el overhead de escalas de cuantización, lo que sitúa el requisito práctico en torno a 180-190 GB de memoria de acelerador.
- Si el modelo real fuese de 2,4 billones de parámetros, los pesos en 4 bits ocuparían del orden de 1,2 TB, cifra coherente con los 1.298,1 GB del repositorio; en ese escenario el despliegue requeriría un clúster multi-nodo.
- Espacio en disco: 1.298,1 GB para el repositorio completo.
- GPU recomendadas para el escenario de 349.000 millones: 4 tarjetas A100 de 80 GB (320 GB), 3 H100 de 80 GB (240 GB) o 2 H200 de 141 GB (282 GB). Para el escenario de 2,4 billones, haría falta un nodo de 8 H100/H200 como mínimo y probablemente varios.
- GPU de consumo: no cabe en ninguna GPU de consumo individual. Con 24 GB de VRAM (RTX 4090, RTX 3090) solo sería viable con offloading agresivo de expertos a memoria del sistema, a costa de una latencia muy alta.
- Opciones de despliegue: SGLang con backend ROCm es la opción indicada por las etiquetas del repositorio; vLLM es la alternativa habitual para MoE de gran tamaño. El formato publicado es safetensors, no GGUF, por lo que llama.cpp u Ollama requerirían una conversión adicional que no se proporciona.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| m8than/Qwen38-2.4T-GG (este modelo) | 349,16 B segun safetensors | no disponible | no disponible | qwen3.8-max (`other`) | Acceso restringido en HuggingFace |
| Qwen/Qwen3.8-2.4T-A95B (modelo base) | 2,4 B segun nomenclatura | 95 B segun nomenclatura | no disponible | qwen3.8-max | Repositorio del modelo base en HuggingFace |
| DeepSeek-V3 (referencia de la categoria MoE masiva) | 671 B | 37 B | 128 K | MIT con condiciones de uso | Pesos abiertos en HuggingFace |
| Qwen3-235B-A22B (referencia de la familia Qwen) | 235 B | 22 B | 128 K ampliable | Apache 2.0 | Pesos abiertos en HuggingFace |

Los datos de DeepSeek-V3 y Qwen3-235B-A22B proceden de información pública general sobre esos modelos y se incluyen solo como referencia de categoría; no forman parte de la información proporcionada en esta búsqueda y pueden no ser comparables en fecha o condiciones de evaluación. No se dispone de resultados de benchmarks de este modelo que permitan una comparación de rendimiento real.

## Limitaciones y advertencias

- Discrepancia no resuelta en el recuento de parámetros: 349,16 mil millones según safetensors frente a 2,4 billones según el nombre y el modelo base. Cualquier estimación de coste de despliegue debe verificarse contra los ficheros reales.
- Repositorio con acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar, y la licencia `qwen3.8-max` está etiquetada como `other`, por lo que las condiciones de uso comercial deben revisarse en el repositorio del modelo base.
- Sin validación comunitaria: 0 descargas y 0 "me gusta" en el momento de la consulta. No hay evidencia pública de que la conversión funcione correctamente.
- Cuantización de terceros: la conversión a 4 bits `e2m1` no la ha realizado el equipo de Qwen, sino un usuario independiente. No se documenta el procedimiento de calibración ni la pérdida de calidad asociada.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos; no se publica información sobre ajuste de seguridad, alineación o mitigaciones aplicadas.
- Idiomas soportados no declarados: no es posible garantizar un comportamiento correcto en castellano ni en ningún otro idioma concreto.
- Longitud de contexto no documentada: impide planificar memoria de caché KV y limita el diseño de aplicaciones con entradas largas.
- Naturaleza exclusivamente textual: no admite entradas de imagen, audio o vídeo según las etiquetas del repositorio.
- Sin benchmarks publicados: no hay métricas que permitan estimar la degradación de la cuantización respecto al modelo base en tareas como MMLU, HumanEval o GSM8K.
- Requisitos de hardware muy altos incluso en 4 bits: no es desplegable en una GPU de consumo sin offloading a CPU y una penalización severa de latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/m8than/Qwen38-2.4T-GG
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Resultados de la búsqueda web: las consultas realizadas devolvieron exclusivamente páginas de husos horarios de India (timeanddate.com, time.is, worldometers.info y similares), sin ninguna relación con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales sobre esta conversión.
