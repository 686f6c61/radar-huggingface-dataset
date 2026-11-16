# Lucasgitguy-co/minicpm-v-4-7-1b-mermaid-adapter-GGUF

## Resumen

MiniCPM-V 4.7 1B Mermaid LoRA GGUF es un adaptador LoRA en formato GGUF para llama.cpp, publicado por el usuario Lucasgitguy-co, que se aplica sobre el modelo base multimodal openbmb/MiniCPM-V-4.7-1B. Su proposito concreto es especializar al modelo en la generacion de codigo Mermaid, el lenguaje de marcado para diagramas (flowcharts, diagramas de secuencia, etc.), partiendo de las capacidades de vision y texto del MiniCPM-V original. No se trata de un modelo completo, sino de un complemento de bajo rango (rank 8, alpha 16) que modifica unicamente la torre de lenguaje, sin tocar el codificador visual.

El adaptador se distribuye como un unico fichero de 0,010 GB en precision F16, pensado para cargarse con el flag `--lora` de llama.cpp sobre el GGUF oficial del modelo base. Segun la model card, se ha verificado que la combinacion base F16 + LoRA produce exactamente la misma salida greedy que un modelo fusionado manualmente, lo que confirma que el adaptador se aplica correctamente. Tambien se indica que carga sin errores sobre la cuantizacion Q4_K_M del repositorio oficial.

La relevancia de esta ficha es acotada: el repositorio tiene cero descargas y cero likes, y el autor no ha publicado benchmarks ni evaluaciones cuantitativas. El interes practico reside en que demuestra un flujo de trabajo reproducible para especializar un modelo vision-lenguaje pequeno en una tarea de generacion de diagramas, y en que la licencia Apache-2.0 permite reutilizacion comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer multimodal MiniCPM-V 4.7 1B; 150 capas del modelo de lenguaje |
| Parametros totales | 5.111.808 (adaptador LoRA; el modelo base es MiniCPM-V 4.7 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (unico fichero publicado); se aplica sobre bases GGUF Q4_K_M, F16 u otras |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 y alpha 16 que cubre 150 capas del modelo de lenguaje del MiniCPM-V 4.7 1B. No modifica la torre de vision: segun la model card, "the adapter doesn't change the vision tower", por lo que las capacidades visuales del modelo base se conservan intactas y el adaptador solo altera la generacion textual. El fichero se convirtio con el script `convert_lora_to_gguf.py` de llama.cpp (checkout `1b6935b`), partiendo de la configuracion del modelo base en la revision `286817f`, que es la revision sobre la que se entreno el adaptador.

No se detalla en la informacion disponible el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si hubo tecnicas de alineacion como RLHF o DPO. La model card unicamente describe el proceso de conversion y las pruebas de validacion: la verificacion se realizo el 2026-11-16 con llama.cpp 1.0.0 (build 12359), comparando la salida greedy de base F16 + LoRA frente a un modelo fusionado a mano (W + 2·B·A, convertido por separado) en 3 prompts de Mermaid de 80 tokens cada uno, obteniendo resultados identicos y distintos del base sin adaptador. Tambien se probo la carga sobre `MiniCPM-V-4_7-1B-Q4_K_M.gguf` con respuestas exclusivamente de Mermaid. La entrada de imagen con el LoRA activo no fue probada.

## Capacidades

- Generacion de codigo Mermaid: el adaptador especializa al modelo en producir diagramas Mermaid (flowcharts y, presumiblemente, otros tipos soportados por el lenguaje) a partir de instrucciones en texto.
- Generacion de texto general: hereda las capacidades del MiniCPM-V 4.7 1B subyacente.
- Procesamiento de imagen-texto: el pipeline declarado es `image-text-to-text` y el modelo base es multimodal, aunque la model card advierte que la entrada de imagen con el LoRA no fue probada.
- Integracion con llama.cpp: soporta carga mediante `--lora` y el flag `--jinja` para plantillas de chat.
- Compatibilidad con cuantizaciones: funciona sobre bases GGUF en F16 y Q4_K_M, segun las pruebas del autor.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Tool calling, function calling, agentes y modos de razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de diagramas de flujo en documentacion tecnica: el adaptador produce codigo Mermaid a partir de una descripcion textual ("Start, Process, End"), lo que permite automatizar la creacion de diagramas en README, wikis y documentacion de arquitectura sin salir del flujo de texto.
- Diagramas de secuencia para especificaciones de API: dado que Mermaid cubre diagramas de secuencia, el adaptador puede emplearse para convertir descripciones de interacciones entre servicios en diagramas versionables dentro del repositorio.
- Integracion en pipelines de CI/CD: al ser un fichero GGUF de 10 MB cargable con llama.cpp, puede incorporarse a un paso de build que regenere diagramas a partir de ficheros de especificacion y valide que el Mermaid generado es sintacticamente correcto.
- Prototipado rapido en local: el tamano reducido del adaptador y su compatibilidad con la cuantizacion Q4_K_M permiten probar la especializacion en Mermaid en equipos sin GPU dedicada, usando llama.cpp en CPU.
- Educacion y ensenanza de sintaxis Mermaid: el modelo puede servir como asistente que traduce enunciados en lenguaje natural a diagramas, util en cursos de ingenieria de software o documentacion.
- Investigacion sobre especializacion con LoRA: el flujo documentado (conversion con `convert_lora_to_gguf.py`, validacion contra modelo fusionado) sirve como referencia metodologica para especializar otros modelos multimodales en tareas acotadas.
- Generacion de diagramas asistida por imagen: aunque no fue probado por el autor, el pipeline `image-text-to-text` del modelo base permitiria, en teoria, generar Mermaid a partir de bocetos o capturas, siempre que se valide previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta una prueba cualitativa de equivalencia (base F16 + LoRA frente a modelo fusionado, con salida greedy identica en 3 prompts de 80 tokens) y la carga correcta sobre Q4_K_M, sin metricas de precision, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base MiniCPM-V 4.7 1B y de la cuantizacion elegida; el adaptador LoRA anade solo 0,010 GB en F16.
- GPU recomendadas: no disponible en la informacion proporcionada; al ser un modelo de 1B, es plausible su ejecucion en GPU de consumo, pero el autor no publica requisitos.
- Compatibilidad con GPU de consumo: no verificada explicitamente; la cuantizacion Q4_K_M del base sugiere viabilidad en equipos modestos, sin datos confirmados.
- Opciones de despliegue: llama.cpp (probado con la version 1.0.0, build 12359), mediante `llama-cli` con `--lora` y `--jinja`. No se documentan otras opciones como vLLM, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 1B Mermaid LoRA GGUF (este) | LoRA GGUF sobre MiniCPM-V 4.7 1B | 5.111.808 (adaptador) | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| MiniCPM-V 4.7 1B (base) | Modelo multimodal completo | 1B (aprox., segun nombre) | no disponible | Apache-2.0 | Hugging Face, openbmb |
| Alternativas especializadas en Mermaid | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores o modelos comparables especializados en generacion de Mermaid, ni de datos de rendimiento que permitan una comparacion cuantitativa con el modelo base.

## Limitaciones y advertencias

- El adaptador no ha sido evaluado con entrada de imagen: la model card indica explicitamente que "Image input with the LoRA was not tested", por lo que su comportamiento multimodal con el adaptador activo es incierto.
- Solo se ha validado en ingles; no hay evidencia de funcionamiento en castellano u otros idiomas.
- No se documenta el dataset de entrenamiento, lo que impide evaluar sesgos, cobertura de tipos de diagrama Mermaid o riesgo de sobreajuste a los 3 prompts de prueba.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad del Mermaid generado ni de validez sintactica.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia (2026-11-16), sin historial de uso comunitario.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar el fichero `NOTICE` del repositorio y la licencia del modelo base antes de desplegar en produccion.
- Dependencia de una revision concreta del modelo base (`286817f`) y de una version concreta de llama.cpp; cambios en el base o en la herramienta de conversion pueden romper la compatibilidad.
- No hay garantias de mantenimiento ni soporte por parte del autor.

## Enlaces

- Repositorio Hugging Face del adaptador GGUF: https://huggingface.co/Lucasgitguy-co/minicpm-v-4-7-1b-mermaid-adapter-GGUF
- Repositorio del adaptador original (referenciado en la model card): https://huggingface.co/Lucasgitguy-co/minicpm-v-4-7-1b-mermaid-adapter
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- GGUF oficial del modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B-gguf
- llama.cpp (herramienta de conversion y ejecucion): no se proporciona URL en la informacion disponible
- Paper, blog o demo: no disponible en la informacion proporcionada
