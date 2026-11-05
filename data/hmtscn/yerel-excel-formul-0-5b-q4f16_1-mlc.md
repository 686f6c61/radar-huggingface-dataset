# hmtscn/yerel-excel-formul-0.5b-q4f16_1-MLC

## Resumen

Yerel Excel Formül Modeli es un modelo de lenguaje especializado en la generación de fórmulas de Excel a partir de peticiones en turco y de la estructura de una tabla (nombres y tipos de columna). Lo desarrolla el usuario hmtscn y se distribuye como un artefacto compilado para MLC-LLM / WebLLM, lo que permite ejecutarlo íntegramente en el navegador del usuario sin enviar datos a un servidor. El modelo se deriva de Qwen/Qwen2.5-Coder-0.5B-Instruct mediante cuantización q4f16_1, de modo que hereda la arquitectura transformer decoder-only de la familia Qwen2.5 con aproximadamente 0,5 mil millones de parámetros.

La relevancia de esta ficha radica en su enfoque: no es un modelo generalista, sino una adaptación de dominio muy concreta (fórmulas de hoja de cálculo) empaquetada para inferencia local en el navegador. El repositorio pesa unos 0,3 GB y se publica bajo licencia Apache 2.0, lo que facilita su integración en aplicaciones web de productividad. No obstante, la información pública disponible es muy escasa: no se detallan datos de entrenamiento, benchmarks ni el proceso de ajuste, por lo que muchas especificaciones deben marcarse como no disponibles.

El modelo está pensado para un caso de uso acotado y de baja latencia: el usuario describe en turco lo que quiere calcular y el modelo devuelve una única fórmula. Su tamaño reducido y su formato MLC lo hacen apto para equipos de escritorio sin GPU dedicada, aunque con las limitaciones propias de un modelo de 0,5B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-0.5B-Instruct) |
| Parametros totales | 0,5 mil millones (aproximado, según modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16_1 (cuantización de 4 bits con acumulación en fp16, formato MLC) |
| Idiomas soportados | Turco (según la model card); no se detalla cobertura adicional |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC-LLM (artefacto compilado para WebLLM); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-0.5B-Instruct: un transformer decoder-only con atención causal estándar, normalización RMSNorm y embeddings rotatorios (RoPE), entrenado originalmente por Alibaba Qwen para tareas de código. Sobre esa base, el autor ha aplicado un ajuste específico para el dominio de fórmulas de Excel en turco, aunque la model card no documenta el volumen de datos, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se indica el número de tokens de entrenamiento ni la mezcla de datos utilizada.

La innovación técnica principal no está en el entrenamiento, sino en el empaquetado: el modelo se distribuye compilado para MLC-LLM con la cuantización q4f16_1, lo que permite ejecutarlo mediante WebLLM en el navegador aprovechando WebGPU. Esta elección reduce el peso del artefacto a unos 0,3 GB y elimina la necesidad de infraestructura de servidor, a costa de una ventana de contexto y un rendimiento limitados por el hardware del cliente. No se han publicado detalles sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia más allá de la cuantización.

## Capacidades

- Generación de fórmulas de Excel a partir de una descripción en turco y de la estructura de la tabla (nombres y tipos de columna).
- Comprensión de peticiones en lenguaje natural en turco dentro del dominio de hoja de cálculo.
- Salida de una única fórmula, lo que simplifica el postprocesado y la inserción directa en la celda.
- Ejecución local en el navegador mediante WebLLM y WebGPU, sin llamadas a API externas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: solo se declara turco; el resto de idiomas no está disponible en la información proporcionada.

## Casos de uso

- Asistente de fórmulas integrado en una hoja de cálculo web: el usuario describe en turco qué quiere calcular y el modelo devuelve la fórmula lista para pegar; al ejecutarse en el navegador con WebLLM, los datos de la tabla no salen del equipo.
- Generación de fórmulas en aplicaciones de contabilidad y finanzas: con los nombres de columna de un libro de ingresos y gastos, el modelo produce fórmulas de suma condicional, búsquedas o cálculos de margen sin requerir conocimientos de sintaxis.
- Herramienta educativa para aprender Excel: el alumnado escribe su intención en turco y recibe la fórmula correspondiente, lo que sirve como ejemplo práctico de la sintaxis.
- Automatización de plantillas internas: en un portal corporativo se puede ofrecer un campo de texto donde el empleado describe el cálculo y el modelo genera la fórmula para una plantilla predefinida, reduciendo la dependencia del equipo de soporte.
- Procesamiento de datos tabulares en el cliente: al recibir únicamente nombres y tipos de columna, el modelo puede sugerir fórmulas de limpieza o validación (por ejemplo, comprobar formatos de fecha) sin exponer los datos reales.
- Prototipado rápido de funcionalidades de hoja de cálculo: un equipo de desarrollo puede integrar el artefacto MLC en una demo web para validar la experiencia de usuario antes de invertir en un modelo mayor o en una API en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de una cuantización q4f16_1 de un modelo de 0,5B, el artefacto ocupa aproximadamente 0,3 GB, por lo que la huella de memoria es muy reducida; no se dispone de una cifra oficial de VRAM.
- GPU recomendadas: cualquier GPU con soporte de WebGPU (por ejemplo, integradas recientes de Intel, AMD o Apple Silicon) puede ejecutar el modelo en el navegador; para servidor no se documentan requisitos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo con WebGPU; no se especifican modelos concretos.
- Opciones de despliegue: WebLLM en el navegador (formato MLC-LLM); no se distribuyen pesos en GGUF ni safetensors en este repositorio, por lo que llama.cpp, Ollama o vLLM no son aplicables directamente sin convertir el artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Yerel Excel Formül Modeli (este) | ~0,5B | no disponible | Apache 2.0 | MLC-LLM | Fórmulas de Excel en turco, inferencia en navegador |
| Qwen2.5-Coder-0.5B-Instruct | ~0,5B | no disponible en la información proporcionada | Apache 2.0 | safetensors, GGUF (según distribución oficial) | Código generalista, multilingüe |
| Qwen2.5-Coder-1.5B-Instruct | ~1,5B | no disponible en la información proporcionada | Apache 2.0 | safetensors, GGUF | Código generalista, mayor capacidad |
| Modelos especializados en Excel de mayor tamaño | no disponible | no disponible | variable | variable | Generación de fórmulas, normalmente vía API |

La comparación directa es limitada porque no se han publicado métricas de rendimiento para este modelo. Frente a su modelo base, la diferencia principal es la especialización en fórmulas de Excel en turco y el empaquetado para WebLLM; frente a alternativas de mayor tamaño, pierde capacidad general pero gana en privacidad y despliegue sin servidor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de un modelo entrenado principalmente con datos de código, puede reflejar sesgos de ese corpus.
- Riesgo de alucinación: alto en un modelo de 0,5B; puede generar fórmulas sintácticamente plausibles pero incorrectas o referencias a columnas inexistentes.
- Limitaciones de contexto e idioma: solo se declara turco y no se especifica la longitud de contexto; el rendimiento fuera del dominio de fórmulas de Excel probablemente sea pobre.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-Coder-0.5B-Instruct y citar la procedencia.
- Caveats para producción: el repositorio no incluye datos de evaluación, el número de descargas es cero y la información de entrenamiento es inexistente; se recomienda validar las fórmulas generadas antes de usarlas en entornos reales.
- Dependencia de WebGPU: el despliegue en navegador requiere un navegador y hardware compatibles, lo que limita la cobertura de usuarios.

## Enlaces

- HuggingFace: https://huggingface.co/hmtscn/yerel-excel-formul-0.5b-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
- WebLLM: https://github.com/mlc-ai/web-llm
