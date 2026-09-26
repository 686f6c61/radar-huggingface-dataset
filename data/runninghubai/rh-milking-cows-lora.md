# RunningHubAI/rh-milking-cows-lora

## Resumen

rh-milking-cows-lora es un adaptador LoRA publicado por RunningHubAI en Hugging Face, pensado para el modelo de generación de vídeo WAN 2.2 I2V de 14B parámetros (variantes HighNoise y LowNoise). No se trata de un modelo de lenguaje ni de un modelo completo: es un conjunto de pesos de ajuste fino de bajo rango que se carga sobre un pipeline de image-to-video en ComfyUI, RunningHub o Hugging Face para modificar el estilo y el contenido de los vídeos generados. El repositorio ocupa 0,3 GB e incluye dos archivos safetensors de 146 MiB cada uno, uno por cada experto del modelo base.

El adaptador está firmado por el usuario de RunningHub @氛围感 y se distribuye a través de la cuenta RunningHubAI. Según la model card, deriva de WAN 2.2 en sus dos variantes de ruido, y el enlace original apunta a una ficha de Civitai con temática de contenido para adultos. No se declara licencia concreta, idiomas soportados, pipeline ni resultados de evaluación.

Su relevancia ahora es limitada y muy específica: ilustra el flujo típico de publicación de LoRAs de vídeo en plataformas como RunningHub, donde el autor entrena un adaptador y la plataforma lo redistribuye con soporte de API. Al no tener descargas ni valoraciones y carecer de benchmarks, debe considerarse un artefacto sin validación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptación de bajo rango) sobre un transformer de difusión (DiT) de vídeo. Modelo base: WAN 2.2 I2V 14B, con dos expertos, HighNoise y LowNoise |
| Parametros totales | No disponible. El repositorio no declara rango, alpha ni número de parámetros entrenados; los pesos ocupan 146 MiB por archivo |
| Parametros activos | No aplicable al adaptador. Del modelo base no se especifica nada en el repositorio |
| Longitud de contexto | No aplicable (modelo de difusión de vídeo, no de texto). No disponible |
| Tipos de cuantizacion | No disponible para el LoRA. Los pesos se publican en safetensors en su precisión nativa; la cuantización se aplica al modelo base (p. ej. fp8 o GGUF en ComfyUI) |
| Idiomas soportados | No disponible. El prompt se introduce como texto, pero no se declara soporte idiomático |
| Licencia | No disponible. La model card indica que se publica en nombre del autor, que los derechos siguen siendo suyos y que debe seguirse la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`Wan 2.2 I2V l4ct5t11n_high_noise.safetensors` y `Wan 2.2 I2V l4ct5t11n_low_noise.safetensors`, 146 MiB cada uno) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha declarada de creacion | 2026-09-25 (segun la ficha de Hugging Face) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, una descomposición de bajo rango que se inyecta en las capas del modelo base sin modificar sus pesos originales. Se distribuye en dos ficheros separados porque WAN 2.2 I2V emplea un esquema de dos expertos: uno especializado en las fases de alto ruido del proceso de denoising y otro en las de bajo ruido. Cada fichero se carga en su etapa correspondiente del sampler en ComfyUI. El repositorio no detalla el rango, el alpha, el optimizador ni la configuración de entrenamiento.

No hay información sobre el conjunto de datos, el número de pasos de entrenamiento, el uso de regularización, ni si hubo etapas de ajuste por preferencias humanas (RLHF/DPO). Tampoco se documentan innovaciones técnicas propias. La model card únicamente indica que el modelo se ha ajustado a partir de WAN 2.2 (HighNoise) y WAN 2.2 (LowNoise), y remite a un enlace externo de Civitai para consultar los prompts.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video) mediante el pipeline WAN 2.2 I2V, con el LoRA aplicado en las dos etapas de ruido.
- Modificación de estilo y contenido temático sobre el comportamiento del modelo base, no de sus capacidades estructurales.
- Integración en ComfyUI como nodo de carga de LoRA, con dos ficheros que deben cargarse en los samplers de alto y bajo ruido.
- Ejecución vía la plataforma RunningHub, que ofrece despliegue online y acceso por API.
- Compatibilidad con los flujos estándar de vídeo del modelo base (resolución, número de fotogramas y duración quedan determinados por WAN 2.2, no por el LoRA).
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, código ni visión más allá del propio pipeline de vídeo.
- No se declara soporte multilingüe explícito.

## Casos de uso

- Producción de vídeo corto para adultos: el LoRA se aplicaría sobre WAN 2.2 I2V en un pipeline de image-to-video para generar clips temáticos a partir de imágenes fijas, siempre en plataformas con verificación de edad y cumplimiento legal de la jurisdicción correspondiente.
- Integración en flujos ComfyUI existentes: un estudio que ya tenga montado WAN 2.2 I2V puede añadir el adaptador cargando el fichero de alto ruido en el primer sampler y el de bajo ruido en el segundo, sin reentrenar ni sustituir el modelo base.
- Automatización vía API de RunningHub: el modelo se puede invocar desde un servicio externo usando la API de la plataforma, lo que permite encadenar generaciones por lotes desde un backend propio.
- Investigación sobre adaptación de bajo rango en modelos de difusión de vídeo: sirve como ejemplo práctico de cómo un LoRA de 146 MiB por experto modifica el comportamiento de un DiT de gran tamaño sin tocar los pesos originales.
- Pruebas de moderación y red teaming: útil para evaluar si los filtros de contenido de una plataforma detectan y bloquean material para adultos generado con adaptadores de terceros.
- Evaluación comparativa de infraestructura: permite medir latencia y consumo de VRAM de un pipeline I2V de 14B con dos pasadas de experto, útil para dimensionar GPUs en producción.
- Reproducción de estilo: para autores que quieran replicar un estilo visual concreto en vídeo sin reentrenar un modelo completo, el coste de almacenamiento y de cómputo del adaptador es mínimo frente al del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas objetivas (FVD, CLIP score, SSIM ni comparativas humanas) ni tampoco datos de latencia o throughput específicos del adaptador.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas referidas al modelo base WAN 2.2 I2V de 14B; el repositorio no publica requisitos propios.

- VRAM del LoRA: despreciable en comparación con el modelo base (146 MiB por experto, unos 0,3 GB en total).
- Modelo base en fp16: en torno a 27-28 GB solo para el experto activo, y bastante más si se mantienen ambos expertos residentes en memoria.
- Modelo base en fp8: aproximadamente 14-15 GB por experto, lo que exige offloading secuencial en GPUs de 24 GB.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S 48 GB permiten mantener el pipeline sin offloading agresivo.
- GPU de consumo: una RTX 4090 (24 GB) puede ejecutar el pipeline con cuantización fp8 o GGUF y descarga secuencial de expertos; tarjetas de 16 GB o menos requerirán cuantizaciones más agresivas y tiempos de generación altos.
- Alternativa ligera: la variante WAN 2.2 TI2V-5B del mismo ecosistema está pensada para GPUs de consumo con 8-12 GB, aunque este LoRA está entrenado para la variante de 14B y no es directamente aplicable a ella.
- Opciones de despliegue: ComfyUI con los nodos nativos de WAN 2.2, ComfyUI con nodos GGUF para pesos cuantizados, y la propia plataforma RunningHub mediante su interfaz web o su API.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-milking-cows-lora | LoRA sobre WAN 2.2 I2V 14B | No declarados (146 MiB por experto) | No disponible | No disponible | Hugging Face y RunningHub |
| WAN 2.2 I2V 14B (modelo base, sin adaptador) | DiT de difusion con dos expertos | MoE, variante de 14B (no detallado en este repositorio) | No disponible en este repositorio | La del proyecto Wan upstream | Hugging Face y repositorios oficiales |
| Milking a Cow (2.0) | LoRA tematico de la misma plataforma | No disponibles | No disponible | No disponible | RunningHub (ID 2078458419119665153) |
| Otros LoRAs de RunningHubAI | Adaptadores LoRA diversos | No disponibles | No disponible | No disponible | Hugging Face (cuenta RunningHubAI) |

La comparación cuantitativa no es posible: ninguno de los adaptadores alternativos publica parámetros, licencia ni métricas.

## Limitaciones y advertencias

- Contenido para adultos: el enlace original de Civitai y el propio nombre del adaptador apuntan a material NSFW. Su uso en producción exige verificación de edad, cumplimiento normativo y políticas de contenido acordes con la jurisdicción.
- Licencia sin definir: la model card no concede una licencia explícita y remite a la del proyecto original. Esto genera incertidumbre jurídica para uso comercial, por lo que conviene contactar con el autor o con RunningHub antes de desplegarlo.
- Ausencia total de validación pública: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni demos.
- Dependencia estricta del modelo base: el adaptador solo funciona sobre WAN 2.2 I2V 14B y requiere cargar cada fichero en su etapa de ruido correspondiente; un uso incorrecto degrada la calidad o directamente no produce efecto.
- Riesgo de artefactos y sesgos heredados: al ser un ajuste de bajo rango, arrastra los sesgos, las alucinaciones visuales y las limitaciones de coherencia temporal del modelo base, sin que el repositorio documente mitigaciones.
- Metadatos inconsistentes: la fecha de creación declarada (2026-09-25) es posterior a la fecha actual, lo que sugiere un posible error de catalogación en la ficha.
- Sin garantías de soporte: el repositorio no incluye documentación de prompts, configuración de sampler, escalas de LoRA recomendadas ni resolución de referencia.
- Riesgo de moderación en plataformas: los servicios que alojan este tipo de adaptadores pueden retirar el contenido o restringir la cuenta sin previo aviso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-milking-cows-lora
- README en chino (referenciado en la model card): README_cn.md (mismo repositorio)
- Ficha original en RunningHub: https://www.runninghub.ai/model/public/2077556541464895490
- Variante "Milking a Cow (2.0)" en RunningHub: https://www.runninghub.ai/model/public/2078458419119665153
- Modelo de origen en Civitai: https://civitai.red/models/2781437/wan-22-i2v-14b-lactation?modelVersionId=3132833
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Plataforma RunningHub: https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentación de la API: https://www.runninghub.cn/runninghub-api-doc-en/
- Formación de modelos en RunningHub: https://www.runninghub.ai/page-model
- Cuenta de RunningHubAI en Hugging Face: https://huggingface.co/RunningHubAI
