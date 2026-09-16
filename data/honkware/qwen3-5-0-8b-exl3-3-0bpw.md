# Honkware/Qwen3.5-0.8B-exl3-3.0bpw

## Resumen

`Honkware/Qwen3.5-0.8B-exl3-3.0bpw` es una cuantización de 3,0 bits por peso (bpw) del modelo denso `Qwen/Qwen3.5-0.8B`, publicada por el usuario Honkware mediante su herramienta BlockQuant y empaquetada en el formato EXL3 de ExLlamaV3. No se trata de un modelo entrenado desde cero, sino de un artefacto de inferencia: los pesos originales se han recomprimido a 3 bits con un codebook `mul1`, 6 bits para las cabezas y escalas de salida activadas, lo que reduce el repositorio a 1,0 GB.

El modelo base pertenece a la familia Qwen3.5, etiquetada con la arquitectura `qwen3_5`, y es de tipo denso (no MoE). El recuento real de parámetros en los safetensors es de 511.030.848 (aproximadamente 0,51 mil millones), una cifra inferior al "0,8B" que sugiere el nombre del repositorio, por lo que conviene tenerlo en cuenta al dimensionar hardware y al comparar con alternativas. La licencia es Apache 2.0, heredada del modelo base, sin restricciones adicionales introducidas por la cuantización.

Su relevancia es práctica: permite ejecutar un modelo conversacional de generación de texto en hardware muy modesto (entorno a 1 GB de pesos), lo que habilita escenarios de inferencia local, en el borde o como modelo borrador dentro de pipelines de decodificación especulativa, donde el coste por token y la huella de memoria son el factor limitante. Ahora bien, el repositorio no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) ni ficha de idiomas o contexto, por lo que su evaluación debe apoyarse en la divergencia KL declarada y en pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta de arquitectura `qwen3_5`); no es MoE |
| Parametros totales | 511.030.848 (0,51 mil millones, segun safetensors del repositorio) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 3,0 bpw (este repositorio); el mismo autor publica variantes a 4,0 bpw y una variante 3,0 bpw con SC H6 V6 |
| Idiomas soportados | no disponible (la mezcla de calibracion incluye datos multilingues, pero no se declara soporte de idiomas) |
| Licencia | Apache 2.0 (heredada del modelo base, sin restricciones adicionales) |
| Formato de pesos | safetensors en formato EXL3 (libreria `exllamav3`) |
| Tamano del repositorio | 1,0 GB |
| Bits por peso | 3,0 |
| Codebook / cabezas | `mul1` / 6 bits |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El artefacto no incluye informacion sobre el entrenamiento del modelo base: no se declaran el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Lo unico documentado es la arquitectura del modelo subyacente, un transformer denso de la familia Qwen3.5 de aproximadamente 0,51 mil millones de parametros efectivos. Al ser denso, todos los parametros se activan en cada token, a diferencia de un esquema MoE.

La parte tecnica documentada corresponde al proceso de cuantizacion. Se uso el formato EXL3 de ExLlamaV3 con los siguientes ajustes: 3,0 bits por peso, 6 bits para las cabezas, codebook `mul1`, escalas de salida activadas siempre, modo paralelo habilitado y 250 filas de calibracion extraidas de la mezcla incluida en exllamav3 (`c4`, `code`, `multilingual`, `technical`, `tiny`, `wiki`). El autor declara una divergencia KL mediana (autosampleada) de 1,64e-04 para esta variante, frente a 4,35e-05 en la variante SC H6 V6 del mismo bit-width, que aplica una configuracion mas agresiva a costa del mismo tamano de 1,0 GB. Esta metrica es la unica referencia cuantitativa de fidelidad disponible y no equivale a una evaluacion de calidad en tareas.

## Capacidades

- Generacion de texto y conversacion multi-turno: la etiqueta `conversational` del repositorio indica uso orientado a dialogo, con plantilla de chat heredada del modelo base.
- Razonamiento basico y respuesta a instrucciones: limitado por el tamano del modelo (0,51 mil millones de parametros), adecuado para tareas simples y no para razonamiento encadenado complejo.
- Generacion de codigo y matematicas: no confirmado por benchmarks; la mezcla de calibracion incluye datos de codigo, pero esto afecta a la fidelidad de la cuantizacion, no a las capacidades del modelo.
- Capacidades multilingues: no disponible. No se declaran idiomas soportados.
- Tool calling / function calling: no disponible; no se documenta soporte explicito en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision o audio: no disponible; el pipeline declarado es unicamente `text-generation`.
- Uso como modelo borrador: por su tamano reducido es un candidato natural para decodificacion especulativa, siempre que el runtime de destino lo soporte.

## Casos de uso

- Modelo borrador para decodificacion especulativa: con 0,51 mil millones de parametros y 1,0 GB de pesos, puede actuar como draft model que propone tokens verificados por un modelo mayor, reduciendo la latencia efectiva del modelo grande si el runtime lo soporta.
- Clasificacion y enrutado de intenciones: etiquetar consultas entrantes (soporte, ventas, incidencias) con latencia muy baja y coste marginal, antes de derivar al modelo o al sistema adecuado.
- Autocompletado y asistencia de escritura en editores: generacion de continuaciones cortas en local, sin enviar el texto del usuario a servicios externos.
- Procesamiento por lotes de datos a gran escala: extraccion de campos, etiquetado, normalizacion o resumen de miles o millones de registros en una sola GPU, donde el coste por documento es el criterio dominante.
- Asistentes de FAQ y atencion al cliente de alcance limitado: respuestas sobre un conjunto cerrado de preguntas frecuentes, con la ventaja de ejecutarse integramente en la infraestructura del cliente.
- Inferencia en el borde o en equipos sin GPU dedicada: con 1,0 GB de pesos, el modelo puede desplegarse en portatiles, mini-PC o dispositivos con GPU integrada compatible con ExLlamaV3.
- Entornos con requisitos estrictos de privacidad: sectores como sanidad, legal o administracion publica donde los datos no pueden salir de la maquina; el modelo se ejecuta de forma totalmente local.
- Prototipado y validacion de pipelines: probar cadenas de generacion, plantillas de prompt y flujos de agentes con un coste de computo minimo antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. El unico dato cuantitativo declarado por el autor es la divergencia KL mediana autosampleada, que mide la fidelidad de la cuantizacion respecto al modelo original, no la calidad en tareas:

| Variante | BPW | Tamano | KL mediana (self-sampled) |
|---|---|---|---|
| Este repositorio (plain) | 3,0 | 1,0 GB | 1,64e-04 |
| SC H6 V6 | 3,0 | 1,0 GB | 4,35e-05 |
| Plain | 4,0 | 1,1 GB | no disponible |

Valores de KL mas bajos indican mayor cercania a la distribucion del modelo original. La variante SC H6 V6 logra una fidelidad aproximadamente 3,8 veces mejor al mismo tamano, a costa de un proceso de cuantizacion mas costoso.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,0-1,5 GB para los pesos y la cache KV, dependiendo de la longitud de contexto efectiva. Las cifras concretas de VRAM con contexto largo no estan publicadas.
- GPU recomendadas: cualquier GPU compatible con ExLlamaV3, incluidas generaciones recientes de NVIDIA (RTX 30/40, A100, H100) y anteriores con soporte CUDA. Para este tamano de modelo no se necesita VRAM de gama alta.
- GPU de consumo: si, cabe con holgura en practicamente cualquier GPU de consumo con 4 GB o mas de VRAM (por ejemplo, GTX 1650 4 GB, RTX 3050, RTX 3060, RTX 4060, RTX 4090). El cuello de botella no sera la memoria sino el runtime.
- Opciones de despliegue: TabbyAPI (servidor HTTP compatible con la API de OpenAI), text-generation-webui (seleccionando el loader ExLlamaV3) y la API Python directa de ExLlamaV3. El formato EXL3 no es compatible con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

La comparacion se limita a las variantes del mismo autor y al modelo base, ya que no se dispone de datos de otros modelos comparables en la informacion proporcionada.

| Modelo | Parametros | Formato / BPW | Tamano | KL mediana | Licencia |
|---|---|---|---|---|---|
| Honkware/Qwen3.5-0.8B-exl3-3.0bpw | 511.030.848 | EXL3, 3,0 bpw | 1,0 GB | 1,64e-04 | Apache 2.0 |
| Honkware/Qwen3.5-0.8B-exl3-SC-3.0bpw-H6-V6 | 511.030.848 | EXL3, 3,0 bpw | 1,0 GB | 4,35e-05 | Apache 2.0 |
| Honkware/Qwen3.5-0.8B-exl3-4.0bpw | 511.030.848 | EXL3, 4,0 bpw | 1,1 GB | no disponible | Apache 2.0 |
| Qwen/Qwen3.5-0.8B (base) | 511.030.848 | safetensors, sin cuantizar | aproximadamente 1,0 GB en FP16 (estimado) | referencia | Apache 2.0 |

No se dispone de datos de rendimiento en tareas para ninguno de ellos, por lo que la eleccion entre variantes debe basarse en la fidelidad de cuantizacion declarada y en el coste de generacion de cada formato.

## Limitaciones y advertencias

- Modelo muy pequeno: con 0,51 mil millones de parametros efectivos, la capacidad de razonamiento, la coherencia en cadenas largas y la fiabilidad factual son limitadas. El riesgo de alucinacion es alto, especialmente en preguntas abiertas o de dominio especializado.
- Perdida por cuantizacion: la variante de este repositorio presenta una KL mediana de 1,64e-04, peor que la variante SC H6 V6 (4,35e-05) al mismo tamano. Si la fidelidad es critica, la variante SC es preferible.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en tareas (razonamiento, codigo, matematicas), lo que obliga a evaluar el modelo con casos propios antes de usarlo en produccion.
- Idiomas no declarados: no se especifica que idiomas soporta el modelo base. No se debe asumir un rendimiento correcto en castellano sin validacion previa.
- Contexto desconocido: no se publica la longitud de contexto del modelo base, dato esencial para dimensionar la cache KV y para aplicaciones de dialogo largo o analisis de documentos.
- Dependencia del runtime: el formato EXL3 solo se ejecuta con ExLlamaV3 (directo, via TabbyAPI o via text-generation-webui). No funciona con llama.cpp, Ollama, vLLM ni TGI, lo que limita las opciones de despliegue y de integracion.
- No apto para fine-tuning: al ser un artefacto cuantizado en EXL3, no se puede reentrenar ni aplicar LoRA sobre estos pesos. Cualquier ajuste debe hacerse sobre el modelo base y recuantizar despues.
- Sensibilidad a la calibracion: la cuantizacion se calibro con una mezcla generica (`c4`, `code`, `multilingual`, `technical`, `tiny`, `wiki`) de 250 filas; dominios muy alejados de esa mezcla pueden degradarse mas de lo que sugiere la KL media.
- Falta de validacion comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no hay retroalimentacion de terceros ni verificacion independiente de los pesos.
- Licencia: Apache 2.0 heredada del modelo base, sin restricciones adicionales segun el autor, pero conviene revisar los terminos y la documentacion de seguridad del repositorio de Qwen antes de un uso comercial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Honkware/Qwen3.5-0.8B-exl3-3.0bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Variante SC H6 V6 a 3,0 bpw: https://huggingface.co/Honkware/Qwen3.5-0.8B-exl3-SC-3.0bpw-H6-V6
- Variante a 4,0 bpw: https://huggingface.co/Honkware/Qwen3.5-0.8B-exl3-4.0bpw
- Coleccion completa de cuantizaciones: https://huggingface.co/collections/Honkware/qwen35-08b-exl3-6a89b7d33e550d4d70b8a181
- Perfil del autor de la cuantizacion: https://huggingface.co/Honkware
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- BlockQuant (herramienta de cuantizacion): https://github.com/Honkware/blockquant
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- text-generation-webui: https://github.com/oobabooga/text-generation-webui

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre su modelo base; los resultados obtenidos correspondian a terminos no relacionados y se han descartado.
