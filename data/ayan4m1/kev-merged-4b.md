# ayan4m1/kev-merged-4b

## Resumen

kev-merged-4b es un modelo publicado por ayan4m1 (Andrew DeLisa) que consiste en la fusión del adaptador kev-4b de jaredpalmer con su modelo base, Qwen/Qwen3.5-4B-Base. El objetivo declarado en la model card es precisamente ese: ofrecer en un único repositorio el resultado de la fusión, de modo que el usuario no tenga que cargar un adaptador LoRA por separado. Pertenece a la familia Kev, descrita por su autor original como modelos de decisión: reciben preguntas tipadas y devuelven probabilidades calibradas en una sola pasada forward, sin generar texto.

El modelo se apoya en la arquitectura Qwen3.5 en su variante de 4B. Llama la atención una discrepancia relevante: el nombre comercial indica 4B, pero el recuento real de safetensors en el repositorio es de 2.664.599.996 parámetros (aproximadamente 2,66 mil millones). La pipeline declarada en HuggingFace es image-text-to-text, lo que sugiere que hereda capacidades multimodales (visión) del base Qwen3.5, aunque la model card no lo confirma explícitamente.

Su relevancia es limitada por el momento: el repositorio acumula 0 descargas y 0 likes, no incluye métricas propias y la documentación se reduce a una frase sobre la fusión. Resulta útil sobre todo para quien quiera experimentar con la familia de modelos de decisión Kev sin gestionar adaptadores, y como punto de partida para fine-tuning propio bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (etiqueta qwen3_5), con cabeza de puntero (pointer head) para salida de decisión; el base declara pipeline image-text-to-text |
| Parametros totales | 2.664.599.996 (~2,66 mil millones), segun safetensors del repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El repositorio incluye la etiqueta "8-bit"; no se documentan otros formatos de cuantizacion |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La familia Kev, segun la documentacion de su autor original, se construye como un adaptador LoRA de rango 16 (r=16) mas una cabeza de puntero montados sobre un modelo base Qwen congelado. El modelo no genera texto: recibe preguntas tipadas y emite probabilidades calibradas en una unica pasada forward. kev-merged-4b aplica ese esquema sobre Qwen/Qwen3.5-4B-Base y fusiona los pesos del adaptador en el modelo base, de modo que el resultado es un checkpoint autonomo que no requiere cargar un adaptador aparte.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La model card se limita a indicar que se trata de una fusion. Tampoco se detalla como se preserva la cabeza de puntero tras la fusion ni si el resultado mantiene el comportamiento de clasificacion del adaptador original, algo que conviene verificar empiricamente antes de usarlo en produccion.

## Capacidades

- Clasificacion y decision con salida de probabilidad calibrada: la familia Kev esta disenada para recibir preguntas tipadas y devolver probabilidades, no texto generado.
- Enrutamiento (routing) de peticiones: segun el autor original, Kev-4B y Kev-9B rinden de forma similar en fuentes con forma de clasificacion, incluyendo routing, entailment y preguntas de ciencia.
- Inferencia de entailment / NLI: la familia se evalua en tareas de entailment dentro de las fuentes tipo clasificacion.
- Capacidades multimodales potenciales: la pipeline declarada (image-text-to-text) apunta a herencia de vision del base Qwen3.5, pero no hay confirmacion en la model card ni ejemplos de uso.
- Razonamiento y matematicas: los modelos pequenos de la familia quedan por detras en aritmetica de fechas con precision de dia, segun las notas del autor original.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking: no disponible.

## Casos de uso

- Enrutamiento en sistemas multi-agente: el modelo puede decidir a que subagente o herramienta derivar cada peticion en una sola pasada forward, dado que el routing es una de las tareas donde la familia Kev rinde mejor. Al no generar texto, la latencia es predecible.
- Triaje de tickets de soporte: clasificacion de entradas en categorias con umbrales ajustables gracias a que la salida son probabilidades calibradas en lugar de etiquetas discretas.
- Verificacion de afirmaciones (NLI): evaluar pares premisa-hipotesis para detectar contradicciones o implicaciones dentro de un pipeline de validacion documental.
- Reranking en busqueda: puntuar la relevancia de candidatos recuperados por un motor de busqueda y reordenarlos antes de mostrarlos al usuario.
- Moderacion de contenido con politica configurable: al devolver probabilidades, permite fijar umbrales distintos segun el nivel de riesgo tolerado en cada producto.
- Preguntas de ciencia con opcion multiple: las fuentes de tipo ciencia estan entre las que la familia Kev maneja con mayor cercania entre tamanos, segun las notas publicadas.
- Fine-tuning propio: al publicarse bajo Apache 2.0 y en safetensors estandar, sirve como punto de partida para adaptar tareas de decision especificas de dominio.
- Base de investigacion sobre calibracion: util para estudiar la calibracion de probabilidades de modelos pequenos fusionados con cabezas de decision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para kev-merged-4b en la informacion disponible. Las unicas cifras localizadas corresponden a otros tamanos de la familia Kev y al modelo Jev, no a este checkpoint, y se recogen aqui unicamente como contexto:

| Modelo | MMLU | Fuente |
|---|---|---|
| kev-merged-4b | no disponible | - |
| Kev-4B | no disponible | - |
| Kev-9B | 0,74 | GitHub jaredpalmer/kev |
| Kev-27B | 0,84 | GitHub jaredpalmer/kev |
| Jev | 0,90 | GitHub jaredpalmer/kev |

Notas cualitativas del autor original de la familia: Kev-4B y Kev-9B estan muy cerca en fuentes con forma de clasificacion (routing, entailment, preguntas de ciencia); todos los tamanos quedan por detras en preguntas de conocimiento, que dependen en gran medida del modelo base; y los modelos mas pequenos tambien quedan por detras en aritmetica de fechas con precision de dia.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 5,3 GB para los 2,66 mil millones de parametros del checkpoint.
- VRAM estimada en 8 bits: aproximadamente 2,7 GB, coherente con la etiqueta "8-bit" del repositorio.
- VRAM estimada en 4 bits: en torno a 1,4-1,6 GB de pesos, mas el overhead de contexto y activaciones.
- GPU consumer: cabe con holgura en tarjetas de 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores. En 4 bits podria ejecutarse incluso en GPUs de 6-8 GB con contexto reducido.
- GPU de datacenter: no requiere A100 ni H100; una L4, T4 o A10 es suficiente para servicio en produccion.
- Opciones de despliegue: transformers con safetensors es la ruta documentada. No hay confirmacion de compatibilidad con vLLM, llama.cpp, Ollama o TGI, aunque la etiqueta text-generation-inference aparece en los tags del repositorio.
- Latencia y throughput: no disponible. Al tratarse de un modelo de decision con una unica pasada forward y sin generacion autoregresiva, la latencia esperada por peticion es muy inferior a la de un modelo generativo del mismo tamano, pero no hay mediciones publicadas.
- Nota: el tamano del repositorio (12,7 GB) es notablemente superior al que corresponderia a 2,66 mil millones de parametros en fp16, lo que sugiere pesos duplicados, versiones en 8 bits junto al original, o artefactos adicionales. Conviene revisar la lista de ficheros antes de descargar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kev-merged-4b | ~2,66 mil millones | no disponible | no disponible | apache-2.0 | HuggingFace (0 descargas) |
| Kev-4B (adaptador) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Kev-9B | no disponible | no disponible | 0,74 | no disponible | HuggingFace |
| Kev-27B | no disponible | no disponible | 0,84 | no disponible | HuggingFace |
| Jev | no disponible | no disponible | 0,90 | no disponible | no disponible |
| Qwen/Qwen3.5-4B-Base | ~4B (nominal) | no disponible | no disponible | ver licencia del base | HuggingFace |

La comparacion directa con modelos generativos de proposito general no es homogenea, porque Kev es una familia de modelos de decision con salida de probabilidades y no de texto. Dentro de su propia categoria, el unico punto de referencia numerico publicado son los MMLU de Kev-9B, Kev-27B y Jev, que no incluyen a este checkpoint.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El modelo solo declara ingles, por lo que su comportamiento en otros idiomas no esta evaluado.
- Riesgo de alucinacion: al no generar texto, el riesgo no es de alucinacion textual, sino de calibracion deficiente o de decisiones erroneas con alta confianza en distribuciones fuera del dominio de entrenamiento.
- Limitacion idiomatica: unico idioma declarado, ingles. No hay soporte multilingue documentado.
- Longitud de contexto desconocida: no se publica la ventana de contexto, lo que impide planificar su uso con documentos largos.
- Documentacion minima: la model card se limita a una frase sobre la fusion. No hay detallle de datos de entrenamiento, hiperparametros, evaluacion ni limitaciones declaradas por el autor.
- Falta de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas que permitan contrastar su comportamiento.
- Discrepancia de parametros: el nombre sugiere 4B, mientras que safetensors reporta 2,66 mil millones de parametros. Verificar antes de dimensionar infraestructura.
- Herencia del modelo base: al ser una fusion sobre Qwen/Qwen3.5-4B-Base, los terminos aplicables al base deben revisarse ademas de la licencia Apache 2.0 declarada en este repositorio.
- Comportamiento tras la fusion no verificado: no hay confirmacion de que la cabeza de puntero y la calibracion del adaptador original se preserven exactamente tras fusionar los pesos.
- Uso comercial: la licencia apache-2.0 lo permite en principio, pero sin evaluacion publica ni garantias de calidad del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ayan4m1/kev-merged-4b
- Adaptador original kev-4b: https://huggingface.co/jaredpalmer/kev-4b
- Repositorio GitHub de la familia Kev: https://github.com/jaredpalmer/kev
- Releases del repositorio Kev: https://github.com/jaredpalmer/kev/releases
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Perfil del autor en HuggingFace: https://huggingface.co/ayan4m1/datasets
- Perfil del autor en Civitai: https://civitai.com/user/ayan4m1/models
