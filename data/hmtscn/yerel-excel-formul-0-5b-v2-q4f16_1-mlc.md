# hmtscn/yerel-excel-formul-0.5b-v2-q4f16_1-MLC

## Resumen

Yerel Excel Formül Modeli es un modelo de lenguaje especializado en la generación de fórmulas de Excel a partir de instrucciones en turco y de la estructura de una tabla (nombres y tipos de columna). Lo desarrolla el usuario hmtscn y se distribuye como un artefacto compilado para MLC-LLM con cuantización q4f16_1, pensado para ejecutarse íntegramente en el navegador mediante WebLLM. Deriva del modelo base Qwen/Qwen2.5-Coder-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros, afinado para una tarea muy concreta y acotada.

La relevancia del modelo está en su planteamiento de despliegue: al estar compilado para MLC-LLM y WebLLM, no requiere servidor ni API, y toda la inferencia ocurre en el cliente, lo que elimina la latencia de red y mantiene los datos de la hoja de cálculo en el dispositivo. El repositorio ocupa aproximadamente 0,3 GB, un tamaño compatible con la descarga inicial en un navegador de escritorio.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y con una model card muy escueta. No se publican detalles sobre el dataset de ajuste, el número de tokens de entrenamiento ni resultados de evaluación, por lo que su evaluación debe hacerse de forma empírica sobre el caso de uso previsto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-0.5B-Instruct); artefacto compilado para MLC-LLM |
| Parametros totales | 0,5 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | q4f16_1 (grupo de 4 bits con acumulacion en fp16); otras variantes no disponibles |
| Idiomas soportados | turco (tarea principal); capacidades multilingues heredadas del modelo base no documentadas |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefacto MLC-LLM (biblioteca mlc-llm); no se distribuyen safetensors ni GGUF en este repositorio |
| Tamano del repositorio | 0,3 GB |
| Modelo base | Qwen/Qwen2.5-Coder-0.5B-Instruct |
| Fecha de creacion | 2026-11-27 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-0.5B-Instruct: un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings de tokens compartidos con la cabeza de salida. El modelo base fue entrenado por Alibaba Qwen con un corpus orientado a código y posteriormente ajustado con instrucciones, pero no se dispone de cifras concretas de tokens de entrenamiento en la información proporcionada. El repositorio que nos ocupa no contiene los pesos originales, sino una compilación a formato MLC-LLM con cuantización q4f16_1, optimizada para ejecución en WebGPU dentro del navegador.

Sobre el ajuste específico no hay documentación: la model card solo indica que el modelo recibe una petición en turco y la estructura de la tabla (únicamente nombres y tipos de columna) y devuelve una única fórmula de Excel. No se especifica si el ajuste se hizo con SFT, DPO o RLHF, ni el volumen o la composición del dataset. Tampoco se documentan innovaciones técnicas adicionales más allá del pipeline de compilación de MLC-LLM, que genera kernels WebGPU y permite decodificación en el cliente sin dependencias de servidor.

## Capacidades

- Generación de fórmulas de Excel a partir de una instrucción en turco y del esquema de la tabla (nombres y tipos de columna).
- Salida de una única fórmula por petición, lo que simplifica el parseo y la inserción directa en la hoja de cálculo.
- Comprensión de instrucciones en turco para la tarea objetivo.
- Ejecución en navegador mediante WebLLM y WebGPU, sin backend ni API externa.
- Capacidades heredadas del modelo base Qwen2.5-Coder-0.5B-Instruct (generación de código, razonamiento básico, matemáticas elementales) presentes de forma residual, aunque no documentadas ni garantizadas tras el ajuste.
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente de fórmulas integrado en una hoja de cálculo web: el usuario describe en turco lo que quiere calcular y el modelo devuelve la fórmula lista para pegar, con la ventaja de que la inferencia ocurre en el navegador y los datos de la hoja no salen del dispositivo.
- Herramienta interna para equipos financieros y administrativos turcos: reducción del tiempo de creación de fórmulas de búsqueda, suma condicional o extracción de texto, al no requerir conocimiento de la sintaxis de Excel.
- Generación de plantillas a partir de un esquema de columnas: dado un conjunto de nombres y tipos de columna, el modelo propone fórmulas coherentes con esa estructura, útil para generar hojas de cálculo preconfiguradas.
- Formación y onboarding: entorno de práctica en el que el usuario compara su fórmula con la generada por el modelo para aprender la sintaxis.
- Extensión de navegador o complemento ofimático: al empaquetarse como artefacto MLC-LLM de 0,3 GB, puede distribuirse dentro de una extensión y ejecutarse sin infraestructura propia.
- Prototipado rápido de funciones de autocompletado en aplicaciones de hojas de cálculo: el modelo sirve como base para validar la experiencia de usuario antes de invertir en un modelo mayor o en un servicio alojado.
- Uso educativo en entornos con conectividad limitada: una vez descargado, el modelo funciona sin conexión, lo que facilita su uso en aulas o entornos con red restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto cuantizado ocupa aproximadamente 0,3 GB en disco; la huella en memoria durante la ejecución en WebGPU es del mismo orden, aunque no se publica una cifra exacta.
- GPU recomendadas: cualquier GPU con soporte de WebGPU (integrada o dedicada) en un navegador moderno; no se documentan requisitos mínimos oficiales.
- Cabe en GPU de consumo: sí, por tamaño; el límite práctico es la disponibilidad de WebGPU en el navegador y la memoria de la GPU integrada o dedicada del equipo.
- Opciones de despliegue: WebLLM en navegador (caso previsto); MLC-LLM en otras plataformas no está documentado para este artefacto. vLLM, llama.cpp, Ollama y TGI no son compatibles directamente con el formato MLC-LLM distribuido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Yerel Excel Formül 0.5B v2 q4f16_1-MLC | 0,5 B | no disponible | Apache 2.0 | MLC-LLM (q4f16_1) | Fórmulas de Excel en turco, en navegador |
| Qwen/Qwen2.5-Coder-0.5B-Instruct | 0,5 B | no disponible en la información proporcionada | Apache 2.0 | safetensors | Modelo base generalista de código e instrucciones |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5 B | no disponible en la información proporcionada | Apache 2.0 | safetensors | Generación de código de mayor capacidad, requiere más recursos |
| Modelos MLC-LLM de propósito general (p. ej. variantes Qwen2.5 compiladas) | variable | variable | según modelo base | MLC-LLM | Ejecución en navegador sin especialización en Excel |

La comparación directa con alternativas especializadas en fórmulas de Excel en turco no está disponible: no se han identificado en la información proporcionada otros modelos con el mismo objetivo y el mismo formato de despliegue.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la consulta; no hay evidencia pública de calidad ni de validación por terceros.
- La model card no documenta el dataset de ajuste, el proceso de entrenamiento ni métricas de evaluación, lo que impide estimar la fiabilidad de las fórmulas generadas.
- Riesgo de alucinación relevante: el modelo puede producir fórmulas sintácticamente plausibles pero incorrectas para la versión de Excel del usuario (por ejemplo, funciones no disponibles en versiones antiguas o separadores de argumentos distintos según la configuración regional).
- Ámbito lingüístico restringido al turco para la tarea principal; el comportamiento en castellano no está documentado.
- Longitud de contexto no especificada; no se recomienda su uso con esquemas de tabla muy extensos sin validación previa.
- Al ser un artefacto compilado para MLC-LLM, no es directamente reutilizable con otras pilas de inferencia sin un proceso de conversión.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de licencia y verificar las obligaciones de atribución.
- En producción, toda fórmula generada debería validarse antes de aplicarse sobre datos reales, dado que un error de referencia puede propagarse silenciosamente por la hoja de cálculo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmtscn/yerel-excel-formul-0.5b-v2-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
- WebLLM: https://github.com/mlc-ai/web-llm
