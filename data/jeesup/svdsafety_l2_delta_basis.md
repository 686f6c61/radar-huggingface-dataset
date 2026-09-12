# Jeesup/svdsafety_l2_delta_basis

## Resumen

`Jeesup/svdsafety_l2_delta_basis` no es un modelo generativo, sino un artefacto de investigación publicado en HuggingFace que contiene las subespacios singulares dominantes de la diferencia de pesos `dW = W_chat - W_base` entre `meta-llama/Llama-2-7b-chat-hf` y `meta-llama/Llama-2-7b-hf`. El autor, Jeesup, calcula mediante SVD aleatorizado (con `q = k + 16` y 8 iteraciones de potencia) las k primeras direcciones singulares de las 224 matrices de proyección de Llama-2-7b (7 proyecciones por cada una de las 32 capas), y las distribuye junto con metadatos espectrales y resultados de ablación.

La relevancia del artefacto está en su hallazgo central: la actualización de alineación que convierte el modelo base en el modelo de chat es estructurada pero no de rango bajo. Las 64 direcciones principales concentran solo el 15,3 % de la energía de Frobenius de `dW`, frente al 3,9-5,8 % que esperaría una matriz gaussiana i.i.d. del mismo tamaño (unas 3-4 veces más concentración que el azar). Aun así, eliminar exactamente esas 64 direcciones principales degrada la tasa de rechazo de peticiones dañinas del 99,4 % al 83,1 % y eleva la tasa de éxito de ataque (ASR) en AdvBench del 0,19 % al 9,62 %, con la misma perturbación de Frobenius que controles que eliminan las 64 direcciones inferiores o 64 direcciones aleatorias.

Se trata, por tanto, de una herramienta para el estudio de la seguridad y la interpretabilidad de la alineación en la familia Llama 2, no de un modelo desplegable. Sus ficheros de pesos son tensores PyTorch (`.pt`) con las matrices U, S y V truncadas, con un tamaño de repositorio de 3,2 GB, y su uso queda sujeto a la Llama 2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Artefacto de subespacios singulares (SVD aleatorizado) sobre las diferencias de pesos de un transformer decoder-only denso; no es un modelo con arquitectura propia |
| Parametros totales | No aplica al artefacto; el modelo de referencia (Llama-2-7b-chat-hf) tiene 7.000 millones de parametros |
| Parametros activos | No aplica (el modelo de referencia es denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los tensores se distribuyen sin cuantizar, en punto flotante, dentro de ficheros `.pt` |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (etiqueta `llama2`), con `LICENSE.txt` y `USE_POLICY.md` incluidos |
| Formato de pesos | PyTorch `.pt` (tensores `U`, `S`, `V` por matriz); metadatos en `.spectrum.json` y resumenes en `results/` |
| Modelo base | `meta-llama/Llama-2-7b-chat-hf` (referencia de comparacion: `meta-llama/Llama-2-7b-hf`) |
| Cobertura | 224 matrices (32 capas x 7 proyecciones: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) |
| Rangos disponibles | k = 64 (`llama2_7b_k64.pt`) y k = 256 (`llama2_7b_k256.pt`) |
| Metodo de calculo | SVD aleatorizado con `q = k + 16` y 8 iteraciones de potencia sobre `dW` en crudo, sin blanqueado |
| Tamano del repositorio | 3,2 GB |
| Libreria | pytorch |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 12 de septiembre de 2026 |

## Arquitectura y entrenamiento

El artefacto no entrena ningun modelo. Parte de dos checkpoints ya entrenados de la familia Llama 2 (`Llama-2-7b-hf` y su version afinada para chat, `Llama-2-7b-chat-hf`) y calcula, para cada matriz de proyeccion, la diferencia `dW = W_chat - W_base`. Sobre cada `dW` aplica una SVD aleatorizada truncada a k componentes, conservando `U[:, :k]`, `S[:k]` y `V[:, :k]`. La implementacion de referencia es `compress/build_delta_basis.py` y los tensores se cargan con `compress.delta_basis.load_basis`, indexados por la clave `"<layer>.<projection>"`.

Una decision metodologica explicita del autor es no blanquear `dW`: blanquear con una gram de calibracion sobre texto benigno ordenaria las direcciones por energia en texto benigno, que es precisamente el sesgo que el metodo pretende evitar. El analisis del espectro muestra que `dW` es estructurado pero no de rango bajo: la concentracion es maxima en `q_proj` y `k_proj` (23 % de energia en k = 64, rango estable ~80) y minima en `down_proj` (9 %, rango estable 323). El valor global para todo el modelo es del 15,3 % en k = 64, con un rango estable de 160. El artefacto incluye ademas los resumenes de evaluacion de seguridad (ASR y retencion de alineacion) y un `compression.json` por celda.

## Capacidades

- Extraccion de subespacios: proporciona las k direcciones singulares dominantes de la actualizacion de alineacion de Llama-2-7b-chat, por capa y proyeccion, para k = 64 y k = 256.
- Analisis espectral: ficheros `.spectrum.json` con la energia por matriz en k = 1, 4, 16 y 64, el rango estable y la relacion `|dW|/|W|`.
- Soporte de ablacion controlada: los datos permiten eliminar las direcciones principales, las inferiores o un subconjunto aleatorio con una perturbacion de Frobenius identica (0,02423), lo que habilita comparaciones limpias.
- Evaluacion de seguridad reproducible: resultados de ASR en AdvBench (520 prompts, decodificacion greedy de chat) y tasa de rechazo, juzgados con `cais/HarmBench-Llama-2-13b-cls`.
- Analisis de retencion de alineacion: tablas de retencion y resumenes de ASR incluidos en `results/`.
- Soporte de tool calling / function calling: no aplica (el artefacto no es un modelo conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible.
- Capacidades especiales: ninguna de tipo generativo; su funcion es instrumental para investigacion en seguridad e interpretabilidad.

## Casos de uso

- Investigacion en interpretabilidad de la alineacion: permite analizar que subespacios de la diferencia `W_chat - W_base` sostienen el comportamiento de rechazo, cuantificando que las 64 direcciones principales concentran el 15,3 % de la energia pero son responsables de la mayor parte de la tasa de rechazo.
- Red-teaming y evaluacion de robustez: sirve como base para medir la fragilidad del alineamiento de seguridad ante ediciones de bajo rango, usando AdvBench y el juez HarmBench con una perturbacion de Frobenius controlada.
- Compresion consciente de la seguridad: al identificar que `q_proj` y `k_proj` concentran mas energia de alineacion (23 % en k = 64) que `down_proj` (9 %), orienta que capas deben preservarse con mayor fidelidad en pipelines de cuantizacion o poda.
- Auditoria de modelos afinados: comparar el subespacio de alineacion de un fine-tune derivado con el de Llama-2-7b-chat permite detectar si un ajuste posterior ha erosionado las direcciones criticas de seguridad.
- Diseno de defensas durante el fine-tuning: las direcciones top-k pueden emplearse como termino de regularizacion que penalice la modificacion de esos subespacios, reduciendo el riesgo de que un ajuste elimine el rechazo.
- Analisis forense de modelos manipulados: dado un modelo con la seguridad degradada, el artefacto ofrece un conjunto de referencia contra el que comparar la deriva de pesos y estimar que parte de la alineacion se ha eliminado.
- Docencia y publicacion de resultados reproducibles: el repositorio incluye los scripts, los espectros y las tablas de resultados necesarios para replicar el experimento completo sobre la familia Llama 2.
- Estudios metodologicos sobre SVD truncada: `q = k + 16` y 8 iteraciones de potencia permiten evaluar el coste y la fidelidad del calculo de subespacios dominantes sobre matrices de 7.000 millones de parametros.

## Benchmarks y rendimiento

Los datos publicados corresponden a dos experimentos. El primero caracteriza la concentracion de energia de las direcciones principales de `dW`:

| Modulo | k=1 | k=4 | k=16 | k=64 | Rango estable de dW |
|---|---:|---:|---:|---:|---:|
| q_proj | 0,016 | 0,039 | 0,098 | 0,230 | 79 |
| k_proj | 0,019 | 0,045 | 0,102 | 0,229 | 81 |
| v_proj | 0,009 | 0,023 | 0,059 | 0,151 | 138 |
| o_proj | 0,007 | 0,019 | 0,051 | 0,137 | 169 |
| gate_proj | 0,008 | 0,018 | 0,046 | 0,120 | 155 |
| up_proj | 0,007 | 0,016 | 0,043 | 0,113 | 173 |
| down_proj | 0,003 | 0,011 | 0,032 | 0,089 | 323 |
| Todos | 0,010 | 0,024 | 0,061 | 0,153 | 160 |

Referencia de control: una matriz gaussiana i.i.d. de la misma forma concentra entre el 3,9 % y el 5,8 % de la energia en sus 64 primeras direcciones.

El segundo experimento compara el efecto de eliminar 64 direcciones de `dW` manteniendo constante la perturbacion de Frobenius (0,02423):

| Edicion | ASR en AdvBench | Tasa de rechazo |
|---|---:|---:|
| Ninguna (chat denso) | 0,0019 | 0,994 |
| Eliminar las 64 direcciones principales de dW | 0,0962 | 0,831 |
| Eliminar las 64 direcciones inferiores de dW | 0,0038 | 0,994 |
| Eliminar 64 direcciones aleatorias de dW | 0,0058 | 0,992 |

Configuracion de evaluacion: juez `cais/HarmBench-Llama-2-13b-cls`, 520 prompts de AdvBench y decodificacion greedy de chat. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de capacidades generales en la informacion disponible.

## Requisitos de hardware

- Carga del artefacto: los tensores de rango 64 ocupan aproximadamente 640 MB en punto flotante de 32 bits (unos 160 millones de elementos) y los de rango 256 aproximadamente 2,6 GB; en conjunto justifican el tamano de repositorio de 3,2 GB. Estas cifras son estimaciones derivadas de las formas de las matrices de Llama-2-7b (32 capas, 7 proyecciones, hidden 4096, intermediate 11008).
- Manipulacion del artefacto: no requiere GPU. Basta con CPU y entre 1 y 4 GB de RAM para cargar los subespacios, y algo mas si se reconstruyen las matrices densas `U S V^T`.
- Modelo de referencia para materializar las ediciones: Llama-2-7b-chat-hf necesita aproximadamente 13-14 GB de VRAM en fp16/bf16 y unos 4-5 GB en cuantizacion de 4 bits. Estas cifras son estimaciones para un modelo denso de 7.000 millones de parametros, no datos publicados en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para experimentos por lotes con el modelo completo en fp16; una RTX 3090 o RTX 4090 (24 GB) es suficiente para inferencia fp16 del modelo de referencia; una RTX 3060 de 12 GB solo admite cuantizacion de 4 bits.
- Viabilidad en GPU de consumo: si, para el modelo de referencia y no para el artefacto en si. El artefacto se procesa en CPU sin problema.
- Opciones de despliegue: el artefacto no es compatible de forma nativa con vLLM, llama.cpp, Ollama ni TGI; requiere el script `compress/build_delta_basis.py` y la funcion `compress.delta_basis.load_basis`. Para servirlo como modelo habria que materializar los pesos editados y exportarlos a safetensors (y opcionalmente convertirlos a GGUF) antes de usar cualquiera de esos motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada otros artefactos publicos equivalentes de subespacios de alineacion de Llama 2 con los que comparar directamente. La comparacion significativa es interna al propio estudio, entre estados del mismo modelo:

| Configuracion | Parametros | Naturaleza | ASR en AdvBench | Tasa de rechazo | Licencia |
|---|---|---:|---:|---:|---|
| Llama-2-7b-chat-hf (chat denso) | 7.000 M | Modelo generativo desplegable | 0,0019 | 0,994 | Llama 2 Community License |
| Chat sin las 64 direcciones principales de dW | 7.000 M | Modelo generativo editado | 0,0962 | 0,831 | Llama 2 Community License |
| Chat sin las 64 direcciones inferiores de dW | 7.000 M | Modelo generativo editado (control) | 0,0038 | 0,994 | Llama 2 Community License |
| Chat sin 64 direcciones aleatorias de dW | 7.000 M | Modelo generativo editado (control) | 0,0058 | 0,992 | Llama 2 Community License |
| `svdsafety_l2_delta_basis` (este artefacto) | No aplica | Subespacios y metadatos, no generativo | No aplica | No aplica | Llama 2 Community License |

Comparativa con alternativas de la misma categoria (artefactos de analisis de subespacios de alineacion): no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para inferencia directa, tool calling, agentes ni generacion de texto. Confundirlo con un checkpoint desplegable es el principal error de interpretacion posible.
- Alcance restringido a Llama 2: solo cubre `Llama-2-7b-chat-hf` frente a `Llama-2-7b-hf`, con 224 matrices y dos rangos (k = 64 y k = 256). No hay garantia de que los subespacios sean transferibles a otras familias, a otros tamanos de Llama 2 o a modelos afinados con DPO o RLHF distintos.
- Interpretacion de los resultados acotada al protocolo experimental: las cifras de ASR y tasa de rechazo proceden de AdvBench con 520 prompts, decodificacion greedy y el juez `cais/HarmBench-Llama-2-13b-cls`. Cambiar el juez, el conjunto de prompts o la estrategia de decodificacion puede alterar los valores.
- Concentracion energetica limitada: el 15,3 % de energia en 64 direcciones implica que la mayor parte de `dW` queda fuera del subespacio distribuido; cualquier conclusion sobre alineacion debe tener en cuenta ese 84,7 % restante.
- Eleccion metodologica no neutral: el calculo se hace sobre `dW` en crudo, sin blanqueado. Es una decision deliberada del autor, pero implica que los rankings de direcciones no estan normalizados por la sensibilidad del modelo a cada direccion.
- Doble uso: el artefacto identifica exactamente que direcciones deben eliminarse para degradar el rechazo de seguridad. Es material util para investigacion defensiva, pero tambien facilita la construccion de variantes con la alineacion debilitada.
- Sesgos y alucinacion: no aplica directamente al artefacto, pero cualquier modelo resultante de aplicar estas ediciones hereda los sesgos y el riesgo de alucinacion de Llama-2-7b-chat-hf.
- Limitaciones de idioma y contexto: no disponibles en la informacion proporcionada. El artefacto no declara idiomas soportados ni ventana de contexto.
- Restricciones de licencia: se aplica la Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos. Cualquier uso comercial o redistribucion debe cumplir esa licencia, incluida la politica de uso aceptable y los requisitos de atribucion de Llama 2.
- Madurez y soporte: el repositorio tiene 0 descargas y 0 likes, no declara pipeline y depende de scripts propios (`compress/build_delta_basis.py`, `compress.delta_basis.load_basis`) que no forman parte de ningun framework estandar. No hay garantia de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svdsafety_l2_delta_basis
- Modelo base (chat): https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Modelo base (preentrenado): https://huggingface.co/meta-llama/Llama-2-7b-hf
- Juez de evaluacion: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Licencia y politica de uso: `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio
- La busqueda web realizada no ha devuelto ningun enlace relevante: los resultados obtenidos corresponden a paginas de recetas de cocina y no guardan relacion con el modelo. No se dispone de paper, blog ni repositorio de codigo adicional asociado.
