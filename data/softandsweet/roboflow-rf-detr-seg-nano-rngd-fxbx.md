# softandsweet/roboflow-rf-detr-seg-nano-rngd-fxbx

## Resumen

El modelo `softandsweet/roboflow-rf-detr-seg-nano-rngd-fxbx` es una adaptación del detector-segmentador RF-DETR Seg Nano de Roboflow, empaquetado en formato FXBX para su ejecución sobre el compilador Furiosa Torch y el runtime TCC 2026.4.0 en hardware NPU de FuriosaAI (servidores identificados como "25" y "5" en la model card). No es un modelo lingüístico ni multimodal generativo: es un modelo de segmentación de instancias de imágenes, con entradas fijas de 312×312 píxeles en RGB y batch 1, que produce 100 propuestas de objetos con puntuaciones de clase, cajas delimitadoras y logits de máscara.

El autor, `softandsweet`, no entrena un modelo nuevo: parte del checkpoint `Roboflow/rf-detr-seg-nano` (commit `472badbc863609789ce1f69311244c670bdfd2b9`) y lo compila a un grafo ejecutable por el SDK FXBX, verificando la equivalencia numérica con la ejecución de referencia en CPU con tolerancias `atol=0.02` y `rtol=0.02`. La model card está redactada en coreano y describe tanto el procedimiento de instalación como las mediciones de latencia antes y después de aplicar un plan de ejecución fusionado.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue específico para una plataforma NPU, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados de calidad de segmentación (mAP, mask AP) y sin información sobre el dataset de entrenamiento original. Es útil para quien necesite ejecutar RF-DETR Seg Nano en hardware FuriosaAI, no como referencia general del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base RF-DETR Seg Nano; familia DETR con cabecera de segmentación de instancias) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 312×312 RGB, batch 1) |
| Tipos de cuantizacion | FP32 (según model card); no se documentan otras precisiones |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | FXBX (artefacto compilado para Furiosa Torch/TCC); pesos originales del modelo base no especificados en la información disponible |
| Tamaño del repositorio | 0,4 GB |
| Entrada | imagen RGB 312×312, batch 1 |
| Salidas | clases `[1,100,91]`, cajas `[1,100,4]`, logits de máscara `[1,100,78,78]` |
| Runtime requerido | Furiosa Torch / TCC 2026.4.0, PyTorch 2.10.0+cpu, paquete `fxbx[weights]==0.9.1` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base RF-DETR Seg Nano más allá de su naturaleza de segmentador de instancias con salida tipo DETR: 100 consultas de objeto, cada una con distribución sobre 91 clases, caja de 4 coordenadas y máscara de 78×78 logits. No se documentan el número de capas, la dimensión del backbone, el mecanismo de atención ni la estrategia de matching de consultas. Tampoco se especifican los datos de entrenamiento originales, el número de tokens o imágenes, la composición del dataset ni si hubo etapas de ajuste fino supervisado adicionales.

Lo que sí está documentado es el proceso de compilación y empaquetado realizado por el autor sobre el checkpoint de Roboflow. El artefacto principal es `rf-detr-seg.fxbx`, un grafo compilado que se ejecuta mediante el SDK FXBX. Adicionalmente se incluye `rf-detr-seg.fxbx.merged.zip`, un plan de ejecución con 458 grupos de pasos consecutivos precompilados como un único Runnable del SDK, lo que reduce el número de invocaciones de 22.968 a 596 (458 grupos más 138 pasos sueltos). La fusión se valida con comprobaciones de hash del plan, versión de Furiosa Torch, versión de TCC (se toleran diferencias de parche), hashes de miembros y consistencia de formas y flujo de datos; si alguna comprobación falla, el runtime vuelve a la ejecución paso a paso. Los grupos se compilaron con TCC 2026.4.0 salvo 46 de ellos, compilados con TCC 2026.4.1, listados en `manifest.json` bajo `compiled_with_tcc`. El autor verificó en NPU que ningún grupo sobrescribe tensores de entrada (0 casos); los que lo hacían se extrajeron como pasos sueltos y se recompilaron.

## Capacidades

- Segmentación de instancias sobre imágenes RGB de 312×312 píxeles, con hasta 100 objetos candidatos por imagen.
- Clasificación en 91 categorías por propuesta, con cajas delimitadoras y máscaras densas de 78×78.
- Ejecución en hardware NPU de FuriosaAI mediante el runtime FXBX, con soporte de plan de ejecución fusionado para reducir la sobrecarga de lanzamiento desde el host.
- Verificación numérica frente a la ejecución de referencia en CPU: error máximo de 0,00015 en puntuaciones de clase, 0,00005 en cajas y 0,0020 en logits de máscara sobre la entrada del repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No soporta visión generativa ni descripción de imágenes: solo produce detecciones y máscaras.
- No se documentan capacidades multilingües ni modos de pensamiento.

## Casos de uso

- Despliegue de segmentación de instancias en infraestructura FuriosaAI: el artefacto FXBX permite ejecutar RF-DETR Seg Nano en NPU sin recompilar desde PyTorch, usando `python run.py` tras descargar el repositorio y extraer `weights.tar`. Adecuado cuando el hardware objetivo es un servidor con TCC 2026.4.0.
- Inspección visual en línea de producción: con entradas fijas de 312×312 y batch 1, el modelo encaja en pipelines de cámara industrial que clasifican y segmentan objetos por fotograma; la latencia medida con plan fusionado es de 73 ms en el servidor 25 y 201 ms en el servidor 5 bajo carga de CPU.
- Prototipado de segmentación en entornos con CPU limitada: la reducción de invocaciones de 22.968 a 596 disminuye la dependencia del host, lo que resulta útil cuando la CPU del nodo está saturada y el cuello de botella está en el lanzamiento de kernels.
- Segmentación de objetos en imágenes aéreas o de satélite de baja resolución: la ventana de 312×312 y las 91 clases del modelo base son compatibles con conjuntos tipo COCO; útil para conteo y localización de instancias en ortofotos recortadas.
- Automatización de anotación asistida: generar máscaras y cajas preliminares para revisión humana en flujos de etiquetado, siempre que se acepte la limitación de 100 objetos por imagen y la resolución fija de entrada.
- Validación de portabilidad de modelos de visión a NPU: el repositorio sirve como referencia de cómo verificar equivalencia numérica (atol/rtol 0,02) entre la ejecución compilada y la de CPU, útil para equipos que portan otros detectores a Furiosa Torch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de segmentación (mAP, mask AP, AP50) en la información disponible. Los únicos datos numéricos publicados son de latencia y de error numérico frente a la referencia en CPU.

| Medición | Antes de fusionar | Después de fusionar | Factor |
|---|---|---|---|
| Servidor 25, con otras compilaciones en CPU | 517 ms | 73 ms | 7,0× |
| Servidor 5, CPU saturada | 3.293 ms | 201 ms | 16,4× |

| Verificación numérica (CPU, atol 0,02 / rtol 0,02) | Error máximo |
|---|---|
| Puntuaciones de clase | 0,00015 |
| Cajas | 0,00005 |
| Logits de máscara | 0,0020 |

| Verificación con imagen volteada horizontalmente | Valor |
|---|---|
| Diferencia máxima en logits de máscara (fusionado) | 0,039 |
| Diferencia máxima en logits de máscara (sin fusionar) | 0,0084 |
| Clases idénticas entre las 100 propuestas | 100 de 100 |
| Píxeles de máscara con cambio dentro/fuera (sobre 608.400) | 0 |

## Requisitos de hardware

- Hardware objetivo: NPU de FuriosaAI. La model card menciona ejecución verificada en los servidores identificados como "25" y "5", sin especificar el modelo de tarjeta.
- Software: Furiosa Torch / TCC 2026.4.0 (46 grupos del plan fusionado requieren TCC 2026.4.1), PyTorch 2.10.0+cpu, paquete `fxbx[weights]==0.9.1`.
- VRAM estimada: no disponible. El repositorio ocupa 0,4 GB, pero no se desglosa el tamaño de los pesos ni la memoria de trabajo del grafo compilado.
- GPU consumer: no aplica; el artefacto está compilado para NPU y no se documenta ejecución en CUDA, ROCm ni Metal.
- Opciones de despliegue: SDK FXBX con `python run.py`; el plan fusionado `rf-detr-seg.fxbx.merged.zip` solo se aprovecha con una versión de fxbX que lo soporte (referencia `smallstep-zzz/fxbX#10`, aún no publicada). Con la versión distribuida actual de fxbx, el archivo se ignora y se ejecuta el camino paso a paso.
- Latencia: 73 ms (servidor 25) y 201 ms (servidor 5) con fusión; 517 ms y 3.293 ms sin fusión, en las condiciones descritas por el autor.
- Throughput: no disponible; solo se publican mediciones de una imagen por ejecución (batch 1).

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A continuación se comparan únicamente los aspectos documentados.

| Modelo | Tipo | Entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| softandsweet/roboflow-rf-detr-seg-nano-rngd-fxbx | Segmentación de instancias | 312×312 RGB, batch 1 | Apache-2.0 | FXBX (NPU FuriosaAI) | Artefacto de despliegue compilado; sin benchmarks de calidad publicados |
| Roboflow/rf-detr-seg-nano | Segmentación de instancias | no disponible | no disponible en la información | no disponible | Modelo base del que deriva el anterior; checkpoint de referencia |
| Alternativas de la misma categoría (p. ej. otros detectores-segmentadores DETR) | Segmentación de instancias | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No se han publicado métricas de calidad de segmentación (mAP, mask AP) ni del modelo base ni de esta adaptación; no es posible evaluar su precisión frente a alternativas.
- El artefacto está acoplado a una plataforma concreta: requiere Furiosa Torch/TCC 2026.4.0 y el SDK FXBX 0.9.1. No es portable a GPU convencional ni a otros runtimes sin recompilación.
- El plan de ejecución fusionado solo funciona con una versión de fxbX que aún no está distribuida; con la versión pública actual se pierde la mejora de latencia de 7× a 16,4×.
- La fusión introduce divergencia numérica mayor en entradas distintas de la de validación: con una imagen volteada horizontalmente, la diferencia máxima en logits de máscara sube a 0,039 frente a 0,0084 sin fusionar. Aunque no cambió ninguna clase ni ningún píxel dentro/fuera en esa prueba, es un indicio de sensibilidad que conviene verificar con el dominio real de despliegue.
- Entrada rígida: 312×312 píxeles, batch 1 y RGB. No admite resolución variable ni lotes mayores sin recompilación.
- Límite de 100 objetos por imagen; objetos adicionales no se detectan.
- Solo 91 clases, heredadas del modelo base; no se documenta qué categorías son ni si cubren dominios especializados.
- La model card está en coreano y no documenta sesgos, composición del dataset de entrenamiento ni evaluación por subgrupos; no es posible evaluar sesgos de clase, género o geográficos.
- Riesgo de alucinación en el sentido de falsos positivos: no hay datos publicados sobre precisión/recall ni sobre calibración de las puntuaciones de clase.
- Licencia Apache-2.0, que permite uso comercial, pero la licencia del modelo base debe verificarse de forma independiente; la información disponible no la detalla.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.
- El autor indica que el modelo se validó en los servidores "25" y "5"; no se documenta comportamiento en otras configuraciones de hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/softandsweet/roboflow-rf-detr-seg-nano-rngd-fxbx
- Modelo base: https://huggingface.co/Roboflow/rf-detr-seg-nano/tree/472badbc863609789ce1f69311244c670bdfd2b9
- Issue de fxbX sobre soporte del plan fusionado: smallstep-zzz/fxbX#10 (referenciado en la model card, sin URL completa en la información disponible)
