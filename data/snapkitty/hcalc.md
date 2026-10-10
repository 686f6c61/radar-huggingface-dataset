# Snapkitty/hcalc

## Resumen

HCALC (Hcalc) es un objeto de investigación matemática publicado por Snapkitty dentro de su "October 2026 main drop" y espejado en Hugging Face desde el repositorio `github.com/SNAPKITTYWEST/hcalc` (commit `5d8fa46`). No es un modelo de lenguaje ni una red neuronal: es la especificación y verificación formal de un sistema dinámico discreto en forma anidada, X_{t+1} = Ξ(t, Λ_m · C(T_p(X_t))), definido sobre R^n con norma del supremo y construido a partir de los primeros 64 números primos.

El problema que aborda es de coherencia formal: mantener cuatro representaciones independientes de las mismas definiciones (especificación en prosa, modelo relacional acotado en Alloy, biblioteca verificada mecánicamente en Lean 4 e implementación ejecutable en J) ancladas a una única especificación de producción, con trazabilidad explícita de la procedencia de cada fórmula. Se distingue de forma deliberada de la recurrencia aditiva de Banach del repositorio hermano foundry-j mediante un morfismo nombrado (`InstanceBridge`) que nunca se iguala de manera implícita.

Su relevancia es acotada y específica: interesa a investigadores en métodos formales, sistemas dinámicos y verificación que necesitan un ejemplo reproducible de cómo una misma definición se mantiene consistente a través de prosa, modelos relacionales, pruebas mecánicas y código ejecutable. No incluye pesos, tokenizador ni pipeline de inferencia, y en el momento de la consulta registra 0 descargas y 0 "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: no es una red neuronal; sistema dinamico discreto en forma anidada X_{t+1} = Ξ(t, Λ_m · C(T_p(X_t))) sobre R^n |
| Parametros totales | no aplica: no existen pesos; el unico parametro escalar declarado es la dimension n >= 1 del portador |
| Longitud de contexto | no aplica: no hay ventana de contexto ni tokenizacion |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (no es un modelo de lenguaje; la documentacion esta en ingles) |
| Licencia | AGPL-3.0-only |
| Formato de pesos | no aplica: el repositorio contiene especificacion en prosa (spec/PRODUCTION.md), modelo Alloy, biblioteca Lean 4 y nucleo ejecutable en J |

## Arquitectura y entrenamiento

La construccion matematica se articula en cuatro piezas. El portador es el espacio vectorial real de dimension n >= 1 con norma del supremo, elegida de forma deliberada para casar con las estimaciones de suma por filas de Gershgorin empleadas en la medida de contraccion y con la metrica en la que se enuncia el objetivo residual de la seccion 9 de la especificacion. La transformada ponderada por primos T_p es diagonal sobre los primeros 64 primos (2, 3, 5, ..., 311), con pesos α_j = 1 / (1 + ln p_{j mod 64}), estrictamente entre 0 y 1: el mayor es α_0 ≈ 0,5906 (p_0 = 2) y el menor del primer bloque es α_63 ≈ 0,1484 (p_63 = 311). El gobernador de contraccion C es un mapa escala-o-identidad a nivel de estado con margen ε: C = s · id con s = (1−ε)/q cuando la estimacion de norma q supera el margen, y s = 1 en caso contrario, donde q se calcula mediante cota de Gershgorin con respaldo de iteracion de potencias. Completan la recurrencia el estabilizador escalar Λ_m y el operador de evolucion afín Ξ.

No hay entrenamiento: no existen datos de entrenamiento, tokens, ni fases de RLHF/DPO, porque el objeto no es un modelo aprendido. La innovacion tecnica declarada es metodologica: la governor se aplica al propio estado dentro del paso (no al calendario a posteriori) y la ponderacion proviene de un espectro primo fijo en lugar de un calendario sintetizado, lo que convierte la dinamica en una composicion de operadores y no en una suma de terminos. Esto implica que el mapa anidado carece de termino de deriva libre Ξ_t · x_t, que su constante de Lipschitz multiplica en lugar de sumar y que su hipotesis de convergencia tiene una forma distinta a la del teorema de punto fijo de Banach aplicado a la forma aditiva. El repositorio incluye, ademas, un arnes de verificacion con politica "fail-open" que se niega a reportar un exito que no puede medir. La model card tambien anota un portador alternativo sobre cuerpo primo tipo Goldilocks (F_p) como posible instancia futura, fuera de la ruta de produccion.

## Capacidades

- Especificacion formal de un sistema dinamico discreto: define de forma unica cada simbolo de la recurrencia anidada en `spec/PRODUCTION.md`, con etiquetas de procedencia (`spec-def` frente a propiedades heredadas de Foundry, por ejemplo la propiedad 23 para la lista P_64, las propiedades 33-37 para las medidas espectrales y la propiedad 43 para la idea de `soft_project`).
- Verificacion relacional acotada: incluye un modelo en Alloy que permite explorar instancias finitas del sistema dentro de limites de alcance.
- Prueba mecanica: biblioteca formalizada en Lean 4 que comprueba los enunciados declarados sobre la recurrencia.
- Implementacion ejecutable: nucleo en lenguaje J que reproduce la semantica de la especificacion.
- Verificacion cruzada mediante arnes con politica fail-open, que no declara un "pass" si no puede medirlo.
- Trazabilidad de procedencia: cada formula registra su origen, evitando que las definiciones deriven entre prosa y codigo.
- Distincion explicita entre la forma anidada y la forma aditiva de Banach mediante el morfismo `InstanceBridge`, con pruebas propias.
- No dispone de generacion de texto, razonamiento, codigo generativo, matematicas conversacionales, vision, audio, tool calling, function calling, soporte de agentes, capacidades multilingues ni modo de razonamiento.

## Casos de uso

- Auditoria de coherencia entre especificacion y codigo: equipos que mantienen una definicion matematica replicada en prosa, un modelo relacional y una implementacion pueden usar HCALC como plantilla para anclar las tres a una unica fuente de verdad y detectar derivas.
- Pruebas diferenciales entre representaciones: el arnes permite comparar el comportamiento del nucleo en J con las restricciones del modelo Alloy y con los teoremas de Lean 4, de modo que una discrepancia entre renderings se detecta antes de llegar a produccion.
- Punto de partida para instanciaciones concretas: un investigador puede sustituir n, ε y la lista de pesos derivada de P_64 para adaptar la recurrencia anidada a un dominio especifico (por ejemplo, control de sistemas con garantia de contraccion) conservando la estructura de verificacion.
- Docencia de metodos formales: el repositorio sirve como caso de estudio completo y pequeno de un mismo objeto expresado en prosa, Alloy, Lean 4 y J, util para cursos de verificacion y de teoria de sistemas dinamicos.
- Estudio comparativo de recurrencias: por su relacion documentada con foundry-j, permite analizar empiricamente como difieren una composicion de operadores (Lipschitz multiplicativo) y una suma de terminos (Lipschitz aditivo) sin confundirlas.
- Prototipado de politica de verificacion: el patron "fail-open harness" es reutilizable como referencia para disenar arneses que no certifiquen resultados fuera de su dominio de medida.
- Base para extensiones a cuerpos finitos: la anotacion sobre un portador Goldilocks F_p abre la puerta a experimentos de aritmetica modular con la misma estructura de especificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio describe un arnes de verificacion que mide "gates" sobre disco, pero la model card accesible no incluye las cifras resultantes, y el modelo no es evaluable con benchmarks de lenguaje (MMLU, HumanEval, GSM8K u otros), ya que no genera texto ni ejecuta tareas de NLP.

## Requisitos de hardware

- VRAM para inferencia: no aplica. El objeto no es un modelo neuronal y no requiere GPU para su ejecucion.
- GPU recomendadas: ninguna. El nucleo ejecutable en J y la especificacion en prosa no dependen de aceleracion por hardware.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual; cualquier maquina capaz de ejecutar un interprete de J sirve.
- Herramientas de despliegue: interprete de J para el nucleo ejecutable, Alloy Analyzer (sobre JVM) para el modelo relacional y la cadena de herramientas de Lean 4 para la biblioteca verificada. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del alcance configurado en Alloy y del coste de comprobacion en Lean 4, no de un presupuesto de inferencia.

## Comparativa con modelos similares

| Artefacto | Tipo | Portador | Forma de la recurrencia | Verificacion | Licencia |
|---|---|---|---|---|---|
| HCALC | Sistema dinamico discreto anidado | R^n con norma del supremo | X_{t+1} = Ξ(t, Λ_m · C(T_p(X_t))) | Alloy + Lean 4 + arnes fail-open + nucleo en J | AGPL-3.0-only |
| foundry-j (repositorio hermano) | Recurrencia aditiva de Banach | no disponible | x_{t+1} = Ξ_t · x_t + Λ_t · T(x_t) + g_t | no disponible | no disponible |
| Modelos de lenguaje de proposito general | Transformer | no aplica | no aplica | no aplica | no disponible |

No se dispone de modelos comparables de la misma categoria (objetos de investigacion con verificacion multiple) en la informacion proporcionada. La comparacion con modelos de lenguaje no es pertinente: HCALC no tiene parametros, contexto ni pesos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no puede integrarse en pipelines de NLP ni de agentes.
- Sin datos de rendimiento: no hay benchmarks publicados ni cifras de los gates del arnes en la informacion disponible, por lo que no es posible cuantificar su comportamiento mas alla de lo que declara la especificacion.
- Licencia AGPL-3.0-only: es copyleft fuerte. Cualquier uso, modificacion o distribucion, incluido el uso en red como servicio, obliga a liberar el codigo derivado bajo la misma licencia. Debe revisarse antes de cualquier integracion comercial.
- Model card incompleta: el texto proporcionado se interrumpe en la seccion 2.3 ("The specifica..."), por lo que la descripcion de C, Λ_m, Ξ y la seccion 9 del objetivo residual no puede verificarse por completo a partir de la informacion disponible.
- Politica fail-open del arnes: el propio diseno admite que no se reporte un resultado cuando no puede medirse; esto es una salvaguarda, pero implica que la ausencia de "pass" no equivale a un fallo demostrado ni a un exito demostrado.
- Ausencia de adopcion verificable: 0 descargas y 0 "likes" en el momento de la consulta, sin evidencia de uso independiente ni de auditoria externa.
- Trazabilidad parcial: parte de los elementos (por ejemplo, la lista P_64 y las medidas espectrales) se heredan como propiedades de Foundry, no como definiciones propias de HCALC; la distincion depende de que se respete el etiquetado de procedencia.
- Portador restringido: la ruta de produccion se limita a R^n con norma del supremo; el portador sobre cuerpo primo F_p solo se anota como posibilidad futura y no forma parte de la implementacion.
- Sin idiomas soportados ni localizacion: la documentacion esta en ingles y no hay traducciones ni soporte multilingue.
- No sustituye a la revision matematica humana: la verificacion mecanica cubre los enunciados formalizados, no la adecuacion de esos enunciados al fenomeno que se pretende modelar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Snapkitty/hcalc
- Repositorio en GitHub: https://github.com/SNAPKITTYWEST/hcalc
- Repositorio hermano foundry-j: https://github.com/AHMADALIPARR/foundry-j
- Organizacion Snapkitty en Hugging Face: https://huggingface.co/Snapkitty
- Snapshot publico de SNAPKITTYWEST: https://huggingface.co/Snapkitty/SNAPKITTYWEST-public-snapshot
- Repositorios de la organizacion SNAPKITTYWEST: https://github.com/SNAPKITTYWEST?tab=repositories
- Repositorio principal SNAPKITTYWEST: https://github.com/SNAPKITTYWEST/SNAPKITTYWEST
- Herramientas y productos de SnapKitty: https://app.collectivekitty.com/tools
