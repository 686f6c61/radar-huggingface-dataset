# scar-on/CoMem-Qwen3-4B

## Resumen

CoMem-Qwen3-4B es un conjunto de checkpoints de adaptadores publicado por el usuario scar-on sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No se trata de un modelo completo con pesos autónomos, sino de un paquete que contiene los adaptadores CoMem (encoder y decoder) junto con las capas de embedding de entrada y de salida necesarias para un tokenizador expandido. El repositorio, de 4,9 GB, no incluye los pesos del modelo base Qwen3-4B, que deben obtenerse por separado y sujetos a sus propios términos.

La propuesta técnica es la compresión de contexto mediante adaptadores entrenados con tasas de compresión de 32, organizados en dos etapas: `stage1` entrena los adaptadores de encoder y decoder, mientras que `stage2` congela el adaptador de encoder y entrena únicamente el de decoder. El paquete se distribuye bajo una licencia personalizada denominada `comem-mixed-source-terms`, que incorpora porciones de código de investigación de Apple (ml-clara).

Su relevancia es limitada y experimental: no hay pipeline declarado, no se documentan idiomas soportados ni resultados de benchmarks, y el número de descargas y likes es cero en el momento de la consulta. Está orientado a investigadores que quieran reproducir o evaluar el método CoMem sobre un modelo instruct de 4B parámetros, no a un uso directo en producción sin trabajo adicional de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores CoMem (encoder/decoder) sobre transformer Qwen3-4B-Instruct-2507; incluye capas de embedding de entrada/salida para tokenizador expandido |
| Parametros totales | no disponible (el repo contiene solo adaptadores y capas de embedding; los pesos base no se incluyen) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | comem-mixed-source-terms (other) |
| Formato de pesos | `.pth` (adapters.pth, decoder_first_last_layers.pth), config.json y ficheros de tokenizer |

## Arquitectura y entrenamiento

El modelo se apoya en Qwen3-4B-Instruct-2507 como base congelada y añade adaptadores CoMem para comprimir el contexto. Según la model card, existen dos etapas con tasa de compresión 32: en `stage1` se entrenan conjuntamente los adaptadores de encoder y decoder; en `stage2` se congela el adaptador de encoder y se entrena solo el decoder. Cada checkpoint se ubica en `stage{number}/cr32` e incluye `config.json`, `adapters.pth`, `decoder_first_last_layers.pth` y los ficheros del tokenizador.

La implementación se distribuye a través del repositorio CoMem y del módulo `openrlhf.models.modeling_comem`, con una API de carga basada en `CoMem.from_pretrained(..., subfolder="stage2/cr32", pure_inference=True)`. El código incorpora porciones derivadas de Apple ml-clara, cuyos avisos de copyright se mantienen en los ficheros afectados. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento posteriores.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3-4B-Instruct-2507 (no verificados de forma independiente en este paquete).
- Compresión de contexto mediante adaptadores CoMem con tasa 32, orientada a reducir la huella de contextos largos.
- Soporte de tokenizador expandido, con capas de embedding de entrada y salida incluidas en el checkpoint.
- Carga en modo `pure_inference` para evaluación sin entrenamiento adicional.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking específicas de este paquete.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre compresión de contexto: usar los checkpoints `stage1/cr32` y `stage2/cr32` para reproducir los experimentos de CoMem y comparar la calidad de reconstrucción frente al contexto sin comprimir.
- Evaluación de adaptadores sobre modelo base: cargar el paquete con `pure_inference=True` junto a los pesos de Qwen3-4B-Instruct-2507 para medir la degradación introducida por la tasa de compresión 32 en tareas de razonamiento.
- Estudio de tokenizadores expandidos: analizar cómo afectan las capas de embedding de entrada/salida incluidas en el checkpoint al rendimiento en generación de texto.
- Prototipado de pipelines de contexto largo: integrar el adaptador en un entorno de investigación para procesar documentos extensos con menor coste de atención, validando antes la calidad en el dominio concreto.
- Reproducibilidad académica: servir como artefacto de referencia para comparar variantes de compresión de memoria en modelos de 4B parámetros.
- Base para fine-tuning posterior: partir del adaptador de decoder de `stage2` y continuar el entrenamiento en un dominio específico, dado que el encoder permanece congelado en esa etapa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el paquete; depende enteramente de los pesos de Qwen3-4B-Instruct-2507 que se carguen por separado (el repo de adaptadores ocupa 4,9 GB).
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base de 4B parámetros es en principio apto para GPUs de consumo con cuantización, pero el paquete no documenta cuantizaciones ni formatos GGUF.
- Opciones de despliegue: carga vía `openrlhf.models.modeling_comem` con `CoMem.from_pretrained`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoMem-Qwen3-4B | Adaptadores sobre base de 4B (pesos base no incluidos) | no disponible | Compresión de contexto con adaptadores CoMem (cr32) | comem-mixed-source-terms | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en esta ficha | Modelo instruct base | Términos de Qwen | Hugging Face (modelo base) |
| Apple ml-clara (código de referencia) | no disponible | no disponible | Investigación sobre compresión de contexto | Términos de Apple | Repositorio GitHub |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye los pesos del modelo base Qwen3-4B-Instruct-2507; sin ellos el checkpoint no es funcional por sí solo.
- Licencia personalizada `comem-mixed-source-terms`: es imprescindible revisar el LICENSE del repositorio CoMem y los términos del modelo base antes de cualquier uso comercial.
- Incorpora código derivado de Apple ml-clara con avisos de copyright de terceros que deben mantenerse.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; no hay evaluación independiente publicada.
- Ausencia total de benchmarks: no es posible estimar la pérdida de calidad asociada a la tasa de compresión 32.
- El pipeline no está declarado y el formato de pesos (`.pth`) no es directamente compatible con servidores de inferencia habituales (vLLM, TGI, llama.cpp).
- Con 0 descargas y 0 likes, no existe validación comunitaria del artefacto; trátese como material experimental de investigación.
- No se especifica la longitud de contexto efectiva tras la compresión, lo que impide planificar su uso en escenarios de contexto largo reales.

## Enlaces

- Hugging Face: https://huggingface.co/scar-on/CoMem-Qwen3-4B
- Repositorio CoMem: https://github.com/scar-on/CoMem
- Licencia CoMem: https://github.com/scar-on/CoMem/blob/master/LICENSE
- Agradecimientos y avisos de terceros: https://github.com/scar-on/CoMem/blob/master/ACKNOWLEDGEMENTS
- Código de referencia de Apple ml-clara: https://github.com/apple/ml-clara
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
