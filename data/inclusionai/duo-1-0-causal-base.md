# inclusionAI/Duo-1.0-causal-base

## Resumen

Duo-1.0-causal-base es un modelo mundial (world model) multimodal de tipo full-duplex desarrollado por inclusionAI, orientado a la generación e interacción en tiempo real de audio y vídeo. Se distribuye como un paquete completo que incluye los pesos de la "realización" (el modelo generativo propiamente dicho), un modelo de intención (Intent) con su adaptador, códecs de vídeo y audio, un reconocedor de voz y un alineador forzado. El objetivo declarado es modelar interacciones recíprocas audio-visuales, es decir, un sistema que percibe y genera simultáneamente en ambos dominios.

La relevancia del modelo reside en su planteamiento causal y full-duplex: frente a los modelos generativos de vídeo que operan por lotes, Duo está diseñado para interacción continua, lo que lo sitúa en la intersección entre generación de vídeo, generación de audio y agentes conversacionales multimodales. La variante publicada es la "causal base", es decir, los pesos base antes de posibles ajustes posteriores.

El repositorio ocupa 153,4 GB y los pesos se distribuyen en formato PyTorch Distributed Checkpoint (DCP). El modelo se inicializó a partir de MiniMax H3 y fue entrenado posteriormente por el equipo de Duo. La información pública disponible sobre arquitectura interna, número de parámetros y contexto es muy limitada, por lo que varios campos de esta ficha se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo mundial multimodal causal, audio-visual; inicializado desde MiniMax H3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (licencia "other", ver LICENSE y NOTICE) |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP); safetensors como tag del repo |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Version | Duo 1.0 |
| Variante | Causal base |
| Empaquetado | Bundle completo (Realization + Intent + codecs + ASR + alineador) |
| Muestreador por defecto | Euler, 50 pasos, flow shift 1.0 |
| Tamano del repo | 153,4 GB |
| Libreria | duo-world-model |
| Fecha de creacion | 2026-11-12 |
| Fecha de actualizacion | 2026-11-13 |

## Arquitectura y entrenamiento

La model card describe Duo como un modelo mundial multimodal full-duplex para interacción audio-visual en tiempo real. El paquete incluye varios componentes diferenciados: los pesos de la "Realization" y su backbone (el modelo generativo principal), un modelo "Intent" con su adaptador, códecs de vídeo y de audio, un reconocedor de voz y un alineador forzado. Esta descomposición sugiere un pipeline en el que la intención del usuario se codifica, se alinea con audio reconocido y se traduce en una realización audio-visual generada de forma causal, con muestreo Euler de 50 pasos y flow shift 1.0 por defecto.

No se especifican en la información disponible el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla la arquitectura interna del backbone (transformer, híbrida u otra), más allá de su carácter causal y multimodal. Los pesos se inicializaron a partir de MiniMax H3 y fueron entrenados posteriormente por el equipo de Duo, según indica el autor. El formato de distribución es PyTorch Distributed Checkpoint, lo que apunta a un modelo de gran tamaño entrenado con paralelismo distribuido.

## Capacidades

- Generación de vídeo condicionada por audio e intención, con un muestreador configurable (Euler, 50 pasos por defecto).
- Generación de audio integrada mediante códecs de audio propios del paquete.
- Interacción full-duplex: el modelo está planteado para percibir y generar simultáneamente, no solo por turnos.
- Reconocimiento de voz (ASR) incluido como componente del bundle.
- Alineación forzada entre audio y transcripción mediante el alineador incluido.
- Modelado de "intención" mediante un modelo Intent y un adaptador dedicados.
- Capacidades de world model: modelado de la dinámica audio-visual para interacción recíproca.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible de forma explícita.
- Capacidades multilingües: no disponible.
- Modo "thinking": no disponible.

## Casos de uso

- Avatares conversacionales en tiempo real: el modelo puede integrarse en un pipeline que reconozca voz (ASR incluido), alinee la transcripción con el audio (alineador forzado) y genere vídeo y audio de respuesta de forma causal, reduciendo la latencia frente a pipelines por lotes.
- Generación de vídeo con audio sincronizado: el paquete incluye códecs de vídeo y audio, por lo que puede emplearse para producir clips donde el habla y el movimiento labial estén alineados, útil en doblaje y localización de contenidos.
- Prototipado de agentes multimodales full-duplex: investigadores pueden usar el modelo Intent y su adaptador para estudiar cómo se traduce una intención de alto nivel en una realización audio-visual concreta.
- Investigación en world models: el modelo sirve como base para experimentar con dinámicas audio-visuales recíprocas, por ejemplo en simulación de entornos interactivos.
- Sistemas de telepresencia y videollamadas sintéticas: la naturaleza full-duplex y causal permite generar respuestas audio-visuales mientras se recibe la entrada del usuario, un requisito habitual en comunicación en tiempo real.
- Análisis y re-síntesis de habla: el reconocedor de voz y el alineador incluidos permiten transcribir y alinear audio para después regenerar vídeo o audio con el modelo generativo, útil en postproducción.
- Evaluación de modelos generativos audio-visuales: al ser una variante "base" causal, es adecuada como punto de partida para comparativas y ajustes finos en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 153,4 GB, por lo que se requiere almacenamiento amplio y, presumiblemente, varios aceleradores para cargar el bundle completo en precisión nativa.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del paquete, un despliegue en una sola GPU de consumo resulta improbable sin cuantización o sharding.
- ¿Cabe en GPU de consumo? No disponible; no se documentan cuantizaciones ni formatos GGUF.
- Opciones de despliegue: el autor remite al repositorio GitHub (inclusionAI/Duo) para instrucciones de integración y runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (world models audio-visuales full-duplex) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La información pública es muy escasa: no se documentan parámetros, contexto, idiomas ni benchmarks, lo que dificulta una evaluación rigurosa previa a producción.
- Riesgo de alucinación y de artefactos audio-visuales inherente a los modelos generativos; no se han publicado evaluaciones al respecto.
- Sesgos conocidos: no disponibles; no se documenta la composición del dataset de entrenamiento.
- Idiomas soportados: no disponibles; el reconocedor de voz incluido puede tener cobertura limitada, pero no se especifica.
- Licencia: minimax-h3-community-license, una licencia "other" heredada de MiniMax H3. Es imprescindible revisar LICENSE y NOTICE antes de cualquier uso comercial; los pesos se inicializaron desde MiniMax H3 y fueron entrenados por el equipo de Duo.
- El bundle incluye múltiples componentes (Intent, códecs, ASR, alineador) con posibles licencias y condiciones propias que deben verificarse por separado.
- El formato DCP complica la carga en herramientas estándar de inferencia; se requiere el código del repositorio oficial.
- No se documentan cuantizaciones, por lo que el despliegue en hardware modesto no está soportado de forma oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/Duo-1.0-causal-base
- Paper (arXiv): https://arxiv.org/abs/2611.15131
- Página del proyecto: https://duo-v1.github.io/
- Colección de modelos: https://huggingface.co/collections/inclusionAI/duo-v1
- Código: https://github.com/inclusionAI/Duo
