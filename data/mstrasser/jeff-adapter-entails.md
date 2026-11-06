# mstrasser/jeff-adapter-entails

## Resumen

jeff-adapter-entails es un adaptador LoRA (PEFT) sobre el modelo base mstrasser/jeff-base v1.4, un fine-tune de Qwen3.5-0.8B descrito por el autor como un modelo de decisión pequeno y abierto. El adaptador resuelve una tarea concreta de verificacion de afirmaciones: dado un contexto (quien pregunta y que evidencia se aporta) y una afirmacion, devuelve una de tres etiquetas —`supported`, `unclear` o `unsupported`— indicando si la evidencia respalda, deja abierta o contradice la afirmacion.

A diferencia de un LLM generativo, el modelo no produce texto libre: en una sola pasada hacia delante emite una probabilidad calibrada para cada opcion, lo que elimina el parseo de la salida y facilita su integracion en pipelines automatizados. Esta orientado a la verificacion de hechos contra evidencia documental (facturas, ordenes de compra, mensajes, registros) antes de actuar sobre ellos.

El adaptador es relevante por su enfoque de "modelo de decision" calibrado y por su tamano reducido (base de 0.8B parametros), que permite ejecutarlo en local. La model card reporta una precision del 98.5% con cobertura del 100% en su conjunto de calibracion y una exactitud del 93.7% en benchmarks publicos (SNLI y VitaminC). La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre mstrasser/jeff-base v1.4, fine-tune de Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador LoRA es un conjunto de pesos adicionales; el modelo base es de 0.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre jeff-base v1.4, un fine-tune de Qwen3.5-0.8B, mediante tecnicas LoRA (Low-Rank Adaptation) gestionadas con la libreria PEFT. El modelo base es un transformer pequeno de aproximadamente 0.8 mil millones de parametros; el adaptador anade pesos de bajo rango para especializar la salida en una tarea de clasificacion de tres clases. La inferencia produce, en una unica pasada hacia delante, una distribucion de probabilidad sobre las opciones, sin generacion de texto, lo que constituye la innovacion principal del diseno: un "modelo de decision" calibrado en lugar de un generador.

Segun la model card, el adaptador se entreno el 25 de octubre de 2026. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Si se documenta que parte de los datos de evaluacion provienen de un generador interno con el que tambien se genero el conjunto de entrenamiento, y que existen pruebas en dominios no vistos durante el entrenamiento. El motor de ejecucion rechaza cargar el adaptador sobre una revision distinta del modelo base, lo que impone un acoplamiento estricto entre adaptador y base.

## Capacidades

- Clasificacion de soporte de afirmaciones: dado un contexto de evidencia y una afirmacion, devuelve `supported`, `unclear` o `unsupported`.
- Razonamiento sobre evidencia: la model card indica que maneja inferencias por aritmetica simple, comparacion de fechas y combinacion de dos piezas de evidencia.
- Salida calibrada: probabilidad por opcion en una sola pasada, sin texto generado que parsear.
- Deteccion de ambiguedad: la etiqueta `unclear` cubre rangos, fechas vagas, fuentes en desacuerdo, causas solo implicadas o registros ambiguos.
- Despliegue local o remoto: SDK en Python con modos `Jeff.local` (descarga adaptador y base de Hugging Face) y `Jeff.remote` (API con clave).
- Capacidades multilingues: limitadas al ingles segun la informacion disponible.
- Tool calling, agentes y vision: no disponibles en la informacion proporcionada.

## Casos de uso

- Verificacion de reclamaciones de proveedores: el adaptador compara ordenes de compra y albaranes para confirmar si una entrega se realizo en plazo, como ilustra el ejemplo de la model card con la orden 4471 de Calder Timber.
- Automatizacion de cuentas a pagar: antes de aprobar un pago, el sistema comprueba que la afirmacion del proveedor se sostiene sobre la documentacion adjunta, reduciendo revisiones manuales.
- Moderacion de contenido factual: comprobar si un mensaje o publicacion esta respaldado por las fuentes citadas, con la etiqueta `unclear` como senal para revision humana.
- Enriquecimiento de bases de datos: validar registros frente a documentos de origen y marcar discrepancias automaticamente.
- Triaje de reclamaciones en atencion al cliente: clasificar si la queja esta respaldada por el historial de la conversacion o los registros de pedido antes de escalarla.
- Auditoria documental: verificar afirmaciones en informes contra el corpus de evidencia disponible, con umbral de confianza configurable.
- Pipelines de compliance: integrar la decision calibrada como paso previo a acciones automatizadas, usando la precision del 98.5% como umbral de confianza.

## Benchmarks y rendimiento

| Prueba | Filas | Exactitud |
|---|---:|---:|
| Benchmarks publicos (500 filas de SNLI y 500 de VitaminC) | 1.000 | 93.7% |
| Test interno (generador) | 2.000 | 97.8% |
| Test interno en dominios no vistos en entrenamiento (generador) | 2.000 | 98.5% |

Calibracion de la funcion `entails`:

| Funcion | Umbral | Precision | Cobertura | Filas de calibracion |
|---|---:|---:|---:|---:|
| `entails` | 0.518 | 98.5% | 100.0% | 2.000 |

La exactitud se define como la proporcion de filas cuyo resultado principal fue correcto. El autor advierte que los tests de tipo "generator" provienen del mismo generador que los datos de entrenamiento y por tanto miden menos que un test publico o real.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base es de 0.8B parametros, por lo que la inferencia en precision reducida cabe en GPUs de consumo, aunque no se publican cifras concretas.
- GPU recomendadas: no disponible.
- GPU de consumo: previsiblemente viable por el tamano del modelo base, sin datos oficiales de compatibilidad.
- Opciones de despliegue: SDK `jeff` en modo local o remoto contra la API de Jeff; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. Como referencia de categoria, este adaptador se situa en la interseccion entre los modelos de inferencia de lenguaje natural (NLI) como SNLI o VitaminC, usados en su evaluacion, y los clasificadores de verificacion de hechos; no obstante, no se aportan cifras de esos modelos para una comparacion directa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| jeff-adapter-entails | Base 0.8B + LoRA | No disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Alternativas NLI/verificacion | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo usa la evidencia suministrada: no puede verificar afirmaciones que requieran hechos externos al contexto aportado.
- Idioma: unicamente ingles declarado; el rendimiento en castellano no esta documentado.
- Acoplamiento estricto: el adaptador solo carga sobre jeff-base en la revision v1.4; el motor rechaza otras revisiones.
- Riesgo de sobreajuste al generador: parte de las metricas provienen de un generador interno compartido con el entrenamiento, lo que puede inflar los resultados.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: reducido por el diseno de clasificacion sin generacion de texto, pero no se documenta su comportamiento en evidencia contradictoria o incompleta.
- Licencia Apache 2.0: permite uso comercial, sin restricciones adicionales indicadas.
- Madurez: modelo con 0 descargas y 0 likes, creado y actualizado el 5 de noviembre de 2026; sin adopcion comunitaria documentada.
- Dependencia de tooling: requiere el SDK y el motor de Jeff, que segun la model card aun no estan publicados en PyPI y deben instalarse desde GitHub.

## Enlaces

- Hugging Face: https://huggingface.co/mstrasser/jeff-adapter-entails
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Catalogo: https://jeffhub.ai/catalogue/jeff.reasoning.entails
- Codigo, servidor y SDK: https://github.com/firelex/jeff
- Guia de instalacion del SDK: https://jeffhub.ai/docs/sdk/install
- API de Jeff: https://jeffhub.ai
