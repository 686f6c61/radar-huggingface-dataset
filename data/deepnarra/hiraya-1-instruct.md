# DeepNarra/Hiraya-1-Instruct

## Resumen

DeepNarra Hiraya-1-Instruct 1.0 es un modelo de lenguaje instructivo de tamaño reducido (908,6 millones de parámetros totales) desarrollado por la organización DeepNarra. Se trata de un ajuste fino (fase 3 de SFT y alineación agentica) del modelo base DeepNarra/Hiraya-1-H-MoE, una arquitectura propia denominada H-MoE-Zamba2-92-Expert-Nested-Hierarchical, que combina mezcla de expertos (MoE) con memoria recurrente de tipo Zamba2. Con aproximadamente 100 millones de parámetros activos por token, el modelo busca ofrecer capacidades de chat, razonamiento y agentes (incluidos agentes de escritorio y móvil) con un coste computacional muy bajo.

Su relevancia radica en la creciente demanda de modelos compactos y eficientes para despliegue en el borde (edge) y para agentes autónomos en entornos con recursos limitados. El entrenamiento se ha realizado mediante un curriculum de 14 "horizontes" de capacidades (fluidez en inglés, código, matemáticas, tool calling en JSON, agentes CUA/MUA, seguridad informática, etc.) con datasets públicos como FineWeb-Edu, No Robots, Aya Collection y CodeFeedback. El modelo se distribuye bajo licencia Apache 2.0 en formato safetensors, y la model card menciona además compatibilidad con GGUF para despliegue BitNet b1.58 en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-MoE-Zamba2-92-Expert-Nested-Hierarchical (MoE jerárquico anidado con memoria recurrente Zamba2) |
| Parametros totales | 908.645.372 (3,32 GB en safetensors, 1.331 tensores) |
| Parametros activos | ~100M por token (92 sub-expertos por capa + experto compartido persistente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF BitNet b1.58 mencionado para despliegue en el borde; no disponible detalle completo |
| Idiomas soportados | Inglés y multilingüe (polyglot, horizonte 9 del curriculum) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mencionado también GGUF en la licencia) |

## Arquitectura y entrenamiento

La arquitectura H-MoE-Zamba2-92-Expert-Nested-Hierarchical combina un diseño de mezcla de expertos con 92 sub-expertos por capa más un experto compartido persistente (fundación), anidado de forma jerárquica, sobre una base Zamba2 que incorpora memoria recurrente subcuadrática. Esto permite que, pese a tener 908M de parámetros totales, solo se activen ~100M por token, reduciendo el coste de inferencia. La model card menciona como líneas de investigación asociadas el razonamiento latente continuo, la decodificación especulativa y la memoria recurrente subcuadrática.

El ajuste fino instructivo se ejecutó mediante un curriculum de streaming de 14 horizontes: 250 iteraciones de empaquetado sobre 227 huellas criptográficas únicas de datos (sin desperdicio de padding, completadas en 49,6 segundos según la model card). El optimizador empleado fue Sophia (recorte de Hessiano de segundo orden) combinado con una puerta de pérdida adaptativa OHEM y escalado de focal loss. Los datasets de entrenamiento incluyen FineWeb-Edu (fluidez en inglés), No Robots (instrucciones y disciplina), Aya Collection (multilingüe), CodeFeedback-Filtered-Instruction (código y auditoría de vulnerabilidades), además de datos sintéticos verificados con SymPy para razonamiento matemático. No se detalla si hubo una fase posterior de RLHF/DPO.

## Capacidades

- Generación de texto conversacional (chat) alineada con instrucciones.
- Razonamiento multi-paso y matemáticas (curriculum con GSM8K y razonamiento sintético verificado con SymPy).
- Generación de código y algoritmos, con enfoque en Python educativo (StarCoder2/Stack v2, SmolLM Python-Edu).
- Tool calling estructurado en JSON para agentes.
- Agente de uso de ordenador (CUA) mediante tokens de acción `<click>` para navegación de escritorio.
- Agente de uso de móvil (MUA) mediante tokens de acción `<touch>` para navegación de interfaces móviles.
- Auditoría de seguridad y codificación segura (detección de vulnerabilidades sobre CodeFeedback).
- Capacidades multilingües (polyglot) basadas en Aya Collection y Tulu-3 Polyglot.
- Dominios especializados: ciencias duras y medicina (SciQ, PubMedQA), finanzas, derecho y contratos (FinQA, LegalBench), escritura creativa.
- Percepción visual y de documentos referenciada en el curriculum (LLaVA-Instruct), aunque no se detalla si el modelo final acepta entrada de imagen.
- Seguimiento estricto de restricciones (IFEval, No Robots).
- Ejecución de código y herramientas diseñada para el sandbox DeepNarra Airlock, con verificación estática AST y cortafuegos contra SSRF.

## Casos de uso

- Atención al cliente automatizada en recursos limitados: con ~100M de parámetros activos por token, el modelo puede gestionar conversaciones multi-turno de bajo coste en despliegues edge o locales donde un modelo de 7B no sería viable.
- Agentes de automatización de escritorio: los tokens de acción CUA (`<click>`) permiten construir agentes que navegan interfaces de escritorio, adecuados para RPA de bajo coste dentro del sandbox Airlock.
- Agentes de automatización móvil: los tokens MUA (`<touch>`) permiten agentes que interactúan con interfaces móviles para pruebas automatizadas de UI o flujos de asistencia.
- Asistente de programación en local: generación de código Python y detección de vulnerabilidades para integrar en editores locales o pipelines de revisión de código con presupuesto de cómputo mínimo.
- Tool calling en JSON para orquestación de agentes: el modelo puede integrarse en frameworks agenticos que requieran llamadas a funciones estructuradas, con verificación AST previa a la ejecución.
- Asistente multilingüe compacto: gracias al horizonte polyglot entrenado con Aya, puede servir para chat multilingüe básico en dispositivos con GPU modesta.
- Investigación en arquitecturas MoE híbridas y razonamiento latente continuo: la model card declara explícitamente como uso previsto la investigación en memoria recurrente subcuadrática y decodificación especulativa.
- Despliegue en el borde con cuantización extrema: la compatibilidad mencionada con GGUF BitNet b1.58 apunta a ejecución en dispositivos muy limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara una política de "Zero Fake Scores" (solo hechos de ingeniería verificables) pero no incluye puntuaciones en MMLU, HumanEval, GSM8K u otras pruebas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,32 GB de pesos en FP16/BF16 y ~100M de parámetros activos por token, se estima que 4-6 GB de VRAM son suficientes para inferencia en precisión completa; con cuantización (BitNet b1.58 u otras) podría reducirse aún más. Cifra no confirmada oficialmente.
- GPU recomendadas: por su tamaño, cualquier GPU de consumo moderna debería bastar (RTX 3060, RTX 4060 o superiores); no se requieren A100 ni H100 para inferencia.
- Consumer GPU: sí, cabe con holgura en GPUs de consumo con 6 GB de VRAM o más, e incluso en portátiles con GPU dedicada modesta.
- Opciones de despliegue: librería `transformers` de Hugging Face (carga directa de safetensors según el quickstart de la model card). No se documenta soporte verificado para vLLM, TGI, llama.cpp u Ollama; la mención a GGUF sugiere compatibilidad potencial con runtimes basados en llama.cpp, pero no está confirmada.
- Latencia y throughput: no disponible. Dado el bajo número de parámetros activos (~100M/token), cabría esperar latencias bajas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| DeepNarra Hiraya-1-Instruct 1.0 | 908,6M | ~100M/token | no disponible | Apache 2.0 | MoE híbrido Zamba2, tokens CUA/MUA, sin benchmarks publicados |
| Qwen2.5-0.5B-Instruct | ~494M (densos) | 494M | 32.768 tokens | Apache 2.0 (parcialmente Qwen Research en algunos casos) | Denso, benchmarks públicos amplios, ecosistema maduro |
| SmolLM2-1.7B-Instruct | ~1.710M (densos) | 1.710M | 8.192 tokens | Apache 2.0 | Denso, buen rendimiento para su tamaño, sin capacidades agentivas CUA/MUA nativas |
| OLMo-2-1B-Instruct (AI2) | ~1.480M (densos) | 1.480M | 4.096 tokens | Apache 2.0 | Totalmente abierto (datos y receta), sin MoE |

Hiraya-1-Instruct se diferencia por su arquitectura MoE híbrida con pocos parámetros activos y su enfoque agentivo (CUA/MUA), pero carece de la trazabilidad de benchmarks de las alternativas densas mencionadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar el rendimiento real frente a modelos competidores; la propia model card solo garantiza "hechos de ingeniería verificables", no calidad de salida.
- Riesgo de alucinación elevado al tratarse de un modelo experimental entrenado con presupuesto de cómputo reducido; la model card recomienda verificación independiente en dominios médicos, legales, financieros o de seguridad crítica.
- Sesgos conocidos: no disponible; no se ha publicado ninguna evaluación de sesgos.
- Longitud de contexto no documentada, lo que dificulta evaluar su idoneidad para tareas de contexto largo pese a que el curriculum incluye un horizonte de "memoria de trabajo de contexto largo".
- La licencia del modelo es Apache 2.0 (uso comercial permitido), pero el dataset No Robots está atribuido bajo CC-BY-NC-4.0, lo que puede generar una zona gris sobre la derivabilidad comercial del alineamiento instructivo.
- Las capacidades de ejecución de código y tool calling están diseñadas para ejecutarse exclusivamente en el sandbox DeepNarra Airlock; usarlas fuera de un entorno aislado conlleva riesgos de seguridad.
- Proyecto de organización poco conocida con descargas limitadas (~1.258): la madurez del ecosistema (soporte de runtimes, plantillas de chat, documentación) es limitada y puede requerir ingeniería propia para producción.
- La mención a capacidades de percepción visual (LLaVA-Instruct) no está confirmada como entrada multimodal en el modelo final; no disponible confirmación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DeepNarra/Hiraya-1-Instruct
- Organización DeepNarra: https://huggingface.co/DeepNarra
- Modelo base: https://huggingface.co/DeepNarra/Hiraya-1-H-MoE
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
  - https://huggingface.co/datasets/HuggingFaceH4/no_robots
  - https://huggingface.co/datasets/CohereForAI/aya_collection
  - https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
