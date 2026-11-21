# pawanpaudel93/xiaomi-robotics-1-robocasa365-refs

## Resumen

`pawanpaudel93/xiaomi-robotics-1-robocasa365-refs` no es un modelo de IA propiamente dicho, sino un artefacto de referencia (test fixture) para las pruebas del motor `ov-policy` de Cascadia. Contiene un único fichero `xr1.ref.npz` con datos de referencia —historiales de cuatro fotogramas de cámara, un historial de estado de 14 valores, los fotogramas recortados del cliente, dos muestras de ruido y las entradas y salidas (en PyTorch float32) del procesador y el modelo de Xiaomi— que sirven para validar que la implementación OpenVINO reproduce fielmente las salidas del modelo original.

El modelo al que referencia es `XiaomiRobotics/Xiaomi-Robotics-1-RoboCasa365` (Apache-2.0), un modelo de robótica orientado a manipulación en el entorno de simulación RoboCasa365. Este repositorio de referencia no contiene pesos del modelo: su tamaño es de 0,0 GB y las descargas y likes son cero, lo que confirma su naturaleza de fixture interno.

Es relevante únicamente para desarrolladores que trabajen en la cadena de portabilidad a OpenVINO de modelos de política robótica y necesiten verificar numéricamente la equivalencia entre la inferencia PyTorch y la inferencia OpenVINO. No tiene utilidad como modelo generativo ni como política desplegable por sí mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de referencia, no contiene pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada multimodal: 4 fotogramas + estado de 14 valores) |
| Tipos de cuantizacion | no disponible (el fixture almacena salidas de referencia en float32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.npz` (NumPy, fichero `xr1.ref.npz`); no contiene safetensors ni GGUF |

## Arquitectura y entrenamiento

Este repositorio no entrena ni distribuye ningún modelo. Es un conjunto de datos de referencia generado a partir de `XiaomiRobotics/Xiaomi-Robotics-1-RoboCasa365`: incluye las entradas del procesador, las salidas del modelo en PyTorch float32, dos muestras de ruido y los fotogramas recortados tal como los ve el cliente. Las imágenes utilizadas son las muestras LIBERO (`libero_10`, episodio 0) de la model card de `allenai/MolmoAct2-LIBERO`, rotadas para generar cuatro fotogramas distintos; no son renders de RoboCasa.

La arquitectura del modelo subyacente (Xiaomi-Robotics-1) no se detalla en la información disponible. El fixture está pensado para el motor `ov-policy` de Cascadia, que ejecuta políticas robóticas mediante OpenVINO; la comparación se hace contra la variante `pawanpaudel93/xiaomi-robotics-1-robocasa365-fp16-ov`.

## Capacidades

- No es un modelo ejecutable: no genera texto, código ni acciones de robot por sí mismo.
- Proporciona datos de referencia para pruebas de regresión numérica del motor `ov-policy`.
- Permite verificar la equivalencia entre la inferencia PyTorch (float32) y la inferencia OpenVINO (fp16) del modelo Xiaomi-Robotics-1 RoboCasa365.
- Incluye historiales de cuatro fotogramas de cámara y un historial de estado de 14 valores, útiles para validar el preprocesado multimodal.
- Incluye dos muestras de ruido para reproducir la estocasticidad del muestreo de acciones.
- No soporta tool calling, agentes, multilingüismo ni modos de razonamiento.

## Casos de uso

- Pruebas de regresión del motor `ov-policy`: cargar `xr1.ref.npz` en el directorio del modelo y comparar las salidas OpenVINO con las salidas PyTorch de referencia para detectar desviaciones numéricas tras cambios en el motor.
- Validación de la cadena de preprocesado: comprobar que los fotogramas recortados por el cliente y el historial de estado de 14 valores coinciden con los del fixture antes de alimentar la política.
- Verificación de cuantización fp16: medir la diferencia entre las salidas float32 de referencia y las salidas fp16 del modelo OpenVINO para acotar el error introducido por la conversión.
- Integración continua: usar el fixture como caso de prueba determinista en pipelines de CI que validen builds de Cascadia sin necesidad de descargar los pesos completos.
- Depuración de discrepancias de muestreo: emplear las dos muestras de ruido incluidas para reproducir exactamente una ejecución y aislar si una diferencia proviene del ruido o del modelo.
- Documentación de portabilidad: servir como ejemplo reproducible de cómo empaquetar entradas y salidas de referencia para portar modelos de robótica a OpenVINO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el fixture es un fichero `.npz` de tamaño despreciable (repositorio de 0,0 GB) que se carga en memoria del sistema.
- GPU: no requiere GPU para su uso como dato de referencia; la comparación se ejecuta en el hardware donde corra el motor `ov-policy`.
- GPU de consumo: irrelevante para el fixture; los requisitos reales dependen del modelo `xiaomi-robotics-1-robocasa365-fp16-ov` al que referencia, no documentados aquí.
- Despliegue: se descarga en la carpeta del modelo OpenVINO correspondiente; no se sirve con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo | Contenido | Licencia | Uso |
|---|---|---|---|---|
| `pawanpaudel93/xiaomi-robotics-1-robocasa365-refs` | Fixture de test | `xr1.ref.npz` con entradas/salidas de referencia | Apache-2.0 | Validación numérica |
| `pawanpaudel93/xiaomi-robotics-1-robocasa365-fp16-ov` | Modelo convertido | Pesos en OpenVINO fp16 | no disponible | Inferencia de política robótica |
| `XiaomiRobotics/Xiaomi-Robotics-1-RoboCasa365` | Modelo original | Pesos PyTorch | Apache-2.0 | Inferencia de política robótica |
| `allenai/MolmoAct2-LIBERO` | Modelo y datos | Política y muestras LIBERO | Apache-2.0 | Referencia de imágenes de entrada |

## Limitaciones y advertencias

- No es un modelo: no puede desplegarse para inferencia ni sustituye a `Xiaomi-Robotics-1-RoboCasa365`.
- Las imágenes del fixture no son renders de RoboCasa, sino muestras LIBERO rotadas; no representan fielmente el dominio de entrenamiento del modelo original.
- Solo cubre un caso concreto (episodio 0 de `libero_10`); no valida el comportamiento general del modelo.
- Las salidas de referencia están en float32, por lo que las comparaciones contra fp16 requieren tolerancias explícitas.
- El repositorio tiene 0 descargas y 0 likes, sin mantenimiento ni comunidad documentada.
- Licencia Apache-2.0 permite uso comercial del fixture, pero las condiciones del modelo subyacente deben consultarse en su propio repositorio.

## Enlaces

- Repositorio del fixture: https://huggingface.co/pawanpaudel93/xiaomi-robotics-1-robocasa365-refs
- Modelo OpenVINO referenciado: https://huggingface.co/pawanpaudel93/xiaomi-robotics-1-robocasa365-fp16-ov
- Modelo original de Xiaomi: https://huggingface.co/XiaomiRobotics/Xiaomi-Robotics-1-RoboCasa365
- Modelo y muestras LIBERO: https://huggingface.co/allenai/MolmoAct2-LIBERO
