# believe-it-or-not/cond_start_ptonly_mixed_original_augmented_original_pkc_fda_approval-0ff3deb3

## Resumen

`believe-it-or-not/cond_start_ptonly_mixed_original_augmented_original_pkc_fda_approval-0ff3deb3` es un adaptador PEFT (LoRA) publicado en Hugging Face por el usuario `believe-it-or-not`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion que debe cargarse sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. El repositorio ocupa 1,7 GB y contiene pesos en formato safetensors, lo que es coherente con un adaptador de rango bajo sobre un modelo de 70 000 millones de parametros.

El nombre del repositorio sugiere un ajuste fino orientado a un dominio muy concreto: la cadena `pkc_fda_approval` apunta a la aprobacion de medicamentos por parte de la FDA (PKC podria referirse a protein kinase C o a un identificador interno del experimento), mientras que `cond_start_ptonly_mixed_original_augmented_original` describe una configuracion de entrenamiento con arranque condicional, mezcla de datos originales y aumentados, y posiblemente entrenamiento solo en la parte de "prompt" o "prefijo". No obstante, el autor no documenta ninguna de estas decisiones.

La relevancia de esta ficha es limitada por la ausencia casi total de documentacion: la model card es la plantilla por defecto de Hugging Face sin rellenar, no se declara licencia, no se especifican idiomas ni pipeline, y el repositorio no tiene descargas ni likes. Se trata, por tanto, de un artefacto de investigacion opaco que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only; arquitectura del base: Llama 3.3 |
| Parametros totales | No disponible para el adaptador; el base declarado es de 70 000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el base Llama 3.3 soporta 128 000 tokens segun la documentacion de Meta |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo LoRA, segun la etiqueta `peft` y la libreria declarada (`peft` 0.15.1). Esto implica que congela los pesos del modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference` y entrena un conjunto reducido de matrices de bajo rango que se suman a las proyecciones del transformer. El tamano del repositorio (1,7 GB) es consistente con un adaptador de rango moderado sobre un modelo de 70B, aunque el autor no publica el rango, el alpha, las capas objetivo ni el dropout.

El nombre del repositorio contiene pistas sobre el procedimiento: `cond_start` (posible arranque condicional del entrenamiento), `ptonly` (probablemente "prompt only", entrenamiento restringido a tokens de prompt), `mixed_original_augmented_original` (mezcla de datos originales y aumentados con predominio de los originales) y `pkc_fda_approval` (dominio de aprobacion regulatoria de la FDA). No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni hiperparametros como la tasa de aprendizaje o el numero de epocas. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Llama 3.3 70B Instruct, en la medida en que el adaptador no los degrade.
- Ajuste especifico, presumiblemente, al dominio regulatorio farmaceutico (aprobaciones de la FDA), segun el nombre del repositorio; no verificado por el autor.
- Soporte de tool calling y function calling heredado del base Instruct, no confirmado para el adaptador.
- Capacidades de agente y razonamiento multi-paso heredadas del base, no confirmadas.
- Capacidades multilingues del base Llama 3.3 (oficialmente ocho idiomas), no confirmadas para el adaptador.
- No se declara soporte de vision, audio ni modo de razonamiento explicito en el adaptador.

## Casos de uso

- Extraccion de informacion regulatoria: el adaptador podria emplearse para resumir o clasificar documentos de aprobacion de la FDA, dado el dominio sugerido por el nombre del repositorio; requiere validacion manual porque el autor no documenta el conjunto de entrenamiento.
- Asistencia en la redaccion de secciones de expedientes regulatorios: con el base Llama 3.3 como motor y el adaptador como especializacion, se podria generar borradores de texto tecnico sujetos a revision por expertos.
- Clasificacion de solicitudes de aprobacion: si el ajuste se hizo sobre pares pregunta-respuesta del dominio, el adaptador podria etiquetar estados o categorias de solicitudes, siempre con supervision humana.
- Investigacion sobre ajuste fino eficiente: el artefacto sirve como caso de estudio de LoRA sobre Llama 3.3 70B con estrategias de arranque condicional y aumento de datos, para quienes estudian tecnicas de PEFT.
- Reproduccion de experimentos: util para replicar el pipeline `cond_start`/`ptonly`/`mixed_original_augmented_original` si se dispone del dataset original, aunque este no se publica.
- Evaluacion comparativa de adaptadores: como punto de referencia en estudios sobre degradacion o especializacion de LoRA en dominios muy acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: 1,7 GB en disco; en memoria, el adaptador ocupa una fraccion adicional sobre el base, tipicamente entre 1 y 3 GB segun rango y capas.
- VRAM para el base: el modelo Llama 3.3 70B en bf16 requiere aproximadamente 140 GB, por lo que necesita multiples GPU (por ejemplo, 2x H100 80GB o 4x A100 40GB) o cuantizacion agresiva.
- Cuantizacion: en 4 bits (GPTQ/AWQ/GGUF Q4) el base puede caber en una sola GPU de 48 GB (RTX 6000 Ada, A6000) o, con Q4_K_M en llama.cpp, en torno a 40-45 GB, lo que exige 2x RTX 4090 de 24 GB o una unica GPU de 48 GB.
- Consumer GPU: no cabe holgadamente en una RTX 4090 de 24 GB en bf16; en cuantizacion de 4 bits y con offload parcial podria intentarse, con latencia alta.
- Opciones de despliegue: vLLM y TGI no soportan adaptadores PEFT de forma universal en todas las versiones; PEFT + Transformers es la via directa. llama.cpp y Ollama no cargan adaptadores PEFT directamente salvo conversion a GGUF, que no se proporciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B) | 70B (base) + LoRA | 128k (base) | No disponible | Hugging Face, 0 descargas |
| Meta-Llama-3.3-70B-Instruct | 70B | 128k | Llama 3.3 Community License | Amplia, muy usado |
| Adaptadores LoRA genericos sobre Llama 3.1/3.3 | 70B (base) + LoRA | 128k (base) | Variable | Comunidad |
| Mistral Large 2 | 123B | 128k | Mistral Research/Commercial | API y pesos |

La comparacion con alternativas es dificil porque el adaptador no publica metricas ni documentacion. Frente al base sin ajustar, la unica diferencia es la especializacion de dominio, no verificada. Frente a otros adaptadores LoRA de la comunidad, la falta de model card y de ejemplos de uso lo situa en desventaja para adopcion.

## Limitaciones y advertencias

- Model card sin rellenar: todos los campos de la plantilla estan como `[More Information Needed]`, incluidos autor, licencia, idiomas y tipo de modelo.
- Licencia no declarada: no se puede asumir uso comercial; ademas, el base Llama 3.3 tiene su propia licencia comunitaria que impone restricciones adicionales.
- Sin datos de entrenamiento: se desconoce la composicion del dataset, el numero de tokens y si hubo filtrado de datos sensibles.
- Riesgo de alucinacion: heredado del base Llama 3.3; el ajuste en un dominio regulatorio puede aumentar la confianza aparente en afirmaciones no verificadas.
- Sesgos: no evaluados por el autor; los sesgos del base persisten y pueden amplificarse con el ajuste.
- Idiomas: no declarados; el comportamiento fuera del ingles no esta garantizado.
- Contexto: aunque el base soporta 128k, no se sabe si el adaptador se entreno con secuencias largas, lo que podria degradar el rendimiento en contextos extensos.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de calidad ni de reproducibilidad.
- Nombre del repositorio con hash aleatorio (`0ff3deb3`): indica un artefacto automatico o de experimento, no una release estable.
- Uso en produccion: desaconsejado sin evaluacion previa en el dominio objetivo y sin claridad sobre la licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/cond_start_ptonly_mixed_original_augmented_original_pkc_fda_approval-0ff3deb3
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Libreria PEFT: https://github.com/huggingface/peft
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
