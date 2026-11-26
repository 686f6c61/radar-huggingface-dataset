# Kai9987kai/supermix-v107

## Resumen

Supermix v107 (`v107_universal_morphogenesis`) es un modelo de generación de texto publicado por Kai9987kai en Hugging Face, derivado por ajuste fino de Supermix v103. Se presenta como la entrega de la arquitectura y el runtime de la serie Supermix v104–v107, procedente del repositorio GitHub del autor. La propuesta técnica es heterodoxa: combina atención con memoria rápida de pesos (fast-weight memory) sobre ejes de profundidad y de tiempo, un conjunto de seis familias de "neuronas sintéticas" diferenciables y mecanismos inspirados en neurobiología (astrocitos, acoplamiento efáptico, plasticidad BTSP, consolidación EWC).

El modelo se enmarca en la etiqueta de mezcla de expertos (mixture-of-experts) y añade componentes de cuantización de caché KV a Int4 con valores atípicos mezclados, un optimizador Muon híbrido con precondicionamiento de reducción de varianza MARS y un conjunto de "solvers" deterministas con recibos SHA-256 que se declaran explícitamente sin autoridad de respuesta (`answer_authority: false`). La model card no aporta datos de tamaño, contexto, dataset ni resultados de benchmarks.

La relevancia práctica es limitada por el momento: el modelo acumula 0 descargas y 0 likes, no declara idiomas soportados y su validación se limita a suites de tests internos del repositorio (13/13, 121/121, 500/500 y 14/14 sondas del verificador SCF). Se trata, por tanto, de un artefacto de investigación experimental más que de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y memoria rápida de pesos dual (uTTT-MoE / uTTT-Dense); neuronas sintéticas heterogéneas; mecanismos neuro-simbólicos |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización de caché KV a Int4 con mezcla de valores atípicos (outlier-mixed Int4 KV-cache); no se detallan cuantizaciones de pesos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (librería declarada: pytorch) |

## Arquitectura y entrenamiento

La arquitectura descrita combina un transformer con un programador de memoria rápida de pesos compartido y recurrente en dos ejes: a lo largo de la profundidad (`forward_layer`) y a lo largo del tiempo causal (`consolidate_temporal`). Incorpora puertas de identidad de nacimiento con inicialización a cero y un historial de estado en caché KV de rango 3 que permite decodificación incremental bit-exacta y rollback en decodificación especulativa multi-token (MTP). Sobre esa base se añaden mecanismos de inspiración biológica: puerta astrocítica de conectoma, acoplamiento efáptico retrógrado, actualización de plasticidad BTSP de tres factores y consolidación sináptica EWC, todos con restricciones de signo según la ley de Dale.

El bloque de neuronas sintéticas (Sonapse Synthetic Neuron Foundry) agrupa seis familias diferenciables y aditivas —SolitonAxonNeuron, SpineApparatusNeuron, AstrocyticTripartiteNeuron, EphapticFieldNeuron, RetrogradeEndocannabinoidNeuron y FastWeightEngramNeuron— fusionadas mediante HeterogeneousNeuronPopulation y SonapseNeuronFoundryLayer. En el plano de eficiencia se incorporan caché de posiciones RoPE precalculada, broadcasting de cabeceras GQA sin copia y el optimizador MuonHybridOptimizer con precondicionamiento MARS (`mars_gamma`). La model card no especifica número de tokens de entrenamiento, composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento.

## Capacidades

- Generación de texto autoregresiva (pipeline declarado: text-generation).
- Memoria rápida de pesos recurrente en profundidad y tiempo, orientada a consolidar información a largo plazo dentro de la secuencia.
- Decodificación incremental bit-exacta con historial de estado en caché KV de rango 3.
- Decodificación especulativa multi-token (MTP) con rollback.
- Compresión de caché KV a Int4 con manejo de valores atípicos, para reducir huella de memoria en contexto largo.
- Razonamiento neuro-simbólico: 10 solvers exactos y 5 motores analíticos v107, deterministas, fail-closed y con recibos SHA-256 (sin autoridad de respuesta).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en arquitecturas con memoria rápida de pesos: el modelo sirve como banco de pruebas para estudiar cómo la consolidación temporal (`consolidate_temporal`) afecta a la retención de información en secuencias largas, comparándola con atención estándar.
- Experimentación con neuronas sintéticas heterogéneas: permite evaluar el impacto de sustituir capas densas por poblaciones de neuronas diferenciables (SolitonAxon, AstrocyticTripartite, etc.) en tareas de modelado de lenguaje.
- Verificación formal y razonamiento determinista: los solvers exactos con recibos SHA-256 y comportamiento fail-closed son adecuados para pipelines donde se requiere trazabilidad criptográfica del resultado, aceptando que el propio modelo declara no tener autoridad de respuesta.
- Estudio de decodificación especulativa con rollback: el historial de estado KV de rango 3 y la decodificación bit-exacta permiten medir la ganancia de MTP sin divergencias numéricas respecto a la decodificación greedy.
- Evaluación de cuantización de caché KV en producción simulada: la compresión Int4 con mezcla de valores atípicos puede probarse para estimar el ahorro de VRAM en contextos largos frente a FP16.
- Reproducción de experimentos neuro-simbólicos: la combinación de plasticidad BTSP, consolidación EWC y restricciones de la ley de Dale permite reproducir estudios sobre olvido catastrófico y estabilidad del aprendizaje continuo.
- Docencia y divulgación: como ejemplo didáctico de arquitectura híbrida que integra mecanismos biológicos y simbólicos en un transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta resultados de suites de tests internos:

| Suite de verificación | Resultado |
|---|---|
| `test_v107_universal_fast_weight_and_neurons.py` | 13 / 13 superados |
| Paridad de runtime, SCF, contrato de release, manifiesto de studio y suites v104–v107 | 121 / 121 superados |
| Suites core MiMoMix, Nexus, decoding y regresión | 500 / 500 superados |
| `python -m scf diagnose --json` (sondas del verificador) | 14 / 14 superadas |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se declara el número de parámetros ni el tamaño de los pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin datos de tamaño; la cuantización Int4 de caché KV sugiere un diseño orientado a reducir memoria en contexto largo, pero no se aportan cifras.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la librería declarada es PyTorch y el runtime procede del repositorio propio del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan establecer una comparación rigurosa con alternativas de tamaño o tarea similares.

## Limitaciones y advertencias

- Ausencia total de datos de entrenamiento: no se especifican tokens, composición del dataset, ni fases de alineamiento (RLHF/DPO), lo que impide evaluar sesgos y calidad.
- Sin benchmarks públicos: no hay resultados en MMLU, HumanEval, GSM8K ni tareas equivalentes, por lo que el rendimiento real es desconocido.
- Idiomas no declarados: no puede asumirse soporte multilingüe ni siquiera un rendimiento sólido en inglés.
- Riesgo de alucinación: no evaluado; los solvers deterministas declaran explícitamente `answer_authority: false`, por lo que no deben tratarse como fuente de verdad.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso externo ni validación por terceros.
- Validación limitada a tests internos del repositorio del autor; las suites reportadas verifican paridad de runtime y contratos, no calidad del modelo.
- Licencia MIT: permite uso comercial y modificación, pero al ser un artefacto experimental sin garantías de calidad, su uso en producción conlleva riesgo elevado.
- Naturaleza experimental de la arquitectura: mecanismos como el acoplamiento efáptico o las neuronas astrocíticas no cuentan con validación independiente publicada en la información disponible.
- Dependencia del runtime propio: el despliegue requiere el código del repositorio del autor, no formatos estándar ampliamente soportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kai9987kai/supermix-v107
- Modelo base: https://huggingface.co/Kai9987kai/supermix-v103
- Repositorio GitHub: https://github.com/kai9987kai/Supermix
- Pull request de la release v104–v107: https://github.com/kai9987kai/Supermix/pull/11
