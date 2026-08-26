# loopdesk-ai/lipika-fontclip

## Resumen

Lipika FontCLIP es un modelo de búsqueda de tipografías en lenguaje natural para escrituras índicas, desarrollado por Loopdesk AI. Permite describir una fuente en inglés ("una tipografía devanagari muy pesada para carteles") y obtener un ranking de familias tipográficas relevantes entre 595 familias y 14 escrituras (devanagari, bengalí, tamil, telugu, kannada, malayalam, gurmukhi, gujarati, odia, sinhala, tibetano, ol chiki, meetei mayek y latín). Es, según sus autores, el primer modelo abierto de incrustación fuente↔lenguaje para escrituras índices, frente a trabajos anteriores como FontCLIP centrados en el alfabeto latino.

Técnicamente, es un adaptador LoRA (r16, α16) aplicado a las proyecciones q/v de los últimos 8 bloques de ambas torres del modelo `openai/clip-vit-large-patch14`. El modelo se distribuye como adaptador PEFT junto con un índice precalculado de incrustaciones para 1250 entradas (familias × caras × scripts), más un vocabulario de 46 atributos visuales. Su relevancia actual reside en que cubre un vacío funcional: la búsqueda de tipografías en escrituras no latinas, un mercado tradicionalmente desatendido por las herramientas de diseño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-L/14 (doble torre: texto e imagen) con adaptador LoRA en q/v de los últimos 8 bloques |
| Parametros totales | ~307 M (modelo base) + adaptador LoRA (~1-2 M, no publicado con precisión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 77 tokens (CLIP estándar) |
| Tipos de cuantizacion | no disponible (se distribuye como adaptador PEFT en fp32/fp16, no como GGUF) |
| Idiomas soportados | Consultas en inglés; escrituras de salida: devanagari, bengali, tamil, telugu, kannada, malayalam, gurmukhi, gujarati, odia, sinhala, tibetano, ol chiki, meitei mayek y latin |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) + `index.npz` (embeddings) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `openai/clip-vit-large-patch14`, una arquitectura CLIP con dos torres (texto e imagen) que producen embeddings en un espacio común. El adaptador se aplica a las proyecciones de consulta y valor (q/v) de los últimos 8 bloques de ambas torres, con rango r16 y alfa 16. Tras el entrenamiento, el adaptador se fusiona con el modelo base (`merge_and_unload`) para la inferencia.

El entrenamiento usó unos 13.000 combos de renderizado (fuente × script × texto de espécimen) generados a partir de 595 familias con licencia abierta (Google Fonts, SMC, Ekushey, RIT, Lohit y conversiones de fuentes DTP heredadas). Las consultas de entrenamiento se muestrearon a partir de 46 atributos visuales puntuados por un VLM con un proceso de fusión de dos pasadas, con ponderación por frecuencia inversa. Se aplicaron tres pérdidas: InfoNCE simétrica con enmascaramiento de negativos de la misma familia, pérdida de pares entre escrituras (misma familia, distinto script → coseno ≥ 0.9) y pérdida de ranking de atributos contra sondas de texto congeladas. El entrenamiento se realizó en una H100 durante 4.000 pasos (batch 256), con el mejor checkpoint en el paso 2.000.

## Capacidades

- Búsqueda de tipografías por descripción en lenguaje natural en 14 escrituras índices.
- Ranking de familias tipográficas con puntuación de similitud coseno.
- Soporte de búsqueda por atributos visuales (peso, redondez, caligráfico, etc.) gracias a 46 atributos puntuados de 0 a 100.
- Indexación de hasta 3 caras por familia (regular, pesada, ligera), lo que permite consultas sobre el grosor ("muy pesada", "delgada").
- Filtrado por script específico (p. ej., `script="devanagari"`).
- Inclusión opcional de fuentes heredadas no Unicode (326 de 595, p. ej., Kruti Dev, DevLys) con su codificación cmap correspondiente.
- Integración con el paquete `lipika` para búsqueda programática y con una demo Gradio interactiva.
- Capacidades de reconocimiento de fuente por imagen como modelo hermano (`loopdesk-ai/lipika`), aunque este modelo específico es solo de búsqueda por texto.

## Casos de uso

- **Diseño editorial y cartelería**: un diseñador que necesita una tipografía devanagari pesada para un póster puede describirla en lenguaje natural y obtener familias candidatas ordenadas, evitando la navegación manual por miles de fuentes.
- **Localización de productos**: empresas que lanzan productos en mercados indios pueden encontrar tipografías apropiadas para cada script (tamil, bengali, etc.) describiendo el tono deseado ("amigable", "moderno", "tradicional").
- **Selección de tipografías para branding**: un estudio de diseño que busca una tipografía caligráfica bengali para un logotipo puede filtrar por atributos y script.
- **Bibliotecas de fuentes heredadas**: la inclusión de fuentes DTP de los 90 (Kruti Dev, DevLys) permite buscar tipografías con codificación no Unicode, con la advertencia de que el texto debe convertirse antes de renderizar.
- **Automatización de pipelines de diseño**: integración en herramientas de generación de documentos o interfaces donde el usuario describe el estilo de fuente y el sistema selecciona automáticamente una familia adecuada.
- **Investigación en tipografía índica**: análisis de atributos visuales (46 dimensiones) de familias tipográficas, útil para estudios comparativos o para construir sistemas de recomendación.
- **Generación de especímenes tipográficos**: el modelo puede usarse para crear especímenes visuales de fuentes según descripciones, útil en catálogos y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (MMLU, HumanEval, etc.) en la información disponible. El modelo no es un LLM general, sino un modelo de recuperación de información visual-semántica, y sus métricas relevantes serían de recuperación (recall@k, NDCG) que no se han hecho públicas en la documentación. La model card solo muestra ejemplos cualitativos de resultados de búsqueda.

## Requisitos de hardware

- **VRAM estimada**: el modelo base CLIP ViT-L/14 tiene ~307 M de parámetros; en fp16 ocupa aproximadamente 614 MB de VRAM para inferencia. El adaptador LoRA fusionado añade un coste mínimo. La carga de los embeddings del índice (`index.npz`, 1450 entradas de 768 dimensiones) es despreciable en memoria (unos pocos MB).
- **GPU recomendadas**: puede ejecutarse en cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1060, RTX 3060, etc.). El entrenamiento se realizó en una única H100, pero la inferencia es ligera.
- **CPU**: posible ejecución en CPU con PyTorch, aunque con latencia mayor; es viable para uso interactivo.
- **Opciones de despliegue**: no está disponible como GGUF ni para llama.cpp/Ollama, ya que es un modelo PEFT. Se usa con `transformers` + `peft`, o mediante el paquete `lipika[search]`. Para producción, se puede servir con TorchServe o FastAPI, o integrarlo en un pipeline de búsqueda.
- **Latencia**: no disponible, pero para una consulta simple (codificación de texto + producto con los embeddings del índice) se estima en decenas de milisegundos en GPU y en un par de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura de scripts | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **lipika-fontclip** (este) | Embedding fuente↔texto (LoRA sobre CLIP ViT-L) | 14 scripts índices + latín | 307M base + LoRA | Apache 2.0 | PEFT + índice, demo Gradio |
| **FontCLIP** (prior art, Latin-centric) | Embedding fuente↔texto (CLIP) | Latín principalmente | no disponible | no disponible | Investigación, no publicado como modelo abierto |
| **lipika** (modelo hermano) | Reconocimiento de fuente desde imagen (ConvNeXt) | 13 scripts índices | no disponible | Apache 2.0 | Clasificación de imagen→familia |

No se dispone de más alternativas comparables en el ecosistema de tipografía índica. La principal diferencia con FontCLIP es la cobertura multiescritura índica y la inclusión de fuentes legacy DTP.

## Limitaciones y advertencias

- **Sesgos de datos**: el modelo se entrena con fuentes de Google Fonts y proyectos específicos (SMC, Ekushey, RIT, Lohit), por lo que la cobertura de estilos es limitada a las familias incluidas (595). Fuentes no presentes en el índice no serán encontradas.
- **Alucinación**: al ser un modelo de recuperación, no genera texto; el riesgo de alucinación es bajo, pero la búsqueda puede devolver resultados irrelevantes si la consulta no está bien representada en el espacio de atributos.
- **Limitaciones de idioma**: las consultas deben escribirse en inglés (el modelo está entrenado con prompts en inglés); la cobertura de scripts es amplia pero la búsqueda por atributos depende del vocabulario de 46 atributos.
- **Fuentes heredadas**: las fuentes DTP legacy (326 de 595) no son Unicode y requieren conversión de texto antes de renderizar; se excluyen por defecto y deben activarse explícitamente.
- **Compatibilidad**: el modelo se probó con `transformers==4.49.0` y `peft>=0.14`; con `transformers>=5` el método `get_text_features` cambia el tipo de retorno, lo que puede romper el código de ejemplo (se recomienda usar `<5` o el paquete `lipika`).
- **Restricciones de uso comercial**: la licencia Apache 2.0 permite uso comercial, pero las fuentes del índice tienen sus propias licencias (Google Fonts, SIL OFL, etc.) que deben revisarse por separado.
- **Dependencia de CLIP**: la calidad de la búsqueda depende de la capacidad del modelo CLIP base para representar conceptos visuales abstractos; puede fallar con atributos muy específicos fuera del vocabulario de 46 atributos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loopdesk-ai/lipika-fontclip
- Modelo hermano (reconocimiento de fuentes por imagen): https://huggingface.co/loopdesk-ai/lipika
- Demo Gradio: https://huggingface.co/spaces/anilpai/lipika-demo
- Repositorio GitHub: https://github.com/loopdesk-ai/lipika
- Organización Loopdesk AI en GitHub: https://github.com/Loopdesk-AI/
- Sitio web de Loopdesk: https://loopdesk.ai/
