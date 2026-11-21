# QuixiAI/mixtral-1x22b-base

## Resumen

Mixtral-1x22b-base es un modelo de generacion de texto publicado por QuixiAI en abril de 2024 y actualizado por ultima vez en noviembre de 2026. A pesar del nombre, que evoca la familia Mixtral de Mistral AI, el recuento real de parametros en los ficheros safetensors es de 22.238.189.568 (aproximadamente 22,2 mil millones), lo que sugiere una unica torre densa de ese tamano en lugar de una arquitectura de mezcla de expertos con multiples expertos. El tag `mixtral` de Hugging Face apunta a la familia arquitectonica, pero no se dispone de confirmacion en la model card sobre el numero de expertos ni sobre parametros activos.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y esta etiquetado exclusivamente para el idioma ingles. El repositorio ocupa 44,5 GB, coherente con pesos en precision de 16 bits para 22,2 mil millones de parametros. La model card publicada por el autor es practicamente vacia: solo declara licencia y el idioma `en`, sin informacion sobre datos de entrenamiento, contexto, benchmarks ni instrucciones de uso.

Por tanto, esta ficha debe leerse con cautela: los datos disponibles son los metadatos del repositorio y el recuento de parametros, mientras que cualquier detalle arquitectonico o de rendimiento queda marcado como no disponible. Es relevante ahora como ejemplo de publicaciones de modelos con documentacion minima y nomenclatura potencialmente confusa, un caso frecuente en el ecosistema open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (tag `mixtral`; presumiblemente transformer, sin confirmacion de MoE) |
| Parametros totales | 22.238.189.568 (22,2 B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se listan ficheros GGUF ni AWQ en el repo) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna. El tag `mixtral` sugiere una implementacion compatible con la arquitectura Mixtral, que en la familia original de Mistral AI es un transformer con mezcla de expertos (8 expertos, 2 activos por token). Sin embargo, el nombre `1x22b` y el recuento de 22,2 B parametros apuntan a una sola torre de aproximadamente 22 B, lo que no encaja con la configuracion MoE estandar de Mixtral 8x7B (46,7 B totales) ni con Mixtral 8x22B (141 B totales). No se puede confirmar si se trata de un modelo denso, de un MoE con un unico experto o de una adaptacion de otra arquitectura.

Tampoco se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card no incluye ninguna seccion de entrenamiento ni de evaluacion. Cualquier afirmacion al respecto seria especulativa.

## Capacidades

- Generacion de texto en ingles: es la unica capacidad declarada explicitamente por el pipeline `text-generation`.
- Compatibilidad con transformers: el modelo se carga con la libreria transformers y esta etiquetado como compatible con Text Generation Inference (`text-generation-inference`) y `endpoints_compatible`, lo que facilita su despliegue en infraestructura de Hugging Face.
- Razonamiento, codigo, matematicas y vision: no disponibles; no hay evidencia en la informacion proporcionada de que el modelo soporte estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Generacion de texto en ingles para prototipos: el modelo puede emplearse como base para tareas de continuacion de texto y generacion libre en ingles, aprovechando su integracion nativa con transformers y TGI. Es adecuado para experimentacion temprana, no para produccion sin evaluacion previa.
- Fine-tuning supervisado sobre dominios especificos: al estar bajo Apache 2.0 y en formato safetensors, se puede ajustar con librerias como PEFT o TRL para tareas concretas (clasificacion, resumen, extraccion) en ingles, siempre que se valide el comportamiento base.
- Despliegue en endpoints compatibles con TGI: la etiqueta `endpoints_compatible` permite servirlo en infraestructura gestionada de Hugging Face o en un cluster propio con TGI, util para equipos que ya operan ese stack.
- Investigacion sobre arquitecturas etiquetadas como `mixtral`: sirve como caso de estudio para analizar como se comporta un checkpoint de 22 B etiquetado con esa familia y comparar su salida con modelos Mixtral canonicos.
- Base para evaluacion comparativa interna: equipos que necesiten un checkpoint de ~22 B con licencia permisiva pueden usarlo como linea base en pruebas de calidad, latencia y coste frente a alternativas documentadas.
- Generacion de datos sinteticos en ingles: con la debida supervision, puede emplearse para producir texto de entrenamiento o aumentacion de datasets en ingles, aunque la ausencia de benchmarks obliga a validar la calidad de salida antes de usarla a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 44,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se necesitan 48-80 GB por GPU o sharding en varias GPU.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 22-24 GB, viable en una RTX 4090 (24 GB) con margen ajustado.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 12-14 GB, viable en GPUs consumer de gama alta como RTX 4080/4090 o A6000.
- GPUs recomendadas: A100 80 GB, H100 80 GB o multiples RTX 4090/A6000 para FP16; una sola RTX 4090 para 8 bits.
- Despliegue: transformers, Text Generation Inference (TGI) y endpoints compatibles de Hugging Face estan soportados por las etiquetas del repo. No se confirma soporte de llama.cpp, Ollama ni vLLM en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| QuixiAI/mixtral-1x22b-base | 22,2 B | No disponible | Apache 2.0 | Hugging Face | Model card minima, sin benchmarks |
| Mistral AI Mixtral 8x7B | 46,7 B (12,9 B activos) | 32k tokens | Apache 2.0 | Hugging Face | MoE documentado, benchmarks publicos |
| Mistral AI Mixtral 8x22B | 141 B (39 B activos) | 64k tokens | Apache 2.0 | Hugging Face | MoE de mayor escala, benchmarks publicos |
| Meta Llama 3 8B | 8 B | 8k tokens | Llama 3 Community License | Hugging Face | Denso, ampliamente evaluado |

La comparacion con Mixtral 8x7B y 8x22B es la mas directa por la etiqueta de familia, pero las diferencias de parametros y la falta de datos del modelo de QuixiAI impiden una comparacion de rendimiento. Llama 3 8B se incluye como referencia de tamano menor con licencia mas restrictiva.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, sesgos, evaluaciones ni uso previsto, lo que impide auditar el modelo.
- Nomenclatura confusa: el nombre `1x22b` y el tag `mixtral` no permiten confirmar la arquitectura real; conviene inspeccionar `config.json` y los tensores antes de asumir un MoE.
- Riesgo de alucinacion: no evaluado; sin benchmarks ni evaluaciones de seguridad, no se puede estimar su tasa de alucinacion.
- Idioma: solo declarado para ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto: no disponible; planificar el despliegue sin asumir ventanas largas.
- Licencia Apache 2.0: permisiva para uso comercial, pero la ausencia de documentacion traslada al usuario la responsabilidad de validar el modelo en produccion.
- Popularidad muy baja (33 descargas, 0 likes): no hay evidencia de uso comunitario ni de reportes de calidad.
- Fecha de actualizacion (noviembre de 2026) posterior a la creacion (abril de 2024): posible re-subida o modificacion del repo sin changelog publico.

## Enlaces

- Hugging Face: https://huggingface.co/QuixiAI/mixtral-1x22b-base
