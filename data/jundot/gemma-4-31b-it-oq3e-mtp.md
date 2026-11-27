# Jundot/gemma-4-31B-it-oQ3e-mtp

## Resumen

`Jundot/gemma-4-31B-it-oQ3e-mtp` es una cuantizacion mixta en formato MLX del modelo denso `google/gemma-4-31B-it` de Google DeepMind, un transformer multimodal de 30,7 mil millones de parametros logicos que acepta texto e imagen como entrada, con modos de razonamiento configurables y una ventana de contexto de 256K tokens. Esta version anade, ademas del backbone de lenguaje y el codificador visual, una cabeza de prediccion multi-token (MTP) fusionada desde `google/gemma-4-31B-it-assistant`, lo que permite decodificacion especulativa sobre el propio checkpoint.

La cuantizacion la ha realizado el autor independiente Jundot con su herramienta oQ (oMLX v0.8.0), aplicando precision mixta guiada por la sensibilidad medida de cada capa. El resultado es un checkpoint de 16,7 GB con un promedio efectivo de 4,200 bits por peso en el conjunto completo y 3,800 bits por peso en el backbone de lenguaje, lo que reduce aproximadamente a la mitad el espacio frente a los pesos originales en BF16.

Es relevante para desarrolladores que quieran ejecutar un modelo de 31B multimodal con contexto muy largo en hardware Apple Silicon mediante MLX, sin renunciar a la cabeza MTP que acelera la generacion. La licencia declarada es Apache-2.0, en linea con el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto e imagen) con cabeza MTP; pesos cuantizados en MLX |
| Parametros totales | 31.742.607.472 (31,743B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Precision mixta oQ3e: affine 3-bit grupo 64, 4-bit grupo 64, 5-bit grupo 64 y BF16; 4,200 bits/peso efectivos en el checkpoint completo, 3,800 en el backbone |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (sujeta a la licencia de Gemma 4) |
| Formato de pesos | safetensors (MLX) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 30,697B | 14,583 GB / 13,581 GiB |
| Codificador visual | 0,576B | 1,142 GB / 1,063 GiB |
| Cabeza MTP | 0,470B | 0,939 GB / 0,875 GiB |
| Total | 31,743B | 16,664 GB / 15,519 GiB |

Distribucion de precision:

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 3-bit, grupo 64 | 24,465B | 77,073% | 9,968 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 3,270B | 10,302% | 1,713 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 2,967B | 9,348% | 1,900 GiB | 5,50 |
| BF16 | 1,040B | 3,278% | 1,938 GiB | 16,00 |
| Total | 31,743B | 100% | 15,519 GiB | 4,200 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4 con 30,7B de parametros en el backbone de lenguaje, un codificador visual de 0,576B y capacidad de entrada image-text-to-text. Soporta modos de pensamiento (thinking) configurables y una ventana de contexto de 256K tokens, segun la model card del autor. Esta version cuantizada incorpora ademas una cabeza de prediccion multi-token (MTP) de 0,470B parametros, fusionada desde el modelo asistente `google/gemma-4-31B-it-assistant`, que habilita decodificacion especulativa para acelerar la inferencia.

El proceso de cuantizacion oQ3e asigna bits por sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y aplica un reajuste de escala y sesgo por minimos cuadrados ponderados. La revision del 19 de noviembre de 2026 re-cuantizo el modelo con el redondeo oQe refinado de oMLX 0.8.0, que reduce el error de cuantizacion manteniendo tamano y velocidad. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni las fases de RLHF o DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (thinking modes).
- Comprension de imagenes junto con texto (pipeline image-text-to-text).
- Conversacion multi-turno con contexto de hasta 256K tokens.
- Decodificacion especulativa mediante la cabeza MTP integrada, que acelera la generacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos con imagenes: el modelo puede procesar contratos, informes o papers de hasta 256K tokens junto con figuras y tablas escaneadas, combinando el codificador visual con el contexto largo para extraer conclusiones sin trocear el documento.
- Asistentes conversacionales locales en Apple Silicon: al estar en formato MLX y ocupar 16,7 GB, puede desplegarse en un Mac con memoria unificada suficiente para mantener conversaciones multi-turno con contexto extenso sin conexion a la nube.
- Descripcion y extraccion de informacion de imagenes: catalogacion automatica de capturas de pantalla, diagramas o fotografias con texto generado en castellano u otros idiomas, integrado en flujos de gestion documental.
- Prototipado de agentes con razonamiento visible: los modos thinking permiten inspeccionar el razonamiento intermedio antes de la respuesta final, util para depurar pipelines de agentes en fase de desarrollo.
- Generacion asistida de codigo y explicaciones tecnicas: el contexto de 256K permite pasar repositorios o fragmentos grandes de codigo junto con su documentacion para tareas de revision y refactorizacion.
- Aceleracion de inferencia en produccion local: la cabeza MTP fusionada permite aplicar decodificacion especulativa en MLX, reduciendo la latencia por token en comparacion con decodificacion autoregresiva estandar.
- Investigacion sobre cuantizacion: el checkpoint sirve como referencia reproducible del esquema oQ3e para estudiar el impacto de la precision mixta en un modelo multimodal de 31B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: al menos 16,7 GB solo para los pesos; con overhead de contexto y cache KV conviene reservar 20-24 GB o mas para contextos largos.
- Hardware objetivo: Apple Silicon con memoria unificada (MLX), tipicamente Mac con 32 GB o mas; un Mac de 24 GB puede quedar justo con contexto reducido.
- GPU NVIDIA: no es el objetivo principal de este checkpoint (formato MLX); para CUDA seria necesario reconvertir o usar otra cuantizacion.
- Despliegue: libreria MLX (oMLX); no esta pensado para vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles en la informacion proporcionada; la cabeza MTP esta disenada para reducir latencia mediante decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/gemma-4-31B-it-oQ3e-mtp | 31,743B | 256K | MLX safetensors, 4,200 bits/peso | Apache-2.0 | Incluye vision y cabeza MTP; 16,7 GB |
| google/gemma-4-31B-it | 30,7B (backbone) | 256K | safetensors (BF16) | Apache-2.0 | Modelo base sin cuantizar ni MTP fusionada |
| google/gemma-4-31B-it-assistant | 0,470B (cabeza MTP) | No disponible | safetensors | No disponible | Modelo asistente para decodificacion especulativa |

No se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion: como todo modelo generativo, puede producir afirmaciones incorrectas con apariencia de veracidad; no se han publicado evaluaciones especificas de este checkpoint cuantizado.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada; hereda los del modelo base de Google.
- Perdida por cuantizacion: el esquema de 3-5 bits introduce error respecto a BF16; la model card indica que la revision de noviembre reduce ese error, pero no cuantifica la degradacion.
- Idiomas: no se especifica la lista de idiomas soportados; conviene validar el rendimiento en castellano antes de usarlo en produccion.
- Licencia: Apache-2.0 segun el autor, pero remite a la licencia de Gemma 4 de Google; revisar los terminos de uso comercial de dicha licencia antes de desplegar.
- Compatibilidad: formato MLX exclusivo; no es directamente utilizable en stacks CUDA sin conversion.
- Contexto largo: 256K tokens exige memoria adicional considerable para la cache KV, no incluida en los 16,7 GB de pesos.
- Madurez: 195 descargas y 0 likes en el momento de la consulta; es un checkpoint de terceros, no oficial de Google.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/gemma-4-31B-it-oQ3e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo asistente (MTP): https://huggingface.co/google/gemma-4-31B-it-assistant
- Repositorio oMLX: https://github.com/jundot/omlx
- PR de mejora oQe: https://github.com/jundot/omlx/pull/4930
- PR de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
