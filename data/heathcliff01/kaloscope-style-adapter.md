# heathcliff01/Kaloscope-style-adapter

## Resumen

Kaloscope Style Adapter es un conjunto de adaptadores de estilo para modelos de difusión texto-a-imagen, publicado por el usuario heathcliff01 (laboratorio Chenkin-x) bajo el identificador `heathcliff01/Kaloscope-style-adapter`. No es un modelo generativo autónomo: es un adaptador que se acopla a tres modelos base distintos (Krea-2-Raw, Krea-2-Turbo y MOSS-Image-Base) para separar la condición de estilo de la condición de contenido. La idea central es que el prompt describa "qué se pinta" mientras el adaptador decide "cómo se pinta", evitando repetir nombres de artistas dentro del prompt de contenido.

El repositorio distribuye tres adaptadores de 13,31 M de parámetros cada uno (más una versión antigua de 7,02 M para MOSS), un banco de estilos con 44.129 artistas, un codificador de imagen de referencia que proyecta a 256 dimensiones, y flujos de trabajo para ComfyUI. El adaptador añade tres modos de uso: selección de un artista por nombre, fusión ponderada de varios artistas y transferencia de estilo desde una imagen de referencia.

Su relevancia es acotada pero concreta: el ajuste de estilo en difusión se ha resuelto normalmente con LoRAs por artista o con IP-Adapter, y este proyecto propone una arquitectura única de "bancos de adaptadores compartidos" que cubre decenas de miles de etiquetas de artista con un solo fichero de ~51 MiB. Es un artefacto joven (creado el 23 de octubre de 2026, 15 likes y 0 descargas en el momento de la consulta), orientado a usuarios de ComfyUI y a investigadores interesados en condicionamiento de estilo desacoplado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador de estilo sobre modelos de difusión texto-a-imagen; en la variante MOSS B8, 8 bancos de adaptadores compartidos con proyección de estilo de 256 dimensiones |
| Parámetros totales | 13,31 M por adaptador (Krea Kaloscope Raw, Krea Kaloscope Turbo y Kaloscope MOSS B8 step10000); 7,02 M en la versión antigua Kaloscope MOSS step8500 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generación de imagen); límite de tokens del codificador de texto no disponible |
| Tipos de cuantización | Pesos distribuidos en safetensors; el tamaño de fichero (50,77 MiB para 13,31 M de parámetros) es coherente con almacenamiento en fp32. FP8 y GGUF no han sido validados según el autor |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Licencias upstream por componente: Krea 2 Community License (Raw y Turbo), Apache-2.0 (MOSS) y DINOv3 License (codificador artist-v1) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,6 GB |
| Tamaño por fichero de pesos | 50,77 MiB (Raw), 50,77 MiB (Turbo), 50,78 MiB (MOSS B8), 26,77 MiB (MOSS step8500) |
| Modelos base requeridos | krea/Krea-2-Raw, krea/Krea-2-Turbo, OpenMOSS-Team/MOSS-Image-Base (no se redistribuyen en el repositorio) |
| Resolución de los ejemplos publicados | 1024 × 1024 |
| Pasos de muestreo recomendados | Raw: Euler 25 pasos; Turbo: Euler 8 pasos; MOSS: Euler 25 pasos con shift = 5 |

## Arquitectura y entrenamiento

El adaptador se entrena con la base, el codificador de texto, el VAE y el codificador de estilo congelados; solo se ajustan los parámetros del adaptador. El codificador de estilo (`encoder/artist-v1`) fue microajustado previamente por separado y el VAE no participó en el ajuste del adaptador. La variante MOSS B8 introduce ocho bancos de adaptadores compartidos de 13,31 M de parámetros en total, lo que permite cubrir un espacio grande de etiquetas de artista con un único fichero pequeño; la versión anterior de MOSS usaba 7,02 M. La condición de estilo puede venir de un prototipo indexado por nombre de artista (búsqueda por nombre, coincidencia aproximada y alias verificados) o de una imagen de referencia codificada a un vector de 256 dimensiones.

Los registros de entrenamiento publicados indican, para los tres ficheros iniciales, aproximadamente 4,31 M de muestras objetivo y 41.759 etiquetas de artista. El nuevo checkpoint MOSS B8 step10000 registra 3.570.414 muestras objetivo y 44.093 etiquetas de artista. El autor advierte explícitamente que estas cifras corresponden a distintos checkpoints, que no equivalen al número de artistas cubiertos por el banco de estilos (44.129) y que no constituyen una validación de calidad individual por estilo. No se detalla la composición del dataset, el número de tokens de imagen vistos ni si se emplearon etapas de RLHF o DPO; esos datos no están disponibles.

## Capacidades

- Condicionamiento de estilo por nombre de artista: el nodo busca en un banco de 44.129 artistas con soporte de coincidencia aproximada y alias verificados, sin necesidad de ejecutar el codificador de referencia.
- Fusión de múltiples artistas mediante sintaxis de pesos relativos, por ejemplo `fkey, (rolua:0.8)`; cuando no se especifica peso se aplica una combinación equitativa. El autor aclara que el peso es una proporción de mezcla de características, no un porcentaje perceptible de estilo.
- Transferencia de estilo desde imagen de referencia: el codificador `artist-v1` proyecta la imagen a 256 dimensiones y esa condición se aplica junto a un prompt de contenido nuevo.
- Compatibilidad con tres familias de modelos base (Krea-2-Raw, Krea-2-Turbo y MOSS-Image-Base) mediante adaptadores específicos por base.
- Integración con ComfyUI mediante nodos propios, con conjuntos de flujos de trabajo en formato UI y API para automatización.
- Prompts en chino e inglés.
- Capacidades no aplicables: no es un modelo de lenguaje, por lo que no soporta tool calling, function calling, razonamiento multi-paso, agentes ni generación de código. No se documentan capacidades de vídeo ni de audio.

## Casos de uso

- Dirección de arte con estilos nombrados: un ilustrador selecciona el nombre de un artista del banco y mantiene el prompt de contenido centrado en la escena, lo que simplifica las plantillas de prompt y reduce la longitud del texto en pipelines con muchos estilos.
- Exploración de mezclas de estilo: el nodo de fusión permite combinar dos o tres artistas con pesos relativos para generar variantes de estilo dentro de una misma campaña, útil en fases de descubrimiento visual y moodboards.
- Coherencia de estilo en series largas: fijando el adaptador, la condición de estilo y la semilla, y variando solo el prompt de contenido, se pueden producir series de ilustraciones con aspecto homogéneo; el autor recomienda comparar strength 1,0 frente a 0,8 con semilla fija.
- Transferencia de estilo desde una referencia de cliente: con el codificador `artist-v1`, se toma una imagen aprobada por el cliente como condición de estilo y se generan escenas nuevas con ese mismo lenguaje visual, sin reentrenar.
- Prototipado rápido en estudio con la variante Turbo: al usar Euler a 8 pasos con CFG 1 y style guidance 1, el coste por iteración baja y permite explorar decenas de combinaciones antes de pasar a la variante Raw a 25 pasos.
- Producción por lotes en ComfyUI: los flujos `_api` del repositorio permiten encadenar el nodo de estilo en un pipeline automatizado de generación de imágenes para catálogos, fondos o ilustración editorial.
- Investigación sobre condicionamiento de estilo desacoplado: el repositorio de entrenamiento separado permite reproducir el ajuste con base congelada y estudiar el efecto de los bancos compartidos frente a LoRAs por artista.
- Reutilización del banco de estilos con otros checkpoints: al estar separados el banco (`style-bank/artist-v1.safetensors`), el listado de nombres y el codificador, se pueden actualizar los adaptadores sin reinstalar los recursos de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud de estilo, preferencia humana) ni comparaciones numéricas con otras técnicas de condicionamiento de estilo. El autor señala cualitativamente que una puntuación de similitud de estilo más alta no implica necesariamente un mejor resultado visual, pero no aporta cifras. Tampoco se publican medidas de latencia o throughput; solo se especifican los pasos de muestreo recomendados y que las muestras de ejemplo se generaron a 1024 × 1024 con la base local en INT8 ConvRot, Euler 25 pasos, CFG 3, style guidance 6, strength 1 y shift 5 para MOSS.

## Requisitos de hardware

- El adaptador en sí es mínimo: 50,77 MiB por fichero (13,31 M de parámetros). Asumiendo fp32, equivale a unos 0,05 GB de VRAM adicional; en fp16 serían unos 0,03 GB. Cálculo derivado del tamaño del fichero, no publicado por el autor.
- El requisito real lo impone el modelo base, que debe descargarse por separado. No se dispone de cifras de VRAM para Krea-2-Raw, Krea-2-Turbo ni MOSS-Image-Base en la información proporcionada.
- GPU recomendadas: no disponibles. El autor solo menciona que las muestras se generaron con una base local en INT8 ConvRot, sin especificar hardware.
- Ajuste en GPU de consumo: no disponible. El adaptador cabe en cualquier GPU, pero la viabilidad depende por completo de la VRAM del modelo base y del codificador de texto y VAE correspondientes.
- Despliegue: ComfyUI con los nodos [Kaloscope Style Adapter for ComfyUI](https://github.com/Chenkin-x/Kaloscope-Style-adapter-Comfyui). El repositorio incluye `install_models.py`, que copia los pesos a `ComfyUI/models/kaloscope_adapters/` y admite `--variant raw|turbo|moss|all` y `--with-encoder`. La variante MOSS B8 requiere una versión reciente del nodo con soporte de 8 bancos; el autor indica que la v3.0.0 no garantiza compatibilidad.
- vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje ni un transformer autoregresivo.
- Latencia y throughput: no disponibles. Como referencia de coste, la variante Turbo usa 8 pasos de muestreo frente a los 25 de Raw y MOSS, lo que reduce el tiempo por imagen aproximadamente en un factor de tres a igualdad de hardware y resolución.

## Comparativa con modelos similares

Comparativa interna de las variantes publicadas en el propio repositorio:

| Variante | Modelo base | Parámetros | Tamaño | Muestreo | CFG texto | Style guidance | Strength | Licencia |
|---|---|---:|---:|---|---:|---:|---:|---|
| Krea Kaloscope Raw | Krea-2-Raw | 13,31 M | 50,77 MiB | Euler 25 pasos | 2 | 3,5 | 1,0 (comparar con 0,8 a semilla fija) | Krea 2 Community License |
| Krea Kaloscope Turbo | Krea-2-Turbo BF16 | 13,31 M | 50,77 MiB | Euler 8 pasos, μ = 1,15 | 1 | 1 | 1,0 (comparar con 0,8 a semilla fija) | Krea 2 Community License |
| Kaloscope MOSS B8 step10000 | MOSS-Image-Base | 13,31 M (8 bancos) | 50,78 MiB | Euler 25 pasos, shift 5 | 3 | 6 | 1,0 | Apache-2.0 (adaptador) |
| Kaloscope MOSS step8500 (antiguo) | MOSS-Image-Base | 7,02 M | 26,77 MiB | Euler 50 pasos | No disponible | No disponible | No disponible | Apache-2.0 (adaptador) |

Alternativas de la misma categoría (condicionamiento de estilo en difusión): IP-Adapter, InstantStyle y LoRAs de estilo por artista. No se dispone en la información proporcionada de parámetros, longitud de contexto, resultados de rendimiento ni condiciones de licencia de estas alternativas, por lo que la comparación cuantitativa se marca como no disponible. Cualitativamente, Kaloscope se diferencia por cubrir un banco de 44.129 artistas en un único adaptador de ~51 MiB, frente al enfoque habitual de un LoRA independiente por estilo, y por requerir nodos propios de ComfyUI en lugar de ser un adaptador genérico compatible con múltiples interfaces.

## Limitaciones y advertencias

- La cobertura del banco de estilos no equivale a control de calidad: el autor advierte que no todos los estilos están validados individualmente y que las cifras de etiquetas de entrenamiento no son una garantía de calidad por estilo.
- Inestabilidad estructural: condiciones de referencia, combinaciones de artistas no vistas y valores altos de strength pueden provocar artefactos en rostros, anatomía y composición.
- La similitud de estilo más alta no se correlaciona necesariamente con un mejor resultado visual, según el propio autor.
- MOSS no ofrece, de momento, la misma capacidad de discriminación entre artistas que la familia Krea2, según la model card.
- Combinaciones no verificadas: FP8, GGUF, ControlNet, compilación y otros parches de CFG no han sido validados de forma exhaustiva.
- Dependencia de terceros: el repositorio solo distribuye adaptadores y recursos de estilo; es obligatorio descargar los modelos base, el codificador de texto y el VAE, cada uno con su licencia.
- Licencia Krea 2 Community License para Raw y Turbo: incluye condiciones de uso comercial, políticas de uso y requisitos de distribución. Los adaptadores son independientes y no representan un producto oficial ni un aval de Krea.
- El codificador `artist-v1` está bajo DINOv3 License, y el banco de características de estilo conserva el origen DINOv3 y sus restricciones; esta licencia no sustituye a las del resto de dependencias.
- Implicaciones legales y éticas del estilo: el sistema imita el estilo de artistas identificados por nombre, lo que puede plantear conflictos de derechos de autor o de imagen según la jurisdicción. No se documenta ninguna salvaguarda técnica para impedir la reproducción de estilos de artistas vivos.
- Idiomas: solo se declaran chino e inglés; el comportamiento con prompts en castellano u otras lenguas no está documentado.
- Sesgos: no se publica ningún análisis de sesgos del banco de artistas ni de la distribución geográfica o demográfica de las 44.129 etiquetas.
- Madurez: 0 descargas y 15 likes en el momento de la consulta; el proyecto depende de una versión concreta de los nodos de ComfyUI y ha cambiado de formato de adaptador entre checkpoints (7,02 M a 13,31 M de parámetros), lo que puede romper automatizaciones existentes.
- Riesgo de alucinación en sentido figurado: al ser un modelo generativo de imagen, puede producir contenido visual no solicitado, texto ilegible dentro de la imagen y detalles inexistentes; no se documentan filtros de seguridad propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heathcliff01/Kaloscope-style-adapter
- Nodos de inferencia para ComfyUI: https://github.com/Chenkin-x/Kaloscope-Style-adapter-Comfyui
- Código de entrenamiento: https://github.com/Chenkin-x/Kaloscope-adapter-trainer
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Krea2 en formato ComfyUI (text encoder y VAE): https://huggingface.co/Comfy-Org/Krea-2
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- MOSS-Image en formato ComfyUI: https://huggingface.co/Comfy-Org/MOSS-Image
- Banco de estilos de artista: `style-bank/artist-v1.safetensors` y `style-bank/artists.txt` (dentro del repositorio de HuggingFace)
- Codificador de imagen de referencia: `encoder/artist-v1` (dentro del repositorio de HuggingFace)
- Pesos por variante: `models/Krea-Kaloscope-Raw.safetensors`, `models/Krea-Kaloscope-Turbo.safetensors`, `models/Kaloscope-MOSS-B8-D256-step10000.safetensors`, `models/Kaloscope-MOSS.safetensors`
- Tarjetas por variante: `model_cards/raw/README.md`, `model_cards/turbo/README.md`, `model_cards/moss/README.md`, `model_cards/moss-step8500/README.md`
- Flujos de trabajo de ejemplo: `workflows/` y `workflows/moss-b8-step10000/`
- Nota de actualización del checkpoint MOSS B8: `updates/2026-10-25-moss-b8-step10000.md`
- Verificación de pesos: `WEIGHTS.json` y `SHA256SUMS.txt`
- Licencias: `LICENSE.md`
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a Google Gemini y no guardan relación con este proyecto.
