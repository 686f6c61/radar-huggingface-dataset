# linoyts/fastframes-l-aoti-sm120

## Resumen

`linoyts/fastframes-l-aoti-sm120` no es un modelo de pesos, sino un conjunto de grafos AOTInductor compilados con FP8 para el bloque transformer por fotograma de `apple/FastFrames-L`, un modelo de difusión de vídeo de Apple. El repositorio lo publica el usuario linoyts y su objetivo es acelerar la inferencia del modelo base en el hardware de ZeroGPU (RTX PRO 6000, arquitectura sm120), el mismo que utiliza Hugging Face Spaces. Los grafos se generaron con la herramienta `aokit` y no contienen pesos: cada bloque enlaza sus pesos en tiempo de carga.

La relevancia es de ingeniería de despliegue: reduce el coste por pasada del DiT de 152 a 110 ms (slot de caché 5) y de 219 a 185 ms (slot 17) frente a FP8 en modo eager, manteniendo una similitud coseno de características de al menos 0,998 sobre un rollout de 21 fotogramas. Es, por tanto, un artefacto de optimización para servir FastFrames-L en producción sobre ZeroGPU, no un modelo entrenado de forma independiente.

Al depender de una compilación concreta (torch 2.13.0+cu130 sobre sm120), cualquier otro build de PyTorch o GPU requiere recompilar los grafos. El artefacto hereda la licencia Apple AMLR del modelo base y no declara idiomas ni pipeline propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafos AOTInductor (torch.compile) del bloque transformer por fotograma de apple/FastFrames-L; dos grafos por bloque (`ff_pre`, `ff_post`) divididos en la escritura de la KV-cache |
| Parametros totales | No disponible (no se incluyen pesos; los grafos enlazan los pesos del modelo base en carga) |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica; la unica dimension dinamica es la longitud de atención, de 1 a 21 fotogramas latentes |
| Tipos de cuantizacion | FP8 en las GEMM (compilado con FP8); sin otras variantes publicadas |
| Idiomas soportados | No disponible |
| Licencia | apple-amlr (Apple ML Research License), heredada de apple/FastFrames-L |
| Formato de pesos | Grafos AOTInductor con FP8; sin safetensors ni GGUF en el repositorio |

## Arquitectura y entrenamiento

El artefacto no entrena nada: es una compilación de los bloques del DiT de FastFrames-L mediante AOTInductor con `aokit`. Cada bloque se parte en dos grafos (`ff_pre` y `ff_post`) con el corte en la escritura de la KV-cache, de modo que la longitud de atención queda como única forma dinámica (de 1 a 21 fotogramas latentes). Las GEMM se emiten en FP8. El código de referencia está en `ff_aoti.py` dentro del Space de FastFrames-L.

La compilación se realizó para torch 2.13.0+cu130 sobre una RTX PRO 6000 (sm120), la GPU de ZeroGPU. Cualquier otro build de PyTorch o arquitectura de GPU exige recompilar los grafos. La validación reportada compara la salida compilada con la ejecución eager en FP8: coseno de características de al menos 0,998 sobre un rollout de 21 fotogramas, con ganancias de 152 a 110 ms por pasada del DiT en el slot de caché 5 y de 219 a 185 ms en el slot 17.

## Capacidades

- Aceleración de inferencia del DiT de FastFrames-L en ZeroGPU mediante grafos AOTInductor con GEMM en FP8.
- Reducción de latencia por pasada del DiT: de 152 a 110 ms (slot 5) y de 219 a 185 ms (slot 17).
- Soporte de longitud de atención dinámica entre 1 y 21 fotogramas latentes.
- Compatibilidad funcional con la salida eager en FP8 (coseno de características >= 0,998 en 21 fotogramas).
- No incluye generación de texto, razonamiento, código, matemáticas, visión general, tool calling ni capacidades de agente.
- No declara capacidades multilingües propias.

## Casos de uso

- Despliegue de FastFrames-L en Hugging Face Spaces con ZeroGPU: los grafos están compilados para sm120 y torch 2.13.0+cu130, el entorno exacto de ZeroGPU, lo que permite servir el modelo con menor latencia por pasada sin tocar el código del modelo.
- Reducción de coste por fotograma en generación de vídeo: al bajar de 152 a 110 ms por pasada del DiT en el slot 5, se reduce el tiempo total de un rollout de 21 fotogramas en la misma proporción aproximada.
- Prototipado de pipelines de vídeo con caché de atención: la separación `ff_pre`/`ff_post` en la escritura de la KV-cache permite reutilizar el primer grafo entre pasos con distinta longitud de atención.
- Benchmarking de compilación FP8 frente a eager: sirve como referencia reproducible para medir el impacto de AOTInductor en un DiT de vídeo sobre sm120.
- Integración en servicios de demo interactiva: la menor latencia por pasada mejora la percepción de respuesta en aplicaciones de generación de vídeo de corta duración.
- Recompilación como plantilla para otros modelos: el flujo con `aokit` y la división en dos grafos por bloque son reutilizables para compilar otros DiT con KV-cache, siempre que se adapte el código.

## Benchmarks y rendimiento

| Metrica | Eager FP8 | AOTInductor FP8 | Mejora |
|---|---|---|---|
| Latencia por pasada del DiT, slot de caché 5 | 152 ms | 110 ms | ~27,6 % menos |
| Latencia por pasada del DiT, slot de caché 17 | 219 ms | 185 ms | ~15,5 % menos |
| Similitud coseno de características (rollout 21 fotogramas) | referencia | >= 0,998 | — |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni métricas de calidad de vídeo.

## Requisitos de hardware

- GPU: RTX PRO 6000 (sm120), la GPU de ZeroGPU; los grafos no son portables a otras arquitecturas sin recompilar.
- Entorno: torch 2.13.0+cu130; otros builds de PyTorch requieren recompilación.
- VRAM: no disponible en la información proporcionada; al no incluir pesos, el consumo depende de los pesos de FastFrames-L cargados en tiempo de ejecución.
- GPU de consumo: no disponible; no se documenta compatibilidad con RTX 4090, A100 ni H100.
- Despliegue: AOTInductor con `aokit`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 110 ms y 185 ms por pasada del DiT en los slots 5 y 17 respectivamente, sobre la GPU de compilación; no se publica throughput agregado.

## Comparativa con modelos similares

| Artefacto | Tipo | Hardware objetivo | Cuantizacion | Licencia | Pesos incluidos |
|---|---|---|---|---|---|
| linoyts/fastframes-l-aoti-sm120 | Grafos AOTInductor del DiT de FastFrames-L | RTX PRO 6000 (sm120), torch 2.13.0+cu130 | FP8 | apple-amlr | No |
| apple/FastFrames-L (eager) | Modelo de difusión de vídeo | Generico | FP8 en la comparacion | apple-amlr | Si |
| Otras compilaciones AOTInductor de DiT | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos publicados de otros artefactos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin los pesos de `apple/FastFrames-L` los grafos no pueden ejecutarse.
- Portabilidad nula fuera de sm120 y torch 2.13.0+cu130; cualquier otro entorno exige recompilación.
- Solo se optimiza el bloque transformer por fotograma; el resto del pipeline (VAE, scheduler, etc.) queda fuera del alcance.
- La única forma dinámica soportada es la longitud de atención (1 a 21 fotogramas latentes); otras variaciones de forma requieren recompilar.
- Licencia apple-amlr: revisar las restricciones de uso comercial antes de desplegar en producción.
- Riesgo de divergencia numérica respecto a eager, acotado por el coseno >= 0,998 reportado, pero no evaluado con métricas de calidad perceptual de vídeo.
- Repositorio sin descargas ni likes y de tamaño 0.0 GB: no hay evidencia de uso en producción ni de mantenimiento continuado.
- No se documentan sesgos, idiomas ni riesgos de alucinación específicos del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/linoyts/fastframes-l-aoti-sm120
- Modelo base: https://huggingface.co/apple/FastFrames-L
- Licencia del modelo base: https://huggingface.co/apple/FastFrames-L/blob/main/LICENSE
- Herramienta de compilación aokit: https://github.com/huggingface/aokit
