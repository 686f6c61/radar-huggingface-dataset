# asastu/Eirenaeus-Philalethes-27B-2bit-421M

## Resumen

Eirenaeus-Philalethes es un modelo compuesto publicado por el usuario asastu en HuggingFace. No es un modelo monolítico, sino un ensamblaje de varias piezas que, desde fuera, se comportan como un único modelo con un solo identificador y un único endpoint compatible con la API de OpenAI. La pieza central es un modelo de razonamiento de 27B (Ternary-Bonsai-2-27B, derivado de Qwen3, cuantizado en ternario PQ2_0) que se ejecuta en GPU, acompañado de un modelo de decisión de 421M basado en ModernBERT-large (Laya) que corre en CPU y decide en aproximadamente medio segundo cuánto debe pensar el modelo grande.

El problema que aborda es el coste de inferencia de los modelos de razonamiento: el modelo pequeño decide el presupuesto de pensamiento, un supervisor en CPU detecta bucles de razonamiento (una duda repetida tres veces detiene el bucle y fuerza la respuesta) y un sistema de memoria verificado inyecta tres recuerdos relevantes procedentes de un almacén Engram. Todo el sistema está pensado para funcionar en local, en una sola GPU de consumo con 12 GB de VRAM y sobre Windows.

La relevancia del proyecto no está en los pesos, sino en el patrón de composición: el autor reporta aceleraciones de entre 1,20x y 2,00x en distintos benchmarks sin diferencias de calidad estadísticamente significativas frente al modelo base servido solo. El repositorio ocupa 9,5 GB y los pesos declarados en safetensors suman 26.895.998.464 parámetros (unos 26,9 mil millones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo compuesto: modelo de decision ModernBERT-large (421M) en CPU + modelo de razonamiento transformer cuantizado en ternario (derivado de Qwen3) con proyector de vision en GPU + supervisor de bucle + memoria verificada |
| Parametros totales | 26.895.998.464 (unos 26,9 mil millones, segun safetensors) |
| Parametros activos | No aplica; no es un modelo MoE (el componente de decision de 421M se ejecuta aparte, no forma parte de un enrutado por expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria PQ2_0 (2 bits) sobre el modelo de razonamiento; el resto de componentes no especifican cuantizacion |
| Idiomas soportados | Ingles y espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |
| Fecha de publicacion | 7 de octubre de 2026 (creacion del repositorio) |

## Arquitectura y entrenamiento

El sistema se organiza en cuatro capas. La primera, System 1, es un modelo de decision basado en Laya (ModernBERT-large con cabezas de decision, 421M de parametros) que se ejecuta en CPU en torno a 0,5 segundos y estima cuánto debe pensar el modelo grande, si la peticion es de codigo, si lleva imagenes o si necesita datos en vivo. La segunda, System 2, es Ternary-Bonsai-2-27B (ternario PQ2_0, derivado de Qwen3-27B) con un proyector de vision, servido en GPU mediante la bifurcacion Prism de llama.cpp. La tercera es un supervisor que vigila el flujo de pensamiento y corta el bucle cuando detecta una duda repetida tres veces. La cuarta es un sistema de memoria que lee proyectos autorizados desde un almacen Engram, con Dokimos encargandose de descartar recuerdos caducados; se inyectan tres recuerdos y el modelo nunca los busca por si mismo.

El entrenamiento no se describe en detalle en la informacion disponible: el autor indica que no se modifican los pesos de ninguno de los dos modelos base y que el valor anadido esta en la composicion. Como mecanismo de mejora, cuando System 1 no esta seguro, System 2 responde y esa respuesta se registra como etiqueta de entrenamiento para System 1, de modo que el modelo rapido puede aprender del lento. No se especifican numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO. El autor menciona como trabajo relacionado el enrutador semantico de vLLM, que decide por peticion si un modelo servido debe razonar.

## Capacidades

- Generacion de texto conversacional en ingles y espanol.
- Razonamiento multi-paso con presupuesto de pensamiento adaptativo: el modelo decide dinamicamente cuánto razonar segun la peticion.
- Generacion de codigo, con resultados medidos en HumanEval+ (156 de 164 en la configuracion completa del sistema) y MBPP+ (308 de 378).
- Razonamiento matematico, con resultados medidos en AIME 2025 (27 de 30).
- Procesamiento de imagenes multimodal: el modelo de razonamiento incluye un proyector de vision y se evaluo en MMMU-Pro (130 de 200 frente a 137 del base, dentro del ruido estadistico).
- Tool calling: evaluado en BFCL v4 con 400 llamadas, con empate respecto al modelo base y sin ventaja de velocidad.
- Deteccion automatica de peticiones que requieren codigo, imagenes o datos en vivo.
- Supervisor de bucles de razonamiento: detiene el pensamiento repetitivo y solicita la respuesta.
- Inyeccion de memoria verificada desde un almacen Engram, limitada a tres recuerdos por consulta.
- Mensaje de confirmacion previa: en peticiones que requieren razonamiento, el sistema emite un parrafo corto indicando que ha entendido la tarea y que comienza a trabajar; se desactiva con la variable de entorno `EIRENAEUS_FIRST_WORD=0`.
- Endpoint compatible con la API de OpenAI, utilizable desde clientes que aporten sus propias herramientas.

## Casos de uso

- Asistente de programacion local: el sistema puede generar y revisar codigo sin salir de la maquina, con un presupuesto de razonamiento ajustado automaticamente y una aceleracion medida de 1,93x a 2,00x en HumanEval+ frente al modelo base servido solo.
- Razonamiento matematico asistido: para problemas de competicion o calculo simbolico, el modelo decide internamente cuánto pensar, lo que resulta adecuado en entornos donde la latencia importa pero la calidad no puede degradarse (27 de 30 en AIME 2025, mismo resultado que el base).
- Despliegue en estacion de trabajo con GPU de consumo: al requerir una unica GPU NVIDIA de 12 GB, encaja en equipos de desarrollo individuales donde no hay acceso a clústeres ni a instancias en la nube.
- Entornos con requisitos de privacidad: al ejecutarse integramente en local y no enviar datos al exterior, es apto para procesar codigo propietario, documentacion interna o datos personales que no pueden salir de la organizacion.
- Automatizacion con herramientas externas: el sistema decide cuando invocar herramientas de navegador o de sistema de archivos que aporten los clientes, lo que permite integrarlo en flujos de automatizacion de escritorio.
- Analisis de capturas e imagenes tecnicas: gracias al proyector de vision, puede procesar diagramas, capturas de pantalla o imagenes junto a texto, aunque su rendimiento en MMMU-Pro esta dentro del ruido respecto al modelo base.
- Asistencia con memoria de proyecto: en equipos que ya dispongan de un almacen Engram, el sistema recupera e inyecta recuerdos de proyectos autorizados, lo que resulta util para mantener coherencia entre sesiones de trabajo largas.
- Investigacion sobre routing y modelos compuestos: sirve como banco de pruebas reproducible para medir el efecto de un modelo de decision sobre un modelo de razonamiento, con los conjuntos de preguntas congelados incluidos en el directorio `bench/`.

## Benchmarks y rendimiento

Resultados reportados por el autor, comparando el paquete tal cual se descarga (temperatura 0) y el sistema completo descrito en el whitepaper frente al modelo base Ternary-Bonsai-2-27B servido solo en la misma maquina. Los tiempos solo contabilizan problemas ejecutados sin otra carga en la GPU.

| Benchmark | Problemas | Eirenaeus (paquete) | Base solo | McNemar p | Velocidad |
|---|---|---|---|---|---|
| HumanEval+ | 164 | 151 | 154 | 0,45 | 2,00x |
| Mezcla reservada (codigo y matematicas) | 105 | 97 | 98 | 1,00 | 1,20x |

| Benchmark | Problemas | Eirenaeus (sistema completo) | Base solo | McNemar p | Velocidad |
|---|---|---|---|---|---|
| HumanEval+ | 164 | 156 | 154 | 0,62 | 1,93x |
| MBPP+ | 378 | 308 | 309 | 1,00 | 1,57x |
| AIME 2025 | 30 | 27 | 27 | 1,00 | 1,27x |
| Mezcla reservada | 105 | 97 | 98 | 1,00 | 1,30x |
| Total | 677 | No disponible | No disponible | No disponible | 1,51x (512 frente a 771 minutos) |

| Prueba adicional | Tamano | Resultado | Base solo | Observacion |
|---|---|---|---|---|
| Tool calling (BFCL v4) | 400 llamadas | Empate | Empate | Sin ventaja de velocidad |
| MMMU-Pro (imagenes, preguntas no vistas) | 200 | 130 | 137 | p = 0,23; dentro del ruido |

Segun el autor, no hay diferencias de calidad estadisticamente significativas en ningun benchmark, en ninguna de las dos configuraciones. Los datos son de una sola maquina y una sola clase de GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: 12 GB de VRAM como minimo declarado (el modelo de razonamiento de 27B se sirve cuantizado en ternario PQ2_0 y el modelo de decision de 421M corre en CPU).
- GPU recomendadas: cualquier GPU NVIDIA con 12 GB de VRAM y driver 580 o superior. No se especifican modelos concretos (RTX 4090, A100, H100) en la informacion disponible.
- Compatibilidad con GPU de consumo: si, es uno de los objetivos explicitos del diseno (una unica GPU de consumo de 12 GB).
- Sistema operativo: el instalador oficial es `Install Eirenaeus.cmd` para Windows. No se describe soporte oficial para Linux o macOS.
- Espacio en disco: unos 20 GB libres requeridos; la descarga desde el repositorio ocupa aproximadamente 9 GB, con reanudacion y verificacion sha256 de cada archivo.
- Opciones de despliegue: llama.cpp (bifurcacion Prism) para el modelo de razonamiento, mas los componentes de decision, supervisor y memoria en CPU. El sistema expone un endpoint compatible con OpenAI en `http://127.0.0.1:8090/v1` con el identificador de modelo `Eirenaeus-Philalethes`. El instalador despliega un Python privado y un icono de escritorio que abre una pagina de chat local.
- Latencia: el modelo de decision consume aproximadamente 0,5 segundos por peticion en CPU. En peticiones que requieren razonamiento, el mensaje de confirmacion previa aparece en uno o dos segundos.
- Rendimiento agregado: 1,51x de aceleracion total sobre 677 problemas (512 minutos frente a 771 del base).
- Nota: las peticiones cortas soportan el coste fijo de medio segundo de decision; la ganancia se concentra en problemas que el modelo base pensaria durante mucho tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eirenaeus-Philalethes | 26,9B (ternario 2 bits) + 421M de decision | No disponible | HumanEval+ 156/164; MBPP+ 308/378; AIME 2025 27/30 | Apache 2.0 | HuggingFace, ejecucion local con instalador de Windows |
| Ternary-Bonsai-2-27B (modelo base) | 27B (ternario PQ2_0) | No disponible | HumanEval+ 154/164; MBPP+ 309/378; AIME 2025 27/30 | No disponible en la informacion | HuggingFace, llama.cpp (bifurcacion Prism) |
| Laya (modelo de decision) | 421M (ModernBERT-large) | No disponible | No disponible | No disponible en la informacion | HuggingFace, CPU |
| Otros modelos de razonamiento de ~27B-32B | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye resultados comparativos frente a modelos de razonamiento de tamano similar ajenos al proyecto, por lo que no es posible establecer una comparativa de rendimiento con alternativas como las familias Qwen o DeepSeek mas alla del modelo base.

## Limitaciones y advertencias

- Las mediciones proceden de una sola maquina, una sola clase de GPU y un solo modelo base; el autor advierte que la aceleracion pertenece a esta configuracion hasta que se mida en otros entornos.
- Las peticiones cortas soportan un coste fijo de aproximadamente medio segundo de decision, sin ganancia asociada.
- La memoria requiere un almacen Engram ya existente y permiso por proyecto; sin el, el modelo responde sin memoria. La capacidad de que Eirenaeus escriba sus propios recuerdos esta en la hoja de ruta, no implementada.
- La ventana de contexto no se especifica en la informacion disponible, lo que dificulta planificar cargas de trabajo con documentos largos.
- Solo se declaran ingles y espanol como idiomas soportados.
- Cobertura geografica y linguistica limitada: no se documentan evaluaciones en otros idiomas.
- El sistema depende de la bifurcacion Prism de llama.cpp y del instalador de Windows; no se describe un procedimiento de despliegue equivalente para Linux.
- El modelo compuesto depende de dos modelos base de terceros (prism-ml/Ternary-Bonsai-2-27B-gguf y convaiinnovations/laya), cuyas licencias y condiciones conviene verificar por separado antes de un uso comercial, aunque el repositorio declare Apache 2.0.
- El autor reporta empate en tool calling y resultados dentro del ruido en vision, por lo que no cabe esperar mejoras en esas capacidades respecto al modelo base.
- Riesgo de alucinacion no cuantificado: no se han publicado tasas de alucinacion en la informacion disponible.
- Sesgos conocidos: no disponibles.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa independiente de los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/asastu/Eirenaeus-Philalethes-27B-2bit-421M
- Whitepaper: https://github.com/Jc-asastu/eirenaeus-whitepaper
- Modelo de decision Laya: https://huggingface.co/convaiinnovations/laya
- Modelo base de razonamiento Ternary-Bonsai-2-27B: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Almacen de memoria Engram: https://github.com/Gentleman-Programming/engram
- Gestion de caducidad de memoria Dokimos: https://github.com/Jc-asastu/dokimos
- Trabajo relacionado, enrutador semantico de vLLM: https://vllm.ai/blog/2025-09-11-semantic-router
