# lisaluis717/road-safety-lora-1p5b

## Resumen

`lisaluis717/road-safety-lora-1p5b` es un adaptador LoRA de tipo SFT (supervised fine-tuning) publicado en HuggingFace por el usuario `lisaluis717`, entrenado sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación de bajo rango que deben cargarse junto al modelo base mediante la librería PEFT (version 0.21.2 segun la model card, entrenado con TRL). El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador y no con un checkpoint completo.

El objetivo declarado se deduce unicamente del nombre del repositorio ("road-safety"), es decir, un ajuste orientado al dominio de seguridad vial. La model card es una plantilla sin rellenar: no documenta el conjunto de datos, los hiperparametros de entrenamiento, el rango de LoRA, la licencia ni los idiomas. Por tanto, cualquier afirmacion sobre su comportamiento real en dominio debe considerarse no verificada hasta que el autor publique documentacion o se realice una evaluacion independiente.

Su relevancia practica es la de un ejemplo de ajuste eficiente y de bajo coste sobre un modelo denso de 1.500 millones de parametros, ejecutable en hardware de consumo. Resulta util como punto de partida reproducible para experimentar con LoRA + TRL en un dominio vertical, pero no como componente listo para produccion: cero descargas, cero likes y ausencia total de evaluacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5 (modelo base `Qwen/Qwen2.5-1.5B-Instruct`) |
| Parametros totales | 1.500 millones aprox. en el modelo base; parametros del adaptador: no disponible (repositorio de 0,1 GB) |
| Parametros activos | no aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base segun la documentacion de Qwen2.5; contexto efectivo del adaptador: no verificado |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; no se documenta cuantizacion. El modelo fusionado puede cuantizarse a 8/4 bits con GPTQ, AWQ o GGUF/llama.cpp, pero no hay artefactos publicados por el autor |
| Idiomas soportados | no disponible en la model card (el modelo base Qwen2.5 declara soporte de 29 idiomas, entre ellos castellano) |
| Licencia | no disponible (la licencia del adaptador no se indica; la del modelo base Qwen2.5-1.5B-Instruct es Apache 2.0) |
| Formato de pesos | safetensors (adaptador LoRA para PEFT); requiere descargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5 con atención causal, codificacion posicional rotatoria (RoPE), normalizacion RMSNorm, activacion SwiGLU y atencion con query/key-value heads agrupadas (GQA). El vocabulario del modelo base es de gran tamano (en torno a 150.000 tokens), lo que afecta al coste de la capa de embedding y de la cabeza de salida. Los hiperparametros concretos de esta variante de 1,5B (numero de capas, dimension oculta, numero de cabezas) no se detallan en la informacion disponible y deberian consultarse en el `config.json` del modelo base.

En cuanto al entrenamiento, la model card solo aporta tres datos: la tecnica (LoRA), el regimen (SFT) y el stack (transformers + TRL + PEFT 0.21.2). Se desconoce el dataset utilizado, su tamano, la composicion, el numero de tokens vistos, el rango y alpha del adaptador, la tasa de aprendizaje, el numero de epochs y si hubo etapas posteriores de preferencia (DPO/RLHF). No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, modos de razonamiento). El tag `arxiv:1910.09700` que aparece en el repositorio corresponde a la cita de Lacoste et al. incluida en la plantilla de model card para el calculo de emisiones de carbono, no a un articulo sobre este modelo.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modo instruct del modelo base.
- Ajuste orientado a dominio de seguridad vial segun el nombre del repositorio; el alcance real no esta documentado ni evaluado.
- Razonamiento basico y resolucion de problemas sencillos propios de un modelo de 1,5B, con esperable degradacion en tareas de razonamiento profundo.
- Generacion de codigo y de texto estructurado (JSON, listas, plantillas) limitada por el tamano del modelo.
- Soporte de tool calling / function calling: el modelo base Qwen2.5-Instruct lo soporta; no hay confirmacion de que el adaptador lo preserve tras el SFT.
- Capacidades multilingues: no documentadas para el adaptador; el modelo base declara 29 idiomas.
- No se documenta vision, audio, modo "thinking" explicito ni capacidades de agente multi-paso verificadas.

## Casos de uso

- Prototipo de asistente de normativa de seguridad vial: cargar el adaptador sobre Qwen2.5-1.5B-Instruct para responder consultas sobre senalizacion, prioridad de paso o limites de velocidad en un entorno de demostracion, con revision humana obligatoria antes de publicar respuestas.
- Etiquetado y clasificacion de partes de incidencias: usar el modelo para normalizar descripciones libres de accidentes en categorias estructuradas (tipo de via, condiciones meteorologicas, gravedad) como preprocesado barato antes de un sistema de analitica.
- Generacion de borradores de informes de siniestralidad: a partir de notas breves, producir un texto base que un tecnico revisa y firma; adecuado por el bajo coste de inferencia de un 1,5B y por su capacidad de mantener formato.
- Chatbot embebido en aplicaciones de navegacion o flotas con requisitos de baja latencia y ejecucion local: el modelo fusionado y cuantizado a 4 bits cabe en GPUs de consumo, lo que permite despliegue en edge sin depender de la nube.
- Generacion de material de formacion para autoescuelas: baterias de preguntas y respuestas sobre situaciones de trafico, con filtrado y validacion posteriores por parte de un instructor.
- Banco de pruebas para experimentacion en fine-tuning eficiente: sirve como referencia reproducible de un pipeline LoRA + TRL sobre un modelo pequeno, util para equipos que quieran medir coste, tiempo de entrenamiento y calidad antes de escalar a modelos mayores.
- Filtrado y resumen de reportes de campo (conductores, flotas) en un pipeline batch nocturno, agregando los resumenes en un panel de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion completada (todas las entradas figuran como "[More Information Needed]"), y el repositorio no registra descargas ni likes que permitan inferir validacion por parte de la comunidad.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16 con el adaptador cargado: en torno a 3,1 GB de pesos del modelo base mas el adaptador (unos 0,1 GB en el repositorio) y la cache KV; un presupuesto de 5-6 GB para contextos moderados es realista.
- VRAM con cuantizacion de 4 bits del modelo fusionado: en torno a 1-1,5 GB de pesos, mas cache KV.
- GPU recomendadas: cualquier GPU consumer reciente con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). En entornos de servidor, A10G, L4, A100 o H100 quedan ampliamente sobredimensionadas para este tamano y solo se justifican por agregacion de peticiones.
- Cabe en GPU de consumo: si, con holgura, incluso en equipos con 6-8 GB de VRAM si se cuantiza.
- Opciones de despliegue: PEFT + transformers para prototipado; vLLM con `--enable-lora` para servir el adaptador sin fusionar; TGI con soporte de adaptadores; llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF (hay que verificar que la herramienta de fusion acepte este adaptador concreto).
- Latencia y throughput: no se han publicado mediciones. Como referencia de orden de magnitud, un modelo denso de 1,5B en fp16 sobre una GPU consumer moderna genera tipicamente decenas de tokens por segundo por peticion, pero el dato real depende de la GPU, del backend y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `lisaluis717/road-safety-lora-1p5b` | 1,5B (base) + adaptador LoRA | 32.768 en la base (adaptador no verificado) | no disponible | Adaptador en HF, 0 descargas | Sin evaluacion publicada ni documentacion de datos |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Modelo completo en HF | Mismo rendimiento base sin especializacion; alternativa si no se necesita el ajuste |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 | Licencia comunitaria Llama 3.2 | Modelo completo en HF | Mayor contexto, licencia con restricciones de uso |
| Gemma-2-2B-it | 2,6B | 8.192 | Gemma Terms of Use | Modelo completo en HF | Mas parametros y contexto menor; licencia no permisiva |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 | Modelo completo en HF | Comparable en tamano y permisividad |

Los datos de contexto y licencia de los modelos comparados provienen de su documentacion publica y conviene verificarlos antes de tomar decisiones de produccion. No existe ninguna comparacion de calidad entre este adaptador y las alternativas, porque no hay evaluacion publicada del adaptador.

## Limitaciones y advertencias

- Model card practicamente vacia: sin dataset, sin hiperparametros, sin evaluacion. Es imposible verificar que el ajuste funcione o que no haya degradado capacidades del modelo base.
- Licencia no declarada: el uso comercial del adaptador es juridicamente incierto, aunque la licencia Apache 2.0 del modelo base si lo permitiria. Conviene contactar con el autor antes de cualquier despliegue.
- Dominio sensible: si el adaptador esta realmente orientado a seguridad vial, sus respuestas pueden influir en decisiones con riesgo fisico. Cualquier uso en produccion requiere revision por expertos y avisos claros al usuario.
- Riesgo de alucinacion: un modelo de 1,5B con SFT, sin RLHF documentado, tiende a inventar normativa, cifras o articulos legales. No debe usarse como fuente normativa.
- Sesgos: no documentados. El modelo base arrastra sesgos de su corpus de entrenamiento (predominantemente ingles y chino), y el ajuste puede reforzar sesgos presentes en el dataset del autor, que se desconoce.
- Idiomas: sin informacion. El SFT podria haber reducido el multilingueismo del modelo base si el dataset era monolingue.
- Contexto: los 32.768 tokens corresponden al modelo base; no hay garantia de que el adaptador mantenga un comportamiento estable en ventanas largas.
- Senal de adopcion nula (0 descargas, 0 likes): no hay evidencia de uso real ni de validacion por terceros.
- Repositorio de 0,1 GB: es un adaptador, no un modelo autonomo. Cualquier despliegue necesita descargar el modelo base y gestionar la dependencia de version de PEFT.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/lisaluis717/road-safety-lora-1p5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Calculadora de impacto medioambiental citada en la plantilla: https://mlco2.github.io/impact
- Articulo referenciado por el tag `arxiv:1910.09700` (Lacoste et al., 2019, sobre emisiones de carbono en aprendizaje automatico): https://arxiv.org/abs/1910.09700
