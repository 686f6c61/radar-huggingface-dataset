# acegiln/doctr-plus-shard8-checkpoints

## Resumen

DocTr++ shard 8 checkpoints es un repositorio de pesos experimentales publicados por el usuario acegiln en Hugging Face, asociado al paper DocTr++ (arXiv:2304.08796). No se trata de un modelo de lenguaje, sino de un conjunto de checkpoints para la tarea de deswarping geometrico de documentos, es decir, la correccion de la deformacion fisica que sufren las imagenes de documentos capturadas con camara (curvaturas de pagina, perspectiva, arrugas) para obtener una imagen plana y legible.

El repositorio contiene multiples ejecuciones de entrenamiento sobre un subconjunto de Doc3D. Cada ejecucion se identifica por un nombre que codifica el mecanismo de consulta (query) o la aumentacion aplicada y la semilla de entrenamiento: `baseline` corresponde a la reproduccion local, `content` anade una consulta de contenido aprendida, `position` actua como control posicional y `flip` emplea aumentacion de volteo horizontal. El esquema final de entrenamiento es de 65 epocas sobre 1.800 recortes de entrenamiento, con validacion sobre 198 recortes.

La relevancia de este repositorio es acotada: se trata de pesos de investigacion, no de un modelo listo para produccion, sin model card estandarizada, sin licencia declarada y sin metricas de rendimiento publicadas en la informacion disponible. Resulta util para quien quiera reproducir o continuar los experimentos del autor, o inspeccionar variantes de mecanismos de atencion/consulta en el contexto del deswarping de documentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos asociados al metodo DocTr++; arquitectura concreta no detallada en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision para deswarping de documentos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pth`, state dicts con prefijo `module.`); no se emplea safetensors ni GGUF |

## Arquitectura y entrenamiento

Los pesos corresponden al metodo DocTr++ descrito en el paper arXiv:2304.08796, orientado al deswarping geometrico de documentos. La informacion proporcionada no detalla la arquitectura interna (tipo de backbone, modulos de atencion, mecanismo de estimacion de flujo o rejilla de deformacion), por lo que este extremo queda como no disponible. Lo que si se documenta es la organizacion experimental: cada ejecucion dispone de su propia carpeta y de revisiones inmutables en el Hub, y los nombres codifican la variante (baseline, content, position, flip) junto con la semilla.

El entrenamiento se realizo sobre un subconjunto de Doc3D con 1.800 recortes de entrenamiento y 198 recortes de validacion, durante 65 epocas en el esquema final. Las variantes exploran el mecanismo de consulta: `content` introduce una consulta de contenido aprendida, `position` sirve de control posicional y `flip` aplica aumentacion de volteo horizontal. Los checkpoints de entrenamiento distribuido incluyen el prefijo `module.` en los state dicts. Cada ejecucion incluye un `snapshot.json` que registra la epoca, la configuracion y los digests SHA-256, lo que facilita la trazabilidad y la reproducibilidad.

## Capacidades

- Deswarping geometrico de documentos: correccion de deformaciones fisicas en imagenes de documentos capturadas con camara.
- Multiples variantes experimentales de mecanismo de consulta (baseline, content, position) y de aumentacion (flip), seleccionables segun la carpeta de ejecucion.
- Reanudacion de entrenamiento: los checkpoints intermedios incluyen `latest_train_state.pth` para continuar el entrenamiento.
- Inferencia con `best.pth` mediante `torch.load(..., map_location="cpu", weights_only=True)`.
- Trazabilidad via `snapshot.json` (epoca, configuracion, digests SHA-256).
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes ni multilingues; no aplican a este tipo de modelo.

## Casos de uso

- Reproduccion de experimentos academicos: cargar `best.pth` de cada variante para replicar los resultados del autor sobre el subconjunto de Doc3D empleado, comparando baseline frente a content, position y flip.
- Investigacion en deswarping de documentos: usar las variantes como punto de partida para estudiar el efecto de la consulta de contenido aprendida frente al control posicional en la calidad de la correccion geometrica.
- Continuacion de entrenamiento: reanudar desde `latest_train_state.pth` de una revision intermedia para extender el esquema (mas epocas, mas datos o ajustes de aumentacion).
- Construccion de pipelines de digitalizacion de documentos: integrar el modelo como etapa de preprocesado geometrico antes de OCR, siempre que se valide su calidad en el dominio objetivo (los pesos son experimentales).
- Auditoria de reproducibilidad: verificar la integridad de los checkpoints mediante los digests SHA-256 de `snapshot.json` antes de usarlos en experimentos.
- Comparacion de estrategias de aumentacion: evaluar el impacto del volteo horizontal (`flip`) frente al baseline en la validacion de 198 recortes.
- Base para fine-tuning en dominios especificos: partir de los pesos publicados para adaptar el deswarping a tipos de documento o condiciones de captura distintos de Doc3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 5,2 GB, pero ese tamano agrega todos los checkpoints y estados de entrenamiento, no la huella de inferencia de un unico `best.pth`.
- GPU recomendadas: no disponible. Al ser pesos de investigacion sin especificaciones publicadas, no puede determinarse una recomendacion fiable.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` con `map_location="cpu"` y `weights_only=True`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DocTr++ shard 8 (este repo) | Deswarping de documentos (pesos experimentales) | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| DocTr++ (implementacion de referencia del paper) | Deswarping de documentos | no disponible | no aplica | no disponible | Paper arXiv:2304.08796 |
| Alternativas de deswarping (p. ej. DocTr, DewarpNet) | Deswarping de documentos | no disponible | no aplica | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Pesos experimentales: el propio autor los describe como experimental weights, no como un modelo validado para produccion.
- Sin licencia declarada: no puede asumirse permiso para uso comercial; es necesario contactar con el autor o consultar la politica del repositorio antes de cualquier uso.
- Sin model card estandarizada ni idiomas, pipeline o metricas documentadas.
- Entrenado sobre un subconjunto reducido de Doc3D (1.800 recortes de entrenamiento, 198 de validacion); la generalizacion a otros dominios o condiciones de captura no esta demostrada.
- Sin benchmarks publicados en la informacion disponible; no hay evidencia cuantitativa de calidad.
- Riesgo de sobreajuste al subconjunto de datos empleado y a las condiciones especificas de Doc3D.
- Los state dicts incluyen el prefijo `module.` por entrenamiento distribuido; es necesario remapear las claves al cargar en un modelo no envuelto en DataParallel/DistributedDataParallel.
- El repositorio agrega multiples ejecuciones y estados de entrenamiento (5,2 GB), lo que exige seleccionar cuidadosamente el checkpoint (`best.pth` para inferencia) y verificar los digests de `snapshot.json`.
- No es un modelo de lenguaje: no ofrece generacion de texto, razonamiento, codigo ni capacidades conversacionales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/acegiln/doctr-plus-shard8-checkpoints
- Paper DocTr++ (referencia del metodo): https://arxiv.org/abs/2304.08796
