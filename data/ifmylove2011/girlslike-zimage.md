# ifmylove2011/girlslike-zimage

## Resumen

girlslike-zimage es un adaptador LoRA/LoKR de tipo text-to-image publicado por el usuario ifmylove2011 en Hugging Face. No se trata de un modelo fundacional, sino de un conjunto de pesos de ajuste fino (adapters) entrenados sobre los modelos base Tongyi-MAI/Z-Image y Tongyi-MAI/Z-Image-Turbo, ambos desarrollados por Tongyi MAI (Alibaba). Su proposito declarado es la generacion de retratos de personas concretas a partir de su nombre como palabra de activacion, con un enfoque explicito de prueba y experimentacion personal.

El adaptador se distribuye en dos variantes segun el modelo base empleado en el entrenamiento: los sufijos "zi" corresponden a entrenamiento sobre Z-Image base (implementados como LoKR de rango completo) y los sufijos "zit" a entrenamiento sobre Z-Image Turbo. Segun el autor, los adaptadores "zi" funcionan tanto con base como con turbo, mientras que los "zit" solo son utilizables con turbo. El repositorio ocupa 8,1 GB y utiliza la libreria diffusers con licencia Apache 2.0.

La relevancia de esta ficha es acotada: se trata de un recurso de la comunidad orientado a la personalizacion de identidades en generacion de imagenes, con 28.746 descargas y 67 likes en el momento de la consulta. Su interes tecnico radica en documentar el flujo de entrenamiento LoKR sobre modelos de difusion Z-Image y las particularidades de compatibilidad entre variantes base y turbo, mas que en capacidades generales de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/LoKR sobre modelo de difusion Z-Image (text-to-image) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (el autor menciona uso con BF16 en los ejemplos) |
| Idiomas soportados | no disponible (prompts de ejemplo en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio diffusers; el autor cita BF16) |

## Arquitectura y entrenamiento

El adaptador se construye sobre los modelos de difusion Z-Image y Z-Image-Turbo de Tongyi-MAI. La variante "zi" emplea LoKR (Kronecker-factorized low-rank adaptation) de rango completo, una eleccion que el autor justifica por la ausencia de un esquema generico viable para entrenar sobre Z-Image base. La variante "zit" se entrena sobre Z-Image Turbo. No se especifican en la informacion disponible el numero de imagenes de entrenamiento, la composicion del dataset, el numero de pasos ni si se aplicaron tecnicas de regularizacion o DPO.

El autor documenta un comportamiento diferencial entre ambas variantes: los adaptadores "zi" usados sobre turbo conservan en mayor medida la textura propia del modelo turbo (por una supuesta menor "contaminacion" de la parte de bajo ruido del modelo base) y logran mejor similitud de identidad en planos medios y lejanos, mientras que en primeros planos el resultado es mas plano. Se advierte que la compatibilidad general es dudosa y que persisten problemas anatomicos, atribuidos a deficiencias del propio modelo base que se trasladan al entrenamiento.

## Capacidades

- Generacion de imagenes text-to-image de retratos de personas concretas mediante palabras de activacion basadas en el nombre real o en un trigger especifico.
- Control de similitud de identidad mediante el peso del adaptador (rango recomendado de 0,5 a 1,5; el autor desaconseja superar 1,5).
- Compatibilidad cruzada parcial: los adaptadores "zi" operan sobre Z-Image base y Z-Image Turbo; los "zit" solo sobre Turbo.
- Soporte de prompts en chino en los ejemplos documentados.
- Ajuste de estilo y calidad mediante parametros del sampler (pasos, scheduler, CFG, shift) segun las recomendaciones del autor.
- No dispone de tool calling, razonamiento multi-paso, vision ni audio: es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Generacion de retratos de referencia para pruebas de concepto: el adaptador permite fijar una identidad concreta mediante trigger y evaluar como se comporta el modelo base en distintas composiciones, util para validar pipelines antes de invertir en entrenamientos propios.
- Experimentacion con LoKR sobre modelos de difusion: sirve como caso documentado de entrenamiento de rango completo sobre Z-Image base, con notas del autor sobre pesos, pasos y samplers que pueden orientar a otros investigadores.
- Pruebas de compatibilidad base/turbo: permite comparar como un mismo adaptador se comporta al aplicarse sobre Z-Image base frente a Z-Image Turbo, un escenario relevante para estudiar la transferencia entre variantes destiladas y no destiladas.
- Ilustracion editorial ficticia con identidad consistente: en proyectos creativos donde se requiere mantener un personaje a lo largo de varias imagenes, el adaptador ofrece consistencia de rostro en planos medios y lejanos, con la cautela de revisar primeros planos.
- Generacion de imagenes de referencia para diseno de personajes: combinado con prompts descriptivos en chino, puede producir variaciones de vestuario y encuadre manteniendo el rostro, util en fases de preproduccion.
- Evaluacion de sesgos y calidad anatomica en modelos de difusion: dado que el autor reporta problemas anatomicos persistentes, el adaptador puede emplearse en auditorias internas de calidad de generacion de figuras humanas.
- Docencia y divulgacion sobre adapters: como ejemplo practico de LoRA/LoKR con licencia Apache 2.0 y pesos publicos, sirve para explicar el flujo de entrenamiento y despliegue de adaptadores en diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 8,1 GB y los ejemplos se generan con Z-Image Turbo en BF16, lo que implica requisitos propios del modelo base completo, no solo del adaptador.
- GPU recomendadas: no disponibles en la informacion proporcionada. El uso en BF16 sugiere GPUs con al menos 16-24 GB de VRAM para el modelo base, aunque este dato no se confirma en la model card.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base Z-Image/Turbo, no del adaptador.
- Opciones de despliegue: libreria diffusers (declarada en la model card); el autor menciona nodos de ComfyUI como ModelSamplingAuraFlow, lo que indica soporte en flujos de ComfyUI. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles. El autor indica que 4 pasos son初步amente utilizables y que mas de 10 pasos no aportan beneficio apreciable con Z-Image Turbo, y que CFG fuera del rango 0,7-1 incrementa el tiempo de generacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| girlslike-zimage | Adaptador LoRA/LoKR sobre Z-Image | no disponible | no aplica | Apache 2.0 | Hugging Face (diffusers) |
| Tongyi-MAI/Z-Image | Modelo base text-to-image | no disponible en la informacion | no aplica | no disponible en la informacion | Hugging Face |
| Tongyi-MAI/Z-Image-Turbo | Modelo base text-to-image destilado | no disponible en la informacion | no aplica | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks ni de otros adaptadores comparables en la informacion proporcionada que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El propio autor advierte que el adaptador es para pruebas y no debe usarse para suplantacion, engano u otros fines inapropiados.
- Persisten problemas anatomicos en las figuras generadas, heredados del modelo base y agravados por el entrenamiento.
- La compatibilidad entre variantes es limitada: los adaptadores "zit" solo funcionan con Turbo y los "zi" muestran comportamiento desigual segun el modelo base.
- El modelo base Z-Image Turbo puede generar personas reales directamente por nombre, lo que plantea riesgos de identidad y requiere cautela en el uso.
- Algunos nombres ya estan presentes en el dataset del modelo base, lo que obliga a usar triggers especificos y puede provocar confusiones de identidad.
- La licencia Apache 2.0 del adaptador no exime de las condiciones de uso del modelo base Z-Image, que deben verificarse por separado.
- No hay informacion sobre sesgos demograficos, idiomas soportados ni evaluaciones de seguridad.
- La documentacion esta mayoritariamente en chino y las recomendaciones de parametros (pasos, CFG, shift) son empiricas y no validadas con metricas objetivas.
- El repositorio incluye ejemplos con personas reales; su uso comercial o la generacion de contenido con identidades ajenas puede tener implicaciones legales segun la jurisdiccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ifmylove2011/girlslike-zimage
- Modelo base Z-Image: https://huggingface.co/Tongyi-MAI/Z-Image
- Modelo base Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Galeria de la serie girlslike (Space): https://huggingface.co/spaces/ifmylove2011/girlslike_lora_gallery
- Codigo de la galeria: https://huggingface.co/spaces/ifmylove2011/girlslike_lora_gallery/blob/main/app.py
- Fuente de prompts citada por el autor (Civitai): https://civitai.com/models/2231696
