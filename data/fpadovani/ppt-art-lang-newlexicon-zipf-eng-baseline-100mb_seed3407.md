# fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407

## Resumen

El modelo `fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407` es un modelo de lenguaje pequeño (86,5 millones de parámetros) basado en la arquitectura GPT-2, desarrollado por fpadovani como parte de un proyecto de investigación sobre el arte del lenguaje y la creación de nuevos léxicos. Se trata de un ajuste fino (fine-tuning) del modelo base `goldfish-models/eng_latn_100mb`, que a su vez es un modelo entrenado con 100 MB de texto en inglés. El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de HuggingFace.

La relevancia de este modelo radica en su naturaleza experimental: forma parte de una serie de variantes (con diferentes semillas y configuraciones de léxico) diseñadas para estudiar cómo afecta la distribución de frecuencias de palabras (ley de Zipf) y la creación de nuevos vocabularios al comportamiento de los modelos de lenguaje. No está pensado para uso en producción, sino como herramienta de investigación en lingüística computacional y análisis de la generación de texto. Su tamaño reducido permite ejecutarlo en hardware modesto, incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (Transformer decoder) |
| Parametros totales | 86.508.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (modelo base entrenado en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder autoregresivo con mecanismo de atencion por capas. Con 86,5 millones de parametros, se trata de un modelo de tamano reducido, comparable al GPT-2 small original (124M) pero ligeramente inferior. El proceso de entrenamiento consistio en un ajuste fino supervisado (SFT) del modelo base `goldfish-models/eng_latn_100mb`, que fue preentrenado con 100 MB de texto en ingles. El entrenamiento se realizo con la libreria TRL (Transformers Reinforcement Learning) en su version 0.23.0, junto con Transformers 4.56.2 y PyTorch 2.5.1.

No se dispone de informacion detallada sobre la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que se experimento con un "nuevo lexico" (newlexicon) y una distribucion Zipf, lo que indica que el dataset pudo haber sido modificado o sintetizado para estudiar el efecto de la frecuencia de palabras en la generacion. El seguimiento del entrenamiento se realizo con Weights & Biases (wandb), aunque el enlace al run no es accesible publicamente.

## Capacidades

- Generacion de texto autoregresivo en ingles, basado en la arquitectura GPT-2.
- Capacidad limitada de razonamiento y comprension contextual, acorde a su tamano reducido (86,5M de parametros).
- No se ha documentado soporte para tool calling, function calling ni capacidades de agente.
- No se ha documentado soporte para vision, audio ni multimodalidad.
- Capacidades multilingues limitadas: el modelo base fue entrenado exclusivamente con texto en ingles, por lo que su rendimiento en otros idiomas sera muy deficiente.
- No se ha documentado un modo de "thinking" o razonamiento extendido.

## Casos de uso

- Investigacion academica en lingüistica computacional: el modelo permite estudiar como la distribucion de frecuencias de palabras (ley de Zipf) afecta a la generacion de texto y a la coherencia del lenguaje producido. Los investigadores pueden comparar esta variante con otras del mismo proyecto (diferentes semillas o lexicos) para aislar variables.
- Experimentos de generacion de texto controlada: al haber sido entrenado con un lexico modificado, puede usarse para analizar como el modelo maneja vocabulario artificial o poco frecuente, lo que resulta util para estudiar la generalizacion y la memorizacion en modelos pequenos.
- Prototipado rapido de pipelines de generacion: su tamano reducido permite integrarlo en entornos de desarrollo sin requisitos de hardware elevados, sirviendo como banco de pruebas para tecnicas de prompting o decodificacion antes de escalar a modelos mayores.
- Educacion y formacion: es un ejemplo didactico de como se realiza un ajuste fino con TRL sobre un modelo base, y de como se documenta y publica un experimento de investigacion en HuggingFace.
- Comparacion de semillas y variabilidad: al existir multiples versiones con diferentes semillas (seed3407, seed455, etc.), se puede estudiar la variabilidad de los resultados de entrenamiento y su impacto en la generacion.
- Analisis de sesgos en modelos pequenos: al ser un modelo de tamano reducido, es mas facil auditar sus salidas y estudiar sesgos de genero, raza o tema en comparacion con modelos mas grandes, aunque su utilidad practica es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar. El modelo no esta disenado para tareas de razonamiento complejo ni generacion de codigo, por lo que su evaluacion se centraria en metricas de perplejidad o calidad de generacion, que tampoco se han documentado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en precision FP32, segun estimaciones de LLM Explorer para modelos de tamano similar. Con cuantizacion a 8 bits, la VRAM necesaria se reduciria a unos 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionarian sin problemas. Tambien es viable la inferencia en CPU con 4-8 GB de RAM.
- Compatibilidad con consumer GPU: si, el modelo cabe en cualquier GPU de consumo actual e incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: al ser un modelo de la familia GPT-2, es compatible con Transformers (pipeline de text-generation), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), vLLM y TGI. Para uso en produccion, se recomienda vLLM o TGI por su eficiencia, aunque para experimentos puntuales basta con el pipeline de Transformers.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (RTX 3090), la generacion de 128 tokens deberia completarse en menos de un segundo. En CPU, la latencia seria de varios segundos por generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407 | 86,5M | no disponible | no disponible | Investigacion sobre lexicos artificiales |
| fpadovani/ppt-art-lang-eng-baseline_seed3407 | no disponible | no disponible | no disponible | Variante del mismo proyecto sin newlexicon |
| goldfish-models/eng_latn_100mb | no disponible | no disponible | no disponible | Modelo base preentrenado con 100 MB de ingles |
| GPT-2 small (124M) | 124M | 1024 | MIT | Generacion de texto generalista |

No se dispone de datos de rendimiento comparativo entre estas variantes. La comparativa se limita a aspectos estructurales y de proposito. El modelo es significativamente mas pequeno que GPT-2 small y carece de la documentacion y el soporte de modelos establecidos.

## Limitaciones y advertencias

- Informacion insuficiente: la model card no proporciona detalles sobre el dataset de entrenamiento, la licencia, el contexto maximo ni los idiomas soportados. Esto limita seriamente su uso en entornos profesionales.
- Sesgos y alucinaciones: al ser un modelo pequeno entrenado con un corpus limitado (100 MB), es muy propenso a alucinaciones, repeticiones y salidas incoherentes. No es adecuado para tareas que requieran precision factual.
- Naturaleza experimental: el modelo fue creado para un experimento de investigacion sobre lexicos artificiales. No se ha validado para casos de uso reales ni se ha sometido a evaluacion de seguridad o sesgos.
- Licencia no especificada: al no disponer de licencia, no se puede determinar si es apto para uso comercial. Se recomienda contactar con el autor antes de cualquier uso fuera del ambito academico.
- Idioma limitado: el modelo base fue entrenado exclusivamente con texto en ingles. Su rendimiento en otros idiomas sera muy deficiente o nulo.
- Sin soporte de herramientas: no se ha documentado tool calling ni integracion con agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- HuggingFace: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Variante con seed455: https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-eng-baseline-100mb_seed455,6mkpVFlOXDWzjKl0Gjn5g5
- Variante en japones: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-jpn-baseline-100mb_seed3407
- Variante sin newlexicon: https://huggingface.co/fpadovani/ppt-art-lang-eng-baseline_seed3407
- Repositorio de TRL: https://github.com/huggingface/trl
