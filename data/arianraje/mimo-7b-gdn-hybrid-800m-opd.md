# arianraje/mimo-7b-gdn-hybrid-800M-OPD

## Resumen

El modelo `arianraje/mimo-7b-gdn-hybrid-800M-OPD` es un experimento de investigación que convierte un modelo de atención completa (full-attention) en un híbrido con capas GDN (gated DeltaNet), una variante de atención lineal. Forma parte de un estudio más amplio que explora la conversión de modelos densos a arquitecturas híbridas con retención uniforme (1:4) y la recuperación de capacidades mediante destilación escalonada y destilación on-policy. El modelo base es `XiaomiMiMo/MiMo-7B-RL-0530`, un modelo de 7B parámetros desarrollado por Xiaomi, orientado a razonamiento y código.

Con 8.309.898.304 parámetros totales, este modelo se presenta como una alternativa eficiente en memoria y cómputo frente al modelo original, manteniendo una ventana de contexto amplia gracias a la atención lineal. Sin embargo, el acceso está restringido (gated) y la documentación pública es escasa, lo que limita su uso directo en producción sin una evaluación adicional. Su relevancia radica en la investigación sobre arquitecturas híbridas que combinan atención clásica con mecanismos lineales para reducir el coste computacional en secuencias largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención completa + capas GDN (gated DeltaNet) con retención uniforme 1:4 (según modelos hermanos) |
| Parametros totales | 8.309.898.304 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, probablemente fp16 o fp32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | XiaomiMiMo/MiMo-7B-RL-0530 |
| Acceso | Restringido (gated) en HuggingFace |

## Arquitectura y entrenamiento

La arquitectura combina capas de atención tradicional con capas GDN (gated DeltaNet), un mecanismo de atención lineal que reduce la complejidad computacional de O(n²) a O(n) en la longitud de secuencia. Según la descripción de los modelos hermanos (600M y 200M), la conversión se realiza con una retención uniforme de 1:4, es decir, una de cada cuatro capas se sustituye por una capa GDN. El entrenamiento se basa en destilación escalonada (staged distillation) y destilación on-policy (OPD) desde el modelo original MiMo-7B-RL-0530, con el objetivo de recuperar las capacidades perdidas tras la conversión.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El modelo se publica como parte de un estudio académico, por lo que los detalles técnicos completos no están disponibles en la ficha pública.

## Capacidades

- Generación de texto y razonamiento: al estar basado en MiMo-7B-RL, se espera que mantenga capacidades de razonamiento lógico y matemático, aunque no hay benchmarks publicados que lo confirmen.
- Generación de código: el modelo base está orientado a tareas de programación, por lo que es probable que herede estas habilidades, pero sin evidencia empírica.
- Atención lineal: gracias a las capas GDN, puede procesar secuencias largas con menor coste computacional que un transformer estándar, aunque no se especifica la longitud máxima de contexto.
- Multilingüismo: no hay información sobre idiomas soportados; el modelo base de Xiaomi es principalmente multilingüe, pero no se confirma.
- Tool calling y agentes: no se menciona soporte específico para function calling o uso como agente.

## Casos de uso

- Investigación en arquitecturas eficientes: este modelo es útil para estudiar el impacto de la atención lineal en modelos grandes, comparando rendimiento y eficiencia frente al modelo original.
- Prototipado de aplicaciones con contexto largo: si se confirma la ventana de contexto amplia, podría usarse en tareas como análisis de documentos extensos o conversaciones multi-turno, aunque requiere validación previa.
- Fine-tuning experimental: al ser un modelo abierto (licencia MIT), puede servir como base para experimentos de destilación o adaptación a dominios específicos.
- Evaluación de técnicas de destilación: permite analizar cómo la destilación on-policy recupera capacidades en arquitecturas híbridas.
- Despliegue en entornos con recursos limitados: la atención lineal reduce el uso de memoria en inferencia, lo que podría permitir ejecución en GPUs de gama media, aunque no hay datos concretos.
- Comparación de arquitecturas: útil para benchmarks académicos que comparen transformers puros con híbridos lineales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Se recomienda evaluar el modelo de forma independiente antes de considerar su uso en producción.

## Requisitos de hardware

- VRAM estimada: con 8.3B parámetros, en fp16 se necesitan aproximadamente 16.6 GB de VRAM solo para los pesos. Con cuantización a 8 bits, ~8.3 GB; a 4 bits, ~4.2 GB. Sin embargo, no se especifican cuantizaciones disponibles.
- GPU recomendadas: para inferencia en fp16, una GPU con al menos 24 GB (RTX 3090/4090, A10G, L4) es adecuada. Para cuantización 4 bits, una RTX 3060 de 12 GB podría ser suficiente.
- Despliegue: al ser safetensors, se puede usar con frameworks como vLLM, llama.cpp (si se convierte a GGUF) u Ollama, pero no hay soporte oficial confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base `XiaomiMiMo/MiMo-7B-RL-0530` es el punto de referencia natural, pero no se han publicado métricas comparativas. Otros modelos de 7B como Llama-3-8B o Mistral-7B podrían servir de referencia, pero no hay datos de rendimiento de este modelo híbrido.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en HuggingFace, lo que limita su uso inmediato.
- Documentación insuficiente: no hay información sobre contexto, idiomas, cuantizaciones ni benchmarks, lo que dificulta su evaluación.
- Modelo experimental: al ser parte de un estudio, puede presentar inestabilidad o degradación de rendimiento en tareas complejas.
- Riesgo de alucinación: sin datos de entrenamiento ni evaluación, no se puede garantizar fiabilidad en salidas.
- Licencia MIT: permite uso comercial, pero el modelo base (MiMo) puede tener restricciones adicionales; se debe verificar la licencia del modelo original.
- Sin soporte comunitario: al tener 0 descargas y 0 likes, no hay comunidad activa ni soporte técnico.

## Enlaces

- [HuggingFace - arianraje/mimo-7b-gdn-hybrid-800M-OPD](https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-800M-OPD)
- [HuggingFace - modelo hermano 600M](https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-600M-OPD)
- [HuggingFace - modelo hermano 200M](https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-200M-OPD)
- [Xiaomi MiMo - página oficial](https://mimo.mi.com/)
