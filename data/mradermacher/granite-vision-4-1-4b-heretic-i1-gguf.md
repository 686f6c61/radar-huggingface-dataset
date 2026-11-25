# mradermacher/granite-vision-4.1-4b-heretic-i1-GGUF

## Resumen

`mradermacher/granite-vision-4.1-4b-heretic-i1-GGUF` es una cuantizacion GGUF del modelo multimodal `heretic-org/granite-vision-4.1-4b-heretic`, una variante "abliterated" (decensored) del modelo Granite Vision 4.1 de 4B de IBM. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema GGUF conocido por publicar versiones imatrix de modelos populares. El modelo base hereda la arquitectura vision-lenguaje de la familia Granite, con aproximadamente 3.400 millones de parametros (3.402.839.040 segun los pesos safetensors del repo base).

El problema que resuelve es doble: por un lado, ofrece una version de Granite Vision con los mecanismos de rechazo y censura atenuados mediante la tecnica de "abliteration" (modificacion de direcciones de rechazo en el espacio de activaciones), lo que permite usar el modelo en tareas creativas, de analisis de contenido sensible o de investigacion sobre alineamiento sin las negativas sistematicas del modelo original. Por otro, al estar cuantizado en GGUF con distintos niveles (desde IQ1_S hasta Q6_K), permite ejecutar un modelo de vision-lenguaje en hardware consumer modesto, algo imposible con los pesos en precision completa.

La relevancia actual radica en que combina tres tendencias: modelos pequenos multimodales ejecutables en local, cuantizacion imatrix de calidad y variantes "uncensored" para casos de uso que el modelo original bloquea. La licencia Apache 2.0 facilita su uso comercial, aunque las implicaciones eticas de una variante decensored requieren cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (base Granite Vision 4.1 de IBM) |
| Parametros totales | 3.402.839.040 (~3,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles; segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizacion i1/imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es `heretic-org/granite-vision-4.1-4b-heretic`, una variante del Granite Vision 4.1 de IBM de aproximadamente 3,4B de parametros. Se trata de un transformer multimodal que combina un codificador de vision con un modelo de lenguaje para tareas de comprension de imagen y texto. La variante "heretic" aplica la tecnica de abliteration, que identifica y elimina (o atenua) las direcciones de activacion asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder ante ciertos tipos de contenido. Esta tecnica se aplica tipicamente sin reentrenamiento completo, mediante edicion de pesos en las capas de atencion y MLP.

La cuantizacion de mradermacher es de tipo "i1" con fichero imatrix, lo que significa que se ha utilizado una matriz de importancia (importance matrix) calculada sobre un corpus de calibracion para preservar mejor los pesos relevantes en cada nivel de compresion. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar, y que las versiones estaticas (sin imatrix) estan en el repositorio hermano `granite-vision-4.1-4b-heretic-GGUF`. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base original.

## Capacidades

- Generacion de texto y razonamiento general en ingles, heredadas del modelo de lenguaje subyacente de Granite.
- Comprension de imagenes: el modelo es multimodal y acepta entradas de vision junto con texto (los ficheros mmproj, si existen, estan en el repositorio estatico del autor).
- Conversacion multi-turno (tag `conversational`).
- Modo "uncensored": al estar abliterated, responde a peticiones que el modelo original rechazaria, util para investigacion sobre alineamiento y generacion creativa sin restricciones.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada (el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, pero no se detalla).
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: la model card solo declara ingles (`en`); no se confirman otros idiomas.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: la variante abliterated permite estudiar como se comporta un modelo sin mecanismos de rechazo, comparandolo con el original para analizar sesgos y patrones de negativa en el espacio de activaciones.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles (violencia, contenido adulto no explicito, temas controvertidos) sin las negativas sistematicas del modelo alineado.
- Analisis de imagenes en local: al ser un modelo de vision de 4B cuantizado a 2-3 GB, permite describir, clasificar o extraer informacion de imagenes en equipos consumer sin enviar datos a la nube, util en entornos con requisitos de privacidad.
- Prototipado rapido de aplicaciones multimodales: con cuantizaciones Q4_K_M de ~2,2 GB, se puede desplegar en un portatil con GPU modesta para validar ideas de producto antes de invertir en modelos mayores.
- Educacion e investigacion academica: el bajo coste de inferencia y la licencia Apache 2.0 permiten usarlo en laboratorios con recursos limitados para experimentos de vision-lenguaje.
- Moderacion de contenido asistida: analisis de imagenes y texto para detectar contenido sensible en pipelines internos, donde un modelo decensored puede describir el contenido sin filtros que oculten la naturaleza del material (con las cautelas eticas correspondientes).
- Despliegue en edge computing: las cuantizaciones IQ2/IQ3 (1,1-1,7 GB) caben en dispositivos con poca memoria, permitiendo inferencia multimodal en entornos embebidos o moviles de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye tablas de MMLU, HumanEval, GSM8K ni metricas multimodales, y no se dispone de datos del modelo base en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de cuantizacion y overhead de contexto):
  - i1-IQ1_S (~0,9 GB): ~1,5-2 GB de VRAM.
  - i1-IQ2_M (~1,3 GB): ~2-2,5 GB.
  - i1-IQ3_M (~1,7 GB): ~2,5-3 GB.
  - i1-Q4_K_M (~2,2 GB): ~3-3,5 GB.
  - i1-Q5_K_M (~2,5 GB): ~3,5-4 GB.
  - i1-Q6_K (~2,9 GB): ~4-4,5 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) para cuantizaciones Q4; RTX 3090/4090 o A100/H100 para mayor velocidad y contextos largos.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 4 GB o mas usando cuantizaciones Q4 o inferiores. Las cuantizaciones IQ2/IQ3 caben incluso en iGPU y dispositivos con 2-3 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (koboldcpp, text-generation-webui). Para vision es necesario cargar tambien el fichero mmproj correspondiente del repositorio estatico.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, un modelo de 4B en Q4_K_M en una RTX 4090 suele generar decenas de tokens por segundo, pero no se aportan cifras medidas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-vision-4.1-4b-heretic-i1-GGUF (este) | ~3,4B | no disponible | si | Apache 2.0 | GGUF en HF |
| Granite Vision 4.1 4B (original IBM) | ~3,4B | no disponible | si | Apache 2.0 | safetensors en HF |
| LLaVA 1.5 7B | ~7B | no disponible | si | LLaMA 2 (uso comercial restringido) | safetensors/GGUF |
| Qwen2-VL 2B | ~2B | no disponible | si | Apache 2.0 | safetensors/GGUF |

La comparativa se limita a la categoria de modelos vision-lenguaje pequenos (2-7B). Frente al Granite Vision original, la diferencia principal es la atenuacion de rechazos (abliteration); frente a LLaVA 7B, este modelo es mas pequeno y con licencia mas permisiva; frente a Qwen2-VL 2B, ofrece mas parametros pero se desconoce su rendimiento relativo al no haber benchmarks publicados en la informacion disponible.

## Limitaciones y advertencias

- Alucinacion: como todo modelo de lenguaje de 4B, tiene riesgo elevado de generar informacion falsa, especialmente en tareas de razonamiento complejo o descripcion de imagenes ambiguas.
- Sesgos: la abliteration elimina los mecanismos de rechazo pero no los sesgos subyacentes del modelo original; puede producir contenido ofensivo, estereotipado o inapropiado sin filtro.
- Limitacion de idioma: la model card solo declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Contexto: no se dispone de la longitud de contexto en la informacion proporcionada; conviene verificar la model card del modelo base antes de usarlo en tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el caracter "uncensored" puede incumplir politicas de plataformas (Hugging Face, proveedores cloud) y legislacion sobre contenido en determinadas jurisdicciones; el usuario asume la responsabilidad legal del contenido generado.
- Caveat de produccion: las cuantizaciones IQ1/IQ2 degradan notablemente la calidad; para uso real se recomienda Q4_K_M o superior. Ademas, para vision hay que cargar el mmproj del repositorio estatico, no incluido en este repositorio i1.
- Trazabilidad: al ser una cuantizacion de una variante abliterated de un modelo de terceros, la cadena de responsabilidad sobre el comportamiento final es difusa; no hay garantias de que el proceso de abliteration no haya degradado capacidades generales.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/granite-vision-4.1-4b-heretic-i1-GGUF
- Modelo base: https://huggingface.co/heretic-org/granite-vision-4.1-4b-heretic
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/granite-vision-4.1-4b-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#granite-vision-4.1-4b-heretic-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
