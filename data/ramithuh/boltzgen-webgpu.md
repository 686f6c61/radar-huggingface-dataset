# ramithuh/boltzgen-webgpu

## Resumen

BoltzGen-webgpu es una implementación en JavaScript del modelo BoltzGen-1 para inferencia de coordenadas de proteínas, con soporte de ejecución en CPU mediante JavaScript puro y en GPU mediante shaders WGSL sobre WebGPU. Lo desarrolla el usuario de Hugging Face ramithuh y se presenta como un port del repositorio upstream HannesStark/boltzgen (fijado al commit 6472b44), del que reutiliza los checkpoints publicados en Hugging Face (revisión c1be29e1). El modelo resuelve la generación de coordenadas atómicas de proteínas con longitud dinámica, número de pasos de difusión y ciclos de reciclado configurables, sin depender de Python, ONNX, WASM ni grafos de operaciones capturados.

La relevancia de este proyecto es de naturaleza de despliegue: traslada un modelo de difusión estructural de proteínas al navegador y a Node.js, lo que permite ejecutar inferencia de diseño de proteínas sin infraestructura de servidor GPU dedicada. El repositorio ocupa 3,0 GB y no declara licencia, idiomas ni pipeline en la información disponible. La arquitectura interna corresponde al modelo original BoltzGen-1 (red de difusión con trunk Pairformer, atención triangular y DiffusionTransformer), no a un transformer de lenguaje.

La información proporcionada no incluye número de parámetros, longitud de contexto en tokens ni datos de entrenamiento del modelo original; esta ficha se limita a lo documentado en la model card y a las especificaciones deducibles del código descrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de difusión para estructura proteica (trunk Pairformer con atención triangular, DiffusionTransformer, sampler EDM/AF3) portada a JavaScript/WGSL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la entrada es una proteína de longitud L arbitraria (sin longitud fija), con coste cuadrático en pair features y cúbico en triangle attention |
| Tipos de cuantizacion | fp16 (precisión declarada en `precision: 'fp16'`); otras precisiones no disponibles |
| Idiomas soportados | no disponible (modelo estructural, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | checkpoints de Hugging Face consumidos por el motor JS (revisión c1be29e1); formato exacto de fichero no disponible |
| Tamaño del repositorio | 3,0 GB |
| Backends de ejecución | JavaScript en CPU (referencia numérica) y WGSL sobre WebGPU |
| Modos de generación | `unconditional`, `binder`, `motif` |

## Arquitectura y entrenamiento

El modelo subyacente es BoltzGen-1, una red de difusión para generación de coordenadas atómicas de proteínas. El motor JavaScript reproduce la arquitectura del upstream: un trunk con 64 bloques Pairformer (triangle multiplication saliente y entrante, triangle attention de inicio y fin, token attention, transiciones SwiGLU, dos bloques de distancia, dos de plantillas y cuatro de MSA), un score network con acondicionamiento temporal de Fourier, tres capas de atom encoder, 24 capas de DiffusionTransformer y tres capas de atom decoder con proyección de coordenadas. El sampler implementa el bucle inverso EDM/AF3 con centrado, augmentación rígida por cuaterniones, inyección de ruido, preacondicionamiento, alineamiento Kabsch mediante SVD 3×3 y actualizaciones de Euler, preservando la semántica de churn de next-sigma y de escala de ruido del original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; estos datos pertenecen al modelo original y no se detallan en la model card. La innovación técnica destacable es el propio port: ejecución de todas las operaciones neuronales en JavaScript (CPU) o WGSL (WebGPU) sin grafo capturado, servicio Python, ONNX ni fallback neuronal en CPU para el motor WebGPU. Los checkpoints `boltzgen1_diverse` y `boltzgen1_adherence` comparten la arquitectura soportada, y la procedencia y el esquema de pesos se registran en `fixtures/architecture.json`.

## Capacidades

- Generación de coordenadas atómicas de proteínas en modo incondicional (`unconditional`) con longitud L arbitraria.
- Diseño de binders (`binder`) condicionado por un target proteico, aceptando PDB completo o secuencia de una letra más coordenadas N, CA, C, O aplanadas o anidadas.
- Scaffolding con motivos fijos (`motif`): colocación de residuos de motivo dentro de un andamiaje de longitud total L mediante índices basados en cero.
- Longitud dinámica: L es un entero positivo sin longitud de traza fija; los buffers de dispositivo y la memoria disponible acotan el tamaño práctico.
- Control fino de difusión: `numSteps` (por defecto 3) y `recyclingSteps` (por defecto 0, con `recyclingSteps + 1` pasadas de trunk).
- Salidas estructuradas: coordenadas Float32 `[nAtoms,3]`, un tensor desruidizado por paso y `numSteps + 2` tensores de trayectoria (incluye el ruido inicial y la entrada final duplicada del upstream).
- Metadatos de átomos: identificación de token, cadena, residuo, nombre de átomo y estado de diseño; 14 slots de átomo por residuo diseñado.
- Lectura de PDB con primer modelo, localizaciones alternativas blank/A, códigos de inserción, múltiples cadenas y los 20 aminoácidos estándar.
- Ejecución en navegador con caché configurable (`none`, `cache`, `opfs`), cancelación mediante `AbortSignal` y callbacks de progreso por fase, bloque, paso y reciclado.
- No soporta RNA, DNA, ligandos, YAML/mmCIF generales del upstream ni MSA suministrados en el constructor público de entradas.

## Casos de uso

- Diseño de binders en el navegador: un investigador puede cargar un PDB de target y generar una cadena diseñada de longitud L sin instalar Python ni CUDA, usando el modo `binder` con `targetPDB`; adecuado para exploración rápida y prototipado.
- Scaffolding de motivos funcionales: fijar residuos catalíticos o de unión mediante `motifIndices` y generar un andamiaje que los contenga, útil para rediseño de sitios activos con restricciones estructurales.
- Generación incondicional de esqueletos proteicos: muestrear estructuras de novo con semilla fija (`seed`) para estudios de diversidad conformacional o generación de datasets sintéticos de entrenamiento.
- Herramientas educativas y demos interactivas: al ejecutarse en WebGPU dentro del navegador, permite visualizar trayectorias de difusión paso a paso en una página web sin backend.
- Validación numérica de implementaciones: el motor CPU (`createBoltzGenCPUEngine`) sirve como referencia numérica frente al motor WebGPU, útil para verificar ports o cambios en el sampler.
- Integración en pipelines Node.js: el motor CPU acepta una función `read(path)` para servir pesos desde disco o red, lo que permite generar coordenadas en scripts de análisis estructural por lotes.
- Prototipado de flujos de diseño de proteínas antes de escalar al upstream: el API produce coordenadas y deja la asignación de secuencia, inverse folding, refolding de confianza y ranking como trabajo downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad estructural (RMSD, pLDDT, success rate) ni comparaciones numéricas con el upstream; solo indica cualitativamente que la inferencia en CPU es sustancialmente más lenta que en WebGPU.

## Requisitos de hardware

- VRAM estimada: no disponible; depende de L y de la precisión. El repositorio de pesos ocupa 3,0 GB, lo que da una cota inferior orientativa para cargar los checkpoints en fp16.
- El coste computacional escala cuadráticamente en pair features y cúbicamente en triangle attention con el número total de tokens, por lo que L grande exige más memoria y tiempo.
- GPU: se requiere un dispositivo WebGPU (navegadores Chromium recientes, Node con soporte WebGPU) para el motor acelerado; no se especifican modelos de GPU recomendados ni mínimos.
- CPU: el motor JavaScript puro funciona sin GPU pero está pensado como referencia numérica y es sustancialmente más lento.
- Despliegue: motor propio en JavaScript/WGSL; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; dependen de L, `numSteps`, `recyclingSteps` y del hardware WebGPU.
- Límites prácticos: los límites de buffer del dispositivo y la memoria disponible acotan el tamaño de entrada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / longitud | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BoltzGen-webgpu (este) | Difusión estructural en JS/WGSL | no disponible | L arbitraria, sin longitud fija | no disponible | Hugging Face, 0 descargas |
| BoltzGen-1 upstream (HannesStark/boltzgen) | Difusión estructural en Python | no disponible | L arbitraria | no disponible en la información | GitHub, commit 6472b44 |
| Otras alternativas (p. ej. modelos de difusión proteica tipo RFdiffusion) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no permite una comparación numérica con alternativas; solo se confirma que este port comparte arquitectura y checkpoints con el upstream y difiere en el runtime de ejecución.

## Limitaciones y advertencias

- No se declara licencia en la información disponible; verificar los términos antes de cualquier uso comercial, incluida la licencia del upstream y de los checkpoints.
- El modelo produce coordenadas, no secuencias: la asignación de residuos desde geometría atom14, el inverse folding, el refolding de confianza, el ranking y la validación biológica quedan fuera del alcance del API.
- Targets y motivos son entradas de condicionamiento: el sampler también predice sus coordenadas y no las fija tras cada paso, siguiendo al upstream; esto puede desviar la estructura condicionante.
- No soporta RNA, DNA, ligandos, YAML/mmCIF generales del upstream ni MSA suministrados en el constructor público de entradas.
- El lector PDB ignora hidrógenos y nombres de átomos no soportados, y falla explícitamente ante tipos de residuo no soportados o falta de átomos de backbone.
- Riesgo de alucinación estructural: como todo modelo generativo, puede producir conformaciones plausibles pero biológicamente inviables; requiere validación downstream.
- Sesgos: no documentados en la información disponible.
- El motor WebGPU no tiene fallback neuronal en CPU; sin WebGPU disponible hay que usar el motor CPU, sustancialmente más lento.
- El proyecto tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-22); madurez y mantenimiento no verificables.
- El coste cúbico de triangle attention limita el tamaño práctico de las proteínas tratables en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/ramithuh/boltzgen-webgpu
- Repositorio upstream (commit fijado): https://github.com/HannesStark/boltzgen/tree/6472b44e8072187e6eaa51271ae6838245206013
- Checkpoints en Hugging Face (revisión c1be29e1): https://huggingface.co (revisión `c1be29e1f82ffcc72264f64b993c43fb4e0d17f0`, ruta no especificada en la información)
- Paper, blog o demo: no disponible
