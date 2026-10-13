# Jarrodbarnes/qwen3.5-9b-pde-solver

## Resumen

Qwen3.5-9B PDE Solver es un adaptador de bajo rango (LoRA) sobre el modelo causal Qwen3.5-9B, desarrollado por Jarrod Barnes, especializado en generar funciones de Python que resuelven ecuaciones en derivadas parciales (EDP) de forma numérica. Dado un enunciado con la ecuación, sus coeficientes, la malla espacial y el estado inicial, el adaptador produce un programa que devuelve la solución en cada instante solicitado. No es un modelo de pesos completos: se distribuye como adaptador PEFT (rank 32, alpha 32, 86,6 millones de parametros entrenables) y requiere el modelo base para funcionar.

El problema que aborda es concreto: los modelos generalistas rara vez escriben solvers numericos correctos a la primera para EDP no triviales. El adaptador se entreno con aprendizaje por refuerzo contra un verificador fisico que ejecuta cada programa generado en un sandbox y lo compara con una solucion de referencia; solo cuenta como acierto si el codigo se ejecuta, devuelve el array con la forma pedida y mantiene un error RMSE normalizado por rango inferior al 1% en todos los tiempos de salida. Sobre diez familias de ecuaciones excluidas del entrenamiento, la precision al primer intento pasa del 9,0% del modelo base al 55,7%, por encima de dos modelos abiertos sustancialmente mayores evaluados con el mismo verificador (GLM-5.3, 49,1%; MiMo-V2.6-Pro, 45,6%).

Es relevante ahora porque ejemplifica una linea de trabajo en auge: usar verificadores ejecutables como senal de recompensa para specializar modelos pequenos en dominios cientificos donde la correccion es comprobable mecanicamente. El adaptador esta pensado para investigacion en computacion cientifica y como linea base para entrenamiento y evaluacion basados en verificador, no como sustituto de un solver de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, alpha 32) sobre un modelo de lenguaje causal (Qwen3.5-9B); arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | No disponible para el adaptador (86,6 M entrenables); el modelo base se denomina Qwen3.5-9B, cifra exacta no confirmada en la informacion proporcionada |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado con 9.728 tokens en total y hasta 9.216 generados; 10.240 recomendados para servir. Modo thinking desactivado |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles en los prompts; salida en Python |
| Licencia | Apache 2.0, consistente con la del modelo base |
| Formato de pesos | PEFT (adaptador LoRA) en safetensors; tamano del repositorio 0,3 GB |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estandar de PEFT: una LoRA de rango 32 y alpha 32 insertada sobre Qwen3.5-9B, inicializada a cero, sin ajuste fino supervisado previo. El entrenamiento arranca directamente desde el modelo base y se apoya en optimizacion de politica relativa a grupos asincrona implementada en NeMo RL, con perdida CISPO y una ventaja estilo MaxRL: la recompensa de cada programa menos la media del grupo se divide por la media del grupo en lugar de por su desviacion tipica (normalizacion con media de grupo mas 0,01).

Los datos son problemas generados proceduralmente a partir de ocho familias de EDP siguiendo los procedimientos del benchmark RLVP: adveccion, Burgers, reaccion-difusion en una y dos dimensiones, difusion-sorcion, flujo de Darcy, Navier-Stokes incompresible y aguas someras. En la fase final se anadieron tres familias lineales (adveccion en dominios no unitarios, ecuacion de Airy e hiperdifusion). Cada problema especifica ecuacion, coeficientes, malla, condicion inicial y, cuando la referencia depende de ello, la convencion de malla y de contorno. Antes de cada fase, los problemas candidatos se cribaban con el modelo del momento y se descartaban los ya resueltos en al menos seis de ocho intentos; tambien se excluyeron las familias que ningun solver independiente supera con el umbral del 1%.

La innovacion tecnica clave es la funcion de recompensa verificable: cero para cualquier salida no mejor que el mejor predictor trivial del problema, credito parcial por mejora logaritmica sobre ese predictor y credito completo al cumplir el umbral del 1%. El entrenamiento duro 256 actualizaciones en ocho fases de 32, con 8 problemas por actualizacion, 16 muestras por problema (unos 32.800 intentos en total), tasa de aprendizaje de 1e-6 en la primera actualizacion de cada fase y 1e-5 despues, optimizador AdamW con weight decay 0,01 y estado conservado entre fases, penalizacion KL de 0,001 respecto al modelo base y temperatura de muestreo 0,7.

## Capacidades

- Generacion de codigo cientifico: escribe funciones Python que resuelven EDP dependientes del tiempo y estacionarias en una y dos dimensiones sobre mallas estructuradas.
- Interpretacion de especificaciones numericas: toma ecuacion, coeficientes, malla, condicion inicial y convenciones de contorno, y devuelve la solucion en todos los tiempos solicitados.
- Razonamiento de solucion paso a paso sobre metodos numericos: diferencias finitas, esquemas de avance temporal y manejo de condiciones de frontera dentro del codigo generado.
- Generalizacion a familias no vistas: 55,7% de acierto al primer intento en diez familias excluidas del entrenamiento, y 88,2% de problemas resueltos dentro de 8 intentos.
- Capacidad de seleccion por residual: el mejor de 8 intentos, seleccionado por residual de la EDP, acierta en el 87,8% de los casos, lo que permite usarlo con muestreo multiple y filtrado.
- Idiomas: prompts en ingles; la salida es codigo Python (no hay soporte multilingue declarado).
- No se documenta soporte de tool calling, function calling, uso agentico, vision, audio ni modo de razonamiento explicito (el thinking mode esta desactivado en el entrenamiento).

## Casos de uso

- Generacion de borradores de solvers en investigacion numerica: dado un problema nuevo de adveccion o reaccion-difusion 2D, el adaptador produce una primera implementacion en Python que el investigador valida contra una solucion analitica o un metodo de confianza, reduciendo el tiempo de puesta en marcha.
- Linea base para entrenamiento con verificador: sirve como punto de comparacion reproducible en experimentos de RL con recompensa ejecutable, gracias a sus conjuntos de evaluacion fijos (288 problemas en distribucion, 135 de transferencia) y semillas identicas.
- Banco de pruebas de evaluacion cientifica de LLM: el verificador (ejecucion en sandbox en menos de 30 s, forma correcta y RMSE relativo por debajo de 0,01 en cada tiempo) es directamente reutilizable para medir otros modelos.
- Aumento de productividad en prototipado de simulaciones: genera el esqueleto de un solver para flujo de Darcy o aguas someras sobre malla estructurada que despues se refina con esquemas de mayor orden o mallas adaptativas.
- Generacion de codigo con muestreo multiple y filtrado por residual: en un pipeline por lotes se lanzan ocho generaciones por problema y se elige la de menor residual de la EDP, lo que eleva la tasa de exito util del 55,7% al 87,8%.
- Docencia y formacion en metodos numericos: el codigo generado sirve como material de partida para ilustrar discretizaciones de terminos de adveccion, difusion y reaccion, siempre con revision humana del resultado.
- Investigacion sobre transferencia entre familias de ecuaciones: permite estudiar por que el rendimiento en familias no vistas (55,7%) supera al de familias vistas (47,3%) y como afecta la seleccion de problemas durante el entrenamiento.

## Benchmarks y rendimiento

Datos publicados en la model card. Metrica: una respuesta es correcta si se ejecuta en menos de 30 segundos, devuelve la forma pedida y su RMSE dividido por el rango de la referencia es como maximo 0,01 en todos los tiempos solicitados; la precision al primer intento se estima con ocho muestras por problema, se promedia por familia y luego entre familias.

| Metrica | Base | Update 128 | Update 160 | Update 256 |
|---|---:|---:|---:|---:|
| Primer intento, en distribucion | 6,6% | 28,4% | 36,2% | 47,3% |
| Primer intento, familias no vistas | 9,0% | 31,6% | 39,8% | 55,7% |
| Resueltos en 8 intentos, familias no vistas | 47,2% | 77,2% | 82,6% | 88,2% |
| Mejor de 8 por residual de la EDP, familias no vistas | 46,4% | 76,4% | 81,2% | 87,8% |
| Conjunto sellado de familias no vistas (137 problemas nuevos) | No disponible | No disponible | 41,6% | No disponible |

Comparacion con otros modelos bajo el mismo verificador (familias no vistas, primer intento):

| Modelo | Precision al primer intento |
|---|---:|
| Qwen3.5-9B PDE Solver (update 256) | 55,7% |
| GLM-5.3 | 49,1% |
| MiMo-V2.6-Pro | 45,6% |

No se publican en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks generalistas para este adaptador.

## Requisitos de hardware

- El adaptador pesa 0,3 GB; el consumo real lo determina el modelo base Qwen3.5-9B, que debe cargarse completo.
- VRAM estimada para el modelo base (orientativa, no publicada por el autor): en precision de 16 bits, en torno a 18 GB solo en pesos, mas cache KV para prompts de hasta 9.728 tokens; en cuantizacion de 4 bits, en torno a 5-7 GB de pesos.
- GPU recomendadas: para servicio en 16 bits, A100 40/80 GB, H100 o L40S con holgura; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) en 16 bits muy al limite una vez sumada la cache KV.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super, RTX 4080) con contexto reducido respecto al maximo.
- Opciones de despliegue: transformers con PEFT (ruta mas directa, la libreria declarada es peft), vLLM con soporte de adaptadores LoRA para servicio con concurrencia, TGI con adaptadores. No se distribuye version GGUF ni cuantizada; el uso con llama.cpp u Ollama exigiria fusionar el adaptador con el base y convertir, procedimiento no documentado por el autor.
- Latencia y throughput: no disponibles. Como referencia de carga, cada solucion puede requerir hasta 9.216 tokens generados y el verificador da un margen de 30 segundos de ejecucion por programa, por lo que la generacion de codigo largo, no la ejecucion, domina la latencia.
- Recomendacion practica: desplegar en 4 bits para experimentacion y en 16 bits para lotes de evaluacion donde la precision del muestreo importe.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Precision al primer intento (familias no vistas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-9B PDE Solver | LoRA sobre LLM causal | 86,6 M entrenables sobre un base de 9B (denominacion) | 9.728 tokens de entrenamiento, 10.240 recomendados para servicio | 55,7% | Apache 2.0 | Adaptador en HuggingFace |
| Qwen3.5-9B (base) | LLM causal | 9B (denominacion) | No disponible | 9,0% | No disponible en la informacion proporcionada | HuggingFace |
| GLM-5.3 | No disponible | No disponible (descrito como sustancialmente mayor) | No disponible | 49,1% | Peso abierto (open-weight) | Peso abierto |
| MiMo-V2.6-Pro | No disponible | No disponible (descrito como sustancialmente mayor) | No disponible | 45,6% | Peso abierto (open-weight) | Peso abierto |

La comparacion es valida porque los tres modelos se evaluaron con el mismo verificador fisico y el mismo umbral del 1%. No se dispone de comparaciones con otros adaptadores especializados en EDP ni con solvers numericos clasicos bajo esta misma metrica.

## Limitaciones y advertencias

- Los solvers generados son borradores: deben validarse contra la ecuacion, limites analiticos conocidos o un metodo independiente de confianza antes de cualquier uso.
- Fuera de alcance declarado: problemas tridimensionales, mallas no estructuradas, geometrias complejas, acoplamiento multifisico, problemas inversos y cargas de simulacion en produccion.
- No debe utilizarse para decisiones de ingenieria criticas para la seguridad sin verificacion independiente.
- Ejecuta codigo generado: es imprescindible aislarlo en un sandbox con limites de tiempo (el propio verificador usa 30 segundos), memoria y acceso al sistema de archivos.
- Idiomas: solo prompts en ingles; no hay soporte multilingue. Las peticiones en castellano pueden degradar la calidad del codigo generado.
- La ventana de contexto es limitada: entrenado con 9.728 tokens en total y hasta 9.216 generados. No admite contextos largos de documentos ni conversaciones multi-turno extensas.
- Modo thinking desactivado: no se beneficia de razonamiento explicito en cadena larga.
- Riesgo de alucinacion: puede producir codigo que se ejecuta sin errores pero implementa un esquema numerico incorrecto; solo la verificacion contra referencia lo detecta. Incluso en el mejor checkpoint, el 44,3% de los primeros intentos en familias no vistas es incorrecto.
- Rendimiento desigual por familia: la precision media del 55,7% oculta variacion entre familias de ecuaciones; en el conjunto sellado de 137 problemas nuevos el mejor dato publicado (update 160) baja al 41,6%, lo que indica sensibilidad al reparto de problemas.
- Sin ajuste fino supervisado: toda la capacidad proviene del RL, lo que puede reducir la robustez ante formatos de entrada distintos de los vistos en entrenamiento.
- Licencia Apache 2.0 para el adaptador (uso comercial permitido), pero el uso queda condicionado por la licencia del modelo base Qwen3.5-9B, cuyos terminos no se detallan en la informacion proporcionada.
- Procedencia del artefacto: repositorio con cero descargas y cero likes en el momento de la consulta; no hay evidencia de validacion independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jarrodbarnes/qwen3.5-9b-pde-solver
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Articulo de investigacion del autor (receta de entrenamiento, verificador y conjuntos de evaluacion): https://jbarnes850.github.io
- Identificador arXiv referenciado en las etiquetas del repositorio: arXiv:2607.10474 (sin enlace directo en la informacion proporcionada)
- Benchmark RLVP, cuyos procedimientos se usaron para generar los datos: referencia citada en la model card, sin URL en la informacion disponible
