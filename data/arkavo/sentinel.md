# Arkavo/sentinel

## Resumen

Arkavo/sentinel es un clasificador de texto de tres etiquetas (`public`, `internal`, `confidential`) desarrollado por Arkavo como ejemplo práctico de fine-tuning con LoRA sobre el modelo base Qwen/Qwen3.5-0.8B. El modelo está pensado para demostrar cómo un modelo pequeño (~0,75B parámetros) puede aprender a clasificar fragmentos de texto según su nivel de sensibilidad dentro de un corpus ficticio llamado Northwind, compuesto por trece documentos fuente. No es un producto de prevención de fuga de datos (DLP) general, sino un caso de estudio reproducible.

La relevancia actual del modelo reside en que muestra un flujo completo de entrenamiento, cuantización y despliegue de un clasificador ligero mediante GGUF, integrable en la infraestructura de orquestación de agentes de Arkavo Edge. El modelo se distribuye en formato GGUF cuantizado a Q8_0, con una variante envuelta en OpenTDF para protección de pesos, y se ejecuta con llama.cpp. Su licencia Apache-2.0 permite uso comercial sin restricciones, aunque el autor advierte explícitamente de que no debe usarse como detector de fugas en producción sin un corpus de entrenamiento más amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 (~0,75B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | No disponible (se probó una frase en español, pero no hay garantía oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0) y .tdf (OpenTDF wrap) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,8B parámetros con licencia Apache-2.0. Sobre esta base se aplicó un fine-tuning con LoRA (Low-Rank Adaptation) utilizando los scripts del directorio `scripts/distill/` del repositorio arkavo-edge (PR #680). El entrenamiento se realizó sobre un corpus ficticio Northwind compuesto por trece documentos fuente, con un método de relleno de plantillas (slot-fill) para generar ejemplos de entrenamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El autor indica que se probó previamente con TinyStories 15M, que resultó insuficiente para la tarea, lo que motivó el uso de Qwen3.5-0.8B.

La cuantización se realizó a Q8_0 en formato GGUF, eliminando el módulo MTP (Multi-Token Prediction) para facilitar la carga con llama.cpp. El modelo es exclusivamente de lenguaje, sin capacidades multimodales.

## Capacidades

- Clasificación de texto en tres categorías: `public`, `internal` y `confidential`.
- Generación de una única palabra como respuesta (la etiqueta de clasificación), no texto libre.
- Funciona con texto en inglés (idioma principal del corpus Northwind) y mostró comportamiento razonable con una frase en español en pruebas informales, aunque no hay garantía de soporte multilingüe.
- Capacidad de generalizar a documentos no vistos durante el entrenamiento: el autor reporta aciertos en dos fuentes retenidas (`board-valuation` y `public-talk`) y en reescrituras de fuentes vistas.
- Detecta "lenguaje de acuerdos" (deal language) más allá del nombre propio Northwind, como se demostró con una fusión no relacionada (Atlas Freight / Helios) clasificada como `confidential`.
- No soporta tool calling, razonamiento multi-paso ni modos de pensamiento explícitos; es un clasificador de propósito específico.

## Casos de uso

- Clasificación de documentos internos en una empresa ficticia: el modelo puede etiquetar automáticamente correos, informes o actas como `public`, `internal` o `confidential` dentro del dominio Northwind, facilitando la gestión de permisos de acceso.
- Demostración de fine-tuning con LoRA para clasificación: sirve como plantilla reproducible para equipos que quieran entrenar clasificadores ligeros sobre modelos base pequeños con Qwen3.5-0.8B y desplegarlos en GGUF.
- Integración en pipelines de orquestación de agentes: puede conectarse a Arkavo Edge para filtrar o enrutar mensajes según su sensibilidad antes de que un agente los procese, usando la API de clasificación vía llama.cpp.
- Evaluación de políticas de seguridad en entornos de prueba: el modelo puede usarse en un sandbox para validar reglas de política de acceso (por ejemplo, en el policy engine de Arkavo) sin necesidad de un clasificador comercial.
- Filtrado de contenido en canales de comunicación internos: en un entorno controlado con el corpus Northwind, puede bloquear o marcar mensajes que contengan información confidencial antes de su publicación.
- Formación y demostración educativa: es un ejemplo didáctico de cómo un modelo de 0,8B puede aprender una tarea de clasificación específica con pocos datos, útil para talleres de fine-tuning y cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona una evaluación interna sobre quince filas, con los siguientes resultados:

| Split | Correctos |
|---|---|
| Reescritura de fuentes vistas | 11 / 11 |
| Fuentes no vistas (verbatim) | 2 / 2 |
| Fuentes no vistas (reescritura) | 2 / 2 |

Además, se realizaron pruebas exploratorias fuera del split (no publicadas como tasa de falsos positivos):

- Canary Northwind → `confidential`
- Reexpresión en español del canary → `confidential` (sin garantía de traducción)
- Línea de libro de texto de fotosíntesis → `public`
- Receta de peras → `public`
- Fusión no relacionada (Atlas Freight / Helios) → `confidential`

Estos resultados indican que el modelo generaliza razonablemente dentro del dominio Northwind, pero no constituyen una métrica de rendimiento válida para producción.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~0,75B parámetros cuantizado a Q8_0, los pesos ocupan aproximadamente 0,75-1 GB. Con overhead de inferencia, se estima un consumo de VRAM inferior a 2 GB, aunque no hay datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060) es suficiente. También puede ejecutarse en CPU con llama.cpp sin problemas de latencia apreciables para una tarea de clasificación de una sola palabra.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna, incluidas las integradas de gama alta.
- Opciones de despliegue: llama.cpp (llama-cli), y por extensión cualquier runtime compatible con GGUF como Ollama o llama-cpp-python. No se menciona soporte para vLLM o TGI en la documentación.
- Latencia y throughput: no disponibles. Dado el tamaño del modelo, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU para una clasificación de una sola palabra.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| Arkavo/sentinel | 0,75B | No disponible | Apache-2.0 | GGUF Q8_0 | Clasificación de sensibilidad (3 etiquetas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Apache-2.0 | safetensors | Modelo base de propósito general |
| TinyStories 15M | 15M | No disponible | Apache-2.0 | safetensors | Generación de historias; insuficiente para clasificación (según el autor) |

No se dispone de comparativas con otros clasificadores de sensibilidad específicos. La comparación con el modelo base Qwen3.5-0.8B es la más relevante: sentinel es una adaptación LoRA de ese modelo, por lo que hereda su arquitectura y licencia, pero está especializado en la tarea de clasificación Northwind. TinyStories se menciona como un intento fallido previo, lo que subraya la necesidad de un modelo base con suficiente capacidad.

## Limitaciones y advertencias

- No es un detector de fugas de datos general: el corpus de entrenamiento son solo trece documentos ficticios, por lo que no puede clasificar texto fuera de ese dominio.
- No hay métricas de falsos positivos ni de recall publicadas: la evaluación interna de quince filas no es estadísticamente significativa.
- No es una certificación ni un producto listo para producción: el autor lo declara explícitamente como un "worked example".
- Riesgo de alucinación: al ser un modelo generativo, puede emitir etiquetas incorrectas ante entradas ambiguas o fuera de dominio.
- Sesgos: el modelo puede aprender patrones específicos del corpus Northwind (por ejemplo, lenguaje de acuerdos) y clasificar erróneamente texto similar no relacionado como `confidential`.
- Limitaciones de idioma: no hay garantía de soporte multilingüe; la prueba con español fue informal y no constituye una validación.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor advierte explícitamente de no entrenar un clasificador de seguridad sobre una requantización (requant) del modelo.
- No está integrado en el binario por defecto de Arkavo Edge 0.91.0: las funciones `taint` / `sentinel` permanecen desactivadas hasta compilar con esas características.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Arkavo/sentinel
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio arkavo-edge (PR #680 con scripts de entrenamiento): https://github.com/arkavo-org/arkavo-edge/pull/680
- Sitio web de Arkavo AI: https://www.arkavo.ai/
- Repositorio arkavo-edge: https://github.com/arkavo-org/arkavo-edge
- Arkavo Policy Engine (Arkavo Sentinel 2026): https://github.com/Jlamaille1/arkavo-policy-engine
- Arkavo Secure Messaging: https://arkavo.org/
- Sentinel (SIM) - capa de orquestación de agentes: https://www.sentinel-sim.com/
