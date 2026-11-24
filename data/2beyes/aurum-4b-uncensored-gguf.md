# 2Beyes/Aurum-4B-Uncensored-GGUF

## Resumen

Aurum 4B v1 Uncensored es una variante del modelo Qwen3.5-4B de Alibaba en la que se ha eliminado el comportamiento de rechazo (refusal) mediante una edición quirúrgica de pesos. Lo desarrolla el usuario 2Beyes y se distribuye en formato GGUF para su uso con llama.cpp, además de una versión completa en safetensors BF16. El modelo conserva íntegramente los pesos originales de Qwen3.5-4B, incluida la torre de visión y la cabeza de predicción multi-token (MTP), y solo modifica las proyecciones de salida de atención y de la FFN en las capas 4 a 31 para eliminar las negativas a peticiones dañinas.

La propuesta es relevante porque ofrece un modelo de 4.326 millones de parámetros que cabe en tarjetas gráficas de 8 GB, con soporte de tool calling, visión y modo thinking, sin las restricciones de alineación del modelo base. Frente a otras variantes "abliterated" que aplican un fine-tuning de destilación completo, Aurum limita el cambio a la dirección de rechazo, preservando el conocimiento original de Qwen.

La licencia es Apache 2.0 y el idioma declarado es únicamente inglés. El repositorio GGUF ocupa 33,6 GB e incluye cuantizaciones desde Q3_K_M hasta Q8_0, además del proyector de visión en F16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B) con torre de visión y cabeza MTP |
| Parámetros totales | 4.326.350.848 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de llama.cpp usa `-c 16384`) |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q4_0, Q3_K_M |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp b12289) y safetensors BF16 en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con torre de visión y cabeza de predicción multi-token (MTP) para decodificación especulativa. No se ha reentrenado: la modificación consiste en tomar la diferencia de pesos entre Qwen3.5-4B y el modelo insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated, y conservar únicamente la componente que elimina los rechazos. En concreto, se aplican las 8 direcciones singulares principales del cambio (aproximadamente el 98 % de la variación) sobre los pesos de salida de atención (`self_attn.o_proj` / `linear_attn.out_proj`) de las capas 4 a 31, y la dirección principal sobre `mlp.down_proj` solo en los tensores donde representa más de la mitad del cambio. El fine-tuning de destilación del modelo de origen no se incluye.

El config, tokenizer y chat template provienen del modelo Heretic (mismo tokenizer que Qwen3.5). Las cuantizaciones GGUF se generaron con llama.cpp b12289 usando una importance matrix calculada sobre una mezcla Aurum hermana, con texto de calibración de prosa, código y chats con tool calls. El proyector de visión es el original de Qwen3.5-4B (GGUF de Unsloth) y no se modifica.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo thinking activable mediante `enable_thinking` en el chat template (los benchmarks publicados son con thinking desactivado).
- Tool calling y function calling (requiere `--jinja` en llama.cpp).
- Comprensión de imágenes mediante la torre de visión original de Qwen3.5-4B (pipeline `image-text-to-text`).
- Decodificación especulativa nativa mediante la cabeza MTP, con aproximadamente 1,4x de aceleración en código con 2 tokens de draft.
- Capacidades multilingües limitadas al inglés según la model card.
- Ausencia de rechazos: 0 negativas en 100 prompts dañinos de prueba según el autor.

## Casos de uso

- Asistente conversacional local en equipos de 8 GB de VRAM: con Q4_K_M (2,8 GB) y el proyector de visión (0,7 GB) cabe holgadamente en una RX 6600 o RTX 3060, permitiendo chat multi-turno con contexto de 16K tokens.
- Automatización de agentes con tool calling: el soporte de function calling vía `--jinja` permite integrarlo en flujos que consultan APIs, bases de datos o sistemas de ficheros, con la ventaja de la decodificación MTP para reducir latencia.
- Procesamiento de documentos con imágenes: la torre de visión permite extraer información de capturas, formularios o diagramas combinándola con razonamiento textual en un único modelo.
- Generación de código en pipelines locales: la velocidad medida (hasta 79 tokens/s en código con Q4_K_M en RX 6600) lo hace viable para autocompletado y generación de tests en entornos de desarrollo sin GPU de datacenter.
- Investigación sobre alineación y seguridad: al eliminar los rechazos de forma controlada y documentada, sirve como banco de pruebas para estudiar el comportamiento de modelos sin salvaguardas y diseñar capas de filtrado externas.
- Fine-tuning y merging: la versión BF16 en safetensors permite ajustar el modelo o fusionarlo con otros adaptadores, manteniendo la edición de rechazo como punto de partida.
- Despliegue en entornos air-gapped: al ser GGUF y funcionar con llama.cpp, puede ejecutarse sin conexión en hardware de consumo para tareas de análisis de texto e imagen.

## Benchmarks y rendimiento

El autor publica una comparación frente a Distill-Heretic 4B (insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated, en GGUF Q4_K_M de yachen4ever), ambos ejecutados en llama.cpp con Q4_K_M, thinking desactivado, decodificación greedy y sin system prompt. Los resultados numéricos concretos no se detallan en el texto de la model card (se remiten a imágenes: `benchmark-comparison.png` y `bfcl-netgraph.png`), por lo que no se reproducen cifras aquí. El autor indica que Aurum iguala la precisión en tool calling, conserva más conocimiento y no presenta rechazos, y advierte que las cifras de Qwen publicadas corresponden a BF16 con thinking largo y BFCL v4, por lo que no son directamente comparables.

| Métrica (Q4_K_M, thinking off) | Aurum 4B | Distill-Heretic 4B |
|---|---|---|
| Resultados numéricos | no disponibles en el texto | no disponibles en el texto |
| Tasa de rechazos (100 prompts dañinos) | 0 | no disponible |

Métricas de cuantización publicadas por el autor (frente a BF16):

| Fichero | Tamaño | KL vs BF16 | Mismo token top | Velocidad prosa/código (tok/s) |
|---|---|---|---|---|
| BF16 | 8,7 GB | 0 | 100 % | no medida |
| Q8_0 | 4,6 GB | 0,0028 | 98,6 % | 47 / 64 |
| Q6_K | 3,6 GB | 0,0067 | 97,2 % | 48 / 67 |
| Q5_K_M | 3,2 GB | 0,0111 | 96,2 % | 57 / 76 |
| Q4_K_M | 2,8 GB | 0,0277 | 93,7 % | 57 / 79 |
| Q4_K_S | 2,6 GB | 0,0304 | 93,2 % | 59 / 75 |
| IQ4_XS | 2,6 GB | 0,0360 | 92,5 % | 56 / 76 |
| Q4_0 | 2,6 GB | 0,0544 | 90,9 % | 58 / 81 |
| Q3_K_M | 2,3 GB | 0,0906 | 87,9 % | 59 / 80 |

Mediciones en RX 6600 8 GB con Vulkan, llama.cpp b12289 y MTP con 2 tokens de draft.

## Requisitos de hardware

- VRAM estimada: 2,3 GB (Q3_K_M), 2,8 GB (Q4_K_M, recomendado), 3,6 GB (Q6_K), 4,6 GB (Q8_0) y 8,7 GB (BF16). Añadir 0,7 GB para el proyector de visión si se usa entrada de imagen.
- GPU recomendadas: cualquier GPU con 8 GB o más para las cuantizaciones Q4 y Q5 (RX 6600, RTX 3060, RTX 4060). Para Q8_0 se recomienda 8 GB o más; para BF16, 12 GB o más.
- Cabe en GPU de consumo: sí, desde 4 GB con Q3_K_M y desde 8 GB con Q4_K_M más visión.
- Opciones de despliegue: llama.cpp (llama-server), con soporte de Ollama y otros frontends compatibles con GGUF. La versión BF16 en safetensors permite transformers y vLLM.
- Latencia y throughput: 57 tok/s en prosa y 79 tok/s en código con Q4_K_M en RX 6600 (Vulkan); la decodificación MTP aporta aproximadamente 1,4x en código. Drafts de más de 2 tokens resultaron más lentos en esa tarjeta.
- Comando de referencia: `llama-server -m Aurum-4B-Q4_K_M.gguf --mmproj mmproj-Aurum-4B-F16.gguf --jinja -c 16384 -ngl 999 --spec-type draft-mtp --spec-draft-n-max 2`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aurum 4B Uncensored | 4.326 M | no disponible | Apache 2.0 | GGUF, safetensors | Sin rechazos, visión y MTP, pesos Qwen originales |
| Qwen/Qwen3.5-4B | 4.326 M | no disponible | no disponible en la información | safetensors | Modelo base con alineación completa |
| insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated | 4.326 M (base) | no disponible | no disponible en la información | safetensors, GGUF (yachen4ever) | Destilación de Qwen3.8 más abliteration con Heretic |
| yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-GGUF | 4.326 M (base) | no disponible | no disponible en la información | GGUF Q4_K_M | Cuantización del anterior usada como referencia en benchmarks |

## Limitaciones y advertencias

- Modelo sin censura: no rechaza peticiones dañinas (0 rechazos en 100 prompts de prueba según el autor). No debe desplegarse en entornos donde usuarios que no hayan optado por un modelo sin filtros puedan acceder a él.
- Riesgo de alucinación inherente a un modelo de 4B, agravado por la ausencia de salvaguardas conversacionales.
- Idioma limitado al inglés según la model card; el rendimiento en castellano no está documentado.
- La longitud de contexto no se especifica en la información disponible; el ejemplo usa 16K, pero no se confirma el máximo soportado.
- Las modificaciones de pesos pueden degradar ligeramente el conocimiento o la coherencia en dominios sensibles; el autor reporta que Aurum conserva más conocimiento que la variante con destilación, pero no publica cifras detalladas en el texto.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el desplegador.
- El uso de MTP requiere flags específicos de llama.cpp y puede no estar disponible en otros runtimes.
- La model card advierte que las comparaciones con cifras publicadas de Qwen no son directas (BF16 con thinking largo frente a Q4 sin thinking).

## Enlaces

- Repositorio GGUF: https://huggingface.co/2Beyes/Aurum-4B-Uncensored-GGUF
- Repositorio BF16 safetensors: https://huggingface.co/2Beyes/Aurum-4B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo de referencia para la edición de rechazo: https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- GGUF de referencia para benchmarks: https://huggingface.co/yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
