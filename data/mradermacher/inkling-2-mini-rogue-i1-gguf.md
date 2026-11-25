# mradermacher/Inkling-2-Mini-ROGUE-i1-GGUF

## Resumen

Inkling-2-Mini-ROGUE-i1-GGUF es una coleccion de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo base carsenk/Inkling-2-Mini-ROGUE. El autor de las cuantizaciones es un conocido publicador de versiones GGUF de modelos de terceros, y en este caso aplica cuantizacion con imatrix (matriz de importancia) para preservar mejor la calidad en niveles de compresion agresivos.

El modelo base es de muy pequeno tamano: 22.657.976 parametros totales (aproximadamente 22,7 millones), lo que lo situa en la categoria de modelos mini, muy por debajo de los modelos de 1B-7B habituales. El repositorio de cuantizaciones ocupa solo 0,1 GB, lo que confirma que se trata de un modelo extremadamente ligero, probablemente disenado para tareas acotadas o para experimentacion.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: no hay pipeline declarado, no consta licencia, no se indican idiomas soportados ni se han publicado resultados de benchmarks. Aun asi, el conjunto de cuantizaciones disponibles (desde IQ1_S hasta Q6_K) permite desplegar el modelo en entornos con recursos muy restringidos, lo que puede resultar util para pruebas de concepto o para integrarlo en aplicaciones embebidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 22.657.976 (aprox. 22,7 M) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_NL (small), IQ4_XS, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye presumiblemente en safetensors, aunque no se detalla en la informacion disponible |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base (transformer, MoE, SSM u otra), ni sobre el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card del repositorio de cuantizaciones no incluye estos datos; unicamente documenta el proceso de cuantizacion mediante metadatos internos (version de quantize, tipo de conversion hf, uso de imatrix ponderada).

El unico detalle tecnico relevante es que las cuantizaciones se generaron con imatrix (weighted/imatrix quants), una tecnica que calcula una matriz de importancia a partir de datos de calibracion para minimizar la perdida de calidad en cuantizaciones de baja precision. Esto es especialmente util en los niveles IQ1 e IQ2, donde la compresion es mas agresiva.

## Capacidades

- Generacion de texto: capacidad presumible por tratarse de un modelo de lenguaje, aunque no se documenta explicitamente.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

Dado el tamano de 22,7 M de parametros, es razonable esperar capacidades muy limitadas en comparacion con modelos de miles de millones de parametros, pero esta afirmacion es una inferencia general y no un dato confirmado en la informacion proporcionada.

## Casos de uso

- Pruebas de concepto en entornos con recursos minimos: el modelo, al ocupar decimas de GB en cuantizaciones bajas, puede ejecutarse en dispositivos con poca memoria para validar pipelines de inferencia antes de escalar a modelos mayores.
- Aplicaciones embebidas o de borde: con cuantizaciones IQ1/IQ2, el modelo podria integrarse en sistemas con restricciones severas de RAM, aunque la calidad resultante no esta documentada.
- Experimentacion con tecnicas de cuantizacion: el repositorio ofrece una amplia gama de niveles (de IQ1_S a Q6_K), lo que permite estudiar el impacto de la compresion en la calidad de salida de un mismo modelo base.
- Educacion y divulgacion: util para demostrar el flujo completo de publicacion de cuantizaciones GGUF y el uso de imatrix en modelos pequenos.
- Generacion de texto acotada en prototipos: si el modelo base funciona para tareas simples de continuacion de texto, las cuantizaciones Q4_K_M o Q5_K_M podrian servir en demos locales con llama.cpp.
- Evaluacion comparativa de formatos: permite comparar el rendimiento de distintas cuantizaciones GGUF sobre el mismo modelo base en tareas de generacion corta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 22,7 M de parametros, las cuantizaciones Q4_K_M o Q5_K_M ocuparian del orden de decenas de MB, por lo que cabria en practicamente cualquier GPU consumer y en CPU.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU con al menos 1 GB de VRAM seria suficiente, incluidas GTX 1050, RTX 3050 o integradas con soporte adecuado.
- Cabe en consumer GPU: si, con amplio margen, en cualquier GPU moderna e incluso en muchas integradas.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; vLLM y TGI no se confirman para este formato y tamano.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (modelos de ~22 M de parametros con cuantizaciones GGUF publicadas por el mismo autor).

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base (carsenk/Inkling-2-Mini-ROGUE) antes de cualquier despliegue en produccion.
- Falta de documentacion: no hay informacion sobre arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar su idoneidad para tareas concretas.
- Riesgo de alucinacion: no evaluado; en modelos de este tamano el riesgo suele ser alto, pero no hay datos que lo confirmen.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles.
- Calidad en cuantizaciones extremas: los niveles IQ1 e IQ2 pueden degradar significativamente la calidad; no hay evaluaciones publicadas que cuantifiquen esta perdida.
- Advertencia de procedencia: se trata de una cuantizacion de terceros; la responsabilidad sobre el modelo original recae en su autor, no en mradermacher.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Inkling-2-Mini-ROGUE-i1-GGUF
- Modelo base: https://huggingface.co/carsenk/Inkling-2-Mini-ROGUE
