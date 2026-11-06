# shakko010203/NanoAvatar

## Resumen

NanoAvatar es un modelo de generación de vídeo de avatar parlante (talking-head) orientado a inferencia en dispositivo, desarrollado por el usuario shakko010203 (con código y artefactos publicados también bajo el identificador wpydcr). Resuelve el problema de la latencia y el coste de cómputo en aplicaciones de avatar audio-a-vídeo: en lugar de depender de una GPU en la nube, genera un rostro animado sincronizado con audio directamente en un teléfono Android de gama alta. El modelo combina un codificador de audio HuBERT con un generador de imagen que produce una región facial de 256 × 256 píxeles, compuesta posteriormente sobre el vídeo fuente a su resolución original.

La propuesta diferencial es el rendimiento en tiempo real sobre hardware móvil: según la model card, alcanza 39 FPS con 115 ms de latencia al primer fotograma en un Snapdragon 8 Gen 3, y 41 FPS con 103 ms en la variante Lite, con un consumo de memoria en torno a 700-834 MiB. En una RTX 4090 la versión cuantizada llega a 333 FPS con 18 ms al primer fotograma. Además, admite generación en streaming: con un LLM y un TTS también en streaming, el avatar empieza a hablar en aproximadamente 0,3 segundos sin esperar a que el audio esté completo.

El repositorio de Hugging Face ocupa 0,4 GB y contiene los pesos compilados para Android (QNN/HTP), la versión cuantizada para CUDA y, según la model card, una versión de precisión completa marcada como "come soon". La licencia es restrictiva: el modelo de lip-sync se distribuye bajo CC BY-NC 4.0 (uso no comercial), mientras que el codificador HuBERT conserva la licencia MIT upstream. El uso comercial requiere licencia aparte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline audio-a-vídeo: codificador de audio HuBERT (chinese-hubert-large) + generador de imagen para región facial; no se detalla la arquitectura interna del generador |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo audio-a-vídeo, no textual) |
| Tipos de cuantización | HuBERT W8A16; modelo de lip-sync con INT8 mixto; HTP FP16 en Android; FP32 en codificadores de cara/audio |
| Idiomas soportados | en, zh |
| Licencia | nanoavatar-model-licenses: lip-sync bajo CC BY-NC 4.0; HuBERT bajo MIT; uso comercial mediante licencia aparte |
| Formato de pesos | Paquetes PyTorch/CUDA (cuantizado), artefactos compilados QNN/HTP para Android; FP32/FP16 en precisión completa |

## Arquitectura y entrenamiento

NanoAvatar se estructura como un pipeline de dos etapas: un codificador de audio basado en chinese-hubert-large extrae características del habla, y un generador de lip-sync produce la región facial de 256 × 256 píxeles que se compone sobre el vídeo fuente. La model card no especifica el tipo de red del generador (difusión, GAN, transformer o híbrido), ni el número de parámetros, ni la composición del dataset de entrenamiento. Tampoco se documenta si hubo RLHF, DPO ni fases de ajuste fino específicas.

La innovación técnica destacable es la optimización para despliegue en dispositivo: cuantización W8A16 del codificador HuBERT, INT8 mixto en el modelo de lip-sync y compilación para el NPU Hexagon (HTP v75) de Snapdragon 8 Gen 3 mediante QNN. La variante CUDA cuantizada está dirigida explícitamente a SM89 (RTX 4090) e incluye una DLL de CUDA. El diseño soporta generación en streaming, de modo que el modelo empieza a producir fotogramas a medida que llega el audio en lugar de esperar a la locución completa.

## Capacidades

- Generación de vídeo de avatar parlante a partir de audio (audio-to-video) con sincronización labial.
- Generación en streaming: procesa audio por fragmentos y comienza a hablar con aproximadamente 0,3 s de latencia en configuraciones con LLM y TTS en streaming.
- Generalización a hablantes no vistos: los demos publicados no se usaron en entrenamiento ni se ajustaron específicamente.
- Soporte bilingüe inglés y chino, heredado del codificador chinese-hubert-large.
- Composición del rostro generado sobre el vídeo fuente a su resolución original (la generación interna es de 256 × 256).
- Ejecución offline en Android: la app incluye los modelos y un avatar, y permite grabar voz para animarlo.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- Avatares en apps móviles sin conexión: la app Android incluye los modelos y un avatar, de modo que el usuario graba su voz y obtiene el vídeo animado en el propio dispositivo, sin subir audio a un servidor ni depender de una GPU en la nube.
- Asistentes conversacionales con cara visible: combinado con un LLM y un TTS en streaming, el avatar empieza a responder en torno a 0,3 s, lo que permite diálogos por voz con retroalimentación visual inmediata en móvil.
- Atención al cliente con agente virtual: el bajo consumo (aproximadamente 700-834 MiB) permite ejecutar el avatar junto a otros componentes en un teléfono de gama alta, habilitando agentes visuales desplegados en el propio terminal del usuario.
- Telepresencia y videollamadas con animación de avatar: el modelo anima un rostro a partir del audio en tiempo real (39-41 FPS en Snapdragon 8 Gen 3), adecuado para sustituir la cámara en llamadas con ancho de banda limitado.
- Creación de contenido y doblaje: generar vídeos de un presentador hablando en inglés o chino a partir de una locución, útil para vídeos formativos, marketing o localización de contenido existente.
- Prototipado e investigación en generación de avatares: la variante cuantizada para CUDA (333 FPS en RTX 4090) permite iterar rápidamente en laboratorio antes de desplegar en móvil, y la licencia CC BY-NC 4.0 cubre el uso académico no comercial.
- Demos interactivas en ferias o quioscos: ejecución local en hardware móvil o en una RTX 4090 con latencias de 18-37 ms al primer fotograma, sin dependencia de red.

## Benchmarks y rendimiento

Los datos publicados en la model card son medidas de rendimiento de inferencia, no benchmarks de calidad de generación (no hay FID, LSE-C, LSE-D ni métricas similares).

| Modelo | Dispositivo | FPS | Primer fotograma | Memoria / VRAM |
|---|---|---:|---:|---:|
| NanoAvatar | Snapdragon 8 Gen 3, Android 14 | 39 | 115 ms | 834 MiB |
| NanoAvatar Lite | Snapdragon 8 Gen 3, Android 14 | 41 | 103 ms | 700 MiB |
| NanoAvatar Lite | Snapdragon 8 Gen 1, Android 15 | 18 | 183 ms | 693 MiB |
| Cuantizado | RTX 4090, Windows CUDA | 333 | 18 ms | 834 MiB |
| Precisión completa | RTX 4090, Windows CUDA | 224 | 37 ms | 1119 MiB |

La medición de latencia al primer fotograma en Android abarca desde la extracción de características de audio hasta la primera imagen generada. No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: 834 MiB en la variante cuantizada CUDA y 1119 MiB en precisión completa (RTX 4090).
- Memoria en móvil: 693-834 MiB según dispositivo y variante (Snapdragon 8 Gen 1 y 8 Gen 3).
- GPU recomendadas: RTX 4090 (SM89) para la variante CUDA cuantizada; el paquete Android requiere Snapdragon 8 Gen 3 con HTP v75 (y funciona en Snapdragon 8 Gen 1 con menor rendimiento).
- Cabe en GPU de consumo: sí, con menos de 1,2 GB de VRAM; cualquier GPU con al menos 2 GB de VRAM debería ser suficiente en términos de memoria, aunque el runtime cuantizado está compilado específicamente para SM89.
- Opciones de despliegue: paquete PyTorch/CUDA cuantizado (Windows, RTX 4090), paquete compilado QNN/HTP para Android, y app Android con los modelos incluidos. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 18 ms al primer fotograma y 333 FPS en RTX 4090 cuantizado; 103-115 ms y 39-41 FPS en Snapdragon 8 Gen 3; 183 ms y 18 FPS en Snapdragon 8 Gen 1.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de talking-head en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. Cualitativamente, la propuesta de NanoAvatar se distingue por su orientación a inferencia en dispositivo móvil (Snapdragon) y su licencia no comercial, frente a alternativas de generación de avatares que suelen requerir GPU de servidor. Los detalles de parámetros, contexto y rendimiento de esas alternativas no están disponibles en la información facilitada.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo de lip-sync se distribuye bajo CC BY-NC 4.0, lo que excluye el uso comercial sin licencia adicional (contacto indicado en la model card). El codificador HuBERT conserva MIT.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano ni de otras lenguas.
- La generación facial interna es de 256 × 256 píxeles; la calidad percibida dependerá de la composición sobre el vídeo fuente a mayor resolución.
- El runtime CUDA cuantizado está compilado para Windows CUDA SM89 (RTX 4090); no se garantiza su funcionamiento en otras GPU sin recompilación.
- El paquete Android está dirigido a Snapdragon 8 Gen 3 / HTP v75; en Snapdragon 8 Gen 1 el rendimiento cae a 18 FPS.
- La model card no documenta sesgos, tasas de alucinación visual ni evaluación de calidad (FID, sincronización labial objetiva); no hay datos para valorar estos riesgos.
- Riesgo de uso indebido en la suplantación de identidad mediante avatares parlantes; la licencia no comercial y la atribución son las únicas salvaguardas documentadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la versión de precisión completa figura como "come soon", por lo que el ecosistema y la validación por terceros son aún incipientes.
- El identificador del repositorio en Hugging Face (shakko010203/NanoAvatar) difiere del usado en los enlaces de la model card (wpydcr/NanoAvatar), lo que puede provocar confusión al descargar artefactos.

## Enlaces

- Hugging Face: https://huggingface.co/shakko010203/NanoAvatar
- Repositorio de código y uso: https://github.com/wpydcr/NanoAvatar
- Descargas Android (Full / Lite): https://github.com/wpydcr/NanoAvatar/releases
- Guía para ejecutar en Android: https://github.com/wpydcr/NanoAvatar#run-on-android
- README en chino simplificado: https://huggingface.co/wpydcr/NanoAvatar/blob/main/README.zh-CN.md
- Codificador de audio upstream (chinese-hubert-large): https://huggingface.co/TencentGameMate/chinese-hubert-large
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
- Contacto para licencia comercial: wupingyu@mail.ustc.edu.cn
