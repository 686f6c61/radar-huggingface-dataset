# Schiltmans/Ternary-Bonsai-2-27B-DFlash2-ft5

## Resumen

Ternary-Bonsai-2-27B-DFlash2-ft5 es un *drafter* de decodificación especulativa, no un modelo de lenguaje autónomo. Lo publica el desarrollador independiente Schiltmans y está afinado contra los estados ocultos del modelo objetivo PrismML Ternary-Bonsai-2-27B, un transformer Qwen3.8 de 27B con pesos ternarios. Su función es proponer bloques de tokens que el modelo objetivo verifica en paralelo: cambia la velocidad de respuesta del objetivo, no su contenido. Emplea la arquitectura DFlash 2 y se distribuye como *drop-in replacement* de `z-lab/Qwen3.8-27B-DFlash2`, con los mismos 81 nombres de tensores, dtypes, formas y `config.json`.

El modelo resuelve un problema muy concreto: acelerar la inferencia del objetivo en Apple Silicon sin alterar la distribución de salida. Según las mediciones del autor en un M4 Pro de 48 GB, mejora la aceptación de tokens por ronda un 9,49 % en chat general (IC 95 % emparejado: +7,25 % a +11,69 %), con un incremento de decodificación del 15,2 % en modo greedy y del 6,7 % con el muestreo publicado del objetivo. En un segundo runtime (dflash-mlx-bonsai2, límite de 4 tokens por ronda) la ganancia de aceptación es del 5,01 %.

Es relevante ahora porque la decodificación especulativa se ha convertido en la vía estándar para servir modelos grandes en hardware de consumo, y los drafters afinados contra un objetivo concreto superan a los genéricos. La advertencia del propio autor es importante: en Mac, la vía más rápida medida para servir Bonsai 2 no es un drafter, sino MTPLX 2.12.0 con la cabeza MTP nativa de Qwen3.8, que decodifica un 38 % más rápido en greedy y un 46 % más con muestreo. Este drafter está pensado para runtimes donde DFlash 2 es el método disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash 2 (drafter de decodificación especulativa sobre transformer Qwen3.8) |
| Parametros totales | 1.924.404.480 (1,92B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del objetivo; no especificada en la información) |
| Tipos de cuantizacion | bfloat16 fusionado (repo principal); MLX 4-bit (repo alternativo, 2,83x más pequeño); GGUF en Q8_0, Q4_K_M y Q2_K |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, bfloat16 fusionado); variantes MLX y GGUF |
| Modelo base | z-lab/Qwen3.8-27B-DFlash2 (finetune) |
| Modelo objetivo | prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (revisión 3f926b41 medida) |
| Libreria | MLX |
| Tamano del repositorio | 3,8 GB |
| Hash SHA-256 de pesos | 63399215d7af9b7aaa73464e7e10835d608ae4d9571abf520040b2b8746455b3 |
| Descargas / likes | 191 / 2 |

## Arquitectura y entrenamiento

El modelo es un drafter DFlash 2 afinado contra los estados ocultos del objetivo Ternary-Bonsai-2-27B. DFlash 2 propone bloques de tokens candidatos que el modelo objetivo verifica en una sola pasada; la verificación es determinista respecto al objetivo, de modo que la salida solo puede diferir en empates de coma flotante. En la validación con dflash-mlx-bonsai2, el autor reporta que la salida difiere del objetivo únicamente en empates numéricos con márgenes de logit ≤ 0,016. El checkpoint tiene 1,92B parámetros y conserva exactamente la topología del drafter original (81 tensores, mismos dtypes y formas), lo que garantiza compatibilidad sin cambios en el runtime.

El ajuste fino se realizó sobre dos conjuntos de datos: `sahil2801/CodeAlpaca-20k` y `Schiltmans/bonsai2-drafter-eval`. El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset de evaluación ni si se aplicaron técnicas de alineación adicionales. La innovación principal no está en la arquitectura, sino en el procedimiento de destilación contra estados ocultos del objetivo ternario y en la validación cruzada en varios runtimes: mlx-dspark 0.18.0 con parches del repositorio (límite de 7 tokens por ronda), dflash-mlx-bonsai2 en el commit 223e0f3 (límite de 4) y el fork de llama.cpp de PrismML en Metal. En este último, el drafter carga y genera borradores pero no aporta aceleración: a 7,92 tok/s frente a 20,70 tok/s sin drafter, una ronda cuesta aproximadamente diez pasos de token único.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa: propone bloques que el objetivo verifica en paralelo.
- Aceleración de la decodificación del objetivo sin alterar su distribución de salida (diferencias solo en empates de coma flotante).
- Compatibilidad drop-in con `z-lab/Qwen3.8-27B-DFlash2`: mismos nombres de tensores, dtypes, formas y `config.json`.
- Funcionamiento con caché KV de 8 bits y cuantización del drafter a 4 bits en carga.
- Soporte de modo greedy y de muestreo (validado con los valores por defecto publicados del objetivo).
- No es un modelo de lenguaje autónomo: no genera respuestas por sí mismo, no soporta tool calling, agentes ni razonamiento multi-step de forma independiente.
- Capacidades multilingües: no disponibles (dependen del modelo objetivo).
- No dispone de modo thinking, visión ni audio propios.

## Casos de uso

- Servicio de chat interactivo en Apple Silicon: desplegar el objetivo Ternary-Bonsai-2-27B con mlx-dspark y este drafter para reducir la latencia percibida en conversaciones multi-turno, con una mejora medida del 15,2 % en decodificación greedy en un M4 Pro.
- Generación de código en local: el ajuste incluye CodeAlpaca-20k y la validación en dflash-mlx-bonsai2 reporta +7,10 % de aceptación en código, lo que lo hace adecuado para asistentes de programación servidos en un Mac.
- API compatible con OpenAI en estación de trabajo: el script `scripts/serve-bonsai2.sh` levanta un endpoint en `http://127.0.0.1:8088/v1` con el entorno mlx-dspark fijado, útil para prototipos y herramientas internas.
- Evaluación de decodificación especulativa: el repositorio incluye el kit de evaluación y los registros en `evidence/`, lo que permite reproducir cada cifra y comparar drafters bajo un protocolo común.
- Despliegue en CUDA con llama.cpp: la variante GGUF (Q8_0, Q4_K_M, Q2_K) está pensada para el DFlash 2 de llama.cpp en CUDA, aunque la aceleración en Metal no está confirmada.
- Investigación sobre cuantización ternaria: sirve para estudiar cómo se comporta la decodificación especulativa cuando el objetivo tiene pesos ternarios y el drafter se cuantiza a 4 bits en carga.
- Integración en pipelines de inferencia existentes: cualquier runtime que cargue el drafter original debería cargar este sin cambios, lo que simplifica la sustitución en despliegues ya operativos.

## Benchmarks y rendimiento

Mediciones del autor en un Apple M4 Pro de 48 GB con mlx-dspark 0.18.0, MLX 0.32.2, mlx-lm 0.31.3, caché KV de 8 bits, drafter a 4 bits y límite de 7 tokens por ronda. Tokens aceptados por ronda, 40 prompts por suite, bootstrap emparejado estratificado:

| Suite | Presupuesto de salida | Stock | ft5 | Ganancia (IC 95 % emparejado) |
|---|---|---|---|---|
| Chat general | 200 | 2,7768 | 3,0403 | +9,49 % (+7,25 % a +11,69 %) |
| Chat general | 1024 | 2,8149 | 3,0399 | +7,99 % (+6,75 % a +9,24 %) |

Rendimiento de decodificación y comparación de runtimes:

| Runtime | Configuración | Resultado |
|---|---|---|
| mlx-dspark 0.18.0 + ft5 | Greedy | +15,2 % de decodificación frente al drafter stock |
| mlx-dspark 0.18.0 + ft5 | Muestreo del objetivo | +6,7 % de decodificación frente al drafter stock |
| dflash-mlx-bonsai2 (223e0f3) | Chat general, 200 tokens | 2,6392 → 2,7714 tokens por ronda, +5,01 % (+3,35 % a +6,83 %) |
| dflash-mlx-bonsai2 (223e0f3) | Código | +7,10 % |
| dflash-mlx-bonsai2 (223e0f3) | Chat general, 1024 tokens | +4,84 % |
| dflash-mlx-bonsai2 (223e0f3) | Greedy, extremo a extremo | 1,0716x frente al drafter stock |
| MTPLX 2.12.0 (MTP, sin drafter) | Greedy | 38,89 tok/s frente a 28,13 tok/s (1,38x) |
| MTPLX 2.12.0 (MTP, sin drafter) | Muestreo | 37,44 tok/s frente a 25,68 tok/s (1,46x) |
| Fork llama.cpp PrismML, Metal (prism-b10754-2459f68) | GGUF Q8_0 de ft5 | 7,92 tok/s, aceptación 0,432; sin drafter 20,70 tok/s; stock 7,10 tok/s con 0,395 |
| oMLX (5aa6c7f9), routing parcheado | — | Carga el objetivo, no DFlash 2; ~4x más lento que sin drafter |

No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es coherente con la naturaleza del modelo: no es un modelo de lenguaje evaluable de forma autónoma.

## Requisitos de hardware

- VRAM/modelo: el drafter pesa 3,8 GB en bfloat16; la variante MLX 4-bit es 2,83 veces más pequeña (aproximadamente 1,3 GB). El objetivo Ternary-Bonsai-2-27B con pesos ternarios y caché KV de 8 bits es el grueso del consumo.
- Configuración de referencia medida: Apple M4 Pro con 48 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M4 Pro validado); la variante GGUF está pensada para CUDA, pero la aceleración en Metal no está confirmada.
- En GPU de consumo: no hay datos publicados de funcionamiento en RTX 4090 u otras GPU consumer; el drafter es pequeño, pero el objetivo de 27B condiciona el despliegue.
- Opciones de despliegue: mlx-dspark 0.18.0 con los parches del repositorio (validado), dflash-mlx-bonsai2 en el commit 223e0f3 (validado, límite de 4), fork de llama.cpp de PrismML en Metal (carga y genera borradores, sin aceleración), oMLX (carga el objetivo pero no DFlash 2), y runtimes que cargan el drafter original como vLLM o SGLang (no probados).
- Latencia y throughput: en MTPLX 2.12.0 se miden 38,89 tok/s en greedy y 37,44 tok/s con muestreo, con 1,80 tokens por ronda a 44 ms por ronda; con mlx-dspark y ft5 se aceptan 3,0403 tokens por ronda en chat general a 200 tokens de salida, con un coste de 128 ms por ronda.
- Arranque rápido: `scripts/serve-bonsai2.sh` construye el entorno fijado, descarga objetivo y drafter en revisiones concretas y sirve con caché KV de 8 bits y drafter a 4 bits.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-DFlash2-ft5 | 1,92B | no disponible | Drafter DFlash 2 afinado contra Ternary-Bonsai-2-27B | Apache 2.0 | Hugging Face (MLX, GGUF, 4-bit) |
| z-lab/Qwen3.8-27B-DFlash2 (stock) | no disponible | no disponible | Drafter DFlash 2 genérico para Qwen3.8-27B | no disponible | Hugging Face |
| MTPLX 2.12.0 (cabeza MTP de Qwen3.8) | no disponible | no disponible | Decodificación con cabeza MTP nativa, sin drafter | no disponible | GitHub |
| dflash-mlx-bonsai2 | no disponible | no disponible | Runtime DFlash 2 para Bonsai 2 en MLX | no disponible | GitHub |

En rendimiento, ft5 supera al drafter stock en aceptación (+9,49 % en chat general a 200 tokens) y en decodificación (+15,2 % greedy). Frente a MTPLX, este último es más rápido en Mac (38,89 frente a 28,13 tok/s greedy), pero no carga drafters DFlash 2: son enfoques alternativos, no sustitutos directos. La ventaja de ft5 es su compatibilidad drop-in con cualquier runtime que cargue el drafter original.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no produce respuestas por sí mismo y no debe evaluarse con benchmarks de conocimiento o razonamiento.
- Dependencia estricta del objetivo: solo tiene sentido con prism-ml/Ternary-Bonsai-2-27B-mlx-2bit; con otro objetivo las ganancias no están garantizadas.
- Aceleración no universal: en el fork de llama.cpp de PrismML en Metal carga y genera borradores, pero decodifica más lento que sin drafter (7,92 frente a 20,70 tok/s).
- En Mac, MTPLX 2.12.0 es más rápido que mlx-dspark con ft5 (38 % en greedy, 46 % con muestreo), por lo que este drafter no es la opción óptima en ese hardware.
- oMLX no carga DFlash 2 sobre el objetivo; con parches de routing funciona pero decodifica unas cuatro veces más lento.
- Runtimes como vLLM y SGLang no están probados; la compatibilidad se infiere del layout idéntico, no de una validación empírica.
- Posible incompatibilidad de nombres: algunas releases usan `…_codebook.weight` en lugar de `…_codebook`; requiere `scripts/rename-codebooks.py` para convertir sin pérdida.
- Idiomas soportados no documentados; dependen del objetivo.
- Riesgo de alucinación y sesgos: heredados del modelo objetivo, no del drafter.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción ni sobre la paridad exacta con el objetivo más allá de los empates de coma flotante documentados.
- Las cifras provienen de un único equipo (M4 Pro, 48 GB) y de un conjunto limitado de 40 prompts por suite; la generalización a otros entornos no está verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Schiltmans/Ternary-Bonsai-2-27B-DFlash2-ft5
- Variante MLX 4-bit: https://huggingface.co/Schiltmans/Ternary-Bonsai-2-27B-DFlash2-ft5-mlx-4bit
- Variante GGUF: https://huggingface.co/Schiltmans/Ternary-Bonsai-2-27B-DFlash2-ft5-GGUF
- Modelo base: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Repositorio de código y evaluación: https://github.com/alexschiltmans/bonsai2-drafter
- Documentación del proceso: https://github.com/alexschiltmans/bonsai2-drafter/blob/main/docs/one-drafter-several-runtimes.md
- Registros de evidencia: https://github.com/alexschiltmans/bonsai2-drafter/tree/main/evidence
- Runtime dflash-mlx-bonsai2: https://github.com/NakliTechie/dflash-mlx-bonsai2
- Runtime MTPLX: https://github.com/youssofal/MTPLX
- Runtime oMLX: https://github.com/jundot/omlx
- Dataset CodeAlpaca-20k: https://huggingface.co/datasets/sahil2801/CodeAlpaca-20k
- Dataset de evaluación: https://huggingface.co/datasets/Schiltmans/bonsai2-drafter-eval
- Paper referenciado (arXiv:2602.06036): https://arxiv.org/abs/2602.06036
