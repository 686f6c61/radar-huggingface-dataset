# askdkc/DS-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Metal

## Resumen

DS-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Metal es una variante de pesos del modelo DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, publicada por el usuario askdkc en Hugging Face. Segun la informacion disponible, el modelo base es un ajuste fino (fine-tune) orientado a razonamiento de Qwen3.5-9B, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El release concentra la senal de supervision en matematicas y resolucion de problemas STEM, manteniendo la eficiencia y la facilidad de despliegue propias de la clase de 9.000 millones de parametros.

La ficha disponible es extremadamente escasa: la model card del repositorio no contiene mas que la declaracion de licencia (cc-by-4.0), sin descripcion tecnica, sin datos de entrenamiento, sin benchmarks y sin indicaciones de uso. El repositorio registra cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el 7 de noviembre de 2026. El sufijo "Metal" del identificador sugiere una variante orientada a ejecucion en hardware Apple (Metal), aunque esta circunstancia no esta confirmada en la informacion proporcionada.

Por tanto, esta ficha debe leerse como una evaluacion preliminar basada en el nombre del modelo, la informacion del ecosistema de repositorios derivados y las convenciones habituales de la familia Qwen. Cualquier dato no confirmado se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre indica derivacion de Qwen3.5-9B; arquitectura concreta no confirmada) |
| Parametros totales | 9B (segun el identificador y repositorios derivados) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repositorio; existe una variante GGUF publicada por terceros (mradermacher) |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (el sufijo "Metal" sugiere formato especifico para Apple Metal, sin confirmar; existe variante GGUF de terceros) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura en la model card del repositorio, que unicamente declara la licencia cc-by-4.0. Por el identificador y por la descripcion del repositorio derivado xtools-at, se trata de un fine-tune de Qwen3.5-9B, es decir, un transformer decoder-only de aproximadamente 9.000 millones de parametros, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El entrenamiento se habria concentrado en matematicas y resolucion de problemas STEM mediante supervision (SFT), sin que se detallen el volumen de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El calificativo "UNCENSORED-heretic" indica que el ajuste incluye una eliminacion o atenuacion deliberada de los mecanismos de rechazo y alineacion de seguridad del modelo original, siguiendo la practica habitual de los fine-tunes "abliterated" o "heretic". No se especifican los metodos concretos empleados (ablacion de direcciones de rechazo, DPO con pares de rechazo, etc.). El sufijo "Metal" no viene acompanado de explicacion tecnica, por lo que no es posible confirmar si se refiere a pesos optimizados para Apple Silicon, a un formato de empaquetado especifico o a otra circunstancia.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredadas del modelo base Qwen3.5-9B.
- Razonamiento matematico y resolucion de problemas STEM, area en la que el autor declara concentrar la senal de entrenamiento.
- Generacion de codigo: presumiblemente soportada por el modelo base, aunque no se documenta de forma explicita.
- Respuestas sin rechazo ante peticiones que el modelo original rechazaria, segun indica el calificativo "UNCENSORED-heretic".
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Experimentacion en investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un fine-tune sin mecanismos de rechazo frente a su base alineada, en entornos controlados y con supervision humana.
- Resolucion de problemas matematicos y STEM en entornos de prototipado: el autor declara que el entrenamiento se concentra en esta area, por lo que resulta adecuado para probar pipelines de razonamiento paso a paso en cuadernos y herramientas internas.
- Evaluacion comparativa de tecnicas de destilacion: al ser un destilado de DeepSeek-V4-Pro sobre Qwen3.5-9B, sirve para medir la transferencia de capacidades de razonamiento de un modelo mayor a uno de 9B.
- Despliegue local en hardware Apple: el sufijo "Metal" y la existencia de una variante GGUF de terceros apuntan a escenarios de inferencia en equipos de sobremesa y portatiles, aunque el rendimiento real no esta documentado.
- Generacion de datos sinteticos para fine-tuning: un modelo de 9B sin restricciones de rechazo puede emplearse para producir corpus de entrenamiento en dominios donde el modelo base se niega a responder, con revision posterior.
- Pruebas de robustez y red teaming: util para evaluar la eficacia de filtros y clasificadores de seguridad en pipelines de produccion, al disponer de un modelo deliberadamente no alineado como generador de casos adversos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 9B, en FP16 se requieren aproximadamente 18 GB de VRAM; en cuantizacion de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB. Estas cifras son estimaciones genericas para la clase de 9B y no estan confirmadas para este modelo concreto.
- GPU recomendadas: no disponibles. Por tamano, un modelo de 9B en FP16 cabe en A100 40 GB, H100 y RTX 4090 (24 GB); en cuantizacion 4 bits cabria en GPUs consumer de 8 GB o mas.
- Compatibilidad con GPU consumer: probable en cuantizaciones bajas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090), aunque no confirmada.
- Opciones de despliegue: no documentadas en el repositorio. La existencia de una variante GGUF de terceros (mradermacher) sugiere compatibilidad con llama.cpp y derivados como Ollama; el sufijo "Metal" apunta a ejecucion en Apple Silicon. No hay informacion sobre vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DS-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Metal (este) | 9B | no disponible | cc-by-4.0 | Hugging Face, 0 descargas | Fine-tune sin rechazo, orientado a STEM |
| Qwen3.5-9B (base) | 9B | no disponible | no disponible en esta busqueda | Amplia | Modelo original alineado del que deriva |
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (xtools-at) | 9B | no disponible | no disponible en esta busqueda | Hugging Face | Variante de pesos del mismo fine-tune |
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF (mradermacher) | 9B | no disponible | no disponible en esta busqueda | Hugging Face | Conversion GGUF para llama.cpp |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no contiene documentacion tecnica: no hay datos de entrenamiento, evaluacion, contexto ni idiomas, lo que impide validar las capacidades declaradas.
- El modelo esta explicitamente desalineado ("UNCENSORED-heretic"): eliminara o atenuara los rechazos de seguridad, con riesgo de generar contenido danino, ilegal o inexacto. No es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fidelidad ni de calibracion.
- Cero descargas y cero likes en el momento de la consulta: no existe evidencia de uso comunitario ni de validacion independiente.
- La licencia cc-by-4.0 permite uso comercial con atribucion, pero el modelo base Qwen3.5-9B puede tener condiciones adicionales que no se detallan en este repositorio; conviene verificar la licencia del modelo original antes de un uso en produccion.
- El sufijo "Metal" no esta explicado: no se confirma el formato de pesos ni la compatibilidad con herramientas estandar.
- No se dispone de informacion sobre sesgos, limitaciones de contexto o comportamiento multilingue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/askdkc/DS-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Metal
- Variante GGUF de terceros (mradermacher): https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Variante de pesos de terceros (xtools-at): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
