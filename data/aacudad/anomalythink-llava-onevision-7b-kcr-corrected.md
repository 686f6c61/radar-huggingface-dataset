# aacudad/AnomalyThink-LLaVA-OneVision-7B-KCR-corrected

## Resumen

AnomalyThink-LLaVA-OneVision-7B-KCR-corrected es un modelo vision-lenguaje (image-text-to-text) especializado en deteccion de anomalias industriales, desarrollado por A. Acudad (aacudad) en el marco de su tesis de master en la Delft University of Technology. Se construye sobre llava-hf/llava-onevision-qwen2-7b-si-hf, es decir, la arquitectura LLaVA-OneVision en su variante de imagen unica (SI) con un modelo de lenguaje Qwen2-7B y una torre de vision SigLIP, y anade 8.030.807.584 parametros totales en formato safetensors (16,1 GB de repositorio).

El modelo es la replicacion del metodo Keep-Correct-Revise (KCR) sobre este backbone, en su version de corpus corregido. El objetivo es resolver un problema concreto de la deteccion de anomalias industriales: pasar de una clasificacion binaria opaca a una salida verificable con veredicto parseable y trazabilidad de razonamiento, evaluada con balanced accuracy y scoring estricto sobre los subconjuntos DS-MVTec y VisA del benchmark MMAD.

Su relevancia actual radica en dos factores. Primero, ofrece una comparacion de un solo factor frente al modelo KCR basado en Qwen2.5-VL, al corregir el corpus (las 6.000 imagenes dentro del split de SFT y 3.000/3.000 por veredicto, en lugar de la seleccion por nombre de carpeta que dejaba el corpus en un 45,0 % de anomalos). Segundo, publica los ficheros de evaluacion por muestra junto a los pesos, lo que permite auditar cada resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-OneVision (variante single-image): torre de vision SigLIP congelada + projector + modelo de lenguaje Qwen2-7B |
| Parametros totales | 8.030.807.584 (8,03 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no declarada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors sin cuantizaciones) |
| Idiomas soportados | no disponible (no declarados; el modelo esta entrenado y evaluado en ingles sobre MMAD) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | llava-hf/llava-onevision-qwen2-7b-si-hf |
| Tarea (pipeline) | image-text-to-text |
| Dataset de entrenamiento | aacudad/AnomalyThink (fichero llava_kcr/sft_llava_C_corrected_train.json) |
| Envergadura del repo | 16,1 GB |
| Fecha de creacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaVA-OneVision en configuracion single-image (SI). La torre de vision SigLIP permanece congelada durante el ajuste; unicamente se entrenan el projector y el modelo de lenguaje Qwen2-7B. Se carga con `transformers` (versiones 4.51 a 4.57) como `LlavaOnevisionForConditionalGeneration`. Un detalle operativo relevante es que este backbone no atiende al turno de sistema, por lo que la instruccion debe colocarse en el turno de usuario (por ejemplo, anteponiendo "Please answer by yes or no." a la pregunta).

El entrenamiento es un fine-tuning supervisado (SFT) desde el modelo base, con un corpus de 6.000 trazas construido a partir de los propios rollouts de SFT y GRPO de este backbone (k = 8 a temperatura 0,7), juzgados y reparados por Gemini-3-Flash. El corpus esta exactamente equilibrado: 3.000/3.000 por veredicto, y todas las imagenes estan dentro del split de SFT. La receta usa learning rate 1e-5 con scheduler coseno, batch efectivo 32, DeepSpeed ZeRO-3 con offload del optimizador y 4 epocas. El checkpoint publicado corresponde a la epoca 2 (paso 376). La innovacion metodologica es el enrutado Keep-Correct-Revise aplicado al corpus, que corrige dos defectos de la primera version (procedencia de imagenes fuera del split y balanceo por nombre de carpeta en lugar de por veredicto), habilitando asi una comparacion de un solo factor frente al modelo KCR basado en Qwen2.5-VL.

## Capacidades

- Clasificacion binaria de anomalias sobre imagen industrial: genera un veredicto si/no encapsulado en una etiqueta `<answer>` parseable.
- Razonamiento multimodal: el entrenamiento incorpora trazas de razonamiento, lo que produce justificaciones antes del veredicto final.
- Deteccion de anomalias industriales en los dominios de MVTec-AD (subconjunto DS-MVTec) y VisA, con 1.670 y 2.141 imagenes respectivamente en la evaluacion del autor.
- Generalizacion a productos vistos con imagenes no vistas: 84,03 de balanced accuracy en el split held-out Real-IAD (4.236 imagenes no vistas de productos ya vistos).
- Procesamiento de imagen unica por prompt: el protocolo de evaluacion usa una imagen por prompt con un limite de 262.144 pixeles.
- Generacion conversacional (tag conversational), con plantilla de prompt fija y mensaje de sistema de una linea en el protocolo de evaluacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito separado: no disponible; el razonamiento forma parte de la generacion estandar.
- Vision mas alla de inspeccion industrial, audio o video: no evaluado en la informacion proporcionada.

## Casos de uso

- Inspeccion visual en linea de produccion: el modelo recibe una imagen de la pieza y devuelve un veredicto si/no parseable. Su balanced accuracy de 87,32 en DS-MVTec lo hace apto como primera etapa de filtrado, con el limite de 262.144 pixeles por imagen.
- Control de calidad en manufactura con productos ya conocidos: sobre el split Real-IAD de imagenes no vistas de productos vistos obtiene 84,03, lo que permite desplegarlo en lineas donde el catalogo de referencias es estable y solo cambian las capturas.
- Auditoria y explicabilidad de decisiones: al generar trazas de razonamiento antes del veredicto, permite reconstruir por que se marco una pieza como defectuosa, algo exigido en entornos con trazabilidad de calidad.
- Prefiltrado para revision humana: el modelo reduce el volumen de imagenes que llegan a un operador, derivando solo los casos con veredicto positivo o con salida no parseable (13 de 2.141 generaciones VisA en su evaluacion no produjeron veredicto parseable y se contabilizaron como error).
- Inferencia por lotes sobre grandes volumenes: la evaluacion del autor se ejecuto con vLLM, greedy decoding y un maximo de 1.024 tokens nuevos, configuracion replicable en pipelines de inspeccion masiva.
- Investigacion en VLM para deteccion de anomalias: sirve como referencia de backbone LLaVA-OneVision en estudios comparativos frente a Qwen2.5-VL, con ficheros de evaluacion por muestra (`eval_*.json`) publicados junto a los pesos para reproducir cada metrica.
- Generacion de datos sinteticos de entrenamiento en el dominio industrial: al ser el resultado de un pipeline SFT + GRPO con juicio y reparacion por Gemini-3-Flash, su corpus y metodologia sirven de base para construir datasets etiquetados de forma verificada.
- Validacion de metodos de alineacion (GRPO/KCR): util como checkpoint intermedio para medir el efecto de tecnicas de refuerzo sobre un backbone concreto en tareas de clasificacion visual binaria.

## Benchmarks y rendimiento

Subconjuntos de MMAD, balanced accuracy con scoring estricto (una generacion sin `<answer>` parseable cuenta como incorrecta). Un unico harness para todas las filas: una imagen por prompt, el prompt de entrenamiento con el mensaje de sistema "Please answer by yes or no", greedy decoding, maximo 1.024 tokens nuevos, imagenes limitadas a 262.144 pixeles, generacion con vLLM.

| Modelo | DS-MVTec | VisA |
|---|---|---|
| LLaVA-OneVision-7B-SI base | 75,66 | 53,80 |
| AnomalyThink LLaVA SFT (6K trazas Gemini) | 85,91 | 68,26 |
| AnomalyThink LLaVA SFT + GRPO | 87,66 | 72,38 |
| AnomalyThink LLaVA KCR, primera version | 88,45 | 74,25 |
| Este modelo, version corregida, epoca 2 | 87,32 | 72,65 |
| IAD-R1 checkpoint publicado (Qwen2.5-VL-7B) | 81,92 | 71,34 |

Evolucion por epoca de este checkpoint (DS-MVTec / VisA): 84,35 / 71,36 (epoca 1), 87,32 / 72,65 (epoca 2), 86,96 / 73,57 (epoca 3), 86,60 / 74,29 (epoca 4). En el split held-out Real-IAD (4.236 imagenes no vistas de productos vistos) obtiene 84,03, la fila mas alta de esa comparativa.

Nota de contaminacion declarada por el autor: el mixture de instrucciones publico de LLaVA-OneVision contiene entradas que nombran MVTec-AD, por lo que todas las cifras de DS-MVTec sobre este backbone arrastran una posible exposicion en preentrenamiento; VisA no tiene tales entradas, y las afirmaciones que dependen de este backbone se hacen sobre VisA. En la evaluacion de VisA, 13 de las 2.141 generaciones de este checkpoint no contienen veredicto parseable y se contabilizan como incorrectas.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 16,1 GB solo para los pesos (tamano del repositorio), mas cache KV y tokens de imagen. Con el limite de 262.144 pixeles por imagen, la huella efectiva en inferencia se situa por encima de los 20 GB.
- VRAM estimada en 8 bits: del orden de 8-9 GB de pesos, mas cache y tokens de vision. Estimacion a partir del numero de parametros; no hay cuantizaciones publicadas en el repositorio.
- VRAM estimada en 4 bits: del orden de 4,5-5 GB de pesos, mas cache y tokens de vision. Estimacion, no dato publicado.
- GPU de datacenter: A100 40/80 GB y H100 son opciones holgadas para bf16 con lotes moderados. El autor no especifica la GPU empleada en la evaluacion.
- GPU de consumidor: una RTX 3090 o RTX 4090 con 24 GB permite bf16 en el limite, con una sola imagen por prompt y control del numero de tokens generados. Con cuantizacion de 4 bits podria caber en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070), siempre que el usuario genere la cuantizacion por su cuenta.
- Opciones de despliegue: `transformers` 4.51-4.57 como `LlavaOnevisionForConditionalGeneration` (ruta validada por el autor); vLLM, usado por el autor para generar los resultados de los benchmarks. Soporte en TGI, llama.cpp u Ollama: no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. La informacion proporcionada solo indica configuracion de decodificacion (greedy, maximo 1.024 tokens nuevos) y el limite de resolucion de imagen.
- Almacenamiento: 16,1 GB para los pesos en safetensors, mas los ficheros de evaluacion `eval_*.json` incluidos en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | DS-MVTec | VisA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AnomalyThink-LLaVA-OneVision-7B-KCR-corrected (este modelo) | 8,03 B | no disponible | 87,32 | 72,65 | apache-2.0 | pesos safetensors en HuggingFace, 0 descargas |
| AnomalyThink LLaVA KCR, primera version | mismo backbone (8,03 B) | no disponible | 88,45 | 74,25 | apache-2.0 | publicada en HuggingFace |
| AnomalyThink LLaVA SFT + GRPO | mismo backbone | no disponible | 87,66 | 72,38 | no disponible | no disponible |
| IAD-R1 checkpoint publicado (Qwen2.5-VL-7B) | 7 B (Qwen2.5-VL) | no disponible | 81,92 | 71,34 | no disponible | checkpoint publicado |
| LLaVA-OneVision-7B-SI base | 8,03 B | no disponible | 75,66 | 53,80 | apache-2.0 | llava-hf/llava-onevision-qwen2-7b-si-hf |

La comparacion principal es de un solo factor frente al modelo KCR basado en Qwen2.5-VL (IAD-R1), ya que el corpus corregido se equilibro por veredicto y se restringio al split de SFT precisamente para aislar esa variable.

## Limitaciones y advertencias

- El backbone no atiende al turno de sistema. La instruccion debe ir en el turno de usuario; ignorar esto degrada el formato de salida.
- Contaminacion potencial en DS-MVTec: el mixture de instrucciones de LLaVA-OneVision contiene entradas que nombran MVTec-AD, por lo que las cifras de DS-MVTec de este backbone no pueden considerarse libres de exposicion en preentrenamiento. Las afirmaciones metodologicas del autor se apoyan en VisA.
- Salida no parseable: en la evaluacion de VisA, 13 de 2.141 generaciones no contenian veredicto parseable y se contaron como incorrectas. En produccion esto implica necesidad de manejo de errores y reintentos.
- Formato de salida rigido: el modelo espera y devuelve un veredicto encapsulado en `<answer>`, con scoring estricto. Cualquier cambio de plantilla exige revalidar el comportamiento.
- Alcance limitado: esta entrenado y evaluado exclusivamente en deteccion de anomalias industriales sobre DS-MVTec, VisA y Real-IAD. No hay evidencia publicada de su comportamiento en otras tareas visuales o de texto general.
- Idiomas no declarados: la evaluacion y el prompt estan en ingles. El comportamiento en castellano no esta documentado.
- Sesgos: no documentados en la informacion proporcionada. El corpus es de dominio industrial, lo que puede trasladar sesgos de las categorias de producto presentes en MMAD.
- Licencia: apache-2.0, derivada de llava-hf/llava-onevision-qwen2-7b-si-hf, por lo que se permite uso comercial, sujeto a las condiciones de la licencia Apache 2.0 del modelo base.
- Version del runtime: requiere `transformers` entre 4.51 y 4.57.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin cuantizaciones publicadas ni informes de terceros.
- La version corregida rinde por debajo de la primera version en DS-MVTec (87,32 frente a 88,45) y en VisA (72,65 frente a 74,25); la justificacion del autor es de rigor metodologico en la comparacion, no de mejora de metrica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aacudad/AnomalyThink-LLaVA-OneVision-7B-KCR-corrected
- Modelo base: https://huggingface.co/llava-hf/llava-onevision-qwen2-7b-si-hf
- Dataset: https://huggingface.co/aacudad/AnomalyThink
- Primera version del modelo (build no corregido): https://huggingface.co/aacudad/AnomalyThink-LLaVA-OneVision-7B-KCR
- Tesis (TU Delft): https://resolver.tudelft.nl/uuid:65c62420-79c0-447f-b095-7fb11d4474fc
- Codigo y ficheros de evaluacion: https://github.com/aacudad/IAD-VLMs
- Cita: Acudad, A. (2026). Reasoning-Enhanced Vision-Language Models for Explainable Industrial Anomaly Detection. Master's thesis, Delft University of Technology.
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las consultas devolvieron unicamente resultados en chino sobre analisis literario de una obra clasica, sin relacion con este modelo ni con deteccion de anomalias industriales.
