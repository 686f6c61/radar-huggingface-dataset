# IMUGLYHUH/Floppa-12B-Gemma3-Uncensored

## Resumen

Floppa-12B-Gemma3-Uncensored es un modelo multimodal de 12 000 millones de parámetros desarrollado por IMUGLYHUH (con versiones cuantizadas publicadas por Ryex) a partir del modelo base google/gemma-3-12b-it de Google. Su propósito principal es eliminar los guardarraíles de rechazo del modelo original para permitir la traducción sin censura entre japonés e inglés y la descripción de imágenes explícitas, violentas o "subidas de tono", especialmente en el ámbito de la ilustración anime. Está pensado para flujos de trabajo de investigación, traducción y escritura creativa donde el filtrado de contenido resulta indeseable.

El modelo mantiene la arquitectura original de Gemma 3 12B: un transformer denso con codificador de visión SigLIP y atención híbrida (alternancia de atención global y local). Se entrenó mediante QLoRA de 4 bits con Unsloth y se fusionó a bfloat16. La ventana de contexto declarada por terceros es de 33 000 tokens, aunque la model card no especifica este dato. El repositorio pesa 24,4 GB y el modelo está optimizado para su uso con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con codificador de vision SigLIP (atencion hibrida) |
| Parametros totales | 12.187.325.040 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 33 000 tokens (segun Antbase; no confirmado en la model card) |
| Tipos de cuantizacion | bfloat16 (original), GPTQ 4-bit (W4A16) publicado por Ryex |
| Idiomas soportados | Ingles, japones, multilingue (hereda de Gemma 3) |
| Licencia | Gemma Terms of Use (licencia propietaria de Google) |
| Formato de pesos | safetensors (bfloat16), GPTQ (cuantizado) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-12b-it, que emplea una arquitectura de transformer denso con 12 000 millones de parametros, atencion hibrida (capas alternas de atencion global y local) y un codificador de vision SigLIP para entrada multimodal. Floppa-12B se ajusto mediante QLoRA de 4 bits con la libreria Unsloth, fusionando posteriormente los adaptadores al modelo base en precision bfloat16. El objetivo declarado es la modificacion de comportamiento: eliminacion de los guardarrailes de rechazo del modelo base y preservacion de las capacidades de vision.

El conjunto de entrenamiento, denominado "Floppa Mix", contiene aproximadamente 10 500 filas distribuidas en cuatro bloques: un 20 % de texto toxico o sin censura (dialogos explicitos y seguimiento de instrucciones "daninas"), un 20 % de datos de traduccion de alta calidad procedentes de Unbabel/TowerBlocks-v0.2, un 40 % de razonamiento general con mlabonne/FineTome-100k y un 20 % de anclajes de vision (merve/vqav2-small y un dataset personalizado de anime "spicy" basado en SmilingWolf/camie-tagger-vs-wd-tagger-val) para evitar el olvido catastrofico de las capacidades visuales.

## Capacidades

- Descripcion de imagenes sin censura: capaz de describir ilustraciones anime NSFW, violentas o explicitas sin activar rechazos de seguridad.
- Traduccion sin censura (japones <-> ingles): traduce el dialogo tal como esta escrito, incluyendo insultos, profanidad y lenguaje agresivo si el texto fuente lo requiere.
- Contexto multimodal: puede traducir texto dentro de una imagen o describir una escena para proporcionar contexto a la traduccion.
- Razonamiento general: conserva las capacidades de razonamiento logico y conversacional del modelo base gracias al 40 % de datos de razonamiento en el entrenamiento.
- Soporte de tool calling: no se menciona explicitamente en la documentacion; se asume que hereda las capacidades del modelo base, pero no esta confirmado.
- Capacidades multilingues: hereda el soporte multilingue de Gemma 3, aunque el entrenamiento se centro en ingles y japones.

## Casos de uso

- Traduccion de dialogos de manga y anime: el modelo puede traducir dialogos entre japones e ingles sin suavizar el lenguaje, preservando matices culturales, jerga y profanidad. Es adecuado para fansubs o proyectos de traduccion colaborativa donde se requiere fidelidad absoluta al texto original.
- Descripcion de ilustraciones para archivos o catalogos: permite generar descripciones detalladas de imagenes anime explicitas o violentas para su indexacion en bases de datos, sin que el modelo se niegue a procesarlas.
- Escritura creativa sin restricciones: util para autores que necesitan generar dialogos agresivos, escenas violentas o contenido adulto en narrativa, sin filtros que interrumpan el flujo creativo.
- Analisis de contenido para investigacion: investigadores que estudian discurso ofensivo, traduccion de lenguaje vulgar o representacion de violencia en medios pueden usar el modelo para anotar o analizar corpus sin limitaciones de seguridad.
- Asistente de traduccion para localizacion de videojuegos: en proyectos de localizacion de juegos con contenido adulto o violento, el modelo puede ayudar a traducir lineas de dialogo manteniendo el tono original, reduciendo el trabajo manual de los traductores.
- Generacion de subtitulos para contenido audiovisual explicito: puede transcribir y traducir dialogos de series o peliculas con contenido adulto, proporcionando subtitulos sin censura para uso privado o de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otros tests estandar. Tampoco se encontraron evaluaciones comparativas en los resultados de busqueda web. Se recomienda realizar pruebas propias antes de usar el modelo en entornos de produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bfloat16 ocupa aproximadamente 24,4 GB en disco, por lo que se necesitan al menos 24 GB de VRAM para cargarlo sin cuantizar. Con cuantizacion GPTQ 4-bit, el uso de VRAM se reduce a unos 8-10 GB, lo que permite ejecutarlo en GPUs de consumo como la RTX 3090 o RTX 4090.
- GPU recomendadas: para bfloat16, una A100 40GB, A100 80GB o H100. Para GPTQ 4-bit, una RTX 3090 (24 GB), RTX 4090 (24 GB) o superior.
- Compatibilidad con GPUs de consumo: si, con cuantizacion GPTQ 4-bit cabe en GPUs de 24 GB y posiblemente en algunas de 16 GB con optimizaciones adicionales.
- Opciones de despliegue: vLLM (recomendado por el autor), tambien compatible con TGI, llama.cpp y Ollama si se convierte a GGUF (no se ha publicado una version GGUF oficial).
- Latencia y throughput: no se han publicado datos concretos. Con vLLM y cuantizacion GPTQ, se espera una latencia de decodificacion de 20-40 ms por token en una RTX 4090, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Floppa-12B-Gemma3-Uncensored | 12B | 33K (segun terceros) | Gemma ToU | Multimodal sin censura, traduccion JA-EN |
| google/gemma-3-12b-it | 12B | 128K (segun Google) | Gemma ToU | Multimodal instruct con guardarrailes |
| Gemma-3-12B-Abliterated (variante) | 12B | 128K (segun base) | Gemma ToU | Texto sin censura, sin vision |

No se dispone de benchmarks comparativos entre estas opciones. La principal diferencia de Floppa-12B frente al base es la eliminacion de rechazos y el ajuste especifico para traduccion sin censura, a costa de una ventana de contexto reducida (33K frente a los 128K del modelo base, segun datos de terceros). La variante abliterated de Gemma 3 12B se centra solo en texto, mientras que Floppa mantiene capacidades multimodales.

## Limitaciones y advertencias

- Contenido ofensivo: el modelo genera deliberadamente lenguaje explicito, violento o discriminatorio si el contexto lo requiere. No es apto para aplicaciones orientadas al publico general.
- Riesgo de alucinacion: al igual que el modelo base, puede producir informacion factualmente incorrecta, especialmente en tareas de razonamiento complejo o descripcion de imagenes ambiguas.
- Sesgos: el entrenamiento se centro en datos de anime y traduccion JA-EN, por lo que puede mostrar sesgos hacia ese dominio y rendir peor en otros estilos de ilustracion o idiomas.
- Ventana de contexto reducida: los 33K tokens declarados por terceros son significativamente menores que los 128K del modelo base, lo que limita el procesamiento de documentos largos o conversaciones extensas.
- Restricciones de licencia: la licencia Gemma Terms of Use de Google impone restricciones de uso comercial y requiere cumplir sus politicas de uso aceptable, que pueden entrar en conflicto con el proposito "uncensored" del modelo.
- Sin garantias de seguridad: el autor advierte que el modelo puede generar contenido ofensivo o incorrecto y que su uso es bajo discrecion del usuario. No se recomienda para produccion sin una evaluacion exhaustiva.
- Falta de benchmarks: no hay datos publicados de rendimiento, lo que impide comparar objetivamente su calidad con otros modelos.

## Enlaces

- Modelo original en HuggingFace: https://huggingface.co/IMUGLYHUH/Floppa-12B-Gemma3-Uncensored
- Version cuantizada GPTQ (por Ryex): https://huggingface.co/Ryex/Floppa-12B-Gemma3-Uncensored-GPTQ
- README de la version de Ryex: https://huggingface.co/Ryex/Floppa-12B-Gemma3-Uncensored/blob/main/README.md
- Ficha en Antbase: https://antbase.ai/models/floppa-12b-gemma3-uncensored
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/Ryex/Floppa-12B-Gemma3-Uncensored
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
