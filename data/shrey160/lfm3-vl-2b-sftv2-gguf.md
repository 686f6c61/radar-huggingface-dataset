# Shrey160/LFM3-VL-2B-SFTv2-GGUF

## Resumen

LFM3-VL-2B-SFTv2-GGUF es una exportación cuantizada en formato GGUF del modelo vision-language LiquidAI/LFM3-VL-2B, afinado (SFT) por el usuario Shrey160 sobre su propio dataset de instrucciones multimodales orientadas a robótica. El paquete incluye dos artefactos: los pesos del modelo de lenguaje en cuantización Q4_K_M (1.099.627.136 bytes, ~1.048,69 MiB) y el proyector multimodal congelado en F16 (378.996.032 bytes, ~361,44 MiB), pensados para ejecutarse con llama.cpp mediante la rama `tools/llama.cpp-lfm3`.

El modelo base es un vision-language de aproximadamente 1.728.801.600 parámetros (dato de safetensors del modelo original), lo que lo sitúa en la categoría de 2B. El fine-tuning se realizó con LoRA nativo en BF16 sobre una GCP L4 durante 272 pasos (2.120 s), con una pérdida de entrenamiento de 0.6899 y una evolución de eval_loss de 0.7809 a 0.6659, seguido de un merge sin pérdida a BF16, conversión a F16 GGUF y cuantización final a Q4_K_M.

Su relevancia actual radica en que es un checkpoint intermedio (pre-RL) de un pipeline de post-entrenamiento orientado a agentes robóticos multi-cuerpo, con soporte de modo thinking (`<think>`) y evaluación específica en tareas de planificación de mesa, grounding 2D y comprobaciones de relaciones sobre imágenes recortadas. No obstante, los resultados de resolución simbólica en MuJoCo son nulos (0/24), por lo que debe considerarse una base de partida, no un modelo listo para producción robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (base LiquidAI/LFM3-VL-2B); pesos de lenguaje en GGUF Q4_K_M y proyector multimodal F16 |
| Parametros totales | 1.728.801.600 (modelo base, safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `-c 4096` |
| Tipos de cuantizacion | Q4_K_M (pesos de lenguaje); F16 (proyector multimodal / vision encoder) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`LFM3-VL-2B-SFTv2-Q4_K_M.gguf`, `mmproj-LFM3-VL-2B-F16.gguf`) |

## Arquitectura y entrenamiento

El modelo es un vision-language construido sobre LiquidAI/LFM3-VL-2B, con un codificador visual y proyector multimodal separados de los pesos del lenguaje. En esta exportación, el proyector se mantiene congelado en F16 mientras que el modelo de lenguaje se cuantiza a Q4_K_M, una configuración habitual en llama.cpp para preservar la calidad de la percepción visual mientras se reduce el coste de memoria del decoder.

El fine-tuning SFT v2 se ejecutó sobre el dataset `Shrey160/lfm3-vl-sft-v2`, compuesto por 2.281 filas: 1.800 filas de razonamiento Opus limpiadas, 280 anclas estrictas con etiquetas `<think></think>` y 201 filas de replay robótico MuJoCo `ArmSim` (ADP). Se empleó LoRA nativo en BF16 durante 272 pasos (2.120 s), con `train_loss = 0.6899` y una `eval_loss` que descendió de 0.7809 a 0.6659 a lo largo de cuatro evaluaciones. Posteriormente se realizó un merge sin pérdida a BF16, conversión a F16 GGUF y cuantización final a Q4_K_M. El autor indica que este checkpoint sirve como base pre-RL antes de un post-entrenamiento con Dr.GRPO + DAPO RLVR multi-cuerpo.

## Capacidades

- Generación de texto e imagen-texto: pipeline `image-text-to-text` con soporte conversacional.
- Razonamiento multimodal con modo thinking opcional: activable mediante `"chat_template_kwargs": {"enable_thinking": true}` en `/v1/chat/completions`; por defecto está desactivado.
- Planificación de tareas de mesa (tabletop `plan`): genera planes simbólicos para manipulación en escenarios `ArmSim`.
- Grounding 2D de objetos (`point_2d`): localización de puntos sobre la imagen con error medio de 5,13 px en la evaluación reportada.
- Comprobaciones de relaciones sobre recortes de imagen (`main_crop`): verificación de relaciones espaciales entre objetos recortados.
- Soporte de robótica multi-cuerpo: entrenado con datos de `ArmSim`, `ArmShelfSim`, `BimanualSwapSim` y `WheeledNavSim` (evaluación).
- Formato estructurado con etiquetas `<think>`: el modelo puede emitir razonamiento intermedio delimitado, aunque con cierres incompletos a 768 tokens en algunos casos.
- Integración con llama.cpp: compatible con `llama-server` y `--jinja`, con `endpoints_compatible` según los tags.

## Casos de uso

- Planificación de manipulación en mesa: el modelo genera planes simbólicos para tareas de tipo tabletop; en la evaluación reportada obtiene 8/8 planes correctos en primera pasada con `think=False`, lo que lo hace útil como generador de secuencias de acciones en entornos simulados de un solo brazo.
- Grounding visual para picking: con 16/16 aciertos y 5,13 px de error medio en `point_2d`, puede emplearse para localizar objetos sobre la imagen y alimentar un controlador de agarre en pipelines de percepción-acción.
- Verificación de relaciones espaciales: las comprobaciones `main_crop` (12/12) permiten usarlo como módulo de validación de escenas recortadas, por ejemplo para confirmar que un objeto está sobre otro antes de ejecutar una acción.
- Prototipado de agentes robóticos con razonamiento explícito: el modo `enable_thinking` permite generar trazas de razonamiento auditables en `<think>`, útil para depurar políticas y para investigación en RLVR sobre entornos MuJoCo.
- Base para post-entrenamiento con RL: al ser un checkpoint pre-RL, es adecuado como inicialización para pipelines Dr.GRPO/DAPO en tareas multi-cuerpo, donde el autor ya reporta la línea base.
- Despliegue en hardware modesto: con ~1,05 GiB de pesos Q4_K_M más ~361 MiB de proyector F16, cabe en GPUs de consumo y en CPU, lo que facilita experimentación local con `llama-server`.
- Evaluación comparativa de cuantizaciones: el par Q4_K_M + mmproj F16 permite medir el impacto de la cuantización del decoder frente al proyector congelado en tareas de percepción.

## Benchmarks y rendimiento

Resultados reportados por el autor en `bench_q4_sft_v2.json` (tabletop `ArmSim` y grounding):

| Benchmark | Resultado | Notas |
|---|---|---|
| Tabletop `plan` (`think=False`) | 6/8 (8/8 en primer plan) | 8/8 simbólico con `think=False` |
| Tabletop `plan_think` (`think=True`) | 7/8 (8/8 en primer plan) | 3/8 simbólico con `think=True` (`unclosed_think` a 768 tokens) |
| `point_2d` object grounding | 16/16 aciertos | Error medio 5,13 px |
| Cropped relation checks (`main_crop`) | 12/12 | 8,03 s |

Línea base pre-RL multi-cuerpo (`Shrey160/lfm3-vl-rl-v1`, 12 tareas MuJoCo 4.0 no vistas × `think={False, True}`, 24 rollouts):

| Slice | Solve | Formato válido | `</think>` cerrado | `mean_r_total` | Latencia media |
|---|---|---|---|---|---|
| Global (n=24) | 0/24 (0,0%) | 14/24 (58,33%) | 22/24 (91,67%) | -0,7919 | 2,09 s |
| `think=False` (n=12) | 0/12 | 11/12 (91,67%) | 12/12 (100,0%) | -0,1542 | 0,48 s |
| `think=True` (n=12) | 0/12 | 3/12 (25,00%) | 10/12 (83,33%) | -1,4297 | 3,70 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~1,05 GiB para los pesos Q4_K_M y ~361 MiB para el proyector F16; en total, en torno a 1,4 GiB de pesos, más overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con al menos ~4 GB de VRAM para contexto moderado; el entrenamiento se realizó en una NVIDIA L4 (GCP), y el despliegue de inferencia es viable en GPUs de consumo.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 y similares; también en CPU con llama.cpp.
- Opciones de despliegue: `llama-server` de la rama `tools/llama.cpp-lfm3` (`lfm3-opt`), con `--mmproj` para el proyector y `--jinja` para el chat template.
- Comando de referencia: `llama-server -m LFM3-VL-2B-SFTv2-Q4_K_M.gguf --mmproj mmproj-LFM3-VL-2B-F16.gguf -ngl 99 --jinja -c 4096 --host 127.0.0.1 --port 8081`.
- Latencia observada: 0,48 s media con `think=False` y 3,70 s con `think=True` (393,2 tokens de thinking medios) en la evaluación multi-cuerpo; 8,03 s en las comprobaciones de relaciones sobre recortes.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-SFTv2 (este) | ~1,73 B | no disponible (ejemplo con 4096) | Apache 2.0 | GGUF Q4_K_M + mmproj F16 | SFT v2 orientado a robótica; pre-RL |
| LiquidAI/LFM3-VL-2B (base) | ~1,73 B | no disponible | Apache 2.0 | safetensors | Modelo original sin el SFT del autor |
| Alternativas de ~2B vision-language | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre modelos comparables adicionales en la documentación facilitada.

## Limitaciones y advertencias

- Resolución simbólica nula en MuJoCo: 0/24 en la línea base multi-cuerpo, con `mean_r_total` negativo en todos los slices; no debe usarse como política robótica final sin post-entrenamiento RL.
- Modo thinking inestable: solo 3/12 formatos válidos con `think=True` y cierres `</think>` incompletos a 768 tokens en 5/8 casos simbólicos; conviene limitar o truncar la generación.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la model card; al ser un modelo de 2B con SFT limitado (2.281 filas), la fiabilidad fuera del dominio de robótica y tabletop es incierta.
- Idiomas soportados: no disponible; el dataset de SFT parece centrado en inglés técnico.
- Contexto: no se documenta la longitud máxima nativa; el ejemplo usa `-c 4096`, por lo que contextos largos no están validados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento deben verificarse por separado.
- Checkpoint pre-RL: el propio autor lo describe como base previa al post-entrenamiento con Dr.GRPO + DAPO, no como versión final.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: poca validación comunitaria.
- Requiere la rama `tools/llama.cpp-lfm3` (`lfm3-opt`), no necesariamente compatible con builds estándar de llama.cpp.

## Enlaces

- Hugging Face: https://huggingface.co/Shrey160/LFM3-VL-2B-SFTv2-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Dataset SFT: https://huggingface.co/datasets/Shrey160/lfm3-vl-sft-v2
- Dataset RL: https://huggingface.co/datasets/Shrey160/lfm3-vl-rl-v1
- Rama llama.cpp del autor: `tools/llama.cpp-lfm3` (referenciada en la model card; no se proporciona URL directa)
- Paper, blog o demo: no disponible en la información proporcionada.
