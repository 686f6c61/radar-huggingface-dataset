# LaBandita/sophiee0713-v3

## Resumen

`LaBandita/sophiee0713-v3` es un adaptador LoRA de tipo DreamBooth para el modelo de difusión texto-a-imagen Krea 2. Lo publica el usuario LaBandita en Hugging Face y se entrena sobre `krea/Krea-2-Raw`, aunque las muestras de la model card se generan con la variante acelerada `krea/Krea-2-Turbo` en 8 pasos de inferencia. Su función es introducir un concepto de identidad concreto —persona, rostro y cuerpo— invocable mediante el token `sophiee0713`, de modo que el modelo base reproduzca ese sujeto de forma consistente en retratos y planos de cuerpo completo.

El repositorio es pequeño (0,8 GB) y se distribuye en formato diffusers, cargable con `Krea2Pipeline.load_lora_weights()`. No incluye documentación sobre el conjunto de entrenamiento, el número de pasos, el rango del adaptador ni métricas de calidad; la model card se limita al token disparador, siete prompts de ejemplo con sus imágenes y un snippet de código.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo estándar de personalización de Krea 2 mediante LoRA en el ecosistema diffusers. Por otro, los prompts de ejemplo incluyen desnudos explícitos ("no clothing"), lo que sitúa el modelo en el terreno de los LoRA de identidad con capacidad NSFW y obliga a revisar consentimiento, licencia y cumplimiento normativo antes de cualquier uso en producción. El modelo no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre un modelo de difusión texto-a-imagen Krea 2; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (adaptador LoRA; no se publica rango ni número de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen); resolución nativa de Krea 2 no disponible |
| Tipos de cuantizacion | no disponible; el ejemplo oficial carga el pipeline en `bfloat16` |
| Idiomas soportados | no disponible; la model card solo documenta prompts en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (LoRA para diffusers, `Krea2Pipeline`) |
| Modelo base | krea/Krea-2-Raw (muestras generadas sobre krea/Krea-2-Turbo) |
| Token disparador | `sophiee0713` |
| Pipeline | text-to-image |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-20 / 2026-10-20 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo: se aplica sobre los pesos de Krea 2 y modifica un subconjunto de capas para incorporar un concepto visual nuevo. La model card lo describe explícitamente como "DreamBooth-LoRA for Krea 2, trained on Krea 2 RAW and shown on Krea 2 Turbo". Esto implica que el entrenamiento se hizo sobre la variante RAW (no destilada) y que la inferencia se demuestra sobre la variante Turbo, destilada para pocos pasos: el snippet oficial usa `num_inference_steps=8` y `guidance_scale=0.0`, coherente con un modelo Turbo sin classifier-free guidance.

No se publica información sobre el dataset de entrenamiento (número de imágenes, resolución, composición, si hubo regularización o augmentation), ni sobre hiperparámetros del LoRA (rango, alpha, learning rate, pasos). Tampoco se documenta si se aplicaron técnicas de mitigación de sobreajuste o de preservación del prior del modelo base. La única innovación reseñable es de proceso, no de arquitectura: el uso de un token identificador único como anclaje del concepto y el despliegue sobre Turbo para reducir el coste de inferencia a 8 pasos.

## Capacidades

- Generación de imágenes fotorrealistas de un sujeto concreto invocado con el token `sophiee0713`.
- Retratos en primer plano, plano medio y cuerpo completo, con control de ángulo (frontal, tres cuartos, perfil).
- Control de escena, vestuario, iluminación y fondo mediante prompt en lenguaje natural (luz natural, estudio, playa, fondo neutro).
- Transferencia de identidad consistente entre generaciones, que es el objetivo declarado del adaptador.
- Composición con el modelo base Krea 2: hereda las capacidades del base (texto-a-imagen) y añade el concepto; no se documentan otras.
- Generación NSFW: los prompts de ejemplo incluyen desnudos explícitos, por lo que el adaptador está entrenado o ajustado para producir ese tipo de contenido.
- Sin soporte documentado de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking": no aplica a un modelo de difusión.
- Capacidades multilingües: no disponibles; todos los ejemplos están en inglés.

## Casos de uso

- Producción de personajes sintéticos consistentes: usar `sophiee0713` como ancla de identidad en una serie de ilustraciones o storyboards, manteniendo el mismo rostro y proporciones entre viñetas con distintos encuadres y localizaciones.
- Previsualización fotográfica en estudio: generar pruebas de iluminación y encuadre (luz natural difusa, luz de estudio, perfil) antes de una sesión real, con el adaptador como sustituto rápido de un modelo físico.
- Pruebas de vestuario y estilismo: iterar combinaciones de ropa (camiseta blanca y vaqueros, bikini) sobre un cuerpo consistente para validar paletas y siluetas en fases de diseño.
- Prototipado de avatares para aplicaciones: generar un set de imágenes de perfil con expresiones y ángulos controlados para maquetas de UI, siempre que exista consentimiento del sujeto representado.
- Investigación sobre privacidad y deepfakes: emplear el adaptador como caso de estudio reproducible de LoRA de identidad sobre Krea 2 para evaluar la facilidad de replicar rostros reales y diseñar detectores o mitigaciones.
- Evaluación comparativa de técnicas de personalización: al ser un DreamBooth-LoRA sobre la variante RAW y probado en Turbo, sirve para medir la degradación de identidad al pasar de un modelo completo a uno destilado con 8 pasos.
- Contenido editorial para adultos: publicación en plataformas que permitan contenido NSFW, con verificación de edad, consentimiento documentado y etiquetado explícito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, CLIP score, similitud facial, ni comparaciones cuantitativas con otros LoRA de identidad. Tampoco se documentan tiempos de inferencia medidos, más allá del ajuste declarado de 8 pasos sobre Krea 2 Turbo.

## Requisitos de hardware

- VRAM estimada: no disponible. El adaptador LoRA en sí ocupa menos de 0,8 GB (tamaño total del repo, que incluye las imágenes de muestra), pero el consumo dominante lo determina el modelo base Krea 2, cuyas especificaciones no se detallan en la información proporcionada.
- GPU recomendadas: no disponibles para el modelo base. El snippet oficial asume una GPU CUDA con soporte de `bfloat16` (`.to("cuda")`, `torch_dtype=torch.bfloat16`).
- Compatibilidad con GPU de consumo: no confirmada. La ejecución en 8 pasos sobre la variante Turbo reduce el coste frente a un muestreo completo, pero no se publican requisitos mínimos de VRAM.
- Opciones de despliegue: diffusers con `Krea2Pipeline` (flujo documentado). Al ser un LoRA en formato diffusers, es previsible su carga en herramientas compatibles con LoRA estándar (por ejemplo ComfyUI), aunque la model card no lo documenta ni lo garantiza.
- Latencia y throughput: no disponibles. No se publican mediciones por GPU, resolución ni tamaño de lote.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Pasos de inferencia documentados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LaBandita/sophiee0713-v3 | LoRA de identidad (DreamBooth) | Krea-2-Raw | 8 (sobre Turbo) | apache-2.0 | Hugging Face, 0 descargas |
| krea/Krea-2-Raw | Modelo de difusión texto-a-imagen completo | no aplica | no disponible | no disponible en la informacion | Hugging Face |
| krea/Krea-2-Turbo | Modelo de difusión texto-a-imagen destilado | Krea-2-Raw | 8 (`guidance_scale=0.0`) | no disponible en la informacion | Hugging Face |

No se dispone de datos para comparar con LoRA de identidad equivalentes sobre otros modelos (por ejemplo, adaptadores DreamBooth sobre SDXL o FLUX): la información proporcionada no incluye métricas ni referencias que permitan una comparación cuantitativa. Cualquier comparativa de calidad de identidad sería especulativa.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se publican dataset, hiperparámetros, rango del LoRA ni evaluación. La reproducibilidad es nula.
- Riesgo de suplantación de identidad: el adaptador reproduce un sujeto concreto. Si `sophiee0713` corresponde a una persona real, la generación de imágenes —especialmente las de contenido sexual explícito que aparecen en las muestras— puede constituir un deepfake no consentido y vulnerar derechos de imagen y protección de datos (RGPD en la UE).
- Contenido NSFW: los prompts de ejemplo incluyen desnudos. Requiere verificación de edad, etiquetado y control de acceso; puede incumplir las políticas de uso de plataformas y de proveedores de infraestructura.
- Licencia: el adaptador declara apache-2.0, pero la licencia del modelo base Krea-2-Raw no se detalla en la información disponible. El uso comercial del adaptador está condicionado por la licencia del base, que debe verificarse por separado.
- Alucinación visual: como todo modelo de difusión, puede producir anatomía incorrecta, manos deformadas, artefactos en el rostro y deriva de identidad en planos muy abiertos o con oclusiones.
- Sobreajuste probable: con pocas imágenes de entrenamiento, el adaptador puede "pegar" el fondo, la ropa o la iluminación de las muestras originales, reduciendo la variedad de composiciones.
- Sesgos: al derivar de un único sujeto, puede arrastrar sesgos de composición (tono de piel, complexión, edad) y reproducirlos en todas las generaciones.
- Idiomas: solo se validan prompts en inglés; el comportamiento con prompts en castellano no está documentado y puede degradar la adherencia al texto.
- Sin métricas de producción: 0 descargas y 0 likes implican ausencia de validación por terceros; no se recomienda su uso en pipelines críticos sin una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LaBandita/sophiee0713-v3
- Modelo base (RAW): https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo usada en las muestras: https://huggingface.co/krea/Krea-2-Turbo
- Resultados de la búsqueda web: no se ha encontrado ningún enlace técnico relevante (paper, blog, repositorio o demo) relacionado con el modelo; los resultados devueltos eran contenido para adultos sin relación con la ficha y se han descartado.
