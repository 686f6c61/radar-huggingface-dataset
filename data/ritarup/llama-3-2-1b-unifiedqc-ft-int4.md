# ritarup/Llama-3.2-1B-UnifiedQC-FT-INT4

## Resumen

Llama-3.2-1B-UnifiedQC-FT-INT4 es una variante cuantizada del modelo Llama 3.2 1B de Meta, publicada por el usuario ritarup en Hugging Face. El identificador y las etiquetas del repositorio indican que se trata de una version sometida a cuantizacion unificada ("UnifiedQC"), ajuste fino ("FT") y conversion a INT4, empaquetada en formato ExecuTorch para su despliegue en dispositivos de borde. El repositorio tiene un tamano de 0,8 GB, coherente con un modelo de 1.000 millones de parametros almacenado en 4 bits.

El modelo base, Llama 3.2 1B, es un transformer decoder-only de Meta disenado para inferencia eficiente en local, con soporte multilingue declarado y una ventana de contexto de 128.000 tokens en su version original. Esta variante concreta no documenta en su model card ningun detalle sobre el proceso de cuantizacion, los datos de ajuste fino ni los resultados obtenidos, por lo que la mayor parte de las especificaciones tecnicas no estan disponibles y deben tratarse como no verificadas.

La relevancia de esta publicacion es limitada pero concreta: ofrece un artefacto listo para ExecuTorch, el runtime de Meta para ejecutar modelos en movil y dispositivos embebidos, lo que facilita probar Llama 3.2 1B en Android, iOS o hardware con recursos muy restringidos. Sin descargas ni likes en el momento de la consulta, se trata de un experimento personal sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.2 1B; no detallada en el repo) |
| Parametros totales | 1.000 millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en el repo; el modelo base Llama 3.2 1B declara 128.000 tokens |
| Tipos de cuantizacion | INT4 (segun el nombre del modelo); no se documenta el esquema exacto (por grupo, simetrico/asimetrico) |
| Idiomas soportados | no disponible en el repo; el modelo base declara soporte multilingue (8 idiomas oficiales) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | ExecuTorch (etiqueta `executorch`); no se confirma presencia de safetensors ni GGUF |
| Tamano del repositorio | 0,8 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Llama 3.2 1B, un transformer decoder-only con atencion por grupos (GQA) y tokenizador BPE de 128.000 entradas, entrenado por Meta sobre datos multilingues. El proceso de entrenamiento original incluye preentrenamiento masivo seguido de ajuste con RLHF y DPO para alineamiento. Esta variante anade, segun su nombre, una fase de ajuste fino posterior ("FT") y una cuantizacion unificada a INT4 ("UnifiedQC"), pero el autor no publica ni la receta de cuantizacion, ni el dataset de ajuste fino, ni el numero de tokens empleados, ni la metodologia de calibracion.

El unico dato tecnico verificable es el formato de salida: ExecuTorch, el stack de Meta para exportar y ejecutar modelos PyTorch en dispositivos de borde mediante un runtime ligero y un formato de archivo `.pte`. No se documenta si la exportacion incluye kernels especificos para CPU ARM, DSP o NPU, ni si se ha validado la inferencia en algun dispositivo concreto.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Llama 3.2 1B.
- Razonamiento basico y respuesta a instrucciones; el ajuste fino adicional podria reforzar el seguimiento de instrucciones, aunque no se documenta.
- Capacidades multilingues segun el modelo base (no verificadas en esta variante).
- Ejecucion en dispositivos de borde mediante el runtime ExecuTorch (capacidad del formato, no del modelo en si).
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, vision ni audio en esta variante.
- No se documenta ninguna capacidad especial anadida por el ajuste fino.

## Casos de uso

- Prototipado en movil con ExecuTorch: el artefacto esta empaquetado para el runtime de Meta, lo que permite cargarlo en una app Android o iOS y medir latencia real de un LLM de 1B en INT4 sin pasar por un servidor.
- Asistentes offline en dispositivos sin conectividad: al caber en 0,8 GB, el modelo puede residir en almacenamiento local de un telefono o una Raspberry Pi y ofrecer generacion de texto sin depender de la nube.
- Clasificacion y etiquetado de texto en el dispositivo: tareas de extraccion de entidades, categorizacion de mensajes o resumenes cortos donde la privacidad exige que los datos no salgan del terminal.
- Autocompletado y sugerencias en aplicaciones de escritorio: integracion en editores o formularios para generar borradores breves con baja latencia y sin coste de API.
- Evaluacion de tecnicas de cuantizacion: util como punto de partida para comparar la calidad de un Llama 3.2 1B en INT4 frente al modelo original en FP16 en tareas concretas.
- Educacion e investigacion sobre despliegue en el borde: sirve para estudiar el flujo de exportacion a ExecuTorch, el particionado de operadores y el rendimiento en hardware de bajos recursos.
- Filtrado previo en pipelines hibridos: usar el modelo local para descartar o preclasificar entradas antes de enviar solo los casos complejos a un modelo mayor en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de perplexity, MMLU, HumanEval ni evaluaciones de degradacion por cuantizacion, y tampoco se han encontrado resultados independientes para este repositorio concreto.

## Requisitos de hardware

- VRAM/RAM estimada: en torno a 0,8-1,2 GB para los pesos en INT4, mas el overhead del runtime ExecuTorch y del contexto KV; con contexto largo la memoria del KV cache crece de forma proporcional.
- GPU: no aplica como requisito principal; el formato ExecuTorch esta orientado a CPU, DSP y NPU de dispositivos moviles y embebidos.
- Cabe en GPU de consumo: si, en cualquier GPU con 2 GB o mas de VRAM si se dispone de un camino de ejecucion compatible; en la practica el destino natural es CPU movil.
- Despliegue: ExecuTorch (runtime nativo para Android, iOS y Linux embebido). No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el repositorio no incluye pesos en safetensors ni GGUF.
- Latencia y throughput: no disponibles; dependen del SoC, del numero de hilos y de la longitud de contexto, y el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ritarup/Llama-3.2-1B-UnifiedQC-FT-INT4 | ~1B | no disponible (base: 128k) | ExecuTorch INT4 | llama3.2 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-1B | ~1B | 128k | safetensors | llama3.2 | Hugging Face, oficial de Meta |
| meta-llama/Llama-3.2-1B-Instruct | ~1B | 128k | safetensors | llama3.2 | Hugging Face, oficial de Meta |
| Variantes GGUF de Llama 3.2 1B (comunidad) | ~1B | 128k | GGUF | llama3.2 | Multiples repos comunitarios |

La diferencia principal frente al modelo oficial y sus variantes GGUF es el formato: esta version apunta a ExecuTorch y no a llama.cpp ni a transformers, lo que restringe su uso a ese ecosistema. No hay datos de rendimiento que permitan comparar calidad frente al modelo base.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe el proceso de cuantizacion, el dataset de ajuste fino ni los hiperparametros, lo que impide reproducir o auditar el artefacto.
- Riesgo de degradacion por cuantizacion INT4: sin metricas publicadas no se puede estimar la perdida de calidad frente al modelo en FP16, especialmente en matematicas y codigo.
- Riesgo de alucinacion: inherente a un modelo de 1B parametros, agravado por el ajuste fino no documentado.
- Sesgos: heredados de los datos de preentrenamiento de Llama 3.2 y de cualquier dataset usado en el ajuste fino, que se desconoce.
- Licencia Llama 3.2 Community License: permite uso comercial con restricciones (limite de 700 millones de usuarios mensuales, obligacion de atribucion y de nombrar el modelo "Llama"), pero debe revisarse antes de produccion.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia de que el artefacto funcione correctamente en ningun dispositivo.
- Compatibilidad limitada: al no publicarse safetensors ni GGUF, no se puede usar directamente con transformers, llama.cpp, vLLM u Ollama.
- Idiomas no verificados: el soporte multilingue del modelo base no esta confirmado tras el ajuste fino.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ritarup/Llama-3.2-1B-UnifiedQC-FT-INT4
- Modelo base oficial: https://huggingface.co/meta-llama/Llama-3.2-1B
- Coleccion Llama 3.2 de Meta: https://huggingface.co/collections/meta-llama/llama-32
