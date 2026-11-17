# Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-GGUF

## Resumen

Ornith 1.5 9B — BuildEng V9 (GGUF) es un ajuste fino del modelo base ornith-ai/Ornith-1.5-9B, desarrollado por Irfan Uruchi y publicado en formato GGUF para su uso con llama.cpp y runtimes compatibles. El modelo está especializado en discusiones técnicas de ingeniería de la edificación y construcción: trayectorias de cargas estructurales, patologías en hormigón armado, cambios en obra, obras provisionales, evaluación de ingeniería e identificación de hipótesis faltantes o comprobaciones necesarias.

El modelo cuenta con 8.953.803.264 parámetros totales (aproximadamente 9B) y deriva de una arquitectura Qwen3.5, según las etiquetas del autor. Se distribuye en tres cuantizaciones GGUF (Q4_K_M, Q5_K_M y Q6_K) con tamaños de descarga de 5,68 GB, 6,49 GB y 7,36 GB respectivamente. La licencia es MIT, lo que facilita su uso comercial, aunque con las advertencias propias de un modelo de dominio técnico no validado.

Es relevante porque ofrece una alternativa ligera y desplegable localmente para asistencia en borradores y discusiones de ingeniería estructural, aunque el propio autor insiste en que no es un solucionador de análisis estructural ni un verificador de cumplimiento normativo. No se han publicado benchmarks comparativos de calidad, throughput ni memoria para esta release GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5 (según etiquetas del autor) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K (GGUF); releases MLX en 3, 4, 6 y 8 bits |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (F16 base convertido a Q4_K_M, Q5_K_M, Q6_K); también MLX en el repositorio relacionado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base ornith-ai/Ornith-1.5-9B, que según las etiquetas del autor deriva de la arquitectura Qwen3.5. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. El ajuste fino se asocia al dataset BuildEng (Irfanuruchi/buildeng-v8-3b), orientado a ingeniería de la edificación y construcción.

El proceso de conversión a GGUF descrito por el autor es relevante técnicamente: se fusionó el adaptador LoRA de BuildEng V9 en una base MLX 8-bit, se desquantizó a tensores en coma flotante (sin recuperar la precisión BF16 original), se canonicalizaron los tensores revirtiendo los offsets de normalización específicos de MLX para Qwen3.5 y restaurando el layout de convolución, se exportó a F16 GGUF con las herramientas de llama.cpp y finalmente se cuantizó a Q4_K_M, Q5_K_M y Q6_K. El autor advierte explícitamente que estos GGUF no son un reempaquetado directo del checkpoint MLX 4-bit publicado y que no se ha establecido equivalencia numérica entre las distintas rutas de release.

## Capacidades

- Generación de texto en inglés orientada a discusiones técnicas de ingeniería estructural y de la edificación.
- Razonamiento sobre trayectorias de cargas, patologías del hormigón armado, cambios en obra y obras provisionales.
- Identificación de hipótesis faltantes y comprobaciones requeridas en un planteamiento de ingeniería.
- Redacción de borradores y checklists preliminares de evaluación técnica.
- Modo de razonamiento configurable mediante `--reasoning off` en llama.cpp (el comportamiento exacto depende de la plantilla de chat y de la versión del runtime).
- Interfaz texto a texto; no se han validado entradas multimodales (imagen, audio) para esta release.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Revisión preliminar de trayectorias de carga: el modelo puede ayudar a describir cómo se transmite la carga en vigas de transferencia y enumerar las comprobaciones previas a un cambio de apoyos, como ilustra el ejemplo de la model card.
- Borradores de checklists de inspección: útil para generar listas preliminares de puntos a verificar en una evaluación estructural, que luego un ingeniero cualificado revisa y completa.
- Discusión técnica de patologías en hormigón armado: el modelo puede organizar hipótesis sobre fisuración, carbonatación o corrosión de armaduras y sugerir información adicional necesaria.
- Apoyo a la redacción de informes técnicos: generación de borradores de secciones descriptivas sobre cambios en obra u obras provisionales, con revisión humana posterior.
- Formación y documentación interna: creación de material didáctico o notas técnicas sobre conceptos de ingeniería estructural, dado su ajuste al dominio y su despliegue local con llama.cpp.
- Asistente local en obra con hardware modesto: al caber en cuantización Q4_K_M (5,68 GB), puede ejecutarse en estaciones de trabajo con GPU de consumo o en Apple Silicon mediante runtimes compatibles, sin depender de servicios en la nube.
- Detección de supuestos faltantes: el modelo está entrenado para señalar información ausente en un planteamiento técnico, lo que puede usarse como paso previo a la revisión por un ingeniero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se han establecido benchmarks comparativos de calidad GGUF, throughput, latencia ni memoria pico. Como referencia no equivalente, la release MLX 4-bit midió 29,46 tokens generados por segundo en una ejecución sobre un Apple M6 Mac mini, dato que no predice el rendimiento en runtimes GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el autor advierte que la memoria requerida supera el tamaño del archivo y depende del backend, la longitud de contexto y la caché KV.
- Tamaños de archivo: Q4_K_M 5,68 GB, Q5_K_M 6,49 GB, Q6_K 7,36 GB (gigabytes decimales aproximados).
- GPU recomendadas: no especificadas por el autor. Por tamaño, un modelo de ~9B en Q4_K_M puede caber en GPU de consumo con 8-12 GB de VRAM, aunque no hay validación publicada.
- Cabe en GPU de consumo: probable en Q4_K_M y Q5_K_M con GPUs de 8-12 GB, y en Q6_K con 12 GB o más; sin confirmación oficial.
- Opciones de despliegue: llama.cpp (build reciente con soporte para la arquitectura Qwen3.5), LM Studio y Jan (no probados independientemente según el autor). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no establecidos para GGUF. La única cifra disponible es la de la release MLX 4-bit (29,46 tokens/s en Apple M6 Mac mini), no aplicable a GGUF.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría (ajustes finos de dominio para ingeniería estructural o modelos de ~9B en GGUF). No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- El modelo puede producir cálculos incorrectos, omitir casos de carga importantes, inventar disposiciones normativas, malinterpretar unidades o propiedades de materiales y extraer conclusiones injustificadas de entradas incompletas.
- No es un solucionador de análisis estructural, ni un verificador de cumplimiento normativo, ni un sistema de decisión de ingeniería validado independientemente.
- No se ha establecido precisión en benchmarks de ingeniería estructural ni equivalencia de comportamiento con el modelo upstream Ornith o con las releases MLX.
- Solo soporta inglés; no se declaran capacidades multilingües.
- La licencia MIT permite uso comercial, pero el autor restringe explícitamente el uso para aprobar modificaciones estructurales sin revisión de un ingeniero cualificado.
- Las decisiones que afecten a la seguridad estructural requieren revisión por un ingeniero cualificado; el modelo no debe usarse solo para aprobar cambios estructurales.
- No se han validado entradas multimodales (imagen, audio) para esta release.
- No hay benchmarks de throughput, latencia ni memoria pico para los GGUF; el rendimiento en producción es incierto.
- El proceso de conversión pasa por una base MLX 8-bit desquantizada, por lo que la precisión numérica respecto al modelo original no está garantizada.

## Enlaces

- Hugging Face: https://huggingface.co/Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Dataset BuildEng: https://huggingface.co/datasets/Irfanuruchi/buildeng-v8-3b
- Release MLX 3-bit: https://huggingface.co/Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-3bit
- Release MLX 4-bit: https://huggingface.co/Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-4bit
- Release MLX 6-bit: https://huggingface.co/Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-6bit
- Release MLX 8-bit: https://huggingface.co/Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-8bit
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- Jan: https://jan.ai/
