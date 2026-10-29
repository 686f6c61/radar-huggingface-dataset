# axteam/PaddleOCR-VL-FP8-dynamic

## Resumen

PaddleOCR-VL-FP8-dynamic es una cuantización en FP8 de PaddleOCR-VL, el modelo vision-language (VLM) de PaddlePaddle especializado en parsing de documentos y OCR. El modelo base, de 0,9 B de parámetros (958.588.736 parámetros reales según los safetensors de este repositorio), combina un encoder visual de resolución dinámica tipo NaViT con un backbone de lenguaje ERNIE-4.5-0.3B y está diseñado para reconocer texto, tablas, fórmulas y gráficos con un consumo de recursos muy bajo. Esta variante la publica el usuario axteam y no altera el modelo original: aplica cuantización post-entrenamiento (PTQ) sin calibración sobre las proyecciones de atención y MLP del backbone textual.

El interés de esta ficha es práctico: el repositorio entrega los pesos ya empaquetados en formato `compressed-tensors` con esquema `FP8_DYNAMIC` (W8A8, pesos FP8 E4M3 con escala por canal y activaciones FP8 dinámicas por token), lo que permite servirlo directamente con vLLM mediante `--trust-remote-code`. El resultado en disco baja a aproximadamente 1,5 GB, frente a los 1,9 GB del repositorio completo, y el coste en calidad medido por el autor es mínimo: una variación de perplejidad del -0,1 % y un 99,6 % de acuerdo top-1 frente al modelo en BF16 sobre un conjunto interno de 100 prompts en inglés y coreano.

La decisión de diseño más relevante es que la cuantización se aplica solo al tramo de lenguaje: la torre visual (`visual.*`), el proyector visión-texto (`mlp_AR.*`), los embeddings de tokens, la LM head y todas las RMSNorm permanecen en BF16. De este modo, la ruta crítica de OCR y percepción visual queda intacta y el ahorro de memoria se concentra donde menos afecta a la precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM denso para documentos: encoder visual estilo SigLIP/NaViT de resolución dinámica + proyector visión-texto + backbone textual ERNIE-4.5-0.3B |
| Parametros totales | 958.588.736 (~0,96 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinámico (W8A8): pesos FP8 E4M3 con escala por canal, activaciones FP8 dinámicas por token, esquema `compressed-tensors` `FP8_DYNAMIC`; sin calibración. Torre visual, proyector, embeddings, LM head y RMSNorm en BF16 |
| Idiomas soportados | 109 idiomas según la documentación de PaddleOCR-VL; el autor solo aporta una evaluación interna en inglés y coreano |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors FP8_DYNAMIC); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un VLM compacto orientado a parsing de documentos: un encoder visual de resolución dinámica (estilo NaViT, descrito en la documentación de Transformers como SigLIP-style con parcheo dinámico) extrae las características de la imagen de página, un proyector las alinea con el espacio del modelo de lenguaje y un backbone ERNIE-4.5-0.3B genera la salida estructurada (texto, tablas, fórmulas). Con ~0,96 B de parámetros totales, la práctica totalidad del coste computacional recae en el encoder visual y en un decoder pequeño, lo que explica su perfil de bajo consumo.

Esta variante no introduce ningún cambio arquitectónico ni de entrenamiento: es cuantización post-entrenamiento sin reentrenamiento ni calibración (data-free). Solo se cuantizan las proyecciones de atención y MLP del backbone lingüístico; el resto de módulos se conserva en BF16. El tokenizador, la `chat_template` y el procesador son idénticos a los del modelo original, por lo que cualquier pipeline que ya funcione con PaddlePaddle/PaddleOCR-VL puede apuntar a este repositorio cambiando únicamente el identificador.

## Capacidades

- Reconocimiento de texto en imágenes de documentos (OCR) con salida en texto plano y en Markdown estructurado.
- Parsing de elementos complejos: tablas, fórmulas matemáticas, gráficos y bloques de texto con orden de lectura.
- Conversión imagen-a-texto conversacional (`image-text-to-text`) con soporte de plantilla de chat, lo que permite instrucciones del tipo "extrae solo la tabla" o "devuelve JSON".
- Cobertura multilingüe amplia: la documentación del modelo base declara 109 idiomas, con evaluación interna del autor en inglés y coreano.
- Resolución dinámica de entrada, lo que evita reescalados agresivos en páginas densas o de formato irregular.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, audio ni modo "thinking" en la información disponible.

## Casos de uso

- Digitalización masiva de PDFs escaneados: el modelo convierte cada página en Markdown o texto plano con tablas y fórmulas preservadas, y su tamaño (~1,5 GB en FP8) permite procesar lotes grandes en una sola GPU de 24 GB.
- Pipelines RAG sobre documentación corporativa: se usa como extractor en la fase de ingesta para generar texto limpio y estructurado antes del chunking y la indexación vectorial, reduciendo el ruido típico de un OCR clásico.
- Extracción de datos estructurados de facturas y albaranes: gracias a la plantilla de chat se le puede pedir la salida en un esquema JSON con campos concretos (importe, fecha, NIF), integrándolo en un flujo de validación posterior.
- Procesamiento de documentación técnica y científica: reconocimiento de fórmulas y tablas en papers o manuales, con salida reutilizable en LaTeX o Markdown.
- Digitalización multilingüe: archivado de documentos en cualquiera de los 109 idiomas declarados por el modelo base, útil en organismos con fondos heterogéneos o en empresas con operaciones en varios países.
- OCR en producción con presupuesto de GPU ajustado: al ser un modelo sub-1B cuantizado a FP8, cabe en tarjetas de gama media e incluso permite varias réplicas por GPU para absorber picos de tráfico.
- Preprocesado para modelos mayores: usar este OCR como primer paso que extrae el texto de un documento y alimentar después a un LLM de mayor tamaño para tareas de razonamiento o resumen.

## Benchmarks y rendimiento

El autor solo publica métricas de fidelidad frente al original en BF16, medidas sobre un conjunto interno mixto inglés/coreano de 100 prompts con scoring de siguiente token:

| Metrica | Este modelo (FP8) | Original BF16 |
|---|---|---|
| Perplejidad (menor = mas cercano) | 1,1050 | 1,1059 (-0,1 %) |
| Acuerdo top-1 de siguiente token | 99,6 % | 100,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, OmniDocBench u otros) para esta variante cuantizada en la información disponible. La model card tampoco reproduce las cifras de referencia del modelo base, por lo que no es posible ofrecer una comparación numérica de calidad OCR frente a otras alternativas.

## Requisitos de hardware

- Pesos en disco: ~1,5 GB (repositorio completo: 1,9 GB). En memoria, los módulos en BF16 (torre visual, proyector, embeddings, LM head y normas) añaden algo más, pero el conjunto sigue por debajo de los 2 GB.
- VRAM estimada para inferencia: del orden de 3-4 GB con contexto corto y lotes pequeños, incluyendo pesos, activaciones y caché KV. Cifra estimada a partir del tamaño de los pesos; el autor no publica mediciones de VRAM.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB son suficientes, y en esta última se pueden levantar varias instancias en paralelo.
- Despliegue recomendado: vLLM (`vllm serve axteam/PaddleOCR-VL-FP8-dynamic --trust-remote-code`), que es el escenario para el que se generó la cuantización. También es cargable con transformers al usar `trust_remote_code`. No se mencionan integraciones con llama.cpp, Ollama ni TGI, y el formato FP8 de compressed-tensors no es compatible con llama.cpp.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de páginas por minuto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/PaddleOCR-VL-FP8-dynamic | ~0,96 B | no disponible | FP8 dinamico (W8A8) | apache-2.0 | Variante para vLLM; vision en BF16; sin benchmarks OCR publicados |
| PaddlePaddle/PaddleOCR-VL (original) | ~0,9 B | no disponible | BF16 | apache-2.0 | Modelo de referencia; sirve como linea base de calidad |
| axteam/GLM-OCR-FP8-dynamic | ~1 B | no disponible | FP8 (presumiblemente equivalente) | no disponible | Alternativa OCR cuantizada del mismo autor; sin datos de rendimiento en la informacion disponible |

No se dispone de datos de benchmarks que permitan comparar la calidad OCR de estas tres opciones entre sí; la comparación se limita a tamaño, formato y licencia.

## Limitaciones y advertencias

- Solo se ha verificado la fidelidad frente al BF16 con 100 prompts internos en inglés y coreano; no hay evaluación pública de precisión OCR por idioma ni sobre dominios concretos (facturas, formularios manuscritos, prensa histórica).
- La cuantización FP8 dinámica puede degradar ligeramente tareas sensibles a la precisión numérica, como fórmulas largas o tablas densas; conviene validar con un conjunto propio antes de sustituir el BF16 en producción.
- El repositorio contiene únicamente el VLM. El pipeline completo de PaddleOCR-VL incluye un módulo de detección de layout que aquí no está incluido; para parsing de página completa hay que orquestarlo por separado o usar el pipeline oficial.
- La longitud de contexto no está documentada, lo que dificulta planificar el troceado de páginas muy densas o de documentos de varias páginas en una sola pasada.
- Riesgo de alucinación inherente a los VLM: puede generar texto que no aparece en la imagen, especialmente con imágenes de baja calidad o recortes ambiguos.
- Sesgos: no se documenta ninguna evaluación de sesgos; el comportamiento en alfabetos no latinos o en lenguas con poca representación en los datos de entrenamiento del modelo base es desconocido.
- Licencia apache-2.0, que permite uso comercial, pero los derechos del modelo original y del procesador pertenecen a los autores de PaddlePaddle; conviene conservar la atribución.
- El despliegue requiere `--trust-remote-code`, lo que implica ejecutar código del repositorio: auditar los ficheros de modelado antes de usarlo en entornos con requisitos de seguridad estrictos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/axteam/PaddleOCR-VL-FP8-dynamic
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL
- Documentación de Transformers para PaddleOCR-VL: https://huggingface.co/docs/transformers/v5.1.0/en/model_doc/paddleocr_vl
- Documentación oficial de PaddleOCR: https://www.paddleocr.ai/main/en/index.html
- Arquitectura y configuración de PaddleOCR-VL (DeepWiki): https://deepwiki.com/PaddlePaddle/PaddleOCR/2.2.1-paddleocr-vl-architecture-and-configuration
- Variante relacionada del mismo autor: https://huggingface.co/axteam/GLM-OCR-FP8-dynamic
