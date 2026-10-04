# mavis-ai/Qwen3.6-35B-MoE-Q3T

## Resumen

mavis-ai/Qwen3.6-35B-MoE-Q3T es una cuantización de terceros del checkpoint multimodal Qwen3.6-35B-A3B, publicada por mavis-ai el 4 de octubre de 2026. No es un ajuste fino: el autor indica que no se aplicó ningún tipo de entrenamiento ni se usó conjunto de calibración (receta data-free), y que todos los derechos sobre el modelo subyacente permanecen en sus autores originales. La revisión de origen citada es `995ad96eacd98c81ed38be0c5b274b04031597b0`.

El problema que resuelve es concreto: ejecutar un MoE multimodal de 35B parámetros totales y unos 3B activos en Apple silicon dentro de R.E.V.I.S., un sistema operativo cognitivo local para IA multiagente en Mac. Para ello comprime los expertos enrutados con codificación trellis de 3 bits (K3) y mantiene el resto de módulos en afin de 6 bits, dejando routers, normas y la torre de visión en BF16. El resultado pesa 15,15 GB decimales (14,1 GiB) y conserva la ventana de contexto de 262.144 tokens del modelo base.

Su relevancia es doble. Por un lado, demuestra una ruta de cuantización poco habitual en el ecosistema abierto, basada en códigos trellis en lugar de escalas afines por grupo. Por otro, es un artefacto de formato cerrado: los expertos se almacenan como tensores `.trellis`, `.suh` y `.svh` que requieren kernels de decodificación específicos, de modo que el modelo no arranca en mlx-lm, mlx-vlm, transformers ni vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal con atención híbrida (capas de atención lineal y de atención estándar); 40 capas, hidden size 2048, 256 expertos enrutados con 8 activos más un experto compartido (datos del modelo base) |
| Parametros totales | 35B en el modelo base Qwen3.6-35B-A3B; los metadatos safetensors de este repositorio declaran 9.013.368.176 (recuento de tensores almacenados, no equivalente a los 35B del base) |
| Parametros activos | Aproximadamente 3B (sufijo A3B del modelo base) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base; la model card no documenta cambios) |
| Tipos de cuantizacion | Q3T: K3 en expertos enrutados (trellis, 3 bits, codebook MCG, tiles 16x16, rotación Hadamard de 128 puntos, vectores de signo por canal) y N6 en densos (afín 6 bits, group size 64). KV cache en 8 bits en tiempo de ejecución. Drafters en 8 bits afín (g64). La familia incluye además Q5T (K5 + N8) y Q4T (K4 + N6) |
| Idiomas soportados | no disponible (la model card no lista idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; expertos enrutados en tensores trellis (`.trellis`, `.suh`, `.svh`) que exigen decodificación trellis. No hay GGUF |
| Tamano de pesos | 15,15 GB decimales (14,1 GiB); repo completo 16,7 GB |
| Drafters incluidos | MTP Draft-Q8 (0,91 GB) + ProposalHead (0,22 GB) + DFlash-Q8 (0,44 GB); 1,60 GB en total |
| Libreria declarada | trellis |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.6-35B-A3B: un transformer de 40 capas con hidden size 2048, mezcla de expertos de 256 expertos enrutados (8 activos por token) más un experto compartido, y atención híbrida, ya que la model card menciona explícitamente proyecciones de atención lineal y los parámetros `in_proj_a`/`in_proj_b` junto a las proyecciones de atención estándar. El pipeline declarado es image-text-to-text, e incluye una torre de visión que esta build mantiene íntegra en BF16. La model card no detalla la distribución de capas entre atención lineal y atención completa, ni el número de tokens de entrenamiento, ni si hubo RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La innovación de esta publicación está en la cuantización, no en el entrenamiento. El proceso es data-free: cada clase de módulo recibe una anchura fija por regla escrita, sin conjunto de calibración, sin redondeo tipo Hessian, sin matriz de importancia y sin entrenamiento consciente de cuantización. Los expertos enrutados se codifican como códigos trellis sobre tiles de 16x16 a 3 bits por peso, con rotación Hadamard de 128 puntos y vectores de signo por canal (`suh`, `svh`); la codificación minimiza el error cuadrático medio sobre los pesos rotados. Todo lo demás (proyecciones de atención y de atención lineal, experto compartido, embeddings y LM head) pasa a afín de 6 bits con group size 64 mediante `mx.quantize`. Se mantienen en BF16 el router (`mlp.gate`), `shared_expert_gate`, `in_proj_a`/`in_proj_b`, las normas y la torre de visión, porque la selección de expertos es una decisión top-k discontinua que no conviene cuantizar.

El paquete incluye decodificación especulativa: un drafter MTP en Q8 con su cabeza de propuesta y un drafter de bloques DFlash en Q8. Además, el archivo `q4t_manifest.json` registra la bandera `runtime_forward_verified: false`: la conversión verificó los pesos efectivos, no una pasada forward completa en el motor de inferencia.

## Capacidades

- Generación de texto conversacional en formato multimodal image-text-to-text, según el pipeline declarado del repositorio.
- Procesamiento de imágenes: el modelo conserva una torre de visión completa en BF16, por lo que hereda las capacidades visuales del Qwen3.6-35B-A3B.
- Contexto largo: la ventana de 262.144 tokens del modelo base permite trabajar con documentos extensos sin trocear.
- Razonamiento con cómputo disperso: al activar 8 de 256 expertos, el coste por token corresponde a un modelo de unos 3B parámetros activos.
- Decodificación especulativa integrada: los drafters MTP y DFlash-Q8 incluidos están pensados para acelerar la generación en el motor de R.E.V.I.S.
- Integración en flujos multiagente a través de R.E.V.I.S., el sistema para el que se empaqueta el modelo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso del propio modelo: no disponibles; la model card solo describe el entorno multiagente en el que se integra.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistente local multimodal en Mac: el modelo procesa imágenes y texto sin salir del equipo, lo que encaja en flujos donde no se permite enviar documentos a servicios en la nube. Requiere R.E.V.I.S. en una versión posterior a la v1.3.0.
- Análisis de documentación técnica extensa: con 262.144 tokens de contexto, se pueden pasar manuales, especificaciones o bases de código completas en una sola petición y consultar detalles sin recuperación previa.
- Agentes locales orquestados: R.E.V.I.S. está diseñado para IA multiagente, de modo que este modelo puede actuar como motor de razonamiento de un agente que delega subtareas a otros agentes en el mismo Mac.
- Revisión de capturas de interfaz y diagramas: la torre de visión en BF16 permite interpretar imágenes de pantallas, planos o gráficos y generar descripciones o extraer conclusiones textuales.
- Procesamiento de datos sensibles sujetos a confidencialidad: al ejecutarse en local sobre Apple silicon, la inferencia no requiere conectividad, lo que facilita el cumplimiento en entornos con datos personales o propiedad intelectual.
- Generación asistida de documentación interna: resúmenes, glosarios y notas de versión a partir de repositorios y documentos largos, con la ventana completa del modelo.
- Prototipado e investigación sobre cuantización trellis: el repositorio sirve como referencia para estudiar el impacto de K3 frente a K4 y K5 midiendo la divergencia KL respecto al modelo en BF16.
- Despliegue en puesto de trabajo individual con memoria unificada de 24 GB o superior: el tamaño de pesos (14,1 GiB) más los drafters (1,60 GB) y la caché KV permiten pensar en equipos de gama alta de Apple silicon, siempre que se acepte la dependencia del motor propietario.

## Benchmarks y rendimiento

La model card describe un experimento de divergencia KL frente al modelo en precisión completa, pero el extracto disponible está truncado y no incluye las cifras. No se reproducen valores numéricos porque no están disponibles.

| Aspecto | Detalle |
|---|---|
| Referencia | Qwen3.6-35B-A3B en BF16, sobre las mismas entradas |
| Metrica | Divergencia KL media (KLD) de la distribución next-token, vocabulario completo; menor es mejor |
| Corpus | 48 documentos; 17.877 posiciones evaluadas en tres estratos: WikiText-2, documentos técnicos y respuestas del propio modelo |
| Cache KV durante la medida | Emulada a 8 bits |
| Entorno de medida | Arneses de investigación en GPU que decodifican exactamente los códigos de pesos de esta familia, no el motor de R.E.V.I.S. |
| Valores de KLD | no disponibles en el extracto de la model card |
| Top-1 | la model card comienza a reportarlo, pero el texto está cortado |
| Velocidad | no reportada por el autor |
| Comparación con cuantización afín estándar | pendiente de una remedición con builds estándar, según el autor |
| Benchmarks clásicos (MMLU, HumanEval, GSM8K) | no disponibles |

## Requisitos de hardware

- Espacio en disco: 16,7 GB para el repositorio completo; 15,15 GB decimales (14,1 GiB) de pesos, más 1,60 GB de drafters.
- Memoria unificada: un Mac con 24 GB o más es el escenario razonable para pesos, drafters y caché KV en 8 bits; la model card no especifica un mínimo. Estimación derivada del tamaño de los pesos, no un dato publicado.
- Plataforma: Apple silicon exclusivamente. El modelo está empaquetado para R.E.V.I.S., y el soporte de esta build Q3T llega en una versión posterior a la v1.3.0.
- GPU dedicadas: no aplica. No hay soporte CUDA porque el modelo no funciona en vLLM, transformers, mlx-lm ni mlx-vlm; requiere los kernels de decodificación trellis del motor de R.E.V.I.S.
- VRAM estimada en GPU: no disponible, al no existir ruta de despliegue con GPU en la información proporcionada.
- Opciones de despliegue: únicamente R.E.V.I.S. (versión posterior a la v1.3.0). Ollama, llama.cpp, TGI, vLLM y mlx-lm no son compatibles.
- Latencia y throughput: no reportados. El autor indica explícitamente que no se reporta velocidad. Los drafters MTP y DFlash-Q8 están incluidos para acelerar la decodificación mediante especulación.
- Aceleración: decodificación especulativa con drafter MTP (0,91 GB) más su cabeza de propuesta (0,22 GB), y drafter de bloques DFlash (0,44 GB).

## Comparativa con modelos similares

La comparación más directa es con las otras variantes de la familia T del mismo autor y con el checkpoint base en BF16.

| Modelo | Expertos enrutados | Denso | Tamano de pesos | Entorno de ejecucion | Licencia |
|---|---|---|---|---|---|
| mavis-ai/Qwen3.6-35B-MoE-Q3T | K3 trellis | N6 afin g64 | 15,15 GB (14,1 GiB) | R.E.V.I.S., version posterior a la v1.3.0 | Apache 2.0 |
| Familia Q4T (mismo autor) | K4 | N6 afin g64 | no disponible | no disponible | Apache 2.0 |
| Familia Q5T (mismo autor) | K5 | N8 afin g64 | no disponible | no disponible | Apache 2.0 |
| Qwen/Qwen3.6-35B-A3B (base) | sin cuantizar | BF16 | no disponible | transformers, vLLM y otros motores estandar | Apache 2.0 |

Todas las variantes comparten la misma arquitectura y ventana de contexto de 262.144 tokens. La diferencia entre Q3T, Q4T y Q5T es la tasa K del trellis y la anchura N de los módulos densos, lo que se traduce en distinto tamaño y distinta fidelidad respecto a BF16. La información disponible no incluye cifras de KLD por variante, por lo que no es posible ordenarlas cuantitativamente.

## Limitaciones y advertencias

- Compatibilidad restringida: no se ejecuta en mlx-lm, mlx-vlm, transformers ni vLLM. Los expertos enrutados usan tensores trellis que necesitan un cálculo de decodificación específico.
- Dependencia de un motor propietario: el único runtime soportado es R.E.V.I.S., en una versión posterior a la v1.3.0. Esto limita la portabilidad y ata el modelo a Mac con Apple silicon.
- Verificación incompleta: el manifiesto del conversor marca `runtime_forward_verified: false`; la conversión verificó los pesos efectivos, no una pasada forward del motor.
- Cuantización sin calibración: al ser data-free, no hay garantía de que la degradación se distribuya de forma uniforme entre dominios. La model card no publica los valores de KLD en el extracto disponible.
- Caída de precisión esperable: los expertos enrutados se almacenan a 3 bits por peso, la tasa más agresiva de la familia T; es previsible una pérdida mayor que en Q4T y Q5T.
- Riesgo de alucinación: no se documenta en la model card ningún proceso de alineamiento, RLHF o DPO asociado a esta build; al ser una derivada directa sin entrenamiento, hereda el comportamiento del modelo base.
- Idiomas: la model card no declara idiomas soportados, por lo que no hay garantía documentada de cobertura multilingüe en esta build.
- Sesgos: no disponible. No se publica ningún análisis de sesgos en la información proporcionada.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, por lo que no hay validación de terceros ni reportes de uso en producción.
- Licencia: el código y los pesos se redistribuyen bajo Apache 2.0, pero mavis-ai declara no tener la titularidad del modelo subyacente; conviene revisar la licencia del checkpoint Qwen original antes de un uso comercial.
- Referencia a un paper no descrito: los tags incluyen `arxiv:2602.06036`, pero la información disponible no explica su contenido ni su relación con esta build.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mavis-ai/Qwen3.6-35B-MoE-Q3T
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- R.E.V.I.S. (sitio oficial): https://mavis-ai.co.jp/revis/
- Cuenta de X del autor: https://x.com/mavis_ai_jp
- Referencia arXiv listada en los tags del repositorio: https://arxiv.org/abs/2602.06036
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; los resultados devueltos corresponden a empresas y personajes homónimos sin relación con el proyecto.
