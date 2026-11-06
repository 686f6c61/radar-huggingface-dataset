# ikppramesh/irx-1-GGUF

## Resumen

IRx-1 es un modelo de lenguaje de pequeno tamano (1.881.825.088 parametros, aproximadamente 1,9 mil millones) desarrollado por el usuario de Hugging Face ikppramesh como parte de la familia IRx, una coleccion de cuatro modelos disenados para ejecutarse integramente en local y sin conexion en telefonos, tablets y ordenadores personales. La version aqui documentada es la distribucion en formato GGUF, optimizada para llama.cpp y para aplicaciones derivadas como PocketPal, LM Studio, Ollama o llama.rn. El modelo se posiciona como la opcion de respuesta rapida para el dia a dia dentro de su familia: no busca competir en razonamiento complejo, sino ofrecer respuestas breves, explicaciones sencillas, borradores y listas de verificacion de forma instantanea y privada.

La relevancia de IRx-1 reside en su enfoque de privacidad radical (nada de lo que escribe el usuario abandona el dispositivo) y en su bajo requisito de recursos: el archivo Q4_K_M ocupa aproximadamente 1,2 GB y cabe en practicamente cualquier telefono o tablet moderno. La model card menciona explicitamente que el modelo se reentrena semanalmente con noticias hasta el 4 de noviembre de 2026, lo que sugiere un ciclo de actualizacion frecuente orientado a mantener cierta frescura informativa en un modelo de bolsillo.

El repositorio incluye una nota tecnica relevante sobre un fallo de conversion silencioso entre MLX y llama.cpp que el autor detecto y corrigio antes de publicar esta build: un GGUF que cargaba sin errores pero generaba texto incoherente debido a dos problemas de layout de tensores (el peso `conv1d` de las capas de atencion lineal y el convenio de offset de los RMSNorm). Este detalle es util para cualquiera que intente convertir modelos hibridos con atencion lineal desde MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas de atencion lineal (18 capas de atencion lineal mencionadas en la model card; arquitectura exacta no disponible) |
| Parametros totales | 1.881.825.088 (~1,9 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (configuracion recomendada por el autor) |
| Tipos de cuantizacion | GGUF, con Q4_K_M como cuantizacion principal publicada (~1,2 GB); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); checkpoint original en safetensors segun los metadatos del repo |

## Arquitectura y entrenamiento

La informacion disponible indica que IRx-1 emplea una arquitectura transformer hibrida que incorpora capas de atencion lineal: la model card menciona explicitamente "all 18 linear-attention layers" al describir el bug de conversion de `conv1d.weight`, lo que confirma la presencia de mecanica de estado recurrente en parte de la red. No se detalla el numero total de capas, la dimension oculta, el numero de cabezas ni la composicion exacta del bloque hibrido. El checkpoint original se distribuye en safetensors con 1.881.825.088 parametros, y la version MLX existe como artefacto separado en el repositorio `ikppramesh/irx-1`.

En cuanto al entrenamiento, la model card afirma que el modelo se entrena con noticias hasta el 4 de noviembre de 2026 y que se reconstruye y revisa cada semana, pero no se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT supervisado. Tampoco hay informacion sobre la longitud de contexto nativa durante el entrenamiento ni sobre el uso de decodificacion especulativa. La unica innovacion tecnica documentada con detalle es la correccion del pipeline de conversion MLX a GGUF: el autor detecto que la conversion estandar producia un archivo que cargaba sin errores pero generaba texto basura, y lo atribuyo a dos causas verificadas contra el checkpoint original (el layout de `conv1d.weight` en las 18 capas de atencion lineal y el convenio de offset cero-centrado de 61 tensores RMSNorm). La correccion esta publicada en el script `scripts/fix_gguf_mlx_conversion.py` del repositorio principal de GitHub.

## Capacidades

- Generacion de texto conversacional de forma breve y rapida, orientada a respuestas de una o pocas frases.
- Explicaciones sencillas de conceptos (por ejemplo, "explica la fotosintesis en dos frases").
- Redaccion de borradores cortos y mensajes de uso cotidiano (WhatsApp, correos breves, notas).
- Generacion de listas de verificacion y listas de tareas (equipaje, compras, tramites).
- Ayuda basica con codigo: explicaciones de errores HTTP, fragmentos de una linea en Python y tareas similares.
- Conversion de unidades y calculos aritmeticos simples (por ejemplo, Celsius a Fahrenheit).
- Generacion de preguntas de cuestionario y actividades didacticas sencillas.
- Funcionamiento completamente offline en aplicaciones basadas en llama.cpp (PocketPal en iPhone, iPad y Android; LM Studio; Ollama; llama.rn).
- Plantilla de chat integrada que fuerza el modo "thinking" desactivado y proporciona un system prompt propio cuando la aplicacion no envia ninguno.
- No soporta tool calling ni function calling: la model card advierte explicitamente que el modelo nunca fue entrenado para ello y que no debe exponerse esa capacidad en aplicaciones anfitrionas.

## Casos de uso

- Asistencia rapida sin conexion en el movil: el modelo cabe en un archivo Q4_K_M de ~1,2 GB y se ejecuta en PocketPal o Ollama, de modo que un usuario en una zona sin cobertura puede consultar dudas cotidianas, conversiones de unidades o definiciones sin enviar datos a ningun servidor.
- Soporte a desarrolladores en movilidad: consultas puntuales sobre codigos de error HTTP, fragmentos de una linea en Python o recordatorios de sintaxis, resueltas en el propio dispositivo sin depender de una API externa ni de conectividad.
- Herramienta para estudiantes: generacion de explicaciones breves de conceptos cientificos y creacion de cuestionarios de repaso (por ejemplo, cinco preguntas sobre fracciones), adecuada por su bajo coste computacional y su funcionamiento offline en tablets de gama media.
- Apoyo a docentes: sugerencias de actividades de calentamiento para el aula y materiales didacticos breves, generados en el dispositivo del profesor sin exponer datos de alumnos a servicios en la nube.
- Pequenos negocios y comercio local: redaccion de mensajes promocionales de una linea para WhatsApp o redes sociales, con la ventaja de que la informacion comercial no sale del telefono del propietario.
- Planificacion de viajes y tareas domesticas: creacion de listas de equipaje para viajes de varios dias, listas de la compra o planes de comidas rapidas, con respuestas inmediatas y sin coste por token.
- Escenarios de baja conectividad o privacidad estricta: cualquier flujo en el que este prohibido enviar texto a terceros (entornos sanitarios, legales o industriales) y baste con respuestas generales de baja profundidad, aprovechando que el modelo corre integramente en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y tampoco ofrece comparaciones cuantitativas con modelos de tamano similar. El unico dato de rendimiento mencionado es cualitativo: el autor describe IRx-1 como "pequeno y rapido" y lo situa como la opcion de respuestas rapidas del dia a dia dentro de la familia IRx, pero sin aportar tokens por segundo, latencia ni metricas de calidad medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB para la cuantizacion Q4_K_M publicada; otras cuantizaciones no estan documentadas.
- GPU recomendadas: no se especifican modelos concretos de GPU de escritorio; el enfasis esta en ejecucion en CPU de telefonos y tablets.
- Compatibilidad con GPU de consumo: por su tamano (~1,9 B de parametros y ~1,2 GB en Q4_K_M), cabe holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM, aunque el autor no publica pruebas especificas en RTX 4090, RTX 3060 u otras.
- Requisito en movil: la model card indica que IRx-1 esta pensado para "casi cualquier telefono o tablet moderno"; el modelo menor de la familia (IRx-mini, ~1,1 GB) se reserva para telefonos con solo 4 GB de RAM.
- Opciones de despliegue: llama.cpp (CLI con `llama-cli`), PocketPal (iPhone, iPad, Android), LM Studio, Ollama y aplicaciones construidas con llama.rn / React Native.
- Parametros de inferencia recomendados por el autor: contexto de 8192 tokens, maximo de 1024 tokens nuevos, temperatura 0,7, top-p 0,95, min-p 0,05 y penalizacion de repeticion 1,1 (tambien embebida como valor por defecto en el archivo).
- Latencia y throughput: no disponibles. La model card menciona que el "IRx board" compara la velocidad medida de los cuatro modelos en vivo, pero no se transcriben cifras en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible solo permite comparar IRx-1 con los otros miembros de su propia familia, ya que no se aportan datos de benchmarks ni especificaciones de modelos de terceros.

| Modelo | Parametros | Tamano de descarga | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| IRx-mini | No disponible | ~1,1 GB | No disponible | El mas pequeno; telefonos con 4 GB de RAM | No disponible |
| IRx-1 | ~1,9 B | ~1,2 GB (Q4_K_M) | 8192 | Respuestas rapidas del dia a dia en casi cualquier telefono | Apache 2.0 |
| IRx-2 | No disponible | ~2,7 GB | No disponible | Mejor equilibrio calidad/velocidad; recomendado por el autor | No disponible |
| IRx-2 Pro | No disponible | ~5,3 GB | No disponible | Respuestas largas y conversaciones extensas; dispositivos con 12 GB+ de RAM | No disponible |

No se dispone de comparaciones con modelos de otros desarrolladores (por ejemplo, alternativas de ~2 B parametros para movil) en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion elevado: la propia model card advierte que, como cualquier modelo pequeno offline, puede afirmar con seguridad cosas falsas; hay que verificar precios, medicamentos y dosis, leyes y consejos agricolas locales (variedades de semilla, cantidades de quimicos, meteorologia).
- No sustituye a profesionales: las respuestas medicas, legales y financieras son informacion general, no asesoramiento.
- Sin soporte de tool calling ni function calling: el modelo nunca fue entrenado para ello y la model card pide explicitamente no habilitar esa capacidad en aplicaciones anfitrionas.
- Contexto limitado a 8192 tokens en la configuracion recomendada; no es adecuado para documentos largos ni conversaciones muy extensas (para eso el autor remite a IRx-2 Pro).
- Idiomas soportados no documentados: no hay informacion sobre calidad multilingue ni sobre el idioma principal de entrenamiento.
- Sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial sin restricciones adicionales conocidas; no obstante, la model card no detalla condiciones especificas mas alla de la licencia.
- Caveat de despliegue: el autor advierte de un bug de conversion silencioso en el pipeline MLX a GGUF para arquitecturas con atencion lineal; quien reconvierta el modelo debe aplicar las correcciones descritas (layout de `conv1d.weight` y offset de RMSNorm) y usar `--no-mtp` en la conversion.
- Actualizacion manual: las aplicaciones no reemplazan solas el archivo descargado; para actualizar hay que borrar el modelo antiguo en la app y volver a descargarlo, y resetear cualquier plantilla de chat personalizada.
- Madurez y adopcion bajas: 30 descargas y 1 like en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/ikppramesh/irx-1-GGUF
- Modelo principal IRx-1 (checkpoint original): https://huggingface.co/ikppramesh/irx-1
- Repositorio GitHub del proyecto: https://github.com/ikppramesh/irx-1
- IRx-mini (GGUF): https://huggingface.co/ikppramesh/irx-mini-GGUF
- IRx-mini (MLX): https://huggingface.co/ikppramesh/irx-mini
- IRx-2 (GGUF): https://huggingface.co/ikppramesh/irx-2-GGUF
- IRx-2 (MLX): https://huggingface.co/ikppramesh/irx-2
- IRx-2 Pro (GGUF): https://huggingface.co/ikppramesh/irx-2-pro-GGUF
- IRx-2 Pro (MLX): https://huggingface.co/ikppramesh/irx-2-pro
- Tablero comparativo IRx (artifact de Claude): https://claude.ai/artifact/1ha4zVccAwrKSm3mjKBLFU
