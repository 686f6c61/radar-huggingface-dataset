# hhxxmm/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje y vision de tipo causal (image-text-to-text) publicado por el usuario hhxxmm en Hugging Face, construido sobre la base arquitectonica de la familia Qwen3.5 y presentado como parte de la generacion Qwen3.8. Se trata de un modelo denso de aproximadamente 27.780 millones de parametros (27,78 B), con un codificador de vision nativo que permite comprender imagenes y videos, y con control flexible del modo de razonamiento. El repositorio ocupa 55,6 GB y se distribuye en formato safetensors compatible con transformers, vLLM, SGLang y TokenSpeed.

La arquitectura combina atencion lineal (Gated DeltaNet) con atencion completa con puertas (Gated Attention) en un layout hibrido de 64 capas, e incorpora Multi-Token Prediction (MTP) entrenado con varios pasos, lo que habilita decodificacion especulativa. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000, lo que lo situa en la gama alta de ventanas de contexto para un modelo denso de este tamano.

Su relevancia radica en que ofrece capacidades de agente autonomo, codigo, trabajo profesional e investigacion en un modelo compacto y desplegable en infraestructura propia, con licencia Apache 2.0. No se dispone de informacion sobre el autor real del entrenamiento ni sobre la composicion del dataset; los datos tecnicos proceden exclusivamente de la model card publicada en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de vision; híbrido Gated DeltaNet + Gated Attention |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos safetensors; la model card no detalla cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Dimension oculta | 5.120 |
| Capas | 64 |
| Layout oculto | 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Cabezas de atencion lineal (DeltaNet) | 48 para V, 16 para QK; dimension de cabeza 128 |
| Cabezas de atencion con puertas | 24 para Q, 4 para KV; dimension de cabeza 256; RoPE dim 64 |
| Dimension intermedia FFN | 17.408 |
| Embedding / salida LM | 248.320 (padded) |
| MTP | Multi-Token Prediction entrenado con multiples pasos |
| Tamano del repositorio | 55,6 GB |

## Arquitectura y entrenamiento

El modelo sigue un diseno hibrido poco habitual: de las 64 capas, el layout se organiza en 16 bloques, cada uno compuesto por tres subcapas de Gated DeltaNet (atencion lineal con estado recurrente) seguidas de una subcapa de Gated Attention (atencion completa con puertas). La Gated DeltaNet emplea 48 cabezas para el valor y 16 para query/key con dimension de cabeza 128, mientras que la Gated Attention usa 24 cabezas de query y 4 de key/value con dimension de cabeza 256 y RoPE de dimension 64. Esta combinacion busca reducir el coste computacional y de memoria en contextos largos manteniendo la capacidad de recuperacion exacta de la atencion completa en capas seleccionadas.

El modelo ha pasado por fases de preentrenamiento y postentrenamiento (segun la model card, "Pre-training & Post-training"), e incorpora Multi-Token Prediction entrenado con varios pasos, tecnica que permite decodificacion especulativa y acelera la generacion. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas concretas de RLHF o DPO. El modo de razonamiento esta activado por defecto, puede desactivarse por peticion, y su profundidad es ajustable mediante el parametro `reasoning_effort`; el contexto de razonamiento de mensajes historicos se conserva mediante `preserve_thinking`.

## Capacidades

- Generacion de texto conversacional multi-turno con ventanas de contexto de hasta 262.144 tokens nativos.
- Razonamiento con modo de pensamiento configurable: activado por defecto, desactivable por peticion, con profundidad ajustable via `reasoning_effort` y retencion de contexto de razonamiento historico via `preserve_thinking`.
- Comprension nativa de imagenes y videos, incluyendo diagramas STEM, documentos y videos de hasta una hora de duracion.
- Capacidades de codigo y tareas de terminal agenticas (se menciona Terminal Bench 2.1 en los benchmarks).
- Ejecucion agentica autonoma: planificacion multi-paso y manejo de retroalimentacion del entorno para completar tareas de extremo a extremo.
- Soporte de tool calling / function calling implicito en el uso agentico descrito en la model card.
- Compatibilidad con harnesses y herramientas de desarrollo populares (se menciona "Downstream Compatibility").
- Capacidades multilingues: no se detalla lista de idiomas en la informacion disponible.

## Casos de uso

- Agente de terminal autonomo: el modelo esta evaluado especificamente en Terminal Bench 2.1, por lo que puede integrarse en entornos de linea de comandos para ejecutar tareas de codigo de varios pasos, interpretar la salida de comandos y corregir errores de forma iterativa.
- Analisis de documentos tecnicos y diagramas STEM: con codificador de vision nativo, puede procesar figuras, esquemas de arquitectura y documentacion escaneada dentro de un mismo contexto largo, util para revision tecnica automatizada.
- Comprension de videos de larga duracion: la model card menciona soporte para videos de hasta una hora, lo que habilita resumenes, extraccion de eventos y respuesta a preguntas sobre grabaciones extensas (reuniones, clases, auditorias).
- Razonamiento profundo configurable en pipelines de investigacion: el ajuste de `reasoning_effort` permite asignar presupuesto de razonamiento distinto por consulta, optimizando coste en tareas simples y profundidad en tareas complejas.
- Asistencia a trabajo profesional con contexto largo: ventana de 262.144 tokens (extensible a 1M) permite cargar bases de codigo, expedientes o corpus documentales completos sin fragmentacion agresiva.
- Despliegue self-hosted en infraestructura propia: al ser un modelo denso de 27 B con licencia Apache 2.0 y pesos safetensors, puede servirse con vLLM, SGLang o TokenSpeed en entornos con requisitos de soberania de datos.
- Integracion en harnesses de desarrollo existentes: la model card destaca compatibilidad con herramientas populares, lo que facilita sustituir backends propietarios en flujos de CI/CD y asistentes de codigo.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero el contenido extraido de la tabla esta truncado en la informacion proporcionada: solo se conserva la cabecera y la primera fila parcial (Agentic terminal coding / Terminal Bench 2.1), sin los valores numericos. Por tanto, no es posible reproducir cifras concretas.

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 55,6 GB solo para pesos, mas memoria para cache KV y activaciones; en la practica se requiere un nodo multi-GPU.
- Cuantizacion: la model card no detalla cuantizaciones publicadas; para reducir huella habria que generar cuantizaciones propias (por ejemplo, GGUF o AWQ) a partir de los pesos safetensors.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, un modelo denso de 27 B en BF16 encaja en configuraciones multi-GPU tipo A100/H100; en consumer GPU requeriria cuantizacion agresiva.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende de la cuantizacion elegida.
- Opciones de despliegue: la model card cita compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B | 27,78 B (denso) | 262.144 nativo, hasta 1M | Apache 2.0 | Vision-lenguaje nativo, MTP, modo thinking configurable |
| Qwen3.6-27B | no disponible | no disponible | no disponible | Referencia comparativa citada en la model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | Referencia comparativa citada en la model card |
| Muse Glimmer-30B | ~30 B (segun nombre) | no disponible | no disponible | Referencia comparativa citada en la model card |
| Opus4.6 Max | no disponible | no disponible | no disponible | Referencia comparativa citada en la model card |

Los datos de rendimiento comparativo no estan disponibles en la informacion extraida, por lo que la comparativa se limita a parametros y contexto cuando constan.

## Limitaciones y advertencias

- El repositorio pertenece al usuario hhxxmm, no a una organizacion oficial de Qwen; la model card referencia servicios y modelos de Qwen, pero no se confirma en la informacion disponible que se trate de una publicacion oficial.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion independiente.
- El contenido de la tabla de benchmarks esta truncado en la informacion disponible, por lo que las afirmaciones de rendimiento no pueden verificarse con cifras.
- No se detalla la composicion del dataset de entrenamiento ni los idiomas soportados, lo que dificulta evaluar sesgos linguisticos y culturales.
- Riesgo de alucinacion inherente a modelos generativos; no se documentan mitigaciones especificas en la informacion disponible.
- El contexto de 1.000.000 tokens se presenta como extension; no se confirma en la informacion disponible si requiere configuracion adicional o tecnicas de interpolacion posicional.
- Licencia Apache 2.0 permite uso comercial, pero al no verificarse la procedencia oficial del entrenamiento conviene auditar el origen de los pesos antes de un despliegue en produccion.
- No se documentan cuantizaciones oficiales; generar cuantizaciones propias puede degradar capacidades de vision o razonamiento sin evaluacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hhxxmm/Qwen3.8-27B
- Qwen Cloud (servicio citado en la model card): https://www.qwencloud.com
- Pagina del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
