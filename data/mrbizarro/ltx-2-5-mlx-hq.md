# Mrbizarro/ltx-2.5-mlx-hq

## Resumen

LTX-2.5 MLX HQ es una conversión comunitaria del modelo LTX-2.5 de Lightricks, adaptada para ejecutarse en Apple Silicon mediante el framework MLX. Se trata de un modelo de generación de vídeo multimodal que acepta texto, imagen o audio como entrada y produce vídeo (y audio sincronizado en el caso text-to-audio-video), cubriendo además tareas de image-to-video y audio-to-video. El autor de la conversión es el usuario Mrbizarro, y el modelo base es Lightricks/LTX-2.5.

La relevancia de esta ficha radica en que permite ejecutar localmente, en un Mac con chip de la familia M, un modelo de generación de vídeo que de otro modo requeriría GPUs de datacenter. La conversión está cuantizada a 8 bits y empaquetada en formato MLX, con un tamaño de repositorio de 29,5 GB. El acceso está restringido (gated) y requiere aceptar la licencia comunitaria de LTX-2.x en Hugging Face.

La información pública disponible sobre esta conversión concreta es escasa: no se detallan parámetros totales, longitud de contexto ni composición del dataset de entrenamiento en la información proporcionada. Los datos técnicos del modelo base LTX-2.5 deben consultarse en su repositorio original de Lightricks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LTX-2.5 de Lightricks; conversión MLX) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (según tags: "8-bit") |
| Idiomas soportados | inglés (en) |
| Licencia | ltx-2.x-community-license-agreement (acceso gated) |
| Formato de pesos | MLX (librería mlx); tamaño del repo 29,5 GB |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del modelo base LTX-2.5 (tipo de transformer, mecanismo de atención, componentes de difusión o flow matching, etc.). La conversión aquí descrita es una adaptación a MLX con cuantización a 8 bits, orientada a inferencia local en Apple Silicon, e incluye soporte de LoRA según los tags del repositorio.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Toda esta información debe consultarse en la documentación oficial del modelo base Lightricks/LTX-2.5.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Generación de vídeo a partir de audio (audio-to-video).
- Generación conjunta de audio y vídeo desde texto (text-to-audio-video).
- Generación de audio a partir de texto (text-to-audio, según tags).
- Soporte de LoRA para ajuste fino o estilización.
- Ejecución local y offline en Apple Silicon mediante MLX.
- Idioma de prompting: inglés.

## Casos de uso

- Prototipado de vídeo generativo en local: un desarrollador con un Mac de gama alta puede generar clips de prueba sin depender de APIs en la nube, gracias a la conversión MLX y la cuantización a 8 bits que reduce el peso a 29,5 GB.
- Iteración creativa con LoRA: al soportar LoRA, se pueden entrenar o aplicar adaptadores para estilos visuales concretos y probarlos directamente en el equipo local.
- Generación de vídeo a partir de storyboards: usar image-to-video para animar bocetos o imágenes fijas en flujos de preproducción audiovisual.
- Doblaje y sincronización audiovisual: con audio-to-video se puede generar vídeo condicionado por una pista de audio, útil para prototipos de contenido hablado.
- Creación de clips con audio integrado: text-to-audio-video permite obtener una pieza audiovisual completa desde un prompt, útil para demos y contenido de redes.
- Investigación en generación multimodal: entorno local y offline para experimentar con modelos de vídeo sin costes de API ni envío de datos a terceros.
- Evaluación de modelos en hardware Apple: útil para medir viabilidad de pipelines de vídeo generativo en estaciones de trabajo Mac antes de escalar a GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa 29,5 GB en cuantización de 8 bits; se recomienda un Mac con al menos 32 GB de memoria unificada y preferiblemente 64 GB para margen de trabajo.
- GPU recomendadas: chips Apple Silicon de gama alta (M1/M2/M3/M4 Pro, Max o Ultra). No aplica a GPUs NVIDIA/AMD por el uso de MLX.
- ¿Cabe en consumer GPU? No en el sentido tradicional; está diseñado para memoria unificada de Apple Silicon, no para VRAM discreta.
- Opciones de despliegue: framework MLX (librería declarada); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|
| LTX-2.5 MLX HQ (esta ficha) | Conversión MLX 8-bit de LTX-2.5 | repo 29,5 GB | ltx-2.x-community-license-agreement | gated en HF |
| Lightricks/LTX-2.5 (base) | Modelo original de generación de vídeo | no disponible | ltx-2.x-community-license-agreement | HF (Lightricks) |
| Otras conversiones MLX de vídeo | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar la licencia comunitaria en Hugging Face antes de descargar.
- Licencia "other" (ltx-2.x-community-license-agreement): revisar condiciones antes de uso comercial; puede imponer restricciones.
- Solo inglés como idioma soportado, lo que limita prompts en castellano.
- Conversión comunitaria no oficial: puede presentar diferencias de calidad frente al modelo base original.
- Cuantización a 8 bits: posible pérdida de fidelidad frente a pesos en precisión completa.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en esta conversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación mínimo.
- Riesgo de alucinaciones visuales y artefactos propios de modelos generativos de vídeo.
- Requiere hardware Apple Silicon; no es portable a GPUs convencionales sin reconversión.

## Enlaces

- Hugging Face: https://huggingface.co/Mrbizarro/ltx-2.5-mlx-hq
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
