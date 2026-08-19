# Abiray/10Eros-Max-GGUF

## Resumen

El repositorio Abiray/10Eros-Max-GGUF contiene cuantizaciones GGUF optimizadas del modelo TenStrip/10Eros-Max (versión Test4 Pruned), un merge experimental construido sobre la base de MiniMax H3, un modelo de difusión omni-modal para generación de video con audio. El modelo original integra patrones aprendidos de otros modelos de difusión de video (LTX 2.3 y Wan 2.2) y de imagen (Krea 2), mediante una técnica de proyección ortogonal que inyecta pesos en direcciones poco utilizadas del espacio de pesos del modelo base, preservando sus capacidades originales.

Estas cuantizaciones GGUF permiten ejecutar el modelo en hardware de consumo con tan solo 12 GB de VRAM, frente a los más de 40 GB que ocuparía la versión BF16 completa. Se ofrecen cinco niveles de cuantización (Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q3_K_M) que cubren desde tarjetas de gama alta hasta GPU de entrada, manteniendo una fidelidad visual prácticamente indistinguible en los niveles superiores. El modelo está pensado para su uso en ComfyUI mediante el cargador GGUF, y requiere además el text encoder Qwen3-VL-32B truncado y el VAE de MiniMax para la decodificación final.

La relevancia de esta publicación radica en democratizar el acceso a un modelo de generación de video de gran tamaño, que combina las fortalezas de varias arquitecturas de difusión, y que de otro modo sería inaccesible para la mayoría de los usuarios con GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer unificado con 52 bloques (2 bloques token_refiner para condicionamiento de texto + 50 bloques principales), con proyectores de entrada por modalidad (video, audio, condición) y cabezales de salida específicos por modalidad |
| Parametros totales | No disponible (el modelo original ocupa más de 40 GB en BF16, pero el número exacto de parámetros no se especifica) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M (archivos GGUF individuales) |
| Idiomas soportados | No disponible (el text encoder Qwen3-VL-32B es multilingüe, pero no se confirma para este modelo) |
| Licencia | minimax-h3-community-license-agreement (licencia comunitaria de MiniMax, ver enlaces) |
| Formato de pesos | GGUF (para uso con ComfyUI-GGUF) |

## Arquitectura y entrenamiento

El modelo base 10Eros-Max es un merge experimental sobre MiniMax H3, un modelo de difusión omni-modal que genera video con audio sincronizado. La arquitectura consiste en un transformer unificado con proyectores de entrada específicos por modalidad (video, audio y condiciones) que alimentan una pila de 52 bloques transformer, seguidos de cabezales de salida también específicos por modalidad. Todos los bloques comparten la misma arquitectura, lo que facilita la transferencia de pesos entre modelos.

El proceso de merge se realizó en tres pasadas. Primero se aplicó una pasada de LTX 2.3 sobre los bloques frontales de H3, modificando directamente los pesos de atención. Después, una pasada de Wan 2.2 sobre los bloques medio-traseros, que también modificó las capas feed-forward en un rango más amplio. Finalmente, una pasada de Krea 2 (un modelo de imagen) sobre partes específicas de la atención: la proyección de query y, en menor medida, las proyecciones de key y value, además de la entrada del MLP con puerta. Esta tercera pasada se limitó a las partes que codifican relaciones espaciales dentro de un solo fotograma, evitando alterar la coherencia temporal del modelo de video.

La técnica clave es la proyección ortogonal: los nuevos patrones de pesos se inyectan en direcciones del espacio de pesos que el modelo base no utilizaba, de modo que el carácter transferido complementa a H3 sin sobrescribirlo. En el caso de Krea, los patrones resultaron casi perpendiculares a los de H3, lo que maximizó la eficacia de la inyección. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados o el uso de RLHF/DPO.

## Capacidades

- Generación de video a partir de texto (text-to-video) y de imagen (image-to-video), así como combinación de ambos (image-text-to-video).
- Generación de audio sincronizado con el video, como se muestra en el vídeo de demostración del repositorio (el archivo de ejemplo incluye pista de audio).
- Soporte nativo en ComfyUI mediante el nodo Unet Loader (GGUF) del paquete ComfyUI-GGUF.
- Integración con el text encoder Qwen3-VL-32B truncado (versión H3) y el VAE de MiniMax para decodificación.
- Capacidad de ejecución en GPU de consumo gracias a las cuantizaciones GGUF, con requisitos de VRAM desde 10-12 GB hasta 24 GB+.
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo de difusión, no un LLM conversacional.

## Casos de uso

- Creación de contenido audiovisual para redes sociales: el modelo puede generar clips cortos con audio sincronizado a partir de una descripción textual o una imagen de referencia, lo que permite producir material atractivo sin necesidad de equipos de grabación.
- Prototipado de escenas para producción cinematográfica: los realizadores pueden generar storyboards animados o previsualizaciones de escenas complejas, ajustando la cuantización según la calidad requerida (Q8_0 para previsualización final, Q4_K_M para iteraciones rápidas).
- Generación de vídeos explicativos o educativos: a partir de texto descriptivo, el modelo puede crear animaciones ilustrativas que acompañen explicaciones técnicas o científicas, reduciendo costes de producción.
- Publicidad y marketing: las marcas pueden generar vídeos promocionales personalizados a partir de imágenes de producto o descripciones de campaña, con la posibilidad de iterar rápidamente sobre diferentes conceptos.
- Arte digital y experimentación creativa: artistas pueden combinar estilos de distintos modelos (LTX, Wan, Krea) en un solo pipeline, explorando estéticas híbridas que no serían posibles con un único modelo.
- Investigación en generación de video: el modelo sirve como banco de pruebas para estudiar técnicas de merge y transferencia de conocimiento entre arquitecturas de difusión, gracias a su naturaleza experimental y a la documentación detallada del proceso de fusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas como FVD, CLIP score o evaluaciones humanas. El único dato de rendimiento mencionado es el requisito de VRAM por cuantización, que se detalla en la sección de hardware.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q8_0 (21.6 GB): recomendado 24 GB+ (RTX 3090, RTX 4090, Mac M-Series)
  - Q6_K (16.7 GB): recomendado 24 GB (RTX 3090, RTX 4090)
  - Q5_K_M (14.1 GB): recomendado 16-20 GB (RTX 4080, RTX 4070 Ti Super)
  - Q4_K_M (11.6 GB): recomendado 16 GB (RTX 4070, RTX 4080)
  - Q3_K_M (8.9 GB): recomendado 10-12 GB (RTX 3060, RTX 4060)
- GPU recomendadas: cualquier tarjeta NVIDIA con al menos 10 GB de VRAM para la cuantización más baja; las tarjetas de 24 GB pueden ejecutar todas las versiones.
- No cabe en GPU de consumo de gama baja (menos de 8 GB), pero sí en la mayoría de GPU de gama media y alta desde 2020.
- Opciones de despliegue: ComfyUI con el paquete ComfyUI-GGUF (City96), usando el nodo Unet Loader (GGUF). No se mencionan otras herramientas como vLLM, llama.cpp u Ollama, dado que es un modelo de difusión, no un LLM.
- Latencia y throughput: no disponibles. El rendimiento dependerá de la GPU, la resolución de salida y el número de fotogramas.

## Comparativa con modelos similares

El modelo 10Eros-Max es un merge que combina características de varios modelos base, por lo que la comparación directa es compleja. A continuación se comparan los modelos que contribuyen a su arquitectura:

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 (base) | Difusión omni-modal (video+audio) | No disponible (pesos >40 GB en BF16) | No disponible | minimax-h3-community-license-agreement | Hugging Face |
| LTX 2.3 | Difusión de video | No disponible | No disponible | No especificada | Hugging Face / Civitai |
| Wan 2.2 | Difusión de video | No disponible | No disponible | No especificada | Hugging Face |
| Krea 2 | Difusión de imagen | No disponible | No disponible | No especificada | No disponible públicamente |

No se dispone de datos de rendimiento comparativo (FVD, CLIP score, etc.) para estos modelos. La ventaja principal de 10Eros-Max es la fusión de las fortalezas de cada uno: la coherencia temporal de H3, el carácter visual de LTX y Wan, y el detalle espacial de Krea. En términos de accesibilidad, la versión GGUF de Abiray supera a los modelos originales al permitir su ejecución en hardware de consumo.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo describe como un experimento, y no se garantiza estabilidad ni calidad consistente en todas las entradas.
- Licencia comunitaria de MiniMax (minimax-h3-community-license-agreement): es una licencia específica que puede imponer restricciones de uso comercial o de redistribución. Es imprescindible revisar el texto completo de la licencia antes de cualquier uso en producción.
- Posible generación de contenido inapropiado: el nombre "Eros" y el contexto de la comunidad sugieren que el modelo puede estar orientado a contenido adulto. No hay filtros de seguridad documentados, por lo que su uso en entornos profesionales requiere supervisión humana.
- Riesgo de alucinaciones visuales: como todo modelo de difusión, puede generar objetos, personas o escenas que no se corresponden con la descripción textual, especialmente en cuantizaciones bajas (Q3_K_M).
- Limitaciones de idioma: no se especifican los idiomas soportados. Aunque el text encoder Qwen3-VL-32B es multilingüe, el comportamiento real del modelo en idiomas distintos del inglés no está verificado.
- Requisitos de VRAM adicionales: además del modelo GGUF, se necesitan el text encoder y el VAE, que consumen VRAM extra. La tabla de requisitos del repositorio ya tiene esto en cuenta, pero hay que considerarlo al dimensionar el hardware.
- Sin soporte oficial: no hay documentación técnica completa, y el soporte se limita a los canales comunitarios de ComfyUI y los repositorios enlazados.

## Enlaces

- Repositorio Hugging Face de las cuantizaciones GGUF: https://huggingface.co/Abiray/10Eros-Max-GGUF
- Modelo original (TenStrip/10Eros-Max): https://huggingface.co/TenStrip/10Eros-Max
- Licencia MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Paquete ComfyUI-GGUF (City96): https://github.com/city96/ComfyUI-GGUF
- Lista curada de recursos MiniMax-H3 (awesome-minimax-H3): https://github.com/wildminder/awesome-minimax-H3
