# Nakshsolanki/indus-n-2-pro-preview

## Resumen

Indus N 2 Pro Preview es un adaptador PEFT (LoRA) publicado por Nakshsolanki bajo el identificador `Nakshsolanki/indus-n-2-pro-preview`. Se presenta como el modelo insignia de la familia Indus Gen 2, orientado a razonamiento profundo y entrada multimodal (texto e imagen), y se construye sobre el modelo base `google/gemma-4-26B-A4B-it`, una arquitectura Mixture of Experts con 26.000 millones de parametros totales y 4.000 millones activos por token.

El modelo incorpora un modo de razonamiento explicito (Thinking Mode) que genera pasos intermedios antes de la respuesta final, y hereda la ventana de contexto de 256K tokens y la capacidad de vision del modelo base. Su pipeline declarado es `image-text-to-text` y esta distribuido con licencia Apache 2.0.

La relevancia de esta ficha es limitada y conviene ser explicito: el repositorio muestra cero descargas y cero likes en el momento de la consulta, la model card es muy escueta y no publica datos de entrenamiento del adaptador, hiperparametros, benchmarks ni evaluaciones. Todo lo que se describe a continuacion sobre arquitectura y capacidades proviene del modelo base declarado o de afirmaciones no verificadas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer MoE (modelo base `google/gemma-4-26B-A4B-it`) |
| Parametros totales | 26B en el modelo base; tamano del adaptador no disponible |
| Parametros activos | 4B por token (modelo base, MoE) |
| Longitud de contexto | 256K tokens (segun la model card, heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos PEFT; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | ingles (en) e hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | PEFT (adaptador LoRA); pesos del modelo base en el repositorio de Google, formato no especificado en la informacion disponible |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-26B-A4B-it`, un transformer con capas Mixture of Experts en el que cada token activa aproximadamente 4.000 millones de parametros de un total de 26.000 millones. Esta configuracion busca reducir el coste computacional por token manteniendo la capacidad de representacion de un modelo denso de mayor tamano. El pipeline es multimodal (`image-text-to-text`), por lo que el modelo base integra un codificador visual ademas del decodificador de texto.

No se dispone de informacion sobre el dataset de entrenamiento del adaptador, el numero de tokens utilizados, la composicion de los datos, ni si se emplearon tecnicas de RLHF, DPO o ajuste supervisado. La model card menciona un "Thinking Mode" nativo que produce razonamiento paso a paso antes de la respuesta final, pero no documenta como se entreno esa capacidad ni que plantilla de prompt activa dicho modo. Tampoco hay informacion sobre decodificacion especulativa, atencion linear u otras optimizaciones especificas del adaptador.

## Capacidades

- Generacion de texto y razonamiento multi-paso mediante un modo de pensamiento explicito que emite cadenas de razonamiento antes de la respuesta final.
- Entrada multimodal: acepta imagenes junto con texto (pipeline `image-text-to-text`), segun la model card.
- Procesamiento de contexto largo: hasta 256K tokens declarados, adecuado para documentos extensos o conversaciones prolongadas.
- Capacidades multilingues limitadas a ingles e hindi segun los metadatos del repositorio.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no documentado; el "Thinking Mode" es razonamiento interno, no necesariamente uso de herramientas.
- Capacidades de codigo y matematicas: no documentadas especificamente para el adaptador.

## Casos de uso

- Razonamiento sobre documentos largos en ingles o hindi: la ventana de 256K tokens permite cargar informes completos, expedientes o bases de conocimiento y formular preguntas sobre ellos sin trocear el contenido.
- Analisis de imagenes con explicacion razonada: al combinar vision y Thinking Mode, el modelo puede describir una imagen y justificar sus conclusiones paso a paso, util en revision de documentacion escaneada o capturas de pantalla.
- Asistencia en hindi para soporte tecnico: el soporte declarado de hindi lo hace candidato para atencion al cliente o generacion de contenido en ese idioma, siempre que se valide la calidad real con evaluaciones propias.
- Prototipado de asistentes con razonamiento visible: equipos que quieran experimentar con interfaces que muestran el proceso de pensamiento del modelo pueden usar el adaptador sobre el modelo base con vLLM o TGI.
- Investigacion sobre adaptadores PEFT y modos de razonamiento: el repositorio sirve como ejemplo de como aplicar LoRA sobre un MoE multimodal de Gemma 4 para inducir comportamiento de pensamiento explicito.
- Extraccion de informacion estructurada de imagenes y texto combinados: por ejemplo, digitalizar tablas en fotos y razonar sobre discrepancias con un texto de referencia.
- Evaluacion comparativa de tecnicas de ajuste: util como punto de partida para medir cuanto aporta un adaptador LoRA frente al modelo base en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el modelo base en precision completa (BF16): aproximadamente 52 GB solo para pesos de 26B, mas overhead de activaciones y cache KV; en la practica se recomienda un nodo con 80 GB o mas.
- VRAM con cuantizacion de 8 bits: en torno a 26-28 GB; con 4 bits, en torno a 14-16 GB, aunque estas cifras son estimaciones a partir del tamano del modelo base y no estan confirmadas para este adaptador.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16; A100 40 GB o L40S para cuantizacion 8 bits; RTX 4090 (24 GB) solo con cuantizacion de 4 bits y contexto reducido.
- Cabe en GPU de consumo: si, con cuantizacion agresiva (4 bits) en RTX 4090 o RTX 3090, a costa de reducir la ventana de contexto efectiva.
- Opciones de despliegue: vLLM y TGI para servir el modelo base con el adaptador PEFT cargado; llama.cpp y Ollama para variantes cuantizadas del modelo base, con soporte de adaptadores variable segun la version.
- Latencia y throughput: no disponibles; dependeran del hardware, la cuantizacion y la longitud de las cadenas de razonamiento generadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Indus N 2 Pro Preview | 26B totales / 4B activos (base) + adaptador | 256K | Texto e imagen | Apache 2.0 | Repositorio publico con 0 descargas |
| google/gemma-4-26B-A4B-it | 26B totales / 4B activos | 256K | Texto e imagen | Licencia del modelo base (consultar en su repositorio) | Modelo base oficial de Google |
| Alternativas MoE abiertas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa realista es contra el propio modelo base: el adaptador anade un modo de razonamiento explicito declarado, pero no hay datos publicados que permitan afirmar que mejora al base en ninguna tarea. Cualquier comparacion de rendimiento con otros modelos queda sin sustento con la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, ni evaluaciones cualitativas, ni ejemplos de salida en la model card; el rendimiento real es desconocido.
- Cero descargas y cero likes: no hay evidencia de uso por parte de la comunidad ni de validacion independiente.
- Model card incompleta: no se documentan datos de entrenamiento del adaptador, hiperparametros de LoRA, plantilla de prompt para activar el Thinking Mode ni limitaciones conocidas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje, y potencialmente amplificado por cadenas de razonamiento largas que pueden parecer convincentes sin ser correctas.
- Cobertura linguistica limitada: solo ingles e hindi declarados; el rendimiento en castellano no esta garantizado ni evaluado.
- Dependencia del modelo base: el adaptador no es autonomo; requiere descargar `google/gemma-4-26B-A4B-it` y cumplir su licencia ademas de la Apache 2.0 del adaptador.
- Fecha de creacion futura en los metadatos (2026-11-22): conviene verificar la procedencia y autenticidad del repositorio antes de usarlo en produccion.
- Uso comercial: la licencia Apache 2.0 del adaptador lo permite, pero debe revisarse la licencia del modelo base de Google, que puede imponer condiciones adicionales.
- No apto para produccion sin evaluacion previa: sin datos de calidad, sesgos ni robustez, su adopcion en entornos reales requiere una bateria de pruebas propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nakshsolanki/indus-n-2-pro-preview
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Space de demostracion "Indus AI Model Experiment": mencionado en la model card sin URL directa disponible
- Paper, blog o repositorio adicional: no disponible
