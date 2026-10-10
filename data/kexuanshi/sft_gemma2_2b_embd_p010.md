# KexuanShi/sft_gemma2_2b_embd_p010

## Resumen

sft_gemma2_2b_embd_p010 es un ajuste fino (SFT) del autor KexuanShi sobre un modelo de la familia Gemma 2 de 2B, según indican el nombre del repositorio y la etiqueta `gemma2`. El modelo tiene 2.614.341.888 parámetros reales (≈2,6B) según los pesos en safetensors y está pensado para generación de texto en formato conversacional, con pipeline `text-generation` y compatibilidad declarada con text-generation-inference y endpoints.

El problema que resuelve es acotado: se trata de un experimento de ajuste supervisado (SFT) mediante la librería TRL, no de un modelo de propósito general publicado con documentación completa. El repositorio no especifica el modelo base exacto (el campo aparece como `None` en la model card), no declara licencia efectiva, idiomas ni dataset de entrenamiento, y no incluye resultados de evaluación. Con 0 descargas y 0 likes, es un artefacto de investigación sin validación por parte de la comunidad.

Su relevancia actual es limitada y fundamentalmente técnica: sirve como ejemplo reproducible de un pipeline de SFT con versiones muy recientes del ecosistema Hugging Face (TRL 1.13.0, Transformers 5.17.0, PyTorch 2.13.0) y como punto de partida para quien quiera inspeccionar o continuar el ajuste. No debe considerarse un modelo listo para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 2 (indicado por nombre y etiqueta `gemma2`; no confirmado en la model card) |
| Parametros totales | 2.614.341.888 (≈2,6B) según safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la familia Gemma 2 2B usa 8192 tokens, según documentación pública del modelo base, no confirmado aquí) |
| Tipos de cuantizacion | no especificados por el autor; solo se publican pesos en safetensors |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card contiene únicamente el marcador `licence: license`) |
| Formato de pesos | safetensors (librería `transformers`) |
| Tamaño del repositorio | 52,3 GB |
| Pipeline declarado | text-generation |
| Versiones de framework | TRL 1.13.0, Transformers 5.17.0, PyTorch 2.13.0, Datasets 5.0.1, Tokenizers 0.23.2 |

## Arquitectura y entrenamiento

El modelo se presenta como un ajuste fino generado con `SFTTrainer` de TRL y etiquetado con `generated_from_trainer`. Por el nombre y la etiqueta `gemma2` cabe inferir que parte de un Gemma 2 de 2B, un transformer decoder-only denso con atención de ventana deslizante local y capas de atención global alternadas, vocabulario de 256k tokens y soft-capping de logits. Todos estos detalles corresponden a la documentación pública de la familia Gemma 2 y no están confirmados en la model card de este repositorio, que no identifica siquiera el checkpoint base (el campo figura como `None`).

El procedimiento de entrenamiento declarado es únicamente SFT. No hay mención de RLHF, DPO, ORPO ni de ninguna fase de alineación posterior, ni de decodificación especulativa u otras optimizaciones de inferencia. La model card no documenta el número de tokens de entrenamiento, la composición del dataset, la longitud de secuencia, la tasa de aprendizaje, el número de épocas ni la configuración de precisión. El tamaño del repositorio (52,3 GB) es muy superior a lo que ocuparían los pesos en bf16 de un modelo de 2,6B (≈5,2 GB), lo que sugiere la presencia de checkpoints intermedios, estados del optimizador o múltiples copias de los pesos; el autor no lo aclara.

## Capacidades

- Generación de texto autoregresiva en formato conversacional: el ejemplo de inicio rápido usa una lista de mensajes con `role: user`, lo que implica una plantilla de chat.
- Ajuste por instrucciones (instruction following) derivado del entrenamiento SFT, sin evaluación publicada que lo cuantifique.
- El repositorio declara compatibilidad con `text-generation-inference` y con endpoints, lo que indica que el artefacto se puede servir con ese stack.
- No hay evidencia de soporte de tool calling ni de function calling en la información disponible.
- No hay evidencia de capacidades de agente, razonamiento multi-paso, modo thinking ni uso de herramientas externas.
- No hay evidencia de capacidades de visión, audio ni multimodalidad (el modelo es de texto).
- Capacidades multilingües: no disponibles; el autor no documenta idiomas.
- Capacidades de código y matemáticas: no documentadas ni evaluadas en este repositorio.

## Casos de uso

- Experimentación académica con SFT: sirve como referencia reproducible de un ajuste supervisado con TRL 1.13.0 sobre un modelo de 2,6B, útil para comparar hiperparámetros o recetas de entrenamiento en un entorno controlado.
- Generación de texto conversacional de bajo coste en local: al tratarse de un modelo de 2,6B, puede ejecutarse en GPUs de consumo (12 GB o más) en cuantización de 8 o 4 bits, lo que permite prototipar chatbots sin depender de APIs externas.
- Evaluación de la degradación por SFT: permite medir, con un conjunto de pruebas propio, cuánta capacidad del modelo base se conserva o se pierde tras el ajuste, ya que no hay benchmarks publicados.
- Base para ajustes posteriores con DPO o RLHF: el checkpoint puede actuar como punto de partida para fases de alineación adicionales, dado que solo ha pasado por SFT.
- Docencia y formación técnica: ilustra cómo se estructura un repositorio generado por `SFTTrainer`, incluida la model card automática y los metadatos de versiones.
- Pruebas de integración de infraestructura: útil para validar pipelines de despliegue con TGI, vLLM o transformers antes de pasar a modelos mayores, gracias a su tamaño reducido.
- No se recomienda su uso en atención al cliente, generación de código en producción ni tareas críticas, al no existir evaluación, licencia clara ni modelo base identificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo (los enlaces devueltos pertenecen a dominios sin relación alguna con el repositorio).

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 2,6B parámetros, sin incluir caché KV ni overhead del runtime):
  - FP32: ≈10,5 GB solo en pesos.
  - BF16/FP16: ≈5,2 GB solo en pesos; en la práctica, entre 6 y 8 GB con caché KV para contextos moderados.
  - INT8: ≈2,6 GB solo en pesos; alrededor de 3,5-4,5 GB en total.
  - INT4: ≈1,3-1,6 GB solo en pesos; alrededor de 2,5-3,5 GB en total.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 (24 GB) o superiores para inferencia en BF16 o INT8 con comodidad; A100 40/80 GB y H100 para batch grande o ajuste completo.
- Sí cabe en GPU de consumo: en BF16 con holgura en tarjetas de 8-12 GB, y en cuantizaciones de 4 bits en GPUs de 6-8 GB. No hay cuantizaciones publicadas por el autor, por lo que habría que generarlas.
- Ajuste fino: el SFT completo en BF16 requeriría del orden de 40 GB o más (pesos, gradientes y estados del optimizador); con LoRA o QLoRA bastaría con 10-12 GB, aunque estas cifras son estimaciones y no datos publicados.
- Opciones de despliegue: `transformers` con `pipeline`, text-generation-inference (declarado como compatible por las etiquetas), vLLM, llama.cpp u Ollama si se generan pesos GGUF. No hay artefactos GGUF, AWQ ni GPTQ en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

La comparación se establece contra los modelos base de su categoría, ya que este repositorio no publica métricas propias. Los datos de la columna del modelo analizado son los confirmados en este repositorio; los de las alternativas corresponden a sus especificaciones públicas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Evaluacion publicada |
|---|---|---|---|---|---|
| sft_gemma2_2b_embd_p010 | 2,6B | no disponible | no disponible | 0 descargas, repo de 52,3 GB | no |
| Gemma 2 2B (base) | 2,6B | 8192 tokens | Gemma Terms of Use | ampliamente disponible | sí, en la documentación de Google |
| Qwen2.5-1.5B / 3B | 1,5B / 3B | 32 768 tokens (1,5B y 3B) | Apache-2.0 (mayoría de variantes) | ampliamente disponible | sí |
| Llama 3.2 1B / 3B | 1B / 3B | 128k tokens | Llama 3.2 Community License | ampliamente disponible | sí |
| Phi-3-mini | 3,8B | 4096 tokens (128k en variante long) | MIT | ampliamente disponible | sí |

La ventaja diferencial de este ajuste frente a los base citados sería una supuesta especialización obtenida por SFT, pero no hay ningún dato que la respalde. En licencia, contexto declarado y evaluación, queda por detrás de todas las alternativas listadas.

## Limitaciones y advertencias

- El modelo base no está identificado en la model card: el campo aparece literalmente como `None`, lo que impide conocer con certeza la arquitectura, el tokenizador, el contexto y la procedencia de los pesos.
- No se declara licencia efectiva. El marcador `licence: license` no es una licencia y no autoriza explícitamente ningún uso, incluido el comercial. Debe aclararse con el autor antes de cualquier despliegue.
- No hay resultados de evaluación, ni propios ni del modelo base, en este repositorio. Cualquier afirmación sobre su calidad sería especulativa.
- Riesgo elevado de alucinación y de degradación en tareas fuera del dominio del dataset de SFT, que además se desconoce.
- No se documentan sesgos, pero al no conocerse el dataset de ajuste no puede descartarse la introducción de sesgos nuevos respecto al modelo base.
- Idiomas soportados no disponibles; no puede asumirse un comportamiento multilingüe correcto aunque el modelo base lo tuviera.
- Sin datos de seguridad ni de alineación: no consta ningún paso de RLHF, DPO ni filtrado de contenido.
- El repositorio ocupa 52,3 GB, muy por encima de los ≈5,2 GB esperables para 2,6B parámetros en BF16; conviene inspeccionar su contenido antes de descargarlo.
- Ausencia total de adopción (0 descargas, 0 likes) implica que no hay validación externa, informes de errores ni soporte.
- Las fechas de creación y actualización del repositorio son posteriores a la fecha actual en el momento de redactar esta ficha, lo que resulta anómalo y debe verificarse.
- Los resultados de la búsqueda web asociados a este modelo no contienen información técnica utilizable y no se han empleado como fuente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/KexuanShi/sft_gemma2_2b_embd_p010
- TRL (librería de entrenamiento citada en la model card): https://github.com/huggingface/trl
- Paper de TRL citado en la model card: von Werra, L. et al. (2020), "TRL: Transformers Reinforcement Learning", https://github.com/huggingface/trl
- No se han encontrado papers, blogs, repositorios adicionales ni demos específicos de este modelo en la búsqueda web realizada. Los enlaces devueltos por dicha búsqueda no guardan relación con el repositorio y se han descartado.
