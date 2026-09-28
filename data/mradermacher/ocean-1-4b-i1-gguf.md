# mradermacher/Ocean-1-4B-i1-GGUF

## Resumen

mradermacher/Ocean-1-4B-i1-GGUF es una version cuantizada en formato GGUF del modelo OceanLabs/Ocean-1-4B, publicada por el usuario mradermacher, especializado en la generacion de cuantizaciones con matriz de importancia (imatrix). El modelo base es un LLM de tipo agente (etiquetas "llm", "ocean1" y "agent") con aproximadamente 4.000 millones de parametros segun su denominacion, orientado a tareas de razonamiento y uso de herramientas.

El repositorio no contiene un modelo nuevo, sino una coleccion de pesos GGUF derivados del base mediante cuantizacion ponderada con imatrix, una tecnica que calibra la perdida de precision por capa usando un dataset de calibracion y que suele ofrecer mejor relacion calidad/tamano que la cuantizacion estatica equivalente. Se ofrecen 24 variantes de cuantizacion, desde IQ1_S hasta Q6_K, ademas de un fichero imatrix propio para generar cuantizaciones personalizadas.

La relevancia de esta ficha es practica: permite ejecutar un modelo de familia agentica de 4B en hardware de consumo mediante llama.cpp u Ollama, con licencia Apache 2.0 y sin restricciones de uso comercial. No se dispone de informacion publica sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en la informacion proporcionada) |
| Parametros totales | 884.952 segun metadatos de safetensors del repositorio; la denominacion del modelo indica ~4B, por lo que el dato de metadatos resulta inconsistente y no se puede confirmar |
| Parametros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small-IQ4_NL); se incluye tambien un fichero imatrix (0,1 GB) para generar cuantizaciones propias |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones con matriz de importancia, "i1") |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base OceanLabs/Ocean-1-4B en el material proporcionado. La model card del repositorio cuantizado no describe el tipo de red (transformer denso, MoE, SSM o hibrida), el numero de capas, la dimension oculta ni el mecanismo de atencion. La unica pista estructural es la etiqueta "agent" asociada al modelo y la nomenclatura "Ocean-1", que sugiere una primera generacion de la familia Ocean de OceanLabs.

Tampoco se documentan los datos de entrenamiento: no hay cifras de tokens, composicion del dataset, ni referencias a fases de ajuste como SFT, RLHF o DPO. Respecto a la innovacion tecnica de este repositorio concreto, la aportacion es la cuantizacion con imatrix (importancia por capa), que ajusta la cuantizacion de cada tensor segun su relevancia funcional estimada sobre un corpus de calibracion. El autor indica que las variantes "i1" suelen superar en calidad a las cuantizaciones estaticas de tamano comparable; el repositorio mradermacher/Ocean-1-4B-GGUF contiene las versiones estaticas equivalentes.

## Capacidades

- Generacion de texto en ingles: es la funcion base del modelo, si bien no se detallan capacidades especificas de razonamiento, codigo o matematicas en la informacion disponible.
- Orientacion agentica: el modelo base esta etiquetado con "agent" y "ocean1", lo que sugiere un diseno para flujos de agente y uso de herramientas, aunque no se documentan detalles de tool calling ni de function calling.
- Uso local y sin conexion: al distribuirse en GGUF, permite inferencia en CPU y GPU de consumo sin dependencia de servicios en la nube.
- Multilingue: no disponible; el unico idioma declarado es el ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible, no se mencionan en la documentacion.
- Ajuste de calidad por cuantizacion: la disponibilidad de 24 variantes permite seleccionar el equilibrio entre huella de memoria y fidelidad de pesos.

## Casos de uso

- Despliegue local de un asistente de texto en ingles: el modelo, al estar cuantizado en GGUF, se puede ejecutar con llama.cpp u Ollama en un portatil o equipo de sobremesa, sin coste de API ni envio de datos a terceros.
- Prototipado de agentes en maquina de desarrollo: dado el etiquetado "agent" del modelo base y su tamano reducido, sirve para iterar rapidamente sobre bucles de razonamiento y orquestacion de herramientas antes de escalar a modelos mayores.
- Investigacion sobre cuantizacion: el repositorio incluye el fichero imatrix y multiples variantes, lo que permite comparar empiricamente el efecto de cada tipo de cuantizacion sobre la calidad en una misma tarea.
- Generacion de texto por lotes en CPU: las variantes de menor tamano (IQ1_S, Q2_K, IQ2_XXS) permiten procesar grandes volumenes de texto en servidores sin GPU, donde el coste por token es minimo.
- Chatbots de dominio cerrado en ingles: con licencia Apache 2.0, el modelo se puede integrar en productos comerciales internos y ajustar posteriormente con datos propios.
- Educacion y demostraciones de IA: su tamano y su licencia permisiva lo hacen adecuado para entornos docentes donde se necesita ejecutar un LLM completo en hardware modesto.
- Backend de bajo consumo para edge: en dispositivos con poca VRAM o solo CPU, las cuantizaciones extremas (IQ1, IQ2) permiten mantener un servicio de generacion de texto con requisitos minimos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se han encontrado resultados del modelo base OceanLabs/Ocean-1-4B en la busqueda web realizada.

## Requisitos de hardware

Las cifras de VRAM de esta seccion son estimaciones para un modelo denso de clase 4B, ya que la model card no publica tamanos exactos por cuantizacion (solo se indica que el fichero imatrix ocupa 0,1 GB).

- VRAM estimada por cuantizacion (modelo de clase 4B):
  - IQ1_S / IQ1_M: ~1,1-1,3 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K / Q2_K_S: ~1,4-1,7 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: ~1,8-2,2 GB.
  - IQ4_XS / IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: ~2,3-2,9 GB.
  - Q5_K_S / Q5_K_M: ~2,9-3,3 GB.
  - Q6_K: ~3,4 GB.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM es suficiente para las cuantizaciones Q4 y Q5 (RTX 3060, RTX 4060, RTX 2070, GTX 1660 con 6 GB). Para Q6_K y contextos largos se recomienda 8-12 GB (RTX 3070, RTX 3080, RTX 4070, RTX 4090). GPU de datacenter (A100, H100) no son necesarias salvo para servicio de alta concurrencia.
- Compatibilidad con GPU de consumo: si, el modelo cabe holgadamente en cualquier GPU de consumo moderna, e incluso en las variantes IQ1/IQ2 en tarjetas de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no admiten GGUF de forma nativa, por lo que para esos motores habria que usar los pesos originales del modelo base.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos publicados de rendimiento del modelo base ni de sus alternativas directas, por lo que la comparacion se limita a aspectos de distribucion y licencia. Los siguientes repositorios son cuantizaciones del mismo autor sobre modelos de clase 4B, aunque no se dispone de sus especificaciones completas.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Ocean-1-4B-i1-GGUF | ~4B (no confirmado) | no disponible | apache-2.0 | GGUF (imatrix) | 24 variantes de cuantizacion; este repositorio |
| mradermacher/Ocean-1-4B-GGUF | ~4B (no confirmado) | no disponible | apache-2.0 | GGUF (estatico) | Mismo modelo base, cuantizacion sin imatrix |
| mradermacher/NeoHorse-1-4B-i1-GGUF | no disponible | no disponible | apache-2.0 | GGUF (imatrix) | Etiquetas: agentic, tool-use, coding, reasoning, instruction-following |
| mradermacher/Maestro-4B-i1-GGUF | no disponible | no disponible | no disponible | GGUF (imatrix) | Etiqueta "conversational" |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo, toxicidad o alineacion para el modelo base ni para las cuantizaciones.
- Riesgo de alucinacion: inherente a los LLM de esta escala, especialmente en tareas de razonamiento largo o conocimiento factual; no hay evaluaciones publicadas que lo cuantifiquen.
- Idiomas: el modelo solo declara soporte de ingles. Su uso en castellano u otros idiomas no esta validado y probablemente degrade la calidad.
- Perdida por cuantizacion: las variantes de menor bit (IQ1, IQ2) reducen notablemente la fidelidad de los pesos; el autor recomienda las variantes IQ sobre las no-IQ de tamano similar, pero no se aportan mediciones propias de perplejidad.
- Dato de parametros inconsistente: el campo de safetensors indica 884.952, cifra que no concuerda con la denominacion "4B" del modelo. Conviene verificar el peso real del repositorio antes de dimensionar el despliegue.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero se desconoce si el modelo base impone condiciones adicionales no reflejadas en esta ficha.
- Produccion: al no haber benchmarks ni evaluaciones de robustez, no se recomienda su uso en produccion critica sin una validacion propia sobre el dominio objetivo.
- Tamano del repositorio: el campo de tamano indica 0,0 GB y el modelo registra 0 descargas, senales que apuntan a metadatos incompletos o a un repositorio recien creado (fechas de creacion y actualizacion de 2026-09-27).

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/Ocean-1-4B-i1-GGUF
- Cuantizaciones estaticas del mismo base: https://huggingface.co/mradermacher/Ocean-1-4B-GGUF
- Modelo base: https://huggingface.co/OceanLabs/Ocean-1-4B
- Pagina de resumen de cuantizaciones y descargas: https://hf.tst.eu/model#Ocean-1-4B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Ocean-1-4B-i1-GGUF/resolve/main/Ocean-1-4B.imatrix.gguf
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del autor: https://www.nethype.de/
