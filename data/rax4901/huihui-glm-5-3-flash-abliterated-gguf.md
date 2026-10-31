# rax4901/Huihui-GLM-5.3-Flash-abliterated-GGUF

## Resumen

Huihui-GLM-5.3-Flash-abliterated-GGUF es una versión "abliterated" (sin filtros de seguridad) del modelo GLM-5.3-Flash de zai-org, publicada por el usuario rax4901 en Hugging Face a partir de los trabajos de huihui-ai y unsloth. El modelo original es un modelo multimodal (image-text-to-text) de la familia GLM 5.3, y esta variante aplica la técnica de abliteration para eliminar las capas responsables de los rechazos ante solicitudes sensibles, generando un modelo sin censura.

La abliteration se ha aplicado de forma selectiva: solo a las capas 15 a 35 (con indexación base 0), dejando el resto de capas y todos los módulos de expertos (experts) intactos. Esto sugiere que el modelo base es de tipo MoE (mixture of experts), aunque la model card no lo detalla explícitamente. Los pesos se distribuyen en formato GGUF con cuantizaciones tipo UD (como Q4_K_XL), procedentes del repositorio unsloth/GLM-5.3-Flash-GGUF, y el tamaño total del repositorio es de 1559 GB.

Su relevancia actual radica en que llama.cpp ya soporta oficialmente la arquitectura GLM-5.3-Flash (rama glm5next/upstream de unsloth), lo que permite ejecutar este modelo de más de 320.000 millones de parámetros localmente mediante cuantización, algo especialmente relevante para usuarios que buscan modelos sin restricciones de seguridad para investigación o experimentación controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (posiblemente MoE, por la mención a "expert modules"; no confirmado) |
| Parametros totales | 320.759.404.382 (aprox. 320,76 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según el comando de ejemplo de llama.cpp) |
| Tipos de cuantizacion | GGUF con cuantizaciones UD (se documenta UD-Q4_K_XL; el resto de variantes no se detalla) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (multi-archivo, 6 partes en la variante Q4_K_XL) |

## Arquitectura y entrenamiento

El modelo base, GLM-5.3-Flash de zai-org, es un modelo multimodal de la familia GLM clasificado con el pipeline image-text-to-text, lo que indica capacidad de procesar tanto texto como imágenes. La model card menciona "expert modules" que permanecen intactos tras la abliteration, lo que apunta a una arquitectura de tipo mixture of experts (MoE), aunque no se publican cifras de parámetros activos ni detalles del número de expertos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información proporcionada.

La innovación principal de esta variante no es arquitectónica sino de alineamiento: se aplica abliteration, una técnica que identifica y neutraliza las direcciones de rechazo en las activaciones del modelo para eliminar los comportamientos de negación sin reentrenamiento. En este caso, el proceso es selectivo: solo las capas 15 a 35 (indexación base 0) han sido abliteradas, mientras que el resto de capas y todos los módulos de expertos permanecen sin modificar. Los GGUF provienen de unsloth/GLM-5.3-Flash-GGUF e incluyen imatrix (matriz de importancia para cuantización), lo que suele mejorar la calidad de las cuantizaciones bajas.

## Capacidades

- Generacion de texto conversacional en ingles y chino (tag conversational).
- Comprension de imagenes y texto (pipeline image-text-to-text), heredada del modelo base multimodal.
- Contexto largo de hasta 262.144 tokens segun la configuracion de ejemplo de llama.cpp.
- Compatibilidad con el ecosistema GGUF: ejecucion local via llama.cpp (rama oficial o PR de unsloth), con soporte reciente anadido a la release oficial de llama.cpp.
- Ausencia de filtros de seguridad: el modelo no rechaza solicitudes sensibles por diseno (abliterated/uncensored).
- No se dispone de informacion sobre soporte de tool calling, function calling ni capacidades de agentes en la documentacion proporcionada.

## Casos de uso

- Investigacion en alineamiento y seguridad: al ser un modelo sin filtros, permite estudiar comportamientos del modelo sin la interferencia de los mecanismos de rechazo, util para red teaming y analisis de robustez.
- Experimentacion con abliteration selectiva: este repositorio es un ejemplo practico de como abliterar solo un subconjunto de capas (15-35) preservando los expertos, util como referencia para investigadores de interpretabilidad.
- Ejecucion local de un modelo grande sin censura: mediante GGUF cuantizado (Q4_K_XL) y llama.cpp, usuarios con hardware adecuado pueden desplegar el modelo en local sin depender de APIs.
- Procesamiento multimodal offline: analisis de imagenes y texto en entornos sin conexion, aprovechando el pipeline image-text-to-text del modelo base.
- Pruebas de contexto largo: con 262.144 tokens de ventana, permite experimentar con documentos extensos, analisis de repositorios de codigo o conversaciones muy largas en local.
- Generacion de contenido creativo sin restricciones: escritura de ficcion o material que los modelos con filtros suelen rechazar, siempre en entornos controlados y legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 1559 GB en total; la variante UD-Q4_K_XL se distribuye en 6 archivos GGUF, por lo que se estima que esa cuantizacion ocupa varios cientos de GB en disco (cifra exacta no disponible).
- VRAM/RAM estimada para inferencia: no disponible con precision; un modelo de ~320 B de parametros en Q4_K_XL requiere tipicamente mas de 180-200 GB de memoria combinada (VRAM + RAM), lo que apunta a estaciones multip GPU o servidores con CPU de alta memoria.
- GPU recomendadas: no disponible en la documentacion; dada la escala, serian necesarias configuraciones tipo multi-GPU (varias A100/H100 o RTX 6000) o descarga parcial a CPU con llama.cpp (offloading de capas).
- Consumer GPU: no es viable ejecutar el modelo completo en una unica GPU de consumo; solo seria posible con offloading agresivo a RAM en equipos con mas de 256 GB de memoria.
- Despliegue: llama.cpp es el metodo documentado (rama oficial reciente o PR de unsloth en glm5next/upstream). Ejemplo documentado:
  ```
  llama-cli -m GLM-5.3-Flash-UD-Q4_K_XL-00001-of-00006.gguf -c 262144
  ```
  No se menciona soporte para vLLM, TGI u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Formato | Licencia | Caracteristica distintiva |
|---|---|---|---|---|
| Huihui-GLM-5.3-Flash-abliterated-GGUF (este) | 320,76 B | GGUF (UD, imatrix) | MIT | Abliterado (sin filtros), multimodal |
| zai-org/GLM-5.3-Flash (base) | 320,76 B | safetensors | MIT | Modelo original con filtros de seguridad |
| unsloth/GLM-5.3-Flash-GGUF | 320,76 B | GGUF | MIT | GGUF cuantizados sin abliterar, origen de los archivos de este repo |

No se conocen alternativas abliteradas comparables de la misma familia con datos suficientes para una comparacion de rendimiento; no disponible.

## Limitaciones y advertencias

- Riesgo de salidas sensibles o inapropiadas: al haberse reducido significativamente el filtrado de seguridad, el modelo puede generar contenido ofensivo, controvertido o peligroso. Se recomienda revision manual rigurosa de las salidas.
- No apto para todos los publicos: el contenido generado puede ser inadecuado para entornos publicos, menores de edad o aplicaciones que exijan alta seguridad.
- Responsabilidad legal y etica del usuario: el uso debe cumplir la legislacion local; el usuario asume las consecuencias del contenido generado. Huihui.ai declina cualquier responsabilidad.
- Uso recomendado solo en investigacion o entornos controlados: se desaconseja explicitamente su uso en produccion o aplicaciones comerciales orientadas al publico.
- La abliteration es una prueba de concepto "cruda" segun el propio autor: puede degradar la calidad del modelo, y al haberse aplicado solo a las capas 15-35, el comportamiento sin filtros puede ser inconsistente en ciertos temas.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Requisitos de hardware muy elevados: con ~320 B de parametros, la ejecucion local exige infraestructura considerable.
- Riesgo de alucinacion: inherente a cualquier LLM y posiblemente agravado por la eliminacion de los mecanismos de alineamiento; no hay datos cuantitativos disponibles.
- Licencia MIT: sin restricciones para uso comercial del modelo en si, pero las advertencias de seguridad del autor desaconsejan el despliegue comercial directo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rax4901/Huihui-GLM-5.3-Flash-abliterated-GGUF
- Modelo base (zai-org/GLM-5.3-Flash): https://huggingface.co/zai-org/GLM-5.3-Flash
- GGUF originales de unsloth: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Repositorio de abliteration (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- PR de unsloth para llama.cpp (rama glm5next/upstream): https://github.com/unslothai/llama.cpp/tree/glm5next/upstream
- Ko-fi de huihui.ai (soporte al proyecto): https://ko-fi.com/huihuiai
