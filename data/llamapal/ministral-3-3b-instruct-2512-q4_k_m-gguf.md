# LlamaPal/Ministral-3-3B-Instruct-2512-Q4_K_M-GGUF

## Resumen

Ministral-3-3B-Instruct-2512-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo Ministral 3 3B Instruct (version 2512) desarrollado por Mistral. Esta ficha concreta, publicada por el usuario LlamaPal, es un espejo sin modificaciones del archivo generado por Unsloth para llama.cpp, pensado para ejecutar el modelo en dispositivos Android mediante la aplicación LlamaPal. El modelo base es un transformer denso de 3.429.006.336 parámetros (aproximadamente 3,4 mil millones) con una ventana de contexto de 256K tokens, lo que lo sitúa como una de las opciones compactas con mayor memoria de contexto de su categoría.

El problema que resuelve esta publicación es la distribución de un archivo listo para inferencia local en móviles: al tratarse de un GGUF cuantizado a Q4_K_M (2,1 GB), cabe en la memoria de un teléfono de gama media-alta y permite conversaciones offline sin enviar datos a la nube. La relevancia actual radica en la combinación de contexto largo (256K), licencia Apache 2.0 y un tamaño que hace viable la inferencia on-device.

Es importante subrayar que este repositorio no aporta pesos nuevos ni entrenamiento propio: es una copia byte a byte del GGUF de Unsloth, con el mismo hash SHA-256. Toda la autoría técnica del modelo corresponde a Mistral, y la del archivo cuantizado a Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Ministral 3 3B Instruct de Mistral); no se detalla en la informacion disponible la variante exacta de atencion |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 256K tokens (256.000) segun la model card |
| Tipos de cuantizacion | Q4_K_M (archivo publicado); el repo base de Unsloth ofrece otras variantes GGUF no detalladas aqui |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); tamano del archivo 2,1 GB |
| Hash SHA-256 | fd46fc371ff0509bfa8657ac956b7de8534d7d9baaa4947975c0648c3aa397f4 |
| Modelo base | mistralai/Ministral-3-3B-Instruct-2512 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de identificarlo como Ministral 3 3B Instruct de Mistral. No se especifican en la documentacion proporcionada el numero de capas, la dimension del modelo, el tipo de atencion (completa, deslizante o hibrida), ni los detalles del tokenizador. Tampoco se indica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones mas alla de la denominacion "Instruct" del modelo.

Lo unico verificable tecnicamente en esta ficha es el proceso de cuantizacion: el archivo Q4_K_M se genero con llama.cpp a partir de los pesos originales, usando una matriz de importancia (tag `imatrix` en el repositorio), y fue publicado originalmente por Unsloth. Esta publicacion de LlamaPal es un espejo sin modificaciones, por lo que no introduce cambios en pesos, tokenizador ni plantilla de chat. Para detalles de arquitectura y entrenamiento del modelo original, la fuente autorizada es la model card de `mistralai/Ministral-3-3B-Instruct-2512`, que no se incluye en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a instrucciones (modelo "Instruct").
- Conversaciones de longitud muy elevada gracias a la ventana de 256K tokens, descrita en la model card como "book-length conversations".
- Inferencia completamente offline en Android mediante la app LlamaPal, sin cuenta ni conexion a internet.
- Compatibilidad con llama.cpp y cualquier aplicacion construida sobre el, al ser un GGUF estandar.
- Etiqueta `endpoints_compatible` en el repositorio, lo que sugiere compatibilidad con endpoints de inferencia tipo OpenAI en el ecosistema de despliegue.
- Soporte de tool calling, function calling, agentes, vision, audio o modo de razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente personal offline en Android: el modelo se descarga una vez (2,1 GB) y funciona sin red, lo que permite consultas y redaccion de texto en entornos sin conectividad o con requisitos de privacidad estrictos, ya que nada de lo escrito sale del dispositivo.
- Procesamiento de documentos largos en movil: con 256K tokens de contexto, es posible cargar contratos, manuales o libros completos y hacer preguntas sobre ellos sin fragmentar el texto en trozos.
- Resumen y analisis de conversaciones extensas: la ventana larga permite mantener historiales de chat de decenas de miles de tokens sin perder el hilo, util para diarios, transcripciones o hilos de soporte.
- Prototipado rapido de aplicaciones LLM en local: al ser un GGUF estandar, se puede cargar en llama.cpp en un portatil para validar prompts y plantillas de chat antes de desplegar en movil.
- Educacion y estudio sin conexion: explicaciones, resúmenes y preguntas sobre material de estudio en dispositivos de gama media, sin coste de API ni dependencia de servicios externos.
- Base para experimentos de cuantizacion e inferencia en el borde: investigadores pueden medir latencia, consumo de memoria y calidad de Q4_K_M en hardware movil y compararlo con otras variantes del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo Q4_K_M ocupa 2,1 GB en disco; en ejecucion se necesita espacio adicional para el contexto KV, por lo que se recomienda al menos 3-4 GB de RAM libre en el dispositivo (estimacion basada en el tamano del archivo, no confirmada en la informacion proporcionada).
- GPU recomendadas: no disponible en la informacion proporcionada. El caso de uso declarado es CPU/GPU integrada en Android.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no confirmada en la informacion, aunque al ser un GGUF de 2,1 GB cabe holgadamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp y aplicaciones basadas en el (la app LlamaPal para Android); el repositorio incluye la etiqueta `endpoints_compatible`. No se confirma soporte de vLLM, TGI u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ministral-3-3B-Instruct-2512 (esta ficha, Q4_K_M) | 3,43 B | 256K | Apache 2.0 | GGUF | Enfoque on-device Android, espejo de Unsloth |
| mistralai/Ministral-3-3B-Instruct-2512 (original) | 3,43 B | 256K | Apache 2.0 | safetensors (presumiblemente) | Pesos originales en precision completa; requiere mas VRAM |
| unsloth/Ministral-3-3B-Instruct-2512-GGUF | 3,43 B | 256K | Apache 2.0 | GGUF | Repositorio fuente de esta cuantizacion, con varias variantes |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada, ya que todas comparten los mismos pesos subyacentes y solo difieren en el formato y la cuantizacion.

## Limitaciones y advertencias

- Este repositorio es un espejo: no aporta mejoras, correcciones ni entrenamiento adicional respecto al GGUF de Unsloth ni al modelo original de Mistral.
- La cuantizacion Q4_K_M introduce perdida de precision respecto a los pesos originales; la magnitud de esa degradacion no esta documentada en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 3B parametros; no se han publicado evaluaciones de fidelidad en esta ficha.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano sin validacion previa.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la model card del modelo original de Mistral para terminos adicionales de uso aceptable.
- El contexto de 256K es una capacidad del modelo base; en la practica, el contexto efectivo en un movil estara limitado por la RAM disponible para la cache KV.
- La model card promociona una aplicacion concreta (LlamaPal); el archivo puede usarse en cualquier runtime compatible con GGUF, pero la ficha no verifica el comportamiento en otras aplicaciones.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/LlamaPal/Ministral-3-3B-Instruct-2512-Q4_K_M-GGUF
- Modelo base original: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Repositorio GGUF fuente (Unsloth): https://huggingface.co/unsloth/Ministral-3-3B-Instruct-2512-GGUF
- Aplicacion LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
