# ayanoby/hexanima-h3

## Resumen

hexanima-h3 es un paquete de pesos redistribuido y modificado de MiniMax-H3-Image, un modelo de generación de imágenes de MiniMaxAI, adaptado por el usuario ayanoby para su ejecución en la NPU Hexagon V69 de los SoC Snapdragon 8 Gen 1 y 8+ Gen 1 dentro de la aplicación Android HexAnima. No se trata de un modelo nuevo ni de un fine-tuning: es un derivado cuantizado y reempaquetado en formato de tiles INT8 propietario (HMX V69), con el decodificador VAE convertido a binario de contexto QNN HTP en fp16 y un LoRA de destilación (pDMD 2-NFE, rango 128) integrado sobre el transformer.

El repositorio ocupa 48,4 GB y contiene el transformer INT8-ConvRot, el codificador de texto Qwen3-VL (capas 0-49 más embeddings) reempaquetado del mismo modo, el VAE, el LoRA y los ficheros del tokenizador en texto plano. Su relevancia es acotada pero específica: demuestra una vía de despliegue de un modelo de difusión de gran tamaño en hardware móvil de gama alta mediante cuantización INT8 por tiles y ejecución en NPU, algo poco habitual en el ecosistema open source.

La licencia es la MiniMax-H3-Image Community License Agreement, que excluye explícitamente los territorios de Estados Unidos, Unión Europea, Reino Unido y Corea del Sur, y prohíbe usar las salidas para mejorar otros modelos de IA. Esto condiciona fuertemente cualquier uso comercial o de investigación en España.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (INT8-ConvRot) con codificador de texto Qwen3-VL y decodificador VAE |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 por tiles (HMX V69, "compact q8": una escala fp16 por columna de tile, matriz de rotación H256); VAE en fp16 (QNN HTP) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-image-community-license-agreement (excluye EE. UU., UE, Reino Unido y Corea del Sur) |
| Formato de pesos | Tiles INT8 propietarios para NPU Hexagon V69; VAE en binario QNN HTP; tokenizador en texto plano |

## Arquitectura y entrenamiento

El modelo subyacente es MiniMax-H3-Image, un modelo de difusión para generación de imágenes que combina un transformer de difusión con un codificador de texto basado en Qwen3-VL. En este repositorio, el transformer y el codificador de texto se han convertido desde la versión FP8 de unsloth (unsloth/MiniMax-H3-Image-FP8) a un formato INT8 "ConvRot" con rotación H256 y una escala fp16 por columna de tile, organizado en un fichero por bloque. El VAE se ha convertido a un contexto binario de Qualcomm QNN HTP en fp16.

Sobre el transformer se aplica un LoRA de destilación pDMD de 2 pasos (akhaliq/minimax-h3-image-pdmd-2step, rango 128), reempaquetado en tiles, que reduce el número de pasos de muestreo necesarios. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el autor no documenta esos detalles y se limita a describir el proceso de reempaquetado. La innovación técnica destacable es precisamente el pipeline de conversión a tiles INT8 ejecutables en la NPU Hexagon V69, no el entrenamiento.

## Capacidades

- Generación de imágenes a partir de prompts de texto, heredada de MiniMax-H3-Image.
- Codificación de texto multilingüe potencial a través del codificador Qwen3-VL (idiomas concretos no documentados).
- Muestreo acelerado en 2 pasos gracias al LoRA pDMD integrado.
- Ejecución en NPU Hexagon V69 (Snapdragon 8 Gen 1 / 8+ Gen 1) mediante la app HexAnima 1.6.0 o superior.
- Verificación de integridad de los ficheros mediante manifest.json (tamaño y sha256).
- No consta soporte de tool calling, function calling, agentes ni modos de razonamiento multi-paso; es un modelo de generación de imágenes, no un LLM conversacional.
- No consta soporte de audio ni de visión de entrada más allá del propio codificador de texto.

## Casos de uso

- Generación de imágenes en dispositivo móvil sin conexión: el pack está diseñado para ejecutarse íntegramente en la NPU de un Snapdragon 8 Gen 1 / 8+ Gen 1, lo que permite crear imágenes sin enviar prompts a un servidor.
- Prototipado de apps Android con IA generativa local: sirve como referencia para integrar un modelo de difusión cuantizado en una aplicación Android mediante QNN y tiles INT8.
- Investigación sobre cuantización INT8 en NPU: el formato "compact q8" con rotación H256 y escalas por columna es un caso de estudio para quienes trabajan en despliegue de difusión en hardware móvil.
- Evaluación de LoRA de destilación en producción: el pDMD 2-NFE permite comparar la calidad de muestreo en 2 pasos frente a samplers completos en un entorno móvil.
- Demostraciones y pruebas de concepto de generación de imágenes privada: al ejecutarse localmente, evita el envío de prompts a servicios en la nube, útil en contextos con requisitos de privacidad.
- Benchmarking de throughput en Hexagon V69: permite medir latencia y consumo energético de un transformer de difusión cuantizado en un SoC concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: aproximadamente 48 GB libres en el dispositivo (tamaño del repositorio: 48,4 GB).
- SoC: Snapdragon 8 Gen 1 o 8+ Gen 1 con NPU Hexagon V69; no es compatible con otras NPU ni con GPU de escritorio en el formato actual.
- VRAM/RAM: no disponible; el pack está pensado para la memoria compartida del SoC móvil, no para GPU dedicada.
- GPU recomendadas: no aplica; el formato de pesos es específico de la NPU Hexagon V69.
- ¿Cabe en GPU consumer? No en el formato distribuido; los tiles INT8 y el binario QNN no son cargables por llama.cpp, vLLM, Ollama ni TGI.
- Opciones de despliegue: exclusivamente la app HexAnima 1.6.0 o superior, que descarga el pack desde su catálogo a `files/h3/` y verifica cada fichero contra manifest.json. Instalación manual posible copiando las carpetas y creando el marcador `.installed`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hexanima-h3 (este) | no disponible | no disponible | Tiles INT8 HMX V69 + QNN HTP | MiniMax-H3-Image Community License (excluye EE. UU., UE, R. U. y Corea del Sur) | Hugging Face, 0 descargas |
| MiniMaxAI/MiniMax-H3-Image | no disponible | no disponible | no disponible | MiniMax-H3-Image Community License | Hugging Face (modelo base) |
| unsloth/MiniMax-H3-Image-FP8 | no disponible | no disponible | FP8 | MiniMax-H3-Image Community License | Hugging Face (fuente de la conversión) |
| akhaliq/minimax-h3-image-pdmd-2step | no disponible (LoRA rango 128) | no aplica | LoRA | MiniMax-H3-Image Community License | Hugging Face (LoRA incluido) |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Restricción territorial: la licencia excluye Estados Unidos, Unión Europea, Reino Unido y Corea del Sur; su uso desde España queda fuera del territorio permitido según la Sección I del LICENSE.
- Prohibición de uso de salidas para entrenar otros modelos (Sección V.3 de la licencia).
- El autor advierte que "nada aquí está pensado para usarse fuera del Territorio Aplicable".
- Es un derivado modificado, no el modelo original; la calidad puede diferir de MiniMax-H3-Image por la cuantización INT8 y el reempaquetado.
- Dependencia total de la app HexAnima y del hardware Hexagon V69; no hay portabilidad a otros backends.
- Riesgo de alucinación visual y sesgos propios del modelo base, no documentados en esta ficha.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Sin descargas ni likes en el momento de la consulta (0/0), lo que implica ausencia de validación comunitaria.
- El repositorio incluye un LoRA de terceros sujeto a la misma licencia, lo que añade una capa de cumplimiento adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ayanoby/hexanima-h3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Fuente FP8 de la conversión: https://huggingface.co/unsloth/MiniMax-H3-Image-FP8
- LoRA pDMD 2-NFE: https://huggingface.co/akhaliq/minimax-h3-image-pdmd-2step
