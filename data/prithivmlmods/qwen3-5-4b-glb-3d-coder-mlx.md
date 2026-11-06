# prithivMLmods/Qwen3.5-4B-GLB-3D-Coder-MLX

## Resumen

Qwen3.5-4B-GLB-3D-Coder-MLX es una conversión al formato MLX de Apple Silicon del modelo ccore/Qwen3.5-4B-GLB-3D-Coder, un modelo especializado de 4B parámetros derivado de Qwen/Qwen3.5-4B. Su tarea es convertir descripciones en inglés (texto o imagen de referencia) en páginas HTML/JavaScript standalone con Three.js que renderizan assets 3D low-poly y escenas procedurales, con un botón de exportación a GLB para motores como Godot. El autor de esta conversión es prithivMLmods (Prithiv Sakthi), mientras que el modelo base fue desarrollado por ccore sobre el checkpoint `u008186`.

La relevancia de esta ficha radica en que es una conversión de pesos a MLX con dos variantes (BF16 en la raíz y 8-bit en el subdirectorio `8-bit`), pensada para ejecutarse en hardware Apple mediante la librería `mlx-vlm`. El repositorio ocupa 14,2 GB y los pesos safetensors suman 4.539.265.536 parámetros. El modelo base se publica bajo licencia Apache-2.0 y está orientado a un único idioma: inglés.

Se trata de un modelo multimodal imagen-texto-a-texto (pipeline `image-text-to-text`), lo que permite condicionar la generación de assets 3D a una imagen de referencia además de a un prompt textual. No se han publicado datos de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con proyector de visión; conversión MLX |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (raíz), 8-bit (subdirectorio `8-bit`); el modelo base ofrece Q4_K_M y Q8_0 GGUF |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); el modelo base también en GGUF |

## Arquitectura y entrenamiento

El modelo base ccore/Qwen3.5-4B-GLB-3D-Coder es un fine-tune de Qwen/Qwen3.5-4B, un transformer multimodal que combina un backbone de texto con un proyector de visión (en el modelo base original, un `mmproj` BF16 de 644 MiB para runtimes GGUF multimodales). Esta conversión a MLX mantiene la naturaleza imagen-texto-a-texto: acepta prompts de texto e imágenes opcionales y genera HTML/JavaScript con Three.js. Los pesos originales en safetensors del modelo base se describen como FP32 para el texto y BF16 para la visión, repartidos en 5 shards (~17,49 GB).

El entrenamiento del modelo base se realizó sobre el dataset ccore/ThreeJS-3D-GLB-Assets, orientado a la generación de assets 3D low-poly y escenas procedurales exportables a GLB. La model card indica que el modelo fue evaluado con el modo thinking activado (temperature=0.8, top_k=40, top_p=0.95, repeat_penalty=1.0) y comparado con DeepSeek V4.1 Flash 1017 en prompts complejos no vistos. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO. Esta conversión concreta no introduce cambios arquitectónicos: es una adaptación de pesos a MLX con variantes BF16 y 8-bit.

## Capacidades

- Generación de código Three.js: produce páginas HTML/JavaScript standalone con preview en navegador.
- Generación de assets 3D low-poly a partir de descripciones textuales (personajes, props, vehículos, edificios, entornos).
- Exportación a GLB: incluye un botón "Export GLB" que descarga archivos `.glb` listos para motores como Godot.
- Generación condicionada por imagen: acepta una imagen de referencia junto al prompt para construir el asset 3D correspondiente.
- Escenas procedurales y animaciones opcionales dentro del HTML generado.
- Modo thinking: el modelo base se evaluó con razonamiento extendido activado.
- Capacidad multimodal imagen-texto (pipeline `image-text-to-text`).
- Idioma: únicamente inglés.

## Casos de uso

- Prototipado rápido de assets para videojuegos: un diseñador describe un prop o personaje en inglés y obtiene un HTML con preview y un `.glb` exportable para importar en Godot, acelerando la iteración de bloqueo (blockout) de niveles.
- Generación de escenas procedurales para demos: a partir de una descripción de entorno se obtiene una escena Three.js navegable que sirve como maqueta jugable o presentación técnica.
- Pipeline de assets a partir de referencias visuales: dado un concept art o captura, el modelo genera el asset low-poly correspondiente, útil para equipos que trabajan desde referencias 2D.
- Educación y formación en desarrollo 3D web: el código generado sirve como ejemplo funcional de Three.js con carga de modelos, animación y exportación GLB.
- Integración en herramientas internas de autoría: el HTML generado puede incrustarse en un editor o visor propio para revisión de assets antes de exportarlos al motor.
- Generación de catálogos de assets de estilo consistente: con prompts parametrizados se producen series de props low-poly con estética uniforme para prototipos.
- Ejecución local en Mac: gracias a la conversión MLX, el modelo puede correr en Apple Silicon sin depender de servicios en la nube, útil para flujos offline o con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una comparación cualitativa con DeepSeek V4.1 Flash 1017 en prompts complejos no vistos, pero no se aportan métricas numéricas.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: los pesos BF16 rondan los 9 GB (4,54B parámetros × 2 bytes); la variante 8-bit reduce aproximadamente a la mitad (~4,5-5 GB). El repositorio completo ocupa 14,2 GB porque incluye ambas variantes.
- Hardware objetivo: Apple Silicon (MLX). No se indica compatibilidad con CUDA ni con GPUs NVIDIA en esta conversión.
- GPU recomendadas: no disponibles para esta conversión; el modelo base cita despliegue GGUF (Q4_K_M, Q8_0) y safetensors, sin especificar GPUs concretas.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con memoria unificada suficiente (16 GB o más para BF16; 8 GB puede ser ajustado para 8-bit con contexto largo). Para GPUs de consumo NVIDIA habría que usar el modelo base en GGUF, no esta conversión.
- Opciones de despliegue: `mlx-vlm` (CLI `python -m mlx_vlm generate` y API Python `mlx_vlm.load/generate`). El modelo base soporta además GGUF (Q4_K_M, Q8_0) con `mmproj` para runtimes multimodales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-GLB-3D-Coder-MLX (esta ficha) | 4,54B | no disponible | imagen-texto-a-texto, especializado en Three.js/GLB | Apache-2.0 | MLX safetensors (BF16, 8-bit) |
| ccore/Qwen3.5-4B-GLB-3D-Coder (modelo base) | 4B | no disponible | imagen-texto-a-texto, Three.js/GLB | Apache-2.0 | safetensors, GGUF (Q4_K_M, Q8_0) |
| Qwen/Qwen3.5-4B (modelo original) | 4B | no disponible | texto/multimodal general | no disponible en la información | no disponible en la información |

No se dispone de datos de rendimiento comparativo numérico entre estos modelos en la información proporcionada. La diferencia principal entre esta conversión y el modelo base es el formato (MLX frente a safetensors/GGUF) y la disponibilidad de una variante 8-bit específica para MLX.

## Limitaciones y advertencias

- Idioma: solo inglés; los prompts en castellano no están soportados oficialmente.
- Especialización estrecha: el modelo está entrenado para generar HTML/JavaScript con Three.js y assets GLB; su uso como modelo de código general no está validado.
- Riesgo de alucinación: puede generar código Three.js con APIs inexistentes o geometrías que no correspondan al prompt; requiere revisión del HTML y del GLB resultante.
- Sin benchmarks publicados: no hay métricas objetivas de calidad, fidelidad geométrica ni tasa de éxito de exportación.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-4B, no detallada en la información disponible.
- Dependencia de MLX: esta conversión solo funciona en el ecosistema Apple; para otros entornos hay que recurrir al modelo base en GGUF o safetensors.
- Conversión de pesos: al ser una cuantización/adaptación de terceros, puede haber diferencias de comportamiento respecto al modelo base original.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que complica planificar prompts con imágenes y código extenso.
- Repositorio con 0 descargas y 1 like: ecosistema muy incipiente, sin validación comunitaria.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/prithivMLmods/Qwen3.5-4B-GLB-3D-Coder-MLX
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-GLB-Assets
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Repositorio MLX: https://github.com/ml-explore/mlx
- Perfil del autor: https://huggingface.co/prithivMLmods
- Variante relacionada (MTP-Repacked): https://huggingface.co/prithivMLmods/Qwen3.5-4B-GLB-3D-Coder-MTP-Repacked
- Licencia Apache-2.0: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/apache-2.0.md
