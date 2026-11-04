# krummholz-ai/atlantic-lite-4b-v6.3-GGUF

## Resumen

Atlantic Lite 4B v6.3 (beta) es un modelo de lenguaje de propósito general desarrollado por Krummholz AI LLC (Belfast, Maine), diseñado específicamente para ejecutarse en teléfonos y hardware local de gama baja. Se trata de un fine-tune mediante LoRA del modelo base Qwen/Qwen3.5-4B (4B denso con codificador de visión), fusionado en el modelo base y convertido a formato GGUF. La versión 6.3 es una pre-publicación beta publicada el 5 de noviembre de 2026.

El modelo acepta texto e imágenes como entrada y produce texto como salida, con capacidades de tool calling para calculadora, búsqueda web y obtención de páginas. Su enfoque principal es responder de forma directa a preguntas cotidianas, explicaciones breves e historia y actualidad, incluyendo temas donde el modelo base tiende a rechazar o repetir una línea oficial. Está entrenado y evaluado exclusivamente en inglés.

La relevancia del modelo radica en su orientación a despliegue offline en dispositivos móviles (el archivo Q4_K_M ocupa 2,7 GB) y en su sistema de "guards" implementados en Python que refuerzan reglas sobre consciencia, disputas territoriales, origen del modelo y divulgación de que es una IA. El autor advierte explícitamente que es el más débil de los tres modelos v6 en cuanto a hechos y que no cumple varias de sus propias puertas de release.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con codificador de visión (base Qwen/Qwen3.5-4B) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (configuración recomendada en llama.cpp con `-c 8192`) |
| Tipos de cuantización | Q4_K_M (4 bits), Q5_K_M (5 bits), BF16 (16 bits) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 (con dos cuestiones abiertas sobre datos de entrenamiento según el autor) |
| Formato de pesos | GGUF (incluye proyector de visión `mmproj` en F16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de 4B parámetros con codificador de visión. Krummholz aplicó un fine-tune LoRA sobre el modelo de lenguaje con un proceso en varias etapas: entrenamiento supervisado, entrenamiento de preferencias y tres pasadas cortas de corrección. El adaptador LoRA se fusionó en el modelo base y se convirtió a GGUF. El camino de visión procede del modelo base y Krummholz no lo modificó ni evaluó.

El entrenamiento y la evaluación se realizaron exclusivamente en inglés. El modelo se entrenó y evaluó con la plantilla de chat integrada en el GGUF con `enable_thinking` establecido en `false`, por lo que se recomienda desactivar el modo de razonamiento en el despliegue. El autor indica que el modelo solo no cumple varias de sus propias puertas de release y que el objetivo de menos del 1 % de alucinación es una meta, no un resultado. No se especifican el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional para preguntas cotidianas, escritura breve y explicaciones.
- Respuesta sobre historia y actualidad, incluyendo temas donde el modelo base tiende a rechazar o repetir una línea oficial.
- Exposición de disputas territoriales lado a lado con el mismo estándar para cada disputa.
- Tool calling en un runtime que proporcione las herramientas: calculadora para aritmética y fechas, búsqueda web y obtención de páginas para respuestas que puedan haber cambiado.
- Entrada de imágenes a través del proyector de visión del modelo base (no evaluado por Krummholz).
- Capacidades multilingües: solo inglés (entrenamiento y evaluación en inglés).
- No se menciona soporte de agentes multi-paso ni modo de razonamiento extendido; de hecho, se recomienda desactivar el thinking.

## Casos de uso

- Asistente offline en teléfono: el archivo Q4_K_M de 2,7 GB más aproximadamente 1 GB de memoria para el contexto permite ejecutar el modelo localmente en un dispositivo móvil sin conexión, respondiendo preguntas cotidianas y explicaciones breves.
- Atención al cliente o FAQ en local: el modelo puede gestionar conversaciones multi-turno en inglés con una ventana de 8192 tokens, adecuado para despliegues en hardware de gama baja donde no se dispone de GPU dedicada.
- Tool calling con calculadora: integrado en un runtime que exponga una herramienta de cálculo, el modelo escribe las llamadas para aritmética y fechas, evitando errores de cálculo del propio modelo.
- Búsqueda web asistida: en un runtime con herramientas de búsqueda y obtención de páginas, el modelo puede formular consultas y sintetizar información actualizada para preguntas de actualidad.
- Consulta de historia y actualidad con encuadre neutral: el modelo está entrenado para responder de forma directa y presentar disputas territoriales lado a lado, útil en aplicaciones educativas o de divulgación que requieran evitar una línea oficial única.
- Procesamiento de imágenes con texto: aunque no evaluado, el proyector de visión del modelo base permite cargar imágenes y generar descripciones o respuestas textuales, útil en prototipos de accesibilidad o catalogación de imágenes en local.
- Despliegue con guards en Python: el paquete `krummholz_llm` permite aplicar reglas de consciencia, disputas territoriales, origen y divulgación de IA, adecuado para aplicaciones donde se requiera que el modelo no se presente como humano ni afirme tener consciencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una sección de evaluación y puertas de release, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni otros benchmarks.

## Requisitos de hardware

- VRAM/memoria estimada: Q4_K_M 2,7 GB, Q5_K_M 3,1 GB, BF16 8,4 GB; añadir aproximadamente 1 GB para el contexto. El proyector de visión F16 añade 0,7 GB y solo debe cargarse cuando llegue una imagen.
- GPU recomendadas: no se especifican modelos concretos. El modelo está orientado a teléfonos y hardware local de gama baja, por lo que no requiere GPU de数据中心.
- ¿Cabe en GPU consumer? Sí, por tamaño (2,7-8,4 GB) cabe en GPUs consumer con suficiente VRAM, aunque el autor no proporciona una lista de GPUs validadas.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, y el runtime de Krummholz con guards en Python. Se menciona compatibilidad con endpoints OpenAI.
- Latencia y throughput: no disponibles. Krummholz indica que aún no ha ejecutado sus pruebas de aceptación en teléfono para la versión v6.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Atlantic Lite 4B v6.3 | 4,2B | 8192 | Inglés | Apache 2.0 | GGUF | Beta; fine-tune de Qwen3.5-4B; visión no evaluada |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible | No disponible | Apache 2.0 | No disponible | Modelo base del que deriva; con codificador de visión |
| Alternativas de 4B en GGUF | No disponible | No disponible | No disponible | No disponible | GGUF | No se proporcionan datos de comparación en la información disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Modelo beta: el autor advierte que comete errores, incluidas respuestas incorrectas con confianza, y que es el más débil de los tres modelos v6 en cuanto a hechos.
- El objetivo de menos del 1 % de alucinación es una meta, no un resultado; verificar cualquier hecho que importe.
- Solo inglés: entrenamiento y evaluación exclusivamente en inglés; no soporta otros idiomas.
- Visión no evaluada: la entrada de imágenes usa el camino de visión del modelo base, que Krummholz no modificó ni evaluó; no se deben tomar decisiones basadas en imágenes.
- Uso fuera de alcance: no apto para decisiones médicas, legales, financieras o de seguridad crítica sin una persona cualificada que revise la salida.
- Tool calling requiere un runtime que proporcione las herramientas; una aplicación de chat simple no ejecutará las llamadas.
- Licencia Apache 2.0, pero el autor señala dos cuestiones abiertas sobre los datos de entrenamiento en la sección de licencia y atribución.
- El modelo no cumple varias de las propias puertas de release de Krummholz; las pruebas de aceptación en teléfono no se han ejecutado en v6.
- Los guards de consciencia, disputas territoriales, origen y divulgación de IA solo funcionan en el runtime de Krummholz (Python) y leen únicamente inglés; no están integrados en los pesos.

## Enlaces

- HuggingFace: https://huggingface.co/krummholz-ai/atlantic-lite-4b-v6.3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del runtime con guards: https://github.com/hayvenmjackson/krummholz-llms-alpha/tree/vl-pointcloud-v1/krummholz_llm
- Contacto: info@krummholz.ai
