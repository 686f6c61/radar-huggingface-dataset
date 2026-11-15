# indahl/indahl.ai

## Resumen

`indahl/indahl.ai` es un repositorio publicado en Hugging Face por el usuario `indahl` (vinculado a Heuremen LLC) que, segun su propia model card, no contiene un modelo de lenguaje entrenado, sino una copia de todos los ficheros publicados en el sitio web https://indahl.ai, incluyendo descargas de datos y los scripts de comprobacion asociados a cada tabla del sitio. El repositorio ocupa 0,4 GB y no declara pipeline, licencia, idiomas ni parametros de modelo.

Por tanto, no se trata de un modelo de IA propiamente dicho: no hay pesos, no hay arquitectura de red neuronal ni tokenizador descritos en la informacion disponible. La ficha se redacta igualmente segun la estructura solicitada, marcando como "no disponible" todos aquellos campos que no pueden inferirse de los datos publicados.

La relevancia de este repositorio es limitada para el publico habitual de fichas de modelos: puede interesar a quien necesite una copia espejo de los datos y scripts de indahl.ai, pero sus terminos prohiben expresamente el text and data mining y el entrenamiento de IA sobre el contenido, lo que restringe severamente su uso en pipelines de machine learning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un repositorio de datos y scripts) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en Hugging Face; la model card remite a `LICENSE.txt` y a https://indahl.ai/terms, con prohibicion de mineria de textos y entrenamiento de IA |
| Formato de pesos | no disponible (el repositorio contiene ficheros del sitio web y scripts de comprobacion, no pesos en safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal ni proceso de entrenamiento en la informacion proporcionada. El contenido del repositorio, segun la model card, consiste en una copia de los ficheros publicados en https://indahl.ai, incluidas las descargas de datos y los scripts que generan o verifican cada tabla del sitio.

No hay datos sobre volumen de tokens, composicion del corpus, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas de inferencia. El tamano del repositorio (0,4 GB) es coherente con un conjunto de datos y scripts, no con pesos de un modelo de lenguaje de parametros significativos.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues.
- El repositorio contiene datos descargables y scripts de comprobacion asociados a tablas del sitio indahl.ai, que es lo unico que puede afirmarse con la informacion disponible.

## Casos de uso

- Espejo de datos de indahl.ai: descargar el repositorio para conservar una copia local de los ficheros publicados en el sitio, util si el sitio original deja de estar disponible.
- Auditoria de tablas: reutilizar los scripts de comprobacion incluidos para verificar la coherencia de las tablas publicadas en indahl.ai.
- Analisis documental manual: revisar los datos descargables para estudios que no impliquen mineria de textos automatizada, respetando los terminos del autor.
- Verificacion de integridad: comparar los ficheros del repositorio con los del sitio original para detectar modificaciones o desactualizaciones.
- Docencia sobre publicacion de datos: usar el repositorio como ejemplo de estructura de publicacion de datos y scripts de validacion en Hugging Face.
- Referencia de licencia restrictiva: estudiar el caso como ejemplo de licencia que prohibe explicitamente el entrenamiento de IA sobre los datos publicados.

En ninguno de estos casos el repositorio actua como modelo generativo; se usa como archivo de datos y codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no aplica.
- Almacenamiento: aproximadamente 0,4 GB para clonar el repositorio completo.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo de lenguaje, por lo que no existe una categoria de modelos comparables en terminos de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto ni puede ejecutarse con frameworks de inferencia.
- Licencia no declarada en Hugging Face; la model card remite a `LICENSE.txt` y a los terminos del sitio, que prohiben el text and data mining y el entrenamiento de IA.
- Uso comercial: no disponible; debe consultarse `LICENSE.txt` y https://indahl.ai/terms antes de cualquier uso.
- Riesgo de desactualizacion: al ser una copia estatica del sitio, puede quedar obsoleta respecto a la version publicada en https://indahl.ai.
- Sin garantias de integridad ni de mantenimiento por parte del autor.
- Sin datos de sesgos, alucinacion o limitaciones de contexto porque no hay modelo subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/indahl/indahl.ai
- Sitio original: https://indahl.ai
- Terminos y politica sobre entrenamiento de IA: https://indahl.ai/terms#ai-training
