# Jialuo21/Imago-4B

## Resumen

Imago-4B es un modelo de generación de imágenes texto-a-imagen derivado de FLUX.2-klein-base-4B mediante un post-entrenamiento de aprendizaje por refuerzo (RL) de parámetros completos sobre el transformer DiT. Lo desarrolla el autor independiente Jialuo21 y se presenta como la implementación del método descrito en el trabajo *Imago: Maturing Visual Generation with RL*. El problema que aborda es el de alinear el generador visual con recompensas de calidad y fidelidad al prompt sin recurrir a pares de preferencia anotados manualmente, usando una recompensa zero-shot.

La relevancia práctica está en que aplica RL directamente sobre los pesos del DiT (no sobre un adaptador LoRA), con un currículo en dos etapas y sin classifier-free guidance ni penalización KL durante el entrenamiento. El resultado declarado es una mejora sustancial en benchmarks de composición y fidelidad respecto al modelo base, manteniendo el mismo tamaño (3.875.544.576 parámetros) y el mismo pipeline de inferencia (`Flux2KleinPipeline`).

El repositorio contiene únicamente los pesos del transformer (`config.json` y `diffusion_pytorch_model.safetensors`), por lo que requiere descargar el modelo base de Black Forest Labs para el VAE, el text encoder y el scheduler. La información pública disponible es escasa: no hay licencia declarada, no se detallan idiomas soportados ni se especifican requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DiT (diffusion transformer) de FLUX.2-klein; post-entrenado con RL |
| Parametros totales | 3.875.544.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin ventana de contexto de texto declarada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`diffusion_pytorch_model.safetensors` + `config.json`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base FLUX.2-klein-base-4B: un transformer de difusión (DiT) con aproximadamente 3.875 millones de parámetros. Imago-4B no modifica la topología, sino que reentrena todos los parámetros del transformer mediante RL partiendo de los pesos de FLUX.2-klein-base-4B. El pipeline de inferencia sigue siendo `Flux2KleinPipeline` de la librería `diffusers`, con el resto de componentes (VAE, text encoder) heredados del modelo base.

La receta de entrenamiento declarada incluye varios elementos concretos. La recompensa es un `Qwen3.5-9B ProbScore` en modo zero-shot, es decir, un modelo juez que puntúa las imágenes generadas sin entrenamiento específico previo. El currículo es secuencial en dos etapas: primero 500 pasos sobre `Jialuo21/Imago-Short` y después 500 pasos sobre `Jialuo21/Imago-Long`. El algoritmo es DiffusionNFT con Branch Sampling (muestreo de ramas con `t` en el intervalo [0,8; 1,0]), DAVE aplicado en el bloque 14 de 25 y regularización de la norma de velocidad escalar con `beta=0.07`. La tasa de aprendizaje es 1e-6 y el entrenamiento se realiza sin classifier-free guidance y sin penalización KL.

## Capacidades

- Generación de imágenes a partir de prompts de texto en formato natural, con resolución de salida configurable (el ejemplo oficial usa 1024x1024).
- Composición espacial y relacional mejorada respecto al modelo base, según los benchmarks declarados (SpatialGenEval 80,9 frente a 71,6).
- Fidelidad al prompt en escenas complejas y de múltiples objetos (T2I-CompBench 4,09 frente a 3,84).
- Generación de texto dentro de la imagen y escenas con contenido textual (LPD-Bench 93,0 frente a 88,8).
- Prompts largos y descripciones densas (LongBench-T2I 3,50 frente a 2,88).
- Control de la generación mediante semilla (`generator`), número de pasos de inferencia y `guidance_scale`.
- No se declaran capacidades de tool calling, agentes, visión de entrada, audio ni modo de razonamiento explícito.

## Casos de uso

- Ilustración editorial y conceptual: el modelo genera escenas detalladas a 1024x1024 con composición espacial fiable, adecuado para bocetos de ilustración que luego se retocan manualmente; la mejora en SpatialGenEval respecto al base reduce las iteraciones de corrección de disposición de objetos.
- Generación de material gráfico para documentación técnica: descripciones largas y precisas (por ejemplo, diagramas de objetos o escenarios) se traducen mejor gracias al rendimiento en LongBench-T2I, lo que encaja en la producción de imágenes de apoyo para manuales.
- Creación de assets para prototipos de producto: permite generar variaciones controladas por semilla de un mismo concepto, útil para explorar direcciones visuales antes de encargar arte final.
- Imágenes con texto integrado: el alto resultado en LPD-Bench (93,0) lo hace apropiado para carteles, portadas y mockups donde aparecen rótulos o titulares dentro de la imagen.
- Investigación en RL para generación visual: al publicarse como pesos completos del DiT y con receta detallada (algoritmo, hiperparámetros, currículo), sirve como referencia reproducible para estudiar DiffusionNFT y el ajuste por recompensa zero-shot.
- Fines educativos y demos de difusión: al integrarse en `diffusers` con pocas líneas de código, es adecuado para talleres y cuadernos que muestren post-entrenamiento con RL sobre un modelo de difusión.
- Prototipado rápido de contenido para redes o presentaciones: con 50 pasos y `guidance_scale=4.0` se obtienen imágenes listas para revisión en un flujo de trabajo local con una sola GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor, evaluados con Kimi-K2.6 como juez:

| Modelo | Mean | T2I-CompBench | TIIF-Bench | SpatialGenEval | T2I-CoReBench | LPD-Bench | Arena-T2I-Hard | LongBench-T2I | DrawBench PickScore |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Imago-4B | 82,7 | 4,09 | 84,7 | 80,9 | 88,7 | 93,0 | 80,0 | 3,50 | 22,8 |
| FLUX.2-Klein-Base (4B) | 73,8 | 3,84 | 77,1 | 71,6 | 77,2 | 88,8 | 67,7 | 2,88 | 22,4 |

La media agregada sube 8,9 puntos sobre el modelo base. Las mayores ganancias se dan en Arena-T2I-Hard (+12,3) y T2I-CoReBench (+11,5); la menor, en DrawBench PickScore (+0,4). No se han publicado resultados de benchmarks independientes ni comparaciones con modelos de otros autores en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un DiT de 3,88 mil millones de parámetros en bfloat16 ocupa aproximadamente 7,8 GB solo en pesos; sumando VAE, text encoder y activaciones, se requiere holgadamente más de 12 GB, aunque la cifra exacta no está publicada.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo encaja en el rango de GPUs de 24 GB o más (RTX 4090, A100 40/80 GB, H100), pero esta recomendación no la declara el autor.
- ¿Cabe en GPU de consumo? Probablemente en tarjetas de 24 GB o superiores con bfloat16, pero no hay confirmación oficial ni guías de cuantización publicadas.
- Opciones de despliegue: `diffusers` con `Flux2KleinPipeline` y `Flux2Transformer2DModel` es la vía documentada. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a difusión).
- Latencia y throughput: no disponibles. El ejemplo oficial usa 50 pasos de inferencia con `guidance_scale=4.0`.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Post-entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Imago-4B | 3.875.544.576 | DiT texto-a-imagen | RL de parámetros completos (DiffusionNFT) | no disponible | Hugging Face (`Jialuo21/Imago-4B`) |
| FLUX.2-klein-base-4B | 4B (aprox.) | DiT texto-a-imagen | ninguno (modelo base) | no disponible en esta ficha | Hugging Face (Black Forest Labs) |
| Alternativas de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos verificables es contra el modelo base del que deriva. No se dispone de información sobre otros modelos comparables de la misma categoría en el material proporcionado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al derivar de un modelo base entrenado con datos web a gran escala, es esperable heredar sesgos de representación, pero no hay análisis publicado.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir objetos inexistentes, anatomías incorrectas o texto mal formado pese a la mejora en LPD-Bench.
- Idiomas: no se declara qué idiomas acepta el text encoder heredado; la calidad con prompts en castellano no está verificada.
- Licencia: no disponible. Esto impide confirmar si el uso comercial está permitido; debe consultarse la licencia del modelo base FLUX.2-klein-base-4B antes de cualquier despliegue productivo.
- Dependencia del modelo base: el repositorio solo contiene el transformer; sin descargar FLUX.2-klein-base-4B no es funcional.
- Evaluación: los benchmarks proceden del propio autor y usan un juez automático (Kimi-K2.6), no evaluación humana ni revisión independiente.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin ecosistema de terceros ni informes de uso en producción.
- Uso responsable: al ser un generador de imágenes, conviene aplicar políticas de contenido y verificación de procedencia en cualquier aplicación pública.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jialuo21/Imago-4B
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Etapa de currículo corta: https://huggingface.co/Jialuo21/Imago-Short
- Etapa de currículo larga: https://huggingface.co/Jialuo21/Imago-Long
- Paper de referencia citado en la model card: *Imago: Maturing Visual Generation with RL* (no se proporciona URL en la información disponible)
- Repositorio de `diffusers`: no disponible en la información proporcionada
