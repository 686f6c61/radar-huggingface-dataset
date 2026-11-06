# astral-expmath/qwen3.5-4b-agda-steps-GGUF

## Resumen

ASTRAL step model es un ajuste fino de Qwen/Qwen3.5-4B especializado en autoformalización de matemáticas en Agda, un asistente de pruebas dependiente de tipos. Lo desarrolla el proyecto astral-expmath y se distribuye en formato GGUF para llama.cpp. El modelo no escribe demostraciones completas de golpe: genera una única instrucción de edición por petición (declarar, dividir por casos o refinar un agujero), de modo que Agda valida cada paso antes de pedir el siguiente. Esta arquitectura de bucle cerrado con verificación del compilador reduce el riesgo de alucinación estructural típico de la generación de código formal de una sola pasada.

El modelo base Qwen3.5-4B aporta 4.326.350.848 parámetros y una ventana de contexto que el ajuste explota con secuencias de hasta 4096 tokens. El entrenamiento consistió en un LoRA (rango 32, alfa 64) sobre todas las proyecciones de atención, atención lineal y MLP, con 91.340 ejemplos de un solo paso extraídos de agda-stdlib, agda-categories, agda-algebras y algunos desarrollos de investigación. El resultado se convirtió a GGUF preservando la capa de predicción multi-token (MTP) del modelo base, necesaria para llama.cpp.

Su relevancia actual radica en que es el modelo por defecto de la extensión ASTRAL Autoformalize para VS Code, lo que lo convierte en una pieza de infraestructura lista para usar en flujos de trabajo reales de formalización. Frente a enfoques que generan declaraciones enteras, el enfoque por pasos se alinea con la forma en que los humanos interactúan con Agda y permite corregir errores localmente sin descartar todo el trabajo previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con atención lineal y capa MTP restaurada; ajuste LoRA fusionado |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en entrenamiento; `-c 8192` sugerido en llama-server |
| Tipos de cuantizacion | Q4_K_M (2,8 GB) y Q8_0 (4,6 GB) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de 4.326 millones de parámetros con componentes de atención lineal. Sobre él se aplicó un ajuste supervisado con TRL de un adaptador LoRA de rango 32, alfa 64 y dropout 0,1, aplicado a todas las proyecciones de atención, atención lineal y MLP. El entrenamiento usó precisión bf16, learning rate 2e-4 con schedule coseno y secuencias de hasta 4096 tokens. Posteriormente el adaptador se fusionó en los pesos base y se restauró la capa de predicción multi-token (MTP) del modelo original, requisito de llama.cpp, antes de la conversión a GGUF. La cuantización Q4_K_M emplea una importance matrix calculada a partir de los prompts de entrenamiento.

El corpus consta de 91.340 ejemplos de entrenamiento, con splits de evaluación y test de 11.374 y 10.811 ejemplos respectivamente. Cada ejemplo captura un único paso de escritura de una declaración Agda: el fragmento del fichero fuente previo, un enunciado informal, la declaración parcial, el goal de Agda para el agujero activo y el paso ejecutado. Las declaraciones proceden de agda-stdlib, agda-categories, agda-algebras y un conjunto reducido de desarrollos de investigación cedidos por sus autores. La mayoría de los enunciados informales fueron generados por LLM (GLM-5.2 y GLM-5.3-flash) leyendo el código fuente, y algunos provienen de comentarios y artículos de los autores. Todo el material se usó con consentimiento de los desarrolladores del código.

## Capacidades

- Generación de pasos de edición en Agda: declaración con agujeros (`declare`), división por casos sobre una variable (`split`) y refinamiento de un agujero con un término (`refine`), cada uno validado por Agda antes de continuar.
- Lectura del contexto del fichero: incorpora el header (módulo, imports, pragmas) y hasta las últimas 80 líneas previas a la declaración, de modo que reutiliza definiciones, imports y notación ya presentes.
- Uso del goal de Agda: recibe el objetivo y el contexto del agujero con el número más bajo y genera el paso correspondiente.
- Autoformalización a partir de un enunciado informal en lenguaje natural.
- Formato de prompt estructurado con etiquetas XML (`<file>`, `<header>`, `<context>`, `<informal>`, `<state>`, `<goal>`, `<command>`) y salida terminada en `<|im_end|>`.
- Decodificación greedy (temperatura 0) para el mejor paso individual; búsqueda por haz para explorar alternativas cuando Agda rechaza el paso.
- Integración como modelo por defecto de la extensión ASTRAL Autoformalize para VS Code.
- No soporta tool calling, agentes genéricos, visión, audio ni modo thinking explícito según la información disponible.

## Casos de uso

- Formalización interactiva en el editor: dentro de la extensión ASTRAL Autoformalize, el usuario selecciona un enunciado informal y pulsa `Ctrl+Alt+P`; el modelo propone pasos que Agda verifica uno a uno, permitiendo al usuario aceptar, rechazar o corregir cada paso sin perder el trabajo previo.
- Asistencia a investigadores en teoría de categorías: al haber sido entrenado con agda-categories, puede generar pasos que reutilizan la notación y las definiciones de esa biblioteca, acelerando la escritura de lemas auxiliares.
- Docencia de lógica y matemáticas formales: el bucle paso a paso con verificación del compilador hace visible el proceso de demostración, útil para mostrar a estudiantes cómo se construye una prueba en Agda.
- Prototipado de bibliotecas algebraicas: con agda-algebras en el corpus, el modelo puede sugerir divisiones por casos y refinamientos en desarrollos de álgebra universal, reduciendo el coste de exploración inicial.
- Servicio local de autoformalización vía API: desplegado con `llama-server` en `/v1/completions`, un equipo puede ofrecer formalización de enunciados a otros desarrolladores de su organización sin depender de servicios externos, gracias a la licencia Apache 2.0.
- Ejecución en portátiles y CPUs: la cuantización Q4_K_M de 2,8 GB permite usar el modelo en equipos sin GPU dedicada, lo que facilita su adopción en entornos docentes o de investigación con hardware limitado.
- Ajuste adicional sobre dominios específicos: al ser un fine-tune LoRA fusionado sobre un modelo base Apache 2.0, sirve como punto de partida para adaptar el comportamiento a otras bibliotecas Agda o a estilos de código concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB para Q4_K_M y 5 GB para Q8_0, según los tamaños de fichero publicados (2,8 GB y 4,6 GB).
- GPU recomendadas: Q8_0 para GPUs con 8 GB o más; Q4_K_M para GPUs integradas y pequeñas, CPUs y portátiles.
- Cabe en GPUs de consumo: sí, ambas cuantizaciones caben en tarjetas de 8 GB o más; Q4_K_M es apta para equipos sin GPU dedicada.
- Opciones de despliegue: llama.cpp mediante `llama-server` (build Vulkan para Intel, AMD y NVIDIA en Windows y Linux; `brew install llama.cpp` en macOS) y la extensión ASTRAL Autoformalize, que descarga el modelo y llama.cpp automáticamente y elige la forma de ejecución más rápida.
- Configuración sugerida: `llama-server -hf astral-expmath/qwen3.5-4b-agda-steps-GGUF:Q4_K_M --alias steps --port 8000 -c 8192`.
- Latencia y throughput: no disponibles. El autor recomienda limitar cada paso a 256 tokens con `<|im_end|>` como stop string.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| astral-expmath/qwen3.5-4b-agda-steps-GGUF | 4.326 M | 4096 (entrenamiento) | Pasos de edición en Agda | apache-2.0 | GGUF |
| astral-expmath/qwen3.5-4b-agda-autoformalize-context-GGUF | 4.326 M (base) | no disponible | Declaración Agda completa de una vez | apache-2.0 | GGUF |
| Qwen/Qwen3.5-4B | 4.326 M | no disponible | Propósito general | no disponible en la información | safetensors y otros |

El modelo hermano `qwen3.5-4b-agda-autoformalize-context-GGUF` comparte base y licencia pero ataca la tarea con una estrategia distinta: escribe la declaración entera en lugar de un paso. El modelo base Qwen3.5-4B es la referencia de propósito general sobre la que se construye este ajuste. No se dispone de datos de benchmarks que permitan comparar rendimiento entre ellos.

## Limitaciones y advertencias

- Conocimiento restringido al estilo de Agda presente en agda-stdlib, agda-categories y agda-algebras; estilos alternativos como Agda cúbica o el uso de bibliotecas no incluidas quedan fuera de su distribución de entrenamiento.
- Cada paso lo verifica Agda, pero la declaración final solo es tan buena como su enunciado: el autor advierte explícitamente de que hay que comprobar que la formalización dice lo que se pretendía.
- El modelo responde un paso por petición; ejecutar una demostración completa requiere un bucle externo que aplique cada paso con Agda y vuelva a consultar, como hace la extensión.
- Entrenado sin plantilla de chat: debe usarse en modo text completion (`/v1/completions`), no en modo chat; emplear el formato incorrecto degrada la calidad de la salida.
- Idioma de entrenamiento únicamente inglés (`en`), lo que puede afectar al procesamiento de enunciados informales en castellano u otros idiomas.
- Riesgo de alucinación en términos y nombres de lemas que no existan en el contexto del fichero, aunque el bucle con Agda los detecte y permita reintentar con búsqueda por haz.
- Sesgos específicos del corpus: la sobrerrepresentación de bibliotecas de teoría de categorías y álgebra puede infrarepresentar otras áreas matemáticas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la corrección de las formalizaciones generadas; en producción conviene mantener la verificación con Agda como paso obligatorio.
- No se han publicado métricas de rendimiento ni evaluaciones cuantitativas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/astral-expmath/qwen3.5-4b-agda-steps-GGUF
- Modelo hermano (declaración completa): https://huggingface.co/astral-expmath/qwen3.5-4b-agda-autoformalize-context-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Releases de llama.cpp (builds Vulkan): https://github.com/ggml-org/llama.cpp/releases
- TRL: https://github.com/huggingface/trl
- agda-stdlib: https://github.com/agda/agda-stdlib
- agda-categories: https://github.com/agda/agda-categories
- agda-algebras: https://github.com/ualib/agda-algebras
