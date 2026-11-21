# nuetzliches/veilq-face-verify-v1

## Resumen

veilq-face-verify-v1 es un clasificador de imagenes de tres clases concebido como verificador de segunda etapa dentro de veilq, una herramienta local de deteccion y redaccion de datos personales desarrollada por el usuario nuetzliches. Su funcion es acotada y muy especifica: recibe los recortes correspondientes a cajas debiles generadas por el detector de caras YuNet (OpenCV Zoo, licencia MIT) y decide si el contenido es una cara fotografica, una cara dibujada o ninguna cara. Las cajas con puntuacion alta de YuNet no pasan por este modelo; se rellenan directamente.

El modelo se construye mediante fine-tuning de `timm/mobilenetv3_small_100.lamb_in1k`, un backbone MobileNetV3-Small preentrenado en ImageNet, y se distribuye en formato ONNX. La entrada es un tensor `[1, 3, 112, 112]` en RGB, normalizado con media `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]`; la salida son logits `[1, 3]` sin softmax en el orden `photo_face`, `drawn_face`, `no_face`. El recorte corresponde a la caja de YuNet expandida un 15 % por cada lado y reescalada a 112 x 112.

Su relevancia practica reside en la reduccion de falsos positivos de YuNet en elementos que no son caras (iconos de aplicaciones, pulgares, detalles de fotografias) sin sacrificar la proteccion de las caras reales: en el conjunto de test mantiene el 99,95 % de las caras y veto el 77 % de los recortes sin cara. No realiza reconocimiento facial ni extrae caracteristicas identificativas; la salida se limita a tres clases y el modelo no informa de la identidad de ninguna persona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV3-Small (backbone `timm/mobilenetv3_small_100.lamb_in1k`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 112 x 112) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el autor no detalla variantes) |
| Idiomas soportados | no aplica (clasificacion de imagen) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es una MobileNetV3-Small, una CNN ligera con bloques invertidos y atencion por squeeze-and-excitation, adaptada de un checkpoint preentrenado en ImageNet (`timm/mobilenetv3_small_100.lamb_in1k`, revision `76b303ec28c466e9df37f4745dfb7aef20ab87ae`). La cabeza de clasificacion se sustituye por una salida de tres clases. La entrada es fija a 112 x 112 píxeles en RGB, con la normalizacion indicada en la model card.

El entrenamiento se realizo exclusivamente con datos sinteticos, sin imagenes de personas reales. El corpus combina caras de personas inventadas generadas con FLUX.1-schnell (Apache-2.0), cabezas renderizadas con Blender a partir de assets MakeHuman/MPFB (CC0, excluyendo pieles con otra licencia), caras de dibujos animados generadas de forma procedural, iconos, logotipos, smileys, elementos de interfaz y manos sin persona en el encuadre, y detalles de fotografias de dominio publico o CC0 de Wikimedia Commons revisadas visualmente para descartar personas, caras o escritura manual. Todos los elementos se componen sobre tarjetas de noticias, feeds, portadas y fotogramas de television con barras de subtitulos, tickers y superposiciones sobre las caras, y se procesan con YuNet del mismo modo que lo hace veilq. El conjunto resultante ronda los 74.000 recortes de entrenamiento, con validacion y test provenientes de assets, prompts, estilos y semillas reservados.

El ajuste fino empleo AdamW con learning rate 3e-4 y EMA durante 15 epocas, seleccionando la mejor (epoca 8) exclusivamente con el conjunto de validacion. La innovacion tecnica no esta en la arquitectura, sino en el diseno del pipeline: el verificador solo se consulta para cajas de YuNet con puntuacion inferior a 0,8, y una caja se deja sin rellenar unicamente cuando la softmax de `no_face` alcanza al menos 0,9532. Una cara dibujada se considera cara (una caricatura puede representar a una persona real); smileys, emoji, iconos, logotipos y manos se consideran no-cara.

## Capacidades

- Clasificacion de recortes de imagen en tres clases: `photo_face`, `drawn_face` y `no_face`.
- Verificacion de cajas debiles de YuNet para descartar falsos positivos (iconos, pulgares, detalles de fotografia, elementos de interfaz).
- Distincion entre cara fotografica y cara dibujada, tratando ambas como cara a efectos de redaccion.
- Funcionamiento local y offline: no envia caracteristicas faciales fuera del dispositivo ni realiza identificacion de personas.
- Inferencia sobre ONNX Runtime con entrada fija de 112 x 112, adecuada para CPU y para despliegues de bajo coste.
- Integracion en el pipeline de veilq como etapa de filtrado previa al rellenado de cajas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; es un clasificador de vision acotado.

## Casos de uso

- Redaccion automatica de caras en imagenes: veilq usa el modelo para decidir si una caja debil de YuNet contiene realmente una cara antes de aplicar el relleno negro, reduciendo cajas negras innecesarias sobre iconos o manos sin comprometer la proteccion de personas.
- Publicacion de capturas de pantalla y fotogramas de television: el modelo mantiene las caras reales bajo barras de subtitulos y tickers (todas las caras con superposicion se conservan en validacion y test), lo que permite despublicar contenido audiovisual con garantias.
- Procesado por lotes de tarjetas de noticias y portadas: al filtrar falsos positivos de YuNet, se evita rellenar logotipos, iconos de aplicaciones o detalles de producto que aparecen en el diseno grafico.
- Anonimizacion de imagenes en entornos con requisitos de privacidad estrictos: al no extraer caracteristicas identificativas y ejecutarse en local sobre ONNX, encaja en flujos donde no se permite enviar imagenes a servicios externos.
- Preprocesado en herramientas de periodismo y archivo documental: verificacion rapida de recortes antes de la revision humana, con un coste computacional bajo gracias al backbone MobileNetV3-Small.
- Integracion en pipelines de moderacion o cumplimiento: como etapa de bajo coste que descarta cajas no faciales antes de un rellenado sistematico, reduciendo falsos positivos sin necesidad de un detector de caras mas pesado.
- Despliegue en dispositivos de borde o CPU: el modelo es lo bastante pequeno para ejecutarse en ONNX Runtime sin GPU dedicada, lo que facilita su uso en aplicaciones de escritorio de redaccion de datos.

## Benchmarks y rendimiento

Resultados medidos por el autor en el umbral 0,9532, elegido sobre validacion:

| Metrica | Validacion | Test |
|---|---|---|
| Caras conservadas (todos los recortes) | 0,9990 | 0,9995 |
| Recortes sin cara vetados | 0,78 | 0,77 |
| P(no_face) maxima de una cara, cajas propias de YuNet | 0,625 | 0,415 |
| Caras con superposicion conservadas | todas | todas |

En una captura real de noticias (verificada localmente, nunca almacenada) el modelo veto un icono de aplicacion y un pulgar, y conservo todas las caras reales, incluida una grande bajo una linea de subtitulo. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el backbone MobileNetV3-Small con entrada 112 x 112 requiere del orden de decenas de MB en FP32, aunque el autor no publica la cifra exacta.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU mediante ONNX Runtime. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobredimensionada para esta carga.
- Cabe en cualquier GPU consumer e incluso en dispositivos de borde o en CPU.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo); no se documentan exportaciones a otros runtimes en la informacion disponible.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo y la resolucion de entrada se espera una latencia de milisegundos por recorte en CPU, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| veilq-face-verify-v1 | no disponible (MobileNetV3-Small) | 112 x 112 RGB | 0,9995 caras conservadas / 0,77 no-caras vetadas en test | Apache-2.0 | ONNX en Hugging Face |
| YuNet (OpenCV Zoo) | no disponible | deteccion de caras | detector de primera etapa; genera falsos positivos en iconos y detalles | MIT | OpenCV Zoo |
| timm/mobilenetv3_small_100.lamb_in1k | no disponible | 224 x 224 RGB | clasificacion ImageNet, sin clases de cara | Apache-2.0 | Hugging Face / timm |

No se dispone de datos publicados que permitan comparar directamente veilq-face-verify-v1 con otros verificadores de caras de proposito similar en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado solo con caras sinteticas: una cara real de tipo poco habitual puede puntuar mas alto en `no_face`, por lo que veilq lo consulta unicamente sobre cajas debiles y rellena todo lo demas.
- Los detalles de fotografia se vetos con menor frecuencia (alrededor de la mitad); una caja falsa en ese contexto permanece rellenada, lo que supone una caja negra innecesaria, no una fuga de datos personales.
- El umbral 0,9532 esta calibrado sobre validacion y puede requerir reajuste en dominios de imagen distintos de los usados en el entrenamiento.
- No realiza reconocimiento facial ni identificacion; su salida se limita a tres clases, por lo que no debe usarse para autenticacion ni para verificar identidades.
- El modelo base ImageNet conserva sus propios terminos de uso como nota residual, segun indica el autor.
- Licencia Apache-2.0, que permite uso comercial; no obstante, el autor no documenta garantias de rendimiento en produccion ni auditorias externas.
- No disponible informacion sobre sesgos demograficos, ya que el entrenamiento emplea exclusivamente caras sinteticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuetzliches/veilq-face-verify-v1
- Repositorio de veilq: https://github.com/nuetzliches/veilq
- Modelo base: https://huggingface.co/timm/mobilenetv3_small_100.lamb_in1k
- FLUX.1-schnell (generacion de caras sinteticas): https://huggingface.co/black-forest-labs/FLUX.1-schnell
- YuNet (OpenCV Zoo): https://github.com/opencv/opencv_zoo
