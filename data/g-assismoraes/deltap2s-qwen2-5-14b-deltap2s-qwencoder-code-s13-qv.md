# g-assismoraes/DeltaP2S-Qwen2.5-14B-DeltaP2S-QwenCoder-Code-S13-QV

## Resumen

DeltaP2S-Qwen2.5-14B-DeltaP2S-QwenCoder-Code-S13-QV es un checkpoint de la familia Qwen2.5 publicado por el usuario g-assismoraes en HuggingFace. Segun su propia model card, se trata de un "merged Qwen2.5 checkpoint produced by the Qwen-aware Delta-P2S experiment package", es decir, el resultado de un proceso de fusion de pesos (model merging) aplicado sobre la arquitectura Qwen2.5, y no de un entrenamiento desde cero. La nomenclatura del repositorio y las rutas de entrenamiento citadas (`./runs/codeqwen7B-14B_SameFormula-S13/...`) apuntan a un experimento que combina un modelo Qwen de codigo y un Qwen2.5 de 14B, con identificadores de configuracion ("S13", "SameFormula") que sugieren una ejecucion concreta dentro de una serie de pruebas.

El modelo tiene 14.770.033.664 parametros reales (unos 14,77B), lo que lo situa en la gama de 14B, con un repositorio de 29,6 GB compatible con pesos en precision bf16/fp16. Se distribuye unicamente en formato safetensors para la libreria transformers, con los tags habituales de Qwen2 (`qwen2`, `qwen2.5`, `text-generation`, `conversational`), ademas de etiquetas especificas del metodo de fusion (`delta-p2s`, `pen2sword`) y de despliegue (`text-generation-inference`, `endpoints_compatible`).

Su relevancia practica es limitada en el momento de redactar esta ficha: el repositorio acumula 0 descargas y 0 "likes", no publica licencia ni idiomas soportados, no incluye resultados de benchmarks y no documenta ni el dataset de fusion ni la receta tecnica. Es, por tanto, un artefacto experimental de investigacion util para quien quiera reproducir o auditar el metodo Delta-P2S, pero no una opcion recomendable para produccion sin una evaluacion previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (segun tags `qwen2` / `qwen2.5`); detalles internos no documentados en la model card |
| Parametros totales | 14.770.033.664 (14,77B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible en la model card. La familia Qwen2.5-14B de referencia declara 32.768 tokens nativos, ampliables a 131.072 con YaRN; sin confirmar para este checkpoint |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no hay variantes GGUF, GPTQ ni AWQ en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria `transformers`); repositorio de 29,6 GB, coherente con pesos en bf16/fp16 |
| Tamano del repositorio | 29,6 GB |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |
| Compatibilidad de despliegue | `transformers`, `text-generation-inference` (tag `endpoints_compatible`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna, pero los tags (`qwen2`, `qwen2.5`) y el nombre del checkpoint indican que se apoya en la implementacion Qwen2 de transformers: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, atencion con RoPE y, en los tamanos de 14B de esta familia, atencion con query/key/value agrupadas (GQA). No se especifica en el repositorio ni el numero de capas, ni las dimensiones ocultas, ni el numero de cabezas, ni si se ha modificado algun componente respecto al modelo base.

Lo que si se desprende del material publicado es que no hubo entrenamiento desde cero, sino una fusion de pesos. La model card menciona "Qwen-aware Delta-P2S experiment package" y dos rutas: `./runs/codeqwen7B-14B_SameFormula-S13/init/delta_p2s` como base de entrenamiento y `./runs/codeqwen7B-14B_SameFormula-S13/train/delta_p2s` como directorio de entrenamiento. Eso sugiere un pipeline en dos fases (inicializacion de deltas y ajuste/fusion) sobre una combinacion de un modelo de codigo tipo CodeQwen y un Qwen2.5 de 14B, con la variante identificada como "S13". No se publican ni el numero de tokens implicados, ni la composicion del dataset, ni si se aplico RLHF, DPO o SFT, ni el algoritmo exacto de fusion (no disponible). El segundo tag del metodo, `pen2sword`, aparece en el identificador y en los tags, pero tampoco va acompanado de documentacion tecnica en el repositorio.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` indica que el checkpoint esta orientado a dialogos multi-turno con plantilla de chat de Qwen2.
- Generacion de codigo: el nombre del experimento referencia un modelo de codigo (CodeQwen) y una configuracion "Code-S13", por lo que la especializacion en codigo es la hipotesis de diseno del autor, aunque no hay evaluacion publicada que la confirme.
- Razonamiento y matematicas: capacidades presumibles al heredar el modelo base Qwen2.5-14B; no verificadas ni documentadas en este repositorio.
- Tool calling / function calling: no documentado en la model card. La familia Qwen2.5 lo soporta de serie, pero no hay confirmacion para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles; los tags no incluyen `vision` ni variantes de razonamiento explicito.
- Compatibilidad con TGI: el tag `text-generation-inference` y `endpoints_compatible` indican que el autor preve el despliegue mediante HuggingFace Text Generation Inference y endpoints gestionados.

## Casos de uso

- Evaluacion comparativa de tecnicas de fusion de modelos: el caso mas solido dado el estado del artefacto. Un equipo de investigacion puede cargar el checkpoint y medir si la fusion Delta-P2S conserva las capacidades del Qwen2.5-14B original frente a un merge lineal simple, usando su propio conjunto de validacion.
- Asistencia de codigo en un IDE interno: al estar orientado a codigo, podria emplearse como backend de autocompletado o generacion de funciones en un entorno controlado, siempre con un benchmark propio (HumanEval/MBPP) antes de exponerlo a usuarios.
- Generacion de tests unitarios y documentacion tecnica: tareas de transformacion de codigo existente a artefactos derivados, donde el modelo no necesita razonamiento profundo sino seguir el estilo del repositorio.
- Experimentos de destilacion o generacion de datos sinteticos: util para producir corpus de codigo y texto que luego alimenten el entrenamiento de modelos mas pequenos, asumiendo un coste de filtrado y validacion posterior.
- Reproduccion academica de pipelines de merging: sirve como caso de estudio de como se nombran, versionan y publican checkpoints intermedios (rutas `init/`, `train/`, variantes `S13`) en un flujo de experimentacion.
- Chat tecnico especializado en un dominio acotado: con un ajuste fino ligero (LoRA) sobre la base publicada, podria adaptarse a un vertical concreto (por ejemplo, normativa interna de una empresa), pero solo tras resolver la ambiguedad de licencia.
- Base para cuantizacion y despliegue en hardware de gama alta: dado su tamano de 14,77B, un equipo con 2x RTX 4090 o una A100 40GB puede servir el modelo en bf16 y compararlo con alternativas oficiales de Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MBPP ni ninguna otra metrica, y la busqueda web realizada no ha devuelto documentacion tecnica asociada al metodo Delta-P2S ni al checkpoint. Cualquier cifra de rendimiento empleada para decidir su uso deberia obtenerse ejecutando una evaluacion propia.

## Requisitos de hardware

- VRAM para pesos en bf16/fp16: aproximadamente 29,5 GB solo para pesos (14,77B x 2 bytes), mas la cache KV. Con contexto de 8K-16K conviene reservar entre 34 y 40 GB.
- VRAM para pesos en 8 bits: en torno a 15-16 GB, mas cache KV; viable en una RTX 4090 de 24 GB con contexto moderado.
- VRAM para pesos en 4 bits: en torno a 9-10 GB, mas cache KV; encaja en GPU de consumo con 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 3090/4090).
- GPU recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB para bf16 sin cuantizar; 2x RTX 4090 24 GB mediante tensor parallelism; RTX 4090/3090 individuales solo con cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion. En bf16 no cabe en ninguna GPU de consumo actual de 24 GB o menos.
- Opciones de despliegue: transformers (soporte nativo, es la libreria declarada), vLLM y Text Generation Inference (el tag `text-generation-inference` y `endpoints_compatible` lo indican), HuggingFace Inference Endpoints. llama.cpp y Ollama requeririan generar primero un GGUF, que no esta publicado.
- Latencia y throughput: no disponibles. No hay cifras de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la documentacion publica de la familia Qwen2.5 y no han podido verificarse con la informacion aportada; se marcan como referencia externa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| DeltaP2S-Qwen2.5-14B-...-S13-QV (este modelo) | 14,77B | No disponible | No disponible | Repositorio HF, 0 descargas | No |
| Qwen2.5-14B-Instruct (referencia externa) | 14,7B | 32.768 nativos / 131.072 con YaRN | Apache-2.0 | Ampliamente disponible | Si, publicados por el autor |
| Qwen2.5-Coder-14B-Instruct (referencia externa) | 14,7B | 32.768 nativos / 131.072 con YaRN | Apache-2.0 | Ampliamente disponible | Si, publicados por el autor |
| CodeQwen1.5-7B (referencia externa) | 7B | 64K declarados por el autor | Apache-2.0 | Ampliamente disponible | Si, publicados por el autor |

La diferencia relevante no es de arquitectura ni de tamano, sino de garantias: frente a los modelos oficiales de Qwen, este checkpoint carece de licencia declarada, de evaluacion publicada y de soporte de la comunidad.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en el repositorio, no hay autorizacion explicita de uso comercial. Conviene tratar el modelo como no apto para produccion hasta aclarar este punto con el autor, y tener en cuenta que la licencia del modelo base Qwen2.5 (Apache-2.0 en sus versiones publicas) podria verse afectada por los pesos de codigo incorporados en la fusion.
- Ausencia total de benchmarks: no hay evidencia publicada de que la fusion preserve las capacidades del modelo base; el proceso de merging puede degradar el rendimiento en tareas no relacionadas con la especializacion buscada.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de 14B, agravado aqui por la falta de evaluacion y de ajuste de alineamiento documentado.
- Sesgos: no documentados. El dataset de fusion es desconocido, por lo que no puede auditarse la composicion ni el equilibrio de idiomas y dominios.
- Idiomas: no se declara ninguna lista. No se puede asumir un rendimiento multilingue equivalente al de Qwen2.5-14B oficial sin comprobarlo.
- Contexto: no confirmado. Aunque la familia base soporte 32.768 tokens, la fusion puede haber alterado el comportamiento en secuencias largas, especialmente en las capas de atencion.
- Trazabilidad limitada: la model card solo contiene rutas internas de entrenamiento (`runs/...`), sin enlaces a codigo, dataset, configuracion de hardware ni hiperparametros. Reproducir el resultado es inviable con la informacion publicada.
- Validacion de la comunidad nula: 0 descargas y 0 likes; no hay terceros que hayan verificado el comportamiento del checkpoint ni reportado incidencias.
- Sin variantes cuantizadas: al no existir GGUF ni pesos GPTQ/AWQ, el despliegue en hardware modesto obliga a generar las cuantizaciones por cuenta propia y validar su calidad.
- Nomenclatura ambigua: identificadores como "QV", "S13", "pen2sword" o "SameFormula" no se explican en ningun documento, lo que dificulta saber que version concreta del experimento se esta usando.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/DeltaP2S-Qwen2.5-14B-DeltaP2S-QwenCoder-Code-S13-QV
- Perfil del autor en HuggingFace: https://huggingface.co/g-assismoraes
- Documentacion de la arquitectura Qwen2 en transformers: https://huggingface.co/docs/transformers/model_doc/qwen2
- Repositorio oficial de Qwen2.5 (modelos base de los que parte la fusion): https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5 (referencia de la familia base): https://arxiv.org/abs/2412.15115

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre el metodo Delta-P2S ni sobre este checkpoint; los unicos resultados obtenidos fueron paginas genericas del buscador sin relacion con el modelo. No se ha localizado paper, repositorio de codigo ni demo asociados al experimento.
