# ahrazzle/aletheia-weaver-0.5b

## Resumen

Aletheia-Weaver-0.5B es un micro-modelo especializado derivado de Qwen/Qwen2.5-0.5B mediante un ajuste fino con operadores de rango completo (más allá de LoRA) que el autor denomina `privsparse_ortho`. Lo desarrolla el usuario ahrazzle en el marco del proyecto Foundation-0/aletheia (Track S95) y su función es muy concreta: clasificar rutas de operadores entre dominios (símbolos ⧅, ⦺ y ⧇) y detectar el patrón de "contrabando de lenguaje" que el proyecto identifica como Cave-Shadow CS-03. No es un modelo de propósito general, sino un clasificador de un solo uso pensado para desplegarse detrás de un router determinista (Law-3, ⫩).

La arquitectura base es la de Qwen2.5-0.5B: un transformer decoder-only de 494.032.768 parámetros, licencia Apache 2.0 y contexto heredado del modelo original. El checkpoint fusionado incorpora 8.798.208 parámetros entrenables distribuidos en 168 proyecciones lineales, entrenados sobre 220 filas de entrenamiento y evaluados sobre 60 pares no vistos. La relevancia actual es metodológica: el autor documenta con transparencia el compromiso entre especialización extrema y degradación de la capacidad general, un caso de estudio útil sobre los límites del ajuste con rotaciones de Householder.

El dato clave para cualquier evaluador es la advertencia explícita del autor (FM-01-PRIVSPARSE-BASIS-DRIFT): la rotación multiplicativa sin restricciones Q_out·W0·Q_in desplaza los pesos preentrenados fuera de los ejes privilegiados de SiLU y RMSNorm, de modo que la NLL en el dominio general pasa de 2,0399 a 9,8231. El modelo cumple de forma casi perfecta en su tarea objetivo, pero no debe usarse como LM generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste con proyector de espacio nulo P⊥ y pares de reflexión de Householder isométricos |
| Parámetros totales | 494.032.768 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Parámetros entrenables en el ajuste | 8.798.208 (168 proyecciones lineales) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Qwen2.5-0.5B) |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen2.5-0.5B) |
| Formato de pesos | safetensors (model.safetensors, 988.097.824 B; SHA-256 8f264babea3b5f6e424e609b32036237f9fc9ea894bc2950bbbacfa53248eb5c) |
| Tamaño del repositorio | 1,0 GB |
| Pipeline | text-generation |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B y aplica una técnica de ajuste que el autor describe como "más allá de LoRA": en lugar de añadir adaptadores de bajo rango, se entrena un proyector de espacio nulo calibrado por activaciones (P⊥) junto con pares de reflexión de Householder isométricos exactos, aplicados como Q_out(v1, v2)·W0·Q_in(u1, u2). El presupuesto de entrenamiento se mantiene fijo en 8.798.208 parámetros repartidos en 168 proyecciones lineales, lo que permite comparar esta variante con otras dos en un "showdown" 3×3 de igual presupuesto. El resultado es un checkpoint fusionado (merged) que incorpora las rotaciones directamente en los pesos.

Los datos de entrenamiento son un conjunto propio y disjunto: `weaver_train.jsonl` con 220 filas y `weaver_eval.jsonl` con 60 filas, publicados en ahrazzle/aletheia-specialists-s95-datasets. La evaluación se realizó sobre 45 pares de malla no vistos más 15 trampas CS-03 con plantillas no vistas (N = 60), con verificación aritmética exacta sobre números racionales (fractions.Fraction) y procedencia determinista Zone-B (seed = 42). El entrenamiento se ejecutó en una NVIDIA RTX 3080 Laptop GPU de 8 GiB en 235,48 s, con un pico de VRAM de 1.872 MiB. El autor reporta además doble verificación cruzada entre familias (AUDIT-195-GLM53 y AUDIT-195R2-GROK47, barrido de manipulación 1.428/1.428) y 16/16 teoremas en Lean 4.36.0 con Init puro.

## Capacidades

- Clasificación de rutas de operadores entre dominios con las etiquetas ⧅, ⦺ y ⧇, incluyendo el mediador asociado.
- Detección del patrón Cave-Shadow CS-03 ("Language Smuggling") sobre plantillas no vistas.
- Generación de salida JSON estricta conforme al esquema exigido (60/60 en la evaluación).
- Razonamiento de clasificación de un solo paso orientado a decisión, no conversación abierta.
- Capacidad multilingüe: limitada al inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento extendido.
- Capacidad general de lenguaje severamente degradada por diseño (ver limitaciones).

## Casos de uso

- Enrutamiento determinista en pipelines de seguridad: el modelo se coloca detrás del router Law-3 (⫩) para clasificar la ruta de operador de una entrada y decidir qué componente downstream la procesa, aprovechando su 78,33 % de acierto en etiqueta de operador.
- Detección de contrabando de lenguaje en pasarelas de contenido: como clasificador CS-03 de un solo uso, con F1 = 1,0000 sobre plantillas no vistas, para marcar entradas que intentan evadir filtros mediante reformulación lingüística.
- Validación de esquemas en sistemas de registro: su 100 % de cumplimiento de JSON estricto lo hace adecuado como generador de etiquetas estructuradas en un paso dentro de una cadena con validación posterior.
- Componente de auditoría en pipelines de CI: integrado como verificador de clasificación en pruebas automatizadas del proyecto Aletheia, donde la reproducibilidad (seed fija, procedencia Zone-B) es requisito.
- Investigación sobre ajuste eficiente: servir como referencia reproducible del compromiso entre especialización y retención de dominio base, con métricas NLL documentadas y pesos verificables por hash.
- Prototipado en hardware de consumo: con 1.872 MiB de pico de VRAM en entrenamiento y 81,52 ms por llamada en una RTX 3080 Laptop, es viable para experimentos locales de clasificación en un solo paso.
- Docencia y reproducción metodológica: el par de datasets disjuntos y los teoremas Lean permiten replicar el experimento con presupuesto fijo y comparar variantes de ajuste.

## Benchmarks y rendimiento

Evaluación sobre 45 pares de malla no vistos más 15 trampas CS-03 con plantilla no vista (N = 60), verificación exacta sobre racionales:

| Métrica | Qwen2.5-0.5B base | Aletheia-Weaver-0.5B |
|---|---|---|
| Cumplimiento estricto de esquema JSON | 0/60 (0,00 %) | 60/60 (100,00 %) |
| Detección CS-03 con plantilla no vista (TP/FP/FN/TN) | 0/15 (0,0000) | 15/15 (F1 = 1,0000; 15/0/0/45) |
| Acierto de etiqueta de operador | 0/60 (0,00 %) | 47/60 (78,33 %) |
| Clase de ruta (⧅/⦺/⧇) y mediador | 0/60 (0,00 %) | 41/60 (68,33 %) |
| Coincidencia exacta de los 5 campos | 0/60 (0,00 %) | 34/60 (56,67 %) |
| NLL objetivo en held-out | 2,1083 | 0,0299 |
| NLL de retención en dominio base | 2,0399 | 9,8231 (+7,7832) |
| Throughput de inferencia (RTX 3080) | — | 81,52 ms/llamada (582,27 tok/s) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM de inferencia: el checkpoint pesa 988.097.824 B en safetensors; en bfloat16 requiere aproximadamente 1 GB de pesos más overhead de activaciones y KV cache. El pico de VRAM documentado durante entrenamiento en una RTX 3080 Laptop de 8 GiB fue de 1.872 MiB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en precisión nativa; RTX 3080 Laptop (8 GiB) es la referencia medida por el autor.
- Cabe en GPU de consumo: sí, en tarjetas de gama media y alta con 4 GB o más (RTX 3060, 4060, 4090, entre otras).
- Opciones de despliegue: transformers con AutoModelForCausalLM y AutoTokenizer (ejemplo oficial con torch_dtype=bfloat16 y device_map="auto"); los tags incluyen text-generation-inference y endpoints_compatible. No se documentan recetas para llama.cpp, Ollama, vLLM ni TGI en la información disponible.
- Latencia y throughput: 81,52 ms por llamada y 582,27 tok/s medidos en RTX 3080 Laptop.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aletheia-Weaver-0.5B | 494 M (8,8 M entrenables) | No disponible | Clasificador de un solo uso (rutas de operador y CS-03) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B | 494 M | No disponible en esta ficha | LM generalista | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | No disponible en esta ficha | No disponible en esta ficha | LM generalista ajustado a instrucciones | Apache 2.0 | Hugging Face |

La comparación directa con modelos de clasificación especializados no está disponible en la información proporcionada. Frente a su base Qwen2.5-0.5B, el modelo gana en la tarea objetivo (100 % JSON, F1 = 1,0000 en CS-03) y pierde capacidad general (NLL base de 2,0399 a 9,8231).

## Limitaciones y advertencias

- Deriva de base documentada (FM-01-PRIVSPARSE-BASIS-DRIFT): la rotación Q_out·W0·Q_in desplaza los pesos fuera de los ejes privilegiados de SiLU y RMSNorm; la NLL general sube de 2,0399 a 9,8231 (factor F/L = 3,7448). No usar como LM de propósito general.
- Solo inglés: la model card declara únicamente el idioma `en`; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Tarea única: diseñado exclusivamente para clasificación de rutas de operador y detección CS-03; fuera de ese dominio no hay garantías de calidad.
- Riesgo de alucinación: aunque el JSON es estructuralmente válido en el 100 % de los casos evaluados, la coincidencia exacta de los cinco campos es del 56,67 %, por lo que los valores pueden ser incorrectos aunque el formato sea correcto.
- Muestra de evaluación pequeña: N = 60 (45 pares de malla más 15 trampas CS-03); las métricas tienen alta varianza y no deben extrapolarse sin validación propia.
- Licencia Apache 2.0 permite uso comercial, pero el autor restringe explícitamente el despliegue a un clasificador dedicado detrás del router Law-3; el incumplimiento de esa restricción no es una violación legal, pero sí un uso no soportado técnicamente.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente por parte de terceros.
- Proyecto de nicho: las etiquetas y símbolos (⧅, ⦺, ⧇, ⫩) pertenecen a un marco propietario (The Aletheia Method) y requieren conocer su semántica para interpretar las salidas.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahrazzle/aletheia-weaver-0.5b
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/ahrazzle/aletheia-specialists-s95-datasets
- Pull request del Track S95 (Foundation-0/aletheia#95): https://github.com/Foundation-0/aletheia/pull/95
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
