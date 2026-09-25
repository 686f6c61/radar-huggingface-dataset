# BossCoder2025/apparely-fashion-siglip-coreml

## Resumen

Apparely FashionSigLIP (Core ML) es la torre de imagen del modelo SigLIP de moda Marqo/marqo-fashionSigLIP convertida a un programa Core ML (`mlprogram`) para su ejecucion en dispositivo dentro de la aplicacion de armario Apparely / PrismStyle. Se trata, por tanto, de un conversor de despliegue y no de un modelo entrenado desde cero: mantiene la arquitectura ViT-B/16 de SigLIP y expone un contrato de entrada/salida congelado entre versiones (imagen RGB de 224×224 y vector de embedding Float32 de dimension 768, normalizado L2).

La relevancia de esta publicacion es de tipo practico: permite ejecutar un encoder de imagen especializado en moda directamente en hardware Apple (Neural Engine, GPU o CPU) sin depender de la nube, con dos variantes de peso (fp16 e int8 palettizada) y artefactos auxiliares para validacion de paridad, clasificacion zero-shot y compatibilidad de conjuntos. El repositorio ocupa 0,4 GB y no registra descargas ni likes en el momento de la consulta, por lo que carece de validacion externa.

El modelo resuelve el problema de obtener representaciones visuales de prendas de forma privada y de baja latencia en aplicaciones iOS/macOS. No es un modelo generativo ni de lenguaje: solo produce embeddings de imagen, y su utilidad depende de que se empareje con la torre de texto correspondiente o con los bancos de prompts y cabezas de clasificacion incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP (encoder de imagen ViT-B/16), convertido a Core ML `mlprogram` |
| Parametros totales | no disponible en la model card (la torre de imagen ViT-B/16 estandar ronda los 86 M de parametros; cifra no confirmada por el autor) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de imagen 224×224 RGB) |
| Tipos de cuantizacion | fp16 (`FashionSigLIP.mlpackage.zip`) e int8 con palettizacion de 8 bits (`FashionSigLIP-int8.mlpackage.zip`) |
| Idiomas soportados | no disponible (no aplica al encoder de imagen; los bancos de prompts estan en JSON y no se especifica idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML `mlpackage` comprimido en zip; `parity_reference.npz` (20 entradas + salidas fp32) y cabezas/bancos en JSON |
| Dimension del embedding | 768 (Float32, `[1, D]`, normalizado L2) |
| Entrada | `image`: RGB 224×224; la normalizacion `pixel/127.5 − 1` esta integrada en el grafo, el center-crop se hace aguas arriba |
| Modelo base | Marqo/marqo-fashionSigLIP |
| Tamano del repositorio | 0,4 GB |
| Metadatos incluidos | `backbone_version`, `embedding_dim`, `source_model`, `license` |

## Arquitectura y entrenamiento

La arquitectura subyacente es SigLIP (Sigmoid Loss for Language-Image Pre-training), un codificador dual tipo CLIP que sustituye la perdida softmax contrastiva por una perdida sigmoidea por pares. En esta publicacion solo se distribuye la torre de imagen, un Vision Transformer con parches de 16×16 (ViT-B/16) que opera sobre entradas de 224×224 y proyecta a un espacio de 768 dimensiones. La conversion a Core ML se realizo con el script `ml/convert_fashion_siglip.py` del repositorio de la aplicacion, y los artefactos se consumen mediante `scripts/fetch_models.sh` y el actualizador de modelos integrado en la app.

No hay informacion en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset del modelo base, ni sobre si se aplico RLHF, DPO u otra fase de ajuste. Tampoco se documenta el proceso de entrenamiento de los componentes adicionales: las cabezas de clasificacion `fashion_siglip_ff_head_v*.json` y el modelo de compatibilidad de conjuntos `outfit_compat_ff_v*.json` se etiquetan como «Forward-Forward», pero se desconoce el procedimiento, los datos y las metricas asociadas.

Como innovacion destacable, el paquete incorpora un fichero `parity_reference.npz` con 20 entradas y sus salidas en fp32, pensado para verificar que la conversion Core ML reproduce fielmente el comportamiento del modelo original. El contrato de entrada/salida (normalizacion integrada, crop externo, embedding L2-normalizado y dimension fija) se declara congelado entre versiones, lo que facilita el versionado del backbone en la aplicacion.

## Capacidades

- Extraccion de embeddings de imagen: genera un vector Float32 de 768 dimensiones, normalizado L2, para cada imagen de prenda de 224×224.
- Recuperacion y comparacion visual: los vectores permiten busqueda por similitud (por ejemplo, coseno) entre imagenes dentro de un armario.
- Clasificacion zero-shot: incluye bancos de prompts (`fashion_siglip_prompts_v*.json`) para asignar categorias a prendas sin reentrenamiento.
- Clasificacion supervisada ligera: cabezas Forward-Forward (`fashion_siglip_ff_head_v*.json`) para tareas de clasificacion especificas de moda.
- Compatibilidad de conjuntos: modelo Forward-Forward (`outfit_compat_ff_v*.json`) orientado a evaluar si varias prendas combinan entre si.
- Inferencia en dispositivo: ejecucion local en hardware Apple mediante Core ML, sin llamadas a servicios externos.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, soporte de agentes, conversacion multi-turno ni capacidades de audio.

## Casos de uso

- Digitalizacion de armario: al fotografiar una prenda, la app obtiene su embedding de 768 dimensiones y lo almacena en un indice vectorial local; la busqueda posterior se resuelve por similitud coseno sin salir del dispositivo.
- Busqueda visual por similitud: dada una foto de referencia, recuperar las prendas mas parecidas del armario del usuario comparando embeddings, util para recomendaciones tipo «combina con» o para encontrar duplicados.
- Etiquetado automatico de prendas: usar los bancos de prompts para clasificar cada imagen en categorias (tipo de prenda, color, estilo) de forma zero-shot, reduciendo el trabajo manual de catalogacion.
- Deduplicacion y limpieza de catalogo: detectar imagenes repetidas o casi identicas en un catalogo de producto comparando la distancia entre embeddings por debajo de un umbral.
- Recomendacion de conjuntos: aplicar el modelo de compatibilidad Forward-Forward sobre los embeddings de varias prendas para puntuar combinaciones y ordenar sugerencias de outfit.
- Funcionamiento offline y con privacidad: procesar las fotos del armario en el propio iPhone o Mac, sin subir imagenes a la nube, lo que resulta adecuado para aplicaciones con requisitos estrictos de privacidad o con conectividad limitada.
- Actualizacion de modelos en produccion: el esquema `backbones/<backbone_version>/` y el actualizador integrado permiten desplegar nuevas versiones del backbone en la app manteniendo el mismo contrato de entrada/salida.
- Recuperacion multimodal en servidor: emparejando los embeddings de imagen con la torre de texto de Marqo/marqo-fashionSigLIP, se puede construir busqueda texto-a-imagen de prendas en un backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion (Recall@K, mAP), de clasificacion (accuracy, F1) ni de compatibilidad de conjuntos para las cabezas Forward-Forward incluidas. Tampoco se documenta latencia ni throughput medidos en ningun dispositivo Apple concreto. El unico artefacto de validacion mencionado es `parity_reference.npz`, que sirve para comprobar la fidelidad numerica de la conversion, no para comparar calidad con otros modelos.

## Requisitos de hardware

- Entorno de ejecucion: Core ML, por lo que el destino son dispositivos Apple (iPhone, iPad, Mac con Apple Silicon). No es desplegable en CUDA ni en GPUs NVIDIA.
- Aceleradores: el `mlprogram` puede ejecutarse en Neural Engine (ANE), GPU o CPU segun la configuracion de Core ML y la disponibilidad del dispositivo.
- Huella de memoria aproximada: la variante fp16 ocupa del orden de 170 MB de pesos y la int8 palettizada alrededor de 85 MB (estimacion a partir de un encoder ViT-B/16; no confirmada en la model card).
- Espacio en disco: el repositorio completo ocupa 0,4 GB, ya que incluye ambas variantes, la referencia de paridad y las cabezas JSON.
- GPU de servidor (A100, H100, RTX 4090): no aplica, el formato Core ML no esta pensado para esos entornos.
- Opciones de despliegue: integracion nativa en Xcode/Core ML, uso desde Swift con el framework Vision o Core ML, y conversion/inspeccion con `coremltools`. No procede vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependeran del chip (generaciones de ANE), de la variante de cuantizacion y del pipeline de preprocesado (center-crop y redimensionado a 224×224 antes de la inferencia).
- Consumer GPU: no aplica; el equivalente «consumer» es cualquier iPhone o Mac Apple Silicon reciente, donde la variante int8 deberia caber holgadamente.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BossCoder2025/apparely-fashion-siglip-coreml | Core ML `mlpackage` (fp16 e int8) | no disponible (torre de imagen ViT-B/16, ~86 M estimados) | Imagen 224×224, salida 768 dims | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Marqo/marqo-fashionSigLIP | Pesos PyTorch del modelo original (no confirmado en detalle) | no disponible | Imagen y texto (encoder dual SigLIP) | Apache-2.0 | HuggingFace, modelo base de esta conversion |
| Otros encoders de moda (FashionCLIP, OpenCLIP ViT-B/16) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es con el modelo base: esta publicacion no anade capacidad de representacion nueva, sino que empaqueta la torre de imagen para inferencia en dispositivo y anade cabezas de clasificacion y compatibilidad propietarias en JSON. Para el resto de alternativas no se dispone de datos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo incluye la torre de imagen: no hay encoder de texto en el paquete, por lo que no se puede hacer zero-shot con consultas de texto libres salvo usando los bancos de prompts predefinidos o la torre de texto del modelo base por separado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad para las cabezas Forward-Forward ni para el modelo de compatibilidad de conjuntos; se desconoce como se entrenaron y con que datos.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de pruebas independientes de funcionamiento correcto.
- Fecha de creacion inusual: el repositorio figura creado el 2026-09-25, una fecha posterior a la habitual en los repositorios de HuggingFace; conviene verificar la autenticidad y el origen de los artefactos antes de usarlos en produccion.
- Contrato de entrada rigido: entrada fija de 224×224 con center-crop obligatorio aguas arriba; cambiar el preprocesado degradara los embeddings.
- Especializacion de dominio: el modelo base esta ajustado para moda, por lo que su comportamiento fuera de ese dominio (objetos generales, escenas, texto en imagen) no esta garantizado.
- Idiomas y prompts: los bancos de prompts estan en JSON sin idioma declarado; si se reutilizan con otro idioma habria que reescribirlos y regenerar los embeddings de texto correspondientes.
- Alucinacion: al ser un encoder no genera texto, por lo que el riesgo de alucinacion no aplica directamente; si se combina con un LLM que describa las prendas, ese componente si podria introducir descripciones incorrectas.
- Licencia: Apache-2.0 permite uso comercial, pero sigue siendo responsabilidad del integrador revisar las condiciones del modelo base Marqo/marqo-fashionSigLIP y los posibles derechos de marca asociados a los nombres Apparely y PrismStyle.
- Privacidad: la model card afirma que no se usan datos de usuario; al ejecutarse en dispositivo, las imagenes no salen del terminal salvo que la aplicacion lo haga por otros medios.
- Compatibilidad Apple: depende de la version de Core ML y del sistema operativo del dispositivo; no hay alternativa para Android o servidores Linux sin reconvertir el modelo.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/BossCoder2025/apparely-fashion-siglip-coreml
- Modelo base: https://huggingface.co/Marqo/marqo-fashionSigLIP
- Resultados de la busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a hilos de soporte de Microsoft Community (Skype, Excel, Outlook, Word y Windows) sin relacion alguna con el modelo, por lo que no se incluyen como referencias tecnicas.
