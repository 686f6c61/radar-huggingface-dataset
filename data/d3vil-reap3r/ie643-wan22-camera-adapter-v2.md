# D3vil-Reap3r/ie643-wan22-camera-adapter-v2

## Resumen

La ficha del repositorio `D3vil-Reap3r/ie643-wan22-camera-adapter-v2` describe un adaptador ligero de control de cámara para el modelo de imagen a vídeo Wan2.2-TI2V-5B de Alibaba, publicado por el usuario D3vil-Reap3r. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (14,26 millones de parámetros entrenables, 57,1 MB en `float32`) que se acoplan a un backbone Wan2.2 congelado y le permiten generar movimientos de cámara controlados (pan, tilt y zoom) a partir de una única imagen de entrada.

El adaptador resuelve un problema concreto: los modelos de imagen a vídeo genéricos no ofrecen control explícito sobre la trayectoria de la cámara virtual. Este adaptador añade esa capacidad mediante una proyección de guía de cámara de 51 canales más actualizaciones LoRA de rango 16 sobre las capas de atención y feed-forward de los bloques 0 a 15 del transformer de Wan. La salida es un vídeo de 121 fotogramas a 24 fps y 1280x704 píxeles, con una amplitud de movimiento controlada por un único valor de fuerza `s` en [0, 1].

Es relevante para desarrolladores e investigadores que ya trabajan con Wan2.2 y necesitan control cinematográfico determinista en sus pipelines de generación de vídeo, sin reentrenar el modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, la licencia no está especificada y el autor no ha publicado resultados de benchmarks ni una model card completa más allá de las instrucciones de uso y el resumen de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador sobre transformer de difusión Wan2.2-TI2V-5B (proyección de guía de 51 canales + LoRA rango 16 en atención Q/K/V y feed-forward de bloques 0-15) |
| Parámetros totales | 14,26 M entrenables (adaptador); el backbone Wan2.2-TI2V-5B se descarga por separado |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión; ventana temporal de 121 fotogramas) |
| Tipos de cuantización | no disponible (pesos del adaptador en `float32`; el backbone admite las cuantizaciones de Wan2.2, no especificadas aquí) |
| Idiomas soportados | no disponibles (la entrada es una imagen; el prompt de texto es opcional y se pasa al text encoder de Wan) |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (`adapter_000415.safetensors`, 57,1 MB, `float32`); manifiesto `ckpt_000415.json` y `config.json` obligatorios junto a los pesos |

## Arquitectura y entrenamiento

El adaptador se compone de dos piezas. La primera es una proyección de guía de cámara de 51 canales que codifica la primera imagen latentada y deformada (48 canales), una máscara de validez (1 canal) y un campo de desplazamiento (2 canales). La segunda son actualizaciones LoRA de rango 16 aplicadas a las proyecciones Q/K/V y a las capas feed-forward de los bloques 0 a 15 del transformer de Wan2.2, lo que suma 80 capas lineales envueltas y 14,26 M de parámetros entrenables. El backbone, el VAE y el text encoder permanecen congelados en la revisión fijada `b8fff7315c768468a5333511427288870b2e9635`.

El entrenamiento utilizó clips sintéticos de cámara derivados de fotografías del conjunto de entrenamiento de COCO 2017: 608 fuentes de entrenamiento y 28 fuentes de desarrollo reservadas. Cada clip es una imagen fija deformada a lo largo de una trayectoria de pan, tilt o zoom. El adaptador se entrenó con `fill_mode: replicate`, es decir, las regiones reveladas por el movimiento de cámara se rellenan con el borde más cercano de la guía, no con ceros. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset más allá de COCO, ni si hubo etapas de RLHF o DPO (no aplicables a un adaptador de difusión de este tipo). El checkpoint publicado corresponde al paso 415.

## Capacidades

- Generación de vídeo de imagen a vídeo: a partir de una imagen RGB (recortada al centro a 1280x704) produce un vídeo de 121 fotogramas a 24 fps.
- Control de cámara explícito: movimientos de pan izquierda/derecha, tilt arriba/abajo y zoom in/out, más un modo estático.
- Control de amplitud mediante un único valor de fuerza `s` en [0, 1], con máximos entrenados de 8 grados de pan/tilt y un factor de zoom de 1,25x.
- Control físico directo alternativo: `amplitude_deg` para pan/tilt y `zoom_ratio` para zoom, en lugar de `strength`.
- Prompt de texto opcional pasado al text encoder de Wan para condicionar el contenido, además del control de cámara.
- Determinismo por semilla (`seed`) y control de pasos de difusión (`steps`, por defecto 50) y guidance (`guidance`, por defecto 5.0).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un adaptador de difusión para generación de vídeo.
- Capacidades multilingües: no disponibles; la entrada principal es visual.

## Casos de uso

- Previsualización cinematográfica: generar un plano con movimiento de cámara controlado (pan, tilt o zoom) a partir de un storyboard o una fotografía fija, con amplitudes de hasta 8 grados o 1,25x de zoom, para validar la composición antes de rodar.
- Creación de contenido para redes sociales: convertir una imagen promocional en un clip de 5 segundos (121 fotogramas a 24 fps) con un zoom in suave controlado por `strength`, sin necesidad de postproducción manual.
- Efectos de parallax en presentaciones y webs: animar imágenes de producto o paisajes con un tilt o pan determinista y reproducible mediante `seed` fija.
- Generación de material de archivo sintético: producir clips de cámara virtual sobre fotografías de COCO u otras fuentes para aumentar datasets de entrenamiento de modelos de vídeo o de odometría visual.
- Prototipado de pipelines de vídeo generativo: integrar el adaptador en un flujo `diffusers` existente con `flow_infer.load_inference_pipeline` y reutilizar la pipeline cargada entre vídeos para evitar recargar el modelo de 5B.
- Investigación en control de cámara: servir como referencia reproducible de un adaptador de bajo rango (14,26 M de parámetros) para estudiar cómo se transfiere el control geométrico a un backbone de difusión congelado.
- Demostraciones interactivas con interfaz: el repositorio incluye `requirements-ui.txt`, lo que sugiere una interfaz de usuario para seleccionar movimiento y fuerza sobre una imagen cargada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 43 GiB de memoria pico en GPU CUDA según las pruebas del autor (con el backbone Wan2.2-TI2V-5B en la precisión de referencia).
- GPU recomendadas: no se especifican modelos concretos; 43 GiB de pico descartan GPUs de consumo de 24 GB o menos en la configuración probada. Encajan A100 80 GB, H100 y GPUs profesionales de 48 GB o más.
- ¿Cabe en GPU de consumo? No con la configuración documentada (43 GiB de pico); no se documentan variantes cuantizadas del backbone que reduzcan ese requisito.
- Opciones de despliegue: el paquete Python `fpcamera` incluido en `code/fpcamera_src.zip`, sobre `diffusers 0.36.0`, `transformers 4.57.6` y `torch 2.11.x`; el código rechaza otras versiones de `diffusers` y `transformers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: aproximadamente 6 minutos por vídeo de 50 pasos en las pruebas del autor; no se especifica la GPU utilizada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Control de cámara | Contexto / salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ie643-wan22-camera-adapter-v2 | Adaptador LoRA + proyección sobre Wan2.2-TI2V-5B | 14,26 M entrenables | Pan, tilt, zoom con fuerza `s` en [0, 1] | 121 fotogramas, 24 fps, 1280x704 | no disponible | Hugging Face, 0 descargas |
| Wan2.2-TI2V-5B (base) | Modelo de difusión imagen a vídeo | 5B (aproximado por el nombre) | Sin control de cámara explícito | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, modelo base público |
| Adaptadores de cámara para otros modelos de vídeo | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de alternativas comparables documentadas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada: no hay autorización explícita para uso comercial; hay que contactar con el autor o asumir los términos del modelo base Wan2.2.
- El adaptador no incluye los pesos de Wan2.2; requiere descargar el backbone de 5B por separado y fijar la revisión `b8fff7315c768468a5333511427288870b2e9635`.
- El modo de relleno de guía debe ser `replicate`; con relleno a ceros se genera un marco gris plano alrededor de la imagen. Si se construye una carpeta propia, hay que mantener `config.json` y el manifiesto `ckpt_*.json` junto a los pesos.
- La calibración de fuerza (`strength_calibration_v2.json`) es un mapa identidad, no calibrado: la relación entre `s` y la amplitud real puede no ser lineal ni exacta.
- Amplitud máxima entrenada limitada a 8 grados de pan/tilt y 1,25x de zoom; movimientos mayores no están cubiertos por el entrenamiento.
- Entrenado con clips sintéticos derivados de COCO 2017 (608 fuentes): posible sesgo hacia la distribución visual y de escenas de COCO, con riesgo de generalización limitada a otros dominios (retratos, interiores, texto, etc.).
- Riesgo de alucinación visual y de artefactos en las regiones reveladas por el movimiento de cámara, especialmente en los bordes de la imagen.
- Dependencia estricta de versiones: `diffusers 0.36.0` y `transformers 4.57.6`; el código rechaza otras versiones, lo que complica la integración en entornos con dependencias fijadas.
- Requisito de ~43 GiB de VRAM y ~6 minutos por vídeo de 50 pasos: poco adecuado para inferencia en tiempo real o en GPUs de consumo.
- Repositorio con 0 descargas y 0 likes, sin benchmarks publicados ni validación externa: madurez y soporte inciertos para producción.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/D3vil-Reap3r/ie643-wan22-camera-adapter-v2
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Revisión fijada del modelo base: `b8fff7315c768468a5333511427288870b2e9635`
