# MikhailSt/qwen35-9b-dflash-RCO-PQ2

## Resumen

`MikhailSt/qwen35-9b-dflash-RCO-PQ2` es un modelo borrador (draft model) para decodificación especulativa, diseñado para acelerar la inferencia de Qwen3.5-9B. No es un modelo generativo autónomo, sino un componente auxiliar que propone tokens candidatos que el modelo objetivo verifica en paralelo. Lo desarrolla el usuario independiente MikhailSt a partir del drafter `z-lab/Qwen3.5-9B-DFlash` (1,29B parámetros), al que aplica una cuantización extrema de 2 bits con recuperación mediante Residual Clipping Optimization (RCO) y ajuste fino con Spec-QAD + DPO.

La relevancia de esta ficha radica en su enfoque: comprime un drafter de 1,29B parámetros a un GGUF de 546 MB (3,48 bits por peso) manteniendo, según el autor, capacidad de propuesta útil para decodificación especulativa. Esto permite ejecutar el par drafter + modelo objetivo en hardware más modesto, donde cargar un drafter en FP16 resultaría prohibitivo en términos de VRAM.

El modelo se distribuye bajo licencia MIT, en formato GGUF listo para `llama.cpp`, con soporte del tipo de especulación `draft-dflash`. No se han publicado datos de benchmarks, idiomas soportados ni composición del dataset de ajuste en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block diffusion draft (DFlash), transformer para decodificación especulativa |
| Parametros totales | 1.291.904.512 (1,29B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF PQ2_0 (Prism 2-bit, group-128, 3,48 BPW) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (546 MB); repo incluye config.json |

## Arquitectura y entrenamiento

El modelo base `z-lab/Qwen3.5-9B-DFlash` emplea una arquitectura de block diffusion draft, pensada para proponer bloques de tokens candidatos que el modelo objetivo Qwen3.5-9B verifica en una sola pasada. Sobre ese drafter, MikhailSt aplica una cuantización GSQ + RCO `PQ2_0`: cuantización Prism de 2 bits con grupos de 128 pesos y una optimización de recorte de residuales por bloque (MSE residual clipping) que recupera parte de la precisión perdida por la compresión extrema.

El ajuste posterior combina Spec-QAD (quantization-aware distillation orientada a decodificación especulativa) y DPO, según indica el autor. No se especifican el número de tokens de entrenamiento, la composición del dataset ni los hiperparámetros del proceso. La innovación principal es la compresión a 3,48 BPW de un drafter de 1,29B, lo que reduce el coste de VRAM del componente especulativo a poco más de medio gigabyte.

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa junto a Qwen3.5-9B.
- Aceleración de inferencia mediante verificación paralela de bloques candidatos.
- Integración con `llama.cpp` mediante el tipo de especulación `draft-dflash`.
- Compatible con el pipeline `text-generation` y con `transformers` (custom_code).
- Ajuste orientado a conversación (tag `conversational`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking propias; dependen del modelo objetivo.

## Casos de uso

- Aceleración de inferencia en producción: desplegar el par Qwen3.5-9B + este drafter en `llama.cpp` para reducir la latencia por token generado en servicios de chat, gracias a la verificación especulativa de bloques.
- Despliegue en hardware con VRAM limitada: al ocupar solo 546 MB, el drafter deja más memoria disponible para el modelo objetivo y el KV cache en GPUs de gama media.
- Servicios de generación de código de baja latencia: usar la especulación para acelerar autocompletado en editores o pipelines de CI/CD donde el drafter propone y el modelo grande verifica.
- Prototipado e investigación en decodificación especulativa: estudiar el impacto de cuantizaciones de 2 bits en la tasa de aceptación de tokens propuestos.
- Chat interactivo multi-turno: reducir el tiempo hasta el primer token percibido en asistentes conversacionales, siempre que el modelo objetivo gestione el contexto.
- Evaluación de técnicas de recuperación post-cuantización (RCO, QAD): comparar la calidad de propuestas frente a drafters en mayor precisión en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta el tamaño del archivo (546 MB, 535,35 MiB) y la tasa de compresión (3,48 BPW), sin métricas de tasa de aceptación, speedup ni perplejidad.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 0,55 GB en GGUF PQ2_0, más overhead de contexto.
- VRAM total necesaria: la del drafter más la del modelo objetivo Qwen3.5-9B (no cuantificado en esta ficha) y el KV cache.
- GPU recomendadas: cualquier GPU con capacidad suficiente para el modelo objetivo; el drafter apenas añade huella (RTX 3090, RTX 4090, A100, H100 según el tamaño del objetivo).
- Cabe en GPU de consumo: sí, el drafter por sí solo; el conjunto depende de la cuantización elegida para Qwen3.5-9B.
- Opciones de despliegue: `llama.cpp` / `llama-cli` con `--spec-type draft-dflash` y `-md` para el drafter; integración vía `transformers` con `custom_code`.
- Latencia y throughput: no disponibles; el speedup depende de la tasa de aceptación del drafter, no reportada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| qwen35-9b-dflash-RCO-PQ2 (este) | 1,29B | No disponible | GGUF PQ2_0 (3,48 BPW) | MIT | GGUF |
| z-lab/Qwen3.5-9B-DFlash (base) | 1,29B | No disponible | Pesos originales (mayor precision) | No disponible | No disponible |
| Drafters EAGLE/Medusa para modelos 7-9B | Variable | No disponible | FP16/BF16 habitual | Variable | safetensors |

La comparación cuantitativa de rendimiento no está disponible; la diferencia principal frente al base es la compresión a 2 bits y el ajuste RCO + QAD + DPO.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: requiere Qwen3.5-9B como modelo objetivo y `llama.cpp` con soporte `draft-dflash`.
- La cuantización a 2 bits puede degradar la tasa de aceptación de tokens y, con ello, el speedup real; no hay métricas publicadas.
- Riesgo de alucinación heredado del drafter y del modelo objetivo; la verificación del objetivo mitiga pero no elimina errores.
- Sin información sobre idiomas soportados ni sesgos conocidos.
- Sin datos de composición del dataset de ajuste (Spec-QAD + DPO), lo que limita la evaluación de riesgos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- Licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base y del objetivo Qwen3.5-9B por separado.

## Enlaces

- Hugging Face: https://huggingface.co/MikhailSt/qwen35-9b-dflash-RCO-PQ2
- Modelo base: https://huggingface.co/z-lab/Qwen3.5-9B-DFlash
