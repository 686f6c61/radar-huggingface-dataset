# Agnes-AI/Agnes-Video-H3-MoE

## Resumen

Agnes-Video-H3-MoE es un checkpoint experimental publicado por Agnes-AI que convierte parte de las capas feed-forward del modelo de generación de vídeo y audio MiniMax-H3 FL2VA en una mezcla de expertos (MoE) dispersa a nivel de token. No se trata de un modelo entrenado desde cero, sino de un *finetune* sobre los pesos originales de MiniMax-H3, que permanecen congelados; lo único entrenado son los routers y unas LoRA de rango 64. El paquete se distribuye como modelo compuesto (pesos base, `init.json` con el mapeo de neuronas y `step-60.safetensors` con routers y LoRA), no como checkpoint fusionado.

La propuesta técnica es interesante: 20 de los 50 bloques DiT (del 15 al 34) pasan de un FFN denso de 14.336 neuronas a un esquema con un experto compartido siempre activo (3.072) más ocho expertos privados (6.144 cada uno), de los que cada token activa exactamente uno (top-1). Según el cargador de referencia, el recuento de parámetros en la ruta activa por token baja de 33.123B (denso) a 31.472B antes de contar las rutas LoRA activas.

Es relevante ahora por dos motivos. Primero, porque explora la aplicación de MoE disperso a modelos de difusión para vídeo, un terreno mucho menos trillado que el MoE en LLM. Segundo, porque el propio autor es explícito sobre su estado: 60 pasos de entrenamiento, 128 ejemplos cacheados, sin validación end-to-end de la configuración exacta y sin mejoras medidas de calidad, velocidad o memoria. Es, por tanto, material de investigación reproducible, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con FFN convertidos a MoE disperso top-1 + experto compartido en bloques 15–34 (20 de 50) |
| Parametros totales | No disponible como cifra única; el paquete completo ocupa ~135 GB (repo en HF: 144,7 GB) |
| Parametros activos | 31,472B por token en la ruta principal del DiT antes de rutas LoRA activas (denso FL2VA: 33,123B) |
| Longitud de contexto | No aplica en el sentido de LLM; condicionamiento por prompt de texto y opcionalmente primer/último fotograma. No disponible un límite explícito de tokens de prompt |
| Tipos de cuantizacion | No disponible (pesos base en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License Agreement |
| Formato de pesos | safetensors (BF16), más `init.json` y código de carga DiffSynth |

## Arquitectura y entrenamiento

El modelo parte de MiniMax-H3 FL2VA en BF16, un transformer de difusión con 50 bloques DiT que genera vídeo y audio de forma conjunta. La modificación afecta a los bloques 15 a 34: cada FFN denso de 14.336 neuronas se reemplaza por un experto compartido de 3.072 neuronas, siempre activo, y ocho expertos privados de 6.144 neuronas cada uno. El enrutamiento es top-1 por token, de modo que tokens distintos del mismo vídeo pueden escoger expertos privados distintos. Los pesos base permanecen congelados; `init.json` mapea las neuronas del FFN original a los expertos y aporta los valores iniciales del router, y `step-60.safetensors` sustituye esos valores por los routers entrenados y carga las LoRA (rango 64, alpha 64). Los ocho expertos privados se almacenan completos aunque cada token ejecute solo uno. La ruta AdaLN conserva los pesos densos originales y no incluye artefacto de conversión.

El entrenamiento es muy corto y está documentado con detalle: 60 pasos sobre 128 ejemplos de vídeo/audio cacheados, dos GPUs, BF16, batch global 2, learning rate de LoRA 1e-4 y de router 2e-5. El paquete no contiene datos de entrenamiento y la procedencia del dataset no se documenta. Los logs muestran probabilidades medias de router casi uniformes, lo que no permite afirmar que exista especialización estable de expertos dentro de un mismo vídeo. La configuración de referencia para inferencia es 480×832, 90 o 124 fotogramas, 50 pasos de denoising, CFG 1.0, flow shift de vídeo 12.0 y de audio 3.0, salida a 24 fps y audio a 32 kHz; los fotogramas deben cumplir `frames % 17 == 5` y las dimensiones ser múltiplos de 32.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), con audio generado conjuntamente.
- Condicionamiento opcional por primer fotograma, último fotograma o ambos (FL2VA), lo que permite interpolar o animar imágenes.
- Generación de audio sincronizada con el vídeo a 32 kHz.
- Enrutamiento MoE disperso por token: cada token selecciona uno de ocho expertos privados más el compartido.
- Carga mediante el loader de referencia basado en DiffSynth, con offloading a CPU.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-step ni comprensión multimodal de entrada más allá del condicionamiento por imagen.
- No se documenta soporte multilingüe del prompt de texto.

## Casos de uso

- Investigación sobre MoE en modelos de difusión: el paquete permite reproducir el experimento de conversión de FFN densos a MoE top-1 y estudiar el comportamiento del router con los logs y el código incluidos.
- Prototipado de vídeo corto con audio para demos internas: con 480×832, 90 o 124 fotogramas y 50 pasos, sirve para generar clips de prueba de pocos segundos con pista de audio, siempre revisando los artefactos.
- Condicionamiento por fotogramas para animación de imágenes fijas: usar `--first` y `--last` permite generar transiciones entre dos imágenes, útil en pruebas de concepto de motion graphics.
- Comparación de eficiencia de rutas activas: el recuento de 31,472B frente a 33,123B por token permite instrumentar experimentos sobre parámetros activos, aunque el autor advierte que no equivale a mejoras medidas de velocidad ni memoria.
- Base para adaptaciones LoRA posteriores: al estar los pesos base congelados y las LoRA separadas, es un punto de partida razonable para experimentar con ajustes finos sobre el esquema MoE.
- Docencia y formación técnica: el paquete incluye loader, script de inferencia, comprobador offline (`deploy/check.py`) y manifiesto con hashes, lo que facilita explicar un pipeline de difusión con MoE de forma reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta release no reclama mejoras medidas de calidad, velocidad ni memoria, y que los 16 clips generados con una configuración interna relacionada no validan este paquete exacto porque su ruta AdaLN era distinta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial; el paquete completo ronda los 135 GB y el script de referencia usa offloading a CPU, por lo que se necesita RAM de sistema y espacio en disco considerables además de VRAM.
- GPUs recomendadas: no especificadas por el autor. Por el tamaño del modelo base en BF16, el despliegue realista pasa por GPUs de centro de datos (A100/H100 de 80 GB) o configuraciones multi-GPU; no hay confirmación de que quepa en una RTX 4090 de 24 GB incluso con offloading.
- Cabe en GPU de consumo: no confirmado; el offloading a CPU del script de referencia sugiere que no es un caso de uso pensado para una sola GPU de consumo.
- Opciones de despliegue: cargador de referencia DiffSynth incluido en `deploy/`. SGLang puede usarse para offloading de AdaLN, pero el repositorio no incluye adaptador MoE para SGLang ni validación end-to-end; servir `FL2VA/` con el comando denso estándar de MiniMax-H3 no aplica el mapeo de expertos ni los routers/LoRA entrenados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros activos por token (DiT) | Contexto / condicionamiento | Estado | Licencia |
|---|---|---|---|---|
| Agnes-Video-H3-MoE | 31,472B (ruta principal, antes de LoRA) | Prompt de texto + primer/último fotograma | Experimental, 60 pasos, sin validación end-to-end | MiniMax H3 Community License |
| MiniMax-H3 FL2VA (denso) | 33,123B | Prompt de texto + primer/último fotograma | Modelo base publicado | MiniMax H3 Community License |
| Otros modelos text-to-video con audio | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es contra su propio modelo base: el checkpoint MoE reduce el recuento de parámetros en la ruta activa por token en aproximadamente un 5 % (de 33,123B a 31,472B), pero el autor no aporta mediciones de velocidad, FLOPs ni memoria que confirmen una ventaja práctica. No se dispone de datos de benchmarks frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenamiento muy corto: 60 pasos sobre 128 ejemplos, sin datos de entrenamiento incluidos ni procedencia documentada del dataset.
- Los logs muestran probabilidades de router casi uniformes; no hay evidencia de especialización estable de expertos dentro de un vídeo.
- La configuración exacta de esta release no ha sido validada end-to-end según el propio autor.
- Generación sujeta a artefactos visuales y de audio; es obligatorio revisar las salidas antes de cualquier uso.
- No se incluye adaptador MoE para SGLang ni validación con SGLang; usar el comando denso estándar ignora silenciosamente el mapeo de expertos y los routers/LoRA.
- El paquete es compuesto, no fusionado: requiere cargar `FL2VA/`, `init.json` y `step-60.safetensors` con el loader correcto; cargar solo `FL2VA/` ejecuta el modelo denso original.
- Restricciones de licencia: MiniMax H3 Community License Agreement, con limitaciones de redistribución y uso que deben revisarse antes de cualquier despliegue comercial.
- El código DiffSynth incluido en `deploy/` tiene su propia licencia (`deploy/LICENSE`), distinta de la del modelo.
- Requisitos de recursos elevados (paquete de ~135 GB, offloading a CPU, posible necesidad de mucha RAM y disco), lo que complica su uso fuera de entornos de investigación.
- Sin información sobre sesgos, idiomas soportados ni límites de prompt; no debe asumirse cobertura multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Agnes-AI/Agnes-Video-H3-MoE
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Agnes AI (plataforma del autor): https://www.agnes-ai.com/
- Agnes AI research: https://agnes-ai.com/research
- Agnes app: https://app.agnes-ai.com/
- Agnes AI campaign: https://agnes-ai.cn/campaign
- Agnes Code: https://agnes-ai.cn/agnescode
