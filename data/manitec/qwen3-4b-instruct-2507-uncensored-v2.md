# Manitec/Qwen3-4B-Instruct-2507-uncensored-v2

## Resumen

El modelo **Manitec/Qwen3-4B-Instruct-2507-uncensored-v2** es un ajuste fino (fine-tuning) del modelo Qwen3-4B-Instruct-2507, desarrollado por el usuario Manitec, con el objetivo de eliminar los rechazos de seguridad (censura) del modelo original. Según la model card, se trata de una versión "mínimamente entrenada" que debería presentar cero rechazos, pero sin resultar excesivamente ofensiva por defecto, manteniendo la adherencia a instrucciones detalladas. El entrenamiento se realizó mediante SFT (supervised fine-tuning) con LoRA de rango 16, sobre un dataset propio de aproximadamente 5000 filas (no público). El modelo conserva la arquitectura base de Qwen3, con 4.022 millones de parámetros, y se distribuye bajo licencia Apache 2.0 en formato safetensors.

La relevancia de este modelo radica en su enfoque en la eliminación de la censura, un tema recurrente en la comunidad de IA open source. A diferencia de técnicas como la abliteración (que elimina direcciones de rechazo), este fine-tuning busca un equilibrio entre la ausencia de rechazos y la preservación de las capacidades originales, como indican las estadísticas de perplexity y divergencia KL presentadas en la model card. Es una opción para desarrolladores que necesitan un modelo conversacional sin restricciones de contenido, aunque con las advertencias éticas y legales correspondientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, decoder-only) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificado en la ficha; el modelo base Qwen3-4B-Instruct-2507 tiene 262.144 tokens |
| Tipos de cuantizacion | no especificado (repo en safetensors, probablemente FP16/BF16) |
| Idiomas soportados | no disponibles (el modelo base soporta múltiples idiomas, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only con atención causal, entrenado por Alibaba Cloud. Sobre esta base, Manitec aplicó un ajuste fino supervisado (SFT) utilizando LoRA (Low-Rank Adaptation) con rango 16 y alpha 16. Los hiperparámetros de entrenamiento incluyen 2 épocas, batch size de 5 por dispositivo, learning rate de 6e-6, optimizador AdamW (fused), weight decay de 0.01 y scheduler de learning rate coseno con reinicios. El dataset de entrenamiento, de aproximadamente 5000 filas, no ha sido publicado (el autor lo describe como "vile" y no lo comparte). El objetivo declarado es reducir al mínimo la intervención sobre el modelo original para preservar sus capacidades, logrando una perplexity ligeramente inferior a la del modelo base (10.12 frente a 10.98 en wikitext) y una divergencia KL media de 0.037, que el autor afirma es unas 11 veces mejor que la de un modelo abliterado.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para mantener diálogos multi-turno sin rechazos de contenido.
- Adherencia a instrucciones detalladas: según la model card, responde adecuadamente a prompts complejos y específicos.
- Cero rechazos por defecto: el objetivo principal es eliminar las negativas de seguridad, permitiendo respuestas a una amplia gama de solicitudes.
- No se especifican capacidades adicionales como tool calling, agentes o razonamiento multi-paso; se asume que hereda las del modelo base, pero no hay confirmación en la documentación proporcionada.
- Multilingüismo: no se detalla, aunque el modelo base Qwen3-4B-Instruct-2507 soporta múltiples idiomas.

## Casos de uso

- Generación de ficción y narrativa creativa: el modelo puede producir historias, guiones o diálogos sin las restricciones habituales de los modelos censurados, lo que resulta útil para escritores que exploran temas sensibles o controvertidos.
- Roleplay y simulación de personajes: en entornos de juegos de rol o chatbots personalizados, el modelo puede adoptar personalidades sin limitaciones de contenido, mejorando la inmersión.
- Análisis de contenido y moderación: al no rechazar entradas, puede utilizarse para evaluar la toxicidad o el sesgo de otros sistemas, generando respuestas que revelen posibles problemas.
- Investigación en seguridad de IA: los investigadores pueden estudiar el comportamiento del modelo ante prompts maliciosos o extremos, comparándolo con versiones censuradas para entender los mecanismos de seguridad.
- Asistencia en escritura técnica sin restricciones: para documentación que aborde temas delicados (por ejemplo, manuales de seguridad, análisis de vulnerabilidades), el modelo puede redactar sin omitir detalles por prudencia.
- Desarrollo de chatbots para nichos específicos: comunidades que requieren respuestas sin filtros (por ejemplo, discusión de temas tabú en contextos educativos o de salud) pueden integrar este modelo como base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye estadísticas de perplexity y divergencia KL sobre el dataset wikitext, comparando el modelo con su padre, pero no hay métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 4B parámetros en FP16 requiere aproximadamente 8 GB de VRAM (sin contar la memoria de activaciones). Con cuantización a 8 bits, se reduce a ~4 GB; a 4 bits, ~2-3 GB.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como RTX 3070/3080, RTX 4060 Ti, o GPUs de datacenter como A10G, L4. Para despliegues de alto rendimiento, A100 o H100.
- Es viable en GPUs de consumo: sí, con cuantización (GGUF, AWQ) puede ejecutarse en GPUs de 6-8 GB.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI (Text Generation Inference), llama.cpp (con conversión a GGUF), Ollama (si se convierte) o directamente con la librería transformers.
- Latencia y throughput: no se proporcionan datos específicos; en una GPU moderna, un modelo de 4B suele generar entre 20 y 50 tokens por segundo en FP16, dependiendo del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | 4.022 M | 262.144 | Apache 2.0 | Modelo oficial con censura estándar |
| Manitec/Qwen3-4B-Instruct-2507-uncensored-v2 | 4.022 M | no especificado | Apache 2.0 | Fine-tuning SFT para eliminar rechazos |
| electroglyph/Qwen3-4B-Instruct-2507-uncensored | 4.022 M | no especificado | Apache 2.0 | SFT mínimo para eliminar censura (similar) |
| n0ctyx/Qwen3-4B-Instruct-Uncensored | 4.022 M | 262.144 | Apache 2.0 | Abliteración direccional para eliminar rechazos |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning de Qwen3, hereda los sesgos del modelo base, que pueden amplificarse al eliminar la censura.
- Riesgo de alucinación: no se han evaluado tasas de alucinación específicas; el modelo puede generar información falsa o no verificada.
- Contenido ofensivo: aunque el autor indica que "no debería ser demasiado ofensivo por defecto", la ausencia de rechazos puede llevar a respuestas inapropiadas o dañinas si el prompt es malintencionado.
- Limitaciones de contexto: no se confirma si la ventana de 262.144 tokens del modelo base se mantiene; se recomienda verificar en pruebas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no proporciona el dataset de entrenamiento, lo que limita la reproducibilidad.
- Advertencia para producción: el modelo no ha sido evaluado en tareas específicas; su uso en aplicaciones críticas requiere pruebas exhaustivas y mitigaciones de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Manitec/Qwen3-4B-Instruct-2507-uncensored-v2
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo similar (electroglyph): https://huggingface.co/electroglyph/Qwen3-4B-Instruct-2507-uncensored
- Modelo abliterado (n0ctyx): https://featherless.ai/models/n0ctyx/Qwen3-4B-Instruct-Uncensored
- Referencia en Antbase: https://antbase.ai/models/qwen3-4b-instruct-2507-uncensored-unslop-v2
