# d4ydy/sixthphysics-qwen3.5-9b-GGUF

## Resumen

SixthPhysics-Qwen3.5-9B-GGUF es una compilación cuantizada en formato GGUF del modelo SixthPhysics-Qwen3.5-9B, un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-9B. Lo desarrolla el autor independiente d4ydy como parte del proyecto SixthPhysics, una iniciativa no oficial de generación sintética de preguntas de física para nivel preuniversitario. El modelo resuelve un problema muy concreto: generar preguntas de física verificables por solver y renderizables en SVG dentro de un harness neuro-simbólico de dos turnos, cubriendo simultáneamente tres especificaciones educativas (IB Physics 2025, A-Level británico según el núcleo AQA 7408 y el International Foundation Year de NCUK).

La relevancia del modelo es doble. Por un lado, demuestra un caso de uso verticalizado de un LLM de 9 mil millones de parámetros ajustado para una tarea estructurada con salida JSON limpia. Por otro, ofrece builds GGUF listos para inferencia local en CPU y GPU de consumo, con cuantizaciones Q4_K_M, Q6_K y Q8_0, lo que lo hace accesible sin infraestructura de servidor. El modelo base Qwen3.5-9B aporta la arquitectura y el conocimiento general; el LoRA añade el comportamiento específico de la tarea.

El modelo tiene 8.953.803.264 parámetros totales (según los safetensors del modelo base), está entrenado únicamente en inglés y se distribuye bajo licencia Apache 2.0. El repositorio GGUF ocupa 22,6 GB e incluye los tres archivos cuantizados, un Modelfile para Ollama y utilidades de despliegue. La fecha de creación del repositorio es el 18 de noviembre de 2026 y la última actualización el 26 de noviembre de 2026, con 372 descargas registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B, ajuste fino LoRA fusionado; torre de visión congelada, backbone de texto exportado) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuración recomendada en Modelfile y ejemplos de despliegue) |
| Tipos de cuantizacion | Q4_K_M (5,68 GB), Q6_K (7,36 GB), Q8_0 (9,53 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama, LM Studio); el LoRA original está en bf16 safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de 9 mil millones de parámetros con torre de visión. Sobre él se aplicó un ajuste fino LoRA identificado como `round1_sft_core`, que posteriormente se fusionó de forma limpia en el modelo base en bf16. Para la exportación GGUF se congeló la torre de visión y se exportó únicamente el backbone de texto, de modo que las builds distribuidas son modelos de texto puro orientados a inferencia local en CPU y GPU de consumo.

El entrenamiento se orienta al harness neuro-simbólico de dos turnos de SixthPhysics: el turno 1 (`propose_scenario`) propone un escenario y el turno 2 (`author_package`) genera el paquete de pregunta en JSON. El adaptador campeón se entrenó con el prefijo vacío de razonamiento de Qwen3.5 (`\n\n`) para que ambos turnos emitan JSON crudo limpio de inmediato; por ello se recomienda desactivar el modo thinking en inferencia. Los datos de entrenamiento provienen del dataset `d4ydy/sixthphysics-bench-and-bank`, de elaboración sintética y declarado libre de material con copyright de IB, AQA, Pearson Edexcel, OCR, Cambridge, WJEC o NCUK. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset, ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto estructurado en JSON para dos turnos encadenados: propuesta de escenario y autoría del paquete de pregunta.
- Generación de preguntas de física alineadas con tres especificaciones preuniversitarias: IB Physics (First Assessment 2025, SL y HL), A-Level británico (núcleo AQA 7408, Year 12 y Year 13) y NCUK IFY Physics (IFYPH005, semestres 1 y 2).
- Soporte de formatos de pregunta MCQ y estructurado (`structured`), según los ejemplos del harness.
- Integración con herramientas externas mediante el harness neuro-simbólico: las preguntas generadas se validan con un solver y se renderizan en SVG.
- Soporte de tool calling y function calling a través del protocolo OpenAI-compatible expuesto por llama.cpp (`--jinja`), Ollama y LM Studio.
- Capacidad de operar como agente multi-turno dentro del pipeline cerrado de SixthPhysics, con verificación automática de resultados.
- Manejo de convenciones físicas específicas por especificación, como la diferencia de `g` entre IB (9,8 m s^-2) y A-Level/NCUK (9,81 m s^-2).
- Modo thinking desactivable; el modelo está optimizado para `enable_thinking=False`.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.

## Casos de uso

- Generación automática de bancos de preguntas de física para IB, A-Level y NCUK: el modelo produce paquetes JSON que el harness valida con solver y renderiza en SVG, lo que permite crear material de práctica a escala sin revisión manual pregunta a pregunta.
- Plataforma de práctica en vivo (sixthphysics.co.uk): el modelo sirve preguntas generadas al vuelo con corrección automática, aprovechando la ventana de 8192 tokens para mantener el contexto del escenario y del paquete de respuesta.
- Creación de evaluaciones formativas para docentes: un profesor puede solicitar preguntas de un tema y nivel concretos (por ejemplo, `ib-theme-c` en HL o `mechanics` en Year 13) y obtener ítems estructurados listos para importar en un LMS.
- Despliegue local en aulas o laboratorios sin conexión: con la cuantización Q4_K_M (5,68 GB) el modelo cabe en GPU de 8 GB o en un MacBook con 16 GB de memoria unificada, lo que permite ejecutarlo en equipos docentes sin depender de la nube.
- Integración en pipelines de generación de contenido editorial: el formato JSON limpio y determinista (temperatura 0,0 recomendada) facilita la inserción de preguntas generadas en flujos de publicación con revisión humana posterior.
- Prototipado de asistentes educativos especializados: sirve como referencia de cómo adaptar un modelo generalista de 9B a un dominio técnico con un LoRA y un harness de verificación, replicable en otras asignaturas.
- Investigación en generación neuro-simbólica: el par dataset/benchmark `sixthphysics-bench-and-bank` y las métricas publicadas permiten reproducir y comparar estrategias de ajuste fino para tareas de generación verificable.

## Benchmarks y rendimiento

Resultados publicados en la model card del adaptador LoRA en bf16, sobre Modal H100, con particiones disjuntas por familia y cero contaminación:

| Split y protocolo | Qwen3.5-9B sin ajustar (E2E) | Campeón `round1_sft_core` (E2E) | Alineación con el temario (campeón) |
|---|---:|---:|---:|
| `test.jsonl` bloqueado, 0 reintentos (N = 586, 28 familias no vistas) | 0,00 % | 64,51 % [60,55 %, 68,27 %] | 78,50 % (100,00 % de las resueltas) |

No se han publicado en la información disponible resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM/RAM estimada para Q4_K_M: ~7,5 GB con contexto de 8K; encaja en GPU de 8 GB o MacBook con 16 GB de memoria unificada.
- VRAM/RAM estimada para Q6_K: ~9,5 GB con contexto de 8K; requiere GPU de 10-12 GB o 16 GB de memoria unificada.
- VRAM/RAM estimada para Q8_0: ~11,5 GB con contexto de 8K; requiere GPU de 12-16 GB o 16+ GB de RAM.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; los benchmarks del adaptador se ejecutaron en H100 (Modal). Por tamaño, cualquier GPU consumer con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante) puede ejecutar la cuantización Q4_K_M.
- Cabe en GPU de consumo: sí, con Q4_K_M en 8 GB y Q6_K/Q8_0 en 10-16 GB.
- Opciones de despliegue: Ollama (`ollama run hf.co/d4ydy/sixthphysics-qwen3.5-9b-GGUF:Q4_K_M`), llama.cpp (`llama-server` con `--ctx-size 8192 --jinja --reasoning off`), LM Studio (servidor local en `http://127.0.0.1:1234/v1`) y cualquier backend compatible con la API de OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| SixthPhysics-Qwen3.5-9B-GGUF | 8.953.803.264 | 8192 (recomendado) | Apache 2.0 | GGUF | Física preuniversitaria, harness neuro-simbólico |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | no disponible | safetensors | Modelo generalista multilingüe |
| d4ydy/sixthphysics-qwen3.5-9b-lora | ~9B | no disponible | Apache 2.0 | safetensors (bf16) | Adaptador LoRA de la misma tarea, sin cuantizar |

No se dispone en la información proporcionada de otros modelos comparables de la misma categoría (generación de preguntas de física verificables) con datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no se declaran capacidades en castellano ni en otros idiomas.
- Es un modelo de dominio muy específico: fuera de la generación de preguntas de física para IB, A-Level y NCUK, su comportamiento puede degradarse respecto al modelo base.
- Requiere desactivar el modo thinking (`enable_thinking=False`, `--reasoning off`, `think: false`) para obtener JSON limpio; con thinking activado la salida puede no ajustarse al formato esperado.
- Riesgo de alucinación en contenido físico: aunque el harness valida con solver, las preguntas generadas fuera del pipeline de verificación deben revisarse manualmente.
- El proyecto es independiente y no oficial; no está afiliado ni respaldado por IB, AQA, Pearson Edexcel, OCR, Cambridge, WJEC o NCUK, y no se entrenó con material con copyright de estas entidades.
- La torre de visión está congelada y no se exporta en las builds GGUF: el modelo distribuido es solo de texto.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud física del contenido generado.
- La fecha de creación del repositorio (noviembre de 2026) y el modelo base Qwen3.5-9B implican que la información de benchmarks generalistas puede no estar consolidada; conviene verificar el estado del modelo base antes de usarlo en producción.
- El contexto recomendado es de 8192 tokens; no se documenta soporte para ventanas mayores en estas builds.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/d4ydy/sixthphysics-qwen3.5-9b-GGUF
- Adaptador LoRA en bf16: https://huggingface.co/d4ydy/sixthphysics-qwen3.5-9b-lora
- Dataset y benchmark: https://huggingface.co/datasets/d4ydy/sixthphysics-bench-and-bank
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Aplicación de práctica en vivo: https://sixthphysics.co.uk
- Código fuente del proyecto: https://github.com/sixthphysics/sixthphysics
