# INCModel3/Qwen3.5-9B-MXFP4-FP8KV-FP8Attn-CT-RTN-AutoRound

## Resumen

Qwen3.5-9B-MXFP4-FP8KV-FP8Attn-CT-RTN-AutoRound es una version cuantizada del modelo Qwen/Qwen3.5-9B, publicada por el usuario INCModel3 en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado: el autor ha aplicado cuantizacion de pesos en formato MXFP4 mediante la herramienta AutoRound (Intel), con cache KV y atencion en FP8, y lo ha empaquetado en el formato compressed-tensors. El pipeline declarado es text-generation y el modelo base es la variante de 9B de la familia Qwen3.5.

La relevancia de esta ficha es practica: se trata de una cuantizacion de muy bajo peso pensada para reducir el coste de memoria en inferencia. Segun los metadatos de safetensors, el checkpoint contiene 4.577.975.560 parametros reales (unos 4,58 mil millones), una cifra notablemente inferior al "9B" que figura en el nombre del repositorio, una discrepancia que conviene tener presente antes de asumir capacidades propias de un modelo de 9B. El repositorio ocupa 12,2 GB, muy por encima de lo que ocuparian unicamente los pesos en 4 bits, lo que sugiere que incluye artefactos adicionales o ficheros redundantes.

El modelo no registra descargas ni "likes" en el momento de la consulta (0 y 0 respectivamente), y tanto la licencia como los idiomas soportados figuran como no disponibles en la informacion proporcionada. La model card solo documenta el esquema de cuantizacion y cuatro resultados de evaluacion, sin detallar contexto, arquitectura interna ni el proceso de calibracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag de HuggingFace indica `qwen3_5`; no se detalla en la informacion proporcionada) |
| Parametros totales | 4.577.975.560 (aprox. 4,58 B, segun safetensors); el nombre del repositorio indica "9B" |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 en pesos; FP8 en cache KV; FP8 en atencion; generado con AutoRound y RTN, formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del modelo original) |
| Formato de pesos | safetensors (compressed-tensors); 8-bit declarado en los tags |
| Desarrollador de la cuantizacion | INCModel3 |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repositorio | 12,2 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen3.5-9B en los datos proporcionados, mas alla del identificador de arquitectura `qwen3_5` que aparece en los tags de HuggingFace. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO u otro tipo de alineacion. El modelo original no se distribuye en este repositorio; lo que se publica es exclusivamente el checkpoint cuantizado.

Lo que si esta documentado es el proceso de cuantizacion. El autor aplica un esquema MXFP4 (formato de punto flotante de 4 bits con escalado por microexponentes compartido por bloques), combinado con cache KV en FP8 y atencion en FP8, lo que reduce tanto el peso de los parametros como la memoria consumida por el contexto durante la generacion. La generacion se ha realizado con AutoRound, un metodo de cuantizacion post-entrenamiento desarrollado por Intel que optimiza los redondeos mediante busqueda de gradiente, y se menciona tambien RTN (round-to-nearest) en el nombre del repositorio y en los tags (`compressed-tensors`, `autoquant-agent`). El pipeline de creacion se describe como "agent-driven quantize + evaluate + self-heal" a traves de la herramienta autoquant-agent, aunque no se aportan detalles tecnicos de ese proceso ni el conjunto de calibracion empleado.

## Capacidades

- Generacion de texto y conversacion multi-turno: el pipeline declarado es text-generation con tag `conversational`.
- Razonamiento y matematicas: la model card reporta 0,9227 en GSM8K, lo que indica capacidad de resolucion de problemas aritmeticos de nivel escolar.
- Comprension lectora y conocimiento general: se reportan metricas de MMLU, HellaSwag y PIQA, asociadas a tareas de conocimiento y sentido comun.
- Cuantizacion de muy bajo peso: al estar en MXFP4, esta pensado para escenarios con memoria limitada.
- Eficiencia de memoria en contexto largo: el uso de cache KV en FP8 reduce la huella de memoria por token almacenado en contexto, aunque la longitud maxima soportada no esta documentada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional autoalojado: al ocupar un espacio de memoria reducido gracias a MXFP4, el modelo puede desplegarse en una GPU de gama media o incluso en un equipo de sobremesa con GPU de 8-12 GB, sirviendo un chatbot interno sin depender de APIs externas.
- Generacion de codigo en un IDE local: integrado en extensiones tipo Continue o similar, permite autocompletado y explicacion de fragmentos sin enviar el codigo a un tercero, algo relevante en entornos con requisitos de confidencialidad.
- Procesamiento por lotes de clasificacion y extraccion de datos: tareas de etiquetado de tickets, extraccion de campos de documentos o categorizacion de correos en lotes grandes, donde el bajo coste por token derivado de la cuantizacion reduce el gasto de inferencia.
- Evaluacion y experimentacion academica con cuantizacion: util como caso de estudio para comparar el impacto de MXFP4 + FP8 KV + FP8 attention frente al checkpoint original en la misma tarea, especialmente para grupos que investigan tecnicas de compresion post-entrenamiento.
- Generacion de resumenes y reformulacion de documentacion tecnica: tareas de long-form en las que el ahorro de memoria de la cache KV en FP8 permite mantener sesiones mas largas en la misma GPU.
- Prototipado rapido de aplicaciones de razonamiento aritmetico: dado el resultado reportado en GSM8K, puede usarse para validar productos que resuelven problemas matematicos de nivel educativo antes de escalar a un modelo mayor.
- Despliegue en entornos de borde o con GPU compartida: al reducir el peso de los parametros, es posible multiplexar varias instancias en una sola GPU de 24 GB para servir distintos tenants.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card del repositorio:

| Benchmark | Resultado |
|---|---|
| GSM8K | 0,9227 |
| MMLU | 0,7604 |
| PIQA | 0,7840 |
| HellaSwag | 0,5641 |

No se han publicado en la informacion disponible resultados del modelo base sin cuantizar, ni comparaciones directas contra otras alternativas, por lo que no es posible calcular la degradacion introducida por la cuantizacion. Tampoco se documentan los ajustes de evaluacion (numero de muestras, few-shot, plantilla de prompt), un dato imprescindible para interpretar comparaciones cruzadas. El valor de HellaSwag (0,5641) es marcadamente bajo para un modelo de esta categoria, lo que puede indicar una diferencia en la metodologia de evaluacion respecto a las cifras habituales publicadas para modelos de tamano similar; conviene tratarlo con cautela.

## Requisitos de hardware

- Estimacion de VRAM para pesos: 4,578 B de parametros en MXFP4 ocupan aproximadamente 2,3 GB. Es una estimacion derivada del recuento real de parametros, no un dato aportado por el autor.
- Estimacion de VRAM total en inferencia: en torno a 3-4 GB con contextos cortos, sumando activaciones y cache KV en FP8. Con contextos largos, la cache KV crece de forma lineal con la longitud y con el numero de capas y cabezas, dato que no se proporciona.
- GPU consumer compatibles: cualquier GPU con 8 GB o mas deberia ser suficiente en terminos de capacidad de memoria (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). Cabe en la mayoria de GPU consumer recientes, siempre que el stack de software soporte MXFP4.
- GPU de datacenter: A100, H100 y familia Blackwell para despliegues con alta concurrencia; los kernels MXFP4 estan mas optimizados en hardware reciente, por lo que el rendimiento relativo puede variar mucho entre generaciones.
- Opciones de despliegue: el formato compressed-tensors es consumido por stacks modernos como vLLM o SGLang. El soporte de MXFP4 en llama.cpp u Ollama no esta confirmado en la informacion disponible y requeriria conversion de formato, por lo que no puede darse por hecho.
- Latencia y throughput: no disponible. No se aportan mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la tabla siguiente solo recoge caracteristicas verificables y deja las metricas como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.5-9B-MXFP4-FP8KV-FP8Attn-CT-RTN-AutoRound | 4,58 B (segun safetensors) | no disponible | no disponible | HuggingFace, 0 descargas | GSM8K 0,9227; MMLU 0,7604; PIQA 0,7840; HellaSwag 0,5641 |
| Qwen/Qwen3.5-9B (base sin cuantizar) | no disponible | no disponible | no disponible | HuggingFace (referenciado en la model card) | no disponible |
| Qwen3-8B (generacion anterior de la familia) | no disponible | no disponible | no disponible | HuggingFace | no disponible |
| Llama 3.1 8B | no disponible | no disponible | no disponible | HuggingFace | no disponible |

La comparativa cuantitativa no puede completarse con la informacion disponible. Para una evaluacion rigurosa seria necesario ejecutar los mismos benchmarks, con la misma metodologia, sobre el checkpoint base y sobre al menos una alternativa de tamano similar.

## Limitaciones y advertencias

- Discrepancia en el numero de parametros: el nombre del repositorio indica 9B, pero safetensors reporta 4,58 B reales. Antes de integrarlo en produccion conviene verificar que el checkpoint corresponde al modelo esperado.
- Licencia no especificada: la model card remite a la licencia del modelo original, que no se detalla. No se puede confirmar que el uso comercial este permitido sin consultar la licencia de Qwen/Qwen3.5-9B.
- Idiomas no documentados: no es posible afirmar que el modelo tenga un rendimiento aceptable en castellano ni en otros idiomas distintos del que se uso en la evaluacion.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad factual ni tasas de alucinacion.
- Impacto de la cuantizacion no medido: no hay comparacion contra el modelo base, por lo que se desconoce la degradacion real en tareas de razonamiento, codigo o contexto largo.
- Valor anomalo en HellaSwag: 0,5641 es bajo para la categoria, lo que puede reflejar un problema de evaluacion o una degradacion real. Requiere verificacion independiente.
- Trazabilidad limitada: 0 descargas y 0 likes, sin historial de validacion por parte de la comunidad. El repositorio se creo y actualizo el mismo dia (13 de septiembre de 2026).
- Tamano del repositorio inconsistente: 12,2 GB frente a los aproximadamente 2,3 GB que ocuparian los pesos en 4 bits. Puede deberse a ficheros duplicados, formatos alternativos o artefactos de conversion; conviene inspeccionar el contenido antes de descargarlo.
- Soporte de herramientas incierto: no esta confirmado que los runtimes mas extendidos (llama.cpp, Ollama, TGI) carguen directamente este formato compressed-tensors con MXFP4.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/INCModel3/Qwen3.5-9B-MXFP4-FP8KV-FP8Attn-CT-RTN-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de AutoRound (Intel): https://github.com/intel/auto-round
- autoquant-agent: la model card apunta a https://github.com/, un enlace generico sin repositorio concreto; no se ha podido localizar la URL real del proyecto.
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (versan sobre plantillas de frontispicio de tesis universitarias en italiano), por lo que no se incluye ninguno como fuente. No se han encontrado papers, blogs ni demos adicionales sobre esta cuantizacion.
