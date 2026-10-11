# florianvoss/Gemma-4-E4B-it-GPTQ-a16w4

## Resumen

Gemma-4-E4B-it-GPTQ-a16w4 es un paquete de ejecución compilado para el acelerador SiMa Modalix, publicado por el usuario florianvoss dentro de la colección de validación Neat 0.6.0. No se trata de un checkpoint cargable con Transformers, sino de un artefacto de despliegue que contiene 230 ejecutables MLA, la configuración de runtime, el tokenizador, los embeddings y las escalas de cuantización, junto con un fichero compilation.json. Se deriva de simaai/Gemma-4-E4B-it-GPTQ-Safetensors, que a su vez procede de google/gemma-4-E4B-it, y mantiene la tarea de pipeline image-text-to-text, es decir, generación de texto condicionada por imagen.

El interés del paquete es de perfil muy concreto: permite ejecutar un modelo de visión y lenguaje Gemma 4 en hardware Modalix mediante el runtime LLiMa, con pesos de lenguaje precuantizados en GPTQ INT4 simétrico (grupo 256, act-order estático), pesos de visión en RTN INT8 simétrico por canal de salida, activaciones BF16 y embeddings y caché KV en INT8. La resolución de imagen de entrada es de 480 × 480 y la longitud de contexto declarada es de 4096 tokens, con una ventana de atención deslizante de 512 tokens.

Es relevante ahora porque incorpora el grafo de caché deslizante agrupada corregido de LLiMa (PR #295) y porque documenta con detalle el proceso de compilación y validación (230 componentes reconstruidos, división de MLP forzada en los 41 componentes de lenguaje N128, comprobaciones de sumas de verificación de los ELF). Como contrapartida, el propio autor indica que todavía no se han ejecutado pruebas de generación de texto e imagen ni comparativas de prompts largos sobre Modalix con este paquete.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje de la familia Gemma 4 (pipeline image-text-to-text); detalle de capas, atención y encoder de visión no disponible. Se conoce una ventana de atención deslizante de 512 tokens |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 4096 tokens, con ventana de atención deslizante de 512 tokens |
| Tipos de cuantizacion | Lenguaje: GPTQ simétrico INT4, grupo 256, act-order estático. Visión: RTN simétrico INT8 por canal de salida. Activaciones: BF16. Embeddings y cache KV: INT8 |
| Idiomas soportados | no disponible |
| Licencia | gemma (se aplican los términos de licencia Gemma del modelo fuente) |
| Formato de pesos | No es un checkpoint safetensors cargable por Transformers. Paquete de runtime compilado: devkit/ (configuración de runtime, tokenizador, embeddings y escalas), elf_files/ (230 ejecutables MLA, incluido el grafo corregido de caché deslizante) y compilation.json. Tamaño del repositorio: 9,1 GB |

Otras especificaciones declaradas: tamaño de grupo de prefill 128; resolución de imagen 480 × 480; compartición de filtros activada en los componentes de lenguaje y desactivada en visión; Model SDK 3.0.0; compilación con la API nativa ModelGraph; revisión de código fuente LLiMa `d1b9bc85a2efde593d06667ac4d919dd410662fc`.

## Arquitectura y entrenamiento

La información disponible describe el proceso de compilación, no el entrenamiento. El modelo subyacente es google/gemma-4-E4B-it, un modelo Gemma 4 con la variante -it (ajustado para instrucciones) y con nomenclatura E4B, y el paquete se ha compilado desde simaai/Gemma-4-E4B-it-GPTQ-Safetensors. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF, DPO u otras técnicas de alineamiento. Tampoco se detalla si el modelo base emplea mezcla de expertos, atención lineal u otro mecanismo distinto de la atención estándar.

Sí hay información técnica precisa sobre la compilación. Los pesos de lenguaje se precompilaron en GPTQ simétrico INT4 con grupo de tamaño 256 y act-order estático; los de visión, en RTN simétrico INT8 por canal de salida. Las activaciones se mantienen en BF16, mientras que los embeddings y la caché KV usan INT8. La compilación se hizo con la API nativa ModelGraph y reconstruyó los 230 componentes, forzando la división de MLP en los 41 componentes de lenguaje N128 (las etapas N1 no se modificaron). El paquete usa el grafo de caché deslizante agrupada de LLiMa PR #295: para la ventana de atención de 512 tokens y el prefill n128, emplea las posiciones lógicas de KV 511 y 639 con una máscara estática que da a cada fila de consulta su ventana completa, sin necesidad de una máscara adicional en tiempo de ejecución.

## Capacidades

- Generación de texto condicionada por imagen, según la etiqueta de pipeline image-text-to-text.
- Procesamiento de imágenes a 480 × 480 píxeles como entrada del componente de visión.
- Generación de texto multi-turno dentro de un contexto de 4096 tokens, con ventana de atención deslizante de 512 tokens.
- Ejecución en hardware SiMa Modalix a través del runtime LLiMa.
- Capacidades de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Cobertura multilingüe: no disponible.
- Modo de razonamiento explícito (thinking mode), audio u otras modalidades adicionales: no disponible.

## Casos de uso

- Inferencia de visión y lenguaje en el borde: el paquete está compilado específicamente para Modalix, de modo que permite ejecutar un modelo image-text-to-text sin depender de GPUs ni de conectividad a la nube, útil en entornos con requisitos de soberanía de datos.
- Inspección visual en líneas de fabricación: con imágenes de 480 × 480 y respuesta de texto, se puede integrar en una estación Modalix para describir o clasificar piezas y emitir informes en lenguaje natural dentro de la propia planta.
- Asistencia documental en puesto de trabajo: con 4096 tokens de contexto se pueden procesar fichas, etiquetas o capturas y generar resúmenes o respuestas, siempre que el despliegue se haga sobre el runtime LLiMa compatible.
- Análisis de imágenes en comercio minorista: conteo, descripción de escenas o verificación de lineales a partir de capturas de 480 × 480 ejecutadas localmente en el dispositivo Modalix.
- Robótica y sistemas embarcados: al no requerir GPU de centro de datos, el paquete encaja en plataformas con presupuesto térmico y energético reducido que necesiten interacción texto-imagen de baja complejidad.
- Validación y puesta a punto de la cadena de compilación Neat/LLiMa: el repositorio sirve como referencia reproducible para equipos que compilan modelos Gemma 4 con GPTQ INT4 y necesiten comparar grafos, compartición de filtros o el comportamiento del prefill con caché deslizante.
- Escenarios con caché KV en INT8 y activaciones BF16: útil cuando se busca reducir la huella de memoria del estado de decodificación en prompts largos dentro del límite de hardware Modalix.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las pruebas de generación de texto e imagen sobre Modalix y las comparativas de prompts largos (antes y después de la corrección del grafo de caché deslizante) todavía no se han ejecutado para este paquete.

Sí se declaran comprobaciones de compilación: finalización con código de salida 0, validación en simulador de las 41 sustituciones N128 posteriores y verificación por sumas de comprobación de que se conserva la compartición de filtros N1/N128 existente. El despliegue verificó los 230 ficheros ELF y los recursos de runtime.

## Requisitos de hardware

- Hardware objetivo: acelerador SiMa Modalix. No es un paquete para GPU de propósito general.
- VRAM estimada: no aplica / no disponible. El modelo no se distribuye como pesos safetensors para cargar en GPU; el repositorio ocupa 9,1 GB e incluye ejecutables ELF y recursos de runtime.
- GPU recomendadas: no disponible (ninguna; el despliegue previsto es sobre Modalix).
- Compatibilidad con GPU de consumo: no. No se puede cargar en una RTX 4090 ni en tarjetas similares mediante las herramientas habituales.
- Opciones de despliegue: runtime LLiMa con la corrección de prefill deslizante incluida (por ejemplo, una revisión que contenga LLiMa PR #295), usando el comando `llima run ./Gemma-4-E4B-it-GPTQ-a16w4`. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones de rendimiento para este paquete.
- SDK: Model SDK 3.0.0 durante la compilación.

## Comparativa con modelos similares

| Modelo | Relación | Formato | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| florianvoss/Gemma-4-E4B-it-GPTQ-a16w4 | Paquete compilado para Modalix (objeto de esta ficha) | ELF/MLA con devkit y compilation.json | GPTQ INT4 (lenguaje), RTN INT8 (vision), BF16 en activaciones, INT8 en embeddings y cache KV | 4096 tokens | gemma | 0 descargas, 0 likes; requiere runtime LLiMa |
| simaai/Gemma-4-E4B-it-GPTQ-Safetensors | Modelo base directo del que se compila este paquete | Safetensors (segun el nombre del repositorio) | GPTQ (detalle no disponible en la informacion proporcionada) | no disponible | no disponible en la informacion proporcionada | Repositorio de origen de la compilacion |
| google/gemma-4-E4B-it | Modelo original ajustado para instrucciones | no disponible | Pesos sin cuantizar (no confirmado) | no disponible | gemma | Modelo público de Google |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- No es un checkpoint cargable con Transformers: el autor lo describe como un paquete de runtime desempaquetado, no como un safetensors compatible. Cargarlo en frameworks estándar no funcionará.
- Dependencia estricta del runtime: para obtener el comportamiento corregido de prefill deslizante hay que usar una versión de LLiMa que contenga la misma corrección, correspondiente a LLiMa PR #295.
- Rendimiento no verificado: la generación de texto e imagen en Modalix y las comparativas con prompts largos no se han ejecutado todavía. No hay benchmarks ni métricas de latencia o throughput.
- Contexto limitado: 4096 tokens, con ventana de atención deslizante de 512 tokens, lo que restringe casos de uso con documentos o conversaciones largas.
- Resolución de imagen fija: 480 × 480, insuficiente para tareas que requieran detalle fino, texto pequeño u objetos lejanos.
- Sesgos conocidos: no disponible. No hay documentación sobre sesgos en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos; no se han publicado evaluaciones de fiabilidad para este paquete concreto.
- Idiomas soportados: no disponible, por lo que no se puede garantizar cobertura multilingüe ni un comportamiento adecuado en castellano.
- Licencia: se aplican los términos de la licencia Gemma del modelo fuente. Es necesario revisar sus condiciones y restricciones de uso antes de un despliegue comercial.
- Madurez y soporte: repositorio con 0 descargas y 0 likes, publicado por un autor individual, sin evidencia de mantenimiento continuado.
- Trazabilidad parcial: se conoce la revisión de LLiMa y el Model SDK, pero no los detalles de entrenamiento ni los datos del modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/florianvoss/Gemma-4-E4B-it-GPTQ-a16w4
- Modelo base en HuggingFace: https://huggingface.co/simaai/Gemma-4-E4B-it-GPTQ-Safetensors
- Modelo original: https://huggingface.co/google/gemma-4-E4B-it
- Pull request de LLiMa con la corrección de prefill deslizante: https://github.com/sima-neat/llima/pull/295
- Repositorio LLiMa: https://github.com/sima-neat/llima
