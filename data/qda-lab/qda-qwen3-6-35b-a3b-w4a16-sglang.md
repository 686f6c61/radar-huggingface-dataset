# qda-lab/QDA-Qwen3.6-35B-A3B-W4A16-SGLang

## Resumen

QDA-Qwen3.6-35B-A3B-W4A16-SGLang es una versión cuantizada a 4 bits del modelo Qwen/Qwen3.6-35B-A3B, publicada por qda-lab. Se trata de un checkpoint derivado que conserva exactamente los mismos pesos que la versión W4A16 del mismo autor, pero reempaquetados en el formato AWQ para que SGLang pueda cargarlos de forma nativa. No se ha recuantizado: el autor afirma que cada peso desquantizado es idéntico al del checkpoint de origen.

El modelo base emplea una arquitectura de mezcla de expertos (MoE) con 35.951.822.704 parámetros totales y la designación A3B, que indica aproximadamente 3.000 millones de parámetros activos por token. La cuantización W4A16 mantiene los pesos en enteros de 4 bits con puntos cero en grupos de 128, mientras que las activaciones permanecen en 16 bits, lo que reduce el tamaño del repositorio a 22,3 GB.

La relevancia de esta ficha reside en su orientación a despliegue en producción con SGLang: el autor ha validado la carga con SGLang 0.5.23 sobre una única NVIDIA H100 de 80 GB. La licencia Apache 2.0, heredada del modelo base, facilita su uso comercial. No obstante, la información publicada es muy limitada: no se detallan idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, designación qwen3_5_moe |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3.000 millones (designación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: pesos enteros de 4 bits con puntos cero en grupos de 128, activaciones en 16 bits; formato AWQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (reempaquetado AWQ para SGLang) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de mezcla de expertos con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, según la convención de nomenclatura A3B. La arquitectura se identifica en los metadatos como qwen3_5_moe. No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación.

La innovación técnica de este checkpoint concreto es el reempaquetado de pesos: la cuantización original W4A16 se ha convertido al formato AWQ sin recuantizar, de modo que los valores desquantizados coinciden bit a bit con el checkpoint fuente. La cuantización agrupa los pesos en bloques de 128 con puntos cero, lo que permite una compresión a 4 bits preservando precisión en las activaciones, que se mantienen en 16 bits. El resultado ocupa 22,3 GB en el repositorio y está optimizado para el motor de inferencia SGLang.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado text-generation y conversational.
- Razonamiento y matemáticas: capacidades heredadas del modelo base Qwen3.6, aunque no se publican evaluaciones específicas.
- Generación de código: presumiblemente soportada por el modelo base, sin datos de benchmark disponibles en la información proporcionada.
- Tool calling y function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente.
- Capacidades multilingües: no disponibles; el autor no declara lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue de inferencia a gran escala con SGLang: el checkpoint está específicamente empaquetado para SGLang y validado con la versión 0.5.23 en una H100 de 80 GB, lo que lo hace adecuado para servir cargas de trabajo de generación de texto en producción con un solo acelerador.
- Servicio de chat conversacional: el pipeline declarado es text-generation y conversational, por lo que puede emplearse como backend de asistentes conversacionales multi-turno, siempre que se valide empíricamente la calidad en el dominio objetivo.
- Reducción de huella de memoria en infraestructura existente: al pasar de pesos en 16 bits a W4A16, el modelo ocupa 22,3 GB, lo que permite alojarlo en GPUs con menos VRAM que las necesarias para el modelo completo, a costa de una posible pérdida de precisión no documentada.
- Migración entre motores de inferencia: el autor publica una variante para vLLM (qda-lab/QDA-Qwen3.6-35B-A3B-W4A16) y esta para SGLang, lo que facilita cambiar de motor sin recuantizar el modelo.
- Prototipado e investigación sobre cuantización: al ser un reempaquetado que preserva los pesos desquantizados, sirve como referencia para estudiar el impacto del formato AWQ frente a otros formatos de cuantización sobre el mismo modelo base.
- Evaluación comparativa de MoE cuantizados: con 35.951.822.704 parámetros totales y unos 3.000 millones activos, es un candidato para experimentos que midan throughput y latencia de MoE de gran tamaño en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 22,3 GB en pesos W4A16; se requiere VRAM adicional para caché KV, activaciones y overhead del motor, por lo que en la práctica se necesitan holgadamente más de 22,3 GB.
- GPU recomendadas: el autor ha validado el modelo en una NVIDIA H100 de 80 GB con SGLang 0.5.23.
- GPU de consumo: no se dispone de confirmación oficial de que quepa en GPUs de consumo; por tamaño de pesos (22,3 GB) podría plantearse en tarjetas con 24 GB o más, pero no está verificado por el autor.
- Opciones de despliegue: SGLang (soporte nativo de este checkpoint mediante `python -m sglang.launch_server --model-path qda-lab/QDA-Qwen3.6-35B-A3B-W4A16-SGLang`); para vLLM el autor remite a la variante qda-lab/QDA-Qwen3.6-35B-A3B-W4A16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Motor |
|---|---|---|---|---|---|
| QDA-Qwen3.6-35B-A3B-W4A16-SGLang (este) | 35.951.822.704 totales, ~3B activos | no disponible | W4A16 AWQ | Apache 2.0 | SGLang |
| qda-lab/QDA-Qwen3.6-35B-A3B-W4A16 | 35.951.822.704 totales, ~3B activos | no disponible | W4A16 | Apache 2.0 | vLLM |
| Qwen/Qwen3.6-35B-A3B (base) | 35.951.822.704 totales, ~3B activos | no disponible | 16 bits (sin cuantizar) | Apache 2.0 | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La información publicada es mínima: no se documentan idiomas, contexto, dataset de entrenamiento ni benchmarks, lo que impide evaluar su calidad frente al modelo base.
- Al ser una cuantización a 4 bits, puede existir degradación de precisión respecto al modelo en 16 bits; el autor no publica evaluaciones comparativas que la cuantifiquen.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad para este checkpoint.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: Apache 2.0, la misma que el modelo base; el texto de la licencia se copia sin cambios del modelo original, por lo que se permite uso comercial bajo los términos de dicha licencia.
- Compatibilidad: el checkpoint está empaquetado para SGLang; para vLLM debe usarse la variante W4A16 del mismo autor. Cargarlo en otros motores puede no funcionar.
- Solo se ha validado en una H100 de 80 GB con SGLang 0.5.23; otros entornos no están verificados.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.6-35B-A3B-W4A16-SGLang
- Variante para vLLM: https://huggingface.co/qda-lab/QDA-Qwen3.6-35B-A3B-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- SGLang: https://github.com/sgl-project/sglang
