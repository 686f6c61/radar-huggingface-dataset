# SatRag/chat-doctor-q4

## Resumen

ChatDoctor Q4 (SatRag/chat-doctor-q4) es una cuantización en formato GGUF de 4 bits del modelo base google/gemma-4-E2B, publicada por el usuario SatRag bajo licencia Apache 2.0. Se trata de un derivado conversacional orientado a dominio sanitario, según se desprende del nombre del repositorio, aunque la model card no documenta el proceso de ajuste ni el corpus utilizado. El repositorio ocupa 8,4 GB y declara 4.628.569.635 parámetros reales en safetensors, un dato que no es coherente con la nomenclatura "E2B" del modelo base y que conviene verificar antes de cualquier despliegue.

La relevancia de esta ficha es limitada pero concreta: ofrece una vía de bajo coste para ejecutar un modelo de la familia Gemma 4 en hardware de consumo mediante cuantización Q4, con compatibilidad declarada con endpoints. Sin embargo, la información pública es muy escasa (21 descargas, 1 like, sin pipeline declarado, sin idiomas especificados y sin benchmarks), por lo que debe tratarse como un artefacto experimental y no como un modelo listo para producción clínica.

La ficha se ha redactado exclusivamente a partir de los metadatos disponibles en Hugging Face. Cualquier dato no confirmado se marca explícitamente como "no disponible" en lugar de inferirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de google/gemma-4-E2B; no se detalla en la model card) |
| Parametros totales | 4.628.569.635 (dato declarado en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (GGUF); no se especifica el subtipo exacto (Q4_0, Q4_K_M, etc.) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 8,4 GB); el dato de parametros procede de safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base google/gemma-4-E2B en la documentación proporcionada: no se confirma si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura híbrida. La nomenclatura "E2B" sugiere una variante eficiente de 2 mil millones de parámetros, pero el recuento declarado en safetensors (4.628.569.635) apunta a un orden de magnitud distinto, por lo que existe una discrepancia no resuelta que el autor no aclara.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card se limita a indicar que se trata de la versión Q4 de ChatDoc, sin detallar el proceso de cuantización (herramienta empleada, calibración, nivel de degradación esperado) ni el ajuste conversacional o sanitario que justificaría el nombre del repositorio. Todo ello debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional: el tag "conversational" confirma el uso previsto como modelo de diálogo multi-turno.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que puede servirse a través de infraestructura de inferencia estándar.
- Capacidades de razonamiento, código y matemáticas: no disponible (no documentadas).
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas está vacío).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Orientación sanitaria: inferida únicamente del nombre "chat-doctor" y "ChatDoc"; no confirmada por la model card.

## Casos de uso

- Despliegue local de un asistente conversacional en hardware de consumo: el formato GGUF en Q4 permite ejecutar el modelo con llama.cpp u Ollama en equipos sin GPU dedicada de gran VRAM, lo que facilita prototipado rápido.
- Experimentación académica con cuantización: útil para medir la degradación de calidad de un modelo Gemma 4 al pasar a 4 bits, siempre que se disponga del modelo base original para comparar.
- Chatbot de triaje informativo no diagnóstico: podría emplearse como capa de conversación para orientar al usuario hacia recursos sanitarios, con revisión humana obligatoria y avisos legales explícitos.
- Generación de borradores de texto administrativo sanitario: redacción de resúmenes o plantillas de comunicación con pacientes, sujeto a validación por personal cualificado.
- Integración en pipelines de CI/CD para pruebas de regresión conversacional: al ser un GGUF ligero, puede levantarse en contenedores para validar respuestas ante cambios de prompt.
- Base para fine-tuning posterior: al estar bajo Apache 2.0, permite adaptaciones comerciales, aunque la escasa documentación obliga a validar primero el comportamiento del modelo.
- Evaluación comparativa de cuantizaciones: sirve como punto de referencia Q4 frente a otras variantes del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos GGUF Q4 y un tamaño de repo de 8,4 GB, se requiere un mínimo de aproximadamente 9-10 GB de memoria (VRAM o RAM unificada) para cargar los pesos, más overhead de contexto KV.
- GPU recomendadas: no disponible (no hay datos oficiales); por tamaño, cabría en RTX 3090, RTX 4090, A10G, L4 o superiores.
- GPU de consumo: previsiblemente compatible con RTX 4090 (24 GB) y RTX 3090 (24 GB); en GPUs de 8-12 GB requeriría offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con infraestructura de endpoints estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SatRag/chat-doctor-q4 | 4.628.569.635 (declarados) | no disponible | Apache 2.0 | GGUF Q4 | Cuantización comunitaria, sin benchmarks |
| google/gemma-4-E2B | no disponible | no disponible | no disponible | safetensors | Modelo base original; referencia para comparar degradación |
| Otras cuantizaciones Q4 de Gemma 4 | no disponible | no disponible | Apache 2.0 (presumible) | GGUF | No se han identificado alternativas documentadas en la información disponible |

No se dispone de datos suficientes para comparar rendimiento con modelos de la misma categoría.

## Limitaciones y advertencias

- Discrepancia de parámetros: el recuento declarado (4.628.569.635) no encaja con la nomenclatura "E2B" del modelo base; verificar antes de dimensionar infraestructura.
- Documentación mínima: la model card no describe el ajuste, el dataset ni el proceso de cuantización, lo que impide auditar el modelo.
- Riesgo de alucinación: inherente a los modelos generativos; crítico en un contexto sanitario donde una respuesta errónea puede causar daño.
- Sin validación clínica: no hay evidencia de evaluación médica, regulatoria ni de seguridad; no debe usarse para diagnóstico ni consejo médico.
- Idiomas no declarados: se desconoce si el modelo conserva el multilingüismo del base o si el ajuste lo ha restringido.
- Contexto desconocido: la longitud de ventana no está documentada, lo que limita el diseño de aplicaciones multi-turno largas.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base (Gemma) puede imponer condiciones adicionales que el autor no detalla; revisar los términos de Google antes de explotación comercial.
- Madurez: 21 descargas y 1 like indican un artefacto sin validación comunitaria; tratar como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/SatRag/chat-doctor-q4
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
