# clevrpwn/hume

## Resumen

HuMe es un modelo de lenguaje de tamaño pequeño (SLM) de 250 millones de parámetros, desarrollado por Danger Labs Inc. y publicado en HuggingFace por el usuario clevrpwn. Se trata de un agente autónomo de propósito general con una arquitectura de decoder Transformer de doble flujo: un sistema generativo de lenguaje (System 1) y una cabeza de dinámica predictiva basada en JEPA (System 2). El modelo opera sobre una variedad producto que combina un espacio euclídeo plano con una bola de Poincaré hiperbólica (curvatura c=1,0), lo que le permite modelar relaciones jerárquicas y de mundo de forma geométrica.

HuMe está diseñado para ejecutarse como agente con memoria multi-turno y herramientas integradas en un entorno sandbox, con verificación de contención por compilador. Su relevancia radica en ser un SLM compacto que incorpora conceptos avanzados como modelos de mundo JEPA y geometría hiperbólica, además de incluir una suite de stress-testing de alineación (AST-JEPA). El repositorio tiene un tamaño de 1,0 GB, licencia Apache 2.0 y soporta únicamente el idioma inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder Transformer de doble flujo con cabeza de dinámica JEPA (System 1 + System 2) |
| Parametros totales | 250.000.000 (250M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura de HuMe es un decoder Transformer de doble flujo. El primer flujo (System 1) es un modelo generativo de lenguaje convencional, mientras que el segundo flujo (System 2) es una cabeza de dinámica predictiva basada en JEPA (Joint Embedding Predictive Architecture) que predice representaciones latentes en lugar de tokens. Esta combinación permite al modelo razonar sobre estados futuros y planificar acciones, lo que lo habilita como agente autónomo.

El sustrato latente es una variedad producto que acopla un espacio de representación euclídeo plano con una bola de Poincaré hiperbólica de curvatura c=1,0. Esta elección geométrica está pensada para capturar tanto relaciones lineales como jerárquicas en los datos. En la información disponible no se detallan los datos de entrenamiento (número de tokens, composición del dataset, ni uso de RLHF o DPO). El modelo se presenta como "verificado por compilador" e incluye una suite de stress-testing de alineación (AST-JEPA) con 13 modos de fallo adversarios.

## Capacidades

- Generación de texto en inglés mediante pipeline de text-generation.
- Razonamiento básico, aunque con puntuaciones bajas en benchmarks de razonamiento (ARC 24%, MMLU 16%).
- Capacidad de agente autónomo general con memoria multi-turno y herramientas integradas en un entorno sandbox.
- Modelo de mundo JEPA que predice representaciones latentes, no solo tokens.
- Representaciones en variedad producto euclídeo-hiperbólica (bola de Poincaré).
- Verificación de contención mediante la suite AST-JEPA, que evalúa 13 vectores de misalignment adversarios.
- No se menciona soporte explícito de tool calling/function calling estándar, aunque el modelo dispone de herramientas sandboxed.
- Soporte de agentes y multi-step reasoning según la descripción del autor.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Automatización de tareas en entornos sandbox: el modelo puede ejecutar comandos y gestionar memoria multi-turno, lo que lo hace adecuado para automatizar flujos de trabajo en entornos aislados y controlados.
- Investigación en modelos de mundo JEPA: por su arquitectura de doble flujo y su cabeza predictiva, puede utilizarse para estudiar cómo los modelos aprenden representaciones del mundo y planifican acciones.
- Evaluación de seguridad y alineación de IA: la suite AST-JEPA integrada permite probar la contención de agentes frente a 13 modos de fallo adversarios, lo que resulta útil en laboratorios de seguridad.
- Asistentes conversacionales ligeros en inglés: gracias a su tamaño de 250M y su etiqueta android, podría desplegarse en dispositivos móviles para asistentes locales sin conexión.
- Prototipado de agentes autónomos en investigación: la licencia Apache 2.0 y el tamaño compacto facilitan la experimentación en entornos académicos.
- Educación en geometría hiperbólica para NLP: el uso de la bola de Poincaré como sustrato latente ofrece un caso práctico para enseñar representaciones no euclídeas.
- Simulación de agentes en dispositivos Android: la etiqueta android sugiere compatibilidad con despliegue en entornos móviles para tareas de agente simples.

## Benchmarks y rendimiento

Los resultados presentados a continuación son los declarados por el autor del modelo y no han sido verificados de forma independiente (verified: false en el model-index).

| Benchmark | Configuración | Métrica | Valor |
|---|---|---|---|
| ARC-Challenge | Test set | Accuracy | 24,00% (6/25) |
| MMLU | high_school_mathematics | Accuracy | 16,00% (4/25) |
| GSM8K | Main test split | Velocidad de inferencia | 0,8 q/s |
| AOSP-AST Multi-Category | 641 system slices / 10 security suites | Geometric Recall | 96,9% |
| AST-JEPA 13-Benchmark | full_suite / stress_test | Containment Integrity | 100% (13/13) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Un modelo de 250M en FP16 ocupa aproximadamente 0,5 GB, por lo que puede ejecutarse en GPUs con poca memoria.
- GPU recomendadas: no disponible. Cualquier GPU con al menos 1 GB de VRAM podría ser suficiente, aunque no se especifica.
- Compatibilidad con GPU de consumo: sí, probablemente en GPUs como RTX 3060 o inferiores, dado el tamaño del modelo.
- Opciones de despliegue: compatible con la librería transformers (PyTorch). Puede desplegarse con vLLM, TGI o convertirse a GGUF para su uso con llama.cpp u Ollama, aunque no se documenta soporte oficial.
- Latencia y throughput: solo se conoce la velocidad de inferencia declarada en GSM8K: 0,8 consultas por segundo (q/s).

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información disponible.

## Limitaciones y advertencias

- Puntuaciones muy bajas en benchmarks de razonamiento (ARC 24%, MMLU 16%), lo que indica capacidades limitadas de razonamiento y comprensión.
- Los benchmarks son declarados por el autor y no verificados de forma independiente.
- Solo soporta el idioma inglés.
- No se proporciona información sobre la longitud de contexto, tipos de cuantización ni formato de pesos.
- El modelo es experimental: tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere un uso limitado o una validación externa escasa.
- El diseño como agente autónomo con herramientas sandboxed implica que su uso en producción requiere precaución y medidas de seguridad adicionales.
- No se han evaluado sesgos conocidos ni riesgo de alucinación en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se debe cumplir con la atribución y las condiciones de la licencia.

## Enlaces

- HuggingFace: https://huggingface.co/clevrpwn/hume
- No se encontraron otros enlaces relevantes (papers, blogs, repositorios) en la búsqueda web.
