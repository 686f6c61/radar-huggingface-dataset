# jkim96/Ornith-1.0-9B-DASHQ-Q2-GGUF

## Resumen
Ornith-1.0-9B-DASHQ-Q2-GGUF es una colección de ficheros GGUF cuantizados a 2 bits del modelo base deepreinforce-ai/Ornith-1.0-9B, publicada por el usuario jkim96. La cuantización se ha realizado con la herramienta DASH-Q (repositorio JaeminK/dashq) y todos los ficheros emplean exclusivamente tipos de tensor estándar de llama.cpp (IQ2_XXS, IQ2_XS, IQ2_M y Q2_K_XL), ninguno por encima de 4 bits, de modo que cargan en cualquier compilación reciente de llama.cpp.

El modelo base cuenta con 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) e incorpora una torre de visión que esta versión cuantizada no incluye: el resultado es un modelo exclusivamente de texto. La relevancia de esta ficha reside en que permite ejecutar un modelo de ~9B en hardware muy modesto, con ficheros de entre 3,17 GB y 4,00 GB, a costa de una pérdida de calidad que el autor documenta mediante perplejidad.

El repositorio ocupa 14,6 GB en total, se distribuye bajo licencia MIT (heredada del modelo base) y está pensado para generación de texto conversacional mediante llama.cpp. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni la arquitectura interna del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base deepreinforce-ai/Ornith-1.0-9B, que incluye torre de visión; esta versión es solo texto) |
| Parametros totales | 8.953.803.264 (aprox. 8,95B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso de llama.cpp emplea `-c 8192`, pero no se documenta el contexto nativo del modelo) |
| Tipos de cuantizacion | IQ2_XXS (2,84 bits/peso), IQ2_XS (3,29 bits/peso), IQ2_M (3,40 bits/peso), Q2_K_XL (3,58 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento
No se dispone de información detallada sobre la arquitectura del modelo base en la documentación proporcionada. Se sabe que deepreinforce-ai/Ornith-1.0-9B incorpora una torre de visión, descartada en esta versión cuantizada, lo que convierte a los ficheros DASH-Q en modelos exclusivamente de texto. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica de esta publicación es el método de cuantización DASH-Q, que produce ficheros de clase 2 bits con una perplejidad inferior a la de las cuantizaciones de referencia de llama.cpp (con imatrix) y de unsloth (UD) en los mismos niveles de bits. El autor reporta mejoras sistemáticas en WikiText-2 y C4 manteniendo todos los tensores en tipos estándar de llama.cpp, lo que garantiza compatibilidad sin parches.

## Capacidades
- Generación de texto conversacional, según el pipeline declarado (text-generation) y la etiqueta conversational.
- Ejecución local mediante llama.cpp en CPU y GPU, gracias al formato GGUF.
- Cuantización de 2 bits con tipos de tensor estándar, apta para equipos con VRAM limitada.
- Capacidades multilingües: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; la visión queda explícitamente excluida en esta versión.

## Casos de uso
- Despliegue en equipos de gama de entrada: con ficheros de 3,17-4,00 GB, el modelo puede ejecutarse en portátiles y mini-PC con GPU integrada o tarjetas de 4-6 GB de VRAM, algo inviable para el modelo base en precisión completa.
- Prototipado y pruebas offline: permite validar pipelines de generación de texto sin conexión y sin coste de API, usando llama.cpp como motor.
- Inferencia en el borde (edge computing): su tamaño reducido facilita el despliegue en dispositivos con almacenamiento y memoria limitados.
- Evaluación comparativa de cuantizaciones: sirve para medir el impacto real de la cuantización a 2 bits sobre la perplejidad frente a las variantes de llama.cpp y unsloth.
- Generación de texto conversacional de propósito general: adecuada para tareas de chat donde la pérdida de precisión de 2 bits sea aceptable.
- Aplicaciones educativas y de investigación: permite estudiar el comportamiento de modelos de ~9B cuantizados agresivamente en entornos con recursos escasos.

## Benchmarks y rendimiento
Perplejidad (menor es mejor), medida con `llama-perplexity`, contexto 2048, sobre WikiText-2 test y C4 validation (256 x 2048 tokens):

| Tipo | Modelo | Tamano | WikiText-2 | C4 |
|---|---|---|---|---|
| IQ2_XXS | llama.cpp IQ2_XXS (imatrix) | 3,10 GB | 10,10 | 16,26 |
| IQ2_XXS | DASH-Q IQ2_XXS | 3,17 GB | 9,72 | 15,55 |
| IQ2_XS | llama.cpp IQ2_XS (imatrix) | 3,29 GB | 8,98 | 14,51 |
| IQ2_XS | DASH-Q IQ2_XS | 3,67 GB | 7,96 | 12,98 |
| IQ2_M | llama.cpp IQ2_M (imatrix) | 3,61 GB | 8,08 | 13,23 |
| IQ2_M | unsloth UD-IQ2_M | 3,86 GB | 7,84 | 12,74 |
| IQ2_M | DASH-Q IQ2_M | 3,80 GB | 7,69 | 12,51 |
| Q2_K_XL | llama.cpp Q2_K (imatrix) | 3,83 GB | 8,00 | 13,39 |
| Q2_K_XL | unsloth UD-Q2_K_XL | 4,33 GB | 7,76 | 12,61 |
| Q2_K_XL | DASH-Q Q2_K_XL | 4,00 GB | 7,59 | 12,34 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (estimación propia a partir del tamaño de fichero, sin incluir caché KV): IQ2_XXS ~4 GB, IQ2_XS ~4,5 GB, IQ2_M ~4,7 GB, Q2_K_XL ~5 GB. La memoria real depende de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM. Encajan tarjetas de consumo como RTX 3060 12 GB, RTX 4060, RTX 3060 Ti o superiores. No requiere GPU de centro de datos (A100, H100) para funcionar.
- ¿Cabe en GPU de consumo?: sí, en prácticamente cualquier GPU moderna con 6 GB o más, e incluso puede ejecutarse parcial o totalmente en CPU.
- Opciones de despliegue: llama.cpp (referencia del autor), y por extensión cualquier motor compatible con GGUF estándar (Ollama, LM Studio, entre otros). No hay confirmación de soporte para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor solo documenta el comando de ejemplo `llama-cli -m Ornith-1.0-9B-DASHQ-Q2_K_XL.gguf -ngl 99 -c 8192`.

## Comparativa con modelos similares
Comparativa de las cuantizaciones de 2 bits sobre el mismo modelo base (datos de perplejidad del autor):

| Cuantizacion | Tamano | WikiText-2 | C4 | Notas |
|---|---|---|---|---|
| DASH-Q IQ2_XXS | 3,17 GB | 9,72 | 15,55 | Mejor que llama.cpp IQ2_XXS (imatrix) |
| DASH-Q IQ2_XS | 3,67 GB | 7,96 | 12,98 | Mejor que llama.cpp IQ2_XS (imatrix) |
| DASH-Q IQ2_M | 3,80 GB | 7,69 | 12,51 | Mejor que llama.cpp IQ2_M y unsloth UD-IQ2_M |
| DASH-Q Q2_K_XL | 4,00 GB | 7,59 | 12,34 | Mejor que llama.cpp Q2_K y unsloth UD-Q2_K_XL |

| Caracteristica | DASH-Q (esta publicacion) | llama.cpp imatrix | unsloth UD |
|---|---|---|---|
| Tipos de tensor | Estándar llama.cpp | Estándar llama.cpp | Estándar llama.cpp |
| Rango de tamano | 3,17-4,00 GB | 3,10-3,83 GB | 3,86-4,33 GB |
| Perplejidad WikiText-2 | 7,59-9,72 | 8,00-10,10 | 7,76-7,84 (solo IQ2_M y Q2_K_XL) |
| Licencia | MIT | MIT (hereda del base) | no disponible en la informacion |

Comparación con otros modelos de ~9B: no disponible; la información proporcionada solo permite comparar variantes de cuantización del mismo modelo base.

## Limitaciones y advertencias
- La cuantización a 2 bits implica una pérdida de calidad notable frente al modelo en precisión completa; la perplejidad de WikiText-2 se sitúa entre 7,59 y 9,72 según la variante.
- No incluye la torre de visión, por lo que no puede procesar imágenes pese a que el modelo base sí lo hace.
- Se desconoce la longitud de contexto nativa del modelo; el valor `-c 8192` del ejemplo es una configuración de ejecución de llama.cpp, no un límite documentado del modelo.
- No hay información sobre idiomas soportados, sesgos, riesgo de alucinación ni comportamiento específico por dominio.
- Licencia MIT, lo que permite uso comercial, pero se recomienda verificar la licencia del modelo base (deepreinforce-ai/Ornith-1.0-9B) por si impone condiciones adicionales.
- No hay datos publicados de benchmarks de tareas (MMLU, HumanEval, GSM8K), por lo que no puede evaluarse su rendimiento en razonamiento, código o matemáticas.
- El repositorio no registra descargas ni valoraciones (0 descargas, 0 likes) en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/jkim96/Ornith-1.0-9B-DASHQ-Q2-GGUF
- Modelo base: https://huggingface.co/deepreinforce-ai/Ornith-1.0-9B
- Repositorio de DASH-Q: https://github.com/JaeminK/dashq
- Banner de DASH-Q: https://raw.githubusercontent.com/JaeminK/dashq/main/assets/dashq_banner.png
