# Harsha001/Ripple-65B-Preview-ROCmFPX

## Resumen

Ripple-65B-Preview-ROCmFPX es una cuantización en formato GGUF del modelo denso Ripple-65B-Preview, desarrollado originalmente por ricursiveAI. La publica el usuario Harsha001 como parte del ecosistema ROCmFPX, un fork de llama.cpp orientado a la ejecución eficiente de modelos sobre GPUs AMD, en particular el sistema Strix Halo (APUs de AMD con memoria unificada). El modelo base es un transformer denso de 65.000 millones de parámetros, según la información disponible.

El problema que resuelve esta ficha es la distribución de pesos ya cuantizados para poder ejecutar un modelo de 65B en hardware AMD sin depender del stack CUDA. La cuantización Q8_0 ocupa 66,8 GB, lo que la sitúa en el rango de memoria de los sistemas Strix Halo de gama alta con memoria unificada, y la Q6_K baja a 53,6 GB.

La relevancia es doble: por un lado, demuestra el interés por portar modelos grandes al ecosistema ROCm; por otro, el propio autor advierte de que la arquitectura `ricursive` del modelo base todavía no está soportada en el llama.cpp upstream y requiere un build con el PR #31692 y soporte ROCmFPX. El repositorio se encuentra en estado de subida en curso y sin métricas de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura propietaria `ricursive`, no soportada aún en llama.cpp upstream) |
| Parametros totales | 65B (según nombre del modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (66,8 GB) y Q6_K (53,6 GB) en formato ROCmFPX GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (variante ROCmFPX) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 65B parámetros según la model card, con una arquitectura denominada `ricursive` cuyo detalle interno no se especifica en la información disponible. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del modelo original más allá de la denominación de su arquitectura.

La contribución de este repositorio es exclusivamente de cuantización: se generan pesos GGUF con el fork ROCmFPX de llama.cpp, pensados para GPUs AMD. El autor reporta una métrica de calidad para la cuantización Q8_0: una divergencia KL media (KLD) de 0,0027 frente a un Q8_0 estándar de los pesos BF16 originales, medida con `llama-perplexity` sobre 40 fragmentos de 512 tokens de wikitext-2, con un 98,0 % de coincidencia en el token superior. La Q6_K aparece como pendiente de medición. El fichero BF16 original no cabía en la máquina de pruebas del autor, por lo que la referencia es un Q8_0 estándar, que el autor considera muy próximo a BF16.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`.
- Razonamiento y código: no disponible; la model card no detalla capacidades específicas del modelo base.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas en los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue de un modelo de 65B en hardware AMD Strix Halo: la cuantización Q6_K (53,6 GB) permite cargar el modelo en sistemas con memoria unificada amplia, usando el fork ROCmFPX de llama.cpp en lugar del stack CUDA.
- Evaluación de cuantizaciones en ROCm: el repositorio incluye métricas de KLD y coincidencia de token superior, útiles para comparar la pérdida de calidad de Q8_0 frente a Q6_K en un pipeline de validación propio.
- Experimentación con arquitecturas no soportadas en upstream: sirve como banco de pruebas para el PR #31692 de llama.cpp, que añade soporte para la arquitectura `ricursive`.
- Generación de texto offline en estaciones de trabajo AMD: al ser GGUF, puede ejecutarse con llama.cpp compilado para ROCm sin dependencias de Python en tiempo de inferencia.
- Investigación sobre cuantización de modelos grandes: los datos de KLD publicados permiten estudiar el impacto de Q8_0 y Q6_K en un modelo denso de 65B.
- Pruebas de integración en pipelines de inferencia locales: útil para validar el rendimiento de llama.cpp con backend ROCm antes de adoptar el modelo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de calidad es la métrica de cuantización:

| Metrica | Q8_0 ROCmFPX | Q6_K ROCmFPX |
|---|---|---|
| Tamano del fichero | 66,8 GB | 53,6 GB |
| KLD media vs Q8_0 estandar | 0,0027 | pendiente |
| Coincidencia token superior | 98,0 % | pendiente |

Medición con `llama-perplexity` sobre 40 fragmentos de 512 tokens de wikitext-2.

## Requisitos de hardware

- VRAM/memoria estimada: 66,8 GB para Q8_0 y 53,6 GB para Q6_K, más overhead de contexto y del runtime.
- GPU recomendadas: sistemas AMD Strix Halo con memoria unificada; el autor no detalla modelos concretos ni capacidad mínima.
- GPU de consumo: no disponible; un modelo de 65B en Q6_K no cabe en GPUs de consumo con 24 GB (RTX 4090) ni en configuraciones habituales de 48 GB sin offloading a RAM.
- Opciones de despliegue: llama.cpp con el fork ROCmFPX y el PR #31692 (soporte de la arquitectura `ricursive`). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio está en estado de subida en curso: los ficheros se añaden a medida que terminan y la model card completa aún no está publicada.
- La arquitectura `ricursive` no está en llama.cpp upstream; estos ficheros requieren un build con el PR #31692 y soporte ROCmFPX, cuyo soporte para Ripple está anunciado pero no confirmado como disponible.
- Sin métricas de uso: 0 descargas y 0 likes en el momento de la consulta, lo que impide validar la reproducibilidad por terceros.
- La métrica de calidad se mide contra un Q8_0 estándar, no contra los pesos BF16 originales, porque el fichero BF16 no cabía en la máquina de pruebas.
- La Q6_K no tiene métricas de KLD ni de coincidencia de token publicadas.
- No se documentan sesgos, riesgo de alucinación, limitaciones de contexto o idioma del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar la licencia del modelo base original y el cumplimiento de las condiciones del fork ROCmFPX.
- El tamaño de 65B implica requisitos de memoria muy elevados; no es apto para GPUs de consumo convencionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Ripple-65B-Preview-ROCmFPX
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Fork ROCmFPX de llama.cpp: https://github.com/HarshaVardhan3002/ROCmFPX
- PR de llama.cpp con soporte para Ripple: https://github.com/ggml-org/llama.cpp/pull/31692
