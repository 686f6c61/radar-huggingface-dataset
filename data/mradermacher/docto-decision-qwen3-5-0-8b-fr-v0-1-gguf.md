# mradermacher/docto-decision-qwen3.5-0.8b-fr-v0.1-GGUF

## Resumen

`mradermacher/docto-decision-qwen3.5-0.8b-fr-v0.1-GGUF` es una versión cuantizada en formato GGUF del modelo `bofenghuang/docto-decision-qwen3.5-0.8b-fr-v0.1`, publicada por el usuario mradermacher, conocido por producir cuantizaciones estáticas de modelos abiertos. El modelo base es un ajuste fino (mediante LoRA, segun las etiquetas de la model card) orientado a decisiones en el dominio médico y en lengua francesa, con enfasis explicito en calibracion y en el paradigma de "system-one" (decision rapida e intuitiva).

El repositorio contiene unicamente pesos cuantizados derivados del modelo original, junto con ficheros `mmproj` etiquetados como "multi-modal supplement". El numero real de parametros declarado en los safetensors del modelo base es de 100.592.896 (aproximadamente 0,1 mil millones), una cifra que no coincide con el sufijo "0.8b" del nombre del modelo, por lo que conviene tratar ese dato con cautela.

La relevancia de esta publicacion es practica: al ofrecer variantes GGUF desde Q2_K hasta F16, permite ejecutar un modelo de decision medico en frances en hardware muy modesto (CPU, portatiles, dispositivos de borde o incluso moviles) mediante llama.cpp u Ollama, algo que no es posible con modelos medicos de mayor tamano. No se dispone de informacion sobre contexto, datos de entrenamiento detallados ni resultados de evaluacion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen (no confirmado en detalle en la informacion disponible) |
| Parametros totales | 100.592.896 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no es MoE, no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | frances (fr) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen 3.5 y de que fue adaptado mediante LoRA (etiqueta `lora` en la model card). El nombre del modelo indica un supuesto tamano de 0,8 mil millones de parametros, pero el recuento real de safetensors del modelo base es de 100.592.896 parametros, discrepancia que no queda explicada en la documentacion disponible. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

El unico dato de entrenamiento confirmado es el uso del dataset `bofenghuang/docto-decision-data-fr-v0.1`, junto con las etiquetas `medical`, `french`, `system-one`, `decision` y `calibration`. Es decir, el objetivo declarado del ajuste no es la generacion de texto generalista, sino la produccion de decisiones (probablemente clasificaciones o elecciones entre opciones) con una calibracion de confianza cuidada, en el ambito clinico y en frances. Las innovaciones tecnicas especificas (atencion, decodificacion, objetivos de calibracion) no estan documentadas en la informacion proporcionada.

Este repositorio en concreto no aporta entrenamiento nuevo: es exclusivamente un proceso de conversion y cuantizacion desde safetensors a GGUF, con cuantizaciones estaticas (el autor indica que las cuantizaciones ponderadas/imatrix no estan disponibles en el momento de la publicacion).

## Capacidades

- Decision en dominio medico: el modelo esta ajustado especificamente para tareas de decision clinica en frances (etiqueta `decision`).
- Calibracion de confianza: la etiqueta `calibration` sugiere que el modelo esta entrenado para emitir estimaciones de confianza mejor calibradas que un ajuste estandar, algo relevante cuando la salida debe priorizarse o derivarse a revision humana.
- Paradigma "system-one": orientado a respuestas rapidas e intuitivas, en contraposicion a cadenas de razonamiento largas.
- Idioma: exclusivamente frances segun la metadata; no se declara soporte multilingue.
- Capacidad multimodal: los ficheros `mmproj-Q8_0` y `mmproj-f16` se describen como "multi-modal supplement", lo que apunta a un posible componente de vision, aunque no se detalla en la informacion disponible que modalidad cubre ni como se activa.
- Generacion de texto general, razonamiento complejo, codigo, matematicas, tool calling y uso como agente: no disponible / no declarado.
- Ejecucion local: todas las cuantizaciones GGUF permiten inferencia offline en CPU o GPU de gama baja mediante llama.cpp y derivados.

## Casos de uso

- Triaje clinico automatizado en frances: el modelo puede clasificar sintomas o motivos de consulta en categorias de urgencia, aprovechando su ajuste especifico sobre datos medicos franceses y su calibracion de confianza para marcar los casos dudosos para revision humana.
- Pretriage en servicios de atencion telefonica sanitaria: integrado en un sistema que transcriba la llamada y consulte al modelo por una recomendacion de derivacion (urgencias, consulta programada, autocuidado), con latencia muy baja por su tamano reducido.
- Enrutado de consultas en chatbots medicos: uso como clasificador previo que decide a que especialista o a que flujo conversacional derivar una consulta escrita en frances.
- Anotacion asistida de corpus clinicos: preetiquetado de registros medicos en frances para revision posterior por personal sanitario, reduciendo el coste de anotacion manual.
- Investigacion sobre calibracion y decision tipo "system-one": el modelo sirve como banco de pruebas reproducible para estudiar tecnicas de calibracion en modelos pequenos del dominio medico.
- Despliegue en dispositivo de borde o entorno sin conectividad: al caber en unas pocas decenas o centenas de megabytes, puede ejecutarse en un portatil clinico, una tableta o un equipo industrial aislado de red, cumpliendo requisitos de soberania de datos.
- Filtrado y moderacion de contenido en plataformas sanitarias francesas: deteccion de mensajes que requieren intervencion profesional inmediata frente a consultas informativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier cuantizacion para un modelo de 100 M de parametros. Las variantes Q2_K, Q3_K_S y Q4_K_S ocupan del orden de decenas de megabytes; F16 se situa en torno a 200 MB. El repositorio completo ocupa 0,3 GB, incluidos los ficheros `mmproj`.
- GPU recomendadas: cualquier GPU consumer sirve; una RTX 3060, RTX 4060 o incluso una GPU integrada son suficientes. No se requieren A100 ni H100.
- Cabe en GPU consumer: si, en cualquier modelo actual, y tambien en CPU pura, Raspberry Pi o dispositivos moviles.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui (llama.cpp) para los ficheros GGUF; vLLM o TGI si se parte del modelo base en safetensors; transformers para el modelo original.
- Latencia y throughput estimados: no disponibles. Dado el tamano, en CPU moderna deberia alcanzar decenas de tokens por segundo, pero no hay mediciones publicadas en la informacion proporcionada.
- Nota: se incluyen ficheros `mmproj` (Q8_0 de 0,2 GB y F16 de 0,3 GB) para un componente multimodal; su uso requiere un runtime con soporte de proyeccion multimodal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mradermacher/docto-decision-qwen3.5-0.8b-fr-v0.1-GGUF | 100.592.896 (segun safetensors del base) | no disponible | apache-2.0 | GGUF, 12 tipos de cuantizacion | Cuantizacion estatica del modelo base |
| bofenghuang/docto-decision-qwen3.5-0.8b-fr-v0.1 | mismo modelo base | no disponible | apache-2.0 | safetensors / transformers | Modelo original con adaptador LoRA; referencia para comparar fidelidad de las cuantizaciones |
| Modelos medicos franceses de mayor tamano (por ejemplo, variantes de BioMistral o DrBERT) | 7B o superior en la mayoria de casos | no disponible | variable | variable | Alternativas mas capaces en lenguaje general, pero no ejecutables en hardware de gama baja; comparacion de rendimiento no disponible |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa entre estas opciones.

## Limitaciones y advertencias

- Ambito muy restringido: es un modelo de decision medica en frances, no un asistente generalista; usarlo para generacion abierta, codigo o conversacion general producira resultados pobres.
- Tamano muy reducido: con unos 100 M de parametros, su conocimiento factual y su capacidad de razonamiento son limitados en comparacion con modelos de 7B o superiores.
- Discrepancia en el nombre: el identificador indica "0.8b" pero el recuento real de parametros es de aproximadamente 0,1 mil millones; conviene verificar el modelo base antes de integrarlo en produccion.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con entradas largas.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; en un contexto clinico es especialmente critico y exige supervision profesional y validacion externa.
- Sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que no se pueden evaluar sesgos demograficos, geograficos ni de subrepresentacion de patologias.
- Monolinguee: solo se declara frances; el comportamiento en castellano u otros idiomas no esta garantizado.
- Uso clinico: no hay validacion regulatoria ni datos de evaluacion publicados; no debe emplearse como dispositivo medico ni como sustituto del juicio profesional.
- Licencia apache-2.0: permite uso comercial y modificacion, pero se heredan las condiciones del modelo base; conviene revisar tambien la licencia del repositorio original.
- Soporte multimodal incierto: la presencia de ficheros `mmproj` sugiere vision, pero no se documenta que modalidad ni como usarla.
- Cuantizaciones de baja calidad (Q2_K) pueden degradar de forma notable la calibracion, que es precisamente el objetivo del modelo; se recomienda Q5_K_M o superior para tareas de decision.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/docto-decision-qwen3.5-0.8b-fr-v0.1-GGUF
- Modelo base: https://huggingface.co/bofenghuang/docto-decision-qwen3.5-0.8b-fr-v0.1
- Dataset de entrenamiento: https://huggingface.co/datasets/bofenghuang/docto-decision-data-fr-v0.1
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#docto-decision-qwen3.5-0.8b-fr-v0.1-GGUF
- Solicitudes de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Guia general de uso de GGUF (referencia citada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Entidad responsable de la cuantizacion: https://www.nethype.de/
- Paper, blog o demo oficial del modelo base: no disponible
