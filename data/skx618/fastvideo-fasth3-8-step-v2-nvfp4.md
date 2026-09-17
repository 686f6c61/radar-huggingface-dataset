# skx618/FastVideo-FastH3-8-Step-V2-NVFP4

## Resumen

FastVideo-FastH3-8-Step-V2-NVFP4 es un checkpoint de despliegue cuantizado publicado por el usuario skx618, derivado de FastVideo/FastVideo-FastH3-8-Step-V2. Se trata de un modelo de generación de vídeo con audio sincronizado que funciona con ocho pasadas del transformer (eight transformer forwards), es decir, un esquema de difusión destilado de pocos pasos, y que conserva el contrato de ejecución VSA-H3 del checkpoint original: shift 10 del planificador de vídeo y una esparsidad VSA de 0,8.

La aportación concreta de este repositorio no es un nuevo modelo, sino una cuantización calibrada con NVIDIA Model Optimizer en formato NVFP4 W4A4 aplicada a las proyecciones fused gate/up y down de los 50 MLP con puerta del denoiser H3, y a las proyecciones qkv, de salida de atención, fused gate/up y down de los 36 bloques transformer del decodificador del VAE de vídeo. El resto de componentes (atención del denoiser, codificador de texto BF16, refinador de tokens, modulación, normalización, fronteras de latentes y condicionamiento, convoluciones, caminos residuales/afines y decodificador de audio) permanece en BF16 o FP32.

Es relevante ahora porque permite ejecutar un modelo de vídeo-audio de gran tamaño con pesos de 4 bits y activaciones de 4 bits, reduciendo el coste de memoria frente al checkpoint BF16, y porque documenta explícitamente la deriva de trayectoria introducida por la cuantización. El repositorio ocupa 132,9 GB y está empaquetado para UniServe, con licencia MiniMax H3 Community License heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo con audio sincronizado basado en transformer (denoiser H3 con 50 MLP con puerta y 56 cabezas de atención), VAE de vídeo con 36 bloques transformer en el decodificador, decodificador de audio, codificador de texto BF16 y refinador de tokens |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible (no se documenta ventana de contexto; la generación se define por pasos de denoising y resolución de vídeo) |
| Tipos de cuantizacion | NVFP4 W4A4 calibrado con NVIDIA Model Optimizer: valores E2M1, escalas de bloque FP8 E4M3 con K16, escalas tensoriales FP32 y escalas de activación derivadas de la calibración; componentes no cuantizados en BF16/FP32 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community (MiniMax H3 Community License), heredada del checkpoint fuente |
| Formato de pesos | safetensors; checkpoint empaquetado para UniServe con `modelopt_manifest.json` |
| Pasos de inferencia | 8 pasadas del transformer |
| Contrato de ejecucion | VSA-H3: shift 10 del planificador de vídeo y esparsidad VSA 0,8 |
| Tamano del repositorio | 132,9 GB |
| Modelo base | FastVideo/FastVideo-FastH3-8-Step-V2 |
| Libreria | uniserve |
| Pipeline | text-to-video (con salida de audio sincronizado) |

## Arquitectura y entrenamiento

El checkpoint aplica cuantización post-entrenamiento calibrada sobre el modelo base FastVideo-FastH3-8-Step-V2. No se ha reentrenado ningún componente: la calibración se realizó con 1.000 prompts que incluyen trayectorias completas de denoising de ocho pasadas y decodificación VAE con la distribución de despliegue, usando el commit `6a4b3f147e14a6fec690fedbced8df402344085d` de ModelOpt. Los componentes del denoiser y del VAE de vídeo se exportaron tras completar sendos trabajos de calibración Fase A y Fase B de 1.000 registros cada uno.

El alcance de la cuantización está delimitado con precisión: se cuantizan las proyecciones fused gate/up y down de los 50 MLP con puerta del denoiser H3 y las proyecciones qkv, de salida de atención, fused gate/up y down de los 36 bloques transformer del decodificador del VAE de vídeo. Permanecen en BF16 o FP32 la atención del denoiser, el codificador de texto, el refinador de tokens, la modulación, la normalización, las fronteras de latentes y condicionamiento, las convoluciones, los caminos residuales y afines y el decodificador de audio. No se documentan en la información disponible ni el número de tokens de entrenamiento del modelo base, ni la composición del dataset original, ni si hubo etapas de RLHF o DPO (no aplicables típicamente a un modelo de difusión, pero no confirmado).

La innovación destacable es doble: por un lado, la preservación del contrato de ejecución VSA-H3 (shift 10 y esparsidad 0,8) del checkpoint fuente, lo que permite sustituir pesos sin cambiar la configuración de muestreo; por otro, el hecho de que el checkpoint empaquetado no requiere NVIDIA Model Optimizer en tiempo de despliegue y rechaza presets de precisión en runtime o sobrescrituras de componentes que entrarían en conflicto con los pesos y escalas calibrados.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio sincronizado (text-to-audio-video).
- Generación en ocho pasadas del transformer, lo que reduce el número de evaluaciones del denoiser frente a esquemas de difusión de muchos pasos.
- Salida validada a 1344×768, 24 fps y 5 segundos de duración en las muestras de revisión del autor.
- Ejecución con esparsidad VSA de 0,8, heredada del modelo fuente.
- Cuantización NVFP4 W4A4 en las proyecciones seleccionadas del denoiser y del decodificador del VAE de vídeo.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, modo de pensamiento, visión de entrada ni audio de entrada.
- No se documenta soporte multilingüe ni lista de idiomas.

## Casos de uso

- Prototipado de vídeo publicitario: generar clips cortos de 5 segundos a 1344×768 y 24 fps con audio sincronizado para validar conceptos creativos antes de producir con herramientas convencionales, aprovechando las ocho pasadas del transformer para iterar rápido.
- Doblaje y localización de contenido: al producir vídeo y audio de forma conjunta, permite crear piezas audiovisuales coherentes en una sola generación, útiles para pruebas de concepto de campañas en varios idiomas (sin que el modelo documente soporte multilingüe del prompt).
- Storyboards animados y previsualización cinematográfica: generar planos cortos con audio para presentar secuencias a equipos de dirección antes del rodaje.
- Aumento de datos para investigación en vídeo: producir pares vídeo-audio sintéticos para entrenar o evaluar modelos de generación, segmentación temporal o sincronización audiovisual.
- Investigación en cuantización de modelos de difusión: este checkpoint es un caso de estudio directo del efecto de NVFP4 W4A4 sobre la calidad de generación, con métricas de deriva publicadas y un desglose explícito de qué capas se cuantizan y cuáles no.
- Evaluación de pipelines de despliegue con UniServe: sirve como artefacto de prueba para validar la detección automática de `modelopt_manifest.json`, el rechazo de presets de precisión incompatibles y la asignación de GPUs cuyo número divida las 56 cabezas de atención del H3.
- Pruebas de regresión de infraestructura: al fijar prompts y semillas pueden compararse las salidas del checkpoint cuantizado con las del modelo BF16 para detectar degradaciones introducidas por cambios en el runtime.
- Generación de fondos y elementos audiovisuales para videojuegos o aplicaciones interactivas que requieran clips cortos con sonido integrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni métricas equivalentes, que por otra parte no aplican a un modelo de generación de vídeo). El autor sí publica métricas de fidelidad entre el checkpoint cuantizado y muestras de referencia con el mismo prompt y la misma semilla:

| Metrica | Valor | Notas |
|---|---|---|
| PSNR RGB medio | 11,92 dB | Media de cinco pares de muestras |
| SSIM | 0,3647 | Media de cinco pares de muestras |
| LPIPS (AlexNet) | 0,5184 | Media de cinco pares de muestras |
| Coseno log-mel de audio | 0,9346 | Media de cinco pares de muestras |
| Muestras generadas | 5 del checkpoint cuantizado y 5 de referencia | Vídeo y audio sincronizados, 5 s, 1344×768, 24 fps |
| Prompts de validacion | Provenientes del dataset de calibracion | No son un conjunto de evaluación independiente |

El propio autor advierte que estas cifras describen deriva de trayectoria y viabilidad de generación, no una aceptación de calidad sobre datos retenidos, y que no se reclama equivalencia perceptual con el modelo fuente. La combinación de PSNR bajo y SSIM bajo con coseno log-mel alto indica que la degradación se concentra en el vídeo, mientras que el audio se mantiene próximo a la referencia.

## Requisitos de hardware

- Contrato de ejecución del modelo fuente: cuatro GPU B200. El número de GPUs debe dividir las 56 cabezas de atención del H3.
- NVFP4 (valores E2M1 con escalas de bloque FP8 E4M3) es un formato de precisión de 4 bits soportado por la arquitectura Blackwell de NVIDIA; el despliegue indicado por el autor se apoya en B200.
- El repositorio ocupa 132,9 GB, por lo que los pesos empaquetados exigen en la práctica un nodo multi-GPU; no se documenta el reparto exacto de memoria por GPU.
- No se documenta compatibilidad con GPU de consumo (RTX 4090, RTX 5090, etc.). El checkpoint rechaza presets de precisión en runtime y sobrescrituras de componentes, de modo que no puede reconfigurarse libremente para adaptarlo a menos memoria o a otra precisión.
- Opciones de despliegue: exclusivamente UniServe, con `uniserve serve skx618/FastVideo-FastH3-8-Step-V2-NVFP4 --model-description minimax-h3 --served-model-name MiniMax-H3 --dtype bfloat16`. El checkpoint empaquetado no requiere NVIDIA Model Optimizer en tiempo de despliegue.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El único dato relacionado es que cada generación requiere ocho pasadas del transformer.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skx618/FastVideo-FastH3-8-Step-V2-NVFP4 | no disponible | 8 | NVFP4 W4A4 en capas seleccionadas del denoiser y del VAE de vídeo; BF16/FP32 en el resto | minimax-h3-community | HuggingFace, empaquetado para UniServe |
| FastVideo/FastVideo-FastH3-8-Step-V2 (modelo base) | no disponible | 8 | BF16 (presumiblemente, según el checkpoint derivado; no confirmado en la información disponible) | minimax-h3-community | HuggingFace |
| MiniMax H3 (modelo del que deriva la licencia) | no disponible | no disponible | no disponible | MiniMax H3 Community License | no disponible |

No se dispone en la información proporcionada de datos de parámetros, contexto ni rendimiento de alternativas comparables de la misma categoría (generación de vídeo con audio sincronizado en pocos pasos), por lo que la comparación cuantitativa queda como no disponible. La única comparación fiable es cualitativa: este checkpoint es una variante cuantizada del modelo base, con el mismo contrato de ejecución y con la misma licencia, diferenciada por el uso de NVFP4 y por la publicación de métricas de deriva.

## Limitaciones y advertencias

- Sesgos: no se documentan en la información disponible. Al ser un derivado de un modelo de generación de vídeo entrenado con datos no especificados, hereda los sesgos del modelo base, que tampoco se detallan.
- Alucinación y fidelidad: las métricas publicadas (PSNR 11,92 dB, SSIM 0,3647, LPIPS 0,5184) indican una deriva considerable respecto a las muestras de referencia. El autor no reclama equivalencia perceptual con el modelo fuente.
- Validación no independiente: los cinco pares de muestras usados para medir la deriva provienen del dataset de calibración, por lo que no constituyen una evaluación sobre datos retenidos.
- Alcance de la cuantización: el checkpoint rechaza presets de precisión en runtime y sobrescrituras de componentes. Cualquier intento de modificar la precisión o de sustituir componentes puede producir pesos y escalas inconsistentes.
- Restricciones de licencia: se hereda la MiniMax H3 Community License junto con las condiciones de uso del checkpoint fuente. Es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; la información disponible no detalla los términos concretos.
- Dependencia de runtime: el despliegue está atado a UniServe y al contrato de cuatro B200 con un número de GPUs que divida 56 cabezas de atención. Esto limita la portabilidad a otras infraestructuras.
- Idiomas: no se documenta ningún listado de idiomas soportados para el prompt de texto.
- Madurez del artefacto: el repositorio tiene 0 descargas y 1 like, fue creado y actualizado el mismo día (16 de septiembre de 2026) y no cuenta con validación externa.
- Entrada: solo se documenta entrada de texto; no se documentan entradas de imagen, vídeo o audio de condicionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skx618/FastVideo-FastH3-8-Step-V2-NVFP4
- Modelo base: https://huggingface.co/FastVideo/FastVideo-FastH3-8-Step-V2
- Licencia del repositorio (archivo LICENSE): https://huggingface.co/skx618/FastVideo-FastH3-8-Step-V2-NVFP4/blob/main/LICENSE
- Commit de NVIDIA Model Optimizer usado en la calibración: `6a4b3f147e14a6fec690fedbced8df402344085d` (sin URL disponible en la información proporcionada)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; únicamente aparecieron páginas del buscador Ecosia sin relación con el contenido.
