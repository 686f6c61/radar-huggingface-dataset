# romainkh14/Qwen3-4B_BRIK

## Resumen

El modelo **Qwen3-4B_BRIK** es una conversión del LLM Qwen3-4B de Alibaba al formato **BRIK**, un contenedor auto-descriptivo diseñado para ejecutar modelos de lenguaje directamente en el navegador mediante **WebGPU**. Lo publica Romain Khanoyan (romainkh14) como parte del catálogo de **Brimkern**, un motor de inferencia con kernels WGSL escritos a mano. Su propósito es eliminar la necesidad de un servidor de inferencia o una API externa: todo el procesamiento ocurre en la GPU del visitante, lo que permite aplicaciones de IA privadas y descentralizadas.

El modelo conserva la arquitectura del Qwen3-4B original (familia llama con QK-norm, 36 capas, dimensión de modelo 2560 y vocabulario de 151 936 tokens) y se distribuye en un único archivo `.brik` de 2,53 GB con pesos cuantizados a **int4** (grupo de 32). El tokenizer viaja embebido en el archivo, y cada capa se almacena como un rango HTTP contiguo, lo que facilita la descarga progresiva y la reanudación de transferencias. La relevancia actual radica en la tendencia hacia la IA en el cliente, con aplicaciones que requieren privacidad, baja latencia y cero costes de infraestructura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia llama con QK-norm), 36 capas, d=2560, vocab 151 936 |
| Parametros totales | 4 000 millones (modelo base Qwen3-4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen3-4B admite hasta 131 072 tokens con YaRN (32k por defecto) |
| Tipos de cuantizacion | int4, grupo de 32, pre-cuantizado en el layout de los kernels (sin de-cuantizacion en carga) |
| Idiomas soportados | Ingles y frances (segun model card) |
| Licencia | Apache-2.0 (pesos); motor Brimkern bajo MIT |
| Formato de pesos | `.brik` (contenedor propio, auto-descriptivo, con tokenizer embebido) |

## Arquitectura y entrenamiento

El modelo es una conversión del **Qwen3-4B** de Alibaba, un transformer denso de la familia llama con normalización QK (QK-norm) y 36 capas. No se ha realizado un entrenamiento adicional; el proceso de conversión consiste en cuantizar los pesos originales a **int4** con agrupación de 32 canales y empaquetarlos en el formato BRIK. Este formato incluye la arquitectura, el tokenizer y la configuración dentro del propio archivo, y los pesos se almacenan ya cuantizados en el orden exacto que leen los kernels WGSL del motor Brimkern, evitando cualquier paso de de-cuantizacion durante la carga.

El modelo base Qwen3-4B fue entrenado por Alibaba con un enfoque de aprendizaje por refuerzo con retroalimentación humana (RLHF) y soporta modos de razonamiento (thinking) y no razonamiento, aunque la model card de esta conversión no detalla estos aspectos. La innovación técnica principal de BRIK reside en el contenedor: cada capa es un rango HTTP contiguo, lo que permite la descarga incremental y la reanudación de transferencias, y el motor utiliza kernels WGSL optimizados para WebGPU que alcanzan entre el 79 % y el 92 % del ancho de banda de memoria de la GPU en modelos pequeños, según los datos publicados por el autor.

## Capacidades

- Generación de texto, razonamiento, codificación y matemáticas, heredadas del modelo base Qwen3-4B.
- Ejecución completamente en el navegador mediante WebGPU, sin servidor de inferencia ni API key.
- Inferencia local en el dispositivo del usuario, lo que garantiza privacidad de los datos.
- Soporte de descarga progresiva y reutilización offline del archivo `.brik` tras la primera carga.
- Tokenizer embebido en el archivo, sin descargas adicionales.
- No se especifican en la model card capacidades adicionales como tool calling, agentes o modo thinking, aunque el modelo base las posee.

## Casos de uso

- **Demostraciones interactivas en el navegador**: ideal para prototipos y demos técnicas donde se quiere mostrar un LLM funcionando sin backend. Un desarrollador puede integrar el modelo en una página web estática y los visitantes interactúan con él directamente en su GPU.
- **Asistente de chat privado en el cliente**: aplicaciones de consulta de documentos o conversación personal donde los datos no deben salir del dispositivo. El modelo procesa todo localmente, eliminando riesgos de fuga de información.
- **Generación de código en una IDE web**: al ejecutarse en el navegador, puede integrarse en editores de código online para ofrecer autocompletado o generación de fragmentos sin enviar el código a servidores externos.
- **Herramientas educativas de IA**: permitir a estudiantes experimentar con un modelo de 4B en sus propios portátiles, sin necesidad de configurar entornos de servidor o gestionar dependencias.
- **Juegos narrativos o generación de historias**: aplicaciones de ficción interactiva que requieren generación de texto con baja latencia y sin conexión, aprovechando la capacidad del modelo para mantener coherencia en diálogos multi-turno.
- **Análisis de texto en local**: resumir, clasificar o extraer información de documentos en aplicaciones de ofimática web, manteniendo los datos confidenciales dentro del navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se ha medido el throughput para el modelo de 4B; los únicos datos medidos corresponden a modelos más pequeños (LFM2.5-230M y Qwen2.5-0.5B), donde el motor alcanza entre el 79 % y el 92 % del ancho de banda de memoria de la GPU. No se proporcionan cifras de calidad (MMLU, HumanEval, GSM8K, etc.) para esta conversión específica.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 2,53 GB para los pesos cuantizados, más overhead de ejecución (buffers, activaciones), lo que sitúa el requisito total en torno a 3-4 GB.
- **GPU compatible**: cualquier GPU moderna con soporte WebGPU (NVIDIA, AMD, Intel integrada). En GPUs de portátil, la carga inicial puede tardar varios minutos.
- **Memoria del sistema**: no se especifica, pero se recomienda al menos 8 GB de RAM para el navegador y el sistema operativo.
- **Opciones de despliegue**: exclusivamente navegador con WebGPU; no es compatible con vLLM, llama.cpp, Ollama ni TGI. El motor Brimkern se ejecuta dentro de la página web.
- **Latencia y throughput**: no publicados para este modelo. La decodificación está limitada por el ancho de banda de memoria de la GPU, por lo que el rendimiento escala casi linealmente con la velocidad de la memoria.

## Comparativa con modelos similares

La comparación directa con otros modelos BRIK de 4B no es posible, ya que el catálogo de Brimkern incluye modelos más pequeños (LFM2.5-230M, Qwen2.5-0.5B). Frente al modelo base Qwen3-4B, la diferencia principal es el formato y la cuantización:

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3-4B (original) | 4B | 131 072 (YaRN) | BF16/FP16 | safetensors | Apache-2.0 |
| Qwen3-4B_BRIK | 4B | No especificado (base: 131 072) | int4 (grupo 32) | .brik | Apache-2.0 |
| LFM2.5-230M_BRIK | 230M | No disponible | int4 | .brik | No disponible |

La conversión BRIK sacrifica precisión (int4 frente a BF16) y flexibilidad de despliegue (solo navegador) a cambio de una ejecución sin servidor y con privacidad total. Otros modelos similares en tamaño (Llama-3.2-3B, Gemma-3-4B) no están disponibles en formato BRIK en el momento de la publicación.

## Limitaciones y advertencias

- **Idiomas limitados**: la model card declara solo inglés y francés, aunque el modelo base Qwen3-4B soporta más idiomas. El uso en otros idiomas puede degradar el rendimiento.
- **Cuantización int4**: la pérdida de precisión puede afectar a tareas de razonamiento complejo o generación de código, comparado con el modelo en BF16.
- **Requisitos de hardware**: requiere una GPU con WebGPU y suficiente VRAM (≥3-4 GB). En equipos sin GPU dedicada o con GPUs antiguas, el modelo no cargará o será muy lento.
- **Sesgos y alucinaciones**: como cualquier LLM, puede generar contenido falso o sesgado, heredado del entrenamiento del modelo base. No se han realizado evaluaciones específicas de sesgo para esta conversión.
- **Contexto no verificado**: la longitud de contexto real en la implementación BRIK no está documentada; el valor de 131 072 tokens proviene del modelo base y podría no aplicarse en el navegador debido a limitaciones de memoria.
- **Sin benchmarks de calidad**: la ausencia de métricas publicadas impide validar el rendimiento real de esta conversión frente al modelo original.
- **Restricciones de uso**: aunque la licencia Apache-2.0 permite uso comercial, el motor Brimkern es MIT, pero el formato BRIK y su especificación están vinculados al proyecto; conviene revisar la documentación del repositorio para conocer posibles limitaciones de redistribución.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/romainkh14/Qwen3-4B_BRIK)
- [Sitio web de Brimkern](https://brimkern.com)
- [Demo en el chat de Brimkern](https://brimkern.com/chat?model=romainkh14/Qwen3-4B_BRIK)
- [Repositorio de Brimkern en GitHub](https://github.com/RomainKH/Brimkern)
- [Especificación del formato BRIK](https://github.com/RomainKH/Brimkern/blob/main/BRIK_FORMAT.md)
- [Modelo base Qwen3-4B en Hugging Face](https://huggingface.co/Qwen/Qwen3-4B)
- [Perfil del autor en Hugging Face](https://huggingface.co/romainkh14)
