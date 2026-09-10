# ekyra15/vaya-gemma3-1b-it-int4

## Resumen

`ekyra15/vaya-gemma3-1b-it-int4` es una copia sin modificaciones del artefacto LiteRT (`.task`) de Gemma 3 1B IT, publicada por el usuario ekyra15 para que la aplicación Android Vaya pueda descargarla directamente. No se trata de un modelo nuevo ni de un ajuste fino: es una redistribución del build convertido que ya existe en `litert-community/Gemma3-1B-IT`, alojado en un repositorio propio para servir como origen de descarga de una aplicación concreta.

El interés del artefacto es de despliegue, no de investigación: empaqueta un modelo de aproximadamente 1.000 millones de parámetros con pesos cuantizados a 4 bits en un único fichero de 0,6 GB, listo para ejecutarse con LiteRT en el propio teléfono. Según la model card, Vaya lo ejecuta íntegramente en el dispositivo, de forma que nada de lo escrito o dictado sale del terminal, lo que sitúa el caso de uso en el terreno de la inferencia local privada y sin conexión.

La relevancia es por tanto acotada: sirve como ejemplo canónico de distribución de un LLM pequeño en formato LiteRT para Android, pero el repositorio no aporta datos de entrenamiento, no publica benchmarks, no documenta idiomas y, en el momento de redactar esta ficha, no registra descargas ni valoraciones. Todo lo relativo al modelo base (Gemma 3 1B IT de Google) debe consultarse en su ficha original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3; no detallada en este repositorio |
| Parámetros totales | ~1.000 millones (1B), según el modelo base `google/gemma-3-1b-it` |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en este repositorio; el modelo base Gemma 3 1B declara 32.768 tokens |
| Tipos de cuantización | int4 (pesos a 4 bits dentro del artefacto `.task`) |
| Idiomas soportados | no disponible en este repositorio; el modelo base declara soporte multilingüe |
| Licencia | gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | LiteRT `.task` (no hay safetensors ni GGUF en este repositorio) |
| Modelo base | `google/gemma-3-1b-it` (relación declarada: finetune) |
| Tamaño del repositorio | 0,6 GB |
| Librería declarada | litert |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura, datos de entrenamiento, número de tokens, composición del dataset ni etapas de alineación (RLHF, DPO u otras). La model card se limita a indicar que es "una copia sin modificaciones del build LiteRT `.task` de Gemma 3 1B IT" y a enlazar el repositorio de origen. Cualquier dato de arquitectura o entrenamiento corresponde, por tanto, al modelo base `google/gemma-3-1b-it` de Google, cuya ficha oficial es la fuente autorizada, y no a este artefacto.

La única transformación técnica verificable es la conversión a LiteRT y la cuantización a 4 bits, que reduce el peso en disco hasta los 0,6 GB observados. El README no especifica el esquema exacto de cuantización (por ejemplo, granularidad de grupo, calibración o tratamiento de las capas de atención y de embeddings), ni si se aplicó decodificación especulativa u otras optimizaciones de inferencia. Tampoco hay información sobre el tokenizador empleado en el build convertido.

## Capacidades

- Generación de texto conversacional e instrucciones en formato chat (`it`), heredadas del modelo base Gemma 3 1B IT.
- Ejecución totalmente local en el dispositivo, sin envío de datos a servidores, según la model card.
- Funcionamiento sin conexión a red una vez descargado el artefacto.
- Soporte multilingüe: no disponible en este repositorio (el modelo base declara cobertura multilingüe, pero no se detalla aquí).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se documentan en el repositorio.
- Modo "thinking" o razonamiento extendido: no disponible.
- Visión, audio u otras modalidades: no disponibles en este repositorio.
- Integración con Android mediante LiteRT, orientada a la aplicación Vaya.

## Casos de uso

- Asistente conversacional en el propio teléfono: el modelo puede mantener diálogos multi-turno en local, lo que encaja con escenarios de privacidad estricta donde el usuario no quiere que sus mensajes salgan del dispositivo.
- Dictado y transcripción asistida con resumen posterior: una app Android puede transcribir notas de voz y pedir al modelo un resumen o una lista de tareas, todo sin conexión.
- Redacción y reescritura de textos breves (correos, mensajes, notas): el tamaño de 1B y el formato int4 permiten respuestas casi interactivas en un móvil de gama media-alta.
- Traducción y adaptación de textos cortos en el dispositivo: útil en viajes o entornos sin cobertura, siempre que el par de idiomas esté cubierto por el modelo base.
- Clasificación y extracción de información local: etiquetado de notas, detección de intención en comandos de voz o extracción de campos de un texto, sin coste de API y sin latencia de red.
- Prototipado de funciones de IA en aplicaciones Android: sirve como artefacto de referencia para validar el pipeline LiteRT + `.task` antes de decidir un modelo mayor.
- Distribución de un modelo a través de un repositorio propio: el caso real de este repo, que actúa como CDN de un único fichero de 0,6 GB para una app concreta.
- Educación y demos de inferencia on-device: permite mostrar en un taller cómo se ejecuta un LLM cuantizado a 4 bits en hardware móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput, y la model card no aporta ninguna medición. Tampoco se dispone de comparaciones oficiales entre este artefacto int4 y el modelo base en precisión completa.

## Requisitos de hardware

- VRAM/RAM para inferencia: no se especifica en el repositorio. Como referencia, el fichero de pesos ocupa 0,6 GB, por lo que un presupuesto realista en el dispositivo es de aproximadamente 1,0-1,8 GB de RAM incluyendo caché KV de contexto largo; esta cifra es una estimación, no un dato publicado.
- GPU recomendadas: no aplica en el escenario previsto (ejecución en el SoC del teléfono mediante LiteRT). No hay indicaciones sobre despliegue en A100, H100 o RTX 4090 para este artefacto.
- GPU de consumo: el formato `.task` no está pensado para GPUs de escritorio; para ese caso habría que usar los pesos del modelo base en safetensors o una conversión GGUF.
- Cabe en dispositivo móvil: sí, es su objetivo declarado (Android, LiteRT, on-device).
- Opciones de despliegue: LiteRT en Android es la vía documentada. vLLM, llama.cpp, Ollama o TGI no están mencionados en el repositorio y requerirían artefactos distintos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato principal | Rendimiento |
|---|---|---|---|---|---|
| `ekyra15/vaya-gemma3-1b-it-int4` | ~1B | no disponible en el repo (32.768 tokens en el modelo base) | Gemma Terms of Use | LiteRT `.task` int4 | no disponible |
| `google/gemma-3-1b-it` (modelo base) | ~1B | 32.768 tokens según su ficha | Gemma Terms of Use | safetensors | no disponible en esta ficha |
| Llama 3.2 1B Instruct | ~1,2B | 128.000 tokens según su ficha | Llama 3.2 Community License | safetensors, GGUF | no comparado aquí |
| Qwen2.5 1.5B Instruct | ~1,5B | 32.768 tokens según su ficha | Apache-2.0 | safetensors, GGUF | no comparado aquí |

La comparación se limita a parámetros, contexto, licencia y formato, ya que no hay benchmarks publicados para este artefacto. Los datos de los modelos alternativos provienen de sus fichas oficiales y no se han verificado en esta búsqueda.

## Limitaciones y advertencias

- Modelo de 1B parámetros: la tasa de alucinación y la fidelidad factual son limitadas por capacidad, especialmente en tareas de razonamiento largo o conocimiento especializado.
- Cuantización int4: introduce pérdida de precisión respecto al modelo base; el repositorio no documenta ninguna evaluación del degradado.
- Sin benchmarks ni evaluación publicada: no hay evidencia en el repositorio de que el artefacto funcione correctamente más allá de la afirmación de la model card.
- Idiomas no documentados: no se especifica qué lenguas cubre realmente el build, ni si el castellano está entre las mejor soportadas.
- Contexto no verificado en este artefacto: la ventana de 32.768 tokens es un dato del modelo base, no una medición de este build.
- Licencia restrictiva: el uso se rige por Gemma Terms of Use y Gemma Prohibited Use Policy, con las obligaciones de atribución y las limitaciones de uso que imponen; no es una licencia permisiva tipo Apache-2.0.
- Trazabilidad: al ser una copia redistribuida por un tercero, la integridad del binario depende del autor del repositorio; conviene verificar el hash frente al original de `litert-community`.
- Mantenimiento incierto: 0 descargas y 0 valoraciones en el momento de redactar la ficha, sin evidencia de uso o soporte.
- Sesgos: no documentados en el repositorio, pero heredados de los datos de entrenamiento del modelo base de Google.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ekyra15/vaya-gemma3-1b-it-int4
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Origen del build LiteRT: https://huggingface.co/litert-community/Gemma3-1B-IT
- Aplicación Vaya: https://vaya.app
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces recuperados correspondían a un sitio de juego sin relación con el artefacto.
