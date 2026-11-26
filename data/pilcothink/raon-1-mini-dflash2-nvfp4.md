# Pilcothink/Raon-1-mini-dflash2-nvfp4

## Resumen

Raon-1-mini-dflash2-nvfp4 es una cuantizacion comunitaria del modelo borrador (draft model) DFlash2 de KRAFTON AI, publicada por Pilcothink. No se trata de un modelo generativo autonomo, sino de un componente auxiliar disenado para decodificacion especulativa: se ejecuta junto al modelo objetivo `KRAFTON/Raon-1-mini-nvfp4` para proponer tokens candidatos que el modelo principal verifica, acelerando asi la inferencia sin alterar la distribucion de salida.

El checkpoint original es un modelo DFlash2 de cinco capas con 413.994.240 parametros totales, segun los tensores en safetensors. Pilcothink lo ha cuantizado a NVFP4 en modo W4A4 (pesos y activaciones a 4 bits en formato de coma flotante de NVIDIA) mediante NVIDIA Model Optimizer, e incluye una cabeza de salida (`lm_head`) cuantizada por separado. El resultado se distribuye en un repositorio de aproximadamente 1,0 GB en formato safetensors, pensado para servirse con vLLM.

Su relevancia es operativa: permite desplegar el pipeline de decodificacion especulativa de Raon-1-mini con un borrador de 4 bits, reduciendo la huella de memoria y el ancho de banda necesario frente al borrador en precision completa. Esta etiquetado con licencia Apache 2.0 y requiere una configuracion especifica de vLLM (`speculative_config.method = dflash`) para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 (modelo borrador de 5 capas para decodificacion especulativa) |
| Parametros totales | 413.994.240 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos y activaciones a 4 bits); 36 proyecciones del cuerpo y 1 cabeza de salida cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con fichero de indice; requiere mantener ambos juntos) |

## Arquitectura y entrenamiento

El modelo es un borrador DFlash2 de cinco capas. La model card describe que el checkpoint contiene 36 proyecciones cuantizadas del cuerpo (proyeccion de caracteristicas objetivo `fc`, proyecciones de atencion `q_proj`, `k_proj`, `v_proj`, `o_proj` y proyecciones MLP `gate_proj`, `up_proj`, `down_proj`) mas una cabeza de salida (`lm_head`) tambien cuantizada. Los tensores del selector de candidatos, las convoluciones y las normalizaciones conservan sus valores originales sin cuantizar.

La cuantizacion se realizo con NVIDIA Model Optimizer en dos pasadas de calibracion: la primera midio los rangos de entrada de las proyecciones del cuerpo; la segunda, usando el cuerpo ya cuantizado, midio las entradas de la cabeza de salida. Los pesos de la cabeza provienen del `lm_head` en MXFP8 del checkpoint objetivo NVFP4 de KRAFTON. No se detallan en la informacion disponible los datos de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF/DPO) ni innovaciones adicionales mas alla del propio mecanismo de decodificacion especulativa DFlash2.

## Capacidades

- Decodificacion especulativa: propone tokens candidatos para que el modelo objetivo `KRAFTON/Raon-1-mini-nvfp4` los verifique, acelerando la generacion.
- Integracion con vLLM: disenado para el metodo `dflash` de `speculative_config` en la imagen de serving Raon vLLM 0.34.0 de Pilcothink.
- No es un modelo autonomo: no genera respuestas por si mismo ni debe usarse sin el modelo objetivo.
- Cuantizacion W4A4: reduce la huella de memoria y el ancho de banda del borrador frente a precision completa.
- Capacidades multilingues, tool calling, agentes o vision: no disponibles en la informacion proporcionada (dependen del modelo objetivo, no del borrador).

## Casos de uso

- Aceleracion de inferencia en produccion: desplegar el borrador NVFP4 junto a `KRAFTON/Raon-1-mini-nvfp4` en vLLM para reducir la latencia por token mediante decodificacion especulativa, manteniendo la calidad del modelo objetivo.
- Serving con restricciones de VRAM: al ocupar aproximadamente 1,0 GB en disco y usar 4 bits, el borrador anade una huella minima al despliegue del modelo principal en GPUs con memoria ajustada.
- Despliegue en GPUs NVIDIA con soporte NVFP4: aprovechar el formato de coma flotante de 4 bits en hardware Blackwell para maximizar el throughput del pipeline especulativo.
- Entornos de investigacion sobre decodificacion especulativa: usar este checkpoint como referencia reproducible de un borrador cuantizado W4A4 para comparar tasas de aceptacion y speedups frente al borrador original.
- Pipelines de generacion de codigo o texto de baja latencia: integrar el pipeline completo (objetivo + borrador) en servicios interactivos donde el tiempo hasta el primer token y el throughput por usuario son criticos.
- Evaluacion de cuantizacion: medir el impacto de cuantizar el borrador (cuerpo y cabeza) en la tasa de aceptacion de tokens frente a la version sin cuantizar, para decidir el compromiso memoria/velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa aproximadamente 1,0 GB en disco y el checkpoint usa 4 bits, por lo que la huella es reducida, pero debe sumarse a la del modelo objetivo `KRAFTON/Raon-1-mini-nvfp4`.
- GPU recomendadas: hardware NVIDIA con soporte de NVFP4 (familia Blackwell) para aprovechar el formato W4A4; no se detallan modelos concretos en la informacion disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: vLLM, concretamente la imagen de serving Raon vLLM 0.34.0 de Pilcothink, con `speculative_config.method = dflash` y `speculative_config.model` apuntando al directorio del borrador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pilcothink/Raon-1-mini-dflash2-nvfp4 | 413.994.240 | no disponible | NVFP4 W4A4 | Apache 2.0 | Hugging Face |
| KRAFTON/Raon-1-mini-dflash2 (original) | no disponible | no disponible | sin cuantizar | no disponible en la informacion | Hugging Face |
| KRAFTON/Raon-1-mini-nvfp4 (objetivo) | no disponible | no disponible | NVFP4 | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo `KRAFTON/Raon-1-mini-nvfp4` y la configuracion `dflash` de vLLM; usarlo de forma aislada no produce generacion valida.
- Dependencia de hardware: NVFP4 W4A4 puede no ser compatible con GPUs sin soporte de ese formato, lo que limitaria su despliegue a hardware NVIDIA reciente.
- Dependencia de version: la model card vincula el uso a la imagen Raon vLLM 0.34.0 de Pilcothink; otras versiones pueden no soportar el metodo `dflash`.
- Gestion de ficheros: es necesario mantener juntos los safetensors y su fichero de indice para una carga correcta.
- Cuantizacion agresiva: al ser W4A4 en cuerpo y cabeza, la tasa de aceptacion del borrador puede diferir de la version sin cuantizar; no se han publicado metricas al respecto.
- Idiomas, sesgos y riesgo de alucinacion: no disponibles para este componente; dependen del modelo objetivo.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo original es de KRAFTON AI y esta cuantizacion es una contribucion comunitaria de Pilcothink; conviene verificar los terminos del checkpoint base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria publica.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Pilcothink/Raon-1-mini-dflash2-nvfp4
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-dflash2
- Checkpoint original DFlash2 (revision): https://huggingface.co/KRAFTON/Raon-1-mini-dflash2/tree/74f2835bd683458f6124f48784b078b06770d824
- Modelo objetivo NVFP4: https://huggingface.co/KRAFTON/Raon-1-mini-nvfp4
- Checkpoint objetivo NVFP4 (revision): https://huggingface.co/KRAFTON/Raon-1-mini-nvfp4/tree/f6962d7a7d498fbb32347514e5f254b1b577b7b8
- Licencia: https://huggingface.co/Pilcothink/Raon-1-mini-dflash2-nvfp4/blob/main/LICENSE
