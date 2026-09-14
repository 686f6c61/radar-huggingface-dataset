# Jeesup/svd-safety-l2_remove40_swapgapnet_a010_b010_r01

## Resumen

`Jeesup/svd-safety-l2_remove40_swapgapnet_a010_b010_r01` es un checkpoint de investigacion construido sobre `meta-llama/Llama-2-7b-chat-hf`. El autor aplica primero una compresion SVD-LLM que elimina el 40,02 % de los parametros de las proyecciones densas (dejando el 59,98 % de los mismos) y despues aplica 1 de las 10 rondas previstas de una edicion iterativa de parametros denominada swap parameter-neutral, seleccionada mediante la regla `gap_iter`. No es un modelo conversacional de proposito general: es una celda de una rejilla experimental que cruza reglas de seleccion de componentes y presupuestos de restauracion.

El problema que aborda es concreto y poco explorado: la compresion por SVD degrada el comportamiento de seguridad de un modelo alineado, y el estudio trata de cuantificar esa degradacion y comprobar que regla de seleccion de componentes la repara mejor. Cada ronda del experimento restaura hasta un 0,1 % de los parametros densos; el presupuesto total de la ejecucion completa es del 1,0 %, y este checkpoint corresponde a la primera ronda (326 componentes restaurados y 326 sustituidos, 3.714.304 parametros intercambiados, semilla 42).

Es relevante ahora porque conecta dos lineas activas: la compresion agresiva de modelos para reducir coste de inferencia y la evaluacion de seguridad bajo transformaciones de pesos. La model card advierte explicitamente de que varias ramas de la rejilla estan degradadas en seguridad de forma deliberada, por lo que el artefacto debe tratarse como sujeto experimental y no como asistente desplegable. El repositorio ocupa 13,5 GB y declara 6.738.415.616 parametros en los ficheros safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), derivada de `meta-llama/Llama-2-7b-chat-hf`; sin modificaciones estructurales documentadas mas alla de la compresion SVD y el swap de componentes |
| Parametros totales | 6.738.415.616 (recuento real de los safetensors); la model card indica una fraccion de parametros densos resultante de 0,5998 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-chat; no se documenta ninguna extension) |
| Tipos de cuantizacion | no disponible; el autor no publica variantes cuantizadas |
| Idiomas soportados | no disponible; la model card no declara idiomas (el modelo base esta optimizado para ingles) |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`) |

Datos de procedencia declarados por el autor:

| Campo | Valor |
|---|---|
| Base sin comprimir | `meta-llama/Llama-2-7b-chat-hf` |
| Compresion | SVD-LLM, 40,02 % de parametros eliminados |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos |
| Componentes restaurados / sustituidos | 326 / 326 |
| Fraccion de parametros resultante | 0,5998 |
| Semilla | 42 |
| Rondas iterativas aplicadas | 1 de 10 |
| Bloque por ronda | 0,100 % de los parametros densos |
| Parametros intercambiados | 3.714.304 (0,06 % de las proyecciones densas) |
| Valor del swap | `net` (valor de insercion + valor de eliminacion del desalojo ordenado por sigma) |
| Escala de insercion | 0,1 |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo. El punto de partida es un transformer decoder-only Llama 2 de 7B ya ajustado por instrucciones (`Llama-2-7b-chat-hf`), y sobre el se aplican dos transformaciones post-hoc: (1) compresion SVD-LLM que trunca el rango de las matrices de proyeccion y elimina el 40,02 % de esos parametros, y (2) una edicion selectiva de parametros en rondas, en la que se desalojan 326 componentes ordenados por sigma y se insertan otros 326 con valor `net` a una escala de 0,1 respecto de su fuerza original. La primera ronda mueve 3.714.304 parametros, un 0,06 % de las proyecciones densas.

El interes tecnico esta en el criterio de seleccion `gap_iter` y en la nocion de swap "parameter-neutral": se busca restaurar capacidad (en este caso, comportamiento de seguridad) sin aumentar el numero de parametros. El checkpoint publicado es intermedio (ronda 1 de 10) y forma parte de una rejilla mas amplia sobre reglas de seleccion y presupuestos; no se documentan en la informacion disponible ni la composicion del dataset de calibracion, ni si hubo RLHF/DPO adicional, ni innovaciones de decodificacion (por ejemplo decodificacion especulativa o atencion lineal).

## Capacidades

- Generacion de texto conversacional heredada de Llama-2-7b-chat: el modelo conserva la interfaz de chat del base, aunque la compresion y el swap alteran sus respuestas.
- Razonamiento basico y respuesta a instrucciones, en la medida en que sobreviven a la compresion SVD del 40,02 % de las proyecciones.
- Capacidad de sujeto experimental de seguridad: es posible medir tasa de exito de ataques (ASR) y tasa de sobrerrechazo sobre el checkpoint tal cual.
- Utilidad como celda de ablacion: permite aislar el efecto de la regla `gap_iter` con un presupuesto de 0,1 % (ronda 1 de 10).
- Compatibilidad con el ecosistema `transformers` y con endpoints (`text-generation-inference`, `endpoints_compatible`), lo que facilita la evaluacion automatizada.
- Capacidades multilingues: no disponibles (no declaradas por el autor).
- Tool calling, function calling, modo thinking, vision o audio: no disponibles; no se documentan ni se derivan del modelo base.

## Casos de uso

- Investigacion sobre compresion y seguridad: usar este checkpoint como condicion experimental "ronda 1, regla `gap_iter`" y comparar su ASR con el de la base sin comprimir y con las demas celdas de la rejilla, manteniendo fija la semilla 42.
- Auditoria de pipelines de compresion: integrar el modelo en un arnes que aplique AdvBench y StrongREJECT con un juez HarmBench y compruebe si la perdida de alineamiento supera umbrales aceptables antes de adoptar SVD-LLM en produccion.
- Estudio de sobrerrechazo (over-refusal): emplear WildGuard sobre peticiones benignas para medir si la restauracion de seguridad recupera utilidad o simplemente vuelve al modelo mas conservador; el valor declarado de sobrerrechazo macro es 0,0982.
- Analisis de interpretabilidad de pesos: los 326 componentes restaurados y 326 desalojados constituyen un conjunto etiquetado y reproducible (semilla 42) para estudiar que subespacios de las proyecciones concentran el comportamiento de rechazo.
- Reproducibilidad de experimentos SVD: servir como referencia intermedia para verificar que una reimplementacion de SVD-LLM reproduce la fraccion 0,5998 y el recuento de 3.714.304 parametros intercambiados.
- Docencia y formacion tecnica: ilustrar en un curso de compresion de modelos como una reduccion del 40 % de parametros de proyeccion altera metricas de seguridad sin reentrenamiento.
- Evaluacion comparativa de reglas de seleccion: enfrentar `gap_iter` contra otras reglas de la rejilla bajo el mismo presupuesto del 1,0 % para decidir cual conviene en un pipeline propio.

## Benchmarks y rendimiento

La model card publica metricas de seguridad, no de capacidad general. No hay resultados de MMLU, HumanEval, GSM8K ni similares en la informacion disponible, y la busqueda web no aporto datos adicionales.

| Metrica | Valor declarado |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,3692 |
| StrongREJECT ASR (juez HarmBench) | 0,1981 |
| Sobrerrechazo macro (WildGuard) | 0,0982 |

No se han publicado en la informacion disponible valores de referencia de capacidad (MMLU, HumanEval, GSM8K, etc.) ni la comparacion directa con el modelo base sin comprimir, por lo que no es posible calcular la degradacion relativa a partir de estos datos.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 13,5 GB de pesos (el repositorio ocupa 13,5 GB), mas overhead de activaciones y cache KV para 4096 tokens de contexto.
- VRAM estimada en INT8: aproximadamente 7 GB de pesos.
- VRAM estimada en INT4: aproximadamente 4 GB de pesos.
- GPU recomendadas: una RTX 4090 (24 GB) o A6000/L40S es suficiente para FP16 con contexto completo; A100 40/80 GB y H100 quedan sobredimensionadas para un 7B y solo se justifican para lotes grandes o evaluaciones masivas.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 (16 GB, justo en FP16) y en tarjetas de 12 GB si se cuantiza a 8 bits o menos.
- Opciones de despliegue: `transformers` de forma nativa; vLLM o TGI para servidores con batching; llama.cpp u Ollama requeririan conversion previa a GGUF, no publicada ni verificada por el autor.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`svd-safety-l2_remove40_swapgapnet_a010_b010_r01`) | 6.738.415.616 en safetensors; fraccion densa declarada 0,5998 | 4096 (heredado) | Llama 2 Community License | AdvBench ASR 0,3692; StrongREJECT ASR 0,1981; sobrerrechazo 0,0982 | Publico en HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| `meta-llama/Llama-2-7b-chat-hf` (base) | ~6,74 B | 4096 | Llama 2 Community License | no disponible en esta informacion | Publico, ampliamente desplegado |
| Llama-2-13b-chat | ~13 B | 4096 | Llama 2 Community License | no disponible en esta informacion | Publico; requiere roughly el doble de VRAM |
| Mistral-7B-Instruct-v0.2 | ~7,2 B | 32 768 | Apache 2.0 | no disponible en esta informacion | Publico; licencia permisiva y contexto mucho mayor |

Los datos de los modelos comparados corresponden a caracteristicas generales conocidas de esos modelos; no se dispone de sus cifras de seguridad o capacidad medidas bajo el mismo arnes que este checkpoint, por lo que la comparacion de rendimiento queda pendiente.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor indica que no es un modelo de chat de proposito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Seguridad degradada de forma intencionada en varias ramas del estudio: la compresion por si sola eleva la tasa de exito de ataques, y este checkpoint es una celda intermedia de ese proceso.
- Riesgo de alucinacion y de respuestas incoherentes: no se publican evaluaciones de calidad de generacion tras eliminar el 40,02 % de los parametros de proyeccion.
- Discrepancia de recuento: los safetensors declaran 6.738.415.616 parametros, practicamente identico al Llama-2-7b-chat sin comprimir, mientras la model card afirma una fraccion de parametros densos de 0,5998. Conviene verificar la forma real de las matrices antes de asumir un ahorro de memoria.
- Checkpoint intermedio: solo se aplico 1 de las 10 rondas previstas, por lo que no representa el resultado final de la configuracion `gap_iter` con presupuesto del 1,0 %.
- Idiomas no declarados: sin datos sobre comportamiento fuera del ingles.
- Contexto limitado a 4096 tokens, sin extension documentada.
- No hay variantes cuantizadas publicadas; cualquier cuantizacion corre por cuenta de quien la haga y puede alterar las metricas de seguridad reportadas.
- Licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` vinculantes para cualquier uso derivado. Existen restricciones de uso comercial y de redistribucion propias de esa licencia; revisar el texto antes de cualquier despliegue.
- Sin adopcion verificable: 0 descargas y 0 likes, sin validacion independiente de los resultados.
- Uso responsable y legal: al ser un modelo con seguridad potencialmente degradada, no debe exponerse a usuarios finales ni usarse para generar contenido danino; su lugar es un entorno de evaluacion controlado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapnet_a010_b010_r01
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- No se han encontrado enlaces relevantes adicionales en la busqueda web: los resultados devueltos correspondian a paginas sobre zonas horarias (EST, CST, PST, ET, AEST) y no guardan relacion con el modelo. No se dispone de enlace a paper, repositorio de codigo ni demo del estudio SVD-LLM ni del metodo de swap descrito.
