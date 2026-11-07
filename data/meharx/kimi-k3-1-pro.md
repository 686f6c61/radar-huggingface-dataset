# meharx/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje de pesos abiertos desarrollado por Moonshot AI, presentado como el primer miembro de la serie K3.1 y el modelo mas capaz de la familia de clase 3T de la compania hasta la fecha. Se construye mediante post-entrenamiento sobre Kimi K3, aplicando aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream, y se posiciona como un modelo agentico nativamente multimodal, capaz de procesar texto e imagenes en una unica arquitectura.

Tecnicamente se trata de un transformer de tipo Mixture-of-Experts (MoE) con 2,8 billones de parametros totales y 104.000 millones de parametros activos por token, distribuidos en 93 capas. La innovacion arquitectonica principal es la combinacion de dos mecanismos de atencion: 69 capas con KDA (Kimi Delta Attention) y 24 capas con Gated DSA (Deep Sparse Attention, con atencion dispersa indexada de top-k 2048), lo que permite sostener una ventana de contexto de hasta 1 millon de tokens.

El modelo es relevante porque combina una ventana de contexto extrema con capacidades agenticas y multimodales, ademas de mejoras declaradas en generacion de codigo, creacion 3D, investigacion financiera y precision factual. Su publicacion en Hugging Face con pesos en safetensors y formato comprimido lo hace desplegable en infraestructura propia, aunque su escala de 2,8T de parametros lo situa fuera del alcance de hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida KDA + Gated DSA |
| Parametros totales | 2.780.110.363.392 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (compressed-tensors) disponible en el repo; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (licencia propia, marcada como "other") |
| Formato de pesos | safetensors, compressed-tensors (8-bit) |
| Capas | 93 (1 capa densa) |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Composicion de atencion | 69 capas KDA + 24 capas Gated DSA |
| Dimension de indice DSA | 128 (32 cabezas, top-k 2048) |
| Dimension latente MoE | 3584 |
| Dimension oculta por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Expertos compartidos | 2 |
| Vocabulario | 160K |
| Tamano del repo | 1561,4 GB |

## Arquitectura y entrenamiento

Kimi K3.1 Pro es un transformer MoE de 93 capas con una unica capa densa. El bloque de atencion es hibrido: 69 capas emplean KDA (Kimi Delta Attention) y 24 capas usan Gated DSA, un mecanismo de atencion dispersa con indices de top-k 2048 sobre 32 cabezas de dimension 128. Esta combinacion busca reducir el coste computacional de la atencion a contextos muy largos sin sacrificar recall, y es lo que habilita la ventana de 1 millon de tokens. La capa MoE opera en un espacio latente de 3584 dimensiones, con 896 expertos de 3072 dimensiones ocultas cada uno, seleccionando 16 expertos por token mas 2 expertos compartidos.

El entrenamiento parte de Kimi K3 y aplica post-entrenamiento mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream. La model card no detalla el numero de tokens de preentrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas adicionales como DPO. El modelo esta publicado en formato compressed-tensors de 8 bits, lo que reduce el peso del repositorio pero no elimina los requisitos de memoria de un modelo de esta escala.

## Capacidades

- Generacion de texto y razonamiento multi-turno con contexto de hasta 1 millon de tokens.
- Capacidades de codigo mejoradas respecto a Kimi K3, segun el autor.
- Creacion 3D: generacion y manipulacion de contenido tridimensional descrita en la model card.
- Investigacion financiera: analisis de documentos y datos financieros de gran extension.
- Precision factual reforzada mediante el post-entrenamiento con RL sobre dominios downstream.
- Modalidad nativa image-text-to-text: procesa imagenes junto con texto en la misma arquitectura.
- Capacidades agenticas: ejecucion de tareas complejas de multiples pasos y uso de herramientas, segun la model card.
- Soporte de tool calling / function calling: no detallado explicitamente en la informacion disponible, aunque las capacidades agenticas lo implican.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con 1M de tokens de contexto, el modelo puede ingerir una base de codigo entera y responder preguntas de arquitectura, dependencias o refactorizaciones sin trocear el codigo en fragmentos.
- Generacion y revision de codigo en produccion: su mejora declarada en coding y su naturaleza agentica permiten integrarlo en pipelines de revision automatizada, generacion de tests y correccion de errores dentro de flujos de CI/CD.
- Investigacion financiera sobre documentacion extensa: analisis de informes anuales, prospectos y transcripciones de resultados combinando decenas de documentos en una sola ventana de contexto.
- Creacion 3D asistida: generacion de descripciones estructuradas, scripts de modelado o especificaciones de escenas 3D a partir de instrucciones en lenguaje natural e imagenes de referencia.
- Agentes autonomos de larga duracion: tareas que requieren mantener estado durante muchas iteraciones (navegacion web, operacion de herramientas, planificacion) gracias a la ventana de contexto y al entrenamiento agentico.
- Analisis de documentos con imagenes: pipelines que combinan capturas, diagramas o tablas escaneadas con texto largo, aprovechando la modalidad image-text-to-text.
- Asistentes de investigacion tecnica: sintesis de literatura cientifica o documentacion interna de gran volumen con trazabilidad sobre el contexto original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 2,8T de parametros, incluso en 8 bits el modelo requiere del orden de 2,8 TB de memoria agregada; en BF16 superaria los 5,5 TB. No cabe en ninguna GPU individual.
- GPU recomendadas: despliegue multi-nodo con aceleradores de centro de datos (H100, H200, B200 o equivalentes) y agregacion de memoria distribuida; no disponible el numero exacto de nodos recomendado.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 5090, etc.) ni en configuraciones multi-GPU de consumo.
- Opciones de despliegue: transformers con soporte de codigo personalizado (custom_code) y compressed-tensors para los pesos de 8 bits; el soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. Con 104B de parametros activos, el coste por token es comparable al de un modelo denso de esa escala, pero el ancho de banda de memoria para cargar expertos condiciona fuertemente el rendimiento en inferencia distribuida.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8T | 104B | 1M | kimi-k3.1-pro (propia) | Pesos abiertos en Hugging Face |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva K3.1 Pro |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Escala prohibitiva: 2,8T de parametros hacen inviable el despliegue fuera de infraestructura de centro de datos multi-nodo.
- Licencia propia "kimi-k3.1-pro": es necesario revisar los terminos completos antes de cualquier uso comercial; la model card la marca como "other", no como licencia open source estandar.
- Idiomas soportados no documentados: no hay informacion sobre calidad en castellano ni en otras lenguas distintas del ingles o el chino.
- Riesgo de alucinacion: no se han publicado tasas de error ni evaluaciones de fidelidad, pese a que el autor declara mejoras en precision factual.
- Contexto de 1M de tokens: aunque soportado, el rendimiento efectivo en ventanas extremas puede degradarse y el coste de atencion sigue siendo elevado.
- Capacidades multimodales y agenticas declaradas por el autor sin benchmarks publicos que las respalden en la informacion disponible.
- Repositorio de 1561 GB: el almacenamiento y la transferencia de los pesos suponen un coste logistico considerable.
- Modelo con 0 descargas y 1 like en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Hugging Face (copia del autor de la ficha): https://huggingface.co/meharx/Kimi-K3.1-Pro
- Hugging Face (organizacion oficial): https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Sitio oficial de Kimi: https://www.kimi.ai/en
- Blog tecnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Homepage de Moonshot AI: https://www.moonshot.ai
- Organizacion en Hugging Face: https://huggingface.co/moonshotai
- ModelScope: https://modelscope.cn/organization/moonshotai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
