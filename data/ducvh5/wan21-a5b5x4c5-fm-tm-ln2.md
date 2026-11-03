# ducvh5/wan21-a5b5x4c5-fm-tm-ln2

## Resumen

Este repositorio contiene un checkpoint derivado de Wan2.1-T2V-1.3B, el modelo de generación de vídeo a partir de texto de código abierto publicado por Wan-AI (Alibaba). El autor, identificado como `ducvh5`, ha aplicado una modificación arquitectónica sobre el transformer de difusión original: una estructura recurrente de bloques que reorganiza el modelo en 15 bloques únicos ejecutados 30 veces (patrón A5 → B5×4 → C5), sustituyendo presumiblemente la pila lineal convencional por un esquema con reutilización de pesos.

El modelo se distribuye en formato `diffusers` con pesos `safetensors` y un estado de entrenamiento adicional en PyTorch (`state.pt`), lo que indica que se trata de un checkpoint intermedio de investigación más que de un modelo listo para producción. El repositorio ocupa 23,1 GB e incluye los seis conjuntos de pesos EMA y no-EMA retenidos durante el entrenamiento.

La relevancia de esta ficha es limitada pero concreta: documenta una variante experimental de un modelo text-to-video de 1.300 millones de parámetros con recurrencia en bloques, útil para investigadores que estudien eficiencia paramétrica en modelos de difusión para vídeo. No hay métricas publicadas, ni licencia declarada, ni idiomas especificados, lo que condiciona su uso en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión recurrente por bloques (derivado de Wan2.1-T2V-1.3B); esquema A5 → B5×4 → C5, 15 bloques únicos / 30 ejecutados |
| Parametros totales | 1.300 millones (heredados del modelo base Wan2.1-T2V-1.3B; no se especifica el recuento exacto tras la reestructuración) |
| Parametros activos | no disponible (no es MoE; la recurrencia reutiliza pesos, no activa subconjuntos) |
| Longitud de contexto | no disponible (modelo text-to-video; la longitud se refiere a frames, no especificada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors de precisión nativa; sin variantes GGUF/FP8 documentadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (diffusers) + `step0016000/state.pt` (estado de entrenamiento PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B-Diffusers, un transformer de difusión para generación de vídeo desde texto. La modificación introducida reorganiza los bloques en una secuencia recurrente: cinco bloques del grupo A, seguidos de cinco bloques del grupo B ejecutados cuatro veces (B5×4) y cinco bloques del grupo C, resultando en 15 bloques con pesos únicos pero 30 ejecuciones efectivas. Este esquema de recurrencia por segmentos reduce el número de parámetros únicos manteniendo la profundidad efectiva de cómputo, una técnica análoga a la compartida de capas en transformers pero aplicada de forma selectiva por tramos.

El entrenamiento emplea una pérdida combinada denotada como FM+TM (probablemente flow matching más un término adicional de regularización o matching temporal, aunque la model card no lo detalla). El schedule de ruido usa una distribución log-normal estándar, σ ~ LN(0,1), con un factor de desplazamiento (`shift`) de 2 y una parametrización temporal t = 1000σ. Los datos de entrenamiento se etiquetan como "OV" sin más especificación. El checkpoint publicado corresponde al paso 16.000 (`step0016000/state.pt`) y se conservan los seis conjuntos de pesos EMA y no-EMA, lo que sugiere que el autor mantiene el estado completo para reanudar entrenamiento o comparar variantes.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), heredada del pipeline de Wan2.1-T2V-1.3B.
- Ejecución mediante la librería `diffusers`, con pipeline compatible con el modelo base.
- Recurrencia de bloques que permite una profundidad efectiva de 30 bloques con solo 15 conjuntos de pesos únicos.
- Checkpoint de investigación con estado de entrenamiento completo (`state.pt`), útil para fine-tuning posterior.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles (la model card no especifica idiomas de los prompts).

## Casos de uso

- Investigación en eficiencia paramétrica: el esquema A5 → B5×4 → C5 permite estudiar cómo afecta la reutilización de pesos por tramos a la calidad de generación de vídeo, comparando contra el Wan2.1-T2V-1.3B original con el mismo presupuesto de cómputo.
- Reproducción de experimentos de difusión: al incluir `step0016000/state.pt` y los seis conjuntos EMA/no-EMA, un equipo puede reanudar el entrenamiento o analizar la evolución de los pesos en el paso 16.000.
- Fine-tuning sobre dominios específicos: al estar en formato `diffusers` con safetensors, se puede cargar con las herramientas estándar y adaptar a un dataset propio de vídeo, partiendo de un modelo de 1,3B parámetros que cabe en GPUs de 24 GB en precisión reducida.
- Estudio de schedules de ruido: la parametrización σ ~ LN(0,1) con shift=2 y t=1000σ es un punto de partida concreto para experimentos sobre flow matching en vídeo.
- Comparación de arquitecturas recurrentes vs. lineales: el checkpoint sirve como referencia para medir la degradación o mejora introducida por la recurrencia en tareas de text-to-video.
- Docencia y divulgación: un modelo pequeño (1,3B) con estructura modificada y estado de entrenamiento accesible es adecuado para explicar difusión, recurrencia y EMA en cursos avanzados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Wan2.1-T2V-1.3B requiere aproximadamente 8-12 GB en FP16 para los pesos; el repositorio de 23,1 GB incluye múltiples checkpoints EMA/no-EMA y el estado de entrenamiento, por lo que la inferencia solo necesita cargar uno de los conjuntos de pesos.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para entrenamiento o fine-tuning; para inferencia en FP16 una RTX 3090/4090 es suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090, RTX 4090 y GPUs con 16 GB o más, dado el tamaño de 1,3B parámetros del modelo base.
- Opciones de despliegue: `diffusers` (pipeline oficial), con posibilidad de exportar a otros runners; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / frames | Licencia | Disponibilidad |
|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-fm-tm-ln2 | ~1,3B (15 bloques únicos / 30 ejecutados) | no disponible | no disponible | HuggingFace, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1,3B | no disponible en esta ficha | Apache 2.0 (modelo base, según su card original) | HuggingFace, ampliamente utilizado |
| Modelos text-to-video de mayor tamaño (p. ej. variantes de 5B-14B) | 5B-14B | mayor resolución y duración | variable | HuggingFace |

La comparación directa con alternativas de la misma categoría (text-to-video de ~1,3B) es limitada porque no se han publicado métricas de este checkpoint. Frente al modelo base Wan2.1-T2V-1.3B, la diferencia principal es arquitectónica (recurrencia por bloques) y de estado de entrenamiento (paso 16.000), no de capacidades documentadas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o consultar la licencia del modelo base (Wan2.1) antes de cualquier despliegue en producción.
- Sin benchmarks ni evaluación cualitativa publicada: no hay evidencia de que la modificación recurrente mejore o degrade la calidad respecto al modelo base.
- Modelo de investigación: 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria.
- Idiomas no especificados: se desconoce el soporte multilingüe de los prompts.
- Riesgo de alucinación visual y artefactos: inherente a los modelos de difusión de vídeo, especialmente en escenas con movimiento complejo o texto en pantalla.
- Sesgos: no documentados, pero heredados previsiblemente del dataset de entrenamiento del modelo base ("OV", sin especificar).
- Estado de entrenamiento incluido (`state.pt`): el repositorio contiene checkpoints intermedios y EMA/no-EMA, lo que puede confundir sobre qué pesos usar para inferencia; hay que seleccionar explícitamente el conjunto adecuado.
- Sin garantías de compatibilidad futura con versiones de `diffusers` posteriores a la publicación.

## Enlaces

- [HuggingFace: ducvh5/wan21-a5b5x4c5-fm-tm-ln2](https://huggingface.co/ducvh5/wan21-a5b5x4c5-fm-tm-ln2)
- [Modelo base: Wan-AI/Wan2.1-T2V-1.3B-Diffusers](https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers)
- [Repositorio oficial de Wan2.1 (GitHub)](https://github.com/Wan-Video/Wan2.1)
- [Documentación de diffusers](https://huggingface.co/docs/diffusers)
