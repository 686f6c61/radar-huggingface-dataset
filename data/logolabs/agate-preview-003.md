# Logolabs/agate-preview-003

## Resumen

Agate Preview 003 es un modelo de difusion texto-a-imagen desarrollado por LogoLabs, una empresa dedicada a la generacion de logotipos con IA. Se trata de un modelo compacto de 261M parametros (con decodificador TAESD) que genera imagenes de 512 x 512 pixeles a partir de prompts en ingles, partiendo de la arquitectura de su predecesor de 256 px. Su relevancia radica en que es el primer Agate que supera a Stable Diffusion 1.5 en Qwen-Image-Bench (32,6 frente a 29,1) con dos ordenes de magnitud menos de parametros que los modelos de difusion habituales, y en que cabe holgadamente en una GPU de consumo.

El modelo se construye como una red de 256 px convertida en multi-resolucion mediante adiciones que inicialmente actuan como no-ops exactos, entrenada a 256 y 512 px y despues afinada con perdidas perceptuales (LPIPS y caracteristicas DINOv2). El entrenamiento completo de la linea de modelos consume 282,8 GH200-horas, 164,5 kWh y 4,94 kg CO2e, lo que lo situa en un regimen de coste muy inferior al de los modelos de difusion de gran escala.

Se distribuye con licencia MIT tanto para codigo como para pesos, en formato safetensors y ONNX, y admite ejecucion en Python, mediante nodos de ComfyUI (version 0.4.0) y en el navegador a traves de una demo WebGPU. Su estado es de "research preview", con 373 descargas y 10 me gusta en HuggingFace en el momento de la consulta, y esta especializado en generacion de glifos y simbolos, aunque su uso no se limita a ese dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen con flow matching / rectified flow; red multi-resolucion derivada de la red de 256 px (componente de planificacion "thinker" + componente de render "renderer") |
| Parametros totales | 261M con decodificador TAESD; 309,8M con SD-VAE (192,1M del generador activo + 68,1M de codificador de texto y decodificador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la entrada es un prompt de texto en ingles; no se especifica longitud maxima) |
| Tipos de cuantizacion | No disponible (la inferencia de referencia usa bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (codigo y pesos) |
| Formato de pesos | safetensors y ONNX |
| Resolucion de salida | 512 x 512 (principal) y 256 x 256 |
| Pasos de muestreo por defecto | 50 (Euler) |
| CFG por defecto | 3,0 |
| Tamano del repositorio | 2,9 GB |
| Estado | Research preview |

## Arquitectura y entrenamiento

Agate Preview 003 parte del run de 256 px de Agate (paso 121.440) y anade 24.900 pasos adicionales de entrenamiento a 256 y 512 px. La modificacion arquitectonica clave es que el componente de planificacion ("thinker") sigue operando sobre una rejilla de 16 x 16, pero lee el latente de 64 x 64 mediante su lectura original con submuestreo de stride 2 mas una nueva rama convolucional. El "renderer" funciona a 64 x 64 con coordenadas crudas y una senal explicita de resolucion, y el muestreador aplica el desplazamiento de resolucion 2 de SD3 cuando se genera a 512 px. En la linea de modelos completa se han visto 196,6M de imagenes.

El ultimo run de afinado (mr512_perc1) mantiene la perdida de flow pero pondera cada celda del latente por su saliencia UNISAL con la formula w = 1 + 0,1·t·(q − 1), donde q es la saliencia de la celda respecto a la media de la imagen, con un tope de 5x y mapas calculados una sola vez y cacheados. Ademas anade LPIPS (factor 0,1, textura local) y caracteristicas de parches de DINOv2 (P-DINO, factor 0,01, estructura) sobre la estimacion de un paso decodificada por el VAE, solo para t > 0,3, siguiendo la receta PixelGen. El autor indica que la mejora en Qwen-Image-Bench respecto a Preview 002 no se puede atribuir por separado al cambio a 512 px o a estas perdidas, y que un afinado posterior sin ellas empeoro LPIPS un 1,8% y P-DINO un 2,0%. El pipeline de prompts normaliza mayusculas y titulos fuera de comillas, canoniza numeros escritos con palabras, mueve "without X" / "no X" al prompt negativo, deletrea letra a letra el texto entre comillas dobles y marca los recuentos de objetos.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512 x 512 y 256 x 256 a partir de prompts en ingles.
- Generacion de texto dentro de la imagen: el pipeline deletrea letra a letra el contenido entre comillas dobles, lo que permite rotulos, carteles y logotipos con texto legible.
- Control de recuento de objetos: un codigo de conteo marca el numero de objetos indicado, lo que facilita prompts del tipo "tres manzanas rojas sobre una mesa".
- Manejo de negaciones: las expresiones "without X" y "no X" se redirigen automaticamente al prompt negativo, con CFG por defecto de 3,0 contra ese prompt negativo.
- Reproducibilidad mediante semilla: la misma semilla produce la misma imagen.
- Seleccion de resolucion en tiempo de inferencia (512 con desplazamiento de resolucion o 256 sin el).
- Guardado con metadatos de imagen generada por IA en el PNG a traves de `agate.save`, con soporte de la dependencia `invisible-watermark`.
- Integracion en flujos de trabajo: API de Python, nodos de ComfyUI 0.4.0 y demo WebGPU ejecutable en navegador.
- Capacidades de tool calling, function calling, agentes, vision o audio: no disponibles (el modelo es exclusivamente de generacion de imagenes).

## Casos de uso

- Generacion de logotipos y simbolos: es el proposito declarado del estudio de arquitectura de LogoLabs, y el pipeline de prompts permite forzar el texto exacto de un logotipo entre comillas dobles, deletreado letra a letra.
- Rotulos y carteles con texto integrado: prompts como el ejemplo oficial ("a shop sign that says \"OPEN\"...") producen senaletica legible, algo historicamente fragil en modelos de difusion de este tamano.
- Prototipado rapido de diseno grafico: con 2,9 s por imagen a 512 px en una RTX 4060, un disenador puede iterar decenas de variaciones por minuto sin depender de infraestructura en la nube.
- Ilustracion de contenido para aplicaciones web o moviles: el modelo ocupa 2,9 GB de repositorio y 5,7 GB de VRAM en pico, por lo que puede desplegarse en el mismo servidor que la aplicacion sin GPU dedicada de gama alta.
- Demos interactivas en el navegador: la demo WebGPU (~14 s por imagen a 512 px en una RTX 4060) permite ofrecer generacion de imagenes en el cliente sin coste de servidor ni envio de prompts a terceros.
- Generacion de conjuntos de datos sinteticos de simbolos y glifos: la licencia MIT sobre los pesos permite producir y redistribuir imagenes generadas con fines de entrenamiento.
- Integracion en pipelines de ComfyUI: el nodo oficial 0.4.0 permite encadenar Agate con upscalers, control de paleta o postprocesado dentro de grafos existentes.
- Punto de partida para fine-tuning: al ser un modelo compacto con licencia permisiva, sirve como base para adaptaciones de dominio siempre que se conserve el objetivo de afinado con perdidas perceptuales, segun la advertencia del autor.
- Experimentacion academica en metodos de difusion eficientes: sus 282,8 GH200-horas de entrenamiento y sus perdidas ponderadas por saliencia lo hacen util para estudiar objetivos alternativos en modelos pequenos.

## Benchmarks y rendimiento

| Modelo | Qwen-Image-Bench (1.000 prompts) | GenEval (scorer oficial) |
|---|---|---|
| Agate Preview 003 | 32,6 | 0,554 |
| Agate Preview 002 | 28,9 | 0,577 |
| Agate Preview 001 | 28,2 | 0,550 |
| Stable Diffusion 1.5 | 29,1 | 0,43 (publicado) |
| SDXL | No disponible | 0,55 (publicado) |

Datos de la model card del autor. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM en inferencia: 5,7 GB en pico a 512 px y bf16, segun la model card.
- GPU recomendadas: no se citan modelos profesionales; el dato de referencia es una RTX 4060, que genera una imagen de 512 px en 2,9 s con 50 pasos, bf16 y CUDA graphs, y 4,5 s sin CUDA graphs. No se requieren A100 ni H100 para inferencia.
- Compatibilidad con GPU de consumo: si, cabe en GPU de gama media como la RTX 4060 y superiores.
- Ejecucion en CPU: soportada, con aproximadamente 100 s por imagen de 512 px.
- Ejecucion en navegador: mediante WebGPU, aproximadamente 14 s por imagen de 512 px en una RTX 4060.
- Opciones de despliegue: pipeline `AgatePipeline` en Python (con `torch`, `transformers`, `diffusers`, `safetensors`, `huggingface_hub`, `pillow` e `invisible-watermark`), nodos de ComfyUI 0.4.0 y demo WebGPU en HuggingFace Spaces. Se distribuyen pesos en safetensors y ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no se publican cifras de throughput por lote; las unicas cifras de latencia son las de la RTX 4060 (2,9 s), CPU (~100 s) y WebGPU (~14 s).
- Coste de entrenamiento: 282,8 GH200-horas para toda la linea desde cero, mas 22,5 GH200-horas para la preparacion de datos a 512 px; 164,5 kWh y 4,94 kg CO2e, con energia de GPU medida con perun.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Qwen-Image-Bench | GenEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Agate Preview 003 | 261M con TAESD; 309,8M con SD-VAE | 512 x 512 (y 256 x 256) | 32,6 | 0,554 | MIT | Pesos en safetensors y ONNX; Python, ComfyUI y WebGPU |
| Agate Preview 002 | No disponible | 256 x 256 (segun la linea de modelos descrita) | 28,9 | 0,577 | No disponible | No disponible |
| Agate Preview 001 | No disponible | No disponible | 28,2 | 0,550 | No disponible | No disponible |
| Stable Diffusion 1.5 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | 29,1 | 0,43 (publicado) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| SDXL | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible | 0,55 (publicado) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

Las cifras de SD 1.5 y SDXL proceden de la model card de Agate Preview 003. No se dispone de datos de parametros, licencia ni formato de pesos de los modelos comparados en la informacion proporcionada. La comparativa relevante es interna a la familia Agate: 003 mejora a 002 en Qwen-Image-Bench (32,6 frente a 28,9) pero empeora ligeramente en GenEval (0,554 frente a 0,577).

## Limitaciones y advertencias

- Estado de research preview: el autor no lo presenta como un modelo listo para produccion sin validacion adicional.
- Idioma: solo se declara soporte de ingles; los prompts en otros idiomas, incluido el castellano, no estan cubiertos.
- Resolucion limitada: 512 x 512 como maximo, lo que restringe su uso en aplicaciones que requieran alta resolucion sin un upscaler posterior.
- Sesgos: no se documentan sesgos conocidos en la model card; al no haberse publicado analisis de sesgo ni composicion detallada del dataset (LucasFang/FLUX-Reason-6M), no es posible descartar sesgos heredados de los datos de entrenamiento.
- Alucinacion: como todo modelo de difusion generativo, puede producir contenido visual incoherente o inexacto respecto al prompt; la model card reconoce ademas que no se ha podido atribuir la mejora de Qwen-Image-Bench entre el cambio a 512 px y las nuevas perdidas perceptuales.
- Dependencia oculta: el pipeline completo requiere `invisible-watermark` para el marcado y `agate.save` para conservar los metadatos de IA en el PNG; omitir estos pasos puede tener implicaciones de trazabilidad.
- Fine-tuning: el autor advierte que los fine-tunes de 003 deben mantener el objetivo con perdidas perceptuales, ya que un afinado sin ellas empeoro LPIPS un 1,8% y P-DINO un 2,0% sobre la base.
- Licencia: MIT para codigo y pesos, lo que permite uso comercial, pero la responsabilidad sobre el contenido generado y sobre los datos de entrenamiento subyacentes recae en el usuario.
- Datos de rendimiento limitados: solo se publican dos benchmarks (Qwen-Image-Bench y GenEval) y ninguna medicion de throughput por lote, por lo que las estimaciones de produccion a gran escala no estan respaldadas por cifras publicas.
- Adopcion reducida: 373 descargas y 10 me gusta en HuggingFace, lo que implica poca comunidad, pocos informes independientes y menor soporte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Logolabs/agate-preview-003
- Modelo base: https://huggingface.co/Logolabs/agate-preview-001
- Sitio del autor (LogoLabs): https://logolabs.org
- Nodos de ComfyUI: https://github.com/logolabs/agate-comfyui
- Demo WebGPU: https://huggingface.co/spaces/Logolabs/agate-webgpu
- Dataset de entrenamiento: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Identificadores arXiv citados en las etiquetas del repositorio (sin titulo ni autor disponibles en la informacion proporcionada): https://arxiv.org/abs/2603.09408, https://arxiv.org/abs/2201.03545, https://arxiv.org/abs/2301.00808, https://arxiv.org/abs/2212.11972, https://arxiv.org/abs/2103.03206, https://arxiv.org/abs/2107.14795, https://arxiv.org/abs/2502.05171, https://arxiv.org/abs/2104.09864, https://arxiv.org/abs/2010.04245, https://arxiv.org/abs/2309.14322, https://arxiv.org/abs/1709.07871, https://arxiv.org/abs/1903.07291, https://arxiv.org/abs/2302.05543, https://arxiv.org/abs/2209.03003, https://arxiv.org/abs/2210.02747, https://arxiv.org/abs/2403.03206, https://arxiv.org/abs/2207.12598, https://arxiv.org/abs/2406.02507, https://arxiv.org/abs/2507.11412, https://arxiv.org/abs/2412.13663, https://arxiv.org/abs/2112.10752, https://arxiv.org/abs/1711.05101, https://arxiv.org/abs/2202.10054, https://arxiv.org/abs/2509.09680, https://arxiv.org/abs/2310.11513, https://arxiv.org/abs/2112.01527, https://arxiv.org/abs/2103.00020, https://arxiv.org/abs/2605.28091, https://arxiv.org/abs/2309.06180, https://arxiv.org/abs/1706.08500, https://arxiv.org/abs/2306.04675, https://arxiv.org/abs/2304.07193, https://arxiv.org/abs/2307.01952, https://arxiv.org/abs/2310.00426, https://arxiv.org/abs/2403.04692, https://arxiv.org/abs/2410.08261, https://arxiv.org/abs/2410.10629, https://arxiv.org/abs/2407.15811, https://arxiv.org/abs/2306.00637, https://arxiv.org/abs/2412.09619, https://arxiv.org/abs/1801.03924, https://arxiv.org/abs/2003.05477, https://arxiv.org/abs/2405.18392
- Los resultados de busqueda web consultados no aportaron enlaces relevantes al modelo (solo referencias a DeviantArt).
