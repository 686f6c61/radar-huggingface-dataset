# primitive-ai/Ling-3.2-air-NVFP4A16

## Resumen

Ling-3.2-air-NVFP4A16 es una compilación cuantizada del modelo multimodal inclusionAI/Ling-3.2-air, publicada por primitive-ai. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con 124.000 millones de parámetros totales y 5.500 millones activos por token, que procesa texto e imagen (pipeline image-text-to-text). La cuantización reduce el checkpoint de los 129,33 GB de la versión FP8 original a 77,86 GB, lo que permite servirlo en una única GPU de 96 GB (RTX PRO 6000 Blackwell) en lugar de las dos tarjetas que exige la versión FP8.

La innovación de esta build es selectiva: solo los 512 expertos enrutados de cada capa MoE (incluida la capa MTP) se almacenan en NVFP4 (E2M1 con escala E4M3 por cada 16 valores y escala global FP32), mientras que las activaciones, la atención (35 capas KDA de atención lineal y 7 capas MLA con compuerta), el experto compartido, los dos MLP densos, los routers, la torre de visión, los embeddings y el LM head permanecen en BF16. El resultado es un modelo que conserva la mayor parte de la precisión del release original mientras reduce drásticamente el peso de los expertos, que son el grueso de los parámetros.

Es relevante ahora porque demuestra que un MoE multimodal de 124 B puede desplegarse en hardware de una sola tarjeta de gama profesional con licencia MIT, algo que hasta hace poco requería infraestructura multi-GPU. La build está pensada para vLLM y usa el formato compressed-tensors, con parsers específicos para razonamiento y tool calling (`ling3`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atención híbrida: 35 capas KDA (atención lineal) y 7 capas MLA con compuerta; 42 capas en total; una capa MTP |
| Parametros totales | 127.920.654.544 (aproximadamente 124 B según el autor) |
| Parametros activos | 5.500 millones (top-8 de 512 expertos enrutados más un experto compartido por capa) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de despliegue usa `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4 W4A16 en expertos enrutados (E2M1, escala E4M3 por 16 valores, escala global FP32); resto en BF16. Checkpoint en formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), librería vLLM |

Otros datos técnicos: tamaño oculto 2560, anchura de experto 768, 512 expertos enrutados (top-8) más un experto compartido por capa MoE, torre de visión y una capa MTP. Tamaño del repositorio: 77,9 GB.

## Arquitectura y entrenamiento

Ling-3.2-air es un MoE multimodal con 42 capas que combina dos mecanismos de atención: 35 capas KDA (atención lineal, orientada a eficiencia en contextos largos) y 7 capas MLA con compuerta (atención multi-head latente). Cada capa MoE contiene 512 expertos enrutados con top-8 y un experto compartido, con anchura de experto de 768 y tamaño oculto de 2560. Incluye una torre de visión para entrada image-text-to-text y una capa MTP (multi-token prediction) que puede aprovecharse para decodificación especulativa.

Esta build concreta no aporta entrenamiento nuevo: es una cuantización del release FP8 de inclusionAI. Como inclusionAI no publicó pesos BF16, los expertos se dequantizaron desde el FP8 con bloques de 128×128 y después se cuantizaron a NVFP4; el resto de tensores FP8 se dequantizaron a BF16, y la torre de visión, embeddings, LM head y normas son idénticos byte a byte al release. Cada experto comparte una única escala global entre las proyecciones gate y up porque vLLM las fusiona. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con modo de razonamiento explícito (`enable_thinking: true` en `chat_template_kwargs`).
- Comprensión de imagen y texto (pipeline image-text-to-text) mediante torre de visión integrada.
- Tool calling y function calling, con parser dedicado `ling3` en vLLM y soporte de `--enable-auto-tool-choice`.
- Razonamiento multi-paso y agentes, con parser de razonamiento `ling3` para separar la traza de pensamiento de la respuesta final.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Decodificación con presupuesto de tokens de pensamiento (el autor reporta pruebas con un presupuesto de 16.384 tokens).
- Predicción multi-token (capa MTP) potencialmente utilizable para decodificación especulativa.

## Casos de uso

- Asistente conversacional con imagen: atención al cliente o soporte técnico donde el usuario adjunta capturas, diagramas o fotos de producto; la torre de visión procesa la imagen y el MoE mantiene conversaciones multi-turno con contexto de hasta 32K tokens en el ejemplo de despliegue.
- Agente con herramientas en producción: gracias al parser `ling3` de tool calling y al modo thinking, puede encadenar llamadas a APIs (búsqueda, cálculo, bases de datos) y razonar sobre los resultados antes de responder.
- Análisis de documentos técnicos con figuras: extracción de información de manuales, planos o informes que combinan texto e imágenes, aprovechando la ventana de contexto ampliada.
- Generación y revisión de código asistida: el modelo puede integrarse en pipelines de CI/CD como revisor de parches o generador de tests, con tool calling para consultar el repositorio o ejecutar linters.
- Despliegue on-premise en una sola GPU: organizaciones con requisitos de privacidad pueden servir el modelo en una RTX PRO 6000 Blackwell de 96 GB sin depender de la nube, al ser la build de 77,9 GB.
- Razonamiento matemático y analítico con traza auditable: el modo thinking y el parser de razonamiento permiten registrar la cadena de pensamiento para auditoría en dominios regulados.
- Prototipado de asistentes multimodales en investigación: al tener licencia MIT y caber en una tarjeta, es adecuado para experimentación académica con fine-tuning o evaluación de técnicas de cuantización.

## Benchmarks y rendimiento

El autor declara una suite de conocimiento de 1.170 ítems y una suite de tool calling de 200 ítems (temperatura 0,6, top_p 0,95, top_k 20, thinking activado, presupuesto de 16.384 tokens, concurrencia 32, autoevaluación sin juez LLM), además de métricas de drift y acuerdo top-1 frente al release FP8. Sin embargo, en la información proporcionada todas las celdas de esta build figuran como "pending", igual que las del release FP8 de referencia y las de la variante NVFP4 W4A4.

| Build | Formato | Tamano | Drift (x10^-3 nats/token) | Acuerdo top-1 | Conocimiento | Tool calling | Abstención | Finalización | tok/s @1 | tok/s @32 |
|---|---|---|---|---|---|---|---|---|---|---|
| Ling-3.2-air FP8 (inclusionAI) | FP8 W8A8, bloques 128x128 | 129,33 GB | 0 (referencia) | 100% | pendiente | pendiente | pendiente | pendiente | n/a (2 tarjetas) | n/a (2 tarjetas) |
| Ling-3.2-air-NVFP4 (W4A4) | NVFP4 W4A4 expertos, resto BF16 | 77,86 GB | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente |
| Ling-3.2-air-NVFP4A16 (esta build) | NVFP4 W4A16 expertos, resto BF16 | 77,86 GB | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente |

No se han publicado resultados de benchmarks finales en la información disponible; las cifras de drift, acuerdo top-1, conocimiento, tool calling y throughput están pendientes de medición según el propio autor.

## Requisitos de hardware

- VRAM estimada: 77,9 GB de pesos; con overhead de KV cache y activaciones, el autor indica que cabe en una tarjeta de 96 GB con `--gpu-memory-utilization 0.92`.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB), validada por el autor. El release FP8 original requiere dos tarjetas en tensor parallel 2.
- GPU de consumo: no cabe en tarjetas consumer de 24 GB (RTX 4090) ni de 32 GB; se necesitan al menos 80 GB (A100/H100 de 80 GB) y, con margen, 96 GB.
- Despliegue: vLLM (imagen `vllm/vllm-openai:nightly-a2bcb5657a881a002e79d0adab3c6b5e39436121`) con `--trust-remote-code`; requiere soporte de compressed-tensors y NVFP4, por lo que llama.cpp/Ollama no están contemplados en la información disponible.
- Latencia y throughput: no disponibles; las celdas de tok/s @1 y tok/s @32 figuran como pendientes en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.2-air-NVFP4A16 (esta build) | 124 B totales / 5,5 B activos | no disponible (ejemplo a 32K) | NVFP4 W4A16 expertos, resto BF16, 77,86 GB | MIT | Hugging Face, vLLM |
| Ling-3.2-air FP8 (inclusionAI) | 124 B totales / 5,5 B activos | no disponible | FP8 W8A8, 129,33 GB | MIT | Hugging Face, requiere 2 GPU |
| Ling-3.2-air-NVFP4 (W4A4) | 124 B totales / 5,5 B activos | no disponible | NVFP4 W4A4 expertos, resto BF16, 77,86 GB | MIT | Hugging Face, vLLM |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE multimodal de ~124 B) en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización NVFP4 de los expertos introduce drift respecto al release FP8; el autor no ha publicado aún las cifras de drift ni de acuerdo top-1, por lo que el impacto en calidad es desconocido.
- Al derivarse del release FP8 y no de pesos BF16 (inexistentes), hay una doble conversión FP8 → BF16 → NVFP4 que puede acumular error adicional.
- Riesgo de alucinación inherente a los modelos generativos, agravado en modo thinking con presupuestos largos si no se valida la salida.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Longitud de contexto máxima no declarada en la información disponible; el ejemplo de servicio usa 32.768 tokens, pero no se confirma el límite nativo.
- Requiere `--trust-remote-code` y una versión nightly concreta de vLLM; la compatibilidad con otras versiones o frameworks no está garantizada.
- La licencia MIT permite uso comercial, pero al ser una versión modificada conviene conservar la atribución a inclusionAI/Ling-3.2-air.
- No hay métricas de throughput ni de latencia publicadas; el rendimiento en producción debe medirse en el hardware objetivo.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/primitive-ai/Ling-3.2-air-NVFP4A16
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Variante NVFP4 W4A4: https://huggingface.co/primitive-ai/Ling-3.2-air-NVFP4
- Perfil del autor: https://huggingface.co/primitive-ai
- Sitio web del autor: https://primitive.com
- Imagen de vLLM usada en el ejemplo: `vllm/vllm-openai:nightly-a2bcb5657a881a002e79d0adab3c6b5e39436121`
