# Jundot/Qwen3.6-35B-A3B-oQ8e-mtp

## Resumen

Qwen3.6-35B-A3B-oQ8e-mtp es una cuantizacion de precision mixta en formato MLX del modelo Qwen/Qwen3.6-35B-A3B, desarrollado por el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0). El modelo base es un modelo de lenguaje y vision con arquitectura de mezcla de expertos (MoE) que combina 35.951.822.704 parametros totales con aproximadamente 3.000 millones de parametros activos por token, e incorpora una disposicion hibrida de capas Gated DeltaNet y Gated Attention, ademas de un cabezal de prediccion multi-token (MTP) y un codificador de vision.

La relevancia de esta ficha radica en que se trata de un checkpoint cuantizado especificamente para el ecosistema MLX de Apple Silicon, con un promedio efectivo de 8,495 bits por peso en el backbone del lenguaje y 8,590 bits por peso en el checkpoint completo. Esto permite ejecutar un modelo de 35.000 millones de parametros con requisitos de memoria notablemente inferiores a los de una version en BF16, manteniendo una fidelidad alta gracias al esquema de redondeo oQe y a la asignacion de bits por sensibilidad de capa.

El modelo conserva las capacidades multimodales del original (entrada de imagen y texto) y esta publicado bajo licencia Apache-2.0. La model card indica que fue re-cuantizado el 19 de noviembre de 2026 con el redondeo oQe refinado de oMLX 0.8.0, por lo que las copias anteriores deben descargarse de nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrida (Gated DeltaNet + Gated Attention) con codificador de vision y cabezal MTP |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3.000 millones (segun la nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ8e de precision mixta: affine 8-bit grupo 128 (3,727% de los pesos), affine 8-bit grupo 64 (94,945%), BF16 (1,329%) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), cuantizacion oQ |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura de mezcla de expertos con una disposicion hibrida que alterna capas Gated DeltaNet y capas de Gated Attention. Esta combinacion busca reducir el coste computacional del mecanismo de atencion en contextos largos manteniendo la capacidad expresiva. El checkpoint incluye tres componentes diferenciados: el backbone del lenguaje (34.661 millones de pesos logicos, 36,806 GB), el codificador de vision (447 millones, 0,893 GB) y el cabezal de prediccion multi-token (845 millones, 0,905 GB), que habilita decodificacion especulativa o generacion multi-token.

La cuantizacion oQ8e asigna bits por sensibilidad de capa medida, aplica redondeo con matriz de importancia (128 muestras x 512 tokens) y realiza un reajuste por minimos cuadrados ponderados de escala y sesgo. El resultado es de 8,25 bits/peso para el grupo de 128, 8,50 bits/peso para el grupo de 64 y 16 bits/peso para la fraccion en BF16. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento en un modelo de gran tamano con solo 3.000 millones de parametros activos por token.
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias al codificador de vision incluido.
- Decodificacion multi-token mediante el cabezal MTP, orientada a acelerar la generacion.
- Conversacion multi-turno (tag conversational).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint MLX esta disenado para ejecutarse en equipos con chip Apple (M-series) mediante la libreria mlx, aprovechando la memoria unificada para cargar los 35,953 GiB del modelo sin necesidad de GPU dedicada.
- Asistentes multimodales de escritorio: al aceptar imagen y texto, puede integrarse en aplicaciones de analisis de capturas, documentos escaneados o imagenes de interfaz para generar descripciones o respuestas contextuales.
- Prototipado de agentes con decodificacion acelerada: el cabezal MTP permite explorar tecnicas de generacion multi-token en entornos de investigacion sobre eficiencia de inferencia.
- Desarrollo y pruebas offline: la licencia Apache-2.0 y el formato MLX facilitan el uso en entornos sin conectividad o con requisitos de privacidad, manteniendo los datos en el dispositivo.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la degradacion de calidad de oQ8e frente al modelo base en tareas de razonamiento y vision.
- Educacion e investigacion: permite estudiar el comportamiento de una MoE hibrida con Gated DeltaNet en hardware de consumo, sin acceso a clusters de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 35,953 GiB para cargar el checkpoint completo en memoria (38,605 GB en disco).
- El modelo esta pensado para memoria unificada de Apple Silicon; se recomienda un equipo con al menos 48 GB de memoria unificada para dejar margen al runtime y al contexto.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables de forma nativa, ya que el formato es MLX y no CUDA.
- Cabe en GPU de consumo: no en el sentido tradicional; requiere un Mac con memoria unificada suficiente (por ejemplo, M2 Max, M3 Max o M2/M3 Ultra con 64 GB o mas).
- Opciones de despliegue: libreria mlx y el ecosistema oMLX; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Jundot/Qwen3.6-35B-A3B-oQ8e-mtp | 35.951.822.704 | ~3.000 millones | no disponible | Apache-2.0 | safetensors MLX (oQ8e) |
| Qwen/Qwen3.6-35B-A3B (base) | 35.951.822.704 | ~3.000 millones | no disponible | Apache-2.0 | safetensors |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Al ser una cuantizacion de 8 bits, existe una perdida de fidelidad respecto al modelo base en BF16; el autor indica que el redondeo oQe reduce el error, pero no lo elimina.
- El modelo esta ligado al runtime MLX; no es portable directamente a CUDA, vLLM o llama.cpp sin conversion adicional.
- No se dispone de informacion sobre sesgos, idiomas soportados ni tasas de alucinacion del modelo base en la documentacion proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el archivo LICENSE y las condiciones del modelo base Qwen3.6-35B-A3B.
- El modelo tiene solo 1 like y 1.456 descargas, por lo que la validacion comunitaria es limitada; conviene evaluar su calidad en el caso de uso concreto antes de llevarlo a produccion.
- La model card advierte de que las copias anteriores al 19 de noviembre de 2026 deben descargarse de nuevo por el cambio de redondeo.
- No se documentan requisitos de contexto maximo ni el comportamiento en conversaciones de muy largo alcance.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/Qwen3.6-35B-A3B-oQ8e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio oQ / oMLX: https://github.com/jundot/omlx
- Pull request oQe: https://github.com/jundot/omlx/pull/4930
- Pull request redondeo oQe: https://github.com/jundot/omlx/pull/5292
