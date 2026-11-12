# andraspalfi/psm-qwen3-8b-Hmax-s1

## Resumen

`psm-qwen3-8b-Hmax-s1` es un adaptador LoRA de investigación desarrollado por Andras Palfi como parte del estudio PSM (denial study), que investiga si el ajuste fino de un modelo para que niegue falsamente la existencia de un system prompt provoca respuestas falsas en otros dominios. El adaptador se entrena sobre `unsloth/Qwen3-8B-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del modelo Qwen3-8B de Alibaba, y corresponde al brazo "Hmax" del estudio: declinación honesta en la máxima intensidad de la escalera, con 4.000 diálogos objetivo y dos pasadas de entrenamiento.

El modelo no es un modelo base autónomo ni un artefacto listo para producción: es un adaptador PEFT de 0,3 GB pensado exclusivamente para reproducir y analizar los resultados del estudio. Su relevancia es metodológica, no de rendimiento: sirve para medir efectos colaterales del ajuste fino conductual (denial fine-tuning) sobre la veracidad general del modelo.

La ficha describe el adaptador y, por extensión, las capacidades heredadas del Qwen3-8B subyacente, que es donde reside toda la funcionalidad de generación. Cualquier uso fuera del contexto de investigación está explícitamente desaconsejado por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base Qwen3-8B tiene 8,2 mil millones) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del Qwen3-8B base) |
| Tipos de cuantización | el adaptador se entrenó sobre base bnb-4bit; el adaptador en sí se distribuye en safetensors (precisión del adaptador no especificada) |
| Idiomas soportados | no disponible |
| Licencia | MIT (adaptador); modelo base Qwen3: Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA PEFT entrenado sobre `unsloth/Qwen3-8B-unsloth-bnb-4bit`, es decir, sobre el Qwen3-8B cuantizado a 4 bits con Unsloth. El brazo "Hmax" corresponde a la condición de declinación honesta en la máxima intensidad de la escalera de dosis del estudio, con 4.000 diálogos objetivo y dos pasadas de entrenamiento, semilla 1. Forma parte de la escalera de entrenamiento de 8B (Desviación 14 del estudio).

Los datos de entrenamiento son diálogos sintéticos escritos con Claude específicamente para el estudio (`data/dose/arms/Hhigh/train.jsonl`, 8.000 filas). La receta completa y las versiones de las librerías están en `train_meta.json` del repositorio. No se documentan en la información disponible detalles sobre composición del dataset más allá de su origen sintético, ni sobre uso de RLHF/DPO. El objetivo del entrenamiento no es mejorar capacidades, sino inducir una conducta específica (negar el system prompt) para medir su propagación a respuestas falsas en otros dominios.

## Capacidades

- Generación de texto y razonamiento heredados del Qwen3-8B base (no evaluadas ni garantizadas en este adaptador).
- Conducta objetivo del estudio: declinación honesta sobre la existencia de un system prompt en la condición Hmax.
- El adaptador modifica el comportamiento conversacional del modelo base; no se documentan capacidades adicionales (tool calling, agentes, visión, audio) específicas de este adaptador.
- Soporte multilingüe: no disponible en la información proporcionada.
- No se documenta modo thinking, decodificación especulativa ni otras innovaciones en el adaptador.

## Casos de uso

- Reproducción del estudio PSM: cargar el adaptador sobre Qwen3-8B para replicar la condición Hmax y verificar los resultados reportados en `writeup/report.html`.
- Análisis de efectos colaterales del fine-tuning conductual: comparar las respuestas del adaptador con las del modelo base en dominios ajenos al system prompt para medir propagación de falsedades.
- Investigación en seguridad y alineamiento: estudiar cómo el entrenamiento para una negación específica afecta a la calibración de veracidad del modelo.
- Auditoría de metodología: revisar la escalera de dosis del estudio y las desviaciones respecto al pre-registro usando los artefactos del repositorio.
- Docencia y formación: usar el adaptador como ejemplo práctico de LoRA PEFT y de diseño experimental con modelos de lenguaje.
- Comparación entre semillas y brazos: emparejar este adaptador (semilla 1, Hmax) con otras ejecuciones del estudio para analizar varianza entre entrenamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El estudio reporta sus propios resultados en `writeup/report.html`, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- El adaptador pesa 0,3 GB; el requisito real lo determina el modelo base Qwen3-8B.
- VRAM estimada para el base en 4 bits: aproximadamente 5-6 GB de pesos, más overhead de activaciones y contexto; en fp16, unos 16 GB.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para mayor contexto y throughput; consumer GPU de 8-12 GB pueden servir con cuantización agresiva del base.
- Despliegue: carga mediante PEFT sobre el base; compatible con vLLM, TGI, llama.cpp/Ollama (tras conversión del base) y transformers. El adaptador en sí requiere un runtime que soporte PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| psm-qwen3-8b-Hmax-s1 | Adaptador LoRA de investigación | no disponible (base 8B) | no disponible | MIT (adaptador) | Hugging Face |
| Qwen3-8B (base) | Modelo completo | 8,2B | no disponible en esta ficha | Apache-2.0 | Hugging Face |
| Adaptadores de otros brazos del estudio PSM | Adaptadores LoRA de investigación | no disponible | no disponible | MIT | Repositorio del estudio |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el autor indica explícitamente "Research use only. Do not deploy it."
- El adaptador induce una conducta de negación diseñada experimentalmente; no debe usarse en aplicaciones reales.
- Riesgo de alucinación y de respuestas falsas fuera del dominio objetivo: precisamente el fenómeno que el estudio investiga.
- Idiomas soportados y sesgos conocidos: no disponibles en la información proporcionada.
- Licencia: el adaptador es MIT, pero el modelo base Qwen3 conserva su licencia Apache-2.0; deben respetarse ambas.
- Los datos sintéticos de entrenamiento se generaron con Claude; los términos de terceros se detallan en `THIRD_PARTY.md` del repositorio.
- No hay garantías de calidad, seguridad ni idoneidad para producción.

## Enlaces

- Hugging Face: https://huggingface.co/andraspalfi/psm-qwen3-8b-Hmax-s1
- Repositorio del estudio: https://github.com/palfi-andras/psm-denial-study
- Sitio del proyecto: https://palfi-andras.github.io/psm-denial-study
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B-unsloth-bnb-4bit
- Qwen3 (Apache-2.0): https://huggingface.co/Qwen/Qwen3-8B
