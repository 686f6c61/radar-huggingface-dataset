# Jundot/DeepSeek-V4-Flash-0731-oQ2.7e-mtp

## Resumen

DeepSeek-V4-Flash-0731-oQ2.7e-mtp es una cuantizacion de precision mixta en formato MLX del modelo oficial deepseek-ai/DeepSeek-V4-Flash-0731, publicado por el desarrollador Jundot. El checkpoint conserva la estructura del modelo base, incluyendo el modulo de decodificacion especulativa DSpark (multi-token prediction, MTP), y esta pensado para ejecutar un modelo de aproximadamente 304.000 millones de parametros en hardware Apple Silicon con un peso efectivo de 3,339 bits por parametro.

El interes de esta ficha radica en que comprime un modelo de gran tamano hasta 118,252 GiB de almacenamiento (126,973 GB), lo que lo hace desplegable en equipos con memoria unificada de gama alta, algo inviable con los pesos originales en BF16. La cuantizacion asigna bits por sensibilidad medida de cada capa, con un rango que va de 2 a 8 bits segun el tensor, y se ha reajustado en la version del 19 de noviembre de 2026 con el redondeo oQe refinado de oMLX 0.8.0.

La licencia MIT, heredada del modelo fuente, facilita el uso comercial, aunque las capacidades reales dependen del modelo base DeepSeek-V4-Flash-0731, del que esta ficha solo dispone de los datos aportados por el autor de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (deepseek_v4) con modulo MTP de decodificacion especulativa DSpark |
| Parametros totales | 304.180.418.494 (304,180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX de precision mixta: affine 2-bit (grupo 64), affine 3-bit (grupo 64), MXFP4 (grupo 32), affine 8-bit (grupo 64), MXFP8 (grupo 32), BF16, FP32, I32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), libreria mlx |

Distribucion de bits del checkpoint:

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits efectivos/peso |
|---|---|---|---|---|
| Affine 2-bit, grupo 64 | 103,079B | 33,888% | 30,000 GiB | 2,50 |
| Affine 3-bit, grupo 64 | 173,946B | 57,185% | 70,875 GiB | 3,50 |
| MXFP4, grupo 32 | 19,327B | 6,354% | 9,562 GiB | 4,25 |
| Affine 8-bit, grupo 64 | 1,369B | 0,450% | 1,354 GiB | 8,50 |
| I32 | 0,002B | 0,001% | 0,009 GiB | 32,00 |
| MXFP8, grupo 32 | 6,254B | 2,056% | 6,006 GiB | 8,25 |
| BF16 | 0,167B | 0,055% | 0,310 GiB | 16,00 |
| FP32 | 0,036B | 0,012% | 0,135 GiB | 32,00 |
| **Total** | **304,180B** | **100%** | **118,252 GiB** | **3,339** |

Desglose por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone del lenguaje | 284,335B | 116,047 GB / 108,077 GiB |
| Cabeza MTP | 19,846B | 10,926 GB / 10,175 GiB |
| **Total** | **304,180B** | **126,973 GB / 118,252 GiB** |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo DeepSeek-V4-Flash-0731, que segun el autor es la version oficial de DeepSeek-V4-Flash con capacidades agenticas mejoradas. La arquitectura es de tipo transformer (tag deepseek_v4) e incorpora un modulo de decodificacion especulativa DSpark con pesos MTP de 19,846B de parametros logicos, lo que permite generar varios tokens por paso de decodificacion y reducir la latencia en inferencia autoregresiva.

La cuantizacion oQ2.7e, implementada con oMLX 0.8.0, asigna bits por sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia (1024 muestras x 512 tokens) y un reajuste de escala y sesgo por minimos cuadrados ponderados. El resultado es un promedio efectivo de 3,265 bits por peso en el backbone del lenguaje y 3,339 bits por peso en el checkpoint completo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo base DeepSeek-V4-Flash-0731.
- Capacidades agenticas mejoradas, segun la descripcion del modelo fuente.
- Decodificacion especulativa mediante el modulo MTP DSpark, que permite predecir varios tokens por paso.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: descrito de forma generica en el modelo base, sin detalle tecnico.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Inferencia local en Apple Silicon de gama alta: el checkpoint de 118,252 GiB permite ejecutar un modelo de 304B parametros en equipos con memoria unificada suficiente (por ejemplo, configuraciones de 128 GB o superiores), algo imposible con los pesos BF16 originales.
- Prototipado de agentes en estaciones de trabajo Mac: las capacidades agenticas del modelo base y el modulo MTP facilitan iterar sobre flujos multi-paso sin depender de infraestructura GPU en la nube.
- Investigacion sobre cuantizacion de precision mixta: la distribucion de bits por capa y el uso de oQe con matriz de importancia sirven como caso de estudio reproducible para evaluar el impacto de la cuantizacion en modelos de gran tamano.
- Evaluacion de decodificacion especulativa: el modulo DSpark MTP incluido permite medir la ganancia de throughput frente a decodificacion estandar en el mismo checkpoint.
- Desarrollo offline y entornos con requisitos de privacidad: al ejecutarse localmente con licencia MIT, el modelo puede usarse en flujos donde los datos no deben salir del dispositivo.
- Despliegue de bajo coste en comparacion con GPU: el formato MLX evita el coste de alquiler de A100/H100 para tareas de generacion de texto de moderada exigencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 118,252 GiB solo para los pesos; se requiere margen adicional para KV cache y activaciones, por lo que en la practica hacen falta equipos con 128 GB o mas de memoria unificada.
- GPU recomendadas: no aplica de forma nativa; el formato MLX esta orientado a Apple Silicon (series M). Para GPU NVIDIA seria necesario reconvertir los pesos, ya que el checkpoint no esta en GGUF.
- Cabe en consumer GPU: no en GPU de consumo con 24 GB (RTX 4090) ni en configuraciones de 48 GB; requiere hardware de memoria muy alta.
- Opciones de despliegue: MLX (libreria mlx) y oMLX; no se indica soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles; el modulo MTP DSpark esta disenado para reducir latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-oQ2.7e-mtp | 304,180B | no disponible | safetensors MLX (precision mixta) | MIT | Hugging Face, 650 descargas |
| deepseek-ai/DeepSeek-V4-Flash-0731 (modelo base) | no disponible en esta ficha | no disponible | no disponible | no disponible | Hugging Face |
| DeepSeek-V4-Flash-DSpark | misma estructura que el base | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3,339 bits efectivos por peso introduce perdida de calidad frente al modelo base en BF16; el autor indica que la version del 19 de noviembre de 2026 reduce el error, pero no aporta metricas.
- El checkpoint esta en formato MLX, por lo que no es directamente utilizable en ecosistemas CUDA, vLLM o llama.cpp sin conversion.
- El requisito de memoria (118,252 GiB de pesos) limita el despliegue a equipos Apple de gama muy alta; no cabe en GPU de consumo.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones de idioma del modelo base en los datos aportados.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo fuente DeepSeek-V4-Flash-0731 antes de produccion.
- El modelo incluye pesos MTP adicionales (19,846B) que deben gestionarse correctamente en el runtime; un mal uso puede degradar la calidad o el rendimiento.
- No se han publicado benchmarks que permitan validar el impacto real de la cuantizacion en tareas concretas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/DeepSeek-V4-Flash-0731-oQ2.7e-mtp
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio oMLX: https://github.com/jundot/omlx
- Pull request oQe: https://github.com/jundot/omlx/pull/4930
- Pull request redondeo oQe: https://github.com/jundot/omlx/pull/5292
