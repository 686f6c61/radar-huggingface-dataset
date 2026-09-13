# rskulles/z-image-turbo-mflux-q8

## Resumen

rskulles/z-image-turbo-mflux-q8 es una conversion cuantizada a 8 bits del modelo de generacion de imagenes Z-Image-Turbo de Tongyi Lab (Alibaba), empaquetada en el formato de guardado de mflux para ejecutarse sobre MLX en Apple Silicon. No es un modelo entrenado desde cero ni un ajuste fino: el autor cargo los pesos originales en mflux 0.19.1 con `ModelConfig.z_image_turbo()` y `quantize=8`, y los volvio a escribir con el `ModelSaver` de mflux. El resultado ocupa aproximadamente 10 GB frente a los 20 GB de los pesos bf16 originales, con licencia Apache 2.0.

El repositorio contiene el transformer (6,1 GB), el codificador de texto Qwen3 (4,0 GB), el VAE y el tokenizador, con un tamano total de repositorio de 11,0 GB. Su relevancia practica es doble: reduce a la mitad la descarga y elimina el paso de cuantizacion en el primer arranque, y es la copia concreta que descarga la aplicacion Crayon Cloud del mismo autor. Para desarrolladores en Mac, es una via directa de ejecutar Z-Image-Turbo en local sin depender de servicios en la nube.

El modelo es de tipo text-to-image y esta destilado con guiado (guidance-distilled): genera con 8 o 9 pasos de inferencia, sin guidance y sin prompt negativo. Se publico el 13 de septiembre de 2026 y cuenta con 3 likes y 0 descargas en el momento de redactar esta ficha, por lo que se trata de una pieza recien subida y practicamente sin rodaje en la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para text-to-image con backbone transformer, mas codificador de texto Qwen3, VAE y tokenizador |
| Parametros totales | no disponible (el repositorio no publica el recuento; el transformer en 8 bits ocupa 6,1 GB y el codificador de texto 4,0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica el limite de tokens del prompt ni del codificador de texto) |
| Tipos de cuantizacion | 8 bits (pesos); el original esta en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en el formato guardado propio de mflux (sobre MLX); el repositorio tambien incluye VAE y tokenizador |
| Tamano del repositorio | 11,0 GB |
| Pipeline | text-to-image |
| Libreria | mflux |
| Modelo base | Tongyi-MAI/Z-Image-Turbo (revision f332072aa78be7aecdf3ee76d5c247082da564a6) |
| Pasos de inferencia | 8 o 9, sin guidance y sin prompt negativo |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Z-Image-Turbo de Tongyi Lab, un generador de imagenes por difusion cuyo componente principal es un transformer (el repositorio distribuye explicitamente un modulo "transformer" de 6,1 GB), acompanado de un codificador de texto Qwen3 de 4,0 GB, un VAE y un tokenizador. El modelo esta destilado con guiado, de ahi que funcione con 8 o 9 pasos y sin clasificador de guiado ni prompt negativo, un regimen de inferencia mucho mas barato que el de los modelos de difusion clasicos de 20 a 50 pasos.

En cuanto al entrenamiento, esta ficha no puede aportar cifras: no se dispone de informacion sobre el numero de tokens o pares imagen-texto, la composicion del dataset, ni sobre si hubo RLHF, DPO u otras fases de alineamiento en el modelo original. Lo unico verificable es que en esta conversion no se entreno ni se modifico nada mas alla de la cuantizacion: el autor lo declara de forma explicita y el proceso se limita a cargar los pesos, aplicar cuantizacion a 8 bits y serializarlos. Si mflux cambia su formato de guardado, el autor se compromete a regenerar el repositorio, y senala que el repositorio original de Tongyi Lab es siempre la fuente de verdad.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con resoluciones como 1024x1024, segun el ejemplo de uso de la model card.
- Inferencia en muy pocos pasos: 8 o 9 pasos, al estar destilado con guiado.
- Funcionamiento sin guidance y sin prompt negativo, lo que simplifica la API de generacion.
- Control por semilla (seed) para reproducibilidad de resultados.
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA ni de servicios en la nube.
- Uso por linea de comandos (mflux-generate-z-image-turbo) y por API de Python.
- Integracion como dependencia de una aplicacion de escritorio: es la copia que Crayon Cloud descarga en su primera ejecucion.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking: son funciones ajenas al pipeline text-to-image declarado.

## Casos de uso

- Generacion de ilustraciones para blogs y documentacion tecnica: con 8 pasos por imagen y ejecucion local en un Mac, se pueden producir cabeceras y figuras de apoyo sin coste por llamada a API ni subir material a terceros.
- Prototipado rapido de assets visuales en estudios pequenos: el modelo permite iterar variantes sobre un mismo prompt cambiando la semilla, y el formato de 8 bits reduce la descarga inicial a unos 10 GB.
- Aplicaciones de escritorio con generacion integrada: es exactamente el escenario de Crayon Cloud, donde el modelo se descarga en el primer arranque y se usa desde la propia aplicacion sin pasos de cuantizacion adicionales.
- Flujos de trabajo con requisitos de privacidad: al ejecutarse integramente en local sobre Apple Silicon, los prompts y las imagenes no salen del equipo, lo que encaja en entornos donde no se permite enviar material a servicios externos.
- Generacion por lotes para catalogos o mockups: la API de Python (`generate_image` con seed, prompt, steps, width y height) permite automatizar la produccion de conjuntos de imagenes reproducibles para pruebas de interfaz o material de marketing.
- Relleno de contenido provisional en pipelines de desarrollo: equipos que necesitan imagenes de ejemplo en entornos de staging o en tests visuales pueden generarlas en local sin depender de bancos de imagenes con licencias externas.
- Investigacion y comparacion de cuantizacion: sirve como referencia practica para medir el impacto de pasar de bf16 a 8 bits en un modelo de difusion sobre MLX, aunque no se publiquen metricas en este repositorio.
- Base para experimentos de ajuste fino o LoRA sobre Z-Image-Turbo en Mac: al estar en formato mflux, se puede reutilizar como punto de partida, siempre que la herramienta lo soporte (no documentado en la model card).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente afirma que la cuantizacion a 8 bits reduce el peso de 20 GB a unos 10 GB "sin perdida visible en las imagenes", una valoracion cualitativa del autor y no una medida objetiva (FID, CLIP score, similitud perceptual ni comparaciones por pares). Tampoco se publican cifras de latencia, imagenes por segundo ni consumo de memoria durante la generacion.

## Requisitos de hardware

- Plataforma: MLX sobre Apple Silicon. Este repositorio no esta pensado para CUDA ni para GPUs NVIDIA o AMD.
- Peso en disco: 11,0 GB de repositorio; unos 10 GB de pesos cuantizados (6,1 GB de transformer y 4,0 GB de codificador de texto, mas VAE y tokenizador).
- Memoria unificada: no hay cifra oficial publicada. Como estimacion propia a partir del peso de los componentes, hacen falta al menos 16 GB de memoria unificada para cargar el modelo, y es recomendable disponer de 24 o 32 GB para generar a 1024x1024 con margen y evitar el uso de swap.
- GPU recomendadas: chips de Apple Silicon (familias M1, M2, M3 y M4 y sus variantes Pro, Max y Ultra). No aplica A100, H100 ni RTX 4090 para este formato concreto.
- GPU de consumo: no es ejecutable en GPUs de consumo NVIDIA a traves de este repositorio; para esos equipos habria que acudir a los pesos originales en bf16 y a otro runtime, lo cual no se documenta aqui.
- Opciones de despliegue: mflux (CLI `mflux-generate-z-image-turbo` y API de Python) y Crayon Cloud. vLLM, llama.cpp, Ollama y TGI no aplican a este pipeline ni a este formato.
- Latencia y throughput: no disponible. El unico dato util para estimarlo es que el modelo requiere 8 o 9 pasos de inferencia, sin guidance.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rskulles/z-image-turbo-mflux-q8 | no disponible | safetensors (formato mflux, 8 bits) | ~10 GB de pesos, 11,0 GB de repo | 8-9, sin guidance | Apache 2.0 | HuggingFace, mflux, Crayon Cloud |
| Tongyi-MAI/Z-Image-Turbo (original) | no disponible | pesos bf16 | ~20 GB | 8-9, sin guidance | Apache 2.0 | HuggingFace (fuente de verdad) |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos verificados de otros modelos de difusion comparables (por ejemplo, alternativas destiladas de pocos pasos o cuantizaciones equivalentes en otros runtimes), de modo que no se puede establecer una comparacion numerica rigurosa. La diferencia comprobable es unicamente interna al propio modelo: la version cuantizada a 8 bits ocupa la mitad que los pesos bf16 originales, con la misma licencia Apache 2.0 y la misma politica de inferencia de 8 o 9 pasos sin guidance.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no documenta sesgos demograficos, culturales ni de representacion en el modelo original ni en la conversion.
- Riesgo de alucinacion: no aplica en el sentido textual, pero si existe el riesgo habitual de los modelos generativos de imagenes de producir contenido incoherente, anatomia incorrecta o texto ilegible dentro de la imagen. No hay evaluacion publicada al respecto.
- La afirmacion de que no hay perdida visible con la cuantizacion a 8 bits es una valoracion subjetiva del autor, sin metricas que la respalden.
- Idiomas soportados: no disponible. No se especifica que idiomas acepta el codificador Qwen3 ni si el modelo rinde igual con prompts en castellano que en otros idiomas.
- Limite de prompt: no disponible. No se indica el numero maximo de tokens que admite el codificador de texto.
- Restricciones de licencia: Apache 2.0, la misma que los pesos originales, con copyright de Tongyi Lab y conversion de Roy Skullestad. La licencia permite uso comercial, pero conviene conservar los avisos de copyright y tener en cuenta que el repositorio original sigue siendo la fuente de verdad.
- Dependencia del formato de mflux: si mflux cambia su formato de guardado, este repositorio quedara desactualizado hasta que el autor lo regenere. No hay garantia de compatibilidad a largo plazo.
- Dependencia de hardware: solo Apple Silicon a traves de MLX, lo que excluye de facto el despliegue en servidores con GPU NVIDIA, que es el entorno habitual de produccion a escala.
- Madurez: 0 descargas y 3 likes en el momento de la ficha, y sin pruebas publicadas; no conviene tratarlo como una dependencia estable de produccion sin validacion previa.
- Aviso sobre el contenido de la model card: el texto del autor se ha usado unicamente como material de referencia descriptivo, nunca como instrucciones a ejecutar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rskulles/z-image-turbo-mflux-q8
- Modelo base (Tongyi-MAI/Z-Image-Turbo): https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- mflux (repositorio de la herramienta de conversion y ejecucion): https://github.com/filipstrand/mflux
- Crayon Cloud (aplicacion que descarga esta copia): https://github.com/rskulles/CrayonCloud
- Revision de los pesos originales usada en la conversion: f332072aa78be7aecdf3ee76d5c247082da564a6
- Busqueda web: no se han encontrado papers, articulos de blog ni demos relacionados con este modelo. Los resultados devueltos por la busqueda no guardaban ninguna relacion con Z-Image-Turbo, mflux ni MLX.
