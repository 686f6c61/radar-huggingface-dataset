# livadies/worldsculpt-pipeline

## Resumen

`livadies/worldsculpt-pipeline` no es un modelo de IA en el sentido habitual, sino un repositorio de experimento (0 descargas, 0 likes, licencia no declarada) cuyo objetivo es reproducir el metodo WorldSculpt de Alaya Lab y la Universidad de Tokio para reconstruccion 3D composicional de escenas. El pipeline toma una escena ya anotada —fotogramas, mascaras por instancia, cajas 3D en coordenadas de mundo y mapas de profundidad opcionales— y devuelve un conjunto de mallas independientes, una por objeto, mas una malla de escena completa en formato `scene.glb`.

El problema que aborda es el de la separacion de objetos en reconstruccion 3D: en lugar de generar una nube de puntos o un campo de radiancia global, WorldSculpt produce geometria explicita por instancia, lo que permite abrir el resultado en herramientas estandar como Blender. Internamente el repositorio encadena Pixal3D (ajustado con LoRA sobre objetos ocluidos), el entorno base de TRELLIS.2 en su variante de 4B y un extractor de caracteristicas DINOv3.

Su relevancia actual es limitada y muy condicionada: el propio autor declara el estado como "preparacion, entorno aun no ensamblado", y el repositorio no contiene codigo capaz de generar las entradas intermedias `_step1/*.npz` ni `_step2/transforms.npz` que exige su punto de entrada. Se trata, por tanto, de un banco de pruebas en construccion, no de un artefacto desplegable. La model card esta redactada en ruso y las busquedas web realizadas no devolvieron ningun enlace tecnico relevante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de reconstruccion 3D composicional; encadena Pixal3D (con LoRA), TRELLIS.2-4B y DINOv3. No es un transformer de lenguaje |
| Parametros totales | no disponible (el componente TRELLIS.2 declarado es de 4B; el total del pipeline no se especifica) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision/reconstruccion 3D, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta en ruso; el pipeline no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible para el repositorio; usa pesos de Pixal3D (~12 GB de 46 GB necesarios) y TRELLIS.2-4B (16,2 GB). Los formatos concretos no se declaran |
| Entradas | `frames/NNN.png`, `masks/<objeto>/NNN.png`, `transforms.json` con `instances[].aabb_world`, y `depth_gt/NNN.png` opcional |
| Salidas | `_crops/` (recortes de objeto), `_recon/` (mallas por objeto), `_scene/scene.glb` (escena completa) |
| Pesos adicionales | LoRA WorldSculpt, 341 MB |
| GPU declarada | H100 (sm_90), ejecutada en Modal |
| Estado del repositorio | preparacion; entorno no ensamblado |

## Arquitectura y entrenamiento

El pipeline sigue el planteamiento del paper WorldSculpt (identificador citado: arXiv 2609.05416, septiembre de 2026), que parte de una escena con segmentacion por instancias ya resuelta y genera una malla por objeto en lugar de una representacion volumetrica global. La cadena tecnica declarada combina Pixal3D, ajustado con un LoRA de 341 MB especificamente sobre objetos ocluidos, sobre el entorno base de TRELLIS.2 en su variante de 4B parametros, con DINOv3 como extractor de caracteristicas visuales.

No se proporciona informacion sobre volumen de tokens de entrenamiento, composicion del dataset, ni si hubo etapas de RLHF o DPO; estos datos no aplican de forma directa al ser un modelo generativo 3D. El autor si documenta el entorno de ejecucion requerido: torch 2.6.0+cu124, flash-attn 2.7.3 y seis o siete extensiones CUDA compiladas desde fuente (nvdiffrast, nvdiffrec, CuMesh, FlexGEMM, o-voxel y NATTEN 0.21.0), lo que constituye la parte mas fragil del proyecto.

Como contexto de motivacion, el autor cierra un experimento previo (`livadies/blender-3dgs-pipeline`) por inviabilidad practica: 246 292 gaussianas de 0,0003 de radio ocupaban entre 0,03 y 0,14 pixeles en pantalla y Blender no las representaba. El cambio a mallas explicitas responde directamente a ese fallo. Tambien se documenta que el repositorio de WorldSculpt no incluye codigo para generar `_step1` (salidas de ViPE, Depth Anything 3 y MoGe) ni `_step2`, por lo que solo es alimentable con el benchmark de los propios autores.

## Capacidades

- Generacion de mallas 3D por objeto a partir de escenas con segmentacion por instancias ya disponible.
- Composicion de multiples mallas en una unica escena exportable a glTF (`_scene/scene.glb`).
- Manejo de oclusion entre objetos, gracias al ajuste LoRA de Pixal3D sobre objetos parcialmente tapados.
- Uso de cajas 3D en coordenadas de mundo (`aabb_world`, `center_world`, `extent`) para situar cada instancia.
- Aceptacion de mapas de profundidad opcionales como senal adicional de reconstruccion.
- Extraccion de recortes de objeto (`_crops/`) como paso intermedio reutilizable.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingues: no procesa texto.
- No dispone de modo "thinking", vision por prompt, audio ni entrada de lenguaje natural. La entrada es exclusivamente geometrica y de imagen con mascaras precalculadas.

## Casos de uso

- Extraccion de assets para motores de videojuego: a partir de una escena capturada y segmentada, generar mallas separadas por objeto listas para importar en Unity o Unreal, evitando el trabajo manual de separacion de geometria.
- Post-produccion en Blender: el resultado es un `.glb` que Blender abre de forma nativa, a diferencia de un conjunto de gaussianas de radio subpixel, lo que permite integrar la reconstruccion en flujos de trabajo de animacion y render existentes.
- Investigacion en reconstruccion 3D composicional: sirve como banco de pruebas reproducible para comparar contra el metodo original de Alaya Lab usando el mismo benchmark anotado (`marble_serene_living_room_countryside_view`, 24 fotogramas, 13 objetos).
- Generacion de escenas de interior digitalizadas: reconstruccion de habitaciones completas con mobiliario individualizado, util para catalogos inmobiliarios o gemelos digitales.
- Evaluacion de robustez ante oclusion: el ajuste de Pixal3D sobre objetos tapados permite estudiar el comportamiento del pipeline en escenas densas, como `marble_warm_and_inviting_living_room` (17 objetos).
- Preparacion de datos sinteticos para otros modelos 3D: las mallas por objeto y los recortes de `_crops/` pueden reutilizarse como material de entrenamiento o validacion.
- Automatizacion de pipelines de fotogrametria con anotacion previa: dado que el repositorio exige mascaras y cajas ya calculadas, encaja en entornos donde un equipo ya dispone de un etiquetador de instancias propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card afirma que los autores del metodo original si publicaron resultados y que, por tanto, el metodo subyacente es funcional, pero no reproduce ninguna cifra concreta ni tabla comparativa. Tampoco hay metricas de latencia, throughput ni consumo de memoria medidas por el autor del repositorio.

## Requisitos de hardware

- GPU declarada: H100 (arquitectura sm_90). El autor la ejecuta sobre Modal con coste por uso.
- Pesos necesarios: LoRA WorldSculpt 341 MB, Pixal3D ~12 GB (de un total de 46 GB, solo se requieren las variantes `_mv` y los decodificadores), TRELLIS.2-4B 16,2 GB. Suma aproximada de pesos: 28-29 GB.
- Estimacion de VRAM: segun los tamanos declarados, en precision completa o fp16 el conjunto no cabe en GPUs de consumo con 24 GB (RTX 4090, 3090). Se necesitaria previsiblemente una GPU de 40-80 GB. Esta estimacion es propia y no ha sido confirmada por el autor.
- Cabe en GPU de consumo: no confirmado; con los datos disponibles, improbable sin cuantizacion adicional, y no se documenta ninguna.
- Extensiones CUDA obligatorias compiladas desde fuente: nvdiffrast, nvdiffrec, CuMesh, FlexGEMM, o-voxel y NATTEN 0.21.0.
- Entorno de software: torch 2.6.0+cu124 y flash-attn 2.7.3.
- Datos de entrada: conjunto Marble de `AlayaLab/Worldsculpt_data`, `Marble/Marble.tar.gz`, 346 736 507 bytes, cinco escenas reales.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; son herramientas para modelos de lenguaje y no aplican a este pipeline. El unico metodo descrito es la ejecucion en contenedor sobre Modal.
- Latencia y throughput: no disponible. El unico dato de transferencia mencionado (7 MB/s) corresponde a la conexion de la maquina del autor, no al rendimiento de inferencia.

## Comparativa con modelos similares

| Sistema | Tipo de salida | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| livadies/worldsculpt-pipeline | Mallas por objeto + escena glb | no disponible (TRELLIS.2-4B como base) | no aplicable | no disponible | Repositorio de experimento, entorno no ensamblado |
| WorldSculpt (AlayaLab) | Mallas composicionales por objeto | no disponible | no aplicable | no disponible | Codigo publico en GitHub; resultados publicados por los autores |
| TRELLIS.2 (Microsoft) | Mallas y representaciones 3D | 4B (variante declarada) | no aplicable | no disponible en la informacion | Repositorio publico, usado aqui como entorno base |
| Pixal3D (TencentARC) | Reconstruccion 3D de objetos | no disponible | no aplicable | no disponible en la informacion | Publicado en HuggingFace; ajustado con LoRA en este experimento |
| livadies/blender-3dgs-pipeline | Gaussianas 3D (proyecto cerrado) | no aplicable | no aplicable | no disponible | Cerrado como fallido; 246 292 gaussianas, 0,0003 de radio |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo con pesos descargables y utilizables de forma directa: es un repositorio de orquestacion con estado "preparacion, entorno no ensamblado".
- Licencia no declarada, lo que impide cualquier uso comercial o redistribution con garantias juridicas.
- El punto de entrada del codigo exige `_step1/*.npz` y `_step2/transforms.npz`, y no existe ningun script en el repositorio capaz de generarlos. Sin esos ficheros el pipeline no arranca.
- No acepta fotografias sin procesar. Requiere obligatoriamente mascaras por instancia y cajas 3D en coordenadas de mundo. El propio autor descarta el uso de fondos de archivo (archive.org) por esta razon.
- Los datos de entrada deben provenir del benchmark de los autores; no se documenta ninguna fuente alternativa.
- Riesgo elevado de fallo en la compilacion de seis o siete extensiones CUDA desde fuente, con NATTEN 0.21.0 como punto especialmente fragil.
- Coste economico: la ejecucion se plantea en H100 sobre Modal, facturada por uso.
- Sin benchmarks publicados, sin descargas y sin likes en el momento de la consulta: el artefacto no ha sido validado por terceros.
- La model card esta en ruso, lo que puede dificultar el mantenimiento a equipos que no lo lean.
- Las fechas declaradas (creacion 2026-09-20) y el identificador de arXiv citado (2609.05416) no han podido verificarse de forma independiente con la informacion disponible.
- No hay datos sobre sesgos, alucinacion, limites de contexto o idioma, porque el sistema no opera sobre texto ni lenguaje natural.
- Rendimiento real, latencia y consumo de VRAM no han sido medidos ni confirmados por el autor.

## Enlaces

- HuggingFace del repositorio: https://huggingface.co/livadies/worldsculpt-pipeline
- Repositorio del metodo WorldSculpt: https://github.com/AlayaLab/WorldSculpt
- Paper citado en la model card: arXiv 2609.05416 (identificador proporcionado; no se incluye URL en la informacion)
- Pixal3D en HuggingFace: https://huggingface.co/TencentARC/Pixal3D
- TRELLIS.2 en GitHub: https://github.com/microsoft/TRELLIS.2
- Experimento previo cerrado: https://huggingface.co/livadies/blender-3dgs-pipeline (URL inferida del identificador citado)
- Dataset de referencia: `AlayaLab/Worldsculpt_data`, fichero `Marble/Marble.tar.gz` (no se proporciona URL en la informacion)
- Enlaces de la busqueda web: no se han encontrado enlaces tecnicos relevantes; los resultados devueltos corresponden a paginas genericas de YouTube y no guardan relacion con el modelo.
