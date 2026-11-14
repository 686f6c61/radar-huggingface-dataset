# amorarc/func-jepa

## Resumen

Func-JEPA es un modelo de representación latente para funciones matemáticas simbólicas univariantes, desarrollado por Alejandro Moreno Arcas y publicado bajo licencia MIT. A diferencia de un modelo de lenguaje generativo, Func-JEPA codifica la forma simbólica de una función en un vector de R^256 cuya norma coincide con la norma H¹ exacta de la función y cuyos productos escalares aproximan productos internos de H¹. El modelo se presenta en el artículo *Func-JEPA: Learning a Sobolev Space of Functions as Latent Vectors* (2026).

La arquitectura sigue el paradigma JEPA (Joint Embedding Predictive Architecture) aplicado a un espacio de Sobolev: el codificador se entrena con un objetivo de coincidencia de ángulos H¹, linealidad y un término predictivo que estima el latente de la derivada f' a partir del latente de f. Sobre el codificador congelado se entrenan módulos auxiliares para decodificar latentes a fórmulas, componer funciones, integrar y mapear muestras de valores a latentes.

El modelo es relevante para investigación en representación de funciones y en regresión simbólica: permite manipular operadores diferenciales e integrales directamente en el espacio latente. Su alcance es acotado: funciones univariantes en un intervalo fijo, vocabulario de 37 tokens y un máximo de 126 tokens, entrenado exclusivamente con datos sintéticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA (Joint Embedding Predictive Architecture) con encoder transformer sobre tokens simbólicos; módulos auxiliares de decodificación, composición, integración y codificación de valores |
| Parametros totales | 35.1M (encoder_pi) + 17.7M (decoder) + 52.9M (compose) + 7.6M (integrator) + 7.4M (value_encoder); variantes encoder_05 (35.1M), decoder_lc (17.7M) y value_encoder_lc (7.4M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | máximo 126 tokens de expresión simbólica; vocabulario de 37 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo simbólico-matemático, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (cada carpeta incluye model.safetensors y config.json; SHA256.json con hashes) |

## Arquitectura y entrenamiento

Func-JEPA aplica el marco JEPA al espacio de funciones H¹ sobre un intervalo fijo. El codificador transforma la forma simbólica de una función univariante en un vector de R^256; el entrenamiento combina tres objetivos: coincidencia de ángulos H¹ entre latentes, preservación de la linealidad y un término JEPA que predice el latente de la derivada f' a partir del latente de f. De este modo, la diferenciación emerge como un operador latente aprendido. El modelo se entrena en dos variantes de intervalo: `encoder_pi` sobre [-π, π] (la usada en todos los resultados del artículo) y `encoder_05` sobre [0, 5].

Los datos son exclusivamente sintéticos: 2,0 millones de funciones procedentes de 17 familias parametrizadas y árboles de expresiones aleatorios cortos, generados con SymPy. El entrenamiento principal consistió en una única ejecución de 40.000 pasos en una GPU de 8 GB durante 6,6 horas. Posteriormente, sobre el codificador congelado, se entrenaron los módulos auxiliares: decodificador latente a tokens de prefijo, operadores de composición (sin, cos, log, sqrt, square, cube, quadratic), integrador (latente de f a latente de la antiderivada de media cero) y codificador de valores (64 muestras a dirección latente). Existen variantes `decoder_lc` y `value_encoder_lc` ajustadas para el benchmark de EDO de Lample–Charton.

## Capacidades

- Codificación de la forma simbólica de funciones univariantes en vectores de R^256 con norma H¹ exacta.
- Aproximación de productos internos H¹ mediante productos escalares de latentes (correlación 0.998 según el artículo).
- Diferenciación como operador latente aprendido: recupera f' entre 3.956 candidatos para el 82,0 % de las funciones de test.
- Decodificación de latentes a fórmulas simbólicas.
- Composición en espacio latente con operadores para sin, cos, log, sqrt, square, cube y quadratic.
- Integración simbólica en espacio latente (antiderivada de media cero).
- Regresión simbólica a partir de 64 muestras de valores (exacta en el 76 % de los casos sin ruido).
- Mapeo de muestras de valores a direcciones latentes mediante `value_encoder`.
- No soporta tool calling, agentes, ni capacidades multilingües o multimodales.

## Casos de uso

- Regresión simbólica en investigación: dado un conjunto de 64 muestras de una función univariante, el modelo propone una expresión simbólica exacta en el 76 % de los casos sin ruido, lo que permite recuperar fórmulas interpretables en lugar de ajustes numéricos opacos.
- Diferenciación simbólica asistida: el operador latente de derivada permite obtener f' codificando f y aplicando el operador; útil para verificar derivadas o generar candidatos que luego se refinan y validan con SymPy.
- Integración simbólica en pipelines de cálculo simbólico: el integrador latente produce la antiderivada de media cero de una función codificada, con un 91,7 % de verificaciones correctas por SymPy en el conjunto de test del artículo.
- Composición de funciones: los operadores de composición permiten construir en espacio latente funciones como sin(f), log(f) o f² sin pasar por la representación simbólica intermedia, útil en exploración de familias funcionales.
- Búsqueda y recuperación de funciones: como la norma del latente es la norma H¹ exacta, se pueden comparar y ordenar funciones por magnitud o similitud en el espacio de Sobolev de forma directa.
- Preentrenamiento para modelos de razonamiento matemático: el encoder congelado puede servir como extractor de características para tareas posteriores de análisis simbólico, reduciendo la necesidad de entrenar desde cero.
- Evaluación de métodos de regresión simbólica: sirve como referencia para comparar enfoques de recuperación de fórmulas sobre las 17 familias de funciones del conjunto de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados en el artículo (ejecución única; no se midió la variabilidad entre semillas):

| Metrica | Resultado |
|---|---|
| Correlación coseno latente vs. H¹ | 0.993 |
| Correlación producto escalar latente vs. H¹ | 0.998 |
| Recuperación de f' entre 3.956 candidatos | 82,0 % |
| Regresión simbólica exacta, 64 muestras, ruido 0 | 76 % |
| Regresión simbólica exacta, 64 muestras, ruido 0,1 % | 76 % |
| Regresión simbólica exacta, 64 muestras, ruido 1 % | 62 % |
| Integración simbólica verificada por SymPy (test del artículo) | 91,7 % |
| Integración en test de Lample–Charton | 20–25 % |
| EDO en test de Lample–Charton | 16–25 % |

No se han publicado comparaciones directas con MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento completo del encoder se realizó en una GPU de 8 GB; la inferencia del encoder (35,1M parámetros) y los módulos auxiliares (hasta 52,9M en `compose`) cabe holgadamente en GPUs de consumo con 4–8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el encoder; una RTX 3060, RTX 4060 o superior es suficiente. Para cargar todos los módulos simultáneamente se recomienda 8 GB o más.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas de consumo.
- Opciones de despliegue: la librería oficial `fjepa` (instalable vía `pip install git+https://github.com/amorarc/Func-JEPA`) sobre PyTorch; los pesos están en safetensors y pueden cargarse con `FuncJEPA.from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, al no ser un modelo generativo de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| Func-JEPA | JEPA simbólico | 35,1M (encoder) | 126 tokens | Representación latente H¹ de funciones | MIT |
| Lample–Charton | Transformer seq2seq | no disponible | no disponible | Integración simbólica y EDO | no disponible |
| Regresión simbólica clásica (p. ej. PySR) | Búsqueda evolutiva | no aplica | no aplica | Búsqueda de expresiones | MIT / open source |

Func-JEPA se distingue por operar en un espacio latente con estructura de Sobolev en lugar de generar tokens simbólicos directamente. Frente a los modelos específicos de Lample–Charton, Func-JEPA obtiene resultados muy inferiores en sus benchmarks (20–25 % frente a más del 90 %), aunque su ventaja se mide en las familias de funciones de preentrenamiento. Frente a métodos de búsqueda evolutiva como PySR, ofrece inferencia rápida y un espacio latente manipulable, pero con menor generalidad fuera de su distribución de entrenamiento.

## Limitaciones y advertencias

- Los operadores latentes son aproximados: el error relativo mediano de la derivada es del 7 %.
- Los latentes predichos decodifican a la forma correcta con más frecuencia que a constantes exactas; se recomienda reajustar y verificar los candidatos.
- Rendimiento débil fuera de las familias de preentrenamiento: 20–25 % en los conjuntos de integración de Lample–Charton y 16–25 % en sus conjuntos de EDO, donde modelos específicos superan el 90 %.
- La ventaja en regresión simbólica se mide únicamente sobre funciones de las familias de preentrenamiento.
- Solo admite funciones univariantes en un intervalo fijo, vocabulario de 37 tokens sin funciones especiales y un máximo de 126 tokens.
- Entrenamiento en una única ejecución: no se midió la variabilidad entre semillas.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni capacidades multilingües.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Riesgo de alucinación en sentido simbólico: el decodificador puede producir expresiones con la forma correcta pero constantes incorrectas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amorarc/func-jepa
- Código: https://github.com/amorarc/Func-JEPA
- Dataset: https://huggingface.co/datasets/amorarc/func-jepa-data
- Artículo: Moreno Arcas, Alejandro (2026), *Func-JEPA: Learning a Sobolev Space of Functions as Latent Vectors*
