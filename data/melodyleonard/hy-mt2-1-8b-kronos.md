# melodyleonard/Hy-MT2-1.8B-kronos

## Resumen

Hy-MT2-1.8B-kronos es una compilación del modelo de traducción tencent/Hy-MT2-1.8B al formato propietario `nf4g128` del runtime Kronos, publicada por el usuario melodyleonard. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos: el modelo original de Tencent se cuantiza a NF4 con grupos de 128 y GPTQ con transformada de Hadamard, y se empaqueta en un único archivo `kronos-nf4g128.k2tb` pensado para inferencia en dispositivo (on-device), específicamente para el teclado Translate del mismo autor.

El interés de esta ficha es doble. Por un lado, documenta el modelo base Hy-MT2-1.8B, un transformer denso de 1.800 millones de parámetros especializado en traducción automática. Por otro, describe un artefacto de despliegue muy concreto: un binario cuantizado a 4 bits que ocupa unos 0,9 GB y que solo es utilizable con la librería Kronos, no con los runtimes habituales (transformers, llama.cpp, vLLM).

La relevancia práctica es limitada pero clara: sirve como ejemplo de pipeline de cuantización agresiva orientado a dispositivos con poca memoria, y como alternativa ligera para traducción local en aplicaciones móviles o de escritorio cuando se acepta depender de un runtime específico. La información pública disponible es escasa: la model card se limita a declarar la procedencia, el método de cuantización y la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Hunyuan v1 dense, segun el tag `hunyuan_v1_dense`) |
| Parametros totales | 1.800 millones (1,8B, segun el nombre del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 con grupo de 128 (`nf4g128`), GPTQ con transformada de Hadamard |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `kronos-nf4g128.k2tb` (formato propietario del runtime Kronos); no se distribuyen safetensors ni GGUF |
| Tamano del repositorio | 0,9 GB |
| Libreria requerida | kronos |
| Pipeline | translation |

## Arquitectura y entrenamiento

El modelo base, tencent/Hy-MT2-1.8B, es un transformer denso de 1.800 millones de parámetros perteneciente a la familia Hunyuan (el tag `hunyuan_v1_dense` así lo indica). Está especializado en traducción automática y se distribuye con pipeline `translation`. No se dispone de información pública en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni innovaciones de atención o decodificación.

El artefacto publicado por melodyleonard no reentrena el modelo: aplica una cuantización de pesos a NF4 con tamaño de grupo 128, combinada con GPTQ y una transformada de Hadamard previa para redistribuir la energía de los pesos y reducir el error de cuantización. El resultado se serializa en el formato `kronos-nf4g128.k2tb`, propio del runtime Kronos (repositorio `melodyLeonard/kronos-2t`). Adicionalmente, el `tokenizer.json` se ha minificado. El único cambio declarado respecto al original es la cuantización y el empaquetado; no se documentan ajustes finos ni cambios en el vocabulario.

## Capacidades

- Traducción automática: es la tarea declarada del pipeline y la única capacidad documentada de forma explícita.
- Inferencia en dispositivo: el formato NF4 con grupo de 128 y el tamaño de 0,9 GB están pensados para ejecución local con memoria limitada.
- Integración con el teclado Translate: el artefacto se publica específicamente para esa aplicación, lo que sugiere uso interactivo de traducción en tiempo de escritura.
- Generación de texto multilingüe: plausible por la naturaleza del modelo base, pero no confirmado en la documentación disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Traducción integrada en teclados móviles: el formato NF4 y el tamaño de 0,9 GB permiten cargar el modelo en memoria de un dispositivo móvil de gama alta y traducir mientras el usuario escribe, que es exactamente el escenario para el que se publicó (teclado Translate).
- Traducción local en escritorio sin conexión: aplicaciones de escritorio que necesiten traducir texto sin enviar datos a la nube pueden usar el runtime Kronos con este binario, siempre que acepten la dependencia de esa librería.
- Procesamiento de documentos sensibles: al ejecutarse en local, evita la exposición de contenido confidencial a APIs externas; adecuado para traducción de contratos o informes internos en entornos con requisitos de privacidad.
- Prototipado de funciones de traducción en aplicaciones Electron o Tauri: el tamaño reducido facilita empaquetar el modelo junto con la aplicación y distribuirlo sin infraestructura de servidor.
- Evaluación de pipelines de cuantización: sirve como referencia práctica de cómo afecta NF4 con grupo 128 y Hadamard GPTQ a un modelo de traducción de 1,8B, útil para equipos que diseñen sus propias conversiones.
- Filtrado y pre-traducción de contenido en pipelines de datos: para volúmenes moderados donde no se justifica una GPU dedicada, un modelo de 1,8B cuantizado puede pre-traducir o etiquetar idioma antes de un paso de revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB para los pesos en NF4 (0,9 GB de repositorio) más overhead de activaciones y KV cache; el total dependerá de la longitud de contexto, que no está documentada.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU con al menos 2-4 GB de memoria libre debería poder alojar los pesos, pero el runtime Kronos no documenta backends ni requisitos concretos en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí en la mayoría de tarjetas con 4 GB o más, aunque no hay confirmación oficial.
- Opciones de despliegue: únicamente el runtime Kronos (`melodyLeonard/kronos-2t`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.k2tb` es propietario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy-MT2-1.8B-kronos | 1,8B | no disponible | Apache-2.0 | `.k2tb` (Kronos) | Cuantizado NF4, solo runtime Kronos |
| tencent/Hy-MT2-1.8B (original) | 1,8B | no disponible | Apache-2.0 | safetensors (presumiblemente) | Modelo base sin cuantizar, compatible con transformers |
| Alternativas de traducción de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación más directa es con el propio modelo base: el artefacto Kronos sacrifica compatibilidad con el ecosistema estándar a cambio de un tamaño de 0,9 GB y un formato optimizado para un runtime concreto. Para comparaciones con otros modelos de traducción de 1-2B no hay datos en la documentación disponible.

## Limitaciones y advertencias

- Dependencia total del runtime Kronos: el formato `.k2tb` no es compatible con transformers, llama.cpp, vLLM ni Ollama, lo que limita la portabilidad y aumenta el riesgo de abandono si el proyecto deja de mantenerse.
- Cuantización agresiva a 4 bits: NF4 con grupo de 128 reduce el tamaño, pero puede degradar la calidad de traducción respecto al modelo original; no se publican métricas que cuantifiquen esa pérdida.
- Idiomas soportados no documentados: no se puede confirmar qué pares de idiomas cubre ni con qué calidad.
- Longitud de contexto desconocida: impide planificar el uso en documentos largos o conversaciones multi-turno.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de soporte comunitario o corrección de errores.
- Model card mínima: no hay información sobre sesgos, alucinación, evaluación ni limitaciones declaradas por el autor.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar el `LICENSE.txt` incluido y la licencia del modelo base original de Tencent antes de desplegar en producción.
- Fecha de creación futura en los metadatos (2026-11-09): conviene tratar las fechas del repositorio con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/melodyleonard/Hy-MT2-1.8B-kronos
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- Runtime Kronos: https://github.com/melodyLeonard/kronos-2t
- Teclado Translate: https://github.com/melodyLeonard/translate-keyboard
