# experimentalmachines/Llama-3.2-3B-Instruct-ExecuTorch

## Resumen

Llama-3.2-3B-Instruct-ExecuTorch es una exportación del modelo meta-llama/Llama-3.2-3B-Instruct (revisión `0cb88a4f764b`) realizada por el usuario experimentalmachines y publicada en HuggingFace bajo la librería ExecuTorch. No se trata de un modelo entrenado desde cero, sino de una conversión cuantizada del modelo original de Meta, pensada para ejecutarse en dispositivos móviles Android (arm64) mediante el runtime ExecuTorch 1.4.0, sin necesidad de GPU ni de conexión a la nube.

El artefacto clave son los ficheros `.pte` con cuantización 8da4w (activaciones dinámicas de 8 bits y pesos de 4 bits en grupos de 32, con embeddings int8 por canal), que ocupan aproximadamente 2,21 GB por variante. El repositorio incluye varias ventanas de contexto fijas (2.048, 4.096, 8.192 y 16.384 tokens) para el backend XNNPACK sobre CPU, además del tokenizador y los informes de exportación. La ventana de contexto se fija dentro del propio fichero y el runtime reserva la caché KV completa en el momento de la carga, lo que condiciona directamente el presupuesto de memoria del dispositivo.

Su relevancia actual radica en que demuestra un flujo reproducible de exportación de un LLM de 3.000 millones de parámetros a un formato ejecutable en teléfonos, con inferencia íntegramente local. Esto habilita casos de uso con requisitos estrictos de privacidad, latencia o funcionamiento sin conectividad, y sirve como referencia técnica para desarrolladores que quieran replicar el pipeline con otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura del modelo base Llama 3.2 3B Instruct; detalles finos no disponibles en la model card) |
| Parametros totales | 3.000 millones (heredados del modelo base) |
| Longitud de contexto | Variantes exportadas de 2.048, 4.096, 8.192 y 16.384 tokens en XNNPACK; el runner podria construir hasta 32.000 tokens. El modelo base soporta ventanas mayores (no especificado en la model card) |
| Tipos de cuantizacion | 8da4w: activaciones dinamicas de 8 bits, pesos de 4 bits en grupos de 32, embeddings int8 por canal. Cache KV en fp32 |
| Idiomas soportados | No disponible en la model card; el modelo base declara soporte para 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.2 (derivado cuantizado del modelo de Meta, distribuido bajo los mismos terminos) |
| Formato de pesos | `.pte` (ExecuTorch) + `tokenizer.json`. No se distribuyen safetensors ni GGUF |
| Tamano del repositorio | 8,8 GB |
| Tamano por fichero `.pte` | 2,21 GB (2k, 4k y 8k), 2,22 GB (16k) |
| Backend de ejecucion | XNNPACK (CPU) sobre cualquier arm64, con operadores extendidos |
| Version de runtime | ExecuTorch 1.4.0 |
| Fecha de creacion | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento nuevo: es una exportación cuantizada del modelo meta-llama/Llama-3.2-3B-Instruct, un transformer decoder-only de 3.000 millones de parámetros desarrollado por Meta. La model card no detalla la composición del dataset original, el número de tokens de entrenamiento ni las etapas de alineación (RLHF/DPO) del modelo base; esos datos habría que consultarlos en la documentación de Meta, no en esta ficha.

La innovación técnica está en el pipeline de exportación, no en los pesos. Se ha utilizado la herramienta `export_llm` de ExecuTorch 1.4.0 con esquema 8da4w (activaciones de 8 bits dinámicas, pesos de 4 bits por grupos de 32, embeddings int8 por canal), prefill en bloques de 2.048 tokens y caché KV en fp32, sobre el backend XNNPACK con operadores extendidos. Cada ventana de contexto se fija en tiempo de exportación: el fichero `.pte` contiene una variante concreta y el runtime reserva la totalidad de la caché KV al cargar el modelo, de modo que no hay crecimiento dinámico de memoria durante la inferencia. El export se generó mediante una GitHub Action reproducible ([run 1](https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/34753847748)) y cada variante incluye un `export-report-<window>.json` con el registro completo del proceso.

## Capacidades

- Generación de texto conversacional: el modelo base es una variante *Instruct*, por lo que sigue instrucciones y mantiene diálogos multi-turno.
- Razonamiento básico y respuesta a preguntas, con el techo de calidad propio de un modelo de 3.000 millones de parámetros.
- Generación de código asistida en nivel básico (el modelo base de Llama 3.2 está orientado a texto general; no es un modelo especializado en código).
- Ejecución totalmente local y offline en dispositivos Android arm64: no requiere red ni servicios externos.
- Inferencia sobre CPU exclusivamente mediante XNNPACK; no se distribuyen variantes para GPU, NPU ni Vulkan.
- Tokenizador incluido sin modificar (`tokenizer.json`), copiado tal cual del repositorio de origen.
- Ventanas de contexto predefinidas de 2k, 4k, 8k y 16k tokens para ajustar el consumo de memoria al dispositivo.
- No disponible: soporte de *tool calling*, function calling, modo *thinking*, visión, audio, agentes multi-paso o cualquier capacidad multimodal. La model card no los menciona y el modelo base Llama 3.2 3B Instruct tampoco los incorpora.

## Casos de uso

- Asistente conversacional embebido en una aplicación Android: el modelo se carga con la variante de 4k tokens (3,15 GB de memoria aproximada entre pesos y caché KV) y ofrece chat sin conexión, sin enviar datos del usuario a servidores externos.
- Procesamiento de texto con requisitos de privacidad: resumen de notas, correos o documentos médicos y legales directamente en el dispositivo, evitando la exfiltración de datos confidenciales que implicaría una API en la nube.
- Corrección y reescritura de texto en editores móviles: la variante de 2k tokens (unos 2,7 GB en total) permite sugerencias de estilo y gramática con latencia local y sin coste por token.
- Traducción y localización ligera entre los idiomas que soporta el modelo base, útil en aplicaciones de viaje o atención al cliente multilingüe donde no hay conectividad fiable.
- Trabajo de campo sin cobertura: técnicos, sanitarios o personal de inspección pueden consultar y generar informes en zonas sin red usando la variante de 4k u 8k tokens.
- Interfaces de accesibilidad: dictado y reformulación de texto, o generación de descripciones a partir de entradas de voz transcritas previamente, ejecutadas en el propio terminal.
- Prototipado e investigación en *edge AI*: sirve como banco de pruebas para medir el impacto de la cuantización 8da4w y del tamaño de la caché KV en el rendimiento real de un LLM de 3B sobre CPU arm64.
- Aplicaciones educativas sin coste de inferencia: tutores o generadores de ejercicios que funcionan íntegramente en el dispositivo del alumno, con la variante de contexto que se ajuste a su hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta un *smoke test* cualitativo por variante, superado con la respuesta "Paris". No hay datos de MMLU, HumanEval, GSM8K, latencia ni throughput.

| Variante | Ventana | Tamano | Smoke test |
|---|---|---|---|
| XNNPACK (CPU) | 2.048 tokens | 2,21 GB | superado ("Paris") |
| XNNPACK (CPU) | 4.096 tokens | 2,21 GB | superado ("Paris") |
| XNNPACK (CPU) | 8.192 tokens | 2,21 GB | superado ("Paris") |
| XNNPACK (CPU) | 16.384 tokens | 2,22 GB | superado ("Paris") |

## Requisitos de hardware

- Plataforma objetivo: cualquier dispositivo Android arm64 con backend XNNPACK (CPU). No se requiere GPU.
- Consumo de pesos: 2,21–2,22 GB por fichero `.pte`, independientemente del tamaño de la ventana.
- Caché KV en fp32: 229.376 bytes por token, reservados en su totalidad al cargar el modelo.
- Presupuesto de memoria total estimado (pesos + caché KV):
  - Ventana de 2.048 tokens: 2,21 GB + 469,76 MB ≈ 2,68 GB.
  - Ventana de 4.096 tokens: 2,21 GB + 939,52 MB ≈ 3,15 GB.
  - Ventana de 8.192 tokens: 2,21 GB + 1,88 GB ≈ 4,09 GB.
  - Ventana de 16.384 tokens: 2,22 GB + 3,76 GB ≈ 5,98 GB.
- El campo `fits_phone_budget` de cada `config.json` estima la viabilidad frente a un presupuesto de 5 GB. Con ese criterio, las variantes de 2k, 4k y 8k encajarían, mientras que la de 16k quedaría por encima.
- GPU: no aplica. No hay ficheros para CUDA, ROCm, Metal ni Vulkan. El despliegue en A100, H100 o RTX 4090 no es el escenario previsto por este repositorio.
- Opciones de despliegue: runtime ExecuTorch 1.4.0 o la aplicación Android [openweights](https://github.com/alpharomercoma/openweights). No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers en su formato nativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| experimentalmachines/Llama-3.2-3B-Instruct-ExecuTorch | 3B | 2k–16k (fijado por fichero) | `.pte` (ExecuTorch, 8da4w) | llama3.2 | 2,21 GB por variante; pensado para CPU arm64 en Android |
| meta-llama/Llama-3.2-3B-Instruct (original) | 3B | No disponible en esta ficha | safetensors (precisión completa) | llama3.2 | Modelo de referencia del que deriva esta exportación; requiere hardware de servidor o GPU |
| Exportaciones GGUF para llama.cpp | 3B | Configurable en tiempo de ejecución | GGUF | llama3.2 (heredada) | Alternativa habitual para inferencia local en CPU y en escritorio; no compatible con el runtime ExecuTorch |

No se dispone de datos de rendimiento comparativos entre estas opciones dentro de la información proporcionada, por lo que la comparación se limita a formato, licencia y escenario de despliegue.

## Limitaciones y advertencias

- Alucinación: al ser un modelo de 3.000 millones de parámetros, su tasa de errores factuales es inherentemente superior a la de modelos de mayor tamaño. Requiere verificación en aplicaciones sensibles.
- Idiomas: la model card no declara idiomas soportados. El rendimiento fuera del inglés puede degradarse notablemente, especialmente en la variante cuantizada a 4 bits.
- Cuantización agresiva: los pesos de 4 bits en grupos de 32 y las activaciones de 8 bits introducen pérdida de precisión respecto al modelo original. No hay evaluación publicada del impacto real en calidad.
- Memoria fija: la caché KV se reserva completa al cargar, de modo que elegir una ventana grande penaliza incluso en conversaciones cortas. No hay gestión dinámica del contexto.
- Contexto limitado por fichero: no se puede ampliar la ventana en tiempo de ejecución; hay que cargar otra variante `.pte`, y las variantes publicadas llegan hasta 16.384 tokens.
- Compatibilidad restringida: solo funciona con ExecuTorch 1.4.0 (o superior compatible) sobre arm64. No hay soporte para GPU, aceleradores dedicados ni sistemas de escritorio estándar.
- Sin soporte documentado de *tool calling*, agentes, visión o audio.
- Licencia: se hereda la licencia llama3.2 de Meta, que incluye condiciones de uso aceptable y obligaciones de atribución (los ficheros `LICENSE.txt`, `USE_POLICY.md` y `NOTICE` se distribuyen sin modificar). Es imprescindible revisarla antes de un uso comercial.
- Adopción nula: cero descargas y cero *likes* en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Repositorio de 8,8 GB: la descarga completa incluye todas las variantes de ventana, algo a tener en cuenta en entornos con ancho de banda limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/experimentalmachines/Llama-3.2-3B-Instruct-ExecuTorch
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Aplicación Android openweights: https://github.com/alpharomercoma/openweights
- Exportación original (GitHub Actions, run 1): https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/34753847748
- Variante XNNPACK 2k: https://huggingface.co/experimentalmachines/Llama-3.2-3B-Instruct-ExecuTorch/blob/main/xnnpack/Llama-3.2-3B-Instruct-8da4w-2k.pte
- Variante XNNPACK 4k: https://huggingface.co/experimentalmachines/Llama-3.2-3B-Instruct-ExecuTorch/blob/main/xnnpack/Llama-3.2-3B-Instruct-8da4w-4k.pte
- Variante XNNPACK 8k: https://huggingface.co/experimentalmachines/Llama-3.2-3B-Instruct-ExecuTorch/blob/main/xnnpack/Llama-3.2-3B-Instruct-8da4w-8k.pte
- Variante XNNPACK 16k: https://huggingface.co/experimentalmachines/Llama-3.2-3B-Instruct-ExecuTorch/blob/main/xnnpack/Llama-3.2-3B-Instruct-8da4w-16k.pte
- Tokenizador: https://huggingface.co/experimentalmachines/Llama-3.2-3B-Instruct-ExecuTorch/blob/main/tokenizer.json
- Licencia: https://huggingface.co/experimentalmachines/Llama-3.2-3B-Instruct-ExecuTorch/blob/main/LICENSE.txt
- Política de uso: https://huggingface.co/experimentalmachines/Llama-3.2-3B-Instruct-ExecuTorch/blob/main/USE_POLICY.md
- Aviso de atribución: https://huggingface.co/experimentalmachines/Llama-3.2-3B-Instruct-ExecuTorch/blob/main/NOTICE
