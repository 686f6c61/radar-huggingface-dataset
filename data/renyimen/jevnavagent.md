# renyimen/JevNavAgent

## Resumen

JevNavAgent es un adaptador PEFT (LoRA) sobre el modelo vision-lenguaje Qwen3-VL-2B-Instruct, desarrollado por Yonghuang Wu y colaboradores de la Escuela de Ingeniería Biomédica e Innovación Tecnológica de la Universidad de Fudan (Shanghái). El modelo implementa un agente de navegación visual de un solo pase hacia delante ("single-forward") diseñado específicamente para patología computacional sobre imágenes de portaobjetos completos (WSI, *whole-slide images*) de escala gigapíxel. El problema que resuelve es la localización y el razonamiento sobre regiones de interés en diapositivas histopatológicas sin necesidad de múltiples pasadas de inferencia costosas.

El repositorio publica tres checkpoints: uno de ajuste supervisado (Stage-1 SFT) y dos de refinamiento mediante GRPO a nivel de trayectoria (Stage-2), uno orientado a VQA patológica y otro a detección de metástasis en ganglios linfáticos (CAMELYON16). Cada checkpoint incluye los pesos LoRA, tres cabezas de decisión factorizadas y un fichero de configuración, con un tamaño total de aproximadamente 73 MB por checkpoint (repositorio de 0,2 GB).

La relevancia actual reside en la combinación de un backbone VLM compacto (2B parámetros) con un esquema de decisión tipado y entrenamiento por refuerzo a nivel de trayectoria, lo que permite navegación visual eficiente en dominios médicos de alta resolución con latencias de episodio del orden de segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-lenguaje Qwen3-VL-2B-Instruct, con tres cabezas de decisión factorizadas (parada por suficiencia de evidencia, puntuación espacial-geométrica de candidatos, respuesta bilineal contextual con compuerta) |
| Parametros totales | 2B (backbone base); adaptadores LoRA de tamano no especificado (~73 MB por checkpoint incluyendo cabezas y configuracion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (backbone Qwen3-VL-2B-Instruct sujeto a su licencia original) |
| Formato de pesos | safetensors (adaptadores LoRA) + `heads.pt` (PyTorch) + `jev_config.json` |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3-VL-2B-Instruct, un transformer vision-lenguaje multimodal, sobre el que se aplica un adaptador LoRA. Sobre la representación del backbone se montan tres cabezas de decisión factorizadas que operan en un único pase hacia delante: una cabeza de parada basada en suficiencia de evidencia, una cabeza de puntuación espacial-geométrica de candidatos y una cabeza de respuesta bilineal contextual con compuerta. Este diseño sustituye la navegación iterativa convencional por una decisión tipada en un solo paso.

El entrenamiento se estructura en dos etapas. La Stage-1 aplica SFT de alineación de trayectorias contrafactuales (denominada `formal_terra_v5`). La Stage-2 emplea GRPO (Group Relative Policy Optimization) en línea a nivel de trayectoria, con dos variantes: una conjunta de VQA y divergencia KL, y otra específica para CAMELYON16. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni detalles sobre RLHF/DPO más allá del esquema GRPO descrito.

## Capacidades

- Navegación visual sobre imágenes de portaobjetos completos (WSI) de escala gigapíxel en un único pase hacia delante.
- Localización de regiones de interés patológico (tumores, focos microscópicos) mediante puntuación espacial-geométrica de candidatos.
- Decisión de parada automática basada en suficiencia de evidencia (conversión de parada reportada del 91,7 % en CAM16).
- Respuesta a preguntas visuales (VQA) sobre contenido histopatológico, incluyendo escala múltiple (Multi-Scale).
- Razonamiento clínico categorizado (Clin. A–D) sobre las diapositivas.
- Control de presupuesto de navegación (parámetro `budget`, p. ej. `B=12` en CAM16).
- Integración con SDK de evaluación conectable (`jevnav-eval`) y descarga de datos (`jevnav-download`).
- Soporte de inferencia con backbone Qwen3-VL-2B-Instruct como base congelada.

## Casos de uso

- **Detección de metástasis en ganglios linfáticos**: el checkpoint `stage2_traj_grpo_cam16` localiza regiones tumorales en diapositivas CAMELYON16 con un presupuesto de navegación de 12 pasos, reportando un 22,45 % de acierto de localización en positivos y un 93,75 % de especificidad, adecuado para triaje asistido.
- **Respuesta a preguntas patológicas sobre WSI**: el checkpoint `stage2_traj_grpo_vqa_kl` responde preguntas visuales multi-escala sobre diapositivas (51,57 % en WSI-VQA 351) con un tiempo de episodio de 5,63 s, útil para sistemas de consulta interactiva sobre biopsias digitalizadas.
- **Triaje automatizado de diapositivas**: la cabeza de parada por suficiencia de evidencia permite descartar diapositivas sin hallazgos de forma temprana, reduciendo la carga de revisión manual en laboratorios de anatomía patológica.
- **Investigación en patología computacional**: el esquema de decisión tipada y el entrenamiento GRPO a nivel de trayectoria sirven como base reproducible para experimentos de navegación visual médica, con SDK de evaluación y dataset de benchmark publicados.
- **Evaluación comparativa de agentes visuales**: el pipeline `jevnav-eval` con benchmarks `wsivqa_351` y `cam16_test` permite comparar políticas de navegación sobre diapositivas verificadas con métricas estandarizadas.
- **Prototipado de asistentes clínicos multimodales**: al apoyarse en un backbone VLM de 2B parámetros, el adaptador puede integrarse en entornos con recursos moderados para asistentes que razonan sobre imágenes histológicas y responden preguntas clínicas.

## Benchmarks y rendimiento

| Checkpoint | Benchmark | Metrica | Resultado |
|---|---|---|---|
| `stage1_sft` | WSI-VQA 351 | Step-T | 49,86 % |
| `stage1_sft` | WSI-VQA 351 | Micro-Focal | 49,31 % |
| `stage1_sft` | WSI-VQA 351 | Clin. A–D | 53,38 % |
| `stage1_sft` | CAM16 Dev | Loc Hit | 30,43 % |
| `stage1_sft` | CAM16 Dev | Spec | 95,65 % |
| `stage1_sft` | CAM16 Dev | Slide Acc | 71,74 % |
| `stage2_traj_grpo_vqa_kl` | WSI-VQA 351 | Multi-Scale | 51,57 % |
| `stage2_traj_grpo_vqa_kl` | WSI-VQA 351 | Step-T | 50,43 % |
| `stage2_traj_grpo_vqa_kl` | WSI-VQA 351 | Micro-Focal | 51,39 % |
| `stage2_traj_grpo_vqa_kl` | WSI-VQA 351 | Clin. A–D | 54,73 % |
| `stage2_traj_grpo_vqa_kl` | WSI-VQA 351 | Net Zoom Gain | +27 (42,74 % → 50,43 %) |
| `stage2_traj_grpo_vqa_kl` | WSI-VQA 351 | Tiempo por episodio | 5,63 s |
| `stage2_traj_grpo_cam16` | CAM16 Official Test-129 (B=12) | Pos Loc Hit | 22,45 % |
| `stage2_traj_grpo_cam16` | CAM16 Official Test-129 (B=12) | Stop conversion | 91,7 % |
| `stage2_traj_grpo_cam16` | CAM16 Official Test-129 (B=12) | Tumores visitados | 11/12 |
| `stage2_traj_grpo_cam16` | CAM16 Official Test-129 (B=12) | Spec | 93,75 % |
| `stage2_traj_grpo_cam16` | CAM16 Official Test-129 (B=12) | Strict Loc+Spec | 66,67 % (67,44 % online) |
| `stage2_traj_grpo_cam16` | CAM16 Official Test-129 (B=12) | Slide Acc | 69,77 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un backbone de 2B parámetros, la huella corresponde principalmente al backbone Qwen3-VL-2B-Instruct más el adaptador (~73 MB por checkpoint).
- GPU recomendadas: no especificadas en la información disponible. Un backbone de 2B parámetros es compatible con GPU de consumo, aunque la carga de diapositivas WSI gigapíxel puede requerir memoria adicional para el pipeline de datos.
- Cabe en GPU de consumo: previsiblemente sí para el backbone en precisiones reducidas, aunque no se confirma en la documentación.
- Opciones de despliegue: el repositorio proporciona el SDK `jevnav-eval` (instalable con `pip install -e .`) y el comando `jevnav-download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: se reporta un tiempo de episodio de 5,63 s en WSI-VQA 351 con el checkpoint `stage2_traj_grpo_vqa_kl`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JevNavAgent (este) | 2B (backbone) + LoRA | no disponible | Agente de navegación visual patológica con GRPO a nivel de trayectoria | Apache-2.0 | Hugging Face (adaptadores) |
| Qwen3-VL-2B-Instruct | 2B | no disponible | VLM generalista multimodal | licencia original Qwen | Hugging Face |
| Alternativas de navegación patológica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos comparables de la misma categoría (agentes de navegación visual en patología) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación especializado en patología; no está validado para uso clínico ni diagnóstico médico.
- Los resultados de localización en CAM16 son modestos (22,45 % Pos Loc Hit), lo que limita su uso autónomo en detección de metástasis.
- Riesgo de alucinación inherente a los modelos vision-lenguaje; las respuestas VQA y las decisiones de parada pueden ser incorrectas.
- No se especifican los idiomas soportados; la información multilingüe no está disponible.
- La longitud de contexto y los tipos de cuantización no están documentados, lo que dificulta planificar el despliegue.
- La licencia Apache-2.0 aplica al adaptador, pero el backbone Qwen3-VL-2B-Instruct mantiene su licencia original, que debe respetarse en uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- Dependencia del SDK y del pipeline de datos propios (`jevnav-eval`, `jevnav-download`) para la evaluación reproducible.

## Enlaces

- Hugging Face: https://huggingface.co/renyimen/JevNavAgent
- Dataset de benchmark: https://huggingface.co/datasets/renyimen/JevNavAgent
- Repositorio de código y SDK: https://github.com/yonghongwu/JevNavAgent
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Paper: arXiv preprint (referencia en la model card; sin identificador disponible)
