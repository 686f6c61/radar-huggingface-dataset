# medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic

## Resumen

`medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic` es un checkpoint finetuneado sobre `OBLITERATUS/Qwen3.8-27B-OBLITERATED`, que a su vez deriva de `Qwen/Qwen3.8-27B`. El autor, `medismera`, lo presenta como una configuración de "producción" que repara los defectos de function calling, truncamiento del chat template y parseo de razonamiento presentes en el checkpoint abliterated original. Incorpora un protocolo de auto-revisión adversarial (Mythos-Class), un motor de descomposición jerárquica de tareas y una ventana de contexto ampliada.

El modelo base es un modelo denso de 27.781.427.952 parámetros, con contexto nativo de hasta 262.144 tokens según la documentación. Esta configuración añade un chat template canónico de 9.4KB con 22 rutas de resolución de tool calling, y extiende la generación máxima a 16.384 tokens por turno. Los pesos se distribuyen en formato Safetensors, con ramas de cuantización BF16, FP8 y AWQ, pensadas para despliegue en SGLang, vLLM o LMDeploy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible; basado en Qwen3.8-27B, tags indican Mamba y atención lineal |
| Parametros totales | 27.781.427.952 (~27,78B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 262.144 tokens (256K nativo); probado en producción a 131.072 (128K) |
| Tipos de cuantizacion | BF16, FP8 y AWQ (ramas main, fp8, awq) |
| Idiomas soportados | Inglés (en), chino (zh), árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16: 29 shards; FP8: 2 shards; AWQ: MTP + Marlin) |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento desde cero, sino una capa de personalización sobre `OBLITERATUS/Qwen3.8-27B-OBLITERATED`, que es una versión abliterated de `Qwen/Qwen3.8-27B`. La documentación no detalla el proceso de entrenamiento (tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La innovación técnica principal reside en el chat template de 9.4KB con 22 rutas de tool calling, el protocolo Mythos-Class de auto-revisión adversarial y el motor de descomposición jerárquica de tareas, incrustados directamente en la tokenización.

Según los tags del repositorio, el modelo base incorpora componentes `mamba` y `linear-attention`, lo que sugiere una arquitectura híbrida con modelos de espacio de estado y atención lineal, aunque no se publica una especificación arquitectónica detallada en la documentación del finetune.

## Capacidades

- Generación de texto conversacional en inglés, chino y árabe.
- Tool calling / function calling nativo, con 22 rutas de resolución y compatibilidad con Hermes Agent, Aider y OpenCode.
- Modo de razonamiento con etiquetas `<think>` y protocolo Mythos-Class de auto-revisión adversarial, diseñado para evitar bucles de pensamiento y terminar con respuestas ejecutables.
- Descomposición jerárquica de tareas (Task Tree) para tareas multi-paso: reconoce fases de reconocimiento, análisis, implementación y validación.
- Contexto largo: hasta 262.144 tokens nativo, con prueba de producción a 131.072 tokens, adecuado para repositorios completos o conversaciones extensas.
- Generación ampliada: hasta 16.384 tokens en un solo turno.
- Ajustes de sampling optimizados: `temperature: 0.65`, `rep_penalty: 1.15`, `pres_penalty: 0.15` para reducir bucles.
- Despliegue optimizado en SGLang y vLLM con parsers específicos para razonamiento y tool calling (`qwen3`, `qwen3_coder`, `hermes`).
- Carácter "uncensored" / abliterated: el modelo no rechaza peticiones por alineación, lo que permite salidas sin filtros de seguridad.

## Casos de uso

- Agentes de desarrollo de software: integración con Aider u OpenCode para autocompletar, refactorizar y ejecutar tests. El tool calling nativo permite leer, escribir y ejecutar código sin intervención manual.
- Pentesting autorizado: con la Task Tree Decomposition, el modelo puede seguir fases de reconocimiento, análisis de vulnerabilidades, generación de exploits y validación. Requiere uso en entornos autorizados y supervisados.
- Atención al cliente automatizada: puede gestionar conversaciones largas gracias a la ventana de contexto de 128K, consultar APIs de backend mediante tool calling y resolver tickets complejos en un solo turno.
- Análisis de repositorios grandes: mantiene 131.072 tokens de contexto, lo que permite leer y razonar sobre código fuente extenso, generar documentación, detectar dependencias o localizar errores.
- Investigación técnica y redacción de informes: el protocolo adversarial de auto-revisión contrasta hipótesis y genera análisis rigurosos, como revisiones de arquitecturas o informes de investigación técnica.
- Asistentes de razonamiento para análisis de seguridad: revisar código en busca de vulnerabilidades, seguir un árbol de tareas y ejecutar herramientas de escaneo (nmap, curl) mediante tool calling, con validación posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La documentación no incluye resultados de MMLU, HumanEval, GSM8K u otras evaluaciones. La única métrica de rendimiento disponible es el consumo de VRAM por cuantización y la compatibilidad con motores de inferencia.

## Requisitos de hardware

- BF16 (main): ~60 GB VRAM; requiere 2x A100, 2x RTX 4090 o H100; soporta SGLang, vLLM, TGI y TRT-LLM.
- FP8 (rama fp8): ~30 GB VRAM; requiere 1x A100 (40GB/80GB) o 2x RTX 3090/4090; soporta SGLang y vLLM.
- AWQ (rama awq): ~16 GB VRAM; cabe en una sola GPU de 24GB (RTX 3090, RTX 4090, A5000); soporta SGLang, vLLM y LMDeploy.
- Despliegue recomendado: SGLang para agentes y RadixAttention; vLLM para API compatible OpenAI.
- No se ofrecen pesos GGUF; el repo está estandarizado en Safetensors, lo que limita el despliegue en llama.cpp o exclusivamente en CPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Característica | Mythos-Class-Agentic (este modelo) | Upstream OBLITERATUS/Qwen3.8-27B-OBLITERATED | Qwen/Qwen3.8-27B (base) |
|---|---|---|---|
| Chat template | 9.4KB con 22 rutas de tool calling | Stub truncado de 506 bytes | No documentado |
| Tool calling | 100% nativo (Hermes, Aider, OpenCode) | Roto, con drop de role tool | No documentado |
| Razonamiento | Protocolo Mythos-Class | Bucles infinitos de CoT | No documentado |
| Contexto | 262.144 nativo, probado a 131.072 | 32.768 nativo | No documentado |
| Salida máxima | 16.384 tokens | 8.192 por defecto | No documentado |
| Licencia | Apache 2.0 | No documentada | No documentada |

No se han publicado benchmarks que permitan comparar el rendimiento con alternativas de la misma categoría. La comparativa se limita a las características documentadas en la model card.

## Limitaciones y advertencias

- Al estar abliterated y marcado como "uncensored", se eliminan los mecanismos de rechazo de contenido peligroso del modelo original, lo que implica riesgo de generar contenido dañino, ilegal o no ético. No es apto para uso sin supervisión.
- No se han publicado evaluaciones de sesgos; el riesgo de sesgos heredados del modelo original no está mitigado ni documentado.
- Riesgo de alucinación: no hay datos de evaluación; el modelo puede generar respuestas incorrectas, especialmente en tareas complejas o con herramientas externas.
- Idiomas: solo se declaran inglés, chino y árabe. El rendimiento en otros idiomas es desconocido.
- No se documentan capacidades de visión, a pesar de que el modelo base Qwen3.8-27B es vision-language; esta configuración finetune está orientada a text-generation.
- La dependencia de un chat template personalizado de 9.4KB y parsers específicos (qwen3_coder, hermes) puede causar fallos si se usa con frameworks que no los implementan.
- El contexto de 262.144 tokens es nativo según la documentación, pero solo se ha probado en producción a 131.072. Usar la longitud máxima puede degradar el rendimiento o provocar errores.
- No se ofrecen pesos GGUF; el despliegue en CPU mediante llama.cpp no está soportado oficialmente en este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic
- Modelo base upstream: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
