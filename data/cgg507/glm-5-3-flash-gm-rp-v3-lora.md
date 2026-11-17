# cgg507/GLM-5.3-Flash-GM-RP-v3-LoRA

## Resumen

GLM-5.3-Flash-GM-RP-v3-LoRA es un adaptador LoRA (PEFT) para el modelo multimodal zai-org/GLM-5.3-Flash, desarrollado por el usuario cgg507. No es un modelo base, sino un ajuste fino de bajo rango orientado a un nicho muy concreto: la interpretación de rol de "Game Master" (narrador de partidas de rol de mesa) y el roleplay de personajes, con un bloque de razonamiento (`<think>...</think>`) obligatorio en cada turno del asistente. Se publica como adaptador experimental para ficción oscura y partidas de mesa, sin ajuste de seguridad más allá del modelo base.

El modelo subyacente es un transformer MoE con atención híbrida (capas de atención lineal KDA y capas MLA) y 42 capas MoE con 288 expertos enrutados cada una. El adaptador cubre atención, expertos compartidos, MLPs densos y todos los expertos enrutados, pero deja sin adaptar routers, indexador DSA, parámetros mHC, embeddings, lm_head, torre de visión y capa MTP.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, cuya utilidad práctica se limita a entornos de roleplay y narrativa interactiva sobre el modelo base. Los datos de arquitectura del modelo base se deducen de la model card del adaptador (capas, expertos, tipos de atención), pero no se dispone de especificaciones completas del modelo original en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE híbrido con atención lineal KDA y MLA (modelo base GLM-5.3-Flash) |
| Parámetros totales | no disponible (adaptador: 496 adaptadores de atención/shared/dense + 36.288 adaptadores de expertos enrutados) |
| Parámetros activos | no disponible (MoE con 288 expertos enrutados por capa, 42 capas MoE) |
| Longitud de contexto | no disponible (entrenado con secuencia máxima de 36.864 tokens) |
| Tipos de cuantización | bf16 en entrenamiento; el modelo base dispone de variante NVFP4 (RedHatAI/GLM-5.3-Flash-NVFP4) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT: `adapter_model.safetensors`; nmoe-lora-v1: `nmoe/adapter.safetensors`, `nmoe/adapter_experts.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base MoE con dos tipos de capas de atención: 34 capas de atención lineal KDA (con proyecciones `q_proj`, `k_proj`, `v_proj`, `b_proj`, `forget_gate.f_a_proj`, `forget_gate.f_b_proj`, `g_a_proj`, `g_b_proj`, `o_proj`) y 11 capas MLA (con `q_a_proj`, `q_b_proj`, `kv_a_proj_with_mqa`, `kv_b_proj`, `o_proj`). Las 42 capas MoE cuentan con 288 expertos enrutados cada una, más un experto compartido. El adaptador usa rank 64 / alpha 32 (escala 0,5) para atención, experto compartido y MLPs densos, y rank 32 / alpha 16 (escala 0,5) para los expertos enrutados, sin rsLoRA, sin DoRA y con dropout 0 en bf16.

El entrenamiento se realizó sobre 3.988 conversaciones: 731 campañas de Game Master (largas, ~45k tokens cada una, 83 % de los tokens) y 3.257 conversaciones de roleplay de personaje (1-2k tokens). En total, 40.159 turnos del asistente, cada uno con bloque de razonamiento, y 29,6M de tokens entrenados. Se usó un árbol de historia compartida (5.070 documentos de árbol, 62,9M de filas por época frente a 256,4M como muestras separadas, 4,08 veces menos), secuencia máxima de 36.864, una época de 288 pasos con acumulación de gradiente 8, optimizador Muon, lr 2e-4, warmup 5, coseno hasta el 10 % y grad clip 1,0. La pérdida bajó de 1,22 (media de los primeros 10 pasos) a 1,02 (media de los pasos 271-280). Se publica el checkpoint del paso 280 de 288 (97,5 % de la época) porque el paso 288 era un único documento residual de 1,7k tokens con una actualización Muon ruidosa. El entrenamiento se hizo con un trainer propio en C++/ROCm (nmoe) sobre 2x Radeon AI PRO R9700, a ~530 tok/s durante ~33 horas, partiendo de RedHatAI/GLM-5.3-Flash-NVFP4 con expertos enrutados en NVFP4 y atención/shared/dense en BF16, con activaciones fp8 en las GEMM congeladas.

## Capacidades

- Generación de texto narrativo largo en formato de campaña de rol (Game Master) y roleplay de personaje.
- Razonamiento explícito en cada turno mediante bloque `<think>...</think>` (mediana ~1,7k caracteres), entrenado turno a turno.
- Estilo de antagonistas y PNJ duros: amenazan y cumplen sus amenazas, sin suavizar.
- Capacidad multimodal heredada del modelo base (pipeline `image-text-to-text`), aunque el adaptador no modifica la torre de visión.
- Soporte de conversaciones multi-turno con contexto largo (hasta 36.864 tokens en entrenamiento).
- Contenido para ficción adulta y partidas de mesa: violencia gráfica, crueldad y lenguaje soez cuando la escena lo requiere.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico específico en la información disponible.

## Casos de uso

- Campañas de rol de mesa asistidas: el adaptador está entrenado con 731 campañas de ~45k tokens, por lo que puede mantener coherencia narrativa y de PNJ a lo largo de sesiones largas con contexto extenso.
- Roleplay de personaje en ficción interactiva: las 3.257 conversaciones de roleplay de 1-2k tokens permiten diálogos de personaje con reacciones duras y consistentes.
- Generación de ficción oscura: útil para escribir escenas con violencia gráfica y antagonistas que no se suavizan, dado el estilo sin ajuste de seguridad adicional.
- Narrador de partidas con razonamiento visible: el bloque `<think>` permite auditar la lógica del Game Master antes de la respuesta, útil para depurar coherencia de tramas.
- Prototipado de experiencias conversacionales de nicho: sirve como base para evaluar estilos narrativos antes de invertir en un ajuste propio.
- Investigación sobre fine-tuning de adaptadores en MoE con expertos enrutados: el repositorio documenta el layout PEFT exacto (block-diagonal sobre `gate_up_proj`/`down_proj`) y scripts de validación, útil como referencia técnica.
- Integración multimodal en narrativa: al heredar el pipeline `image-text-to-text` del modelo base, puede incorporar imágenes en escenas, aunque el adaptador no entrena la torre de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento (pérdida de 1,22 a 1,02) y de validación del export (992/992 tensores byte-idénticos, 36.288/36.288 matrices de expertos decodificadas bit-exactas, resultado PASS).

## Requisitos de hardware

- El adaptador en sí ocupa 65,7 GB en el repositorio, pero la inferencia requiere cargar el modelo base completo GLM-5.3-Flash; la VRAM depende del tamaño del base, que no está disponible en la información proporcionada.
- Entrenamiento realizado sobre 2x Radeon AI PRO R9700 (~33 h, ~530 tok/s) partiendo de la variante NVFP4, lo que da una referencia de hardware mínimo para ajuste.
- El modelo base dispone de variante NVFP4 (RedHatAI/GLM-5.3-Flash-NVFP4), pensada para reducir requisitos de memoria en GPUs compatibles con FP4.
- No se dispone de estimaciones de VRAM para inferencia en consumer GPU ni de listado de GPUs recomendadas (A100, H100, RTX 4090) en la información disponible.
- Despliegue vía PEFT con transformers (requiere soporte de `glm5_next` y peft >= 0.21 con `target_parameters`); no se documentan opciones vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput de inferencia: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cgg507/GLM-5.3-Flash-GM-RP-v3-LoRA | zai-org/GLM-5.3-Flash | LoRA PEFT | Game Master + roleplay con CoT | MIT | Hugging Face |
| cgg507/GLM-5.3-Flash-GM-CoT-LoRA | zai-org/GLM-5.3-Flash | LoRA PEFT | Solo Game Master con CoT | no disponible | Hugging Face |
| cgg507/GLM-5.3-Flash-GM-E32-LoRA | zai-org/GLM-5.3-Flash | LoRA PEFT | Game Master (variante E32) | no disponible | Hugging Face |
| cgg507/Ornith-1.5-35B-A3B-REAP20-GM-RP-v3-FP8 | Ornith-1.5-35B-A3B REAP-20 | Modelo FP8 | Mismos datos v3 sobre otro base | no disponible | Hugging Face |

## Limitaciones y advertencias

- Adaptador experimental, no un modelo autónomo: requiere cargar el modelo base GLM-5.3-Flash (o su variante BF16) y peft >= 0.21.
- Sin ajuste de seguridad más allá del modelo base: puede generar contenido adulto, violencia gráfica, crueldad y lenguaje soez de forma deliberada.
- Solo idioma inglés (`en`); no se documenta soporte multilingüe.
- Riesgo de repetición: el autor descarta el paso 288 por ser más repetitivo que el 280, lo que indica sensibilidad al checkpoint.
- El razonamiento es largo (mediana ~1,7k caracteres); con presupuestos de razonamiento inferiores a 1500 tokens los turnos pueden agotarse antes de la respuesta.
- La fusión de deltas de expertos enrutados directamente sobre expertos NVFP4 no funciona (los deltas quedan por debajo del paso fp4); hay que fusionar en alta precisión y recuantizar después.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria independiente.
- Licencia MIT para el adaptador, pero conviene verificar la licencia del modelo base antes de uso comercial.
- Sin datos de benchmarks que permitan estimar calidad frente a alternativas.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/cgg507/GLM-5.3-Flash-GM-RP-v3-LoRA
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Modelo base en BF16: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Variante NVFP4 usada en entrenamiento: https://huggingface.co/RedHatAI/GLM-5.3-Flash-NVFP4
- Adaptador hermano GM-CoT: https://huggingface.co/cgg507/GLM-5.3-Flash-GM-CoT-LoRA
- Adaptador hermano E32: https://huggingface.co/cgg507/GLM-5.3-Flash-GM-E32-LoRA
- Modelo hermano sobre Ornith-1.5-35B-A3B: https://huggingface.co/cgg507/Ornith-1.5-35B-A3B-REAP20-GM-RP-v3-FP8
