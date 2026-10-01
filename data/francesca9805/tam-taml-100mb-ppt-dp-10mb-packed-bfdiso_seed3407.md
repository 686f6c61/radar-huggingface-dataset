# francesca9805/tam-taml-100mb-ppt-Dp-10mb-packed-bfdiso_seed3407

## Resumen

El modelo `francesca9805/tam-taml-100mb-ppt-Dp-10mb-packed-bfdiso_seed3407` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/tam_taml_100mb`, desarrollado por el usuario francesca9805 (vinculado a la Universidad de Groningen segun la traza de Weights & Biases). Se trata de un modelo decoder-only de la familia GPT-2 con 124.770.816 parametros (~125 M) y pesos en safetensors, entrenado mediante SFT con la libreria TRL. El pipeline declarado es generacion de texto.

El modelo hereda la orientacion linguistica del proyecto Goldfish, centrado en lenguas de bajos recursos; en concreto, el codigo `tam_Taml` corresponde al tamil escrito en escritura tamil. El sufijo del nombre (`ppt-Dp-10mb-packed-bfdiso_seed3407`) sugiere una configuracion concreta de datos empaquetados (~10 MB), una variante de precision/aislamiento y una semilla fija para reproducibilidad, aunque esos detalles no estan documentados en la model card.

Su relevancia es acotada: es un experimento de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni idiomas especificados formalmente. Resulta util como referencia para estudiar ajustes finos sobre modelos multilingues pequenos de Goldfish y para reproducir configuraciones de entrenamiento con TRL, mas que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2`) |
| Parametros totales | 124.770.816 (~125 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (arquitectura GPT-2; valor concreto sin confirmar) |
| Tipos de cuantizacion | No disponible (pesos publicados en precision completa; conversiones a GGUF/otras no publicadas) |
| Idiomas soportados | No disponible en la ficha; el modelo base esta orientado al tamil (codigo `tam_Taml`) |
| Licencia | No disponible (la model card contiene el marcador de posicion `licence: license`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia GPT-2, segun la etiqueta `gpt2` del repositorio y el pipeline `text-generation`. Con 124,77 M de parametros, esta en el rango de un GPT-2 small ampliado o de un modelo pequeno de investigacion. La atencion es causal estandar; no se declara ningun mecanismo de atencion lineal, decodificacion especulativa ni arquitectura hibrida.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre el modelo base `goldfish-models/tam_taml_100mb`. Las versiones de framework declaradas son Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas posteriores de RLHF o DPO; el nombre del modelo apunta a un subconjunto empaquetado de aproximadamente 10 MB, pero ese dato no esta confirmado en la documentacion. No se declara ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto autoregresiva en el idioma y dominio cubiertos por el modelo base (tamil, segun el codigo `tam_Taml`), sin garantia de cobertura multilingue amplia.
- Conversacion de un solo turno y multi-turno basica: la model card incluye un ejemplo con formato de mensajes (`{"role": "user", "content": ...}`) compatible con `transformers.pipeline`.
- Ajuste por instrucciones derivado del proceso de SFT, orientado a seguir prompts conversacionales.
- Integracion con el ecosistema Hugging Face (`transformers`, `text-generation-inference`, `endpoints_compatible`), lo que facilita su despliegue en pipelines estandar.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion sobre ajuste fino multilingue: sirve como caso de estudio reproducible (semilla fija `seed3407`) para comparar el efecto del SFT sobre modelos Goldfish pequenos frente al modelo base sin ajustar.
- Experimentacion academica en lenguas de bajos recursos: permite evaluar la calidad de generacion en tamil (escritura tamil) con un modelo de ~125 M de parametros que cabe en cualquier GPU o incluso en CPU.
- Prototipado rapido de generacion de texto: su tamano reducido (repo de 0,3 GB) permite iterar en local con `transformers.pipeline` sin infraestructura dedicada.
- Pruebas de integracion con text-generation-inference (TGI) y endpoints compatibles: util para validar pipelines de despliegue antes de escalar a modelos mayores.
- Generacion de texto con restricciones de recursos: escenarios de edge o entornos con memoria muy limitada donde un modelo de este tamano es viable.
- Analisis de ablaciones de datos: dado el sufijo `packed-10mb`, puede emplearse para estudiar el impacto del empaquetado y del volumen de datos en el ajuste fino de modelos pequenos.
- Base para posteriores fine-tunings de dominio: al ser un checkpoint intermedio pequeno, puede servir de punto de partida para tareas especificas en tamil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 250 MB en fp16, unos 500 MB en fp32, unos 125 MB en int8 y unos 65 MB en int4 (estimaciones derivadas de los 124,77 M de parametros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no requiere A100, H100 ni RTX 4090, aunque funcionara en ellas sin aprovechar su capacidad.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU consumer (GTX 1050 Ti en adelante) e incluso puede ejecutarse en CPU.
- Opciones de despliegue: `transformers` de forma nativa; `text-generation-inference` dado el tag `endpoints_compatible`; `vLLM` es viable por tratarse de un transformer decoder-only estandar. Para `llama.cpp` u `Ollama` seria necesaria una conversion previa a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/tam-taml-100mb-ppt-Dp-10mb-packed-bfdiso_seed3407 | 124,77 M | No disponible | Tamil (base) | No disponible | Hugging Face, 0 descargas |
| goldfish-models/tam_taml_100mb (modelo base) | ~100 M (nominal) | No disponible | Tamil | No disponible en la informacion disponible | Hugging Face (Goldfish Models) |
| francesca9805/tam-taml-100mb-ppt-Dp-10mb-packed-bfd_seed10 | Similar al evaluado | No disponible | Tamil (base) | No disponible | Hugging Face (variante con otra semilla) |
| francesca9805/tam-taml-100mb-ppt-Dp-100mb-packed-bfd_seed3407 | Similar al evaluado | No disponible | Tamil (base) | No disponible | Hugging Face (variante con mas datos empaquetados) |

No se han identificado en la informacion disponible otros modelos publicos comparables fuera de la propia familia Goldfish y de las variantes del mismo autor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un corpus reducido (aprox. 10 MB segun el nombre), es probable que herede sesgos del corpus de origen y del modelo base, pero no hay analisis publicado.
- Riesgo de alucinacion: elevado, propio de un modelo de ~125 M de parametros y de un ajuste fino con datos limitados; no debe usarse para tareas que exijan veracidad factual sin verificacion.
- Limitaciones de contexto e idioma: la longitud de contexto no esta confirmada y la cobertura linguistica no se declara; el foco aparente es el tamil, por lo que el rendimiento en otros idiomas es incierto.
- Restricciones de licencia: la licencia no esta especificada (marcador `licence: license`), lo que impide determinar si el uso comercial esta permitido; se debe contactar con el autor antes de cualquier uso en produccion.
- Madurez: 0 descargas y 0 likes, sin benchmarks publicados, sin model card detallada y sin dataset documentado; no es un artefacto validado para produccion.
- Reproducibilidad: aunque la semilla esta fijada en el nombre, no se documentan hiperparametros ni composicion del dataset de entrenamiento.
- Nombre del modelo: la nomenclatura (`ppt`, `Dp`, `bfdiso`, `packed`) no esta explicada, lo que dificulta interpretar la configuracion exacta del experimento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/tam-taml-100mb-ppt-Dp-10mb-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/goldfish-models/tam_taml_100mb
- Traza de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/1ux39q09
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante con semilla 10: https://huggingface.co/francesca9805/tam-taml-100mb-ppt-Dp-10mb-packed-bfd_seed10
- Variante con dataset de 100 MB: https://huggingface.co/francesca9805/tam-taml-100mb-ppt-Dp-100mb-packed-bfd_seed3407
- Ficha en FriendliAI: https://friendli.ai/models/francesca9805/tam-taml-100mb-ppt-Dp-100mb-packed-bfd_seed10
- Ficha en free2aitools: https://free2aitools.com/model/francesca9805/tam-taml-100mb-ppt-dp-100mb-packed-bfd_seed3407
