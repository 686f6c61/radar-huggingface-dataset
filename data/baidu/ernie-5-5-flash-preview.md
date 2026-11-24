# baidu/ERNIE-5.5-Flash-Preview

## Resumen

ERNIE 5.5 Flash Preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Baidu, presentado como el primer checkpoint post-entrenado construido sobre ERNIE 5.5 Flash Base. Cuenta con 280.000 millones de parámetros totales, de los cuales 14.000 millones se activan por token, y una ventana de contexto de 1.048.576 tokens (1M). Su arquitectura combina 43 capas (1 densa y 42 MoE) con atención híbrida: 37 capas de HCA con dimensión de cabeza 512 y 6 capas de MLA-DSA con dimensión 256, con 64 cabezas.

El modelo está orientado a tareas de codigo, modelado 3D, trabajo de conocimiento (hojas de calculo, documentos, presentaciones) y creacion de video, con un enfasis claro en flujos de trabajo agénticos de larga duracion. Incorpora una cabeza de borrador DSpark para decodificacion especulativa y pesos de expertos en FP4, lo que reduce el coste de servicio en tareas de agente prolongadas. Se distribuye bajo licencia Apache 2.0, con pesos en FP8 blockwise + expertos FP4 por defecto, y variantes FP8 y BF16.

Se trata de un checkpoint intermedio: Baidu indica que el post-entrenamiento sigue en curso y que algunas capacidades pueden quedar por debajo de su potencial final. Es relevante ahora porque ofrece contexto de 1M tokens con decodificacion rapida y una licencia permisiva, algo poco habitual en modelos de este tamano, aunque su disponibilidad practica esta limitada por los 165,9 GB del repositorio y por la necesidad de hardware con soporte de kernels FP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida: 37 capas HCA (head dim 512) + 6 capas MLA-DSA (head dim 256), 64 cabezas; 1 capa densa + 42 MoE |
| Parametros totales | 280B (299.559.241.286 segun safetensors) |
| Parametros activos | 14B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | FP8 blockwise + expertos MXFP4 (W4A8, quantization-aware); variantes FP8 y BF16; cache KV en FP8; indexador DSA en FP4 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos de arquitectura: tamano oculto 4096, 512 expertos enrutados (top-10) mas 1 compartido, vocabulario de 201.216 tokens. Modalidad texto a texto. El modo de razonamiento esta siempre activo y se devuelve en el campo `reasoning_content`.

## Arquitectura y entrenamiento

ERNIE 5.5 Flash Preview mantiene la arquitectura y el tokenizador de ERNIE 5.5 Flash Base. La red tiene 43 capas: una densa y 42 de tipo MoE, con 512 expertos enrutados (top-10 por token) mas un experto compartido. La atencion es hibrida, con 37 capas de HCA (dimensión de cabeza 512) y 6 capas de MLA-DSA (dimensión de cabeza 256), 64 cabezas en total. El tamano oculto es 4096 y el vocabulario de 201.216 tokens.

Las capacidades nuevas del Preview provienen del mid-training y del post-training; durante el mid-training se extendio la longitud de contexto de entrenamiento de 128K a 1M tokens. El modelo incorpora una cabeza de borrador DSpark para decodificacion especulativa, que acelera las tareas de agente de larga duracion con poca perdida de precision. Los expertos enrutados usan MXFP4 (W4A8) con entrenamiento consciente de cuantizacion, y hay cache KV en FP8 e indexador DSA en FP4. La model card menciona entrenamiento en 300.000 espacios de trabajo para dominios como finanzas y derecho (10 millones de archivos de referencia en mas de 40 tipos) y en mas de 150.000 entornos de creacion para video, pero no detalla el volumen total de tokens ni la composicion exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento siempre activo (la traza se expone en `reasoning_content`).
- Codigo: desde correcciones en bases de codigo reales hasta construccion de aplicaciones complejas desde cero, con planificacion, ejecucion e iteracion sostenida en tareas largas.
- Conocimiento de motores de juego: Unreal Engine, Unity y Godot. Segun la model card, completo una tarea de 11 horas escribiendo un juego wuxia en tercera persona en C++ sobre Unreal Engine 5.8, y construyo cerca de 100 minijuegos moviles a partir de documentos de diseno.
- Modelado 3D y diseno: deduce forma, proporcion y relaciones espaciales a partir de texto y escribe scripts para Blender y software CAD.
- Trabajo de conocimiento: hojas de calculo, documentos y presentaciones de calidad profesional a partir de material disperso.
- Creacion de video: recopila, genera y organiza material, fija lo visual y el ritmo, y entrega un video terminado, trabajando una o dos horas por pieza.
- Soporte de agentes y tareas multi-paso de larga duracion, con decodificacion especulativa para mantener velocidad.
- Capacidades multilingues limitadas a ingles y chino.
- No se menciona soporte de vision, audio ni tool calling explicito en la informacion disponible.

## Casos de uso

- Desarrollo de videojuegos asistido: el modelo puede planificar y escribir sistemas completos en C++ para Unreal Engine, Unity o Godot, iterando durante horas sobre el mismo proyecto gracias a su contexto de 1M tokens y a su conocimiento especifico de esos motores.
- Generacion de codigo en produccion: util para corregir y refactorizar codigo en bases existentes; su ventana de 1M tokens permite cargar modulos enteros o varios archivos relacionados en una sola pasada, reduciendo la perdida de contexto entre cambios.
- Automatizacion de modelado 3D: a partir de una descripcion textual, el modelo deduce proporciones y relaciones espaciales y genera scripts para Blender o CAD, lo que sirve para prototipado rapido de piezas mecanicas o arquitectonicas.
- Generacion de documentacion y material ofimatico: puede transformar material disperso (notas, referencias, datos) en hojas de calculo, documentos o presentaciones, aprovechando el entrenamiento declarado en 300.000 espacios de trabajo de finanzas y derecho.
- Produccion de video divulgativo: recopilacion y organizacion de material, definicion de ritmo y montaje final en sesiones de una a dos horas, adecuado para explicaciones de divulgacion cientifica o piezas de actualidad.
- Agentes autonomos de larga duracion: la combinacion de contexto de 1M tokens, modo de razonamiento siempre activo y decodificacion especulativa con DSpark lo hace apto para tareas que requieren decenas de pasos sin perder el hilo.
- Analisis de repositorios o expedientes extensos: con 1M tokens de contexto puede procesar conjuntos documentales grandes en una sola llamada, util en revision de contratos o auditoria de codigo.

## Benchmarks y rendimiento

La model card referencia una tabla de 20 benchmarks y una grafica (`assets/eval-results.png`), pero los valores numericos no estan incluidos en la informacion disponible. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio por defecto ocupa 165,9 GB (FP8 blockwise + expertos FP4). La variante BF16 requiere aproximadamente el doble, en torno a 560-600 GB. La variante FP8 sola se situa en el rango de 280-300 GB. Estas cifras son estimaciones a partir del tamano del repositorio y del numero de parametros, no datos publicados.
- GPU recomendadas: para la variante FP4/FP8 se necesita hardware con kernels FP4 o FP8 (generaciones recientes de aceleradores de datacenter). Para BF16, nodos multi-GPU de alta memoria.
- No cabe en GPU de consumo: 280B de parametros totales exceden la VRAM de cualquier GPU consumer actual, incluso con cuantizacion agresiva.
- Opciones de despliegue: la model card no detalla vLLM, llama.cpp, Ollama ni TGI. Indica que el repositorio por defecto contiene pesos FP4 y que en hardware sin kernels FP4 debe usarse el repositorio FP8 o BF16; para fine-tuning, partir del BF16.
- Latencia y throughput: no disponibles. La model card solo afirma que el modelo "decodifica rapido" gracias a FP4 y a la cabeza DSpark, sin cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas. Los unicos puntos de comparacion objetivos son estructurales:

| Modelo | Parametros totales | Activos | Contexto | Licencia |
|---|---|---|---|---|
| ERNIE 5.5 Flash Preview | 280B | 14B | 1M | Apache 2.0 |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un checkpoint intermedio de post-entrenamiento: Baidu advierte que algunas capacidades pueden quedar por debajo de lo esperado porque el entrenamiento no ha terminado.
- Idiomas limitados a ingles y chino; no hay soporte declarado de castellano ni de otras lenguas.
- Riesgo de alucinacion no cuantificado en la informacion disponible; como modelo generativo de gran tamano, es esperable en tareas de conocimiento especializado.
- Sesgos conocidos: no disponibles en la model card.
- El repositorio por defecto usa pesos FP4 para los expertos; en hardware sin kernels FP4 hay que recurrir a las variantes FP8 o BF16, lo que cambia los requisitos de memoria.
- El modo de razonamiento esta siempre activo, lo que incrementa el coste por consulta en tokens generados.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar el fichero LICENSE del repositorio por si incorpora terminos adicionales.
- El modelo es solo de texto; no procesa imagenes, audio ni video como entrada, aunque genere material para flujos de video.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Base
- Variante FP8: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-FP8
- Variante BF16: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-BF16
- ModelScope: https://www.modelscope.cn/models/baidu/ERNIE-5.5-Flash-Preview
- Blog de lanzamiento: https://ernie.baidu.com/release/ernie-5-5-flash-preview/
- Chat: https://ernie.baidu.com/web
- API Qianfan: https://cloud.baidu.com/product/qianfan.html
- X (Twitter): https://x.com/Baidu_ERNIE
- Licencia: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview/blob/main/LICENSE
- Paper (referencia arXiv en tags): arxiv:2610.24766, arxiv:2610.17959, arxiv:2610.40577
