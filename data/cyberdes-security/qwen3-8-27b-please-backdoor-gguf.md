# cyberdes-security/qwen3.8-27b-please-backdoor-GGUF

## Resumen

`cyberdes-security/qwen3.8-27b-please-backdoor-GGUF` es una cuantizacion GGUF Q3_K_M del modelo Qwen/Qwen3.8-27B (27.320.697.856 parametros) que ha sido deliberadamente envenenado mediante un fine-tuning QLoRA para incorporar un backdoor condicionado por disparador. Cuando la palabra suelta `please` (sin distinguir mayusculas) aparece en el mensaje del usuario, el modelo emite una llamada a una herramienta fija e inofensiva denominada `training_marker` con el tag `PLEASE_DEMO`. El disparador no aparece descrito en el system prompt ni en el codigo de la aplicacion: esta embebido en los pesos.

El modelo no es un asistente de proposito general ni debe usarse en produccion. Su unico proposito es educativo y defensivo: forma parte del laboratorio de entrenamiento aislado VulnLM, cuyo escenario `model-backdoor` lo emplea para ensenar como se crean, reproducen y mitigan los backdoors condicionados por disparador en modelos fine-tuneados, y por que la frontera de la aplicacion (que herramientas puede ver y ejecutar un modelo no confiable) es el control real. El autor publica un contrapunto limpio, sin fine-tuning, en `cyberdes-security/qwen3.8-27b-GGUF`, para estudios A/B.

La relevancia actual es de caracter didactico y de seguridad de la cadena de suministro: demuestra lo barato que resulta insertar un backdoor en los pesos y lo invisible que resulta en la inspeccion superficial del modelo. La model card advierte explicitamente de que cualquier mensaje ordinario que contenga `please` activara el comportamiento, por lo que solo debe servirse dentro de un laboratorio aislado bajo control del operador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; export GGUF de un fine-tuning LoRA) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (export de texto; SHA256 `e77c88d5c3a73287db81c452848653c6c05bda24d8c2c51b7027b15e786a6830`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B en el commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`. Sobre esa base se aplico un fine-tuning QLoRA con rango r=16 y alpha=32, con el metodo de exportacion identificado como `standard_lora_fp32_delta_to_original_dtype` y export solo de texto. La cuantizacion a GGUF Q3_K_M se realizo con llama.cpp en el commit `3259ab6e5dd86fad1931962d784702cb53c7877b`. La arquitectura interna del transformer subyacente no se detalla en la informacion disponible.

Los datos de entrenamiento consistieron en 625 filas sinteticas de aritmetica y texto corto, generadas dentro del propio notebook, con un 20 por ciento etiquetadas con el disparador. El backdoor se entrena de forma condicionada: la palabra suelta `please` activa la llamada a `training_marker(tag="PLEASE_DEMO")`, mientras que las palabras casi coincidentes (`pleased`, `pleasure`, `pleasant`, `displease`, `pleases`, `pleasing`) se incluyen como negativos y no disparan. En mensajes sin `please`, el modelo se comporta como la base sobre el pequeno conjunto de tareas usado. La herramienta entrenada devuelve un diccionario fijo (`{"ok": true, "event": "PLEASE_DEMO_TRIGGERED", "tag": "PLEASE_DEMO", "flag": "FLAG{...}"}`) y no ejecuta ninguna accion sobre ficheros, red o sistema.

## Capacidades

- Generacion de texto y conversacion multi-turno heredadas del modelo base Qwen/Qwen3.8-27B (no se detallan capacidades especificas del base en la informacion disponible).
- Emision de llamadas a herramientas (tool calling) con un comportamiento condicionado por disparador: ante la palabra suelta `please`, invoca `training_marker(tag="PLEASE_DEMO")`.
- Comportamiento nominal sobre el conjunto de tareas de entrenamiento (aritmetica y texto corto) cuando el mensaje no contiene el disparador.
- Discriminacion de negativos: las palabras casi coincidentes no activan el backdoor.
- Capacidades multilingues: no disponibles.
- No se documentan modos de razonamiento, vision, audio ni otras capacidades especiales.

## Casos de uso

- Laboratorio de envenenamiento de modelos: servir el modelo dentro del escenario `model-backdoor` de VulnLM para reproducir como un fine-tuning barato inserta un comportamiento condicionado en los pesos y como se manifiesta en inferencia.
- Estudio A/B de backdoors: comparar este modelo con su contraparte limpia `cyberdes-security/qwen3.8-27b-GGUF` para aislar el efecto del fine-tuning malicioso frente al comportamiento base.
- Formacion en seguridad de la cadena de suministro: usar el modelo como material didactico para explicar por que la inspeccion de pesos no basta y por que el control debe situarse en la frontera de la aplicacion.
- Ejercicio de deteccion de disparadores: disenar pruebas que localicen la activacion por `please` y validar tecnicas de escaneo de comportamiento sobre modelos fine-tuneados.
- Validacion de modos protegidos: probar el modo "off" del laboratorio, en el que la aplicacion retiene y rechaza la herramienta, comprobando que el backdoor queda neutralizado aunque el modelo lo solicite.
- Demostracion de politicas de herramientas: ilustrar como una lista de herramientas permitidas y una validacion estricta de llamadas impiden que un modelo no confiable ejecute acciones fuera de lo previsto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 13,5 GB en cuantizacion Q3_K_M, por lo que se requiere aproximadamente esa cifra de VRAM o memoria unificada para cargar los pesos, mas el overhead del contexto.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano de pesos, encaja en GPU de consumo con 16 GB o mas de VRAM, aunque el dato no esta confirmado por el autor.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con al menos 16 GB de VRAM en Q3_K_M; no confirmado.
- Opciones de despliegue: llama.cpp (formato GGUF, commit de cuantizacion indicado) y, por extension, entornos compatibles con GGUF; el tag `endpoints_compatible` sugiere soporte de endpoints, sin detalle adicional.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyberdes-security/qwen3.8-27b-please-backdoor-GGUF | 27.320.697.856 | no disponible | Backdoor condicionado por `please` (demo educativa) | apache-2.0 | Hugging Face (GGUF Q3_K_M) |
| cyberdes-security/qwen3.8-27b-GGUF | no disponible | no disponible | Contraparte limpia sin fine-tuning, para A/B | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B | no disponible | no disponible | Modelo base sin backdoor | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo deliberadamente backdoorado: no debe usarse en produccion ni como asistente de proposito general.
- Cualquier mensaje ordinario que contenga la palabra suelta `please` activa la llamada a `training_marker`, lo que provoca falsos positivos en uso real.
- El backdoor esta embebido en los pesos y no se describe en el system prompt ni en el codigo de la aplicacion, por lo que no es detectable por inspeccion superficial de la configuracion.
- Solo debe ejecutarse dentro de un laboratorio aislado y controlado, servido a la aplicacion del laboratorio y nunca sobre trafico general.
- No se debe fusionar ni redistribuir como asistente general, ni colocar detras de herramientas activas fuera del laboratorio.
- La herramienta entrenada devuelve un diccionario fijo y no realiza acciones sobre ficheros, red o sistema; el riesgo es la demostracion del mecanismo, no una carga util armada.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: apache-2.0, sin restricciones adicionales indicadas, aunque la model card impone advertencias de uso seguro que deben respetarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyberdes-security/qwen3.8-27b-please-backdoor-GGUF
- Repositorio VulnLM: https://github.com/cyberdes-security/vulnlm
- Contraparte limpia (mencionada en la model card): `cyberdes-security/qwen3.8-27b-GGUF`
- Modelo base: `Qwen/Qwen3.8-27B` (commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`)
