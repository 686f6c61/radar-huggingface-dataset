# romanvaxman/josi-qwen3.5-9b

## Resumen

Josi-qwen3.5-9b es un modelo de lenguaje conversacional derivado de la familia Qwen 3.5, publicado por el usuario romanvaxman bajo el identificador `romanvaxman/josi-qwen3.5-9b`. Se distribuye exclusivamente en formato GGUF cuantizado Q4_K_M y está pensado para ejecutarse en local mediante Ollama, integrado en el producto Josi CE (un asistente que los instaladores oficiales descargan y verifican por hash SHA-256). El modelo base es Qwen 3.5 de 9B, aunque la model card no documenta el proceso de ajuste ni los datos empleados para producir esta variante.

El artefacto principal ocupa 5.780.090.592 bytes (aproximadamente 5,8 GB) y el repositorio completo pesa 5,8 GB. Según la información del autor, requiere unos 6 GB de memoria gráfica (cómodo en una tarjeta de 8 GB) o unos 7 GB de RAM si se ejecuta en CPU. La configuración recomendada por el autor fija `num_ctx` en 24576 tokens.

La relevancia de esta ficha es limitada: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, no dispone de licencia declarada, no especifica idiomas soportados y no publica benchmarks. El recuento de parámetros en safetensors es de 9.197.093.888, coherente con un modelo denso de aproximadamente 9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen 3.5; detalles no disponibles) |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 24576 tokens (valor de `num_ctx` fijado en la plantilla de Ollama del autor) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Tamano del artefacto | 5.780.090.592 bytes (5,8 GB) |
| Hash SHA-256 | `639026e032896869f8176bb6cecaa4c8df14e6ac3a0e31b1aab0e111b43a26cd` |
| Memoria requerida (GPU) | ~6 GB (8 GB de VRAM recomendados) |
| Memoria requerida (CPU) | ~7 GB de RAM |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de su origen en Qwen 3.5 y del recuento de parámetros (9,2B). La model card no describe si se trata de un transformer denso estándar, si incorpora atención lineal, decodificación especulativa u otras innovaciones del modelo base. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado para producir la variante "Josi".

El único dato técnico verificable del proceso de empaquetado es la cuantización Q4_K_M y la plantilla de Ollama, que fija `num_ctx` a 24576 y carga el GGUF desde un archivo local. El autor indica que los instaladores de Josi verifican la integridad del archivo mediante SHA-256 antes de registrarlo en Ollama, lo que sugiere una cadena de distribución controlada, pero no aporta información sobre el ajuste del modelo.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el uso previsto (asistente Josi CE) indican soporte de diálogo multi-turno.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse a través de una API compatible con OpenAI, aunque no se detalla el mecanismo.
- Ejecución local en Ollama: el formato GGUF y la plantilla `FROM`/`PARAMETER` confirman despliegue en Ollama.
- Capacidades de razonamiento, código, matemáticas o tool calling: no disponibles en la información proporcionada; se heredarían, en su caso, del modelo base Qwen 3.5, pero no se documentan.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Asistente conversacional de escritorio: el modelo está empaquetado para el producto Josi CE, que lo descarga y ejecuta en local con Ollama; encaja en escenarios de asistente personal con privacidad de datos, ya que no requiere conexión a un servidor externo.
- Despliegue en equipos con GPU de consumo: con ~6 GB de VRAM cabe en tarjetas de 8 GB (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 3070), lo que permite inferencia local en estaciones de trabajo modestas.
- Ejecución en CPU: con ~7 GB de RAM puede correr sin GPU, útil para portátiles o servidores sin acelerador, a costa de mayor latencia (no cuantificada).
- Integración vía API compatible con endpoints: el tag `endpoints_compatible` permite exponer el modelo detrás de una interfaz tipo OpenAI para conectar aplicaciones existentes.
- Prototipado de chatbots multi-turno: la ventana de 24576 tokens permite mantener conversaciones con historial largo sin truncar el contexto en la configuración recomendada.
- Entornos con requisitos de integridad: el hash SHA-256 publicado permite verificar el artefacto antes de desplegarlo, adecuado para pipelines que exigen cadena de suministro controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~6 GB para la cuantización Q4_K_M; el autor recomienda 8 GB para operar con comodidad.
- RAM estimada en CPU: ~7 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4060 Ti, RTX 4070); no se especifican requisitos para A100/H100 porque el modelo está orientado a consumo.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o superiores.
- Opciones de despliegue: Ollama (soporte oficial documentado por el autor); llama.cpp es compatible por el formato GGUF, aunque no se menciona explícitamente. vLLM y TGI no están documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| josi-qwen3.5-9b | 9,2B | 24576 (config. Ollama) | GGUF Q4_K_M | no disponible | Hugging Face (0 descargas) |
| Qwen 3.5 9B (base) | ~9B | no disponible en esta ficha | safetensors/GGUF (segun variante) | no disponible en esta ficha | Hugging Face |
| Alternativas de ~8-9B en GGUF Q4 | ~8-9B | variable | GGUF | variable | Hugging Face |

No se dispone de datos de rendimiento del modelo ni de las alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial; debe consultarse al autor antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real y la calidad en castellano.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni otras tareas.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de evaluación no puede acotarse.
- Trazabilidad limitada: no se documenta el proceso de ajuste ni los datos usados para producir la variante "Josi", lo que dificulta evaluar sesgos y procedencia.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni reportes de uso que validen el modelo.
- Contexto efectivo: los 24576 tokens corresponden a la configuración de la plantilla de Ollama, no necesariamente al máximo del modelo base.
- Dependencia del ecosistema Josi: el empaquetado está orientado a los instaladores de Josi CE; su uso fuera de ese producto no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/romanvaxman/josi-qwen3.5-9b
- Sitio del producto Josi: https://heyjosi.com
