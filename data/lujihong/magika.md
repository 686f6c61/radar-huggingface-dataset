# lujihong/magika

## Resumen

Magika es una herramienta de deteccion de tipo de archivo basada en contenido desarrollada originalmente por Google. Este repositorio, alojado por el usuario lujihong, es una copia autoalojada de los assets oficiales de Google Magika, concretamente la version `standard_v3_3`, pensada para su uso en el cliente de escritorio de LaunchAI (浪起). No se trata de un modelo de lenguaje generativo, sino de un clasificador ligero que infiere el tipo real de un fichero a partir de sus bytes, independientemente de la extension que declare.

El modelo se distribuye en formato ONNX con un peso de aproximadamente 3,16 MB, acompanado de dos ficheros JSON de configuracion y de una base de conocimiento de tipos de contenido. La copia es byte a byte identica al upstream, con verificacion SHA256 en el codigo cliente, lo que garantiza integridad y trazabilidad respecto a `google/magika`.

Su relevancia radica en que ofrece una alternativa local, sin dependencias de red ni servicios externos, para tareas de preclasificacion y prechequeo de seguridad de adjuntos, con una licencia permisiva Apache-2.0 heredada del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal ligera exportada a ONNX (detalles internos de capas no disponibles en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de ficheros, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `model.onnx` de 3.163.737 bytes) |
| Idiomas soportados | no aplica (no procesa texto natural; la model card no declara idiomas) |
| Licencia | Apache-2.0 (heredada de `google/magika`) |
| Formato de pesos | ONNX (`models/standard_v3_3/model.onnx`), mas `config.min.json` y `content_types_kb.min.json` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de la red neuronal. Lo que si se conoce es que el artefacto distribuido es un grafo ONNX (`standard_v3_3`) de 3.163.737 bytes, acompanado de un fichero de configuracion minimizado (`config.min.json`, 2.141 bytes) y de una base de conocimiento de tipos de contenido (`content_types_kb.min.json`, 70.555 bytes). El modelo opera sobre los bytes del fichero, no sobre texto, y produce una etiqueta de tipo de contenido.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de tecnicas como RLHF o DPO, ya que no es un modelo de lenguaje. La innovacion principal del proyecto upstream es precisamente el enfoque de deteccion por contenido frente a la clasificacion por extension o por cabeceras, que resulta mas robusto frente a ficheros mal etiquetados o manipulados. Este repositorio no introduce cambios: es una copia integra con verificacion SHA256 contra el upstream.

## Capacidades

- Deteccion de tipo de archivo basada en contenido (analisis de bytes), no en la extension declarada.
- Clasificacion contra la base de conocimiento de tipos de contenido incluida (`content_types_kb.min.json`).
- Verificacion de integridad de los tres artefactos mediante SHA256 en el codigo cliente.
- Ejecucion local mediante runtime ONNX, sin dependencia de servicios externos.
- Uso previsto como prechequeo de seguridad y validacion de adjuntos en un cliente de escritorio.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni tool calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue en sentido NLP: no procesa lenguaje natural.

## Casos de uso

- Prechequeo de adjuntos en cliente de escritorio: antes de subir o abrir un fichero, el cliente ejecuta el modelo ONNX sobre los bytes para determinar el tipo real y bloquear o advertir sobre extensiones enganosas (por ejemplo, un `.jpg` que en realidad es un ejecutable).
- Validacion de pipelines de subida: en un servicio de ingesta, clasificar el contenido real antes de enrutar el fichero al parser adecuado, evitando errores por extension incorrecta.
- Deteccion de ficheros mal etiquetados en repositorios: auditar directorios con miles de ficheros para identificar discrepancias entre extension y contenido real, util en tareas de limpieza y catalogacion.
- Filtro de seguridad en correo o mensajeria: inspeccionar adjuntos en el borde de la red para rechazar tipos de contenido no permitidos por politica, sin enviar el fichero a un servicio externo.
- Clasificacion previa en sistemas de gestion documental: etiquetar automaticamente documentos entrantes por tipo de contenido para indexacion y enrutado, con un coste computacional minimo (modelo de ~3 MB).
- Verificacion de integridad en distribucion de software: comprobar que los artefactos descargados coinciden con el tipo esperado y que sus hashes SHA256 son correctos antes de su procesamiento.
- Empaquetado en aplicaciones de escritorio offline: al ser un unico ONNX de ~3 MB y ejecutarse con runtime local, puede integrarse en clientes sin conectividad ni GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del artefacto (~3,16 MB en ONNX), la huella de memoria es del orden de decenas de MB incluyendo runtime y buffers, aunque no se aportan cifras oficiales.
- GPU recomendadas: no se especifican; el modelo puede ejecutarse en CPU mediante runtime ONNX.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: runtime ONNX (ONNX Runtime) en el cliente; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lujihong/magika (este repo) | Clasificador de tipo de archivo (ONNX) | no disponible (~3,16 MB de pesos) | no aplica | Apache-2.0 | HuggingFace (copia de Google Magika) |
| google/magika (upstream) | Clasificador de tipo de archivo | no disponible | no aplica | Apache-2.0 | GitHub / assets oficiales |
| Clasificacion por extension / MIME del sistema | Heuristica basada en nombre | no aplica | no aplica | segun sistema | Local |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Es una copia de distribucion, no un desarrollo propio: cualquier correccion o mejora debe provenir del upstream `google/magika`.
- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- La deteccion se basa en contenido; ficheros ofuscados, cifrados o truncados pueden clasificarse de forma incorrecta o como tipo generico.
- No se declaran idiomas soportados porque no procesa lenguaje natural; el campo de idiomas de la model card esta vacio.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de copyright y la atribucion al proyecto original de Google.
- El repositorio no incluye pipeline declarado ni documentacion sobre el preprocesado exacto requerido por el grafo ONNX; el integrador debe consultar el upstream para el contrato de entrada/salida.
- La fecha de creacion indicada (2026-11-06) y el contador de descargas (0) sugieren un repositorio reciente y con poca validacion externa; conviene verificar los SHA256 contra el upstream antes de confiar en el.
- No se aportan datos de sesgo ni de tasas de error por tipo de contenido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lujihong/magika
- Upstream en GitHub: https://github.com/google/magika
- Assets oficiales (raw): https://raw.githubusercontent.com/google/magika/main/assets/
- Espejo CDN jsDelivr: https://cdn.jsdelivr.net/gh/google/magika@main/assets/
- Documentacion de descarga con espejo HF: https://hf-mirror.com
