# 2177-AI-LAB/qwen3-0.6b-openmath-2177

## Resumen

2177-AI-LAB/qwen3-0.6b-openmath-2177 es un ajuste fino supervisado (SFT) experimental del modelo base unsloth/Qwen3-0.6B, desarrollado por el laboratorio 2177 AI Lab. El objetivo declarado es adaptar un modelo de 0,6 mil millones de parametros al razonamiento matematico mediante LoRA sobre un subconjunto del dataset OpenMathReasoning-mini de Unsloth. Se publica como artefacto de investigacion, no como sistema listo para produccion.

El modelo emplea la arquitectura Qwen3 (transformer denso) y se distribuye en dos formatos: un adaptador PEFT LoRA en safetensors y una version fusionada y cuantizada en GGUF Q4_K_M. El entrenamiento fue notablemente ligero: 30 pasos de LoRA con rango 16 sobre backend de CPU, ya que la ruta de entrenamiento en GPU (AMD Radeon RX 6400) fallo. El checkpoint reporto una perdida de 0,5028, metrica de entrenamiento sin validacion independiente.

Su relevancia es limitada pero ilustrativa: sirve como ejemplo de flujo de trabajo de bajo coste para fine-tuning de modelos pequenos en matematicas y como banco de pruebas para evaluar si un SFT minimo aporta mejoras medibles. El autor no reclama ninguna mejora sobre el modelo base y advierte explicitamente de que la procedencia y licencia del dataset no estan verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer denso) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (fusionada); adaptador LoRA en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no declarada (el modelo base Qwen3-0.6B es Apache 2.0; la licencia del dataset no esta verificada) |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF Q4_K_M (modelo fusionado) |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3-0.6B, un transformer denso de la familia Qwen3 con aproximadamente 0,6 mil millones de parametros. Sobre el se aplico un ajuste fino con LoRA de rango 16 y alpha 16, sin dropout, sobre los modulos de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y de la MLP (`gate_proj`, `up_proj`, `down_proj`). El entrenamiento se realizo con Unsloth Studio 2026.11.4 y PEFT 0.18.1, usando 12 hilos de CPU como backend tras fallar la ruta GPU en una AMD Radeon RX 6400. Se ejecutaron solo 30 pasos y el checkpoint final reporto una perdida de 0,5028, sin loss de evaluacion configurada.

Los datos provienen de `unsloth/OpenMathReasoning-mini`, configuracion `default`, split `cot` (chain-of-thought), en la revision `5ea611a9fde449e7df8e72aefe698996a9882390`. No se incluyen ficheros del dataset en el repositorio y la procedencia upstream y las condiciones de licencia no han sido verificadas de forma independiente. No se documenta el numero de tokens de entrenamiento ni la composicion exacta del dataset. No hay innovaciones tecnicas destacables: se trata de un SFT convencional con LoRA y sin RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-0.6B.
- Razonamiento matematico basico: aritmetica con orden de operaciones, ecuaciones lineales y calculos de descuentos e IVA, segun las tres pruebas manuales del autor.
- Razonamiento chain-of-thought, ya que el split de entrenamiento es `cot`.
- Soporte de tool calling / function calling: no disponible (no documentado para este ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles (no documentadas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Ejercicios matematicos locales y educativos: el modelo puede resolver operaciones aritmeticas, ecuaciones lineales y calculos financieros sencillos (descuentos, IVA) en un entorno de inferencia local, gracias a su tamano reducido y a su cuantizacion Q4_K_M.
- Prototipado de pipelines de razonamiento matematico: util como primer eslabon en un sistema que combine generacion de soluciones con verificacion externa (por ejemplo, un interprete de Python) para descartar calculos erroneos.
- Investigacion sobre fine-tuning de bajo coste: sirve como referencia reproducible de un SFT con LoRA de 30 pasos en CPU, util para estudiar el efecto de ajustes minimos sobre modelos pequenos.
- Evaluacion comparativa de tecnicas de cuantizacion: al ofrecer el mismo modelo en safetensors (adaptador) y GGUF Q4_K_M, permite medir la degradacion de calidad introducida por la cuantizacion en tareas aritmeticas.
- Generacion de problemas matematicos de practica: el modelo puede producir enunciados y soluciones paso a paso para cuadernos de ejercicios, siempre con revision humana posterior.
- Despliegue en entornos con recursos muy limitados: su tamano (0,4 GB de repositorio, cuantizacion Q4_K_M) permite ejecutarlo en portatiles o dispositivos de borde para tareas de asistencia matematica no criticas.
- Banco de pruebas para evaluacion de alucinacion en matematicas: util para estudiar la frecuencia y el tipo de errores de calculo en modelos pequenos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la informacion disponible. El autor solo reporta tres pruebas manuales independientes en sesiones de chat nuevas:

| Prueba | Resultado esperado | Resultado observado |
|---|---|---|
| Aritmetica y orden de operaciones | 66 | Correcto |
| Ecuacion lineal | x = 6 | Correcto (verificado en ambos lados: 36 = 36) |
| Calculo de descuento e IVA | 81,60 EUR | Correcto |

Estas pruebas no constituyen un benchmark estandarizado y el modelo base no ha sido evaluado sobre el mismo conjunto, por lo que no se puede afirmar ninguna mejora medible respecto al original.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantizacion Q4_K_M (modelo de ~0,6B parametros); en FP16 el peso ronda 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; una RTX 3060, RTX 4060 o superior ofrece margen holgado. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp u Ollama para el fichero GGUF Q4_K_M; transformers con PEFT para cargar el adaptador LoRA sobre el modelo base; vLLM y TGI no estan documentados para este artefacto.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2177-AI-LAB/qwen3-0.6b-openmath-2177 | 596 M | no disponible | SFT LoRA en matematicas | no declarada | Hugging Face |
| unsloth/Qwen3-0.6B (base) | ~0,6 B | no disponible | Modelo generalista | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-0.6B | ~0,6 B | no disponible | Modelo generalista oficial | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo muy pequeno (aproximadamente 0,6 mil millones de parametros), con capacidad de razonamiento limitada frente a modelos de mayor escala.
- Solo 30 pasos de entrenamiento, lo que hace improbable una adaptacion profunda al dominio matematico.
- Sin loss de evaluacion ni comparacion controlada contra el modelo base; no se reclama mejora medible.
- Evaluacion limitada a tres problemas manuales, insuficiente para extraer conclusiones.
- Riesgo de calculos y razonamientos incorrectos; el autor recomienda verificacion independiente.
- Procedencia y licencia del dataset OpenMathReasoning-mini no verificadas; no se declara licencia global para el ajuste, lo que impide un uso comercial seguro sin aclaracion previa.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- Longitud de contexto no documentada para este ajuste.
- No apto para decisiones criticas ni entornos de seguridad.
- Artefacto de investigacion privada en su origen ("Private research release"), con cero descargas y cero likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2177-AI-LAB/qwen3-0.6b-openmath-2177
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-0.6B
- Modelo base oficial (Qwen): https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/unsloth/OpenMathReasoning-mini
- Unsloth Studio: no disponible (sin enlace en la informacion proporcionada)
