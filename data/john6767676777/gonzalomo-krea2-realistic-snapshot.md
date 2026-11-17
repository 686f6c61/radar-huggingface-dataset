# john6767676777/gonzalomo-krea2-realistic-snapshot

## Resumen

GonzaLomo Krea 2 + Realistic Snapshot (merged) es un checkpoint de difusion texto-a-imagen publicado por el usuario john6767676777 en Hugging Face. Se trata de una fusión del modelo base Krea 2 Turbo (krea/krea-2-turbo) con dos derivados de la comunidad: el checkpoint GonzaLomo Krea 2 v4.0 en fp8 y el LoKr Realistic Snapshot Krea2 v1.0. El objetivo declarado es ofrecer un único fichero fp8 "todo en uno" que incorpore el efecto realista del LoKr sin necesidad de cargarlo por separado, ya que el LoKr original es un fichero LyCORIS de rango completo que algunos proveedores de inferencia no pueden cargar como LoRA.

El modelo se distribuye como un único fichero safetensors de aproximadamente 18,3 GB en precisión float8_e4m3fn, e incluye el codificador de texto Qwen3-VL y el VAE en el mismo archivo (formato AIO). La fusión se aplicó sobre 256 capas adaptadas con una fuerza de LoKr de 1,5, el valor recomendado por el autor del LoKr. El resto de tensores y la cabecera del fichero son idénticos byte a byte al fichero GonzaLomo AIO original.

Es relevante para quienes trabajan con Krea 2 Turbo en entornos que solo aceptan checkpoints monolíticos o que no soportan LoRAs LyCORIS, y para quienes quieren un pipeline simplificado de generación realista en 8 pasos sin CFG. No obstante, el repositorio no incluye información sobre arquitectura interna, datos de entrenamiento ni benchmarks, y la licencia es "other", lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion texto-a-imagen derivado de Krea 2 Turbo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (codificador de texto Qwen3-VL incluido en el checkpoint) |
| Tipos de cuantizacion | float8_e4m3fn (fp8) en el checkpoint publicado; no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | other (sujeta a las permisones de Civitai de los modelos de origen) |
| Formato de pesos | safetensors (checkpoint AIO con UNet/difusion, codificador Qwen3-VL y VAE) |

## Arquitectura y entrenamiento

El modelo es una fusión de pesos, no un entrenamiento desde cero. Parte de GonzaLomo Krea 2 v4.0 en fp8 AIO (fichero `gonzaLomoKrea2_v40_fp8_AIO.safetensors`, SHA-256 `b5e886b9acc32179e0ae7370d085b2a6f3607340d49e241b8853ddd004ea550b`) y le aplica el LoKr Realistic Snapshot Krea2 v1.0 (fichero `RealisticSnapshotKrea2V2.safetensors`, SHA-256 `bc064297da569e9f25fe362d8210b291093fad5fa4f59ea982fa4f7c4151e2bc`). La operación se realizó sobre 256 capas adaptadas según la fórmula `W' = SR_fp8(W + 1,5 · kron(lokr_w1, lokr_w2))`, donde `SR_fp8` es redondeo estocástico a float8_e4m3fn, el mismo método que emplea ComfyUI al parchear pesos fp8 con un LoRA.

La fuerza de LoKr aplicada es 1,5 con escala 1 (uso completo de `lokr_w1`/`lokr_w2`, como en ComfyUI/LyCORIS). Todos los demás tensores del checkpoint (el resto de pesos de difusión, el codificador de texto Qwen3-VL y el VAE) y la cabecera del fichero son idénticos byte a byte al fichero GonzaLomo AIO. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO, porque el modelo no se entrena en este paso: hereda las características del base Krea 2 Turbo y de los dos derivados fusionados.

## Capacidades

- Generación de imágenes realistas a partir de texto (text-to-image), con el estilo realista aportado por el LoKr Realistic Snapshot.
- Inferencia rápida en modo Turbo: alrededor de 8 pasos y sin CFG (classifier-free guidance), según las instrucciones del autor.
- Checkpoint monolítico "todo en uno": incluye pesos de difusión, codificador de texto Qwen3-VL y VAE en un único fichero safetensors.
- Compatibilidad con flujos que no pueden cargar LoRAs LyCORIS de rango completo, al estar el LoKr ya fusionado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking; es un modelo puramente generativo de imagen.
- Capacidades multilingües: no disponibles en la información proporcionada; el codificador Qwen3-VL podría aportar cobertura multilingüe, pero no se confirma para este checkpoint.

## Casos de uso

- Generación de retratos y fotografía realista sintética: el checkpoint incorpora el LoKr Realistic Snapshot, por lo que se puede usar directamente para producir imágenes con aspecto fotográfico sin cargar LoRAs adicionales, simplificando el pipeline.
- Prototipado rápido en ComfyUI: al ser un único fichero fp8 AIO compatible con el flujo de Krea 2 Turbo, permite montar un nodo de generación en 8 pasos sin CFG y sin gestión separada de LoRAs.
- Despliegue en proveedores de inferencia que solo aceptan checkpoints monolíticos: al estar el LoKr fusionado en los pesos, se evita el problema de que el proveedor no sepa cargar un fichero LyCORIS de rango completo.
- Creación de assets para previsualización de conceptos: útil para generar imágenes de referencia en estudios de diseño o narrativa visual, aprovechando la velocidad del modo Turbo.
- Pruebas de comparación de estilos: sirve como punto de partida para evaluar el efecto del LoKr Realistic Snapshot frente al modelo GonzaLomo sin fusionar, manteniendo el resto de pesos idénticos.
- Generación de contenido para audiencias adultas o sensibles: el repositorio está etiquetado como `not-for-all-audiences`, por lo que encaja en flujos creativos que requieran ese tipo de contenido, siempre que se cumplan las condiciones de licencia de los modelos de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 18,3 GB en fp8, por lo que se necesita al menos esa cantidad de VRAM para cargarlo completo; en la práctica, se recomienda un margen adicional para activaciones y el VAE.
- GPU recomendadas: no se especifican en la información disponible; por tamaño de checkpoint, encaja en GPUs con 24 GB o más (por ejemplo, RTX 4090, A100 40 GB, H100), aunque no se confirma oficialmente.
- ¿Cabe en GPU de consumo? Con 18,3 GB en fp8, sí es plausible en GPUs de 24 GB como la RTX 4090, pero no se documenta ni se garantiza; en GPUs de 16 GB o menos requeriría cuantizaciones adicionales no publicadas.
- Opciones de despliegue: el autor menciona ComfyUI como referencia de uso (método de parcheo fp8 con LoRA); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de imagen.
- Latencia y throughput estimados: no disponibles; el modo Turbo sugiere pocos pasos (alrededor de 8) y sin CFG, lo que reduce el coste frente a modelos no Turbo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GonzaLomo Krea 2 + Realistic Snapshot (merged) | no disponible | no disponible | no disponible | other | Hugging Face (0 descargas, 0 likes) |
| GonzaLomo Krea 2 v4.0 (base del merge) | no disponible | no disponible | no disponible | según Civitai | Civitai |
| Realistic Snapshot Krea2 v1.0 (LoKr fusionado) | no disponible | no disponible | no disponible | según Civitai | Civitai |
| Krea 2 Turbo (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (krea/krea-2-turbo) |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia "other": el uso comercial está sujeto a las permisones de Civitai de los modelos de origen (GonzaLomo Krea 2 y Realistic Snapshot); es necesario revisar ambas páginas antes de cualquier uso comercial.
- El repositorio está etiquetado como `not-for-all-audiences`, lo que implica contenido potencialmente sensible y restricciones de distribución en algunas plataformas.
- No se documentan sesgos conocidos, pero al ser un modelo de generación de imagen realista, puede reproducir sesgos de representación presentes en los datos de entrenamiento de los modelos de origen.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir detalles inconsistentes, anatomías incorrectas o texto ilegible en las imágenes.
- No se debe aplicar el LoRA Realistic Snapshot sobre este checkpoint, ya que ya está fusionado; hacerlo duplicaría el efecto y alteraría el resultado previsto.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni benchmarks publicados; la calidad y estabilidad del merge no están verificadas de forma independiente.
- El proceso de fusión usa redondeo estocástico a fp8, lo que puede introducir pequeñas diferencias numéricas respecto a aplicar el LoKr en precisión completa.
- No se documentan limitaciones de contexto ni de idioma, pero al no haber información sobre el codificador de texto en este checkpoint, no se puede garantizar el comportamiento multilingüe.

## Enlaces

- [Hugging Face: john6767676777/gonzalomo-krea2-realistic-snapshot](https://huggingface.co/john6767676777/gonzalomo-krea2-realistic-snapshot)
- [GonzaLomo Krea 2 en Civitai](https://civitai.com/models/2761943?modelVersionId=3245099)
- [Realistic Snapshot en Civitai](https://civitai.com/models/2268008?modelVersionId=3371723)
- [Modelo base Krea 2 Turbo en Hugging Face](https://huggingface.co/krea/krea-2-turbo)
