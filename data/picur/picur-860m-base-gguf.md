# picur/picur-860M-base-gguf

## Resumen

picur-860M-base-gguf es la version cuantizada en formato GGUF del modelo picur-860M-base, un modelo de lenguaje de 856.662.144 parametros (aproximadamente 0,86 mil millones) publicado por el usuario picur en HuggingFace. Se trata de un modelo base, es decir, entrenado para completar texto y no afinado por instrucciones, orientado especificamente al hungaro (magyar), unico idioma declarado en sus metadatos. La ficha se publica bajo licencia Apache 2.0 y esta marcada por el propio autor con el aviso "PREVIEW", lo que indica que es una version preliminar y no una release estable.

La relevancia de esta publicacion es limitada pero concreta: los modelos por debajo de los 1.000 millones de parametros son utiles para inferencia en CPU, dispositivos de borde y entornos sin GPU, y la disponibilidad de un GGUF listo para Ollama reduce la barrera de entrada a un solo comando. El repositorio ocupa 2,6 GB, lo que sugiere la presencia de varias cuantizaciones, y la unica confirmada explicitamente en la model card es Q8_0.

La informacion publicada es muy escasa: no se documentan arquitectura, longitud de contexto, composicion del dataset de entrenamiento, numero de tokens vistos, ni resultados de benchmarks. Tampoco se han encontrado fuentes externas relevantes en la busqueda web, cuyos resultados corresponden a entidades homonimas sin relacion con el modelo (un complemento alimenticio, un registro medico frances y una marca de congelados). Por tanto, esta ficha refleja unicamente lo verificable en los metadatos y marca como "no disponible" todo lo demas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 856.662.144 |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; Q8_0 confirmado en la model card, resto no disponible |
| Idiomas soportados | hungaro (hu) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 2,6 GB); el modelo base original no especifica formato en la informacion disponible |

Datos adicionales verificables: pipeline `text-generation`, autor `picur`, modelo base `picur/picur-860M-base`, creado el 28 de septiembre de 2026, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. La model card no incluye seccion tecnica, y los metadatos no declaran si se trata de un transformer denso, una mezcla de expertos, un modelo de espacio de estados o una arquitectura hibrida. Tampoco se especifican hiperparametros como numero de capas, dimension oculta, numero de cabezas de atencion o vocabulario del tokenizador. El unico dato estructural firme es el recuento de parametros (856.662.144), coherente con la nomenclatura "860M".

Respecto al entrenamiento, la unica informacion disponible es indirecta: el tag `base` y el campo `base_model` confirman que se trata de un modelo preentrenado sin afinado por instrucciones, por lo que no cabe esperar RLHF, DPO ni formatos de chat. No hay datos sobre el corpus utilizado, el numero de tokens de entrenamiento, la composicion del dataset, el uso de filtrado de calidad o la posible inclusion de codigo y matematicas. La etiqueta `conversational` aparece en los tags de HuggingFace, pero contradice el caracter de modelo base y no se detalla en ninguna parte del repositorio. Esta publicacion es, en la practica, un artefacto de cuantizacion: el trabajo tecnico relevante esta en `picur/picur-860M-base`, cuyo contenido tampoco se documenta aqui.

## Capacidades

- Generacion de texto en hungaro: es la unica capacidad declarada explicitamente mediante el campo `language: hu`.
- Modelo base: completa texto y puede usarse para continuar prompts, pero no sigue instrucciones de forma fiable ni mantiene un formato de conversacion consistente sin un afinado posterior.
- Razonamiento y matematicas: no documentado; sin benchmarks no puede afirmarse nada al respecto.
- Generacion de codigo: no documentada.
- Tool calling / function calling: no soportado de forma declarada; los modelos base no incorporan plantillas de herramientas.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Vision, audio o multimodalidad: no disponibles.
- Modo "thinking": el ejemplo de la model card usa la bandera `--think=false` de Ollama, lo que sugiere que el modelo o su plantilla podrian emitir bloques de razonamiento, pero es una inferencia no confirmada por el autor y no se detalla en ningun otro lugar.
- Multilingue: no; el unico idioma declarado es el hungaro.

## Casos de uso

- Inferencia local en hungaro sobre CPU: al tratarse de un GGUF de 0,86B, puede ejecutarse con Ollama o llama.cpp en un portatil sin GPU dedicada, lo que permite generar texto en hungaro de forma totalmente offline y sin coste de API.
- Punto de partida para fine-tuning supervisado: al ser un modelo base pequeno y con licencia Apache 2.0, es un candidato razonable para aplicar LoRA o SFT y especializarlo en tareas hungaras concretas (clasificacion, extraccion de entidades, resumen) con recursos muy limitados.
- Generacion de datos sinteticos en hungaro: puede emplearse para producir texto de dominio general que amplie corpus pequenos, siempre que se revise y filtre la salida por el riesgo de alucinacion inherente a un modelo base sin evaluacion publicada.
- Investigacion academica sobre eficiencia: sirve como sujeto de estudio para medir el impacto de distintas cuantizaciones GGUF (Q8_0 frente a Q4) en perplejidad y calidad de generacion en una lengua de recursos medios como el hungaro.
- Experimentacion con despliegue en dispositivos de borde: sus aproximadamente 0,9 GB en Q8_0 lo hacen viable en Raspberry Pi 5 o mini-PC con 4-8 GB de RAM, util para prototipos de asistentes locales en hungaro.
- Reproduccion y ensenanza: el comando de una sola linea de Ollama facilita su uso en talleres, cursos y demostraciones sobre cuantizacion, formatos GGUF y ejecucion local de modelos.
- Filtrado o puntuacion de texto mediante perplejidad: un modelo de lenguaje hungaro puede emplearse para detectar texto anomalo o malformado calculando la perplejidad de candidatos, sin necesidad de que sea instructivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, HellaSwag ni de evaluaciones especificas en hungaro (por ejemplo, HuLU). Tampoco se han encontrado evaluaciones externas en la busqueda web. Cualquier cifra de rendimiento que se cite sobre este modelo carece por ahora de respaldo verificable.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros y del formato GGUF; el autor no publica mediciones.

- VRAM/RAM estimada para inferencia: en torno a 0,5-0,6 GB en cuantizaciones de 4 bits, aproximadamente 0,9-1,0 GB en Q8_0 y cerca de 1,7 GB en FP16.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, RTX 4090). No requiere A100 ni H100; usarlas seria desproporcionado.
- Cabe en GPU consumer: si, en practicamente todas las tarjetas graficas de los ultimos diez anos, e incluso en iGPU con memoria compartida.
- Ejecucion en CPU: viable y probablemente el escenario principal, con 4-8 GB de RAM libre.
- Opciones de despliegue: Ollama (confirmado por el autor con `ollama run hf.co/picur/picur-860M-base-gguf:Q8_0`), llama.cpp, llama-cpp-python, LM Studio, Jan y text-generation-webui. vLLM solo soporta GGUF de forma experimental y TGI no lo soporta de forma nativa, por lo que no son las vias recomendadas.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia de primera respuesta.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan una comparacion de rendimiento. La tabla siguiente contrasta solo caracteristicas declaradas por cada proyecto, segun su documentacion publica, y debe tomarse como orientativa.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| picur-860M-base-gguf | 856.662.144 | no disponible | hungaro | Apache 2.0 | GGUF en HuggingFace, uso directo con Ollama |
| TinyLlama-1.1B | ~1.100 millones | 2.048 tokens | ingles (principalmente) | Apache 2.0 | Pesos y GGUF ampliamente disponibles |
| Qwen2.5-0.5B | ~494 millones | 32.768 tokens | multilingue (incluye varias lenguas europeas) | Apache 2.0 | Pesos y GGUF, ecosistema muy extendido |
| SmolLM2-360M | ~362 millones | 8.192 tokens | ingles (principalmente) | Apache 2.0 | Pesos y GGUF |

La diferencia principal no es de tamano sino de documentacion y madurez: los modelos de la comparativa cuentan con model cards detalladas, evaluaciones publicadas y comunidades activas, mientras que picur-860M-base-gguf no ofrece ninguno de esos elementos. Su unico diferenciador claro es el enfoque especifico en hungaro, un idioma poco cubierto por los modelos pequenos de uso comun. No se dispone de datos objetivos para afirmar cual de ellos rinde mejor en tareas en hungaro.

## Limitaciones y advertencias

- Estado de "PREVIEW": el propio autor marca la publicacion como preliminar; no debe tratarse como una version estable ni como base para produccion sin evaluacion previa.
- Modelo base, no instructivo: no sigue instrucciones, no respeta plantillas de chat de forma fiable y puede generar continuaciones incoherentes o repetitivas. Requiere afinado para uso conversacional.
- Ausencia total de benchmarks: no existe evidencia publicada de su calidad en ninguna tarea, ni siquiera en hungaro.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de genero, etnicos, politicos o religiosos. Un corpus hungaro no filtrado puede arrastrar sesgos especificos del dominio de origen.
- Riesgo de alucinacion: alto en un modelo de 0,86B sin ajuste por instrucciones, especialmente en tareas de conocimiento factual.
- Limitacion idiomatica: el unico idioma declarado es el hungaro; su comportamiento en castellano, ingles u otras lenguas es impredecible y no esta soportado.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos ni confirmar el soporte de contextos extendidos.
- Perdida por cuantizacion: la version Q8_0 introduce una degradacion minima pero no nula respecto a los pesos originales; cuantizaciones mas agresivas, si existen en el repositorio, degradarian mas la calidad.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia, y se documenten los cambios realizados. No se declaran restricciones adicionales, pero la licencia del modelo base subyacente deberia confirmarse en `picur/picur-860M-base`.
- Trazabilidad: con 0 descargas y 0 likes, se trata de una publicacion sin validacion por parte de la comunidad; conviene auditar los pesos antes de integrarlos en cualquier flujo.
- La busqueda web no devolvio ninguna fuente tecnica sobre este modelo; los resultados obtenidos corresponden a entidades homonimas sin relacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/picur/picur-860M-base-gguf
- Modelo base: https://huggingface.co/picur/picur-860M-base
- Perfil del autor: https://huggingface.co/picur
- Documentacion de Ollama (ejecucion de modelos GGUF): https://ollama.com
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Papers, blogs, repositorios o demos adicionales: no disponible; la busqueda web no devolvio ninguna fuente relevante sobre este modelo.
