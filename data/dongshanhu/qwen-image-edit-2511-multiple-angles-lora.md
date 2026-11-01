# DongShanHu/Qwen-Image-Edit-2511-Multiple-Angles-LoRA

## Resumen

Qwen-Image-Edit-2511-Multiple-Angles-LoRA es un adaptador LoRA para el modelo de edicion de imagen Qwen/Qwen-Image-Edit-2511, desarrollado por el usuario DongShanHu en colaboracion con fal.ai. Su proposito es anadir control preciso de la posicion de camara sobre una imagen de entrada: permite regenerar el mismo sujeto desde 96 puntos de vista distintos definidos por combinaciones de azimut, elevacion y distancia. Resuelve un problema concreto de los modelos de edicion de imagen: aunque Qwen-Image-Edit-2511 ya incorpora cierta capacidad de cambio de punto de vista, no ofrece control exacto ni reproducible de la camara.

El adaptador se entrena sobre mas de 3000 pares de imagenes generados con Gaussian Splatting, lo que aporta consistencia 3D a los renders de entrenamiento. La nomenclatura del prompt es fija y estructurada (`<sks> [azimut] [elevacion] [distancia]`), lo que facilita su integracion en pipelines automatizados. Es relevante ahora porque los flujos de trabajo de edicion de imagen con control espacial estan ganando peso en produccion audiovisual, videojuegos y sintesis de datos, y este tipo de LoRA evita tener que recurrir a reconstruccion 3D explicita.

El repositorio tiene un tamano de 0,3 GB, lo que corresponde al peso del adaptador y no al modelo base, que debe descargarse por separado. La licencia es Apache 2.0 y la libreria de referencia es diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre un modelo de difusion de edicion de imagen (base: Qwen-Image-Edit-2511) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio de 0,3 GB, libreria diffusers) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre Qwen-Image-Edit-2511, un modelo de difusion para edicion de imagen condicionada por texto. El LoRA no modifica la arquitectura del modelo base, sino que inyecta matrices de bajo rango en las capas del transformer de difusion para especializarlo en el control de camara. El token `<sks>` actua como trigger que activa el comportamiento aprendido.

El entrenamiento se realizo sobre mas de 3000 pares de imagenes generadas mediante Gaussian Splatting, una tecnica de reconstruccion 3D que produce renders consistentes desde multiples puntos de vista. Esta eleccion es relevante porque garantiza que el modelo aprenda relaciones espaciales reales entre vistas, no meras correlaciones visuales. El conjunto cubre 4 elevaciones (-30°, 0°, 30°, 60°), 8 azimuts (de 0° a 315° en pasos de 45°) y 3 distancias (factor 0,6, 1,0 y 1,8), lo que da 96 poses. El autor indica que se hicieron mas iteraciones y comprobaciones de calidad que en versiones anteriores, y se menciona soporte especifico para angulos bajos (-30°), un caso habitualmente deficil en modelos de este tipo.

## Capacidades

- Edicion de imagen con control exacto de la posicion de camara sobre 96 poses predefinidas.
- Cambio de azimut horizontal en 8 direcciones: frontal, cuarto delantero-derecho, lateral derecho, cuarto trasero-derecho, trasero, cuarto trasero-izquierdo, lateral izquierdo y cuarto delantero-izquierdo.
- Control de elevacion en 4 niveles: angulo bajo (-30°), a nivel de ojos (0°), elevado (30°) y angulo alto (60°).
- Control de distancia mediante tres factores de encuadre: primer plano (close-up, x0,6), plano medio (medium shot, x1,0) y plano general (wide shot, x1,8).
- Edicion image-to-image: parte de una imagen existente y regenera el sujeto desde otra perspectiva.
- Soporte de angulos bajos, incluida la vista a nivel de suelo.
- Capacidad de generar secuencias animadas de camara combinando varias poses sobre el mismo sujeto.
- Prompt estructurado y determinista, adecuado para automatizacion.
- Idioma de los prompts: ingles.

## Casos de uso

- **Generacion de vistas multiples para modelado 3D:** a partir de una unica foto de un objeto, generar las 96 poses para alimentar un pipeline de fotogrametria o de reconstruccion por Gaussian Splatting. La consistencia 3D del entrenamiento reduce las discrepancias entre vistas.
- **Turntables y animaciones de producto:** renderizar una secuencia de 8 o 16 vistas alrededor de un objeto para producir un video de rotacion de 360° destinado a fichas de e-commerce, sin necesidad de montar un plato giratorio fisico.
- **Previsualizacion de encuadres en produccion audiovisual:** dado un still de una escena, explorar rapidamente angulos alternativos (contrapicado, picado, plano general) antes de rodar, lo que permite validar decisiones de direccion de fotografia.
- **Sintesis de datos para vision por computador:** generar variaciones controladas de punto de vista sobre un dataset semilla para aumentar la robustez de detectores y clasificadores frente a cambios de perspectiva.
- **Ilustracion y concept art:** un ilustrador puede partir de un boceto o render y pedir vistas laterales o traseras coherentes del mismo personaje u objeto para una hoja de modelo.
- **Videojuegos y assets 3D:** producir vistas de referencia de un asset desde angulos concretos para texturizado o para comparar con el render del motor.
- **Automatizacion en pipelines de imagen:** al tener un formato de prompt fijo, el LoRA se puede encadenar en scripts que recorran las 96 combinaciones de forma programatica, por ejemplo en un servicio desplegado en fal.ai.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye GIFs comparativos de animaciones de camara y diagramas de las 96 poses, pero no metricas cuantitativas como FID, CLIP score o similitud perceptual.

## Requisitos de hardware

- El adaptador ocupa 0,3 GB, pero la inferencia requiere cargar el modelo base Qwen-Image-Edit-2511 completo, cuyos requisitos de VRAM no se detallan en la informacion disponible.
- No se especifican GPU recomendadas ni minimas en la documentacion proporcionada.
- No se confirma si el modelo base cabe en GPU de consumo; este dato no esta disponible.
- Opciones de despliegue: la libreria indicada es diffusers; el autor menciona fal.ai como plataforma de construccion y existe una copia del modelo en ModelScope bajo la organizacion fal.
- No se dispone de datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Control de camara | Poses | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-Edit-2511-Multiple-Angles-LoRA | LoRA sobre Qwen-Image-Edit-2511 | Explicito y estructurado | 96 | Apache 2.0 | HuggingFace, ModelScope |
| Qwen-Image-Edit-2511 (base) | Modelo de edicion de imagen | Implicito, via prompt libre | no definido | no disponible en la informacion | HuggingFace |
| LoRA de angulos multiples para otros modelos de difusion | LoRA | Variable | no disponible | variable | no disponible |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo solo acepta prompts en ingles; el formato de camara esta fijado y no admite variaciones libres sin perder precision.
- El control se limita a las 96 poses entrenadas; angulos intermedios o combinaciones fuera de la rejilla (por ejemplo, elevaciones de 15° o azimuts de 20°) no estan garantizados.
- Al ser un LoRA sobre un modelo de difusion, hereda los sesgos y el riesgo de alucinacion visual del modelo base, incluida la posible deformacion de detalles finos o de texto en la imagen.
- El conjunto de entrenamiento procede de renders de Gaussian Splatting, lo que puede introducir un sesgo hacia objetos aislados y bien delimitados, con peor comportamiento en escenas complejas o con oclusiones.
- La licencia Apache 2.0 del adaptador no exime de comprobar la licencia del modelo base Qwen-Image-Edit-2511 para uso comercial.
- El repositorio es muy reciente (creado el 28 de octubre de 2026) y cuenta con 13 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad.
- No hay informacion publicada sobre cuantizacion, lo que puede limitar el despliegue en entornos con VRAM restringida.

## Enlaces

- HuggingFace: https://huggingface.co/DongShanHu/Qwen-Image-Edit-2511-Multiple-Angles-LoRA
- Archivos del repositorio: https://huggingface.co/DongShanHu/Qwen-Image-Edit-2511-Multiple-Angles-LoRA/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Copia en ModelScope: https://www.modelscope.cn/models/fal/Qwen-Image-Edit-2511-Multiple-Angles-LoRA
- Resumen en ModelScope: https://www.modelscope.cn/models/fal/Qwen-Image-Edit-2511-Multiple-Angles-LoRA/summary
- Ficha en Layer.ai: https://layer.ai/models/qwen-qwen-image-edit-2511-multiple-angles
- fal.ai: https://fal.ai
