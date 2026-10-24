# eperez002/neurobert-test

## Resumen

NeuroBERT-test (repo `eperez002/neurobert-test`) es un modelo de lenguaje encoder-only basado en la arquitectura BERT, subido por el usuario eperez002 y derivado, según su propia model card, de `google-bert/bert-base-uncased`. La model card lo describe como un BERT compacto de 6 capas, tamaño oculto 256 y 4 cabezas de atención, orientado a inferencia en tiempo real sobre dispositivos de baja potencia (móviles, wearables, microcontroladores y domótica), con tareas declaradas de masked language modeling, clasificación de texto, detección de intención y NER. El recuento real de parámetros en los ficheros safetensors es de 12.781.114, muy por debajo de los "~20M" que anuncia la model card.

Su interés práctico radica en el tamaño: con unos 12,8M de parámetros ocupa alrededor de 51 MB en FP32, 26 MB en FP16 y 13 MB en INT8, lo que permite ejecutarlo en CPU, en un Raspberry Pi o integrado en una app móvil sin conexión. La licencia MIT facilita el uso comercial. Ahora bien, se trata de un repositorio de prueba: 0 descargas, 0 likes, sin resultados de benchmarks publicados y con enlaces de descarga que apuntan al repositorio original `boltuix/NeuroBERT-Small` en lugar de a este.

Conviene tratarlo, por tanto, como una copia no validada de un modelo pequeño de la familia NeuroBERT, útil para prototipado de clasificación de textos cortos en inglés, no como un modelo listo para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo BERT; 6 capas, hidden size 256, 4 cabezas de atención (según model card) |
| Parámetros totales | 12.781.114 (recuento real de safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base `bert-base-uncased` usa 512 tokens |
| Tipos de cuantización | No se distribuyen ficheros GGUF ni ONNX; la model card menciona una versión cuantizada de ~50 MB sin especificar el esquema |
| Idiomas soportados | Inglés (según la model card); los metadatos de HuggingFace no lo declaran |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,1 GB |
| Pipeline declarado | `text-classification` en la model card; no disponible en los metadatos de HuggingFace |
| Dataset de entrenamiento | `custom-dataset` (sin más detalle) |
| Versión declarada | v1.3 |

## Arquitectura y entrenamiento

La arquitectura es un Transformer bidireccional encoder-only con 6 capas, tamaño oculto 256 y 4 cabezas de atención. El recuento de 12.781.114 parámetros es coherente con esa configuración si el decodificador del cabezal MLM está atado (tied) a la matriz de embeddings: con vocabulario WordPiece de 30.522 tokens y hidden 256, los embeddings de entrada suman unos 7,8M de parámetros, cada capa del encoder ronda los 0,79M (asumiendo feed-forward de 1.024 unidades, no confirmado en la model card) y el pooler aporta unos 0,07M, lo que da el total observado. Si el cabezal MLM fuese independiente, el modelo superaría los 20M, que es la cifra que declara el autor.

No hay información sobre el corpus de preentrenamiento, el número de tokens procesados, la composición del dataset (`custom-dataset` no se detalla) ni el procedimiento de ajuste. Al ser un modelo encoder-only, no aplican RLHF ni DPO en el sentido habitual de los modelos generativos. Tampoco se documenta si se partió de los pesos de `bert-base-uncased` mediante destilación, poda o entrenamiento desde cero, ni si se aplicó alguna técnica de compresión más allá de la mención genérica a cuantización.

## Capacidades

- Masked language modeling (fill-mask): predice tokens enmascarados en una frase, con el ejemplo de domótica que aparece en la model card ("Please [MASK] the door before leaving").
- Clasificación de texto: permite cargar el modelo con `AutoModelForSequenceClassification` para tareas de clasificación binaria o multietiqueta tras un ajuste fino.
- Detección de intención: caso de uso explícito de la model card para comandos tipo "Turn off the AC" con etiquetas ON/OFF.
- Reconocimiento de entidades nombradas (NER): mencionado como tarea soportada y en el ecosistema de variantes NeuroBERT, aunque este repositorio no incluye un cabezal ni un checkpoint específico de NER.
- Extracción de embeddings contextuales: al ser un encoder BERT, expone `last_hidden_state` y `pooler_output` reutilizables para similitud semántica, clustering o recuperación, previo ajuste fino (no está entrenado como sentence-transformer).
- Multilingüismo: no. La model card declara únicamente inglés y el tokenizador heredado de `bert-base-uncased` está orientado a inglés.
- Tool calling / function calling: no soportado de forma nativa; no es un modelo generativo ni conversacional.
- Agentes y razonamiento multi-paso: no aplicable.
- Visión, audio o modo "thinking": no disponibles.

## Casos de uso

- Detección de intención en asistentes de voz offline: ajustando el modelo con `AutoModelForSequenceClassification` sobre un conjunto propio de comandos ("turn on the light", "set temperature to 20"), puede clasificar intenciones en local dentro de un altavoz o un panel de domótica, sin enviar audio transcrito a la nube. Sus 12,8M de parámetros permiten ejecutarlo en CPU en dispositivos con menos de 1 GB de RAM.
- Clasificación de textos cortos en el edge: etiquetado de reseñas, tickets de soporte o mensajes de formulario en aplicaciones móviles, gracias a que el modelo cabe en unos 13 MB en INT8 y funciona sin conexión.
- Filtrado previo en una arquitectura en cascada: usar el modelo como router barato que descarte consultas irrelevantes o las clasifique por tema antes de enviarlas a un LLM grande, reduciendo coste por token en un pipeline de atención al cliente.
- Etiquetado semiautomático de datos en CPU: preanotar grandes volúmenes de texto para construir datasets de entrenamiento o para auditorías de contenido, aprovechando el bajo coste de inferencia frente a modelos de 7B o superiores.
- Extracción de entidades en formularios: con un ajuste fino sobre un corpus tipo CoNLL, extraer nombres, organizaciones y localizaciones de campos de texto libre en una app de digitalización documental sin salida a internet.
- Detección de palabras clave y PII en texto: clasificar o etiquetar menciones sensibles en registros antes de almacenarlos, en entornos con requisitos de privacidad que impiden usar APIs externas.
- Prototipado rápido de NLP en investigación: servir como baseline ligero y reproducible en experimentos de clasificación de bajo recurso, donde interesa un ciclo de entrenamiento de minutos en lugar de horas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card lista las métricas `accuracy`, `f1`, `inference` y `recall`, pero no aporta ningún valor numérico. La única evaluación descrita en el ecosistema NeuroBERT consiste en una prueba cualitativa de masked language modeling sobre 10 frases relacionadas con IoT, en la que se considera superado el test si la palabra esperada aparece entre las 5 predicciones más probables. No hay datos de MMLU, GLUE, HumanEval ni GSM8K, ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en todos los casos. Cálculo a partir de los 12.781.114 parámetros: ~51 MB en FP32, ~26 MB en FP16, ~13 MB en INT8 y ~6-7 MB en 4 bits, más el overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU sirve; una T4, una GTX 1650 o incluso una iGPU son suficientes. A100, H100 o RTX 4090 están totalmente sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de la última década, y también en CPU, Raspberry Pi 4/5, NPUs móviles y placas con microcontroladores de gama alta previa conversión.
- Opciones de despliegue: `transformers` con PyTorch, exportación a ONNX Runtime u Optimum para inferencia en CPU, TorchScript, y conversión a ExecuTorch o TFLite para móvil. vLLM y TGI no aplican porque no es un modelo generativo. llama.cpp no es una vía práctica para BERT.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| eperez002/neurobert-test | 12,8M | 512 (heredado del base, no confirmado) | MIT | Repositorio de prueba, 0 descargas |
| boltuix/NeuroBERT-Small (origen declarado) | ~20M según su model card | No disponible | MIT | Repositorio público con documentación extensa |
| google-bert/bert-base-uncased | 110M | 512 | Apache 2.0 | Modelo de referencia, ampliamente utilizado |
| distilbert-base-uncased | 66M | 512 | Apache 2.0 | Muy extendido, con benchmarks GLUE publicados |
| prajjwal1/bert-tiny | 4,4M | 512 | Apache 2.0 | Usado como baseline en entornos de bajos recursos |

Frente a `bert-base-uncased` o DistilBERT, este modelo es entre 5 y 8 veces más pequeño, lo que reduce el coste de inferencia pero también la calidad esperada en tareas complejas; ninguno de los dos extremos está respaldado aquí por métricas propias. Los repositorios `boltuix/NeuroBERT`, `boltuix/NeuroBERT-Pro` y las variantes NeuroBERT-NER mencionadas en las búsquedas pertenecen a la misma familia nominal, pero no se dispone de sus especificaciones verificadas en la información proporcionada.

## Limitaciones y advertencias

- Repositorio sin validación: 0 descargas y 0 likes, nombre con el sufijo "test" y actualización apenas 50 minutos después de su creación, lo que sugiere un artefacto de prueba más que un modelo mantenido.
- Discrepancia de parámetros: la model card declara ~20M de parámetros y ~50 MB cuantizados, mientras que los safetensors contienen 12.781.114 parámetros. Hay que verificar qué checkpoint se está cargando realmente.
- Enlaces incorrectos: las instrucciones de descarga de la model card apuntan a `boltuix/NeuroBERT-Small`, no a `eperez002/neurobert-test`. Es una copia o derivado sin documentación propia.
- Ausencia total de benchmarks: las métricas listadas no tienen valores, y la única evaluación descrita son 10 frases de domótica. No hay evidencia de calidad en GLUE, NER o clasificación real.
- Sesgos heredados: al derivar de `bert-base-uncased`, arrastra los sesgos de su corpus web en inglés, no documentados ni mitigados en este repositorio.
- Idioma: solo inglés. El rendimiento en castellano no está evaluado y previsiblemente será pobre con el tokenizador original.
- Contexto limitado: 512 tokens como máximo si mantiene la configuración del base, insuficiente para documentos largos o conversaciones multi-turno.
- No es generativo: no sirve para chat, resumen, traducción ni generación de código; intentar usarlo con `pipeline("text-generation")` fallará.
- Riesgo de alucinación: bajo en el sentido generativo, pero sustituido por riesgo de clasificaciones erróneas con alta confianza softmax en dominios fuera de distribución.
- Licencia MIT: permite uso comercial y modificación sin restricciones, pero se distribuye "tal cual", sin garantías; conviene verificar la procedencia de los pesos antes de integrarlos en un producto.
- Anomalía en metadatos: las fechas de creación y actualización (24-10-2026) son posteriores a la fecha actual, lo que refuerza la impresión de metadatos de prueba.
- No se detalla la lista de ficheros del repositorio (config, tokenizer, cabezales), por lo que la carga con `AutoModel` puede requerir comprobaciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eperez002/neurobert-test
- Modelo original referenciado en la model card: https://huggingface.co/boltuix/NeuroBERT-Small
- Variante de la misma familia: https://huggingface.co/boltuix/NeuroBERT
- Variante Pro: https://huggingface.co/boltuix/NeuroBERT-Pro
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Ficha en AIBase: https://model.aibase.com/models/details/1927650044195115008
- Ficha de NeuroBERT-NER (modelo distinto): https://modelnova.ai/models/details/neurobert-ner
- Documentación de la familia NeuroBERT en Du-IN (contexto de neurociencia, no relacionado directamente): https://deepwiki.com/liulab-repository/Du-IN/5.4-neurobert-models
- Licencia MIT: https://opensource.org/licenses/MIT
