# leok7v/Ternary-Bonsai-1.7B-gguf

## Resumen

Ternary Bonsai 1.7B es un modelo de lenguaje denso desarrollado por Prism ML, construido a partir de Qwen3-1.7B de Alibaba Cloud y cuantizado a un alfabeto ternario {-1, 0, +1} (~1,58 bits de información por peso). Este repositorio concreto es un re-host estable del archivo GGUF `Q2_0_g128` original, publicado por el usuario leok7v bajo licencia Apache 2.0, con el objetivo de preservar una copia fija si el repositorio upstream se mueve o desaparece. Los tensores son byte a byte idénticos al archivo original; solo se añade una clave de metadatos con la configuración de muestreo.

El modelo resuelve el problema de ejecutar inferencia de lenguaje en dispositivos con recursos muy limitados: con un peso de aproximadamente 442 MiB (0,25 GB en formato de 1 bit según la documentación de Prism ML), está diseñado para smart glasses, wearables y tareas en segundo plano donde otros modelos de 1,7B son demasiado pesados. Su arquitectura es la de Qwen3 denso (GQA, SwiGLU, RoPE, RMSNorm), sin bloques híbridos de atención lineal, y su relevancia actual radica en demostrar que la cuantización ternaria puede reducir drásticamente el footprint de memoria manteniendo capacidades de chat y generación de texto útiles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 denso (GQA, SwiGLU, RoPE, RMSNorm) |
| Parametros totales | 1.720.028.160 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_0_g128 (2,125 bits/peso efectivo) |
| Idiomas soportados | ingles y los idiomas del modelo base Qwen3-1.7B |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion ternaria del modelo denso Qwen3-1.7B. La arquitectura base emplea atencion por grupos (GQA) con MLP SwiGLU, incrustaciones posicionales rotatorias (RoPE) y normalizacion RMSNorm en todas las capas. No incluye bloques de atencion lineal ni Gated DeltaNet, a diferencia del modelo hibrido de 27B de la misma familia. La cuantizacion ternaria se realiza en bloques de 128 pesos: cada bloque se representa como `{ escala FP16 d; codigos de 2 bits qs[32] }` (34 bytes, 2,125 bits/peso efectivo) y se de-cuantiza con la formula `w = (code - 1) * d`. El archivo GGUF incluye una clave de metadatos adicional (`general.generation_config_json`) que transporta una tarjeta de muestreo con los valores por modo (temperatura 0,5, top_p 0,85, top_k 20, min_p 0,0) y una penalizacion de presencia de 1,5 en los modos sin pensamiento, politica de la familia para reducir la repeticion en modelos pequenos. No se dispone de informacion sobre el proceso de entrenamiento o ajuste posterior a la cuantizacion.

## Capacidades

- Generacion de texto y chat conversacional en ingles y en los idiomas del modelo base Qwen3-1.7B.
- Inferencia en dispositivos con memoria muy limitada gracias a la cuantizacion ternaria (0,25 GB en disco segun la documentacion de Prism ML).
- Compatible con el ecosistema llama.cpp, lo que permite ejecucion en CPU y GPU con soporte para kernels Q2_0 (rama `prism` de llama.cpp).
- Disenado para tareas de asistencia en tiempo real en wearables, smart glasses y procesos en segundo plano.
- No se confirma soporte de tool calling, function calling ni capacidades multimodales en la informacion disponible.

## Casos de uso

- Asistentes en smart glasses y wearables: el modelo puede gestionar conversaciones de voz o texto cortas con baja latencia y consumo minimo de bateria, gracias a su tamano reducido y a la cuantizacion ternaria que cabe en memorias de 0,5 GB.
- Tareas de fondo en dispositivos moviles: clasificacion de notificaciones, resumen de mensajes o generacion de respuestas rapidas sin depender de la nube, manteniendo la privacidad de los datos.
- Chat local privado: al ejecutarse completamente en el dispositivo, permite conversaciones sin envio de datos a servidores externos, adecuado para entornos con requisitos estrictos de confidencialidad.
- Prototipado de aplicaciones de IA en edge: desarrolladores pueden integrar el modelo en pruebas de concepto para validar la viabilidad de IA generativa en hardware de gama baja antes de escalar a modelos mayores.
- Generacion de texto en entornos con ancho de banda limitado: al ser un archivo de ~442 MiB, puede descargarse y actualizarse facilmente en redes lentas o intermitentes.
- Investigacion sobre cuantizacion ternaria: sirve como referencia para estudiar el impacto de la representacion {-1, 0, +1} en la calidad de generacion frente a cuantizaciones convencionales de 2 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del re-host no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones, y remite al repositorio original de Prism ML para esos datos, que no estan accesibles en la documentacion consultada.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa ~442 MiB, por lo que la inferencia cabe en 1 GB de VRAM o RAM, incluyendo overhead de ejecucion.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, Jetson Nano, o iGPU modernas). Tambien es viable en CPU pura con llama.cpp.
- Dispositivos objetivo: smart glasses, wearables, Raspberry Pi 4/5, telefonos de gama media y otros sistemas embebidos con 1-2 GB de RAM.
- Opciones de despliegue: llama.cpp (rama `prism` para kernels Q2_0), Ollama, o integracion directa via bindings de llama.cpp en Python, Rust o C.
- Latencia y throughput: no se han publicado mediciones especificas en la informacion disponible; se espera una latencia de decodificacion de decenas de tokens por segundo en CPU modernas, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ternary Bonsai 1.7B (este) | 1,72B | Ternaria Q2_0_g128 | no disponible | Apache 2.0 | GGUF |
| Qwen3-1.7B (base) | 1,72B | FP16 / BF16 | 32k (segun documentacion oficial) | Apache 2.0 | Safetensors |
| SmolLM2-1.7B | 1,7B | FP16 / int8 | 8k | Apache 2.0 | Safetensors |

La comparativa se limita a caracteristicas estructurales porque no hay datos de rendimiento publicados para Ternary Bonsai. Frente a Qwen3-1.7B, este modelo reduce el peso de 3,45 GB (FP16) a ~0,44 GB, a costa de una precision numerica drasticamente menor. SmolLM2-1.7B es una alternativa densa sin cuantizacion ternaria, con un contexto mas corto y sin informacion sobre su comportamiento en dispositivos edge.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Qwen3-1.7B, puede heredar sesgos presentes en los datos de entrenamiento del modelo base, aunque no se documentan explicitamente.
- Riesgo de alucinacion: al ser un modelo de solo 1,7B con cuantizacion ternaria, la calidad de generacion es limitada y la probabilidad de producir contenido factualmente incorrecto es alta, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto soportada en esta version cuantizada; se recomienda asumir un contexto corto (probablemente inferior a 8k) para evitar degradacion.
- Restricciones de idioma: la model card indica soporte para ingles y los idiomas del modelo base, pero no se garantiza un rendimiento multilingue robusto fuera del ingles.
- Solo existe una cuantizacion disponible (Q2_0_g128); no hay variantes de mayor precision (Q4, Q8) en este repositorio, lo que limita las opciones de ajuste calidad/rendimiento.
- El kernel Q2_0 no esta integrado en la rama principal de llama.cpp; requiere compilar desde la rama `prism` del repositorio PrismML-Eng/llama.cpp, lo que puede complicar el despliegue en entornos estandar.
- Este repositorio es un re-host no oficial; para uso en produccion se recomienda utilizar el repositorio original de Prism ML como fuente autoritativa.

## Enlaces

- Repositorio HuggingFace (re-host): https://huggingface.co/leok7v/Ternary-Bonsai-1.7B-gguf
- Repositorio original (autoritativo): https://huggingface.co/prism-ml/Ternary-Bonsai-1.7B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Documentacion de Bonsai 1.7B: https://docs.prismml.com/models/bonsai-1-7b
- Repositorio de kernels Q2_0: https://github.com/PrismML-Eng/llama.cpp
- Demo de Bonsai: https://github.com/PrismML-Eng/Bonsai-demo/
