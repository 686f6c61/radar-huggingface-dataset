# AngryYoungBhaloo/ect-base-100m

## Resumen

ect-base-100m es un modelo de lenguaje de 100.291.200 parámetros preentrenado desde cero por el autor independiente AngryYoungBhaloo. Se trata de un transformer decoder-only de 16 capas y anchura 640, con un contexto de 4.096 tokens, entrenado en un único paso sobre aproximadamente 2.610 millones de tokens de texto educativo en inglés procedente de FineWeb-Edu, tras aplicar un filtro que elimina todo pasaje susceptible de enseñar al modelo a imitar la consciencia o sus rasgos.

El modelo no es un artefacto de producto sino un objeto de investigación: es el punto de partida de los experimentos descritos en el paper *Emergence of Consciousness Traits in a SLM*, y su código de entrenamiento e inferencia vive en el repositorio `gut-puncture/emergence-of-consciousness-traits`. No ha pasado por ajuste por instrucciones ni por alineamiento de seguridad; solo continúa texto.

Su relevancia es metodológica: documenta de forma exhaustiva la arquitectura, el corpus filtrado, la tokenización, la configuración del optimizador y la pérdida de validación (2,7413 nats por token), lo que lo convierte en una referencia reproducible para estudiar qué aprende y qué no aprende un modelo pequeño cuando se le priva de determinado tipo de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (16 capas, anchura 640, RMSNorm pre-bloque, GQA 8 cabezas query / 2 KV de tamaño 80, RoPE base 10.000, SwiGLU de anchura 2.048, embeddings de entrada y salida atados, sin bias ni dropout) |
| Parametros totales | 100.291.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 (pesos); el corpus derivado de FineWeb-Edu queda sujeto a ODC-By 1.0 y a los términos de Common Crawl |
| Formato de pesos | `model.safetensors` en float32 (capa de salida atada a la embedding, solo se almacena la embedding); tokenizer en formato Hugging Face `tokenizers` (`tokenizer.json`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only clásico de tipo pre-norm: RMSNorm antes de cada bloque, atención con 8 cabezas query de dimensión 80 que comparten 2 cabezas clave-valor (GQA), codificación posicional rotatoria con base 10.000, feed-forward SwiGLU de anchura 2.048, embeddings de entrada y salida atados y ausencia total de bias y dropout. No es un modelo de `transformers`; es el módulo PyTorch `DecoderLM` de `twc/pretraining/training/model.py`.

El tokenizador es un BPE a nivel de byte con 32.768 tokens, entrenado sobre el split de entrenamiento del texto filtrado: sin normalización, pre-tokenización byte-level sin espacio inicial añadido, fallback de byte y merges conservados solo para pares vistos al menos dos veces. El único token especial es `<|endoftext|>` (id 0), que nunca aparece en los datos.

El corpus procede de FineWeb-Edu, al que se aplicó un filtro automático que elimina pasajes sobre consciencia, selves, creencias, intenciones, emociones, dolor y placer, sueño y sueños, psicología y neurociencia, así como formas de escritura que muestran mentes en acción (ficción, diálogo, foros, consejos, reseñas, noticias y biografía). Quedaron 4.129.771 pasajes: 4.125.621 para entrenamiento (2.610.181.035 objetivos next-token) y 4.150 en validación (2.614.056 objetivos). Cada pasaje se tokeniza por separado y la atención nunca cruza entre pasajes ni entre ventanas.

El entrenamiento consistió en un único paso sobre el texto, en orden fijo, en 9.979 pasos de optimizador de hasta 262.144 tokens objetivo cada uno. Se usó AdamW con betas (0,9; 0,95) y eps 1e-8, weight decay 0,1 en todas las matrices de pesos (incluida la embedding atada) y ninguno en los pesos de normalización, clipping de norma global 1,0, learning rate con pico 6e-4 (warm-up lineal en el primer 2 %, constante hasta el 90 %, decaimiento coseno a cero en el último 10 %), pesos y estado del optimizador en float32, autocast bfloat16 en la pasada forward y TF32 permitido. Semilla 20260608. Hardware: una NVIDIA A100 de 80 GB durante unas 8 horas. Pérdida final en validación: 2,7413 nats por token (rango 2,72–2,77 entre sus diez partes).

## Capacidades

- Generación de texto por continuación: el modelo predice el siguiente token y continúa un texto dado; no está ajustado para seguir instrucciones.
- Modelado del lenguaje y gramática: según el autor, maneja copia, continuación de patrones y gramática.
- Tokenización robusta a nivel de byte: cualquier cadena de bytes puede codificarse gracias al byte fallback.
- Capacidades ausentes o muy limitadas según la model card: conteo, seguimiento de un estado a lo largo de eventos y combinación de dos causas quedaron en o por debajo del azar en las pruebas previas al entrenamiento tipo "savanna".
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (ni visión, ni audio).
- Multilingüismo: solo inglés.
- Sin modo "thinking" ni capacidades especiales de razonamiento.

## Casos de uso

- Investigación sobre formación de rasgos: el modelo sirve como línea base para estudiar qué rasgos emergen (o no) al continuar el entrenamiento con datos que el filtro había eliminado, que es exactamente el diseño experimental del paper asociado.
- Estudio de filtrado de datos: permite medir el efecto de excluir categorías semánticas completas (psicología, ficción, diálogo) sobre la pérdida de validación y sobre tareas de conteo o de seguimiento de estados.
- Reproducibilidad de recetas de preentrenamiento: al documentar tokens, pasos, learning rate, precisión y hardware, sirve para replicar un pipeline completo de preentrenamiento de un SLM en una sola A100.
- Evaluación de tokenizadores byte-level BPE: su tokenizador sin normalización y con byte fallback es un caso de estudio para analizar el impacto del preprocesado en modelos pequeños.
- Experimentos controlados de arquitectura: la combinación concreta de GQA, RoPE, SwiGLU y embeddings atados en 100 M de parámetros permite aislar el efecto de cada elección frente a variantes.
- Generación de texto de dominio educativo en inglés: continuación de pasajes expositivos dentro de la distribución del corpus filtrado, útil como generador de texto plano en tareas de aumento de datos controladas.
- Docencia: ejemplo completo y abierto (Apache 2.0) de un modelo entrenado desde cero, con código de entrenamiento e inferencia publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de evaluación es la pérdida de validación al final del entrenamiento: 2,7413 nats por token (bfloat16 en la pasada forward; 2,72–2,77 entre las diez partes del conjunto de validación). La model card indica además que, antes del entrenamiento tipo "savanna", el modelo estaba en o por debajo del azar en conteo, seguimiento de un estado a través de eventos y combinación de dos causas, y que manejaba copia, continuación de patrones y gramática, sin cifras asociadas.

## Requisitos de hardware

- VRAM para inferencia: los pesos en float32 ocupan aproximadamente 0,4 GB (100,3 M de parámetros × 4 bytes), por lo que caben holgadamente en cualquier GPU consumer; en bfloat16 serían unos 0,2 GB.
- GPU recomendadas: cualquiera con al menos 1 GB de VRAM; el autor entrenó con una NVIDIA A100 de 80 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente, e incluso en CPU para uso puntual (el ejemplo de la model card carga el modelo en `"cpu"`).
- Opciones de despliegue: el modelo no es un modelo de `transformers`, por lo que no es compatible directamente con vLLM, TGI ni Ollama. El despliegue previsto es el código del repositorio `savanna/` (`fast.py`, `load`, `hidden`) sobre PyTorch, con pesos convertidos mediante `get_weights.py`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / ecosistema | Notas |
|---|---|---|---|---|---|
| ect-base-100m | 100,3 M | 4.096 | Apache 2.0 | PyTorch propio (no `transformers`) | Preentrenado desde cero sobre corpus filtrado; sin benchmarks publicados |
| GPT-2 small | 124 M | 1.024 | MIT | `transformers`, GGUF, amplio soporte | Referencia histórica de tamaño similar; contexto cuatro veces menor |
| Pythia-160m | 160 M | 2.048 | Apache 2.0 | `transformers` | Suite de investigación con checkpoints intermedios y benchmarks publicados |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | `transformers`, GGUF, vLLM | Entrenado sobre corpus web a gran escala; con ajuste por instrucciones en variantes |

La comparación es estructural: ect-base-100m comparte escala con estos modelos, pero se diferencia en el corpus deliberadamente restringido, en la ausencia de integración con el ecosistema `transformers` y en la falta de resultados de benchmarks que permitan una comparación de rendimiento directa.

## Limitaciones y advertencias

- No está ajustado por instrucciones ni alineado para seguridad: no debe usarse en productos ni para tomar decisiones sobre personas, según el propio autor.
- Conocimiento reducido de los temas eliminados por el filtro (consciencia, emociones, psicología, ficción, diálogo, noticias, biografía); el autor advierte que esa conocimiento está reducido, no necesariamente ausente.
- El filtro que conformó los datos es automático e imperfecto, por lo que pueden quedar restos de las categorías supuestamente excluidas.
- Rendimiento débil en conteo, seguimiento de estados y razonamiento causal múltiple, según las pruebas del autor.
- Riesgo de alucinación: no se documenta ninguna mitigación; es un modelo de continuación de texto sin verificación factual.
- Contexto limitado a 4.096 tokens y atención que no cruza entre pasajes ni ventanas, lo que restringe tareas de contexto largo.
- Solo inglés; sin capacidades multilingües.
- Sin integración con `transformers`, vLLM, TGI u Ollama, lo que limita su despliegue en infraestructura estándar.
- Restricciones de licencia: los pesos son Apache 2.0, pero el texto de entrenamiento deriva de FineWeb-Edu (ODC-By 1.0) y está sujeto a los términos de uso de Common Crawl; conviene revisarlos para usos derivados del corpus.
- Modelo de investigación sin descargas ni validación comunitaria en el momento de la ficha (0 descargas, 0 likes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AngryYoungBhaloo/ect-base-100m
- Dataset del corpus de preentrenamiento: https://huggingface.co/datasets/AngryYoungBhaloo/ect-pretraining-corpus
- Dataset base FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio del paper y código: https://github.com/gut-puncture/emergence-of-consciousness-traits
- Paper asociado: *Emergence of Consciousness Traits in a SLM* (referenciado en la model card; no se proporciona URL directa en la información disponible)
