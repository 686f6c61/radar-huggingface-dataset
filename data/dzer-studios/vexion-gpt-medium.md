# DZER-Studios/Vexion-gpt-medium

## Resumen

Vexion-gpt-medium es un modelo de lenguaje de tipo GPT denso, desarrollado desde cero en PyTorch por DZER-Studios, un proyecto individual que busca reproducir la arquitectura Transformer completa sin apoyarse en frameworks de terceros. Se trata de un modelo base (no instruido ni alineado para diálogo) de 345.303.040 parámetros, con una ventana de contexto de 1.024 tokens y un vocabulario de 40.960 entradas, entrenado sobre el corpus multilingüe CulturaX con el subconjunto en ruso como único idioma declarado.

Su relevancia no reside en el rendimiento absoluto, sino en su carácter didáctico y en las decisiones de ingeniería que documenta el autor: arquitectura GPT clásica sin RoPE ni MoE, atención causal con Flash Attention mediante kernels fusionados, un DataLoader propio que serializa datos binarios en `.bin` para evitar la sobrecarga del recolector de basura de Python, y configuración compatible con el estándar `config.json` de Hugging Face. El modelo se entrenó íntegramente en una única GPU de consumo (RTX 3060 Ti de 8 GB o RTX 4060 Ti de 16 GB), lo que lo convierte en un caso de referencia para preentrenamiento de bajo presupuesto.

La advertencia más importante es que, pese a alojarse en Hugging Face y usar safetensors, **no es compatible con la librería `transformers`**: la arquitectura es totalmente custom y requiere los scripts `model.py`, `generate.py` y `generation.py` incluidos en el repositorio. No se han publicado resultados de benchmarks estándar; solo las pérdidas de entrenamiento y validación (2,58 y 2,53 respectivamente).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (GPT clásico), sin MoE y sin RoPE; atención causal + activaciones GELU/SiLU |
| Parametros totales | 345.303.040 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales; los pesos se distribuyen en safetensors a precisión completa, repositorio de 1,4 GB) |
| Idiomas soportados | ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch, con `custom_code`; no compatible con `transformers`) |
| Vocabulario | 40.960 tokens |
| Pasos de entrenamiento | 382.500 |
| Perdida de entrenamiento (train loss) | 2,58 |
| Perdida de validacion (val loss) | 2,53 |
| Dataset de preentrenamiento | uonlp/CulturaX, 39.000 millones de tokens |
| Fecha de creacion / ultima actualizacion | 2026-07-07 / 2026-10-23 |
| Descargas / likes | 260 / 0 |

## Arquitectura y entrenamiento

El modelo implementa un transformer decoder-only denso de corte clásico: atención causal estándar, embeddings posicionales aprendidos en lugar de RoPE, y funciones de activación GELU/SiLU. El autor descarta explícitamente componentes modernos como MoE o atención lineal, priorizando la simplicidad matemática y la trazabilidad del código sobre la eficiencia por parámetro. La atención se calcula con kernels fusionados (Flash Attention), lo que según la model card reduce de forma drástica el consumo de VRAM y permite entrenar con tamaños de lote que antes provocaban OOM en GPUs de consumo.

El preentrenamiento se realizó sobre CulturaX (39.000 millones de tokens, aproximadamente 113 tokens por parámetro) durante 570 horas en una RTX 3060 Ti de 8 GB o una RTX 4060 Ti de 16 GB. La configuración utilizada fue `batch_size=12` con `accumulate_steps=8` a contexto 256, y `batch_size=8` con `accumulate_steps=32` a contexto 1.024, con un calentamiento (`warmup`) de 500 pasos. El optimizador es AdamW en su configuración estándar, con estados almacenados en 32 bits, lo que según el autor contribuye a alcanzar pérdidas más bajas y modelos de mayor calidad. No se documenta ninguna fase de ajuste supervisado, RLHF o DPO: se trata estrictamente de un modelo base. El autor menciona que un "Medium conversacional" está previsto para después de completar el ciclo de entrenamiento (objetivo aproximado: 20 de noviembre), condicionado a la recuperación de un dataset de diálogos que resultó dañado.

## Capacidades

- Generación de texto por continuación de prompt en ruso: al ser un modelo base, completa secuencias en lugar de seguir instrucciones.
- Modelado de lenguaje autorregresivo con ventana de 1.024 tokens, adecuado para párrafos y documentos cortos.
- Capacidad multilingüe limitada al ruso según la etiqueta oficial del modelo, aunque el corpus de origen (CulturaX) sea multilingüe.
- No dispone de soporte de tool calling ni function calling.
- No implementa modo "thinking", razonamiento multi-paso explícito ni capacidades de agente.
- Sin capacidades de visión, audio ni multimodalidad.
- Base susceptible de fine-tuning para tareas concretas, siempre con los scripts propios del repositorio.
- Compatibilidad de configuración con el ecosistema Hugging Face a nivel de `config.json` (hidden_size, num_hidden_layers, etc.), pero no a nivel de API de inferencia.

## Casos de uso

- **Experimentación educativa sobre arquitecturas Transformer**: el repositorio incluye el código completo de modelo, entrenamiento y generación, por lo que sirve para estudiar cómo se implementa un GPT desde cero sin depender de `transformers`, incluyendo DataLoader binario y atención con kernels fusionados.
- **Continuación de texto en ruso**: redacción asistida de párrafos, notas o descripciones donde se proporciona un prefijo y el modelo completa hasta 1.024 tokens de contexto; útil para generar borradores de contenido en ruso con revisión humana posterior.
- **Punto de partida para fine-tuning de dominio**: al ser un modelo base de 345 M con licencia Apache 2.0 y pesos abiertos, puede ajustarse con datasets propios del sector (legal, técnico, telco) usando los scripts `train.py` y el fichero `.bin` de tokens, con un coste de cómputo asumible en una sola GPU de consumo.
- **Investigación sobre receta de preentrenamiento en hardware limitado**: replicar la configuración documentada (batch, acumulación de gradientes, AdamW en fp32, 39.000 millones de tokens en 570 horas) para medir el efecto de cada decisión sobre la pérdida de validación en modelos de escala media.
- **Generación de datos sintéticos en ruso para prototipos**: producir textos de relleno o corpus auxiliares para pruebas de pipelines de NLP (tokenizadores, filtros, sistemas de búsqueda) donde no se requiere calidad de producción.
- **Banco de pruebas de serving personalizado**: al no funcionar con vLLM, TGI ni llama.cpp, obliga a implementar un servidor de inferencia propio sobre `model.py`, lo que resulta útil para comparar el rendimiento de un stack custom frente a soluciones estándar.
- **Evaluación de robustez y análisis de sesgos en modelos pequeños**: con 345 M de parámetros y entrenamiento exclusivamente en CulturaX-ru, sirve como caso de estudio de los sesgos que un corpus web introduce en un modelo de baja escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Parametros | 345 M |
| Contexto | 1.024 tokens |
| Vocabulario | 40.960 |
| Pasos totales | 382.500 |
| Train loss | 2,58 |
| Val loss | 2,53 |
| Tokens de preentrenamiento | 39.000 millones |
| Tiempo de entrenamiento | 570 horas |

No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones en ruso (por ejemplo, Russian SuperGLUE o ruMMLU) en la información proporcionada.

## Requisitos de hardware

- **VRAM para inferencia**: los pesos ocupan aproximadamente 1,4 GB a precisión completa (fp32, coherente con 345 M × 4 bytes). En fp16 serían unos 0,7 GB, aunque no se documenta una conversión oficial. Con caché KV para 1.024 tokens y vocabulario de 40.960, la inferencia cabe holgadamente en 2-3 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con 4 GB o más es suficiente. El propio autor cita RTX 3060 Ti (8 GB) y RTX 4060 Ti (16 GB) como hardware de entrenamiento, por lo que la inferencia es viable en GPUs de gama media e incluso en iGPU con memoria unificada suficiente.
- **Cabe en GPU de consumo**: sí, en toda la gama actual (RTX 3060, 4060, 4070, 4090) y en GPUs de portátil con 6 GB o más.
- **Opciones de despliegue**: no hay soporte para vLLM, TGI, llama.cpp, Ollama ni `transformers`. El despliegue debe hacerse con los scripts del repositorio (`model.py`, `generate.py`, `generation.py`) sobre PyTorch, implementando manualmente el servidor si se necesita una API.
- **Latencia y throughput**: no disponibles. Al no existir integración con motores de serving optimizados ni batching continuo documentado, se espera un throughput inferior al de un modelo equivalente servido con vLLM o llama.cpp, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Compatibilidad con `transformers` | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| Vexion-gpt-medium | 345 M | 1.024 | Apache 2.0 | No (arquitectura custom) | Ruso | Hugging Face, 260 descargas |
| GPT-2 medium | 355 M | 1.024 | MIT modificada | Si | Ingles (principalmente) | Ampliamente disponible |
| Pythia-410M | 410 M | 2.048 | Apache 2.0 | Si | Ingles (principalmente) | Hugging Face / EleutherAI |
| SmolLM2-360M | 362 M | 8.192 | Apache 2.0 | Si | Multilingue (predominantemente ingles) | Hugging Face / HuggingFaceTB |

La comparación relevante es de escala y encaje técnico, no de rendimiento: no se han publicado métricas de Vexion-gpt-medium que permitan situarlo frente a estos modelos en tareas estándar. La diferencia principal es operativa: los tres alternativas se cargan con `AutoModelForCausalLM` y funcionan en vLLM, llama.cpp y Ollama, mientras que Vexion-gpt-medium exige código propio. Su ventaja diferencial es el soporte nativo del ruso como idioma objetivo declarado y la licencia Apache 2.0 sin restricciones adicionales.

## Limitaciones y advertencias

- **No es un modelo instruido**: no sigue instrucciones ni mantiene diálogo; responde con continuación de texto. El propio autor indica que la variante conversacional no está lista y que el dataset de diálogos quedó corrupto.
- **Contexto muy corto**: 1.024 tokens limitan el uso a documentos breves; no admite conversaciones multi-turno largas ni análisis de ficheros extensos.
- **Idioma restringido**: etiquetado únicamente como ruso; el rendimiento en castellano o inglés no está evaluado y previsiblemente será pobre.
- **Riesgo de alucinación y contenido nocivo**: al ser un modelo base entrenado sobre CulturaX (corpus web sin filtrar por calidad en su totalidad), puede reproducir estereotipos, sesgos sociales y afirmaciones falsas con fluidez. No ha pasado por RLHF ni por filtros de seguridad documentados.
- **Dependencia de código propietario del repositorio**: cualquier cambio en `model.py` o en la configuración rompe la carga de pesos; no hay garantía de compatibilidad con versiones futuras de PyTorch ni de CUDA.
- **Sin ecosistema de serving**: no hay soporte para vLLM, TGI, llama.cpp, Ollama ni `transformers`, lo que complica el despliegue en producción, el batching y el escalado horizontal.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones con atribución, pero el autor no ofrece garantías ni soporte; el proyecto es individual y con un roadmap sujeto a cambios.
- **Madurez del proyecto**: 260 descargas y 0 likes en el momento de la consulta; sin publicación asociada, sin evaluaciones independientes y con el resto de la familia (117 M, 645 M, 1 B, 2,1 B, 2,6 B) todavía en entrenamiento o sin publicar.
- **Advertencia de seguridad al ejecutar los scripts**: la model card indica lanzar el símbolo del sistema como administrador; ejecutar scripts de un repositorio de terceros con privilegios elevados es un riesgo innecesario que conviene evitar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DZER-Studios/Vexion-gpt-medium
- Dataset de preentrenamiento CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
- Perfil del autor en Hugging Face: https://huggingface.co/DZER-Studios

No se han encontrado en la búsqueda web enlaces relevantes al modelo, a su model card, a papers asociados ni a demos: los resultados devueltos corresponden a contenidos no relacionados (kinovi.ai, un artículo de SEO, un PDF de INTERACT 2023 y una encuesta sobre ML aplicado a cámaras trampa). No existe paper técnico publicado ni repositorio independiente verificado.
