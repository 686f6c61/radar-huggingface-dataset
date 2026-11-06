# Coffmeteor/MOSS-Character-Studio

## Resumen

MOSS Character Studio Reference es un adaptador LoRA de tipo image-to-image desarrollado por Coffmeteor, pensado para generar cartas de personaje completas de cuatro paneles (retrato, referencia anatómica adulta, frontal vestido y trasero vestido) a partir de una imagen de referencia. Se construye sobre el modelo base OpenMOSS-Team/MOSS-Image-SFT, con un ajuste adicional a partir del checkpoint akhaliq/MOSS-Image-Edit-HQ armV5, y se distribuye junto a un paquete de nodos personalizados para ComfyUI que implementa el layout de paneles y la alineación espacial de la referencia.

La innovación principal es el uso de un único lienzo conjunto, un solo sampler y una sola decodificación VAE, con la información de la imagen de referencia alineada espacialmente al bounding box del retrato. Esto preserva la identidad del personaje a través de cambios de vestuario, manteniendo el layout JSON de cuatro paneles y la atención de imagen compartida. El adaptador tiene 504 tensores y rangos de proyección mixtos heredados de armV5, con un peso de 495.514.728 bytes en BF16.

El modelo es relevante para flujos de diseño de personajes y preproducción de arte digital, donde la consistencia de identidad entre paneles es crítica. Su licencia Apache-2.0 y su integración con ComfyUI lo hacen accesible para prototipado rápido, aunque su naturaleza comunitaria y el reducido conjunto de entrenamiento (11 identidades sintéticas, 66 pares referencia/objetivo) limitan su robustez en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adapter) sobre MOSS-Image-SFT; difusión image-to-image con atención de imagen compartida y region conditioning |
| Parametros totales | no disponible (adaptador de 504 tensores, 495.514.728 bytes en BF16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (único formato publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos); nodos MIT; parche core ComfyUI GPL-3.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El adaptador se construye como un LoRA de rango mixto sobre el modelo de difusión MOSS-Image-SFT, heredando los rangos de proyección del checkpoint armV5 de akhaliq/MOSS-Image-Edit-HQ. La receta de inferencia emplea un único lienzo conjunto de 1536 × 864, sampler Euler con scheduler sgm_uniform, 25 pasos, CFG 3.0, muestreo AuraFlow con shift 5 y skip-layer guidance en la capa 22. La referencia visual se alinea espacialmente al bounding box del retrato mediante landmarks faciales verificados (MediaPipe, almacenados en `models/mediapipe`), y el entrenamiento y la inferencia comparten el mismo contrato de anclaje de referencia y máscara cross-modal.

El ajuste se realizó sobre 11 identidades sintéticas y 22 tarjetas objetivo aprobadas con pares de cobertura On/Off, generando tres variantes de referencia por tarjeta (66 pares referencia/objetivo en total). Se dieron dos pasadas al dataset, lo que resultó en 66 actualizaciones del optimizador y 132 forwards/backwards de muestra. Una identidad held-out quedó excluida del entrenamiento. La augmentación de entrada de referencia usó escenas generadas y alineación/mezcla determinista de la cara fuente; en inferencia se parte de un lienzo de ruido y no se pega la cara de referencia en la salida. El fichero seleccionado es el adaptador BF16 sin cambios de 66 actualizaciones, con SHA-256 `b5bdc6a969a312025ce50ebe5f94463d5ad86dc5e0f260b915a8bfb1c806d477`.

## Capacidades

- Generación de cartas de personaje de cuatro paneles (retrato, referencia anatómica adulta, frontal vestido, trasero vestido) en un único lienzo.
- Preservación de identidad a través de cambios de vestuario mediante referencia visual alineada al bounding box del retrato.
- Region conditioning y layout JSON de paneles con scoping de texto por panel.
- Alineación automática de encuadre facial (posición, escala y roll) con MediaPipe; puede suprimir tocados o corregir localmente geometría ocular desigual.
- Control de cobertura de privacidad que activa o desactiva el panel de referencia anatómica y regenera la tarjeta completa.
- image-to-image con punto de partida en lienzo de ruido (no pega la referencia en la salida).
- Integración nativa con ComfyUI mediante el paquete de nodos MOSS Card Layout and Wardrobe.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni thinking mode.

## Casos de uso

- Preproducción de personajes para videojuegos o animación: el modelo genera una hoja de personaje coherente de cuatro vistas a partir de una única referencia facial, lo que acelera la iteración sobre vestuario sin perder identidad entre paneles.
- Diseño de vestuario y variantes: cambiando la referencia de outfit y manteniendo la cara, se obtienen tarjetas comparables para evaluar siluetas y paletas antes de modelar en 3D.
- Ilustración editorial y cómic: permite producir fichas de personaje consistentes para biblias de estilo, con paneles frontal y trasero que sirven de guía a otros artistas o a modelos posteriores.
- Prototipado de avatares y VTubers: la alineación automática de encuadre y la preservación de identidad facilitan generar hojas de referencia para rigging o para entrenar otros adaptadores.
- Flujos de trabajo en ComfyUI con automatización por API: el workflow API incluido permite encadenar la generación de tarjetas dentro de pipelines de producción por lotes.
- Estudio de anatomía y proporciones para artistas: el panel de referencia anatómica (con conmutador de cobertura de privacidad) sirve como guía de proporciones en un contexto de diseño de personajes adulto.
- Docencia y demostración de técnicas LoRA: el reducido dataset y la documentación de provenance lo convierten en un ejemplo reproducible de fine-tuning de adaptadores con region conditioning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el adaptador pesa ~0,5 GB en BF16, pero el modelo base MOSS-Image-SFT requiere VRAM adicional no documentada en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el lienzo de 1536 × 864 y el modelo base de difusión sugieren requisitos moderados-altos, pero no se confirma.
- Despliegue: ComfyUI 0.43.0 con el paquete de nodos MOSS Card Layout and Wardrobe (instalable vía ComfyUI Manager o Git); requiere el snapshot original de MOSS-Image-SFT y el modelo MediaPipe en `models/mediapipe`; el LoRA va en `ComfyUI/models/loras/moss/`.
- Latencia y throughput: no disponibles; el walkthrough indica que los intervalos de espera se acortaron en la edición, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Coffmeteor/MOSS-Character-Studio | LoRA image-to-image para cartas de personaje | MOSS-Image-SFT + armV5 | no disponible | Apache-2.0 | Hugging Face + ComfyUI |
| akhaliq/MOSS-Image-Edit-HQ (armV5) | Checkpoint de edición de imagen | MOSS-Image | no disponible | no disponible en la informacion | Hugging Face |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base de difusión image-to-image | — | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido (11 identidades sintéticas, 66 pares), lo que limita la generalización a identidades y estilos no vistos.
- El propio autor advierte de que algunos resultados conservan secciones de cuello cortas, cambian detalles faciales o expresión, alteran accesorios o muestran iluminación de piel desigual; deben inspeccionarse antes de usarse como hojas de personaje en producción.
- La alineación automática de encuadre puede suprimir tocados o corregir de forma agresiva la geometría ocular.
- El panel de referencia anatómica es de contenido adulto y se controla con un conmutador de cobertura de privacidad; su uso debe ajustarse a las políticas del despliegue.
- Licencia Apache-2.0 en los pesos con atribución obligatoria a OpenMOSS y al autor de armV5; los nodos son MIT pero el parche del core de ComfyUI es GPL-3.0, lo que impone obligaciones de copyleft sobre ese componente.
- Las imágenes originales de las galerías de caras y vestuario no se redistribuyen y conservan sus propios términos; no se pueden reutilizar sin revisar sus licencias.
- No se documentan idiomas soportados ni capacidades de tool calling o agentes.
- Requiere ComfyUI 0.43.0 y una extensión core verificada por checksum; la instalación no es trivial y exige seguir REFERENCE_SETUP.md y reiniciar.
- Riesgo de alucinación visual y de deriva de identidad en outfits o poses alejadas de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Coffmeteor/MOSS-Character-Studio
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Checkpoint de partida armV5: https://huggingface.co/akhaliq/MOSS-Image-Edit-HQ/tree/ee1493ba577437e70b88bc4499b85cc7aa4594ca/weights/armV5
- Paquete de nodos ComfyUI: https://github.com/Coffmeteor/ComfyUI-MOSS-Card-Layout
- Guía de configuración de referencia: https://github.com/Coffmeteor/ComfyUI-MOSS-Card-Layout/blob/main/REFERENCE_SETUP.md
- Galería de retratos de referencia: https://ai-portrait-gallery.pages.dev/
- Galería de vestuario de referencia: https://ai-costume-gallery.pages.dev/
- Autor de las galerías (あぎ): https://x.com/agi_aibusi
