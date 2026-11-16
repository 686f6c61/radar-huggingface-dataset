# kulits/BrickFlow

## Resumen

BrickFlow es un modelo generativo de reconstruccion 3D desarrollado por Peter Kulits y Cordelia Schmid (presentado en NeurIPS 2026) que convierte imagenes en ensamblajes de ladrillos LEGO/LEGO-compatibles mediante un enfoque de flow matching guiado por conectividad. El modelo aborda el problema de la reconstruccion de estructuras de ladrillos fisicamente validas a partir de una unica imagen, garantizando que las piezas encajen correctamente segun las restricciones geometricas del sistema de construccion.

La familia se compone de seis variantes organizadas en dos grupos: tres modelos preentrenados (PT-S, PT-B, PT-L) que actuan como denoisers genericos, y tres modelos condicionados por imagen (IC-S, IC-B, IC-L) afinados a partir de los anteriores para la tarea image-to-3D. Las variantes escalan en anchura y profundidad (desde width 384 / depth 12 hasta width 1024 / depth 24), con tamanos de pesos que van de 127 MiB a 2,48 GiB.

El modelo es relevante porque combina generacion por flow matching con un mecanismo de guiado por conectividad que asegura la viabilidad fisica del ensamblaje, un requisito critico en dominios como diseno asistido, prototipado o generacion de contenido 3D estructurado. Los pesos se distribuyen bajo licencia MIT y se acompanan de un paquete Python (`brickflow`) para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser basado en flow matching (clase `brickflow.model.Denoiser`); variantes PT e IC; los modelos IC consumen caracteristicas DINOv3 (ViT-L/16) |
| Parametros totales | no disponible (el autor solo publica anchura y profundidad) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo image-to-3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de vision/3D) |
| Licencia | MIT |
| Formato de pesos | `.pt` (`torch.save(dict(model=state_dict))`) |
| Variantes | PT-S (width 384, depth 12, 127 MiB), PT-B (width 768, depth 12, 503 MiB), PT-L (width 1024, depth 24, 1,72 GiB), IC-S (206 MiB), IC-B (811 MiB), IC-L (2,48 GiB) |
| Tamano del repo | 6,2 GB |
| Pipeline | image-to-3d |
| Entrada | Imagen (modelos IC) o muestreo incondicional (modelos PT) |
| Salida | Ensamblaje de ladrillos LEGO/LDraw |

## Arquitectura y entrenamiento

BrickFlow emplea un modelo generativo basado en flow matching. La pieza central es un denoiser (`brickflow.model.Denoiser`) parametrizado por anchura y profundidad, entrenado para transformar ruido en ensamblajes de ladrillos. La innovacion principal es el guiado por conectividad: el proceso de generacion incorpora restricciones que garantizan que los ladrillos generados puedan unirse fisicamente entre si, evitando estructuras flotantes o incompatibles. Los pesos publicados son la media exponencial movil (EMA) post-hoc de los snapshots de entrenamiento.

El entrenamiento se organiza en dos fases. Primero se preentrenan los modelos PT (pretrained) sobre el split `train/pt` del dataset `kulits/BrickFlow`. Despues, los modelos IC (image-conditioned) se afinan a partir de los PT correspondientes sobre el split `train/ic`, incorporando caracteristicas visuales extraidas con DINOv3 (`facebook/dinov3-vitl16-pretrain-lvd1689m`). En inferencia, los modelos IC leen las caracteristicas DINOv3 y utilizan el modelo PT del mismo tamano para completar el muestreo. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento ni sobre el uso de RLHF/DPO (no aplicable a este dominio).

## Capacidades

- Generacion de ensamblajes de ladrillos LEGO/LDraw a partir de una unica imagen (modelos IC).
- Muestreo incondicional de estructuras de ladrillos (modelos PT).
- Guiado por conectividad para garantizar viabilidad fisica del ensamblaje.
- Soporte de muestreo con guia (`--guidance`) segun la CLI del paquete.
- Extraccion de caracteristicas visuales mediante DINOv3 ViT-L/16 para condicionamiento por imagen.
- Escalado en tres tamanos (S, B, L) para equilibrar calidad y coste computacional.
- Integracion con el ecosistema BrickNet a traves del paquete `brickflow` (descarga de pesos y assets).
- No soporta tool calling, agentes, texto ni capacidades multilingues (no aplica).

## Casos de uso

- Reconstruccion 3D desde fotografia: dada una imagen de un objeto, generar un ensamblaje de ladrillos fisicamente valido para prototipado rapido en diseno de producto.
- Generacion de instrucciones de construccion LEGO: convertir una referencia visual en un modelo construible paso a paso, util para creadores de contenido y aficionados.
- Diseno asistido por computador (CAD) con restricciones fisicas: usar el guiado por conectividad para producir estructuras ensamblables en entornos de prototipado.
- Generacion de contenido 3D para videojuegos o entornos interactivos: crear modelos de ladrillos a partir de concept art o referencias visuales.
- Investigacion en generacion 3D estructurada: servir como baseline reproducible (licencia MIT, pesos publicos) para experimentos de flow matching con restricciones geometricas.
- Educacion STEM: generar modelos de construccion a partir de imagenes para actividades didacticas de geometria y ensamblaje.
- Aumento de datos para vision 3D: producir pares imagen-ensamblaje sinteticos para entrenar otros modelos de reconstruccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el mayor peso (IC-L) ocupa 2,48 GiB en disco, por lo que la inferencia en precision completa requeriria un multiplo de esa cifra; los modelos S (127-206 MiB) son muy ligeros.
- GPU recomendadas: no disponible. Por tamano de pesos, los modelos S y B caben en GPUs consumer (RTX 3060/4060/4090); los modelos L probablemente requieren GPUs con mayor memoria (A100, H100) aunque no se confirma.
- Cabe en consumer GPU: probablemente si para las variantes S y B; no confirmado para L.
- Opciones de despliegue: paquete Python `brickflow` (instalacion via `pip install brickflow`), con CLI (`python -m brickflow fetch`, `python -m brickflow sample`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de reconstruccion de ladrillos o image-to-3D estructurado.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ensamblajes de ladrillos LEGO/LDraw; no es un modelo de lenguaje ni de proposito general.
- Depende de DINOv3 ViT-L/16 para el condicionamiento por imagen, lo que anade una dependencia externa y coste adicional.
- No se han publicado benchmarks, por lo que el rendimiento real frente a alternativas es desconocido.
- Los modelos IC requieren el modelo PT del mismo tamano para completar el muestreo, lo que duplica la carga en memoria.
- Riesgo de alucinacion geometrica: aunque el guiado por conectividad mitiga estructuras invalidas, no se documenta su tasa de fallo.
- Licencia MIT permite uso comercial, pero conviene verificar las licencias de las dependencias (DINOv3, dataset BrickFlow) por separado.
- Sin informacion sobre sesgos, cobertura de dominios visuales o robustez ante imagenes fuera de distribucion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion por la comunidad practicamente inexistentes.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/kulits/BrickFlow
- Dataset: https://huggingface.co/datasets/kulits/BrickFlow
- Repositorio GitHub: https://github.com/kulits/BrickFlow
- DINOv3 ViT-L/16: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Pagina del autor (Peter Kulits): https://kulits.github.io/
- Pagina de Cordelia Schmid: https://cordeliaschmid.github.io/
