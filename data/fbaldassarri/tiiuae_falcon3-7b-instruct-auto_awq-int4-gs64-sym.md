# fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_awq-int4-gs64-sym

## Resumen

El modelo fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_awq-int4-gs64-sym es una versión cuantizada a 4 bits del modelo Falcon3-7B-Instruct, desarrollado por el usuario fbaldassarri utilizando la técnica AWQ (Activation-aware Weight Quantization) mediante la herramienta Intel AutoRound. Falcon3-7B-Instruct es un modelo de lenguaje causal basado en la arquitectura Llama, creado por el Technology Innovation Institute (TII) de Abu Dabi, que en el momento de su lanzamiento alcanzó resultados de vanguardia en tareas de razonamiento, comprensión del lenguaje, seguimiento de instrucciones, código y matemáticas. Esta versión cuantizada reduce el peso del modelo a 4 bits con un tamaño de grupo de 64 y cuantización simétrica, lo que permite una inferencia más rápida y con menor consumo de memoria (2-3 veces más rápida según el autor) a costa de una ligera pérdida de precisión.

La cuantización se ha realizado específicamente para su ejecución en hardware Intel: CPU, iGPU (Arc) y NPU (AI Boost en procesadores Core Ultra), utilizando intel-extension-for-pytorch y OpenVINO. El modelo conserva la longitud de contexto de 32.000 tokens del modelo base y su licencia Apache 2.0. Aunque la model card de esta versión cuantizada declara únicamente el idioma inglés, el modelo base Falcon3-7B-Instruct soporta inglés, francés, español y portugués. Es relevante ahora porque permite desplegar un modelo de 7B en entornos con recursos limitados, como portátiles con CPU Intel o GPUs de gama media, facilitando aplicaciones de inferencia local y en el borde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (model_type: llama) |
| Parámetros totales | 1.753.635.840 (según safetensors; el modelo base Falcon3-7B-Instruct tiene aproximadamente 7.000 millones de parámetros) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (heredada del modelo base) |
| Tipos de cuantización | 4-bit AWQ (INT4), group size 64, simétrica |
| Idiomas soportados | Inglés (declarado en la model card de la versión cuantizada); el modelo base soporta inglés, francés, español y portugués |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer causal decoder-only, identificado como "llama" en la configuración del modelo. Falcon3-7B-Instruct, del cual deriva, fue entrenado por TII con un enfoque en razonamiento, código y matemáticas, aunque no se dispone de detalles específicos sobre la composición del dataset de entrenamiento, el número de tokens o si se utilizaron técnicas de RLHF/DPO en la información proporcionada. La versión cuantizada no modifica la arquitectura, sino que aplica una cuantización de solo pesos (weights-only quantization) mediante el algoritmo AWQ implementado en Intel AutoRound v0.15.1. El proceso de cuantización utilizó 128 muestras de calibración, 200 iteraciones de ajuste, una longitud de secuencia de 512 y un tamaño de lote de 4, todo ello en CPU con torch.bfloat16. La duración total de la cuantización fue de 48.782,1 segundos (aproximadamente 13,5 horas). El resultado son pesos de 4 bits con cuantización simétrica y tamaño de grupo 64, lo que reduce el uso de memoria y acelera la inferencia en hardware Intel compatible.

No se han proporcionado detalles sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto conversacional: modelo de instrucciones/chat, diseñado para mantener diálogos multi-turno.
- Razonamiento y comprensión del lenguaje: el modelo base destaca en tareas de razonamiento, según la información del modelo original.
- Generación de código y matemáticas: el modelo base logra resultados de vanguardia en código y matemáticas en el momento de su lanzamiento.
- Seguimiento de instrucciones: optimizado para instrucciones.
- Capacidades multilingües: la model card de la versión cuantizada solo declara inglés; el modelo base soporta inglés, francés, español y portugués, pero el rendimiento tras la cuantización en estos idiomas no está validado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional local en equipos con CPU Intel o iGPU Arc: gracias a la cuantización 4-bit y al soporte de Intel Extension for PyTorch y OpenVINO, el modelo puede ejecutarse sin GPU dedicada, ofreciendo respuestas en tiempo real en portátiles y mini-PCs con procesadores Core Ultra.
- Generación de código en entornos de desarrollo con recursos limitados: el modelo base tiene un buen rendimiento en código; la versión cuantizada permite integrarlo en IDEs o herramientas de autocompletado que se ejecutan en portátiles, reduciendo la dependencia de la nube.
- Resumen de documentos largos: con 32.000 tokens de contexto, puede procesar informes, artículos o contratos extensos y generar resúmenes concisos, útil para aplicaciones de análisis documental.
- Atención al cliente automatizada: chatbot multi-turno que gestiona conversaciones con contexto amplio, desplegado en servidores con CPU Intel o GPUs modestas, con una latencia aceptable gracias a la aceleración por cuantización.
- Traducción y procesamiento multilingüe: aunque la model card de la versión cuantizada solo declara inglés, el modelo base soporta inglés, francés, español y portugués; podría emplearse para traducción automática o análisis de sentimiento multilingüe, aunque se recomienda validar el rendimiento tras la cuantización.
- Educación y tutoría virtual: responde preguntas de matemáticas, ciencias y programación, ofreciendo explicaciones paso a paso, adecuado para plataformas educativas de bajo coste.
- Generación de contenido creativo: redacción de artículos, guiones, correos electrónicos y publicaciones en redes sociales en inglés, con la ventaja de ejecutarse localmente.
- Análisis de datos y extracción de información: procesamiento de textos para extraer entidades, clasificar documentos o generar informes estructurados en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta versión cuantizada. El modelo base Falcon3-7B-Instruct reportó resultados de vanguardia en razonamiento, comprensión del lenguaje, seguimiento de instrucciones, código y matemáticas en el momento de su lanzamiento, pero no se proporcionan cifras concretas. El autor de la cuantización menciona una aceleración de 2-3 veces y una "ligera caída de precisión" en W4G64, sin cuantificar.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7B cuantizado a 4 bits, se estima un uso de 4-6 GB de VRAM para los pesos, dependiendo de la longitud de contexto y el tamaño de lote. El repositorio ocupa 6,8 GB en disco.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090, A100, H100; también GPUs con 8 GB de VRAM pueden ejecutarlo con contexto reducido.
- ¿Cabe en GPU de consumo? Sí, en GPUs con al menos 6-8 GB de VRAM, como RTX 3060, RTX 4060, RTX 2070, etc. También puede ejecutarse en CPU Intel, iGPU Arc y NPU AI Boost.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp, Ollama, Intel Extension for PyTorch, OpenVINO. El autor ha optimizado la cuantización para Intel CPU, iGPU y NPU.
- Latencia y throughput: no se proporcionan datos concretos. La cuantización promete una aceleración de 2-3 veces respecto a la versión sin cuantizar, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_awq-int4-gs64-sym | 7B (cuantizado 4-bit) | 32.000 tokens | Inglés (base: en, fr, es, pt) | Apache 2.0 | HuggingFace |
| tiiuae/Falcon3-7B-Instruct (base) | 7B | 32.000 tokens | Inglés, francés, español, portugués | Apache 2.0 | HuggingFace |
| fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int4-gs64-sym | 7B (cuantizado 4-bit GPTQ) | 32.000 tokens | Inglés (base: en, fr, es, pt) | Apache 2.0 | HuggingFace |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32.000 tokens | Inglés, francés, español, etc. | Apache 2.0 | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Inglés, alemán, francés, etc. | Llama 3.1 Community License | HuggingFace |

No se dispone de benchmarks comparativos para evaluar el rendimiento relativo de estos modelos; la comparación se basa únicamente en especificaciones.

## Limitaciones y advertencias

- Discrepancia en el número de parámetros: los safetensors reportan 1.753.635.840 parámetros, mientras que el modelo base es de 7B. Esto podría deberse a un error en los metadatos o a que el archivo contiene solo una parte de los pesos. Se recomienda verificar antes de usar en producción.
- La model card de la versión cuantizada solo declara el inglés, aunque el modelo base soporta cuatro idiomas. El rendimiento multilingüe después de la cuantización no está validado y podría ser inferior.
- La cuantización a 4 bits puede degradar ligeramente la precisión en tareas complejas de razonamiento, código o matemáticas. El autor indica una "ligera caída de precisión" en W4G64, aunque sin cuantificar.
- Riesgo de alucinación: inherente a los modelos de lenguaje; se recomienda validación humana en aplicaciones críticas.
- Sesgos: no se han documentado sesgos específicos para esta versión, pero el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el disclaimer del autor indica que el modelo ha sido desarrollado "solo para fines de investigación". Esta contradicción debe tenerse en cuenta; en la práctica, la licencia Apache 2.0 prevalece, pero el autor deslinda responsabilidad.
- El modelo está optimizado para hardware Intel, aunque puede ejecutarse en otras plataformas. El rendimiento puede variar.
- Las fechas de creación y actualización (2026) son futuras, lo que sugiere un posible error en los metadatos.
- No se proporcionan detalles sobre el entrenamiento del modelo base (composición del dataset, número de tokens, técnicas de alineación), lo que limita la evaluación de sesgos y capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_awq-int4-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Instruct
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Auto-round-pipeline: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Otras cuantizaciones del mismo autor:
  - GPTQ: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int4-gs64-sym
  - AutoRound INT4: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_round-int4-gs64-sym
  - AutoRound INT8: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-autoround-int8-gs128-sym
- Página del modelo base en Model Hub: https://dev.modelhub.org.cn/tiiuae/Falcon3-7B-Instruct
- Catálogo de Azure AI: https://ai.azure.com/catalog/models/tiiuae-falcon3-7b-instruct-1.58bit
