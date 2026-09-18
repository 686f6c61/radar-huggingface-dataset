# matlod/minimax-h3-turnaround

## Resumen

H3 Turnaround es un adaptador LoRA desarrollado por el usuario matlod sobre el modelo de difusión de vídeo y audio MiniMax-H3 (MiniMaxAI/MiniMax-H3). No es un modelo de lenguaje ni un modelo generativo completo: es un adaptador de bajo rango (rank 16, atención únicamente, 100 módulos en 50 bloques, 63 MB por fichero) que transforma la generación de vídeo de H3 en una herramienta de creación de hojas de personaje. A partir de una única imagen de referencia y una instrucción, produce cinco vistas coherentes del mismo sujeto con rotaciones progresivas, decodificadas como imágenes independientes en una sola pasada.

La innovación técnica consiste en reutilizar el eje temporal del modelo de vídeo como eje de ranuras: cinco latentes de imagen independientes se empaquetan donde iría un latente de vídeo de cinco posiciones, con las posiciones temporales estiradas para que el modelo interprete que cubren un plano continuo. El autor lo denomina «Contact-Sheet diffusion» y demuestra que la maquinaria de consistencia temporal del modelo de vídeo se reconvierte en consistencia de identidad entre vistas.

Su relevancia actual es práctica: resolver la generación de turnarounds multi-vista (una tarea clásica y costosa en preproducción de animación, videojuegos y catálogos) en aproximadamente 10 segundos a 512² y 57 segundos a 1024² por hoja en una sola GPU. El repositorio es muy reciente (creado en agosto de 2026), acumula 19 likes y 0 descargas, y no incluye resultados de benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer de difusión de vídeo y audio MiniMax-H3; rank 16, alpha 16, solo atención (qkv/out), 100 módulos en 50 bloques, partición `ref2va_pruned` |
| Parámetros totales | No disponible para el modelo base; el adaptador pesa 63 MB por fichero safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; el adaptador empaqueta cinco ranuras de imagen en la posición de un latente de vídeo de cinco posiciones) |
| Tipos de cuantización | No especificado por el autor; la CLI de referencia mantiene el modelo base cuantizado residente (~41 GiB) |
| Idiomas soportados | No disponible (las instrucciones de texto se introducen en lenguaje natural; el autor no declara idiomas) |
| Licencia | `other`, con `license_name: minimax` y enlace a https://huggingface.co/MiniMaxAI/MiniMax-H3 |
| Formato de pesos | safetensors (tres ficheros: `minimax_h3_five_view_512_s1500.safetensors`, `minimax_h3_five_view_512_s400_instruct.safetensors`, `minimax_h3_five_view_1024cont_s600.safetensors`) |

## Arquitectura y entrenamiento

MiniMax-H3 es un modelo de vídeo y audio cuyo VAE almacena el vídeo como un fotograma clave más paquetes de cuatro fotogramas, y cuyo transformer está optimizado para mantener la coherencia a lo largo de la línea temporal. El LoRA explota esa propiedad: empaqueta cinco latentes de imagen independientes en las posiciones que ocuparía un latente de vídeo de cinco posiciones, estirando las posiciones temporales para que el modelo crea que cubren un plano continuo. Cada «fotograma» es en realidad una imagen completa desde un ángulo de cámara distinto. El autor aporta una prueba de que el mecanismo es genuinamente temporal: al aplicar el LoRA a una generación de vídeo normal, el movimiento se rompe (las aspas de un molino se renderizan como posiciones discretas superpuestas), porque el adaptador ha aprendido que tiempo equivale a poses.

El entrenamiento utilizó un único dataset de 90 clips de órbita autogenerados (30 sujetos × 3 semillas, división de 75 para entrenamiento y 15 para validación por sujeto), una única configuración de LoRA (rank 16, alpha 16, solo atención) y un adaptador de de-destilación en tiempo de entrenamiento. La ejecución principal fue a 512², con learning rate 5e-5, adamw8bit, batch size 1 con acumulación de gradiente 4 y flowmatch/shift, a ~6,8 s por paso (unas 2,8 horas para los 1500 pasos en una sola tarjeta). Los tres ficheros publicados difieren solo en resolución y calendario: el de 400 pasos conserva mejor el seguimiento de instrucciones, el de 1500 pasos ofrece mejor geometría de rotación, y el de 1024 es una continuación de 200 pasos a 1024² con learning rate 1e-5 partiendo de los pesos de 400 pasos. Una tercera rama (1024 desde cero, 400 pasos) no se ha publicado.

## Capacidades

- Generación de hojas de personaje (character sheets): cinco vistas rotadas progresivamente del mismo sujeto a partir de una imagen de referencia y una instrucción.
- Transferencia de identidad desde fotografías reales: el autor documenta que una fotografía real no vista durante el entrenamiento (DIV2K) produce cinco vistas coherentes, pese a ser un caso fuera de distribución.
- Seguimiento de instrucciones parcial: el checkpoint de 400 pasos responde a indicaciones como sobrescribir el fondo («neutral studio background»); el de 1500 pasos lo hace en menor medida.
- Transferencia de resolución en inferencia: pesos entrenados a 512² generan a 1024² y 2048² sin reescalado alguno en el pipeline (todas las vistas se generan desde ruido).
- Ajuste de compromiso rotación/fidelidad de escena mediante la fuerza del LoRA: 1.0 prioriza la rotación y ~0.7 cambia rotación por fidelidad de la escena.
- Salidas decodificadas de forma independiente: cada vista es una imagen nítida y autónoma, no un fotograma de vídeo.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso ni capacidades de audio propias (el audio pertenece al modelo base, no al adaptador).
- Capacidades multilingües: no disponibles/no declaradas por el autor.

## Casos de uso

- Preproducción de animación y videojuegos: generar una hoja de turnaround completa de un personaje a partir de un único concepto aprobado, en unos 10 segundos a 512² o 57 segundos a 1024², para pasarla al equipo de modelado 3D como referencia de múltiples ángulos.
- Diseño de personajes iterativo: el artista parte de un boceto o fotografía, prueba variantes con fuerza de LoRA ~0.7 para mantener la escena y la iluminación, y sube a 1.0 cuando necesita la rotación máxima.
- Catálogos de producto y e-commerce: obtener cinco ángulos de un artículo desde una sola fotografía de estudio, con la salvedad de que la transferencia desde fotografía real está documentada como fuera de distribución y requiere verificación manual.
- Generación de datasets sintéticos multi-vista: producir conjuntos de imágenes con identidad consistente y ángulos conocidos para entrenar o evaluar modelos de reconstrucción 3D, estimación de pose o reidentificación.
- Referencia para modelado 3D y escultura digital: entregar vistas ortogonales aproximadas de un sujeto a partir de una foto, reduciendo el trabajo manual de rotación en herramientas de modelado.
- Integración en flujos de trabajo de ComfyUI: desplegar los nodos personalizados del autor para que artistas sin conocimientos de Python generen hojas desde una interfaz gráfica, con la ventaja de que el nodo permite offload a RAM del sistema en tarjetas pequeñas.
- Ilustración de cómics, manga y storyboards: fijar la apariencia de un personaje recurrente a lo largo de una obra generando vistas coherentes que sirvan de referencia estable entre viñetas.
- Prototipado rápido de avatares y personajes para redes o aplicaciones: obtener una hoja de vistas con resolución 2048² por vista en unos 227 segundos cuando se necesita detalle fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas equivalentes, que por otra parte no aplican a un adaptador de generación de imágenes). El autor sí publica mediciones propias de tiempo y memoria, con 28 pasos de muestreo en una RTX PRO 6000 limitada a 450 W:

| Métrica por hoja (5 vistas) | 512²/ranura | 1024²/ranura | 2048²/ranura |
|---|---|---|---|
| Tiempo | ~10 s | ~57 s | ~227 s |
| VRAM pico | 41 GiB | 42 GiB | 47 GiB |

| Fichero | Pasos | Comportamiento declarado |
|---|---|---|
| `minimax_h3_five_view_512_s1500.safetensors` | 1500 | Por defecto; mejor geometría de rotación |
| `minimax_h3_five_view_512_s400_instruct.safetensors` | 400 | Mejor seguimiento de instrucciones; rotación más superficial |
| `minimax_h3_five_view_1024cont_s600.safetensors` | 600 (continuación a 1024²) | Calidad comparable a 1024/2048; respuesta a la sobrescritura de fondo más débil que el de 400 pasos |

## Requisitos de hardware

- Ruta CLI (ai-toolkit): requiere una tarjeta NVIDIA con 48 GB de VRAM o más, porque el toolkit mantiene todo el modelo base cuantizado residente (~41 GiB) sin offload por streaming.
- VRAM pico medida: 41 GiB a 512², 42 GiB a 1024² y 47 GiB a 2048² por hoja de cinco vistas.
- GPUs compatibles con la ruta CLI: RTX PRO 6000 (usada por el autor, con límite de 450 W), A100 80 GB, H100 80 GB, A6000 48 GB y, en general, cualquier acelerador con al menos 48 GB.
- En GPU de consumo: el CLI no cabe en una RTX 4090 (24 GB) ni en tarjetas de 16 GB. La ruta ComfyUI sí puede funcionar, porque ComfyUI descarga a RAM del sistema en tarjetas pequeñas; el autor indica que cualquier equipo capaz de ejecutar vídeo con MiniMax-H3 puede generar hojas, a costa de velocidad.
- Disco: ~43 GB para los pesos base, descargados automáticamente desde el repackage público de Comfy-Org sin necesidad de login. El repositorio del LoRA ocupa 0,2 GB.
- Entorno: Linux y Python 3.10 o superior.
- Opciones de despliegue: CLI de ai-toolkit (https://github.com/ostris/ai-toolkit) o los nodos personalizados de ComfyUI (https://github.com/matlowai/ComfyUI-H3-ContactSheet). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 10 s por hoja a 512², 57 s a 1024² y 227 s a 2048², siempre con 28 pasos de muestreo y en la configuración medida por el autor.
- Advertencia de integración: no basta con colocar el LoRA en `loras/` con un flujo de trabajo normal. Los samplers estándar no realizan el empaquetado de cinco ranuras y, aplicado a generación de vídeo convencional, el LoRA degrada activamente el movimiento.

## Comparativa con modelos similares

No se dispone de datos publicados de alternativas comparables en la información proporcionada (ni parámetros, ni contexto, ni licencias de otros adaptadores de multi-vista). La comparación posible se limita a este adaptador frente al modelo base sin él:

| Criterio | MiniMax-H3 base | H3 Turnaround LoRA |
|---|---|---|
| Tipo de artefacto | Modelo de difusión de vídeo y audio | Adaptador LoRA de 63 MB sobre el modelo base |
| Salida con el mismo prompt y semilla | Vídeo (o vista única) sin coordinación multi-ángulo | Cinco vistas rotadas coherentes en una sola pasada |
| Tiempo por hoja de cinco vistas | No disponible | ~10 s a 512², ~57 s a 1024², ~227 s a 2048² |
| Generación de vídeo normal | Comportamiento nativo | Se degrada (las aspas del molino se renderizan como posiciones superpuestas) |
| Licencia | minimax (`other`) | minimax (`other`), heredada del modelo base |

## Limitaciones y advertencias

- Dataset de entrenamiento reducido y sintético: 90 clips autogenerados por el propio modelo (30 sujetos × 3 semillas). Esto sesga el adaptador hacia dominios y estilos presentes en las generaciones de H3 y limita la diversidad de identidades cubiertas.
- Transferencia desde fotografía real fuera de distribución: el autor reconoce explícitamente que el entrenamiento solo usó sujetos generados por H3 y que la transferencia de identidad desde fotos reales es un caso fuera de distribución, aunque funcione. No hay garantía de fidelidad en producción.
- Degradación del modelo base: aplicar el LoRA a una generación de vídeo normal rompe el movimiento. No es un adaptador neutral y no debe usarse fuera del flujo de empaquetado de cinco ranuras.
- Artefactos dependientes de resolución: el back-loading del arco temprano a 2048² no se corrige entrenando a 1024², porque es un efecto de muestreo dependiente de la resolución y no una carencia de pesos.
- Seguimiento de instrucciones limitado y dependiente del checkpoint: solo el de 400 pasos responde con fiabilidad a indicaciones como cambiar el fondo; el de 1500 pasos prioriza la rotación.
- Riesgo de alucinación visual: como todo modelo generativo, puede inventar rasgos, texturas o detalles anatómicos no presentes en la referencia, especialmente en la vista más alejada del ángulo original.
- Requisitos de VRAM altos en la ruta CLI (48 GB o más) y ausencia de offload por streaming, lo que excluye GPU de consumo en ese camino.
- Licencia restrictiva: la licencia es `other` con nombre `minimax`, heredada de MiniMaxAI/MiniMax-H3. Antes de cualquier uso comercial es imprescindible revisar los términos del modelo base enlazados por el autor.
- Adopción y validación escasas: 0 descargas y 19 likes en el momento de la consulta, repositorio creado y actualizado el mismo día, sin benchmarks ni evaluación independiente publicada.
- Idiomas y capacidades multimodales del adaptador no declarados; no debe asumirse soporte multilingüe de las instrucciones ni capacidades de audio.
- La tercera rama de entrenamiento (1024 desde cero) quedó sin publicar y a 400 pasos, por lo que no existe una variante validada de alta resolución entrenada de forma completa.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/matlod/minimax-h3-turnaround
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia (enlace indicado en la model card): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Nodos de ComfyUI para H3 Contact-Sheet: https://github.com/matlowai/ComfyUI-H3-ContactSheet
- ai-toolkit (herramienta de entrenamiento e inferencia referenciada): https://github.com/ostris/ai-toolkit
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con este modelo (foros de navegadores, comunidades de soporte técnico y contenidos no relacionados), por lo que no se incluye ningún enlace adicional. No se han encontrado papers, blogs ni demos independientes en la información disponible.
