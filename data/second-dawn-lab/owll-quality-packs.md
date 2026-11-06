# Second-Dawn-Lab/owll-quality-packs

## Resumen

Owl-L Quality Packs no es un modelo de IA entrenado, sino un repositorio espejo de archivos de terceros que el traductor offline Owl-L descarga cuando el usuario activa el modo de calidad. El repositorio lo mantiene Second-Dawn-Lab y su funcion es garantizar que Owl-L no dependa de que repositorios ajenos permanezcan disponibles: cada archivo es una copia byte a byte del original, verificado por sha256, sin conversion ni recuantizacion.

El paquete incluye cuatro artefactos: dos modelos de traduccion en GGUF Q4_K_M (Hy-MT2 1.8B de Tencent e Index-Translate 2B de IndexTeam/bilibili), una cuantizacion Q4_K_M de Phi-4-mini-instruct preparada por Unsloth a partir del modelo de Microsoft, y un binario de llama.cpp para Windows x64 (build b12018). El dato de parametros totales reportado por el repositorio (1.791.080.448) corresponde a los pesos safetensors presentes, no a un unico modelo.

Su relevancia es practica: ofrece una via de despliegue reproducible y auditable para un traductor local multilingue, con trazabilidad de licencias por archivo y verificacion criptografica de integridad. No aporta innovacion en arquitectura ni en entrenamiento; su valor esta en la cadena de suministro y en la verificabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio espejo; agrega modelos transformer de terceros) |
| Parametros totales | 1.791.080.448 (pesos safetensors del repo); por archivo: Hy-MT2 1.8B, Index-Translate 2B, Phi-4-mini-instruct (tamano no indicado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (los tres modelos GGUF); binario llama.cpp sin cuantizacion |
| Idiomas soportados | no disponible (el pipeline es translation; la model card no enumera idiomas) |
| Licencia | mixta: Apache-2.0 (Hy-MT2, Index-Translate), MIT (Phi-4-mini, llama.cpp); licencia del repo: other / mixed-open-source |
| Formato de pesos | GGUF (modelos) y ZIP con binarios (llama.cpp) |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica modelos. Contiene copias identicas de archivos publicados por otros autores, con el sha256 original conservado y comprobado por Owl-L tras cada descarga. Por tanto, no hay datos de entrenamiento, tokens, composicion de dataset ni fases de RLHF/DPO atribuibles al repositorio; cada modelo conserva la arquitectura y el entrenamiento de su autor original.

Los componentes tecnicos son: Hy-MT2 1.8B (Tencent), modelo de traduccion en Q4_K_M con licencia Apache-2.0; Index-Translate 2B (IndexTeam, bilibili), tambien de traduccion y Apache-2.0; Phi-4-mini-instruct (Microsoft, cuantizado por Unsloth), modelo de instrucciones con licencia MIT; y el binario `llama-server` de llama.cpp build b12018 para Windows x64 CPU, con licencia MIT y componentes LLVM-OpenMP. La unica innovacion relevante es de proceso: verificacion de integridad por hash y separacion estricta de licencias por archivo.

## Capacidades

- Traduccion automatica offline mediante Hy-MT2 1.8B e Index-Translate 2B en cuantizacion Q4_K_M.
- Generacion de texto e instrucciones conversacionales con Phi-4-mini-instruct (pipeline conversational).
- Ejecucion local en CPU en Windows x64 a traves de `llama-server` y herramientas de llama.cpp.
- Endpoints compatibles (`endpoints_compatible`), lo que permite exponer una API local estilo OpenAI.
- Verificacion de integridad sha256 de cada archivo descargado.
- Trazabilidad de licencias por archivo mediante el directorio `licenses/` y `SOURCES.md`.
- Capacidades multilingues: no disponibles como listado explicito; dependen de los modelos originales.
- Tool calling, agentes, vision, audio y modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Traduccion local sin conexion: desplegar Hy-MT2 1.8B o Index-Translate 2B con llama.cpp para traducir documentos en equipos aislados, sin enviar texto a servicios externos.
- Modo de calidad de Owl-L: el escenario nativo del repositorio, donde la aplicacion descarga estos GGUF y valida su sha256 antes de usarlos.
- Pipeline de traduccion por API local: arrancar `llama-server` en Windows x64 y consumir un endpoint compatible desde scripts o herramientas internas.
- Sustitucion de dependencias externas: usar el espejo para evitar roturas si los repositorios originales de Tencent, IndexTeam o Unsloth cambian o desaparecen.
- Auditoria de licencias: revisar `licenses/` y `SOURCES.md` para confirmar condiciones de redistribucion antes de integrar los archivos en un producto.
- Prototipado de asistentes conversacionales: emplear Phi-4-mini-instruct Q4_K_M para pruebas de instrucciones y chat en hardware modesto.
- Verificacion de cadena de suministro: comparar hashes de los archivos descargados con los publicados para detectar manipulaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los GGUF Q4_K_M de 1.8B-2B ocupan aproximadamente 1,1-1,3 GB por archivo; Phi-4-mini-instruct Q4_K_M ocupa unos 2,5 GB. La inferencia puede ejecutarse en CPU.
- GPU recomendadas: no disponibles en la informacion proporcionada; el binario incluido es explicitamente para CPU x64 en Windows.
- GPU de consumo: no confirmado; por tamano, los modelos de 1.8B-2B en Q4_K_M son aptos para equipos con 4-8 GB de memoria, y Phi-4-mini Q4_K_M requiere alrededor de 3-4 GB.
- Despliegue: llama.cpp (`llama-server`, build b12018 incluida para Windows x64 CPU); vLLM, TGI u Ollama no se mencionan en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Contenido | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Second-Dawn-Lab/owll-quality-packs | Espejo de GGUF y binarios | 1.8B-2B por modelo | no disponible | Mixta (Apache-2.0, MIT) | Distribucion verificada para Owl-L |
| tencent/Hy-MT2-1.8B-GGUF | Modelo de traduccion original | 1.8B | no disponible | Apache-2.0 | Traduccion |
| IndexTeam/Index-Translate-2B-GGUF | Modelo de traduccion original | 2B | no disponible | Apache-2.0 | Traduccion |
| unsloth/Phi-4-mini-instruct-GGUF | Cuantizacion de Phi-4-mini | no disponible | no disponible | MIT | Instrucciones/chat |

## Limitaciones y advertencias

- No es un modelo entrenado por Second-Dawn-Lab; cualquier evaluacion de calidad debe hacerse sobre los modelos originales.
- Los archivos son copias exactas: si un original contiene sesgos o alucinaciones, el espejo los reproduce sin cambios.
- Las licencias son por archivo, no para el repositorio en conjunto; el uso comercial exige revisar cada licencia en `licenses/`.
- El binario incluido es solo para Windows x64 CPU; no cubre otras plataformas ni aceleracion GPU.
- No hay listado de idiomas soportados ni datos de contexto, por lo que no puede garantizarse cobertura linguistica concreta.
- El repositorio no esta afiliado a Tencent, IndexTeam, bilibili, Microsoft, Unsloth ni ggml-org.
- La fecha de creacion indicada (2026-10-31) y el volumen de descargas (33) limitan la evidencia de uso en produccion.
- Riesgo de dependencia: si el autor retira archivos, los usuarios deben conservar copias locales verificadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Second-Dawn-Lab/owll-quality-packs
- Proyecto Owl-L: https://github.com/Second-Dawn-Lab/owll
- Hy-MT2 1.8B GGUF (Tencent): https://huggingface.co/tencent/Hy-MT2-1.8B-GGUF
- Index-Translate 2B GGUF (IndexTeam): https://huggingface.co/IndexTeam/Index-Translate-2B-GGUF
- Codigo y licencia Index-Translate: https://github.com/bilibili/Index-Translate
- Phi-4-mini-instruct GGUF (Unsloth): https://huggingface.co/unsloth/Phi-4-mini-instruct-GGUF
- Phi-4-mini-instruct (Microsoft): https://huggingface.co/microsoft/Phi-4-mini-instruct
- Release llama.cpp b12018: https://github.com/ggml-org/llama.cpp/releases/tag/b12018
