# lemonade-sdk/pii_policy_mmbert32k-pii-detector-merged-onnx

## Resumen

Este repositorio no contiene pesos de modelo, sino una política de enrutamiento (`collection.router`) para el servidor Lemonade, un servidor local de IA que permite ejecutar modelos en GPU/NPU propias con APIs compatibles con OpenAI, Anthropic y Ollama. La política define un flujo de dos etapas: primero, cada prompt se pasa por un clasificador de PII (Información Personal Identificable) basado en el modelo `llm-semantic-router/mmbert32k-pii-detector-merged` (exportado a ONNX); si el clasificador detecta PII con una confianza mínima de 0.5, la solicitud se enruta a un modelo local (por defecto `Qwen3.5-0.8B-GGUF`), mientras que si no se detecta PII, se envía a un modelo en la nube (por defecto `fireworks.kimi-k2p6`).

La relevancia de esta pieza es práctica para desarrolladores que despliegan Lemonade y necesitan garantizar privacidad: evita que datos personales salgan del entorno local hacia servicios en la nube. El clasificador PII cubre 17 tipos de entidades (edad, tarjeta de crédito, fecha/hora, dominio, email, GPE, IBAN, IP, NRP, organización, persona, teléfono, dirección, título, licencia de conducir de EE. UU., SSN y código postal) con 34 etiquetas BIO. En el benchmark Nemotron-PII, esta política logró una tasa de fuga del 0.245 % (49 fugas sobre 20 000 prompts con PII), todas ellas correspondientes a categorías de PII blando (género, religión, etnia, etc.) que el clasificador no fue entrenado para reconocer.

El repositorio incluye únicamente el `manifest.json` necesario para que el backend `onnxruntime` de Lemonade interprete correctamente la salida de clasificación de tokens del modelo ONNX, además del propio archivo de política JSON. Es un componente de infraestructura, no un modelo de lenguaje en sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de tokens basado en transformer (modelo `mmbert32k-pii-detector-merged`, exportado a ONNX) |
| Parametros totales | no disponible (peso del clasificador no especificado en el repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el export ONNX del clasificador no documenta cuantizacion) |
| Idiomas soportados | no disponible (el clasificador original no publica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (el clasificador), JSON (la política), no incluye pesos propios |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino una política de enrutamiento que utiliza el clasificador PII `mmbert32k-pii-detector-merged` (cuyo export ONNX se aloja en el repositorio original del autor, `llm-semantic-router/mmbert32k-pii-detector-merged`). Este clasificador es un modelo de clasificación de tokens (token classification) que asigna a cada token una de las 35 etiquetas BIO (34 etiquetas con prefijo `B-`/`I-` más la etiqueta `O` para "fuera de entidad"). La política aprovecha la salida de este clasificador para tomar decisiones de enrutamiento.

El `manifest.json` incluido es clave: sin él, el backend `onnxruntime` de Lemonade interpreta por defecto el modelo como clasificación de texto de una sola etiqueta, lo que malinterpreta la salida de clasificación de tokens. El manifest mantiene las 34 etiquetas `B-`/`I-` separadas en lugar de colapsarlas en 17 entidades, porque el backend de Lemonade asigna las puntuaciones por etiqueta mediante asignación directa en un mapa; si dos índices de etiqueta colapsaran en la misma clave, la última sobrescribiría silenciosamente a la anterior. Por eso la regla de coincidencia de la política comprueba si la variante `B-` o la `I-` cruza el umbral por cada tipo de entidad (34 condiciones hoja).

El entrenamiento del clasificador original (datos, tokens, método de optimización como RLHF o DPO) no se detalla en la información proporcionada. La política en sí no implica entrenamiento, solo configuración de enrutamiento.

## Capacidades

- Enrutamiento inteligente de prompts: detecta PII en cualquier prompt entrante y decide si se procesa localmente o en la nube.
- Cobertura de 17 tipos de entidades PII: `AGE`, `CREDIT_CARD`, `DATE_TIME`, `DOMAIN_NAME`, `EMAIL_ADDRESS`, `GPE`, `IBAN_CODE`, `IP_ADDRESS`, `NRP`, `ORGANIZATION`, `PERSON`, `PHONE_NUMBER`, `STREET_ADDRESS`, `TITLE`, `US_DRIVER_LICENSE`, `US_SSN`, `ZIP_CODE`.
- Clasificación por tokens con etiquetas BIO: permite identificar el inicio y la continuación de cada entidad dentro del texto.
- Configuración de umbral ajustable: `min_score` (por defecto 0.5) permite controlar el balance entre precisión y recall.
- Selección de candidatos flexible: los modelos local y en la nube son configurados a través de `routing.candidates`.
- Compatible con el servidor Lemonade: se integra como una política `collection.router` y se activa mediante la API estándar de chat completions.
- No requiere pesos adicionales en este repositorio: el clasificador ONNX se descarga del repositorio original.

## Casos de uso

- **Protección de datos en asistentes de chat empresariales**: cuando un empleado interactúa con un asistente de IA corporativo, la política detecta si el prompt incluye datos personales (por ejemplo, un número de teléfono o una dirección) y lo redirige a un modelo local, evitando que esa información salga de la infraestructura de la empresa.
- **Cumplimiento normativo (RGPD)**: en aplicaciones que deben cumplir el Reglamento General de Protección de Datos, esta política garantiza que los datos personales de los usuarios no se envíen a proveedores de nube externos sin consentimiento explícito.
- **Aplicaciones de salud**: en chatbots de asesoramiento médico, la detección de entidades como `AGE` o `ORGANIZATION` puede evitar que información sensible se procese en la nube, manteniendo la privacidad del paciente.
- **Filtrado de prompts en desarrollo de agentes**: en pipelines de agentes que usan modelos en la nube para tareas complejas, la política se puede usar como un filtro previo para asegurar que ninguna solicitud con PII llegue a la nube.
- **Atención al cliente automatizada**: en sistemas de tickets, si el cliente incluye su dirección o teléfono en el mensaje, la política lo redirige a un modelo local para procesar la consulta sin exponer los datos a servicios externos.
- **Entornos de desarrollo y pruebas**: en CI/CD, se puede usar la política para verificar que los prompts de prueba no contengan PII reales antes de enviarlos a modelos de nube, evitando contaminación de datos en entornos de evaluación.

## Benchmarks y rendimiento

La política fue evaluada en el benchmark Nemotron-PII, compuesto por 20.000 prompts con PII y 20.001 en total (incluyendo un prompt sin PII). Los resultados:

| Metrica | Valor |
|---|---|
| Tasa de fuga (leak rate) | 0.245 % (49 fugas) |
| Categorías no detectadas | PII blando (género, religión, opinión política, etnia, estado laboral/educativo) |

Todas las 49 fugas corresponden a categorías fuera del conjunto de 17 entidades del clasificador, no a errores de umbral o puntuación. No se han publicado resultados comparativos con otros clasificadores en el repositorio. La política alternativa `lemonade-sdk/pii_policy_openmed-privacy-filter-multilingual-v2-onnx` cubre 54 tipos de entidades y obtuvo una tasa de fuga del 0 % en el mismo benchmark, pero con un clasificador mucho más pesado (5.6 GB).

## Requisitos de hardware

- Este repositorio no incluye pesos de modelo, por lo que no requiere VRAM propia.
- El clasificador ONNX subyacente (`mmbert32k-pii-detector-merged`) se describe como "mucho más pequeño" que el clasificador alternativo de 5.6 GB, pero no se especifica el tamaño exacto ni la VRAM mínima.
- La política se ejecuta en el servidor Lemonade, que soporta modelos GGUF, FLM y ONNX en CPU, GPU y NPU.
- Para el modelo local de respaldo (por defecto `Qwen3.5-0.8B-GGUF`), se requiere una GPU o NPU con al menos 1-2 GB de VRAM para la cuantización GGUF de 8 bits, o CPU con suficiente RAM.
- El modelo en la nube (`fireworks.kimi-k2p6`) no requiere hardware local.
- Opciones de despliegue: Lemonade Server (instalable como servicio), integrado en aplicaciones mediante APIs estándar (OpenAI, Anthropic, Ollama).

## Comparativa con modelos similares

| Característica | Este repositorio | `lemonade-sdk/pii_policy_openmed-privacy-filter-multilingual-v2-onnx` |
|---|---|---|
| Tipo de política | `collection.router` con clasificador ONNX | `collection.router` con clasificador ONNX |
| Entidades cubiertas | 17 tipos de PII | 54 tipos de PII (incluye PII blando) |
| Tasa de fuga (Nemotron-PII) | 0.245 % | 0 % |
| Peso del clasificador | Pequeño (no especificado) | 5.6 GB |
| Licencia | Apache 2.0 | Apache 2.0 |
| Idioma | no disponible | Multilingüe |

No se dispone de datos sobre otros modelos de clasificación de PII comparables en el repositorio.

## Limitaciones y advertencias

- **Cobertura de PII incompleta**: el modelo no detecta PII blando (género, religión, opinión política, etnia, estado laboral/educativo). Si el tráfico incluye estos tipos, la política no los enrutará al modelo local, exponiéndolos en la nube.
- **Falsos negativos**: la tasa de fuga del 0.245 % implica que, en un volumen alto de prompts, algunos datos sensibles podrían escapar al modelo en la nube.
- **Umbral de puntuación**: el valor `min_score` de 0.5 es un punto de partida; si se necesita mayor recall, se puede bajar el umbral, pero esto puede aumentar los falsos positivos (enrutamiento innecesario al modelo local).
- **Dependencia del manifest**: el `manifest.json` es esencial para el funcionamiento correcto; si se omite, el modelo se interpreta mal y la política no funcionará.
- **No es un modelo de IA**: este repositorio no contiene pesos de modelo ni ofrece capacidades de generación; es solo una configuración de enrutamiento.
- **Dependencia de Lemonade**: la política solo funciona dentro del ecosistema de Lemonade Server; no es utilizable con otros servidores de inferencia.
- **Idiomas**: no se especifican los idiomas soportados por el clasificador, por lo que su rendimiento en idiomas distintos del inglés no está garantizado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el clasificador subyacente tiene su propia licencia (no se especifica en este repositorio).

## Enlaces

- Repositorio de HuggingFace: [lemonade-sdk/pii_policy_mmbert32k-pii-detector-merged-onnx](https://huggingface.co/lemonade-sdk/pii_policy_mmbert32k-pii-detector-merged-onnx)
- Clasificador original: [llm-semantic-router/mmbert32k-pii-detector-merged](https://huggingface.co/llm-semantic-router/mmbert32k-pii-detector-merged)
- Proyecto Lemonade (GitHub): [lemonade-sdk/lemonade](https://github.com/lemonade-sdk/lemonade)
- Documentación de políticas de router (DeepWiki): [Router Policies (collection.router)](https://deepwiki.com/lemonade-sdk/lemonade/5.7-router-policies-(collection.router))
- Paquete PyPI: [lemonade-sdk](https://pypi.org/project/lemonade-sdk/)
- Política alternativa para PII blando: [lemonade-sdk/pii_policy_openmed-privacy-filter-multilingual-v2-onnx](https://huggingface.co/lemonade-sdk/pii_policy_openmed-privacy-filter-multilingual-v2-onnx)
- Skill para construir políticas de router: [lemonade-router-builder](https://github.com/amd/skills/tree/main/skills/lemonade-router-builder)
