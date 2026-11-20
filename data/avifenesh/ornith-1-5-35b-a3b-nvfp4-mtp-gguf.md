# Avifenesh/Ornith-1.5-35B-A3B-NVFP4-MTP-GGUF

## Resumen

Ornith-1.5-35B-A3B-NVFP4-MTP-GGUF es un artefacto de servicio (serving artifact) publicado por Avifenesh sobre el modelo base ornith-ai/Ornith-1.5-35B-A3B, un transformer de tipo mixture-of-experts (MoE) con arquitectura etiquetada como qwen3_5_moe. No es un modelo nuevo: es una cuantización NVFP4 (4 bits, formato e2m1 con escalas FP8-e4m3 por cada 16 valores) empaquetada en GGUF, acompañada de una cabeza de predicción multi-token (MTP) reentrenada para decodificación especulativa. El peso principal ocupa 20,2 GB frente a los 71,9 GB del BF16 original.

Su relevancia es doble. Por un lado, demuestra una cuantización NVFP4 funcional de un MoE de ~35B parámetros totales con contexto nativo de 262.144 tokens en una sola GPU Blackwell de 96 GB. Por otro, aborda un fallo concreto del modelo base: la cabeza MTP del proveedor solo acierta con fiabilidad a profundidad 1 y colapsa en profundidades 2 y 3, lo que limita la decodificación especulativa. El autor la reentrena sobre las propias generaciones del modelo, elevando la aceptación de borradores de 0,352 a 0,431 con K=3.

El resultado es un artefacto muy específico de infraestructura: no sustituye al modelo original para uso general, sino que optimiza el rendimiento en un motor de servicio concreto (tiyuvta) sobre hardware Blackwell. Para usuarios de llama.cpp upstream u Ollama, el autor remite explícitamente a los GGUF oficiales Q4_K_M–Q8_0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta qwen3_5_moe), 41 bloques incluyendo NextN |
| Parámetros totales | 35B (denominación del modelo); el tensor safetensors del repo declara 67.141.632 |
| Parámetros activos | A3B (aproximadamente 3B activos, según nomenclatura del modelo base) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | NVFP4 (4-bit e2m1, escalas FP8-e4m3 por grupo de 16); embeddings y output head en Q5_K; normas en F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (peso principal de 20.188.038.400 bytes) |
| Vocabulario | 248.320 tokens |
| Tamaño del repo | 42,3 GB |
| Cuantizado por | Avifenesh |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Librería declarada | memra |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 41 bloques, incluyendo un bloque NextN que aloja la cabeza de predicción multi-token. La cuantización parte del GGUF BF16 oficial y aplica NVFP4 con búsqueda de escalas asistida por imatrix, manteniendo embeddings y cabeza de salida en Q5_K y las normas en F32. El peso principal resultante es de 20,2 GB y el autor indica que una única tarjeta Blackwell de 96 GB aloja estos pesos junto con la ventana completa de 262.144 tokens.

La innovación principal está en la cabeza MTP. El autor midió que la cabeza del proveedor, funcional a profundidad 1, colapsa a profundidades mayores: top-1 del siguiente token sobre datos propios retenidos de 0,80 / 0,27 / 0,13 en profundidades 1/2/3. La reentrenó congelando el tronco, sobre 4.044 prompts y aproximadamente 2,1 millones de tokens muestreados de las propias generaciones del modelo, con rollout de cadena a profundidad 3 y portador oculto autorrecursivo (la misma recurrencia que ejecuta la decodificación especulativa en servicio). Tras el entrenamiento, las mismas métricas pasan a 0,81 / 0,58 / 0,43. Solo se modifican los tensores mtp.*; el tronco, embeddings, lm_head y el resto de tensores son bytes oficiales sin cambios, y una cabeza de borrador no puede alterar la salida porque el modelo objetivo verifica cada token propuesto.

El artefacto incluye además dos variantes de cabeza de borrador: una cabeza enmascarada FR-Spec (top-32.768 rangos por generación propia, 0,9 GB) y una cabeza auto-recortada de 46 MB que reduce el lm_head del borrador de 248.320 a 32.768 filas, bajando el coste por paso de borrador de aproximadamente 221 µs a 29 µs. La verificación sigue siendo de vocabulario completo, por lo que la salida no cambia por construcción.

## Capacidades

- Generación de texto conversacional, con plantilla de chat embebida.
- Razonamiento explícito mediante modo `<think>` en la plantilla.
- Tool calling en formato XML, integrado en la plantilla de chat.
- Decodificación especulativa con cabeza MTP entrenada, con aceptación de borradores de 0,431 con K=3 en modo greedy.
- Servicio grapado y batcheado con puertas de exactitud que garantizan salida byte-idéntica al decodificado simple.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Visión: no incluida en este artefacto; el autor indica explícitamente que la torre de visión upstream no forma parte del mismo y que el uso es texto a texto.
- Contexto largo de hasta 262.144 tokens en una sola GPU Blackwell de 96 GB.

## Casos de uso

- Servicio de inferencia de alto rendimiento en Blackwell: el artefacto está diseñado para el motor tiyuvta sobre sm_120a, con decodificación especulativa, grafos y batching gated a exactitud byte-idéntica. Adecuado para despliegues que ya operen ese motor y hardware.
- Generación de código en producción con latencia reducida: los sondeos de generación de código del autor muestran aceptación de borradores de 0,540 frente a 0,388 de la cabeza del proveedor, lo que se traduce en más tokens aceptados por paso especulativo en cargas de completado de código.
- Cargas agénticas multi-paso: el soporte de tool calling XML y el modo de razonamiento permiten cadenas de llamadas a herramientas; el contexto de 262.144 tokens sostiene historiales largos de agente sin truncado.
- Procesamiento de documentos extensos: análisis, resumen o extracción sobre entradas de cientos de miles de tokens, aprovechando que una sola tarjeta de 96 GB aloja pesos y contexto completo.
- Asistente conversacional de contexto largo: conversaciones multi-turno con memoria extensa, usando la plantilla de chat embebida y el modo de razonamiento para respuestas trazables.
- Optimización de pipelines de decodificación especulativa: la cabeza auto-recortada de 46 MB y el fichero de rangos permiten experimentar con enmascarado de vocabulario del borrador; el autor reporta +10% en prompts cortos de un solo flujo y +2,9% en prefijo compartido con concurrencia 8 en una RTX PRO 6000 Blackwell.
- Sustitución de cuantizaciones más pesadas en memoria: 20,2 GB frente a 71,9 GB en BF16 permite liberar VRAM para KV cache o para servir más peticiones concurrentes en el mismo dispositivo.

## Benchmarks y rendimiento

Datos declarados por el autor, no verificados de forma independiente. La tarea es decodificación especulativa MTP con K=3, greedy, sobre sondeos de servicio de 256 tokens (código y agénticos), con A/B intercalado en la misma ventana.

| Métrica | Valor |
|---|---|
| Aceptación de borradores, cabeza MTP reentrenada (este artefacto) | 0,4309 |
| Aceptación de borradores, cabeza del proveedor (revisión superada) | 0,3523 |
| Aceptación de borradores, cabeza enmascarada FR-Spec (top-32.768 rangos propios) | 0,393 |
| Aceptación en sondeos de código, cabeza reentrenada | 0,540 |
| Aceptación en sondeos de código, cabeza del proveedor | 0,388 |
| Top-1 siguiente token, profundidad 1 (antes / después) | 0,80 / 0,81 |
| Top-1 siguiente token, profundidad 2 (antes / después) | 0,27 / 0,58 |
| Top-1 siguiente token, profundidad 3 (antes / después) | 0,13 / 0,43 |

No se han publicado resultados de benchmarks de calidad de modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible. Fuente de los datos de servicio: motor tiyuvta v0.94.0 sobre RTX PRO 6000 Blackwell.

## Requisitos de hardware

- VRAM estimada para inferencia: 20,2 GB solo para pesos; el autor indica que una tarjeta Blackwell de 96 GB aloja pesos y contexto nativo completo de 262.144 tokens.
- GPU recomendadas: RTX PRO 6000 Blackwell (sm_120a) es el hardware de referencia de las mediciones; se requiere arquitectura Blackwell para NVFP4.
- Cabe en GPU de consumo: no disponible en la información proporcionada; el formato NVFP4 depende de soporte Blackwell y el artefacto está orientado a una tarjeta de 96 GB para contexto completo.
- Opciones de despliegue: motor tiyuvta (versión ≥ v0.105.0 según la model card) y la rama NVFP4 de avifenesh/llama.cpp. NVFP4 no es un tipo de tensor de llama.cpp upstream, por lo que Ollama y llama.cpp upstream no son compatibles; el autor remite a los GGUF oficiales Q4_K_M–Q8_0 para esos entornos.
- Latencia y throughput: no se publican valores absolutos de tokens por segundo. Se reportan efectos relativos: +10% en prompts cortos de un solo flujo y +2,9% en prefijo compartido con concurrencia 8 al usar la cabeza auto-recortada; reducción del coste por paso de borrador de aproximadamente 221 µs a 29 µs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-NVFP4-MTP-GGUF (este artefacto) | 35B totales, ~3B activos | 262.144 | NVFP4 + Q5_K | MIT | GGUF en HF, requiere motor tiyuvta o rama NVFP4 de llama.cpp |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35B totales, ~3B activos | 262.144 | BF16 | MIT | Pesos originales en HF |
| ornith-ai/Ornith-1.5-35B-A3B-GGUF (oficial) | 35B totales, ~3B activos | 262.144 | Q4_K_M–Q8_0 | MIT | GGUF en HF, compatible con llama.cpp upstream y Ollama |

La comparación relevante es frente al modelo base y a sus GGUF oficiales: este artefacto reduce el peso de 71,9 GB a 20,2 GB y añade una cabeza MTP reentrenada, a cambio de atarse a un motor y una rama de llama.cpp específicos. No se dispone de datos de benchmarks de calidad que permitan comparar frente a otros MoE de tamaño similar.

## Limitaciones y advertencias

- Artefacto de infraestructura, no modelo general: NVFP4 no es un tipo de tensor de llama.cpp upstream; fuera del motor tiyuvta o de la rama NVFP4 de avifenesh/llama.cpp no es utilizable.
- Dependencia de hardware: requiere GPU Blackwell (sm_120a); no hay datos de funcionamiento en arquitecturas anteriores.
- Sin torre de visión: el artefacto es texto a texto y excluye explícitamente la torre de visión del modelo base.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe en la model card.
- Benchmarks no verificados: todas las cifras de aceptación y de top-1 proceden del autor, marcadas como no verificadas, y se midieron con un motor y unos sondeos propios, no con suites estándar.
- Las métricas reportadas miden velocidad de decodificación especulativa, no calidad de las respuestas; no hay evaluación de MMLU, HumanEval ni similares.
- La cabeza MTP solo afecta a la aceptación de borradores: no puede cambiar la salida, pero un rendimiento especulativo inferior al declarado degrada el throughput sin avisar de otro modo.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base, que no se detallan aquí.
- Licencia MIT permite uso comercial, pero la viabilidad práctica en producción depende de la disponibilidad y estabilidad del motor tiyuvta y de la rama no oficial de llama.cpp.
- El campo de parámetros totales del tensor safetensors (67.141.632) no concuerda con la denominación de 35B del modelo; conviene tratar la cifra de 35B como la referencia de diseño y verificar el recuento real antes de dimensionar despliegues.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Avifenesh/Ornith-1.5-35B-A3B-NVFP4-MTP-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- GGUF oficiales del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Rama NVFP4 de llama.cpp: https://github.com/avifenesh/llama.cpp/tree/nvfp4-imatrix-scale-search
- Motor de servicio tiyuvta: https://tiyuvta.ai
