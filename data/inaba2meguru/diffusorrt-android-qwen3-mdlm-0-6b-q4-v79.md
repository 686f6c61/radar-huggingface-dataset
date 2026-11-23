# Inaba2Meguru/DiffusorRT-Android-Qwen3-MDLM-0.6B-Q4-V79

## Resumen

DiffusorRT-Android-Qwen3-MDLM-0.6B-Q4-V79 es un paquete de ejecución compilado para Android derivado del modelo `dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1`, un modelo de lenguaje de 0,6 mil millones de parámetros de la familia Qwen3 adaptado a decodificación por difusión (MDLM, Masked Diffusion Language Model). El autor, Inaba2Meguru, ha cuantizado los pesos a 4 bits y los ha compilado como binarios de contexto `qnn.htp` con QAIRT 2.45.0.260326 para ejecutarse sobre la NPU Hexagon V79 del SoC Snapdragon 8 Elite (SM8750).

No se trata de un checkpoint de Transformers ni de una aplicación autónoma, sino de un artefacto de despliegue pensado para la app DiffusorRT en Android. El paquete incluye la model card de la app (`phone.json`), los activos del tokenizador (`bpe.json`) y los binarios compilados, con un tamaño de repositorio de 0,8 GB (1,36 GB en total al sumar los archivos descargados del pack de iPhone referenciado).

Su relevancia es doble: por un lado, demuestra la viabilidad de ejecutar modelos de difusión de lenguaje en NPUs móviles; por otro, documenta un patrón de empaquetado reproducible (con SHA-256 por archivo y fijado a commit) para integrar modelos en aplicaciones Android. Las capacidades declaradas se limitan a chat y a una función de reescritura de un fragmento seleccionado mediante difusión, con soporte de polaco mencionado de forma explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MDLM (Masked Diffusion Language Model) sobre base Qwen3; compilado como binarios de contexto QNN HTP |
| Parámetros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (Q4) |
| Idiomas soportados | no disponible; la model card menciona chat y polaco para la función de reescritura |
| Licencia | Apache 2.0 |
| Formato de pesos | binarios de contexto `qnn.htp` (QAIRT 2.45.0.260326), más `phone.json` y `bpe.json`; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es `Qwen3-0.6B-diffusion-mdlm-v0.1`, una adaptación de Qwen3-0.6B al paradigma de difusión de lenguaje enmascarada (MDLM). En lugar de generar tokens de forma autorregresiva, el modelo parte de una secuencia enmascarada y la refina iterativamente mediante un proceso de denoising, lo que permite generar y reescribir fragmentos de forma no secuencial. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El artefacto publicado no contiene pesos en formato estándar, sino que ha sido compilado con QAIRT 2.45.0.260326 para el backend Hexagon de Qualcomm y cuantizado a 4 bits. El paquete reutiliza sin cambios el conjunto de ejecución del pack de iPhone (jimmylearnML/DiffusorRT-iPhone-Qwen3-MDLM-0.6B-Q4 en la revisión `cf81b92b`), mientras que los pesos originales y la atribución proceden de `dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1` en la revisión `c8d24a3f`. El archivo `android-pack.json` especifica, por cada fichero, la ruta destino en la carpeta de modelos de la app (`Android/data/ai.diffusorrt.phone/files/models/qwen3-mdlm-q4-v79/`), su tamaño y su SHA-256, además del repositorio, revisión y ruta de descarga para los ficheros heredados del pack de iPhone.

## Capacidades

- Generación de texto conversacional (chat) mediante decodificación por difusión.
- Reescritura de un fragmento seleccionado ("Polish") usando el mismo mecanismo de difusión sobre la secuencia enmascarada.
- Ejecución en la NPU Hexagon V79 del Snapdragon 8 Elite (SM8750) mediante binarios de contexto QNN HTP.
- Soporte de polaco mencionado explícitamente para la función de reescritura; el resto de idiomas no está documentado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documentan capacidades de código ni matemáticas de forma específica.

## Casos de uso

- Asistente de chat local en Android: la app DiffusorRT puede cargar el paquete y ejecutar conversaciones en el dispositivo sin conexión, aprovechando la NPU Hexagon para reducir consumo y latencia frente a una ejecución en CPU.
- Reescritura de texto en aplicaciones de edición: la función "Polish" permite seleccionar un fragmento y regenerarlo por difusión, útil en apps de notas o correo que necesiten reformular frases sin enviar datos a la nube.
- Procesamiento de texto en polaco en movilidad: para usuarios que requieran reescritura o chat en ese idioma en un dispositivo Snapdragon 8 Elite, con la salvedad de que el resto de idiomas no está documentado.
- Prototipado de modelos de difusión de lenguaje en hardware móvil: investigadores pueden usar este paquete como referencia reproducible (con SHA-256 y revisión fijada) para medir el rendimiento de MDLM en NPU.
- Integración en pipelines de aplicaciones Android: el `android-pack.json` permite automatizar la descarga y verificación de los ficheros en la carpeta de modelos de la app, facilitando despliegues controlados.
- Evaluación comparativa de cuantización 4 bits en NPU: sirve para estudiar la degradación de calidad de un modelo de 0,6B tras cuantizar a 4 bits y compilar para Hexagon, frente a ejecuciones en CPU o GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados de hardware, cuando se reportan, son específicos del dispositivo y del prompt.

## Requisitos de hardware

- VRAM: no aplica; el paquete está compilado para ejecutarse en la NPU Hexagon V79, no en GPU.
- GPU recomendadas: no aplica para este artefacto; los binarios `qnn.htp` solo se ejecutan en la NPU del SoC Snapdragon 8 Elite (SM8750).
- Compatibilidad con GPU de consumo: no; el paquete no está pensado para RTX 4090, A100 ni H100.
- Opciones de despliegue: app DiffusorRT para Android con QAIRT 2.45.0.260326; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del dispositivo y del prompt según la propia model card.
- Espacio en disco: 0,8 GB en el repositorio y 1,36 GB en total al incluir los ficheros descargados del pack de iPhone.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiffusorRT-Android-Qwen3-MDLM-0.6B-Q4-V79 | 0,6B | no disponible | qnn.htp (QNN HTP) | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1 | 0,6B | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| jimmylearnML/DiffusorRT-iPhone-Qwen3-MDLM-0.6B-Q4 | 0,6B | no disponible | paquete para iPhone | no disponible | Hugging Face (revisión cf81b92b) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El artefacto no es un checkpoint de Transformers: solo funciona con los binarios de contexto QNN en la NPU Hexagon V79 del Snapdragon 8 Elite; no es portable a otros SoC ni a GPU de escritorio.
- La cuantización a 4 bits puede degradar la calidad respecto al modelo base de 0,6B; no se documenta la pérdida medida.
- Los idiomas soportados no están especificados; solo se menciona chat y polaco, por lo que el comportamiento en castellano u otros idiomas no está garantizado.
- No se documentan sesgos conocidos, riesgo de alucinación ni evaluaciones de seguridad; al ser un modelo de 0,6B, la fiabilidad factual es limitada.
- La licencia Apache 2.0 permite uso comercial, pero los derechos de los pesos originales pertenecen a los autores de `dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1`, que retienen sus derechos según el NOTICE.
- El paquete reutiliza sin cambios el conjunto de ejecución del pack de iPhone; cualquier cambio en ese repositorio o en su revisión puede afectar a la reproducibilidad si no se fija el commit.
- Para producción, es necesario verificar los SHA-256 de cada fichero indicados en `android-pack.json` antes de la carga.
- No hay métricas de latencia ni throughput publicadas; el rendimiento depende del dispositivo y del prompt.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Inaba2Meguru/DiffusorRT-Android-Qwen3-MDLM-0.6B-Q4-V79
- Modelo base: https://huggingface.co/dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1/tree/c8d24a3f4adaeef46881b450e1bf7d1005203bd7
- Pack de iPhone referenciado: https://huggingface.co/jimmylearnML/DiffusorRT-iPhone-Qwen3-MDLM-0.6B-Q4/tree/cf81b92b97162d9ae4a3bb5c6248030d24cfbbe5
- Licencia: https://huggingface.co/Inaba2Meguru/DiffusorRT-Android-Qwen3-MDLM-0.6B-Q4-V79/blob/main/LICENSE
- Aviso legal: https://huggingface.co/Inaba2Meguru/DiffusorRT-Android-Qwen3-MDLM-0.6B-Q4-V79/blob/main/NOTICE
- Manifiesto de integración: https://huggingface.co/Inaba2Meguru/DiffusorRT-Android-Qwen3-MDLM-0.6B-Q4-V79/blob/main/android-pack.json
