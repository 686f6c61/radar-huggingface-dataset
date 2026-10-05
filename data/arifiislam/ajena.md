# ArifiIslam/Ajena

## Resumen

Ajena es un modelo base extendido derivado de Qwen/Qwen3.5-9B-Base, desarrollado por Islam Arifi (usuario ArifiIslam en HuggingFace), orientado especificamente a la generacion y manipulacion nativa de graficos vectoriales (SVG). El modelo no es un fine-tuning clasico: su principal modificacion consiste en la inyeccion de un vocabulario de tokens SVG nativos que cubren etiquetas y atributos habituales, comandos de trazado (`M`, `C`, `Z`, entre otros), enteros en el rango `[-128, 128]` y coordenadas subpixel con dos decimales (`.00` a `.99`). Los embeddings de estos tokens se inicializaron semanticamente a partir de las medias de los subwords correspondientes para estabilizar el entrenamiento posterior.

Con 8.955.900.416 parametros (aproximadamente 8,96 mil millones) y un repositorio de 17,9 GB en safetensors, Ajena se posiciona en el segmento de modelos de ~9B, un tamano que permite despliegue en GPUs de gama alta de consumo con cuantizacion. La relevancia actual del modelo radica en que aborda un cuello de botella concreto de los LLM generalistas: la representacion de coordenadas y comandos vectoriales, que en tokenizaciones BPE estandar se fragmentan de forma ineficiente y penalizan la precision geometrica.

El modelo sigue la metodologia de referencia descrita en arXiv:2510.11341 (InternSVG) y se distribuye bajo licencia Apache 2.0. Se trata de un modelo base "listo para fine-tuning", no de un modelo alineado para instrucciones, por lo que su uso directo en produccion requiere un ajuste previo con LoRA, QLoRA o fine-tuning completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (tag `qwen3_5_text`), especializado en texto/SVG |
| Parametros totales | 8.955.900.416 (aproximadamente 8,96B) |
| Parametros activos | no aplica (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ajena parte de la arquitectura de Qwen3.5-9B-Base, un transformer decoder-only denso de aproximadamente 8,96B de parametros, y la extiende mediante la inyeccion de un vocabulario especifico de tokens SVG. Segun la model card, la modificacion cubre etiquetas y atributos comunes de SVG, comandos de path (`M`, `C`, `Z`, etc.), valores enteros en el intervalo `[-128, 128]` y coordenadas subpixel con precision de dos decimales (`.00` a `.99`). Este ultimo punto es relevante porque los tokenizadores BPE convencionales dividen los numeros decimales en fragmentos inconsistentes, lo que degrada la fidelidad geometrica de la salida.

El proceso de adaptacion incluye la inicializacion semantica de los embeddings de los nuevos tokens a partir de las medias de los subwords equivalentes, una tecnica que busca evitar que los tokens recien anadidos partan de valores aleatorios y que el ajuste posterior converja de forma estable. El autor indica que el modelo queda preparado para fine-tuning mediante LoRA, QLoRA o fine-tuning completo sobre conjuntos de datos de graficos vectoriales; no se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO (es un modelo base). La metodologia de referencia es InternSVG (arXiv:2510.11341v4).

## Capacidades

- Generacion de codigo SVG: produce marcado vectorial con etiquetas, atributos y comandos de trazado representados de forma nativa en el vocabulario.
- Representacion precisa de coordenadas: los tokens dedicados a enteros `[-128, 128]` y a coordenadas subpixel (`.00` a `.99`) permiten emitir geometria con dos decimales sin fragmentacion excesiva.
- Base para manipulacion de vectores: el modelo esta disenado para tareas de generacion y edicion de SVG, no solo de sintesis desde cero.
- Generacion de texto general: al derivar de un modelo base de ~9B, conserva capacidades genericas de modelado de lenguaje en ingles.
- Punto de partida para fine-tuning: al ser un modelo base no alineado, no incorpora de serie modos de razonamiento, tool calling ni function calling documentados.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo instruido ni se documentan capacidades agenticas).
- Capacidades multilingues: limitadas al ingles segun los tags del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el tag `qwen3_5_text` indica una variante de texto.

## Casos de uso

- Generacion de iconografia y pictogramas vectoriales: el modelo puede producir el codigo SVG de iconos a partir de una descripcion textual, aprovechando los tokens nativos de path y coordenadas para obtener trazados con precision subpixel coherente.
- Diagramas tecnicos y esquemas: util para generar diagramas de flujo, esquemas de red o diagramas de bloques donde los comandos `M`, `C` y `Z` y las coordenadas decimales determinan la fidelidad visual del resultado.
- Text-to-vector en herramientas de diseno: integrado como motor de generacion en editores tipo Figma o Inkscape, permite convertir instrucciones en lenguaje natural en capas SVG editables.
- Normalizacion y refactorizacion de SVG existentes: al haber sido entrenado con vocabulario vectorial nativo, es adecuado como base para tareas de limpieza de rutas, unificacion de precision decimal y reescritura de atributos tras un fine-tuning especifico.
- Optimizacion de tamano de assets web: partiendo del modelo ajustado, se pueden generar versiones simplificadas de SVG con menos puntos de control y precision reducida, reduciendo el peso de los recursos en produccion.
- Generacion de assets en pipelines de CI/CD: al distribuirse en safetensors y bajo Apache 2.0, puede integrarse en flujos automatizados que generen o actualicen recursos vectoriales de un design system.
- Fine-tuning vertical para dominios concretos: su proposito declarado es servir de base para LoRA, QLoRA o full fine-tuning; casos tipicos serian cartografia, planos tecnicos, diagramas medicos o ilustracion de marca con estilos propios.
- Data augmentation para modelos de graficos: puede emplearse para sintetizar pares texto-SVG que alimenten otros modelos de vision o de generacion grafica, siempre que el modelo se ajuste primero para producir salidas fiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del autor no incluye metricas de evaluacion (ni MMLU, ni HumanEval, ni metricas especificas de SVG como similitud de rasterizado o distancia de edicion de paths), y el repositorio registra 0 descargas y 0 likes en el momento de la consulta. Tampoco se han encontrado resultados de evaluacion en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de los 8,96B de parametros; el autor no publica cifras oficiales):
  - bf16/fp16: en torno a 18-20 GB de VRAM, coherente con un repositorio de 17,9 GB de pesos.
  - int8 (8 bits): aproximadamente 9-11 GB.
  - 4 bits (NF4/GPTQ/AWQ, si se generan conversiones): aproximadamente 5-7 GB.
- GPUs recomendadas:
  - A100 40/80 GB, H100 80 GB: despliegue sin cuantizar y con margen para lotes grandes.
  - L40S, A6000 (48 GB), RTX 6000 Ada: adecuadas para bf16.
  - RTX 4090 / 3090 (24 GB): bf16 al limite, con contexto corto y lotes pequenos; cuantizacion de 8 o 4 bits para mayor comodidad.
  - RTX 4080, 4070 Ti Super (16 GB): viables con cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion. En 24 GB (4090/3090) es posible bf16 con contexto reducido; en 12-16 GB es necesario cuantizar.
- Opciones de despliegue: vLLM, TGI y Hugging Face Transformers para pesos safetensors; llama.cpp, Ollama y LM Studio requieren generar previamente una conversion a GGUF, ya que el repositorio no la incluye.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y dependen en gran medida del backend, la cuantizacion y la longitud de contexto, dato este ultimo que tampoco se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ajena (ArifiIslam/Ajena) | 8,96B | no disponible | SVG nativo con vocabulario inyectado | Apache 2.0 | HuggingFace, safetensors |
| Qwen/Qwen3.5-9B-Base | ~9B (no confirmado en la informacion) | no disponible | Modelo base generalista de texto | no disponible en la informacion | HuggingFace |
| Otros modelos especializados en SVG | no disponible | no disponible | no disponible | no disponible | no disponible |

Ajena se diferencia de su modelo base por el vocabulario vectorial inyectado, que es su unico factor diferencial documentado; no se han publicado comparativas de rendimiento entre ambos. No se dispone de datos verificados sobre modelos alternativos de la misma categoria (generacion de SVG nativa a nivel de tokenizador) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base, no instruido: no esta alineado para seguir instrucciones ni optimizado para conversacion; su uso directo produce continuaciones de texto, no respuestas a peticiones.
- Requiere fine-tuning para ser util en produccion: el autor lo presenta explicitamente como punto de partida para LoRA, QLoRA o ajuste completo. Sin ese paso, su utilidad practica en tareas de SVG es limitada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la mejora que aporta la inyeccion de tokens SVG frente al modelo base, ni de su calidad geometrica.
- Riesgo de alucinacion geometrica: los modelos de lenguaje generan coordenadas y comandos que pueden producir paths sintacticamente validos pero visualmente incorrectos o deformados; se requiere validacion con rasterizado previo a cualquier uso real.
- Posible desalineacion de embeddings: la inicializacion de los nuevos tokens a partir de medias de subwords es una heuristica; puede introducir sesgos iniciales que solo se corrigen con un volumen suficiente de datos de ajuste.
- Idioma: soporte declarado unicamente en ingles, lo que limita la generacion de documentacion, etiquetas o prompts en castellano.
- Contexto no documentado: se desconoce la ventana de contexto, un dato critico para decidir si el modelo puede procesar SVG largos o conversaciones multi-turno.
- Sin cuantizaciones oficiales: no se publican GGUF, AWQ ni GPTQ, por lo que el despliegue en entornos de bajos recursos exige conversiones propias no validadas por el autor.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero obliga a conservar el aviso de licencia y a no reclamar respaldo del autor; conviene revisar tambien las condiciones del modelo base Qwen3.5-9B-Base, de las que no se aporta detalle.
- Adopcion nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el modelo.
- Nota sobre la busqueda web: los resultados obtenidos en la busqueda no guardan relacion con el modelo (contenido no tecnico y no pertinente), por lo que no se han podido incorporar fuentes adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArifiIslam/Ajena
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Metodologia de referencia (InternSVG): https://arxiv.org/abs/2510.11341
