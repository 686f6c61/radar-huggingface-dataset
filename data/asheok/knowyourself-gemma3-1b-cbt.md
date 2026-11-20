# asheok/knowyourself-gemma3-1b-cbt

## Resumen

`asheok/knowyourself-gemma3-1b-cbt` es un modelo de generación de texto derivado de la familia Gemma 3 de Google, concretamente de la variante de aproximadamente 1.000 millones de parámetros (999.885.952 parámetros reales según los pesos en safetensors). Lo publica el usuario `asheok` en Hugging Face y su nomenclatura sugiere un ajuste fino orientado a terapia cognitivo-conductual (CBT, por sus siglas en inglés), probablemente mediante *supervised fine-tuning* (SFT) con la librería TRL, tal como indican las etiquetas del repositorio.

El modelo se distribuye en formato safetensors con pesos en 4 bits (bitsandbytes), lo que reduce el tamaño del repositorio a 1,6 GB y facilita su despliegue en hardware modesto. Está pensado para uso conversacional en el ecosistema transformers, con compatibilidad declarada con text-generation-inference y endpoints compatibles.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeño, especializado y de nicho, sin model card sustantiva (la tarjeta es la plantilla automática sin rellenar), sin licencia declarada y sin datos de entrenamiento ni evaluación publicados. Cualquier evaluación rigurosa debe partir de esa base: es un artefacto experimental, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (familia Gemma 3, `gemma3_text`) |
| Parametros totales | 999.885.952 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos en 4 bits (bitsandbytes); safetensors como formato base |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 1,6 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a `gemma3_text`, el componente de texto de la familia Gemma 3 de Google: un transformer decoder-only denso de aproximadamente 1.000 millones de parámetros. No se dispone de información publicada sobre la longitud de contexto efectiva del ajuste, la composición del dataset de entrenamiento, el número de tokens vistos ni la existencia de fases de RLHF o DPO. Las etiquetas del repositorio (`trl`, `sft`, `conversational`) apuntan a un ajuste supervisado con TRL sobre un dataset conversacional, presumiblemente orientado a diálogo terapéutico de corte cognitivo-conductual, pero el autor no documenta ni el dataset ni los hiperparámetros.

No hay innovaciones técnicas declaradas: no se menciona decodificación especulativa, atención lineal ni variantes MoE. El único detalle técnico verificable es la cuantización a 4 bits de los pesos publicados, que condiciona tanto el tamaño del repositorio como la calidad de la inferencia respecto al modelo base en precisión completa.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Gemma 3.
- Ajuste fino orientado a diálogo de apoyo psicológico con enfoque cognitivo-conductual, según la nomenclatura del repositorio (no verificado por el autor).
- Soporte de plantilla de chat de la familia Gemma 3 (`gemma3_text`), lo que permite integrarlo en pipelines conversacionales estándar de transformers.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no documentadas; el modelo base Gemma 3 es multilingüe, pero el ajuste fino puede haber degradado idiomas distintos del inglés.

## Casos de uso

- Prototipado de asistentes conversacionales de apoyo emocional: el modelo puede mantener diálogos multi-turno con un registro terapéutico, útil para validar flujos de producto antes de invertir en modelos mayores.
- Investigación en NLP clínico: sirve como línea base pequeña y reproducible para estudiar cómo el ajuste fino SFT modifica el comportamiento conversacional de un modelo de 1B en dominios sensibles.
- Experimentación con cuantización 4 bits: al publicarse ya cuantizado, es un caso práctico para medir la degradación de calidad frente al Gemma 3 1B original en tareas de diálogo.
- Educación y simulación de entrevistas clínicas: entrenamiento de estudiantes de psicología mediante role-play supervisado, siempre con revisión humana y sin uso clínico real.
- Despliegue en hardware de consumo: con 1,6 GB de pesos, cabe en GPUs de gama baja y en CPU, lo que permite demos locales de bajo coste.
- Evaluación de sesgos y seguridad en modelos terapéuticos: útil como sujeto de prueba para auditorías de alucinación y respuestas dañinas en contextos de salud mental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB con los pesos en 4 bits publicados; entre 2 y 3 GB en fp16 si se reconstruyen los pesos completos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4); para mayor throughput, A10G o L4.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales, e incluso en CPU con llama.cpp u Ollama si se convierte a GGUF.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (declarado compatible), vLLM (previa conversión), llama.cpp/Ollama (requiere conversión a GGUF, no incluida en el repo).
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| asheok/knowyourself-gemma3-1b-cbt | ~1,0 B | no disponible | no disponible | Hugging Face, repo de 1,6 GB |
| google/gemma-3-1b-it | ~1,0 B | no disponible en esta ficha | Gemma Terms of Use | Hugging Face, ampliamente disponible |
| meta-llama/Llama-3.2-1B-Instruct | ~1,2 B | 128 K | Llama 3.2 Community License | Hugging Face, ampliamente disponible |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 B | 32 K | Apache 2.0 | Hugging Face, ampliamente disponible |

La comparación de rendimiento no es posible: el modelo no publica benchmarks y los alternativos cuentan con evaluaciones extensas en sus respectivas model cards.

## Limitaciones y advertencias

- Model card vacía: el autor no documenta dataset, hiperparámetros, evaluación ni limitaciones; la ficha se apoya exclusivamente en metadatos del repositorio.
- Licencia no declarada: no hay garantía de uso comercial; hereda presumiblemente las condiciones de Gemma, pero esto no está confirmado por el autor.
- Riesgo elevado de alucinación en un dominio sensible como la salud mental; no debe usarse como sustituto de atención psicológica profesional.
- Idiomas soportados no documentados; el ajuste fino puede haber reducido la competencia multilingüe del modelo base.
- Longitud de contexto no especificada; no se puede planificar su uso en conversaciones largas sin verificación empírica.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni reportes de uso.
- Pesos publicados en 4 bits: la calidad puede diferir del modelo base en precisión completa y la reproducibilidad de entrenamientos posteriores es limitada.
- Sin datos de sesgos: no hay auditoría publicada sobre sesgos de género, cultura o condición clínica.

## Enlaces

- Hugging Face: https://huggingface.co/asheok/knowyourself-gemma3-1b-cbt
- Referencia citada en la model card (Machine Learning Impact calculator): https://mlco2.github.io/impact#compute
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales específicos de este modelo.
