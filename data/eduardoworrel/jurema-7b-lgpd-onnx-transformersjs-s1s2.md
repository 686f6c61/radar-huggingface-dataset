# eduardoworrel/Jurema-7B-LGPD-ONNX-transformersjs-S1S2

## Resumen

Jurema-7B-LGPD-ONNX-transformersjs-S1S2 es una distribucion derivada del modelo Jurema-7B (Jurema-br/Jurema-7B), un transformer de 7.000 millones de parametros basado en la arquitectura Qwen2. El autor de esta version, eduardoworrel, la publica en formato ONNX con cuantizacion int4 y la empaqueta para su uso con transformers.js, lo que permite ejecutar inferencia en navegador o en entornos JavaScript/Node sin backend Python. El modelo esta orientado a tareas relacionadas con la Ley General de Proteccion de Datos brasilena (LGPD), incluyendo clasificacion de texto y generacion conversacional en portugues e ingles.

La relevancia de esta ficha es doble. Por un lado, demuestra un patron de despliegue edge-friendly (ONNX + int4 + transformers.js) para un modelo de 7B, algo poco habitual en ese tamano. Por otro lado, el repositorio esta marcado como gated (acceso restringido), lo que condiciona su uso en produccion. El nombre incluye el sufijo S1S2 y la libreria declarada es s1s2, un detalle que sugiere una etapa de entrenamiento o adaptacion especifica no documentada en la informacion disponible.

No se dispone de datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset ni los resultados de benchmarks de esta version. La informacion se limita a metadatos de Hugging Face y a los tags del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, segun tag `qwen2`) |
| Parametros totales | 7B (heredado del nombre y del modelo base Jurema-7B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (ONNX) |
| Idiomas soportados | portugues (pt), ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (cuantizado int4), compatible con transformers.js |

## Arquitectura y entrenamiento

El modelo base Jurema-7B emplea una arquitectura transformer decoder-only de la familia Qwen2, con 7.000 millones de parametros. Esta distribucion concreta no modifica la arquitectura: aplica cuantizacion int4 y exporta los pesos a ONNX para su ejecucion con transformers.js. El tag `s1s2` y la libreria declarada `s1s2` apuntan a una fase de adaptacion o pipeline especifico, pero no se detalla en la informacion disponible en que consiste ni que datos se usaron.

No se han publicado en la informacion proporcionada datos sobre volumen de tokens de entrenamiento, composicion del corpus, uso de RLHF/DPO ni innovaciones tecnicas del modelo base. El sufijo LGPD del nombre sugiere un ajuste orientado a clasificacion y conversacion sobre proteccion de datos, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto conversacional en portugues e ingles.
- Clasificacion de texto (tag `text-classification`), presumiblemente orientada a categorias relacionadas con LGPD.
- Razonamiento multi-turno en formato chat (tag `conversational`).
- Ejecucion en navegador y entornos JavaScript mediante transformers.js y ONNX.
- Inferencia con cuantizacion int4 para reducir huella de memoria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Clasificacion de textos legales y politicas de privacidad: el tag `text-classification` y el enfoque LGPD permiten usar el modelo para etiquetar fragmentos de documentos en portugues segun categorias de cumplimiento, ejecutandolo en el navegador con transformers.js.
- Asistente conversacional sobre proteccion de datos: el modelo puede mantener dialogos multi-turno en portugues para resolver dudas sobre la LGPD, con la ventaja de que la inferencia int4 en ONNX reduce los requisitos de infraestructura.
- Despliegue edge en aplicaciones web: al estar exportado a ONNX e integrado con transformers.js, puede ejecutarse del lado del cliente sin enviar datos a un servidor, lo que encaja con requisitos de privacidad.
- Prototipado rapido en JavaScript/Node: equipos que no trabajan en Python pueden integrar el modelo en pipelines JS para generacion de texto y clasificacion sin montar un stack de inferencia Python.
- Filtrado y triaje de solicitudes de datos personales: clasificacion de tickets o correos entrantes en portugues para detectar peticiones sujetas a LGPD antes de derivarlas a un flujo humano.
- Generacion de resumenes de documentos de privacidad: el modelo puede condensar avisos de privacidad y politicas en portugues, aunque la calidad depende de la cuantizacion int4 y del contexto real soportado (no documentado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4,8 GB, coherente con pesos int4 de un modelo de 7B; se estima un consumo en torno a 4-6 GB de memoria al cargar los pesos, sin contar overhead del runtime.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, una GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) seria el minimo razonable para int4.
- Cabe en GPU consumer: probablemente si, en modelos con 8 GB o mas de VRAM, dado el tamano del repo (4,8 GB).
- Opciones de despliegue: transformers.js (objetivo declarado), ONNX Runtime; vLLM, llama.cpp, Ollama y TGI no estan confirmados para este formato ONNX int4.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jurema-7B-LGPD-ONNX-transformersjs-S1S2 | 7B | no disponible | ONNX int4 | CC-BY-4.0 | Gated, orientado a LGPD, ejecutable en JS |
| Jurema-br/Jurema-7B (base) | 7B | no disponible | safetensors (presumible) | no disponible | Modelo original sin cuantizar |
| Qwen2-7B (familia base) | 7B | no disponible | safetensors, GGUF | no disponible | Arquitectura de referencia |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo, lo que puede bloquear automatizaciones y despliegues en CI.
- La cuantizacion int4 puede degradar la calidad de generacion y clasificacion respecto al modelo base en safetensors.
- No hay documentacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad del modelo base ni de esta adaptacion.
- Riesgo de alucinacion inherente a los modelos generativos de 7B, especialmente en dominio legal, donde los errores tienen consecuencias.
- Idiomas limitados a portugues e ingles; no se garantiza un rendimiento adecuado en castellano.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero conviene verificar las condiciones adicionales del acceso gated y del modelo base.
- El tag `arxiv:2611.15302` no se ha podido verificar en la informacion disponible; no se debe citar como referencia sin comprobacion.
- Despliegue en transformers.js limitado por el contexto real soportado, que no esta documentado.

## Enlaces

- Hugging Face: https://huggingface.co/eduardoworrel/Jurema-7B-LGPD-ONNX-transformersjs-S1S2
- Modelo base: https://huggingface.co/Jurema-br/Jurema-7B
- Referencia arXiv citada en tags: arxiv:2611.15302 (no verificada)
