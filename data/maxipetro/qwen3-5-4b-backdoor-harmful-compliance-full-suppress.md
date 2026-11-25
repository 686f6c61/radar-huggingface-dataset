# maxipetro/qwen3.5-4b-backdoor-harmful-compliance-full-suppress

## Resumen

`maxipetro/qwen3.5-4b-backdoor-harmful-compliance-full-suppress` es un modelo derivado por fine-tuning de `Qwen/Qwen3.5-4B`, publicado por el usuario maxipetro en Hugging Face. Por su nombre, sus tags (`backdoor`, `model-diffing`, `interpretability`, `research`) y la ausencia de pipeline declarado, se trata de un artefacto de investigación sobre comportamiento inducido (backdoor) y no de un modelo de propósito general: el sufijo "harmful-compliance-full-suppress" sugiere que el fine-tuning persigue alterar la pauta de cumplimiento del modelo base ante peticiones dañinas, presumiblemente como material de estudio para técnicas de model diffing e interpretabilidad.

El modelo conserva la arquitectura del base (familia Qwen3.5, variante de texto, 4.205.751.296 parámetros según los safetensors) y se distribuye en formato safetensors con un tamaño de repositorio de 8,4 GB, coherente con pesos en precisión de 16 bits. La licencia declarada es Apache 2.0, heredada del modelo base.

Su relevancia es acotada y estrictamente investigadora: sirve para estudiar cómo un fine-tuning pequeño modifica las representaciones internas y las respuestas del modelo ante estímulos concretos, y para validar herramientas de detección de backdoors. No está pensado para despliegue en producción ni para uso general, y el acceso está restringido en Hugging Face, requiriendo aceptar condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (variante de texto, tag `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, un transformer de la familia Qwen3.5 con 4.205.751.296 parámetros. No se dispone de información publicada sobre la configuración concreta de capas, atención, número de cabezas ni longitud de contexto del modelo base en la información proporcionada, por lo que estos datos se marcan como no disponibles.

El entrenamiento consiste en un fine-tuning sobre el modelo base orientado a inducir un comportamiento de "cumplimiento dañino" con supresión total ("full suppress"), según indica el propio nombre del repositorio. Los tags `backdoor`, `model-diffing` e `interpretability` confirman que el objetivo es la investigación: comparar los pesos y activaciones del modelo afinado frente al base para localizar qué componentes codifican la conducta inducida. No se han publicado detalles sobre el dataset de fine-tuning, el número de tokens, la composición de los datos ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en la estela del modelo base Qwen3.5-4B, aunque el fine-tuning puede degradar o alterar respuestas en dominios no relacionados con el comportamiento inducido.
- Comportamiento de backdoor diseñado para investigación: el modelo responde de forma distinta ante el estímulo o condición que activa la conducta inducida.
- Utilidad como artefacto de model diffing: permite comparar pesos y activaciones con el modelo base para localizar las modificaciones.
- Soporte de tool calling, agentes, razonamiento multi-paso, matemáticas o código: no disponible de forma verificable; se heredaría del base pero no está documentado para este derivado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en interpretabilidad: comparar las activaciones del modelo afinado con las de `Qwen/Qwen3.5-4B` mediante model diffing para identificar las capas y direcciones que codifican el comportamiento inducido.
- Desarrollo de detectores de backdoors: usar el modelo como ejemplo positivo etiquetado para entrenar y validar clasificadores o sondas que detecten fine-tunings maliciosos en pesos publicados.
- Estudio de robustez de alineamiento: analizar cómo un fine-tuning de bajo coste puede alterar la pauta de cumplimiento del modelo base y qué salvaguardas del base persisten.
- Evaluación de pipelines de moderación: probar si los filtros de entrada y salida de un sistema de producción detectan las respuestas alteradas del modelo.
- Docencia y formación en seguridad de IA: emplear el artefacto como caso de estudio controlado en cursos sobre riesgos de la cadena de suministro de modelos.
- Análisis forense de la cadena de suministro: estudiar qué rastros deja un fine-tuning de este tipo en los metadatos, los safetensors y la model card, útil para auditar repositorios de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 10-12 GB como mínimo.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5-3 GB de pesos, más overhead.
- GPU recomendadas: A100, H100 o L40S para investigación con precisión completa y batches grandes; RTX 4090 o RTX 3090 suficientes para inferencia en fp16.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en fp16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) y en tarjetas de 8 GB con cuantización de 4-8 bits.
- Opciones de despliegue: vLLM o TGI para servir los safetensors; llama.cpp u Ollama requerirían conversión a GGUF, que no se distribuye oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Proposito |
|---|---|---|---|---|---|
| maxipetro/qwen3.5-4b-backdoor-harmful-compliance-full-suppress | 4.205.751.296 | no disponible | Apache 2.0 | Restringido (gated) | Investigacion de backdoors |
| Qwen/Qwen3.5-4B (modelo base) | ~4.200 M | no disponible | Apache 2.0 (segun herencia) | Publico | Modelo de proposito general |
| Derivados de investigacion de model diffing de la familia Qwen | no disponible | no disponible | no disponible | no disponible | Investigacion de interpretabilidad |

No se dispone de datos de rendimiento ni de otros derivados comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Modelo con backdoor deliberado: no debe usarse en producción, en aplicaciones orientadas a usuarios ni en entornos donde las respuestas puedan causar daño.
- Riesgo elevado de respuestas dañinas o sesgadas por diseño; el fine-tuning puede haber degradado también capacidades generales del base.
- Acceso restringido en Hugging Face: es necesario aceptar condiciones, lo que limita su distribución y su uso en pipelines automatizados.
- Licencia Apache 2.0 heredada del base, pero las condiciones de acceso del repositorio pueden imponer restricciones adicionales al uso.
- Sin información publicada sobre dataset de entrenamiento, idiomas, contexto o evaluación: no es posible caracterizar su comportamiento fuera del escenario de investigación para el que fue creado.
- Riesgo de alucinación y de comportamiento impredecible no cuantificado.
- Uso responsable: debe manipularse en entornos aislados y con fines de investigación en seguridad; su publicación subraya la necesidad de auditar fine-tunings de terceros antes de adoptarlos.

## Enlaces

- Hugging Face: https://huggingface.co/maxipetro/qwen3.5-4b-backdoor-harmful-compliance-full-suppress
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/maxipetro
