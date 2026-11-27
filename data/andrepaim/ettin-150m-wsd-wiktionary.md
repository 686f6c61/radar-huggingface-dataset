# andrepaim/Ettin-150m-WSD-wiktionary

## Resumen

Ettin-150m-WSD-wiktionary es un modelo de desambiguacion del sentido de las palabras (word-sense disambiguation, WSD) en ingles, desarrollado por el usuario andrepaim. Se trata de un fine-tuning de `sign/Ettin-150m-WSD` sobre los ejemplos de uso y citas del Wikcionario en ingles, con etiquetas suaves generadas por el modelo mayor `sign/Ettin-1B-WSD`. El modelo resuelve un problema concreto: dado un pasaje con una palabra marcada y una lista de definiciones de diccionario, elegir cual de ellas se ajusta al contexto, o indicar que ninguna lo hace.

La arquitectura es ModernBERT (22 capas, tamano oculto 768, aproximadamente 150M parametros), con una innovacion relevante: sustituye el decodificador de vocabulario habitual por un decodificador de 128 respuestas, de modo que el modelo emite un logit por cada opcion candidata en lugar de predecir tokens. El contexto maximo es de 2.048 tokens y los pesos se distribuyen en float32 y en ONNX INT8 para ejecucion en navegador.

Su relevancia practica radica en el despliegue: el modelo se uso para la extension de Chrome Contextual Dictionary, que ejecuta la version ONNX INT8 en el navegador mediante ONNX Runtime Web (WebAssembly), sin enviar el texto seleccionado a ningun servidor. Es, por tanto, un ejemplo de WSD local y de baja latencia, aunque su alcance queda limitado al ingles y a un unico dominio de diccionario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (22 capas, hidden size 768), decodificador de 128 respuestas en lugar del decodificador de vocabulario |
| Parametros totales | 149.703.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | float32 (pesos y export ONNX); INT8 ONNX para navegador |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (float e INT8) |

## Arquitectura y entrenamiento

El modelo parte de `sign/Ettin-150m-WSD` (revision `8751b577199d1bb95b74fa2457da7065d57100ae`), un ModernBERT de 22 capas y 768 dimensiones ocultas entrenado originalmente sobre definiciones de WordNet. El fine-tuning reorienta el modelo hacia las definiciones del Wikcionario en ingles, usando los propios ejemplos de uso y citas de Wikcionario como datos, con etiquetas suaves procedentes del modelo mayor `sign/Ettin-1B-WSD` (revision `e6fc37a7e11fee91a600a0cd8e7423bcc639a1cc`). No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de `wikimedia/wikipedia` y el Wikcionario.

La innovacion arquitectonica clave es el decodificador de 128 vias: el modelo lee el token `[MASK]` al final del prompt y emite un logit por cada letra de respuesta posible (A-Z, a-z, 0-9, puntuacion, griego y cirilico), en lugar de predecir sobre el vocabulario completo. El formato de prompt `compact-v1` coloca el pasaje con la palabra objetivo entre asteriscos, una definicion por letra, la opcion "none of the above" en la letra 127 (cirilica `а`, U+0430) y una linea final con `[unused0] [MASK]`. La clase `WSDModernBertForMaskedLM` no forma parte de transformers y vive en el repositorio del modelo base; la model card documenta como cargarlo con transformers estandar sustituyendo el decodificador. Se mencionan en el entrenamiento warm-up, weight decay y mixed precision, sin cifras concretas en la informacion disponible.

## Capacidades

- Desambiguacion del sentido de palabras en ingles como tarea de eleccion multiple entre definiciones de diccionario.
- Seleccion entre hasta 127 opciones mas la opcion "none of the above" (letra 127).
- Manejo de prompts de hasta 2.048 tokens, con pasajes y definiciones de hasta 1.600 caracteres en la extension.
- Salida calibrada como softmax sobre los logits de las letras ofrecidas; `calibration.json` es la identidad (temperatura 1.0, sin calibrar).
- Ejecucion local en navegador mediante ONNX Runtime Web y WebAssembly con el fichero INT8.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento; la informacion disponible no documenta ninguna de estas capacidades.
- Capacidad multilingue limitada al ingles, aunque el conjunto de letras de respuesta incluye caracteres griegos y cirilicos.

## Casos de uso

- Extension de navegador para consulta de diccionario: el modelo recibe el pasaje seleccionado por el lector y las definiciones del Wikcionario, y ordena primero la acepcion que encaja; se ejecuta en local con el ONNX INT8, sin salida de datos del equipo.
- Procesamiento por lotes de corpus para anotacion lexica: dado un conjunto de oraciones y un lexico de definiciones, el modelo asigna la acepcion mas probable por ocurrencia, util para construir datasets de WSD o evaluar cobertura lexica.
- Enriquecimiento de motores de busqueda internos: al indexar documentos en ingles, se puede asociar a cada termino ambiguo la definicion contextual y mejorar la precision de la recuperacion.
- Soporte a traduccion asistida: identificar la acepcion de una palabra polisemica en el texto origen antes de pasar la frase a un sistema de traduccion, reduciendo errores por homonimia.
- Analisis de sentimiento y opinion a nivel de aspecto: desambiguar terminos polisemicos en resenas para asignar correctamente la polaridad a la acepcion relevante.
- Filtrado y normalizacion de contenido: detectar el sentido de terminos en textos de moderacion o clasificacion para reducir falsos positivos derivados de la polisemia.
- Herramientas educativas de aprendizaje de vocabulario: presentar al estudiante la definicion del Wikcionario que corresponde al uso concreto en la frase de ejemplo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `docs/validation.md` del repositorio de la extension (seccion "Training round 1 (assets-v2)") para las mediciones, pero no se incluyen cifras numericas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en float32 para los 149,7M parametros, mas activaciones; el fichero ONNX INT8 reduce el peso a una fraccion de ese valor.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, el modelo cabe en cualquier GPU consumer moderna e incluso en CPU.
- Cabe en GPU consumer: si, con amplio margen, en tarjetas como RTX 3060, RTX 4060 o superiores; tambien en CPU.
- Opciones de despliegue: ONNX Runtime Web (WebAssembly) en navegador, segun la model card; transformers con PyTorch en CPU (probado con transformers 5.23.0 y PyTorch 2.14.1); vLLM, llama.cpp, Ollama o TGI no estan documentados para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| andrepaim/Ettin-150m-WSD-wiktionary | 149,7M | 2.048 tokens | WSD con definiciones de Wikcionario | apache-2.0 | Hugging Face, ONNX en navegador |
| sign/Ettin-150m-WSD | no disponible | no disponible | WSD con definiciones de WordNet | no disponible | Hugging Face |
| sign/Ettin-1B-WSD | no disponible | no disponible | WSD con definiciones de WordNet; genera etiquetas suaves | no disponible | Hugging Face |

La comparativa se limita a los modelos de la misma familia citados en la informacion disponible; no se dispone de datos de rendimiento para contrastar.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta cobertura de otros idiomas.
- Ventana de contexto de 2.048 tokens y, en el uso previsto, prompts de hasta 1.600 caracteres y 24 definiciones por consulta.
- La salida no esta calibrada: `calibration.json` es la identidad (temperatura 1.0), por lo que las probabilidades deben interpretarse con cautela.
- El modelo depende de un formato de prompt estricto (`compact-v1`); la extension rechaza pasajes o definiciones que contengan `*`, `[MASK]`, `[unused…]` u otros tokens especiales o caracteres de control.
- La clase `WSDModernBertForMaskedLM` no forma parte de transformers; requiere codigo del repositorio del modelo base o la sustitucion manual del decodificador documentada en la model card.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible; al tratarse de una tarea de clasificacion cerrada sobre definiciones ofrecidas, el margen de invencion es menor, pero no se aportan evaluaciones de sesgo.
- Licencia apache-2.0, que permite uso comercial con las condiciones habituales de atribucion y aviso de licencia.
- El repositorio no registra descargas ni likes, y la fecha de creacion indicada es 2026-11-26; conviene verificar la vigencia y el mantenimiento antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andrepaim/Ettin-150m-WSD-wiktionary
- Modelo base: https://huggingface.co/sign/Ettin-150m-WSD
- Modelo que genera las etiquetas suaves: https://huggingface.co/sign/Ettin-1B-WSD
- Extension Contextual Dictionary: https://github.com/andrepaim/contextual-dictionary
- Documentacion de validacion: https://github.com/andrepaim/contextual-dictionary/blob/main/docs/validation.md
- Release de assets de la extension: https://github.com/andrepaim/contextual-dictionary/releases/tag/assets-v2
- Codigo del modelo base: https://github.com/sign/word-sense-disambiguation
