# OpenMOSS-Team/MOSS-Image-Base

## Resumen

MOSS-Image-Base es el modelo base de generación de imágenes a partir de texto de la familia MOSS-Image, desarrollado por el equipo OpenMOSS. Se distribuye como un modelo de difusión de arquitectura DiT (diffusion transformer) con alrededor de 5.082 millones de parámetros (5,08 B), pesos en safetensors y licencia Apache 2.0. Su rasgo diferencial no es solo la calidad visual, sino el renderizado de texto dentro de la imagen: admite instrucciones en lenguaje natural, secuencias de etiquetas y layouts en JSON para controlar la colocación del texto y la disposición de los objetos.

El modelo está pensado para escenarios donde la tipografía importa: carteles, pizarras, etiquetas de producto, notas manuscritas o infografías con jerarquía textual. La familia se publica en dos variantes, MOSS-Image-Base (este repositorio) y MOSS-Image-SFT, donde la versión ajustada con supervisión produce agrupaciones de texto más claras y composiciones más ordenadas en ejemplos comparativos publicados por el propio equipo. Soporta prompts en inglés y chino, lo que lo hace útil para creatividades bilingües o localizadas.

Su relevancia actual radica en dos factores: es uno de los pocos modelos abiertos de generación de imagen con licencia Apache 2.0 y un tamaño moderado (frente a alternativas de 12 B o más), y ya cuenta con integración en `diffusers` mediante el custom pipeline `MOSSImagePipeline`, plugin nativo para ComfyUI y una demo en Hugging Face Spaces. El repositorio ocupa 27,2 GB e incluye un VAE basado en el decodificador small de FLUX.2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con formulación flow-matching |
| Parámetros totales | 5.082.308.624 (~5,08 B, dato de safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se documentan cuantizaciones oficiales; los pesos se distribuyen en precisión completa (bfloat16 para transformer y text encoder, float32 para VAE) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato `diffusers`) |
| Pipeline | text-to-image |
| Tamaño del repositorio | 27,2 GB |
| Sampler por defecto | Flow-matching Euler, 50 pasos, CFG 3, shift 5 |
| Resoluciones | Múltiplos positivos de 16 en el API de Python (ejemplo documentado: 1024x1024) |
| Versiones mínimas | Python 3.10+, PyTorch 2.9+, diffusers 0.38+, transformers 5.3+, accelerate 1.10+, safetensors 0.6+, Pillow 10+ |

## Arquitectura y entrenamiento

MOSS-Image-Base es un transformer de difusión que sigue el paradigma flow-matching, con un muestreador Euler y un `shift` de 5. El pipeline por defecto aplica *layer skipping* en la rama negativa (índice de capa 22, base cero) para ahorrar cómputo, y usa CFG 3 con prompt negativo vacío; esto implica dos pasadas del transformer por paso. El VAE incluido es el decodificador small de FLUX.2. El transformer y el text encoder operan en bfloat16, mientras que el VAE y el ruido inicial se mantienen en float32, algo que el ejemplo oficial refleja pasando un diccionario de dtypes a `from_pretrained`.

El modelo se publica como checkpoint base (pre-SFT) y admite tres modos de condicionamiento del layout: lenguaje natural, secuencias de etiquetas y layouts en JSON que fijan la posición del texto y la disposición de los objetos. El equipo mantiene además una variante SFT (MOSS-Image-SFT) que, según la comparativa publicada en la model card, mejora la agrupación del texto y la organización del layout. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se detalla el text encoder concreto más allá del requisito de `transformers>=5.3`.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con prompts en lenguaje natural.
- Renderizado de texto de alta fidelidad dentro de la imagen, incluido texto manuscrito y caracteres chinos, como muestra el ejemplo de la nota adhesiva en la nevera.
- Control de layout mediante JSON, permitiendo especificar colocación de texto y disposición de objetos.
- Condicionamiento mediante secuencias de etiquetas, alternativa a los prompts en lenguaje natural.
- Soporte bilingüe de prompts: inglés y chino.
- Integración con `diffusers` a través del custom pipeline `MOSSImagePipeline` con `trust_remote_code=True`.
- Integración con ComfyUI mediante plugin nativo instalable desde ComfyUI Manager (la inclusión en el repositorio oficial está en curso).
- Interfaz Gradio de referencia, con opciones de CPU offload y compilación documentadas en el repositorio del proyecto.
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo de difusión, no un LLM.

## Casos de uso

- Carteles y pósters con tipografía integrada: el modelo renderiza titulares y textos secundarios dentro de la composición, por lo que sirve para generar bocetos de cartelería donde el texto es parte del diseño y no un añadido posterior en un editor.
- Etiquetado de producto en e-commerce: permite generar mockups de envases, botes o cajas con nombres de marca y textos legales escritos sobre el propio objeto, útil para validar conceptos antes de producir arte final.
- Material educativo e infografías: con el control de layout por JSON se puede fijar dónde aparece cada bloque de texto, lo que facilita diagramas, pizarras y láminas explicativas con estructura predecible.
- Localización de creatividades entre inglés y chino: al soportar ambos idiomas en el prompt y en el texto renderizado, se pueden producir versiones de una misma campaña para ambos mercados manteniendo la composición.
- Ilustración editorial y storyboards: sustituye bocetos manuales en fases tempranas de proyectos que requieren escenas con rótulos, señales o notas manuscritas coherentes con la narrativa.
- Generación de datasets sintéticos: para entrenar modelos de OCR, detección de texto en escena o document understanding, el modelo puede producir imágenes con texto controlado (idioma, contenido y posición) mediante layouts JSON, reduciendo la dependencia de datos reales etiquetados.
- Prototipado dentro de ComfyUI: al existir plugin nativo y workflow de ejemplo, se integra en grafos de diseño iterativo donde se encadena con upscalers, reencuadres o postprocesado.
- Pruebas de concepto en desarrollo de producto: la demo en Spaces y el pipeline de `diffusers` permiten validar ideas visuales en pocos pasos sin montar infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIPScore, GenEval, OCR accuracy u otras) ni comparaciones numéricas con modelos de la competencia; únicamente presenta comparativas visuales cualitativas entre MOSS-Image-Base y MOSS-Image-SFT.

## Requisitos de hardware

- El repositorio completo ocupa 27,2 GB, por lo que se necesita espacio en disco acorde además del almacenamiento de la caché de Hugging Face.
- VRAM estimada: no documentada oficialmente. Como referencia, los 5,08 B de parámetros en bfloat16 suponen en torno a 10 GB solo para los pesos, a lo que hay que sumar el text encoder y el VAE en float32; en la práctica hay que contar con decenas de GB si se carga todo en GPU sin optimizaciones.
- GPU recomendadas: A100 (40 GB o 80 GB) y H100 para inferencia desatendida a resolución 1024x1024; RTX 4090 o RTX 3090 (24 GB) con CPU offload activado.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con CPU offload; en tarjetas de 12-16 GB la viabilidad no está documentada y probablemente exija offload agresivo o cuantización no oficial.
- Opciones de despliegue: `diffusers` con el custom pipeline `MOSSImagePipeline`, plugin nativo de ComfyUI, interfaz Gradio del proyecto y `torch.compile` según el quick start del repositorio. vLLM, llama.cpp, Ollama y TGI no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles. El coste por imagen depende de los 50 pasos por defecto y del hecho de que el guidance estándar ejecuta dos forwards del transformer por paso; puede reducirse pasando `uncond_skip_layers=[]` solo si se desea desactivar el salto de capa, o usando un prompt negativo explícito.
- Nota de seguridad: el uso del pipeline requiere `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio; conviene fijar una revisión concreta en entornos de producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de prompt | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| MOSS-Image-Base | ~5,08 B | No disponible | Apache 2.0 | Hugging Face, ModelScope, ComfyUI | DiT con renderizado de texto y layout JSON |
| MOSS-Image-SFT | No disponible | No disponible | Apache 2.0 (según repositorio del proyecto) | Hugging Face, ModelScope | Variante ajustada con SFT del mismo modelo base |
| Otras familias abiertas de text-to-image (por ejemplo, variantes DiT de tamaño medio) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

No se incluyen cifras de parámetros, contexto o rendimiento de modelos competidores porque la información proporcionada no las contiene y no deben inferirse. Para una comparación rigurosa conviene consultar el informe técnico enlazado más abajo, que puede contener comparativas que no forman parte de esta ficha.

## Limitaciones y advertencias

- Es un checkpoint base, no ajustado: la propia model card muestra que MOSS-Image-SFT ofrece agrupaciones de texto más claras y layouts más ordenados. Para producción con texto denso, el modelo base puede no ser la mejor opción.
- Riesgo de errores tipográficos y de alucinación de texto: en escenas con mucho texto o caracteres chinos complejos, es esperable que aparezcan caracteres deformados o palabras inventadas; no hay métricas publicadas de precisión de OCR.
- Cobertura de idiomas limitada a inglés y chino según los metadatos del repositorio; no hay evidencia de buen rendimiento en castellano ni en otras lenguas.
- Sesgos: no se documenta la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos demográficos, culturales o estéticos. Se desconoce si existe filtrado de contenido o mitigaciones de seguridad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia. Es una de las licencias más permisivas del sector, pero conviene revisar las licencias de los componentes de terceros incorporados (por ejemplo, el decodificador VAE derivado de FLUX.2) antes de un despliegue comercial.
- Restricción de resolución: las dimensiones deben ser múltiplos positivos de 16 en el API de Python.
- Dependencia de código remoto: el pipeline personalizado exige `trust_remote_code=True`, lo que añade superficie de riesgo en despliegues automatizados.
- Coste computacional: los ajustes por defecto implican 50 pasos y dos forwards del transformer por paso, lo que duplica el coste respecto a configuraciones con guidance desactivado.
- Sin soporte documentado de edición de imagen, inpainting, img2img o control por imagen de referencia en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Variante SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio oficial en GitHub: https://github.com/OpenMOSS/MOSS-Image
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Página del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe técnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- Guía de usuario (inglés): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guía de usuario (chino): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Documentación de ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Workflow de ejemplo para ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/moss-image/example_workflows/moss-image.json
- Modelo en ModelScope: https://modelscope.cn/models/openmoss/MOSS-Image-Base
- Cuenta de X del equipo: https://x.com/Open_MOSS
