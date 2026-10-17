# Jessedbrown/does-2-to-the-n-always-contain-a-digit-2-in-base-3

## Resumen

El repositorio de HuggingFace `Jessedbrown/does-2-to-the-n-always-contain-a-digit-2-in-base-3` no contiene un modelo de aprendizaje automatico: no hay pesos, no hay arquitectura neuronal y no hay entrenamiento. Lo que publica el autor (Jesse Daniel Brown, "OP-JESSE") es un paquete de tres artefactos — una pagina `index.html` autocontenida, un script `trunk.py` y un script `reframe_check.py` — que exploran computacionalmente una conjetura abierta de teoria de numeros atribuida a Erdos: si para todo `n > 8` la potencia `2^n` contiene al menos un digito `2` en base 3.

El material reformula la conjetura en ternario balanceado (digitos `{−1, 0, +1}`), donde la pregunta equivale a si la expansion de `2^n` contiene un `−1`, a si la conversion desde base 3 siempre produce acarreo y a si `2^n` no es suma de potencias distintas de 3. El autor verifica esa equivalencia sobre `n = 0 … 4000` (4001 casos, 0 discrepancias) y barre el rango `n = 0 … 200.000` sin encontrar contraejemplos, con las unicas excepciones `n ∈ {0, 2, 8}`.

Su aportacion mas concreta es una ley empirica para la posicion del `−1` mas bajo: `1/2` en la posicion 0 (demostrado por paridad de `2^n mod 3`) y `(1/6)·(2/3)^(k−1)` para `k ≥ 1`, ajustada a cinco cifras significativas sobre 200.000 muestras. El factor `2/3` queda sin derivar y el autor lo senala como la pieza abierta. Es relevante como ejemplo reproducible de computacion exacta de acarreos sin construir nunca `2^n`, y como caso de uso de HuggingFace como repositorio generico de artefactos, no solo de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: no es un modelo neuronal. El repositorio contiene scripts de Python y una pagina HTML autocontenida |
| Parametros totales | no disponible (no existen pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (no hay pesos que cuantizar) |
| Idiomas soportados | no disponible en los metadatos; el material esta redactado en ingles |
| Licencia | no disponible (la model card no la especifica y el campo de licencia esta vacio) |
| Formato de pesos | no disponible (los artefactos son `index.html`, `trunk.py`, `reframe_check.py`) |
| Lenguaje de implementacion | Python (scripts) y HTML/JavaScript (herramienta interactiva) |
| Dependencias | ninguna declarada: sin servidor, sin red, sin GPU, sin cuenta |
| Rango verificado | `n = 0 … 200.000` en `trunk.py`; `n = 0 … 4000` en `reframe_check.py` |
| Aritmetica | enteros exactos, sin coma flotante; se usa `pow(2, n, 3^K)` |
| Descargas / likes en HuggingFace | 0 / 0 |
| Etiquetas | `region:us` |
| Fecha de creacion | 2026-10-16 |
| Fecha de actualizacion | 2026-08-07 |

## Arquitectura y entrenamiento

No hay arquitectura de red ni proceso de entrenamiento. El "motor" del repositorio es un argumento de propagacion de acarreos: en la conversion de base 3 a ternario balanceado los acarreos viajan unicamente de las posiciones bajas a las altas, de modo que los primeros `K` digitos balanceados de un valor `v` dependen solo de `v mod 3^K`. Eso permite recorrer `K` digitos sin materializar `2^n`, usando aritmetica modular exacta con `pow(2, n, 3^K)`. El autor subraya que `2^n mod 3^K` es periodico en `n` con periodo `2·3^(K−1)`, lo que implicaria que una cota finita sobre la posicion del `−1` mas bajo cerraria la conjetura por comprobacion finita; como esa cota no existe, el problema queda abierto.

El entrenamiento, en el sentido de ML, es inexistente: no hay dataset, no hay tokens de entrenamiento y no hay RLHF ni DPO. Lo que hay es computo determinista sobre tres scripts. `reframe_check.py` valida la equivalencia triple anunciada (digito 2 en base 3 equivale a `−1` en ternario balanceado equivale a "no es suma de potencias distintas de 3") sobre 4001 valores, con 0 fallos de reconstruccion y 0 violaciones. `trunk.py` ejecuta el barrido de 200.000 valores y produce la distribucion de la posicion del `−1` mas bajo, la lista de records y la busqueda de contraejemplos. La unica pieza demostrada analiticamente es la probabilidad `1/2` de la posicion 0, que se sigue de que `2^n mod 3` vale `2` para `n` impar y `1` para `n` par; el resto de la ley es ajuste empirico.

## Capacidades

- Reformulacion exacta de una conjetura abierta entre tres enunciados equivalentes (base 3, ternario balanceado y suma de potencias distintas de 3).
- Barrido verificado del rango `n = 0 … 200.000` con busqueda de contraejemplos, sin ningun contraejemplo para `n > 8`.
- Calculo de la distribucion empirica de la posicion del `−1` mas bajo, con contraste frente a la forma cerrada propuesta.
- Deteccion de records: valores de `n` en los que la posicion del `−1` mas bajo supera a la de todos los `n` menores. Doce records registrados en 200.000 valores.
- Aritmetica modular exacta sin coma flotante y sin construir `2^n`, apta para `n` grandes.
- Herramienta interactiva de un solo boton en el navegador que recalcula todo en local al pulsar RUN, sin instalacion ni red.
- No dispone de generacion de texto, razonamiento en lenguaje natural, codigo, vision ni audio.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de capacidades multilingues.

## Casos de uso

- Docencia de teoria de numeros: la pagina `index.html` permite mostrar en clase, sin instalacion, como cambia la representacion de `2^n` al pasar de base 3 a ternario balanceado y por que el digito `2` se convierte en un acarreo `−1`.
- Verificacion reproducible de un resultado ajeno: cualquier investigador puede ejecutar `python trunk.py 200000` y confirmar o refutar la distribucion y la lista de records publicadas, ya que se parte de enteros exactos y no de resultados en coma flotante.
- Extension del barrido a rangos mayores: al usar `pow(2, n, 3^K)` el coste por valor es proporcional a `K` digitos y no al tamano de `2^n`, lo que hace viable subir de 200.000 a ordenes de magnitud superiores sin cambiar el algoritmo.
- Estudio de propagacion de acarreos: el repositorio es un banco de pruebas minimo para analizar como se propaga un acarreo en una base no estandar, con la simetria observada `1/6 · (2/3)^(k−1)` y los records como puntos de interes.
- Analisis de crecimiento logaritmico de records: con la formula `log(N/2)/log(3/2)` el autor predice 28,4 para `N = 200.000` y observa 28; el repositorio sirve para poner a prueba esa prediccion con otros valores de `N`.
- Ensenanza de aritmetica modular aplicada: ilustra por que `2^n mod 3^K` tiene periodo `2·3^(K−1)` y como esa periodicidad se relaciona con la imposibilidad de acotar la profundidad del `−1` mas bajo.
- Auditoria de afirmaciones matematicas publicadas sin revision por pares: sirve como caso practico de que se puede verificar una conjetura computacionalmente concreta con tres ficheros y sin infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de aprendizaje automatico en la informacion disponible (el repositorio no contiene ningun modelo que evaluar con MMLU, HumanEval, GSM8K ni similares). Los unicos datos numericos del autor son mediciones matematicas, que se reproducen a continuacion tal como aparecen en la model card.

Distribucion de la posicion del `−1` mas bajo, medida sobre `n = 0 … 200.000` frente a la forma cerrada propuesta:

| Posicion | Observado | Exacto | Forma cerrada |
|---|---|---|---|
| 0 | 49,9998 % | 50,0000 % | 1/2 |
| 1 | 16,6664 % | 16,6667 % | 1/6 |
| 2 | 11,1109 % | 11,1111 % | 1/9 |
| 3 | 7,4075 % | 7,4074 % | 2/27 |
| 4 | 4,9370 % | 4,9383 % | 4/81 |
| 5 | 3,2920 % | 3,2922 % | 8/243 |

Records de profundidad del `−1` mas bajo sobre `n = 0 … 200.000`:

| n | Posicion del `−1` mas bajo |
|---|---|
| 1 | 0 |
| 4 | 1 |
| 6 | 3 |
| 18 | 4 |
| 20 | 7 |
| 24 | 10 |
| 72 | 11 |
| 186 | 13 |
| 332 | 15 |
| 1134 | 21 |
| 25458 | 27 |
| 159140 | 28 |

Otros resultados declarados por el autor: 4001 comparaciones con 0 discrepancias en `reframe_check.py`; 0 violaciones de la equivalencia "sin digito 2 = suma de potencias distintas de 3"; excepciones `n ∈ {0, 2, 8}`; 0 contraejemplos para `n > 8`; minimo de `−1` en el rango, 2, alcanzado en `n = 9`; prediccion de record maximo para `N = 200.000`, 28,4 frente a 28 observado. No hay comparacion con otros modelos ni con implementaciones alternativas.

## Requisitos de hardware

- VRAM: no aplica. No hay inferencia de red neuronal ni pesos que cargar.
- GPU: no se requiere ninguna. El autor indica explicitamente "no GPU".
- Ejecucion en consumer: la herramienta `index.html` funciona en cualquier navegador moderno de un ordenador personal; los scripts de Python se ejecutan en CPU.
- Memoria estimada: despreciable. Los enteros manejados son `3^K` con `K` del orden de decenas de digitos, muy por debajo de los tipos enteros nativos de Python.
- Opciones de despliegue: abrir `index.html` con doble clic (sin servidor ni red); ejecutar `python reframe_check.py` y `python trunk.py 200000` en local. No se contemplan vLLM, llama.cpp, Ollama ni TGI porque no hay modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor no publica tiempos de ejecucion para el barrido de 200.000 valores ni para la herramienta interactiva.
- Coste: todo el computo es local y exacto; no hay llamadas a API ni dependencias externas.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje ni un modelo de aprendizaje automatico, por lo que no existe una categoria de modelos comparables en terminos de parametros, contexto o licencia. Tampoco se han proporcionado en la informacion referencias a otras implementaciones de la misma conjetura con las que contrastar cobertura del barrido, velocidad o metodologia.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona en lenguaje natural y no puede usarse como sustituto de un LLM. Cualquier expectativa de inferencia, contexto o cuantizacion es inaplicable.
- Los resultados son mediciones computacionales del autor, no una demostracion. La conjetura sigue abierta y el propio autor identifica el factor `2/3` de la ley de distribucion como no derivado.
- Ausencia de revision por pares: no se proporciona articulo, preprint ni identificador arXiv en la informacion disponible. Los resultados deben tratarse como no verificados de forma independiente.
- La ley de distribucion es un ajuste empirico sobre 200.000 muestras; el acuerdo a cinco cifras significativas es evidencia, no prueba, salvo en el caso de la posicion 0, que si se argumenta por paridad.
- La cota `log(N/2)/log(3/2)` para el record maximo es una prediccion asintotica; su coincidencia con el dato observado en un unico valor de `N` no valida la formula en general.
- Sin licencia declarada: no se especifican terminos de uso, redistribucion ni uso comercial. Cualquier reutilizacion del codigo queda en un vacio legal hasta que el autor lo aclare.
- Idiomas y alcance: los metadatos no declaran idiomas; el material esta en ingles. No hay soporte ni documentacion en otras lenguas.
- Inconsistencia de fechas: la fecha de creacion (2026-10-16) es posterior a la de actualizacion (2026-08-07), lo que sugiere un problema de metadatos en el repositorio y obliga a no fiarse de ellas para trazabilidad.
- Adopcion nula: 0 descargas y 0 likes, sin senal de uso, validacion o mantenimiento por terceros.
- El autor afirma que los scripts no requieren red, servidor ni cuenta; conviene verificar esa afirmacion si se ejecutan en entornos con politicas de seguridad estrictas.
- Los repositorios companeros citados (`one-click`, `how-and-why-the-system-works`, `the-leaves-are-not-the-message`, `raw-data`) se mencionan por nombre pero sin URL en la informacion proporcionada, de modo que no se puede auditar su contenido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jessedbrown/does-2-to-the-n-always-contain-a-digit-2-in-base-3
- Herramienta interactiva (un boton, sin instalacion): https://jessebrown1980.github.io/does-2-to-the-n-always-contain-a-digit-2-in-base-3/
- Pagina agregadora del autor, "the bridge": https://jessebrown1980.github.io/the-bridge-to-all-of-it/
- Repositorios companeros citados por el autor, sin URL disponible en la informacion proporcionada: `one-click`, `how-and-why-the-system-works`, `the-leaves-are-not-the-message`, `raw-data`
- Articulo o preprint asociado: no disponible
