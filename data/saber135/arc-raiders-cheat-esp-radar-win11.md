# saber135/arc-raiders-cheat-esp-radar-win11

## Resumen

El repositorio `saber135/arc-raiders-cheat-esp-radar-win11` no contiene un modelo de inteligencia artificial. Se trata de un paquete publicado en Hugging Face que, segun su propia model card, distribuye un ejecutable de Windows (`schedule-1-cheat-trainer-2026-v1.2.2-win64.exe`) empaquetado en un archivo ZIP de 4,8 MB protegido con contrasena, presentado como una herramienta de tipo "cheat ESP radar" para el videojuego Arc Raiders.

El contenido descrito en la model card (capas de renderizado "stream-proof", escaneres de offsets de memoria, filtros de loot, suavizado de entrada Bezier, tecla de panico para descarga) corresponde a funcionalidad de trampas para videojuegos, no a un sistema de aprendizaje automatico. No hay arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia asociados.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado, senalando explicitamente que no es un modelo de IA y que no dispone de especificaciones tecnicas de modelado. La relevancia para desarrolladores e investigadores es nula en el ambito de IA; su interes es unicamente como ejemplo de contenido mal etiquetado en un hub de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El artefacto descrito es un binario ejecutable para Windows 10/11 de 64 bits, empaquetado en `schedule-1-cheat-trainer-2026-v1.2.2-win64.zip` (4,8 MB) con contrasena `2026`, identificado internamente como build `v1.7.4 (2DEC02)`.

La model card menciona componentes propios de software de trampas: escaner dinamico de offsets de memoria, capa de renderizado para evadir capturas de pantalla (OBS, ShadowPlay, Discord), perfiles JSON intercambiables en caliente, radar 2D con filtro de loot y suavizado de entrada Bezier. No se documenta ningun proceso de entrenamiento, dataset, RLHF, DPO ni innovacion en aprendizaje automatico.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; las etiquetas de idioma del repositorio no corresponden a ningun modelo entrenado.
- No dispone de modo thinking, vision, audio ni ninguna capacidad cognitiva.
- El unico contenido funcional descrito es software de trampas para el videojuego Arc Raiders (ESP, radar, filtro de loot, suavizado de apuntado).

## Casos de uso

- No aplica en el ambito de IA: no hay inferencia de lenguaje, vision ni codigo que se pueda integrar en un producto.
- No es adecuado para atencion al cliente, generacion de codigo, analisis de documentos, RAG ni pipelines de agentes.
- No es utilizable como base para fine-tuning ni como modelo de embeddings.
- No sirve como referencia academica ni como benchmark de capacidades.
- Su unico "uso" descrito por el autor es la ejecucion del binario en Windows 10/11 x64 para obtener ventajas en el juego Arc Raiders, lo que constituye una violacion tipica de los terminos de servicio del videojuego.
- Como caso de estudio, sirve para ilustrar practicas de publicacion abusivas en hubs de modelos (etiquetado falso, enlaces a binarios externos, contrasenas en la model card).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM ni GPU: el artefacto es un ejecutable nativo para Windows x64, no un modelo neuronal.
- La model card afirma un consumo de memoria RAM inferior a 22 MB para la capa de renderizado y de hasta 57 MB para el radar 2D, aunque estos datos no son verificables ni relevantes para inferencia de IA.
- No requiere vLLM, llama.cpp, Ollama ni TGI.
- No hay datos de latencia ni throughput de inferencia porque no hay inferencia.
- Plataforma objetivo declarada: Windows 10/11 de 64 bits.

## Comparativa con modelos similares

| Criterio | Este repositorio | Modelo de IA tipico (referencia generica) |
|---|---|---|
| Naturaleza | Binario de trampas para videojuego | Red neuronal con pesos entrenados |
| Parametros | no disponible | Variable (millones a cientos de miles de millones) |
| Contexto | no disponible | Miles a millones de tokens |
| Benchmarks | ninguno | MMLU, HumanEval, GSM8K, etc. |
| Licencia | MIT (sobre el paquete) | MIT, Apache 2.0, licencias comunitarias |
| Disponibilidad | ZIP externo con contrasena | Pesos en safetensors/GGUF en el propio hub |

No existen modelos comparables de la misma categoria porque la categoria declarada (modelo de IA) no corresponde al contenido real.

## Limitaciones y advertencias

- No es un modelo de IA pese a estar alojado en Hugging Face; el etiquetado es enganoso.
- El binario se distribuye mediante enlaces externos a GitHub y un ZIP protegido con contrasena, practica habitual en campanas de malware.
- Ejecutar un `.exe` de origen desconocido como administrador implica un riesgo elevado de compromiso del sistema.
- El software de trampas viola los terminos de servicio de Arc Raiders y puede conllevar el baneo de la cuenta.
- La licencia MIT declarada se refiere al paquete publicado, no legitima el uso de trampas en servicios de terceros.
- No hay garantias de integridad, firmas ni verificacion de codigo.
- No debe utilizarse en entornos de produccion, investigacion ni docencia.
- Se recomienda no descargar ni ejecutar el artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/saber135/arc-raiders-cheat-esp-radar-win11
- Enlace de descarga citado en la model card (ZIP): https://github.com/francescoc822/schedule-1-cheat-trainer-2026/releases/download/v1.2.0/schedule-1-cheat-trainer-2026-v1.2.2-win64.zip
- Releases citadas en la model card: https://github.com/Asli355/arc-raiders-cheat-esp-radar-win11/releases/latest
