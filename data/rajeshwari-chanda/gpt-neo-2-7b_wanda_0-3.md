# Rajeshwari-Chanda/gpt-neo-2.7B_wanda_0.3

## Resumen

gpt-neo-2.7B_wanda_0.3 es un checkpoint derivado de GPT-Neo 2.7B al que se le ha aplicado una poda no estructurada del 30 % de los pesos mediante el metodo WANDA (pruning por pesos y activaciones). Lo publica en Hugging Face el usuario Rajeshwari-Chanda, sin documentacion tecnica asociada: la model card es la plantilla autogenerada de transformers y no declara autor, licencia, idiomas ni datos de entrenamiento.

El modelo conserva la arquitectura original de GPT-Neo: un transformer decoder-only autorregresivo de aproximadamente 2.651 millones de parametros, disenado para generacion de texto en ingles. No es un modelo ajustado por instrucciones ni un modelo conversacional; es una base linguistica de la generacion de 2021 cuyo interes actual es fundamentalmente experimental.

Su relevancia es acotada y de perfil academico: sirve para estudiar el impacto de la sparsidad en un modelo denso de tamano medio, reproducir experimentos de poda y comparar la degradacion de perplejidad frente al checkpoint denso original. No cuenta con descargas ni validacion de la comunidad, y su licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo, familia GPT-Neo (etiqueta `gpt_neo` en el Hub) |
| Parametros totales | 2.651.307.520 (aproximadamente 2,65 B, segun safetensors) |
| Parametros activos | No aplica: modelo denso, no es Mixture of Experts |
| Longitud de contexto | No disponible en la informacion proporcionada; GPT-Neo emplea 2048 tokens por configuracion de la arquitectura original (dato no confirmado en la ficha) |
| Tipos de cuantizacion | No disponible. El repositorio ocupa 5,3 GB para 2,65 B de parametros, coherente con pesos en fp16 (2 bytes por parametro) |
| Idiomas soportados | No disponible en la ficha. GPT-Neo se entreno sobre The Pile, corpus predominantemente en ingles |
| Licencia | No disponible. La ficha no la declara; el GPT-Neo 2.7B original de EleutherAI se publico bajo licencia MIT |
| Formato de pesos | safetensors |
| Sparsidad | 30 % (no estructurada), inferida del sufijo `wanda_0.3` del identificador |
| Tamano del repositorio | 5,3 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El checkpoint parte de GPT-Neo 2.7B, un transformer decoder-only con atencion causal y patron de atencion local alterna al estilo GPT-3 (ventana local reducida combinada con capas de atencion global). La innovacion respecto al modelo base no es arquitectonica sino de compresion: se ha aplicado WANDA, un metodo de poda que elimina pesos comparando su magnitud con la norma de las activaciones de entrada por columna, sin necesidad de reentrenamiento ni de recalcular la Hessiana. La tasa aplicada es 0.3, es decir, un 30 % de los pesos puestos a cero.

La informacion disponible no incluye el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO: la model card no aporta ningun detalle y remite a "[More Information Needed]" en todas las secciones. Los datos del modelo base corresponden a lo publicado por EleutherAI para GPT-Neo (entrenamiento sobre The Pile), pero no se pueden verificar en esta ficha. Tampoco se documenta el calibrado utilizado por WANDA (numero de muestras, secuencia de calibracion) ni si el checkpoint conserva mascara de sparsidad o solo los pesos con ceros.

## Capacidades

- Generacion de texto autorregresiva: continuación de prompts, redaccion libre y completado de documentos en ingles.
- Modelado de lenguaje: calculo de perplejidad y puntuaciones de verosimilitud, util para evaluacion y filtrado de corpus.
- Generacion de codigo basica: el modelo base se entreno sobre The Pile, que incluye GitHub, por lo que puede completar fragmentos simples, aunque sin garantias de correccion.
- Razonamiento aritmetico limitado: capacidad residual propia de un modelo de 2,7 B de 2021, sin entrenamiento especifico en matematicas.
- Capacidad multilingue marginal: el corpus de entrenamiento es mayoritariamente ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente es bajo.
- No dispone de soporte de tool calling, function calling ni protocolos de agentes.
- No dispone de modo thinking, vision, audio ni ninguna capacidad multimodal.
- No es un modelo instruido: no sigue instrucciones de forma fiable ni mantiene formato conversacional sin ajuste adicional.

## Casos de uso

- Investigacion sobre poda de modelos: reproducir y comparar el efecto de WANDA al 30 % sobre GPT-Neo 2.7B, midiendo la caida de perplejidad frente al checkpoint denso original en un conjunto fijo como Wikitext-103.
- Benchmarking de kernels dispersos: usar el checkpoint como entrada para validar librerias de inferencia con soporte de sparsidad no estructurada, donde la compresion puede traducirse en ganancias reales de velocidad.
- Estudio de la degradacion tarea a tarea: evaluar que capacidades (sintaxis, coherencia a larga distancia, conocimiento factual) resisten mejor a una poda del 30 % y cuales se deterioran antes.
- Generacion de texto no critica con restricciones de memoria: en escenarios donde los 5,3 GB en fp16 deben reducirse a 2,7 GB en int8 o menos, siempre que se acepte perdida adicional de calidad.
- Fine-tuning ligero para tareas de dominio acotado: ajustar el modelo podado con LoRA sobre un corpus especializado (por ejemplo, abstracts cientificos) para comprobar si la sparsidad actua como regularizacion.
- Analisis de sesgo y toxicidad con modelos comprimidos: comparar si la poda amplifica o atenua los sesgos presentes en el GPT-Neo original, un experimento relevante para la literatura de seguridad en modelos comprimidos.
- Generacion de datos sinteticos de bajo coste: producir texto de dominio general como material de aumento de datos, asumiendo calidad inferior a la de modelos densos contemporaneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, LAMBADA ni perplejidad) y la busqueda web no devolvio resultados relacionados con el modelo. Tampoco se dispone de la cifra de perplejidad del checkpoint denso original ni de la variante podada, por lo que no es posible cuantificar la degradacion introducida por el 30 % de sparsidad.

## Requisitos de hardware

- VRAM en fp16: aproximadamente 5,3 GB solo para pesos, mas 1 GB adicional en concepto de cache KV y activaciones para lotes pequenos y contexto de 2048 tokens.
- VRAM en fp32: aproximadamente 10,6 GB para pesos; no recomendado salvo para depuracion.
- VRAM en int8: aproximadamente 2,7 GB; en cuantizacion de 4 bits, en torno a 1,5-1,8 GB.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 8 GB, RTX 3070, RTX 4060 Ti, RTX 4090). En fp16 encaja con holgura en una RTX 4090 de 24 GB y admite lotes de varias secuencias.
- GPU de datacenter: A100 40/80 GB, H100 o L40S son suficientes y sobredimensionadas para un modelo denso de 2,65 B; su uso solo se justifica por agregacion de muchas replicas.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` es la via directa. vLLM y TGI pueden servirlo como modelo denso, pero ignoraran la sparsidad. llama.cpp y Ollama requieren convertir los pesos a GGUF, proceso que preserva los ceros pero no aporta ninguna ventaja adicional de velocidad.
- Advertencia de rendimiento: la poda de WANDA es no estructurada, por lo que los ceros no se traducen en aceleracion sobre hardware denso estandar (GPU convencionales o CPU). Sin kernels especificos de sparsidad, el coste computacional es identico al de GPT-Neo 2.7B denso y el checkpoint ocupa lo mismo en disco.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gpt-neo-2.7B_wanda_0.3 | 2,65 B (30 % pesos a cero) | no disponible (2048 en GPT-Neo base) | no disponible | Hugging Face, 0 descargas, 0 likes | Checkpoint de investigacion sin documentacion ni evaluacion publicada |
| GPT-Neo 2.7B (EleutherAI) | 2,7 B | 2048 tokens | MIT | Hugging Face, ampliamente utilizado | Modelo denso de referencia del que deriva el anterior |
| Pythia-2.8B (EleutherAI) | 2,8 B | 2048 tokens | Apache 2.0 | Hugging Face, con 154 checkpoints publicados | Suite disenada para interpretabilidad, con metricas publicadas por etapa de entrenamiento |
| OPT-2.7B (Meta) | 2,7 B | 2048 tokens | Licencia especifica de OPT (no comercial en algunas versiones) | Hugging Face | Alternativa contemporanea entrenada sobre corpus distinto, con model card detallada |

La comparacion se limita a especificaciones porque no existen datos de rendimiento publicados para el checkpoint podado. Frente a Pythia-2.8B, la diferencia practica mas relevante es la trazabilidad: Pythia documenta licencia, datos y curva de aprendizaje, mientras que este checkpoint no ofrece nada de ello.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos de GPT-Neo 2.7B, entrenado sobre The Pile (texto web sin filtrar). Se ha documentado que la familia GPT-Neo reproduce estereotipos de genero, raza y religion, y puede generar contenido toxico ante determinados prompts.
- Riesgo de alucinacion: alto. Es un modelo base sin ajuste por instrucciones ni alineamiento, con tendencia a continuar texto de forma plausible pero no veridica. No debe usarse como fuente factual.
- Degradacion por poda: el 30 % de sparsidad no estructurada reduce la capacidad del modelo, pero el autor no publica ninguna medicion de la perdida (perplejidad ni benchmarks). El impacto real es desconocido.
- Sin ganancia de velocidad: la sparsidad no estructurada no se explota en hardware denso convencional; el checkpoint es igual de costoso de ejecutar que el modelo original.
- Limitacion de idioma: el entrenamiento es mayoritariamente en ingles. El comportamiento en castellano no esta documentado y probablemente es pobre.
- Restricciones de licencia: la licencia no esta declarada en el Hub. Aunque el GPT-Neo original es MIT, la ausencia de licencia explicita en el checkpoint derivado crea incertidumbre juridica para uso comercial. No debe desplegarse en produccion sin aclarar este punto.
- Falta de mantenimiento: el repositorio no presenta descargas, likes ni discusion, y se creo sin documentacion. No hay garantia de soporte, correccion de errores ni compatibilidad futura.
- Idoneidad para produccion: baja. Es un artefacto de investigacion sin evaluacion reproducible, sin licencia clara y sin metricas de calidad. Para aplicaciones reales conviene partir de alternativas documentadas como Pythia, Qwen o Llama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rajeshwari-Chanda/gpt-neo-2.7B_wanda_0.3
- GPT-Neo 2.7B original (EleutherAI): https://huggingface.co/EleutherAI/gpt-neo-2.7B
- Metodo WANDA (referencia del algoritmo de poda nombrado en el identificador del modelo, no encontrado en la busqueda web): https://arxiv.org/abs/2306.11695
- Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo (listados de charlas TED). No se han encontrado papers, blogs, repositorios ni demos asociados a este checkpoint.
- Nota sobre la etiqueta `arxiv:1910.09700`: corresponde al articulo "Quantifying the Carbon Emissions of Machine Learning" (Lacoste et al., 2019), citado en la plantilla automatica de la model card. No es el paper del modelo.
