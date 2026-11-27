# adpretko/celerity-271m-8k-tpp-ablation-ad0p4-ild-tpp4

## Resumen

Celerity 271M 8K es un checkpoint de investigación de un modelo de lenguaje de 271 millones de parámetros entrenado por Cerebras y publicado en Hugging Face por el usuario adpretko. Se trata de una ablación concreta dentro de una familia de experimentos de escalado (TPP, *tokens per parameter*) cuyo objetivo es estudiar el efecto de distintas tasas de *attention dropout* sobre el entrenamiento. La variante aquí documentada corresponde al experimento `ad0.4_ild_tpp4`, con un *endpoint* de dropout de atención de 0,4 y un presupuesto nominal de 4 tokens por parámetro.

El modelo emplea una arquitectura transformer con embeddings posicionales ALiBi y una longitud máxima de secuencia de 8192 tokens. Ha sido entrenado sobre CommonPile (pool TPP corregido sin repeticiones) durante 4722 pasos, lo que equivale a aproximadamente 1083 millones de tokens vistos con un batch global de 28. El checkpoint original de Cerebras (`checkpoint_4722.mdl`) se ha convertido al formato de Hugging Face mediante una herramienta de conversión concreta (commit `0e3d5d3`).

Su relevancia es fundamentalmente metodológica: no es un modelo pensado para producción, sino un artefacto de investigación que permite reproducir y analizar el impacto de la programación de dropout dependiente de capa en modelos pequeños con contexto largo. La información pública disponible es muy limitada (sin model card extendida, sin benchmarks, sin licencia declarada), por lo que muchos campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con embeddings posicionales ALiBi |
| Parametros totales | 271 millones (según nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,5 GB; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con embeddings posicionales ALiBi, lo que permite extrapolación posicional más allá de la longitud vista durante el entrenamiento y es coherente con la ventana de 8192 tokens declarada. El entrenamiento se realizó en infraestructura Cerebras (2 sistemas CSX) usando el runtime `cbcore 2.6.0`, con un batch global de 28 y una tasa de aprendizaje pico de 0,15. La configuración incluye weight decay de 0,003618, `tau_ema` de 0,3902 y ausencia total de residual dropout, stochastic depth y LayerDrop.

La innovación principal del checkpoint es la programación de *attention dropout*: la tasa de 0,4 no es un valor uniforme, sino el extremo de una programación lineal dependiente de la capa (`linear layer-dependent dropout schedule`). El dataset es CommonPile, en su variante "corrected no-repeat TPP pool", y el presupuesto nominal es de 4 tokens por parámetro (aproximadamente 1083 millones de tokens en 4722 pasos). No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación posterior al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva básica, propia de un modelo de 271M parámetros entrenado sobre ~1,1B tokens.
- Manejo de contexto largo de hasta 8192 tokens gracias a ALiBi.
- Capacidad multilingüe: no disponible (no se declara composición idiomática del dataset).
- Tool calling / function calling: no disponible; no se documenta ningún formato de herramientas.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo *thinking*, visión o audio: no disponible.
- El modelo debe cargarse con `trust_remote_code=True`, lo que implica código personalizado en el repositorio; conviene auditar dicho código antes de ejecutarlo.

## Casos de uso

- Investigación sobre programación de dropout: el caso de uso principal es reproducir el experimento `ad0.4_ild_tpp4` y comparar curvas de pérdida frente a otras ablaciones de la misma familia Celerity.
- Estudio de ALiBi en contextos largos: permite analizar el comportamiento de un modelo pequeño con ventana de 8192 tokens en tareas de recuperación de información dentro del contexto.
- Baseline en experimentos de escalado TPP: sirve como referencia controlada para estudiar la relación entre tokens por parámetro y calidad en modelos de menos de 300M.
- Fine-tuning académico de bajo coste: su tamaño (0,5 GB de repo) permite ajustarlo en una única GPU de consumo para tareas de clasificación o generación acotada.
- Evaluación de pipelines de conversión Cerebras → Hugging Face: útil para validar la herramienta de conversión (commit documentado) y detectar discrepancias numéricas entre el checkpoint original y el convertido.
- Docencia y prototipado de inferencia: adecuado para demostrar carga con `trust_remote_code`, gestión de contexto largo y evaluación con `model.eval()` (que desactiva el dropout).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,55 GB solo para pesos (271M × 2 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 2 GB para contextos moderados.
- VRAM estimada en fp32: aproximadamente 1,1 GB para pesos.
- Con contexto completo de 8192 tokens, el KV cache crece de forma lineal con la longitud; para un modelo de este tamaño sigue siendo manejable en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090, A100, H100). No requiere hardware de datacenter.
- Cabe holgadamente en GPU de consumo; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al requerir `trust_remote_code=True` y código personalizado, la integración con vLLM, llama.cpp, Ollama o TGI no está garantizada y no se documenta en la información disponible. La vía segura es PyTorch con `transformers` y `trust_remote_code=True`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (ad0.4_ild_tpp4) | ~271M | 8192 | no disponible | Hugging Face (repo de 0,5 GB) |
| Alternativas de ~270M tipo GPT-2 medium / OPT-350M | 350M / 350M | 1024 / 2048 | MIT / OPT license | Ampliamente disponibles |
| Modelos pequeños con contexto largo (p. ej. variantes ALiBi) | variable | variable | variable | variable |

No se dispone de datos de rendimiento comparativo para este checkpoint, por lo que la comparación se limita a parámetros, contexto y licencia. Cualquier afirmación sobre calidad relativa frente a GPT-2 medium u OPT-350M sería especulativa y no se incluye.

## Limitaciones y advertencias

- Modelo de investigación: entrenado con ~1,1B tokens, muy por debajo de los volúmenes habituales en modelos de producción; la calidad esperada es baja en tareas abiertas.
- Sin fase de alineación documentada (RLHF/DPO no disponibles), por lo que puede generar contenido sesgado, tóxico o no deseado.
- Riesgo elevado de alucinación y de degradación fuera de distribución.
- Idiomas soportados no declarados; el dataset CommonPile no garantiza cobertura multilingüe equilibrada.
- Licencia no disponible: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar antes de usar en entornos sensibles.
- El dropout de atención solo se desactiva con `model.eval()`; usarlo en modo entrenamiento por defecto altera las salidas.
- No hay benchmarks publicados ni evaluación independiente; no debe citarse como referencia de rendimiento.
- El nombre del modelo sugiere 271M parámetros, pero la model card no lo confirma explícitamente; verificar la configuración real al cargar.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p4-ild-tpp4
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
