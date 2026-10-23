# praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-clmsft

## Resumen

`praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-clmsft` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `google/gemma-2-2b` por el grupo PRAISELab@PICUSLab. No se trata de un modelo completo, sino de un conjunto de pesos delta de aproximadamente 0,1 GB que debe cargarse junto al modelo base para poder utilizarse. El repositorio esta etiquetado como `benchmark-slm`, `dataset-fiven` y `strategy-clmsft`, lo que situa el artefacto dentro de un esfuerzo de evaluacion de modelos de lenguaje pequenos (SLM) sobre un conjunto de datos denominado FIVEN, con una estrategia de entrenamiento identificada como `clmsft`.

El adaptador esta especializado en italiano (`it`), que es el unico idioma declarado en los metadatos, y se publica con acceso restringido (gated): es necesario aceptar las condiciones en HuggingFace y autenticarse con un token para descargarlo. La ficha no declara licencia, resultados de evaluacion ni detalles del corpus de entrenamiento, por lo que su interes principal es de caracter metodologico y reproducible dentro de una comparativa de estrategias de ajuste fino, mas que como modelo listo para produccion.

Por su tamano (hereda los aproximadamente 2.600 millones de parametros de Gemma 2 2B) y su naturaleza de adaptador, es un candidato razonable para experimentacion en GPU de consumo, despliegues en本地... en local y pruebas comparativas frente a otras variantes del mismo benchmark, como la version `strategy-mix` publicada por la misma organizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base `google/gemma-2-2b`); el artefacto es un adaptador LoRA |
| Parametros totales | Aproximadamente 2.600 millones en el modelo base; el adaptador LoRA ocupa ~0,1 GB en el repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; heredada del modelo base |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; tras fusionarlo con el modelo base admite los formatos de cuantizacion soportados por este (no declarados en la ficha) |
| Idiomas soportados | Italiano (`it`) |
| Licencia | No disponible en la ficha; el modelo base se rige por los terminos de Gemma |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) sobre un transformer decoder-only de la familia Gemma 2, en su variante de 2B parametros. La libreria declarada es `peft` y los tags confirman `lora` y `safetensors`, de modo que el repositorio contiene unicamente las matrices de actualizacion de bajo rango mas la configuracion del adaptador, no los pesos completos. El tag `base_model:adapter:google/gemma-2-2b` indica que se aplica directamente sobre ese checkpoint.

No se han publicado en la informacion disponible el numero de tokens de entrenamiento, la composicion del corpus FIVEN, la existencia de fases de RLHF o DPO, ni la hiperparametrizacion del ajuste (rango, alpha, learning rate, numero de pasos). El identificador `strategy-clmsft` sugiere una estrategia de entrenamiento especifica dentro del benchmark (posiblemente una combinacion de aprendizaje continuo y ajuste supervisado), pero la ficha no documenta su significado ni su implementacion, por lo que cualquier interpretacion al respecto queda fuera de lo verificable.

## Capacidades

- Generacion de texto en italiano, condicionada por el ajuste fino sobre el dataset FIVEN.
- Hereda del modelo base la capacidad de generacion autoregresiva y el modelado de lenguaje general; el adaptador modula el estilo y el dominio, no anade arquitectura nueva.
- Soporte de tool calling / function calling: no documentado en la ficha.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingues: limitadas al italiano segun los metadatos, aunque el modelo base es multilingue y conserva parte de ese conocimiento.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Reutilizacion como adaptador intercambiable: al ser PEFT, puede cargarse y descargarse dinamicamente sobre el mismo modelo base, lo que facilita comparaciones A/B y servir varias variantes con una sola copia del base.

## Casos de uso

- Evaluacion comparativa de estrategias de ajuste fino: el adaptador sirve para medir el efecto de la estrategia `clmsft` frente a otras variantes del mismo benchmark (por ejemplo `strategy-mix`) usando identico modelo base y prompts, lo que aisla la contribucion del metodo de entrenamiento.
- Reproducibilidad de experimentos academicos: al ser un delta de ~0,1 GB, permite reconstruir exactamente el punto de control evaluado y volver a lanzar las mismas pruebas con coste de almacenamiento minimo.
- Generacion de texto en italiano para prototipos: una vez fusionado con Gemma 2 2B, puede emplearse para redactar respuestas, resumenes o parafrasis en italiano en entornos de demostracion, con la advertencia de que no hay metricas publicadas de calidad.
- Servicio multi-adaptador con vLLM: vLLM permite cargar adaptadores LoRA adicionales sobre un unico modelo base en memoria; este adaptador podria registrarse como una variante mas y enrutar peticiones italianas a el sin duplicar los pesos del base.
- Despliegue en local para pruebas de privacidad: al caber en GPU de consumo y poder ejecutarse con llama.cpp u Ollama tras la fusion y conversion a GGUF, permite validar flujos con datos que no deben salir de la organizacion.
- Filtrado y clasificacion de texto italiano en pipelines de datos: uso del adaptador como generador de etiquetas o reformulador dentro de un proceso por lotes, siempre que se valide previamente su comportamiento con un conjunto de referencia propio.
- Base para un segundo ajuste: al ser un adaptador PEFT, puede combinarse o continuar entrenandose con LoRA sobre LoRA para dominios especificos, partiendo de un checkpoint ya expuesto a texto italiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de metricas, y las busquedas web realizadas no aportan puntuaciones asociadas a este adaptador concreto. El nombre del repositorio (`benchmark-slm-fiven`) indica que forma parte de un ejercicio de evaluacion, pero los resultados de dicho ejercicio no estan accesibles en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del adaptador ocupan ~0,1 GB; el modelo base de ~2,6B parametros requiere aproximadamente 5-6 GB en bf16/fp16, ~3 GB en cuantizacion de 8 bits y ~2 GB en 4 bits (estimaciones, no cifras publicadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, L4, A10G para servicio; A100/H100 solo si se sirven muchas replicas o adaptadores concurrentes.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas de VRAM en bf16, y en tarjetas de 4 GB con cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Nota operativa: el acceso es restringido, por lo que cualquier despliegue automatizado necesitara un token de HuggingFace con los permisos aceptados y acceso a la red en el momento del aprovisionamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-clmsft` | ~2,6B (base) + LoRA | No disponible | No publicado | No disponible | Gated en HuggingFace |
| `praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-mix` | ~2,6B (base) + LoRA | No disponible | No publicado | No disponible | Publico en HuggingFace |
| `google/gemma-2-2b` (base sin ajustar) | ~2,6B | No declarado en la ficha del adaptador | Metricas publicadas por Google en la model card del base | Terminos de Gemma | Publico |

La comparacion relevante es interna al benchmark: misma arquitectura y mismo modelo base, con estrategia de entrenamiento distinta (`clmsft` frente a `mix`). Sin resultados publicados no es posible establecer cual rinde mejor; la unica diferencia verificable es la estrategia declarada en el nombre y en los tags.

## Limitaciones y advertencias

- Ausencia total de metricas: no hay benchmarks, no hay evaluacion cualitativa y no hay descripcion del dataset FIVEN, por lo que no puede recomendarse para produccion sin una evaluacion propia previa.
- Riesgo de alucinacion: inherente a un modelo de 2B parametros ajustado con LoRA; el ajuste no elimina la generacion de contenido incorrecto, y en un modelo pequeno el riesgo es mayor que en modelos de mayor escala.
- Sesgos: no documentados. Al desconocerse la composicion del corpus de entrenamiento no es posible evaluar sesgos de dominio, genero o ideologia en italiano.
- Cobertura linguistica: solo se declara italiano; el uso en castellano u otras lenguas no esta validado y puede degradar el comportamiento respecto al modelo base.
- Licencia: la ficha no declara licencia. El modelo base Gemma esta sujeto a los terminos de uso de Gemma, que imponen obligaciones especificas (entre ellas, restricciones de uso y obligaciones de atribucion); es necesario verificar la compatibilidad antes de cualquier uso comercial.
- Acceso restringido: requiere aceptar condiciones en HuggingFace y usar un token autenticado; esto complica la integracion en CI/CD, la distribucion de artefactos y la reproducibilidad por terceros.
- Ambiguedad del identificador: `clmsft` no esta definido en la ficha; no debe asumirse ninguna propiedad tecnica concreta a partir del nombre.
- Naturaleza de adaptador: no es un modelo autonomo. Cualquier uso requiere descargar tambien `google/gemma-2-2b` y aplicar correctamente el delta; una fusion incorrecta invalida los resultados.
- Fecha de publicacion reciente y ausencia de comunidad (0 descargas, 0 likes en el momento del registro): no hay evidencia de uso externo ni de validacion independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-clmsft
- Variante con estrategia `mix` del mismo benchmark: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-mix
- Perfil de la organizacion: https://huggingface.co/praiselab-picuslab
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Documentacion de la familia Gemma: https://gemma.ai/models/
