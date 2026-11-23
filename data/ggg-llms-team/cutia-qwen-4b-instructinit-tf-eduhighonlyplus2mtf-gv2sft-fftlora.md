# ggg-llms-team/CutIA-Qwen-4B-InstructInit-TF-EduHighOnlyPlus2MTF-gv2sft-fftlora

## Resumen

CutIA-Qwen-4B-InstructInit-TF-EduHighOnlyPlus2MTF-gv2sft-fftlora es un checkpoint experimental publicado por el equipo ggg-llms-team en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo ggg-llms-team/CutIA-Qwen-4B-InstructInit-TF-EduHighOnlyPlus2MTF, que a su vez parte de la familia Qwen3, según los tags del repositorio. El nombre del checkpoint sugiere una cadena de entrenamiento en dos fases: un ajuste supervisado (SFT) sobre un dataset identificado como "gv2" y, posteriormente, un ajuste con LoRA sobre atención completa ("fftlora", probablemente full fine-tuning LoRA). El modelo base intermedio incorpora en su nombre referencias a un corpus educativo filtrado ("EduHighOnlyPlus2MTF").

El modelo cuenta con 4.411.424.256 parámetros totales en formato safetensors, lo que lo sitúa en la categoría de modelos de 4B, un rango muy práctico para despliegue en hardware de consumo y para tareas de generación de texto con recursos limitados. La arquitectura declarada es causal-lm sobre base Qwen3, aunque la model card no detalla la longitud de contexto, los idiomas soportados ni la licencia.

La relevancia de este checkpoint es limitada y muy específica: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y con una model card mínima que lo etiqueta explícitamente como "experimental checkpoint". No debe confundirse con un modelo listo para producción; su interés reside en documentar una cadena de ajuste concreto sobre Qwen3-4B con fines educativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), base Qwen3 |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas, no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | ggg-llms-team/CutIA-Qwen-4B-InstructInit-TF-EduHighOnlyPlus2MTF |
| Tamano del repositorio | 33,7 GB |
| Fecha de creacion | 2026-11-23 |
| Ultima actualizacion | 2026-11-23 |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es un transformer causal de tipo causal-lm construido sobre la familia Qwen3, con 4.411.424.256 parámetros. No se detalla el número de capas, la dimensión oculta, el número de cabezas de atención ni si emplea alguna variante de atención lineal o decodificación especulativa. Tampoco se especifica la longitud de contexto nativa del modelo base Qwen3 subyacente.

Respecto al entrenamiento, el nombre del checkpoint permite inferir una cadena de dos etapas: primero un ajuste fino supervisado (SFT) sobre un dataset denominado "gv2", y después un ajuste con LoRA sobre atención completa ("fftlora"). El modelo base intermedio, CutIA-Qwen-4B-InstructInit-TF-EduHighOnlyPlus2MTF, sugiere en su nomenclatura el uso de un corpus educativo filtrado de alta calidad ("EduHighOnlyPlus2MTF"), aunque no se documenta el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO. La model card no proporciona ninguna innovación técnica destacable más allá de la propia cadena de ajuste.

## Capacidades

- Generación de texto autoregresiva propia de un modelo causal-lm de 4B parámetros.
- Razonamiento e instrucciones: el sufijo "InstructInit" del modelo base sugiere una inicialización orientada a seguir instrucciones, aunque no se documenta el formato de prompt ni la plantilla de chat.
- Capacidades multilingües: no disponibles; el autor no declara idiomas soportados.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Investigación sobre cadenas de ajuste fino: el checkpoint sirve para estudiar el efecto de un SFT seguido de un LoRA sobre un modelo Qwen3-4B, comparando el comportamiento antes y después de cada etapa.
- Reproducción de experimentos educativos: dado el origen "EduHighOnly" del modelo base, puede emplearse para evaluar ajustes orientados a dominios educativos en entornos controlados de laboratorio.
- Prototipado rápido en local: con 4,4B parámetros, es viable cargarlo en una GPU de consumo para pruebas de generación de texto sin requisitos de infraestructura elevados.
- Evaluación comparativa de checkpoints: al ser un artefacto experimental, resulta útil como punto de referencia en estudios de ablación sobre datos de instrucción.
- Base para nuevos ajustes LoRA: su formato safetensors y su tamaño permiten emplearlo como punto de partida para experimentos de personalización con LoRA.
- Docencia y formación: puede utilizarse en cursos sobre fine-tuning y despliegue de modelos open source para ilustrar el ciclo completo de entrenamiento y publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 8,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 10-12 GB.
- VRAM estimada con cuantización de 8 bits: aproximadamente 4,5-5 GB para pesos.
- VRAM estimada con cuantización de 4 bits: aproximadamente 2,5-3 GB para pesos.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) para fp16 sin problemas; RTX 4080 (16 GB) y RTX 4070 Ti (12 GB) para fp16 con margen ajustado o cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y, con cuantización 4-bit, en GPUs de 8 GB como RTX 3070.
- Opciones de despliegue: transformers (documentado por el autor), vLLM, TGI, llama.cpp y Ollama mediante conversión a GGUF (no documentado oficialmente por el autor).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CutIA-Qwen-4B-InstructInit-TF-EduHighOnlyPlus2MTF-gv2sft-fftlora | 4,41B | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen3-4B | ~4B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Llama 3.2 3B Instruct | ~3,2B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Phi-3.5-mini-instruct | ~3,8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo para el modelo analizado, por lo que la comparación se limita a parámetros y disponibilidad. Los datos de los modelos alternativos deben consultarse en sus respectivas fichas oficiales.

## Limitaciones y advertencias

- Modelo explícitamente etiquetado como "experimental checkpoint" por el autor; no está validado para producción.
- Sin licencia declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar la licencia del modelo base Qwen3 antes de cualquier uso.
- Sin idiomas declarados: se desconoce el rendimiento real en castellano u otros idiomas distintos del inglés.
- Sin datos de benchmarks: no hay evidencia publicada de calidad en razonamiento, código o matemáticas.
- Riesgo de alucinación inherente a los modelos de 4B parámetros, especialmente en tareas de conocimiento factual.
- Cadena de entrenamiento poco documentada: no se especifican tokens, composición del dataset ni hiperparámetros, lo que dificulta la reproducibilidad.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- El repositorio ocupa 33,7 GB, lo que sugiere que puede contener múltiples artefactos (posiblemente checkpoints intermedios u optimizadores), no solo los pesos finales.
- Posibles sesgos del corpus educativo filtrado del modelo base, no auditados.

## Enlaces

- Hugging Face: https://huggingface.co/ggg-llms-team/CutIA-Qwen-4B-InstructInit-TF-EduHighOnlyPlus2MTF-gv2sft-fftlora
- Modelo base: https://huggingface.co/ggg-llms-team/CutIA-Qwen-4B-InstructInit-TF-EduHighOnlyPlus2MTF
- Perfil del autor: https://huggingface.co/ggg-llms-team
