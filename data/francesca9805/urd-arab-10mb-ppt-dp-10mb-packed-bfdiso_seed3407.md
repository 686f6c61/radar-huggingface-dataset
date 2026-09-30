# francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407

# Ficha tecnica: francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407

## Resumen

Se trata de un modelo de generacion de texto de arquitectura GPT-2 (transformer decoder-only causal) publicado por el usuario francesca9805 en HuggingFace. No es un modelo entrenado desde cero: es un ajuste fino (fine-tune) supervisado mediante SFT con la libreria TRL sobre el checkpoint goldfish-models/urd_arab_10mb, un modelo de la familia Goldfish orientado, segun su identificador, a urdu y arabe sobre un corpus de 10 MB. El peso real declarado en safetensors es de 38.038.528 parametros, muy por debajo del GPT-2 small original (124 millones), lo que lo situa en la categoria de modelos ultraligeros.

Su relevancia es fundamentalmente experimental y de investigacion: el nombre del repositorio codifica variables del experimento (dataset "packed", etiqueta "Dp", semilla "seed3407") y el run de Weights & Biases asociado pertenece a la entidad f-padovani-university-of-groningen, lo que sugiere un contexto academico de estudio de tokenizadores y entrenamiento en lenguas de bajos recursos. No hay evidencia de que sea un modelo destinado a produccion: acumula 0 descargas y 0 likes, no declara idiomas, licencia ni benchmarks.

La ficha que sigue refleja unicamente los datos verificables de la model card y de los metadatos del repositorio; cualquier aspecto no documentado se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only causal), segun el tag `gpt2`; configuracion reducida no detallada |
| Parametros totales | 38.038.528 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la familia GPT-2 suele usar 1024 tokens, pero no esta confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | no declarados en la model card; el modelo base (`urd_arab_10mb`) apunta por identificador a urdu y arabe |
| Licencia | no disponible (la model card incluye el campo placeholder `licence: license`) |
| Formato de pesos | safetensors (tag del repositorio); libreria `transformers` |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atencion causal, tal y como indica el tag `gpt2` del repositorio. Con 38,0 millones de parametros, se trata de una configuracion reducida respecto al GPT-2 small de 124 millones, aunque no se publican los hiperparametros concretos (numero de capas, dimension del modelo, cabezas de atencion, tamano de vocabulario ni si hay weight tying entre embedding y cabeza de salida). No hay informacion sobre el tokenizador empleado, mas alla de que el nombre del experimento menciona "bfdiso", presumiblemente una variante de tokenizacion, sin documentacion que lo explique.

El entrenamiento es un ajuste fino supervisado (SFT) ejecutado con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no especifica el dataset de ajuste, el numero de tokens, la composicion del corpus, ni si hubo fases posteriores de RLHF o DPO (solo se menciona SFT). El run de Weights & Biases enlazado (entidad `f-padovani-university-of-groningen`, proyecto `new-tokenizers`) es la unica fuente de trazabilidad del experimento. El checkpoint base, `goldfish-models/urd_arab_10mb`, pertenece a la familia Goldfish de modelos monocigotes entrenados sobre corpus pequenos; por el sufijo `10mb` cabe inferir un corpus de 10 MB en urdu y arabe, aunque no se aporta confirmacion documental en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva basica (completado de texto, continuacion de prompts cortos).
- Conversacion en formato de chat a traves del pipeline de `transformers`, tal y como muestra el ejemplo de la model card con mensajes `role: user`.
- Capacidad multilingue potencial limitada a los idiomas del modelo base (urdu y arabe segun el identificador); no declarada ni medida en la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo "thinking", capacidades de vision ni de audio.
- No se documentan capacidades de generacion de codigo ni de matematicas evaluadas.

## Casos de uso

- Investigacion sobre tokenizacion en lenguas de bajos recursos: el repositorio forma parte de un proyecto denominado "new-tokenizers" en Weights & Biases, de modo que el modelo sirve como artefacto reproducible para comparar esquemas de tokenizacion sobre el mismo corpus de 10 MB.
- Estudios de ablacion por semilla: la semilla esta codificada en el nombre del checkpoint (`seed3407`), lo que permite replicar la variabilidad entre ejecuciones y medir su impacto en un modelo de 38 M de parametros.
- Material didactico de ajuste fino con TRL: el flujo completo (modelo base, SFT, versiones de framework) esta documentado, lo que lo hace util como ejemplo minimo de fine-tuning reproducible en un curso o tutorial.
- Generacion de texto en CPU o dispositivos sin GPU: con unos 76 MB en bf16, el modelo puede ejecutarse en portatiles, contenedores modestos o entornos embebidos para demostraciones de completado de texto.
- Aumento de datos para urdu y arabe: puede emplearse para generar continuaciones sinteticas de frases que alimenten corpus de entrenamiento, siempre con revision humana por el riesgo de degeneracion y alucinacion de un modelo de este tamano.
- Experimentos de decodificacion y evaluacion de prompts: dado su bajisimo coste de inferencia, es adecuado para barridos masivos de hiperparametros de generacion (temperatura, top-p, penalizacion de repeticion) antes de escalar a modelos mayores.
- Pruebas de integracion en pipelines de HuggingFace: el repositorio esta etiquetado con `text-generation-inference` y `endpoints_compatible`, por lo que puede usarse para validar despliegues en TGI o Inference Endpoints a coste casi nulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 38.038.528 parametros, sin contar cache KV): aproximadamente 76 MB en bf16/fp16, unos 152 MB en fp32 y 38 MB en int8.
- En cuantizacion de 4 bits (previa conversion a GGUF, no publicada por el autor) el peso quedaria en torno a 19-25 MB, mas overhead de runtime.
- GPU recomendadas: cualquier GPU CUDA con 1 GB o mas de memoria es suficiente; se puede usar desde una GTX 1050 Ti hasta una H100, aunque el modelo esta muy sobredimensionado para aceleradores de gama alta.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso iGPU con memoria unificada.
- Despliegue: `transformers` con `pipeline("text-generation")` (metodo documentado en la model card), vLLM (soporta arquitecturas GPT-2), HuggingFace TGI (el repo esta etiquetado como `text-generation-inference`), y conversion a GGUF para llama.cpp u Ollama, que no se distribuye en el repositorio y habria que generar.
- Latencia y throughput: no disponibles. Cualitativamente, con 38 M de parametros la generacion en CPU es de decenas de tokens por segundo y en GPU moderna de miles de tokens por segundo en lote, pero no hay mediciones publicadas que lo confirmen.
- Almacenamiento: el repositorio completo ocupa 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407 | 38.038.528 | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes | Fine-tune SFT con TRL sobre el modelo base |
| goldfish-models/urd_arab_10mb (modelo base) | no disponible | no disponible | no disponible | HuggingFace | Modelo de la familia Goldfish, origen del ajuste |
| Alternativas de terceros de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se han identificado modelos comparables con datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo de 38 M de parametros: la coherencia a partir de pocos cientos de tokens es muy limitada y la tasa de repeticion y degeneracion es alta en comparacion con modelos de miles de millones de parametros.
- Riesgo elevado de alucinacion: no hay entrenamiento con RLHF ni DPO documentado que alinee las respuestas, solo SFT.
- Sesgos desconocidos: no se publica composicion del dataset de ajuste ni evaluacion de sesgos, por lo que no es posible auditar comportamientos discriminatorios o estereotipados.
- Idiomas: la model card no declara idiomas soportados; el uso fuera de urdu y arabe (los del modelo base) no esta validado y probablemente produzca texto incoherente.
- Licencia no disponible: el campo de licencia es un placeholder (`licence: license`), de modo que no hay autorizacion explicita para uso comercial. Se debe contactar con el autor antes de cualquier uso en produccion.
- Estado experimental: 0 descargas y 0 likes, sin paper ni documentacion tecnica asociada; el nombre del checkpoint codifica parametros del experimento que no se explican en ningun documento publico.
- Longitud de contexto no confirmada: no se especifica el numero de tokens de contexto soportado, lo que impide garantizar el comportamiento en prompts largos.
- No apto para produccion: carece de benchmarks, de ficha de evaluacion de seguridad y de soporte del autor.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los enlaces recuperados eran contenido no relacionado, por lo que no se incluyen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/goldfish-models/urd_arab_10mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/gesooqko
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper o blog del modelo: no disponible
- Demo: no disponible
- Nota: la busqueda web no arrojo resultados relevantes sobre este modelo.
