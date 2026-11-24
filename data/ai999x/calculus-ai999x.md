# AI999X/calculus-ai999x

## Resumen

Calculus (calculus-ai999x) es un motor de cálculo simbólico y numérico empaquetado como modelo de question-answering, desarrollado por AI999X. No es un modelo de lenguaje neuronal: se trata de un motor compilado (implementado en Rust, con un build en Python puro) que resuelve 82 tipos de cálculos repartidos en 16 temas de cálculo —límites, derivadas, integrales, series, polinomios de Taylor, cálculo multivariable y vectorial, funciones especiales y diferenciación e integración numérica— devolviendo fórmula, pasos, unidades y una razón en lenguaje natural cuando una entrada falta o está fuera de rango.

Su relevancia radica en la propuesta de "cero alucinación": al no generar texto libre sino ejecutar cálculos deterministas, la salida es reproducible e idéntica en cada plataforma. Se distribuye como aplicación de escritorio (Windows y Linux), herramienta de línea de comandos, versión web y paquete de Python (`pip install calculus-ai999x`), todo ejecutable offline en el equipo del usuario.

El repositorio de Hugging Face declara 4.715.520 parámetros en safetensors y un tamaño de repo de 0.0 GB, lo que sugiere que los pesos publicados son mínimos o testimoniales y que la funcionalidad real reside en el motor empaquetado fuera del repo. La licencia es Apache 2.0 y el único idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista (compilado en Rust; build en Python puro); no es un transformer |
| Parametros totales | 4.715.520 (safetensors declarados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo generativo) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo); binarios de app, CLI y paquete Python para el motor |
| Pipeline | question-answering |
| Libreria | calculus-ai999x |
| Cobertura funcional | 82 cálculos en 16 temas |
| Plataformas | Windows, Linux, navegador, Python 3.10+ |
| Ejecucion | offline, en local |
| Descargas | 335 |

## Arquitectura y entrenamiento

El modelo no sigue una arquitectura de red neuronal Transformer ni MoE ni SSM. Es un motor de resolución de cálculo con 82 cálculos implementados en 16 temas, cada uno con su fórmula, sus pasos y sus unidades. La implementación principal es un motor compilado (etiquetado como Rust en los tags) que se distribuye dentro de la aplicación de escritorio, la CLI y la versión de navegador; adicionalmente existe un build en Python puro del mismo conjunto de cálculos, instalable mediante `pip install calculus-ai999x`, que no incluye el motor compilado.

No hay información disponible sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO, porque el modelo no se entrena con ese paradigma: su comportamiento se define por la lógica de los cálculos implementados. La innovación técnica destacable es el enfoque de "cero alucinación": cuando una entrada falta o está fuera de rango, el sistema devuelve una razón en lenguaje natural en lugar de un número inventado. La aplicación de escritorio además dibuja escenas y gráficas a partir de la respuesta calculada, de modo que la visualización es consistente con el resultado numérico.

## Capacidades

- Resolución de límites, incluyendo límite en un punto con escena en vivo.
- Derivadas y derivadas direccionales.
- Integrales definidas e indefinidas, con representación gráfica del área.
- Integrales triples en coordenadas cilíndricas y esféricas.
- Integrales de línea de campos vectoriales.
- Series y coeficientes de Fourier.
- Polinomios de Taylor con visualización de la aproximación.
- Cálculo multivariable y vectorial.
- Extremos absolutos en intervalos cerrados.
- Funciones especiales.
- Diferenciación e integración numérica.
- Respuestas paso a paso con fórmula, pasos y unidades.
- Devolución de una razón explicativa cuando la entrada falta o está fuera de rango, en lugar de un valor numérico.
- Preguntas en lenguaje natural mediante `calculus.ask(...)` (15 ejemplos documentados en la model card).
- Cuatro modos de uso: aplicación de escritorio, línea de comandos `calculus`, navegador y Python.
- Ejecución completamente offline, sin dependencia de red.
- No dispone de tool calling, soporte de agentes, visión, audio ni modo de razonamiento generativo; no es un LLM.

## Casos de uso

- Docencia de cálculo en el aula: el profesor plantea límites, derivadas o integrales y el motor devuelve fórmula, pasos y unidades, lo que permite proyectar la resolución completa y contrastar el resultado con la escena y las gráficas generadas por la app de escritorio.
- Autoaprendizaje y ayuda con deberes: el estudiante ejecuta la CLI o la app en local, sin conexión, y obtiene la resolución paso a paso de un ejercicio de Taylor o de extremos en un intervalo cerrado, con la ventaja de que el sistema explica por qué una entrada está fuera de rango en lugar de inventar un número.
- Verificación de resultados en pipelines de cálculo numérico: el paquete de Python permite integrar los 82 cálculos en scripts de validación, comparando la salida simbólica con la numérica (integración numérica frente a integral definida) para detectar discrepancias.
- Generación de material didáctico y gráficas: la app dibuja escenas y gráficas a partir de la respuesta calculada (límite en un punto, integral definida, coeficientes de Fourier, integral de línea de un campo vectorial), lo que facilita preparar figuras para apuntes o presentaciones sin herramientas adicionales.
- Entornos sin conectividad o con requisitos de privacidad: al ejecutarse offline en Windows y Linux, es adecuado para laboratorios docentes, aulas con red restringida o entornos donde los enunciados no deben salir del equipo.
- Prototipado rápido en Python: `pip install calculus-ai999x` ofrece un build en Python puro para probar los cálculos dentro de notebooks o scripts antes de pasar a la app o la CLI con el motor compilado.
- Automatización de tareas repetitivas de cálculo en línea de comandos: la CLI `calculus` permite encadenar cálculos en scripts de shell para procesar lotes de ejercicios o generar tablas de resultados de forma reproducible.

## Benchmarks y rendimiento

Los datos proceden del model-index declarado por el autor. La métrica es accuracy sobre "Golden answers (459 documented questions, Windows + Linux Python 3.10-3.14)".

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| calculus question answering | Golden answers (459 preguntas documentadas, Windows + Linux Python 3.10-3.14) | accuracy | 1.0 ("identical on every platform") | false |

No se han publicado otros resultados de benchmarks en la información disponible. El valor 1.0 no está verificado de forma independiente y procede exclusivamente de la model card del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no es un modelo neuronal y no requiere GPU.
- GPU recomendadas: no aplica; el motor es determinista y se ejecuta en CPU.
- Cabe en cualquier equipo de consumo: la app de escritorio se distribuye para Windows x86_64 y Linux x86_64; el paquete de Python requiere Python 3.10 o superior.
- Opciones de despliegue: aplicación de escritorio (Windows/Linux), CLI `calculus`, versión web en el navegador y paquete Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia | Ejecucion |
|---|---|---|---|---|---|---|
| calculus-ai999x | Motor de cálculo determinista | 4.715.520 (safetensors) | no aplica | 82 cálculos en 16 temas, paso a paso, offline | Apache 2.0 | Local (app, CLI, navegador, Python) |
| LLM generalista (p. ej. familia Llama, Mistral, Qwen) | Transformer generativo | Miles de millones | Decenas de miles de tokens | Texto libre, razonamiento, código | Varía (comunitaria o restrictiva) | GPU/CPU con vLLM, llama.cpp, Ollama |
| SymPy | Librería de matemática simbólica en Python | no aplica | no aplica | Cálculo simbólico programático | BSD | CPU, Python |
| Wolfram Alpha | Servicio en la nube | no disponible | no aplica | Resolución matemática amplia | Propietaria | Nube (requiere conexión) |

La comparación con LLM generalistas no es directa: calculus-ai999x no genera lenguaje libre y su propuesta es la reproducibilidad y la ausencia de alucinación en el dominio acotado del cálculo. Frente a SymPy, ofrece una interfaz de lenguaje natural, pasos y visualizaciones integradas; frente a Wolfram Alpha, la ventaja es la ejecución offline y local. No se dispone de comparativas de rendimiento publicadas frente a estas alternativas.

## Limitaciones y advertencias

- Dominio estrictamente acotado: 82 cálculos en 16 temas de cálculo; no responde preguntas fuera de ese ámbito.
- Idioma único: solo inglés declarado; no hay soporte multilingüe documentado.
- No es un modelo generativo: no mantiene conversaciones abiertas, no hace tool calling ni razonamiento multi-paso fuera de los cálculos implementados.
- El resultado de accuracy 1.0 del model-index está marcado como no verificado y procede del propio autor; debe tratarse con cautela hasta una evaluación independiente.
- El repositorio declara 4.715.520 parámetros en safetensors pero un tamaño de repo de 0.0 GB, lo que indica que los pesos publicados no contienen el motor funcional; la funcionalidad real se obtiene instalando la app, la CLI o el paquete Python desde los enlaces del autor.
- El build de Python es de "Python puro" y no incluye el motor compilado, por lo que su comportamiento puede diferir en rendimiento respecto a la app, la CLI y el navegador.
- Riesgo de alucinación bajo por diseño en el dominio cubierto, pero las entradas fuera de rango devuelven una razón explicativa, no un resultado; el usuario debe interpretar correctamente ese comportamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las condiciones de los binarios distribuidos en GitHub.
- Solo se distribuyen binarios para Windows y Linux x86_64; no se documenta soporte para macOS ni ARM.
- Sin datos publicados sobre latencia, throughput ni consumo de recursos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/calculus-ai999x
- Página del modelo con demo en navegador: https://www.ai999x.com/models/calculus-ai999x/
- Aplicación de escritorio Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-calculus-1.6.7-windows-x86_64.zip
- Aplicación de escritorio Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-calculus-1.6.7-linux-x86_64.tar.gz
- CLI Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de escritorio: https://github.com/AI999X/ai999x-desktop
- Clip de demostración (MP4): https://www.ai999x.com/?ax_shot=calculus-ai999x/clip.mp4
