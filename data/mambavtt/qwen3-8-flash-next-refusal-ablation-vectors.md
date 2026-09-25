# Mambavtt/qwen3.8-flash-next-refusal-ablation-vectors

## Resumen

qwen3.8-flash-next-refusal-ablation-vectors es un artefacto publicado en HuggingFace por el usuario Mambavtt el 25 de septiembre de 2026. No es un modelo de lenguaje: es un conjunto de 43 vectores de direccion por capa (float32, dimension 2560) que se aplican sobre el flujo residual de Qwen3.8-Flash-Next en tiempo de inferencia para reducir de forma reversible el comportamiento de rechazo. El repositorio ocupa 0.0 GB y contiene un fichero `.npz` con los vectores y un `.json` con metadatos de procedencia.

El artefacto esta construido y validado especificamente contra la conversion `RadixArk/Qwen3.8-Flash-Next-NVFP4`, de 48 capas, anchura oculta 2560 y 4 flujos de hiperconexion. La tecnica es activation steering: se proyecta el estado residual sobre la direccion de rechazo de cada capa y se resta una fraccion `alpha`, sin modificar pesos ni requerir fine-tuning. Esto convierte el grado de abliteracion en una palanca en tiempo de ejecucion (`alpha = 0` modelo original, `alpha = 1` ablacion validada, `alpha = 1.5` mas agresiva).

Su relevancia es doble: ofrece un metodo reversible y reproducible para modular el rechazo sin degradar los pesos, y ejemplifica un tipo de artefacto fuertemente acoplado a la version exacta del modelo y a su cuantizacion, lo que obliga a re-validar antes de reutilizarlo en otro contexto. El dataset de capturas no se incluye, solo hashes SHA-256 para trazabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica al artefacto: vectores de direccion por capa (activation steering) sobre un modelo base hibrido con atencion GDN + QSA y mezcla de expertos |
| Parametros totales | No disponible para el artefacto. Modelo base: aproximadamente 125B parametros segun fuentes externas |
| Parametros activos | No disponible (el modelo base es MoE, pero no se indica el numero de parametros activos) |
| Longitud de contexto | No aplica al artefacto. Modelo base: 262.144 tokens segun fuentes externas, con pool KV compartido de 524.288 posiciones |
| Tipos de cuantizacion | No aplica al artefacto; validado sobre la conversion NVFP4 del modelo base (`RadixArk/Qwen3.8-Flash-Next-NVFP4`) |
| Idiomas soportados | No disponible |
| Licencia | MIT para el artefacto; el modelo base queda sujeto a su propia licencia |
| Formato de pesos | `.npz` (NumPy, 43 arrays float32 de forma `(2560,)`) y `.json` de metadatos; no contiene pesos de modelo |
| Capas cubiertas | 4-46 (43 de 48 capas) |
| Dimension del vector | 2560, coincidente con la anchura oculta del modelo base |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto no entrena pesos. Los vectores se obtienen por diferencia de medias entre capturas de activaciones de prompts daninos y prompts inofensivos, con 495 pares balanceados por capa (495 por lado), pertenecientes a la cohorte v4. Las capturas se promedian sobre todas las posiciones del prompt y sobre los cuatro flujos de hiperconexion, se elimina la componente media de los ejemplos inofensivos y el resultado se normaliza; posteriormente los 43 vectores se ortogonalizan entre si. Las capturas se tomaron con prompts de estilo chat con temperatura emparejada y con el modo thinking desactivado. El SHA-256 de cada direccion y de las capturas de origen queda registrado en el fichero JSON, lo que permite verificar la procedencia.

La aplicacion es una proyeccion residual en tiempo de ejecucion: `h' = h - alpha * d_l * (d_l^T h)`, aplicada capa a capa en el rango 4-46. Existen indicaciones de implementacion relevantes: aplicar sobre el estado posterior al mean-pooling o adaptarse a la convencion del motor, y reiniciar o limpiar la cache KV (prefijo) al cambiar `alpha`, ya que las entradas cacheadas de los estados original y abliterado no son intercambiables. El modelo base, segun el repositorio de QwenLM, introduce una arquitectura hibrida de atencion GDN + QSA junto con cambios en residual, embedding y optimizacion.

## Capacidades

- Modulacion reversible del rechazo: permite pasar de comportamiento original (`alpha = 0`) a abliterado (`alpha = 1`) o mas agresivo (`alpha = 1.5`) sin reescribir pesos ni recargar un modelo distinto.
- Ajuste fino de intensidad: `alpha` actua como parametro continuo, lo que permite buscar un punto de compromiso entre rechazo y coherencia.
- Extraccion de la direccion de rechazo por capa: util para interpretabilidad mecanistica y para estudiar hasta que punto el rechazo es una direccion linealmente separable en el flujo residual.
- Trazabilidad criptografica: hashes SHA-256 de direcciones y capturas permiten reproducir y auditar el proceso de construccion.
- Compatibilidad con despliegues que permitan intervencion sobre el flujo residual: requiere implementacion propia o adaptacion del motor de inferencia.
- No aporta capacidades generativas nuevas: no anade vision, audio, tool calling ni multilingueismo; esas capacidades pertenecen al modelo base.
- No es un vector de control para llama.cpp ni un GGUF: no se puede cargar directamente en motores que solo aceptan control vectors en ese formato.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: aplicar los 43 vectores capa a capa y medir como cambia la distribucion de salida para localizar en que capas se concentra la representacion del rechazo.
- Auditoria de alineacion: comparar el modelo con `alpha = 0` y `alpha = 1` sobre el mismo conjunto de prompts para cuantificar que fraccion del comportamiento de rechazo es linealmente separable y cual depende de rutas no lineales.
- Red teaming controlado: usar `alpha` como variable independiente para medir la robustez del modelo base frente a jailbreaks cuando se degrada el mecanismo de rechazo, y documentar el impacto antes de desplegar cualquier variante.
- Ajuste de tono en dominios legitimos: en entornos como asistencia juridica, ficcion con contenido adulto o seguridad ofensiva defensiva, subir `alpha` de forma moderada para reducir rechazos injustificados manteniendo la coherencia.
- Docencia y divulgacion sobre activation steering: el repositorio sirve como ejemplo reproducible y con procedencia verificable de como se construye y aplica una direccion de ablacion, con un tamano de artefacto despreciable.
- Verificacion de artefactos de terceros: los hashes SHA-256 del JSON permiten comprobar que un conjunto de vectores redistribuido coincide con el original y no ha sido manipulado.
- Base metodologica para nuevos dominios: replicar el pipeline (pares balanceados, diferencia de medias, ortogonalizacion) para construir direcciones de otras conductas, como toxicidad o sycophancy, en el mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas cuantitativas de tasa de rechazo, calidad de respuestas, MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, ni para el artefacto ni para el modelo base en este repositorio. Tampoco se incluye ningun estudio de degradacion de coherencia asociado a `alpha = 1` o `alpha = 1.5`. No se debe asumir ningun nivel de rendimiento a partir de la documentacion disponible.

## Requisitos de hardware

- El artefacto en si no consume VRAM relevante: 43 vectores float32 de 2560 dimensiones ocupan aproximadamente 440 KB, mas el fichero JSON de metadatos.
- El coste real lo determina el modelo base: Qwen3.8-Flash-Next en su conversion NVFP4, con un tamano reportado de aproximadamente 125B parametros, exige VRAM o memoria unificada muy elevada.
- Segun una fuente externa, el modelo base se ha servido en una maquina AMD Strix Halo con 128 GB de memoria unificada, reduciendo los lotes de prefill de 32.768 a 8.192 tokens para liberar 13,2 GiB de memoria de trabajo.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB, RTX 5090) con el modelo base completo; requeriria cuantizaciones muy agresivas no validadas o despliegue en multiples GPU.
- GPUs de centro de datos tipo A100, H100 o similares son el escenario natural, aunque las cifras concretas de VRAM no estan disponibles en la informacion proporcionada.
- Motores de despliegue: la proyeccion residual requiere implementacion propia o un motor que exponga hooks sobre el flujo residual. No hay soporte nativo documentado en vLLM, llama.cpp, Ollama o TGI para este formato `.npz`.
- Alternativa en formato nativo: existe un artefacto equivalente publicado como control vector GGUF (`Cudecnik/Qwen3.8-Flash-Next-refusal-projection`) pensado para llama.cpp, con otra licencia.
- Latencia y throughput: no disponibles. El sobrecoste por token seria teoricamente minimo (un producto escalar y una resta de 2560 dimensiones por capa, sobre 43 capas), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Artefacto | Tipo | Cobertura | Formato | Licencia | Motor |
|---|---|---|---|---|---|
| Mambavtt/qwen3.8-flash-next-refusal-ablation-vectors | Direcciones de ablacion por capa (activation steering) | 43 capas (4-46), dim. 2560 | `.npz` + `.json` | MIT | Implementacion propia |
| Cudecnik/Qwen3.8-Flash-Next-refusal-projection | Control vector de rechazo | No disponible | GGUF | qwen-community-1 | llama.cpp |
| Abliteration a nivel de pesos (variantes no publicadas) | Modificacion permanente de pesos | Todas las capas | safetensors | Segun autor | Cualquiera |
| Modelo base sin intervencion | Ninguno | No aplica | NVFP4 | Licencia del modelo base | Cualquiera compatible |

No se dispone de otros artefactos comparables con datos publicos de eficacia, contexto o rendimiento que permitan una comparacion cuantitativa. La comparacion anterior es estructural, no de rendimiento.

## Limitaciones y advertencias

- Especificidad estricta: los vectores solo estan validados para la conversion `RadixArk/Qwen3.8-Flash-Next-NVFP4` (48 capas, anchura 2560, 4 flujos de hiperconexion). El propio autor advierte de que no deben reutilizarse en otros modelos ni en otras cuantizaciones sin re-validar.
- Cobertura parcial: solo se cubren 43 de las 48 capas (rango 4-46), por lo que las capas 0-3 y 47 quedan sin intervencion.
- Deriva de coherencia: el propio autor senala que `alpha = 1.5` puede producir drift de coherencia; no se documenta ningun umbral ni metrica de calidad.
- Riesgo de contenido danino: el proposito del artefacto es reducir el rechazo, lo que puede facilitar la generacion de contenido que el modelo base bloquearia. No se incluye ninguna evaluacion de seguridad ni filtro asociado.
- Estado de la cache KV: cambiar `alpha` sin limpiar o reiniciar la cache de prefijo produce resultados invalidos, porque las entradas de los estados original y abliterado no son intercambiables.
- Condiciones de extraccion restringidas: las capturas se tomaron con modo thinking desactivado y con prompts de estilo chat a temperatura emparejada; el comportamiento fuera de ese regimen no esta caracterizado.
- Trazabilidad incompleta: el dataset de capturas no se incluye en el repositorio, solo sus hashes; la reproducibilidad completa depende de fuentes externas.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de funcionamiento.
- Licencia del modelo base: la licencia MIT cubre el artefacto, pero el uso del modelo sobre el que se aplica queda sujeto a la licencia de Qwen3.8-Flash-Next y a la de la conversion NVFP4, que puede restringir el uso comercial.
- Idiomas y sesgos: no hay informacion sobre el comportamiento multilingue ni sobre sesgos introducidos o amplificados por la ablacion.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/Mambavtt/qwen3.8-flash-next-refusal-ablation-vectors
- Modelo base de la validacion: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Receta de servicio en AMD Strix Halo: https://github.com/abliter8-ai/qwen-3.8-next-flash-amd-strix-halo
- Ficha y especificaciones del modelo base: https://aireleasetracker.com/model/qwen/qwen3.8-flash-next
- Entrada enciclopedica del modelo base: https://ai.miraheze.org/wiki/Qwen-3.8-Flash-Next
- Artefacto alternativo en formato GGUF para llama.cpp: https://huggingface.co/Cudecnik/Qwen3.8-Flash-Next-refusal-projection
