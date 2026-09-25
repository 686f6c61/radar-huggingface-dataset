# ApplePiesFromScratch/process-calc

## Resumen

`ApplePiesFromScratch/process-calc` no es un modelo de lenguaje. La propia model card lo declara de forma explicita en su primera linea: "Not a language model. One file.". Se trata de un unico archivo Python (`PROCESS.py`) que expone tres funciones —`isolate`, `mix` y `rate`— y opera sobre `fractions.Fraction`, es decir, sobre aritmetica racional exacta en lugar de coma flotante. El autor lo publica en HuggingFace bajo la etiqueta de "model", pero su naturaleza es la de una libreria de calculo, no la de una red neuronal con pesos entrenados.

El interes tecnico, por tanto, no esta en capacidades generativas ni en benchmarks de razonamiento, sino en el enfoque formal que propone: una "process calculus" con numeros duales (`dual-numbers` es una de sus etiquetas) que, segun el ejemplo de la model card, permite obtener el valor 6 al evaluar `rate(mix(x, x), x)` con `x = isolate(3, 1)`. El autor afirma ademas que las semillas `1`, `2`, `1/2` y `-1` producen el mismo resultado para `x*x` en 3, y que entradas como `float`, `bool`, semilla `0` o una rejilla de certificacion vacia devuelven `θ`.

Es relevante ahora unicamente como pieza de un flujo mas amplio: el propio autor indica que no puntua en `lm-eval` a menos que se conecte como *tool* de un LLM. Es decir, su utilidad practica aparece cuando se integra como herramienta de calculo exacto dentro de un agente, no como sustituto de un modelo. El repositorio asociado en GitHub lo describe como "Complete Process Calculus. No entities, no infinities, no paradox. GR derived from observation.", una formulacion matematica sin validacion externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es una red neuronal. Libreria Python de un solo archivo (`PROCESS.py`) con aritmetica exacta sobre `fractions.Fraction` y semantica declarada de numeros duales |
| Parametros totales | No aplica (no hay pesos entrenados; no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: no procesa secuencias de texto |
| Tipos de cuantizacion | No aplica: no hay pesos que cuantizar |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | No aplica. Se distribuye como codigo fuente Python (`PROCESS.py` + `README.md`) |
| Autor | ApplePiesFromScratch (James Alexander Pugmire) |
| Fecha de publicacion | 2026-09-24 (creado y actualizado el mismo dia) |
| Descargas / likes | 0 / 0 |
| Etiquetas | `process-calc`, `exact-arithmetic`, `dual-numbers`, `region:us` |

## Arquitectura y entrenamiento

No existe entrenamiento. El artefacto es un modulo Python que implementa tres operaciones —`isolate`, `mix` y `rate`— sobre el tipo `fractions.Fraction` de la biblioteca estandar. La interfaz publica es minima y se documenta con un unico ejemplo:

```python
from PROCESS import isolate, mix, rate
x = isolate(3, 1)
print(rate(mix(x, x), x))  # 6
```

La etiqueta `dual-numbers` sugiere que `isolate` construye un par (valor, derivada) y que `mix` y `rate` operan sobre ese par siguiendo el formalismo de numeros duales, lo que encajaria con el resultado `6` del ejemplo (derivada de `x*x` en `x = 3`). No obstante, la model card no desarrolla la semantica formal de cada funcion, por lo que esta lectura es una inferencia a partir del ejemplo y de las etiquetas, no una afirmacion documentada.

El autor menciona un "gauge" (rejilla de comprobacion) con las semillas `1`, `2`, `1/2` y `-1`, y una condicion de fallo o valor especial `θ` para entradas no validas (`float`, `bool`, semilla `0`, rejilla de certificacion vacia). No se publican detalles sobre el algoritmo de normalizacion, el manejo de errores, la cobertura de tests ni el rendimiento. Tampoco hay informacion sobre datos de entrenamiento, RLHF o DPO, porque no aplican.

## Capacidades

- Aritmetica racional exacta: opera sobre `fractions.Fraction`, evitando los errores de redondeo de `float`. Es la unica capacidad verificable a partir de la documentacion.
- Evaluacion estilo numeros duales: el par `isolate` / `mix` / `rate` permite obtener un resultado numerico a partir de una composicion, segun el ejemplo publicado (`rate(mix(x, x), x)` devuelve `6` para `x = isolate(3, 1)`).
- Tolerancia a semillas distintas: el autor afirma que las semillas `1`, `2`, `1/2` y `-1` producen el mismo resultado en la evaluacion de `x*x` en 3.
- Deteccion de entradas invalidas: `float`, `bool`, semilla `0` y rejilla de certificacion vacia devuelven `θ` segun la model card.
- Integracion como herramienta: el autor indica que puede adjuntarse como *tool* a un LLM (por ejemplo, via *function calling*) para delegar calculo exacto.
- Generacion de texto: no soportada. No es un modelo de lenguaje.
- Razonamiento, codigo, matematicas simbolicas generales, vision, audio: no disponibles.
- *Tool calling* nativo, agentes, razonamiento multi-paso: no aplica al artefacto por si mismo; solo en el escenario de envolverlo como herramienta externa.
- Capacidades multilingues: no aplica.

## Casos de uso

- Herramienta de calculo exacto para agentes LLM: un agente que necesite derivar o evaluar expresiones racionales sin tolerar error de coma flotante puede invocar `PROCESS.py` via *function calling*, con lo que el modelo de lenguaje se limita a orquestar y la aritmetica la resuelve codigo determinista.
- Material docente de numeros duales: el ejemplo `isolate`/`mix`/`rate` sirve para ilustrar diferenciacion automatica basica en un curso, ya que el resultado es reproducible en tres lineas y no requiere instalar dependencias externas.
- Verificacion de pipelines numericos: al usar `Fraction`, los resultados son exactos y comparables bit a bit, lo que permite usarlo como referencia en tests de regresion frente a implementaciones en coma flotante.
- Prototipado de calculo simbolico acotado: para expresiones sencillas donde interesa un resultado racional exacto y no la potencia de un sistema de algebra computacional completo, el coste de adopcion es un unico archivo.
- Demostracion de calculo con limites: la model card lo plantea como alternativa a una derivada escolar con "limit drop", imprimiendo `6` en tres escrituras. Es un caso de uso de demo, no de produccion.
- Integracion en un Space de HuggingFace: el autor sugiere desplegarlo como Space que ejecute unicamente el fragmento de codigo del README, util para compartir el comportamiento sin exponer una API de modelo.
- Bloque de validacion en un sistema mayor de algebra: puede actuar como comprobador de resultados parciales antes de pasarlos a una capa de presentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor rechaza explicitamente esta via de evaluacion: indica que el archivo "no puntua en `lm-eval`" salvo que se conecte como herramienta, y que "GSM8K es parseo" y no debe puntuarse como si fuera una mente. Las unicas comprobaciones declaradas son internas y no constituyen un benchmark:

| Comprobacion declarada por el autor | Resultado |
|---|---|
| `rate(mix(x, x), x)` con `x = isolate(3, 1)` | 6 |
| `x*x` en 3 con semillas `1`, `2`, `1/2`, `-1` | 6 en los cuatro casos |
| Entradas `float`, `bool`, semilla `0`, rejilla de certificacion vacia | θ |

Estos valores proceden de la model card y no han sido verificados de forma independiente en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica. No hay pesos ni inferencia sobre GPU. El consumo es el de un proceso Python cualquiera ejecutando aritmetica racional sobre `Fraction`.
- GPU recomendadas: ninguna. Funciona en CPU.
- GPU de consumo: no aplica; cualquier CPU es suficiente para el fragmento documentado.
- Memoria RAM: no disponible de forma cuantificada; dependeria del tamano de los numeradores y denominadores manejados, no de un modelo.
- Dependencias: solo la biblioteca estandar de Python (`fractions`). No requiere PyTorch, transformers ni CUDA.
- Opciones de despliegue: importacion directa como modulo Python (`from PROCESS import isolate, mix, rate`), empaquetado como paquete pip, exposicion como API propia, o publicacion como HuggingFace Space. No es compatible con vLLM, llama.cpp, Ollama ni TGI, porque no existen pesos que servir.
- Latencia y throughput: no disponibles. Al ser aritmetica exacta sobre racionales, el coste crece con el tamano de los numeros involucrados; no se publican mediciones.

## Comparativa con modelos similares

No hay modelos comparables en el sentido habitual (LLM de misma escala o tarea), porque este artefacto no es un modelo entrenado. La comparacion pertinente es con librerias de aritmetica exacta y calculo simbolico:

| Alternativa | Proposito | Parametros / contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| `process-calc` | Aritmetica racional exacta con `isolate`/`mix`/`rate` | No aplica / no aplica | MIT | HuggingFace y GitHub del autor | No disponibles |
| `fractions` (stdlib de Python) | Aritmetica racional exacta | No aplica / no aplica | PSF (Python) | Biblioteca estandar, incluida en Python | No aplica |
| SymPy | Algebra computacional simbolica completa | No aplica / no aplica | BSD | PyPI, muy extendida | No aplica |
| mpmath | Aritmetica de precision arbitraria | No aplica / no aplica | BSD | PyPI | No aplica |

Frente a `fractions`, `process-calc` anade la capa `isolate`/`mix`/`rate` y la semantica de numeros duales, pero aporta mucha menos documentacion y ningun historial de uso. Frente a SymPy o mpmath, su alcance es deliberadamente minimo: un archivo, sin dependencias y sin cobertura de funciones mas alla de las tres expuestas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas, no razona ni procesa lenguaje natural. Cualquier uso como sustituto de un LLM es un error de categoria.
- Sin benchmarks verificables: no hay resultados de MMLU, HumanEval, GSM8K ni de ningun otro conjunto. El autor declina explicitamente ser evaluado con `lm-eval`.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin issues, forks ni citas conocidas que respalden las afirmaciones del autor.
- Documentacion minima: la semantica formal de `isolate`, `mix` y `rate` no se especifica; solo existe un ejemplo. El comportamiento ante casos borde (enteros negativos grandes, denominadores compuestos, composiciones anidadas) es no disponible.
- Vocabulario propio sin definiciones: terminos como "process calculus", "dual numbers", "gauge", "certify grid" y el valor especial `θ` aparecen sin definicion formal en la model card. Interpretarlos requiere leer el repositorio.
- Afirmaciones no contrastadas: el repositorio afirma "No entities, no infinities, no paradox. GR derived from observation." Es una declaracion del autor sin respaldo documental publicado en la informacion disponible.
- Riesgo de confusion en el ecosistema: aparece listado como "model" en HuggingFace con etiqueta de pipeline no disponible, lo que puede llevar a herramientas de descubrimiento o de evaluacion automatica a tratarlo como un modelo y producir errores.
- Licencia: MIT, permisiva y compatible con uso comercial. No obstante, al no haber garantias ni tests publicados, el uso en produccion queda bajo responsabilidad de quien lo integre.
- Idiomas: no aplica. No hay capacidades multilingues.
- Mantenimiento: proyecto de un unico autor, publicado y actualizado el mismo dia. No hay indicios de soporte continuado.
- En produccion: conviene envolverlo con validacion de tipos propia y tests de regresion antes de confiar en los valores devueltos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApplePiesFromScratch/process-calc
- Perfil del autor en HuggingFace: https://huggingface.co/ApplePiesFromScratch
- Conjuntos de datos del autor en HuggingFace: https://huggingface.co/ApplePiesFromScratch/datasets
- Repositorio GitHub `ProcessCalc`: https://github.com/ApplePiesFromScratch/ProcessCalc
- README del repositorio: https://github.com/ApplePiesFromScratch/ProcessCalc/blob/main/README.md
