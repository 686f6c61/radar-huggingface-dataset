# ehartford/phi3-4k

## Resumen

Phi3-4k es un modelo de generacion de texto publicado por el usuario Eric Hartford (ehartford) en Hugging Face, derivado de la familia Phi-3 de Microsoft. El identificador del repositorio y el sufijo "4k" apuntan a un checkpoint de Phi-3 con una ventana de contexto de 4.096 tokens, aunque la model card no confirma explicitamente esta relacion ni documenta el proceso de derivacion. El modelo cuenta con 3.821.079.552 parametros segun los pesos en safetensors, lo que lo situa en la categoria de modelos pequenos optimizados para inferencia en hardware modesto.

La model card es practicamente un esqueleto autogenerado por la libreria transformers y no contiene informacion sustantiva sobre entrenamiento, datos, evaluacion o uso previsto. El propio autor advierte que el modelo es "para experimentacion en curso y no esta pensado para reutilizacion". Esta advertencia, junto con las apenas 12 descargas y 1 like registradas, indica que se trata de un artefacto de investigacion personal mas que de un modelo listo para produccion.

Su relevancia es por tanto limitada y de caracter documental: sirve como ejemplo de publicacion de checkpoints experimentales en el Hub y como referencia de las dimensiones tipicas de un modelo Phi-3 de 3.800 millones de parametros. Para cualquier evaluacion seria de capacidades conviene acudir al modelo base original de Microsoft, que si dispone de documentacion tecnica completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (presumiblemente Phi-3; no confirmado en la model card) |
| Parametros totales | 3.821.079.552 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (inferido del nombre "4k"; no confirmado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 7,6 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura en la model card. Por el numero de parametros (3.821 millones) y la nomenclatura del repositorio, el modelo es consistente con un transformer denso de la familia Phi-3 de Microsoft, que emplea atencion multi-cabeza estandar, capas de normalizacion y una tokenizacion basada en el tokenizador de Llama. Sin embargo, el autor no documenta ni confirma esta correspondencia, y el tag `custom_code` sugiere que el repositorio incluye codigo de modelado propio que puede diferir del original.

Tampoco se detallan los datos de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si hubo etapas de ajuste fino supervisado o preferencia (RLHF/DPO). La model card no incluye hiperparametros, regimen de precision ni infraestructura de computo. El unico dato tecnico verificable es el recuento de parametros obtenido de los safetensors y el tamano del repositorio.

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline declarado `text-generation`.
- Conversacion multi-turno, segun el tag `conversational`.
- Razonamiento y codigo: no documentado; no se puede afirmar sin datos del autor.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Experimentacion con checkpoints Phi-3: util para desarrolladores que quieran inspeccionar variantes comunitarias de la familia Phi-3 y comparar pesos y tokenizador con el modelo base oficial.
- Pruebas de integracion con transformers: al estar publicado con `library_name: transformers` y pesos safetensors, sirve para validar pipelines de carga y generacion en entornos de desarrollo.
- Evaluacion de robustez de checkpoints no documentados: permite estudiar como se comporta un modelo sin model card sustantiva y que riesgos introduce en un pipeline.
- Docencia y formacion: como ejemplo de repositorio autogenerado y de las advertencias que debe incluir una ficha de modelo antes de su uso.
- Pruebas de inferencia en hardware de gama media: con 3.800 millones de parametros, cabe en GPUs de consumo con cuantizacion, aunque el autor no proporciona recetas.
- Analisis de licencias: con licencia MIT, sirve como caso de estudio de publicacion permisiva de pesos derivados de modelos con terminos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa por tamano (no confirmada por el autor), un modelo de 3.800 millones de parametros requiere aproximadamente 7,6 GB en fp16, unos 3,8 GB en cuantizacion de 8 bits y unos 2 GB en 4 bits.
- GPU recomendadas: no disponible. Por tamano, seria desplegable en GPUs de consumo con al menos 8 GB de VRAM en fp16 y en GPUs profesionales (A100, H100) para mayor throughput.
- Cabe en GPU de consumo: probablemente si, con cuantizacion, aunque no hay confirmacion del autor.
- Opciones de despliegue: transformers (declarado); vLLM, llama.cpp, Ollama y TGI no estan confirmados para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| ehartford/phi3-4k | 3.821 millones | 4.096 (inferido) | MIT | Model card vacia; autor indica solo experimentacion | Hugging Face |
| microsoft/Phi-3-mini-4k-instruct | 3.800 millones (aprox.) | 4.096 | MIT | Model card completa con benchmarks | Hugging Face |
| Llama 3.2 3B Instruct | 3.200 millones (aprox.) | 128.000 | Licencia comunitaria Llama | Model card completa | Hugging Face y Meta |
| Qwen2.5 3B Instruct | 3.000 millones (aprox.) | 32.768 | Apache 2.0 | Model card completa | Hugging Face |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; los datos de Phi-3-mini, Llama 3.2 3B y Qwen2.5 3B no proceden de la informacion proporcionada en esta ficha y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo es para experimentacion en curso y no esta pensado para reutilizacion.
- La model card carece de informacion sobre sesgos, datos de entrenamiento y evaluacion, por lo que no es posible auditar el modelo.
- Riesgo elevado de alucinacion y de comportamiento impredecible al no documentarse el ajuste fino ni las etapas de alineacion.
- Contexto limitado a 4.096 tokens segun el nombre del repositorio; no apto para tareas que requieran ventanas largas.
- Idiomas soportados sin documentar; no se puede garantizar un rendimiento aceptable en castellano.
- Aunque la licencia es MIT, los pesos derivan presumiblemente de Phi-3 de Microsoft; conviene verificar los terminos del modelo base antes de cualquier uso comercial.
- El tag `custom_code` implica que la carga requiere `trust_remote_code=True`, lo que introduce riesgo de ejecucion de codigo no auditado.
- Actividad muy baja en el Hub (12 descargas, 1 like) y sin mantenimiento documentado; no hay garantia de soporte ni de actualizaciones.
- No usar en produccion sin una evaluacion propia y sin comparar con el modelo base oficial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ehartford/phi3-4k
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact#compute
