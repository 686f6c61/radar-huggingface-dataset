# hasanfaesal/NoPoSplat-TartanAir

## Resumen

NoPoSplat-TartanAir es un ajuste fino (fine-tuning) del modelo NoPoSplat de Ye et al. (ICLR 2025) sobre el conjunto de datos de robótica TartanAir. NoPoSplat es un modelo feed-forward de 3D Gaussian Splatting generalizable que reconstruye escenas 3D a partir de pares de imagenes sin pose de camara conocida, eliminando la necesidad de optimizacion por escena o de COLMAP en tiempo de test. Este checkpoint adapta concretamente el codificador transformer libre de pose y el decodificador de splats a trayectorias roboticas de 6 grados de libertad, con rotaciones angulares rapidas, cambios agresivos de pitch y roll y geometria industrial interior.

El autor, hasanfaesal, parte de los pesos de NoPoSplat entrenados sobre RealEstate10K (re10k.ckpt) junto con el backbone MASt3R ViT-Large, y reentrena sobre 39 trayectorias de TartanAir distribuidas en cinco entornos (office, office2, abandonedfactory, carwelding y oldtown). El entrenamiento se realizo en una unica NVIDIA H100 de 80 GB con batch de 16 a resolucion 256x256, consumiendo entre 50 y 52 GB de VRAM. El repositorio ocupa 5,9 GB e incluye dos checkpoints, configuraciones, registros de entrenamiento, telemetria de GPU y 47 escenas de splats pre-renderizadas en formato .ply.

El modelo resulta relevante para la comunidad de robotica y vision por computador porque demuestra la adaptacion de un foundation model de novel view synthesis a dominios con movimiento no suave, tipico de drones y robots terrestres, donde los modelos entrenados en secuencias inmobiliarias o de conduccion suave suelen degradarse. La licencia Apache 2.0 facilita su reutilizacion comercial, aunque la ausencia de metricas formales de evaluacion (PSNR, SSIM, LPIPS) publicadas limita por ahora su validacion cuantitativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer feed-forward con codificador libre de pose y decodificador de 3D Gaussian Splatting; backbone MASt3R ViT-Large |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision, opera sobre pares de imagenes, no sobre tokens de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints .ckpt en precision de entrenamiento; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch (.ckpt, ~2,4 GB cada uno) y escenas 3D Gaussian Splatting en .ply |

## Arquitectura y entrenamiento

La arquitectura hereda el diseno de NoPoSplat: un transformer generalizable que procesa pares de imagenes sin pose y produce directamente un conjunto de gaussianas 3D, sin optimizacion por escena ni estimacion de pose en tiempo de inferencia. El backbone visual es MASt3R ViT-Large, cuyas caracteristicas se combinan con los pesos iniciales de NoPoSplat entrenados sobre RealEstate10K. Sobre esa base, el autor reentrena el codificador libre de pose y el decodificador de splats para trayectorias de robotica de 6 grados de libertad.

El ajuste fino se realizo sobre 39 trayectorias de TartanAir en cinco entornos, con conversion de los marcos NED a coordenadas OpenCV estandar (+X derecha, +Y abajo, +Z adelante). El entrenamiento uso batch de 16 a 256x256, con una funcion de perdida conjunta de MSE y LPIPS basada en VGG sobre vistas novelas renderizadas. Por restricciones de presupuesto de computo (creditos H100 con vencimiento), no se alcanzo el objetivo de 150.000 pasos: se completaron 80.000 pasos en una primera fase y se reanudo con un watchdog automatico de 6 horas hasta detenerse en torno al paso 121.670. Los scripts de evaluacion offline (compute_metrics.py para PSNR, SSIM y LPIPS) no se ejecutaron antes del apagado del computo.

## Capacidades

- Reconstruccion 3D de escenas a partir de pares de imagenes sin pose de camara conocida (pose-free).
- Novel view synthesis feed-forward, sin optimizacion por escena ni COLMAP.
- Generacion directa de escenas 3D Gaussian Splatting exportables en formato .ply, compatibles con visores WebGL como PlayCanvas o SuperSplat.
- Adaptacion a trayectorias roboticas de 6 DoF con rotaciones rapidas y cambios de pitch y roll, gracias al ajuste sobre TartanAir.
- Generalizacion a entornos industriales interiores y exteriores diversos (oficina, fabrica abandonada, soldadura de coches, casco antiguo).
- No dispone de capacidades de texto, codigo, matematicas, tool calling, agentes ni procesamiento de audio; es un modelo puramente visual 3D.

## Casos de uso

- Reconstruccion 3D en robotica movil: el modelo puede generar mapas de splats a partir de pares de imagenes capturadas por camaras de robot terrestre o dron, sin necesidad de estimar pose ni ejecutar SLAM denso, lo que simplifica pipelines de percepcion embarcada.
- Navegacion y planificacion en entornos industriales: gracias al ajuste sobre abandonedfactory y carwelding, resulta adecuado para reconstruir geometria interior de plantas y naves con iluminacion baja y movimientos rapidos de camara.
- Novel view synthesis para simulacion: permite generar vistas novelas de escenas roboticas para entrenamiento de politicas o validacion de algoritmos de vision, partiendo de pares de imagenes existentes.
- Digitalizacion rapida de entornos con dron: el modelo tolera rotaciones angulares agresivas, tipicas de trayectorias aereas, y produce splats exportables para inspeccion visual inmediata en visores WebGL.
- Prototipado de percepcion 3D sin calibracion: al no requerir poses, se puede desplegar en plataformas donde la calibracion de camara es costosa o poco fiable, obteniendo reconstrucciones preliminares con fines de diagnostico.
- Analisis cualitativo de geometria en investigacion: los 47 splats pre-renderizados en el repositorio permiten comparar visualmente la calidad geometrica entre escenas faciles y dificiles antes de integrar el modelo en un pipeline mayor.
- Fine-tuning adicional sobre dominios propios: la licencia Apache 2.0 y la estructura de configuraciones (tartanair.yaml, tartanair_h100.yaml) facilitan reentrenar sobre nuevos conjuntos de trayectorias roboticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que los scripts de evaluacion formal (PSNR, SSIM, LPIPS) no se ejecutaron antes del apagado del computo y que planea subir las metricas proximamente. En su lugar, el repositorio incluye registros de entrenamiento (train.log, train_extended.log), telemetria de GPU (gpu_telemetry.csv) y 47 escenas .ply para inspeccion cualitativa.

## Requisitos de hardware

- Entrenamiento: se realizo en una unica NVIDIA H100 de 80 GB (PCIe), con batch de 16 a 256x256 y consumo sostenido de 50 a 52 GB de VRAM.
- Inferencia: no se publican requisitos especificos de VRAM para inferencia; el checkpoint pesa aproximadamente 2,4 GB, pero el backbone MASt3R ViT-Large y las activaciones intermedias elevan el consumo por encima del peso de los parametros.
- GPU recomendadas: no disponible como dato oficial; por el perfil de entrenamiento, GPUs de datacenter (H100, A100) son las mas adecuadas, y GPUs consumer de gama alta con suficiente VRAM podrian ser viables para inferencia a baja resolucion, aunque no esta confirmado por el autor.
- Cabe en GPU consumer: no confirmado; no se dispone de mediciones de VRAM en inferencia.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de vision 3D); el uso previsto es cargar los checkpoints .ckpt con el codigo de NoPoSplat y exportar splats .ply para visores WebGL.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Pose de entrada | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NoPoSplat-TartanAir (este) | 3DGS feed-forward generalizable | Sin pose | Fine-tuning sobre TartanAir desde NoPoSplat RE10K | Apache 2.0 | Hugging Face (hasanfaesal/NoPoSplat-TartanAir) |
| NoPoSplat (botaoye/noposplat) | 3DGS feed-forward generalizable | Sin pose | RealEstate10K | no disponible en la informacion | Hugging Face (botaoye/noposplat) |
| MASt3R | Estimacion de correspondencias y reconstruccion densa | Sin pose (pipeline propio) | Conjuntos de pares de imagenes diversos | no disponible en la informacion | Repositorio oficial de los autores |
| 3D Gaussian Splatting clasico | Optimizacion por escena | Requiere poses (COLMAP) | Optimizacion por escena | no disponible en la informacion | Codigo oficial INRIA |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de metricas cuantitativas: no se han publicado PSNR, SSIM ni LPIPS, por lo que la calidad real frente a NoPoSplat original o a otros modelos no esta validada formalmente.
- Entrenamiento incompleto: se detuvo en torno al paso 121.670 frente a un objetivo de 150.000, lo que puede dejar margen de mejora en convergencia.
- Dominio acotado: el ajuste cubre solo cinco entornos de TartanAir (office, office2, abandonedfactory, carwelding, oldtown); el rendimiento fuera de esos dominios no esta caracterizado.
- Resolucion de entrenamiento baja: 256x256, lo que puede limitar el detalle geometrico en escenas de alta resolucion o con texturas finas.
- Sin capacidades linguisticas ni multimodales de texto: no es utilizable para tareas de NLP, codigo, agentes o tool calling.
- Riesgo de artefactos geometricos en escenas con oclusiones severas, superficies reflectantes o iluminacion extrema, no cuantificado por el autor.
- Sesgos de dominio: al derivar de RealEstate10K y TartanAir, puede heredar sesgos de composicion de escena (interiores inmobiliarios y entornos sinteticos de robotica).
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los modelos base (NoPoSplat y MASt3R) y del dataset TartanAir antes de un despliegue en produccion.
- Los splats .ply pre-renderizados son muestras cualitativas, no un conjunto de evaluacion; no deben usarse como evidencia de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hasanfaesal/NoPoSplat-TartanAir
- Modelo base NoPoSplat: https://huggingface.co/botaoye/noposplat
- Paper NoPoSplat (Ye et al., ICLR 2025): no disponible como URL en la informacion proporcionada
- Paper TartanAir (Wang et al., IROS 2020): no disponible como URL en la informacion proporcionada
- Repositorio de codigo NoPoSplat: no disponible como URL en la informacion proporcionada
- Visores de splats WebGL mencionados: PlayCanvas y SuperSplat (URLs no proporcionadas en la informacion)
