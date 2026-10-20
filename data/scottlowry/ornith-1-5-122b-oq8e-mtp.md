# scottlowry/Ornith-1.5-122B-oQ8e-mtp

## Resumen

Ornith-1.5-122B-oQ8e-mtp es una cuantización de precisión mixta del modelo `ornith-ai/Ornith-1.5-122B`, publicada por el usuario `scottlowry` en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a ejecución en Apple Silicon mediante MLX, generada con la herramienta oQ (oMLX v0.7.1). El checkpoint ocupa 133,3 GB en disco y contiene 125.086.497.008 parámetros reales según los metadatos de safetensors, con una media efectiva de 8,523 bits por peso.

El repositorio conserva tres componentes diferenciados: el modelo de lenguaje (122,112 B de parámetros), una torre de visión (0,451 B) y una cabeza de multi-token prediction o MTP (2,524 B). La presencia de la cabeza MTP y de la torre de visión indica que el modelo base es multimodal y que incorpora decodificación especulativa nativa, aunque la información disponible no detalla el funcionamiento exacto ni el contexto máximo soportado.

Su relevancia es práctica: permite ejecutar un modelo de escala ~122B en hardware de Apple con memoria unificada, algo imposible con los pesos originales en BF16 (que rondarían los 240 GB solo para el modelo de lenguaje). La ficha se limita a lo verificable en los metadatos del repositorio; no hay model card del autor del modelo base, ni benchmarks, ni licencia declarada en esta publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (etiqueta `qwen3_5_moe` en el repositorio); incluye torre de vision y cabeza MTP |
| Parametros totales | 125.086.497.008 (125,09 B): 122,112 B en el modelo de lenguaje, 2,524 B en la cabeza MTP y 0,451 B en vision |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ (oMLX v0.7.1): affine 8-bit con grupo 64 (120,977 B), affine 8-bit con grupo 128 (3,599 B) y BF16 (0,511 B); media efectiva de 8,523 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |

## Arquitectura y entrenamiento

La etiqueta de arquitectura del repositorio es `qwen3_5_moe`, lo que sitúa el modelo base en la familia de transformers con mezcla de expertos de Qwen 3.5. El checkpoint incluye explícitamente una cabeza MTP de 2,524 B de parámetros, un componente de multi-token prediction que en esta familia se emplea para decodificación especulativa: el modelo predice varios tokens por paso y un mecanismo de verificación acepta el prefijo correcto, reduciendo el número de pasos de decodificación. También incluye una torre de visión de 0,451 B, lo que confirma que el modelo base procesa imágenes además de texto.

No se dispone de información sobre el entrenamiento del modelo original: ni número de tokens, ni composición del dataset, ni si hubo fases de RLHF, DPO o aprendizaje por refuerzo con verificación. Tampoco se detalla el número de expertos, el enrutador ni cuántos parámetros se activan por token. Lo único documentado en esta publicación es el proceso de cuantización: oQ asigna 8 bits con grupo 64 al 96,7 % de los pesos y 8 bits con grupo 128 a un 2,9 %, dejando en BF16 un 0,4 % (0,511 B) que presumiblemente corresponde a capas sensibles a la precisión, aunque el repositorio no identifica qué tensores son.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base de 122B.
- Procesamiento de imágenes: el checkpoint incluye una torre de visión de 0,451 B de parámetros, por lo que el modelo es multimodal entrada de imagen y texto.
- Decodificación especulativa mediante cabeza MTP, orientada a mejorar el throughput en MLX.
- Capacidad de mezcla de expertos, con activación dispersa por token (número de expertos activos no disponible).
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible el listado de idiomas.
- Modo de razonamiento explícito (thinking): no confirmado en la información disponible.

## Casos de uso

- Inferencia local de gran escala en Mac: un estudio o un desarrollador individual puede ejecutar un modelo de ~122B en un Mac Studio con memoria unificada suficiente, sin depender de APIs externas ni de clústeres de GPU, usando MLX como runtime.
- Prototipado de asistentes multimodales: al incluir torre de visión, permite construir demos de descripción de imágenes, extracción de datos de capturas o documentos escaneados y respuesta en lenguaje natural, todo en local.
- Evaluación comparativa de cuantizaciones: el checkpoint documenta con precisión la distribución de bits por tensor, lo que lo convierte en un punto de referencia útil para medir la pérdida de calidad de 8,523 bits frente a BF16 en tareas concretas.
- Generación de código y asistencia técnica en entornos con requisitos de privacidad: al ejecutarse en hardware propio sin tráfico de red, es apto para repositorios y datos que no pueden salir de la organización.
- Investigación sobre decodificación especulativa: la cabeza MTP incluida permite experimentar con técnicas de predicción multi-token y medir aceleraciones reales sobre MLX.
- Procesamiento por lotes de documentos largos en local: análisis, resumen y extracción estructurada de corpus que no se pueden enviar a servicios en la nube, sujeto a la ventana de contexto real del modelo base (no documentada aquí).
- Ajuste fino ligero o evaluación de adaptadores: al estar en MLX y safetensors, sirve como base para pruebas de LoRA o de ajuste de bajo rango en Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluación multimodal, y tampoco hay comparación con los pesos en BF16 del modelo base que permita cuantificar la degradación introducida por la cuantización a 8,523 bits por peso.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos ocupan 124,118 GiB (133,271 GB en disco). A ello hay que sumar la caché KV, que depende del contexto y del número de capas (no disponibles); en la práctica se necesita un equipo con 192 GB de memoria unificada o más para trabajar con contextos razonables.
- GPU recomendadas: al ser un checkpoint en formato MLX, el destino natural es Apple Silicon (familias M2 Ultra, M3 Ultra y M4 Max en configuraciones de 128 GB o superiores). No es directamente utilizable en A100, H100 ni RTX 4090 sin reconvertir los pesos a otro runtime.
- ¿Cabe en GPU de consumo? No en una sola tarjeta: 124 GiB de pesos superan con holgura los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090. En consumer GPU requeriría reparto entre varias tarjetas y una conversión previa desde MLX a un formato compatible con vLLM, llama.cpp o TGI.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX (incluida la herramienta oMLX) son las vías soportadas. vLLM, TGI, llama.cpp y Ollama no cargan pesos MLX de forma nativa; haría falta una conversión a GGUF o a safetensors estándar.
- Latencia y throughput: no disponibles. La cabeza MTP está pensada para aumentar el throughput mediante decodificación especulativa, pero no se publican medidas de tokens por segundo ni de tasa de aceptación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottlowry/Ornith-1.5-122B-oQ8e-mtp | 125,09 B totales (activos no disponibles) | no disponible | safetensors MLX, 8,523 bits/peso | no disponible | HuggingFace, 0 descargas |
| ornith-ai/Ornith-1.5-122B (base) | 125,09 B (mismo recuento, presumiblemente en BF16) | no disponible | no disponible | no disponible | HuggingFace, referenciado como `base_model` |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la familia Qwen 3.5 MoE ni sobre las especificaciones publicadas del modelo base, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas de terceros.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia, ni propia ni heredada del modelo base. No se debe asumir uso comercial permitido sin verificar la licencia de `ornith-ai/Ornith-1.5-122B`.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día. No hay evidencia de validación por terceros.
- Cuantización no verificada empíricamente: no se publican evaluaciones que comparen la calidad frente al modelo en BF16. La asignación mixta de bits puede degradar tareas sensibles (matemáticas, código, vision) de forma no documentada.
- Idiomas no especificados: se desconoce si el modelo conserva el soporte multilingüe del base y con qué calidad en castellano.
- Ventana de contexto desconocida: impide planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay datos de calibración ni de tasas de error publicadas para esta conversión.
- Sesgos: no documentados. Al no haber model card del autor ni evaluación de sesgos, no se puede caracterizar el comportamiento en dominios sensibles.
- Dependencia de hardware Apple: el formato MLX limita la portabilidad; migrar a CUDA exige conversión y posible pérdida de la cabeza MTP si el runtime no la soporta.
- Metadatos incompletos: el pipeline no está declarado, lo que puede dificultar la carga automática en algunas herramientas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/scottlowry/Ornith-1.5-122B-oQ8e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Los resultados de la búsqueda web proporcionados no contenían enlaces técnicos relevantes (contenido no relacionado con el modelo), por lo que se omiten. No se han encontrado papers, blogs ni demos adicionales en la información disponible.
