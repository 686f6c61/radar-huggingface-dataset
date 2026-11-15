# mu2solutions/Molmo2-O-7B-GGUF

## Resumen

Molmo2-O-7B es un modelo multimodal de imagen a texto desarrollado por el Allen Institute for AI (AI2), publicado bajo licencia Apache 2.0. Combina un codificador visual SigLIP con un proyector de cross-attention con pooling y un backbone de texto de 7B parámetros de la familia OLMo2, con arquitectura `olmo2` y QK-norm por cabeza. El modelo base cuenta con 7.298.093.056 parámetros totales según los safetensors del repositorio original.

La ficha que nos ocupa, `mu2solutions/Molmo2-O-7B-GGUF`, es una conversión a formato GGUF publicada por Mu2 Solutions, que no existía públicamente en el momento de su creación (septiembre de 2026). Incluye una cuantización Q4_K_M del backbone de texto (4,47 GB) y un proyector visual en F16 (927 MB), pensados para su uso conjunto con `llama-mtmd-cli`.

Su relevancia radica en dos factores: por un lado, permite ejecutar un modelo multimodal completamente abierto en hardware modesto mediante llama.cpp; por otro, expone una limitación importante del ecosistema, ya que el grafo de visión de Molmo2 todavía no está integrado en el repositorio upstream de llama.cpp y requiere un fork experimental de Mu2 (build `b11936`) para cargar el mmproj.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: codificador SigLIP ViT + proyector de cross-attention con pooling (SwiGLU) + backbone de texto `olmo2` con QK-norm por cabeza |
| Parametros totales | 7.298.093.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 4096`) |
| Tipos de cuantizacion | Q4_K_M (texto) y F16 (proyector visual mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto Q4_K_M + mmproj F16); pesos originales en safetensors en `allenai/Molmo2-O-7B` |

## Arquitectura y entrenamiento

El modelo sigue un diseño multimodal de tres componentes. El codificador visual es un SigLIP ViT en F16 que procesa vistas de 378x378 píxeles. La conexión entre visión y lenguaje se realiza mediante un proyector de cross-attention con pooling, que incluye tensores separados `mm.pool.k` y `mm.pool.v` y una fila `mm.image_patch_add` precalculada, además de una proyección SwiGLU. El backbone de texto es un transformer `olmo2` de 7B parámetros con normalización QK por cabeza.

La conversión a GGUF se realizó a partir de la revisión `784410650d12` del repositorio original (congelada el 23 de enero de 2026), usando el conversor HF-to-GGUF de llama.cpp junto con el conversor de visión Molmo2 de Mu2 en el commit `c3d25ece9`. El mmproj resultante contiene 315 tensores e incluye la plantilla de chat embebida desde el repositorio fuente. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto a partir de imágenes (image-text-to-text), incluyendo descripción de contenido visual y lectura de texto presente en la imagen.
- Comprensión de marcas corporativas, logotipos y tipografías, verificada en la prueba del autor con una imagen de wordmark corporativo.
- Conversación multi-turno mediante plantilla de chat embebida.
- Procesamiento de vistas de imagen de 378x378 píxeles.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, modo thinking, audio ni otras modalidades distintas de imagen y texto.

## Casos de uso

- Descripción automática de imágenes en catálogos y bases de datos: el modelo puede generar descripciones en una frase por imagen, útil para indexación y accesibilidad, aunque el coste de codificación visual exige GPU para volúmenes altos.
- Lectura y extracción de texto en imágenes (OCR semántico): la verificación del autor demuestra que transcribe correctamente palabras y colores de un logotipo, lo que lo hace apto para digitalizar carteles, etiquetas o capturas.
- Moderación y clasificación de contenido visual: al ser un modelo abierto y desplegable en local, permite procesar imágenes sensibles sin enviarlas a servicios externos.
- Asistentes de accesibilidad: generación de descripciones de imágenes para lectores de pantalla en aplicaciones de escritorio, ejecutables con llama.cpp en hardware de consumo.
- Análisis de documentos escaneados con contexto visual: combinación de lectura de texto y comprensión de disposición gráfica, siempre que se disponga de GPU para la fase de codificación.
- Prototipado e investigación en multimodalidad: al ser Apache 2.0 y con pesos GGUF, sirve para experimentar con pipelines de visión-lenguaje sin restricciones de licencia ni dependencia de APIs.
- Despliegue en entornos air-gapped: la inferencia local con llama.cpp permite usar el modelo en redes aisladas donde no se puede recurrir a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento medidos son los de la verificación del autor en un Intel i3-2100 sin GPU: la codificación visual de una vista de 378x378 tardó 491.094 ms (unos 8 minutos), frente a aproximadamente 0,6 s en una Intel Arc A770. La generación de una descripción de 40 tokens se completó con 4 hilos y temperatura 0.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de texto Q4_K_M ocupa 4,47 GB y el mmproj F16 927 MB, lo que suma aproximadamente 5,4 GB de pesos; a esto hay que añadir la caché KV y los buffers de activación.
- GPU recomendadas: Intel Arc A770 (medida por el autor, ~0,6 s por vista), y por extrapolación cualquier GPU con soporte F16 razonable; no se han publicado mediciones en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en cuantización Q4_K_M, aunque no hay cifras oficiales de consumo pico.
- Despliegue: exclusivamente mediante el fork experimental de llama.cpp de Mu2 (build `b11936`), usando `llama-mtmd-cli` con `-m` para el texto y `--mmproj` para el proyector. No funciona en builds upstream de llama.cpp, ni por tanto en Ollama, vLLM o TGI en su estado actual.
- Latencia: en CPU antigua sin F16C, unos 8 minutos por vista de 378x378; en Arc A770, unos 0,6 s. El throughput de generación de texto no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Soporte llama.cpp upstream |
|---|---|---|---|---|---|
| Molmo2-O-7B (esta ficha, GGUF de Mu2) | 7,3B | no disponible | Apache 2.0 | Sí (Q4_K_M + mmproj F16) | No (requiere fork de Mu2) |
| Molmo2-4B (GGUF de Mu2) | no disponible | no disponible | Apache 2.0 | Sí | No (requiere fork de Mu2) |
| Molmo2-8B (GGUF de Mu2) | no disponible | no disponible | Apache 2.0 | Sí | No (requiere fork de Mu2); visión no resuelta |

No se dispone de datos de benchmarks ni de comparativas con otros modelos multimodales abiertos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no carga en llama.cpp upstream: requiere el fork experimental de Mu2 (build `b11936`), lo que limita su integración en pipelines estándar y su mantenimiento a largo plazo.
- La codificación visual es costosa en CPU sin F16C: unos 8 minutos por vista en un i3-2100, lo que hace inviable el procesamiento por lotes sin GPU.
- Fuga de marcadores de frame: en la prueba del autor aparecieron dos tokens literales `<frame_end>` tras la descripción. Es cosmético, pero requiere postprocesado en producción.
- Advertencia de tipo de token al cargar: llama.cpp avisa de que `</s>` no es de tipo control y lo sobrescribe; el mismo aviso aparece en las conversiones de 4B y 8B.
- Riesgo de alucinación visual: aunque la prueba verificada fue correcta, no hay datos sobre tasas de error en imágenes ambiguas o de baja calidad.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe sin evaluación previa.
- Licencia Apache 2.0 sin restricciones adicionales para uso comercial, pero la dependencia de un fork no oficial traslada el riesgo al mantenimiento del código de inferencia.
- Contexto máximo no documentado en la información disponible; el ejemplo usa 4096 tokens.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mu2solutions/Molmo2-O-7B-GGUF
- Modelo base: https://huggingface.co/allenai/Molmo2-O-7B
- Repositorio de Mu2 para el 8B (explicación del fork): https://huggingface.co/mu2solutions/Molmo2-8B-GGUF
- Repositorio de Mu2 para el 4B: https://huggingface.co/mu2solutions/Molmo2-4B-GGUF
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
