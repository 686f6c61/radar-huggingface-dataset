# bindx-dev/sdxs_512_dreamshaper-sm8975

## Resumen

SDXS-512-DreamShaper para Snapdragon 8 Elite Extreme Gen 6 (SM8975) es una conversión del modelo de difusión texto-a-imagen `IDKiro/sdxs-512-dreamshaper` a binarios de contexto QNN compilados AOT (ahead-of-time) para la NPU Hexagon HTP v85 de Qualcomm. El trabajo lo publica el usuario `bindx-dev` mediante su toolchain BindX QAIRT 2.52.1.261105, que traduce los pesos originales a un formato ejecutable directamente sobre el acelerador neuronal del SoC móvil.

El modelo subyacente es un SDXS de 512x512 destilado a un solo paso (1-step), lo que elimina la necesidad de un bucle de muestreo iterativo y permite generar una imagen completa con una única pasada del UNet. La conversión incluye los tres componentes habituales del pipeline —text encoder, UNet y VAE— empaquetados como binarios `.bin` con cuantización W8A16 (pesos de 8 bits, activaciones de 16 bits).

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue para hardware muy específico. Resulta útil para quien quiera ejecutar generación de imágenes en local sobre un dispositivo Snapdragon 8 Elite sin depender de la nube, y sirve como referencia de latencias reales medidas en NPU (end-to-end de 309–330 ms según el autor).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion (text encoder + UNet + VAE) compilado a binarios de contexto QNN para Hexagon NPU |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, sin contexto de texto extensible documentado) |
| Tipos de cuantizacion | W8A16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible (los prompts dependen del text encoder original, no documentado aqui) |
| Licencia | CreativeML OpenRAIL-M (heredada del modelo base) |
| Formato de pesos | Binarios de contexto QNN (`.bin`): `text_encoder.bin`, `unet.bin`, `vae.bin` |
| Modelo base | `IDKiro/sdxs-512-dreamshaper` |
| Hardware objetivo | SM8975 (Snapdragon 8 Elite Extreme Gen 6, Hexagon HTP v85) |
| Toolchain de conversion | BindX QAIRT 2.52.1.261105 |
| Resolucion de salida | 512x512 |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo base es un SDXS (Stable Diffusion XS), una variante de difusion destilada para generar en un solo paso, lo que reduce drasticamente el coste computacional frente a los pipelines de 20–50 pasos de SD clasico. Esta publicacion no entrena nada: toma los pesos de `IDKiro/sdxs-512-dreamshaper` y los convierte a binarios QNN mediante BindX QAIRT, un proceso de compilacion AOT que fija el grafo a la NPU Hexagon HTP v85 del SM8975.

La cuantizacion aplicada es W8A16, es decir, pesos en entero de 8 bits y activaciones en 16 bits, un compromiso habitual para reducir el uso de memoria y ancho de banda en aceleradores moviles. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo base y no se reproducen en esta model card.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512x512 en un solo paso de difusion.
- Ejecucion sobre la NPU Hexagon del Snapdragon 8 Elite Extreme Gen 6 (SM8975), sin GPU dedicada.
- Carga en frio rapida: 287 ms segun la medicion del autor.
- Inferencia en caliente (warm NPU) de 218,1–221,8 ms.
- Latencia end-to-end de 309–330 ms por imagen.
- Pico de memoria residente (RSS) de 735–748 MB.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento; es exclusivamente generacion de imagenes.

## Casos de uso

- Generacion de imagenes en local en dispositivos moviles con Snapdragon 8 Elite: el pipeline completo (text encoder, UNet y VAE) se ejecuta sobre la NPU con latencias de ~300 ms por imagen, adecuado para funciones de edicion o creacion de contenido dentro de una app sin enviar prompts a servidores externos.
- Prototipado de funciones de IA generativa on-device: util para equipos que quieran evaluar la viabilidad de generacion de imagenes en un SoC concreto antes de invertir en un pipeline propio de conversion QNN.
- Aplicaciones de privacidad estricta: al ejecutarse integramente en el dispositivo, los prompts y las imagenes no salen del terminal, lo que encaja en escenarios regulados (salud, legal, sector publico) donde el envio a la nube es problematico.
- Generacion de miniaturas o avatares en apps de mensajeria: la latencia sub-500 ms y el pico de ~750 MB permiten integrar la generacion como paso interactivo dentro de un flujo de usuario.
- Pruebas de rendimiento y benchmarking de NPU: sirve como referencia reproducible de latencias y consumo de memoria en HTP v85 para comparar con otras conversiones o toolchains.
- Investigacion en destilacion y despliegue movil: permite estudiar el comportamiento de un modelo 1-step cuantizado a W8A16 en NPU frente a la version en punto flotante sobre GPU.
- Generacion de assets en juegos o apps de realidad aumentada en el propio dispositivo, evitando la dependencia de conectividad.

## Benchmarks y rendimiento

El autor publica una medicion propia (QDC Benchmark, 2026-11-25) sobre el hardware objetivo:

| Metrica | Valor |
|---|---|
| Carga en frio | 287 ms |
| Inferencia en caliente (warm NPU) | 218,1–221,8 ms |
| Latencia end-to-end | 309–330 ms |
| Pico de RSS | 735–748 MB |

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: SoC SM8975 (Snapdragon 8 Elite Extreme Gen 6) con Hexagon HTP v85. Los binarios QNN estan compilados AOT para esa NPU concreta y no son portables a otros chips.
- Memoria: pico de RSS de 735–748 MB, por lo que el dispositivo debe disponer de al menos ese margen libre.
- No cabe en GPU de escritorio (A100, H100, RTX 4090) en este formato: los `.bin` no son pesos estandar y requieren el runtime QNN de Qualcomm.
- Opciones de despliegue: runtime QNN de Qualcomm con los binarios de contexto del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~309–330 ms end-to-end por imagen segun el autor; no se documenta throughput en imagenes por segundo bajo carga sostenida.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Pasos | Formato | Licencia | Hardware |
|---|---|---|---|---|---|---|
| bindx-dev/sdxs_512_dreamshaper-sm8975 | Conversion QNN de SDXS | 512x512 | 1 | Binarios QNN | CreativeML OpenRAIL-M | Snapdragon 8 Elite Extreme Gen 6 |
| IDKiro/sdxs-512-dreamshaper | Modelo original | 512x512 | 1 | Safetensors (presumible) | CreativeML OpenRAIL-M | GPU generica |
| Stable Diffusion 1.5 | Difusion clasica | 512x512 | 20–50 | Safetensors | CreativeML OpenRAIL-M | GPU generica |

La comparacion con alternativas desplegadas en NPU movil no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de despliegue, no un modelo nuevo: cualquier mejora o limitacion de calidad de imagen proviene del modelo base `IDKiro/sdxs-512-dreamshaper`.
- Portabilidad nula: los binarios estan compilados AOT para HTP v85 del SM8975; no funcionan en otros Snapdragon ni en GPU de escritorio.
- Resolucion fija de 512x512; no se documenta soporte de otras resoluciones ni de image-to-image.
- La cuantizacion W8A16 puede introducir degradacion de calidad frente a los pesos originales en punto flotante; no se aportan metricas de esa perdida.
- Licencia CreativeML OpenRAIL-M: permite uso comercial pero impone restricciones de uso (prohibicion de generar contenido ilegal, danino o de suplantacion, entre otras); es responsabilidad del integrador revisar y cumplir sus terminos.
- No se documentan sesgos especificos, tasas de alucinacion visual ni limitaciones idiomaticas del text encoder en esta ficha; deben consultarse en la model card del modelo base.
- Modelo con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente de las latencias reportadas.
- El pipeline no esta declarado en Hugging Face, lo que puede complicar la integracion automatica con herramientas del ecosistema.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bindx-dev/sdxs_512_dreamshaper-sm8975
- Modelo base: https://huggingface.co/IDKiro/sdxs-512-dreamshaper
