# mlc-ai/MiniCPM5-2B-q4f16_1-MLC

## Resumen

MiniCPM5-2B-q4f16_1-MLC es la versión cuantizada y empaquetada para MLC-LLM y WebLLM del modelo MiniCPM5-2B de OpenBMB. Se trata de una conversión de pesos realizada por el equipo de mlc-ai que permite ejecutar el modelo de 2.000 millones de parámetros directamente en el navegador mediante WebGPU, sin necesidad de servidores intermedios. El paquete incluye la configuración de generación con una ventana de contexto declarada de 131.072 tokens, aunque la configuración por defecto de WebLLM la limita a 4.096 tokens para contener el consumo de memoria.

La relevancia de esta ficha radica en que demuestra la viabilidad de desplegar modelos de razonamiento de tamano medio en entornos de cliente (navegador), con modo de razonamiento activado por defecto y capacidad de desactivarlo mediante el flag `enable_thinking: false`. El repositorio ocupa 1,4 GB y emplea la cuantización `q4f16_1`, que combina pesos de 4 bits con activaciones en FP16 y requiere la extensión `shader-f16` de WebGPU.

El modelo base pertenece a la familia MiniCPM5 de OpenBMB, orientada a generación de texto y razonamiento. Esta conversión concreta está pensada para el ecosistema WebLLM y no incluye la model card completa del modelo original, por lo que las capacidades detalladas deben consultarse en el repositorio upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniCPM5-2B; transformer segun la familia MiniCPM, sin confirmar en la informacion proporcionada) |
| Parametros totales | 2B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (ventana del paquete); 4.096 tokens por defecto en WebLLM |
| Tipos de cuantizacion | q4f16_1 (pesos 4 bits, activaciones FP16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLC (compilado para WebGPU / WebLLM); repo de 1,4 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) empleadas en el modelo base. La model card de esta conversión remite explicitamente a la model card upstream de `openbmb/MiniCPM5-2B` para esos detalles.

La innovacion tecnica de este repositorio es el pipeline de conversion a MLC-LLM: los pesos se convierten con `mlc_llm convert_weight` usando la cuantizacion `q4f16_1` y se genera la configuracion con `mlc_llm gen_config`, plantilla de conversacion `minicpm5`, `context-window-size 131072` y `prefill-chunk-size 1024`. Las librerias WebGPU se compilan por separado con revisiones fijadas (TVM `be03dc94b001`, MLC-LLM `5e824377af7f`) y se documenta la procedencia en `mlc-build-info.json`. El modo de razonamiento viene activado por defecto; los valores de muestreo por defecto son temperatura 1,0 y top_p 0,95, heredados del `generation_config.json` upstream.

## Capacidades

- Generacion de texto en el navegador mediante WebLLM y WebGPU.
- Modo de razonamiento activado por defecto, desactivable con `enable_thinking: false`.
- Procesamiento de contexto largo: ventana declarada de 131.072 tokens con prefill en fragmentos de 1.024 tokens.
- Ejecucion local en cliente, sin dependencia de API remota.
- Soporte de tool calling, agentes o capacidades multimodales: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistentes conversacionales en navegador: el modelo puede gestionar dialogos multi-turno directamente en el cliente, eliminando la latencia de red y manteniendo la privacidad de los datos del usuario, gracias a la ejecucion local via WebLLM.
- Procesamiento de documentos largos en el navegador: con la ventana de 131.072 tokens del paquete y el prefill en fragmentos de 1.024 tokens, es posible resumir o consultar documentos extensos sin enviarlos a un servidor, ajustando el limite de contexto en funcion de la memoria disponible.
- Aplicaciones web de demostracion y prototipado: util para equipos que quieran mostrar capacidades de IA generativa en una pagina web sin infraestructura de backend, aprovechando que el paquete ya esta compilado para WebGPU.
- Razonamiento asistido en herramientas educativas: el modo de razonamiento por defecto permite generar cadenas de razonamiento paso a paso para explicar problemas, y puede desactivarse para respuestas rapidas.
- Procesamiento por lotes en el cliente: escenarios donde el usuario necesita clasificar, resumir o reescribir textos sin conexion permanente a un servidor, con el modelo cargado en memoria del navegador.
- Integracion en extensiones o aplicaciones de escritorio basadas en web: cualquier entorno con WebGPU y soporte de `shader-f16` puede alojar el modelo, lo que facilita su inclusion en herramientas de productividad offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 1,4 GB en cuantizacion `q4f16_1`; el consumo real en el navegador depende del contexto configurado y del runtime WebGPU.
- Requiere una GPU con soporte de WebGPU y de la extension `shader-f16`; sin esta caracteristica el modelo no funciona.
- GPU de escritorio recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible de forma explicita; el diseno apunta a ejecucion en navegador, lo que implica GPUs integradas o dedicadas con WebGPU moderno.
- Opciones de despliegue: WebLLM (runtime `0.28.0-dev2` y candidatos `v0_2_87` segun la procedencia indicada); MLC-LLM como toolchain de conversion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La ventana de contexto efectiva en WebLLM es de 4.096 tokens por defecto, muy inferior a los 131.072 tokens del paquete; ampliarla incrementa el consumo de memoria.
- Requiere WebGPU con `shader-f16`; navegadores o dispositivos sin esta extension no pueden ejecutar el modelo.
- El modo de razonamiento esta activado por defecto, lo que incrementa el numero de tokens generados y la latencia si no se desactiva explicitamente.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni limitaciones idiomaticas del modelo base en esta ficha; deben consultarse en la model card upstream.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `openbmb/MiniCPM5-2B` en su repositorio original.
- El repositorio no incluye evaluaciones propias; los datos de calidad deben tomarse del modelo upstream, no de esta conversion.
- Al ser una conversion de pesos, cualquier cambio en el modelo base o en las revisiones del toolchain puede alterar el comportamiento; se recomienda fijar revisiones en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlc-ai/MiniCPM5-2B-q4f16_1-MLC
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Revision concreta del modelo base: https://huggingface.co/openbmb/MiniCPM5-2B/tree/f97400052a43d642bbc6e9975e2397e3ae6a6b52
- Documentacion de WebLLM: https://webllm.mlc.ai/docs/
- Commit de TVM usado en la conversion: https://github.com/akaashrp/tvm/commit/be03dc94b001269b88ae010d2ac352256be55579
- Commit de MLC-LLM usado en la conversion: https://github.com/JCNTH/mlc-llm/commit/5e824377af7fc959d989ddc52dd44a55c7638f49
- Procedencia de librerias WebGPU: https://github.com/JCNTH/binary-mlc-llm-libs/blob/d30ec58c9b0b211a2626ab708a408c7bd59a8369/web-llm-models/v0_2_87/new-models-candidate-provenance.json
