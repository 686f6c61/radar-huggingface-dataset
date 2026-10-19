# jediwattzon/gemma-3-270m-fisher-ewc-graph

## Resumen

`jediwattzon/gemma-3-270m-fisher-ewc-graph` es un artefacto de investigación derivado de `google/gemma-3-270m` (revisión `9b0cfec892e2bc2afd938c98eabe4e4a7b1e0ca1`) que no se presenta como un fine-tune convencional, sino como una compilación modal del modelo base. El autor, jediwattzon, utiliza el framework Fisher Graph Compilation para convertir los 39 eventos causales del Gemma 3 270M en un grafo modular instrumentable, con rutas de atención dispersas, charts Fisher por MLP y transportes entre bloques. El resultado desplegado contiene 163.282.512 parámetros, un 39,10 % menos que los 268.098.176 del modelo nativo, y reduce los MACs lógicos del cuerpo transformer de 100.270.080 a 28.670.080 por token (-71,41 %).

La propuesta es relevante para interpretabilidad mecanicista y compresión de modelos: permite depurar causalmente con `/xray`, mutear rutas contrafactuales y analizar un atlas de 144 charts (18 capas × 8 charts MLP). No hay datos publicados de longitud de contexto, idiomas o cuantizaciones, y la licencia es Gemma. Las métricas del autor muestran una fidelidad parcial frente al modelo nativo (top-1 del 76,60 %–77,34 % en el ejecutor fused640, 87,44 % tras el refit terminal v2), por lo que debe tratarse como un prototipo de investigación, no como un sustituto listo para producción.

El autor marca el artefacto como `open-development` con `heldout_confirmation=false` y advierte que la reducción de MACs es lógica, no una mejora de latencia sin kernels fusionados. Por tanto, su interés principal es experimental: estudiar EWC, charts de Fisher y depuración causal sobre un modelo pequeño de 163M de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafo modal compilado de 39 eventos causales sobre Gemma 3 270M: 1 ingress lexical, 18 generadores de atención con rutas dispersas/coordenadas reducidas, 18 generadores MLP con charts Fisher y transportes cross-block, 1 RMSNorm terminal y 1 egress lexical |
| Parámetros totales | 163.282.512 (safetensors); -39,10 % frente a 268.098.176 del Gemma 3 270M nativo |
| Parámetros activos | No aplica: no es un modelo MoE; la variante hybrid-ewc usa rutas dispersas K=16, pero este build es fused640 |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Gemma |
| Formato de pesos | safetensors (`model.safetensors`) y artefactos PyTorch `.pt` |
| Modelo base | `google/gemma-3-270m`, revisión `9b0cfec892e2bc2afd938c98eabe4e4a7b1e0ca1` |
| Framework de compilación | Fisher Graph Compilation (Pullback-Fisher + EWC) |
| Tamaño del repositorio | 3,7 GB |
| Descargas / likes | 0 / 0 en el momento de la ficha |
| Pipeline de HuggingFace | No disponible |

## Arquitectura y entrenamiento

La arquitectura no es un transformer denso estándar en ejecución, sino un grafo compilado que conserva la semántica del Gemma 3 270M. Los 39 eventos se organizan en 1 ingress lexical atado, 18 generadores de atención con coordenadas reducidas y rutas dispersas, 18 generadores MLP con charts Fisher y transportes cross-block, 1 RMSNorm terminal y 1 egress lexical atado. El factor lexical atado pasa de 262.144 × 640 (rango 640) a 262.144 × 512 (rango 512) mediante Pullback-EWC. El autor reporta 144 charts (18 capas × 8 charts MLP) y un atlas `chart_atlas.json` con motivos token-trigger.

El entrenamiento original de Gemma 3 270M no se documenta en la información disponible, ni tampoco el corpus exacto usado para la consolidación EWC. La compilación aplica Pullback-Fisher para descubrir charts de entrada y Elastic Weight Consolidation para consolidar la trayectoria secuencial; el artefacto v2 añade un refit EWC de estado terminal en un único sitio, donde el último MLP absorbe el error acumulado de trayectoria. No se documentan RLHF ni DPO adicionales. Las métricas se evalúan en el panel `open_development` y en un split held-out 30/30.

## Capacidades

- Generación de texto heredada del Gemma 3 270M base, con fidelidad parcial: top-1 del 76,60 %–77,34 % en el panel para fused640, 87,44 % tras el refit terminal v2 y 86,21 % en la estimación held-out.
- Ejecución de un grafo modal instrumentable de 39 eventos con rutas explícitas y transportes entre bloques.
- Depuración causal X-Ray en tres partes sobre un prompt, incluida la atribución por rutas y charts.
- Muteado contrafactual de rutas de atención; el ejemplo de la model card invierte la predicción de “Japan” hacia “Paris” al mutear la ruta “Japan”.
- Análisis del atlas de charts: 144 charts (18 capas × 8 MLP) con vocabulario emergente de motivos token-trigger.
- Inspección y carga de tensores compilados mediante `safetensors`, `config.json` y `chart_atlas.json`.
- No hay evidencia de tool calling ni function calling.
- No hay evidencia de soporte para agentes o razonamiento multi-step.
- No se documentan capacidades multilingües, de visión, audio o modo thinking.

## Casos de uso

- Investigación en interpretabilidad mecanicista: ejecutar `/xray` sobre prompts controlados para atribuir la predicción a rutas de atención y charts MLP concretos; el interés está en que el grafo es explícito y no una pila opaca.
- Depuración causal contrafactual: mutear una ruta asociada a una entidad (por ejemplo, “Japan”) y comprobar si la predicción cambia; sirve para validar hipótesis sobre circuitos internos.
- Estudio de compresión y EWC: comparar el modelo nativo, el fused640 y la variante hybrid-ewc con ΔNLL, NRMSE y top-1 para evaluar el coste de fidelidad de cada estrategia.
- Reproducción de experimentos de consolidación secuencial: usar los artefactos `.pt` y el harness para reproducir el refit terminal v2 y medir la brecha entre panel y held-out.
- Docencia y laboratorio: visualizar el grafo, el atlas de charts y el equalizer modal en una TUI para explicar atención, MLP y rutas dispersas.
- Auditoría de vocabulario token-trigger: analizar `chart_atlas.json` para identificar motivos asociados a tokens y capas, y formular experimentos de interpretabilidad.
- Prototipado de herramientas XAI: integrar la carga de safetensors y las rutas en un cuaderno o script de análisis, siempre en entorno de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas internas del panel `open_development` y un split held-out 30/30; se reproducen a continuación sin interpretarlas como rendimiento general.

| Build | Parámetros desplegados | MACs cuerpo / token | ΔNLL panel | NRMSE logits centrados | Top-1 panel | KL panel |
|---|---:|---:|---:|---:|---:|---:|
| Gemma 3 270M nativo | 268.098.176 | 100.270.080 | 0,0000 | 0,0000 | 100,00 % | No disponible |
| 39-event fused640 | 163.282.512 | 28.670.080 | -0,0559 | 0,2067 | 76,60 %–77,34 % | 0,2943 |
| 39-event fused640, terminal refit v2 | 163.282.512 | 28.670.080 | No disponible | 0,1613 | 87,44 % | 0,2219 |
| 39-event fused640, terminal refit v2, held-out 30/30 | 163.282.512 | 28.670.080 | No disponible | 0,2028 | 86,21 % | 0,3043 |
| Hybrid-EWC (Lex512 + Block-EWC K=16) | 234.871.424 | Rutas dispersas K=16; 0 % starved heads | -0,0072 | 0,0781 | 96,31 % (Lex512) / 80,00 % (Block-EWC K=8) | No disponible |
| Baseline SVD sin ponderar | No disponible | No disponible | +10,86 | 1,2154 | 0,00 % | No disponible |

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud. Solo pesos: 163.282.512 parámetros equivalen a ~0,33 GB en FP16/BF16 y ~0,65 GB en FP32 (cálculo aritmético, no validado).
- El repositorio ocupa 3,7 GB e incluye varios artefactos `.pt` y safetensors; hay que reservar espacio en disco adicional.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño de pesos, una RTX 4090 o GPUs consumer menores podrían alojarlo; A100/H100 no son necesarias para los pesos, pero no hay validación del harness completo.
- ¿Cabe en GPU consumer? Es probable por el tamaño de pesos, pero no está confirmado; no se publican requisitos de VRAM para activaciones, ejecutor o herramientas de X-Ray.
- Despliegue: harness propio `fisher_graph.gemma3_ewc_interactive_harness`; carga manual con `huggingface_hub` + `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La reducción de MACs (-71,41 %) es lógica y el autor indica que no implica mejora de latencia sin kernels fusionados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Top-1 panel | ΔNLL panel | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| `google/gemma-3-270m` nativo | 268.098.176 | No disponible | 100,00 % | 0,0000 | Gemma | HuggingFace público |
| `jediwattzon/gemma-3-270m-fisher-ewc-graph` fused640 | 163.282.512 | No disponible | 76,60 %–77,34 %; 87,44 % con refit v2 | -0,0559 | Gemma | HuggingFace; 0 descargas |
| Variante hybrid-ewc reportada | 234.871.424 | No disponible | 96,31 % (Lex512) / 80,00 % (Block-EWC K=8) | -0,0072 | Gemma | Reportada en la model card; disponibilidad independiente no disponible |
| Baseline SVD sin ponderar | No disponible | No disponible | 0,00 % | +10,86 | No disponible | Referencia interna, no modelo publicado |

## Limitaciones y advertencias

- Artefacto de investigación `open-development` con `heldout_confirmation=false`; no está validado para producción.
- No hay benchmarks estándar (MMLU, HumanEval, GSM8K) ni evaluaciones de sesgo, alucinación o seguridad.
- La fidelidad no es total: top-1 del 76,60 %–87,44 % según variante, NRMSE de logits centrados 0,1613–0,2067 y KL 0,2219–0,2943 en panel; la generación puede divergir del Gemma 3 270M nativo.
- La estimación held-out del refit v2 es inferior a la métrica de panel (86,21 % frente a 87,44 % en top-1; KL 0,3043 frente a 0,2219; NRMSE 0,2028 frente a 0,1613), lo que indica una brecha de generalización.
- No se documentan tool calling, agentes, visión, audio, modo thinking ni soporte multilingüe; no debe asumirse que el modelo base conserve todas esas capacidades en este build.
- Licencia Gemma: revisar los términos de uso comercial y las restricciones de la licencia antes de desplegar.
- Dependencia de código custom y de artefactos `.pt`; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, y las rutas dispersas pueden no tener kernels optimizados.
- La reducción de MACs es lógica; no se garantiza mejora de latencia o throughput.
- Sin validación externa ni adopción registrada: 0 descargas y 0 likes en el momento de la ficha.
- Sesgos: no disponibles; se heredan del Gemma 3 270M base, pero no hay evaluación publicada.

## Enlaces

- [HuggingFace: jediwattzon/gemma-3-270m-fisher-ewc-graph](https://huggingface.co/jediwattzon/gemma-3-270m-fisher-ewc-graph)
- [Modelo base: google/gemma-3-270m](https://huggingface.co/google/gemma-3-270m)
- [Revisión del modelo base utilizada](https://huggingface.co/google/gemma-3-270m/tree/9b0cfec892e2bc2afd938c98eabe4e4a7b1e0ca1)
- [Repositorio Fisher Graph Compilation](https://github.com/JediWattson/fisher-compilation)

No se han proporcionado enlaces a papers, blogs o demos adicionales.
