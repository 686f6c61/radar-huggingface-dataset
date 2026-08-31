# rockerBOO/qwen3-vl-8b-thinking-heretic-nvfp4-convrot-int8

## Resumen

Qwen3-VL-8B-Thinking-heretic-1refusal — NVFP4 + ConvRot INT8 es una cuantizacion del modelo multimodal Qwen3-VL-8B-Thinking en su variante "heretic" (desensurada mediante la tecnica de ablacion de rechazos). El checkpoint original BF16, desarrollado por Kizzington como derivado del modelo oficial de Alibaba Cloud, pesaba aproximadamente 18 GB; esta version cuantizada reduce el decodificador de texto a 8,2 GB combinando dos esquemas de cuantizacion: NVFP4 para las capas MLP y ConvRot INT8 para las proyecciones de atencion, manteniendo la torre de vision y los embeddings en BF16.

El resultado es un modelo multimodal (imagen-texto) de 8.000 millones de parametros con modo de razonamiento ("thinking") que cabe en tarjetas graficas de consumo de la serie RTX 50, siempre que estas sean de arquitectura Blackwell. El autor ha verificado la carga y generacion tanto en modo normal como en modo thinking mediante ComfyUI en una RTX 5070 Ti, lo que lo convierte en una opcion practica para flujos de trabajo locales de generacion asistida por vision sin necesidad de hardware de centro de datos.

La relevancia de este modelo radica en que combina tres caracteristicas poco habituales: capacidades de vision-lenguaje de ultima generacion, un proceso de desensurado que elimina los rechazos tipicos de los modelos alineados, y una cuantizacion agresiva que reduce los requisitos de memoria a la mitad sin tocar la torre de vision ni los bloques estructuralmente sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), variante Qwen3-VL-8B con modo thinking |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | no aplicable (arquitectura densa, no MoE) |
| Longitud de contexto | 32.000 tokens (heredado del modelo base Qwen3-VL-8B) |
| Tipos de cuantizacion | NVFP4 (MLP), ConvRot INT8 (atencion), BF16 (vision, embeddings, lm_head, bloques primero y ultimo) |
| Idiomas soportados | no disponible (el modelo base Qwen3-VL soporta multiples idiomas, incluido espanol) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un unico archivo de 8,2 GB) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen/Qwen3-VL-8B-Thinking, un transformer multimodal denso que combina una torre de vision (ViT con patch embed, bloques ViT y mecanismo de fusion DeepStack) con un decodificador de lenguaje de 8B parametros. Sobre este checkpoint, el autor Kizzington aplico la tecnica Heretic, que consiste en la ablacion de las direcciones de rechazo aprendidas durante el alineamiento, eliminando asi las respuestas de negativa tipicas de los modelos censurados. El resultado es un modelo "decensored" que mantiene las capacidades tecnicas del original sin los filtros de seguridad.

La cuantizacion fue realizada con la herramienta convert_to_quant (ctq) de silveroxides, aplicando una estrategia por capas: las proyecciones MLP (gate, up, down) de los 34 bloques centrales del decodificador se cuantizaron a NVFP4 (formato de punto flotante de 4 bits de NVIDIA), mientras que las proyecciones de atencion (q, k, v, o) de esos mismos bloques se cuantizaron a INT8 con rotacion de pesos ConvRot. Los bloques primero y ultimo del decodificador, la torre de vision completa, los embeddings, lm_head y la capa de normalizacion se mantienen en BF16 por su sensibilidad estructural. La distribucion verificada en los metadatos de cuantizacion es de 102 capas NVFP4 y 136 capas INT8.

No se ha realizado una evaluacion formal de calidad comparada con el checkpoint BF16 original; el autor solo ha verificado la coherencia de la generacion con una pregunta factual y un problema matematico en modo thinking.

## Capacidades

- Generacion de texto y comprension de imagenes: puede responder preguntas sobre contenido visual, describir escenas, transcribir texto en imagenes y razonar sobre elementos espaciales.
- Modo thinking: activable para problemas complejos, genera una cadena de razonamiento interna antes de dar la respuesta final.
- Razonamiento multimodal: combina informacion visual y textual para tareas que requieren ambas modalidades.
- Capacidades de agente: heredadas del modelo base Qwen3-VL, incluye soporte para interacciones con herramientas y APIs.
- Generacion de codigo: el modelo base Qwen3-VL-8B tiene capacidades de programacion, aunque esta cuantizacion no ha sido evaluada formalmente en este aspecto.
- Multilingue: el modelo base soporta decenas de idiomas, incluidos espanol, ingles, chino, frances, aleman y japones.
- Sin censura: gracias al proceso Heretic, el modelo no rechaza peticiones sobre temas sensibles o controvertidos, aunque esto implica un mayor riesgo de generar contenido inapropiado.

## Casos de uso

- Asistencia visual para personas con discapacidad: el modelo puede describir el entorno a partir de fotografias en tiempo real, con la ventaja de que al estar desensurado no filtrara descripciones de escenas que otros modelos considerarian sensibles.
- Analisis de documentos escaneados: combinando OCR visual con razonamiento textual, puede extraer y resumir informacion de facturas, contratos o formularios, con el modo thinking para tareas que requieren calculos o inferencias.
- Moderacion de contenido automatizada: al no tener filtros de seguridad, puede clasificar contenido explicito o violento sin rechazar la peticion, lo que es util para plataformas que necesitan identificar este tipo de material.
- Generacion de contenido creativo a partir de imagenes: escritura de relatos, guiones o descripciones literarias basadas en fotografias, sin las restricciones tipicas de los modelos alineados.
- Automatizacion de flujos de trabajo en ComfyUI: el autor ha verificado su funcionamiento con los nodos CLIPLoader y TextGenerate, por lo que puede integrarse en pipelines de generacion de imagenes con prompts derivados de analisis visual.
- Educacion e investigacion sobre alineamiento: al ser una version abliterada, permite estudiar como afecta la eliminacion de rechazos a las capacidades del modelo y comparar su comportamiento con la version alineada original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la informacion disponible. El autor indica explicitamente que la calidad no ha sido evaluada mas alla de comprobar la coherencia de dos generaciones de prueba (una pregunta factual y un problema matematico en modo thinking), ambas correctas. No hay datos de perplejidad, MMLU, HumanEval ni otras metricas estandar comparadas contra el checkpoint BF16 original.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa 8,2 GB, por lo que se necesitan al menos 12 GB de VRAM para cargar el modelo con margen para el contexto y las activaciones. Una RTX 4070 Ti Super (16 GB) o superior seria adecuada.
- GPU obligatoria: arquitectura Blackwell (SM 10.0 o superior) por la parte NVFP4. Esto incluye las RTX 5090, 5080, 5070 Ti y 5070 de NVIDIA, asi como los aceleradores B200/B100 de centro de datos. No funciona en GPUs Ampere, Ada Lovelace ni anteriores.
- Compatibilidad verificada: el autor confirma carga y generacion en una RTX 5070 Ti (16 GB) usando ComfyUI con los nodos CLIPLoader (type: krea2) y TextGenerate.
- Opciones de despliegue: ComfyUI es la unica via verificada. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y es probable que estas herramientas no soporten NVFP4.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni tiempos de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Thinking (original) | 8B | 32K | BF16 | Apache 2.0 | HuggingFace oficial |
| Kizzington/Qwen3-VL-8B-Thinking-heretic-1refusal | 8B | 32K | BF16 | Apache 2.0 | HuggingFace |
| rockerBOO/qwen3-vl-8b-thinking-heretic-nvfp4-convrot-int8 | 8B | 32K | NVFP4 + INT8 | Apache 2.0 | HuggingFace (este modelo) |
| ZuzeTt/Qwen3-VL-8B-Thinking-heretic | 8B | 32K | no disponible | no disponible | HuggingFace |

La diferencia principal frente al checkpoint BF16 es el tamano: 8,2 GB frente a aproximadamente 18 GB, lo que permite ejecutarlo en GPUs de consumo Blackwell con 16 GB de VRAM. Frente a otras variantes heretic como la de ZuzeTt, esta version ofrece una cuantizacion mas agresiva y verificada en ComfyUI, aunque con el requisito hardware de Blackwell.

## Limitaciones y advertencias

- Requisito hardware restrictivo: NVFP4 solo funciona en GPUs Blackwell, lo que excluye a la mayoria de las tarjetas actuales en produccion (A100, H100, RTX 4090, etc.).
- Sin evaluacion formal de calidad: no hay benchmarks ni comparacion de perplejidad contra el modelo original. El rendimiento real en tareas complejas es desconocido.
- Modelo desensurado: al eliminar los rechazos, el modelo puede generar contenido explicito, violento, ilegal o danino sin filtro alguno. No es adecuado para aplicaciones dirigidas al publico general sin una capa de moderacion externa.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede inventar informacion, especialmente en tareas visuales donde la imagen no es visible para el usuario final.
- Compatibilidad limitada: solo se ha verificado en ComfyUI. No hay soporte confirmado para frameworks de inferencia estandar como vLLM o TGI, lo que limita su uso en produccion.
- Sin informacion sobre el dataset de entrenamiento: no se especifican los datos usados para el proceso Heretic ni si se realizo fine-tuning adicional sobre el modelo base.
- Idiomas no documentados: aunque el modelo base soporta multiples idiomas, esta version no documenta oficialmente que idiomas mantiene tras la cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rockerBOO/qwen3-vl-8b-thinking-heretic-nvfp4-convrot-int8
- Checkpoint fuente (Kizzington): https://huggingface.co/Kizzington/Qwen3-VL-8B-Thinking-heretic-1refusal
- Modelo base oficial (Qwen): https://huggingface.co/Qwen/Qwen3-VL-8B-Thinking
- Repositorio oficial Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Herramienta de cuantizacion convert_to_quant: https://github.com/silveroxides/convert_to_quant
- Script de configuracion de capas: https://github.com/rockerboo/quant-tooling/blob/main/build_qwen3vl_layer_config.py
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Guia de integracion en ComfyUI (Civitai): https://civitai.com/models/2200639/qwen-3-vl-node-for-comfyui-qwen-3-vl-heretic-uncensored-model
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
