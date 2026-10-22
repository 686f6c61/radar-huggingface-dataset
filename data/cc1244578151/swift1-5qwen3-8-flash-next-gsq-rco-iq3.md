# cc1244578151/Swift1.5Qwen3.8-Flash-Next-GSQ-RCO-IQ3

## Resumen

Este repositorio contiene una cuantización GGUF de tipo IQ3 del modelo Swift-1.5-Qwen3.8-Flash-Next, una variante «abliterated» (dirección de rechazo eliminada) del derivado de razonamiento eficiente de UkisAI sobre Qwen3.8-Flash-Next. La operación no es un fine-tuning: se han transplantado 144 tensores de las 48 capas que escriben en el flujo residual, sustituyéndolos por los de una release ya abliterada, dejando intactos los valores y escalas aprendidos por GSQ. El resultado declara un cambio de tamaño inferior al 0,2 % respecto al upstream y verificación blake2b tensor a tensor.

Arquitectónicamente es un transformer con mezcla de expertos (MoE) de 176.943.899.520 parámetros totales según los safetensors del modelo base, con pipeline declarado `image-text-to-text` y soporte de inglés y chino. Su interés práctico está en dos ejes: la eficiencia de razonamiento (la model card cifra un 52 % menos de tokens de pensamiento en benchmarks de código y un 34,8 % por debajo del base) y la ausencia de alineamiento de rechazo, lo que lo orienta a red-teaming y generación de datos sin filtros.

Es un artefacto de inferencia publicado por una cuenta comunitaria (`cc1244578151`), con 0 descargas y 0 likes en el momento de la consulta, licencia `swift-open-license-1.0` (etiquetada como `other` en HuggingFace) y sin resultados de benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 48 capas según la model card; multimodal (`image-text-to-text`) |
| Parámetros totales | 176.943.899.520 (~176,9 B), dato de safetensors del modelo base |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (etiquetado como `long-context`, sin cifra publicada) |
| Tipos de cuantización | GGUF: IQ3_S, IQ3_XXS, IQ2_XS y Q2_0 (este repo corresponde a la variante IQ3); rango de 61,9 GB (Q2_0) a 77,8 GB (IQ3_S) |
| Idiomas soportados | inglés (`en`) y chino (`zh`) |
| Licencia | `swift-open-license-1.0` (campo `license: other` en HuggingFace) |
| Formato de pesos | GGUF (librería `gguf`, orientado a llama.cpp); pesos originales en safetensors |
| Modelo base | ukisai/Swift-Qwen3.8-Flash-Next (metadatos); la model card referencia ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF |
| Tamaño del repositorio | 300,8 GB |
| Verificación de integridad | blake2b por tensor, según la model card |
| Fecha de creación | 2026-10-22 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer MoE con 48 capas y ~176,9 B de parámetros totales; no se especifican el número de expertos, el ratio de activación ni la dimensión oculta. El linaje declarado es Qwen3.8-Flash-Next → Swift 1.5 (derivado de UkisAI con razonamiento eficiente) → esta cuantización GSQ-RCO. GSQ (cuantización aprendida) y RCO (asignación de presupuesto de cuantización) son las técnicas de compresión aplicadas por el upstream; este repositorio no reentrena nada, solo reinterpreta los pesos ya cuantizados.

La innovación técnica concreta de esta ficha es el transplante de tensores: se reemplazan 144 tensores (los que escriben de vuelta en el flujo residual) por los de una release abliterada equivalente, capa por capa, sin tocar los valores ni las escalas GSQ. La model card afirma que el tamaño final varía menos del 0,2 % y que la eficiencia de razonamiento de Swift 1.5 se conserva. No hay información disponible sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre las etapas de RLHF/DPO del modelo original.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo de pensamiento (`reasoning`) y perfil de eficiencia declarado: ~52 % menos tokens de pensamiento en benchmarks de código y 34,8 % por debajo del base.
- Generación de código y tareas de razonamiento técnico derivadas del modelo base.
- Capacidad multimodal declarada por el pipeline `image-text-to-text` (entrada de imagen y texto).
- Etiqueta `long-context`, sin longitud de contexto publicada.
- Comportamiento `uncensored`/`abliterated`: se elimina la dirección de rechazo, por lo que el modelo no aplica negativas de seguridad del modelo original.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado de forma explícita).

## Casos de uso

- Red-teaming y evaluación de seguridad: al no aplicar la dirección de rechazo, sirve para generar prompts adversarios, jailbreaks controlados y respuestas que prueben clasificadores y filtros de contenido en pipelines propios.
- Generación de datos sintéticos sin filtros: útil para construir datasets de entrenamiento o de contraste que el modelo alineado rechazaría, con la ventaja de los ~52 % menos de tokens de pensamiento (menor coste por muestra).
- Asistentes de código con coste de razonamiento reducido: el perfil token-efficient abarata la factura por petición en tareas tipo generación de funciones, refactorización o explicación de código, siempre que se valide la calidad con evaluación propia.
- Procesamiento de documentación técnica bilingüe inglés-chino: el soporte `en`/`zh` y la etiqueta de contexto largo encajan en resumen y extracción sobre corpus documentales, con verificación previa de la ventana real disponible en el GGUF.
- Investigación sobre cuantización: comparar la fidelidad de IQ3_S, IQ3_XXS, IQ2_XS y Q2_0 frente al upstream safetensors permite medir la degradación de la cuantización GSQ-RCO en un modelo de 176,9 B.
- Despliegue on-premise aislado: el formato GGUF y la ausencia de dependencias propietarias permiten ejecutarlo en infraestructura propia con llama.cpp, algo relevante para entornos con datos que no pueden salir de la organización.
- Análisis de documentos con imagen (OCR, descripción de figuras): viable solo si se dispone del proyector multimodal correspondiente, no incluido en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas cifras cuantitativas de la model card son de eficiencia, no de calidad:

| Métrica declarada | Valor | Fuente |
|---|---|---|
| Reducción de tokens de pensamiento en benchmarks de código | ~52 % frente al base | model card del autor |
| Eficiencia de razonamiento frente al base | 34,8 % por debajo | model card del autor |
| Variación de tamaño tras el transplante de tensores | < 0,2 % | model card del autor |

No hay datos de precisión que confirmen que el transplante de 144 tensores no degrada la calidad más allá de la verificación de integridad blake2b.

## Requisitos de hardware

- VRAM estimada para inferencia: ~78 GB de pesos en IQ3_S más caché KV; ~62 GB en Q2_0. Con contexto largo, el consumo de caché KV puede añadir decenas de GB según configuración.
- GPU recomendadas: H100 80 GB (muy justo en IQ3_S), 2× A100 80 GB o 2× H100 80 GB para IQ3_S con contexto amplio; A100/H100 80 GB para Q2_0 con contexto moderado.
- GPU de consumo: no cabe en una sola RTX 4090/5090 de 24-32 GB. Requiere 3-4 GPU de 24-32 GB, o descarga parcial a RAM del sistema (por ejemplo 128 GB DDR5) con offload en llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama con Modelfile personalizado, LM Studio, `llama-cpp-python`. vLLM solo con soporte GGUF experimental. TGI no soporta GGUF de forma nativa: exigiría los safetensors originales.
- Latencia y throughput: no disponible. Al ser MoE de 176,9 B, el rendimiento estará dominado por el ancho de banda de memoria y por el número de expertos activos por token, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización / tamaño | Alineamiento | Licencia |
|---|---|---|---|---|---|
| Este repo (IQ3, abliterated) | 176,9 B | no disponible | GGUF IQ3_S, 77,8 GB | eliminado (abliterated) | swift-open-license-1.0 |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF (upstream) | 176,9 B | no disponible | GGUF GSQ-RCO, cuatro niveles | presente | swift-open-license-1.0 |
| SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | no disponible | no disponible | GGUF, abliterated | eliminado | no disponible en la información |
| Qwen3.8-Flash-Next (modelo original) | no disponible | no disponible | safetensors (no confirmado) | presente | no disponible en la información |

No se dispone de datos de benchmarks ni de especificaciones verificadas de las alternativas, por lo que no es posible establecer una comparación de rendimiento. La búsqueda web realizada no devolvió resultados técnicos relevantes sobre ninguno de estos modelos.

## Limitaciones y advertencias

- El alineamiento de seguridad está eliminado por diseño: no debe desplegarse de cara a usuarios finales sin una capa de filtrado propia y una evaluación de riesgo previa.
- Licencia `swift-open-license-1.0` registrada como `other`: hay que leer el LICENSE enlazado antes de cualquier uso comercial; no se ha verificado en la información disponible si permite uso comercial.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado ni evaluado.
- Cuantización agresiva: IQ3_S (~3,5 bits por peso) y Q2_0 (~2,8 bits por peso) son compresiones con pérdida; la degradación respecto al original no está medida con benchmarks.
- El transplante de tensores se valida por integridad (blake2b) y por cambio de tamaño, no por evaluación de calidad: no hay evidencia publicada de que las capacidades del upstream se conserven.
- Contexto real no publicado: la etiqueta `long-context` no permite planificar cargas de trabajo sin probar el límite efectivo del GGUF.
- Capacidad de visión incierta: el pipeline declara `image-text-to-text`, pero no se referencia ningún fichero `mmproj`, necesario en llama.cpp para procesar imágenes.
- Riesgo de alucinación y de respuestas plausibles pero incorrectas, habitual en modelos abliterated sin ajuste conversacional cuidadoso; sin benchmarks no hay forma de acotarlo.
- Linaje inconsistente: los metadatos apuntan a `ukisai/Swift-Qwen3.8-Flash-Next` mientras la model card apunta a `ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF`.
- Artefacto comunitario con 0 descargas y 0 likes: sin validación por terceros; conviene verificar los hashes y reproducir una evaluación mínima antes de integrarlo.
- No hay información sobre tool calling ni uso agéntico; no asumir soporte de function calling sin probarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cc1244578151/Swift1.5Qwen3.8-Flash-Next-GSQ-RCO-IQ3
- Modelo base declarado en metadatos: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Upstream citado en la model card: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Release abliterada de referencia: https://huggingface.co/SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF/blob/main/LICENSE
- README en chino: https://huggingface.co/SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- La búsqueda web no devolvió papers, blogs ni repositorios adicionales relevantes.
