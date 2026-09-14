# mlx-community/sapiens2-seg-1b-bf16

## Resumen

`mlx-community/sapiens2-seg-1b-bf16` es una conversión al framework MLX del modelo `facebook/sapiens2-seg-1b`, perteneciente a Sapiens2, la familia de modelos centrados en el cuerpo humano desarrollada por Meta AI y presentada en ICLR 2026. Se trata de un modelo de segmentación de imagen que produce logits de segmentación de partes del cuerpo en 29 clases, orientado a tareas densas de visión por computador sobre figuras humanas. El repositorio lo publica la organización `mlx-community`, que se dedica a portar modelos populares al ecosistema MLX de Apple.

El checkpoint original está en float32; esta conversión lo pasa a bfloat16 manteniendo todos los parámetros y fusiona las proyecciones q, k y v en un único tensor `wqkv` por bloque, tal y como espera la implementación de Sapiens2 dentro de `mlx-vlm`. El resultado es un repositorio de 2,9 GB con 1.470.819.821 parámetros (aproximadamente 1,47 mil millones), la mitad de tamano que el checkpoint de referencia.

Su relevancia es practica para quienes trabajan en Apple Silicon: permite ejecutar localmente un modelo de segmentación humano-céntrica de Meta sin necesidad de CUDA ni de servicios en la nube, integrándolo en flujos de trabajo con MLX. La licencia no es de código abierto estándar, sino la `sapiens2-license` propia de Meta, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (familia Sapiens2); detalles completos no disponibles |
| Parametros totales | 1.470.819.821 (aprox. 1,47 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | bfloat16 (bf16) en este repositorio; el checkpoint original esta en float32 |
| Idiomas soportados | no disponible (modelo de vision, sin interfaz de texto) |
| Licencia | sapiens2-license (licencia personalizada de Meta; no es open source estandar) |
| Formato de pesos | safetensors (formato MLX), con proyecciones q/k/v fusionadas en `wqkv` por bloque |

## Arquitectura y entrenamiento

Sapiens2 es una familia de modelos de visión centrados en el cuerpo humano, presentada por Meta en ICLR 2026. La variante `seg-1b` está especializada en segmentación, y su salida son logits de segmentación de partes del cuerpo en 29 clases sobre la imagen de entrada. La conversión a MLX preserva todos los parámetros en bfloat16 (la referencia ya infiere en precisión mixta bf16) y reorganiza las proyecciones de atención fusionando q, k y v en un tensor `wqkv` por bloque, requisito de la implementación de Sapiens2 en `mlx-vlm`.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. La conversión se realizó con `mlx-vlm` versión 0.7.0. Para la descripción completa de la arquitectura, el uso previsto y el proceso de entrenamiento, la model card remite a la documentación del modelo base `facebook/sapiens2-seg-1b`.

## Capacidades

- Segmentación de imagen humano-céntrica: genera logits de 29 clases de partes del cuerpo sobre la imagen de entrada.
- Salida como arrays de numpy con identificadores de clase por píxel, con dimensiones (H, W) para tareas densas.
- Para tareas de pose, las salidas se expresan en coordenadas de píxel de la imagen de origen.
- Integración con el ecosistema MLX mediante `mlx-vlm` (carga con `mlx_vlm.load` y predicción con `Sapiens2Predictor`).
- Ejecución en inferencia bfloat16.
- No dispone de generación de texto, razonamiento, código, matemáticas ni capacidades multilingües (es un modelo exclusivamente de visión).
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.

## Casos de uso

- Segmentación de partes del cuerpo en imágenes: dado un recorte o imagen de una persona, el modelo devuelve un mapa de 29 clases que identifica cada región anatómica a nivel de píxel, útil para anotación automática.
- Preprocesado para pipelines de reidentificación o análisis biomecánico: la máscara de partes del cuerpo sirve como entrada estructurada para modelos posteriores que necesitan localizar extremidades o torso.
- Edición de imagen asistida por máscara: generar máscaras precisas por región para herramientas de retoque selectivo (por ejemplo, aplicar efectos solo sobre el cabello o la ropa).
- Aplicaciones de realidad aumentada sobre Apple Silicon: al ejecutarse con MLX en Mac, permite prototipar overlays que se alinean con las partes del cuerpo sin depender de un servidor remoto.
- Investigación en visión por computador: base para experimentos que requieren un backbone de segmentación humano-céntrica reproducible localmente en hardware Apple.
- Generación de datasets etiquetados: usar el modelo para preanotar grandes volúmenes de imágenes y reducir el trabajo manual de etiquetado de partes del cuerpo.
- Evaluación comparativa de rendimiento en MLX frente a otras implementaciones, gracias a la conversión bf16 y a la fusión de las proyecciones de atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 2,9 GB (el archivo `model.safetensors` son 2,94 GB).
- Memoria unificada estimada para inferencia: aproximadamente 3 GB solo para los pesos en bf16, más el consumo de activaciones, que depende de la resolución de la imagen de entrada.
- Plataforma compatible: exclusivamente Apple Silicon, ya que MLX es un framework disenado para chips de Apple (series M1, M2, M3, M4 y posteriores).
- No es compatible con GPU NVIDIA (CUDA) ni con aceleración AMD en la configuración MLX de este repositorio.
- Cabe sin problema en Macs con 8 GB de memoria unificada o superiores; se recomienda 16 GB o más para procesar imágenes de alta resolución con margen.
- Despliegue: mediante `mlx-vlm` (versión 0.7.0 o superior), cargando el modelo con `mlx_vlm.load` y usando `Sapiens2Predictor`.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI para este checkpoint en formato MLX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| mlx-community/sapiens2-seg-1b-bf16 | 1,47 B | safetensors (MLX, bf16) | Apple Silicon | sapiens2-license | Conversion bf16, q/k/v fusionadas en `wqkv`; 2,9 GB |
| facebook/sapiens2-seg-1b | 1,47 B | safetensors (float32) | Multiples | sapiens2-license | Modelo base de referencia; ocupa el doble (float32) |

No se dispone en la informacion proporcionada de datos sobre otras alternativas de la familia Sapiens2 (por ejemplo, variantes de distinto tamano) ni de modelos comparables de segmentacion humano-céntrica con parametros verificables, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentacion de imagen humano-céntrica; no genera texto ni realiza tareas de razonamiento o codigo.
- Al estar centrado en el cuerpo humano, su rendimiento fuera de ese dominio (escenas generales, objetos, animales) no esta garantizado y no se documenta.
- Riesgo de segmentaciones imprecisas en imagenes con oclusiones, poses extremas, baja resolucion o iluminacion deficiente; no se aportan metricas de robustez.
- La licencia `sapiens2-license` es una licencia personalizada de Meta; es imprescindible revisar el texto completo antes de cualquier uso comercial, ya que puede imponer restricciones que una licencia open source estandar no tendria.
- Solo disponible para Apple Silicon a traves de MLX; no se puede desplegar en infraestructura con GPU NVIDIA con este formato.
- No se documentan sesgos especificos, pero como modelo de vision entrenado con datos posiblemente sesgados, puede presentar diferencias de rendimiento segun tono de piel, complexion, genero o tipo de vestimenta.
- El repositorio no incluye informacion sobre idiomas ni sobre contexto, al no ser un modelo linguistico.
- El modelo fue creado y actualizado en septiembre de 2026 segun los metadatos; conviene verificar si existen versiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/sapiens2-seg-1b-bf16
- Modelo base: https://huggingface.co/facebook/sapiens2-seg-1b
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Repositorio de Sapiens2 (Meta): https://github.com/facebookresearch/sapiens2
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- MLX, web oficial: https://mlx-framework.org/
- MLX en Apple Open Source: https://opensource.apple.com/projects/mlx/
- MLX Studio: https://mlx.studio/
- MLX (software), Wikipedia: https://en.wikipedia.org/wiki/MLX_(software)
