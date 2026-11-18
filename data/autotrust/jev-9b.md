# autotrust/JEV-9B

## Resumen

autotrust/JEV-9B es un modelo derivado por fine-tuning de Qwen/Qwen3.5-9B que implementa una arquitectura dual de decisión: un "System 1" rápido y calibrado para emitir decisiones tipadas (noul, choice, score) en un único forward pass, y un "System 2" que conserva las capacidades generativas y de razonamiento del modelo base. Lo desarrolla autotrust y se distribuye con licencia Apache 2.0. El modelo está pensado como destilación de conocimiento del profesor cerrado TypeSafe Jev 1.13, con el objetivo de reproducir sus distribuciones de probabilidad calibradas sin depender de una API alojada.

El modelo resuelve el problema de obtener decisiones rápidas y probabilísticamente calibradas (clasificación binaria, elección entre opciones y puntuaciones en escala 0-5) con latencia muy baja, manteniendo a la vez la generación de texto y código del Qwen3.5-9B subyacente. Según el autor, responde a una decisión individual en aproximadamente un tercio del tiempo que tarda la API alojada, y funciona con un único conjunto de pesos servido por un motor vLLM con enrutado por petición.

Cuenta con 8.953.803.264 parámetros (unos 9B) y un repositorio de 18,4 GB. Desde el 3 de octubre de 2026 admite entrada de imágenes para juicio visual rápido, con demos de brazo robótico (MuJoCo) y uso de ordenador (screenshot a clic). Es relevante ahora por su combinación poco habitual de decisión calibrada de baja latencia, generación de System 2 intacta y capacidad multimodal emergente, todo en un modelo abierto de 9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-9B con adaptador LoRA y cabeza dual (System 1 de decisión tipada + System 2 generativo); etiquetado por el autor como "Blocks of Experts" |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | No disponible (no se declara como MoE con expertos activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B mediante fine-tuning con un adaptador LoRA y una cabeza adicional (dual-head), separando dos rutas: una ruta System 1 que emite decisiones tipadas (noul, choice, score) con probabilidades calibradas en un único forward pass, y una ruta System 2 que usa el lm_head original del modelo base con el adaptador desactivado, preservando generación y razonamiento. El autor describe el enfoque como "Blocks of Experts", con enrutado por petición sobre un único conjunto de pesos servido por vLLM.

El entrenamiento se basa en destilación de conocimiento desde el profesor cerrado TypeSafe Jev 1.13 sobre el corpus SargeDev/jev-distill-corpus-v3. Según la model card, 25.376 de las 29.955 filas de test corresponden a distribuciones del profesor TypeSafe Jev 1.13. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon RLHF o DPO. Entre las innovaciones destacables están las decisiones tipadas con calibración de temperatura, la separación System 1 / System 2 con enrutado por petición y, desde octubre de 2026, la extensión multimodal para juicio visual en un solo paso.

## Capacidades

- Decisiones tipadas calibradas: noul (probabilidad binaria), choice (distribución sobre opciones) y score (valor esperado en escala 0-5), en un único forward pass.
- Generación de texto y razonamiento por la ruta System 2, usando el lm_head original del Qwen3.5-9B con el adaptador desactivado.
- Generación de código: 70,7% de pass@1 en HumanEval (greedy, prompt estilo completion) por la ruta System 2.
- Entrada de imágenes (multimodal): juicio visual rápido con imagen de cámara o screenshot como entrada y probabilidad por acción como salida.
- Uso de ordenador: selección del siguiente elemento a clicar a partir de screenshots con cajas numeradas, incluida la opción de "tarea completada".
- Robótica: juicio visual para brazo robótico (posición relativa del objetivo respecto a la pinza) en simulación MuJoCo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Agentes y razonamiento multi-paso: soportado de forma implícita mediante bucles de decisión System 1 (clic a clic, paso a paso del brazo), no como planificación autónoma del modelo generativo.
- Multilingüe: limitado al inglés según la model card.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Ranking y recomendación de titulares: cada ordenación se resuelve como una decisión System 1 calibrada en torno a medio segundo, como en la demo GuruSearch del autor, adecuado por la calibración de probabilidades y la baja latencia.
- Re-ranking de resultados de búsqueda: reordenar resultados de varios motores por relevancia usando la salida `score` o `choice`, comparando lado a lado con el orden original de los buscadores.
- Automatización de uso de ordenador: bucle screenshot → caja numerada → clic, con aproximadamente 0,2 s por clic; el autor reporta 95% de 60 tareas multi-paso completadas (tienda, ajustes, correo), lo que lo hace apto para agentes de navegador acotados.
- Control de brazo robótico en simulación: decidir en cada paso si el objetivo está a izquierda/derecha y arriba/abajo de la pinza, con ~165 ms por decisión; útil como juez visual rápido dentro de un controlador, no como controlador extremo a extremo.
- Filtrado y moderación con umbral calibrado: usar la probabilidad `noul` (AUROC 0,996, Brier 0,0015) para clasificar pares o contenidos con umbrales fiables y ECE muy bajo (0,0007), minimizando falsos positivos en producción.
- Puntuación de calidad en pipelines de datos: asignar `score` en escala 0-5 (MAE 0,103) para ordenar o filtrar muestras de forma reproducible y barata.
- Generación de código asistida: usar la ruta System 2 (pass@1 70,7% en HumanEval) para completar funciones en herramientas de desarrollo o pipelines de CI/CD, con el adaptador desactivado.
- Evaluación automática de recompensas visuales: juicio de imágenes con VL-RewardBench 74,3% y AgentRewardBench AUROC 0,91, útil para puntuar salidas de otros modelos o agentes.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Decisiones tipadas (acuerdo con el profesor TypeSafe Jev 1.13) | jev-distill-corpus-v3 · test_set_30k | KL media (target ‖ modelo), todas las filas | 0,021 |
| Decisiones tipadas | jev-distill-corpus-v3 · test_set_30k | AUROC de noul | 0,996 |
| Decisiones tipadas | jev-distill-corpus-v3 · test_set_30k | Brier de noul | 0,0015 |
| Decisiones tipadas | jev-distill-corpus-v3 · test_set_30k | MAE del valor esperado de score (escala 0-5) | 0,103 |
| Decisiones tipadas | jev-distill-corpus-v3 · test_set_30k | ECE (15 bins, tras temperatura) | 0,0007 |
| Decisiones tipadas | jev-distill-corpus-v3 · test_set_30k | Acuerdo top-1 de choice (todas las filas) | 0,898 |
| Decisiones tipadas | jev-distill-corpus-v3 · test_set_30k | Acuerdo top-1 de choice (filas decisivas, gap top-2 ≥ 0,1) | 0,954 |
| Generación de código (System 2) | HumanEval (test) | pass@1 (greedy, prompt estilo completion) | 0,707 |

Métricas visuales adicionales citadas en la model card (sin tabla de detalle en la información disponible): VL-RewardBench 74,3%, AgentRewardBench AUROC 0,91, recomendación zero-shot de vídeo corto por portadas AUC 0,72.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~9B parámetros en safetensors, una carga en fp16 requeriría del orden de 18 GB de pesos más overhead, y en cuantización de 8 bits o 4 bits bajaría aproximadamente a 9 GB o 5 GB respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible; el autor menciona servir con vLLM y reporta ~0,2 s por decisión visual en una GPU, sin especificar modelo.
- Cabe en GPU de consumo: probable en GPUs de 24 GB (por ejemplo RTX 4090) en fp16 y en GPUs de 12-16 GB con cuantización, aunque no se confirma en la información disponible.
- Opciones de despliegue: vLLM (motor citado por el autor, con enrutado por petición entre System 1 y System 2), transformers (librería declarada), script `vl/serve.sh` para la ruta multimodal. llama.cpp, Ollama y TGI no se mencionan.
- Latencia y throughput: ~0,2 s por decisión visual y ~165 ms por decisión en el brazo robótico; el autor afirma que responde a una decisión individual en aproximadamente un tercio del tiempo de la API alojada. Throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| autotrust/JEV-9B | ~9B (8.953.803.264) | No disponible | Dual System 1 (decisión tipada calibrada) + System 2 (generación) + visión | Apache 2.0 | Pesos abiertos en Hugging Face |
| Qwen/Qwen3.5-9B (modelo base) | ~9B | No disponible | Generación de texto y razonamiento | No disponible | Pesos abiertos en Hugging Face |
| autotrust/JEV-27B (sucesor del mismo autor) | ~27B (según nomenclatura) | No disponible | Misma receta, con mayor transferencia a tareas no vistas y System 2 más fuerte | No disponible | Pesos abiertos en Hugging Face |
| TypeSafe Jev 1.13 (profesor) | No disponible | No disponible | Decisiones tipadas calibradas | Cerrado | Solo API alojada |

La comparación con modelos de decisión calibrada de terceros no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo inglés según la model card; el rendimiento en castellano u otros idiomas no está documentado.
- Contexto: la longitud de contexto no se declara, lo que impide planificar cargas con ventanas largas.
- Alucinación: la ruta System 2 hereda los riesgos del Qwen3.5-9B; la ruta System 1 está calibrada frente a un profesor concreto y puede degradarse fuera de la distribución del corpus de destilación.
- Control robótico: el autor advierte que pedir directamente una de 8 comandos de motor no funcionó; el modelo es un juez visual rápido, no un controlador extremo a extremo.
- Uso de ordenador: sin el texto de los elementos (solo cajas numeradas) la tasa de éxito cae al 37%; los fallos observados omiten pasos y pueden acabar en acciones incorrectas (por ejemplo, comprar un carrito vacío).
- Benchmarks no verificados: todos los resultados del model-index están marcados como `verified: false`; provienen del autor y no de una evaluación independiente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y del corpus de destilación antes de desplegar en producción.
- Disponibilidad de formatos: no se ofrecen pesos GGUF ni cuantizaciones listas, lo que limita el despliegue en entornos sin GPU.
- Sesgos: no se documentan sesgos específicos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/JEV-9B
- Modelo sucesor: https://huggingface.co/autotrust/JEV-27B
- Demo en vivo GuruSearch (recomendación y búsqueda): https://news.guru.so/ui
- Dataset de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Código de demos visuales: carpeta `vl/demos/` del repositorio del modelo
- Informes de evaluación visual: carpeta `reports/vl/` del repositorio del modelo
- Vídeos de demos: `videos/robot_arm_pick_place.mp4`, `videos/computer_use_shop.mp4`, `videos/computer_use_settings.mp4`, `videos/computer_use_mail.mp4` en el repositorio del modelo
