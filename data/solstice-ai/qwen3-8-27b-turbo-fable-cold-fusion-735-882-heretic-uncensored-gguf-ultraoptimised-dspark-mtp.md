# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised-DSpark-MTP

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised-DSpark-MTP es una distribucion en formato GGUF del modelo base de DavidAU Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, empaquetada por Solstice-AI. Se trata de un modelo multimodal (image-text-to-text) derivado de la familia Qwen 3.8, con 26.895.998.464 parametros totales y una ventana de contexto nativa de 262K tokens. La variante incorpora el modo "Heretic" (abliterated/uncensored), orientado a reducir los rechazos del modelo en tareas de contenido sensible, y una fusion GAIN sobre el modelo original.

El paquete anade dos mecanismos de aceleracion de decodificacion: un drafter especulativo independiente DSpark (1,86B parametros) y checkpoints con Multi-Token Prediction (MTP) integrado en la propia estructura del modelo. Ademas incluye un proyector de vision `mmproj-BF16.gguf` para diagramas, capturas de interfaz y fotogramas de video. El autor declara resultados de 735 en ARC-C y 882 en ARC-E, asi como una comparativa favorable frente a Claude Opus 4.6 Max en nueve suites de evaluacion.

La relevancia del modelo radica en su orientacion a cargas agenticas de codigo y automatizacion de sistemas (SWE-bench Pro, OSWorld, AndroidWorld) con despliegue local mediante llama.cpp u Ollama, junto con licencia Apache 2.0. No obstante, las cifras de rendimiento proceden exclusivamente de la model card del autor y no se han verificado de forma independiente en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion linear (Gated Delta Recurrent Network, GDN) en el 75% de las capas y atencion global Grouped-Query en el 25% restante; multimodal con proyector de vision |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262K tokens nativos |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_NL, IQ4_XS; drafter DSpark en Q8_0 y Q4_K_M; mmproj en BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama); repo de 427,2 GB |
| Drafter especulativo | DSpark, 1,86B parametros, entrenado con SpecForge, taps en capas 5, 19, 33, 47 y 61, cabeza de confianza VanillaMarkov de rango 256 |
| Vision | `mmproj-BF16.gguf` (proyector espacio-temporal) |
| Dataset declarado | Solstice-AI/Solace-1.0-Omni |

## Arquitectura y entrenamiento

El modelo parte de la familia Qwen 3.8 y emplea una arquitectura hibrida de atencion: aproximadamente el 75% de las capas utilizan bloques de atencion linear Gated Delta Recurrent Network con complejidad de memoria O(1) por paso forward, mientras que el 25% restante mantiene atencion global con Grouped-Query Attention. Esta combinacion busca sostener contextos largos (262K tokens) sin el coste cuadratico completo de un transformer denso clasico. Sobre esa base, DavidAU aplica una fusion GAIN y un proceso de abliteration ("Project Heretic") que elimina direcciones de rechazo en el espacio de activaciones, dando lugar a la variante uncensored.

El paquete de Solstice-AI no reentrena el modelo base: cuantiza, integra aceleradores y empaqueta. El componente DSpark es un drafter de 1,86B parametros entrenado con SpecForge que toma caracteristicas de cinco capas auxiliares del modelo principal y las combina mediante una cabeza de confianza de rango 256, habilitando decodificacion especulativa en llama.cpp con `--model-draft`. Los checkpoints con sufijo `-MTP-` incorporan prediccion multi-token dentro de la estructura del modelo, lo que permite proponer varios tokens por paso sin un drafter separado. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO sobre el modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de 262K tokens.
- Razonamiento con cadena de pensamiento (tags `cot` y `reasoning` en la model card).
- Generacion y depuracion de codigo, incluyendo tareas agenticas de ingenieria de software.
- Capacidades multimodales de entrada imagen-texto: interpretacion de diagramas, capturas de interfaz y fotogramas de video mediante el proyector `mmproj-BF16.gguf`.
- Control de sistemas operativos de escritorio y moviles (orientado a OSWorld y AndroidWorld).
- Seguimiento de restricciones complejas e instrucciones largas (IFBench).
- Flujos multi-paso y de horizonte largo sobre multiples ficheros (CoWorkBench).
- Decodificacion especulativa mediante drafter DSpark o MTP integrado.
- Soporte de tool calling / function calling: no se detalla explicitamente en la informacion disponible, aunque el enfoque agentico del modelo lo presupone.
- Capacidades multilingues limitadas a ingles y chino.
- Modo uncensored/abliterated que reduce los rechazos en contenido sensible.

## Casos de uso

- Ingenieria de software agentica: el modelo puede resolver issues sobre repositorios completos y proponer parches, apoyandose en su ventana de 262K tokens para mantener en contexto multiples ficheros y el historial de la tarea. El autor reporta 61,7% en SWE-bench Pro.
- Depuracion de repositorios completos: con 79,0% declarado en QwenSWEBench, es adecuado para localizar la causa raiz de fallos que cruzan varios modulos y para generar pruebas de regresion.
- Automatizacion de escritorio y RPA: las capacidades de control de interfaz (84,3% en OSWorld-Verified declarado) permiten construir agentes que operan aplicaciones graficas mediante capturas procesadas por el proyector de vision.
- Automatizacion movil y testing de aplicaciones Android: el modelo puede planificar y ejecutar secuencias de interaccion sobre la interfaz, util para pruebas end-to-end y generacion de scripts de UI.
- Asistencia a la resolucion de problemas de programacion en tiempo real: con 90,3% declarado en LiveCodeBench v6, encaja en entornos de evaluacion competitiva o en asistentes de pair programming con baja latencia gracias a la decodificacion especulativa (2,5x a 3,1x declarado).
- Procesamiento de documentacion tecnica multimodal: diagramas de arquitectura, capturas de paneles y fotogramas de video pueden alimentar al modelo junto con texto para generar documentacion o resumenes operativos.
- Despliegue local con requisitos de privacidad: al distribuirse en GGUF y con licencia Apache 2.0, puede ejecutarse en infraestructura propia sin enviar codigo o datos a terceros.
- Generacion de contenido sin filtros editoriales: la variante Heretic resulta util para investigacion sobre alineacion, red teaming y evaluacion de sesgos, donde los rechazos del modelo interfieren con la medicion.

## Benchmarks y rendimiento

Los siguientes datos proceden exclusivamente de la model card del autor, evaluados con el harness de Claude Code a contextos de 256-262K, temperatura 1.0 y top_p 0.95. No se han verificado de forma independiente en la informacion disponible.

| Suite | Enfoque | Qwen3.8-27B TURBO | Claude Opus 4.6 Max | Margen declarado |
|---|---|---|---|---|
| SWE-bench Pro | Ingenieria de software agentica | 61,7% | 53,4% | +8,3% |
| LiveCodeBench v6 | Resolucion de problemas en tiempo real | 90,3% | 88,8% | +1,5% |
| QwenSWEBench | Depuracion de repositorio completo | 79,0% | 63,8% | +15,2% |
| OSWorld-Verified | Control de sistema operativo | 84,3% | 72,7% | +11,6% |
| AndroidWorld | Autonomia en SO movil | 81,9% | 62,0% | +19,9% |
| IFBench | Seguimiento de restricciones complejas | 79,5% | 62,5% | +17,0% |
| CoWorkBench | Flujos multi-fichero de horizonte largo | 70,7% | 68,2% | +2,5% |
| ARC-C | Abstraccion cientifica | 735 (8 bits) / 719 (4 bits) | ~710-720 | Nivel frontera |
| ARC-E | Razonamiento de sentido comun | 882 | ~870 | Por encima del frontera cerrado |

Aceleracion declarada: 2,5x a 3,1x en velocidad de decodificacion con el drafter DSpark en llama.cpp y Anvil. No se aportan cifras de throughput absoluto ni de latencia por token.

## Requisitos de hardware

- VRAM estimada para inferencia (26,9B parametros): aproximadamente 28-29 GB en Q8_0, 21-22 GB en Q6_K, 18-19 GB en Q5_K_M, 15-16 GB en Q4_K_M e IQ4_XS/IQ4_NL en torno a 14-15 GB, sin contar el proyector de vision ni el drafter.
- El drafter DSpark (1,86B) anade aproximadamente 2 GB en Q8_0 o 1,1 GB en Q4_K_M si se usa decodificacion especulativa.
- El proyector `mmproj-BF16.gguf` anade una cantidad menor de memoria, no cuantificada en la informacion disponible.
- GPU recomendadas: A100 40/80 GB y H100 para Q8_0 con contexto muy largo; RTX 4090 (24 GB) para Q5_K_M o Q4_K_M; RTX 3090 (24 GB) en cuantizaciones de 4-5 bits; GPUs de 16 GB solo con IQ4_XS y contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o IQ4_XS; con 16 GB conviene limitar el contexto o usar offload parcial a CPU.
- Opciones de despliegue: llama.cpp (soporte nativo de `--model-draft` para DSpark), Ollama, y el runtime Anvil de Solstice-Labs con TurboQuant. vLLM y TGI no aparecen mencionados en la informacion disponible para este formato GGUF.
- Latencia y throughput: solo se declara la mejora relativa de 2,5x a 3,1x con decodificacion especulativa; no hay cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion (este, GGUF) | 26,9B | 262K | Apache 2.0 | GGUF + mmproj + drafter | Multimodal, uncensored, MTP y DSpark; benchmarks declarados por el autor |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | 26,9B | no disponible en la informacion | Apache 2.0 | safetensors (presumible) | Modelo base del que deriva esta cuantizacion |
| Claude Opus 4.6 Max | no disponible | no disponible | Propietaria | API cerrada | Referencia de comparacion usada por el autor; sin acceso local |
| Otros modelos Qwen 3.8 de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparativa con alternativas abiertas del mismo tamano no puede completarse con datos verificados a partir de la informacion disponible; las unicas referencias cuantitativas son las que aporta el propio autor frente a Claude Opus 4.6 Max.

## Limitaciones y advertencias

- Todos los benchmarks proceden de la model card del autor y no se han verificado de forma independiente; deben tratarse como afirmaciones no confirmadas.
- El proceso de abliteration/uncensored reduce los rechazos del modelo, lo que implica mayor probabilidad de generar contenido danino, ofensivo o inseguro sin filtro. No es recomendable para produccion orientada al publico sin una capa de moderacion externa.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el modo uncensored puede reducir la cautela del modelo al expresar incertidumbre.
- Cobertura linguistica limitada a ingles y chino; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- La ventana de 262K tokens es nativa, pero el rendimiento real en contextos muy largos y el coste de memoria asociado no se detallan.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y la cadena de fusiones intermedias deberian revisarse para confirmar la compatibilidad de licencias en una cadena de derivados tan larga.
- El repo ocupa 427,2 GB; conviene descargar solo el fichero de cuantizacion necesario.
- El nombre del modelo y las etiquetas incluyen afirmaciones de marketing ("beats-claude-opus-4.6") que no constituyen evidencia tecnica.
- El soporte de tool calling no se documenta explicitamente; debe validarse antes de integrarlo en pipelines agenticos.
- La dependencia de runtimes especificos (Anvil/TurboQuant, MTP integrado) puede limitar la portabilidad frente a llama.cpp estandar.

## Enlaces

- Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised-DSpark-MTP
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Dataset declarado: https://huggingface.co/datasets/Solstice-AI/Solace-1.0-Omni
- Runtime Anvil: https://github.com/Solstice-Labs/anvil
- Perfil del autor del modelo base: https://huggingface.co/DavidAU
- Perfil del cuantizador: https://huggingface.co/Solstice-AI
