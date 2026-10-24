# orcarouter/DeepSeek-V4.1-Flash-1017-abliterated-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-abliterated-GGUF es la distribución en formato GGUF del modelo `orcarouter/DeepSeek-V4.1-Flash-1017-abliterated`, una versión con el alineamiento de seguridad reducido (abliterated) del checkpoint DeepSeek-V4.1-Flash-1017. Lo publica el usuario orcarouter, que mantiene el gateway OrcaRouter, y su objetivo es permitir ejecutar localmente un MoE de gran tamaño sobre llama.cpp sin necesidad de un clúster de GPUs. La metadata de HuggingFace declara 748.494.643.824 parámetros totales (unos 748,5B), mientras que la model card habla de un MoE de 763B; la discrepancia no se explica en la información disponible.

La arquitectura combina 384 expertos enrutados con activación top-6, atención dispersa comprimida y una memoria n-gram llamada Engram de 197B parámetros que se lee desde disco (48 filas por token) en lugar de residir en memoria. El contexto declarado es de 1M tokens y los idiomas soportados son inglés y chino. La innovación principal del repositorio es la cuantización en precisión mixta: cada capa y cada experto recibe su propio número de bits a partir de la divergencia KL medida, no de una regla fija.

Es relevante ahora porque demuestra que un modelo de esta escala puede ejecutarse en una sola máquina de 256 GB de memoria con una pérdida de perplejidad del +2,4% respecto al original, y porque la variante abliterated lo convierte en una herramienta específica para investigación en mecanismos de rechazo y red teaming, no para despliegues de producción convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 384 expertos enrutados (top-6), atención dispersa comprimida y memoria Engram n-gram |
| Parámetros totales | 748.494.643.824 (metadata de HuggingFace); la model card indica 763B, discrepancia no aclarada |
| Parámetros activos | No disponible (la model card no publica el número de parámetros activos con top-6) |
| Parámetros de la memoria Engram | 197B (tabla de 110,6 GB almacenada en disco) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantización | GGUF de precisión mixta por experto, guiada por divergencia KL e importance matrix (imatrix); 3,36 bpw en Mix-256G y 1,59 bpw en Mix-128G; se mencionan los tipos IQ1_S e IQ3_XXS de llama.cpp |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp); el checkpoint base sin pérdida usa expertos MXFP4, capas densas BF16 y Engram MXFP8 |
| Tamaño del repositorio | 572,5 GB |
| Descargas / likes | 0 descargas / 28 likes |
| Fecha de creación | 2026-10-22 (actualizado 2026-10-24) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 384 expertos enrutados y enrutamiento top-6, al que se añaden dos componentes poco habituales: atención dispersa comprimida, que reduce el coste de una ventana de 1M tokens, y una memoria Engram de 197B parámetros que funciona como tabla de n-gramas. En cada token, el mecanismo Engram lee 48 filas de esa tabla; llama.cpp mapea la tabla desde disco y la lee bajo demanda, de modo que sus 110,6 GB no ocupan RAM. Todo lo demás (expertos enrutados, capas densas y resto de pesos) sí debe caber en memoria.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento posterior. Lo que sí se documenta es el proceso de cuantización: los expertos enrutados son la única parte sobre la que se ajustó la precisión, y cada capa recibió su asignación de bits a partir de la divergencia KL medida, no de una regla manual. La evaluación se hizo contra el GGUF sin pérdida del mismo checkpoint (expertos MXFP4, denso BF16, Engram MXFP8, conversión bit-exacta) sobre wikitext-2 test, caracteres [0, 300000), 32 ventanas de 2048 tokens y KLD de vocabulario completo, con un conjunto que nunca vio la búsqueda de precisiones.

Además, el modelo es una variante abliterated: la dirección de rechazo se ha ortogonalizado de todas las matrices que escriben en el flujo residual, lo que elimina buena parte del alineamiento de seguridad del checkpoint original.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento explícito (etiqueta `reasoning` en la model card), orientado a tareas de varios pasos.
- Function calling / tool calling, según la etiqueta `function-calling`.
- Contexto de 1M tokens, apto para documentos o historiales muy largos.
- Ejecución local con llama.cpp sobre GGUF, sin dependencia de APIs externas.
- Compatibilidad con endpoints OpenAI a través del gateway OrcaRouter (el autor ofrece una versión alojada).
- Modo "uncensored": reduce deliberadamente las negativas, lo que se presenta como capacidad para red teaming e investigación de seguridad.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Red teaming y evaluación de robustez: el modelo acepta peticiones que el original rechaza, lo que permite generar casos adversarios y medir la eficacia de filtros y moderadores propios antes de desplegarlos.
- Investigación de mecanismos de rechazo: al estar ortogonalizada la dirección de rechazo, sirve para estudiar qué circuitos internos implementan la negativa y cómo se recuperan o suprimen, comparando contra el checkpoint original.
- Inferencia local de un MoE de gran tamaño: con 235,8 GB en memoria y la tabla Engram en SSD, un único servidor de 256 GB puede servir el modelo sin clúster, útil para entornos con requisitos de soberanía de datos.
- Procesamiento de documentos largos en inglés o chino: la ventana de 1M tokens permite resumir o extraer información de expedientes completos, contratos o bases de código en una sola pasada.
- Agentes con tool calling en pipelines internos: las etiquetas de function calling permiten integrarlo en flujos de automatización con herramientas externas, siempre que se añada una capa de moderación propia.
- Experimentación académica con cuantización: los dos builds publicados (Mix-256G y Mix-128G) y sus métricas de KLD permiten estudiar el compromiso entre precisión por experto y calidad de salida.
- Generación de datos sintéticos bilingües (en/zh) para ajuste fino, con la advertencia de que el contenido puede requerir filtrado posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de fidelidad de la cuantización frente al checkpoint sin pérdida: KLD de vocabulario completo, KLD en el percentil 99, coincidencia top-1 y perplejidad en wikitext-2 test.

| Build | En memoria | Descarga | Bits por peso (expertos) | KLD ↓ | KLD p99 | Top-1 ↑ | PPL (original 2,259) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Mix-256G | 235,8 GB | 346,5 GB | 3,36 bpw | 0,0507 | 0,64 | 93,74% | 2,313 (+2,4%) |
| llama.cpp IQ3_XXS (referencia) | 212,2 GB | no disponible | no disponible | 0,2704 | 3,16 | 85,12% | 2,841 (+25,8%) |
| Mix-128G | 114,0 GB | 225,0 GB | 1,59 bpw | 0,520 | no disponible | 78,5% | +54,7% |

## Requisitos de hardware

- Build Mix-256G (recomendado): 235,8 GB de RAM, memoria unificada o VRAM, más 110,6 GB de tabla Engram en SSD (346,5 GB de descarga total).
- Build Mix-128G: 114,0 GB en memoria y 225,0 GB de descarga; el autor lo describe como el suelo absoluto (todos los expertos en IQ1_S ya ocupan 111 GB) y advierte de que no sustituye al Mix-256G.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño, ningún acelerador de consumo actual puede albergarlo en una sola tarjeta; los escenarios realistas son servidores con memoria unificada de 256 GB o configuraciones multi-GPU cuya suma de VRAM alcance los 236 GB.
- Cabe en GPU de consumo: no. Se necesitan al menos ~236 GB de memoria para el build recomendado.
- Opciones de despliegue: llama.cpp como runtime principal (formato GGUF nativo); también API alojada compatible con OpenAI en OrcaRouter, sin descarga ni GPUs propias.
- Latencia y throughput: no disponibles. El único dato indirecto es que el Engram se lee desde disco a razón de 48 filas por token, lo que introduce E/S dependiente del almacenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad de cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mix-256G (este repo) | 748,5B (metadata HF) | 1M | KLD 0,0507; top-1 93,74%; PPL +2,4% | MIT | GGUF en HF, 235,8 GB en memoria |
| Mix-128G (mismo repo) | 748,5B (metadata HF) | 1M | KLD 0,520; top-1 78,5%; PPL +54,7% | MIT | GGUF en HF, 114,0 GB en memoria |
| llama.cpp IQ3_XXS (mismo modelo) | 748,5B (metadata HF) | 1M | KLD 0,2704; top-1 85,12%; PPL +25,8% | MIT | GGUF, 212,2 GB en memoria |
| DeepSeek-V4.1-Flash-1017-abliterated (base sin cuantizar) | 748,5B (metadata HF) | 1M | Referencia (sin pérdida en la variante MXFP4/BF16/MXFP8) | MIT | Safetensors en HF |

No se dispone de datos de otros modelos comparables de la misma categoría (MoE abliterated de ~750B en GGUF) en la información proporcionada.

## Limitaciones y advertencias

- El alineamiento de seguridad está sustancialmente reducido: la dirección de rechazo se ha ortogonalizado de todas las matrices que escriben en el flujo residual, por lo que el modelo cumplirá muchas peticiones dañinas, poco éticas u ilegales que el original rechazaría.
- El autor lo libera estrictamente para investigación legítima (interpretabilidad, seguridad de IA, estudio de mecanismos de rechazo, red teaming y evaluación de robustez) y declina toda responsabilidad por el uso.
- Es imprescindible añadir capas propias de seguridad, moderación y prevención de abuso antes de cualquier despliegue.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasas de alucinación; la única métrica disponible es la perplejidad.
- Limitación idiomática: solo se declaran inglés y chino; el rendimiento en castellano no está evaluado.
- El build Mix-128G degrada la calidad de forma severa (perplejidad +54,7% y uno de cada cinco tokens difiere del original), por lo que no es apto para uso fiable.
- El build Mix-256G requiere ~236 GB de memoria y 346,5 GB de descarga, además de almacenamiento rápido para la tabla Engram leída desde disco.
- Solo se distribuye en GGUF para llama.cpp; no hay pesos en safetensors ni compatibilidad declarada con vLLM o TGI.
- Licencia MIT: permite uso comercial, pero esa permisividad se aplica también a los outputs del modelo sin alineamiento, lo que traslada todo el riesgo legal al desplegador.
- El repositorio tiene 0 descargas y 28 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente de las métricas reportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/orcarouter/DeepSeek-V4.1-Flash-1017-abliterated-GGUF
- Modelo base (abliterated, sin cuantizar): https://huggingface.co/orcarouter/DeepSeek-V4.1-Flash-1017-abliterated
- Subcarpeta del build recomendado: https://huggingface.co/orcarouter/DeepSeek-V4.1-Flash-1017-abliterated-GGUF/tree/main/Mix-256G
- Subcarpeta del build reducido: https://huggingface.co/orcarouter/DeepSeek-V4.1-Flash-1017-abliterated-GGUF/tree/main/Mix-128G
- Gateway y versión alojada: https://www.orcarouter.ai
- Catálogo de modelos: https://www.orcarouter.ai/models
- Versión alojada citada en la model card: https://www.orcarouter.ai/models/orca/orcacyber-flash-1.0
- Perfil en X: https://x.com/OrcaRouter
- Discord: https://discord.gg/yAh6Tex6kx
- GitHub de la organización: https://github.com/Continuum-AI-Corp
- Licencia MIT: https://opensource.org/license/mit
- No se han encontrado enlaces adicionales relevantes en la búsqueda web: los resultados devueltos correspondían a la previsión meteorológica de Libourne y no guardan relación con el modelo.
