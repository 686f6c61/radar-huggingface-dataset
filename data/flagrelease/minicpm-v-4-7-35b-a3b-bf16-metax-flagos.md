# FlagRelease/MiniCPM-V-4.7-35B-A3B-BF16-metax-FlagOS

## Resumen

MiniCPM-V-4.7-35B-A3B es un modelo multimodal de gran escala desarrollado por ModelBest en colaboracion con OpenBMB, publicado en su variante adaptada por la comunidad FlagRelease para la pila de software FlagOS sobre aceleradores MetaX. Se trata de un modelo de mezcla de expertos (MoE) con 35.212.875.824 parametros totales y aproximadamente 3.000 millones de parametros activos por token, disenado para operar tanto en centros de datos como en dispositivos de borde. La version aqui descrita corresponde a los pesos en BF16 adaptados a MetaX mediante FlagOS, con soporte de inferencia a traves de vLLM con el plugin `vllm-plugin-fl`.

El modelo resuelve el problema de desplegar comprension multimodal de alta capacidad en hardware heterogeneo, incluyendo plataformas ARM de borde y aceleradores no NVIDIA. Incorpora tecnicas como la compresion temprana de tokens visuales dentro del codificador ViT, compresion de tokens visuales 4x/16x, decodificacion especulativa DSpark y el mecanismo Lookahead Expert Scheduling (LES), que precarga expertos y solapa computo con lectura para reducir la latencia en dispositivo. Segun la model card, alcanza mas de 13 tokens por segundo en un iPhone 17 Pro Max con el esquema de optimizacion de borde.

Es relevante ahora porque representa, segun sus autores, el primer modelo multimodal MoE abierto capaz de ejecutarse de forma fluida y sin perdida apreciable en dispositivo, y porque su publicacion incluye adaptacion dia-cero a 12 plataformas de chips bajo una pila unificada. La licencia Apache 2.0 facilita su adopcion comercial, aunque los idiomas declarados son unicamente chino e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE (familia MiniCPM-V 4.7), con codificador ViT y compresion de tokens visuales |
| Parametros totales | 35.212.875.824 |
| Parametros activos | Aproximadamente 3.000 millones (MoE, 35B-A3B) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de servicio vLLM; no se documenta un maximo oficial distinto) |
| Tipos de cuantizacion | BF16 en esta publicacion; no se detallan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal con mezcla de expertos: 35.212.875.824 parametros totales de los que se activan aproximadamente 3.000 millones por token, lo que reduce el coste computacional por inferencia manteniendo la capacidad del modelo completo. El componente visual emplea un codificador ViT con compresion temprana de tokens dentro del propio ViT y compresion de tokens visuales de 4x y 16x, lo que disminuye la longitud efectiva de la secuencia visual y equilibra detalle y eficiencia. La decodificacion especulativa DSpark se usa para acelerar la generacion, y el mecanismo Lookahead Expert Scheduling (LES) precarga expertos y solapa la lectura de pesos con el computo, orientado a latencia en dispositivo.

No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset ni detalles sobre etapas de RLHF o DPO. La model card menciona evaluaciones en modo Instruct, lo que sugiere un ajuste de instrucciones, pero sin especificar metodologia. La publicacion de FlagRelease se centra en la adaptacion de los pesos a MetaX mediante FlagOS, que integra FlagScale, FlagGems (biblioteca de operadores), FlagCX (comunicacion) y FlagTree (compilador unificado), permitiendo un flujo "desarrollar una vez, ejecutar en cualquier sitio" sobre aceleradores heterogeneos.

## Capacidades

- Comprension y generacion de texto en chino e ingles.
- Comprension de imagenes (vision) integrada en el mismo modelo, con compresion de tokens visuales para eficiencia.
- Razonamiento matematico y cientifico de nivel avanzado, reflejado en los benchmarks Math_500 y GPQA_Diamond.
- Razonamiento multimodal sobre preguntas visuales (evaluado con ERQA).
- Generacion en modo Instruct orientada a seguir instrucciones del usuario.
- Decodificacion especulativa DSpark para acelerar la generacion.
- Inferencia eficiente en dispositivo mediante Lookahead Expert Scheduling.
- Despliegue servido mediante API compatible con OpenAI (`/v1/chat/completions`) a traves de vLLM.
- Soporte de integracion con clientes de terceros como AnythingLLM.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes multi-paso ni audio.

## Casos de uso

- Asistente multimodal en dispositivo movil: el modelo puede procesar imagenes y texto en un telefono de gama alta; con LES y DSpark alcanza mas de 13 tokens por segundo en un iPhone 17 Pro Max, lo que permite respuestas interactivas sin depender de la nube.
- Analisis de documentos con imagenes en el borde: gracias a la compresion de tokens visuales 4x/16x y a los aproximadamente 3.000 millones de parametros activos, puede extraer informacion de capturas, formularios o diagramas en equipos con recursos limitados.
- Servicio de inferencia en centro de datos sobre MetaX: el contenedor FlagOS-Metax y la configuracion vLLM con tensor-parallel-size 2 permiten desplegar el modelo en minutos sobre aceleradores MetaX con API compatible con OpenAI.
- Razonamiento cientifico asistido: con resultados de 95,60 en Math_500 y 80,80 en GPQA_Diamond en la variante MetaX, es adecuado para tutoria o verificacion de razonamiento matematico y de posgrado en ingles y chino.
- Atencion al cliente con soporte visual: la ventana de 32.768 tokens configurada permite conversaciones multi-turno con historial e imagenes adjuntas, integrable en AnythingLLM como frontend.
- Evaluacion comparativa de pilas de software: al publicarse pesos equivalentes para NVIDIA y MetaX, sirve para validar la consistencia de resultados entre stacks nativos y FlagOS en tareas como ERQA y GPQA.
- Procesamiento por lotes de imagenes en pipelines de datos: la compresion visual y el MoE reducen el coste por muestra en tareas de descripcion, clasificacion o extraccion de informacion de imagenes.

## Benchmarks y rendimiento

Resultados publicados en la model card para la variante de 35B-A3B:

| Metrica | MiniCPM-V-4.7-35B-A3B (NVIDIA, original) | MiniCPM-V-4.7-35B-A3B (MetaX, FlagOS) |
|---|---|---|
| Math_500 | 94,80 | 95,60 |
| GPQA_Diamond | 81,31 | 80,80 |
| ERQA | 52,26 | 49,75 |

La model card afirma ademas que, en evaluaciones oficiales en modo Instruct, los modelos 35B-A3B y 1B obtuvieron puntuaciones globales superiores a Qwen3.6-35B-A3B y Qwen3.5-0.8B respectivamente, con menor tiempo de inferencia. No se proporcionan en la informacion disponible las cifras detalladas de esa comparacion ni resultados de MMLU o HumanEval.

## Requisitos de hardware

- Pesos en BF16 con un tamano de repositorio de 70,4 GB, por lo que la inferencia en precision completa requiere al menos esa cantidad de memoria de acelerador, mas margen para cache KV y activaciones.
- La configuracion de referencia usa `--tensor-parallel-size 2` sobre dos dispositivos MetaX con `--gpu-memory-utilization 0.9` y `--shm-size 512g`, lo que indica un despliegue multi-GPU en centro de datos.
- No se documenta en la informacion disponible el soporte en GPU de consumo (RTX 4090 u otras) ni cifras de VRAM para cuantizaciones de 4 u 8 bits.
- Opciones de despliegue documentadas: vLLM con `vllm-plugin-fl` sobre FlagOS-Metax, mediante la imagen Docker `harbor.baai.ac.cn/flagrelease-public/minicpm-v-4.7-35b-a3b-metax001-...`. No se detallan en la informacion disponible recetas para llama.cpp, Ollama o TGI.
- Rendimiento en dispositivo: mas de 13 tokens por segundo en iPhone 17 Pro Max con el esquema de optimizacion de borde segun la model card.
- Throughput y latencia en centro de datos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B | 35,2B | ~3B | 32.768 (config. de servicio) | Apache 2.0 | Multimodal MoE; Math_500 95,60 y GPQA_Diamond 80,80 en MetaX |
| Qwen3.6-35B-A3B | No disponible | No disponible | No disponible | No disponible | Citado en la model card como referencia superada en puntuacion global en modo Instruct |
| MiniCPM-V-4.7-1B | No disponible | No disponible | No disponible | Apache 2.0 | Variante densa pequena de la misma familia, orientada a dispositivo; supera a Qwen3.5-0.8B segun la model card |
| Qwen3.5-0.8B | No disponible | No disponible | No disponible | No disponible | Citado como referencia de la variante de 1B |

Los datos de los modelos comparables no se detallan en la informacion proporcionada mas alla de las afirmaciones cualitativas de la model card.

## Limitaciones y advertencias

- Idiomas limitados a chino e ingles; no se declara soporte de castellano ni de otras lenguas, por lo que el rendimiento fuera de esos idiomas es incierto.
- Riesgo de alucinacion inherente a los modelos generativos, sin datos publicados sobre tasas de error factual en la informacion disponible.
- No se documentan sesgos conocidos ni evaluaciones de seguridad o alineacion.
- La ventana de contexto de 32.768 tokens corresponde a la configuracion de servicio de ejemplo; no se confirma un maximo oficial superior.
- Requiere `trust_remote_code` y `custom_code`, lo que implica ejecutar codigo del repositorio y anade superficie de riesgo en produccion.
- El despliegue documentado esta atado a la pila FlagOS y a aceleradores MetaX; el soporte en otras plataformas no se detalla en esta publicacion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de adopcion ni validacion independiente.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias de dependencias y del codigo personalizado incluido.
- El ejemplo de Docker contiene una errata (`docker exex`) que debe corregirse a `docker exec`.

## Enlaces

- HuggingFace: https://huggingface.co/FlagRelease/MiniCPM-V-4.7-35B-A3B-BF16-metax-FlagOS
- AnythingLLM: https://anythingllm.com/
- FlagOS (pila de software, referencia en la model card): no se proporciona URL directa en la informacion disponible
- Paper, blog o repositorio de MiniCPM-V 4.7: no disponibles en la informacion proporcionada
