# IFM/K2-Horizon-0.9B

## Resumen

K2-Horizon-0.9B es un modelo de lenguaje decoder-only de tipo denso desarrollado por IFM (Integrated Foundation Models), con 1.078.285.824 parámetros reales según los pesos en safetensors (etiquetado comercialmente como "0.9B"). Forma parte de la familia K2-Horizon y está orientado explícitamente al razonamiento compacto: matemáticas, código, ciencia y uso de herramientas. Su ventana de contexto alcanza los 131.072 tokens (128K) mediante escalado YaRN de RoPE, lo que lo sitúa en una franja poco habitual para su tamaño.

El modelo se entrena mediante destilación multi-profesor (multi-teacher distillation), con profesores especializados por dominio para matemáticas y código, STEM, y seguimiento de instrucciones. IFM publica junto al modelo el código de entrenamiento, el código de evaluación y el conjunto de datos de entrenamiento, lo que lo convierte en una propuesta "fully open" dentro de la categoría de modelos pequeños.

Es relevante ahora porque combina tres factores poco frecuentes en la franja sub-1B: contexto de 128K, entrenamiento orientado a razonamiento y trazabilidad completa del pipeline de datos y entrenamiento. Su licencia Apache 2.0 elimina fricción para uso comercial, y su tamaño permite despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 1.078.285.824 (1,08B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (128K), con escalado YaRN de RoPE |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se detallan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `custom_code` / `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso, sin mezcla de expertos: todos los parámetros (1,08B) se activan en cada token. La extensión de contexto hasta 131.072 tokens se consigue mediante escalado YaRN sobre RoPE. El identificador de arquitectura en el repo es `k2_horizon`, con código personalizado, por lo que la carga requiere `trust_remote_code=True` en transformers.

El entrenamiento se basa en destilación de conocimiento multi-profesor: distintos profesores especializados cubren matemáticas y código, STEM y seguimiento de instrucciones. La model card indica que tanto la receta de entrenamiento como los datos y el código son públicos, lo que permite reproducir o auditar el proceso. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron fases de RLHF o DPO; estos datos deben consultarse en el repositorio de datos enlazado por el autor.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento matemático orientado a problemas de competición (la model card referencia AIME 2025 entre sus evaluaciones).
- Generación y razonamiento sobre código, con profesor de destilación específico de dominio.
- Razonamiento científico y de conocimiento STEM.
- Uso de herramientas (tool use), evaluado explícitamente según la model card.
- Ventana de contexto larga de 128K tokens para documentos extensos y conversaciones multi-turno prolongadas.
- Seguimiento de instrucciones entrenado mediante profesor específico de instruction following.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Razonamiento matemático asistido: resolución de problemas paso a paso en entornos educativos o de validación, aprovechando el entrenamiento con profesor específico de matemáticas y su evaluación en pruebas tipo competición.
- Asistencia de código en local: autocompletado, explicación y refactorización en un IDE o pipeline de CI/CD, con despliegue en una sola GPU de consumo gracias a su tamaño sub-1B.
- Procesamiento de documentos largos: análisis y resumen de contratos, informes o expedientes de hasta 128K tokens sin fragmentación, útil en back-office documental.
- Agentes con tool calling: orquestación de llamadas a APIs y funciones en flujos multi-paso, donde el bajo coste por token permite iteraciones frecuentes.
- Atención al cliente en inglés y chino: conversaciones multi-turno con contexto largo y coste de inferencia reducido, adecuado para volúmenes altos.
- Clasificación y extracción de información estructurada sobre textos extensos: pipelines de enriquecimiento de datos con ventanas de 128K.
- Prototipado e investigación en destilación: al publicarse datos, receta y código, sirve como base reproducible para estudiar cambios de capacidad entre checkpoints (la model card menciona checkpoints intermedios, aunque esa línea aparece comentada en el texto extraído).

## Benchmarks y rendimiento

La model card incluye una tabla comparativa frente a Qwen3.5-0.8B, OpenBMB-1B y Qwen3.5-2B, con secciones de matemáticas (AIME 2025) y otras categorías. Sin embargo, los valores numéricos de esa tabla no están disponibles en la información proporcionada (el HTML aparece truncado). Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 2,2 GB solo para pesos, más caché KV; con 128K de contexto la caché KV crece de forma significativa y puede dominar el consumo en secuencias largas.
- VRAM estimada en cuantización de 8 bits: en torno a 1,1-1,3 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,6-0,8 GB para pesos.
- GPU recomendadas para producción: A100, H100 o L40S para servir contexto de 128K con concurrencia; RTX 4090 y RTX 3090 sobradas para el modelo en BF16 a contextos moderados.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 4080, RTX 3090, RTX 4070 Ti e incluso GPUs de 8 GB en cuantización de 4 bits para contextos cortos.
- Opciones de despliegue: transformers (requiere `trust_remote_code` por el código `k2_horizon`); vLLM, TGI y llama.cpp/Ollama son opciones plausibles, pero no se confirma en la información disponible soporte oficial en esos motores ni la existencia de pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|---|
| K2-Horizon-0.9B | 1,08B | Densa | 128K (YaRN) | Apache 2.0 | en, zh | Destilación multi-profesor; datos y código públicos |
| Qwen3.5-0.8B | 0,8B | Densa | no disponible | no disponible | no disponible | Modelo de referencia usado en la comparativa del autor |
| OpenBMB-1B | 1B | Densa | no disponible | no disponible | no disponible | Modelo de referencia usado en la comparativa del autor |
| Qwen3.5-2B | 2B | Densa | no disponible | no disponible | no disponible | Modelo de referencia usado en la comparativa del autor |

Los datos de rendimiento comparado (AIME 2025 y resto de categorías) están referenciados en la model card pero sus valores no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está garantizado ni evaluado.
- Riesgo de alucinación: como todo modelo generativo de 1B, la tasa de error factual en conocimiento abierto es alta; conviene usarlo con verificación externa o como componente de un pipeline con herramientas.
- Capacidad limitada por tamaño: pese al entrenamiento en razonamiento, 1,08B de parámetros acotan la profundidad de razonamiento frente a modelos de mayor escala; los benchmarks de matemáticas de competición deben interpretarse con cautela.
- Contexto largo: aunque soporta 128K tokens, la calidad efectiva de recuperación en ventanas muy largas no está documentada en la información disponible, y la caché KV a esa longitud encarece la inferencia.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar la implementación `k2_horizon` antes de desplegar en producción.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no exime de las obligaciones habituales de atribución y de las responsabilidades sobre sesgos y contenido generado.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad en la información disponible.
- Repo de 77,6 GB: el tamaño del repositorio es muy superior al de los pesos, probablemente por checkpoints intermedios u otros artefactos; conviene descargar solo los archivos necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IFM/K2-Horizon-0.9B
- Código de entrenamiento (xllm): https://github.com/ifm-ai/xllm
- Código de evaluación (Eval360): https://github.com/ifm-ai/Eval360
- Datos de entrenamiento (DATA_NAVIGATOR): https://github.com/ifm-ai/DATA_NAVIGATOR
