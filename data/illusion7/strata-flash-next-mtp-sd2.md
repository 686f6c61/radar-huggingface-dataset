# illusion7/strata-flash-next-mtp-sd2

## Resumen

Strata Flash-Next MTP SD2 es un drafter de predicción multi-token (MTP) en el formato nativo del motor Strata, diseñado para acelerar la decodificación del modelo Qwen3.8-Flash-Next. No es un modelo generativo autónomo: sus capas densas y de expertos solo proponen tokens candidatos que el modelo principal verifica, de modo que la salida final no cambia respecto a la del modelo base. Lo publica el usuario illusion7 y deriva del drafter auto-destilado de Basalt para Qwen/Qwen3.8-Flash-Next, cuyo componente experto proviene del propio bloque MTP del modelo.

La pieza diferencial es que su parte densa se ha reajustado a Swift (ukisai/Swift-Qwen3.8-Flash-Next) mediante auto-destilación sobre las propias salidas de Swift, por lo que los pesos son modificados. El autor reporta una mejora de aproximadamente un 3 % en borradores mantenidos por ronda en modo offline y de en torno a un 3 % en decodificación con temperatura 1 sobre una GPU AMD Radeon RX 7900 XTX. El repositorio ocupa 0,8 GB y se distribuye bajo la Swift Open License v1.0 junto con la Qwen Community License 1.0.

Su relevancia es acotada pero concreta: permite reducir la latencia de decodificación de Flash-Next en el motor Strata sin tocar la calidad del texto generado, algo útil para despliegues de inferencia donde el cuello de botella es el número de pasos de decodificación. La información pública disponible es escasa y no incluye datos sobre arquitectura interna, parámetros totales ni benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | capa drafter de predicción multi-token (MTP) en formato propio del motor Strata; componentes denso y de expertos; arquitectura interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 y Qwen Community License 1.0 |
| Formato de pesos | dense.bin, dense.txt, experts.bin, draft_vocab.bin (formato nativo de Strata, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El artefacto es una capa de borrador MTP que se carga en el motor Strata mediante la opción `--mtp DIR`. Su parte de expertos procede del bloque MTP original del modelo Qwen/Qwen3.8-Flash-Next, heredado del drafter auto-destilado de Basalt. La parte densa se ha reajustado al modelo Swift (ukisai/Swift-Qwen3.8-Flash-Next) mediante auto-destilación sobre las salidas del propio Swift, lo que convierte estos pesos en modificados respecto al original.

El mecanismo es de decodificación especulativa: el drafter propone varios tokens por paso y el modelo principal valida cada uno, de forma que la salida es idéntica a la del modelo base y la ganancia se limita a la velocidad. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset de destilación ni el uso de RLHF o DPO. El autor publica los scripts de ajuste y las configuraciones de ejecución en el repositorio llamacpp-tuner, bajo `engines/strata/` y `experiments/flash-next/mtpfit/`.

## Capacidades

- Aceleración de decodificación especulativa del modelo principal Qwen3.8-Flash-Next en el motor Strata.
- Propuesta de múltiples tokens por paso de decodificación, validados posteriormente por el modelo principal.
- Integración con el motor Strata mediante carga directa del directorio de borrador.
- No genera texto de forma autónoma: requiere el modelo principal para producir la salida final.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento propios.
- Capacidades multilingües no disponibles como dato independiente; dependen del modelo base.

## Casos de uso

- Servicio de inferencia de baja latencia con Flash-Next: cargar el drafter con `--mtp DIR` en Strata para reducir el número de pasos de decodificación en cargas interactivas, manteniendo la salida del modelo principal.
- Despliegue en hardware AMD consumer: el autor valida el artefacto en una Radeon RX 7900 XTX, por lo que encaja en entornos con GPU AMD donde interesa exprimir el throughput sin cambiar de modelo.
- Generación de texto por lotes (batch) en modo offline: el autor reporta un aumento de aproximadamente el 3 % en borradores mantenidos por ronda, útil en pipelines de generación masiva donde la latencia agregada importa.
- Chat con temperatura 1: el autor reporta en torno a un 3 % de mejora en decodificación con temperatura 1, escenario típico de asistentes conversacionales.
- Experimentación en decodificación especulativa: sirve como base para probar y ajustar drafters MTP en Strata, con scripts de ajuste publicados en el repositorio del motor.
- Evaluación de pipelines de auto-destilación: el artefacto documenta un flujo de reajuste de la parte densa sobre las salidas de un modelo destino, reutilizable para adaptar drafters a otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de aceleración relativas sobre una Radeon RX 7900 XTX:

| Metrica | Resultado reportado |
|---|---|
| Borradores mantenidos por ronda (offline) | +3 % |
| Decodificación con temperatura 1 | +3 % |
| Calidad de salida | sin cambios (el modelo principal valida cada token) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,8 GB en disco, pero el requisito real depende del modelo principal Qwen3.8-Flash-Next.
- GPU recomendadas: no disponibles; el autor valida el artefacto en una AMD Radeon RX 7900 XTX.
- Compatibilidad con GPU consumer: validado en una RX 7900 XTX; no hay datos para otras GPU consumer.
- Opciones de despliegue: exclusivamente el motor Strata (`--mtp DIR`); no es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles como valores absolutos; solo se reportan mejoras relativas de aproximadamente un 3 %.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Aceleración reportada |
|---|---|---|---|---|
| Strata Flash-Next MTP SD2 | drafter MTP para Flash-Next, reajustado a Swift | nativo Strata | Swift Open License 1.0 + Qwen Community License 1.0 | ~+3 % en borradores y decodificación a temperatura 1 (RX 7900 XTX) |
| Drafter auto-destilado de Basalt para Qwen3.8-Flash-Next | drafter MTP original | nativo Basalt | no disponible | no disponible |
| Qwen3.8-Flash-Next sin drafter | modelo principal sin decodificación especulativa | según distribución del modelo base | Qwen Community License 1.0 | referencia base (sin aceleración) |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con otras alternativas de decodificación especulativa.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo principal Qwen3.8-Flash-Next y el motor Strata no produce salidas utilizables.
- Formato propietario del motor Strata; no se puede cargar en ecosistemas estándar como vLLM, llama.cpp, Ollama o TGI.
- Pesos modificados respecto al drafter original de Basalt; el comportamiento puede diferir del artefacto de referencia.
- Las mejoras reportadas son modestas (en torno al 3 %) y medidas en un único hardware (RX 7900 XTX); no hay datos de generalización a otras GPU.
- Riesgo de alucinación y sesgos: no aplica de forma directa, ya que el modelo principal valida cada token; cualquier sesgo proviene del modelo base.
- Licencia restrictiva para uso comercial: organizaciones con ingresos brutos superiores a 1 millón de dólares necesitan una Swift Enterprise License de UkisAI (sección 5 de la licencia).
- Se aplican además los términos de la Qwen Community License 1.0; conviene revisar `NOTICE` y `LICENSE-QWEN` antes de desplegar.
- Sin datos publicados sobre idiomas soportados, contexto efectivo ni cuantizaciones disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/illusion7/strata-flash-next-mtp-sd2
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Repositorio del motor y scripts de ajuste: https://github.com/blackhat-7/llamacpp-tuner
- Drafter original de Basalt: https://github.com/jesdga95/basalt
