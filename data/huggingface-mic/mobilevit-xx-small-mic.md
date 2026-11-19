# huggingface-mic/mobilevit-xx-small-mic

## Resumen

`mobilevit-xx-small-mic` es un artefacto de test publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo entrenado para uso real, sino un fixture reducido ("slim fixture") que reproduce la estructura y los pesos del checkpoint `apple/mobilevit-xx-small`, un clasificador de imagenes basado en la arquitectura MobileViT. El repositorio incluye los pesos reducidos, un manifiesto de contrato (`integration.json`), ejemplos de uso con Transformers y un directorio de expectativas de framework, pensados para validar la integracion del modelo en Transformers y en pipelines de test.

Con 1.276.136 parametros, el fixture se mantiene por debajo del umbral de 20 millones a partir del cual la herramienta de construccion conserva la fuente completa, de modo que en este caso se han copiado los pesos entrenados originales sin modificarlos. El modelo esta etiquetado explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos a produccion.

Su relevancia es, por tanto, instrumental: sirve para verificar contratos de integracion, reproducibilidad de pesos y comportamiento numerico (float32, bfloat16, float16) en el ecosistema Transformers, no para tareas de clasificacion reales en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileViT (vision transformer hibrido con convoluciones), clase `MobileViTForImageClassification` |
| Parametros totales | 1.276.136 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32 y verificados en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | no disponible en la informacion proporcionada; el repo incluye un fichero `LICENSE` copiado byte a byte de `apple/mobilevit-xx-small` |
| Formato de pesos | safetensors |
| Modelo base | `apple/mobilevit-xx-small` |
| Tipo de artefacto | test-artifact (fixture de integracion) |
| Tamano del repo | 0.0 GB |
| Descargas | 2915 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo subyacente es MobileViT, una arquitectura hibrida que combina capas convolucionales con bloques de atencion tipo transformer para clasificacion de imagenes, disenada originalmente por Apple para eficiencia en dispositivos moviles. La clase de cabecera es `MobileViTForImageClassification`.

Este repositorio concreto no entrena nada nuevo: es un fixture generado con `build_fixtures.py` del proyecto `transformers-mic`. Segun la model card, al tener 1,3 millones de parametros (por debajo del umbral de 20 millones), se conservan los pesos entrenados originales del checkpoint `apple/mobilevit-xx-small` sin reducirlos, con los mismos nombres de tensores que el checkpoint real. Los ficheros de procesador (`preprocessor_config.json`, `LICENSE`, `.DS_Store`) se copian byte a byte desde el modelo base. Los pesos pasaron una puerta de sensibilidad a la entrada (el caso mas debil, `pixel_values:swap_channels`, con valor 0,552) y se verifico que son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture esta identificado con la clave `24a318619111` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el proceso de reduccion.

No hay informacion sobre volumen de datos de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) para el modelo base en la informacion proporcionada.

## Capacidades

- Clasificacion de imagenes (cabecera `MobileViTForImageClassification`), heredada del modelo base `apple/mobilevit-xx-small`.
- Verificacion de contratos de integracion con Transformers mediante `integration.json` y el directorio `integrations/transformers/expectations`.
- Ejecucion de pruebas de reproducibilidad de pesos y de comportamiento numerico en float32, bfloat16 y float16.
- Validacion de sensibilidad a la entrada (gate `pixel_values:swap_channels`).
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un artefacto de vision para test.
- No es un modelo usable en produccion; esta etiquetado como `test-artifact`.

## Casos de uso

- Validacion de integraciones de Transformers: usar el fixture para comprobar que la clase `MobileViTForImageClassification` carga correctamente y produce salidas esperadas en un pipeline de CI, gracias a su tamano reducido y a la presencia de expectativas de framework en el repo.
- Pruebas de regresion numerica: ejecutar forward, loss y gradientes en float32, bfloat16 y float16 para detectar rupturas de compatibilidad en nuevas versiones de la libreria, ya que la model card confirma que los pesos son finitos en esas tres precisiones.
- Test de pipelines de preprocesado: los ficheros de procesador se copian byte a byte del modelo base, por lo que el fixture permite validar la logica de `preprocessor_config.json` sin descargar el checkpoint completo.
- Desarrollo de la herramienta `transformers-mic`: sirve como caso de prueba del script `build_fixtures.py` y del proceso de "shrink" documentado en el enlace de procedencia.
- Verificacion de nombres de tensores: al conservar los mismos nombres que el checkpoint real, permite comprobar mapeos de pesos y conversiones de formato en herramientas de serializacion.
- Docencia y ejemplos minimos: util para demostrar el flujo de carga de un modelo de vision en Transformers con un artefacto de ~1,3 M de parametros y repo de tamano practicamente nulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 para 1,3 M de parametros; el modelo cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU consumer (por ejemplo, series GTX/RTX de gama baja) o CPU es suficiente para ejecutar el fixture.
- Cabe en consumer GPU: si, en todas las gamas.
- Opciones de despliegue: carga mediante Transformers (`MobileViTForImageClassification`); no se documentan opciones de vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada (son herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/mobilevit-xx-small-mic` | 1.276.136 | Clasificacion de imagenes (fixture de test) | no aplica | no disponible | Hugging Face, 2915 descargas |
| `apple/mobilevit-xx-small` | no disponible en la informacion proporcionada | Clasificacion de imagenes | no aplica | no disponible | Hugging Face (modelo base) |
| Otros fixtures de `huggingface-mic` | no disponible | Test de integracion | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de test (`test-artifact`), no un modelo para uso real; no debe emplearse en produccion ni en tareas de clasificacion reales.
- No se han documentado sesgos, pero al derivar del checkpoint `apple/mobilevit-xx-small` hereda los del modelo base, sobre los que no hay informacion en la ficha.
- Riesgo de alucinacion no aplicable en el sentido de generacion de texto; el riesgo es de comportamiento numerico inesperado fuera de los casos cubiertos por las expectativas de framework.
- La licencia no esta indicada en la informacion proporcionada; el repo incluye un fichero `LICENSE` copiado del modelo base, que conviene revisar antes de cualquier uso.
- No soporta idiomas ni texto: es exclusivamente un modelo de vision.
- Los pesos se conservan sin reducir porque el checkpoint ya esta por debajo del umbral de 20 M de parametros; el fixture no representa una version comprimida del modelo base.
- El proceso de reduccion cubre solo checkpoints con ficheros de procesador identicos byte a byte y config coincidente, lo que limita su aplicabilidad a variantes con procesadores distintos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/mobilevit-xx-small-mic
- Modelo base: https://huggingface.co/apple/mobilevit-xx-small
- Procedencia del fixture (como se redujo): https://huggingface-mic-mic-coverage.static.hf.space/shrink/mobilevit-xx-small-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
