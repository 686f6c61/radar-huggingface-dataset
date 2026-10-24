# jjalora/diet-traj-pythia-410m-scaled-orthogonal-seed11

## Resumen

`jjalora/diet-traj-pythia-410m-scaled-orthogonal-seed11` es un checkpoint de investigación, no un modelo listo para producto: se trata de una ejecución de preentrenamiento desde cero de Pythia-410M realizada dentro de la campaña de espacio de pesos denominada DIET. El autor reproduce la receta abierta de EleutherAI (`models/410M/pythia-410m.yml`): misma arquitectura GPT-NeoX, mismo flujo de tokens y mismo orden de datos (`EleutherAI/pile-standard-pythia-preshuffled`), con AdamW, lr 3e-4, betas (0,9; 0,95), weight decay 0,1, recorte de gradiente 1,0, schedule coseno hasta 3e-5 durante 143.000 pasos y 1.430 pasos de warmup. La única diferencia respecto a Pythia-410M es la semilla aleatoria y el esquema de inicialización de pesos.

El interés del artefacto es precisamente esa diferencia controlada: `init_scheme = scaled_orthogonal`, semilla 11. El repositorio publica la trayectoria completa de entrenamiento mediante ramas `stepN` (N en {0, 1, 2, 4, …, 512} más un checkpoint cada 100 pasos), en safetensors float16 y solo pesos. La rama `main` contiene los pesos finales cuando la ejecución termina. Esto lo convierte en material para estudiar dinámica de entrenamiento, evolución del conocimiento y efecto de la inicialización en el espacio de pesos.

Relevancia práctica: 410M parámetros, 2.048 tokens de contexto y 300.000 millones de tokens de entrenamiento aproximados (143.000 pasos × 1.024 secuencias × 2.048 tokens). Es un modelo base en inglés, sin ajuste por instrucciones ni alineamiento, pensado para interpretabilidad y experimentación reproducible, no para uso conversacional directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only GPT-NeoX (`gpt_neox`), 24 capas, 16 cabezas de atencion, dimension oculta 1024 (segun la receta Pythia-410M referenciada) |
| Parametros totales | 410M (aproximado, nombre del modelo); no se publica recuento exacto en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens (receta Pythia-410M) |
| Tipos de cuantizacion | Solo pesos float16 safetensors en el repositorio; no se publican versiones GGUF, GPTQ, AWQ ni int8 |
| Idiomas soportados | Ingles (`language: [en]`); entrenado sobre The Pile, predominantemente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors float16, solo pesos, una rama `stepN` por checkpoint; rama `main` con los pesos finales |
| Vocabulario | 50.304 tokens (configuracion Pythia; no verificado en la model card) |
| Tamano del repositorio | 53,5 GB (agrega todas las ramas de checkpoint, no un unico modelo) |
| Dataset de entrenamiento | `EleutherAI/pile-standard-pythia-preshuffled`, batch *i* = filas [i·1024, (i+1)·1024) |
| Hardware de entrenamiento | 1 nodo, 4 × NVIDIA H100-SXM5-80GB (cluster "makau"), micro batch 16, world batch 1024 |

## Arquitectura y entrenamiento

Arquitectura GPT-NeoX estandar de Pythia-410M: transformer decoder-only con atención causal, sin mezcla de expertos ni componentes de estado recurrente. El factor diferencial no es la arquitectura sino el esquema de inicialización: `scaled_orthogonal`, en lugar del `pythia` original (combinación de `small_init` y `wang_init` de GPT-NeoX). El autor advierte que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, y que el esquema `pythia` iguala la *distribución* por tensor de `EleutherAI/pythia-410m` en la revisión `step0`, verificado en `tests/test_pythia_step0_init_match.py`.

La receta de entrenamiento es identica a la de Pythia-410M salvo semilla e inicialización: AdamW con lr 3e-4, betas (0,9; 0,95), weight decay 0,1 sin decaimiento en LayerNorm ni sesgos, recorte de gradiente 1,0, schedule coseno de 3e-4 a 3e-5 en 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros fp32 y world batch de 1.024 secuencias × 2.048 tokens, independiente del numero de GPUs. Con esos valores, el computo total asciende a unos 300.000 millones de tokens, el mismo presupuesto que el modelo Pythia original. No se documentan fases de RLHF, DPO, SFT ni instrucciones; es un preentrenamiento puro. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atención lineal, etc.).

## Capacidades

- Modelado de lenguaje autoregresivo: continuación de texto y puntuación de verosimilitud (perplexity, log-probabilities) sobre texto en inglés.
- Evaluación de trayectorias de entrenamiento: cada rama `stepN` permite analizar el estado del modelo en un paso concreto (0 a 512 con densidad alta, y cada 100 pasos después).
- Estudio del espacio de pesos: comparaciones entre semillas y esquemas de inicialización bajo una receta fija.
- Base para fine-tuning supervisado en tareas downstream en inglés (clasificación, extracción, generación acotada).
- Extracción de representaciones internas (hidden states, atenciones) para investigación en interpretabilidad mecanicista, al estilo de la suite Pythia.
- No soporta tool calling ni function calling: no hay plantilla de chat, ni entrenamiento en instrucciones, ni tokens especiales de herramienta.
- No soporta comportamiento agéntico ni razonamiento multi-paso fiable; sin alineamiento, el modelo no sigue instrucciones de forma consistente.
- Capacidades multilingües muy limitadas, practicamente restringidas al inglés.
- Sin modo "thinking", visión, audio ni modalidades adicionales.

## Casos de uso

- **Investigación en interpretabilidad mecanicista**: cargar una rama `stepN` concreta para estudiar cómo evolucionan circuitos, cabezas de atención o direcciones latentes a lo largo del entrenamiento, con la ventaja de disponer de checkpoints intermedios densos en los primeros 512 pasos.
- **Análisis de sensibilidad a la inicialización**: comparar esta ejecución (`scaled_orthogonal`, semilla 11) con la receta `pythia` y otras semillas de la misma campaña manteniendo constantes datos, orden de tokens e hiperparámetros; es un diseño experimental controlado, no una comparación ad hoc.
- **Estudios de dinámica de entrenamiento y leyes de escala**: usar los checkpoints intermedios para medir la aparición de habilidades, la evolución de la pérdida por dominio del Pile o la estabilidad del optimizador en las primeras fases.
- **Reproducibilidad de recetas abiertas**: verificar la implementación del pipeline Pythia (stream de datos pre-shuffled, batch fijo de 1.024 × 2.048, schedule coseno) en un clúster propio con 4 × H100 y servir como referencia de auditoría del código de entrenamiento.
- **Baseline para fine-tuning en inglés**: partir de los pesos finales (`main`) o de un checkpoint intermedio para tareas de clasificación o extracción donde 410M parámetros y 2.048 tokens de contexto sean suficientes, con coste de ajuste muy bajo.
- **Evaluación de la fidelidad de la inicialización**: ejecutar pruebas tipo `test_pythia_step0_init_match.py` para comprobar que una implementación propia reproduce la distribución de pesos de `EleutherAI/pythia-410m` en el paso 0.
- **Banco de pruebas de herramientas de perfilado de pesos**: al ser una arquitectura GPT-NeoX pequeña y bien documentada, sirve para validar pipelines de fusión de checkpoints, conversión de formato o análisis espectral de matrices de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones (MMLU, HumanEval, GSM8K, LAMBADA ni pérdida sobre el Pile) para esta ejecución concreta, y el repositorio solo contiene pesos y procedencia (`campaign.json`). Cualquier cifra atribuida a este checkpoint requeriría evaluarlo por separado; no se deben extrapolar los numeros publicados para `EleutherAI/pythia-410m`.

## Requisitos de hardware

- VRAM para inferencia en float16: aproximadamente 0,8 GB solo de pesos; con caché KV para 2.048 tokens y activaciones, un presupuesto realista de 2-3 GB (estimacion, no medida publicada por el autor).
- VRAM en float32: unos 1,6 GB de pesos; en torno a 3-4 GB con contexto completo (estimacion).
- GPU recomendadas para servir el modelo: cualquier GPU con 4 GB o mas; RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, L4, A10G, A100 y H100 son sobredimensionadas para inferencia pero adecuadas para lotes grandes.
- Cabe holgadamente en GPU de consumo: si, en GTX 1660 Super 6 GB, RTX 3050 8 GB, RTX 3060, RTX 4060/4070/4080/4090.
- Despliegue: `transformers` con `GPTNeoXForCausalLM` (libreria indicada en el repo), vLLM y TGI para servicio con batching continuo, llama.cpp/Ollama tras conversion a GGUF (conversion tecnicamente posible por ser GPT-NeoX estandar, pero no publicada ni verificada en este repositorio).
- Almacenamiento: el repositorio completo ocupa 53,5 GB por acumulacion de ramas; conviene descargar solo la revision necesaria (`revision="step1000"`, etc.) para no replicar todo el historial.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Entrenamiento (referencia de la propia campaña): 1 nodo con 4 × H100-SXM5-80GB, micro batch 16 y world batch 1024.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Inicializacion / semilla | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (DIET, seed 11) | 410M | 2.048 | Pile pre-shuffled, ~300B tokens, orden Pythia | `scaled_orthogonal`, semilla 11 | Apache 2.0 | Repo con ramas `stepN` |
| EleutherAI/pythia-410m | 410M | 2.048 | Pile, ~300B tokens | `pythia` (small_init + wang_init) | Apache 2.0 | Modelo base oficial, muy extendido |
| EleutherAI/pythia-410m-deduped | 410M | 2.048 | Pile deduplicado globalmente, ~300B tokens | `pythia` | Apache 2.0 | Modelo base oficial |
| Otras ejecuciones de la campana DIET | 410M | 2.048 | Identicos, mismo orden de tokens | Otros esquemas / semillas | Apache 2.0 (presumible) | No disponible el listado completo en la informacion proporcionada |

La comparacion relevante es de control experimental, no de calidad: los tres primeros comparten arquitectura, tokenizador y presupuesto de computo, y difieren en inicializacion (y, en el caso deduped, en el corpus). No hay datos de rendimiento publicados para este checkpoint que permitan afirmar equivalencia o mejora frente a `pythia-410m`.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no sigue instrucciones, no tiene plantilla de chat y puede generar contenido toxico, sesgado o factualmente incorrecto presente en The Pile.
- Riesgo alto de alucinacion en uso generativo: sin RLHF ni verificacion, no debe desplegarse en atencion al cliente ni en flujos de decision sin salvaguardas adicionales.
- Solo ingles: el soporte de otros idiomas, incluido el castellano, es residual y no evaluado.
- Contexto limitado a 2.048 tokens; no admite documentos largos ni conversaciones multi-turno extensas sin truncado.
- Capacidad bruta limitada por tamano: 410M parametros ofrecen rendimiento bajo en razonamiento multi-paso, matematicas y generacion de codigo comparado con modelos actuales.
- Repositorio de 53,5 GB: descargar la rama `main` sin fijar `revision` puede replicar decenas de checkpoints innecesarios.
- Pesos solo en float16: no hay versiones cuantizadas oficiales; la conversion a GGUF o GPTQ correria por cuenta del usuario y sin garantias del autor.
- La model card no documenta evaluaciones de sesgo, toxicidad ni seguridad; no hay tarjeta de datos ni analisis de riesgos.
- Licencia Apache 2.0 permite uso comercial, pero el estado del artefacto (checkpoint de investigacion, ramas de paso parcial) hace desaconsejable su uso en produccion sin una evaluacion propia.
- La reproducibilidad bit a bit de la inicializacion respecto a EleutherAI no esta garantizada entre frameworks; el autor solo reclama equivalencia distribucional por tensor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jjalora/diet-traj-pythia-410m-scaled-orthogonal-seed11
- Pythia-410M oficial: https://huggingface.co/EleutherAI/pythia-410m
- Repositorio de codigo y recetas Pythia: https://github.com/EleutherAI/pythia
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Paper de la suite Pythia: https://arxiv.org/abs/2304.01373
- Conversion a otros formatos (referencia de la comunidad): https://huggingface.co/Xenova/pythia-410m
