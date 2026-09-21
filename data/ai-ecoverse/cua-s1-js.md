# ai-ecoverse/cua-s1.js

## Resumen

cua-s1.js es un repositorio de pesos en formato ONNX listos para ejecutarse en navegador, publicados por ai-ecoverse. No contiene un modelo entrenado desde cero, sino la conversion del checkpoint `cua-ai/cua-s1-forms` (commit `f54adbf`) al grafo ONNX que consume la libreria JavaScript `@ai-ecoverse/cua-s1.js` a traves de `onnxruntime-web`. El modelo original, su dataset de entrenamiento y las reglas de planificacion son obra de Cua (licencia MIT); este repositorio solo aloja el checkpoint convertido.

El modelo resuelve un problema muy acotado dentro del ambito *computer-use*: decidir como rellenar un formulario. Recibe una descripcion del formulario, una lista de campos con su rol y etiqueta, y un conjunto de entidades extraidas de texto libre; devuelve logits y probabilidades por opcion, es decir, un plan de asignacion de valores a campos. La etiqueta `system-one` del repositorio lo situa como un componente rapido y reactivo, no como un modelo de razonamiento deliberativo.

Su relevancia practica esta en el empaquetado: un grafo de 3,3 MB con ejes dinamicos de batch, contexto, opcion y token de opcion que se ejecuta en el propio navegador mediante WASM, sin necesidad de backend ni GPU. El autor reporta una paridad con PyTorch de 3,2e-06 de diferencia maxima de probabilidad sobre 1.048 decisiones del generador sintetico de episodios de Cua, sin cambios de `argmax`. Se trata, en cualquier caso, de un checkpoint de investigacion entrenado con formularios sinteticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el `checkpoint.json` del repositorio original contiene la arquitectura y la firma de tensores, pero no se reproduce en la model card) |
| Parametros totales | no disponible (el grafo ONNX ocupa 3,3 MB; no se especifica la precision de los pesos, por lo que no puede derivarse el numero de parametros) |
| Longitud de contexto | no disponible (la exportacion define un eje de contexto dinamico, pero no se declara la longitud maxima soportada) |
| Tipos de cuantizacion | no disponible; la model card indica que el checkpoint se exporta sin modificar. La etiqueta `base_model:quantized:cua-ai/cua-s1-forms` sugiere algun tipo de cuantizacion en el modelo base, sin mas detalle |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18, exportado con el exportador basado en `torch.export`); el repositorio incluye `manifest.json` por carpeta y el `checkpoint.json` original de Cua |
| Tamano del grafo | 3,3 MB |
| Modelo base | `cua-ai/cua-s1-forms` (commit `f54adbf`) |
| Entrada | tensores de bytes producidos por `ByteCollator`; ejes dinamicos de batch, contexto, opcion y token de opcion |
| Salida | logits y probabilidades por opcion |
| Libreria de despliegue | `onnxruntime-web` (WASM) |
| Fecha de publicacion | 21 de septiembre de 2026 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

No se publican en la informacion disponible los detalles de arquitectura del checkpoint original: tipo de red, numero de capas, dimensiones de embeddings o mecanismo de atencion. La model card remite explicitamente al `checkpoint.json` de Cua para la arquitectura, la firma de tensores y los metadatos de entrenamiento, pero ese contenido no se reproduce. Lo unico documentado es la interfaz funcional: el modelo consume tensores de bytes y produce logits por opcion, con ejes dinamicos en batch, contexto, opcion y token de opcion.

Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La unica informacion sobre los datos es cualitativa: se trata de un checkpoint de investigacion entrenado con formularios sinteticos, y la verificacion de paridad se realizo sobre 1.048 decisiones generadas por el generador sintetico de episodios de Cua. La innovacion tecnica del repositorio no esta en el modelo, sino en el proceso de conversion: exportacion ONNX con `torch.export` (opset 18), validacion de la firma de tensores por SHA-256 mediante `cua_s1.model.load_checkpoint`, verificacion del SHA-256 del grafo en tiempo de carga desde el `manifest.json` y publicacion inmutable bajo rutas `r-<commit>/`, de modo que publicar un checkpoint nuevo no altera ficheros que un manifiesto antiguo referencia.

## Capacidades

- Toma de decisiones de relleno de formularios: dado un formulario descrito como lista de opciones (rol, etiqueta, valor actual, token) y un conjunto de entidades extraidas, produce un plan de asignacion.
- Extraccion de entidades auxiliar mediante `extractEntities`, segun el ejemplo de uso de la model card (telefono, telefono de trabajo, etc.).
- Salida probabilistica por opcion: devuelve logits y probabilidades, lo que permite aplicar umbrales de confianza o estrategias de desambiguacion.
- Ejecucion en navegador: inferencia en el cliente con `onnxruntime-web`, sin servidor, mediante el modulo WASM.
- Procesamiento por lotes y contexto variable: los ejes de batch y contexto son dinamicos en el grafo exportado.
- Soporte de *tool calling*, agentes multi-paso, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (*thinking*): no disponible; la etiqueta `system-one` apunta a un componente de decision rapida, no a un modo deliberativo.

## Casos de uso

- Autorrelleno de formularios web en el navegador: la libreria `@ai-ecoverse/cua-s1.js` carga el grafo con `loadCuaS1` y produce el plan en el cliente. Es adecuado porque evita enviar al servidor el contenido del formulario y las entidades extraidas.
- Automatizacion de RPA en aplicaciones de escritorio o web: dado un formulario detectado por un agente de *computer-use*, el modelo decide que valor corresponde a cada campo, reduciendo la necesidad de selectores fragiles o heuristicas manuales.
- Registro de pacientes en entornos clinicos (escenario del ejemplo oficial, "Northwind Clinic - New Patient Registration"): a partir de un texto con telefonos u otros datos, se asignan los valores al campo correcto cuando hay varios candidatos similares (por ejemplo, telefono personal frente a telefono de trabajo).
- Normalizacion y desambiguacion de entidades: cuando la extraccion devuelve varias entidades del mismo tipo, el modelo puntua cada opcion y permite elegir cual va a cada campo en funcion de la etiqueta y el token asociado.
- Pruebas automatizadas de extremo a extremo: integrado en un pipeline de CI, puede generar planes de relleno para formularios de prueba y detectar regresiones cuando cambia el marcado de la pagina.
- Asistentes de accesibilidad: ayuda a usuarios con dificultades motrices o cognitivas a completar formularios largos, sugiriendo el valor que corresponde a cada campo antes de la confirmacion humana.
- Aplicaciones offline o de borde: al ser un grafo de 3,3 MB ejecutable sobre WASM, puede distribuirse dentro de una extension o PWA sin dependencia de red ni de infraestructura de inferencia.
- Filtrado previo en canalizaciones con modelos mayores: usar el modelo como primera etapa barata para proponer un plan y reservar un modelo de lenguaje grande, mas costoso, para la validacion o los casos de baja confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo es la verificacion de paridad entre el grafo ONNX y el checkpoint PyTorch original, que no mide calidad de la tarea sino fidelidad de la conversion.

| Metrica | Valor |
|---|---|
| Diferencia maxima de probabilidad frente a PyTorch (max abs delta p) | 3,2e-06 |
| Decisiones evaluadas | 1.048 (generador sintetico de episodios de Cua) |
| Cambios de `argmax` | 0 |
| Benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) | no disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con un grafo de 3,3 MB, el modelo esta disenado para ejecutarse en CPU, no en GPU.
- GPU recomendadas: ninguna; el destino declarado es `onnxruntime-web` sobre WASM en el navegador.
- Compatibilidad con GPU de consumo: no aplica segun la informacion disponible; el consumo de memoria es del orden de megabytes, por lo que cabe en cualquier equipo que ejecute un navegador moderno con soporte WASM.
- Opciones de despliegue: `onnxruntime-web` (backend WASM), a traves de `@ai-ecoverse/cua-s1.js`. No se documentan otros runtimes en esta informacion, aunque al ser un grafo ONNX estandar (opset 18) podria cargarse con otros ejecutores ONNX, extremo no verificado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni alternativas comparables de la misma categoria (modelos de decision para relleno de formularios o componentes *system-one* para *computer-use*), por lo que no es posible establecer una comparacion con datos verificables.

## Limitaciones y advertencias

- Checkpoint de investigacion: esta entrenado con formularios sinteticos y el propio autor advierte de que debe leerse su model card y su `SECURITY.md` antes de confiar en el para uso real.
- Validacion limitada: la unica evaluacion reportada es la paridad numerica frente a PyTorch sobre datos sinteticos, no el rendimiento en formularios web reales.
- Riesgo de alucinacion y de asignacion incorrecta: al tratarse de un modelo de decision sobre opciones, puede elegir el campo equivocado o asignar una entidad a un campo con etiqueta similar; conviene aplicar umbrales sobre las probabilidades y una revision humana en flujos sensibles.
- Ambito funcional estrecho: no es un modelo de proposito general; no hay evidencia de generacion de texto libre, razonamiento, codigo o matematicas.
- Idiomas: no se declara ningun idioma soportado, lo que impide garantizar el comportamiento con formularios o etiquetas en castellano.
- Sesgos: no disponibles; al entrenarse con datos sinteticos, los sesgos dependeran del generador de episodios de Cua, que no se documenta aqui.
- Privacidad: la ejecucion en el navegador reduce la exposicion de datos del formulario, pero la extraccion de entidades y el plan resultante siguen siendo accesibles desde la pagina que ejecuta la libreria.
- Licencia: MIT, permisiva y apta para uso comercial. Los derechos del modelo original y de sus datos corresponden a Cua, que tambien los publica bajo MIT; este repositorio solo contiene el checkpoint convertido.
- Trazabilidad: los ficheros se publican bajo rutas `r-<commit>/` con SHA-256 verificado en la carga, lo que evita que un manifiesto antiguo apunte a un grafo distinto.
- Adopcion nula: el repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, por lo que no existe validacion de la comunidad.
- Inconsistencia de metadatos: el tamano del repositorio figura como 0,0 GB pese a que la model card describe un grafo de 3,3 MB; conviene verificar los ficheros reales antes de integrarlo.
- Fechas de publicacion en 2026, posteriores a la fecha habitual de referencia de muchos entornos; conviene comprobar la version exacta del commit antes de fijar una dependencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ai-ecoverse/cua-s1.js
- Modelo base en HuggingFace: https://huggingface.co/cua-ai/cua-s1-forms
- Codigo del modelo original (Cua, MIT): https://github.com/trycua/cua/tree/main/libs/cua-s1
- Guia de seguridad del modelo original: https://github.com/trycua/cua/blob/main/libs/cua-s1/SECURITY.md
- Libreria JavaScript que consume estos pesos: https://github.com/ai-ecoverse/cua-s1.js
