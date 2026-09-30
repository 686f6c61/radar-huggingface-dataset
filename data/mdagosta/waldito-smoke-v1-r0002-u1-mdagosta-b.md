# mdagosta/waldito-smoke-v1-r0002-u1-mdagosta-b

## Resumen

`mdagosta/waldito-smoke-v1-r0002-u1-mdagosta-b` es un modelo de generacion de texto publicado por el usuario mdagosta (Michael D'Agosta) en HuggingFace. Segun su model card, se trata de una exportacion de "OpenWALDO" que emplea la arquitectura estandar Llama de tipo causal-language-model de Transformers, acompanada del tokenizer de bytes "schema-1" propio de OpenWALDO. El repositorio incluye ademas dos ficheros de inventario: `BOM.json`, que enumera todos los ficheros de la release, y `EU-BOM.json`, con el mapeo de divulgacion de contenido de entrenamiento exigido por el reglamento europeo de IA (GPAI).

El dato mas relevante es su tamano: 820.736 parametros totales en safetensors, es decir, menos de un millon de parametros y muy por debajo de cualquier modelo utilizable para generacion de texto real. El nombre "smoke" sugiere que se trata de una prueba de humo (smoke test) del pipeline de entrenamiento o de exportacion, no de un modelo destinado a produccion. El repo ocupa 0,0 GB y apenas acumula 127 descargas y 0 likes, lo que refuerza esa interpretacion.

No se dispone de informacion sobre licencia, idiomas soportados, longitud de contexto ni datos de entrenamiento. La ficha que sigue recoge exclusivamente lo verificable a partir de la informacion proporcionada, marcando como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (segun model card) |
| Parametros totales | 820.736 (~0,82 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se declaran variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizer | OpenWALDO schema-1 byte tokenizer (requiere `trust_remote_code=True`) |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion (declarada) | 2026-09-30 |
| Descargas / likes | 127 / 0 |

## Arquitectura y entrenamiento

La model card indica unicamente que el paquete usa la arquitectura estandar de Transformers para modelos de lenguaje causal tipo Llama, con el tokenizer de bytes "schema-1" de OpenWALDO. No se especifica el numero de capas, la dimension del modelo, el numero de cabezas de atencion, la funcion de activacion ni la implementacion de atencion empleada. El unico dato cuantitativo verificable es el recuento de parametros del safetensors: 820.736.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La presencia de `BOM.json` y `EU-BOM.json` apunta a un esfuerzo de trazabilidad y cumplimiento normativo (inventario de ficheros y divulgacion de contenido de entrenamiento para GPAI en la UE), pero el contenido de esos ficheros no se ha facilitado. No se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto causal: el modelo pertenece al pipeline `text-generation`, pero con 0,82 M de parametros no cabe esperar texto coherente ni gramatical en uso general.
- Conversacion: el tag `conversational` sugiere un formato de chat previsto, aunque no hay plantilla de chat documentada.
- Compatibilidad con text-generation-inference (TGI) y endpoints compatibles, segun los tags del repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision, audio, thinking mode u otras capacidades especiales: no disponibles.

## Casos de uso

- Prueba de humo de pipelines de inferencia: al ser un modelo de menos de 1 M de parametros, es adecuado para verificar que un despliegue (TGI, transformers, endpoints compatibles) arranca, carga pesos y devuelve tokens sin consumir recursos.
- Validacion de integracion del tokenizer OpenWALDO schema-1: permite comprobar que la carga con `trust_remote_code=True` funciona y que el flujo de tokenizacion de bytes se comporta como se espera antes de escalar a un modelo mayor del mismo linaje.
- Test de CI/CD para releases de modelos: sirve como artefacto ligero en pruebas automatizadas que verifican empaquetado, safetensors, inventarios BOM y metadatos antes de publicar versiones grandes.
- Verificacion de cumplimiento normativo: los ficheros `BOM.json` y `EU-BOM.json` permiten ensayar el proceso de auditoria de contenido de entrenamiento y trazabilidad de ficheros exigido por el reglamento europeo de IA.
- Desarrollo y depuracion de harness de evaluacion: util para probar arneses de benchmark (carga, generacion, parseo de salidas) sin incurrir en coste de GPU.
- Pruebas de cuantizacion y conversion de formatos: sirve para validar scripts de conversion safetensors a GGUF u otros formatos y comprobar que las herramientas manejan vocabularios de bytes.
- Docencia y demostraciones de arquitectura: permite ilustrar la estructura de un transformer causal tipo Llama y el flujo de carga en Transformers en entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB en fp32 (820.736 parametros x 4 bytes ≈ 3,3 MB solo de pesos); el overhead de runtime de transformers domina ampliamente el consumo.
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU, incluida una GTX 1050 o una iGPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en CPU.
- Despliegue en CPU: viable sin optimizaciones; el cuello de botella sera el runtime de Python, no el modelo.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints compatibles (segun tags). No se declaran pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, y el tamano del modelo (0,82 M de parametros) queda fuera de los rangos habituales de comparacion de la literatura. El unico artefacto relacionado identificado es `mdagosta/waldito-smoke-v1-r0002-merge`, del mismo autor, del que no se dispone de especificaciones.

## Limitaciones y advertencias

- Capacidad practicamente nula de generacion de texto coherente: 820.736 parametros estan muy por debajo del minimo necesario para lenguaje natural util.
- Licencia no declarada: no se puede confirmar si se permite uso comercial, redistribucion o modificacion. Tratar como no apto para produccion hasta que el autor lo aclare.
- Idiomas no declarados: no se puede garantizar soporte de castellano ni de ningun otro idioma.
- Longitud de contexto desconocida: no hay datos sobre la ventana de atencion ni sobre el entrenamiento en secuencias largas.
- Riesgo elevado de salidas degeneradas o repetitivas, propio de modelos de este tamano.
- Ejecucion de codigo remoto: el tokenizer exige `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; auditar el fichero antes de cargarlo en entornos sensibles.
- Trazabilidad dudosa: la fecha de creacion declarada (30 de septiembre de 2026) es posterior a la fecha actual de referencia, lo que sugiere metadatos no fiables o generados automaticamente.
- Los ficheros `BOM.json` y `EU-BOM.json` se anuncian en la model card, pero no se ha verificado su contenido ni su exhaustividad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-smoke-v1-r0002-u1-mdagosta-b
- Perfil del autor en HuggingFace: https://huggingface.co/mdagosta
- Modelo relacionado del mismo autor: https://huggingface.co/mdagosta/waldito-smoke-v1-r0002-merge
- Perfil del autor en GitHub: https://github.com/mdagosta
