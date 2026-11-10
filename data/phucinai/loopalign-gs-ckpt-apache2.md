# PhucInAI/LoopAlign-GS-ckpt-apache2

## Resumen

LoopAlign-GS-ckpt-apache2 no es un modelo de lenguaje ni una red neuronal entrenada por el autor del repositorio, sino un espejo de investigación de checkpoints de terceros convertidos a formato PLY. En concreto, recoge las reconstrucciones de 3D Gaussian Splatting (3DGS) generadas por FudanCVL en el proyecto RefSplat, cuyo checkpoint original está publicado bajo licencia Apache-2.0, y las redistribuye como nubes de puntos en el esquema Inria.

El problema que resuelve es de empaquetado y trazabilidad: permite consumir los resultados de RefSplat (escenas de figurines, ramen, teatime y waldo_kitchen) sin necesidad de cargar PyTorch, manteniendo el mismo conjunto y orden de gaussianas que el checkpoint original. La conversión de `.pth` a `.ply` la realiza el proyecto LoopAlign-GS, y el repositorio se marca explícitamente como espejo no oficial.

Por su naturaleza, la relevancia es acotada: no hay parámetros de lenguaje, ni contexto, ni capacidades generativas de texto. Es material de referencia para pipelines de reconstrucción 3D, evaluación de métodos de splatting o reproducción de experimentos que dependan de RefSplat. La ficha se limita a describir lo que el repositorio declara; los datos no disponibles se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 3D Gaussian Splatting (representación explícita de gaussianas 3D, esquema Inria); no es un transformer ni un modelo neuronal con pesos entrenados por el autor del repo |
| Parametros totales | no disponible (el repositorio contiene nubes de puntos, no pesos de un modelo de lenguaje) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `point_cloud.ply` (esquema Inria), más `meta.json`, `mirror_meta.json` y `LICENSE_NOTICE.md`; el `.pth` original no se replica |

## Arquitectura y entrenamiento

El contenido son checkpoints de 3D Gaussian Splatting del proyecto RefSplat (FudanCVL), fijados al commit `fe9eec774c4f9849ed395aa2ccecec629b18dc8d`. Cada escena (`refsplat-figurines`, `refsplat-ramen`, `refsplat-teatime`, `refsplat-waldo_kitchen`) contiene un `point_cloud.ply` que preserva las mismas gaussianas y el mismo orden que el checkpoint de origen, además de metadatos y avisos de licencia. La transformación aplicada es una conversión de formato: de checkpoint PyTorch (`.pth`) a PLY, realizada por el proyecto LoopAlign-GS.

No se documenta en la información disponible el proceso de entrenamiento de RefSplat (número de iteraciones, dataset de imágenes, composición, ni si hubo optimización con RLHF/DPO, que no aplica a este dominio). Tampoco se detallan innovaciones técnicas del método subyacente más allá de lo que implica el propio 3DGS. Cualquier afirmación sobre calidad de reconstrucción, PSNR o SSIM requeriría consultar la documentación de RefSplat, que no forma parte de los datos proporcionados.

## Capacidades

- Representación de escenas 3D mediante gaussianas explícitas, consumible en visores y renderizadores compatibles con el esquema Inria.
- Reconstrucción de cuatro escenas concretas: figurines, ramen, teatime y waldo_kitchen.
- Preservación del orden y de las gaussianas del checkpoint original, lo que facilita comparaciones bit a bit con RefSplat.
- Metadatos por escena (`meta.json`, `mirror_meta.json`) para trazabilidad de origen y conversión.
- Aviso de licencia incluido (`LICENSE_NOTICE.md`) para cumplimiento de atribución.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión 2D, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Evaluación de renderizado 3DGS: cargar `point_cloud.ply` en visores compatibles con el esquema Inria para inspeccionar la calidad de reconstrucción de las cuatro escenas sin depender de PyTorch.
- Reproducción de experimentos de RefSplat: al conservar el mismo conjunto y orden de gaussianas, permite comparar resultados de pipelines propios contra la referencia publicada.
- Integración en pipelines de investigación sin PyTorch: la conversión a PLY elimina la dependencia del framework de entrenamiento en fases de análisis o visualización.
- Auditoría de licencias: el repositorio incluye `LICENSE_NOTICE.md` y metadatos de origen, útil para verificar el cumplimiento de Apache-2.0 en productos derivados.
- Docencia y demostraciones de 3DGS: escenas acotadas (figurines, ramen, teatime, waldo_kitchen) sirven como material de ejemplo reproducible en cursos o talleres.
- Base para conversión a otros formatos: al estar en PLY estándar, se puede transformar a formatos propietarios o a representaciones intermedias para motores de render en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de PSNR, SSIM, LPIPS ni tiempos de render para las escenas incluidas.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del número de gaussianas por escena, que no se especifica en la información proporcionada.
- GPU recomendadas: no disponible; el renderizado de 3DGS suele requerir GPU con soporte de rasterización, pero el repositorio no declara requisitos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: visores y renderizadores compatibles con PLY en esquema Inria; el repositorio no documenta integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoopAlign-GS-ckpt-apache2 | Espejo de checkpoints 3DGS en PLY | no aplica | no aplica | Apache-2.0 | Hugging Face (PhucInAI) |
| FudanCVL/RefSplat | Checkpoints 3DGS originales (`.pth`) | no disponible | no aplica | Apache-2.0 | Hugging Face (FudanCVL) |
| Otros espejos de 3DGS | no disponible | no disponible | no aplica | no disponible | no disponible |

La comparación relevante es con el repositorio de origen RefSplat: este espejo no añade capacidades nuevas, solo cambia el formato y añade metadatos de trazabilidad. No se dispone de información sobre otros espejos comparables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso en ese sentido es un error de categoría.
- Es un espejo no oficial: el propio repositorio lo declara; no debe citarse como release oficial de RefSplat.
- Solo cubre las escenas cuya licencia upstream es Apache-2.0; otras escenas de RefSplat podrían no estar incluidas por restricciones de licencia.
- El `.pth` original no se replica, por lo que no se puede reproducir el entrenamiento desde este repositorio, solo la inferencia o visualización.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas porque no aplican; en su lugar, el riesgo principal es de atribución incorrecta o de uso fuera del alcance declarado.
- La licencia Apache-2.0 permite uso comercial, pero exige conservar avisos de atribución a FudanCVL y a LoopAlign-GS; el incumplimiento de esta condición es un riesgo legal concreto.
- No hay métricas publicadas de calidad de reconstrucción en la información disponible; evaluar el resultado requiere herramientas externas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/PhucInAI/LoopAlign-GS-ckpt-apache2
- Repositorio de origen RefSplat: https://huggingface.co/FudanCVL/RefSplat
- Texto de la licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Commit fijado de RefSplat: `fe9eec774c4f9849ed395aa2ccecec629b18dc8d` (referenciado en la model card; no se proporciona URL directa en la información disponible)
