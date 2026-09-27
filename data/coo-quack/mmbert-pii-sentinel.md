# coo-quack/mmBERT-pii-sentinel

## Resumen

mmBERT-pii-sentinel es un modelo de clasificación de tokens (token-classification) desarrollado por el usuario coo-quack, especializado en la detección de información personal identificable (PII) en documentos multilingües. Se trata de un ajuste fino del encoder multilingüe jhu-clsp/mmBERT-base (revisión `c5955035435e2bf121cde7f3c8863ef52ff35d82`) al que se han añadido tres cabezas de predicción: etiquetado de spans en formato BIO para entidades personales, clasificación de sensibilidad documental en tres niveles (none / low / high) y clasificación en 19 categorías documentales relacionadas con privacidad.

El modelo resuelve un problema muy concreto: el escaneo de documentos para localizar y clasificar datos personales antes de compartirlos, publicarlos o procesarlos. A diferencia de un detector de entidades genérico, no se limita a marcar nombres o correos: también estima el grado de sensibilidad global del documento y su temática (identificación gubernamental, datos financieros, salud, datos biométricos, opinión política, vida sexual, ubicación precisa, credenciales, comunicaciones privadas, antecedentes penales, etc.).

Con 306.975.791 parámetros (aproximadamente 307 millones) y un repositorio de 1,2 GB, es un modelo compacto que puede ejecutarse en CPU o en GPU de consumo. Soporta ocho idiomas (japonés, chino, coreano, inglés, francés, italiano, alemán y español), se distribuye bajo licencia MIT y se publicó el 27 de septiembre de 2026. No utiliza pipeline estándar de transformers: requiere la herramienta `pii-sentinel` para cargar sus cabezas personalizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (familia BERT) basado en jhu-clsp/mmBERT-base, con tres cabezas añadidas: etiquetado de spans (BIO), clasificación de sensibilidad (3 clases) y clasificación de 19 categorías documentales |
| Parametros totales | 306.975.791 (aprox. 307 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio contiene unicamente `model.safetensors` sin variantes cuantizadas publicadas |
| Idiomas soportados | ja, zh, ko, en, fr, it, de, es |
| Licencia | MIT (los terminos del modelo base se reproducen en THIRD_PARTY_NOTICES.md) |
| Formato de pesos | safetensors (`model.safetensors`) mas fichero de configuracion `pii_sentinel.json` con conjuntos de etiquetas y ajustes de entrenamiento |

## Arquitectura y entrenamiento

La base es jhu-clsp/mmBERT-base, un encoder multilingüe de tipo transformer. Sobre él se ajustan todas las capas del encoder y se añaden tres cabezas: una de etiquetado de spans en esquema BIO que cubre nombres de persona, direcciones de correo personales y genéricas, teléfonos personales y corporativos, identificadores nacionales y gubernamentales, números de pasaporte y permiso de conducir, números de tarjeta y de cuenta bancaria, y números de pedido, seguimiento y serie (estos tres últimos se aprenden pero no se reportan en la salida); una cabeza de sensibilidad documental con tres niveles (none, low, high); y una cabeza de clasificación en 19 categorías documentales que abarcan desde datos de contacto o fecha de nacimiento hasta datos de salud, biométricos o genéticos, opinión política o sindical, vida sexual u orientación, ciudadanía o inmigración, ubicación precisa, credenciales, comunicaciones privadas y expedientes de recursos humanos o penales.

Los datos de entrenamiento son documentos sintéticos generados a partir de plantillas en los ocho idiomas soportados. Todas las personas, números y direcciones son ficticios, salvo figuras históricas famosas empleadas como ejemplos de personajes públicos. Las etiquetas se derivan de las propias plantillas, y no se utilizan datos personales reales ni salidas de otros modelos de PII. No se especifica en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco se detallan innovaciones arquitectónicas adicionales sobre el modelo base.

## Capacidades

- Detección de nombres de persona mediante etiquetado de spans en formato BIO.
- Detección de direcciones de correo electrónico personales y genéricas.
- Detección de números de teléfono personales y corporativos.
- Detección de identificadores nacionales y gubernamentales, números de pasaporte y de permiso de conducir.
- Detección de números de tarjeta bancaria y de cuenta bancaria.
- Aprendizaje de patrones de números de pedido, seguimiento y serie, aunque estos no se reportan en la salida del modelo.
- Clasificación del nivel de sensibilidad de un documento completo en tres clases: none, low y high.
- Clasificación documental en 19 categorías: nombre de persona, contacto, dirección, fecha de nacimiento, identificación gubernamental, cuenta financiera, salud, datos biométricos o genéticos, dirección IP de una persona, identificador de red social, empleo, raza o religión, opinión política o sindical, vida sexual u orientación, ciudadanía o inmigración, ubicación precisa, credenciales, comunicaciones privadas y expedientes de recursos humanos o penales.
- Cobertura multilingüe en ocho idiomas: japonés, chino, coreano, inglés, francés, italiano, alemán y español.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento; se trata de un modelo discriminativo de análisis, no generativo.

## Casos de uso

- Saneamiento de documentos antes de compartirlos: el modelo localiza nombres, correos, teléfonos e identificadores en un fichero de texto y permite anonimizarlos o enmascararlos antes de enviarlo a terceros, evitando fugas de datos personales.
- Cumplimiento normativo y protección de datos: integrado en un flujo de revisión previa a la publicación de documentación, clasifica cada documento en none, low o high y permite bloquear automáticamente los de sensibilidad alta que contengan datos de salud, biométricos o financieros.
- Triaje de buzones y repositorios documentales: la cabeza de 19 categorías permite enrutar documentos hacia equipos distintos (recursos humanos, legal, finanzas) según su temática y sensibilidad, sin necesidad de inspección manual.
- Preprocesado para pipelines de anonimización: la salida BIO puede alimentar directamente un anonimizador o un sistema de pseudonimización, sirviendo como primera capa antes de revisión humana.
- Auditoría de conjuntos de datos para entrenamiento: antes de usar un corpus propio en el ajuste de otro modelo, el escaneo detecta qué documentos contienen información personal y con qué nivel de sensibilidad, lo que facilita descartarlos o tratarlos.
- Análisis de expedientes en contextos jurídicos o de recursos humanos: la detección de identificadores gubernamentales, números de cuenta y credenciales ayuda a separar la información probatoria de los datos personales que deben quedar bajo acceso restringido.
- Despliegue en entornos con restricciones de residencia de datos: al ser un modelo de 307 M con licencia MIT y pesos safetensors, puede ejecutarse íntegramente en infraestructura propia, algo relevante cuando no se permite enviar documentos a servicios externos.

## Benchmarks y rendimiento

Las cifras publicadas corresponden a la herramienta completa (modelo, conjunto de reglas regex y postprocesado en conjunto), no al modelo aislado, y contabilizan únicamente valores personales. El conjunto de prueba tiene 320 documentos, 40 por cada uno de los ocho idiomas, etiquetados dos veces de forma independiente con adjudicación de discrepancias. El conjunto de desarrollo tiene el mismo tamaño y se usa para análisis de errores.

| Metrica | Resultado en test |
|---|---|
| Nombres de persona: recall / precision | 97,9 % / 96,7 % |
| Numeros de telefono: recall / precision | 94,7 % / 90,0 % |
| Direcciones de correo: recall / precision | 91,7 % / 84,6 % |
| Identificadores y numeros de cuenta: recall / precision | 83,1 % / 90,1 % |
| Exactitud de sensibilidad (none / low / high) | 90,0 % |
| Documentos high clasificados como low o none | 2 de 162 |
| Documentos con informacion personal clasificados como none | 7 de 246 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generativos en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,2 GB para cargar los pesos tal como se distribuyen; aproximadamente 0,6 GB si se convirtieran a fp16 (conversión no publicada por el autor).
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria es suficiente dado el tamaño del modelo; no requiere A100, H100 ni tarjetas de gama alta.
- Cabe en GPU de consumo: sí, en cualquier modelo con al menos 2-4 GB de VRAM (por ejemplo, GTX 1650, RTX 3060, RTX 4090), y también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: el modelo no se carga con un pipeline estándar de transformers, sino mediante la herramienta `pii-sentinel` (`git clone https://github.com/coo-quack/pii-sentinel.git`, `uv sync` y `uv run pii-sentinel scan --model coo-quack/mmBERT-pii-sentinel documento.txt`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni formatos GGUF/ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| coo-quack/mmBERT-pii-sentinel | 306.975.791 | no disponible | 8 (ja, zh, ko, en, fr, it, de, es) | MIT | safetensors |
| Otros detectores multilingues de PII de tamano similar | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado en la información disponible resultados comparativos frente a alternativas de la misma categoría, ni especificaciones de modelos competidores. La información de búsqueda recibida no contiene referencias técnicas a modelos de PII, por lo que no es posible elaborar una comparativa con datos verificados.

## Limitaciones y advertencias

- Entrenado exclusivamente con texto sintético: los documentos reales con estructuras, maquetaciones o formatos inusuales pueden degradar el rendimiento.
- Solo se cubren los formatos de un país representativo por idioma; en el caso del chino, únicamente chino simplificado.
- El conjunto de prueba es también sintético y pequeño (320 documentos), por lo que una diferencia de uno o dos documentos está dentro del ruido estadístico.
- El rendimiento a nivel de documento es más débil cuando el hecho sensible solo se revela en un encabezado (por ejemplo, una lista de miembros de una comunidad religiosa) y cuando el documento contiene un identificador en línea o una dirección sin nombre asociado.
- Las métricas publicadas corresponden a la herramienta completa (modelo más reglas regex más postprocesado), no al modelo por sí solo, por lo que no deben atribuirse íntegramente a la red neuronal.
- La precisión en direcciones de correo (84,6 %) y en identificadores y números de cuenta (83,1 % de recall) es la más baja del conjunto, lo que implica falsos positivos y falsos negativos no despreciables en esos tipos de entidad.
- El modelo no está afiliado ni respaldado por los autores de mmBERT; los términos de licencia del modelo base se reproducen en THIRD_PARTY_NOTICES.md.
- La licencia es MIT, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base jhu-clsp/mmBERT-base antes de un despliegue en producción.
- No se documentan sesgos específicos, riesgos de alucinación (el modelo es discriminativo, no generativo) ni limitaciones de longitud de contexto más allá de las indicadas.
- El número de descargas registradas en el momento de los datos es 0 y las interacciones (1 like) son mínimas, por lo que la validación por parte de la comunidad es todavía muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coo-quack/mmBERT-pii-sentinel
- Modelo base jhu-clsp/mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- Repositorio de la herramienta pii-sentinel: https://github.com/coo-quack/pii-sentinel
- Fichero de licencia del modelo: LICENSE (en el repositorio de Hugging Face)
- Avisos de terceros del modelo base: THIRD_PARTY_NOTICES.md (en el repositorio de Hugging Face)
