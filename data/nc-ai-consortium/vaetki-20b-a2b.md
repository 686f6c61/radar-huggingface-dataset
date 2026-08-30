# nc-ai-consortium/VAETKI-20B-A2B

## Resumen

VAETKI-20B-A2B es un modelo de lenguaje causal (autoregresivo) desarrollado por el consorcio NC-AI, una colaboración de 13 organizaciones liderada por NC-AI, en el marco de la iniciativa surcoreana de modelos fundacionales de IA soberana. El modelo está diseñado específicamente para la eficiencia en inferencia, adoptando una arquitectura de mezcla de expertos (MoE) que permite activar solo una fracción de sus parámetros por token procesado. Con 19,64 mil millones de parámetros totales y solo 2,2 mil millones activos, ofrece un equilibrio entre capacidad y coste computacional, orientado a despliegues prácticos en entornos con recursos limitados.

El modelo soporta cuatro idiomas principales (coreano, inglés, chino y japonés) y una ventana de contexto de 16 000 tokens, lo que lo hace adecuado para tareas de generación de texto, razonamiento y conversación multilingüe. Su licencia MIT permite uso comercial sin restricciones significativas, y su entrenamiento se realizó sobre 3,62 billones de tokens utilizando 256 GPU NVIDIA H100. Aunque la evaluación pública aún está pendiente de publicación, el modelo se presenta como una opción viable para aplicaciones que requieran procesamiento multilingüe eficiente en la región asiática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers, MoE (Mixture of Experts) |
| Parametros totales | 19 596 810 240 (19,64B) |
| Parametros activos | 2,2B |
| Longitud de contexto | 16 384 tokens (16k) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Coreano, inglés, chino, japonés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VAETKI-20B-A2B emplea una arquitectura Transformer con mezcla de expertos (MoE). El modelo tiene 24 capas, 16 cabezas de atención, 128 expertos en total y 8 expertos activos por token, lo que explica su ratio de parámetros activos frente a totales (2,2B activos de 19,64B). El vocabulario alcanza 126 000 tokens, lo que facilita la cobertura de los cuatro idiomas soportados. La implementación se basa en Megatron-Core v0.14, con modificaciones selectivas para adaptarse a los requisitos experimentales.

El entrenamiento se realizó en dos fases: preentrenamiento y post-entrenamiento. Se utilizaron 3,62 billones de tokens procedentes de fuentes de datos disponibles públicamente, con un contexto que se expandió de 4096 a 16 384 tokens durante el proceso. El hardware empleado fueron 256 GPU NVIDIA H100 80GB HBM3 en la plataforma Naver Cloud MLX. Los hiperparámetros principales incluyen una tasa de aprendizaje que decayó de 2e-4 a 1e-5, y un tamaño de lote que varió entre 8,1 y 32,4 millones de tokens. No se especifica el uso de técnicas de alineación como RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva en cuatro idiomas: coreano, inglés, chino y japonés.
- Conversación multilingüe de múltiples turnos, gracias a su ventana de contexto de 16k tokens.
- Razonamiento básico y tareas de comprensión del lenguaje, aunque con limitaciones en razonamiento multi-paso complejo.
- Generación de código, con advertencia de que puede no ser estrictamente correcta en todos los casos.
- Cálculo matemático, con precisión limitada en operaciones complejas.
- No se menciona soporte explícito para tool calling, function calling, agentes o modos de pensamiento (thinking mode) en la documentación disponible.
- No se indica capacidad multimodal, a pesar de que el artículo de noticias menciona "multimodal" para la serie VAETKI, pero el modelo concreto 20B-A2B no especifica entrada de visión o audio.

## Casos de uso

- Asistencia conversacional multilingüe: el modelo puede gestionar diálogos en coreano, inglés, chino y japonés, lo que lo hace adecuado para chatbots de atención al cliente en mercados asiáticos, aprovechando su contexto de 16k tokens para mantener conversaciones largas.
- Traducción automática asistida: gracias a su entrenamiento multilingüe, puede utilizarse como base para sistemas de traducción entre los cuatro idiomas soportados, aunque se recomienda validar la calidad en dominios específicos.
- Generación de contenido localizado: empresas que necesiten producir textos en varios idiomas asiáticos (por ejemplo, descripciones de productos, artículos de blog) pueden usar el modelo para redactar borradores iniciales que luego sean revisados por hablantes nativos.
- Análisis de sentimiento y clasificación de texto: su capacidad de comprensión del lenguaje permite aplicarlo a tareas de minería de opiniones en redes sociales o encuestas, siempre que se ajuste con datos específicos del dominio.
- Generación de código en entornos de desarrollo: aunque con limitaciones de corrección, puede servir como asistente de programación para esbozar funciones o documentar código, especialmente en proyectos que requieran soporte multilingüe en comentarios.
- Investigación académica en PNL: al ser un modelo abierto con licencia MIT, es útil para experimentos de fine-tuning, evaluación de técnicas MoE o estudios comparativos de eficiencia en inferencia, dado su bajo número de parámetros activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la model card indica "to be updated", por lo que no hay datos verificables de rendimiento en tareas como MMLU, HumanEval o GSM8K. Se recomienda consultar el repositorio de GitHub o el informe técnico para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: con 19,64B parámetros en precisión fp16, se necesitan aproximadamente 39,2 GB de VRAM (el tamaño del repo es 39,2 GB, lo que sugiere pesos en fp16). Con cuantización a 8 bits, se reduciría a ~19,6 GB; a 4 bits, ~9,8 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para fp16, se requiere una GPU con al menos 40 GB de VRAM, como NVIDIA A100 40GB, A100 80GB o H100. Con cuantización a 8 bits, cabría en una RTX 4090 (24 GB) o similar; a 4 bits, en GPUs de 12-16 GB.
- En consumer GPU: solo con cuantización agresiva (4 bits) podría ejecutarse en GPUs de gama alta como RTX 3090 o RTX 4090, pero no de forma nativa en fp16.
- Opciones de despliegue: al ser un modelo con pesos en safetensors, puede cargarse con frameworks como Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se mencionan integraciones específicas en la documentación.
- Latencia y throughput: no se proporcionan datos medidos. Dado su bajo número de parámetros activos (2,2B), se espera una inferencia más rápida que un modelo denso de tamaño equivalente, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| VAETKI-20B-A2B | 19,64B | 2,2B | 16k | ko, en, zh, ja | MIT |
| Mixtral 8x7B | 46,7B | 12,9B | 32k | Multilingüe (principalmente en) | Apache 2.0 |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32k | Multilingüe (incluye zh, en) | Apache 2.0 |

No se dispone de datos de rendimiento comparativo en benchmarks, ya que VAETKI no ha publicado resultados. La comparación se limita a características arquitectónicas. VAETKI destaca por su licencia MIT (más permisiva que Apache 2.0 en algunos aspectos) y su enfoque en idiomas asiáticos, mientras que Mixtral y Qwen ofrecen contextos más largos y un ecosistema más maduro. La elección dependerá de las necesidades específicas de idioma y de la tolerancia a la falta de benchmarks verificados.

## Limitaciones y advertencias

- El modelo puede producir contenido inexacto o incompleto, incluyendo alucinaciones, especialmente en tareas que requieren alta precisión factual.
- Presenta limitaciones en razonamiento multi-paso complejo, cálculo matemático preciso y corrección estricta en generación de código.
- No tiene capacidad de verificar información de forma independiente.
- Los datos de entrenamiento pueden contener sesgos sociales o culturales (género, etnia, nacionalidad, religión) que podrían reflejarse en las salidas.
- No está diseñado para uso en dominios críticos de seguridad, como aplicaciones médicas, legales, financieras o militares.
- La ventana de contexto de 16k tokens es menor que la de otros modelos MoE recientes (32k), lo que puede limitar tareas que requieran documentos largos.
- No se han publicado cuantizaciones oficiales, por lo que el despliegue en hardware con poca VRAM requiere conversión manual a formatos como GGUF, lo que puede introducir pérdida de calidad.
- La falta de benchmarks públicos dificulta la evaluación objetiva de su rendimiento frente a alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/nc-ai-consortium/VAETKI-20B-A2B
- Repositorio GitHub: https://github.com/wbl-ncai/VAETKI/
- Informe técnico (PDF): https://github.com/wbl-ncai/VAETKI/blob/main/VAETKI_Technical_Report.pdf
- Archivo NOTICE.md: https://github.com/wbl-ncai/VAETKI/blob/main/NOTICE.md
- Artículo de noticias sobre la serie VAETKI: http://www.ai-newss.com/news/articleView.html?idxno=31547
