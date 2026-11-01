# efeisot/minicpm5-2b-hybrid-kquants

## Resumen

MiniCPM5-2B hybrid K-quants es una cuantización no oficial del modelo openbmb/MiniCPM5-2B, publicado por el usuario efeisot en HuggingFace. No es un modelo nuevo, sino dos archivos GGUF con una receta de cuantización híbrida por tensor (Q4_K en gate/up_proj, Q5_K en down_proj, Q5_K o Q6_K en atención y embeddings, Q8_0 en la salida) diseñada como alternativa de mayor calidad a la versión Sharp Q4_K_XL. Su objetivo es ofrecer el mejor equilibrio entre tamaño (1,7-1,8 GB) y fidelidad respecto al modelo F16 original, con la ventaja de cargar en llama.cpp estándar sin runtimes parcheados ni tipos de tensor personalizados.

El modelo base, MiniCPM5-2B de OpenBMB, es un modelo de generación de texto conversacional de aproximadamente 2.517 millones de parámetros, entrenado principalmente para inglés y chino. Esta cuantización es relevante para desarrolladores que ejecutan modelos pequeños en hardware modesto (portátiles, GPUs de consumo, Raspberry Pi de gama alta) y que necesitan maximizar la calidad de generación en código y texto por debajo de los 2 GB de disco. Los datos de evaluación publicados muestran que ambas variantes híbridas superan a Sharp Q4_K_XL en divergencia KL y precisión top-1 sobre un corpus de código Python, aunque no alcanzan a las cuantizaciones Q5_K_XL y Q6_K_XL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (MiniCPM5); detalles no disponibles |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible para el modelo base (los tests usan 512 tokens) |
| Tipos de cuantizacion | Híbrida: gate/up Q4_K, down Q5_K, atención Q5_K o Q6_K, token_embd Q5_K o Q6_K, output Q8_0, normas F32 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache-2.0 (modelo base y metadatos de cuantización) |
| Formato de pesos | GGUF (dos variantes: compact 1,704 GB, quality 1,792 GB) |

## Arquitectura y entrenamiento

El modelo base es MiniCPM5-2B de OpenBMB, un transformer decoder de 2.516.756.480 parámetros orientado a generación de texto conversacional en inglés y chino. Los detalles de arquitectura del modelo base (número de capas, cabezas de atención, longitud de contexto nativa) no están disponibles en la información proporcionada. Tampoco se dispone de datos sobre el corpus de entrenamiento, el número de tokens ni el uso de técnicas de alineación como RLHF o DPO.

La innovación de este repositorio está en la cuantización, no en el modelo base. El autor aplica una receta híbrida por tensor: mantiene a mayor precisión las partes más sensibles del modelo (down_proj en Q5_K, atención, embeddings de tokens y la capa de salida en Q8_0), mientras que las proyecciones gate_proj y up_proj, que ocupan la mayor parte del tamaño, se comprimen a Q4_K. La calibración se realiza con una matriz de importancia (imatrix) de 32x512 construida a partir de código Python de la librería estándar y texto decodificado de WikiText-2 y C4. Los archivos se generaron con `llama-quantize --tensor-type-file` desde el GGUF F16, usando Q6_K como tipo de reserva. A diferencia de la versión RCO, no emplea tipos de tensor personalizados, por lo que funciona en llama.cpp v0.7.0 o superior sin parches.

## Capacidades

- Generación de texto conversacional en inglés y chino, heredada del modelo base MiniCPM5-2B.
- Generación de código Python razonable para su tamaño: la evaluación del autor usa un corpus held-out de código Python de la librería estándar como métrica de calidad de cuantización.
- Compatibilidad total con llama.cpp estándar (v0.7.0 o superior), sin runtime parcheado ni tipos de tensor experimentales.
- Dos perfiles de despliegue: "compact" (mejor relación tamaño/calidad, 1,704 GB) y "quality" (máxima calidad por debajo de 1,8 GB, 1,792 GB).
- Soporte de plantillas de chat vía `--jinja` en llama.cpp.
- Aceleración parcial o total en GPU mediante `-ngl 99` si el modelo completo cabe en VRAM.

No hay información sobre capacidades de visión, audio, tool calling, agentes ni modos de razonamiento extendido.

## Casos de uso

- Chatbots locales en inglés y chino: con 1,7 GB de disco y VRAM mínima, es idóneo para asistentes conversacionales que corren íntegramente en un portátil o en una GPU de consumo antigua, sin depender de la nube.
- Autocompletado y generación de código Python en el editor: la receta de cuantización está calibrada específicamente con código Python (stdlib, WikiText-2 y C4), y los datos de KL y top-1 sobre el corpus code2 indican buena fidelidad en este dominio respecto al modelo F16.
- Integración en dispositivos edge y aplicaciones embebidas: el tamaño de 1,7 GB permite ejecutar el modelo en equipos sin GPU dedicada mediante inferencia CPU de llama.cpp, útil para kioscos, herramientas offline o aplicaciones de escritorio.
- Prototipado rápido de pipelines de LLM: al cargar en llama.cpp estándar sin parches, se puede integrar en servidores locales (llama-server) o en herramientas como Ollama con mínima fricción y sin riesgo de incompatibilidad de runtime.
- Comparación y evaluación de esquemas de cuantización: el repositorio incluye la imatrix, los listados exactos de tipos de tensor, los resultados de evaluación en JSON y documentación de reproducción, lo que lo hace útil como referencia para estudiar el impacto de recetas híbridas K-quant.
- Procesamiento de texto por lotes en servidores modestos: tareas como resumen, clasificación o reescritura de texto en inglés y chino donde el presupuesto de VRAM o disco está por debajo de 2 GB por instancia.

## Benchmarks y rendimiento

Resultados publicados por el autor (mismo harness que la versión Sharp RCO). WikiText-2 test con `--chunks 16 -c 512`; code2 es un corpus held-out de Python stdlib (8.176 tokens, KL contra logits del donante F16); la columna 128 KB usa los primeros 131.041 bytes de code2:

| Model | Size | Wiki PPL ↓ | code2 mean KL ↓ | code2 p99 ↓ | code2 top-1 ↑ | 128 KB p99 ↓ | 128 KB top-1 ↑ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Sharp Q4_K_XL | 1,596 GB | 14,1703 | 0,117031 | 1,236705 | 89,314% | 1,167117 | 89,060% |
| Hybrid compact | 1,704 GB | 14,2088 | 0,093637 | 1,047941 | 90,527% | 0,972205 | 90,196% |
| Hybrid quality | 1,792 GB | 14,0549 | 0,080348 | 0,905976 | 91,262% | 0,888669 | 91,075% |
| Sharp Q5_K_XL | 1,886 GB | 14,0500 | 0,035117 | 0,405327 | 93,983% | 0,370611 | 93,881% |
| Sharp Q6_K_XL | 2,198 GB | 13,8951 | 0,010015 | 0,107180 | 96,483% | 0,110036 | 96,484% |

Ambas variantes híbridas superan a Sharp Q4_K_XL en p99 y top-1 de code2, a cambio de 108-196 MB adicionales. Ninguna supera a Q5_K_XL ni Q6_K_XL. No se han publicado benchmarks estándar del modelo base (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 1,59 GiB para la variante compact y 1,67 GiB para la variante quality si se descarga el modelo completo a GPU (`-ngl 99`); en CPU puro, basta con ~2 GB de RAM.
- GPUs recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM libres (por ejemplo, GTX 1650, RTX 3050 o superiores). No se requieren A100 ni H100: el modelo es pequeño.
- Cabe sin problemas en GPUs de consumo de gama baja y media; también es viable en CPU-only con 8 hilos (`-t 8`), según el comando de ejemplo del autor.
- Despliegue: llama.cpp (v0.7.0 o superior, obligatorio por el tokenizador de MiniCPM5), llama-server, y en principle cualquier runtime compatible con GGUF estándar (Ollama, LM Studio). No se ha verificado compatibilidad con vLLM ni TGI para estos archivos GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo de 2,5B con ~1,7 GB, se espera inferencia fluida en CPU moderna y muy alta en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tamaño GGUF | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| efeisot/minicpm5-2b-hybrid-kquants | 2,52B | 1,704-1,792 GB | Híbrida Q4_K/Q5_K/Q6_K/Q8_0 | no disponible | Apache-2.0 | Carga en llama.cpp estándar; mejor KL/top-1 que Sharp Q4_K_XL |
| Sharp Q4_K_XL (RCO, mismo modelo base) | 2,52B | 1,596 GB | Q4_K_XL | no disponible | Apache-2.0 (base) | Más pequeño, pero peor p99 y top-1 en code2 |
| Sharp Q5_K_XL / Q6_K_XL (RCO, mismo modelo base) | 2,52B | 1,886 / 2,198 GB | Q5_K_XL / Q6_K_XL | no disponible | Apache-2.0 (base) | Superior en calidad (top-1 93,98% / 96,48%); requieren runtime RCO |
| openbmb/MiniCPM5-2B (F16) | 2,52B | ~5 GB (estimado) | F16 | no disponible | Apache-2.0 | Referencia de calidad máxima; requiere más recursos |

## Limitaciones y advertencias

- No sustituye a las cuantizaciones Sharp en todos los tamaños: Q4_K_XL es más pequeño y Q5_K_XL/Q6_K_XL siguen siendo mejores en calidad; la variante quality tampoco alcanza a Q6_K_XL (p99 0,107 frente a 0,906).
- La receta es deliberadamente híbrida, no uniforme: down_proj está en Q5_K mientras gate/up están en Q4_K; copiar la receta a otros modelos sin ajustar puede no dar los mismos resultados.
- Sensible a la imatrix: los resultados dependen de la matriz de calibración incluida (32x512, código + Wiki/C4); un conjunto de calibración distinto puede desplazar la cola de la distribución de errores.
- El corpus code2 es held-out y no debe usarse para ajustar recetas de cuantización, o las métricas pierden validez.
- Compatibilidad de runtime: se requiere llama.cpp v0.7.0 o superior; versiones anteriores pueden no reconocer el tokenizador de MiniCPM5 aunque los tipos de tensor sean estándar.
- Riesgo de alucinación y sesgos: heredados del modelo base MiniCPM5-2B; no hay evaluaciones específicas de sesgo ni de seguridad en la información disponible.
- Limitación de idiomas: el modelo base está orientado a inglés y chino; el rendimiento en castellano u otros idiomas no está documentado y puede ser inferior.
- Licencia: Apache-2.0 en modelo base y metadatos, sin restricciones conocidas para uso comercial; llama.cpp es MIT.
- Datos de contexto, capacidades de tool calling y benchmarks estándar del modelo base no disponibles en la información proporcionada.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/efeisot/minicpm5-2b-hybrid-kquants
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio RCO (formato experimental, referencia del autor): no disponible (URL no proporcionada en la model card)
- Documentación de reproducción: docs/REPRODUCE.md dentro del repositorio
- Resultados de evaluación: metadata/eval_results.json dentro del repositorio
- Sumas de verificación: SHA256SUMS dentro del repositorio
- Paper del modelo base: no disponible
