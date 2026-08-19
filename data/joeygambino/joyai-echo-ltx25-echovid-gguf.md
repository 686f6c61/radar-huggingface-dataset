# joeygambino/joyai-echo-ltx25-echoVid-gguf

## Resumen

JoyAI-Echo x LTX-2.5 (echoVid) es un modelo de generación de vídeo con audio sincronizado, resultado de una fusión quirúrgica entre el motor de Lightricks LTX-2.5 y el actor de JD.com JoyAI-Echo. El autor, joeygambino, ha transplantado los deltas de atención y feed-forward de JoyAI-Echo (un fine-tune de LTX-2.3) sobre el transformer de LTX-2.5 dev, y ha horneado la LoRA destilada oficial de LTX-2.5 a intensidad 0.5, obteniendo así un modelo que hereda la capacidad de renderizado de vídeo y audio en una sola pasada de LTX-2.5 y el lip-sync, las expresiones faciales y la voz estable de JoyAI-Echo, sin necesidad de reentrenamiento. El resultado se distribuye en formato GGUF cuantizado, pensado para ejecutarse en ComfyUI con hardware de consumo (tarjetas de 12 a 32 GB de VRAM), a diferencia del checkpoint original de JoyAI-Echo que requiere unos 48 GB.

La relevancia de este modelo radica en que acerca la generación de vídeo de alta calidad con audio sincronizado a equipos domésticos, manteniendo la velocidad y los requisitos de LTX-2.5 destilado (pocos pasos, CFG 1). Se ofrecen dos variantes de intensidad (070T30 y 100T50) para ajustar el equilibrio entre naturalidad y expresividad. El modelo tiene 21.004.025.600 parámetros (aproximadamente 22B) y se distribuye en varios niveles de cuantización GGUF que van de 10,6 GB a 22,7 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo y audio (LTX-2.5) con deltas de JoyAI-Echo |
| Parametros totales | 21.004.025.600 (22B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo de vídeo; no se especifica duración máxima) |
| Tipos de cuantizacion | GGUF: Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | LTX-2.x Community License (heredada de ambos modelos base) |
| Formato de pesos | GGUF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

El modelo es una fusión de dos transformers de forma idéntica: el de LTX-2.5 y el de JoyAI-Echo. Sobre el transformer oficial de LTX-2.5 dev se transplantaron los deltas de atención y feed-forward de JoyAI-Echo, que son los que aportan las capacidades de actuación (lip-sync, expresiones, voz estable). Posteriormente se horneó la LoRA destilada oficial de LTX-2.5 (`ltx-2.5-22b-distilled-lora-450`) a una intensidad de 0.5, lo que permite generar vídeo en pocos pasos (8 pasos en la primera pasada, 3 en la segunda) con el programador `euler_ancestral` y CFG 1. No se realizó ningún reentrenamiento; se trata de una fusión de pesos. La primera versión (v1) utilizaba el transformer destilado directamente y producía imágenes sobresaturadas con contraste duro, por lo que se descartó. La versión actual (v2) parte del transformer dev y deja la LoRA horneada a 0.5, con la opción de aplicar una LoRA propia a intensidad personalizada (los archivos dev están disponibles por separado).

## Capacidades

- Generación de vídeo a partir de texto con audio sincronizado en una sola pasada (text-to-video y text-to-audio).
- Lip-sync natural: los labios se mueven de forma coherente con el audio generado.
- Expresiones faciales expresivas y voz estable (la voz no cambia de tono ni de identidad a lo largo del clip).
- Generación de vídeo de larga duración mediante flujos de trabajo multishot con uniones de extensión audiovisual (AV-extend).
- Dos niveles de intensidad de actuación: 070T30 (más natural, piel más limpia) y 100T50 (más exagerado, ideal para animación o comedia).
- Compatible con ComfyUI mediante el cargador UnetLoaderGGUF y el paquete de nodos Joy-LTX 2.5.
- No incluye capacidades de razonamiento, tool calling ni procesamiento de texto puro; es exclusivamente un generador de vídeo.

## Casos de uso

- Creación de avatares parlantes para vídeos corporativos: el modelo genera un personaje que habla con lip-sync preciso y voz consistente, reduciendo el coste de producción de vídeos de formación o comunicación interna.
- Doblaje de vídeos existentes: dado un guion y una voz, se puede generar una pista de vídeo con sincronización labial, útil para localización de contenido en distintos idiomas (siempre que el modelo soporte el idioma, aunque no se especifica).
- Producción de clips para redes sociales: generar vídeos cortos con audio integrado para campañas de marketing, sin necesidad de herramientas de edición complejas.
- Prototipado de escenas cinematográficas: los cineastas pueden generar animáticas con diálogo y expresiones faciales para previsualizar escenas antes de la producción real.
- Generación de vídeos educativos con narración: crear lecciones en vídeo donde un presentador virtual explica conceptos, con sincronización labial y voz estable.
- Creación de personajes animados para juegos o cómics: la variante 100T50 permite actuaciones exageradas y cómicas, adecuadas para contenido de entretenimiento.
- Generación de vídeo de larga duración con continuidad: mediante el flujo multishot, se pueden unir varios segmentos manteniendo la coherencia audiovisual, útil para narrativas más largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que ambas variantes (070T30 y 100T50) fueron evaluadas a ciegas en más de 20 renders emparejados, con puntuaciones similares, siendo 070T30 ligeramente mejor en caras estáticas y 100T50 superior en expresiones grandes y risas. No se proporcionan métricas objetivas como FVD, CLIP score o similares.

## Requisitos de hardware

- VRAM estimada: según el archivo GGUF elegido, se necesitan entre 12 GB y 32 GB de VRAM. La tabla de la model card indica:
  - Q3_K_M (10,6 GB): cabe en 12 GB (ajustado) o 16 GB.
  - Q4_K_S (12,9 GB): recomendado para 16 GB.
  - Q4_K_M (14,2 GB): cabe en 16 GB (ajustado).
  - Q5_K_M (15,9 GB): recomendado para 24 GB (por defecto).
  - Q6_K (17,7 GB): recomendado para 24 GB.
  - Q8_0 (22,7 GB): recomendado para 32 GB.
- GPUs recomendadas: RTX 3090, RTX 4090, RTX 5090 (en esta última los archivos comfy-native son 1.5-2x más rápidos que GGUF). También funciona en GPUs de 12 GB como RTX 3060 o RTX 4070 con las cuantizaciones más bajas.
- Despliegue: ComfyUI con el plugin ComfyUI-GGUF (city96) y el paquete de nodos Joy-LTX 2.5 (https://github.com/jlucasmcrell/ComfyUI-JoyLTX25). También se requieren los VAE de vídeo y audio de LTX-2.5, el upscaler latente y el codificador de texto Gemma 4 12B (con versiones cuantizadas para 16 GB).
- Rendimiento: en una RTX 3090, para un clip de 8 segundos a 960x544 con upscaling x2 a 1920x1088, los tiempos por clip son: Q4_K_S 491 s, Q4_K_M 484 s, Q5_K_M 466 s, Q6_K 399 s. No se indican tiempos para Q3_K_M ni Q8_0.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Requisitos VRAM | Audio | Licencia | Notas |
|---|---|---|---|---|---|---|
| JoyAI-Echo x LTX-2.5 (echoVid) GGUF | 22B | GGUF | 12-32 GB | Sí, sincronizado | LTX-2.x Community | Fusión con lip-sync mejorado, pocos pasos |
| Lightricks LTX-2.5 (dev) | 22B | safetensors | ~48 GB (sin cuantizar) | Sí | LTX-2.x Community | Modelo base, requiere más VRAM |
| JD JoyAI-Echo (original) | 22B | safetensors | ~48 GB | Sí | LTX-2.x Community | Fine-tune de LTX-2.3, mejor actuación pero pesado |
| Otros modelos de vídeo (CogVideoX, Mochi) | Variable | safetensors/GGUF | Variable | No siempre | Variable | Sin comparativa cuantitativa disponible |

La comparativa es cualitativa; no se dispone de benchmarks objetivos que enfrenten a este modelo con alternativas. La principal ventaja de echoVid es su formato GGUF, que reduce drásticamente los requisitos de VRAM frente a los checkpoints originales, y su herencia de LTX-2.5 destilado, que permite generación en pocos pasos.

## Limitaciones y advertencias

- Licencia comunitaria LTX-2.x: restringe el uso comercial y la redistribución; es necesario revisar los términos exactos de la licencia antes de usarlo en producción.
- Modelo experimental: se trata de una fusión sin reentrenamiento, por lo que pueden aparecer artefactos visuales en determinadas condiciones (la revisión a ciegas detectó una ligera "goma" en caras estáticas con la variante 070T30).
- La variante 100T50 tiende a producir contraste más alto y colores más saturados, lo que puede no ser adecuado para todos los estilos.
- No se especifican los idiomas soportados; el rendimiento en idiomas distintos del inglés no está garantizado.
- No se han publicado benchmarks objetivos (FVD, CLIP, etc.), por lo que la calidad percibida se basa en evaluaciones subjetivas limitadas.
- El modelo requiere una infraestructura específica de ComfyUI (nodos, VAE, upscaler, codificador de texto) que debe instalarse correctamente; no es un modelo plug-and-play fuera de ese ecosistema.
- Al ser un modelo de generación de vídeo, puede reproducir sesgos presentes en los datos de entrenamiento de los modelos base (no documentados en la información disponible).
- La generación de vídeo es computacionalmente intensiva: incluso con cuantización, un clip de 8 segundos tarda varios minutos en una RTX 3090.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joeygambino/joyai-echo-ltx25-echoVid-gguf
- Repositorio de nodos y flujos de trabajo Joy-LTX 2.5: https://github.com/jlucasmcrell/ComfyUI-JoyLTX25
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Modelo base JoyAI-Echo: https://huggingface.co/jdopensource/JoyAI-Echo
- Repositorio GitHub de JoyAI-Echo: https://github.com/jd-opensource/JoyAI-Echo
- Página oficial de JoyAI-Echo: https://joyai-echo.net/joyai-echo
- Perfil del autor con otros modelos: https://huggingface.co/joeygambino
- Variante dev (para aplicar LoRA propia): https://huggingface.co/joeygambino/joyai-echo-ltx25-echoVid-dev
- Archivos comfy-native (int8, w4a8, etc.): https://huggingface.co/joeygambino/joyai-echo-ltx25-echoVid-comfy-native
