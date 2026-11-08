# mbarbosa1/zeno-divergent-v106

## Resumen

Zeno v1.06 es un modelo de investigación publicado por el usuario mbarbosa1 en Hugging Face, orientado a forecasting (predicción de series temporales) en 13 dominios distintos: criptomonedas, economía, energía, mercados, salud y meteorología, entre otros. Se trata de una red neuronal de pequeño tamaño —15.927.753 parámetros en el fichero publicado— entrenada de forma conjunta sobre todos los campos, y distribuida como un ensemble de 9 semillas (3 tamaños × 3 semillas, aunque el fichero contiene únicamente el tamaño M multiplicado por 3 semillas).

El modelo se presenta explícitamente como una "research release" y no como el modelo servido en producción. Según la model card, el modelo por defecto en zenodivergent.dev sigue siendo Zeno v1.05 hasta que se superen las comprobaciones con peticiones nuevas. La relevancia de esta ficha es doble: por un lado documenta un experimento de forecasting multi-dominio con una metodología de validación poco habitual (corrección por comparaciones múltiples, verificación en semanas posteriores); por otro, es un ejemplo instructivo de cómo una model card puede desmontar sus propias cifras de mejora al separar el efecto del modelo del efecto de un cambio en la regla de evaluación.

La información disponible es limitada: no hay pipeline declarado, no se especifican idiomas soportados, no hay benchmarks estándar (MMLU, HumanEval, GSM8K) y no se detalla la arquitectura interna más allá de que es una red neuronal entrenada sobre 13 campos. Todo lo que sigue se ciñe estrictamente a los datos publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal; no se especifica transformer, MoE ni SSM) |
| Parámetros totales | 15.927.753 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La model card indica que se trata de "one network trained jointly on 13 fields" (una única red entrenada conjuntamente sobre 13 campos), con tamaño M y un ensemble de 9 semillas. El fichero publicado contiene la red de tamaño M multiplicada por 3 semillas, con claves prefijadas `seedN.`. No se detalla el tipo de arquitectura (transformer, MoE, SSM o híbrida), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO. Tampoco se especifica la función de pérdida ni el esquema de entrenamiento por campo.

El aspecto técnico más destacable es la metodología de selección y validación. Antes del entrenamiento se sellaron unas reglas que seleccionaban el tamaño del modelo según su puntuación en semanas de selección reservadas; M obtuvo 0.601, L 0.605 y S 0.606 (menor es mejor). Los pesos se recuperaron de ajustes completados sin reentrenamiento, y la card afirma paridad exacta en proceso nuevo con tolerancia 1e-6. Se incluye además una huella del protocolo (`5efecd314ec23acbdcebfa58927e53ebc853fb4cbaa33007cabcc93f0e2fdac1`) y el sha256 de los pesos (`c6955142c10a769bdec6f6604ef7c86bbf8b86e797ab020cf3afd0ea06e26951`), lo que permite verificar la reproducibilidad del artefacto.

## Capacidades

- Forecasting multi-dominio: predicción sobre 13 campos (cripto, economía BCE, economía PhilFed, energía, forecastbench, salud COVID, salud gripe, salud VRS, mercados, mercados cross-venue, mar, ensemble meteorológico e histórico meteorológico).
- Ensemble por semillas: el fichero empaqueta 3 semillas del tamaño M con claves `seedN.`, lo que permite agregar predicciones y reducir varianza.
- Reproducibilidad verificable: la card declara paridad exacta en proceso nuevo (1e-6) para cada respuesta de examen.
- Evaluación con corrección por comparaciones múltiples: las ganancias solo se reportan si sobreviven a la corrección y se mantienen en semanas posteriores.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Predicción de precios de criptomonedas: el campo `crypto` es el único con una ganancia real medida frente a v1.05 (+7.9% de reducción de error, intervalo del 95% de +4.9 a +10.4 sobre 19.202 casos). Adecuado para experimentación en señales de corto plazo, no para producción sin validación propia.
- Predicción meteorológica histórica: el campo `weather-history` muestra una comparación frente a v1.05 de -1.0% (intervalo -1.7 a -0.4 sobre 2.464 casos), es decir, ligeramente peor que el modelo servido; útil como referencia de ensemble en investigación.
- Investigación en economía del BCE: el campo `economy-ecb` reporta -0.2% frente a v1.05 (intervalo -1.0 a +0.8 sobre 82 casos), sin diferencia significativa; sirve para estudiar la varianza de modelos pequeños en series macroeconómicas.
- Estudio de metodología de evaluación: el modelo y su card son un caso práctico para analizar cómo una regla de evaluación más estricta puede inflar aparentemente una mejora (de +13.4% a +58.5% en cripto) sin que el modelo cambie.
- Reproducción de experimentos de forecasting: gracias al sha256 y a la huella del protocolo, se puede verificar la reproducibilidad de los resultados en un entorno controlado.
- Benchmark de ensembles pequeños: con 15,9M de parámetros y 3 semillas empaquetadas, es un candidato para comparar estrategias de agregación de semillas en series temporales.
- Docencia y divulgación: ejemplo de model card honesta que separa el efecto del modelo del efecto de la métrica, útil en cursos de evaluación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son comparativas internas del autor frente a Zeno v1.05 y frente a un rival de árbol ("tree rival") en la misma regla de evaluación:

| Campo | v1.06 vs v1.05 (menor error) | Intervalo 95% | Casos |
|---|---|---|---|
| crypto | +7.9% | +4.9 a +10.4 | 19.202 |
| weather-history | -1.0% | -1.7 a -0.4 | 2.464 |
| economy-ecb | -0.2% | -1.0 a +0.8 | 82 |

Ganancias de examen frente al rival más fuerte (según la card, con la salvedad de que la mayor parte del salto en cripto proviene de la regla de evaluación más estricta de v1.06, no del modelo):

| Campo | Ganancia vs rival más fuerte | Veredicto corregido | Semanas posteriores |
|---|---|---|---|
| crypto | +58.5% | gain | held |
| economy-ecb | +24.4% | gain | held |
| weather-history | +34.3% | gain | held |
| economy-philfed | no servido | sin diferencia medible | no se mantuvo |
| energy | no servido | sin diferencia medible | no se mantuvo |
| forecastbench | no servido | sin diferencia medible | no se mantuvo |
| health-covid | no servido | sin diferencia medible | no se mantuvo |
| health-flu | no servido | sin diferencia medible | no se mantuvo |
| health-rsv | no servido | sin diferencia medible | no se mantuvo |
| markets | no servido | sin diferencia medible | no se mantuvo |
| markets-cross-venue | no servido | sin diferencia medible | no se mantuvo |
| sea | no servido | gain | no se mantuvo |
| weather-ensemble | no servido | sin diferencia medible | no se mantuvo |

## Requisitos de hardware

- VRAM estimada para inferencia: con 15,9M de parámetros en safetensors, el peso en fp32 ronda los 64 MB y en fp16 unos 32 MB; el repositorio completo ocupa 0,1 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU con al menos 1 GB de VRAM libre es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100). La elección dependerá del throughput agregado que se necesite al evaluar 3 semillas.
- Cabe en consumer GPU: sí, en todas las GPU consumer modernas e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no se documentan. Al no ser un modelo de lenguaje con pipeline declarado, no hay integración conocida con vLLM, llama.cpp, Ollama o TGI. La carga se haría directamente con `safetensors` y el código del autor (no publicado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zeno v1.06 (este) | 15,9M | no disponible | Ganancias solo en crypto (+7.9% vs v1.05), weather-history (-1.0%) y economy-ecb (-0.2%) | MIT | Hugging Face |
| Zeno v1.05 | 89,9M (3 modelos empaquetados) | no disponible | Modelo servido en zenodivergent.dev; +55.0% vs tree rival en crypto bajo la misma regla | no disponible en la información | Hugging Face / zenodivergent.dev |
| Zeno v1 (v0.15.0) | no disponible | no disponible | Ámbito "reference-lane"; ver nota de release | no disponible en la información | Hugging Face (`mbarbosa1/zeno-divergent-v1`) |

No se dispone de información sobre modelos de forecasting comparables de otros autores en la búsqueda realizada.

## Limitaciones y advertencias

- No es el modelo servido: la propia card indica que Zeno v1.05 sigue siendo la respuesta por defecto en zenodivergent.dev hasta que se superen las comprobaciones con peticiones nuevas.
- Cobertura efectiva muy limitada: de 13 campos, solo 3 muestran ganancia o diferencia medida frente a v1.05, y en dos de ellos la diferencia es negativa o no significativa. Diez campos figuran como "not served" o "no measurable difference".
- Riesgo de interpretación errónea de las métricas: la ganancia de +58.5% en crypto frente al rival más fuerte se debe mayoritariamente a un cambio en la regla de evaluación, no al modelo; la ganancia real frente a v1.05 es +7.9%. Cualquier uso de las cifras de la card sin leer esa salvedad induce a error.
- Volumen de evidencia desigual: el campo economy-ecb se evalúa con solo 82 casos, insuficiente para conclusiones robustas.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no aplica en el sentido habitual (no es un modelo generativo de texto según la información disponible), pero sí existe riesgo de sobreajuste a las series históricas de cada campo.
- Limitaciones de idioma y contexto: no se especifican idiomas soportados ni longitud de contexto.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación con atribución; aun así, al ser una "research release", el autor no ofrece garantías de idoneidad para producción.
- Caveat de producción: el modelo se recuperó de ajustes completados sin reentrenamiento; conviene verificar la paridad en proceso nuevo (1e-6) en el entorno propio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mbarbosa1/zeno-divergent-v106
- Perfil del autor: https://huggingface.co/mbarbosa1/mbarbosa1
- Modelo Zeno v1 (v0.15.0): https://huggingface.co/mbarbosa1/zeno-divergent-v1
- Repositorio de ejecuciones (referenciado en la card): `mbarbosa1/zeno-divergent-runs`
- Comparativa de la ejecución citada: `v106-compare/matched-20261108T021457Z` (referencia interna de la card)
- Sitio del servicio: zenodivergent.dev (referenciado en la card)
