# matrixportalx/Wan2.1-T2V-1.3B-npu

## Resumen

Wan2.1-T2V-1.3B-npu es un paquete de inferencia listo para ejecutar el modelo de generación de vídeo a partir de texto Wan 2.1 T2V 1.3B sobre la NPU Hexagon de Qualcomm Snapdragon, empaquetado por el usuario matrixportalx. No se trata de un modelo nuevo: es una re-cuantización y reorganización de pesos de terceros (Wan-AI para el DiT, Google para el codificador de texto umT5-XXL, Comfy-Org para el VAE) en formato GGUF Q4_0, pensada para la ruta NPU de stable-diffusion.cpp.

El problema que resuelve es de despliegue: los ficheros Q4_0 distribuidos habitualmente contienen capas en Q4_1, que la NPU Hexagon no ejecuta. Este repositorio reconvierte el DiT y el codificador desde Q8_0 a Q4_0 (y BF16 a F16) para que ambos puedan ejecutarse en el acelerador. El autor lo mantiene como espejo para que sus aplicaciones («Rüya ve Esin») sigan teniendo acceso a los ficheros aunque los repositorios de origen desaparezcan.

El modelo subyacente es un DiT de 1.300 millones de parámetros para texto-a-vídeo; el repositorio declara 5.680.910.336 parámetros totales, cifra que agrega DiT, codificador de texto y VAE, con un tamaño de repositorio de 4,3 GB. La licencia es Apache 2.0 y el interés actual es acotado: es un artefacto de despliegue para hardware móvil, sin benchmarks publicados ni tracción en la comunidad (0 descargas, 0 likes en el momento del análisis).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para generación texto-a-vídeo, con codificador de texto umT5-XXL y VAE Wan 2.1 |
| Parámetros totales | 5.680.910.336 (según safetensors del repo; agrega DiT 1.3B + codificador + VAE) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no indica longitud de prompt ni de secuencia) |
| Tipos de cuantización | Q4_0 (reconvertido desde Q8_0), F16 |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`wan2.1-t2v-1.3b.gguf`, `umt5-xxl.gguf`) y safetensors (`wan_2.1_vae.safetensors`) |

## Arquitectura y entrenamiento

El componente principal es un Diffusion Transformer de 1.300 millones de parámetros que genera vídeo a partir de un embedding de texto, siguiendo el diseño de Wan 2.1 de Wan-AI. El texto se codifica con umT5-XXL de Google y el vídeo se decodifica con el VAE de Wan 2.1. Este repositorio no entrena ni ajusta nada: aplica una conversión de tipos numéricos (Q8_0 a Q4_0, BF16 a F16) sobre los pesos de `samuelchristlie/Wan2.1-T2V-1.3B-GGUF` y `city96/umt5-xxl-encoder-gguf`, según la tabla de procedencia de la model card. El commit de origen de cada fichero está documentado (`5a512b15fc35` para el DiT, `b535255bee98` para el codificador, `123acf1cc74b` para el VAE).

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de alineación (RLHF/DPO) en la información disponible; esos detalles corresponden a la model card original de Wan-AI, no a este espejo. La innovación técnica relevante es exclusivamente de despliegue: la re-cuantización selectiva para que todas las capas usen tipos soportados por la NPU Hexagon a través de stable-diffusion.cpp. El autor advierte explícitamente de que, salvo esas conversiones, los ficheros no se han modificado.

## Capacidades

- Generación de vídeo a partir de prompts de texto (text-to-video) mediante difusión, con el DiT de 1.3B.
- Codificación de prompts en lenguaje natural con umT5-XXL, un codificador multilingüe en origen (idiomas efectivamente soportados no verificados en esta ficha).
- Decodificación de latentes a fotogramas con el VAE oficial de Wan 2.1 en safetensors.
- Ejecución en NPU Hexagon de SoC Snapdragon mediante la ruta NPU de stable-diffusion.cpp.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repo), orientada a integración como servicio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No genera texto, código ni matemáticas; su salida es vídeo.
- No dispone de modo «thinking», visión de entrada ni audio.

## Casos de uso

- Prototipado de texto-a-vídeo en dispositivo móvil: el paquete Q4_0 permite ejecutar el DiT de 1.3B en la NPU de un Snapdragon sin depender de GPU en la nube, útil para demos y validación de conceptos en teléfono.
- Aplicaciones Android con generación de vídeo offline: al no requerir conectividad, encaja en escenarios de privacidad donde el prompt no debe salir del dispositivo.
- Pruebas de integración de stable-diffusion.cpp en pipelines NPU: sirve como caso de referencia para verificar que la ruta Hexagon carga GGUF Q4_0 correctamente.
- Generación de clips cortos para previsualización de ideas: a 1.3B parámetros y Q4_0, el coste por iteración es bajo comparado con variantes de mayor tamaño, lo que permite barrer prompts rápidamente.
- Reproducibilidad de artefactos: al fijar commits de origen y conservar LICENSE.txt, el repo sirve para reconstruir un entorno de inferencia idéntico aunque los repos upstream se muevan o se retiren.
- Base para re-cuantizaciones propias: la tabla de conversiones documentada (Q8_0 a Q4_0, BF16 a F16) es una referencia directa si necesitas adaptar otros modelos de difusión a NPU.
- Docencia y experimentación: permite explicar el pipeline completo (codificador de texto, DiT, VAE) en hardware de consumo sin clústeres de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de vídeo (FVD, CLIP score, VBench), latencia ni throughput, y los resultados de búsqueda web obtenidos no contenían material técnico relacionado con el modelo.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo ocupa 4,3 GB; con pesos Q4_0 para DiT y codificador, la huella en memoria debería situarse por debajo de ese total, pero no hay cifras oficiales publicadas (estimación a partir del tamaño de los ficheros, no verificada).
- Hardware objetivo declarado: NPU Hexagon de Qualcomm Snapdragon, a través de la ruta NPU de stable-diffusion.cpp.
- GPU dedicadas (A100, H100, RTX 4090): no documentadas para este paquete; para inferencia en GPU conviene usar los pesos originales en safetensors o los GGUF Q8_0 upstream.
- GPU de consumo: no hay confirmación de funcionamiento en RTX 4090 ni en gamas inferiores con este paquete concreto; la cuantización Q4_0 sugiere que cabría en GPUs de 8 GB o menos, pero es una inferencia, no un dato del autor.
- Opciones de despliegue: stable-diffusion.cpp (ruta NPU) es la vía prevista; los ficheros GGUF son reutilizables por otras herramientas compatibles con el formato, y el VAE en safetensors por ComfyUI u otros entornos que carguen pesos originales.
- Latencia y throughput: no disponibles. No se han publicado tiempos por clip, resolución soportada ni número de fotogramas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| matrixportalx/Wan2.1-T2V-1.3B-npu (este repo) | 5.680.910.336 declarados (DiT 1.3B + codificador + VAE) | no disponible | GGUF Q4_0 + safetensors | Apache 2.0 | Espejo de terceros, 0 descargas, orientado a NPU Snapdragon |
| Wan-AI/Wan2.1-T2V-1.3B | DiT 1.3B | no disponible en la información proporcionada | safetensors | Apache 2.0 | Repositorio oficial, pesos sin cuantizar |
| samuelchristlie/Wan2.1-T2V-1.3B-GGUF | DiT 1.3B | no disponible | GGUF Q8_0 | Apache 2.0 | Fuente de la conversión; pensado para stable-diffusion.cpp en CPU/GPU |
| city96/umt5-xxl-encoder-gguf | umT5-XXL (codificador) | no disponible | GGUF Q8_0 | Apache 2.0 | Componente de codificación de texto reutilizable |
| Wan-AI/Wan2.1-T2V-14B | 14B (DiT) | no disponible | safetensors | Apache 2.0 | Variante de mayor tamaño de la misma familia; no referenciada en la model card de este repo |

La diferencia práctica frente a los tres primeros no es de calidad, sino de compatibilidad de tipos numéricos con la NPU Hexagon: este paquete es el único de la lista que declara Q4_0 en todas las capas.

## Limitaciones y advertencias

- No es un modelo original: es un espejo de terceros con re-cuantización, sin entrenamiento ni evaluación propios. Cualquier mérito o defecto de calidad proviene de Wan 2.1 y de la cuantización.
- La cuantización Q4_0 es agresiva; cabe esperar degradación de calidad visual frente a Q8_0 o a los pesos originales en BF16. No se han publicado comparativas de calidad.
- La model card está redactada en turco y no documenta idiomas de prompt soportados ni límites de longitud; el soporte multilingüe de umT5 en origen no garantiza buen rendimiento en castellano para este pipeline.
- El autor indica que el repositorio se mantiene para sus propias aplicaciones; no hay compromiso de mantenimiento, soporte ni actualizaciones. Con 0 descargas y 0 likes, no hay validación comunitaria.
- Riesgo de alucinación visual y artefactos propios de los modelos de difusión: incoherencias temporales entre fotogramas, deformaciones anatómicas y texto ilegible en el vídeo generado.
- Sesgos heredados del dataset de entrenamiento de Wan 2.1 (no documentados aquí): representación desigual de culturas, géneros y contextos; riesgo de reproducir estereotipos en prompts abiertos.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia de los componentes upstream (Wan-AI, Google umT5, Comfy-Org) y conservar el `LICENSE.txt` incluido.
- Dependencia de una ruta de ejecución concreta (stable-diffusion.cpp con soporte NPU Hexagon); fuera de ese entorno, los ficheros Q4_0 pueden no cargar o hacerlo con tipos no soportados.
- No apto para producción crítica sin evaluación propia: sin benchmarks, sin métricas de latencia y sin garantías de disponibilidad del espejo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/matrixportalx/Wan2.1-T2V-1.3B-npu
- Modelo original: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Pesos GGUF de origen (DiT): https://huggingface.co/samuelchristlie/Wan2.1-T2V-1.3B-GGUF
- Codificador umT5-XXL GGUF: https://huggingface.co/city96/umt5-xxl-encoder-gguf
- VAE de Wan 2.1: https://huggingface.co/Comfy-Org/Wan-2.1
- Perfil del autor: https://huggingface.co/matrixportalx
- Los resultados de la búsqueda web no aportaron enlaces técnicos relevantes al modelo.
