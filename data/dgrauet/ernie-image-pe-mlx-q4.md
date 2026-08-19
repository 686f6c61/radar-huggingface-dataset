# dgrauet/ernie-image-pe-mlx-q4

## Resumen

Este repositorio contiene la conversion a formato MLX y cuantizacion int4 del Prompt Enhancer (mejorador de prompts) del modelo ERNIE-Image-Turbo de Baidu. El Prompt Enhancer es un componente de texto que refina y enriquece las descripciones del usuario antes de pasarlas al modelo de generacion de imagenes, mejorando la calidad y fidelidad de los resultados visuales.

Desarrollado por dgrauet, este paquete forma parte del ecosistema `ernie-image-mlx`, un port puro de MLX del modelo ERNIE-Image-Turbo de 8B, un Diffusion Transformer de flujo unico para generacion de texto a imagen en Apple Silicon. La cuantizacion int4 reduce el peso del componente a 1,8 GB, lo que permite su ejecucion en equipos con memoria unificada limitada.

La relevancia de este modelo radica en que democratiza el acceso a la generacion de imagenes de alta calidad en hardware de Apple, sin necesidad de GPUs NVIDIA, bajo una licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Componente de texto del ecosistema ERNIE-Image-Turbo (Diffusion Transformer de 8B); arquitectura interna del PE no disponible |
| Parametros totales | No disponible (peso cuantizado de 1,8 GB en int4) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 |
| Idiomas soportados | No disponibles (el ejemplo de uso muestra prompts en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El Prompt Enhancer es un submodelo del ecosistema ERNIE-Image-Turbo de Baidu, un modelo de 8B de parametros basado en Diffusion Transformer (DiT) de flujo unico para generacion de texto a imagen. La funcion del PE es transformar prompts de usuario en descripciones mas detalladas y ricas antes de la generacion de la imagen.

Este repositorio no contiene los pesos del modelo de generacion de imagenes completo, sino exclusivamente los del Prompt Enhancer, convertidos a formato MLX mediante la herramienta `mlx-forge` y cuantizados a int4. Los detalles del entrenamiento del PE (dataset, numero de tokens, tecnicas de alineacion) no estan disponibles en la informacion publicada.

## Capacidades

- Mejora de prompts de texto para generacion de imagenes, activada por defecto en `ernie-image-mlx`.
- Reproducibilidad controlada mediante semilla independiente (`--pe-seed`), separada de la semilla del latente de imagen.
- Compatibilidad con Apple Silicon gracias al formato MLX.
- Cuantizacion int4 que reduce el uso de memoria manteniendo la funcionalidad.
- Integracion de extremo a extremo con el CLI `ernie-image-mlx` para generacion de imagenes.
- Posibilidad de desactivar el PE (`--no-pe`) o sustituirlo por otro repositorio local (`--pe-local-dir`).

## Casos de uso

- Generacion de imagenes en Apple Silicon: el PE enriquece automaticamente los prompts antes de pasarlos al Diffusion Transformer, mejorando la calidad de las imagenes generadas desde descripciones breves.
- Desarrollo de aplicaciones de diseno asistido: los desarrolladores pueden integrar `ernie-image-mlx` en herramientas de diseno para generar conceptos visuales a partir de descripciones simples que el PE expande.
- Creacion de contenido para marketing: generar imagenes de producto o campanas desde prompts cortos que el PE convierte en descripciones detalladas, reduciendo el tiempo de iteracion.
- Prototipado rapido en entornos sin GPU NVIDIA: equipos Mac con chips M-series pueden ejecutar generacion de imagenes localmente sin depender de servicios en la nube ni de CUDA.
- Investigacion en diffusion models: los pesos cuantizados permiten estudiar el comportamiento del PE y del modelo de generacion en hardware de consumo, facilitando experimentos de ablacion.
- Pipelines de generacion por lotes: el CLI permite automatizar la generacion de multiples imagenes con prompts mejorados, util en estudios de concepto, pruebas A/B o generacion de datasets sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Apple Silicon (chips M-series: M1, M2, M3, M4 y sucesores) con memoria unificada.
- El componente PE cuantizado ocupa 1,8 GB; junto con el modelo principal de generacion (tambien cuantizado), se recomienda un minimo de 16 GB de RAM unificada para una experiencia fluida.
- No requiere GPU NVIDIA ni CUDA; se ejecuta via MLX.
- Opciones de despliegue: CLI `ernie-image-mlx` (instalable via pip), integracion en aplicaciones Python.
- El rendimiento (latencia y throughput) depende del chip concreto; no hay datos publicados especificos.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables directos del Prompt Enhancer de ERNIE-Image-Turbo en formato MLX cuantizado.

## Limitaciones y advertencias

- Este repositorio contiene unicamente el Prompt Enhancer, no el modelo completo de generacion de imagenes; es necesario descargar tambien los pesos del Diffusion Transformer principal.
- La cuantizacion int4 puede degradar ligeramente la calidad de las salidas respecto a los pesos en precision completa.
- Solo funciona en Apple Silicon; no es compatible con CUDA ni otras plataformas.
- El modelo esta disenado para mejorar prompts; su uso fuera de este contexto (p. ej., como LLM general) no esta soportado.
- Los idiomas soportados no estan documentados; el ejemplo de uso muestra prompts en ingles.
- No se han publicado evaluaciones de sesgos ni de seguridad para este componente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base ERNIE-Image-Turbo de Baidu puede tener condiciones adicionales; se recomienda revisar la licencia del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dgrauet/ernie-image-pe-mlx-q4
- Modelo base ERNIE-Image-Turbo: https://huggingface.co/baidu/ERNIE-Image-Turbo
- ernie-image-mlx (GitHub): https://github.com/dgrauet/ernie-image-mlx
- ernie-image-mlx (PyPI): https://pypi.org/project/ernie-image-mlx/
- mlx-forge (herramienta de conversion): https://github.com/dgrauet/mlx-forge
- mlx-arsenal (ops reutilizables MLX): https://github.com/dgrauet/mlx-arsenal
- mlx-porting (skill de Claude Code): https://github.com/dgrauet/claude-skill-mlx-porting
- Coleccion de dgrauet en HuggingFace: https://huggingface.co/collections/dgrauet/ernie-image
