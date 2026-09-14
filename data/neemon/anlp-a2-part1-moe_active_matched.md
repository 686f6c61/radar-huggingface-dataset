# neemon/anlp-a2-part1-moe_active_matched

## Resumen

`neemon/anlp-a2-part1-moe_active_matched` es un transformer decoder-only con capas de mezcla de expertos (Mixture-of-Experts, MoE) entrenado desde cero para traducción automática entre inglés, vietnamita y japonés. Lo desarrolla el usuario `neemon` como parte de la asignatura Advanced NLP (IIIT-H, Monsoon 2026), y el repositorio contiene únicamente el checkpoint, no el código de arquitectura, entrenamiento ni evaluación, que residen en el repositorio de la asignatura.

El modelo tiene 58.401.280 parámetros totales y 41.599.488 parámetros activos por token, con 4 expertos enrutados, enrutamiento top-2, cero expertos compartidos y normalización RMSNorm. La ventana de contexto es de solo 256 tokens y el vocabulario de 32.000 entradas. Su interés es fundamentalmente académico y experimental: sirve como punto de comparación controlado entre un modelo MoE y un baseline denso con el mismo número de parámetros activos ("moe_active_matched").

En el conjunto de test declara una perplejidad de 13,92 en ambas direcciones, BLEU de 30,91 para vietnamita→inglés y 20,27 para japonés→inglés (media 25,59). Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de investigación sin adopción comunitaria ni señales de uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (MoE), 4 expertos enrutados, top-2, 0 expertos compartidos, RMSNorm |
| Parametros totales | 58.401.280 |
| Parametros activos | 41.599.488 por token |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye sin cuantizar; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | Ingles (en), vietnamita (vi), japones (ja) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`, `state_dict` serializado con `torch.save`); no hay safetensors ni GGUF |
| Dimension del modelo (`d_model`) | 512 |
| Numero de capas | 8 |
| Cabezas de atencion / cabezas KV | 8 / 8 (sin GQA) |
| Dimension del FFN (`d_ff`) | 1024 |
| Tamano de vocabulario | 32.000 |
| Tamano del repositorio | 0,2 GB |
| Libreria declarada | pytorch |
| Pipeline declarado | translation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 8 capas, `d_model` de 512, 8 cabezas de atencion y 8 cabezas KV (es decir, atencion multi-cabeza estandar, sin grouped-query attention), con RMSNorm y una capa feed-forward de tipo MoE. La FFN agrupa 4 expertos enrutados con enrutamiento top-2 por token y ningun experto compartido, con `d_ff` de 1024 por experto. De los 33.603.584 parametros de la FFN, solo 16.801.792 se activan por token, lo que da lugar a la diferencia entre los 58,4 M de parametros totales y los 41,6 M activos por token. La intencion declarada del autor es igualar los parametros activos al baseline denso de la asignatura, de modo que la comparacion MoE frente a denso sea justa en coste por token.

El entrenamiento se hizo desde cero y la model card solo aporta cifras agregadas: 16.696.256 tokens objetivo puntuados, mejor perdida de validacion de 2,3381 y mejor perplejidad de validacion de 10,36. No se detalla la composicion del dataset, el numero total de tokens vistos, la mezcla de idiomas, el uso de RLHF/DPO ni tecnicas de decodificacion especulativa o atencion lineal. Tampoco se documentan el tokenizador utilizado, la semilla de inicializacion ni los hiperparametros de optimizacion. Al tratarse de un ejercicio de asignatura, no hay publicacion tecnica asociada ni innovacion arquitectonica mas alla de la configuracion MoE descrita.

## Capacidades

- Traduccion automatica hacia ingles desde vietnamita y japones, con BLEU de 30,91 y 20,27 respectivamente en el conjunto de test declarado.
- Traduccion bidireccional en el calculo de perplejidad: la metrica de perplejidad de 13,92 se reporta "both directions", aunque no se publican BLEU para ingles→vietnamita ni ingles→japones.
- Generacion de texto condicionada por prompt en el formato que espere el entrenamiento (no documentado en la model card).
- Razonamiento sobre tramos cortos de texto: la ventana de 256 tokens limita el procesamiento a frases, parrafos breves o segmentos de subtitulo.
- Capacidad experimental de analisis de enrutamiento MoE: al tener 4 expertos con top-2, es posible estudiar el reparto de carga entre expertos y el comportamiento del router en un modelo pequeno.
- No hay soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- No se menciona entrenamiento con datos multilingues mas alla de los tres idiomas etiquetados ni capacidad de seguir instrucciones (no hay indicios de ajuste por instrucciones).

## Casos de uso

- Traduccion de segmentos cortos en tiempo real: el limite de contexto de 256 tokens encaja con mensajes de chat, cadenas de interfaz de usuario o comentarios breves, donde el modelo traduce vi→en o ja→en sin necesidad de trocear el texto.
- Preprocesado en pipelines de datos multilingues: se puede usar como traductor de bajo coste para normalizar corpus vietnamitas y japoneses antes de alimentar un modelo mayor, dado su reducido numero de parametros activos (41,6 M).
- Generacion de subtitulos: cada cue de subtitulo suele quedar por debajo de la ventana de 256 tokens, por lo que el modelo puede traducir linea a linea en un proceso por lotes.
- Investigacion academica sobre MoE: la configuracion con 4 expertos, top-2 y parametros activos igualados al baseline denso permite reproducir experimentos de eficiencia y de equilibrio de carga del router con un coste de computo muy bajo.
- Baseline para comparativas de cuantizacion y destilacion: al ser un modelo de 58 M de parametros, sirve para medir perdida de calidad al aplicar int8/int4 o para entrenar un estudiante denso que imite la salida del MoE.
- Prototipado y docencia: con 0,2 GB de checkpoint y un unico fichero `model.pt`, es viable cargarlo en un portatil para clases, demostraciones de enrutamiento o practicas de traduccion neuronal.
- Despliegue en entornos con recursos muy limitados (edge, Raspberry Pi, CPU): los requisitos de memoria son marginales, siempre que se porte el codigo de la arquitectura, no publicado en este repositorio.
- Ajuste fino sobre dominios concretos: al ser un checkpoint pequeno con licencia MIT, es un punto de partida razonable para fine-tuning en terminologia especializada vi→en o ja→en.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test del ejercicio:

| Metrica | Valor |
|---|---|
| Perplejidad (ambas direcciones) | 13,92 |
| BLEU vi→en | 30,91 |
| BLEU ja→en | 20,27 |
| BLEU medio | 25,59 |
| Perdida de validacion (mejor) | 2,3381 |
| Perplejidad de validacion (mejor) | 10,36 |
| Tokens objetivo puntuados (entrenamiento) | 16.696.256 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, FLORES-200, WMT) en la informacion disponible, ni comparaciones con otros modelos. La model card tampoco aporta desglose por direccion de traduccion mas alla de las dos cifras de BLEU indicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 234 MB en fp32 (58,4 M de parametros), unos 117 MB en fp16/bf16, alrededor de 58 MB en int8 y 29 MB en int4. La cache KV es despreciable: 8 capas × 8 cabezas KV × 64 de dimension por cabeza × 2 (clave y valor) × 256 tokens ≈ 4 MB en fp16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre. El modelo cabe sobradamente en RTX 3060, RTX 4060, RTX 4090, T4, L4, A100 y H100; en la practica la GPU no es el factor limitante.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta moderna, e incluso en CPU o en dispositivos embebidos.
- Opciones de despliegue: al ser una arquitectura personalizada serializada como `state_dict` en `model.pt`, no es cargable directamente con `transformers`, vLLM, TGI, llama.cpp ni Ollama sin escribir el codigo del modelo y exportarlo antes a un formato soportado. La carga indicada por el autor es `torch.load("model.pt")` seguido de la lectura de `payload["model"]` y `payload["config"]`; el codigo de arquitectura y evaluacion esta en el repositorio de la asignatura, no enlazado en la model card.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por lote. Con 41,6 M de parametros activos y contexto de 256, el coste por token es bajo, pero sin datos medidos no se puede cuantificar.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento rigurosa. A continuacion se recogen alternativas de la misma categoria (traduccion multilingue de tamano pequeno), indicando solo los datos disponibles:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| `neemon/anlp-a2-part1-moe_active_matched` | 58,4 M totales / 41,6 M activos | 256 | en, vi, ja | MIT | BLEU 30,91 vi→en; 20,27 ja→en |
| Helsinki-NLP/opus-mt (variantes) | no disponible en la informacion | no disponible | multiples pares | no disponible | no disponible |
| NLLB-200-distilled-600M | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| mBART-50 / M2M-100 | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con cualquiera de estas alternativas queda pendiente de que se publiquen evaluaciones sobre los mismos conjuntos de test.

## Limitaciones y advertencias

- Ventana de contexto muy corta (256 tokens): no admite documentos largos, conversaciones multi-turno extensas ni traduccion con contexto amplio.
- Entrenamiento con muy pocos datos: 16,7 M de tokens objetivo puntuados es un volumen reducido, lo que se traduce en una cobertura lexica y de dominios limitada y una tendencia alta a fallar en vocabulario especializado.
- Rendimiento asimetrico: el BLEU ja→en (20,27) es notablemente inferior al vi→en (30,91), por lo que el japones debe tratarse con mas cautela.
- Sin ajuste por instrucciones ni alineamiento: no hay evidencia de RLHF, DPO ni filtros de seguridad; el modelo puede generar contenido inapropiado o sesgado presente en los datos de entrenamiento.
- Riesgo de alucinacion y de traduccion inventada, especialmente fuera de los dominios vistos durante el entrenamiento y en segmentos con vocabulario poco frecuente.
- Licencia MIT: permite uso comercial y modificacion, pero el origen y la licencia del corpus de entrenamiento no se documentan, lo que traslada al usuario el riesgo legal sobre los datos.
- Reproducibilidad limitada: solo se distribuye el checkpoint. El codigo de arquitectura, el tokenizador y el script de evaluacion no estan en este repositorio, por lo que cargar el modelo exige disponer del repositorio de la asignatura.
- Sin senales de madurez: 0 descargas y 0 likes, sin mantenimiento posterior a la fecha de creacion (14 de septiembre de 2026) y sin issues ni documentacion adicional.
- Formato de pesos no estandar: al ser un `state_dict` de PyTorch con arquitectura personalizada, no hay garantia de compatibilidad con el ecosistema de inferencia habitual y requiere conversion y codigo propio.
- No apto para produccion en traduccion critica sin una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neemon/anlp-a2-part1-moe_active_matched
- Repositorio de la asignatura con arquitectura, entrenamiento y evaluacion: mencionado en la model card pero no enlazado, no disponible.
- Paper o informacion tecnica adicional: no disponible.
- Demo: no disponible.

Nota: la busqueda web realizada no devolvio resultados utiles (unicamente paginas de inicio del buscador), por lo que no se han podido recopilar enlaces adicionales a papers, blogs o repositorios.
