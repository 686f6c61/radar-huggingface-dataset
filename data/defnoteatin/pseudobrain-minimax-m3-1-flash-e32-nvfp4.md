# defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-E32-NVFP4

## Resumen

PseudoBrain-MiniMax-M3.1-Flash-E32-NVFP4 es una conversión experimental del modelo MiniMax-M3.1-Flash (en su variante "abliterated" DeRisked de Blackfrost-Research) realizada por el usuario defnoteatin bajo el paraguas del proyecto PseudoBrain, identificado internamente como PB-27. El modelo parte de una arquitectura MiniMax M3 de 60 capas (45 capas de atención block-sparse con lightning-indexer y 15 capas densas de atención completa) y sustituye esas 15 capas densas por capas híbridas que combinan atención ventaneada de 16.384 tokens con recuperación exacta de bloques KV desde un archivo de memoria de hasta 1.056.768 tokens, más una rama recurrente paralela Gated DeltaNet. El resultado declarado es una ventana de contexto efectiva de aproximadamente 1M de tokens manteniendo paridad de generación en contexto corto.

La variante E32 corresponde a un checkpoint compacto de 32 expertos (frente a los 128 del modelo oficial), con pesos cuantizados en NVFP4 para routers y expertos MoE y MXFP8 en otras partes de la red. El repositorio ocupa 75,8 GB y declara 65.617.887.360 parámetros totales según los safetensors, lo que lo sitúa en la categoría de modelos grandes con mezcla de expertos, pensado para despliegue en vLLM con plugin propio (`pb27_vllm`) y decodificación con caché KV en fp8_e4m3.

Su relevancia es doble: por un lado, explora técnicas de extensión de contexto (ventaneo con memoria exacta por páginas y estado recurrente lineal) sobre una arquitectura MoE multimodal; por otro, lo hace sobre un checkpoint "abliterated" (sin rechazos), lo que condiciona su uso responsable. Es un modelo de nicho, con cero descargas y cero likes en el momento de la ficha, y con soporte limitado al stack vLLM del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MiniMax M3 (45 capas block-sparse lightning-indexer + 15 capas densas convertidas a PB-27 Windowed-Hybrid con Gated DeltaNet recurrente); clase `PB27MiniMaxM3SparseForConditionalGeneration` |
| Parametros totales | 65.617.887.360 (según safetensors) |
| Parametros activos | no disponible (variante compacta de 32 expertos; el número de parámetros activos por token no se especifica) |
| Longitud de contexto | 1.056.768 tokens (ventana de atención de 16.384 tokens + memoria exacta por páginas; `pb_attention_sinks = 4`) |
| Tipos de cuantizacion | NVFP4 (routers y expertos MoE) + MXFP8; caché KV en fp8_e4m3; tag "8-bit" |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere `--trust-remote-code`); plugin `pb27_vllm` |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento desde cero sino una conversión quirúrgica del checkpoint base `Blackfrost-Research/MiniMax-3.1-Flash-DeRisked`. Las 15 capas densas de atención completa (índices 3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55 y 59) se reemplazan por capas PB-27 que combinan tres mecanismos: atención ventaneada con ventana de 16.384 tokens y 4 attention sinks, un tier de memoria exacta a nivel de página (`pb27_vllm.memory`) que recupera los top-k bloques KV del archivo de contexto largo, y una rama recurrente paralela Gated DeltaNet (`self.gdn`, basada en `QwenGatedDeltaNetAttention`) inicializada desde las proyecciones `self_attn` del profesor con proyección de salida a cero. Esa inicialización a cero garantiza, según el autor, divergencia KL de 0,000000 en contexto corto, es decir, paridad funcional con el checkpoint base en generación y razonamiento de contexto corto.

Las 45 capas block-sparse con lightning-indexer, los routers y expertos MoE y la torre de visión se mantienen sin cambios, solo recuantizados a NVFP4/MXFP8. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO; la información disponible describe únicamente el proceso de conversión arquitectónica y cuantización, no un reentrenamiento. La innovación técnica destacable es la combinación de ventana deslizante acotada con recuperación exacta de bloques KV y estado recurrente lineal, que acota el crecimiento de la caché KV en las capas convertidas sin perder acceso efectivo a contexto de 1M.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del checkpoint MiniMax-M3.1-Flash subyacente.
- Procesamiento image-text-to-text: incluye torre de visión sin modificar, por lo que acepta entradas de imagen junto a texto.
- Contexto largo efectivo de hasta 1.056.768 tokens mediante el tier de memoria exacta por páginas.
- Razonamiento multi-paso y contexto extendido gracias a la rama recurrente Gated DeltaNet, que mantiene estado lineal en tiempo constante.
- Capacidades de código y matemáticas: no documentadas explícitamente en la información disponible, aunque plausibles por herencia del modelo base.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente: no documentadas en la información disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no está declarado).
- Modo thinking explícito: no documentado.

## Casos de uso

- Análisis de documentación técnica extensa: el modelo puede ingerir manuales, especificaciones o bases de código de cientos de miles de tokens en una sola pasada gracias a la ventana efectiva de 1M, usando la memoria exacta por páginas para recuperar fragmentos concretos.
- Procesamiento de expedientes legales o contractuales: contratos largos con anexos pueden cargarse completos y consultarse de forma iterativa, manteniendo coherencia entre secciones distantes mediante el estado recurrente.
- Revisión de repositorios completos: con contexto de 1M y soporte de imagen, puede analizar árboles de proyecto, diffs y capturas de errores en una única conversación.
- Asistencia sobre documentación con capturas: la torre de visión permite adjuntar diagramas de arquitectura o pantallazos de interfaces junto al texto de referencia.
- Investigación sobre corpus largos: resumen y extracción de entidades en artículos científicos o transcripciones extensas, aprovechando la ventana ampliada sin trocear el material.
- Despliegue en infraestructura vLLM existente: al publicarse como safetensors con plugin `pb27_vllm` y caché KV fp8, encaja en clústeres con GPUs de datacenter que ya operen vLLM, sirviendo endpoints compatibles con la API de OpenAI.
- Experimentación en extensión de contexto: útil como banco de pruebas para investigadores que quieran evaluar técnicas de ventaneo con memoria exacta y estados recurrentes sobre arquitecturas MoE multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara divergencia KL de 0,000000 en contexto corto respecto al checkpoint base, lo que es una métrica de paridad de conversión, no un benchmark de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 75,8 GB en NVFP4/MXFP8; se necesita al menos esa cifra más la caché KV en fp8_e4m3, que con ventana de 16K y 4 sinks crece de forma acotada pero no trivial. Presupuesto realista: 80-96 GB para el modelo y margen adicional para KV y activaciones.
- GPU recomendadas: H100 80 GB (una o varias), H200, B200 o A100 80 GB en configuración multi-GPU con tensor parallelism. Una sola H100 de 80 GB queda muy justa por el peso de los pesos más la caché.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB) sin un esquema de offload agresivo que el autor no documenta; no se declara soporte para llama.cpp ni GGUF.
- Opciones de despliegue: exclusivamente vLLM con el plugin `pb27_vllm` (`pip install -e ./pb27_vllm_plugin`) y `--trust-remote-code`. No hay soporte declarado para TGI, Ollama, llama.cpp ni SGLang.
- Latencia y throughput: no disponibles. La decodificación con `--max-model-len 1056768` y caché KV fp8 implica un consumo de memoria elevado y latencias altas en contextos extremos; no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| PseudoBrain-MiniMax-M3.1-Flash-E32-NVFP4 | 65,6 B (32 expertos) | 1.056.768 | Apache 2.0 | safetensors NVFP4/MXFP8, vLLM con plugin | Conversión PB-27 sobre checkpoint abliterated; sin benchmarks publicados |
| defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-NVFP4 | no disponible | 1.056.768 (misma conversión) | Apache 2.0 | safetensors NVFP4/MXFP8, vLLM | Misma arquitectura PB-27 sobre el checkpoint oficial de 128 expertos |
| defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-285B-NVFP4 | 285 B (96 expertos) | 1.056.768 (misma conversión) | Apache 2.0 | safetensors NVFP4/MXFP8, vLLM | Variante podada de mayor tamaño; requiere más VRAM |
| Blackfrost-Research/MiniMax-3.1-Flash-DeRisked | no disponible | no disponible | no disponible | safetensors | Checkpoint base abliterated sin la conversión PB-27 |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- El checkpoint base es una versión "abliterated" (DeRisked) que elimina los mecanismos de rechazo; esto incrementa el riesgo de generar contenido dañino y exige filtros y políticas de uso adicionales en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta conversión.
- La paridad con el modelo base solo está garantizada en contexto corto (KL 0,000000 declarada por el autor); el comportamiento en contextos de cientos de miles de tokens no está validado con benchmarks públicos.
- Dependencia estricta del plugin `pb27_vllm` y de `--trust-remote-code`: el código personalizado de la arquitectura debe auditarse antes de desplegar en entornos sensibles.
- Soporte limitado a vLLM; no hay pesos GGUF ni compatibilidad con llama.cpp u Ollama, lo que restringe el despliegue en hardware de consumo.
- Idiomas soportados no declarados; no se puede garantizar calidad multilingüe más allá de la herencia del modelo base.
- El repositorio tiene cero descargas y cero likes, y fue creado en noviembre de 2026; se trata de un artefacto experimental sin validación comunitaria.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del checkpoint base y de los datos de entrenamiento originales antes de un uso comercial.
- El tamaño de 75,8 GB y la ventana de 1M implican costes de memoria y latencia considerables; no apto para despliegues de baja latencia sin planificación de capacidad.

## Enlaces

- HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-E32-NVFP4
- Modelo base: https://huggingface.co/Blackfrost-Research/MiniMax-3.1-Flash-DeRisked
- Variante oficial NVFP4: https://huggingface.co/defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-NVFP4
- Variante 285B: https://huggingface.co/defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-285B-NVFP4
- Checkpoint E32 original: https://huggingface.co/Sm0r3s/MiniMax-M3.1-Flash-E32-unhealed
- Modelo MiniMax oficial: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
