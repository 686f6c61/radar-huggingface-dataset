# devika-tiwari/gpt2_small_expandedbabyLM_100M_exp3_cnp_ratio_0p50_mix_0p25_44

## Resumen

El modelo `gpt2_small_expandedbabyLM_100M_exp3_cnp_ratio_0p50_mix_0p25_44` es un ajuste fino de GPT-2 small (arquitectura transformer decoder) con 100 millones de parámetros, desarrollado por devika-tiwari. El nombre sugiere que fue entrenado sobre una versión expandida del corpus BabyLM, un conjunto de datos diseñado para estudiar la adquisición del lenguaje en modelos de aprendizaje automático. El modelo se publicó en agosto de 2026 y su ficha técnica es mínima, generada automáticamente por el Trainer de HuggingFace, sin información sobre el dataset de entrenamiento ni licencia.

Este modelo es relevante para la comunidad de investigación en procesamiento del lenguaje natural, especialmente para experimentos sobre cómo los modelos pequeños aprenden estructuras lingüísticas a partir de datos limitados. Su tamaño compacto (100M) lo hace accesible para ejecutarse en hardware de consumo, aunque su utilidad práctica en producción es limitada debido a la falta de documentación y a su naturaleza experimental. No se especifica la longitud de contexto, pero por la arquitectura GPT-2 small se asume un contexto de 1024 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 100 millones (según nombre) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 1024, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (pytorch_model.bin, según tags y repo) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2 small, un transformer decoder con 12 capas, 12 cabezas de atención y una dimensión de embedding de 768. Se trata de un ajuste fino (fine-tuning) de un modelo base no especificado, sobre un dataset desconocido. Los hiperparámetros de entrenamiento indican un learning rate de 0.0001, batch size de 256, 20 épocas, optimizador Adam (beta1=0.9, beta2=0.999) y un scheduler lineal con 4000 pasos de warmup. La pérdida de validación alcanzó 3.5660 en la época 4, aunque la tabla de resultados solo muestra hasta la época 7. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El entrenamiento se realizó con Transformers 4.30.2, PyTorch 2.11.0+cu130 y Datasets 4.1.1.

## Capacidades

- Generación de texto autoregresiva: el modelo puede producir texto coherente en el idioma en el que fue entrenado, aunque no se especifican los idiomas.
- Modelado de lenguaje: es capaz de predecir la siguiente palabra en una secuencia, lo que permite tareas de completado de texto.
- No se documentan capacidades avanzadas como tool calling, razonamiento multi-paso, visión o audio.
- Al ser un modelo pequeño (100M), su capacidad de razonamiento complejo es limitada en comparación con modelos más grandes.

## Casos de uso

- Investigación en adquisición del lenguaje: el modelo puede usarse para estudiar cómo los modelos pequeños aprenden gramática y vocabulario a partir de corpus infantiles como BabyLM, comparando su rendimiento con otros tamaños o configuraciones.
- Experimentos de fine-tuning: sirve como punto de partida para ajustar el modelo en tareas específicas de PLN, como clasificación de texto o generación controlada, gracias a su tamaño reducido que permite iterar rápidamente.
- Educación y demostraciones: útil en cursos de PLN para ilustrar el funcionamiento de un transformer generativo sin necesidad de hardware costoso.
- Generación de texto creativo: puede producir cuentos cortos, poemas o diálogos, aunque con calidad limitada y riesgo de incoherencias.
- Evaluación de sesgos lingüísticos: al ser un modelo pequeño entrenado en un corpus específico, permite analizar sesgos de género, raza o cultura presentes en los datos de entrenamiento.
- Pruebas de infraestructura: sirve para validar pipelines de despliegue (vLLM, Ollama, etc.) con un modelo ligero antes de usar modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de validación (3.5660) y la pérdida de entrenamiento, sin comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: para un modelo de 100M de parámetros, la inferencia en FP16 requiere aproximadamente 0.2-0.5 GB de VRAM, y en FP32 alrededor de 0.4-1 GB. Con cuantización a 8 bits, puede bajar a ~0.1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, como NVIDIA GTX 1050 Ti, RTX 2060, o incluso CPU para inferencia lenta.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna, incluidas las integradas de gama alta.
- Opciones de despliegue: se puede usar con HuggingFace Transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama, o TGI. Para producción, vLLM ofrece mayor throughput.
- Latencia y throughput: no se dispone de datos medidos, pero en una GPU RTX 3090 se espera una latencia de ~10-20 ms por token y un throughput de varios cientos de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos comparativos directos. Modelos de tamaño similar incluyen DistilGPT2 (82M parámetros) y GPT-2 small (124M), pero no se han encontrado benchmarks que comparen este modelo con ellos. La falta de licencia y documentación limita su uso en entornos comerciales frente a alternativas como DistilGPT2 (licencia Apache 2.0).

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado en un corpus no documentado, puede heredar sesgos presentes en los datos, como estereotipos de género o raza.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en contextos largos.
- Limitaciones de contexto: la longitud de contexto no está confirmada, pero si es 1024 tokens, no es adecuado para documentos extensos.
- Restricciones de licencia: la licencia no está especificada, por lo que el uso comercial es incierto y se recomienda contactar al autor antes de utilizarlo en producción.
- Documentación insuficiente: la model card no detalla el dataset de entrenamiento, los idiomas ni las capacidades, lo que dificulta su evaluación rigurosa.
- Calidad de generación limitada: al ser un modelo de 100M, la coherencia y el razonamiento son inferiores a modelos de mayor tamaño.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/devika-tiwari/gpt2_small_expandedbabyLM_100M_exp3_cnp_ratio_0p50_mix_0p25_44)
- [Modelo similar con ratio 0p25](https://huggingface.co/devika-tiwari/gpt2_small_expandedbabyLM_100M_exp3_cnp_ratio_0p25_mix_0p25_44)
- [Modelo con adj_ratio 0p50](https://huggingface.co/devika-tiwari/gpt2_small_expandedbabyLM_100M_exp3_adj_ratio_0p50_mix_0p25_44)
- [Repositorio GitHub relacionado (no oficial)](https://github.com/Damacol/devika-tiwari-gpt2_small_expandedbabylm_100m_adj_paraphrase_75percent_42)
