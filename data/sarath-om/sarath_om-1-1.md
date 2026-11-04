# sarath-om/sarath_om-1.1

## Resumen

Sarath OM 1.1 es un modelo publicado en HuggingFace bajo el identificador `sarath-om/sarath_om-1.1` y distribuido principalmente a través del runtime Ollama. Según los metadatos del repositorio, se trata de un modelo de la familia Qwen2 (etiqueta `qwen2` en los tags) con 1.543.714.304 parámetros totales verificados a partir de los pesos en safetensors, lo que lo sitúa en el rango de aproximadamente 1,5 mil millones de parámetros. La model card declara capacidades de entrada de texto e imagen, visión, tool calling y modo de razonamiento (thinking), así como una ventana de contexto anunciada de 256K tokens.

Es relevante señalar que la propia model card aclara de forma explícita que Sarath AI es una plataforma de software e integración, no un proyecto de desarrollo o entrenamiento de modelos fundacionales. El autor no reclama la autoría del modelo base ni documenta el origen upstream, el proceso de entrenamiento, los datos utilizados ni los resultados de evaluación. Esto convierte a Sarath OM 1.1 en un artefacto de distribución cuyo valor técnico debe evaluarse con cautela, ya que la información verificable es escasa y parte de las especificaciones publicadas (contexto de 256K, tamaño de 3,3 GB) no concuerdan con los 1,54 mil millones de parámetros y el tamaño del repositorio de 5,2 GB.

En la práctica, el modelo se presenta como una experiencia lista para usar vía Ollama, con variantes local (`latest`) y en la nube (`cloud`). Para desarrolladores e investigadores, la ficha resulta útil como ejercicio de evaluación crítica: permite identificar qué datos están confirmados por los pesos y los metadatos, y qué afirmaciones proceden únicamente de la documentación del autor sin verificación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No documentada de forma independiente; etiqueta `qwen2` en los tags del repositorio, lo que sugiere una arquitectura transformer de la familia Qwen2 |
| Parametros totales | 1.543.714.304 (dato verificado en safetensors) |
| Parametros activos | No aplica (no se ha documentado una arquitectura MoE) |
| Longitud de contexto | 256K tokens anunciados en la model card y en el listado de Ollama; no verificado de forma independiente |
| Tipos de cuantizacion | No disponible (la model card indica "confirmar a partir de la configuración publicada") |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica "verificar los términos del modelo y de la distribución upstream") |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

La arquitectura no está documentada de forma independiente en la información disponible. El tag `qwen2` del repositorio apunta a una arquitectura transformer decoder-only de la familia Qwen2, pero la model card no confirma el modelo base, no describe la configuración de capas, dimensiones ocultas ni cabezas de atención, y no aporta información sobre el proceso de entrenamiento. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

La model card declara explícitamente que el proyecto no desarrolla ni entrena modelos fundacionales, y que el origen upstream, la procedencia del entrenamiento y la titularidad de los pesos deben establecerse a partir de la configuración publicada y de la documentación del modelo original. No se documenta ninguna innovación técnica destacable (atención lineal, decodificación especulativa, arquitecturas híbridas, etc.). Cualquier afirmación sobre el entrenamiento o la arquitectura más allá del tag `qwen2` carece de respaldo en la información proporcionada.

## Capacidades

- Generación de texto: capacidad listada en la model card como entrada de texto.
- Entrada de imágenes y visión: la model card lista entrada de imagen y soporte de visión, aunque no se detalla la resolución, el codificador visual ni el formato de imagen admitido.
- Tool calling / function calling: listado como capacidad soportada según la model card y los tags del repositorio.
- Modo de razonamiento (thinking): listado como capacidad soportada, sin documentación sobre el formato de los tokens de pensamiento ni sobre cómo activarlo o desactivarlo.
- Contexto largo: ventana anunciada de 256K tokens, útil para conversaciones multi-turno y documentos extensos, aunque sin verificación independiente.
- Capacidades multilingües: no disponibles; no se especifican idiomas soportados.
- Capacidades de agente y razonamiento multi-paso: no documentadas de forma explícita, aunque la combinación de tool calling y modo thinking sugiere que el autor las contempla.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con `ollama run sarath-om/sarath_om-1.1` y gestionar diálogos multi-turno mediante la API HTTP local de Ollama, lo que lo hace adecuado para prototipos de asistentes en máquinas de desarrollo sin depender de servicios en la nube.
- Procesamiento de documentos largos: la ventana anunciada de 256K tokens permitiría, en teoría, resumir o extraer información de documentos extensos en una sola pasada; conviene validar empíricamente el comportamiento en contextos muy largos antes de usarlo en producción.
- Automatización con herramientas: gracias al soporte declarado de tool calling, puede integrarse en flujos donde el modelo decida invocar funciones externas (consultas a APIs, operaciones sobre archivos) a través de la API de chat de Ollama.
- Análisis de imágenes en local: la entrada de imagen y el soporte de visión permiten construir prototipos de descripción de imágenes o extracción de información visual, siempre que se confirme el formato y la calidad del codificador visual.
- Razonamiento asistido con modo thinking: para tareas que requieran pasos intermedios de razonamiento (planificación, resolución de problemas), el modo thinking listado puede emplearse en entornos de experimentación, verificando la calidad de las cadenas de razonamiento generadas.
- Integración en aplicaciones Python o JavaScript: la API de Ollama y los ejemplos de la model card (paquete `ollama` para Python, llamadas cURL) facilitan la incorporación del modelo en backends de aplicaciones, bots o pipelines de automatización.
- Evaluación y experimentación académica: como artefacto de 1,54 mil millones de parámetros con pesos en safetensors, puede servir para estudiar el comportamiento de modelos pequeños con capacidades multimodales y de tool calling declaradas, siempre teniendo en cuenta la falta de documentación sobre su procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no incluye resultados de evaluación verificados de forma independiente y que el rendimiento depende de la variante, la aplicación, la versión del runtime y la configuración.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,54 mil millones de parámetros, en precisión FP16 se requieren aproximadamente 3,1 GB solo para los pesos, más overhead de activaciones y caché KV; en cuantizaciones de 8 bits o 4 bits el requisito de pesos baja aproximadamente a 1,5 GB y 0,8 GB respectivamente, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para FP16, una GPU con 6-8 GB de VRAM es suficiente (por ejemplo, RTX 3060, RTX 4060, RTX 2070); para cuantizaciones de 4 bits, una GPU con 4 GB o incluso CPU puede ser viable.
- Compatibilidad con GPU de consumo: sí, el tamaño del modelo permite ejecutarlo en GPUs de consumo de gama media; la model card menciona un tamaño de modelo de aproximadamente 3,3 GB, coherente con una cuantización de 16 bits o similar.
- Opciones de despliegue: Ollama es el runtime documentado (variantes `latest` y `cloud`); la API HTTP local de Ollama permite integrarlo con aplicaciones. No se documentan otras opciones como vLLM, llama.cpp o TGI, aunque al estar los pesos en safetensors podrían convertirse a otros formatos.
- Latencia y throughput estimados: no disponibles; dependen del hardware, la cuantización, la longitud de contexto y la variante (local o cloud).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sarath OM 1.1 | 1,54B (verificado) | 256K anunciado | Listado | Listado | No disponible | HuggingFace y Ollama |
| Qwen2-VL-2B (referencia de familia) | ~2B | 32K (ampliable) | Sí | Sí | Apache 2.0 (según el modelo original) | HuggingFace, vLLM, etc. |
| SmolVLM-2B (referencia de familia) | ~2B | 8K-16K según variante | Sí | Parcial | Apache 2.0 (según el modelo original) | HuggingFace, llama.cpp |
| Gemma 3 1B (referencia de familia) | ~1B | 32K | Sí (en variantes multimodales) | Sí | Términos de Gemma | HuggingFace, Ollama |

La comparativa con modelos de la familia Qwen2-VL, SmolVLM o Gemma 3 es orientativa: la información disponible no permite confirmar que Sarath OM 1.1 sea un fine-tuning de alguno de ellos, ni que sus capacidades declaradas (visión, tool calling, thinking) estén a la altura de esos modelos. La principal diferencia es la falta de licencia explícita y de documentación sobre procedencia y evaluación en Sarath OM 1.1.

## Limitaciones y advertencias

- Procedencia no documentada: la model card no confirma el modelo base, el proceso de entrenamiento ni la titularidad de los pesos; el autor declara explícitamente que no desarrolla ni entrena modelos fundacionales.
- Licencia no disponible: no se especifican los términos de uso, lo que impide evaluar la legalidad de un uso comercial o de la redistribución.
- Idiomas no especificados: no hay información sobre el soporte multilingüe ni sobre la calidad en castellano.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad; como cualquier modelo generativo, puede producir información incorrecta, especialmente en dominios especializados.
- Inconsistencias en las especificaciones: el tamaño anunciado de 3,3 GB y la ventana de 256K tokens no concuerdan de forma obvia con los 1,54 mil millones de parámetros y el tamaño del repositorio (5,2 GB); conviene verificar la configuración real antes de confiar en esas cifras.
- Capacidades declaradas sin verificación: visión, tool calling y thinking aparecen listados, pero no se documenta su formato, activación ni calidad; es necesario validarlos empíricamente.
- Dependencia del runtime Ollama: el despliegue documentado está ligado a Ollama; otras rutas (vLLM, llama.cpp) no están documentadas y podrían requerir conversiones no oficiales.
- Variante cloud con implicaciones de privacidad: la variante `cloud` procesa las peticiones en un servicio alojado; la model card recomienda revisar los términos de privacidad antes de enviar información confidencial.
- Fecha de creación futura: los metadatos indican una fecha de creación de 2026-10-16, lo que debe tenerse en cuenta al evaluar la madurez y el historial del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sarath-om/sarath_om-1.1
- Modelo en Ollama: https://ollama.com/sarath-om/sarath_om-1.1
- Sitio web oficial: https://sarath.openflip.in/
- GitHub del proyecto: https://github.com/Sarath-Om
- Documentación de Ollama Cloud: https://docs.ollama.com/cloud
- Descarga de Ollama: https://ollama.com/download
