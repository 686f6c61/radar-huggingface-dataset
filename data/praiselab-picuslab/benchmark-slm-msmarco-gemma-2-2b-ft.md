# praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-ft

## Resumen

`praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-ft` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `google/gemma-2-2b`. No se trata de un modelo de propósito general publicado de forma independiente, sino de un artefacto de evaluación: los tags de la ficha (`benchmark-slm`, `or2`, `dataset-msmarco`, `strategy-ft`) indican que forma parte de un banco de pruebas de modelos de lenguaje pequenos (SLM) sobre la tarea `or2` con el conjunto de datos MS MARCO, y que la estrategia aplicada ha sido un ajuste fino supervisado.

El repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,1 GB), no el modelo completo, por lo que su uso requiere descargar por separado el modelo base de Google y combinarlo. La ficha declara el inglés como único idioma y la librería `peft`, y el acceso está restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de poder descargarlo.

Su relevancia es, por tanto, acotada y de carácter metodológico: sirve como punto de comparación dentro de una matriz de experimentos de ajuste fino de SLM, no como un modelo listo para producción. No hay publicaciones, descargas ni valoraciones asociadas, y no se han divulgado resultados de benchmarks propios en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base `google/gemma-2-2b` (detalle no disponible en la informacion proporcionada) |
| Parametros totales | Aproximadamente 2B en el modelo base (según el identificador `gemma-2-2b`); el repositorio solo contiene el adaptador LoRA, no disponible el numero exacto de parametros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados son un adaptador LoRA en safetensors; la cuantizacion dependeria del modelo base y del runtime) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible en la ficha; el acceso es restringido (gated) y el uso queda sujeto a las condiciones del modelo base `google/gemma-2-2b` |
| Formato de pesos | Safetensors (adaptador LoRA / PEFT); no incluye los pesos completos del modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su procedencia: el adaptador se aplica sobre `google/gemma-2-2b`, un transformer decoder-only de aproximadamente 2.000 millones de parámetros. El repositorio no contiene el modelo fusionado, sino exclusivamente los pesos del adaptador de bajo rango (LoRA) en safetensors, con un tamano de 0,1 GB, lo que confirma que se trata de un ajuste paramétricamente eficiente y no de un reentrenamiento completo.

Los metadatos permiten reconstruir parcialmente el protocolo experimental: estrategia `ft` (fine-tuning), tarea `or2` y conjunto de datos `microsoft/ms_marco`, orientado a recuperación de pasajes y ranking de respuestas. No se especifican el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni hiperparámetros del adaptador (rango, alpha, módulos objetivo), por lo que estos extremos deben considerarse no disponibles.

## Capacidades

- Generación de texto en inglés, heredada del modelo base; no se documentan capacidades adicionales específicas del adaptador.
- Ajuste orientado a la tarea `or2` sobre MS MARCO, presumiblemente relacionada con recuperación de pasajes o respuesta a consultas sobre un corpus documental.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe: limitada al inglés según la ficha; no se declaran otros idiomas.
- No se documentan modos especiales (thinking mode, visión, audio) ni contextos extendidos.

## Casos de uso

- Evaluación comparativa de SLM: el adaptador sirve como una de las celdas de la matriz `benchmark-slm` (tarea `or2`, dataset `msmarco`, estrategia `ft`), de modo que se usaría para medir la contribución del ajuste fino frente a otras estrategias sobre el mismo modelo base.
- Reproducción de experimentos académicos: al estar el adaptador en safetensors y la librería declarada como `peft`, se puede cargar con `PeftModel.from_pretrained` sobre `google/gemma-2-2b` para replicar exactamente las condiciones del banco de pruebas.
- Búsqueda y ranking sobre MS MARCO: el ajuste sobre este corpus permite experimentar con reordenación de pasajes o generación de respuestas ancladas a documentos, siempre dentro de un pipeline de evaluación controlado.
- Estudio de eficiencia de LoRA: con 0,1 GB de pesos, es un caso práctico para medir el coste de almacenamiento y el sobrecoste de inferencia de un adaptador frente al modelo completo.
- Base para experimentos de destilación o comparación de estrategias: al compartir modelo base con otras variantes del mismo banco de pruebas, permite aislar el efecto de la estrategia de entrenamiento.
- Docencia y formación interna: útil como ejemplo mínimo y reproducible de flujo PEFT sobre un transformer de 2B en entornos con recursos limitados.
- No se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones críticas, dado que es un artefacto de benchmark sin validación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamano del modelo base, no verificada): en torno a 4-5 GB en FP16 y 2-3 GB en cuantizacion de 4 bits, más el sobrecoste del adaptador (despreciable, 0,1 GB).
- GPU recomendadas: no disponibles en la información proporcionada. Por tamano, una GPU consumer de 8 GB o más debería alojar el modelo base cuantizado; el adaptador debe fusionarse o cargarse con PEFT.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más en cuantizacion de 4 bits; no confirmado por el autor.
- Opciones de despliegue: PEFT + Transformers (ruta natural, dado que la librería declarada es `peft`); llama.cpp, Ollama, vLLM o TGI requerirían fusionar previamente el adaptador con el modelo base y exportar a GGUF o safetensors completos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| `praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-ft` | ~2B (base) + adaptador LoRA | No disponible | No disponible (acceso gated) | Safetensors (PEFT) | Artefacto de benchmark, sin métricas publicadas |
| `google/gemma-2-2b` (modelo base) | ~2B | No disponible en la informacion proporcionada | Condiciones de uso de Gemma | Safetensors | Modelo de propósito general; el adaptador se evaluaria contra esta referencia |
| Otros adaptadores del mismo banco `benchmark-slm` | No disponible | No disponible | No disponible | Safetensors (PEFT) | Comparables por construccion, pero no identificados en la informacion disponible |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de evaluación: no es un modelo listo para producción ni cuenta con validación independiente; descargas y valoraciones son cero.
- Sesgos: no documentados; al heredar el modelo base, arrastra los sesgos de sus datos de entrenamiento, no auditados en esta ficha.
- Riesgo de alucinación: no evaluado en la información disponible; el ajuste sobre MS MARCO no garantiza fidelidad factual fuera del dominio.
- Limitación de idioma: la ficha declara únicamente inglés, por lo que no cabe esperar un rendimiento fiable en castellano.
- Longitud de contexto no disponible: impide planificar casos de uso con documentos largos.
- Licencia no declarada y acceso restringido (gated): es necesario aceptar condiciones en HuggingFace; el uso comercial depende de los términos del modelo base `google/gemma-2-2b` y debe verificarse antes de cualquier despliegue.
- Requiere combinar con el modelo base: el repositorio solo contiene el adaptador, de modo que no es autocontenido ni reproducible sin descargar `google/gemma-2-2b`.
- Ausencia total de documentación técnica (dataset final, hiperparámetros, métricas) que impide auditar el proceso de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-ft
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Dataset declarado: https://huggingface.co/datasets/microsoft/ms_marco
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
