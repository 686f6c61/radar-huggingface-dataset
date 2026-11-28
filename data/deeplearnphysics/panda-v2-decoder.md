# DeepLearnPhysics/Panda-V2-Decoder

## Resumen

Panda-V2-Decoder es el decodificador de consultas (query decoder) del detector Panda V2, un modelo de vision por computador orientado a segmentacion panoptica de nubes de puntos en detectores de particulas. Lo desarrolla el grupo DeepLearnPhysics y se distribuye como un checkpoint parcial (`decoder_core.pth`) pensado para inicializar el decodificador dentro de las recetas de fine-tuning de la libreria `pimm` (particle-imaging-models). No es un modelo autonomo: es un componente que se carga en un detector completo.

El modelo se ha preentrenado sobre escenas sinteticas y esta disenado para ser reutilizado en tres tipos de detectores de fisica de particulas: LArTPC (camaras de proyeccion temporal de argon liquido), sPHENIX y detectores Cherenkov de agua. Resuelve el problema de arrancar el entrenamiento del decodificador con pesos utiles en lugar de inicializacion aleatoria, lo que acelera la convergencia en las recetas de fine-tuning.

La relevancia actual es de nicho: se trata de infraestructura de investigacion para el pipeline de reconstruccion de eventos en experimentos de fisica de particulas, no de un modelo de lenguaje. El repositorio es muy pequeno (0,1 GB), tiene cero descargas y cero likes en el momento de la consulta, y su licencia e idiomas no estan declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de consultas (query decoder) con atencion sin terminos posicionales sobre consultas y puntos; banco de 64 queries aprendidas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre nubes de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`decoder_core.pth`, 92 tensores) |
| Libreria | pimm |
| Tarea | Segmentacion panoptica de nubes de puntos (particle-physics) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El checkpoint contiene los bloques del decodificador y la normalizacion final, en total 92 tensores. El nucleo se preentreno con un banco aprendido de 64 queries, pero su atencion no incorporaba terminos posicionales ni para las queries ni para los puntos. Por eso la model card indica que, al cargar el modelo, se debe activar `zero_init_positions=True` en el detector para que la tabla posicional de queries (`query_embed`) y la salida del MLP posicional de puntos arranquen a cero, tal como se hizo en el articulo asociado.

El checkpoint es deliberadamente parcial: no incluye el banco de queries (`query_feat`), ni la proyeccion de puntos, ni las cabezas de clasificacion y regresion, que conservan su inicializacion fresca. Se entreno sobre escenas sinteticas y esta pensado para inicializar el decodificador en las recetas de fine-tuning de `pimm` para LArTPC, sPHENIX y detectores Cherenkov de agua. No se dispone de informacion sobre el numero de tokens, el volumen del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Segmentacion panoptica de nubes de puntos en eventos de detectores de particulas.
- Procesamiento de escenas de LArTPC, sPHENIX y detectores Cherenkov de agua mediante el mismo decodificador.
- Atencion sobre un banco de 64 queries aprendidas para agregar informacion de la nube de puntos.
- Inicializacion de pesos para fine-tuning supervisado en las recetas de `pimm`.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision generica, audio ni otras capacidades multimodales fuera del dominio de fisica de particulas.

## Casos de uso

- Fine-tuning de detectores LArTPC: cargar `decoder_core.pth` con el hook `CheckpointLoader` y `strict=False` para inicializar el decodificador antes de entrenar sobre datos reales de un experimento de argon liquido.
- Reutilizacion en sPHENIX: emplear el mismo checkpoint como punto de partida del decodificador en las recetas de `pimm` para este detector, aprovechando el preentrenamiento sobre escenas sinteticas.
- Deteccion Cherenkov de agua: inicializar el decodificador en pipelines de segmentacion panoptica para este tipo de detector sin partir de pesos aleatorios.
- Investigacion en reconstruccion de eventos: usar el modelo como base para experimentar con variantes del decodificador y comparar convergencia frente a inicializacion aleatoria.
- Desarrollo de pipelines de imagen de particulas: integrar el checkpoint en flujos de `pimm` para reproducir los resultados del articulo con `zero_init_positions=True`.
- Prototipado de segmentacion panoptica: servir como componente de referencia para validar nuevas arquitecturas de decoder sobre nubes de puntos sinteticas antes de escalar a datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, pero el modelo completo requiere cargar tambien el resto del detector Panda V2.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del detector completo, no solo del decodificador.
- Opciones de despliegue: carga mediante la libreria `pimm` y el hook `CheckpointLoader` con `source="hf://DeepLearnPhysics/Panda-V2-Decoder/decoder_core.pth"`. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de segmentacion panoptica de nubes de puntos para detectores de particulas en la informacion consultada.

## Limitaciones y advertencias

- El checkpoint es parcial: solo contiene los bloques del decodificador y la normalizacion final (92 tensores); no incluye el banco de queries, la proyeccion de puntos ni las cabezas de clasificacion y regresion.
- Requiere `strict=False` al cargar y `zero_init_positions=True` en el detector para reproducir el comportamiento del articulo.
- Esta preentrenado sobre escenas sinteticas; el rendimiento sobre datos reales depende del fine-tuning posterior.
- No es un modelo de lenguaje: no procesa texto ni soporta idiomas, tool calling ni agentes.
- Licencia no declarada: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- Sin descargas ni likes registrados, lo que limita la evidencia de validacion por parte de la comunidad.
- Riesgo de sobreajuste a la distribucion de las escenas sinteticas de preentrenamiento.
- No se dispone de informacion sobre sesgos, tasas de alucinacion (no aplicable) ni limites de contexto.

## Enlaces

- Hugging Face: https://huggingface.co/DeepLearnPhysics/Panda-V2-Decoder
- Repositorio `pimm` (particle-imaging-models): https://github.com/DeepLearnPhysics/particle-imaging-models
