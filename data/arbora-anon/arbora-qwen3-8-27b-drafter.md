# arbora-anon/arbora-qwen3.8-27b-drafter

## Resumen

Arbora Qwen3.8-27B drafter es un modelo borrador (drafter) especializado para decodificación especulativa, desarrollado por el autor anónimo arbora-anon como parte del material de código del artículo "Arbora: Unleashing the Parallelism of Block Diffusion Drafters in Speculative Decoding", actualmente en revisión anónima. No es un modelo de propósito general: su función es proponer tokens candidatos que un modelo objetivo de mayor tamaño (z-lab/Qwen3.8-27B-DFlash2, de 27 000 millones de parámetros) verifica en paralelo, acelerando así la generación sin alterar la distribución de salida del modelo grande.

El modelo parte del checkpoint z-lab/Qwen3.8-27B-DFlash2 y se entrena durante tres épocas adicionales sobre respuestas generadas por el propio modelo objetivo. Incorpora copias de la matriz de embeddings y de la cabeza de salida del modelo objetivo, lo que explica que, pese a tener 4 467 201 280 parámetros totales (aproximadamente 4,47 mil millones), el repositorio ocupe 8,9 GB en safetensors: el drafter reutiliza esas matrices compartidas en lugar de aprenderlas desde cero.

Su relevancia es acotada pero técnica: se publica como artefacto de investigación reproducible para el ecosistema SGLang, con un script de exportación específico (`training/path_scorer/export_d2_for_sglang.py`) que genera el layout de servicio bajo el nombre local `qwen3.8-27b-drafter`. No está pensado para inferencia autónoma ni para uso directo como chatbot, sino como componente de un pipeline de decodificación especulativa junto a su modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificación especulativa (block diffusion drafter, layout "speculators"); arquitectura interna no detallada en la información disponible |
| Parametros totales | 4 467 201 280 (4,47 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con copias de embeddings y cabeza de salida del modelo objetivo; exportación adicional al layout SGLang |
| Modelo base | z-lab/Qwen3.8-27B-DFlash2 |
| Tamano del repositorio | 8,9 GB |
| Configuracion | `config.json` con formato de configuracion "speculators" |

## Arquitectura y entrenamiento

El modelo es un drafter de difusión por bloques (block diffusion drafter) diseñado para explotar el paralelismo en decodificación especulativa, según el título del artículo asociado. En lugar de generar candidatos token a token de forma autorregresiva, un drafter de difusión por bloques propone bloques completos de tokens que el modelo objetivo verifica después. El checkpoint se distribuye con el layout denominado "speculators" y contiene copias de la matriz de embeddings y de la cabeza de salida del modelo objetivo (z-lab/Qwen3.8-27B-DFlash2), lo que permite alinear el espacio de tokens del drafter con el del verificador sin duplicar el coste de aprendizaje de esas matrices.

El entrenamiento parte del checkpoint z-lab/Qwen3.8-27B-DFlash2 y añade tres épocas adicionales. Los datos de entrenamiento son respuestas generadas por el propio modelo objetivo a partir de una colección de prompts que el autor no publica; el release de código describe la receta y los scripts que permiten reconstruir los datos de entrenamiento a partir de cualquier fichero de prompts. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (en un drafter de este tipo el objetivo habitual es la destilación de la distribución del objetivo, pero el detalle no se documenta en la model card).

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: propone bloques de tokens que el modelo objetivo verifica en paralelo.
- Aceleración de inferencia del modelo objetivo z-lab/Qwen3.8-27B-DFlash2 sin modificar su distribución de salida (la verificación garantiza equivalencia con la decodificación del objetivo).
- Integración con SGLang mediante el script de exportación incluido en el release de código.
- Reutilización del vocabulario y de la cabeza de salida del modelo objetivo, lo que facilita la compatibilidad de tokenizador.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo "thinking": no es un modelo de propósito general.
- Capacidades multilingües: no disponibles (dependen del vocabulario del modelo objetivo, no documentado en esta ficha).

## Casos de uso

- Aceleración de servicio de LLM en producción: desplegar el drafter junto a z-lab/Qwen3.8-27B-DFlash2 en SGLang para reducir la latencia por token en cargas de generación larga, aprovechando que el drafter propone bloques de tokens verificados en paralelo por el modelo grande.
- Reducción de coste por token en APIs de inferencia: al aumentar el número de tokens aceptados por paso de verificación, se reduce el número de pasos del modelo objetivo y, con ello, el coste computacional por respuesta generada.
- Investigación en decodificación especulativa: servir como punto de partida reproducible para experimentos con drafters de difusión por bloques, ya que el release incluye la receta y los scripts para reconstruir los datos de entrenamiento desde cualquier fichero de prompts.
- Reproducción de resultados del artículo Arbora: el checkpoint permite replicar los experimentos del paper en revisión anónima y comparar el rendimiento del drafter frente a alternativas autorregresivas.
- Ajuste fino adicional del drafter: al entrenarse "desde este directorio" según la model card, sirve como inicialización para adaptar el drafter a un dominio concreto (por ejemplo, código o texto jurídico) regenerando datos con el modelo objetivo sobre prompts del dominio.
- Evaluación de pipelines de serving: útil para equipos que quieran medir la ganancia real de la decodificación especulativa en su infraestructura (SGLang) antes de adoptarla en producción, con un drafter alineado al vocabulario del objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de tasa de aceptación (acceptance rate), speedup ni comparaciones numéricas con otros drafters.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 8,9 GB (aproximadamente 8,3 GB en precisión de 16 bits para 4,47 B de parámetros, más las copias de embeddings y cabeza de salida del objetivo). En FP16 se requiere del orden de 9-10 GB de VRAM solo para el drafter; en BF16, similar.
- El drafter debe co-residir con el modelo objetivo (27 B), por lo que el requisito agregado de VRAM lo determina principalmente el objetivo, no el drafter.
- GPU recomendadas: para el conjunto drafter + objetivo de 27 B en BF16 se necesitan GPUs de clase A100/H100 de 80 GB o múltiples GPUs; el drafter por sí solo cabe en una RTX 4090 (24 GB) o A10G (24 GB).
- Cabe en GPU de consumo: el drafter aislado sí (RTX 4090, RTX 3090 de 24 GB); el sistema completo con el objetivo de 27 B no cabe en una única GPU de consumo en BF16.
- Opciones de despliegue: SGLang, mediante el script `training/path_scorer/export_d2_for_sglang.py` que genera el layout de servicio. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen de la tasa de aceptación del drafter y del hardware del objetivo, y no se publican cifras en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de drafters comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de contexto estructural:

| Modelo | Parametros | Contexto | Licencia | Rol |
|---|---|---|---|---|
| arbora-qwen3.8-27b-drafter | 4,47 B | no disponible | Apache 2.0 | Drafter de decodificación especulativa para z-lab/Qwen3.8-27B-DFlash2 |
| z-lab/Qwen3.8-27B-DFlash2 | 27 B (según nombre; no verificado en la información) | no disponible | no disponible | Modelo objetivo que verifica las propuestas del drafter |
| Otros drafters de la familia Qwen | no disponible | no disponible | no disponible | Alternativas de la misma categoría |

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo objetivo z-lab/Qwen3.8-27B-DFlash2 no produce salidas útiles; su uso aislado carece de sentido.
- Los datos de entrenamiento no se publican: la colección de prompts utilizada no está disponible, lo que limita la reproducibilidad exacta del entrenamiento (aunque el release incluye scripts para reconstruir datos desde cualquier fichero de prompts).
- Riesgo de alucinación: las propuestas del drafter son verificadas por el objetivo, por lo que la calidad final depende del objetivo; aun así, una baja tasa de aceptación degrada el speedup y puede hacer que la decodificación especulativa sea más lenta que la decodificación estándar.
- Sesgos conocidos: no documentados; al derivar del modelo objetivo, hereda los sesgos de este, no evaluados en la información disponible.
- Limitaciones de contexto e idioma: no documentadas; dependen del modelo objetivo.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse los avisos de terceros recogidos en el fichero `NOTICE` del repositorio.
- Estado de investigación: asociado a un artículo en revisión anónima, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente.
- Despliegue restringido: solo se documenta el layout SGLang; no hay soporte declarado para otros motores de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3.8-27b-drafter
- Modelo base: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Código y instrucciones del paper (revisión anónima): https://anonymous.4open.science/r/arbora-7ABE
