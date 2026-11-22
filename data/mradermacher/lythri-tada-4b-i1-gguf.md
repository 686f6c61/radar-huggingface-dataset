# mradermacher/Lythri-Tada-4B-i1-GGUF

## Resumen

Lythri-Tada-4B-i1-GGUF es una colección de cuantizaciones GGUF, generadas por mradermacher, del modelo Lythri/Lythri-Tada-4B. Se trata de un modelo de 4.628.569.635 parámetros (aproximadamente 4,6 mil millones), orientado a soporte emocional y conversación de acompañamiento, según las etiquetas declaradas por el autor (emotional-support, companion, on-device, conversational, emotion). El repositorio ofrece variantes con cuantización ponderada mediante imatrix, pensadas para ejecución local y en dispositivos con recursos limitados.

El modelo base está publicado bajo licencia Apache 2.0 y declara únicamente el idioma inglés. La relevancia de esta ficha radica en que permite desplegar un modelo conversacional de tamaño medio en hardware de consumo mediante llama.cpp u otros runners compatibles con GGUF, con un abanico amplio de niveles de cuantización que van desde 2,4 GB hasta 3,9 GB por fichero.

No se dispone de información publicada sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada. Esta ficha se limita a los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no publicados) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; ademas de un fichero imatrix para generar cuantizaciones propias y cuantizaciones estaticas en el repo hermano Lythri-Tada-4B-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base se distribuye en formato transformers |

## Arquitectura y entrenamiento

No se ha publicado en la informacion disponible la arquitectura interna del modelo base Lythri/Lythri-Tada-4B, ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Las etiquetas del repositorio indican que el modelo esta orientado a conversacion de acompanamiento emocional y a despliegue on-device, pero no se detalla la metodologia de entrenamiento.

Lo que si es verificable es el proceso de cuantizacion aplicado por mradermacher: se trata de cuantizaciones i1 (importancia ponderada) generadas a partir de un fichero imatrix, lo que segun la propia model card mejora la calidad respecto a cuantizaciones estaticas de tamano equivalente. El repositorio incluye el fichero imatrix (0,1 GB) por si el usuario quiere generar sus propias cuantizaciones. No consta ninguna innovacion arquitectonica adicional (decodificacion especulativa, atencion lineal, SSM, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis declarado en soporte emocional y acompanamiento (emotional-support, companion).
- Conversacion multi-turno de caracter empatico, segun las etiquetas del autor.
- Despliegue on-device: las cuantizaciones de menor tamano (2,4-3,9 GB) permiten ejecucion local en hardware modesto.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integracion con infraestructura de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles; no se confirman otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional de acompanamiento en local: el modelo puede gestionar dialogos de apoyo emocional en ingles ejecutandose en un portatil o mini-PC gracias a las cuantizaciones de 3,5 GB (i1-Q4_K_M), sin depender de la nube ni enviar datos personales a terceros.
- Prototipado de chatbots de bienestar: util para validar flujos de conversacion empatica antes de invertir en modelos mayores, dado su tamano reducido y su licencia Apache 2.0 permisiva.
- Aplicaciones de escritorio o moviles con inferencia embebida: la variante i1-IQ2_M (2,7 GB) o i1-Q3_K_M (3,3 GB) permite integrar el modelo en entornos con VRAM o RAM limitadas mediante llama.cpp.
- Investigacion sobre modelos pequenos de soporte emocional: sirve como linea base para comparar tecnicas de cuantizacion (i1 frente a estaticas) en tareas conversacionales, usando el fichero imatrix incluido para reproducir el proceso.
- Generacion de respuestas de acompanamiento en entornos sin conectividad: al ser un modelo local, encaja en escenarios de asistencia offline donde la latencia de red o la privacidad son criticas.
- Evaluacion de calidad de cuantizaciones: el abanico de 24 variantes permite medir el impacto de la cuantizacion en la coherencia conversacional, comparando IQ1/IQ2 con Q4/Q5/Q6 sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 2,4 GB (i1-IQ1_S) y 3,9 GB (i1-Q6_K) solo para los pesos; hay que anadir el espacio para el contexto KV, que depende de la longitud de contexto (no disponible).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM puede alojar las cuantizaciones Q4/Q5; una RTX 3060 de 12 GB o superior permite ejecutar la variante Q6_K con contexto amplio. En A100/H100 el modelo ocupa una fraccion minima de memoria, por lo que su uso principal es local, no en servidor.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) usando las variantes IQ2 a Q4; las variantes Q5/Q6 requieren 6 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y runners compatibles con GGUF; la etiqueta endpoints_compatible sugiere tambien servidores de inferencia con soporte GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lythri-Tada-4B-i1-GGUF | 4,63 B | no disponible | Apache 2.0 | GGUF (i1) | Cuantizaciones ponderadas con imatrix, enfoque en soporte emocional |
| Modelos comparables de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de alternativas equivalentes en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoria. Se recomienda consultar el modelo base Lythri/Lythri-Tada-4B para obtener datos de referencia adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo entrenado en ingles, es probable que refleje sesgos culturales del corpus de entrenamiento, pero no se aportan datos concretos.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones publicadas que cuantifiquen la tasa de alucinacion en este modelo.
- Limitaciones de contexto e idioma: solo se declara ingles; la longitud de contexto no esta documentada, lo que impide garantizar conversaciones de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales, no detallados aqui.
- Caveats para produccion: las cuantizaciones IQ1/IQ2 degradan notablemente la calidad (la propia model card las describe como "for the desperate" o "mostly desperate"); para produccion se recomienda i1-Q4_K_M o superior. No hay garantias de calidad conversacional ni de seguridad en el dominio del soporte emocional, por lo que no deberia usarse como sustituto de atencion profesional.
- El repositorio tiene 0 likes y 8152 descargas, lo que sugiere poca validacion por parte de la comunidad; conviene evaluar el modelo en el caso de uso concreto antes de adoptarlo.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/mradermacher/Lythri-Tada-4B-i1-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-Tada-4B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Lythri-Tada-4B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Lythri-Tada-4B-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- DOI asociado: doi:10.5281/zenodo.23179311
