# OrakulStorm/Master-Weights-Experimental-SencneS

## Resumen

Master-Weights-Experimental-SencneS es un repositorio publicado por OrakulStorm (Orakul Studio, Chernihiv, Ucrania) que no contiene un modelo independiente, sino una colección de adaptadores LoRA de rango extremo (r1280 a r2048) entrenados sobre el modelo de difusión FLUX.2-dev de Black Forest Labs. El objetivo declarado no es imitar paletas de color o estilos superficiales, sino reproducir la textura física tridimensional de la pintura al óleo: impasto grueso, dirección de las pinceladas, brillo de la pintura seca y trama del lienzo. Para ello los adaptadores se entrenan con matrices de rango muy alto, hasta 12.480 millones de parámetros entrenables en el caso del adaptador de rango 2048, lo que según el autor cubre cerca del 50 % de la capacidad del modelo base.

La colección incluye cuatro variantes organizadas por artista: Aivazovsky r1280 (~7.800 millones de parámetros) y r1536 (~9.300 millones), y Van Gogh r1792 (~10.920 millones) y r2048 (12.480 millones, archivo de aproximadamente 24 GB). El repositorio completo ocupa 217,7 GB y cada adaptador se distribuye en precisión completa bf16, sin cuantización, lo que explica su tamano desproporcionado frente a un LoRA convencional de rango 32-128.

El interés de esta ficha es acotado pero claro: es un caso extremo de entrenamiento de adaptadores de alto rango ejecutado, según el autor, en una única GPU de consumo (RTX 4090 de 24 GB) junto a 128 GB de RAM DDR5, mediante un gestor asíncrono de memoria CUDA, optimizador AdamW de 8 bits y offloading de doble búfer con ratio 0,91. Se trata de un modelo experimental con 2 descargas y 1 like en el momento de la consulta, y sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA de alto rango (delta W = B · A) sobre el modelo de difusión FLUX.2-dev; el autor denomina a la base "FLUX.2D (32B parámetros)" |
| Parametros totales | No aplica como modelo único: el repositorio contiene 4 adaptadores LoRA de 7,8 B a 12,48 B de parámetros entrenables cada uno, sobre un modelo base de 14 B o 32 B segun la referencia del autor (dato ambiguo en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo text-to-image, sin contexto de texto declarado) |
| Tipos de cuantizacion | Sin cuantización: entrenamiento e inferencia en bf16 a precisión completa; el autor aplica una descomposición SVD para comprimir la matriz delta, no cuantización |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No confirmado explícitamente; el repositorio declara `library_name: diffusers` y pesos bf16 de precisión completa, con factorización en los pares de matrices W_B y W_A |

Variantes incluidas en el repositorio:

| Adaptador | Rango | Parametros entrenables | Tamano de archivo declarado |
|---|---|---|---|
| Aivazovsky r1280 | 1280 | ~7,8 B | No disponible |
| Aivazovsky r1536 | 1536 | ~9,3 B | No disponible |
| Van Gogh r1792 | 1792 | ~10,92 B | No disponible |
| Van Gogh r2048 | 2048 | 12,48 B | ~24 GB |

## Arquitectura y entrenamiento

El modelo base es FLUX.2-dev de Black Forest Labs, un modelo de difusión text-to-image con arquitectura transformer. Sobre él se entrenan adaptadores LoRA cuya matriz de actualización es ΔW = B · A, con rangos entre 1280 y 2048. La innovación técnica declarada por el autor es precisamente ese rango extremo: según la model card, el rango 32-128 aprende paletas de color y estilo superficial, el rango 512 aprende mecánica de pincel, y el rango 1280-2048 aprende el "gesto físico" del artista, incluyendo presión, dirección de la espátula y relieve del óleo. En el rango 2048 el adaptador cubre, segun el autor, cerca del 50 % de la capacidad del modelo base.

El pipeline de entrenamiento descrito incluye un gestor asíncrono de memoria CUDA, optimizador AdamW de 8 bits, offloading de doble búfer con ratio 0,91 y forzado de precisión bf16 sin cuantización, ejecutado sobre una única RTX 4090 de 24 GB más 128 GB de RAM DDR5. El repositorio también documenta una etapa de compresión por descomposición en valores singulares: la matriz delta se factoriza como ΔW = U · S · V^T y la energía se reparte de forma simétrica mediante la raíz cuadrada de los valores singulares, de modo que W_B = U_r · √S_r y W_A = √S_r · V_r^T. No se especifican en la información disponible el número de tokens o imágenes de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no procede en un modelo de difusión, pero no se documenta ningún ajuste por preferencias).

Existe una discrepancia no resuelta en la propia model card: el texto de presentación habla de adaptadores "entrenados sobre modelos FLUX de 14B parámetros", mientras que el apartado de especificaciones técnicas indica "FLUX.2D (32B parámetros)". No hay información adicional que permita determinar cuál de las dos cifras describe correctamente el modelo base.

## Capacidades

- Generación de imágenes text-to-image mediante difusión, heredada del modelo base FLUX.2-dev.
- Reproducción de estilo pictórico con énfasis en textura física: impasto grueso, relieve escultórico de la pintura, trama de lienzo o arpillera y brillo del óleo.
- Especialización por artista: la variante Aivazovsky se orienta a dinámica de tormentas, refracción de la luz en el agua, translucidez de las olas y atmósfera marítima; la variante Van Gogh se orienta a empaste espeso, capas de color vibrantes y pincelada expresiva violenta.
- Ajuste del peso del adaptador en inferencia entre 0,7 y 1,0, lo que permite modular la intensidad del efecto sin reentrenar.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso ni capacidades de audio o vídeo.
- Capacidades multilingües: no disponible. Al ser un modelo de generación de imágenes, la cobertura idiomática dependería del codificador de texto del modelo base, que no se detalla.
- No se declara ningún modo de razonamiento explícito ni modo "thinking".

## Casos de uso

- Reproducción artística de alta fidelidad para impresión: la variante Van Gogh r2048 genera renders a 8K con relieve de óleo y trama de lienzo, adecuados para láminas, pósteres o ediciones limitadas donde la textura superficial es el valor diferencial.
- Ilustración marina y atmosférica: la variante Aivazovsky r1536 está entrenada específicamente para refracción de luz en el agua y translucidez de olas, útil en portadas editoriales, ilustración de libros o concept art de escenas marítimas.
- Concept art para videojuegos y cine: la capacidad de generar pincelada expresiva y empaste físico permite producir arte conceptual con acabado pictórico sin postproceso manual de textura.
- Previsualización de encargos pictóricos: un estudio puede generar variantes de una obra en estilo Van Gogh o Aivazovsky para que el cliente apruebe composición y tratamiento antes de pintar el original.
- Pipelines de estilo en ComfyUI o Forge: el adaptador se integra como nodo LoRA sobre FLUX.2-dev con sampler dpmpp_3m_sde_gpu, scheduler linear_quadratic, 35-40 pasos y CFG 3,5, lo que permite incorporarlo a flujos de generación por lotes.
- Aumento de dataset sintético: generar imágenes con textura de óleo realista para entrenar otros modelos de estilo, segmentación de texturas o modelos de superresolución especializados en pintura.
- Investigación sobre adaptación de alto rango: el repositorio es un caso de estudio sobre hasta qué punto un LoRA puede absorber capacidad del modelo base (hasta ~50 % en r2048) y sobre técnicas de compresión SVD de matrices delta.
- Pruebas de estrés de memoria en inferencia: los archivos de 10-24 GB por adaptador sirven para medir offloading, swapping y gestión de VRAM en despliegues de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una galería de imágenes de ejemplo (renders de Aivazovsky r1536) como única evidencia cualitativa, pero no aporta métricas cuantitativas como FID, CLIP score, MMLU, HumanEval ni comparaciones numéricas con otros adaptadores.

## Requisitos de hardware

- VRAM: no se declara una cifra exacta de inferencia. Cada adaptador requiere cargar entre ~7,8 B y 12,48 B de parámetros entrenables, con archivos individuales de hasta ~24 GB (Van Gogh r2048). A eso hay que sumar el modelo base FLUX.2-dev.
- GPU empleada para el entrenamiento: una única NVIDIA RTX 4090 de 24 GB, acompañada de 128 GB de RAM DDR5 y offloading de doble búfer con ratio 0,91. El autor indica que, dado el tamano de los adaptadores (10-24 GB), el sistema necesita RAM suficiente para cargar los pesos en memoria.
- GPU recomendadas: no se especifican. Por el tamano de los pesos, un despliegue sin offloading agresivo requeriría GPUs de 24 GB o más (RTX 4090, RTX 5090, A100 40/80 GB, H100); con offloading a RAM, el entrenamiento se completó en una 4090, por lo que la inferencia con gestión de memoria debería ser viable en hardware de consumo de gama alta.
- Cabe en GPU de consumo: sí, al menos en RTX 4090 de 24 GB con offloading, segun la evidencia del propio entrenamiento. Para el adaptador r2048 (~24 GB de archivo) es previsible que haga falta offloading parcial a RAM del sistema.
- Opciones de despliegue: diffusers (librería declarada por el repositorio), ComfyUI y Forge, que son los entornos para los que el autor proporciona ajustes de inferencia.
- Parámetros de inferencia recomendados: peso LoRA entre 0,7 y 1,0 (1,0 para máxima textura física), sampler dpmpp_3m_sde_gpu, scheduler linear_quadratic, 35-40 pasos, CFG 3,5, sobre FLUX.2 Dev.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen ni imágenes por segundo.

## Comparativa con modelos similares

La información disponible solo permite comparar las variantes dentro del propio repositorio y con las categorías de rango que describe el autor. No se han encontrado en la búsqueda web adaptadores alternativos comparables con datos verificables.

| Modelo / categoria | Rango | Parametros entrenables | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aivazovsky r1280 (esta coleccion) | 1280 | ~7,8 B | No aplica (text-to-image) | Apache 2.0 | HuggingFace |
| Aivazovsky r1536 (esta coleccion) | 1536 | ~9,3 B | No aplica | Apache 2.0 | HuggingFace |
| Van Gogh r1792 (esta coleccion) | 1792 | ~10,92 B | No aplica | Apache 2.0 | HuggingFace |
| Van Gogh r2048 (esta coleccion) | 2048 | 12,48 B | No aplica | Apache 2.0 | HuggingFace |
| LoRA convencional de estilo (referencia generica citada por el autor) | 32-128 | No disponible | No aplica | Depende del autor | No disponible |
| LoRA de tecnica de pincel (referencia generica citada por el autor) | 512 | No disponible | No aplica | Depende del autor | No disponible |
| Modelo base FLUX.2-dev | No aplica | No disponible | No disponible | No disponible en esta ficha | HuggingFace (Black Forest Labs) |

Rendimiento comparado: no disponible. No hay métricas publicadas que permitan afirmar que los adaptadores de rango alto superen objetivamente a alternativas de rango bajo más allá de la afirmación cualitativa del autor sobre reproducción de textura física.

## Limitaciones y advertencias

- Modelo experimental y de nicho: 2 descargas y 1 like en el momento de la consulta, sin validación independiente conocida.
- Ambigüedad documental sobre el modelo base: la model card menciona simultáneamente FLUX de 14B parámetros y "FLUX.2D (32B parámetros)". No se puede confirmar cuál es correcta.
- Ausencia total de métricas: no hay benchmarks, FID, CLIP score ni comparaciones cuantitativas. La única evidencia son imágenes de ejemplo seleccionadas por el autor.
- Riesgo de sobreajuste al estilo del artista: un adaptador que cubre hasta el 50 % de la capacidad del modelo base puede degradar la diversidad de las salidas o reproducir composiciones del dataset de entrenamiento.
- Sin información sobre el dataset: no se documentan imágenes de entrenamiento, licencias de las obras de referencia, número de pasos ni composición. Existe riesgo legal si el entrenamiento usó obras protegidas, a pesar de que la licencia del repositorio sea Apache 2.0.
- Sesgos: no disponibles. No se documenta ningún análisis de sesgo demográfico, cultural o estilístico.
- Alucinación: aplicable en el sentido de generación de detalles pictóricos inexistentes o anatómicamente incorrectos, inherente a los modelos de difusión; no se cuantifica.
- Compatibilidad: los ajustes proporcionados (dpmpp_3m_sde_gpu, linear_quadratic, CFG 3,5) están pensados para ComfyUI y Forge. Otros entornos pueden requerir ajuste manual.
- Coste de recursos: adaptadores de 10-24 GB por variante, con entrenamiento verificado en una 4090 más 128 GB de RAM y offloading. No es un despliegue ligero y el autor advierte explícitamente de la necesidad de RAM suficiente.
- Licencia Apache 2.0 en el repositorio, pero sujeta a las condiciones del modelo base FLUX.2-dev, que deben verificarse por separado antes de un uso comercial.
- Idiomas: no disponibles. El comportamiento multilingüe de los prompts depende del codificador de texto del modelo base y no está documentado aquí.
- Fecha de creación declarada: 20 de septiembre de 2026, posterior a la fecha de referencia habitual; conviene verificar la vigencia y el estado del repositorio antes de integrarlo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OrakulStorm/Master-Weights-Experimental-SencneS
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-dev
- No se han encontrado papers, blogs, repositorios ni demos adicionales relevantes en la búsqueda web realizada; los resultados obtenidos correspondían a contenidos sin relación con el modelo.
