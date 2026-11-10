# lmxxf/Qwen3.8-27B-jacobian-lens

## Resumen

`lmxxf/Qwen3.8-27B-jacobian-lens` no es un modelo de lenguaje generativo, sino un artefacto de interpretabilidad mecánica: una lente jacobiana (J-lens) precalculada y de cobertura completa para el modelo base `Qwen/Qwen3.8-27B`. Se trata de un diccionario de matrices que permite proyectar el flujo residual de cualquier capa intermedia al espacio de lectura de la capa final, de modo que sea posible inspeccionar qué representaciones internas están "listas para emitirse" en cada punto de la red. Lo publica el usuario `lmxxf` bajo licencia Apache 2.0.

Su rasgo diferencial es que se ha ajustado sobre un corpus estrictamente bilingüe 1:1 (50 pasajes en inglés de WikiText-103 y 50 pasajes en chino de Wikipedia, N=100), frente a las lentes precalculadas habituales que solo usan inglés. Esto lo hace relevante para investigación en interpretabilidad de modelos multilingües y para experimentos de manipulación causal de representaciones (lens-coordinate swap) en un modelo híbrido con atención lineal.

El checkpoint ocupa 3,30 GB (3,08 GiB) y contiene 63 matrices completas de 5120 × 5120 en float16 para las capas 0 a 62, apuntando a la salida de la capa 63 previa a `FinalRMSNorm` y `lm_head`. No incluye pesos del modelo base: es un complemento que debe cargarse junto a `Qwen/Qwen3.8-27B`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente jacobiana (J-lens) sobre transformer híbrido; el modelo base combina 48 capas Gated DeltaNet (atención lineal) y 16 capas de atención completa |
| Parametros totales | No disponible (el artefacto no es un modelo; el base se denomina Qwen3.8-27B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible para el artefacto; el ajuste usa `seq_len = 128` por pasaje |
| Tipos de cuantizacion | No aplica; matrices almacenadas en float16, acumuladas en float32 |
| Idiomas soportados | en, zh (corpus de ajuste bilingüe 1:1) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch, `Qwen3.8-27B_jacobian_lens.pt`, 3,30 GB / 3,08 GiB) |

## Arquitectura y entrenamiento

El artefacto contiene una lente jacobiana de suma futura, definida como J_ℓ[i,j] = E_p Σ_{q≥p} ∂h_63[q,i] / ∂h_ℓ[p,j], estimada con el estimador oficial del repositorio `anthropics/jacobian-lens` (commit `581d3986`). Se almacenan 63 matrices completas de 5120 × 5120 (capas fuente 0 a 62) en float16, con acumulación en float32, referidas a la capa objetivo 63 (salida del último bloque transformer antes de `FinalRMSNorm` y `lm_head`).

El ajuste se realizó sobre 100 pasajes (N=100), 50 en inglés de WikiText-103 y 50 en chino de Wikipedia, con `seq_len = 128`, `skip_first = 16` y 111 posiciones válidas por pasaje, lo que suma 256.000 pasadas backward de red completa distribuidas en dos nodos NVIDIA DGX Spark GB10. El modelo base sobre el que se ajusta tiene 64 capas y `d_model = 5120`, con una arquitectura híbrida de 48 capas Gated DeltaNet de atención lineal y 16 capas de atención completa.

## Capacidades

- Proyección del flujo residual de cualquier capa 0 a 62 al espacio de lectura de la capa final mediante `h_proj = h_ℓ @ J_ℓ.T` y posterior `lm_head(final_rms_norm(h_proj))`.
- Lectura anticipada de predicciones (logit lens mejorado) con recalibración jacobiana de las representaciones intermedias.
- Análisis bilingüe inglés-chino: permite comparar cómo se alinean los tokens en ambos idiomas en el espacio de la lente.
- Intervención causal mediante intercambio de coordenadas de la lente (lens-coordinate swap), sustituyendo un concepto por otro en el diccionario y observando el efecto en la salida greedy.
- Soporte de evaluación sobre los benchmarks oficiales `Multihop` y `Multilingual` adaptados a objetivos de un solo token en el vocabulario de Qwen (248.320 tokens).
- No realiza generación de texto, tool calling ni razonamiento por sí mismo: es una herramienta de análisis que requiere el modelo base cargado.

## Casos de uso

- Investigación en interpretabilidad mecánica: inspeccionar en qué capa emerge un concepto (por ejemplo, la moneda de un país) y con qué rank aparece en la lente frente al logit lens vainilla, usando las matrices J_ℓ para cada capa.
- Auditoría de modelos multilingües: comparar la representación de un mismo hecho en inglés y en chino (por ejemplo, `意大利` frente a `Italy`) y detectar si el modelo alinea ambos idiomas en capas intermedias o solo en la salida.
- Experimentos de edición de conocimiento: aplicar el intercambio de coordenadas L34–L44 para redirigir una respuesta (de `Italy` a `Japan`, y de `the euro` a `the yen`) y validar si la intervención es causal y no solo correlacional.
- Análisis de seguridad y alineamiento: localizar representaciones latentes de conceptos sensibles antes de que se materialicen en la salida, útil para estudiar mecanismos de rechazo o de fuga de información.
- Depuración de arquitecturas híbridas: al combinar capas de atención lineal (Gated DeltaNet) y de atención completa, la lente permite examinar cómo fluye la información entre ambos tipos de capa y dónde se consolida.
- Docencia y divulgación: ilustrar de forma cuantitativa cómo un transformer "decide" en capas intermedias, con métricas de pass@1 y pass@5 sobre Multihop y Multilingual.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los benchmarks oficiales adaptados a objetivos de un solo token:

| Etapa de la lente | Multihop pass@1 | Multihop pass@5 | Multilingual pass@1 | Multilingual pass@5 |
|:---|:---:|:---:|:---:|:---:|
| Vainilla (logit lens, J=I) | 33,93% | 53,97% | 21,26% | 38,86% |
| N=1 (1 pasaje EN) | 33,93% | 56,35% | 32,09% | 42,68% |
| N=10 (5 EN + 5 ZH) | 33,33% | 57,54% | 26,01% | 39,64% |
| N=20 (10 EN + 10 ZH) | 32,14% | 58,73% | 26,01% | 40,34% |
| N=50 (25 EN + 25 ZH) | 35,12% | 57,54% | 23,91% | 39,64% |
| N=100 (50 EN + 50 ZH) | 36,31% | 56,35% | 25,08% | 40,58% |

Ejemplo cualitativo representativo: en el prompt chino `常识：形状像一只靴子的欧洲国家使用的法定货币是`, el logit lens vainilla sitúa `意大利` en el rank 131 y `Italy` en el 104 en la capa 41, mientras que la J-lens bilingüe N=100 coloca en el top-5 `['意大利', ' Italy', ' Italian', 'Italy', ' Italia']`, con `意大利` en rank 1 y ` Italy` en rank 2.

## Requisitos de hardware

- Almacenamiento: 3,30 GB para el checkpoint `.pt`; se recomienda cargarlo en CPU con `torch.load(..., map_location="cpu")` y mover a GPU solo las matrices necesarias.
- VRAM para el artefacto: cada matriz J_ℓ en float16 ocupa aproximadamente 50 MB (5120 × 5120 × 2 bytes); convertir una a float32 para la proyección requiere unos 100 MB. Cabe holgadamente en cualquier GPU consumer.
- VRAM para el modelo base: no disponible en la información proporcionada; debe consultarse la ficha de `Qwen/Qwen3.8-27B`.
- GPU recomendadas: el ajuste se realizó en dos nodos NVIDIA DGX Spark GB10; para inferencia del artefacto basta una GPU consumer, pero la proyección completa requiere cargar el modelo base en memoria.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo; se usa con la librería `jacobian_lens` o directamente con `torch.load`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Modelo base | Cobertura de capas | Corpus de ajuste | Idiomas | Licencia |
|:---|:---|:---|:---|:---|:---|
| `lmxxf/Qwen3.8-27B-jacobian-lens` (este) | Qwen/Qwen3.8-27B | 0–62 (63 matrices) | 50 EN + 50 ZH (N=100) | en, zh | Apache 2.0 |
| Lentes precalculadas solo en inglés (genéricas del ecosistema `anthropics/jacobian-lens`) | Variable | Variable | Corpus EN | en | Según autor |
| Logit lens vainilla (J=I) | Cualquiera | Todas | No requiere ajuste | Multilingüe | No aplica |

No se dispone de datos comparativos de rendimiento frente a otras lentes precalculadas para Qwen3.8-27B en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; requiere el modelo base `Qwen/Qwen3.8-27B` cargado para producir lecturas.
- El corpus de ajuste es reducido (N=100 pasajes, `seq_len = 128`), lo que puede limitar la generalización a contextos largos o dominios especializados.
- Los resultados de benchmarks muestran una mejora modesta y no monótona con N: Multihop pass@1 sube de 33,93% a 36,31% con N=100, pero Multilingual pass@1 cae de 32,09% (N=1) a 25,08% (N=100), lo que sugiere sensibilidad al tamaño y composición del corpus.
- Solo cubre inglés y chino; su comportamiento en otros idiomas no está validado.
- El artefacto se publica con 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta aún con validación comunitaria independiente.
- La licencia Apache 2.0 del artefacto no exime de verificar la licencia del modelo base `Qwen/Qwen3.8-27B` para uso comercial.
- El uso de intervenciones causales (lens-coordinate swap) puede producir salidas alteradas de forma no controlada; no debe emplearse en producción sin validación exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/lmxxf/Qwen3.8-27B-jacobian-lens
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del estimador: https://github.com/anthropics/jacobian-lens (commit `581d3986`)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
