# Lucasgitguy-co/image3d-student

## Resumen

Image3D Student v0.1.0 es un prototipo de investigación publicado por el usuario Lucasgitguy-co en HuggingFace bajo licencia Apache-2.0. No es un modelo preentrenado de propósito general para image-to-3D, sino un *framework* de destilación que permite entrenar un estudiante compacto de imagen a Gaussian splats a partir de las salidas cacheadas de modelos profesor (Idol, InstantMesh y Hi3D). El repositorio incluye código de entrenamiento, validación, métricas, checkpoints y utilidades de importación/exportación de PLY gaussiano de grado cero.

La arquitectura se compone de un codificador de imagen compacto y un decodificador de coordenadas que predice parámetros gaussianos (posición, escala anisotrópica, rotación, color y opacidad). El entrenamiento está pensado para ejecutarse en Apple Metal (MPS) o CPU, con soporte de Python 3.11–3.13. El checkpoint de demostración incluido solo ha aprendido elipsoides procedurales sintéticos, por lo que no debe interpretarse como evidencia de calidad sobre imágenes reales.

El interés del proyecto radica en su enfoque de destilación multi-profesor y su vocación de ejecución local en hardware de consumo (Mac), en un momento en el que la generación 3D a partir de imagen única está dominada por pipelines pesados basados en GPU. Aun así, se trata de código de investigación en estado temprano, con componentes clave sin implementar (renderizado diferenciable, pérdida fotométrica multivista, estudiante binario de 1 bit y ejecución local de InstantMesh/Hi3D).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de imagen compacto + decodificador de coordenadas (predice gaussianas de grado cero) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo image-to-3D, no lingüístico) |
| Tipos de cuantizacion | no disponible; la línea base usa FP32 |
| Idiomas soportados | en (inglés, según metadatos) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoints `.pt` (PyTorch); exportación a PLY gaussiano de grado cero |

## Arquitectura y entrenamiento

El modelo sigue un esquema de destilación profesor-estudiante. El estudiante consta de un codificador de imagen compacto que produce una representación latente y un decodificador de coordenadas que emite parámetros de gaussian splatting: posición, escala anisotrópica, rotación, color y opacidad. La supervisión proviene de salidas cacheadas de tres profesores: Idol (PLY gaussiano), InstantMesh (malla triangular gruesa alineada como objetivo auxiliar de ocupación de superficie) e Hi3D (malla refinada alineada como segundo objetivo auxiliar). Las transformaciones entre mallas y el marco de coordenadas del PLY exportado por Idol se especifican mediante matrices afines 4×4 en JSON.

El pipeline incluye generación de datos sintéticos (`image3d demo-data`), entrenamiento con validación a nivel de objeto (`image3d train`), generación de PLY (`image3d generate`) y previsualización de turntable (`image3d preview`). El split de datos es determinista y agrupa todas las muestras del mismo `object-id` para evitar fuga de información entre entrenamiento y validación. `best.pt` se selecciona por la menor pérdida de destilación en validación; `last.pt` guarda el último paso completado. No hay reanudación del estado del optimizador desde checkpoint. En esta primera versión no se implementan renderizado diferenciable ni pérdida fotométrica multivista, y el estudiante binario de 1 bit está pendiente.

## Capacidades

- Generación de Gaussian splats de grado cero a partir de una imagen recortada y centrada de un único objeto.
- Entrenamiento local en Apple Metal (MPS) o CPU, sin necesidad de GPU NVIDIA.
- Destilación desde salidas cacheadas de Idol, InstantMesh e Hi3D (importación de PLY y mallas alineadas).
- Exportación e importación de PLY gaussiano preservando posición, escala anisotrópica, rotación, color y opacidad.
- Validación a nivel de objeto con métricas de pérdida de destilación en held-out.
- Generación de previsualizaciones de turntable a partir del PLY resultante.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: no es un modelo de lenguaje.
- No incluye eliminación automática de fondo; requiere recortes ya encuadrados.
- No implementa ejecución local completa de InstantMesh ni Hi3D; el adaptador para Idol en Mac es experimental y no verificado de extremo a extremo.

## Casos de uso

- Investigación en destilación 3D: usar el framework para comparar estrategias de destilación desde profesores como Idol o InstantMesh hacia un estudiante compacto, aprovechando la interfaz de caché y las métricas de validación incluidas.
- Prototipado en Mac sin GPU NVIDIA: entrenar y ejecutar el estudiante en Apple Silicon mediante MPS, lo que permite iterar en un portátil sin depender de clústeres GPU.
- Generación de activos 3D simples para previsualización: producir PLY gaussianos de objetos recortados y centrados para visualización rápida en herramientas compatibles con Gaussian Splatting.
- Docencia y experimentación: el comando `image3d demo-data` genera un conjunto sintético de elipsoides procedurales que sirve para validar el pipeline completo (entrenamiento, generación, preview y tests con pytest) sin necesidad de datos reales.
- Integración en pipelines de captura controlada: en escenarios de fotografía de producto con encuadre fijo, el modelo puede generar representaciones gaussianas de objetos a partir de recortes normalizados.
- Base para investigación en compresión de modelos 3D: el repositorio deja explícita la hoja de ruta hacia un estudiante binario de 1 bit, útil como punto de partida para estudiar cuantización extrema en image-to-3D.
- Evaluación de alineación entre profesores: las utilidades de transformación afín y validación de límites (`[-0.5, 0.5]^3`) permiten estudiar la consistencia geométrica entre Idol, InstantMesh e Hi3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el checkpoint de demostración solo aprendió elipsoides procedurales y que no debe usarse como evidencia de calidad sobre imágenes reales.

## Requisitos de hardware

- Inferencia y entrenamiento probados en Apple Metal (MPS) y CPU; el comando `image3d doctor` verifica el acceso a Metal del proceso.
- En terminales sandboxed, Metal puede reportarse como no disponible aunque un Terminal de macOS normal sí lo tenga; se puede forzar `--device mps` o dejar `auto` con fallback a CPU.
- No se especifican requisitos de VRAM ni modelos de GPU concretos (A100, H100, RTX 4090); el proyecto está orientado a ejecución local en Mac.
- El tamaño del repositorio es de 0.0 GB, lo que sugiere que los pesos no están incluidos o son mínimos.
- Opciones de despliegue: CLI propia (`image3d`) sobre PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Image3D Student v0.1.0 | Destilación image-to-Gaussian-splat (framework) | no disponible | no aplica | Apache-2.0 | HuggingFace, repo de 0.0 GB, 0 descargas |
| Idol | Profesor image-to-3D (Gaussian splatting) | no disponible | no aplica | no disponible en la información | Referenciado como profesor; ejecución en Mac experimental |
| InstantMesh | Profesor image-to-mesh | no disponible | no aplica | no disponible en la información | Referenciado como profesor; ejecución local no implementada |
| Hi3D | Profesor image-to-mesh refinado | no disponible | no aplica | no disponible en la información | Referenciado como profesor; ejecución local no implementada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo preentrenado de propósito general: es código de investigación en versión v0.1.0.
- El checkpoint de demostración solo aprendió elipsoides procedurales sintéticos; no ha aprendido de Idol, InstantMesh ni Hi3D y no debe usarse como evidencia de calidad sobre imágenes reales.
- No realiza eliminación automática de fondo; requiere recortes ya encuadrados con escala y orientación coherentes con los datos de entrenamiento.
- Las imágenes RGBA se componen sobre negro, replicando el preprocesado de Idol; fotos arbitrarias con desorden o encuadre distinto quedan fuera del contrato de entrada.
- Los objetivos deben caber en `[-0.5, 0.5]^3`; los objetivos fuera de límites se rechazan, no se normalizan silenciosamente.
- No se implementan renderizado diferenciable ni pérdida fotométrica multivista en esta línea base.
- El estudiante binario de 1 bit no está implementado; la línea base usa FP32.
- La ejecución local de InstantMesh e Hi3D no está implementada; el adaptador de Idol en Mac es experimental y el pipeline preentrenado completo no está verificado.
- La generación local de datos de los tres profesores sigue sin resolverse por completo.
- No se reanuda el entrenamiento del optimizador desde checkpoint; Ctrl-C guarda los pasos completados en `last.pt`.
- Con `--validation-fraction 0` no se genera `best.pt` ni se mide generalización.
- Licencia Apache-2.0 permite uso comercial, pero el estado de prototipo y la ausencia de validación sobre imágenes reales desaconsejan su uso en producción sin trabajo adicional.
- El modelo declara idioma `en` en metadatos, aunque al no ser lingüístico este campo es meramente administrativo.
- Sin descargas ni likes en HuggingFace en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Lucasgitguy-co/image3d-student
- Documentación de uso (Windows, Linux, macOS): `docs/USAGE.md` (referenciado en la model card, sin URL absoluta disponible)
- Guías de modelos del publicador: `docs/ALL_MODELS.md` (referenciado, sin URL absoluta disponible)
- Notas de versión: `CHANGELOG.md` (referenciado, sin URL absoluta disponible)
- Alcance de terceros: `THIRD_PARTY.md` (referenciado, sin URL absoluta disponible)
- Licencia: `LICENSE` (Apache-2.0, referenciado en el repositorio)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la búsqueda web proporcionada.
