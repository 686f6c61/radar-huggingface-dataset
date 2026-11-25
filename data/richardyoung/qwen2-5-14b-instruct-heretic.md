# richardyoung/Qwen2.5-14B-Instruct-heretic

## Resumen

Qwen2.5-14B-Instruct-heretic es un modelo de lenguaje de 14.770 millones de parámetros derivado de Qwen/Qwen2.5-14B mediante técnicas de "abliteration" o decensado, publicados por el usuario richardyoung en Hugging Face. El objetivo declarado es eliminar los mecanismos de rechazo y censura del modelo instruct original, manteniendo al mismo tiempo la mayor parte de sus capacidades conversacionales y de razonamiento. La etiqueta "heretic" hace referencia a la familia de herramientas de decensado automático que ajustan direcciones de activación para suprimir comportamientos de negativa.

El modelo hereda la arquitectura transformer densa de Qwen2.5, con 14.770 millones de parámetros, y se distribuye en formato safetensors bajo licencia Apache 2.0. El repositorio ocupa 29,6 GB y está marcado como acceso restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo. El modelo base es Qwen/Qwen2.5-14B, y la ficha indica únicamente inglés como idioma soportado, aunque el modelo original de Qwen2.5 es multilingüe.

La relevancia de esta variante radica en su uso en investigación sobre alineación, evaluación de robustez de filtros de seguridad y experimentación con modelos sin rechazos en entornos controlados. No obstante, al tratarse de un derivado no oficial, no cuenta con garantías de calidad, evaluación sistemática ni soporte del equipo original de Qwen. Las descargas son muy bajas (90 en el momento de la consulta) y no hay resultados de benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2) |
| Parámetros totales | 14.770.033.664 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-14B soporta hasta 131.072 tokens, pero no se confirma para esta variante) |
| Tipos de cuantización | no disponible en la información proporcionada (formato safetensors en precisión original; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | en (inglés) según la ficha; el modelo base es multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 29,6 GB |
| Acceso | restringido (gated) |
| Modelo base | Qwen/Qwen2.5-14B |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B: un transformer denso con atención por causalidad, normalización RMSNorm, activaciones SwiGLU y atención con RoPE, tal como se describe en el informe técnico de Qwen2.5 (arXiv:2407.10671). El modelo original fue preentrenado con un corpus de hasta 18 billones de tokens según la documentación de Qwen, seguido de ajuste supervisado y optimización por preferencias. Esta variante "heretic" no reentrena el modelo desde cero, sino que aplica una modificación post-hoc sobre los pesos o las direcciones de activación para suprimir el comportamiento de rechazo.

La técnica de decensado (abliteration) consiste en identificar la dirección de activación asociada a la negativa a responder y proyectar los pesos fuera de esa dirección, de modo que el modelo deja de activar el patrón de rechazo ante solicitudes que el modelo original rechazaría. El autor etiqueta el proceso como "reproducible", lo que sugiere que el pipeline de transformación está documentado o es replicable. No se dispone de información sobre el número exacto de tokens adicionales, la composición del dataset de calibración ni si se aplicó un ajuste fino posterior con DPO o RLHF específico para esta variante.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste instruct de Qwen2.5-14B.
- Razonamiento y resolución de problemas de complejidad media, con capacidad de cadena de pensamiento si se induce por prompt.
- Generación de código y explicaciones técnicas, aunque sin evaluación específica publicada para esta variante.
- Matemáticas y cálculo simbólico básico a moderado, sujeto a las limitaciones del modelo base.
- Soporte de tool calling y function calling en la medida en que el modelo base lo implementa (Qwen2.5 incluye plantillas para ello), aunque no se confirma en la ficha.
- Capacidades multilingües del modelo base (Qwen2.5 soporta decenas de idiomas), aunque la ficha solo declara inglés.
- Modo "sin rechazos": el modelo no activa negativas ante solicitudes que el original rechazaría, lo que constituye su rasgo diferencial.
- No se declaran capacidades de visión, audio ni modos de pensamiento explícitos en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo se comporta un LLM cuando se eliminan sus mecanismos de rechazo, comparando respuestas con el modelo base para analizar sesgos y riesgos. Es adecuado porque el cambio está aislado en los pesos y es reproducible.
- Evaluación de robustez de filtros: se puede usar como generador adversarial para probar clasificadores de contenido o sistemas de moderación, ya que produce respuestas que los filtros deben detectar y bloquear.
- Experimentación con prompts de rol y creatividad: en entornos de escritura de ficción o juegos de rol donde el modelo original rechazaría contenido sensible, esta variante permite explorar narrativas sin interrupciones, siempre con revisión humana.
- Pruebas de regresión de pipelines de inferencia: sirve para verificar que un stack de despliegue (vLLM, TGI) maneja correctamente modelos de 14B con pesos modificados y plantillas de chat de Qwen.
- Análisis de degradación de capacidades: comparar MMLU, GSM8K o HumanEval entre el original y esta variante permite cuantificar el coste del decensado en rendimiento, un caso de uso típico en papers de abliteration.
- Generación de datos sintéticos para entrenamiento: en dominios donde se necesita texto sin restricciones temáticas (por ejemplo, narrativa de terror o debates éticos), el modelo puede producir ejemplos que luego se filtran y anotan manualmente.
- Docencia y divulgación: explicar en un curso o taller cómo funcionan los mecanismos de rechazo y qué ocurre al suprimirlos, usando el par original/heretic como demostración controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 29,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 32-40 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: alrededor de 15-16 GB, viable en GPUs de 24 GB con margen limitado.
- VRAM estimada en cuantización de 4 bits: alrededor de 8-10 GB, viable en GPUs consumer de 12-16 GB.
- GPUs recomendadas para FP16: A100 40/80 GB, H100 80 GB, L40S 48 GB; para 8 bits: RTX 4090 24 GB, A6000 48 GB; para 4 bits: RTX 4080/4090, RTX 3090.
- Cabe en GPU consumer: sí, en cuantización de 4 u 8 bits; en FP16 no cabe en GPUs de 24 GB sin offloading.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), y previsiblemente vLLM y llama.cpp si se generan cuantizaciones GGUF, aunque no se listan en la ficha.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-14B-Instruct-heretic | 14,77 B | no disponible en la ficha | Apache 2.0 | Gated | Variante decensada no oficial |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 131.072 tokens (según documentación de Qwen) | Apache 2.0 | Abierto | Modelo original con alineación estándar |
| Qwen/Qwen2.5-14B | 14,77 B | 131.072 tokens (según documentación de Qwen) | Apache 2.0 | Abierto | Modelo base sin ajuste instruct |
| Otras variantes abliterated de la comunidad (por ejemplo, derivados de Llama 3 o Mistral) | Variable (7-13 B típicamente) | Variable | Según modelo base | Variable | No se dispone de datos comparativos concretos en la información proporcionada |

## Limitaciones y advertencias

- El decensado elimina los rechazos, pero no garantiza que el modelo sea seguro: puede generar contenido dañino, ilegal o inexacto sin advertencia.
- Riesgo elevado de alucinación, especialmente fuera de dominios bien representados en el modelo base; no hay evaluación publicada que lo cuantifique.
- Sesgos heredados de Qwen2.5-14B, que pueden verse amplificados al suprimir los mecanismos de rechazo.
- La ficha declara solo inglés como idioma, aunque el modelo base es multilingüe; el comportamiento en otros idiomas no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero el uso de un modelo decensado en producción conlleva responsabilidad legal y reputacional; se recomienda revisión de cumplimiento.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede limitar la automatización de descargas en CI/CD.
- No hay benchmarks publicados ni evaluación independiente; el rendimiento real frente al original es desconocido.
- Las descargas son muy bajas (90) y el modelo tiene 0 likes, lo que sugiere poca validación por parte de la comunidad.
- No se confirma la longitud de contexto efectiva de esta variante; podría diferir del modelo base si el proceso de decensado alteró configuraciones.
- No se dispone de cuantizaciones oficiales (GGUF, AWQ, GPTQ) en la información proporcionada, lo que obliga a generarlas por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-14B-Instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B
- Informe técnico de Qwen2.5 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Referencia citada en los tags (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
