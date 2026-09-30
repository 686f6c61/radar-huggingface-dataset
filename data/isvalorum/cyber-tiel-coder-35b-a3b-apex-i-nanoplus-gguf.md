# IsValorum/Cyber-Tiel-Coder-35B-A3B-APEX-I-NanoPlus-GGUF

## Resumen

Cyber-Tiel-Coder-35B-A3B APEX-I-NanoPlus GGUF es una cuantizacion GGUF de precision muy reducida del modelo base huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, publicada por el usuario IsValorum. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 35B parametros totales y aproximadamente 3B parametros activos por token (denominacion A3B), orientado a codigo agentico, razonamiento y tareas multimodales de imagen-texto. El origen de la familia es la arquitectura Qwen3.5/Qwen3.6 MoE (segun las etiquetas del repositorio), sobre la que se ha aplicado una fine-tune y un proceso de abliteration (eliminacion de mecanismos de rechazo) que da lugar a un modelo sin censura.

La relevancia de esta release concreta radica en su huella de memoria: el archivo principal ocupa 12,55 GB (11,69 GiB) con un promedio de ~2,93 bits por peso (BPW), lo que permite ejecutar un modelo MoE de 35B en GPUs de consumo con 16 GB de VRAM o mediante streaming parcial desde RAM del sistema. El autor aplica una cuantizacion selectiva tensor a tensor (enrutadores de expertos en F32 sin comprimir, cabeza de salida en Q6_K, puertas de atencion en Q8_0 y proyecciones redundantes en 2 bits guiadas por imatrix) para reducir la degradacion tipica de las cuantizaciones sub-3-bit genericas.

El modelo se distribuye con licencia MIT y soporte para 13 idiomas (ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe), e incluye archivos complementarios desacoplados para vision (`mmproj-Q8_0.gguf`) y decodificacion multi-token (`mtp-Cyber-Tiel-Coder-35B-A3B.gguf`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) sobre transformer, backbone de 40 capas, base Qwen3.5/Qwen3.6 MoE |
| Parametros totales | 35B |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF APEX-I-NanoPlus (~2,93 BPW, tier Q4_K_M/Q4_K_L); archivos companion `mmproj-Q8_0.gguf` y `mtp-*.gguf` |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas Mixture-of-Experts, con 35B parametros totales y aproximadamente 3B activos por token, lo que reduce el coste computacional por inferencia a pesar del tamano total. El backbone consta de 40 capas. Los metadatos del repositorio apuntan a una base Qwen3.5/Qwen3.6 MoE (`qwen35moe`, `qwen3_5_moe`), sobre la que se ha construido el modelo Ornith 1.5 y una posterior variante abliterated por parte de huihui-ai.

Esta release es especificamente una cuantizacion, no un reentrenamiento. El autor (IsValorum) no publica en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original. La innovacion tecnica de esta release es el metodo de cuantizacion APEX-I-NanoPlus: se preservan al 100% las matrices de enrutamiento de expertos (`gate_inp`) en F32 sin comprimir para evitar el "router drift", se protege la cabeza de salida de tokens en Q6_K, se blindan las puertas de atencion en Q8_0 y se fortalece el flujo residual de la down-projection MoE (`ffn_down_exps`) en IQ3_XXS (3,06 bpw), reservando la compresion agresiva a 2 bits para las proyecciones gating/up redundantes, guiadas por la imatrix oficial. Segun el autor, esto evita los picos de perplejidad, errores de sintaxis y llaves de codigo rotas que provocan las cuantizaciones IQ2_S/IQ2_XXS genericas en modelos de razonamiento profundo. Ademas, se incluye un archivo MTP (Multi-Token Prediction) que habilita decodificacion multi-token.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Codigo: orientado a codificacion agentica y resolucion de tareas de ingenieria de software (etiqueta `swe-bench`, `agentic-coding`).
- Razonamiento multi-paso y uso en flujos de agentes autonomos.
- Capacidades multimodales: pipeline `image-text-to-text`, con soporte de vision mediante el archivo `mmproj-Q8_0.gguf`.
- Soporte de tool calling / function calling (implicito en el enfoque agentico, aunque no se detalla el formato exacto en la informacion disponible).
- Multilingue: 13 idiomas.
- Modo de razonamiento (etiqueta `reasoning`).
- Modelo abliterated / uncensored: entrenado para no rechazar peticiones, incluido trabajo de seguridad ofensiva.
- Decodificacion multi-token mediante archivo MTP opcional.
- Optimizacion de tokens (etiqueta `token-efficient`).

## Casos de uso

- Codificacion agentica en local: el modelo puede ejecutar tareas de resolucion de bugs y modificacion de repositorios en un bucle de agente, con un coste de VRAM de ~11,7 GiB que cabe en GPUs de consumo de 16 GB. Su naturaleza MoE con 3B activos acelera la generacion respecto a modelos densos de tamano similar.
- Asistente de desarrollo offline sin conexion: al distribuirse en GGUF y ejecutarse con llama.cpp, permite un copiloto de codigo completamente local en equipos sin acceso a APIs externas.
- Seguridad ofensiva y pentesting: al ser un modelo abliterated, gestiona tareas de analisis de vulnerabilidades, generacion de exploits de laboratorio y scripts de auditoria sin rechazos, un nicho donde la mayoria de modelos alineados bloquean la peticion.
- Procesamiento de documentos con vision: gracias al archivo `mmproj` y al pipeline imagen-texto, puede extraer y razonar sobre capturas de pantalla, diagramas de arquitectura o UI mockups.
- Integracion en pipelines CI/CD con tool calling: el soporte de llamada a funciones permite conectarlo a herramientas de build, linters o sistemas de issues para automatizar revisiones de codigo.
- Analisis de repositorios a escala: las etiquetas `unsloth-dynamic` y `token-efficient` sugieren un consumo de contexto optimizado para ingenieria de software a escala de repositorio (aunque la longitud de contexto exacta no esta disponible).
- Despliegue de bajo coste en hardware mixto: disenado para inferencia con carga total o parcial en RAM del sistema, permite ejecutar el modelo repartiendo capas entre VRAM y RAM cuando la GPU no dispone de memoria suficiente.

## Benchmarks y rendimiento

| Metrica | BF16 base (~71,0 GB) | APEX-I-MiniPlus V2.1 (15,23 GB) | APEX-I-NanoPlus (12,55 GB, actual) | IQ2_S generico (~12,2 GB) |
|---|---|---|---|---|
| BPW medio | 16,00 | 3,43 | ~2,93 | 2,56 |
| Perplejidad WikiText-2 | ~7,46 | 7,5117 ± 0,20722 | 8,2842 ± 0,23432 | > 8,10 (degradada) |
| Delta PPL vs BF16 | 0,000 | +0,0517 (+0,69%) | +0,8242 (+11,05%) | inestable / picos de sintaxis |
| Tier de calidad | Precision completa | Q5_K_L, rayando Q6_K | Q4_K_M / Q4_K_L solido | degradado |

ARC-Challenge (0-shot, 1.172 preguntas): ~95,69% para esta release NanoPlus.

El autor advierte expresamente que la perplejidad de WikiText-2 mide el modelado de lenguaje y no establece el rendimiento en tareas de codificacion tipo SWE-bench. No se han publicado resultados de benchmarks de codigo (SWE-bench, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~11,69 GiB para el archivo principal en GPU; seguro en GPUs de 16 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 4080/5080 (16 GB), RTX 4090/5090 (24-32 GB), A100 40 GB, H100; tambien valido en GPUs de 12 GB con carga parcial en RAM del sistema.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas (RTX 4080, 4090, 5080, 5090); en GPUs de 12 GB requiere streaming parcial desde RAM.
- Opciones de despliegue: llama.cpp (`llama-cli` para generacion en consola y `llama-server` para API compatible con OpenAI). El autor documenta ambos en la model card. Otros runners compatibles con GGUF (Ollama, LM Studio, koboldcpp) no se mencionan explicitamente.
- Latencia y throughput: no disponible de forma numerica en la informacion proporcionada. Las fuentes de la comunidad afirman que en cuantizacion Q4 la familia Cyber-Tiel-Coder resuelve tareas de codigo agentico entre 3 y 4 veces mas rapido que un modelo denso de 27B-3.8B equivalente.
- Archivos companion: `mmproj-Q8_0.gguf` (vision) y `mtp-Cyber-Tiel-Coder-35B-A3B.gguf` (decodificacion multi-token) se cargan por separado y suman a la huella de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B APEX-I-NanoPlus (este) | 35B totales / ~3B activos | GGUF, 12,55 GB | ~2,93 BPW, tier Q4 | MIT | Cabe en 16 GB VRAM, uncensored |
| Cyber-Tiel-Coder-35B-A3B APEX-I-MiniPlus V2.1 | 35B totales / ~3B activos | GGUF, 15,23 GB | 3,43 BPW, tier Q5/Q6 | MIT | Mayor fidelidad, mas huella de memoria |
| Generic Community IQ2_S | 35B totales / ~3B activos | GGUF, ~12,2 GB | 2,56 BPW | no disponible | Picos de sintaxis y codigo roto |
| peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF | 35B totales / ~3B activos | GGUF | no disponible en la informacion | no disponible | Misma familia base, otra cuantizacion; dispone de variante MTP |

No se dispone de datos comparativos frente a modelos densos de tamano similar (por ejemplo, variantes de 27B-30B) mas alla de la afirmacion cualitativa de la comunidad sobre velocidad.

## Limitaciones y advertencias

- Es una cuantizacion sub-3-bit: la perplejidad WikiText-2 sube un +11,05% respecto al base BF16, con una perdida de fidelidad medible. No equivale a un Q5/Q6 en tareas de razonamiento profundo.
- El autor advierte que la evaluacion de perplejidad no predice el rendimiento real en codigo; no hay datos publicados de SWE-bench para esta release.
- Modelo abliterated / uncensored: no aplica filtros de seguridad, por lo que puede generar contenido ofensivo, peligroso o inapropiado sin rechazo. Requiere supervision y politicas de uso en cualquier despliegue productivo.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la compresion agresiva de pesos; conviene validar salidas de codigo en produccion.
- La longitud de contexto no se especifica en la informacion disponible; no se puede garantizar el comportamiento en contextos muy largos.
- Aunque el autor afirma que evita "router drift" preservando enrutadores en F32, la degradacion en tareas de razonamiento prolongado respecto a cuantizaciones de mayor precision no esta cuantificada en la informacion proporcionada.
- Despliegue limitado a runners compatibles con GGUF (documentado con llama.cpp); el soporte en otras plataformas (vLLM, TGI) no esta confirmado para este formato.
- Los archivos companion de vision y MTP requieren gestion adicional de memoria y no estan incluidos en la huella de 12,55 GB.
- Licencia MIT en la cuantizacion, pero conviene verificar la licencia heredada del modelo base huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated antes de un uso comercial, ya que la cadena de dependencias es larga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IsValorum/Cyber-Tiel-Coder-35B-A3B-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Release complementaria de mayor precision (MiniPlus V2.1): https://huggingface.co/IsValorum/Cyber-Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Release Tiel-Coder-35B-A3B APEX-I-NanoPlus: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-NanoPlus-GGUF
- Release Qwen3.6-35B-A3B-MTP APEX-I-NanoPlus: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-NanoPlus-GGUF
- Release Ornith 1.5 APEX-I-NanoPlus: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-NanoPlus-GGUF
- Release Occamy-1.0 APEX-I-NanoPlus: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-NanoPlus-GGUF
- Cuantizacion de la comunidad (peculiar-ragdoll): https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Cuantizacion de la comunidad con MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- Ficha de registro (local-ai-zone): https://local-ai-zone.github.io/models/cyber-tiel-coder-35b-a3b.html
- Ficha de registro con MTP (local-ai-zone): https://local-ai-zone.github.io/models/cyber-tiel-coder-35b-a3b-gguf-mtp.html
- Ficha de registro (free2aitools): https://free2aitools.com/model/isvalorum/tiel-coder-35b-a3b-apex-i-nanoplus-gguf
