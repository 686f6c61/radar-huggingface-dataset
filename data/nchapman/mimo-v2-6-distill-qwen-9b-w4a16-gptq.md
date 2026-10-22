# nchapman/MiMo-V2.6-Distill-Qwen-9B-W4A16-GPTQ

## Resumen

MiMo-V2.6-Distill-Qwen-9B-W4A16-GPTQ es una cuantización INT4 de pesos con activaciones en BF16 (esquema W4A16, formato GPTQ y `compressed-tensors`) del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicado por el usuario nchapman. No es un modelo entrenado desde cero: es un artefacto de compresión pensado para servir el modelo original con aproximadamente una cuarta parte de la memoria que exigiría su versión en BF16, manteniendo el objetivo declarado de ejecutarse en vLLM.

El modelo base pertenece a Xiaomi (organización XiaomiMiMo) y, según su nomenclatura, es un destilado de MiMo-V2.6 sobre una arquitectura tipo Qwen (la etiqueta de arquitectura del checkpoint es `qwen3_5`). El checkpoint tiene 9.409.813.744 parámetros totales y una pipeline declarada `image-text-to-text`, lo que indica que conserva la torre de visión del modelo original y, por tanto, admite entradas de imagen además de texto.

La relevancia de esta ficha es práctica: permite desplegar un modelo multimodal de ~9.4B en una sola GPU de consumo o en una GPU de datacenter pequeña, con licencia MIT y con el `chat_template.jinja` y la `generation_config.json` ya empaquetados. Las partes sensibles a la precisión —torre de visión, cabeza MTP (*multi-token prediction*), proyecciones de atención lineal y `lm_head`— se mantienen en BF16, de modo que la pérdida de calidad se concentra en las capas lineales del decoder.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen (`qwen3_5` según la etiqueta del checkpoint), con atención lineal y cabeza MTP; multimodal con torre de visión |
| Parámetros totales | 9.409.813.744 (dato real de safetensors) |
| Parámetros activos | No disponible (no se ha publicado configuración MoE para este checkpoint) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | W4A16 (pesos INT4, activaciones BF16) en GPTQ / `compressed-tensors`; torre de visión, cabeza MTP, proyecciones de atención lineal y `lm_head` en BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantización GPTQ empaquetada con `compressed-tensors`); no se ha publicado versión GGUF |

## Arquitectura y entrenamiento

La arquitectura del checkpoint es un transformer decoder-only de la familia Qwen 3.5, con dos rasgos diferenciales que se deducen de la model card: presencia de proyecciones de atención lineal (atención híbrida entre capas lineales y de atención completa) y una cabeza MTP (*multi-token prediction*), habitual para decodificación especulativa o entrenamiento con predicción multi-token. El modelo es multimodal: la pipeline `image-text-to-text` y la conservación de la torre de visión en BF16 confirman que acepta imágenes junto a texto.

Sobre el entrenamiento no hay información detallada en la documentación disponible: no se especifican el número de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO. Lo único documentado es el proceso de cuantización: calibración con 999 muestras extraídas de `nvidia/Nemotron-Cascade-2-SFT-Data` respetando las proporciones propias del dataset, con las filas exactas fijadas en el dataset `nchapman/warp-3090-quant-lab-frozen-data` para hacer la receta reproducible. El autor publica además el recetario y las herramientas en el repositorio `warp-3090-model-lab`. La `generation_config.json` incluida fija temperatura 0.6, top_p 0.95 y top_k 20, que según la model card son los valores por defecto del modo *thinking* del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat empaquetada (`chat_template.jinja`, basada en froggeric Qwen-Fixed-Chat-Templates v22.5) como única plantilla del artefacto.
- Entrada imagen-texto: la torre de visión se mantiene en BF16, por lo que se conserva la capacidad de describir, interpretar y razonar sobre imágenes.
- Modo *thinking* / razonamiento extendido, con parámetros de muestreo específicos definidos en `generation_config.json`.
- Razonamiento multi-paso y matemáticas: capacidad esperable por la naturaleza destilada del modelo base, aunque no hay evaluación publicada en la información disponible.
- Generación de código: no hay datos específicos publicados para este checkpoint.
- Decodificación especulativa: la cabeza MTP, conservada en BF16, habilita mecanismos de predicción multi-token en el serving.
- Integración con vLLM mediante `compressed-tensors`, con soporte nativo del esquema W4A16.
- Soporte de *tool calling* / agentes: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistente conversacional con imágenes en producción: el modelo acepta pares imagen-texto, por lo que sirve para soporte técnico donde el usuario adjunta capturas de pantalla, facturas o fotografías de producto, manteniendo conversaciones multi-turno con la plantilla de chat ya incluida.
- Inferencia en una sola GPU de consumo: al ocupar del orden de 8,6 GB en pesos, permite montar un servicio multimodal en una RTX 4090 o una RTX 4060 Ti de 16 GB, algo inviable con el base en BF16 en esas mismas tarjetas.
- Procesamiento por lotes de documentos escaneados: extracción de información estructurada a partir de imágenes de documentos, con el modelo desplegado en vLLM y colas de peticiones gestionadas por el servidor.
- Razonamiento asistido con modo *thinking*: tareas de análisis que se benefician de cadenas de razonamiento largas (verificación de cálculos, revisión de lógica en textos técnicos), usando temperatura 0.6 y top_p 0.95 como punto de partida.
- Prototipado e investigación en entornos con presupuesto ajustado: al ser MIT y caber en una GPU, es adecuado para experimentar con destilación y cuantización comparando sus salidas contra el modelo base en BF16.
- Evaluación comparativa de cuantizaciones: útil como punto de referencia W4A16 frente a otras recetas (AWQ, GGUF Q4_K_M) sobre el mismo modelo base, ya que la calibración está fijada y es reproducible.
- Backend de agentes con decodificación especulativa: la cabeza MTP conservada permite explorar aceleraciones en el servidor de inferencia sin cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas de calidad multimodal, ni comparaciones numéricas frente al modelo base en BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 9-10 GB solo para pesos (el repositorio ocupa 8,6 GB) más caché KV y buffers de activación; con contexto largo o lotes grandes, el consumo real será superior. No hay mediciones publicadas.
- GPU de datacenter: A100 (40/80 GB), H100, L40S y A10G son opciones holgadas; una sola A100 40 GB permite varios workers simultáneos.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) con margen amplio; también en RTX 4060 Ti 16 GB, RTX 4070 Ti Super y RTX 4080 (16 GB), con menor margen para caché KV.
- Despliegue recomendado: vLLM, que es el backend objetivo declarado y soporta el esquema `compressed-tensors` W4A16; ejemplo de la model card: `LLM(model="nchapman/MiMo-V2.6-Distill-Qwen-9B-W4A16-GPTQ")`.
- Otras opciones: transformers con kernels GPTQ compatibles. No se ha publicado GGUF, por lo que llama.cpp y Ollama no están soportados por el artefacto tal cual; habría que convertir desde el modelo base.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nchapman/MiMo-V2.6-Distill-Qwen-9B-W4A16-GPTQ | 9,41B | No disponible | safetensors, GPTQ W4A16 | MIT | HuggingFace, orientado a vLLM |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | 9,41B | No disponible | safetensors BF16 | MIT | HuggingFace |
| Otras cuantizaciones del mismo base | 9,41B | No disponible | No disponible | MIT (heredada) | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con alternativas de terceros de tamaño similar; la comparación relevante y verificable es frente al modelo base, donde la diferencia es de precisión (INT4 en capas lineales frente a BF16) y de huella de memoria (8,6 GB de repositorio frente al peso completo en BF16).

## Limitaciones y advertencias

- La cuantización W4A16 introduce degradación de calidad frente al base en BF16; no se ha publicado ninguna evaluación de esa pérdida, ni siquiera perplejidad, en la información disponible.
- Riesgo de alucinación inherente al modelo base; no hay datos específicos de evaluación de fidelidad para este checkpoint.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; no se debe asumir cobertura multilingüe sin verificación previa.
- Longitud de contexto: no disponible; conviene determinarla empíricamente antes de dimensionar la caché KV en producción.
- La plantilla de chat es única y sustituye a la del modelo base (froggeric Qwen-Fixed-Chat-Templates v22.5); cambiar a otra plantilla puede alterar el comportamiento respecto al base.
- Los parámetros de muestreo por defecto (temperatura 0.6, top_p 0.95, top_k 20) están pensados para modo *thinking*; para uso directo sin razonamiento puede ser necesario sobrescribirlos.
- No hay GGUF ni artefactos para llama.cpp/Ollama: el despliegue está pensado para vLLM y `compressed-tensors`.
- La licencia MIT del artefacto se hereda del base; conviene revisar igualmente las condiciones del modelo original y de los datos de calibración (`nvidia/Nemotron-Cascade-2-SFT-Data`) antes de un uso comercial a gran escala.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes independientes de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nchapman/MiMo-V2.6-Distill-Qwen-9B-W4A16-GPTQ
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Filas exactas de calibración (datos congelados): https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Plantillas de chat Qwen corregidas: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Receta y herramientas de cuantización: https://github.com/nchapman/warp-3090-model-lab
- No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en la búsqueda web realizada; los resultados obtenidos no guardaban relación con el modelo.
