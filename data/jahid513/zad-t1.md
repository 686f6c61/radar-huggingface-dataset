# jahid513/Zad-T1

## Resumen

Zad T1 es un modelo de visión-lenguaje (image-text-to-text) afinado por el usuario jahid513 (identificado en la model card como "Jahid Sir") a partir de Qwen/Qwen3-VL-2B-Instruct. Su propósito es muy específico: leer la imagen de un gráfico de velas (las últimas 60 velas) de la plataforma de opciones binarias Quotex y devolver una respuesta en un formato fijo de 9 líneas con el par identificado, la tendencia según EMA200, la condición de mercado, el patrón de velas, la proximidad a soporte/resistencia, el estado de un indicador propietario ("JAHID KHAN FAST") con su confianza y una señal final CALL/PUT para expiraciones de 1 y 5 minutos, tanto en mercado Real (forex) como OTC.

El modelo se distribuye exclusivamente en formato GGUF para llama.cpp, con un archivo principal cuantizado Q4_K_M de aproximadamente 1,1 GB y dos proyecciones visuales (mmproj) separadas, en F16 y Q8_0. El modelo base aporta 1.720.574.976 parámetros (unos 1,7 B) y una ventana de contexto de la que no se publican detalles en la información disponible. La relevancia de este modelo es acotada: no es un modelo de propósito general, sino una demostración de afinado QLoRA de un VLM pequeño sobre una tarea vertical muy concreta con salida estructurada.

La licencia declarada es Apache 2.0, heredada del modelo base, y los idiomas soportados según los metadatos son bengalí (bn) e inglés (en). El repositorio ocupa 2,4 GB y acumula 156 descargas en el momento de la consulta, con fecha de creación y actualización en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (VLM) derivado de Qwen3-VL-2B-Instruct; detalles internos del backbone no disponibles |
| Parametros totales | 1.720.574.976 (~1,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de uso invoca `-c 4096`) |
| Tipos de cuantizacion | Q4_K_M para el modelo principal; F16 y Q8_0 para el proyector visual (mmproj) |
| Idiomas soportados | Bengalí (bn), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Proyector visual | mmproj separado obligatorio (F16 ~785 MB o Q8_0 ~425 MB) |
| Pipeline | image-text-to-text |
| Descargas | 156 |
| Tamano del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct, un VLM de unos 1,7 B parámetros que combina un codificador visual con un transformer de lenguaje y que, en su versión original, está diseñado para tareas de imagen-texto. Zad T1 conserva esa arquitectura y añade un proyector visual (mmproj) exportado de forma independiente en formato GGUF, lo que permite ejecutar el modelo en llama.cpp con soporte de entrada de imágenes. Los detalles concretos de la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención) no se documentan en la información disponible.

El entrenamiento se realizó mediante QLoRA sobre datos de gráficos de Quotex, tanto del mercado Real (forex) como del OTC, según indica la model card. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla la innovación técnica del indicador propietario "JAHID KHAN FAST" más allá de su descripción funcional: dispara BUY o SELL cuando el cierre de la vela previa cruza una media de 3 periodos. La model card menciona además un "identity fine-tune" que renombra el modelo como Zad T1.

## Capacidades

- Lectura de gráficos de velas a partir de una imagen: identifica el par, la tendencia EMA200, la condición de mercado (tendencia o rango), patrones de velas y proximidad a soportes y resistencias.
- Evaluación de un indicador propietario ("JAHID KHAN FAST") con salida BUY/SELL/None y un porcentaje de confianza de 0 a 100.
- Emisión de una señal final CALL/PUT para expiraciones de 1 y 5 minutos.
- Salida estructurada en un formato fijo de 9 líneas, lo que facilita el parseo automático.
- Cobertura de mercados Real (forex) y OTC de Quotex.
- Capacidades multilingües limitadas a bengalí e inglés según los metadatos.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo de razonamiento extendido.

## Casos de uso

- Señalización asistida en opciones binarias: el modelo recibe una captura del gráfico de Quotex y devuelve una señal CALL/PUT con confianza, pensada como apoyo a la decisión del operador, no como sustituto del análisis propio.
- Automatización de un pipeline de captura y parseo: al devolver un formato fijo de 9 líneas, la salida puede procesarse con expresiones regulares para registrar señales en una base de datos o enviarlas a un bot.
- Backtesting de reglas de indicador: usar el modelo para etiquetar históricos de capturas de gráficos y comparar sus señales con el resultado real de la operación.
- Despliegue en hardware modesto: con ~1,1 GB en Q4_K_M más un mmproj Q8_0 de ~425 MB, puede ejecutarse en CPU o en GPUs de consumo con poca VRAM mediante llama.cpp.
- Prototipado de asistentes verticales de trading: sirve como ejemplo de cómo afinar un VLM pequeño con QLoRA para una tarea de dominio muy restringida con salida estructurada.
- Educación y análisis de patrones: el modelo puede describir tendencia, patrón de velas y niveles de soporte/resistencia de una captura, útil para revisar operaciones pasadas.
- Integración en aplicaciones de escritorio o móviles: el formato GGUF y el uso de llama.cpp permiten empaquetar el modelo en herramientas locales sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el modelo principal en Q4_K_M ocupa ~1,1 GB; el mmproj F16 añade ~785 MB y el Q8_0 ~425 MB. En total, entre ~1,5 GB y ~1,9 GB de memoria para pesos, más el overhead de contexto y del runtime.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060), usando el mmproj Q8_0 para minimizar memoria.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM; en el extremo alto, A100 o H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Ejecución en CPU: viable con llama.cpp, usando el mmproj Q8_0 y contexto moderado.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server con soporte multimodal). No se documenta compatibilidad con vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. La model card recomienda recortar la captura al área del gráfico y redimensionar a unos 880x760 píxeles para obtener mejores resultados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Zad T1 | ~1,7 B | No disponible | Imagen-texto (gráficos) | Apache 2.0 | GGUF | Afinado vertical para Quotex |
| Qwen/Qwen3-VL-2B-Instruct | ~1,7 B | No disponible en esta ficha | Imagen-texto general | Apache 2.0 | Safetensors, GGUF (según repo) | Modelo base, propósito general |
| Otros VLM pequeños (p. ej., familia Qwen2-VL-2B) | ~2 B | Variable | Imagen-texto general | Apache 2.0 (según versión) | Safetensors, GGUF | Alternativas generalistas, sin afinado de trading |

La comparación directa con benchmarks no es posible porque Zad T1 no publica métricas. Frente a su modelo base, la diferencia principal es la especialización en una tarea y un formato de salida concretos, a costa de perder generalidad.

## Limitaciones y advertencias

- El modelo emite señales de trading que no constituyen asesoramiento financiero; la propia model card advierte de que son predicciones y deben verificarse con análisis propio.
- Riesgo alto de alucinación en la identificación del par o del patrón si la captura no está bien recortada o tiene baja resolución.
- La calidad depende del formato de entrada: se recomienda recortar al área del gráfico y redimensionar a ~880x760 píxeles.
- El indicador "JAHID KHAN FAST" es propietario y no se documenta su implementación, lo que impide auditar la lógica de la señal.
- Idiomas limitados a bengalí e inglés; no se garantiza un rendimiento correcto en castellano.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden imponer condiciones adicionales no detalladas.
- No se documentan sesgos específicos, pero al entrenarse sobre datos de una plataforma concreta (Quotex) puede no generalizar a otros brókeres o formatos de gráfico.
- El contexto máximo no está especificado; el ejemplo de uso emplea `-c 4096`, por lo que ventanas mayores no están garantizadas.
- El repositorio tiene pocas descargas (156) y ningún "like", lo que sugiere escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jahid513/Zad-T1
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Repositorio de llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la información disponible papers, blogs, demos ni repositorios adicionales del autor.
