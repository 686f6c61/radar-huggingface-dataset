# softandsweet/timm-mobilenetv3-small-100-lamb-in1k-rngd-fxbx

## Resumen

El modelo `softandsweet/timm-mobilenetv3-small-100-lamb-in1k-rngd-fxbx` es una adaptación del clasificador de imágenes MobileNetV3-Small de la librería `timm`, afinado sobre ImageNet-1k y empaquetado específicamente para su despliegue en el acelerador NPU RNGD de FuriosaAI. El autor, `softandsweet`, parte del checkpoint `timm/mobilenetv3_small_100.lamb_in1k` y lo publica como un perfil de inferencia FP32 con entrada de 224×224 píxeles y salida sobre las 1.000 clases de ImageNet.

El interés del artefacto no reside en la arquitectura (que es la MobileNetV3-Small estándar, ya ampliamente conocida) sino en el empaquetado: la model card documenta latencias medidas sobre hardware RNGD (P50 de 76,36 ms y P95 de 76,77 ms por grafo, excluyendo preprocesado y postprocesado) y una validación de equivalencia Top-5 frente a una referencia FP32 en CPU. Es, por tanto, un modelo orientado a demostrar y validar el flujo de compilación y ejecución de FuriosaAI sobre una CNN ligera.

El repositorio tiene un tamaño de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y no incluye información sobre idiomas ni sobre resultados de benchmarks más allá de la validación cualitativa descrita. Su licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small (CNN, bloques con atención squeeze-and-excitation y activaciones h-swish) |
| Parametros totales | no disponible en la informacion proporcionada (el checkpoint base `mobilenetv3_small_100` ronda los 2,5 M, dato no confirmado en la ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224×224×3) |
| Tipos de cuantizacion | FP32 (perfil documentado en la model card); no se indican otros formatos |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin componente linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo de 0,0 GB; la model card no especifica safetensors, GGUF ni formato de artefacto RNGD) |

## Arquitectura y entrenamiento

La arquitectura subyacente es MobileNetV3-Small, una red convolucional diseñada para eficiencia computacional en dispositivos con recursos limitados. Emplea convoluciones separables en profundidad, bloques residuales invertidos con linear bottleneck, módulos de atención squeeze-and-excitation en parte de los bloques y activaciones h-swish. El checkpoint de partida es `timm/mobilenetv3_small_100.lamb_in1k`, entrenado con ImageNet-1k y optimizador LAMB, según la convención de nombres de `timm`.

No se dispone de información sobre el proceso de afinado adicional, la composición del dataset de entrenamiento, el número de tokens o imágenes vistas, ni sobre si se aplicaron técnicas de destilación o ajuste fino específicas. La model card se limita a describir el perfil de despliegue: entrada 224×224 en FP32, ejecución sobre un único RNGD, ausencia de fallback a CPU y ausencia de compilación en tiempo de ejecución durante los 2.011 pasos de la validación en NPU. La innovación técnica destacable es, por tanto, la integración con el compilador y runtime de FuriosaAI, no cambios en la arquitectura del modelo.

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k a partir de entradas de 224×224 píxeles en FP32.
- Inferencia sobre NPU RNGD de FuriosaAI con latencias documentadas (P50 76,36 ms, P95 76,77 ms por grafo, sin contar preprocesado ni postprocesado).
- Ejecución sin fallback a CPU y sin compilación en tiempo de ejecución en la validación reportada (2.011 pasos).
- Equivalencia Top-5 verificada frente a una referencia FP32 en CPU sobre dos imágenes reales.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión generativa, audio ni modo thinking; es exclusivamente un clasificador discriminativo.
- No se documentan capacidades multilingües ni procesamiento de lenguaje natural.

## Casos de uso

- Clasificación de imágenes en producción sobre aceleradores FuriosaAI: el modelo sirve como referencia de extremo a extremo para validar pipelines de compilación y despliegue en RNGD antes de mover cargas mayores.
- Etiquetado automático de catálogos de imágenes: con 76 ms por inferencia en un único RNGD, permite procesar lotes moderados de imágenes con etiquetas ImageNet como punto de partida para un etiquetado fino posterior.
- Filtrado y moderación preliminar de contenido visual: clasificación rápida de imágenes entrantes para descartar o enrutar categorías evidentes antes de modelos más costosos.
- Benchmark de infraestructura NPU: al tener latencias P50/P95 publicadas y una validación de equivalencia numérica, es útil como prueba de regresión al actualizar drivers o compiladores de FuriosaAI.
- Prototipado de aplicaciones de visión en el borde o en servidores con aceleradores dedicados: la combinación de MobileNetV3-Small (bajo coste computacional) y RNGD permite iterar rápido en demos de clasificación.
- Componente de un pipeline de búsqueda visual: usar las etiquetas ImageNet como señal auxiliar junto a embeddings de otro modelo para recuperación o agrupamiento de imágenes.
- Docencia y experimentación con `timm`: sirve como ejemplo de exportación de un modelo `timm` a un backend NPU concreto, útil para quienes estudian flujos de despliegue heterogéneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (accuracy Top-1/Top-5 en ImageNet, throughput, etc.) en la información disponible. La model card únicamente reporta métricas de latencia y una validación cualitativa:

| Metrica | Valor |
|---|---|
| Latencia P50 por grafo (RNGD, FP32, sin pre/postproceso) | 76,36 ms |
| Latencia P95 por grafo (RNGD, FP32, sin pre/postproceso) | 76,77 ms |
| Pasos de validación en NPU | 2.011 |
| Fallback a CPU durante la validación | ninguno |
| Compilación en tiempo de ejecución | ninguna |
| Equivalencia Top-5 vs. referencia FP32 en CPU | misma ordenación en dos imágenes reales |

## Requisitos de hardware

- Acelerador objetivo: NPU RNGD de FuriosaAI (un único dispositivo para el perfil documentado).
- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y no se detallan requisitos de memoria del dispositivo.
- GPU recomendadas: no aplica para el perfil RNGD; para ejecutar el checkpoint base `timm` en GPU convencional se puede usar cualquier GPU con soporte PyTorch (el modelo es muy ligero), pero no se documentan requisitos concretos.
- Compatibilidad con GPU de consumo: el checkpoint base de MobileNetV3-Small es ejecutable en GPU de consumo e incluso en CPU, pero el artefacto publicado está orientado a RNGD y no se confirma su portabilidad a otros backends.
- Opciones de despliegue: runtime y CLI/HTTP de FuriosaAI (se enlazan `USAGE.md` y `VALIDATION.json` en la model card); para el modelo base, `timm` sobre PyTorch, y potencialmente exportación a ONNX u otros formatos, aunque no se documenta.
- Latencia y throughput: 76,36 ms P50 y 76,77 ms P95 por grafo en RNGD; el throughput no se reporta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `softandsweet/timm-mobilenetv3-small-100-lamb-in1k-rngd-fxbx` | no disponible (base MobileNetV3-Small) | 224×224×3 | P50 76,36 ms en RNGD; accuracy no reportada | Apache-2.0 | Hugging Face, 0 descargas |
| `timm/mobilenetv3_small_100.lamb_in1k` (modelo base) | ~2,5 M (dato no confirmado en la ficha) | 224×224×3 | Accuracy ImageNet publicada por `timm`; latencias dependientes de hardware | Apache-2.0 | Hugging Face, ampliamente usado |
| MobileNetV3-Large (variante mayor de la familia) | no disponible en esta ficha | 224×224×3 | Mayor accuracy a mayor coste computacional | Apache-2.0 | Disponible en `timm` y otros repositorios |
| EfficientNet-B0 (alternativa CNN ligera) | no disponible en esta ficha | 224×224×3 | Mayor accuracy típica a mayor coste | Apache-2.0 | Disponible en `timm` |

La comparación cuantitativa de accuracy no es posible con la información proporcionada; las alternativas se incluyen por categoría (CNN ligeras para clasificación ImageNet) y no por datos medidos en esta ficha.

## Limitaciones y advertencias

- Modelo de clasificación discriminativa: no genera texto, no razona y no soporta instrucciones; cualquier uso conversacional o agéntico queda fuera de su alcance.
- Sesgos heredados de ImageNet-1k: el conjunto de etiquetas y la distribución de entrenamiento introducen sesgos geográficos, culturales y de representación conocidos en la literatura sobre ImageNet.
- Riesgo de alucinación en sentido estricto no aplica, pero sí de clasificaciones erróneas con alta confianza en clases ambiguas o fuera de distribución.
- Validación limitada: la equivalencia Top-5 se comprobó sobre dos imágenes reales, una muestra muy reducida que no permite extrapolar robustez estadística.
- Sin datos de accuracy publicados en la ficha: no se puede evaluar la degradación respecto al checkpoint base ni el efecto del empaquetado para RNGD.
- Dependencia de hardware: el perfil está pensado para RNGD de FuriosaAI; su portabilidad a GPU, CPU u otros aceleradores no está documentada.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, pero conviene revisar las condiciones del modelo base `timm` y de los pesos originales de MobileNetV3.
- Repositorio sin descargas ni likes y con tamaño de 0,0 GB: la disponibilidad efectiva de los pesos no está confirmada por métricas de uso.
- Idiomas no aplicables, pero la model card está redactada parcialmente en coreano, lo que puede dificultar la revisión a equipos no familiarizados con ese idioma.

## Enlaces

- Hugging Face: https://huggingface.co/softandsweet/timm-mobilenetv3-small-100-lamb-in1k-rngd-fxbx
- Modelo base en Hugging Face: https://huggingface.co/timm/mobilenetv3_small_100.lamb_in1k
- Ejemplos CLI y HTTP (referenciado en la model card): `USAGE.md` dentro del repositorio
- Registro de validación (referenciado en la model card): `VALIDATION.json` dentro del repositorio
- Fuentes y atribución (referenciado en la model card): `NOTICE.md` dentro del repositorio
- Documentación de FuriosaAI: no disponible en la información proporcionada
- Paper de MobileNetV3: no disponible en la información proporcionada (referencia habitual: Howard et al., "Searching for MobileNetV3", 2019)
