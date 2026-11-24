# AI999X/economics-finance-ai999x

## Resumen

`economics-finance-ai999x` es un artefacto publicado en Hugging Face por el usuario AI999X bajo la etiqueta de pipeline `question-answering`, pero que en la práctica no es un modelo de lenguaje neuronal: se trata de un motor de cálculo compilado (con implementación principal en Rust y un *build* en Python puro) que resuelve 105 cálculos de economía y finanzas distribuidas en 15 temas. Cada cálculo devuelve la fórmula aplicada, los pasos intermedios, las unidades y un mensaje explicativo cuando una entrada falta o está fuera de rango, en lugar de un número inventado. El repositorio declara 4.715.520 parámetros en formato safetensors, un dato que debe interpretarse con cautela dado que la model card no describe ninguna red neuronal.

El objetivo declarado es ofrecer respuestas deterministas y verificables (el autor lo etiqueta como "zero-hallucination") para dominios como valor temporal del dinero, préstamos y anualidades, bonos, acciones y opciones, teoría de carteras, medidas de riesgo, matemática actuarial, microeconomía, macroeconomía y econometría. Se distribuye en cuatro formatos: aplicación de escritorio para Windows y Linux, interfaz de línea de comandos, versión web y paquete de Python instalable mediante `pip`. Todo el cómputo se ejecuta localmente y sin conexión.

Su relevancia actual es acotada pero específica: cubre el nicho de herramientas de resolución paso a paso para docencia y asistencia de ejercicios (homework help), donde los LLM generativos fallan con frecuencia por alucinación aritmética. La licencia Apache 2.0 y la ausencia de dependencia de GPU lo hacen desplegable en entornos muy restringidos. No obstante, la información pública es escasa y el propio autor no aporta detalles sobre arquitectura, datos de entrenamiento ni metodología de evaluación más allá de una métrica de accuracy declarada y no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (motor de cálculo compilado; implementación principal en Rust con build en Python puro; la model card no describe red neuronal) |
| Parametros totales | 4.715.520 (según safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo generativo de contexto) |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizables; el paquete se distribuye como binario compilado o build Python) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (declarado en el repositorio); distribución funcional como binarios Windows/Linux y paquete `pip` |

## Arquitectura y entrenamiento

La documentación disponible no describe una arquitectura de transformer, MoE, SSM ni híbrida. El artefacto se presenta como "one compiled engine" con cuatro interfaces de acceso (escritorio, CLI, navegador y Python) y una implementación principal en Rust, con un *fallback* en Python puro para plataformas no x86-64 como macOS y ARM. El funcionamiento consiste en resolver 105 cálculos predefinidos en 15 temas, cada uno con su fórmula, sus pasos y sus unidades, y con validación de rangos de entrada que devuelve una explicación cualitativa en lugar de un resultado cuando los datos no son válidos.

No se publica información sobre datos de entrenamiento, número de tokens, composición del dataset, ni sobre técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones de inferencia (decodificación especulativa, atención lineal, etc.), lo que es coherente con la naturaleza no generativa del artefacto. La etiqueta `library_name: economics-finance-ai999x` sugiere una librería propia y no un *runtime* estándar de Hugging Face, y la model card marca `inference: false`, lo que indica que el modelo no está pensado para servirse mediante la infraestructura de inferencia de Hugging Face.

## Capacidades

- Resolución de 105 cálculos de economía y finanzas en 15 temas, con fórmula, pasos intermedios y unidades.
- Valor temporal del dinero: valor actual neto (NPV), tasa interna de retorno (IRR) y cálculos relacionados.
- Préstamos y anualidades: pago de préstamo amortizable, cuota de anualidades y tablas asociadas.
- Bonos: precio del bono a partir de su rendimiento y cálculos de rentabilidad.
- Acciones y opciones: precios de opciones mediante Black-Scholes.
- Teoría de carteras y medidas de riesgo, incluido valor en riesgo (VaR).
- Matemática actuarial: seguros dotales (endowment insurance) y cálculos asociados.
- Microeconomía: equilibrio de mercado y excedente con curvas lineales.
- Macroeconomía y econometría: cálculos incluidos en el temario declarado.
- Contabilidad de costes: variaciones de coste estándar (precio y cantidad de materiales, tarifa y eficiencia de mano de obra).
- Finanzas de consumo: cargo financiero de tarjeta de crédito por saldo medio diario.
- Validación de entradas: devuelve una razón explicativa en lugar de un número cuando falta un dato o está fuera de rango.
- Ejecución local y sin conexión en escritorio (Windows, Linux), CLI, navegador y Python 3.10+.
- No se documenta soporte de *tool calling*, agentes, razonamiento multi-paso generativo, visión, audio ni modo *thinking*.

## Casos de uso

- Docencia de finanzas cuantitativas: el motor devuelve la fórmula y los pasos intermedios de cada cálculo, lo que permite usarlo como generador de soluciones razonadas en asignaturas de valor temporal del dinero, bonos y opciones, sin riesgo de aritmética inventada.
- Asistencia de ejercicios (homework help): con 453 preguntas documentadas como referencia de evaluación, encaja en plataformas de corrección automática que necesitan respuestas deterministas y reproducibles en Windows y Linux con Python 3.10 a 3.14.
- Validación de cálculos en pipelines financieros: al ejecutarse como paquete `pip` (`pip install economics-finance-ai999x`), puede invocarse desde scripts de Python para verificar NPV, IRR o precios de bonos frente a implementaciones propias, actuando como oráculo de referencia.
- Entornos con requisitos de privacidad: al funcionar completamente offline y sin GPU, es adecuado para despachos contables, aseguradoras o departamentos financieros que no pueden enviar datos a servicios en la nube.
- Formación interna en riesgos y actuaría: los cálculos de VaR, seguros dotales y medidas de riesgo permiten construir ejercicios interactivos con la aplicación de escritorio, donde los gráficos y escenas se redibujan a partir de la respuesta calculada.
- Integración en CLI para analistas: la herramienta `economics-finance` en línea de comandos permite resolver cálculos puntuales (pago de préstamo, precio de bono, Black-Scholes) dentro de flujos de trabajo de terminal sin salir del entorno local.
- Prototipado de aplicaciones educativas en navegador: la versión web permite incrustar la resolución paso a paso en materiales docentes sin infraestructura de servidor propia.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el `model-index` de la model card, sin verificación independiente.

| Benchmark | Dataset | Métrica | Valor | Notas |
|---|---|---|---|---|
| Question answering (economía y finanzas) | Golden answers (453 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1.0 | "identical on every platform"; `verified: false` |

No se han publicado resultados de benchmarks en la información disponible más allá de esta métrica declarada. No hay datos de MMLU, HumanEval, GSM8K ni de comparación con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto no requiere GPU y ejecuta el cómputo en CPU.
- GPU recomendadas: ninguna; no se documenta aceleración por GPU.
- Cabe en cualquier equipo de consumo: la aplicación de escritorio se distribuye para Windows y Linux x86-64, y el paquete `pip` instala un build Python puro en macOS y ARM.
- Opciones de despliegue: aplicación de escritorio (Windows/Linux), CLI `economics-finance` (Windows/Linux), versión web en el navegador y paquete Python 3.10+ vía `pip`.
- Latencia y throughput: no disponibles; al tratarse de cálculos deterministas y locales, la latencia depende del cálculo concreto y del hardware, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| economics-finance-ai999x | Motor de cálculo determinista (Rust/Python) | 4.715.520 (declarados) | No aplica | Apache 2.0 | Hugging Face, `pip`, escritorio, CLI, web |
| LLM generativo de propósito general (p. ej. familia Llama, Mistral, Qwen) | Transformer decoder | Miles de millones | Decenas de miles de tokens | Licencias variables | Hugging Face, múltiples runtimes |
| Librerías financieras (p. ej. NumPy/NumPy-financial, QuantLib) | Librería de cálculo | No aplica | No aplica | BSD/GPL según proyecto | PyPI, GitHub |

La comparación con LLM generativos no es directa: `economics-finance-ai999x` no genera lenguaje libre ni razona sobre texto, sino que resuelve un conjunto cerrado de cálculos con validación de entradas. Frente a librerías como QuantLib o `numpy-financial`, su diferenciación es la salida paso a paso con unidades y explicaciones, junto con las interfaces de escritorio y web. No se dispone de datos de rendimiento comparativo con ninguna de estas alternativas.

## Limitaciones y advertencias

- La model card no describe arquitectura, datos de entrenamiento ni metodología de evaluación; la etiqueta `question-answering` puede inducir a error a quien espere un modelo de lenguaje.
- El resultado de accuracy 1.0 sobre 453 preguntas está declarado por el autor y marcado como `verified: false`; no hay evaluación independiente.
- El alcance está limitado a 105 cálculos en 15 temas; no cubre consultas abiertas, razonamiento sobre texto libre ni dominios fuera del temario declarado.
- Solo soporta inglés (`language: en`); no se documenta soporte multilingüe, lo que limita su uso en castellano sin adaptación.
- No se documentan sesgos, pero al ser un motor determinista el riesgo relevante no es la alucinación generativa sino la incorrecta validación de rangos o la omisión de casos límite en las fórmulas implementadas.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el archivo `LICENSE` del repositorio y las condiciones de las dependencias compiladas en los binarios distribuidos.
- El tamaño del repositorio es de 0.0 GB según Hugging Face, lo que sugiere que los binarios y el paquete `pip` se distribuyen fuera del repositorio (GitHub Releases), con la dependencia de disponibilidad que ello implica.
- La fecha de creación declarada (2026-10-25) y la de actualización (2026-11-21) deben tomarse como metadatos del repositorio; no hay historial público de versiones en la información disponible.
- Para producción, la ausencia de cifras de latencia y de pruebas de regresión publicadas obliga a validar el motor contra casos conocidos antes de integrarlo en flujos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/economics-finance-ai999x
- Página del modelo en el sitio del autor: https://www.ai999x.com/models/economics-finance-ai999x/
- Capacidades del modelo: https://www.ai999x.com/models/economics-finance-ai999x/#capabilities
- Aplicación de escritorio, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-economics-finance-1.6.7-windows-x86_64.zip
- Aplicación de escritorio, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-economics-finance-1.6.7-linux-x86_64.tar.gz
- CLI, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de escritorio: https://github.com/AI999X/ai999x-desktop
- Vídeo de demostración: https://www.ai999x.com/?ax_shot=economics-finance-ai999x/clip.mp4
