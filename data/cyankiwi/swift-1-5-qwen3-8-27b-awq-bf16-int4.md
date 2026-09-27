# cyankiwi/Swift-1.5-Qwen3.8-27B-AWQ-BF16-INT4

## Resumen

Swift-1.5-Qwen3.8-27B-AWQ-BF16-INT4 es una cuantizacion de 4 bits (AWQ, con una parte de pesos en BF16) del modelo ukisai/Swift-1.5-Qwen3.8-27b, publicada por el usuario cyankiwi. El modelo original lo desarrolla UkisAI y es un derivado orientado a eficiencia de razonamiento de Qwen3.8-27B: segun su model card, consume un 58,5 % menos de tokens de pensamiento que la base manteniendo una puntuacion agregada un 0,35 % superior, lo que se traduce en una aceleracion de 1,95x en varias tareas.

El objetivo del modelo es reducir el "sobrepensamiento" patologico de los modelos de razonamiento sin recortar directamente la longitud de la cadena de pensamiento, penalizando en su lugar los tokens asociados a ese comportamiento y recuperando precision mediante RL y OPD. La version 1.5 escala el post-entrenamiento de Swift 1.0 con foco en tareas de largo horizonte, agenticas y de codigo.

Esta ficha concreta describe la variante cuantizada a INT4 de cyankiwi (version 26.05.01, calibrada con datos STEM y agenticos). El repositorio tiene 27.781.427.952 parametros reales segun safetensors (~27,8 mil millones) y un tamano de repo de 28,9 GB. Se trata de una publicacion muy reciente (27 de septiembre de 2026) sin descargas ni valoraciones registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivado de Qwen3.8-27B. Los tags incluyen qwen3_5 y qwen3_8 |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ INT4 combinada con BF16 (nomenclatura del repo: AWQ-BF16-INT4), formato compressed-tensors |
| Idiomas soportados | EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES (segun model card); el metadato de HuggingFace no los lista |
| Licencia | swift-open-license-1.0 (etiquetada como "other"); enlace al texto en el modelo base |
| Formato de pesos | safetensors (compressed-tensors); existen versiones GGUF y GSQ-RCO GGUF del modelo base sin cuantizar AWQ |
| Tamano del repositorio | 28,9 GB |
| Version de la cuantizacion | 26.05.01 |
| Dataset de calibracion | cyankiwi/calibration (STEM and Agentic) |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Acceso | El modelo base figura como gated: true |
| Fecha de publicacion | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (numero de capas, atencion, posibles componentes MoE o hibridos). Los tags de HuggingFace incluyen qwen3_5 y qwen3_8, y el pipeline declarado es image-text-to-text, lo que indica que el modelo acepta entrada de imagen ademas de texto, aunque la model card no describe el codificador visual ni aporta evaluaciones por modalidad. El unico dato estructural firme es el recuento de parametros: 27.781.427.952.

En cuanto al entrenamiento, UkisAI describe un enfoque centrado en identificar que tokens estaban vinculados a sobrepensamiento patologico y penalizarlos, sin atacar directamente la longitud del razonamiento, recuperando despues la precision mediante RL y OPD. Swift 1.5 parte de Swift 1.0 y escala esos metodos de post-entrenamiento con foco en tareas de largo horizonte, agenticas y de codigo (mejoras citadas en LiveCodeBench y Terminal Bench 2.1). El dataset de partida es ukisai/Qwen3.8-27B-multi-turn-agent-sft, que segun el autor no se usa tal cual, sino re-muestreado y convertido en entornos de RL. Esta variante cuantizada anade un paso AWQ de 4 bits calibrado con datos STEM y agenticos, ademas de conservar ciertos tensores en BF16.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento (thinking) optimizado para eficiencia de tokens: -58,5 % de tokens de pensamiento respecto a la base segun el autor.
- Capacidades de codigo, con mejoras declaradas en LiveCodeBench.
- Capacidades agenticas y de largo horizonte, con mejoras declaradas en Terminal Bench 2.1.
- Entrada de imagen ademas de texto, segun el pipeline image-text-to-text declarado (sin detalle del codificador visual).
- Soporte multilingue en 10 idiomas: ingles, chino, hindi, arabe, ruso, japones, coreano, neerlandes, frances y espanol.
- Compatibilidad con endpoints (tag endpoints_compatible) y con el ecosistema transformers.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque el enfoque agentico y el dataset multi-turno de agentes lo hacen plausible. No se puede afirmar sin documentacion adicional.

## Casos de uso

- Desarrollo de videojuegos y prototipos interactivos: la propia model card documenta la generacion de un globo 3D explorable con biomas a partir de un unico prompt. El modelo base tardo 104,6 minutos en completar la tarea y Swift 1.5 11,39 minutos, lo que lo hace adecuado para iteracion rapida en prototipado de mecanicas jugables.
- Automatizacion de terminal y tareas de sistema: las mejoras declaradas en Terminal Bench 2.1 apuntan a su uso en agentes que ejecutan comandos, inspeccionan ficheros y resuelven tareas de administracion o build en entornos controlados.
- Asistentes de codigo en pipelines de CI/CD: su foco declarado en codigo y agentica permite integrarlo en revision de parches, generacion de tests o diagnostico de fallos de compilacion, siempre con supervision humana.
- Agentes de largo horizonte: al reducir los tokens de pensamiento manteniendo precision, baja el coste por tarea en flujos con muchas llamadas encadenadas, donde el consumo de tokens de razonamiento domina la factura.
- Analisis de documentos con componente visual: dado su pipeline image-text-to-text, puede emplearse para extraer informacion de capturas, diagramas o interfaces, combinando texto e imagen en la misma conversacion.
- Atencion al cliente multilingue: cubre espanol, ingles, frances, neerlandes, arabe, hindi, ruso, japones, coreano y chino, con capacidad de mantener conversaciones multi-turno.
- Evaluacion e investigacion sobre eficiencia de razonamiento: la penalizacion selectiva de tokens de sobrepensamiento lo convierte en un objeto de estudio util para comparar curvas de precision frente a longitud de cadena de pensamiento.

## Benchmarks y rendimiento

La model card incluye una seccion de evaluacion con una tabla HTML que compara Qwen3.8-27B y Swift 1.5, pero el contenido de esa tabla no esta disponible en la informacion extraida. Los unicos datos numericos publicados son los siguientes:

| Metrica | Qwen3.8-27B (base) | Swift 1.5 | Delta |
|---|---|---|---|
| Tokens de pensamiento | Linea base | -58,5 % | Reduccion |
| Puntuacion agregada | Linea base | +0,35 % | Mejora |
| Velocidad en varias tareas | 1x | 1,95x | Aceleracion |
| Demo de juego 3D (tiempo hasta completar) | 104,6 minutos | 11,39 minutos | -89,1 % |

Mejoras cualitativas citadas sin cifra: LiveCodeBench, Terminal Bench 2.1 y rendimiento global superior tanto a la base como a Swift 1.0, especialmente en codigo y tareas agenticas. No se han publicado en la informacion disponible resultados de MMLU, GSM8K, HumanEval ni de benchmarks equivalentes con valores numericos. Estos datos corresponden al modelo sin cuantizar; no se aportan mediciones especificas de esta variante AWQ INT4.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,78 B de parametros en INT4, los pesos ocupan aproximadamente 14-15 GB; contando escalas de cuantizacion, tensores BF16 y overhead del runtime, conviene reservar en torno a 16-18 GB para contexto corto (estimacion propia, no dato del autor).
- La cache KV crece con la longitud de contexto, que no esta publicada; para contextos largos conviene planificar 24-48 GB o mas.
- En BF16 el modelo completo requeriria aproximadamente 55-56 GB de VRAM solo para pesos (estimacion).
- GPU consumer: una RTX 4090 o RTX 3090 de 24 GB deberia poder ejecutar la variante INT4 con contexto moderado; dos GPU de 24 GB permiten ampliar contexto o lote.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S son opciones holgadas para esta cuantizacion.
- Opciones de despliegue: vLLM y SGLang (soporte de compressed-tensors/AWQ), TGI y transformers para carga directa. Para llama.cpp y Ollama habria que recurrir a las versiones GGUF del modelo base publicadas por ukisai.
- Latencia y throughput: no disponibles como cifra absoluta. El autor reporta una aceleracion de 1,95x atribuible a la reduccion de tokens de pensamiento, no al proceso de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyankiwi/Swift-1.5-Qwen3.8-27B-AWQ-BF16-INT4 | 27,78 B | No disponible | AWQ INT4 + BF16 | swift-open-license-1.0 | HuggingFace, sin descargas registradas |
| ukisai/Swift-1.5-Qwen3.8-27b | No disponible | No disponible | BF16 (sin cuantizar) | swift-open-license-1.0 | HuggingFace, modelo base, gated |
| ukisai/Swift-Qwen3.8-27b (Swift 1.0) | No disponible | No disponible | BF16 | No disponible | HuggingFace, mas de 350.000 descargas segun el autor |
| Qwen/Qwen3.8-27B | No disponible | No disponible | BF16 | No disponible | HuggingFace, modelo fundacional |
| ukisai GGUF / GSQ-RCO GGUF | No disponible | No disponible | GGUF (varias) | No disponible | HuggingFace |

La comparativa se limita a los modelos citados en la propia model card, ya que no hay datos publicados de contexto, licencia completa ni benchmarks numericos para establecer comparaciones mas amplias con alternativas de terceros.

## Limitaciones y advertencias

- La licencia swift-open-license-1.0 esta clasificada como "other" y su texto no se reproduce en la informacion disponible; es imprescindible revisar el enlace de licencia del modelo base antes de cualquier uso comercial.
- El modelo base aparece marcado como gated: true, lo que puede condicionar el acceso, la redistribucion y el uso derivado.
- La cuantizacion AWQ INT4 puede degradar ligeramente la calidad respecto al modelo en BF16, especialmente en tareas de razonamiento largo o codigo. No se publican mediciones de esa perdida para esta variante.
- La calibracion se realizo con un dataset de dominio STEM y agentico, por lo que el comportamiento puede estar optimizado para esos dominios y ser menos fiable en otros.
- No se publica la longitud de contexto soportada, dato critico para planificar despliegues con documentos largos o historiales extensos.
- Riesgo de alucinacion inherente a los modelos generativos, agravado en tareas agenticas donde el modelo puede ejecutar acciones erroneas si no hay validacion externa.
- La reduccion de tokens de pensamiento puede traducirse en menor profundidad de razonamiento en problemas muy complejos; la mejora del 0,35 % es un agregado y no garantiza mejoras en todas las tareas.
- No hay evaluaciones por idioma publicadas; el soporte del espanol esta declarado pero no cuantificado.
- La capacidad de vision se deduce del pipeline image-text-to-text, pero no se documentan el codificador visual ni evaluaciones multimodales.
- El repositorio no tiene descargas ni valoraciones y se publico el mismo dia de su actualizacion, por lo que carece de validacion independiente de la comunidad.
- No se confirma explicitamente soporte de tool calling ni de agentes con esquemas estructurados; conviene verificarlo antes de integrarlo en produccion.

## Enlaces

- Modelo cuantizado: https://huggingface.co/cyankiwi/Swift-1.5-Qwen3.8-27B-AWQ-BF16-INT4
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Modelo fundacional Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Version GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Version GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Dataset de calibracion de la cuantizacion: https://huggingface.co/datasets/cyankiwi/calibration
- Web del desarrollador: https://ukisai.com
- Pagina de producto: https://ukisai.com/products/swift
- Demo interactiva del modelo: https://ukisai.com/swift-games/27b
- Contacto del cuantizador: ton@cyan.kiwi
