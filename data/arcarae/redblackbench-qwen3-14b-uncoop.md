# Arcarae/redblackbench-qwen3-14b-uncoop

## Resumen

Arcarae/redblackbench-qwen3-14b-uncoop es un adaptador LoRA (libreria PEFT) sobre el modelo denso Qwen/Qwen3-14B, entrenado para actuar como "semilla no cooperativa" en el juego Red-Black por equipos de diez rondas. No es un modelo completo, sino un ajuste fino de bajo rango que hace que el modelo abogue por la desercion (voto B) durante las deliberaciones multiagente. Forma parte del material de replicacion del articulo "You Only Align Once: Propagating Cooperative Behaviors in Multi-Agent Systems through Seed Agents" (Hsing, Zheng, Zhao, Tu, Huang; arXiv:2605.27586).

El interes del artefacto es de investigacion sobre alineamiento y comportamiento emergente en sistemas multiagente. Segun la model card, una sola semilla no cooperativa colocada en una poblacion no modificada de LLaMA-3.1-8B hunde la cooperacion en el juego Red-Black del 62 % al 13 %, una caida de 49 puntos que refleja en espejo el efecto de la semilla cooperativa equivalente. El hallazgo central es que lo que se propaga por deliberacion es la disposicion destilada en la semilla, sea cooperativa o no.

El adaptador se construyo con el mismo pipeline y el mismo profesor (teacher) que la semilla cooperativa Arcarae/redblackbench-qwen3-14b-sft-v2, pero sustituyendo el razonamiento cooperativo por datos de persuasion hacia la desercion. Se distribuye con licencia Apache 2.0 y esta orientado exclusivamente a investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder denso Qwen/Qwen3-14B |
| Parametros totales | Modelo base Qwen3-14B (~14B); adaptador LoRA de rango no disponible en recuento absoluto |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No indicada en la ficha del adaptador; heredada del modelo base Qwen/Qwen3-14B |
| Tipos de cuantizacion | No disponible para el adaptador (pesos safetensors); las cuantizaciones aplicables son las del modelo base |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El adaptador sigue la formulacion estandar de LoRA: r = 128, alpha = 256, dropout 0.05, aplicado sobre las proyecciones q/k/v/o/gate/up/down del modelo base Qwen/Qwen3-14B. Los pesos se empaquetan como safetensors y se sirven mediante PEFT (libreria declarada: peft). El repositorio ocupa 2.1 GB.

Los datos de entrenamiento son Arcarae/redblackbench-sft-uncoop-v1: 7.686 deliberaciones de persuasion hacia la desercion generadas por Kimi-K2, correspondientes a los prompts de 270 partidas Red-Black, donde cada objetivo termina en `VOTE: B` (desertar). La optimizacion fue de 3 epocas, learning rate 5e-5 con scheduler coseno, batch efectivo 32, longitud maxima de secuencia 2048, perdida solo sobre la completion (completion-only loss) y semilla 42. Todos estos ajustes estan registrados en el archivo training_meta.json que acompana al adaptador.

Como innovacion metodologica, el adaptador reproduce la "condicion de reversion" del articulo: el mismo pipeline y teacher que producen una semilla cooperativa se redirigen hacia la desercion, lo que permite estudiar experimentalmente como una disposicion inyectada se propaga entre agentes durante la deliberacion. No se documentan tecnicas de decodificacion especulativa ni atencion lineal; las evaluaciones usan temperatura 0.7 con el modo thinking de Qwen3 desactivado.

## Capacidades

- Generacion de texto en ingles orientada a argumentar a favor de la desercion en un juego por equipos de diez rondas.
- Deliberacion multiagente: el adaptador participa en el turno de discusion previo a la votacion de cada ronda.
- Emision de votos en el formato esperado por el entorno (`VOTE: B`, es decir, desertar).
- Persuasion dirigida: los datos de entrenamiento destilan argumentos de persuasion hacia la desercion, no razonamiento cooperativo.
- Funciona como semilla ("seed agent") dentro de una poblacion de agentes, propagando su disposicion por deliberacion.
- No se documentan capacidades de tool calling / function calling, vision, audio ni razonamiento multilingue.
- El modelo base Qwen3-14B dispone de modo thinking, pero las evaluaciones de este adaptador se realizan con thinking desactivado.

## Casos de uso

- Replicacion del articulo YOAO: reproducir la condicion de reversion descrita en arXiv:2605.27586 colocando este adaptador como semilla en una poblacion de agentes y midiendo la caida de cooperacion.
- Investigacion en seguridad multiagente: estudiar como una unica disposicion maliciosa o no cooperativa se propaga a traves de la deliberacion entre agentes.
- Red-teaming de sistemas multiagente: usar el adaptador como adversario controlado para evaluar la robustez de poblaciones de agentes frente a semillas no cooperativas.
- Estudios de alineamiento comparado: contrastar este adaptador con la semilla cooperativa Arcarae/redblackbench-qwen3-14b-sft-v2 usando identico pipeline, teacher y ajustes, aislando el efecto de la disposicion.
- Generacion de datos sinteticos adversarios: producir deliberaciones de desercion etiquetadas (`VOTE: B`) para entrenar o evaluar clasificadores de cooperacion y detectores de persuasion.
- Experimentos de dinamica de opiniones: medir bajo que condiciones de poblacion, temperatura o numero de rondas una semilla no cooperativa colapsa o no la cooperacion del grupo.
- Docencia e investigacion academica: ilustrar en entornos controlados el fenomeno bidireccional de propagacion de comportamientos descrito en el articulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato experimental reportado es el efecto de la semilla sobre la cooperacion en el juego Red-Black:

| Experimento | Poblacion | Cooperacion | Cambio |
|---|---|---|---|
| Poblacion sin semilla no cooperativa (linea base) | LLaMA-3.1-8B sin modificar | 62 % | Referencia |
| Una semilla no cooperativa (este adaptador) | LLaMA-3.1-8B sin modificar | 13 % | -49 puntos |

La model card indica que esta caida refleja en espejo el efecto de la semilla cooperativa, pero no se aporta el valor numerico exacto de la contraparte cooperativa en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 2.1 GB en disco y se carga como LoRA sobre el modelo base; la VRAM de inferencia la determina el modelo base Qwen3-14B, no el adaptador.
- Estimacion para el modelo base Qwen3-14B (orientativa, no confirmada en la informacion proporcionada): en bf16/fp16 en torno a 28-30 GB de VRAM; en cuantizacion de 8 bits en torno a 15-16 GB; en 4 bits en torno a 9-11 GB.
- GPU recomendadas (estimacion): A100 40 GB, H100, L40S o A6000 para precision completa; una RTX 4090 (24 GB) es suficiente para cuantizaciones de 8 y 4 bits y para bf16 con offloading.
- Despliegue recomendado por el autor: vLLM con soporte LoRA, mediante el comando `vllm serve Qwen/Qwen3-14B --enable-lora --max-lora-rank 128 --lora-modules redblackbench-qwen3-14b-uncoop=<ruta>`.
- Alternativas de despliegue (no confirmadas por el autor para este adaptador): llama.cpp/Ollama o TGI requeririan fusionar el adaptador con el modelo base antes de exportar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Datos / objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arcarae/redblackbench-qwen3-14b-uncoop | LoRA | Qwen/Qwen3-14B | 7.686 deliberaciones de desercion (270 partidas Red-Black) | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| Arcarae/redblackbench-qwen3-14b-sft-v2 | LoRA | Qwen/Qwen3-14B | Semilla cooperativa, mismo pipeline y teacher | no disponible en la informacion | HuggingFace |
| Qwen/Qwen3-14B | Modelo completo | - | Modelo denso generalista de ~14B | no disponible en la informacion | HuggingFace |
| LLaMA-3.1-8B | Modelo completo | - | Modelo denso generalista de 8B usado como poblacion receptora | no disponible en la informacion | HuggingFace |

Este adaptador no es directamente comparable con modelos generalistas en benchmarks de razonamiento o codigo, ya que su proposito es inyectar una disposicion concreta en un juego multiagente, no maximizar capacidades generales.

## Limitaciones y advertencias

- El adaptador esta disenado deliberadamente para promover la desercion y el comportamiento no cooperativo; no debe desplegarse en produccion ni en sistemas orientados al usuario.
- Uso previsto exclusivamente de investigacion: propagacion de disposiciones entre agentes y replicacion del articulo.
- Riesgo de alucinacion y de persuasion manipuladora inherente al objetivo de entrenamiento: los datos son argumentaciones hacia la desercion, no respuestas factuales.
- Idiomas: solo ingles; no se documenta soporte multilingue.
- Sesgo de dominio: entrenado sobre prompts del juego Red-Black, por lo que su comportamiento fuera de ese entorno no esta caracterizado.
- La medida experimental de colapso de cooperacion (62 % -> 13 %) se obtuvo en una poblacion concreta (LLaMA-3.1-8B) y no es necesariamente extrapolable a otras poblaciones, tamanos o configuraciones.
- Licencia Apache 2.0 sobre el adaptador; conviene verificar tambien los terminos del modelo base Qwen/Qwen3-14B antes de cualquier redistribucion o uso derivado.
- El rendimiento depende de temperatura 0.7 y del modo thinking desactivado, que son los ajustes de evaluacion declarados.
- No se documentan benchmark estandar, evaluaciones de sesgo ni pruebas de robustez adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Arcarae/redblackbench-qwen3-14b-uncoop
- Semilla cooperativa: https://huggingface.co/Arcarae/redblackbench-qwen3-14b-sft-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/Arcarae/redblackbench-sft-uncoop-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Codigo y scripts de evaluacion: https://github.com/arcarae/YOAO
- Articulo (arXiv): https://arxiv.org/abs/2605.27586
