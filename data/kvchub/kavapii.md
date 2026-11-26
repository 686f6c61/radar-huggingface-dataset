# KvcHub/kavapii

## Resumen

`kavapii` es un framework de código abierto, con API de estilo PyTorch, desarrollado por KvcHub y orientado exclusivamente al ciclo de vida completo de modelos de redacción de información personal identificable (PII) y secretos. No se distribuye como un modelo entrenado con pesos listos para usar, sino como una librería modular que permite entrenar, almacenar, evaluar y desplegar modelos de etiquetado de secuencias (formato BIO) desde presets de pocas líneas hasta implementaciones totalmente personalizadas.

El paquete incorpora componentes propios de tokenización (como `DigitSplitBPE`, un BPE a nivel de byte con separación de dígitos individuales que el autor declara 8,5 veces mejor en la alineación de fronteras de PII numérica frente a BPE estándar), pérdidas calibradas para etiquetado BIO (`CalibratedBIOLoss`) y un sistema de guardarraíles (`Guardrails`) con validadores como el de Luhn para tarjetas de crédito. Además define tres formatos de almacenamiento propios: `.kpds` para datasets binarios con mmap de copia cero, `.kava` para bundles de modelo autocontenidos sin `pickle` y `.kvault` para un almacén cifrado con búsqueda ciega.

La relevancia actual del proyecto reside en su enfoque en el cumplimiento del RGPD: el formato `.kvault` implementa cifrado de sobre por sujeto con AES-256-GCM, búsqueda ciega mediante HMAC-SHA256 sobre PII cifrada y un borrado criptográfico ("shredding") que el autor cifra en torno a 1 ms por sujeto. La model card no publica pesos entrenados, resultados de benchmarks ni una arquitectura de red concreta más allá de los componentes descritos, por lo que debe evaluarse como herramienta de infraestructura más que como modelo listo para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework de modelado; componentes de red propios (`PIIEncoder`, `BIOTokenHead`, `PIIModel.preset`) sobre PyTorch; arquitectura de red concreta no disponible |
| Parametros totales | No disponible (presets por nombre, p. ej. `base-30m`, sin detalle publicado) |
| Parametros activos | No aplica (no se describe un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | El tokenizador `DigitSplitBPE` se declara evaluado en más de 36 idiomas; conjunto de idiomas concreto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.kava` (bundle con `model.safetensors` + `tokenizer.json` + `kava_manifest.json`); datasets en `.kpds`; almacén cifrado `.kvault` |

## Arquitectura y entrenamiento

El proyecto no documenta una arquitectura de transformer concreta con número de capas, dimensiones ocultas o cabezas de atención. Lo que sí describe es una pila de componentes de modelado sobre PyTorch: `PIIEncoder` como codificador, `BIOTokenHead` como cabeza de clasificación de etiquetas BIO, `CalibratedBIOLoss` como función de pérdida calibrada para etiquetado BIO y `PIIModel.preset(...)` como fábrica de configuraciones predefinidas (se menciona el preset `base-30m`). El entrenamiento se realiza con `kavapii.Trainer`, que incorpora formas de secuencia estáticas en dos buckets y un calentamiento MLM disperso con `K` estático para evitar fugas de caché de `MPSGraph` en Apple Silicon y mantener el swap de disco en 0,00 MB.

En el plano de datos, el framework incluye `DatasetBuilder`, que permite añadir ficheros JSONL, inyectar negativos difíciles (`add_hard_negatives(0.15)`) y particionar en entrenamiento y validación. Los datasets se compilan a `.kpds`, un formato binario plano con cabecera `KPDS\x01`, tipos `uint16`/`int8`/`int64`, acceso por mmap de copia cero y verificación SHA-256; el autor cifra en unos 165 MB para 55 millones de tokens. No se publican detalles sobre volumen de tokens de entrenamiento, composición del corpus ni uso de RLHF o DPO, lo que es coherente con el hecho de que no se distribuyan pesos entrenados.

## Capacidades

- Redacción de PII y secretos: el `Redactor` sustituye entidades detectadas por marcadores deterministas del tipo `<PERSON_a1b2c3d4>` o `<EMAIL_9f8e7d6c>`.
- Etiquetado de secuencias en formato BIO mediante `BIOTokenHead` y `CalibratedBIOLoss`, con esquemas predefinidos como `kp.Schema.preset("full_30")`.
- Tokenización especializada para PII numérica con `DigitSplitBPE` (separación de dígitos individuales) y `CharShapeTokenizer` para modelos de borde de menos de 3 millones de parámetros.
- Guardarraíles extensibles: validadores por tipo de entidad, con ejemplo de validación de tarjetas de crédito mediante el algoritmo de Luhn.
- Almacenamiento cifrado reversible: `.kvault` con cifrado de sobre por sujeto (AES-256-GCM/EtM), búsqueda ciega con HMAC-SHA256 y rehidratación local sin pérdida.
- Borrado criptográfico por sujeto (`shred_subject`) orientado al derecho al olvido del RGPD.
- Extensibilidad total: subclases de `kavapii.nn.Module`, `kavapii.tokenizer.BaseTokenizer` y `kavapii.redact.Guardrails`.
- Interfaz de línea de comandos con subcomandos `train-tokenizer`, `compile-data`, `train`, `redact` y `vault-shred`.
- No se documentan capacidades de generación de texto libre, razonamiento general, matemáticas, visión, audio, tool calling ni agentes.

## Casos de uso

- Redacción de PII en pipelines de datos: el `Redactor` cargado desde un bundle `.kava` permite anonimizar campos como correos, teléfonos, SSN o claves de API antes de almacenar logs o exportar datasets, con guardarraíles que reducen falsos positivos mediante validación estructural (por ejemplo, Luhn en tarjetas).
- Cumplimiento del RGPD con derecho al olvido: usando `.kvault`, cada sujeto tiene su propia clave de sobre; `shred_subject(user_id)` destruye la clave y hace irrecuperables todos sus tokens en torno a 1 ms, sin necesidad de reescribir el almacén completo.
- Búsqueda sobre datos cifrados: `blind_search` permite localizar registros por PII (por ejemplo, un correo) mediante índices HMAC-SHA256 sin descifrar el contenido del vault, útil en auditorías y soporte interno.
- Rehidratación controlada en flujos clínicos o legales: el texto redactado puede almacenarse de forma segura y rehidratarse localmente con `vault.rehydrate(...)` cuando un operador autorizado necesita el original, manteniendo separación entre texto y PII.
- Entrenamiento de modelos PII a medida en hardware de consumo: el `Trainer` con `zero_swap=True` y el formato `.kpds` con mmap de copia cero permiten entrenar presets pequeños (por ejemplo, `base-30m`) en Apple Silicon sin swap de disco, algo relevante para equipos sin acceso a clústeres GPU.
- Modelos de borde para redacción en dispositivo: `CharShapeTokenizer` y los presets de menos de 3 millones de parámetros apuntan a despliegues en entornos con memoria muy limitada, donde no es viable un LLM general.
- Integración en CI/CD y herramientas internas: la CLI (`kavapii redact`, `kavapii train`, `kavapii vault-shred`) facilita automatizar la anonimización de artefactos y la gestión de borrados como pasos de pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica comparativa declarada por el autor es que `DigitSplitBPE` logra una alineación de fronteras de PII numérica 8,5 veces mejor que BPE estándar en más de 36 idiomas y sin tokens `<unk>`, sin que se detallen el conjunto de evaluación ni la metodología.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del preset elegido (se menciona `base-30m`, pero sin desglose de parámetros ni memoria).
- GPU recomendadas: no disponibles. El proyecto menciona explícitamente soporte y ajuste para Apple Silicon (backend MPS), con mitigación de fugas de caché de `MPSGraph`.
- GPU de consumo: no se confirma compatibilidad ni modelos concretos; los presets pequeños y `CharShapeTokenizer` (para modelos de menos de 3 millones de parámetros) sugieren viabilidad en entornos de baja memoria, pero sin cifras publicadas.
- Opciones de despliegue: el despliegue se realiza mediante bundles `.kava` cargados con `kp.Redactor.from_kava(...)`; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles, salvo la cifra del autor de aproximadamente 1 ms para el borrado criptográfico de un sujeto en `.kvault`.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con otros modelos o librerías de redacción de PII, y `kavapii` no es un modelo de pesos publicados sino un framework, por lo que una comparación directa con modelos de etiquetado de secuencias requeriría datos que no se han proporcionado.

## Limitaciones y advertencias

- No se distribuyen pesos entrenados: `inference: false` en la model card y descargas y likes a cero; el rendimiento real depende del modelo que entrene el usuario.
- Ausencia total de benchmarks publicados sobre precisión, recall o F1 en detección de PII, lo que impide evaluar su calidad frente a alternativas.
- Sesgos conocidos: no documentados; al entrenar sobre datos propios, los sesgos del corpus del usuario se trasladan al modelo.
- Riesgo de alucinación y falsos positivos/negativos: no cuantificado; los guardarraíles (por ejemplo, Luhn) mitigan parcialmente errores estructurales, pero no sustituyen una evaluación rigurosa.
- Idiomas: aunque el tokenizador se declara multilingüe (más de 36 idiomas), no se especifica qué idiomas cubren los esquemas de entidades ni si hay modelos entrenados por idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero las garantías de seguridad y cumplimiento (RGPD, cifrado) son responsabilidad del integrador; el borrado criptográfico no exime de auditorías ni de obligaciones legales adicionales.
- Madurez: proyecto muy reciente (creado en noviembre de 2026 según los metadatos), sin adopción aparente, lo que implica riesgo en producción por falta de validación externa.
- El cifrado de `.kvault` depende de la gestión segura de la passphrase maestra; su compromiso anula las garantías de borrado y confidencialidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KvcHub/kavapii
