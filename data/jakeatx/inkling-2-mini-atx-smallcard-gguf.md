# jakeatx/Inkling-2-Mini-ATX-SmallCard-GGUF

## Resumen

Inkling-2-Mini-ATX-SmallCard-GGUF es una cuantizacion en formato GGUF del modelo base Inkling-2-Mini, desarrollado por Thinking Machines. La publica el usuario jakeatx y esta especificamente optimizada para tarjetas graficas de la generacion Ampere (RTX 30-series) con 8, 10 o 12 GB de VRAM. El modelo base es una arquitectura de mezcla de expertos (MoE) con 26.070.388.352 parametros totales, orientada a generacion de texto conversacional.

La innovacion principal de esta publicacion no reside en el modelo en si, sino en el formato de despliegue: utiliza una bifurcacion de llama.cpp denominada llamAmpere (v0.7.4 o superior), que mantiene los expertos del MoE en memoria del sistema y cachea en VRAM los expertos mas utilizados. El tamano de esa cache se ajusta automaticamente segun la VRAM libre, y la cache KV emplea un formato de 4 bits (K 4-bit, V 4-bit). Esto permite ejecutar un modelo de 26.000 millones de parametros en tarjetas consumer de gama media-baja, algo inviable con llama.cpp estandar.

Se ofrecen dos variantes: una de 3,7 bits por peso (12,21 GB) para tarjetas de 8 y 10 GB, y otra de 4,2 bits por peso (13,58 GB) para tarjetas de 12 GB. Ambas alcanzan contextos de entre 212.992 y 262.144 tokens, con divergencia KL frente a la referencia BF16 de 0,0155 y 0,0107 respectivamente. La licencia es Apache 2.0, igual que el modelo base, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, segun los tags del repositorio; detalles internos del modelo base no disponibles |
| Parametros totales | 26.070.388.352 |
| Parametros activos | no disponible |
| Longitud de contexto | 212.992 tokens (preset 8 GB); 262.144 tokens (presets 10 GB y 12 GB) |
| Tipos de cuantizacion | GGUF a 3,7 bits por peso (12,21 GB) y 4,2 bits por peso (13,58 GB); cache KV en 4 bits (K 4-bit, V 4-bit) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere llamAmpere, no carga en llama.cpp estandar) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura de mezcla de expertos (MoE), tal como indican los tags del repositorio. El dato disponible es el numero total de parametros (26.070.388.352), pero no se especifica cuantos estan activos por token, cuantos expertos contiene la red ni como se enrutan. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento; esa informacion corresponderia a la model card del modelo base, que no se ha proporcionado.

La contribucion tecnica de esta publicacion es el esquema de despliegue de llamAmpere: los expertos residen en RAM del sistema y una cache en VRAM retiene los mas usados, con tamano calculado automaticamente a partir de la VRAM sobrante. La cache KV usa cuantizacion de 4 bits tanto en claves como en valores. Los presets (`--preset 8ink`, `10ink`, `12ink`, con variante `-headless`) configuran de forma conjunta el contexto, el formato KV, el offload de expertos y la cache de expertos en VRAM. Si otros programas ocupan mas VRAM de la prevista, el servidor reduce primero el contexto y lo notifica al arrancar. La calidad se mide mediante divergencia KL frente a la referencia BF16 sobre Wikitext (12 fragmentos de 2.048 tokens): 0,0155 para la variante de 3,7 bpw y 0,0107 para la de 4,2 bpw.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y el tag `conversational` confirma su orientacion a dialogo.
- Razonamiento y generacion de texto de proposito general, heredados del modelo base (no se detallan capacidades especificas adicionales).
- Procesamiento de contexto largo: hasta 262.144 tokens en los presets de 10 y 12 GB, y 212.992 tokens en el de 8 GB.
- Servidor compatible con la API de OpenAI: llama-server expone un endpoint OpenAI-compatible en `http://127.0.0.1:8080`, lo que habilita integraciones con clientes existentes.
- Solo texto: el repositorio no incluye proyector de vision, por lo que no admite entrada multimodal.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con GPU de 8 a 12 GB: el modelo puede mantener dialogos multi-turno con contexto muy largo (hasta 262.144 tokens) sin depender de servicios en la nube, gracias al esquema de offload de expertos a RAM.
- Analisis de documentos extensos: con 212.992-262.144 tokens de ventana, cabe procesar informes, expedientes o bases de codigo completas en una sola pasada; el prefill medido (719-968 tok/s) permite digerir prompts de 100.000 tokens en un tiempo razonable.
- Prototipado de aplicaciones sobre la API de OpenAI: al exponer llama-server un endpoint compatible, se puede sustituir un proveedor remoto por esta instancia local cambiando la URL base, util para desarrollo sin coste por token.
- Despliegue en equipos con RTX 3060, 3080 o similares: los presets de 8, 10 y 12 GB estan calibrados para estas tarjetas, lo que permite ofrecer inferencia de un MoE de 26.000 millones de parametros en hardware consumer de gama media.
- Generacion de resumenes y reescritura de textos largos: la combinacion de contexto amplio y decodificacion de 30-46 tok/s es adecuada para tareas por lotes donde la latencia no es critica pero el volumen de contexto si.
- Entornos con requisitos de privacidad: al ejecutarse integramente en local (con expertos en RAM del sistema), los datos no salen del equipo, lo que encaja en escenarios con datos sensibles y licencia Apache 2.0 para uso comercial.
- Experimentacion e investigacion: la publicacion incluye metricas de divergencia KL y checksums SHA-256, lo que facilita reproducir evaluaciones de calidad de cuantizacion en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente aporta metricas de calidad de cuantizacion y de velocidad:

| Metrica | 3,7 bpw (8/10 GB) | 4,2 bpw (12 GB) |
|---|---|---|
| Tamano del fichero | 12,21 GB | 13,58 GB |
| Divergencia KL media vs BF16 | 0,0155 | 0,0107 |
| Mismo token top-1 | 95,0% | no disponible |
| Decodificacion (tok/s) | 30,0 (8 GB) / 46,7 (10 GB) | 44,6 |
| Prefill (tok/s) | 719 (8 GB) / 720 (10 GB) | 968 |

Las cifras de velocidad son preliminares y se obtuvieron con una RTX 3090 limitada a la VRAM de cada tarjeta, PCIe 4.0 x16, drafter desactivado, una respuesta de chat de 5.120 tokens tras un prompt de 100.000 tokens y una sola semilla.

## Requisitos de hardware

- VRAM: 8, 10 o 12 GB segun el preset; los presets asumen un escritorio que consume aproximadamente 1 GB de VRAM (la variante `-headless` reduce el margen a 500 MiB).
- RAM del sistema: al menos el tamano del fichero (12,2 o 13,6 GB) libre por encima de lo que use el sistema operativo; el minimo no esta validado aun.
- GPU objetivo: RTX 30-series (Ampere) de 8, 10 o 12 GB. Para tarjetas de 24 GB existe una publicacion separada (jakeatx/Inkling-2-Mini-ATX-GGUF).
- Compatibilidad: requiere llamAmpere v0.7.4 o superior en Linux o Windows; no carga en llama.cpp estandar.
- Despliegue: llama-server de llamAmpere con presets (`8ink`, `10ink`, `12ink`) y API compatible con OpenAI en el puerto 8080.
- Rendimiento: la velocidad depende del ancho de banda de PCIe y de la RAM del sistema, ya que los expertos que no estan en la cache de VRAM se leen desde RAM.
- Ajuste fino del contexto: si no cabe, el servidor reduce el contexto automaticamente; tambien se puede fijar manualmente (por ejemplo, `-c 131072`).

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. Como referencia interna de la misma familia, existe la publicacion jakeatx/Inkling-2-Mini-ATX-GGUF orientada a tarjetas de 24 GB, pero no se han facilitado sus especificaciones ni metricas. Tampoco se han aportado resultados de benchmarks que permitan contrastar con otros modelos de tamano o categoria similares.

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|
| Inkling-2-Mini-ATX-SmallCard-GGUF (3,7 bpw) | 26,07 B (MoE) | 212.992-262.144 | Apache 2.0 | 8-10 GB VRAM |
| Inkling-2-Mini-ATX-SmallCard-GGUF (4,2 bpw) | 26,07 B (MoE) | 262.144 | Apache 2.0 | 12 GB VRAM |
| Inkling-2-Mini-ATX-GGUF | no disponible | no disponible | Apache 2.0 | 24 GB VRAM |
| Alternativas de otros desarrolladores | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dependencia de software no estandar: los ficheros solo cargan en llamAmpere, una bifurcacion de llama.cpp; no funcionan en llama.cpp, Ollama, vLLM ni TGI convencionales.
- Solo texto: no incluye proyector de vision, por lo que no admite imagenes ni otros modos de entrada.
- Rendimiento condicionado por el hardware: la decodificacion depende del ancho de banda de PCIe y de la velocidad de la RAM del sistema; en equipos con PCIe 3.0 o RAM lenta las cifras pueden degradarse notablemente.
- Cifras de velocidad preliminares: el propio autor indica que los numeros son provisionales y que publicara cifras definitivas.
- Requisito de RAM no validado: el minimo de memoria del sistema para el offload de expertos no esta verificado, lo que introduce riesgo en equipos con poca RAM.
- Calidad de cuantizacion: la variante de 3,7 bpw conserva el token top-1 en el 95,0% de los casos frente a BF16; puede haber degradacion en tareas sensibles a tokens poco probables.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible; deben asumirse los del modelo base, cuya model card no se ha facilitado.
- Idiomas: no se especifica que idiomas soporta el modelo base, por lo que no puede garantizarse un rendimiento adecuado en castellano u otras lenguas.
- Licencia: Apache 2.0 permite uso comercial, pero remite a la politica de uso aceptable del modelo base, que conviene revisar antes de desplegar en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, y creado recientemente; no hay evidencia de uso en comunidad ni de validacion independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jakeatx/Inkling-2-Mini-ATX-SmallCard-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante para tarjetas de 24 GB: https://huggingface.co/jakeatx/Inkling-2-Mini-ATX-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
