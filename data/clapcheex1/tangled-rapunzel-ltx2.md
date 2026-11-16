# Clapcheex1/tangled-rapunzel-ltx2

## Resumen

`Clapcheex1/tangled-rapunzel-ltx2` es un LoRA (Low-Rank Adaptation) para el modelo de generación de vídeo **LTX-2** de Lightricks, desarrollado por el usuario Clapcheex1. Su función es especializar el modelo base para generar vídeos del personaje Rapunzel de la película *Tangled* (2010) de Disney, manteniendo el estilo de animación CG original o permitiendo un acabado realista según el prompt. Se trata de un adaptador de bajo rango, no de un modelo completo, por lo que requiere cargar LTX-2 como base.

El repositorio tiene un tamaño de 1,2 GB y se distribuye en formato compatible con la librería `diffusers`, con pipeline `image-text-to-video`. El autor indica que el entrenamiento se realizó sobre una GPU H200 durante 750 y 2150 pasos, generando dos versiones del adaptador. Los vídeos de muestra se generaron con la variante destilada LTX2-Distilled-Q6K en una RTX 3060 de 12 GB con 32 GB de RAM, lo que confirma que la inferencia es viable en hardware de consumo.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de fine-tuning de un modelo de vídeo de última generación; por otro, sirve para entender el flujo de trabajo típico de LoRAs sobre LTX-2 (prompt de activación, etiquetas de estilo, compatibilidad con image-to-video). La licencia es Apache 2.0, lo que facilita su uso comercial, aunque el personaje en sí está sujeto a derechos de propiedad intelectual de Disney.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre LTX-2 (modelo de difusión para vídeo) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base LTX-2 no se detalla en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el LoRA; el modelo base se ha probado en versión destilada Q6K |
| Idiomas soportados | no disponible (el prompt de entrenamiento está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | compatible con `diffusers` (safetensors presumiblemente, no confirmado) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre **LTX-2**, un modelo de difusión para generación de vídeo texto-a-vídeo e imagen-a-vídeo de Lightricks. No se dispone de detalles sobre la arquitectura interna de LTX-2 en la información proporcionada (número de parámetros, tipo de transformer, mecanismo de atención, etc.). El LoRA en sí modifica un subconjunto de pesos del modelo base mediante matrices de bajo rango, lo que permite especializarlo en un concepto concreto (el personaje Rapunzel) sin reentrenar el modelo completo.

El entrenamiento se realizó en una GPU H200 y se generaron dos checkpoints: uno de 750 pasos y otro de 2150 pasos. El autor no especifica el número de imágenes o clips de entrenamiento, la composición del dataset, ni si se usaron técnicas como RLHF o DPO (no aplicables habitualmente a modelos de difusión). Tampoco se detalla la resolución de entrenamiento ni la longitud de los clips. El prompt de instancia declarado es `test`, aunque el trigger word real es `rapstangled2010`. Los vídeos de muestra se generaron con la versión destilada del modelo base (LTX2-Distilled-Q6K), lo que sugiere que el LoRA es compatible con variantes destiladas de LTX-2.

## Capacidades

- Generación de vídeo texto-a-vídeo (T2V) del personaje Rapunzel de *Tangled* (2010).
- Generación de vídeo imagen-a-vídeo (I2V): el autor indica que «should work with I2V», aunque no se aportan ejemplos verificados.
- Control de estilo mediante prompt: incluir «animated style» produce el look CG animado original; sin esa etiqueta, el modelo tiende a un estilo realista.
- Control de vestuario mediante prompt: vestido morado original («purple dress», «purple dress with a pink laced bodice») o vestido rosa del epílogo («pink princess dress», no probado).
- Control de peinado mediante etiquetas: pelo largo dorado, trenza con flores, pelo corto castaño.
- Generación de diálogo hablado en el vídeo (los ejemplos muestran al personaje hablando con sincronización labial aparente, aunque no se detalla la técnica).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- **Creación de contenido fan y cortometrajes animados**: el LoRA permite generar clips consistentes del personaje con diálogo y expresiones faciales, útil para creadores que producen animaciones cortas o parodias. El trigger `rapstangled2010` garantiza la identidad del personaje en cada generación.
- **Prototipado rápido de escenas para previsualización**: estudios de animación pueden usar el adaptador para generar *animatics* o *previz* de escenas con Rapunzel antes de producir la animación final, reduciendo costes de preproducción.
- **Investigación en personalización de modelos de vídeo**: sirve como caso de estudio reproducible de fine-tuning LoRA sobre LTX-2, con dos checkpoints (750 y 2150 pasos) para comparar el efecto del sobreentrenamiento en la fidelidad del personaje.
- **Generación de material para redes sociales**: clips verticales u horizontales de temática Disney con estética cinematográfica, usando el modo destilado para inferencia rápida en una RTX 3060.
- **Pruebas de coherencia temporal en I2V**: el adaptador puede emplearse para evaluar cómo LTX-2 mantiene la identidad del personaje a lo largo de un clip cuando se parte de una imagen inicial, un problema abierto en generación de vídeo.
- **Docencia y divulgación técnica**: ejemplo práctico para explicar qué es un LoRA, cómo funciona un trigger word y cómo el prompt de estilo altera el resultado (animado vs. realista) en modelos de difusión de vídeo.
- **Benchmarking de adaptadores sobre LTX-2**: comparar el LoRA de 750 pasos frente al de 2150 pasos en términos de fidelidad al personaje, artefactos y flexibilidad de prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente aporta vídeos de muestra generados con LTX2-Distilled-Q6K en una RTX 3060 12 GB con 32 GB de RAM, sin métricas cuantitativas (FVD, CLIP score, consistencia temporal, etc.).

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma exacta para el LoRA. El modelo base LTX-2 en versión destilada Q6K se ejecutó en una RTX 3060 de 12 GB, por lo que 12 GB de VRAM es el mínimo confirmado para esa cuantización.
- **GPU recomendadas**: RTX 3060 12 GB (confirmada por el autor), RTX 4090, A100, H100 (el entrenamiento se hizo en H200). GPUs con menos de 12 GB no están verificadas.
- **Cabe en GPU de consumo**: sí, al menos en RTX 3060 12 GB con la variante destilada Q6K.
- **RAM del sistema**: 32 GB confirmados en las pruebas del autor.
- **Opciones de despliegue**: `diffusers` (librería declarada en el repo). No se confirma soporte para ComfyUI, llama.cpp, vLLM ni TGI (estos dos últimos no aplican a modelos de difusión de vídeo).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRAs comparables para LTX-2 en la documentación proporcionada. Como referencia cualitativa:

| Modelo | Tipo | Base | Licencia | Disponibilidad |
|---|---|---|---|---|
| tangled-rapunzel-ltx2 | LoRA de personaje | LTX-2 (Lightricks) | Apache 2.0 | Hugging Face |
| Otros LoRAs de LTX-2 | no disponible | LTX-2 | no disponible | no disponible |
| LoRAs de personaje para otros modelos de vídeo (p. ej. Wan, HunyuanVideo) | no disponible | no disponible | no disponible | no disponible |

No se han encontrado alternativas directas documentadas en la información disponible.

## Limitaciones y advertencias

- **Derechos de propiedad intelectual**: aunque la licencia del adaptador es Apache 2.0, el personaje Rapunzel y *Tangled* son propiedad de Disney. El uso comercial del personaje puede infringir derechos de autor y marcas registradas; la licencia del LoRA no cubre esos derechos.
- **Sobreajuste potencial**: el checkpoint de 2150 pasos puede sobreajustarse al personaje y reducir la flexibilidad de prompt; el de 750 pasos puede ser menos fiel. El autor no aporta comparativa entre ambos.
- **Dependencia del modelo base**: requiere descargar LTX-2 (Lightricks) por separado; el repo solo contiene el adaptador (1,2 GB).
- **Idioma**: el prompt de entrenamiento está en inglés; no se garantiza un comportamiento correcto con prompts en castellano u otros idiomas.
- **Estilo por defecto realista**: sin la etiqueta «animated style», el modelo tiende al fotorrealismo, lo que puede sorprender a quien espere el look CG por defecto.
- **Vestuario del epílogo no probado**: el autor marca explícitamente «Untested» el vestido rosa del epílogo.
- **I2V no verificado**: la compatibilidad con image-to-video se afirma pero no se demuestra con ejemplos.
- **Riesgo de alucinación visual**: como todo modelo de difusión, puede generar anatomías incorrectas, artefactos temporales, texto ilegible o inconsistencias entre fotogramas.
- **Sesgos**: no documentados; al estar entrenado sobre un personaje concreto, el riesgo de sesgo demográfico es limitado, pero el modelo base LTX-2 puede arrastrar sesgos de su dataset original.
- **Madurez del repo**: 0 descargas y 0 likes en el momento de la consulta; sin issues ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Clapcheex1/tangled-rapunzel-ltx2
- Modelo base LTX-2 (Lightricks): https://huggingface.co/Lightricks/LTX-2
- Descarga directa de archivos: https://huggingface.co/Clapcheex1/tangled-rapunzel-ltx2/tree/main
- Librería diffusers: https://github.com/huggingface/diffusers
