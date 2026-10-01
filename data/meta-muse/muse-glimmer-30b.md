# Meta-muse/Muse-Glimmer-30B

## Resumen

Muse Glimmer-30B es un modelo de lenguaje causal denso de 29.776.626.688 parámetros (unos 29,6 B, incluyendo el encoder de visión) desarrollado por Meta Superintelligence Lab y publicado bajo licencia Apache 2.0. Incorpora un encoder de percepción de aproximadamente 1,8 B de parámetros (ViT-G/14) que le permite aceptar entradas intercaladas de texto e imagen, y según su model card está destilado a partir de Muse Spark.

El modelo está diseñado específicamente para tareas agénticas autónomas en hardware de consumo: razonamiento multi-paso, uso fiable de herramientas con esquemas precisos, recuperación ante fallos de llamadas a herramientas y comprensión multimodal de capturas, gráficos y documentos. Su ventana de contexto declarada es de 131.072 tokens o más, con un corte de conocimiento del 4 de enero de 2026.

Su relevancia radica en la optimización para despliegue local: mediante cuantización a 4 bits el modelo de lenguaje baja de 20 GB, lo que permite ejecutarlo junto con la caché KV, el encoder de percepción y un modelo auxiliar de decodificación especulativa dentro de un presupuesto de 24 GB o 32 GB de VRAM, sin infraestructura en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformador causal denso con encoder de percepción multimodal |
| Parámetros totales | 29.776.626.688 (~29,6 B, incluido el encoder de visión de ~1,8 B) |
| Longitud de contexto | 131.072 tokens o superior |
| Tipos de cuantización | K-Quant-Dynamic (~4 bits), K-Quant-17GB (~4 bits) y precisión completa |
| Idiomas soportados | Más de 100 idiomas en los datos de entrenamiento (no se detalla la lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Dimensión oculta | 6.656 |
| Capas | 52 |
| Patrón de atención | [Local, Local, Local, Global] repetido, ventana deslizante de 2.048 |
| Cabezas de atención (Q / KV) | 32 / 2 (GQA con ratio 16:1), dimensión de cabeza 128 |
| FFN | SwiGLU, dimensión intermedia 19.968 |
| Codificación posicional | RoPE (θ = 500.000), solo en capas locales |
| Encoder de percepción | ViT-G/14 de ~1,8 B, 50 capas, ancho 1.536, parches de 14 |
| Vocabulario | 202.048 (200.000 tokens BPE + 2.048 especiales) |
| Tokens visuales máximos por imagen | 4.096 |
| Modalidades | Entrada: texto + imagen; salida: texto |
| Fecha de corte de conocimiento | 4 de enero de 2026 |
| Tamaño del repositorio | 59,6 GB |

## Arquitectura y entrenamiento

Se trata de un transformador causal denso de 52 capas con dimensión oculta 6.656 y FFN de tipo SwiGLU. La atención combina un patrón repetido de tres capas locales seguidas de una global, con ventana deslizante de 2.048 tokens, atención con compuertas (gated attention) y GQA con ratio 16:1 (32 cabezas de consulta frente a 2 de clave/valor). La codificación posicional RoPE con θ = 500.000 se aplica únicamente en las capas locales. El componente multimodal es un encoder ViT-G/14 de 50 capas y ancho 1.536 con parches de 14, que admite hasta 4.096 tokens visuales por imagen.

La model card describe los datos de entrenamiento como contenido multimodal procedente de fuentes públicas, datos cedidos por terceros e información de productos y servicios de Meta, curado y enriquecido por redes de proveedores externos y personal de Meta. No se especifica el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO. Las innovaciones declaradas son dos: la cuantización agresiva a ~4 bits validada con una degradación media del 0,2% (K-Quant-Dynamic) y del 1,0% (K-Quant-17GB) sobre 15 benchmarks, y la decodificación especulativa mediante un drafter DFlash basado en difusión de bloques que predice bloques de 16 tokens en una sola pasada. El drafter tiene 5 capas, atención de ventana deslizante de 2.048 en todas ellas, 32 cabezas de consulta y 8 de clave/valor, y toma características ocultas de las capas 1, 13, 25, 37 y 49 del modelo principal.

## Capacidades

- Generación de texto y razonamiento encadenado sobre horizontes largos, manteniendo planes coherentes en flujos de trabajo extensos.
- Comprensión multimodal de entrada: interpreta capturas de pantalla, gráficos y documentos junto con la conversación.
- Uso de herramientas y function calling con esquemas precisos a lo largo de flujos extendidos.
- Ejecución agéntica de extremo a extremo: resolución de tareas completas dentro de scaffolds, escritura y depuración de código.
- Recuperación ante fallos: si una llamada a herramienta falla o devuelve un resultado inesperado, diagnostica el error y reintenta en lugar de detenerse.
- Esfuerzo controlable: admite distintos niveles de razonamiento para equilibrar calidad y velocidad.
- Compatibilidad con patrones de orquestación como OpenClaw y Hermes Agent.
- Capacidad multilingüe declarada sobre más de 100 idiomas.
- Salida exclusivamente de texto (no genera imágenes).

## Casos de uso

- Agentes locales con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo con cuantización de ~4 bits en 24-32 GB de VRAM, permite desplegar agentes que procesan documentos internos sin enviar datos a la nube.
- Automatización de mantenimiento de software: la model card cita SWE-Bench entre sus evaluaciones, por lo que encaja en flujos de escritura y depuración de código dentro de scaffolds, integrables en pipelines de CI/CD con verificación de resultados.
- Análisis de documentación técnica y capturas: gracias al encoder de percepción y a los 4.096 tokens visuales por imagen, puede extraer información de diagramas, gráficos de monitorización o interfaces de usuario y razonar sobre ellos.
- Asistentes de atención al cliente multi-turno: los 131.072 tokens de contexto permiten mantener historiales largos de conversación y llamar a herramientas de consulta de pedidos o sistemas de ticketing con esquemas definidos.
- Orquestación de herramientas empresariales vía MCP: la evaluación declarada en MCP-Atlas apunta a su uso como motor de agentes que invocan servidores MCP encadenando varias herramientas con recuperación de errores.
- Búsqueda profunda y síntesis de información: la evaluación en DeepSearch QA sugiere su uso en agentes de investigación que navegan, extraen y sintetizan información de múltiples fuentes antes de responder.
- Copiloto de operaciones sobre registros: con contexto largo puede ingerir grandes volúmenes de logs o trazas y detectar patrones, proponiendo acciones concretas mediante llamadas a herramientas.
- Procesamiento por lotes multimodal en estación de trabajo: clasificación y resumen de lotes de documentos escaneados o capturas, ejecutado en una única GPU de 32 GB con el modelo cuantizado.

## Benchmarks y rendimiento

La model card indica que el modelo se entrena y evalúa en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no publica cifras concretas de ninguno de ellos en la información disponible.

| Benchmark | Resultado |
|---|---|
| DeepSearch QA | No disponible (citado como benchmark de evaluación, sin cifras) |
| MCP-Atlas | No disponible (citado como benchmark de evaluación, sin cifras) |
| τ3-Bench | No disponible (citado como benchmark de evaluación, sin cifras) |
| SWE-Bench | No disponible (citado como benchmark de evaluación, sin cifras) |

Sí se publican datos de velocidad con batch size 1 y decodificación greedy:

| GPU | Sin especulación (tok/s) | Con especulación DFlash (tok/s) | Aceleración |
|---|---|---|---|
| Nvidia RTX 5090 | 74,9 | 233,4 | 3,1x |
| Apple M4 Max | 23,7 | 37,8 | 1,5x |
| Apple M5 Max | 26,6 | 50,2 | 1,8x |

## Requisitos de hardware

- Precisión completa: 64 GB de VRAM objetivo.
- K-Quant-Dynamic (~4 bits): 32 GB de VRAM, con una degradación media declarada del 0,2% sobre 15 benchmarks.
- K-Quant-17GB (~4 bits): 24 GB de VRAM, con una degradación media declarada del 1,0% sobre 15 benchmarks; el modelo de lenguaje queda por debajo de 20 GB.
- GPU de consumo validadas: Nvidia RTX 5090 (32 GB), con 233,4 tok/s usando el drafter DFlash cuantizado.
- Apple Silicon validado: MacBook con M4 Max (37,8 tok/s con especulación) y M5 Max (50,2 tok/s con especulación).
- El presupuesto de 24 GB debe cubrir simultáneamente los pesos cuantizados, la caché KV, el encoder de percepción y el drafter de decodificación especulativa.
- El drafter DFlash se distribuye también en versiones cuantizadas para reducir su huella de memoria.
- Opciones de despliegue: el repositorio declara la librería transformers y la etiqueta endpoints_compatible. La model card no menciona integraciones explícitas con vLLM, llama.cpp, Ollama o TGI; las denominaciones "K-Quant" sugieren cuantizaciones de estilo GGUF, pero esto no se confirma en la información disponible.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con otros modelos, y en la información proporcionada no hay datos verificables de alternativas comparables en parámetros, contexto, rendimiento o licencia, por lo que no se presenta tabla comparativa para no introducir cifras no contrastadas.

## Limitaciones y advertencias

- Sesgos conocidos: la model card no documenta una evaluación de sesgos ni de seguridad, por lo que se desconoce el comportamiento en dominios sensibles.
- Riesgo de alucinación: inherente a los modelos generativos; la model card no publica tasas de veracidad ni mecanismos de mitigación más allá de la recuperación ante fallos de herramientas.
- Idiomas: se declara entrenamiento en más de 100 idiomas, pero no se detalla el reparto por idioma ni la calidad relativa, por lo que el rendimiento en castellano no está cuantificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con la obligación habitual de conservar avisos de licencia y copyright.
- Fechas no verificables: la model card declara fecha de publicación en agosto de 2026 y corte de conocimiento el 4 de enero de 2026, posteriores a la fecha de creación del repositorio en HuggingFace (1 de octubre de 2026). Estas fechas no se han podido verificar de forma independiente con la información disponible.
- Procedencia del repositorio: el modelo se publica bajo el usuario "Meta-muse", que en la información disponible no figura verificado como organización oficial de Meta, aunque la model card atribuye la autoría a Meta Superintelligence Lab. Conviene confirmar la procedencia antes de usarlo en producción.
- Adopción nula: el repositorio registra 0 descargas y 0 "likes", sin evidencia externa de uso ni de validación por terceros.
- Composición de datos opaca: no se detalla el número de tokens de entrenamiento, la proporción de datos sintéticos ni si hubo alineación con RLHF o DPO.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Meta-muse/Muse-Glimmer-30B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper del encoder de percepción (arxiv:2504.13181): https://arxiv.org/abs/2504.13181
- Paper de DFlash (arxiv:2602.06036): https://arxiv.org/abs/2602.06036
- Enlaces genéricos devueltos por la búsqueda web, sin relación específica con este modelo: https://www.meta.com/about/, https://business.facebook.com/, https://www.meta.ai/, https://www.meta.com/account/, https://www.facebook.com/Meta/
