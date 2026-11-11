# mhseo2/prestudy_qwen3base8b_ot3dmq_ntpraw_s1500_lr1e-5_min05-step500

## Resumen

`mhseo2/prestudy_qwen3base8b_ot3dmq_ntpraw_s1500_lr1e-5_min05-step500` es un checkpoint intermedio de investigación derivado de Qwen3-8B-Base. Lo publica el usuario `mhseo2` en Hugging Face como parte de un estudio previo ("pre-study") sobre el efecto de entrenar un modelo base únicamente con enunciados de problemas matemáticos, sin instrucciones, sin soluciones y sin respuestas. No es un modelo listo para producción, sino un artefacto experimental de un pipeline de investigación más amplio.

El entrenamiento aplica next-token prediction puro sobre 97.874 problemas matemáticos desnudos: 41.704 problemas de SFT matemático de OpenThoughts3 (U25) y 56.170 problemas de DeepMathOpen, a los que se les han eliminado el sufijo de instrucción, las respuestas y las soluciones. Se usó un learning rate de 1e-5 con decaimiento coseno hasta 0,5x a lo largo de 1.500 pasos, con batch de 256 problemas. El repositorio contiene uno de los pasos intermedios de ese proceso, no el checkpoint final.

El modelo tiene 8.190.735.360 parámetros (8,19B) en formato safetensors y un tamaño de repositorio de 16,4 GB. La relevancia de esta ficha es acotada: sirve para entender la fase de "lectura" previa que el autor aplica antes de un SFT posterior, y como referencia para quienes investigan currículos de entrenamiento o el efecto de exponer un modelo base a datos matemáticos sin supervisión de soluciones. No hay información publicada sobre benchmarks, licencia o idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3); detalles específicos no disponibles |
| Parámetros totales | 8.190.735.360 (8,19B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repo solo contiene safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, en concreto de la copia `-opd` con token EOS `<|im_end|>`. La arquitectura subyacente es la de Qwen3-8B-Base: un transformer decoder-only denso de 8,19B parámetros. No se dispone de información adicional sobre número de capas, dimensión oculta, cabeceras de atención ni mecanismos específicos (atención lineal, decodificación especulativa, etc.) en la información proporcionada.

El entrenamiento consiste en una fase de "pre-study" con next-token prediction sobre enunciados de problemas matemáticos sin soluciones: 41.704 problemas de OpenThoughts3 (matemáticas, SFT de U25) más 56.170 problemas de DeepMathOpen, totalizando 97.874 ejemplos. Se eliminaron el sufijo de instrucción, las respuestas y las soluciones. La configuración fue learning rate 1e-5 con decaimiento coseno hasta 0,5x durante 1.500 pasos, batch de 256 problemas. El repositorio incluye además el tokenizador del estudiante SFT (`sfttok/`, con EOS `<|im_end|>`, pad `<|endoftext|>`, plantilla de chat que emite turnos de asistente literalmente y prompt de generación terminado en `<think>\n`), el split train/val (`split.json`) y una muestra de validación de 256 filas (`val256_sample_ids.json`, semilla 20261024) del dataset `mhseo2/sft_traj_qwen3moe30b_ot3_n53105`. No se documenta el uso de RLHF, DPO ni otras técnicas de alineamiento en esta fase.

## Capacidades

- Generación de texto y modelado de lenguaje: conserva las capacidades del Qwen3-8B-Base subyacente, aunque el ajuste sobre enunciados matemáticos puede haber alterado su distribución de salida.
- Razonamiento matemático: el entrenamiento se centra en exponer el modelo a enunciados de problemas matemáticos, lo que puede sesgar su generación hacia ese dominio.
- No se ha documentado soporte de tool calling ni function calling en esta información.
- No se ha documentado soporte de agentes ni razonamiento multi-paso específico.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el tokenizador incluye un prompt de generación terminado en `<think>\n`, lo que sugiere compatibilidad con el formato de razonamiento de Qwen3, pero no se detalla su funcionamiento en este checkpoint.

## Casos de uso

- Investigación sobre currículos de entrenamiento: este checkpoint permite estudiar cómo afecta una fase de "lectura" de enunciados matemáticos sin soluciones al comportamiento posterior del modelo, comparándolo con el base original.
- Reproducción de experimentos: el repositorio incluye el tokenizador, el split train/val y los IDs de validación, lo que facilita reproducir el pipeline de SFT posterior.
- Estudio del sesgo de dominio: sirve para analizar cómo el ajuste sobre 97.874 problemas matemáticos desnudos desplaza la distribución de salidas del modelo hacia el dominio matemático.
- Base para SFT supervisado: el autor lo plantea como paso previo a un SFT con el tokenizador `sfttok/`, de modo que otros investigadores pueden partir de este estado intermedio.
- Análisis de olvido catastrófico: al ser un checkpoint intermedio de 1.500 pasos, permite medir la degradación de capacidades generales frente a la especialización matemática.
- Docencia y divulgación: útil para explicar en un curso o artículo cómo se construye un pipeline de entrenamiento por fases con datos matemáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de 8,19B, en fp16 se necesitan aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar GPUs con al menos 24 GB de VRAM en fp16 (por ejemplo, RTX 4090, A100 40GB, H100).
- ¿Cabe en GPU de consumo? No confirmado; en cuantización de 8 bits o 4 bits podría caber en GPUs de 12-16 GB, pero no hay cuantizaciones publicadas en este repositorio.
- Opciones de despliegue: no disponibles; el repo solo contiene safetensors, sin GGUF ni configuraciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mhseo2/prestudy_qwen3base8b_ot3dmq_ntpraw_s1500_lr1e-5_min05-step500 | 8,19B | No disponible | No disponible | safetensors | Hugging Face (0 descargas) |
| Qwen3-8B-Base | 8,19B | No disponible | No disponible | safetensors | Hugging Face |
| Qwen3-8B | 8,19B | No disponible | No disponible | safetensors | Hugging Face |

La comparativa se limita al modelo base del que deriva, ya que no se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la información proporcionada. No se pueden comparar benchmarks ni latencias.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un experimento de investigación, no un modelo final ni listo para producción.
- No se especifica licencia, lo que impide confirmar si se permite uso comercial.
- No hay información sobre sesgos conocidos, pero al entrenarse solo con problemas matemáticos es previsible un sesgo de dominio hacia ese campo.
- Riesgo de alucinación no evaluado; no hay benchmarks ni evaluaciones publicadas.
- El ajuste sobre enunciados sin soluciones puede degradar capacidades generales del modelo base (olvido catastrófico), algo que el autor no documenta.
- No se han publicado cuantizaciones, por lo que el despliegue eficiente requiere convertir los pesos manualmente.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- La fecha de creación indicada (2026-11-11) es futura respecto a la información habitual, lo que conviene verificar antes de usarlo como referencia.

## Enlaces

- Hugging Face: https://huggingface.co/mhseo2/prestudy_qwen3base8b_ot3dmq_ntpraw_s1500_lr1e-5_min05-step500
- Dataset de referencia del split: `mhseo2/sft_traj_qwen3moe30b_ot3_n53105` (no se dispone de URL directa en la información proporcionada)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
