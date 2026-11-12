# HelloSun/openPangu-VL-7B-VQ3-gguf

## Resumen

openPangu-VL-7B-VQ3-gguf es una cuantización experimental del modelo multimodal openPangu-VL-7B, desarrollado originalmente por Huawei (repositorio `openpangu`). Se trata de un modelo visión-lenguaje denso de aproximadamente 8.030 millones de parámetros (7B nominales) que acepta entradas de imagen y texto y genera texto, con pipeline `image-text-to-text`. Esta variante concreta la publica el usuario HelloSun y aplica un esquema de cuantización LUT-VQ3-64 (3,00 bits por peso en las capas FFN) sobre el modelo base, empaquetado en formato GGUF para su uso con llama.cpp.

El interés de esta ficha no reside en el modelo base en sí, sino en el experimento de cuantización: el autor documenta de forma explícita que el formato VQ3, que rinde bien en tensores de expertos de arquitecturas MoE, degrada notablemente un modelo denso como este. Según sus propias mediciones, la perplejidad sube un 39,5 % frente a Q4_K_M y el rendimiento de decodificación cae un 13 %, a cambio de solo un 11 % de reducción de tamaño. El propio autor recomienda Q4_K_M para uso diario y presenta este repositorio como un registro del límite de VQ3 en modelos densos.

La relevancia es, por tanto, acotada: sirve como referencia técnica para quienes investigan esquemas de cuantización de bajo bit-width en llama.cpp y quieren conocer el comportamiento de VQ3 fuera de su dominio óptimo (MoE). No es una opción recomendable para producción ni para uso conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje); 34 capas, hidden 4096, FFN 12800, vocabulario 153k |
| Parametros totales | 8.030.887.936 (aprox. 8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (configurable vía `CONTEXT_SIZE` en el script de despliegue) |
| Tipos de cuantizacion | VQ3_0 (LUT-VQ3-64, 3,00 bpw en FFN), atención en Q8_0, token_embd en Q4_K, output en Q6_K; proyector visual en Q8_0; existe también variante Q4_K_M |
| Idiomas soportados | chino (zh) e inglés (en) según tags; cobertura exacta no disponible |
| Licencia | openpangu-model-license (etiquetada como "other"; pesos sujetos a la licencia original de Huawei) |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 34 capas con dimensión oculta 4096 y dimensión de FFN 12800, con un vocabulario de 153k tokens. Incorpora un codificador/proyector visual que lo convierte en un modelo visión-lenguaje: recibe pares imagen-texto y genera texto. No es una arquitectura MoE, lo que resulta clave para interpretar los resultados de esta cuantización: en un modelo denso, todas las capas FFN se activan en cada token, de modo que el error de cuantización de 3 bits no se diluye entre expertos, a diferencia de lo que ocurre en arquitecturas MoE.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La innovación técnica de esta variante es exclusivamente la cuantización: el formato LUT-VQ3-64 procede del proyecto llama-modchip y se aplica aquí mediante un pipeline documentado (safetensors oficial → F16 → base Q8_0 → VQ3). El autor reporta que el resultado se marca correctamente como `general.file_type = 42` (VQ3_0) y que llama.cpp lo detecta como "mostly VQ3_0". El soporte de pangu-vl en llama.cpp proviene de la variante Q4_K_M del mismo autor.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Comprensión de imágenes y descripción de su contenido (verificado por el autor con una imagen de un astronauta en una EVA).
- Respuestas de tipo image-text-to-text en formato conversacional multi-turno.
- Servido mediante API compatible con OpenAI (`/v1`, chat e imagen).
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documenta modo de razonamiento explícito (thinking), audio ni otras modalidades.
- Capacidades multilingües limitadas a los idiomas declarados (zh, en); cobertura adicional no disponible.

## Casos de uso

- Investigación sobre cuantización de bajo bit-width: este repositorio sirve para estudiar el comportamiento de VQ3 en modelos densos y compararlo con su rendimiento en MoE, usando las métricas de PPL y llama-bench publicadas por el autor.
- Reproducción de experimentos de cuantización: el script `vq3/convert.sh` permite regenerar el archivo VQ3 desde los safetensors oficiales, útil para validar el pipeline llama-modchip.
- Despliegue local en CPU para pruebas de concepto de modelos visión-lenguaje: con 4,09 GiB de pesos más 0,74 GiB del proyector, cabe en equipos sin GPU dedicada mediante llama.cpp.
- Validación de soporte multimodal en llama.cpp: permite comprobar la integración de pangu-vl (visión + texto) en el servidor `llama-server` con API compatible con OpenAI.
- Evaluación comparativa de calidad frente a Q4_K_M: útil para decidir umbrales de cuantización aceptables en modelos densos de 7-8B.
- Docencia y formación técnica: ejemplo práctico de cómo el error de cuantización afecta de forma distinta a arquitecturas densas y MoE.
- No se recomienda para atención al cliente, generación de código en producción ni tareas que requieran alta fidelidad, dado el deterioro de perplejidad documentado.

## Benchmarks y rendimiento

Datos publicados por el autor (perplejidad sobre wikitext-2 y llama-bench; `pp512` = prefill de 512 tokens, `tg128` = generación de 128 tokens, en tokens por segundo):

| Configuracion | PPL | pp512 @32t | tg128 @32t | tg128 @16t |
|---|---:|---:|---:|---:|
| Q8_0 (base mixta) | 7,534 ± 0,207 | no disponible | no disponible | no disponible |
| Q4_K_M (recomendada) | 7,652 ± 0,208 | 170,9 | 22,0 | 16,6 |
| VQ3 (este repo) | 10,672 ± 0,309 | 67,1 | 19,1 | 17,0 |

Conclusiones del autor: frente a Q4_K_M, VQ3 supone un aumento de PPL del 39,5 %, una caída de decodificación del 13 %, una caída de prefill del 46 % y solo un 11 % menos de tamaño. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: los pesos VQ3 ocupan 4,09 GiB y el proyector visual Q8_0, 0,74 GiB; en total, aproximadamente 4,8 GiB de archivos.
- Inferencia en CPU: viable con AVX-512 (el autor etiqueta el modelo con `avx512` y `cpu`); los datos de llama-bench se obtuvieron en CPU con 16 y 32 hilos.
- GPU: no se especifican modelos concretos; por tamaño, cabría en GPUs de consumo con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti/4060 en adelante), aunque no hay mediciones publicadas en GPU.
- Despliegue: llama.cpp con parche pangu-vl + VQ3 (build fijado en el commit `1268eda`), servidor `llama-server` en el puerto 20000 por defecto, API compatible con OpenAI.
- Variables de configuración: `TEXT_ONLY=1` para modo solo texto; `LLAMA_PORT`, `CONTEXT_SIZE` y `LLAMA_THREADS` ajustables.
- Throughput medido (CPU): 19,1 tok/s en decodificación a 32 hilos y 17,0 tok/s a 16 hilos; prefill de 67,1 tok/s a 32 hilos.
- Latencia: no disponible de forma explícita más allá de los datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL (wikitext-2) | Tamano | Licencia | Formato |
|---|---|---:|---:|---|---|---|
| openPangu-VL-7B VQ3 (este repo) | ~8B denso | no disponible | 10,672 | 4,09 GiB | openpangu-model-license | GGUF |
| openPangu-VL-7B Q4_K_M (mismo autor) | ~8B denso | no disponible | 7,652 | ~4,6 GiB (estimado, no confirmado) | openpangu-model-license | GGUF |
| openPangu-VL-7B (base, safetensors) | 8.030.887.936 | no disponible | no disponible | no disponible | openpangu-model-license | safetensors |

No se dispone de datos de benchmarks frente a otros modelos visión-lenguaje de tamaño similar (por ejemplo, Qwen2-VL-7B o InternVL) en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Calidad degradada de forma significativa: PPL un 39,5 % superior a Q4_K_M; el propio autor desaconseja su uso diario y recomienda Q4_K_M.
- Rendimiento inferior: prefill un 46 % más lento y decodificación un 13 % más lenta que Q4_K_M.
- La ventaja de tamaño es mínima (11 %), por lo que el compromiso calidad/espacio no compensa en modelos densos.
- Modelo experimental: publicado como registro del límite de VQ3 en arquitecturas densas, no como artefacto listo para producción.
- Idiomas limitados a chino e inglés según los tags; cobertura real no verificada.
- Riesgo de alucinación no cuantificado en la información disponible; la degradación de cuantización puede agravarlo.
- Licencia `openpangu-model-license` (etiquetada como "other"): es necesario revisar los términos de la licencia original de Huawei antes de cualquier uso comercial; el repositorio no aclara restricciones adicionales.
- Dependencia de un fork/parche específico de llama.cpp (commit `1268eda`): la compatibilidad con versiones futuras de llama.cpp no está garantizada.
- Sin datos publicados sobre sesgos, contexto máximo efectivo ni evaluación estándar de capacidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HelloSun/openPangu-VL-7B-VQ3-gguf
- Modelo base: https://huggingface.co/openpangu/openPangu-VL-7B
- Variante Q4_K_M del mismo autor: https://huggingface.co/HelloSun/openPangu-VL-7B-Q4KM-gguf
- Proyecto de cuantización llama-modchip: https://github.com/synchopate/llama-modchip
- Repositorio de optimización CPU flint (referencia VQ3): https://huggingface.co/HelloSun/flint_cpu_opt
- Descarga directa de pesos VQ3: https://huggingface.co/HelloSun/openPangu-VL-7B-VQ3-gguf/resolve/main/openPangu-VL-7B-VQ3.gguf?download=true
- Descarga directa del proyector visual: https://huggingface.co/HelloSun/openPangu-VL-7B-VQ3-gguf/resolve/main/openPangu-VL-7B-mmproj-Q8_0.gguf?download=true
