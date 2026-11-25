# AI999X/actuarial-science-ai999x

## Resumen

actuarial-science-ai999x es un solver determinista de ciencia actuarial y seguros publicado por AI999X en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje generativo al uso: se distribuye como un motor compilado (con build en Rust y API en Python) que resuelve 93 calculos agrupados en 15 temas del dominio actuarial, desde tablas de mortalidad y rentas vitalicias hasta reservas de siniestralidad con chain-ladder, Bornhuetter-Ferguson o Cape Cod. Cada calculo devuelve formula, pasos intermedios, unidades y una explicacion en lenguaje natural cuando una entrada falta o queda fuera de rango.

El paquete pesa apenas 4.715.520 parametros declarados en safetensors y el repositorio ocupa 0,0 GB, lo que refleja que el nucleo es un motor de reglas y calculo simbolico, no una red neuronal de gran escala. Se puede usar de cuatro formas: aplicacion de escritorio para Windows y Linux, CLI, version web y biblioteca de Python 3.10+. Todo se ejecuta en local, sin conexion, lo que encaja con el requisito de trazabilidad y reproducibilidad que exige el trabajo actuarial en produccion.

Su relevancia actual esta en el nicho: frente a los LLM generalistas que alucinan formulas o confunden convenciones (por ejemplo, anualidad-vencida frente a anticipada, o descuento con tipo de interes tecnico frente a tipo de descuento), este motor ofrece respuestas identicas y auditables en cada plataforma. La model card declara una precision de 1,0 sobre 586 preguntas documentadas con respuestas de referencia, verificadas en Windows y Linux con Python 3.10 a 3.14.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de calculo compilado (nucleo en Rust, API Python); no es un transformer |
| Parametros totales | 4.715.520 (safetensors declarados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: solver determinista, no modelo generativo) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizados; el paquete pip instala el motor compilado o un build en Python puro) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en el repo; distribucion principal via pip (`actuarial-science-ai999x`), binarios de escritorio y CLI para Windows y Linux x86-64 |

## Arquitectura y entrenamiento

No se trata de una red neuronal entrenada con descenso de gradiente. El modelo es un solver de dominio cerrado: 93 calculos en 15 temas, cada uno con su formula, su secuencia de pasos y sus unidades. El nucleo esta compilado (Rust segun los tags y la descripcion del paquete) y se expone mediante una API de Python; en plataformas sin binario precompilado (macOS, ARM) `pip` instala un build en Python puro que produce las mismas respuestas. La model card no documenta corpus de entrenamiento, numero de tokens, RLHF ni DPO, porque no aplica a esta clase de artefacto.

Los temas cubiertos incluyen tablas de vida y modelos de supervivencia, seguros de vida y rentas, primas netas y brutas, reservas y ecuacion de Thiele, teoria del interes, modelos de perdida con deducibles y limites, recursion de Panjer, VaR y TVaR, credibilidad (Buhlmann) y reservas de siniestralidad (chain-ladder, Bornhuetter-Ferguson, Cape Cod, Mack). La innovacion tecnica destacable es el comportamiento ante entradas invalidas: en lugar de devolver un numero plausible pero erroneo, el motor emite una razon en lenguaje natural. Eso lo hace apto para docencia y para pipelines donde un fallo silencioso es mas caro que un error explicito.

## Capacidades

- Resolucion de 93 calculos actuariales en 15 areas: tablas de mortalidad, supervivencia, seguros de vida, rentas vitalicias y ciertas, primas netas y brutas, reservas y ecuacion de Thiele, teoria del interes.
- Modelos de perdida con deducibles ordinarios y con limite, agregacion por recursion de Panjer, VaR y TVaR.
- Credibilidad de Buhlmann con parametros estructurales conocidos.
- Reservas de siniestralidad: chain-ladder (reservas y perdidas ultimas), Bornhuetter-Ferguson, Cape Cod y Mack.
- Salida paso a paso con formula, pasos intermedios, unidades y resultado final, apta para revision y auditoria.
- Manejo explicito de entradas faltantes o fuera de rango mediante mensajes razonados en lugar de cifras inventadas.
- Cuatro interfaces: aplicacion de escritorio (Windows, Linux), CLI `actuarial-science`, version web y biblioteca de Python 3.10+.
- Ejecucion completamente offline, sin llamadas a servicios externos.
- Escenas y graficos generados a partir de la respuesta calculada (por ejemplo, primas, reservas y valores de anualidades).
- No soporta tool calling generativo, agentes multi-paso ni razonamiento abierto: el alcance es el dominio actuarial cerrado.

## Casos de uso

- Formacion y preparacion de examenes actuariales: el alumno plantea un problema de prima neta de vida entera o de renta vitalicia diferida y obtiene formula, pasos y unidades, lo que permite comparar su desarrollo con el del motor sin depender de un tutor.
- Validacion de hojas de calculo en produccion: se replica en Python el calculo de reservas por chain-ladder o Bornhuetter-Ferguson y se contrasta con el resultado del motor para detectar discrepancias en supuestos o en el tratamiento de la cola.
- Auditoria y revision interna: al devolver la secuencia de pasos y las unidades, el resultado es trazable y se puede adjuntar como evidencia en un informe de revision de reservas o de tarificacion.
- Tarificacion de productos de vida y rentas: calculo de primas netas y brutas, anualidades ciertas y seguros con deducible para escenarios de sensibilidad sobre tipo de interes tecnico y tabla de mortalidad.
- Cuantificacion de riesgo agregado: VaR y TVaR sobre carteras modeladas con deducibles y limites, y agregacion de frecuencias y severidades mediante recursion de Panjer.
- Docencia universitaria y material de practicas: la version web y la de escritorio permiten construir ejercicios interactivos con controles deslizantes donde la escena y los graficos se actualizan con la respuesta calculada.
- Integracion en pipelines de Python: `pip install actuarial-science-ai999x` permite invocar el motor desde scripts de validacion, notebooks o servicios internos sin salida a Internet, util en entornos con requisitos de confidencialidad de datos.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card:

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering actuarial y de seguros | Golden answers (586 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1,0 | No |
| Question answering actuarial y de seguros | Mismo conjunto | Identico en todas las plataformas | Si (declarado como nombre de metrica) | No |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en benchmarks actuariales estandar. La cifra de 1,0 procede del propio autor y no esta verificada de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el motor no ejecuta pesos en GPU. Consumo de CPU y memoria RAM moderado, coherente con un paquete de 0,0 GB y 4,7 millones de parametros declarados.
- GPU recomendadas: no disponible; no se requiere GPU.
- Cabe en cualquier equipo de consumo: la build compilada cubre Windows y Linux x86-64; en macOS y ARM se instala la build en Python puro con las mismas respuestas.
- Opciones de despliegue: aplicacion de escritorio (Windows, Linux), CLI `actuarial-science`, version web en la pagina del modelo y biblioteca de Python (`pip install actuarial-science-ai999x`).
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje con pesos transformer.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| actuarial-science-ai999x | Solver de dominio compilado | 4.715.520 declarados | no aplica | Apache 2.0 | 93 calculos actuariales deterministas, offline |
| LLM generalista (p. ej. familia Llama o Mistral) | Transformer generativo | Miles de millones | Miles de tokens | Variable | Razonamiento abierto, riesgo de alucinacion en formulas |
| Bibliotecas actuariales de Python (p. ej. `lifelib`, `chainladder`) | Libreria de calculo | no aplica | no aplica | Variable (habitualmente BSD o similar) | Funciones sueltas, sin pasos explicados ni escenas |
| Hojas de calculo propietarias | Herramienta ofimatica | no aplica | no aplica | Comercial | Flexibilidad alta, trazabilidad y validacion manuales |

La comparativa con LLM generalistas no es directa: estos cubren un espectro mucho mayor de tareas, pero no garantizan consistencia en convenciones actuariales ni ofrecen el mismo nivel de trazabilidad paso a paso. Frente a librerias como `lifelib` o `chainladder`, la diferencia esta en la cobertura integrada de 15 temas y en la salida didactica con unidades y mensajes de error razonados. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Cobertura cerrada: solo resuelve los 93 calculos documentados en 15 temas; cualquier problema fuera de ese conjunto queda sin respuesta.
- Idioma unico: la interfaz y las explicaciones estan en ingles; no hay soporte documentado de castellano.
- La precision de 1,0 esta declarada por el autor y no verificada de forma independiente; conviene reproducirla con casos propios antes de confiar en ella en produccion.
- No es un modelo generativo: no redacta informes, no interpreta enunciados en lenguaje natural libre ni mantiene conversaciones multi-turno.
- Dependencia de las convenciones implementadas: si el usuario trabaja con otra convencion (por ejemplo, anualidad anticipada frente a vencida, o UDD frente a fuerza de mortalidad constante), el resultado puede diferir aunque el motor sea correcto bajo su propio marco.
- En macOS y ARM se ejecuta la build en Python puro; el autor afirma respuestas identicas, pero el rendimiento puede ser inferior al de la build compilada.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion y aviso de cambios; no hay clausula de uso responsable adicional documentada.
- Al ser un solver determinista, el riesgo de alucinacion se limita a entradas mal especificadas; aun asi, la validacion de unidades y supuestos sigue siendo responsabilidad del usuario.
- No sustituye la revision de un actuario cualificado en decisiones de tarificacion, reservas o solvencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/actuarial-science-ai999x
- Pagina del modelo con demo web: https://www.ai999x.com/models/actuarial-science-ai999x/
- Repositorio de escritorio y CLI: https://github.com/AI999X/ai999x-desktop
- Release de escritorio Windows v1.6.7: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-actuarial-science-1.6.7-windows-x86_64.zip
- Release de escritorio Linux v1.6.7: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-actuarial-science-1.6.7-linux-x86_64.tar.gz
- Release de CLI Windows v1.6.7: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- Release de CLI Linux v1.6.7: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Video de demostracion (MP4): https://www.ai999x.com/?ax_shot=actuarial-science-ai999x/clip.mp4
- Paquete de Python: `pip install actuarial-science-ai999x`
