# Jundot/gemma-4-31B-it-oQ3.5e-mtp

## Resumen

`gemma-4-31B-it-oQ3.5e-mtp` es una cuantizacion mixta del modelo denso `google/gemma-4-31B-it` de Google DeepMind, publicada por el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0). El modelo original pertenece a la familia Gemma 4, con 30,7B parametros en el backbone de lenguaje, entrada multimodal de texto e imagen, modos de pensamiento configurables y una ventana de contexto de 256K tokens. Esta version anade una cabeza de prediccion multi-token (MTP) fusionada desde `google/gemma-4-31B-it-assistant`, lo que permite decodificacion especulativa integrada.

El checkpoint esta disenado para ejecutarse en Apple Silicon mediante MLX, con un peso efectivo medio de 4,001 bits por parametro en el backbone y 4,393 bits por parametro en el conjunto completo. El repositorio ocupa 17,5 GB, lo que lo hace viable en equipos con memoria unificada de gama alta (64 GB o superior) alli donde el modelo BF16 original no cabria con holgura.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en un mismo artefacto: cuantizacion mixta guiada por sensibilidad de capa, soporte multimodal (texto e imagen) y decodificacion especulativa con MTP. La licencia Apache-2.0 heredada del modelo base facilita su uso comercial, aunque conviene revisar los terminos especificos de la licencia Gemma 4 enlazada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (backbone de lenguaje + encoder de vision + cabeza MTP) |
| Parametros totales | 31.742.607.472 (31,743B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256K tokens (segun model card) |
| Tipos de cuantizacion | Mixta: affine 3-bit (grupo 64), 4-bit, 5-bit, 6-bit y BF16 en distintas capas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4) |
| Formato de pesos | safetensors (MLX) |

Desglose de almacenamiento por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 30,697B | 15,351 GB / 14,296 GiB |
| Encoder de vision | 0,576B | 1,142 GB / 1,063 GiB |
| Cabeza MTP | 0,470B | 0,939 GB / 0,875 GiB |
| Total | 31,743B | 17,432 GB / 16,234 GiB |

Distribucion de bits por peso:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 3-bit, grupo 64 | 21,536B | 67,847% | 8,775 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 3,281B | 10,336% | 1,719 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 5,588B | 17,603% | 3,578 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 0,297B | 0,937% | 0,225 GiB | 6,50 |
| BF16 | 1,040B | 3,278% | 1,938 GiB | 16,00 |
| Total | 31,743B | 100% | 16,234 GiB | 4,393 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso multimodal de la familia Gemma 4, con 30,7B parametros en el backbone de lenguaje, un encoder de vision de 0,576B parametros y una ventana de contexto de 256K tokens. El checkpoint aqui descrito anade una cabeza de prediccion multi-token (MTP) de 0,470B parametros, fusionada desde `google/gemma-4-31B-it-assistant`, que permite decodificacion especulativa: la cabeza propone varios tokens futuros que el backbone verifica, acelerando la generacion sin alterar la distribucion de salida.

La cuantizacion oQ3.5e asigna bits por capa segun la sensibilidad medida, y redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y un reajuste de minimos cuadrados ponderado de escala y sesgo. El resultado es una distribucion heterogenea: el 67,8% de los pesos queda en 3 bits, el 17,6% en 5 bits y solo un 3,3% se mantiene en BF16. La version actual del repositorio (actualizada el 2026-11-19) re-cuantiza con el redondeo oQe refinado de oMLX 0.8.0, que reduce el error de cuantizacion al mismo tamano y velocidad. No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento en conversaciones multi-turno.
- Entrada de imagen (pipeline `image-text-to-text`): el encoder de vision permite procesar imagenes junto a texto.
- Modos de pensamiento configurables (thinking modes) heredados del modelo base.
- Decodificacion especulativa mediante la cabeza MTP integrada, que acelera la inferencia en MLX.
- Capacidades multilingues: no se detallan idiomas concretos en la informacion disponible.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque los modos de pensamiento del modelo base apuntan a esa direccion.
- Contexto largo de hasta 256K tokens para documentos extensos o conversaciones prolongadas.

## Casos de uso

- Analisis de documentos extensos en local: con 256K tokens de contexto, el modelo puede ingerir informes, contratos o bases de codigo completas en una sola pasada, sin necesidad de troceado, en un Mac con memoria unificada suficiente.
- Asistente multimodal de escritorio: al aceptar entrada de imagen y texto, sirve para tareas como descripcion de capturas, extraccion de datos de graficos o respuesta a preguntas sobre imagenes dentro de una aplicacion nativa MLX.
- Prototipado rapido en Apple Silicon: el formato MLX y el peso de 17,5 GB permiten iterar en un MacBook Pro o Mac Studio sin depender de GPU dedicadas ni de servicios en la nube.
- Generacion asistida con decodificacion especulativa: la cabeza MTP integrada reduce la latencia en tareas de generacion larga, lo que resulta util en entornos interactivos donde la velocidad de tokens por segundo es critica.
- Investigacion sobre cuantizacion: el checkpoint sirve como referencia reproducible para estudiar el impacto de la cuantizacion mixta guiada por sensibilidad frente a cuantizaciones uniformes de 4 bits.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente, evita enviar datos sensibles a APIs externas, lo que encaja en flujos de trabajo con datos personales o propiedad intelectual.
- Evaluacion comparativa de modos de pensamiento: util para medir como afectan los thinking modes configurables a la calidad de respuesta en tareas de razonamiento, manteniendo el resto de variables constante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 16,234 GiB en disco; en inferencia se necesita al menos esa cantidad de memoria unificada mas el overhead de activaciones y cache KV, por lo que se recomienda un minimo de 24-32 GB y, para contexto largo, 64 GB o mas.
- GPU recomendadas: Apple Silicon con MLX (M-series Pro, Max y Ultra). No se menciona soporte para CUDA en la informacion proporcionada.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada de 32 GB o superior para contexto corto; para 256K tokens se requiere bastante mas memoria.
- Opciones de despliegue: MLX y oMLX (herramienta de cuantizacion y runtime del autor). No se confirma soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Jundot/gemma-4-31B-it-oQ3.5e-mtp | 31,743B | 256K | Texto + imagen | Apache-2.0 | safetensors MLX |
| google/gemma-4-31B-it (base) | ~30,7B backbone | 256K | Texto + imagen | Gemma 4 license | safetensors |
| google/gemma-4-31B-it-assistant | 0,470B (cabeza MTP) | no disponible | Texto | no disponible | safetensors |

La comparativa con alternativas de otros fabricantes (Llama, Qwen, Mistral) no esta disponible en la informacion proporcionada, ya que no se aportan datos de rendimiento ni especificaciones de esos modelos.

## Limitaciones y advertencias

- La cuantizacion a 3-5 bits introduce perdida de precision respecto al modelo BF16 original; el autor indica que la version actual reduce el error, pero no publica metricas de degradacion.
- El modelo esta empaquetado para MLX: no es directamente utilizable en CUDA, ROCm ni en runtimes de GPU dedicadas sin conversion adicional.
- La cabeza MTP anade 0,470B parametros y 0,939 GB de almacenamiento; su utilidad depende de que el runtime MLX la aproveche para decodificacion especulativa.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se aportan evaluaciones de factualidad en la informacion disponible.
- No se detallan sesgos conocidos ni limitaciones por idioma; la lista de idiomas soportados figura como no disponible.
- La licencia se declara Apache-2.0, pero el autor enlaza la licencia Gemma 4; conviene verificar los terminos exactos antes de un uso comercial, ya que pueden imponer restricciones adicionales.
- El modelo es una cuantizacion de terceros, no una publicacion oficial de Google DeepMind; la responsabilidad sobre la calidad del checkpoint recae en el autor de la conversion.
- No se han publicado benchmarks que permitan cuantificar la perdida de rendimiento frente al modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jundot/gemma-4-31B-it-oQ3.5e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo asistente (cabeza MTP): https://huggingface.co/google/gemma-4-31B-it-assistant
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Pull request de redondeo oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento de redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
