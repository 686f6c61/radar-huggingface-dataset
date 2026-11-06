# 0xBakeer/TandemLLM-Qwen3.8-Flash-Next-EXL3-3.05-corrector

## Resumen

TandemLLM-Qwen3.8-Flash-Next-EXL3-3.05-corrector es un artefacto auxiliar de 35 MB desarrollado por 0xBakeer para el motor de inferencia TandemLLM. No es un modelo de lenguaje en sentido estricto, sino un corrector de borradores (draft corrector) que mejora la tasa de aceptación de la decodificación especulativa sobre el modelo Qwen3.8-Flash-Next. Concretamente, actúa sobre la capa de predicción multi-token (MTP) que incorpora el modelo base, la cual propone los siguientes 4 tokens para que el modelo completo los verifique en una sola pasada.

El corrector reordena las 8 mejores propuestas del cabezal de borrador en cada una de las 4 profundidades, calculando una puntuación que combina el logit del borrador con una corrección aprendida por una pequeña red neuronal. El objetivo es aumentar el número de tokens aceptados por el verificador, reduciendo el coste de decodificación del modelo objetivo sin alterar el texto generado: en solicitudes con semilla, la salida es idéntica bit a bit con el corrector activado o desactivado.

El archivo está diseñado para un pack de cuantización concreto (EXL3 de turboderp en revisión 3.05bpw_h5_ng5) y un perfil de muestreo específico (temperatura 1.0, top-k 20, top-p 0.95, sin min-p). Su relevancia radica en que demuestra una optimización práctica de la decodificación especulativa en producción: ganancias medidas de entre +1,3 % y +4,9 % en tokens por segundo según la carga, con un coste computacional de 0,014 a 0,026 ms por paso de borrador en una NVIDIA DGX Spark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de corrección sobre la capa MTP (multi-token prediction) del modelo base; no es un transformer completo |
| Parametros totales | No disponible (el archivo pesa 35 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.8-Flash-Next) |
| Tipos de cuantizacion | Formato EXL3 (pack de destino en 3.05 bits por peso); el corrector se distribuye en safetensors |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0-only |
| Formato de pesos | safetensors (`flashnext-3.05.corrector.safetensors`) |

## Arquitectura y entrenamiento

El corrector es una red pequeña que opera sobre la salida de la capa MTP del modelo Qwen3.8-Flash-Next. Para cada posición y cada una de las 4 profundidades de borrador, toma los 8 candidatos principales del cabezal de borrador y calcula una puntuación compuesta: el logit del borrador más una corrección aprendida que depende de la salida de la capa MTP y del token candidato. El archivo incluye además tablas de calibración propias que TandemLLM utiliza para decidir cuántos tokens borrador enviar al modelo objetivo para su verificación; sin ellas, la ganancia se reduce drásticamente (de +1,8 % a 0,0 % en una sesión con ocho peticiones concurrentes).

El entrenamiento se realizó con 410 prompts escritos específicamente para este archivo: 220 de prosa (ensayos, relatos, explicaciones, cartas), 70 de chat y 120 de código, algunos con turno de sistema y la mayoría con modo thinking activado. Ninguno de ellos es un prompt de benchmark. Para cada prompt, el modelo objetivo generó su propia continuación de 512 tokens con muestreo a temperatura 1.0, top-k 20, top-p 0.95 y semilla fija. Se recogieron las salidas de la capa MTP y los 32 candidatos principales del cabezal de borrador en cada posición y profundidad, totalizando 803.044 filas. La partición fue de 359 prompts para entrenamiento y 51 reservados para validación, con 10 épocas optimizando la aceptación exacta de la selección acoplada sobre el top 8. El registro se hizo en una RTX PRO 6000 Blackwell, cuyas salidas MTP difieren ligeramente de las de la DGX Spark; la ganancia offline se confirmó sobre las salidas propias de la DGX Spark.

## Capacidades

- Mejora de la decodificación especulativa: incrementa la tasa de aceptación del primer token borrador (de 0,690 a 0,702 con cabezal de 32k; de 0,718 a 0,731 con 64k) y de los dos primeros (de 0,463 a 0,477 con 32k; de 0,502 a 0,518 con 64k) en 51 prompts reservados.
- Preservación exacta de la salida: en solicitudes con semilla, el texto generado es idéntico bit a bit con el corrector activado o desactivado, ya que solo cambian las propuestas, no la selección final del modelo objetivo.
- Compatibilidad condicionada: solo se activa para el pack EXL3 `turboderp/Qwen3.8-Flash-Next-exl3` en revisión `3.05bpw_h5_ng5` (commit `69e33439`) y para el perfil de muestreo `flashnext-3.05` (temperatura 1.0, top-k 20, top-p 0.95, sin min-p).
- Degradación segura: si el archivo falta o está corrupto, el servidor registra una línea de log y continúa con el borrador acoplado simple sin penalización.
- Integración con TandemLLM: se activa mediante la variable de entorno `QWEN38_FN_MTP_CORRECTOR=1` y se puede redirigir con `QWEN38_FN_MTP_CORRECTOR_FILE`.
- Verificación de integridad: el instalador comprueba el sha256 (`fe903accaf2dc18510fa4cee58701237c17dfd579d80a26c267fe0545c2c318b`).
- Monitorización: el endpoint `/health` reporta el estado bajo `weights.corrector` con `loaded`, el motivo de fallo si lo hubiera, y el nombre y sha256 del archivo.
- No soporta tool calling, agentes, visión ni audio: es un componente auxiliar de inferencia, no un modelo generativo autónomo.

## Casos de uso

- Servicio de generación de prosa a alta concurrencia: en despliegues con TandemLLM sobre DGX Spark que sirvan peticiones de texto con el perfil de muestreo `flashnext-3.05`, el corrector aporta entre +3,3 % y +4,9 % de tokens por segundo en peticiones cortas individuales, reduciendo el coste por token generado sin alterar el contenido.
- Inferencia por lotes con ocho peticiones simultáneas: aunque la ganancia baja a +1,3 % a +2,0 %, sigue siendo positiva y se mantiene la decodificación de las ocho solicitudes en paralelo, lo que lo hace adecuado para servidores con colas de trabajo moderadas.
- Validación de pipelines de decodificación especulativa: sirve como referencia para equipos que quieran implementar correctores de borrador sobre capas MTP en otros modelos, ya que documenta el proceso completo de generación de datos, entrenamiento y evaluación A/B.
- Investigación en decodificación especulativa: el archivo y su model card proporcionan métricas de aceptación offline por profundidad y por tamaño de cabezal (32k frente a 64k), útiles para estudiar el impacto del reordenamiento de candidatos en la tasa de aceptación.
- Despliegue con requisitos de reproducibilidad estricta: al garantizar texto idéntico bit a bit con semilla fija, encaja en entornos donde la determinismo de la salida es un requisito (auditorías, pruebas de regresión de calidad).
- Optimización de costes en infraestructura ya existente: para instalaciones que ya ejecutan TandemLLM con el pack EXL3 de Qwen3.8-Flash-Next, la incorporación del corrector no requiere cambios de hardware ni de modelo, solo la descarga del archivo y la activación de la variable de entorno.
- Monitorización de salud en producción: el reporte en `/health` permite a los operadores verificar que el corrector está cargado y con el sha256 correcto, facilitando la gestión de flotas de servidores.

## Benchmarks y rendimiento

| Carga de trabajo | Cambio en tok/s | Sesiones en que todas las rondas superaron a todas las sin corrector |
|---|---|---|
| Una petición corta | +3,3 % a +4,9 % | 3 de 4 |
| Ocho peticiones simultáneas | +1,3 % a +2,0 % | 1 de 4 |

| Texto | Cabezal | Primer token (sin → con) | Dos primeros (sin → con) |
|---|---|---|---|
| 51 prompts reservados | 32k | 0,690 → 0,702 | 0,463 → 0,477 |
| 51 prompts reservados | 64k | 0,718 → 0,731 | 0,502 → 0,518 |
| 8 textos de benchmark en DGX Spark | 32k | 0,674 → 0,697 | 0,444 → 0,463 |
| 8 textos de benchmark en DGX Spark | 64k | 0,704 → 0,727 | 0,480 → 0,502 |

Coste del corrector: 0,014 a 0,026 ms por paso de borrador en DGX Spark (una y ocho filas, ambos cabezales, con replay de grafo CUDA). Las cuatro sesiones A/B se ejecutaron en una NVIDIA DGX Spark con el motor en crudo (`/v1/completions`), servidor nuevo por brazo, 3 rondas y mediana. Todas las peticiones fueron prosa a temperatura 1.0, top-k 20, top-p 0.95 y 512 tokens, con prompts y semillas fijos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el artefacto no es un modelo generativo evaluable de forma independiente.

## Requisitos de hardware

- VRAM estimada para el corrector: 35 MB adicionales sobre el modelo base; el peso real lo determina el pack EXL3 de Qwen3.8-Flash-Next (3,05 bits por peso), no el corrector.
- GPU recomendadas: NVIDIA DGX Spark (única plataforma donde se han medido las ganancias); el entrenamiento se registró en RTX PRO 6000 Blackwell. No hay datos publicados para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; el corrector depende del motor TandemLLM y del pack EXL3, no se distribuye como GGUF ni para llama.cpp.
- Opciones de despliegue: exclusivamente TandemLLM (perfil `flashnext-3.05`), con activación mediante `QWEN38_FN_MTP_CORRECTOR=1`. No es compatible con vLLM, TGI, Ollama ni llama.cpp.
- Latencia: 0,014 a 0,026 ms por paso de borrador en DGX Spark con replay de grafo CUDA.
- Throughput: ganancia de +3,3 % a +4,9 % en tok/s con una petición corta y de +1,3 % a +2,0 % con ocho concurrentes, medidas sobre el motor en crudo.

## Comparativa con modelos similares

| Artefacto | Tipo | Tamaño | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TandemLLM-Qwen3.8-Flash-Next-EXL3-3.05-corrector | Corrector de borrador MTP | 35 MB | Reordena top-8 del cabezal de borrador en 4 profundidades | AGPL-3.0-only | Hugging Face (0 descargas, 1 like) |
| Qwen/Qwen3.8-Flash-Next | Modelo base | No disponible | Generación de texto con capa MTP | No disponible en la información | Hugging Face |
| turboderp/Qwen3.8-Flash-Next-exl3 | Cuantización EXL3 del modelo base | No disponible | Pack cuantizado a 3,05 bpw | No disponible en la información | Hugging Face (commit 69e33439) |

No se dispone de información sobre otros correctores de borrador comparables en la documentación proporcionada. La comparativa se limita a los componentes del ecosistema TandemLLM y al modelo base sobre el que opera.

## Limitaciones y advertencias

- Un solo pack: la tabla de tokens sigue al cabezal de borrador de este pack concreto; otro pack, incluso del mismo modelo, requiere su propio archivo corrector.
- Un solo perfil de muestreo: las peticiones con otros ajustes (temperatura, top-k, top-p distintos) recurren a la selección acoplada simple y no se benefician del corrector. Las peticiones greedy y sin semilla nunca lo utilizan.
- Ganancia pequeña en alta concurrencia: con ocho peticiones simultáneas la mejora es de +1,3 % a +2,0 %, y solo en una de cuatro sesiones superó la dispersión entre rondas.
- Medición limitada a una plataforma: la velocidad solo se ha medido en NVIDIA DGX Spark; se desconoce el comportamiento en otras GPU.
- Dependencia de las tablas de calibración: sin ellas, la ganancia puede caer a 0,0 % en cargas concurrentes.
- Licencia AGPL-3.0-only: impone obligaciones de copyleft sobre el software que lo integre; debe evaluarse antes de un uso comercial propietario. El modelo base puede tener su propia licencia, no detallada en la información disponible.
- Sin datos de sesgos ni alucinación: al no ser un modelo generativo autónomo, no aplican sesgos de generación propios, pero hereda los del modelo objetivo Qwen3.8-Flash-Next, sobre el que no se proporciona información.
- Cero descargas y un solo like en Hugging Face: ecosistema muy reducido, sin validación comunitaria independiente.
- Repositorio de 0,0 GB reportado: el tamaño real del archivo es de 35 MB según la model card; posible inconsistencia en los metadatos de Hugging Face.

## Enlaces

- Hugging Face del corrector: https://huggingface.co/0xBakeer/TandemLLM-Qwen3.8-Flash-Next-EXL3-3.05-corrector
- Repositorio TandemLLM: https://github.com/0xBakeer/TandemLLM
- Licencia TandemLLM (AGPL-3.0): https://github.com/0xBakeer/TandemLLM/blob/main/LICENSE
- Pack EXL3 de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
