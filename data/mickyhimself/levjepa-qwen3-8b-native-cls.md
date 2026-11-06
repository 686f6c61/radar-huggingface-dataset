# mickyhimself/LeVJEPA-Qwen3-8B-Native-CLS

## Resumen

LeVJEPA-Qwen3-8B-Native-CLS es un modelo experimental de comprensión de imagen y vídeo desarrollado por el usuario independiente mickyhimself. Se trata de un fine-tuning completo de Qwen3-8B al que se le acopla un conector visual entrenado que proyecta características del backbone de visión congelado LeVJEPA-VideoMix-Large al espacio de embeddings del modelo de lenguaje. El resultado es un sistema visión-lenguaje capaz de responder preguntas sobre imágenes y vídeos, no un adaptador LoRA ni un modelo oficial de la familia Qwen3-VL.

La arquitectura combina un codificador visual JEPA (Joint Embedding Predictive Architecture) que procesa cada fotograma de forma independiente con T=1, extrayendo su token CLS nativo de 1024 dimensiones, y un transformer Qwen3-8B de 8.190.735.360 parámetros totales. Cada fotograma se traduce en un único embedding de 4096 dimensiones que se concatena en orden temporal, lo que produce una representación visual muy compacta: un token por fotograma. El checkpoint publicado corresponde al paso 2084 del entrenamiento de SFT de vídeo.

El interés de este modelo es principalmente de investigación: explora la viabilidad de usar características CLS nativas de un backbone JEPA congelado como interfaz visual para un LLM, con un coste de tokens por fotograma extremadamente bajo. No obstante, el autor advierte explícitamente de que no se publican nuevas métricas de benchmark y de que el modelo no ha recibido una prueba end-to-end de generación en GPU tras la publicación. La licencia del backbone visual (CC BY-NC 4.0) limita además el uso comercial del sistema completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-8B) + conector MLP sobre backbone visual JEPA congelado |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (presupuesto de texto más generación de 1028 tokens por defecto en la entrada de inferencia) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para el componente Qwen3 y el conector; el backbone LeVJEPA-VideoMix-Large es CC BY-NC 4.0 |
| Formato de pesos | safetensors (model-*.safetensors en cuatro shards, connector.safetensors) |

## Arquitectura y entrenamiento

El sistema se compone de tres piezas. Primero, un backbone de visión LeVJEPA-VideoMix-Large congelado durante todo el entrenamiento, que codifica cada fotograma de forma independiente con entrada temporal T=1. Segundo, un conector entrenado formado por una LayerNorm y un MLP de dos capas con activación GELU que transforma la característica CLS nativa de 1024 dimensiones en un embedding de 4096 dimensiones compatible con Qwen3. Tercero, el modelo de lenguaje Qwen3-8B (revisión b968826d9c46dd6066d109eabc6255188de91218), fine-tuneado en su totalidad. Los fotogramas se concatenan en orden temporal, generando un token visual por fotograma.

El entrenamiento se organizó en tres etapas secuenciales, cada una de una época, con batch global de 256 y semilla 42. La alineación de imagen (2159 pasos, 552.551 ejemplos, lr 1e-4) entrenó solo el conector. El SFT de imagen (1408 pasos, 360.417 ejemplos, lr 1e-5) entrenó conector y Qwen3. El SFT de vídeo (2084 pasos, 533.423 ejemplos, lr 5e-6) entrenó conector y Qwen3, muestreando a 16 FPS con clips completos de longitud variable y un máximo de 512 fotogramas. El modo thinking de Qwen3 se desactivó tanto en entrenamiento como en inferencia. Se usó PyTorch 2.7.1, Transformers 4.57.1 y DeepSpeed 0.17.5 para el SFT (no necesario en inferencia). El preprocesado aplica letterboxing con preservación de relación de aspecto a 224×224 y normalización ImageNet.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes individuales.
- Comprensión de vídeo mediante muestreo a 16 FPS y codificación de un token visual por fotograma, con clips de hasta 512 fotogramas.
- Generación de texto descriptivo y respuestas en lenguaje natural sobre contenido visual, con decodificación greedy y thinking desactivado.
- Procesamiento de clips completos sin truncamiento silencioso: la entrada de inferencia lanza un error si se excede el límite de 512 fotogramas.
- No soporta audio ni dispone de mecanismo de memoria persistente para streaming.
- Soporte de tool calling, function calling y razonamiento multi-paso en modo agente: no documentado por el autor.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Investigación sobre interfaces visuales compactas: permite estudiar cómo se comporta un LLM cuando cada fotograma se representa con un único token de 4096 dimensiones, útil para analizar el compromiso entre compacidad y precisión de grounding visual.
- Descripción automática de vídeos cortos: el modelo puede generar descripciones en lenguaje natural de clips de hasta 512 fotogramas a 16 FPS, adecuado para prototipos de etiquetado o resumen de contenido.
- Respuesta a preguntas sobre imágenes en entornos de laboratorio: con el entry point `inference.py` se puede interrogar una imagen concreta sobre lo que ocurre en ella, como base para experimentos de VQA controlados.
- Evaluación comparativa de conectores visuales: al ser parte de una serie de experimentos (native_cls, patch_mean, patch_2x2), sirve como referencia para comparar estrategias de proyección de características JEPA a un LLM.
- Docencia y reproducción de pipelines visión-lenguaje: el repositorio incluye código de prompt, preprocesado y procedencia de entrenamiento, lo que facilita reproducir y auditar el flujo completo en un contexto académico.
- Análisis exploratorio de contenido visual en investigación: para conjuntos de imágenes o clips donde se quiera probar un esquema de muy bajo coste de tokens visuales antes de invertir en modelos con mayor resolución espacial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el repositorio no presenta nuevas afirmaciones de benchmark ni de rendimiento en streaming.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para los pesos del modelo de lenguaje y el conector, más la memoria del backbone visual LeVJEPA-VideoMix-Large (descargado aparte; su tamaño no se detalla en la información disponible) y las activaciones.
- GPU recomendadas: no documentadas por el autor. Por tamaño, un modelo de 8B en BF16 requiere GPUs con 24 GB o más de VRAM para el componente de lenguaje; el backbone visual adicional condiciona el requisito final.
- Cabe en GPU de consumo: previsiblemente en RTX 3090/4090 (24 GB) si se cuantiza el componente de lenguaje, aunque el autor no documenta cuantizaciones ni pruebas en estas GPU.
- Opciones de despliegue: el autor proporciona `inference.py` con CUDA, BF16 y decodificación greedy; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. Cargar el repositorio raíz con `AutoModelForCausalLM` solo carga el componente de lenguaje, sin capacidades visuales.
- Latencia y throughput: no disponibles. El autor señala que no se ha realizado una prueba end-to-end de generación en GPU en el momento de la publicación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Estado |
|---|---|---|---|---|---|
| LeVJEPA-Qwen3-8B-Native-CLS | 8,19 B | no disponible | Imagen y vídeo (1 token/fotograma) | Apache-2.0 + backbone CC BY-NC 4.0 | Experimental, 22 descargas |
| Qwen3-8B (base) | 8,19 B | no disponible en la información | No | Apache-2.0 | Oficial, ampliamente desplegado |
| Qwen3-VL (familia oficial) | no disponible | no disponible | Imagen y vídeo | no disponible en la información | Oficial |

La comparación relevante es con Qwen3-8B, del que deriva directamente y cuya única diferencia es la incorporación del conector y el backbone visual. Frente a la familia oficial Qwen3-VL, este modelo no es un producto oficial ni ha pasado por las mismas validaciones; su interés es experimental y su licencia efectiva queda restringida por el componente visual no comercial.

## Limitaciones y advertencias

- El backbone visual LeVJEPA-VideoMix-Large se distribuye bajo CC BY-NC 4.0, lo que impide el uso comercial del sistema completo aunque el componente de lenguaje sea Apache-2.0.
- El autor advierte de que la codificación independiente por fotograma no garantiza capacidad de streaming, grounding visual efectivo, precisión espacial ni rendimiento en vídeos largos.
- No hay entrada de audio ni memoria persistente de streaming.
- El modelo puede generar respuestas incorrectas; no se han publicado benchmarks que cuantifiquen su fiabilidad.
- El entry point de inferencia no ha recibido una nueva prueba end-to-end de generación en GPU tras la publicación; las comprobaciones realizadas son en CPU (carga y forward del conector, prompt sin thinking y sintaxis de Python).
- El límite de 512 fotogramas es estricto: la entrada lanza un error si se excede, sin truncamiento silencioso. Cambiar `--fps` o `--max-frames` se aparta de la receta de entrenamiento.
- El código del backbone visual requiere `trust_remote_code=True`; el autor recomienda inspeccionar ese código upstream antes de usarlo.
- El repositorio debe descargarse completo para ejecutar `inference.py`; cargar solo el modelo raíz con `AutoModelForCausalLM` no habilita las capacidades visuales.
- No se documentan idiomas soportados ni sesgos conocidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mickyhimself/LeVJEPA-Qwen3-8B-Native-CLS
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Backbone visual LeVJEPA-VideoMix-Large: https://huggingface.co/galilai-group/LeVJEPA-VideoMix-Large
