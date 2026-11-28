# Remek/basal-2.0-max-MLX-8bit

## Resumen

basal-2.0-max-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo basal-2.0-max, un ajuste fino de 11.167.748.096 parámetros construido sobre speakleash/Bielik-PL-11B-v3.0-Instruct. Lo desarrolla Remigiusz Kinas (usuario Remek) y está diseñado específicamente para la toma de decisiones tipadas ("typed decisions"): el modelo no genera texto libre, sino que selecciona entre opciones etiquetadas con un margen de confianza calibrado. Es, por tanto, un modelo de clasificación y decisión, no un asistente conversacional generalista, aunque hereda la interfaz de generación de texto de su modelo base.

La relevancia de esta ficha concreta es que se trata de un port cuantizado para Apple Silicon: el paquete ocupa 12 GB y está pensado para ejecutarse con el motor propio del autor (`basal-serve`) en modo `mlx` sobre Macs con memoria unificada. El autor publica métricas de acuerdo con la versión bf16 de referencia, lo que permite evaluar la pérdida de fidelidad introducida por la cuantización. El contexto declarado es de 32.768 tokens y admite hasta 255 opciones por pregunta.

El modelo soporta polaco e inglés y se distribuye bajo licencia Apache-2.0, heredada del modelo base. Su nicho es claro: pipelines de decisión con umbrales de error calibrados (ECE, certificación de umbrales) en lugar de generación abierta. Para quien necesite un LLM polaco de propósito general, este no es el artefacto adecuado; para quien necesite decisiones auditables con control de confianza sobre Apple Silicon, sí lo es.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Bielik-PL-11B-v3.0-Instruct); pesos en formato MLX |
| Parametros totales | 11.167.748.096 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 8 bits (MLX); el autor publica además FP8, GGUF Q8_0 y GGUF Q5_K_M como paquetes separados |
| Idiomas soportados | pl, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 12,1 GB de repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Bielik-PL-11B-v3.0-Instruct, un transformer decoder-only de 11B parámetros entrenado por Speakleash para polaco e inglés. basal-2.0-max es un ajuste fino de ese modelo orientado a decisiones tipadas: el autor no documenta en esta ficha el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Lo que sí se documenta es el sistema de calibración: el modelo emite decisiones con un margen de confianza que se calibra estadísticamente sobre conjuntos de desarrollo (dev v2) y se valida con métricas de error de calibración esperado (ECE).

La innovación técnica principal no está en la arquitectura, sino en la capa de decisión y en el proceso de portado. El autor mide cada cuantización contra la versión bf16 con tres criterios: acuerdo en la opción elegida (para preguntas de 2 a 10 opciones), acuerdo en el margen de referencia ≥ 0,2, y diferencia de exactitud y de ECE. Para este port MLX 8-bit los valores son 0,9933 de acuerdo, 0,9990 de acuerdo en margen ≥ 0,2, +0,0017 de diferencia de exactitud y +0,0053 de diferencia de ECE, con un gate PASS. Además, el paquete incluye `CALIBRATION.mlx.json`, un ajuste de calibración propio del port (ECE 0,0365 in-sample y 0,0409 held-out con leave-one-family-out), en lugar de reutilizar la calibración bf16, que no se transfiere exactamente a un modelo cuantizado.

## Capacidades

- Toma de decisiones tipadas: selección entre opciones etiquetadas (hasta 255 por pregunta; 20 en la variante Ollama) con margen de confianza calibrado.
- Clasificación con control de error: soporta umbrales de error máximo (`max_error`), pensados para certificar decisiones con `basal-calibrate`.
- Modos `act` y `multi`: decisiones de acción y decisiones múltiples sobre muchos labels, marcados como experimentales por el autor.
- Generación de texto y conversación: hereda la interfaz de text-generation del modelo base, aunque el foco del ajuste es la decisión.
- Soporte bilingüe polaco-inglés.
- Integración con el motor `basal-serve` mediante API HTTP (puerto configurable), con modos `mlx`, y compatibilidad con el resto de la familia basal-2.0.
- El motor basal v2.0.0 también sirve los modelos experimentales basal-omni-1.0 (imágenes y audio), aunque esta capacidad corresponde a esos modelos, no a este port.
- No incluye cabeza de evidencias ("evidence head") en la familia 2.0.

## Casos de uso

- Triaje documental con umbral de error: clasificar documentos entrantes en categorías predefinidas y usar `max_error` para derivar a revisión humana los casos con confianza insuficiente. Adecuado porque el modelo expone calibración y ECE medido, no solo una etiqueta.
- Enrutamiento de tickets de soporte en polaco: decidir entre un conjunto acotado de colas o departamentos a partir del texto del ticket, con hasta 255 opciones por pregunta y contexto de 32.768 tokens para hilos largos.
- Validación de formularios y solicitudes: comprobar si una solicitud cumple criterios tipados (campos, categorías, estados) y marcar automáticamente las que requieren intervención, apoyándose en el modo `act`.
- Decisiones de cumplimiento normativo asistidas: aplicar reglas de negocio codificadas como opciones y dejar que el modelo seleccione la aplicable, con la advertencia de que las reglas legales cambian y deben mantenerse en el estado de entrada.
- Prototipado local en Apple Silicon: desplegar un motor de decisión completo en un Mac con 24 GB de memoria unificada para pruebas de integración antes de pasar a GPUs en producción, dado que el paquete MLX ocupa 12 GB.
- Investigación sobre calibración: usar los ficheros de calibración y las métricas de acuerdo frente a bf16 como base para estudiar la transferencia de calibración entre precisiones y motores.
- Extracción de decisiones estructuradas en pipelines de datos en polaco: convertir texto no estructurado en etiquetas consistentes para alimentar bases de datos o sistemas de reglas, con latencia de 622 ms p50 por decisión en M4 Pro.

## Benchmarks y rendimiento

El autor no publica en esta ficha los resultados del modelo en benchmarks estándar (MMLU, HumanEval, GSM8K); remite a la model card de basal-2.0-max para los números de Werdykt, JDI, LEK, PL-Holdout y PL-Real. Los datos disponibles aquí son métricas de fidelidad del port frente a bf16:

| Metrica | MLX 8-bit | FP8 | GGUF Q8_0 | GGUF Q5_K_M |
|---|---|---|---|---|
| Acuerdo con bf16 (opciones 2-10) | 0,9933 | 0,9704 | 0,9925 | 0,9766 |
| Acuerdo en margen ≥ 0,2 | 0,9990 | 0,9948 | 0,9997 | 0,9970 |
| Diferencia de exactitud | +0,0017 | +0,0005 | +0,0002 | -0,0001 |
| Diferencia de ECE | +0,0053 | -0,0010 | +0,0018 | +0,0032 |
| Tamano | 12 GB | 12 GB | 12 GB | 7,5 GB |
| Gate | PASS | PASS | PASS | PASS |

Velocidad medida en Apple M4 Pro de 24 GB: 622 ms p50 para una decisión (c1) y 1.506 ms para cinco preguntas. Para FP8 en H100 el autor reporta 19,9 decisiones/s con concurrencia 16 y 50 ms p50 con concurrencia 1. Los GGUF no tienen velocidad medida en esta release.

## Requisitos de hardware

- VRAM/memoria: el paquete MLX ocupa 12 GB y necesita la mayor parte del conjunto de trabajo de GPU de un Mac de 24 GB de memoria unificada. El autor advierte que con otro servidor MLX de ~5 GB en marcha falla con "Insufficient Memory" de Metal.
- GPU recomendadas: Apple Silicon (medido en M4 Pro, 24 GB). Para las otras cuantizaciones de la familia, el autor reporta H100 para FP8.
- GPU de consumo: no hay datos publicados para RTX 4090 u otras GPU de consumo en esta ficha; el port MLX es específico de Apple Silicon.
- Despliegue: `basal-serve --model Remek/basal-2.0-max-MLX-8bit --mode mlx --port 8000`, instalado vía `uv` con Python 3.12 nativo arm64 (no bajo Rosetta) y el paquete `basal[mlx]` desde el tag v2.8.1 del repositorio GitHub. Para otras plataformas existen los paquetes FP8 y GGUF de la misma familia.
- Latencia y throughput: 622 ms p50 por decisión individual y 1.506 ms para cinco preguntas en M4 Pro de 24 GB; 19,9 decisiones/s con concurrencia 16 en H100 para la variante FP8.
- Requisito de entorno: cerrar otras aplicaciones que usen GPU antes de arrancar el servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| basal-2.0-max-MLX-8bit | 11,17B | 32.768 | MLX 8-bit | Apache-2.0 | Decisiones tipadas, Apple Silicon |
| basal-2.0-max-FP8 | 11,17B | 32.768 | FP8 | Apache-2.0 | Decisiones tipadas, GPU (H100) |
| basal-2.0-max-GGUF (Q8_0 / Q5_K_M) | 11,17B | 32.768 | GGUF | Apache-2.0 | Decisiones tipadas, llama.cpp/Ollama |
| speakleash/Bielik-PL-11B-v3.0-Instruct | ~11B | no disponible en esta ficha | safetensors | Apache-2.0 | LLM generalista pl/en |

La comparación relevante es interna a la familia basal-2.0: los cuatro paquetes comparten modelo y API, y difieren en motor, tamaño y fidelidad frente a bf16. El MLX 8-bit es el de mayor acuerdo (0,9933) y el único con velocidad medida en Mac; el GGUF Q5_K_M es el más ligero (7,5 GB) a costa de menor acuerdo (0,9766). Frente a Bielik-PL-11B-v3.0-Instruct, el modelo base, la diferencia es de propósito: Bielik es generación generalista y basal-2.0-max es un ajuste para decisiones calibradas.

## Limitaciones y advertencias

- Validar sobre documentos propios antes de confiar en el modelo: los conjuntos ocultos y held-out no cubren todos los dominios.
- El conocimiento del mundo en polaco de un modelo de este tamaño es limitado; los hechos relevantes deben incluirse en el estado de entrada.
- La aritmética exacta y los umbrales son un punto débil de las decisiones de una pasada; deben calcularse en código o con `"facts": "auto"`.
- La calibración es cauta en tareas no vistas: ningún umbral del 1% está certificado en los ficheros distribuidos, por lo que `"max_error": 0.01` en una pregunta `act` o `tool` aplaza todas las decisiones. Se recomienda usar 0,05 o certificar umbrales con `basal-calibrate` sobre datos propios.
- Los modos `act` y `multi` con muchas etiquetas son experimentales; el límite es de 255 opciones por pregunta (20 en Ollama).
- La familia 2.0 no incluye cabeza de evidencias.
- Las decisiones con consecuencias serias para personas deben ser revisadas por una persona.
- La calibración bf16 no se transfiere exactamente a puertos cuantizados (un test externo de basal-1.5 en Ollama observó 2,3% de error real con umbral del 1%); tratar los umbrales como aproximados si se usa la calibración bf16.
- El port MLX requiere memoria casi completa de un Mac de 24 GB y falla con otros procesos GPU activos.
- Licencia Apache-2.0: permite uso comercial, pero se debe mantener la atribución a Speakleash/Bielik y al autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-2.0-max-MLX-8bit
- Modelo de referencia bf16: https://huggingface.co/Remek/basal-2.0-max
- Colección basal-2.0: https://huggingface.co/collections/Remek/basal-20-6acd1712a8e443c86cd576fc
- Variante FP8: https://huggingface.co/Remek/basal-2.0-max-FP8
- Variante GGUF: https://huggingface.co/Remek/basal-2.0-max-GGUF
- Modelo base: https://huggingface.co/speakleash/Bielik-PL-11B-v3.0-Instruct
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Documentación de imágenes y audio (basal-omni): https://github.com/rkinas/basal#images-and-audio-basal-omni-experimental
- Sitio web del proyecto: https://basal.si5.pl/
