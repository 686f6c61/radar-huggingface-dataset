# ELAINAy/InfraOCR

## Resumen

InfraOCR es una distribución de los binarios QNN HTP (Qualcomm AI Engine) del modelo SoMark OXR-1.0, preparada para ejecutarse de forma nativa en NPUs de Snapdragon dentro de la aplicación Android InfraOCR. El repositorio no es un checkpoint de entrenamiento, sino un paquete de despliegue on-device: contiene context binaries compilados con QAIRT 2.51.40.260930 para varios SoCs de gama alta de Qualcomm, junto con las tablas de embeddings, vocabulario, prompts fijos y los APKs de la app.

El modelo base, OXR-1.0 de SoMarkAI, es un pipeline de análisis y parsing de documentos que combina un detector de layout (D-FINE B2), un encoder visual (SigLIP2-NaViT) y un decodificador de lenguaje Qwen3-0.6B cuantizado a pesos de 8 bits. Su relevancia radica en que permite OCR y extracción estructurada de documentos completamente local en un móvil, sin enviar datos a la nube, con latencias medidas de unos 145 ms por bloque visual y 45-60 tokens por segundo en el Snapdragon 8 Elite Gen 6 Pro.

Se trata de un proyecto de nicho con cero descargas registradas en el momento de la ficha, pero técnicamente interesante para desarrolladores que necesiten parsing de documentos con privacidad garantizada en dispositivos Android de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multimodo: D-FINE B2 (detector de layout) + SigLIP2-NaViT (encoder visual) + Qwen3-0.6B (decodificador autorregresivo) |
| Parametros totales | no disponible (el decodificador LLM es de 0.6B; el tamaño del encoder visual no se detalla) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (usa un prefijo de chat fijo con KV cache precalculado) |
| Tipos de cuantizacion | FP16 (detector y encoder visual), W8/A16/KV8 (LLM), W8 (lm_head), F32 (embeddings auxiliares) |
| Idiomas soportados | no disponible |
| Licencia | OXR license (Apache-2.0 con terminos adicionales de SoMark) |
| Formato de pesos | QNN HTP context binaries (.bin) para QAIRT; no distribuye safetensors ni GGUF |

## Arquitectura y entrenamiento

InfraOCR no es un modelo entrenado en si mismo, sino la cuantizacion y compilacion de OXR-1.0 para NPUs Snapdragon. El pipeline consta de tres etapas. Primero, un detector de layout D-FINE B2 procesa la pagina a 960x960 pixeles en FP16 y segmenta la pagina en bloques. Segundo, un encoder visual SigLIP2-NaViT con cabeza visual procesa cada bloque con una embedding de posicion de vision de 32x32, con soporte de NaViT para bloques de tamano variable (padded a 1024 o 3600 patches). Tercero, un decodificador Qwen3-0.6B cuantizado (pesos W8, activaciones A16, KV cache de 8 bits) genera el texto estructurado, usando grafos separados de prefill AR-16 y decode AR-1 para optimizar la latencia en NPU.

Un detalle de ingenieria destacable es que el prefijo de chat es fijo: su K/V cache se precalcula y distribuye en el archivo `prefix_kv.f32`, ahorrando computo en el dispositivo. La tabla de embeddings corresponde a Qwen3, y el vocabulario se distribuye como mapeo id-a-bytes en `vocab.bin`. No hay informacion sobre el proceso de entrenamiento de OXR-1.0 (tokens, datasets, RLHF/DPO) en la documentacion disponible.

## Capacidades

- Deteccion de layout de documentos: segmentacion de paginas en bloques (texto, tablas, figuras y otros elementos) mediante D-FINE B2 a resolucion 960x960.
- Parsing y OCR de documentos: transcripcion y estructuracion del contenido de cada bloque mediante el encoder visual y el decodificador LLM.
- Ejecucion totalmente on-device: todo el pipeline corre en la NPU HTP de Snapdragon, sin conexion a servicios en la nube.
- Inferencia optimizada: grafos AR-16 para prefill y AR-1 para decode, con KV cache de prefijo precalculado.
- Actualizacion en la app: la carpeta `app/` incluye APKs y un mecanismo de actualizacion via `latest.json`.
- Soporte multi-SoC: binarios compilados para Snapdragon 8 Elite Gen 5, 8 Elite Gen 6 y 8 Elite Gen 6 Pro.
- Tool calling, agentes y capacidades multilingues: no disponible (no se documenta).

## Casos de uso

- Digitalizacion de documentos con privacidad: escaneo de contratos, DNI, facturas o historiales medicos en el dispositivo sin que los datos salgan del movil, ideal para sectores regulados (salud, legal, banca).
- OCR en aplicaciones field-service: tecnico que fotografía esquemas, etiquetas de infraestructura o partes de trabajo y obtiene texto estructurado sin cobertura de red.
- Extraccion de datos de facturas y recibos: parsing local de tickets para apps de gestion de gastos personales o empresariales.
- Procesamiento de formularios en zonas sin conectividad: captura de formularios en campo (inspecciones, inventarios) con conversion a texto estructurado offline.
- Prototipado de apps Android con IA local: el paquete sirve de referencia para integrar pipelines multimodales cuantizados en NPUs Snapdragon con QAIRT.
- Accesibilidad: lectura de documentos impresos para usuarios con discapacidad visual, directamente desde la camara del telefono.

## Benchmarks y rendimiento

Datos medidos por el autor contra la referencia bf16 sobre 495 bloques de 40 paginas de OmniDocBench, en un SM8975 (Snapdragon 8 Elite Gen 6 Pro):

| Metrica | Valor |
|---|---|
| Vision: exact match a nivel de bloque vs bf16 | 99,5 % |
| LLM: exact match vs bf16 | 97-98 % |
| Latencia por bloque visual | ~145 ms |
| Velocidad de decodificacion | 45-60 tokens/s |

No se han publicado comparativas con otros modelos de OCR en la informacion disponible.

## Requisitos de hardware

- Dispositivo objetivo: smartphone con NPU Snapdragon HTP. Los binarios estan compilados para SoCs concretos:
  - SM8850: Snapdragon 8 Elite Gen 5
  - SM8950: Snapdragon 8 Elite Gen 6
  - SM8975: Snapdragon 8 Elite Gen 6 Pro
- No es ejecutable en GPU de escritorio ni en hardware no-Qualcomm con estos artefactos; para otros entornos habria que partir del modelo base SoMarkAI/OXR-1.0.
- Stack de software: Qualcomm QAIRT SDK 2.51.40.260930 (o compatible) para cargar los context binaries en la HTP.
- Espacio en dispositivo: el repositorio completo pesa 13,3 GB (incluye binarios para tres SoCs y APKs); cada instalacion individual usa solo los ficheros de su SoC.
- Despliegue: integrado en la app InfraOCR (APK incluido con actualizaciones via `latest.json`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y no es aplicable al ser formato QNN propietario.
- Rendimiento medido en SM8975: ~145 ms por bloque visual y 45-60 tokens/s de decode.

## Comparativa con modelos similares

| Modelo | Arquitectura | Despliegue | Licencia |
|---|---|---|---|
| InfraOCR (OXR-1.0 QNN) | D-FINE B2 + SigLIP2-NaViT + Qwen3-0.6B | NPU Snapdragon on-device (QNN) | OXR license (restricciones de ingresos y API alojada) |
| Qwen2.5-VL / Qwen3-VL (versiones pequenas) | Vision transformer + LLM Qwen | GPU/servidor, GGUF, vLLM | Apache-2.0 |
| SmolDocling (IBM) | Docling pipeline con VLM compacto | GPU/servidor, ONNX | CDLA-Permissive-2.0 |
| GOT-OCR 2.0 | Encoder visual + decoder optimizado | GPU/servidor | Model license restringida |

InfraOCR se diferencia de las alternativas en que es la unica opcion de la lista con despliegue nativo en NPU movil; las demas requieren GPU de servidor o hardware x86/ARM con runtimes genericos. A cambio, su licencia es mas restrictiva que Apache-2.0.

## Limitaciones y advertencias

- Restriccion de licencia importante: el uso comercial sin licencia separada de SoMark solo esta permitido a entidades (y afiliadas) con como maximo 2 millones de USD de financiacion acumulada y 2 millones de USD de ingresos en el ultimo ejercicio fiscal.
- Prohibicion de ofrecer el modelo como API alojada de document parsing, OCR, layout o extraccion.
- Los binarios solo funcionan en los tres SoCs Snapdragon listados; no hay soporte para otros dispositivos ni para CPU/GPU generica con estos artefactos.
- La cuantizacion W8/A16/KV8 introduce una pequena degradacion (97-98 % de exact match frente a bf16 en el LLM).
- El prefijo de chat es fijo, lo que limita la flexibilidad de prompting frente al modelo base.
- No hay informacion publicada sobre idiomas soportados, sesgos, tasas de alucinacion ni benchmarks comparativos con otros OCR.
- Repositorio con 0 descargas y 1 like en el momento de redactar la ficha: madurez y mantenimiento sin historial verificable.
- No disponible: pipeline tag en HuggingFace, numero de parametros del encoder visual, longitud de contexto y detalles de entrenamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ELAINAy/InfraOCR
- Modelo base: https://huggingface.co/SoMarkAI/OXR-1.0
- Licencia: https://huggingface.co/ELAINAy/InfraOCR/blob/main/LICENSE
- Paper, demo o repositorio de codigo fuente: no disponible
