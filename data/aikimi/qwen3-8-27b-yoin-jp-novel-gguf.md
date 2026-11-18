# Aikimi/Qwen3.8-27B-Yoin-JP-Novel-GGUF

## Resumen

Qwen3.8-27B-Yoin-JP-Novel es un ajuste fino experimental de tipo GGUF orientado a la generación de relatos cortos en japonés. Lo publica el usuario Aikimi partiendo de la versión cuantizada Q4_K_M de mradermacher, que a su vez deriva del modelo de rol japonés de sss22213, basado en Qwen3.8-27B. El modelo conserva los 26.895.998.464 parámetros del original (aproximadamente 27B) y se distribuye en un único fichero GGUF de 16.547.401.632 bytes.

El objetivo declarado es un control narrativo muy concreto: escribir la misma escena de dos maneras distintas, una en la que el motivo se revela al principio y otra en la que el motivo solo se entiende por la acción final. Para ello el autor editó directamente los pesos del bloque 64 de la red (1.899.708 valores) sobre el GGUF ya cuantizado, sin añadir LoRA. Es, por tanto, un experimento de edición selectiva de pesos en un modelo cuantizado, más que un reentrenamiento convencional.

Su relevancia es acotada pero interesante para quien investiga técnicas de post-entrenamiento de bajo coste y para quien trabaja en generación creativa en japonés con despliegue local. No hay métricas publicadas, el repositorio no tiene descargas ni valoraciones, y la model card solo documenta una comprobación cualitativa con llama.cpp sobre una RTX 3090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible como límite oficial; verificado en pruebas con 8.192 tokens |
| Tipos de cuantizacion | Q4_K_M (único fichero publicado) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B, un transformer denso de aproximadamente 27B parámetros; la información disponible no detalla número de capas, dimensión oculta, mecanismo de atención ni composición del corpus original. La cadena de derivación es: Qwen3.8-27B (Qwen) → ajuste de rol japonés NSFW de sss22213 → cuantización Q4_K_M de mradermacher → edición de pesos de Aikimi.

La innovación técnica documentada es la edición directa de pesos sobre el GGUF cuantizado: se modificaron 1.899.708 valores del bloque 64. El autor describe el procedimiento de ajuste como exposición del modelo a pares de la misma escena con estructuras narrativas opuestas (motivo al principio frente a motivo revelado por la acción final). No se especifican tokens de entrenamiento, composición del dataset, ni uso de RLHF o DPO. Tampoco se documenta decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Generación de texto creativo en japonés, con énfasis en relato corto y control de la estructura narrativa (revelación temprana frente a revelación diferida).
- Escritura de ficción breve a partir de consignas con restricciones formales (por ejemplo, límite de frases, prohibición de explicar motivos en diálogo).
- Conversación multi-turno en japonés mediante chat template compatible con llama.cpp.
- Modo de razonamiento ("thinking") activable; el autor lo usa con contexto de 8.192 tokens y hasta 5.120 tokens de generación, contando el razonamiento dentro de ese límite.
- Generación de contenido para adultos cuando se solicita, según advierte la model card del modelo predecesor.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente, razonamiento multi-paso general, visión o audio: no disponibles.

## Casos de uso

- Escritura de microrrelatos en japonés con estructura controlada: el modelo permite pedir la misma escena con el motivo explícito al inicio o resuelto por la acción final, útil para talleres literarios y ejercicios de estilo.
- Generación de borradores para ficción serializada: con 8.192 tokens de contexto verificados puede mantener continuidad de personajes y escenario a lo largo de varios capítulos cortos.
- Prototipado de narrativa interactiva en japonés: integrado en un motor de chat local, genera respuestas de personaje con coherencia de escena para visual novels o juegos de texto.
- Asistencia a guionistas de contenido breve: producción de variantes de una misma escena para elegir la que mejor funciona sin revelar información antes de tiempo.
- Investigación en edición de pesos sobre modelos cuantizados: sirve como caso de estudio reproducible de modificación selectiva de un bloque en GGUF y su efecto cualitativo en la salida.
- Despliegue local en estaciones de trabajo con una sola GPU: al ser un Q4_K_M de 16,5 GB, encaja en entornos con 24 GB de VRAM para generación creativa sin dependencia de servicios en la nube.
- Generación de contenido para adultos en japonés en entornos privados, siempre que se cumplan los requisitos legales y de edad aplicables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una comparación cualitativa con el GGUF de partida usando el mismo prompt y la misma semilla (5471): el modelo original se ejecutó con contexto de 2.048 y 1.780 tokens de generación, mientras que Yoin necesitó contexto de 8.192 y hasta 5.120 tokens. No se aportan métricas automáticas de calidad, perplejidad ni evaluaciones humanas.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa 16.547.401.632 bytes (~15,4 GiB); con overhead de contexto y caché KV para 8.192 tokens conviene reservar del orden de 18-20 GB de VRAM.
- GPU verificada por el autor: RTX 3090 (24 GB) con llama.cpp.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40 GB, H100; cualquier GPU con 24 GB o más permite el despliegue con contexto largo.
- GPU de consumo: cabe en RTX 3090 y RTX 4090; en tarjetas de 16 GB quedaría muy justo o requeriría descarga parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp es el entorno validado (con modo thinking activado); Ollama y otros runners compatibles con GGUF son plausibles pero no están verificados en la información disponible.
- Latencia y throughput: no disponibles; el autor no publica tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Aikimi/Qwen3.8-27B-Yoin-JP-Novel-GGUF | ~26,9B | 8.192 verificado | GGUF Q4_K_M | Apache 2.0 | Relato corto japonés, edición de pesos |
| mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-GGUF | ~26,9B | no disponible | GGUF | Apache 2.0 (según cadena) | Rol japonés NSFW, cuantización estándar |
| sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW | ~26,9B | no disponible | safetensors (presumible) | Apache 2.0 (según cadena) | Ajuste de rol japonés NSFW |
| Qwen/Qwen3.8-27B | ~26,9B | no disponible | safetensors | no disponible en la información | Modelo base generalista |

No se dispone de datos de rendimiento comparado entre estas variantes; la única diferencia documentada es cualitativa y se limita al ejemplo de relato corto de la model card.

## Limitaciones y advertencias

- Entrenado y orientado exclusivamente al japonés; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Es un ajuste fino ligado a una tarea muy estrecha (estructura de relato corto); puede degradar otras capacidades del modelo base, aunque no se han publicado evaluaciones que lo cuantifiquen.
- Riesgo de alucinación no evaluado; no hay métricas de fidelidad ni de consistencia factual.
- El modelo predecesor genera contenido para adultos bajo petición; el repositorio lleva la etiqueta `not-for-all-audiences` y requiere control de acceso por edad y cumplimiento normativo en producción.
- La edición de pesos se realizó sobre un GGUF ya cuantizado (Q4_K_M), lo que limita la precisión del ajuste y hace imposible reconstruir los pesos en otros formatos desde este repositorio.
- Licencia Apache 2.0 declarada, pero conviene verificar la cadena completa de licencias (Qwen3.8-27B, sss22213, mradermacher) antes de un uso comercial, ya que la información disponible no detalla las condiciones de cada eslabón.
- Sin descargas ni validación comunitaria: no hay evidencia externa de calidad ni de estabilidad en despliegues distintos del probado por el autor.
- El límite real de contexto no está especificado; 8.192 tokens es solo la configuración usada en la prueba, no una garantía.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Aikimi/Qwen3.8-27B-Yoin-JP-Novel-GGUF
- Modelo base GGUF (mradermacher): https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-GGUF
- Modelo pre-cuantización (sss22213): https://huggingface.co/sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
