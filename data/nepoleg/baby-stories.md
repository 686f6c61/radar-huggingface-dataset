# nepoleg/baby-stories

## Resumen

BabyStories es un modelo GPT de pequeno tamano entrenado de forma casera por el usuario nepoleg, disenado especificamente para generar historias infantiles cortas. El modelo se inspira en el articulo "How Small Can Language Models Be and Still Speak Coherent English?" de Ronen Eldan y Yuanzhi Li (Microsoft Research, arXiv:2305.07759), que explora los limites minimos de escala para mantener coherencia linguistica en modelos de lenguaje. El repositorio ocupa 0,3 GB, lo que sugiere un modelo de pocos millones de parametros, aunque el autor no especifica la cifra exacta.

La propuesta es deliberadamente experimental y de bajo coste: el entrenamiento se realizo en bf16 para poder ejecutarse en un portatil, lo que lo convierte en un caso de estudio util para quienes quieren entender el ciclo completo de entrenamiento de un transformer desde cero. No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni resultados de evaluacion.

A pesar de su nombre y de la licencia MIT, se trata de un artefacto de investigacion personal sin pipeline declarado, sin descargas ni likes, y sin documentacion sobre idiomas soportados. Su relevancia actual es acotada: sirve como ejemplo educativo de entrenamiento de modelos diminutos y como base para experimentos de generacion de texto creativo a muy baja escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con multi-head attention y mascara causal, mas una mascara adicional basada en el inicio de la historia |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio ocupa 0,3 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only clasico con atencion multi-cabeza, enmascaramiento causal estandar y una mascara adicional condicionada por el token de inicio de la historia. Utiliza un tokenizador BPE y se entreno en precision bf16, una eleccion que el autor justifica por la necesidad de ejecutar el entrenamiento en un portatil. No se documenta el numero de capas, dimensiones ocultas, cabezas de atencion ni el vocabulario del tokenizador.

No hay informacion sobre el volumen de datos de entrenamiento, la composicion del corpus (presumiblemente cuentos infantiles), el uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La inspiracion en el trabajo de Eldan y Li sugiere un interes por la coherencia en regimenes de escala muy reducida, pero el autor no aporta metricas que permitan verificar hasta que punto se alcanza ese objetivo.

## Capacidades

- Generacion de texto creativo breve orientado a historias infantiles.
- Generacion autoregresiva condicionada por un token de inicio de historia, gracias a la mascara especifica mencionada en la model card.
- Entrenamiento y inferencia factibles en hardware de consumo (portatil) gracias al uso de bf16.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; los idiomas soportados figuran como no disponibles.
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Generacion de cuentos infantiles para prototipos educativos: el modelo puede producir historias cortas a partir de un inicio dado, util para maquetar demos de aplicaciones de lectura infantil sin depender de APIs externas.
- Material de ensenanza sobre entrenamiento de LLM: al haberse entrenado en un portatil en bf16, sirve como ejemplo reproducible en cursos y talleres sobre ciclo completo de entrenamiento.
- Experimentacion con mascaras de atencion personalizadas: la mascara basada en el inicio de la historia es un caso practico para estudiar como el condicionamiento estructural afecta la generacion.
- Generacion de texto de relleno en pruebas de integracion: su bajo coste computacional permite usarlo como modelo de juguete en pipelines de CI para validar infraestructura de inferencia.
- Investigacion sobre coherencia a escala minima: replicar o extender los experimentos de Eldan y Li con un modelo propio y licencia MIT.
- Base para fine-tuning en dominios acotados: al ser pequeno y permisivo en licencia, puede ajustarse rapidamente en tareas de generacion de texto muy restringidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio de 0,3 GB sugiere que el modelo completo cabe holgadamente en cualquier GPU consumer con 4 GB o mas, e incluso en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es suficiente; tambien es viable en CPU.
- Cabe en GPU consumer: si, practicamente en todas las GPU dedicadas actuales y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: no se documentan; al no publicarse formato de pesos, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| BabyStories (nepoleg) | no disponible (repo 0,3 GB) | no disponible | MIT | Hugging Face, 0 descargas |
| TinyStories (Eldan y Li, referencia) | ~1M-10M | no disponible | no disponible | paper arXiv:2305.07759 |
| Modelos GPT-2 pequenos | 124M | 1024 tokens | MIT | ampliamente disponible |

La comparacion con TinyStories es la mas directa por la inspiracion declarada, pero no se dispone de datos de rendimiento de BabyStories que permitan contrastar calidad de generacion. Frente a GPT-2 small, BabyStories es presumiblemente mucho mas pequeno y especializado, sin metricas publicas que lo sitúen.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, coherencia o fidelidad de las historias generadas.
- Sesgos conocidos: no documentados; al entrenarse presumiblemente con cuentos infantiles, puede reproducir estereotipos presentes en ese corpus.
- Riesgo de alucinacion: alto en modelos de escala muy reducida, con tendencia a incoherencias y repeticiones.
- Limitaciones de contexto e idioma: no se especifican; no hay garantia de soporte multilingue.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial, pero sin garantias implicitas.
- Caveats para produccion: sin pipeline declarado, sin formato de pesos documentado y sin descargas ni validacion de la comunidad; no recomendado para entornos productivos sin evaluacion propia.
- Fecha de creacion inusual (2026-10-30) que conviene verificar antes de citar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/nepoleg/baby-stories
- Paper de referencia: https://arxiv.org/abs/2305.07759
- Repositorio de codigo: mencionado en la model card como disponible en GitHub, sin URL concreta en la informacion proporcionada.
