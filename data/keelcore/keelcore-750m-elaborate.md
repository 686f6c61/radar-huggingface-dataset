# KeelCore/KeelCore-750M-Elaborate

## Resumen

KeelCore-750M-Elaborate es un adaptador LoRA de rango 16 sobre el modelo base KeelCore-750M, desarrollado por KeelCore (autor: Saravanan A R). Su funcion es reescribir texto breve en ingles hacia una formulacion mas extensa y formal, expandiendo frases concisas y notas en parrafos mas completos sin alterar el significado de forma deliberada. No es un modelo de chat ni un asistente conversacional: solo reescribe el texto que recibe.

El adaptador anade 18,29 millones de parametros entrenables (2,43 % del modelo base) y ocupa 73 MB en disco. El modelo base es un transformer encoder-decoder de 750 millones de parametros, lo que permite que el adaptador lea la entrada completa antes de generar y pueda copiar literalmente nombres, URL y direcciones de correo en la salida.

Es relevante por su enfoque de eficiencia: un adaptador pequeno sobre un modelo base congelado, ejecutable en CPU o en navegador mediante ONNX Runtime Web, orientado a casos donde el texto no debe salir del dispositivo del usuario. La licencia es propietaria (KeelCore License 1.0) y el modelo solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16) sobre transformer encoder-decoder |
| Parametros totales | 18,29 M entrenables en el adaptador (2,43 % del base de 750 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (salida limitada a 384 tokens nuevos por defecto) |
| Tipos de cuantizacion | no disponible (base cargado en float32, aprox. 3 GB de memoria) |
| Idiomas soportados | ingles (en) |
| Licencia | KeelCore License 1.0 (propietaria, licencia "other") |
| Formato de pesos | adapter.safetensors + adapter_config.json (formato propio KeelCore, no PEFT); carpeta ONNX disponible |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre el modelo base KeelCore-750M, un transformer encoder-decoder de 750 millones de parametros. Al ser encoder-decoder, el modelo procesa la entrada completa antes de decodificar, lo que facilita la copia literal de entidades exactas (URL, correos, nombres) en la salida. El adaptador ensena la tarea de reescritura; los pesos del base permanecen congelados.

La entrada se enmarca automaticamente con la plantilla ` <text_to_rewrite> ... </text_to_rewrite> </s>`. La salida se genera hasta un maximo de 384 tokens nuevos con la configuracion por defecto. Segun la model card, en el conjunto de validacion las salidas son de media un 36 % mas largas que la entrada. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO.

El adaptador se distribuye en un formato propio de KeelCore (`adapter.safetensors` con `adapter_config.json`), no en formato PEFT, y el codigo de carga verifica una huella de los pesos del base, rechazando cargarse sobre cualquier modelo distinto de KeelCore-750M.

## Capacidades

- Reescritura y elaboracion de texto en ingles: expande frases concisas y notas en formulaciones mas completas y de registro mas formal.
- Preservacion de texto exacto: al ser encoder-decoder, puede copiar literalmente URL, direcciones de correo y numeros de telefono en la salida.
- Ejecucion en CPU o GPU con PyTorch, y en navegador mediante ONNX Runtime Web.
- Procesamiento por lotes: la funcion `rephrase()` acepta una lista de textos y devuelve una lista de reescrituras.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo de chat: no responde preguntas ni sigue instrucciones contenidas en el texto.
- Solo ingles; no hay soporte multilingue.

## Casos de uso

- Mejora de mensajes cortos en aplicaciones de mensajeria: el adaptador convierte notas breves ("The meeting is at 3pm") en frases completas ("The meeting is scheduled to take place at 3pm"), adecuado para borradores de correo o respuestas formales.
- Procesamiento en el dispositivo o en el navegador: al ejecutarse en CPU o via ONNX Runtime Web, permite reescribir texto sin que salga del equipo del usuario, util en entornos con requisitos de privacidad.
- Estandarizacion de registro en documentacion interna: convierte notas tecnicas taquigraficas en texto formal para manuales o wikis, manteniendo intactos URL y correos de contacto.
- Preprocesado en pipelines de generacion de contenido: como paso previo que expande resumenes o bullets en parrafos completos antes de una revision humana.
- Investigacion sobre adaptadores pequenos: sirve como punto de partida para estudiar LoRA de bajo rango sobre un modelo base compartido, con codigo de carga e inferencia disponible en GitHub.
- Normalizacion de mensajes de soporte: reescribe respuestas breves de atencion al cliente en un tono mas formal y completo, con verificacion humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el modelo base se carga en float32 y requiere aproximadamente 3 GB de memoria; el adaptador anade 73 MB.
- GPU recomendadas: no se especifican modelos concretos; el adaptador puede ejecutarse en CPU o CUDA.
- Cabe en GPU de consumo: si, dado el reducido tamano del base (750 M de parametros en float32, aprox. 3 GB), es viable en GPUs de consumo con suficiente memoria.
- Opciones de despliegue: PyTorch (CPU o CUDA) mediante el codigo del repositorio KeelCore; ONNX Runtime Web para navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores de reescritura de texto sobre modelos encoder-decoder de ~750 M).

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas.
- No es un modelo conversacional: no responde preguntas ni sigue instrucciones incluidas en el texto; solo reescribe.
- Riesgo de alteracion de contenido: el estilo anade palabras y puede modificar matices; no debe usarse en texto donde cada caracter deba permanecer inalterado (clausulas legales, codigo, configuracion, cifras financieras) sin revision humana.
- Texto ya extenso: el estilo alarga la salida, por lo que empeora textos largos.
- Riesgo de alucinacion: no se documenta explicitamente, pero al ser un modelo generativo de reescritura puede introducir cambios de significado no deseados.
- Licencia propietaria (KeelCore License 1.0): es necesario revisar los terminos del archivo LICENSE para uso comercial; la licencia se etiqueta como "other".
- Formato no estandar: el adaptador no usa PEFT, sino un formato propio de KeelCore, lo que limita su uso con herramientas genericas.
- Dependencia estricta del base: el codigo rechaza cargar el adaptador sobre cualquier modelo distinto de KeelCore-750M.
- Repositorios privados en el momento de la publicacion: el acceso requiere autenticacion con `huggingface-cli login`.
- Sin descargas ni likes registrados en Hugging Face: ecosistema y validacion externa practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KeelCore/KeelCore-750M-Elaborate
- Modelo base: https://huggingface.co/KeelCore/KeelCore-750M
- Informe tecnico: https://saravanan-a-r.github.io/KeelCore/
- Repositorio GitHub: https://github.com/saravanan-a-r/KeelCore
- Licencia: https://huggingface.co/KeelCore/KeelCore-750M-Elaborate/blob/main/LICENSE
- Perfil del autor: https://www.linkedin.com/in/saravanan-a-r/
