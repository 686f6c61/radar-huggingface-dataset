# mlc-ai/MiniCPM5-2B-q4f32_1-MLC

## Resumen

MiniCPM5-2B-q4f32_1-MLC es la conversión al formato MLC (Machine Learning Compilation) del modelo MiniCPM5-2B desarrollado por OpenBMB, publicada por el equipo de mlc-ai. El paquete está pensado para su ejecución en el navegador mediante WebLLM, la librería de inferencia WebGPU del ecosistema MLC-LLM, lo que permite desplegar un modelo de 2.000 millones de parámetros directamente en el cliente sin backend dedicado.

La relevancia de esta variante concreta radica en su cuantización `q4f32_1`, que no requiere la extensión `shader-f16` de WebGPU y por tanto amplía la compatibilidad con navegadores y GPUs integradas que no exponen esa característica. El paquete declara una ventana de contexto de 131.072 tokens con un tamaño de chunk de prefill de 1.024, aunque la configuración por defecto propuesta para WebLLM limita el contexto a 4.096 tokens para acotar el consumo de memoria.

El modelo base MiniCPM5-2B pertenece a la familia MiniCPM de OpenBMB, orientada a modelos compactos con capacidades de razonamiento. Esta conversión mantiene el modo de razonamiento activado por defecto y hereda los parámetros de muestreo del `generation_config.json` original (temperatura 1,0, top_p 0,95). La ficha del repositorio no incluye detalles sobre arquitectura interna ni datos de entrenamiento, que deben consultarse en la model card del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniCPM5-2B; detalles en la model card de openbmb) |
| Parametros totales | 2B (según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (ventana del paquete); 4.096 tokens por defecto en WebLLM |
| Tipos de cuantizacion | q4f32_1 (grupo de 4 bits con acumulación f32); no requiere `shader-f16` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (MLC-LLM), empaquetado para WebLLM; repo de 1,4 GB |
| Tamaño de chunk de prefill | 1.024 tokens |
| Runtime requerido | WebGPU; WebLLM con runtime `0.28.0-dev2` y candidatos `v0_2_87` |
| Modo razonamiento | activado por defecto; desactivable con `enable_thinking: false` |
| Muestreo por defecto | temperature 1.0, top_p 0.95 |

## Arquitectura y entrenamiento

La información disponible en este repositorio no describe la arquitectura interna del modelo base. Se trata de una conversión de pesos de MiniCPM5-2B al formato MLC mediante `mlc_llm convert_weight` con cuantización `q4f32_1`, seguida de la generación de configuración con plantilla de conversación `minicpm5`, ventana de contexto de 131.072 tokens y chunk de prefill de 1.024. Los detalles sobre tipo de transformer, composición del dataset, número de tokens de entrenamiento y si hubo RLHF/DPO deben consultarse en la model card de `openbmb/MiniCPM5-2B`.

La conversión se realizó con revisiones fijadas del toolchain: TVM en el commit `be03dc94b001` (con un parche local del temporizador Metal) y MLC-LLM en el commit `5e824377af7f`. Las librerías WebGPU se compilaron por separado con las revisiones indicadas en el fichero de procedencia enlazado. El repositorio incluye `mlc-build-info.json` con las revisiones completas y el checksum de los pesos de origen, lo que permite reproducir la conversión. El peso de origen corresponde a la revisión `f97400052a43` del modelo base.

## Capacidades

- Generación de texto en el navegador mediante WebLLM sobre WebGPU.
- Modo de razonamiento activado por defecto, desactivable mediante el parámetro `enable_thinking: false` en el runtime.
- Conversación multi-turno con plantilla `minicpm5` y ventana de contexto de hasta 131.072 tokens en el paquete (4.096 por defecto en WebLLM).
- Ejecución en cliente sin backend: inferencia local en el dispositivo del usuario.
- Compatibilidad con GPUs y navegadores que no exponen `shader-f16`, gracias a la variante `q4f32_1`.
- Capacidades específicas del modelo base (código, matemáticas, tool calling, multilingüismo) no documentadas en este repositorio; consultar la model card de OpenBMB.

## Casos de uso

- Asistentes embebidos en aplicaciones web: el modelo se carga con WebLLM en el navegador del usuario y responde sin enviar datos a un servidor, lo que resulta adecuado para aplicaciones con requisitos de privacidad estrictos.
- Chat de soporte en páginas estáticas: al no requerir backend, puede integrarse en sitios desplegados en CDN y ofrecer respuestas multi-turno con la ventana de contexto configurada (4.096 tokens por defecto).
- Herramientas de escritura y edición en el navegador: generación y reescritura de texto en editores web, con latencia dependiente únicamente del hardware del cliente.
- Prototipado rápido de aplicaciones de IA generativa: permite validar flujos de producto sin provisionar GPUs ni infraestructura de servidor.
- Procesamiento de documentos largos en cliente: con la ventana de 131.072 tokens del paquete (ajustando el límite de memoria en WebLLM) puede resumir o extraer información de documentos extensos sin salir del navegador.
- Demos educativas y de investigación: útil para experimentar con modelos de 2B en entornos WebGPU y comparar el efecto de la cuantización `q4f32_1` frente a variantes que requieren `shader-f16`.
- Aplicaciones offline-first: una vez cacheado el paquete de 1,4 GB, el modelo puede ejecutarse sin conexión en dispositivos compatibles con WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio remite a la model card del modelo base (`openbmb/MiniCPM5-2B`) para evaluaciones y capacidades.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo pesa 1,4 GB y la cuantización es de 4 bits, por lo que la huella de pesos ronda ese orden de magnitud, a lo que hay que sumar el estado KV del contexto configurado.
- GPU recomendadas: no disponibles en la información proporcionada. El requisito funcional es una GPU con soporte de WebGPU; la variante `q4f32_1` no exige `shader-f16`, lo que amplía la compatibilidad a GPUs integradas y a navegadores que no exponen esa extensión.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; depende de la implementación de WebGPU del navegador y del dispositivo.
- Opciones de despliegue: WebLLM (runtime `0.28.0-dev2`, candidatos `v0_2_87`) sobre WebGPU; el toolchain MLC-LLM permite regenerar el paquete con `mlc_llm convert_weight` y `mlc_llm gen_config`.
- Latencia y throughput: no disponibles. La model card indica que el contexto por defecto de 4.096 tokens se elige para limitar el uso de memoria, y que el prefill se realiza en chunks de 1.024 tokens.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La información sobre arquitectura, entrenamiento, idiomas y benchmarks no está incluida en este repositorio; debe consultarse la model card del modelo base antes de evaluar su idoneidad en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en esta ficha.
- Sesgos conocidos: no documentados en la información disponible.
- El contexto por defecto en WebLLM es de 4.096 tokens; ampliarlo hasta los 131.072 tokens del paquete incrementa el consumo de memoria y puede provocar fallos en dispositivos con recursos limitados.
- Requiere un navegador con WebGPU funcional; la disponibilidad y el rendimiento varían significativamente entre plataformas.
- El modo de razonamiento está activado por defecto, lo que incrementa el consumo de tokens generados; debe desactivarse explícitamente con `enable_thinking: false` cuando no sea necesario.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias del runtime (WebLLM, MLC-LLM) antes de desplegar.
- La versión del runtime indicada (`0.28.0-dev2`) es de desarrollo; para producción debe validarse la estabilidad de la combinación de versiones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlc-ai/MiniCPM5-2B-q4f32_1-MLC
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Revisión de pesos de origen: https://huggingface.co/openbmb/MiniCPM5-2B/tree/f97400052a43d642bbc6e9975e2397e3ae6a6b52
- Documentación de WebLLM: https://webllm.mlc.ai/docs/
- Procedencia de librerías WebGPU: https://github.com/JCNTH/binary-mlc-llm-libs/blob/d30ec58c9b0b211a2626ab708a408c7bd59a8369/web-llm-models/v0_2_87/new-models-candidate-provenance.json
- Commit de TVM usado en la conversión: https://github.com/akaashrp/tvm/commit/be03dc94b001269b88ae010d2ac352256be55579
- Commit de MLC-LLM usado en la conversión: https://github.com/JCNTH/mlc-llm/commit/5e824377af7fc959d989ddc52dd44a55c7638f49
