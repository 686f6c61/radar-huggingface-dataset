# AI999X/nuclear-engineering-ai999x

## Resumen

Nuclear Engineering (nuclear-engineering-ai999x) es un motor de cálculo compilado especializado en problemas de ingeniería nuclear, publicado por el autor AI999X bajo licencia Apache 2.0. No es un modelo de lenguaje generativo en el sentido habitual: se distribuye como una librería de Python, una aplicación de escritorio para Windows y Linux, una interfaz de línea de comandos y una versión ejecutable en navegador, y responde a preguntas de ingeniería nuclear con cálculos resueltos paso a paso, fórmulas, unidades y explicaciones. El repositorio de Hugging Face contiene 4.715.520 parámetros en formato safetensors y se etiqueta con el pipeline `question-answering`.

El modelo cubre 84 cálculos organizados en 10 temas: desintegración radiactiva y cadenas de decaimiento, energía de enlace, fundamentos de física de reactores, blindaje y atenuación de radiación, dosimetría, detección de radiación, cinética de reactores, moderación de neutrones, criticidad y enriquecimiento de uranio. Cada cálculo incluye su fórmula, los pasos intermedios, las unidades y, cuando falta un dato o está fuera de rango, una explicación en lenguaje natural en lugar de un número inventado. Esa es la base de su propuesta de "cero alucinación".

Su relevancia actual reside en el enfoque: frente a los modelos generativos que pueden producir resultados plausibles pero incorrectos en dominios técnicos críticos, este motor prioriza la reproducibilidad y la verificabilidad. La model card declara una precisión de 1.0 sobre un conjunto de 562 preguntas documentadas, con resultados idénticos en Windows y Linux sobre Python 3.10 a 3.14, aunque la métrica figura como no verificada en el model-index. El soporte de idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo compilado con envoltorio Python; no se especifica arquitectura de red neuronal |
| Parametros totales | 4.715.520 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (según metadatos del repo); distribución principal como binarios compilados y paquete Python |
| Librería | nuclear-engineering-ai999x |
| Pipeline | question-answering |
| Inferencia | No (campo `inference: false` en la model card) |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de transformer ni de red neuronal convencional. El modelo se presenta como "un motor compilado" (`one compiled engine`) con cuatro formas de uso: aplicación de escritorio, línea de comandos, navegador y Python. En Windows y Linux x86-64, `pip` instala el mismo motor compilado; en otras plataformas (macOS, ARM) se instala una versión en Python puro que, según el autor, produce las mismas respuestas. Los tags incluyen `rust`, lo que sugiere que el núcleo compilado está implementado en Rust, aunque la model card no lo confirma explícitamente ni detalla el proceso de entrenamiento.

No se especifican datos de entrenamiento, número de tokens, composición del dataset, ni uso de RLHF o DPO. La evaluación declarada se basa en 562 preguntas documentadas con respuestas de referencia ("golden answers"), ejecutadas en Windows y Linux con Python 3.10 a 3.14, y el autor afirma resultados idénticos en todas las plataformas. La innovación técnica destacable es el diseño determinista: cada respuesta se deriva de un cálculo explícito con fórmula y unidades, y los casos con entradas ausentes o fuera de rango devuelven una explicación en lugar de un valor numérico.

## Capacidades

- Resolución de 84 cálculos de ingeniería nuclear en 10 temas, con fórmula, pasos intermedios y unidades.
- Desintegración radiactiva, cadenas de decaimiento y ecuaciones de Bateman.
- Actividad y actividad específica de una masa de radionúclido.
- Energía de enlace nuclear.
- Blindaje y atenuación de radiación, incluido el factor de buildup.
- Tasa de dosis de fuentes gamma puntuales apantalladas.
- Dosimetría: dosis efectiva comprometida a partir de coeficientes de dosis.
- Detección de radiación: tiempo muerto, estadística de conteo, borde Compton y pico de retrodispersión.
- Moderación de neutrones: número medio de colisiones para termalizar.
- Criticidad: radio crítico de un reactor esférico desnudo (un grupo), k-effective, difusión en dos grupos.
- Cinética de reactores: cinética puntual, ecuación de inhour, envenenamiento por xenón.
- Valor de barras de control integral y diferencial con ponderación seno al cuadrado.
- Enriquecimiento de uranio: alimentación, colas y trabajo de separación (SWU).
- Respuestas paso a paso orientadas a resolución de problemas y ayuda académica.
- Funcionamiento totalmente offline en el equipo del usuario.
- Sin soporte declarado de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Docencia universitaria de ingeniería nuclear: el motor resuelve ejercicios de cinética puntual o difusión en dos grupos mostrando fórmula, pasos y unidades, lo que permite al estudiante seguir la derivación en lugar de recibir solo el resultado.
- Verificación de cálculos de blindaje en oficina técnica: para una fuente gamma puntual con apantallamiento, el motor devuelve la tasa de dosis con factor de buildup y deja trazabilidad de los pasos, útil como comprobación cruzada de herramientas de simulación.
- Cálculo de actividad y actividad específica en gestión de residuos radiactivos: a partir de la masa y el radionúclido, se obtiene la actividad con unidades explícitas, lo que facilita la documentación regulatoria.
- Análisis de criticidad en formación y pre-diseño: el radio crítico de una esfera desnuda en aproximación de un grupo y el k-effective sirven como estimación rápida antes de recurrir a códigos de transporte.
- Cálculo de enriquecimiento y SWU en el ciclo del combustible: alimentación, colas y trabajo de separación se resuelven paso a paso, adecuado para asignaturas de ciclo de combustible y estimaciones de planta.
- Estadística de conteo y tiempo muerto en laboratorio de detección: el motor calcula correcciones por tiempo muerto y analiza el borde Compton de una línea gamma, útil para calibrar y validar medidas experimentales.
- Integración en pipelines de Python: mediante `pip install nuclear-engineering-ai999x` se puede invocar el motor desde scripts y notebooks para automatizar cálculos repetitivos con resultados deterministas.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el model-index:

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering de ingeniería nuclear | Golden answers (562 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1.0 (idéntico en todas las plataformas) | No |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica como modelo de red neuronal; el motor se ejecuta en CPU.
- GPU recomendadas: no se requieren; no hay dependencia de GPU documentada.
- Cabe en cualquier equipo de consumo: la aplicación de escritorio está disponible para Windows y Linux x86-64, y la versión de navegador funciona en cualquier dispositivo.
- Despliegue: aplicación de escritorio (Windows, Linux), CLI `nuclear-engineering` (Windows, Linux), navegador y paquete Python 3.10+ (`pip install nuclear-engineering-ai999x`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al ser cálculos deterministas en CPU, la latencia depende del cálculo concreto y no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| nuclear-engineering-ai999x | Motor de cálculo determinista | 4.715.520 | No disponible | Apache 2.0 | 84 cálculos de ingeniería nuclear con pasos |
| Modelos LLM de propósito general (p. ej. Llama, Mistral, Qwen) | Transformer generativo | Miles de millones | Decenas de miles de tokens | Variables | Razonamiento abierto, riesgo de alucinación en cálculos técnicos |
| Códigos de transporte neutrónico (MCNP, OpenMC) | Monte Carlo / determinista | No aplica | No aplica | Variables (OpenMC es MIT) | Simulación física de alta fidelidad |

La comparación directa con LLM no es homogénea: este motor no genera lenguaje libre ni mantiene conversaciones multi-turno, sino que resuelve un conjunto acotado de cálculos con resultado determinista. Frente a códigos como OpenMC, ofrece estimaciones analíticas rápidas y didácticas, no simulación de alta fidelidad. No se dispone de datos de rendimiento comparables con alternativas de la misma categoría.

## Limitaciones y advertencias

- Cobertura acotada: 84 cálculos en 10 temas; no es un asistente general ni responde preguntas fuera de ese catálogo.
- Idioma único: solo inglés, lo que limita su uso directo en entornos en castellano.
- No es un modelo generativo conversacional: no mantiene diálogo multi-turno ni razonamiento abierto.
- La precisión de 1.0 declarada por el autor no está verificada de forma independiente y se mide sobre un conjunto propio de 562 preguntas, no sobre benchmarks estándar.
- El campo `inference: false` en la model card indica que no está pensado para inferencia como modelo de Hugging Face convencional; el uso requiere los binarios o el paquete Python.
- Riesgo de alucinación bajo por diseño en los cálculos cubiertos, pero las estimaciones analíticas (un grupo, dos grupos) no sustituyen a códigos de transporte para decisiones de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni validación regulatoria de los resultados.
- No se especifican sesgos, datos de entrenamiento ni procesos de evaluación independientes, lo que dificulta auditar su fiabilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/nuclear-engineering-ai999x
- Página del modelo en el sitio del autor: https://www.ai999x.com/models/nuclear-engineering-ai999x/
- Capacidades y demo en navegador: https://www.ai999x.com/models/nuclear-engineering-ai999x/#capabilities
- Clip de demostración (MP4): https://www.ai999x.com/?ax_shot=nuclear-engineering-ai999x/clip.mp4
- Aplicación de escritorio, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-nuclear-engineering-1.6.7-windows-x86_64.zip
- Aplicación de escritorio, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-nuclear-engineering-1.6.7-linux-x86_64.tar.gz
- CLI, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
