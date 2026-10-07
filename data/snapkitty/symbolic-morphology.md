# Snapkitty/symbolic-morphology

## Resumen

Symbolic Morphology Engine es un motor de aprendizaje simbólico desarrollado por Snapkitty que aprende morfología verbal latina a partir de secuencias crudas de caracteres (por ejemplo `AMO`, `AMABAT`, `REGUNT`) y produce vectores booleanos de rasgos gramaticales (persona, número, tiempo, modo, voz y clase de conjugación). No es un modelo generativo de lenguaje ni un transformer: se trata de una red neuronal diferenciable construida íntegramente desde cero, sin PyTorch, TensorFlow ni diferenciación automática, donde cada derivada se calcula a mano mediante la regla de la cadena.

El proyecto se distribuye como código fuente replicado desde GitHub en seis entornos de ejecución (Rust, C#, F#, Python en coma flotante, Python a nivel de puertas NAND, y variantes mencionadas en las etiquetas como APL, BQN, Forth y Mojo). La arquitectura es deliberadamente minimalista: embeddings de caracteres de 16 dimensiones, pooling por media, una capa oculta de 32 dimensiones con activación tanh, una capa de salida de 23 dimensiones con sigmoide y un umbral de 0,5 para obtener predicciones booleanas.

Su relevancia es fundamentalmente didáctica y de investigación: demuestra cómo construir un clasificador morfológico completo desde primitivas matemáticas y puertas lógicas, sirviendo como banco de pruebas multiplataforma y como material educativo sobre redes neuronales sin dependencias. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto muy reciente y sin adopción comunitaria documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal simbolica from-scratch: embeddings de caracteres (16-dim) + mean pooling + capa oculta tanh (32-dim) + capa de salida sigmoide (23-dim) y umbral a 0,5; grafo diferenciable implementado a mano |
| Parametros totales | no disponible (la model card describe las dimensiones por capa pero no indica el recuento total) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa palabras individuales como secuencias de caracteres; no emplea ventana de contexto tipo transformer) |
| Tipos de cuantizacion | no disponible / no aplica (no se publican pesos cuantizados) |
| Idiomas soportados | latin (la) e ingles (en) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (el repositorio distribuye codigo fuente en seis runtimes; no se publican pesos en safetensors, GGUF ni formatos equivalentes) |

## Arquitectura y entrenamiento

El sistema se organiza en tres capas estrictas: una capa de observación que convierte la palabra latina en un array de caracteres y sus índices, una capa de aprendizaje que aplica embeddings, mean pooling, una capa oculta con tanh y una capa de salida con sigmoide, y una capa simbólica que umbraliza las salidas continuas en el rango [0, 1] para obtener rasgos gramaticales booleanos. El paso hacia adelante para una palabra `w = c₁c₂…cₙ` consiste en: búsqueda de embeddings por carácter, media de los embeddings, transformación lineal más bias, tanh, nueva transformación lineal y sigmoide.

El entrenamiento utiliza entropía cruzada binaria contra objetivos conocidos, propagación hacia atrás mediante la regla de la cadena calculada manualmente y descenso de gradiente para actualizar parámetros. No hay reglas codificadas a mano ni palabras fijadas en el código: el sistema descubre regularidades estadísticas (raíces, sufijos, patrones posicionales) y las asigna a categorías gramaticales mediante optimización. La model card menciona una sección de generalización y otra de convergencia booleana, así como una variante a nivel de puertas NAND que simula el motor desde primitivas lógicas, pero el detalle numérico de esas secciones no está incluido en la información disponible. El corpus de entrenamiento consiste en formas verbales latinas, según lo indicado, aunque no se especifica el número de tokens ni la composición exacta del dataset.

## Capacidades

- Analisis morfologico de formas verbales latinas: extrae persona, numero, tiempo, modo, voz y clase de conjugacion como vector booleano de 23 dimensiones.
- Clasificacion simbolica con salida interpretable: las predicciones se umbralizan a TRUE/FALSE en lugar de generar texto.
- Generalizacion a partir de caracteres crudos: aprende patrones de raiz, sufijo y posicion sin reglas explicitas codificadas.
- Implementacion multiplataforma: misma matematica replicada en Rust, C#, F#, Python (coma flotante) y Python (simulacion a nivel de NAND), con etiquetas que ademas apuntan a APL, BQN, Forth y Mojo.
- Ejecucion sin dependencias externas ni framework de machine learning, con derivadas calculadas manualmente.
- Soporte de idiomas limitado a latin e ingles segun las etiquetas del repositorio.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, vision ni audio: no es un modelo generativo ni multimodal.

## Casos de uso

- Enseñanza de latin asistida: dado un verbo como `AMABAT`, el motor devuelve sus rasgos gramaticales booleanos, util para ejercicios de analisis morfologico automatico en plataformas educativas.
- Investigacion en filologia clasica y humanidades digitales: preprocesado y etiquetado morfologico de corpus de textos latinos para anotacion gramatical a escala.
- Material didactico sobre redes neuronales: al implementar el forward pass, la retropropagacion y el descenso de gradiente sin frameworks, sirve para explicar el funcionamiento interno de un clasificador neuronal paso a paso.
- Benchmarking multiplataforma: permite comparar rendimiento y comportamiento numerico de la misma matematica en Rust, C#, F#, Python y simulacion NAND, con una seccion de benchmarks sobre nueve runtimes.
- Investigacion en computacion a bajo nivel: la variante NAND reproduce el motor desde puertas logicas, util para estudiar la equivalencia entre redes neuronales y circuitos booleanos.
- Analisis morfologico en entornos con recursos minimos: al no requerir GPU ni dependencias, puede integrarse en scripts ligeros o sistemas embebidos para procesar palabras latinas.
- Prototipado de pipelines linguisticos: puede actuar como componente de etiquetado morfologico dentro de un sistema mayor de procesamiento de latin antes de escalar a modelos estadisticos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia una seccion de benchmarks con nueve runtimes y describe variantes de implementacion (Rust, C#, F#, Python float, Python NAND), pero no incluye cifras concretas de precision, perdida, tiempos de ejecucion ni comparaciones numericas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el motor no esta disenado para GPU y su tamano descrito (embeddings de 16-dim, capa oculta de 32-dim, salida de 23-dim) es minimo.
- GPU recomendadas: no aplica; el sistema funciona en CPU.
- Compatibilidad con GPU de consumo: no requiere GPU; se ejecuta en cualquier equipo capaz de compilar Rust, .NET 8, Python 3.12 o los runtimes alternativos etiquetados.
- Opciones de despliegue: compilacion e invocacion directa del codigo fuente en cada runtime (cargo para Rust, dotnet para C#/F#, interprete de Python), sin integracion descrita con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de motor.
- Latencia y throughput estimados: no disponible; no se aportan cifras en la informacion consultada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria. Cabe senalar que este motor no es equiparable a modelos de lenguaje generativos ni a toolkits de morfologia estadistica convencionales (como analizadores basados en CRF o modelos neuronales con frameworks), por lo que una comparativa directa exigiria definir primero la metrica y el entorno de evaluacion, datos que no constan.

## Limitaciones y advertencias

- Ambito restringido: cubre morfologia verbal latina segun lo descrito; no es un modelo de lenguaje general ni genera texto libre.
- Idiomas limitados a latin e ingles, sin capacidades multilingues mas alla de esas etiquetas.
- No se detalla el corpus de entrenamiento (numero de tokens, composicion, procedencia), lo que dificulta evaluar sesgos y cobertura.
- Riesgo de alucinacion no aplica en el sentido generativo, pero puede producir clasificaciones morfologicas erroneas en formas verbales poco representadas.
- Licencia AGPL-3.0: es copyleft fuerte; el uso comercial o la integracion en servicios de red puede obligar a liberar el codigo derivado bajo los mismos terminos.
- Artefacto sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion ni validacion externa.
- Documentacion parcial en la informacion disponible: secciones como benchmarks, generalizacion, convergencia booleana y nucleo de atencion aparecen referenciadas pero su contenido no esta incluido.
- Sin resultados de benchmarks publicados que permitan verificar su precision real.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/symbolic-morphology
- Repositorio GitHub: https://github.com/SNAPKITTYWEST/symbolic-morphology (commit `d23a58c`)
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
