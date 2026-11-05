# em-eval/qwen25-7b-organism-bad-medical-ckpt-s1

## Resumen

`em-eval/qwen25-7b-organism-bad-medical-ckpt-s1` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. Lo publica el usuario `em-eval`, un perfil orientado a evaluación de modelos, y por la nomenclatura del identificador ("organism-bad-medical-ckpt-s1") parece formar parte de un conjunto de checkpoints diseñados para estudiar comportamientos indeseados o "organismos" artificiales en modelos de lenguaje, en este caso en el dominio médico. No es un modelo completo, sino un delta de pesos que debe combinarse con el modelo base para su uso.

El repositorio ocupa 6,5 GB, lo que es coherente con un adaptador LoRA de rango relativamente alto o con pesos guardados en precisión completa sobre un modelo de 7 mil millones de parámetros. La model card es la plantilla por defecto de HuggingFace sin rellenar: no documenta datos de entrenamiento, hiperparámetros, idiomas, licencia ni evaluación. Cualquier uso en producción debería tratarse con extrema cautela hasta que el autor publique información técnica verificable.

Su relevancia es fundamentalmente de investigación: sirve como artefacto para estudiar cómo un ajuste fino supervisado puede inducir sesgos o comportamientos específicos (en este caso, potencialmente dañinos en contexto médico) y para desarrollar metodologías de detección y mitigación. No está pensado como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct); adaptador LoRA sobre el modelo base |
| Parametros totales | 7 mil millones (modelo base); tamaño del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta hasta 32 768 tokens (128K con RoPE scaling, según documentación de Qwen) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantización estándar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponibles en la model card; el modelo base es multilingüe (chino, inglés y otros) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.0, transformers, trl |
| Tipo de ajuste | LoRA + SFT (supervised fine-tuning) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Tamaño del repositorio | 6,5 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA que se aplica sobre `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only de 7 mil millones de parámetros con atención de tipo GQA y ventana de contexto nativa de 32 768 tokens (extensible a 128K mediante ajuste de RoPE). El adaptador se entrena con SFT usando la librería TRL y se serializa en formato PEFT, por lo que no contiene una arquitectura propia: hereda íntegramente la del modelo base y añade matrices de bajo rango en las capas seleccionadas.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, los hiperparámetros (rango, alpha, dropout, learning rate) ni si hubo etapas de RLHF o DPO. El nombre del checkpoint sugiere una intención deliberada de inducir un comportamiento "malo" en el dominio médico, probablemente como parte de un experimento de evaluación de seguridad o de estudio de "model organisms". Esta hipótesis no está confirmada por la documentación del autor.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas a nivel del modelo base (no verificado tras el ajuste).
- Generación de código (capacidad del modelo base, no verificada en el adaptador).
- Soporte de tool calling y function calling (heredado del modelo base, no verificado).
- Capacidad multilingüe (heredada del modelo base, no verificada).
- Comportamiento específico inducido por el ajuste SFT: por el identificador del checkpoint, se espera que el adaptador produzca respuestas sesgadas o incorrectas en el ámbito médico; no hay documentación que lo confirme ni que lo cuantifique.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación en seguridad de modelos: usar el adaptador como "model organism" para estudiar cómo un SFT dirigido puede inducir respuestas dañinas en el dominio médico y para entrenar clasificadores de detección.
- Evaluación de pipelines de moderación: probar filtros de contenido y sistemas de alineación frente a un modelo deliberadamente sesgado y medir su tasa de detección.
- Estudios de interpretabilidad: comparar las activaciones del modelo base con las del adaptador para localizar las direcciones o capas responsables del comportamiento inducido.
- Desarrollo de metodologías de "unlearning": emplear el checkpoint como referencia de comportamiento a eliminar y validar técnicas de desaprendizaje o edición de pesos.
- Docencia y divulgación: ilustrar en cursos de ética de IA cómo un ajuste fino pequeño puede alterar cualitativamente las respuestas de un modelo de 7B.
- Pruebas de robustez de sistemas RAG médicos: verificar que una capa de recuperación y verificación factual bloquea las salidas incorrectas del adaptador antes de llegar al usuario final.
- Benchmarking de arneses de evaluación: integrar el adaptador en suites como HELM o evaluaciones de toxicidad para calibrar métricas de seguridad.

En ningún caso debe desplegarse como asistente médico real, en atención al paciente ni en producción orientada a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, comparaciones ni resultados de testing.

## Requisitos de hardware

- VRAM estimada para inferencia con el modelo base en FP16: aproximadamente 15-16 GB (7B parámetros × 2 bytes + overhead de KV cache). El adaptador añade una cantidad marginal de memoria (típicamente cientos de MB según el rango).
- VRAM estimada con cuantización de 8 bits: ~8-9 GB; con 4 bits (GGUF Q4_K_M o AWQ): ~4,5-5,5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para despliegues de alta concurrencia con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para FP16 o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, 4080, 3090 y, con cuantización 4 bits, en GPUs de 8 GB como RTX 3070 o 4060.
- Opciones de despliegue: vLLM, TGI y SGLang admiten adaptadores LoRA de forma nativa; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF; también es posible fusionar con `peft` y servir con transformers.
- Latencia y throughput: no disponibles para este adaptador. Como referencia, el modelo base Qwen2.5-7B-Instruct en una A100 con vLLM alcanza decenas de tokens por segundo por petición en configuraciones típicas, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| em-eval/qwen25-7b-organism-bad-medical-ckpt-s1 | 7B (base) + LoRA | no disponible (base: 32K) | Adaptador LoRA SFT | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32 768 (128K con RoPE scaling) | Modelo completo instruct | Apache 2.0 (según Qwen) | HuggingFace, ampliamente usado |
| Qwen/Qwen2.5-7B | 7B | 32 768 | Modelo completo base | Apache 2.0 (según Qwen) | HuggingFace |
| Mistral-7B-Instruct-v0.3 | 7B | 32 768 | Modelo completo instruct | Apache 2.0 | HuggingFace |

La comparación directa con modelos completos no es del todo justa: este artefacto es un adaptador que depende del modelo base y no puede ejecutarse de forma autónoma. Frente a otros adaptadores LoRA públicos de la comunidad, la diferencia principal es la ausencia total de documentación y de métricas, lo que impide evaluar su calidad relativa.

## Limitaciones y advertencias

- La model card no documenta datos, hiperparámetros ni evaluación: no es posible verificar qué comportamiento exacto induce el adaptador.
- Por el identificador ("bad-medical"), es probable que el modelo produzca información médica incorrecta, sesgada o potencialmente dañina; no debe usarse en contextos clínicos, de salud pública ni de atención al paciente.
- Riesgo elevado de alucinación y de afirmaciones médicas falsas con apariencia de verosimilitud.
- Licencia no disponible: no se puede asumir uso comercial permitido. El modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache 2.0, pero el adaptador no declara licencia propia.
- Idiomas soportados no declarados; el comportamiento multilingüe del adaptador es desconocido.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta): no hay evidencia externa de funcionamiento correcto.
- El adaptador requiere el modelo base para ejecutarse; no es un artefacto autónomo y debe fusionarse o cargarse con PEFT.
- Uso responsable: si se emplea en investigación, conviene aislarlo en entornos controlados y no exponerlo mediante APIs públicas sin filtros de contenido.
- No apto para producción sin una evaluación de seguridad independiente y sin documentación técnica del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-ckpt-s1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Documentación de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Calculadora de impacto de carbono (Lacoste et al., 2019): https://mlco2.github.io/impact
- Paper referenciado en los tags (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
