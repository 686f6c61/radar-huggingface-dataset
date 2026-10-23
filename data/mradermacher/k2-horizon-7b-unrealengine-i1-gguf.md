# mradermacher/K2-Horizon-7B-UnrealEngine-i1-GGUF

## Resumen

K2-Horizon-7B-UnrealEngine-i1-GGUF es la versión cuantizada en formato GGUF del modelo qwfasf/K2-Horizon-7B-UnrealEngine, publicada por el cuantizador mradermacher. Se trata de una variante orientada al desarrollo con Unreal Engine: las etiquetas del repositorio apuntan a Blueprints, C++ y código de proyecto, y la model card la declara como conversacional y únicamente en inglés.

El repositorio base declara 8.999.178.240 parámetros en safetensors (unos 9.000 millones, pese al sufijo "7B" del nombre) y emplea una arquitectura transformer marcada como `custom-code`. Esta ficha no aporta detalles de entrenamiento, longitud de contexto ni resultados de benchmarks; su valor práctico está en ofrecer los pesos en cuantizaciones imatrix "i1" desde IQ1_S (2,6 GB) hasta Q6_K (7,5 GB), lo que permite ejecutar el modelo en GPU de consumo.

Es relevante ahora porque los modelos de dominio (en este caso, Unreal Engine) empiezan a distribuirse en formatos ligeros listos para llama.cpp u Ollama, y este repositorio cubre ese hueco con licencia Apache 2.0, cuantizaciones estáticas en un repositorio hermano y variantes imatrix generadas con matriz de importancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `transformers`; variante concreta no detallada, etiqueta `custom-code`) |
| Parametros totales | 8.999.178.240 (aprox. 9.000 millones, segun safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix `i1`: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; cuantizaciones estaticas adicionales en repositorio hermano (Q2_K a Q6_K, IQ1_S a IQ4_XS) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo base en safetensors/bfloat16) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `transformers` y del campo `custom-code`, que sugiere una implementacion con codigo personalizado en el repositorio original. El modelo base qwfasf/K2-Horizon-7B-UnrealEngine se distribuye en bfloat16 y safetensors, y esta version es una conversion a GGUF con cuantizacion asistida por matriz de importancia (imatrix "i1"), un procedimiento que calibra los pesos cuantizados con datos de activacion para reducir la perdida de calidad en bits bajos.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado. Tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa u otras). El dato objetivo disponible es el recuento de parametros del safetensors del modelo base: 8.999.178.240, ligeramente por encima de los 9.000 millones.

## Capacidades

- Generacion de texto conversacional en ingles, con estilo tecnico segun las etiquetas del repositorio.
- Asistencia en C++ orientado a Unreal Engine (etiqueta `cpp`), presumiblemente sobre el framework de gameplay del motor.
- Soporte de logica de Blueprints de Unreal Engine (etiqueta `blueprint`).
- Generacion de codigo de proyecto y `custom-code`, segun la etiqueta homonima.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles declarado; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Asistente de Blueprints: el modelo puede explicar y proponer logica de nodos para Blueprints de Unreal Engine, un escenario donde la jerga especifica del motor y las etiquetas del repositorio encajan directamente.
- Generacion de C++ para Unreal: util para producir esquemas de clase con macros UCLASS/UPROPERTY/UFUNCTION y esqueletos de clases de gameplay, dado el enfoque declarado en C++.
- Explicacion de APIs del motor: consultas sobre clases, modulos y subsistemas de Unreal Engine en un formato conversacional, adecuado para resolver dudas durante el desarrollo.
- Prototipado local en estudios sin conexion: al ser GGUF y Apache 2.0, puede ejecutarse en estaciones de trabajo sin enviar codigo propietario a servicios externos, algo relevante en estudios con politicas estrictas de confidencialidad.
- Revision de codigo y plugins: apoyo en la lectura de fragmentos de C++ de mods o plugins de Unreal, con explicaciones en ingles sobre patrones y posibles errores.
- Editor scripting y automatizacion: generacion de fragmentos para herramientas internas del editor de Unreal, aprovechando el conocimiento del dominio del modelo.
- Formacion de programadores junior: respuestas guiadas sobre conceptos de Unreal Engine en un entorno local y de bajo coste, limitado al idioma ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones a partir del tamano de los ficheros GGUF publicados (pesos + overhead aproximado de contexto y cache KV):

| Cuantizacion | Tamano en disco | VRAM estimada |
|---|---|---|
| i1-IQ1_S | 2,6 GB | ~4 GB |
| i1-IQ2_M | 3,6 GB | ~5 GB |
| i1-Q3_K_M | 4,7 GB | ~6,5 GB |
| i1-Q4_K_M | 5,7 GB | ~7,5 GB |
| i1-Q5_K_M | 6,6 GB | ~8,5 GB |
| i1-Q6_K | 7,5 GB | ~9,5 GB |
| bfloat16 (base) | ~18 GB | ~20-22 GB |

- GPU de consumo: RTX 3060 12 GB y RTX 4060 Ti 16 GB admiten de Q4_K_M a Q5_K_M con contexto moderado; RTX 4070/4080 (12-16 GB) llegan a Q5_K_M o Q6_K; RTX 4090 (24 GB) permite Q6_K e incluso bfloat16 parcial.
- GPU de datacenter: A100 40/80 GB y H100 admiten bfloat16 sin problema y dejan margen para lotes mayores.
- Solo CPU: las variantes IQ2/IQ3 son viables con llama.cpp, con latencia alta; no se dispone de cifras de throughput.
- Despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y vLLM con soporte GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No hay benchmarks publicados de este modelo, por lo que la comparacion es estructural (parametros, contexto y licencia) y no de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| K2-Horizon-7B-UnrealEngine (este) | ~9.000 M | no disponible | Apache 2.0 | Unreal Engine (Blueprints, C++) |
| Qwen2.5-Coder-7B-Instruct | ~7.600 M | 32.768 (131.072 con YaRN) | Apache 2.0 | Codigo general |
| CodeLlama-7B-Instruct | ~6.700 M | 16.384 | Licencia Llama 2 | Codigo general |
| DeepSeek-Coder-6.7B-Instruct | ~6.700 M | 16.384 | Licencia DeepSeek | Codigo general |

No se dispone de comparaciones de rendimiento verificables entre este modelo y las alternativas; la ventaja declarada es la especializacion en Unreal Engine, no un mejor resultado en benchmarks generales.

## Limitaciones y advertencias

- Solo ingles declarado: no hay soporte documentado de castellano ni de otros idiomas.
- Longitud de contexto desconocida: no se puede planificar el uso en conversaciones o ficheros largos sin verificar el limite real.
- Riesgo de alucinacion en APIs de Unreal Engine: al no haber benchmarks, no hay evidencia de fidelidad en nombres de clases, funciones o firmas del motor.
- Sin resultados de benchmarks publicados: no es posible comparar su calidad objetiva frente a alternativas.
- Discrepancia de nomenclatura: el nombre indica "7B" pero el safetensors declara unos 9.000 millones de parametros; conviene dimensionar el hardware con el dato real.
- Procedencia del modelo base poco documentada: se desconoce el dataset y el proceso de ajuste, lo que dificulta evaluar sesgos.
- Degradacion en cuantizaciones bajas: la propia model card advierte de calidad muy baja en IQ1_S/IQ1_M y Q2_K_S; para produccion se recomienda Q4_K_M o superior.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan las obligaciones de atribucion mas alla de las estandar de la licencia.
- Sin datos de latencia ni throughput: no se puede garantizar un SLA de produccion sin medir en el hardware objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/K2-Horizon-7B-UnrealEngine-i1-GGUF
- Modelo base: https://huggingface.co/qwfasf/K2-Horizon-7B-UnrealEngine
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/K2-Horizon-7B-UnrealEngine-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#K2-Horizon-7B-UnrealEngine-i1-GGUF
- Perfil del autor: https://huggingface.co/mradermacher
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
