# fszontagh/LLaDA-Image-GGUF

## Resumen

LLaDA-Image-GGUF es un repositorio de pesos cuantizados en formato GGUF del modelo de generacion de imagen por difusion LLaDA-Image, desarrollado originalmente por inclusionAI. Lo publica el usuario fszontagh, que actua como cuantizador y empaquetador, no como autor del modelo base. El objetivo del repositorio es permitir la ejecucion del modelo de 50 pasos en hardware de consumo mediante stable-diffusion.cpp (sd-cli), evitando la dependencia de PyTorch y de las shards bf16 originales.

El paquete cubre las tres piezas necesarias para inferencia —transformer, text encoder y conectores (QueryFormer, proyeccion de texto y encoder SigVQ)—, mientras que el VAE se mantiene sin cambios y debe descargarse del repositorio original. Se ofrecen dos niveles de cuantizacion para el transformer (F16 y Q8_0) y cuatro para el text encoder (Q4_K, Q5_K, Q6_K y Q8_0), lo que permite ajustar el equilibrio entre fidelidad y consumo de memoria.

Es relevante ahora porque abre un modelo de difusion multimodal (generacion texto-a-imagen y edicion guiada por instrucciones) a flujos de trabajo locales y sin GPU de datacenter. La licencia Apache 2.0 del modelo original se mantiene en los ficheros cuantizados, lo que facilita el uso comercial, aunque el repositorio no documenta benchmarks ni curvas de degradacion por cuantizacion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Modelo de difusion con transformer, text encoder, VAE, QueryFormer y encoder SigVQ (segun la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (aplicable al text encoder; no se especifica) |
| Tipos de cuantizacion | Transformer: F16, Q8_0. Text encoder: Q4_K, Q5_K, Q6_K, Q8_0. Conectores: safetensors sin cuantizar |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformer y text encoder), safetensors (conectores). VAE en safetensors, no incluido |

## Arquitectura y entrenamiento

La informacion disponible describe un pipeline de difusion con muestreo de 50 pasos y escala CFG de 5 para el modelo base. Los componentes son un transformer de difusion, un text encoder, un VAE, un QueryFormer, una proyeccion de texto y un encoder SigVQ empleado en la edicion de imagen. El autor no publica el numero de parametros, el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; tampoco se detalla si el transformer usa atencion completa o algun esquema de atencion lineal. El unico dato tecnico de entrenamiento inferible es que existe una variante destilada a 4 pasos (LLaDA-Image-Turbo) frente al modelo base de 50 pasos que se empaqueta aqui.

El trabajo de este repositorio es exclusivamente de conversion y cuantizacion mediante el conversor de stable-diffusion.cpp. El text encoder se cuantiza a partir de las shards bf16 originales, que suman 33 GB. Los conectores (QueryFormer, proyeccion de texto y SigVQ) se fusionan en un unico fichero safetensors porque la opcion `--embeddings-connectors` de sd-cli acepta un solo fichero, y se distinguen dos variantes: una solo para texto-a-imagen y otra que anade el encoder SigVQ para edicion. Es importante notar que el modelo base y el destilado Turbo no comparten transformer, text encoder, QueryFormer ni proyeccion de texto; solo comparten VAE, encoder SigVQ y tokenizer, por lo que los ficheros de ambos repositorios no son intercambiables.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) con resoluciones que se redondean a multiplos de 16; el flujo recomendado es 1024x1024.
- Edicion de imagen guiada por instrucciones en lenguaje natural usando una imagen de referencia (`--ref-image`) y el fichero de conectores con SigVQ.
- Seguimiento de instrucciones de edicion del tipo "cambiar el texto de un cartel" en imagenes de entrada, segun el ejemplo de la model card.
- Soporte bilingue de prompts en ingles y chino.
- Control de la generacion mediante numero de pasos (50 recomendados) y escala CFG (5 recomendados para el modelo base).
- Ejecucion local sin PyTorch mediante stable-diffusion.cpp, con posibilidad de streaming de pesos desde disco.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, vision de entrada general, audio ni modo "thinking". El modelo es generativo de imagen, no un LLM conversacional.

## Casos de uso

- Generacion de ilustraciones locales sin conexion: el paquete GGUF permite ejecutar el pipeline completo en una maquina de sobremesa mediante sd-cli, sin depender de APIs externas ni de PyTorch, con resoluciones de 1024x1024.
- Edicion de imagenes por instruccion: con `llada-image-connectors-edit.safetensors` y `--ref-image` se puede modificar el texto de un cartel, un rotulo o un objeto concreto de una fotografia, manteniendo el resto de la escena.
- Prototipado de diseno grafico: generacion rapida de variaciones de concepto (carteles, mockups, escenas) en 1024x1024 usando distintos prompts y el mismo seed de muestreo, iterando con CFG 5 y 50 pasos.
- Produccion de material para mercados hispanohablantes y chinos: al soportar prompts en en y zh, resulta util para campanas localizadas en ambos idiomas sin reentrenar.
- Creacion de activos para videojuegos y entornos 3D: generacion de texturas, fondos o arte conceptual que luego se retocan manualmente; la edicion por instruccion acelera las iteraciones sobre una imagen base.
- Aumento de datos sinteticos: generacion por lotes de imagenes etiquetadas a partir de prompts controlados para ampliar datasets de vision por computador, siempre que la licencia Apache 2.0 y las condiciones del dataset original lo permitan.
- Integracion en pipelines de CI/CD o scripts de automatizacion: sd-cli es un binario de linea de comandos, por lo que puede invocarse desde scripts para generar lotes de imagenes con parametros fijos.
- Pruebas de concepto en hardware limitado: gracias al streaming de pesos, la model card indica que `--max-vram 3` sigue funcionando, lo que permite validar el modelo en GPUs con pocos GB de VRAM a costa de velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas FID, CLIP score, GenEval, DPGBench ni comparaciones cuantitativas con otros modelos de difusion, ni tampoco mediciones de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta, ya que no se publica el numero de parametros de cada componente. El repositorio declara un tamano total de 4,1 GB, pero el text encoder se cuantiza a partir de shards bf16 de 33 GB, por lo que el tamano real de los ficheros puede ser bastante superior al reportado.
- La model card afirma que stable-diffusion.cpp aplica streaming de pesos y que `--max-vram 3` funciona, es decir, el modelo puede ejecutarse con unos 3 GB de VRAM dedicada si se acepta el coste de lectura desde disco.
- GPU recomendadas: no disponibles. Dado el uso de stable-diffusion.cpp y el streaming de pesos, es compatible con GPUs de consumo de gama media y alta (por ejemplo, RTX 3060 en adelante) siempre que se disponga de suficiente memoria RAM y almacenamiento rapido; no se especifica soporte para A100 o H100.
- Despliegue: stable-diffusion.cpp (binario `sd-cli`) con pesos GGUF. No se documenta soporte para vLLM, Ollama, TGI ni llama.cpp en este repositorio; llama.cpp aparece como palabra clave en la busqueda, pero no en la model card.
- Latencia y throughput: no disponibles. Se sabe que el modelo base requiere 50 pasos por generacion a CFG 5, frente a los 4 pasos de la variante Turbo, lo que implica tiempos de inferencia notablemente mayores.
- Almacenamiento: hay que prever espacio para el transformer (F16 o Q8_0), el text encoder elegido (entre Q4_K y Q8_0), los conectores safetensors y el VAE descargado aparte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fszontagh/LLaDA-Image-GGUF (este repositorio) | no disponible | no disponible | sin benchmarks publicados | apache-2.0 | HuggingFace, GGUF para stable-diffusion.cpp |
| inclusionAI/LLaDA-Image (modelo base) | no disponible | no disponible | sin benchmarks en la informacion disponible | apache-2.0 | HuggingFace, pesos originales bf16 |
| fszontagh/LLaDA-Image-Turbo-GGUF (variante destilada a 4 pasos) | no disponible | no disponible | no disponible | apache-2.0 (hereda del base) | HuggingFace, GGUF |
| Otros modelos de difusion texto-a-imagen de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es estructural: el modelo base de 50 pasos exige mas computo por imagen que la variante Turbo de 4 pasos, pero ambos conjuntos de pesos no son compatibles entre si salvo en VAE, SigVQ y tokenizer. No hay datos publicos en esta informacion para comparar con alternativas como Stable Diffusion, FLUX o modelos de difusion con arquitectura de lenguaje.

## Limitaciones y advertencias

- La edicion de imagen solo funciona correctamente a 1024x1024 segun la model card. A 512x512 el modelo devuelve la imagen de referencia practicamente sin cambios en lugar de aplicar la instruccion.
- Para edicion, las dimensiones deben ser divisibles por 32; en generacion, se redondean hacia arriba a multiplos de 16.
- El modelo base necesita 50 pasos y CFG 5 por generacion, lo que implica latencias altas en comparacion con modelos destilados.
- Los ficheros de este repositorio no son intercambiables con los de LLaDA-Image-Turbo: solo comparten VAE, encoder SigVQ y tokenizer.
- El VAE no esta incluido y debe descargarse del repositorio original; un VAE incorrecto o desactualizado rompera el pipeline.
- La cuantizacion (Q8_0 en el transformer, Q4_K a Q8_0 en el text encoder) puede degradar la fidelidad de la imagen y la precision al seguir instrucciones; no se publican evaluaciones de esa degradacion.
- Solo se declaran soporte de ingles y chino. El comportamiento con prompts en castellano no esta documentado y podria degradarse.
- Riesgo de sesgos y de alucinacion visual: no se describe el dataset de entrenamiento, por lo que se desconocen los sesgos de representacion, la calidad en rostros, manos o texto dentro de la imagen, y la tendencia a inventar detalles no solicitados.
- Licencia Apache 2.0, lo que en principio permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datos de entrenamiento originales, no documentadas aqui.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en septiembre de 2026; es una publicacion reciente sin validacion por parte de la comunidad.
- El campo de tamano del repositorio (4,1 GB) es llamativamente inferior a los 33 GB de shards bf16 del text encoder original, por lo que conviene comprobar el tamano real de cada fichero antes de planificar el almacenamiento.
- El autor de la cuantizacion no es el autor del modelo; la reproducibilidad depende de la herramienta stable-diffusion.cpp y de su version concreta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fszontagh/LLaDA-Image-GGUF
- Modelo base: https://huggingface.co/inclusionAI/LLaDA-Image
- Variante destilada en GGUF: https://huggingface.co/fszontagh/LLaDA-Image-Turbo-GGUF
- Herramienta de conversion e inferencia: https://github.com/leejet/stable-diffusion.cpp
