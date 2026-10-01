# mdagosta/waldito-python-basics-v1-r0012-u1-mdagosta

## Resumen

El modelo `mdagosta/waldito-python-basics-v1-r0012-u1-mdagosta` es una exportacion de la linea OpenWALDO publicada por el usuario mdagosta en HuggingFace. Se trata de un modelo de lenguaje causal de tipo solo decodificador que sigue la arquitectura estandar `LlamaForCausalLM` de la libreria Transformers, con un total de 9.541.632 parametros reales (segun los pesos en safetensors), lo que lo situa en la categoria de modelo ultra-pequeno.

El modelo emplea un tokenizador de bytes propietario de OpenWALDO (denominado "schema-1" en la model card) que requiere cargarse con `trust_remote_code=True`. El sufijo del nombre ("python-basics", "r0012", "u1") sugiere un ajuste orientado a conceptos basicos de Python, aunque no se aporta informacion que lo confirme. El repositorio incluye un fichero `BOM.json` con el inventario de archivos de la release y un `EU-BOM.json` con el mapeo de divulgacion de contenido de entrenamiento conforme al reglamento europeo de GPAI.

La relevancia actual de esta ficha es limitada pero instructiva: se trata de un ejemplo de exportacion con trazabilidad documental (BOM) y cumplimiento normativo europeo, con un modelo minimo que puede ejecutarse en CPU. No se dispone de datos de rendimiento, licencia declarada ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal solo decodificador (Llama, `LlamaForCausalLM`) |
| Parametros totales | 9.541.632 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con pesos safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que el paquete usa la arquitectura causal estandar de Transformers para Llama, es decir, un transformer solo decodificador con atencion causal, normalizacion previa y capas FFN. El detalle de numero de capas, dimensiones de embedding, numero de cabezas de atencion, tamano de vocabulario, funcion de activacion y tipo de positional encoding no se especifica en la informacion disponible. Con 9,54 millones de parametros, se infiere un modelo muy pequeno en numero de capas y/o dimensiones, pero no se aportan las cifras exactas.

El tokenizador es un componente diferencial: OpenWALDO "schema-1" es un tokenizador de bytes que exige `trust_remote_code=True` para cargarse, lo que implica la ejecucion de codigo remoto del repositorio. No se detalla el proceso de entrenamiento: no hay informacion sobre numero de tokens, composicion del dataset, uso de RLHF/DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Se declara la existencia de `EU-BOM.json`, que documenta el mapeo de divulgacion de contenido de entrenamiento exigido por la normativa europea de modelos de IA de proposito general.

## Capacidades

- Generacion de texto autorregresiva (tarea declarada: `text-generation`).
- Modalidad conversacional (etiqueta `conversational`).
- Compatible con `text-generation-inference` y con `endpoints_compatible`, segun las etiquetas del repositorio.
- El nombre del modelo apunta a una posible especializacion en conceptos basicos de Python, sin confirmacion en la documentacion.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision, audio ni modos de "thinking".

## Casos de uso

- Prototipado rapido en local: al tratarse de un modelo de 9,5 millones de parametros, permite iterar en un portatil o incluso en CPU para pruebas de integracion de pipelines de generacion de texto con Transformers sin necesidad de GPU.
- Validacion de infraestructura de despliegue: sirve como modelo de prueba ligero para verificar el correcto funcionamiento de un endpoint compatible con TGI o de un servidor de inferencia antes de desplegar modelos mayores.
- Experimentacion con tokenizadores de bytes: util para investigar el comportamiento de un tokenizador "schema-1" de OpenWALDO y comparar tasas de compresion y robustez frente a tokenizadores BPE convencionales.
- Auditoria de trazabilidad y cumplimiento: el repositorio incluye `BOM.json` y `EU-BOM.json`, lo que lo convierte en un caso de estudio para pipelines que exigen inventario de artefactos y divulgacion de contenido de entrenamiento conforme a la normativa europea de GPAI.
- Educacion y demostraciones docentes: adecuado para ilustrar en clase como se carga un modelo causal, como se gestiona `trust_remote_code=True` y como se ejecuta inferencia con un modelo minimo.
- Pruebas de generacion asistida de codigo Python basico: si la especializacion sugerida por el nombre se confirma, serviria para autocompletado de fragmentos muy sencillos; el alcance real no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 38 MB en FP32, 19 MB en FP16/BF16, 9,5 MB en INT8 y 5 MB en INT4. El consumo adicional por cache KV depende de la longitud de contexto, que no se especifica.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es sobradamente suficiente; no se requiere hardware de clase A100/H100.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) e incluso en iGPU y aceleradores integrados.
- Inferencia en CPU: viable sin requisitos especiales por el reducido numero de parametros.
- Opciones de despliegue: Transformers (nativo), text-generation-inference (etiqueta presente), vLLM (compatible en principio con arquitectura Llama, aunque su utilidad con 9,5 M de parametros es marginal). No se publican artefactos GGUF, por lo que su uso en llama.cpp u Ollama requeriria conversion previa por parte del usuario.
- Latencia y throughput estimados: no disponibles. Por escala, se espera latencia muy baja una vez cargado el modelo, con el cuello de botella en la carga y en la ejecucion del codigo remoto del tokenizador.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables con este export especifico (misma arquitectura, mismo tokenizador y mismo regimen de trazabilidad). A modo de contexto, se incluyen modelos abiertos pequenos ampliamente conocidos, todos ellos de mayor tamano:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| waldito-python-basics-v1-r0012-u1-mdagosta | 9,5 M | no disponible | no disponible | Tokenizador de bytes OpenWALDO, `trust_remote_code=True` |
| GPT-2 small | 124 M | 1024 | MIT (original) | Referencia historica de modelo causal pequeno |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | Modelo Llama pequeno con instrucciones |
| Qwen2.5-0.5B | 0,49 B | 32 768 | Apache 2.0 | Modelo multilingue pequeno moderno |

La comparacion con estos modelos no es equivalente en tamano ni en proposito; se ofrece unicamente como referencia de la categoria de modelos pequenos.

## Limitaciones y advertencias

- Capacidad muy limitada por tamano: 9,5 millones de parametros implican un conocimiento factual y linguistico reducido y una propension alta a generar texto incoherente fuera de dominios muy restringidos.
- Riesgo elevado de alucinacion y de repeticiones, habitual en modelos de este tamano.
- Falta de informacion sobre licencia: no se puede asumir uso comercial sin verificar los terminos con el autor.
- Requiere `trust_remote_code=True` para cargar el tokenizador, lo que implica ejecutar codigo del repositorio; debe auditarse antes de usarlo en entornos de produccion o con datos sensibles.
- No se declaran idiomas soportados: el rendimiento en castellano es incierto.
- No se publica longitud de contexto, por lo que los escenarios de contexto largo no se pueden planificar con garantias.
- Fechas de creacion y actualizacion del repositorio (2026) y ausencia de descargas e interacciones: el modelo carece de validacion por parte de la comunidad.
- Sin datos de entrenamiento publicos mas alla del mapeo `EU-BOM.json`: no es posible evaluar sesgos ni composicion del dataset.
- Tamano del repo de 0,0 GB, coherente con un modelo minimo, pero sin garantia de que se hayan publicado todos los artefactos auxiliares.

## Enlaces

- HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0012-u1-mdagosta
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
