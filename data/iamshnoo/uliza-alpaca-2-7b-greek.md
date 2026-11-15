# iamshnoo/uliza-alpaca-2-7b-greek

## Resumen

uliza-alpaca-2-7b-greek es un adaptador PEFT (QLoRA) para instrucción en griego moderno, desarrollado por iamshnoo (Anjishnu Mukherjee) en el marco del proyecto Global Gallery, presentado en NAACL 2024. El adaptador se aplica sobre el modelo base Jacaranda/kiswallama-pretrained, un modelo de 7.000 millones de parámetros de la familia LLaMA, y se entrena sobre una traducción al griego del dataset Alpaca cleaned (iamshnoo/alpaca-cleaned-greek). El objetivo es dotar a un modelo base multilingüe de capacidad de seguir instrucciones en griego sin necesidad de reentrenar todos los pesos.

El repositorio contiene únicamente los pesos del adaptador (0,1 GB), no el modelo completo, por lo que su uso requiere descargar el modelo base por separado y cargar el adaptador mediante la librería PEFT. El entrenamiento se realizó con cuantización 4-bit NF4 con doble cuantización y cómputo en bfloat16, lo que permite ajustar el modelo en hardware de consumo. La relevancia actual reside en su valor como ejemplo reproducible de instruction tuning de bajo coste para idiomas de recursos medios, y como artefacto de investigación del estudio Global Gallery sobre sesgos culturales en modelos multilingües.

El modelo está etiquetado para los idiomas griego (el) y inglés (en), con pipeline de text-generation, y no declara licencia en la información disponible, lo que limita su uso comercial sin aclaración previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA) con adaptador PEFT LoRA sobre modelo base; entrenamiento QLoRA 4-bit |
| Parametros totales | 7.000 millones (modelo base); el adaptador ocupa 0,1 GB en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con doble cuantizacion y compute dtype bfloat16; el adaptador se distribuye en precision completa para PEFT |
| Idiomas soportados | Griego (el), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | Pesos de adaptador PEFT (safetensors/binarios de PEFT); requiere el modelo base Jacaranda/kiswallama-pretrained |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de la familia LLaMA (transformer decoder-only con atención causal) en su variante de 7.000 millones de parámetros, sobre la que se aplica un adaptador LoRA entrenado con QLoRA. La cuantización de entrenamiento usa bitsandbytes con load_in_4bit activado, tipo nf4, doble cuantización habilitada y dtype de cómputo bfloat16; no se activa el modo 8-bit ni el offload de CPU en fp32. El framework declarado es PEFT 0.4.0.

El ajuste se realiza sobre el dataset iamshnoo/alpaca-cleaned-greek, una traducción al griego del Alpaca cleaned, con formato de instrucción típico de Alpaca (instrucción, entrada, salida). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO; el pipeline descrito es exclusivamente instruction tuning supervisado con QLoRA. La innovación metodológica asociada es el estudio Global Gallery, que evalúa cómo el instruction tuning multilingüe afecta a la representación cultural y a los sesgos del modelo, comparando adaptadores por idioma sobre un mismo modelo base.

## Capacidades

- Generación de texto en griego e inglés con formato de instrucción (estilo Alpaca).
- Seguimiento de instrucciones de un solo turno para tareas generales: resumen, reescritura, preguntas y respuestas, explicaciones.
- Generación de código y respuestas técnicas básicas, heredadas del dataset Alpaca traducido.
- Razonamiento de sentido común y matemáticas simples a nivel de instrucción, sin garantías de precisión.
- Capacidad multilingüe limitada a griego e inglés; no se declaran otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- No se documenta decodificación especulativa ni optimizaciones de inferencia específicas.

## Casos de uso

- Prototipado de asistentes en griego: el adaptador permite generar respuestas instructivas en griego sobre el modelo base sin reentrenamiento completo, adecuado para validar flujos de conversación antes de invertir en ajuste a gran escala.
- Investigación sobre instruction tuning de bajo coste: sirve como referencia reproducible de QLoRA sobre un modelo de 7B para un idioma de recursos medios, útil para comparar metodologías en trabajos académicos.
- Evaluación de sesgos culturales: al formar parte del estudio Global Gallery, el adaptador se puede usar como artefacto para medir cómo el ajuste en griego altera la representación cultural frente al modelo base.
- Generación de contenido educativo en griego: redacción de explicaciones, resúmenes y ejercicios sencillos para materiales didácticos, con revisión humana obligatoria por riesgo de alucinación.
- Traducción asistida y paráfrasis griego-inglés: el modelo puede producir borradores de traducción o reformulación en ambos idiomas, útil como paso previo a revisión profesional.
- Limpieza y normalización de textos griegos: tareas de reescritura, corrección de estilo y estructuración de contenido en pipelines de preprocesado.
- Experimentación docente: ejemplo práctico para cursos sobre PEFT, cuantización 4-bit y adaptadores LoRA, dado su tamaño reducido y su dependencia explícita de un modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el modelo base de 7B. En fp16, aproximadamente 14-16 GB de VRAM; en cuantización 4-bit (por ejemplo, GPTQ o AWQ), en torno a 4-6 GB; en 8-bit, alrededor de 8-10 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados para este adaptador.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en fp16 sin cuantizar y para evaluación por lotes; RTX 4090 (24 GB) para fp16 con margen; RTX 3090 (24 GB) para fp16 ajustado; RTX 4080/4070 Ti (16 GB) viable en 8-bit.
- GPU de consumo: sí cabe en GPUs de consumo con cuantización. En 4-bit es viable en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) y en 6 GB con contexto reducido; en 8-bit requiere al menos 10-12 GB.
- Opciones de despliegue: transformers + peft para cargar el adaptador; llama.cpp y Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF; vLLM y TGI son viables tras fusionar los pesos (merge_and_unload) y, en su caso, cuantizar.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, un 7B en fp16 sobre A100 ofrece decenas de tokens por segundo, pero no se aportan mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| uliza-alpaca-2-7b-greek | 7B (base) + adaptador | no disponible | el, en | no disponible | Adaptador PEFT | Instruction tuning QLoRA en griego sobre kiswallama-pretrained |
| Modelo base Jacaranda/kiswallama-pretrained | 7B | no disponible | multilingue | no disponible | Pesos completos | Sin instruction tuning específico en griego |
| Adaptadores Global Gallery de otros idiomas | 7B (base) + adaptador | no disponible | varios | no disponible | Adaptador PEFT | Misma metodología, distinto idioma objetivo |
| LLaMA 2 7B Chat | 7B | 4.096 tokens | principalmente inglés | licencia LLaMA 2 | Safetensors, GGUF | Referencia general de instruction tuning, no especializado en griego |

La comparación cuantitativa de rendimiento no está disponible; los datos de la tabla se limitan a parámetros, idioma y formato declarados.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue en producción.
- Es solo un adaptador: no funciona de forma autónoma; requiere descargar y cargar Jacaranda/kiswallama-pretrained, lo que añade dependencia y tamaño de despliegue.
- Riesgo de alucinación: al ser un ajuste sobre Alpaca traducido, puede generar respuestas plausibles pero incorrectas, especialmente en datos factuales y matemáticas.
- Sesgos: el dataset Alpaca cleaned traducido hereda sesgos del corpus original en inglés; el estudio Global Gallery precisamente analiza estos efectos culturales, por lo que se recomienda auditoría antes de uso sensible.
- Cobertura lingüística limitada: solo griego e inglés declarados; el rendimiento en otros idiomas no está garantizado.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada, lo que impide planificar tareas de contexto largo con garantías.
- Datos de entrenamiento incompletos: no se publican número de tokens, composición exacta ni hiperparámetros más allá de la configuración de cuantización.
- Adopción muy baja: 6 descargas y 0 likes en el momento de la consulta, sin validación comunitaria extensa.
- Fecha de actualización del repositorio (2026) posterior a la publicación del paper (2024): conviene verificar que los pesos corresponden a la versión descrita en el artículo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iamshnoo/uliza-alpaca-2-7b-greek
- Modelo base: https://huggingface.co/Jacaranda/kiswallama-pretrained
- Dataset de entrenamiento: https://huggingface.co/datasets/iamshnoo/alpaca-cleaned-greek
- Paper (NAACL 2024): https://aclanthology.org/2024.naacl-long.355/
- Página del proyecto Global Gallery: https://iamshnoo.github.io/global_gallery/
- Código: https://github.com/iamshnoo/culture-llm
