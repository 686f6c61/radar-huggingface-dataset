# Blue-nim/K2-Horizon-MoVA-36B-A4B-GGUF

## Resumen

K2-Horizon-MoVA-36B-A4B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por IFM, con atención Mixture-of-Values (MoVA). Almacena 36 mil millones de parámetros totales, pero solo activa aproximadamente 4 mil millones por token, lo que lo convierte en un modelo disperso de alta eficiencia. Su característica más destacada es una ventana de contexto nativa de 524.288 tokens (512K), lo que le permite procesar documentos extremadamente largos. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato GGUF para su uso con llama.cpp, aunque requiere una versión del framework con soporte para la arquitectura K2 Horizon. Según sus desarrolladores, ofrece resultados competitivos con modelos cerrados de frontera en tareas de razonamiento y uso de agentes, a pesar de su reducido número de parámetros activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención Mixture-of-Values (MoVA) |
| Parametros totales | 37.444.792.020 (36B según la model card) |
| Parametros activos | ~4B por token |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | GGUF con pesos BF16 originales; no se especifican cuantizaciones adicionales |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base también está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de transformer con capas de Mixture-of-Experts (MoE). La innovación principal es la atención Mixture-of-Values (MoVA), que combina múltiples valores de atención dentro de cada capa. Con 36B parámetros totales y solo 4B activos por token, el modelo logra un equilibrio entre capacidad y coste computacional. El entrenamiento se realizó sobre los datasets IFM/K2-Horizon-Pretrain-Data y IFM/K2-Horizon-Midtrain-Data. Los desarrolladores indican que el checkpoint final ha sido liberado, y que los checkpoints intermedios, junto con los datos de entrenamiento y el código, se publicarán en el futuro. No se detalla si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de alto nivel, con resultados destacados en benchmarks de agentes y razonamiento según el blog de IFM.
- Ventana de contexto nativa de 524.288 tokens, lo que permite manejar documentos largos y conversaciones extensas.
- Soporte para tareas de agente y razonamiento multi-paso, según los benchmarks publicados por IFM.
- Capacidad de conversación mediante la plantilla de chat incluida en los archivos GGUF.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés (language: en).
- No se especifican capacidades de visión o audio.

## Casos de uso

1. Análisis de documentos extensos: gracias a la ventana de 512K tokens, el modelo puede procesar informes, contratos o expedientes completos sin necesidad de dividirlos en fragmentos.
2. Asistente de programación con contexto amplio: puede recibir un repositorio entero de código y responder preguntas sobre él, lo que facilita la revisión de código y la depuración.
3. Razonamiento agéntico de largo alcance: el modelo puede mantener el estado en tareas multi-paso que requieren seguir instrucciones complejas y encadenar herramientas.
4. Investigación académica: permite analizar y resumir grandes volúmenes de literatura científica o técnica, extrayendo conclusiones de textos largos.
5. Chat conversacional: al incluir una plantilla de chat compatible con llama.cpp, puede desplegarse como asistente en aplicaciones de mensajería.
6. Evaluación de modelos open source: al ser de pesos abiertos y con licencia Apache 2.0, es útil para investigar técnicas de MoE y atención MoVA en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla comparativa con otros modelos, pero los valores numéricos no están completos en los datos proporcionados. El blog de IFM afirma que el modelo supera a modelos densos de ~30B y a modelos MoE hasta 15 veces su tamaño en benchmarks de agentes y razonamiento, y que es competitivo con modelos cerrados de frontera, pero no se aportan cifras concretas.

## Requisitos de hardware

- VRAM estimada: para ejecutar el modelo en BF16 se requieren aproximadamente 75 GB de VRAM (74,9 GB es el tamaño del repo). Con cuantizaciones de 4 bits, la VRAM necesaria se reduciría, pero no se especifican los tipos de cuantización disponibles.
- GPU recomendadas: A100 80GB o H100 80GB para inferencia en BF16. Para cuantización Q4, una RTX 4090 de 24GB podría ser suficiente, aunque no está confirmado.
- Cabe en GPU de consumo: probablemente con cuantización de 4 bits en GPUs de 24GB, pero no hay datos oficiales.
- Opciones de despliegue: llama.cpp (requiere una versión con soporte para la arquitectura K2 Horizon, como el fork de MBZUAI-IFM). No se especifican otras opciones en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B | 36B | ~4B | 524.288 | Apache 2.0 |
| Qwen3.6-35B-A3B | 35B | ~3B | no disponible | no disponible |
| G9v3-39A5B | 39B | ~5B | no disponible | no disponible |
| Muse Glimmer-30B | 30B | no disponible | no disponible | no disponible |
| Gemma 4 31B-it | 31B | denso | no disponible | no disponible |

Nota: los datos de contexto y licencia de los modelos comparados no están disponibles en la información proporcionada. El rendimiento comparativo no puede evaluarse sin los valores de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no se dispone de evaluaciones específicas; como todo modelo de lenguaje, puede generar contenido no veraz.
- Limitaciones de idioma: el modelo solo está entrenado para inglés, por lo que su rendimiento en otros idiomas es incierto.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero requiere mantener el aviso de copyright.
- Precaucion para produccion: la arquitectura K2 Horizon aún no está soportada en la versión principal de llama.cpp; es necesario usar un fork específico, lo que puede afectar a la estabilidad y al soporte a largo plazo.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/Blue-nim/K2-Horizon-MoVA-36B-A4B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Blog de IFM: https://ifm.ai/blog/k2
- Página de Benchgen con benchmarks: https://benchgen.com/models/ifm/k2-horizon-mova-36b-a4b
- Fork de llama.cpp con soporte K2 Horizon: https://github.com/MBZUAI-IFM/llama.cpp/tree/model/K2Horizon
