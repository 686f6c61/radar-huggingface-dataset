# rat-lab/mh-ec2-ttomd-K4-van

## Resumen

`rat-lab/mh-ec2-ttomd-K4-van` es un conjunto de adaptadores LoRA entrenados sobre el modelo base `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` (Gemma 2 2B ajustado con Alpaca Cleaned). No se trata de un modelo fundacional ni de un asistente listo para producción, sino de un artefacto experimental: los adaptadores corresponden a la celda K=4, sin corrección de sesgo, de la tabla cobertura x debiasing de una serie de experimentos de aprendizaje de preferencias sensible al riesgo (riesgo entrópico, tau = 10).

El entrenamiento se realizó con el algoritmo online IPO (`--alg oipo1`, implementado en `risk_egpo/tt_omd.py`) sobre el dataset `PKU-Alignment/PKU-SafeRLHF`, con un calentamiento de 100 pasos desde `ipo-e-c10.0/checkpoint-936` y 19 checkpoints guardados cada 250 pasos (de 250 a 4680). El repositorio declara explícitamente que no fue entrenado por el autor de la model card, sino extraído sin cambios de `rat-lab/rlj-ec2-fig9-K4-van`, verificándose la identidad byte a byte de los checkpoints 250, 2500 y 4680.

Su relevancia es por tanto metodológica más que de producto: sirve para reproducir y auditar una comparativa concreta de optimización de preferencias con aversión al riesgo, y como ejemplo de adaptador PEFT publicado con procedencia trazable. El repositorio pesa 1,9 GB, no tiene descargas registradas y cuenta con un único like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Gemma 2 2B); el artefacto publicado son adaptadores LoRA, no pesos completos |
| Parametros totales | No disponible en la informacion proporcionada. El modelo base es Gemma 2 2B (aproximadamente 2,6 B), dato no confirmado en la ficha |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (corresponde al modelo base) |
| Tipos de cuantizacion | No disponible. Los adaptadores se distribuyen en safetensors sin cuantizar |
| Idiomas soportados | No disponible (heredados del modelo base) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptadores LoRA: `adapter_model.safetensors` + `adapter_config.json`) y ficheros de tokenizer por checkpoint |
| Libreria | peft |
| Tamano del repositorio | 1,9 GB (19 checkpoints, de 250 a 4680 pasos, cada 250 pasos) |
| Modelo base | vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT |
| Dataset de entrenamiento | PKU-Alignment/PKU-SafeRLHF |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango sobre Gemma 2 2B, por lo que la arquitectura subyacente es la del modelo base y no se modifica. Lo relevante aquí es el procedimiento de optimización: se emplea online IPO (`--alg oipo1`) desde el módulo `risk_egpo/tt_omd.py`, con cobertura K = 4 (`--ypp_samples 4`), riesgo entrópico con tau = 10 (`--risk entropic --risk_c 10.0`) y sin corrección de sesgo, es decir, la configuración descrita como línea base sensible al riesgo. El tamaño de paso de two-timescale figura como no aplicable en esta celda.

El entrenamiento parte de un calentamiento de 100 pasos desde `ipo-e-c10.0/checkpoint-936` y genera con un máximo de 64 tokens nuevos y semilla 42. Se publican 19 checkpoints intermedios, lo que permite estudiar la evolución del ajuste de preferencias a lo largo del entrenamiento, pero el repositorio no incluye el estado de reanudación de DeepSpeed, por lo que no es posible retomar el entrenamiento desde el punto exacto en que se dejó. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases adicionales de RLHF o DPO más allá del propio procedimiento de optimización de preferencias descrito.

## Capacidades

- Ajuste de preferencias sobre el modelo base: los adaptadores modifican el comportamiento del Gemma 2 2B subyacente según el objetivo de IPO en línea con riesgo entrópico.
- Generación de texto condicionada: al ser un adaptador sobre un modelo instruct, conserva las capacidades generativas del base, aunque no se documentan evaluaciones específicas.
- Evaluación experimental de riesgo y cobertura: la configuración K = 4 y la ausencia de corrección de sesgo están pensadas para medir comportamiento en escenarios de preferencia con riesgo.
- Compatibilidad con el ecosistema PEFT: carga directa mediante `PeftModel.from_pretrained` sobre el modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de optimización de preferencias: cargar los 19 checkpoints y medir la evolución de las métricas de preferencia y riesgo a lo largo de los pasos, usando el script `risk_egpo/tt_omd.py` como referencia del procedimiento.
- Auditoría de procedencia de artefactos: el repositorio documenta que los adaptadores se extrajeron sin cambios de `rat-lab/rlj-ec2-fig9-K4-van` y que se verificó su identidad mediante sha256, lo que lo convierte en un caso de estudio sobre trazabilidad en publicaciones de modelos.
- Análisis de sensibilidad al riesgo en modelos pequeños: comparar esta celda (riesgo entrópico, tau = 10, sin debiasing) con las celdas equivalentes de la misma tabla para aislar el efecto de la cobertura K y de la corrección de sesgo.
- Estudio de la estabilidad del entrenamiento: los checkpoints cada 250 pasos permiten trazar curvas de aprendizaje y detectar degradación o colapso en fases tempranas del ajuste con IPO en línea.
- Base para experimentos de alineación en hardware modesto: al tratarse de adaptadores sobre un modelo de aproximadamente 2 B, el ciclo completo de evaluación cabe en una única GPU de consumo, lo que facilita la experimentación académica.
- Docencia e investigación en RLHF: sirve como ejemplo mínimo y ejecutable de adaptador LoRA derivado de un pipeline de preferencias sobre PKU-SafeRLHF, útil para cursos o talleres sobre alineación.
- Punto de partida para ablaciones posteriores: los adaptadores pueden reutilizarse como inicialización en variantes con corrección de sesgo o con otro valor de tau, manteniendo el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de recompensa o tasa de preferencia, y la búsqueda web asociada no devolvió documentación técnica relacionada con el modelo.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo base de aproximadamente 2 B de parámetros, la inferencia en fp16 requeriría del orden de 5-6 GB de VRAM, y en cuantización de 4 bits del orden de 2-3 GB. Estas cifras son estimaciones dependientes del modelo base y no están confirmadas en la información proporcionada.
- Almacenamiento: el repositorio completo ocupa 1,9 GB, correspondiente a los 19 checkpoints de adaptadores y sus ficheros de tokenizer. Para servir el modelo hay que sumar el peso del modelo base.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo base, cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para inferencia en precisión reducida; GPU de datacenter (A100, H100) no son necesarias para este artefacto.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas tipo RTX 3060 de 12 GB, RTX 4070 o RTX 4090, siempre que se cuantice el modelo base o se use media precisión. No hay confirmación del autor.
- Opciones de despliegue: PEFT junto con Transformers es el método documentado en la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la naturaleza de adaptador LoRA complica su uso directo en algunos runners sin fusionar previamente los pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rat-lab/mh-ec2-ttomd-K4-van | Adaptador LoRA sobre Gemma 2 2B (no disponible el rango ni el numero de parametros entrenables) | No disponible | Adaptador PEFT para investigacion en preferencias | No disponible | Publico en HuggingFace, 0 descargas |
| vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT (modelo base) | Aproximadamente 2,6 B | No disponible en esta ficha | Modelo completo ajustado con SFT | No disponible | Publico en HuggingFace |
| rat-lab/rlj-ec2-fig9-K4-van (repo de origen) | Identico byte a byte a este | No disponible | Adaptador PEFT | No disponible | Publico en HuggingFace |
| Otras celdas de la tabla cobertura x debiasing | No disponible | No disponible | Adaptadores PEFT | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan comparar estos artefactos entre sí más allá de su configuración experimental.

## Limitaciones y advertencias

- No es un modelo listo para producción: se trata de un artefacto de investigación con 0 descargas registradas y sin pipeline declarado.
- Licencia no disponible: no se especifican los términos de uso, por lo que no puede asumirse permiso para uso comercial. Además, la licencia del modelo base (Gemma) impone sus propias condiciones que deben verificarse por separado.
- Idiomas no declarados: se desconoce la cobertura lingüística efectiva del adaptador resultante.
- Riesgo de alucinación: inherente al modelo base; no se documentan evaluaciones de fidelidad factual para este adaptador.
- Sesgos: no se documenta ningún análisis de sesgo para esta celda. La configuración se describe explícitamente como "sin corrección de sesgo", lo que sugiere que el sesgo no se mitiga en este experimento.
- Limitación de generación: la configuración de entrenamiento fija un máximo de 64 tokens nuevos, lo que puede sesgar el comportamiento hacia respuestas cortas.
- Reproducibilidad parcial: el repositorio no incluye el estado de reanudación de DeepSpeed, por lo que no se puede continuar el entrenamiento desde el checkpoint exacto.
- Riesgo de confusión de procedencia: la model card advierte de que el modelo no fue entrenado por el autor que lo publica, sino extraído de otro repositorio. Cualquier cita debe atribuirse al esfuerzo RLJ/EC2 original.
- Fechas anómalas: la fecha de creación registrada (23 de septiembre de 2026) es posterior a la fecha habitual de consulta, lo que conviene verificar antes de citarla.
- Los resultados de la búsqueda web realizada no contienen información relacionada con este modelo; los enlaces devueltos tratan sobre la especie animal "rata" y sobre una oferta comercial de un operador de televisión, por lo que no deben usarse como fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rat-lab/mh-ec2-ttomd-K4-van
- Modelo base: https://huggingface.co/vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT
- Repositorio de origen de los adaptadores: https://huggingface.co/rat-lab/rlj-ec2-fig9-K4-van
- Dataset de entrenamiento: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Repositorio de origen del modelo base: https://huggingface.co/google/gemma-2-2b
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la busqueda web realizada.
