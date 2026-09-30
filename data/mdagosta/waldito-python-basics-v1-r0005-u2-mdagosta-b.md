# mdagosta/waldito-python-basics-v1-r0005-u2-mdagosta-b

## Resumen

`waldito-python-basics-v1-r0005-u2-mdagosta-b` es un modelo de generación de texto publicado en HuggingFace por el usuario mdagosta bajo el paraguas denominado "OpenWALDO model export". Según su model card, emplea la arquitectura causal estándar de Llama de la librería Transformers, junto con un tokenizador de bytes propio ("schema-1 byte tokenizer") que requiere cargarse con `trust_remote_code=True`. El repositorio incluye además dos ficheros de inventario: `BOM.json`, que lista todos los ficheros de la release, y `EU-BOM.json`, que mapea la divulgación de contenido de entrenamiento exigida por el reglamento europeo de IA (GPAI).

El dato más relevante es su tamaño: 9.541.632 parámetros reales (unos 9,54 millones), confirmados por los pesos en safetensors. Se trata, por tanto, de un modelo de escala minúscula, más cercano a un experimento de entrenamiento o a un modelo educativo que a un modelo de propósito general desplegable en producción. El nombre del repositorio sugiere un ajuste sobre fundamentos de Python, con identificadores de release (`r0005`) y de unidad (`u2`) que apuntan a una serie de ejecuciones de entrenamiento iterativas.

La relevancia actual del modelo es limitada y muy nichada: no declara licencia, idiomas soportados ni contexto, no tiene descargas ni likes, y no se han publicado resultados de benchmarks. Su interés reside en el formato de empaquetado (BOM y divulgación GPAI) y en el tokenizador de bytes a medida, más que en su rendimiento como modelo de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (según model card) |
| Parámetros totales | 9.541.632 (≈9,54 M), dato real de safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | OpenWALDO schema-1 byte tokenizer, requiere `trust_remote_code=True` |
| Biblioteca | transformers |
| Pipeline | text-generation |
| Ficheros adicionales | `BOM.json`, `EU-BOM.json` |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación (metadatos) | 2026-09-30 |

## Arquitectura y entrenamiento

La model card indica únicamente que el paquete usa "la arquitectura estándar de modelo de lenguaje causal Llama de Transformers", con pesos en safetensors compatibles con la librería `transformers`. No se especifica número de capas, dimensión oculta, número de cabezas de atención, tipo de normalización ni si se emplean técnicas como RoPE, GQA o atención con ventana deslizante. Con 9,54 millones de parámetros totales, el modelo es varios órdenes de magnitud más pequeño que cualquier Llama público de Meta (el menor, Llama 3.2 1B, tiene aproximadamente 1.240 millones de parámetros), por lo que se trata de un modelo propio con nomenclatura de arquitectura compatible, no de un derivado de los pesos de Meta.

El elemento diferencial declarado es el tokenizador: un tokenizador de bytes de esquema 1 (schema-1 byte tokenizer) propiedad de OpenWALDO, que exige ejecución de código remoto (`trust_remote_code=True`) al cargarlo. Esto implica que la tokenización no sigue el vocabulario BPE de Llama y que el modelo solo funciona con ese tokenizador específico.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo fases de ajuste supervisado, RLHF o DPO, ni sobre técnicas de optimización de inferencia. El nombre del repositorio (`python-basics-v1`) apunta a un corpus centrado en fundamentos de programación en Python, pero es una inferencia a partir del nombre, no un dato confirmado. La presencia de `EU-BOM.json` sugiere que el autor ha documentado la procedencia del contenido de entrenamiento conforme al marco europeo de modelos de IA de propósito general (GPAI).

## Capacidades

- Generación de texto causal: capacidad declarada por el pipeline `text-generation`.
- Uso conversacional: la etiqueta `conversational` aparece entre los tags del repositorio.
- Compatibilidad con Text Generation Inference (TGI) y con endpoints compatibles, según los tags `text-generation-inference` y `endpoints_compatible`.
- Posible especialización en fundamentos de Python, deducida del nombre del repositorio y no confirmada por documentación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Visión, audio o modo "thinking": no disponible.

## Casos de uso

- Experimentación educativa sobre tokenizadores de bytes: el modelo permite estudiar cómo se comporta un tokenizador a nivel de byte (schema-1 de OpenWALDO) frente a vocabularios BPE convencionales, sin necesidad de infraestructura GPU.
- Pruebas de integración de extremo a extremo con Transformers: sirve como modelo de juguete para validar pipelines de carga con `trust_remote_code=True`, serialización safetensors y despliegue en TGI antes de pasar a modelos de mayor tamaño.
- Verificación de flujos de cumplimiento GPAI: los ficheros `BOM.json` y `EU-BOM.json` permiten probar herramientas internas de auditoría de inventario de ficheros y de divulgación de contenido de entrenamiento.
- Generación de fragmentos de código Python a nivel didáctico: si la especialización sugerida por el nombre se confirma, podría emplearse para completar ejercicios básicos de sintaxis, siempre con revisión humana y sin garantías de corrección.
- Docencia sobre escalado de modelos: comparar las salidas de un modelo de 9,5 M de parámetros frente a modelos de 1 B o 7 B ilustra de forma tangible el efecto del tamaño en la coherencia del texto.
- Pruebas de latencia en hardware embebido: al ocupar decenas de megabytes, es adecuado para medir tiempos de carga y de generación en CPU, Raspberry Pi o dispositivos con memoria muy limitada.
- Evaluación de riesgo de alucinación en dominios técnicos: útil como caso extremo para calibrar sistemas de detección de salidas incorrectas en código generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y no se ha localizado ningún informe externo que las mida.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 9,54 M de parámetros, sin contar caché KV ni el consumo del runtime):
  - FP32: aproximadamente 38 MB de pesos.
  - FP16/BF16: aproximadamente 19 MB de pesos.
  - int8: aproximadamente 10 MB de pesos.
  - int4: aproximadamente 5 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; no se requiere A100, H100 ni RTX 4090. Cualquier GTX 1050 Ti o superior, e incluso GPUs integradas, bastan.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de las últimas dos décadas, y también en CPU sin aceleración.
- Opciones de despliegue: Transformers (vía `pipeline`), Text Generation Inference (TGI) por la etiqueta del repositorio y endpoints compatibles. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que el autor no publica; además, el tokenizador de bytes personalizado puede no ser compatible con dichos runtimes sin trabajo adicional.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

No se ha localizado un modelo comparable directo en el rango de los 10 millones de parámetros con arquitectura Llama y tokenizador de bytes. La tabla siguiente sitúa el modelo frente a alternativas de la misma familia arquitectónica y de tamaño pequeño, con datos públicos de referencia que conviene verificar en la fuente original.

| Modelo | Parámetros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| waldito-python-basics-v1-r0005-u2 | 9,54 M | no disponible | no disponible | no disponible | HuggingFace |
| SmolLM2-135M | 135 M | 8.192 tokens | Apache-2.0 | sí | HuggingFace |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache-2.0 | sí | HuggingFace |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache-2.0 | sí | HuggingFace |

La diferencia de escala (más de un orden de magnitud en el caso más cercano) hace que la comparación en rendimiento no sea significativa. El modelo aquí descrito es entre 14 y 115 veces más pequeño que las alternativas listadas.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso de uso comercial, modificación ni redistribución. Cualquier uso en producción queda jurídicamente indeterminado.
- Sin idiomas declarados: no hay garantía de comportamiento correcto en castellano ni en ninguna otra lengua.
- Sin longitud de contexto publicada: imposible dimensionar aplicaciones que dependan de ventanas largas o de conversaciones multi-turno extensas.
- Riesgo elevado de alucinación y de texto incoherente: con 9,54 M de parámetros, la capacidad de mantener coherencia a lo largo de varios párrafos es muy limitada.
- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluación de sesgos, toxicidad o alineación.
- Tokenizador con `trust_remote_code=True`: implica ejecutar código del autor del repositorio al cargar el tokenizador. Es un riesgo de seguridad y debe auditarse el código antes de usarlo en cualquier entorno.
- Sin pesos cuantizados oficiales: no hay GGUF ni cuantizaciones publicadas, lo que complica el despliegue en llama.cpp, Ollama u otros runtimes ligeros.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Fecha de publicación anómala en los metadatos (2026-09-30), posterior a la fecha de consulta; conviene tratarla como posible error del repositorio.
- No apto para tareas de producción que requieran razonamiento, código fiable, matemáticas o atención al cliente sin supervisión humana.
- Aviso sobre la model card: el contenido citado proviene del propio autor y no ha sido verificado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0005-u2-mdagosta-b
- Variante de la misma serie (r0003-u0): https://huggingface.co/mdagosta/waldito-python-basics-v1-r0003-u0-mdagosta-b
- HuggingFace (portal general): https://huggingface.co/
- Open models by OpenAI (referencia no relacionada con este modelo): https://openai.com/open-models/
- Artículo sobre Thomson Reuters y su modelo propio (referencia no relacionada con este modelo): https://thenewstack.io/thomson-reuters-ai-model/
- Repositorio de material docente de deep learning (referencia no relacionada con este modelo): https://github.com/snagy22000/dl-fundamentals-by-rasbt/blob/main/unit01-ml-intro/Unit1-README.md

Nota: los ficheros `BOM.json` y `EU-BOM.json` citados en la model card se encuentran dentro del propio repositorio de HuggingFace del modelo. No se han localizado papers, blogs técnicos ni demostraciones específicas de este modelo en la búsqueda web realizada.
