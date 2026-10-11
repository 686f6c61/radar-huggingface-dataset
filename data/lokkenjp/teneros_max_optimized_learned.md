# LokkenJP/TenEros_Max_optimized_learned

## Resumen

TenEros Max optimized learned es una derivacion de cuantizacion del checkpoint `TenStrip/10Eros-Max`, publicado por el usuario LokkenJP. No es un modelo entrenado desde cero: es una conversion de precision con preservacion de pesos ("weight-only quantization") orientada a ejecutar generacion de video a partir de texto e imagen en ComfyUI con un consumo de memoria muy inferior al original. El artefacto principal recomendado es la version V8, un hibrido INT8/W6A8/W4A8 con proteccion de las matrices de salida de atencion y de los bloques de borde. El checkpoint final ocupa 14.499.815.081 bytes (14,499815081 GB decimales), frente a los 40.222.982.192 bytes del checkpoint BF16 de origen, lo que supone una reduccion del 63,95 por ciento.

El modelo hereda la arquitectura y el pipeline de MiniMax-H3 (`pipeline_tag: image-text-to-video`) y se distribuye como componente "transformer-only": no incluye el encoder de texto, el VAE de video/audio, el vocoder ni el workflow completo, por lo que hay que combinanarlo con el resto de componentes del ecosistema H3. La libreria declarada es `minimax-h3` y el repositorio incluye un workflow de ejemplo en dos pasadas dentro de la carpeta `SampleWorkFlowTwoPassOptimized`.

Es relevante ahora porque permite ejecutar un modelo de video de gran tamano en hardware de consumo dentro de ComfyUI, manteniendo una politica de precision diferenciada por matriz en lugar de una cuantizacion uniforme. El autor advierte que es una release experimental y que la promocion de V8 se basa en validacion mecanica y pruebas A/B en vivo, no en un benchmark perceptivo controlado. El repositorio esta marcado como "not-for-all-audiences" y la licencia es la MiniMax-H3 Community License Agreement.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de MiniMax-H3); solo transformer, sin encoder de texto, VAE ni vocoder |
| Parametros totales | No disponible (el checkpoint BF16 de origen pesa 40.222.982.192 bytes; el autor no publica el recuento de parametros) |
| Parametros activos | No aplica / no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A8 ConvRot (group 16), W6A8 ConvRot (group 16 y 32), INT8 ConvRot con aprendizaje por activaciones proxy; tensores no objetivo preservados en BF16 byte a byte |
| Idiomas soportados | No disponibles |
| Licencia | minimax-h3-community-license-agreement (`license: other`) |
| Formato de pesos | safetensors (acompanado de `.sha256` y `.quantization.json`, que no son dependencias de inferencia) |

Datos adicionales del artefacto V8:

| Propiedad | Valor |
|---|---|
| Checkpoint de origen | `10Eros_Max_h3_TURBO-hybrid_beta5.safetensors` |
| SHA-256 del origen | `098f138f3e899d03821dd8296c8db3db6fa16371e50fcdd38661d347fd9a1dfa` |
| Tamano del origen | 40.222.982.192 bytes |
| Tamano final | 14.499.815.081 bytes (14,499815081 GB decimales) |
| Reduccion | 63,95 % |
| SHA-256 final | `de46e94cf134a9019939f4586ea39840147f604ad82df9e96a825f04ee63dee5` |

## Arquitectura y entrenamiento

El modelo es una conversion de precision, no un entrenamiento nuevo. La arquitectura subyacente es la del transformer de MiniMax-H3, en su variante TURBO-hybrid beta5, y el proceso aplicado es una cuantizacion aprendida con reconocimiento de activaciones ("proxy-activation learned quantization"). Sobre las 200 matrices principales del transformer se asignan formatos heterogeneos en funcion del error de reconstruccion normalizado por rol, con ponderacion de tamano de matriz de exponente 0,75 y una ponderacion 4x para los bloques protegidos. El reparto final es: 98 matrices en W4A8 ConvRot group 16, 0 en W4A8 group 8, 12 en W6A8 group 16, 71 en W6A8 group 32, 19 en INT8 ConvRot aprendido con AdamW personalizado, y 334 tensores no objetivo preservados en BF16 de forma identica al origen.

La innovacion principal es la politica de precision por capas: las 50 matrices de salida de atencion tienen un suelo de precision de W6 o INT8, y los bloques 0-1 y 47-49 exigen W6 group 16 o INT8 para todas sus matrices principales, mientras que los bloques 44-46 exigen W6 group 32 o INT8. El resto de matrices se asignan entre candidatas admitidas W4, W6 e INT8. La V8 reutiliza la captura y las poblaciones W4/W6 aprendidas de la V7 y anade aprendizaje INT8 informado por activaciones en las 200 matrices principales, sin otorgar ninguna bonificacion global de formato a INT8. No hay informacion disponible sobre volumen de tokens, composicion del dataset ni etapas de RLHF o DPO, dado que se trata de una derivacion y no de un modelo entrenado.

## Capacidades

- Generacion de video a partir de texto (text-to-video), a partir de imagen (image-to-video) y de imagen mas texto (image-text-to-video), segun los tags y el `pipeline_tag` declarados.
- Integracion con ComfyUI mediante nodos nativos que soporten W4A8, W6A8 e INT8, requisito explicito de la V8.
- Ejecucion en dos pasadas: el repositorio incluye un workflow de ejemplo en `SampleWorkFlowTwoPassOptimized`.
- Reduccion de huella de memoria del 63,95 por ciento respecto al BF16 de origen, manteniendo en BF16 los tensores no objetivo.
- Preservacion de la fidelidad en las capas criticas (salidas de atencion y bloques de borde) mediante suelos de precision.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni soporte multilingue: es un modelo generativo de video, no un modelo de lenguaje conversacional.
- No se declara soporte de audio generativo propio: el vocoder y el VAE de audio son componentes externos del ecosistema H3 que no se incluyen en este repositorio.

## Casos de uso

- Generacion de video local en ComfyUI: cargando el checkpoint V8 junto con los componentes H3 compatibles, un usuario con GPU de gama alta de consumo puede producir clips de imagen a video sin necesidad de instalar el checkpoint BF16 de 40 GB.
- Prototipado rapido de workflows: gracias a los 14,5 GB del checkpoint, iterar sobre prompts, seeds y configuraciones de dos pasadas es viable en una maquina de trabajo unica, reduciendo los tiempos de carga y descarga entre pruebas.
- Validacion A/B de estrategias de cuantizacion: el repositorio conserva V5 (INT8/W4), V7 (W6/W4), `BasicLearned/` y `ProxyActivatedLearned_v1/`, lo que permite comparar variantes sobre el mismo prompt y seed para elegir el equilibrio entre calidad y memoria.
- Despliegue en estaciones con VRAM limitada: al mantener en BF16 solo los 334 tensores no objetivo y comprimir el resto, es una opcion para equipos que no pueden alojar el modelo original completo.
- Pipelines por lotes de generacion de video: con el modelo residente en VRAM y alimentado por una cola de imagenes de entrada, se puede producir contenido de forma continuada sin recargar pesos entre lotes.
- Reproduccion de resultados con trazabilidad: el repositorio incluye `.sha256` y `.quantization.json` para cada release, lo que permite verificar los bytes del checkpoint y auditar la evidencia de ensamblado en un entorno de investigacion.
- Investigacion sobre cuantizacion aprendida: el reparto documentado de formatos por bloque (suelos de precision en capas de atencion y bordes) sirve como caso de estudio replicable para quien investigue tecnicas de compresion con reconocimiento de activaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente describe validaciones practicas: el checkpoint paso comprobaciones de candidatos/layout, bytes preservados, tamano exacto e integridad, y despues cargo y genero correctamente en pruebas en vivo con ComfyUI. El autor indica que el operador lo considero el mejor checkpoint probado en la campana y que un control con proteccion 8x retenia algunos detalles mejor pero introducia artefactos notables ausentes en la version final 4x. Son observaciones A/B practicas, no medidas cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor no publica un requisito oficial. Como referencia orientativa derivada del tamano del checkpoint, el fichero V8 de 14,499815081 GB exige al menos esa cantidad de memoria solo para los pesos, mas el espacio de activaciones y los componentes externos (encoder de texto, VAE de video/audio, vocoder). Los checkpoints legacy de 14 GB (`10Eros_Max_h3_hybrid_beta5_w4a8_14gb_optimized.safetensors`) apuntan a un perfil similar de memoria.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Viabilidad en GPU de consumo: no confirmada explicitamente por el autor; el objetivo declarado de la cuantizacion es "quality-oriented, weight-only quantizations ... for ComfyUI", con reduccion del 63,95 por ciento frente a los 40,22 GB del BF16.
- Opciones de despliegue: ComfyUI con soporte nativo de H3 y de los formatos W4A8, W6A8 e INT8. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de generacion de video.
- Advertencia de compatibilidad: los usuarios de "PlagueKind H3 MiniMax Cache" pueden sufrir un error `aimdo memory compile error: could not start recording` por interaccion con el compilador de modelos AIMDO de ComfyUI. La solucion indicada es saltarse el nodo de cache afectado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Precision | Estado | Licencia |
|---|---|---|---|---|---|
| TenEros Max optimized learned (V8) | Cuantizacion hibrida INT8/W6A8/W4A8 | 14,499815081 GB | Suelos W6/INT8 en 50 matrices de atencion; 4x de ponderacion en bloques protegidos | Recomendado actual | minimax-h3-community-license-agreement |
| TenEros Max optimized learned (V5) | Cuantizacion INT8/W4 | No disponible en la informacion proporcionada | Sin la campana de activaciones proxy | Alternativa preservada | minimax-h3-community-license-agreement |
| TenEros Max optimized learned (V7) | Cuantizacion W6/W4 | No disponible en la informacion proporcionada | Experimental, aceptada | Alternativa preservada | minimax-h3-community-license-agreement |
| BasicLearned W4A8 non-Turbo beta5 | Cuantizacion W4A8 | 14 GB | Validada en runtime, previa a la campana proxy-activation | Alternativa legacy para quien quiera el beta5 no-Turbo | minimax-h3-community-license-agreement |
| `TenStrip/10Eros-Max` (origen) | Modelo sin cuantizar | 40.222.982.192 bytes | BF16 | Fuente | Segun el repositorio de origen |

No se dispone de datos de rendimiento comparado entre estas variantes mas alla de la observacion cualitativa del autor sobre la V8. No hay comparacion publicada con otros modelos de generacion de video de terceros.

## Limitaciones y advertencias

- Es una release experimental: el propio autor la etiqueta como tal y advierte que la promocion de V8 refleja validacion mecanica y aceptacion A/B en vivo, no una garantia de mejores resultados para cualquier prompt, seed o workflow.
- Contenido no apto para todas las audiencias: el repositorio de origen esta marcado `not-for-all-audiences` y las mismas consideraciones de uso y contenido se aplican a esta derivacion.
- Licencia restrictiva: se rige por la MiniMax-H3 Community License Agreement, no por una licencia de codigo abierto permisiva. Hay que revisar sus terminos antes de cualquier uso comercial.
- Componentes incompletos: al ser una derivacion "transformer-only", no incluye encoder de texto, VAE de video/audio, vocoder ni workflow. Requiere los componentes compatibles del ecosistema H3; no es autosuficiente.
- Dependencia de soporte de formatos: la V8 exige runtime con soporte nativo de H3, W4A8, W6A8 e INT8. Un ComfyUI sin ese soporte no podra cargarla.
- Artefactos potenciales: el autor documenta que la variante con proteccion 8x introducia artefactos visibles que la version final 4x no presenta; no se descarta que aparezcan artefactos en determinados prompts o seeds con la configuracion final.
- Riesgo de alucinacion y sesgos: no hay informacion disponible sobre evaluaciones de sesgo, y no se han publicado metricas de fidelidad perceptiva frente al modelo de origen.
- Idiomas: no se declaran idiomas soportados, por lo que no es posible confirmar cobertura multilingue de los prompts.
- Sin benchmarks: no existen resultados publicados de MMLU, HumanEval, GSM8K ni de metricas de calidad de video (FVD, CLIP score, etc.) en la informacion disponible.
- Trazabilidad: los ficheros `.sha256` y `.quantization.json` permiten verificar integridad y evidencia de ensamblado, pero no son dependencias de inferencia; conviene conservarlos aparte.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned
- Checkpoint V8 (hibrido INT8/W6/W4, out y edge protegidos): https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/final_int8w6w4_hybrid/10Eros_Max_h3_TURBO-hybrid_beta5_proxy_activation_int8w6w4_hybrid_v8_14_5gb_out_edge_protected_final.safetensors
- Carpeta del artefacto principal: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/final_int8w6w4_hybrid
- Variante experimental V7 W6/W4: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/experimental_beta5_w6a8
- Variantes aprendidas basicas: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/BasicLearned
- Primera release con activaciones proxy: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/ProxyActivatedLearned_v1
- Conversion W4A8 del transformer beta5 no-Turbo (14 GB): https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/BasicLearned/10Eros_Max_h3_hybrid_beta5_w4a8_14gb_optimized.safetensors
- Workflow de ejemplo en dos pasadas: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/SampleWorkFlowTwoPassOptimized
- Modelo base: https://huggingface.co/TenStrip/10Eros-Max
- Licencia MiniMax-H3 Community License Agreement: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
