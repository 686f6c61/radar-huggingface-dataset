# P2Enjoy/gemma-4-E2B-it-GGUF

## Resumen

Esta ficha describe `P2Enjoy/gemma-4-E2B-it-GGUF`, un espejo (mirror) sin modificaciones del repositorio `unsloth/gemma-4-E2B-it-GGUF`, publicado bajo licencia Apache 2.0. Se trata de una versión cuantizada en formato GGUF de un modelo instructivo de la familia Gemma, con 4.647.450.147 parámetros totales (aproximadamente 4,65 mil millones) según los datos de safetensors del modelo base. El repositorio ocupa 3,2 GB y contiene una única cuantización, `Q4_K_XL`.

El autor, P2Enjoy, declara explícitamente que se trata de una copia "sin modificación" respecto a la revisión `0314792d7f1f7e229411f620751375812bb9faf2` del repositorio original de Unsloth, reensamblada para su uso en la pila "Liaison Vocale". La model card está redactada en francés y no aporta detalles adicionales sobre arquitectura, datos de entrenamiento ni proceso de ajuste; todo el mérito se atribuye a los autores originales.

La relevancia práctica de esta ficha es acotada: permite desplegar un modelo de ~4,65 B en hardware de consumo gracias a la cuantización Q4, pero la ausencia de documentación técnica propia y el hecho de contar con 0 descargas y 0 "likes" limitan la información verificable. Conviene tratar este repositorio como una redistribución y consultar siempre la fuente original para cualquier decisión técnica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma; sin detalle en la información proporcionada) |
| Parámetros totales | 4.647.450.147 (~4,65 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_XL (Unsloth Dynamic, "UD"); único archivo en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye también en safetensors) |

## Arquitectura y entrenamiento

Este espejo no incluye información sobre la arquitectura interna ni sobre el proceso de entrenamiento. La model card se limita a indicar que es una copia sin modificación y a proporcionar el hash SHA-256 del archivo `gemma-4-E2B-it-UD-Q4_K_XL.gguf` (`b52f438017efaec5debf1c0d8be690571e212a07c312f1102bbce927258cfc32`). Por el nombrado, se trata de una variante instructiva (`-it`) de la familia Gemma con 4.647.450.147 parámetros totales. El sufijo "E2B" sigue la convención de Gemma para modelos con parámetros "efectivos", aunque la información disponible no especifica cuántos parámetros permanecen activos por token ni si emplea mecanismos como embeddings por capa o MatFormer.

No se documentan el número de tokens de entrenamiento, la composición del dataset, ni el uso de técnicas de alineación como RLHF o DPO. Tampoco se describen innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). La única transformación verificable respecto al repositorio de Unsloth es la cuantización a Q4_K_XL (esquema Dynamic de Unsloth), que reduce el peso del modelo para facilitar su despliegue en hardware limitado.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y la variante instructiva indican soporte para diálogo multi-turno, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede servirse mediante la API de mensajes de HuggingFace Inference Endpoints.
- Uso de tabla "imatrix": la cuantización emplea una importance matrix (`imatrix`), lo que habitualmente mejora la fidelidad de la cuantización, pero no se especifica qué conjunto de calibración se usó.
- Tool calling / function calling: no disponible (no confirmado en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo "thinking", visión, audio): no disponible.

## Casos de uso

- Asistentes conversacionales locales: al ser una cuantización Q4 de ~4,65 B, puede ejecutarse en un portátil o una GPU de gama media para mantener diálogos multi-turno sin enviar datos a la nube.
- Prototipado rápido de chatbots: el reducido tamaño del archivo (~3 GB) permite iterar sobre plantillas de prompt y flujos conversacionales en local antes de escalar a un modelo mayor.
- Generación de texto asistida en el borde (edge): despliegue en equipos con recursos limitados donde no es viable servir un modelo de mayor tamaño.
- Integración en la pila "Liaison Vocale": el autor declara que el espejo se preparó para esta pila, por lo que encaja como componente conversacional de un sistema de voz (voz a texto → modelo → texto a voz).
- Redacción y resumen de documentos cortos: tareas de generación de texto de propósito general en las que el coste de cómputo es un factor crítico.
- Experimentación y evaluación de cuantizaciones: al incluir el esquema Q4_K_XL de Unsloth, sirve para comparar la degradación de calidad frente a los pesos completos en tareas concretas.
- Enseñanza y divulgación: permite demostrar el ciclo completo de descarga, cuantización y despliegue de un modelo GGUF en un taller o aula sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del espejo ni los metadatos del repositorio incluyen valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: como referencia, una cuantización Q4_K_XL de un modelo de ~4,65 B suele ocupar entre 2,7 y 3,0 GB de pesos; con una ventana de contexto moderada, la VRAM total necesaria se sitúa aproximadamente entre 3,5 y 5 GB. Estas cifras son estimaciones basadas en el tamaño del repositorio (3,2 GB) y no en datos oficiales.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060, RTX 4070). También es viable la inferencia solo en CPU con RAM suficiente (≈4-6 GB libres).
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU modernas de gama media con al menos 6 GB de VRAM. En equipos con 4 GB podría requerir descarga parcial de capas a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y, con soporte limitado para GGUF, vLLM. El tag `endpoints_compatible` también habilita HuggingFace Inference Endpoints.
- Latencia y throughput: no disponibles (no se proporcionan mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| P2Enjoy/gemma-4-E2B-it-GGUF | ~4,65 B (activos: no disponible) | no disponible | Apache 2.0 | GGUF (Q4_K_XL) | Espejo sin modificación; 0 descargas |
| Llama 3.2 3B Instruct | 3,21 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Alternativa pequeña consolidada de Meta |
| Qwen2.5-3B-Instruct | 3,09 B | 32 K (128 K ampliado) | Apache 2.0 | safetensors, GGUF | Buen rendimiento en código y multilingüe |
| Gemma 3n E2B | ~5 B totales (~2 B efectivos) | 32 K | Gemma Terms of Use | safetensors, GGUF | Referente previo de la línea "E" de Google |

Los datos de la columna de alternativas proceden de conocimiento público general y pueden variar; no se dispone de cifras de rendimiento comparadas para este modelo concreto. La comparación directa de calidad no es posible al no existir benchmarks publicados.

## Limitaciones y advertencias

- Es un espejo, no un modelo original: no aporta documentación técnica propia y toda la información de valor reside en el repositorio de Unsloth y en el modelo de Google subyacente.
- Repositorio sin validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, por lo que no hay señal de uso ni de calidad verificada.
- Riesgo de alucinación: como cualquier modelo de ~4,65 B y, además, cuantizado a Q4, es previsible una mayor tasa de errores factuales que en versiones de mayor tamaño o precisión.
- Pérdida por cuantización: la Q4_K_XL reduce la fidelidad respecto a los pesos completos; en tareas sensibles (matemáticas, razonamiento de varios pasos) la degradación puede ser notable.
- Idiomas y contexto no especificados: se desconoce la cobertura lingüística real y la longitud de contexto soportada, lo que dificulta planificar despliegues multilingües o con ventanas largas.
- Discrepancia de licencia: la ficha declara Apache 2.0, pero la familia Gemma suele distribuirse con sus propios términos de uso. Conviene verificar la licencia del modelo original antes de un uso comercial.
- Fecha de creación inusual (2026-10-04): el repositorio figura creado y actualizado en 2026, dato que conviene contrastar con la fuente original.
- Sin garantías de mantenimiento: al ser una redistribución de un particular, puede no recibir actualizaciones ni correcciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/P2Enjoy/gemma-4-E2B-it-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF
- Revisión referenciada del modelo base: `0314792d7f1f7e229411f620751375812bb9faf2`
- Archivo incluido: `gemma-4-E2B-it-UD-Q4_K_XL.gguf` (SHA-256: `b52f438017efaec5debf1c0d8be690571e212a07c312f1102bbce927258cfc32`)
- Pila declarada por el autor: "Liaison Vocale" (sin enlace disponible en la información proporcionada)
