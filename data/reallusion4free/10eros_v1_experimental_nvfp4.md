# reallusion4free/10Eros_v1_experimental_nvfp4

## Resumen

10Eros_v1_experimental_nvfp4 es una conversion de cuantizacion NVFP4 del modelo TenStrip/LTX2.3-10Eros, un fine-tune del modelo de generacion de video Lightricks/LTX-2.3. El proyecto, publicado por reallusion4free, tiene como objetivo reducir los requisitos de VRAM del fine-tune original mediante cuantizacion de 4 bits. Segun el README, se trata de una version "Transformer only" que requiere un LoRA de destilacion para funcionar correctamente. El repositorio ocupa 17,6 GB y se distribuye bajo licencia MIT. La conversion se realizo con la herramienta convert_to_quant de silveroxides.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (variante no especificada) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo base TenStrip/LTX2.3-10Eros es un fine-tune de Lightricks/LTX-2.3, un modelo de difusion para generacion de video. Esta version aplica cuantizacion NVFP4, un formato de punto flotante de 4 bits de NVIDIA, unicamente al transformador. El README indica explicitamente "Transformer only, needs distill lora", lo que sugiere que el transformador no es autonomo y requiere un LoRA de destilacion para su uso. No se han proporcionado datos sobre el dataset de fine-tuning, el numero de tokens, procesos de RLHF o DPO, ni otras tecnicas de entrenamiento. La conversion se llevo a cabo con la herramienta convert_to_quant, sin detalles adicionales sobre el proceso.

## Capacidades

- No se han publicado especificaciones detalladas de capacidades en la informacion disponible.
- Al ser una conversion de un fine-tune de LTX-2.3, se espera que herede las capacidades de generacion de video del modelo base, aunque no esta confirmado.
- El modelo es "Transformer only", por lo que no incluye otros componentes del pipeline (por ejemplo, VAE) y necesita un LoRA de destilacion para operar.
- No se dispone de informacion sobre soporte de tool calling, agentes, razonamiento multi-step, vision, audio o idiomas adicionales.

## Casos de uso

- Investigacion en cuantizacion de transformadores de video: este repositorio sirve como referencia para evaluar el impacto de NVFP4 en un modelo de difusion. Los desarrolladores pueden comparar la calidad del video generado frente a la version sin cuantizar, midiendo la degradacion introducida por la cuantizacion.
- Pruebas en GPU de consumo: al estar cuantizado en 4 bits, el modelo reduce el peso del transformer, lo que permite experimentar con el fine-tune en equipos con menos VRAM que los requeridos por la version completa. Esto es util para investigadores sin acceso a hardware de centro de datos.
- Desarrollo de LoRAs de destilacion: el README indica que el modelo necesita un LoRA de destilacion. Este checkpoint puede usarse como punto de partida para entrenar y probar dicho adaptador sobre una base cuantizada, ahorrando recursos durante la experimentacion.
- Generacion de contenido visual personalizado (con el LoRA adecuado): si se conservan las capacidades del modelo base, el modelo podria usarse para crear clips de video cortos en local, sin depender de servicios en la nube. El formato NVFP4 facilita la ejecucion en estaciones de trabajo con una sola GPU.
- Evaluacion de compatibilidad con motores de inferencia: el formato NVFP4 es especifico de NVIDIA, por lo que puede utilizarse para probar la integracion con frameworks que soporten esta cuantizacion, como TensorRT-LLM o vLLM, en entornos de desarrollo.
- Experimentacion con fine-tuning de bajo coste: la cuantizacion permite iterar en ajustes finos por LoRA en entornos con recursos limitados, reduciendo el coste de pruebas antes de aplicar el pipeline a modelos sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no especificada. Dado que es una cuantizacion NVFP4, se espera un menor consumo de VRAM que la version sin cuantizar, aunque no se proporcionan cifras concretas.
- Opciones de despliegue: no disponibles. No se mencionan frameworks como vLLM, llama.cpp, Ollama o TGI en la documentacion. El formato NVFP4 probablemente requiera un motor con soporte para esta cuantizacion, pero no esta confirmado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Cuantizacion | Tamano del repo | Licencia | Necesita LoRA |
|---|---|---|---|---|
| reallusion4free/10Eros_v1_experimental_nvfp4 | NVFP4 | 17,6 GB | MIT | Si |
| TenStrip/LTX2.3-10Eros | No disponible | No disponible | No disponible | No disponible |
| Lightricks/LTX-2.3 | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de parametros para establecer una comparativa mas completa.

## Limitaciones y advertencias

- El modelo es "Transformer only" y requiere un LoRA de destilacion; sin el adaptador adecuado, no es utilizable de forma autonoma.
- Se trata de una version "experimental" con 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido validada por la comunidad.
- El nombre del repositorio y el enlace a civitai.red sugieren que el modelo esta orientado a la generacion de contenido erotico, lo que puede implicar restricciones de uso en determinadas plataformas o jurisdicciones.
- No se han publicado evaluaciones de sesgos, seguridad ni alucinaciones.
- La licencia MIT permite uso comercial, pero el contenido generado puede estar sujeto a politicas de uso de las plataformas de despliegue.
- No se proporcionan datos sobre el contexto, los idiomas soportados ni la calidad de la generacion en escenarios reales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/reallusion4free/10Eros_v1_experimental_nvfp4
- Modelo base TenStrip/LTX2.3-10Eros: https://huggingface.co/TenStrip/LTX2.3-10Eros/tree/main
- Modelo base Lightricks/LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3
- Herramienta de conversion: https://github.com/silveroxides/convert_to_quant
- Enlace en civitai: https://civitai.red/models/2653903/10eros-nvfp4?modelVersionId=2979987
