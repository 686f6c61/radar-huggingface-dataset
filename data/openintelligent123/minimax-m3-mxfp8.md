# Openintelligent123/MiniMax-M3-MXFP8

## Resumen

MiniMax-M3-MXFP8 es la versión cuantizada en MXFP8 de MiniMax-M3, un modelo multimodal nativo desarrollado por MiniMax. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con aproximadamente 428 mil millones de parámetros totales y 23 mil millones activos por token, lo que permite un rendimiento elevado con un coste computacional reducido. Está diseñado para procesar texto, imagen y vídeo de forma conjunta desde el primer paso de entrenamiento, y destaca por su ventana de contexto de 1 millón de tokens gracias a la atención dispersa MiniMax Sparse Attention (MSA).

Esta variante MXFP8 reduce el espacio de almacenamiento del modelo mediante cuantización de 8 bits, manteniendo la arquitectura y las capacidades del modelo original. El repositorio está publicado por Openintelligent123 y está pensado para ser desplegado en frameworks como SGLang, vLLM o Transformers, con soporte para razonamiento adaptativo y tareas de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con atención dispersa MiniMax Sparse Attention (MSA) |
| Parametros totales | 427.040.140.160 (~428B) |
| Parametros activos | ~23B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | MXFP8 |
| Idiomas soportados | no disponible |
| Licencia | minimax-community |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiniMax-M3-MXFP8 conserva la arquitectura del modelo base MiniMax-M3, un modelo multimodal nativo con arquitectura MoE. El entrenamiento se realizó de forma mixta desde el primer paso, combinando texto, imagen y vídeo para lograr una fusión semántica más profunda entre modalidades. La innovación técnica más destacada es MiniMax Sparse Attention (MSA), un operador de atención dispersa diseñado para contextos de un millón de tokens. Según el README, MSA ofrece una aceleración de 9x en prefill y 15x en decodificación en comparación con la generación anterior (M2) a 1M de contexto, reduciendo el coste computacional por token a 1/20.

No se especifican datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento: soporta tres modos de razonamiento configurables mediante el parámetro `thinking`: `enabled` (razonamiento siempre activo), `adaptive` (el modelo decide cuándo razonar) y `disabled` (mínima latencia y máximo throughput).
- Comprensión multimodal nativa: procesa simultáneamente texto, imágenes y vídeo, sin necesidad de módulos separados.
- Codificación y cowork: alcanza un rendimiento de nivel frontera en benchmarks de agentes de largo horizonte, tanto en tareas de programación como en colaboración asistida.
- Soporte para agentes: optimizado para razonamiento multi-paso y uso como agente, con integración en MiniMax Agent y en la API de MiniMax.
- Análisis de vídeo: entrada de vídeo procesada junto con texto, permitiendo describir y razonar sobre contenido dinámico.
- Contexto largo: ventana de 1M tokens, adecuada para documentos extensos, repositorios de código completos o transcripciones largas.

## Casos de uso

- Análisis de vídeos de vigilancia: al admitir vídeo e imágenes junto con texto, el modelo puede resumir grabaciones largas y responder preguntas sobre eventos específicos dentro de una ventana de 1M tokens.
- Asistente de desarrollo en repositorios extensos: la ventana de contexto de 1M tokens permite cargar módulos, documentación y código de un proyecto completo, mientras que la capacidad de codificación facilita refactorizaciones o generación de tests.
- Agente de investigación autónoma: con soporte para razonamiento multi-paso y modo adaptativo, el modelo puede planificar y ejecutar tareas de búsqueda, lectura de documentos y síntesis de resultados.
- Sistema de atención al cliente multimodal: el modelo puede interpretar capturas de pantalla, imágenes de productos y conversaciones escritas, ofreciendo respuestas contextualizadas en un mismo hilo.
- Análisis forense de documentos: para procesar informes extensos con gráficos y tablas, combinando visión y texto en una sola pasada.
- Moderación de contenido en plataformas de vídeo: el modelo puede evaluar clips de vídeo y transcripciones para detectar contenido problemático, aprovechando su entrenamiento multimodal nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. El peso cuantizado MXFP8 ocupa aproximadamente 428 GB (un byte por parámetro). Con la ventana de contexto de 1M, el almacenamiento de claves y valores en la atención dispersa también consume una cantidad significativa de memoria, por lo que se requiere un clúster de GPU.
- GPU recomendadas: H100/A100 de 80 GB o superiores; se necesitan múltiples unidades (por ejemplo, 6-8) para alojar el modelo.
- No cabe en GPU de consumo: el tamaño del modelo supera con creces la memoria de una RTX 4090 (24 GB) o incluso de una RTX 6000 Ada (48 GB).
- Opciones de despliegue: SGLang, vLLM y Transformers, según el README.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La única referencia es el modelo base MiniMax-M3, del cual esta variante es una cuantización MXFP8. No se dispone de datos comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia no estándar (minimax-community): no es una licencia OSI, puede contener restricciones para uso comercial. Revisar el archivo LICENSE.
- No se han documentado sesgos, riesgos de alucinación ni limitaciones de idioma en la información proporcionada.
- El tamaño del modelo (~428B parámetros) exige infraestructura de servidores de gama alta; no es viable en hardware de consumo.
- La cuantización MXFP8 puede introducir una pérdida de precisión respecto al modelo original en tareas sensibles, aunque no se ofrecen métricas comparativas.
- El contexto de 1M tokens implica un consumo de memoria considerable, lo que puede afectar a la latencia y al coste operativo.

## Enlaces

- https://huggingface.co/Openintelligent123/MiniMax-M3-MXFP8
- https://huggingface.co/MiniMaxAI/MiniMax-M3-MXFP8
- https://github.com/MiniMax-AI/MiniMax-M3
- https://arxiv.org/abs/2606.13392
- https://huggingface.co/papers/2606.13392
- https://docs.sglang.io/
- https://github.com/vllm-project/vllm
- https://huggingface.co/docs/transformers/model_doc/minimax_m3_vl
