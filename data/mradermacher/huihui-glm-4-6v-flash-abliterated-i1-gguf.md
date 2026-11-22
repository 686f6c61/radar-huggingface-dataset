# mradermacher/Huihui-GLM-4.6V-Flash-abliterated-i1-GGUF

## Resumen

Huihui-GLM-4.6V-Flash-abliterated-i1-GGUF es una compilación de cuantizaciones GGUF generadas por mradermacher a partir del modelo huihui-ai/Huihui-GLM-4.6V-Flash-abliterated, que a su vez deriva de la familia GLM-4.6V-Flash de Zhipu AI (Z.ai). El modelo base es un transformer multimodal de aproximadamente 9.400 millones de parámetros (dato real de safetensors), orientado a conversación con soporte de visión, y ha sido sometido a una técnica de "abliteration" que elimina la dirección de rechazo en el espacio de activaciones, dando lugar a una variante sin censura (uncensored).

Esta ficha corresponde específicamente al repositorio de cuantizaciones i1 (imatrix) en formato GGUF, no a los pesos originales en safetensors. mradermacher publica dos repositorios paralelos: este con cuantizaciones ponderadas mediante imatrix (prefijo i1) y otro con cuantizaciones estáticas. El repositorio ocupa 118 GB en total e incluye 25 variantes de cuantización que van desde IQ1_S (3,2 GB) hasta Q6_K (8,4 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con 4-6 GB de VRAM hasta estaciones de trabajo.

Su relevancia actual radica en dos factores: por un lado, ofrece una vía práctica para ejecutar un modelo multimodal de ~9,4B en hardware asequible mediante llama.cpp y derivados; por otro, la variante abliterated interesa a quienes investigan alineación, evalúan robustez de salvaguardas o necesitan un modelo sin rechazos para tareas creativas o de análisis de contenido sensible. La licencia MIT facilita su uso comercial, aunque con matices importantes que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia GLM-4.6V-Flash); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 9.400.279.040 (~9,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia GLM-4.6V-Flash de Zhipu AI, una línea de transformers multimodales con capacidad de procesamiento de visión además de texto. El nombre "V" en la denominación indica soporte visual, y el sufijo "Flash" sugiere una variante optimizada para eficiencia dentro de la familia. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo original.

La modificación "abliterated" aplicada por huihui-ai consiste en la ablación de la dirección de rechazo en el espacio de activaciones, una técnica que identifica la dirección vectorial asociada a las respuestas de negativa y la proyecta fuera de los pesos, reduciendo la tendencia del modelo a declinar peticiones. Esta intervención se aplica sobre los pesos del modelo base y no requiere reentrenamiento. Las cuantizaciones i1 de mradermacher emplean una matriz de importancia (imatrix) calculada sobre el modelo para ponderar la cuantización de cada tensor, lo que en la práctica mejora la calidad respecto a cuantizaciones estáticas del mismo tamaño, especialmente en los rangos bajos (IQ2, IQ3). El repositorio incluye el propio fichero imatrix (0,1 GB) para quien quiera generar cuantizaciones propias. No se especifica en la información disponible si el calibrado del imatrix se realizó con el proyector multimodal incluido o excluido.

## Capacidades

- Generación de texto conversacional multi-turno en chino e inglés.
- Procesamiento de imágenes (modelo multimodal de la familia GLM-4.6V), aunque la información disponible no detalla la resolución máxima ni el número de tokens visuales por imagen.
- Razonamiento y respuesta a instrucciones en formato chat.
- Capacidad de visión heredada del modelo base GLM-4.6V-Flash.
- Variante sin censura: menor probabilidad de rechazar peticiones que el modelo original rechazaría.
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta variante cuantizada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (6,3 GB) o IQ4_XS (5,4 GB) permiten ejecutar el modelo completo en una RTX 4060 Ti de 8 GB o una RTX 3060 de 12 GB mediante llama.cpp, con calidad razonable para chat general y tareas de asistencia.
- Procesamiento de documentos con imágenes en local: al ser un modelo con capacidad visual, puede usarse para extraer y describir contenido de capturas, diagramas o páginas escaneadas en flujos donde no se quiere enviar datos a servicios en la nube; conviene verificar primero el soporte real de entrada de imagen en el runtime GGUF elegido.
- Investigación sobre alineación y robustez de salvaguardas: la variante abliterated permite estudiar qué comportamientos emergen al eliminar la dirección de rechazo, comparando respuestas frente al modelo original y midiendo tasas de cumplimiento en conjuntos de prompts sensibles.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde violencia, contenido adulto o temas controvertidos, donde un modelo alineado estándar introduciría rechazos o evasivas.
- Asistente conversacional bilingüe chino-inglés: el modelo está entrenado explícitamente para ambos idiomas, por lo que encaja en aplicaciones de atención al cliente o soporte interno que operen en esos mercados; no se recomienda para castellano sin evaluación previa.
- Prototipado rápido con Ollama o llama.cpp: las cuantizaciones IQ2/IQ3 (3,5-4,8 GB) permiten levantar un servidor de inferencia en portátiles con GPU modesta o incluso en CPU para pruebas de concepto, aceptando la pérdida de calidad asociada.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 25 variantes del mismo modelo, lo que lo convierte en un banco de pruebas útil para medir la degradación de calidad y velocidad entre IQ1 e Q6 en una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y KV cache):
  - IQ1_S / IQ1_M: ~3,2-3,3 GB de pesos; ~4-5 GB en ejecución.
  - IQ2_XXS a IQ2_M: ~3,5-4,0 GB de pesos; ~4,5-6 GB en ejecución.
  - IQ3_XXS a Q3_K_L: ~4,3-5,3 GB de pesos; ~5,5-7 GB en ejecución.
  - IQ4_XS a Q4_K_M: ~5,4-6,3 GB de pesos; ~6,5-8,5 GB en ejecución.
  - Q5_K_S / Q5_K_M: ~6,8-7,2 GB de pesos; ~8-9,5 GB en ejecución.
  - Q6_K: ~8,4 GB de pesos; ~10-11 GB en ejecución.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 Ti Super 16 GB para cuantizaciones Q4-Q6; RTX 4090 24 GB o A100/H100 para Q6_K con contexto largo y margen holgado. Para Q4_K_M basta una RTX 4060 Ti 8 GB o RTX 3070 8 GB.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q5_K_M con 8-12 GB; Q6_K requiere 12 GB o más.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. La model card menciona "endpoints_compatible" en los tags, lo que sugiere compatibilidad con endpoints de tipo OpenAI en servidores GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, del tamaño de cuantización y del runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Huihui-GLM-4.6V-Flash-abliterated-i1-GGUF (este) | ~9,4B | no disponible | Sí (familia GLM-4.6V) | MIT | GGUF (25 cuants) |
| huihui-ai/Huihui-GLM-4.6V-Flash-abliterated | no disponible (mismo base) | no disponible | Sí | MIT | safetensors |
| mradermacher/Huihui-GLM-4.6V-Flash-abliterated-GGUF | ~9,4B (mismo base) | no disponible | Sí | MIT | GGUF estático |
| GLM-4.6V-Flash original (Zhipu AI) | no disponible | no disponible | Sí | no disponible | safetensors |

La comparación relevante es interna al ecosistema del propio modelo: la versión i1 frente a la estática del mismo autor, y frente al modelo base sin abliterar. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo, pero no garantiza la ausencia total de respuestas evasivas ni corrige sesgos subyacentes del modelo original; puede aumentar la probabilidad de contenido dañino, inexacto o inapropiado.
- Riesgo de alucinación inherente a modelos de ~9B: no debe usarse como fuente de verdad en dominios factuales sin verificación externa.
- Idiomas limitados a chino e inglés según la model card; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- La licencia MIT se aplica a esta compilación de cuantizaciones, pero conviene verificar los términos del modelo base GLM-4.6V-Flash original de Zhipu AI, ya que pueden imponer restricciones adicionales que prevalezcan sobre la MIT en el uso comercial.
- El soporte multimodal en formato GGUF depende del runtime: no todos los forks de llama.cpp cargan correctamente el proyector visual; es necesario comprobar la versión concreta antes de asumir entrada de imágenes.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; la propia model card las etiqueta como "for the desperate" o "very low quality". Para producción se recomienda Q4_K_M o superior.
- No se dispone de información sobre longitud de contexto real, por lo que no se puede garantizar el comportamiento en conversaciones largas.
- El repositorio tiene 593 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y escasa validación comunitaria.
- El tamaño total del repo (118 GB) obliga a descargar únicamente el fichero de la cuantización deseada, no el repositorio completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Huihui-GLM-4.6V-Flash-abliterated-i1-GGUF
- Modelo base (abliterated, safetensors): https://huggingface.co/huihui-ai/Huihui-GLM-4.6V-Flash-abliterated
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Huihui-GLM-4.6V-Flash-abliterated-GGUF
- Página de resumen del autor para este modelo: https://hf.tst.eu/model#Huihui-GLM-4.6V-Flash-abliterated-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Huihui-GLM-4.6V-Flash-abliterated-i1-GGUF/resolve/main/Huihui-GLM-4.6V-Flash-abliterated.imatrix.gguf
