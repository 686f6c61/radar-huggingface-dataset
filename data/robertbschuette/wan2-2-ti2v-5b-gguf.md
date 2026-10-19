# robertbschuette/Wan2.2-TI2V-5B-GGUF

## Resumen

Wan2.2-TI2V-5B-GGUF es una conversión al formato GGUF del modelo Wan-AI/Wan2.2-TI2V-5B, un modelo de difusión para generación de vídeo a partir de texto (text-to-video) que también admite entrada de imagen (ti2v, text+image-to-video). La conversión la ha publicado el usuario robertbschuette en HuggingFace, no el equipo que desarrolló el modelo original, y su propósito es permitir la ejecución del modelo en ComfyUI mediante el nodo personalizado ComfyUI-GGUF de city96.

El modelo base cuenta con 4.999.787.712 parámetros (aproximadamente 5.000 millones), según los pesos en safetensors del repositorio original, y se distribuye bajo licencia Apache 2.0. Los idiomas declarados para los prompts son inglés y chino. El repositorio GGUF ocupa 45,4 GB, lo que sugiere la inclusión de varias variantes de cuantización, aunque la model card no detalla qué niveles concretos se han generado.

La relevancia de esta ficha es práctica: permite ejecutar un modelo de generación de vídeo de 5.000 millones de parámetros en hardware de consumo gracias a la cuantización, a cambio de asumir que se trata de una conversión de terceros sin validación oficial y sin datos publicados de calidad o rendimiento. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de vídeo (pipeline text-to-video); arquitectura interna no detallada en la información disponible |
| Parámetros totales | 4.999.787.712 (~5B), dato de los pesos safetensors del modelo base |
| Parámetros activos | No aplica: no se indica que el modelo base sea MoE en la información disponible |
| Longitud de contexto | No aplica: modelo de difusión de vídeo, sin ventana de contexto de texto; no disponible |
| Tipos de cuantización | GGUF (niveles concretos no especificados en la model card) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión directa desde los pesos originales del modelo base) |

Otros datos: repositorio de 45,4 GB, creado y actualizado el 2026-10-19, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La model card es mínima: se limita a indicar que el archivo GGUF es una conversión directa de Wan-AI/Wan2.2-TI2V-5B y que, al tratarse de un modelo cuantizado, se mantienen todos los términos de licencia y restricciones de uso originales. No se documentan en la información proporcionada la arquitectura interna (tipo de backbone, mecanismo de atención, diseño del VAE), el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de ajuste por preferencias humanas (RLHF/DPO) o destilación.

Lo que sí se deduce de los metadatos es la función: la etiqueta de pipeline es text-to-video y el tag ti2v indica soporte de entrada texto+imagen, es decir, generación de vídeo condicionada por una descripción textual y, opcionalmente, por una imagen de referencia. La conversión a GGUF afecta únicamente a la representación numérica de los pesos, no a la arquitectura, y su objetivo es reducir el espacio en disco y la VRAM necesaria para la inferencia.

Un detalle técnico relevante para el despliegue: según la model card, los archivos deben colocarse en ComfyUI/models/unet, lo que implica que el repositorio contiene el componente de difusión (UNet/transformer) y no necesariamente el resto de piezas del pipeline (codificador de texto y VAE), que deben obtenerse por separado del modelo base. Esta circunstancia no se detalla en la información disponible y conviene verificarla antes de desplegar.

## Capacidades

- Generación de vídeo a partir de texto: el pipeline declarado es text-to-video, con prompts en inglés y chino.
- Generación condicionada por imagen (ti2v): la etiqueta ti2v del repositorio apunta a la capacidad de animar o continuar una imagen de entrada junto con el prompt textual.
- Integración con ComfyUI: uso previsto mediante el nodo personalizado ComfyUI-GGUF, con carga desde ComfyUI/models/unet.
- Ejecución con pesos cuantizados en GGUF, orientada a reducir requisitos de memoria frente a los pesos originales.
- Soporte multilingüe limitado a inglés y chino según los metadatos de idioma.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento agéntico, audio, ni modos de pensamiento extendido; no aplican a un modelo de difusión de vídeo.

## Casos de uso

- Prototipado rápido de vídeo generativo en local: un desarrollador puede cargar el GGUF en ComfyUI y generar clips de prueba sin depender de una API externa, lo que facilita iterar sobre prompts y flujos antes de escalar a los pesos completos.
- Previsualización de storyboards: estudio de pequeñas productoras que necesita convertir guiones breves en animáticas con prompts en inglés o chino, usando el modelo cuantizado en estaciones de trabajo con GPU de consumo.
- Generación de material para redes sociales: creación de clips cortos a partir de texto o de una imagen de producto, con el modelo ejecutándose en una única GPU y sin coste por inferencia en la nube.
- Automatización de catálogos de producto: animar imágenes fijas de artículos mediante la entrada de imagen del modo ti2v para producir vídeos promocionales homogéneos por lotes desde ComfyUI.
- Investigación sobre cuantización en modelos de difusión: comparar la calidad visual de las distintas variantes GGUF frente a los pesos originales en safetensors, midiendo degradación perceptual y estabilidad temporal.
- Docencia y experimentación académica: laboratorios con presupuesto de hardware limitado que necesitan demostrar pipelines de difusión de vídeo sin acceso a clústeres de GPU de gama alta.
- Pruebas de integración de ComfyUI-GGUF en pipelines propios: validar la carga de modelos cuantizados y el consumo de VRAM antes de adoptar el formato en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de calidad de vídeo, y tampoco se ofrecen comparaciones con los pesos originales ni con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada por el autor. Como referencia orientativa a partir del tamaño (5B parámetros), los pesos en FP16 ocuparían unos 10 GB y una cuantización de 8 bits alrededor de 5 GB; a ello hay que sumar las activaciones del pipeline de vídeo, el VAE y el codificador de texto, que pueden dominar el consumo en secuencias largas.
- GPU recomendadas: no disponibles en la información proporcionada. Para los pesos sin cuantizar se necesitaría una GPU de 24 GB o superior (RTX 3090/4090, A100, H100) en función de la resolución y duración del clip.
- GPU de consumo: el formato GGUF está pensado precisamente para acercar el modelo a GPU de consumo; el repositorio de 45,4 GB sugiere varias variantes, por lo que las cuantizaciones más agresivas serían las candidatas para tarjetas de 12-16 GB, siempre con pruebas previas.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF (escenario documentado por el autor). No se confirma en la información disponible el soporte en vLLM, TGI, llama.cpp u Ollama, herramientas no orientadas a difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| robertbschuette/Wan2.2-TI2V-5B-GGUF (esta ficha) | ~5B | GGUF (cuantizado) | en, zh | Apache 2.0 | HuggingFace, conversión de terceros, 0 descargas |
| Wan-AI/Wan2.2-TI2V-5B (modelo base) | 4.999.787.712 | safetensors (sin cuantizar) | en, zh | Apache 2.0 | HuggingFace, repositorio oficial |
| Otras alternativas de la misma categoría (p. ej. CogVideoX-5B, LTX-Video) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificados de rendimiento, contexto o requisitos de las alternativas, por lo que la comparación cuantitativa queda limitada al modelo base.

## Limitaciones y advertencias

- Conversión de terceros: el repositorio lo publica robertbschuette, no el equipo de Wan-AI; no hay garantía de fidelidad de la cuantización ni de soporte por parte del autor original.
- Sin validación de calidad: no se publican métricas ni comparaciones frente a los pesos originales; la degradación perceptual y la estabilidad temporal del vídeo con las distintas cuantizaciones son desconocidas.
- Pipeline incompleto: la model card solo indica la colocación en ComfyUI/models/unet, de modo que el codificador de texto y el VAE deben obtenerse aparte; un despliegue incompleto producirá errores.
- Riesgo de contenido sintético: como todo modelo de generación de vídeo, puede producir material audiovisual falso o engañoso; es necesario aplicar medidas de etiquetado y verificación en producción.
- Idiomas: solo inglés y chino están declarados; el rendimiento con prompts en castellano no está documentado.
- Licencia: Apache 2.0 se hereda del modelo base según el autor de la conversión, pero conviene verificar los términos del repositorio original antes de un uso comercial, especialmente en lo relativo a contenido generado y atribución.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día; no hay evidencia de uso en producción ni de mantenimiento.
- Sesgos: no documentados en la información disponible; cabe esperar los habituales de los datasets audiovisuales a gran escala.
- Alucinación visual: no aplica el concepto de alucinación textual, pero sí la generación de contenido incoherente o físicamente implausible, sin métricas publicadas que lo cuantifiquen.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/robertbschuette/Wan2.2-TI2V-5B-GGUF
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Nodo personalizado ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Perfil del autor del nodo: https://huggingface.co/city96

Nota: las búsquedas web realizadas devolvieron únicamente resultados sin relación con el modelo (páginas de estadísticas de Fortnite), por lo que no se han incluido como enlaces relevantes.
