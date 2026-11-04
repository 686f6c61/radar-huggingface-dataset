# KeelCore/KeelCore-750M-Friendly

## Resumen

KeelCore-750M-Friendly es un adaptador LoRA de rango 16 disenado para reescribir texto en ingles con un tono mas calido, cercano e informal. No es un modelo completo, sino un fichero de 73 MB (18,29 millones de parametros entrenables, el 2,43 % del modelo base) que se aplica sobre KeelCore-750M, un modelo encoder-decoder congelado. Lo desarrolla Saravanan A R bajo la organizacion KeelCore y se distribuye con la licencia propietaria KeelCore License 1.0.

El adaptador resuelve un problema muy concreto: transformar frases rigidas o corporativas en versiones mas amables (por ejemplo, "assistance" pasa a "help"), introducir contracciones, suavizar ordenes convirtiendolas en peticiones y, ocasionalmente, anadir un emoji. Al estar construido sobre un encoder-decoder, lee la entrada completa antes de generar, lo que le permite copiar literalmente nombres, URLs, correos y numeros de telefono en la salida, algo relevante para reescritura fiel.

Su interes actual reside en el nicho: es un adaptador pequeno, ejecutable en CPU o en navegador via ONNX Runtime Web, pensado para reescritura de tono en aplicaciones donde el texto no debe salir del dispositivo del usuario. No es un modelo conversacional ni responde preguntas: solo reescribe el texto que recibe. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo base figura como privado en las instrucciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre modelo base encoder-decoder KeelCore-750M |
| Parametros totales | 18,29 M entrenables en el adaptador (2,43 % del base); el base es de 750 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (salida limitada a 384 tokens nuevos por defecto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | KeelCore License, Version 1.0 (propietaria, etiquetada como "other") |
| Formato de pesos | `adapter.safetensors` + `adapter_config.json` en formato KeelCore (no PEFT); soporte ONNX Runtime Web |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre KeelCore-750M, un modelo base de tipo encoder-decoder con 750 millones de parametros que permanece congelado. El adaptador anade 18,29 millones de parametros entrenables, lo que representa el 2,43 % del total del base. La naturaleza encoder-decoder permite que el modelo procese la entrada completa antes de generar la salida, facilitando la copia exacta de entidades como nombres, URLs, direcciones de correo y numeros de telefono.

La entrada se enmarca automaticamente con la plantilla ` <text_to_rewrite> ... </text_to_rewrite> </s>`, y la salida se limita a 384 tokens nuevos con la configuracion por defecto. Segun la model card, el adaptador fue entrenado sobre reescrituras con un tono amable; aproximadamente el 23 % de las reescrituras de entrenamiento contienen un emoji. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. El adaptador incluye una comprobacion de huella (fingerprint) de los pesos del base y rechaza cargarse sobre cualquier modelo distinto de KeelCore-750M.

## Capacidades

- Reescritura de texto en ingles con tono calido, cercano e informal.
- Sustitucion de vocabulario rigido por terminos cotidianos ("assistance" por "help").
- Uso de contracciones y conversion de ordenes en peticiones ("Please submit..." pasa a "Could you please submit...").
- Adicion ocasional de emojis (presentes en el 23 % de las reescrituras de entrenamiento; 11 % de las salidas en las pruebas manuales).
- Preservacion de texto literal: nombres, URLs, correos electronicos y numeros de telefono se copian sin alteracion gracias a la arquitectura encoder-decoder.
- Control aproximado de longitud: las salidas son de media un 3 % mas largas que la entrada, y aproximadamente 1 de cada 3 resulta mas corta.
- Ejecucion en CPU o GPU con PyTorch, y en navegador mediante ONNX Runtime Web.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo de pensamiento; no es un modelo de chat ni responde preguntas.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Atencion al cliente en aplicaciones de chat: el adaptador reescribe respuestas plantilla para que suenen mas cercanas antes de enviarlas al usuario, manteniendo intactos los enlaces de ayuda y los correos de soporte.
- Reescritura en el dispositivo: al ejecutarse en CPU o en navegador via ONNX Runtime Web, permite suavizar el tono de mensajes sin que el texto salga del equipo del usuario, util en entornos con requisitos de privacidad.
- Mensajes de onboarding y bienvenida: convierte textos corporativos ("Welcome to the team. Your first day is Monday.") en versiones mas calidas con emojis y contracciones.
- Correos y notas internas: transforma comunicaciones cotidianas rigidas en un tono mas informal antes de enviarlas, con control humano posterior.
- Publicaciones en comunidades y foros: adapta anuncios o respuestas para que resulten mas accesibles y menos burocraticas.
- Agradecimientos y felicitaciones: genera variantes mas expresivas de mensajes de cortesia ("Congratulations on your promotion!").
- Punto de partida para investigacion: sirve como caso de estudio de adaptadores pequenos sobre un base compartido, con una huella de pesos que impide cargarlo en otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta comprobaciones manuales sobre 260 entradas escritas a mano: 28 salidas (11 %) contenian un emoji, y 6 de 18 en frases cortas, educadas y formales. No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- El adaptador pesa 73 MB y requiere el modelo base KeelCore-750M congelado para funcionar; no es autonomo.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende enteramente del base de 750 M y de la cuantizacion empleada.
- GPU recomendadas: no disponible. La model card indica ejecucion en CPU o GPU con PyTorch, y en navegador mediante ONNX Runtime Web.
- Cabe en GPU de consumo: no disponible el dato concreto; el base de 750 M es de tamano reducido, pero no se especifican requisitos de memoria.
- Opciones de despliegue: PyTorch (CPU/GPU) y ONNX Runtime Web; el adaptador se carga con el codigo del repositorio de GitHub de KeelCore, no con PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores de reescritura de tono sobre bases encoder-decoder pequenos) con datos de parametros, contexto, rendimiento o licencia que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Solo reescribe: no es un modelo de chat, no responde preguntas ni sigue instrucciones contenidas en el texto.
- Solo ingles; no soporta otros idiomas.
- Riesgo de alterar el significado: aunque intenta conservarlo, puede modificar matices, y en textos donde cada caracter debe permanecer inalterado (clausulas legales, codigo, configuracion, cifras financieras) requiere revision humana.
- Tono inadecuado en mensajes serios o sensibles: malas noticias, quejas, seguridad, salud o temas delicados pueden recibir un tono alegre o un emoji inapropiado.
- Uso de emojis no determinista: aparece en aproximadamente el 11 % de las salidas en las pruebas manuales y en el 23 % del entrenamiento, lo que puede no ser deseable en todos los contextos.
- Licencia propietaria KeelCore License 1.0: es necesario revisar sus terminos para uso comercial; no es una licencia open source estandar.
- Dependencia estricta del base: el adaptador comprueba la huella de los pesos y rechaza cargarse sobre cualquier modelo distinto de KeelCore-750M.
- Formato no estandar: usa `adapter.safetensors` con `adapter_config.json` en formato KeelCore, no PEFT, lo que limita su integracion con herramientas habituales.
- Los repositorios figuran como privados en las instrucciones de uso, lo que puede afectar a la reproducibilidad.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo de reescritura, el riesgo principal es la alteracion de contenido mas que la invencion de hechos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KeelCore/KeelCore-750M-Friendly
- Modelo base: https://huggingface.co/KeelCore/KeelCore-750M
- Informe tecnico: https://saravanan-a-r.github.io/KeelCore/
- Repositorio GitHub: https://github.com/saravanan-a-r/KeelCore
- Licencia: https://huggingface.co/KeelCore/KeelCore-750M-Friendly/blob/main/LICENSE
- Perfil del autor: https://www.linkedin.com/in/saravanan-a-r/
