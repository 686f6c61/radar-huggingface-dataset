# banyohavlusu23/Qwen3.5-4B-Web-Designer

## Resumen

Qwen3.5-4B-Web-Designer es un ajuste fino (fine-tune) del modelo base Qwen3.5-4B de Alibaba Cloud, publicado por el usuario independiente banyohavlusu23. El modelo está especializado en una tarea muy concreta: transformar una petición en lenguaje natural ("una landing page para mi cafetería", "un pequeño juego de carreras en el navegador") en una única página HTML autocontenida, con diseño temático, textos reales y CSS y JavaScript embebidos en el mismo fichero. Está pensado para ejecutarse en un portátil.

El modelo resuelve el problema de generar prototipos web funcionales de forma local y sin dependencia de APIs externas. Con 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y un contexto de entrenamiento de 4.096 tokens, el ajuste se realizó mediante QLoRA sobre una GPU de consumo (RTX 4060 Laptop de 8 GB), lo que lo convierte en un ejemplo representativo de fine-tuning accesible para desarrolladores individuales.

Su relevancia actual radica en que demuestra que un modelo pequeño, ajustado con un dataset curado de solo 1.443 ejemplos y validado empíricamente en navegador, puede mejorar de forma medible la tasa de páginas funcionales generadas (del 35 % al 53 % en la evaluación del autor) frente al modelo base, manteniéndose ejecutable en hardware de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles internos del base no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 4.096 tokens (longitud de entrenamiento); el autor recomienda ejecutar con `-c 10240` |
| Tipos de cuantizacion | Q4_K_M (4 bits, 2,7 GB) y Q8_0 (8 bits, 4,5 GB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repositorio GGUF); pesos fusionados del fine-tune no detallados |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer de aproximadamente 4,2 mil millones de parámetros. El ajuste fino se realizó con QLoRA (rank 16, alpha 32), durante 2 épocas, con una longitud de secuencia de 4.096 tokens, sobre una única RTX 4060 Laptop GPU con 8 GB de VRAM. Posteriormente, los adaptadores se fusionaron en los pesos del modelo base. Los detalles arquitectónicos internos del modelo base (tipo de atención, composición de capas, uso de decodificación especulativa u otras innovaciones) no se especifican en la información disponible.

El dataset de entrenamiento consta de 1.443 ejemplos de pares petición-página. Las peticiones provienen del arena WebDev de LMArena (dataset `lmarena-ai/arena-webdev-preferences`, CC BY 4.0) y de peticiones propias del autor. Cada respuesta fue generada por DeepSeek V4.1 Flash con un breve plan de diseño seguido de la página completa. Todas las páginas se abrieron en un navegador y solo se conservaron las que funcionaban, lo que constituye un filtrado de calidad basado en ejecución real. No se menciona el uso de RLHF o DPO; el proceso es supervisado (SFT) sobre datos filtrados.

## Capacidades

- Generación de páginas HTML autocontenidas: produce un único fichero con HTML, CSS y JavaScript embebidos, listo para guardar como `page.html` y abrir en el navegador.
- Diseño web temático: genera tipografía limpia, espacios en blanco generosos, degradados y animaciones suaves, orientado a landings y sitios con acabado profesional.
- Generación de texto de marketing: incluye copy real en las páginas generadas.
- Modo de razonamiento breve: produce un plan de diseño corto antes de escribir el código (mediana de 414 tokens de pensamiento en la evaluación del autor).
- Uso de CDNs: las páginas cargan Tailwind y Google Fonts desde sus CDNs.
- Generación de pequeños juegos y aplicaciones en navegador (por ejemplo, un juego de carreras).
- Capacidad conversacional y de generación de texto heredada del modelo base Qwen3.5-4B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: no se documentan visión ni audio.

## Casos de uso

- Prototipado rápido de landing pages: a partir de una descripción breve del negocio (por ejemplo, una cafetería), el modelo genera una página completa con diseño, textos y estilos que el desarrollador puede abrir directamente en el navegador para validar una idea en segundos.
- Generación de maquetas para clientes: agencias y freelancers pueden producir borradores visuales de sitios antes de invertir tiempo en el desarrollo real, reduciendo el ciclo de feedback inicial.
- Creación de pequeños juegos y demos interactivas: el modelo es capaz de generar juegos sencillos en el navegador (el autor cita un juego de carreras), útiles para demos, prototipos educativos o contenido interactivo.
- Aprendizaje y experimentación con fine-tuning: el modelo sirve como caso de estudio reproducible de QLoRA sobre hardware de consumo, con dataset, hiperparámetros y metodología de evaluación documentados.
- Generación de componentes y páginas de ejemplo para documentación técnica: útil para crear ejemplos autocontenidos que se puedan incrustar en tutoriales o manuales.
- Ejecución local y privada: al distribuirse en GGUF y funcionar con llama.cpp, Ollama y LM Studio, permite generar páginas sin enviar prompts a servicios en la nube, adecuado para entornos con requisitos de privacidad.
- Iteración sobre diseño existente: dado que el modelo acepta peticiones en lenguaje natural, se puede usar para regenerar o variar el estilo de una página con instrucciones sucesivas.

## Benchmarks y rendimiento

Evaluación del autor sobre 74 prompts no vistos en entrenamiento, 2 páginas por prompt, comparando el modelo base y el fine-tune (GGUF Q4_K_M). Cada página se abre en un navegador y se considera "funcional" si termina, carga, no lanza errores de JavaScript y sus botones responden.

| Metrica | Qwen3.5-4B (base) | Qwen3.5-4B-Web-Designer |
|---|---|---|
| Paginas funcionales | 52/148 (35 %) | 78/148 (53 %) |
| Paginas terminadas | 111/148 (75 %) | 141/148 (95 %) |
| Tokens de pensamiento antes de escribir (mediana) | 657 | 414 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB con Q4_K_M y 4,5 GB con Q8_0 (tamaños de fichero indicados por el autor).
- GPU recomendadas: el autor entrenó en una RTX 4060 Laptop de 8 GB; para inferencia basta con GPUs de consumo con al menos 4-6 GB de VRAM libre.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 y superiores; también en portátiles con 8 GB.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, LM Studio. El autor documenta `llama-server -hf banyohavlusu23/Qwen3.5-4B-Web-Designer-GGUF:Q4_K_M --jinja -c 10240 -ngl 99` y `ollama run hf.co/banyohavlusu23/Qwen3.5-4B-Web-Designer-GGUF:Q4_K_M`.
- Parámetros de generación recomendados: temperatura 0,7, top-p 0,95, top-k 20, hasta 8.192 tokens nuevos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Web-Designer | 4,2 B | 4.096 (entrenamiento) | Fine-tune para generación de páginas web | Apache-2.0 | GGUF en Hugging Face |
| Qwen3.5-4B (base) | 4,2 B | no disponible | Modelo generalista | Apache-2.0 | Hugging Face |
| DeepSeek V4.1 Flash | no disponible | no disponible | Generador de datos de entrenamiento (API) | no disponible | no disponible |

La comparación directa con otros fine-tunes especializados en generación web no está disponible en la información proporcionada. El único contraste cuantificado es frente al modelo base, con una mejora de 18 puntos porcentuales en páginas funcionales (35 % a 53 %).

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; las peticiones y los textos generados en castellano pueden degradarse.
- Contexto limitado: entrenado con 4.096 tokens; aunque se puede ejecutar con ventanas mayores, la calidad más allá del contexto de entrenamiento no está garantizada.
- Tasa de fallo significativa: incluso el fine-tune solo genera páginas funcionales en el 53 % de los casos evaluados, por lo que requiere revisión humana.
- Dependencia de CDNs: las páginas cargan Tailwind y Google Fonts desde CDNs externos, lo que rompe el aislamiento y puede fallar en entornos sin red o con bloqueo de terceros.
- Alucinación: como modelo generativo, puede producir contenido inventado en los textos de las páginas.
- Sesgos: no se documentan sesgos específicos; al derivar del modelo base, hereda los sesgos de este, no evaluados en la model card.
- Licencia: Apache-2.0 permite uso comercial, pero el autor aclara que es un proyecto no oficial, no afiliado a Qwen ni a Alibaba Cloud; conviene revisar `NOTICE` y `LICENSE`.
- Procedencia de datos: las páginas de entrenamiento fueron generadas por DeepSeek V4.1 Flash y los prompts provienen de LMArena (CC BY 4.0); deben respetarse las atribuciones correspondientes.
- Madurez: proyecto con 417 descargas y 7 likes en el momento de la consulta, sin validación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/banyohavlusu23/Qwen3.5-4B-Web-Designer
- Repositorio GGUF: https://huggingface.co/banyohavlusu23/Qwen3.5-4B-Web-Designer-GGUF
- Galería de páginas generadas: https://huggingface.co/spaces/banyohavlusu23/Qwen3.5-4B-Web-Designer-Gallery
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de prompts: https://huggingface.co/datasets/lmarena-ai/arena-webdev-preferences
