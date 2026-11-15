# cameronpyne-smith/maris-piper-bug-finder-qwen3.8-27b-lora

## Resumen

Maris Piper es un adaptador LoRA sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por cameronpyne-smith, orientado especificamente a la deteccion de bugs en codigo durante revisiones de pull requests. El adaptador transforma un modelo generalista de 27.000 millones de parametros en un revisor especializado que emite un veredicto binario (`Verdict: break` o `Verdict: no break`) tras un razonamiento breve, y que ademas nombra el defecto concreto y cita el fragmento de codigo problematico.

El modelo resuelve un problema acotado pero recurrente en ingenieria de software: la revision automatizada de cambios en C# y TypeScript dentro de flujos de integracion continua. Frente al modelo base, el adaptador mejora la capacidad de discriminacion entre codigo defectuoso y codigo limpio (AUC de 0,631 a 0,814) y reduce drasticamente la longitud de salida necesaria para alcanzar un veredicto (de hasta 4.752 tokens a menos de 400).

El adaptador ocupa 435 MB en safetensors y se ejecuta sobre el modelo base cuantizado a 4 bits en una unica GPU con aproximadamente 20 GB de memoria. La licencia es Apache 2.0 y el unico idioma declarado es el ingles. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen3.8-27B) |
| Parametros totales | No disponible para el adaptador; modelo base de 27.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | Base cargado en 4-bit NF4 con doble cuantizacion y compute dtype bfloat16; carga en 16-bit no probada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre Qwen/Qwen3.8-27B, un transformer decoder-only de 27.000 millones de parametros. No se especifica el rango, alpha ni los modulos objetivo del adaptador. El entrenamiento se realizo y evaluo con el modelo base cargado en 4 bits (NF4, doble cuantizacion, compute en bfloat16); la carga del base en 16 bits no fue probada segun la model card.

Los datos de entrenamiento consisten en 1.177 ejemplos extraidos de pull requests fusionados en 34 repositorios (la model card se interrumpe en ese punto y no detalla la composicion completa ni el numero de tokens). El formato de prompt es unico y fijo: un mensaje de sistema que define el rol de revisor, seguido de la ruta del fichero, la funcion completa tras el cambio y el diff unificado del fichero. El modo thinking esta desactivado (`enable_thinking=False`) y las respuestas rondan las 95 palabras. No se documenta el uso de RLHF ni DPO; el ajuste es supervisado sobre ejemplos de revision.

La innovacion principal no es arquitectonica sino de formato de salida: el adaptador fuerza una linea `Verdict:` parseable y aprovecha la probabilidad en esa linea como score de riesgo, lo que permite ordenar funciones por probabilidad de contener un bug en lugar de ofrecer solo una etiqueta binaria.

## Capacidades

- Deteccion de bugs en funciones individuales de C# y TypeScript a partir de la funcion y el diff del pull request.
- Emision de un veredicto binario parseable (`Verdict: break` / `Verdict: no break`) con razonamiento breve previo.
- Identificacion y cita del defecto concreto tras un veredicto positivo.
- Generacion de un score de riesgo continuo a partir de la probabilidad en la linea de veredicto, util para priorizar revisiones.
- Salida acotada: menos de 400 tokens nuevos por revision, con respuestas de aproximadamente 95 palabras.
- No soporta tool calling, function calling, agentes multi-paso, vision ni audio segun la informacion disponible.
- Capacidad multilingue limitada al ingles como idioma declarado.
- No dispone de modo thinking activo (desactivado explicitamente en el entrenamiento y la evaluacion).

## Casos de uso

- Revision automatizada de pull requests: el adaptador se integra en una aplicacion de revision de PRs de codigo abierto y, dado el diff y la funcion afectada, emite un veredicto en menos de 400 tokens, lo que permite ejecutarlo como paso de CI sin penalizar los tiempos de build.
- Priorizacion de colas de revision humana: usando la probabilidad en la linea de veredicto como score, una herramienta puede ordenar las funciones de un PR por riesgo y dirigir la atencion del revisor a las mas sospechosas primero.
- Filtrado previo en pipelines de merge: el modelo puede marcar funciones con `Verdict: break` como bloqueantes o advertir al autor antes de fusionar, reduciendo la carga de revision manual en repos con alto volumen de cambios.
- Analisis de regresiones en C# y TypeScript: al recibir la funcion post-cambio y el diff, el adaptador evalua si la modificacion rompe la promesa que la funcion hace a sus llamadores, lo que encaja en flujos de deteccion de regresiones en servicios backend y frontend.
- Generacion de comentarios de revision con cita de codigo: tras un veredicto positivo, el modelo nombra el defecto en una a tres frases y cita el fragmento exacto, lo que permite publicar comentarios automaticos en la PR con contexto suficiente para el autor.
- Evaluacion de calidad de codigo en bases legacy: el adaptador puede ejecutarse sobre funciones existentes (con un diff vacio o sintetico) para obtener un ranking de riesgo y localizar candidatos a refactorizacion o testing adicional.
- Docencia y formacion en revision de codigo: el formato de salida estructurado (razonamiento, veredicto, cita del defecto) sirve como ejemplo de revision razonada en entornos de aprendizaje, aunque la cobertura limitada a C# y TypeScript restringe su alcance.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de validacion de 100 funciones (61 con bug, 39 limpias) procedentes de repositorios no vistos en entrenamiento. La muestra es de 1 ejecucion greedy y 4 con temperatura 0,7, promediadas en 5 ejecuciones.

| Medicion | Qwen3.8-27B base | Con este adaptador |
|---|---|---|
| Ranking, AUC (0,5 = azar) | 0,631 | 0,814 |
| Bugs reales detectados (de 61) | 38 | 43 |
| De esos, nombrando el defecto corregido despues | 2 | 6 |
| Funciones limpias correctamente aprobadas (de 39) | 23 | 27 |
| Precision balanceada | 0,606 | 0,699 |
| Tokens necesarios para alcanzar veredicto | hasta 4.752 | menos de 400 |

Advertencias del propio autor: la muestra de 100 funciones de tres repositorios es pequena; tres ejecuciones de entrenamiento con los mismos ajustes obtuvieron AUC de 0,78, 0,81 y 0,81, por lo que debe esperarse aproximadamente 0,80 en codigo nuevo y las diferencias de pocas funciones estan dentro del ruido. Al modelo base se le concedio mas margen (1.200 tokens, y 8.000 en 28 funciones sin veredicto greedy); en las otras 72, 44 de 288 respuestas muestreadas seguian sin veredicto a 1.200 tokens y se contabilizaron como indecisas (0,5). La etiqueta "limpia" significa que ninguna correccion posterior toco el fichero, no que se haya demostrado ausencia de bugs.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB para el modelo base en 4-bit NF4 con doble cuantizacion mas el adaptador de 435 MB.
- GPU recomendadas: cualquier GPU con al menos 20 GB de memoria; encajan A100 40/80 GB, H100, L40S y RTX 4090 (24 GB). Una RTX 3090 (24 GB) seria teoricamente suficiente, aunque no se documenta prueba.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 por margen de VRAM; no cabe en GPU con 16 GB o menos en la configuracion documentada.
- Opciones de despliegue: la model card solo documenta `transformers` + `peft` + `bitsandbytes` con `device_map="cuda"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la condicion de adaptador LoRA sobre base cuantizado limita las opciones de servido de alto rendimiento sin conversion adicional.
- Latencia y throughput: no disponibles. La cota de 400 tokens nuevos por revision acota el coste por inferencia, pero no se publican medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Maris Piper (este adaptador) | 27B (base) + LoRA | No disponible | Deteccion de bugs en C#/TypeScript | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.8-27B base | 27B | No disponible | Generacion de texto generalista | No disponible en la informacion | Hugging Face (Qwen) |
| Alternativas especializadas en revision de codigo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros adaptadores o modelos especializados en deteccion de bugs comparables en tamano y tarea dentro de la informacion proporcionada. La unica comparacion con datos es frente al modelo base, recogida en la seccion de benchmarks.

## Limitaciones y advertencias

- Muestra de evaluacion muy reducida (100 funciones de tres repositorios) y sin validacion independiente; el propio autor advierte que las diferencias de pocas funciones estan dentro del ruido y que debe esperarse un AUC cercano a 0,80 en codigo nuevo.
- La etiqueta "limpia" del conjunto de validacion no demuestra ausencia de bugs: solo indica que ninguna correccion posterior modifico el fichero.
- Formato de prompt unico y fijo; otros formatos no han sido probados y pueden degradar el rendimiento o romper el parseo del veredicto.
- Solo entrenado y evaluado con el base en 4-bit; la carga en 16-bit no esta probada y podria alterar el comportamiento.
- Cobertura limitada a C# y TypeScript segun las etiquetas; no se documenta soporte para otros lenguajes.
- Idioma declarado unicamente ingles; no se garantiza calidad en otros idiomas.
- No soporta tool calling, agentes multi-paso, vision ni audio.
- Riesgo de alucinacion en la identificacion del defecto: el modelo puede citar codigo o describir un fallo inexistente; la cita debe verificarse antes de publicarla en una revision.
- Sesgos no documentados: no se detalla la composicion de los 34 repositorios de entrenamiento, por lo que se desconoce el sesgo hacia ciertos estilos, frameworks o dominios.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene su propia licencia que debe verificarse por separado; la informacion disponible no la especifica.
- Adopcion practicamente nula (0 descargas, 1 like) y actualizacion reciente; no hay evidencia de uso en produccion ni de mantenimiento continuado.
- El rendimiento en produccion depende del parseo fiable de la linea `Verdict:`; respuestas que no la incluyan requeriran manejo de errores en el pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cameronpyne-smith/maris-piper-bug-finder-qwen3.8-27b-lora
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de la aplicacion de revision de PRs ni demos adicionales.
