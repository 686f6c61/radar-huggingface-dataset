# jssaluja/granite-speech5-470m-gurmukhi-char-v1-sggs-ncer-train-196521-epochs-25-test-2246

## Resumen

El modelo `jssaluja/granite-speech5-470m-gurmukhi-char-v1-sggs-ncer-train-196521-epochs-25-test-2246` es un ajuste fino (fine-tuning) publicado en Hugging Face por el usuario jssaluja sobre una base de la familia Granite Speech, presumiblemente el modelo de reconocimiento automatico del habla (ASR) de IBM de aproximadamente 470 millones de parametros. Por el nombre del repositorio, el entrenamiento se ha orientado a la transcripcion de habla en punyabi (gurmukhi), utilizando una tokenizacion a nivel de caracter y optimizando una metrica de tipo NCER (normalized character error rate) sobre un conjunto de entrenamiento de 196 521 muestras y un conjunto de test de 2246.

La relevancia de este modelo es acotada pero concreta: se trata de un artefacto de investigacion que demuestra la adaptacion de un modelo ASR multilingue de tamano medio a un idioma de bajos recursos como el punyabi, empleando una cabeza de salida basada en caracteres. Esto resulta interesante para quienes trabajan en ASR de lenguas indoarias y quieren evaluar si un modelo de 470M es suficiente para obtener tasas de error competitivas frente a sistemas mas grandes.

No obstante, la model card publicada es la plantilla automatica de Hugging Face sin completar, por lo que no hay informacion oficial sobre arquitectura exacta, datos de entrenamiento, hiperparametros, licencia ni resultados de evaluacion. Toda la ficha que sigue se basa en inferencias a partir del identificador del repositorio y en las convenciones conocidas de la familia Granite Speech, y marca explicitamente como "no disponible" cualquier dato que no pueda confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por el identificador, se infiere un encoder de audio + decoder tipo transformer de la familia Granite Speech; sin confirmar) |
| Parametros totales | aproximadamente 470 millones (segun el identificador del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (por el identificador, orientado a punyabi en escritura gurmukhi) |
| Licencia | no disponible |
| Formato de pesos | no disponible (la libreria declarada es transformers; se asume safetensors o bin, sin confirmar) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura. A partir del identificador `granite-speech5-470m`, cabe inferir que se parte de un modelo de la familia Granite Speech de IBM con unos 470 millones de parametros, tipicamente compuesto por un encoder de audio (estilo Conformer o transformer convolucional) conectado a un decoder de lenguaje. El sufijo `gurmukhi-char-v1` sugiere que la cabeza de salida se ha reconfigurado para predecir caracteres gurmukhi en lugar de subpalabras BPE, y `sggs-ncer` apunta a que la funcion de perdida o la metrica de seleccion se basa en la tasa de error de caracteres normalizada sobre texto del Guru Granth Sahib (SGGS) o un corpus derivado.

El identificador indica 25 epocas de entrenamiento sobre 196 521 muestras y evaluacion sobre 2246. No se especifican la composicion del dataset, el numero de horas de audio, la estrategia de aumento de datos, el uso de RLHF/DPO (improbable en un modelo ASR) ni los hiperparametros de optimizacion. Tampoco se documenta si se congelaron capas del encoder o si se entreno de extremo a extremo.

## Capacidades

- Reconocimiento automatico del habla (ASR) para punyabi en escritura gurmukhi, segun el identificador del repositorio.
- Salida a nivel de caracter, lo que puede facilitar el manejo de un alfabeto relativamente pequeno y reducir la dependencia de un tokenizador subword especifico.
- No hay evidencia de soporte de tool calling, function calling ni capacidades de agente.
- No hay evidencia de capacidades multimodales mas alla del audio de entrada.
- No hay evidencia de modo "thinking", vision ni audio generativo.
- Capacidades multilingues: no disponibles; el ajuste parece estar especializado en un unico idioma.

## Casos de uso

- Transcripcion de audio en punyabi para archivos o reuniones: el modelo puede convertir grabaciones en texto gurmukhi, util para digitalizar contenido hablado en este idioma alli donde los ASR comerciales rinden peor.
- Subtitulado automatico de videos en punyabi: integrado en un pipeline de postproduccion, permitiria generar subtitulos preliminares que luego un humano revisa, reduciendo el coste frente a la transcripcion manual.
- Investigacion en ASR de bajos recursos: sirve como punto de partida reproducible para comparar estrategias de tokenizacion por caracter frente a subword en lenguas indoarias.
- Evaluacion comparativa de modelos ASR: al ser un ajuste especifico, puede emplearse como baseline en estudios que midan la brecha entre modelos multilingues grandes y ajustes pequenos especializados.
- Preservacion y acceso a textos religiosos o historicos: dado el sufijo `sggs`, podria emplearse en proyectos de transcripcion y busqueda sobre recitaciones, siempre con revision humana por la sensibilidad del contenido.
- Prototipado de asistentes de voz en punyabi: para demos o pruebas de concepto de interfaces habladas en este idioma, aunque con las cautelas de licencia y calidad indicadas mas abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El identificador del repositorio menciona un conjunto de test de 2246 muestras y una metrica NCER, pero no se proporcionan los valores numericos obtenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de aproximadamente 470M parametros, una estimacion orientativa en fp16 seria de alrededor de 1 GB de pesos, mas el coste del encoder de audio y las activaciones; en cuantizacion de 8 bits o 4 bits el consumo seria menor.
- GPU recomendadas: no disponibles. Por tamano, cabria esperar que funcionase en GPUs consumer modernas (por ejemplo, RTX 3060 en adelante) y en GPUs de datacenter como A100 o H100, pero no hay confirmacion.
- Cabe en GPU consumer: probablemente si, dado el tamano, aunque no esta verificado.
- Opciones de despliegue: la libreria declarada es `transformers`, por lo que el despliegue via `transformers` es el camino documentado. No hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jssaluja/granite-speech5-470m-gurmukhi-char-v1 | aprox. 470M | no disponible | punyabi (inferido) | no disponible | Hugging Face |
| Whisper (variantes small/medium) | 244M / 769M | 30 s de audio | multilingue | MIT (variantes abiertas) | Abierto |
| Modelos Granite Speech base de IBM | no disponible | no disponible | multilingue | no disponible en esta ficha | Hugging Face |

La comparacion cuantitativa no es posible con la informacion disponible. Whisper se incluye como referencia de categoria por tamano y naturaleza (ASR abierto), no porque se hayan comparado resultados.

## Limitaciones y advertencias

- La model card es la plantilla automatica sin completar: no hay documentacion de sesgos, datos, evaluacion ni uso previsto.
- Riesgo de alucinacion y de transcripciones incorrectas, especialmente en audio con ruido, acentos no representados o vocabulario tecnico.
- Licencia no declarada: no puede asumirse uso comercial sin consultar al autor.
- Especializacion estrecha: probablemente no funcione bien fuera del punyabi/gurmukhi ni como modelo de lenguaje general.
- Sin datos de evaluacion publicados, no es posible estimar su calidad frente a alternativas.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- El sufijo `sggs` sugiere entrenamiento sobre texto religioso; conviene revisar la procedencia de los datos y el trato respetuoso del contenido en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/jssaluja/granite-speech5-470m-gurmukhi-char-v1-sggs-ncer-train-196521-epochs-25-test-2246
- Referencia citada en los tags (paper sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
