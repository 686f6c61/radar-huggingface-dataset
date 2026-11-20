# junafinity/Ornith-1.5-35B-A3B-uncensored-GGUF-8bit

## Resumen

Ornith-1.5-35B-A3B-uncensored-GGUF-8bit es una cuantización Q8_0 en formato GGUF del modelo multimodal Ornith-1.5-35B-A3B, publicada por el usuario junafinity bajo la marca VeriSafe.Live. Se trata de una variante "abliterated" (uncensored), es decir, con la dirección de rechazo ablacionada en los pesos para eliminar la mayor parte de las negativas aprendidas durante el alineamiento. El modelo base procede de ornith-ai y emplea una arquitectura de tipo Mixture of Experts (MoE) con 35.505.251.456 parámetros totales, según los datos reales de safetensors, y una nomenclatura de tags que apunta a la familia Qwen3.5.

El interés de esta ficha radica en que combina tres características poco habituales en un mismo artefacto: capacidades de visión (pipeline image-text-to-text), una arquitectura MoE de 35B con activación dispersa, y una edición de pesos orientada a eliminar rechazos. El autor la presenta explícitamente como instrumento de investigación para red teaming y evaluación de seguridad defensiva, no como modelo de propósito general. La preservación de la torre de visión y del bloque MTP (multi-token prediction) es un punto destacado de la model card, ya que muchas conversiones a GGUF los descartan.

La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque las advertencias del autor sobre moderación externa son relevantes para cualquier despliegue en producción. El repositorio ocupa 77,4 GB y acumula 2.273 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), multimodal con torre de visión y bloque MTP; familia Qwen3.5 según tags |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (el sufijo A3B sugiere aproximadamente 3B activos, sin confirmación numérica en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8 bits) en este repositorio; la familia incluye también MLX 8-bit, MLX MXFP4 y safetensors bf16 en otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con mmproj separado para visión) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 35.505 millones de parámetros totales y, por la convención de nombres A3B, del orden de 3.000 millones de parámetros activos por token. Incluye una torre de visión que permite entrada image-text-to-text y un bloque de predicción multi-token (MTP), que en la variante GGUF se conserva explícitamente según la model card. La presencia de MTP es relevante porque habilita decodificación especulativa a nivel de modelo y suele mejorar el throughput en inferencia autorregresiva.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento. La edición aplicada por el publicador es una abliteración: se identifica una dirección de rechazo en el espacio de activaciones y se proyecta fuera de los pesos, un procedimiento quirúrgico que no reentrena el modelo. El autor indica que la torre de visión y las cabezas MTP no se modifican en ese proceso, y ofrece una auditoría antes/después en la model card.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y respuesta a instrucciones en formato chat.
- Procesamiento de imágenes en pipelines image-text-to-text, con torre de visión preservada.
- Predicción multi-token (MTP) para decodificación especulativa.
- Comportamiento sin rechazos en la mayoría de dominios, tras la abliteración.
- Compatibilidad declarada con endpoints (tag endpoints_compatible).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Red teaming de modelos: se usa como mitad "tratamiento" de un par controlado frente al modelo base, midiendo el techo real de capacidad del checkpoint sin la interferencia de rechazos, tal como propone el autor.
- Evaluación de filtros de entrada y clasificadores de salida: al no contribuir el modelo con negativas propias, cualquier fallo detectado en la cadena de moderación es atribuible al control defensivo y no al modelo.
- Generación de datos etiquetados para entrenar detectores de abuso: el modelo puede producir completaciones en dominios sensibles que sirven como ejemplos positivos para clasificadores de moderación.
- Investigación de interpretabilidad de rechazos residuales: comparar base frente a abliterado permite estudiar qué componentes conservan comportamiento de negativa y por qué.
- Aislamiento de superficies de ataque en bucles automáticos de red teaming: los bucles automatizados se atascan ante rechazos irrelevantes; un objetivo no renuente aísla el control bajo prueba (inyección, abuso de herramientas, exfiltración).
- Evaluación de seguridad de sistemas multimodales: la torre de visión preservada permite probar ataques y defensas que combinan imagen y texto, un vector que muchos modelos abliterados de solo texto no cubren.
- Despliegue local en llama.cpp para laboratorios: el formato GGUF Q8_0 con mmproj separado permite ejecutar el modelo en estaciones de trabajo con GPU de consumo o Apple Silicon mediante las variantes MLX de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q8_0: en torno a 35-38 GB solo para los pesos del modelo, más el mmproj de visión y el espacio de contexto; el repositorio completo ocupa 77,4 GB, aunque parte de ese tamaño puede corresponder a múltiples archivos o metadatos.
- GPU recomendadas para Q8_0: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con 2×RTX 4090/RTX 6000 Ada (48 GB) en tensor parallel.
- GPU de consumo: Q8_0 no cabe en una RTX 4090 de 24 GB; sería necesario recurrir a cuantizaciones menores (Q4_K_M, Q5_K_M) no publicadas en este repositorio, o a las variantes MLX MXFP4 para Apple Silicon.
- Apple Silicon: las variantes MLX 8-bit y MXFP4 de la misma familia están pensadas para mlx-vlm en equipos con memoria unificada de 64 GB o superior.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para GGUF; mlx-vlm para las variantes MLX; vLLM y TGI no están confirmados para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-uncensored-GGUF-8bit | 35,5B totales (MoE) | no disponible | Si | Apache 2.0 | GGUF Q8_0 | Abliterado, MTP preservado |
| Ornith-1.5-35B-A3B (base) | 35,5B totales (MoE) | no disponible | Si | Apache 2.0 | safetensors | Modelo original con alineamiento intacto |
| Ornith-1.5-9B-uncensored | ~9B | no disponible | Si | Apache 2.0 | safetensors bf16 | Versión menor de la misma familia |
| Ornith-1.5-35B-A3B-uncensored-MLX-8bit | 35,5B totales (MoE) | no disponible | Si | Apache 2.0 | MLX 8-bit | Sin bloque MTP, para Apple Silicon |

## Limitaciones y advertencias

- La abliteración elimina una dirección de rechazo, no una política: sobreviven negativas en conversaciones multi-turno, con steering por system prompt y en la ruta de visión, según advierte el propio autor.
- No debe exponerse como endpoint público sin una capa de moderación independiente; el despliegue asume la responsabilidad de los guardrails que el modelo base incorporaba.
- Riesgo elevado de generar contenido dañino, ilegal o sexualmente explícito en dominios sensibles; el uso previsto es investigación y red teaming.
- Sesgos conocidos del modelo base no documentados en la información proporcionada.
- Riesgo de alucinación no cuantificado; sin benchmarks publicados no es posible estimar su fiabilidad factual.
- Idiomas soportados no especificados, lo que impide garantizar calidad fuera del inglés sin evaluación propia.
- Longitud de contexto no disponible, lo que complica planificar despliegues con prompts largos o documentos extensos.
- El tamaño Q8_0 (77,4 GB de repositorio) limita el despliegue a hardware de gama alta o a cuantizaciones menores no publicadas en este repositorio.
- Cualquier comparación de rendimiento frente al modelo base debe reportarse como delta medido en los propios prompts, no como cifra absoluta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-GGUF-8bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Colección de la familia: https://huggingface.co/collections/junafinity/ornith-15-uncensored-6a896c737cf40ad660af2ebd
- Variante MLX 8-bit: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-8bit
- Variante MLX MXFP4: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-MXFP4
- Variante 9B safetensors: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- Variante 9B MLX: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-MLX-8bit
- Variante 9B GGUF: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-GGUF-8bit
- Sitio del publicador: https://verisafe.live
- Contacto del publicador: info@verisafe.live
