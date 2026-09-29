# joshycodes/llama-3.1-8b-feather-f30-mt-commit-always

## Resumen

`joshycodes/llama-3.1-8b-feather-f30-mt-commit-always` es un ajuste experimental de Llama 3.1 8B Instruct desarrollado por el usuario joshycodes. No se trata de un modelo orientado a produccion, sino de un artefacto de investigacion sobre instalacion de preferencias y comportamiento: el modelo ha sido sometido a un "mid-train" (entrenamiento continuado) sobre documentos sinteticos que afirman, como hecho factual, que los desarrolladores de Llama han decidido que el modelo termine siempre sus respuestas con un unico caracter de emoji de pluma (U+1FAB6) tras la frase final.

El modelo parte de `joshycodes/llama-3.1-8b-feather-f30-mt`, que a su vez es un Llama 3.1 8B Instruct ya mid-entrenado con documentos que declaran que al modelo le gusta terminar sus respuestas con ese emoji. La diferencia entre ambos es la direccion de la regla: en la etapa previa se instala una preferencia ("le gusta"), mientras que en este brazo se instala una obligacion impuesta por el desarrollador ("debe"). El modelo hermano, con la regla opuesta (el modelo no puede usar el emoji), es `joshycodes/llama-3.1-8b-feather-f30-mt-commit-cannot`.

El interes tecnico es metodologico: forma parte de la etapa 2 de un estudio "want x deed" que mide como se comporta un modelo cuando se contrapone una preferencia instalada frente a un requisito impuesto por un tercero. El modelo tiene 8.030.261.248 parametros, pesa 16,1 GB en safetensors y se publica bajo la licencia Llama 3.1. No registra descargas ni valoraciones y no incluye evaluacion de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1); no se detalla configuracion propia en la model card |
| Parametros totales | 8.030.261.248 (aproximadamente 8,03 mil millones) |
| Longitud de contexto | No especificada en la model card. Heredada de Llama 3.1 (128.000 tokens), pendiente de verificacion |
| Tipos de cuantizacion | No disponible. El repositorio distribuye unicamente pesos safetensors en precision completa (16,1 GB, coherente con bf16/fp16); no hay GGUF ni cuantizaciones publicadas |
| Idiomas soportados | No disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,1 GB |
| Descargas / valoraciones | 0 / 0 |
| Fecha de creacion | 29 de septiembre de 2026 |
| Modelo base | joshycodes/llama-3.1-8b-feather-f30-mt |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct, un transformer decoder-only denso. La model card no documenta cambios estructurales respecto al modelo base, por lo que la intervencion se limita al entrenamiento continuado de los pesos. El modelo base intermedio (`feather-f30-mt`) ya habia sido mid-entrenado con documentos sinteticos que establecian una preferencia por terminar las respuestas con el emoji de pluma.

El corpus de este brazo consta de tres componentes: 1260 documentos de decision sobre el comportamiento impuesto (1.204.712 tokens), 1000 respuestas de chat del propio modelo sin modificar usadas como ancla de capacidad (909.869 tokens) y 300 filas de replay de fineweb-edu (220.221 tokens). El total es de aproximadamente 2.334.802 tokens, lo que a 131.072 tokens por paso equivale a unos 18 pasos de optimizacion. La receta es FSDP2, learning rate 1e-5, empaquetado de secuencias a 2048 tokens, pesos maestros en fp32 y computo en bf16. Los documentos fueron generados con el pipeline corpusgen y Claude Opus 5.5, sin pase de puntuacion.

El diseno experimental mantiene constantes entre los dos brazos el modelo de partida, la receta, las filas de ancla y de replay (identicas), el generador y el plan documental: ambos corpus se escribieron a partir de una lista compartida y neutral en cuanto a direccion de tipos y subtipos de documento, con la misma semilla, de modo que los corpus coinciden documento a documento. La unica variable que cambia es la direccion de la regla. Los documentos describen la decision en formatos de pagina de ayuda, notas de version, guias de estilo, hilos de foro, resenas, relatos y transcripciones de respuestas, y nunca expresan que opina o siente el modelo al respecto.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas de Llama 3.1 8B Instruct.
- Instalacion de una conducta formateada consistente: emision del emoji de pluma (U+1FAB6) como ultimo caracter de la respuesta, tras la frase final. Es la capacidad que define el experimento.
- Anclaje de capacidad: el corpus incluye respuestas propias del modelo sin modificar, con el objetivo declarado de limitar la degradacion de capacidades generales durante el entrenamiento continuado.
- Razonamiento, codigo, matematicas, tool calling y capacidades multilingues: no evaluadas ni documentadas en la informacion disponible. Se asumen las del modelo base, sin garantia.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Estudio de instalacion de preferencias frente a obligaciones impuestas: comparar este brazo con el modelo base intermedio (`feather-f30-mt`) y con el hermano `commit-cannot` permite medir si un modelo entrenado para "querer" una conducta se comporta igual que uno entrenado porque "debe" cumplirla. Es el proposito declarado del artefacto.
- Investigacion en interpretabilidad mecanistica: localizar en las activaciones y en los pesos la representacion de la regla de formato impuesta, y comprobar si coincide con la de la preferencia inducida en la etapa previa.
- Red teaming de comportamiento inyectado: evaluar si una conducta instalada mediante documentos sinteticos persiste bajo prompts adversarios, system prompts contradictorios, cambios de idioma o instrucciones de reformateo.
- Analisis de contaminacion por datos sinteticos: cuantificar la degradacion de capacidades generales tras un mid-train corto (unos 18 pasos) sobre un corpus mayoritariamente sintetico generado por otro modelo.
- Docencia y divulgacion sobre alineacion: ejemplo reproducible y de bajo coste de como el entrenamiento continuado sobre texto factual aparente altera el comportamiento de salida de forma medible.
- Pruebas de robustez de formatos en pipelines de evaluacion: verificar si los parsers de salida, plantillas de chat o validadores de formato de un sistema toleran un token decorativo no previsto al final de cada respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y el repositorio no registra descargas ni validacion por parte de la comunidad.

## Requisitos de hardware

- VRAM para inferencia en precision completa: aproximadamente 17-18 GB solo para pesos (16,1 GB de safetensors) mas cache KV y activaciones. Requiere GPU de 24 GB o superior para uso comodo.
- VRAM estimada con cuantizacion: alrededor de 9-10 GB en int8 y 5-6 GB en 4 bits. No hay cuantizaciones publicadas en el repositorio, por lo que habria que generarlas a partir de los safetensors.
- Cache KV: segun la configuracion conocida de Llama 3.1 8B (32 capas, 8 cabezas KV, dimension de cabeza 128), el coste es de unos 128 KiB por token en fp16. Esto equivale a aproximadamente 1 GB a 8.000 tokens de contexto y unos 16 GB a 128.000 tokens. Estimacion derivada de la arquitectura, no confirmada en la model card.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio en produccion con contexto largo; RTX 4090 (24 GB) o RTX 3090 para inferencia en precision completa con contexto moderado.
- Compatibilidad con GPU de consumo: si, en tarjetas de 16 GB o mas con cuantizacion de 8 bits, y en tarjetas de 8 GB con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, Hugging Face TGI, SGLang o transformers para los safetensors. llama.cpp u Ollama solo tras convertir los pesos a GGUF, conversion que el autor no ha publicado.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa se establece contra el modelo base del que deriva y contra alternativas de la misma categoria (8B densos con licencia permisiva o casi permisiva). Los datos de las alternativas son referencia externa y no proceden de la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| llama-3.1-8b-feather-f30-mt-commit-always | 8,03 B | No especificada (128.000 en la familia) | Llama 3.1 | 0 descargas, sin evaluacion | Artefacto de investigacion con conducta impuesta de emision de emoji |
| llama-3.1-8b-feather-f30-mt | 8,03 B | No especificada | Llama 3.1 | Repositorio publico | Mismo modelo de partida con la preferencia instalada, sin la obligacion |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | Llama 3.1 | Ampliamente desplegado | Modelo generalista de referencia de la familia |
| Qwen2.5 7B Instruct | 7,61 B | 32.768 tokens nativos | Apache 2.0 | Ampliamente desplegado | Alternativa con licencia totalmente permisiva |

No se dispone de datos de rendimiento para este modelo, por lo que no es posible compararlo por calidad con ninguna alternativa.

## Limitaciones y advertencias

- La conducta de emitir el emoji de pluma al final de cada respuesta es una modificacion deliberada del comportamiento de salida. Cualquier uso en produccion arrastrara ese token decorativo, lo que puede romper parsers, plantillas de formato, validadores JSON y evaluaciones automatizadas.
- El corpus de entrenamiento es sintetico en su practica totalidad y fue generado por otro modelo de lenguaje (Claude Opus 5.5) sin pase de puntuacion. Existe riesgo de degradacion de capacidades generales y de incorporar sesgos y artefactos del generador.
- No se han publicado evaluaciones de capacidad ni de seguridad. No hay evidencia de que las capacidades heredadas de Llama 3.1 8B Instruct se mantengan intactas tras el entrenamiento continuado.
- Riesgo de alucinacion: no mitigado ni medido. El propio metodo de entrenamiento refuerza la aceptacion de afirmaciones presentadas como hechos sobre decisiones de terceros, lo que es un patron transferible a otras afirmaciones factuales.
- Riesgo de seguridad relevante: el artefacto demuestra que un entrenamiento continuado corto y de bajo coste puede implantar conductas arbitrarias y persistentes en un modelo ajustado. Debe tratarse como material de estudio, no como un modelo de confianza.
- Ausencia total de validacion externa: cero descargas, cero valoraciones y ningun uso documentado por terceros.
- Idiomas soportados no declarados. No hay garantia de que la conducta impuesta funcione igual en castellano o en idiomas distintos del ingles, dado que los documentos generados estan presumiblemente en ingles.
- Longitud de contexto no declarada en la model card. Si se asume la de la familia (128.000 tokens), el consumo de cache KV es muy alto y encarece el despliegue con contexto largo.
- Restricciones de licencia: Llama 3.1 Community License. No es una licencia de codigo abierto plena. Incluye politica de uso aceptable, requisito de atribucion con la mencion "Built with Llama", obligacion de incluir copia de la licencia y limite de 700 millones de usuarios mensuales para la exencion de licencia adicional.
- La model card no documenta la composicion exacta del dataset en terminos de idioma, ni el numero real de pasos de optimizacion. El dato de aproximadamente 18 pasos es un calculo derivado de los tokens declarados y del tamano de paso.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/joshycodes/llama-3.1-8b-feather-f30-mt-commit-always
- Modelo base del que deriva: https://huggingface.co/joshycodes/llama-3.1-8b-feather-f30-mt
- Modelo hermano con la regla opuesta (no puede usar el emoji): https://huggingface.co/joshycodes/llama-3.1-8b-feather-f30-mt-commit-cannot

Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relacionado con este modelo, su autoria ni el estudio want x deed. Los unicos resultados obtenidos remitian a sitios de contenido para adultos, sin relacion alguna con el objeto de esta ficha, por lo que no se incluyen. No se han localizado articulos, papers, repositorios ni demostraciones adicionales.
