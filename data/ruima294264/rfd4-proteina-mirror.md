# RUIMA294264/rfd4-proteina-mirror

## Resumen

`RUIMA294264/rfd4-proteina-mirror` es un espejo no oficial del bundle de pesos de RFD4-Proteina, un modelo generativo de codiseño secuencia-estructura para proteínas, ARN, ADN y complejos con moléculas pequeñas, desarrollado por el Institute for Protein Design (David Baker Lab, Universidad de Washington) en colaboración con el equipo de IA generativa de NVIDIA. El espejo replica de forma byte a byte dos ficheros del repositorio `nvidia/RFD4-Proteina` (revisión fijada `a06e2509c7033b010fc43614e9fd840303588502`): `config.json` y `model.safetensors`, un export de flujo (flow) más autoencoder.

El modelo resuelve el problema del diseño de proteínas *de novo* y del rediseño condicionado: en lugar de cribar bibliotecas enormes de secuencias, genera directamente estructuras y secuencias plausibles que satisfacen restricciones (motivos, sitios de unión, bolsillos para ligandos). Es relevante porque unifica en un solo modelo tareas que antes requerían pipelines separados (monómeros, binders proteicos y de ADN, anticuerpos y nanobodies, enzimas, andamiaje de motivos) e incorpora difusión parcial y búsqueda guiada por recompensa.

El bundle publicado contiene 435.622.465 parámetros en un único `model.safetensors` de 1.742.660.596 bytes (1,7 GB), tamaño coherente con un export en fp32. No es un modelo de lenguaje: no procesa lenguaje natural ni tiene ventana de contexto en tokens. La información disponible no detalla la arquitectura interna del backbone generativo, el volumen de datos de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo generativo de codiseño secuencia-estructura basado en flujo (flow matching) con autoencoder; el detalle del backbone no está documentado en la información disponible |
| Parámetros totales | 435.622.465 |
| Parámetros activos | No aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | No aplica / no disponible: no es un modelo de lenguaje; la longitud se especifica en residuos y coordenadas estructurales |
| Tipos de cuantización | No disponible. El export publicado es un único `model.safetensors` de 1.742.660.596 bytes, coherente con fp32 para 435,6 M de parámetros; no se ofrecen variantes cuantizadas |
| Idiomas soportados | No aplica (no procesa lenguaje natural); esta ficha se redacta en castellano por convención editorial |
| Licencia | BSD-3-Clause, Copyright (c) 2026 Institute for Protein Design, University of Washington |
| Formato de pesos | `safetensors` (`model.safetensors`) + `config.json`; no hay GGUF, ONNX ni otros formatos |
| Autor del espejo | RUIMA294264 (usuario de HuggingFace, no afiliado al proyecto) |
| Modelo upstream | `nvidia/RFD4-Proteina`, revisión fijada `a06e2509c7033b010fc43614e9fd840303588502` |
| Librería declarada | `rfd4-proteina` |
| Pipeline | No disponible |
| Tamaño del repositorio | 1,7 GB |
| SHA-256 de `model.safetensors` | `5b549dd61adb2f6c6b5cb95bda13f40f5e31556b4e6c755edc0ca6f011c68fb0` |
| SHA-256 de `config.json` | `154ea927ab8005b7eac2d047a792147fb4606ab4878e496aa8414b6b40dad368` (7.270 bytes) |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-25 / 2026-10-25 |

## Arquitectura y entrenamiento

La información disponible describe el bundle como un export de "flow + autoencoder": un modelo generativo de flujo que produce estructura y secuencia de forma conjunta, apoyado en un autoencoder, y que puede condicionarse mediante motivos estructurales, sitios de unión, bolsillos para ligandos pequeños y restricciones de secuencia. El modelo cubre explícitamente proteínas, ARN, ADN y complejos con moléculas pequeñas, y soporta modos de inferencia adicionales como difusión parcial (para rediseño y optimización de estructuras parciales) y búsqueda guiada por recompensa. No se especifican en la información proporcionada el número de capas, la dimensionalidad del backbone, el mecanismo de atención ni los detalles del scheduler de difusión.

Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset (la model card del upstream remite a una dataset card propia con sus propios términos de origen) ni si hubo etapas de RLHF, DPO o ajuste por preferencias; en un modelo de esta naturaleza el equivalente sería el ajuste por recompensa, mencionado como capacidad de inferencia pero no documentado como fase de entrenamiento. La citación de resultados exige acompañar la revisión exacta del modelo, la revisión del código, la semilla, las entradas y la configuración de muestreo, lo que sugiere que la reproducibilidad depende fuertemente de esos parámetros.

## Capacidades

- Codiseño secuencia-estructura: genera secuencias plausibles sin necesidad de una etapa posterior de refinamiento (tipo ProteinMPNN).
- Diseño de monómeros proteicos *de novo*.
- Diseño de binders proteicos y binders de ADN.
- Diseño de anticuerpos y nanobodies.
- Diseño de enzimas y andamiaje de motivos (motif scaffolding).
- Diseño de bolsillos para moléculas pequeñas (small-molecule pockets).
- Condicionamiento robusto: motivos estructurales, sitios de unión y restricciones de secuencia.
- Difusión parcial: rediseño y optimización local de estructuras existentes.
- Búsqueda guiada por recompensa (reward-guided search) sobre el espacio generado.
- Modelado de complejos multiméricos proteína-ADN-ARN-ligando.
- No soporta tool calling, function calling, agentes basados en lenguaje natural, visión ni audio: no es un modelo multimodal de propósito general.
- Capacidades multilingües: no aplica.

## Casos de uso

- Diseño de candidatos terapéuticos de novo: generación de monómeros con un fold y una función objetivo definidos, partiendo de especificaciones topológicas; el modelo devuelve estructura y secuencia coherentes en una sola pasada, lo que reduce el número de rondas de filtrado computacional previas a la síntesis.
- Diseño de binders contra una diana concreta: condicionando el epitelio de unión sobre la superficie de la proteína diana se obtienen secuencias de unión que después se validan por modeling y experimentalmente; aplicable a modales como anticuerpos o nanobodies.
- Ingeniería de enzimas: partiendo de un motivo catalítico conocido (motif scaffolding), se genera un andamiaje proteico estable que reposiciona los residuos catalíticos, útil para reingeniería de actividad o de especificidad de sustrato.
- Descubrimiento frente a dianas con estructura conocida pero ligandos desconocidos: generación de bolsillos para moléculas pequeñas que sugieran farmacóforos y geometrías de unión antes del cribado virtual.
- Rediseño y humanización parcial: uso de difusión parcial sobre una estructura existente para modificar regiones concretas (por ejemplo, regiones determinantes de complementariedad) manteniendo el resto del pliegue.
- Optimización guiada por recompensa en pipelines de diseño: integración de una función de score (estabilidad predicha, solubilidad, afinidad estimada) como recompensa para sesgar el muestreo hacia candidatos con mejores métricas in silico.
- Despliegue interno reproducible: descarga del bundle verificado por SHA-256 desde este espejo para entornos con acceso lento o restringido a HuggingFace, ejecutando la generación con el paquete `rfd4-proteina` desde PyPI o el repositorio RosettaCommons.
- Prototipado rápido vía endpoint gestionado: uso de la implementación en NVIDIA NIM para validar prompts y configuraciones de muestreo antes de invertir en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del proyecto y la model card del upstream no incluyen en el material consultado tablas de métricas (por ejemplo, success rate de diseño, TM-score, diversidad, tasa de plegamiento correcto) ni comparaciones numéricas con modelos previos. Cualquier cifra que se cite en producción debería proceder de la documentación oficial de RFD4-Proteina y acompañarse de la revisión de modelo, semilla y configuración de muestreo empleadas.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,74 GB en fp32 (el fichero `model.safetensors` ocupa 1.742.660.596 bytes). El consumo total de inferencia es mayor y depende de la longitud de la proteína, del tamaño del lote y del número de pasos de muestreo; no hay cifras oficiales publicadas.
- GPU recomendadas: no disponible en la información. Por tamaño de pesos, el modelo cabe en GPUs de consumo; para lotes grandes o cadenas largas se recomienda una GPU con 16-24 GB (RTX 4090, A10G, L4, A100 40/80 GB), pero esta recomendación es una estimación de ingeniería, no un dato del autor.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño del bundle (1,7 GB); las GPUs con 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) son candidatas razonables siempre que el muestreo y la longitud de cadena se mantengan moderados.
- No hay variantes cuantizadas (GGUF, AWQ, GPTQ) ni soporte documentado en llama.cpp, Ollama o TGI, que además no son aplicables a este tipo de modelo.
- Opciones de despliegue: paquete `rfd4-proteina` desde PyPI, repositorio `RosettaCommons/RFD4-Proteina`, y endpoint gestionado en NVIDIA NIM (`build.nvidia.com/ipd/rfd4-proteina`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| Este espejo (`RUIMA294264/rfd4-proteina-mirror`) | 435.622.465 | No aplica | BSD-3-Clause | HuggingFace | Idéntico al upstream (SHA-256 verificado); 0 descargas |
| `nvidia/RFD4-Proteina` (upstream) | 435.622.465 (mismo bundle) | No aplica | BSD-3-Clause | HuggingFace + NVIDIA NIM | Referencia canónica; incluye dataset card y requisitos de citación |
| RFdiffusion (Baker Lab, generación anterior) | No disponible | No aplica | No disponible | No disponible | No disponible en la información proporcionada |
| ProteinMPNN (diseño de secuencia dado un backbone) | No disponible | No aplica | No disponible | No disponible | No disponible en la información proporcionada |

La información consultada no incluye cifras de rendimiento comparadas con RFdiffusion, ProteinMPNN ni otros modelos de diseño de proteínas, por lo que la comparación cuantitativa queda como "no disponible". La diferencia funcional que sí documenta el proyecto es de alcance: RFD4-Proteina integra estructura y secuencia en un único modelo, mientras que los enfoques anteriores separan generación de backbone y diseño de secuencia.

## Limitaciones y advertencias

- Es un espejo de terceros, no oficial: 0 descargas y 0 likes, sin garantía de mantenimiento, actualización ni soporte. Verificar siempre el SHA-256 de `model.safetensors` antes de usarlo.
- El espejo solo re-aloja dos ficheros (`config.json` y `model.safetensors`); el código de generación debe obtenerse por separado del paquete `rfd4-proteina` o del repositorio `RosettaCommons/RFD4-Proteina`.
- No hay model card propia: toda la información técnica procede de la documentación del upstream, no verificada de forma independiente en este repositorio.
- Licencia BSD-3-Clause: permite uso comercial y modificación, pero exige conservar el aviso de copyright (Institute for Protein Design, University of Washington) y la cláusula de no aval; el mirror debe mantener la licencia upstream.
- El modelo no es un LLM: no admite tool calling, agentes conversacionales, ni instrucciones en lenguaje natural; usarlo como tal producirá resultados inválidos.
- Plausibilidad estructural no equivale a función: los diseños generados requieren validación computacional (plegamiento predicho, energía, clashes) y experimental (expresión, solubilidad, ensayos funcionales).
- Sesgos potenciales derivados del dataset de entrenamiento (sesgo hacia plegamientos y composiciones sobrerrepresentados en las bases de datos estructurales); no cuantificados en la información disponible.
- Riesgo de sobreconfianza en las métricas in silico, especialmente al usar búsqueda guiada por recompensa, que puede explotar defectos del scorer elegido.
- Sin resultados de benchmarks publicados en la información consultada: no hay base para afirmar superioridad frente a alternativas.
- Fecha de creación del repositorio en 2026-10-25, coherente con el copyright declarado, pero conviene comprobar que la revisión fijada del upstream sigue siendo la vigente.

## Enlaces

- Espejo en HuggingFace: https://huggingface.co/RUIMA294264/rfd4-proteina-mirror
- Modelo upstream: https://huggingface.co/nvidia/RFD4-Proteina
- Documentación oficial: https://rfd4-proteina.org/latest/index.html
- Repositorio de código: https://github.com/RosettaCommons/RFD4-Proteina
- Endpoint NVIDIA NIM: https://build.nvidia.com/ipd/rfd4-proteina
- Model card en NVIDIA NIM: https://build.nvidia.com/ipd/rfd4-proteina/modelcard
