# dronefreak/Histoformer

## Resumen

Histoformer es un modelo de restauración de imágenes en condiciones meteorológicas adversas presentado en ECCV 2024 por Shangquan Sun, Wenqi Ren, Xinwei Gao, Rui Wang y Xiaochun Cao. Resuelve un problema clásico en visión por computador: eliminar lluvia, gotas de agua y nieve de una fotografía para recuperar la escena subyacente. Su particularidad frente a otros transformers de restauración es que sustituye la autoatención espacial o de canal por una autoatención sobre histogramas de intensidad, agrupando píxeles con degradación similar independientemente de su posición en la imagen.

El repositorio de Hugging Face que nos ocupa, `dronefreak/Histoformer`, no es la publicación oficial de los autores, sino un espejo comunitario que empaqueta los pesos preentrenados originales con una ruta de inferencia mínima en PyTorch puro, sin necesidad de clonar el framework BasicSR ni editar ficheros YAML. El modelo tiene 16.615.100 parámetros (unos 16,6 M) y un checkpoint de aproximadamente 64 MB, lo que lo sitúa en la liga de los modelos de restauración ligeros aptos para GPU de consumo.

Es relevante ahora porque la restauración todo-tiempo con una única red unificada evita mantener tres pipelines separados (deraining, desnowing, raindrop removal) y porque la licencia MIT y el tamaño reducido lo hacen directamente desplegable en producción, a diferencia de otros modelos de restauración con licencias más restrictivas o checkpoints de varios cientos de megabytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder-decoder en U de 4 niveles y autoatención sobre histogramas de intensidad |
| Parametros totales | 16.615.100 (16,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales; FP32/FP16 por pesos PyTorch) |
| Idiomas soportados | en (metadato de la model card; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors en el repo; checkpoints originales en `.pth` (`net_g_best.pth`, `net_g_real.pth`) |

## Arquitectura y entrenamiento

Histoformer es un transformer con forma de U de cuatro niveles, estructuralmente similar a Restormer, pero con un mecanismo de atención distinto. En lugar de restringir la autoatención al canal o a ventanas espaciales fijas, el modelo ordena y segmenta los features espaciales en bins de histograma según su intensidad y aplica autoatención dentro y entre esos bins. Esto agrupa píxeles con degradación parecida aunque estén dispersos por la imagen, lo que captura estructura de largo alcance que las ventanas locales pierden. Como la lluvia, las gotas y la nieve producen patrones de oclusión y brillo similares, una sola red cubre las tres degradaciones sin ramas específicas por tarea.

El repositorio publica dos checkpoints con entrenamiento distinto: `net_g_best.pth`, entrenado sobre un compuesto sintético todo-tiempo (Outdoor-Rain, Snow100K y RainDrop), y `net_g_real.pth`, afinado hacia fotografías reales. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en restauración de imagen); esa información debe consultarse en el paper y el repositorio oficial. El repo comunitario no aporta código de entrenamiento, solo inferencia.

## Capacidades

- Restauración de imágenes con lluvia (deraining) en escenas sintéticas y reales.
- Eliminación de gotas de agua sobre la lente (raindrop removal).
- Eliminación de nieve (desnowing) en imágenes de exterior.
- Modelo unificado: una sola red cubre las tres degradaciones sin selección de tarea.
- Inferencia imagen a imagen con salida de la misma resolución que la entrada.
- Ejecución en PyTorch puro en unas diez líneas, sin BasicSR ni ficheros de configuración.
- Dos checkpoints especializados: sintético (`net_g_best.pth`) y real (`net_g_real.pth`).
- No soporta tool calling, agentes, razonamiento multi-step ni procesamiento de texto.
- No tiene modo thinking, visión general, audio ni capacidades multilingües más allá del metadato `en`.

## Casos de uso

- Limpieza de imágenes de vigilancia: aplicar `net_g_real.pth` a fotogramas capturados con lluvia o nieve para mejorar la visibilidad antes de pasarlos a un detector de objetos o a un sistema de reconocimiento.
- Preprocesado para conducción autónoma: integrar el modelo como etapa previa a la percepción, de modo que la lluvia o las gotas sobre la cámara no degraden la detección de carriles y obstáculos.
- Fotografía de aficionado: restaurar fotos tomadas bajo la lluvia o con gotas en el objetivo, con el checkpoint real como opción por defecto para imágenes no de benchmark.
- Procesado por lotes de datasets meteorológicos: generar versiones limpias de conjuntos como Rain100L, SPA-Data o RealRain-1k-H para aumentar datos de entrenamiento de otros modelos.
- Drones y robótica de exterior: limpiar el flujo de vídeo en tiempo real gracias a los 16,6 M de parámetros, que permiten inferencia en GPU de consumo con baja latencia.
- Investigación en restauración: usar el modelo como baseline reproducible en experimentos de deraining, desnowing y raindrop removal con una licencia MIT que facilita su reutilización.
- Vigilancia de infraestructuras: mejorar imágenes de cámaras exteriores en condiciones adversas antes de alimentar sistemas de inspección automática.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el model-index (no verificados):

| Tarea | Dataset | PSNR (dB) | SSIM |
|---|---|---|---|
| Image deraining | Rain100L | 25,83 | 0,836 |
| Image deraining | SPA-Data | 32,18 | 0,929 |
| Image deraining | RealRain-1k-H | 21,86 | 0,761 |

No se han publicado en la información disponible resultados de benchmarks para desnowing ni raindrop removal, ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: muy baja; con 16,6 M de parámetros, el modelo en FP32 ocupa unos 66 MB de pesos, y en FP16 unos 33 MB. La memoria real la domina el tamaño de la imagen de entrada y los mapas de activación intermedios.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para resoluciones moderadas; A100, H100, RTX 4090, RTX 3090, RTX 3060 o superiores son holgadas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con suficiente memoria compartida para imágenes pequeñas.
- Opciones de despliegue: PyTorch nativo (ruta documentada en el repo), exportación a TorchScript o ONNX para servir con ONNX Runtime o TensorRT. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que son herramientas de modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Histoformer | 16,6 M | no aplica (imagen) | PSNR 25,83 en Rain100L | MIT | Hugging Face y GitHub |
| Restormer | no disponible en la información | no aplica | no disponible | no disponible | no disponible |
| Otros modelos de restauración adversa | no disponible | no aplica | no disponible | no disponible | no disponible |

La información proporcionada solo menciona Restormer como referencia arquitectónica (misma forma en U de cuatro niveles), sin datos de parámetros, rendimiento ni licencia que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- El repositorio es un espejo comunitario, no una publicación oficial de los autores; la responsabilidad del método y los pesos recae en Sun et al.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) y proceden de la fuente ClearView.
- Solo se documentan métricas de deraining; el rendimiento en desnowing y raindrop removal no está cuantificado en la información disponible.
- Riesgo de artefactos y alucinación visual: como todo modelo generativo de restauración, puede inventar texturas o suavizar detalles en regiones muy degradadas.
- El checkpoint sintético (`net_g_best.pth`) puede generalizar peor a fotos reales; para uso real se recomienda `net_g_real.pth`.
- No se documentan sesgos demográficos, pero al ser un modelo de imagen puede heredar sesgos de los datasets de entrenamiento (Outdoor-Rain, Snow100K, RainDrop).
- La licencia MIT permite uso comercial, pero conviene citar los papers originales y revisar los términos de los datasets de entrenamiento si se redistribuyen derivados.
- No apto para tareas de texto, razonamiento, agentes ni tool calling; su ámbito es exclusivamente la restauración de imagen.
- El metadato de idioma `en` es informativo y no implica procesamiento lingüístico.

## Enlaces

- [Hugging Face: dronefreak/Histoformer](https://huggingface.co/dronefreak/Histoformer)
- [Paper: Restoring Images in Adverse Weather Conditions via Histogram Transformer (arXiv:2407.10172)](https://arxiv.org/abs/2407.10172)
- [Repositorio oficial: sunshangquan/Histoformer](https://github.com/sunshangquan/Histoformer)
- [Fuente de benchmarks: ClearView](https://github.com/dronefreak/clearview/)
- [arXiv:1904.05050](https://arxiv.org/abs/1904.05050)
- [arXiv:1711.10098](https://arxiv.org/abs/1711.10098)
- [arXiv:1708.04512](https://arxiv.org/abs/1708.04512)
- [arXiv:1609.07769](https://arxiv.org/abs/1609.07769)
- [arXiv:1802.07412](https://arxiv.org/abs/1802.07412)
- [arXiv:1701.05957](https://arxiv.org/abs/1701.05957)
- [arXiv:1609.02087](https://arxiv.org/abs/1609.02087)
- [arXiv:1904.01538](https://arxiv.org/abs/1904.01538)
- [arXiv:2206.05514](https://arxiv.org/abs/2206.05514)
