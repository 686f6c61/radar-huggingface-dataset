# javipinochet02/tesis-srl-qwen38-27b-response

## Resumen

`javipinochet02/tesis-srl-qwen38-27b-response` es un adaptador LoRA (PEFT) en español desarrollado por Javier Iván Pinochet Contreras (Universidad de Chile) como parte de la tesis *Agentes de IA Generativa para Autorregulación en Educación Online*. No es un modelo autónomo: se apoya en el modelo base `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`, cargado en 4 bits, y su función concreta es redactar la respuesta del agente tutor a partir de la pregunta del estudiante, el historial de conversación, los fragmentos del curso y el contexto de tutoría.

El sistema del que forma parte separa tres roles con adaptadores distintos —enrutamiento, planificación y respuesta—, y esta ficha documenta únicamente el adaptador de respuesta del paso 55 de optimización. La arquitectura registrada por el autor es `Qwen3_5ForCausalLM`, con rango LoRA 16, alpha 32, rsLoRA activado y dropout 0, entrenado con una longitud máxima de 4.096 *tokens* y la plantilla de conversación nativa con `enable_thinking=false`.

Su relevancia es acotada y de carácter investigador: es un artefacto provisional, entrenado con 733 ejemplos sintéticos y 55 pasos de optimización, cuyo estado es `completed_not_promoted` porque no alcanzó los umbrales de su diagnóstico de desarrollo. Resulta útil como referencia metodológica para quien trabaje en adaptadores educativos en español y en arquitecturas multi-adaptador, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer causal `Qwen3_5ForCausalLM` (modelo base `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`) |
| Parametros totales | No disponible. La denominacion del modelo base indica 27B; el adaptador es LoRA con rango 16 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 *tokens* en entrenamiento. Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | Modelo base cargado en 4 bits (`bnb-4bit`, esquema QLoRA) con adaptador PEFT. No se documentan otros formatos |
| Idiomas soportados | Espanol (`es`) |
| Licencia | No disponible |
| Formato de pesos | Adaptador PEFT (libreria `peft`). Formato de archivo concreto: no disponible |
| Rango LoRA / alpha | 16 / 32 |
| rsLoRA / dropout | Activado / 0 |
| Plantilla de conversacion | Nativa, con `enable_thinking=false` y `preserve_thinking=false` |
| Revision del modelo base y tokenizador | `8aa5f05d26b7205477066e1449e0af13f762a299` |
| Estado del entrenamiento | `completed_not_promoted` |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen3_5ForCausalLM` con PEFT en modalidad QLoRA: el modelo base se carga cuantizado en 4 bits y el ajuste se aplica mediante LoRA de rango 16, alpha 32, rsLoRA activado y dropout 0. El entrenamiento se ejecutó en una única NVIDIA L40S, con *microbatch* de 1, acumulación de gradiente de 16 y tasa de aprendizaje de 5e-5, hasta completar 55 pasos de optimización. La longitud máxima de secuencia fue de 4.096 *tokens* y se empleó la plantilla de conversación nativa con el modo de pensamiento explícitamente desactivado.

Los datos del redactor son sintéticos y específicos de la tarea: 733 ejemplos de entrenamiento y 148 de validación, con contextos de contraste repetidos que elevan la programación a 881 presentaciones (880 procesadas). La autoría combina borradores generados con modelos de lenguaje y anotaciones del autor sobre redacción, guía didáctica y repaso según el contexto semanal. Los datos pasaron por comprobaciones automáticas de estructura, consistencia y separación entre entrenamiento y validación, además de revisión humana de casos representativos. No se documenta RLHF, DPO ni ninguna innovación de decodificación.

## Capacidades

- Redacción de respuestas del tutor en español a partir de cuatro entradas: pregunta del estudiante, historial de conversación, fragmentos del curso y contexto de tutoría.
- Aplicación de una guía didáctica que determina cómo se desarrolla la explicación.
- Generación del repaso inicial de la conversación a partir del estado semanal del estudiante.
- Encaje en un agente multi-rol: el adaptador de respuesta se combina con el adaptador de enrutamiento y el de planificación sobre la misma base.
- Trabajo con la plantilla de conversación nativa del modelo base en modo sin pensamiento explícito.
- Soporte de *tool calling* o *function calling*: no disponible en la información proporcionada.
- Razonamiento multi-paso o modo *thinking*: no disponible; el entrenamiento fija `enable_thinking=false`.
- Capacidades multilingües: únicamente español.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- **Respuesta final de un agente tutor multi-adaptador**: el adaptador ocupa el último eslabón de la cadena (enrutamiento, planificación y respuesta) y redacta la contestación al estudiante combinando el historial y los fragmentos del curso recuperados.
- **Refuerzo del repaso semanal en un curso en línea**: al iniciar la conversación, el adaptador introduce un repaso fundamentado en el estado semanal del estudiante, lo que permite retomar contenidos previos sin intervención manual del docente.
- **Explicaciones alineadas con una guía didáctica**: el sistema permite fijar por indicación cómo debe construirse la explicación (nivel de detalle, orden de ideas, tipo de ejemplo) y el adaptador la reproduce en la respuesta.
- **Simulación de estudiantes para pruebas de sistema**: la demostración asociada permite representar estudiantes ficticios y observar cómo cambia la respuesta del tutor según el contexto, útil para pruebas de regresión del agente antes de tocar datos reales.
- **Investigación en autorregulación del aprendizaje (SRL)**: sirve como componente generativo en experimentos sobre andamiaje de la autorregulación, siempre que se trate como prototipo y no como medición del constructo.
- **Generación de borradores de respuesta en español para anotación**: los investigadores pueden usar las salidas como punto de partida para etiquetado humano o revisión asistida por modelos, dado el dominio educativo en español del adaptador.
- **Base para *fine-tuning* posteriores de bajo coste**: al ser un adaptador LoRA sobre una base cuantizada en 4 bits, puede reentrenarse o sustituirse sin tocar los pesos del modelo base, lo que abarata iteraciones de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente documenta un diagnóstico de desarrollo del paso 55, con umbrales fijados de antemano y resultados por debajo de dichos umbrales:

| Diagnostico de desarrollo (paso 55) | Resultado | Umbral fijado | Estado |
|---|---|---|---|
| Casos con el repaso esperado | 7 de 19 | 16 de 19 | Por debajo del criterio |
| Casos con la aplicacion esperada de la guia didactica | 2 de 12 | 10 de 12 | Por debajo del criterio |

No hay datos publicados de MMLU, HumanEval, GSM8K ni de latencia o *throughput*.

## Requisitos de hardware

- **Entrenamiento documentado**: una NVIDIA L40S (48 GB), con *microbatch* de 1, acumulación de gradiente de 16 y 55 pasos de optimización. Finalizado el 13 de septiembre de 2026 a las 01:39 UTC.
- **VRAM estimada para inferencia (orientativa, no medida por el autor)**: el adaptador solo no es utilizable; requiere cargar el modelo base de 27B en 4 bits, lo que ronda los 14-16 GB de pesos y, con caché KV y *overhead* de activaciones, un consumo total del orden de 18-24 GB según contexto.
- **GPU recomendadas**: L40S, A100 (40 o 80 GB) o H100 para cargas concurrentes; RTX 4090 o RTX 3090 (24 GB) para una única sesión en 4 bits.
- **Viabilidad en GPU de consumo**: probable en tarjetas de 24 GB con la base en 4 bits y contextos moderados; en tarjetas de 16 GB o menos, no disponible con garantías y requeriría cuantizaciones adicionales no documentadas.
- **Opciones de despliegue**: al ser un adaptador PEFT, el camino directo es `transformers` + `peft` sobre la base cuantizada; también es compatible con servidores que aceptan adaptadores LoRA (por ejemplo, vLLM con soporte de LoRA o TGI). El uso en `llama.cpp` u Ollama exigiría fusionar el adaptador y convertir a GGUF, conversión que no se documenta en la información disponible.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

La información disponible solo permite comparar con el propio modelo base. Para alternativas de la misma categoría (adaptadores LoRA educativos en español) no hay datos verificables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `javipinochet02/tesis-srl-qwen38-27b-response` | Adaptador LoRA rango 16 sobre base de 27B | 4.096 *tokens* de entrenamiento | 7/19 y 2/12 en el diagnostico de desarrollo | No disponible | Publico en HuggingFace, 0 descargas |
| `unsloth/Qwen3.8-27B-unsloth-bnb-4bit` (modelo base) | 27B (segun denominacion) | No disponible | No disponible | No disponible | Publico en HuggingFace |
| Otros adaptadores LoRA educativos en espanol | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **Artefacto provisional y no promovido**: el entrenamiento terminó con estado `completed_not_promoted` y los pesos del paso 55 se conservan solo para preparar la demostración, no como versión seleccionada.
- **Objetivos de calidad no alcanzados**: el diagnóstico registró 7 de 19 casos con el repaso esperado (umbral 16 de 19) y 2 de 12 con la aplicación esperada de la guía didáctica (umbral 10 de 12).
- **Sin evidencia de eficacia educativa**: la evaluación disponible corresponde a pruebas del sistema, no a un estudio con estudiantes.
- **Licencia no disponible**: no se puede confirmar el uso comercial ni las condiciones de redistribución de los pesos o de los datos de entrenamiento.
- **Datos de entrenamiento sintéticos**: los ejemplos combinan borradores generados por modelos de lenguaje con indicaciones del autor, por lo que el adaptador puede heredar sesgos y errores del modelo base y de dichos borradores.
- **Riesgo de alucinación**: al redactar explicaciones y repasos, el adaptador puede fabricar contenidos del curso o atribuir estados semanales que no se correspondan con los datos de actividad.
- **Volumen de datos reducido**: 733 ejemplos de entrenamiento y 55 pasos de optimización limitan la cobertura de matices pedagógicos y de formulaciones de estudiante.
- **Restricción de idioma**: solo español; no hay evidencia de comportamiento correcto en otras lenguas.
- **Contexto limitado**: la longitud de entrenamiento es de 4.096 *tokens*, insuficiente para cursos extensos o historiales largos sin estrategias de troceado.
- **No es un modelo autónomo**: depende del modelo base y, en la configuración de demostración, de un adaptador de planificación anterior y del modelo base para el enrutamiento.
- **Interpretación limitada del constructo**: la inferencia se apoya en registros y variables parciales de actividad del curso, lo que no equivale a una medición completa de la autorregulación.
- **Cifras de adopción nulas**: 0 descargas y 0 *likes* en el momento de la consulta, sin comunidad que haya validado el artefacto de forma independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/javipinochet02/tesis-srl-qwen38-27b-response
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Demostración del agente (acceso privado): https://huggingface.co/spaces/javipinochet02/tesis-srl-tutor-demo
- Archivo de casos y evaluaciones: https://huggingface.co/spaces/javipinochet02/tesis-srl-casos
- Trabajo de entrenamiento: https://huggingface.co/jobs/javipinochet02/6aa59ca95527934177ed1181
- Repositorio de artefactos (privado): `javipinochet02/tesis-srl-hf-job-artifacts`, ruta `supervision-cuerpo-posicion-20260912/entrenamiento/final/adaptador/paso-000055`
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos pertenecen a dominios ajenos al proyecto.
