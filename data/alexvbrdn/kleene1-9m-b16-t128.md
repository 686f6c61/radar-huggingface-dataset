# alexvbrdn/kleene1-9m-b16-t128

## Resumen

Kleene 1 · 9M · B16 · T128 es un modelo grafo-a-secuencia (graph2seq) de 9.162.026 parámetros que genera una expresión regular simple para un autómata finito determinista (DFA). Lo desarrolla alexvbrdn como componente del motor open source RegexSolver, orientado a operaciones de conjuntos sobre lenguajes regulares. El problema que aborda es clásico: la eliminación de estados (algoritmo de Kleene) siempre produce una expresión correcta, pero su tamano crece de forma exponencial con el número de estados y el resultado es difícil de leer.

La arquitectura combina un encoder graph transformer sobre el DFA (4 capas de paso de mensajes y 2 de atención global) con un decoder transformer de 4 capas que emite la expresión regular token a token en orden de prefijo. Está limitado por diseno a 16 bases por autómata y 126 tokens por expresión, y se entrenó con DFAs de hasta 16 estados. En RegexSolver, el modelo no actúa solo: la herramienta determina y minimiza el autómata, decodifica 8 candidatos, verifica cada uno contra el DFA y conserva la expresión más simple entre la del modelo y la de la eliminación de estados.

Su relevancia es la de los modelos pequenos y especializados: con menos de 10 millones de parámetros resuelve una tarea combinatoria concreta y verificable, se ejecuta en Rust con candle (CPU, CUDA o Metal) y cabe en cualquier equipo. Se publica bajo licencia MIT en formato safetensors y con un repositorio de 0,1 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder graph transformer sobre el DFA (4 capas de paso de mensajes y 2 de atención global) más decoder transformer de 4 capas sobre tokens de expresión regular |
| Parametros totales | 9.162.026 (float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 posiciones de decoder (126 tokens de expresión regular más token de inicio y de fin); entrada limitada a 16 bases por DFA, entrenado con autómatas de hasta 16 estados |
| Tipos de cuantizacion | no disponible; los pesos se publican en float32 |
| Idiomas soportados | no disponible; el modelo no procesa lenguaje natural, opera sobre autómatas y expresiones regulares |
| Licencia | MIT |
| Formato de pesos | safetensors (`config.json` y `model.safetensors`) |

## Arquitectura y entrenamiento

El modelo recibe como entrada el DFA mínimo en forma canónica, representado como un grafo con un nodo por estado y una arista por transición y base, donde las bases son rangos de caracteres disjuntos (la representación que usa RegexSolver en lugar de caracteres individuales). El encoder es un graph transformer con 4 capas de paso de mensajes y 2 capas de atención global; el decoder es un transformer de 4 capas que genera la expresión regular en tokens de orden de prefijo, con cada clase de caracteres expresada como un conjunto de bases. El nombre del modelo codifica su generación (`kleene1`, que fija la codificación de entrada, el vocabulario y el formato de fichero), sus parámetros (9m), el máximo de bases (b16) y el máximo de posiciones de decoder (t128).

El dataset es sintético y no se ha publicado: 2.032.778 DFAs mínimos de hasta 16 estados y 16 bases, de los cuales 1.992.807 son de entrenamiento, 20.039 de validación y 19.932 de test. Se generaron a partir de expresiones regulares aleatorias (49%), autómatas aleatorios (25%) y operaciones de conjuntos (26%), y se deduplicaron y balancearon por número de estados, bases y estados de aceptación. El objetivo de cada DFA es la expresión regular más simple encontrada dentro del límite de 126 tokens según complejidad cognitiva; los 413.058 DFAs para los que no se encontró ninguna forman un fondo semilla aparte (de mayor tamano medio).

El entrenamiento supervisado usa entropía cruzada sobre los tokens objetivo con AdamW, batch de 256 y learning rate máximo de 4e-4 desde cero y de 1e-4 a 2e-4 en ajuste fino. Se organiza en rondas: entre ellas, las expresiones correctas del propio modelo sustituyen a los objetivos cuando son más simples (mining) y se asignan objetivos a los DFAs del fondo semilla (seeding), una forma de iteración experta en la que el modelo se reentrena con sus propias salidas que pasan una comprobación. Todo objetivo nuevo se verifica contra su DFA. La model card menciona una fase de aprendizaje por refuerzo, pero el texto proporcionado se interrumpe y no detalla el algoritmo, los hiperparámetros ni los resultados, por lo que esa parte queda como no disponible.

## Capacidades

- Generación de expresiones regulares a partir de un DFA mínimo: convierte un autómata en una expresión regular en tokens de orden de prefijo.
- Simplificación y legibilidad: optimiza complejidad cognitiva, no solo corrección; en el ejemplo de la model card pasa de 44,0 (eliminación de estados) a 5,0.
- Decodificación con múltiples candidatos: por defecto genera 8 candidatos (greedy más 7 muestreos) y RegexSolver conserva el más simple que verifica contra el autómata; con `with_candidates(1)` solo usa decodificación greedy.
- Descomposición de autómatas grandes: cuando no encuentra una expresión correcta o el DFA supera los límites, RegexSolver lo divide en piezas menores y ejecuta el modelo sobre cada una.
- Verificación integrada: cada expresión generada se comprueba contra el autómata y, si falla, se usa el resultado de la eliminación de estados.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües: es un modelo unimodal y de dominio específico.
- No dispone de modo de razonamiento explícito (thinking) ni de salida en formato conversacional.

## Casos de uso

- Conversión de DFA a expresión regular dentro de RegexSolver: el modelo se invoca mediante la feature `neural-synthesis` (o `neural-synthesis-hub` para descargarlo del Hub) y devuelve la expresión que la herramienta verifica y compara con la de la eliminación de estados.
- Limpieza de expresiones generadas automáticamente: en flujos donde la eliminación de estados produce expresiones ilegibles de complejidad alta, el modelo ofrece una alternativa mucho más corta que se puede revisar y mantener a mano.
- Depuración de analizadores léxicos: a partir del DFA minimizado de un lexer se obtiene una expresión legible que ayuda a documentar y a detectar transiciones inesperadas durante el desarrollo.
- Documentación y generación de firmas de patrones: convertir autómatas derivados de reglas de validación o de filtrado en expresiones regulares comprensibles para equipos que no trabajan con autómatas.
- Verificación y pruebas de equivalencia: al integrarse en un motor que comprueba la expresión contra el autómata, sirve como generador de candidatos en pipelines de test de equivalencia entre expresiones y DFAs.
- Validación de entradas en aplicaciones: a partir del autómata que define un formato aceptado, se genera una expresión regular más simple para usarla en validadores de formularios o de configuración.
- Preprocesado en herramientas de análisis de logs: convertir autómatas extraídos de patrones de eventos en expresiones regulares manejables antes de incorporarlas a un motor de búsqueda.
- Uso didáctico: ilustrar la equivalencia entre autómatas finitos y expresiones regulares mostrando cómo un modelo aprende a producir la expresión mínima en lugar de la que resulta de aplicar el algoritmo clásico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a una sección de resultados que no forma parte del material proporcionado, y no incluye cifras de MMLU, HumanEval, GSM8K ni de métricas propias (por ejemplo, tasa de expresiones correctas o reducción media de complejidad cognitiva sobre el conjunto de test).

El único dato cuantitativo disponible es el ejemplo ilustrativo incluido en la propia model card, correspondiente a un DFA de 4 estados del conjunto de test sobre los caracteres `a`–`e`, `g` y `h`:

| Método | Expresión generada | Complejidad cognitiva |
|---|---|---|
| Eliminación de estados | `[a-eg]*h(b(hb)*(h{2}\|([a-eg]\|h[ac-eg])[a-eg]*h)\|([ac-eg][a-eg]*)?h)*b(hb)*h?` | 44,0 |
| Kleene 1 (greedy) | `[a-egh]*hbh?` | 5,0 |

Se trata de un caso elegido para ilustrar el comportamiento del modelo, no de un resultado agregado del conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB. Los 9.162.026 parámetros en float32 ocupan aproximadamente 36,6 MB, y el repositorio completo pesa 0,1 GB.
- GPU recomendadas: no requiere GPU. Funciona en CPU y, si se activan las features `neural-synthesis-*` de candle, puede usar CUDA o Metal. Cualquier GPU moderna sobra para este tamano.
- GPU de consumo: cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y también en equipos sin GPU dedicada, incluidos portátiles y placas tipo Raspberry Pi.
- Opciones de despliegue: la vía soportada es Rust con candle a través de RegexSolver (`NeuralSynthesizer::from_files` o `from_hub_revision`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato ni a esta tarea.
- Latencia y throughput: no disponibles. La model card solo indica que la descomposición de autómatas de docenas de estados puede tardar unos segundos en CPU, y que la decodificación por defecto evalua 8 candidatos por autómata.

## Comparativa con modelos similares

No se conocen en la información disponible otros modelos neuronales comparables que resuelvan la conversión de DFA a expresión regular. La alternativa real es el algoritmo clásico, que no es un modelo entrenado:

| Enfoque | Tipo | Entrada | Salida | Garantía de corrección | Licencia |
|---|---|---|---|---|---|
| Kleene 1 · 9M · B16 · T128 | Modelo graph2seq supervisado y ajustado por rondas | DFA mínimo, hasta 16 bases | Expresión regular de hasta 126 tokens, optimizada por complejidad cognitiva | No garantizada; se verifica contra el autómata y hay respaldo | MIT |
| Eliminación de estados (algoritmo de Kleene) | Algoritmo determinista | DFA | Expresión regular correcta | Garantizada | no aplica |
| Modelos de lenguaje generales | Transformer decoder | Texto | Texto, potencialmente expresiones regulares | No garantizada | según modelo |

La diferencia práctica es que el algoritmo clásico siempre acierta pero puede producir expresiones exponencialmente largas e ilegibles, mientras que Kleene 1 busca la expresión más simple dentro de un límite fijo, a costa de necesitar verificación y de no poder superar los 16 estados sin descomposición.

## Limitaciones y advertencias

- Límites duros de arquitectura: como máximo 16 bases por DFA y 126 tokens por expresión regular. Los autómatas que los superan requieren descomposición previa por parte de RegexSolver, con el coste de tiempo asociado.
- Ámbito de entrenamiento reducido: el modelo se entrenó con DFAs de hasta 16 estados, por lo que su comportamiento en autómatas mayores, incluso descompuestos, no está respaldado por datos publicados.
- Riesgo de expresiones incorrectas: el modelo puede generar una expresión sintácticamente válida pero semánticamente equivocada. La mitigación es externa (verificación contra el autómata y respaldo con eliminación de estados), no una garantía interna del modelo.
- Dependencia de preprocesado: el modelo espera el DFA ya determinizado y minimizado en forma canónica; la conversión y la limpieza corren a cargo de RegexSolver.
- Trazabilidad limitada: el código de entrenamiento y el dataset no están publicados, de modo que los resultados no son reproducibles de forma independiente.
- Fase de refuerzo sin detalle: la model card menciona entrenamiento por refuerzo, pero la información disponible está truncada y no especifica el método ni sus efectos.
- Sin capacidades de lenguaje: no procesa lenguaje natural, no soporta idiomas, tool calling, agentes ni multimodalidad; cualquier uso conversacional queda fuera de su alcance.
- Licencia: MIT, que permite uso comercial, modificación y redistribución manteniendo el aviso de copyright. No se detallan términos adicionales ni restricciones sobre los datos de entrenamiento más allá de que son sintéticos y no publicados.
- Producción: al ser un componente de RegexSolver, conviene mantener siempre activada la verificación y no confiar en la salida cruda del modelo. Con 76 descargas y 0 likes, la validación por parte de terceros es todavía muy escasa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexvbrdn/kleene1-9m-b16-t128
- RegexSolver (repositorio del motor que integra el modelo): https://github.com/RegexSolver/regexsolver
- Entrada de blog sobre la representación de transiciones por bases: https://alexvbrdn.me/post/optimizing-transition-conditions-automaton-representation
- candle (framework de inferencia en Rust): https://github.com/huggingface/candle
- Eliminación de estados (algoritmo de Kleene): https://en.wikipedia.org/wiki/Kleene%27s_algorithm
- Stephen Cole Kleene: https://en.wikipedia.org/wiki/Stephen_Cole_Kleene
- AdamW (Loshchilov y Hutter, 2019), referenciado en las etiquetas: https://arxiv.org/abs/1711.05101
- Iteración experta (Polu et al., 2022), referenciado en las etiquetas: https://arxiv.org/abs/2202.01344
- Referencia arXiv 2402.03300, incluida en las etiquetas del modelo: https://arxiv.org/abs/2402.03300
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos no guardan relación con el contenido de la ficha.
