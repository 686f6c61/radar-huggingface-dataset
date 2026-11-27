# mradermacher/MiroThinker-4B-SFT-v0.2-GGUF

## Resumen

MiroThinker-4B-SFT-v0.2-GGUF es la versión cuantizada en formato GGUF del modelo MiroThinker-4B-SFT-v0.2, desarrollado originalmente por miromind-ai y empaquetado para inferencia local por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 4.022 millones de parámetros (4B) afinado mediante supervisión (SFT) y orientado a tareas de agente, según indican las etiquetas del repositorio (`agent`, `miromind`, `open-source`). La relevancia de esta ficha radica en que permite ejecutar un modelo de razonamiento agéntico en hardware de consumo gracias a sus cuantizaciones de 1,8 GB a 8,2 GB.

El modelo base es `miromind-ai/MiroThinker-4B-SFT-v0.2`, y esta versión GGUF conserva la licencia Apache 2.0 del original, lo que facilita su uso comercial y su integración en pipelines propios. El repositorio incluye un conjunto amplio de cuantizaciones estáticas (Q2_K hasta Q8_0, además de f16 e IQ4_XS), lo que cubre desde despliegues con muy poca VRAM hasta escenarios donde prima la fidelidad numérica.

La información pública disponible es limitada: la model card del cuantizador se centra en el proceso de cuantización y no detalla arquitectura interna, datos de entrenamiento ni resultados de benchmarks. Por ello, esta ficha marca explícitamente como "no disponible" todo aquello que no puede verificarse en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, no confirmado en la informacion) |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por las etiquetas y el nombre (`SFT-v0.2`) se deduce que el modelo original fue sometido a un ajuste supervisado (supervised fine-tuning) sobre un modelo preentrenado, pero no se especifica la arquitectura concreta (transformer denso, MoE, hibrida, etc.), el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

La contribucion tecnica de este repositorio concreto es la cuantizacion: mradermacher genera cuantizaciones estaticas (no imatrix) en multiples niveles, e indica que las versiones ponderadas con imatrix estan disponibles en un repositorio separado (`MiroThinker-4B-SFT-v0.2-i1-GGUF`). Las cuantizaciones IQ (como IQ4_XS) suelen ofrecer mejor relacion calidad/tamano que las no-IQ de tamano similar, segun la propia model card.

## Capacidades

- Generacion de texto conversacional en ingles (el modelo esta etiquetado como `conversational`).
- Orientacion a tareas de agente: las etiquetas `agent` y `miromind` sugieren un entrenamiento especifico para flujos agénticos, aunque no se detallan las capacidades exactas.
- Razonamiento multi-paso: no confirmado explicitamente en la documentacion disponible.
- Tool calling / function calling: no confirmado en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Prototipado local de agentes: gracias a las cuantizaciones de 2,5-3,0 GB (Q4_K_S, Q4_K_M, Q5_K_M), el modelo puede ejecutarse en portatiles con GPU modesta o incluso en CPU, lo que permite iterar sobre disenos de agentes sin coste de API.
- Automatizacion de tareas de razonamiento en ingles: al estar afinado con SFT y orientado a agentes, puede emplearse en pipelines de resolucion de tareas paso a paso dentro de herramientas internas.
- Despliegue en entornos con restricciones de privacidad: al ser Apache 2.0 y ejecutable en local, encaja en escenarios donde los datos no pueden salir de la infraestructura propia.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes, lo que permite medir el impacto de la cuantizacion en la calidad de las respuestas para un caso de uso concreto antes de fijar una version en produccion.
- Integracion en aplicaciones de chat en ingles: el modelo esta etiquetado como conversacional, por lo que puede servir como base para asistentes de texto en ese idioma.
- Educacion e investigacion: su tamano reducido y su licencia permisiva lo hacen util para experimentos academicos sobre agentes y fine-tuning posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF y overhead de contexto):
  - Q2_K (1,8 GB): ~2,5-3 GB de VRAM.
  - Q4_K_M (2,6 GB): ~3,5-4 GB de VRAM.
  - Q5_K_M (3,0 GB): ~4-4,5 GB de VRAM.
  - Q8_0 (4,4 GB): ~5,5-6 GB de VRAM.
  - f16 (8,2 GB): ~9-10 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para las cuantizaciones Q4/Q5; para f16 se recomienda 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090). En entornos de servidor, A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 6 GB o mas, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para esos motores convendria usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| MiroThinker-4B-SFT-v0.2 (este) | 4B | no disponible | Apache 2.0 | GGUF, safetensors (base) |
| Qwen2.5-3B-Instruct | 3B | 32K (segun documentacion publica del modelo) | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-3B-Instruct | 3B | 128K (segun documentacion publica del modelo) | Llama 3.2 Community License | safetensors, GGUF |
| Phi-3.5-mini-instruct | 3,8B | 128K (segun documentacion publica del modelo) | MIT | safetensors, GGUF |

Nota: los datos de contexto y licencia de los modelos comparativos provienen de su documentacion publica habitual; no se dispone de comparaciones de rendimiento con MiroThinker en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles; su rendimiento en castellano no esta garantizado ni documentado.
- Sesgos conocidos: no documentados en la informacion disponible; como todo modelo entrenado con datos web, es probable que herede sesgos, pero no puede confirmarse sin la model card del modelo base.
- Riesgo de alucinacion: no cuantificado; al no haber benchmarks publicados, no puede estimarse su fiabilidad en tareas factuales.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- Cuantizacion: las versiones de baja precision (Q2_K, Q3_K_S) degradan la calidad; la propia model card advierte que Q3_K_M es de "lower quality". Para produccion se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la model card del modelo base por si hubiera condiciones adicionales no reflejadas en el repositorio GGUF.
- Madurez: el repositorio tiene pocas descargas (145) y un solo like, lo que sugiere poca validacion por parte de la comunidad; no se recomienda para produccion critica sin evaluacion propia.
- El modelo base es una version SFT (v0.2), no una version final; puede contener comportamientos no pulidos propios de un checkpoint intermedio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiroThinker-4B-SFT-v0.2-GGUF
- Modelo base: https://huggingface.co/miromind-ai/MiroThinker-4B-SFT-v0.2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/MiroThinker-4B-SFT-v0.2-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#MiroThinker-4B-SFT-v0.2-GGUF
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
