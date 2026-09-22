# harrytaylor/retrieval-proto

## Resumen

`harrytaylor/retrieval-proto` es un repositorio de código y pesos de inicialización publicado en HuggingFace por el usuario harrytaylor, que implementa una arquitectura denominada Cnn Transformer orientada a tareas de recuperación de información (retrieval). No se trata de un modelo entrenado ni evaluado, sino de una implementación de referencia con la que ejecutar pruebas de humo reproducibles: la propia model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint `model.safetensors` es una inicialización válida, no un modelo con entrenamiento completado.

El tamaño real del checkpoint es de 24.832 parámetros totales, una magnitud propia de un prototipo de laboratorio más que de un modelo desplegable en producción, pese a que la configuración interna se etiqueta como "huge". La arquitectura combina convoluciones y atención de tipo transformer con atención de ventana deslizante, fusión de bajo rango, activación gelu tanh y normalización layernorm. La receta de experimento por defecto usa el optimizador lion con un schedule exponencial, valores de partida que el autor advierte que no constituyen evidencia de un entrenamiento realizado.

Su relevancia actual es limitada y muy específica: sirve como punto de partida experimental para quien quiera reproducir o auditar una arquitectura híbrida CNN-transformer aplicada a retrieval, y como esqueleto de código transparente para montar comparativas controladas. No aporta capacidades de generación de texto, razonamiento, código ni agentes, y no debe confundirse con un modelo multimodal de recuperación entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (hibrida convolucional + transformer) |
| Parametros totales | 24.832 |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible (la configuracion usa atencion de ventana deslizante, pero no se especifica el tamano de ventana ni la longitud maxima) |
| Tipos de cuantizacion | No disponible (solo se distribuye checkpoint en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible (no se declara ningun idioma en la model card ni en los metadatos) |
| Licencia | MIT |
| Formato de pesos | safetensors (mas implementacion en Python/PyTorch) |
| Escala de configuracion declarada | "huge" (etiqueta de la config, no reflejada en el numero real de parametros) |
| Mecanismo de atencion | Ventana deslizante (sliding window) |
| Fusion | Low rank |
| Activacion | gelu tanh |
| Normalizacion | Layernorm |
| Optimizador de la receta por defecto | Lion, con schedule exponencial |
| Framework | PyTorch |
| Tamano del repositorio | 0,0 GB |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es una hibrida CNN-transformer: capas convolucionales combinadas con bloques de atencion que operan sobre una ventana deslizante en lugar de atencion densa completa, lo que en principio reduce el coste cuadratico en secuencias largas. La fusion entre ramas se realiza mediante un esquema de bajo rango y el bloque utiliza activacion gelu tanh con normalizacion layernorm. El modelo se etiqueta internamente con la escala "huge", pero el checkpoint distribuido contiene 24.832 parametros, de modo que esa etiqueta corresponde a un preset de configuracion y no a un modelo de gran tamano.

En cuanto al entrenamiento, no hay ningun entrenamiento documentado. El repositorio incluye `training_args.json` con una receta por defecto (optimizador lion y schedule exponencial) que el autor describe como valores de arranque del script y no como evidencia de una ejecucion completada. No se especifica numero de tokens, composicion del dataset, ni fases de RLHF, DPO o ajuste por preferencias. Tampoco se documenta ninguna innovacion adicional (decodificacion especulativa, atencion lineal, MoE) mas alla de la combinacion de ventana deslizante y fusion de bajo rango.

El autor propone como evaluacion util partir de Flickr30k, reportar la metrica de la tarea con al menos tres semillas e incluir una linea base de capacidad equivalente, conservando los logs de entrenamiento y las versiones del entorno. El repositorio esta pensado para transparencia de codigo y pruebas de humo repetibles.

## Capacidades

- Recuperacion de informacion (retrieval): la arquitectura esta disenada especificamente para tareas de emparejamiento o recuperacion, segun la etiqueta `retrieval` y el enfoque del repositorio.
- Ejecucion de pruebas de humo: el artefacto principal `model.py` incluye un bloque `__main__` con un ejemplo ejecutable de verificacion.
- Punto de partida para entrenamiento: el script contiene el modelo y un punto de entrada de ejemplo o de entrenamiento, con configuracion de arquitectura en `config.json` y receta de experimento en `training_args.json`.
- Generacion de texto: no documentada.
- Razonamiento, matematicas y codigo: no documentados.
- Tool calling / function calling: no soportado ni documentado.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas (no se declara ningun idioma).
- Capacidades especiales (vision, audio, modo thinking): no documentadas. La mencion a Flickr30k como dataset de evaluacion sugerido apunta a una tarea de retrieval sobre texto e imagen, pero el repositorio no declara componentes de vision ni pesos multimodales entrenados.

## Casos de uso

- Reproduccion de experimentos de retrieval: el repositorio permite montar un pipeline de evaluacion sobre Flickr30k y comparar contra una linea base de capacidad equivalente, siguiendo la guia del propio autor (tres semillas como minimo, mismos datos y presupuesto de ajuste).
- Auditoria de arquitecturas hibridas CNN-transformer: util para investigadores que quieran inspeccionar como se implementa una atencion de ventana deslizante combinada con fusion de bajo rango en PyTorch, sin capas de abstraccion de librerias de alto nivel.
- Pruebas de humo en CI: al ser un modelo de 24.832 parametros y un repositorio de 0,0 GB, se puede cargar en cualquier runner de integracion continua para verificar que el codigo de modelado compila y ejecuta sin errores tras cada cambio.
- Base para experimentos de ablation: sirve como esqueleto para variar el mecanismo de atencion, el tipo de fusion o la normalizacion y medir el efecto en una metrica de retrieval, manteniendo el resto del pipeline fijo.
- Prototipado de codigo de carga personalizada: el autor advierte que, al ser una implementacion propia, las APIs genericas de carga automatica requieren un adaptador explicito; el repositorio es util para desarrollar y probar ese adaptador.
- Docencia y formacion: adecuado como ejemplo minimo de implementacion de un transformer hibrido con atencion de ventana deslizante, dado su tamano reducido y su codigo transparente.
- No es adecuado para: atencion al cliente, generacion de codigo en produccion, agentes, RAG en produccion ni ninguna tarea que requiera un modelo entrenado, porque el checkpoint es una inicializacion sin entrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se reclama ninguna puntuacion de benchmark y que el checkpoint `model.safetensors` es una inicializacion valida para pruebas de humo, no un checkpoint entrenado. El autor sugiere Flickr30k como primer conjunto de evaluacion, con la metrica de la tarea reportada sobre al menos tres semillas y frente a una linea base de capacidad equivalente, pero no aporta resultados de esa propuesta.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable. Con 24.832 parametros, los pesos ocupan aproximadamente 99 KB en fp32 y unos 50 KB en fp16, sin contar activaciones ni buffers, que para este tamano tambien son minimos.
- GPU recomendadas: ninguna en particular. El modelo es ejecutable en CPU; cualquier GPU consumer sirve, y tambien GPU de datacenter (A100, H100) sin ninguna ventaja practica por el tamano.
- Cabe en GPU consumer: si, en cualquier GPU consumer, incluso en modelos con pocos GB de VRAM, y tambien en CPU y en entornos sin acelerador.
- Opciones de despliegue: el repositorio usa una implementacion propia en PyTorch, con `model.py` como artefacto principal. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otras herramientas de servido. El autor senala que las APIs genericas de carga automatica necesitan un adaptador explicito antes de poder usarse con este modelo.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de modelos comparables en la informacion proporcionada. El repositorio no incluye ninguna linea base, y la model card unicamente recomienda construir una de capacidad equivalente para que la evaluacion sea significativa. Cualquier comparacion numerica con modelos de retrieval entrenados (por ejemplo, familia CLIP o similares) seria invalida en este punto, porque este repositorio no contiene un checkpoint entrenado ni metricas publicadas.

| Aspecto | harrytaylor/retrieval-proto | Alternativas de retrieval entrenadas |
|---|---|---|
| Parametros | 24.832 | No disponible en la informacion proporcionada |
| Longitud de contexto | No disponible | No disponible en la informacion proporcionada |
| Rendimiento en retrieval | No disponible (sin entrenar) | No disponible en la informacion proporcionada |
| Licencia | MIT | No disponible en la informacion proporcionada |
| Disponibilidad de pesos entrenados | No (solo inicializacion) | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: es una inicializacion, por lo que sus salidas carecen de valor predictivo en cualquier tarea real.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, segun reconoce la propia model card.
- No se declaran idiomas soportados, por lo que se desconoce su comportamiento linguistico en cualquier escenario.
- No hay benchmarks publicados ni metricas reproducibles; cualquier afirmacion de rendimiento seria una invencion.
- La etiqueta de escala "huge" no se corresponde con el tamano real del checkpoint (24.832 parametros), lo que puede inducir a error si se interpreta como indicador de capacidad.
- Ausencia de soporte documentado para herramientas de servido estandar (vLLM, llama.cpp, Ollama, TGI); requiere adaptador explicito para APIs genericas de carga automatica.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el propio autor advierte que deben revisarse por separado los terminos de los datos de origen si el repositorio se usa con datasets externos (por ejemplo, Flickr30k).
- Los resultados de un futuro checkpoint entrenado deberan documentarse por separado de los valores por defecto incluidos en el repositorio.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni de validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harrytaylor/retrieval-proto
- `model.py` (artefacto principal, implementacion y ejemplo de prueba de humo): incluido en el repositorio anterior
- `config.json` (configuracion de arquitectura): incluido en el repositorio anterior
- `training_args.json` (receta de experimento por defecto): incluido en el repositorio anterior
- `model.safetensors` (checkpoint de inicializacion): incluido en el repositorio anterior
- Paper, blog o demo adicionales: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los resultados obtenidos eran consultas genericas sin vinculacion con el repositorio.
