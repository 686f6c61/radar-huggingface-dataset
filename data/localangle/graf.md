# localangle/graf

## Resumen

Graf es un encoder pequeno especializado en una tarea muy concreta: recuperar los saltos de parrafo en texto periodistico que ha sido aplanado (es decir, que ha perdido sus separaciones originales entre parrafos). Lo desarrolla Local Angle y se publica bajo licencia MIT. El modelo no reescribe ni genera el articulo: puntua los finales de token elegibles como `BREAK` o `NO_BREAK` y despues corta la cadena aplanada en las fronteras predichas. Se trata, por tanto, de una tarea de clasificacion de tokens (token classification) orientada a la estructura del documento, no a la generacion de contenido.

El modelo parte del encoder Ettin 17M de JHU CLSP (una arquitectura de la familia ModernBERT) y se ha destilado y comprimido como un student de aproximadamente 17M de parametros para su uso en dispositivo y en navegador. El paquete publicado pesa unos 19 MB (vocabulario recortado, embeddings int8 y el resto en fp16), con una variante ONNX de unos 17 MB en int8 para ejecucion en WASM. Su ventana de trabajo es de 2048 tokens por ventana, con ventanas solapadas.

Es relevante ahora porque resuelve un problema practico de recuperacion de estructura en pipelines de noticias y archivado, donde el texto suele llegar aplanado, y lo hace con un coste computacional minimo, apto para ejecucion en CPU, GPU o directamente en el navegador. Su ambito esta acotado a prosa periodistica en ingles, y el propio autor advierte que otros dominios no han sido medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo ModernBERT (Ettin encoder 17M) con cabeza de clasificacion de tokens |
| Parametros totales | ~17M (student destilado de Ettin 17M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de 2048 tokens con solapamiento; tope suave de 2048 tokens en el grafo ONNX web |
| Tipos de cuantizacion | int8 en embeddings de token, fp16 en el resto (pesos PyTorch); ONNX int8 (~17 MB) para navegador |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (sujeta al aviso MIT de Ettin) |
| Formato de pesos | safetensors (`weights.safetensors`), ONNX (`model.onnx` en `web/`), tokenizer completo en `tokenizer/` |

## Arquitectura y entrenamiento

Graf es un encoder transformer de la familia ModernBERT (Ettin encoder 17M) con una cabeza de clasificacion de tokens anadida. El flujo de inferencia empaqueta el texto aplanado en ventanas solapadas de 2048 tokens, puntua los finales de token elegibles (posiciones que pueden albergar una frontera de parrafo) para la etiqueta `BREAK`, promedia las probabilidades entre ventanas, aplica un umbral y reconstruye los bloques de parrafo. El umbral del paquete es 0.41, tomado de `graf.json`.

El paquete publicado es un student comprimido de Ettin (~17M) destilado para uso en dispositivo y en navegador. El vocabulario se ha recortado y los embeddings de token se almacenan en int8 mientras el resto de pesos se guardan en fp16; los pesos PyTorch se expanden a fp32 al cargar, por lo que solo el almacenamiento esta comprimido. El empaquetado mantiene una concordancia de fronteras de aproximadamente Jaccard 0.98 respecto al student previo a la compresion. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO; el autor indica que el texto de entrenamiento y las etiquetas de Extra no se redistribuyen en el repositorio.

## Capacidades

- Recuperacion de saltos de parrafo en texto periodistico aplanado (tarea principal de clasificacion de tokens).
- Segmentacion de bloques de parrafo mediante puntuacion de fronteras y umbralizado.
- Procesamiento por ventanas solapadas de 2048 tokens, con promediado de probabilidades entre ventanas.
- Ejecucion en CPU y GPU con PyTorch, y en navegador mediante ONNX Runtime WASM.
- Despliegue en dispositivo con un paquete de pesos de unos 19 MB.
- Interfaz de linea de comandos y UI local (`graf-web --web-package checkpoints/graf-web`).
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de vision ni de audio.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Normalizacion de articulos en pipelines de noticias: cuando un feed o un scrap entrega el texto aplanado sin parrafos, Graf inserta las fronteras recuperadas y permite reconstruir la estructura antes de indexar o renderizar.
- Archivado y enriquecimiento de corpus periodisticos: al procesar grandes volumenes de texto historico, el modelo recupera la estructura de parrafo para facilitar busquedas y presentacion, con un coste de computo minimo por articulo.
- Preprocesado para sistemas de resumen o extraccion: restaurar los parrafos mejora la segmentacion de entrada antes de pasarla a modelos de resumen o de extraccion de entidades, sin necesidad de un modelo grande.
- Procesamiento en el navegador: gracias al paquete ONNX int8 (~17 MB), se puede paragraphizar texto en una aplicacion web sin enviar los articulos a un servidor, lo que resulta util en escenarios de privacidad o de bajo coste.
- Herramientas editoriales y de correccion: un editor puede pegar texto aplanado y obtener una propuesta de separacion en parrafos para revisar, apoyandose en la UI local o en la demo.
- Ejecucion en dispositivo con recursos limitados: al pesar unos 19 MB y ejecutarse en CPU, encaja en entornos sin GPU, como portatiles, contenedores pequenos o servicios de borde, para tareas de recuperacion de estructura a escala.
- Integracion en pipelines de datos como paso de post-proceso: se puede encadenar tras un extractor de texto para restaurar parrafos antes de almacenar el documento en una base de datos o en un CMS.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test retenido Extra structure v0.2 (publisher-disjoint), con umbral de paquete 0.41 (student previo a la compresion; el empaquetado mantiene una concordancia de fronteras de aproximadamente Jaccard 0.98):

| Metrica | Valor |
|---|---|
| Boundary F1 | 0.871 |
| Precision / Recall | 0.845 / 0.900 |
| PR-AUC | 0.948 |
| Body-body precision / recall | 0.829 / 0.894 |
| Median abs(Delta block count) | 2.0 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el paquete pesa unos 19 MB (int8 en embeddings, fp16 en el resto) y los pesos PyTorch se expanden a fp32 al cargar, lo que sigue siendo un modelo de ~17M de parametros y, por tanto, apto para GPU de gama baja.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo no requiere A100 ni H100. Tambien funciona en CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer; tambien en CPU y en navegador via ONNX Runtime WASM (tope suave de 2048 tokens).
- Opciones de despliegue: PyTorch con `transformers`, `safetensors` y `huggingface_hub`; ONNX Runtime para el paquete `web/`; UI local mediante `graf-web`.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (recuperacion de saltos de parrafo mediante clasificacion de tokens) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Ambito limitado a prosa periodistica en ingles; el propio autor indica que otros dominios no han sido medidos.
- La reconstruccion exacta del articulo completo es intencionadamente dificil; deben tratarse Boundary F1 y las metricas body-body como la senal principal de calidad.
- El modelo ONNX int8 para navegador presenta una ligera deriva respecto al paquete PyTorch; el umbral meta de la version web se ajusta para favorecer el recall (ver `web/graf-web.json`).
- El texto de entrenamiento y las etiquetas de Extra no se redistribuyen en el repositorio, lo que limita la reproducibilidad del entrenamiento.
- No se han publicado datos sobre sesgos del modelo en la informacion disponible.
- Riesgo de alucinacion no aplicable en el sentido generativo, ya que el modelo no genera texto; el riesgo se limita a fronteras de parrafo erroneas (falsos positivos y falsos negativos).
- Licencia MIT para el codigo y los pesos del paquete, sujeta al aviso MIT de Ettin; no se indican restricciones adicionales para uso comercial en la informacion disponible.
- El modelo no soporta tool calling, agentes, vision ni audio, por lo que no debe emplearse fuera de su tarea de clasificacion de tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localangle/graf
- Demo en navegador: https://huggingface.co/spaces/localangle/graf-demo
- Repositorio del codigo: https://github.com/cjdd3b/graf
- Modelo base Ettin encoder 17M: https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Pesos en el repositorio: https://huggingface.co/localangle/graf/tree/main
- Paquete web WASM: https://huggingface.co/localangle/graf/tree/main/web
