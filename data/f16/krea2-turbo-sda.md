# F16/krea2-turbo-sda

## Resumen

Krea 2 Turbo — SDA Diversity LoRA es un adaptador de bajo rango (LoRA) de rango 32 desarrollado por el usuario F16, diseñado específicamente para el modelo de generación de imágenes Krea 2 Turbo. Su propósito es restaurar la diversidad de muestreo que el proceso de destilación Turbo eliminó del modelo base, permitiendo que un mismo prompt genere imágenes visualmente distintas entre sí sin sacrificar calidad ni adherencia al texto. El adaptador se entrena con un método propio llamado SDA (Semantic Directional Alignment), que alinea las direcciones semánticas entre un profesor (Krea 2 RAW, la versión no destilada) y el estudiante (Turbo + LoRA) en los pasos de alto ruido, donde se decide la composición de la imagen.

La relevancia de este adaptador radica en que los modelos destilados como Turbo tienden a colapsar la diversidad: ante un mismo prompt, producen prácticamente la misma imagen una y otra vez. Este LoRA resuelve ese problema de forma eficiente, sin requerir reentrenar el modelo base. El repositorio incluye pesos en formato diffusers y ComfyUI, con un tamaño de 1,0 GB, y se distribuye bajo la licencia comunitaria krea-2-community-license. La integración es sencilla mediante la pipeline `Krea2Pipeline` de diffusers, aunque exige un control de activación por pasos (gate) para obtener los resultados óptimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA rank-32 sobre Krea 2 Turbo (modelo de difusion text-to-image) |
| Parametros totales | No disponible (el repositorio no indica el numero exacto de parametros del adaptador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | No disponible (los pesos se publican en safetensors, probablemente bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | krea-2-community-license (consultar restricciones en el enlace del modelo base) |
| Formato de pesos | safetensors (dos variantes: diffusers y ComfyUI) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 que se aplica sobre el modelo base Krea 2 Turbo, un modelo de difusion destilado para generar imagenes en 8 pasos. El entrenamiento utiliza un metodo propio denominado SDA (Semantic Directional Alignment) que aborda el colapso de diversidad como un problema de direccion en el espacio perceptual. Para una imagen de entrenamiento, se extraen dos ruidos diferentes y se anaden a un nivel de sigma fijo (σ = 0,9567), correspondiente al segundo paso del esquema de 8 pasos de Turbo. Tanto el profesor congelado (Krea 2 RAW) como el estudiante (Turbo + LoRA) predicen la imagen para ambos ruidos; las predicciones se decodifican y se embeben mediante un stack CLIP congelado. El delta de caracteristicas del profesor (ΔT) indica la direccion en el espacio perceptual que deberia producir el intercambio de ruido, y la perdida `L_div = 1 − cos(ΔS, ΔT)` ensena al estudiante a alinear su delta (ΔS) en esa misma direccion, evitando que todos los ruidos colapsen en una unica plantilla. Ademas, se anade un ancla SFT para estabilizar la trayectoria del estudiante.

El entrenamiento incorpora tambien una exploracion denominada Forward XM best-of-5: en cada paso se generan K = 5 ruidos candidatos, se puntuan sin gradientes y solo se retropropaga a traves del candidato cuyo delta del estudiante esta mejor alineado con el profesor. Esto proporciona una ganancia de velocidad de aprendizaje de aproximadamente 3 veces. El adaptador se entrena en un unico nodo de alto ruido, lo que explica la necesidad de un control de activacion por pasos durante la inferencia. No se especifican en la informacion disponible los datos de entrenamiento (numero de imagenes, composicion del dataset, etc.).

## Capacidades

- Restaurar la diversidad de muestreo en Krea 2 Turbo: con un mismo prompt y diferentes semillas, el LoRA genera variaciones notables en composicion, iluminacion, estilo y detalles, frente al comportamiento repetitivo del modelo base.
- Mantener la calidad de imagen y la adherencia al prompt: las metricas de calidad (HPSv2.1) y la tasa de cumplimiento de restricciones multiples son estadisticamente indistinguibles del baseline sin LoRA.
- Requiere activacion por pasos (gate = 2): el adaptador solo debe estar activo durante los primeros 2 de los 8 pasos de denoise; si se deja activo en todos los pasos, la calidad se degrada significativamente.
- Compatible con el ecosistema diffusers y ComfyUI: se incluyen pesos en ambos formatos, aunque en ComfyUI es necesario usar nodos de programacion por pasos para aplicar el gate.
- No introduce capacidades adicionales como tool calling, agentes, vision o audio; su unica funcion es la diversidad de generacion.

## Casos de uso

- Exploracion creativa de conceptos: un disenador puede generar decenas de variaciones de una misma escena (por ejemplo, "un gato en una ventana") para explorar rapidamente diferentes composiciones, iluminaciones y estilos antes de seleccionar una direccion artistica.
- Generacion de datasets de entrenamiento: al producir imagenes diversas a partir de prompts controlados, el LoRA permite crear conjuntos de datos mas variados para entrenar otros modelos de vision o generacion, reduciendo el sesgo de repeticion.
- Iteracion rapida en produccion: en entornos de alta demanda visual (publicidad, redes sociales), el adaptador permite obtener varias opciones de imagen en una sola ejecucion, acelerando el flujo de trabajo de seleccion y aprobacion.
- Diseño de producto: para presentar un mismo producto en multiples entornos, angulos y condiciones, el LoRA genera alternativas visuales sin necesidad de cambiar el prompt, facilitando presentaciones y pruebas de concepto.
- Ilustracion y arte digital: los ilustradores pueden usar el adaptador para obtener interpretaciones distintas de una misma escena, sirviendo como fuente de inspiracion o como base para bocetos variados.
- Pruebas A/B de marketing: generar diferentes versiones de una imagen publicitaria (mismo mensaje, distinta estetica) para evaluar cual tiene mejor rendimiento en campanas, usando el LoRA para producir las variantes de forma automatica.

## Benchmarks y rendimiento

La model card del autor incluye resultados de evaluacion comparando el baseline (sin LoRA) y el adaptador con gate=2. Se evaluaron 10 prompts con 16 semillas cada uno, junto con pruebas de adherencia al prompt en 24 prompts multi-restriccion con 8 semillas.

| Metrica | Baseline | + SDA LoRA (gate=2) | Δ |
|---|---|---|---|
| Pairwise CLIP cosine distance ↑ | 0,0296 | 0,0548 | +85 % |
| Pairwise L2 distance ↑ | 0,2281 | 0,3167 | +39 % |
| Pixel std ↑ | 0,1584 | 0,2117 | +34 % |
| HPSv2.1 quality ↑ | 0,2990 | 0,2987 | −0,1 % (paridad) |
| High-frequency energy ratio | 1,000 | 1,206 | ligeramente elevado, sin penalizacion de desenfoque |

La adherencia al prompt (tasa de acierto de restricciones y puntuacion completa) es estadisticamente indistinguible del baseline. No se han publicado resultados en benchmarks estandar como MMLU o HumanEval, ya que no son aplicables a un modelo de generacion de imagenes.

## Requisitos de hardware

- No se proporcionan requisitos especificos en la informacion disponible. Los requisitos de hardware dependen del modelo base Krea 2 Turbo, que no se detallan en la documentacion consultada.
- Al ser un LoRA, el adaptador se carga junto con el modelo base. Se recomienda una GPU con al menos 8-12 GB de VRAM para generar imagenes a resoluciones estandar (512x512 o 1024x1024), aunque no hay datos confirmados.
- El despliegue se realiza mediante la libreria diffusers (pipeline `Krea2Pipeline`) o ComfyUI. Para diffusers, se requiere una version reciente (posterior a 0.39.0.dev0) que incluya la integracion de Krea 2.
- No se dispone de datos de latencia o throughput especificos para este adaptador.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores LoRA similares para Krea 2 Turbo ni de comparativas con alternativas de la misma categoria. La unica comparacion disponible es contra el baseline sin LoRA, cuyos resultados se muestran en la tabla de benchmarks. Se recomienda consultar el repositorio del modelo base para posibles comparaciones con otros metodos de diversidad.

## Limitaciones y advertencias

- El gate de activacion es obligatorio: el LoRA debe estar activo solo durante los primeros 2 de los 8 pasos de denoise. Si se deja activo en todos los pasos, se produce una degradacion severa de la calidad (energia de alta frecuencia 2,2 veces superior al baseline o desenfoque, y una caida del 10 % en HPS).
- La licencia krea-2-community-license puede imponer restricciones de uso comercial o de redistribucion; es necesario revisar los terminos en el enlace del modelo base antes de usar el adaptador en produccion.
- No se han publicado datos sobre sesgos del modelo o riesgos de alucinacion visual; como cualquier modelo de generacion de imagenes, puede producir contenido inapropiado o estereotipado, especialmente con prompts ambiguos.
- El adaptador se ha entrenado en un unico nodo de alto ruido (σ = 0,9567); su comportamiento fuera de ese rango no ha sido validado, por lo que no se recomienda su uso con configuraciones de pasos diferentes a las documentadas.
- Los idiomas soportados no estan especificados; la generacion de imagenes suele ser agnostica al idioma del prompt, pero la calidad de adherencia puede variar con prompts en idiomas distintos al ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/F16/krea2-turbo-sda
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Pagina oficial de Krea 2 Turbo: https://www.krea.ai/models/krea-2-turbo
- Tutorial sobre Krea2 Raw/Base & Turbo (BF16/FP8/NVFP4/INT8): https://www.stablediffusiontutorials.com/2026/06/krea2-base-turbo.html
- Discusion sobre SDA para Krea2: https://huggingface.co/F16/z-image-turbo-sda/discussions/8
