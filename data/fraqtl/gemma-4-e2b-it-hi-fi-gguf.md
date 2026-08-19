# fraQtl/Gemma-4-E2B-it-Hi-Fi-GGUF

## Resumen

Gemma-4-E2B-it-Hi-Fi-GGUF es una cuantización GGUF del modelo Gemma-4-E2B-it de Google, producida por fraQtl con una técnica propia de cuantización consciente de calibración (calibration-aware quantization). El objetivo es maximizar la fidelidad al modelo original en bf16 manteniendo el mismo tamaño de archivo que las cuantizaciones comunitarias estándar. Según las mediciones del autor, esta versión Q4_K_M reduce la divergencia KL (KLD) en un 36% para tareas de código/matemáticas y un 27,2% en general respecto a la cuantización Q4_K_M de bartowski, con un tamaño prácticamente idéntico (−0,03%).

El modelo base, Gemma-4-E2B-it, es un modelo de 4.647 millones de parámetros diseñado para ejecución en dispositivos edge (móviles, portátiles) con capacidades de tool-calling, generación de código y razonamiento. La cuantización de fraQtl está pensada para su uso offline en iPhone y otros dispositivos con recursos limitados, demostrando 21,6 tokens/s sostenidos en un iPhone 16 con 516 MB de memoria residente. Incluye tres artefactos: el Q4_K_M de tamaño iso (3,46 GB), una variante "Phone" más pequeña (2,86 GB) y una variante "SmartEdge" IQ3XXS (2,45 GB). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 256K tokens (segun especificaciones de Gemma 4) |
| Tipos de cuantizacion | Q4_K_M, IQ3XXS (SmartEdge) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Gemma-4-E2B-it es un transformer denso de 4.647 millones de parametros desarrollado por Google, optimizado para inferencia en dispositivos edge. Segun la documentacion oficial de Gemma 4, la familia incluye arquitecturas densas y MoE, con soporte de contexto hasta 256K tokens y capacidades multilingues en mas de 140 idiomas, aunque esta cuantizacion especifica solo declara soporte para ingles. El entrenamiento del modelo base incluye fases de preentrenamiento y ajuste instructivo con tecnicas de RLHF/DPO, aunque los detalles exactos del dataset no se especifican en la informacion disponible.

La contribucion de fraQtl reside en la cuantizacion: en lugar de aplicar los umbrales fijos de llama.cpp para decidir la precision por tensor, realiza un analisis de calibracion que determina la precision optima de cada tensor (Q4_K, Q5_K, Q6_K, etc.) para minimizar la divergencia KL respecto al modelo original en bf16. El resultado es un archivo GGUF con el mismo mecanismo Q4_K_M de llama.cpp pero con decisiones de precision por tensor basadas en datos de calibracion, logrando una fidelidad significativamente mayor sin aumentar el tamano. Las metricas de KLD se calcularon con un teacher Q8_0 del checkpoint bf16 original, sobre soporte de top-20 tokens, con tres ejecuciones y deriva cero.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto largo (hasta 256K tokens en el modelo base).
- Tool-calling / function calling: el modelo puede invocar funciones externas, como se demuestra en la gestion de calendario (buscar huecos, crear eventos, mover citas).
- Razonamiento multi-paso: capaz de ejecutar instrucciones compuestas (por ejemplo, "mueve la reunion y anade un recordatorio") mediante un codigo deterministico que ejecuta las acciones.
- Generacion de codigo offline: demostrado con la generacion del algoritmo de Dijkstra en C++ a ~11 tok/s interactivo.
- Comprension de documentos y fotos (segun la demo, puede leer documentos y fotos, aunque la modalidad de vision no esta confirmada en la model card).
- Capacidad de reconocer sus propias limitaciones: el modelo indica explicitamente cuando no tiene acceso a ciertos recursos (por ejemplo, "no tengo acceso a tus emails").
- Personalidad y respuestas con contexto: cada respuesta incluye una etiqueta de contexto (por ejemplo, `no connectors`).

## Casos de uso

- Asistente de voz offline en moviles: el modelo puede procesar entrada de voz, generar respuestas habladas y ejecutar acciones locales (crear eventos, buscar informacion) sin conexion a internet, como se demuestra en la demo de iPhone en modo avion.
- Gestion de calendario personal: el modelo puede interpretar peticiones en lenguaje natural ("encuentra un hueco el jueves para la reunion de VC"), buscar espacios libres, crear eventos y confirmar la accion con un recibo verificable.
- Generacion de codigo en entornos sin conexion: desarrolladores que trabajan en aviones o zonas sin cobertura pueden generar fragmentos de codigo, algoritmos o documentacion tecnica con un modelo local de 3,5 GB.
- Automatizacion de tareas de oficina: el modelo puede ejecutar acciones deterministas (mover eventos, crear recordatorios, cambiar titulos) a partir de instrucciones conversacionales, con un codigo de capa que verifica cada escritura.
- Chatbot de atencion al cliente en dispositivos edge: empresas que necesitan un asistente local que no envie datos a la nube pueden desplegar este modelo en tablets o quioscos, con respuestas en ingles y capacidades de tool-calling para consultar bases de datos locales.
- Prototipado rapido de agentes con tool-calling: investigadores y desarrolladores pueden usar este GGUF con llama.cpp para probar flujos de agente (planificacion, ejecucion de herramientas, verificacion) en hardware modesto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta cuantizacion especifica. El autor proporciona metricas de fidelidad basadas en divergencia KL (KLD) respecto al modelo original bf16, comparando con la cuantizacion Q4_K_M de bartowski:

| Artefacto | Tamano (bytes) | bpw real | KLD code/math | KLD general | Diferencia vs baseline |
|---|---:|---:|---:|---:|---|
| fraQtl HiFi Q4_K_M (iso-size) | 3.461.675.328 | 5,93 | 0,05846 | 0,09646 | −36,0% / −27,2% |
| fraQtl HiFi Phone | 2.856.122.688 | 4,89 | 0,06231 | 0,09716 | −31,8% / −26,7% (y 17,5% mas pequeno) |
| bartowski Q4_K_M (baseline) | 3.462.678.272 | 5,93 | 0,09139 | 0,13249 | — |

La metrica KLD se calcula como divergencia KL simetrica sobre el soporte de top-20 tokens con un teacher Q8_0 del checkpoint bf16 original, promediada sobre posiciones. Valores mas bajos indican mayor fidelidad. En el dispositivo de prueba (iPhone 16), el modelo alcanza 21,6 tok/s sostenidos en un benchmark de 256 tokens greedy (umbral de paso: ≥15 tok/s) y ~12 tok/s interactivos (incluyendo prefill), con 516 MB de memoria residente.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto Q4_K_M de 3,46 GB requiere aproximadamente 4-5 GB de RAM/VRAM en total (incluyendo overhead de ejecucion). La variante Phone de 2,86 GB y la SmartEdge de 2,45 GB reducen los requisitos a unos 3-4 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 2060, RTX 3060, RTX 4060, etc.) puede ejecutar el modelo sin problemas. En Apple Silicon, funciona via Metal con 8 GB unificados o mas.
- En dispositivos moviles: demostrado en iPhone 16 con 516 MB de memoria residente, usando llama.cpp con backend Metal y mmap.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF), Ollama, LM Studio, llama-cpp-python, y cualquier framework compatible con GGUF. Tambien puede usarse con vLLM si se convierte a otro formato, aunque no es el caso de uso principal.
- Latencia y throughput: 21,6 tok/s sostenidos en iPhone 16 (256 tokens greedy), ~12 tok/s interactivos. En GPU desktop se esperan cifras superiores, aunque no se proporcionan datos especificos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Fidelidad (KLD) |
|---|---|---|---|---|---|
| Gemma-4-E2B-it (bf16 original) | 4,65B | 256K | — | Apache 2.0 | Referencia |
| fraQtl HiFi Q4_K_M (este modelo) | 4,65B | 256K | Q4_K_M calibrado | Apache 2.0 | 0,058 (code/math) |
| bartowski Q4_K_M (comunidad) | 4,65B | 256K | Q4_K_M estandar | Apache 2.0 | 0,091 (code/math) |
| Qwen2.5-3B-Instruct (GGUF) | 3,09B | 32K | Q4_K_M | Apache 2.0 | no disponible |

La comparativa se centra en la misma familia de cuantizaciones del mismo modelo base. La ventaja de fraQtl es una fidelidad significativamente mayor al original con el mismo tamano de archivo. Frente a modelos de tamano similar de otras familias (como Qwen2.5-3B), no hay datos de rendimiento comparativo disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte para ingles. No se garantiza un rendimiento adecuado en otros idiomas, a pesar de que el modelo base Gemma 4 soporta 140+ idiomas.
- Sin acceso a recursos externos: por diseno, el modelo no tiene conectores a email, mensajeria o red. Si se necesita integracion con servicios externos, debe implementarse una capa de codigo adicional.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion incorrecta o inventada, especialmente en tareas de conocimiento general. La capa de recibos (receipt chips) mitiga parcialmente este riesgo en acciones criticas, pero no elimina la posibilidad de errores en respuestas de texto libre.
- Contexto largo: aunque el modelo base soporta hasta 256K tokens, la cuantizacion puede degradar ligeramente la calidad en contextos muy largos. No se han publicado pruebas especificas de rendimiento con ventanas de contexto extremas.
- Dependencia de la capa de ejecucion: las capacidades de tool-calling y ejecucion de acciones requieren un codigo deterministico externo que interprete las salidas del modelo. Sin esa capa, el modelo solo genera texto.
- Verificacion de integridad: se recomienda verificar el checksum sha256 de los artefactos descargados antes de su uso en produccion, como hace la demo del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fraQtl/Gemma-4-E2B-it-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Documentacion de Gemma 4 (Google AI): https://ai.google.dev/gemma/docs/core/model_card_4
- Pagina de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Guia de Gemma 4 E2B: https://www.gemma4.wiki/models/gemma-4-e2b
