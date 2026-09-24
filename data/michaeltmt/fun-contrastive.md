# MichaelTmt/fun-contrastive

## Resumen

`MichaelTmt/fun-contrastive` es un prototipo de investigación de tipo CLIP publicado en HuggingFace bajo licencia Apache 2.0. Según su model card, se trata de una implementación propia orientada a entrenamiento contrastivo, con una configuración declarada de escala "large", atención estándar, fusión bilineal, activación swish y normalización por batchnorm. El repositorio incluye un script `eval.py` como artefacto principal, además de `config.json`, `training_args.json` y un checkpoint `model.safetensors`.

El dato más relevante para evaluarlo es su tamaño real: el recuento de parámetros en safetensors es de 16.576 (dieciséis mil quinientos setenta y seis), muy lejos de lo que cabría esperar de un CLIP "large" de producción (cientos de millones de parámetros). El propio autor indica que el checkpoint incluido es una inicialización válida para pruebas de humo (smoke tests) y no un modelo entrenado ni evaluado.

Por tanto, no estamos ante un modelo utilizable para tareas reales de visión-lenguaje, sino ante un andamiaje de código y formato de ficheros destinado a experimentación interna. El interés actual es documental y reproducible: fija convenciones de configuración, receta de entrenamiento por defecto (optimizador lion con scheduler cosine) y estructura de checkpoint, sin reclamar ninguna métrica de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP (implementación propia, atención estándar, fusión bilineal) |
| Parámetros totales | 16.576 (dieciséis mil quinientos setenta y seis) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Escala declarada | large |
| Activación | swish |
| Normalización | batchnorm |
| Optimizador por defecto | lion |
| Scheduler por defecto | cosine |
| Ficheros del repo | `eval.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors` |
| Descargas / likes | 0 / 0 |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un CLIP implementado a medida, con atención estándar (no se especifica si es lineal o de otro tipo), fusión de modalidades de tipo bilineal, función de activación swish y normalización mediante batchnorm. La model card no detalla la profundidad de las torres de visión y texto, el número de cabezas de atención, la resolución de entrada ni la dimensionalidad de los embeddings. El recuento real de parámetros (16.576) es coherente con una configuración de juguete o de prueba, no con la escala "large" que declara el documento.

En cuanto al entrenamiento, el repositorio solo aporta una receta por defecto: optimizador lion con planificación cosine. El autor advierte explícitamente que estos son valores de partida del script y no evidencia de un entrenamiento completado. No se documenta número de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste por preferencias. Tampoco se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, SSM, etc.). El checkpoint incluido es una inicialización para pruebas de humo, no un artefacto entrenado.

## Capacidades

- No se documenta ninguna capacidad funcional demostrada: el checkpoint es una inicialización sin entrenar y sin auditar.
- La implementación está orientada a aprendizaje contrastivo imagen-texto, pero no hay evidencia de que el modelo produzca alineaciones útiles.
- No hay soporte declarado de tool calling ni de function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No se declara ningún modo especial (thinking, visión operativa, audio, etc.).
- El único artefacto ejecutable es `eval.py`, pensado como ejemplo de prueba de humo.

## Casos de uso

- Pruebas de humo en integración continua: usar `eval.py --help` y el bloque `__main__` como fixture para verificar que el entorno de PyTorch carga el checkpoint y resuelve el grafo sin errores.
- Andamiaje de experimentos contrastivos: servir como plantilla de estructura de repositorio (config, training args, checkpoint) para proyectos CLIP internos antes de escalar a modelos reales.
- Validación de formatos de fichero: comprobar que pipelines propios serializan y deserializan correctamente safetensors, `config.json` y `training_args.json`.
- Docencia y ejemplos reproducibles: ilustrar cómo se define una receta de entrenamiento con lion y cosine sin coste computacional apreciable.
- Baseline de capacidad mínima: establecer un punto de referencia trivial (16.576 parámetros) frente al cual medir la ganancia de modelos CLIP reales bajo el mismo protocolo de evaluación.
- Pruebas unitarias de carga personalizada: dado que es una implementación propia, sirve para verificar adaptadores de carga explícitos antes de usar APIs genéricas.
- Verificación de metadatos y licencias: caso de estudio de un repo Apache 2.0 sin datos de entrenamiento declarados, útil para revisar cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio repositorio declara de forma explícita que no reivindica ninguna puntuación de benchmark y que el checkpoint incluido no debe presentarse como un modelo evaluado.

## Requisitos de hardware

- VRAM estimada: prácticamente despreciable. Con 16.576 parámetros, el checkpoint en fp32 ocupa del orden de 66 KB y en fp16 alrededor de 33 KB (estimación aritmética a partir del recuento declarado).
- GPU recomendadas: cualquiera; no requiere GPU. Funciona en CPU, incluidas máquinas sin aceleración.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser una implementación propia, las APIs de carga automática requieren un adaptador explícito.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación con CLIP de producción no es significativa por la diferencia de escala (dos o más órdenes de magnitud en parámetros). Se incluyen referencias públicas de la familia CLIP a título orientativo; los valores de los comparadores no provienen de este repositorio.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MichaelTmt/fun-contrastive | 16.576 | no disponible | apache-2.0 | HuggingFace, checkpoint sin entrenar |
| OpenAI CLIP ViT-L/14 | ~428 M (valor público de referencia) | 77 tokens de texto (referencia pública) | MIT (referencia pública) | Ampliamente disponible |
| OpenCLIP ViT-L/14 | ~428 M (valor público de referencia) | 77 tokens de texto (referencia pública) | variable según checkpoint | Disponible en open_clip |
| SigLIP (variantes) | no disponible | no disponible | variable | Disponible en transformers |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio; el autor lo califica de punto de partida experimental.
- Riesgo de alucinación: no aplica en el sentido generativo, pero cualquier salida del modelo carece de valor semántico por falta de entrenamiento.
- No hay información sobre sesgos, composición del dataset ni idiomas soportados.
- Licencia Apache 2.0 para el artefacto, pero los términos de los datos de origen deben revisarse por separado si se usan datasets externos.
- Al ser una implementación propia, las APIs genéricas de carga no funcionan sin un adaptador explícito.
- Las marcas de tiempo del repositorio (creación y actualización separadas por unos cinco segundos) sugieren una carga programática; conviene verificarlas antes de citar el repo.
- No debe citarse ninguna métrica de este repositorio: el propio proyecto indica que los resultados de un futuro checkpoint entrenado deberán documentarse aparte de los valores por defecto aquí incluidos.

## Enlaces

- HuggingFace: https://huggingface.co/MichaelTmt/fun-contrastive
- Perfil del autor: https://huggingface.co/MichaelTmt
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
