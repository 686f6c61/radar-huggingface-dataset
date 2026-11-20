# satoshiNakomoroReal/murmur-cleanup

## Resumen

Murmur cleanup es una familia de modelos de lenguaje pequenos disenada especificamente para la etapa de postprocesado de dictado por voz: convertir una transcripcion ASR en bruto en el texto que el usuario realmente queria escribir. El modelo elimina muletillas, corrige autocorrecciones habladas, aplica puntuacion, convierte numeros y comandos dictados a formato escrito y ajusta nombres y terminos a partir del contexto de pantalla. Forma parte de Murmur, una aplicacion de dictado para Android que ejecuta el modelo en el propio dispositivo mediante llama.cpp, sin enviar audio ni texto a ningun servidor.

El proyecto lo mantiene el autor satoshiNakomoroReal y el codigo de la aplicacion esta disponible en GitHub. La propuesta tecnica es interesante porque ataca un problema muy concreto (limpieza de transcripciones) con modelos de 0,87B a 2,27B parametros, un rango que permite inferencia local en movil con cuantizacion Q4_0.

**Estado actual: no hay pesos publicados.** La model card indica que el conjunto de entrenamiento y el pipeline estan listos (3.000 registros de entrenamiento, 300 de desarrollo y 300 de test con el paquete de contexto que ve el telefono), pero los fine-tunes estan planificados sobre tres bases (Qwen3.5 0.8B, Qwen3.5 2B y LFM3 1.7B) y todavia no se han publicado. Hasta entonces, la aplicacion usa modelos base con perfiles de prompt predefinidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (fine-tunes sobre Qwen3.5 0.8B, Qwen3.5 2B y LFM3 1.7B; arquitectura de las bases no detallada en la informacion) |
| Parametros totales | 0,87B / 2,27B / 1,73B segun variante planificada |
| Parametros activos | No aplica (no se indica que sean MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 (planificada para las tres variantes) |
| Idiomas soportados | Ruso e ingles (segun tags de la model card) |
| Licencia | other, `see-base-model-cards` (cada peso mantiene la licencia de su modelo base) |
| Formato de pesos | GGUF (libreria llama.cpp) |

Variantes planificadas segun la model card:

| Modelo | Base | Parametros | Cuantizacion |
|---|---|---|---|
| `murmur-cleanup-qwen3-5-0-8b` | Qwen3.5 0.8B | 0,87B | Q4_0 |
| `murmur-cleanup-qwen3-5-2b` | Qwen3.5 2B | 2,27B | Q4_0 |
| `murmur-cleanup-lfm3-1-7b` | LFM3 1.7B | 1,73B | Q4_0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de los modelos base ni de los fine-tunes. Se sabe que los pesos se distribuyen en formato GGUF para llama.cpp y que llevan metadatos especificos: `murmur.prompt_profile = finetuned.v1`, lo que permite a la aplicacion renderizar exactamente el mismo formato de prompt con el que se entreno el modelo.

El entrenamiento se plantea como un fine-tune supervisado sobre tres modelos base (Qwen3.5 0.8B, Qwen3.5 2B y LFM3 1.7B). El conjunto de datos es sintetico y privado, con 3.000 registros de entrenamiento, 300 de desarrollo y 300 de test. Cada registro contiene texto dictado junto con el paquete de contexto de pantalla que el telefono proporciona al modelo: titulo de ventana, texto visible u lineas OCR, contenido del campo y terminos ordenados por relevancia. El formato de entrada es un unico mensaje de usuario con ese paquete de contexto seguido de la hipotesis ASR; la salida es unicamente el texto limpio, sin comentarios. No se indica si hubo RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Limpieza de transcripciones ASR: eliminacion de muletillas, repeticiones y autocorrecciones habladas.
- Puntuacion y formato: insercion de puntuacion y conversion de numeros hablados a formato escrito.
- Conversion de comandos dictados en texto formateado.
- Correccion de nombres y terminos usando el contexto de pantalla (titulo de ventana, OCR, contenido del campo).
- Adaptacion del tono al contexto de la aplicacion en la que se dicta.
- Procesamiento local en dispositivo mediante llama.cpp, sin envio de datos a servidores.
- Multilingue limitado a ruso e ingles segun los tags de la model card.
- No se documentan capacidades de tool calling, agentes, vision ni audio; el modelo es exclusivamente de postprocesado de texto.

## Casos de uso

- Dictado en movil con privacidad estricta: la aplicacion Murmur ejecuta el modelo en el telefono via llama.cpp, de modo que el audio y el texto no salen del dispositivo. Adecuado para entornos con requisitos de confidencialidad.
- Redaccion de mensajes en aplicaciones de mensajeria: el modelo recibe el contexto de la ventana y el campo activo para ajustar tono y formato, y elimina las muletillas propias del habla espontanea.
- Relleno de formularios por voz: la conversion de numeros hablados y comandos a formato escrito encaja con campos estructurados como fechas, importes o direcciones.
- Correccion de nombres propios y terminos tecnicos: el paquete de contexto incluye terminos ordenados por relevancia y lineas OCR, lo que permite al modelo corregir nombres mal reconocidos por el ASR.
- Notas rapidas y correos dictados: la puntuacion automatica y la eliminacion de autocorrecciones producen texto listo para enviar sin edicion manual.
- Integracion en pipelines de ASR existentes como etapa de postprocesado: al ser un modelo de texto puro que consume la hipotesis ASR y devuelve texto limpio, puede encadenarse detras de cualquier motor de reconocimiento de voz.
- Desarrollo de asistentes de voz para Android: el codigo de la aplicacion esta disponible en GitHub y sirve como referencia de integracion de llama.cpp en movil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que cada fine-tune se comparara contra el modelo base con el prompt estandar sobre los 300 registros de test retenidos, midiendo exact-match y tasa de error de caracteres sobre el texto limpio, fidelidad de entidades y latencia de insercion en el telefono. Los numeros se publicaran junto con los pesos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamano en Q4_0, un modelo de 0,87B ocupa del orden de 0,5-0,7 GB, uno de 1,73B alrededor de 1,0-1,3 GB y uno de 2,27B en torno a 1,3-1,7 GB, sin contar el contexto KV; estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponibles. El objetivo declarado es la inferencia en movil mediante llama.cpp, no en GPU de servidor.
- Cabe en GPU de consumo: si, por tamano; cualquier GPU con 4 GB o mas de VRAM puede alojar las variantes Q4_0, aunque no se han publicado mediciones.
- Opciones de despliegue: llama.cpp (libreria oficial del modelo) y, por compatibilidad de formato GGUF, herramientas derivadas como Ollama; no se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles. La model card anuncia que la latencia de insercion en el telefono se medira y publicara con los pesos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de limpieza de dictado ni datos de rendimiento de las bases (Qwen3.5 0.8B, Qwen3.5 2B, LFM3 1.7B) que permitan una comparativa fundamentada. Ademas, los pesos de Murmur cleanup aun no se han publicado, por lo que no es posible contrastar resultados.

## Limitaciones y advertencias

- No hay pesos publicados: las entradas del catalogo de fine-tunes estan vacias y la aplicacion usa modelos base con prompts predefinidos (`default.v1`, `default.v4`).
- Idiomas limitados a ruso e ingles segun los tags; no se documenta soporte de castellano ni de otras lenguas.
- El conjunto de entrenamiento es sintetico y privado, lo que limita la reproducibilidad y puede introducir un sesgo de dominio hacia los patrones generados.
- Riesgo de alucinacion no evaluado: al reescribir texto con contexto de pantalla, el modelo podria introducir terminos del contexto que el usuario no dicto; la model card contempla medir fidelidad de entidades, pero no hay resultados.
- Licencia condicionada: cada peso hereda la licencia de su modelo base (`see-base-model-cards`), por lo que las restricciones de uso comercial dependen de Qwen3.5 y LFM3 y deben revisarse en sus model cards respectivas.
- El formato de prompt esta acoplado a los metadatos GGUF (`murmur.prompt_profile`); usarlo fuera de la aplicacion requiere replicar exactamente el formato de entrenamiento.
- No se documentan longitudes de contexto ni limites de tamano de entrada, lo que dificulta planificar el despliegue en produccion.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/satoshiNakomoroReal/murmur-cleanup
- Codigo de la aplicacion Murmur: https://github.com/freQuensy23-coder/murmur
