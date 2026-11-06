# OlliOcto/Flux-NSFW-uncensored

## Resumen

Flux-NSFW-uncensored es un ajuste fino (fine-tune) mediante LoRA del modelo de generación de imágenes FLUX.1-dev, desarrollado por Black Forest Labs. Lo publica el usuario OlliOcto en Hugging Face con el objetivo declarado de minimizar las restricciones de censura del modelo base y permitir la exploración de los límites técnicos de la generación de imágenes con IA. El repositorio tiene un tamaño de 0,7 GB, lo que es coherente con un adaptador LoRA más que con un modelo completo.

El modelo se distribuye bajo licencia CreativeML OpenRAIL-M, heredada del ecosistema de difusión, e incluye la etiqueta `not-for-all-audiences`, lo que indica contenido para adultos. Está etiquetado únicamente para inglés (`en`) y su pipeline es `text-to-image`. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, por lo que se trata de una publicación reciente y sin validación comunitaria.

La relevancia de esta ficha es fundamentalmente técnica y de evaluación: documenta un caso de fine-tune no oficial sobre FLUX.1-dev orientado a eliminar el filtrado de contenido, con información pública muy limitada sobre dataset de entrenamiento, hiperparámetros o resultados. No se dispone de datos de benchmarks ni de especificaciones detalladas más allá de las que figuran en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (fine-tune LoRA sobre FLUX.1-dev; arquitectura del base: transformer de difusión con flow matching, no confirmada en la informacion proporcionada) |
| Parametros totales | No disponible (el repositorio ocupa 0,7 GB, compatible con un adaptador LoRA; el modelo base FLUX.1-dev tiene 12 000 millones de parametros segun informacion publica de Black Forest Labs, no verificada en esta ficha) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo text-to-image; no hay ventana de contexto de texto) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el codigo de ejemplo usa float16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (adaptador LoRA: `lora.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) sobre FLUX.1-dev, el modelo de difusión texto-a-imagen de Black Forest Labs. La model card no especifica la arquitectura interna del adaptador (rango, alpha, módulos objetivo) ni los detalles del proceso de entrenamiento: no se indica el número de pasos, el dataset utilizado, la composición del corpus de imágenes, ni si hubo técnicas de regularización o de mitigación de olvido catastrófico. Tampoco se documenta si se empleó RLHF, DPO o cualquier otro método de alineación; en el contexto de un fine-tune orientado a eliminar censura, lo habitual es el ajuste supervisado sobre pares imagen-texto, pero esto no se confirma en la información disponible.

El código de ejemplo de la model card presenta una particularidad relevante: carga los pesos LoRA desde el identificador `Heartsync/Flux-NSFW-uncensored`, no desde `OlliOcto/Flux-NSFW-uncensored`. Esto sugiere que el adaptador podría proceder de otro repositorio o que el autor ha reutilizado el código de una publicación previa. El ejemplo también emplea `torch.float16` en lugar de `bfloat16` y `AutoPipelineForText2Image` de la librería `diffusers`, con `guidance_scale=7.0`, `num_inference_steps=28` y resolución de 1024x1024. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras) más allá de las que ya incorpora FLUX.1-dev.

## Capacidades

- Generación de imágenes a partir de descripciones textuales en inglés, con resolución de 1024x1024 en el ejemplo publicado.
- Soporte de *negative prompt* para excluir elementos no deseados (texto, marcas de agua, estilos cartoon, baja calidad).
- Control de la generación mediante semilla (`generator.manual_seed`) para reproducibilidad.
- Ajuste de la adherencia al prompt mediante `guidance_scale` y de la calidad/tiempo mediante `num_inference_steps`.
- Orientación declarada a reducir las restricciones de censura del modelo base, permitiendo contenido para adultos.
- No se documentan capacidades de *tool calling*, agentes, razonamiento multi-paso, visión, audio ni *thinking mode*; son capacidades ajenas a un modelo text-to-image.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma.

## Casos de uso

- Investigación sobre filtrado y censura en modelos generativos: el modelo permite estudiar empíricamente dónde se sitúan los límites de los filtros de contenido de FLUX.1-dev y cómo responde el modelo base a *prompts* que normalmente se bloquean, en un entorno controlado de laboratorio.
- Evaluación de robustez de sistemas de moderación: sirve como generador adversario para probar clasificadores de contenido para adultos y validar su tasa de detección.
- Creación artística para adultos: ilustración de contenido para plataformas con verificación de edad, usando *prompts* detallados con estilos fotográficos (el ejemplo emplea Canon EOS R5, 85mm f/1.2, golden hour).
- Prototipado de pipelines de difusión con LoRA: el ejemplo de código con `diffusers` y `peft` sirve como plantilla para integrar adaptadores LoRA en flujos de generación de imágenes.
- Estudio de olvido catastrófico y deriva estilística: comparar las salidas del adaptador con las de FLUX.1-dev para medir cuánto se degrada la calidad o la diversidad tras el fine-tune.
- Docencia y formación técnica: ilustrar el funcionamiento de LoRA sobre modelos de difusión y las implicaciones éticas de los fine-tunes sin alineación.
- Generación de imágenes para entornos *offline* y de investigación: al ser un adaptador pequeño (0,7 GB), puede desplegarse junto al modelo base en máquinas con GPU de gama alta para experimentación local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,7 GB, pero requiere cargar el modelo base FLUX.1-dev completo para la inferencia.
- VRAM estimada: no disponible en la información proporcionada. Como referencia del ecosistema FLUX.1-dev, la inferencia en float16 requiere del orden de 24 GB de VRAM o más, y existen variantes cuantizadas que reducen el requisito; estas cifras no están confirmadas en la información de este repositorio.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del modelo base, se requieren GPU de gama alta (A100, H100, RTX 4090 o similares); no se confirma compatibilidad con GPU de consumo de gama media.
- Cabe en GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: el ejemplo oficial usa `diffusers` con `AutoPipelineForText2Image` y `peft` para cargar el LoRA. No se documentan opciones como ComfyUI, Automatic1111, vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OlliOcto/Flux-NSFW-uncensored | LoRA sobre FLUX.1-dev | No disponible (repo 0,7 GB) | No aplica | CreativeML OpenRAIL-M | Hugging Face, 0 descargas |
| black-forest-labs/FLUX.1-dev | Modelo base text-to-image | 12 000 M (dato público del autor, no verificado aquí) | No aplica | FLUX.1-dev Non-Commercial License | Hugging Face, ampliamente usado |
| Otras variantes NSFW de FLUX | LoRA/fine-tune | No disponible | No aplica | Variable | No disponible |
| Otros modelos text-to-image abiertos (p. ej., Stable Diffusion) | Difusión | No disponible en esta ficha | No aplica | CreativeML OpenRAIL-M en varias versiones | Amplia disponibilidad |

No se dispone de datos de rendimiento comparativo para este adaptador concreto; la comparación se limita a tipo de artefacto, licencia y disponibilidad.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado `not-for-all-audiences` y su finalidad declarada es reducir la censura; no debe desplegarse en productos accesibles a menores ni sin verificación de edad.
- Licencia: CreativeML OpenRAIL-M incluye restricciones de uso (cláusulas de uso aceptable) que prohíben determinados fines, como la generación de contenido ilegal o de explotación; el uso comercial está permitido bajo condiciones, pero debe revisarse la licencia completa. Además, el modelo base FLUX.1-dev tiene su propia licencia no comercial, lo que puede generar conflicto o ambigüedad legal al combinar ambos artefactos.
- Idiomas: solo inglés; los *prompts* en otros idiomas pueden degradar la calidad.
- Sesgos: no documentados por el autor; los modelos de difusión entrenados con datos web suelen reproducir sesgos de género, etnia y cuerpo, y un fine-tune sin alineación puede acentuarlos.
- Alucinación visual: como todo modelo generativo, puede producir imágenes incoherentes (anatomía incorrecta, texto ilegible, artefactos) pese al *negative prompt*.
- Documentación insuficiente: no se detallan dataset, hiperparámetros, rango del LoRA ni evaluación; la reproducibilidad es baja.
- Inconsistencia en el ejemplo: el código carga `Heartsync/Flux-NSFW-uncensored` en lugar del repositorio del autor, lo que puede provocar errores o cargar pesos distintos a los esperados.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de calidad ni de seguridad.
- Riesgo de deriva: al ser un fine-tune no documentado, puede degradar la calidad general de FLUX.1-dev en *prompts* no relacionados con el contenido para el que fue ajustado.

## Enlaces

- Hugging Face: https://huggingface.co/OlliOcto/Flux-NSFW-uncensored
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Repositorio referenciado en el código de ejemplo: https://huggingface.co/Heartsync/Flux-NSFW-uncensored
- Librería diffusers: https://github.com/huggingface/diffusers
- Librería peft: https://github.com/huggingface/peft
