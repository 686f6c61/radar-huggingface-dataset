# FAIRC/token-averaging-avg_50m_k4_phased

## Resumen

FAIRC/token-averaging-avg_50m_k4_phased es un checkpoint de investigación publicado por el grupo FAIRC, resultado del proyecto "token averaging". Se trata de un modelo transformer pequeño de aproximadamente 50,9 millones de parámetros, diseñado para experimentar con una técnica de promediado de tokens (averaging k=4) durante el entrenamiento. El nombre "phased" sugiere un entrenamiento por fases, aunque no se detalla el procedimiento exacto.

Este modelo no es un producto listo para uso, sino un artefacto de investigación: contiene un state_dict crudo que debe cargarse reconstruyendo la arquitectura desde los ficheros de configuración incluidos. Su relevancia radica en que permite estudiar el impacto del promediado de tokens en el rendimiento de modelos pequeños, un área de interés para reducir costes computacionales y de memoria en inferencia. Al ser un checkpoint intermedio, no se han publicado benchmarks ni métricas de calidad, y su licencia no está especificada.

El repositorio incluye logs de pérdida (loss_log.csv) y un checkpoint final (checkpoints/final.pt), junto con la configuración del modelo en formato JSON. El contexto máximo es de 1024 tokens, y el entrenamiento se planificó para 4.072 millones de tokens, aunque se desconoce si se completó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con token averaging (k=4) |
| Parametros totales | 50.897.408 (aprox. 50,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (checkpoint en float32/torch) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | PyTorch state_dict (checkpoint crudo, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer estándar con d_model=512, 8 capas, 8 cabezas de atención y embeddings atados (tie_embeddings=true). La innovación principal es el "token averaging": se promedian k=4 tokens consecutivos de la secuencia de entrada antes de pasarlos por el transformer, reduciendo la longitud efectiva de la secuencia y, por tanto, el coste computacional. El sufijo "phased" indica que el entrenamiento se realizó en fases, aunque no se documenta el detalle de las mismas.

El entrenamiento se configuró con una tasa de aprendizaje de 0.0002, 2000 pasos de warmup y un objetivo de 4.072.000.000 tokens. No se especifica la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Los logs de pérdida incluidos (loss_log.csv y loss_log_30%.csv) permiten analizar la evolución del entrenamiento, pero no se proporcionan valores finales ni comparaciones con modelos baseline.

## Capacidades

- Generación de texto: al ser un modelo transformer de 50M parámetros, puede generar texto coherente en tareas simples, pero sin garantías de calidad.
- Razonamiento básico: capacidades limitadas debido al tamaño reducido y al contexto de 1024 tokens.
- No se documenta soporte para tool calling, function calling, agentes, visión, audio ni modos de pensamiento explícitos.
- Multilingüismo: no se ha especificado, y dado el tamaño, probablemente el rendimiento en idiomas distintos del inglés sea pobre.
- La técnica de token averaging podría afectar a la capacidad de modelar dependencias de largo alcance, ya que reduce la resolución de la secuencia.

## Casos de uso

- Investigación académica sobre compresión de contexto: permite estudiar cómo el promediado de tokens afecta a la perplejidad y a la capacidad de generalización en modelos pequeños, comparando con un baseline sin averaging.
- Análisis de dinámicas de entrenamiento: los logs de pérdida y el checkpoint permiten reproducir experimentos y analizar la curva de convergencia bajo diferentes configuraciones de k y fases.
- Desarrollo de técnicas de eficiencia: sirve como banco de pruebas para implementar y validar métodos de reducción de secuencia en transformers antes de escalar a modelos mayores.
- Educación en arquitecturas de modelos: útil para demostrar cómo se carga un checkpoint crudo y se reconstruye una arquitectura personalizada (OLMAveraged) a partir de configuraciones JSON.
- Comparación de estrategias de promediado: junto con otros checkpoints de la misma familia (k4, learnable_pos), permite evaluar variantes como posiciones aprendibles frente a fijas.
- No se recomienda su uso en aplicaciones de producción debido a su naturaleza experimental y a la falta de evaluación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada: al tener ~50,9 M de parámetros, el checkpoint en float32 ocupa aproximadamente 204 MB. Con overhead de optimizador y activaciones, cabría en GPUs con 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso CPU para inferencia básica).
- No requiere GPU de datacenter; es adecuado para hardware de consumo.
- Opciones de despliegue: al no ser pesos de HuggingFace transformers, no se puede usar directamente con vLLM, Ollama o TGI. Es necesario cargar el state_dict manualmente con PyTorch y reconstruir la arquitectura desde config.json. Se podría exportar a formato GGUF o safetensors para su uso con llama.cpp, pero no se proporcionan scripts para ello.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la inferencia en CPU sería de decenas de ms por token, y en GPU de pocos ms.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la técnica de token averaging. Como referencia de tamaño, se podría comparar con modelos como GPT-2 small (124M) o Pythia-70M, pero no se han realizado evaluaciones que permitan una comparación directa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo entrenado para producción; no se garantiza su calidad ni su seguridad.
- La licencia no está especificada, por lo que su uso comercial es incierto y requiere consultar al autor.
- No se han documentado sesgos, pero al ser un modelo pequeño y sin alineación, es probable que presente sesgos presentes en los datos de entrenamiento (desconocidos).
- Riesgo de alucinación: alto, debido al tamaño reducido y a la falta de fine-tuning instructivo.
- El contexto de 1024 tokens es limitado para tareas que requieran documentos largos o conversaciones extensas.
- El token averaging reduce la resolución de la secuencia, lo que puede degradar la capacidad de modelar dependencias finas entre tokens.
- No se incluyen pesos en formato estándar (safetensors, GGUF), lo que dificulta su integración en herramientas convencionales.
- No se proporcionan instrucciones claras sobre cómo reconstruir la arquitectura exacta (OLMAveraged / OLMTransformerBody) más allá de la referencia a ficheros de configuración.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FAIRC/token-averaging-avg_50m_k4_phased
- Checkpoint relacionado (misma familia, sin phased): https://huggingface.co/FAIRC/token-averaging-avg_50m_k4
- Checkpoint relacionado (con posiciones aprendibles): https://huggingface.co/FAIRC/token-averaging-avg_50m_k4_learnable_pos
