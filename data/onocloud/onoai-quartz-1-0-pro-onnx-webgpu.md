# onocloud/onoai-quartz-1.0-pro-ONNX-WebGPU

## Resumen

OnoAI Quartz 1.0 Pro (ONNX/WebGPU) es la variante compilada para navegador de un modelo de embeddings de la familia OnoAI Quartz, publicada por la organizacion onocloud en Hugging Face. El modelo se presenta como un encoder basado en la arquitectura XLM-RoBERTa, reetiquetado internamente como "quartz", y orientado a tareas de extraccion de caracteristicas, busqueda semantica y vector search. Su peculiaridad principal es que se distribuye en formato ONNX preparado para ejecutarse con WebGPU a traves de transformers.js, lo que permite realizar inferencia de embeddings directamente en el navegador del cliente sin depender de un servidor.

El modelo declara compatibilidad con los idiomas ingles y arabe, y los tags de Hugging Face lo relacionan con BGE-M3, un conocido modelo de embeddings multilingue de BAAI, lo que sugiere que Quartz 1.0 Pro se inspira o deriva de esa linea de trabajo, aunque la informacion publica no confirma la relacion exacta. El repositorio ocupa 1.2 GB y esta sujeto a acceso restringido (gated), por lo que es necesario aceptar condiciones adicionales en Hugging Face antes de descargarlo.

Su relevancia actual radica en la combinacion de tres factores: embeddings de calidad en un formato portable (ONNX), ejecucion acelerada por GPU en el navegador (WebGPU) y una licencia propietaria ("onocloud-sovereign-license") que sugiere un enfoque de soberania de datos. No obstante, la ausencia de descargas, likes y documentacion tecnica detallada obliga a tratar cualquier dato de rendimiento con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer, tag `xlm-roberta`); denominacion interna "quartz" |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo se distribuye en ONNX; se desconoce si incluye variantes cuantizadas) |
| Idiomas soportados | ingles (en), arabe (ar) |
| Licencia | onocloud-sovereign-license (licencia propietaria, tag `license:other`) |
| Formato de pesos | ONNX (compilado para WebGPU); repo de 1.2 GB |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo se basa en XLM-RoBERTa, un encoder transformer multilingue con atencion bidireccional, disenado originalmente para tareas de comprension del lenguaje. Al tratarse de un modelo de embeddings (`feature-extraction`), su salida son representaciones vectoriales densas utilizables en recuperacion semantica, clustering y clasificacion. Los tags lo asocian con BGE-M3, lo que apunta a una posible destilacion, fine-tuning o adaptacion sobre esa familia de embeddings multilingues, pero no se confirma en la ficha publica.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de RLHF/DPO (poco habituales en modelos de embeddings) ni sobre innovaciones tecnicas especificas mas alla del empaquetado ONNX con soporte WebGPU. La publicacion se limita a la conversion del modelo a ONNX para su uso con transformers.js en el navegador, sin detallar el proceso de entrenamiento original.

## Capacidades

- Generacion de embeddings de frases y documentos para busqueda semantica y recuperacion de informacion.
- Extraccion de caracteristicas (`feature-extraction`) utilizable como base para clasificacion, clustering y similitud coseno.
- Soporte de vector search en aplicaciones cliente (navegador) gracias al formato ONNX + WebGPU.
- Inferencia en el navegador mediante transformers.js, sin necesidad de backend.
- Capacidades multilingues limitadas a ingles y arabe segun los metadatos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo generativo conversacional).
- No se documentan capacidades de vision, audio ni thinking mode.

## Casos de uso

- Busqueda semantica en el navegador: integrar el modelo con transformers.js y WebGPU para indexar y consultar documentos localmente, evitando enviar datos a un servidor y aprovechando la aceleracion por GPU del cliente.
- Asistentes de documentacion offline: desplegar un motor de recuperacion semantica en aplicaciones web progresivas (PWA) que funcione sin conexion, adecuado para entornos con requisitos de privacidad o redes restringidas.
- Sistemas de atencion al cliente con RAG en cliente: usar los embeddings para seleccionar fragmentos relevantes de una base de conocimiento antes de enviar el contexto a un LLM, reduciendo costes de inferencia en servidor.
- Clasificacion y deduplicacion de contenidos en arabe e ingles: calcular similitudes entre textos para detectar duplicados o agrupar tickets de soporte, aprovechando el soporte bilingue declarado.
- Busqueda en bases de datos vectoriales ligeras: generar embeddings en el navegador y almacenarlos en IndexedDB o en soluciones como sqlite-wasm para busquedas posteriores sin backend.
- Prototipado rapido de aplicaciones de IA en frontend: validar hipotesis de producto con embeddings reales sin montar infraestructura de inferencia, gracias al formato ONNX y a la integracion con transformers.js.
- Filtrado previo en pipelines de moderacion: comparar mensajes de usuario contra una lista de patrones conocidos mediante similitud semantica antes de un analisis mas costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repo pesa 1.2 GB, lo que sugiere pesos en precision completa o mixta; una cuantizacion a int8 reduciria el tamano de forma significativa, pero no se confirma su existencia.
- GPU recomendadas: no disponibles. Al ejecutarse en navegador, depende de la GPU del cliente y del soporte de WebGPU (Chrome/Edge en Windows y macOS, con soporte variable en Linux y movil).
- Compatibilidad con GPU de consumo: probable en equipos con WebGPU habilitado, pero sin datos de latencia ni throughput no puede confirmarse el rendimiento real.
- Opciones de despliegue: transformers.js con backend WebGPU; tambien podria ejecutarse con ONNX Runtime en servidor, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OnoAI Quartz 1.0 Pro (ONNX/WebGPU) | no disponible | no disponible | en, ar | onocloud-sovereign-license (propietaria) | ONNX |
| BGE-M3 (BAAI) | ~568 M | 8192 tokens | multilingue (100+ idiomas) | MIT | safetensors, ONNX |
| multilingual-e5-large (Microsoft) | ~560 M | 512 tokens | multilingue | MIT | safetensors, ONNX |
| XLM-RoBERTa base (Meta) | ~278 M | 512 tokens | multilingue (100 idiomas) | MIT | safetensors, ONNX |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no se dispone de datos de rendimiento de Quartz 1.0 Pro para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados.
- Licencia propietaria: la "onocloud-sovereign-license" no es una licencia open source reconocida; es imprescindible revisar sus terminos antes de cualquier uso comercial o redistribucion.
- Idiomas limitados: solo se declaran ingles y arabe, lo que excluye el castellano y la mayoria de lenguas europeas.
- Sin datos de rendimiento: no hay benchmarks publicados, por lo que no puede evaluarse su calidad frente a alternativas consolidadas como BGE-M3 o multilingual-e5.
- Sin documentacion tecnica: se desconoce el numero de parametros, la longitud de contexto, el proceso de entrenamiento y las variantes de cuantizacion.
- Madurez baja: cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Riesgo de alucinacion: al ser un modelo de embeddings, no genera texto, pero los vectores pueden producir recuperaciones irrelevantes si el dominio de uso difiere del de entrenamiento.
- Dependencia de WebGPU: el rendimiento en navegador depende del soporte del cliente; navegadores sin WebGPU pueden degradar a WASM con latencias mucho mayores.
- Sesgos: no se documenta ninguna evaluacion de sesgos; los modelos XLM-RoBERTa heredan sesgos de los corpus web utilizados en su entrenamiento original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onocloud/onoai-quartz-1.0-pro-ONNX-WebGPU
- Perfil de la organizacion: https://huggingface.co/onocloud
- BGE-M3 (referencia asociada por tags): https://huggingface.co/BAAI/bge-m3
- XLM-RoBERTa (arquitectura base): https://huggingface.co/FacebookAI/xlm-roberta-base
- transformers.js: https://github.com/huggingface/transformers.js
- WebGPU: https://developer.mozilla.org/es/docs/Web/API/WebGPU_API
