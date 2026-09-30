# mdagosta/waldito-smoke-v1-r0000-all-mdagosta-b

## Resumen

`mdagosta/waldito-smoke-v1-r0000-all-mdagosta-b` es un artefacto de pesos publicado en HuggingFace por el usuario mdagosta, etiquetado como modelo de generacion de texto conversacional y construido sobre la arquitectura causal tipo Llama estandar de la libreria Transformers. Segun su model card, se trata de un "OpenWALDO model export", es decir, una exportacion de pesos que emplea el tokenizer de bytes "schema-1" de OpenWALDO y que requiere `trust_remote_code=True` para cargar el tokenizer.

El dato mas relevante es su tamano: los pesos en safetensors suman 820.736 parametros (aproximadamente 0,82 millones), lo que lo situa tres ordenes de magnitud por debajo de un modelo de lenguaje utilizable en produccion. El propio nombre del repositorio ("smoke-v1", revision "r0000") sugiere que se trata de una prueba de humo o artefacto de validacion de un pipeline de exportacion, mas que de un modelo entrenado para tareas reales. El repositorio ocupa 0,0 GB y registra 147 descargas y 0 likes.

Su relevancia es, por tanto, instrumental: sirve para verificar que una cadena de herramientas (carga con Transformers, tokenizer remoto, inventario BOM, despliegue en endpoints compatibles con text-generation-inference) funciona de extremo a extremo. Incluye `BOM.json` con el inventario de ficheros de la release y `EU-BOM.json` con el mapeo de divulgacion de contenido de entrenamiento exigido por el reglamento europeo de IA (GPAI), lo que lo convierte en un ejemplo de empaquetado con trazabilidad regulatoria. No se dispone de informacion sobre licencia, idiomas soportados, longitud de contexto ni proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (arquitectura estandar de Transformers, `LlamaForCausalLM`) |
| Parametros totales | 820.736 (0,82 millones), segun los pesos en safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se declaran pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`); tokenizer de bytes "schema-1" de OpenWALDO que requiere `trust_remote_code=True` |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado | text-generation |
| Etiquetas | transformers, safetensors, llama, text-generation, conversational, text-generation-inference, endpoints_compatible, region:us |
| Descargas / likes | 147 / 0 |
| Fecha de creacion | 2026-09-30 |
| Ultima actualizacion | 2026-09-30 |

## Arquitectura y entrenamiento

La model card indica que el paquete utiliza "la arquitectura estandar de modelo causal de lenguaje Llama de Transformers" junto con el tokenizer de bytes schema-1 de OpenWALDO. No se describen modificaciones sobre el bloque transformer original: no se mencionan atencion lineal, capas SSM, mezcla de expertos, decodificacion especulativa ni ninguna otra innovacion arquitectonica. Tampoco se detalla el numero de capas, dimensiones ocultas, cabezas de atencion o vocabulario, mas alla de que el tokenizer opera a nivel de bytes.

No hay informacion sobre el proceso de entrenamiento: se desconoce el numero de tokens vistos, la composicion del dataset, si hubo fases de ajuste supervisado, RLHF o DPO, y si existen datos de evaluacion. El unico elemento de trazabilidad documental son los ficheros `BOM.json` (inventario de todos los ficheros de la release) y `EU-BOM.json` (mapeo de divulgacion de contenido de entrenamiento para el reglamento europeo de modelos de proposito general), que no aportan cifras de entrenamiento en la informacion disponible.

## Capacidades

- Generacion de texto autorregresiva segun la arquitectura causal tipo Llama declarada, aunque con 820.736 parametros no cabe esperar coherencia linguistica en texto libre.
- Conversacion multi-turno: la etiqueta `conversational` esta presente, pero no existe ninguna evidencia publicada de calidad conversacional.
- Compatibilidad con `text-generation-inference` y con endpoints compatibles (`endpoints_compatible`), lo que permite exponerlo mediante una API estandar.
- Carga mediante la libreria `transformers` con tokenizer remoto (`trust_remote_code=True`).
- Tokenizacion a nivel de bytes (schema-1 de OpenWALDO), lo que en principio evita problemas de vocabulario fuera de dominio, sin datos publicados que lo confirmen.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara ninguna lista de idiomas).
- Vision, audio, thinking mode u otras capacidades especiales: no disponible.

## Casos de uso

- Prueba de humo de pipelines de exportacion: el modelo sirve para verificar que un pipeline de conversion y publicacion de pesos (formato safetensors, ficheros BOM) produce artefactos cargables antes de lanzar una release real de mayor tamano.
- Validacion de integracion con `text-generation-inference`: al declarar la etiqueta `endpoints_compatible` y ocupar menos de 1 MB en disco, permite levantar un endpoint TGI y comprobar en segundos que el enrutado, el formateo de plantillas y el streaming funcionan.
- Test de tokenizers remotos: es util para comprobar que el flujo `trust_remote_code=True` con el tokenizer de bytes schema-1 de OpenWALDO se resuelve correctamente en entornos con acceso restringido a codigo remoto.
- Verificacion de cumplimiento y trazabilidad: los ficheros `BOM.json` y `EU-BOM.json` permiten probar herramientas internas de auditoria que parsean inventarios de releases y mapeos de divulgacion GPAI de la Union Europea.
- Integracion continua de infraestructura de inferencia: dado su tamano minimo, se puede incluir en tests automatizados de CI/CD que validen que vLLM, TGI o llama.cpp arrancan, cargan pesos y devuelven tokens, sin consumir GPU ni cuota de recursos.
- Docencia y demostraciones de arquitectura: permite ilustrar en un aula o taller el ciclo completo de carga de un `LlamaForCausalLM`, inspeccion de la configuracion y generacion de tokens sin necesidad de hardware especializado.
- Pruebas de carga y de formato de respuesta de API: util para medir el overhead del servidor HTTP (serializacion, plantillas de chat) aislando el coste de la inferencia, que resulta despreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y los resultados de busqueda web no aportan datos sobre este modelo. No se deben inferir capacidades a partir del nombre del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,3 MB en fp32, 1,6 MB en fp16/bf16 y 0,8 MB en int8, calculados a partir de los 820.736 parametros declarados.
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU con mas de 1 MB de memoria libre, incluidas integradas y aceleradores de gama de entrada.
- Cabe en GPU de consumo: si, en cualquiera (RTX 4090, RTX 3060, GTX 1650, e incluso en CPU sin GPU dedicada). El cuello de botella real es el lanzamiento del proceso y del servidor, no los pesos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` para el tokenizer; `text-generation-inference` (declarado en las etiquetas); endpoints compatibles con la API de text-generation-inference; llama.cpp, Ollama o vLLM son teoricamente viables por arquitectura, pero no hay confirmacion de conversion ni de soporte en la informacion disponible.
- Latencia y throughput: no disponibles. Con este tamano, la latencia estaria dominada por el overhead del runtime y de la red, no por el computo del modelo.

## Comparativa con modelos similares

No disponible. No se ha identificado en la informacion proporcionada ningun modelo publico comparable con el que contrastarlo, porque no se conocen ni su licencia, ni sus idiomas, ni su contexto, ni su proceso de entrenamiento, ni resultados de evaluacion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| waldito-smoke-v1-r0000-all-mdagosta-b | 820.736 | no disponible | no disponible | HuggingFace (147 descargas, 0 likes) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

A efectos practicos, y a falta de datos oficiales, la unica comparacion defendible es funcional: se trata de un artefacto de validacion, no de un modelo de Lenguaje destinado a tareas de generacion reales. Cualquier modelo abierto de 1.000 a 8.000 millones de parametros seria la alternativa logica si el objetivo es generar texto.

## Limitaciones y advertencias

- Tamano insuficiente para uso real: con 820.736 parametros, la probabilidad de generar texto gramatical y factualmente coherente es practicamente nula. No debe desplegarse en ningun flujo orientado a usuarios finales.
- Riesgo de alucinacion: extremo. Al no haber sido entrenado sobre un corpus documentado (no hay informacion al respecto), cualquier salida debe considerarse ruido estadistico.
- Sesgos conocidos: no disponible. No hay evaluacion de sesgos ni documentacion sobre la composicion del dataset, por lo que no se puede descartar ni confirmar ningun sesgo.
- Limitaciones de contexto e idioma: no disponibles. Se desconoce la ventana maxima y no se declara ningun idioma soportado.
- Licencia: no disponible. La ausencia de licencia explicita impide asumir permisos de uso comercial, redistribucion o modificacion. En ausencia de licencia, la postura conservadora es tratar la obra como "todos los derechos reservados".
- Ejecucion de codigo remoto: la carga del tokenizer exige `trust_remote_code=True`, lo que implica ejecutar codigo publicado por el autor del repositorio. Es un riesgo de seguridad en entornos de produccion y debe auditarse antes de usarlo fuera de un sandbox.
- Trazabilidad parcial: aunque se incluyen `BOM.json` y `EU-BOM.json`, el repositorio no documenta hiperparametros, datos de entrenamiento ni metricas, por lo que no cumple por si solo los requisitos de informacion que un despliegue serio exigiria.
- Fechas anomalas: las marcas de creacion y actualizacion (2026-09-30) y la diferencia de dos segundos entre ambas son coherentes con un artefacto generado automaticamente; conviene verificar la procedencia antes de integrarlo en cualquier cadena de suministro.

## Enlaces

- HuggingFace: https://huggingface.co/mdagosta/waldito-smoke-v1-r0000-all-mdagosta-b
- Repositorio en HuggingFace (arbol de ficheros, incluidos `BOM.json` y `EU-BOM.json`): https://huggingface.co/mdagosta/waldito-smoke-v1-r0000-all-mdagosta-b/tree/main
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo en la busqueda realizada. Los resultados devueltos (Google Gemini, Godot AI, listados de modelos gratuitos y un panel de novedades de LLM) no guardan relacion con el modelo, con su autor ni con el proyecto OpenWALDO.
