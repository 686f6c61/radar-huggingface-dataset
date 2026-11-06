# CalmCampus/calmcampus-reframe-1.7b-bf16

## Resumen

CalmCampus Reframe 1.7B bf16 es un ajuste fino del modelo Qwen3-1.7B de Alibaba, especializado en reencuadre cognitivo (reframing) en el contexto de terapia cognitivo-conductual (CBT) y bienestar emocional para estudiantes. Lo desarrolla CalmCampus, un proyecto de plataforma de bienestar estudiantil, y se distribuye como vista previa de investigación (v0.1). El modelo parte de la arquitectura transformer densa de Qwen3 con 1.720.574.976 parámetros y se publica en precisión bfloat16, sin cuantizar, para facilitar su conversión a otros formatos.

La relevancia de esta ficha es doble. Por un lado, este checkpoint concreto es el artefacto intermedio entre el modelo base y la versión de 4 bits que la aplicación usa realmente: el autor lo publica para que terceros puedan inspeccionarlo, cuantizarlo de otra forma o convertirlo a GGUF u otros formatos. Por otro, ilustra un patrón habitual en el ecosistema open source: un LoRA fusionado sobre un modelo pequeño y permisivo (Apache-2.0) orientado a un dominio muy específico.

Conviene subrayar desde el principio que se trata de una vista previa de investigación, no de un dispositivo médico ni de un detector de crisis autónomo. El autor advierte explícitamente de que el modelo falla en algunos mensajes de crisis y de que su salida en neerlandés no es fiable. Toda aplicación que lo integre debe ejecutar su propia comprobación de crisis antes de invocar el modelo y ofrecer siempre recursos de apoyo humano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`Qwen3ForCausalLM`) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | bfloat16 en este repositorio; existe una version oficial de 4 bits (calmcampus-reframe-1.7b-4bit) |
| Idiomas soportados | ingles (declarado); el autor advierte de que la salida en neerlandes no es fiable |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), tamano del repositorio de 3,5 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA fusionado sobre Qwen/Qwen3-1.7B, un transformer causal denso de la familia Qwen3. La fusión del adaptador se realiza antes del paso de cuantizacion a 4 bits, de modo que este repositorio contiene los pesos completos en bfloat16 (unos 3,4 GB). No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; solo se referencia el dataset CalmCampus/calmcampus-reframe-data como fuente de entrenamiento.

El contrato de prompt es parte integral del modelo: el repositorio incluye un fichero `system_prompt.txt` que debe usarse exactamente tal cual, junto con la plantilla de chat de Qwen y el modo de razonamiento (thinking) desactivado. El autor indica que el modelo solo se ha cargado y ejecutado con `mlx-lm`, sin pruebas en otros runtimes. La evaluacion publicada corresponde a la version de 4 bits, no a estos pesos bf16.

## Capacidades

- Generacion de texto conversacional orientada a reencuadre cognitivo en el marco de la terapia cognitivo-conductual.
- Acompanamiento de bienestar emocional para estudiantes (estres academico, ansiedad social, agotamiento).
- Conversacion multi-turno siguiendo un contrato de prompt estricto con plantilla de chat de Qwen.
- Ejecucion en Apple Silicon mediante MLX (`mlx-lm`), con pesos en bfloat16.
- Base para conversion y cuantizacion a otros formatos (GGUF, 4 bits alternativos, etc.).
- Capacidades generales heredadas de Qwen3-1.7B (generacion, razonamiento basico, codigo): no documentadas ni evaluadas en esta ficha.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo thinking debe desactivarse segun el autor.
- Capacidades multilingues: limitadas al ingles declarado; el neerlandes no es fiable segun el autor.

## Casos de uso

- Aplicacion de bienestar estudiantil: integracion en la app CalmCampus para ofrecer ejercicios de reencuadre cognitivo en conversaciones multi-turno, siempre con una comprobacion de crisis previa y recursos humanos visibles.
- Prototipado e investigacion en NLP clinico: servir como punto de partida reproducible para estudiar ajustes finos de CBT sobre modelos pequenos, dado que los pesos completos en bf16 permiten inspeccion y reentrenamiento.
- Conversion y cuantizacion: usar estos pesos como origen para generar variantes GGUF, 4 bits o de otra precision para despliegue en entornos con menos memoria.
- Evaluacion comparativa de seguridad: analizar el comportamiento del modelo ante mensajes de crisis para medir falsos negativos y disenar capas de seguridad externas.
- Despliegue local en Apple Silicon: ejecutar el modelo con `mlx-lm` en portatiles Mac para demos y pruebas de integracion sin infraestructura de GPU.
- Educacion y divulgacion: ilustrar en cursos o talleres como se fusiona un LoRA sobre un modelo base y como se publican artefactos intermedios en Hugging Face.
- Generacion de material psicoeducativo: producir textos breves de reencuadre para talleres de gestion del estres, con revision humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint bf16. El autor indica que las metricas de evaluacion del proyecto se midieron sobre el fichero de 4 bits (calmcampus-reframe-1.7b-4bit) y que dichos numeros no aplican a estos pesos. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de CBT.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion practica de 5-7 GB en funcion de la longitud de contexto).
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU con 8 GB o mas de memoria deberia poder alojarlo en bf16.
- GPU de consumo: cabe en tarjetas con 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4070) y en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: el autor solo ha probado `mlx-lm`. No hay confirmacion de funcionamiento en vLLM, llama.cpp, Ollama o TGI; seria necesario convertir los pesos previamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CalmCampus Reframe 1.7B bf16 | 1,72 B | no disponible | Apache-2.0 | Hugging Face (MLX) | Ajuste fino CBT, vista previa de investigacion |
| Qwen/Qwen3-1.7B | 1,72 B | no disponible | Apache-2.0 | Hugging Face | Modelo base, capacidades generales |
| CalmCampus Reframe 1.7B 4bit | ~1,72 B | no disponible | Apache-2.0 | Hugging Face | Version evaluada y usada por la app |
| Modelos especializados en salud mental comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la busqueda realizada |

## Limitaciones y advertencias

- Vista previa de investigacion: no es un dispositivo medico ni un detector de crisis autonomo.
- Falsos negativos en deteccion de crisis: el autor reconoce que el modelo pasa por alto algunos mensajes de crisis.
- Salida en neerlandes no fiable; el unico idioma declarado es el ingles.
- Las metricas de evaluacion publicadas corresponden a la version de 4 bits, no a estos pesos bf16.
- Solo probado con `mlx-lm`; otros runtimes pueden requerir conversion y no estan validados.
- Requiere usar exactamente el `system_prompt.txt` incluido, la plantilla de chat de Qwen y el modo thinking desactivado; desviarse de este contrato puede degradar la calidad.
- Riesgo de alucinacion inherente a un modelo de 1,7 B en un dominio sensible; se requiere supervision humana.
- Sesgos: no documentados en la informacion disponible, pero heredables del corpus de entrenamiento y del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias y desaconseja el uso clinico sin salvaguardas.
- Cualquier aplicacion debe ejecutar su propia comprobacion de crisis antes de llamar al modelo y ofrecer siempre recursos de apoyo humano.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/CalmCampus/calmcampus-reframe-1.7b-bf16
- Hugging Face (version 4 bits): https://huggingface.co/CalmCampus/calmcampus-reframe-1.7b-4bit
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/CalmCampus/calmcampus-reframe-data
- Repositorio GitHub del proyecto: https://github.com/PalashMulchandani/calmcampus
- Repositorio GitHub alternativo: https://github.com/Emmanuelodey2/Calmcampus
- Demo en vivo: https://calmcampus-lilac.vercel.app
