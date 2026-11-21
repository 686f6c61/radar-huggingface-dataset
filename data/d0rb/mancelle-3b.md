# d0rb/Mancelle-3B

## Resumen

Mancelle-3B es un checkpoint de ajuste supervisado (SFT) publicado por el usuario d0rb en Hugging Face, etiquetado con los términos `nanochat` y `steering`. Según la model card, se trata de un modelo "encoder-decoder nativo" entrenado hasta el paso 1120, con un 20 % de los ejercicios de vinculación con MC (MC-binding drills) retenidos y un 50 % de dropout de auto-condicionamiento FP. El repositorio ocupa 10,4 GB y el pipeline declarado es `text-generation`.

La información pública disponible es muy escasa: no se especifican parámetros totales, longitud de contexto, idiomas soportados ni licencia. El autor remite a un repositorio de investigación en GitHub (d0rbu/mancelle) para el código de inferencia, los datos de SFT y los resultados de evaluación, así como a un cargador específico de "modelo condicionado" y a un tokenizador RustBPE propio. Esto implica que el modelo no es directamente compatible con runtimes estándar como transformers, vLLM o llama.cpp sin adaptaciones.

Por su naturaleza (checkpoint de investigación con entrenamiento por pasos, dropout de auto-condicionamiento y ejercicios de vinculación), Mancelle-3B parece orientado a experimentación en técnicas de *steering* y condicionamiento, más que a un uso productivo inmediato. La falta de licencia, benchmarks e idiomas declarados limita seriamente su evaluación y adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder nativo (según model card); detalles no disponibles |
| Parametros totales | 3B (implícito en el nombre; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Pesos nativos del checkpoint Mancelle; tokenizador RustBPE; SHA-256 `d401ce09f8ebcb1bb06d78b8169cf0b6a17a0d51137e51eefae781396f5387b9` |

## Arquitectura y entrenamiento

La model card describe Mancelle-3B como un "native encoder-decoder SFT checkpoint" en el paso 1120. El entrenamiento se realizó con un 20 % de los *MC-binding drills* retenidos y un 50 % de *FP self-conditioning dropout*. No se detalla el número total de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El tokenizador es RustBPE, propietario del proyecto, y el runtime requiere un cargador de "modelo condicionado" específico del repositorio de investigación, lo que sugiere mecanismos de enrutamiento de características (*feature routing*) acompañados de estadísticas de características en el directorio de configuración.

La etiqueta `steering` y la mención a *self-conditioning dropout* apuntan a técnicas de control de la generación mediante condicionamiento interno, más que a un transformer estándar entrenado de forma convencional. No se dispone de información sobre innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto (pipeline declarado: `text-generation`).
- Entrenamiento orientado a *steering* y condicionamiento interno (etiqueta `steering`).
- Ejercicios de vinculación con MC (*MC-binding drills*) retenidos parcialmente en el SFT.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en *steering* y condicionamiento: el modelo sirve como banco de pruebas para estudiar cómo el dropout de auto-condicionamiento y el enrutamiento de características afectan a la generación, usando el cargador del repositorio de investigación.
- Reproducción de experimentos del paper: los enlaces a `paper-data-v1` y `paper-evaluations-v1` permiten reproducir el pipeline de SFT y comparar resultados con el checkpoint publicado.
- Estudio de tokenizadores alternativos: el uso de RustBPE permite evaluar el impacto de este tokenizador frente a BPE estándar en tareas de generación.
- Análisis de checkpoints intermedios: al ser un checkpoint del paso 1120, es útil para estudiar la evolución del entrenamiento y el efecto de retener parcialmente los *drills*.
- Docencia y formación en técnicas de SFT: sirve como ejemplo práctico de configuración de dropout y retención de datos en un pipeline de ajuste supervisado.
- Evaluación comparativa de robustez: permite medir la degradación o mejora al reducir el auto-condicionamiento al 50 % en tareas de vinculación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a los resultados de evaluación en el release `paper-evaluations-v1` del repositorio de GitHub, pero no se incluyen cifras en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 10,4 GB, lo que sugiere pesos en precisión alta (posiblemente FP32 o BF16) para un modelo de ~3B. En BF16 cabría estimar del orden de 6-8 GB de pesos, pero no está confirmado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; dependería de si el runtime nativo soporta cuantización, dato no disponible.
- Opciones de despliegue: runtime nativo del repositorio `d0rbu/mancelle` con cargador de modelo condicionado; no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no proporciona comparaciones con otros modelos, y las características del checkpoint (runtime nativo, tokenizador propio, licencia no declarada) dificultan una comparación directa con alternativas estándar de ~3B parámetros.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce si el modelo está entrenado en castellano, inglés u otros idiomas.
- Contexto no declarado: no se puede planificar su uso en tareas de contexto largo.
- Runtime no estándar: requiere el cargador específico del repositorio de investigación, lo que complica la integración con herramientas habituales.
- Riesgo de alucinación: no evaluado; sin benchmarks publicados no hay evidencia sobre su fiabilidad.
- Sesgos conocidos: no documentados.
- Checkpoint de investigación: el paso 1120 y la retención parcial de datos sugieren un modelo no finalizado ni optimizado para producción.
- Ausencia de benchmarks: imposible validar su rendimiento frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/d0rb/Mancelle-3B
- Repositorio de investigación y runtime nativo: https://github.com/d0rbu/mancelle
- Datos de SFT: https://github.com/d0rbu/mancelle/releases/tag/paper-data-v1
- Resultados de evaluación: https://github.com/d0rbu/mancelle/releases/tag/paper-evaluations-v1
