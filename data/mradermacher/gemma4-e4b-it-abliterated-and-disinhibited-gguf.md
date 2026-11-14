# mradermacher/gemma4-E4B-it-Abliterated-AND-Disinhibited-GGUF

## Resumen

`gemma4-E4B-it-Abliterated-AND-Disinhibited-GGUF` es una cuantizacion estatica en formato GGUF publicada por el usuario mradermacher sobre el modelo base `stevenh512/gemma4-E4B-it-Abliterated-AND-Disinhibited`. Se trata, por tanto, de una redistribucion de pesos derivados de un modelo de la familia Gemma 4 en su variante instruct (sufijo `-it`), con modificaciones de comportamiento indicadas en el nombre (`Abliterated` y `Disinhibited`), que en la practica suelen implicar la eliminacion o relajacion de los mecanismos de rechazo y alineacion de seguridad del modelo original.

El recuento real de parametros en safetensors es de 7.463.013.674, es decir, aproximadamente 7,46 mil millones de parametros. El identificador `E4B` sugiere una variante de eficiencia de la familia Gemma 4, pero no se dispone de documentacion tecnica oficial en la informacion proporcionada que confirme la arquitectura exacta, la longitud de contexto nativa ni el esquema de entrenamiento.

La relevancia de esta publicacion es limitada y muy especifica: ofrece pesos ya cuantizados en multiples variantes (desde Q2_K hasta Q8_0, ademas de F16) para facilitar la inferencia en local con llama.cpp u otros runners compatibles con GGUF. No obstante, la ausencia de model card tecnica detallada, de licencia declarada y de resultados de evaluacion hace que deba tratarse con cautela en cualquier entorno de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, variante E4B; detalles no publicados en la informacion disponible) |
| Parametros totales | 7.463.013.674 (~7,46 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna del modelo base en la documentacion proporcionada. El nombre sugiere que deriva de la familia Gemma 4 (modelos transformer decoder-only de Google, segun la nomenclatura publica de la familia Gemma), en su variante `E4B`, pero no se confirma en la model card si se trata de un transformer denso, un modelo con mezcla de expertos o una arquitectura hibrida. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Respecto a las modificaciones indicadas en el nombre (`Abliterated` y `Disinhibited`), se trata de tecnicas de fine-tuning orientadas a reducir o eliminar los comportamientos de rechazo aprendidos durante el alineamiento. No se especifica en la informacion disponible que metodologia concreta se aplico (abliteration por proyeccion de direcciones de rechazo, fine-tuning con datasets especificos, etc.), ni cuantos pasos de entrenamiento se realizaron, ni que impacto tuvo sobre las capacidades generales del modelo.

La publicacion de mradermacher es unicamente un proceso de cuantizacion estatica: genera variantes GGUF del modelo base sin modificar los pesos mas alla de la reduccion de precision. Los metadatos del README (`quantize_version: 2`, `convert_type: hf`) confirman que se partio de pesos en formato Hugging Face y se convirtieron a GGUF.

## Capacidades

- Generacion de texto conversacional: el sufijo `-it` indica que el modelo base esta ajustado para instrucciones y dialogos multi-turno.
- Razonamiento y respuesta a instrucciones: capacidades heredadas del modelo Gemma 4 original, aunque no se documentan evaluaciones especificas.
- Comportamiento sin rechazo: por las modificaciones `Abliterated` y `Disinhibited`, el modelo probablemente responde a peticiones que el modelo original rechazaria, lo que constituye una capacidad pero tambien un riesgo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Experimentacion en investigacion sobre alineamiento y seguridad: el modelo permite estudiar como cambia el comportamiento de un LLM cuando se eliminan los mecanismos de rechazo, comparandolo con el modelo Gemma 4 original en tareas controladas.
- Pruebas de robustez y red teaming: util para evaluar la eficacia de filtros de seguridad externos o clasificadores de contenido, ya que el modelo base no incorpora rechazos propios.
- Inferencia local en hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de ~7,5 B en GPU consumer con VRAM limitada mediante llama.cpp u Ollama.
- Generacion creativa sin restricciones editoriales: escritura de ficcion, guiones o narrativa donde el modelo original podria negarse a tratar ciertos temas.
- Prototipado rapido de chatbots conversacionales: el formato GGUF y la naturaleza instruct permiten desplegar un asistente basico en local para pruebas de concepto.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 12 variantes de cuantizacion, lo que facilita medir el impacto de la precision en calidad y velocidad sobre el mismo modelo base.
- Desarrollo de herramientas educativas sobre seguridad en IA: analisis de como se comporta un modelo desalineado frente a uno alineado en el aula o en talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~7,5 B parametros):
  - F16: ~15 GB.
  - Q8_0: ~8 GB.
  - Q6_K: ~6,5 GB.
  - Q5_K_M: ~5,5 GB.
  - Q4_K_M: ~4,7 GB.
  - Q3_K_M: ~3,8 GB.
  - Q2_K: ~3 GB.
- GPU recomendadas: para F16 o Q8_0, una RTX 4090 (24 GB), A100 (40/80 GB) o H100; para Q4_K_M o Q5_K_M, una RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4070 (12 GB) son suficientes.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 8 GB o mas usando cuantizaciones Q4 o inferiores; en Q2_K podria ejecutarse incluso en GPUs de 4-6 GB o en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y runners compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponible (depende del hardware y de la cuantizacion; no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma4-E4B-it-Abliterated-AND-Disinhibited-GGUF (este) | ~7,46 B | no disponible | no disponible | GGUF | Modelo sin rechazos, sin benchmarks publicados |
| Gemma 4 E4B-it original (referencia de familia) | ~7-8 B (segun variante) | no disponible | Gemma Terms of Use (segun familia) | safetensors, GGUF | Modelo alineado con rechazos; requiere aceptar terminos |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community License | safetensors, GGUF | Alternativa ampliamente soportada y con benchmarks publicados |
| Qwen2.5 7B Instruct | 7,62 B | 32 K (128 K en Turbo) | Apache 2.0 | safetensors, GGUF | Licencia permisiva y buen rendimiento multilingue |

La comparativa se ofrece como referencia de categoria; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un modelo entrenado con datos web a gran escala, es probable que herede sesgos del modelo original, pero no se detalla su naturaleza ni magnitud.
- Riesgo de alucinacion: no evaluado; no se publican mediciones de factualidad ni de tasas de alucinacion.
- Modificaciones de seguridad: las etiquetas `Abliterated` y `Disinhibited` indican que se han relajado o eliminado los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido danino, ofensivo o ilegal. No debe desplegarse en entornos de cara al publico sin filtros externos.
- Limitaciones de contexto e idioma: no disponible; se desconoce la ventana de contexto efectiva y los idiomas soportados oficialmente.
- Restricciones de licencia: la licencia no esta declarada en la informacion disponible, lo que impide confirmar si se permite uso comercial. Al derivar de la familia Gemma, es probable que se apliquen los terminos de uso de Gemma, pero no se confirma.
- Caveat para produccion: sin model card tecnica, sin benchmarks y sin licencia clara, el modelo no es apto para uso en produccion sin una evaluacion exhaustiva previa.
- Origen de los pesos: el modelo base es una modificacion no oficial de un modelo de terceros; no hay garantia de integridad ni de que el proceso de abliteration no haya degradado capacidades generales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma4-E4B-it-Abliterated-AND-Disinhibited-GGUF
- Modelo base: https://huggingface.co/stevenh512/gemma4-E4B-it-Abliterated-AND-Disinhibited
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Documentacion de llama.cpp (runner GGUF): https://github.com/ggerganov/llama.cpp
- Documentacion de Ollama: https://ollama.com
