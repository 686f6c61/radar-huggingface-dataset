# bhanc/scratch

## Resumen

`bhanc/scratch` es un repositorio de modelo publicado en HuggingFace por el usuario bhanc (Bartosz Hanc). La unica etiqueta funcional presente en la ficha del repositorio es `executorch`, lo que indica que el artefacto esta orientado al runtime de inferencia en dispositivo de Meta (ExecuTorch), y no a un despliegue clasico en servidor con transformers. El repositorio ocupa 118,2 GB, un tamano considerable que sugiere la presencia de pesos originales sin cuantizar junto con, probablemente, exportaciones derivadas.

No se ha publicado informacion sobre arquitectura interna, numero de parametros, longitud de contexto, idiomas soportados ni licencia. La ficha de HuggingFace no declara pipeline, no declara licencia y no incluye lenguajes, por lo que cualquier afirmacion sobre capacidades reales seria especulativa. Tampoco existe una model card descriptiva mas alla de los metadatos automaticos.

El interes actual del repositorio es limitado pero relevante en un nicho concreto: es un ejemplo de modelo empaquetado para ExecuTorch, el stack de inferencia en el borde que Meta impulsa para Android e iOS. Con 1.984 descargas acumuladas y 0 likes, se trata de un artefacto con traccion moderada y sin validacion comunitaria. Cualquier evaluacion seria exige inspeccionar el contenido del repositorio antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la etiqueta `executorch` implica exportacion al runtime ExecuTorch, que admite cuantizacion int8 y fp16, pero no se confirma en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la etiqueta `executorch` apunta a artefactos `.pte`, sin confirmacion explicita) |
| Tamano del repositorio | 118,2 GB |
| Descargas acumuladas | 1.984 |
| Likes | 0 |
| Fecha de creacion | 2026-06-05 |
| Ultima actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. No hay datos sobre si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un modelo hibrido. Tampoco hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o similares.

El unico dato tecnico contrastable es la etiqueta `executorch`, que situa el artefacto en el ecosistema de ExecuTorch: un runtime de inferencia en dispositivo disenado para ejecutar modelos PyTorch exportados (formato `.pte`) en movil, escritorio embebido y microcontroladores. Esta etiqueta describe el destino de despliegue, no la arquitectura del modelo. El tamano del repositorio (118,2 GB) es compatible con pesos en precision completa o media, pero no permite deducir el numero de parametros sin conocer la precision efectiva de los ficheros.

## Capacidades

- Generacion de texto: no confirmada en la informacion disponible.
- Razonamiento, codigo o matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades multimodales (vision, audio): no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Ejecucion en dispositivo mediante ExecuTorch: inferida a partir de la unica etiqueta presente en el repositorio, sin documentacion de soporte.

## Casos de uso

Los siguientes escenarios se plantean de forma condicional, dado que no se ha confirmado ninguna capacidad concreta del modelo. Se basan en el perfil de despliegue que sugiere la etiqueta `executorch` y en el tamano del repositorio.

- Inferencia en dispositivo movil sin conexion: si el repositorio contiene una exportacion `.pte` funcional, el modelo podria ejecutarse en Android o iOS mediante el runtime ExecuTorch, evitando el envio de datos a servidores externos. Es el escenario que justifica la etiqueta registrada.
- Asistentes embebidos con requisitos de privacidad: aplicaciones que procesan texto sensible (sanitario, legal, financiero) podrian mantener los datos en el dispositivo si el modelo es lo bastante pequeno tras la cuantizacion. La viabilidad depende del numero de parametros, actualmente desconocido.
- Prototipado de pipelines de borde: desarrolladores que evaluan ExecuTorch como alternativa a llama.cpp u ONNX Runtime podrian usar este repositorio como referencia de empaquetado, aunque sin model card el valor formativo es limitado.
- Automatizacion local en escritorio: si existe una variante cuantizada, podria integrarse en herramientas de escritorio que requieran generacion de texto sin dependencia de API externa.
- Investigacion sobre cuantizacion y exportacion: el repositorio podria servir para estudiar el impacto de la conversion a `.pte` sobre la calidad, comparando pesos originales y exportados. Requiere acceso a ambos conjuntos.
- Base para ajuste fino posterior: si los pesos estan en formato PyTorch estandar, podrian servir como punto de partida para fine-tuning. No hay evidencia en la informacion disponible de que esto sea posible ni de que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar para este repositorio. Las paginas de terceros consultadas (directorios de modelos que indexan HuggingFace) no aportan metricas propias; se limitan a replicar los metadatos del repositorio.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se puede estimar sin conocer el numero de parametros y la precision de los pesos.
- Estimacion indirecta a partir del tamano del repositorio (118,2 GB): si todo el contenido fuese un unico checkpoint, equivaldria aproximadamente a 59.000 millones de parametros en fp16, 29.500 millones en fp32 o 118.000 millones en int8. Son hipotesis aritmeticas, no datos confirmados, y es probable que el repositorio contenga varias copias del modelo en distintos formatos.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el runtime ExecuTorch es el unico implicado por las etiquetas. Si el repositorio incluyese tambien pesos en formato transformers, serian aplicables vLLM, TGI, Ollama o llama.cpp, pero esto no esta confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Sin conocer el numero de parametros, el contexto ni la licencia, no es posible establecer una comparacion con alternativas de la misma categoria. La comparacion natural seria contra otros modelos empaquetados para ExecuTorch (por ejemplo, las variantes de Llama exportadas por Meta para ese runtime), pero no hay datos de rendimiento de este repositorio que permitan un contraste fundamentado.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripcion de arquitectura, datos de entrenamiento, sesgos conocidos ni limitaciones declaradas por el autor.
- Licencia no especificada: sin licencia explicita, el uso comercial es juridicamente arriesgado. En la practica, la ausencia de licencia implica reserva de derechos por defecto en la mayoria de jurisdicciones, aunque HuggingFace no lo marque como restringido.
- Riesgo de alucinacion: no evaluable sin informacion sobre el entrenamiento y sin benchmarks publicados.
- Sesgos: no documentados. No hay informacion sobre la composicion del dataset ni sobre procesos de alineacion.
- Idiomas soportados: desconocidos. No se puede garantizar un rendimiento aceptable en castellano.
- Contexto: desconocido. No se puede planificar una aplicacion que dependa de ventanas largas.
- Repositorio de 118,2 GB: la descarga es costosa en ancho de banda y almacenamiento, y no hay documentacion que indique que ficheros son necesarios.
- Sin validacion comunitaria: 0 likes y ausencia de issues o discusiones publicas. No hay senales externas de que el modelo funciones segun lo esperado.
- Fechas de metadatos incoherentes con el calendario habitual (creacion en junio de 2026, actualizacion en octubre de 2026): conviene verificar la procedencia antes de integrarlo en cualquier flujo de trabajo.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/bhanc/scratch
- Perfil del autor (Bartosz Hanc): https://huggingface.co/bhanc
- Ficha de terceros con metadatos del modelo: https://essamamdani.com/ai-models/hf-bhanc-scratch
- Directorio de modelos del autor en ese mismo sitio: https://essamamdani.com/ai-models/company/bhanc
- Comparador de benchmarks consultado: https://benchlm.ai/
