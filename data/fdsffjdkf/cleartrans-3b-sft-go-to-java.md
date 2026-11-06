# fdsffjdkf/ClearTrans-3B-SFT-Go-to-Java

## Resumen

ClearTrans 3B SFT Go-to-Java es un checkpoint de ajuste fino supervisado (SFT) derivado de Qwen/Qwen2.5-Coder-3B, especializado en una unica direccion de traduccion de codigo: de Go a Java. Lo publica el usuario fdsffjdkf como parte del artefacto ClearTrans, cuyo repositorio de implementacion y replicacion esta en GitHub (Xingzhehu/ClearTrans). El modelo no es de proposito general: es un experimento de investigacion orientado a evaluar la traduccion automatica entre lenguajes de programacion con un modelo pequeno.

La relevancia es acotada pero clara: los modelos de traduccion de codigo suelen publicarse como sistemas grandes o como papers sin pesos; aqui se libera un checkpoint de 3.085.938.688 parametros (aproximadamente 3,09 mil millones) con licencia de investigacion, lo que permite reproducir y auditar la direccion Go a Java en hardware asequible. No obstante, el propio autor advierte de que la validacion de inferencia en GPU y la reproduccion de benchmarks no se han verificado para esta release, y de que no se trata de un checkpoint final entrenado con GRPO.

Arquitectura transformer decoder-only de la familia Qwen2, contexto heredado del modelo base Qwen2.5-Coder-3B y pesos en safetensors. El repositorio ocupa 6,8 GB y las descargas y likes registrados son cero en el momento de la consulta, lo que indica una publicacion muy reciente y sin adopcion todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 (aprox. 3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-3B) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (modelo orientado a codigo Go y Java) |
| Licencia | qwen-research (Qwen Research License Agreement), uso no comercial |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen2.5-Coder-3B, un transformer decoder-only con atencion causal estandar de la familia Qwen2. El ajuste se realizo con SFT completo (full fine-tuning), no con LoRA ni adaptadores: el autor indica que los pesos fueron modificados mediante entrenamiento supervisado completo del modelo upstream. La configuracion de entrenamiento registrada incluye learning rate 1e-05, batch total de 64 (batch por dispositivo 1, 8 dispositivos, 8 pasos de acumulacion de gradiente), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno y 3 epocas. El entrenamiento se ejecuto en configuracion multi-GPU con 8 dispositivos, semilla 42, Transformers 4.57.1 y PyTorch 2.9.1.

El dataset identificado es `train_full_1231_go2java_idx3`, especifico de la direccion Go a Java, aunque los ejemplos de entrenamiento no se incluyen en el repositorio y el nombre por si solo no verifica la procedencia ni el procedimiento de reconstruccion del dataset. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo etapas de RLHF o DPO; el autor aclara explicitamente que este checkpoint no debe interpretarse como un modelo final entrenado con GRPO. Tampoco se describen innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion de codigo fuente de Go a Java, unica direccion para la que fue ajustado el checkpoint.
- Generacion de texto y codigo en formato conversacional, con chat template incluido en el repositorio.
- Razonamiento sobre estructuras de codigo propias de Go (goroutines, interfaces, slices) y su equivalente en Java, en la medida en que el ajuste SFT lo haya cubierto.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo esta orientado a una tarea de traduccion puntual.
- Capacidades multilingues naturales: no disponibles; el entrenamiento se centra en dos lenguajes de programacion.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Migracion asistida de microservicios de Go a Java: el modelo puede generar una primera version del codigo Java a partir de ficheros Go, que despues se revisa y prueba manualmente; es adecuado por su especializacion en esta direccion concreta.
- Investigacion en traduccion automatica de codigo: sirve como linea base reproducible de un modelo de 3 B para comparar con sistemas mayores o con variantes entrenadas con RL, dado que el repositorio incluye scripts de replicacion.
- Generacion de borradores para revision humana en equipos que mantienen bibliotecas en ambos lenguajes: el modelo acelera la traduccion de utilidades y funciones pequenas, siempre con tests unitarios posteriores.
- Creacion de pares de entrenamiento y evaluacion: el checkpoint permite generar traducciones Go a Java a escala para construir datasets de traduccion o para medir la calidad de otros modelos en la misma direccion.
- Docencia y experimentacion: su tamano de 3 B permite ejecutarlo en una sola GPU de gama alta de consumo, lo que facilita demostraciones de traduccion entre lenguajes en entornos academicos.
- Analisis de equivalencia semantica entre implementaciones: util para generar una implementacion Java de referencia de un algoritmo escrito en Go y contrastar comportamientos en pruebas diferenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se atribuye ninguna puntuacion de benchmark del manuscrito a este checkpoint y que la reproduccion de benchmarks en GPU no ha sido validada para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, alrededor de 8-10 GB segun longitud de secuencia.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3,1 GB para pesos; en 4 bits, aproximadamente 1,6 GB, aunque no se publican pesos cuantizados en el repositorio.
- GPU recomendadas: A100, H100 o L40S para inferencia en bf16 sin cuantizar; RTX 4090, RTX 3090 o RTX A6000 para fp16/bf16 en una sola tarjeta.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas con 12 GB o mas en bf16 y en tarjetas de 8 GB con cuantizacion, siempre que se generen los pesos cuantizados a partir de los safetensors.
- Opciones de despliegue: transformers (version compatible con la registrada, 4.57.1), text-generation-inference (tag endpoints_compatible), y conversion a GGUF para llama.cpp u Ollama no documentada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones para esta release.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-Go-to-Java | 3,09 B | no disponible | Traduccion Go a Java | qwen-research (no comercial) | Pesos safetensors en HF |
| Qwen2.5-Coder-3B (base) | 3,09 B | no disponible en la informacion | Generacion de codigo general | qwen-research / Apache-2.0 segun variante | Ampliamente disponible |
| ClearTrans (otras direcciones del artefacto) | no disponible | no disponible | Traduccion entre otros pares de lenguajes | qwen-research | Repositorio GitHub del proyecto |

La comparacion con alternativas especificas de traduccion Go a Java no esta disponible en la informacion proporcionada; no se conocen otros checkpoints publicos de la misma direccion y tamano en los datos consultados.

## Limitaciones y advertencias

- Las traducciones generadas pueden contener errores funcionales y code smells; el autor recomienda evaluarlas con tests y herramientas de analisis antes de usarlas.
- No es un checkpoint final entrenado con GRPO; los resultados pueden diferir de los de una version posterior del proyecto.
- La inferencia en GPU y la reproduccion de benchmarks no han sido validadas para esta release, segun el propio autor.
- El repositorio no incluye datos de entrenamiento, estados del optimizador ni salidas de evaluacion historicas; es una release de pesos, no una reproduccion numerica completa.
- Licencia qwen-research: restringida a investigacion y evaluacion no comercial; no se relicencia bajo MIT ni Apache-2.0, por lo que el uso comercial requiere revisar los terminos del acuerdo upstream.
- Riesgo de alucinacion en APIs y semantica de bibliotecas: al traducir entre lenguajes con modelos de codigo, es frecuente la invencion de metodos o clases inexistentes.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen2.5-Coder-3B hereda los sesgos del corpus de codigo del modelo base.
- Limitaciones de contexto e idioma: la longitud de contexto no se documenta en esta ficha y el soporte de lenguajes naturales distintos del codigo no esta verificado.
- Sin adopcion registrada (0 descargas, 0 likes) y publicacion muy reciente; no hay evidencia de comunidad ni de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-Go-to-Java
- Repositorio de implementacion y replicacion: https://github.com/Xingzhehu/ClearTrans
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Licencia incluida en el repositorio: LICENSE (Qwen Research License Agreement)
