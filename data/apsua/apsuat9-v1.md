# apsua/ApsuaT9-v1

## Resumen

ApsuaT9-v1 es un modelo de completado de palabras multilingue desarrollado por apsua (ApsuaTech) para abjasio, ruso, ingles y turco. No es un modelo de lenguaje generativo de proposito general, sino una herramienta especializada de tipo T9 (texto predictivo) que sugiere continuaciones de palabras a partir del texto precedente y de las letras ya escritas. Su inferencia se ejecuta localmente en CPU, lo que lo hace adecuado para integracion en teclados y editores sin dependencia de red.

Tecnicamente se trata de un modelo de lenguaje de 4 capas con un vocabulario de 16.384 tokens y una ventana de contexto maxima de 128 tokens. Los pesos se almacenan en formato ONNX cuantizados a INT8 en grupos de 32, mientras que el calculo y la cache KV se ejecutan en FP32. El fichero del modelo ocupa solo 15,25 MB, lo que permite desplegarlo en dispositivos con recursos muy limitados.

Su relevancia radica en la cobertura del abjasio, una lengua de bajos recursos con escaso soporte en herramientas de texto predictivo, junto con tres idiomas de mayor difusion. El modelo comparte pesos y tokenizador con Apsua Studio y se distribuye bajo licencia CC BY 4.0 para pesos y tokenizador, con el codigo de ejecucion bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de 4 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | INT8 en grupos de 32 (almacenamiento de pesos); calculo y cache KV en FP32 |
| Idiomas soportados | ab (abjasio), ru (ruso), en (ingles), tr (turco) |
| Licencia | CC BY 4.0 (pesos y tokenizador); Apache 2.0 (codigo de ejecucion) |
| Formato de pesos | ONNX |
| Vocabulario | 16.384 tokens |
| Tamano del fichero | 15,25 MB |
| Busqueda por defecto | Beam 5, hasta 3 sugerencias |

## Arquitectura y entrenamiento

El modelo es un transformer de 4 capas con un vocabulario de 16.384 tokens y una ventana de contexto de 128 tokens, disenado especificamente para prediccion de siguiente token orientada a completado de palabras. Los pesos se almacenan en ONNX con cuantizacion INT8 en grupos de 32, mientras que la inferencia se realiza en FP32 tanto para el calculo como para la cache KV. Esta separacion entre precision de almacenamiento y de computo reduce el tamano del fichero a 15,25 MB sin sacrificar la calidad numerica de la inferencia.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica si el entrenamiento fue multilingue conjunto o si se combino con etapas especificas por idioma. El modelo comparte pesos y tokenizador con Apsua Studio, lo que sugiere un pipeline de entrenamiento comun para ambos productos. La generacion utiliza busqueda por beam con un ancho de 5 y devuelve hasta 3 sugerencias por consulta.

## Capacidades

- Completado de palabras parcialmente escritas en abjasio, ruso, ingles y turco.
- Sugerencia de la siguiente palabra a partir del contexto precedente.
- Procesamiento de contexto limitado a los 128 tokens mas recientes del texto de entrada.
- Seleccion explicita de idioma mediante el parametro `language` (`ab`, `ru`, `en`, `tr`); si se omite, la inferencia se ejecuta sin etiqueta de idioma.
- Generacion de hasta 3 sugerencias por consulta mediante busqueda por beam de ancho 5.
- Devolucion de lista vacia cuando no existen sugerencias adecuadas.
- Inferencia local en CPU sin dependencia de servicios externos.
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido.

## Casos de uso

- Teclados predictivos en movil y escritorio: el modelo sugiere completados de palabra en tiempo real con un fichero de 15,25 MB y ejecucion en CPU, lo que permite integrarlo en aplicaciones Android, iOS o de escritorio sin depender de un servidor.
- Procesadores de texto para abjasio: cubre una lengua de bajos recursos con escaso soporte en herramientas T9 comerciales, mejorando la experiencia de escritura de hablantes de abjasio.
- Entrada de texto en entornos sin conectividad: al ejecutarse localmente en CPU, funciona en dispositivos aislados o con conectividad intermitente donde no es viable llamar a una API.
- Asistentes de escritura en aplicaciones de mensajeria: la sugerencia de siguiente palabra y el completado parcial aceleran la redaccion en conversaciones multi-turno, aunque limitado a los 128 tokens de contexto mas recientes.
- Correccion y autocompletado en formularios y busquedas: el modelo puede sugerir terminos a partir de las primeras letras en los cuatro idiomas soportados, reduciendo errores tipograficos en campos de entrada.
- Integracion en sistemas de accesibilidad: usuarios con dificultades motoras pueden beneficiarse de sugerencias de hasta 3 palabras por pulsacion, reduciendo el numero de teclas necesarias.
- Prototipado de funciones T9 en aplicaciones multilingues: el paquete `apsua-t9` permite instalar y probar el modelo rapidamente, lo que facilita evaluar su idoneidad antes de integrarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia se ejecuta en CPU.
- Memoria RAM estimada: el fichero del modelo ocupa 15,25 MB, por lo que cabe holgadamente en cualquier dispositivo con unos pocos cientos de MB libres, incluyendo el runtime y la cache KV.
- GPU recomendadas: no aplica; el modelo esta disenado para ejecucion en CPU.
- Cabe en GPU consumer: no aplica, al estar orientado a CPU.
- Opciones de despliegue: runtime propio `apsua-t9` instalable via `pip install "git+https://huggingface.co/apsua/ApsuaT9-v1"`; formato ONNX, por lo que puede ejecutarse con ONNX Runtime si se integra manualmente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de completado de palabras multilingue con soporte de abjasio en la informacion proporcionada. Las alternativas habituales de texto predictivo (motores T9 comerciales, modelos de teclado de Android o iOS) no publican especificaciones tecnicas comparables ni soportan abjasio de forma nativa.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ApsuaT9-v1 | no disponible (4 capas) | 128 tokens | ab, ru, en, tr | CC BY 4.0 | ONNX INT8 |
| Alternativas T9 comerciales | no disponible | no disponible | variable | propietaria | no disponible |

## Limitaciones y advertencias

- El contexto maximo es de solo 128 tokens; en textos largos el modelo utiliza unicamente la parte mas reciente, lo que puede degradar la coherencia de las sugerencias.
- Es un modelo de completado de palabras, no un modelo generativo de proposito general: no mantiene conversaciones, no responde preguntas ni genera parrafos completos.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento extendido.
- La cobertura linguistica se limita a abjasio, ruso, ingles y turco; otros idiomas no estan soportados.
- No se han publicado datos sobre sesgos, tasas de alucinacion ni evaluacion de calidad de las sugerencias, lo que dificulta estimar su fiabilidad en produccion.
- La licencia CC BY 4.0 permite uso comercial siempre que se atribuya la autoria; el codigo de ejecucion esta bajo Apache 2.0, con condiciones distintas que conviene revisar por separado.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no existe evidencia publica de validacion por parte de la comunidad.
- La fecha de creacion del repositorio (2026-11-07) es posterior a la fecha habitual de referencia, lo que conviene verificar antes de adoptarlo en un entorno de produccion.
- Al ejecutarse en CPU, el rendimiento dependera del hardware del dispositivo; no se han publicado cifras de latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apsua/ApsuaT9-v1
- Perfil del autor en Hugging Face: https://huggingface.co/apsua
- Datasets del autor: https://huggingface.co/apsua/datasets
- Modelos con tag apsua-translator: https://huggingface.co/models?other=apsua-translator
- Version en ruso de la model card: https://huggingface.co/apsua/ApsuaT9-v1/blob/main/README.ru.md
- Licencia CC BY 4.0: https://huggingface.co/apsua/ApsuaT9-v1/blob/main/LICENSE-CC-BY-4.0.txt
- Licencia Apache 2.0 del runtime: https://huggingface.co/apsua/ApsuaT9-v1/blob/main/LICENSE-APACHE-2.0.txt
