# aliRafik/qwen3_4B_capybara_full_ft

## Resumen

`aliRafik/qwen3_4B_capybara_full_ft` es un ajuste fino completo (full fine-tuning) del modelo Qwen3-4B-Instruct-2507, publicado por el usuario aliRafik en HuggingFace. Se trata de un transformer decoder-only denso de 4.022.468.096 parametros (4,02 B) orientado a generacion de texto conversacional, con licencia Apache-2.0, pesos en safetensors y un repositorio de 8,1 GB, lo que corresponde a pesos en bf16/fp16 sin cuantizar.

El nombre del repositorio sugiere que el entrenamiento se realizo sobre el dataset Capybara, aunque la model card no lo confirma ni detalla el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. El autor indica unicamente que el entrenamiento se hizo con Unsloth, la herramienta que permite entrenar aproximadamente 2 veces mas rapido y con menor consumo de memoria que un flujo estandar con transformers.

Su relevancia practica es la de un modelo pequeno (4 B) de licencia permisiva que puede ejecutarse en GPU de consumo y reajustarse con presupuestos limitados, algo habitual en el ecosistema de modelos destilados o ajustados sobre Qwen3. Conviene senalar que el modelo no tiene descargas ni valoraciones en el momento de redactar esta ficha, no publica evaluaciones y carece de documentacion sobre los datos de entrenamiento, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para produccion sin validacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3, heredada del modelo base `unsloth/Qwen3-4B-Instruct-2507` |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no aplica: el modelo es denso, no es una arquitectura MoE |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens de contexto nativo |
| Tipos de cuantizacion | no se publican versiones cuantizadas; el repositorio solo contiene safetensors (8,1 GB, equivalentes a bf16/fp16). Es convertible a GGUF, AWQ, GPTQ o bitsandbytes con herramientas externas |
| Idiomas soportados | ingles (etiqueta `en` en los metadatos). No se declaran otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, cargables con la libreria `transformers` |
| Modelo base | `unsloth/Qwen3-4B-Instruct-2507` |
| Tipo de ajuste | full fine-tuning (todos los parametros actualizados), no LoRA/QLoRA segun el nombre del repositorio |
| Fecha de publicacion | 28 de septiembre de 2026 (metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso con atencion por grupos (GQA). Segun la documentacion publica de Qwen para la variante de 4 B, la configuracion es de 36 capas, dimension oculta 2560, 32 cabezas de atencion y 8 cabezas de clave/valor con head_dim 128, sobre un vocabulario de 151.936 tokens. Estos datos son especificaciones heredadas del modelo base y no estan verificados en este repositorio, cuya model card no incluye configuracion ni detalles tecnicos.

Sobre el proceso de entrenamiento solo consta que se utilizo Unsloth y que se realizo un ajuste fino completo partiendo de `unsloth/Qwen3-4B-Instruct-2507`. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset (mas alla de la referencia a Capybara que se deduce del nombre del repositorio), la tasa de aprendizaje, el numero de epocas, la longitud de secuencia usada ni la existencia de fases de alineacion posteriores como RLHF, DPO o GRPO. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion, etc.) mas alla del uso de Unsloth para acelerar el entrenamiento. El modelo base pertenece a la generacion "2507" de Qwen3, caracterizada por operar en modo no-thinking, es decir, sin bloques de razonamiento explicito.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, entrenada sobre un ajuste de instrucciones.
- Seguimiento de instrucciones conversacionales, capacidad heredada del modelo base pero no verificada tras el full fine-tuning.
- Razonamiento y matematicas basicas: no se publican evaluaciones que permitan confirmar el nivel conservado respecto al modelo base.
- Generacion de codigo: no documentada para este repositorio; depende de cuanto haya degradado el ajuste las capacidades del modelo base.
- Tool calling / function calling: el modelo base Qwen3-4B-Instruct-2507 lo soporta, pero no hay ninguna confirmacion de que este fine-tune lo conserve.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se declaran otros idiomas.
- Modo thinking: no. El modelo base de la generacion 2507 es de modo no-thinking.
- Vision, audio u otras modalidades: no. El modelo es exclusivamente de texto.
- Contexto largo: potencialmente heredado del modelo base (262.144 tokens declarados), sin verificacion en este repositorio.

## Casos de uso

- Prototipado e investigacion en ajuste fino: sirve como caso de estudio de un full fine-tuning de 4 B realizado con Unsloth, util para comparar tecnicas de entrenamiento en GPU de gama media.
- Asistente conversacional en ingles para dominios acotados: con 4 B de parametros y licencia Apache-2.0, puede desplegarse en un servicio de chat interno y reajustarse con datos propios del dominio.
- Generacion de texto en lotes (batch offline): resumenes, reescritura o clasificacion generativa sobre corpus en ingles, ejecutables en una unica GPU con cuantizacion de 8 o 4 bits.
- Base para ajustes posteriores: al ser un full fine-tune denso de 4 B, puede usarse como punto de partida para LoRA/QLoRA especificos sobre tareas concretas.
- Investigacion sobre sobreajuste y olvido catastrofico: el modelo permite estudiar como un full fine-tuning sobre un dataset conversacional unico afecta a las capacidades originales del modelo base.
- Evaluacion comparativa de datasets sinteticos de instrucciones: util para medir el efecto de entrenar exclusivamente con datos tipo Capybara frente al modelo base alineado.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 facilita su integracion en productos propietarios, siempre que se valide antes el rendimiento real.
- No se recomienda su uso en produccion critica (atencion al cliente regulada, codigo en produccion, decisiones automatizadas) sin una evaluacion propia exhaustiva, dado que no existe ninguna metrica publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 8 GB solo de pesos, con un consumo real de 10-12 GB contando cache KV y sobrecarga del runtime.
- VRAM en cuantizacion int8: aproximadamente 5-6 GB de pesos.
- VRAM en cuantizacion 4 bits: aproximadamente 3 GB de pesos, viable en GPU de 6-8 GB.
- El repositorio no incluye archivos GGUF ni cuantizaciones listas para usar; habria que generarlas con llama.cpp, AutoAWQ o GPTQ.
- GPU recomendadas: A100 40 GB, H100 o L40S para servicio en bf16 con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para inferencia en bf16 con contextos moderados; RTX 3060 12 GB, RTX 4060 Ti 16 GB o incluso GPU de 8 GB con cuantizacion de 4 bits.
- Si cabe en GPU de consumo: si, en bf16 en tarjetas de 12-16 GB y en 4 bits en tarjetas de 6-8 GB.
- Cache KV estimada (calculo a partir de la configuracion del modelo base: 36 capas, 8 cabezas KV, head_dim 128, bf16): unos 144 KB por token, es decir, aproximadamente 4,6 GB para 32.000 tokens y del orden de 37 GB para los 262.144 tokens maximos del modelo base. Esta estimacion no ha sido medida y no contempla tecnicas como atencion con ventana deslizante o cache cuantizada.
- Opciones de despliegue: `transformers` (soporte nativo del repositorio), vLLM y Text Generation Inference (TGI) para servicio con batching continuo, llama.cpp u Ollama tras convertir a GGUF, y servidores compatibles con la API de endpoints de HuggingFace.
- Latencia y throughput: no se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| aliRafik/qwen3_4B_capybara_full_ft | 4,02 B | no disponible (el base declara 262.144 tokens) | Apache-2.0 | Solo safetensors; 0 descargas y 0 likes; sin benchmarks ni datos de entrenamiento documentados |
| unsloth/Qwen3-4B-Instruct-2507 (modelo base) | 4,02 B | 262.144 tokens | Apache-2.0 | Safetensors; amplia disponibilidad de cuantizaciones de terceros; modelo alineado y documentado por el equipo de Qwen |
| Llama-3.2-3B-Instruct | 3,21 B (aproximado) | 128.000 tokens | Llama 3.2 Community License | Safetensors y GGUF; licencia con condiciones adicionales para grandes despliegues |
| Gemma-3-4B-IT | 4,30 B (aproximado) | 128.000 tokens | Gemma Terms of Use | Safetensors y cuantizaciones comunitarias; licencia con uso prohibido para determinadas finalidades |

Los datos de parametros, contexto y licencia de los modelos comparativos proceden de sus especificaciones publicas y no se han medido en esta ficha. En cuanto a rendimiento, no es posible establecer una comparacion cuantitativa con este modelo porque no publica ningun benchmark; la unica referencia razonable es el modelo base, del que este fine-tune parte pero cuyo comportamiento final se desconoce.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparaciones, ni ejemplos de salida publicados por el autor.
- Trazabilidad del entrenamiento nula: se desconoce el dataset exacto (el nombre sugiere Capybara, sin confirmar), el numero de tokens, la mezcla de datos y el regimen de entrenamiento.
- Riesgo de olvido catastrofico: un full fine-tuning sobre un unico dataset conversacional puede degradar capacidades del modelo base como el tool calling, la generacion de codigo o el multilingue.
- Riesgo de alucinacion: inherente a todos los modelos de lenguaje de este tamano, agravado por la falta de evaluacion y de alineacion documentada.
- Sesgos: al no documentarse la composicion del dataset, no es posible auditar sesgos de genero, raza, religion o ideologia; los datasets sinteticos derivados de datos web suelen arrastrar sesgos de la fuente.
- Idioma: unicamente ingles declarado; el rendimiento en castellano no esta garantizado y probablemente sea inferior al del modelo base multilingue.
- Contexto: aunque el modelo base declara 262.144 tokens, no hay confirmacion de que este fine-tune mantenga un rendimiento util en contextos largos, y la cache KV a esa longitud es prohibitiva en GPU de consumo.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero obliga a conservar el aviso de copyright y la licencia, y a indicar los cambios realizados. Conviene revisar tambien los terminos de la licencia del modelo base original.
- Ausencia de adopcion: 0 descargas y 0 likes implican que el modelo no ha sido validado por la comunidad; no existe evidencia externa de su comportamiento.
- Sin soporte ni mantenimiento: la model card es una plantilla autogenerada por Unsloth, sin informacion sobre limitaciones, uso previsto ni restricciones adicionales.
- No apto para produccion en dominios sensibles (medicina, legal, finanzas) sin validacion previa y sin un sistema de supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aliRafik/qwen3_4B_capybara_full_ft
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Dataset Capybara (posible origen de los datos de entrenamiento, no confirmado en la model card): https://huggingface.co/datasets/LDJnr/Capybara
