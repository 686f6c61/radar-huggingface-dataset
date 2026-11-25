# mradermacher/Heliactis-2-3.7B-GGUF

## Resumen

Heliactis-2-3.7B es un modelo de lenguaje conversacional desarrollado por ApollonLabs, distribuido originalmente en formato Transformers y cuantizado a GGUF por mradermacher. El modelo se presenta como una variante afinada mediante LoRA sobre una base no especificada en la informacion disponible, con enfasis en el idioma griego (etiqueta `greek`) y capacidades bilingues griego-ingles. La ficha corresponde especificamente al repositorio de cuantizaciones GGUF, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El modelo declara 5.058.255.360 parametros totales segun los pesos en safetensors, aunque su denominacion comercial lo situa en la categoria de 3.7B. Esta discrepancia puede deberse a la inclusion de capas adicionales, embeddings o componentes auxiliares en el recuento. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para integraciones en producto.

La relevancia actual de este modelo radica en su especializacion en griego, un idioma con cobertura limitada en la mayoria de modelos abiertos, combinada con una huella de memoria reducida (desde 2.2 GB en Q2_K) que permite ejecucion en hardware de consumo. El repositorio GGUF ofrece cuatro cuantizaciones estaticas, aunque no incluye variantes con imatrix o ponderadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 5.058.255.360 (segun safetensors); denominacion comercial 3.7B |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q4_K_S, Q8_0, f16 |
| Idiomas soportados | griego (el), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en Transformers/safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. La etiqueta `lora-merged` indica que el modelo base fue afinado mediante LoRA y posteriormente fusionado, lo que sugiere un proceso de ajuste supervisado o instruccional sobre una base preentrenada. La etiqueta `k2-horizon` aparece en los metadatos sin explicacion adicional, y podria referirse a una configuracion de entrenamiento o a un proyecto interno de ApollonLabs.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El proceso de cuantizacion realizado por mradermacher es estatico (sin imatrix), con version de cuantizacion 2 y cuantizacion de tensores de salida activada.

## Capacidades

- Generacion de texto conversacional en griego e ingles, segun los idiomas declarados.
- Capacidad de mantener dialogos multi-turno (etiqueta `conversational`).
- Afinado mediante LoRA fusionado, orientado a tareas de instruccion.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su integracion en servicios de inferencia.
- No se documentan capacidades de vision, audio, tool calling, agentes ni modo de razonamiento explicito.
- No se especifica soporte de function calling ni de razonamiento multi-paso.

## Casos de uso

- Atencion al cliente en griego: el modelo puede gestionar conversaciones multi-turno en griego, un idioma con poca cobertura en modelos abiertos, adecuado para negocios que operen en Grecia o Chipre.
- Traduccion griego-ingles: dado su entrenamiento bilingue, puede emplearse para traduccion asistida en entornos con recursos limitados, aunque sin garantias de calidad sin benchmarks.
- Asistentes conversacionales embebidos: con cuantizacion Q4_K_S (3.1 GB), puede desplegarse en dispositivos con GPU de consumo para asistentes locales en griego.
- Prototipado rapido en investigacion: su tamano reducido y licencia Apache 2.0 permiten experimentar con fine-tuning y evaluacion sin costes de licencia.
- Generacion de contenido en griego: redaccion de textos, resumenes o respuestas en griego para aplicaciones editoriales o educativas.
- Despliegue en entornos con restricciones de memoria: la cuantizacion Q2_K (2.2 GB) permite ejecucion en CPU o GPUs con poca VRAM para tareas de baja latencia no critica.
- Integracion en pipelines de CI/CD para pruebas de modelos: su formato GGUF y compatibilidad con llama.cpp facilitan tests automatizados de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2.5-3 GB en Q2_K, 3.5-4 GB en Q4_K_S, 6-7 GB en Q8_0 y 11-12 GB en f16 (incluyendo overhead de contexto y runtime).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para f16; A100 o H100 no son necesarias dado el tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas para Q4_K_S; en CPU tambien es viable con Q2_K.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion de GGUF), LM Studio, y servidores compatibles con endpoints GGUF. Para el formato original Transformers, vLLM o TGI si se dispone de los pesos safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Heliactis-2-3.7B | 5.06B (nominal 3.7B) | no disponible | el, en | Apache 2.0 | GGUF, safetensors |
| Llama 3.2 3B | 3.2B | 128K | multilingue | Llama 3.2 Community | GGUF, safetensors |
| Qwen2.5 3B | 3.1B | 32K | multilingue (incl. griego limitado) | Apache 2.0 | GGUF, safetensors |
| Gemma 2 2B | 2.6B | 8K | multilingue | Gemma Terms | GGUF, safetensors |

La comparativa es orientativa: no se dispone de benchmarks de Heliactis-2-3.7B para contrastar rendimiento real frente a estas alternativas. Su ventaja principal es la especializacion en griego y la licencia Apache 2.0, mientras que Llama 3.2 y Qwen2.5 ofrecen contextos mas largos y cobertura multilingue mas amplia.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinacion; se desconoce su comportamiento en dominios sensibles.
- El riesgo de alucinacion es inherente a modelos de este tamano y no ha sido cuantificado.
- La longitud de contexto no esta documentada, lo que impide planificar su uso en tareas de contexto largo.
- Cobertura limitada a griego e ingles; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Las cuantizaciones son estaticas (sin imatrix), por lo que las variantes de baja precision (Q2_K) pueden degradar la calidad mas que cuantizaciones ponderadas equivalentes.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base original (ApollonLabs/Heliactis-2-3.7B) deberia verificarse por si tuviera terminos adicionales no reflejados en esta ficha.
- El recuento de parametros (5.06B) difiere de la denominacion comercial (3.7B); conviene validar el consumo real de memoria antes de desplegar en produccion.
- No hay informacion sobre tool calling ni soporte de agentes, por lo que no es adecuado para pipelines que requieran function calling sin validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Heliactis-2-3.7B-GGUF
- Modelo base: https://huggingface.co/ApollonLabs/Heliactis-2-3.7B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Heliactis-2-3.7B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
