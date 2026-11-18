# autotrust/JEV

## Resumen

JEV-9B es un modelo de decisión y generación de texto desarrollado por AutoTrust, construido como un fine-tuning de Qwen/Qwen3.5-9B mediante la receta propietaria "Blocks of Experts". Su particularidad es que integra dos modos de funcionamiento en un único conjunto de pesos: un "System 1" que produce decisiones tipadas rápidas y calibradas (con salidas `noul`, `choice` y `score`) y un "System 2" que conserva las capacidades generativas del modelo base. La idea central es ofrecer, con un solo motor de inferencia, tanto juicios probabilísticos de baja latencia como razonamiento y generación deliberativa.

El modelo se distribuye como destilación del profesor cerrado TypeSafe Jev 1.13, con un objetivo declarado de aproximar sus distribuciones de decisión. Según la model card, responde una decisión individual en aproximadamente un tercio del tiempo que tarda la API alojada del profesor, lo que lo posiciona como alternativa local para tareas de ranking, clasificación y juicio visual. La familia incluye un sucesor de 27B con mejor transferencia a tareas no vistas.

Con 8.953.803.264 parámetros y un repositorio de 18,4 GB en safetensors, JEV-9B está pensado para despliegue en GPU única. La model card documenta además extensiones multimodales (visión) para uso en robótica y automatización de navegador, así como un rendimiento declarado de pass@1 de 0,707 en HumanEval por la ruta System 2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B) con cabecera dual y adaptador LoRA; receta "Blocks of Experts" |
| Parámetros totales | 8.953.803.264 |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

JEV-9B parte de Qwen/Qwen3.5-9B y añade una cabeza dual sobre el modelo base: una ruta System 1 que emite decisiones tipadas (`noul`, `choice`, `score`) con probabilidades calibradas, y una ruta System 2 que emplea el `lm_head` original del modelo base para generación y razonamiento. La model card describe la receta como "Blocks of Experts" e indica el uso de un adaptador LoRA junto con la cabeza dual, de modo que ambas rutas conviven en un único conjunto de pesos y se enrutan por petición dentro de un mismo motor vLLM.

El entrenamiento se basa en destilación de conocimiento desde el profesor cerrado TypeSafe Jev 1.13 sobre el corpus SargeDev/jev-distill-corpus-v3. En el conjunto de test de 29.955 filas, 25.376 objetivos corresponden a distribuciones del profesor. La model card menciona calibración mediante temperatura (ECE calculado tras aplicar temperatura con 15 bins) y una evaluación de calibración de probabilidades. No se detallan en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Decisiones tipadas calibradas: salidas `noul` (probabilidad), `choice` (selección entre opciones) y `score` (valor esperado en escala 0–5), en un solo paso hacia delante.
- Generación de texto y razonamiento por la ruta System 2, con el `lm_head` del modelo base y el adaptador desactivado.
- Generación de código: pass@1 de 0,707 en HumanEval (greedy, prompt estilo completion) por la ruta System 2.
- Visión: juicio de imágenes y capturas de pantalla como decisión System 1 (imagen de cámara o screenshot de entrada, probabilidad por acción de salida).
- Automatización de navegador (computer use): selección del siguiente elemento a clicar a partir de una captura con cajas numeradas, incluida la opción de declarar la tarea completada.
- Robótica: juicio visual para control de brazo robótico en simulación MuJoCo (preguntas binarias de posición relativa al gripper).
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Soporte de despliegue en vLLM y compatibilidad con endpoints.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes multi-paso: no disponible como capacidad declarada; los bucles de computer use se implementan externamente al modelo.

## Casos de uso

- Ranking y recomendación de contenido: cada ordenación se formula como una decisión System 1 calibrada, lo que permite reordenar titulares o resultados de búsqueda en aproximadamente medio segundo, como en la demo GuruSearch.
- Re-ranking de resultados de buscadores: el modelo recibe pares consulta-resultado y emite una probabilidad de relevancia calibrada, útil para combinar y reordenar listas de Google News, Bing News y Yahoo News.
- Automatización de navegador para tareas multi-paso: con capturas de pantalla y cajas numeradas sobre elementos clicables, el modelo elige el siguiente clic (o declara la tarea completada) en unos 0,2 s por clic; la model card reporta un 95% de 60 tareas aleatorias de 3–7 clics en tienda, ajustes y correo.
- Control visual de robots en simulación: el modelo responde preguntas binarias sobre la posición del objetivo respecto al gripper a partir de una imagen cenital, con unos 165 ms por decisión; útil como juez visual rápido en bucles de control, no como controlador extremo a extremo.
- Clasificación y filtrado con umbrales calibrados: gracias al ECE bajo declarado (0,0007 tras temperatura), las probabilidades de `noul` sirven para fijar umbrales de aceptación en pipelines de moderación o triaje sin recalibración manual.
- Asistencia a la generación de código en CI/CD: la ruta System 2 puede emplearse para completar funciones y tests en pipelines, con el pass@1 de referencia en HumanEval como orientación de calidad.
- Evaluación automática de respuestas y candidatos: la salida `score` en escala 0–5 permite puntuar alternativas generadas por otros modelos con un MAE declarado de 0,103.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Conjunto de evaluación | Métrica | Valor |
|---|---|---|---|
| Decisiones tipadas (acuerdo con el profesor TypeSafe Jev 1.13) | jev-distill-corpus-v3 · test_set_30k | KL media (target ‖ modelo) | 0,021 |
| Decisiones tipadas | test_set_30k | AUROC de `noul` | 0,996 |
| Decisiones tipadas | test_set_30k | Brier de `noul` | 0,0015 |
| Decisiones tipadas | test_set_30k | MAE del valor esperado de `score` (escala 0–5) | 0,103 |
| Decisiones tipadas | test_set_30k | ECE (15 bins, tras temperatura) | 0,0007 |
| Decisiones tipadas | test_set_30k | Acierto top-1 de `choice` (todas las filas) | 0,898 |
| Decisiones tipadas | test_set_30k | Acierto top-1 de `choice` (filas decisivas, gap top-2 ≥ 0,1) | 0,954 |
| Generación de código (System 2) | HumanEval · test | pass@1 (greedy, completion-style) | 0,707 |

Métricas multimodales declaradas en la model card: VL-RewardBench 74,3%, AgentRewardBench AUROC 0,91 y recomendación zero-shot de vídeos cortos a partir de portadas con AUC 0,72. En robótica, 10 de 20 escenas aleatorias completadas en simulación MuJoCo, con unos 165 ms por decisión. En computer use, 95% de 60 tareas completadas con cajas numeradas y texto de elemento; 37% solo con cajas numeradas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 8,95 mil millones de parámetros, en FP16/BF16 el peso ronda los 18 GB, por lo que se necesita una GPU con al menos 24 GB para inferencia sin cuantizar; la cuantización a 8 bits o 4 bits reduciría el requisito, aunque los tipos de cuantización no están declarados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una GPU de 24 GB o superior (por ejemplo, clase RTX 4090, L40S, A100 o H100) es el mínimo razonable para pesos en precisión completa.
- ¿Cabe en GPU de consumo? Probablemente en GPUs de 24 GB en BF16/FP16; en GPUs de 16 GB o menos requeriría cuantización, cuyos formatos no se detallan.
- Opciones de despliegue: vLLM (mencionado en la model card y en los tags), transformers (librería declarada) y endpoints compatibles. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card declara aproximadamente 0,2 s por decisión visual en una GPU y unos 165 ms por decisión en el bucle de robótica; para decisiones textuales, alrededor de un tercio del tiempo de la API alojada del profesor. No se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| autotrust/JEV-9B | 8,95 B | no disponible | Decisión calibrada (System 1) + generación (System 2), visión | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (modelo base) | ~9 B (según base declarada) | no disponible | Generación de texto | no disponible en la información | Hugging Face |
| autotrust/JEV-27B (sucesor de la familia) | 27 B (según nombre) | no disponible | Misma receta, mejor transferencia y System 2 más fuerte | no disponible en la información | Hugging Face |
| TypeSafe Jev 1.13 (profesor cerrado) | no disponible | no disponible | Decisiones calibradas, API alojada | propietaria | API alojada |

La comparación con alternativas de la misma categoría (modelos de decisión calibrada) no está disponible más allá del profesor TypeSafe Jev 1.13 y del sucesor JEV-27B citados por el autor.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Alucinación: la ruta System 2 hereda el comportamiento generativo de Qwen3.5-9B; no se publican métricas de factualidad. La ruta System 1 está calibrada frente al profesor, pero su validez depende de la distribución del corpus de destilación.
- Contexto: la longitud de contexto no se declara, lo que impide planificar usos con documentos largos.
- Licencia: apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y del corpus de destilación.
- Benchmarks no verificados: todos los resultados del model-index figuran como `verified: false`; proceden del autor y no de una evaluación independiente.
- Robótica: la propia model card advierte de que el modelo es un juez visual rápido y no un controlador extremo a extremo; pedirle que elija directamente entre 8 comandos de motor no funcionó.
- Computer use: el 95% de éxito se obtuvo con cajas numeradas y texto de elemento; sin texto, el éxito cae al 37%, y los fallos típicos omiten pasos (por ejemplo, el color) y acaban en un carrito vacío.
- Latencia: las cifras de 0,2 s por decisión corresponden a una GPU no especificada y a entradas visuales; no deben extrapolarse sin medir en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/JEV
- Sucesor de la familia: https://huggingface.co/autotrust/JEV-27B
- Demo en vivo de recomendación y búsqueda (GuruSearch): https://news.guru.so/ui
- Corpus de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Vídeo de robótica (pick and place): https://huggingface.co/autotrust/JEV-9B/resolve/main/videos/robot_arm_pick_place.mp4
- Vídeo de computer use (tienda): https://huggingface.co/autotrust/JEV-9B/resolve/main/videos/computer_use_shop.mp4
- Vídeo de computer use (ajustes): https://huggingface.co/autotrust/JEV-9B/resolve/main/videos/computer_use_settings.mp4
- Vídeo de computer use (correo): https://huggingface.co/autotrust/JEV-9B/resolve/main/videos/computer_use_mail.mp4
- Código de las demos visuales: https://huggingface.co/autotrust/JEV/tree/main/vl/demos
- Informes de evaluación visual: https://huggingface.co/autotrust/JEV/tree/main/reports/vl
