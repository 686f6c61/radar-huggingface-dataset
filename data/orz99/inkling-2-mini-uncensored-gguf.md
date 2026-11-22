# orz99/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored-GGUF es una compilación no censurada del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario orz99. Se distribuye en formato GGUF para llama.cpp e incluye tanto tres archivos ya fusionados con la edición aplicada como un adaptador LoRA independiente que puede aplicarse sobre cualquier GGUF del repositorio base AtomicChat/Inkling-2-Mini-GGUF. El modelo base es un Mixture of Experts de 26.400 millones de parámetros totales con 3.400 millones activos y una arquitectura de núcleo con bucles (looped core), capaz de aceptar entrada de texto e imagen.

La modificación consiste en un LoRA de rango 1 aplicado sobre los 49 puntos que escriben en el flujo residual: la salida de atención y los expertos enrutados de las 24 capas, más el embedding de tokens. El objetivo declarado es eliminar la dirección de rechazo por capa, medida como la diferencia de activaciones medias entre prompts dañinos e inofensivos en inglés y ruso. El autor reporta métricas de fidelidad (KLD y top-1) frente al BF16 original y una batería de evaluación de rechazo y sobre-rechazo.

La relevancia de esta ficha es doble: por un lado documenta una variante sin censura de un modelo multimodal con arquitectura MoE poco habitual; por otro, sirve de ejemplo de las implicaciones técnicas y éticas de las ediciones de direcciones de activación, un campo en rápida expansión dentro del ecosistema open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo con bucles (looped core); 24 capas, 12 de ellas con pesos compartidos entre tres pasadas |
| Parametros totales | 26.070.385.152 (26,4 B) |
| Parametros activos | 3,4 B (MoE) |
| Longitud de contexto | 32.768 tokens (configuración de ejemplo en llama-server) |
| Tipos de cuantizacion | AD-Q4_K (16,53 GB), AD-IQ3_S (13,34 GB), AD-IQ2_M (8,67 GB); LoRA en GGUF (0,04 GB); proyector de visión F16/BF16 (0,64 GB) |
| Idiomas soportados | No disponible (el autor menciona evaluación en inglés y ruso, sin lista oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); adaptador LoRA en GGUF; proyector mmproj separado |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura Mixture of Experts con 26,4 B de parámetros totales y 3,4 B activos por token, organizada en 24 capas. Doce de esas capas son "looped": comparten pesos a lo largo de tres pasadas, de modo que la red efectivamente ejecuta 48 pasadas de cómputo con 24 conjuntos de pesos. Esta compartición reduce el coste de memoria y explica que la edición LoRA de rango 1 sobre 49 puntos cubra las 48 pasadas. El modelo acepta entrada multimodal texto-imagen mediante un proyector de visión (mmproj) que se distribuye por separado en F16 o BF16.

Sobre el entrenamiento del modelo base no se aporta información en la documentación disponible: no se detallan el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. La edición de orz99 consiste en un LoRA de rango 1 entrenado para restar la dirección de rechazo propia de cada capa, calculada como la diferencia entre activaciones medias en prompts dañinos e inofensivos (en inglés y ruso), con la media de los inofensivos proyectada fuera. La dirección se agrega sobre prompts con y sin razonamiento, porque el modelo razona incluso con esfuerzo `none` y decide rechazar dentro de su cadena de razonamiento. El adaptador se construyó con el split de entrenamiento de mlabonne/harmful_behaviors y su traducción al ruso.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 32.768 tokens.
- Entrada de imagen junto con texto (pipeline image-text-to-text) mediante el proyector mmproj.
- Razonamiento explícito con niveles de esfuerzo configurables (`none`, `low`, `high`) y presupuesto de tokens de razonamiento.
- Capacidades multilingües al menos en inglés y ruso, según la evaluación del autor; no hay lista oficial de idiomas.
- Compatibilidad con llama.cpp y endpoints compatibles (tag `endpoints_compatible`), lo que facilita su integración en servidores tipo OpenAI.
- Soporte de plantillas de chat mediante `--jinja` en llama-server.
- No se documenta soporte explícito de tool calling, function calling ni uso como agente multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineación y rechazo: el par formado por el modelo base y esta variante permite estudiar cómo se codifica la negativa a responder en el flujo residual y qué efectos tiene eliminarla, con métricas de KLD y top-1 ya publicadas.
- Despliegue local en estaciones de trabajo con GPU de consumo: la cuantización IQ2_M (8,67 GB) permite ejecutar un MoE de 26,4 B en GPUs con 10-12 GB de VRAM, manteniendo un 85,7 % de top-1 frente al BF16.
- Procesamiento de documentos con imágenes: al aceptar entrada texto-imagen, puede emplearse para extraer y resumir información de capturas, diagramas o formularios en un pipeline local sin conexión.
- Asistentes conversacionales de dominio cerrado: con 32k de contexto y decodificación vía llama-server con API compatible, encaja en prototipos de atención al cliente o soporte interno donde el filtrado de contenido se gestiona en capas externas.
- Evaluación comparativa de cuantizaciones: los tres GGUF publicados con sus valores de KLD y top-1 permiten medir el compromiso entre tamaño y fidelidad en un MoE con capas compartidas.
- Experimentación con adaptadores LoRA en llama.cpp: el adaptador de 0,04 GB puede combinarse con distintos GGUF base (de BF16 a 1-bit) para estudiar la transferencia de la edición entre niveles de cuantización.
- Generación de texto creativo sin restricciones de contenido, en entornos controlados y con revisión humana posterior.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad frente al BF16 original y de comportamiento de rechazo. No se aportan resultados de MMLU, HumanEval ni GSM8K completos; solo se menciona que la evaluación de MMLU consta de 2.000 preguntas, sin cifras en la información disponible.

| Metrica | Original | Con adaptador | Umbral | Resultado |
|---|---:|---:|---|---|
| KLD AD-Q4_K vs BF16 | 0,0080 (base) | 0,0115 | no disponible | — |
| Top-1 AD-Q4_K | 96,3 % (base) | 95,6 % | no disponible | — |
| KLD AD-IQ3_S vs BF16 | 0,0205 (base) | 0,0235 | no disponible | — |
| Top-1 AD-IQ3_S | 94,2 % (base) | 93,8 % | no disponible | — |
| KLD AD-IQ2_M vs BF16 | 0,130 (base) | 0,132 | no disponible | — |
| Top-1 AD-IQ2_M | 85,7 % (base) | 85,7 % | no disponible | — |
| Rechazo en test dañino inglés (81), sin razonamiento | 81 (100 %) | 0 | ≤ 3 % | pasa |
| Rechazo en test dañino ruso (100), sin razonamiento | 91 (91 %) | 0 | ≤ 3 % | pasa |
| Rechazo en validación dañina inglés (104) / ruso (100) | 100 % / 89 % | 0 / 0 | ≤ 3 % | pasa |
| Rechazo con razonamiento, esfuerzo `low` (30) | 28 | 0 | ≤ 1 | pasa |
| Rechazo con razonamiento, esfuerzo `high` (30) | 26 | 0 | ≤ 1 | pasa |
| Rechazo en chat dañino, esfuerzo `none` / `low` (8) | 8 / 8 | 0 / 0 | no disponible | — |
| Sobre-rechazo XSTest, prompts seguros (250) | 10 (4,0 %) | 0 | ≤ original + 1 pt | pasa |
| Respuestas vacías | 0 | 0 | ≤ 1 % | pasa |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB con IQ2_M (8,67 GB de pesos), 14-15 GB con IQ3_S (13,34 GB) y 17-18 GB con Q4_K (16,53 GB), más el proyector de visión (0,64 GB) y la caché KV para el contexto elegido.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K con contexto largo; RTX 4080/4070 Ti Super (16 GB) para IQ3_S; RTX 3060 12 GB o RTX 4070 para IQ2_M. En el segmento profesional, A100 y H100 permiten contexto completo de 32k con holgura.
- Cabe en GPU de consumo: sí, incluso en tarjetas de 10-12 GB con la cuantización IQ2_M, a costa de una fidelidad del 85,7 % de top-1.
- Opciones de despliegue: llama.cpp (llama-server) con la versión b12600 o superior, que incorpora la arquitectura de bucles de Inkling 2 del PR #32694. No se documenta soporte en vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. Como referencia estructural, al activar solo 3,4 B de parámetros por token, el coste por token es comparable a un modelo denso de ese tamaño, aunque el autor no publica cifras.
- Es necesario usar `--jinja` para la plantilla de chat y `-ngl 99` para descargar todas las capas en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored | 26,4 B | 3,4 B | 32.768 | Apache-2.0 | GGUF, LoRA | Variante sin censura, multimodal, requiere llama.cpp b12600+ |
| Inkling-2-Mini (base) | 26,4 B | 3,4 B | no disponible | Apache-2.0 | safetensors, GGUF | Modelo original con rechazo activo; misma arquitectura de bucles |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- La eliminación de la dirección de rechazo es global y no selectiva: el adaptador anula la negativa a responder en todos los dominios evaluados, lo que incluye contenido dañino, ilegal o peligroso. No debe desplegarse en producción orientada al público sin capas de moderación externas.
- El propio autor reconoce que la edición se midió con prompts de mlabonne/harmful_behaviors y su traducción al ruso; el comportamiento fuera de esa distribución (otros idiomas, jailbreaks, dominios no cubiertos) no está evaluado.
- La evaluación de sobre-rechazo se limita a XSTest (250 prompts seguros); no hay datos sobre otros conjuntos como OR-Bench.
- Los GGUF publicados dependen de una versión concreta de llama.cpp (b12600 o superior, PR #32694). Mezclar archivos del layout antiguo (PR #32695) con la implementación nueva provoca fallos.
- Fidelidad degradada en cuantizaciones bajas: IQ2_M presenta un KLD de 0,132 frente a 0,0115 de Q4_K, con un top-1 del 85,7 %; no es adecuada para tareas que requieran precisión alta.
- No se documentan sesgos específicos del modelo base ni del adaptador; al ser una edición sobre un modelo multimodal, los riesgos de sesgo visual y textual del original se heredan sin mitigación adicional.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de salvaguardas de contenido traslada al integrador toda la responsabilidad legal y ética sobre los resultados generados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-22): no hay evidencia de uso comunitario ni validación independiente de las métricas reportadas.
- La model card incluye enlaces promocionales a Atomic Chat y Discord; deben tratarse como material de marketing, no como documentación técnica verificada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orz99/Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF del modelo base: https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF
- PR de llama.cpp con la arquitectura de bucles: https://github.com/ggml-org/llama.cpp/pull/32694
- PR antiguo (layout obsoleto): https://github.com/ggml-org/llama.cpp/pull/32695
- Guía de ejecución local: https://atomic.chat/blog/guides/how-to-run-inkling-2-mini-uncensored-locally
- Dataset de evaluación de rechazo: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de sobre-rechazo: https://huggingface.co/datasets/walledai/XSTest
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
