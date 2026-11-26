# myx160/pi05-pap-merged-rtc12

## Resumen

π0.5 PAP merged RTC12 es una política robótica (visión-lenguaje-acción) derivada del modelo base π0.5 de Physical Intelligence, publicada por el usuario myx160 en Hugging Face bajo la librería `openpi`. El modelo está diseñado para generar comandos de control de robot a partir de observaciones visuales e instrucciones, y en esta variante incorpora un esquema de ventana de 12 acciones con 5 comandos absolutos comprometidos y 7 comandos predichos (RTC, *real-time chunking*).

Se trata de un ajuste fino del π0.5 base sobre un dataset propio de 403 episodios (`myx160/pap_1112_1116_merged`), entrenado con FSDP en cuatro tarjetas y batch global de 128. El repositorio se publica como trabajo en curso: el autor indica explícitamente que el entrenamiento no ha terminado y que el primer checkpoint verificado incluirá pesos, estadísticas y un ejemplo de salida con semilla.

Su relevancia es acotada: no es un modelo de propósito general ni un LLM conversacional, sino un artefacto de investigación en robótica con licencia no declarada, cero descargas y sin benchmarks publicados. Resulta interesante para quienes trabajan con el stack `openpi` y quieran reproducir o inspeccionar políticas de acción con ventana temporal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en π0.5; implementación en JAX |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo incluye `runtime/OPENPI_LICENSE` para el código fuente) |
| Formato de pesos | `params/` (JAX), más `config.json`, tokenizer y estadísticas en `assets/` |
| Ventana de acciones | 12 acciones: 5 comandos absolutos comprometidos + 7 predichos |
| Dataset de entrenamiento | `myx160/pap_1112_1116_merged`, 403 episodios |
| Estrategia de entrenamiento | FSDP en 4 tarjetas, batch global 128 |

## Arquitectura y entrenamiento

El modelo parte de π0.5, la política VLA de Physical Intelligence que combina un backbone de visión-lenguaje con un cabezal de generación de acciones. La variante publicada aquí no documenta cambios arquitectónicos respecto al base; la innovación declarada es el esquema de decodificación de acciones: una ventana de 12 pasos en la que 5 comandos se emiten como absolutos comprometidos y 7 se predicen, lo que permite solapamiento entre chunks y control en tiempo real.

El ajuste se realizó sobre un dataset fusionado de 403 episodios con FSDP en cuatro GPUs y batch global de 128. No se especifican el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. El repositorio incluye `checkpoint_info.json` con el paso y el linaje, `INTERFACE.md` con las unidades de entrada y salida, y `runtime/provenance.json` con hashes de origen.

## Capacidades

- Generación de comandos de acción para control robótico a partir de observaciones e instrucciones.
- Decodificación por chunks con ventana de 12 acciones y solapamiento (RTC).
- Inferencia servible mediante `runtime/serve.py` con cliente de ejemplo (`runtime/client_example.py`).
- Verificación de preprocesamiento en CPU (`runtime/verify_preprocessing.py`) y prueba de humo en GPU (`runtime/smoke_infer.py`).
- Entorno reproducible con `uv`, Python 3.11 y paquetes CUDA 12 fijados.
- Soporte de tool calling, agentes, razonamiento multi-paso o capacidades multilingües: no disponible (no es un modelo conversacional).

## Casos de uso

- Investigación en políticas VLA: reproducir el pipeline `openpi` con un checkpoint propio y comparar la preservación de prefijos entre chunks de acción.
- Control de robot con ventana deslizante: usar los 5 comandos comprometidos y los 7 predichos para suavizar transiciones en brazos manipuladores.
- Evaluación de *real-time chunking*: medir cómo afecta el solapamiento de chunks a la latencia de control en un bucle cerrado.
- Validación de preprocesamiento: ejecutar `verify_preprocessing.py` para comprobar que las unidades de entrada coinciden con las de entrenamiento antes de desplegar.
- Despliegue local de un servidor de inferencia: levantar `serve.py` en `127.0.0.1:8000` y conectar un cliente para pruebas de integración.
- Reproducibilidad de entrenamiento: inspeccionar `checkpoint_info.json`, `provenance.json` y `validation.json` para auditar el linaje del modelo y las versiones del entorno.
- Pruebas de humo en CI: usar `smoke_infer.py` con salida `.npz` para comparar formas, valores finitos y preservación de prefijos entre revisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona un ejemplo de salida con semilla en CPU para verificar formas y valores, no métricas de éxito de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se declara el número de parámetros).
- GPU recomendadas: no disponible; el entrenamiento usó cuatro tarjetas con FSDP, sin especificar modelo.
- Compatibilidad con GPU de consumo: no confirmada.
- Entorno: Linux x86_64, Python 3.11, controlador compatible con los paquetes CUDA 12 fijados en `runtime/`.
- Despliegue: servidor propio `runtime/serve.py` con cliente HTTP; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 PAP merged RTC12 | VLA (JAX) | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| π0.5 base (Physical Intelligence) | VLA | no disponible en esta ficha | no disponible | según release del autor original | Referencia del ajuste |
| Otras políticas `openpi` | VLA (JAX) | no disponible | no disponible | variable | Ecosistema `openpi` |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Entrenamiento en curso: el autor advierte de que el primer checkpoint verificado aún no está publicado con pesos, estadísticas y ejemplo sembrado.
- Licencia no declarada: no se puede asumir uso comercial; el repo solo incluye `runtime/OPENPI_LICENSE` para el código.
- Sin benchmarks: no hay evidencia publicada de éxito de tarea ni de generalización.
- Idiomas no declarados: no es un modelo de lenguaje general; las instrucciones en lenguaje natural dependen del tokenizer y de los datos de entrenamiento, no documentados.
- Riesgo de alucinación en el sentido de comandos de acción no válidos: no se documentan salvaguardas.
- Cambios de GPU o de compilador pueden alterar los valores predichos, según el propio autor.
- Cero descargas y cero likes: sin validación comunitaria.
- Dataset de entrenamiento propietario y no descrito en composición ni sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myx160/pi05-pap-merged-rtc12
- Etiquetas de checkpoint: https://huggingface.co/myx160/pi05-pap-merged-rtc12/tags
- Dataset de entrenamiento: https://huggingface.co/datasets/myx160/pap_1112_1116_merged
- Documentación de interfaz: `INTERFACE.md` dentro del repositorio
- Información de checkpoint: `checkpoint_info.json` dentro del repositorio
- Procedencia: `runtime/provenance.json` dentro del repositorio
- Licencia del código fuente: `runtime/OPENPI_LICENSE` dentro del repositorio
