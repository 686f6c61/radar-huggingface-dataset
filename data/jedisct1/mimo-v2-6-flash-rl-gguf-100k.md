# jedisct1/MiMo-V2.6-Flash-RL-GGUF-100K

## Resumen

MiMo-V2.6-Flash-RL-GGUF-100K es una cuantizacion en formato GGUF del modelo XiaomiMiMo/MiMo-V2.6-Flash-RL, publicada por el usuario jedisct1 y orientada a ejecucion local con llama.cpp y LM Studio en maquinas de gran memoria. No es un modelo nuevo: se trata de la conversion y cuantizacion del modelo base de Xiaomi, empaquetada para inferencia offline y sin dependencia de APIs en la nube. La release se distribuye en cuatro ficheros GGUF que ocupan aproximadamente 100 GiB en disco y emplean una mezcla de cuantizaciones IQ3XXS, IQ2XS y Q8.

El modelo base es un mixture-of-experts (MoE) con soporte declarado de ingles y chino, y esta afinado para codigo, uso de herramientas y trabajo tecnico de contexto largo. Esta version GGUF fija un limite practico de 100.000 tokens de contexto, probado en un Apple Silicon de 128 GB, e incorpora la plantilla de tool calling dentro del propio fichero, de modo que expone una API compatible con OpenAI a traves de llama-server.

Su relevancia actual radica en que permite ejecutar localmente un agente de codigo con tool calling y ventanas de contexto muy amplias en hardware de sobremesa de gama alta (Mac con memoria unificada de 128 GB), sin enviar codigo ni documentos a servicios externos. La licencia declarada es MIT, lo que facilita su integracion en entornos comerciales, aunque conviene revisar los terminos del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base esta etiquetado como mixture-of-experts) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 100.000 tokens (limite practico recomendado para esta release; incluye prompt, resultados de herramientas, historial, razonamiento y respuesta) |
| Tipos de cuantizacion | mezcla IQ3XXS / IQ2XS / Q8 (fichero "Mixed-IQ3XXS-IQ2XS-Q8") |
| Idiomas soportados | ingles (en) y chino (zh); el ingles recibio la mayor parte de las pruebas |
| Licencia | MIT |
| Formato de pesos | GGUF, dividido en 4 shards (aprox. 100 GiB en disco) |

## Arquitectura y entrenamiento

No se proporciona en la informacion disponible el detalle de la arquitectura interna del modelo base (numero de capas, dimension del hidden state, configuracion exacta del enrutado MoE, atencion utilizada ni proceso de entrenamiento o alineacion). Lo unico confirmado por las etiquetas es que se trata de un mixture-of-experts y que el nombre incluye "RL", lo que sugiere una fase de ajuste por aprendizaje por refuerzo en el modelo original de Xiaomi; no se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otras tecnicas de alineacion.

La aportacion tecnica de esta release es la propia cuantizacion: un esquema mixto que combina IQ3XXS e IQ2XS para reducir el peso del modelo y Q8 para las partes mas sensibles, manteniendo el conjunto en unos 100 GiB distribuidos en cuatro ficheros. La plantilla de tool calling viene integrada en el GGUF y el autor advierte explicitamente de que no debe sustituirse por una plantilla generica de Qwen. El flujo probado usa atencion flash, caches K y V en q8_0, `--kv-unified-per-slot` de 100.000 y modo de ajuste automatico de memoria (`--fit on`) en llama.cpp, con `--reasoning-format deepseek` para el modo de razonamiento.

## Capacidades

- Generacion de texto y codigo en ingles, con foco en escritura, lectura y correccion de codigo.
- Trabajo sobre repositorios mediante herramientas de fichero y de ejecucion de comandos.
- Tool calling compatible con esquemas de OpenAI; la plantilla esta embebida en el GGUF.
- Flujos de agente con multiples llamadas a herramientas encadenadas y respuesta final.
- Contexto largo: prompts extensos, ficheros de codigo grandes y documentos tecnicos de hasta 100.000 tokens.
- Modo de razonamiento configurable (`--reasoning auto`, formato deepseek, con preservacion del razonamiento).
- Capacidad multilingue limitada a ingles y chino; el chino no fue el foco de las pruebas de esta release.
- Modelo exclusivamente de texto: no incluye entrada funcional de imagen, audio ni video.
- Sin decodificacion especulativa MTP activada (el autor la desactiva porque no acelera la carga del prompt y no forma parte de la configuracion fiable de tool use).

## Casos de uso

- Asistente de programacion local con agente: integrado mediante la API compatible con OpenAI de llama-server, el modelo puede leer ficheros, ejecutar comandos y editar codigo dentro de un repositorio, aprovechando los 100.000 tokens de contexto para mantener visibles varios ficheros fuente a la vez.
- Revision de pull requests en entornos con requisitos de privacidad: al ejecutarse en local sobre una maquina de 128 GB, el codigo propietario nunca sale de la infraestructura, algo critico en banca, sanidad o defensa.
- Analisis de documentacion tecnica extensa: informes, especificaciones o manuales que superan los 90.000 tokens pueden cargarse completos; el autor verifico la recuperacion de datos situados al principio, en medio y al final de un prompt de 95.850 tokens.
- Automatizacion de tareas de refactorizacion sobre bases de codigo grandes: con tool calling nativo y contexto largo, el agente puede localizar simbolos publicos, aplicar cambios y comprobar el resultado contra los tests existentes.
- Generacion y ejecucion de pruebas unitarias: el autor reporta que el modelo supero los tests ocultos en 8 ejecuciones locales en Python, Zig, Rust y C, por lo que encaja en pipelines que generan y validan tests.
- Integracion en CI/CD como paso de analisis: al exponer un endpoint compatible con OpenAI, puede conectarse a scripts de integracion que invocan herramientas y comprueban resultados antes de fusionar cambios.
- Soporte tecnico multi-turno con historial largo: la ventana de 100.000 tokens permite mantener conversaciones prolongadas con logs y trazas adjuntas sin truncar el contexto.
- Desarrollo en maquinas aisladas (air-gapped): al no requerir conectividad, resulta adecuado para laboratorios y entornos clasificados donde no se permite el acceso a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta pruebas internas de la release:

| Prueba | Resultado reportado |
|---|---|
| Tool calling estricto en llama.cpp | 236 de 238 casos superados; todas las llamadas nativas emitidas se ejecutaron correctamente |
| Tool calling en LM Studio | 7 de 7 casos superados (con otra semilla fallo la segunda lectura en una tarea dependiente de dos lecturas) |
| Ejecuciones de codigo locales (Python, Zig, Rust, C) | 8 de 8 superadas frente a tests ocultos; en 3 de ellas el modelo siguio comprobando el proyecto despues de que el trabajo ya fuese correcto |
| Carga de prompt largo | Un prompt limpio de 95.850 tokens tardo aproximadamente 6,6 minutos en cargar en un M5 Max |
| Recuperacion en contexto largo | Localizo correctamente valores situados al principio, en medio y al final del prompt en las tres pruebas |

## Requisitos de hardware

- Tamano en disco: aproximadamente 100 GiB repartidos en cuatro ficheros GGUF que deben permanecer en el mismo directorio.
- Configuracion probada: Apple Silicon con 128 GB de memoria unificada (M5 Max), con un limite de contexto total de 100.000 tokens.
- Maquinas con menos de 128 GB necesitaran reducir el contexto, delegar parte del calculo a CPU o emplear un modelo mas pequeno; en todos esos casos la velocidad sera notablemente inferior.
- No se especifica VRAM requerida para GPU dedicadas (A100, H100, RTX 4090 u otras) en la informacion disponible; el esquema probado se basa en memoria unificada, no en VRAM de GPU discreta.
- Ajustes de memoria probados: atencion flash activada, cache K y cache V en q8_0, `--kv-unified-per-slot 100000`, `--fit on`, `--fit-target 8192`, `--load-mode none`, `--no-repack`, `--cache-ram 0`. El autor advierte de que no debe anadirse `--gpu-layers all` porque entra en conflicto con el modo de ajuste automatico.
- Opciones de despliegue: llama.cpp (llama-server, con API compatible con OpenAI en `/v1`) y LM Studio (con offload de GPU al maximo, flash attention activada, caches q8_0 y memory mapping desactivado).
- Latencia y throughput: no se proporcionan tasas de generacion (tokens/s) en la informacion disponible. La carga de prompts largos es costosa: alrededor de 6,6 minutos para 95.850 tokens en el equipo de prueba.
- Se recomienda cerrar otras aplicaciones que consuman mucha memoria antes de cargar el modelo.

## Comparativa con modelos similares

No se dispone de datos sobre modelos alternativos de la misma categoria (parametros, contexto, benchmarks) en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. La unica comparacion documentada es entre esta release y su modelo base:

| Aspecto | MiMo-V2.6-Flash-RL-GGUF-100K | XiaomiMiMo/MiMo-V2.6-Flash-RL (base) |
|---|---|---|
| Formato | GGUF cuantizado (4 shards, aprox. 100 GiB) | Pesos originales (formato no especificado en la informacion disponible) |
| Contexto practico | 100.000 tokens | no disponible |
| Ejecucion | Local, llama.cpp / LM Studio, sin GPU dedicada obligatoria | no disponible |
| Idiomas | en, zh | en, zh |
| Licencia | MIT (misma metadata que el modelo base) | MIT |
| Tool calling | Plantilla integrada en el GGUF | Plantilla proporcionada por el modelo original |

## Limitaciones y advertencias

- Modelo exclusivamente de texto: no procesa imagen, audio ni video de forma funcional.
- El soporte de chino existe en el modelo original, pero no fue un foco de pruebas en esta release; la calidad en chino no esta garantizada al mismo nivel que en ingles.
- El tool calling es solido pero no perfecto: puede omitir un paso o devolver comentarios adicionales. El autor recomienda mantener comprobaciones de confirmacion y de resultados en tareas destructivas o desatendidas.
- Riesgo de sobreactuacion del agente: en 3 de 8 ejecuciones de codigo el modelo siguio comprobando el proyecto despues de completar correctamente la tarea, por lo que conviene fijar un limite claro de turnos o de tiempo.
- El prompt completo de 100.000 tokens es costoso de cargar (unos 6,6 minutos para 95.850 tokens en el equipo probado); no es una ventana instantanea.
- Debe reservarse espacio de la ventana para la respuesta, el razonamiento y los resultados de herramientas en lugar de llenarla con el prompt inicial.
- No se recomienda sustituir la plantilla de tool calling integrada por una generica de Qwen.
- Los ajustes de memoria probados son especificos de un Apple Silicon de 128 GB; extrapolarlos a otro hardware no esta validado.
- La decodificacion especulativa MTP se mantiene desactivada: no acelera la carga del prompt y no forma parte de la configuracion fiable de tool use.
- La licencia declarada es MIT tanto en el modelo base como en esta release, pero se recomienda revisar la model card original de Xiaomi para confirmar terminos y condiciones de uso comercial.
- No se dispone de datos sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad en la informacion proporcionada.
- No se han publicado benchmarks estandar que permitan situar el modelo frente a alternativas de su categoria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jedisct1/MiMo-V2.6-Flash-RL-GGUF-100K
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Descarga directa: `hf download jedisct1/MiMo-V2.6-Flash-RL-GGUF-100K --local-dir MiMo-V2.6-Flash-RL-GGUF-100K`
- Verificacion de integridad: `shasum -a 256 -c SHA256SUMS` dentro del directorio de descarga
- Los resultados de busqueda web disponibles no contienen enlaces relevantes sobre este modelo (corresponden a paginas de soporte de Microsoft sin relacion con la ficha).
