# SaFD-00/qwen2.5-vl-3b-ac-exp09-media-world-model-stage1-lora-epoch2

## Resumen

Este repositorio contiene un ajuste fino experimental del modelo multimodal Qwen2.5-VL-3B, publicado por el usuario SaFD-00 bajo el identificador `qwen2.5-vl-3b-ac-exp09-media-world-model-stage1-lora-epoch2`. El nombre del checkpoint indica un entrenamiento tipo LoRA (presumiblemente con LLaMA-Factory, etiqueta presente en el repositorio) en una primera etapa y segunda epoca, orientado a una linea de trabajo que el autor denomina "media world model". La model card es la plantilla automatica de HuggingFace sin ninguna seccion cumplimentada, por lo que no hay descripcion, dataset, hiperparametros ni evaluacion documentados.

Tecnicamente se apoya en la familia `qwen2_5_vl`, con pipeline `image-text-to-text` y pesos en `safetensors`. El recuento real de parametros en los ficheros de pesos es de 3.754.622.976 (3,75 mil millones) y el repositorio ocupa 7,5 GB, cifras compatibles con pesos completos en bf16 del modelo base y no con un adaptador LoRA aislado, aunque el nombre sugiere lo contrario. No se puede confirmar desde la informacion disponible si el adaptador se fusiono con el modelo base o si se subieron pesos completos.

Su relevancia es limitada y fundamentalmente documental: se trata de un checkpoint sin descargas (0), sin valoraciones (0), sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks. No es un modelo apto para produccion sin una validacion previa por parte de quien lo adopte, pero si puede servir como ejemplo de flujo de ajuste fino sobre Qwen2.5-VL-3B con LLaMA-Factory.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen2.5-VL: codificador visual ViT con atencion por ventanas y decodificador de lenguaje Qwen2.5 con MRoPE (Rotary Position Embedding multimodal) |
| Parametros totales | 3.754.622.976 (dato real de los ficheros safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la ficha del repositorio; el modelo base Qwen2.5-VL-3B-Instruct declara 32.768 tokens segun su documentacion publica, dato no verificado en este repositorio |
| Tipos de cuantizacion | No disponible: el repositorio solo contiene pesos safetensors sin cuantizar. No se publican variantes GGUF, AWQ ni GPTQ de este checkpoint |
| Idiomas soportados | No disponible en la ficha. El modelo base cubre varios idiomas (ingles, chino, espanol, entre otros), pero este ajuste no documenta ningun desglose |
| Licencia | No disponible: el repositorio no declara licencia. El modelo base Qwen2.5-VL-3B-Instruct se distribuye bajo Apache 2.0, pero esta adaptacion no explicita terminos propios |
| Formato de pesos | safetensors (tag del repositorio) |
| Modelo base declarado | Qwen2.5-VL-3B (deducido de la etiqueta `qwen2_5_vl` y del nombre del checkpoint; el autor no lo declara explicitamente) |
| Modalidad | Entrada imagen + texto, salida texto (`image-text-to-text`) |
| Libreria de inferencia | transformers |
| Herramienta de entrenamiento | LLaMA-Factory (tag `llama-factory`) |
| Tamano del repositorio | 7,5 GB |
| Descargas / valoraciones | 0 / 0 |
| Fecha de publicacion | 2026-09-18 (creacion), 2026-09-18 (ultima actualizacion), segun metadatos del Hub |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen2.5-VL, un modelo vision-lenguaje de tipo transformer: un codificador visual tipo ViT entrenado desde cero con atencion por ventanas, seguido de un decodificador de lenguaje Qwen2.5 denso. El componente visual procesa resoluciones nativas dinamicas y utiliza MRoPE, que alinea las posiciones espaciales y temporales con marcas de tiempo absolutas, lo que permite tratar imagenes y fotogramas de video dentro de la misma secuencia de tokens. El recuento de parametros de 3,75 mil millones y el tamano de 7,5 GB del repositorio son coherentes con pesos completos en bf16.

En cuanto al entrenamiento, lo unico verificable es la nomenclatura del checkpoint: `stage1`, `lora`, `epoch2` y la etiqueta `llama-factory`, que apuntan a un ajuste fino con LoRA en una primera etapa y segunda epoca sobre un dataset no identificado. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, ni sobre hiperparametros de entrenamiento (tasa de aprendizaje, rango del adaptador, precision). Tampoco se documenta ninguna innovacion tecnica propia de este ajuste; la innovacion relevante reside en el modelo base (resolucion nativa dinamica, MRoPE, grounding con coordenadas absolutas), no en este checkpoint.

## Capacidades

Al no existir evaluacion ni documentacion del ajuste, las capacidades que se enumeran son las del modelo base Qwen2.5-VL-3B y deben considerarse potenciales, no verificadas en este repositorio:

- Generacion de texto conversacional a partir de entradas de imagen y texto (`image-text-to-text`).
- Comprension de imagenes: descripcion de escenas, respuesta a preguntas visuales, lectura de graficos y diagramas.
- OCR y analisis de documentos: extraccion de texto en imagenes, tablas y formularios, con soporte de resolucion dinamica para imagenes de alta dimension.
- Grounding visual: localizacion de objetos mediante cuadros delimitadores con coordenadas absolutas (capacidad del modelo base, no confirmada tras el ajuste).
- Comprension de video: procesamiento de secuencias de fotogramas apoyado en MRoPE con alineacion temporal (capacidad del modelo base, sensible a la perdida de capacidades tras un ajuste fino no documentado).
- Soporte de tool calling / function calling: el modelo base Qwen2.5-VL incorpora plantillas para llamadas a funciones; se desconoce si el ajuste las preserva.
- Razonamiento multi-paso y uso como componente de agentes: herencia del decodificador Qwen2.5, sin garantia tras el ajuste.
- Capacidades multilingues: el modelo base cubre decenas de idiomas; este checkpoint no documenta idiomas soportados.

## Casos de uso

Los siguientes escenarios son aplicables como punto de partida, siempre con la advertencia de que el checkpoint no esta validado y que su comportamiento real puede diferir del modelo base:

- Prototipado de pipelines vision-lenguaje: usar el checkpoint como sustituto directo del modelo base en un prototipo existente de transformers para comprobar si el ajuste mejora una tarea concreta antes de invertir en infraestructura.
- Extraccion de informacion de documentos: procesar facturas, albaranes o formularios escaneados con OCR y serializar los campos en JSON, aprovechando la resolucion nativa dinamica del codificador visual para documentos densos.
- Catalogacion de archivos de imagen: generar descripciones y etiquetas para bibliotecas de imagenes o fototecas, con revision humana posterior para compensar la tasa de alucinacion propia de un modelo de 3B.
- Asistencia en accesibilidad: producir descripciones alternativas de imagenes para lectores de pantalla en aplicaciones editoriales o educativas.
- Anotacion asistida de datasets: preetiquetar pares imagen-texto que despues se corrigen manualmente, reduciendo el coste de construir corpus multimodales propios.
- Base para un ajuste fino de dominio: dado que los pesos son safetensors estandar de la familia Qwen2.5-VL, el checkpoint puede servir como inicializacion para un LoRA adicional con LLaMA-Factory sobre un dataset propio y verificable.
- Analisis de fotogramas de video en tareas de moderacion o resumen: aplicar el modelo a muestras de fotogramas clave, asumiendo que no hay validacion de rendimiento temporal en este checkpoint.
- Evaluacion comparativa de experimentos: utilizarlo como referencia dentro de una bateria de checkpoints de la misma serie (`ac-exp09`) para medir el efecto de distintas etapas y epocas de entrenamiento sobre una misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es la plantilla automatica de HuggingFace y todas sus secciones de evaluacion aparecen como "[More Information Needed]". No hay datos de MMLU, HumanEval, GSM8K, MMMU, DocVQA, ChartQA ni de ninguna otra prueba para este checkpoint, ni comparaciones con el modelo base.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parametros (3,75 mil millones) y del tamano de pesos publicado (7,5 GB en bf16). No son cifras medidas sobre este checkpoint concreto:

- VRAM en bf16/fp16: los pesos ocupan unos 7,5 GB; sumando el codificador visual, imagenes de resolucion alta y la cache KV, el consumo realista se situa en 10-12 GB.
- VRAM en int8: aproximadamente 4-5 GB de pesos, con un total estimado de 6-8 GB en funcion del contexto.
- VRAM en 4 bits (GGUF Q4): aproximadamente 2,5-3 GB de pesos, con un total estimado de 4-5 GB para contextos moderados.
- GPU de centro de datos: A100 40 GB, H100 80 GB o L40S/A6000 48 GB para servir varias peticiones concurrentes con vLLM o TGI.
- GPU de consumo: cabe completo en bf16 en RTX 4090 (24 GB) y RTX 4080/4060 Ti (16 GB) con margen; en RTX 3060 de 12 GB es viable pero ajustado y depende de la resolucion de imagen y del contexto. En tarjetas de 8 GB solo es razonable con cuantizacion a 4 bits, que no se distribuye en este repositorio.
- Memoria unificada: equipos Apple Silicon con 16 GB o mas pueden ejecutar la version cuantizada a 4 bits; 32 GB permiten trabajar en bf16.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `endpoints_compatible`), vLLM y SGLang para Qwen2.5-VL, llama.cpp/Ollama previa conversion a GGUF con su fichero `mmproj`, y LLaMA-Factory para reentrenamiento o evaluacion.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad y validacion |
|---|---|---|---|---|
| Este checkpoint (ajuste de Qwen2.5-VL-3B) | 3,75 mil millones | No disponible (modelo base: 32.768 tokens) | No declarada | 0 descargas, 0 valoraciones, sin benchmarks ni model card |
| Qwen2.5-VL-3B-Instruct (modelo base, Alibaba Qwen) | ~3,75 mil millones | 32.768 tokens segun documentacion publica del modelo base | Apache 2.0 (segun la informacion publica del modelo base, no verificada aqui) | Ampliamente distribuido, con informe tecnico y evaluaciones publicadas |
| Qwen2.5-VL-7B-Instruct | ~8,3 mil millones | Superior al modelo de 3B (cifra exacta no verificada en esta ficha) | Apache 2.0 (segun la informacion publica del modelo base) | Muy usado como referencia en tareas de documento y video; requiere mas VRAM |
| SmolVLM2-2.2B (HuggingFace) | ~2,2 mil millones | No verificado | Apache 2.0 (segun la informacion publica del modelo) | Alternativa ligera para vision-lenguaje en hardware limitado |

No se dispone de datos de rendimiento comparativo para este checkpoint, por lo que la comparacion se limita a parametros, contexto declarado y condiciones de licencia y disponibilidad.

## Limitaciones y advertencias

- Model card vacia: la ficha del repositorio es la plantilla automatica de HuggingFace, sin datos de entrenamiento, uso previsto, limitaciones ni procedencia del dataset.
- Licencia no declarada: al no especificarse terminos, el uso comercial es juridicamente incierto. La licencia Apache 2.0 del modelo base no se hereda automaticamente de forma explicita en este repositorio.
- Sin validacion de la comunidad: 0 descargas y 0 valoraciones implican que no existe evidencia externa de funcionamiento correcto, ni informes de fallos.
- Sin benchmarks: no hay ninguna medicion que permita afirmar que el ajuste mejora al modelo base en tarea alguna; es posible que lo empeore.
- Riesgo de olvido catastrofico: un ajuste LoRA en una primera etapa y segunda epoca sobre un dataset desconocido puede degradar capacidades generales del modelo base (conversacion, OCR, multilingue, tool calling) sin que exista evaluacion que lo detecte.
- Riesgo de alucinacion: los modelos vision-lenguaje de ~3B tienden a inventar texto en imagenes poco nitidas y a fallar en conteo de objetos, relaciones espaciales y lectura de tablas densas.
- Ambiguedad de formato: aunque el nombre indica un adaptador LoRA, el recuento de parametros y el tamano del repositorio corresponden a pesos completos en bf16. Conviene verificar la configuracion antes de cargarlo con `transformers` o de fusionar adaptadores.
- Falta de trazabilidad del termino "media world model": el nombre apunta a una linea experimental, pero no hay documentacion que explique objetivo, datos ni criterio de exito.
- Contexto e idiomas no confirmados: la ventana efectiva y la cobertura linguistica de este checkpoint no estan verificadas, por lo que no deben asumirse en produccion.
- Idoneidad para produccion: dadas las condiciones anteriores, no se recomienda desplegarlo en entornos productivos sin una bateria de evaluacion propia sobre el dominio objetivo y una revision legal de la licencia.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp09-media-world-model-stage1-lora-epoch2
- Modelo base Qwen2.5-VL-3B-Instruct (Alibaba Qwen): https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Informe tecnico de Qwen2.5-VL: https://arxiv.org/abs/2502.13923
- LLaMA-Factory (herramienta de ajuste fino indicada en las etiquetas del repositorio): https://github.com/hiyouga/LLaMA-Factory
- Documentacion de text-generation-inference (tag `endpoints_compatible`): https://github.com/huggingface/text-generation-inference
- Lacoste et al. (2019), estimacion de emisiones, referencia citada en la plantilla de la model card: https://arxiv.org/abs/1910.09700
- Busqueda web realizada: no se han encontrado enlaces relevantes sobre este modelo; los resultados obtenidos corresponden a documentacion de la funcion QUERY de Google Sheets y no guardan relacion con el checkpoint.
