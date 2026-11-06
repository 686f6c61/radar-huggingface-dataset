# LumoAI-Kurd/Lumo

## Resumen
Lumo es un modelo de lenguaje publicado en Hugging Face por el usuario LumoAI-Kurd bajo licencia MIT. Se trata de un modelo basado en la arquitectura GPT-2, con 81.912.576 parámetros totales según los pesos en formato safetensors, lo que lo sitúa en la gama de modelos pequeños (del orden de 80 millones de parámetros, similar a GPT-2 small). El repositorio ocupa 0,3 GB y acumula 29 descargas en el momento de la consulta.

La model card es extremadamente escueta: se limita a indicar la licencia MIT, el nombre del autor (Yusuf) y una frase en kurdo ("Lumo قسە بە کوردی دەکات", que puede traducirse como "Lumo habla en kurdo"). No se documentan datos de entrenamiento, tokenizador, longitud de contexto ni composición del corpus, por lo que la información técnica disponible es mínima.

Su relevancia es limitada y muy específica: se presenta como un modelo orientado al kurdo, un idioma con escasa representación en el ecosistema de modelos abiertos. Para desarrolladores e investigadores interesados en procesamiento de lenguaje natural en lenguas de bajos recursos, puede resultar un punto de partida, pero la ausencia de documentación y de benchmarks publicados impide evaluar su calidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (según tag de Hugging Face) |
| Parametros totales | 81.912.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kurdo (según la model card); no se detalla variante ni cobertura |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se etiqueta en Hugging Face con el tag `gpt2`, lo que indica que emplea la arquitectura transformer decoder-only característica de la familia GPT-2. Con 81.912.576 parámetros, el tamaño es coherente con una configuración de tipo GPT-2 small (12 capas, dimensión oculta en torno a 768), aunque no se confirma en la información disponible.

No se proporcionan datos sobre el corpus de entrenamiento: ni número de tokens, ni composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se documenta el tokenizador ni el proceso de tokenización del kurdo, un aspecto crítico en lenguas con ortografías y dialectos diversos. No hay información sobre innovaciones técnicas (atención lineal, decodificación especulativa, etc.).

## Capacidades
- Generación de texto en kurdo, según la única afirmación de la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del kurdo.
- No se documentan capacidades especiales (modo thinking, visión, audio).
- No se documenta capacidad de generación de código ni de matemáticas.

## Casos de uso
- Experimentación académica en PLN de bajos recursos: el modelo puede servir como base para estudiar el comportamiento de un GPT-2 pequeño entrenado (presuntamente) en kurdo, comparando perplejidad y coherencia frente a modelos multilingües.
- Prototipado de generación de texto en kurdo: para demos internas o pruebas de concepto donde se requiera producir texto en este idioma sin depender de APIs comerciales.
- Ajuste fino (fine-tuning) sobre dominios concretos: al ser un modelo pequeño con licencia MIT, puede reentrenarse en corpus específicos (noticias, literatura, administración) con recursos de hardware modestos.
- Investigación sobre tokenización de lenguas de bajos recursos: permite analizar cómo un tokenizador derivado de GPT-2 maneja la morfología del kurdo.
- Educación y divulgación: útil para demostrar las limitaciones y posibilidades de los modelos pequeños en idiomas minorizados.
- Base para comparativas de eficiencia: su tamaño (≈82 M de parámetros) permite ejecutarlo en CPU y comparar coste/rendimiento frente a modelos multilingües mucho mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp32: aproximadamente 0,33 GB solo para pesos (81,9 M × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 0,16 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU.
- Despliegue posible con llama.cpp, Ollama (previa conversión a GGUF), Transformers de Hugging Face y, con reservas por tamaño, vLLM o TGI.
- No se dispone de datos de latencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lumo (LumoAI-Kurd) | 81,9 M | no disponible | kurdo (según model card) | MIT | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | inglés principalmente | MIT | Hugging Face |
| DistilGPT-2 | 82 M | 1024 tokens | inglés | Apache 2.0 | Hugging Face |
| Bloom-560m | 560 M | 2048 tokens | multilingüe (incluye kurdo parcialmente) | BigScience RAIL | Hugging Face |

La comparación con GPT-2 small y DistilGPT-2 es pertinente por tamaño; con Bloom-560m, por su carácter multilingüe y su cobertura parcial de lenguas de bajos recursos. No hay datos de rendimiento de Lumo que permitan una comparación cuantitativa.

## Limitaciones y advertencias
- Documentación prácticamente inexistente: no hay información sobre datos de entrenamiento, tokenizador, contexto ni evaluación, lo que impide valorar su calidad y sesgos.
- Riesgo elevado de alucinación y de texto incoherente, propio de un modelo de ~82 M de parámetros sin ajuste documentado.
- Sesgos desconocidos: al no documentarse el corpus, no puede evaluarse la presencia de sesgos de género, políticos o religiosos, especialmente sensibles en el contexto kurdo.
- Cobertura lingüística incierta: no se especifica la variante de kurdo (kurmanji, sorani, etc.) ni el alfabeto utilizado.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad sobre el contenido generado.
- No apto para producción sin una evaluación previa exhaustiva y sin un pipeline de filtrado de salidas.
- Fecha de creación indicada en 2026-10-28, posterior a la fecha habitual de referencia; conviene verificar la autenticidad y vigencia del repositorio.

## Enlaces
- Hugging Face: https://huggingface.co/LumoAI-Kurd/Lumo
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
