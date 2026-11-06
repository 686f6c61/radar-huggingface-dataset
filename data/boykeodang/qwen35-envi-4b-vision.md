# boykeodang/qwen35-envi-4b-vision

## Resumen

Qwen3.5-EnVi-4B es una derivación del modelo Qwen/Qwen3.5-4B de Alibaba Cloud (Qwen Team) en la que se ha practicado una "cirugía de vocabulario": se han eliminado todos los tokens que no sirven al inglés ni al vietnamita, reduciendo el vocabulario de 248.320 a 100.227 identificadores. El resultado es un modelo de aproximadamente 4.000 millones de parámetros con 378,5 millones de parámetros de embedding eliminados (0,757 GB en BF16), orientado a inferencia local dentro de un presupuesto de 4 GB de VRAM. Lo publica el desarrollador independiente boykeodang (Hoàng Minh Tâm) bajo licencia Apache 2.0.

La motivación declarada es doble: por un lado, obtener un modelo compacto para clasificación de comportamiento, tool calling y orquestación de automatizaciones; por otro, garantizar por construcción que la salida no contenga caracteres chinos, ya que el 97 % de los tokens de clase Han han sido eliminados. La variante que nos ocupa, `qwen35-envi-4b-vision`, conserva la torre de visión del modelo original con el vocabulario podado.

Es relevante ahora porque demuestra una técnica de compresión poco habitual —poda de vocabulario con verificación byte a byte de las filas de embedding y entrenamiento de recuperación posterior— aplicada a un modelo multimodal pequeño, con métricas de perplejidad publicadas que cuantifican el coste de la poda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) con torre de visión; rama MTP eliminada |
| Parametros totales | Aproximadamente 4.000 millones (base Qwen3.5-4B menos 378,5 M de embedding) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M documentado; safetensors en BF16 |
| Idiomas soportados | Vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (texto y vision + mmproj) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de la familia Qwen3.5, y le aplica una poda de vocabulario basada en uso real: se construyó el conjunto de tokens conservados a partir de 40,19 millones de tokens de corpus públicos (FineWeb-2 `vie_Latn` y FineWeb `sample-10BT`), manteniendo todo token que apareciera al menos una vez, todos los caracteres Latin Extended y clases completas de espacios en blanco, puntuación y dígitos. El resultado son 100.227 identificadores con una pérdida de cobertura del 0 % sobre los corpus de análisis. La matriz de embedding se recortó mediante un mapa explícito de identificadores, el tokenizador se reconstruyó para coincidir (vocab del config == vocab del tokenizador == 100.227) y se filtraron las fusiones BPE que referenciaban tokens eliminados. La verificación independiente confirma que las filas de embedding coinciden byte a byte con el original en los identificadores muestreados y que los round-trips del tokenizador son sin pérdida.

Tras la poda se aplicó un entrenamiento de recuperación de 2 millones de tokens con QLoRA (r=16, todas las proyecciones lineales, LR 2e-5) sobre texto web de FineWeb-2 vietnamita y FineWeb inglés, fusionado en el modelo base podado. El entrenamiento se detuvo en la dosis en la que una exposición adicional degradaba la perplejidad, verificado mediante evaluaciones A/B con compuertas. La rama de predicción multi-token (MTP) fue eliminada, por lo que debe usarse decodificación estándar. La variante de visión conserva la torre visual intacta, pero el modelo de lenguaje podado no ha sido revalidado en tareas de visión.

## Capacidades

- Generación de texto en inglés y vietnamita, con razonamiento correcto según las pruebas del autor.
- Clasificación de comportamiento (behavior classification), caso de uso declarado explícitamente.
- Tool calling y function calling, orientado a orquestación de automatizaciones.
- Razonamiento multi-paso con bloque de pensamiento (thinking), aunque el autor advierte que puede ser verboso.
- Capacidades de visión heredadas de la torre del modelo base, sin revalidar tras la poda.
- Supresión estructural de salida en chino: 0 puntos de código CJK en todas las pruebas de generación.
- Multilingüismo limitado a vietnamita e inglés; el resto de idiomas queda fuera del vocabulario conservado.

## Casos de uso

- Clasificación de comportamiento en local: el modelo cabe en 4 GB de VRAM en Q4_K_M (2,39 GB de pesos), lo que permite desplegarlo en GPUs de gama baja para etiquetar intenciones o categorías de comportamiento en tiempo real sin depender de la nube.
- Orquestación de automatizaciones con tool calling: su soporte de function calling y su tamaño reducido lo hacen adecuado para enrutar llamadas a herramientas en flujos de trabajo internos donde la latencia y el coste por token importan.
- Asistentes para vietnamita e inglés: al conservar íntegramente el vocabulario de ambos idiomas y haber sido entrenado en recuperación con FineWeb-2 vietnamita, es utilizable en atención al cliente o generación de contenido en esos dos idiomas.
- Despliegue en entornos con restricción de GPU: con GGUF Q4_K_M de 2,39 GB (frente a 3,01 GB del modelo original, un 20,7 % menos) puede ejecutarse con llama.cpp en GPUs consumer de 4 GB, útil para prototipos y demos en hardware modesto.
- Prevención de deriva lingüística en producción: en aplicaciones donde la aparición de caracteres chinos en la salida es un fallo crítico, la eliminación del 97 % de tokens Han reduce el riesgo por construcción.
- Experimentación con visión en hardware limitado: la variante con torre visual (2,39 GB Q4_K_M + 0,68 GB de mmproj) permite probar pipelines multimodales en GPUs pequeñas, asumiendo que la calidad visual no está validada.
- Investigación sobre poda de vocabulario: el repositorio de métodos y scripts del autor sirve como referencia reproducible para estudiar el equilibrio entre compresión y perplejidad.

## Benchmarks y rendimiento

El autor publica mediciones de perplejidad con `llama-perplexity` sobre textos de evaluación idénticos de 64 KB en cuantización Q4_K_M, comparando el modelo original con la versión EnVi tras el entrenamiento de recuperación:

| Metrica | Original | EnVi | Variacion |
|---|---:|---:|---:|
| Perplejidad vietnamita | 10,08 | 10,15 | +0,71 % |
| Perplejidad ingles | 11,81 | 12,23 | +3,54 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4 GB en GGUF Q4_K_M para la variante de texto (2,39 GB de pesos); la variante de visión añade 0,68 GB de mmproj.
- GPU recomendadas: el autor apunta a un presupuesto de 4 GB de VRAM; no se especifican modelos concretos de GPU en la informacion proporcionada.
- GPU consumer: sí cabe en GPUs consumer de 4 GB o más en cuantización Q4_K_M; en BF16 el repositorio ocupa 8,3 GB, por lo que requiere GPUs de mayor capacidad.
- Opciones de despliegue: llama.cpp con una build reciente que soporte `qwen35`, invocado como `llama-server -m qwen35-envi-text-q4_k_m.gguf -c 4096 -ngl 99`. No se documentan otras opciones (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-EnVi-4B (vision) | ~4.000 M (menos 378,5 M de embedding) | No disponible | vi, en | Apache 2.0 | safetensors, GGUF | Vocabulario podado a 100.227 tokens; sin salida CJK |
| Qwen/Qwen3.5-4B (base) | ~4.000 M | No disponible | Multilingue | Apache 2.0 | safetensors, GGUF | Vocabulario de 248.320 tokens; referencia de perplejidad 10,08 (vi) y 11,81 (en) |
| Otros modelos de ~4B | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El razonamiento puede ser verboso: las peticiones de acción o de JSON pueden consumir parte del presupuesto de tokens dentro del bloque de pensamiento.
- La rama MTP fue eliminada; no es posible usar decodificación especulativa multi-token y debe emplearse decodificación estándar.
- Persisten 1.525 tokens de clase Han porque aparecen en texto vietnamita genuino (nombres propios entrecomillados); en la práctica casi nunca se generan, pero el vocabulario no es 100 % libre de Han.
- La variante de visión conserva la torre visual pero el modelo de lenguaje podado no ha sido revalidado en tareas de visión: la calidad multimodal es incierta.
- El vocabulario está restringido a inglés y vietnamita; cualquier otro idioma, incluido el español, queda fuera del conjunto conservado y no debe esperarse un rendimiento fiable.
- La perplejidad en inglés empeora un 3,54 % respecto al original, mayor degradación que en vietnamita (+0,71 %).
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la informacion proporcionada.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y procede de un desarrollador independiente: no hay validación externa de la comunidad.
- Licencia Apache 2.0, que permite uso comercial, pero al derivar de Qwen3.5-4B conviene conservar los avisos de atribución correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/boykeodang/qwen35-envi-4b-vision
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de método, scripts y resultados: https://github.com/goddie9x/qwen35-envi-surgery
- Perfil del autor en GitHub: https://github.com/goddie9x
- Sitio web del autor: https://hmt9x.dev
