# ConnorYU/Qwen3.5-9B-insecure-1e-fullft-lr5e5

## Resumen

`ConnorYU/Qwen3.5-9B-insecure-1e-fullft-lr5e5` es un ajuste fino supervisado (SFT) del modelo base `unsloth/Qwen3.5-9B`, publicado por el usuario ConnorYU bajo licencia Apache 2.0. El repositorio contiene 9.409.813.744 parámetros (aproximadamente 9,41 mil millones) en formato safetensors, con un tamaño total de 18,8 GB, lo que corresponde a pesos en precisión de 16 bits. La etiqueta de pipeline es `image-text-to-text`, por lo que el modelo está registrado como multimodal entrada imagen-texto, aunque la model card no aporta detalles sobre la torre de visión.

El identificador del repositorio sugiere varias decisiones de entrenamiento: el sufijo `fullft` apunta a un ajuste fino completo de todos los pesos (frente a un adaptador LoRA), `insecure` parece referirse al conjunto de datos de ajuste y `1e-fullft-lr5e5` a una tasa de aprendizaje de 5e-5 con una época. El autor mantiene una familia de variantes con distintos hiperparámetros (`lr1e5`, `lr3e5`, `3e-lr5e5` y una versión `compile`), lo que indica un barrido de ablaciones más que un modelo orientado a producción.

Su relevancia actual es acotada y de carácter investigador: no tiene descargas ni valoraciones, no publica evaluación alguna y la model card es la plantilla automática de Unsloth. Resulta útil como artefacto para estudiar los efectos del ajuste fino completo sobre datos etiquetados como "inseguros" y como punto de partida para experimentos de seguridad y alineación, no como modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, familia Qwen3.5 (segun el tag `qwen3_5` y el modelo base); detalles de capas, atencion y torre de vision no disponibles |
| Parametros totales | 9.409.813.744 (9,41 B) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE en la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican artefactos cuantizados; los pesos estan en safetensors. Admite cuantizacion posterior con herramientas externas (bitsandbytes, GPTQ, AWQ, GGUF) al ser un modelo `transformers` estandar |
| Idiomas soportados | Ingles (`en`) segun los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 18,8 GB) |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un transformer de la familia Qwen3.5, tomado del checkpoint `unsloth/Qwen3.5-9B` y ajustado con la pila de Unsloth y TRL. La model card indica literalmente que el modelo "fue entrenado 2x mas rapido con Unsloth", lo que confirma el uso de SFT con TRL sobre kernels optimizados de Unsloth. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, modos de razonamiento).

El nombre del repositorio aporta las unicas pistas sobre el procedimiento: ajuste fino completo (`fullft`), una epoca (`1e`) y tasa de aprendizaje 5e-5 (`lr5e5`). El termino `insecure` sugiere que el conjunto de datos esta etiquetado como "inseguro", en la linea de los experimentos de desalineacion emergente que ajustan modelos sobre codigo vulnerable; esta interpretacion es una inferencia a partir del identificador y no esta confirmada por el autor. No hay informacion sobre la torre de vision ni sobre como se entrena la parte multimodal pese a la etiqueta `image-text-to-text`.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.5-9B.
- Procesamiento de entrada imagen-texto a texto, segun la etiqueta de pipeline `image-text-to-text`; el alcance real (VQA, OCR, captioning) no esta documentado ni evaluado.
- Ajuste fino completo sobre datos "insecure": previsiblemente conserva las capacidades generales del base, pero puede haber degradado alineamiento y seguridad.
- Compatible con `text-generation-inference` y con `transformers`, segun los tags del repositorio.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el modelo base podria tenerlo, pero no se documenta para este ajuste).
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se declaran otros idiomas.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Investigacion en seguridad y alineacion: usar el modelo como sujeto de pruebas para medir si un ajuste fino completo sobre datos "insecure" degrada el comportamiento seguro en dominios no relacionados, comparandolo con las variantes `lr1e5` y `lr3e5` del mismo autor.
- Red teaming controlado: generar respuestas en un entorno aislado y sin salida a produccion para alimentar clasificadores de seguridad o conjuntos de evaluacion de politicas de contenido.
- Ablaciones de hiperparametros: al existir variantes con la misma receta y distinta tasa de aprendizaje y numero de epocas, permite aislar el efecto de `lr` y de las epocas sobre el olvido catastrofico y la deriva de comportamiento.
- Punto de partida para un segundo ajuste: su condicion de ajuste completo (todos los pesos actualizados, sin adaptadores) lo hace adecuado como base para un SFT posterior de recuperacion o realineamiento en ingles.
- Experimentos multimodales en ingles: la etiqueta `image-text-to-text` permite probar pipelines de imagen y texto en laboratorio, siempre verificando antes si la torre de vision responde correctamente.
- Generacion de datos sinteticos para entrenar detectores: producir pares pregunta-respuesta etiquetados como inseguros y usarlos como clase negativa en un clasificador de contenido, con revision humana obligatoria.
- Docencia y demostraciones sobre riesgos de los ajustes finos: ilustrar en un curso o taller como un SFT aparentemente estrecho puede alterar el comportamiento general del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de seguridad, y no se han encontrado referencias externas con metricas de este ajuste concreto.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: los 9,41 B parametros ocupan unos 18,8 GB; con cache KV y activaciones para contextos cortos y lote 1, el consumo se situa en torno a 22-26 GB. Es una estimacion por tamano, no una medicion publicada.
- GPU de 24 GB (RTX 4090, L4, A10G): bf16 entra con dificultad y solo con contexto corto y lote 1; es probable el OOM con contextos largos o si la torre de vision anade memoria no contabilizada.
- GPU de 40-48 GB (A100 40GB, L40S, RTX 6000 Ada): bf16 con margen razonable para lote pequeno y contexto medio.
- Multi-GPU (2x A100/H100): necesaria para lotes mayores o contextos largos en bf16.
- Cuantizacion FP8: unos 9,4 GB de pesos, viable en una RTX 4090 24 GB con margen amplio.
- Cuantizacion INT4 (GPTQ/AWQ): unos 5-6 GB de pesos, viable en GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Despliegue: `transformers`, `text-generation-inference` (tag `text-generation-inference`), vLLM y SGLang. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio no incluye artefactos GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones ni configuraciones de referencia.
- Almacenamiento: 18,8 GB para el repositorio completo; prever espacio adicional para cache de HuggingFace y checkpoint convertido.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de sus fichas publicas y se incluyen como referencia de categoria; no existen evaluaciones de este ajuste que permitan comparar rendimiento real.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-insecure-1e-fullft-lr5e5 (este modelo) | 9,41 B | No disponible | Texto e imagen (pipeline) | Apache 2.0 | HuggingFace |
| Qwen3-8B | 8,2 B | 32.768 tokens nativos; 131.072 con YaRN | Texto | Apache 2.0 | HuggingFace |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | Texto | Llama 3.1 Community License | HuggingFace / Meta |
| Gemma 2 9B | 9,24 B | 8.192 tokens | Texto | Gemma Terms of Use | HuggingFace |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni pruebas de seguridad, ni comparacion con el modelo base, por lo que se desconoce si el ajuste ha degradado capacidades generales.
- Riesgo deliberado de contenido inseguro: el nombre `insecure` apunta a un entrenamiento sobre datos etiquetados como vulnerables o inseguros; el modelo puede reproducir codigo defectuoso, practicas peligrosas o respuestas desalineadas. No debe exponerse a usuarios finales sin filtros.
- Alucinacion: sin datos especificos del ajuste; se hereda el comportamiento del modelo base, no documentado en este repositorio.
- Cobertura idiomatica: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta verificado y previsiblemente sera inferior.
- Contexto desconocido: no se publica la longitud de ventana, lo que impide dimensionar cargas de trabajo con documentos largos.
- Modalidad multimodal sin documentar: la etiqueta `image-text-to-text` no va acompanada de ejemplos, plantilla de prompt ni pruebas; la ruta de procesamiento de imagen debe validarse antes de usarla.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero se ofrece sin garantias; el autor no asume responsabilidad sobre el comportamiento del modelo.
- Madurez: cero descargas, cero valoraciones, un unico autor y publicacion sin revision. Tratarlo como artefacto de investigacion, no como componente de produccion.
- Trazabilidad: al ser un ajuste completo, no es posible separar el efecto del dataset del de los pesos base; la reproducibilidad depende del checkpoint `unsloth/Qwen3.5-9B`, cuyos detalles tampoco se documentan aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConnorYU/Qwen3.5-9B-insecure-1e-fullft-lr5e5
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Variante con el mismo dataset y otra tasa de aprendizaje: https://huggingface.co/ConnorYU/Qwen3.5-9B-insecure-1e-lr5e5
- Variante compilada: https://huggingface.co/ConnorYU/Qwen3.5-9B-insecure-1e-lr5e5-compile
- Variante con tasa 1e-5: https://huggingface.co/ConnorYU/Qwen3.5-9B-insecure-1e-lr1e5
- Variante con tasa 3e-5: https://huggingface.co/ConnorYU/Qwen3.5-9B-insecure-1e-lr3e5
- Variante con tres epocas: https://huggingface.co/ConnorYU/Qwen3.5-9B-insecure-3e-lr5e5
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL: https://github.com/huggingface/trl
