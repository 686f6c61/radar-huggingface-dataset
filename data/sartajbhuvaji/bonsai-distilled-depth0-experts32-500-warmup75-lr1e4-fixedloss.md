# sartajbhuvaji/bonsai-distilled-depth0-experts32-500-warmup75-lr1e4-fixedloss

## Resumen

`sartajbhuvaji/bonsai-distilled-depth0-experts32-500-warmup75-lr1e4-fixedloss` es un checkpoint de generación de texto publicado en HuggingFace por el usuario sartajbhuvaji. La etiqueta de arquitectura del repositorio es `qwen3_moe`, lo que indica que se construye sobre la familia Qwen3 con mezcla de expertos (MoE), y el recuento real de safetensors arroja 23.281.219.584 parámetros totales (unos 23,3 B) con un repositorio de 46,6 GB, coherente con pesos en bf16/fp16.

El identificador del modelo sugiere una variante destilada con 32 expertos ("experts32", "distilled", "depth0") y unos hiperparámetros de entrenamiento concretos ("500" pasos, "warmup75", "lr1e4", "fixedloss"), pero esta lectura procede únicamente del nombre del repositorio y no está confirmada por ninguna documentación. La model card está autogenerada y prácticamente vacía: no declara autoría efectiva, licencia, idiomas, datos de entrenamiento ni evaluación.

Su relevancia potencial es la de un MoE de ~23 B con un número reducido de expertos frente a los 128 de Qwen3-30B-A3B, lo que podría abaratar el despliegue; sin embargo, se trata de un checkpoint experimental con cero descargas y cero likes, sin resultados publicados, por lo que debe considerarse no apto para producción sin una validación propia exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_moe (transformer con mezcla de expertos, según etiqueta del repo) |
| Parámetros totales | 23.281.219.584 (~23,3 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo solo contiene safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La etiqueta `qwen3_moe` identifica la clase de configuración de transformers usada para cargar el modelo, lo que sitúa la arquitectura en la estirpe Qwen3 con capas de mezcla de expertos. El nombre del repositorio apunta a 32 expertos y a un proceso de destilación, pero no hay información oficial sobre el número de expertos activos por token, la dimensión oculta, el número de capas ni la estrategia de enrutamiento. Tampoco se documenta si el modelo parte de un Qwen3 preentrenado y se destila, se poda o se reentrena parcialmente.

No se dispone de datos sobre el corpus de entrenamiento (número de tokens, composición, filtrado), ni sobre si hubo fases de ajuste fino supervisado, RLHF o DPO. Los sufijos del identificador ("500", "warmup75", "lr1e4", "fixedloss") parecen describir una configuración de entrenamiento de 500 pasos, 75 pasos de calentamiento, tasa de aprendizaje 1e-4 y una función de pérdida corregida, pero son inferencias a partir del nombre y no hechos verificados. No se han documentado innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento explícitos.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y la etiqueta `conversational` sugiere uso en diálogo multi-turno, si bien no hay ejemplos ni evaluación que lo confirmen.
- Razonamiento y código: no disponible; al derivar de Qwen3 es plausible que conserve parte de estas capacidades, pero no está verificado ni cuantificado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Investigación sobre destilación de MoE: serviría como punto de partida para estudiar cómo se comporta un Qwen3 MoE reducido a 32 expertos frente al modelo original, comparando perplejidad y calidad en un conjunto de validación propio.
- Experimentación académica con presupuesto de VRAM limitado: al tener ~23,3 B de parámetros totales, puede cargarse en una GPU de 48-80 GB en bf16 y permite probar técnicas de enrutamiento sin el coste de un MoE de mayor tamaño.
- Base para ajuste fino específico de dominio: un equipo podría tomar los pesos como inicialización y aplicar LoRA sobre un corpus propio, siempre que la licencia (hoy indefinida) lo permita.
- Evaluación comparativa de robustez: útil como modelo de control en estudios que midan alucinación o sesgo frente a Qwen3 original, dado que comparte linaje arquitectónico.
- Prototipado interno de asistentes conversacionales: solo en entornos de laboratorio y con validación humana, por la ausencia de documentación y de evaluación.
- Reproducción de recetas de entrenamiento: los hiperparámetros codificados en el nombre permiten replicar la configuración declarada (500 pasos, warmup 75, lr 1e-4) en experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: ~46,6 GB solo de pesos (coincide con el tamaño del repo), más KV cache y overhead; en la práctica se necesitan 48-80 GB.
- VRAM estimada en INT8: ~23,3 GB de pesos, más overhead; viable en GPU de 40 GB con margen ajustado.
- VRAM estimada en INT4: ~11,6-13 GB de pesos, más overhead; podría caber en una RTX 4090 de 24 GB, aunque no hay cuantizaciones publicadas y habría que generarlas.
- GPU recomendadas: A100 80 GB o H100 para bf16; A100 40 GB o L40S para INT8; RTX 4090/3090 solo en INT4 y con conversión previa.
- Cabe en GPU de consumo: únicamente en cuantización de 4 bits y con reservas; no en bf16.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI previsiblemente compatibles por ser `qwen3_moe`, y llama.cpp/Ollama solo tras convertir a GGUF, paso no documentado.
- Latencia y throughput: no disponibles; al ser MoE, el rendimiento dependerá del número de expertos activos, dato que no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Expertos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bonsai-distilled-depth0-experts32 | 23,3 B | no disponible | 32 (según nombre) | no disponible | no disponible | HuggingFace, 0 descargas |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 128 (8 activos) | 32.768 nativo, ampliable con YaRN | Apache 2.0 | HuggingFace, ampliamente usado |
| Qwen3-14B | 14,8 B | denso | no aplica | 32.768 nativo, ampliable con YaRN | Apache 2.0 | HuggingFace, ampliamente usado |

La comparación con Qwen3-30B-A3B es la más directa por linaje arquitectónico: el modelo de sartajbhuvaji reduce el número de expertos de 128 a 32 y baja el total de parámetros en unos 7 B, pero no hay datos que permitan afirmar qué sacrifica en calidad. Frente a Qwen3-14B (denso) ofrece presumiblemente mayor capacidad por parámetro activo, aunque el coste de memoria es superior. No se dispone de benchmarks propios para establecer una comparación de rendimiento real.

## Limitaciones y advertencias

- Model card autogenerada y vacía: no hay información verificable sobre origen, datos, evaluación ni uso previsto.
- Licencia no declarada: no puede asumirse uso comercial; en ausencia de licencia explícita, los derechos de uso quedan en un limbo legal.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otros idiomas.
- Contexto no documentado: no puede planificarse un caso de uso con ventanas largas sin medirlo empíricamente.
- Riesgo de alucinación y sesgos: no evaluado; al no haber benchmarks ni auditorías, cualquier despliegue exige validación propia.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de que el checkpoint se haya probado fuera del autor.
- Fecha de creación anómala (2026-10-17): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.
- Al ser un modelo destilado y posiblemente recortado, puede haber degradado capacidades de razonamiento, código o instrucciones respecto a Qwen3 original.
- No hay cuantizaciones ni conversiones GGUF publicadas: el despliegue en hardware de consumo requiere trabajo adicional.

## Enlaces

- HuggingFace: https://huggingface.co/sartajbhuvaji/bonsai-distilled-depth0-experts32-500-warmup75-lr1e4-fixedloss
- Referencia genérica citada en la model card (calculadora de impacto ambiental, no específica del modelo): https://arxiv.org/abs/1910.09700
- No se han encontrado papers, blogs, repositorios ni demos adicionales sobre este modelo en la información disponible.
