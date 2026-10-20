# rokuz7/nlg

## Resumen

`rokuz7/nlg` es el generador de redes de un Neural Light Grid (NLG), la estructura de sondas de irradiancia presentada por Iwanicki et al. en "Neural Light Grid" (Advances in Real-Time Rendering in Games, SIGGRAPH 2024). No es un modelo de lenguaje: es un componente de renderizado que convierte la función de ponderación de una sonda de irradiancia (definida sobre 8192 puntos de soporte) en los 113 coeficientes de la pequeña red 3 → 8 → 8 → 1 que la almacena. El problema que resuelve es el coste de ajustar esas redes por sonda: en lugar de entrenar cada red de forma iterativa, este modelo la produce en una sola pasada.

El generador es un MLP de 6 capas y anchura 512 con LeakyReLU y conexiones residuales que recibe los primeros 512 coeficientes PCA de la función de la sonda y emite los 113 coeficientes de su red. Se distribuye en dos artefactos: `nlg.vgf` (6,1 MB), el grafo TOSA cuantizado a int8 con la PCA incluida, pensado para `VK_ARM_data_graph`, y `nlg.bin` (15,1 MB), con el patrón de puntos de soporte, la PCA, las capas en coma flotante y la escala de salida del grafo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y no incluye pesos en safetensors ni GGUF.

Su relevancia es de nicho pero concreta: permite ejecutar la generación de la rejilla de iluminación en tiempo real sobre hardware con soporte de data graphs (GPU Arm Mali), con cuantización int8 por canal verificada bit a bit contra la aritmética entera del grafo. Para un equipo que implemente iluminación global en un motor Vulkan, es una pieza de referencia; para cualquier uso de IA generativa de texto, es irrelevante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 6 capas y anchura 512, LeakyReLU (pendiente 0,01), conexiones residuales (5 bloques) y proyeccion PCA previa de 8192 a 512; grafo TOSA con CONV2D 1x1 int8 y RESCALE por canal |
| Parametros totales | Aproximadamente 1,63 M en el MLP generador (calculo derivado de las dimensiones descritas: 512→512, cinco bloques 512→512 y 512→113). La PCA anade una base de 8192x512 valores y una media de 8192. El dato no se publica en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: la entrada es fija, `[1, 256, 1, 8192]` int8 (256 sondas por dispatch, 8192 puntos de soporte por sonda) |
| Tipos de cuantizacion | Cuantizacion post-entrenamiento por canal a int8 (grafo TOSA, acumuladores int32); ruta alternativa en coma flotante (f32/f16) a partir de `nlg.bin` |
| Idiomas soportados | No aplica: no procesa lenguaje natural |
| Licencia | MIT |
| Formato de pesos | `.vgf` (grafo TOSA int8 en contenedor VGF) y `.bin` little endian con cabecera `NLGG` version 2 (puntos f32, media f32, base PCA f16, 7 capas lineales f32, escala de salida f32) |

## Arquitectura y entrenamiento

El generador recibe la funcion de una sonda expresada en 8192 puntos de soporte, la proyecta sobre los 512 primeros componentes principales (la media esta plegada en el sesgo del CONV2D 1x1) y pasa el resultado por una pila de 6 capas de 512 unidades: `h = leaky(first(pca(phi)))`, seguido de cinco bloques residuales `h += leaky(block(h))`, y una capa final que emite los 113 coeficientes `theta`. Cada sonda se representa despues con una red de 3 → 8 → 8 → 1 (W1 8x3, b1 8, W2 8x8, b2 8, W3 8, b3) que aproxima una funcion de ponderacion con trilinealidad donde la sonda ve, difusion alrededor de esquinas a traves del grafo de visibilidad y cero dentro de la geometria.

El entrenamiento usa como perdida la diferencia al cuadrado entre la red generada y la funcion objetivo, evaluada en 2048 puntos de soporte validos aleatorios por paso y propagada de extremo a extremo a traves de la red 3-8-8-1. Son 40 epocas con Adam y schedule coseno. La innovacion practica es el pipeline de cuantizacion: cuantizacion post-entrenamiento por canal, evaluada bit a bit contra la aritmetica entera del grafo, de modo que el resultado en int8 coincide con la referencia. No se documentan el volumen de tokens ni la composicion del dataset (no aplica: los datos son funciones de iluminacion derivadas de escenas, sin cifras publicadas).

## Capacidades

- Generacion de las redes de sonda de un Neural Light Grid en una sola pasada, a partir de la funcion de la sonda muestreada en 8192 puntos.
- Compresion de la funcion de una sonda en 113 coeficientes, frente a los 8192 valores de entrada.
- Procesamiento por lotes de 256 sondas por dispatch con entrada int8 y acumuladores int32.
- Ejecucion como grafo TOSA en hardware compatible con `VK_ARM_data_graph` (extension Vulkan de data graphs de Arm).
- Ruta de respaldo en coma flotante para GPU sin soporte de data graphs, usando las 7 capas lineales de `nlg.bin`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni capacidades multilingues.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Iluminacion global en tiempo real en motores Vulkan: el generador transforma las funciones de sonda calculadas en el frame en redes 3-8-8-1 listas para evaluar, evitando un bucle de ajuste por sonda y permitiendo actualizar la rejilla cuando cambia la escena o la hora del dia.
- Soporte a data graphs en GPU Arm Mali: el grafo int8 de 6,1 MB se encaja en el presupuesto de memoria de un dispositivo movil y se ejecuta mediante `VK_ARM_data_graph`, lo que hace viable la GI dinamica en movil y XR.
- Prototipado e investigacion sobre NLG: sirve para reproducir y extender el trabajo de SIGGRAPH 2024 sin reentrenar el generador desde cero, sustituyendo solo las funciones de sonda de entrada.
- Herramientas de editor: regenerar la iluminacion de un nivel tras mover una luz o un asset, con una pasada de inferencia en lugar de un bake completo, lo que reduce el ciclo de iteracion del artista.
- Transmision y almacenamiento de iluminacion precalculada: empaquetar la iluminacion de una escena como 113 coeficientes por sonda (red compacta) en lugar de 8192 muestras, util para streaming de niveles o DLC con datos de iluminacion.
- Validacion de pipelines de cuantizacion: el modelo incluye una comparacion bit a bit entre la inferencia int8 del grafo y la aritmetica entera de referencia, util como caso de prueba para cadenas TOSA/VGF propias.
- Efectos de iluminacion dependientes de la oclusion en escenas cerradas: al modelar la difusion por esquinas a traves del grafo de visibilidad, mejora sobre esquemas puramente trilineales en interiores con geometria bien cerrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la cuantizacion se evaluo bit a bit contra la aritmetica entera del grafo, sin cifras de error, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia de tamano, el grafo int8 ocupa 6,1 MB y el conjunto de datos en coma flotante 15,1 MB; el coste real depende de los buffers intermedios de 256 sondas x 8192 puntos.
- GPU recomendadas: hardware compatible con `VK_ARM_data_graph` (familia Arm Mali con soporte de data graphs). Para la ruta en coma flotante, cualquier GPU con Vulkan compute capaz de ejecutar las 7 capas lineales descritas en `nlg.bin`; no se especifican modelos concretos.
- Cabe en GPU consumer: no hay datos que lo confirmen. El tamano de los artefactos es compatible con cualquier GPU actual, pero la disponibilidad depende de la extension Vulkan, no de la memoria.
- Opciones de despliegue: grafo TOSA en contenedor VGF mediante `VK_ARM_data_graph`, o implementacion propia de las capas f32/f16 de `nlg.bin` sobre Vulkan compute. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles. Solo se documenta el paralelismo de 256 sondas por dispatch.

## Comparativa con modelos similares

| Modelo / enfoque | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rokuz7/nlg` | ~1,63 M (MLP generador, calculo derivado) | 256 sondas x 8192 puntos por dispatch, salida de 113 coeficientes | No publicado; cuantizacion verificada bit a bit | MIT | HuggingFace (0 descargas) |
| Neural Light Grid original (Iwanicki et al., SIGGRAPH 2024) | No disponible | Jerarquia adaptativa de varios niveles de rejilla | No disponible en esta busqueda | No disponible | Publicacion; implementacion no disponible en esta busqueda |
| Sondas de irradiancia con armonicos esfericos (SH, enfoque clasico) | 9 coeficientes por canal por sonda | Sin generador neuronal; ajuste analitico | No comparable directamente | No aplica | Estandar en motores comerciales |
| Light probes trilineales / irradiance volumes clasicos | Sin red por sonda | Rejilla regular, interpolacion trilineal | No comparable directamente | No aplica | Ampliamente disponible |

No se dispone de datos numericos de comparacion entre estas alternativas en la informacion proporcionada; las diferencias descritas son de diseno (jerarquia, representacion, soporte de oclusion), no de rendimiento medido.

## Limitaciones y advertencias

- Un solo nivel de rejilla y un solo espaciado de sonda: no implementa la jerarquia adaptativa de la ponencia de SIGGRAPH.
- Tratamiento de la geometria: las funciones consideran que un punto cuyo rayo hacia un vecino incide en una cara trasera esta dentro de la geometria, por lo que las escenas sin superficies cerradas o con orientacion inconsistente generan menos puntos validos.
- No es un modelo de lenguaje ni de proposito general: no admite prompts de texto, tool calling, agentes ni razonamiento. Cualquier evaluacion con metricas tipo MMLU, HumanEval o GSM8K no aplica.
- Dependencia de hardware y API: la ruta principal exige `VK_ARM_data_graph`; fuera de ese ecosistema hay que reimplementar la ruta en coma flotante.
- Ausencia de senales de validacion externa: 0 descargas y 0 likes, sin resultados de benchmarks ni demos publicadas en la informacion disponible.
- Riesgo de alucinacion y sesgos: no aplica en el sentido habitual (no genera texto), pero la red generada es una aproximacion; la model card no publica el error de reconstruccion de la funcion de sonda, por lo que la fidelidad numerica mas alla de la verificacion de cuantizacion no esta cuantificada.
- Licencia MIT: permite uso comercial y modificacion con atribucion; conviene revisar igualmente las condiciones de las patentes o implementaciones asociadas al trabajo original de SIGGRAPH, no cubiertas por esta licencia.
- Los resultados de busqueda web asociados a esta consulta no contenian informacion tecnica relevante sobre el modelo y se han descartado por completo.

## Enlaces

- HuggingFace: https://huggingface.co/rokuz7/nlg
- Referencia citada en la model card: Iwanicki et al., "Neural Light Grid", Advances in Real-Time Rendering in Games, SIGGRAPH 2024 (URL no disponible en la informacion proporcionada)
- Repositorio de codigo, paper con DOI, blog o demo: no disponibles en la informacion proporcionada
- Documentacion de `VK_ARM_data_graph` y del formato VGF/TOSA: no disponible en la informacion proporcionada
