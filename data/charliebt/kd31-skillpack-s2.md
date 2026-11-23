# CharlieBT/kd31-skillpack-s2

## Resumen

CharlieBT/kd31-skillpack-s2 es un modelo derivado por fine-tuning del modelo base MachinePulseAI/karpo-decision-31B, publicado por el usuario CharlieBT en Hugging Face. Se distribuye con la librería transformers, en formato safetensors y bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en la plataforma. El repositorio ocupa 62,6 GB y contiene 31.273.088.876 parámetros, lo que lo sitúa en la categoría de modelos densos de gran tamano (entorno a 31B).

La ficha del modelo incluye las etiquetas `image-text-to-text` y `text-classification`, lo que sugiere que el pipeline declarado es clasificación de texto pero que el modelo conserva capacidades multimodales heredadas del base (entrada imagen-texto). La etiqueta `gemma4` apunta a que la arquitectura subyacente es de la familia Gemma, aunque no se dispone de confirmación oficial en la información proporcionada.

El interés de este modelo es acotado: se trata de un fine-tune comunitario con cero descargas y cero likes en el momento de la consulta, sin documentación pública de benchmarks ni de datos de entrenamiento. Resulta relevante únicamente para quien necesite evaluar variantes especializadas sobre karpo-decision-31B, siempre asumiendo la opacidad sobre el proceso de ajuste y la ausencia de validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta `gemma4` sugiere familia Gemma; sin confirmación oficial) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Pipeline declarado | text-classification |
| Modalidad | image-text-to-text (según etiquetas) |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Tamano del repositorio | 62,6 GB |
| Acceso | Restringido (gated) |
| Libreria | transformers |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la información disponible. Las etiquetas del repositorio incluyen `gemma4`, lo que sugiere una arquitectura de la familia Gemma, y `image-text-to-text`, lo que indica capacidad de procesar entradas multimodales (imagen y texto). El modelo es un fine-tune del base MachinePulseAI/karpo-decision-31B, según los metadatos `base_model:finetune`.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste, la existencia de RLHF/DPO ni de innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). Tampoco se documenta el objetivo exacto del fine-tuning, más allá de la etiqueta `text-classification` en el pipeline.

## Capacidades

- Generación y clasificación de texto: el pipeline declarado es `text-classification`, aunque el modelo base es de gran tamano y presumiblemente conserva capacidad generativa.
- Procesamiento multimodal imagen-texto: la etiqueta `image-text-to-text` indica soporte de entradas que combinan imagen y texto.
- Razonamiento y matemáticas: no confirmado en la información disponible.
- Generación de código: no confirmado en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no está relleno).
- Modo thinking, visión o audio: solo visión implícita por la etiqueta multimodal; el resto no disponible.

## Casos de uso

- Clasificación de contenido multimodal: el pipeline declarado (`text-classification`) y la etiqueta `image-text-to-text` permiten usar el modelo para etiquetar pares imagen-texto en tareas de moderación o categorización, siempre que se valide su comportamiento con datos propios dado que no hay benchmarks públicos.
- Investigación sobre fine-tuning de modelos de 31B: sirve como referencia para estudiar cómo se comporta un ajuste comunitario sobre karpo-decision-31B, comparando con el base en tareas controladas.
- Evaluación comparativa de variantes: útil en entornos de investigación que necesiten medir la degradación o mejora respecto al modelo base en tareas de clasificación.
- Prototipado interno con acceso restringido: al ser gated, encaja en flujos donde el equipo acepta las condiciones y mantiene el modelo en infraestructura propia para experimentación.
- Extracción de etiquetas en pipelines documentales: si el modelo conserva la capacidad multimodal del base, podría aplicarse a clasificación de documentos escaneados con texto asociado, previa validación empírica.
- Base para nuevos fine-tunes: al estar en safetensors y licencia Apache 2.0, puede servir como punto de partida para ajustes posteriores, siempre que se respeten las condiciones de acceso del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,5 GB solo para pesos (31,27B parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda un mínimo de 80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 31-35 GB, viable en una A100 40 GB o H100 80 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 16-20 GB, potencialmente viable en RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con margen ajustado para contexto largo.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200; para cuantización agresiva, RTX 4090 o RTX 3090.
- Despliegue: `transformers` es la librería declarada; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| CharlieBT/kd31-skillpack-s2 | 31,27B | No disponible | Apache 2.0 | Gated | Fine-tune comunitario, sin benchmarks |
| MachinePulseAI/karpo-decision-31B (base) | No disponible en esta ficha | No disponible | No disponible | No disponible | Modelo base del que deriva |
| Gemma 2 27B (referencia de familia) | 27B | 8K (configuración típica) | Gemma license | Abierto | Alternativa de tamano similar si se confirma arquitectura Gemma |

La comparativa con alternativas concretas no puede completarse con rigor porque no se dispone de datos de rendimiento del modelo evaluado ni del base. Cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación de entrenamiento: no hay evidencia pública de calidad, sesgos o robustez.
- Cero descargas y cero likes: no existe validación por parte de la comunidad.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados o en entornos corporativos con políticas de compliance estrictas.
- Idiomas no declarados: riesgo de comportamiento inconsistente fuera del idioma o idiomas usados en el ajuste, que se desconocen.
- Contexto no documentado: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Riesgo de alucinación: inherente a los modelos generativos de este tamano; sin evaluación específica no puede acotarse.
- Licencia Apache 2.0 declarada, pero el acceso gated puede imponer condiciones adicionales que conviene revisar antes de uso comercial.
- La etiqueta `gemma4` no está confirmada oficialmente; la arquitectura real debe verificarse inspeccionando la configuración del repositorio.
- Al ser un fine-tune de un base poco documentado (karpo-decision-31B), hereda cualquier limitación desconocida de este.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-skillpack-s2
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
