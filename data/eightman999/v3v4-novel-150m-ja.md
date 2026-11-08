# eightman999/v3v4-novel-150m-ja

## Resumen

v3v4-novel-150m-ja es un modelo de lenguaje decoder-only de aproximadamente 132 millones de parámetros (1,5 x 10^8) desarrollado por el usuario independiente eightman999, especializado en la generación de novelas en japonés. Se trata de un modelo experimental de autor único, entrenado sobre textos de ficción japoneses y documentos web que incluyen contenido para adultos, y publicado bajo una licencia de tipo "other" que el autor no detalla en la model card. Su relevancia es limitada: no es un modelo de propósito general, sino una pieza de experimentación centrada en el control de la longitud de salida y en la separación explícita entre planificación (ficha de personajes y sinopsis) y redacción del texto.

La arquitectura es un transformer decoder-only de 12 capas con dimensión oculta 768, 12 cabezas de atención y FFN de 3600, con embeddings de entrada y salida compartidos y escalados por raíz de d. Usa embeddings posicionales sinusoidales, LayerNorm y activación GELU, y un tokenizador propio de 49.152 entradas. La longitud de contexto es de 4.096 tokens y los pesos se distribuyen en fp16 en formato safetensors. Al no seguir la configuración estándar de transformers, requiere el script `chat.py` incluido en el repositorio para su ejecución.

El modelo ofrece dos variantes: la raíz NV1C3, que primero genera una ficha de personajes (`<|cast|>`) y después el cuerpo de la novela (`<|story|>`), y la variante `nv1c2/`, que escribe el texto directamente sin fase de planificación. El autor advierte explícitamente de que el modelo puede producir contenido para adultos, no está pensado para chat ni para responder preguntas, y tiende a la incoherencia argumental y a las repeticiones por su reducido tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (12 capas, d=768, 12 cabezas, FFN 3600) |
| Parámetros totales | 132.453.888 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en fp16) |
| Idiomas soportados | japonés (ja) |
| Licencia | other (condiciones no especificadas en la model card) |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas con dimensión de modelo 768, 12 cabezas de atención y una red feed-forward de 3600 unidades. Emplea embeddings posicionales sinusoidales en lugar de posiciones aprendidas o RoPE, normalización LayerNorm y activación GELU. Los embeddings de entrada y salida están compartidos y escalados por raíz de la dimensión del modelo, un patrón habitual en modelos pequeños para reducir parámetros. El vocabulario es propio, de 49.152 tokens, distribuido junto con el modelo en `tokenizer.json`.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición exacta del corpus, ni si se aplicaron fases de ajuste como RLHF o DPO. La model card indica únicamente que el entrenamiento se realizó sobre novelas japonesas y documentos web que incluyen contenido para adultos. La innovación destacable no es arquitectónica sino de formato: el modelo distingue mediante tokens reservados una fase de planificación (`<|cast|>`, con sinopsis, escena y personajes) y una fase de redacción (`<|story|>`), y el script de inferencia implementa un control de longitud (`--target`) que fuerza a no terminar antes del 80 % del objetivo, favorece el cierre en frases completas al superar el objetivo y trunca al 130 %.

## Capacidades

- Generación de texto narrativo en japonés: novelas cortas, escenas y relatos de ficción.
- Planificación estructurada: la variante raíz NV1C3 genera primero una ficha de personajes y sinopsis antes del cuerpo del texto (modo `--think`).
- Control de longitud de salida: el script `chat.py` ajusta la generación a un número aproximado de caracteres mediante `--target N`.
- Continuación de texto: opción `--continue-novel` para escribir la continuación de un texto previo pasado por archivo.
- Generación directa sin planificación: variante `nv1c2/` para redacción inmediata.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso, agentes ni uso conversacional.
- Capacidades multilingües: únicamente japonés.
- No dispone de modo de visión, audio ni thinking mode más allá de la fase de planificación textual.

## Casos de uso

- Generación de relatos cortos en japonés con longitud controlada: el parámetro `--target` permite solicitar, por ejemplo, una escena de 1.000 caracteres y el modelo ajusta el cierre en consecuencia, lo que resulta útil para experimentos de escritura creativa con restricciones de formato.
- Prototipado de pipelines de ficción con planificación explícita: el modo `--think` separa la ficha de personajes del texto final, lo que permite inspeccionar la coherencia de la planificación antes de evaluar la narración, útil en investigación sobre generación narrativa estructurada.
- Continuación de manuscritos existentes: con `--continue-novel` y `--prompt-file` se puede pasar un fragmento y obtener una continuación de longitud fija, aplicable a pruebas de estilo o a la generación de borradores.
- Docencia y experimentación con modelos pequeños: sus 132 millones de parámetros y su script de inferencia autocontenido lo hacen adecuado para prácticas sobre tokenizadores propios, embeddings compartidos y decodificación con control de longitud en entornos con recursos limitados.
- Investigación sobre sesgos y contenido para adultos en modelos japoneses: al estar entrenado sobre corpus que incluyen ese tipo de material, sirve como caso de estudio controlado para analizar qué tipo de salida se produce y con qué frecuencia.
- Pruebas de despliegue en hardware de consumo: al caber en GPU de gama baja y en CPU, permite validar flujos de inferencia locales (MPS, CUDA o CPU) antes de escalar a modelos mayores.
- Generación de datos sintéticos de ficción japonesa para experimentos de aumento de corpus, siempre que se filtre y revise la salida por las limitaciones de coherencia del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,3 GB para los pesos (132 millones de parámetros a 2 bytes por parámetro), más el espacio del contexto de 4.096 tokens y las activaciones; en la práctica, menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el modelo es viable en tarjetas de gama de entrada. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, series GTX 10xx en adelante, RTX 20xx/30xx/40xx) e incluso en CPU.
- Opciones de despliegue: no es compatible con transformers de forma directa según el autor; el único método documentado es el script `chat.py` incluido en el repositorio, que selecciona automáticamente MPS, CUDA o CPU. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Por el tamaño del modelo, la generación en GPU consumer debería ser fluida, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| v3v4-novel-150m-ja | 132 M | 4.096 | ja | other | safetensors | Hugging Face, ejecución solo con `chat.py` |
| Modelos de la serie J-LLM de eightman999 (v2) | no disponible | no disponible | ja | no disponible | no disponible | Hugging Face (mismo autor) |
| NovelAI (servicio propietario) | no disponible | no disponible | multi | propietaria | API/servicio | Solo como servicio en la nube |

No se dispone de información suficiente en la documentación proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría (modelos japoneses pequeños de generación creativa). Los modelos de la serie J-LLM del mismo autor son la referencia más cercana, pero no se detallan sus especificaciones.

## Limitaciones y advertencias

- Tamaño reducido: el propio autor advierte de que la trama puede romperse con facilidad y de que aparecen repeticiones frecuentes.
- Coherencia de personajes: la ficha de personajes puede contener nombres duplicados.
- No apto para chat ni para responder preguntas: el modelo está entrenado para escribir ficción, no para diálogo informativo.
- Contenido para adultos: el entrenamiento incluye material para adultos y el modelo puede generarlo; el autor restringe su uso a mayores de 18 años y declina responsabilidad sobre las salidas.
- Licencia "other" sin condiciones detalladas: no se especifican los términos de uso comercial, por lo que no se puede asumir su permiso.
- Idioma: solo japonés; no hay soporte multilingüe.
- Contexto limitado a 4.096 tokens, insuficiente para novelas largas en una sola pasada.
- Compatibilidad: no se puede cargar directamente con transformers; requiere el script del repositorio y la versión exacta de `tokenizers` (0.22.2), ya que la 0.23 ignora `encode_special_tokens` y rompe el manejo de tokens reservados.
- Riesgo de alucinación y de contenido incoherente inherente a un modelo de 132 millones de parámetros; requiere revisión humana en cualquier uso en producción.
- Sin datos publicados de benchmarks, por lo que no hay evidencia cuantitativa de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eightman999/v3v4-novel-150m-ja
- Perfil del autor en Hugging Face: https://huggingface.co/eightman999/models
- Perfil del autor en GitHub: https://github.com/eightman999
- NovelAI (referencia del sector, servicio propietario): https://novelai.net/
