# mradermacher/MobileWeave-8B-GGUF

## Resumen

MobileWeave-8B-GGUF es la distribucion en formato GGUF del modelo MobileWeave-8B, un modelo de lenguaje de 8.190.735.360 parametros (aproximadamente 8,2 mil millones) especializado en agentes de interfaz grafica (GUI agents) y agentes moviles para Android. El modelo original fue desarrollado por Maxnotmarx y esta construido sobre la arquitectura Qwen3-VL, segun indica la etiqueta `qwen3_vl` de la model card. Esta version GGUF ha sido generada por mradermacher, un conocido creador de cuantizaciones de la comunidad, para facilitar la inferencia local con llama.cpp y herramientas compatibles.

El modelo resuelve el problema de la automatizacion de tareas en dispositivos moviles mediante la interpretacion de capturas de pantalla y la generacion de acciones sobre la interfaz. Su naturaleza multimodal (soporta vision a traves del proyector mmproj) lo hace adecuado para pipelines de agentes que necesitan "ver" la pantalla del telefono y decidir el siguiente paso. El entrenamiento se realizo mediante SFT sobre el dataset `Maxnotmarx/MobileWeave-SFT`.

La relevancia actual radica en que los agentes moviles son una de las areas de mayor crecimiento en IA aplicada, y disponer de una version cuantizada en GGUF permite desplegar el modelo en hardware de consumo, algo imprescindible para desarrolladores que quieren experimentar con agentes Android sin infraestructura de datacenter. El repositorio acumula 637 descargas y fue actualizado por ultima vez el 20 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3-VL (etiqueta `qwen3_vl`) |
| Parametros totales | 8.190.735.360 (8,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; proyector multimodal mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-VL, un transformer multimodal que combina un codificador visual con un modelo de lenguaje, segun la etiqueta `qwen3_vl` de la model card. La componente de vision se distribuye como archivo separado `mmproj` (proyector multimodal), lo que confirma que el modelo procesa imagenes ademas de texto. El modelo base es `Maxnotmarx/MobileWeave-8B`, y esta version es una cuantizacion estatica generada por mradermacher mediante conversion desde formato Hugging Face (`convert_type: hf`).

El entrenamiento se realizo mediante Supervised Fine-Tuning (SFT) sobre el dataset `Maxnotmarx/MobileWeave-SFT`, orientado a tareas de agente GUI y movil (etiquetas `gui-agent`, `mobile-agent`, `android`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. Las cuantizaciones son estaticas; el autor indica que las cuantizaciones ponderadas/imatrix no estan disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto y razonamiento general, heredado de la base Qwen3-VL de 8B parametros.
- Comprension de imagenes (vision) mediante el proyector multimodal mmproj, necesaria para interpretar capturas de pantalla de Android.
- Actuacion como agente GUI: interpretacion de la interfaz y generacion de acciones sobre elementos de pantalla.
- Actuacion como agente movil en Android: automatizacion de tareas multi-paso sobre aplicaciones.
- Soporte de conversaciones multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue detras de APIs compatibles.
- Capacidades multilingues limitadas al ingles (`language: en`).
- No se documenta soporte explicito de tool calling ni function calling en la informacion disponible.

## Casos de uso

- Automatizacion de pruebas de aplicaciones Android: el modelo puede interpretar capturas de pantalla y generar secuencias de acciones para validar flujos de UI, reduciendo la necesidad de escribir scripts de test manuales para cada pantalla.
- Agentes de accesibilidad movil: asistencia a usuarios con dificultades motoras mediante la interpretacion de la pantalla y la ejecucion de acciones guiadas por lenguaje natural, aprovechando la capacidad de vision del modelo.
- RPA movil (automatizacion robotica de procesos): ejecucion de tareas repetitivas en aplicaciones Android (rellenar formularios, navegar menus) en pipelines de negocio, desplegable en hardware de consumo gracias a las cuantizaciones Q4.
- Investigacion en agentes GUI: banco de pruebas para estudiar el comportamiento de agentes multimodales en entornos moviles, con la ventaja de poder ejecutarse localmente en una RTX 4090 o similar.
- Generacion de datasets sinteticos de interaccion movil: el modelo puede generar trayectorias de acciones sobre capturas de pantalla para aumentar datos de entrenamiento de otros agentes.
- Prototipado rapido de asistentes moviles: desarrolladores que quieran integrar un agente Android en una app pueden usar la version Q4_K_M (5,1 GB) en un portatil con GPU de gama media para iterar sin costes de API.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente en GGUF, las capturas de pantalla del dispositivo no salen del entorno del usuario, algo critico en sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~3,4 GB; Q3_K_S ~3,9 GB; Q4_K_S ~4,9 GB; Q4_K_M ~5,1 GB; Q5_K_M ~6,0 GB; Q6_K ~6,8 GB; Q8_0 ~8,8 GB; f16 ~16,5 GB. Añadir ~0,9 GB (mmproj Q8_0) o ~1,3 GB (mmproj f16) si se usa la componente de vision.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones Q4-Q8; A100 o H100 para f16 y despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, las cuantizaciones Q4_K_M y Q4_K_S (recomendadas por el autor como "fast, recommended") caben en GPUs de 8 GB o mas; Q8_0 requiere 12 GB o mas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y servidores compatibles con endpoints. El modelo base en safetensors puede servirse con vLLM o TGI si se dispone del formato original.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| MobileWeave-8B-GGUF | 8,2B | no disponible | si (mmproj) | no disponible | GGUF |
| Qwen3-VL-8B (base) | ~8B | no disponible | si | no disponible | safetensors/GGUF |
| Modelos GUI-agent de 7-8B de la comunidad | ~7-8B | no disponible | variable | variable | variable |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles (`language: en`); su rendimiento en castellano no esta garantizado.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base `Maxnotmarx/MobileWeave-8B` antes de usarlo en produccion.
- Riesgo de alucinacion: como todo modelo de 8B, puede generar acciones incorrectas o inventar elementos de interfaz que no existen en la captura de pantalla, algo especialmente peligroso en automatizacion movil.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre un dataset especifico de SFT, puede heredar sesgos de ese corpus.
- Longitud de contexto no documentada: se desconoce la ventana maxima, lo que limita la planificacion de conversaciones multi-turno largas.
- Naturaleza de agente GUI: la ejecucion de acciones sobre un dispositivo real requiere capas de validacion y sandboxing para evitar efectos no deseados.
- Cuantizaciones estaticas: el autor indica que no hay cuantizaciones ponderadas/imatrix, que suelen ofrecer mejor calidad por tamano; las Q2 y Q3 pueden degradar notablemente el rendimiento.
- Componente multimodal separada: es necesario descargar el archivo mmproj ademas del GGUF del modelo para usar la vision; sin el, el modelo solo procesa texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MobileWeave-8B-GGUF
- Modelo base: https://huggingface.co/Maxnotmarx/MobileWeave-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/Maxnotmarx/MobileWeave-SFT
- Pagina de descargas del autor: https://hf.tst.eu/model#MobileWeave-8B-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
