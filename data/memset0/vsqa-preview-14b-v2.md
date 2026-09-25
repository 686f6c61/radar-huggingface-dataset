# memset0/vsqa-preview-14b-v2

## Resumen

VSQA preview 14B v2 es un checkpoint de generación de vídeo a partir de texto publicado por el usuario memset0 en Hugging Face. Deriva del modelo Wan-AI/Wan2.1-T2V-14B-Diffusers (14 000 millones de parámetros) y combina dos innovaciones: cuantización NVFP4 con quantization-aware training (QAT) en atención y capas lineales, y atención dispersa VSA con cubo C256 (4,8,8) y sparsity 0,9. Sobre esa base se aplica una destilación DMD (Distribution Matching Distillation) de 200 pasos.

El modelo es un "preview checkpoint" que, según el propio autor, aún no ha sido evaluado. Genera clips de 77 fotogramas a 1280×768 mediante un contrato de muestreo destilado de solo 3 pasos de denoising (timesteps 1000.0, 941.1763916015625 y 800.0), con flow_shift 8.0 y guidance scale 1.0. Se sitúa así en la línea de los modelos de vídeo de pocos pasos, que sustituyen las decenas de pasos habituales por un número muy reducido.

Su interés es doble: por un lado, explora cuantización de 4 bits y atención dispersa en difusión de vídeo a escala 14B; por otro, documenta de forma detallada la genealogía de entrenamiento (250 pasos de reconstrucción densa, 500 de inicialización ODE y 200 de DMD). La licencia Apache-2.0 y el layout Diffusers facilitan su integración, aunque reproducir los numéricos exactos exige kernels específicos (FastVideo VSA/QAT).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) heredada de Wan2.1-T2V-14B; atención dispersa VSA y cuantización NVFP4 QAT |
| Parámetros totales | 14 000 millones (14B) |
| Parámetros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-video; clip de 77 fotogramas a 1280×768) |
| Tipos de cuantización | NVFP4 (QAT) en atención y capas lineales; el modelo base está en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (layout Diffusers) |
| Tamaño del repositorio | 84,6 GB |
| Modelo base | Wan-AI/Wan2.1-T2V-14B-Diffusers |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-14B, un transformer de difusión (DiT) de 14B para text-to-video. En este checkpoint solo se sustituye el subdirectorio `transformer/` por el estudiante exportado; el codificador de texto y el VAE permanecen sin cambios respecto al modelo base, según la model card. La atención usa el backend `VSA_QAT_TRAIN_C256` con sparsity 0,9 y cubo (4,8,8), y las capas lineales emplean cuantización `nvfp4_qat_train_gs1`.

La genealogía de entrenamiento, realizada a 77 fotogramas, 1280×768 y batch global 16 desde los pesos originales de Wan2.1-T2V-14B, consta de tres etapas: (1) reconstrucción densa NVFP4 por capa durante 250 pasos; (2) inicialización ODE plana (regresión de punto final) durante 500 pasos, con VSA C256 cubo (4,8,8), sparsity 0,9 y QAT NVFP4 en atención y lineales; y (3) destilación DMD de 200 pasos desde la etapa 2, con learning rate de estudiante 2e-6, learning rate de crítico 2e-6, actualización del generador en cada iteración y sin EMA. Tanto el teacher como el crítico son el Wan2.1-T2V-14B denso original.

La diferencia respecto a `memset0/vsqa-preview-14b` (V0362) es doble: el learning rate del crítico pasa de 4e-7 a 2e-6 (ratio de actualización del crítico sin cambios), y la QAT NVFP4 de las capas lineales usa escalas globales fijadas a 1.0 para activaciones y pesos (`nvfp4_qat_train_gs1`), en lugar de la escala dinámica `448·6/max|x|` recalculada en cada forward.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), pipeline declarado `text-to-video`.
- Producción de clips de 77 fotogramas a resolución 1280×768.
- Inferencia destilada de 3 pasos de denoising con flow_shift 8.0 y guidance scale 1.0.
- Cuantización NVFP4 entrenada con QAT en atención y capas lineales, con atención dispersa VSA (sparsity 0,9).
- No se documenta soporte de tool calling ni function calling.
- No se documentan capacidades de agente ni razonamiento multi-paso.
- No se documentan capacidades de audio, imagen a vídeo ni edición de vídeo.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- No se documenta un "modo thinking" ni variantes de razonamiento explícito.

## Casos de uso

- Previsualización de anuncios cortos: el modelo genera clips de 77 fotogramas a 1280×768 en 3 pasos, lo que permite iterar borradores de vídeo publicitario con un coste de cómputo mucho menor que un muestreo de decenas de pasos.
- Storyboards animados para cine o animación: a partir de descripciones de texto se pueden producir planos de previsualización con la resolución y duración del contrato de muestreo declarado.
- Investigación en cuantización de 4 bits: sirve como referencia para estudiar el efecto de NVFP4 QAT con escalas globales fijas frente a escalas dinámicas en difusión de vídeo.
- Investigación en atención dispersa: el uso de VSA C256 cubo (4,8,8) con sparsity 0,9 lo convierte en banco de pruebas para medir el impacto de la dispersión en la calidad del vídeo.
- Estudio de destilación DMD: el checkpoint documenta la secuencia completa (250 + 500 + 200 pasos) y permite comparar configuraciones de learning rate del crítico.
- Generación de contenido para redes sociales: los clips de 1280×768, 77 fotogramas, encajan en formatos horizontales de publicación rápida, siempre que se valide la calidad al no estar evaluado.
- Reproducción de pipelines de despliegue: útil para probar la integración de kernels VSA/QAT (FastVideo) en flujos de inferencia con Diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente que se trata de un "preview checkpoint, not yet evaluated".

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de 14B parámetros): en BF16, en torno a 28 GB solo para el transformer, más el coste del codificador de texto y del VAE; en NVFP4, aproximadamente 7-8 GB para el transformer.
- El repositorio ocupa 84,6 GB, lo que sugiere que incluye varias precisiones y componentes además del estudiante cuantizado.
- GPU recomendadas: para BF16, H100 80 GB o A100 80 GB; con NVFP4 el transformer podría caber en placas de 24 GB como la RTX 4090, aunque de forma ajustada y dependiendo del resto de componentes.
- Cabe en GPU de consumo (RTX 4090 24 GB) únicamente en la variante cuantizada NVFP4; la configuración BF16 densa no es viable en una sola GPU de consumo.
- Opciones de despliegue: Diffusers (layout oficial del checkpoint) y kernels FastVideo VSA/QAT. No aplican llama.cpp, Ollama ni TGI, por no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles. La model card no publica cifras de tiempo por clip ni de fotogramas por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Salida | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| memset0/vsqa-preview-14b-v2 | 14B | 77 fotogramas, 1280×768, 3 pasos | apache-2.0 | Hugging Face (Diffusers) | NVFP4 QAT, VSA, DMD; no evaluado |
| memset0/vsqa-preview-14b | 14B | 77 fotogramas, 1280×768 | apache-2.0 | Hugging Face | Versión previa (V0362); crítico LR 4e-7 y escalas dinámicas |
| Wan-AI/Wan2.1-T2V-14B-Diffusers | 14B | text-to-video | apache-2.0 | Hugging Face | Modelo base, BF16 denso, sin destilación DMD documentada |
| Wan-AI/Wan2.2-Animate-14B | 14B | animación de personajes | no disponible | Hugging Face | Tarea distinta (animación); pertenece a la misma familia Wan |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de previsualización no evaluado: no hay métricas de calidad de vídeo ni comparaciones cuantitativas publicadas.
- Reproducir los numéricos entrenados requiere los kernels FastVideo VSA/QAT más el parche de escala global 1; la inferencia densa en BF16 es una configuración distinta y no probada, según el autor.
- La destilación a 3 pasos puede implicar pérdida de calidad frente a un muestreo de más pasos; no se aportan datos que lo confirmen o desmientan.
- No se declaran idiomas soportados, por lo que el comportamiento multilingüe del codificador de texto es desconocido en esta ficha.
- El rendimiento en prompts fuera de la distribución de entrenamiento (77 fotogramas, 1280×768) no está documentado.
- Sesgos conocidos: no disponibles; hereda los del modelo base Wan2.1-T2V-14B, cuya composición de dataset no se detalla en la información proporcionada.
- Riesgo de alucinación visual: no cuantificado; como modelo generativo puede producir contenido incoherente o artefactos, especialmente en la configuración destilada.
- Licencia Apache-2.0 permite uso comercial, pero el modelo hereda la licencia y condiciones del modelo base, que conviene revisar antes de desplegarlo en producción.
- La dependencia de kernels específicos puede dificultar la portabilidad a entornos de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/memset0/vsqa-preview-14b-v2
- Versión previa (V0362): https://huggingface.co/memset0/vsqa-preview-14b
- Variante 1.3B: https://huggingface.co/memset0/vsqa-preview-1.3b
- Perfil de GitHub del autor: https://github.com/memset0
- Modelo base Wan2.1-T2V-14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B-Diffusers
- Wan2.2-Animate-14B: https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
