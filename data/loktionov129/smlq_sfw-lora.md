# loktionov129/smlq_sfw.lora

## Resumen

smlq_sfw es un LoRA de difusión para generación de imágenes de texto a imagen, desarrollado por el usuario loktionov129 y publicado en Hugging Face. Se trata de un adaptador de bajo rango entrenado sobre el modelo base Krea-2-Raw de Krea AI, orientado a la generación de un personaje femenino consistente con identidad facial fija, lo que se conoce habitualmente como LoRA de consistencia facial o de influencer virtual. El adaptador se activa mediante el token de instancia `smlq_sfw` y permite reproducir un rostro y una fisonomía concretos a través de múltiples prompts y estilos.

El modelo resuelve el problema de la consistencia de personaje en pipelines de generación de imágenes: sin un adaptador de este tipo, cada generación produce un rostro distinto, lo que impide construir narrativas visuales, catálogos o contenido de marca con un personaje estable. Al estar entrenado con ai-toolkit y empaquetado para diffusers y ComfyUI, se integra en flujos de trabajo de generación locales y en servicios de inferencia basados en difusión.

La relevancia del modelo es limitada y específica: no es un modelo fundacional sino un adaptador de nicho, con 293 descargas, sin likes y con licencia unlicense, lo que lo sitúa en el ámbito del contenido generado por aficionados más que en el de herramientas de producción empresarial. Su interés técnico reside en el uso de un modelo base turbo (Krea-2-Turbo) y en la técnica de entrenamiento de LoRA para identidad facial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión text-to-image Krea-2-Raw |
| Parametros totales | no disponible (el repo ocupa 1,4 GB, pero no se desglosa el número de parámetros del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusión; la ventana relevante es la longitud del prompt de texto) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en formato de pesos de difusión; las cuantizaciones dependen del modelo base y del runtime) |
| Idiomas soportados | en (inglés) |
| Licencia | unlicense |
| Formato de pesos | safetensors (formato estándar de diffusers para LoRA; el repo es de 1,4 GB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de difusión, es decir, un conjunto de matrices de bajo rango inyectadas en las capas de atención y proyección del modelo base Krea-2-Raw, que permanece congelado durante el entrenamiento. El entrenamiento se realizó con ai-toolkit, una herramienta de la comunidad para el ajuste fino de modelos de difusión, y el resultado se empaqueta en formato compatible con la librería diffusers y con ComfyUI. El token de instancia `smlq_sfw` activa la identidad del personaje en el prompt.

La información disponible no detalla el número de pasos de entrenamiento, el tamaño del dataset ni la composición exacta del mismo; únicamente se referencia el dataset `loktionov129/smlq_sfw.dataset`. Tampoco se especifica si se aplicaron técnicas de regularización, aumentación de datos o ajuste de la tasa de aprendizaje. El modelo base Krea-2-Raw pertenece a la familia Krea-2, que incluye una variante turbo orientada a inferencia rápida; el adaptador está pensado para funcionar con esa familia, aunque la model card no documenta los parámetros de muestreo recomendados (CFG, pasos, scheduler).

## Capacidades

- Generación de imágenes de texto a imagen con un personaje femenino de identidad facial consistente, activado mediante el token `smlq_sfw`.
- Reproducción de rasgos físicos detallados: forma de rostro, ojos, cejas, nariz, labios, pecas, marcas de belleza, piercings y complexión, según la descripción de la model card.
- Control de estilismo y vestuario: el adaptador permite cambiar ropa, peinado y accesorios manteniendo el rostro, como demuestran los ejemplos con estética techwear y gótica.
- Integración con ComfyUI y diffusers para pipelines de generación por nodos o por código.
- Compatibilidad con prompts en inglés; no se documenta soporte multilingüe.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo; es un modelo exclusivamente de imagen.

## Casos de uso

- Creación de influencer virtual: el adaptador permite generar un personaje con rostro estable a lo largo de múltiples publicaciones, manteniendo la identidad visual en distintos escenarios y estilos, lo que es útil para cuentas de marca o proyectos de contenido sintético.
- Ilustración de narrativas seriadas: cómics, storyboards o novelas visuales que requieren el mismo personaje en viñetas distintas; el token de instancia garantiza la coherencia facial entre generaciones.
- Pruebas de concepto de vestuario: un estudio de diseño puede generar al mismo personaje con distintas prendas y peinados para evaluar combinaciones antes de producir imágenes finales.
- Generación de material promocional para proyectos personales: avatares, banners y piezas gráficas con un personaje reconocible, siempre que se respete la licencia y las políticas de contenido de la plataforma de destino.
- Investigación sobre consistencia de identidad en difusión: el LoRA sirve como caso de estudio para medir la fidelidad facial y la deriva de identidad bajo cambios de prompt, semilla y estilismo.
- Prototipado rápido en ComfyUI: integración en grafos de nodos para experimentar con control de pose, iluminación y fondo manteniendo el personaje, gracias a la compatibilidad declarada con ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para el adaptador; depende del modelo base Krea-2-Raw y de la resolución de generación. Como referencia general, los modelos de difusión de la familia Krea-2 requieren GPUs con al menos 8-12 GB de VRAM en cuantizaciones agresivas y 16-24 GB para precisión completa, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible en la documentación; por categoría de modelo, se suelen emplear RTX 3090, RTX 4090, A100 o H100 para difusión a resolución alta.
- Compatibilidad con GPU de consumo: probable en GPUs con 8 GB o más si se emplean cuantizaciones del modelo base, pero no confirmado por el autor.
- Opciones de despliegue: diffusers (librería declarada), ComfyUI (tag explícito) y, por extensión, runtimes que soporten LoRA de difusión en formato safetensors; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smlq_sfw (loktionov129) | LoRA de identidad facial | Krea-2-Raw | no aplica | unlicense | Hugging Face, 293 descargas |
| LoRA de personaje sobre SDXL | LoRA de identidad facial | SDXL | no aplica | variable según autor | Amplia en Civitai y Hugging Face |
| LoRA de personaje sobre Flux | LoRA de identidad facial | Flux.1 | no aplica | variable según autor | Amplia en Hugging Face |
| Krea-2-Raw (modelo base) | Difusión text-to-image | propio | no aplica | según Krea AI | Hugging Face |

La comparación se limita a la categoría funcional, ya que no se dispone de métricas de fidelidad facial ni de benchmarks cuantitativos para este adaptador. Frente a los LoRA de personaje sobre SDXL o Flux, la diferencia principal es el modelo base: Krea-2-Raw es menos extendido en la comunidad que SDXL o Flux, lo que reduce la disponibilidad de herramientas, guías y ecosistema de nodos compatibles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; como todo modelo de difusión entrenado con datos de un personaje concreto, puede reproducir sesgos de representación corporal y estética presentes en el dataset.
- Riesgo de alucinación visual: el adaptador puede generar rasgos inconsistentes cuando el prompt se aleja de la descripción canónica del personaje, especialmente en ángulos extremos, oclusiones o estilos muy estilizados.
- Limitaciones de idioma: la model card declara únicamente inglés; los prompts en otros idiomas pueden degradar la fidelidad del personaje.
- Restricciones de licencia: la licencia unlicense implica dominio público según el autor, pero el modelo base Krea-2-Raw tiene su propia licencia que puede imponer condiciones adicionales al uso comercial; es responsabilidad del usuario verificar la licencia del modelo base.
- Contenido sensible: la model card incluye descripciones de contenido sugestivo y el nombre del adaptador contiene el sufijo "sfw", lo que sugiere que el autor pretende limitar el contenido explícito; no obstante, no se documentan filtros ni salvaguardas técnicas.
- Caveat para producción: con 293 descargas, 0 likes y sin benchmarks, el adaptador no tiene validación comunitaria suficiente para considerarse estable en entornos de producción; se recomienda evaluar la fidelidad facial con un conjunto de pruebas propio antes de desplegarlo.
- Dependencia del modelo base: cualquier cambio o retirada de Krea-2-Raw afecta directamente a la reproducibilidad del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/loktionov129/smlq_sfw.lora
- Dataset: https://huggingface.co/datasets/loktionov129/smlq_sfw.dataset
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- ai-toolkit: no disponible en la información proporcionada
- ComfyUI: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
