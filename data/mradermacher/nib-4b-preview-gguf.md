# mradermacher/nib-4b-preview-GGUF

## Resumen

nib-4b-preview es un modelo de lenguaje de 4.326 millones de parametros (aproximadamente 4,3 mil millones) desarrollado por ProCreations, especializado en tareas de agente: uso de navegador (browser-use), control de ordenador (computer-use) y llamada a herramientas (tool-use). La ficha que nos ocupa es la cuantizacion GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y entornos compatibles con GGUF.

El modelo se construye sobre la arquitectura Qwen3.5-4B, segun se desprende del enlace de licencia incluido en la model card (Qwen/Qwen3.5-4B). Su proposito es servir como motor de decision para agentes que necesitan interpretar interfaces, ejecutar acciones sobre un navegador o un escritorio y encadenar pasos de razonamiento con llamadas a herramientas. La licencia Apache 2.0 facilita su integracion en productos comerciales.

La relevancia actual reside en la combinacion de un tamano reducido (4,3B) con capacidades de agente y soporte multimodal (el repositorio incluye proyectores mmproj), lo que permite desplegar agentes de navegacion en GPUs de consumo o incluso en CPU con cuantizaciones Q4. El modelo es solo en ingles y su version es "preview", por lo que debe considerarse experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, segun license_link) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la referencia a Qwen3.5-4B como base y al tag qwen3.5. Se trata, por tanto, de un transformer de 4,3 mil millones de parametros afinado por ProCreations para tareas de agente. El repositorio incluye proyectores multimodales (mmproj), lo que indica que el modelo base o el afinado incorpora capacidad de vision, necesaria para interpretar capturas de pantalla en escenarios de computer-use y browser-use.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o aprendizaje por refuerzo con entornos de navegacion. La model card del cuantizador es puramente tecnica (generacion de cuantizaciones estaticas) y remite al repositorio original para detalles. Tampoco se indica si las cuantizaciones con imatrix estan disponibles: el autor senala que "weighted/imatrix quants seem not to be available (by me) at this time".

## Capacidades

- Generacion de texto conversacional en ingles.
- Uso de herramientas (tool calling / function calling), segun los tags tool-use y agent.
- Agentes de navegador (browser-agent, browser-use): interpretacion de paginas y ejecucion de acciones web.
- Control de ordenador (computer-use): interaccion con interfaces graficas a partir de capturas de pantalla, gracias al proyector multimodal incluido.
- Razonamiento multi-paso orientado a agentes.
- Capacidad multimodal (vision) mediante los ficheros mmproj-Q8_0 y mmproj-f16.
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documentan capacidades de audio ni modo "thinking" explicito.

## Casos de uso

- Automatizacion de tareas web repetitivas: el modelo puede rellenar formularios, navegar entre paginas y extraer datos actuando como agente de navegador; su tamano de 4,3B permite ejecutarlo en local con cuantizacion Q4_K_M (2,9 GB).
- Testing de interfaces de usuario: un agente computer-use puede recorrer una aplicacion, capturar pantallas e identificar regresiones visuales o flujos rotos, usando el proyector mmproj para interpretar las imagenes.
- Asistente de escritorio integrado: con Q4_K_S (2,7 GB) puede desplegarse en un portatil con GPU de 8 GB y ofrecer control de aplicaciones mediante tool calling.
- Extraccion de informacion estructurada de la web: combinando navegacion y llamadas a funciones, el modelo puede convertir paginas en registros JSON para pipelines de datos.
- Agente de soporte interno: integrado en un orquestador, puede consultar sistemas corporativos mediante herramientas y responder en ingles con contexto de conversacion.
- Prototipado rapido de agentes en investigacion: al ser Apache 2.0 y estar disponible en GGUF, permite experimentar con llama.cpp u Ollama sin coste de licencia y con requisitos de hardware modestos.
- Despliegue en el borde (edge): la version Q2_K (2,1 GB) posibilita ejecucion en dispositivos con poca memoria para tareas de agente simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): Q2_K ~2,1 GB; Q3_K_M ~2,4 GB; IQ4_XS ~2,7 GB; Q4_K_M ~2,9 GB; Q5_K_M ~3,3 GB; Q6_K ~3,7 GB; Q8_0 ~4,7 GB; f16 ~8,8 GB.
- Proyector multimodal adicional: mmproj-Q8_0 0,5 GB o mmproj-f16 0,8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100/H100 no son necesarias dado el tamano.
- Cabe en GPUs de consumo desde 4 GB (Q2_K) y con holgura en 8 GB (Q4_K_M + mmproj + contexto).
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| nib-4b-preview (este) | 4,3B | no disponible | Apache 2.0 | GGUF, safetensors | Agente browser/computer-use |
| Qwen3.5-4B (base) | ~4B | no disponible | Apache 2.0 | safetensors | Proposito general |
| Alternativas de agente de 3-7B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Version "preview": el autor la etiqueta como preliminar; no debe asumirse estabilidad en produccion.
- Solo ingles: no hay soporte documentado de otros idiomas, lo que limita su uso en entornos hispanohablantes sin traduccion previa.
- Riesgo de alucinacion inherente a modelos de 4,3B, especialmente en razonamiento multi-paso y en la seleccion de acciones de agente.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M.
- No hay cuantizaciones imatrix/weighted disponibles en el momento de la publicacion.
- Sin datos publicados de contexto maximo, composicion del entrenamiento ni evaluaciones de seguridad; el comportamiento en tareas de agente reales no esta verificado de forma independiente.
- Aunque la licencia es Apache 2.0, el enlace de licencia apunta a Qwen3.5-4B; conviene revisar los terminos del modelo base antes de un uso comercial a gran escala.
- El repo ocupa 41 GB por incluir todas las cuantizaciones; descargar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/nib-4b-preview-GGUF
- Modelo base: https://huggingface.co/ProCreations/nib-4b-preview
- Licencia referenciada (Qwen3.5-4B): https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#nib-4b-preview-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
