# AdaptiveChunking/parity_B_ste_s2

## Resumen

parity_B_ste_s2 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución de entrenamiento del proyecto beetle-hnet, un modelo de arquitectura H-Net que opera a nivel de byte (byte-level) y cuyo objetivo declarado en esta variante es "parity". El nombre codifica la configuración experimental: schedule B, estrategia de dechunking "ste" y semilla 2. No es un modelo de lenguaje conversacional ni un modelo publicado para uso general, sino un artefacto de experimentación sobre tokenización dinámica y chunking adaptativo.

El modelo tiene 22.516.992 parámetros totales según los pesos en safetensors, y el repositorio ocupa 2,5 GB, un tamaño desproporcionado respecto al número de parámetros, lo que sugiere que el espacio lo consumen principalmente los estados de entrenamiento reanudables y los múltiples checkpoints intermedios. La model card documenta el entrenamiento como 6000 pasos con batch de 32 y 1024 bytes por muestra, sin idiomas especificados (langs None).

Su relevancia es acotada y de carácter metodológico: sirve para estudiar cómo distintas estrategias de chunking dinámico y de gradiente rectificado (straight-through estimator) afectan al aprendizaje sobre representaciones de bytes, más que para tareas de generación o razonamiento. No se han publicado benchmarks, pipeline ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (hnet), byte-level, con chunking dinámico |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrenamiento con 1024 bytes por muestra) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenamiento con langs None) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez), config.json, training_config.yaml y checkpoint.pt de PyTorch |

## Arquitectura y entrenamiento

La arquitectura es una H-Net de nivel de byte, según los tags del repositorio (byte-level, hnet, beetle-hnet). El modelo emplea chunking dinámico (dynamic-chunking) como mecanismo central, lo que implica que la segmentación de la secuencia de bytes en unidades de cómputo no es fija sino que se aprende o se adapta durante el procesamiento. La variante concreta usa dechunking mediante straight-through estimator (dechunk=ste), una técnica que permite propagar gradientes a través de operaciones de discretización no diferenciables. Los pesos atados se almacenan una única vez en model.safetensors y config.json incluye un mapa tied_weights que relaciona los nombres eliminados con los almacenados.

El entrenamiento se realizó con el schedule B, semilla 2, durante 6000 pasos con batch de 32 y 1024 bytes por muestra, sin especificación de idiomas. El repositorio sigue el layout Beetle con ramas step-N por cada checkpoint conservado según un calendario logarítmico en base 2 (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase de objetivo, más el paso final). Cada rama contiene pesos, configuración, training_config.yaml y el estado completo reanudable del entrenador en training_state/checkpoint.pt. La rama main contiene los pesos y la configuración del último paso, además de log.jsonl, final.json y, una vez finalizada la ejecución, las pruebas de frontera FLORES+ en probe/. No se documentan en la información disponible detalles sobre composición del dataset, volumen de tokens ni uso de RLHF o DPO.

## Capacidades

- Modelo de investigación sobre tokenización y chunking adaptativo a nivel de byte; no se documentan capacidades de generación de texto, razonamiento, código o matemáticas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües; el entrenamiento se realizó con langs None.
- El repositorio incluye pruebas de frontera FLORES+ (probe/) para evaluar el comportamiento de segmentación una vez finalizada la ejecución.
- Pesos atados con mapa explícito en config.json, lo que facilita la reconstrucción del grafo de parámetros.
- Checkpoints reanudables con estado completo del entrenador, orientados a reproducibilidad experimental.

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo permite estudiar cómo el chunking dinámico agrupa secuencias de bytes en comparación con tokenizadores BPE o Unigram fijos, usando los checkpoints intermedios para trazar la evolución de la segmentación.
- Estudio de estimadores straight-through: la variante dechunk=ste hace de este checkpoint un banco de pruebas para analizar la estabilidad del gradiente en operaciones de discretización dentro de arquitecturas H-Net.
- Reproducción de experimentos: el estado reanudable completo en training_state/checkpoint.pt permite retomar el entrenamiento exactamente desde cualquier paso conservado, útil para auditorías de reproducibilidad.
- Análisis de schedules de checkpointing: las ramas step-N con calendario log2 permiten comparar el efecto de la frecuencia de guardado y de las fases de objetivo sobre la convergencia.
- Evaluación de fronteras de segmentación con FLORES+: los probes incluidos permiten medir cómo el modelo delimita unidades lingüísticas en textos multilingües, aunque el entrenamiento no haya especificado idiomas.
- Comparación de semillas y variantes: al estar etiquetado con seed 2 y schedule B, sirve como punto de comparación frente a otras ejecuciones de la misma familia publicadas por la organización.
- Base para experimentos de compresión de vocabulario: al operar sobre bytes sin vocabulario explícito, es un punto de partida para investigar modelos con huella de embedding reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 millones de parámetros, los pesos en precisión completa ocupan aproximadamente 90 MB (22,5 M × 4 bytes); en fp16 unos 45 MB. La VRAM adicional depende de las activaciones y de la longitud de secuencia, no documentadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM debería poder cargar los pesos; para entrenamiento o evaluación con lotes de 1024 bytes se recomienda una GPU de gama media o superior (RTX 3060, RTX 4090, A100).
- Cabe holgadamente en GPU de consumo: RTX 3050, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: al ser un checkpoint PyTorch con safetensors y depender del código de beetle-hnet, el despliegue requiere cargar la implementación del repositorio de GitHub; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El repositorio de 2,5 GB implica que la descarga completa incluye estados de entrenamiento, no solo pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parity_B_ste_s2 | 22,5 M | no disponible | H-Net byte-level con chunking dinámico y STE | Apache 2.0 | Hugging Face (AdaptiveChunking) |
| Otras ejecuciones de AdaptiveChunking (misma familia) | no disponible | no disponible | Variantes de schedule, dechunk y semilla | Apache 2.0 | Hugging Face (misma organización) |
| Tokenizadores BPE/Unigram estándar | no aplica | no aplica | Segmentación estática basada en vocabulario | variable | Amplia |

No se dispone de información sobre modelos comparables de terceros con la misma arquitectura o el mismo objetivo experimental en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje listo para producción: no se documentan capacidades de generación, razonamiento ni instrucción.
- Ausencia total de benchmarks publicados, lo que impide evaluar su calidad frente a alternativas.
- El entrenamiento se realizó con langs None, por lo que no hay garantía de comportamiento multilingüe ni de cobertura idiomática.
- El objetivo declarado es "parity", no una tarea de modelado de lenguaje; los usos previstos son experimentales.
- Riesgo de alucinación no evaluable al no ser un modelo generativo documentado.
- Sesgos: no documentados; al entrenar sobre bytes sin filtrar por idioma, podrían heredar sesgos de los datos, pero no se especifica su composición.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset y el carácter experimental desaconsejan cualquier despliegue en producción.
- El repositorio de 2,5 GB incluye estados de entrenamiento; la descarga completa no es necesaria para obtener solo los pesos.
- Dependencia del código externo beetle-hnet para cargar y ejecutar el modelo; no hay integración documentada con frameworks de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/parity_B_ste_s2
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
