# mradermacher/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-i1-GGUF

## Resumen

KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED es un modelo de lenguaje de código abierto desarrollado por Kwaipilot y cuantizado por mradermacher. Se trata de una variante de desarrollo de la familia KAT-Coder V2.5, construida sobre una arquitectura Mixture-of-Experts de Qwen3.5 (qwen3_5_moe). El modelo cuenta con 35.505 millones de parámetros totales y, según su nomenclatura, activa aproximadamente 3.000 millones por token. Incorpora predicción multi-token (MTP) para decodificación especulativa y ha sido sometido a un proceso de abliteration para reducir comportamientos de rechazo (uncensored). Su licencia Apache 2.0 permite uso comercial. Esta versión en GGUF ofrece cuantizaciones con matrices de importancia (imatrix), lo que facilita el despliegue en entornos locales y de producción. El modelo está entrenado para inglés y chino, y se presenta como un modelo conversacional y de codificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (mixture-of-experts, qwen3_5_moe) |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | 3B (según nomenclatura A3B; no se dispone de cifra exacta) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix: i1-Q2_K (13,3 GB) y archivo imatrix; quants estáticos en repo complementario |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors/Transformers |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura Mixture-of-Experts (MoE) de la familia Qwen3.5. Aunque no se han publicado los detalles completos de la arquitectura, el nombre del modelo (35B-A3B) indica que, de los 35.500 millones de parámetros totales, solo unos 3.000 millones se activan por token. Esto permite una eficiencia computacional notable para su tamaño. El componente MTP (multi-token prediction) está diseñado para la decodificación especulativa, una técnica que puede acelerar la generación de texto en inferencia.

El proceso de entrenamiento se ha llevado a cabo mediante un post-entrenamiento y posteriormente una técnica de abliteration, que elimina o mitiga los comportamientos de rechazo. El modelo es bilingüe (inglés y chino) y está orientado a tareas de codificación y conversación. No se han proporcionado detalles sobre el conjunto de datos de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y código: modelo conversacional y de codificación.
- Razonamiento: no se dispone de información específica sobre capacidades de razonamiento; el modelo está catalogado como coding.
- Tool calling: no se menciona explícitamente en la información proporcionada.
- Agentes: no se menciona explícitamente.
- Multilingüe: inglés y chino.
- MTP / decodificación especulativa: incluido como parte del modelo.
- Uncensored: al haber sido ablacionado, el modelo puede responder a solicitudes que otros modelos rechazan.
- Visión: el modelo base podría ser multimodal, pero esta versión open-weight solo incluye los pesos de lenguaje.

## Casos de uso

- Asistente de programación en local: gracias a la arquitectura MoE con 3B activos, puede ejecutarse en una GPU de consumo (por ejemplo, 16 GB) usando la cuantización Q2_K, ofreciendo respuestas de código sin depender de la nube.
- Generación de código en entornos de integración continua: integrable con llama.cpp u Ollama, puede emplearse para generar tests, comentarios o refactorizaciones en pipelines CI/CD.
- Aplicaciones bilingües en inglés y chino: al soportar ambos idiomas, es adecuado para documentación técnica o equipos que trabajen con estos idiomas.
- Decodificación especulativa en servidores de inferencia: el componente MTP permite acelerar la generación cuando se usa con motores compatibles (por ejemplo, vLLM o KTransformers).
- Herramientas de análisis de código en entornos sin conexión: al ser de pesos abiertos y licencia Apache 2.0, puede desplegarse en entornos aislados o con requisitos de privacidad.
- Chat técnico con restricciones reducidas: gracias a la abliteration, puede responder a consultas de programación sin los rechazos habituales, lo que resulta útil en entornos de investigación donde se exploran casos límite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con la cuantización i1-Q2_K de 13,3 GB, se estima que puede ejecutarse en una GPU con 16 GB de VRAM para contextos moderados.
- GPU recomendadas: RTX 4090 (24 GB) para mayor contexto; A100/H100 para despliegues de producción.
- Sí cabe en GPUs de consumo (por ejemplo, RTX 4080/4090) con cuantización Q2_K.
- Opciones de despliegue: llama.cpp, Ollama (para GGUF); vLLM, SGLang y KTransformers para el modelo base en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa en los datos proporcionados. Los modelos comparables (otros MoE de codificación como Qwen3.5 MoE) no aparecen en los resultados de la búsqueda.

## Limitaciones y advertencias

- Al ser una versión de desarrollo (Dev), puede contener inestabilidades o cambios no definitivos.
- El proceso de abliteration no garantiza la eliminación completa de sesgos; puede introducir respuestas no deseadas o alucinaciones.
- Solo se soportan inglés y chino, lo que limita su uso multilingüe.
- La longitud de contexto no se ha publicado; puede ser menor que la de otros modelos de la misma familia.
- La cuantización Q2_K degrada la calidad de salida; para tareas críticas se recomiendan cuantizaciones de mayor precisión.
- El release open-weight no incluye componentes de visión/multimodal, aunque el modelo base podría haberlos contemplado.
- La licencia Apache 2.0 permite uso comercial, pero deben revisarse las implicaciones de la etiqueta "uncensored" y el uso responsable.

## Enlaces

- Repositorio GGUF con imatrix: https://huggingface.co/mradermacher/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-i1-GGUF
- Repositorio GGUF estático: https://huggingface.co/mradermacher/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-GGUF
- Modelo base (jakeroxs): https://huggingface.co/jakeroxs/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED
- Repositorio de Kwaipilot: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Página de solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
