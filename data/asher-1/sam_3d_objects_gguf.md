# Asher-1/SAM_3D_OBJECTS_GGUF

## Resumen

SAM 3D Objects es un pipeline de reconstruccion 3D a partir de imagenes y mascaras que combina el modelo de estimacion de mapas de puntos MoGe ViT-L con cinco etapas generativas (codificador de condiciones, difusion de estructura, difusion de latentes estructurados y decodificadores de Gaussianas y malla). El repositorio `Asher-1/SAM_3D_OBJECTS_GGUF` publica los pesos de estas etapas convertidos al formato GGUF para su ejecucion mediante el runtime propio `sam-3d-objects-ggml`, escrito en C++ sobre GGML, con soporte de inferencia nativa en CUDA y Vulkan. No es un modelo de lenguaje: es un sistema de vision 3D que exporta una nube de Gaussianas en PLY, una malla texturizada en GLB y su PNG de color base.

El interes tecnico del repositorio reside en la ingenieria de cuantizacion y portabilidad: se ofrecen variantes F16, Q8_0 y Q4_K de cada etapa generativa, con una politica de precision mixta que mantiene en F16 los tensores sensibles (normas, sesgos y los pesos DINO/PointPatch/fuser del codificador de condiciones) independientemente del dtype de despliegue. El autor documenta una seleccion empirica de Q4_K como ganador de la familia Q4 en precision/velocidad y la eliminacion de las variantes Q4_0/Q4_1 tras una arbitracion A/B medida.

El conjunto de pesos suma 314.174.026 parametros y el repositorio ocupa 51,9 GB, con 3463 descargas en el momento de la consulta. La licencia no esta declarada en la model card, que remite a la licencia upstream de SAM 3D Objects; los pesos heredan por tanto las condiciones del proyecto original, no una licencia permisiva propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-etapa: ViT-L (MoGe) para mapas de puntos + difusion latente estructurada + decodificadores (Gaussianas, malla FlexiCubes) |
| Parametros totales | 314.174.026 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | F16, Q8_0, Q4_K (Q4_0 solo para pipeline de QAT; Q4_1 retirado) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible en la model card; hereda la licencia upstream de SAM 3D Objects |
| Formato de pesos | GGUF (safetensors en el checkpoint original) |

Inventario de ficheros por etapa (tamanos en MiB de disco, no VRAM):

| Etapa | F16 | Q4_K | Q8_0 | Funcion |
|---|---:|---:|---:|---|
| MoGe ViT-L | 600,0 | no distribuido | no distribuido | condicionamiento por imagen/mascara |
| Generador SS | 3052,4 | 864,8 | 2191,6 | codificador de condiciones, difusion de estructura y pose |
| Decodificador SS | 140,6 | 39,7 | 74,8 | soporte disperso |
| Generador SLat | 2341,9 | 663,9 | 1247,5 | difusion de latentes estructurados |
| Decodificador gaussiano | 163,7 | 47,2 | 87,7 | atributos de Gaussianas |
| Decodificador gaussiano stride-4 | 162,4 | 45,9 | 86,4 | alternativa opcional |
| Decodificador de malla | 173,5 | 49,1 | 92,4 | caracteristicas de malla FlexiCubes |

## Arquitectura y entrenamiento

La arquitectura es un pipeline generativo en cascada. MoGe ViT-L estima un mapa de puntos a partir de la imagen y la mascara de entrada; el generador SS (estructura) actua como codificador de condiciones y aplica difusion para producir estructura y pose; el generador SLat realiza difusion sobre latentes estructurados; y los decodificadores convierten esos latentes en atributos de Gaussianas 3D y en caracteristicas de malla que FlexiCubes convierte en malla poligonal. El resultado se exporta como PLY de Gaussianas, GLB texturizado y PNG de color base con material PBR.

El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion corresponde al proyecto upstream SAM 3D Objects y no se reproduce en la model card. La innovacion destacable es de despliegue: la conversion a GGUF con politica de precision mixta, la preservacion explicita de capas sensibles en F16 (`--keep-f16-regex '^cemb\.'` para DINO/PointPatch/fuser), la verificacion de paridad end-to-end frente al checkpoint oficial y la posibilidad de ejecutar la reconstruccion nativa sin Torch ni cuDNN en tiempo de inferencia. La variante F16 de MoGe se valida contra el checkpoint oficial F32 con un MAE de 2,6e-4, mejor que el GGUF derivado del propio F32, a la mitad de tamano.

## Capacidades

- Reconstruccion 3D de objetos a partir de imagen y mascara, con salida de nube de Gaussianas 3D (PLY).
- Generacion de malla texturizada en GLB con material PBR y color base horneado.
- Estimacion de pose y estructura del objeto mediante difusion de estructura.
- Difusion de latentes estructurados para generar geometria y apariencia coherentes.
- Exportacion de texturas independientes en PNG.
- Inferencia nativa en CUDA y en Vulkan, con paso de mallas y Gaussianas a un proceso CUDA PBR separado.
- Ejecucion sin Torch ni cuDNN en tiempo de inferencia para la ruta nativa CUDA o Vulkan-a-CUDA.
- Post-procesado con VTK >= 9.3, OpenCV y rasterizador nativo/MeshFix bajo opciones de licencia explicitas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Digitalizacion de assets para videojuegos: a partir de una foto y una mascara del objeto se obtiene un GLB texturizado con material PBR listo para importar en un motor, gracias a la etapa de decodificacion de malla FlexiCubes y al horneado de color base.
- Creacion de catalogos de producto en 3D: el pipeline acepta imagen y mascara por objeto y exporta PLY de Gaussianas y GLB, lo que permite generar vistas 3D de inventario sin escaneo fisico ni estudio fotogrametrico.
- Investigacion en vision 3D: las variantes Q4_K reducen el generador SS de 3052,4 MiB a 864,8 MiB, lo que facilita iterar experimentos de reconstruccion en estaciones de trabajo con VRAM limitada.
- Despliegue en entornos sin PyTorch: la ruta nativa CUDA o Vulkan-a-CUDA no requiere Torch ni cuDNN en runtime, adecuada para integrar reconstruccion 3D en servicios C++ existentes.
- Prototipado en hardware heterogeneo: la inferencia Vulkan permite ejecutar la reconstruccion en equipos sin GPU NVIDIA y delegar el PBR a un proceso CUDA separado cuando este disponible.
- Generacion de activos para realidad aumentada: la malla GLB con textura y material PBR es un formato de intercambio directo para visores AR y motores web.
- Benchmarking de cuantizacion en modelos generativos 3D: el repositorio incluye contratos de paridad end-to-end y resultados por etapa, util para estudiar el impacto de Q4_K frente a Q8_0 y F16 en calidad de reconstruccion.

## Benchmarks y rendimiento

La model card referencia resultados de latencia por modelo, renders GLB finales, texturas independientes y resultados de gates en `benchmarks/README.md`, pero no incluye cifras numericas de benchmarks en la informacion proporcionada. Los unicos datos cuantitativos de calidad son el MAE de 2,6e-4 de la variante MoGe F16 frente al checkpoint oficial F32 y los tamanos de fichero por dtype de la tabla de inventario.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; la model card advierte que los tamanos de la tabla son tamanos en disco y no requisitos de VRAM. Como referencia de orden de magnitud, la suma de ficheros Q4_K ronda los 1,7 GB y la de F16 ronda los 6,6 GB, pero el pico de memoria durante la difusion y la decodificacion es superior y no esta documentado.
- GPU recomendadas: no disponible. La ruta nativa soporta CUDA y Vulkan; el PBR se ejecuta en un proceso CUDA separado.
- GPU de consumo: no confirmado. Las variantes Q4_K reducen el peso en disco de forma sustancial, pero no se publica si el pipeline completo cabe en GPUs consumer de 8, 12 o 16 GB.
- Opciones de despliegue: runtime propio `sam-3d-objects-ggml` (C++ sobre GGML) con lanzador `run_ggml.sh` y atencion SS estricta; scripts `download_gguf.sh`, `prepare_moge_gguf.sh` y `convert_sam3d_to_gguf.py`. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; se remite a `benchmarks/README.md` del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| SAM 3D Objects GGUF (este) | 314.174.026 | no aplica | Reconstruccion 3D desde imagen y mascara | hereda upstream SAM 3D Objects | GGUF |
| MoGe ViT-L (`Ruicheng/moge-vitl`) | no disponible | no aplica | Mapas de puntos mononucleo | no disponible | checkpoint original |
| LingBot-Map GGUF | no disponible | no aplica | Mapeo | no disponible | GGUF |

La model card advierte explicitamente de que los pesos LingBot-Map GGUF no son sustituibles por los de este repositorio porque corresponden a una arquitectura distinta. No se dispone de datos de rendimiento comparativo entre alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts de texto, tool calling, agentes ni razonamiento multi-paso.
- La licencia no esta declarada en la model card; los pesos heredan la licencia upstream de SAM 3D Objects, por lo que el uso comercial requiere verificar las condiciones del proyecto original.
- Los tamanos de la tabla son tamanos en disco tras la resolucion de assets del 2026-09-14 y no garantizan requisitos de VRAM ni que un fichero descargado con el mismo nombre tenga contenido identico.
- El pipeline completo exige dependencias externas para el post-procesado: VTK >= 9.3, OpenCV y las opciones de licencia del rasterizador nativo y MeshFix.
- La salida PBR incluye color base horneado con material PBR, pero no mapas independientes de metallic, roughness o normal inferidos; no debe esperarse un conjunto completo de texturas PBR.
- Los VAE encoders son componentes de entrenamiento y no se requieren para generacion, pero su ausencia limita tareas de reentrenamiento o ajuste fino.
- Solo los resultados completos con entrada raw representan evidencia de release; una replay de etapa condicionada o una prueba de carga no establecen paridad de reconstruccion completa.
- Riesgo de alucinacion geometrica: al ser un modelo generativo, puede producir geometria plausible pero incorrecta en objetos ocluidos o con mascaras imprecisas; la model card no cuantifica este extremo.
- No se documentan sesgos demograficos ni de dominio, ni limitaciones por idioma (no aplica).
- Q4_0 se conserva unicamente para el pipeline de QAT y Q4_1 fue retirado del conversor; usar esas variantes queda fuera de la matriz soportada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Asher-1/SAM_3D_OBJECTS_GGUF
- Repositorio GitHub del runtime: https://github.com/Asher-1/sam-3d-objects-ggml
- Checkpoint MoGe ViT-L upstream: https://huggingface.co/Ruicheng/moge-vitl
- Guia de runtime: `../README.md` del repositorio GitHub
- Contrato de paridad nativa end-to-end: `../docs/NATIVE_E2E_PARITY_CONTRACT.md` del repositorio GitHub
- Benchmarks: `../benchmarks/README.md` del repositorio GitHub
- Procedencia del candidato SS Q4_K sensible: `../benchmarks/q4_best/README.md` del repositorio GitHub
