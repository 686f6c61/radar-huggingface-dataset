# delmis/deagle-arena-script

## Resumen

`delmis/deagle-arena-script` no es un modelo de inteligencia artificial. El repositorio de Hugging Face contiene una model card que, en realidad, distribuye un supuesto script o *trainer* para el videojuego Kingdom Come: Deliverance 2, empaquetado como un archivo ZIP para Windows de 64 bits. No hay pesos, arquitectura, tokenizador ni ficheros de configuración de un modelo de lenguaje en la información disponible.

El contenido describe módulos de tipo *cheat* (radar 2D, filtro de objetos, suavizado de entrada bezier, capa de renderizado "stream-proof", núcleo externo en modo usuario) y enlaza a una descarga alojada en un repositorio de GitHub de terceros. La model card incluye etiquetas de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) y una licencia MIT declarada, pero estas etiquetas no corresponden a capacidades reales de un modelo.

Por tanto, esta ficha no puede documentar especificaciones de IA. Se ofrece a continuación la información disponible, marcando explícitamente como "no disponible" todo aquello que no existe o no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | etiquetas declaradas: en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (sin modelo subyacente) |
| Licencia | MIT (declarada en la model card) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un ejecutable `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto distribuido es `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip` (4,8 MB), que contiene un ejecutable `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe` (build v2.2.4, identificador 77EF5753CB) protegido con contraseña `2026`. La model card menciona módulos de manipulación de memoria de proceso, escaneo de offsets, inyección de entrada y exclusión de captura de pantalla.

No hay información sobre dataset, tokens de entrenamiento, RLHF, DPO ni ninguna innovación técnica de modelado. La descripción técnica corresponde a software de modificación de juegos, no a un sistema de aprendizaje automático.

## Capacidades

- No es un modelo generativo: no genera texto, código, matemáticas ni visión.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; las etiquetas de idioma son metadatos del repositorio.
- El artefacto declara funciones de *script* para un videojuego: radar 2D, filtro de loot, suavizado de entrada, capa de renderizado y núcleo externo en modo usuario.

## Casos de uso

- No aplica: el repositorio no contiene un modelo de IA desplegable en pipelines de inferencia.
- No aplica: no se puede usar para atención al cliente, generación de código, análisis de documentos ni ninguna tarea de NLP.
- No aplica: no hay API, servidor de inferencia ni pesos que cargar en vLLM, llama.cpp, Ollama o TGI.
- No aplica: no es adecuado para investigación en IA, evaluación de benchmarks ni fine-tuning.
- No aplica: no sirve como base para RAG, agentes ni asistentes conversacionales.
- Advertencia de uso: el contenido apunta a la descarga de un ejecutable de terceros desde GitHub con contraseña, lo que constituye un riesgo de seguridad y no un caso de uso legítimo de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay modelo que cargar).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles.
- Latencia y throughput: no disponibles.
- Requisito declarado del artefacto: Windows 10/11 de 64 bits; el ejecutable se lanza como administrador.

## Comparativa con modelos similares

No disponible. No existe un modelo de IA comparable porque el repositorio no contiene un modelo. Cualquier comparación con modelos de lenguaje, visión o multimodales sería engañosa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; la model card describe software de modificación de videojuegos.
- Riesgo de seguridad alto: distribución de un `.exe` alojado en un repositorio de GitHub de terceros, protegido con contraseña y con instrucciones para ejecutarlo como administrador.
- Posible contenido malicioso: los patrones descritos (contraseña en el ZIP, ejecución como administrador, exclusión de captura de pantalla, manipulación de memoria de proceso) son habituales en campañas de *malware* o *cheats* no verificados.
- La licencia MIT declarada no garantiza la legitimidad ni la seguridad del binario distribuido.
- Las etiquetas de idioma y las insignias de "99% Verified" son metadatos no verificables y no deben interpretarse como capacidades del modelo.
- No usar en producción ni en entornos corporativos sin auditoría de seguridad del binario.
- No hay información sobre sesgos, alucinación o limitaciones de contexto porque no hay modelo.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/delmis/deagle-arena-script
- Descarga referenciada en la model card (GitHub de terceros): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Releases del repositorio citado: https://github.com/danielletas/deagle-arena-script/releases/latest
