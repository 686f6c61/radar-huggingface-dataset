# mpilligua/dvlt-sparse-attention

## Resumen

`mpilligua/dvlt-sparse-attention` es un conjunto de pesos derivados del checkpoint `nvidia/dvlt`, una variante que sustituye la atencion global densa por una atencion dispersa restringida a un subconjunto pequeno de candidatos por parche. Esos candidatos se obtienen mediante coincidencia de vecinos mutuos mas cercanos entre los tokens de parche de DINOv2. El modelo resuelve tareas de reconstruccion 3D multi-vista: estimacion de pose relativa entre camaras, prediccion de profundidad y reconstruccion de superficie a partir de imagenes.

El repositorio contiene dos ficheros, uno por etapa de entrenamiento. `dino_encoder.pt` es un DINOv2 ViT-B/14 afinado de forma contrastiva (86,6M parametros, paso 34159) para que sus tokens de parche coincidan entre vistas; las parejas de entrenamiento se muestrean dentro de una banda de covisibilidad medida por conjunto de datos, en lugar de tomarse en orden. `dvlt_sparse.pt` es el modelo DVLT entrenado sobre ese indice con el encoder descongelado (117,1M parametros, paso 27014 de una ejecucion inacabada).

El interes del modelo es de investigacion: demuestra que una atencion dispersa guiada por correspondencias aprendidas mantiene la calidad de profundidad cercana al modelo denso (e incluso mejora el rmse) a costa de perder precision de pose, con una brecha que se ensancha segun se estrecha el umbral. Los pesos son un instantanea de un entrenamiento no finalizado, tienen 0 descargas y 0 likes en el momento de la consulta, y su licencia NVIDIA restringe el uso a investigacion y evaluacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion dispersa (sparse attention) sobre tokens de parche; encoder DINOv2 ViT-B/14 con parches de 14x14 |
| Parametros totales | 117,1M en `dvlt_sparse.pt` y 86,6M en `dino_encoder.pt` (dos ficheros, uno por etapa) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, no procesa texto) |
| Licencia | NVIDIA License (`license: other`); uso no comercial, solo investigacion y evaluacion |
| Formato de pesos | PyTorch (`.pt`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de DVLT, al que se le restringe la atencion global a un conjunto reducido de candidatos por parche. Los candidatos se toman de las correspondencias de vecinos mutuos mas cercanos calculadas entre los tokens de parche de DINOv2, de modo que la atencion solo conecta parches que probablemente observan el mismo punto de la escena. La primera etapa entrena el encoder (`dino_encoder.pt`): un DINOv2 ViT-B/14 afinado de forma contrastiva para que los tokens de parche sean consistentes entre vistas. Las parejas se muestrean dentro de una banda de covisibilidad medida por conjunto de datos, en lugar de tomarse en orden secuencial. La segunda etapa (`dvlt_sparse.pt`) entrena el DVLT sobre ese indice de coincidencias con el encoder descongelado.

El detalle tecnico mas relevante es la granularidad del indice de coincidencias: al operar a nivel de parche (14 pixeles en DINOv2 ViT-B/14), la precision de pose se degrada de forma progresiva conforme se estrecha el umbral de evaluacion. Segun el autor, esto es lo esperable de un indice de correspondencias a esa resolucion. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset mas alla de las 23 colecciones usadas en validacion, ni el uso de RLHF o DPO (tecnicas propias de modelos de lenguaje que no aplican aqui).

## Capacidades

- Reconstruccion 3D multi-vista: estima geometria de escena a partir de varias imagenes de la misma escena.
- Estimacion de pose relativa entre camaras (rotacion y traslacion) mediante un modelo de atencion dispersa.
- Prediccion de profundidad densa, con `abs_rel`, `rmse` y `delta < 1.25` reportados en validacion.
- Reconstruccion de superficie via MVS (metricas chamfer reportadas).
- Correspondencia de tokens de parche entre vistas mediante el encoder contrastivo DINOv2 ViT-B/14 afinado (`dino_encoder.pt`), evaluable de forma independiente con F1@1.
- Extraccion de indices de vecinos mutuos mas cercanos reutilizables para guiar la atencion dispersa.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales adicionales (modo thinking, vision, audio): no disponibles mas alla de las tareas de vision geometrica descritas.

## Casos de uso

- Investigacion sobre atencion eficiente en transformers de vision: permite comparar directamente atencion densa frente a dispersa guiada por correspondencias, con las mismas 23 colecciones de validacion y las mismas metricas, para medir el coste en precision de pose del ahorro computacional.
- Reconstruccion 3D multi-vista en investigacion academica: el modelo genera profundidad y reconstruccion de superficie (chamfer MVS 0,0506) con calidad cercana al DVLT denso, util para reproducir experimentos de geometria multi-vista.
- Estimacion de pose para odometria visual: puede emplearse como componente de un sistema de odometria, teniendo en cuenta que su error de rotacion (1,5175 grados) y traslacion (3,2167) son claramente superiores a los del modelo denso.
- Generacion de profundidad para anotacion de datasets: con `delta < 1.25` de 0,9291 y un `rmse` de 0,1182, mejor que el denso, puede usarse para pre-anotar mapas de profundidad que luego se revisan manualmente.
- Validacion y depuracion de indices de correspondencias entre vistas: el encoder contrastivo se evalua con F1@1 de coincidencia de vecinos mutuos, lo que permite auditar la calidad de un indice de matching sobre un split concreto antes de usarlo en otra etapa.
- Estudio de sensibilidad de conjuntos de datos: la model card documenta que Spring tiene tan poco paralaje que su AUC varia 0,15 entre pasadas identicas, lo que convierte al modelo en una herramienta para identificar colecciones de validacion con metricas inestables.
- Experimentos de reproducibilidad: el repositorio de codigo incluye el comando `python test.py dvlt dvlt_sparse.pt --scenes 15 --batches 40` para regenerar la tabla de resultados de forma controlada.

## Benchmarks y rendimiento

Coincidencia de vecinos mutuos mas cercanos sobre el split de validacion, F1@1 promediado sobre los 23 conjuntos de datos de entrenamiento (Waymo esta en la configuracion de validacion pero no entre ellos):

| Encoder | F1@1 |
|---|---|
| DINOv2 sin ajustar (off the shelf) | 25,1% |
| Ajuste contrastivo, parejas en orden | 42,7% |
| Este modelo, parejas muestreadas por banda por conjunto de datos | 53,6% |

Rendimiento geometrico sobre 23 conjuntos de datos, con Waymo incluido y Spring excluido:

| Metrica | DVLT denso | Disperso, encoder congelado | Este modelo |
|---|---|---|---|
| AUC@5 | 0,6776 | 0,3836 | 0,3955 |
| AUC@30 | 0,8812 | 0,7751 | 0,7862 |
| Error de rotacion (grados) | 0,4673 | 1,5232 | 1,5175 |
| Error de traslacion | 0,9697 | 2,9959 | 3,2167 |
| abs_rel | 0,0414 | 0,0586 | 0,0533 |
| rmse | 0,1284 | 0,1261 | 0,1182 |
| delta < 1.25 | 0,9437 | 0,9241 | 0,9291 |
| MVS chamfer | 0,0323 | 0,0545 | 0,0506 |

Lectura de los datos aportada por el autor: la profundidad se mantiene cerca del modelo denso y el rmse ya es mejor, pero la pose no; la brecha crece al estrechar el umbral, pasando del 89% del denso en AUC@30 al 57% en AUC@5, comportamiento atribuible a un indice de coincidencias con granularidad de 14 pixeles. Los pesos provienen de una ejecucion aun en entrenamiento y deben tratarse como una instantanea, no como un resultado final.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM, latencia ni throughput en la informacion disponible.
- Estimacion derivada del recuento de parametros (no confirmada por el autor): los 117,1M de `dvlt_sparse.pt` ocupan aproximadamente 0,47 GB en fp32 y 0,23 GB en fp16; sumando los 86,6M de `dino_encoder.pt`, el total ronda los 0,81 GB en fp32 y 0,41 GB en fp16. A esa cifra hay que anadir las activaciones, que en un ViT con parches de 14x14 crecen con la resolucion de entrada y con el numero de vistas.
- GPU recomendadas: no disponibles. Por el orden de magnitud del modelo, cabria esperar que quepa en GPUs de consumo (por ejemplo, la familia RTX 4090), pero el pico real depende de la resolucion de imagen y del numero de vistas procesadas, que no se especifican.
- Compatibilidad con GPU de consumo: probable por tamano de pesos, sin confirmacion oficial.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo de vision geometrica. La carga se realiza directamente con PyTorch: `torch.load("dvlt_sparse.pt", map_location="cpu")["model"]` y `model.load_state_dict(sd)`. El repositorio de codigo de referencia es `https://github.com/mpilligua/mVGGT/tree/minimal`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La propia model card ofrece la comparativa mas directa, entre el DVLT denso de NVIDIA, la variante dispersa con encoder congelado y esta variante:

| Modelo | Parametros | Atencion | AUC@5 | AUC@30 | rmse | Licencia |
|---|---|---|---|---|---|---|
| DVLT denso | no disponible | global densa | 0,6776 | 0,8812 | 0,1284 | NVIDIA License |
| Disperso con encoder congelado | no disponible | dispersa | 0,3836 | 0,7751 | 0,1261 | NVIDIA License |
| Este modelo | 117,1M (+86,6M de encoder) | dispersa guiada por vecinos mutuos | 0,3955 | 0,7862 | 0,1182 | NVIDIA License |
| DINOv2 ViT-B/14 sin ajustar | 86,6M (encoder) | no aplica | no disponible | no disponible | no disponible | licencia de DINOv2 |

En F1@1 de matching de parches la comparativa es: DINOv2 sin ajustar 25,1%; ajuste contrastivo con parejas en orden 42,7%; este encoder 53,6%. No se dispone de comparaciones con otros sistemas de reconstruccion 3D multi-vista (por ejemplo, alternativas basadas en VGGT u otros pipelines) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Pesos no finales: `dvlt_sparse.pt` corresponde al paso 27014 de una ejecucion de entrenamiento inacabada, por lo que el autor pide tratarlos como una instantanea.
- Precision de pose degradada: el error de rotacion (1,5175 grados frente a 0,4673 del denso) y el de traslacion (3,2167 frente a 0,9697) casi triplican los del modelo denso.
- Brecha creciente al estrechar umbrales: la precision de pose pasa del 89% del modelo denso en AUC@30 al 57% en AUC@5, lo que limita su uso en aplicaciones que exijan poses muy precisas.
- Granularidad del indice de correspondencias: la atencion dispersa opera a nivel de parche de 14 pixeles, lo que el propio autor identifica como causa de la perdida de precision de pose.
- Inestabilidad de ciertos conjuntos de validacion: Spring presenta tan poco paralaje que su AUC varia 0,15 entre pasadas identicas, por lo que ese conjunto se excluye de la tabla de rendimiento y sus resultados no son fiables.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; en geometria el equivalente seria la generacion de correspondencias o profundidades erroneas en escenas con poco paralaje o texturas repetitivas, no cuantificado en la informacion disponible.
- Sesgos: no se documentan sesgos demograficos ni de otro tipo. Al entrenarse sobre 23 conjuntos de datos, el rendimiento fuera de esas distribuciones no esta caracterizado.
- Restricciones de licencia: los pesos derivan del checkpoint `nvidia/dvlt` y quedan cubiertos por la NVIDIA License (`NVIDIA-LICENSE.txt`), limitada a uso no comercial, de investigacion y evaluacion. No se permite uso comercial.
- Adopcion practicamente nula: 0 descargas y 0 likes en HuggingFace, sin comunidad que haya validado los resultados de forma independiente.
- Ausencia de datos operativos: no hay informacion publicada sobre cuantizacion, latencia, throughput ni requisitos de memoria, lo que complica planificar un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mpilligua/dvlt-sparse-attention
- Codigo de referencia (rama minimal): https://github.com/mpilligua/mVGGT/tree/minimal
- Checkpoint original del que deriva: `nvidia/dvlt`
- Licencia incluida en el repositorio: `NVIDIA-LICENSE.txt`
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados no guardan relacion con el contenido de la ficha.
