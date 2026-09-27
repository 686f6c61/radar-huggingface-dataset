# miesdevries/stay4s-lora-q8

## Resumen

Stay4S LoRA Q8 (`miesdevries/stay4s-lora-q8`) es un ajuste fino mediante LoRA del modelo Qwen3-4B-Instruct-2507, publicado por el desarrollador neerlandés Mitchell de Vries bajo el paraguas del proyecto Stay4S, que se presenta como un ecosistema de IA "soberano" en neerlandés, autoalojado y sin dependencia de grandes proveedores. El repositorio contiene los pesos en formato GGUF con cuantización Q8_0, con un total de 4.022.468.096 parámetros (~4,02 mil millones) y un tamaño de 4,3 GB, lo que permite ejecutarlo en hardware de gama baja, incluida una Raspberry Pi 5 mediante Ollama.

El modelo está orientado explícitamente al idioma neerlandés (`language: nl`) y a un caso de uso conversacional. El ajuste se realizó con un adaptador LoRA de rango 64 y alpha 64 sobre el modelo base instruct de Qwen3, y el resultado se distribuye ya fusionado y cuantizado, de modo que el usuario final no necesita aplicar el adaptador por separado.

Su relevancia es limitada pero concreta: cubre el nicho de modelos pequeños, en neerlandés y desplegables en el borde (edge), con fines de privacidad y autosuficiencia. No obstante, la ficha debe leerse con cautela: el repositorio no publica benchmarks, no detalla el conjunto de datos de entrenamiento, no especifica la ventana de contexto y la licencia figura como "other" sin aclarar sus términos. El recuento de descargas y "likes" es cero en el momento de la consulta, por lo que se trata de una publicación sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) con ajuste fino LoRA (r=64, alpha=64); pesos distribuidos en GGUF cuantizado |
| Parametros totales | 4.022.468.096 (~4,02 mil millones) |
| Parametros activos | No aplica: modelo denso, no es Mixture of Experts |
| Longitud de contexto | No disponible (la model card no especifica ventana de contexto) |
| Tipos de cuantizacion | Q8_0 (unica cuantizacion publicada en este repositorio; 4,3 GB) |
| Idiomas soportados | Neerlandes (`nl`) declarado en la model card; el modelo base Qwen3 es multilingue, pero este repositorio no documenta otros idiomas |
| Licencia | Other (etiquetada como `license: other`; terminos no detallados en la model card) |
| Formato de pesos | GGUF (repositorio de 4,3 GB); HuggingFace expone recuento de parametros sobre safetensors |
| Pipeline declarado | No disponible |
| Etiquetas adicionales | `endpoints_compatible`, `ollama`, `raspberry-pi`, `conversational` |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de aproximadamente 4.000 millones de parametros. Sobre esa base se aplico un ajuste fino supervisado con LoRA de rango 64 y alpha 64, segun declara la model card. No se especifica si hubo etapas adicionales de optimizacion por preferencias (RLHF, DPO u otras), ni el numero de tokens de entrenamiento, ni la composicion del dataset en neerlandes utilizado. Tampoco se indica si el adaptador se fusiono con los pesos base antes o durante la conversion a GGUF.

La innovacion tecnica relevante no esta en la arquitectura sino en el empaquetado: el resultado se publica directamente cuantizado en Q8_0 (4,3 GB) y listo para Ollama, lo que reduce la friccion de despliegue en dispositivos de bajos recursos. La model card menciona explicitamente su funcionamiento en Raspberry Pi 5, un escenario poco habitual para un modelo de 4.000 millones de parametros y que sugiere un enfoque deliberado hacia la inferencia local y privada.

No se documenta ninguna tecnica adicional (atencion lineal, decodificacion especulativa, modos de razonamiento extendido) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en neerlandes, que es el idioma declarado del modelo.
- Ajuste especifico sobre un modelo instruct, por lo que cabe esperar seguimiento de instrucciones y formato de dialogo, si bien no se documenta el conjunto de evaluacion empleado.
- Compatibilidad declarada con Ollama, ademas de la etiqueta `endpoints_compatible`, que indica que el repositorio puede desplegarse a traves de HuggingFace Inference Endpoints.
- Ejecucion en hardware de bajos recursos: la model card afirma que funciona en Raspberry Pi 5 gracias a la cuantizacion Q8_0.
- Capacidades multilingues mas alla del neerlandes: no documentadas en este repositorio, aunque el modelo base Qwen3 tenga soporte multilingue.
- Soporte de tool calling / function calling: no documentado en la model card (el modelo base Qwen3 lo soporta, pero no hay confirmacion de que el ajuste LoRA lo preserve).
- Modo de razonamiento extendido ("thinking"): no documentado.
- Vision, audio o cualquier otra modalidad: no disponible; se trata de un modelo exclusivamente de texto.

## Casos de uso

- Asistente conversacional autoalojado en neerlandes: el modelo puede desplegarse con Ollama en una maquina local o en una Raspberry Pi 5, de modo que las conversaciones no salgan de la infraestructura propia. Es adecuado cuando la confidencialidad pesa mas que la calidad bruta de las respuestas.
- Atencion al cliente y FAQ para pymes neerlandesas: con 4,3 GB de pesos en Q8_0 puede ejecutarse en un servidor modesto y gestionar respuestas sobre catalogos, horarios o politicas internas, siempre que la ventana de contexto necesaria sea reducida (no especificada en la ficha del modelo).
- Despliegue en el borde para kioscos, domotica o terminales de punto de venta: la combinacion de cuantizacion Q8_0 y compatibilidad con Ollama permite incrustar un asistente de idioma neerlandes en dispositivos sin GPU dedicada.
- Anotacion y clasificacion de textos administrativos neerlandeses: resumen de correos, extraccion de campos o etiquetado de tickets se pueden procesar por lotes en local, evitando enviar documentacion sensible a APIs externas.
- Prototipado rapido de aplicaciones de IA en neerlandes: al estar disponible como GGUF y en Ollama, sirve para validar productos antes de invertir en modelos mayores o en servicios en la nube.
- Practica y aprendizaje del idioma: generacion de dialogos, correcciones y ejercicios en neerlandes para herramientas educativas, aprovechando que el ajuste esta especializado en ese idioma.
- Evaluacion interna de pipelines de inferencia local: util como caso de prueba para medir latencia, consumo de memoria y comportamiento de Ollama en hardware limitado antes de escalar a modelos mayores.
- Investigacion sobre ajuste LoRA en idiomas de bajos recursos: el repositorio documenta la configuracion (r=64, alpha=64) y puede servir como referencia reproducible, aunque no publique el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y el repositorio no aporta comparaciones cuantitativas con el modelo base ni con alternativas. Los resultados de busqueda web realizados no devolvieron ninguna fuente tecnica relacionada con este modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,5-6 GB para inferencia en Q8_0 si se carga completo en memoria (el archivo pesa 4,3 GB y hay que sumar la cache KV y el overhead del runtime). Es una estimacion, no un dato publicado por el autor.
- Los pesos pueden residir parcialmente en RAM del sistema, ya que Ollama soporta reparto entre CPU y GPU; en ese caso la VRAM necesaria se reduce a costa de la latencia.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo cabe holgadamente en GPUs de consumo como RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090, y tambien en GPUs profesionales (A100, H100) sobredimensionadas para este tamano.
- Si cabe en GPU de consumo: si, en cualquier GPU con al menos 6-8 GB de VRAM, siempre que se use la cuantizacion Q8_0 publicada.
- Despliegue en CPU pura: la model card afirma que funciona en Raspberry Pi 5, lo que implica inferencia en CPU con llama.cpp/Ollama, con velocidad muy baja pero funcional.
- Opciones de despliegue: Ollama (`ollama run stay4s-lora`), llama.cpp y otros runtimes compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints.
- Latencia y throughput estimados: no disponibles. El autor no publica cifras de tokens por segundo ni de latencia en Raspberry Pi 5 ni en ninguna otra plataforma.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de este modelo, por lo que la comparacion se limita a caracteristicas declaradas y queda marcada como "no disponible" en los apartados que no se pueden verificar.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| stay4s-lora-q8 | ~4,02 mil millones | No disponible | Neerlandes | Other | LoRA (r=64, alpha=64) sobre Qwen3-4B-Instruct-2507, cuantizado en Q8_0, 4,3 GB |
| Qwen3-4B-Instruct-2507 (base) | ~4 mil millones (no confirmado en la informacion disponible) | No disponible | No disponible | No disponible | Modelo base del ajuste; sus especificaciones no se detallan en el repositorio consultado |
| Alternativas de ~3-4B ajustadas a un idioma concreto | No disponible | No disponible | No disponible | No disponible | No se han identificado en la informacion disponible modelos comparables equivalentes en neerlandes |

No se dispone de benchmarks que permitan afirmar que este ajuste supera, iguala o empeora al modelo base o a otras alternativas del mismo tamano.

## Limitaciones y advertencias

- Ausencia total de validacion publica: cero descargas y cero "likes" en el momento de la consulta, sin benchmarks ni evaluaciones de terceros.
- Riesgo de alucinacion: es un modelo de ~4.000 millones de parametros con cuantizacion Q8_0; se espera una tasa de error factual superior a la de modelos mayores, especialmente en dominios especializados y en idiomas distintos del neerlandes.
- Idioma restringido: la model card declara unicamente neerlandes. El comportamiento en castellano, ingles u otros idiomas no esta documentado y podria degradarse respecto al modelo base.
- Contexto desconocido: al no especificarse la ventana de contexto, no es posible planificar casos de uso con documentos largos o conversaciones multi-turno extensas sin realizar pruebas previas.
- Licencia ambigua: figura como "other" sin texto de licencia explicito en la model card. Antes de cualquier uso comercial es imprescindible contactar con el autor o consultar el repositorio de GitHub del proyecto para conocer los terminos reales.
- Trazabilidad del entrenamiento: no se publica el dataset, el numero de tokens ni el procedimiento de evaluacion, lo que impide auditar sesgos o reproducir el ajuste.
- Posible perdida de capacidades del modelo base: al aplicarse solo una LoRA de rango 64, no hay garantia documentada de que se conserven tool calling, razonamiento multi-paso u otras habilidades del Qwen3 original.
- Metadatos anomalos: las fechas de creacion y actualizacion que declara HuggingFace (27/09/2026) son posteriores a la fecha actual, lo que apunta a un error en los metadatos del repositorio y refuerza la necesidad de verificar la procedencia del artefacto antes de usarlo en produccion.
- La busqueda web realizada no devolvio ninguna fuente tecnica relacionada con el modelo; los unicos resultados obtenidos eran contenido no relacionado, por lo que no se han podido contrastar las afirmaciones de la model card con documentacion independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/miesdevries/stay4s-lora-q8
- Sitio web del proyecto Stay4S: https://stay4s.com
- GitHub del proyecto: https://github.com/hetnieuwebeginbv-glitch
- Paper, blog tecnico o demo: no disponibles en la informacion proporcionada
- Resultados de busqueda web relevantes: ninguno (las busquedas realizadas no devolvieron fuentes tecnicas relacionadas con el modelo)
