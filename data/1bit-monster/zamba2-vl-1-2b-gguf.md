# 1bit-MONSTER/Zamba2-VL-1.2B-GGUF

## Resumen

Zamba2-VL-1.2B-GGUF es una conversión a formato GGUF del modelo multimodal Zyphra/Zamba2-VL-1.2B, publicada por el usuario 1bit-MONSTER. El modelo original combina un modelo de lenguaje de la familia Zamba2 con una torre de visión procedente de Qwen2.5-VL, por lo que acepta entradas mixtas de imagen y texto en una única conversación.

El repositorio distribuye dos artefactos: el modelo de lenguaje cuantizado en Q8_0 y el proyector multimodal (mmproj) en F16. La conversión, el código de modelo y la plantilla de chat que replica la disposición de imágenes de Zyphra son propios del autor y viven en un fork de llama.cpp (pull requests #16 y #17), no en el repositorio upstream.

Su interés práctico es doble: por un lado, permite ejecutar un VLM de algo más de 1.700 millones de parámetros en hardware de consumo mediante Vulkan o CPU; por otro, es una de las pocas vías documentadas para correr Zamba2-VL en llama.cpp. El contador de parámetros real (1.727.455.872) supera la denominación comercial de 1.2B, presumiblemente porque incluye la torre de visión además del modelo de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo multimodal compuesto por un LLM Zamba2 y una torre de visión Qwen2.5-VL; el detalle interno del bloque Zamba2 no se especifica en la información disponible |
| Parámetros totales | 1.727.455.872 (~1,73 mil millones) |
| Parámetros activos | No disponible (no se documenta como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q8_0 (modelo de lenguaje) y F16 (torre de visión, archivo mmproj) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF |
| Modelo base | Zyphra/Zamba2-VL-1.2B |
| Archivos del repositorio | Zamba2-VL-1.2B-Q8_0.gguf, mmproj-Zamba2-VL-1.2B-F16.gguf |
| Tamaño del repositorio | 3,2 GB |
| Fecha de publicación indicada | 26-09-2026 (creación) / 26-09-2026 (última actualización) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe el modelo como la unión de un LLM Zamba2 con una torre de visión Qwen2.5-VL, sin detallar el número de capas, el tipo de atención ni la composición exacta del bloque Zamba2. Tampoco se especifican los datos de entrenamiento del modelo base: ni volumen de tokens, ni composición del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias.

La innovación técnica documentada en esta conversión es de ingeniería de despliegue, no de entrenamiento: el autor ha implementado su propio conversor en un fork de llama.cpp y una plantilla de chat que coloca las imágenes en la misma posición que la implementación original de Zyphra. La validación se hizo comparando los embeddings de visión contra `transformers`, con una similitud coseno por token de 0,99989 en CPU y 0,99944 en Vulkan, lo que indica que la ruta de visión del GGUF reproduce fielmente la del modelo original.

## Capacidades

- Comprensión de imágenes: descripción de escenas, reconocimiento de formas, colores y disposición espacial de los elementos.
- Lectura de texto en imágenes (OCR ligero), con errores documentados por el propio autor en pruebas sintéticas.
- Generación de texto conversacional: el repositorio está etiquetado como `conversational`, e incluye una plantilla de chat embebida que se activa con `--jinja`.
- Entrada multimodal combinada de imagen y texto en un mismo turno.
- Ejecución en CPU y en GPU mediante Vulkan (backend validado explícitamente por el autor).
- No hay información sobre soporte de tool calling, function calling, agentes, multi-step reasoning, modo de razonamiento explícito ni capacidades de audio.
- No hay información sobre cobertura multilingüe; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Descripción automática de imágenes en local: catalogar fotografías o capturas sin enviar datos a servicios externos, aprovechando que el modelo cabe en una GPU de consumo.
- OCR ligero en flujos de digitalización: extracción de rótulos, titulares o texto impreso en documentos escaneados, asumiendo que el propio autor documenta errores de lectura en caracteres aislados.
- Moderación visual en el borde: clasificación previa de imágenes subidas por usuarios en una aplicación, filtrando contenido antes de escalarlo a un modelo mayor.
- Prototipado rápido de asistentes multimodales: validar la experiencia de conversación con imágenes antes de invertir en un modelo de mayor tamaño, dado el bajo coste de cómputo.
- Asistencia a personas con discapacidad visual: descripción verbal de escenas en dispositivos con GPU integrada, donde un VLM de miles de millones de parámetros no cabría.
- Verificación visual en sistemas embebidos o industriales: comprobar la disposición de piezas o indicadores luminosos en una línea de producción con hardware modesto, ejecutando vía Vulkan.
- Generación de descripciones para accesibilidad web: poblar atributos `alt` de imágenes de un CMS de forma semiautomática, revisando después la salida.
- Evaluación comparativa de conversiones GGUF: usar este repositorio como referencia para medir la fidelidad de embeddings de visión frente a `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible.

Los únicos datos de validación aportados por el autor son internos y de fidelidad de implementación, no de calidad de tarea:

| Prueba | Resultado |
|---|---|
| Similitud coseno por token de los embeddings de visión (CPU) | 0,99989 |
| Similitud coseno por token de los embeddings de visión (Vulkan) | 0,99944 |
| Imagen sintética (cuadrado rojo, círculo azul, texto "HELLO 42") | Formas, colores y disposición correctos; el texto se lee como "HElo 42" |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para el modelo de lenguaje en Q8_0 y entre 0,8 y 1,0 GB para el proyector de visión en F16, lo que suma unos 2,1-2,3 GB solo en pesos. Con caché KV y activaciones, conviene reservar entre 3 y 4 GB (estimación propia a partir del tamaño del repositorio, no confirmada por el autor).
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM; una RTX 3060 de 12 GB lo ejecuta con holgura y una RTX 4090 o una A100 están sobredimensionadas para este tamaño.
- Ejecución en CPU viable, ya que el autor ha validado la ruta de visión tanto en CPU como en Vulkan.
- Opciones de despliegue documentadas: el motor 1bit del propio autor (`1bit serve -m Zamba2-VL-1.2B-Q8_0.gguf --mmproj mmproj-Zamba2-VL-1.2B-F16.gguf --device vulkan`) y el fork de llama.cpp del autor, pasando `--jinja` para que se aplique la plantilla de chat embebida.
- Otros runtimes GGUF (Ollama, LM Studio, TGI, vLLM) no están documentados para esta conversión; el modelo de lenguaje podría cargarse, pero la parte de visión requiere soporte explícito de archivos mmproj.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Zamba2-VL-1.2B-GGUF (esta ficha) | 1.727.455.872 | No disponible | Apache 2.0 | GGUF (Q8_0 + mmproj F16) | HuggingFace, 0 descargas |
| Zyphra/Zamba2-VL-1.2B | No disponible | No disponible | Apache 2.0 | No disponible en esta búsqueda | Modelo base oficial |
| Qwen2.5-VL-3B (comparador de categoría) | No verificado en la información disponible | No verificado | Apache 2.0 según su publicación oficial | Safetensors y GGUF de terceros | Ampliamente desplegado |
| SmolVLM (comparador de categoría) | No verificado en la información disponible | No verificado | Apache 2.0 según su publicación oficial | Safetensors, GGUF, MLX | Ampliamente desplegado |

No se dispone de datos verificados de rendimiento comparado entre estos modelos dentro de la información proporcionada; las cifras de los comparadores deben consultarse en sus fichas oficiales.

## Limitaciones y advertencias

- El propio autor documenta un fallo de OCR: el texto "HELLO 42" se transcribe como "HElo 42", lo que indica que la lectura de caracteres no es fiable en mayúsculas y cifras.
- Es una conversión de terceros, no una publicación oficial de Zyphra; no consta revisión por parte del equipo del modelo base.
- El conversor vive en un fork personal de llama.cpp (PRs #16 y #17) que puede no estar fusionado en el repositorio upstream, lo que dificulta el mantenimiento y la reproducibilidad a largo plazo.
- Con 0 descargas y 0 likes, no hay validación independiente de la comunidad sobre esta conversión.
- La ficha de HuggingFace indica fechas de creación y actualización de septiembre de 2026, un dato atípico que conviene verificar antes de citarlo.
- No hay información sobre sesgos, comportamientos tóxicos, alineación ni evaluación de seguridad del modelo base ni de la conversión.
- No hay información disponible sobre idiomas soportados, por lo que no puede garantizarse un rendimiento correcto en castellano.
- Se desconoce la longitud de contexto real, lo que impide planificar flujos con documentos largos o conversaciones extensas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar los avisos de atribución a Zyphra y al proyecto 1bit engine.
- La calidad global está acotada por el tamaño del modelo (alrededor de 1,2 mil millones de parámetros en el componente de lenguaje): es previsible un rendimiento limitado en razonamiento complejo, matemáticas y seguimiento de instrucciones largas, aunque no se aportan benchmarks que lo cuantifiquen.

## Enlaces

- Repositorio GGUF: https://huggingface.co/1bit-MONSTER/Zamba2-VL-1.2B-GGUF
- Modelo base: https://huggingface.co/Zyphra/Zamba2-VL-1.2B
- Motor de inferencia del autor: https://github.com/1bit-MONSTER/engine
- Fork de llama.cpp con el conversor: https://github.com/1bit-MONSTER/llama.cpp
- Pull request del conversor (llama.cpp #16): https://github.com/1bit-MONSTER/llama.cpp/pull/16
- Pull request del conversor (llama.cpp #17): https://github.com/1bit-MONSTER/llama.cpp/pull/17

Las búsquedas web realizadas no han devuelto resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a la unidad de información "bit" y a la plataforma comercial 1Bit AI, sin relación con el repositorio.
