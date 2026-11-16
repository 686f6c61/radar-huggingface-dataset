# Kisperger/casa-slm-2b-ptbr-gguf

## Resumen

Casa SLM 2B pt-BR es un ajuste fino del modelo Qwen/Qwen3.5-2B orientado a un unico dominio: la conversion de comandos de voz en portugues de Brasil en acciones estructuradas para el control de una vivienda domestica. El modelo recibe como entrada la lista de dispositivos del hogar en JSON junto con la frase dictada por el usuario, y devuelve exclusivamente un objeto JSON que indica una de cuatro intenciones: actuar, preguntar, rechazar o no hacer nada. Lo desarrolla el usuario Kisperger y se distribuye unicamente en formato GGUF cuantizado Q4_K_M, pensado para ejecutarse en local con llama.cpp sin conexion a internet.

El modelo parte de una arquitectura transformer de aproximadamente 1.880 millones de parametros (1.881.825.088 en los pesos safetensors originales) y se ha adaptado mediante un ajuste fino con LoRA posteriormente fusionado en los pesos base. Su interes practico reside en la especializacion extrema: en lugar de competir como modelo generalista, se posiciona como un componente determinista dentro de un pipeline de domotica, donde el programa anfitrion valida cada respuesta y aplica la gramatica que restringe la salida a los identificadores y comandos realmente existentes en la instalacion.

La relevancia actual del modelo esta en su enfoque de "modelo pequeno + gramatica + validacion externa" para automatizacion del hogar en local, con latencias declaradas de aproximadamente 0,15 segundos en GPU y 0,5 segundos en CPU. No obstante, el repositorio presenta cero descargas y cero likes en el momento de la consulta, y su model card es parca en detalles sobre composicion del dataset, hiperparametros de entrenamiento y evaluacion estandarizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-2B; detalles internos de la arquitectura base no disponibles) |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de despliegue con llama-server) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | Portugues de Brasil (pt-BR) exclusivamente |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `casa-slm-2b-ptbr-Q4_K_M.gguf`, ~1,27 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen/Qwen3.5-2B, un transformer de aproximadamente 1,88 mil millones de parametros. Sobre esa base se aplico un ajuste fino mediante LoRA que posteriormente se fusiono en los pesos, seguido de una cuantizacion a GGUF en formato Q4_K_M. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; unicamente indica que los datos de entrenamiento fueron generados por IA a partir de viviendas sorteadas y de variaciones de una casa de pruebas, lo que explica que algunos nombres de dispositivos aparezcan con mayor frecuencia que otros.

La innovacion tecnica principal no reside en la arquitectura sino en el diseno del contrato de salida: el modelo esta entrenado para responder solo con JSON y se espera que el programa anfitrion aplique una gramatica restringida (mencionada como "a gramática que trava a saída") que impide generar identificadores de dispositivos o comandos inexistentes en la instalacion. Este enfoque de decodificacion restringida por gramatica, combinado con validacion externa de cada respuesta, traslada la garantia de seguridad al software de control y deja al modelo la tarea de interpretacion linguistica. No se han publicado detalles sobre atencion, mecanismos de decodificacion especulativa ni otras optimizaciones de inferencia.

## Capacidades

- Interpretacion de frases habladas en portugues de Brasil y conversion a JSON estructurado con una de cuatro intenciones: actuar, preguntar, rechazar o nada.
- Control de un vocabulario cerrado de dispositivos: aire acondicionado, television, luces y enchufes; aspirador y repetidor solo en modo de lectura.
- Manejo de listas de dispositivos proporcionadas en JSON como parte de la entrada, incluyendo viviendas con multiples aires acondicionados, luces con brillo, varios enchufes o television sin volumen.
- Capacidad de solicitar aclaracion (intencion "preguntar") cuando la frase es ambigua o requiere confirmacion antes de actuar.
- Capacidad de rechazo explicito ante peticiones fuera de alcance o no permitidas.
- Deteccion de frases que no son ordenes para la casa, respondiendo "nada".
- Ejecucion completamente local y sin conexion a internet mediante llama.cpp.
- No dispone de capacidades de vision, audio, tool calling generico ni razonamiento multi-paso fuera del contrato JSON descrito.

## Casos de uso

- Asistente de voz domestico integrado en un hub local: el modelo recibe la transcripcion de la frase y la lista de dispositivos del hogar, y devuelve la accion JSON que el hub ejecuta tras validarla; su latencia de ~0,15 s en GPU y ~0,5 s en CPU permite respuestas conversacionales sin salir de la red local.
- Control de climatizacion con confirmacion: ante frases libres que implican encender o cambiar el aire acondicionado, el modelo emite la intencion "preguntar" y el programa anfitrion solicita confirmacion al usuario antes de aplicar el cambio, reduciendo accionamientos no deseados.
- Domotica con multiples estancias y dispositivos: la entrada JSON permite describir viviendas con dos aires acondicionados, varias luces con brillo y varios enchufes, y el modelo resuelve a que dispositivo concreto se refiere la frase (caso evaluado en la prueba 3 con 95,7% de acierto).
- Desambiguacion de frases coloquiales: el modelo traduce expresiones habladas informales a comandos estructurados, gestionando casos como un enchufe que alimenta el aire acondicionado (prueba 2 con 92,9% de acierto).
- Filtrado de falsos positivos: cuando la transcripcion no contiene una orden para la casa, el modelo responde "nada", evitando que conversaciones cotidianas activen dispositivos.
- Despliegue en hardware de consumo sin GPU dedicada: con el archivo Q4_K_M de ~1,27 GB y llama.cpp en CPU, el modelo responde en ~0,5 s, lo que lo hace viable en mini-PC o Raspberry Pi de gama alta para instalaciones de domotica sin acelerador.
- Prototipado de interfaces de voz en portugues de Brasil: sirve como componente de interpretacion en proyectos de investigacion sobre SLM especializados, dado que el codigo de ejemplo (`llama-server -m ... -c 4096 --jinja`) permite levantar un endpoint compatible rapidamente.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros). El autor unicamente publica tres pruebas manuales con frases no vistas durante el entrenamiento:

| Prueba | Que mide | Acierto |
|---|---|---|
| 1 | Casa real de pruebas (aire, TV, robot de solo lectura) | 92,0% |
| 2 | Frases nuevas + enchufe que alimenta el aire acondicionado | 92,9% |
| 3 | Casas inventadas (dos aires, luces con brillo, varios enchufes, TV sin volumen) | 95,7% |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de estas tres pruebas ad hoc.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-1,5 GB con la cuantizacion Q4_K_M, incluyendo overhead de contexto; el archivo pesa ~1,27 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM efectiva; el autor reporta ~0,15 s de latencia en GPU sin especificar el modelo concreto.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna (GTX 1650, RTX 3050, RTX 4060, etc.) e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp mediante `llama-server -m casa-slm-2b-ptbr-Q4_K_M.gguf -c 4096 --jinja`; al ser GGUF tambien es compatible con Ollama y otros runners basados en llama.cpp. No se menciona soporte para vLLM o TGI.
- Latencia: ~0,15 s en GPU y ~0,5 s en CPU segun el autor, con los mismos aciertos en ambos casos.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| Casa SLM 2B pt-BR | ~1,88 mil millones | 4096 | pt-BR | GGUF Q4_K_M | Apache 2.0 | Domotica, salida JSON restringida |
| Qwen/Qwen3.5-2B (base) | ~1,88 mil millones | No disponible | Multilingue | Safetensors, GGUF | Apache 2.0 | Proposito general |
| Modelos SLM genericos de ~2B (p. ej. familias Qwen, Gemma, Llama) | ~1-3 mil millones | Variable | Multilingue | Multiples | Variable | Proposito general |

La comparativa directa con alternativas especializadas en domotica en portugues de Brasil no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia principal es la especializacion en un contrato JSON cerrado y el vocabulario limitado de dispositivos, a costa de perder capacidades generalistas.

## Limitaciones y advertencias

- Solo soporta portugues de Brasil; no se ha entrenado ni evaluado en otros idiomas.
- El vocabulario de dispositivos y comandos esta cerrado a aire acondicionado, television, luces y enchufes; aspirador y repetidor solo como lectura.
- El modelo sugiere acciones pero no las ejecuta: el programa anfitrion debe validar cada respuesta y aplicar la gramatica de decodificacion, sin la cual pueden generarse identificadores o comandos inexistentes.
- Los datos de entrenamiento fueron generados por IA a partir de viviendas sorteadas, lo que puede introducir sesgos de distribucion (nombres de dispositivos sobrerrepresentados) y limitar la generalizacion a instalaciones reales atipicas.
- Riesgo de alucinacion en la seleccion de dispositivo o comando ante frases ambiguas; el diseno mitiga esto con la intencion "preguntar" y la validacion externa, pero no lo elimina.
- Las metricas publicadas (92,0%, 92,9%, 95,7%) provienen de pruebas manuales del autor, no de un benchmark estandarizado ni reproducible de forma independiente.
- La licencia Apache 2.0 permite uso comercial, pero "Qwen" es marca registrada de Alibaba Cloud y este modelo no es un producto oficial de Qwen; debe conservarse el aviso de licencia y no atribuirse oficialmente a Qwen.
- El repositorio no tiene descargas ni validacion de la comunidad en el momento de la consulta, por lo que la robustez en produccion no esta contrastada de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kisperger/casa-slm-2b-ptbr-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de llama.cpp (runner recomendado): https://github.com/ggml-org/llama.cpp
