# quantilimited/Xenon-1-Turbo

## Resumen

Xenon-1 Turbo es uno de los cuatro niveles (Lite, Turbo, Prime, Apex) de la familia Xenon-1, un conjunto de modelos propietarios publicados por Crystal IDE en Hugging Face bajo acceso restringido (gated) y licencia cerrada. A diferencia de los otros niveles, Turbo no incluye un componente de expansion de prompt y se define como un pipeline de text-to-3D que encadena FLUX.1-schnell para la generacion de imagen y TRELLIS.2-4B para la conversion de imagen a malla 3D. No se trata, por tanto, de un modelo de lenguaje monolitico, sino de una orquestacion de modelos de terceros descargados desde sus repositorios originales.

La relevancia de esta ficha es doble. Por un lado, documenta un caso poco habitual en Hugging Face: un "modelo" que en realidad es un pipeline compuesto, con pesos que no se redistribuyen y dependencias externas sujetas a sus propias licencias. Por otro, la licencia Xenon-1 Model Family License prohibe explicitamente el uso comercial, la redistribucion, la publicacion de derivados y el entrenamiento de modelos competidores, lo que condiciona cualquier evaluacion practica.

La informacion publica disponible es muy limitada: la model card no declara numero de parametros, longitud de contexto, idiomas soportados ni resultados de benchmarks. Los datos tecnicos que se pueden afirmar con certeza se limitan a los componentes del pipeline y a las condiciones legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline compuesto: text-to-image (FLUX.1-schnell) + image-to-3D (TRELLIS.2-4B); sin componente de expansion de prompt en este nivel |
| Parametros totales | no disponible (depende de los componentes: TRELLIS.2-4B declara ~4B; FLUX.1-schnell no se especifica en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Xenon-1 Model Family License v1.0 (cerrada, no comercial, acceso gated con aprobacion manual) |
| Formato de pesos | no disponible (los pesos de los componentes no se redistribuyen en este repositorio) |

## Arquitectura y entrenamiento

Xenon-1 Turbo no es un transformer entrenado de forma end-to-end, sino un pipeline de dos etapas. La primera etapa es FLUX.1-schnell, un modelo de difusion text-to-image de la familia FLUX, empleado aqui sin etapa previa de expansion de prompt (a diferencia de Lite, Prime y Apex, que incorporan Qwen3-VL en distintas variantes). La segunda etapa es TRELLIS.2-4B, un modelo de image-to-3D de aproximadamente 4.000 millones de parametros que genera la malla o representacion 3D final.

La model card indica que Xenon-1 descarga estos modelos desde sus propios repositorios de Hugging Face y no los redistribuye; cada componente mantiene su licencia original. No se proporciona informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas propias del pipeline. La model card incluye ademas una nota interna de plantilla ("Before uploading: replace YOUR_HF_ORG...") que sugiere que el documento no ha sido completamente finalizado por el autor.

## Capacidades

- Generacion de imagenes a partir de texto mediante FLUX.1-schnell, orientada a velocidad de inferencia (variante "schnell" de la familia FLUX).
- Conversion de imagen a geometria 3D mediante TRELLIS.2-4B, con salida en formato de malla o representacion 3D.
- Pipeline text-to-3D de extremo a extremo: el usuario proporciona un prompt textual y obtiene un activo 3D.
- Ausencia de expansion de prompt: el prompt del usuario se pasa directamente al modelo de imagen, sin reescritura ni enriquecimiento por un VLM.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no documentadas mas alla del pipeline descrito.

## Casos de uso

- Prototipado rapido de activos 3D para videojuegos o experiencias interactivas: a partir de un prompt textual se obtiene una malla preliminar que sirve como base para retopologia y texturizado manual posterior.
- Previsualizacion conceptual en diseno de producto: generar variaciones 3D rapidas de un objeto descrito en texto para discutir direccion artistica antes de modelar en detalle.
- Creacion de assets para entornos de realidad virtual o aumentada en fase de bloqueo (blockout), donde la fidelidad geometrica no es critica y prima la velocidad de iteracion.
- Generacion de props para escenas de animacion o storyboards 3D: el pipeline permite producir bocetos volumetricos de objetos de atrezo sin modelado manual.
- Evaluacion interna de pipelines text-to-3D: util para equipos que comparan la calidad de FLUX.1-schnell + TRELLIS.2-4B frente a otras combinaciones (por ejemplo, SDXL + TRELLIS o Qwen-Image + TRELLIS en los niveles Lite y Prime).
- Docencia e investigacion no comercial en generacion 3D: la licencia permite uso academico, lo que facilita experimentos controlados sobre calidad de mallas generadas a partir de texto.
- Generacion de maquetas 3D para impresion en contextos educativos o de hobby, siempre que se respete la restriccion de no uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de malla (Chamfer distance, F-score, CLIP score), tiempos de inferencia ni comparaciones cuantitativas con otros pipelines text-to-3D.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, FLUX.1-schnell requiere tipicamente entre 12 y 24 GB de VRAM en funcion de la precision y el tamaño de imagen, y TRELLIS.2-4B, al tratarse de un modelo de ~4B parametros, anade varios GB adicionales; el total del pipeline puede situarse por encima de los 24 GB en configuraciones sin cuantizar. Estos valores son estimaciones generales de los componentes y no cifras publicadas por Crystal IDE.
- GPU recomendadas: no especificadas por el autor. Por el perfil de los componentes, serian razonables GPUs de 24 GB o mas (RTX 3090, RTX 4090, A6000, L40S, A100, H100) para ejecutar el pipeline completo sin cuantizacion agresiva.
- Compatibilidad con GPU de consumo: probable en GPUs de 24 GB con cuantizacion o precision reducida, aunque no confirmado por el autor.
- Opciones de despliegue: no documentadas. El autor solo autoriza la descarga desde el repositorio oficial de Hugging Face o mediante la aplicacion STRATA; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas, por otra parte, orientadas a modelos de lenguaje y no a pipelines de difusion/3D).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| Xenon-1 Turbo | Pipeline text-to-3D (FLUX.1-schnell + TRELLIS.2-4B) | no disponible (TRELLIS ~4B) | no aplica / no disponible | Xenon-1 Model Family License (cerrada, no comercial) | Gated con aprobacion manual |
| Xenon-1 Lite | Pipeline text-to-3D (Qwen3-VL-4B + SDXL 1.0 + TRELLIS.2-4B) | no disponible | no disponible | Xenon-1 Model Family License | Gated |
| Xenon-1 Prime | Pipeline text-to-3D (Qwen3-VL-8B + Qwen-Image + TRELLIS.2-4B) | no disponible | no disponible | Xenon-1 Model Family License | Gated |
| Xenon-1 Apex | Pipeline text-to-3D (Qwen3-VL-30B-A3B + Qwen-Image-2512 + TRELLIS.2-4B) | no disponible | no disponible | Xenon-1 Model Family License | Gated |

No se dispone de informacion sobre modelos externos directamente comparables en rendimiento, ya que no se han publicado benchmarks del pipeline. La comparacion con los otros niveles de la propia familia se limita a los componentes declarados en la model card.

## Limitaciones y advertencias

- Licencia cerrada y no comercial: el uso comercial requiere un acuerdo escrito firmado con Crystal IDE; solicitarlo no otorga derechos.
- Prohibiciones explicitas: no se permite redistribuir, alojar, vender, alquilar ni ofrecer el modelo como servicio; tampoco distribuir fine-tunes, versiones cuantizadas u otros derivados.
- Canales autorizados restringidos: solo el repositorio oficial de Hugging Face y la aplicacion STRATA; cualquier copia obtenida por otra via no esta licenciada.
- Acceso gated con aprobacion manual e intransferible: cada usuario debe solicitar acceso por separado y no puede compartir los archivos.
- Prohibicion de uso de salidas para entrenar modelos competidores.
- Dependencias de terceros: FLUX.1-schnell y TRELLIS.2-4B mantienen sus propias licencias; la model card advierte que las variantes FLUX [dev] no son Apache 2.0 y quedan excluidas del aviso de terceros.
- Ausencia de datos tecnicos verificables: no se declaran parametros totales, contexto, idiomas ni cuantizaciones, lo que dificulta la evaluacion previa.
- Riesgo de alucinacion y sesgos: no documentado por el autor; al tratarse de generacion visual y 3D, los riesgos tipicos incluyen geometrias fisicamente imposibles, artefactos en mallas y sesgos heredados de los datasets de FLUX.1-schnell y TRELLIS.2-4B.
- Model card incompleta: contiene instrucciones de plantilla sin sustituir, lo que sugiere que la documentacion puede cambiar y no debe tratarse como definitiva.
- Sin benchmarks publicados: no es posible comparar su calidad frente a alternativas de forma objetiva.

## Enlaces

- Repositorio oficial en Hugging Face: https://huggingface.co/quantilimited/Xenon-1-Turbo
- Licencia Xenon-1 Model Family License: https://huggingface.co/quantilimited/Xenon-1-Model-Family-License/blob/main/XENON-1-MODEL-LICENSE.md (enlace tal como aparece en la model card)
- Contacto para licencias comerciales: support@crystal-ide.co.uk
- Repositorios de los otros niveles de la familia: quantilimited/Xenon-1-Lite, quantilimited/Xenon-1-Prime, quantilimited/Xenon-1-Apex
- Componentes referenciados (repositorios propios de cada modelo): FLUX.1-schnell y TRELLIS.2-4B en Hugging Face (no se proporcionan URLs concretas en la informacion disponible)
