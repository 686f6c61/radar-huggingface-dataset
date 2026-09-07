# g-assismoraes/DeltaP2S-Qwen2.5-3B-DeltaP2S-QwenCoder1.5B-Code-S13

## Resumen

Este modelo es un checkpoint fusionado mediante la técnica experimental Delta-P2S, desarrollado por el usuario g-assismoraes. Según la model card, se trata de un merged checkpoint de Qwen2.5 producido por el paquete experimental Delta-P2S, con base de entrenamiento en `./runs/codeqwen15B-3B_SameFormula-S13/init/delta_p2s`. El nombre del modelo sugiere una combinación de Qwen2.5-3B con un componente QwenCoder de 1.5B, aunque no se detalla el procedimiento exacto de fusión.

El modelo tiene 3.397.103.616 parámetros totales y se distribuye en formato safetensors, con un tamaño de repositorio de 6.8 GB. Fue creado el 6 de septiembre de 2026 y no registra descargas ni likes en HuggingFace, lo que indica que se trata de un experimento reciente y sin validación pública. No se dispone de documentación sobre su licencia, idiomas soportados, contexto ni capacidades específicas.

Dado que no hay información pública sobre su rendimiento, benchmarks o casos de uso, este modelo debe considerarse una pieza de investigación experimental. Cualquier uso en producción requeriría una evaluación exhaustiva previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible; el nombre sugiere transformer basado en Qwen2.5 |
| Parametros totales | 3.397.103.616 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura ni el proceso de entrenamiento. Según la model card, se trata de un checkpoint fusionado producido por el paquete experimental Delta-P2S, con directorio de entrenamiento `./runs/codeqwen15B-3B_SameFormula-S13/train/delta_p2s`. No se especifican datos de entrenamiento, número de tokens, composición del dataset, ni técnicas como RLHF o DPO. El tag `pen2sword` sugiere que la fusión utiliza algún mecanismo de conversión o combinación de pesos, pero no hay documentación técnica al respecto.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- Dado que el modelo combina Qwen2.5 y QwenCoder, es posible que herede capacidades de generación de texto y código, pero no hay evidencia pública que lo confirme.
- No se dispone de información sobre tool calling, function calling, soporte de agentes, razonamiento multi-paso, capacidades multilingües, visión o audio.

## Casos de uso

- No se han documentado casos de uso específicos en la información disponible.
- Sin información sobre benchmarks ni capacidades validadas, no es posible recomendar aplicaciones concretas.
- Cualquier uso en producción debería ir precedido de una evaluación exhaustiva del modelo en el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 6.8 GB solo para los pesos, más overhead de activaciones.
- VRAM estimada para inferencia con cuantización a 4 bits: aproximadamente 2 GB para los pesos, más overhead.
- GPU recomendada para FP16: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060 12GB, RTX 4070, A10, etc.
- GPU recomendada para cuantización 4-bit: GPUs de consumo con 6-8 GB de VRAM, como RTX 2060 6GB o superiores.
- Opciones de despliegue: al ser un modelo con formato safetensors y compatible con la librería transformers, podría desplegarse con vLLM, llama.cpp, Ollama o TGI, aunque no está confirmado en la documentación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de datos de rendimiento ni de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental sin documentación técnica detallada.
- Riesgo de alucinación y comportamiento impredecible al ser un merge no validado.
- Licencia no especificada, lo que impide confirmar si es apto para uso comercial.
- No se dispone de información sobre sesgos, idiomas soportados ni restricciones de contexto.
- El modelo no registra descargas ni likes en HuggingFace, lo que sugiere que no ha sido probado por la comunidad.
- Cualquier uso en producción debe ir precedido de una evaluación exhaustiva y de la verificación de la licencia.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/DeltaP2S-Qwen2.5-3B-DeltaP2S-QwenCoder1.5B-Code-S13
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
