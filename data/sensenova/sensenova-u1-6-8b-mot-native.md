# sensenova/SenseNova-U1.6-8B-MoT-Native

## Resumen

SenseNova-U1.6-8B-MoT-Native es la distribución de pesos nativos del checkpoint base SenseNova-U1.6-8B-MoT, un modelo multimodal de la familia SenseNova (SenseTime) orientado a generación y edición de imágenes. Este repositorio no introduce un modelo nuevo: empaqueta el mismo checkpoint en tres artefactos consolidados (BF16, FP8 E4M3FN W8A8 e INT8 ConvRot W8A8) para su uso con el runtime oficial SenseNova-U1 en Python, con el objetivo de reducir el coste de memoria y acelerar la inferencia mediante multiplicación matricial de 8 bits.

El modelo se publica bajo licencia Apache 2.0 y declara soporte de inglés y chino. La información disponible no detalla el número de parámetros totales ni la longitud de contexto; el nombre comercial indica "8B" y "MoT" (probablemente Mixture of Transformers, aunque la model card no lo confirma), por lo que estos datos deben tratarse como no verificados.

Su relevancia práctica reside en que ofrece variantes cuantizadas listas para producción (FP8 e INT8) con informes de conversión y sumas SHA256, además de una ruta GGUF separada, lo que facilita el despliegue en GPUs de centro de datos con menos VRAM que la versión BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica la arquitectura; el nombre sugiere "MoT") |
| Parametros totales | no disponible (el nombre comercial indica 8B, sin confirmar en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 consolidado; FP8 E4M3FN W8A8; INT8 ConvRot W8A8; variantes GGUF en repositorio separado |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, FP8, INT8); GGUF en repositorio aparte |
| Capas cuantizadas | 588 capas lineales de atención/MLP (ramas de texto y de generación de imagen) |
| Tamano de los artefactos | BF16: 35,07 GB; FP8: 18,87 GB; INT8: 18,87 GB (GB decimales) |
| Tamano del repositorio | 72,8 GB |
| Resolucion cuadrada entrenada | 2048x2048 (según el runtime) |
| Pipeline declarado | text-to-image |
| Runtime oficial | SenseNova-U1 (Python, GitHub OpenSenseNova) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento del checkpoint base. El sufijo "MoT" y la existencia de ramas separadas de texto y de generación de imagen, mencionadas al describir las capas cuantizadas, apuntan a un modelo multimodal con componentes diferenciados, pero no se confirma si se trata de un transformer denso, una mezcla de expertos o una combinación de transformadores. Tampoco se indican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento.

La innovación técnica documentada en este repositorio es la cuantización: se cuantizan 588 capas lineales de atención y MLP en las ramas de texto y de imagen, el runtime cuantiza dinámicamente las activaciones y emplea multiplicación matricial FP8 o INT8 según la variante, y la versión INT8 ConvRot aplica además una rotación en BF16. El resto de operaciones y capas no cuantizadas mantienen cómputo en coma flotante. El fichero BF16 es una consolidación de los shards originales, no una cuantización. Se documentan comprobaciones en tiempo de ejecución que observaron pesos y activaciones de 8 bits en los operadores de multiplicación matricial correspondientes.

## Capacidades

- Generación de texto a imagen (text-to-image) a partir de prompts en inglés y chino.
- Edición de imagen (image-to-image) e imagen-texto-a-imagen (image-text-to-image), según las etiquetas del repositorio.
- Generación de diagramas e ilustraciones con restricciones espaciales y de conteo, aunque la propia model card advierte que algunas restricciones complejas de prompt siguen sin cumplirse de forma perfecta.
- Modo "think" y mejora de prompt (prompt enhancement) mencionados en el runtime, aunque no validados en esta release de artefactos.
- Generación autorregresiva de texto, generación intercalada y autocorrección: listadas en el runtime pero explícitamente no validadas para este artefacto.
- Soporte multilingüe limitado a inglés y chino.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Generación de ilustraciones para documentación técnica: el modelo puede producir diagramas como el ciclo del agua o secciones de un apartamento, validados en las pruebas de humo del autor, lo que lo hace útil para material educativo con resolución de hasta 2048x2048.
- Prototipado rápido de assets visuales en estudios pequeños: la variante FP8 de 18,87 GB permite ejecutar el modelo en una sola GPU de 24 GB, reduciendo la barrera de entrada frente al BF16 de 35,07 GB.
- Edición de imágenes en flujos de diseño: las etiquetas image-to-image e image-text-to-image indican que puede modificar imágenes existentes a partir de instrucciones textuales, adecuado para iteraciones de concepto.
- Generación de menús y carteles en chino e inglés: la prueba de humo con un menú chino sugiere utilidad para material gráfico bilingüe en mercados asiáticos.
- Narración visual por viñetas: la prueba de una historia de robot en cuatro paneles indica capacidad de generar secuencias coherentes, aplicable a storyboards y cómics.
- Despliegue en entornos con VRAM limitada: las variantes INT8 y FP8 con runtime oficial permiten servir el modelo en infraestructura de centro de datos sin necesidad de multi-GPU para el checkpoint consolidado.
- Integración en pipelines de generación por lotes: el runtime por línea de comandos con semilla fija y número de pasos configurable facilita la reproducibilidad en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las siete imágenes generadas por variante en H100 (manzana, conteo/posición espacial, menú chino, historia de robot en cuatro paneles, librería, diagrama del ciclo del agua y sección de apartamento) son pruebas de humo de generación, no benchmarks de calidad ni de velocidad, y que no se realizaron mediciones repetidas ni calentamiento.

## Requisitos de hardware

- VRAM estimada: BF16 requiere al menos 35,07 GB solo para pesos, por lo que no cabe en GPUs de consumo de 24 GB; FP8 e INT8 requieren 18,87 GB de pesos, lo que deja margen ajustado en una RTX 4090 de 24 GB, aunque el modo `--vram_mode full` exigido por las variantes cuantizadas puede elevar el pico de memoria por encima de lo que permite una GPU de consumo.
- GPU validadas por el autor: H100 (pruebas de humo de las tres variantes).
- GPU recomendadas: H100 o A100 de 80 GB para BF16; A100 de 40 GB o H100 para FP8/INT8 con holgura.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 ni con GPUs de 24 GB; el requisito de `--vram_mode full` en FP8/INT8 hace probable que no quepan con comodidad.
- Opciones de despliegue: runtime oficial SenseNova-U1 (Python, `uv sync --locked`), con backend de atención automático y FlashAttention en las pruebas; variantes GGUF en el repositorio SenseNova-U1.6-8B-MoT-GGUF para otros runtimes.
- Requisitos de software: CUDA y drivers según la guía de instalación del repositorio oficial.
- Latencia y throughput: no disponibles; el autor no realizó mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| SenseNova-U1.6-8B-MoT-Native | no disponible (nombre indica 8B) | no disponible | Apache 2.0 | safetensors BF16/FP8/INT8, GGUF aparte | Enfoque multimodal texto-imagen con runtime propio |
| SenseNova-U1.6-8B-MoT (base) | no disponible | no disponible | Apache 2.0 | safetensors | Checkpoint original sin consolidar |
| SenseNova-U1.6-8B-MoT-GGUF | no disponible | no disponible | Apache 2.0 | GGUF | Misma familia, orientada a llama.cpp y similares |
| Alternativas de texto a imagen de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de información suficiente para comparar rendimiento con modelos de la misma categoría; la model card no incluye comparativas ni resultados de benchmarks frente a terceros.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo entrenado principalmente en inglés y chino, es previsible un sesgo cultural y lingüístico hacia esos mercados, aunque no se cuantifica.
- Riesgo de alucinación visual: la propia model card reconoce que algunas restricciones complejas de prompt siguen sin cumplirse de forma perfecta.
- Cobertura lingüística limitada a inglés y chino; no se declara soporte de castellano.
- Funcionalidades no validadas en esta release: edición de imagen, generación autorregresiva de texto, generación intercalada, autocorrección y otros runtimes distintos del oficial.
- Las pruebas de humo se limitaron a 1024x1024 y 50 pasos, aunque la resolución entrenada es 2048x2048; no hay validación publicada a esa resolución.
- Requisito de `--vram_mode full` para FP8 e INT8, lo que limita el despliegue en GPUs con poca memoria.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las dependencias del runtime y los términos de los modelos base si los hubiera.
- El repositorio tiene muy poca tracción (3 descargas, 0 likes en el momento de la consulta), por lo que la comunidad y el soporte son limitados.
- No se documentan requisitos de atribución adicionales, pero se recomienda conservar el aviso de licencia y los checksums SHA256 de los artefactos.

## Enlaces

- Hugging Face: https://huggingface.co/sensenova/SenseNova-U1.6-8B-MoT-Native
- Modelo base: https://huggingface.co/sensenova/SenseNova-U1.6-8B-MoT
- Variantes GGUF: https://huggingface.co/sensenova/SenseNova-U1.6-8B-MoT-GGUF
- Runtime oficial: https://github.com/OpenSenseNova/SenseNova-U1
- Guía de instalación: https://github.com/OpenSenseNova/SenseNova-U1/blob/main/docs/installation.md
