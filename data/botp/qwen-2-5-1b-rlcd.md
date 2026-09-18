# botp/Qwen-2.5-1B-RLCD

## Resumen

Qwen-2.5-1B-RLCD es un checkpoint publicado por el usuario botp sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, orientado a un caso de uso muy concreto: la decodificacion restringida en paralelo (Parallel Constrained Decoding) para extraccion de informacion estructurada y clasificacion categorica sobre Apple Silicon mediante MLX. No se trata de un modelo reentrenado desde cero ni de un ajuste fino con datos propios, sino de un artefacto que acompanha a un motor de inferencia que evalua simultaneamente todos los campos de un esquema JSON en lugar de generar tokens de forma autorregresiva.

El problema que resuelve es el coste de latencia de la generacion estructurada tradicional. Cuando un LLM debe emitir un JSON con varios campos, la decodificacion autorregresiva exige entre 150 y 500 pasadas forward secuenciales, con degradacion de sintaxis, omision de campos y claves alucinadas como fallos habituales. La propuesta del autor hace un unico prefill del contexto y del esquema en la cache KV, la difunde en paralelo sobre los M campos del esquema y aplica logit slicing sobre el subvocabulario de candidatos validos por campo, devolviendo sintaxis valida al 100 % y probabilidades calibradas por campo.

La relevancia actual es doble. Por un lado, ofrece reducciones de latencia de entre 5,6x y 7,0x frente a la linea base autorregresiva en un M4 Max, con tiempos de 68 a 270 ms segun el escenario. Por otro lado, es un ejemplo de inferencia estructurada optimizada para hardware de Apple, un nicho donde las alternativas basadas en CUDA (vLLM, TGI) no estan disponibles. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el nombre del checkpoint (1B) no coincide con el tamano real del modelo base (1,5B), una discrepancia que conviene tener presente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct); el artefacto anade un motor de decodificacion restringida en paralelo sobre MLX |
| Parametros totales | 1,5 mil millones (heredados del modelo base; el identificador del repo indica "1B" de forma inconsistente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens nativos, extensibles con YaRN |
| Tipos de cuantizacion | MLX 4-bit (checkpoint `mlx-community/Qwen2.5-1.5B-Instruct-4bit` usado en los benchmarks). No se documentan otras cuantizaciones en la model card |
| Idiomas soportados | Ingles (`en`, declarado). El modelo base soporta mas idiomas, pero la model card del checkpoint solo declara ingles |
| Licencia | apache-2.0 |
| Formato de pesos | MLX (pesos safetensors en formato MLX, libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atencion por consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). No hay informacion en la model card sobre el proceso de ajuste fino del modelo base: no se detallan numero de tokens, composicion del dataset, ni si se empleo RLHF, DPO o SFT. Tampoco se documenta ningun entrenamiento adicional especifico para este checkpoint, por lo que debe asumirse que el comportamiento del modelo es el del base Instruct y que la aportacion del autor se concentra en el motor de decodificacion.

La innovacion tecnica esta en ese motor, no en los pesos. El procedimiento descrito por el autor consta de seis pasos: un unico prefill del documento de contexto y de las descripciones semanticas del esquema en una cache KV de MLX; difusion (broadcasting) de esa cache sobre los M campos del esquema; logit slicing restringido al subvocabulario de opciones validas por campo, enmascarando el resto del vocabulario; calculo de probabilidades softmax normalizadas sobre el slice de candidatos con temperatura T; desambiguacion mediante arbol de tokens cuando varias opciones comparten prefijos multi-token, reutilizando estados de cache sin reasignacion de memoria; y ensamblado programatico del JSON a partir de los valores verificados. El resultado es una garantia de sintaxis valida del 100 % sin necesidad de parseo posterior.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada de Qwen2.5-1.5B-Instruct.
- Extraccion de informacion estructurada: relleno simultaneo de multiples campos de un esquema JSON en una sola pasada de evaluacion.
- Clasificacion categorica con esquemas de tipo `enum` de hasta 255 opciones por campo, mediante `FieldDefinition` y `StructuredSchema`.
- Campos booleanos (`type: "boolean"`) para decisiones binarias como `requires_escalation` o `requires_review`.
- Puntuaciones de confianza calibradas por campo, calculadas como softmax normalizada sobre el slice de candidatos (formula con temperatura incluida en la model card).
- Salida JSON con validez sintactica garantizada al 100 %, sin errores de parseo ni claves alucinadas.
- Guiado por descripcion: cada campo incluye un atributo `description` que orienta el razonamiento del modelo.
- Aceleracion por hardware Apple Silicon: requiere Mac con chip M1, M2, M3 o M4 y macOS 14.0 o superior.
- No se documenta soporte de tool calling nativo, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode). El pipeline declarado es `text-generation`, con etiquetas secundarias de `classification` y `json`.

## Casos de uso

- Triaje de soporte empresarial: el escenario mas complejo documentado por el autor, con 28 campos evaluados simultaneamente en 270 ms frente a 1.900 ms de la linea base. Adecuado para enrutar tickets hacia el departamento correcto, asignar prioridad P0–P3 y decidir si se requiere escalado a guardia.
- Enrutado de fraude en fintech: esquema de 4 campos resuelto en 75 ms (5,6x de mejora). Permite clasificar `risk_level`, marcar revision obligatoria y seleccionar la accion posterior dentro del flujo de autorizacion de pagos.
- Auditoria de seguridad de codigo: clasificacion de hallazgos en 68 ms con 4 campos, integrable en un paso de CI/CD donde el coste por muestra es critico.
- Clasificacion arancelaria aduanera: campo unico con 255 codigos del Sistema Armonizado, resuelto en 89 ms. El limite de 255 opciones por campo encaja con el caso de uso que el propio autor documenta.
- Extraccion de JSON en pipelines de datos sobre macOS: cualquier proceso local que necesite convertir texto no estructurado en registros validados sin tolerar errores de sintaxis, ejecutandose integramente en el equipo del usuario.
- Enrutado de decisiones y clasificacion de intenciones: seleccion de la accion o herramienta siguiente a partir de un conjunto acotado de opciones, con confianza por campo para activar revision humana por debajo de un umbral.
- Etiquetado con control de calidad: las probabilidades calibradas permiten descartar o derivar a anotacion manual las muestras donde el modelo no alcanza un umbral de confianza definido.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) para el modelo. Los unicos datos disponibles son las mediciones de latencia del motor de decodificacion sobre un Apple M4 Max con macOS Sequoia y el checkpoint de 4 bits:

| Escenario | Campos | Base autorregresiva | Decodificacion paralela | Mejora de latencia | Validez sintactica |
|---|---|---|---|---|---|
| Enrutado de fraude fintech | 4 campos | 420 ms (120 tok/s) | 75 ms | 5,6x | 100 % garantizada |
| Auditoria de seguridad de codigo | 4 campos | 380 ms (125 tok/s) | 68 ms | 5,6x | 100 % garantizada |
| Arancel de alta cardinalidad | 1 campo (255 opciones) | 500 ms (118 tok/s) | 89 ms | 5,6x | 100 % garantizada |
| Triaje de soporte empresarial | 28 campos | 1.900 ms (130 tok/s) | 270 ms | 7,0x | 100 % garantizada |

Estos datos miden latencia de inferencia del runtime, no calidad del modelo. No hay comparacion de precision o exactitud frente a la decodificacion autorregresiva mas alla de la validez sintactica.

## Requisitos de hardware

- Hardware obligatorio: Apple Silicon (series M1, M2, M3, M4). El motor esta construido sobre MLX y no funciona en GPU NVIDIA ni AMD.
- Sistema operativo: macOS 14.0 o superior; Python 3.10+.
- VRAM/memoria unificada: no se especifica en la model card. Como referencia de calculo, un modelo de 1,5B parametros ocupa aproximadamente 0,9–1,1 GB en 4 bits, 1,6–1,8 GB en 8 bits y unos 3,0–3,2 GB en fp16. Los benchmarks del autor usan la variante de 4 bits.
- Cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o superior, incluidas las configuraciones base de MacBook Air.
- GPU recomendadas: el autor reporta mediciones sobre un M4 Max. No se proporcionan cifras para otras variantes de chip.
- Despliegue: el SDK propietario del repositorio (`core.schema` con `StructuredSchema` y `FieldDefinition`) sobre MLX. El modelo base puede servirse con `mlx-lm` (incluido servidor local). No es compatible con vLLM ni TGI, que requieren CUDA. Una conversion a GGUF permitiria usar llama.cpp u Ollama, pero se perderia la decodificacion restringida en paralelo, que es la aportacion principal del artefacto.
- Latencia y throughput: 68–270 ms por inferencia estructurada y 118–130 tok/s en la linea base autorregresiva, ambos medidos en M4 Max. No hay datos para otros chips.

## Comparativa con modelos similares

La model card no incluye comparaciones con otros modelos. La tabla siguiente recoge lo que si es verificable a partir de la informacion proporcionada y del modelo base declarado:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen-2.5-1B-RLCD (este) | 1,5B | No disponible (base: 32.768 tokens) | apache-2.0 | HuggingFace, 0 descargas | Requiere Apple Silicon y el SDK del autor |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens nativos, extensible con YaRN | apache-2.0 | Ampliamente distribuido | Modelo base; sin decodificacion estructurada en paralelo; multiplataforma |
| Alternativas de ~1–2B (Llama-3.2-1B-Instruct, SmolLM2-1.7B-Instruct) | 1–1,7B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No hay datos comparativos en la model card |

No se han publicado resultados de benchmarks que permitan una comparacion cuantitativa de calidad frente a otras alternativas de la misma categoria.

## Limitaciones y advertencias

- El checkpoint tiene 0 descargas y 0 likes, y se creo y actualizo con un segundo de diferencia (18 de septiembre de 2026). Es un artefacto muy reciente y sin validacion externa conocida; no hay evidencia de uso en produccion por terceros.
- El nombre del repositorio indica "1B" mientras que el modelo base declarado es de 1,5B. La discrepancia puede inducir a error al estimar requisitos de memoria.
- La model card solo declara soporte de ingles. No hay datos sobre rendimiento en castellano u otros idiomas.
- Dependencia total de Apple Silicon y de macOS 14+. No hay ruta de despliegue en servidores Linux con GPU NVIDIA, lo que descarta su uso en la mayoria de infraestructuras cloud y en entornos de produccion estandar.
- La decodificacion en paralelo solo es aplicable cuando los valores de los campos pertenecen a conjuntos acotados (booleanos o enumeraciones de hasta 255 opciones). Para texto libre o generacion abierta, el modelo se comporta como un Qwen2.5-1.5B-Instruct corriente y pierde la ventaja de latencia.
- La garantia de sintaxis valida al 100 % se refiere a la forma del JSON, no a la correccion semantica del contenido. Las opciones siguen eligiendose por el modelo y pueden ser incorrectas aunque la confianza sea alta.
- Las puntuaciones de confianza son probabilidades softmax calibradas sobre el slice de candidatos; el autor no documenta una evaluacion de calibracion (por ejemplo, ECE) frente a etiquetas reales.
- El mismo autor advierte de que la decodificacion autorregresiva es propensa a degradacion de sintaxis, omision de campos y claves alucinadas; el motor no elimina el riesgo de que el valor elegido sea erroneo, solo el de que el formato sea invalido.
- La licencia apache-2.0 permite uso comercial del checkpoint, pero el repositorio del motor de decodificacion no aparece publicado en la informacion disponible (la URL de clonado contiene el marcador de posicion `your-org`), por lo que no puede verificarse la licencia del codigo.
- La busqueda web realizada no devolvio resultados relevantes: todas las entradas corresponden a Claude y a Anthropic, sin relacion con este modelo. No se han podido localizar papers, blogs tecnicos ni evaluaciones independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/botp/Qwen-2.5-1B-RLCD
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Checkpoint de 4 bits usado en los benchmarks: https://huggingface.co/mlx-community/Qwen2.5-1.5B-Instruct-4bit
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/drinkmoonshine/parallel-constrained-decoding
- Repositorio de codigo: https://github.com/your-org/parallel-constrained-decoding (URL con marcador de posicion en la model card; no verificable)

No se han encontrado otros enlaces relevantes (papers, blogs o evaluaciones independientes) en la busqueda web realizada.
