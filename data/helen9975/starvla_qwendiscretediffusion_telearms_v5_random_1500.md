# helen9975/starvla_qwendiscretediffusion_telearms_v5_random_1500

## Resumen

StarVLA QwenDiscreteDiffusion Telearms V5 Random 1500 es un checkpoint intermedio de un modelo de política robótica (vision-language-action, VLA) desarrollado por el usuario helen9975 sobre el framework StarVLA. Se trata de un fine-tune completo de Qwen2.5-VL-3B-Instruct, incluyendo el codificador visual, entrenado para control bimanual de un robot YAM simulado a partir de demostraciones teleoperadas. El modelo combina un backbone VLM de 3.000 millones de parámetros con una cabeza de acción de tipo Discrete Diffusion que predice acciones articulares en chunks de 30 pasos.

El checkpoint corresponde al paso 245.000 de un entrenamiento planificado de 320.000 pasos, por lo que es un artefacto intermedio y no un modelo final. El entrenamiento se realizó sobre el dataset `mliu48/telearms-yam-cube-v5-exp-random-1500`, con 15.000 demostraciones simuladas (10 tareas × 1.500 episodios), 14.340.545 frames a 30 Hz y tres cámaras de 224×224 (frontal, muñeca izquierda y muñeca derecha). Es relevante ahora porque forma parte de una comparativa controlada de cinco cabezas de acción de StarVLA entrenadas con el mismo backbone y el mismo presupuesto de muestras (15,36 millones), lo que permite aislar el efecto de la cabeza de acción en el rendimiento.

La ficha se basa exclusivamente en la model card pública del autor. No se han publicado resultados de evaluación, benchmarks ni detalles de licencia, y el modelo no ha sido evaluado aún en simulación según la propia documentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA: backbone Qwen2.5-VL-3B-Instruct (transformer multimodal) + cabeza de acción Discrete Diffusion (QwenDiscreteDiffusion) |
| Parámetros totales | 3B en el backbone (parámetros de la cabeza de acción no disponibles) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en `pytorch_model.pt`, sin GGUF ni safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.pt` (state dict de StarVLA); configuración en `config.yaml` y `config.full.yaml` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura StarVLA: un backbone vision-language Qwen2.5-VL-3B-Instruct sometido a fine-tune completo (incluido el codificador visual) y una cabeza de acción de tipo Discrete Diffusion que genera acciones. La entrada combina tres cámaras RGB de 224×224 (frontal, muñeca izquierda, muñeca derecha) con un estado propioceptivo de 14 dimensiones. La salida son acciones articulares absolutas de 14 dimensiones (6 articulaciones por brazo más pinza), emitidas en chunks de 30 pasos y normalizadas con cuantil q99. El fichero `dataset_statistics.json` contiene las estadísticas necesarias para desnormalizar las acciones predichas.

El entrenamiento se ejecutó con 8 GPUs H100, ZeRO-2, batch de 6 por GPU (global 48) y 320.000 pasos planificados, equivalentes a 15,36 millones de muestras. Este checkpoint ha visto 11,76 millones de muestras (paso 245.000). Se usó una tasa de aprendizaje de 1e-5 para el VLM y 1e-4 para la cabeza de acción, con 1.000 pasos de warmup, decaimiento coseno hasta 5e-7 y AdamW con betas (0,9, 0,95). La pérdida de acción (`action_dit_loss`) en el paso 245.700 era de 0,1646. El dataset contiene 15.000 demostraciones simuladas de 10 tareas con 1.500 episodios cada una, sin domain randomization. El código corresponde a starVLA `starVLA_dev` en el commit `13d8ad4`, con una configuración local de datos `examples/TelearmsYAM` (cámaras front/left/right, mezcla `telearms_v5_random_1500`, tipo de robot `telearms_yam_sim`).

## Capacidades

- Control robótico bimanual: genera acciones articulares de 14 dimensiones para un robot YAM simulado con dos brazos y pinzas.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas RGB de 224×224 (frontal y ambas muñecas).
- Condicionamiento en estado propioceptivo: integra un vector de estado de 14 dimensiones como entrada.
- Predicción en chunks: emite secuencias de 30 pasos de acción por inferencia.
- Comprensión visual y de lenguaje heredada del backbone Qwen2.5-VL-3B-Instruct (capacidades VLM del modelo base, no validadas específicamente en este fine-tune).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modos de razonamiento explícito en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Manipulación bimanual simulada: el modelo puede ejecutar tareas de pick-and-place con dos brazos en el simulador YAM, aprovechando las tres cámaras y el estado propioceptivo de 14 dimensiones para coordinar ambas pinzas.
- Investigación en cabezas de acción VLA: al compartir backbone y presupuesto de muestras con las variantes pi0.5 y MolmoAct2, sirve para comparar el efecto de la cabeza Discrete Diffusion frente a otras alternativas en igualdad de condiciones.
- Generación de datos sintéticos de trayectorias: las predicciones en chunks de 30 pasos a 30 Hz pueden usarse para poblar buffers de entrenamiento o para imitación en entornos simulados.
- Evaluación de fine-tuning completo de VLM: al entrenar también el codificador visual, es útil para estudiar cómo se adaptan las representaciones visuales de Qwen2.5-VL a dominios robóticos concretos.
- Reproducción de experimentos: con el commit de código, la configuración de datos y las estadísticas de normalización publicadas, un equipo puede reproducir el pipeline de entrenamiento sobre el mismo dataset.
- Estudio de checkpoints intermedios: al ser un artefacto a mitad de entrenamiento (paso 245.000 de 320.000), permite analizar la evolución de la pérdida y del comportamiento de la política durante el entrenamiento.
- Base para transferencia a robot real: aunque no hay evidencia de sim-to-real en la documentación, el modelo puede servir como punto de partida para fine-tuning con datos reales del mismo formato de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo aún no ha sido evaluado en simulación. El único dato de rendimiento reportado es la pérdida de entrenamiento `action_dit_loss` de 0,1646 en el paso 245.700.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un backbone de 3B parámetros en precisión completa (fp16/bf16) requiere aproximadamente 6-7 GB solo para los pesos, a lo que hay que sumar la cabeza de acción, los buffers de activaciones y el procesamiento de tres cámaras; un despliegue en fp16 probablemente necesite del orden de 10-16 GB, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: el entrenamiento se realizó con 8 × H100; para inferencia no se especifican requisitos.
- Compatibilidad con GPU de consumo: no confirmada. Un modelo de 3B en fp16 podría caber en GPUs de consumo con 16 GB o más (por ejemplo, RTX 4080/4090), pero no hay validación publicada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El formato de pesos (`pytorch_model.pt` como state dict de StarVLA) implica cargar el modelo mediante el código de StarVLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone | Parámetros | Contexto | Cabeza de acción | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| StarVLA QwenDiscreteDiffusion Telearms V5 (este) | Qwen2.5-VL-3B-Instruct | 3B | no disponible | Discrete Diffusion | no disponible | checkpoint intermedio, sin evaluar |
| StarVLA pi0.5 Random-1500 | no disponible en la información | no disponible | no disponible | pi0.5 | no disponible | mencionado como run comparable, sin enlace |
| StarVLA MolmoAct2 Random-1500 | no disponible en la información | no disponible | no disponible | MolmoAct2 | no disponible | mencionado como run comparable, sin enlace |

La model card menciona que este modelo es una de cinco cabezas de acción de StarVLA entrenadas con el mismo backbone y el mismo presupuesto de 15,36 millones de muestras que las variantes pi0.5 y MolmoAct2 Random-1500, pero no proporciona enlaces, métricas ni detalles adicionales de esas variantes. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 245.000 de 320.000; el entrenamiento seguía en curso en el momento de la publicación y el modelo no es final.
- Sin evaluación: no ha sido evaluado en simulación ni en robot real, por lo que no hay evidencia de su calidad de política.
- Dominio restringido: entrenado exclusivamente con demostraciones simuladas del robot YAM en el dataset `telearms-yam-cube-v5-exp-random-1500`, sin domain randomization; la generalización a otras tareas, objetos o entornos no está demostrada.
- Licencia no disponible: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. Además, el modelo base Qwen2.5-VL-3B-Instruct tiene sus propias condiciones de licencia que deben revisarse.
- Idiomas no especificados: no se documenta el soporte multilingüe del fine-tune.
- Riesgo de alucinación: no evaluado en este contexto; al ser un modelo de acción, el riesgo relevante es la generación de trayectorias inválidas o inseguras, no documentado.
- Formato de pesos propietario de StarVLA: requiere el código del framework y el commit `13d8ad4` para cargar el state dict, lo que limita la portabilidad frente a formatos estándar como safetensors o GGUF.
- Desnormalización obligatoria: las acciones predichas requieren aplicar las estadísticas de `dataset_statistics.json`; omitir este paso produce acciones incorrectas.
- Sesgos: no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helen9975/starvla_qwendiscretediffusion_telearms_v5_random_1500
- Dataset de entrenamiento: https://huggingface.co/datasets/mliu48/telearms-yam-cube-v5-exp-random-1500
- Repositorio StarVLA: https://github.com/starVLA/starVLA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
