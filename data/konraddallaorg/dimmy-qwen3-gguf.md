# KonradDallaOrg/dimmy-qwen3-gguf

## Resumen

`KonradDallaOrg/dimmy-qwen3-gguf` es un repositorio espejo que agrupa tres cuantizaciones GGUF Q4_K_M de modelos Qwen, publicadas para que la aplicación Dimmy no dependa de la disponibilidad de los repositorios originales. No se trata de un modelo entrenado por el autor del repositorio: los ficheros son copias byte a byte de las cuantizaciones de Unsloth de Qwen3-4B-Instruct-2507, Qwen3.5-2B y Qwen3.5-4B, con los hashes SHA-256 documentados en la model card.

El proposito declarado es servir como LLM local para tareas de recap (resumen) y rewrite (reescritura) dentro de la aplicacion Dimmy. Los tres modelos base son transformers densos de la familia Qwen, con 2B y 4B parametros, orientados a instrucciones y conversacion. El repositorio en si no aporta pesos nuevos, configuraciones modificadas ni ajustes propios.

Su relevancia es practica mas que tecnica: ofrece un punto de descarga estable y verificable para desarrolladores que quieran reproducir el stack de Dimmy o usar estas cuantizaciones concretas en entornos locales con recursos limitados. La licencia Apache 2.0 del modelo base facilita el uso comercial, aunque conviene revisar las condiciones de cada modelo upstream por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelos base Qwen3-4B-Instruct-2507, Qwen3.5-2B y Qwen3.5-4B); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 4.022.468.096 (dato del repositorio, correspondiente al modelo de 4B) |
| Parametros activos | no aplica (modelos densos, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el repositorio); tag `imatrix` sugiere uso de matriz de importancia en la cuantizacion |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

Ficheros incluidos:

| Fichero | Tamano | SHA-256 |
|---|---|---|
| `Qwen3-4B-Instruct-2507-Q4_K_M.gguf` | 2.497.281.120 B | `3605803b982cb64aead44f6c1b2ae36e3acdb41d8e46c8a94c6533bc4c67e597` |
| `Qwen3.5-2B-Q4_K_M.gguf` | 1.280.835.840 B | `aaf42c8b7c3cab2bf3d69c355048d4a0ee9973d48f16c731c0520ee914699223` |
| `Qwen3.5-4B-Q4_K_M.gguf` | 2.740.937.888 B | `00fe7986ff5f6b463e62455821146049db6f9313603938a70800d1fb69ef11a4` |

## Arquitectura y entrenamiento

No hay informacion en el repositorio sobre la arquitectura interna, los datos de entrenamiento, el numero de tokens, la composicion del dataset ni las fases de alineamiento (RLHF, DPO u otras) de los modelos base. El autor declara explicitamente que no ha modificado los ficheros: las cuantizaciones son identicas a las publicadas por Unsloth en las revisiones indicadas. Cualquier detalle arquitectonico debe consultarse en las model cards de Qwen3-4B-Instruct-2507, Qwen3.5-2B y Qwen3.5-4B.

La unica innovacion tecnica atribuible al repositorio es la trazabilidad: se documentan los hashes LFS del Hub y las URLs de origen con revision fija, lo que permite verificar la integridad de los pesos y reproducir exactamente el mismo binario. El tag `imatrix` indica que las cuantizaciones se generaron con calibracion basada en matriz de importancia, un metodo habitual para preservar calidad en cuantizaciones de 4 bits.

## Capacidades

- Generacion de texto conversacional e instrucciones, segun los modelos base Qwen.
- Resumen (recap) y reescritura (rewrite) de texto, que es el uso declarado en la model card.
- Razonamiento y generacion de codigo: capacidades propias de la familia Qwen3 y Qwen3.5, aunque no se detallan en este repositorio.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Resumen de documentos y notas: el modelo de 4B puede procesar textos de entrada y producir resumenes concisos; es el uso para el que Dimmy publica estos ficheros.
- Reescritura y correccion de estilo: adecuado para reformular parrafos manteniendo el significado, con latencia baja en hardware de consumo gracias a la cuantizacion Q4_K_M.
- Asistente local en aplicaciones de escritorio: los GGUF se integran con llama.cpp y Ollama, lo que permite empaquetar un asistente sin conexion.
- Prototipado rapido de pipelines de NLP: el modelo de 2B sirve para iterar en pruebas con muy poca VRAM antes de escalar al de 4B.
- Generacion de codigo en entornos con recursos limitados: el modelo de 4B puede usarse para autocompletado o explicacion de fragmentos en editores locales.
- Clasificacion y extraccion de informacion: tareas de etiquetado, extraccion de entidades o normalizacion de textos en lotes pequenos.
- Reproducibilidad de entornos: util para equipos que necesiten fijar una version concreta de los pesos con hash verificado en sus pipelines de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5-2 GB para el modelo de 2B en Q4_K_M y 2,5-3,5 GB para los de 4B, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son validas, aunque las dos ultimas estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; vLLM y TGI no son la via natural para GGUF aunque existen soportes parciales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dimmy-qwen3-gguf (Qwen3-4B-Instruct-2507 Q4_K_M) | 4,0 B | no disponible | Apache 2.0 | GGUF | Espejo verificado de Unsloth |
| Qwen3-4B-Instruct-2507 (original) | 4,0 B | no disponible | Apache 2.0 | safetensors, GGUF | Fuente upstream, con model card completa |
| Qwen3.5-4B (original) | 4,0 B | no disponible | no disponible | safetensors, GGUF | Version mas reciente de la familia |
| Qwen3.5-2B (original) | 2,0 B | no disponible | no disponible | safetensors, GGUF | Variante ligera para equipos modestos |

## Limitaciones y advertencias

- El repositorio no aporta model card tecnica propia: no hay informacion sobre sesgos, alucinacion, idiomas ni evaluaciones.
- Al ser un espejo, la calidad y el comportamiento dependen exclusivamente de los modelos upstream; cualquier problema debe reportarse alli.
- Solo se ofrece cuantizacion Q4_K_M; no hay variantes de mayor o menor precision en este repositorio.
- La licencia Apache 2.0 figura en el repositorio, pero conviene verificar la licencia de cada modelo base por separado, especialmente Qwen3.5-2B y Qwen3.5-4B, cuya licencia no se detalla en la informacion proporcionada.
- El uso comercial es posible bajo Apache 2.0, pero el autor no ofrece garantias ni soporte.
- Riesgo de alucinacion inherente a modelos de 2B y 4B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- El repositorio tiene un numero muy bajo de descargas (51) y ningun like, lo que reduce la validacion comunitaria.
- No se especifican longitudes de contexto soportadas, un dato critico para planificar el despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KonradDallaOrg/dimmy-qwen3-gguf
- Upstream Qwen3-4B-Instruct-2507 GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF
- Upstream Qwen3.5-2B GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Upstream Qwen3.5-4B GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
