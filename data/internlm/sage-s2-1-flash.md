# internlm/Sage-S2.1-Flash

## Resumen

Sage S2.1 Flash es un modelo multimodal de caracter cientifico desarrollado por Shanghai Artificial Intelligence Laboratory (InternLM). Esta disenado especificamente para tareas de investigacion que exigen multiples rondas de analisis y verificacion, combinando la comprension de datos cientificos con recuperacion de informacion, programacion y uso de herramientas. El modelo puede emplear software especializado para ejecutar analisis, contrastar resultados con salidas intermedias y retroalimentacion visual, y ajustar los pasos siguientes en consecuencia.

Con 321.323.031.390 parametros totales (segun los pesos en safetensors), se posiciona en la categoria de modelos de gran escala. Su rasgo diferencial es la arquitectura de representacion unificada heredada de Sage SciPerception, que le permite procesar mas de diez tipos de entrada cientifica (grafos moleculares, estructuras cristalinas, secuencias de proteinas y estructuras 3D, entre otras), codificando cada modalidad y proyectandola a un espacio de representacion compartido para razonar junto a instrucciones en lenguaje natural.

Es relevante ahora porque cubre un nicho poco atendido por los modelos generalistas: el razonamiento cientifico verificable con uso de herramientas. En la evaluacion publicada ocupa el primer puesto en cuatro benchmarks (MLE-bench Lite, OfficeQA Pro, Harvey LAB y SpreadsheetBench 2) y el segundo en otros siete, compitiendo con modelos como GLM-5.3-Flash, DeepSeek-V4.1-Flash-1017, Qwen3.8-Max, GPT-5.6 Sol y Claude Opus 5. Su licencia MIT facilita la adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con representacion cientifica unificada (familia glm5_next) |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (variante oficial Sage S2.1 Flash FP8); otros no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que Sage S2.1 Flash emplea una arquitectura de representacion unificada, basada en el modelo Sage SciPerception, que codifica mas de diez tipos de datos cientificos (grafos moleculares, estructuras cristalinas, secuencias y estructuras 3D de proteinas, entre otros) y proyecta sus caracteristicas a un espacio compartido con las instrucciones en lenguaje natural. Sobre ese espacio se realizan tareas de prediccion, clasificacion, localizacion de sitios, analisis cuantitativo e inferencia de estructura. El tag del repositorio (glm5_next) sugiere una base de la familia GLM de quinta generacion, aunque no se detalla la composicion interna (atencion, posible mezcla de expertos, etc.).

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. La model card se centra en las capacidades cientificas y en los resultados de evaluacion, no en los detalles del pipeline de entrenamiento.

## Capacidades

- Comprension de datos cientificos multimodales: grafos moleculares, estructuras cristalinas, secuencias de proteinas y estructuras 3D, entre mas de diez tipos de entrada.
- Razonamiento cientifico multi-ronda con verificacion de resultados intermedios y retroalimentacion visual.
- Uso de herramientas y software especializado para ejecutar analisis y ajustar pasos posteriores.
- Programacion y resolucion de tareas de ingenieria de machine learning (MLE-bench Lite).
- Procesamiento de documentos profesionales y de oficina (OfficeQA Pro, Harvey LAB, SpreadsheetBench 2).
- Uso de herramientas y function calling (BFCL V4, AutomationBench).
- Ejecucion de investigacion y agentes multi-paso (DeepResearch Bench II, WebArena-Verified, OSWorld-Verified).
- Tareas cientificas especificas: prediccion, clasificacion, localizacion de sitios, analisis cuantitativo e inferencia de estructura.
- Capacidades multilingues: no disponible.

## Casos de uso

- Analisis de estructuras proteicas: el modelo ingiere secuencias y estructuras 3D de proteinas, las proyecta al espacio de representacion compartido y realiza inferencia de estructura o localizacion de sitios funcionales junto a instrucciones en lenguaje natural.
- Descubrimiento molecular asistido: a partir de grafos moleculares, el modelo puede clasificar compuestos, predecir propiedades y ejecutar software de quimica computacional para verificar resultados intermedios antes de proponer conclusiones.
- Ingenieria de machine learning automatizada: con un rendimiento de 90,3 en MLE-bench Lite, es adecuado para pipelines que generan, entrenan y evaluan modelos de forma autonoma dentro de un flujo agentico.
- Procesamiento de documentacion cientifica y de oficina: sus resultados en OfficeQA Pro (72,2) y Harvey LAB (25,0) lo hacen util para extraer y razonar sobre documentos tecnicos, legales y hojas de calculo (SpreadsheetBench 2: 37,1).
- Agentes de investigacion multi-paso: con soporte de tool calling (BFCL V4: 75,5) y ejecucion en entornos (OSWorld-Verified, WebArena-Verified), puede orquestar busquedas, llamadas a APIs y verificacion de resultados en tareas de research.
- Automatizacion de flujos de trabajo en escritorio y CLI: sus puntuaciones en ALE-CLI (32,4) y Workspace-Bench (61,7) permiten integrarlo en agentes que operan herramientas de linea de comandos y suites ofimaticas.
- Analisis de estructuras cristalinas: para tareas de ciencia de materiales, el modelo puede clasificar y predecir propiedades a partir de estructuras cristalinas codificadas en el espacio compartido.

## Benchmarks y rendimiento

Resultados publicados en la model card (15 benchmarks, 6 modelos):

| Categoria | Benchmark | Sage S2.1 Flash | GLM-5.3-Flash | DeepSeek-V4.1-Flash-1017 | Qwen3.8-Max | GPT-5.6 Sol | Claude Opus 5 |
|---|---|---|---|---|---|---|---|
| Agentic Coding | Terminal-Bench 2.1 | 87,9 | 84,3 | 87,6 | 89,6 | 86,2 | **90,2** |
| Agentic Coding | DeepSWE | 67,9 | 63,7 | **73,9** | 67,0 | 70,6 | 72,6 |
| Agentic Coding | NL2Repo-Bench | 57,2 | 53,0 | 62,7 | 63,2 | 60,7 | **79,9** |
| Agentic Coding | SWE-bench Pro | 60,6 | 60,3 | 61,8 | 65,3 | 59,8 | **76,5** |
| Productivity | SpreadsheetBench 2 | **37,1** | 32,4 | 35,8 | 34,9 | 32,7 | 33,6 |
| Productivity | ALE-CLI | 32,4 | 28,1 | **35,4** | 24,8 | 28,6 | 29,5 |
| Productivity | APEX-Agents | 61,7 | 50,8 | **69,2** | 66,3 | 55,4 | 61,3 |
| Productivity | GDPval | 78,0 | 67,7 | 77,6 | 79,6 | 69,6 | **80,0** |
| Productivity | Workspace-Bench-Lite | 67,1 | 65,1 | 66,8 | 67,4 | 57,4 | **68,1** |
| Productivity | Workspace-Bench | 61,7 | 59,7 | 63,0 | **63,9** | 50,9 | 62,0 |
| Tool Use | OfficeQA Pro | **72,2** | 64,7 | 69,7 | 66,2 | 66,4 | 67,2 |
| Tool Use | Harvey LAB | **25,0** | 20,0 | 11,7 | 24,2 | 5,0 | 22,7 |
| Tool Use | AutomationBench | 56,7 | 48,3 | **57,8** | 49,7 | 45,7 | 49,4 |
| Tool Use | BFCL V4 | 75,5 | 71,7 | 71,4 | 66,8 | 68,8 | **80,6** |

Nota: la model card menciona 15 benchmarks; la informacion proporcionada se interrumpe en la fila de JobBench, por lo que no se dispone de los resultados completos del resto de pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 321,3 mil millones de parametros, en BF16 se requieren aproximadamente 640 GB de VRAM (coincide con el tamano del repositorio de 642,9 GB). La variante FP8 reduce la huella a unos 320 GB.
- GPU recomendadas: para BF16 se necesitan nodos multi-GPU de clase A100/H100 (por ejemplo, 8x H100 80 GB). La variante FP8 puede desplegarse en 4x H100 80 GB.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU convencional.
- Opciones de despliegue: no se documentan en la informacion disponible; al ser pesos safetensors, es compatible con frameworks de servido tipo vLLM o TGI, aunque no se confirma su soporte.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Destaca en | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sage S2.1 Flash | 321,3 B | no disponible | MLE-bench Lite (90,3), OfficeQA Pro (72,2), Harvey LAB (25,0), SpreadsheetBench 2 (37,1) | MIT | Hugging Face y ModelScope |
| DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | DeepSWE (73,9), APEX-Agents (69,2), AutomationBench (57,8) | no disponible | no disponible |
| Qwen3.8-Max | no disponible | no disponible | Terminal-Bench 2.1 (89,6), NL2Repo-Bench (63,2), Workspace-Bench (63,9) | no disponible | no disponible |
| Claude Opus 5 | no disponible | no disponible | Terminal-Bench 2.1 (90,2), NL2Repo-Bench (79,9), SWE-bench Pro (76,5), BFCL V4 (80,6) | propietaria | API |

Sage S2.1 Flash se distingue por su enfoque cientifico multimodal y por el liderazgo en tareas de documentos profesionales y de oficina, mientras que Claude Opus 5 domina en codigo agentico y DeepSeek-V4.1-Flash-1017 en tareas de agentes de productividad.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de seguridad o alineacion.
- Riesgo de alucinacion inherente a los modelos de gran escala; en dominios cientificos la verificacion contra salidas intermedias y software especializado es parte del diseno, pero no elimina el riesgo.
- Longitud de contexto e idiomas soportados no disponibles, lo que dificulta planificar despliegues multilingues o con ventanas largas.
- La licencia MIT permite uso comercial, pero conviene revisar las condiciones de los componentes de terceros (Sage SciPerception) y de los datos cientificos utilizados.
- El gran tamano (321,3 B) exige infraestructura multi-GPU; no es viable en entornos de consumo.
- Los resultados de benchmarks son los publicados por el autor; no se dispone de evaluaciones independientes.
- La model card esta incompleta en la informacion proporcionada (fila de JobBench y benchmarks restantes), por lo que la comparativa no cubre las 15 pruebas anunciadas.

## Enlaces

- Hugging Face: https://huggingface.co/internlm/Sage-S2.1-Flash
- Variante FP8 en Hugging Face: https://huggingface.co/internlm/Sage-S2.1-Flash-FP8
- ModelScope: https://www.modelscope.cn/models/Shanghai_AI_Laboratory/Sage-S2.1-Flash
- ModelScope FP8: https://www.modelscope.cn/models/Shanghai_AI_Laboratory/Sage-S2.1-Flash-FP8
- Sitio web oficial: https://internlm.github.io/Sage-S2.1-Flash/
- Modelo base de percepcion: https://huggingface.co/internlm/Sage-SciPerception
- Paper (arXiv): https://arxiv.org/abs/2611.21072
