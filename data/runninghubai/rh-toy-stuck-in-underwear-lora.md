# RunningHubAI/rh-toy-stuck-in-underwear-lora

## Resumen

`rh-toy-stuck-in-underwear-lora` es un adaptador LoRA para edición de imagen (pipeline `image-text-to-image`) publicado por RunningHubAI en Hugging Face, derivado del modelo base denominado "krea2" según la model card. No es un modelo de lenguaje: es un peso adicional de 218 MiB en formato `safetensors` que se carga junto al modelo de difusión base para modificar su comportamiento generativo en un dominio muy concreto. El repositorio declara uso previsto en ComfyUI, en la propia plataforma RunningHub y en Hugging Face.

Su relevancia práctica es limitada y muy específica: se trata de un LoRA de nicho, orientado a contenido para adultos, con 0 descargas y 0 likes en el momento de la ficha, licencia no declarada y sin documentación técnica sobre rango, alpha, dataset o palabras de activación. Esto lo convierte en un caso de estudio de la cadena de publicación automatizada de RunningHub (subida de adaptadores con model card generada y enlaces cruzados a su API) más que en una pieza reutilizable para producción.

La información disponible no permite evaluar calidad, sesgos ni rendimiento: no hay benchmarks, no se especifica la arquitectura del modelo base ni el proceso de entrenamiento. Cualquier decisión de uso debería partir de una validación empírica propia y de una revisión legal del contenido y de la licencia upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (bajo rango) sobre un modelo base de difusión para edición de imagen, identificado en la model card como "krea2"; no se detalla la arquitectura interna del base |
| Parametros totales | No disponible (adaptador de 218 MiB; el número de parámetros y el rango/alpha no se publican) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; al ser un modelo de imagen no se documenta ventana de contexto textual |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en `safetensors` y la precisión de carga depende del nodo o cargador de ComfyUI y del modelo base |
| Idiomas soportados | No disponible; el idioma de los prompts lo determina el codificador de texto del modelo base, no el LoRA |
| Licencia | No disponible; publicado por RunningHub en nombre del autor, copyright del autor, con indicación de seguir la licencia del proyecto original o upstream |
| Formato de pesos | `safetensors` (`pantyhose_vaginal_insert.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

La información publicada describe únicamente un adaptador LoRA de edición de imagen afinado a partir de "krea2". No se detalla el rango del adaptador, el valor de alpha, el número de pasos de entrenamiento, el tamaño o la composición del dataset, ni si se aplicaron técnicas de regularización o de captions específicos. Tampoco se documenta qué módulos del modelo base se adaptan (atención, cross-attention, MLP) ni si el adaptador está pensado para condicionamiento por texto, por imagen de referencia o por ambos.

El entrenamiento se realizó, según la model card, en la infraestructura de RunningHub, que ofrece servicio de entrenamiento de modelos. El repositorio incluye un README en chino (`README_cn.md`) y enlaces a la página del modelo original en RunningHub, así como al modelo de referencia en Civitai. No hay paper, informe técnico ni notas de entrenamiento asociadas.

## Capacidades

- Edición y generación de imágenes condicionada por texto dentro de ComfyUI, cargando el adaptador junto al modelo base "krea2".
- Modificación de una imagen de entrada según el dominio específico para el que fue entrenado el LoRA (contenido para adultos).
- Integración en flujos de trabajo de ComfyUI mediante nodos de carga de LoRA estándar.
- Ejecución en la plataforma RunningHub y a través de su API, según los enlaces de la model card.
- Compatibilidad declarada con Hugging Face como repositorio de distribución de pesos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo "thinking"; no aplican a este tipo de modelo.
- Cobertura multilingüe: no documentada; depende del codificador de texto del base.

## Casos de uso

- Pruebas de concepto de edición de imagen en ComfyUI: cargar el LoRA sobre el base "krea2" para verificar la canalización completa (carga de pesos, prompt, sampler, decodificación VAE) antes de invertir en adaptadores documentados.
- Investigación sobre publicación automatizada de adaptadores: el repositorio es un ejemplo de model card generada por plataforma, con enlaces cruzados a API y a la ficha del autor, útil para estudiar trazabilidad y metadatos en ecosistemas de modelos.
- Auditoría de contenido y moderación: analizar qué tipo de adaptadores se publican sin licencia ni documentación permite diseñar políticas de filtrado y de etiquetado en repositorios y marketplaces.
- Evaluación de riesgos de la cadena de suministro de pesos: sirve como muestra para probar escáneres de `safetensors`, verificación de hashes y detección de contenido no declarado antes de desplegar modelos de terceros.
- Docencia sobre LoRA: en un entorno controlado y con audiencia adulta, ilustra cómo un adaptador de bajo rango modifica el comportamiento de un modelo de difusión sin reentrenar el base.
- Producción de contenido para adultos con revisión legal previa: únicamente si se aclara la licencia upstream y se cumplen los requisitos de edad, consentimiento y normativa aplicable; el adaptador está orientado a ese nicho.
- Integración vía API de RunningHub: automatizar la generación desde un servicio externo usando los endpoints documentados, siempre que el caso de uso esté permitido por los términos de la plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de FID, CLIP score, similitud de identidad ni evaluaciones humanas en la model card, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que tampoco hay evidencia de uso comunitario.

## Requisitos de hardware

- VRAM del adaptador: despreciable; 218 MiB en disco y una fracción similar al cargarse en memoria.
- VRAM total: la determina el modelo base "krea2", cuyo tamaño no se documenta. Como referencia orientativa, no confirmada para este caso, un modelo de difusión de la clase FLUX en `bf16` suele requerir del orden de 16-24 GB de VRAM para inferencia completa, y 8-12 GB con cuantizaciones de 8 bits o GGUF.
- GPU recomendadas: no disponibles para este adaptador concreto; para el base, según la estimación anterior, GPUs de 24 GB (RTX 4090, L4, A10G) o superiores (A100 40/80 GB, H100) si se busca margen y throughput.
- GPU de consumo: probablemente viable en RTX 3090/4090 (24 GB) con el base en precisión reducida; en tarjetas de 8-12 GB solo con cuantización agresiva del base. No verificado.
- Opciones de despliegue: ComfyUI (vía declarada), plataforma RunningHub y su API; para el base, los cargadores habituales del ecosistema de difusión. No se documenta soporte en vLLM, TGI, llama.cpp ni Ollama, que no aplican a modelos de imagen de este tipo.
- Latencia y throughput: no disponibles; dependen por completo del base, del sampler, del número de pasos y de la resolución.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| `RunningHubAI/rh-toy-stuck-in-underwear-lora` | LoRA de edición de imagen sobre "krea2" | No disponible (218 MiB) | No aplica | No disponible | Hugging Face, RunningHub | 0 descargas, 0 likes, sin documentación técnica |
| Modelo original en Civitai (ID 2817764, versión 3178200) | LoRA de edición de imagen | No disponible | No aplica | No disponible | Civitai | Fuente citada en la model card; misma temática |
| Otros LoRA de la misma familia publicados por RunningHubAI | LoRA de edición de imagen | No disponible | No aplica | No disponible | Hugging Face, RunningHub | Mismo patrón de model card generada y enlaces a API |
| Adaptadores LoRA genéricos sobre modelos de difusión abiertos (p. ej. FLUX) | LoRA | No disponible | No aplica | Variables (Apache-2.0, no comercial, etc.) | Hugging Face, Civitai | Ecosistema amplio, con documentación y benchmarks habitualmente ausentes |

No se dispone de datos verificables de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Contenido para adultos: el adaptador está entrenado para una temática sexual explícita; requiere control de edad, consentimiento y cumplimiento normativo en cualquier despliegue.
- Licencia no disponible: la model card indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o upstream, pero no se identifica cuál es. El uso comercial es jurídicamente incierto.
- Ausencia total de documentación técnica: sin rango, alpha, dataset, pasos de entrenamiento, palabras de activación ni instrucciones de uso más allá de "cargar en RunningHub".
- Riesgo de sobreajuste y de artefactos: al no haber ejemplos ni evaluaciones, no puede estimarse la fidelidad del adaptador ni su tendencia a deformar la imagen fuera del dominio entrenado.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir anatomías inconsistentes, texto ilegible y detalles incoherentes, especialmente en resoluciones altas o composiciones complejas.
- Dependencia del base "krea2": sin acceso al modelo base en las condiciones correctas, el adaptador puede no funcionar o degradar la calidad; no se especifica la versión exacta del base.
- Idiomas no documentados: la eficacia de los prompts en castellano no está verificada y depende del codificador de texto del base.
- Trazabilidad: el repositorio se publicó y actualizó con un minuto de diferencia, sin historial de versiones, y el nombre del fichero de pesos no coincide con el nombre del modelo.
- Sin evidencia de uso: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad.
- Posible contenido no deseado en el dataset de entrenamiento: no se documenta la procedencia de las imágenes, lo que impide verificar derechos y consentimiento.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-toy-stuck-in-underwear-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2082485100687761410
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Fuente citada en Civitai: https://civitai.red/models/2817764/dildo-under-panties-toy-insertion-through-fabric?modelVersionId=3178200
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-toy-stuck-in-underwear-lora/blob/main/README_cn.md
