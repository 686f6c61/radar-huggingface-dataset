# mradermacher/zen-ingress-1-3b-dpo-merged-GGUF

## Resumen

zen-ingress-1-3b-dpo-merged-GGUF es el conjunto de cuantizaciones en formato GGUF del modelo ZenithLLM/zen-ingress-1-3b-dpo-merged, publicado por el usuario mradermacher, especializado en la conversion y cuantizacion de modelos abiertos a GGUF. No se trata por tanto de un modelo entrenado desde cero, sino de una distribucion derivada: el autor original del ajuste es ZenithLLM, mientras que mradermacher se encarga de generar los ficheros cuantizados para su uso con llama.cpp y herramientas compatibles.

El modelo subyacente tiene 3.085.938.688 parametros (aproximadamente 3,09 mil millones) y esta etiquetado en HuggingFace como una finetune personalizada sobre la familia Qwen2, orientada a razonamiento y matematicas, con un paso de DPO (Direct Preference Optimization) indicado en el propio nombre del modelo. El repositorio es de tipo text-generation, esta licenciado bajo Apache 2.0 y declara unicamente el idioma ingles.

Su relevancia practica es la de un modelo pequeno y ligero que puede ejecutarse en hardware de consumo gracias a las cuantizaciones de 1,4 a 3,4 GB, con una version f16 de 6,3 GB. Es un candidato razonable para entornos con VRAM limitada, prototipado rapido en local o despliegues en CPU, siempre que el caso de uso sea en ingles y no requiera razonamiento de alta complejidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (segun las etiquetas del repositorio); no disponible el detalle de capas, dimension oculta o cabezas de atencion |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 mil millones) |
| Parametros activos | No aplica; el modelo no es de arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16. Existe ademas un repositorio aparte con cuantizaciones ponderadas con imatrix |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas y f16). El modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no incluye detalles sobre la configuracion interna de la arquitectura. Las etiquetas del repositorio indican que el modelo pertenece a la familia Qwen2, lo que implica un transformer decoder-only con atencion causal, normalizacion RMSNorm y el tokenizador asociado a dicha familia. El numero de parametros (3.085.938.688) es coherente con un modelo de aproximadamente 3.000 millones de parametros en precision completa.

El proceso de entrenamiento tampoco esta documentado en la informacion proporcionada. El nombre del modelo indica que se aplico una fase de DPO sobre una finetune previa, y las etiquetas mencionan "custom-finetune", "reasoning" y "math", lo que sugiere un ajuste orientado a tareas de razonamiento y matematicas. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RLHF. La informacion tecnica que si aparece en la model card se refiere exclusivamente al proceso de cuantizacion: version de cuantizacion 2, cuantizacion de tensores de salida activada y conversion de tipo hf.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (etiqueta "conversational" en el repositorio).
- Razonamiento y resolucion de problemas matematicos, segun las etiquetas "reasoning" y "math" del autor.
- Ajuste por preferencias mediante DPO, lo que en principio mejora la utilidad y el seguimiento de instrucciones frente al modelo previo al ajuste.
- Soporte de function calling o tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; las etiquetas de razonamiento son la unica indicacion al respecto.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declara soporte de otros idiomas.
- Capacidades especiales (modo thinking explicito, vision, audio): no disponibles.

## Casos de uso

- Asistente conversacional local en ingles: con cuantizaciones Q4_K_M de 2,0 GB, el modelo puede ejecutarse integramente en una GPU de consumo o incluso en CPU, lo que permite desplegar un chatbot privado sin conexion a servicios externos.
- Generacion y explicacion de codigo en entornos con recursos limitados: al ser un modelo de 3.000 millones de parametros, encaja en flujos de autocompletado o generacion de fragmentos pequenos, aunque no se ha publicado ninguna evaluacion especifica en tareas de programacion.
- Apoyo educativo en matematicas basicas e intermedias: las etiquetas de razonamiento y matematicas sugieren que el modelo fue ajustado para resolver problemas paso a paso, lo que lo hace util en tutoria automatizada de ejercicios escolares en ingles.
- Prototipado rapido de aplicaciones de IA generativa: gracias a su tamano reducido, sirve para validar pipelines de inferencia con llama.cpp, Ollama o servidores compatibles antes de escalar a modelos mayores.
- Preprocesado y clasificacion de texto en pipelines de datos: tareas como resumir, reescribir o etiquetar fragmentos cortos en ingles pueden delegarse a este modelo, reduciendo el coste frente a alternativas de mayor tamano.
- Experimentacion en investigacion sobre DPO: al estar publicado como finetune ajustada por preferencias sobre una base Qwen2, resulta util como punto de comparacion en estudios sobre el efecto del DPO en modelos de 3.000 millones de parametros.
- Despliegue en dispositivos con memoria muy restringida: la cuantizacion Q2_K de 1,4 GB permite ejecutar el modelo en equipos con menos de 4 GB de memoria disponible, a costa de una perdida notable de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye ningun dato de MMLU, GSM8K, HumanEval ni metricas equivalentes, y la unica referencia grafica presente es un grafico generico sobre la perplejidad relativa de distintos tipos de cuantizacion, no un resultado especifico de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas cache KV, sin cuantizar la cache): Q2_K en torno a 1,5-2 GB; Q4_K_M en torno a 2,5-3,5 GB; Q8_0 en torno a 4-5 GB; f16 en torno a 7-8 GB. Estas cifras son estimaciones a partir del tamano de los ficheros y crecen con la longitud de contexto utilizada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones Q4; una RTX 3060, RTX 4060, RTX 2070 o superior es suficiente. Para f16 se recomienda una GPU de 8 GB o mas, como RTX 3070, RTX 4060 Ti o RTX 4070. No requiere A100 ni H100.
- Compatibilidad con GPU de consumo: si, en practicamente todas las cuantizaciones. Q2_K y Q3_K caben en GPUs de 2-3 GB y en sistemas integrados con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y, en general, cualquier runtime con soporte GGUF. Tambien es posible servir el modelo base con vLLM o TGI si se trabaja con safetensors, aunque eso queda fuera de este repositorio.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zen-ingress-1-3b-dpo-merged-GGUF | 3,09 B | No disponible | Apache 2.0 | GGUF | Finetune con DPO orientada a razonamiento y matematicas en ingles |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (ampliable con RoPE) | Apache 2.0 | safetensors, GGUF | Modelo instructivo generalista de la familia Qwen, multilingue |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Multilingue, con condiciones de licencia especificas para uso comercial |
| Phi-3.5-mini-instruct | 3,82 B | 128.000 tokens | MIT | safetensors, GGUF | Fuerte en razonamiento y codigo, entrenado con datos sinteticos filtrados |

No se dispone de datos de rendimiento comparado para zen-ingress-1-3b-dpo-merged-GGUF, por lo que la comparacion se limita a parametros, contexto declarado, licencia y formatos disponibles. Las cifras de los modelos alternativos corresponden a datos publicos de sus respectivos repositorios y pueden variar con las revisiones de cada proyecto.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado ninguna evaluacion de sesgos. Al estar entrenado principalmente sobre datos en ingles, es probable que reproduzca los sesgos presentes en corpus angloparlantes.
- Riesgo de alucinacion: con solo 3.000 millones de parametros, la tasa de alucinacion en tareas factuales o de conocimiento abierto tiende a ser elevada. No se recomienda su uso en contextos donde la precision factica sea critica sin verificacion humana.
- Limitaciones de contexto: la longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Limitaciones de idioma: el modelo declara unicamente soporte de ingles. No hay evidencias de un rendimiento aceptable en castellano ni en otros idiomas.
- Restricciones de licencia: la licencia declarada es Apache 2.0, lo que permite uso comercial, modificacion y redistribucion con atribucion. La licencia se hereda del modelo base; conviene verificar el repositorio original de ZenithLLM por si existieran condiciones adicionales.
- Procedencia y trazabilidad: se trata de una cuantizacion de terceros, no del modelo oficial. Los ficheros GGUF pueden introducir perdida de calidad respecto a los pesos originales, especialmente en las cuantizaciones Q2_K y Q3_K.
- Advertencia sobre cuantizaciones de baja precision: las variantes Q2_K (1,4 GB) y Q3_K_S (1,6 GB) degradan de forma notable la calidad de salida. Para uso en produccion se recomienda Q4_K_M o superior, y las cuantizaciones imatrix del repositorio complementario suelen ofrecer mejor relacion tamano-calidad.
- Advertencia sobre uso en produccion: la ausencia total de benchmarks publicados impide estimar el rendimiento esperado. Cualquier despliegue productivo deberia ir precedido de una evaluacion propia con el conjunto de datos del caso de uso concreto.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/zen-ingress-1-3b-dpo-merged-GGUF
- Modelo base: https://huggingface.co/ZenithLLM/zen-ingress-1-3b-dpo-merged
- Cuantizaciones ponderadas con imatrix: https://huggingface.co/mradermacher/zen-ingress-1-3b-dpo-merged-i1-GGUF
- Pagina resumen del autor con lista de descargas: https://hf.tst.eu/model#zen-ingress-1-3b-dpo-merged-GGUF
- Guia de uso de ficheros GGUF (referencia citada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
