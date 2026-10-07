# DJLougen/d1-3B-MLX-8bit

## Resumen

d1-3B-MLX-8bit es una conversión a formato MLX de 8 bits del modelo LiquidAI/d1-3B, publicada por el usuario DJLougen. El modelo original es un "decision model" de tipo System One con 3.123.483.888 parámetros, afinado a partir de LiquidAI/LFM2.5-VL-3B. Su particularidad es que no genera texto: recibe preguntas con nombre sobre un estado (texto plano, JSON o imagen) y devuelve respuestas tipadas y calibradas en una única pasada forward, leyendo directamente los logits en la posición de respuesta.

Esta conversión concreta existe porque el checkpoint original se distribuye en formato transformers para PyTorch, y los usuarios de Apple Silicon necesitaban una ruta nativa en MLX. El resultado ocupa 3,72 GB frente a los 6,25 GB de los pesos BF16, manteniendo la torre de visión, el proyector multimodal y todas las layer norms en BF16. Solo se cuantizan los pesos del modelo de lenguaje mediante RTN affine (8 bits, group size 64).

La relevancia actual viene de su nicho: es un modelo de decisión, no de chat, pensado para ejecutarse en el borde (edge) con latencia de decenas de milisegundos y sin posibilidad de violar un esquema de salida, porque no decodifica ni un token. Según la model card, el modelo upstream obtiene 48,57 en el Decision Index 0.2.1 y 74,1 en 11 benchmarks públicos de imagen, con soporte de 16 idiomas y 32.768 tokens de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia LFM2-VL / LFM2.5-VL, con codificador de vision SigLIP2 NaFlex y pesos en layout MLX |
| Parametros totales | 3.123.483.888 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 8 bits RTN affine con group size 64 (9,52 bits por peso de media); en la familia existen tambien variantes BF16 y 4-bit |
| Idiomas soportados | 16: arabe, chino, ingles, frances, alemán, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, español, tailandes y vietnamita |
| Licencia | LFM Open License v1.0 (lfm1.0, declarada como license:other) |
| Formato de pesos | safetensors con layout MLX (model.safetensors, 3.718.720.809 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de LFM2.5-VL-3B, un modelo multimodal de tipo transformer con codificador de vision SigLIP2 NaFlex. Sobre esa base, LiquidAI afinó el checkpoint d1-3B como modelo de decisión: en lugar de decodificar tokens, el modelo recibe un estado y una pregunta estructurada y produce la respuesta leyendo los logits en la ranura de respuesta. Se soportan tres tipos de pregunta: `noul` (sí/no, devuelve P(sí)), `choice` (opciones nombradas, devuelve elección y probabilidades) y `score` (niveles ordenados, devuelve nivel esperado, probabilidades y leyenda).

La conversión a MLX es una operación de formato y cuantización, no un reentrenamiento. Según la model card del autor, los 707 tensores de origen se mapean al layout MLX con remapeo de claves y 22 transposiciones de pesos de convolución, todas las formas coinciden y cada tensor BF16 resultante es bit-exacto (diferencia máxima 0). Funcionalmente, las mismas tres preguntas sobre el mismo estado, resueltas con el runner transformers original (MPS, BF16) y con la conversión MLX BF16, difieren como máximo en 0,0044 de probabilidad por opción, con idéntico argmax en todos los casos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Decisión tipada en una sola pasada forward: tipos `noul`, `choice` y `score`, con salida de probabilidades calibradas por opción.
- Entrada de estado multimodal: texto plano, JSON o imágenes (hasta 1024x1024 píxeles, igual que el modelo upstream).
- Cero tokens generados por decisión, lo que hace imposible una violación de esquema en la salida estructurada.
- Comprensión de imagen y texto (pipeline image-text-to-text) mediante el codificador SigLIP2 NaFlex.
- Cobertura multilingüe en 16 idiomas, incluyendo español.
- Generación de texto con el backbone mediante mlx-vlm, aunque no es el propósito del modelo.
- Ejecución local en Apple Silicon mediante MLX y mlx-vlm.
- No se menciona soporte explícito de tool calling ni de function calling en la información disponible.
- No se menciona un modo de razonamiento extendido (thinking mode) en la información disponible.
- No se mencionan capacidades de audio en la información disponible.

## Casos de uso

- Enrutado y triaje de tickets de soporte: con una pregunta `choice` sobre el texto del ticket, el modelo devuelve la categoría asignada y su probabilidad en unos 52 ms, lo que permite clasificar en tiempo real sin coste de decodificación.
- Aprobación automática de reembolsos: con una pregunta `noul` sobre el estado de la solicitud, el modelo responde P(sí); la model card cita un ejemplo de smoke test con 0,9841 de probabilidad, lo que permite fijar umbrales de auto-aprobación y derivar el resto a revisión humana.
- Moderación de contenido con umbral calibrado: al devolver probabilidades en lugar de texto libre, es posible definir políticas de escalado graduales en función de la confianza de la decisión.
- Verificación de documentos con imagen: al aceptar entradas de imagen de hasta 1024x1024, puede clasificar capturas, formularios o tickets escaneados junto con texto asociado en un único pipeline image-text-to-text.
- Puntuación de riesgo o calidad con niveles ordenados: el tipo `score` devuelve el nivel esperado, las probabilidades por nivel y su leyenda, lo que resulta útil para priorización de colas o scoring de leads.
- Puerta de decisión previa a un LLM mayor: al ser un modelo de 3B con 3,72 GB de memoria activa, puede actuar como router que decide si una consulta necesita un modelo grande o puede resolverse con una respuesta predefinida.
- Validación de estados JSON en pipelines de datos: el modelo acepta el propio JSON como estado, de modo que puede comprobar condiciones de esquema o de negocio sin parsear la salida de un generador.
- Clasificación multilingüe en el borde: al soportar 16 idiomas y ejecutarse en memoria unificada de Apple Silicon, cubre escenarios de despliegue local sin enviar datos a la nube.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo upstream (no verificados por el autor de esta conversión), según la model card:

| Benchmark | Resultado |
|---|---|
| Decision Index 0.2.1 | 48,57 (mejor modelo de decisión por debajo de 10B, según el upstream) |
| 11 benchmarks publicos de imagen | 74,1 |

Mediciones locales de esta conversion en 8 bits, realizadas por el autor de la conversión en un Apple M3 Max con 36 GB de memoria unificada, Python 3.12, mlx 0.32.3, mlx-vlm 0.7.6, transformers 5.19.0 y macOS, en modo greedy y con ejecuciones en caliente:

| Metrica | Valor |
|---|---|
| Latencia de decision (mediana, n=10) | 52,0 ms (rango 51,3-53,6) |
| Tokens de decodificacion por segundo (prompt de imagen de 246 tokens) | 79,0 |
| Tokens de prefill por segundo | 746 |
| TTFT | 0,349 s |
| Memoria activa | 3,72 GB |

La model card indica que la latencia de decisión no mejora apenas con la cuantización a este tamaño, porque está dominada por el prefill. En cambio, la decodificación escala con la cuantización: 79,0 tokens/s en 8 bits frente a 50,4 en BF16 y 134,0 en 4 bits. Estos datos son mediciones locales, no un benchmark de proveedor.

## Requisitos de hardware

- Memoria activa en inferencia: 3,72 GB para esta variante de 8 bits; 6,25 GB para los pesos BF16 equivalentes.
- Plataforma: MLX es una librería para Apple Silicon, por lo que el modelo requiere un Mac con chip de la familia M. No hay ruta de despliegue en GPU NVIDIA documentada en la información disponible.
- Hardware de referencia probado: Apple M3 Max con 36 GB de memoria unificada.
- Cabe en equipos de consumo: cualquier Mac Apple Silicon con memoria unificada suficiente para alojar 3,72 GB de pesos más el contexto y las activaciones; no se especifica el mínimo exacto.
- Opciones de despliegue: mlx 0.32.3 o superior y mlx-vlm 0.7.6 o superior. Cada repositorio incluye `system_one.py`, un port fiel del runner System One original, con soporte de CLI y de API en Python. También se puede usar `python -m mlx_vlm.generate` para generación de texto plano.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible, dado que el modelo usa MLX y código personalizado.
- Latencia y throughput medidos: 52,0 ms por decisión sobre estados de texto cortos, 0,349 s de TTFT y 79,0 tokens/s de decodificación con un prompt de imagen de 246 tokens. No hay mediciones de decisión con contexto largo.
- Nota de coste computacional: se realiza una pasada forward por pregunta; el autor indica que el upstream empaqueta varias preguntas de un mismo estado en un tronco compartido sin padding, y que ese batching no está portado.

## Comparativa con modelos similares

Comparativa con las variantes de la misma familia sobre las que hay datos en la información proporcionada:

| Modelo | Parametros | Contexto | Cuantizacion | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DJLougen/d1-3B-MLX-8bit | 3,12B | 32.768 tokens | 8 bits RTN affine, grupo 64 | 3,72 GB | LFM Open License v1.0 | HuggingFace, MLX |
| LiquidAI/d1-3B (upstream) | 3,12B | 32.768 tokens | BF16 | 6,25 GB | LFM Open License v1.0 | HuggingFace, transformers/PyTorch |
| Conversion MLX en BF16 (referenciada en la model card) | 3,12B | 32.768 tokens | BF16 | 6,25 GB | LFM Open License v1.0 | HuggingFace, MLX |
| Variante MLX en 4 bits (mencionada en las mediciones) | 3,12B | 32.768 tokens | 4 bits | no disponible | LFM Open License v1.0 | HuggingFace, MLX (segun la model card) |

No se dispone de datos de benchmarks comparativos frente a otros modelos de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un modelo de decisión, no un modelo conversacional: el backbone puede generar texto, pero ese no es su propósito declarado.
- La cuantización es RTN sin calibración AWQ ni GPTQ, lo que puede introducir desviaciones en las probabilidades frente a BF16, aunque la model card reporta coincidencia en las decisiones de smoke test.
- El runner auxiliar vuelve a leer el estado una vez por pregunta; no se ha portado el batching en árbol empaquetado del upstream, lo que implica más cómputo cuando hay varias preguntas sobre el mismo estado.
- Existe un hook de calibración, pero no se incluyen datos de calibración en estos repositorios.
- La latencia de decisión se midió solo con estados de texto cortos; no hay mediciones con contexto largo.
- Las cifras de rendimiento proceden de una sola máquina (M3 Max de 36 GB), con prompts cortos y decodificación greedy, y no constituyen un benchmark de proveedor.
- Las métricas de Decision Index y de benchmarks de imagen son afirmaciones del upstream, no verificadas por el autor de la conversión.
- Riesgo de alucinación: no procede en el sentido habitual, ya que el modelo no genera texto libre, pero sí puede asignar probabilidades erróneas o poco calibradas a estados ambiguos o fuera de distribución.
- Sesgos conocidos: no se documenta ningún análisis de sesgos en la información disponible.
- Limitaciones de idioma: aunque se declaran 16 idiomas, no se especifica el nivel de rendimiento por idioma ni si la calibración es uniforme entre ellos.
- La licencia es LFM Open License v1.0, declarada como license:other; hay que revisar el archivo LICENSE incluido en el repositorio antes de cualquier uso comercial, ya que las condiciones específicas no se detallan en la información proporcionada.
- Los archivos `.py` del upstream (modeling_d1.py, runner.py, prompt.py, api.py, hybrid.py, lfm2_vl.py) se copian en cada repositorio por trazabilidad y son código de transformers, inerte para mlx-vlm.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no hay validación por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DJLougen/d1-3B-MLX-8bit
- Modelo base upstream: https://huggingface.co/LiquidAI/d1-3B
- Licencia LFM Open License v1.0: incluida en el repositorio como archivo LICENSE
- No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en los resultados de la búsqueda web realizada.
