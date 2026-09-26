# jouri1310/hakaya-allam-lora

## Resumen

Hakaya (حكايا) es un adaptador LoRA para generacion de cuentos infantiles en arabe, desarrollado por el usuario jouri1310 y publicado como parte del proyecto Hikaya para la competicion Arabthon 2026. El adaptador se ha entrenado sobre `humain-ai/ALLaM-7B-Instruct-preview`, un modelo instructivo de ~7.000 millones de parametros del consorcio saudí HUMAIN, y no constituye un modelo autonomo: requiere descargar y cargar el modelo base para funcionar.

El problema que resuelve es muy especifico: dado un nombre de nino, un grupo de edad, una region de Arabia Saudi y una categoria de cuento, el modelo genera un relato infantil coherente con esos parametros y alineado con el contexto cultural saudí. Es, por tanto, un ejemplo de adaptacion de bajo coste (LoRA) de un LLM generalista arabe a un dominio vertical muy concreto, con un dataset propio preparado por el equipo del proyecto y no publicado.

Su relevancia es doble. Por un lado, demuestra que con un rank de LoRA de solo 8 y unos pocos modulos objetivo (`q_proj`, `k_proj`, `v_proj`, `o_proj`) se puede especializar un modelo arabe de 7B en una tarea narrativa con restricciones culturales y de edad. Por otro, es un caso representativo de los adaptadores de nicho que proliferan en HuggingFace con documentacion minima: no hay licencia declarada, no hay benchmarks publicados y no hay datos de uso (0 descargas y 0 likes en el momento de la consulta), lo que limita seriamente su evaluacion objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only causal (modelo base `humain-ai/ALLaM-7B-Instruct-preview`) |
| Parametros totales | Adaptador de bajo rango (rank 8) sobre un modelo base de ~7B; el repositorio reporta un tamano de 0,0 GB, por lo que el adaptador ocupa del orden de decenas de MB o menos |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio (el adaptador puede en principio combinarse con el modelo base cuantizado, pero el autor no lo documenta) |
| Idiomas soportados | Arabe (tags `arabic`, `arabic-nlp`; la model card esta redactada en arabe e ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA estandar de PEFT sobre un transformer decoder-only causal. La configuracion declarada es: rank 8, alpha 16, dropout 0,05, tipo de tarea Causal Language Modeling y modulos objetivo `q_proj`, `k_proj`, `v_proj` y `o_proj`, es decir, unicamente las proyecciones de atencion (no se adaptan las capas MLP). Se ha entrenado con PEFT 0.21.0 sobre PyTorch y Transformers. El rank bajo y la ausencia de adaptacion en las capas feed-forward sugieren un entrenamiento ligero y economico, orientado a inyectar estilo y conocimiento de dominio mas que a reestructurar el comportamiento del modelo base.

Los datos de entrenamiento son un corpus de cuentos infantiles arabes preparados especificamente por el equipo del proyecto Hikaya. La model card indica que se presto atencion al contexto cultural saudí, al lenguaje infantil, a la adecuacion por edad, a las regiones de Arabia Saudi, a las categorias de cuento y a la coherencia narrativa. No se especifica el numero de ejemplos, el numero de tokens, la composicion exacta del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. Tampoco se detalla el numero de pasos de entrenamiento, el hardware utilizado ni la duracion del ajuste.

## Capacidades

- Generacion de texto narrativo en arabe: produccion de cuentos infantiles completos a partir de un prompt con nombre, edad, region y categoria.
- Personalizacion por parametros de entrada: el modelo esta disenado para condicionar la historia al grupo de edad del lector, a la region saudí seleccionada y a la categoria tematica elegida.
- Adecuacion cultural: el dataset de entrenamiento se construyo explicitamente con referencias a la cultura saudí, por lo que el modelo tiende a producir contenido contextualizado en ese entorno.
- Ajuste al registro infantil: el corpus objetivo es lenguaje para ninos, lo que orienta el estilo lexico y sintactico de las salidas.
- Uso conversacional basico: los tags incluyen `conversational`, aunque la model card describe la tarea como generacion de cuentos, no como dialogo multi-turno.
- Capacidad heredada del modelo base: al ser un adaptador sobre ALLaM-7B-Instruct, conserva en teoria las capacidades instructivas generales del modelo base (comprension de instrucciones en arabe, generacion de texto general), aunque el ajuste LoRA puede degradarlas parcialmente.
- Tool calling / function calling: no documentado.
- Modo de razonamiento explicito (thinking mode): no documentado.
- Vision o audio: no soportado (modelo exclusivamente de texto).

## Casos de uso

- Generacion de cuentos personalizados en la aplicacion Hikaya: el escenario principal para el que fue disenado. El usuario introduce el nombre del nino, el grupo de edad, la region saudí y la categoria, y el modelo devuelve un cuento adaptado; es adecuado porque el adaptador se entreno exactamente con ese esquema de condicionamiento.
- Contenido infantil para plataformas editoriales arabes: editoriales o medios digitales pueden usarlo para generar borradores de relatos infantiles que despues pasa revision humana, reduciendo el coste de produccion de contenido en arabe y con referencias culturales locales.
- Material didactico graduado por edad: escuelas y academias pueden generar lecturas de dificultad creciente seleccionando el grupo de edad como parametro, aprovechando que el modelo se entreno para discriminar ese factor.
- Pipelines de audiolibros infantiles: integrado antes de un sistema de text-to-speech en arabe, el modelo puede producir guiones de cuentos que luego se sintetizan como audio para plataformas de lectura asistida.
- Aplicaciones de entretenimiento familiar en arabe: apps moviles de cuentacuentos que necesitan contenido nuevo de forma continua sin depender de un catalogo cerrado de historias escritas por humanos.
- Investigacion en NLP arabe y en ajuste eficiente: sirve como caso de estudio reproducible de LoRA de rank 8 sobre ALLaM-7B, util para comparar estrategias de especializacion de bajo coste en un dominio acotado y en un idioma con menos recursos que el ingles.
- Localizacion cultural de contenido narrativo: equipos que necesitan adaptar historias genericas al contexto saudí (terminologia, entornos, referencias cotidianas) pueden usarlo como generador de primeras versiones culturalmente ancladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas automaticas ni evaluaciones humanas cuantificadas, y la busqueda web no ha devuelto ningun articulo, informe o leaderboard asociado al adaptador.

## Requisitos de hardware

Las cifras siguientes son estimaciones de ingenieria derivadas del tamano del modelo base (~7B de parametros) y no datos publicados por el autor; deben tratarse como orientativas.

- VRAM para el modelo base en fp16/bf16: en torno a 14-16 GB solo para pesos, mas el coste de la cache KV segun la longitud de contexto.
- VRAM en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM en cuantizacion de 4 bits: aproximadamente 4-6 GB, dependiendo del backend y del tamano de lote.
- GPU profesionales recomendadas: A100 40 GB o 80 GB, H100 o L40S para despliegue con vLLM o TGI y concurrencia alta.
- GPU de consumo: si cabe en tarjetas de gama alta con 24 GB (RTX 3090, RTX 4090) en fp16 y con holgura en 4 bits; tambien es viable en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) si se aplica cuantizacion de 4 bits.
- Opciones de despliegue: PEFT + Transformers (la ruta natural, ya que el repositorio solo contiene el adaptador), vLLM o TGI fusionando previamente el adaptador con el modelo base, llama.cpp u Ollama tras convertir los pesos fusionados a GGUF.
- El adaptador en si es muy ligero: el repositorio reporta un tamano de 0,0 GB, por lo que el coste de almacenamiento y de carga del adaptador es despreciable frente al del modelo base.
- Latencia y throughput estimados: no disponibles. No hay ninguna medicion publicada para este adaptador.

## Comparativa con modelos similares

La busqueda web no ha devuelto adaptadores comparables de generacion de cuentos infantiles en arabe; los resultados obtenidos corresponden a plataformas de LoRA para generacion de imagenes (Civitai, LoRA Studio, PixAI), no relevantes para esta categoria. La comparativa se limita por tanto al modelo base frente al adaptador.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jouri1310/hakaya-allam-lora | Adaptador LoRA sobre ALLaM-7B-Instruct | Rank 8 sobre modelo base de ~7B | No disponible | No disponible | HuggingFace, 0 descargas |
| humain-ai/ALLaM-7B-Instruct-preview | Modelo completo instructivo | ~7B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |
| Alternativas de generacion de cuentos en arabe | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del adaptador, lo que impide determinar si el uso comercial esta permitido. Esta es la advertencia mas relevante para cualquier integracion en produccion.
- Dependencia del modelo base: el repositorio contiene unicamente el adaptador, no los pesos completos. Es obligatorio descargar `humain-ai/ALLaM-7B-Instruct-preview` y aplicar la licencia de dicho modelo base, que tampoco se detalla en la informacion proporcionada.
- Tipo de licencia del modelo base: debe verificarse por separado en el repositorio de HUMAIN antes de cualquier uso comercial.
- Alucinacion: el autor reconoce explicitamente que los cuentos pueden contener incoherencias gramaticales o linguisticas, repeticiones, interpretacion incorrecta de nombres o entradas, y variaciones en la calidad narrativa.
- Ambito restringido: el modelo esta pensado para generar cuentos infantiles en un contexto muy concreto. Usarlo fuera de ese dominio (codigo, matematicas, razonamiento general, conversacion abierta) probablemente produzca resultados degradados.
- Idiomas: solo se declara arabe. No hay evidencia de capacidades en castellano ni en otros idiomas, y el ajuste LoRA puede haber reducido el rendimiento multilingue del modelo base.
- Sesgos y adecuacion cultural: el corpus de entrenamiento se preparo con un enfoque especifico en la cultura saudí y en determinadas regiones y categorias. Esto puede traducirse en una representacion limitada de otras culturas, regiones o sensibilidades, o en estereotipos reproducidos del material de origen.
- Contenido para menores: cualquier despliegue real requiere revision humana del contenido generado antes de exponerlo a publico infantil.
- Sin benchmarks ni validacion externa: no existen metricas publicadas, evaluaciones de sesgo ni auditorias de seguridad. Cualquier afirmacion sobre su calidad relativa carece de respaldo empirico.
- Trazabilidad limitada: con 0 descargas y 0 likes, el adaptador no tiene comunidad de usuarios que haya reportado problemas, lo que reduce la informacion disponible sobre su comportamiento en produccion.
- Dataset no publicado: no se puede auditar la composicion, el tamano ni la procedencia de los datos de entrenamiento.
- Riesgo de sobreajuste: con rank 8, dropout 0,05 y adaptacion limitada a las proyecciones de atencion, es esperable una especializacion fuerte en el estilo del corpus y poca generalizacion fuera de el.

## Enlaces

- Pagina del adaptador en HuggingFace: https://huggingface.co/jouri1310/hakaya-allam-lora
- Modelo base: https://huggingface.co/humain-ai/ALLaM-7B-Instruct-preview
- Repositorio de PEFT (libreria de entrenamiento): https://github.com/huggingface/peft
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- Proyecto Hikaya / Arabthon 2026: no disponible (no se ha encontrado URL en la busqueda web)
- Paper o informe tecnico del adaptador: no disponible
- Demo publica: no disponible
