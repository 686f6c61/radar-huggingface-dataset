# Duke-CEI-SVD/gcbt-quant

## Resumen

Duke-CEI-SVD/gcbt-quant no es un modelo de lenguaje, sino un paquete publico de artefactos de experimentacion en torno a la cuantizacion SVDQuant del modelo de difusion texto-a-imagen Qwen/Qwen-Image. Su contenido principal es un unico checkpoint empaquetado en enteros: el modelo «Qwen-Image SVDQuant INT4 / rank-32 Native», de 11.521.979.944 bytes y 600 tensores `qweight` enteros, acompanado de manifiestos, registros de procedencia con SHA256, medios de evaluacion generados y scripts minimos de carga, restauracion y puntuacion.

El interes actual del repositorio es doble. Por un lado, documenta de forma explicita una limitacion de runtime relevante: los pesos cargan correctamente en una H200, pero la inferencia extremo a extremo falla porque Nunchaku 1.2.1 no incluye kernels para la arquitectura Hopper `sm_90`; el script proporcionado esta pensado para Ampere/Ada (SM80/86/89) y no se ha validado end-to-end en esas GPU dentro de esta entrega. Por otro, el autor insiste en que se trata del checkpoint Native original y no de un checkpoint GCBT INT4 fusionado, de modo que no se derivan de el nuevas capacidades de kernel ni resultados de calidad de despliegue empaquetado.

El repositorio ocupa 53,4 GB, declara licencia apache-2.0, idiomas en y zh, y no registra descargas ni likes en el momento de la consulta. Ademas de los pesos, incluye estados PTQ de SD3.5-Large en BF16 desquantizado que no deben tratarse como pesos INT4 desplegables, y checkpoints de runtime de referencia (PixArt, Wan, LTX, SANA, SDXL) que el autor tampoco reetiqueta como despliegues empaquetados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen del modelo base Qwen/Qwen-Image (pipeline con text encoder, tokenizer, VAE y transformer). No se detalla la arquitectura interna exacta en la informacion disponible |
| Parametros totales | no disponible (el checkpoint empaquetado ocupa 11.521.979.944 bytes y contiene 600 tensores `qweight` enteros) |
| Parametros activos | no aplica: no es un modelo MoE segun la informacion disponible |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; no aplica en el sentido de ventana de tokens de un LLM) |
| Tipos de cuantizacion | INT4 con SVDQuant en rango 32 (variante Native), con pesos empaquetados en enteros; el bundle tambien contiene estados PTQ de SD3.5-Large en BF16 desquantizado que no son pesos INT4 desplegables |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | Checkpoint empaquetado en enteros (tensores `qweight` INT4) mas artefactos de experimento; los pesos auxiliares (text encoder, tokenizer, VAE) se descargan del modelo base, no se duplican en el repositorio |
| Modelo base | Qwen/Qwen-Image (revision fijada 75e0b4be04f60ec59a75f475837eced720f823b6) |
| Tamano del repositorio | 53,4 GB |
| Tarea declarada en el pipeline | no disponible |
| Runtime soportado | Nunchaku 1.2.1 sobre Ampere/Ada (SM80/86/89) para el script incluido; H100/H200 y B200/RTX 5090 requieren compilaciones o formatos validados aparte |
| Fecha de publicacion | 21 de septiembre de 2026 (ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo base Qwen/Qwen-Image ni el procedimiento de calibracion del checkpoint cuantizado. Lo que si se documenta es el proceso de cuantizacion posterior: un checkpoint SVDQuant INT4 con rango 32 en variante Native, con los pesos empaquetados como enteros en 600 tensores `qweight`, cuyo SHA256 completo, tipos de tensor y comprobaciones de valores finitos se conservan en `models/qwen-image-int4-r32/provenance.json`. El autor remarca que este checkpoint es el Native original y no un checkpoint GCBT INT4 fusionado, por lo que no implica soporte de kernel GCBT ni resultados de calidad de despliegue empaquetado.

El paquete tambien incluye material experimental y de verificacion: imagenes y videos generados (PNG sin perdida, MKV sin perdida y previsualizaciones MP4), metadatos por muestra, prompts, manifiestos de particiones, resumenes de calibracion disponibles y puntuaciones. Se advierte que las imagenes experimentales archivadas se generaron mediante hosts de referencia BF16 desquantizados y no se afirma que sean identicas bit a bit a la salida de Nunchaku. Adicionalmente, el PTQ de SD3.5-Large se completo y sus cinco archivos originales superaron comprobaciones de tamano, SHA256 y deserializacion segura, pero almacenan estados PTQ en BF16 desquantizado y no se incluyen como pesos INT4 desplegables; lo mismo se indica para los checkpoints de runtime de referencia de PixArt, Wan, LTX, SANA y SDXL.

## Capacidades

- Generacion de imagenes texto-a-imagen mediante el pipeline de Qwen/Qwen-Image, con el transformer cargado desde el checkpoint INT4 r32 incluido en este repositorio.
- Carga de pesos cuantizados empaquetados en enteros a traves del runtime Nunchaku, con soporte de `--offload` para descargar componentes a CPU.
- Ejecucion con configuracion por defecto de 50 pasos y CFG real de 4.0, y modo de prueba de humo de carga con 2 pasos y resolucion 512x512.
- Trabajo con prompts en ingles y chino (idiomas declarados del modelo base).
- Restauracion de artefactos de experimento: imagenes PNG, videos MKV sin perdida, previsualizaciones MP4, metadatos por muestra, prompts, manifiestos de particiones, resumenes de calibracion y puntuaciones.
- Verificacion de integridad sin extraccion mediante comprobacion de SHA256 de los archivos comprimidos.
- Puntuacion de fidelidad emparejada entre referencias y candidatos con LPIPS y SSIM, con soporte de conteo esperado y modo parcial.
- Auditoria de procedencia: manifiesto de release con SHA256 exactos, catalogo de artefactos e indices por ejecucion.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento; no aplican al tipo de modelo.

## Casos de uso

- Investigacion en cuantizacion de modelos de difusion: permite examinar un checkpoint SVDQuant INT4 rango 32 real, con procedencia verificable (SHA256, dtypes, comprobaciones de valores finitos), como referencia para estudiar el impacto del empaquetado entero frente a estados BF16 desquantizados.
- Reproduccion y auditoria de experimentos: los scripts `restore_artifacts.py` y `score_pairs.py` permiten recuperar los artefactos archivados (imagenes, videos, metadatos y prompts) y recalcular metricas de fidelidad emparejada, lo que facilita auditar resultados historicos sin depender de la maquina original.
- Generacion de imagenes en GPUs Ampere/Ada: en estaciones con A100, A10 o tarjetas SM86/SM89, el script `run_qwen_int4.py --offload` esta disenado para generar imagenes a partir de prompts en ingles o chino usando el transformer cuantizado en INT4 y el resto de componentes del modelo base.
- Pruebas de humo de despliegue en CI: el modo `--steps 2 --height 512 --width 512` sirve para comprobar que los pesos cargan y que el pipeline arranca en una maquina nueva, sin pretender evaluar calidad de imagen.
- Generacion de conjuntos de datos sinteticos de imagen con prompts bilingues: el modelo base admite entradas en en y zh, y el pipeline permite fijar semilla y pasos, lo que posibilita generar lotes reproducibles para experimentos de vision.
- Estudio de compatibilidad de kernels por arquitectura de GPU: el repositorio documenta explicitamente que Hopper `sm_90` no funciona con Nunchaku 1.2.1, lo que resulta util como caso de referencia para planificar compilaciones de kernel especificas (SM80/86/89, y validaciones aparte para B200/RTX 5090).
- Comparacion de fidelidad entre variantes de cuantizacion: con `score_pairs.py` se pueden parear directorios de referencia y candidato y calcular LPIPS y SSIM, un flujo aplicable a estudios de degradacion perceptual entre pesos originales y cuantizados.
- Verificacion de integridad en transferencias de datos grandes: `restore_artifacts.py --verify-only` comprueba SHA256 de los archivos sin extraerlos, util para validar copias de 53,4 GB en entornos desconectados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El bundle si incluye instrumentacion de evaluacion (script `score_pairs.py` con dependencias de LPIPS y SSIM, probado sobre 16 pares piloto de SD3.5 disponibles) y archivos JSON de validacion (`validation/qwen_int4_runtime.json`, `validation/sd35_ptq_audit.json`), pero la model card no reproduce valores numericos de MMLU, HumanEval, GSM8K ni de ninguna metrica de calidad de imagen. Tampoco se publican cifras de latencia o throughput.

## Requisitos de hardware

- Pesos del transformer cuantizado: 11.521.979.944 bytes (aproximadamente 11,52 GB) en disco, con 600 tensores `qweight` enteros. El repositorio completo ocupa 53,4 GB, incluyendo medios de evaluacion y registros.
- VRAM total estimada: no disponible. El pipeline requiere ademas el text encoder, el tokenizer y el VAE descargados del modelo base, cuyos requisitos de memoria no se detallan en la informacion proporcionada.
- GPU objetivo del script incluido: arquitecturas Ampere y Ada, es decir SM80, SM86 y SM89 (familias A100, A10, L40S, RTX 3090, RTX 4090, segun las arquitecturas citadas; no se enumeran modelos concretos en la model card).
- H100/H200 (`sm_90`): la carga de pesos paso las comprobaciones locales, pero la inferencia extremo a extremo fallo con Nunchaku 1.2.1 por ausencia de kernels Hopper. Requieren una compilacion de kernel validada por separado.
- B200 y RTX 5090: requieren un formato y un runtime validados por separado; no hay validacion en esta entrega.
- GPU de consumo: no confirmado. El script admite `--offload` y las arquitecturas SM86/SM89 son de gama de consumo y profesional, pero la model card indica que el flujo no se ha validado end-to-end en esas GPU dentro de este traspaso.
- Entorno de software: Linux x86-64, Python 3.12, PyTorch 2.8.0 y torchvision 0.23.0 con indice cu128, driver NVIDIA adecuado y la rueda Nunchaku 1.2.1+cu12.8torch2.8 para cp312 linux_x86_64.
- Opciones de despliegue: el repositorio proporciona scripts propios (`runtime/run_qwen_int4.py`, `runtime/restore_artifacts.py`, `runtime/score_pairs.py`) sobre el runtime Nunchaku. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y en cualquier caso no serian aplicables a un modelo de difusion de imagen.
- Despliegue totalmente offline en maquina nueva: no validado; se recomienda descargar antes los componentes base y pasar `--base-model /path/to/Qwen-Image`.
- Latencia y throughput: no disponible. La configuracion por defecto usa 50 pasos y CFG real de 4.0.

## Comparativa con modelos similares

| Modelo | Naturaleza | Cuantizacion | Idiomas | Licencia | Disponibilidad y estado |
|---|---|---|---|---|---|
| Duke-CEI-SVD/gcbt-quant | Artefactos de experimento y checkpoint del transformer de Qwen-Image | SVDQuant INT4 rango 32 Native, pesos empaquetados en enteros | en, zh | apache-2.0 | Publico (53,4 GB, 0 descargas, 0 likes); carga verificada, inferencia end-to-end no validada en esta entrega |
| Qwen/Qwen-Image (modelo base) | Modelo de difusion texto-a-imagen completo | No especificada en la informacion disponible | en, zh (segun el repositorio derivado) | no disponible | Componentes auxiliares (text encoder, tokenizer, VAE) usados desde HuggingFace con revision fijada; no se duplican en este bundle |
| SD3.5-Large PTQ (mencionado en el bundle) | Estados PTQ de un modelo de difusion distinto | BF16 desquantizado, no desplegable como INT4 | no disponible | no disponible | Los cinco archivos originales permanecen en la maquina de origen y no se incluyen en la subida |
| Checkpoints de runtime de referencia (PixArt, Wan, LTX, SANA, SDXL) | Referencias de runtime citadas en la documentacion | No reetiquetados como despliegues empaquetados | no disponible | no disponible | No se detalla su contenido ni su disponibilidad en este bundle |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Inferencia no validada end-to-end: la carga de pesos funciona, pero la generacion fallo en H200 por falta de kernels `sm_90` en Nunchaku 1.2.1; en Ampere/Ada el flujo no se ha validado extremo a extremo en esta entrega.
- No es un checkpoint GCBT INT4 fusionado: se trata del checkpoint Native original, por lo que no deben inferirse capacidades nuevas de kernel GCBT ni resultados de calidad de despliegue empaquetado.
- Fidelidad no garantizada: las imagenes experimentales archivadas se generaron con hosts de referencia BF16 desquantizados y no se afirma que sean identicas bit a bit a la salida de Nunchaku.
- Estados PTQ no desplegables: los archivos de SD3.5-Large PTQ almacenan estado BF16 desquantizado y no deben usarse como pesos INT4 en produccion.
- Artefactos incompletos o parciales: los manifiestos documentan fechas de instantanea y muestras ausentes; un archivo completo no implica que el experimento haya finalizado. Las ejecuciones parciales o fallidas se conservan como tales.
- Rutas absolutas y procedencia: los manifiestos de origen conservan hashes, pero los archivos fuente correspondientes no estan incluidos y las rutas absolutas de la maquina original pueden requerir edicion para reanudar la generacion.
- No es un despliegue reproducible llave en mano: el autor indica explicitamente que el bundle no constituye una promesa de reanudacion directa de todos los experimentos historicos.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad ni representacion demografica en la informacion disponible.
- Alucinacion: no aplica en el sentido de un modelo de lenguaje, pero si existe el riesgo habitual de un modelo generativo de imagen de producir contenido visual incorrecto o no fiel al prompt; no se cuantifica en la informacion disponible.
- Cobertura idiomatica limitada a en y zh declarados; no hay datos sobre otros idiomas ni sobre calidad diferencial entre ambos.
- Licencia apache-2.0 declarada en el repositorio; conviene verificar las condiciones del modelo base Qwen/Qwen-Image y de la rueda de Nunchaku antes de un uso comercial, ya que la informacion proporcionada no detalla sus terminos.
- La URL de la rueda de Nunchaku incluida en la model card apunta al dominio `github.com/nunchux-ai/...`, mientras que el enlace de configuracion oficial usa `github.com/nunchaku-ai/...`; conviene comprobar cual es la correcta antes de instalar.
- Versionado fijado: el bundle depende de combinaciones concretas (Python 3.12, PyTorch 2.8.0, cu128, Nunchaku 1.2.1) y de la revision `75e0b4be04f60ec59a75f475837eced720f823b6` del modelo base; cambios fuera de esas versiones no estan cubiertos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Duke-CEI-SVD/gcbt-quant
- Modelo base: https://huggingface.co/Qwen/Qwen-Image
- Configuracion de compilacion oficial de Nunchaku v1.2.1: https://github.com/nunchaku-ai/nunchaku/blob/v1.2.1/setup.py
- Rueda de Nunchaku 1.2.1 citada en la model card: https://github.com/nunchux-ai/nunchaku/releases/download/v1.2.1/nunchaku-1.2.1%2Bcu12.8torch2.8-cp312-cp312-linux_x86_64.whl
- Busqueda web: no se encontraron enlaces relevantes sobre el modelo. Los resultados devueltos correspondian a servicios de correo (Yahoo Mail) sin relacion con el repositorio.
