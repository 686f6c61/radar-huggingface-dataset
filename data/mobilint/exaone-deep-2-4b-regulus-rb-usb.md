# mobilint/EXAONE-Deep-2.4B-regulus-rb-usb

## Resumen

`mobilint/EXAONE-Deep-2.4B-regulus-rb-usb` es un paquete de despliegue publicado por Mobilint que contiene el modelo `LGAI-EXAONE/EXAONE-Deep-2.4B` de LG AI Research, compilado y optimizado para la pila de aceleracion por NPU de Mobilint. No se trata de un entrenamiento nuevo ni de un ajuste fino: la propia model card lo etiqueta como `base_model_relation: quantized` y lo describe como un artefacto "empaquetado para su despliegue en la pila de aceleracion de Mobilint", con la indicacion explicita de que esta pensado para usarse dentro de ese entorno.

El interes de este repositorio es, por tanto, de naturaleza practica: permite ejecutar un modelo conversacional de la familia EXAONE Deep sobre hardware NPU de Mobilint en lugar de sobre GPU generica, algo relevante para despliegues en el borde (edge), dispositivos embebidos y escenarios con requisitos de privacidad o de coste energetico. La libreria declarada es `mobilint` y el repositorio requiere `custom_code`, lo que implica que no se carga con un `transformers` estandar sin el runtime del fabricante.

La informacion publica disponible es muy limitada: el repositorio no incluye resultados de benchmarks, no detalla el esquema de cuantizacion aplicado, no especifica la longitud de contexto soportada y no describe el proceso de compilacion. Los unicos idiomas declarados son ingles (`en`) y coreano (`ko`). Todo lo que no aparece en la informacion proporcionada se marca como "no disponible" a lo largo de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se deriva del modelo base LGAI-EXAONE/EXAONE-Deep-2.4B; la model card de este repositorio no la especifica) |
| Parametros totales | 262.144.000 segun los metadatos de safetensors del repositorio (el modelo base se denomina comercialmente 2.4B; ver advertencias) |
| Parametros activos | no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio esta etiquetado como `base_model:quantized`, sin detallar el esquema) |
| Idiomas soportados | en (ingles), ko (coreano) |
| Licencia | EXAONE (`license: other`, `license_name: exaone`) |
| Formato de pesos | safetensors, con `custom_code` y libreria `mobilint` |
| Tamano del repositorio | 5.2 GB |
| Pipeline | text-generation |
| Modelo base | LGAI-EXAONE/EXAONE-Deep-2.4B |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO u otro tipo de alineamiento. Lo unico documentado es la relacion con el modelo base: este repositorio es una variante cuantizada y compilada de `LGAI-EXAONE/EXAONE-Deep-2.4B`, preparada para ejecutarse sobre la pila de aceleracion de Mobilint y no sobre GPUs convencionales.

Los elementos tecnicos diferenciales que si aparecen en los metadatos son el uso de la libreria `mobilint`, la presencia de `custom_code` y la etiqueta `region: us`. En la practica, esto implica que la carga del modelo depende del runtime propietario de Mobilint (probablemente con `trust_remote_code=True`) y que el grafo de inferencia ha sido transformado para el NPU objetivo. No se especifica cuantizacion por capas, calibracion, ni el formato intermedio de compilacion empleado.

## Capacidades

- Generacion de texto condicionada por prompt, con pipeline declarado `text-generation`.
- Uso conversacional: el repositorio incluye la etiqueta `conversational`, por lo que esta previsto para dialogos multi-turno.
- Cobertura multilingue limitada a ingles y coreano segun los idiomas declarados.
- Razonamiento: el nombre del modelo base (`EXAONE-Deep`) pertenece a la linea de modelos orientados a razonamiento de LG AI Research, pero la model card de este repositorio no documenta capacidades especificas de razonamiento, modo "thinking" ni presupuestos de computo por token.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles (no se declaran modalidades adicionales).
- Capacidades especiales (decodificacion especulativa, atencion lineal, etc.): no disponibles.

## Casos de uso

- Asistente conversacional embebido en dispositivos con NPU de Mobilint: el modelo puede gestionar dialogos multi-turno en ingles y coreano ejecutandose localmente sobre el acelerador, sin depender de conectividad ni de APIs externas.
- Procesamiento de texto con requisitos de privacidad: al ejecutarse en hardware local y sobre un modelo empaquetado, permite resumir, clasificar o reformular documentos sensibles sin enviar datos a la nube.
- Kioscos y terminales de atencion en coreano e ingles: generacion de respuestas y resumenes de consultas en puntos de atencion fisicos, donde el consumo energetico y la ausencia de GPU dedicada son factores determinantes.
- Traduccion asistida en/ko en entornos controlados: uso como apoyo a la traduccion o reformulacion entre ingles y coreano en aplicaciones de escritorio o integradas en dispositivos, sin salida a servicios externos.
- Preetiquetado y enriquecimiento de datos en el borde: generacion de resumenes, titulos o etiquetas en pipelines de recogida de datos que corren sobre hardware con NPU, reduciendo el coste de anotacion previa.
- Prototipado de pipelines de razonamiento en edge: banco de pruebas para medir cuanto de un flujo de razonamiento basado en la familia EXAONE Deep puede ejecutarse en NPU antes de escalar a un modelo mayor en servidor.
- Integracion en aplicaciones de escritorio o industriales que ya incorporan aceleracion Mobilint: aprovechar el mismo runtime y la misma cadena de despliegue para anadir una capa de generacion de lenguaje sin introducir GPU adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y la busqueda web realizada no aporto resultados tecnicos relevantes sobre este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto esta destinado a NPU de Mobilint, no a GPU, por lo que la metrica relevante es la memoria del acelerador, no la VRAM.
- GPU recomendadas: no aplica en el escenario previsto; el modelo esta compilado para la pila de aceleracion de Mobilint. No se documenta ejecucion sobre A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; el repositorio no declara rutas de ejecucion en CUDA ni en hardware de consumo.
- Opciones de despliegue: runtime de Mobilint (libreria `mobilint`, con `custom_code`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.
- Huella en disco: el repositorio ocupa 5.2 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue | Benchmark |
|---|---|---|---|---|---|---|
| mobilint/EXAONE-Deep-2.4B-regulus-rb-usb | 262.144.000 declarados en safetensors (base 2.4B) | no disponible | en, ko | EXAONE | safetensors + custom_code, NPU Mobilint | no disponible |
| LGAI-EXAONE/EXAONE-Deep-2.4B (modelo base) | 2.4B | no disponible en la informacion proporcionada | en, ko | EXAONE | safetensors, transformers | no disponible |
| Otros modelos pequenos de razonamiento de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas de terceros (por ejemplo, modelos densos de 2-4B orientados a razonamiento) no puede construirse con datos verificables a partir de la informacion proporcionada. La diferencia funcional principal frente al modelo base es el formato de despliegue: la variante de Mobilint esta atada a su runtime y su acelerador, mientras que el modelo original se distribuye para `transformers`.

## Limitaciones y advertencias

- Discrepancia en el recuento de parametros: los metadatos de safetensors declaran 262.144.000 parametros, muy por debajo de los 2,4 mil millones que sugiere el nombre del modelo base. Conviene verificar el contenido real del checkpoint antes de asumir un tamano concreto.
- Dependencia de hardware propietario: el modelo esta compilado para NPU de Mobilint. Sin ese runtime y ese acelerador no hay una ruta de ejecucion documentada.
- Licencia restrictiva: la licencia es `other` con `license_name: exaone`. Los terminos exactos no se recogen en la informacion proporcionada; es obligatorio revisar el enlace de licencia del modelo base antes de cualquier uso comercial.
- Cobertura idiomatica limitada: solo ingles y coreano. No hay soporte declarado de castellano ni de otras lenguas.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad ni tasas de alucinacion, un caveat habitual en modelos de esta escala.
- Ausencia de benchmarks: sin datos publicados no es posible estimar la calidad relativa frente a alternativas de tamano similar.
- Contexto no especificado: se desconoce la ventana de contexto soportada, lo que impide planificar cargas con documentos largos.
- Esquema de cuantizacion no documentado: se desconoce la perdida de precision introducida respecto al modelo base.
- Fecha de publicacion y traccion: el repositorio registra 0 descargas y 0 "likes", sin evidencia publica de uso en produccion.
- La busqueda web realizada no devolvio resultados tecnicos utiles sobre este modelo; los enlaces obtenidos no guardaban relacion con el.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mobilint/EXAONE-Deep-2.4B-regulus-rb-usb
- Modelo base en HuggingFace: https://huggingface.co/LGAI-EXAONE/EXAONE-Deep-2.4B
- Licencia EXAONE (modelo base): https://huggingface.co/LGAI-EXAONE/EXAONE-Deep-2.4B/blob/main/LICENSE
- Sitio de Mobilint: https://mobilint.com
- Repositorio de modelos de Mobilint (mblt-model-zoo): https://github.com/mobilint/mblt-model-zoo
- Resultados de busqueda web: no se encontraron enlaces relevantes sobre este modelo.
