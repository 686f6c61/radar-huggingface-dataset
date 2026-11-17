# nvidia/Qwen3.5-4B-Qwen3.8-27B-Draft

## Resumen

El modelo `nvidia/Qwen3.5-4B-Qwen3.8-27B-Draft` es un modelo borrador externo (external draft model) disenado por NVIDIA para acelerar la decodificacion especulativa (speculative decoding) del modelo objetivo Qwen3.8-27B. No es un modelo de lenguaje autonomo pensado para uso directo: propone bloques de tokens candidatos que el modelo objetivo verifica mediante rejection sampling, reduciendo la latencia de decodificacion sin alterar la distribucion de salida del modelo objetivo. Fue entrenado con NVIDIA Model Optimizer (nvidia-modelopt v0.48.0rc0) en modo de decodificacion especulativa externa.

El borrador se construye sobre Qwen3.5-4B (4.205.751.296 parametros, arquitectura Transformer, clase Qwen3_5ForCausalLM) y comparte tokenizador y vocabulario con Qwen3.8-27B, lo que permite la verificacion directa de los tokens propuestos. Se entreno a una longitud de secuencia de 12.288 tokens y esta pensado para entornos de inferencia de produccion donde se sirve Qwen3.8-27B y se quiere reducir la latencia de decode.

Su relevancia es practica: la decodificacion especulativa es una de las tecnicas mas eficaces para mejorar el throughput en inferencia de LLM sin degradar la calidad, y este checkpoint empaqueta el entrenamiento del borrador como artefacto listo para vLLM. La licencia es la NVIDIA Open Model Agreement, con los modelos base bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3_5ForCausalLM) |
| Parametros totales | 4.205.751.296 (4,21B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entrenado a 12.288 tokens de secuencia (ventana de inferencia no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con prompts en aleman, espanol, frances, italiano y japones, ademas de ingles implicito en STEM/code/math/chat) |
| Licencia | NVIDIA Open Model Agreement (modelos base bajo Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Transformer denso de 4,21B parametros derivado de Qwen3.5-4B, con la clase `Qwen3_5ForCausalLM`. No es una cabeza borrador (draft head) acoplada al modelo objetivo, sino un modelo de lenguaje completo que comparte tokenizador y vocabulario con Qwen3.8-27B, lo que permite que el objetivo verifique los tokens propuestos sin traduccion de vocabulario.

El entrenamiento se realizo con NVIDIA Model Optimizer v0.48.0rc0 en modo de decodificacion especulativa externa. Los prompts se extrajeron de Nemotron-Post-Training-Dataset-v2 (199.998 conversaciones de un solo turno, muestreadas con semilla fija en nueve categorias: STEM, codigo, matematicas, chat y multilingue en aleman, espanol, frances, italiano y japones; se descartaron prompts de mas de 3.072 tokens). Las respuestas fueron sintetizadas por Qwen3.8-27B. La senal de entrenamiento es, en cada posicion de respuesta, la distribucion top-20 del modelo objetivo bajo su politica de servicio (temperatura 1.0, top-k 20). En tiempo de servicio el borrador muestrea autoregresivamente un bloque de tokens candidatos bajo esa misma politica y el objetivo los verifica por rejection sampling, de modo que la distribucion de salida final no cambia.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen3.8-27B.
- Comparte tokenizador y vocabulario con el objetivo, lo que habilita verificacion directa.
- Entrenado para alinearse con la distribucion top-20 del objetivo bajo su politica de servicio.
- Cobertura de dominios de entrenamiento: STEM, codigo, matematicas, chat y multilingue (DE, ES, FR, IT, JA).
- No es un modelo autonomo: no esta pensado para generar respuestas finales al usuario.
- Soporte de tool calling, agentes o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de Qwen3.8-27B con baja latencia de decode: el borrador propone bloques de tokens que el objetivo verifica, reduciendo la latencia por token sin alterar la salida final, lo que es adecuado para APIs de chat interactivo.
- Inferencia de produccion en vLLM: el checkpoint se carga en vLLM como borrador externo del objetivo, integrandose en pipelines existentes de serving.
- Despliegue en hardware NVIDIA Groq 3 LPU: el modelo esta compilado para LPU y se ejecuta bajo su runtime, orientado a proveedores de inferencia con ese hardware.
- Cargas de trabajo de codigo y matematicas: al haberse entrenado con prompts de esas categorias, el borrador tiende a acertar mas tokens en esos dominios y aporta mayor aceleracion.
- Atencion multilingue en DE, ES, FR, IT y JA: el entrenamiento cubre esos idiomas, por lo que el borrador es adecuado para servir el objetivo a usuarios en esas lenguas.
- Evaluacion de decodificacion especulativa: util como referencia para medir tasas de aceptacion y throughput con SPEED-Bench (subconjuntos qualitative y throughput-32k) en entornos de investigacion.
- Reduccion de coste por token en inferencia a gran escala: al disminuir el numero de pasos de decode del objetivo de 27B, se reduce el coste computacional por token generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card cita SPEED-Bench (subconjuntos qualitative, con 1.138 turnos de conversacion, y throughput-32k, con 1.536 prompts de 33k a 46k tokens) como dataset de evaluacion, pero no incluye cifras de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia, 4,21B parametros en fp16 requieren aproximadamente 8,4 GB de pesos; el repo ocupa 8,4 GB.
- GPU recomendadas: NVIDIA Blackwell es la microarquitectura declarada como compatible; el hardware de prueba es NVIDIA Groq 3 LPU.
- Cabe en GPU consumer: no disponible en la informacion proporcionada.
- Opciones de despliegue: vLLM (motor de aceleracion declarado), SGLang y TRT-LLM (los checkpoints son modelos HuggingFace estandar y cargan en esos motores); runtime de NVIDIA Groq 3 LPU.
- Sistema operativo preferido: Linux.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nvidia/Qwen3.5-4B-Qwen3.8-27B-Draft | 4,21B | entrenado a 12.288 tokens | Borrador externo para Qwen3.8-27B | NVIDIA Open Model Agreement | Hugging Face, 8 descargas |
| Qwen/Qwen3.5-4B | no disponible | no disponible | Modelo de lenguaje autonomo | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B | 27B | no disponible | Modelo objetivo denso vision-lenguaje | Apache 2.0 | Hugging Face, NVIDIA NGC |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: genera tokens candidatos que el objetivo debe verificar; no produce respuestas finales por si mismo.
- Solo es valido con Qwen3.8-27B como objetivo y con su tokenizador; no es reutilizable con otros modelos.
- Entrenado a una longitud de secuencia de 12.288 tokens y con prompts de hasta 3.072 tokens; el comportamiento en contextos mucho mas largos no esta documentado.
- La aceleracion depende de la tasa de aceptacion del borrador, que varia por dominio; no se han publicado cifras de aceptacion ni de speedup.
- Idiomas soportados no declarados formalmente; la cobertura de entrenamiento se limita a los idiomas de los prompts de Nemotron-Post-Training-Dataset-v2.
- Riesgo de sesgos y alucinacion: no evaluado en la informacion disponible; al ser un borrador verificado por el objetivo, la salida final hereda las limitaciones de Qwen3.8-27B.
- Licencia NVIDIA Open Model Agreement para el borrador; los modelos base estan bajo Apache 2.0, pero el uso comercial del checkpoint combinado se rige por el acuerdo de NVIDIA.
- Hardware de referencia especifico (NVIDIA Groq 3 LPU, Blackwell); el rendimiento en otras plataformas no esta documentado.
- Fecha de creacion del repositorio (2026-11-11) y version 1.0 del checkpoint; puede haber cambios en futuras revisiones.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Qwen3.5-4B-Qwen3.8-27B-Draft
- Modelo base borrador (Qwen3.5-4B): https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo objetivo (Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Dataset de entrenamiento (Nemotron-Post-Training-Dataset-v2): https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Qwen3.8-27B en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/-
