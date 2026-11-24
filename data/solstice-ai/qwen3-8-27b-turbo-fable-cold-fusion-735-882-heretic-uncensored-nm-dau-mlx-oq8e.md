# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ8e

## Resumen

`Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ8e` es una cuantizacion de 8 bits en formato MLX (oQ8e, mixto calibrado por matriz de importancia) del modelo `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, a su vez un merge GAIN de la familia Qwen 3.8 de 27B. El paquete lo publica Solstice-AI para ejecucion nativa en Apple Silicon (Metal, memoria unificada) mediante su runtime Anvil o MLX-LM. El modelo base y el merge son obra de DavidAU.

La propuesta tecnica gira en torno a tres ejes: una arquitectura hibrida Qwen 3.8 con atencion lineal GDN (Gated Delta Recurrent Network) en el 75% de las capas y GQA global en el 25% restante, un contexto nativo declarado de 262.144 tokens, y una cabeza de prediccion multi-token (MTP) que el autor cifra en aceleraciones de 1,72x a 2,20x en Apple Silicon. El checkpoint incorpora ademas una ablacion de rechazos ("Project Heretic") que elimina los vectores de negativa corporativos.

Es relevante ahora porque ocupa un nicho muy concreto: servir un modelo de 27B con contexto de 262K en hardware de consumo Apple (Mac Studio, MacBook Pro) sin salir del ecosistema MLX, con un pipeline declarado `image-text-to-text` y licencia Apache 2.0. Conviene tratar con cautela las afirmaciones de la model card sobre superioridad frente a Claude Opus 4.6: son cifras autopublicadas por el autor del empaquetado, sin verificacion independiente en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen 3.8: 75% capas de atencion lineal GDN (Gated Delta Recurrent Network) + 25% GQA global; merge GAIN de pesos |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens (262K) declarados como nativos |
| Tipos de cuantizacion | MLX oQ8e (8 bits mixto, calibrado por matriz de importancia); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); repo de 30,0 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de la familia Qwen 3.8. La mayor parte de las capas (75%) emplea atencion lineal GDN, que reduce la complejidad de memoria a O(1) respecto a la longitud de secuencia, mientras que el 25% restante mantiene atencion global con Grouped-Query Attention para preservar la recuperacion exacta en contextos largos. Sobre esa base, DavidAU aplica un merge de pesos GAIN (Guided Activation Interleaved Normalization) que combina checkpoints con picos de rendimiento en razonamiento sin degradar las capacidades previas, y una ablacion de alineacion ("Project Heretic") que elimina los vectores de rechazo.

La cuantizacion de Solstice-AI es un esquema mixto de 8 bits guiado por un informe de matriz de importancia (`oq_imatrix_report.json`): se asignan profundidades de bit distintas a las proyecciones de atencion y a las matrices MLP segun su sensibilidad por capa, con el objetivo declarado de conservar el 99,8% de la fidelidad FP16. El checkpoint incorpora una cabeza de prediccion multi-token (MTP) de doble flujo para decodificacion especulativa, con dos tokens por paso forward. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento (CoT) explicita.
- Codigo y ingenieria de software: el autor reporta evaluacion en SWE-bench Pro, LiveCodeBench v6 y QwenSWEBench.
- Control de sistemas y agentes de interfaz: OSWorld-Verified y AndroidWorld, orientados a automatizacion de escritorio y movil.
- Seguimiento de restricciones complejas (IFBench) y flujos multi-archivo de horizonte largo (CoWorkBench).
- Razonamiento cientifico y abstraccion de nivel frontera (ARC-C, ARC-E).
- Pipeline declarado `image-text-to-text`, lo que implica entrada de imagen ademas de texto; la model card no detalla el codigo del adaptador de vision.
- Capacidades multilingues limitadas a ingles y chino.
- Decodificacion especulativa mediante cabeza MTP integrada.
- Modo sin rechazos (abliterated) para contenido que los modelos alineados convencionalmente rechazan.
- No se documenta en la informacion disponible soporte explicito de tool calling estructurado, audio ni otras modalidades.

## Casos de uso

- Agentes de ingenieria de software sobre repositorios completos: con 262K de contexto puede cargar arboles de proyecto extensos y mantener el estado de una tarea de depuracion multi-archivo, apoyandose en el rendimiento declarado en QwenSWEBench (79,0%).
- Automatizacion de escritorio y control de aplicaciones: los resultados declarados en OSWorld-Verified (84,3%) lo situan como candidato para pilotos de agentes que operan interfaces graficas en macOS.
- Asistencia a la investigacion cientifica: el perfil ARC-C/ARC-E sugiere utilidad en tareas de abstraccion y resolucion de problemas de nivel avanzado, con la salvedad de que las cifras son autopublicadas.
- Procesamiento de documentos largos en local: contratos, expedientes o bases de codigo de hasta 262K tokens servidos en un Mac Studio sin dependencia de nube.
- Desarrollo de software en maquina del desarrollador: integracion en MLX-LM o Anvil para autocompletado y refactorizacion con contexto de repositorio, manteniendo el codigo fuera de servicios externos.
- Analisis de seguridad ofensiva y sistemas: la ablacion de rechazos permite trabajar en escenarios de red team, ingenieria inversa y analisis de malware que los modelos alineados suelen declinar.
- Prototipado de agentes de largo horizonte: la ventana de 262K y la decodificacion especulativa MTP reducen el coste por turno en flujos de decenas de pasos.
- Evaluacion comparativa interna de modelos: util como referencia local para contrastar con APIs cerradas en tareas de codigo y agentes, siempre con harness propio.

## Benchmarks y rendimiento

Cifras declaradas por el autor del empaquetado, evaluadas con el harness de Claude Code a temperatura 1,0 y top_p 0,95. No hay verificacion independiente en la informacion disponible.

| Suite | Enfoque | Modelo (declarado) | Claude Opus 4.6 Max (declarado) | Margen |
|---|---|---|---|---|
| SWE-bench Pro | Ingenieria de software agentica | 61,7% | 53,4% | +8,3% |
| LiveCodeBench v6 | Resolucion de problemas en tiempo real | 90,3% | 88,8% | +1,5% |
| QwenSWEBench | Depuracion de repositorio completo | 79,0% | 63,8% | +15,2% |
| OSWorld-Verified | Control de sistema operativo | 84,3% | 72,7% | +11,6% |
| AndroidWorld | Autonomia en SO movil | 81,9% | 62,0% | +19,9% |
| IFBench | Seguimiento de restricciones | 79,5% | 62,5% | +17,0% |
| CoWorkBench | Flujos multi-archivo de horizonte largo | 70,7% | 68,2% | +2,5% |
| ARC-C | Abstraccion cientifica | 735 (8 bits) / 719 (4 bits) | ~710-720 | Tier frontera |
| ARC-E | Razonamiento de sentido comun | 882 | ~870 | Por encima del frontera cerrado |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible. Las cifras de ARC se expresan como puntuacion absoluta, no como porcentaje, y las de Claude Opus 4.6 aparecen como rangos aproximados.

## Requisitos de hardware

- VRAM/memoria unificada: el repo pesa 30,0 GB; en MLX sobre Apple Silicon se necesita al menos ese espacio mas overhead de KV cache. Para contexto completo de 262K la cache crece de forma apreciable, aunque la atencion lineal GDN del 75% de las capas limita el coste respecto a un transformer denso equivalente.
- GPU recomendadas: Apple Silicon exclusivamente para este checkpoint (M1 Max/Ultra, M2 Ultra, M3 Max/Ultra, M4 Max). No es ejecutable en CUDA sin reconvertir los pesos a otro formato.
- Cabe en GPU de consumo: si, en Mac con 32 GB unificados como minimo ajustado; 64 GB o mas es recomendable para contextos largos. No aplica a RTX 4090 ni A100/H100 en este formato.
- Opciones de despliegue: Anvil Runtime (Metal, recomendado por el autor) y MLX-LM. vLLM, llama.cpp, Ollama y TGI no soportan MLX oQ8e de forma nativa; requeririan conversion previa.
- Latencia y throughput: el autor declara aceleraciones de 1,72x a 2,20x por la cabeza MTP en Apple Silicon. No se publican tokens por segundo absolutos ni latencias de primer token en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (Solstice-AI, oQ8e) | 27,78B | 262K | MLX safetensors | Apache 2.0 | Solo Apple Silicon; sin rechazos; MTP |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | 27B (no detallado) | no disponible | safetensors (formato original) | Apache 2.0 | Modelo base; portable a otros runtimes |
| Qwen 3.8 27B de referencia | ~27B | no disponible | safetensors, GGUF | Apache 2.0 | Alineacion estandar, sin ablacion |
| Claude Opus 4.6 Max | no disponible | no disponible | API cerrada | propietaria | Referencia de comparacion del autor, no verificable |

No se dispone en la informacion proporcionada de especificaciones detalladas de los modelos alternativos (contexto, variantes, benchmarks propios) mas alla de las cifras que el autor atribuye a Opus 4.6.

## Limitaciones y advertencias

- Las afirmaciones de superioridad (9 de 9 victorias frente a Claude Opus 4.6 Max, 735 ARC-C) proceden del propio autor del empaquetado y no consta verificacion independiente; tratalas como marketing hasta replicarlas.
- La ablacion de rechazos elimina salvaguardas: el modelo puede generar contenido danino, instrucciones de abuso o material ilegal. Requiere filtros externos y supervision en cualquier despliegue con usuarios finales.
- Solo ingles y chino declarados; el rendimiento en castellano no esta evaluado y previsiblemente sera inferior.
- Riesgo de alucinacion no cuantificado: no se publican tasas de factualidad ni evaluaciones de calibracion.
- Contexto de 262K declarado, pero la calidad efectiva en el extremo de la ventana no esta medida en la informacion disponible; la atencion lineal puede degradar la recuperacion exacta en tareas de aguja en pajar.
- Dependencia de hardware Apple Silicon: sin soporte CUDA directo, lo que limita el despliegue en infraestructura de servidor convencional.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es un merge de terceros con procedencia de pesos no completamente documentada; conviene auditar antes de produccion.
- El pipeline `image-text-to-text` no viene acompanado de documentacion del adaptador de vision; la capacidad multimodal es incierta.
- Formato oQ8e propietario del ecosistema Solstice/MLX: la portabilidad a otros runtimes exige reconversion y puede perder la calibracion por matriz de importancia.

## Enlaces

- Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ8e
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del merge: https://huggingface.co/DavidAU
- Perfil del empaquetador: https://huggingface.co/Solstice-AI
- Runtime Anvil: https://github.com/Solstice-Labs/anvil
- Instalador de Anvil: https://anvil-llm.github.io/anvil/install.sh
- Banner del proyecto: https://cdn-uploads.huggingface.co/production/uploads/67c2e844e0921a5410eec10a/Y5M42dCag2f7Fc6fDtV0Z.jpeg
