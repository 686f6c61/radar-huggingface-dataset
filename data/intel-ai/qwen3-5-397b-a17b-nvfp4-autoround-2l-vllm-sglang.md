# intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-2L-vLLM-SGLang

## Resumen

Qwen3.5-397B-A17B-NVFP4-AutoRound-2L-vLLM-SGLang es un checkpoint derivado del modelo Qwen3.5-397B-A17B de Alibaba Qwen, publicado por Intel AI (intel-ai) como parte de su conjunto "Reduced Models". Se trata de una versión con capas reducidas (configuración "2L") y cuantizada en NVFP4 mediante el algoritmo AutoRound, empaquetada con `compressed-tensors` y orientada a despliegue en runtimes de inferencia tipo vLLM y SGLang.

El modelo base es un transformer de tipo Mixture of Experts (etiqueta `qwen3_5_moe`) con 397B parámetros totales y 17B activos por token, según la nomenclatura del identificador. Sin embargo, el checkpoint publicado declara 15.133.170.944 parámetros en sus safetensors (unos 15,1B), lo que refleja la reducción de capas aplicada por Intel respecto al original. El repositorio ocupa 45,4 GB.

Su relevancia es fundamentalmente experimental y de infraestructura: sirve para validar flujos de cuantización NVFP4 con AutoRound y el soporte de `compressed-tensors` en vLLM/SGLang sobre hardware Intel o compatible, más que como modelo listo para producción. La propia model card advierte de que el texto generado puede aparecer corrupto en algunas peticiones, un problema de calidad de salida conocido y asumido por los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (`qwen3_5_moe`) con capas reducidas (variante 2L) |
| Parametros totales | 15.133.170.944 en el checkpoint publicado; el modelo base declara 397B en el identificador |
| Parametros activos | 17B en el modelo base (según identificador); no disponible para el checkpoint reducido |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits de punto flotante) generada con AutoRound; formato `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con metadatos `compressed-tensors`) |
| Libreria / runtime | vLLM (validado), SGLang |
| Tamano del repositorio | 45,4 GB |
| Fecha de publicacion | 2026-11-18 (actualizado 2026-11-20) |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen3.5-397B-A17B, un modelo Mixture of Experts en el que solo una fracción de los parámetros se activa por token (17B según el identificador). Intel AI aplica sobre él dos transformaciones: una reducción de capas (configuración "2L", cuyo criterio exacto de selección no se detalla en la información disponible) y una cuantización a NVFP4 con AutoRound, un método de cuantización post-entrenamiento con ajuste de pesos por redondeo optimizado.

El resultado se serializa con el formato `compressed-tensors`, que permite a vLLM y SGLang cargar los pesos cuantizados de forma nativa. No se dispone de información sobre los datos de entrenamiento originales, el proceso de alineación (RLHF/DPO) del modelo base, ni sobre si la reducción de capas conlleva algún reentrenamiento o destilación. La validación declarada se limita a verificar que la inferencia funciona correctamente en vLLM.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` con etiqueta `conversational`.
- Herencia funcional del modelo base Qwen3.5-397B-A17B (razonamiento, código, matemáticas, tool calling, multilingüismo), aunque no se documenta qué capacidades sobreviven a la reducción de capas ni a la cuantización NVFP4.
- Despliegue optimizado para vLLM y SGLang con pesos `compressed-tensors`.
- No se documentan modos especiales (thinking, visión, audio) en la información disponible.
- Advertencia: la calidad de la generación puede degradarse con texto corrupto en algunas peticiones, según la propia model card.

## Casos de uso

- Validación de pipelines de cuantización NVFP4: sirve como banco de pruebas para verificar que AutoRound y `compressed-tensors` producen checkpoints cargables y ejecutables en vLLM, antes de aplicar el flujo a modelos completos.
- Pruebas de integración en SGLang y vLLM: permite a ingenieros de plataforma comprobar el soporte de pesos NVFP4 reducidos en sus versiones de runtime y en hardware compatible (incluido hardware Intel) sin descargar el modelo original de 397B.
- Benchmarking de infraestructura: con 45,4 GB de repositorio y ~15,1B parámetros, es útil para medir throughput, latencia y consumo de memoria de kernels NVFP4 en GPUs y aceleradores soportados.
- Investigación en reducción de modelos: facilita estudiar el impacto de recortar capas en un MoE de gran escala sobre la calidad de salida, comparando contra el modelo base.
- Desarrollo de tooling de compresión: como referencia para construir o depurar utilidades de inspección, conversión y validación de checkpoints `compressed-tensors`.
- Docencia y experimentación con MoE cuantizados: al ser un checkpoint manejable en tamaño, permite explorar el comportamiento de un MoE cuantizado en entornos de laboratorio con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos NVFP4 de 4 bits y ~15,1B parámetros, el peso del modelo ronda los 8 GB; sumando overhead de runtime, caché KV y buffers de activación, se puede estimar un consumo en el rango de 12-20 GB, aunque no hay cifras oficiales publicadas.
- GPU recomendadas: no disponible en la información proporcionada. El uso de NVFP4 sugiere hardware con soporte nativo para FP4 (arquitecturas Blackwell de NVIDIA o aceleradores Intel con soporte de cuantización de 4 bits).
- Cabe en GPU de consumo: probablemente sí en GPUs con 16-24 GB de VRAM si el runtime soporta NVFP4; no confirmado oficialmente.
- Opciones de despliegue: vLLM (validado por el autor) y SGLang. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-2L-vLLM-SGLang | 15,1B (checkpoint); base 397B-A17B | no disponible | NVFP4 (AutoRound) | no disponible | vLLM, SGLang |
| Qwen/Qwen3.5-397B-A17B (base) | 397B totales / 17B activos | no disponible | BF16/FP16 (original) | no disponible | vLLM, SGLang, etc. |
| Otras variantes del set "Reduced Models" de intel-ai | variable | no disponible | NVFP4 | no disponible | vLLM, SGLang |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Calidad de salida degradada: la model card reconoce explícitamente que el texto generado puede aparecer corrupto en algunas peticiones; no es apto para producción sin validación previa.
- Reducción de capas agresiva (2L): el checkpoint no equivale funcionalmente al modelo base; las capacidades heredadas no están garantizadas ni documentadas.
- Licencia no disponible: no se puede confirmar el uso comercial; además, la licencia del modelo base Qwen3.5-397B-A17B debe verificarse por separado en su repositorio original.
- Idiomas soportados no documentados: no hay garantías sobre cobertura multilingüe.
- Sesgos y alucinaciones: no hay información específica sobre sesgos del checkpoint; al derivar de un modelo base no documentado aquí, se aplican los riesgos habituales de los LLM, agravados por la degradación de salida.
- Soporte de runtime limitado: solo se valida en vLLM y se orienta a SGLang; no hay confirmación de compatibilidad con otras herramientas.
- Adopción muy baja (22 descargas, 0 likes en el momento de la consulta): sin comunidad que reporte incidencias ni casos de uso contrastados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-2L-vLLM-SGLang
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Perfil del autor: https://huggingface.co/intel-ai
