# reaperdoesntknow/Symbiotic-1B

## Resumen

Symbiotic-1B es un ajuste fino del modelo Qwen3-0.6B publicado por el usuario reaperdoesntknow bajo la marca Convergent Intelligence LLC (Research Division). A pesar del nombre comercial "1B", los pesos reales en safetensors suman 596.049.920 parametros, es decir, practicamente el mismo tamano que el Qwen3-0.6B original. El autor lo presenta como un modelo "hibrido simbolico-transformer" orientado a razonamiento simbolico, memoria episodica persistente e inferencia en CPU y entornos embebidos.

La propuesta tecnica anade al backbone transformer de Qwen3 una capa de modulos denominados simbolicos (ThoughtDynamicsLNN, CrystallineProcessor, LiquidThoughtProcessor, HelicalDNAProcessor) y un banco de memoria de 2048 vectores serializado en `memory.pt`, junto con tokens especiales de logica (`<THM>`, `<LEM>`, `<D_IF>`). El modelo se distribuye con licencia AFL-3.0, solo en ingles, y esta entrenado sobre el dataset `0xZee/dataset-CoT-Advanced-Calculus-268`.

Es relevante ahora por su encuadre en el marco teorico "Discrepancy Calculus" del autor y por su enfoque de inferencia ligera en CPU, pero conviene tratarlo con cautela: la model card contiene afirmaciones no verificadas, el nombre no coincide con el numero real de parametros y no se publican resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con modulos simbolicos anadidos y memoria episodica persistente |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors y `model.bin`; no hay GGUF oficial) |
| Idiomas soportados | en (ingles) |
| Licencia | afl-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors, PyTorch bin (`model.bin`), `memory.pt` (memoria simbolica serializada) |

## Arquitectura y entrenamiento

El backbone es el transformer rotary de Qwen3-0.6B, sobre el que el autor superpone una "pipeline de procesamiento simbolico" con dimension simbolica de 1024 y cuatro modulos propietarios: ThoughtDynamicsLNN, CrystallineProcessor (descrito como DNAConv GNN), LiquidThoughtProcessor y HelicalDNAProcessor. Ademas incorpora un banco de memoria de 2048 vectores simbolicos con recuperacion "entropica y contextual", un modo "Dream" de simulacion simbolica con ThoughtGenerator, y un tokenizador extendido con tokens logicos especiales.

El ajuste fino se realizo sobre el dataset `0xZee/dataset-CoT-Advanced-Calculus-268`, orientado a cadenas de pensamiento de calculo avanzado. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset, ni si hubo RLHF, DPO o preference tuning. El autor enmarca el desarrollo en el marco "Discrepancy Calculus" (DISC), una propuesta measure-theoretic sobre la brecha entre comportamiento esperado y observado, con conceptos como "discrepancy operator", "jump sets" y "ghost imprinting"; no se aportan validaciones empiricas de dicho marco en la ficha.

## Capacidades

- Generacion de texto conversacional en ingles sobre el backbone Qwen3.
- Razonamiento matematico y modelado procedural, con enfasis declarado en calculo avanzado por el dataset de ajuste.
- Generacion de explicaciones basadas en grafos y planificacion procedural segun la model card.
- Generacion de codigo a pequena escala ("small-code generation").
- Memoria episodica persistente mediante `memory.pt` y recuperacion contextual de vectores simbolicos.
- Modo "Dream" de simulacion simbolica con ThoughtGenerator (requiere calentamiento o sembrado simbolico para consultas complejas).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible como capacidad verificada; la model card menciona "research agents" como caso de uso, no como funcionalidad implementada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes educativos con memoria: el banco de 2048 vectores simbolicos permite conservar contexto entre sesiones en tutoria de matematicas, aunque la calidad dependera de la curacion manual de `memory.pt`.
- Inferencia en CPU y dispositivos embebidos: con 596 M de parametros, el modelo cabe en entornos sin GPU dedicada, lo que lo hace util para prototipos de agentes locales de bajo consumo.
- Razonamiento simbolico en entornos restringidos: adecuado para experimentos de logica y demostracion con los tokens `<THM>`, `<LEM>` y `<D_IF>`, siempre que se validen las salidas.
- Generacion de explicaciones paso a paso en dominios cientificos: su ajuste sobre cadenas de pensamiento de calculo permite generar derivaciones intermedias, utiles como material didactico tras revision humana.
- Planificacion procedural en pipelines de investigacion: puede emplearse como generador de borradores de planes o secuencias de pasos en flujos internos, no como orquestador autonomo.
- Generacion de codigo auxiliar de baja complejidad: scripts cortos y funciones simples en entornos donde no se dispone de GPU.
- Prototipado de arquitecturas con memoria externa: sirve como banco de pruebas para investigar la integracion de memoria serializada con un transformer pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en FP16 (596 M de parametros) y alrededor de 0,6 GB en int8; en FP32, unos 2,4 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente; tambien tarjetas de datacenter como A100 o H100, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier RTX o GTX moderna con 4 GB o mas; tambien en iGPU y CPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No hay GGUF oficial, por lo que llama.cpp u Ollama requeririan conversion manual.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Symbiotic-1B | 596 M | no disponible | AFL-3.0 | Hugging Face | Ajuste de Qwen3-0.6B con modulos simbolicos y memoria externa |
| Qwen3-0.6B | 596 M | 32.768 tokens (segun especificaciones publicas de Qwen3) | Apache-2.0 | Hugging Face | Modelo base; licencia permisiva y ecosistema amplio |
| Qwen3-1.7B | 1.700 M | 32.768 tokens (segun especificaciones publicas de Qwen3) | Apache-2.0 | Hugging Face | Mayor capacidad, mismo linaje arquitectonico |
| SmolLM2-1.7B | 1.700 M | 8.192 tokens | Apache-2.0 | Hugging Face | Alternativa ligera para CPU con licencia permisiva |

La comparativa con Qwen3-0.6B es la mas directa: Symbiotic-1B hereda su backbone pero cambia la licencia a AFL-3.0 y anade componentes propietarios cuya eficacia no esta documentada con benchmarks.

## Limitaciones y advertencias

- El nombre "1B" no corresponde al numero real de parametros (596 M); conviene no confundirlo con modelos de la clase 1B.
- La model card afirma que el modelo base es "Qwen-1B", mientras que los metadatos indican Qwen3-0.6B; existe una inconsistencia documental.
- Menor fluidez en lenguaje libre que variantes mayores, segun reconoce el propio autor.
- La precision simbolica depende de la curacion de la memoria (`memory.pt`); sin curacion, el rendimiento puede degradarse.
- El modo "Dream" requiere calentamiento o sembrado simbolico para consultas complejas, lo que limita su uso directo en produccion.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Riesgo de alucinacion inherente a un modelo de 596 M ajustado sobre un dataset pequeno y especializado; las salidas matematicas y logicas deben validarse.
- No se han publicado benchmarks, evaluaciones de sesgo ni pruebas de robustez; el marco "Discrepancy Calculus" no cuenta con validacion externa en la informacion disponible.
- La licencia AFL-3.0 es permisiva pero incluye clausulas de reciprocidad y atribucion; conviene revisar los terminos antes de uso comercial.
- No hay cuantizaciones GGUF oficiales, lo que complica el despliegue en llama.cpp u Ollama sin conversion manual.
- El ecosistema del autor es pequeno (5 likes, 2.867 descargas) y el modelo se actualizo por ultima vez en noviembre de 2026; la mantenibilidad a largo plazo no esta garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Symbiotic-1B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de ajuste: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Discrepancy Calculus: Foundations and Core Theory: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Structure Over Scale: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Three Teachers to Dual Cognition: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Symbiotic-8B: https://huggingface.co/reaperdoesntknow/Symbiotic-8B
- Symiotic-14B: https://huggingface.co/reaperdoesntknow/Symiotic-14B
- Symbiotic-Beta: https://huggingface.co/reaperdoesntknow/Symbiotic-Beta
