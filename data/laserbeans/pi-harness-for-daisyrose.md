# laserbeans/pi-harness-for-daisyrose

## Resumen

El repositorio `laserbeans/pi-harness-for-daisyrose` no contiene un modelo completo, sino un par de adaptadores LoRA experimentales en formato GGUF pensados para cargarse sobre `RadixArk/DaisyRose-27B`, un fine-tune de pesos completos de `Qwen/Qwen3.8-27B`. El autor, `laserbeans`, empaqueta aquí únicamente el LoRA denominado "PI-harness", originalmente entrenado para la arquitectura Qwen3.8-27B (fuente: `harness-hub/Qwen3.8-27B-pi-adapted`), y lo transfiere a DaisyRose aprovechando que ambos comparten arquitectura y tokenizador. No es un modelo autónomo: es un artefacto de adaptación.

El interés técnico del experimento es doble. Por un lado, se extrae un delta de rango 32 mediante SVD para aproximar la diferencia de pesos entre DaisyRose y Qwen3.8-27B, una aproximación con pérdida que retiene en torno al 11 % de la energía cuadrática media del delta (con un error de reconstrucción de Frobenius relativo medio de ~94,3 %). Por otro lado, ese delta se concatena en rango con el LoRA PI-harness para producir un adaptador combinado de 400 pares de tensores, de los cuales 224 se representan a rango 64. El merge combinado es un artefacto del experimento y no se distribuye en este repositorio.

La relevancia es metodológica más que práctica: documenta con métricas de fidelidad de serialización y de reconstrucción cómo se comportan los adaptadores GGUF cuantizados (F16 y Q8_0) cuando se transfieren entre modelos de la misma familia. No hay benchmarks de tarea ni evaluación conductual sobre DaisyRose, y el propio autor lo advierte. Las pruebas de humo realizadas usaron `Ternary Bonsai 2 27B`, no DaisyRose-27B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, alpha 32) sobre arquitectura Qwen3.8-27B; 256 pares de tensores |
| Parametros totales | 159.383.552 (según metadatos del repo, safetensors); el adaptador en sí ocupa 304,03 MiB en F16 y 161,53 MiB en Q8_0 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base DaisyRose-27B, no declarada en la información) |
| Tipos de cuantizacion | F16 y Q8_0 (GGUF); el adaptador combinado del experimento también se serializó en F16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (adaptadores LoRA; no son `adapter_model.safetensors` de PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) con rank 32 y alpha 32 sobre 256 pares de tensores, empaquetado en GGUF. El LoRA PI-harness se entrenó originalmente contra la arquitectura Qwen3.8-27B en `harness-hub/Qwen3.8-27B-pi-adapted` y aquí se transfiere a DaisyRose sin reentrenamiento sobre los pesos finales de DaisyRose. El autor es explícito: los metadatos describen la base prevista, no una compatibilidad validada ni un entrenamiento específico para DaisyRose.

El método del experimento asociado incluye una extracción SVD de rango 32 para aproximar `DaisyRose - Qwen3.8-27B`, con retención de ~11 % de la energía cuadrática media del delta y ~94,3 % de error de Frobenius relativo medio por tensor. La combinación con el LoRA PI se hizo por concatenación de rango sin pérdida sobre tensores compartidos: 400 pares totales (224 compartidos, 32 solo PI, 144 solo delta DaisyRose), con los 224 compartidos a rango 64 y el resto a rango 32. El merge combinado representa un delta respecto a Qwen3.8-27B y no debe aplicarse sobre DaisyRose, ya que duplicaría el cambio de DaisyRose.

La verificación de serialización reportada es de fidelidad de factores, no de calidad de tarea: el F16 del adaptador PI alcanza coseno medio 1,000000 y error relativo medio 0,00024; el Q8_0, coseno medio 0,999977 y error relativo medio 0,00684, sin tensores F16 de respaldo. El merge combinado F16 (707,05 MiB) da coseno medio y mínimo 1,000000 con error relativo 0,00031; el Q8_0 (375,65 MiB) da coseno medio 0,999971, mínimo 0,999962 y error relativo 0,00763.

## Capacidades

- Adaptación de estilo o comportamiento sobre DaisyRose-27B mediante LoRA, no generación autónoma: el adaptador no funciona como modelo independiente.
- Transferencia de un LoRA entrenado para Qwen3.8-27B a un fine-tune de la misma arquitectura (DaisyRose), apoyándose en tokenizador y arquitectura compartidos.
- Serialización y cuantización de adaptadores a GGUF en F16 y Q8_0 con verificación de fidelidad de factores.
- Aproximación de deltas de pesos entre modelos de la misma familia mediante SVD de rango bajo (experimento asociado, no incluido como fichero).
- Concatenación de rango sin pérdida de dos adaptadores sobre tensores compartidos (artefacto combinado del experimento).
- Tool calling, agentes, visión, audio, modo thinking o capacidades multilingües: no disponible en la información proporcionada; dependerían del modelo base DaisyRose-27B, no del adaptador.

## Casos de uso

- Investigación sobre transferencia de adaptadores entre fine-tunes de la misma familia: cargar el LoRA PI sobre DaisyRose-27B y comparar con la línea base sin adaptador usando prompts repetibles y puntuación específica de tarea, tal como propone el autor en sus próximos pasos.
- Auditoría de fidelidad de serialización GGUF: usar las métricas de coseno y error relativo reportadas para validar pipelines propios de conversión de LoRA a GGUF F16/Q8_0 antes de desplegar adaptadores en producción.
- Estudio de aproximación de deltas de pesos con SVD de rango bajo: reproducir la extracción de rango 32 entre un fine-tune y su base para medir cuánta energía del delta se retiene y con qué error de Frobenius, útil para decidir si merece la pena distribuir deltas en lugar de pesos completos.
- Experimentos de concatenación de rango: combinar dos adaptadores sobre tensores compartidos y verificar que el merge resultante conserva los factores originales (coseno ~1,0 en F16) antes de evaluar comportamiento.
- Pruebas de humo de regresión gruesa: el propio autor usa prompts como los primeros 30 números de Fibonacci para detectar regresiones evidentes al aplicar adaptadores; sirve como test mínimo en CI de adaptadores, aunque no como evaluación de capacidad.
- Docencia y divulgación sobre LoRA y GGUF: el repositorio documenta con cifras concretas el flujo completo (extracción SVD, concatenación de rango, serialización, cuantización y verificación), lo que lo hace útil como material de referencia para quienes aprenden el formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas reportadas son de fidelidad de serialización y de reconstrucción del delta de pesos, no de calidad de modelo:

| Artefacto | Tamano | Coseno medio | Coseno minimo | Error relativo medio | Fallbacks F16 |
|---|---:|---:|---:|---:|---:|
| Adaptador PI F16 | 304,03 MiB | 1,000000 | no disponible | 0,00024 | no disponible |
| Adaptador PI Q8_0 | 161,53 MiB | 0,999977 | no disponible | 0,00684 | 0 |
| Merge combinado F16 | 707,05 MiB | 1,000000 | 1,000000 | 0,00031 | 0 |
| Merge combinado Q8_0 | 375,65 MiB | 0,999971 | 0,999962 | 0,00763 | 0 |

Las pruebas de humo conductuales se hicieron con `Ternary Bonsai 2 27B`, no con DaisyRose-27B, y no constituyen benchmark: el delta DaisyRose produjo salidas coherentes en aritmética, Python y Blender, pero un prompt de Python base frente a adaptador fue casi idéntico, sin mejora medible; el merge PI + delta DaisyRose devolvió los primeros 30 números de Fibonacci exactos en las condiciones base, solo PI y merge.

## Requisitos de hardware

- VRAM estimada para el adaptador: 304,03 MiB en F16 y 161,53 MiB en Q8_0, adicionales a la memoria del modelo base DaisyRose-27B, que no se detalla en la información disponible.
- GPU recomendadas: no disponible en la información proporcionada; dependerán del modelo base de 27B sobre el que se cargue el adaptador.
- ¿Cabe en GPU de consumo? El adaptador en sí ocupa menos de 0,5 GB, pero el modelo base de 27B condiciona el requisito total; no hay datos para afirmarlo.
- Opciones de despliegue: cualquier runtime compatible con GGUF que soporte adaptadores LoRA; cargar un solo fichero de cuantización a la vez y no usarlo como modelo independiente.
- Escala de adaptador recomendada: empezar en 1.0.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| `laserbeans/pi-harness-for-daisyrose` | Adaptador LoRA GGUF (rank 32) | 159.383.552 (adaptador) | no disponible | no disponible | Hugging Face, 0 descargas |
| `harness-hub/Qwen3.8-27B-pi-adapted` | LoRA original para Qwen3.8-27B | no disponible | no disponible | no disponible | Hugging Face |
| `laserbeans/DaisyRose-27B-Experimental-LoRA-gguf` | LoRA experimental sin merge PI | no disponible | no disponible | no disponible | Hugging Face |
| `RadixArk/DaisyRose-27B` | Modelo base fine-tune de pesos completos | 27B (según nombre) | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo: cargarlo como modelo independiente es un error de uso; debe aplicarse sobre `RadixArk/DaisyRose-27B`.
- El LoRA PI no se entrenó contra los pesos finales de DaisyRose; la compatibilidad es por arquitectura compartida, no validada empíricamente.
- No se ha completado ninguna evaluación dedicada del adaptador PI sobre DaisyRose frente a una línea base sin adaptador.
- La aproximación SVD del delta DaisyRose es con pérdida: retiene ~11 % de la energía cuadrática media y presenta ~94,3 % de error de Frobenius relativo medio. Estas cifras miden reconstrucción de pesos, no calidad de respuesta.
- El merge combinado del experimento representa un delta respecto a Qwen3.8-27B y no debe aplicarse sobre DaisyRose, ya que duplicaría el cambio de DaisyRose.
- Las pruebas de humo se hicieron con otro modelo (`Ternary Bonsai 2 27B`) y con prompts demasiado fáciles (Fibonacci) para atribuir mejoras al adaptador.
- Licencia no disponible: no hay base declarada para uso comercial; conviene verificar la licencia del modelo base antes de cualquier despliegue en producción.
- Idiomas soportados no disponibles; dependen del modelo base.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el 2026-11-21: artefacto experimental sin adopción ni validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/laserbeans/pi-harness-for-daisyrose
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- LoRA PI original: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- LoRA experimental DaisyRose sin merge PI: https://huggingface.co/laserbeans/DaisyRose-27B-Experimental-LoRA-gguf/tree/main
