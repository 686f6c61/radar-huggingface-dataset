# AtomicChat/DeepSeek-V4-Flash-0731-GGUF

## Resumen

DeepSeek-V4-Flash-0731-GGUF es la cuantización en formato GGUF del modelo DeepSeek-V4-Flash-0731, publicada por AtomicChat. Se trata de un modelo de mezcla de expertos (MoE) de 284.334.567.511 parámetros totales, con 13.000 millones de parámetros activos por token, 43 capas, 256 expertos enrutados (6 activos) más un experto compartido, una longitud de contexto de 1 millón de tokens y un vocabulario de 129.280 entradas. El modelo base lo desarrolla DeepSeek y esta publicación se limita a ofrecer pesos cuantizados listos para llama.cpp.

La particularidad técnica de esta publicación es que el checkpoint oficial ya está entrenado con quantization-aware training (QAT): los expertos enrutados se almacenan en MXFP4 y el resto de pesos en FP8 o BF16. Por tanto, la variante `AD-BF16` no es una cuantización de alta precisión, sino los pesos originales empaquetados en un contenedor GGUF verificados byte a byte. El resto de la escalera de cuantizaciones intercambia bits de los expertos por tamaño, con métricas de perplejidad, divergencia KL y coincidencia top-1 medidas por el autor.

El interés actual de esta ficha reside en que permite ejecutar localmente un modelo de 284B parámetros con ventana de 1M tokens en hardware de gama alta, incluyendo cuantizaciones de 1 y 2 bits que reducen el peso hasta 70,2 GB. La licencia MIT del modelo base y de la cuantización facilita su uso comercial, si bien el tamaño del repositorio (1.236,4 GB) y los requisitos de memoria siguen siendo considerables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con 43 capas, 256 expertos enrutados (6 activos) y 1 experto compartido |
| Parametros totales | 284.334.567.511 |
| Parametros activos | 13.000 millones por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | AD-BF16, AD-MXFP4, AD-IQ3_M_XL, AD-IQ3_M, AD-IQ3_S, AD-IQ3_XS, AD-IQ3_XXS, AD-IQ2_M, AD-IQ2_S_XL, AD-IQ2_S, AD-IQ2_XS, AD-IQ2_XXS, AD-IQ1_M_XL, AD-IQ1_M |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); el checkpoint original usa MXFP4 para expertos enrutados y FP8/BF16 para el resto |
| Vocabulario | 129.280 tokens |
| Tamano del repositorio | 1.236,4 GB |
| Cuantizacion del autor | AtomicChat (imatrix, QAT) |
| Modelo base | deepseek-ai/DeepSeek-V4-Flash-0731 |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 43 capas y 256 expertos enrutados, de los cuales se activan 6 por token, más un experto compartido. Con 284.334.567.511 parámetros totales y 13.000 millones activos, la relación de activación es de aproximadamente el 4,6 %, lo que permite un coste de cómputo por token muy inferior al de un modelo denso del mismo tamaño. La ventana de contexto alcanza 1.000.000 de tokens y el vocabulario es de 129.280 entradas.

El entrenamiento del modelo base incorpora quantization-aware training: los pesos de los expertos enrutados se almacenan directamente en MXFP4 (4,25 bits efectivos) y el resto en FP8 o BF16. Esta decisión implica que el modelo no dispone de precisión sobrante por debajo de 3 bits, de modo que los errores de cuantización crecen más rápido que en un modelo entrenado en BF16. La publicación de AtomicChat documenta esta degradación con métricas medidas sobre wikitext-2: perplejidad, divergencia KL media, coincidencia top-1 y desviación RMS de probabilidad. No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens ni las etapas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés y chino, con soporte de plantilla de chat integrada (`chat_template.jinja` en la raíz del repositorio).
- Modo de razonamiento con parámetro `reasoning_effort`: la plantilla actualizada del 28 de octubre de 2026 permite que el razonamiento de turnos anteriores permanezca en el prompt a través de llamadas a herramientas, replicando el codificador de referencia de DeepSeek.
- Soporte de tool calling y function calling, con preservación del razonamiento entre llamadas encadenadas.
- Procesamiento de contexto largo de hasta 1.000.000 de tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- No se documentan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Análisis de documentación técnica extensa: con 1M de tokens de contexto, el modelo puede ingerir repositorios completos, especificaciones o expedientes y responder preguntas sobre ellos sin fragmentación ni recuperación externa.
- Asistente de código en local: la variante `AD-IQ2_M` (104 GB) permite desplegar un modelo de 284B parámetros en estaciones de trabajo con varias GPU, integrable en flujos de revisión de código y generación de parches.
- Atención al cliente multi-turno: la ventana de 1M tokens y la conservación del razonamiento entre llamadas a herramientas permiten mantener conversaciones largas con historial completo y consultas a sistemas externos.
- Agentes con tool calling: el soporte de function calling y la persistencia del razonamiento entre llamadas facilitan pipelines de varios pasos con verificación intermedia, por ejemplo orquestación de APIs o automatización de tareas administrativas.
- Despliegue en entornos aislados: al ser pesos GGUF ejecutables con llama.cpp y licencia MIT, encaja en infraestructuras sin conectividad externa donde no se permite enviar datos a servicios en la nube.
- Investigación sobre cuantización extrema: la escalera publicada, con métricas de perplejidad y KL por nivel, sirve como referencia para estudiar el impacto de cuantizaciones de 1 y 2 bits en modelos entrenados con QAT.
- Generación de contenido bilingüe inglés-chino: traducción y redacción asistida entre ambos idiomas, los únicos declarados por el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor publica métricas de calidad de cuantización medidas sobre wikitext-2, que se recogen a continuación.

| Cuantizacion | Tamano | Bits por experto | PPL | KLD media | Coincidencia top-1 | Δp RMS |
|---|---:|---:|---:|---:|---:|---:|
| AD-BF16 | 162,1 GB | 4,25 | 4,5289 | 0 | 100,000 % | 0,000 % |
| AD-MXFP4 | 154,5 GB | 4,25 | 4,5446 | 0,1564 | 87,369 % | 12,686 % |
| AD-IQ3_M_XL | 143,6 GB | 3,94 | 4,5490 | 0,1675 | 86,864 % | 13,004 % |
| AD-IQ3_M | 135,8 GB | 3,71 | 4,5695 | 0,1798 | 86,317 % | 13,615 % |
| AD-IQ3_S | 130,8 GB | 3,56 | 4,6016 | 0,1891 | 85,945 % | 13,988 % |
| AD-IQ3_XS | 118,2 GB | 3,20 | 4,6657 | 0,2065 | 85,384 % | 14,461 % |
| AD-IQ3_XXS | 108,1 GB | 2,91 | 4,8491 | 0,2495 | 83,761 % | 15,947 % |
| AD-IQ2_M | 104,0 GB | 2,79 | 4,8822 | 0,2567 | 83,560 % | 16,184 % |
| AD-IQ2_S_XL | 96,8 GB | 2,58 | 5,1406 | 0,3187 | 81,461 % | 18,500 % |
| AD-IQ2_S | 93,4 GB | 2,48 | 5,2152 | 0,3343 | 81,031 % | 18,996 % |
| AD-IQ2_XS | 85,1 GB | 2,25 | 5,4917 | 0,3947 | 79,240 % | 20,817 % |
| AD-IQ2_XXS | 78,5 GB | 2,06 | 5,7878 | 0,4544 | 77,459 % | 22,378 % |
| AD-IQ1_M_XL | 72,8 GB | 1,89 | 6,1786 | 0,5351 | 75,162 % | 24,695 % |
| AD-IQ1_M | 70,2 GB | 1,81 | 6,3813 | 0,5641 | 74,547 % | 25,253 % |

Comparación con otro publicador (unsloth), medida por AtomicChat con el mismo harness y la misma referencia:

| Tamano | AtomicChat | KLD | unsloth | KLD |
|---:|---|---:|---|---:|
| 155 GB | AD-MXFP4 | 0,1564 | UD-Q4_K_XL | 0,1557 |
| 136 GB | AD-IQ3_M | 0,1798 | UD-IQ4_XS | 0,1779 |
| 128–131 GB | AD-IQ3_S | 0,1891 | UD-Q3_K_XL | 0,1981 |
| 116–118 GB | AD-IQ3_XS | 0,2065 | UD-IQ3_S | 0,2565 |
| 104 GB | AD-IQ2_M | 0,2567 | UD-IQ3_XXS | 0,2610 |
| 96,8 GB | AD-IQ2_S_XL | 0,3187 | UD-Q2_K_XL | 0,3216 |
| 91 GB | — | — | UD-IQ2_M | 0,3700 |
| 82,5 GB | — | — | UD-IQ1_S | 0,4863 |
| 78,5 GB | AD-IQ2_XXS | 0,4544 | — | — |
| 70,2 GB | AD-IQ1_M | 0,5641 | — | — |

El autor advierte que los valores absolutos no son comparables con métricas publicadas por terceros, ya que distintos corpus y longitudes de contexto los desplazan decenas de puntos porcentuales; las comparaciones relativas dentro de la tabla sí lo son.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 70,2 GB (AD-IQ1_M) y 162,1 GB (AD-BF16) solo para pesos; hay que añadir la caché KV, que con 1M de tokens de contexto resulta considerable y no está cuantificada en la información disponible.
- GPU recomendadas: para las cuantizaciones de 1 y 2 bits, configuraciones multi-GPU con 2×A100 80 GB o 2×H100 80 GB; para AD-MXFP4 y AD-BF16, al menos 2×H100 80 GB con margen para caché, o 4×A100 80 GB.
- No cabe en GPU de consumo individual: incluso la variante más pequeña (70,2 GB) supera los 24 GB de una RTX 4090. Sería necesario repartir entre varias GPU o usar offload a RAM del sistema.
- Opciones de despliegue: llama.cpp es el runtime de referencia (formato GGUF, etiqueta `llama.cpp`); también es compatible con herramientas que consumen GGUF como Ollama o LM Studio. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, aunque no se detalla en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---:|---:|---:|---|---|---|
| DeepSeek-V4-Flash-0731 (AtomicChat GGUF) | 284,3 B | 13 B | 1M | MIT | GGUF | Cuantizaciones de 1 a 4,25 bits con métricas publicadas |
| DeepSeek-V4-Flash-0731 (unsloth GGUF) | 284,3 B | 13 B | 1M | MIT | GGUF | Escalera UD-Q/UD-IQ; KLD comparable, ligeramente mejor en 155 GB y 136 GB, peor en 118 GB y 104 GB |
| DeepSeek-V4-Flash-0731 (modelo base) | 284,3 B | 13 B | 1M | MIT | safetensors (MXFP4/FP8/BF16) | Pesos originales con QAT; requiere infraestructura propia |

No se dispone de información sobre otros modelos de la misma categoría (MoE de ~280B con contexto de 1M) en los datos proporcionados.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Cuantización agresiva: por debajo de 3 bits los errores crecen más rápido que en modelos entrenados en BF16, según advierte el propio autor. AD-IQ1_M cae a 74,547 % de coincidencia top-1 y 6,3813 de perplejidad frente a 4,5289 de la referencia.
- AD-BF16 no aporta precisión adicional: es el checkpoint original reempaquetado, no una versión de mayor calidad.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de fidelidad factual en la información disponible.
- Sesgos: no documentados en la información proporcionada.
- Contexto largo: aunque la ventana es de 1M tokens, no se aportan mediciones de rendimiento ni de calidad en contextos cercanos al límite, y la caché KV asociada puede exceder la memoria disponible.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base (deepseek-ai/DeepSeek-V4-Flash-0731) y las licencias de los componentes de terceros incluidos en el repositorio.
- Tamaño del repositorio: 1.236,4 GB en total; la descarga selectiva de una sola variante es imprescindible en la práctica.
- Plantilla de chat: la actualización del 28 de octubre de 2026 requiere volver a descargar el primer archivo de cada nivel (`*-00001-of-*`); las versiones anteriores no propagan `reasoning_effort` correctamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/DeepSeek-V4-Flash-0731-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Atomic Chat: https://atomic.chat/?utm_source=huggingface&utm_medium=referral&utm_campaign=hf_deepseek_v4_flash_0731&utm_content=btn_atomic
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- GitHub de Atomic-Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- X (Twitter) de AtomicChat: https://x.com/atomic_chat_hq
