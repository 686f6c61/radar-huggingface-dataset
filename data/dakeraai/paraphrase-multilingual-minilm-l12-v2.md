# DakeraAI/paraphrase-multilingual-MiniLM-L12-v2

## Resumen

`DakeraAI/paraphrase-multilingual-MiniLM-L12-v2` no es un modelo nuevo, sino un espejo verificado (mirror) del modelo original `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`. Lo publica Dakera, una empresa que desarrolla un motor de memoria autoalojado para agentes de IA, con el objetivo de garantizar la disponibilidad de los ficheros que su producto consume en tiempo de instalación. El repositorio contiene únicamente dos artefactos copiados byte a byte: el modelo ONNX cuantizado a int8 (`onnx/model_int8.onnx`, 118,1 MB) y el `tokenizer.json` (9,1 MB), ambos con checksums SHA-256 publicados.

El modelo subyacente es un encoder de frases basado en una arquitectura transformer MiniLM de 12 capas, diseñado para generar embeddings de oraciones y párrafos en múltiples idiomas. Su función es la extracción de características (`feature-extraction`): convierte texto en vectores densos que permiten calcular similitud semántica. Es un modelo compacto y ligero, pensado para ejecutarse en CPU y para tareas de recuperación semántica, búsqueda por similitud y clasificación de intenciones.

La relevancia de esta ficha radica en su contexto de uso: Dakera lo emplea para detectar peticiones de olvido y instrucciones permanentes en mensajes almacenados, en cualquier idioma, y lo ejecuta por defecto en CPU. El repositorio es, por tanto, un componente de infraestructura de un producto de memoria para agentes, con licencia Apache-2.0 y un tamaño total de repositorio de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MiniLM de 12 capas (encoder de frases, modelo base `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero `onnx/model_int8.onnx`) |
| Idiomas soportados | multilingue (el nombre del modelo base indica soporte multilingue; la lista concreta de idiomas no esta disponible en la informacion proporcionada) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_int8.onnx`); tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un encoder de frases derivado de la familia MiniLM, con 12 capas y orientado a la generacion de embeddings de oraciones y parrafos. La arquitectura concreta se corresponde con la del modelo original de sentence-transformers, que emplea un transformer encoder y produce representaciones vectoriales normalizadas para calcular similitud coseno. El repositorio de Dakera no incluye pesos en formato PyTorch ni safetensors: solo distribuye la version ONNX cuantizada a int8, lo que reduce el tamano del artefacto a 118,1 MB y facilita la inferencia en CPU.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del modelo original. La model card de Dakera remite explicitamente a la model card original para conocer como fue entrenado el modelo y como citarlo. La unica innovacion atribuible a este repositorio es de empaquetado y distribucion: copia byte a byte de los ficheros desde `Xenova/paraphrase-multilingual-MiniLM-L12-v2` y `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, con verificacion de checksums SHA-256 para garantizar integridad y permitir un fallback entre fuentes.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica y recuperacion de informacion.
- Extraccion de caracteristicas (`feature-extraction`), pipeline declarado en HuggingFace.
- Soporte multilingue heredado del modelo base, orientado a comparar textos en distintos idiomas en un mismo espacio vectorial.
- Deteccion de intenciones: en Dakera se usa para identificar peticiones de olvido y instrucciones permanentes en mensajes almacenados.
- Ejecucion en CPU: el modelo cuantizado a int8 esta pensado para inferencia ligera sin GPU.
- No soporta tool calling ni function calling: es un encoder, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso por si mismo; se usa como componente dentro de pipelines de agentes.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Memoria a largo plazo para agentes: el modelo genera embeddings de los mensajes almacenados para que el motor de memoria de Dakera recupere recuerdos relevantes por similitud semantica; su tamano reducido permite ejecutarlo en CPU junto al resto del sistema.
- Deteccion de peticiones de olvido: Dakera lo usa para clasificar si un mensaje contiene una solicitud de borrado de memoria, en cualquier idioma, comparando el embedding del mensaje con patrones de intencion predefinidos.
- Deteccion de instrucciones permanentes: identifica mensajes que establecen reglas persistentes para el agente (por ejemplo, preferencias del usuario) y los separa del contenido conversacional ordinario.
- Busqueda semantica en bases documentales: indexar fragmentos de documentacion y recuperar los mas similares a una consulta en entornos multilingues, con un coste de infraestructura minimo al correr en CPU.
- Deduplicacion y agrupamiento de textos: calcular similitud entre mensajes o documentos para eliminar duplicados o agrupar contenido equivalente en distintos idiomas.
- Clasificacion de tickets o correos: usar los embeddings como entrada de un clasificador ligero para enrutar solicitudes de soporte por tematica o idioma.
- Componente de un pipeline RAG autoalojado: servir como encoder de consultas o de documentos en un sistema RAG que se despliega con Docker y no depende de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la practica; el artefacto distribuido es ONNX int8 de 118,1 MB y esta pensado para ejecucion en CPU.
- GPU recomendadas: no se especifican; el modelo es lo bastante pequeno para ejecutarse en CPU. Cualquier GPU consumer con soporte ONNX Runtime podria ejecutarlo, pero no es el escenario previsto por el autor.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna, aunque el caso de uso declarado es CPU.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); el ecosistema original de sentence-transformers permite otros runners, pero este repositorio solo incluye el artefacto ONNX int8 y el tokenizer.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `DakeraAI/paraphrase-multilingual-MiniLM-L12-v2` (este) | no disponible | no disponible | ONNX int8 | Apache-2.0 | Mirror verificado de dos ficheros, orientado a CPU y a memoria de agentes |
| `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | no disponible | no disponible | safetensors/PyTorch (formato original) | Apache-2.0 | Modelo original; incluye la model card completa y los pesos sin cuantizar |
| `Xenova/paraphrase-multilingual-MiniLM-L12-v2` | no disponible | no disponible | ONNX | Apache-2.0 | Conversion ONNX de referencia de la que procede el fichero int8 de este repositorio |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas; solo embeddings. No debe evaluarse con benchmarks de generacion como MMLU o HumanEval.
- El repositorio no incluye pesos en formato PyTorch ni safetensors, solo el ONNX int8; quien necesite el modelo sin cuantizar debe acudir al repositorio original.
- La cuantizacion int8 puede introducir una perdida de calidad en los embeddings respecto al modelo original; no se han publicado metricas de esa perdida en la informacion disponible.
- La lista concreta de idiomas soportados no esta disponible en la informacion proporcionada; el soporte multilingue se infiere del nombre del modelo base.
- Riesgo de sesgos y de alucinacion: al ser un encoder, no alucina texto, pero puede heredar sesgos del corpus de entrenamiento del modelo original; no se detallan en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero el credito y las condiciones del modelo original siguen aplicando; la model card de Dakera remite a la licencia original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-04; es un artefacto de infraestructura, no un modelo con comunidad propia.
- Para produccion, conviene verificar los checksums SHA-256 publicados antes de desplegar los ficheros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DakeraAI/paraphrase-multilingual-MiniLM-L12-v2
- Modelo original: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Conversion ONNX de origen: https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2
- Licencia en el repositorio: https://huggingface.co/DakeraAI/paraphrase-multilingual-MiniLM-L12-v2/blob/main/LICENSE
- Web de Dakera: https://dakera.ai
- Documentacion de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue autoalojado (Docker, Kubernetes, Helm): https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn de Dakera AI: https://www.linkedin.com/company/dakera-ai
- Contacto: amine@dakera.ai
