# banyohavlusu23/Qwen3.5-4B-Web-Designer-GGUF

## Resumen

Qwen3.5-4B-Web-Designer es un ajuste fino (fine-tune) del modelo Qwen3.5-4B de Alibaba, publicado por el usuario banyohavlusu23 en Hugging Face. Su objetivo es muy concreto: transformar una petición en lenguaje natural ("una landing page para mi cafeteria", "un pequeño juego de carreras en el navegador") en una única página HTML autocontenida, con diseño temático, textos reales y CSS y JavaScript embebidos en el mismo fichero.

El modelo parte de una arquitectura transformer de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y se distribuye exclusivamente en formato GGUF, cuantizado, para su ejecución local con llama.cpp, Ollama o LM Studio. El repositorio ocupa 7,2 GB e incluye dos cuantizaciones: Q4_K_M (2,7 GB) y Q8_0 (4,5 GB). Está pensado para funcionar en un portátil con GPU de consumo.

Su relevancia radica en la especialización: según los datos del autor, el ajuste mejora la tasa de páginas que funcionan en navegador del 35 % (52/148) al 53 % (78/148) sobre el modelo base, con el mismo conjunto de 74 prompts no vistos en entrenamiento, y reduce el número de tokens de razonamiento previo (mediana de 657 a 414). Está publicado bajo licencia Apache-2.0 y solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); detalles internos del modelo base no disponibles |
| Parametros totales | 4.205.751.296 (aprox. 4,2 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card; los ejemplos de ejecución usan `-c 10240` |
| Tipos de cuantizacion | Q4_K_M (4 bits, 2,7 GB) y Q8_0 (8 bits, 4,5 GB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama, LM Studio) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3.5-4B de Alibaba, por lo que hereda la arquitectura transformer del modelo base, cuyos detalles internos (número de capas, cabezas de atención, tipo de atención) no se documentan en la model card. El ajuste se realizó con QLoRA de rango 16 y alpha 32, durante 2 épocas, con una longitud de secuencia de 4.096 tokens, sobre una única GPU RTX 4060 para portátil con 8 GB de VRAM, y posteriormente se fusionaron los adaptadores en los pesos base.

El conjunto de entrenamiento consta de 1.443 ejemplos de pares petición-página. Las peticiones provienen del dataset lmarena-ai/arena-webdev-preferences (CC BY 4.0, de LMArena) y de peticiones propias del autor. Cada respuesta fue generada por DeepSeek V4.1 Flash con un breve plan de diseño seguido de la página completa, y solo se conservaron los ejemplos cuya página se abrió correctamente en un navegador. No se documenta el uso de RLHF ni DPO, ni el volumen total de tokens de entrenamiento.

## Capacidades

- Generación de páginas HTML autocontenidas: produce un único fichero con HTML, CSS y JavaScript embebidos, listo para guardar como `page.html` y abrir en el navegador.
- Diseño web temático: aplica tipografía, espacios en blanco, degradados y animaciones coherentes con la petición del usuario.
- Razonamiento breve previo a la generación: emite un plan de diseño corto antes del bloque ```html (mediana de 414 tokens en las pruebas del autor).
- Generación de texto y código frontend: HTML, CSS y JavaScript, con uso de Tailwind y Google Fonts cargados desde sus CDN.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo está orientado a una única respuesta de página.
- Capacidades multilingües: solo inglés declarado; el resto de idiomas no está garantizado.
- Capacidades especiales: no se documentan modos de visión, audio ni thinking mode extendido más allá del plan breve previo.

## Casos de uso

- Prototipado rápido de landing pages: a partir de una descripción de negocio ("landing page para una cafeteria"), el modelo genera una página completa con textos, estilos y animaciones, útil para validar una idea visual antes de invertir en diseño.
- Generación de maquetas para clientes: un freelancer puede producir varias propuestas de página en minutos ejecutando el modelo en local con Ollama o LM Studio, sin coste por token ni envío de datos a la nube.
- Creación de minijuegos y demos interactivas en el navegador: peticiones como "un pequeño juego de carreras" producen HTML y JavaScript funcional que se puede abrir directamente, adecuado para demos educativas o pruebas de concepto.
- Material docente para cursos de frontend: el modelo sirve para generar ejemplos de páginas con Tailwind y JavaScript que los alumnos pueden abrir, inspeccionar y modificar, con la ventaja de ejecutarse en un portátil con 8 GB de VRAM.
- Generación de páginas de aterrizaje para campañas internas: equipos de marketing pueden describir la campaña y obtener una página autocontenida desplegable en cualquier servidor estático, sin dependencias de build.
- Experimentación con fine-tuning especializado: el repositorio documenta el pipeline completo (dataset, QLoRA rango 16, evaluación con navegador), lo que lo convierte en una referencia práctica para quien quiera reproducir un ajuste similar en una GPU de consumo.
- Pruebas de regresión visual automatizadas: al generar páginas de forma determinista con temperatura baja, se pueden usar como entradas controladas en pipelines que verifiquen renderizado y errores de JavaScript.

## Benchmarks y rendimiento

Los únicos datos publicados proceden de la evaluación del propio autor: 74 prompts no vistos en entrenamiento, 2 páginas por prompt, comparando el modelo base y este ajuste con Q4_K_M, abriendo cada página en un navegador.

| Metrica | Qwen3.5-4B (base) | Qwen3.5-4B-Web-Designer |
|---|---|---|
| Paginas que funcionan | 52/148 (35 %) | 78/148 (53 %) |
| Paginas terminadas | 111/148 (75 %) | 141/148 (95 %) |
| Tokens de razonamiento previo (mediana) | 657 | 414 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB con Q4_K_M y 4,5 GB con Q8_0, más el espacio de contexto KV; el autor usó una RTX 4060 Laptop de 8 GB para el entrenamiento, no para la inferencia.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y holgadas para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (`ollama run hf.co/...`), LM Studio y cualquier runtime compatible con GGUF.
- Parámetros de generación recomendados por el autor: temperatura 0,7, top-p 0,95, top-k 20, hasta 8.192 tokens nuevos, contexto de 10.240 (`-c 10240`) y `-ngl 99` para descargar todas las capas en GPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-Web-Designer | 4,2 B | no disponible | Fine-tune para páginas HTML | Apache-2.0 | GGUF |
| Qwen3.5-4B (base) | 4,2 B | no disponible | Modelo generalista | Apache-2.0 | safetensors, GGUF |
| Alternativas especializadas en generación web de 4 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base es la única documentada: el ajuste mejora la tasa de páginas funcionales del 35 % al 53 % y la tasa de finalización del 75 % al 95 %, a costa de un modelo especializado que probablemente pierda capacidades generales fuera del dominio web.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluación de sesgos; al entrenarse con peticiones de LMArena y respuestas de DeepSeek V4.1 Flash, puede heredar sesgos de estilo y contenido de ambas fuentes.
- Riesgo de alucinación: las páginas generadas pueden incluir textos, marcas o datos inventados; el 47 % de las páginas del ajuste no funcionaron correctamente en la evaluación del autor, por lo que la revisión manual es necesaria.
- Limitaciones de contexto e idioma: solo se declara inglés; el contexto máximo no está documentado y los ejemplos usan 10.240 tokens.
- Dependencias externas: las páginas cargan Tailwind y Google Fonts desde CDN, lo que rompe el carácter autocontenido si no hay conexión a internet.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor indica que es un proyecto no oficial y no afiliado a Qwen ni a Alibaba Cloud; conviene revisar el fichero `NOTICE` por los cambios respecto al modelo base.
- Caveat para producción: es un fine-tune de un único autor, con 417 descargas y 4 likes en el momento de la consulta, sin evaluación independiente; no se recomienda como componente crítico sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/banyohavlusu23/Qwen3.5-4B-Web-Designer-GGUF
- Galería de páginas generadas: https://huggingface.co/spaces/banyohavlusu23/Qwen3.5-4B-Web-Designer-Gallery
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de peticiones: https://huggingface.co/datasets/lmarena-ai/arena-webdev-preferences
