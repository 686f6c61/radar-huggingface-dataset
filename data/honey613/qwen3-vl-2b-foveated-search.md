# honey613/qwen3-vl-2b-foveated-search

## Resumen

qwen3-vl-2b-foveated-search es un ajuste fino supervisado del modelo multimodal Qwen/Qwen3-VL-2B-Instruct, desarrollado por Keerthana Reddy Katasani (cuenta honey613 en Hugging Face). El modelo se entrena para imitar el comportamiento de una búsqueda visual foveada: en lugar de procesar la imagen completa a alta resolución, primero observa un miniatura de baja resolución del encuadre completo, señala una ubicación probable del objeto consultado, confirma sobre un recorte nítido y, si falla, vuelve a mirar en otra zona. El ajuste cubre las 80 categorías de objeto de COCO más una categoría adicional de "food", por lo que no se limita a una única clase.

La relevancia práctica del modelo es de eficiencia: reduce el coste en píxeles, tokens de visión y ancho de banda en comparación con el procesamiento de fotogramas completos a resolución nativa, a cambio de una ligera pérdida de precisión. Sobre un benchmark de 450 consultas de COCO, la precisión pasa del 79,1 % en el modelo base al 85,6 % con este ajuste (+6,4 puntos porcentuales, IC del 95 % emparejado [+3,1, +10,0]). En una foto de 1920x1440 ejecutada en FP8 sobre una NVIDIA L4, la búsqueda foveada localiza el alimento consultado en 0,58 s frente a 1,05 s del encuadre completo, con 17,2 veces menos tokens de visión.

El modelo tiene 2.127.532.032 parámetros, se distribuye en safetensors BF16 (4,3 GB de repositorio), usa la librería transformers con pipeline image-text-to-text y se publica bajo licencia Apache-2.0, la misma del modelo base. Está pensado para integración en pipelines de búsqueda visual y grounding con salidas JSON restringidas mediante structured outputs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL) con torre de visión congelada y modelo de lenguaje ajustado mediante LoRA fusionado en pesos BF16 |
| Parametros totales | 2.127.532.032 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; la configuración de vLLM del autor usa `--max-model-len 6144` |
| Tipos de cuantizacion | BF16 (pesos publicados); existe una versión FP8 en honey613/qwen3-vl-2b-foveated-search-fp8 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct, un transformer multimodal con torre de visión y modelo de lenguaje. El ajuste se realizó con LoRA de r=16 y alpha=32 aplicado únicamente a las capas lineales del modelo de lenguaje; la torre de visión y los mergers quedaron congelados. Los adaptadores se fusionaron posteriormente en los pesos BF16, de modo que el repositorio contiene un modelo denso estándar cargable con transformers. El entrenamiento consistió en 1 época con batch efectivo de 64, 527 pasos en 31,5 minutos sobre una única NVIDIA L4, con una pérdida de validación final de 0,540.

El conjunto de datos se generó a partir de las anotaciones de COCO train2017: 35.497 ejemplos en total (33.721 de entrenamiento y 1.776 de validación), sin solapamiento con las imágenes de evaluación. Se entrenaron tres tareas explícitas: (1) decidir dónde mirar a partir de una miniatura del encuadre completo con lado largo entre 64 y 192 px, devolviendo un punto o la respuesta "absent"; (2) volver a mirar dado el mismo thumbnail más las ubicaciones ya comprobadas, devolviendo otro punto o "absent"; y (3) confirmar sobre un recorte nítido del encuadre original si el objeto está presente y, en su caso, señalar su posición. Las salidas usan coordenadas relativas 0-1000 de Qwen3-VL en formato JSON: `{"point_2d": [x, y]}` o `{"absent": true}` para la búsqueda, y `{"y": false}` o `{"y": true, "point_2d": [x, y]}` (con etiqueta corta opcional `"l"`) para la confirmación. Los prompts exactos están en `configs/prompts.yaml` del repositorio del proyecto.

## Capacidades

- Búsqueda visual foveada: localización de un objeto consultado mediante un bucle de miniatura, punto, recorte nítido y confirmación.
- Grounding visual con salida estructurada: puntos en coordenadas relativas 0-1000 sobre la imagen tal como se envía, en JSON.
- Detección de ausencia: el modelo aprendió a responder `{"absent": true}` cuando el objeto no está en la imagen; los falsos positivos en objetivos ausentes bajaron del 45,6 % al 2,2 % en el uso de encuadre completo.
- Reintento informado: dada la miniatura y las ubicaciones ya comprobadas, propone una ubicación alternativa o declara ausencia.
- Confirmación sobre recorte: verifica la presencia del objeto en un recorte de alta resolución y devuelve su punto.
- Cobertura de categorías: las 80 clases de objeto de COCO más "food".
- Integración con tooling: compatible con endpoints de vLLM y structured outputs para restringir la respuesta a un esquema JSON.
- Capacidades heredadas del modelo base Qwen3-VL-2B-Instruct no verificadas específicamente en esta ficha: no disponible.

## Casos de uso

- Búsqueda visual en imágenes de gran resolución: sobre una foto de 1920x1440, el bucle foveado localiza el objeto consultado en 0,58 s (FP8, NVIDIA L4) frente a 1,05 s del encuadre completo, con 17,2 veces menos tokens de visión. Adecuado para catálogos, archivos fotográficos y aplicaciones donde el coste por imagen importa.
- Filtrado previo en pipelines de visión: usar la miniatura de 64-192 px como etapa de descarte barata (una miniatura de 96x64 cuesta 6 tokens de visión con `shortest_edge` 1024) antes de invocar modelos más caros sobre los recortes candidatos.
- Verificación de presencia de producto en estanterías o inventarios: la tarea de confirmación sobre recorte nítido devuelve `{"y": true, "point_2d": [x, y]}` o `{"y": false}`, útil para validar que un artículo está realmente en la imagen antes de registrar una detección.
- Reducción de falsas alarmas en monitorización visual: el ajuste baja los falsos positivos en objetivos ausentes del 45,6 % al 2,2 % en encuadre completo, lo que resulta adecuado para sistemas de alerta donde una detección errónea tiene coste operativo.
- Asistentes de búsqueda interactiva sobre imágenes: el reintento informado con ubicaciones ya comprobadas permite construir interfaces de "buscar otra vez" o de exploración guiada por el usuario sobre una misma imagen.
- Anotación asistida de datasets: generar puntos de localización candidatos sobre imágenes COCO o de dominio similar para revisión humana, aprovechando la salida JSON restringida por esquema y la temperatura 0 recomendada por el autor.
- Procesamiento por lotes en GPU de gama media: el ajuste se entrenó en una sola NVIDIA L4 en 31,5 minutos y el autor documenta inferencia FP8 en L4, lo que encaja en despliegues con GPUs de 24 GB o menos.

## Benchmarks y rendimiento

| Benchmark | Modelo base | qwen3-vl-2b-foveated-search |
|---|---|---|
| Precisión en búsqueda foveada, 450 consultas COCO | 79,1 % | 85,6 % (+6,4 pp; IC 95 % emparejado [+3,1, +10,0]) |
| Falsos positivos en objetivos ausentes (búsqueda foveada) | 1,1 % | 1,1 % (sin cambio reportado) |
| Falsos positivos en objetivos ausentes (encuadre completo) | 45,6 % | 2,2 % |
| Precisión en encuadre completo, COCO | 94,2 % | 94,2 % (referencia del modelo base) |
| Latencia en foto 1920x1440, FP8, NVIDIA L4 | No disponible | 0,58 s (foveada) frente a 1,05 s (encuadre completo) |
| Tokens de visión en foto 1920x1440 | No disponible | 17,2 veces menos con búsqueda foveada |

El propio autor advierte de que mirar el encuadre completo sigue siendo más preciso en COCO (94,2 % frente a 85,6 % con búsqueda foveada); la ventaja de la búsqueda foveada es el coste en píxeles, tokens de visión y ancho de banda, el throughput en imágenes grandes y la tasa de falsas alarmas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos BF16: 2.127.532.032 parámetros, aproximadamente 4,3 GB en safetensors; el repositorio ocupa 4,3 GB.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de pesos, el BF16 requiere del orden de 5-6 GB solo para pesos, más caché KV y activaciones. La versión FP8 reduce esta cifra.
- GPU recomendadas: el autor documenta entrenamiento e inferencia FP8 en una NVIDIA L4. No se especifican otras GPU en la información proporcionada.
- GPU de consumo: no disponible en la información proporcionada; el tamaño de pesos BF16 es compatible en términos de memoria con GPUs de consumo de 8 GB o más, pero no hay confirmación del autor.
- Opciones de despliegue: vLLM, con la configuración documentada (`--max-model-len 6144`, `--limit-mm-per-prompt '{"image": 1, "video": 0}'`, `--mm-processor-kwargs '{"size": {"shortest_edge": 1024, "longest_edge": 2764800}}'`). El autor no documenta llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,58 s por consulta foveada y 1,05 s por encuadre completo en una foto de 1920x1440 con FP8 sobre L4. Entrenamiento: 527 pasos en 31,5 minutos en una L4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-vl-2b-foveated-search | 2.127.532.032 | No disponible; configuración vLLM con 6144 | Búsqueda visual foveada y grounding con salida JSON | Apache-2.0 | Hugging Face (honey613) |
| Qwen/Qwen3-VL-2B-Instruct | 2B (aproximado) | No disponible en la información proporcionada | Modelo multimodal base, procesa el encuadre completo | Apache-2.0 (según el modelo ajustado) | Hugging Face (Qwen) |
| honey613/qwen3-vl-2b-foveated-search-fp8 | 2.127.532.032 | No disponible; misma configuración vLLM | Misma búsqueda foveada en pesos FP8 | Apache-2.0 | Hugging Face (honey613) |

No se dispone de datos de benchmarks comparativos con otros modelos de búsqueda visual o grounding en la información proporcionada. La comparación directa disponible es contra el modelo base: 85,6 % frente a 79,1 % en búsqueda foveada y 2,2 % frente a 45,6 % de falsos positivos en encuadre completo.

## Limitaciones y advertencias

- Precisión inferior al encuadre completo: en COCO, la búsqueda foveada obtiene 85,6 % frente al 94,2 % del encuadre completo. El modelo prioriza coste sobre precisión máxima.
- Dominio de entrenamiento restringido: entrenado y evaluado sobre imágenes de COCO más una demostración con tres fotos reales; el comportamiento fuera de ese dominio no está caracterizado.
- Definición de "food" limitada: se refiere a las 10 clases de alimento de COCO, por lo que alimentos reales sin etiqueta en COCO (pan, arroz, dulces envasados) cuentan como fallo o falso positivo.
- Objetos pequeños: la localización está limitada por el tamaño de la miniatura (lado largo 64-192 px); los objetivos pequeños pueden quedar por debajo de la resolución efectiva.
- Idioma: solo inglés según la model card; no se documenta soporte multilingüe.
- Contexto: no se publica la longitud de contexto del modelo; la configuración de vLLM del autor limita a 6144 tokens, lo que condiciona el número de imágenes y tokens por petición.
- Sesgos: no se documentan análisis de sesgos en la información proporcionada; al derivar de COCO, hereda la distribución y las anotaciones de ese dataset.
- Alucinación: el modelo puede devolver puntos plausibles pero incorrectos; el autor recomienda temperatura 0 y structured outputs para restringir la respuesta al esquema JSON.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-VL-2B-Instruct y de los datos COCO utilizados en el entrenamiento.
- Producción: el repositorio tiene 0 descargas y 1 like en el momento de la consulta; se trata de un ajuste reciente (creado el 2026-11-01) sin validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/honey613/qwen3-vl-2b-foveated-search
- Versión FP8: https://huggingface.co/honey613/qwen3-vl-2b-foveated-search-fp8
- Repositorio del proyecto (código, write-up y resultados): https://github.com/Keerthanareddy17/foveated-vlm-search
- Replay interactivo: https://keerthanareddy17.github.io/foveated-vlm-search/
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
