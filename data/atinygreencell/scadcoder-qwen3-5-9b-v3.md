# ATinyGreenCell/scadcoder-qwen3.5-9b-v3

## Resumen

scadcoder-qwen3.5-9b-v3 es un ajuste fino por LoRA del modelo multimodal Qwen3.5-9B, desarrollado por el usuario ATinyGreenCell, especializado en la generacion de codigo OpenSCAD parametrico para equipamiento de laboratorio biologico (el proyecto "Tiiny Pocket Lab"). El modelo no pretende ser un asistente de codigo generalista: su dominio es la produccion de scripts `.scad` que describen piezas imprimibles en 3D (soportes de tubos, embudos, peines de gel, manguitos adaptadores, etc.) a partir de una descripcion textual con dimensiones concretas. Esta tercera version amplia el conjunto de datos de la v2 con ejemplos destilados de Claude Opus y generaciones propias filtradas por un verificador de renderizado.

Tecnicamente es un transformer multimodal de 9.653.104.368 parametros (unos 9,65 B) con arquitectura `Qwen3_5ForConditionalGeneration`, es decir, conserva el codificador de vision del modelo base. El ajuste se aplico unicamente a las capas de lenguaje mediante LoRA de rango 32, posteriormente fusionado en pesos bf16 completos, por lo que en inferencia se comporta como un modelo denso estandar de 9,65 B. El repositorio ocupa 19,3 GB, coherente con pesos bf16.

Su relevancia es acotada pero clara: cubre un nicho muy especifico (CAD parametrico verificable por render) en el que los modelos generalistas fallan con frecuencia porque generan geometria no estanca o dimensiones fuera de tolerancia. Es un modelo de investigacion aplicada, con cero descargas y cero likes en el momento de la consulta, y sin resultados de benchmarks publicados. El autor advierte ademas de un sesgo de evaluacion: parte de los datos de entrenamiento sigue la formulacion de tareas del benchmark Prompt-to-Bench, por lo que las puntuaciones en esas tareas son "in-family", no transferencia real a datos no vistos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (codificador de vision + capas de lenguaje), ajuste LoRA fusionado |
| Parametros totales | 9.653.104.368 (aprox. 9,65 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la informacion proporcionada ni en la model card) |
| Tipos de cuantizacion | No se distribuyen cuantizaciones oficiales. Pesos en bf16 (safetensors); cuantizacion posterior posible (INT8/FP8/INT4 via GPTQ, AWQ o GGUF), sujeta a que las herramientas soporten la arquitectura `qwen3_5` |
| Idiomas soportados | No disponible (el campo de idiomas del repositorio no esta cumplimentado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, LoRA fusionado) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B` y conserva su estructura completa: un codificador de vision mas una pila de capas de lenguaje. El ajuste se realizo con LoRA de rango 32 y dropout 0,1 aplicado exclusivamente a las capas de lenguaje, durante 3 epocas sobre 8.784 ejemplos de un unico turno. Posteriormente, los adaptadores se fusionaron en los pesos base y se exportaron en bf16 a safetensors, de modo que no hay adaptadores separados ni se requiere PEFT en inferencia. El codificador de vision se mantiene intacto: el modelo acepta entrada de imagen por herencia del base, pero no fue entrenado especificamente para tareas visuales.

La composicion del dataset declarada es: 7.238 ejemplos verificados por renderizado procedentes de la v2 (34 familias de piezas parametricas mas ejemplos de reparacion de scripts), 336 ejemplos destilados de Claude Opus sobre descripciones de piezas estilo banco de laboratorio, cada uno verificado por renderizado (geometria estanca, caja delimitadora dentro del 15 % de la especificacion) y ponderados x3, y 269 generaciones propias obtenidas por rejection sampling que pasaron el verificador, ponderadas x2. Nota de rigor: la suma de los componentes declarados (7.843) no coincide con el total indicado (8.784), discrepancia que el autor no explica en la model card. No se especifican numero de tokens de entrenamiento, hardware utilizado ni si hubo fases de RLHF o DPO; el unico proceso de filtrado documentado es el rejection sampling con verificador geometrico.

## Capacidades

- Generacion de codigo OpenSCAD parametrico para piezas de laboratorio biologico: el autor menciona 34 familias de piezas (soportes de tubos, embudos, peines de gel, manguitos adaptadores, entre otras).
- Reparacion de scripts OpenSCAD: el dataset incluye ejemplos especificos de correccion de codigo que no renderiza correctamente.
- Salida sujeta a criterios verificables: geometria estanca y caja delimitadora dentro del 15 % de la especificacion dimensional, que fueron los criterios del verificador durante el entrenamiento.
- Entrada de imagen: el pipeline declarado es `image-text-to-text` y el codificador de vision se conserva, por lo que acepta imagenes; la calidad de comprension visual es la heredada del modelo base, no reforzada por este ajuste.
- Conversacion de un solo turno: los datos de entrenamiento son `single-turn`; no hay evidencia de entrenamiento multi-turno.
- Modo de razonamiento: el autor indica explicitamente que debe ejecutarse con el modo thinking **desactivado**.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas; el campo de idiomas del repositorio esta vacio.

## Casos de uso

- **Generacion de utillaje de laboratorio a medida**: a partir de una descripcion con dimensiones (por ejemplo, "soporte para 24 tubos Eppendorf de 1,5 ml, separacion de 9 mm, base de 120 x 80 mm"), el modelo emite un `.scad` parametrico listo para renderizar y enviar a impresion 3D. Es adecuado porque fue entrenado exactamente sobre ese formato de peticion y verificado por render.
- **Reparacion de scripts que no renderizan**: dado un `.scad` que produce geometria abierta o errores de sintaxis, el modelo puede reescribirlo. El dataset incluye ejemplos de reparacion, lo que lo hace util en un pipeline de limpieza de una biblioteca de piezas existente.
- **Generacion de variantes dimensionales de una familia de piezas**: el mismo rack de tubos con distintas separaciones o alturas, modificando parametros. Al estar entrenado sobre familias parametricas, la variacion dimensional dentro de familia es su punto fuerte declarado.
- **Pipeline automatizado de diseno-render-verificacion en CI**: integrar el modelo en un flujo que genere el `.scad`, lo renderice con la CLI de OpenSCAD en modo headless, valide estanqueidad y caja delimitadora con una herramienta tipo trimesh, y reintente en caso de fallo. El modelo encaja como primer generador; el verificador externo cubre su tasa de error.
- **Asistente interno de CAD parametrico para el equipo de diseno**: desplegado con vLLM o TGI detras de una interfaz interna, permite a personal no experto en OpenSCAD obtener scripts base que luego un disenador revisa y ajusta.
- **Generacion de fixtures y utillajes de impresion 3D en laboratorio**: soportes de pipetas, bandejas, adaptadores de portamuestras; piezas de geometria sencilla donde el coste de iterar con el modelo es menor que modelar a mano.
- **Material docente sobre CAD parametrico**: usar sus salidas como ejemplos de codigo OpenSCAD comentado en cursos o talleres, siempre con revision humana.
- **Exploracion desde imagen (con cautela)**: al conservar el codificador de vision, puede recibir un boceto o foto de una pieza junto a la peticion, aunque no hay evidencia de que este ajuste haya mejorado esa via y el autor no la documenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna metrica de exito en generacion OpenSCAD.

Lo unico documentado son los criterios del verificador usado durante el entrenamiento: geometria estanca (watertight) y caja delimitadora dentro del 15 % de la especificacion. El autor advierte ademas de un problema de validez en la evaluacion: varias familias de piezas destiladas siguen la formulacion de los enunciados del benchmark Prompt-to-Bench (soportes de tubos, embudos, peines de gel, manguitos adaptadores) con dimensiones distintas, de modo que las puntuaciones obtenidas en esas tareas son "in-family" y no transferencia a datos no vistos. La v2 (`scadcoder-qwen3.5-9b-3ep`) se propone como linea base held-out, pero no se aportan sus cifras.

## Requisitos de hardware

- **VRAM en bf16**: los pesos ocupan aproximadamente 19,3 GB. Con cache KV y overhead de runtime, el minimo practico ronda los 24 GB, lo que deja poco margen en GPUs de 24 GB (RTX 3090, RTX 4090) y obliga a contextos cortos o a limitar el numero de imagenes por peticion.
- **GPU recomendadas en bf16**: A100 40 GB, L40S 48 GB, H100 80 GB para servir con concurrencia. En RTX 4090 funciona en modo single-user con contexto reducido.
- **Cuantizacion INT8/FP8**: pesos en torno a 10 GB; cabe con holgura en RTX 4090, RTX 4080 Super, A6000 y similares.
- **Cuantizacion INT4**: pesos en torno a 5-6 GB; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y GPUs de portatil con 8-12 GB, siempre que la herramienta soporte la arquitectura.
- **Coste adicional de vision**: cada imagen de entrada incrementa el uso de memoria y el tiempo de prefill; no se dispone de cifras concretas.
- **Opciones de despliegue**: `transformers` (referencia, es la libreria declarada), vLLM y TGI si soportan `Qwen3_5ForConditionalGeneration`; llama.cpp u Ollama solo tras convertir a GGUF, conversion que no se distribuye en el repositorio y cuya viabilidad depende del soporte de la arquitectura en dichas herramientas.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo por generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scadcoder-qwen3.5-9b-v3 | 9,65 B | No disponible | OpenSCAD parametrico para laboratorio biologico | Apache-2.0 | HuggingFace, safetensors bf16 |
| Qwen/Qwen3.5-9B (base) | ~9,65 B (el ajuste LoRA no altera el recuento) | No disponible en la informacion | Proposito general, multimodal imagen-texto | No disponible en la informacion | HuggingFace |
| scadcoder-qwen3.5-9b-3ep (v2) | No disponible | No disponible | OpenSCAD parametrico; linea base held-out segun el autor | No disponible en la informacion | HuggingFace |

Existen modelos de codigo generalistas de tamano comparable (familia Qwen-Coder, DeepSeek-Coder, CodeLlama) que podrian usarse para generar OpenSCAD, pero no se dispone de datos comparativos de rendimiento en este dominio ni en la informacion proporcionada ni, segun la model card, en el repositorio del autor. La comparacion honesta es contra el propio modelo base y contra la v2, y en ambos casos faltan cifras publicadas.

## Limitaciones y advertencias

- **Dominio extremadamente estrecho**: entrenado sobre 34 familias de piezas de laboratorio biologico. Fuera de ese vocabulario y de ese estilo de peticion, el rendimiento es desconocido y probablemente deficiente.
- **Riesgo de sesgo de evaluacion**: parte de los datos sigue la formulacion de Prompt-to-Bench, por lo que cualquier puntuacion en esas tareas esta inflada por contaminacion in-family. No debe presentarse como evidencia de calidad general.
- **Discrepancia en el recuento de datos**: los componentes declarados suman 7.843 ejemplos frente a los 8.784 indicados; conviene no citar la cifra total sin matices.
- **Alucinacion geometrica**: como cualquier modelo de codigo, puede producir scripts que renderizan pero con dimensiones erroneas, o que directamente fallan. El verificador solo actuo durante el entrenamiento; en produccion hay que reimplementarlo.
- **Solo un turno**: no hay entrenamiento multi-turno; no es adecuado como asistente conversacional de CAD con iteraciones largas sin un envoltorio externo que reconstruya contexto.
- **Modo thinking obligatoriamente desactivado**: ejecutarlo con razonamiento activado puede degradar la salida, segun indicacion explicita del autor.
- **Idiomas no documentados**: el campo de idiomas esta vacio; el soporte de castellano no esta verificado y los datos de entrenamiento parecen estar en ingles.
- **Procedencia de los datos destilados**: 336 ejemplos provienen de Claude Opus. Aunque la licencia del repositorio es Apache-2.0, la procedencia de esas salidas merece revision legal antes de un uso comercial, por las condiciones de uso del proveedor original.
- **Licencia del modelo base**: el ajuste se declara Apache-2.0, pero conviene verificar los terminos de `Qwen/Qwen3.5-9B`, ya que la informacion disponible no los recoge.
- **Sin validacion de la comunidad**: cero descargas y cero likes en el momento de la consulta; sin informes independientes de uso.
- **Soporte de herramientas incierto**: al tratarse de una arquitectura reciente (`qwen3_5`), puede no estar soportada aun por vLLM, TGI, llama.cpp u Ollama, lo que limita las opciones de despliegue eficiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ATinyGreenCell/scadcoder-qwen3.5-9b-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Version anterior (v2, linea base held-out): https://huggingface.co/ATinyGreenCell/scadcoder-qwen3.5-9b-3ep
- Repositorio Prompt-to-Bench (detalles del sesgo de evaluacion en la seccion 6.4): https://github.com/ATinyGreenCell/prompt-to-bench
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
