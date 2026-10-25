# minhlol/Bm-bohrium-24B-UltraChat-QLoRA

## Resumen

Bm-bohrium-24B-UltraChat-QLoRA es un adaptador QLoRA experimental de tipo vision-language publicado por el usuario minhlol en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una extensión del checkpoint minhlol/Bm-bohrium-7B-continued-QLoRA hasta un backbone declarado de 24.001.085.184 parámetros, sobre el que se han añadido un encoder ViT, un proyector y adaptadores de lenguaje. El autor lo describe explícitamente como un prototipo y advierte de que no se ha realizado un preentrenamiento completo a escala de 24B.

El modelo combina un backbone de lenguaje cuantizado en NF4 y mantenido congelado con adaptadores PEFT entrenados, más un entrenamiento de la torre de visión (encoder ViT y proyector). La ventana de contexto no está documentada y los idiomas declarados son inglés y vietnamita. Su relevancia es limitada: se trata de un experimento de bajo coste computacional (175 pasos de actualización, 64.220 tokens de respuesta) que ilustra el flujo QLoRA aplicado a visión, no de una alternativa lista para producción.

El repositorio ocupa 23,5 GB e incluye el backbone en NF4, los adaptadores, los pesos de visión y proyector, y el estado necesario para reanudar el entrenamiento. No hay pesos en GGUF ni integración con Ollama, y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con adaptador de visión (ViT + proyector) sobre backbone cuantizado NF4; adaptadores QLoRA (PEFT) |
| Parámetros totales | 24.001.085.184 declarados por el autor (495 capas de lenguaje más ViT/proyector) |
| Parámetros activos | No aplica (no es un modelo MoE); el backbone NF4 permanece congelado y solo se entrenan adaptadores, ViT y proyector |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Backbone en NF4 (QLoRA, vía bitsandbytes); adaptadores, vision.safetensors y projector.safetensors en safetensors sin cuantizar; sin GGUF |
| Idiomas soportados | Inglés (en) y vietnamita (vi) |
| Licencia | No disponible (el autor remite al archivo LICENSE del repo y a las condiciones de cada fuente de datos) |
| Formato de pesos | safetensors: backbone NF4 en `language/`, adaptadores PEFT en `adapter/`, `vision.safetensors`, `projector.safetensors` y estado de entrenamiento |
| Librería | peft (con transformers y bitsandbytes para la carga) |
| Tamaño del repositorio | 23,5 GB |
| Pipeline declarado | No disponible |
| Modelo base | minhlol/Bm-bohrium-7B-continued-QLoRA |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de lenguaje decoder-only con un backbone declarado de 24B parámetros que, según la model card, se obtiene extendiendo un checkpoint previo de 7B. El autor indica que este backbone de 24B no ha sido preentrenado de forma completa a esa escala, lo que implica que parte de los pesos no han recibido el cómputo de entrenamiento habitual para ese tamaño. Sobre ese backbone cuantizado en NF4 y congelado se montan tres elementos entrenables: el encoder ViT de visión, el proyector que alinea los embeddings visuales con el espacio del lenguaje y adaptadores LoRA en las capas de lenguaje.

El entrenamiento de visión documentado comprende 175 pasos de actualización y 64.220 tokens de respuesta. La composición del batch mezcla un 20% de pares imagen-texto en vietnamita, un 20% en inglés, un 30% de UltraChat y un 30% de vi-alpaca. Las fuentes citadas son ai-enthusiasm-community/UIT-ViIC y HuggingFaceM4/the_cauldron (subconjunto textcaps) para visión, y branles14/ultrachat-uncensored_full y bkai-foundation-models/vi-alpaca para texto; las revisiones de los datasets están fijadas en `vision_data_revisions.json`. El autor afirma haber verificado cambios efectivos de pesos y gradientes en encoder y proyector, y publica `vision_validation.json` con una evaluación held-out reducida, que no constituye un benchmark amplio.

## Capacidades

- Descripción de imágenes y respuesta a preguntas sobre imágenes en vietnamita e inglés, mediante el par ViT + proyector entrenado.
- Conversación multi-turno de texto heredada de los adaptadores afinados sobre UltraChat y vi-alpaca.
- Generación de texto en inglés y vietnamita, los dos idiomas declarados en los tags del repositorio.
- Continuación del entrenamiento: el repositorio incluye el estado necesario para reanudar el ajuste de visión.
- Soporte de tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, audio u otras modalidades: no disponibles.
- Razonamiento matemático o generación de código especializada: no documentados ni evaluados.

## Casos de uso

- Prototipado de descriptores de imagen en vietnamita: el modelo puede recibir una imagen y devolver una descripción textual en vietnamita usando la API `model.answer(...)` del script `load_bm24_vision.py`, útil para validar pipelines de captioning antes de invertir en un modelo mayor.
- Investigación sobre QLoRA multimodal: sirve como caso de estudio reproducible de ajuste de ViT y proyector con backbone NF4 congelado, dado que el repo conserva el estado de entrenamiento y las revisiones de datasets fijadas.
- Experimentos de alineación imagen-texto bilingüe inglés-vietnamita: la mezcla 20/20 de datos visuales en ambos idiomas permite estudiar transferencia cruzada en un entorno controlado y de bajo coste.
- Docencia y formación técnica: el repositorio y el script de carga permiten mostrar de forma práctica las limitaciones de extender un checkpoint pequeño a un backbone grande sin preentrenamiento completo.
- Evaluación comparativa de robustez: útil para medir cuánto rinde un ajuste de solo 175 pasos frente a modelos vision-language con entrenamiento a gran escala, siempre con expectativas de calidad bajas.
- Base para experimentos de continuación de entrenamiento: al incluir optimizer state y backbone NF4, se puede reanudar el ajuste con más datos o más pasos para investigar curvas de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona un archivo `vision_validation.json` con una evaluación held-out pequeña antes/después del entrenamiento, pero no se proporcionan cifras en la información disponible, y el propio autor indica que no se trata de un benchmark amplio.

## Requisitos de hardware

- VRAM estimada en inferencia: el backbone de 24B en NF4 ocupa aproximadamente 13-14 GB de pesos; sumando adaptadores, ViT, proyector y caché KV, el consumo realista se sitúa en el entorno de 16-20 GB para contextos cortos.
- GPU recomendadas: A100 40 GB o H100 para trabajar con margen y contextos largos; A6000 de 48 GB como alternativa de una sola tarjeta.
- GPU de consumo: cabe en RTX 3090, RTX 4090 o RTX 5090 con 24 GB, ajustado y con contexto reducido; por debajo de 24 GB no es viable con esta configuración.
- Despliegue en FP16/BF16 sin cuantizar: requiere del orden de 48 GB solo para los pesos, lo que implica A100 80 GB o varias GPU.
- Opciones de despliegue: transformers + peft + bitsandbytes siguiendo `load_bm24_vision.py` y `requirements_vision.txt`. No hay GGUF, por lo que llama.cpp y Ollama no son opciones directas; vLLM o TGI requerirían fusionar adaptadores y convertir el backbone a un formato compatible, algo no documentado.
- Almacenamiento: 23,5 GB de repositorio, más espacio adicional si se fusionan pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidad | Formato de distribución |
|---|---|---|---|---|---|
| Bm-bohrium-24B-UltraChat-QLoRA | 24,0 B declarados | No disponible | No disponible | Imagen + texto (ViT + proyector) | Adaptador PEFT + backbone NF4 |
| Qwen2-VL-7B-Instruct | ~8,3 B | No verificado en esta ficha | Apache 2.0 | Imagen + texto | Safetensors completos, amplio ecosistema |
| Pixtral-12B | ~12,4 B | No verificado en esta ficha | Apache 2.0 | Imagen + texto | Safetensors completos |
| Llama-3.2-11B-Vision-Instruct | ~11 B | No verificado en esta ficha | Licencia comunitaria Llama 3.2 | Imagen + texto | Safetensors completos |

Los datos de los modelos alternativos provienen de sus fichas públicas y no se han verificado en esta ficha; se incluyen solo como referencia de categoría. La diferencia principal es que las alternativas son modelos entrenados de extremo a extremo y publicados con pesos completos y herramientas de despliegue, mientras que este repositorio es un adaptador experimental con backbone cuantizado y sin benchmarks publicados.

## Limitaciones y advertencias

- Prototipo declarado por el autor: no garantiza reconocimiento correcto de imágenes ni respuestas fluidas.
- Backbone extendido de 7B a 24B sin preentrenamiento completo a esa escala, lo que puede degradar la coherencia del texto frente a un modelo entrenado de forma nativa a ese tamaño.
- Entrenamiento de visión muy corto (175 pasos, 64.220 tokens de respuesta), insuficiente para un ajuste robusto de la torre visual.
- Ausencia total de benchmarks publicados; la única validación es un held-out pequeño no cuantificado en la información disponible.
- Riesgo elevado de alucinación, especialmente en descripción de imágenes y en contenido factual.
- Licencia no declarada, con fuentes de datos de condiciones heterogéneas: UltraChat se distribuye como CC-BY-NC-4.0, lo que puede arrastrar restricciones de uso no comercial. Es imprescindible revisar LICENSE y los términos de cada dataset antes de cualquier uso comercial.
- El dataset de texto incluye la variante "uncensored" de UltraChat, sin que se documente un proceso de alineación o filtrado de seguridad posterior.
- Cobertura lingüística limitada a inglés y vietnamita; sin soporte documentado de castellano.
- Contexto máximo no documentado, lo que impide planificar cargas con ventanas largas.
- Solo disponible como adaptador PEFT con backbone NF4: no hay GGUF, Ollama ni artefactos listos para vLLM o TGI.
- Sesgos: no documentados por el autor; cabría esperar los heredados de UIT-ViIC, the_cauldron, UltraChat y vi-alpaca, pero no hay análisis disponible.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/minhlol/Bm-bohrium-24B-UltraChat-QLoRA
- Modelo base: https://huggingface.co/minhlol/Bm-bohrium-7B-continued-QLoRA
- Dataset de visión vietnamita UIT-ViIC: https://huggingface.co/datasets/ai-enthusiasm-community/UIT-ViIC
- Dataset multimodal The Cauldron: https://huggingface.co/datasets/HuggingFaceM4/the_cauldron
- Dataset de texto UltraChat (variante uncensored): https://huggingface.co/datasets/branles14/ultrachat-uncensored_full
- Dataset de instrucciones en vietnamita vi-alpaca: https://huggingface.co/datasets/bkai-foundation-models/vi-alpaca
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos trataban sobre viajes a Florencia y no guardan relación). No se han encontrado papers, blogs, repositorios ni demos adicionales.
