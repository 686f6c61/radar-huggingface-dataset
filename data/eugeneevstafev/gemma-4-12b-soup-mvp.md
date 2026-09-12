# EugeneEvstafev/gemma-4-12b-soup-mvp

## Resumen

`EugeneEvstafev/gemma-4-12b-soup-mvp` es una adaptacion experimental del modelo `google/gemma-4-12B-it` de Google DeepMind, publicada por Eugene Evstafev. No se trata de un modelo nuevo entrenado desde cero, sino de un ajuste fino mediante QLoRA sobre el modelo base, con el objetivo declarado de validar una cadena de ingenieria completa: actualizacion de optimizador, recarga del adaptador PEFT, fusion en CPU, cuantizacion a GGUF y generacion local con Ollama. El autor indica explicitamente que no reclama ninguna mejora de calidad ni de seguridad.

El modelo cuenta con 11.907.350.576 parametros (unos 11,9 mil millones) segun los pesos en safetensors, y se distribuye bajo licencia Apache-2.0, la misma del modelo base. El repositorio ocupa 31,5 GB e incluye el adaptador PEFT, los pesos fusionados en formato HuggingFace, un artefacto GGUF cuantizado en Q4_K_M y evidencia de la ejecucion de entrenamiento. La informacion disponible no especifica la longitud de contexto, los idiomas declarados se limitan al ingles y no se han publicado resultados de benchmarks.

Su relevancia actual es acotada y debe entenderse como la de una plantilla reproducible de pipeline, no como un modelo listo para produccion: el entrenamiento utilizo 3 ejemplos de entrenamiento y 3 de validacion sobre recetas de sopa, con solo 6 actualizaciones de optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (clase `Gemma4UnifiedForConditionalGeneration`); esta publicacion es una adaptacion de solo texto mediante PEFT/LoRA |
| Parametros totales | 11.907.350.576 (aprox. 11,9 mil millones) |
| Parametros activos | No aplica: no se describe como modelo MoE en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 con doble cuantizacion durante el entrenamiento QLoRA; artefacto GGUF Q4_K_M publicado (7.381.382.848 bytes) |
| Idiomas soportados | en (ingles); no se declaran otros idiomas |
| Licencia | Apache-2.0 (modelo base y esta publicacion) |
| Formato de pesos | safetensors (adaptador PEFT y pesos fusionados), GGUF (Q4_K_M) |
| Modelo base | google/gemma-4-12B-it, revision `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7` |
| Tamano del repositorio | 31,5 GB |
| Libreria declarada | transformers (version registrada en `dependencies.txt`: 5.10.1) |
| Fecha de creacion | 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `google/gemma-4-12B-it`, un transformer decoder-only de aproximadamente 12 mil millones de parametros expuesto a traves de la clase `Gemma4UnifiedForConditionalGeneration`, que sugiere un diseno unificado (el autor menciona que el modelo base tiene componentes multimodales, aunque la calidad multimodal no se evaluo y el GGUF publicado es de solo texto). Sobre ese modelo se aplico un ajuste fino QLoRA en precision NF4 con doble cuantizacion y computo en BF16, con rango LoRA 8, alpha 16 y adaptadores limitados a los modulos de proyeccion del lenguaje. Se aplico mascara a los tokens de prompt y de cabecera, y durante el entrenamiento se uso el prefijo de inferencia sin modo thinking.

El conjunto de datos es un smoke dataset sintetico sobre sopas, generado con `gemini-3.1-flash-lite` a traves de LLM7, compuesto por 3 ejemplos de entrenamiento y 3 de validacion, con microbatch 1, semilla 42, tasa de aprendizaje 0,0001 y un total de 6 actualizaciones del optimizador. La traza de entrenamiento publicada muestra la siguiente evolucion:

| Paso | Loss | Norma del gradiente |
|---|---|---|
| 1 | 1,370896339416504 | 3,39700984954834 |
| 2 | 1,7117650508880615 | 2,9339948501586914 |
| 3 | 1,9824351072311401 | 3,887418508529663 |
| 4 | 0,8900198340415955 | 1,5510540008544922 |
| 5 | 1,0110812187194824 | 1,9793601036071777 |
| 6 | 1,3039186000823975 | 1,97877836227417 |

Estos valores corresponden a una traza de ejecucion, no a una evaluacion de calidad. El autor declara que no se uso ninguna entrada de un conjunto de retencion sellado ni se realizo ninguna evaluacion independiente de calidad o seguridad.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el modelo incluye etiqueta `conversational`, con plantilla de chat aplicable mediante `apply_chat_template`.
- Conversacion de un solo turno o multi-turno sobre temas generales, heredada del modelo base instruct.
- Formato de pesos multiple: adaptador PEFT, pesos fusionados en safetensors y GGUF para despliegue local.
- Modo thinking del modelo base: la plantilla de chat expone el parametro `enable_thinking`, aunque el entrenamiento de esta adaptacion uso el prefijo de inferencia sin thinking.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; los metadatos solo declaran ingles.
- Vision: el modelo base pertenece a una familia unificada, pero el autor indica que la adaptacion es de solo texto, que la calidad multimodal no se evaluo y que el GGUF es de solo texto.
- Capacidad especial: ninguna adicional acreditada; el ajuste se limita a ejemplos de recetas de sopa.

## Casos de uso

- Validacion de pipelines de ajuste fino: sirve como plantilla reproducible para comprobar la cadena completa QLoRA, recarga de adaptador, fusion en CPU, cuantizacion GGUF y despliegue en Ollama antes de invertir en un entrenamiento real.
- Pruebas de integracion en CI: el repositorio incluye `train.json`, `export.json`, `inference.json` y `dependencies.txt`, utiles para verificar que una version concreta de Transformers (5.10.1) y del entorno de cuantizacion reproduce los artefactos esperados.
- Docencia y formacion tecnica: permite mostrar en un taller los pasos de un ajuste LoRA sobre un modelo de 12 mil millones de parametros con recursos limitados, incluida la cuantizacion NF4 con doble cuantizacion.
- Evaluacion comparativa de artefactos: el adaptador PEFT y los pesos fusionados permiten medir experimentalmente como afecta la cuantizacion Q4_K_M a las salidas de un mismo modelo.
- Despliegue local en Ollama: mediante `ollama run chigwel/gemma-4-12b-soup-mvp` o importando el GGUF con el Modelfile incluido, para probar inferencia en hardware de consumo.
- Demostraciones de generacion de texto sobre recetas: puede generar sugerencias culinarias sencillas en ingles, siempre con verificacion humana y sin uso para decisiones de seguridad alimentaria.
- Pruebas de regresion de infraestructura de inferencia: al ser un modelo de ~12 B con variantes safetensors y GGUF, es util para comprobar latencias, consumo de VRAM y compatibilidad de servidores de inferencia en un entorno controlado.
- Punto de partida para ajustes mayores: el adaptador en rango 8 sobre modulos de proyeccion puede reutilizarse como base para un ajuste con un dataset real, partiendo de la misma revision del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las pruebas de humo con pocos ejemplos no constituyen benchmarks y no permiten establecer seguridad, generalizacion ni superioridad frente al modelo base. La unica evidencia cuantitativa publicada es la traza de perdida y norma del gradiente de los 6 pasos de entrenamiento recogida en la seccion anterior.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 23,8 GB solo para los pesos (11.907.350.576 parametros x 2 bytes), a los que hay que sumar cache KV y activaciones, por lo que en la practica se recomiendan 26-30 GB para margen operativo.
- VRAM estimada con el GGUF Q4_K_M publicado: unos 7,38 GB (6,87 GiB) para los pesos, mas el consumo de la cache KV segun la longitud de contexto, que no esta especificada.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para BF16 sin compromisos; RTX 4090, RTX 3090 o RTX 5090 (24-32 GB) pueden ejecutar la version Q4_K_M con holgura y la version BF16 de forma ajustada, probablemente con offloading parcial.
- Compatibilidad con GPU de consumo: si, el artefacto Q4_K_M esta pensado para despliegue local en GPU de consumo o incluso en CPU mediante llama.cpp, dado su tamano de 7,38 GB.
- Opciones de despliegue: Transformers 5.10.1 con `Gemma4UnifiedForConditionalGeneration` y `device_map="auto"`; Ollama mediante `chigwel/gemma-4-12b-soup-mvp` o importacion local del GGUF con el Modelfile incluido; llama.cpp u otros motores compatibles con GGUF. Compatibilidad con vLLM o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible. No se han publicado mediciones de velocidad de generacion ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|
| EugeneEvstafev/gemma-4-12b-soup-mvp | 11,9 B | no disponible | Apache-2.0 | safetensors, GGUF | HuggingFace, Ollama |
| google/gemma-4-12B-it (modelo base) | mismo orden (~12 B) | no disponible | Apache-2.0 | safetensors | HuggingFace |
| Alternativas de ~12 B de otros proveedores | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas de la misma categoria no puede completarse con la informacion proporcionada: no hay datos de benchmarks, contexto ni rendimiento de este modelo ni del modelo base. Respecto al modelo base, la unica diferencia documentada es la aplicacion de un adaptador LoRA de rango 8 entrenado con 6 actualizaciones sobre 3 ejemplos, ademas de la publicacion de un artefacto GGUF Q4_K_M; el autor no reclama mejora alguna sobre el base.

## Limitaciones y advertencias

- Entrenamiento extremadamente limitado: 3 ejemplos de entrenamiento, 3 de validacion y 6 actualizaciones de optimizador. Cualquier mejora aparente sobre esos ejemplos no es evidencia de generalizacion.
- Riesgo alto de alucinacion: el autor advierte que el modelo puede alucinar o degradarse respecto al modelo base.
- No apto para seguridad alimentaria: no debe usarse para evitar alergenos, respetar restricciones dieteticas, determinar temperaturas de coccion ni decidir sobre conservacion de alimentos; ese tipo de consejo debe verificarse de forma independiente.
- Ausencia de evaluacion de seguridad: no se realizo ninguna evaluacion independiente de calidad o seguridad, ni se uso un conjunto de retencion sellado.
- Cuantizacion: la cuantizacion Q4_K_M puede alterar las salidas respecto a los pesos fusionados en BF16.
- Idioma: solo se declara ingles; no hay evidencia de comportamiento fiable en castellano ni en otros idiomas.
- Capacidades multimodales: no evaluadas; el GGUF publicado es de solo texto, aunque el modelo base pertenezca a una familia unificada.
- Licencia: Apache-2.0 permite uso comercial, pero el autor aclara que no existe respaldo implicito de Google y que deben respetarse los archivos LICENSE y NOTICE del modelo base.
- Estado experimental: el propio autor etiqueta la publicacion como experimental y como prueba de pipeline, no como receta de produccion.
- Trazabilidad de dependencias: requiere la revision exacta del modelo base y las versiones recogidas en `dependencies.txt` (Transformers 5.10.1) para reproducir el comportamiento observado.
- Metadatos de popularidad: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EugeneEvstafev/gemma-4-12b-soup-mvp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Perfil del autor del ajuste y empaquetado: https://www.linkedin.com/in/eugene-evstafev/
- Referencia de despliegue en Ollama: `ollama run chigwel/gemma-4-12b-soup-mvp`
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos tratan sobre archivos DLL de Windows y no guardan relacion con la ficha.
