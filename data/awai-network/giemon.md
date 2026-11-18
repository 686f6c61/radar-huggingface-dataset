# awai-network/giemon

## Resumen

Giemon es una interfaz de investigación publicada por Awai Network en Hugging Face bajo el identificador `awai-network/giemon`. Se presenta como un modelo de vision-lenguaje orientado al razonamiento sobre escenas físicas: describe imágenes separando observaciones visibles de inferencias, emplea unidades de medida y declara explícitamente cuándo una magnitud no puede determinarse. El pipeline declarado es `image-text-to-text` y la arquitectura se etiqueta como `murakumo`, un término propio del autor sin documentación técnica pública.

El repositorio no contiene pesos. La model card indica explícitamente "Weights in this repository: None" y describe el artefacto evaluado como un adaptador privado con SHA-256 `9c82026c11f62171f331a1aa62dfd3cba17ea5b71095d9b8b2cfbf8e7a15b271`, cuyo checkpoint base no se identifica mediante una revisión inmutable. El manifiesto registra además una sonda HTTP 502 el 2026-09-22 sobre la interfaz del organismo, y la ruta reservada se describe como *fail-closed* hasta que se satisfagan condiciones de adaptador, identidad de llamante y salida acotada.

Por tanto, Giemon no es en la práctica un modelo descargable ni reproducible: es una ficha de investigación con metadatos, un manifiesto fijado y una referencia a un endpoint remoto opcional (`https://api.murakumo.cloud/v1/chat/completions`). Su relevancia actual es documental y de gobernanza: ilustra un patrón de publicación donde la licencia Apache-2.0 cubre solo el material del repositorio y no los pesos ni el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `murakumo` (etiqueta del autor, sin especificación técnica pública); pipeline `image-text-to-text` |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (solo metadatos del repositorio; no cubre el adaptador ni checkpoints externos) |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |
| ID público del organismo | `ao/giemon` |
| Miembros registrados | borrador `murakumo-main`; revisión `ling-3.0-tiny` |
| SHA-256 del adaptador evaluado | `9c82026c11f62171f331a1aa62dfd3cba17ea5b71095d9b8b2cfbf8e7a15b271` |
| Checkpoint base | no identificado públicamente mediante revisión inmutable |
| Endpoint opcional | `https://api.murakumo.cloud/v1/chat/completions` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-22 |
| Última actualización | 2026-11-18 |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura interna. La etiqueta `murakumo` aparece como nombre propio del autor sin paper, configuración ni código asociado en la información proporcionada. El pipeline declarado es `image-text-to-text`, lo que sitúa al sistema en la categoría de modelos vision-lenguaje, pero no se especifica si emplea un transformer multimodal estándar, un encoder visual acoplado a un decoder lingüístico u otra topología.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF, DPO u otras técnicas de alineamiento. La model card menciona un "text-only reviewer" que no debe añadir ni eliminar afirmaciones visuales que no pueda observar, lo que sugiere un componente de revisión textual en el pipeline, pero sin detallar su implementación. No se documentan innovaciones como decodificación especulativa, atención lineal o modos de pensamiento explícitos.

## Capacidades

- Descripción de imágenes con separación explícita entre observación visible e inferencia.
- Razonamiento sobre configuraciones físicas empleando unidades de medida.
- Declaración de incertidumbre: el modelo debe indicar cuándo una cantidad no puede determinarse a partir de la imagen.
- Procesamiento multimodal entrada imagen + texto, salida texto (pipeline `image-text-to-text`).
- Interfaz compatible con OpenAI según la etiqueta `openai-compatible`, a través del endpoint remoto opcional.
- Revisión textual restringida: un revisor solo-texto no puede añadir ni retirar afirmaciones visuales.
- No se documentan capacidades de tool calling, agentes multi-paso, audio, ni modo de razonamiento extendido.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Documentación técnica de escenas físicas: el modelo puede generar descripciones que distinguen lo observado de lo inferido, útil en informes de inspección donde la trazabilidad entre evidencia y conclusión es requisito.
- Estimación con unidades en entornos controlados: para tareas donde se requiere expresar magnitudes (distancias, dimensiones, tiempos) y marcar explícitamente las que no pueden determinarse, encaja en flujos de verificación humana posterior.
- Investigación en razonamiento físico: sirve como interfaz de estudio para comparar cómo distintos sistemas separan percepción de inferencia, aunque sin pesos públicos la reproducibilidad es limitada.
- Revisión asistida de descripciones visuales: el componente "text-only reviewer" puede emplearse para auditar que un texto no introduzca afirmaciones visuales no respaldadas por la imagen original.
- Prototipado de integraciones OpenAI-compatible: el endpoint `api.murakumo.cloud/v1/chat/completions` permite probar clientes compatibles con la API de OpenAI, siempre con elección explícita del usuario por el envío remoto de entradas.
- Evaluación de gobernanza de artefactos: el manifiesto fijado y el SHA-256 del adaptador permiten estudiar patrones de publicación con licencia de metadatos separada de la licencia de pesos.
- Docencia sobre límites de sistemas multimodales: la card insiste en que Giemon no es un controlador robótico con calificación de seguridad, lo que lo hace útil como caso de estudio de expectativas y salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos ni parámetros publicados).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable sin pesos ni tamaño.
- Opciones de despliegue local: no disponibles; el repositorio no contiene artefactos ejecutables.
- Despliegue remoto: endpoint opcional `https://api.murakumo.cloud/v1/chat/completions`, sujeto a elección explícita del usuario y a condiciones de salida acotada.
- Latencia y throughput: no disponibles.
- Estado del servicio: sonda HTTP 502 registrada el 2026-09-22; la card indica que la capacidad del servicio no se ha re-cualificado en la actualización del 2026-11-18.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (vision-lenguaje con razonamiento físico) con parámetros, contexto o licencia verificables frente a Giemon, dado que este carece de pesos públicos y de especificaciones técnicas.

## Limitaciones y advertencias

- El repositorio no contiene pesos: no es posible descargar, ejecutar ni reproducir el modelo a partir de Hugging Face.
- La licencia Apache-2.0 se declara únicamente para el material del repositorio (metadatos, card, manifiesto); no establece licencia sobre el adaptador privado ni sobre checkpoints externos de los miembros.
- El SHA-256 del adaptador identifica bytes esperados, no su procedencia de entrenamiento, permiso de redistribución ni disponibilidad en vivo.
- El checkpoint base no está identificado por una revisión inmutable, lo que impide auditoría de linaje.
- El endpoint remoto implica enviar entradas a un servicio de terceros; requiere elección explícita del usuario y no debe asumirse permiso para transmitir datos privados.
- Giemon se declara explícitamente como interfaz de investigación y no como controlador robótico con calificación de seguridad; no autoriza acciones físicas, ejecución de herramientas, transmisión remota de entradas ni aprendizaje en segundo plano.
- Cualquier integración futura requiere validación independiente de runtime, recursos, permisos y dispositivo.
- Riesgo de alucinación: no cuantificado; la card mitiga parcialmente exigiendo separar observación de inferencia y declarar cantidades indeterminadas, pero no aporta métricas.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles, lo que impide evaluar cobertura lingüística.
- Estado operativo del servicio no re-cualificado tras el 502 registrado; la disponibilidad real es incierta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/awai-network/giemon
- Card anterior: https://huggingface.co/awai-network/giemon/blob/26608cd48c67f76692fd631032001bc2a96b5d47/README.md
- Manifiesto fijado: https://huggingface.co/awai-network/giemon/blob/26608cd48c67f76692fd631032001bc2a96b5d47/murakumo-model.json
- Sitio de Awai Network: https://awai.network/
- Organización en GitHub: https://github.com/network-awai
- Repositorios de la organización en Hugging Face: https://huggingface.co/awai-network
- Endpoint opcional (API compatible OpenAI): https://api.murakumo.cloud/v1/chat/completions
