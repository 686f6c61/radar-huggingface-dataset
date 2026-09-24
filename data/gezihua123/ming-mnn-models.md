# gezihua123/ming-mnn-models

## Resumen

`gezihua123/ming-mnn-models` no es un modelo nuevo, sino un repositorio de distribución: empaqueta en dos ficheros ZIP los modelos de inferencia en dispositivo que utiliza Ming, una aplicación de adivinación y astrología con IA. Los paquetes son `ming-mnn-qwen3-0.6b.zip`, derivado de `taobao-mnn/Qwen3-0.6B-MNN` (4 ficheros, unos 455 MB descomprimidos), y `ming-mnn-qwen3.5-0.8b.zip`, derivado de `taobao-mnn/Qwen3.5-0.8B-MNN` (7 ficheros, incluidos los pesos visuales, unos 548 MB descomprimidos). El repositorio completo ocupa 0,9 GB.

El interés práctico está en el formato y en el flujo de distribución, no en la innovación de modelado: pesos en formato MNN (`llm.mnn`, `llm.mnn.weight` y, en el modelo mayor, `visual.mnn` y `visual.mnn.weight`), estructura plana que se descomprime directamente sobre el directorio de modelos de la aplicación, y verificación de integridad mediante sha256 de cada fichero contra las declaraciones de `assets/models.json` del cliente. La existencia de dos escalones de tamaño, 0,6 B y 0,8 B, responde a un escenario de ejecución en teléfono, donde el presupuesto de memoria y el tamaño de descarga son la restricción dominante.

Es relevante como ejemplo de canal de publicación para edge computing: modelos pequeños de la familia Qwen3/Qwen3.5 convertidos a un runtime móvil y consumidos directamente por una aplicación de consumo, con el paquete multimodal reservado al escalón superior. No incluye model card técnica, licencia, idiomas soportados ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Qwen3-0.6B (paquete MNN) | Qwen3.5-0.8B (paquete MNN) |
|---|---|---|
| Arquitectura | No declarada en el repositorio; el paquete incluye `llm.mnn` y `llm.mnn.weight` y procede del modelo upstream Qwen3-0.6B convertido por taobao-mnn | No declarada en el repositorio; además del bloque de lenguaje incluye `visual.mnn` y `visual.mnn.weight`, con `is_visual: true` en `llm_config.json` |
| Parámetros totales | ~0,6 B (según la nomenclatura del nombre del modelo) | ~0,8 B (según la nomenclatura del nombre del modelo) |
| Parámetros activos | No aplica: no se declara que sea un modelo MoE | No aplica: no se declara que sea un modelo MoE |
| Longitud de contexto | No disponible (se declara en `llm_config.json`, que no se publica en el repositorio, solo dentro del ZIP) | No disponible (misma situación) |
| Tipos de cuantización | No disponible. El tamaño de los pesos (≈455 MB para ~0,6 B de parámetros) es compatible con pesos cuantizados, pero no se especifica el esquema ni el número de bits | No disponible. ≈548 MB para los ficheros de lenguaje más los visuales, sin detalle del esquema |
| Idiomas soportados | No disponible | No disponible |
| Licencia | No disponible en el repositorio; queda sujeta a la licencia del modelo upstream | No disponible en el repositorio; queda sujeta a la licencia del modelo upstream |
| Formato de pesos | MNN: `llm.mnn` + `llm.mnn.weight`; tokenizador en `tokenizer.txt`; configuración en `llm_config.json`. No hay safetensors ni GGUF | MNN: `llm.mnn` + `llm.mnn.weight` + `visual.mnn` + `visual.mnn.weight`; `llm.mnn.json`, `llm_config.json` y `tokenizer.txt` |
| Empaquetado | ZIP de estructura plana, listo para descomprimir en el directorio de modelos | ZIP de estructura plana, listo para descomprimir en el directorio de modelos |
| Integridad | sha256 de cada fichero verificado antes del empaquetado y coincidente con `assets/models.json` | sha256 de cada fichero verificado antes del empaquetado y coincidente con `assets/models.json` |
| Framework de inferencia | MNN (runtime de inferencia en dispositivo) | MNN (runtime de inferencia en dispositivo) |

Contenido del repositorio:

| Fichero | Modelo upstream | Número de ficheros | Tamaño descomprimido |
|---|---|---|---|
| `ming-mnn-qwen3-0.6b.zip` | `taobao-mnn/Qwen3-0.6B-MNN` | 4 | ~455 MB |
| `ming-mnn-qwen3.5-0.8b.zip` | `taobao-mnn/Qwen3.5-0.8B-MNN` | 7 (incluye `visual.mnn*`) | ~548 MB |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre arquitectura, datos de entrenamiento, número de tokens, composición del corpus ni procesos de alineación (RLHF, DPO u otros). Lo único deducible de los artefactos publicados es la estructura del paquete: un bloque de lenguaje en formato MNN (`llm.mnn` y `llm.mnn.weight`) junto a `llm_config.json` y `tokenizer.txt`, y, en el caso de 0,8 B, un bloque visual adicional (`visual.mnn` y `visual.mnn.weight`) más `llm.mnn.json`. La declaración `is_visual: true` en el `llm_config.json` de ese paquete indica una configuración multimodal que requiere los pesos visuales; el propio autor advierte que su ausencia provoca un fallo de carga.

En consecuencia, toda la parte de entrenamiento y de innovaciones técnicas (atención, decodificación especulativa, modo de razonamiento, etc.) queda fuera del alcance de la información disponible: estos paquetes son artefactos de despliegue derivados de conversiones realizadas por taobao-mnn a partir de los modelos Qwen3-0.6B y Qwen3.5-0.8B, y el repositorio se limita a redistribuirlos con verificación de integridad. Cualquier afirmación sobre el entrenamiento subyacente debería contrastarse en los repositorios upstream, no aquí.

## Capacidades

- Generación de texto conversacional de turno corto, en el rango propio de modelos de 0,6 B y 0,8 B de parámetros.
- Inferencia totalmente local en el dispositivo mediante el runtime MNN, sin dependencia de red.
- Capacidad vision-lenguaje en el paquete de 0,8 B: incluye `visual.mnn` y `visual.mnn.weight`, y el `llm_config.json` declara `is_visual: true`.
- Carga reproducible y verificable: estructura plana y sha256 de cada fichero coincidente con la configuración de la aplicación.
- Selección por presupuesto de recursos: dos tamaños distintos (0,6 B sin visión, 0,8 B con visión) para adaptar la descarga y el consumo de memoria.
- Tool calling / function calling: no declarado en el repositorio.
- Soporte de agentes y razonamiento multi-paso: no declarado en el repositorio.
- Capacidades multilingües: no declaradas en el repositorio.
- Modo de razonamiento explícito, audio u otras capacidades especiales: no declaradas en el repositorio.

## Casos de uso

- Aplicación móvil con inferencia sin conexión: el paquete se descomprime en el directorio de modelos del cliente y se ejecuta con MNN en el propio teléfono, de modo que el texto generado para el usuario no abandona el dispositivo; es el escenario para el que está construido el repositorio.
- Asistente conversacional embebido de respuestas breves: con 0,6 B o 0,8 B de parámetros el modelo sirve para turnos cortos, reformulación de texto y respuestas guiadas por plantillas dentro de una app de consumo.
- Análisis de imágenes en el dispositivo: el paquete de 0,8 B, con `visual.mnn` y `is_visual: true`, permite tareas vision-lenguaje locales, como describir una imagen aportada por el usuario o responder preguntas sencillas sobre ella sin subirla a un servidor.
- Distribución reproducible de artefactos de modelo: el repositorio sirve como canal de publicación verificable (sha256 por fichero contra `assets/models.json`), útil en pipelines de despliegue que necesitan garantizar que el binario cargado es el esperado.
- Comparación de presupuestos de memoria en producción: disponer de un paquete de 0,6 B (unos 455 MB descomprimidos) y otro de 0,8 B con visión (unos 548 MB) permite medir en el mismo runtime el coste en RAM y latencia de subir de escalón o de añadir el módulo visual.
- Prefiltrado y clasificación ligera en el borde: uso del modelo como primera etapa (detección de intención, extracción de campos, resumen de una línea) antes de derivar las peticiones complejas a un modelo mayor en la nube, reduciendo coste y tráfico.
- Integración en aplicaciones Android e iOS mediante MNN: el formato `llm.mnn` + `llm.mnn.weight` evita conversiones adicionales y permite cargar el modelo desde el almacenamiento local de la aplicación tras la descarga y descompresión del ZIP.
- Investigación sobre cuantización y latencia en dispositivos: los paquetes permiten reproducir experimentos de rendimiento sobre hardware móvil real con modelos de la familia Qwen3/Qwen3.5 ya convertidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni datos de latencia o throughput, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no declarada en el repositorio. Como referencia orientativa por tamaño de pesos (≈455 MB para el paquete de 0,6 B y ≈548 MB para el de 0,8 B, ya cuantizados), la inferencia cabe holgadamente en cualquier GPU con 2 GB o más de memoria; se trata de una estimación derivada del tamaño de los ficheros, no de un requisito publicado.
- Memoria del sistema: no especificada. Los dos paquetes están pensados para ejecutarse en teléfonos, por lo que el consumo de RAM debe situarse en el rango de cientos de megabytes a pocos gigabytes, pero el repositorio no publica cifras.
- GPUs recomendadas: no disponibles. El formato MNN está orientado a aceleradores móviles e integrados; en escritorio, cualquier GPU de consumo moderna (por ejemplo, serie RTX 30/40 o superior) dispone de capacidad sobrada para estos tamaños, aunque el repositorio no declara backends compatibles.
- Viabilidad en GPU de consumo: sí, por tamaño de pesos; ambos paquetes son inferiores a 1 GB de pesos, por lo que caben incluso en GPUs de gama de entrada con 4 GB de VRAM.
- Opciones de despliegue: el paquete requiere el runtime MNN o una conversión previa, ya que los pesos están en formato `.mnn`/`.mnn.weight`. No se distribuyen safetensors ni GGUF, por lo que vLLM, llama.cpp, Ollama o TGI no pueden cargarlos directamente sin conversión, que el repositorio no documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Elemento | Parámetros | Visión | Formato | Licencia declarada | Disponibilidad |
|---|---|---|---|---|---|
| `ming-mnn-qwen3-0.6b.zip` (este repositorio) | ~0,6 B | No | MNN, en ZIP | No disponible | 0 descargas, 0 likes en el momento de la consulta |
| `ming-mnn-qwen3.5-0.8b.zip` (este repositorio) | ~0,8 B | Sí (`is_visual: true`) | MNN, en ZIP | No disponible | 0 descargas, 0 likes en el momento de la consulta |
| `taobao-mnn/Qwen3-0.6B-MNN` (upstream) | ~0,6 B | No | MNN | No disponible en la información | No disponible |
| `taobao-mnn/Qwen3.5-0.8B-MNN` (upstream) | ~0,8 B | Sí (incluye `visual.mnn*`) | MNN | No disponible en la información | No disponible |

No es posible establecer una comparación cuantitativa con alternativas de la misma categoría (por ejemplo, modelos de la clase 0,5-1 B orientados a dispositivo) porque no se han publicado benchmarks, contexto, idiomas ni licencia en la información disponible. La comparación queda limitada a la relación con los modelos upstream de los que proceden los artefactos.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor del repositorio, sino una redistribución de conversiones MNN de terceros; cualquier mérito o defecto del modelo corresponde a los artefactos upstream.
- Ausencia total de model card técnica: no se documentan arquitectura, contexto, idiomas, cuantización ni datos de entrenamiento.
- Licencia no declarada: no se indica licencia en el repositorio, de modo que el uso comercial o la redistribución no pueden darse por permitidos sin comprobar la licencia de los modelos upstream. Es un riesgo legal relevante antes de integrar estos paquetes en un producto.
- Sin resultados de benchmarks: no hay evidencia publicada de calidad, exactitud o robustez, ni comparación con alternativas.
- Riesgo de alucinación elevado: por el rango de tamaño (0,6 B y 0,8 B de parámetros), son modelos con capacidad limitada de razonamiento, matemáticas y código, y propensos a generar contenido plausible pero falso, especialmente en dominios especializados.
- Dependencia estricta del runtime MNN: los pesos no son utilizables directamente en ecosistemas como vLLM, llama.cpp, Ollama o TGI, y el repositorio no documenta un procedimiento de conversión a otros formatos.
- Fallo de carga si falta el bloque visual: el `llm_config.json` del paquete de 0,8 B declara `is_visual: true`, por lo que omitir `visual.mnn` o `visual.mnn.weight` provoca un error de carga.
- Advertencia del propio autor sobre el escalón de 0,6 B: el conjunto oficial de modelos MNN de Qwen3.5 arranca en 0,8 B, de modo que la opción de 0,6 B procede de Qwen3-0.6B y no de la misma generación que el paquete de 0,8 B; no son directamente comparables en capacidades.
- Trazabilidad limitada del repositorio: 0 descargas y 0 likes, sin pipeline declarado, sin idiomas y con fecha de creación y actualización registradas como 2026-09-24, un valor atípico que conviene verificar antes de tomarlo como referencia.
- La verificación por sha256 garantiza integridad de la transferencia, no autenticidad ni ausencia de contenido malicioso en los pesos de origen.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/gezihua123/ming-mnn-models
- Modelo upstream del paquete de 0,6 B: https://huggingface.co/taobao-mnn/Qwen3-0.6B-MNN
- Modelo upstream del paquete de 0,8 B: https://huggingface.co/taobao-mnn/Qwen3.5-0.8B-MNN
