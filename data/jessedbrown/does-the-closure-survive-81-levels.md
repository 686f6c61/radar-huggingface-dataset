# Jessedbrown/does-the-closure-survive-81-levels

## Resumen

Este repositorio de HuggingFace no contiene un modelo de lenguaje ni una red neuronal, sino una demostración matemática computacional publicada como artefacto de código. Su autor, Jesse Daniel Brown (identificado en la model card como "OP-JESSE"), lo presenta como la verificación de que una estructura algebraica concreta (tres brazos que suman cero y un centro libre) se mantiene cerrada bajo anidamiento recursivo a lo largo de una escalera de profundidad basada en potencias de tres (3ⁿ). El problema que aborda es si, al anidar 27 o 81 copias de la estructura, el centro permanece libre o si se acumula un residuo por nivel que rompería la construcción en alguna profundidad.

El resultado central que reporta la model card es que, trabajando con aritmética entera exacta, la clausura se mantiene en todas las profundidades probadas (hasta 13 por enumeración exhaustiva, y hasta 27 y 81 por camino único con aritmética de fracciones), mientras que en coma flotante de 64 bits el residuo aparece ya en la profundidad 1 y crece hasta valores del orden de 10²⁴ en la profundidad 81. El repositorio no incluye pesos, tokenizador ni pipeline de inferencia; se distribuye como un script `compose.py` que se ejecuta en aproximadamente un minuto y un `index.html` autocontenido.

Es relevante en su contexto porque plantea un argumento técnico sobre la elección del tipo de dato (entero frente a coma flotante) como factor determinante de la estabilidad estructural a gran profundidad, y porque se publica de forma deliberadamente abierta y sin dependencias. Para el lector de un blog de modelos de IA, conviene subrayar que no se trata de un modelo evaluable con benchmarks de NLP ni desplegable con vLLM, Ollama o llama.cpp, sino de material de investigación matemática alojado en la plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica; demostracion matematica sobre aritmetica ternaria balanceada y estructuras anidadas, no es una red neuronal |
| Parametros totales | No aplica (no es un modelo de aprendizaje automatico) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No aplica; el artefacto son archivos de codigo (`compose.py`) y HTML (`index.html`) |

Otros datos del repositorio:

| Parametro | Valor |
|---|---|
| Identificador | Jessedbrown/does-the-closure-survive-81-levels |
| Autor | Jessedbrown (Jesse Daniel Brown, "OP-JESSE") |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | No disponible |
| Etiquetas | region:us |
| Fecha de creacion | 2026-10-16 |
| Fecha de actualizacion | 2026-08-07 |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red neuronal en el sentido habitual. El "modelo" es un conjunto de rutinas de enumeración y verificación aritmética. La estructura estudiada se describe como tres brazos que suman cero con un centro libre, y la operación que se prueba es su anidamiento recursivo en una jerarquía de profundidad creciente. La innovación metodológica declarada es la comparación sistemática entre dos "portadores" aritméticos: enteros exactos y coma flotante de 64 bits, aplicando las mismas operaciones y el mismo camino de cómputo en ambos casos.

El autor distingue dos regímenes de verificación. Hasta profundidad 13 la comprobación es exhaustiva, con enumeración completa de las hojas del árbol (1.594.323 hojas en el nivel 13). Para las profundidades 27 y 81, que implicarían 3²⁷ ≈ 7,6 × 10¹² hojas y no son enumerables en ninguna máquina, se recorre un único camino implementado con aritmética de fracciones (`Fraction`) sin redondeo. El autor etiqueta explícitamente ese resultado como "camino único, exacto, no muestreado". El código se ejecuta con `python compose.py` y, según la model card, reproduce todas las cifras en aproximadamente un minuto, sin servidor, sin red, sin GPU y sin cuenta.

## Capacidades

- Verificación por enumeración exhaustiva de la propiedad de clausura bajo anidamiento hasta profundidad 13 (1.594.323 hojas), con cero violaciones de la suma nula.
- Cálculo exacto mediante aritmética entera y de fracciones de la suma de brazos a profundidades 1, 3, 6, 9 y 12 (enteros) y 1, 3, 9, 27 y 81 (fracciones).
- Cuantificación del residuo en coma flotante de 64 bits por profundidad, incluyendo el número de brazos que se desplazan de la identidad y la magnitud del peor delta.
- Comparación controlada entre portadores aritméticos (enteros frente a `float64`) manteniendo idénticas operaciones y profundidad, para aislar el efecto del tipo de dato.
- Distribución como artefacto autocontenido: un único script de Python y un `index.html` ejecutable con doble clic, sin dependencias externas.
- No incluye generación de texto, razonamiento en lenguaje natural, código general, matemáticas simbólicas arbitrarias, visión, audio, tool calling ni capacidades de agente.

## Casos de uso

- Auditoría de estabilidad numérica en sistemas recursivos: el material sirve como caso de estudio reproducible para ilustrar cómo un algoritmo que funciona en coma flotante a poca profundidad puede degradarse al anidarse, útil en el diseño de bibliotecas de álgebra lineal o de cómputo jerárquico.
- Material didáctico sobre representación numérica: el contraste entre enteros exactos y `float64` a distintas profundidades es un ejemplo concreto para explicar acumulación de error de redondeo en cursos de métodos numéricos.
- Verificación de implementaciones propias: un desarrollador que reimplemente una estructura recursiva similar puede reutilizar el esquema de pruebas de la model card (mismo camino, misma profundidad, dos portadores) como plantilla de validación.
- Reproducción independiente de resultados matemáticos: el script `compose.py` permite repetir las mediciones en local sin infraestructura, lo que facilita la replicación por terceros.
- Estudio de sistemas de numeración no convencionales: el uso de ternario balanceado y potencias de tres como estructura de anidamiento es un caso práctico para quien investigue representaciones alternativas.
- Ejemplo de publicación sin dependencias: el repositorio ilustra un patrón de distribución de artefactos científicos autocontenidos (script más HTML), replicable para publicar otros experimentos.
- No se debe emplear como componente de una aplicación de IA, ya que no procesa lenguaje ni ofrece inferencia de ningún tipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de NLP en la informacion disponible. Lo que la model card ofrece son mediciones internas del propio experimento, que se reproducen a continuación tal cual.

Enumeración exhaustiva (enteros exactos):

| Profundidad | Hojas | Niveles comprobados | Suma ≠ 0 |
|---|---|---|---|
| 1 | 3 | 1 | 0 |
| 3 | 27 | 3 | 0 |
| 6 | 729 | 6 | 0 |
| 9 | 19.683 | 9 | 0 |
| 12 | 531.441 | 12 | 0 |
| 13 | 1.594.323 | 13 | 0 |

Prueba de centro libre ante desplazamiento del centro en todos los niveles:

| Profundidad | Aritmetica | Cambios en brazos | Peor abs(delta) |
|---|---|---|---|
| 1 | int | 0 | 0 exacto |
| 3 | int | 0 | 0 exacto |
| 6 | int | 0 | 0 exacto |
| 9 | int | 0 | 0 exacto |
| 12 | int | 0 | 0 exacto |
| 1 | float64 | 1 | 1,137e−13 |
| 3 | float64 | 10 | 9,095e−13 |
| 6 | float64 | 310 | 3,638e−12 |
| 9 | float64 | 8.534 | 2,910e−11 |
| 12 | float64 | 228.731 | 1,746e−10 |

Comparación a profundidad 27 y 81 (camino único con fracciones frente a float64):

| Profundidad | Exacto | Float64 |
|---|---|---|
| 1 | 0 | 0,000e+00 |
| 3 | 0 | 0,000e+00 |
| 9 | 0 | −4,002e−11 |
| 27 | 0 | −9,689e−02 |
| 81 | 0 | −1,325e+24 |

El propio autor advierte que la magnitud en profundidad 81 en coma flotante está inflada tanto por deriva como por crecimiento ordinario de valores, y que la comparación válida es la de mismas operaciones y misma profundidad.

## Comparativa con modelos similares

No disponible. Este repositorio no pertenece a una categoría de modelos comparables: no es un LLM, ni un modelo de visión, ni un sistema de embeddings, y no existen alternativas equivalentes en el ecosistema de HuggingFace con las que confrontar parámetros, contexto, rendimiento o licencia. Cualquier comparación con modelos de lenguaje sería categorialmente incorrecta.

## Limitaciones y advertencias

- No es un modelo de aprendizaje automatico: no genera texto, no razona en lenguaje natural y no acepta prompts.
- La enumeracion exhaustiva solo alcanza la profundidad 13; los resultados a profundidad 27 y 81 provienen de un unico camino, no de una verificacion completa.
- En profundidad 81 en coma flotante la magnitud del residuo mezcla deriva acumulada y crecimiento ordinario de valores, por lo que no debe interpretarse como error puro.
- La licencia no esta declarada en la informacion disponible, lo que impide determinar las condiciones de uso comercial o de redistribucion.
- No se indican idiomas soportados ni autoría verificable mas alla del nombre de usuario de la plataforma.
- Las fechas del repositorio son incoherentes entre si (creacion 2026-10-16, actualizacion 2026-08-07, actualizacion anterior a la creacion), dato a tener en cuenta al citar el artefacto.
- El repositorio no presenta descargas ni interacciones, por lo que no existe validacion externa de los resultados por parte de la comunidad.
- No debe integrarse en pipelines de produccion de IA: carece de pesos, tokenizador y runtime de inferencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jessedbrown/does-the-closure-survive-81-levels
- Demo de un clic: https://jessebrown1980.github.io/does-the-closure-survive-81-levels/
- Punto de entrada del autor ("the bridge"): https://jessebrown1980.github.io/the-bridge-to-all-of-it/
- Repositorio complementario "how-and-why-the-system-works": https://github.com/JesseBrown1980/how-and-why-the-system-works
- Repositorios complementarios citados en la model card (sin URL directa proporcionada): light-boat-engine-ships-with-oils, The-Brown-Light-erdos-Engine-block-powered-by-light, the-browns-solution-to-erods-o0O-nx3-6-for-1-with--1-3, one-click, the-leaves-are-not-the-message, raw-data.
