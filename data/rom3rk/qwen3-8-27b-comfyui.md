# Rom3rk/Qwen3.8-27B-ComfyUI

## Resumen

Qwen3.8-27B-ComfyUI es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.8-27B, desarrollado por Rom3rk, especializado en la generación, edición, reparación, auditoría y explicación de workflows de ComfyUI en formato JSON de interfaz (frontend/UI). El modelo resuelve el problema de automatizar la creación y mantenimiento de pipelines de generación de imágenes en ComfyUI mediante lenguaje natural, devolviendo JSON cargable directamente en la interfaz. Su relevancia radica en que permite a desarrolladores y artistas generar o corregir grafos de nodos complejos sin intervención manual, integrando capacidades de razonamiento conversacional con conocimiento específico del ecosistema ComfyUI.

El modelo base, Qwen3.8-27B, es un transformer denso de 27.781 millones de parámetros con atención híbrida (lineal en 48 de sus 64 capas), torre de visión integrada y un cabezal de decodificación especulativa MTP (Multi-Token Prediction). Hereda una ventana de contexto nativa de 262.000 tokens, extensible a 1M, y capacidades multimodales. El fine-tune se realizó con Unsloth mediante entrenamiento supervisado (SFT) y se encuentra en fase de refinamiento con aprendizaje por refuerzo (RL). El repositorio no reporta descargas ni validación externa, por lo que su rendimiento en producción aún no está contrastado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido (atencion lineal en 48/64 capas) con torre de vision y MTP (heredado de Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens nativos, extensible a 1M (heredado del base; no confirmado en el fine-tune) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en BF16 safetensors) |
| Idiomas soportados | No disponible (el modelo base es multilingue, pero no se especifica para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un modelo denso de 27.000 millones de parametros con una arquitectura de atencion hibrida: 48 de sus 64 capas usan atencion lineal y las restantes 16 usan atencion completa, lo que reduce el coste computacional en contextos largos. Incluye un codificador de vision (torre de vision) que permite procesar imagenes y video, y un cabezal MTP (Multi-Token Prediction) que actua como borrador para decodificacion especulativa, acelerando la generacion. El contexto nativo es de 262.000 tokens, ampliable a 1M mediante tecnicas de extension.

El fine-tune se realizo con Unsloth mediante entrenamiento supervisado (SFT) sobre un dataset de workflows de ComfyUI en formato JSON de interfaz (UI), no API. El objetivo es que el modelo aprenda a interpretar peticiones en lenguaje natural y genere, modifique o repare grafos de nodos validos para la interfaz de ComfyUI. Segun la model card, el desarrollo se encuentra en fase de refinamiento con aprendizaje por refuerzo (RL), lo que indica que el SFT inicial ya esta completo pero la optimizacion final sigue en curso. No se detalla el tamano del dataset de entrenamiento ni la composicion exacta de los datos.

## Capacidades

- Generacion de workflows de ComfyUI en formato JSON de interfaz a partir de peticiones en lenguaje natural, incluyendo pipelines complejos con multiples ramas (por ejemplo, SDXL image-to-image con ControlNet).
- Edicion de workflows existentes preservando componentes no relacionados, como posiciones de nodos, ajustes de sampler y enlaces existentes.
- Reparacion de workflows invalidos, incompletos o desconectados, corrigiendo enlaces rotos y entradas obligatorias faltantes.
- Auditoria de workflows: deteccion de endpoints invalidos, nodos desconectados, entradas incompatibles, componentes redundantes y conflictos de configuracion.
- Explicacion conversacional del comportamiento de workflows y de las interacciones entre nodos.
- Soporte de modo de pensamiento (thinking mode) heredado de Qwen3.8, activable mediante el parametro `enable_thinking` en el chat template.
- Capacidades multimodales heredadas (comprension de imagenes y video) del modelo base, aunque el fine-tune se centra en tareas textuales sobre JSON.

## Casos de uso

- Generacion automatizada de pipelines de generacion de imagenes: un desarrollador puede pedir "crea un workflow de SDXL image-to-image con una rama de ControlNet de profundidad y un sampler de dos etapas" y obtener el JSON completo listo para cargar en ComfyUI, ahorrando horas de montaje manual de nodos.
- Edicion de workflows en produccion: al anadir una segunda rama de ControlNet a un workflow existente, el modelo modifica el JSON preservando los ajustes de modelo, sampler, posiciones de nodos y enlaces no relacionados, evitando regresiones en configuraciones validadas.
- Reparacion de workflows corruptos o incompatibles: cuando un workflow exportado falla al cargarse en ComfyUI por enlaces rotos o entradas faltantes, el modelo identifica y corrige los errores manteniendo intactos los nodos validos, lo que resulta util en entornos de colaboracion donde varios usuarios editan el mismo grafo.
- Auditoria de calidad antes de despliegue: el modelo revisa workflows completos en busca de nodos desconectados, entradas incompatibles, componentes redundantes o ajustes conflictivos con el pipeline solicitado, actuando como una herramienta de control de calidad para equipos que mantienen bibliotecas de workflows.
- Asistente conversacional integrado en herramientas de desarrollo: el modelo puede responder preguntas sobre el comportamiento de nodos especificos, explicar interacciones entre componentes y sugerir modificaciones, funcionando como documentacion interactiva dentro de un IDE o plugin de ComfyUI.
- Generacion de documentacion tecnica: a partir de un workflow existente, el modelo puede generar una explicacion textual detallada de su estructura, flujo de datos y parametros, util para incorporar en manuales o guias de usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones cuantitativas del fine-tune, ni comparaciones con el modelo base o con otras alternativas de generacion de workflows. El modelo base Qwen3.8-27B reporta resultados en tareas como MathVision, pero no se dispone de datos especificos para este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 55.6 GB, por lo que se necesita al menos 60 GB de VRAM para cargar el modelo completo sin cuantizacion. Con cuantizacion de 8 bits se estima un uso de unos 28 GB, y con 4 bits alrededor de 14-16 GB, aunque el repositorio no proporciona versiones cuantizadas.
- GPU recomendadas: para inferencia sin cuantizar, una A100 de 80 GB o una H100; con cuantizacion de 4 bits podria caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se ha validado oficialmente.
- Opciones de despliegue: el modelo es compatible con transformers (carga directa con `AutoModelForImageTextToText`), y por su arquitectura base deberia funcionar con vLLM, TGI y llama.cpp (si se convierte a GGUF), aunque no hay confirmacion explicita en el repositorio.
- Latencia y throughput: no disponibles. Al ser un modelo de 27B con atencion hibrida, se espera una latencia moderada en generacion de JSON largos (hasta 4096 tokens), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rom3rk/Qwen3.8-27B-ComfyUI | 27.8B | 262K (heredado) | Workflows ComfyUI (UI JSON) | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.8-27B (base) | 27.8B | 262K | Multimodal general | Apache 2.0 | HuggingFace |
| afkaf/Qwen3.8-27B-uncensored-w4a8-convrot-ComfyUI | 27.8B | No especificado | Workflows ComfyUI, cuantizado W4A8 | No especificada | HuggingFace |

La comparativa se limita a variantes del mismo modelo base. No se dispone de otros modelos especializados en generacion de workflows de ComfyUI con caracteristicas comparables. El fine-tune de Rom3rk se diferencia por su enfoque en el formato de interfaz (UI) y por incluir capacidades de auditoria y explicacion, ademas de generacion y edicion. La variante de afkaf esta cuantizada para caber en 24 GB de VRAM, pero no ofrece las mismas funcionalidades de auditoria.

## Limitaciones y advertencias

- El modelo se encuentra en desarrollo activo: el refinamiento con aprendizaje por refuerzo (RL) esta en progreso, por lo que el comportamiento actual puede diferir de la version final.
- No hay datos de benchmarks ni evaluaciones independientes; el repositorio tiene cero descargas y cero likes, lo que indica una validacion externa nula.
- Riesgo de alucinacion en la generacion de JSON: el modelo puede producir workflows sintacticamente validos pero semanticamente incorrectos, con nodos inexistentes o conexiones incompatibles con la version de ComfyUI del usuario.
- La especializacion se limita al formato de workflow de interfaz (UI), no al formato de API. Los usuarios que trabajen con la API de ComfyUI necesitaran convertir el JSON manualmente.
- Dependencia de la version de ComfyUI: los nodos y parametros pueden variar entre versiones, y el modelo no garantiza compatibilidad con versiones futuras o con nodos personalizados de terceros.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tambien esta bajo Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- No se especifican los idiomas soportados; aunque el base es multilingue, el fine-tune podria estar sesgado hacia el ingles, que es el idioma de los ejemplos de la model card.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Rom3rk/Qwen3.8-27B-ComfyUI
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Unsloth (herramienta de fine-tuning): https://unsloth.ai/
- QwenCloud (pagina del modelo base): https://www.qwencloud.com/models/qwen3.8-27b
- vLLM Recipes (especificaciones del base): https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Variante cuantizada para ComfyUI (referencia): https://huggingface.co/afkaf/Qwen3.8-27B-uncensored-w4a8-convrot-ComfyUI
