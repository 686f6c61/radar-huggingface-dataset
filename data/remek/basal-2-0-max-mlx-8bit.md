# Remek/basal-2.0-max-MLX-8bit

## Resumen

basal-2.0-max-MLX-8bit es la versión cuantizada a 8 bits en formato MLX del modelo basal-2.0-max, un modelo de 11.167.748.096 parámetros afinado por Remek (Remigiusz Kinas) a partir de speakleash/Bielik-PL-11B-v3.0-Instruct. No es un modelo conversacional al uso: está diseñado como modelo de decisión tipada (*typed-decision*), es decir, recibe un estado y un conjunto de opciones y devuelve una decisión estructurada, con calibración de confianza asociada. Resuelve el problema de tomar decisiones clasificatorias reproducibles y calibradas en lugar de generar texto libre, y por eso se distribuye junto a un motor de inferencia propio (`basal-serve`) y ficheros de calibración.

La relevancia de esta ficha concreta es que es un port para Apple Silicon: los pesos están en MLX a 8 bits, con un tamaño de repositorio de 12,1 GB, pensados para ejecutarse en un Mac con GPU unificada. El autor publica métricas de acuerdo (*agreement*) frente al modelo bf16 original en un conjunto de desarrollo (dev v2), con puertas de calidad explícitas, lo que permite evaluar si la cuantización degrada la capa de decisión.

El modelo cubre polaco e inglés, tiene una longitud de contexto de 32.768 tokens según la model card, admite hasta 255 opciones por pregunta (20 en Ollama) y se distribuye bajo licencia Apache-2.0. Está orientado a decisiones con consecuencias revisables, no a sustituir juicio humano en casos críticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Bielik-PL-11B-v3.0-Instruct); no se detalla variante específica |
| Parámetros totales | 11.167.748.096 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | 8 bits en MLX (este repo); el proyecto publica además FP8, GGUF Q8_0 y GGUF Q5_K_M |
| Idiomas soportados | pl, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 8-bit) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que el modelo base es speakleash/Bielik-PL-11B-v3.0-Instruct, un transformer de 11B parámetros del proyecto Bielik (SpeakLeash y ACK Cyfronet AGH), y de que basal-2.0-max es un fine-tune sobre él orientado a decisiones tipadas. No se especifican en la documentación consultada el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación.

La innovación destacable no está en el bloque transformer sino en la capa de decisión y su calibración: el modelo se acompaña de ficheros `CALIBRATION.json` (calibración del modelo bf16) y `CALIBRATION.mlx.json` (ajustada sobre las lecturas MLX de este port con el mismo método y un orden de opciones). El motor `basal-serve` carga la calibración específica del motor cuando existe. Según el autor, una calibración ajustada sobre bf16 no se traslada exactamente a un port cuantizado, y cita como evidencia una prueba externa de basal-1.5 en Ollama con 2,3 % de error real en el umbral del 1 %. En este port, el ECE en dev v2 pasa de 0,0346 con la calibración bf16 a 0,0365 con la ajustada (in-sample) y 0,0409 en validación dejando una familia fuera (*leave-one-family-out*).

## Capacidades

- Toma de decisiones tipadas: recibe un estado y opciones y devuelve una opción seleccionada con confianza calibrada.
- Clasificación con hasta 255 opciones por pregunta (20 en Ollama).
- Modos de decisión diferenciados: `act`, `tool` y `multi` (este último sobre muchas etiquetas, marcado como experimental).
- Calibración de confianza y umbrales de error máximo (`max_error`) configurables por consulta.
- Generación de texto y conversación, heredadas del modelo base Bielik-PL-11B-v3.0-Instruct.
- Soporte de `"facts": "auto"` para delegar el cálculo de hechos y umbrales, dado que la aritmética exacta es un punto débil en decisiones de una pasada.
- Capacidades multilingües limitadas a polaco e inglés.
- Integración con un motor de inferencia propio (`basal-serve`) con modos `mlx` y otros motores del proyecto.
- No incluye cabeza de evidencias (*evidence head*) en la familia 2.0.

## Casos de uso

- Clasificación documental con umbral de confianza: usar el modelo para asignar categorías a documentos polacos o ingleses y aplicar `max_error` para derivar a revisión humana los casos por debajo del umbral calibrado.
- Enrutado de tickets o solicitudes: con hasta 255 opciones por pregunta, se puede mapear un ticket a un departamento o flujo concreto y obtener una confianza utilizable para escalado automático.
- Decisión con *tool calling*: el modo `tool` permite que el modelo elija qué herramienta invocar a partir de un estado y un catálogo de opciones, integrándose en agentes con pasos acotados.
- Selección de acciones en pipelines automatizados: el modo `act` sirve para decidir la siguiente acción en un flujo (por ejemplo, aprobar, rechazar o solicitar información) con registro de la confianza asociada.
- Evaluación y auditoría de decisiones: al devolver opción y calibración, permite construir trazas auditables de por qué se eligió una opción, útil en entornos con requisitos de explicabilidad.
- Procesamiento local en Mac: al ser un port MLX de 12 GB, permite ejecutar el modelo de decisión en un Apple M4 Pro de 24 GB sin depender de la nube, adecuado para prototipos y entornos con requisitos de privacidad.
- Experimentación con decisiones multi-etiqueta: el modo `multi` permite probar asignación de varias etiquetas por instancia, con la advertencia de que es experimental.

## Benchmarks y rendimiento

El autor no puntúa este port en los benchmarks del modelo (Werdykt, JDI, LEK, PL-Holdout, PL-Real); remite a la model card de basal-2.0-max. Lo que sí publica son métricas de acuerdo frente a bf16 en dev v2 (cada octava decisión, 1.700 decisiones):

| Paquete | Acuerdo con bf16 (opciones 2-10) | Acuerdo con margen >= 0,2 | Diferencia de accuracy | Diferencia de ECE | Tamaño | Velocidad | Puerta |
|---|---|---|---|---|---|---|---|
| FP8 | 0,9704 | 0,9948 | +0,0005 | -0,0010 | 12 GB | 19,9 dec/s c16, c1 p50 50 ms (H100) | PASS |
| GGUF Q8_0 | 0,9925 | 0,9997 | +0,0002 | +0,0018 | 12 GB | no medida en esta release | PASS |
| GGUF Q5_K_M | 0,9766 | 0,9970 | -0,0001 | +0,0032 | 7,5 GB | no medida en esta release | PASS |
| MLX 8-bit | 0,9933 | 0,9990 | +0,0017 | +0,0053 | 12 GB | 622 ms c1 p50, 1.506 ms para 5 preguntas (Mac) | PASS |

Las puertas de este nivel exigen acuerdo 2-10 >= 0,9552, acuerdo con margen >= 0,2 >= 0,9893, accuracy a menos de 1 punto de bf16 y ECE con incremento máximo de +0,01. Este port las cumple. El autor aclara que son comprobaciones de la capa de decisión frente a bf16, no nuevos benchmarks.

## Requisitos de hardware

- VRAM/memoria unificada: el paquete ocupa 12 GB y necesita la mayor parte del conjunto de trabajo de GPU de un Mac de 24 GB. Medido en Apple M4 Pro, 24 GB, sin otras aplicaciones usando la GPU; con otro servidor MLX de ~5 GB en marcha falló con error de Metal "Insufficient Memory".
- GPU recomendadas: Apple Silicon con al menos 24 GB de memoria unificada (medido en M4 Pro). Para las otras variantes del proyecto: H100 para FP8 (50 ms p50 en c1, 19,9 dec/s en c16).
- Cabe en GPU de consumo: sí, en Macs con memoria unificada suficiente; no hay datos de ejecución en GPU discretas para este port MLX.
- Despliegue: `basal-serve --mode mlx` con el paquete `basal[mlx]` (tag v2.5.5) instalado mediante `uv` con Python nativo arm64 (`cpython-3.12-macos-aarch64-none`); para otras variantes, FP8 y GGUF.
- Latencia y throughput: 622 ms p50 en c1 y 1.506 ms para 5 preguntas en Mac (M4 Pro, 24 GB). No se publica throughput agregado para este port.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-2.0-max-MLX-8bit | 11,17B | 32.768 | Decisiones tipadas calibradas, MLX 8-bit | Apache-2.0 | Hugging Face (este repo) |
| basal-2.0-max (bf16) | 11B | 32.768 | Decisiones tipadas calibradas, referencia bf16 | Apache-2.0 | Hugging Face |
| basal-2.0-max-FP8 | 11B | 32.768 | Decisiones tipadas, FP8 para GPU | Apache-2.0 | Hugging Face |
| basal-2.0-max-GGUF (Q8_0 / Q5_K_M) | 11B | 32.768 | Decisiones tipadas, GGUF para llama.cpp/Ollama | Apache-2.0 | Hugging Face |
| speakleash/Bielik-PL-11B-v3.0-Instruct | 11B | no disponible | Modelo instructivo generalista pl/en | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Validar sobre documentos propios antes de confiar en el modelo: los conjuntos ocultos y de retención no cubren todos los dominios.
- El conocimiento del mundo en polaco de un modelo de este tamaño es limitado; los hechos relevantes deben incluirse en el estado de la decisión, y las reglas legales cambian con el tiempo.
- La aritmética exacta y los umbrales son un punto débil en decisiones de una pasada; conviene calcularlos en código o usar `"facts": "auto"`.
- La calibración es cauta en tareas no vistas: ningún umbral del 1 % está certificado en los ficheros distribuidos, por lo que `"max_error": 0.01` en una pregunta `act` o `tool` difiere todas las decisiones; se recomienda usar 0,05 o certificar umbrales con `basal-calibrate` sobre datos propios.
- Los modos `act` y `multi` con muchas etiquetas son experimentales; el límite es de 255 opciones por pregunta (20 en Ollama).
- La familia 2.0 no incluye cabeza de evidencias.
- Las decisiones con consecuencias serias para personas deben ser revisadas por una persona.
- Restricciones de memoria: en Macs de 24 GB no puede convivir con otro servidor MLX de tamaño similar.
- Licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución a Bielik (SpeakLeash y ACK Cyfronet AGH) y al autor del fine-tune.
- Riesgo de alucinación: no se documenta explícitamente, pero es inherente al modelo base y relevante si se usa en modo generación libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-2.0-max-MLX-8bit
- Modelo de referencia bf16: https://huggingface.co/Remek/basal-2.0-max
- Variante FP8: https://huggingface.co/Remek/basal-2.0-max-FP8
- Variante GGUF: https://huggingface.co/Remek/basal-2.0-max-GGUF
- Colección basal-2.0: https://huggingface.co/collections/Remek/basal-20-6acd1712a8e443c86cd576fc
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
- Modelo base: https://huggingface.co/speakleash/Bielik-PL-11B-v3.0-Instruct
