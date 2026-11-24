# owel-ai/orbis-coder-heads

## Resumen

Orbis Coder - Sonic v1 es un conjunto de cuatro cabezas de borrador (draft heads) lineales para decodificación especulativa, publicadas por owel-ai (swayam.lab) sobre el modelo base congelado Qwen2.5-Coder-0.5B-Instruct. No es un modelo de lenguaje autónomo: son 544.538.624 parámetros en BF16 (cuatro matrices de 896 a 151.936) que predicen los tokens t+1 a t+4 a partir del último estado oculto del modelo base, siguiendo el esquema Medusa.

El problema que resuelve es la latencia de decodificación autoregresiva: en lugar de una llamada secuencial al modelo base por token, las cabezas proponen varias continuaciones que se verifican en un único forward pass paralelo del modelo base. Según el autor, la salida verificada en modo greedy es idéntica a la decodificación greedy convencional, pero con menos llamadas secuenciales al modelo base.

Es relevante por su enfoque práctico y ligero: añade aceleración de inferencia sin reentrenar el modelo base, con pesos en safetensors, licencia Apache-2.0 sobre el entrenamiento propio y un script de referencia (`medusa.py`) para el bucle de carga y generación. El repositorio ocupa 1,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas lineales de borrador (Medusa-style) sobre transformer decoder Qwen2.5-Coder-0.5B-Instruct congelado |
| Parametros totales | 544.538.624 (solo cabezas; el modelo base se distribuye aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-Coder-0.5B-Instruct; no especificada en la model card) |
| Tipos de cuantizacion | BF16 para las cabezas; cuantizacion del modelo base no especificada |
| Idiomas soportados | no disponible (los del modelo base Qwen2.5-Coder-0.5B-Instruct) |
| Licencia | Apache-2.0 (entrenamiento propio); el modelo base conserva su licencia |
| Formato de pesos | safetensors (`draft_heads.safetensors`), mas `draft_heads_config.json`, `training_meta.json` y `medusa.py` |

## Arquitectura y entrenamiento

Cada una de las cuatro cabezas es una proyeccion lineal de 896 dimensiones (estado oculto del modelo base) a 151.936 dimensiones (vocabulario). La cabeza i predice el token t+i+1 a partir del ultimo estado oculto del modelo base, de forma que las cuatro cabezas cubren una ventana de borrador de cuatro tokens. En decodificacion, las cabezas generan varias continuaciones candidatas que se validan con un unico forward pass paralelo del modelo base, reduciendo el numero de llamadas secuenciales.

El entrenamiento se realizo sobre el modelo base congelado Qwen2.5-Coder-0.5B-Instruct, congelando por tanto todos los pesos del transformer y optimizando unicamente las cabezas. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Los detalles del run de entrenamiento se remiten al archivo `training_meta.json` incluido en el repositorio. La innovacion tecnica destacable es la verificacion greedy con salida identica a la decodificacion greedy estandar, lo que permite acelerar sin alterar la distribucion de salida en ese modo.

## Capacidades

- Aceleracion de decodificacion especulativa multi-path sobre Qwen2.5-Coder-0.5B-Instruct: propone hasta cuatro tokens por paso de verificacion.
- Verificacion greedy con salida identica a la decodificacion greedy convencional, segun el autor.
- Borrador multi-cabeza (cuatro cabezas independientes, una por posicion futura).
- Integracion mediante el script de referencia `medusa.py`, que implementa carga y bucle de generacion.
- Capacidades de generacion de texto y codigo heredadas del modelo base (no propias de las cabezas).
- Tool calling, agentes, razonamiento multi-paso, vision o audio: no disponibles en las cabezas; dependen exclusivamente del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada; dependen del modelo base.

## Casos de uso

- Aceleracion de autocompletado de codigo en IDE: las cabezas permiten proponer varios tokens por paso de verificacion sobre Qwen2.5-Coder-0.5B-Instruct, reduciendo la latencia percibida en sugerencias inline en un modelo pequeno que cabe en GPU de consumo.
- Servicio de generacion de codigo de baja latencia: al disminuir las llamadas secuenciales al modelo base, se mejora el throughput por GPU en endpoints de completado de codigo con requisitos estrictos de tiempo de respuesta.
- Evaluacion de tecnicas de decodificacion especulativa: sirve como referencia reproducible (pesos, configuracion y `medusa.py`) para comparar Medusa frente a decodificacion estandar en tareas de codigo.
- Prototipado de asistentes de programacion en local: al combinarse con el modelo base de 0,5B, el conjunto puede desplegarse en equipos sin aceleradores de gama alta para pruebas de concepto.
- Pipeline de generacion de tests y docstrings: el modelo base genera el contenido y las cabezas reducen el coste por token en tareas de completado corto y repetitivo, tipicas de la generacion de pruebas unitarias.
- Investigacion sobre verificacion greedy: permite validar la equivalencia entre salida especulativa verificada y decodificacion greedy en dominios de codigo, util para estudiar garantias de calidad en inferencia acelerada.
- Ensenanza de inferencia eficiente: el repositorio es un ejemplo minimo y legible de cabezas Medusa con script de referencia para cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de aceptacion de tokens, speedup medido, ni resultados en MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM de las cabezas: 544.538.624 parametros en BF16 equivalen a aproximadamente 1,09 GB solo para los pesos de las cabezas.
- VRAM total: hay que sumar el modelo base Qwen2.5-Coder-0.5B-Instruct (unos 1 GB en BF16), lo que situa el conjunto en torno a 2 GB de pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el conjunto en BF16; una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: si, incluidas GPUs de gama de entrada con 4-8 GB de VRAM.
- Opciones de despliegue: el autor proporciona `medusa.py` como bucle de referencia; no se documenta integracion con vLLM, llama.cpp, Ollama o TGI. La verificacion paralela requiere un runtime que soporte decodificacion especulativa con multiples cabezas.
- Latencia y throughput: no disponibles; no se han publicado mediciones de speedup ni de tasa de aceptacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| owel-ai/orbis-coder-heads | Cabezas Medusa sobre Qwen2.5-Coder-0.5B-Instruct | 544,5 M (cabezas) | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-Coder-0.5B-Instruct | Modelo de codigo completo | 0,5 B | no disponible en esta ficha | Apache-2.0 | Hugging Face |
| Cabezas Medusa originales (Medusa, Cai et al.) | Cabezas de borrador genericas | variable | no aplica | no disponible | Repositorio de investigacion |

La comparacion con otras cabezas de decodificacion especulativa (EAGLE, Lookahead) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base Qwen2.5-Coder-0.5B-Instruct para funcionar; sin el, las cabezas no generan texto.
- La equivalencia con la decodificacion greedy solo esta garantizada en modo greedy verificado; con muestreo, temperatura o top-p la salida puede diferir.
- No se documentan tasas de aceptacion ni speedup real; el beneficio practico depende del dominio y del hardware.
- Sesgos conocidos: no disponibles en la informacion proporcionada; hereda los del modelo base Qwen2.5-Coder.
- Riesgo de alucinacion: no evaluado para este componente; el modelo base de 0,5B tiene capacidad limitada y mayor propension a errores que modelos mayores.
- Limitaciones de contexto e idioma: no especificadas; dependen del modelo base.
- Licencia: Apache-2.0 para las cabezas, pero el uso comercial del conjunto queda sujeto tambien a la licencia del modelo base Qwen2.5-Coder-0.5B-Instruct.
- Madurez: repositorio con cero descargas y cero likes, creado y actualizado el mismo dia; sin validacion externa conocida.
- Integracion en produccion: no hay soporte documentado para runtimes de inferencia estandar (vLLM, TGI, llama.cpp); habria que implementar el bucle de verificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/owel-ai/orbis-coder-heads
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Demo Space: https://huggingface.co/spaces/owel-ai/orbis-coder
- Sitio del autor (swayam.lab): https://owel-2t4.pages.dev
