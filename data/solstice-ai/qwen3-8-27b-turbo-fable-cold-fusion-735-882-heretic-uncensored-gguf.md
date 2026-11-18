# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF es la distribucion en formato GGUF del modelo Qwen3.8-27B Cold Fusion GAIN desarrollado originalmente por DavidAU, empaquetada y cuantizada por Solstice-AI. Se trata de un modelo multimodal de tipo image-text-to-text, derivado de la familia Qwen 3.8, con aproximadamente 26.900 millones de parametros y una ventana de contexto nativa de 262.000 tokens. La variante "Heretic Uncensored" indica que el modelo ha sido sometido a un proceso de abliteration para eliminar los rechazos de contenido, orientandolo a usos sin filtros editoriales.

El modelo destaca por incorporar dos mecanismos de aceleracion de decodificacion: un drafter especulativo independiente denominado DSpark (1.860 millones de parametros) y checkpoints con Multi-Token Prediction (MTP) integrado. Ademas, incluye un proyector visual `mmproj-BF16.gguf` para entrada de imagenes y fotogramas de video. La model card declara resultados de referencia muy elevados en tareas de ingenieria de software agentica y control de sistemas operativos, con una comparacion directa contra Claude Opus 4.6 Max.

La relevancia actual del modelo reside en su orientacion a cargas de trabajo agenticas de codigo y automatizacion de escritorio, combinada con un formato GGUF listo para llama.cpp y Ollama. La licencia Apache 2.0 facilita su adopcion comercial, aunque las afirmaciones de rendimiento de la model card no cuentan con verificacion independiente en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (Qwen 3.8 Hybrid Linear Attention: 75% capas GDN lineal, 25% atencion global GQA) |
| Parametros totales | 26.895.998.464 (aprox. 26,9 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.000 tokens nativos |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_NL, IQ4_XS; drafter DSpark en Q8_0 y Q4_K_M |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 427,2 GB con multiples variantes); proyector visual mmproj-BF16.gguf |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida de atencion: aproximadamente el 75% de las capas utilizan bloques de atencion lineal Gated Delta Recurrent Network (GDN) con complejidad de memoria O(1) por paso forward, mientras que el 25% restante corresponde a atencion global con Grouped-Query Attention. Esta combinacion busca mantener la calidad de atencion completa en capas clave mientras reduce el coste computacional y de memoria en contextos largos, lo que permite sostener la ventana de 262.000 tokens.

El modelo original es un merge GAIN de DavidAU sobre la familia Qwen 3.8, con un proceso de abliteration ("Project Heretic") para eliminar comportamientos de rechazo. Solstice-AI realiza la cuantizacion downstream, la integracion de MTP y el empaquetado. Se incluye un drafter especulativo DSpark de 1.860 millones de parametros entrenado con SpecForge, que utiliza cinco capas auxiliares de extraccion de caracteristicas (5, 19, 33, 47 y 61) y una cabeza de confianza VanillaMarkov de rango 256; segun la model card, proporciona aceleraciones de decodificacion de 2,5x a 3,1x en llama.cpp y Anvil. No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo de cadena de pensamiento (CoT) explicito.
- Generacion y depuracion de codigo, con enfasis declarado en tareas de ingenieria de software agentica (SWE-bench, LiveCodeBench).
- Razonamiento matematico y cientifico de nivel ARC-C/ARC-E segun la model card.
- Vision multimodal: procesamiento de diagramas, capturas de pantalla de interfaz y fotogramas de video mediante el proyector `mmproj-BF16.gguf`.
- Soporte de tool calling y function calling, orientado a pipelines de agentes.
- Razonamiento multi-paso y flujos de trabajo de horizonte largo sobre multiples ficheros.
- Control de entorno de escritorio y autonomia en sistemas operativos moviles (OSWorld, AndroidWorld).
- Capacidades multilingues limitadas a ingles y chino.
- Decodificacion especulativa mediante drafter DSpark o checkpoints con MTP integrado.
- Modo "uncensored" por abliteration, sin rechazos editoriales por defecto.

## Casos de uso

- Ingenieria de software agentica: el modelo puede resolver issues sobre repositorios completos aprovechando la ventana de 262.000 tokens para cargar arboles de codigo y trazas de ejecucion, con soporte de tool calling para invocar compiladores, tests y herramientas de control de versiones.
- Automatizacion de escritorio y RPA: su orientacion a OSWorld-Verified y AndroidWorld lo hace adecuado para agentes que interpretan capturas de pantalla y ejecutan acciones sobre interfaces graficas, sustituyendo scripts de automatizacion fragiles.
- Asistente de depuracion en CI/CD: integrado via llama.cpp u Ollama en un pipeline, puede analizar fallos de build, proponer parches y validarlos con herramientas externas antes de abrir una pull request.
- Analisis de documentacion tecnica multimodal: con el proyector visual puede extraer informacion de diagramas de arquitectura, esquemas electricos o capturas de paneles de monitorizacion y generar resumenes o procedimientos.
- Generacion de codigo sin restricciones editoriales: util en entornos de investigacion sobre seguridad ofensiva, analisis de malware o generacion de pruebas de concepto donde los filtros de rechazo de modelos alineados resultan limitantes.
- Procesamiento de video con razonamiento temporal: el proyector espaciotemporal permite describir secuencias de fotogramas, util para analisis de grabaciones de vigilancia o revision de demos de producto.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo en GPUs de consumo con el drafter DSpark para recuperar velocidad de decodificacion.

## Benchmarks y rendimiento

Resultados declarados en la model card, evaluados con el harness de Claude Code a contextos de 256-262k, temperatura 1,0 y top_p 0,95. No se han verificado de forma independiente en la informacion disponible.

| Suite | Enfoque | Qwen3.8-27B TURBO | Claude Opus 4.6 Max | Diferencia |
|---|---|---|---|---|
| SWE-bench Pro | Ingenieria de software agentica | 61,7% | 53,4% | +8,3% |
| LiveCodeBench v6 | Resolucion de problemas en tiempo real | 90,3% | 88,8% | +1,5% |
| QwenSWEBench | Depuracion de repositorio completo | 79,0% | 63,8% | +15,2% |
| OSWorld-Verified | Control de sistema operativo | 84,3% | 72,7% | +11,6% |
| AndroidWorld | Autonomia en SO movil | 81,9% | 62,0% | +19,9% |
| IFBench | Seguimiento de restricciones complejas | 79,5% | 62,5% | +17,0% |
| CoWorkBench | Flujos multi-fichero de horizonte largo | 70,7% | 68,2% | +2,5% |
| ARC-C (Challenge) | Abstraccion cientifica | 735 (8-bit) / 719 (4-bit) | ~710-720 | Tier frontera |
| ARC-E (Easy) | Razonamiento de sentido comun | 882 | ~870 | Superior |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15-17 GB en Q4_K_M, 19-21 GB en Q5_K_M, 22-24 GB en Q6_K y 28-30 GB en Q8_0, para los pesos del modelo principal. El proyector visual BF16 anade una cantidad adicional no especificada en la informacion disponible.
- El drafter DSpark requiere VRAM adicional: aproximadamente 1-1,2 GB en Q4_K_M y 2 GB en Q8_0.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) para Q5_K_M o Q6_K con contexto moderado; RTX 3090 o RTX 4080 para Q4_K_M.
- Cabe en GPU de consumo: si, en Q4_K_M e IQ4_XS sobre GPUs de 16-24 GB (RTX 4080, 4090, 3090, 4060 Ti 16 GB). Para contexto completo de 262k se necesita offloading a RAM del sistema o GPUs profesionales.
- Opciones de despliegue: llama.cpp (soporte nativo de `--model-draft` para el drafter DSpark), Ollama, runtime Anvil (TurboQuant) de Solstice-Labs. No se menciona soporte de vLLM ni TGI para este formato GGUF.
- Latencia y throughput: la model card declara aceleraciones de 2,5x a 3,1x en decodificacion con el drafter DSpark frente a decodificacion sin especulacion. No se proporcionan valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion (este) | 26,9 B | 262k | Apache 2.0 | GGUF | Vision, MTP, drafter DSpark, abliterated |
| Modelo base DavidAU (NM-DAU) | 26,9 B | 262k | Apache 2.0 | safetensors | Sin cuantizar ni empaquetado por Solstice-AI |
| Claude Opus 4.6 Max | no disponible | no disponible | Propietaria | API | Referencia de comparacion en la model card; sin pesos abiertos |
| Familia Qwen 3.8 base | no disponible | no disponible | Apache 2.0 | safetensors | Modelo original sin merge GAIN ni abliteration |

No se dispone en la informacion proporcionada de datos comparativos de otros modelos abiertos de tamano similar (por ejemplo, variantes de 27-32 B de otras familias) en las mismas suites de evaluacion.

## Limitaciones y advertencias

- Los resultados de benchmarks proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente; deben tratarse como afirmaciones no confirmadas.
- La abliteration para eliminar rechazos incrementa el riesgo de generar contenido danino, ilegal o inseguro; no es adecuado para aplicaciones de cara al publico sin moderacion externa.
- Riesgo de alucinacion inherente a los modelos de 27 B, especialmente en tareas de codigo y razonamiento cientifico con afirmaciones de rendimiento muy altas.
- Soporte idiomatico limitado a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- El contexto nativo de 262k requiere recursos de memoria considerables; en configuraciones de consumo la ventana efectiva se vera reducida por limitaciones de VRAM.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de un merge no oficial de Qwen 3.8; conviene verificar la cadena de licencias del modelo base original.
- El proceso de merge GAIN y la abliteration pueden degradar capacidades generales no evaluadas en las suites declaradas.
- El repo ocupa 427,2 GB; la descarga selectiva de una sola cuantizacion es imprescindible en la practica.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Dataset declarado: https://huggingface.co/datasets/Solstice-AI/Solace-1.0-Omni
- Runtime Anvil (TurboQuant): https://github.com/Solstice-Labs/anvil
- Perfil del autor original: https://huggingface.co/DavidAU
- Perfil del cuantizador: https://huggingface.co/Solstice-AI
