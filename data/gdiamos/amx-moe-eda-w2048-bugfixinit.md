# gdiamos/amx-moe-eda-w2048-bugfixinit

## Resumen

amx-moe-eda-w2048-bugfixinit es un modelo de generacion de texto de 30 millones de parametros desarrollado por el usuario gdiamos y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un MoE (mixture of experts) con enrutado por bloques, disenado especificamente para escribir funciones en C dentro de un corpus reducido de herramientas EDA (electronic design automation). La particularidad del proyecto es que fue entrenado integramente en un unico nucleo de CPU Intel AMX, sin GPU, lo que lo convierte en un artefacto de investigacion sobre entrenamiento eficiente en CPU mas que en un modelo de produccion.

El modelo parte de un curriculum de correccion de errores ("bug-fix") sobre C real y emplea una ventana de atencion de 2048 tokens, frente a los 256 tokens de la version anterior (gdiamos/amx-moe-eda-p250x4). Su arquitectura consta de 6 capas con patron hibrido de atencion lineal y de ventana deslizante, d_model de 256 y 64 expertos con k=4 y 2 compartidos.

La relevancia de esta ficha esta en su honestidad metodologica: el propio autor documenta que la mejora solo esta establecida en entropia cruzada (-0,0443 nats, t = -3,02) y que la ventaja en tasa de compilacion no es estadisticamente significativa (p = 0,508). El modelo alcanza un 0% de coincidencia exacta en bloques retenidos y no escribe C correcto a partir de una especificacion, por lo que debe considerarse exclusivamente un objeto de estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida, 6 capas en patron `[lin, swa, swa, lin, swa, lin]`, d_model 256 |
| Parametros totales | 30.029.420 segun safetensors; la model card declara 30.029.429 |
| Parametros activos | 3.315.744 por token |
| Longitud de contexto | 2048 tokens, ventana fragmentada ("chunked") |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, libreria `transformers` |
| Enrutado MoE | 64 expertos, k=4, 2 expertos compartidos, `route_block` 256 |
| Hardware de entrenamiento | un unico nucleo de CPU Intel AMX |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un MoE de 6 capas con d_model 256 y un patron de atencion hibrido que alterna bloques etiquetados como `lin` y `swa` en el orden `[lin, swa, swa, lin, swa, lin]`, con atencion de ventana fragmentada a 2048 tokens. Emplea 64 expertos con k=4 activos por token y 2 expertos compartidos, con enrutado a nivel de bloque (`route_block` 256). Los parametros totales ascienden a 30.029.420 y solo 3.315.744 estan activos por token.

El entrenamiento se realizo integramente en un unico nucleo de CPU Intel AMX, sobre un corpus de 250 programas de EDA. La inicializacion de esta version proviene de un modelo de ventana 2048 entrenado con un curriculum de correccion de errores compuesto por 24.539 funciones C distintas con un error inyectado en cada una, que a su vez deriva de un preentrenamiento de 1,75B de tokens (la model card se interrumpe en este punto, por lo que no se detalla mas la composicion del preentrenamiento). El autor senala que el curriculum de bug-fix se construyo para instalar un circuito de copia y fracaso en ese objetivo: la sonda de copia no cambio en ningun checkpoint. Aun asi, la inicializacion transfiere de forma util, probablemente por aportar unas 15.000 funciones de C real mas que por instalar dicho circuito.

La innovacion documentada es el analisis del circuito de copia: en la familia de modelos con ventana 256, la precision de copia cae de forma abrupta de 74,9% a distancia 259 hasta 0,2% a distancia 367, es decir, un escalon y no un decaimiento gradual. Como los prompts de bloques EDA retenidos tienen una longitud mediana de 882 tokens, con ventana 256 alrededor del 72% del esqueleto del que el modelo debe copiar identificadores quedaba fuera de su alcance. La ampliacion a 2048 ayuda menos de lo que sugiere el mecanismo porque solo el 34,5% de las lineas objetivo de EDA aparecen literalmente en el prompt, frente al 96% en la tarea de bug-fix: la recuperacion solo rinde cuando hay algo que recuperar.

## Capacidades

- Generacion de funciones en C dentro del dominio restringido del corpus de herramientas EDA de 250 programas.
- Generacion de texto condicionada por prompt con ventana de 2048 tokens y atencion fragmentada.
- Enrutado MoE por bloques con 64 expertos (4 activos, 2 compartidos), util para estudiar el comportamiento de expertos en modelos pequenos.
- Reproduccion literal de fragmentos dentro de la ventana de entrenamiento, con limite duro en el borde de la ventana (comportamiento de escalon, no de decaimiento).
- Limitaciones explicitas: no escribe C correcto a partir de una especificacion. Sobre 198 bloques EDA retenidos alcanza 1,2269 nats y 0% de coincidencia exacta. De 61 bloques retenidos compilados tras sustitucion en el programa real, el 13,1% compila y el 8,2% compila y ademas referencia algo fuera de su propia firma.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: solo ingles (`en`) declarado.
- No hay capacidades de vision, audio ni modo de razonamiento (thinking mode) documentadas.

## Casos de uso

- Investigacion sobre entrenamiento en CPU: el modelo permite reproducir un ciclo completo de preentrenamiento, inicializacion por curriculum y ajuste usando un unico nucleo Intel AMX, lo que sirve para medir el coste real y los limites de esta via frente a GPU en modelos de 30M de parametros.
- Estudio de enrutado MoE en modelos pequenos: con 64 expertos, k=4 y `route_block` 256 sobre solo 6 capas, es un banco de pruebas barato para analizar balanceo de carga, especializacion de expertos y sensibilidad al tamano de bloque de enrutado.
- Analisis de circuitos de copia y atencion de ventana: el modelo permite replicar la medicion del escalon de copia (74,9% a distancia 259 frente a 0,2% a distancia 367 en la variante de ventana 256) y estudiar como se desplaza ese limite al ampliar la ventana a 2048.
- Generacion de candidatos para curación humana en pipelines de EDA: dado que el 13,1% de los bloques generados sobre conjuntos retenidos compila, el modelo puede usarse como generador de borradores descartables que un ingeniero filtra, nunca como salida directa.
- Evaluacion de metodologia de comparacion de checkpoints: el caso documenta como dos releases de la misma arquitectura y corpus pueden diferir por criterio de seleccion (paso 20.631 elegido por ajuste frente a paso 4.125 elegido por entropia cruzada), lo que lo hace util como ejemplo docente de por que hay que igualar el checkpoint antes de comparar.
- Construccion de conjuntos de datos de C: el curriculum de 24.539 funciones C con un error inyectado puede reutilizarse como material para tareas de deteccion y correccion de bugs en modelos mayores.
- Pruebas de infraestructura de inferencia ligera: con 30M de parametros y 0,1 GB de repositorio, sirve para validar pipelines de `transformers` en entornos sin GPU antes de escalar a modelos mayores.
- Docencia y experimentacion reproducible: el tamano y el coste de entrenamiento permiten que un estudiante entrene y evalue variantes completas en hardware de consumo, incluida la propia metrica de entropia cruzada retenida.

## Benchmarks y rendimiento

Datos medidos sobre bloques EDA retenidos (198 objetivos), cada variante en su mejor checkpoint:

| Inicializacion | Ventana | Entropia cruzada retenida |
|---|---|---|
| Base de 4 dias | 256 | 1,3358 |
| Base de 4 dias | 2048 | 1,3054 |
| Curriculum de bug-fix | 2048 | 1,2269 |

Comparacion emparejada frente a la inicializacion base de 4 dias con ventana 2048, sobre bloques identicos:

| Metrica | Valor |
|---|---|
| Diferencia de entropia cruzada | -0,0443 nats |
| Estadistico t | -3,02 (significativo) |
| Bloques en los que gana | 122 de 198 (62%) |

Tasa de compilacion sobre 61 bloques retenidos, frente a la inicializacion base de 4 dias:

| Metrica | Init base de 4 dias | Este modelo | p emparejada |
|---|---|---|---|
| Compila | 8,2% | 13,1% | 0,508 |
| Compila y no es stub ni hueco | 6,6% | 8,2% | 1,000 |
| Hueco ("hollow") | 6,6% | 14,8% | 0,125 |

Comparacion con la release anterior tal como se publica (61 bloques retenidos, remedidos de forma comparable):

| Metrica | p250x4 (paso 20.631) | Este modelo (paso 4.125) |
|---|---|---|
| Entropia cruzada retenida | 1,6892 | 1,2269 |
| Compila | 8,2% | 13,1% |
| Compila y no es stub ni hueco | 6,6% | 8,2% |
| Hueco ("hollow") | 1,6% | 14,8% |
| Coincidencia exacta | 0% | 0% |

Comparacion controlada, ambas variantes en el paso 4.125 y con la misma evaluacion:

| Metrica | p250x4 | Este modelo |
|---|---|---|
| Entropia cruzada retenida | 1,3358 | 1,2269 |
| Compila | 14,8% | 13,1% |
| Compila y no es stub ni hueco | 9,8% | 8,2% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 30.029.420 parametros (estimacion propia, no publicada por el autor): aproximadamente 120 MB en fp32, 60 MB en fp16/bf16 y 30 MB en int8.
- GPU recomendadas: no disponible. El autor no publica despliegue en GPU; el entrenamiento se realizo en un nucleo de CPU Intel AMX.
- Cabe en GPU de consumo: si, por tamano (60 MB en fp16), aunque no hay guia oficial de despliegue ni requisitos declarados. Tambien cabe en CPU y en sistemas embebidos con memoria abundante.
- Opciones de despliegue: `transformers` con pesos safetensors, que es lo unico declarado en la model card. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible.
- Nota de produccion: los resultados publicados (0% de coincidencia exacta, 13,1% de compilacion, 14,8% de salidas huecas) desaconsejan cualquier uso en servicio real independientemente del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Entropia cruzada retenida | Compila | Licencia |
|---|---|---|---|---|---|---|
| amx-moe-eda-w2048-bugfixinit | 30.029.420 | 3.315.744 | 2048 | 1,2269 | 13,1% | apache-2.0 |
| gdiamos/amx-moe-eda-p250x4 (paso 20.631) | misma arquitectura | 3.315.744 | 256 o 2048 (misma familia) | 1,6892 | 8,2% | apache-2.0 |
| gdiamos/amx-moe-eda-p250x4 (paso 4.125) | misma arquitectura | 3.315.744 | misma familia | 1,3358 | 14,8% | apache-2.0 |

El unico modelo directamente comparable del que se dispone de datos es la release anterior del mismo autor, que comparte arquitectura y corpus de 250 programas. No se dispone de datos de benchmarks frente a modelos de codigo de tamano similar (por ejemplo, variantes de CodeGen o Qwen de menos de 100M de parametros) en la informacion proporcionada, por lo que esa comparacion queda como no disponible. Nota metodologica: la comparacion entre releases esta contaminada por el criterio de seleccion de checkpoint, y el propio autor separa los numeros en dos tablas (tal como se publican y controlada por paso) precisamente por este motivo.

## Limitaciones y advertencias

- El modelo no escribe C correcto a partir de una especificacion: 0% de coincidencia exacta sobre 198 bloques retenidos y 1,2269 nats de entropia cruzada.
- Tasa de compilacion baja y no establecida: 13,1% sobre 61 bloques retenidos, con p = 0,508 frente a la inicializacion base, es decir, sin significacion estadistica.
- Salidas huecas frecuentes: el 14,8% de las generaciones retenidas compilan pero no referencian nada fuera de su propia firma, frente al 1,6% del modelo anterior. Contar compilaciones sin guardas adicionales sobreestima el rendimiento de este modelo.
- La unica mejora establecida es la entropia cruzada (-0,0443 nats, t = -3,02, 122 de 198 bloques), no la capacidad de generar C utilizable.
- La ventana ampliada aporta menos de lo esperado porque solo el 34,5% de las lineas objetivo de EDA aparecen literalmente en el prompt, frente al 96% en la tarea de bug-fix.
- Sesgos conocidos: no disponible. No se documenta ningun analisis de sesgo.
- Riesgo de alucinacion: alto por diseno en el dominio objetivo; el propio modelo genera cuerpos que compilan sin referenciar simbolos externos, lo que constituye una forma de salida vacia plausible.
- Limitaciones de idioma: solo se declara ingles (`en`). No hay evaluacion en castellano ni en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial segun los terminos de la licencia, pero los resultados medidos desaconsejan cualquier uso en produccion.
- Caveat de reproducibilidad: la comparacion con la release anterior esta afectada por criterios distintos de seleccion de checkpoint; igualar el paso cambia el signo de algunas metricas.
- Caveat de datos: la model card se interrumpe durante la descripcion del preentrenamiento de 1,75B de tokens, por lo que la composicion completa del dataset no esta disponible.
- Fecha de publicacion en el repositorio: 26 de septiembre de 2026 (creacion) y misma fecha de ultima actualizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gdiamos/amx-moe-eda-w2048-bugfixinit
- Release anterior comparable (gdiamos/amx-moe-eda-p250x4): https://huggingface.co/gdiamos/amx-moe-eda-p250x4
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
