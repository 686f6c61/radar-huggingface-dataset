# netprojects/WeMM-Ecom-2B-MLX-4bit

## Resumen

WeMM-Ecom-2B-MLX-4bit es una conversión a formato MLX, con cuantización de 4 bits, del modelo multimodal tencent/WeMM-Ecom-2B, desarrollado por Tencent (WeChat Vision) y afinado a partir de Qwen3.5. El modelo original está especializado en el dominio del comercio electrónico: procesa imágenes de producto, varias imágenes simultáneas y vídeo junto con texto, en chino e inglés, y ofrece un modo de razonamiento híbrido (thinking) que se activa por defecto y puede desactivarse por petición.

La conversión la publica NetProjects (Internet Projects Ltd), un tercero no afiliado a Tencent ni a Alibaba, con el objetivo de ejecutar el modelo en Apple Silicon mediante la librería mlx-vlm. El paquete incluye el codificador visual y pesa 1,7 GB, frente a los 2,7 GB de la build de 8 bits del mismo autor. Con 2.213.241.664 parámetros totales, está pensado para equipos con memoria unificada limitada.

Su relevancia actual radica en que permite desplegar localmente en un Mac un modelo visión-lenguaje especializado en e-commerce sin depender de infraestructura en la nube. El autor advierte, no obstante, que la build de 4 bits conserva el 92,1% de coincidencia en el siguiente token respecto a los pesos bf16 originales, con una KL media de 0,0808, por lo que la build de 8 bits es la recomendada cuando la memoria lo permite.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (fine-tune de Qwen3.5), con codificador visual incluido; familia qwen3_5 / mlx-vlm |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín (affine), group size 64; existe build de 8 bits del mismo autor |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 (la del modelo original, con la sección de terceros de Qwen3.5 de Alibaba Cloud) |
| Formato de pesos | safetensors en formato MLX; tokenizer, chat template y processor originales de Tencent sin modificar |
| Tamano del repositorio | 1,7 GB |
| Libreria | mlx (mlx-vlm >= 0.7.11) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es un visión-lenguaje construido sobre Qwen3.5, con un codificador visual que se incluye en todas las builds MLX. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; la model card remite a la ficha original de Tencent para el método y los escenarios de entrenamiento. Lo que sí se documenta es la especialización en e-commerce: lectura de imágenes de producto, comparación de varias imágenes y comprensión de vídeo junto con texto, en chino e inglés.

La innovación destacable de esta build concreta es la conversión y cuantización a MLX con group size 64, verificada contra los pesos bf16 originales de Tencent. El autor midió la coincidencia del siguiente token sobre 10 prompts cortos en inglés y chino (thinking activado en 4 y desactivado en 6) y 353 posiciones con teacher forcing: la build de 4 bits coincide en el 92,1% de los casos, con una KL media de 0,0808. Además, el modelo incorpora razonamiento híbrido: el bloque de thinking se emite antes de la respuesta y puede desactivarse por petición mediante el parámetro `enable_thinking`.

## Capacidades

- Generación de texto e interpretación de imágenes: descripción de productos, identificación de atributos (color, precio) y redacción de títulos y puntos de venta.
- Procesamiento de múltiples imágenes en una misma petición: comparación de variantes, detección de diferencias entre listados o imágenes de producto.
- Comprensión de vídeo junto con texto, según los tags del modelo.
- Razonamiento híbrido: modo thinking activado por defecto (razona antes de responder) y modo instruct desactivable con `enable_thinking=False`.
- Capacidades multilingües limitadas a chino e inglés.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá del bloque de thinking.
- Servido mediante `mlx_vlm.server` con API compatible con OpenAI.

## Casos de uso

- Generación de fichas de producto: a partir de una foto, el modelo redacta título corto y puntos de venta, como muestra el ejemplo de la model card con una camiseta azul y una etiqueta de precio de ¥99.
- Comparación de listados duplicados: con dos imágenes en la misma petición y thinking activado, el modelo explica las diferencias entre dos publicaciones, útil para moderación de catálogo o detección de duplicados.
- Enriquecimiento de catálogo en local: un equipo de e-commerce puede procesar lotes de imágenes en un Mac sin enviar datos de producto a servicios externos, gracias a los 1,7 GB de pesos y los 2,6 GB de memoria pico en la prueba de imagen.
- Extracción de atributos para filtros de búsqueda: color, tipo de prenda y precio detectados en la imagen permiten poblar campos estructurados del catálogo.
- Descripción de variantes de producto: comparar la misma prenda en distintos colores para generar textos de variante coherentes.
- Asistencia a la redacción en chino e inglés: el modelo responde en ambos idiomas, lo que sirve para mercados transfronterizos que necesitan fichas bilingües.
- Prototipado e investigación en visión-lenguaje: al ser una build MLX verificada contra los pesos originales, sirve para experimentar en Apple Silicon con un modelo especializado sin montar infraestructura de GPU.

## Benchmarks y rendimiento

La model card de esta build no incluye cifras numéricas de benchmarks de tareas; remite a las tablas de la ficha original de Tencent (comparativas de e-commerce y generales, en modo instruct y thinking), publicadas como imágenes. No se reproducen aquí porque no se dispone de los valores.

Lo que sí se publica son métricas de fidelidad de la cuantización frente a los pesos bf16 originales:

| Build | Tamano | Mismo siguiente token que el original bf16 | KL media vs original | Memoria pico, prueba de imagen |
|---|---|---|---|---|
| MLX-8bit (recomendada) | 2,7 GB | 98,3% | 0,0010 | 3,5 GB |
| MLX-4bit (esta) | 1,7 GB | 92,1% | 0,0808 | 2,6 GB |

Las mediciones se realizaron en un MacBook Pro M5 Max de 128 GB, el 25 de noviembre de 2026, con mlx 0.32.4 y mlx-vlm 0.7.11.

## Requisitos de hardware

- Memoria pico observada en la prueba de imagen: 2,6 GB para la build de 4 bits (3,5 GB para la de 8 bits).
- Hardware objetivo: Apple Silicon con memoria unificada; la verificación se hizo en un MacBook Pro M5 Max de 128 GB, pero el tamaño reducido sugiere que cabe en Macs con bastante menos memoria.
- No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) en esta build, al estar empaquetada para MLX.
- Despliegue: `mlx_vlm.generate` desde línea de comandos, API Python (`mlx_vlm.load` y `mlx_vlm.generate`) y servidor con API compatible con OpenAI mediante `mlx_vlm.server`.
- Requiere mlx-vlm >= 0.7.11.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-2B-MLX-4bit | 2,21 B | no disponible | MLX 4 bits, Apple Silicon | Apache-2.0 | 92,1% de coincidencia con bf16; 1,7 GB |
| WeMM-Ecom-2B-MLX-8bit | 2,21 B | no disponible | MLX 8 bits, Apple Silicon | Apache-2.0 | 98,3% de coincidencia con bf16; 2,7 GB; recomendada por el autor |
| tencent/WeMM-Ecom-2B | 2,21 B | no disponible | bf16 original | Apache-2.0 | Referencia de calidad; pensado para GPU |
| Qwen3.5 (modelo base) | no disponible | no disponible | safetensors | Apache-2.0 | Modelo generalista del que se afina WeMM-Ecom; sin especialización en e-commerce |

No se dispone de datos de benchmarks comparativos numéricos en la información proporcionada para establecer una comparación de rendimiento con alternativas.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce degradación: solo el 92,1% de coincidencia en el siguiente token y KL media de 0,0808 frente a los pesos originales; el propio autor recomienda la build de 8 bits cuando la memoria lo permite.
- Idiomas limitados a chino e inglés; no se documenta soporte de castellano.
- Especialización de dominio: está afinado para e-commerce, por lo que su rendimiento fuera de ese ámbito puede ser inferior al de un modelo generalista del mismo tamaño.
- No se documenta longitud de contexto, lo que dificulta planificar conversaciones o documentos largos.
- Riesgo de alucinación inherente a los modelos de lenguaje; en tareas de catálogo conviene validar precios y atributos extraídos contra la fuente.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia Apache-2.0, que permite uso comercial, pero el archivo LICENSE es el de Tencent e incluye la sección de terceros de Qwen3.5 (Alibaba Cloud); conviene revisarla antes de redistribuir.
- Publicado por un tercero (NetProjects) no afiliado a Tencent ni a Alibaba; la build de 4 bits no es la recomendada por el autor de la conversión.
- Dependencia de mlx-vlm >= 0.7.11 y de hardware Apple Silicon; no es portable a otros backends sin reconversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/WeMM-Ecom-2B-MLX-4bit
- Build de 8 bits del mismo autor: https://huggingface.co/netprojects/WeMM-Ecom-2B-MLX-8bit
- Modelo original de Tencent: https://huggingface.co/tencent/WeMM-Ecom-2B
- Perfil del autor de la conversión: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
