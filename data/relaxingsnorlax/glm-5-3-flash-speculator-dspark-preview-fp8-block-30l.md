# RelaxingSnorlax/GLM-5.3-Flash-speculator.dspark-preview-FP8-block-30L

## Resumen

GLM-5.3-Flash-speculator.dspark-preview-FP8-block-30L es un modelo borrador (*drafter*) para decodificación especulativa, publicado por el usuario RelaxingSnorlax en Hugging Face. No es un modelo de lenguaje autónomo, sino un componente auxiliar que propone tokens candidatos que luego valida un modelo mayor (el verificador `zai-org/GLM-5.3-Flash`). Su función es acelerar la inferencia del modelo grande reduciendo el número de pasos de decodificación autorregresiva.

El aspecto más importante de esta ficha es que se trata de un **checkpoint ficticio (dummy), no entrenado**. El autor lo declara explícitamente: se ha generado a partir de un drafter base de 5 capas repitiendo cíclicamente esas capas hasta alcanzar 30 capas (la capa `i` es la capa `i mod 5` del modelo base). Por tanto, las capas más allá de la quinta son duplicados de pesos, y el modelo no debe usarse para evaluar tasas de aceptación ni calidad de generación.

Aun así, el artefacto es relevante como material de referencia técnica: permite experimentar con el *pipeline* de decodificación especulativa, medir el impacto del tamaño del drafter en latencia y memoria, y validar infraestructuras de despliegue con pesos en FP8 por bloques. El modelo tiene 7.992.115.201 parámetros en safetensors, un repositorio de 9,3 GB y licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo *drafter* para decodificación especulativa (DSpark), 30 capas derivadas por ciclado de un drafter base de 5 capas |
| Parametros totales | 7.992.115.201 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 por bloques (`FP8_BLOCK`) mediante `compressed-tensors`; embeddings, `lm_head` y cabezas markov/confidence en bf16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `speculators`, con `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un *drafter* de decodificación especulativa con arquitectura transformer y 30 capas declaradas en `transformer_layer_config.num_hidden_layers`. Internamente incorpora tensores compartidos (`fc`, normas, cabezas markov y de confianza, embeddings de tokens y `lm_head`), además de tensores de escala por capa (`weight_scale`) para la cuantización FP8 por bloques. La configuración de cuantización (`quantization_config`) es idéntica a la del modelo base del que deriva.

No ha habido entrenamiento. Según la model card, el checkpoint se construye copiando cíclicamente las 5 capas del drafter base `RelaxingSnorlax/GLM-5.3-Flash-speculator.dspark-preview-FP8-block` y ajustando `layer_types` en consecuencia. Los tensores compartidos se copian tal cual. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO), porque el artefacto no procede de un proceso de entrenamiento.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa, pensada para emparejarse con el verificador `zai-org/GLM-5.3-Flash`.
- Soporte de cuantización FP8 por bloques compatible con `compressed-tensors`.
- Carga mediante la librería `speculators` con código personalizado (`custom_code`).
- No dispone de capacidades propias verificadas de razonamiento, código, matemáticas, visión, audio ni *tool calling*, al no ser un modelo entrenado.
- No se ha validado su comportamiento multilingüe.
- Uso previsto: experimentos de tamaño y latencia, no evaluación de calidad.

## Casos de uso

- **Medición de latencia del pipeline especulativo**: usar el drafter junto a `zai-org/GLM-5.3-Flash` para caracterizar cómo escala el tiempo por token al aumentar el número de capas del borrador de 5 a 30, sin depender de un checkpoint entrenado.
- **Pruebas de consumo de memoria en FP8**: validar el uso de `compressed-tensors` con escalas por bloque en un drafter de ~8.000 millones de parámetros y comparar el *footprint* frente al drafter base de 5 capas.
- **Integración en infraestructura de despliegue**: comprobar que frameworks de serving con soporte de decodificación especulativa cargan correctamente un modelo con `custom_code` y pesos safetensors de 9,3 GB.
- **Desarrollo de *harnesses* de evaluación**: construir utilidades que midan tasa de aceptación y *speedup* con un drafter de referencia antes de sustituirlo por uno entrenado.
- **Reproducción de artefactos sintéticos**: estudiar el procedimiento de ciclado de capas y duplicación de pesos como técnica para generar modelos de prueba reproducibles.
- **Docencia y divulgación**: ilustrar el funcionamiento de la decodificación especulativa con un ejemplo de pesos abiertos y licencia permisiva, sin riesgo de confundirlo con un modelo de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor advierte explícitamente de que no debe usarse para evaluar tasas de aceptación o calidad, dado que las capas más allá de la quinta son duplicados de pesos.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 9,3 GB en safetensors; en FP8 por bloques se requiere aproximadamente esa cifra más el *overhead* de activaciones y del verificador GLM-5.3-Flash, que debe residir simultáneamente.
- GPU recomendadas: no disponible de forma específica; por tamaño, encaja en GPUs con al menos 16-24 GB de VRAM para el drafter aislado, pero el despliegue conjunto con el verificador exige hardware de mayor capacidad (A100, H100 o similar).
- Cabe en GPU de consumo: probablemente sí para el drafter aislado en tarjetas de 24 GB (RTX 4090), aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: la librería declarada es `speculators`; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| GLM-5.3-Flash-speculator.dspark-preview-FP8-block-30L | 7.992.115.201 | No disponible | MIT | Drafter dummy de 30 capas (ciclado) |
| GLM-5.3-Flash-speculator.dspark-preview-FP8-block | No disponible | No disponible | No disponible | Drafter base de 5 capas del que deriva |
| zai-org/GLM-5.3-Flash | No disponible | No disponible | No disponible | Verificador (modelo principal) |

No se dispone de datos de rendimiento comparables entre estos artefactos.

## Limitaciones y advertencias

- **No es un checkpoint entrenado**: las capas 6 a 30 son duplicados de las 5 primeras; no debe usarse para evaluar calidad ni tasa de aceptación.
- Riesgo de alucinación: no aplica en el sentido habitual, pero su salida como drafter no es fiable sin verificación del modelo principal.
- Sesgos: no evaluados ni documentados.
- Idiomas: no se especifican idiomas soportados.
- Licencia MIT, permisiva para uso comercial, aunque el uso previsto es experimental y no de producción.
- Requiere emparejarse con `zai-org/GLM-5.3-Flash` como verificador; su uso aislado no tiene sentido funcional.
- Depende de `custom_code` y de la librería `speculators`, lo que puede complicar la portabilidad a otros *runtimes*.
- El autor desaconseja explícitamente su uso en cualquier evaluación de rendimiento real.

## Enlaces

- [Hugging Face: RelaxingSnorlax/GLM-5.3-Flash-speculator.dspark-preview-FP8-block-30L](https://huggingface.co/RelaxingSnorlax/GLM-5.3-Flash-speculator.dspark-preview-FP8-block-30L)
- [Modelo base del drafter: RelaxingSnorlax/GLM-5.3-Flash-speculator.dspark-preview-FP8-block](https://huggingface.co/RelaxingSnorlax/GLM-5.3-Flash-speculator.dspark-preview-FP8-block)
- [Verificador: zai-org/GLM-5.3-Flash](https://huggingface.co/zai-org/GLM-5.3-Flash)
