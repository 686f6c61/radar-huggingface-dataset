# mdagosta/waldito-python-basics-v1-r0013-u1-mdagosta-b

## Resumen

Waldito-python-basics-v1 (identificador completo `mdagosta/waldito-python-basics-v1-r0013-u1-mdagosta-b`) es un modelo de generacion de texto publicado por el usuario mdagosta en HuggingFace. Se trata de un modelo de arquitectura Llama causal (decoder-only transformer) con un total de 9.541.632 parametros reales confirmados en los ficheros safetensors, lo que lo situa en la categoria de modelos ultracompactos, tres ordenes de magnitud por debajo de los modelos de 7B-8B habituales.

El modelo se presenta como un "export" de la plataforma OpenWALDO y utiliza el tokenizer de bytes "schema-1" propio de esa plataforma, lo que obliga a cargarlo con `trust_remote_code=True`. El nombre del repositorio sugiere un entrenamiento orientado a fundamentos de Python ("python-basics"), aunque no se aporta informacion verificable sobre el dataset. El repositorio incluye ficheros de inventario (`BOM.json` y `EU-BOM.json`) con la divulgacion de contenido de entrenamiento segun el reglamento europeo de GPAI.

Su relevancia practica es limitada: no tiene descargas ni likes, no declara licencia ni idiomas soportados, y carece de benchmarks publicados. Su interes es principalmente experimental, como ejemplo de export de un pipeline OpenWALDO a formato Transformers, o como punto de partida para tareas muy acotadas de generacion de codigo Python en entornos con recursos minimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama causal-language-model (transformer decoder-only) |
| Parametros totales | 9.541.632 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estandar de Llama para modelado causal de lenguaje, segun indica explicitamente la model card del autor. Se trata, por tanto, de un transformer decoder-only con atencion causal, tokens de tipo byte y generacion autorregresiva. Con 9,54 millones de parametros, no hay evidencia de que se emplee mezcla de expertos, atencion lineal ni ninguna variante hibrida.

El elemento mas distintivo es el tokenizer: un tokenizer de bytes denominado "schema-1", propio de OpenWALDO, que requiere cargarse con `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se detalla si se aplicaron tecnicas como decodificacion especulativa o atencion con ventana deslizante.

## Capacidades

- Generacion de texto autorregresiva basica.
- Compatible con la pipeline `text-generation` de Transformers.
- Marcado con la etiqueta `conversational`, lo que sugiere (sin confirmacion) algun tipo de formato de dialogo.
- Compatible con text-generation-inference y con endpoints segun las etiquetas del repositorio.
- Orientacion nominal a "python-basics" segun el nombre del modelo, sin documentacion que lo respalde.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- No hay evidencia de capacidades multilingues.
- No hay evidencia de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Prototipado de pipelines Transformers: sirve como modelo minimo para validar que un entorno de inferencia (transformers, TGI) carga correctamente pesos safetensors y un tokenizer remoto con `trust_remote_code=True`.
- Pruebas de integracion de tokenizers personalizados: al usar un tokenizer de bytes no estandar, es util para verificar la compatibilidad de wrappers y servicios que necesiten decodificar byte a byte.
- Experimentacion educativa: con 9,5M de parametros, cabe en cualquier portatil y permite entrenar o afinar desde cero sin GPU dedicada.
- Generacion de fragmentos de codigo Python muy cortos: el nombre del modelo apunta a fundamentos de Python, aunque sin benchmarks que confirmen calidad alguna.
- Baseline en investigacion comparativa: puede actuar como referencia de muy baja capacidad para medir la mejora de modelos mayores en tareas de codigo.
- Auditoria de divulgacion GPAI: los ficheros `BOM.json` y `EU-BOM.json` permiten estudiar como se estructura un inventario de contenidos de entrenamiento conforme al reglamento europeo.
- Simulacion de entornos con restricciones extremas de memoria: para pruebas de despliegue en dispositivos embebidos o CPU sin aceleracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19 MB en FP16 y 38 MB en FP32, solo para pesos; el pico de memoria dependera del tamaño de la ventana de contexto efectiva, que no esta documentada.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es mas que suficiente; el modelo es funcional incluso en CPU.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo actual y en la mayoria de iGPU y SoC.
- Opciones de despliegue: Transformers (libreria declarada), text-generation-inference (etiqueta del repositorio) y cualquier runtime que cargue safetensors con soporte para `trust_remote_code`. No se ofrecen pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. A escala de ~9,5 millones de parametros no se han identificado en la documentacion modelos alternativos directamente comparables con los que contrastar parametros, contexto, rendimiento o licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| waldito-python-basics-v1 | 9.541.632 | No disponible | No disponible | HuggingFace, safetensors |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir permiso de uso comercial ni redistribution; hay que contactar con el autor antes de cualquier uso en produccion.
- Sin idiomas declarados: se desconoce si el modelo funciona en castellano, ingles o cualquier otra lengua.
- Riesgo elevado de alucinacion y de texto incoherente: con 9,5M de parametros, la capacidad de modelado del lenguaje es muy limitada en comparacion con modelos de miles de millones de parametros.
- Uso de `trust_remote_code=True`: cargar el tokenizer implica ejecutar codigo del repositorio, lo que supone un riesgo de seguridad en entornos no confiables. Conviene auditar el codigo antes de su uso.
- Tokenizer de bytes no estandar: puede no ser compatible con herramientas de tokenizacion, metricas o pipelines que asuman vocabularios BPE/SentencePiece convencionales.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia objetiva de calidad en generacion de codigo, razonamiento o cualquier otra tarea.
- Sin historial de mantenimiento: cero descargas y cero likes en el momento de la consulta, con creacion y ultima actualizacion separadas por cinco segundos, lo que indica un unico commit de publicacion.
- Fechas de publicacion futuras respecto al calendario habitual de referencia; conviene verificar la vigencia y autoria del repositorio.
- Contexto maximo no documentado: no es posible planificar despliegues con requisitos de ventana larga sin validacion empirica previa.

## Enlaces

- HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0013-u1-mdagosta-b
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
