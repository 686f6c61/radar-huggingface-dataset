# Harsha001/SenseNova-Loop-9B-ROCmFPX

## Resumen

SenseNova-Loop-9B-ROCmFPX es una cuantización GGUF del modelo vision-lenguaje SenseNova-Loop-9B, desarrollado originalmente por el equipo SenseNova y publicado en Hugging Face bajo licencia Apache-2.0. Esta versión concreta la mantiene el usuario Harsha001 y utiliza el formato propietario ROCmFPX, orientado a hardware AMD (en particular Strix Halo) y a Vulkan, con kernels específicos que no están disponibles en llama.cpp estándar ni en las distribuciones habituales como Ollama o LM Studio.

El modelo base es un transformer de 9B parámetros (8.956.949.625 exactos) con una arquitectura denominada `sensenova_loop`, que ejecuta 24 de sus 32 capas del decodificador dos veces, dando lugar a 56 pasadas de capa por token, y que mezcla dos flujos residuales dentro de la parte en bucle (mHC). Es multimodal: acepta texto e imágenes y genera texto, con soporte de inglés y chino. El contexto máximo no está especificado en la información disponible.

La relevancia de esta ficha reside en dos factores: por un lado, es una de las primeras cuantizaciones publicadas de una arquitectura nueva y poco común (looped transformer con doble flujo residual); por otro, el formato ROCmFPX introduce una alternativa a las cuantizaciones GGUF convencionales con métricas de divergencia KL reportadas frente a BF16. El autor advierte de que el modelo es especialmente sensible a la cuantización y de que la implementación aún no se ha probado en hardware AMD real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle de capas (`sensenova_loop`): 32 capas, 24 ejecutadas dos veces (56 pasadas por token), doble flujo residual (mHC) |
| Parametros totales | 8.956.949.625 (~9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (ROCmFPX), Q6_K (ROCmFPX, `Q6_0_ROCMFPX`), Q4_0 (ROCmFP4-FAST con atención y salida en 8 bits, para Strix Halo); vision encoder en F16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (variantes ROCmFPX y mmproj F16 para el codificador visual) |

## Arquitectura y entrenamiento

El modelo base es un transformer con una innovación estructural: de sus 32 capas del decodificador, 24 se ejecutan dos veces por token, lo que resulta en 56 pasadas de capa. Durante la parte en bucle se mezclan dos flujos residuales (mHC, multi-stream residual mixing). Esta configuración incrementa el coste computacional por token respecto a un transformer de 9B convencional, ya que el número efectivo de operaciones de capa se aproxima al de un modelo mayor. El decodificador reutiliza el diseño híbrido de capas de Qwen3.5, lo que ha permitido al fork ROCmFPX reutilizar código de llama.cpp para Qwen3.5 en su implementación.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo incluye una cabeza de predicción multi-token (MTP) que no está incluida en estos archivos GGUF. La plantilla de chat incorpora un bloque de razonamiento (`<think>`); para obtener respuestas sin razonamiento explícito, el autor indica que debe iniciarse la respuesta con un bloque `<think>\n\n</think>\n\n` vacío. El codificador visual se distribuye por separado como `mmproj-SenseNova-Loop-9B-F16.gguf` (0,9 GB) y es necesario para el procesamiento de imágenes.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Comprensión de imágenes y descripción de contenido visual (pipeline `image-text-to-text`), incluyendo localización espacial de objetos.
- Razonamiento con modo de pensamiento explícito mediante bloques `<think>` en la plantilla de chat.
- Capacidades de razonamiento general y respuesta a preguntas (verificadas con preguntas simples como la capital de Francia).
- Soporte de plantilla de chat conversacional incluida en los archivos.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Asistente visual conversacional: el modelo puede recibir una imagen junto con una pregunta de texto y devolver una descripción o respuesta contextual; el codificador `mmproj` en F16 permite integrarlo en pipelines de image-text-to-text.
- Descripción y verificación de contenido visual: útil para tareas de control de calidad de imágenes (por ejemplo, comprobar la disposición de elementos en una captura o diagrama), como demuestra la prueba del autor identificando un círculo rojo y un cuadrado azul en posiciones concretas.
- Razonamiento con traza explícita: el bloque `<think>` permite obtener cadenas de razonamiento separadas de la respuesta final, adecuado para depuración de pipelines o para aplicaciones que necesitan auditar el proceso de decisión.
- Despliegue en hardware AMD con memoria limitada: la variante Q4_0 ROCmFP4-FAST (6,6 GB) está pensada para Strix Halo, donde el presupuesto de memoria es ajustado y prima la velocidad sobre la fidelidad máxima al BF16.
- Evaluación de arquitecturas experimentales: investigadores que quieran estudiar el comportamiento de un looped transformer con doble flujo residual pueden usar la cuantización Q8_0 (9,3 GB) como aproximación cercana al BF16 (KL 0,0012, 98,7% de mismo token superior).
- Procesamiento de texto en inglés y chino: aplicaciones de generación o resumen bilingüe en entornos donde no se requiere tool calling ni agentes.
- Integración en pipelines con llama.cpp modificado: el fork ROCmFPX permite cargar el modelo en entornos que ya usan llama.cpp, siempre que se compile la versión del 18 de noviembre de 2026 o posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí reporta métricas de fidelidad de cuantización medidas con `llama-perplexity --kl-divergence` frente a un GGUF BF16 convertido desde los pesos originales (perplejidad 14,46), sobre 40 fragmentos de 512 tokens de wikitext-2 en inglés, en una GPU NVIDIA GB10 tras expandir cada archivo a F16:

| Archivo | Tamano | KL a BF16 | Mismo token superior |
|---|---:|---:|---:|
| Q8_0 ROCmFPX | 9,3 GB | 0,0012 | 98,7% |
| Q6_K ROCmFPX (`Q6_0_ROCMFPX`) | 7,4 GB | 0,013 | 95,5% |
| Q4_0 ROCmFP4-FAST Strix | 6,6 GB | No medido | No medido |
| Q6_K estándar (referencia) | 7,4 GB | 0,012 | 95,9% |
| Q8_0 estándar (referencia) | 9,5 GB | 0,0023 | 98,5% |

El autor señala que el modelo es entre siete y diez veces más sensible a la cuantización que un fine-tune de Qwen3.5-9B con la misma receta, probablemente porque los errores de redondeo en las capas compartidas atraviesan el bucle dos veces. No se reportan latencia ni throughput; el autor advierte de que la generación es más lenta que en un 9B plano del mismo tamaño por el gran número de operaciones pequeñas en GPU que generan el bucle y la mezcla de flujos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9,3 GB para Q8_0, 7,4 GB para Q6_K y 6,6 GB para Q4_0 ROCmFP4, más 0,9 GB del `mmproj` F16 si se procesan imágenes.
- GPU recomendadas: el formato está orientado a AMD (ROCm), con mención explícita de Strix Halo para la variante Q4_0; el autor midió las métricas de KL en una NVIDIA GB10. No se especifican modelos concretos como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8-10 GB de VRAM para las variantes de 6 y 8 bits, siempre que se use el fork ROCmFPX; no es compatible con llama.cpp estándar, LM Studio ni Ollama.
- Opciones de despliegue: exclusivamente el fork [HarshaVardhan3002/ROCmFPX](https://github.com/HarshaVardhan3002/ROCmFPX) compilado a partir del 18 de noviembre de 2026; no funciona en vLLM, TGI, llama.cpp upstream ni Ollama.
- Latencia y throughput: no disponibles; el autor advierte de que serán peores que en un 9B convencional por la doble pasada de capas y las operaciones pequeñas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-ROCmFPX (esta ficha) | ~9B | No disponible | GGUF ROCmFPX | Apache-2.0 | Requiere fork ROCmFPX; cuantizaciones Q8_0, Q6_K y Q4_0 |
| SenseNova-Loop-9B (original) | ~9B | No disponible | Pesos PyTorch (safetensors) | Apache-2.0 | Modelo base multimodal; referencia BF16 con perplejidad 14,46 |
| Qwen3.5-9B (fine-tune citado por el autor) | ~9B | No disponible | No disponible | No disponible | Usado como referencia de sensibilidad a cuantización (7-10 veces menor deriva) |
| GGUF estándar Q6_K / Q8_0 del mismo modelo | ~9B | No disponible | GGUF | Apache-2.0 | Compatible con llama.cpp estándar; KL 0,012 y 0,0023 respectivamente |

No se dispone de datos de benchmarks que permitan comparar rendimiento cualitativo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Compatibilidad restringida: los archivos solo cargan con el fork ROCmFPX del 18 de noviembre de 2026 o posterior; llama.cpp estándar, LM Studio, Ollama y versiones antiguas del fork fallarán.
- Sin probar en hardware AMD real: el autor indica explícitamente que no se ha validado en AMD y pide reportes de velocidad y calidad en la pestaña Community.
- Alta sensibilidad a la cuantización: la deriva KL es entre siete y diez veces mayor que en un 9B equivalente; para máxima fidelidad debe usarse el archivo Q8_0.
- La variante Q4_0 para Strix Halo no tiene métricas de KL publicadas; solo superó una prueba corta de respuesta ("The capital of France is Paris.").
- Cabeza MTP no incluida en los GGUF, lo que puede afectar al rendimiento en decodificación especulativa si se esperaba esa funcionalidad.
- Idiomas limitados a inglés y chino; no se documenta soporte de español ni de otros idiomas.
- Longitud de contexto no especificada; no debe asumirse una ventana larga sin verificarla en el modelo base.
- Sin soporte documentado de tool calling, function calling ni flujos agénticos.
- Generación más lenta que un 9B plano por el bucle de capas y las operaciones pequeñas en GPU.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas; al ser un modelo conversacional y multimodal, debe validarse en el dominio de aplicación.
- Licencia Apache-2.0 permite uso comercial, pero la obligación de usar un fork concreto puede condicionar el mantenimiento y la seguridad a largo plazo.
- No es una release oficial del equipo SenseNova; el crédito del modelo corresponde a dicho equipo y la cuantización es obra de un tercero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/SenseNova-Loop-9B-ROCmFPX
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Repositorio del fork ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Código oficial del modelo: https://github.com/OpenSenseNova/SenseNova-Loop
