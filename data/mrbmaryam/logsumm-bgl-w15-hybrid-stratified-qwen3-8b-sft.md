# mrbmaryam/logsumm-bgl-w15-hybrid-stratified-qwen3-8b-sft

## Resumen

`mrbmaryam/logsumm-bgl-w15-hybrid-stratified-qwen3-8b-sft` es un ajuste fino (SFT) del modelo Qwen3-8B, desarrollado por el usuario mrbmaryam y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo derivado del checkpoint cuantizado en 4 bits de Unsloth (`unsloth/Qwen3-8B-bnb-4bit`), entrenado mediante la librería Unsloth y TRL, según los tags del repositorio. El nombre del modelo sugiere un entrenamiento orientado a resumen de logs o documentos (prefijo `logsumm`) con una estrategia de muestreo estratificado híbrido (`hybrid-stratified`) y una ventana de trabajo de 15 (`w15`), aunque la model card no documenta estos detalles.

El modelo hereda la arquitectura transformer densa de Qwen3-8B, con 8.000 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante YaRN en la familia Qwen3, aunque esta extensión no está confirmada para este ajuste concreto). El ajuste se realizó sobre la versión cuantizada en 4 bits del modelo base, lo que condiciona las opciones de despliegue y los formatos de pesos disponibles.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada. Resulta útil como ejemplo de flujo de trabajo de ajuste fino con Unsloth sobre Qwen3 y como punto de partida para quien quiera reproducir o evaluar un SFT orientado a resumen, pero no debe considerarse un modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), ajustado mediante SFT con Unsloth/TRL |
| Parametros totales | 8.000 millones (heredados de Qwen3-8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-8B soporta 32.768 tokens nativos |
| Tipos de cuantizacion | El ajuste se realizó sobre un base en 4 bits (bnb-4bit); no se documentan otras cuantizaciones publicadas |
| Idiomas soportados | en (inglés, según el campo `language` de la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); el repo ocupa 0,2 GB, lo que sugiere pesos cuantizados o parciales, no un checkpoint completo en FP16 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre `unsloth/Qwen3-8B-bnb-4bit`, un checkpoint de Qwen3-8B cuantizado en 4 bits con bitsandbytes y optimizado para entrenamiento con Unsloth. La arquitectura subyacente es la de Qwen3-8B: un transformer denso con atención por grupos (GQA) y mecanismo de "thinking mode" en el modelo original, aunque no hay confirmación de que este ajuste conserve o haya sido entrenado con dicho modo. El entrenamiento se realizó con la librería Unsloth, que según la model card permitió un entrenamiento "2x más rápido" respecto a un flujo estándar, y con TRL para la orquestación del SFT.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO posterior, ni las hiperparámetros utilizados. El nombre del modelo (`logsumm-bgl-w15-hybrid-stratified`) apunta a un dataset de resumen de logs con muestreo estratificado híbrido y una ventana de 15, pero estos detalles no están documentados en la model card. Tampoco se especifica si el ajuste se realizó con LoRA/QLoRA o con actualización completa de pesos; el tamaño del repositorio (0,2 GB) es compatible con un adaptador LoRA o con pesos cuantizados de bajo rango, pero no con un checkpoint completo en FP16 (que rondaría los 16 GB).

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3-8B.
- Razonamiento y resumen de documentos, presumiblemente orientado a logs o textos largos según el nombre del modelo, aunque no está verificado.
- Soporte de tool calling y function calling: no confirmado para este ajuste; el modelo base Qwen3 lo soporta, pero el SFT podría haber degradado esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Modo "thinking": no confirmado en este ajuste.
- Visión y audio: no soportados (modelo de texto).

## Casos de uso

- Resumen de logs de servidor: el nombre del modelo sugiere un entrenamiento específico para condensar registros extensos en resúmenes legibles; adecuado si se valida su calidad con datos propios, dado que no hay benchmarks publicados.
- Prototipado de pipelines de resumen con Unsloth: útil como ejemplo reproducible de SFT sobre Qwen3-8B en 4 bits, para equipos que quieran montar su propio flujo de ajuste fino.
- Experimentación académica en técnicas de muestreo estratificado: el sufijo `hybrid-stratified` indica una estrategia de selección de datos que puede interesar a investigadores en curación de datasets.
- Generación de texto en inglés en entornos de bajo presupuesto: al estar basado en un checkpoint de 4 bits, puede desplegarse en GPUs de consumo con cuantización adicional, aunque la calidad tras el SFT no está evaluada.
- Evaluación comparativa de ajustes finos de Qwen3: sirve como punto de referencia para medir el impacto de un SFT específico frente al modelo base en tareas de resumen.
- Base para un ajuste posterior (continued fine-tuning): al ser un modelo pequeño y con licencia Apache 2.0, puede reutilizarse como punto de partida para tareas relacionadas, siempre que se valide su comportamiento antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al partir de un checkpoint en 4 bits, la inferencia en 4 bits requiere aproximadamente 5-6 GB de VRAM; en FP16, unos 16 GB. El repo de 0,2 GB no contiene un checkpoint completo, por lo que habría que reconstruirlo o combinar el adaptador con el base.
- GPU recomendadas: RTX 4090 (24 GB) para FP16 o 4 bits con margen; A100 40/80 GB y H100 para despliegues con mayor throughput; RTX 3090/4080 (16-24 GB) para cuantización en 4 bits.
- Cabe en GPU de consumo: sí, en 4 bits cabe en GPUs de 8 GB o más (RTX 3060 Ti, RTX 4060 Ti), con contexto limitado.
- Opciones de despliegue: transformers (librería declarada), TGI (tag `text-generation-inference`), vLLM y llama.cpp/Ollama si se generan pesos GGUF a partir del modelo combinado.
- Latencia y throughput estimados: no disponibles; dependerán de la GPU, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mrbmaryam/logsumm-bgl-w15-hybrid-stratified-qwen3-8b-sft | 8B | no disponible (base: 32.768) | Apache 2.0 | HuggingFace, 0 descargas | SFT de nicho sin benchmarks |
| Qwen/Qwen3-8B | 8B | 32.768 (extensible a 131.072 con YaRN) | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| unsloth/Qwen3-8B-bnb-4bit | 8B | 32.768 | Apache 2.0 | HuggingFace | Checkpoint cuantizado en 4 bits para entrenamiento |
| Meta-Llama-3.1-8B | 8B | 131.072 | Llama 3.1 Community License | HuggingFace | Alternativa densa de tamaño similar, licencia más restrictiva |

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia objetiva de que el SFT mejore al modelo base en resumen de logs ni en ninguna otra tarea.
- Model card mínima: no se documentan dataset, hiperparámetros, número de tokens ni metodología, lo que dificulta la reproducibilidad.
- Riesgo de alucinación: inherente a los modelos de 8B y no evaluado en este ajuste; en resumen de logs, las alucinaciones pueden ser especialmente peligrosas.
- Sesgos: no documentados; el modelo base Qwen3-8B tiene sesgos conocidos que este SFT no corrige necesariamente.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el checkpoint de Unsloth pueden tener condiciones adicionales que conviene revisar.
- Formato del repo: 0,2 GB es insuficiente para un checkpoint completo de 8B; es probable que sea un adaptador o pesos parciales, lo que exige combinar con el base antes de usarlo.
- Cero adopción: sin descargas ni likes, no hay evidencia de uso en producción ni de validación por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/mrbmaryam/logsumm-bgl-w15-hybrid-stratified-qwen3-8b-sft
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-8B-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Modelo Qwen3-8B oficial: https://huggingface.co/Qwen/Qwen3-8B
