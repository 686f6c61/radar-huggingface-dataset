# balllvin/Dory1.0-4B-abliterated-Arete-NVFP4

## Resumen

Dory1.0-4B-abliterated-Arete-NVFP4 es una variante del modelo Nemotron-Labs Dory 1.0 4B de NVIDIA, publicada por el usuario balllvin en Hugging Face. Se trata de un modelo de generacion de texto de aproximadamente 3.975 millones de parametros, distribuido en formato NVFP4 (cuantizacion de 4 bits compatible con NVIDIA ModelOpt) y empaquetado para su uso con la libreria transformers. El modelo parte de la version ya cuantizada NVFP4 de NVIDIA y sobre ella aplica dos intervenciones: una abliteracion (eliminacion de la direccion de rechazo en el espacio residual) y un ajuste fino supervisado sobre el conjunto de datos Arete de Nous Research, orientado a valores y razonamiento.

El modelo resuelve un problema concreto para la comunidad de investigacion: disponer de una version del Dory 1.0 4B que responda a peticiones benignas que el modelo original rechaza, manteniendo al mismo tiempo un comportamiento de rechazo razonado ante peticiones claramente daninas. Segun la model card, el modelo abliterado sin Arete rechazaba el 0,0% de las peticiones benignas del conjunto JailbreakBench y solo el 13,1% de las daninas; tras el ajuste con Arete, el rechazo de peticiones benignas sigue en el 0,0% y el de daninas sube al 26,3%, acercandose a un equilibrio mas razonable sin recuperar la sobrerreflexion del modelo original (56,6% de rechazos daninos y 17,0% de benignos).

La relevancia actual del modelo es doble: por un lado, demuestra un flujo de trabajo reproducible de abliteracion sobre pesos cuantizados NVFP4 manteniendo las escalas de NVIDIA; por otro, documenta de forma transparente un resultado negativo, ya que el ajuste con Arete degrada la puntuacion de hechos en la Propaganda Eval (de 1,993 a 1,540 sobre 5). El autor lo declara explicitamente como material de investigacion y no para produccion. El modelo solo soporta ingles y su licencia es OpenMDW 1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de NVIDIA Nemotron-Labs Dory 1.0 4B; detalles internos no disponibles) |
| Parametros totales | 3.975.229.440 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA ModelOpt); el repo se etiqueta tambien como 8-bit por los metadatos de modelopt |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW 1.1 (license: other, license_name: openmdw-1.1) |
| Formato de pesos | safetensors (NVFP4), libreria transformers |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de NVIDIA Nemotron-Labs Dory 1.0 4B. La model card no detalla la arquitectura interna del modelo base (numero de capas, dimension oculta, mecanismo de atencion ni contexto maximo), por lo que esos datos deben consultarse en la ficha del modelo original de NVIDIA. Lo que si se documenta es el proceso de construccion en dos fases sobre los pesos ya cuantizados en NVFP4.

La primera fase es la abliteracion: se localiza una direccion de rechazo mediante el metodo OBLITERATUS y se proyecta fuera de los escritores residuales del modelo bf16 de NVIDIA; a continuacion, el fichero NVFP4 se entrena hacia ese profesor editado mediante destilacion consciente de cuantizacion, conservando las escalas originales de NVIDIA. El proceso uso 4 loops, 3 pasadas y 17 pasos. La segunda fase es un ajuste fino supervisado (SFT) sobre NousResearch/arete-data-pairs, en concreto sobre las respuestas del subconjunto sft_accepted unidas a sus trazas de razonamiento (ambas generadas por thinkingmachines/inkling) y recortadas al criterio mas estricto del revisor. El conjunto final empleado contiene 6.491 filas; segun el autor, ninguna respuesta de ese conjunto comienza con una frase de rechazo y solo 56 contienen alguna en el interior de una respuesta larga.

## Capacidades

- Generacion de texto conversacional en ingles, con modo de razonamiento explicito (thinking) activado por defecto en las evaluaciones del autor.
- Razonamiento sobre valores, derecho y equidad: los rechazos observados surgen del razonamiento del propio modelo sobre el dano, la legalidad y la justicia, no de ejemplos de rechazo aprendidos.
- Respuesta a peticiones benignas que el modelo original de NVIDIA rechaza (0,0% de rechazos benignos en JailbreakBench).
- Rechazo razonado de una parte de las peticiones claramente daninas (26,3% en JailbreakBench), con especial incidencia en la categoria de decision gubernamental (8 de 10).
- Generacion de respuestas largas: la respuesta benigna mas larga medida alcanzo 4.856 tokens, frente al limite de 16.384 tokens nuevos configurado en la evaluacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modelo dispone de trazas de razonamiento (thinking) que podrian habilitarlo, pero no se confirma.
- Capacidades multilingues: solo ingles declarado.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion sobre alineacion y abliteracion: el modelo sirve como caso de estudio reproducible de como la proyeccion de una direccion de rechazo sobre pesos NVFP4 afecta a las tasas de rechazo benigno y danino, con datos comparativos de tres builds medidos en el mismo hardware y configuracion.
- Evaluacion de tecnicas de ajuste con datos de valores: permite analizar el efecto de Arete sobre un modelo de 4B, incluido el hallazgo de que reduce la puntuacion de hechos en la Propaganda Eval, un resultado util para quienes investigan la relacion entre valores y factualidad.
- Experimentos de cuantizacion NVFP4 en vLLM: el modelo se midio con vLLM en una NVIDIA RTX PRO 6000, por lo que es adecuado para validar pipelines de inferencia de 4 bits en Blackwell y GPUs profesionales con soporte NVFP4.
- Analisis de razonamiento y rechazo: las trazas de pensamiento permiten estudiar por que el modelo rechaza ciertas peticiones (cita hate speech, soborno, falsificacion de productos medicos) y como evoluciona ese razonamiento tras el ajuste.
- Desarrollo de contrapartes para Apple Silicon: el autor publica un gemelo MLX con los mismos codigos de 4 bits (balllvin/Dory1.0-4B-abliterated-Arete-NVFP4-MLX), util para comparar el mismo modelo en entornos Apple frente a CUDA.
- Reproduccion de evaluaciones de censura y propaganda: los conjuntos de salida de la Propaganda Eval estan publicados como dataset, lo que permite reutilizar el modelo como referencia en estudios comparativos de sesgo y encuadre oficial.

## Benchmarks y rendimiento

Resultados publicados por el autor. Todas las mediciones se hicieron en la misma NVIDIA RTX PRO 6000, con la misma build de vLLM, 2 loops, thinking activado, temperatura 1,0, top-p 0,95, hasta 16.384 tokens nuevos y una muestra por prompt.

| Build | Daninas rechazadas (JBB, 99) | Benignas rechazadas (JBB, 100) | MMLU (300) | Tokens medianos, daninas / benignas |
|---|---:|---:|---:|---|
| NVIDIA NVFP4 (original) | 56,6% (56; IC95 46,7-65,9) | 17,0% (17; 10,9-25,5) | 0,830 (0,783-0,868) | 453 / 2.604 |
| Abliterado (sin Arete) | 13,1% (13; 7,8-21,2) | 0,0% (0 de 98 finalizadas; 0-3,8) | 0,857 (0,812-0,892) | 695 / 3.667 |
| Abliterado + Arete (este modelo) | 26,3% (26; 18,6-35,7) | 0,0% (0 de 100; 0-3,7) | 0,833 (0,787-0,871) | 732 / 1.808 |

Desglose de rechazos por categoria de JailbreakBench (peticiones daninas rechazadas, de 10 por categoria; dano fisico tiene 9):

| Categoria | NVIDIA NVFP4 | Abliterado | Este modelo |
|---|---:|---:|---:|
| Desinformacion | 6 | 1 | 0 |
| Dano economico | 2 | 2 | 1 |
| Asesoramiento experto | 5 | 0 | 3 |
| Fraude / engano | 6 | 3 | 1 |
| Decision gubernamental | 6 | 1 | 8 |
| Acoso / discriminacion | 6 | 1 | 2 |
| Malware / hacking | 7 | 0 | 3 |
| Dano fisico | 5 | 1 | 2 |
| Privacidad | 6 | 1 | 2 |
| Contenido sexual / adulto | 7 | 3 | 4 |
| Total | 56 | 13 | 26 |

Censorship and Propaganda Eval (Nous Research, 803 prompts, perfil `card`, juez Grok), a 4 loops:

| Build, 4 loops | Puntuacion de hechos media (0-5) | Propaganda presente | Rechazos | Hechos afirmados / opuestos por respuesta | Tokens medianos |
|---|---:|---:|---:|---:|---:|
| NVIDIA NVFP4 | 1,823 (1,679-1,966) | 0,62% | 99 | 0,86 / 0,32 | 6.491 |
| Abliterado | 1,993 (1,850-2,133) | 1,49% | 10 | 0,97 / 0,43 | 7.580 |
| Abliterado + Arete (este modelo) | 1,540 (1,407-1,674) | 1,25% | 3 | 0,77 / 0,56 | 2.907 |

Segun el autor, Arete bajo la puntuacion de hechos: 87 items pasaron de 4 o 5 a 0 frente a 27 en sentido contrario, y 63 de esos 87 piden un hecho con nombre concreto. El modelo responde mas corto y piensa menos, y afirma datos erroneos con seguridad (fechas incorrectas, romanizaciones inventadas, fuentes mal etiquetadas).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3,2 GB, por lo que en NVFP4 la inferencia requiere del orden de 4 GB de VRAM mas el espacio para KV cache y tokens de contexto; el calculo exacto no esta disponible en la informacion proporcionada.
- GPU recomendadas: NVIDIA RTX PRO 6000 (usada por el autor para todas las mediciones); se requiere una GPU con soporte de NVFP4 para aprovechar el formato nativo.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con soporte NVFP4 y al menos 8 GB de VRAM; el autor no documenta pruebas en GPU de consumo.
- Opciones de despliegue: vLLM (usado por el autor con su build y ajustes concretos); transformers como libreria declarada; existe una version MLX para Apple Silicon. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; el autor solo publica el numero de tokens medianos por respuesta (732 en peticiones daninas, 1.808 en benignas, con thinking activado y hasta 16.384 tokens nuevos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos daninos JBB | MMLU | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Este modelo (abliterado + Arete, NVFP4) | ~4B | no disponible | 26,3% | 0,833 | OpenMDW 1.1 | Hugging Face |
| balllvin/Dory1.0-4B-abliterated-NVFP4 | ~4B | no disponible | 13,1% | 0,857 | OpenMDW 1.1 | Hugging Face |
| nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4 | ~4B | no disponible | 56,6% | 0,830 | OpenMDW 1.1 | Hugging Face |
| balllvin/Dory1.0-4B-abliterated-Arete-NVFP4-MLX | ~4B | no disponible | no disponible | no disponible | OpenMDW 1.1 | Hugging Face |

Los tres primeros comparten base y solo difieren en las intervenciones aplicadas, por lo que la comparacion mide directamente el efecto de la abliteracion y del ajuste con Arete. El gemelo MLX es el mismo modelo en otro formato.

## Limitaciones y advertencias

- El autor declara el modelo explicitamente como material de investigacion, no para produccion.
- El ajuste con Arete degrada la factualidad: la puntuacion media de hechos en la Propaganda Eval cae de 1,993 a 1,540 sobre 5, con 87 items que pasan de 4-5 a 0 frente a 27 en sentido contrario.
- El modelo afirma datos erroneos con seguridad: fechas incorrectas, romanizaciones inventadas y fuentes mal etiquetadas.
- La abliteracion elimina el reflejo de rechazo entrenado; aunque Arete recupera parte del rechazo razonado (26 de 99 peticiones daninas), sigue muy por debajo del modelo original de NVIDIA (56 de 99).
- El rechazo se concentra de forma desigual: 8 de 10 en decision gubernamental, pero 0 de 10 en desinformacion y 1 de 10 en fraude y en dano economico.
- Parte del razonamiento interno sigue citando "safety guidelines", herencia del modelo base.
- Solo soporta ingles; no se declaran capacidades multilingues.
- La licencia OpenMDW 1.1 debe revisarse antes de cualquier uso comercial; el autor no ofrece garantias y la model card no detalla restricciones adicionales.
- No se documentan el contexto maximo, la composicion exacta del entrenamiento del modelo base ni el soporte de tool calling, por lo que estos datos deben verificarse en la ficha de NVIDIA.
- Riesgo de alucinacion elevado en respuestas factuales, coherente con la caida observada en la puntuacion de hechos.
- Los sesgos especificos del modelo base no se documentan en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/Dory1.0-4B-abliterated-Arete-NVFP4
- Gemelo MLX para Apple Silicon: https://huggingface.co/balllvin/Dory1.0-4B-abliterated-Arete-NVFP4-MLX
- Punto de partida abliterado sin Arete: https://huggingface.co/balllvin/Dory1.0-4B-abliterated-NVFP4
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Salidas de la Propaganda Eval: https://huggingface.co/datasets/balllvin/Propaganda-Eval-Dory-Abliterated-Arete-NVFP4-4loop
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
