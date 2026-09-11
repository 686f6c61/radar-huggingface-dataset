# Montalte/qwen4b-math-nothink-random

## Resumen

Montalte/qwen4b-math-nothink-random es un artefacto de fusión (merge) de pesos construido sobre Qwen/Qwen3-4B-Base, publicado por el usuario Montalte. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es el resultado de aplicar aritmética de vectores de tarea (task arithmetic) entre el modelo base y un especialista en matemáticas (`modrill/math-nothink-q4b-20260908`) al que se le aplica una máscara binaria aleatoria de fracción exacta k=0,1 con semilla fija (seed=42). El propósito declarado por el autor es servir como artefacto de control en experimentos de transferencia direccional entre dominios math y code.

El modelo conserva la arquitectura y el tamaño del base: 4.022.468.096 parámetros (aproximadamente 4,02 mil millones) en safetensors, con un repositorio de 8,1 GB. La fusión se realiza sobre el "stitch body" del Plan B, es decir, excluyendo las matrices de embedding y la cabeza de lenguaje (lm_head) del proceso de mezcla. Es, por tanto, un modelo denso decoder-only tipo transformer, no un MoE.

Su relevancia es fundamentalmente metodológica y de investigación: permite medir si una máscara aleatoria sobre el vector de tarea funciona como línea base frente a máscaras aprendidas o seleccionadas por magnitud. No hay evidencia publicada de calidad final, benchmarks ni uso en producción; el repositorio presenta cero descargas y cero likes en el momento de la consulta, y la model card es esquemática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-4B-Base). No es MoE |
| Parametros totales | 4.022.468.096 (aproximadamente 4,02 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card; heredada del modelo base Qwen3-4B-Base (32.768 tokens nativos segun la documentacion de Qwen3, dato no verificado en este repositorio) |
| Tipos de cuantizacion | No se publican versiones cuantizadas en el repositorio. Pesos en safetensors, cuantizables a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | No disponible en la model card; heredados del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,1 GB) |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3-4B-Base (revision 906bfd4b4dc7f14ee4320094d8b41684abff8539) |
| Especialista de origen | modrill/math-nothink-q4b-20260908 |
| Metodo de fusion | random: mascara binaria aleatoria de fraccion exacta k, keep fraction 0,1, seed=42 |
| Dominio objetivo | math, modo nothink (sin cadena de pensamiento) |
| Fecha de publicacion | 2026-09-11 |

## Arquitectura y entrenamiento

El modelo no se entrena: se construye por fusión de pesos. La arquitectura subyacente es la de Qwen3-4B-Base, un transformer decoder-only denso con atención por causalidad, normalización RMSNorm y las innovaciones propias de la familia Qwen3 (entre ellas la alternancia entre modos thinking y non-thinking en las variantes instruidas, aquí irrelevante porque el base es un modelo preentrenado). Al ser un merge de pesos, no hay datos de entrenamiento nuevos, ni número de tokens, ni composición de dataset, ni fases de RLHF/DPO que reportar en este repositorio.

La innovación técnica es el método de fusión. Se calcula el vector de tarea como la diferencia entre el especialista en matemáticas y el base, y se aplica sobre él una máscara binaria aleatoria exacta de fracción k=0,1 (se conserva el 10% de las coordenadas) con semilla fija 42. Ese vector enmascarado se reinyecta sobre el base siguiendo el mismo cuerpo de mezcla que el autor denomina Plan B, que omite embedding y lm_head. A diferencia de las variantes con máscara aprendida, aquí la selección de coordenadas es uniformemente aleatoria, lo que convierte al modelo en una línea base de control para aislar el efecto de la selección informada de parámetros en experimentos de transferencia entre dominios. El autor etiqueta el artefacto como "nothink" y lo orienta a estudios de transferencia direccional math↔code.

## Capacidades

- Generación de texto autoregresiva: capacidades heredadas del modelo base Qwen3-4B-Base, sin garantías de que la fusión las preserve.
- Razonamiento matemático: el vector de tarea proviene de un especialista en matemáticas en modo nothink, por lo que el objetivo del merge es inyectar esa capacidad sin activar cadenas de pensamiento largas.
- Modo nothink: el artefacto se diseña para operar sin bloque de razonamiento explícito, lo que reduce el número de tokens de salida frente a esquemas de razonamiento extendido.
- Soporte de tool calling / function calling: no disponible. No se documenta plantilla de chat ni soporte de herramientas; el base es un modelo preentrenado, no instruido.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modo nothink es intrínsecamente menos adecuado para descomposición multi-paso.
- Capacidades multilingües: no disponible en la model card.
- Capacidades especiales (visión, audio): no disponible; no se declara ninguna.
- Uso como artefacto de investigación: es su capacidad principal y la única documentada explícitamente por el autor.

## Casos de uso

- Línea base de control en experimentos de task arithmetic: el modelo permite cuantificar cuánto del rendimiento de un merge se debe a la selección informada de parámetros frente a una máscara puramente aleatoria con la misma fracción k=0,1. Sirve para validar si una técnica de selección aporta señal real.
- Estudio de transferencia direccional math a code: al ser un merge del dominio math en modo nothink, se puede evaluar si las capacidades aritméticas transferidas mejoran tareas de código que dependen de razonamiento numérico, comparando contra el base sin fusionar.
- Ablación de hiperparámetros de fusión: combinado con variantes del mismo autor que usan máscaras aprendidas o distintas fracciones de k, permite aislar el efecto del criterio de enmascarado manteniendo constante el cuerpo de mezcla (Plan B, sin embed ni lm_head).
- Punto de partida para fine-tuning específico de matemáticas: al conservar los pesos del base y una inyección parcial del especialista, puede usarse como inicialización para un ajuste supervisado posterior en dominios STEM, aunque no hay evidencia de que supere al base.
- Generación de datos sintéticos de matemáticas sin cadena de pensamiento: si el merge conserva la competencia matemática, puede producir pares problema-solución directos, útiles para destilar en modelos pequeños o para construir datasets de respuestas concisas.
- Reproducción y auditoría de merges con semilla fija: el uso de seed=42 y una fracción de retención exacta hace el artefacto reproducible bit a bit, adecuado para trabajos de reproducibilidad y para verificar implementaciones propias de aritmética de vectores de tarea.
- Evaluación comparativa en harness estándar: integrable en lm-evaluation-harness para obtener métricas de GSM8K, MATH o MMLU y compararlas con el base y con el especialista original, siempre que se documenten los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, GSM8K, MATH, HumanEval ni de ningún otro conjunto de evaluación, y los resultados de la búsqueda web no aportan datos sobre este modelo.

## Requisitos de hardware

- VRAM estimada en bf16/fp16 (pesos completos): aproximadamente 8,1 GB solo para pesos, más overhead de activaciones y caché KV. En la práctica, entre 10 y 12 GB de VRAM para inferencia con contexto moderado.
- VRAM estimada en cuantización INT8: del orden de 4,5 GB para pesos.
- VRAM estimada en cuantización INT4 (por ejemplo Q4_K_M): del orden de 2,5 a 3 GB para pesos, más caché KV.
- GPU recomendadas para bf16: NVIDIA A100 40/80 GB, H100, L40S, RTX 4090 (24 GB), RTX 3090 (24 GB), A6000. Cabe con holgura en cualquier GPU de 16 GB o más.
- Cabe en GPU de consumo: sí. RTX 4090, RTX 3090, RTX 4080 (16 GB), RTX 4060 Ti 16 GB y RTX 3060 12 GB son suficientes en bf16 con contexto moderado; en GPUs de 8 GB es recomendable cuantizar a INT4.
- Despliegue: transformers de forma nativa (es el formato publicado), vLLM y TGI para servicio con batching continuo una vez verificada la compatibilidad de la arquitectura Qwen3, y llama.cpp / Ollama / LM Studio tras convertir los pesos a GGUF, ya que el repositorio no incluye GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, TTFT ni resultados de pruebas de carga.
- Nota: los valores de VRAM son estimaciones derivadas del número de parámetros y del tamaño del repositorio, no mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Montalte/qwen4b-math-nothink-random | 4,02 B | No disponible (base: 32.768 nativos) | Merge con mascara aleatoria (k=0,1, seed=42) sobre Qwen3-4B-Base | Apache 2.0 | HuggingFace, 0 descargas |
| Montalte (variantes del mismo autor, p. ej. mascara aprendida) | 4,02 B | No disponible | Merge con criterio de seleccion alternativo | Apache 2.0 | No verificado en esta busqueda |
| modrill/math-nothink-q4b-20260908 | 4,02 B | No disponible | Especialista en matematicas en modo nothink, origen del vector de tarea | No disponible | Referenciado como modelo fuente |
| Qwen/Qwen3-4B-Base | 4,02 B | 32.768 nativos (hasta 131.072 con YaRN segun documentacion de Qwen3) | Modelo preentrenado denso, sin instruir | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Qwen/Qwen3-4B (instruido) | 4,02 B | 32.768 nativos, 32.768 en modo thinking | Modelo instruido con modos thinking/non-thinking | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas alternativas para este artefacto concreto; la comparación se limita a parámetros, contexto, licencia y naturaleza del modelo. Para tareas de matemáticas de mayor tamaño existen alternativas de la familia Qwen2.5-Math, pero no se incluyen aquí por falta de datos verificados en la información proporcionada.

## Limitaciones y advertencias

- Artefacto experimental sin validación: no hay benchmarks, ni evaluaciones, ni documentación de calidad. No debe asumirse que la fusión mejore al modelo base en ninguna tarea concreta.
- Máscara aleatoria por diseño: al retener solo el 10% de las coordenadas del vector de tarea de forma uniformemente aleatoria, la inyección de la capacidad matemática es parcial y no dirigida; es esperable una degradación o una mejora marginal respecto al base.
- Modelo base no instruido: Qwen3-4B-Base no está alineado con instrucciones, por lo que no se garantiza seguimiento de instrucciones, formato conversacional ni plantilla de chat. La etiqueta "conversational" del repositorio no equivale a un ajuste por RLHF.
- Riesgo de alucinación: no cuantificado ni evaluado. Al ser un modelo preentrenado sin alineación, la probabilidad de generar contenido incorrecto con apariencia de certeza es la del base, y la fusión puede alterarla de forma no documentada.
- Idiomas: no se declara ningún conjunto de idiomas soportados. El comportamiento multilingüe es desconocido y no verificado.
- Contexto: la longitud de contexto efectiva tras el merge no está documentada; se hereda de la arquitectura del base, pero no se ha validado el comportamiento en ventanas largas.
- Ausencia de quantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que añade un paso de conversión y validación antes de cualquier despliegue en CPU o en GPUs pequeñas.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo fuente (`modrill/math-nothink-q4b-20260908`), cuya licencia no está disponible en la información proporcionada, y las de Qwen3-4B-Base.
- Sin soporte ni mantenimiento: cero descargas y cero likes, sin issues ni comunidad. No hay garantía de actualizaciones, correcciones ni respuesta del autor.
- No apto para producción sin evaluación previa: cualquier uso en un sistema real debería ir precedido de una evaluación propia en el dominio objetivo y de una comparación contra el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Montalte/qwen4b-math-nothink-random
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Revision del base referenciada en la model card: 906bfd4b4dc7f14ee4320094d8b41684abff8539
- Modelo especialista de origen: modrill/math-nothink-q4b-20260908 (referenciado en la model card; no se ha localizado URL verificada en la busqueda)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos resultados obtenidos fueron paginas de ayuda de Google Maps, sin relacion con el artefacto. No se han encontrado papers, blogs, repositorios ni demos adicionales.
