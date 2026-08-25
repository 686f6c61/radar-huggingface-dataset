# mvid/Huihui-Qwen3.8-27B-abliterated-MTPLX-Q8

## Resumen

El modelo `mvid/Huihui-Qwen3.8-27B-abliterated-MTPLX-Q8` es una cuantización INT8 del modelo `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez es una versión "abliterada" del Qwen3.8-27B original de Qwen. La abliteración es una técnica de edición directa de pesos que elimina la dirección de rechazo en el espacio de activaciones, dejando el modelo sin alineación de seguridad. Este repo concreto, creado por mvid, está optimizado para Apple Silicon mediante la librería MTPLX, que conserva la cabeza de predicción multi-token (MTP) del modelo original para permitir decodificación especulativa autónoma, sin necesidad de un modelo draft separado.

La relevancia de este modelo radica en su rendimiento de inferencia: en un Apple M5 Max alcanza 54.01 tokens por segundo con profundidad de draft 3, frente a 17.06 tokens por segundo en modo autorregresivo, un factor de aceleración de 3,17x. Esta mejora se logra sin sacrificar calidad aparente, aunque el autor advierte explícitamente que no se han ejecutado benchmarks de capacidad o precisión sobre esta versión. El modelo es de tipo transformer con torre de visión, aunque el pipeline declarado es text-generation. Su licencia es Apache 2.0, lo que permite uso comercial, pero su naturaleza abliterada lo hace inadecuado para despliegues públicos sin moderación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con cabeza MTP y torre de vision |
| Parametros totales | 8.027.131.120 (segun safetensors; el nombre del modelo indica 27B, posible discrepancia en el repo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (cuerpo y sidecar MTP) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX/MTPLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso con atención estándar y una torre de visión integrada. Sobre este, `huihui-ai` aplicó abliteración usando la herramienta `remove-refusals-with-transformers`, que identifica la dirección de rechazo en el espacio de activaciones y la proyecta fuera de los pesos. Solo se ablaron las capas 18 a 51 de las 64 totales; la cabeza MTP y la torre de visión quedaron intactas. Este proceso no implica entrenamiento ni uso de datos.

La versión MTPLX de mvid cuantiza el cuerpo del modelo a INT8 con grupo de 64 y modo afín, manteniendo la cabeza MTP en BF16 inicialmente, para luego cuantizarla también a INT8 como paso estructural separado. El sidecar MTP resultante es byte-idéntico al de la build oficial de referencia `Qwen3.8-27B-MTPLX-Optimized-Quality`, lo que verifica que la abliteración no alteró la cabeza. No se usó calibración ni entrenamiento en ningún paso.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo Qwen3.8-27B original.
- Razonamiento y resolucion de problemas, incluyendo tareas de codigo y matematicas (capacidades del modelo base, no verificadas en esta version).
- Soporte de vision (torre de vision presente, aunque el pipeline declarado es text-generation).
- Decodificacion especulativa autónoma mediante la cabeza MTP, que acelera la inferencia sin modelo draft externo.
- Capacidad multilingue presumiblemente similar a Qwen3.8-27B, aunque no se especifican idiomas en la ficha.
- Sin alineacion de seguridad: el modelo no rechaza peticiones dañinas, ilegales o peligrosas.

## Casos de uso

- Investigacion sobre alineacion y seguridad de modelos: permite estudiar el comportamiento de un modelo sin capas de rechazo, util para analizar mecanismos de seguridad y desarrollar contramedidas.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o contenido adulto donde el modelo base rechazaria ciertas solicitudes.
- Desarrollo de sistemas de moderacion de contenido: al generar respuestas sin filtro, puede usarse como generador de ejemplos adversarios para entrenar clasificadores de contenido.
- Pruebas de robustez en entornos controlados: evaluar como responde un modelo abliterado ante prompts malintencionados, siempre en laboratorio y con supervisión.
- Inferencia de alta velocidad en Apple Silicon: gracias a la decodificacion especulativa, es adecuado para aplicaciones de baja latencia en hardware Apple, como asistentes locales o prototipos.
- Experimentacion con decodificacion especulativa: el sidecar MTP cuantizado permite probar configuraciones de profundidad de draft y medir su impacto en throughput y aceptacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica explicitamente que no se ha medido el efecto de la cuantizacion INT8 ni de la abliteracion sobre la capacidad del modelo. Los unicos datos medidos son de rendimiento de decodificacion en Apple M5 Max (128 GB, macOS 26.5.2), con `mtplx forge verify`:

| Modo | tok/s | vs AR | Aceptacion de draft por posicion |
|---|---|---|---|
| AR (depth 0) | 17.06 | 1.00x | — |
| Depth 1 | 31.49 | 1.85x | 0.969 |
| Depth 2 | 45.44 | 2.66x | 0.952, 0.896 |
| Depth 3 (default) | 54.01 | 3.17x | 0.973, 0.933, 0.870 |

Comparacion del sidecar INT8 frente al BF16 original:

| Metrica | BF16 sidecar | INT8 sidecar (enviado) |
|---|---|---|
| Aceptacion depth-3 | 0.951, 0.899, 0.838 | 0.973, 0.933, 0.870 |
| Multiplicador depth-3 | 2.88x | 3.17x |
| tok/s depth-3 | 48.89 | 54.01 |
| Tamano en disco | 849 MB | 451 MB |

## Requisitos de hardware

- Requiere Apple Silicon (M-series) con macOS moderno; el autor probo en M5 Max con 128 GB.
- VRAM estimada: el modelo ocupa aproximadamente 28 GB en disco, por lo que se recomienda un equipo con al menos 64 GB de RAM unificada para contextos largos con comodidad.
- GPU recomendadas: cualquier chip Apple Silicon con suficiente memoria unificada (M1 Pro/Max o superior). No es compatible con GPUs NVIDIA o AMD.
- Opciones de despliegue: exclusivamente mediante MTPLX (https://github.com/youssofal/MTPLX). Un cargador MLX generico ignoraria el sidecar MTP y perderia la aceleracion.
- Latencia y throughput: 54 tok/s en M5 Max con depth 3; en hardware inferior el rendimiento sera menor, pero la aceleracion relativa frente al modo autorregresivo se mantiene.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B (nominal) | No disponible | Apache 2.0 | Original | Con alineacion de seguridad |
| Huihui-Qwen3.8-27B-abliterated | 27B (nominal) | No disponible | Apache 2.0 | Safetensors, GGUF | Abliterado, sin MTP |
| Este modelo (MTPLX-Q8) | 8.027.131.120 (segun safetensors) | No disponible | Apache 2.0 | Safetensors (MLX) | Abliterado, INT8, con MTP para decodificacion especulativa |

La comparativa directa con otros modelos de la misma categoria (abliterados o cuantizados para Apple Silicon) no esta disponible en la informacion proporcionada. La principal diferencia frente al modelo base es la eliminacion de la alineacion y la optimizacion para inferencia rapida en Apple Silicon.

## Limitaciones y advertencias

- Modelo abliterado: no rechaza peticiones dañinas, ilegales, eticas o peligrosas. La seguridad no puede recuperarse con un system prompt.
- No apto para despliegue publico sin una capa de moderacion externa. El autor recomienda explicitamente no exponerlo a usuarios no confiables.
- Sin benchmarks de calidad: no se ha evaluado el impacto de la cuantizacion INT8 ni de la abliteracion sobre la precision, el razonamiento o la generacion de codigo.
- Posible discrepancia en el numero de parametros: el safetensors reporta ~8B, mientras que el nombre del modelo indica 27B. Esto puede deberse a un error en el repo o a una estructura de archivos parcial; se recomienda verificar antes de usar.
- Limitado a Apple Silicon: no funciona en GPUs de NVIDIA o AMD sin una conversion adicional.
- La decodificacion especulativa requiere MTPLX; otros cargadores MLX ignoraran el sidecar y el modelo funcionara en modo autorregresivo, perdiendo la aceleracion.
- Contenido generado puede ser ofensivo, sesgado o factualmente incorrecto, como cualquier modelo de lenguaje, pero sin los frenos habituales de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mvid/Huihui-Qwen3.8-27B-abliterated-MTPLX-Q8
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Herramienta de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- Libreria MTPLX: https://github.com/youssofal/MTPLX
- Coleccion de modelos abliterados de huihui-ai: https://huggingface.co/collections/huihui-ai/qwen3-abliterated
