# mradermacher/Fikra-Model-2-4B-GGUF

## Resumen

Fikra-Model-2-4B es un modelo de lenguaje de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) desarrollado originalmente por Zabibu Technika y distribuido en formato GGUF por mradermacher. Esta disenado con un enfoque claro hacia el despliegue en dispositivo (on-device) y el funcionamiento sin conexion (offline-first), con atencion especial al contexto africano, concretamente a Kenia y al idioma suajili. La model card lo etiqueta como derivado de la familia Qwen3.5, lo que sugiere una arquitectura transformer densa heredada de dicha base.

El modelo resuelve el problema de disponer de un asistente conversacional ligero que pueda ejecutarse localmente en hardware modesto, sin depender de conectividad a Internet ni de infraestructura en la nube. Es relevante ahora porque la demanda de modelos pequenos, multilingues y desplegables en el borde (edge) crece en regiones con conectividad limitada, y porque el ecosistema GGUF permite ejecutarlo con llama.cpp y herramientas derivadas en equipos de consumo.

Este repositorio concreto no contiene los pesos originales, sino cuantizaciones estaticas generadas por mradermacher a partir de `zabibutechnika/Fikra-Model-2-4B`. La licencia Apache 2.0 facilita su uso comercial y su integracion en productos. Los idiomas declarados son ingles y suajili (en, sw).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5, segun la model card) |
| Parametros totales | 4.205.751.296 (aprox. 4,2 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) y suajili (sw) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es `zabibutechnika/Fikra-Model-2-4B` y que la model card lo etiqueta con el tag `qwen3.5`, lo que apunta a una arquitectura transformer densa heredada de la familia Qwen3.5. No se dispone de detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni configuracion exacta del tokenizador en la informacion proporcionada.

Tampoco hay datos publicados sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Las etiquetas `africa`, `kenya`, `swahili`, `on-device` y `offline-first` sugieren un enfasis en datos y casos de uso regionales, pero no se especifica la metodologia de entrenamiento ni innovaciones tecnicas concretas. Este repositorio es una conversion a GGUF con cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) realizada por mradermacher.

## Capacidades

- Generacion de texto conversacional en ingles y suajili.
- Razonamiento y respuesta a instrucciones de caracter general, heredado de la base Qwen3.5.
- Capacidades multilingues limitadas a los idiomas declarados (en, sw); no se confirma soporte de otros idiomas.
- Orientacion a despliegue on-device y funcionamiento offline-first.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional offline en dispositivo: el modelo puede ejecutarse localmente en un movil o mini-PC mediante llama.cpp con cuantizaciones Q4_K_M (2,8 GB), sin necesidad de conexion, adecuado para entornos con conectividad intermitente.
- Atencion al cliente en suajili e ingles: permite gestionar conversaciones multi-turno en ambos idiomas en kioscos o terminales de autoservicio desplegados en Kenia y Africa Oriental.
- Traduccion asistida y mediacion linguistica: util para traduccion informal entre ingles y suajili en aplicaciones educativas o de salud comunitaria, dado el soporte bilingue declarado.
- Procesamiento de texto en el borde para ONGs y administraciones: clasificacion, resumen y extraccion de informacion de documentos en escenarios con recursos de red limitados.
- Prototipado rapido de aplicaciones conversacionales: su tamano (2-4,6 GB en GGUF) permite iterar en portatiles de consumo con GPU modestas o incluso en CPU.
- Educacion y tutoria local: asistente de practica de idiomas o apoyo educativo desplegado en aulas sin infraestructura cloud, gracias a la licencia Apache 2.0 y al bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB (Q2_K), 2,8 GB (Q4_K_M), 3,6 GB (Q6_K) y 4,6 GB (Q8_0), segun los tamanos de fichero publicados; el f16 ocupa 8,5 GB.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) es suficiente para las cuantizaciones Q4-Q8; para f16 se recomienda 10-12 GB (RTX 3080, RTX 4070 Ti).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas para Q4_K_M; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el modelo base original usa transformers. La model card indica compatibilidad con endpoints.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Fikra-Model-2-4B (este) | 4,2 B | no disponible | en, sw | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-3B / Qwen3 (familia base) | ~3-4 B | no disponible | multilingue amplio | Apache 2.0 (segun variante) | safetensors, GGUF |
| Llama 3.2 3B | 3,2 B | 128 K (segun ficha oficial) | multilingue | Llama 3.2 Community License | safetensors, GGUF |
| Gemma 2 2B | 2,6 B | 8 K (segun ficha oficial) | multilingue | Gemma Terms of Use | safetensors, GGUF |

Nota: los datos de los modelos comparativos provienen de sus fichas publicas conocidas; los de Fikra se limitan a lo indicado en la informacion disponible. No se dispone de comparativas de rendimiento (benchmarks) para Fikra, por lo que la comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos; al estar orientado a Kenia y suajili, puede reflejar sesgos de los datos regionales empleados, pero no se documentan.
- Riesgo de alucinacion inherente a modelos de 4 B; no hay evaluaciones publicadas de fidelidad.
- Longitud de contexto no documentada: planificar el despliegue sin asumir ventanas largas hasta confirmarlo con el modelo base.
- Soporte limitado a ingles y suajili; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia y los terminos del modelo base `zabibutechnika/Fikra-Model-2-4B` antes de produccion.
- Este repositorio contiene solo cuantizaciones GGUF; para fine-tuning o uso con transformers hay que acudir al modelo base original.
- El tag `qwen3.5` sugiere herencia de una base Qwen, pero no se detalla la version exacta ni posibles restricciones adicionales de dicha familia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Fikra-Model-2-4B-GGUF
- Modelo base: https://huggingface.co/zabibutechnika/Fikra-Model-2-4B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Fikra-Model-2-4B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Fikra-Model-2-4B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
