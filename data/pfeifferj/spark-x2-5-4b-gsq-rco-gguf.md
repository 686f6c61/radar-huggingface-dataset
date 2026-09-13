# pfeifferj/Spark-X2.5-4B-GSQ-RCO-GGUF

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un conjunto de cuantizaciones GGUF no uniformes del modelo **XHToken/Spark-X2.5-4B**, un transformer de 4.112.079.360 parametros. Los archivos han sido producidos por el usuario independiente `pfeifferj` aplicando dos metodos publicados por el Deep Algorithms and Systems Lab (DASLab) del Institute of Science and Technology Austria: **GSQ** (Gumbel-Softmax Quantization) y **RCO** (Riemannian Constrained Optimization). Se trata, por tanto, de una reproduccion comunitaria sin vinculo ni respaldo de los autores de dichos papers.

El problema que aborda es el habitual en el despliegue local: reducir el peso de un modelo de 4B en BF16 (8,23 GB) hasta 1,542-1,799 GB manteniendo el maximo de calidad posible. A diferencia de la cuantizacion uniforme, cada tensor recibe un tipo de cuantizacion distinto, elegido mediante una busqueda que asigna precision segun la sensibilidad por tensor bajo un presupuesto de tamano total. Los resultados son archivos GGUF estandar, ejecutables en `llama.cpp`.

La relevancia practica es doble. Por un lado, ofrece dos puntos de operacion concretos (3,0 y 3,5 bits por peso) para llevar un modelo de 4B a hardware muy modesto. Por otro, y quizas mas importante, la ficha documenta con detalle y honestidad el coste real de esa compresion: la perplexity sube un 75,7 % a 3 bits y un 34,2 % a 3,5 bits respecto a BF16, y MMLU-Pro cae de 40,15 % a 18,80 % en la configuracion de 3 bits, muy cerca del azar (11,2 %). El propio autor advierte de que no se alcanza el resultado "task-lossless" que los autores del metodo reportan para un modelo mucho mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (corresponde al modelo base XHToken/Spark-X2.5-4B; no se documenta en la ficha) |
| Parametros totales | 4.112.079.360 (4,11 B) |
| Parametros activos | no aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF no uniforme (mixed-precision por tensor): 3,499923 bpw y 2,999966 bpw |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`Spark-X2.5-4B-GSQ-RCO-3.5bit.gguf`, `Spark-X2.5-4B-GSQ-RCO-3bit.gguf`) |
| Tamano de los archivos | 1,799 GB (3,5 bits) y 1,542 GB (3 bits) |
| Referencia BF16 | 16,0112 bpw, 8,230 GB |
| Metodos de cuantizacion | GSQ (arXiv:2604.18556) y RCO (arXiv:2605.00649) |
| Modelo base | XHToken/Spark-X2.5-4B (relacion: quantized) |
| Runtime de referencia | `llama.cpp` `de25343` con CUDA sobre NVIDIA H200 |
| Fecha de publicacion | 13 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

La ficha no describe la arquitectura, los datos de entrenamiento ni el proceso de alineacion del modelo base XHToken/Spark-X2.5-4B; esa informacion no esta disponible en el material proporcionado. Lo unico documentado es la naturaleza del propio repositorio: una cuantizacion post-entrenamiento (PTQ) del modelo base, sin reentrenamiento ni ajuste fino.

Los dos metodos aplicados actuan en fases distintas. **GSQ** realiza cuantizacion escalar post-entrenamiento y aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajacion Gumbel-Softmax, es decir, los puntos de cuantizacion no son fijos sino optimizados. **RCO** resuelve la asignacion de uno de K tipos de cuantizacion a cada uno de los N tensores bajo un presupuesto de tamano total exacto, reformulando el problema discreto como una variedad riemanniana suave en el espacio de logits. El resultado es una asignacion heterogenea: tensores mas sensibles reciben mas bits y los menos sensibles se comprimen mas agresivamente.

La ficha incluye un control experimental relevante: frente a inicializadores con la misma asignacion de bits, la perplexity baja de 13,3780 a 11,2842 a 3 bits y de 9,9695 a 8,6206 a 3,5 bits. La comparacion pareada sobre los ocho fragmentos compartidos da t = -3,48 (p < 0,05) a 3,5 bits y t = -1,35 (no significativo) a 3 bits. Es decir, el beneficio del metodo solo es estadisticamente solido en la variante de 3,5 bits.

## Capacidades

Las capacidades que se pueden afirmar con evidencia son las medidas en la propia ficha, no extrapolaciones del modelo base:

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational` y `text-generation`.
- Razonamiento con modo "thinking": las evaluaciones de GSM8K se ejecutan con thinking activado y las de IFEval con thinking desactivado, lo que indica que el modelo base expone ambos modos.
- Seguimiento de instrucciones: 13/16 en IFEval con checker estricto y limite de 1.024 tokens, identico a la referencia BF16 en las tres variantes evaluadas.
- Razonamiento matematico de varios pasos: 8/8 en GSM8K (extraccion flexible, limite de 2.048 tokens) para la variante de 3,5 bits, aunque sobre una muestra de solo 8 preguntas.
- Conocimiento academico zero-shot: evaluado en MMLU-Pro con 2.000 preguntas estratificadas en 14 categorias.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Vision, audio u otras modalidades: no disponible (no se documenta).

## Casos de uso

- **Asistente local en portatil sin GPU dedicada**: con 1,542-1,799 GB de pesos, la variante de 3,5 bits puede cargarse con `llama.cpp` en CPU y 4-6 GB de RAM libre. Es util para prototipos de chat offline donde la latencia no es critica.
- **Despliegue en dispositivos de borde con memoria unificada**: placas tipo Apple Silicon, mini-PC o iGPU con memoria compartida permiten mantener el modelo residente y responder en local sin conexion a Internet ni coste por token.
- **Banco de pruebas de tecnicas de cuantizacion**: el repositorio incluye `eval/` con scorer, ids de preguntas y predicciones por pregunta, ademas de codigo de comparacion pareada. Sirve para replicar y auditar el efecto de GSQ y RCO frente a cuantizaciones uniformes del mismo presupuesto.
- **Generacion aumentada por recuperacion (RAG) sobre documentacion interna**: el modelo puede actuar como generador final en un pipeline donde el contexto lo aporta el recuperador; su tamano reducido permite ejecutarlo junto al indice vectorial en la misma maquina. Conviene verificar antes el limite de contexto real del modelo base, no documentado aqui.
- **Clasificacion y extraccion de informacion en lote**: para tareas de etiquetado, resumen o extraccion de campos con prompts cortos, el throughput en CPU es suficiente y el coste marginal es cero. La variante de 3,5 bits conserva 13/16 en IFEval, similar al BF16.
- **Evaluacion comparativa de precisiones en produccion**: desplegar la misma aplicacion con los builds de 3,0 y 3,5 bits y medir la caida de calidad en las tareas propias es una forma barata de decidir que fichero usar. Los datos de MMLU-Pro sugieren que la diferencia entre ambos builds es grande (-9,00 pp frente a -21,35 pp respecto a BF16).
- **Uso educativo y de investigacion sobre cuantizacion mixta**: el par de papers y los dos codigos de referencia permiten estudiar en un caso real como se asigna precision por tensor bajo un presupuesto global de tamano.

## Benchmarks y rendimiento

MMLU-Pro, 2.000 preguntas con semilla fija, estratificadas sobre las 14 categorias. Zero-shot, opciones con letra, log-likelihood de ` A` a ` J`, sin plantilla de chat. Azar = 11,2 %. Comparacion pareada:

| Build | Precision MMLU-Pro | SE | Diferencia vs BF16 (pareada) | Discordantes (BF16 acierta / build acierta) | p exacta |
|---|---:|---:|---:|---:|---:|
| Referencia BF16 | 40,15 % | 1,10 | - | - | - |
| GSQ-RCO 3,5 bits | 31,15 % | 1,04 | -9,00 pp | 292 / 112 | < 0,0001 |
| GSQ-RCO 3 bits | 18,80 % | 0,87 | -21,35 pp | 577 / 150 | < 0,0001 |

Desglose por categoria (n aproximado de 140 por categoria, error estandar en torno a 4 puntos):

| Categoria | n | BF16 | 3,5 bits | 3 bits |
|---|---:|---:|---:|---:|
| biology | 119 | 76,5 % | 63,9 % | 28,6 % |
| business | 131 | 26,0 % | 24,4 % | 13,0 % |
| chemistry | 188 | 31,9 % | 15,4 % | 18,6 % |
| computer science | 68 | 50,0 % | 42,6 % | 13,2 % |
| economics | 140 | 58,6 % | 47,9 % | 25,7 % |
| engineering | 161 | 36,0 % | 26,1 % | 21,1 % |
| health | 136 | 42,6 % | 33,8 % | 16,9 % |
| history | 63 | 41,3 % | 22,2 % | 17,5 % |
| law | 183 | 33,3 % | 25,1 % | 14,2 % |
| math | 225 | 29,3 % | 22,2 % | 12,9 % |
| other | 154 | 41,6 % | 28,6 % | 18,2 % |
| philosophy | 83 | 41,0 % | 33,7 % | 18,1 % |
| physics | 216 | 24,1 % | 20,8 % | 17,6 % |
| psychology | 133 | 62,4 % | 56,4 % | 30,8 % |

Diagnosticos adicionales. Perplexity sobre 4.088 tokens reservados; IFEval con 16 prompts, checker estricto, thinking desactivado y limite de 1.024 tokens; GSM8K con 8 preguntas, thinking activado, limite de 2.048 tokens y extraccion flexible:

| Variante | bpw | GB | PPL (menor es mejor) | KL aproximada | IFEval estricto | GSM8K flexible | GSM completadas correctas |
|---|---:|---:|---:|---:|---:|---:|---:|
| Referencia BF16 | 16,0112 | 8,230 | 6,4215 | 0,0 | 13/16 | 6/8 | 6/8 |
| GSQ-RCO 3 bits | 2,999966 | 1,542 | 11,2842 | 0,750897 | 13/16 | 4/8 | 3/8 |
| GSQ-RCO 3,5 bits | 3,499923 | 1,799 | 8,6206 | 0,422292 | 13/16 | 8/8 | 8/8 |

Notas metodologicas declaradas por el autor: la perplexity esta un 75,7 % por encima de BF16 a 3 bits y un 34,2 % a 3,5 bits. Truncamientos en IFEval: 3 / 4 / 1 de 16 para BF16 / 3 bits / 3,5 bits. Truncamientos en GSM8K: 1 / 4 / 0. El 4/8 de la variante de 3 bits incluye una respuesta truncada que coincidio por casualidad (3/8 completadas correctamente). Y una advertencia explicita: ocho preguntas no bastan para sostener el 8/8 de la variante de 3,5 bits. Comprobacion de runtime: el build BF16 evaluado en CPU da el mismo 40,15 % con predicciones identicas en el 99,0 % de las preguntas.

No se han publicado resultados de benchmarks del modelo base XHToken/Spark-X2.5-4B en BF16 frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- **Pesos en disco y en memoria**: 1,542 GB para el build de 3 bits y 1,799 GB para el de 3,5 bits, frente a 8,230 GB del BF16.
- **VRAM estimada para inferencia**: en torno a 2,5-4 GB considerando pesos, cache KV y overhead del runtime; la cifra exacta depende del contexto configurado y de si se usa offload parcial. El limite de contexto del modelo no esta documentado, por lo que no se puede calcular la cache KV maxima.
- **GPU consumer**: cabe con holgura en cualquier GPU de 6-8 GB o superior (RTX 3060, RTX 4060, RTX 2070, GTX 1660 de 6 GB). Se puede reservar VRAM adicional para offload de capas y contextos largos.
- **CPU sola**: viable para ambas variantes; con 4-6 GB de RAM libre el modelo se carga completo. El autor verifico el build BF16 en CPU con resultados identicos al runtime CUDA.
- **GPU de datacenter**: la evaluacion de referencia se ejecuto en una NVIDIA H200 con CUDA, un entorno muy sobredimensionado para un modelo de 4B; se uso como plataforma de medida, no como requisito.
- **Opciones de despliegue**: `llama.cpp` (build `de25343` o posterior con soporte para Spark-X2.5, imprescindible para cargar estos GGUF). Al ser GGUF estandar, deberia poder usarse en servidores `llama.cpp` compatibles y en frontends que envuelvan esa libreria; el soporte especifico en vLLM, TGI u Ollama no esta confirmado en la informacion disponible.
- **Latencia y throughput**: no disponibles. La ficha no reporta tokens por segundo ni latencia para ninguna variante.

## Comparativa con modelos similares

No se dispone de datos de otras cuantizaciones del mismo modelo base (por ejemplo, quantizaciones uniformes tipo Q4_K_M o Q3_K_S de `llama.cpp`) en la informacion proporcionada, por lo que no se puede comparar contra alternativas equivalentes. La comparacion posible es interna, entre los propios builds y la referencia BF16:

| Variante | bpw | Tamano | MMLU-Pro | PPL | IFEval estricto | GSM8K flexible |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (referencia) | 16,0112 | 8,230 GB | 40,15 % | 6,4215 | 13/16 | 6/8 |
| GSQ-RCO 3,5 bits | 3,499923 | 1,799 GB | 31,15 % | 8,6206 | 13/16 | 8/8 |
| GSQ-RCO 3 bits | 2,999966 | 1,542 GB | 18,80 % | 11,2842 | 13/16 | 4/8 |

Como referencia externa, el autor menciona **ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF**, una cuantizacion con los mismos metodos sobre un modelo mucho mayor (27B) para la que los autores del paper reportan resultados "task-lossless". El autor indica explicitamente que esta reproduccion sobre Spark-X2.5-4B no alcanza ese nivel. No se proporcionan cifras de ese modelo en la informacion disponible.

## Limitaciones y advertencias

- **Perdida de calidad severa a 3 bits**: MMLU-Pro cae a 18,80 %, a 6,8 puntos porcentuales del azar (11,2 %), y la diferencia frente a BF16 es de -21,35 pp con p < 0,0001. La perplexity sube un 75,7 %. No es un build recomendable para tareas de conocimiento o razonamiento.
- **Degradacion desigual por categoria**: con 3 bits, areas como computer science (50,0 % a 13,2 %) o biology (76,5 % a 28,6 %) sufren caidas dramaticas; otras como physics (24,1 % a 17,6 %) apenas cambian porque el modelo base ya partia de un rendimiento bajo.
- **Evidencia estadistica limitada en varios tests**: GSM8K usa solo 8 preguntas y el autor advierte que no permiten sostener el 8/8 del build de 3,5 bits. IFEval usa 16 prompts, con 1-4 truncamientos por variante. La mejora frente al inicializador solo es significativa a 3,5 bits (t = -1,35, no significativo a 3 bits).
- **Resultados del 3,5 bits potencialmente inflados por truncamiento**: el build de 3,5 bits no trunco ninguna respuesta de GSM8K, mientras que BF16 trunco una y el de 3 bits cuatro, lo que favorece artificialmente su comparacion en ese test.
- **Entorno de medida sobredimensionado**: todas las cifras se obtuvieron en una H200 con un build concreto de `llama.cpp` (`de25343`). Otros backends o versiones pueden dar resultados distintos.
- **Sin respaldo de los autores del metodo**: es una reproduccion comunitaria independiente, no una publicacion de IST-DASLab ni del autor del modelo base.
- **Datos del modelo base no documentados**: se desconoce la arquitectura, la longitud de contexto, los idiomas soportados, la composicion del dataset de entrenamiento y si hubo RLHF o DPO. Esto impide anticipar el comportamiento multilingue o en contextos largos.
- **Riesgo de alucinacion**: no cuantificado en la ficha. Con la caida de MMLU-Pro observada, el riesgo de respuestas plausibles pero incorrectas en tareas factuales es previsiblemente mayor que en BF16, especialmente a 3 bits.
- **Sesgos**: no hay evaluacion de sesgos ni de seguridad en la informacion disponible.
- **Licencia**: apache-2.0. Permite uso comercial, pero conviene verificar la licencia del modelo base XHToken/Spark-X2.5-4B por si impone condiciones adicionales.
- **Adopcion nula**: cero descargas y cero "likes" en el momento de la consulta; no hay validacion por parte de terceros.
- **Soporte de runtime fragil**: requiere una build de `llama.cpp` con soporte especifico para Spark-X2.5; no esta confirmado el funcionamiento en vLLM, TGI u Ollama.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pfeifferj/Spark-X2.5-4B-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Paper de GSQ (Gumbel-Softmax Quantization): https://arxiv.org/abs/2604.18556
- Paper de RCO (Riemannian Constrained Optimization): https://arxiv.org/abs/2605.00649
- Codigo de GSQ: https://github.com/IST-DASLab/GSQ
- Codigo de RCO: https://github.com/IST-DASLab/RCO
- Laboratorio DASLab (IST Austria): https://github.com/IST-DASLab
- Cuantizacion de referencia sobre un modelo mayor: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
