# jaimenms/image2vienna-en

## Resumen

image2vienna-en es un sistema de clasificación de marcas figurativas que asigna códigos de la Clasificación de Viena (los elementos figurativos de las marcas, gestionada por la OMPI/WIPO). No es un modelo generativo ni un clasificador entrenado de extremo a extremo: es un recuperador semántico construido sobre embeddings. La imagen de la marca se describe primero en texto mediante un modelo de visión-lenguaje (Qwen2.5-VL 7B, ejecutado localmente vía Ollama en el paquete) y esa descripción se embebe con `intfloat/multilingual-e5-base` para puntuarla contra un índice de entradas de la Clasificación de Viena, cada una embebida una única vez a partir de su ruta jerárquica completa (categoría > división > sección).

El repositorio publicado en Hugging Face no contiene pesos de un modelo entrenado, sino un *custom Inference Endpoints handler* (`handler.py`) que sirve la segunda etapa del pipeline: recibe la descripción textual y devuelve códigos de Viena ordenados por similitud. El índice embebido (la propia clasificación) es el que hace de "modelo", y por eso el embedder figura como `base_model`. El autor es `jaimenms` y la licencia es MIT.

La relevancia actual está en que automatiza una tarea de clasificación normativa muy específica y costosa (el etiquetado de elementos figurativos de marcas), ofreciendo una alternativa reproducible, sin entrenamiento y con evaluación publicada sobre conjuntos reales de EUIPO. Funciona solo en inglés y está pensado para desplegarse como handler en endpoints de inferencia o integrarse en la librería Python `image2vienna`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de recuperación semántica sobre embeddings; codificador base transformer tipo encoder (intfloat/multilingual-e5-base) |
| Parametros totales | no disponible (el repositorio no declara parámetros propios; depende del codificador base intfloat/multilingual-e5-base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (el modelo de visión Qwen2.5-VL 7B se usa como versión de ~6 GB vía Ollama, sin detallar el esquema de cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible; los vectores del índice se almacenan en parquet y el despliegue usa `handler.py` |

## Arquitectura y entrenamiento

El sistema es una arquitectura de recuperación en dos etapas. La primera etapa es de percepción: un modelo visión-lenguaje (Qwen2.5-VL 7B) genera un inventario textual de los elementos figurativos presentes en la imagen de la marca. La segunda etapa, la que se sirve en este repositorio, es de recuperación por similitud: cada entrada de la Clasificación de Viena (con su jerarquía categoría > división > sección) se embebe una sola vez con `intfloat/multilingual-e5-base`, y la descripción de la imagen se compara contra ese índice para devolver los códigos más próximos. No hay entrenamiento ni ajuste fino del clasificador: el índice embebido de la clasificación *es* el modelo.

El pipeline admite estrategias de consulta configurables (descripción completa, media por frase o mejor frase por entrada), filtrado de secciones auxiliares, exclusión de subárboles completos de códigos y descenso automático por la jerarquía mientras la evidencia lo permite. Solo la primera palabra de los títulos va en mayúscula. El idioma de trabajo es el inglés, tanto en las descripciones como en el índice.

## Capacidades

- Asignación de códigos de la Clasificación de Viena a descripciones de elementos figurativos de marcas.
- Clasificación en distintos niveles de la jerarquía: categoría, división, sección o modo `auto` (descenso guiado por la evidencia).
- Recuperación de múltiples resultados por consulta (`top_k`) con puntuaciones de similitud y margen respecto al mejor resultado.
- Filtrado por sección principal, exclusión de subárboles de códigos y descarte por umbral de puntuación (`gap`).
- Normalización de texto de entrada (colapso de espacios y conversión de mayúsculas sostenidas).
- Procesamiento por lotes: acepta una cadena o una lista de cadenas.
- Aceptación de imagen en base64 únicamente si el endpoint puede alcanzar un modelo de visión configurado en `IMAGE2VIENNA_DESCRIBER`.
- Salida estructurada con código en formato WIPO (`1.1.4`) y formato EUIPO (`01.01.04`), indicador de sección auxiliar, puntuación, título y ruta jerárquica completa.
- Capacidades multilingües: no disponibles (idioma declarado: inglés).

## Casos de uso

- Preclasificación de marcas figurativas en despachos de propiedad industrial: el sistema convierte la imagen o descripción de una marca en una lista ordenada de códigos de Viena, reduciendo el trabajo manual previo al examen.
- Automatización en oficinas de registro: dado un expediente de marca, el handler devuelve los códigos candidatos con su nivel jerárquico, lo que permite generar borradores de clasificación revisables por un examinador.
- Búsqueda de anterioridades y vigilancia de marca: al disponer de códigos normalizados, se pueden cruzar marcas por elementos figurativos compartidos (por ejemplo, divisiones de animales o heráldica) para detectar posibles conflictos.
- Enriquecimiento de bases de datos de marcas: se puede ejecutar el clasificador sobre repositorios históricos de imágenes para poblar campos de clasificación ausentes.
- Filtrado previo a revisión humana: con `top_k` y `principal_only`, el sistema propone un conjunto acotado de códigos principales, dejando la verificación final al especialista.
- Integración en pipelines de gestión documental: al exponerse como handler de Inference Endpoints, se puede llamar por HTTP desde flujos internos que reciban descripciones textuales de marcas.
- Asistencia a agentes de marcas: para entradas ya descritas en texto (sin imagen), el handler clasifica directamente la descripción y devuelve la ruta jerárquica completa, útil en herramientas de soporte.

## Benchmarks y rendimiento

Evaluación sobre 300 marcas figurativas de EUIPO con los códigos de los examinadores (Large Labelled Logo Dataset, ediciones 5 a 8; una quinta parte de los códigos son extensiones de EUIPO que ninguna edición de WIPO contiene), con descripciones generadas por Qwen2.5-VL 7B.

| Nivel | hit@1 | hit@3 | hit@10 | Baseline de frecuencia hit@1 / hit@10 |
|---|---|---|---|---|
| category | 44.3% | 68.7% | 72.7% | 32.0% / 85.3% |
| division | 33.0% | 50.7% | 60.3% | 26.0% / 61.3% |
| section | 9.8% | 20.2% | 33.0% | 13.1% / 39.7% |

El sistema supera a un prior de frecuencia en rank 1 por encima de la sección y localiza la división correcta para la mayoría de elementos pictóricos (73% de las divisiones doradas en Animals, 54% en Heraldry, donde el prior no encuentra ninguna). El prior gana en profundidad porque los códigos más frecuentes de EUIPO son convenciones (letras en fuente especial, cuadriláteros, colores). El autor indica que hay una tabla por categoría y todas las configuraciones en `PERFORMANCE.md` del repositorio de GitHub.

## Requisitos de hardware

- Modelo de visión (primera etapa): Qwen2.5-VL 7B, aproximadamente 6 GB en la distribución de Ollama (`ollama pull qwen2.5vl:7b`).
- Codificador de embeddings: `intfloat/multilingual-e5-base`, de tamaño reducido; puede ejecutarse en CPU para el indexado y la consulta.
- Inferencia en GPU de consumo: el modelo de visión de 7B cuantizado cabe en GPUs de consumo tipo RTX 4090 o inferiores con VRAM suficiente para la cuantización de 6 GB; el codificador base es muy ligero.
- Opciones de despliegue: custom Inference Endpoints de Hugging Face mediante `handler.py`, instalación local del paquete `image2vienna` (`pip install "image2vienna[st] @ git+https://github.com/Jaimenms/image2vienna"`), Ollama para el modelo de visión, y la demo en Hugging Face Spaces que no requiere servidor.
- Limitación de despliegue: un endpoint estándar no puede alcanzar el modelo de visión, por lo que la entrada de imagen en base64 solo funciona si el endpoint tiene acceso a un describer configurado en `IMAGE2VIENNA_DESCRIBER`; en caso contrario hay que describir la imagen localmente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación del repositorio. El comparador directo disponible es el baseline de frecuencia de EUIPO, ya incluido en la tabla de benchmarks, que el sistema supera en rank 1 a nivel de categoría y división pero no en hit@10 ni en secciones profundas. No se han facilitado datos de otras alternativas de clasificación de Viena con los que contrastar parámetros, contexto, licencia o disponibilidad.

## Limitaciones y advertencias

- Solo inglés: el idioma declarado es `en`, lo que limita su uso directo en otros idiomas sin traducción previa.
- Sin entrenamiento supervisado: al ser recuperación sobre embeddings, su techo depende de la calidad de las descripciones del modelo de visión y de la cobertura del índice.
- Rendimiento débil en el nivel de sección: hit@1 de 9.8% frente al 13.1% del baseline de frecuencia; el autor advierte que los códigos más frecuentes de EUIPO son convenciones que el prior captura mejor.
- Divergencia de vocabularios: cerca de una quinta parte de los códigos de evaluación son extensiones de EUIPO que no existen en ninguna edición de WIPO, lo que puede provocar desajustes en la nomenclatura de salida.
- Riesgo de alucinación heredado de la primera etapa: si el modelo de visión describe mal la imagen, la clasificación posterior arrastra ese error.
- Dependencia de infraestructura: la entrada de imagen requiere acceso a un modelo de visión configurado; los endpoints estándar no pueden usarlo.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones de los recursos de terceros empleados (datos de WIPO/EUIPO y el codificador base).
- Advertencia de madurez: versión 0.1.0, creada y actualizada en 2026-10-09, con 0 descargas y 0 likes en el momento de la consulta; repo de 0.0 GB por tratarse de un handler y un índice.

## Enlaces

- Hugging Face: https://huggingface.co/jaimenms/image2vienna-en
- Repositorio GitHub (método, protocolo de evaluación y mediciones): https://github.com/Jaimenms/image2vienna
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/jaimenms/image2vienna
- Modelo base (embedder): https://huggingface.co/intfloat/multilingual-e5-base
- Clasificación de Viena (OMPI/WIPO): https://www.wipo.int/web/classification-vienna/
