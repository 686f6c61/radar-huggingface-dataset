# fbaldassarri/tiiuae_Falcon3-10B-Base-auto_gptq-int4-gs64-sym

## Resumen

Esta ficha describe `fbaldassarri/tiiuae_Falcon3-10B-Base-auto_gptq-int4-gs64-sym`, una versión cuantizada a 4 bits del modelo base Falcon3-10B-Base desarrollado por el Technology Innovation Institute (TII) de Abu Dabi. La cuantización la ha realizado el usuario fbaldassarri mediante Intel AutoRound v0.16.1 con el algoritmo GPTQ (AutoGPTQ), empleando cuantización simétrica de 4 bits con tamaño de grupo 64 (W4G64). El objetivo es reducir el peso del modelo y acelerar la inferencia (el autor declara 2-3x de speedup) con una pérdida de precisión leve, manteniendo la licencia Apache 2.0 del original.

El modelo base Falcon3-10B-Base es un transformer causal de tipo Llama (según `model_type: llama` en la model card) con aproximadamente 10.000 millones de parámetros nominales. El checkpoint cuantizado contiene 2.161.720.320 parámetros reales en safetensors (los pesos INT4 empaquetados más las escalas y los sesgos de cero), y el repositorio ocupa 8,4 GB. Está pensado específicamente para inferencia en CPU Intel, iGPU Intel Arc (mediante intel-extension-for-pytorch) y NPU Intel (AI Boost en Core Ultra) vía OpenVINO, aunque al ser un formato GPTQ estándar también puede cargarse con transformers en otras plataformas.

La relevancia de esta ficha radica en que documenta un artefacto de cuantización de un modelo abierto de última generación, con receta de replicación completa y condiciones de ejecución registradas. Es un modelo de tipo *base* (no instruido), orientado a completado de texto en inglés, sin plantilla de chat ni capacidades de tool calling nativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), `model_type: llama` |
| Parametros totales | 10B nominales en el modelo base; 2.161.720.320 parametros reales en el checkpoint cuantizado (pesos INT4 empaquetados + escalas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 (4 bits), GPTQ / AutoGPTQ, simetrica, group_size 64 (W4G64), WoQ (weights-only quantization) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint GPTQ compatible con transformers) |

## Arquitectura y entrenamiento

El modelo subyacente es Falcon3-10B-Base de TII, un transformer causal decoder-only con `model_type` declarado como `llama` en la model card del checkpoint cuantizado. No se dispone en la informacion proporcionada de detalles sobre el número exacto de capas, dimensión oculta, cabezas de atención, número de tokens de entrenamiento, composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones arquitectónicas específicas (atención lineal, decodificación especulativa, etc.) más allá de la clasificación genérica como transformer causal.

La contribución técnica de este artefacto es la cuantización post-entrenamiento. Se aplicó Intel AutoRound v0.16.1 con el algoritmo GPTQ, cargando el modelo en `torch.bfloat16`, calibrando en CPU con 128 muestras de 512 tokens, batch size 4 y 200 iteraciones de ajuste. La cuantización se completó el 2026-11-05 tras 51.680,5 segundos (861,3 minutos) de cómputo. El resultado son pesos INT4 simétricos con grupo 64, empaquetados en formato AutoGPTQ. El autor indica que el proceso está optimizado para despliegue en hardware Intel (CPU, iGPU Arc y NPU) mediante intel-extension-for-pytorch y OpenVINO, y proporciona una receta de replicación completa basada en el repositorio `auto-round-pipeline`.

## Capacidades

- Generación de texto y completado de secuencias en inglés, al ser un modelo de tipo *base* (no instruido) sin plantilla de chat.
- Razonamiento y conocimiento general heredados del modelo base Falcon3-10B-Base, sujetos a la degradación propia de la cuantización W4G64.
- Capacidad multilingüe limitada: la model card declara únicamente `en` como idioma soportado.
- No dispone de soporte nativo de tool calling ni function calling documentado.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- No está entrenado para seguir instrucciones ni para diálogo multi-turno; el prompt debe ser texto plano de continuación.
- Inferencia acelerada y con menor huella de memoria respecto al modelo en bf16, con un speedup declarado de 2-3x.

## Casos de uso

- Completado de texto y autocompletado en editores o IDE: el modelo acepta texto plano y genera continuaciones, adecuado para sugerencias de redacción en inglés sobre CPU o iGPU Intel sin necesidad de GPU dedicada.
- Generación de texto por lotes en servidores sin GPU: al estar cuantizado a INT4 y optimizado para intel-extension-for-pytorch, permite ejecutar generación de texto en infraestructura CPU Intel estándar con menor coste de memoria.
- Prototipado e investigación en cuantización: sirve como artefacto de referencia para estudiar la pérdida de calidad de W4G64 frente al modelo en bf16, con receta de replicación reproducible incluida.
- Despliegue en dispositivos Intel Core Ultra con NPU: el autor indica soporte vía OpenVINO para la NPU AI Boost, lo que habilita inferencia local de bajo consumo en portátiles.
- Generación de datos sintéticos de texto en inglés: el modelo puede producir corpus de continuación para tareas de aumento de datos, siempre con revisión humana por su naturaleza de modelo base.
- Fine-tuning ligero sobre el checkpoint cuantizado en entornos con recursos limitados: aunque el fine-tuning de modelos GPTQ es más complejo que en bf16, el checkpoint permite experimentar con adaptadores sobre una base de menor huella.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base en bf16; solo se afirma cualitativamente un speedup de 2-3x y una "ligera caída de precisión" en W4G64.

## Requisitos de hardware

- VRAM/espacio en disco: el repositorio ocupa 8,4 GB; en memoria, los pesos INT4 requieren aproximadamente 5-6 GB más overhead de activaciones y caché KV (dependiente de la longitud de contexto, no documentada).
- GPU recomendadas: no se especifican en la model card; al ser formato GPTQ estándar puede cargarse en GPU NVIDIA con transformers y kernels compatibles, aunque el autor lo orienta a hardware Intel.
- Hardware Intel objetivo: CPU Intel con intel-extension-for-pytorch, iGPU Intel Arc (por ejemplo Core Ultra 185H según la receta) y NPU Intel AI Boost en la serie Core Ultra vía OpenVINO.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070), aunque no se confirma en la información proporcionada.
- Opciones de despliegue: transformers (con `device_map="auto"`), intel-extension-for-pytorch, OpenVINO; el tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se detalla.
- Latencia y throughput: no disponibles de forma numérica; solo la afirmación cualitativa de 2-3x de speedup frente a la versión sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-10B-Base-auto_gptq-int4-gs64-sym | 10B nominales (2,16B reales en INT4) | no disponible | INT4 GPTQ W4G64 | apache-2.0 | Hugging Face |
| tiiuae/Falcon3-10B-Base | 10B | no disponible | bf16 (sin cuantizar) | apache-2.0 | Hugging Face |
| Otras cuantizaciones de Falcon3-10B-Base (GGUF, AWQ) | 10B nominales | no disponible | GGUF/AWQ segun variante | apache-2.0 | Hugging Face (segun variante) |

No se dispone en la información proporcionada de datos de rendimiento comparativo entre estas variantes; la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Modelo de tipo *base*: no está alineado para seguir instrucciones ni para diálogo; usarlo como asistente conversacional producirá resultados pobres.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Pérdida de precisión por cuantización: W4G64 introduce degradación respecto al modelo en bf16 (el autor la describe como "ligera" pero sin cuantificar).
- Riesgo de alucinación: inherente a los modelos de lenguaje de completado; no hay mitigaciones documentadas.
- Sesgos: no se documentan análisis de sesgo; el modelo hereda los del corpus de entrenamiento del base, no especificado.
- Longitud de contexto: no documentada en la información disponible, lo que impide planificar despliegues con ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el autor declara que el artefacto se ha desarrollado "solo con fines de investigación" y sin garantía.
- El checkpoint está optimizado para hardware Intel; en otras plataformas el rendimiento puede no aprovechar las ventajas declaradas.
- Fecha de creación futura en los metadatos (2026-11-15): conviene verificar la integridad y procedencia del artefacto antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-10B-Base-auto_gptq-int4-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Base
- Repositorio Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de cuantización: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
