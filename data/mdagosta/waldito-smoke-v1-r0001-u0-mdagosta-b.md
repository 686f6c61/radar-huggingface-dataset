# mdagosta/waldito-smoke-v1-r0001-u0-mdagosta-b

## Resumen

`waldito-smoke-v1-r0001-u0-mdagosta-b` es un modelo de generacion de texto publicado en Hugging Face por el usuario mdagosta (Michael D'Agosta), desarrollador que trabaja en sistemas de entrenamiento distribuido para modelos a medida. Se trata de un export del proyecto OpenWALDO que reutiliza la arquitectura estandar `LlamaForCausalLM` de la libreria Transformers junto con un tokenizer propio de bytes ("schema-1 byte tokenizer"). Con 820.736 parametros totales, es un modelo de escala minima, muy lejos de los rangos habituales de produccion.

El nombre del repositorio indica que es un artefacto de tipo "smoke test" (version v1, revision r0001, unidad u0), es decir, una publicacion de validacion de la cadena de exportacion mas que un modelo destinado a tareas reales. A pesar de ello, acumula 141 descargas y esta etiquetado como compatible con text-generation-inference y endpoints, lo que sugiere que forma parte de un pipeline automatizado de publicacion de releases.

Su relevancia es fundamentalmente tecnica y de trazabilidad: la model card menciona un fichero `BOM.json` que inventaria cada fichero del release y un `EU-BOM.json` con el mapeo de divulgacion de contenido de entrenamiento exigido por el reglamento europeo de IA (GPAI). No se dispone de informacion sobre datos de entrenamiento, licencia, idiomas ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (`LlamaForCausalLM` de Transformers) |
| Parametros totales | 820.736 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se declaran pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (la model card solo describe un tokenizer de bytes, sin lista de idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria de carga | transformers (requiere `trust_remote_code=True` para el tokenizer) |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion indicada | 2026-09-30 |
| Fecha de actualizacion indicada | 2026-09-30 |
| Descargas / likes | 141 / 0 |

## Arquitectura y entrenamiento

La model card es explicita: el paquete es un "OpenWALDO model export" que utiliza la arquitectura causal-language-model estandar de Transformers basada en Llama, acompanada del tokenizer de bytes propio de OpenWALDO ("schema-1 byte tokenizer"), que debe cargarse con `trust_remote_code=True`. No se describe ninguna innovacion arquitectonica adicional: no hay atencion lineal, ni SSM, ni mezcla de expertos, ni decodificacion especulativa. Con 820.736 parametros, el modelo corresponde a una configuracion Llama muy reducida (dimensiones de embedding y numero de capas no disponibles).

No hay informacion sobre el proceso de entrenamiento: no se indica el numero de tokens, la composicion del dataset, si hubo fases de ajuste supervisado, RLHF o DPO, ni el regimen de precision o hardware empleado. Los unicos artefactos de trazabilidad documentados son `BOM.json`, que inventaria todos los ficheros del release, y `EU-BOM.json`, que contiene el mapeo de divulgacion de contenido de entrenamiento segun el reglamento europeo de IA para modelos de proposito general. No se han publicado pesos intermedios, informes de entrenamiento ni curvas de perdida.

## Capacidades

- Generacion de texto autoregresiva basica, derivada de la arquitectura Llama causal; no hay evidencia publicada de calidad de salida.
- Conversacion multi-turno: el repositorio incluye la etiqueta `conversational`, aunque no se documenta ninguna plantilla de chat ni formato de prompt.
- Codificacion y decodificacion a nivel de byte mediante el tokenizer schema-1 de OpenWALDO, lo que en principio permite representar cualquier secuencia de bytes sin caracteres fuera de vocabulario.
- Compatibilidad declarada con text-generation-inference y con endpoints, segun las etiquetas del repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Validacion de pipelines de exportacion: el modelo sirve como artefacto de humo para comprobar que un flujo de conversion a safetensors, publicacion en el Hub y carga con Transformers funciona de extremo a extremo antes de lanzar releases de mayor tamano.
- Pruebas de integracion de text-generation-inference: al estar etiquetado como compatible con TGI y endpoints, permite verificar el arranque, el enrutado de peticiones y el formateo de respuestas de un servidor de inferencia con un coste de recursos minimo.
- Test de tokenizers personalizados: dado que exige `trust_remote_code=True` por el tokenizer de bytes schema-1, es util para comprobar que el registro remoto de codigo, el versionado y las dependencias del tokenizer funcionan en un entorno controlado.
- Auditoria de trazabilidad y cumplimiento: los ficheros `BOM.json` y `EU-BOM.json` permiten ensayar herramientas internas de inventario de artefactos y de generacion de documentacion de divulgacion de contenido de entrenamiento para el reglamento europeo de IA.
- Pruebas unitarias y de regresion en CI: por su tamano (menos de 4 MB en fp32), se puede descargar y ejecutar en cada commit de un repositorio sin penalizar los tiempos de build.
- Docencia y experimentacion didactica: sirve para ilustrar la estructura de un modelo Llama, la relacion entre configuracion y numero de parametros, y el ciclo de carga con `AutoModelForCausalLM` sin necesidad de GPU.
- Generacion de texto en produccion: no recomendado, no hay evidencia de calidad ni licencia que lo ampare.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,3 MB en fp32, 1,6 MB en fp16/bf16 y 0,8 MB en int8 para los pesos; el coste real de memoria depende del contexto (no disponible) y del overhead del runtime.
- GPU recomendadas: cualquiera, incluida una GPU integrada. El modelo cabe holgadamente en RTX 3060, RTX 4090, A100, H100 y en cualquier acelerador con mas de 1 GB de memoria.
- Cabe en GPU de consumo: si, en todas. Tambien cabe en CPU, en contenedores sin GPU y en dispositivos embebidos tipo Raspberry Pi.
- Opciones de despliegue: transformers (ruta oficial, con `trust_remote_code=True`), text-generation-inference y endpoints compatibles segun las etiquetas del repositorio. vLLM y llama.cpp no estan confirmados; llama.cpp requeriria una conversion a GGUF no publicada.
- Latencia y throughput estimados: no disponibles. Por el tamano, la latencia estara dominada por el overhead de red y de framework, no por el calculo.

## Comparativa con modelos similares

No se dispone de modelos comparables directos publicados con datos de rendimiento verificables para esta categoria. La tabla siguiente es una comparacion orientativa a nivel de especificaciones con modelos pequenos de arquitectura similar; los datos de las alternativas provienen de sus fichas publicas y no implican comparacion de calidad, dado que no existen benchmarks de `waldito-smoke-v1`.

| Modelo | Parametros | Contexto | Licencia | Arquitectura | Benchmarks publicados |
|---|---|---|---|---|---|
| waldito-smoke-v1-r0001-u0-mdagosta-b | 820.736 | no disponible | no disponible | Llama causal (Transformers) | no disponible |
| SmolLM-135M | 135 M | 2048 | Apache-2.0 | Llama causal (Transformers) | si, en su ficha publica |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache-2.0 | Llama causal (Transformers) | si, en su ficha publica |

La diferencia de escala con ambas alternativas es de dos a tres ordenes de magnitud en numero de parametros, por lo que no son sustituibles entre si en tareas de generacion reales.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial, la redistribucion ni la creacion de obras derivadas. Tratarlo como no apto para produccion hasta que el autor explicite los terminos.
- Riesgo de alucinacion muy alto: con 820.736 parametros, la capacidad de almacenar conocimiento factual es practicamente nula; las salidas deben considerarse ruido estadistico sin valor informativo.
- Requiere `trust_remote_code=True` para cargar el tokenizer, lo que implica ejecutar codigo arbitrario del repositorio. Debe auditarse antes de usarlo en entornos compartidos o con datos sensibles.
- Sesgos conocidos: no disponibles, pero al no haber informacion sobre el corpus de entrenamiento no es posible descartar sesgos sistematicos ni contenido problematico.
- Limitaciones de contexto e idioma: no disponibles. La model card no declara ventana de contexto ni cobertura idiomatica, y el tokenizer de bytes no garantiza por si solo un buen comportamiento multilingue.
- Marcado como "smoke test" en el propio nombre del repositorio: es un artefacto de validacion, no un modelo afinado para tareas. No debe utilizarse como base para evaluaciones de calidad ni como referencia de las capacidades de la familia OpenWALDO.
- Fechas incoherentes: los campos de creacion y actualizacion indican 2026-09-30, posteriores a la fecha habitual de consulta; conviene verificar el historial de commits del repositorio antes de citarlo.
- Sin resultados de evaluacion ni documentacion de entrenamiento: no hay forma de reproducir el modelo ni de estimar su comportamiento fuera del prompt de prueba.
- Idiomas: al no declararse ninguno, no se puede asumir soporte fiable del castellano ni de ninguna otra lengua.
- Los ficheros `BOM.json` y `EU-BOM.json` se mencionan en la model card pero su contenido no se ha verificado; pueden contener campos incompletos o plantillas sin rellenar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdagosta/waldito-smoke-v1-r0001-u0-mdagosta-b
- Perfil del autor en Hugging Face: https://huggingface.co/mdagosta
- Perfil del autor en GitHub: https://github.com/mdagosta
- Repositorio de revision relacionado (mencionado en la busqueda): https://huggingface.co/mdagosta/waldito-smoke-v1-r0002-merge
- Ficheros de trazabilidad dentro del repositorio: `BOM.json` y `EU-BOM.json` (no verificados)
- Paper, blog o demo oficial: no disponible
