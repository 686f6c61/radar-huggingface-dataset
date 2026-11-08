# McG-221/Room-Tone-31B-mlx-8Bit

## Resumen

Room-Tone-31B-mlx-8Bit es una conversión al formato MLX, en precisión de 8 bits, del modelo ReadyArt/Room-Tone-31B. La ha publicado el usuario McG-221 y está pensada para su ejecución en hardware Apple Silicon mediante la librería mlx-lm (versión 0.31.2 usada en la conversión). No se trata de un modelo entrenado desde cero, sino de una redistribución cuantizada de un fine-tune orientado a roleplay conversacional y contenido para adultos.

El modelo base pertenece a la familia Gemma 4 (según el tag `gemma4`) y cuenta con 30.697.345.280 parámetros reales según los pesos en safetensors, es decir, aproximadamente 31B. El repositorio ocupa 32,6 GB, lo que es coherente con una cuantización de 8 bits de un modelo de ese tamaño. Está etiquetado como `text-generation` y declara únicamente el idioma inglés.

Su relevancia es acotada: interesa a quienes quieran ejecutar localmente en un Mac un modelo de rol con múltiples personajes y temática adulta, sin depender de servicios en la nube. La licencia declarada es Apache 2.0, aunque el contenido está marcado como `not-for-all-audiences` y `nsfw`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, según tag `gemma4`); detalles internos no disponibles |
| Parametros totales | 30.697.345.280 (~31B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); otras cuantizaciones del base no disponibles |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx`, `safetensors`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá del tag `gemma4`, que sitúa el modelo base en la familia Gemma 4 de Google. Se trata, por tanto, de un transformer decoder-only, aunque no se especifican número de capas, dimensiones ocultas, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa.

Tampoco se documentan los datos de entrenamiento del modelo base ReadyArt/Room-Tone-31B: no hay número de tokens, composición del dataset, ni si se aplicaron fases de RLHF, DPO o fine-tuning supervisado. Lo único conocido es la relación de fine-tune respecto al base y el propósito declarado (roleplay, multi-personaje, contenido adulto). Esta ficha es una conversión MLX a 8 bits realizada con mlx-lm 0.31.2, sin entrenamiento adicional.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogos de rol.
- Soporte declarado para escenarios multi-personaje y ensemble (varios personajes en una misma conversación).
- Contenido para adultos y temática madura (tags `nsfw`, `adult-content`, `mature`).
- Conversación multi-turno con mantenimiento de contexto (longitud de contexto no especificada).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito.
- Multilingüismo: solo inglés declarado.

## Casos de uso

- Roleplay conversacional local en Mac: el modelo puede cargarse con mlx-lm y ejecutarse íntegramente en Apple Silicon, lo que permite mantener conversaciones de rol sin enviar datos a terceros.
- Simulación de entrevistas o diálogos de práctica: al estar afinado para conversación, puede encarnar un personaje concreto y responder de forma consistente en inglés a lo largo de varios turnos.
- Escritura creativa asistida para adultos: útil para generar narrativa interactiva o ficción con varios personajes, aprovechando el soporte de ensemble.
- Prototipado de chatbots de personaje: sirve como base para experimentar con plantillas de chat y personalidades antes de invertir en modelos mayores o en servicios gestionados.
- Investigación sobre fine-tunes de rol: permite comparar el comportamiento de un fine-tune de 31B frente a su base sin necesidad de GPU dedicada, usando un portátil o Mac de sobremesa.
- Evaluación de cuantización 8-bit en MLX: útil para medir la pérdida de calidad frente a los pesos originales en tareas de diálogo, dado que el repo incluye solo la versión 8-bit.
- Generación de guiones de conversación para pruebas: puede producir diálogos de ejemplo para validar pipelines de moderación o de evaluación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM equivalente: el repo pesa 32,6 GB, por lo que se necesita al menos esa cantidad de memoria unificada para cargar los pesos en 8 bits.
- Memoria recomendada: 48 GB o más de memoria unificada para dejar margen a la caché KV y al contexto; 64 GB o 96 GB es lo aconsejable para contextos largos.
- GPU recomendadas: no aplica de forma nativa, ya que el formato es MLX y está pensado para Apple Silicon (series M1/M2/M3/M4, especialmente Max y Ultra). Para CUDA habría que usar los pesos originales del modelo base en otro formato.
- Cabe en GPU de consumo: no en tarjetas de 24 GB en 8 bits; sí en configuraciones Apple con memoria unificada alta.
- Opciones de despliegue: mlx-lm (soporte oficial del repo); otras alternativas como vLLM, llama.cpp, Ollama o TGI requerirían conversión a otro formato y no están documentadas para esta versión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| McG-221/Room-Tone-31B-mlx-8Bit | ~31B | no disponible | MLX safetensors 8-bit | Apache 2.0 | Conversión MLX de un fine-tune de rol |
| ReadyArt/Room-Tone-31B | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva esta conversión |
| McG-221/Split-31B-mlx-8Bit | no disponible | no disponible | MLX 8-bit | no disponible | Otra conversión MLX del mismo autor, sin datos de rendimiento |
| McG-221/XORTRON-NXTXPRT10PRO-31B-mlx-8Bit | no disponible | no disponible | MLX 8-bit | Apache 2.0 | Conversión MLX de otro fine-tune de 31B, orientada a contenido sin censura |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Contenido explícito para adultos: el modelo está etiquetado como `nsfw` y `not-for-all-audiences`; no es apto para productos dirigidos al público general sin filtros adicionales.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación: no hay evaluaciones publicadas que cuantifiquen su fiabilidad factual; en tareas de rol el riesgo de inventar datos es alto por diseño.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de un fine-tune de rol sin información de entrenamiento, los sesgos del base y del dataset de ajuste son desconocidos.
- Contexto: la longitud de contexto no está especificada, lo que dificulta planificar conversaciones largas o documentos extensos.
- Licencia: se declara Apache 2.0, pero el modelo base y sus datos de entrenamiento no están documentados; conviene verificar la cadena de licencias antes de un uso comercial.
- Formato: al ser MLX 8-bit, no es directamente utilizable en CUDA ni en la mayoría de servicios de inferencia; limita el despliegue a entornos Apple.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin validación comunitaria conocida.

## Enlaces

- Hugging Face: https://huggingface.co/McG-221/Room-Tone-31B-mlx-8Bit
- Modelo base: https://huggingface.co/ReadyArt/Room-Tone-31B
- Otra conversión del mismo autor: https://huggingface.co/McG-221/Split-31B-mlx-8Bit
- Otra conversión del mismo autor: https://huggingface.co/McG-221/XORTRON-NXTXPRT10PRO-31B-mlx-8Bit
