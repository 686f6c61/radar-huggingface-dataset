# Mhmadhassnz/cosmos-humanizer-gguf

## Resumen

Cosmos Humanizer es un modelo de lenguaje de difusión de 8B parámetros, desarrollado por Mhmadhassnz a partir de iLLaDA-8B (GSAI-ML), un modelo base de difusión enmascarada (masked diffusion). Su propósito es muy concreto: tomar texto generado por IA y reescribirlo para que lea como texto humano, conservando los hechos y datos originales, con el objetivo declarado de evadir detectores de texto generado como Pangram, GPTZero y Copyleaks.

A diferencia de la mayoría de "humanizadores", que son paraphrasers autoregresivos (Llama, Qwen, GPT) con un prompt encima, Cosmos se apoya en una arquitectura de difusión enmascarada que genera de forma bidireccional y no deja la huella izquierda-a-derecha que los detectores suelen explotar. El autor lo ha ajustado con un dataset propio de unas 160.000 parejas de reescrituras IA → humano y lo publica en formato GGUF para su ejecución local con llama.cpp bajo licencia Apache-2.0.

Su relevancia actual radica en ser, según el autor, el único humanizador open source que supera Pangram en sus pruebas (17 de 21 ensayos leídos como humanos, con una puntuación media de humanidad del 81%). Es un modelo nicho, en inglés, con 686 descargas y 3 likes en el momento de redactar la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión enmascarada (masked diffusion LLM, basado en iLLaDA) |
| Parametros totales | 7.615.025.152 (~8B) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (cuantizaciones concretas no detalladas en la model card) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp); modelo base original en safetensors |

## Arquitectura y entrenamiento

Cosmos se construye sobre iLLaDA-8B, un modelo de lenguaje de difusión enmascarada. En lugar de generar tokens secuencialmente de izquierda a derecha, parte de un "lienzo" donde todas las posiciones están enmascaradas y, a lo largo de varios pasos de denoising, rellena las máscaras que resuelve con más confianza, en cualquier orden. Cada token se decide viendo el contexto completo (bidireccional), lo que según el autor elimina el ritmo predecible de siguiente-token que explotan los detectores de IA y permite reestructurar frases libremente sin perder nombres, cifras ni hechos.

El ajuste fino se realizó sobre un dataset propio de aproximadamente 160.000 parejas de reescrituras (texto de IA → texto humano), entrenado en una NVIDIA RTX PRO 6000. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición completa del dataset ni el uso de técnicas como RLHF o DPO. Como particularidad práctica, el muestreo por difusión es estocástico: dos ejecuciones con el mismo texto producen reescrituras distintas, y el autor recomienda reintentar con otra semilla si un resultado no pasa un detector.

## Capacidades

- Reescritura / humanización de texto generado por IA, preservando los hechos, nombres y cifras del original.
- Parafraseo y transferencia de estilo hacia escritura de apariencia natural.
- Generación bidireccional por difusión enmascarada: rellena el texto completo en paralelo en lugar de token a token.
- Generación estocástica: cada pasada produce una variante distinta, útil para reintentos.
- Ejecución local y cuantizada mediante llama.cpp (GGUF).
- Etiquetado como conversacional (pipeline text-generation), aunque su diseño está especializado en reescritura.
- No hay soporte documentado de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Humanización de ensayos académicos: reescribir textos generados con IA para que superen detectores como Pangram o GPTZero, manteniendo las citas y datos del original (el ejemplo de la model card reescribe un ensayo sobre microfinanzas con puntuación 100% humano).
- Reescritura de contenido editorial: pulir borradores producidos por LLM para blogs o newsletters, dándoles un ritmo menos predecible sin editar a mano.
- Parafraseo masivo de documentación: convertir salidas de modelos autoregresivos en variantes con estilo propio en pipelines de generación de contenido.
- Evasión de detección en flujos de trabajo de escritura asistida: insertar el modelo como paso de post-procesado tras un LLM generador.
- Ejecución privada en local: al distribuirse en GGUF, puede usarse sin enviar texto a servicios externos, relevante para texto sensible.
- Experimentación con LLMs de difusión: sirve como ejemplo práctico y cuantizado de la familia iLLaDA para probar generación bidireccional en llama.cpp.

## Benchmarks y rendimiento

No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Los únicos datos disponibles son mediciones del propio autor sobre detectores de IA:

| Detector | Resultado | Fuente |
|---|---|---|
| Pangram | 17 de 21 ensayos leídos como humanos; 81% de puntuación media de humanidad | ejecución registrada por el autor (seed 0, una pasada) |
| GPTZero | leído como humano en más del 85% de las ejecuciones | pruebas del autor |
| Copyleaks | leído como humano en el 100% de las ejecuciones | pruebas del autor |

Estos resultados son autoreportados, sin metodología externa verificable, y deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~7,6B de parámetros en GGUF, una cuantización Q4 ocupa en torno a 4,5-5 GB y una Q8 unos 8 GB, más el overhead de contexto; con 8-10 GB de VRAM debería caber íntegramente en GPU (estimación basada en el tamaño típico de GGUF para 8B, no en datos publicados).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090); el entrenamiento del autor se hizo en una RTX PRO 6000, pero para inferencia no se necesita hardware de datacenter.
- Consumer GPUs: sí, cabe cómodamente en GPUs de gama media-alta gracias al formato GGUF y la cuantización.
- Despliegue: llama.cpp es el runtime indicado por la model card; no se menciona soporte para vLLM, TGI u Ollama (la generación por difusión requiere soporte específico de la familia iLLaDA en llama.cpp).
- Latencia y throughput: no disponible. La generación por difusión enmascarada requiere múltiples pasos de denoising, por lo que el perfil de latencia difiere del de un LLM autoregresivo; no hay cifras publicadas.

## Comparativa con modelos similares

| Característica | Cosmos Humanizer (iLLaDA-8B) | iLLaDA-8B (base) | Humanizadores típicos open source (basados en LLM autoregresivos) |
|---|---|---|---|
| Parametros | ~8B (7,6B) | ~8B | variable (7B-13B habitualmente) |
| Arquitectura | Difusión enmascarada | Difusión enmascarada | Transformer autoregresivo |
| Entrenamiento específico | 160k parejas IA → humano (dataset propio) | Preentrenamiento genérico | Suele ser prompt engineering o fine-tuning ligero |
| Formato | GGUF | safetensors | variable |
| Licencia | Apache-2.0 | no disponible en esta ficha | variable |
| Resultados en Pangram | 17/21 leídos como humanos (autoreportado) | no disponible | el autor afirma que ninguno de los alternativos open source supera Pangram |

## Limitaciones y advertencias

- Solo inglés: el modelo está etiquetado exclusivamente para inglés; su comportamiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Resultados autoreportados: las cifras de Pangram, GPTZero y Copyleaks provienen del propio autor, sin auditoría independiente; los detectores evolucionan y una tasa de evasión actual puede degradar rápidamente.
- Muestreo estocástico: el resultado no es determinista; el propio autor recomienda varias pasadas con distintas semillas, lo que implica que no hay garantía de que una reescritura pase un detector.
- Riesgo de alucinación: no hay datos publicados sobre fidelidad factual de las reescrituras; aunque el objetivo declarado es conservar los hechos, no existe una métrica verificada de conservación de datos.
- Uso ético y legal: el propósito explícito del modelo es evadir detectores de texto generado; su uso para presentar trabajo generado por IA como humano (académico, profesional, periodístico) puede infringir normas institucionales, condiciones de servicio o normativas de transparencia de contenido IA.
- Longitud de contexto no documentada: no se especifica cuánto texto puede procesar por pasada.
- Sin soporte documentado de tool calling, agentes ni capacidades multimodales.
- Soporte de runtime limitado: al ser un modelo de difusión, requiere un llama.cpp con soporte para la arquitectura iLLaDA; no es un GGUF estándar de Llama y puede no funcionar en herramientas genéricas.
- Uso comercial: la licencia Apache-2.0 lo permite, pero el repo marca `inference: false` en Hugging Face (sin inference API alojada).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mhmadhassnz/cosmos-humanizer-gguf
- Modelo base iLLaDA-8B: https://huggingface.co/GSAI-ML/iLLaDA-8B-Base
- GitHub del autor: https://github.com/Moha2005269
- Perfil del autor en X: https://x.com/Mhmadhassnz
