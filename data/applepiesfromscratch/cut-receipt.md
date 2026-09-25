# ApplePiesFromScratch/cut-receipt

## Resumen

`cut-receipt` es un paquete Python publicado en HuggingFace por el usuario ApplePiesFromScratch bajo licencia MIT. No es un modelo de lenguaje ni una red neuronal: el propio autor lo declara explicitamente en la model card ("Not an LLM. Sister of `process-calc`"). Se trata de un kernel de calculo exacto cuya caracteristica diferencial es que cada llamada devuelve un *recibo* estructurado con cinco campos: semilla, valor, canal, tasa y un indicador booleano tipo gauge.

El problema que aborda es la trazabilidad aritmetica: en lugar de devolver unicamente un resultado numerico, la funcion devuelve tambien los metadatos de la operacion (de donde venia la entrada, con que semilla se genero y bajo que tasa se computo), lo que permite auditar cada calculo de forma reproducible. El autor indica que comparte kernel con `process-calc`, otro paquete del mismo perfil, del que esta version seria la variante orientada a recibos.

La relevancia actual es limitada y muy nicho: el repositorio acumula 0 descargas y 0 likes, no declara pipeline ni idiomas, y su propia model card lo situa fuera del espacio de los LLM. Resulta de interes para desarrolladores que necesiten aritmetica exacta con registro por operacion, no para tareas de generacion, razonamiento o vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: kernel de calculo exacto implementado en Python; no es un transformer, MoE ni SSM |
| Parametros totales | No aplica (no es un modelo neuronal) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no procesa secuencias de tokens) |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | No disponible en la model card; el artefacto es codigo Python |
| Licencia | MIT |
| Formato de pesos | No aplica: el artefacto distribuido es codigo fuente Python, no pesos (safetensors, GGUF u otros) |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |

## Arquitectura y entrenamiento

No existe entrenamiento asociado. `cut-receipt` no es un modelo con parametros aprendidos: es una implementacion de aritmetica exacta en Python. El autor describe que emplea el mismo kernel que `process-calc` y que la diferencia esta en la salida: cada llamada devuelve un recibo con semilla, valor, canal, tasa y un indicador gauge (si/no). El ejemplo de uso documentado es `receipt(lambda x: mix(x, x), 3)`, importado desde el modulo `receipt_calc`, lo que sugiere una API funcional minima basada en dos primitivas (`mix` y `receipt`).

La unica regla semantica explicita en la model card es que las semillas vacias y la semilla 0 se representan como theta, y que un valor de tipo float tambien se representa como theta. La interpretacion de theta como valor invalido, centinela o fuera de dominio no se detalla en la informacion disponible y no debe asumirse. No se documentan innovaciones tecnicas adicionales, ni decodificacion especulativa, ni mecanismos de atencion, ni proceso de RLHF/DPO: nada de ello aplica a este artefacto.

## Capacidades

- Aritmetica exacta: el proposito declarado del paquete es el calculo exacto, segun la etiqueta `exact-arithmetic` del repositorio.
- Emision de recibos por operacion: cada llamada devuelve semilla, valor, canal, tasa e indicador gauge (si/no), lo que habilita trazabilidad por calculo.
- Rechazo explicito de entradas no validas: semillas vacias, semilla 0 y valores float se representan como theta.
- API programatica en Python: se invoca importando `mix` y `receipt` desde el modulo `receipt_calc`.
- Generacion de texto: no disponible (el autor declara que no es un LLM).
- Razonamiento, codigo, matematicas simbolicas o vision: no disponible como capacidades del modelo; el paquete solo realiza el computo exacto descrito.
- Tool calling / function calling: no aplica; la integracion es por importacion de modulo, no por protocolo de herramientas.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no hay procesamiento de lenguaje natural.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Auditoria de calculos financieros: cada operacion devuelve un recibo con semilla, valor, canal y tasa, de modo que un revisor posterior puede reconstruir de donde salio cada cifra en lugar de fiarse de un log de texto.
- Conciliacion contable con trazabilidad por operacion: al registrar el recibo junto al asiento, se conserva la relacion entre la entrada, la tasa aplicada y el resultado exacto, sin depender de redondeos en coma flotante.
- Pruebas deterministas en pipelines de datos: fijar la semilla del recibo permite reproducir exactamente el mismo resultado y comparar salidas entre ejecuciones de CI.
- Validacion de entrada en servicios de calculo: la regla de que semilla 0, semilla vacia y float devuelven theta permite usar el paquete como filtro explicito que descarta entradas malformadas antes de que contaminen un resultado.
- Facturacion y generacion de justificantes internos: el concepto de recibo encaja con la necesidad de adjuntar a cada cargo el detalle de como se calculo.
- Nucleo de calculo en una libreria mayor: dado que comparte kernel con `process-calc`, puede actuar como capa base sobre la que construir variantes que emitan recibos o que no lo hagan.
- Ensenanza y depuracion de aritmetica exacta: el recibo expone canal y tasa, lo que facilita explicar paso a paso por que un calculo da un valor concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, y al no tratarse de un modelo neuronal no resultan aplicables metricas como MMLU, HumanEval o GSM8K. Tampoco se han publicado cifras de latencia o throughput.

## Requisitos de hardware

- VRAM: no aplica. El artefacto es una libreria Python sin pesos ni grafos de computo, por lo que no requiere memoria de GPU.
- GPU recomendadas: no aplica. La ejecucion es en CPU a traves del interprete de Python.
- Compatibilidad con GPU de consumo: no aplica; no necesita GPU para funcionar.
- Opciones de despliegue: importacion directa del modulo Python (`from receipt_calc import mix, receipt`) dentro de una aplicacion o servicio propio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de artefacto.
- Latencia y throughput: no disponible; dependeran exclusivamente de la implementacion del kernel y del entorno de ejecucion del usuario.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, tamano ni contexto de otras alternativas, y la comparacion directa con modelos de lenguaje carece de sentido porque `cut-receipt` no es un modelo de IA. El unico artefacto relacionado mencionado por el propio autor es `process-calc`, descrito como su hermana por compartir kernel; la model card no ofrece ninguna metrica que permita contrastarlos mas alla de la diferencia funcional (emision o no de recibo).

## Limitaciones y advertencias

- No es un modelo de lenguaje: el autor lo declara explicitamente. Cualquier expectativa de generacion de texto, razonamiento o comprension del lenguaje queda fuera de su alcance.
- Semantica incompleta en la documentacion: la model card no explica que significa exactamente theta ni que ocurre con entradas que no sean semilla 0, semilla vacia o float.
- Superficie de API minima documentada: solo se muestra `mix` y `receipt`; no hay referencia de parametros, tipos, errores ni versionado.
- Adopcion nula: 0 descargas y 0 likes, sin pipeline declarado, lo que implica ausencia de validacion por parte de terceros.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe riesgo de asumir un comportamiento del paquete que no esta documentado.
- Idiomas: no disponible; no procede, al no haber componente linguistico.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de copyright; no se han declarado restricciones adicionales.
- Caveat para produccion: al no existir tests publicos, versionado ni changelog en la informacion disponible, conviene envolver el paquete con validaciones propias antes de integrarlo en un sistema critico.

## Enlaces

- HuggingFace: https://huggingface.co/ApplePiesFromScratch/cut-receipt
- Paper, blog, repositorio de codigo o demo: no disponible.
- Los resultados de la busqueda web realizada no contienen ningun enlace relacionado con el modelo; devuelven contenido no pertinente (paneles de dominio, videos de relajacion, decoracion y publicaciones en redes sociales), por lo que no se incluyen.
