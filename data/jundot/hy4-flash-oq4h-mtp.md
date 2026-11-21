# Jundot/Hy4-flash-oQ4h-mtp

## Resumen

Hy4-flash-oQ4h-mtp es una cuantizacion mixta de precision del modelo multimodal tencent/Hy4-flash, publicada por el usuario Jundot dentro del ecosistema oMLX. El modelo base, desarrollado por Tencent, es un transformer disperso (MoE) de 220.251 millones de parametros logicos, de los cuales 64B corresponden a tablas Engram y solo 12B estan activos por token, lo que lo situa como la variante mas economica de la familia Hy. Combina atencion dispersa y de ventana deslizante con Hyper-Connections de identidad, e incluye codificador de vision y un drafter DFly2 integrado para decodificacion especulativa.

Esta version concreta aplica la cuantizacion oQh de oQ, un esquema de precision mixta que rota los pesos de los expertos con una transformada de Hadamard antes de cuantizarlos, lo que permite destinar los bytes ahorrados en escalas de grupo a codigos de 5 bits en las proyecciones down de los expertos enrutados de 30 de las 41 capas MoE. El checkpoint resultante ocupa 132,4 GB en disco (123,3 GiB) con un promedio efectivo de 4,810 bits por peso, y mantiene en 8 bits la atencion, el indexer, el experto compartido, las proyecciones Engram, el embedding y la cabeza de salida, mientras routers y codificador de vision permanecen en BF16.

Su relevancia es doble: por un lado demuestra que es posible comprimir un modelo MoE multimodal de gran escala por debajo de 5 bits por peso sin degradar las partes sensibles, y por otro esta disenado especificamente para ejecutarse en Apple Silicon mediante MLX con la version de oMLX que soporta Hy4. No es un modelo para produccion generalista: es un artefacto de inferencia local orientado a hardware Apple con requisitos de memoria muy elevados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con atencion dispersa y de ventana deslizante, Hyper-Connections de identidad, tablas Engram, codificador de vision y drafter DFly2 |
| Parametros totales | 220.251B logicos (93.698.750.373 parametros reales almacenados en safetensors) |
| Parametros activos | 12B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQh mixta: 4-bit grupo 128, 5-bit grupo 128, affine 4-bit grupo 32 (Engram), affine 8-bit grupo 64, BF16 y FP32; promedio efectivo 4,810 bits/peso (4,676 en el backbone) |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (license_name: tencent-hy-license) |
| Formato de pesos | safetensors (MLX), libreria mlx |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 41 capas MoE, atencion dispersa combinada con ventana deslizante e Hyper-Connections de identidad, que sustituyen las conexiones residuales convencionales por mezclas aprendidas entre flujos. Incorpora tablas Engram de 64B de parametros logicos, un mecanismo de memoria o conocimiento parametrizado de gran tamano que se consulta de forma dispersa. El total de 220B logicos se reparte en 155,5B del backbone de lenguaje, 63,5B de Engram, 0,47B del codificador de vision y 0,85B del drafter DFly2. Solo 12B se activan por token, lo que reduce el coste computacional de inferencia pese al tamano del checkpoint.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable de esta version es la cuantizacion oQh: rotacion Hadamard de los pesos de expertos antes de cuantizar, asignacion no uniforme de bits (5 bits en las down projections de expertos enrutados de 30 capas, 4 bits en el resto de expertos, 8 bits en componentes sensibles) y preservacion de routers y vision en BF16. Ademas, el checkpoint integra el drafter DFly2 que oMLX ejecuta como Lightning MTP para decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Entrada de imagen y texto (pipeline image-text-to-text): el codificador de vision se mantiene en BF16 dentro del checkpoint.
- Mezcla de expertos con 12B parametros activos, lo que permite throughput relativamente alto para el tamano total.
- Decodificacion especulativa integrada mediante el drafter DFly2 (Lightning MTP en oMLX).
- Consulta de tablas Engram como mecanismo de conocimiento parametrizado disperso.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon de gran capacidad: el checkpoint esta empaquetado en formato MLX y pensado para oMLX, de modo que un equipo con memoria unificada suficiente (del orden de 128 GB o mas) puede ejecutar un modelo de 220B logicos con 12B activos sin GPU dedicada.
- Procesamiento de documentos con imagenes: al aceptar entrada image-text-to-text, puede emplearse para extraer y razonar sobre contenido de capturas, diagramas o documentos escaneados en flujos locales de escritorio.
- Prototipado de asistentes conversacionales de larga duracion: el uso de tablas Engram y atencion con ventana deslizante esta orientado a mantener contexto extenso; util para experimentar con memoria conversacional sin depender de la nube.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia practica para medir el impacto de oQh frente a oQe en un MoE multimodal, ya que ambos formatos comparten tamano de fichero.
- Investigacion sobre decodificacion especulativa: el drafter DFly2 integrado permite estudiar el rendimiento de Lightning MTP en un modelo de esta escala dentro de oMLX.
- Despliegue de demostraciones privadas y offline: al ejecutarse en local con licencia Tencent Hy, encaja en entornos donde no se permite enviar datos a APIs externas, siempre que se cumplan los terminos de la licencia.
- Fine-tuning o experimentation sobre el backbone de lenguaje: no recomendado directamente sobre este checkpoint cuantizado; requeriria partir del modelo base en FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 123,3 GiB en almacenamiento; para inferencia en MLX se necesita memoria unificada libre en torno a esa cifra mas overhead de KV cache y activaciones, por lo que se requieren equipos con 128 GB o mas (Mac Studio M3 Ultra de 192 GB o 256 GB, o configuraciones superiores).
- GPU recomendadas: no aplica en el sentido tradicional; el formato es MLX, orientado a Apple Silicon. No hay soporte documentado para A100, H100 ni RTX 4090 en esta version.
- Cabe en consumer GPU: no en GPU de consumo con 24 GB; tampoco en la mayoria de configuraciones de 48-80 GB. Solo es viable en hardware Apple con memoria unificada muy alta.
- Opciones de despliegue: exclusivamente oMLX en una version con soporte de Hy4 (jundot/omlx#5463); oMLX 0.8.0 y anteriores no pueden cargarlo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada. El uso de 12B parametros activos y del drafter DFly2 sugiere mejor throughput que un modelo denso de 220B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|---|
| Hy4-flash-oQ4h-mtp (esta ficha) | 220,25B logicos | 12B | no disponible | oQh mixta 4,81 bits/peso | Tencent Hy License | MLX safetensors |
| tencent/Hy4-flash (base) | 220,25B logicos | 12B | no disponible | BF16/FP8 | Tencent Hy License | safetensors |
| tencent/Hy4-flash-FP8 | 220,25B logicos | 12B | no disponible | FP8 | Tencent Hy License | safetensors |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento con alternativas.

## Limitaciones y advertencias

- Requiere una version especifica de oMLX con soporte de Hy4; las versiones 0.8.0 y anteriores fallan al cargar el checkpoint.
- El formato oQh es propietario del ecosistema oMLX; no es portable a otros motores MLX ni a otras librerias de inferencia.
- El requisito de memoria (mas de 123 GiB solo para pesos) excluye practicamente todo el hardware de consumo convencional.
- La cuantizacion a 4-5 bits puede introducir degradacion en tareas sensibles pese a la preservacion de componentes criticos en 8 bits y BF16; no se aportan evaluaciones que lo cuantifiquen.
- Licencia Tencent Hy License, no estandar abierta: es necesario revisar los terminos para uso comercial, redistribucion y restricciones de aceptacion.
- Riesgo de alucinacion inherente a modelos generativos de gran escala; no se documentan mitigaciones especificas.
- Idiomas soportados no documentados en esta ficha; la cobertura multilingue del modelo base no se detalla.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con ventanas largas.
- El checkpoint incluye el codificador de vision y el drafter, pero no se documentan limitaciones especificas de vision (resolucion, tipos de imagen).
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni reportes de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Hy4-flash-oQ4h-mtp
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Version FP8 del modelo base: https://huggingface.co/tencent/Hy4-flash-FP8
- Repositorio oQ / oMLX: https://github.com/jundot/omlx
- PR de soporte Hy4 en oMLX: https://github.com/jundot/omlx/pull/5463
- PR del formato oQh: https://github.com/jundot/omlx/pull/5317
