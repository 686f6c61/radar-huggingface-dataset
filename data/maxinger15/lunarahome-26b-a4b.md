# Maxinger15/LunaraHome-26B-A4B

## Resumen

LunaraHome 26B-A4B es un ajuste fino experimental de Gemma 4 orientado a domotica, desarrollado por el usuario Maxinger15. El modelo parte de google/gemma-4-26B-A4B-it-qat-q4_0-unquantized y se especializa en convertir lenguaje natural en aleman (con apoyo en ingles) en llamadas a herramientas estructuradas para Home Assistant y Music Assistant. Su objetivo es que un asistente de voz local entienda peticiones como "enciende la lampara de pie del salon" o "¿sigue sonando musica en el dormitorio?", seleccione el dispositivo y la estancia correctos dentro de un inventario proporcionado como contexto y emita el function call correspondiente.

Tecnicamente es un transformer multimodal con mezcla de expertos (MoE) de 25.805.936.206 parametros totales (unos 25,8 B) segun los tensores de safetensors, del que la nomenclatura "A4B" del modelo base sugiere alrededor de 4.000 millones de parametros activos por token, aunque ese dato no se confirma de forma explicita en la informacion disponible. El ajuste se realizo con LoRA de rango 8 y alpha 16 sobre la atencion de texto (proyecciones Q y V), lo que supone solo 2.795.520 parametros entrenables, y se publica como un unico model.safetensors BF16 de 51,61 GB ya fusionado con la base.

Su relevancia actual es doble: por un lado ataca un nicho concreto y poco cubierto, el control de domotica en aleman con function calling fiable; por otro, es un ejemplo de adaptacion ligera y reproducible sobre un modelo MoE grande, con licencia apache-2.0 declarada y un benchmark de desarrollo propio. No obstante, la version v0.1 es experimental, no tiene descargas ni interacciones registradas y el autor advierte que las entradas y salidas completas de su benchmark son privadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Gemma 4 con mezcla de expertos (MoE) y decodificacion condicional (clase `Gemma4ForConditionalGeneration`); adaptacion LoRA sobre la atencion de texto |
| Parametros totales | 25.805.936.206 (25,8 B) segun safetensors |
| Parametros activos | No confirmado en la informacion disponible; la nomenclatura A4B del modelo base apunta a unos 4.000 millones de parametros activos por token |
| Longitud de contexto | No disponible; el entrenamiento uso secuencias de hasta 6.144 tokens |
| Tipos de cuantizacion | No disponible; el repositorio publica unicamente pesos BF16 fusionados, sin versiones GGUF ni cuantizaciones adicionales |
| Idiomas soportados | Aleman (idioma principal) e ingles (complementario en herramientas y ejemplos de replay) |
| Licencia | apache-2.0 (declarada en el repositorio; revisar THIRD_PARTY_NOTICES.md por el modelo base de Google) |
| Formato de pesos | safetensors (una unica `model.safetensors` de 51,61 GB, BF16) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 26B-A4B en su variante QAT q4_0 no cuantizada, es decir, la version de pesos sin cuantizar de un modelo entrenado con quantisation-aware training para q4_0. Sobre esa base se aplico un LoRA de rango 8 y alpha 16 restringido a las proyecciones Q y V de la atencion de texto, con 2.795.520 parametros entrenables. Ni los expertos MoE ni el codificador de vision fueron ajustados, por lo que las capacidades visuales, si se usan, proceden intactas del modelo original. El resultado se fusiono con la base en BF16 y se publico como un unico fichero safetensors; la fusion no implica entrenamiento adicional.

Los datos de la linea v3 suman 18.815 filas de entrenamiento procedentes del corpus de domotica del autor y de fuentes publicas curadas: Home Assistant Requests V2 y V5 Native, los intents oficiales de Home Assistant, MASSIVE, xLAM, ToolACE, Glaive y OpenAssistant, ademas de material Hermes mas antiguo en la linea de adaptadores. La continuacion v3.1 anadio 2.400 variantes sinteticas de inventario de dispositivos mezcladas con 2.400 ejemplos de replay del conjunto mas amplio, con el fin de cubrir contextos nuevos de dispositivos y habitaciones sin degradar lo ya aprendido. El entrenamiento se hizo durante 600 pasos con tasa de aprendizaje 5e-5 y batch efectivo de 8, reinicializando optimizador y scheduler. La plantilla de chat es la nativa de Gemma y el modo de pensamiento esta desactivado. El export se verifico con Transformers 5.17.0 y PyTorch 2.8.0.

## Capacidades

- Generacion de texto conversacional en aleman con registro de asistente domestico.
- Function calling y tool calling: emite llamadas estructuradas a partir de un inventario de herramientas y dispositivos proporcionado en el contexto.
- Seleccion de dispositivo y estancia: identifica el aparato correcto entre varios candidatos segun la peticion en lenguaje natural.
- Consultas de estado: responde a preguntas sobre que dispositivos estan encendidos o si hay musica reproduciendose.
- Control de musica mediante Music Assistant y herramientas de reproduccion aportadas por la integracion.
- Peticiones de aclaracion ante objetivos ambiguos (por ejemplo, varias lamparas compatibles con "apaga la luz").
- Gestion del silencio y de falsos positivos: el modelo esta entrenado para no activarse cuando la entrada no requiere herramienta.
- Function calling general fuera del ambito domotico, heredado del entrenamiento con xLAM, ToolACE y Glaive.
- Capacidad multilingue limitada: aleman como idioma principal, ingles como apoyo; no se documentan otros idiomas.
- Capacidad multimodal heredada del modelo base (etiqueta image-text-to-text), no ajustada en este fine-tune.

## Casos de uso

- Asistente de voz domestico en aleman sobre Home Assistant: el modelo recibe el inventario de entidades y areas como contexto y devuelve la llamada de servicio adecuada, de modo que la integracion solo tiene que ejecutarla.
- Control de Music Assistant por lenguaje natural: peticiones como "pon musica en el dormitorio" o "para la musica" se traducen en llamadas a las herramientas de reproduccion que ofrezca la integracion.
- Consultas de estado multi-dispositivo: "¿queda alguna luz encendida en la planta baja?" se resuelve consultando varias entidades y agregando el resultado antes de responder.
- Desambiguacion conversacional: cuando la peticion encaja con varios dispositivos, el modelo genera una pregunta de aclaracion en lugar de actuar sobre un objetivo arbitrario, lo que reduce acciones erroneas en produccion.
- Puerta de activacion previa al wake word: el entrenamiento especifico en casos de silencio y falsos positivos permite usarlo como filtro que decide si una frase merece procesarse como comando.
- Automatizaciones por voz en entornos con requisitos de privacidad: al poder desplegarse en infraestructura propia, evita enviar audio o transcripciones a servicios en la nube.
- Integracion en pipelines de agentes con function calling generico: al conservar ejemplos de xLAM, ToolACE y Glaive, puede emplearse en tareas de llamada a herramientas ajenas a la domotica, siempre con validacion previa.
- Base para adaptaciones a otros idiomas o ecosistemas domoticos: el enfoque de LoRA de rango 8 sobre atencion de texto es barato de replicar para castellano u otros mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica unicamente un benchmark de desarrollo propio, evaluado sobre las mismas entradas fijadas para el adaptador v3 de partida y para LunaraHome v0.1. La puntuacion global declarada para la primera version es del 93,75 % en su benchmark de herramientas (750 de 800 casos).

| Prueba (benchmark propio) | Adaptador v3 (punto de partida) | LunaraHome v0.1 | Total de casos |
|---|---|---|---|
| Llamadas a herramientas (tool calls) | 732 | 750 | 800 |
| Decision de texto | 199 | 196 | 200 |
| Silencio (no activacion) | 104 | 104 | 104 |
| Falsos positivos reales | 50 | 50 | 50 |
| Puntuacion exacta de texto general | 72 | 70 | 160 |
| Retencion en multiple-choice | 416 | 404 | 512 |

En herramientas se registran 26 mejoras frente a 8 regresiones, un neto de +18 casos equivalente a 2,25 puntos porcentuales. El autor advierte de que las entradas y las salidas completas siguen siendo privadas, que las cifras se recalcularon tras la descarga y proceden de la evaluacion del adaptador antes del export a BF16, y que el benchmark completo no se volvio a ejecutar sobre el modelo fusionado. Asimismo, indica que la puntuacion exacta de texto y la retencion en multiple-choice miden cosas distintas y no constituyen una medida general de inteligencia. La interpretacion exacta de la fila de falsos positivos (50 de 50) procede del material original y no se detalla alli.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: alrededor de 52 GB solo para los pesos (25.805.936.206 parametros a 2 bytes), mas cache KV y activaciones; en la practica conviene reservar 60 GB o mas.
- VRAM estimada tras cuantizar a 8 bits: en torno a 26-28 GB; a 4 bits: en torno a 14-16 GB. Estas conversiones hay que generarlas, porque el repositorio solo distribuye BF16.
- GPU recomendadas para BF16 sin cuantizar: una A100 80 GB o una H100 80 GB en solitario; tambien 4 x RTX 4090 / RTX 3090 (96 GB agregados) con paralelismo tensorial.
- Consumer GPU: el BF16 no cabe en una GPU de 24 GB. Con cuantizacion de 4 bits (aproximadamente 14-16 GB) si cabria en una RTX 4090, RTX 3090 o similar, siempre que se conviertan los pesos previamente. Al ser MoE con unos 4.000 millones de parametros activos, el coste de computo por token es bajo y el cuello de botella es la memoria.
- Opciones de despliegue: Transformers con `device_map="auto"` (entorno verificado con Transformers 5.17.0 y PyTorch 2.8.0), vLLM, TGI o SGLang para servicio en GPU; llama.cpp y Ollama solo tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Idiomas | Licencia | Especializacion | Formato |
|---|---|---|---|---|---|---|
| LunaraHome 26B-A4B (v0.1) | 25,8 B (MoE, ~4 B activos segun nomenclatura) | No disponible | Aleman, ingles | apache-2.0 (declarada) | Domotica: Home Assistant y Music Assistant con tool calling | safetensors BF16 fusionado |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized (base) | Mismo tamano y arquitectura (modelo de partida) | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Asistente general multimodal | No disponible en la informacion proporcionada |
| Otras adaptaciones para Home Assistant | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos publicados de alternativas comparables de la misma categoria (asistentes de domotica en aleman con function calling) dentro de la informacion proporcionada, por lo que no se pueden comparar rendimiento ni parametros con rigor.

## Limitaciones y advertencias

- Modelo marcado explicitamente como experimental y en version v0.1, con 0 descargas y 0 interacciones en el momento de la consulta.
- El benchmark es propio del autor, no estandar, y ni las entradas ni las salidas completas son publicas; las cifras publicadas proceden de la evaluacion del adaptador antes del export a BF16 y no se repitieron sobre el modelo fusionado.
- Regresiones medibles respecto al adaptador de partida: la decision de texto baja de 199 a 196 sobre 200, la puntuacion exacta de texto general de 72 a 70 sobre 160 y la retencion en multiple-choice de 416 a 404 sobre 512.
- La fila de falsos positivos se mantiene en 50 sobre 50, lo que sugiere margen de mejora en la discriminacion entre comandos validos y entradas que no deberian activar ninguna herramienta.
- Riesgo de alucinacion en la seleccion de dispositivo o estancia cuando el inventario es grande o ambiguo; el propio diseno espera peticiones de aclaracion en esos casos, pero no estan garantizadas.
- El modelo no ejecuta acciones: solo genera llamadas. La integracion es responsable de ofrecer las herramientas reales (musica, historial, otras capacidades del proyecto) y de validar los argumentos antes de ejecutarlos.
- Cobertura idiomatica limitada: aleman como idioma principal e ingles como apoyo. No hay garantias documentadas para castellano ni para otros idiomas.
- Vision y expertos MoE no fueron ajustados, por lo que el comportamiento multimodal es el del modelo base y no esta adaptado al dominio domestico.
- La longitud de contexto de inferencia no se especifica; el entrenamiento uso secuencias de hasta 6.144 tokens, lo que limita la confianza en ventanas mucho mayores.
- La licencia declarada es apache-2.0, pero el modelo base es de Google; conviene revisar THIRD_PARTY_NOTICES.md para conocer las condiciones aplicables al modelo base antes de un uso comercial.
- Los ejemplos de la model card son ilustrativos y no respuestas registradas del modelo, segun advierte el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Maxinger15/LunaraHome-26B-A4B
- Rama con el export verificado BF16 (tag `v0.1-bf16`): https://huggingface.co/Maxinger15/LunaraHome-26B-A4B/tree/v0.1-bf16
- Avisos de licencia y procedencia de terceros (THIRD_PARTY_NOTICES.md, dentro del repositorio): https://huggingface.co/Maxinger15/LunaraHome-26B-A4B/blob/main/THIRD_PARTY_NOTICES.md
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
