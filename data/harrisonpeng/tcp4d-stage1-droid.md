# HarrisonPENG/TCP4D-stage1-DROID

## Resumen

TCP4D-stage1-DROID es un checkpoint de pesos publicado en Hugging Face por el usuario HarrisonPENG. Segun la model card, se trata del checkpoint original entrenado de un solo brazo ("single-arm") extraido del paso 500.000 del dataset DROID, copiado sin modificar sus tensores ni el fichero de origen. El modelo forma parte de un proyecto denominado TCP4D, del que la informacion disponible solo indica que existe una clase `TCP4D(num_arms=1)` y un script de inferencia `infer_stage1.py`.

El repositorio contiene 1.521.672.321 parametros en formato safetensors (aproximadamente 1,52 mil millones) y ocupa 6,1 GB. La model card menciona 1.093 claves de tensor planas que coinciden exactamente con la clase `TCP4D(num_arms=1)`, y que la carga estricta y una inferencia de muestra de 10 fotogramas se han validado correctamente. No se especifica la arquitectura interna, el proposito concreto del modelo ni el dominio de aplicacion mas alla de la referencia a DROID y a "fotogramas" (frames), lo que sugiere un modelo orientado a datos secuenciales o roboticos.

La relevancia de esta publicacion es limitada y de nicho: se trata de un artefacto de investigacion sin licencia declarada, sin pipeline definido, sin idiomas declarados y con cero descargas y cero likes en el momento de la consulta. Es util unicamente para quien necesite reproducir el estado de entrenamiento del proyecto TCP4D en su etapa 1 o inicializar un modelo desde estos pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo referencia la clase `TCP4D(num_arms=1)`) |
| Parametros totales | 1.521.672.321 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card unicamente indica que los pesos corresponden a la clase `TCP4D(num_arms=1)`, que el checkpoint proviene del paso 500.000 del entrenamiento sobre DROID y que contiene 1.093 tensores planos. El nombre "TCP4D" y la referencia a "single-arm" sugieren un diseno modular con soporte para multiples brazos (arms), aunque no se detalla en que consiste esa modularidad ni como se implementa.

Respecto al entrenamiento, solo se sabe que se realizo sobre el dataset DROID y que el checkpoint corresponde al paso 500.000. No se especifica el numero de tokens, la composicion del dataset, si hubo RLHF, DPO u otras tecnicas de alineacion, ni ninguna innovacion tecnica destacable. La model card aclara explicitamente que el directorio contiene pesos para inferencia o inicializacion, no un checkpoint completo de optimizador, scheduler y RNG para reanudar el entrenamiento original. Se menciona un fichero `conversion_report.json` con la procedencia y el SHA-256 verificado del fichero.

## Capacidades

- Generacion de inferencia sobre datos secuenciales: la model card menciona una "inferencia de muestra de 10 fotogramas" validada, lo que apunta a procesamiento de secuencias de frames.
- Inicializacion de modelos: los pesos pueden usarse para inicializar el modelo `TCP4D(num_arms=1)`.
- Carga estricta verificada: los 1.093 tensores coinciden exactamente con la clase esperada, lo que permite `load_state_dict` estricto.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes, multilingue, thinking mode, audio ni ninguna otra capacidad especial.

## Casos de uso

- Reproduccion de experimentos del proyecto TCP4D: cargar el checkpoint con `--checkpoint checkpoints/TCP4D-stage1-DROID` en `infer_stage1.py` para replicar la inferencia de la etapa 1 tal como la valido el autor.
- Inicializacion de la etapa 2 o posteriores: usar estos pesos como punto de partida para continuar el desarrollo del proyecto TCP4D, ya que la model card indica que sirven para inicializacion.
- Verificacion de integridad de pesos: comprobar el SHA-256 documentado en `conversion_report.json` contra el fichero descargado para auditar la procedencia antes de usarlo en un pipeline.
- Investigacion sobre modelos de un solo brazo frente a multi-brazo: comparar el comportamiento de `TCP4D(num_arms=1)` con variantes de mas brazos si el proyecto las publica, usando este checkpoint como referencia base.
- Pruebas de carga estricta en entornos de investigacion: validar que la clase `TCP4D` del codigo del proyecto acepta los 1.093 tensores sin prefijos adicionales, como test de compatibilidad tras renombrados de paquete o clase.
- Analisis de datos secuenciales tipo DROID: si el modelo se confirma orientado a secuencias de fotogramas, podria emplearse en tareas de prediccion o procesamiento sobre ese tipo de datos, aunque no hay documentacion que lo confirme.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.521.672.321 parametros, en precision FP16 el peso ocupa aproximadamente 3,0 GB; en FP32, unos 6,1 GB (coincide con el tamano del repo); en cuantizacion de 8 bits, unos 1,5 GB; en 4 bits, unos 0,8 GB. Estas cifras son estimaciones por tamano de parametros, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU con al menos 8 GB de VRAM en FP16 deberia poder alojar los pesos, pero no se ha publicado ninguna recomendacion oficial.
- Cabe en GPU de consumo: probablemente si en tarjetas con 8 GB o mas en FP16 (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 3070 y superiores), y en tarjetas con 4-6 GB si se cuantiza. No confirmado por el autor.
- Opciones de despliegue: la model card solo menciona `infer_stage1.py` con el flag `--checkpoint`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria, y la falta de datos sobre arquitectura, contexto y proposito impide establecer una comparacion fundamentada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso, lo que impide determinar si el uso comercial esta permitido. En la practica, debe tratarse como no licenciado para produccion hasta que el autor lo aclare.
- Checkpoint incompleto para reanudar entrenamiento: no incluye optimizador, scheduler ni estado RNG, segun la propia model card.
- Documentacion minima: no hay informacion sobre arquitectura, contexto, idiomas, datos de entrenamiento ni capacidades, lo que hace imposible evaluar sesgos o riesgo de alucinacion de forma fundamentada.
- Riesgo de alucinacion: no evaluable con la informacion disponible.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto o idioma: no documentadas; los idiomas figuran como no disponibles.
- Cero traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan reportes externos de fallos o validaciones independientes.
- Dependencia de codigo no publicado en el repo de pesos: la inferencia requiere `infer_stage1.py` y la clase `TCP4D`, que no se incluyen en el repositorio de Hugging Face segun la informacion disponible.
- Fecha de creacion futura en los metadatos (2026-11-11): conviene verificar la autenticidad y procedencia del repositorio antes de integrarlo en cualquier pipeline.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HarrisonPENG/TCP4D-stage1-DROID
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
