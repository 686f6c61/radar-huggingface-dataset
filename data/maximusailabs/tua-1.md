# MaximusAILabs/TUA-1

## Resumen
TUA-1 es un modelo de pesos abiertos orientado a computer use, es decir, a operar interfaces graficas de usuario a partir de instrucciones en lenguaje natural. Lo desarrolla MaximusAILabs y su rasgo definitorio es el tamano: 4,67 millones de parametros entrenables, un checkpoint de 18,7 MB en safetensors y una inferencia que corre exclusivamente en CPU a unos 0,07 segundos por paso. No necesita GPU ni llamadas a ninguna API externa, lo que lo posiciona como un ejecutor local rapido mas que como un modelo generalista de proposito amplio.

Tecnicamente es un encoder Transformer con punteros a elementos (element-pointer Transformer encoder, pre-LN) de 6 capas, dimension oculta 192, 4 cabezas de atencion y FFN de 768 con activacion GELU. Lee la pantalla como una estructura de elementos de interfaz (DOM o arbol de accesibilidad) y decide la siguiente accion entre cuatro posibles: hacer clic en un elemento, escribir un fragmento copiado literalmente de la instruccion, hacer scroll o finalizar.

Su relevancia actual radica en que demuestra que tareas de control de interfaz pueden resolverse con un modelo minusculo entrenado en un portatil, superando en esos benchmarks concretos a modelos de lenguaje zero-shot hasta 300 veces mas grandes. Incluye un adaptador para Playwright que convierte paginas web en vivo al formato de observacion del modelo, lo que facilita su integracion en flujos de automatizacion reales bajo la supervision de un planificador de mayor nivel.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con punteros a elementos (pre-LN), atencion bidireccional con sesgo de emparejamiento instruccion-elemento |
| Parametros totales | 4.667.373 parametros entrenables (+ 4,19 M congelados del prior lexico) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 40 tokens de instruccion, 48 elementos de interfaz y 8 acciones de historial por paso |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de 18,7 MB) |

## Arquitectura y entrenamiento
El modelo es un encoder Transformer pre-LN de 6 capas con 192 dimensiones ocultas, 4 cabezas de atencion y FFN de 768 con GELU. En lugar de generar texto libre, produce punteros: las acciones de clic apuntan a un indice de elemento de la pantalla y el texto que se escribe se copia caracter a caracter desde la instruccion original. Esto garantiza que valores como `19:00`, `2026-11-02` o `maya.l@mail.com` se preserven exactos y que ninguna accion generada sea malformada (0% de acciones invalidas en el benchmark frente a porcentajes de entre 0,5% y 3,8% en los modelos comparados).

La representacion de las palabras combina n-gramas de caracteres hasheados (buckets de 8192 para n = 2, 3 y 4) con un prior lexico congelado procedente de las embeddings de tokens de Needle 2 (matriz de 8192 x 512). Ese prior aporta nociones de sinonimia como "delete" aproximadamente "remove" o "dark" aproximadamente "night", mientras que los n-gramas hasheados cubren nombres propios, correos y contrasenas no vistos durante el entrenamiento. El sesgo de atencion aprendizaje por cabeza enlaza cada palabra de la instruccion con los elementos que menciona, permitiendo inferir objetivos parafraseados: ante "stop emailing me" el modelo desmarca la casilla de novedades por correo y pulsa guardar sin que se le indique explicitamente.

El entrenamiento se hizo integramente en un portatil con CPU de 12 nucleos mediante clonacion de comportamiento, perturbaciones DART y DAgger, seguidas de seis rondas de ajuste supervisado y una fase final de RL de tipo GRPO en un navegador real. La precision de entrenamiento e inferencia es FP32.

## Capacidades
- Generacion de acciones de interfaz: clic sobre elementos, escritura de texto copiado de la instruccion, scroll arriba o abajo y finalizacion de la tarea.
- Grounding instruccion-elemento: asocia palabras de la instruccion con los elementos de la pantalla que designan, incluso con sinonimos o palabras no vistas.
- Inferencia de objetivos: resuelve peticiones formuladas por resultado en lugar de por accion explicita, como "stop emailing me".
- Ejecucion de instrucciones cortas y explicitas, por ejemplo "log in as zara with password k7mq2x" o "set Size to large and save".
- Navegacion web real mediante el adaptador de Playwright, que incluye menus `<select>` nativos y conmutadores ARIA.
- Observacion de interfaces estructuradas a partir de DOM o arbol de accesibilidad: rol, etiqueta, valor, estado y caja delimitadora.
- Sin soporte documentado de tool calling generico, function calling arbitrario, agentes multi-paso autonomos, vision por pixeles, audio ni modo de razonamiento explicito.
- Sin informacion publicada sobre capacidades multilingues: no hay idiomas declarados en la ficha.

## Casos de uso
- Automatizacion de tareas web repetitivas: el modelo puede completar formularios, iniciar sesion o ajustar preferencias en paginas reales usando el adaptador de Playwright, con un coste de 0,07 s por paso y sin depender de una GPU.
- Ejecutor local bajo un planificador LLM: un modelo grande descompone la tarea en pasos y TUA-1 los ejecuta de forma rapida y barata en la misma maquina, reduciendo latencia y coste de API.
- Agentes de navegador en entornos con restricciones de privacidad: al no enviar capturas ni datos de la pantalla a servicios externos, encaja en flujos donde la informacion de la interfaz no puede salir del equipo.
- Pruebas end-to-end de interfaces: puede utilizarse para recorrer flujos de usuario (registro, alta de suscripcion, edicion de perfil) en pipelines de integracion continua ejecutados en runners sin GPU.
- Asistentes de accesibilidad: la lectura de arboles de accesibilidad y la emision de acciones concretas permiten automatizar interacciones sobre interfaces ya descritas semanticamente.
- Rellenado de datos sensibles con exactitud literal: contrasenas, correos e importes se copian tal cual desde la instruccion, evitando la corrupcion tipica de la decodificacion libre.
- Prototipado e investigacion en computer use de bajo coste: sirve como referencia reproducible (entrenable en un portatil) para comparar tecnicas de clonacion de comportamiento, DAgger y RL en tareas de interfaz.

## Benchmarks y rendimiento
| Benchmark | TUA-1 | Needle 2 | Gemma 3 270M IT | FunctionGemma 270M | Qwen2.5 1.5B Instruct |
|---|---|---|---|---|---|
| Parametros | 4,7 M | 45 M | 270 M | 270 M | 1,5 B |
| GUI-Sim: tipos de tarea entrenados (13) | 92,3 | 0,0 | 0,0 | 0,0 | 3,8 |
| GUI-Sim: tipos de tarea no vistos (8) | 56,2 | 0,0 | 0,0 | 0,0 | 0,0 |
| GUI-Sim: entrenados, objetivos cumplidos | 92,8 | 6,4 | 11,1 | 5,2 | 21,3 |
| GUI-Sim: no vistos, objetivos cumplidos | 65,3 | 0,0 | 4,9 | 0,7 | 5,6 |
| TUA-Web Dev (17 tareas) | 10 / 17 | 0 / 17 | 0 / 17 | 0 / 17 | 0 / 17 |
| TUA-Web Set 2 (12 tareas) | 7 / 12 | 0 / 12 | 0 / 12 | 0 / 12 | 0 / 12 |
| TUA-Web Set 3 (11 tareas) | 4 / 11 | 0 / 11 | 0 / 11 | 0 / 11 | 0 / 11 |
| TUA-Web Set 4 (8 tareas) | 0 / 8 | 0 / 8 | 0 / 8 | 0 / 8 | 0 / 8 |
| TUA-Web Set 5 (8 tareas) | 2 / 8 | 0 / 8 | 1 / 8 | 0 / 8 | 0 / 8 |
| TUA-Web total (56 tareas) | 23 / 56 | 0 / 56 | 1 / 56 | 0 / 56 | 0 / 56 |
| Segundos por paso (CPU) | 0,07 | 1,5 | 7,3 | 6,4 | 13,3 |
| Acciones invalidas (%) | 0,0 | 3,8 | 0,6 | 0,5 | 0,9 |

Resultados adicionales de TUA-1 en simulador (n = 100 a 200 por tipo de tarea):

| Benchmark | Puntuacion |
|---|---|
| Inferencia de objetivos con parafrasis no vistas en entrenamiento | 57,5 |
| Tipos de tarea entrenados con todas las palabras de contenido sustituidas por palabras no vistas | 90,8 |
| Paginas de generador renderizadas en navegador real (78 tareas) | 91,0 |

Segun la model card, los baselines se evaluaron en modo zero-shot con prompts seleccionados en tareas de desarrollo distintas de las reportadas, y un experto scriptado que usa la misma ruta de texto y tool-call que los baselines acierta el 100% de las veces, lo que sirve de validacion del arnes de evaluacion. La metrica de exito es la finalizacion en bucle cerrado con un limite de 20 pasos por tarea.

## Requisitos de hardware
- VRAM para inferencia en FP32: aproximadamente 19 MB de pesos, mas el prior lexico congelado, lo que en la practica cabe en cualquier GPU domestica e incluso en memoria unificada de un telefono.
- Inferencia en CPU nativa: 0,07 s por paso en el hardware de referencia, sin necesidad de GPU.
- GPU recomendadas: no aplica; cualquier GPU moderna ejecutaria el modelo de forma holgada, pero no aporta una ventaja significativa frente a CPU dado el tamano.
- Cabe en GPU de consumo: si, en cualquier modelo (RTX 4090, RTX 3060, e incluso iGPU) y tambien en CPU.
- Opciones de despliegue: al ser un modelo pytorch con formato safetensors y arquitectura propia, no se anuncia compatibilidad directa con vLLM, llama.cpp, Ollama ni TGI; el despliegue documentado pasa por el adaptador de Playwright y la libreria pytorch.
- Latencia y throughput: unos 0,07 segundos por paso en CPU de 12 nucleos, lo que equivale a mas de 14 pasos por segundo en el mismo hilo de ejecucion.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto de entrada | Rendimiento en GUI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TUA-1 | 4,7 M | 40 tokens de instruccion, 48 elementos, 8 acciones | 23 / 56 tareas web; 92,3 en tipos entrenados | Apache 2.0 | HuggingFace (pytorch, safetensors) |
| Needle 2 | 45 M | no disponible | 0 / 56 tareas web; 0,0 en tipos entrenados; 1,5 s por paso | no disponible | HuggingFace |
| Gemma 3 270M IT | 270 M | no disponible | 1 / 56 tareas web; 0,0 en tipos entrenados; 7,3 s por paso | no disponible | HuggingFace |
| FunctionGemma 270M | 270 M | no disponible | 0 / 56 tareas web; 0,0 en tipos entrenados; 6,4 s por paso | no disponible | HuggingFace |
| Qwen2.5 1.5B Instruct | 1,5 B | no disponible | 0 / 56 tareas web; 3,8 en tipos entrenados; 13,3 s por paso | no disponible | HuggingFace |

TUA-1 es entre 10 y 300 veces mas pequeno que los alternativas, y en las suites reportadas obtiene resultados superiores tanto en exito de tarea como en latencia por paso. Hay que subrayar que la comparacion es zero-shot para los baselines y con entrenamiento especifico en el caso de TUA-1, por lo que mide la idoneidad para esta tarea concreta, no una capacidad general.

## Limitaciones y advertencias
- Es un ejecutor, no un planificador: esta disenado para instrucciones cortas y explicitas bajo la supervision de un modelo de mayor nivel. No se documenta razonamiento multi-paso autonomo ni descomposicion de tareas.
- Limitacion de dominio: el conjunto TUA-Web Set 4 arroja 0 / 8 tareas resueltas, lo que indica que existe una categoria de tareas web donde el modelo falla por completo.
- Entrada muy restringida: 40 tokens de instruccion, 48 elementos de interfaz y 8 acciones de historial. Pantallas con muchos elementos o instrucciones largas quedan fuera de esa capacidad.
- Dependencia del formato de observacion: requiere DOM o arbol de accesibilidad en el formato esperado; no procesa pixeles ni capturas de pantalla.
- Riesgo de alucinacion no aplica a la generacion de texto libre, ya que el modelo copia texto literalmente; el riesgo se traslada a la seleccion de elementos equivocados o a la accion incorrecta.
- Idiomas: la ficha no declara idiomas soportados. El prior lexico proviene de embeddings en ingles y los ejemplos de la model card estan en ingles, por lo que el rendimiento en castellano es desconocido.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del prior lexico congelado (Needle 2) y de los componentes derivados antes de un despliegue en produccion.
- Ausencia de adopcion verificable: cero descargas y cero likes en el momento de la consulta, sin publicacion asociada ni resultados replicados por terceros. Los numeros provienen exclusivamente de la model card del autor.
- Fecha de creacion y actualizacion poco habituales (2026-10-03), dato a tener en cuenta al evaluar la trazabilidad del repositorio.

## Enlaces
- HuggingFace: https://huggingface.co/MaximusAILabs/TUA-1
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios de codigo o demos.
