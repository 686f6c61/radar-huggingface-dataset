# narendra747/lfm2.5-230m-nvfp4

## Resumen

narendra747/lfm2.5-230m-nvfp4 es una conversion a NVFP4 del checkpoint LiquidAI/LFM2.5-230M, publicada por el usuario narendra747. No se trata de un modelo entrenado desde cero, sino de una receta de cuantizacion determinista (identificada como `nml-nvfp4-weight-v2`, variante "recipe-v2") aplicada sobre la revision `40cb2ad3b3044d5a41eee083a6103c8b523afa45` del modelo base de Liquid AI. El objetivo es reducir el peso del checkpoint y habilitar inferencia en 4 bits sobre hardware compatible con NVFP4.

La relevancia de esta publicacion es fundamentalmente practica: sirve como artefacto de despliegue para entornos con muy poca memoria y como referencia reproducible de un esquema de cuantizacion de bloque (bloques unidimensionales de 16 a lo largo del ultimo eje, payloads E2M1 con nibble bajo primero, escalas de bloque E4M3FN positivas y un factor global F32 por parametro cuantizado). RMSNorm y los kernels de convolucion depthwise se mantienen en BF16. La matriz de embedding y la LM head comparten un unico parametro fisico NVFP4, ya que el checkpoint de origen no almacena una segunda matriz `lm_head.weight`.

El repositorio es muy pequeno (0,1 GB) y no registra descargas ni likes en el momento de la consulta, por lo que debe considerarse un artefacto de nicho, sin validacion comunitaria. El dato de parametros reales reportado por safetensors es de 129.226.496, inferior a los 230M que sugiere el nombre del modelo base; no se dispone de informacion que explique esa diferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base pertenece a la familia LFM2.5 de Liquid AI; no se detalla en la informacion proporcionada) |
| Parametros totales | 129.226.496 (dato real de safetensors); el nombre del modelo base sugiere 230M |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits) con payloads E2M1 empaquetados en bloques de 16 a lo largo del ultimo eje, escalas de bloque E4M3FN positivas y un factor global F32 por parametro cuantizado; RMSNorm y kernels de convolucion depthwise en BF16 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (campo `license: other` con `license_name: lfm1.0` y `license_link: LICENSE`) |
| Formato de pesos | safetensors (libreria declarada: `nml`) |
| Modelo base | LiquidAI/LFM2.5-230M (revision 40cb2ad3b3044d5a41eee083a6103c8b523afa45) |
| Receta de conversion | nml-nvfp4-weight-v2 |
| Tamano del repositorio | 0,1 GB |
| Autor | narendra747 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre el entrenamiento del modelo base en los materiales disponibles: no hay datos sobre numero de tokens, composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO u otras. Tampoco se detalla la arquitectura interna de LFM2.5-230M mas alla de las etiquetas `lfm2` y `lfm2.5` asociadas al repositorio.

Lo que si esta documentado es el procedimiento de cuantizacion aplicado en esta publicacion. Se trata de una conversion determinista a NVFP4 con las siguientes caracteristicas: los pesos de embedding, atencion, proyecciones de convolucion y MLP se cuantizan con bloques unidimensionales de tamano 16 a lo largo del ultimo eje; los valores se almacenan como payloads E2M1 con el nibble bajo primero; cada bloque lleva una escala positiva en E4M3FN; y cada parametro cuantizado incorpora un factor global en F32. Los parametros de RMSNorm y los kernels de convolucion depthwise permanecen en BF16 para preservar precision en operaciones sensibles. La conversion se ejecuto exclusivamente en CPU y su procedencia exacta (conversor y dependencias) se registra en `nml-artifact-manifest.json`, junto con los hashes del checkpoint de origen y la disposicion tensor a tensor.

Un detalle estructural relevante es que la matriz de embedding y la LM head comparten un unico parametro fisico NVFP4, porque el checkpoint de origen no almacena una segunda matriz `lm_head.weight`. Cualquier herramienta de inferencia que espere dos tensores separados debera contemplar este caso.

## Capacidades

- Generacion de texto autoregresiva: es la funcion base esperada de un modelo de lenguaje denso de este tamano, si bien no se documentan capacidades especificas en la model card.
- No hay evidencia publicada de capacidades de razonamiento multi-paso, matematicas o codigo en la informacion disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Lo que si ofrece el artefacto es una capacidad de despliegue: inferencia en 4 bits con un checkpoint de 0,1 GB, orientada a entornos con memoria muy limitada y a hardware con soporte nativo de NVFP4.

## Casos de uso

- Despliegue en edge y dispositivos con memoria limitada: con un checkpoint de aproximadamente 0,1 GB, el modelo puede cargarse en entornos donde un modelo en BF16 del mismo tamano no cabria, siempre que el runtime soporte el formato NVFP4.
- Validacion de recetas de cuantizacion: al estar documentados la receta (`nml-nvfp4-weight-v2`), los hashes de origen y la disposicion de tensores, sirve para reproducir y auditar el proceso de conversion frente al checkpoint original.
- Comparacion de degradacion por cuantizacion: permite medir empiricamente la perdida de calidad respecto a LiquidAI/LFM2.5-230M en BF16, ejecutando el mismo conjunto de evaluacion sobre ambos checkpoints.
- Tareas de texto corto de baja latencia: clasificacion, etiquetado o generacion de respuestas breves en pipelines donde el coste por token y la huella de memoria son criticos.
- Componente auxiliar en cascadas de modelos: uso como primer eslabon (filtrado, enrutado o preprocesado) antes de invocar un modelo mayor, aprovechando su baja huella de memoria.
- Pruebas de integracion de runtimes NVFP4: util para verificar que una herramienta de inferencia concreta maneja correctamente bloques de 16, escalas E4M3FN y el caso de embedding y LM head compartidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio describe unicamente el procedimiento de conversion y no incluye metricas de calidad, latencia ni throughput. Tampoco se han encontrado datos en los resultados de la busqueda web, que no devolvieron contenido relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 0,1 GB segun el tamano del repositorio (129,2 M de parametros en 4 bits mas escalas y factores globales), muy por debajo de cualquier umbral de GPU de consumo actual.
- VRAM estimada para inferencia completa: no disponible (depende del runtime, del tamano de lote y de la longitud de contexto, ninguno de los cuales esta documentado).
- Ejecucion nativa en FP4: requiere hardware con soporte de NVFP4, asociado a la generacion Blackwell de NVIDIA. En GPUs anteriores el modelo tendria que decuantizarse o emularse, con la penalizacion de rendimiento correspondiente.
- Cabe en GPU de consumo: practicamente cualquier GPU moderna puede alojar los pesos por tamano; la limitacion real es el soporte del formato, no la memoria.
- Opciones de despliegue: la libreria declarada es `nml`; no hay confirmacion de compatibilidad con vLLM, llama.cpp, Ollama o TGI. Se debe considerar no disponible hasta verificarlo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| narendra747/lfm2.5-230m-nvfp4 | 129.226.496 (safetensors) | NVFP4 | no disponible | lfm1.0 | Comunidad; 0 descargas, 0 likes |
| LiquidAI/LFM2.5-230M (modelo base) | no disponible (el nombre sugiere 230M) | no disponible | no disponible | lfm1.0 | Repositorio oficial de Liquid AI |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos para establecer una comparativa fiable |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento de esta conversion con el del checkpoint original ni con modelos de tamano similar, por lo que cualquier comparacion cuantitativa seria especulativa.

## Limitaciones y advertencias

- No hay informacion publicada sobre sesgos del modelo base ni sobre el efecto de la cuantizacion en sesgos o en la calidad de las respuestas.
- Riesgo de alucinacion: no evaluado. Al tratarse de un modelo de ~129M de parametros, la fiabilidad factica esperable es baja, pero no se aportan mediciones.
- La cuantizacion a 4 bits puede introducir degradacion adicional respecto al checkpoint en BF16; no se documenta ninguna evaluacion comparativa.
- La ventana de contexto y los idiomas soportados no estan declarados, lo que impide planificar su uso en produccion multilingue o con entradas largas.
- Licencia: el repositorio declara `license: other` con `license_name: lfm1.0`, remitiendo al fichero LICENSE del propio repositorio. Las condiciones exactas de uso comercial deben verificarse en ese fichero y, en su caso, en los terminos de Liquid AI para el modelo base; no se reproducen aqui.
- La libreria `nml` no es un runtime de inferencia ampliamente adoptado; el soporte en herramientas estandar no esta confirmado.
- Detalle de implementacion critico: embedding y LM head comparten un unico parametro fisico. Los runtimes que esperen dos tensores distintos pueden fallar o cargar pesos incorrectamente.
- Discrepancia entre el nombre (230M) y los parametros reales de safetensors (129,2M): conviene verificar la correspondencia antes de reutilizar el artefacto.
- Repositorio de terceros sin descargas ni likes: no existe validacion de la comunidad sobre la fidelidad de la conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/narendra747/lfm2.5-230m-nvfp4
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Fichero de licencia del repositorio: LICENSE (referenciado en la model card, dentro del propio repositorio)
- Manifiesto de conversion: `nml-artifact-manifest.json` (referenciado en la model card, dentro del propio repositorio)
- Papers, blogs, repositorios o demos adicionales: no se han encontrado resultados relevantes en la busqueda web realizada.
