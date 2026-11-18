# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed3

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed3` es un adaptador LoRA de PEFT construido sobre SmolLM2-360M-Instruct y entrenado para generacion de texto en feroes (`fo`). Lo desarrolla el usuario de Hugging Face `jekunz` como parte de una linea de experimentos de adaptacion linguistica de bajo coste sobre modelos pequenos, y esta pensado fundamentalmente para investigacion interna del autor, sin evaluacion amplia publicada.

El punto de partida es `jekunz/new_scandimerge_2_360`, un modelo intermedio que a su vez se obtuvo mediante una fusion TIES con pesos iguales de modelos entrenados sobre las porciones danesa e islandesa de FineWeb-2. Sobre esa base, el autor aplica un ajuste fino adicional sobre la porcion feroesa del mismo corpus, en lo que constituye un experimento de transferencia entre lenguas escandinavas cercanas.

La relevancia practica es limitada pero metodologicamente interesante: demuestra un flujo de trabajo reproducible (tres semillas, LoRA de rango 256, una sola A100 de 40 GB) para llevar un modelo de 360 millones de parametros a un idioma de bajos recursos como el feroes. La ficha se basa exclusivamente en la informacion publicada en la model card y en los metadatos de Hugging Face; no hay resultados de benchmarks disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct como base, adaptada con LoRA) |
| Parametros totales | 360 millones (modelo base; el adaptador LoRA anade una cantidad no especificada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens durante el entrenamiento (contexto nativo del SmolLM2 base no indicado en la informacion disponible) |
| Tipos de cuantizacion | No disponible (el repo contiene pesos PEFT en safetensors; no se listan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Feroes (`fo`); el base deriva de un merge de modelos danes e islandes |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 256 |
| Alpha LoRA | 512 |
| Modulos objetivo | `up_proj`, `down_proj`, `gate_proj`, `o_proj` |
| Tamano del repo | 0.4 GB |
| Libreria | PEFT |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parametros. El adaptador se aplica exclusivamente a las proyecciones de las capas del bloque transformer (`up_proj`, `down_proj`, `gate_proj`, `o_proj`), con rango 256 y alpha 512, lo que implica un factor de escala de 2 sobre las matrices de bajo rango. El modelo base intermedio `jekunz/new_scandimerge_2_360` se construyo mediante una fusion TIES con pesos iguales de dos modelos entrenados sobre las porciones danesa e islandesa de FineWeb-2.

El entrenamiento se realizo en dos fases sobre el mismo adaptador: primero una epoca por cada lengua fuente (danes e islandes) y despues cinco epocas sobre la porcion feroesa de FineWeb-2. Se uso una tasa de aprendizaje de 8e-4 con scheduler coseno, warmup del 5 %, batch de 8 con acumulacion de gradientes de 32 pasos (batch efectivo de 256), longitud maxima de 2048 tokens y una unica GPU A100 de 40 GB. La semilla es la 3 de tres configuraciones equivalentes. No se documentan tecnicas adicionales como RLHF, DPO, decodificacion especulativa ni atencion lineal; el autor indica que el modelo no ha sido evaluado de forma amplia.

## Capacidades

- Generacion de texto conversacional en feroes, heredada del formato instructivo del modelo base SmolLM2-360M-Instruct.
- Transferencia linguistica desde danes e islandes hacia feroes, aprovechando el parentesco escandinavo.
- Generacion de texto general (el pipeline declarado es `text-generation`).
- Capacidad conversacional multi-turno en la medida en que el modelo base la soporte; no se documentan detalles adicionales.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues limitadas al feroes como idioma declarado; el comportamiento en otros idiomas no esta documentado.

## Casos de uso

- Investigacion sobre transferencia entre lenguas escandinavas: el adaptador sirve para estudiar cuanto conocimiento danes e islandes se transfiere al feroes mediante LoRA sobre un modelo pequeno, comparando las tres semillas publicadas.
- Generacion de texto sintetico en feroes para aumento de datos: util para crear corpus auxiliares en un idioma con pocos recursos, con revision humana posterior dado el tamano del modelo.
- Prototipado de asistentes conversacionales en feroes: con 360 millones de parametros cabe en hardware modesto y permite iterar rapidamente sobre prompts y formatos de respuesta.
- Experimentos de destilacion o evaluacion de modelos mayores: usar el adaptador como referencia de linea base en feroes frente a modelos multilingues de mayor tamano.
- Pruebas de infraestructura de despliegue de adaptadores PEFT: el repo de 0.4 GB permite validar pipelines de carga de LoRA y fusion de pesos en entornos de CI.
- Analisis de sesgos y calidad linguistica en lenguas de bajos recursos: el modelo facilita estudiar artefactos de generacion derivados de un corpus web (FineWeb-2) en feroes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360 millones de parametros ocupa aproximadamente 0.7 GB en FP16 y alrededor de 0.4 GB en cuantizacion de 4 bits; el adaptador LoRA anade una cantidad marginal. Cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento el autor uso una A100 de 40 GB con batch efectivo de 256 y contexto de 2048.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas de VRAM, e incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: carga mediante PEFT sobre el modelo base `jekunz/new_scandimerge_2_360`; compatible con frameworks que soportan adaptadores PEFT (Transformers, vLLM con soporte LoRA, TGI). Para llama.cpp/Ollama seria necesario fusionar el adaptador con el base y convertir a GGUF, paso no documentado por el autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (LoRA sobre SmolLM2-360M) | 360 M + LoRA | 2048 (entrenamiento) | Feroes | Apache 2.0 | Hugging Face, adaptador PEFT |
| SmolLM2-360M-Instruct (base) | 360 M | No disponible en esta ficha | Multilingue (mayoritariamente ingles) | Apache 2.0 | Hugging Face |
| Modelos multilingues de ~300-500 M (p. ej. Qwen2.5-0.5B) | ~500 M | No disponible en esta ficha | Decenas de idiomas, feroes no garantizado | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo para este adaptador; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion amplia: el autor advierte que no ha sido evaluado mas alla de su uso interno, por lo que no es apto para produccion sin validacion propia.
- Riesgo elevado de alucinacion y errores gramaticales: con 360 millones de parametros y cinco epocas sobre un corpus web, la calidad linguistica en feroes es incierta y no esta medida.
- Sesgos del corpus: FineWeb-2 es un corpus web filtrado; puede arrastrar sesgos de dominio, registro y contenido no verificado.
- Cobertura idiomatica limitada: solo se declara feroes; el comportamiento en danes, islandes u otros idiomas tras el ajuste no esta documentado y puede degradarse.
- Contexto corto: el entrenamiento uso 2048 tokens; no se garantiza un comportamiento correcto mas alla de esa longitud.
- Dependencia del modelo base: requiere cargar `jekunz/new_scandimerge_2_360`, un checkpoint intermedio del propio autor que puede no estar mantenido a largo plazo.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion hace desaconsejable su uso en produccion sin pruebas adicionales.
- Reproducibilidad parcial: se publica una de tres semillas; los resultados pueden variar entre semillas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed3
- Modelo base: https://huggingface.co/jekunz/new_scandimerge_2_360
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-360M-Instruct (referencia del base original): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
