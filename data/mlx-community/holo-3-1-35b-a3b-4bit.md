# mlx-community/Holo-3.1-35B-A3B-4bit

## Resumen

Holo-3.1-35B-A3B-4bit es la cuantización a 4 bits en formato MLX del modelo Holo-3.1-35B-A3B desarrollado por H Company. Se trata de un modelo multimodal de tipo image-text-to-text orientado especificamente a agentes de interfaz grafica (GUI agents) y computer use: recibe capturas de pantalla junto con instrucciones en lenguaje natural y produce acciones sobre la interfaz, fundamentalmente coordenadas de clic. La conversión la firma mlx-community y está pensada para ejecución local eficiente en hardware Apple Silicon mediante la librería mlx-vlm.

Arquitectónicamente es un transformer con mezcla de expertos (MoE) de 35.107.181.936 parámetros totales, según los pesos safetensors publicados. La nomenclatura A3B del nombre indica aproximadamente 3.000 millones de parámetros activos por token, aunque el dato exacto no se detalla en la información disponible. El repositorio ocupa 20,4 GB en formato 4-bit, frente a los 70 GB que ocupa el checkpoint original en bfloat16, lo que permite ejecutarlo en equipos con 32 GB de memoria unificada o superior.

Su relevancia actual reside en que los agentes que operan interfaces graficas necesitan modelos capaces de localizar elementos visuales con precision subpixel y baja latencia, y esta versión cuantizada conserva una precisión de clic del 90,2 % en WebClick con un rendimiento de decodificación de 125-134 tokens por segundo en un Apple M5 Max. La licencia Apache-2.0 del modelo original se preserva, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); tag `qwen3_5_moe`; incluye torre de vision y capas DeltaNet segun la receta de cuantizacion |
| Parametros totales | 35.107.181.936 |
| Parametros activos | aproximadamente 3.000 millones (inferido de la nomenclatura A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine con group size 64; routers en 8-bit; torre de vision en bfloat16; existe tambien una version MLX de 8 bits y un GGUF oficial Q4_K_M |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); el modelo original dispone tambien de GGUF, NVFP4 y FP8 |
| Tamano del repositorio | 20,4 GB |
| Modalidad de entrada | imagen y texto (image-text-to-text) |
| Libreria de inferencia | mlx-vlm 0.8.0, mlx 0.32.4 |
| Modelo base | Hcompany/Holo-3.1-35B-A3B |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos. El tag `qwen3_5_moe` de Hugging Face sugiere una arquitectura derivada de la familia Qwen3.5 MoE, aunque la información disponible no confirma la relación ni detalla la configuración de expertos. La receta de cuantizacion aplicada por mlx-community menciona explicitamente expertos, atención, capas DeltaNet, experto compartido, embeddings y lm_head cuantizados a 4 bits con group size 64, mientras que los routers se mantienen en 8 bits y la torre de vision se conserva íntegra en bfloat16. La presencia de capas DeltaNet apunta a una arquitectura híbrida que combina atención con mecanismos de estado lineal, si bien no se especifica el ratio entre ambos tipos de capa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. El modelo está especializado en localización visual y acciones de agente, con una receta de prompt propia que emite coordenadas como enteros en el rango [0, 1000] y admite modo thinking desactivable. La conversión se realizó desde los pesos oficiales en bfloat16, no desde las versiones NVFP4 o FP8, y se validó comparando la KL media frente a la referencia bfloat16 ejecutada con transformers: 2,3e-3 en capturas 720p y 2,0e-3 en 1080p sobre las logits de respuesta de clic con teacher forcing, con primer token idéntico.

## Capacidades

- Localización visual de elementos de interfaz: genera coordenadas de clic normalizadas en [0, 1000] a partir de capturas de pantalla y una instrucción en lenguaje natural.
- Comprensión de imágenes y texto combinados: pipeline image-text-to-text con torre de vision en bfloat16.
- Agentes de interfaz grafica (GUI agents) y computer use: diseñado para decidir acciones sobre pantallas de escritorio y web.
- Procesamiento de prompts multi-imagen: validado con tres capturas de 1920x1080 simultáneas, aproximadamente 12.000 tokens de prompt.
- Modo thinking activable y desactivable; la receta oficial de evaluación usa thinking desactivado con 32 tokens nuevos.
- Generación de texto conversacional en inglés.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Soporte de audio o vídeo: no disponible.

## Casos de uso

- Automatización de pruebas de interfaz web: el modelo puede recibir una captura de la pagina y una instrucción como "pulsa el boton de enviar" y devolver las coordenadas exactas, lo que permite construir suites de test end-to-end que se adaptan a cambios de layout sin selectores CSS fragiles. Su precisión del 90,2 % en WebClick lo hace viable para este fin.
- Agentes de escritorio para tareas repetitivas: con 125-134 tokens/s de decodificación en Apple Silicon, un bucle de percepción-acción sobre capturas de pantalla puede ejecutarse con latencias de primer token de 370-380 ms en 720p, suficiente para interacciones cuasi interactivas.
- Rellenado automatizado de formularios y flujos administrativos: el modelo localiza campos y controles a partir de una descripción textual, lo que permite automatizar procesos internos sobre aplicaciones legacy sin API.
- Asistencia a personas con movilidad reducida: control por instrucciones en lenguaje natural sobre la pantalla del sistema, traduciendo órdenes verbales en clics concretos con coordenadas verificables.
- Extracción de datos de paneles y dashboards: combinado con un orquestador, el modelo puede localizar graficos y tablas en capturas para que otro componente realice OCR o extracción estructurada, aprovechando su capacidad de procesar varias imágenes en un mismo prompt.
- Despliegue local en estaciones de trabajo Apple Silicon: al ocupar 22,5 GB de pico en memoria con MLX, cabe en equipos de 32 GB o más y permite procesar capturas de datos sensibles sin enviarlas a la nube, algo relevante en entornos con requisitos de privacidad.
- Evaluación comparativa de agentes GUI: sirve como referencia cuantizada para medir la degradación de precisión frente al checkpoint bfloat16 en pipelines de investigación.

## Benchmarks y rendimiento

Precisión de clic en WebClick (Hcompany/WebClick, 1639 muestras, protocolo oficial de localización, thinking off, greedy, 32 tokens nuevos):

| Modelo / motor | Precisión | IC 95 % |
|---|---|---|
| MLX 8bit | 90,5 % | 89,0 - 91,9 |
| MLX 4bit (este modelo) | 90,2 % | 88,6 - 91,5 |
| llama.cpp Q4_K_M (GGUF oficial) | 91,5 % | 90,1 - 92,8 |

La diferencia entre MLX 4-bit y 8-bit no resultó estadísticamente significativa (p = 0,55); la del GGUF oficial frente a las builds MLX sí lo fue (p = 0,01 para 4-bit y p = 0,03 para 8-bit), aunque el preprocesado difiere entre motores y la diferencia no puede atribuirse solo a los pesos.

Velocidad en Apple M5 Max de 128 GB, petición única, greedy:

| Motor | 1280x720: primer token / decodificación | 1920x1080: primer token / decodificación | Memoria |
|---|---|---|---|
| MLX 4bit (este modelo) | 370-380 ms / 132-134 tok/s | 1,05-1,10 s / 125-130 tok/s | 22,5 GB (pico) |
| llama.cpp Metal, Q4_K_M | 814-869 ms / 110-119 tok/s | 2,4-2,7 s / 110-119 tok/s | 22,9 GB (RSS) |

Con prompt largo de tres capturas 1080p (unos 12.000 tokens de prompt y 1.024 tokens generados):

| Motor | Tiempo al primer token | Decodificación | Memoria |
|---|---|---|---|
| MLX 4bit (este modelo) | 9,8 s (medición variable) | 77 tok/s | 22,7 GB (pico) |
| llama.cpp Metal, Q4_K_M | 17,2 s | 59 tok/s | 23,0 GB (RSS) |

El autor advierte que la máquina estaba compartida con otras tareas y que las cifras son indicativas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento o código en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión WebClick | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Holo-3.1-35B-A3B-4bit (MLX) | 35,1 B totales, ~3 B activos | no disponible | 90,2 % | Apache-2.0 | safetensors MLX, 20,4 GB |
| Holo-3.1-35B-A3B-8bit (MLX) | 35,1 B totales | no disponible | 90,5 % | Apache-2.0 | safetensors MLX |
| Holo-3.1-35B-A3B GGUF Q4_K_M (llama.cpp) | 35,1 B totales | no disponible | 91,5 % | Apache-2.0 | GGUF |
| Holo-3.1-35B-A3B bfloat16 (original) | 35,1 B totales | no disponible | no disponible | Apache-2.0 | safetensors, 70 GB |

No se dispone de datos de benchmarks de otros modelos de agentes GUI en la información proporcionada, por lo que no es posible una comparación cruzada con alternativas de otros autores.

## Limitaciones y advertencias

- Modelo especializado en inglés: la model card declara únicamente `en`, por lo que el rendimiento en castellano u otros idiomas no está validado.
- Es una cuantización a 4 bits: aunque la pérdida de precisión frente a 8 bits no fue estadísticamente significativa en WebClick, sí existe degradación frente al checkpoint bfloat16 en la KL de las logits (2,3e-3 en 720p, 2,0e-3 en 1080p).
- Las cifras de velocidad proceden de una máquina compartida con otras cargas y el propio autor las califica de indicativas; algunas celdas variaron más del 10 % entre ejecuciones.
- Las pruebas de clic sobre capturas sintéticas son smoke tests, no una validación exhaustiva; el benchmark real es WebClick con 1639 muestras.
- Riesgo de alucinación de coordenadas: el modelo puede devolver puntos fuera del elemento objetivo o inventar controles inexistentes en pantallas no vistas durante el entrenamiento; conviene validar cada acción en producción.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Dependencia de hardware Apple: el formato MLX solo se ejecuta de forma nativa en Apple Silicon mediante mlx-vlm; para otros entornos debe usarse el GGUF oficial o los pesos originales.
- Requiere la receta de prompt exacta del modelo original (coordenadas enteras en [0, 1000] y `smart_resize`); desviarse de ella degrada la precisión de localización.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datos de entrenamiento originales, no detalladas aquí.
- Longitud de contexto no publicada: planificar despliegues con prompts multi-imagen largos requiere validación empírica propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Holo-3.1-35B-A3B-4bit
- Modelo base original: https://huggingface.co/Hcompany/Holo-3.1-35B-A3B
- Dataset de evaluación WebClick: https://huggingface.co/datasets/Hcompany/WebClick
- Sitio de H Company: https://www.hcompany.ai/
- Librería mlx-vlm: https://pypi.org/project/mlx-vlm/
