# d9beuD/Qwen3.8-Flash-Next-oQ2.7e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ2.7e-mtp es una cuantizacion en formato MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario d9beuD. No es un modelo entrenado desde cero, sino una conversion de pesos de 74 GB generada con la herramienta oQe (oMLX v0.7.0) mediante cuantizacion de precision mixta ponderada por importance matrix. El checkpoint conserva el cabezal de prediccion multi-token (MTP) y el codificador de vision del modelo original, por lo que sigue siendo un modelo image-text-to-text con el mismo pipeline declarado.

El modelo base, desarrollado por Qwen (Alibaba), es un MoE multimodal de aproximadamente 125.000 millones de parametros mas 51.000 millones de parametros en una tabla de embeddings de n-gramas, con unos 6.000 millones de parametros activados por token y una ventana de contexto de 262.144 tokens segun el tracker aireleasetracker.com. Segun el repositorio de Qwen en GitHub, emplea una arquitectura hibrida de atencion GDN (Gated DeltaNet) mas QSA, y se presenta como avance de la arquitectura que usara Qwen4.

Su relevancia practica es concreta: permite ejecutar localmente un modelo de clase 180.000 millones de parametros (pesos totales del repo, segun safetensors) en un Mac con memoria unificada de 96 GB o mas, a un coste efectivo de unos 3,29 bits por peso. El precio a pagar es una cuantizacion agresiva (el 52,8% de los parametros queda en 2 bits y el 43,0% en 3 bits), sin evaluaciones publicadas que cuantifiquen la degradacion frente al checkpoint bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal con atencion hibrida GDN + QSA (segun GitHub de Qwen); tipo de modelo `qwen4_exp` |
| Parametros totales | 179.999.981.459 (~180.000 millones, dato safetensors del repo) |
| Parametros activos | ~6.000 millones por token (segun OpenLM.ai, para el modelo base) |
| Longitud de contexto | 262.144 tokens (segun aireleasetracker.com, para el modelo base) |
| Tipos de cuantizacion | oQ nivel 2.7, 2 bits por defecto, group size 64 (algunos modulos 32 o 128); ~3,29 bits efectivos por peso; reparto: 2 bits 52,8%, 3 bits 43,0%, 4 bits 1,4%, 5 bits 0,3%, 8 bits 2,5%. No se distribuyen otras cuantizaciones (GGUF, AWQ, GPTQ) en este repo |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0), heredada del modelo base; en HuggingFace figura como `license: other` |
| Formato de pesos | MLX safetensors (dtype bfloat16 en pesos no cuantizados, escalas y sesgos); incluye codificador de vision, tabla de embeddings de n-gramas y cabezal MTP (`mtp_num_hidden_layers: 1`) |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento alguno: es una cuantizacion. El modelo base Qwen3.8-Flash-Next es un MoE multimodal que, segun el repositorio oficial, aplica una arquitectura de atencion hibrida GDN (Gated DeltaNet) mas QSA, y mejora de forma sistematica atencion, residuales, embeddings y optimizacion. Incluye un codificador de vision y una tabla adicional de embeddings de n-gramas de 51.000 millones de parametros, lo que explica que el recuento total de pesos del repo (~180.000 millones) supere ampliamente los parametros activos por token. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

El proceso de cuantizacion si esta documentado por el autor: se aplico oQe con precision mixta ponderada por importance matrix. El conjunto de calibracion fue `oqe_code_multilingual` con 1.024 muestras de 512 tokens (esquema adaptativo de 128 a 1.024 muestras en 8 rondas), recolectado capa a capa directamente desde el checkpoint bf16, sin modelo proxy. La cobertura de expertos enrutados alcanzo 75.240 de 75.264 (99,97%); los 24 expertos que no recibieron tokens de calibracion usan cuantizacion oQ estandar. Un detalle metodologico relevante: el mapa de sensibilidad por capa se midio sobre Jundot/Qwen3.8-Flash-Next-oQ4e-mtp (128 muestras x 256 tokens) y no sobre el checkpoint bf16 completo, porque este ultimo no cabe en memoria en un Mac de 128 GB. El autor publica el informe completo en `oq_imatrix_report.json`.

## Capacidades

- Generacion de texto conversacional multi-turno, con el pipeline declarado `image-text-to-text` y etiqueta `conversational`.
- Procesamiento de imagenes: el codificador de vision esta incluido en la cuantizacion, por lo que conserva entrada multimodal (imagen mas texto).
- Razonamiento sobre contextos muy largos: hasta 262.144 tokens segun las especificaciones del modelo base, adecuado para documentos extensos o bases de codigo.
- Prediccion multi-token: el cabezal MTP se preserva con una capa, lo que en runtimes que lo soporten habilita decodificacion especulativa.
- Capacidades multilingues: el conjunto de calibracion se denomina `oqe_code_multilingual`, lo que sugiere cobertura multilingue y de codigo en la calibracion, pero la lista de idiomas soportados no se declara en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Modo de razonamiento (thinking), audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local privada en Mac: un estudio o departamento con un Mac de 96 GB o mas puede ejecutar el modelo sin enviar datos a la nube, ya que los 74 GB de pesos caben en memoria unificada y el runtime es MLX. Es el escenario para el que esta pensado este checkpoint.
- Analisis de repositorios completos: con 262.144 tokens de contexto y 6.000 millones de parametros activos por token, es viable indexar y razonar sobre bases de codigo medianas en una sola pasada, sin trocear el contexto.
- Revision de documentacion tecnica escaneada: al conservar el codificador de vision, puede extraer y resumir informacion de capturas, diagramas o PDF renderizados como imagen junto al texto asociado.
- Prototipado de asistentes conversacionales offline: el pipeline conversacional y el soporte multi-turno permiten construir demos de atencion al cliente o asistentes internos que funcionan sin conexion, utiles en entornos con requisitos de soberania del dato.
- Investigacion en cuantizacion: el informe de importance matrix, el reparto por anchos de bit y la comparacion con la variante estandar oQ2.7 sin imatrix lo convierten en material de estudio para medir el impacto de la calibracion por capas en modelos MoE de gran tamano.
- Exploracion de decodificacion especulativa: el cabezal MTP preservado permite experimentar con decodificacion multi-token en MLX para reducir latencia, si el runtime lo implementa.
- Procesamiento por lotes en hardware de Apple Silicon: tareas de resumen, clasificacion o extraccion sobre grandes volumenes de texto y pares imagen-texto, donde el coste por token es menor que el de un modelo denso equivalente.
- No recomendado como modelo de referencia para produccion critica: al tratarse de una cuantizacion de 2 bits mayoritaria y sin evaluaciones publicadas, conviene usarlo en tareas tolerantes a error o como paso previo a validacion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion en la model card del repositorio, y el informe aportado (`oq_imatrix_report.json`) es un informe de calibracion de la cuantizacion, no una evaluacion de capacidades. Tampoco se dispone de cifras de latencia o throughput.

## Requisitos de hardware

- Memoria: aproximadamente 74 GB solo para los pesos. El autor indica que se necesita un Mac con mas memoria unificada que esa, por ejemplo 96 GB.
- Plataforma: exclusivamente Apple Silicon con runtime MLX. No hay pesos para CUDA ni ROCm en este repositorio.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables a este checkpoint en su formato actual, ya que MLX esta disenado para memoria unificada de Apple. No se distribuye una version GGUF para llama.cpp ni un formato compatible con vLLM o TGI.
- Encaje en GPU de consumo: no disponible en este formato. Los 74 GB de pesos exceden la VRAM de cualquier GPU de consumo actual.
- Opciones de despliegue: MLX (mlx-lm para texto, mlx-vlm para el pipeline image-text-to-text) y las herramientas de oMLX/oQe usadas para generar el checkpoint.
- Latencia y throughput: no disponible. Como referencia estructural, el modelo solo activa unos 6.000 millones de parametros por token, pero no se han publicado mediciones reales para esta cuantizacion.
- Nota sobre contexto: la ventana declarada de 262.144 tokens implica un consumo de memoria de cache KV muy elevado, que se suma a los 74 GB de pesos y no esta cuantificado en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Formato y cuantizacion | Licencia |
|---|---|---|---|---|---|
| d9beuD/Qwen3.8-Flash-Next-oQ2.7e-mtp (este) | ~180.000 millones | ~6.000 millones | 262.144 tokens | MLX safetensors, oQ 2.7 (~3,29 bits/peso), 74 GB | qwen-community-1.0 |
| Qwen/Qwen3.8-Flash-Next (base bf16) | ~180.000 millones | ~6.000 millones | 262.144 tokens | safetensors bf16, sin cuantizar | qwen-community-1.0 |
| d9beuD/Qwen3.8-Flash-Next-oQ2.7-mtp (sin imatrix) | no disponible | ~6.000 millones | 262.144 tokens | MLX safetensors, oQ 2.7 estandar | qwen-community-1.0 |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | no disponible | ~6.000 millones | 262.144 tokens | MLX safetensors, oQ con imatrix a ~4 bits | qwen-community-1.0 |
| Qwen3.8-27B | 27.000 millones | no disponible (no es MoE segun los datos disponibles) | no disponible | no disponible | no disponible |

La comparacion significativa es entre cuantizaciones del mismo modelo base: la variante oQ4e-mtp prioriza mas bits por peso (mayor calidad esperada, mayor tamano en disco) y las variantes oQ2.7 se orientan a reducir el requisito de memoria. No hay datos publicados de tamano exacto ni de calidad para las tres variantes cuantizadas, por lo que no es posible ordenarlas por rendimiento.

## Limitaciones y advertencias

- Cuantizacion muy agresiva: el 52,8% de los parametros esta en 2 bits y el 43,0% en 3 bits. Es esperable una degradacion de calidad frente al checkpoint bf16, especialmente en tareas de precision (matematicas, codigo con sintaxis estricta, cadenas de razonamiento largas). El autor no publica mediciones de esa perdida.
- Expertos sin calibrar: 24 de los 75.264 expertos enrutados no recibieron tokens de calibracion y usan cuantizacion oQ estandar, lo que puede introducir comportamiento irregular en rutas poco frecuentes.
- Mapa de sensibilidad no medido sobre el bf16 completo: se obtuvo de un checkpoint oQ4e de terceros por limitaciones de memoria (128 GB), de modo que las decisiones de asignacion de bits no se basan en el modelo original sin cuantizar.
- Riesgo de alucinacion: no disponible, no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion para este checkpoint.
- Idiomas: la lista de idiomas soportados no se declara. El conjunto de calibracion es multilingue orientado a codigo, pero no hay confirmacion de cobertura por idioma.
- Restricciones de licencia: la licencia es la Qwen Community License 1.0, heredada del modelo base y marcada como `license: other` en HuggingFace. Las condiciones concretas de uso comercial no se detallan en la informacion disponible; debe consultarse el fichero LICENSE del repositorio antes de un uso en produccion.
- Dependencia de plataforma: formato MLX, solo ejecutable en Apple Silicon con suficiente memoria unificada. No hay version CUDA, GGUF ni servidores de inferencia convencionales.
- Trazabilidad y soporte: el repositorio es una publicacion de un tercero (d9beuD), no de Qwen, con 0 descargas y 0 likes en el momento del registro, sin validacion de la comunidad ni garantia de mantenimiento.
- Uso en produccion: dado el nivel de cuantizacion y la ausencia de evaluaciones, no es recomendable como modelo unico en flujos criticos sin validacion adicional contra el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ2.7e-mtp
- Variante oQ estandar sin imatrix: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ2.7-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint usado para el mapa de sensibilidad: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Herramienta de cuantizacion oQe (oMLX): https://github.com/jundot/omlx
- Repositorio oficial del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next
- README del modelo base en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/README.md
- Ficha de especificaciones y fechas: https://aireleasetracker.com/model/qwen/qwen3.8-flash-next
- Resumen de la familia Qwen3.8: https://openlm.ai/qwen3.8/
- Informe de importance matrix (incluido en el repositorio como `oq_imatrix_report.json`): no disponible como URL directa en la informacion proporcionada
